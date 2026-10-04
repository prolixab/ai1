// Syntetiska "skanningar": vävnadsliknande brus + en knöl.
// Godartad = rund, jämn, skarp kant. Elakartad = taggig, oregelbunden, suddig kant, ojämn inuti.
// Allt styrs av ett frö (seed), så samma fall ser alltid likadant ut i alla storlekar.

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(ix, iy, s) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(s, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x, y, s) {
  let v = 0, amp = 0.5, f = 1;
  for (let o = 0; o < 4; o++) { v += amp * noise(x * f, y * f, s + o * 17); f *= 2; amp *= 0.5; }
  return v / 0.9375;
}

/**
 * Skapar beskrivningen av ett fall (inte pixlarna).
 * opts.malignant: tvinga klass. opts.difficulty: 0 (lätt) – 1 (svår). opts.marker: rita en linjalmarkering i hörnet.
 */
export function makeCase(seed, opts = {}) {
  const r = rng(seed * 7919 + 13);
  const malignant = opts.malignant ?? r() < 0.5;
  const d = opts.difficulty ?? 0.3;
  const radius = 0.11 + r() * 0.07;
  const cx = 0.3 + r() * 0.4, cy = 0.3 + r() * 0.4;
  const harmonics = [];
  for (let k = 2; k <= 3; k++) harmonics.push({ k, a: 0.03 + r() * 0.07, p: r() * 6.283 });
  const spike = malignant ? 1 - 0.75 * d : 0.25 * d; // svårt läge: elakartade blir jämnare, godartade lite taggigare
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) harmonics.push({ k: 4 + Math.floor(r() * 7), a: (0.03 + r() * 0.06) * spike, p: r() * 6.283 });
  return {
    seed, malignant, cx, cy, radius, harmonics, spike,
    blur: malignant ? 0.12 + 0.18 * (1 - d) : 0.07 + 0.08 * d,
    het: malignant ? 0.08 + 0.3 * (1 - d) : 0.06 + 0.08 * d,
    contrast: 0.24 + r() * 0.1 - 0.06 * d,
    grain: 0.05 + 0.05 * d,
    marker: !!opts.marker,
    ns: Math.floor(r() * 100000),
  };
}

/** Renderar ett fall till en Float32Array (size×size) med värden 0–1. */
export function render(c, size) {
  const out = new Float32Array(size * size);
  const ns = c.ns;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size, v = (y + 0.5) / size;
      let bg = 0.26 + 0.24 * fbm(u * 4, v * 4, ns) + 0.08 * fbm(u * 14, v * 14, ns + 1);
      bg *= 1 - 0.7 * ((u - 0.5) ** 2 + (v - 0.5) ** 2);
      const dx = u - c.cx, dy = v - c.cy;
      const dist = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
      let R = 1;
      for (const h of c.harmonics) R += h.a * Math.sin(h.k * th + h.p);
      // Oregelbundna utskott: brus runt kanten (periodiskt i vinkeln)
      R *= 1 + c.spike * 0.9 * (fbm(Math.cos(th) * 2.5 + 7, Math.sin(th) * 2.5 + 7, ns + 4) - 0.5)
             + c.spike * 0.35 * (fbm(Math.cos(th) * 9 + 3, Math.sin(th) * 9 + 3, ns + 5) - 0.5);
      R *= c.radius;
      const t = (dist - R) / (c.radius * c.blur);
      const inside = t <= -1 ? 1 : t >= 1 ? 0 : 0.5 - 0.5 * Math.sin(t * Math.PI / 2);
      const tex = 1 + c.het * (fbm(u * 9, v * 9, ns + 2) - 0.5) * 2.4;
      let val = bg + c.contrast * inside * tex;
      val += (hash(Math.floor(u * 96), Math.floor(v * 96), ns + 3) - 0.5) * c.grain;
      if (c.marker && ((u > 0.8 && u < 0.93 && v > 0.07 && v < 0.11) || (u > 0.89 && u < 0.93 && v > 0.07 && v < 0.2))) val = 0.97;
      out[y * size + x] = val < 0 ? 0 : val > 1 ? 1 : val;
    }
  }
  return out;
}

/** Ett balanserat dataset: varannan godartad, varannan elakartad. */
export function makeDataset(n, seedBase, opts = {}) {
  const cases = [];
  for (let i = 0; i < n; i++) {
    const malignant = i % 2 === 1;
    const marker = typeof opts.marker === 'function' ? opts.marker(malignant, i) : !!opts.marker;
    cases.push(makeCase(seedBase + i, { ...opts, malignant, marker }));
  }
  return cases;
}

/** Ritar pixelvärden (0–1) på en canvas. */
export function paint(canvas, pixels, size) {
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const g = Math.round(pixels[i] * 255);
    img.data[i * 4] = g; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = g; img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
