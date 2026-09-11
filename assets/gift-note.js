/* MOMent — Geschenknachricht (gift note) on the product page.
   Delegated listeners only, so the widget keeps working when Shopify
   re-renders the product form (variant change, quick add modal). */
(function () {
  'use strict';

  function root(el) {
    return el ? el.closest('[data-gift-note]') : null;
  }

  function sync(node) {
    if (!node) return;

    var toggle = node.querySelector('[data-gift-toggle]');
    var panel = node.querySelector('[data-gift-panel]');
    var area = node.querySelector('[data-gift-textarea]');
    if (!toggle || !panel || !area) return;

    var on = toggle.checked;
    panel.hidden = !on;
    // Disabled fields are not submitted, so an empty line item property
    // is never attached when the customer leaves the toggle off.
    area.disabled = !on;
    count(node);
  }

  function count(node) {
    var area = node.querySelector('[data-gift-textarea]');
    var label = node.querySelector('[data-gift-count]');
    if (!area || !label) return;

    var limit = parseInt(area.getAttribute('maxlength'), 10) || 0;
    label.textContent = area.value.length + ' / ' + limit;
  }

  function focus(node) {
    var area = node.querySelector('[data-gift-textarea]');
    if (area && !area.disabled) area.focus({ preventScroll: true });
  }

  document.addEventListener('change', function (event) {
    var toggle = event.target.closest ? event.target.closest('[data-gift-toggle]') : null;
    if (!toggle) return;

    var node = root(toggle);
    sync(node);
    if (toggle.checked) focus(node);
  });

  document.addEventListener('input', function (event) {
    var area = event.target.closest ? event.target.closest('[data-gift-textarea]') : null;
    if (area) count(root(area));
  });

  // Browsers restore checkbox state on back/forward without firing `change`.
  function syncAll() {
    document.querySelectorAll('[data-gift-note]').forEach(sync);
  }

  window.addEventListener('pageshow', syncAll);
  document.addEventListener('shopify:section:load', syncAll);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAll);
  } else {
    syncAll();
  }
})();
