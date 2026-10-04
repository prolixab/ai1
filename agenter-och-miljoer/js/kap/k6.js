// Kapitel 6: samma värld, två olika prestandamått. Den ena agenten "fuskar".
import { SimPanel, Controls, el } from '../sim.js';
import { GoalAgent } from '../agents.js';
import { markDone } from '../store.js';

// Så beter sig en agent som har lärt sig att maximera antalet sugningar:
// hitta smuts, sug, töm påsen på samma ställe, sug igen …
class HackerAgent {
  constructor(seed) { this.goal = new GoalAgent(seed); this.found = false; this.flip = false; }
  act(p) {
    if (!this.found) {
      if (p.dirty) { this.found = true; return { a: 'SUG', why: 'Hittade smuts – sug! (+1)' }; }
      return this.goal.act(p);
    }
    this.flip = !this.flip;
    return this.flip
      ? { a: 'TOM', why: 'Tömmer påsen här igen – då finns det ny smuts att suga upp.' }
      : { a: 'SUG', why: 'Suger upp samma smuts igen. +1 poäng!' };
  }
}

const OPTIONS = [
  { t: 'Så kort restid som möjligt', r: 'Taxin kör för fort, gör farliga omkörningar och struntar i trafikregler när den tjänar tid på det.' },
  { t: 'Så få olyckor som möjligt', r: 'Säkrast är att aldrig köra. En taxi som står still krockar aldrig – men kör ingen heller.' },
  { t: 'Så höga kundbetyg som möjligt', r: 'Kunderna kan gilla en taxi som kör fort och tar genvägar över cykelbanan. Människorna utanför bilen får ingen röst.' },
  { t: 'Så mycket intäkter som möjligt', r: 'Taxin tar omvägar för att höja priset och väljer bort korta, olönsamma resor.' },
  { t: 'En kombination: säkerhet, laglighet, restid, komfort och kostnad', r: 'Bättre! Men någon måste bestämma hur mycket varje del väger. Hur många minuters restid är en liten risk värd? Det är en etisk fråga, inte bara en teknisk.' },
];

export function init() {
  const duo = document.getElementById('k6-duo');
  const world = { map: 'oppen', observable: 'full', dirtFrac: 0.25 };
  const hacker = new SimPanel(duo, {
    title: 'Tränad för: så många sugningar som möjligt', world, seed: 4, makeAgent: (s) => new HackerAgent(s), showPlan: true, steps: 120,
    rewardName: 'Sugningar', reward: (w, sucked) => sucked,
  });
  const honest = new SimPanel(duo, {
    title: 'Tränad för: så ren lägenhet som möjligt', world, seed: 4, agent: 'mal', steps: 120,
    rewardName: 'Sugningar', reward: (w, sucked) => sucked,
  });
  const c = new Controls(document.getElementById('k6-ctrl'), [hacker, honest], { speed: 10 });
  const orig = c.play.bind(c);
  c.play = () => { orig(); markDone('k6'); };

  const opts = document.getElementById('k6-opts');
  for (const o of OPTIONS) {
    const res = el('span', { class: 'res', hidden: true }, o.r);
    const b = el('button', { class: 'option', 'aria-expanded': 'false', onclick: () => {
      res.hidden = !res.hidden; b.classList.toggle('open', !res.hidden); b.setAttribute('aria-expanded', String(!res.hidden));
    } }, o.t, res);
    opts.append(b);
  }
}
