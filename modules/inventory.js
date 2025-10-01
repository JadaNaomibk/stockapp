// modules/inventory.js
import { Storage } from './storage.js';
import { newItem, newAnnouncement, CATEGORIES } from './storeModel.js';
import { el, clear, money } from './ui.js';

const activeStoreBox = document.getElementById('activeStore');
const switchBtn = document.getElementById('switchStore');

const itemForm = document.getElementById('itemForm');
const itemsGrid = document.getElementById('itemsGrid');
const clearItemsBtn = document.getElementById('clearItems');

const announceForm = document.getElementById('announceForm');
const announceList = document.getElementById('announceList');

function getDb() { return Storage.read(); }
function writeDb(db) { return Storage.write(db); }

function getActiveStore() {
  const db = getDb();
  return db.stores.find(s => s.id === db.activeStoreId) || null;
}

function renderActiveStore() {
  const store = getActiveStore();
  clear(activeStoreBox);
  if (!store) {
    activeStoreBox.appendChild(el('p', { class: 'sub', text: 'No active store. Use "Switch Store".' }));
    return;
  }
  const tagsText = store.tags.length ? store.tags.join(', ') : 'untagged';
  const locs = [store.address, ...store.locations];
  activeStoreBox.appendChild(el('div', {}, [
    el('h3', { text: store.name }),
    el('p', { class: 'sub', text: `${tagsText} • ${store.email}` }),
    el('ul', {}, locs.map(a => el('li', { text: a })))
  ]));
}

switchBtn?.addEventListener('click', () => {
  const db = getDb();
  const name = prompt('Switch to which store? Enter exact name:');
  if (!name) return;
  const found = db.stores.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (!found) return alert('Store not found.');
  Storage.setActiveStore(found.id);
  renderActiveStore();
  renderItems();
  renderAnnounces();
});

itemForm?.addEventListener('submit', e => {
  e.preventDefault();
  const store = getActiveStore();
  if (!store) return alert('Choose a store first.');

  const title = document.getElementById('itemTitle')?.value.trim();
  const price = Number(document.getElementById('itemPrice')?.value);
  const category = document.getElementById('itemCategory')?.value;
  const image = document.getElementById('itemImage')?.value.trim();
  const desc = document.getElementById('itemDesc')?.value.trim();

  if (!title || !Number.isFinite(price) || !category) return alert('Please complete required fields.');

  const db = getDb();
  const items = db.itemsByStore[store.id] || [];
  items.push(newItem({ storeId: store.id, title, price, category, image, desc }));
  db.itemsByStore[store.id] = items;
  writeDb(db);

  itemForm.reset();
  renderItems();
});

clearItemsBtn?.addEventListener('click', () => {
  const store = getActiveStore();
  if (!store) return alert('Choose a store first.');
  if (!confirm('Remove ALL items for this store?')) return;
  const db = getDb();
  db.itemsByStore[store.id] = [];
  writeDb(db);
  renderItems();
});

function renderItems() {
  const store = getActiveStore();
  clear(itemsGrid);
  if (!store) return;

  const db = getDb();
  const items = (db.itemsByStore[store.id] || []);
  if (!items.length) {
    itemsGrid.appendChild(el('p', { class: 'sub', text: 'No items yet.' }));
    return;
  }

  const byCat = Object.fromEntries(CATEGORIES.map(c => [c, []]));
  for (const it of items) byCat[it.category]?.push(it);

  for (const cat of CATEGORIES) {
    const catItems = byCat[cat];
    if (!catItems.length) continue;
    itemsGrid.appendChild(el('h3', { text: cat[0].toUpperCase() + cat.slice(1) }));
    for (const it of catItems) {
      itemsGrid.appendChild(
        el('div', { class: 'cardItem' }, [
          el('img', { src: it.image || 'https://dummyimage.com/640x360&text=No+Image', alt: it.title }),
          el('div', { class: 'pad' }, [
            el('strong', { text: it.title }),
            el('div', { class: 'sub', text: money(it.price) }),
            it.desc ? el('p', { text: it.desc }) : null
          ])
        ])
      );
    }
  }
}

announceForm?.addEventListener('submit', e => {
  e.preventDefault();
  const store = getActiveStore();
  if (!store) return alert('Choose a store first.');
  const type = document.getElementById('announceType')?.value;
  const title = document.getElementById('announceTitle')?.value.trim();
  const body = document.getElementById('announceBody')?.value.trim();
  if (!type || !title) return alert('Pick a type and add a headline.');

  const db = getDb();
  const arr = db.announcesByStore[store.id] || [];
  arr.push(newAnnouncement({ storeId: store.id, type, title, body }));
  db.announcesByStore[store.id] = arr;
  writeDb(db);
  announceForm.reset();
  renderAnnounces();
});

function renderAnnounces() {
  clear(announceList);
  const store = getActiveStore();
  if (!store) return;
  const db = getDb();
  const arr = db.announcesByStore[store.id] || [];
  if (!arr.length) {
    announceList.appendChild(el('li', { class: 'sub', text: 'No announcements yet.' }));
    return;
  }
  for (const a of arr.slice().reverse()) {
    announceList.appendChild(el('li', {}, [
      el('strong', { text: a.type.toUpperCase() + ': ' }),
      el('span', { text: a.title }),
      a.body ? el('span', { class: 'sub', text: ' — ' + a.body }) : null
    ]));
  }
}

// boot
renderActiveStore();
renderItems();
renderAnnounces();
