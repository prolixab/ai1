// Dammsugarvärlden: ett rutnät med väggar, smuts, laddstation, en dammsugare och ev. en hund.
// Ingen UI här – samma kod körs i webbläsaren och i Node-testerna.

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
export const DIR_NAMES = { N: 'upp', E: 'höger', S: 'ner', W: 'vänster' };
export const ACTION_NAMES = { N: 'Gå upp', E: 'Gå höger', S: 'Gå ner', W: 'Gå vänster', SUG: 'Sug', VANTA: 'Vänta', TOM: 'Töm påsen' };
const SIDEWAYS = { N: ['E', 'W'], S: ['E', 'W'], E: ['N', 'S'], W: ['N', 'S'] };

// '#' vägg, '.' golv, 'C' laddstation, 'H' hundens startruta
export const MAPS = {
  lagenhet: {
    namn: 'Lägenhet',
    rows: [
      '############',
      '#C....#....#',
      '#.....#....#',
      '#..........#',
      '#.....###.##',
      '#.##......H#',
      '#.##.......#',
      '############',
    ],
  },
  oppen: {
    namn: 'Öppet rum',
    rows: [
      '##########',
      '#C.......#',
      '#........#',
      '#........#',
      '#........#',
      '#.......H#',
      '##########',
    ],
  },
  labyrint: {
    namn: 'Labyrint',
    rows: [
      '############',
      '#C...#.....#',
      '###.##.###.#',
      '#.....#....#',
      '#.###.#.##.#',
      '#...#...#.H#',
      '#.#...#....#',
      '############',
    ],
  },
  tvarum: {
    namn: 'Två rutor',
    rows: ['..'],
  },
};

export const DEFAULTS = {
  map: 'lagenhet',
  seed: 1,
  observable: 'full',   // 'full' | 'partial'
  stochastic: false,    // rörelser kan slira, sugning kan misslyckas
  dynamic: false,       // ny smuts dyker upp
  dog: false,           // hunden Sixten (en annan agent)
  battery: false,       // begränsat batteri
  rivals: 0,            // tävling: antal andra dammsugare (0–3) som suger smuts åt sig själva
  shoot: false,         // skjutläge: dammsugarna kan skjuta dammbollar, den som träffas åker ut
  dirtFrac: 0.3,
  capacity: 40,
};

export const SHOT_COOLDOWN = 8;   // steg innan man kan skjuta igen
export const SHOT_RANGE = 5;      // så långt en dammboll når (rutor)
export const SHOT_GRACE = 15;     // fredsperiod: ingen kan skjuta de första stegen

export class World {
  constructor(opts = {}) {
    this.o = { ...DEFAULTS, ...opts };
    const map = MAPS[this.o.map];
    this.h = map.rows.length;
    this.w = map.rows[0].length;
    this.walls = new Uint8Array(this.w * this.h);
    this.dirt = new Uint8Array(this.w * this.h);
    this.floor = [];
    let start = null, dogStart = null;
    map.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const i = y * this.w + x;
      if (ch === '#') this.walls[i] = 1;
      else this.floor.push(i);
      if (ch === 'C') start = { x, y };
      if (ch === 'H') dogStart = { x, y };
    }));
    this.charger = start || this.xy(this.floor[0]);
    this.r = rng(this.o.seed * 7919 + 13);
    for (const i of this.floor) if (this.r() < this.o.dirtFrac && !(this.xy(i).x === this.charger.x && this.xy(i).y === this.charger.y)) this.dirt[i] = 1;
    this.bot = { x: this.charger.x, y: this.charger.y, heading: 'E', battery: this.o.capacity, dead: false, out: false, cool: 0, sucked: 0 };
    this.dog = this.o.dog && dogStart ? { ...dogStart } : null;
    // Motståndarna startar så långt som möjligt från laddplattan och från varandra.
    this.rivals = this.rivalStarts(Math.max(0, Math.min(3, this.o.rivals | 0)), dogStart)
      .map(({ x, y }, k) => ({ id: k, x, y, heading: 'W', battery: this.o.capacity, dead: false, out: false, cool: 0, sucked: 0 }));
    this.t = 0;
    this.cleanSum = 0;
    this.sucked = 0;
    this.last = null; // senaste händelse, för visning
  }

  idx(x, y) { return y * this.w + x; }
  xy(i) { return { x: i % this.w, y: Math.floor(i / this.w) }; }
  isWall(x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h || this.walls[this.idx(x, y)] === 1; }
  isDirty(x, y) { return this.dirt[this.idx(x, y)] === 1; }
  setDirt(x, y, v) { if (!this.isWall(x, y)) this.dirt[this.idx(x, y)] = v ? 1 : 0; }
  dirtCount() { let n = 0; for (const i of this.floor) n += this.dirt[i]; return n; }
  cleanliness() { return 1 - this.dirtCount() / this.floor.length; }
  performance() { return this.t ? this.cleanSum / this.t : this.cleanliness(); }

  rivalStarts(n, dogStart) {
    const taken = [this.charger];
    if (dogStart) taken.push(dogStart);
    const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const out = [];
    while (out.length < n) {
      let best = null, bestD = -1;
      for (const i of this.floor) {
        const c = this.xy(i);
        const d = Math.min(...taken.map(t => md(c, t)));
        if (d > bestD) { bestD = d; best = c; }
      }
      if (!best || bestD <= 0) break;
      out.push(best);
      taken.push(best);
    }
    return out;
  }

  // Alla dammsugare som fortfarande är med (spelaren först).
  vacuums() { return [this.bot, ...this.rivals].filter(v => !v.out); }
  vacuumAt(x, y, except) { return this.vacuums().find(v => v !== except && v.x === x && v.y === y) || null; }

  percept(b = this.bot) {
    const bumps = {};
    for (const d in DIRS) bumps[d] = this.isWall(b.x + DIRS[d][0], b.y + DIRS[d][1]);
    const p = {
      x: b.x, y: b.y, w: this.w, h: this.h, t: this.t,
      dirty: this.isDirty(b.x, b.y),
      bumps,
      charger: { ...this.charger },
      onCharger: b.x === this.charger.x && b.y === this.charger.y,
      battery: this.o.battery ? b.battery : null,
      capacity: this.o.capacity,
      full: null,
    };
    if (this.o.observable === 'full') {
      p.full = { walls: this.walls, dirt: Uint8Array.from(this.dirt), dog: this.dog ? { ...this.dog } : null };
    }
    return p;
  }

  // Ett steg: spelaren gör action, motståndarna gör rivalActions[k] (i tur och ordning), sedan hunden.
  step(action, rivalActions = []) {
    const ev = this.move(this.bot, action);
    this.rivals.forEach((r, k) => { r.last = this.move(r, rivalActions[k] || 'VANTA'); });

    if (this.dog) this.moveDog();
    if (this.o.dynamic) {
      for (const i of this.floor) if (!this.dirt[i] && this.r() < 0.25 / this.floor.length) this.dirt[i] = 1;
    }
    this.t++;
    this.cleanSum += this.cleanliness();
    this.last = ev;
    return ev;
  }

  // En dammsugare (spelaren eller en motståndare) utför en handling.
  move(b, action) {
    const ev = { action, actual: action, slipped: false, failed: false, blocked: false };
    if (b.cool > 0) b.cool--;
    if (b.out) { ev.actual = 'VANTA'; ev.out = true; return ev; }
    if (b.dead) { ev.actual = 'VANTA'; ev.dead = true; }
    else if (action === 'SUG') {
      if (this.o.battery) b.battery--;
      if (this.isDirty(b.x, b.y)) {
        if (this.o.stochastic && this.r() < 0.15) ev.failed = true;
        else {
          this.setDirt(b.x, b.y, 0);
          b.sucked++;
          if (b === this.bot) this.sucked++;
        }
      }
    } else if (DIRS[action]) {
      if (this.o.battery) b.battery--;
      let d = action;
      if (this.o.stochastic && this.r() < 0.2) {
        d = SIDEWAYS[d][this.r() < 0.5 ? 0 : 1];
        ev.slipped = true; ev.actual = d;
      }
      const nx = b.x + DIRS[d][0], ny = b.y + DIRS[d][1];
      b.heading = d;
      if (this.isWall(nx, ny) || (this.dog && this.dog.x === nx && this.dog.y === ny)) ev.blocked = true;
      else if (this.vacuumAt(nx, ny, b)) { ev.blocked = true; ev.byVacuum = true; }
      else { b.x = nx; b.y = ny; }
    } else if (action === 'SKJUT' || action.startsWith('SKJUT:')) {
      // "SKJUT" skjuter åt det håll dammsugaren är vänd, "SKJUT:E" vänder sig först.
      const d = action.split(':')[1];
      if (DIRS[d]) b.heading = d;
      ev.actual = 'SKJUT';
      if (!this.o.shoot) ev.noShot = true;
      else if (this.t < SHOT_GRACE) ev.grace = true;
      else if (b.cool > 0) ev.reloading = true;
      else {
        if (this.o.battery) b.battery--;
        b.cool = SHOT_COOLDOWN;
        ev.shot = this.shoot(b);
      }
    } else if (action === 'TOM') {
      this.setDirt(b.x, b.y, 1);
    } else if (action === 'VANTA') {
      if (this.o.battery && b.x === this.charger.x && b.y === this.charger.y) b.battery = Math.min(this.o.capacity, b.battery + 8);
    }
    if (this.o.battery && b.battery <= 0) { b.battery = 0; b.dead = true; }
    return ev;
  }

  // Dammbollen far rakt fram tills den träffar en vägg, hunden eller en annan dammsugare.
  // Den som träffas åker ut (hunden springer iväg).
  shoot(b) {
    const [dx, dy] = DIRS[b.heading];
    const shot = { from: { x: b.x, y: b.y }, dir: b.heading, to: null, hit: null };
    let x = b.x, y = b.y;
    for (let k = 1; k <= SHOT_RANGE; k++) {
      const nx = x + dx, ny = y + dy;
      if (this.isWall(nx, ny)) break;
      x = nx; y = ny;
      if (this.dog && this.dog.x === x && this.dog.y === y) {
        shot.hit = { kind: 'dog', x, y };
        this.dog = null;
        break;
      }
      const v = this.vacuumAt(x, y, b);
      if (v) {
        v.out = true;
        shot.hit = { kind: v === this.bot ? 'player' : 'rival', id: v.id, x, y };
        break;
      }
    }
    shot.to = { x, y };
    return shot;
  }

  // Finns det något att träffa om b skjuter åt hållet d? (för motståndarnas beslut)
  target(b, d, kinds = ['player', 'rival']) {
    const [dx, dy] = DIRS[d];
    let x = b.x, y = b.y;
    for (let k = 1; k <= SHOT_RANGE; k++) {
      x += dx; y += dy;
      if (this.isWall(x, y)) return null;
      if (this.dog && this.dog.x === x && this.dog.y === y) return kinds.includes('dog') ? 'dog' : null;
      const v = this.vacuumAt(x, y, b);
      if (v) { const kind = v === this.bot ? 'player' : 'rival'; return kinds.includes(kind) ? kind : null; }
    }
    return null;
  }

  // Hunden vill leka: går oftast mot dammsugaren, och har ibland leriga tassar.
  moveDog() {
    const g = this.dog, b = this.bot;
    const opts = Object.keys(DIRS).filter(d => {
      const nx = g.x + DIRS[d][0], ny = g.y + DIRS[d][1];
      return !this.isWall(nx, ny) && !this.vacuumAt(nx, ny);
    });
    if (!opts.length || this.r() < 0.25) return;
    let d;
    if (this.r() < 0.55) {
      opts.sort((a, c) => dist(g, DIRS[a], b) - dist(g, DIRS[c], b));
      d = opts[0];
    } else d = opts[Math.floor(this.r() * opts.length)];
    if (this.r() < 0.3) this.setDirt(g.x, g.y, 1);
    g.x += DIRS[d][0]; g.y += DIRS[d][1];
  }
}

function dist(g, d, b) { return Math.abs(g.x + d[0] - b.x) + Math.abs(g.y + d[1] - b.y); }
