# SC.Current.Events

A curated link resource for students: five topic pages (Heat Wave, Energy Transition, Hope, Architecture, Events), each a chronological list of links. Working name, not final.

Static site, no backend, no database. All content lives in [`data/articles.json`](data/articles.json).

## Adding a link

1. Open the homepage (`index.html`) — the "Add a link" box is at the top.
2. Click **Load current data/articles.json** to pull in what's already published.
3. Paste the URL, fill in title, author, date, and pick a category from the dropdown, then **Add to list**.
4. Repeat for as many links as you like.
5. Click **Download articles.json**.
6. Replace `data/articles.json` in this repo with the downloaded file.
7. Commit and push — Netlify redeploys automatically.

This form doesn't write anywhere on its own — it just helps you build the JSON file locally. If "Load current data/articles.json" fails (this can happen when opening the file directly via `file://` instead of a server), paste the current contents of `data/articles.json` into the output box manually and edit from there.

To test locally with the fetch working correctly, serve the folder instead of opening the file directly, e.g.:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

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
