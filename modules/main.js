// modules/main.js
import { Storage } from './storage.js';
import { newStore, updateStore } from './storeModel.js';
import { el, clear } from './ui.js';
import asos, { fetchAsosLatest } from './asos.js';

const splash = document.getElementById('splash');
const createStoreCard = document.getElementById('createStoreCard');
const homeFeedCard = document.getElementById('homeFeedCard');

const storeForm = document.getElementById('storeForm');
const addLocationBtn = document.getElementById('addLocationBtn');
const locationInput = document.getElementById('storeExtraLocation');
const locationList = document.getElementById('locationList');

const createSuccess = document.getElementById('createSuccess');
const toast = document.getElementById('toast');

const storeList = document.getElementById('storeList');
const homeInventory = document.getElementById('homeInventory');
const asosFeed = document.getElementById('asosFeed');

let tempLocations = [];

function showToast(msg){
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 2000);
}

async function renderAsosFeed() {
  if (!asosFeed) return;
  clear(asosFeed);
  asosFeed.appendChild(el('div', { class:'list' }, [
    el('div', { class:'list-item' }, [el('span', { class:'muted', text:'Loading ASOS…' })])
  ]));

  try {
    const items = await fetchAsosLatest({ limit: 12 });
    clear(asosFeed);
    items.forEach(it => {
      asosFeed.appendChild(
        el('div', { class: 'cardItem' }, [
          el('img', { src: it.image || 'https://dummyimage.com/1200x800&text=ASOS', alt: it.title }),
          el('div', { class: 'pad' }, [
            el('strong', { text: it.title }),
            el('div', { class: 'muted', text: `${it.brand}${it.price ? ' • $' + Number(it.price).toFixed(2) : ''}` }),
            el('div', { class: 'muted', text: it.when })
          ])
        ])
      );
    });
  } catch (e) {
    console.error('ASOS feed error:', e);
    clear(asosFeed);
    ['ASOS unavailable. Showing stub.', 'ASOS — New Sneaker Drop', 'ASOS — Streetwear Capsule'].forEach((txt, i) => {
      asosFeed.appendChild(el('div', { class: 'cardItem' }, [
        el('img', { src: 'https://dummyimage.com/1200x800&text=ASOS', alt: txt }),
        el('div', { class: 'pad' }, [
          el('strong', { text: txt }),
          i ? el('div', { class: 'muted', text: 'ASOS • $' + (i===1?99:79) }) : null
        ])
      ]));
    });
  }
}

function renderHome(){
  if (!storeList || !homeInventory) return;
  clear(storeList); clear(homeInventory);
  const db = Storage.read();
  // stores
  db.stores.forEach(store => {
    const li = el('li',{},[
      el('div',{},[
        el('strong',{text:store.name}),
        ' — ',
        el('span',{class:'muted',text:store.storeType})
      ]),
      el('div',{class:'muted',text:`HQ: ${store.address}`}),
      el('button',{class:'btn secondary', onClick:()=>{Storage.setActiveStore(store.id); window.location.href='./inventory.html';}},['Open Inventory'])
    ]);
    storeList.appendChild(li);
  });
  // recent items
  for (const [sid, items] of Object.entries(db.itemsByStore || {})) {
    (items||[]).slice(-6).forEach(it => {
      homeInventory.appendChild(
        el('div',{class:'cardItem'},[
          el('img',{src:it.image || 'https://dummyimage.com/1200x800&text=No+Image', alt:it.title}),
          el('div',{class:'pad'},[
            el('strong',{text:it.title}),
            el('div',{class:'muted',text:`$${Number(it.price).toFixed(2)} (${it.category})`})
          ])
        ])
      );
    });
  }
}

// locations
addLocationBtn?.addEventListener('click', ()=>{
  const val = (locationInput?.value || '').trim(); if (!val) return;
  tempLocations.push(val); locationInput.value=''; clear(locationList);
  tempLocations.forEach((addr,idx)=> {
    locationList.appendChild(el('li',{class:'pill'},[
      addr,
      el('button',{class:'btn secondary', onClick:()=>{tempLocations.splice(idx,1); locationList.children[idx]?.remove();}},['×'])
    ]));
  });
});

// create store
storeForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('storeName')?.value.trim();
  const email = document.getElementById('storeEmail')?.value.trim();
  const address = document.getElementById('storeAddress')?.value.trim();
  const tagline = document.getElementById('storeTagline')?.value.trim();
  const storeType = storeForm.querySelector('input[name="storeType"]:checked')?.value || 'mid-range';

  if (!name || !email || !address) { alert('Fill Store Name, Email, and HQ.'); return; }

  const db = Storage.read();
  const idx = db.stores.findIndex(s => s.name===name && s.email===email);
  if (idx>=0) db.stores[idx] = updateStore(db.stores[idx], { address, tagline, storeType, locations: tempLocations });
  else db.stores.push(newStore({ name, email, address, tagline, storeType, locations: tempLocations }));

  Storage.write(db);

  const saved = Storage.read();
  const activeId = saved.stores.find(s=>s.name===name && s.email===email)?.id || null;
  if (activeId) Storage.setActiveStore(activeId);

  createSuccess?.classList.remove('hidden');
  showToast('✅ Store created!');
  homeFeedCard?.classList.remove('hidden');
  homeFeedCard?.setAttribute('data-state','visible');

  renderAsosFeed();
  renderHome();

  storeForm.reset();
  tempLocations = [];
  locationList.innerHTML = '';
});

// initial
document.addEventListener('DOMContentLoaded', ()=>{
  document.body.classList.remove('loading');
  setTimeout(()=>{
    splash?.setAttribute('data-state','hidden');
    createStoreCard?.classList.remove('hidden');
    createStoreCard?.setAttribute('data-state','visible');
  },3000);
  renderAsosFeed();
  renderHome();
});
