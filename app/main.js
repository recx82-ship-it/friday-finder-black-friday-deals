// The app: hash routes, filters and rendering. The deals live in data.js, so the site
// needs no network to show them; each deal links out to its store.
//
//   #/                                   the list, biggest discount first
//   #/?q=lego&cat=Gaming&store=Amazon&min=30&sort=saving
//                                       the list with filters applied
//   #/deal/<id>                          one deal, with its verdict explained
//
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { CHECKED_LABEL, deals } from './data.js';
import { CATEGORIES, STORES, applyFilters } from './filters.js';
import { dealPage, listPage, missingPage } from './views.js';

const app = document.getElementById('app');
const stats = document.getElementById('stats');

function readFilters() {
  const params = new URLSearchParams((location.hash.split('?')[1] ?? '').replace(/^#/, ''));
  return {
    q: params.get('q') ?? '',
    category: params.get('cat') ?? 'All',
    store: params.get('store') ?? 'All',
    minDiscount: Number(params.get('min') ?? 0) || 0,
    sort: params.get('sort') ?? 'discount',
    categories: CATEGORIES,
    stores: STORES,
  };
}

function writeFilters(f) {
  const params = new URLSearchParams();
  if (f.q) params.set('q', f.q);
  if (f.category !== 'All') params.set('cat', f.category);
  if (f.store !== 'All') params.set('store', f.store);
  if (f.minDiscount) params.set('min', String(f.minDiscount));
  if (f.sort !== 'discount') params.set('sort', f.sort);
  const query = params.toString();
  history.replaceState(null, '', query ? `#/?${query}` : '#/');
}

function readControls() {
  return {
    q: app.querySelector('#q').value,
    category: app.querySelector('#category').value,
    store: app.querySelector('#store').value,
    minDiscount: Number(app.querySelector('#minDiscount').value),
    sort: app.querySelector('#sort').value,
    categories: CATEGORIES,
    stores: STORES,
  };
}

function renderList() {
  const filters = readFilters();
  const shown = applyFilters(filters);
  document.title = 'Friday Finder — Black Friday deals, checked';
  app.innerHTML = listPage({ shown, total: deals.length, filters });
  bindControls();
}

function bindControls() {
  const onInput = () => {
    const filters = readControls();
    writeFilters(filters);
    const shown = applyFilters(filters);
    app.innerHTML = listPage({ shown, total: deals.length, filters });
    bindControls();
    const q = app.querySelector('#q');
    q.focus();
    q.setSelectionRange(q.value.length, q.value.length);
  };
  const onChange = () => {
    const filters = readControls();
    writeFilters(filters);
    const shown = applyFilters(filters);
    app.innerHTML = listPage({ shown, total: deals.length, filters });
    bindControls();
  };
  app.querySelector('#q').addEventListener('input', onInput);
  app.querySelector('#category').addEventListener('change', onChange);
  app.querySelector('#store').addEventListener('change', onChange);
  app.querySelector('#minDiscount').addEventListener('change', onChange);
  app.querySelector('#sort').addEventListener('change', onChange);
}

function render() {
  window.__shotReady = false;
  const dealMatch = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    document.title = `${found ? found.title : 'Not found'} | Friday Finder`;
    const sameStore = found ? deals.filter((d) => d.store === found.store).length : 0;
    app.innerHTML = found ? dealPage(found, sameStore) : missingPage();
  } else {
    renderList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

const stores = [...new Set(deals.map((d) => d.store))].length;
const cats = [...new Set(deals.map((d) => d.category))].length;
stats.textContent = `${deals.length} deals · ${stores} stores · ${cats} categories · Prices checked ${CHECKED_LABEL}`;

window.addEventListener('hashchange', render);
render();
