const KEY = 'fashion_api_app_v1';
export function loadState(){
  const raw = localStorage.getItem(KEY);
  if(!raw) return {stores:[],items:[],sales:[]};
  try{
    const parsed = JSON.parse(raw);
    return {
      stores: Array.isArray(parsed.stores)?parsed.stores:[],
      items: Array.isArray(parsed.items)?parsed.items:[],
      sales: Array.isArray(parsed.sales)?parsed.sales:[]
    };
  }catch{ return {stores:[],items:[],sales:[]}; }
}
export function saveState(state){
  const clean = {
    stores: Array.isArray(state.stores)?state.stores:[],
    items: Array.isArray(state.items)?state.items:[],
    sales: Array.isArray(state.sales)?state.sales:[]
  };
  localStorage.setItem(KEY, JSON.stringify(clean));
}
export function clearAll(){ localStorage.removeItem(KEY); }
