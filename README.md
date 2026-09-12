# SC.Current.Events

A curated link resource for students: five topic pages (Heat Wave, Energy Transition, Hope, Architecture, Events), each a chronological list of links. Working name, not final.

Static site, no database. All content lives in [`data/articles.json`](data/articles.json). One small serverless function ([`netlify/functions/metadata.mjs`](netlify/functions/metadata.mjs)) reads a pasted page's title/author/date server-side — a browser can't read another site's HTML directly (CORS), so this runs on Netlify instead. No accounts, no config; Netlify picks it up automatically from `netlify.toml`.

## Adding a link

1. Open the homepage — paste a URL, pick a category, click **Add to list**.
2. The site fetches that page, pulls out its title/author/date, and downloads an updated `articles.json` (merged with what's already published).
3. Replace `data/articles.json` in this repo with the downloaded file.
4. Commit and push — Netlify redeploys automatically.

If a page's metadata can't be read (no standard title/author tags, or the fetch fails), the entry still gets added using the domain name and today's date — the status message says so, and you can hand-edit the downloaded JSON to fix it before pushing.

The metadata function only runs on Netlify (it needs a live server, not `file://` or a plain static server), so title/author/date lookup won't work when testing `index.html` locally with e.g. `python3 -m http.server`. The category pages and everything else still work fine locally, reading straight from `data/articles.json`.

## Data format

Each entry in `data/articles.json`:

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

## Changing or adding categories

The five categories are defined in one place: the `CATEGORIES` array at the top of [`js/site.js`](js/site.js). To add, rename, or remove one:

1. Edit `CATEGORIES` in `js/site.js` (this drives the homepage's category dropdown).
2. Add/edit the matching `<a class="category-btn">` button in `index.html`.
3. Add/edit the matching page — copy an existing one (e.g. `events.html`) and change the `<title>`/`<h1>` and the `renderCategoryPage('slug')` call at the bottom.

Subcategories within a topic aren't built yet — noted as a possible future addition.

## Deploy

Push to `main` on GitHub, Netlify auto-deploys. No build step — static site, publish directory is the repo root.

Live: https://sufficiencyconsultancylinks.netlify.app
Repo: https://github.com/DanielABarber/sc-current-events

## Style

Visually consistent with danielabarber.net (color palette, Inter typeface, uppercase eyebrow labels, minimal static-site aesthetic) but standalone — no links back to the personal site.
