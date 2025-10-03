const FMP_BASE = 'https://financialmodelingprep.com/api/v3';
const API_KEY = 'demo'; // public demo key for teaching; OK in client

async function safeFetch(url, { signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: signal ?? controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getQuote(symbol) {
  const url = `${FMP_BASE}/quote/${encodeURIComponent(symbol)}?apikey=${API_KEY}`;
  const [data] = await safeFetch(url);
  if (!data) throw new Error('No data');
  return {
    symbol: data.symbol,
    name: data.name ?? data.symbol,
    price: data.price,
    change: data.change,
    changesPercentage: data.changesPercentage,
    marketCap: data.marketCap,
    volume: data.volume,
  };
}

const TOP = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','NFLX','KO','PEP','DIS','INTC','ORCL','CSCO'];

export async function getTopPage(page = 1, size = 5) {
  const start = (page - 1) * size;
  const symbols = TOP.slice(start, start + size);
  const url = `${FMP_BASE}/quote/${symbols.join(',')}?apikey=${API_KEY}`;
  const data = await safeFetch(url);
  return {
    items: data.map(d => ({
      symbol: d.symbol,
      name: d.name ?? d.symbol,
      price: d.price,
      changesPercentage: d.changesPercentage,
      marketCap: d.marketCap,
      volume: d.volume,
    })),
    total: TOP.length,
  };
}
