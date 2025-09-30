import { clearAll, loadState } from './storage.js';
import { createOrUpdateStore } from './storeModel.js';
import { renderStoreList } from './ui.js';

const storeForm = document.getElementById('storeForm');
const clearAllBtn = document.getElementById('clearAll');
const storeList = document.getElementById('storeList');

function initialLoad(){
  loadState();
  renderStoreList(storeList);
}
initialLoad();

storeForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('storeName').value.trim();
  const email = document.getElementById('storeEmail').value.trim();
  const address = document.getElementById('storeAddress').value.trim();
  const tagline = document.getElementById('storeTagline').value.trim();
  if(!name || !email || !address) return;
  createOrUpdateStore({name,email,address,tagline});
  renderStoreList(storeList);
  storeForm.reset();
  alert('Store saved!');
});

clearAllBtn.addEventListener('click', ()=>{
  if(confirm('Delete ALL demo data?')){
    clearAll();
    renderStoreList(storeList);
  }
});
