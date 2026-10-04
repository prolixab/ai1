// Kapitel 4: fem agenttyper, var och en jämförd med den föregående i samma värld.
// Den lärande agenten visas som en uppspelad animation av Q-inlärning.
import { SimPanel, Controls, el } from '../sim.js';
import { train, QMAP, QDIRS } from '../qlearn.js';
import { roundRect } from '../render.js';
import { markDone, load, save } from '../store.js';

const ORDERS = {
  ESWN: ['E', 'S', 'W', 'N'], NESW: ['N', 'E', 'S', 'W'], SWNE: ['S', 'W', 'N', 'E'], WNES: ['W', 'N', 'E', 'S'], EWSN: ['E', 'W', 'S', 'N'],
};
const ORDER_TXT = { ESWN: 'höger, ner, vänster, upp', NESW: 'upp, höger, ner, vänster', SWNE: 'ner, vänster, upp, höger', WNES: 'vänster, upp, höger, ner', EWSN: 'höger, vänster, ner, upp' };

const TYPES = [
  {
    key: 'reflex', namn: '1. Enkel reflex',
    left: 'slump', right: 'reflex', seed: 2, world: { observable: 'partial' }, showKnow: true,
    intro: `<p>En <b class="term">enkel reflexagent</b> har en lista med <b>OM–SÅ-regler</b> och reagerar bara på det den uppfattar <em>just nu</em>. Den har inget minne. Vår robot ser bara sin egen ruta och känner av väggar runt sig – resten av lägenheten är dold (mörk).</p>
      <p>Jämför med en <b>slumpagent</b> som går åt ett slumpat håll. Kör båda och titta på vad reflexagenten gör efter ett tag.</p>`,
    after: `<div class="discuss"><h4>Vad hände?</h4><ul>
      <li>Reflexagenten hamnar i en <b>loop</b>: den går fram och tillbaka mellan samma rutor för alltid. Samma percept ger alltid samma handling, och den minns inte att den redan har varit där.</li>
      <li>Prova att ändra regelordningen. Kan du hitta en ordning som inte fastnar? (Tips: det går inte – varje fast ordning fastnar någonstans.)</li>
      <li>Slumpagenten är ”dummare” men fastnar aldrig. Lite slump kan alltså hjälpa en agent som saknar minne.</li></ul></div>`,
  },
  {
    key: 'modell', namn: '2. Modellbaserad',
    left: 'reflex', right: 'modell', seed: 2, world: { observable: 'partial' }, showKnow: true,
    intro: `<p>En <b class="term">modellbaserad reflexagent</b> har ett <b>inre tillstånd</b> – en modell av världen som den bygger upp av sina percept. Vår robot ritar en karta i minnet: var den har varit, var väggarna finns och när den senast besökte varje ruta.</p>
      <p>Regeln är fortfarande enkel: <i>gå till en granne som är smutsig, annars till den granne du besökte för längst sedan</i>. Dimman visar vad agenten vet – ”?” är rutor den vet finns men inte har besökt.</p>`,
    after: `<div class="discuss"><h4>Vad hände?</h4><ul>
      <li>Med minne kan agenten hantera en <b>delvis observerbar</b> miljö: den kommer ihåg det den inte ser just nu.</li>
      <li>Men den planerar inte. Den tar ett steg i taget och kan ta långa omvägar. Titta på hur den rör sig när bara några få smutsiga rutor är kvar.</li></ul></div>`,
  },
  {
    key: 'mal', namn: '3. Målbaserad',
    left: 'modell', right: 'mal', seed: 5, world: { observable: 'full' }, showKnow: false,
    intro: `<p>En <b class="term">målbaserad agent</b> har ett <b>mål</b> – ”alla rutor ska vara rena” – och <b>söker</b> efter en följd av handlingar som leder dit. Vår robot använder <i>bredden-först-sökning</i> för att hitta kortaste vägen till närmaste smutsiga ruta. Den streckade linjen är planen.</p>
      <p>Nu är miljön <b>fullt observerbar</b>: båda robotarna ser all smuts. Vem blir klar först?</p>`,
    after: `<div class="discuss"><h4>Vad hände?</h4><ul>
      <li>Den målbaserade agenten tänker framåt: ”om jag gör så här, hamnar jag där”. Det gör att den blir klar snabbare.</li>
      <li>Ett mål är bara <b>ja eller nej</b> – rent eller inte rent. Agenten kan inte väga olika sätt att nå målet mot varandra, och den bryr sig inte om något annat än målet (som batteriet).</li>
      <li>Planering kräver en modell av hur världen fungerar. Vad händer med planen om hjulen slirar (stokastisk miljö)? Testa i sandlådan!</li></ul></div>`,
  },
  {
    key: 'nytta', namn: '4. Nyttobaserad',
    left: 'mal', right: 'nytta', seed: 3, world: { observable: 'full', battery: true, dynamic: true }, showKnow: false,
    intro: `<p>En <b class="term">nyttobaserad agent</b> har en <b>nyttofunktion</b> som säger <em>hur bra</em> ett läge är – inte bara om målet är uppnått. Den kan därför göra <b>avvägningar</b>: är det värt att åka långt för en smutsig ruta? Räcker batteriet hem?</p>
      <p>Nu har robotarna ett <b>begränsat batteri</b> (40 steg), och ny smuts dyker upp då och då. Den gröna blixten är laddstationen.</p>`,
    after: `<div class="discuss"><h4>Vad hände?</h4><ul>
      <li>Den målbaserade agenten jagar smuts tills batteriet tar slut. Målet ”allt rent” säger ingenting om batteriet.</li>
      <li>Den nyttobaserade agenten väger nyttan av att städa mot risken att bli stående. Ibland väljer den att <em>inte</em> städa och åker hem för att ladda.</li>
      <li>I verkligheten finns nästan alltid avvägningar: snabbt eller säkert, billigt eller bra. Därför är nyttobaserade agenter vanliga – men någon måste bestämma nyttofunktionen.</li></ul></div>`,
  },
  { key: 'lar', namn: '5. Lärande' },
];

export function init() {
  const tabs = document.getElementById('k4-tabs');
  const intro = document.getElementById('k4-intro'), body = document.getElementById('k4-body'), after = document.getElementById('k4-after');
  const seen = new Set(load().k4 || []);
  let controls = null, stopQL = null;
  const btns = TYPES.map((t, i) => {
    const b = el('button', { role: 'tab', onclick: () => show(i) }, t.namn);
    tabs.append(b); return b;
  });

  function show(i) {
    controls?.pause(); stopQL?.(); stopQL = null;
    btns.forEach((b, j) => b.setAttribute('aria-selected', String(i === j)));
    const t = TYPES[i];
    seen.add(t.key); save({ k4: [...seen] });
    if (seen.size === TYPES.length) markDone('k4');
    if (t.key === 'lar') { controls = null; stopQL = learning(intro, body, after); return; }
    intro.innerHTML = t.intro;
    after.innerHTML = t.after;
    const duo = el('div', { class: 'duo' });
    const common = { seed: t.seed, world: { map: 'lagenhet', ...t.world }, showKnow: t.showKnow };
    const left = new SimPanel(duo, { ...common, agent: t.left, reflexOrder: ORDERS.ESWN });
    const right = new SimPanel(duo, { ...common, agent: t.right, reflexOrder: ORDERS.ESWN });
    body.replaceChildren();
    if (t.key === 'reflex') {
      const sel = el('select', { 'aria-label': 'Regelordning' }, Object.keys(ORDERS).map(k => el('option', { value: k }, ORDER_TXT[k])));
      sel.addEventListener('change', () => { controls.pause(); right.set({ reflexOrder: ORDERS[sel.value] }); });
      body.append(el('div', { class: 'rule-edit' }, el('span', {}, el('b', {}, 'Reflexagentens regler:'), ' OM smutsigt → Sug. ANNARS gå åt första fria hållet i ordningen:'), sel));
    }
    body.append(duo);
    controls = new Controls(body, [left, right], { speed: 8 });
  }
  show(0);
}

// --- Den lärande agenten: uppspelning av Q-inlärning ---
function learning(intro, body, after) {
  intro.innerHTML = `<p>En <b class="term">lärande agent</b> får inga regler och ingen karta. Den får bara en <b>belöning</b>: +20 när den hittar smutshögen, −20 om den ramlar ner för trappan och −1 för varje steg. Genom att prova om och om igen (<b>episoder</b>) lär den sig vilka handlingar som lönar sig. Metoden heter <b>Q-inlärning</b>.</p>
    <p>Animationen visar en verklig inlärning i 300 episoder. Färgen visar hur bra agenten tror att varje ruta är, och pilarna vad den tycker är bästa handlingen där.</p>`;
  after.innerHTML = `<div class="discuss"><h4>Att fundera på</h4><ul>
    <li><b>Utforska eller utnyttja?</b> I början slumpar agenten nästan alltid (ε nära 100 %) för att upptäcka världen. Efter hand litar den mer på det den har lärt sig. Varför behövs båda?</li>
    <li>Titta på grafen. Varför är resultatet så ojämnt i början? Varför planar kurvan ut?</li>
    <li>Agenten har aldrig fått veta var trappan är. Hur ”vet” den ändå att den ska undvika den?</li>
    <li>Alla de andra agenttyperna kan göras lärande: en lärande agent har en del som <em>handlar</em> och en del som <em>förbättrar</em> hur den handlar.</li></ul></div>`;

  const data = train();
  const N = data.episodes.length;
  const canvas = el('canvas', { class: 'world', 'aria-label': 'Q-inlärning i ett rutnät' });
  const info = el('div', { class: 'ql-info', 'aria-live': 'polite' });
  const slider = el('input', { type: 'range', min: 1, max: N, value: 1, 'aria-label': 'Episod' });
  const playBtn = el('button', {}, '▶ Spela');
  const mode = el('select', { 'aria-label': 'Uppspelningsläge' }, el('option', { value: 'steg' }, 'Steg för steg'), el('option', { value: 'snabb' }, 'Snabbspola episoder'));
  const jumps = el('div', { class: 'toolbar' }, el('span', { class: 'small muted' }, 'Hoppa till episod:'),
    ...[1, 10, 40, 100, 300].map(n => el('button', { class: 'ghost', onclick: () => { pause(); stepIdx = Infinity; go(n - 1); } }, String(n))));
  const chart = el('div', { class: 'ql-chart' });
  const legend = el('div', { class: 'legend' },
    el('span', {}, el('i', { style: 'background:var(--accent)' }), 'bra ruta'), el('span', {}, el('i', { style: 'background:var(--bad)' }), 'dålig ruta'),
    el('span', {}, el('i', { style: 'background:var(--dirt)' }), 'smutshög +20'), el('span', {}, el('i', { style: 'background:repeating-linear-gradient(0deg,var(--wall) 0 2px,var(--floor) 2px 4px)' }), 'trappa −20'));
  body.replaceChildren(el('div', { class: 'ql' },
    el('div', {}, canvas, legend),
    el('div', {}, info, el('div', { class: 'toolbar' }, playBtn, mode), el('label', { class: 'small' }, 'Episod', slider), jumps, chart)));

  let ep = 0, stepIdx = 0, timer = null;
  const chartSvg = drawChart(chart, data.episodes);

  function render() {
    const e = data.episodes[ep];
    const full = mode.value === 'snabb' || stepIdx >= e.path.length - 1;
    const shown = full ? e.path : e.path.slice(0, stepIdx + 1);
    const Q = ep > 0 ? data.episodes[ep - 1].Q : new Float32Array(e.Q.length);
    drawQ(canvas, data, Q, shown);
    slider.value = ep + 1;
    chartSvg.cursor(ep);
    const res = e.end === 'mål' ? `hittade smutshögen på ${e.path.length - 1} steg` : e.end === 'fälla' ? `ramlade ner för trappan efter ${e.path.length - 1} steg` : 'hittade inte fram innan tiden tog slut (80 steg)';
    info.innerHTML = `<p><b>Episod ${ep + 1} av ${N}</b><br>Slumpandel ε = <b>${Math.round(e.eps * 100)} %</b> – så ofta väljer agenten ett slumpat håll i stället för det den tror är bäst.</p>
      <p>${full ? `Resultat: ${res}. Belöning: <b>${e.ret}</b>.` : `Steg ${stepIdx} …`}</p>`;
  }
  function go(n, resetStep) { ep = Math.max(0, Math.min(N - 1, n)); if (resetStep) stepIdx = 0; render(); }
  function tick() {
    const e = data.episodes[ep];
    if (mode.value === 'snabb') { if (ep >= N - 1) return pause(); go(ep + 1, true); timer = setTimeout(tick, 70); return; }
    if (stepIdx < e.path.length - 1) { stepIdx++; render(); timer = setTimeout(tick, 70); return; }
    if (ep >= N - 1) return pause();
    timer = setTimeout(() => { go(ep + 1, true); timer = setTimeout(tick, 70); }, 600);
  }
  function play() { if (ep >= N - 1 && stepIdx >= data.episodes[ep].path.length - 1) go(0, true); playBtn.textContent = '⏸ Pausa'; timer = setTimeout(tick, 0); }
  function pause() { clearTimeout(timer); timer = null; playBtn.textContent = '▶ Spela'; }
  playBtn.addEventListener('click', () => (timer ? pause() : play()));
  slider.addEventListener('input', () => { pause(); stepIdx = Infinity; go(+slider.value - 1); });
  mode.addEventListener('change', render);
  new ResizeObserver(render).observe(canvas);
  render();
  return pause;
}

function drawQ(c, data, Q, trail) {
  const { w, h } = data;
  c.style.aspectRatio = `${w} / ${h}`;
  const W = c.clientWidth || 400, cs = W / w, dpr = window.devicePixelRatio || 1;
  if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(cs * h * dpr); }
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const css = getComputedStyle(c), v = (n) => css.getPropertyValue(n).trim();
  let maxAbs = 1;
  for (let i = 0; i < Q.length; i++) maxAbs = Math.max(maxAbs, Math.abs(Q[i]));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = QMAP[y][x], px = x * cs, py = y * cs;
    if (ch === '#') { ctx.fillStyle = v('--wall'); ctx.fillRect(px, py, cs + .5, cs + .5); continue; }
    ctx.fillStyle = v('--floor'); ctx.fillRect(px, py, cs, cs);
    const s = (y * w + x) * 4;
    const q = [Q[s], Q[s + 1], Q[s + 2], Q[s + 3]];
    const learned = q.some(z => z !== 0);
    if (ch === '.' || ch === 'C') {
      if (learned) {
        const best = Math.max(...q);
        ctx.globalAlpha = Math.min(.85, Math.abs(best) / maxAbs * 1.4 + .08);
        ctx.fillStyle = best >= 0 ? v('--accent') : v('--bad');
        ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
        ctx.globalAlpha = 1;
        const a = q.indexOf(best);
        arrow(ctx, px + cs / 2, py + cs / 2, QDIRS[a], cs * .28, v('--ink'));
      }
    }
    ctx.strokeStyle = v('--floor-line'); ctx.lineWidth = 1; ctx.strokeRect(px + .5, py + .5, cs - 1, cs - 1);
    if (ch === 'T') { ctx.fillStyle = v('--wall'); for (let k = 0; k < 4; k++) ctx.fillRect(px + cs * .15, py + cs * (.18 + k * .18), cs * .7, cs * .08); }
    if (ch === 'G') { ctx.fillStyle = v('--dirt'); ctx.beginPath(); ctx.ellipse(px + cs / 2, py + cs * .62, cs * .32, cs * .2, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(px + cs / 2, py + cs * .45, cs * .18, 0, Math.PI * 2); ctx.fill(); }
    if (ch === 'C') { ctx.strokeStyle = v('--charger'); ctx.lineWidth = 2; roundRect(ctx, px + cs * .1, py + cs * .1, cs * .8, cs * .8, cs * .15); ctx.stroke(); }
  }
  if (trail.length > 1) {
    ctx.strokeStyle = v('--bot'); ctx.globalAlpha = .7; ctx.lineWidth = Math.max(2, cs * .07); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); trail.forEach(([x, y], k) => (k ? ctx.lineTo : ctx.moveTo).call(ctx, x * cs + cs / 2, y * cs + cs / 2)); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const [bx, by] = trail[trail.length - 1];
  ctx.fillStyle = v('--bot'); ctx.beginPath(); ctx.arc(bx * cs + cs / 2, by * cs + cs / 2, cs * .3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = v('--bot-ink'); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx * cs + cs / 2, by * cs + cs / 2, cs * .16, 0, Math.PI * 2); ctx.stroke();
}

function arrow(ctx, cx, cy, d, len, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2; ctx.globalAlpha = .75;
  const ex = cx + d[0] * len, ey = cy + d[1] * len;
  ctx.beginPath(); ctx.moveTo(cx - d[0] * len * .6, cy - d[1] * len * .6); ctx.lineTo(ex, ey); ctx.stroke();
  const px = -d[1], py = d[0], s = len * .45;
  ctx.beginPath(); ctx.moveTo(ex + d[0] * s * .4, ey + d[1] * s * .4); ctx.lineTo(ex - d[0] * s * .6 + px * s * .6, ey - d[1] * s * .6 + py * s * .6); ctx.lineTo(ex - d[0] * s * .6 - px * s * .6, ey - d[1] * s * .6 - py * s * .6); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawChart(host, eps) {
  const W = 400, H = 170, L = 34, B = 24, T = 18, R = 8;
  const rets = eps.map(e => e.ret);
  const lo = Math.min(...rets), hi = Math.max(...rets);
  const X = (i) => L + (i / (eps.length - 1)) * (W - L - R), Y = (r) => T + (1 - (r - lo) / (hi - lo)) * (H - T - B);
  const avg = rets.map((_, i) => { const s = rets.slice(Math.max(0, i - 19), i + 1); return s.reduce((a, b) => a + b, 0) / s.length; });
  const line = (arr) => arr.map((r, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(r).toFixed(1)}`).join('');
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Belöning per episod">
    <text x="${L}" y="12">Belöning per episod (lila = medelvärde av 20)</text>
    <line class="axis" x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}"/>
    <text x="${L - 4}" y="${Y(0) + 4}" text-anchor="end">0</text>${Y(0) - Y(hi) > 14 ? `<text x="${L - 4}" y="${Y(hi) + 4}" text-anchor="end">${hi}</text>` : ''}<text x="${L - 4}" y="${Y(lo) + 4}" text-anchor="end">${lo}</text>
    <path class="ret" d="${line(rets)}"/><path class="avg" d="${line(avg)}"/>
    <line class="cursor" x1="0" x2="0" y1="${T}" y2="${H - B}"/>
    <text x="${L}" y="${H - 6}">1</text><text x="${W - R}" y="${H - 6}" text-anchor="end">${eps.length}</text><text x="${(L + W) / 2}" y="${H - 6}" text-anchor="middle">episod</text>
  </svg>`;
  const cur = host.querySelector('.cursor');
  return { cursor: (i) => { cur.setAttribute('x1', X(i)); cur.setAttribute('x2', X(i)); } };
}
