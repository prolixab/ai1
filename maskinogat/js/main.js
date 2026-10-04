import { makeCase, makeDataset, render, paint } from './generator.js';
import { INPUT, yieldUI, pixelsOf, buildModel, train, predict, explain } from './model.js';
import { lineChart, histogram, cssVar } from './charts.js';
import { initReal } from './real.js';

const $ = id => document.getElementById(id);
const DISPLAY = 96;
const state = { model: null, difficulty: 0.6, busy: false };

function scan(c, size = DISPLAY, cls = 'scan') {
  const cv = document.createElement('canvas');
  cv.className = cls;
  if (c.display) paint(cv, c.display, c.displaySize); // riktig bild
  else paint(cv, size === INPUT ? pixelsOf(c) : render(c, size), size);
  return cv;
}

const pct = v => `${Math.round(v * 100)} %`;

// ---------- Kapitel 1: galleri ----------
for (let i = 0; i < 6; i++) {
  $('g-benign').append(scan(makeCase(1000 + i, { malignant: false, difficulty: 0.15 })));
  $('g-malignant').append(scan(makeCase(2000 + i, { malignant: true, difficulty: 0.15 })));
}

// ---------- Kapitel 2: sätt etiketter ----------
const k2 = { cases: [], answers: [], start: 0, checked: false };
function k2New() {
  const d = +$('k2-diff').value;
  const base = Math.floor(Math.random() * 1e6) + 3000;
  k2.cases = Array.from({ length: 12 }, (_, i) => makeCase(base + i, { difficulty: d }));
  k2.answers = Array(12).fill(null);
  k2.checked = false;
  k2.start = performance.now();
  $('k2-result').hidden = true;
  $('k2-grid').replaceChildren(...k2.cases.map((c, i) => {
    const b = document.createElement('button');
    b.className = 'lbl';
    b.setAttribute('aria-label', `Bild ${i + 1}`);
    b.append(scan(c), Object.assign(document.createElement('span'), { className: 'chip', textContent: 'Klicka' }));
    b.onclick = () => {
      if (k2.checked) return;
      k2.answers[i] = k2.answers[i] === null ? 'b' : k2.answers[i] === 'b' ? 'm' : null;
      b.classList.toggle('b', k2.answers[i] === 'b');
      b.classList.toggle('m', k2.answers[i] === 'm');
      b.querySelector('.chip').textContent = { b: 'Godartad', m: 'Elakartad' }[k2.answers[i]] ?? 'Klicka';
    };
    return b;
  }));
}
$('k2-new').onclick = k2New;
$('k2-diff').onchange = k2New;
$('k2-check').onclick = () => {
  if (k2.checked) return;
  k2.checked = true;
  const secs = Math.round((performance.now() - k2.start) / 1000);
  let right = 0;
  [...$('k2-grid').children].forEach((b, i) => {
    const ok = k2.answers[i] === (k2.cases[i].malignant ? 'm' : 'b');
    if (ok) right++;
    b.append(Object.assign(document.createElement('span'), { className: `mark ${ok ? 'ok' : 'no'}`, textContent: ok ? '✓' : '✗' }));
    if (!ok) b.querySelector('.chip').textContent = `Rätt: ${k2.cases[i].malignant ? 'Elakartad' : 'Godartad'}`;
  });
  let txt = `<p>Du fick <b>${right} av 12</b> rätt på ${secs} sekunder.`;
  if (state.model) {
    const t0 = performance.now();
    const p = predict(state.model, k2.cases);
    const ms = Math.max(1, Math.round(performance.now() - t0));
    const mr = p.filter((v, i) => (v > 0.5) === k2.cases[i].malignant).length;
    txt += ` Din tränade modell fick <b>${mr} av 12</b> rätt på ${ms} millisekunder.`;
  }
  txt += `</p><p>I verkligheten är ”facit” ofta ett vävnadsprov (biopsi) som visar om det är cancer. Erfarna radiologer är inte heller alltid överens – och etiketterna en modell tränas på är aldrig helt perfekta.</p>`;
  $('k2-result').innerHTML = txt;
  $('k2-result').hidden = false;
};
k2New();

// ---------- Kapitel 3: pixlar och filter ----------
const k3case = makeCase(4242, { malignant: true, difficulty: 0.15 });
const k3px = pixelsOf(k3case);
paint($('k3-img'), k3px, INPUT);
function k3Nums(cx, cy) {
  const rows = [];
  for (let y = cy - 2; y <= cy + 2; y++) {
    const tds = [];
    for (let x = cx - 2; x <= cx + 2; x++) {
      const inb = x >= 0 && y >= 0 && x < INPUT && y < INPUT;
      const v = inb ? k3px[y * INPUT + x] : null;
      const g = v === null ? 0 : Math.round(v * 255);
      const style = v === null ? '' : `background:rgb(${g},${g},${g});color:${v > 0.55 ? '#000' : '#fff'}`;
      tds.push(`<td class="${x === cx && y === cy ? 'center' : ''}" style="${style}">${v === null ? '' : v.toFixed(2)}</td>`);
    }
    rows.push(`<tr>${tds.join('')}</tr>`);
  }
  $('k3-nums').innerHTML = rows.join('');
  $('k3-pos').textContent = `Pixel (${cx}, ${cy}) har värdet ${k3px[cy * INPUT + cx].toFixed(2)}.`;
}
$('k3-img').addEventListener('pointermove', e => {
  const r = e.currentTarget.getBoundingClientRect();
  const x = Math.min(INPUT - 1, Math.floor((e.clientX - r.left) / r.width * INPUT));
  const y = Math.min(INPUT - 1, Math.floor((e.clientY - r.top) / r.height * INPUT));
  k3Nums(x, y);
});
k3Nums(24, 24);
$('k3-pos').textContent = 'För musen över bilden …';

const FILTERS = [
  { name: 'Lodräta kanter', k: [-1, 0, 1, -2, 0, 2, -1, 0, 1], abs: true },
  { name: 'Vågräta kanter', k: [-1, -2, -1, 0, 0, 0, 1, 2, 1], abs: true },
  { name: 'Alla kanter', k: [-1, -1, -1, -1, 8, -1, -1, -1, -1], abs: true },
  { name: 'Suddning', k: Array(9).fill(1 / 9), abs: false },
  { name: 'Skärpa', k: [0, -1, 0, -1, 5, -1, 0, -1, 0], abs: false },
];
function k3Apply(f) {
  const out = new Float32Array(INPUT * INPUT);
  let max = 1e-6;
  for (let y = 0; y < INPUT; y++) for (let x = 0; x < INPUT; x++) {
    let s = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const xx = Math.min(INPUT - 1, Math.max(0, x + i)), yy = Math.min(INPUT - 1, Math.max(0, y + j));
      s += f.k[(j + 1) * 3 + i + 1] * k3px[yy * INPUT + xx];
    }
    out[y * INPUT + x] = f.abs ? Math.abs(s) : s;
    if (out[y * INPUT + x] > max) max = out[y * INPUT + x];
  }
  for (let i = 0; i < out.length; i++) out[i] = f.abs ? out[i] / max : Math.min(1, Math.max(0, out[i]));
  paint($('k3-out'), out, INPUT);
  $('k3-kernel').innerHTML = [0, 1, 2].map(r => '<tr>' + [0, 1, 2].map(c => {
    const v = f.k[r * 3 + c];
    return `<td class="${v > 0 ? 'pos' : v < 0 ? 'neg' : ''}">${Number.isInteger(v) ? v : '1/9'}</td>`;
  }).join('') + '</tr>').join('');
  [...$('k3-filters').children].forEach(b => b.setAttribute('aria-pressed', b.textContent === f.name));
}
FILTERS.forEach(f => {
  const b = Object.assign(document.createElement('button'), { className: 'ghost', textContent: f.name });
  b.onclick = () => k3Apply(f);
  $('k3-filters').append(b);
});
k3Apply(FILTERS[2]);

// ---------- Kapitel 4: träning ----------
let stopReq = false;
function drawK4(hist) {
  const ep = hist.map((_, i) => i + 1);
  lineChart($('k4-acc'), ep, [
    { values: hist.map(h => h.acc), color: cssVar('--train') },
    { values: hist.map(h => h.val_acc), color: cssVar('--val') },
  ], { min: 0.4, max: 1, fmt: v => pct(v) });
  lineChart($('k4-loss'), ep, [
    { values: hist.map(h => h.loss), color: cssVar('--train') },
    { values: hist.map(h => h.val_loss), color: cssVar('--val') },
  ], { min: 0, fmt: v => v.toFixed(2) });
}
drawK4([]);

function drawStrip(container, cases, probs) {
  container.replaceChildren(...cases.map((c, i) => {
    const d = document.createElement('div');
    const p = probs?.[i];
    d.className = 'item' + (p === undefined ? '' : (p > 0.5) === c.malignant ? ' ok' : ' no');
    d.append(scan(c));
    d.insertAdjacentHTML('beforeend', `<div class="bar"><i style="width:${p === undefined ? 0 : p * 100}%"></i></div>` +
      `<div>${p === undefined ? '–' : pct(p) + ' elakartad'}</div><div class="muted">Facit: ${c.malignant ? 'elakartad' : 'godartad'}</div>`);
    return d;
  }));
}

async function trainMain(n = +$('k4-n').value, epochs = +$('k4-epochs').value, d = +$('k4-diff').value) {
  if (state.busy) return;
  state.busy = true; stopReq = false;
  document.querySelectorAll('[data-train]').forEach(b => (b.disabled = true));
  $('k4-train').disabled = true; $('k4-stop').hidden = false;
  const status = msg => { $('k4-status').textContent = msg; document.querySelectorAll('.needs-model .msg').forEach(m => (m.textContent = msg)); };
  status('Skapar bilder …');
  await yieldUI();
  const trainSet = makeDataset(n, 100000 + Math.floor(Math.random() * 1e6), { difficulty: d });
  const valSet = makeDataset(200, 50000, { difficulty: d });
  const stripCases = valSet.slice(0, 8);
  drawStrip($('k4-strip'), stripCases);
  trainSet.forEach(pixelsOf); valSet.forEach(pixelsOf);
  state.model?.dispose();
  const model = buildModel();
  const hist = [];
  drawK4(hist);
  const t0 = performance.now();
  await train(model, trainSet, valSet, epochs, async (e, logs) => {
    hist.push(logs);
    drawK4(hist);
    drawStrip($('k4-strip'), stripCases, predict(model, stripCases));
    status(`Epok ${e + 1} av ${epochs} · träffsäkerhet på valideringsbilder: ${pct(logs.val_acc)}`);
  }, () => stopReq);
  const last = hist.at(-1);
  status(`Klar efter ${hist.length} epoker (${((performance.now() - t0) / 1000).toFixed(1)} s). Träningsbilder: ${pct(last.acc)} rätt · valideringsbilder: ${pct(last.val_acc)} rätt.`);
  state.model = model; state.difficulty = d; state.busy = false;
  $('k4-train').disabled = false; $('k4-stop').hidden = true;
  document.querySelectorAll('[data-train]').forEach(b => (b.disabled = false));
  refreshModelChapters();
}
$('k4-train').onclick = () => trainMain();
$('k4-stop').onclick = () => { stopReq = true; };
drawStrip($('k4-strip'), makeDataset(200, 50000, { difficulty: 0.6 }).slice(0, 8));

// Kapitel som kräver en tränad modell
document.querySelectorAll('.needs-model').forEach(div => {
  div.innerHTML = `<div class="callout"><p>Du behöver en tränad modell. Träna en i kapitel 4 – eller tryck här så tränas en standardmodell (300 bilder, 20 epoker).</p>
    <p><button data-train>Träna en modell</button> <span class="msg muted"></span></p></div>`;
  div.querySelector('button').onclick = () => trainMain(300, 20, 0.6);
});

// ---------- Kapitel 5: test och tröskel ----------
let k5 = null;
function k5Update() {
  if (!k5) return;
  const t = +$('k5-t').value / 100;
  $('k5-tval').textContent = pct(t);
  let tp = 0, fn = 0, fp = 0, tn = 0;
  k5.probs.forEach((p, i) => {
    const m = k5.cases[i].malignant;
    if (m) p >= t ? tp++ : fn++; else p >= t ? fp++ : tn++;
  });
  $('tp').innerHTML = `${tp}<small>hittad cancer</small>`;
  $('fn').innerHTML = `${fn}<small>missad cancer</small>`;
  $('fp').innerHTML = `${fp}<small>falskt larm</small>`;
  $('tn').innerHTML = `${tn}<small>rätt friskförklarad</small>`;
  $('m-sens').textContent = pct(tp / (tp + fn));
  $('m-spec').textContent = pct(tn / (tn + fp));
  $('m-acc').textContent = pct((tp + tn) / k5.probs.length);
  histogram($('k5-hist'), k5.probs, k5.cases.map(c => c.malignant), t);
}
$('k5-t').oninput = k5Update;

// ---------- Kapitel 6: var tittar modellen? ----------
const HEAT = [[0, 0, 4], [75, 11, 107], [170, 40, 90], [226, 64, 29], [250, 150, 20], [255, 226, 89]];
function heatColor(v) {
  const x = Math.min(0.9999, v) * (HEAT.length - 1), i = Math.floor(x), f = x - i;
  return HEAT[i].map((a, k) => Math.round(a + (HEAT[i + 1][k] - a) * f));
}
/** Ritar fallet med värmekarta, modellens ruta och var knölen faktiskt sitter. */
function drawExplained(canvas, model, c, showHeat = true) {
  const S = 384;
  paint(canvas, render(c, S), S);
  const ctx = canvas.getContext('2d');
  const { map, base } = explain(model, pixelsOf(c));
  if (showHeat) {
    const strength = 0.3 + 0.7 * base; // svag karta när modellen inte ser tecken på cancer
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = INPUT;
    const tctx = tmp.getContext('2d'), img = tctx.createImageData(INPUT, INPUT);
    for (let i = 0; i < map.length; i++) {
      const [r, g, b] = heatColor(map[i]);
      img.data.set([r, g, b, Math.round(Math.pow(map[i], 1.3) * 200 * strength)], i * 4);
    }
    tctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tmp, 0, 0, S, S);
  }
  // Modellens ruta: området där kartan är över 50 % av max (bara om modellen tror på cancer)
  if (base < 0.5) return drawTruth(ctx, c, S), base;
  let x0 = INPUT, y0 = INPUT, x1 = 0, y1 = 0;
  for (let y = 0; y < INPUT; y++) for (let x = 0; x < INPUT; x++) if (map[y * INPUT + x] > 0.5) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  const k = S / INPUT;
  ctx.lineWidth = 3; ctx.strokeStyle = '#38bdf8';
  ctx.strokeRect(x0 * k, y0 * k, (x1 - x0 + 1) * k, (y1 - y0 + 1) * k);
  drawTruth(ctx, c, S);
  return base;
}
function drawTruth(ctx, c, S) {
  if (c.cx === undefined) return;
  ctx.setLineDash([8, 6]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(c.cx * S, c.cy * S, c.radius * 1.3 * S, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
}
let k6 = { cases: [], sel: 0 };
function k6Show() {
  const c = k6.cases[k6.sel];
  const p = drawExplained($('k6-view'), state.model, c, $('k6-heat').checked);
  $('k6-cap').textContent = `Facit: ${c.malignant ? 'elakartad' : 'godartad'} · Modellen: ${pct(p)} säker på elakartad`;
  [...$('k6-strip').children].forEach((d, i) => d.classList.toggle('sel', i === k6.sel));
}
$('k6-heat').onchange = k6Show;

function refreshModelChapters() {
  document.querySelectorAll('.needs-model[data-needs="main"]').forEach(d => (d.hidden = true));
  const cases = makeDataset(400, 70000, { difficulty: state.difficulty });
  k5 = { cases, probs: predict(state.model, cases) };
  $('k5-body').hidden = false;
  k5Update();
  k6.cases = cases.slice(0, 8);
  drawStrip($('k6-strip'), k6.cases, k5.probs.slice(0, 8));
  [...$('k6-strip').children].forEach((d, i) => (d.onclick = () => { k6.sel = i; k6Show(); }));
  $('k6-body').hidden = false;
  k6.sel = 1;
  k6Show();
}

// ---------- Kapitel 7: genvägar ----------
let biasModel = null;
$('k7-train').onclick = async () => {
  if (state.busy) return;
  state.busy = true;
  $('k7-train').disabled = true;
  const st = $('k7-status');
  st.textContent = 'Skapar bilder från sjukhus A …';
  await yieldUI();
  const D = 0.9, hospitalA = { difficulty: D, marker: m => m };
  const trainSet = makeDataset(200, 800000, hospitalA);
  const valSet = makeDataset(100, 810000, hospitalA);
  const testA = makeDataset(200, 820000, hospitalA);
  const testB = makeDataset(200, 830000, { difficulty: D });
  biasModel?.dispose();
  biasModel = buildModel();
  await train(biasModel, trainSet, valSet, 6, async (e, logs) => {
    st.textContent = `Tränar på sjukhus A … epok ${e + 1} av 6 · ${pct(logs.val_acc)} rätt`;
  });
  const acc = (cases) => predict(biasModel, cases).filter((p, i) => (p > 0.5) === cases[i].malignant).length / cases.length;
  $('k7-a').textContent = pct(acc(testA));
  $('k7-b').textContent = pct(acc(testB));
  st.textContent = 'Klar! Jämför sjukhus A och B.';
  $('k7-body').hidden = false;
  drawExplained($('k7-view'), biasModel, testA[1]);
  state.busy = false;
  $('k7-train').disabled = false;
};

// ---------- Kapitel 8: riktiga bilder ----------
initReal({ state, scan, drawStrip, pct });
