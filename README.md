# mom-ent.de — Shopify Theme

Git backup of the live Shopify theme for **mom-ent.de**.

| | |
|---|---|
| Theme | Luxe |
| Version | 14.1.0 |
| Author | Winter Studio |
| Source export | `theme_export__momentdemomentbackup__11SEP2026-0806am` |

## Folder structure

| Folder | Contents |
|---|---|
| `assets/` | CSS, JS, fonts and images used by the theme |
| `config/` | `settings_schema.json` (theme settings) and `settings_data.json` (saved values) |
| `layout/` | `theme.liquid`, `password.liquid` — the page shells |
| `locales/` | Storefront and schema translations |
| `sections/` | Section files used across templates |
| `snippets/` | Reusable Liquid partials |
| `templates/` | JSON/Liquid templates per page type, incl. `templates/customers/` |

## Working on the theme

```bash
# install the Shopify CLI once
npm install -g @shopify/cli @shopify/theme

# live preview against the store (hot reload)
shopify theme dev --store mom-ent.de

# push to an unpublished theme for review
shopify theme push --unpublished --theme "mom-ent.de dev"

# pull the latest changes made in the Shopify admin back into git
shopify theme pull
```

## Custom work on top of the export

### Geschenknachricht (gift note) — product page

A toggle + message field rendered inside the product form, directly above the
add-to-cart button. When the customer switches it on, two line item properties
are attached to the item and shown in the cart, the order and the packing slip:

| Property | Value |
|---|---|
| `Geschenk` | `Ja` |
| `Geschenknachricht` | the customer's message (max. 300 characters) |

When the toggle is off, the textarea is `disabled`, so no empty property is ever
submitted.

Shopify stores line item properties **on the line**, so a line added with a
gift note keeps it for good — adding the same product again with the toggle off
only creates a second line beside the old one, and the note is still in the
cart. So the widget rewrites every cart line of that product whenever the
toggle or the message changes (and once more after an add-to-cart). Lines that
end up identical are merged by Shopify on its own, and any other property on
the line — bundle apps, subscriptions — is preserved. On the product page the
toggle also hydrates from the cart, so it always shows what the order actually
carries.

The widget sits inside the product form, immediately above
`.product-form__buttons`, and the script puts it back there whenever something
lands in between — the bundle app injects its widget into the form after page
load, which is exactly what it did before.

That spot is inside the theme's sticky add-to-cart bar (**Product page → Sticky
add-to-cart**), which pins the whole `.product-form` to the bottom of the screen
below 950px. So `buy-buttons.liquid` marks the wrapper `.has-gift-note`, and
`gift-note.css` pins `.product-form__buttons` instead: the same bar, without the
toggle and the message field being dragged into it. On desktop the bar is a panel that floats
in once the real button scrolls away; `section-main-product.css` now keeps that
panel to the product and the button, so neither the gift note nor a widget an
app injected into the form gets duplicated into it.

| File | Role |
|---|---|
| `snippets/gift-note.liquid` | markup, reads its settings from the `buy_buttons` block |
| `assets/gift-note.css` | styling (accent colour via the `--gift-note-accent` custom property) |
| `assets/gift-note.js` | widget behaviour, placement, cart reconciliation |
| `snippets/buy-buttons.liquid` | renders the snippet above the add-to-cart button |
| `sections/main-product.liquid` | the block settings shown in the theme customizer |
| `snippets/cart-drawer.liquid`, `sections/main-cart-items.liquid` | hide the message from the cart UI |

In the cart, `Geschenk: Ja` is shown so the customer can see the card is on the
order, while the message itself is hidden — they wrote it on the product page
and it would only make the drawer noisy. Both are still submitted, so they stay
visible at checkout, on the order, on the packing slip and in the Shopify admin,
which is where the card gets written from. What to hide lives in **Theme
settings → Cart → Ausgeblendete Eigenschaften** (comma separated); rename a
property in the block settings and update it here too.

Everything is editable under **Theme customizer → Product page → Buy buttons →
Geschenknachricht**: on/off, title, subtitle, placeholder, hint, character
limit, accent colour, the property names, and a tag (`no-gift-note`) that hides
the field on individual products. Gift card products never show it.

## Rules

1. Never commit straight to `main` — branch, then open a PR.
2. `config/settings_data.json` changes whenever someone edits the theme customizer. Pull before you push so admin-side edits are not overwritten.
3. Keep the original export untouched in git history so we always have a rollback point.
