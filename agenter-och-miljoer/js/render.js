// Ritar dammsugarvärlden på en canvas. Färger hämtas från CSS-variabler så att mörkt läge fungerar.
import { KNOW } from './agents.js';

function hash(i, k) {
  let h = (i * 374761393 + k * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class WorldView {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.onCell = null;
    canvas.addEventListener('click', (e) => {
      if (!this.onCell || !this.cs) return;
      const r = canvas.getBoundingClientRect();
      this.onCell(Math.floor((e.clientX - r.left) / this.cs), Math.floor((e.clientY - r.top) / this.cs));
    });
  }

  draw(world, o = {}) {
    const c = this.c, ctx = this.ctx;
    c.style.aspectRatio = `${world.w} / ${world.h}`;
    const W = c.clientWidth || 480, cs = W / world.w, H = cs * world.h, dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cs = cs;
    const css = getComputedStyle(c), v = (n) => css.getPropertyValue(n).trim();
    const col = { floor: v('--floor'), line: v('--floor-line'), wall: v('--wall'), dirt: v('--dirt'), bot: v('--bot'), botInk: v('--bot-ink'), dog: v('--dog'), charger: v('--charger'), plan: v('--plan'), fog: v('--fog'), mark: v('--mark') };

    ctx.clearRect(0, 0, W, H);
    for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
      const i = world.idx(x, y), px = x * cs, py = y * cs;
      if (world.walls[i]) { ctx.fillStyle = col.wall; ctx.fillRect(px, py, cs + .5, cs + .5); continue; }
      ctx.fillStyle = col.floor; ctx.fillRect(px, py, cs, cs);
      ctx.strokeStyle = col.line; ctx.lineWidth = 1; ctx.strokeRect(px + .5, py + .5, cs - 1, cs - 1);
      if (o.labels && o.labels[i]) {
        ctx.fillStyle = col.wall; ctx.font = `700 ${cs * .28}px system-ui`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(o.labels[i], px + cs * .08, py + cs * .06);
      }
      if (world.dirt[i]) {
        ctx.fillStyle = col.dirt;
        for (let k = 0; k < 5; k++) {
          ctx.beginPath();
          ctx.arc(px + cs * (.2 + .6 * hash(i, k)), py + cs * (.2 + .6 * hash(i, k + 9)), cs * (.05 + .06 * hash(i, k + 17)), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // laddstation
    const ch = world.charger;
    if (!o.noCharger) {
      ctx.strokeStyle = col.charger; ctx.lineWidth = Math.max(2, cs * .06);
      roundRect(ctx, ch.x * cs + cs * .1, ch.y * cs + cs * .1, cs * .8, cs * .8, cs * .15); ctx.stroke();
      ctx.fillStyle = col.charger;
      bolt(ctx, ch.x * cs + cs * .5, ch.y * cs + cs * .5, cs * .3);
    }

    // vad agenten vet: dimma över det okända
    if (o.know) {
      for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
        const k = o.know[world.idx(x, y)], px = x * cs, py = y * cs;
        if (k === KNOW.UNKNOWN) { ctx.fillStyle = col.fog; ctx.globalAlpha = .6; ctx.fillRect(px, py, cs + .5, cs + .5); }
        else if (k === KNOW.OPEN) { ctx.fillStyle = col.fog; ctx.globalAlpha = .45; ctx.fillRect(px, py, cs + .5, cs + .5); ctx.globalAlpha = 1; ctx.fillStyle = col.floor; ctx.font = `700 ${cs * .4}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', px + cs / 2, py + cs / 2); }
        else if (k === KNOW.DIRT) { ctx.globalAlpha = 1; ctx.strokeStyle = col.mark; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.strokeRect(px + 3, py + 3, cs - 6, cs - 6); ctx.setLineDash([]); }
        ctx.globalAlpha = 1;
      }
    }

    // planerad väg
    if (o.plan && o.plan.length > 1) {
      ctx.strokeStyle = col.plan; ctx.lineWidth = Math.max(2, cs * .07); ctx.setLineDash([cs * .12, cs * .1]); ctx.lineCap = 'round';
      ctx.beginPath();
      o.plan.forEach(([x, y], k) => (k ? ctx.lineTo : ctx.moveTo).call(ctx, x * cs + cs / 2, y * cs + cs / 2));
      ctx.stroke(); ctx.setLineDash([]);
      const [tx, ty] = o.plan[o.plan.length - 1];
      ctx.beginPath(); ctx.arc(tx * cs + cs / 2, ty * cs + cs / 2, cs * .32, 0, Math.PI * 2); ctx.stroke();
    }
    if (o.trail && o.trail.length > 1) {
      ctx.strokeStyle = col.bot; ctx.globalAlpha = .45; ctx.lineWidth = Math.max(2, cs * .1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      o.trail.forEach(([x, y], k) => (k ? ctx.lineTo : ctx.moveTo).call(ctx, x * cs + cs / 2, y * cs + cs / 2));
      ctx.stroke(); ctx.globalAlpha = 1;
    }

    if (world.dog) drawDog(ctx, world.dog.x * cs + cs / 2, world.dog.y * cs + cs / 2, cs, col.dog);
    if (!o.noBot) drawBot(ctx, world.bot, cs, col, world.o.battery ? world.bot.battery / world.o.capacity : null, o.pulse);
  }
}

function drawBot(ctx, b, cs, col, battery, pulse) {
  const cx = b.x * cs + cs / 2, cy = b.y * cs + cs / 2, r = cs * .36;
  if (pulse) { ctx.strokeStyle = col.bot; ctx.globalAlpha = .4; ctx.lineWidth = cs * .08; ctx.beginPath(); ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.fillStyle = b.dead ? '#888' : col.bot;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = col.botInk; ctx.lineWidth = Math.max(1.5, cs * .04);
  ctx.beginPath(); ctx.arc(cx, cy, r * .55, 0, Math.PI * 2); ctx.stroke();
  const d = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }[b.heading] || [1, 0];
  ctx.fillStyle = col.botInk;
  ctx.beginPath(); ctx.arc(cx + d[0] * r * .7, cy + d[1] * r * .7, r * .16, 0, Math.PI * 2); ctx.fill();
  if (b.dead) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = cs * .06;
    ctx.beginPath(); ctx.moveTo(cx - r * .4, cy - r * .4); ctx.lineTo(cx + r * .4, cy + r * .4); ctx.moveTo(cx + r * .4, cy - r * .4); ctx.lineTo(cx - r * .4, cy + r * .4); ctx.stroke();
  }
  if (battery !== null) {
    const w = cs * .7, x = cx - w / 2, y = b.y * cs + cs * .9;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x, y, w, cs * .07);
    ctx.fillStyle = battery > .3 ? '#22c55e' : battery > .12 ? '#eab308' : '#ef4444';
    ctx.fillRect(x, y, w * battery, cs * .07);
  }
}

function drawDog(ctx, cx, cy, cs, color) {
  const r = cs * .3;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(cx - r * .8, cy - r * .55, r * .38, r * .6, -.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + r * .8, cy - r * .55, r * .38, r * .6, .5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1b1b1b';
  ctx.beginPath(); ctx.arc(cx - r * .35, cy - r * .15, r * .12, 0, Math.PI * 2); ctx.arc(cx + r * .35, cy - r * .15, r * .12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy + r * .3, r * .2, r * .14, 0, 0, Math.PI * 2); ctx.fill();
}

function bolt(ctx, cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx + s * .15, cy - s); ctx.lineTo(cx - s * .55, cy + s * .15); ctx.lineTo(cx - s * .02, cy + s * .15);
  ctx.lineTo(cx - s * .15, cy + s); ctx.lineTo(cx + s * .55, cy - s * .15); ctx.lineTo(cx + s * .02, cy - s * .15);
  ctx.closePath(); ctx.fill();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
