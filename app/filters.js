// Filtering, sorting and the "is it really a deal" verdict. One job: turn the deal list
// and a set of filters into the ordered list the page shows, and say how good each deal is.

import { deals } from './data.js';

export const CATEGORIES = [...new Set(deals.map((d) => d.category))].sort();
export const STORES = [...new Set(deals.map((d) => d.store))].sort();

export function discountPercent(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

export function saving(d) {
  return Math.round((d.was - d.price) * 100) / 100;
}

// The verdict: record-low claims only where the source said so in so many words,
// otherwise the cut against the usual price. A small cut is called a small cut.
export function verdict(d) {
  const pct = discountPercent(d);
  if (d.recordLow) return { label: 'Record low', tone: 'best', rank: 0 };
  if (d.lowestSinceLaunch) return { label: 'Lowest since launch', tone: 'best', rank: 1 };
  if (pct >= 50) return { label: 'Standout deal', tone: 'best', rank: 2 };
  if (pct >= 30) return { label: 'Strong deal', tone: 'good', rank: 3 };
  if (pct >= 20) return { label: 'Decent saving', tone: 'ok', rank: 4 };
  return { label: 'Routine sale — check first', tone: 'weak', rank: 5 };
}

export const SORTS = {
  discount: { label: 'Biggest discount', key: (a, b) => discountPercent(b) - discountPercent(a) || saving(b) - saving(a) },
  saving: { label: 'Biggest cash saving', key: (a, b) => saving(b) - saving(a) || discountPercent(b) - discountPercent(a) },
  price: { label: 'Lowest price first', key: (a, b) => a.price - b.price },
  name: { label: 'Name A–Z', key: (a, b) => a.title.localeCompare(b.title) },
};

export function applyFilters({ q = '', category = 'All', store = 'All', minDiscount = 0, sort = 'discount' }) {
  const query = q.trim().toLowerCase();
  const shown = deals.filter((d) => {
    if (category !== 'All' && d.category !== category) return false;
    if (store !== 'All' && d.store !== store) return false;
    if (discountPercent(d) < minDiscount) return false;
    if (query && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(query)) return false;
    return true;
  });
  const sorter = SORTS[sort] ?? SORTS.discount;
  return [...shown].sort(sorter.key);
}
