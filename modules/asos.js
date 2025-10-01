// modules/asos.js
// Minimal ASOS client for RapidAPI (beginner-friendly)

const RAPIDAPI_BASE = 'https://asos2.p.rapidapi.com';   // adjust if your plan uses a different host
const RAPIDAPI_HOST = 'asos2.p.rapidapi.com';
const RAPIDAPI_KEY  = <script type="module" src="./modules/main.js"></script>
 || ''; // dev only (inject in index.html)

const CACHE_KEY = 'fashionapi_asos_cache_v1';
const CACHE_TTL = 5 * 60 * 1000;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { t, data } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}
function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch {}
}

function stubItems() {
  return [
    { title: 'ASOS — New Sneaker Drop', image: '', price: 99, brand: 'ASOS', when: 'Today' },
    { title: 'ASOS — Streetwear Capsule', image: '', price: 79, brand: 'ASOS', when: 'Today' }
  ];
}

function normalize(raw = []) {
  return raw.slice(0, 12).map(it => {
    const title = (it && (it.name || it.title || it.productTitle)) || 'ASOS Item';
    const image = (it && (it.imageUrl || it?.image?.url || it?.media?.images?.[0]?.url)) || '';
    const price = it && it.price && (it.price.current?.value ?? it.price.value ?? it.price);
    const brand = (it && (it.brand?.name || it.brandName || it.brand)) || 'ASOS';
    return { title: String(title), image: String(image || ''), price: price == null ? null : Number(price), brand: String(brand), when: 'Just now' };
  });
}

/** Fetch “latest” products. Adjust endpoint/params to your subscription docs. */
export async function fetchAsosLatest({ limit = 12 } = {}) {
  const cached = readCache();
  if (cached) return cached;
  if (!RAPIDAPI_KEY) return stubItems();

  const url = new URL(RAPIDAPI_BASE + '/products/v2/list');
  url.searchParams.set('store', 'US');
  url.searchParams.set('offset', '0');
  url.searchParams.set('categoryId', '4209'); // example: mens t-shirts
  url.searchParams.set('limit', String(limit));

  let res;
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
  } catch (e) {
    console.error('[ASOS] network/CORS error:', e);
    return stubItems();
  }

  if (!res.ok) {
    console.warn('[ASOS] non-OK status', res.status);
    return stubItems();
  }

  let data;
  try { data = await res.json(); }
  catch (e) { console.error('[ASOS] JSON parse failed:', e); return stubItems(); }

  const items = normalize(data?.products || data?.items || []);
  writeCache(items);
  return items;
}

// Also default-export for flexibility
const asos = { fetchAsosLatest };
export default asos;
export const __ASOS_READY__ = true;
