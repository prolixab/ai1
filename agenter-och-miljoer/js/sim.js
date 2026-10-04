// Simuleringspanel (värld + agent + statistik) och uppspelningskontroller som kan styra flera paneler i takt.
import { World, ACTION_NAMES } from './world.js';
import { AGENTS } from './agents.js';
import { WorldView } from './render.js';

export function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null) e.append(k);
  return e;
}

const pct = (x) => `${Math.round(x * 100)} %`;

export class SimPanel {
  constructor(host, opts) {
    this.o = { steps: 200, showKnow: false, showPlan: true, ...opts };
    this.root = el('div', { class: 'sim-panel' });
    this.head = el('div', { class: 'sim-head' });
    this.canvas = el('canvas', { class: 'world' });
    this.stats = el('div', { class: 'sim-stats' });
    this.why = el('div', { class: 'sim-why', 'aria-live': 'polite' });
    this.root.append(this.head, this.canvas, this.stats, this.why);
    host.append(this.root);
    this.view = new WorldView(this.canvas);
    new ResizeObserver(() => this.render()).observe(this.canvas);
    this.reset(this.o.seed || 1);
  }
  set(opts) { Object.assign(this.o, opts); this.reset(this.seed); }
  reset(seed) {
    this.seed = seed;
    this.world = new World({ ...this.o.world, seed });
    this.agent = this.o.makeAgent ? this.o.makeAgent(seed + 1) : AGENTS[this.o.agent].make(seed + 1, this.o.reflexOrder);
    this.last = null;
    this.doneAt = null;
    this.trail = [[this.world.bot.x, this.world.bot.y]];
    this.head.textContent = this.o.title || AGENTS[this.o.agent].namn;
    this.sum = 0;
    this.render();
  }
  done() { return this.world.t >= this.o.steps; }
  step() {
    if (this.done()) return false;
    const r = this.agent.act(this.world.percept());
    const before = this.world.sucked;
    this.world.step(r.a);
    this.last = r;
    this.sum += this.o.reward ? this.o.reward(this.world, this.world.sucked - before) : 0;
    this.trail.push([this.world.bot.x, this.world.bot.y]);
    if (this.trail.length > 14) this.trail.shift();
    if (this.doneAt === null && this.world.dirtCount() === 0) this.doneAt = this.world.t;
    this.render();
    return true;
  }
  render() {
    const w = this.world, r = this.last;
    let know = null;
    if (this.o.showKnow && this.agent.knowledge) know = this.agent.knowledge(w.percept());
    this.view.draw(w, { know, trail: this.trail, plan: this.o.showPlan && r ? r.plan : null, pulse: w.last && w.last.actual === 'SUG' });
    const bat = w.o.battery ? ` · Batteri <b>${w.bot.battery}/${w.o.capacity}</b>` : '';
    this.stats.innerHTML = `Steg <b>${w.t}/${this.o.steps}</b> · Renhet nu <b>${pct(w.cleanliness())}</b> · Prestanda <b title="Genomsnittlig renhet över alla steg hittills">${pct(w.performance())}</b>${bat}${this.doneAt !== null ? ` · Allt rent efter <b>${this.doneAt}</b> steg` : ''}`;
    if (this.o.reward) this.stats.innerHTML = `<div class="reward">${this.o.rewardName}: <b>${Math.round(this.sum)}</b></div>` + this.stats.innerHTML;
    if (!r) { this.why.innerHTML = '<span class="muted">Tryck på <i>Kör</i> eller <i>Ett steg</i>.</span>'; return; }
    const ev = w.last || {};
    const notes = [];
    if (ev.slipped) notes.push(`slirade – gick ${ACTION_NAMES[ev.actual].toLowerCase().replace('gå ', '')} i stället`);
    if (ev.failed) notes.push('sugningen misslyckades');
    if (ev.blocked) notes.push(w.dog ? 'kom inte fram' : 'stötte i väggen');
    if (w.bot.dead) notes.push('batteriet är slut');
    this.why.innerHTML = `<b>${ACTION_NAMES[r.a]}</b> – ${r.why}${notes.length ? ` <span class="warn">(${notes.join(', ')})</span>` : ''}`;
  }
}

export class Controls {
  constructor(host, panels, opts = {}) {
    this.panels = panels;
    this.timer = null;
    this.speed = opts.speed || 6;
    this.playBtn = el('button', { onclick: () => this.toggle() }, '▶ Kör');
    const stepBtn = el('button', { class: 'ghost', onclick: () => { this.pause(); this.tick(); } }, 'Ett steg');
    const newBtn = el('button', { class: 'ghost', onclick: () => this.reset(Math.floor(Math.random() * 1e6)) }, 'Ny omgång');
    const again = el('button', { class: 'ghost', onclick: () => this.reset(this.panels[0].seed) }, 'Börja om');
    const speed = el('input', { type: 'range', min: 1, max: 30, value: this.speed, 'aria-label': 'Hastighet' });
    speed.addEventListener('input', () => { this.speed = +speed.value; });
    this.root = el('div', { class: 'toolbar' }, this.playBtn, stepBtn, again, newBtn, el('label', { class: 'speed' }, 'Fart ', speed));
    host.append(this.root);
  }
  tick() {
    let any = false;
    for (const p of this.panels) any = p.step() || any;
    if (!any) this.pause();
    return any;
  }
  toggle() { this.timer ? this.pause() : this.play(); }
  play() {
    if (this.panels.every(p => p.done())) this.reset(this.panels[0].seed);
    this.playBtn.textContent = '⏸ Pausa';
    const loop = () => { if (this.tick()) this.timer = setTimeout(loop, 1000 / this.speed); };
    this.timer = setTimeout(loop, 0);
  }
  pause() { clearTimeout(this.timer); this.timer = null; this.playBtn.textContent = '▶ Kör'; }
  reset(seed) { this.pause(); for (const p of this.panels) p.reset(seed); }
}

// Kör en agent snabbt utan att rita (för tävlingen i sandlådan).
export function headless(agentKey, worldOpts, seed, steps = 200, reflexOrder) {
  const w = new World({ ...worldOpts, seed });
  const a = AGENTS[agentKey].make(seed + 1, reflexOrder);
  while (w.t < steps) w.step(a.act(w.percept()).a);
  return { perf: w.performance(), dead: w.bot.dead };
}
