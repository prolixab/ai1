// Elevens framsteg sparas i webbläsaren. Fungerar sidan utan lagring gör inget – då sparas bara inget.
const KEY = 'agenter-v1';

export function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function save(patch) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...load(), ...patch })); } catch { /* ingen lagring */ }
}
export function markDone(ch) {
  save({ done: { ...(load().done || {}), [ch]: true } });
  refreshToc();
}
export function refreshToc() {
  const d = load().done || {};
  document.querySelectorAll('.toc a').forEach(a => a.classList.toggle('done', !!d[a.getAttribute('href').slice(1)]));
}
