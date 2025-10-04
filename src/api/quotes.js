// src/api/quotes.js — Finnhub (free, CORS OK)
import { FINNHUB } from '../config.js';

const FH = 'https://finnhub.io/api/v1';

async function jf(url) {
  console.debug('[FH URL]', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export async function getQuote(symbol) {
  const s = encodeURIComponent(symbol.trim());
  // Price/changes
  const q = await jf(`${FH}/quote?symbol=${s}&token=${encodeURIComponent(FINNHUB.TOKEN)}`);
  // Company name (optional nice-to-have)
  let name = s;
  try {
    const p = await jf(`${FH}/stock/profile2?symbol=${s}&token=${encodeURIComponent(FINNHUB.TOKEN)}`);
    name = p.name || s;
  } catch {}
  if (q.c == null) throw new Error('No data');
  // q.c = current, q.dp = change %, q.v = volume
  return {
    symbol: s,
    name,
    price: q.c,
    changesPercentage: q.dp,
    marketCap: null,   // Finnhub basic quote doesn’t include market cap on free tier
    volume: q.v ?? null
  };
}

const TOP = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','NFLX','KO','PEP','DIS','INTC','ORCL','CSCO'];

export async function getTopPage(page = 1, size = 5) {
  const start = (page - 1) * size;
  const symbols = TOP.slice(start, start + size);
  const items = [];
  for (const s of symbols) {
    try { items.push(await getQuote(s)); } catch (e) { console.warn('skip', s, e.message); }
  }
  return { items, total: TOP.length };
}
