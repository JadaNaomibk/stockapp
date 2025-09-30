import { listStores } from './storeModel.js';

export function renderStoreList(listEl){
  listEl.textContent = '';
  const stores = listStores();
  for(const s of stores){
    const li = document.createElement('li');
    li.textContent = `${s.name} — ${s.address}`;
    listEl.appendChild(li);
  }
}
