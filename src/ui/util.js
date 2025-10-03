// src/ui/util.js
export const fmtUSD = n => (n == null ? '—' :
  new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD'}).format(n));

export const fmtPct = p => (p == null ? '—' : `${p.toFixed(2)}%`);

export function debounce(fn, ms = 350) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
