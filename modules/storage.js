// modules/storage.js
const STORAGE_KEY = 'fashionapi_v1';

function getDefaultDB() {
  return {
    stores: [],
    itemsByStore: {},
    announcesByStore: {},
    activeStoreId: null
  };
}

function loadDB() {
  const text = localStorage.getItem(STORAGE_KEY);
  if (!text) return getDefaultDB();
  try {
    const db = JSON.parse(text);
    if (!Array.isArray(db.stores)) db.stores = [];
    if (typeof db.itemsByStore !== 'object' || db.itemsByStore === null) db.itemsByStore = {};
    if (typeof db.announcesByStore !== 'object' || db.announcesByStore === null) db.announcesByStore = {};
    if (db.activeStoreId !== null && typeof db.activeStoreId !== 'string') db.activeStoreId = null;
    return db;
  } catch {
    return getDefaultDB();
  }
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
}

export const Storage = {
  read() { return loadDB(); },
  write(db) { return saveDB(db); },
  clear() { localStorage.removeItem(STORAGE_KEY); },
  setActiveStore(storeId) {
    const db = loadDB();
    db.activeStoreId = (typeof storeId === 'string') ? storeId : null;
    saveDB(db);
  },
  getActiveStoreId() { return loadDB().activeStoreId; }
};
