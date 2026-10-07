// Elevens framsteg: vilka kapitel som är gjorda och resultatet i "Bli radiolog".
// Sparas i webbläsaren och skickas till läraren om eleven är kopplad till en klass (../shared/framsteg.js).
const KEY = 'maskinogat-v1';
const MATERIAL = 'maskinogat';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(patch) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...load(), ...patch })); } catch { /* ingen lagring */ }
  refreshToc();
  report();
}

export function markDone(ch) {
  if (load().done?.[ch]) return;
  save({ done: { ...(load().done || {}), [ch]: true } });
}

export function setRadiologScore(right, max) {
  save({ radiolog: { right, max } });
}

function chapters() {
  return [...document.querySelectorAll('.toc a')].map(a => ({ id: a.getAttribute('href').slice(1), title: a.textContent.trim() }));
}

function refreshToc() {
  const d = load().done || {};
  document.querySelectorAll('.toc a').forEach(a => a.classList.toggle('done', !!d[a.getAttribute('href').slice(1)]));
}

function report() {
  if (!window.Framsteg) return;
  const st = load(), items = {};
  for (const { id } of chapters()) if (st.done?.[id]) items[id] = { s: 'c' };
  if (st.radiolog) items.radiolog = { s: st.radiolog.right === st.radiolog.max ? 'c' : 'v', score: st.radiolog.right, max: st.radiolog.max };
  window.Framsteg.report(MATERIAL, items, {
    id: MATERIAL,
    title: 'Maskinögat',
    url: location.origin + location.pathname,
    items: [...chapters().map(c => ({ ...c, kind: 'chapter' })), { id: 'radiolog', title: 'Bli radiolog (senaste resultat)', kind: 'quiz' }],
  });
}

// Kapitel utan uppgift (läs- och diskussionskapitel) räknas som gjorda när eleven har haft dem framme en stund.
export function markWhenRead(ids, ms = 8000) {
  if (!('IntersectionObserver' in window)) return;
  const timers = {};
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      const id = e.target.id;
      if (e.isIntersecting) timers[id] ??= setTimeout(() => { markDone(id); io.unobserve(e.target); }, ms);
      else { clearTimeout(timers[id]); delete timers[id]; }
    }
  }, { threshold: 0.4 });
  ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
}

export function initProgress() {
  refreshToc();
  report();
  window.Framsteg?.onConnect(report);
}
