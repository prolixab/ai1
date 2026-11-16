/*
 * Flödesschema-redigerare. Rutor: start, process, decision (beslut), output (utskrift), end.
 * Rutorna dras runt i en SVG. Pilar ritas genom att dra från en prick till en ruta,
 * eller genom att välja mål i panelen under schemat.
 */
(function () {
  "use strict";

  const W = 860;
  const CH = 8.1; // teckenbredd i px för 13.5px JetBrains Mono
  const TYPNAMN = { start: "Start", end: "Slut", process: "Process", decision: "Beslut", output: "Utskrift" };
  const PLATS = { process: "t.ex. x ← 0  (en tilldelning per rad)", decision: "t.ex. x > 5", output: 't.ex. "LARM"  eller  x' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function size(n) {
    if (n.type === "start" || n.type === "end") return { w: 112, h: 44 };
    const lines = (displayText(n) || " ").split("\n");
    const len = Math.max(4, ...lines.map((l) => l.length));
    if (n.type === "decision") return { w: Math.min(360, Math.max(170, len * CH + 96)), h: Math.max(84, lines.length * 18 + 56) };
    const w = Math.min(340, Math.max(150, len * CH + 36));
    return { w: n.type === "output" ? w + 28 : w, h: Math.max(50, lines.length * 18 + 26) };
  }
  function displayText(n) {
    const t = (n.text || "").trim();
    if (n.type === "start") return "Start";
    if (n.type === "end") return "Slut";
    if (!t) return "";
    if (n.type === "decision") return t.replace(/\?*$/, "?");
    if (n.type === "output") return /^(SKRIV\s+UT|SKRIV|VISA)\s/i.test(t) ? t : "Skriv ut " + t;
    return t;
  }
  function box(n) {
    const s = size(n);
    return { x: n.x, y: n.y, w: s.w, h: s.h, l: n.x - s.w / 2, r: n.x + s.w / 2, t: n.y - s.h / 2, b: n.y + s.h / 2 };
  }

  class FlowEditor {
    constructor(root, graph, opts) {
      this.root = root;
      this.opts = opts || {};
      this.sel = null;
      this.armed = null;
      this.active = null;
      this.errNode = null;
      this.undo = [];
      root.classList.add("fe");
      root.innerHTML = `
        <div class="fe-tools" role="toolbar" aria-label="Lägg till rutor">
          <button type="button" class="fe-add" data-add="process"><svg viewBox="0 0 28 18" aria-hidden="true"><rect x="2" y="3" width="24" height="12" rx="2"/></svg>Process</button>
          <button type="button" class="fe-add" data-add="decision"><svg viewBox="0 0 28 18" aria-hidden="true"><polygon points="14,1 27,9 14,17 1,9"/></svg>Beslut</button>
          <button type="button" class="fe-add" data-add="output"><svg viewBox="0 0 28 18" aria-hidden="true"><polygon points="6,3 27,3 22,15 1,15"/></svg>Utskrift</button>
          <button type="button" class="fe-add" data-add="end"><svg viewBox="0 0 28 18" aria-hidden="true"><rect x="2" y="3" width="24" height="12" rx="6"/></svg>Slut</button>
          <span class="fe-sp"></span>
          <button type="button" class="fe-undo" title="Ångra (Ctrl+Z)">↶ Ångra</button>
        </div>
        <div class="fe-canvas"><svg class="fe-svg" role="application" aria-label="Flödesschema"></svg><p class="fe-hint" aria-live="polite"></p></div>
        <div class="fe-panel"></div>`;
      this.svg = root.querySelector(".fe-svg");
      this.panel = root.querySelector(".fe-panel");
      this.hint = root.querySelector(".fe-hint");
      root.querySelectorAll(".fe-add").forEach((b) => b.addEventListener("click", () => this.add(b.dataset.add)));
      root.querySelector(".fe-undo").addEventListener("click", () => this.doUndo());
      this.bindPointer();
      this.onKey = (e) => {
        if (!document.body.contains(this.root) || this.root.offsetParent === null) return;
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag === "textarea" || tag === "input" || tag === "select") return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); this.doUndo(); }
        else if ((e.key === "Delete" || e.key === "Backspace") && this.sel != null) { e.preventDefault(); this.remove(this.sel); }
        else if (e.key === "Escape") { this.armed = null; this.select(null); }
      };
      document.addEventListener("keydown", this.onKey);
      this.setGraph(graph);
    }

    destroy() { document.removeEventListener("keydown", this.onKey); }

    setGraph(g) {
      this.g = JSON.parse(JSON.stringify(g));
      this.sel = null; this.armed = null; this.active = null; this.errNode = null;
      this.render(); this.renderPanel();
    }
    getGraph() { return JSON.parse(JSON.stringify(this.g)); }
    node(id) { return this.g.nodes.find((n) => n.id === id); }
    changed() { this.opts.onChange && this.opts.onChange(this.getGraph()); }
    snap() { this.undo.push(JSON.stringify(this.g)); if (this.undo.length > 60) this.undo.shift(); }
    doUndo() {
      const s = this.undo.pop();
      if (!s) return;
      this.g = JSON.parse(s);
      if (this.sel != null && !this.node(this.sel)) this.sel = null;
      this.render(); this.renderPanel(); this.changed();
    }

    setActive(id) { this.active = id; this.render(); }
    setError(id) { this.errNode = id; this.render(); }

    add(type) {
      this.snap();
      const id = Math.max(0, ...this.g.nodes.map((n) => n.id)) + 1;
      const n = { id, type, x: 0, y: 0, text: "" };
      // Hitta en ledig plats nära mitten av det synliga området.
      const H = this.height();
      const cands = [];
      for (let y = 140; y < H + 200; y += 70) for (const x of [420, 660, 180, 300, 540, 760, 90]) cands.push({ x, y });
      const free = cands.find((c) => { n.x = c.x; n.y = c.y; const b = box(n); return this.g.nodes.every((m) => { const o = box(m); return b.r + 16 < o.l || b.l - 16 > o.r || b.b + 16 < o.t || b.t - 16 > o.b; }); }) || { x: 420, y: H };
      n.x = free.x; n.y = free.y;
      this.g.nodes.push(n);
      this.sel = id;
      this.render(); this.renderPanel(); this.changed();
      const ta = this.panel.querySelector("textarea");
      if (ta) ta.focus();
    }
    remove(id) {
      const n = this.node(id);
      if (!n || n.type === "start") return;
      this.snap();
      this.g.nodes = this.g.nodes.filter((m) => m.id !== id);
      this.g.nodes.forEach((m) => ["next", "ja", "nej"].forEach((p) => { if (m[p] === id) delete m[p]; }));
      if (this.sel === id) this.sel = null;
      this.render(); this.renderPanel(); this.changed();
    }
    link(id, port, to) {
      const n = this.node(id);
      if (!n || to === id) return;
      this.snap();
      if (to == null) delete n[port]; else n[port] = to;
      this.render(); this.renderPanel(); this.changed();
    }
    select(id) {
      this.sel = id;
      this.render(); this.renderPanel();
    }

    height() { return Math.max(680, ...this.g.nodes.map((n) => box(n).b + 70)); }

    // Vilken sida en pil lämnar rutan från: "bottom", "left" eller "right".
    exitSide(n, port) {
      const t = n[port] != null ? this.node(n[port]) : null;
      if (!t) return port === "nej" ? "right" : "bottom";
      const s = box(n), b = box(t);
      const back = b.y < s.y - 30, sameRow = Math.abs(b.y - s.y) <= 30;
      if (port === "nej") return b.x < s.x - 4 ? "left" : "right";
      if (back && port === "ja") return this.exitSide(n, "nej") === "right" ? "left" : "right";
      if (back) return s.x <= b.x ? "left" : "right";
      if (sameRow) return b.x < s.x ? "left" : "right";
      return "bottom";
    }

    ports(n) {
      const b = box(n);
      if (n.type === "end") return [];
      const ps = n.type === "decision" ? ["ja", "nej"] : ["next"];
      return ps.map((p) => {
        const side = this.exitSide(n, p);
        return { p, x: side === "left" ? b.l : side === "right" ? b.r : b.x, y: side === "bottom" ? b.b : b.y };
      });
    }

    /* ---------- Pilar ---------- */
    route(n, port, t, lane) {
      const s = box(n), b = box(t);
      const back = b.y < s.y - 30;
      const sameRow = Math.abs(b.y - s.y) <= 30;
      const side = this.exitSide(n, port);
      if (side === "bottom") {
        const p0 = { x: s.x, y: s.b };
        if (back || sameRow) {
          const lx = Math.max(s.r, b.r) + 28 + 16 * lane;
          return { d: `M${p0.x} ${p0.y} V${p0.y + 16} H${lx} V${b.y} H${b.r}`, lab: p0 };
        }
        if (Math.abs(b.x - p0.x) < 3) return { d: `M${p0.x} ${p0.y} V${b.t}`, lab: p0 };
        const my = (p0.y + b.t) / 2;
        return { d: `M${p0.x} ${p0.y} V${my} H${b.x} V${b.t}`, lab: p0 };
      }
      const dir = side === "left" ? -1 : 1;
      const p0 = { x: side === "left" ? s.l : s.r, y: s.y };
      if (back) {
        const lx = side === "left" ? Math.min(s.l, b.l) - 28 - 16 * lane : Math.max(s.r, b.r) + 28 + 16 * lane;
        // Gå in i målet från samma sida som loopen går, om målet ligger på den sidan; annars uppifrån.
        const ex = side === "left" ? b.l : b.r;
        return { d: `M${p0.x} ${p0.y} H${lx} V${b.y} H${ex}`, lab: p0, side };
      }
      if (sameRow) {
        const ex = dir > 0 ? b.l : b.r;
        if (Math.abs(b.y - s.y) < 3) return { d: `M${p0.x} ${p0.y} H${ex}`, lab: p0, side };
        const mx = (p0.x + ex) / 2;
        return { d: `M${p0.x} ${p0.y} H${mx} V${b.y} H${ex}`, lab: p0, side };
      }
      if ((b.x - p0.x) * dir > 8) return { d: `M${p0.x} ${p0.y} H${b.x} V${b.t}`, lab: p0, side };
      const ox = p0.x + dir * 24, my = (s.b + b.t) / 2;
      return { d: `M${p0.x} ${p0.y} H${ox} V${my} H${b.x} V${b.t}`, lab: p0, side };
    }

    shape(n) {
      const b = box(n);
      if (n.type === "start" || n.type === "end") return `<rect x="${b.l}" y="${b.t}" width="${b.w}" height="${b.h}" rx="${b.h / 2}"/>`;
      if (n.type === "decision") return `<polygon points="${b.x},${b.t} ${b.r},${b.y} ${b.x},${b.b} ${b.l},${b.y}"/>`;
      if (n.type === "output") return `<polygon points="${b.l + 14},${b.t} ${b.r},${b.t} ${b.r - 14},${b.b} ${b.l},${b.b}"/>`;
      return `<rect x="${b.l}" y="${b.t}" width="${b.w}" height="${b.h}" rx="4"/>`;
    }

    render() {
      const H = this.height();
      this.svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      this.svg.style.aspectRatio = W + " / " + H;
      let edges = "", labels = "";
      const lanes = { left: 0, right: 0 };
      this.g.nodes.forEach((n) => {
        ["next", "ja", "nej"].forEach((p) => {
          if (n[p] == null) return;
          const t = this.node(n[p]);
          if (!t) return;
          const back = box(t).y < box(n).y - 30;
          const es = this.exitSide(n, p);
          const lane = back ? lanes[es === "left" ? "left" : "right"]++ : 0;
          const r = this.route(n, p, t, lane);
          const on = this.activeEdge && this.activeEdge.from === n.id && this.activeEdge.port === p;
          edges += `<path class="fe-edge${on ? " on" : ""}" d="${r.d}" marker-end="url(#fe-ah)"/>`;
          if (p !== "next") {
            const lx = r.side === "left" ? r.lab.x - 8 : r.side === "right" ? r.lab.x + 8 : r.lab.x + 8;
            const ly = r.side ? r.lab.y - 7 : r.lab.y + 15;
            labels += `<text class="fe-lab ${p}" x="${lx}" y="${ly}" text-anchor="${r.side === "left" ? "end" : "start"}">${p === "ja" ? "Ja" : "Nej"}</text>`;
          }
        });
      });
      let nodes = "";
      this.g.nodes.forEach((n) => {
        const b = box(n);
        const txt = displayText(n);
        const lines = (txt || "(tom)").split("\n");
        const y0 = b.y - ((lines.length - 1) * 18) / 2 + 5;
        const cls = ["fe-node", "t-" + n.type, this.sel === n.id ? "sel" : "", this.active === n.id ? "on" : "", this.errNode === n.id ? "err" : "", !txt ? "empty" : ""].join(" ");
        const t = lines.map((l, i) => `<text x="${b.x}" y="${y0 + i * 18}" text-anchor="middle">${esc(l)}</text>`).join("");
        const tag = n.type === "start" ? "" : `<text class="fe-id" x="${n.type === "decision" ? b.x + 12 : b.l + (n.type === "output" ? 12 : 0)}" y="${b.t - 5}">${n.id}</text>`;
        const ports = this.ports(n).map((pt) => {
          const missing = n[pt.p] == null;
          return `<g class="fe-port${missing ? " missing" : ""}${this.armed && this.armed.id === n.id && this.armed.port === pt.p ? " armed" : ""}" data-port="${pt.p}" data-of="${n.id}">
            <circle class="hit" cx="${pt.x}" cy="${pt.y}" r="15"/><circle class="dot" cx="${pt.x}" cy="${pt.y}" r="6"/></g>`;
        }).join("");
        nodes += `<g class="${cls}" data-node="${n.id}">${this.shape(n)}${t}${tag}</g>${ports}`;
      });
      this.svg.innerHTML = `<defs><marker id="fe-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
        <g class="fe-edges">${edges}</g>${labels}${nodes}<path class="fe-temp" d="" marker-end="url(#fe-ah)"/>`;
      this.hint.textContent = this.armed ? "Klicka på rutan som pilen ska gå till (Esc avbryter)." : "";
    }

    optionLabel(m) {
      const t = (m.text || "").split("\n")[0];
      return TYPNAMN[m.type] + " " + m.id + (t ? ": " + (t.length > 26 ? t.slice(0, 25) + "…" : t) : "");
    }

    renderPanel() {
      const n = this.sel != null ? this.node(this.sel) : null;
      if (!n) {
        this.panel.innerHTML = `<p class="fe-help"><b>Så bygger du:</b> lägg till rutor med knapparna ovanför. Dra rutorna för att flytta dem. Dra från en <span class="dotinl"></span> prick till en annan ruta för att rita en pil – eller markera en ruta och välj pilarna här.</p>`;
        return;
      }
      const targets = this.g.nodes.filter((m) => m.id !== n.id && m.type !== "start");
      const sel = (port, label) => `<label class="fe-link"><span>${label}</span><select data-link="${port}"><option value="">— ingen pil —</option>${targets.map((m) => `<option value="${m.id}"${n[port] === m.id ? " selected" : ""}>${esc(this.optionLabel(m))}</option>`).join("")}</select></label>`;
      const links = n.type === "end" ? "" : n.type === "decision" ? sel("ja", "Ja →") + sel("nej", "Nej →") : sel("next", "Pil till →");
      const edit = n.type === "start" || n.type === "end" ? "" :
        `<label class="fe-txt"><span>${n.type === "decision" ? "Villkor" : n.type === "output" ? "Skriv ut" : "Gör"}</span>
          <textarea rows="${n.type === "process" ? 3 : 1}" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="${esc(PLATS[n.type])}">${esc(n.text || "")}</textarea></label>
          <div class="fe-ins">${["←", "≠", "≤", "≥", '""', "SANT", "FALSKT"].map((s) => `<button type="button" data-ins="${esc(s)}">${esc(s)}</button>`).join("")}</div>`;
      this.panel.innerHTML = `<div class="fe-ph"><b>${TYPNAMN[n.type]} ${n.id}</b>${n.type !== "start" ? `<button type="button" class="fe-del">Ta bort rutan</button>` : ""}</div>${edit}<div class="fe-links">${links}</div><p class="fe-err" aria-live="polite"></p>`;
      const ta = this.panel.querySelector("textarea");
      if (ta) {
        ta.addEventListener("focus", () => this.snap(), { once: true });
        ta.addEventListener("input", () => { n.text = ta.value.replace(/\r/g, ""); this.render(); this.changed(); this.checkNode(n); });
        this.panel.querySelectorAll("[data-ins]").forEach((b) => b.addEventListener("click", () => {
          const s = b.dataset.ins;
          ta.focus();
          const a = ta.selectionStart, e = ta.selectionEnd;
          const ins = s === '""' ? '""' : (s.length > 1 ? s + " " : s);
          ta.setRangeText(ins, a, e, "end");
          if (s === '""') ta.selectionStart = ta.selectionEnd = a + 1;
          ta.dispatchEvent(new Event("input"));
        }));
        this.checkNode(n);
      }
      this.panel.querySelectorAll("select[data-link]").forEach((s) => s.addEventListener("change", () => this.link(n.id, s.dataset.link, s.value ? +s.value : null)));
      const del = this.panel.querySelector(".fe-del");
      if (del) del.addEventListener("click", () => this.remove(n.id));
    }

    checkNode(n) {
      const out = this.panel.querySelector(".fe-err");
      if (!out || !window.Tolk) return;
      if (!(n.text || "").trim()) { out.textContent = ""; return; }
      try { window.Tolk.compileNode(n); out.textContent = ""; out.classList.remove("bad"); }
      catch (e) { out.textContent = e.message.replace(/ på rad \d+/, "").replace(/Ett OM på rad \d+/, ""); out.classList.add("bad"); }
    }

    /* ---------- Mus och pekskärm ---------- */
    pt(e) {
      const p = this.svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(this.svg.getScreenCTM().inverse());
    }
    bindPointer() {
      const svg = this.svg;
      let drag = null, conn = null;
      svg.addEventListener("pointerdown", (e) => {
        const port = e.target.closest("[data-port]");
        const g = e.target.closest("[data-node]");
        const p = this.pt(e);
        if (port) {
          e.preventDefault();
          conn = { id: +port.dataset.of, port: port.dataset.port, x0: p.x, y0: p.y, moved: false };
          svg.setPointerCapture(e.pointerId);
          return;
        }
        if (g) {
          const id = +g.dataset.node;
          if (this.armed) {
            const a = this.armed; this.armed = null;
            if (id !== a.id && this.node(id).type !== "start") this.link(a.id, a.port, id); else this.render();
            return;
          }
          e.preventDefault();
          const n = this.node(id);
          if (this.sel !== id) this.select(id);
          drag = { id, dx: n.x - p.x, dy: n.y - p.y, moved: false, x0: n.x, y0: n.y };
          svg.setPointerCapture(e.pointerId);
          return;
        }
        if (this.armed) { this.armed = null; this.render(); }
        if (this.sel != null) this.select(null);
      });
      svg.addEventListener("pointermove", (e) => {
        if (drag) {
          const p = this.pt(e), n = this.node(drag.id);
          const nx = Math.round((p.x + drag.dx) / 10) * 10, ny = Math.round((p.y + drag.dy) / 10) * 10;
          if (!drag.moved && Math.hypot(nx - drag.x0, ny - drag.y0) < 6) return;
          if (!drag.moved) { this.snap(); drag.moved = true; }
          const b = box(n);
          n.x = Math.max(b.w / 2 + 4, Math.min(W - b.w / 2 - 4, nx));
          n.y = Math.max(b.h / 2 + 4, ny);
          this.render();
        } else if (conn) {
          const p = this.pt(e);
          if (Math.hypot(p.x - conn.x0, p.y - conn.y0) > 6) conn.moved = true;
          const t = svg.querySelector(".fe-temp");
          if (t) t.setAttribute("d", `M${conn.x0} ${conn.y0} L${p.x} ${p.y}`);
        }
      });
      const up = (e) => {
        if (drag) { if (drag.moved) this.changed(); drag = null; }
        if (conn) {
          const c = conn; conn = null;
          const t = svg.querySelector(".fe-temp"); if (t) t.setAttribute("d", "");
          if (!c.moved) { this.armed = { id: c.id, port: c.port }; this.render(); return; }
          const el = document.elementFromPoint(e.clientX, e.clientY);
          const g = el && el.closest && el.closest("[data-node]");
          if (g && +g.dataset.node !== c.id && this.node(+g.dataset.node).type !== "start") this.link(c.id, c.port, +g.dataset.node);
          else this.render();
        }
      };
      svg.addEventListener("pointerup", up);
      svg.addEventListener("pointercancel", up);
    }
  }

  window.FlowEditor = FlowEditor;
})();
