// Små canvas-diagram utan bibliotek.

export const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function setup(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 300, h = canvas.clientHeight || 200;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.font = '11px system-ui, sans-serif';
  return { ctx, w, h };
}

/** Linjediagram. xs = epoknummer, series = [{values, color}]. */
export function lineChart(canvas, xs, series, { min = 0, max, fmt = v => v.toFixed(1) } = {}) {
  const { ctx, w, h } = setup(canvas);
  const pad = { l: 42, r: 10, t: 10, b: 22 };
  const all = series.flatMap(s => s.values).filter(Number.isFinite);
  const hi = max ?? Math.max(0.5, ...all) * 1.05;
  const n = Math.max(xs.length, 2);
  const X = i => pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
  const Y = v => pad.t + (1 - (Math.min(hi, Math.max(min, v)) - min) / (hi - min)) * (h - pad.t - pad.b);
  ctx.strokeStyle = cssVar('--line'); ctx.fillStyle = cssVar('--muted'); ctx.lineWidth = 1;
  for (let k = 0; k <= 4; k++) {
    const v = min + (hi - min) * k / 4, y = Y(v);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(fmt(v), pad.l - 6, y);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(xs.length ? `epok ${xs.length}` : 'epok', (pad.l + w - pad.r) / 2, h - pad.b + 6);
  for (const s of series) {
    if (!s.values.length) continue;
    ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    s.values.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
    ctx.stroke();
    const i = s.values.length - 1;
    ctx.beginPath(); ctx.arc(X(i), Y(s.values[i]), 3.5, 0, 7); ctx.fill();
  }
}

/** Histogram över sannolikheter, uppdelat på facit, med en lodrät linje vid gränsen. */
export function histogram(canvas, probs, isPos, threshold, bins = 20) {
  const { ctx, w, h } = setup(canvas);
  const pad = { l: 10, r: 10, t: 8, b: 22 };
  const pos = Array(bins).fill(0), neg = Array(bins).fill(0);
  probs.forEach((p, i) => (isPos[i] ? pos : neg)[Math.min(bins - 1, Math.floor(p * bins))]++);
  const hi = Math.max(1, ...pos, ...neg);
  const bw = (w - pad.l - pad.r) / bins, ih = h - pad.t - pad.b;
  const draw = (arr, color, off) => {
    ctx.fillStyle = color;
    arr.forEach((v, b) => {
      const bh = (v / hi) * ih;
      ctx.fillRect(pad.l + b * bw + off, pad.t + ih - bh, bw / 2 - 1, bh);
    });
  };
  draw(neg, cssVar('--benign'), 0.5);
  draw(pos, cssVar('--malignant'), bw / 2);
  ctx.fillStyle = cssVar('--muted'); ctx.textBaseline = 'top';
  ctx.textAlign = 'left'; ctx.fillText('0 % (säkert godartad)', pad.l, h - pad.b + 6);
  ctx.textAlign = 'right'; ctx.fillText('100 % (säkert elakartad)', w - pad.r, h - pad.b + 6);
  const x = pad.l + threshold * (w - pad.l - pad.r);
  ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(x, pad.t - 4); ctx.lineTo(x, pad.t + ih); ctx.stroke(); ctx.setLineDash([]);
}
