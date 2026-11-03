// Motståndarna i tävlingsläget: andra dammsugare som suger smuts åt sig själva.
// Varje motståndare styrs av en av agenterna från Sandlådan. I skjutläget får de dessutom
// en enkel reflexregel: OM någon står i skottlinjen och dammbollen är laddad → skjut (ibland).
import { DIRS, rng, SHOT_GRACE } from './world.js';
import { AGENTS } from './agents.js';

export const RIVALS = [
  { namn: 'Röd', agent: 'nytta', typ: 'nyttobaserad', color: '#e5484d' },
  { namn: 'Blå', agent: 'mal', typ: 'målbaserad', color: '#3b82f6' },
  { namn: 'Lila', agent: 'modell', typ: 'modellbaserad', color: '#a855f7' },
];

const ORDER = ['N', 'E', 'S', 'W'];
const SHOOT_CHANCE = 0.2;    // hur ofta en motståndare skjuter när någon står i linjen

export class RivalBrain {
  constructor(world, k, seed) {
    this.w = world;
    this.v = world.rivals[k];
    this.info = RIVALS[k];
    this.agent = AGENTS[this.info.agent].make(seed + 11 + k);
    this.r = rng(seed * 31 + k + 5);
  }

  act() {
    const w = this.w, v = this.v;
    if (v.out) return 'VANTA';
    if (w.o.shoot && w.t >= SHOT_GRACE && v.cool === 0 && !v.dead) {
      for (const d of ORDER) if (w.target(v, d) && this.r() < SHOOT_CHANCE) return `SKJUT:${d}`;
    }
    // Stod en annan dammsugare i vägen förra steget? Ta ett kliv åt sidan i stället för att fastna.
    if (v.last && v.last.byVacuum && this.r() < 0.7) {
      const free = ORDER.filter(d => {
        const nx = v.x + DIRS[d][0], ny = v.y + DIRS[d][1];
        return !w.isWall(nx, ny) && !w.vacuumAt(nx, ny, v) && !(w.dog && w.dog.x === nx && w.dog.y === ny);
      });
      if (free.length) return free[Math.floor(this.r() * free.length)];
    }
    return this.agent.act(w.percept(v)).a;
  }
}

export function makeRivals(world, seed) {
  return world.rivals.map((_, k) => new RivalBrain(world, k, seed));
}
