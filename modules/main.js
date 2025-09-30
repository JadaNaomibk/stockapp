import { loadState, saveState, clearAll } from './storage.js';

console.log('boot ok');
// prime storage
const state = loadState();
saveState(state);
console.log('storage ready', state);
