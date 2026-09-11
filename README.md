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

The fields sit outside `<product-form>` and are bound to it with the HTML5
`form` attribute. The theme turns `.product-form` into a fixed sticky bar on
mobile (**Product page → Sticky add-to-cart**), so anything nested inside it
gets pulled down into that bar — `form="..."` keeps the widget in the normal
page flow while `new FormData(form)` still submits the properties.

| File | Role |
|---|---|
| `snippets/gift-note.liquid` | markup, reads its settings from the `buy_buttons` block |
| `assets/gift-note.css` | styling (accent colour via the `--gift-note-accent` custom property) |
| `assets/gift-note.js` | delegated listeners — survives variant changes and quick-add |
| `snippets/buy-buttons.liquid` | renders the snippet above `<product-form>` |
| `sections/main-product.liquid` | the block settings shown in the theme customizer |

Everything is editable under **Theme customizer → Product page → Buy buttons →
Geschenknachricht**: on/off, title, subtitle, placeholder, hint, character
limit, accent colour, the property names, and a tag (`no-gift-note`) that hides
the field on individual products. Gift card products never show it.

## Rules

1. Never commit straight to `main` — branch, then open a PR.
2. `config/settings_data.json` changes whenever someone edits the theme customizer. Pull before you push so admin-side edits are not overwritten.
3. Keep the original export untouched in git history so we always have a rollback point.
