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

## Rules

1. Never commit straight to `main` — branch, then open a PR.
2. `config/settings_data.json` changes whenever someone edits the theme customizer. Pull before you push so admin-side edits are not overwritten.
3. Keep the original export untouched in git history so we always have a rollback point.
