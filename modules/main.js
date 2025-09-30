import { loadState } from './storage.js';
import { createOrUpdateStore, listStores } from './storeModel.js';

console.log('boot ok');
const state = loadState();

// create a demo store 
if(listStores().length === 0){
  createOrUpdateStore({
    name: 'Jada Boutique',
    email: 'owner@demo.com',
    address: '123 Main St, New York, NY',
    tagline: 'Curated looks'
  });
  console.log('demo store created');
} else {
  console.log('store(s) already present');
}
console.log('stores:', listStores());
