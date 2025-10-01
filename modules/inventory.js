// modules/inventory.js
import { Storage } from './storage.js';
import { newItem, newAnnouncement, CATEGORIES } from './storeModel.js';
import { el, clear, money } from './ui.js';
import { compressImageFile } from './image.js';

const activeStoreBox = document.getElementById('activeStore');
const switchBtn = document.getElementById('switchStore');

const itemForm = document.getElementById('itemForm');
const itemsGrid = document.getElementById('itemsGrid');
const clearItemsBtn = document.getElementById('clearItems');

const announceForm = document.getElementById('announceForm');
const announceList = document.getElementById('announceList');

const itemPhotoInput = document.getElementById('itemPhoto');
const photoPreviewWrap = document.getElementById('photoPreviewWrap');
const photoPreview = document.getElementById('photoPreview');

let pendingPhoto = ''; // Data URL

function getDb(){ return Storage.read(); }
function writeDb(db){ return Storage.write(db); }
function getActiveStore(){
  const db = getDb();
  return db.stores.find(s => s.id === db.activeStoreId) || null;
}

function renderActiveStore(){
  const store = getActiveStore();
  clear(activeStoreBox);
  if (!store) { activeStoreBox.appendChild(el('p', { class:'muted', text:'No active store. Use "Switch Store".' })); return; }
  const locs = [store.address, ...(store.locations||[])];
  activeStoreBox.appendChild(el('div', {}, [
    el('h3', { text: store.name }),
    el('p', { class:'muted', text: `${store.storeType} • ${store.email}` }),
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
  renderActiveStore(); renderItems(); renderAnnounces();
});

// camera/upload preview
itemPhotoInput?.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  pendingPhoto = '';
  if (!file) { photoPreviewWrap?.classList.add('hidden'); return; }
  if (file.size > 12 * 1024 * 1024) { alert('Image too large (12MB max).'); itemPhotoInput.value=''; return; }
  try {
    pendingPhoto = await compressImageFile(file, { maxW: 1000, maxH: 1000, quality: 0.82 });
    if (photoPreview) photoPreview.src = pendingPhoto;
    photoPreviewWrap?.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('Could not read image. Try a JPG/PNG.');
    itemPhotoInput.value=''; photoPreviewWrap?.classList.add('hidden');
  }
});

itemForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const store = getActiveStore(); if (!store) return alert('Choose a store first.');

  const title = document.getElementById('itemTitle')?.value.trim();
  const price = Number(document.getElementById('itemPrice')?.value);
  const category = document.getElementById('itemCategory')?.value;
  const desc = document.getElementById('itemDesc')?.value.trim();
  if (!title || !Number.isFinite(price) || !category) return alert('Please complete required fields.');

  const tags = Array.from(itemForm.querySelectorAll('input[name="itemTags"]:checked')).map(i => i.value);

  const db = getDb();
  const arr = db.itemsByStore[store.id] || [];
  arr.push(newItem({
    storeId: store.id,
    title, price, category,
    image: pendingPhoto || '',
    desc, tags
  }));
  db.itemsByStore[store.id] = arr;
  writeDb(db);

  itemForm.reset();
  pendingPhoto = '';
  photoPreviewWrap?.classList.add('hidden');

  renderItems();
});

clearItemsBtn?.addEventListener('click', () => {
  const store = getActiveStore(); if (!store) return alert('Choose a store first.');
  if (!confirm('Remove ALL items for this store?')) return;
  const db = getDb(); db.itemsByStore[store.id] = []; writeDb(db); renderItems();
});

function renderItems(){
  const store = getActiveStore(); clear(itemsGrid); if (!store) return;
  const db = getDb(); const items = db.itemsByStore[store.id] || [];
  if (!items.length) { itemsGrid.appendChild(el('p',{class:'muted',text:'No items yet.'})); return; }

  const byCat = Object.fromEntries(CATEGORIES.map(c => [c, []]));
  for (const it of items) byCat[it.category]?.push(it);

  for (const cat of CATEGORIES) {
    const catItems = byCat[cat]; if (!catItems.length) continue;
    itemsGrid.appendChild(el('h3',{text:cat[0].toUpperCase()+cat.slice(1)}));
    for (const it of catItems) {
      itemsGrid.appendChild(el('div',{class:'cardItem'},[
        el('img',{src: it.image || 'https://dummyimage.com/1200x800&text=No+Image', alt: it.title}),
        el('div',{class:'pad'},[
          el('strong',{text:it.title}),
          el('div',{class:'muted',text: `${money(it.price)} • ${it.category}`}),
          it.tags?.length ? el('div',{}, it.tags.map(t => el('span',{class:'pill',text:t}))) : null,
          it.desc ? el('p',{text:it.desc}) : null
        ])
      ]));
    }
  }
}

announceForm?.addEventListener('submit', e => {
  e.preventDefault();
  const store = getActiveStore(); if (!store) return alert('Choose a store first.');
  const type = document.getElementById('announceType')?.value;
  const title = document.getElementById('announceTitle')?.value.trim();
  const body = document.getElementById('announceBody')?.value.trim();
  if (!type || !title) return alert('Pick a type and add a headline.');
  const db = getDb();
  const arr = db.announcesByStore[store.id] || [];
  arr.push(newAnnouncement({ storeId: store.id, type, title, body }));
  db.announcesByStore[store.id] = arr; writeDb(db);
  announceForm.reset(); renderAnnounces();
});

function renderAnnounces(){
  clear(announceList);
  const store = getActiveStore(); if (!store) return;
  const db = getDb(); const arr = db.announcesByStore[store.id] || [];
  if (!arr.length) { announceList.appendChild(el('li',{class:'muted',text:'No announcements yet.'})); return; }
  for (const a of arr.slice().reverse()) {
    announceList.appendChild(el('li',{},[
      el('strong',{text:a.type.toUpperCase()+': '}),
      el('span',{text:a.title}),
      a.body ? el('span',{class:'muted',text:' — '+a.body}) : null
    ]));
  }
}

// boot
renderActiveStore();
renderItems();
renderAnnounces();
