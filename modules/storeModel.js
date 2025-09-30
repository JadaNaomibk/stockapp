import { loadState, saveState } from './storage.js';

export function createOrUpdateStore({name,email,address,tagline}){
  const state = loadState();
  const existing = state.stores.find(s => s.name.toLowerCase() === String(name).toLowerCase());
  const rec = { id: existing? existing.id : Date.now(), name:String(name), email:String(email), address:String(address), tagline:String(tagline||'') };
  if(existing){ state.stores[state.stores.findIndex(s=>s.id===existing.id)] = rec; } else { state.stores.push(rec); }
  saveState(state); return rec;
}
export function listStores(){ const s = loadState().stores; return [...s].sort((a,b)=>a.name.localeCompare(b.name)); }
export function addItem({storeId,productName,price,tags,filesMeta}){
  const state = loadState();
  const item = { id: Date.now(), storeId, productName:String(productName), price:Number(price), tags:String(tags||''), photos:Array.isArray(filesMeta)?filesMeta:[] };
  state.items.push(item); saveState(state); return item;
}
export function listItemsByStore(storeId){ return loadState().items.filter(i=>i.storeId===storeId); }
export function postSale({storeId,note}){ const st=loadState(); const sale={id:Date.now(),storeId,note:String(note||''),ts:new Date().toISOString()}; st.sales.unshift(sale); saveState(st); return sale; }
export function listSales(){ return loadState().sales; }
