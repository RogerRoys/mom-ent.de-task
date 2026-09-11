/* MOMent — Geschenknachricht (gift note) on the product page.

   Two jobs:

   1. The widget itself (toggle, reveal, character counter). Listeners are
      delegated from `document`, so the widget survives Shopify re-rendering
      the product form (variant change, quick add modal).

   2. Keeping the cart honest. Shopify stores line item properties on the line,
      so a line added with a gift note keeps it forever — adding the same
      product again with the toggle off just creates a *second* line next to the
      old one, and the customer still sees the note in the cart. So whenever the
      toggle or the message changes, every cart line of this product is rewritten
      to match. Lines that end up identical are merged by Shopify automatically.
*/
(function () {
  'use strict';

  var ROUTES = window.routes || {};
  var CART_URL = (ROUTES.cart_url || '/cart') + '.js';
  var CHANGE_URL = (ROUTES.cart_change_url || '/cart/change') + '.js';

  var timers = new WeakMap();
  var busy = new WeakMap();

  /* ---------------------------------------------------------------- widget */

  function root(el) {
    return el && el.closest ? el.closest('[data-gift-note]') : null;
  }

  function parts(node) {
    return {
      toggle: node.querySelector('[data-gift-toggle]'),
      panel: node.querySelector('[data-gift-panel]'),
      area: node.querySelector('[data-gift-textarea]'),
      label: node.querySelector('[data-gift-count]')
    };
  }

  function sync(node) {
    if (!node) return;

    var el = parts(node);
    if (!el.toggle || !el.panel || !el.area) return;

    var on = el.toggle.checked;
    el.panel.hidden = !on;
    // Disabled fields are not submitted, so an empty line item property is
    // never attached when the customer leaves the toggle off.
    el.area.disabled = !on;
    count(node);
  }

  function count(node) {
    var el = parts(node);
    if (!el.area || !el.label) return;

    var limit = parseInt(el.area.getAttribute('maxlength'), 10) || 0;
    el.label.textContent = el.area.value.length + ' / ' + limit;
  }

  /* ------------------------------------------------------------ cart sync */

  function names(node) {
    return {
      flag: node.dataset.giftPropFlag,
      value: node.dataset.giftPropValue,
      message: node.dataset.giftPropMessage
    };
  }

  // The properties this product's cart lines should carry right now.
  function wanted(node) {
    var el = parts(node);
    var key = names(node);
    var out = {};

    if (!el.toggle || !el.toggle.checked) return out;

    out[key.flag] = key.value;
    var text = (el.area.value || '').trim();
    // Shopify drops blank properties on add, so mirror that here.
    if (text) out[key.message] = text;
    return out;
  }

  function upToDate(item, want, node) {
    var key = names(node);
    var has = item.properties || {};
    return (has[key.flag] || '') === (want[key.flag] || '') &&
      (has[key.message] || '') === (want[key.message] || '');
  }

  // Keep every other property on the line (bundle apps, subscriptions, …).
  function rewrite(item, want, node) {
    var key = names(node);
    var out = {};

    Object.keys(item.properties || {}).forEach(function (name) {
      if (name !== key.flag && name !== key.message) out[name] = item.properties[name];
    });
    Object.keys(want).forEach(function (name) {
      out[name] = want[name];
    });
    return out;
  }

  function post(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    }).then(function (response) {
      return response.json();
    });
  }

  function cartElement() {
    return document.querySelector('cart-notification') || document.querySelector('cart-drawer');
  }

  function syncCart(node, rerender) {
    var productId = parseInt(node.dataset.giftProduct, 10);
    if (!productId || busy.get(node)) return Promise.resolve();

    busy.set(node, true);
    var want = wanted(node);

    function pass(left) {
      if (left <= 0) return Promise.resolve();

      return fetch(CART_URL, { headers: { Accept: 'application/json' } })
        .then(function (response) {
          return response.json();
        })
        .then(function (cart) {
          var stale = (cart.items || []).filter(function (item) {
            return item.product_id === productId && !upToDate(item, want, node);
          })[0];
          if (!stale) return;

          var body = {
            id: stale.key,
            quantity: stale.quantity,
            properties: rewrite(stale, want, node)
          };

          var cartEl = rerender ? cartElement() : null;
          if (cartEl && cartEl.getSectionsToRender) {
            body.sections = cartEl.getSectionsToRender().map(function (section) {
              return section.id;
            });
            body.sections_url = window.location.pathname;
          }

          // Rewriting a line can make it identical to another one, which
          // Shopify then merges — so re-read the cart instead of reusing keys.
          return post(CHANGE_URL, body).then(function (state) {
            if (cartEl && state && state.sections) cartEl.renderContents(state);
            return pass(left - 1);
          });
        });
    }

    return pass(12)
      .catch(function (error) {
        console.error('gift-note: cart sync failed', error);
      })
      .finally(function () {
        busy.set(node, false);
      });
  }

  function queue(node, wait, rerender) {
    clearTimeout(timers.get(node));
    timers.set(node, setTimeout(function () {
      syncCart(node, rerender);
    }, wait));
  }

  function flush(node) {
    clearTimeout(timers.get(node));
    return syncCart(node, false);
  }

  /* ---------------------------------------------------------- hydration */

  // Show what the cart actually holds, so switching the toggle off is an
  // obvious way to take the note back off the order.
  function hydrate(node) {
    var productId = parseInt(node.dataset.giftProduct, 10);
    if (!productId || node.dataset.giftHydrate == null) return;

    var key = names(node);
    fetch(CART_URL, { headers: { Accept: 'application/json' } })
      .then(function (response) {
        return response.json();
      })
      .then(function (cart) {
        var line = (cart.items || []).filter(function (item) {
          return item.product_id === productId && (item.properties || {})[key.flag];
        })[0];
        if (!line) return;

        var el = parts(node);
        el.toggle.checked = true;
        el.area.value = line.properties[key.message] || '';
        sync(node);
      })
      .catch(function () {
        /* the widget still works without it */
      });
  }

  /* ----------------------------------------------------------- placement */

  // The gift note belongs directly above the add-to-cart button, but apps that
  // inject into the product form area (bundles, upsells) can land between the
  // two. Nothing forbids that, so put the widget back rather than fight over
  // markup: keep it the element right before <product-form>.
  function place(node) {
    var form = document.getElementById(node.dataset.giftForm);
    var host = form ? form.closest('product-form') : null;
    if (!host || !host.parentNode) return;
    if (host.previousElementSibling === node) return;

    host.parentNode.insertBefore(node, host);
  }

  function placeAll() {
    document.querySelectorAll('[data-gift-note]').forEach(place);
  }

  // Apps inject whenever their own script gets around to it, so watch instead
  // of guessing a delay. Moving the node back is itself a mutation, but the
  // next pass finds it already in place and stops there.
  function watch() {
    if (typeof MutationObserver !== 'function') return;

    var pending;
    var observer = new MutationObserver(function () {
      clearTimeout(pending);
      pending = setTimeout(placeAll, 150);
    });

    document.querySelectorAll('[data-gift-note]').forEach(function (node) {
      var scope = node.closest('.product__info-container') || node.parentNode;
      if (!scope || !scope.dataset || scope.dataset.giftWatched) return;
      scope.dataset.giftWatched = '1';
      observer.observe(scope, { childList: true, subtree: true });
    });
  }

  /* ------------------------------------------------------------- wiring */

  document.addEventListener('change', function (event) {
    var toggle = event.target.closest ? event.target.closest('[data-gift-toggle]') : null;
    if (!toggle) return;

    var node = root(toggle);
    sync(node);
    if (toggle.checked) {
      var el = parts(node);
      if (el.area && !el.area.disabled) el.area.focus({ preventScroll: true });
    }
    queue(node, 250, false);
  });

  document.addEventListener('input', function (event) {
    var area = event.target.closest ? event.target.closest('[data-gift-textarea]') : null;
    if (!area) return;

    var node = root(area);
    count(node);
    queue(node, 700, false);
  });

  // Typing and hitting add-to-cart straight away must not outrun the sync.
  document.addEventListener(
    'submit',
    function (event) {
      var form = event.target;
      if (!form || !form.id) return;

      document.querySelectorAll('[data-gift-note]').forEach(function (node) {
        if (node.dataset.giftForm === form.id) flush(node);
      });
    },
    true
  );

  function syncAll() {
    document.querySelectorAll('[data-gift-note]').forEach(function (node) {
      sync(node);
      if (!node.dataset.giftReady) {
        node.dataset.giftReady = '1';
        hydrate(node);
      }
    });
    placeAll();
    watch();
  }

  // Browsers restore checkbox state on back/forward without firing `change`.
  window.addEventListener('pageshow', syncAll);
  document.addEventListener('shopify:section:load', syncAll);

  // The add itself can leave a stale line behind; reconcile once it lands.
  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.cartUpdate, function (event) {
      if (!event || event.source !== 'product-form') return;
      document.querySelectorAll('[data-gift-note]').forEach(function (node) {
        syncCart(node, true);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAll);
  } else {
    syncAll();
  }
})();
