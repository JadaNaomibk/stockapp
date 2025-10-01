// modules/storeModel.js
export function uuid() {
  if (window.crypto?.getRandomValues) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  let t = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = (t + Math.random() * 16) % 16 | 0; t = Math.floor(t/16);
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function newStore({ name, email, address, tagline = '', storeType = 'mid-range', locations = [] }) {
  const id = uuid();
  const t = new Date().toISOString();
  return {
    id,
    name: String(name || '').trim(),
    email: String(email || '').trim(),
    address: String(address || '').trim(),
    tagline: String(tagline || ''),
    storeType: String(storeType || 'mid-range'),
    locations: Array.isArray(locations) ? locations : [],
    createdAt: t, updatedAt: t
  };
}

export function updateStore(oldStore, patch) {
  return { ...oldStore, ...patch, updatedAt: new Date().toISOString() };
}

export const CATEGORIES = ['womens','mens','home','accessories','sale'];
export const ITEM_TAGS = ['shirt','bottom','outerwear','dress','shoes','accessories','kids','home','streetwear'];

export function newItem({ storeId, title, price, category, image = '', desc = '', tags = [] }) {
  if (!CATEGORIES.includes(category)) throw new Error('Invalid category');
  const id = uuid();
  return {
    id, storeId,
    title: String(title || '').trim(),
    price: Number(price),
    category,
    image: String(image || ''),
    desc: String(desc || ''),
    tags: Array.from(new Set(tags.filter(Boolean).map(String))),
    createdAt: new Date().toISOString()
  };
}

export function newAnnouncement({ storeId, type, title, body = '' }) {
  if (!['drop','sale','event'].includes(type)) throw new Error('Invalid announcement type');
  return {
    id: uuid(), storeId, type,
    title: String(title || '').trim(),
    body: String(body || ''),
    createdAt: new Date().toISOString()
  };
}
