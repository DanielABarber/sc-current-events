// Fetches a page server-side and pulls out title/author/date from its
// <head> metadata. Runs on Netlify's servers rather than in the browser
// because cross-origin pages don't allow client-side JS to read their HTML.
const MAX_BYTES = 300_000;
const FETCH_TIMEOUT_MS = 8000;

const BLOCKED_HOSTNAME = /^(localhost|127\.|0\.0\.0\.0|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|\[?::1\]?)/i;

export default async (req) => {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('url');

  if (!target) {
    return json({ error: 'Missing url parameter' }, 400);
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return json({ error: 'Invalid URL' }, 400);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return json({ error: 'Only http/https URLs are allowed' }, 400);
  }
  if (BLOCKED_HOSTNAME.test(parsed.hostname)) {
    return json({ error: 'That host is not allowed' }, 400);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(parsed.toString(), {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      return json({ error: `Fetch failed with status ${res.status}` }, 502);
    }

    const html = await readBounded(res.body, MAX_BYTES);
    const meta = extractMetadata(html, parsed.hostname);
    return json(meta, 200);
  } catch (err) {
    return json({ error: 'Could not fetch that URL' }, 502);
  }
};

async function readBounded(body, maxBytes) {
  if (!body) return '';
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let html = '';
  let received = 0;
  while (received < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    html += decoder.decode(value, { stream: true });
    if (/<\/head>/i.test(html)) break;
  }
  reader.cancel().catch(() => {});
  return html;
}

function pickMeta(html, names) {
  for (const name of names) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i');
    const m = html.match(re1) || html.match(re2);
    if (m && m[1]) return decodeEntities(m[1]);
  }
  return null;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

function extractMetadata(html, hostname) {
  const ogTitle = pickMeta(html, ['og:title', 'twitter:title']);
  const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = ogTitle || (titleTagMatch && decodeEntities(titleTagMatch[1].trim())) || hostname;

  const author = pickMeta(html, ['author', 'article:author', 'twitter:creator', 'parsely-author', 'sailthru.author', 'citation_author']);

  const dateRaw = pickMeta(html, [
    'article:published_time',
    'og:article:published_time',
    'date',
    'publish-date',
    'publish_date',
    'parsely-pub-date',
    'sailthru.date',
    'dc.date',
    'dc.date.issued',
    'citation_publication_date',
  ]);
  let date = toIsoDate(dateRaw);
  if (!date) {
    const timeMatch = html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
    if (timeMatch) date = toIsoDate(timeMatch[1]);
  }

  return {
    title: title.trim(),
    author: author ? author.trim() : null,
    date,
    source: hostname.replace(/^www\./, ''),
  };
}

function toIsoDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
