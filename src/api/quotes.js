// src/api/quotes.js — Yahoo Finance via RapidAPI
import { RAPID } from '../config.js';

const Y_BASE = 'https://68dfea7893207c4b47932686.mockapi.io/api/v1';

async function yFetch(path, params = {}) {
  const url = new URL(Y_BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    headers: {
      'X-RapidAPI-Key': RAPID.KEY,
      'X-RapidAPI-Host': RAPID.HOST
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// GET a single quote by exact symbol
export async function getQuote(symbol) {
  const data = await yFetch('/market/v2/get-quotes', { region: 'US', symbols: symbol });
  const q = data?.quoteResponse?.result?.[0];
  if (!q) throw new Error('No data');
  return {
    symbol: q.symbol,
    name: q.shortName ?? q.longName ?? q.symbol,
    price: q.regularMarketPrice,
    change: q.regularMarketChange,
    changesPercentage: q.regularMarketChangePercent, // already percent
    marketCap: q.marketCap,
    volume: q.regularMarketVolume
  };
}

// Curated list for pagination (still fine with Yahoo)
const TOP = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','NFLX','KO','PEP','DIS','INTC','ORCL','CSCO'];

export async function getTopPage(page = 1, size = 5) {
  const start = (page - 1) * size;
  const symbols = TOP.slice(start, start + size);
  const data = await yFetch('/market/v2/get-quotes', { region: 'US', symbols: symbols.join(',') });
  const list = data?.quoteResponse?.result ?? [];
  return {
    items: list.map(q => ({
      symbol: q.symbol,
      name: q.shortName ?? q.longName ?? q.symbol,
      price: q.regularMarketPrice,
      changesPercentage: q.regularMarketChangePercent,
      marketCap: q.marketCap,
      volume: q.regularMarketVolume
    })),
    total: TOP.length
  };
}
