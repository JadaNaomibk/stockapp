const BASE = 'https://68dfd662898434f413591975.mockapi.io/sapi'; 

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function listWatchlist() {
  return await jsonFetch(`${BASE}/watchlist`);
}

export async function addToWatchlist({ symbol, note = '', rating = 0 }) {
  return await jsonFetch(`${BASE}/watchlist`, {
    method: 'POST',
    body: JSON.stringify({ symbol, note, rating }),
  });
}

export async function updateWatchItem(id, { note, rating }) {
  return await jsonFetch(`${BASE}/watchlist/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ note, rating }),
  });
}

export async function removeWatchItem(id) {
  await jsonFetch(`${BASE}/watchlist/${id}`, { method: 'DELETE' });
}
