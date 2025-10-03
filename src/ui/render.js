// src/ui/render.js
import { fmtUSD, fmtPct } from './util.js';

const resultsEl = document.getElementById('results');
const watchEl   = document.getElementById('watchlist');
const pageLbl   = document.getElementById('pageLabel');

export function renderResults(list) {
  resultsEl.innerHTML = '';
  if (!list.length) { resultsEl.innerHTML = '<p class="error">No results.</p>'; return; }
  for (const it of list) {
    const row = document.createElement('div');
    row.className = 'card';
    row.innerHTML = `
      <div>
        <div class="symbol">${it.symbol}</div>
        <small class="muted">${it.name ?? ''}</small>
        <div>${fmtUSD(it.price)} <span class="badge">${fmtPct(it.changesPercentage)}</span></div>
      </div>
      <div>
        <button class="btn secondary" data-act="add" data-symbol="${it.symbol}">+ Watch</button>
      </div>`;
    resultsEl.appendChild(row);
  }
}

export function renderPageLabel(page) {
  pageLbl.textContent = `Page ${page}`;
}

export function renderWatchlist(items) {
  watchEl.innerHTML = '';
  for (const it of items) {
    const row = document.createElement('div');
    row.className = 'card';
    row.innerHTML = `
      <div>
        <div class="symbol">${it.symbol}</div>
        <label>Note <input data-act="note" data-id="${it.id}" value="${it.note ?? ''}" /></label>
        <label>Rating <input type="number" min="0" max="5" step="1" data-act="rating" data-id="${it.id}" value="${it.rating ?? 0}" /></label>
      </div>
      <div>
        <button class="btn" data-act="save" data-id="${it.id}">Save</button>
        <button class="btn danger" data-act="del" data-id="${it.id}">Delete</button>
      </div>`;
    watchEl.appendChild(row);
  }
}
 