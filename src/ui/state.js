// src/ui/state.js
export const state = {
  page: 1,
  pageSize: 5,
  loading: false,
  lastSearch: '',
  inflight: new Set(), // prevent overlapping operations for the same key
};

export function setLoading(v) { state.loading = v; }
