import { getQuote, getTopPage } from './api/quotes.js';
import { listWatchlist, addToWatchlist, updateWatchItem, removeWatchItem } from './api/watchlist.js';
import { renderResults, renderWatchlist, renderPageLabel } from './ui/render.js';
import { debounce } from './ui/util.js';
import { state, setLoading } from './ui/state.js';

const form   = document.getElementById('searchForm');
const input  = document.getElementById('tickerInput');
const prevBtn= document.getElementById('prevBtn');
const nextBtn= document.getElementById('nextBtn');

async function loadPage(page = 1) {
  setLoading(true);
  try {
    const { items, total } = await getTopPage(page, state.pageSize);
    renderResults(items);
    renderPageLabel(page);
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page * state.pageSize >= total;
  } catch (err) {
    console.error(err);
    document.getElementById('results').innerHTML = `<p class="error">Failed to load list: ${err.message}</p>`;
  } finally {
    setLoading(false);
  }
}

async function searchExact(symbol) {
  if (!symbol) return;
  const key = `q:${symbol}`;
  if (state.inflight.has(key)) return; // guard duplicate requests
  state.inflight.add(key);
  try {
    const q = await getQuote(symbol);
    renderResults([q]);
    renderPageLabel(1);
    prevBtn.disabled = nextBtn.disabled = true;
  } catch (err) {
    console.error(err);
    document.getElementById('results').innerHTML = `<p class="error">${err.message}</p>`;
  } finally {
    state.inflight.delete(key);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const s = input.value.trim().toUpperCase();
  state.lastSearch = s;
  s ? searchExact(s) : loadPage(1);
});

// debounced input to revert to paginated list when cleared
input.addEventListener('input', debounce(() => {
  const s = input.value.trim().toUpperCase();
  if (!s) loadPage(1);
}, 300));

// pagination
prevBtn.addEventListener('click', () => { state.page = Math.max(1, state.page - 1); loadPage(state.page); });
nextBtn.addEventListener('click', () => { state.page += 1; loadPage(state.page); });

// add to watchlist
document.getElementById('results').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act="add"]');
  if (!btn) return;
  const symbol = btn.dataset.symbol;
  try {
    await addToWatchlist({ symbol, note: '', rating: 0 });
    await refreshWatchlist();
  } catch (err) {
    alert(`Failed to add: ${err.message}`);
  }
});

// save/delete watchlist updates
document.getElementById('watchlist').addEventListener('click', async (e) => {
  const act = e.target.dataset.act;
  const id  = e.target.dataset.id;
  if (!act || !id) return;
  try {
    if (act === 'save') {
      const box = e.currentTarget;
      const note   = box.querySelector(`input[data-act="note"][data-id="${id}"]`)?.value ?? '';
      const rating = Number(box.querySelector(`input[data-act="rating"][data-id="${id}"]`)?.value ?? 0);
      await updateWatchItem(id, { note, rating });
    } else if (act === 'del') {
      await removeWatchItem(id);
    }
    await refreshWatchlist();
  } catch (err) {
    alert(`Action failed: ${err.message}`);
  }
});

async function refreshWatchlist() {
  try {
    const items = await listWatchlist();
    renderWatchlist(items);
  } catch (err) {
    console.error(err);
  }
}

// boot
loadPage(1);
refreshWatchlist();
