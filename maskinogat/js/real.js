// Kapitel 8: riktiga ultraljudsbilder (BreastMNIST, 64×64) som skalas om till modellens 48×48.
import { INPUT, yieldUI, buildModel, train, predict } from './model.js';
import { lineChart, histogram, cssVar } from './charts.js';

const $ = id => document.getElementById(id);

function resize(src, from, to) {
  const out = new Float32Array(to * to), k = (from - 1) / (to - 1);
  for (let y = 0; y < to; y++) for (let x = 0; x < to; x++) {
    const fx = x * k, fy = y * k, x0 = Math.floor(fx), y0 = Math.floor(fy);
    const x1 = Math.min(from - 1, x0 + 1), y1 = Math.min(from - 1, y0 + 1), ax = fx - x0, ay = fy - y0;
    const p = (xx, yy) => src[yy * from + xx];
    out[y * to + x] = ((p(x0, y0) * (1 - ax) + p(x1, y0) * ax) * (1 - ay) + (p(x0, y1) * (1 - ax) + p(x1, y1) * ax) * ay) / 255;
  }
  return out;
}

function mirror(px, size) {
  const out = new Float32Array(px.length);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) out[y * size + x] = px[y * size + size - 1 - x];
  return out;
}

async function load() {
  const [meta, bin] = await Promise.all([
    fetch('data/real/meta.json').then(r => r.json()),
    fetch('data/real/images.bin').then(r => r.arrayBuffer()),
  ]);
  const S = meta.size, all = new Uint8Array(bin);
  const cases = meta.labels.map((lab, i) => {
    const raw = all.subarray(i * S * S, (i + 1) * S * S);
    return { id: i, malignant: lab === 1, display: Float32Array.from(raw, v => v / 255), displaySize: S, px: resize(raw, S, INPUT) };
  });
  const split = name => cases.slice(meta.splits[name][0], meta.splits[name][0] + meta.splits[name][1]);
  return { cases, train: split('train'), val: split('val'), test: split('test') };
}

export async function initReal({ state, scan, drawStrip, pct, markDone }) {
  let data;
  try {
    data = await load();
  } catch {
    $('k8-loading').textContent = 'Kunde inte ladda bilderna.';
    return;
  }
  $('k8-loading').hidden = true;
  $('k8-body').hidden = false;

  const ben = data.train.filter(c => !c.malignant), mal = data.train.filter(c => c.malignant);
  [3, 11, 20, 34, 47, 60].forEach(i => $('k8-g-benign').append(scan(ben[i])));
  [2, 9, 17, 25, 33, 41].forEach(i => $('k8-g-malignant').append(scan(mal[i])));
  const share = data.cases.filter(c => c.malignant).length / data.cases.length;
  $('k8-share').textContent = pct(share);
  const lazy = data.test.filter(c => !c.malignant).length / data.test.length;
  $('k8-lazy-acc').textContent = $('k8-l-acc').textContent = pct(lazy);

  let model = null, probs = null;
  const stripCases = [...data.test.filter(c => c.malignant).slice(0, 4), ...data.test.filter(c => !c.malignant).slice(0, 4)]
    .sort((a, b) => a.id % 7 - b.id % 7);

  function update() {
    const t = +$('k8-t').value / 100;
    $('k8-tval').textContent = pct(t);
    let tp = 0, fn = 0, fp = 0, tn = 0;
    probs.forEach((p, i) => {
      if (data.test[i].malignant) p >= t ? tp++ : fn++; else p >= t ? fp++ : tn++;
    });
    $('k8-m-acc').textContent = pct((tp + tn) / probs.length);
    $('k8-m-sens').textContent = pct(tp / (tp + fn));
    $('k8-m-spec').textContent = pct(tn / (tn + fp));
    histogram($('k8-hist'), probs, data.test.map(c => c.malignant), t);
  }
  $('k8-t').oninput = () => probs && update();

  $('k8-train').onclick = async () => {
    if (state.busy) return;
    state.busy = true;
    $('k8-train').disabled = true;
    const status = $('k8-status');
    status.textContent = 'Förbereder …';
    await yieldUI();
    let trainSet = data.train;
    if ($('k8-aug').checked) trainSet = [...trainSet, ...trainSet.map(c => ({ ...c, px: mirror(c.px, INPUT) }))];
    const epochs = 20, hist = [];
    model?.dispose();
    model = buildModel();
    $('k8-result').hidden = false;
    const draw = () => lineChart($('k8-acc'), hist.map((_, i) => i + 1), [
      { values: hist.map(h => h.acc), color: cssVar('--train') },
      { values: hist.map(h => h.val_acc), color: cssVar('--val') },
    ], { min: 0.4, max: 1, fmt: v => pct(v) });
    await train(model, trainSet, data.val, epochs, async (e, logs) => {
      hist.push(logs);
      draw();
      status.textContent = `Epok ${e + 1} av ${epochs} · validering: ${pct(logs.val_acc)} rätt`;
    });
    probs = predict(model, data.test);
    update();
    const byId = new Map(data.test.map((c, i) => [c.id, probs[i]]));
    drawStrip($('k8-strip'), stripCases, stripCases.map(c => byId.get(c.id)));
    status.textContent = `Klar! Testad på ${data.test.length} bilder som modellen aldrig sett.`;
    markDone?.('k8');
    state.busy = false;
    $('k8-train').disabled = false;
  };
  drawStrip($('k8-strip'), stripCases);
}
