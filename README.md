# SC.Current.Events

A standalone link-curation site: drop in a news article, academic PDF, or other online link, tag it with keywords, and browse/filter the feed by tag. Working name, not final — see handoff notes below.

Static site, no backend, no database. All content lives in [`data/articles.json`](data/articles.json).

## Adding a link

1. Open [`admin.html`](admin.html) (locally or on the deployed site — it's not linked from the homepage, just visit `/admin.html`).
2. Click **Load current data/articles.json** to pull in what's already published.
3. Fill in the URL, title, source, type, date, and comma-separated tags, then **Add to list**.
4. When done, click **Download articles.json**.
5. Replace `data/articles.json` in this repo with the downloaded file.
6. Commit and push — Netlify redeploys automatically.

`admin.html` is not a backend: it just helps you build the JSON file locally and never writes anywhere on its own. If "Load current data/articles.json" fails (this can happen when opening the file directly via `file://` instead of a server), paste the current contents of `data/articles.json` into the output box manually and edit from there.

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
  "source": "Publication name",
  "type": "news | pdf | article",
  "date": "YYYY-MM-DD",
  "tags": ["tag-one", "tag-two"]
}
```

- **PDFs are never self-hosted** — `url` always points to the original source, even for `type: "pdf"`. (This is the opposite convention from danielabarber.net, which does self-host PDFs — don't carry that over here.)
- Tags are freeform; the homepage's filter buttons are generated automatically from whatever tags are currently in use, so no separate list to maintain.

## Deploy

Same pattern as danielabarber.net: push to `main` on GitHub, Netlify auto-deploys. No build step — it's a static site, so Netlify's publish directory should just be the repo root.

## Style

Visually matches danielabarber.net (same color palette, Inter typeface, uppercase eyebrow labels, minimal single-page layout) since it will eventually be linked from that site's nav. Not yet integrated there — this is being built standalone first.

## Still undecided (from the original handoff)

- Final site name
- Whether keyword buttons should ever become a curated/fixed list instead of auto-generated (currently: auto-generated from tags in use)
- Whether article types need a stronger visual distinction (currently: a small colored badge — rust for PDF, teal for News, neutral for Article)
