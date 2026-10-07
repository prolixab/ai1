// Elevens framsteg sparas i webbläsaren. Fungerar sidan utan lagring gör inget – då sparas bara inget.
// Är eleven kopplad till en klass (../shared/framsteg.js) skickas framstegen också till läraren.
const KEY = 'agenter-v1';
const MATERIAL = 'agenter-och-miljoer';

export function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function save(patch) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...load(), ...patch })); } catch { /* ingen lagring */ }
  report();
}
export function markDone(ch) {
  save({ done: { ...(load().done || {}), [ch]: true } });
  refreshToc();
}
export function refreshToc() {
  const d = load().done || {};
  document.querySelectorAll('.toc a').forEach(a => a.classList.toggle('done', !!d[a.getAttribute('href').slice(1)]));
}

function chapters() {
  return [...document.querySelectorAll('.toc a')].map(a => ({ id: a.getAttribute('href').slice(1), title: a.textContent.trim() }));
}

export function report() {
  if (!window.Framsteg) return;
  const st = load(), items = {};
  for (const { id } of chapters()) if (st.done?.[id]) items[id] = { s: 'c' };
  const q = st.quizScore;
  if (q?.n) items.quiz = { s: q.n === q.max ? 'c' : 'v', score: q.right, max: q.max };
  window.Framsteg.report(MATERIAL, items, {
    id: MATERIAL,
    title: 'Agenter och miljöer',
    url: location.origin + location.pathname,
    items: [...chapters().map(c => ({ ...c, kind: 'chapter' })), { id: 'quiz', title: 'Självtestet (poäng)', kind: 'quiz' }],
  });
}
