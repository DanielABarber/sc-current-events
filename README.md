# SC.Current.Events

A curated link resource for students: five topic pages (Heat Wave, Energy Transition, Hope, Architecture, Events), each a chronological list of links. Working name, not final.

One serverless function ([`netlify/functions/articles.mjs`](netlify/functions/articles.mjs)) backed by Netlify Blobs holds all the data — no separate database, no accounts, no config. It works automatically once deployed.

## Adding a link

Open the homepage, paste a URL, pick a category, click **Add to list**. The function fetches that page server-side (a browser can't read another site's HTML directly — that's a CORS restriction), pulls its title/author/publish-date from standard meta tags, saves the entry, and it shows up on its category page immediately. Nothing to download, replace, commit, or push.

If a page's metadata can't be read (no standard title/author tags, or the site blocks server-side fetches — NYT and Places Journal both do, for example), the entry still gets saved using the domain name and today's date, and the status message says so.

This means `index.html` needs to be served by Netlify (or `netlify dev`) to actually add or load links — opening it via `file://` or a plain static server (`python3 -m http.server`) will fail to reach the function. Netlify's own preview/deploy URLs always work.

## Data format

Each article, as stored by the function:

```json
{
  "id": "unique-string",
  "title": "Article title",
  "url": "https://example.com/article",
  "author": "Author name",
  "date": "YYYY-MM-DD",
  "category": "heat-wave | energy-transition | hope | architecture | events"
}
```

Each entry lives on exactly one category page, shown as "Title — Author, Date" (never as a raw URL), newest first. PDFs and every other link type are never self-hosted — `url` always points to the original source.

There's no delete/edit UI yet — if an entry needs fixing or removing, that has to happen via a direct call to the function for now (ask me and I can do it), or a small admin UI can be added if that becomes a regular need.

## Changing or adding categories

The five categories are defined in **two** places that need to stay in sync: the `CATEGORIES` array at the top of [`js/site.js`](js/site.js) (drives the homepage buttons and dropdown) and `CATEGORY_SLUGS` at the top of [`netlify/functions/articles.mjs`](netlify/functions/articles.mjs) (validates submissions server-side). To add, rename, or remove one:

1. Edit `CATEGORIES` in `js/site.js`.
2. Edit `CATEGORY_SLUGS` in `netlify/functions/articles.mjs` to match.
3. Add/edit the matching `<a class="category-btn">` button in `index.html`.
4. Add/edit the matching page — copy an existing one (e.g. `events.html`) and change the `<title>`/`<h1>` and the `renderCategoryPage('slug')` call at the bottom.

Subcategories within a topic aren't built yet — noted as a possible future addition.

## Deploy

Push to `main` on GitHub, Netlify auto-deploys. No build step — static site, publish directory is the repo root.

Live: https://sufficiencyconsultancylinks.netlify.app
Repo: https://github.com/DanielABarber/sc-current-events

## Style

Visually consistent with danielabarber.net (color palette, Inter typeface, uppercase eyebrow labels, minimal static-site aesthetic) but standalone — no links back to the personal site.
