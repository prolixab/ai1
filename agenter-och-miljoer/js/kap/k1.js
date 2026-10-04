// Kapitel 1: agentloopen i en värld med två rutor, och "Är det en agent?"
import { World, ACTION_NAMES } from '../world.js';
import { WorldView } from '../render.js';
import { el } from '../sim.js';
import { markDone } from '../store.js';

const TABLE = [
  { room: 'A', dirty: false, a: 'E' },
  { room: 'A', dirty: true, a: 'SUG' },
  { room: 'B', dirty: false, a: 'W' },
  { room: 'B', dirty: true, a: 'SUG' },
];

const LOOP_SVG = `
<svg viewBox="0 0 420 300" role="img" aria-label="Agentloopen: miljö, sensorer, agentprogram, ställdon">
  <defs><marker id="k1ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="ah"/></marker>
  <marker id="k1ah-on" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="ah on"/></marker></defs>
  <rect x="200" y="8" width="212" height="284" rx="14" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="6 5"/>
  <text x="396" y="285" text-anchor="end" style="font:700 13px system-ui;fill:var(--muted)">AGENT</text>
  <g class="node" data-n="env"><rect x="8" y="100" width="130" height="100" rx="10"/><text x="73" y="146" text-anchor="middle">Miljö</text><text class="sub" x="73" y="166" text-anchor="middle">rutorna A och B</text></g>
  <g class="node" data-n="sens"><rect x="226" y="30" width="168" height="62" rx="10"/><text x="310" y="57" text-anchor="middle">Sensorer</text><text class="sub" x="310" y="77" text-anchor="middle">position, smutssensor</text></g>
  <g class="node" data-n="prog"><rect x="226" y="119" width="168" height="62" rx="10"/><text x="310" y="146" text-anchor="middle">Agentprogram</text><text class="sub" x="310" y="166" text-anchor="middle">tabellen</text></g>
  <g class="node" data-n="act"><rect x="226" y="208" width="168" height="62" rx="10"/><text x="310" y="235" text-anchor="middle">Ställdon</text><text class="sub" x="310" y="255" text-anchor="middle">hjul, sugmotor</text></g>
  <path class="arrow" data-a="percept" d="M73 100 V61 H220" marker-end="url(#k1ah)"/>
  <path class="arrow" data-a="s2p" d="M310 92 V113" marker-end="url(#k1ah)"/>
  <path class="arrow" data-a="p2a" d="M310 181 V202" marker-end="url(#k1ah)"/>
  <path class="arrow" data-a="action" d="M226 239 H73 V206" marker-end="url(#k1ah)"/>
  <text x="150" y="52" text-anchor="middle" style="font:italic 13px system-ui;fill:var(--muted)">percept</text>
  <text x="150" y="258" text-anchor="middle" style="font:italic 13px system-ui;fill:var(--muted)">handling</text>
</svg>`;

const ITEMS = [
  { n: 'Termostat', a: 'ja', fb: 'Ja. Sensor: termometer. Handling: slå på eller av värmen. En enkel reflexagent.' },
  { n: 'Sten', a: 'nej', fb: 'Nej. Den har inga sensorer och väljer aldrig någon handling.' },
  { n: 'Spamfilter', a: 'ja', fb: 'Ja. Percept: ett inkommande mejl. Handling: lägg det i inkorgen eller i skräpposten.' },
  { n: 'Självkörande bil', a: 'ja', fb: 'Ja. Kameror och radar är sensorer, ratt, gas och broms är ställdon.' },
  { n: 'Miniräknare', a: 'diskutabel', fb: 'Diskutabelt. Den tar emot indata och ger utdata, men påverkar ingen omgivning och strävar inte mot något mål. De flesta kallar den ett program snarare än en agent.' },
  { n: 'Du själv', a: 'ja', fb: 'Ja! Ögon och öron är sensorer, händer och röst är ställdon. Människor är agenter.' },
  { n: 'Utskriven karta', a: 'nej', fb: 'Nej. Den innehåller information men uppfattar ingenting och gör ingenting.' },
  { n: 'Schackprogram', a: 'ja', fb: 'Ja. Percept: motståndarens drag. Handling: nästa drag. Miljön är schackbrädet.' },
];

export function init() {
  const loop = document.getElementById('k1-loop');
  loop.innerHTML = LOOP_SVG;
  const canvas = document.getElementById('k1-canvas');
  const view = new WorldView(canvas);
  const world = new World({ map: 'tvarum', seed: 3, dirtFrac: 1 });
  world.setDirt(0, 0, 1); world.setDirt(1, 0, 1);
  const labels = { [world.idx(0, 0)]: 'A', [world.idx(1, 0)]: 'B' };
  const tbody = document.querySelector('#k1-table tbody');
  TABLE.forEach(r => tbody.append(el('tr', {}, el('td', {}, `[${r.room}, ${r.dirty ? 'Smutsig' : 'Ren'}]`), el('td', {}, ACTION_NAMES[r.a]))));
  const phaseEl = document.getElementById('k1-phase');

  let phase = -1, percept = null, row = -1, steps = 0;
  const room = () => (world.bot.x === 0 ? 'A' : 'B');

  function highlight(nodes, arrows) {
    loop.querySelectorAll('.node').forEach(n => n.classList.toggle('on', nodes.includes(n.dataset.n)));
    loop.querySelectorAll('.arrow').forEach(a => {
      const on = arrows.includes(a.dataset.a);
      a.classList.toggle('on', on);
      a.setAttribute('marker-end', on ? 'url(#k1ah-on)' : 'url(#k1ah)');
    });
    [...tbody.rows].forEach((tr, i) => tr.classList.toggle('on', i === row && nodes.includes('prog')));
  }
  const draw = () => view.draw(world, { labels, noCharger: true, pulse: phase === 2 && TABLE[row]?.a === 'SUG' });

  function next() {
    phase = (phase + 1) % 3;
    if (phase === 0) {
      percept = { room: room(), dirty: world.isDirty(world.bot.x, world.bot.y) };
      row = TABLE.findIndex(r => r.room === percept.room && r.dirty === percept.dirty);
      highlight(['sens'], ['percept']);
      phaseEl.innerHTML = `<b>1. Uppfatta.</b> Sensorerna läser av miljön. Perceptet är <b>[${percept.room}, ${percept.dirty ? 'Smutsig' : 'Ren'}]</b>.`;
    } else if (phase === 1) {
      highlight(['prog'], ['s2p']);
      phaseEl.innerHTML = `<b>2. Bestämma.</b> Agentprogrammet slår upp perceptet i tabellen och hittar handlingen <b>${ACTION_NAMES[TABLE[row].a]}</b>.`;
    } else {
      world.step(TABLE[row].a);
      steps++;
      highlight(['act', 'env'], ['p2a', 'action']);
      const both = !world.isDirty(0, 0) && !world.isDirty(1, 0);
      phaseEl.innerHTML = `<b>3. Handla.</b> Ställdonen utför <b>${ACTION_NAMES[TABLE[row].a].toLowerCase()}</b> och miljön ändras. Sedan börjar loopen om.` +
        (both && steps > 4 ? ' <span class="muted">Lägg märke till att roboten fortsätter åka fram och tillbaka fast allt är rent – den har inget minne och vet inte att den är klar.</span>' : '');
      if (steps === 6) markDone('k1');
    }
    draw();
  }

  let timer = null;
  const auto = document.getElementById('k1-auto');
  auto.addEventListener('click', () => {
    if (timer) { clearInterval(timer); timer = null; auto.textContent = '▶ Kör automatiskt'; return; }
    auto.textContent = '⏸ Pausa'; timer = setInterval(next, 1100);
  });
  document.getElementById('k1-next').addEventListener('click', next);
  view.onCell = (x, y) => {
    if (world.isWall(x, y)) return;
    world.setDirt(x, y, !world.isDirty(x, y));
    draw();
  };
  new ResizeObserver(draw).observe(canvas);
  phaseEl.innerHTML = 'Båda rutorna är smutsiga och roboten står på A. Tryck på <i>Nästa fas</i>.';
  highlight([], []);
  draw();

  // Är det en agent?
  const sort = document.getElementById('k1-sort');
  let answered = 0;
  for (const it of ITEMS) {
    const fb = el('div', { class: 'fb' });
    const card = el('div', { class: 'sort-card' }, el('div', { class: 'name' }, it.n), fb);
    const pick = (ans) => {
      card.querySelectorAll('button').forEach(b => { b.disabled = true; });
      const cls = it.a === 'diskutabel' ? 'maybe' : ans === it.a ? 'ok' : 'bad';
      card.classList.add(cls);
      fb.textContent = (cls === 'ok' ? 'Rätt! ' : cls === 'bad' ? 'Inte riktigt. ' : '') + it.fb;
      if (++answered === ITEMS.length) markDone('k1');
    };
    card.insertBefore(el('div', { class: 'btns' },
      el('button', { class: 'ghost', onclick: () => pick('ja') }, 'Agent'),
      el('button', { class: 'ghost', onclick: () => pick('nej') }, 'Inte agent')), fb);
    sort.append(card);
  }
}
