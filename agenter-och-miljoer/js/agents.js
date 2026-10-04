// Agentprogram. Alla har samma gränssnitt: act(percept) -> { a, why, plan?, target? }
// och knowledge() -> vad agenten vet om världen (för visningen "Visa vad agenten vet").
import { DIRS, DIR_NAMES, rng } from './world.js';

const ORDER = ['N', 'E', 'S', 'W'];
const OK = 0, WALL = 1, DIRT = 2, OPEN = 3, UNKNOWN = -1;

// Slumpagent: suger om det är smutsigt, annars går den åt ett slumpat håll.
export class RandomAgent {
  constructor(seed = 1) { this.r = rng(seed); }
  act(p) {
    if (p.dirty) return { a: 'SUG', why: 'Rutan är smutsig.' };
    const free = ORDER.filter(d => !p.bumps[d]);
    const d = free[Math.floor(this.r() * free.length)];
    return { a: d, why: `Slumpar fram en riktning: ${DIR_NAMES[d]}.` };
  }
  knowledge(p) { return here(p); }
}

// Enkel reflexagent: ser bara den egna rutan och väggarna runt sig. Inga minnen.
// Regeln "försök gå åt de här hållen i den här ordningen" kan eleven ändra.
export class ReflexAgent {
  constructor(seed = 1, order = ['E', 'S', 'W', 'N']) { this.order = order; }
  act(p) {
    if (p.dirty) return { a: 'SUG', why: 'Regel 1: OM rutan är smutsig → Sug.' };
    for (let k = 0; k < this.order.length; k++) {
      const d = this.order[k];
      if (!p.bumps[d]) return { a: d, why: `Regel ${k + 2}: OM ${DIR_NAMES[d]} är fritt → Gå ${DIR_NAMES[d]}.` };
    }
    return { a: 'VANTA', why: 'Ingen regel passar.' };
  }
  knowledge(p) { return here(p); }
}

function here(p) {
  const k = new Int8Array(p.w * p.h).fill(UNKNOWN);
  k[p.y * p.w + p.x] = p.dirty ? DIRT : OK;
  return k;
}

// Inre modell av världen: vad agenten har sett och när den senast var på varje ruta.
class Memory {
  constructor() { this.k = null; }
  update(p) {
    if (!this.k) {
      this.w = p.w; this.h = p.h;
      this.k = new Int8Array(p.w * p.h).fill(UNKNOWN);
      this.visit = new Float64Array(p.w * p.h).fill(-Infinity);
    }
    const i = p.y * p.w + p.x;
    if (this.k[i] === OK && p.dirty) this.surprise = true; // smuts där det var rent: världen ändras!
    this.k[i] = p.dirty ? DIRT : OK;
    this.visit[i] = p.t;
    for (const d of ORDER) {
      const nx = p.x + DIRS[d][0], ny = p.y + DIRS[d][1];
      if (nx < 0 || ny < 0 || nx >= p.w || ny >= p.h) continue;
      const j = ny * p.w + nx;
      if (p.bumps[d]) this.k[j] = WALL;
      else if (this.k[j] === UNKNOWN) this.k[j] = OPEN;
    }
    this.dog = null;
    if (p.full) {
      for (let j = 0; j < this.k.length; j++) {
        if (p.full.walls[j]) this.k[j] = WALL;
        else this.k[j] = p.full.dirt[j] ? DIRT : OK;
      }
      this.dog = p.full.dog;
    }
  }
  passable(j) { return this.k[j] !== WALL && this.k[j] !== UNKNOWN && !(this.dog && j === this.dog.y * this.w + this.dog.x); }
  // Bredden-först-sökning: avstånd och väg från (x, y) till alla rutor agenten känner till.
  bfs(x, y) {
    const n = this.k.length, distA = new Int32Array(n).fill(-1), prev = new Int32Array(n).fill(-1);
    const s = y * this.w + x; distA[s] = 0;
    const q = [s];
    for (let h = 0; h < q.length; h++) {
      const c = q[h], cx = c % this.w, cy = (c - cx) / this.w;
      for (const d of ORDER) {
        const nx = cx + DIRS[d][0], ny = cy + DIRS[d][1];
        if (nx < 0 || ny < 0 || nx >= this.w || ny >= this.h) continue;
        const j = ny * this.w + nx;
        if (distA[j] >= 0 || !this.passable(j)) continue;
        distA[j] = distA[c] + 1; prev[j] = c; q.push(j);
      }
    }
    return { dist: distA, prev };
  }
  path(bfs, target) {
    const out = [];
    for (let c = target; c !== -1; c = bfs.prev[c]) out.push([c % this.w, Math.floor(c / this.w)]);
    return out.reverse();
  }
}

function dirTo(from, to) {
  for (const d of ORDER) if (from[0] + DIRS[d][0] === to[0] && from[1] + DIRS[d][1] === to[1]) return d;
  return null;
}

// Modellbaserad reflexagent: kommer ihåg var den har varit. Regel: gå till en granne
// som är smutsig, annars till den granne den besökte för längst sedan. Ingen planering.
export class ModelAgent {
  constructor(seed = 1) { this.m = new Memory(); }
  act(p) {
    this.m.update(p);
    if (p.dirty) return { a: 'SUG', why: 'Rutan är smutsig → Sug.' };
    let best = null, bestScore = Infinity;
    for (const d of ORDER) {
      if (p.bumps[d]) continue;
      const j = (p.y + DIRS[d][1]) * p.w + p.x + DIRS[d][0];
      if (this.m.dog && j === this.m.dog.y * p.w + this.m.dog.x) continue;
      const score = this.m.k[j] === DIRT ? -Infinity : this.m.visit[j];
      if (score < bestScore) { bestScore = score; best = d; }
    }
    if (!best) return { a: 'VANTA', why: 'Inget fritt håll.' };
    const j = (p.y + DIRS[best][1]) * p.w + p.x + DIRS[best][0];
    const why = this.m.k[j] === DIRT ? `Minnet säger: smuts ${DIR_NAMES[best]}.`
      : this.m.visit[j] === -Infinity ? `Minnet säger: har aldrig varit ${DIR_NAMES[best]} om mig.`
      : `Minnet säger: rutan ${DIR_NAMES[best]} om mig besöktes för längst sedan.`;
    return { a: best, why };
  }
  knowledge() { return this.m.k; }
}

// Målbaserad agent: målet är "alla rutor rena". Söker (BFS) kortaste vägen till närmaste
// smutsiga eller outforskade ruta. När målet verkar uppnått stannar den.
export class GoalAgent {
  constructor(seed = 1) { this.m = new Memory(); }
  act(p) {
    this.m.update(p);
    if (p.dirty) return { a: 'SUG', why: 'Rutan är smutsig – målet kräver att den blir ren.' };
    const b = this.m.bfs(p.x, p.y);
    let target = -1, td = Infinity;
    for (let j = 0; j < this.m.k.length; j++) {
      if ((this.m.k[j] === DIRT || this.m.k[j] === OPEN) && b.dist[j] > 0 && b.dist[j] < td) { td = b.dist[j]; target = j; }
    }
    if (target < 0) return { a: 'VANTA', why: 'Målet uppnått: alla rutor jag känner till är rena.' };
    const plan = this.m.path(b, target);
    const d = dirTo(plan[0], plan[1]);
    const what = this.m.k[target] === DIRT ? 'smutsig ruta' : 'outforskad ruta';
    return { a: d, why: `Planerar väg till närmaste ${what} (${td} steg bort).`, plan, target };
  }
  knowledge() { return this.m.k; }
}

// Nyttobaserad agent: väger nytta mot kostnad. Väljer mål efter "värde per steg",
// håller koll på batteriet och patrullerar om den märker att ny smuts dyker upp.
export class UtilityAgent {
  constructor(seed = 1) { this.m = new Memory(); this.charging = false; }
  act(p) {
    this.m.update(p);
    const m = this.m, b = m.bfs(p.x, p.y);
    const ci = p.charger.y * p.w + p.charger.x;
    const fromCharger = p.battery !== null ? m.bfs(p.charger.x, p.charger.y) : null;
    const goHome = (why) => {
      if (p.onCharger) return { a: 'VANTA', why };
      const plan = m.path(b, ci);
      return { a: dirTo(plan[0], plan[1]), why, plan, target: ci };
    };

    if (p.battery !== null) {
      if (this.charging && p.onCharger && p.battery < p.capacity) return { a: 'VANTA', why: `Laddar batteriet (${p.battery}/${p.capacity}).` };
      this.charging = false;
      if (b.dist[ci] >= 0 && p.battery <= Math.ceil(b.dist[ci] * 1.3) + 3) { this.charging = true; return goHome(`Batteriet räcker bara ${p.battery} steg – åker hem och laddar.`); }
    }
    if (p.dirty) return { a: 'SUG', why: 'Rutan är smutsig – att suga ger mest nytta nu.' };

    let target = -1, best = 0;
    for (let j = 0; j < m.k.length; j++) {
      const dj = b.dist[j];
      if (dj <= 0) continue;
      let value = 0;
      if (m.k[j] === DIRT) value = 1;
      else if (m.k[j] === OPEN) value = 0.5;
      else if (m.k[j] === OK && m.surprise && !p.full) value = (p.t - m.visit[j]) * 0.02;
      if (!value) continue;
      if (fromCharger && p.battery < Math.ceil((dj + fromCharger.dist[j]) * 1.3) + 3) continue; // hinner inte hem igen
      const u = value / (dj + 1);
      if (u > best) { best = u; target = j; }
    }
    if (target < 0) {
      if (p.battery !== null && !p.onCharger) { this.charging = true; return goHome('Inget prisvärt att göra just nu – laddar inför nästa runda.'); }
      return { a: 'VANTA', why: 'Inget ger tillräcklig nytta just nu – väntar.' };
    }
    const plan = m.path(b, target);
    const d = dirTo(plan[0], plan[1]);
    const what = m.k[target] === DIRT ? 'smuts' : m.k[target] === OPEN ? 'outforskad ruta' : 'ruta som kan ha blivit smutsig';
    return { a: d, why: `Bästa nyttan per steg: ${what} ${b.dist[target]} steg bort.`, plan, target };
  }
  knowledge() { return this.m.k; }
}

export const AGENTS = {
  slump: { namn: 'Slumpagent', kort: 'Slump', make: (s) => new RandomAgent(s) },
  reflex: { namn: 'Enkel reflexagent', kort: 'Reflex', make: (s, o) => new ReflexAgent(s, o) },
  modell: { namn: 'Modellbaserad reflexagent', kort: 'Modell', make: (s) => new ModelAgent(s) },
  mal: { namn: 'Målbaserad agent', kort: 'Mål', make: (s) => new GoalAgent(s) },
  nytta: { namn: 'Nyttobaserad agent', kort: 'Nytta', make: (s) => new UtilityAgent(s) },
};

export const KNOW = { OK, WALL, DIRT, OPEN, UNKNOWN };
