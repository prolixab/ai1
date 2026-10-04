// Kapitel 5: sandlådan – eleven ställer in miljön och jämför agenter.
import { SimPanel, Controls, headless, el } from '../sim.js';
import { AGENTS } from '../agents.js';
import { MAPS } from '../world.js';
import { markDone } from '../store.js';

const SWITCHES = [
  { k: 'observable', namn: 'Observerbarhet', opts: [['full', 'Full'], ['partial', 'Delvis']] },
  { k: 'stochastic', namn: 'Slump', opts: [[false, 'Deterministisk'], [true, 'Stokastisk']], hint: 'Hjulen slirar ibland (20 %), sugningen misslyckas ibland (15 %).' },
  { k: 'dynamic', namn: 'Förändring', opts: [[false, 'Statisk'], [true, 'Dynamisk']], hint: 'Ny smuts dyker upp då och då.' },
  { k: 'dog', namn: 'Agenter', opts: [[false, 'En'], [true, 'Flera']], hint: 'Hunden Sixten vill leka, står i vägen och har ibland leriga tassar.' },
  { k: 'battery', namn: 'Batteri', opts: [[false, 'Obegränsat'], [true, 'Begränsat']], hint: '40 steg per laddning. Laddas på den gröna blixten.' },
];

export function init() {
  const cfg = { map: 'lagenhet', observable: 'partial', stochastic: false, dynamic: false, dog: false, battery: false };
  let agent = 'reflex';
  const settings = document.getElementById('k5-settings');
  const panel = new SimPanel(document.getElementById('k5-sim'), { agent, world: { ...cfg }, seed: 11, showKnow: true });
  panel.root.classList.add('solo');
  const controls = new Controls(document.getElementById('k5-ctrl'), [panel], { speed: 10 });
  const apply = () => { controls.pause(); panel.set({ agent, world: { ...cfg } }); describe(); };

  const agentSel = el('select', {}, Object.entries(AGENTS).map(([k, a]) => el('option', { value: k, selected: k === agent }, a.namn)));
  agentSel.addEventListener('change', () => { agent = agentSel.value; apply(); });
  const mapSel = el('select', {}, Object.entries(MAPS).filter(([k]) => k !== 'tvarum').map(([k, m]) => el('option', { value: k }, m.namn)));
  mapSel.addEventListener('change', () => { cfg.map = mapSel.value; apply(); });
  settings.append(
    el('fieldset', {}, el('legend', {}, 'Agent'), agentSel),
    el('fieldset', {}, el('legend', {}, 'Karta'), mapSel));

  const env = el('fieldset', {}, el('legend', {}, 'Miljön'));
  for (const s of SWITCHES) {
    const btns = s.opts.map(([val, txt]) => el('button', { 'aria-pressed': String(cfg[s.k] === val), onclick: () => {
      cfg[s.k] = val; btns.forEach((b, j) => b.setAttribute('aria-pressed', String(s.opts[j][0] === val))); apply();
    } }, txt));
    env.append(el('div', { class: 'switch', title: s.hint || '' }, el('span', {}, s.namn), el('div', { class: 'seg' }, btns)));
  }
  settings.append(env);

  const know = el('input', { type: 'checkbox', checked: true });
  know.addEventListener('change', () => { panel.o.showKnow = know.checked; panel.render(); });
  const plan = el('input', { type: 'checkbox', checked: true });
  plan.addEventListener('change', () => { panel.o.showPlan = plan.checked; panel.render(); });
  settings.append(el('fieldset', {}, el('legend', {}, 'Visa'),
    el('label', {}, know, 'Vad agenten vet (dimma)'), el('label', {}, plan, 'Agentens plan')));

  const desc = document.getElementById('k5-race-desc');
  function describe() {
    const parts = [MAPS[cfg.map].namn.toLowerCase(), cfg.observable === 'full' ? 'fullt observerbar' : 'delvis observerbar',
      cfg.stochastic ? 'stokastisk' : 'deterministisk', cfg.dynamic ? 'dynamisk' : 'statisk', cfg.dog ? 'med hund' : 'en agent', cfg.battery ? 'begränsat batteri' : 'obegränsat batteri'];
    desc.textContent = parts.join(', ');
  }
  describe();

  const bars = document.getElementById('k5-bars');
  document.getElementById('k5-race').addEventListener('click', () => {
    const res = Object.keys(AGENTS).map(k => {
      let p = 0, dead = 0;
      for (let s = 1; s <= 30; s++) { const r = headless(k, cfg, 1000 + s); p += r.perf; dead += r.dead; }
      return { k, perf: p / 30, dead };
    });
    const best = Math.max(...res.map(r => r.perf));
    bars.replaceChildren(el('p', { class: 'small muted' }, `Genomsnittlig prestanda över 30 omgångar à 200 steg (${desc.textContent}).`),
      ...res.map(r => el('div', { class: 'bar' },
        el('span', {}, AGENTS[r.k].namn, r.dead ? el('span', { class: 'warn small' }, ` · batteriet tog slut ${r.dead}/30`) : null),
        el('div', { class: 'track' }, el('div', { class: 'fill', style: `width:${(r.perf * 100).toFixed(1)}%;${r.perf === best ? '' : 'opacity:.55'}` })),
        el('span', { class: 'val' }, `${Math.round(r.perf * 100)} %`))));
    markDone('k5');
  });
}
