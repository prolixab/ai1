// Q-inlärning i en liten värld. Körs en gång (med fast slumpfrö) och spelas sedan upp som animation.
import { rng } from './world.js';

export const QMAP = [
  '#########',
  '#C......#',
  '#.##.##.#',
  '#.#T..#.#',
  '#.#.#.#.#',
  '#...#..G#',
  '#########',
];
export const QDIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // upp, höger, ner, vänster
export const REWARD = { step: -1, goal: 20, trap: -20 };

export function train({ episodes = 300, alpha = 0.3, gamma = 0.95, maxSteps = 80, seed = 4 } = {}) {
  const h = QMAP.length, w = QMAP[0].length;
  const cell = (x, y) => QMAP[y][x];
  let start;
  QMAP.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'C') start = [x, y]; }));
  const Q = new Float32Array(w * h * 4);
  const r = rng(seed);
  const out = [];
  for (let e = 0; e < episodes; e++) {
    const eps = Math.max(0.05, 1 - e / 120);
    let [x, y] = start, ret = 0, end = 'tid';
    const path = [[x, y]];
    for (let t = 0; t < maxSteps; t++) {
      const s = (y * w + x) * 4;
      let a;
      if (r() < eps) a = Math.floor(r() * 4);
      else { a = 0; for (let k = 1; k < 4; k++) if (Q[s + k] > Q[s + a] || (Q[s + k] === Q[s + a] && r() < .5)) a = k; }
      let nx = x + QDIRS[a][0], ny = y + QDIRS[a][1];
      if (cell(nx, ny) === '#') { nx = x; ny = y; }
      const c = cell(nx, ny);
      const rew = c === 'G' ? REWARD.goal : c === 'T' ? REWARD.trap : REWARD.step;
      const terminal = c === 'G' || c === 'T';
      const ns = (ny * w + nx) * 4;
      const future = terminal ? 0 : Math.max(Q[ns], Q[ns + 1], Q[ns + 2], Q[ns + 3]);
      Q[s + a] += alpha * (rew + gamma * future - Q[s + a]);
      ret += rew; x = nx; y = ny; path.push([x, y]);
      if (terminal) { end = c === 'G' ? 'mål' : 'fälla'; break; }
    }
    out.push({ path, ret, eps, end, Q: Float32Array.from(Q) });
  }
  return { w, h, start, episodes: out };
}
