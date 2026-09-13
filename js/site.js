// Single source of truth for categories. To add/rename/remove a category:
// 1. Edit this list.
// 2. Add/edit the matching <a class="category-btn"> button in index.html.
// 3. Add/edit the matching category page (copy an existing one, e.g. events.html,
//    and change the <title>/<h1> and the data-category attribute on <body>).
const CATEGORIES = [
  { slug: 'heat-wave', label: 'Heat Wave' },
  { slug: 'energy-transition', label: 'Energy Transition' },
  { slug: 'hope', label: 'Hope' },
  { slug: 'architecture', label: 'Architecture' },
  { slug: 'events', label: 'Events' },
];

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

async function loadArticles() {
  const res = await fetch('/.netlify/functions/articles', { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

// Renders the chronological entry list for a single category page.
// Expects an <ul id="entries"> in the page.
async function renderCategoryPage(slug) {
  const list = document.getElementById('entries');
  let articles;
  try {
    articles = await loadArticles();
  } catch (err) {
    list.innerHTML = '<li class="empty-state">Could not load the link list.</li>';
    return;
  }

  const filtered = articles
    .filter(a => a.category === slug)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (filtered.length === 0) {
    list.innerHTML = '<li class="empty-state">No entries yet.</li>';
    return;
  }

  list.innerHTML = filtered.map(a => `
    <li class="entry">
      <div class="entry-date mono">${formatDate(a.date)}</div>
      <div class="entry-body">
        <h3><a href="${escapeAttr(a.url)}" target="_blank" rel="noopener">${escapeHtml(a.title)}</a></h3>
        ${a.author ? `<div class="entry-author">${escapeHtml(a.author)}</div>` : ''}
      </div>
    </li>
  `).join('');
}
