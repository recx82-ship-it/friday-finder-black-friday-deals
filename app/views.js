// HTML for each page, built from the deal data. Every value is escaped before it goes
// into the page. No images, no external files: each card carries a coloured monogram tile
// drawn in CSS, so the site needs nothing from the network.

import { CHECKED_LABEL } from './data.js';
import { discountPercent, saving, verdict } from './filters.js';

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function money(d, n) {
  const symbol = d.currency === 'GBP' ? '£' : '$';
  return `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
}

const TILE_LETTERS = {
  Audio: 'AU',
  Laptops: 'LP',
  'E-readers': 'RD',
  'Smart home': 'SH',
  'Home & cleaning': 'HM',
  Kitchen: 'KT',
  Gaming: 'GM',
  Toys: 'TY',
  Computing: 'PC',
  Beauty: 'BT',
  TVs: 'TV',
  Phones: 'PH',
  Fitness: 'FT',
};

export function dealCard(d) {
  const v = verdict(d);
  const pct = discountPercent(d);
  return `<article class="card">
  <div class="tile tone-${v.tone}" aria-hidden="true">${TILE_LETTERS[d.category] ?? 'DL'}</div>
  <div class="card-body">
    <p class="meta"><span class="store">${escape(d.store)}</span> · ${escape(d.category)}</p>
    <h2><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h2>
    <p class="price"><strong>${money(d, d.price)}</strong> <s>${money(d, d.was)}</s> <span class="off">${pct}% off</span></p>
    <p class="save">Save ${money(d, saving(d))}</p>
    <p class="verdict tone-${v.tone}">${escape(v.label)}</p>
    <p class="evidence">${escape(d.evidence)}</p>
    <p class="checked">Checked ${CHECKED_LABEL} · ${escape(d.source)}</p>
    <p><a class="shop" href="${escape(d.url)}" target="_blank" rel="noopener">View at ${escape(d.store)} ↗</a></p>
  </div>
</article>`;
}

export function listPage({ shown, total, filters }) {
  const cards = shown.map(dealCard).join('\n');
  const empty = shown.length === 0
    ? '<p class="empty">No deal matches those filters. Loosen the discount or clear the search.</p>'
    : '';
  return `<section class="intro">
  <h1>Black Friday deals, checked by hand</h1>
  <p>Every price below was read at the store, or in a deals source that names the store, on <strong>Friday 27 November 2026</strong> — the day Black Friday itself began. Each card says whether the cut is a real bargain or a routine sale, and why.</p>
</section>
<section class="controls" aria-label="Find a deal">
  <label>Search <input id="q" type="search" placeholder="Try “lego”, “dyson”, “tv”…" value="${escape(filters.q)}"></label>
  <label>Category
    <select id="category">
      <option value="All">All categories</option>
      ${filters.categories.map((c) => `<option${c === filters.category ? ' selected' : ''}>${escape(c)}</option>`).join('')}
    </select>
  </label>
  <label>Store
    <select id="store">
      <option value="All">All stores</option>
      ${filters.stores.map((s) => `<option${s === filters.store ? ' selected' : ''}>${escape(s)}</option>`).join('')}
    </select>
  </label>
  <label>Discount
    <select id="minDiscount">
      <option value="0"${filters.minDiscount === 0 ? ' selected' : ''}>Any discount</option>
      <option value="20"${filters.minDiscount === 20 ? ' selected' : ''}>20% off or more</option>
      <option value="30"${filters.minDiscount === 30 ? ' selected' : ''}>30% off or more</option>
      <option value="50"${filters.minDiscount === 50 ? ' selected' : ''}>50% off or more</option>
    </select>
  </label>
  <label>Sort by
    <select id="sort">
      <option value="discount"${filters.sort === 'discount' ? ' selected' : ''}>Biggest discount</option>
      <option value="saving"${filters.sort === 'saving' ? ' selected' : ''}>Biggest cash saving</option>
      <option value="price"${filters.sort === 'price' ? ' selected' : ''}>Lowest price first</option>
      <option value="name"${filters.sort === 'name' ? ' selected' : ''}>Name A–Z</option>
    </select>
  </label>
</section>
<p class="count" role="status">Showing <strong>${shown.length}</strong> of ${total} deals${filters.q ? ` for “${escape(filters.q)}”` : ''}${filters.category !== 'All' ? ` in ${escape(filters.category)}` : ''}${filters.store !== 'All' ? ` at ${escape(filters.store)}` : ''}.</p>
<div class="grid">${cards}</div>${empty}`;
}

export function dealPage(d, sameStoreCount) {
  const v = verdict(d);
  const pct = discountPercent(d);
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <p class="meta"><span class="store">${escape(d.store)}</span> · ${escape(d.category)}</p>
  <h1>${escape(d.title)}</h1>
  <p class="price big"><strong>${money(d, d.price)}</strong> <s>${money(d, d.was)}</s> <span class="off">${pct}% off</span></p>
  <p class="save big">You save ${money(d, saving(d))} against the usual price of ${money(d, d.was)}.</p>
  <p class="verdict tone-${v.tone} big">${escape(v.label)}</p>
  <section class="why">
    <h2>Why this verdict</h2>
    <p>${escape(d.evidence)}</p>
    <p>The cut is ${pct}% — the sale price is ${money(d, d.price)} against a usual price of ${money(d, d.was)}, a saving of ${money(d, saving(d))}.</p>
    ${d.alsoAt ? `<p>${escape(d.alsoAt)}</p>` : ''}
    ${sameStoreCount > 1 ? `<p>There ${sameStoreCount === 2 ? 'is one other' : `are ${sameStoreCount - 1} other`} deal${sameStoreCount === 2 ? '' : 's'} at ${escape(d.store)} on this board.</p>` : ''}
  </section>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Checked</dt><dd>${CHECKED_LABEL}</dd>
    <dt>Read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p><a class="shop big" href="${escape(d.url)}" target="_blank" rel="noopener">View at ${escape(d.store)} ↗</a></p>
  <p class="note">Prices move fast on Black Friday — check the price at the store before you buy.</p>
</article>`;
}

export function missingPage() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
