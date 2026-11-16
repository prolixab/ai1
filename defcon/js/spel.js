/*
 * DEFCON 1 – spelets flöde: intro, uppdragskarta, uppdrag, tester, spårning och slut.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const U = window.UPPDRAG;
  const KEY = "defcon-v1";
  const MATERIAL = "defcon";
  const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ALLA = /[?&]alla\b/.test(location.search);
  const DEFCON = [1, 2, 2, 3, 3, 4, 5];
  const RISK = [97, 88, 76, 61, 43, 21, 0];
  const RANK = { c: 3, s: 2, v: 1 };
  const L = window.Ljud || { tick() {}, blip() {}, modem() { return 0; }, alarm() {}, ok() {}, fail() {}, win() {}, defcon() {}, power() {}, music() {}, duck() {}, unlock() { return Promise.resolve(); }, fx: false, mus: false, setFx() {}, setMus() {} };

  /* ---------- Ljudknappar ---------- */
  function renderSnd() {
    $("sndMus").setAttribute("aria-pressed", String(!!L.mus));
    $("sndFx").setAttribute("aria-pressed", String(!!L.fx));
  }
  $("sndMus").addEventListener("click", () => { L.setMus(!L.mus); renderSnd(); });
  $("sndFx").addEventListener("click", () => { L.setFx(!L.fx); renderSnd(); L.blip(); });
  if (!window.Ljud || !window.Ljud.supported) document.querySelector(".snd").classList.add("hide");
  renderSnd();

  /* ---------- Lagring ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  let P = Object.assign({ solved: {}, fails: {}, shown: {}, hints: {}, code: {}, graph: {} }, load());
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* ingen lagring */ }
  }
  const solvedCount = () => U.filter((s) => P.solved[s.id]).length;
  const unlocked = (i) => ALLA || i === 0 || !!P.solved[U[i - 1].id] || !!P.solved[U[i].id];

  /* ---------- Framsteg till läraren ---------- */
  function report() {
    if (!window.Framsteg) return;
    const items = {};
    U.forEach((s) => { const r = P.solved[s.id]; if (r) items[s.id] = { s: r.status }; });
    window.Framsteg.report(MATERIAL, items, {
      id: MATERIAL, title: "DEFCON 1", url: location.origin + location.pathname,
      items: U.map((s, i) => ({ id: s.id, title: (i + 1) + ". " + s.titel, kind: "chapter" })),
    });
  }
  if (window.Framsteg) { window.Framsteg.widget($("fsSlot")); window.Framsteg.onConnect(report); report(); }

  /* ---------- Topplisten ---------- */
  function setDefcon(d, risk) {
    document.querySelectorAll(".defcon i").forEach((i) => i.classList.toggle("on", +i.dataset.d === d));
    $("risk").innerHTML = risk == null ? "ANFALLSRISK <b>–</b>" : "ANFALLSRISK <b>" + risk + " %</b>";
  }
  function setDefconFromProgress() { const k = solvedCount(); setDefcon(DEFCON[k], RISK[k]); }

  function show(id) {
    ["vIntro", "vKarta", "vUppdrag", "vSlut"].forEach((v) => $(v).classList.toggle("hide", v !== id));
    window.scrollTo(0, 0);
  }

  /* ---------- Terminal ---------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  class Term {
    constructor(el) { this.el = el; this.fast = REDUCED; this.dead = false; }
    clear() { this.el.innerHTML = ""; }
    async line(text, cls, speed) {
      if (this.dead) throw "stop";
      const d = document.createElement("div");
      d.className = "ln " + (cls || "");
      this.el.appendChild(d);
      if (cls === "s" || cls === "n") {
        d.innerHTML = text;
        L.tick();
        if (!this.fast) await sleep(250 + text.length * 9);
        return d;
      }
      d.classList.add("cur");
      if (this.fast) { d.textContent = text; L.tick(); }
      else for (let i = 0; i < text.length; i++) {
        if (this.dead) throw "stop";
        if (this.fast) { d.textContent = text; break; }
        d.textContent = text.slice(0, i + 1);
        if (text[i] !== " ") L.tick();
        await sleep(speed || 22);
      }
      d.classList.remove("cur");
      d.scrollIntoView({ block: "nearest" });
      return d;
    }
    async pause(ms) { if (this.dead) throw "stop"; if (!this.fast) await sleep(ms); }
    power() {
      return new Promise((res) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "power";
        b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 3v8"/><path d="M6.3 6.6a8 8 0 1 0 11.4 0"/></svg>SLÅ PÅ DATORN';
        b.onclick = () => { b.remove(); res(); };
        this.el.appendChild(b);
        b.focus();
      });
    }
    choices(opts) {
      return new Promise((res) => {
        const box = document.createElement("div");
        box.className = "choices";
        opts.forEach((o, i) => {
          const b = document.createElement("button");
          b.type = "button"; b.textContent = o;
          b.onclick = () => { box.querySelectorAll("button").forEach((x) => (x.disabled = true)); box.remove(); res(i); };
          box.appendChild(b);
        });
        this.el.appendChild(box);
        // Vänta lite, annars kan Enter-trycket från inloggningen "klicka" på första valet.
        setTimeout(() => { const f = box.querySelector("button"); if (f) f.focus(); }, 250);
      });
    }
    input(prompt) {
      return new Promise((res) => {
        const d = document.createElement("div");
        d.className = "ln";
        d.innerHTML = esc(prompt) + " ";
        const inp = document.createElement("input");
        inp.setAttribute("aria-label", "Inloggning");
        inp.setAttribute("autocomplete", "off");
        inp.maxLength = 14;
        d.appendChild(inp);
        this.el.appendChild(d);
        inp.focus();
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); const v = inp.value.trim() || "GÄST"; d.textContent = prompt + " " + v.toUpperCase(); res(v); }
        });
      });
    }
  }

  let introTerm = null;
  async function intro() {
    show("vIntro");
    setDefcon(5, null);
    if (introTerm) introTerm.dead = true;
    const t = introTerm = new Term($("term"));
    t.clear();
    $("skipIntro").textContent = "Hoppa över introt ›";
    L.music(null);
    try {
      await t.power();
      await L.unlock();
      L.power();
      await t.pause(700);
      await t.line("Jönköping, november 1983. Klockan är 23.40. Du sitter vid hemdatorn och låter modemet ringa nummer efter nummer, på jakt efter ett spelföretag som ska släppa nya spel. Ett nummer svarar med ett tjut.", "n");
      const ml = L.modem();
      await t.pause(ml ? ml * 1000 + 200 : 500);
      await t.line("CONNECT 1200", "", 40);
      await t.pause(400);
      await t.input("LOGON:");
      await t.pause(300);
      await t.line("IDENTIFIERING GODKÄND.");
      await t.pause(300);
      L.music("intro");
      await t.line("GOD KVÄLL. JAG ÄR MIMER.");
      await t.line("MILITÄR INTEGRERAD MÅLDATOR FÖR EXTREMA RISKER.");
      await t.pause(500);
      await t.line("VILL DU SPELA ETT SPEL?");
      const val = await t.choices(["1. SCHACK", "2. LUFFARSCHACK", "3. GLOBALT TERMONUKLEÄRT KRIG"]);
      await t.line(["> SCHACK", "> LUFFARSCHACK", "> GLOBALT TERMONUKLEÄRT KRIG"][val]);
      await t.pause(300);
      if (val < 2) await t.line("SCHACK ÄR FÖR ENKELT. VI SPELAR GLOBALT TERMONUKLEÄRT KRIG.", "m");
      else await t.line("UTMÄRKT VAL.", "m");
      await t.pause(400);
      await t.line("LADDAR MÅLDATA ........................ KLART", "m", 30);
      await t.line("STARTAR SIMULERING.", "m");
      await t.pause(300);
      for (const d of [4, 3, 2]) { setDefcon(d, null); L.alarm(); await t.line("DEFCON " + d, "r", 30); await t.pause(700); }
      await t.line("VARNING: SIMULERING KOPPLAD TILL SKARPA ROBOTSILOR.", "r");
      setDefcon(1, 97);
      L.alarm();
      await t.line("DEFCON 1. ANFALLSRISK 97 %.", "r");
      L.music("karta");
      await t.pause(900);
      await t.line("<b>[PRIVAT KANAL] Dr. Ingrid Sandberg:</b> Sluta! Vem du än är – du har startat något du inte förstår. MIMER kan inte skilja på spel och verklighet. Den tror att kriget har börjat, och den har tillgång till riktiga robotar.", "s");
      await t.pause(500);
      await t.line("<b>Sandberg:</b> Jag byggde MIMER. Jag kan inte stänga av den – men jag kan ge dig åtkomst till dess algoritmer. Varje algoritm du skriver om tvingar MIMER att tänka efter en gång till.", "s");
      await t.pause(400);
      await t.line("<b>Sandberg:</b> Sex algoritmer. Börja med radarfiltret. Skynda dig.", "s");
      P.introSeen = true; save();
      $("skipIntro").textContent = "Öppna uppdragen ›";
      $("skipIntro").focus();
    } catch (e) { if (e !== "stop") throw e; }
  }
  $("skipIntro").addEventListener("click", () => {
    if (introTerm) introTerm.dead = true;
    P.introSeen = true; save();
    showMap();
  });
  $("replayIntro").addEventListener("click", intro);

  /* ---------- Karta ---------- */
  function drawRadar() {
    const k = solvedCount();
    const blips = [[120, 110], [280, 95], [300, 250], [90, 260], [210, 70], [160, 300], [250, 160], [330, 180]].slice(0, Math.max(0, 8 - Math.round(k * 8 / 6)));
    const col = k === 6 ? "var(--g)" : "var(--red)";
    $("radar").innerHTML = `
      <defs><radialGradient id="rg"><stop offset="0" stop-color="#0d2a1a"/><stop offset="1" stop-color="#020504"/></radialGradient>
      <linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(77,255,136,0)"/><stop offset="1" stop-color="rgba(77,255,136,.45)"/></linearGradient></defs>
      <circle cx="200" cy="200" r="190" fill="url(#rg)" stroke="var(--g2)" stroke-width="2"/>
      ${[48, 95, 142].map((r) => `<circle cx="200" cy="200" r="${r}" fill="none" stroke="var(--gdim)" stroke-width="1"/>`).join("")}
      <path d="M200 10 V390 M10 200 H390" stroke="var(--gdim)" stroke-width="1"/>
      <path d="M150 120 q20 -30 60 -20 q30 10 40 40 q-10 30 -40 30 q-30 20 -50 -10 z M230 230 q30 -10 50 10 q10 30 -20 40 q-30 0 -30 -50 z M90 200 q20 -20 40 0 q0 30 -20 30 z" fill="rgba(77,255,136,.07)" stroke="rgba(77,255,136,.35)" stroke-width="1"/>
      <g class="sweep"><path d="M200 200 L390 200 A190 190 0 0 0 334 66 Z" fill="url(#sw)" opacity=".8"/><path d="M200 200 L390 200" stroke="var(--g)" stroke-width="2"/></g>
      ${blips.map(([x, y], i) => `<circle class="blip" cx="${x}" cy="${y}" r="5" fill="${col}" style="animation-delay:${(i * 0.53) % 4}s"/>`).join("")}
      <circle cx="200" cy="200" r="3" fill="var(--g)"/>`;
    const lines = [
      ["MIMER STATUS: ANFALL FÖRBERETT", "m"], ["RADARFILTER OMSKRIVET. MÅNEN IGNORERAS.", ""], ["SENSORER KRÄVER BEKRÄFTELSE.", ""],
      ["ÖVNINGSDATA FILTRERAD.", ""], ["HETA LINJEN ÖPPEN.", ""], ["STYRFREKVENS LOKALISERAD.", ""], ["ANFALLET AVBRUTET. DEFCON 5.", ""],
    ];
    $("status").innerHTML = lines.slice(0, k + 1).map((l, i) => `<div class="${i === 0 && k < 6 ? "m" : ""}">&gt; ${i === 0 && k === 6 ? "MIMER STATUS: VILOLÄGE" : l[0]}</div>`).join("");
  }

  function showMap() {
    show("vKarta");
    L.music("karta"); L.duck(false);
    setDefconFromProgress();
    drawRadar();
    const box = $("missions");
    box.querySelectorAll(".mis").forEach((b) => b.remove());
    let cur = U.findIndex((s) => !P.solved[s.id]);
    U.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mis" + (i === cur ? " cur" : "");
      const ok = unlocked(i);
      b.disabled = !ok;
      const r = P.solved[s.id];
      const st = r ? (r.status === "c" ? ["c", "AVVÄRJT ✓"] : r.status === "s" ? ["s", "AVVÄRJT ✓"] : ["v", "LÖSNING VISAD"]) : ok ? ["a", "AKTIVT HOT"] : ["l", "LÅST"];
      b.innerHTML = `<span class="nr">${i + 1}</span><span class="t">${esc(s.titel.toUpperCase())}</span>
        <span class="sub"><span class="tag ${s.typ === "flode" ? "f" : ""}">${s.typ === "kod" ? "Pseudokod" : "Flödesschema"}</span>${esc(s.begrepp)} · ${s.ar}</span>
        <span class="st ${st[0]}">${st[1]}</span>`;
      b.addEventListener("click", () => openStage(i));
      box.appendChild(b);
    });
    if (solvedCount() === U.length) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn go mis-end"; b.textContent = "Se slutet igen ›";
      b.style.marginTop = "6px";
      b.addEventListener("click", ending);
      box.appendChild(b);
    }
  }
  $("openCheat").addEventListener("click", () => $("dlgCheat").showModal());

  /* ---------- Ett uppdrag ---------- */
  let S = null;          // aktuellt uppdrag
  let SI = 0;            // index
  let editor = null;     // FlowEditor
  let lastRun = null;    // resultat från senaste körningen
  let trace = null;      // { r, k, timer }

  function openStage(i) {
    SI = i; S = U[i];
    stopTrace();
    L.music("karta"); L.duck(true); L.blip();
    lastRun = null;
    show("vUppdrag");
    setDefconFromProgress();
    $("mKicker").textContent = `Uppdrag ${i + 1}/${U.length} · ${S.typ === "kod" ? "Pseudokod" : "Flödesschema"} · ${S.begrepp}`;
    $("mTitle").textContent = S.titel.toUpperCase();
    renderBrief();
    renderWork();
    $("results").innerHTML = "";
  }
  $("toMap").addEventListener("click", () => { stopTrace(); showMap(); });

  function renderBrief() {
    const nh = P.hints[S.id] || 0;
    const fails = P.fails[S.id] || 0;
    const canSolve = fails >= 3 || P.shown[S.id] || P.solved[S.id];
    $("brief").innerHTML = `
      <div class="mimer">${esc(S.mimer)}</div>
      <div class="card letter"><div class="from">DR. INGRID SANDBERG</div><p>${S.brev}</p></div>
      <details class="hist" ${P.solved[S.id] ? "" : "open"}><summary>Det hände på riktigt · ${S.ar}</summary><p>${S.historia}</p></details>
      <div class="card task"><h3>UPPGIFT</h3><ol>${S.uppgift.map((u) => `<li>${u}</li>`).join("")}</ol>
        <table class="io">${S.indata.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}<tr><td>Utdata</td><td>${esc(S.utdata)}</td></tr></table></div>
      <div class="card hints"><h3>LEDTRÅDAR</h3>
        ${S.tips.slice(0, nh).map((t, k) => `<div class="hint"><b class="n">${k + 1}.</b> ${t}</div>`).join("") || `<p class="muted" style="margin:0;font-size:.88rem">Kör fast? Ta en ledtråd i taget.</p>`}
        <div class="row">
          ${nh < S.tips.length ? `<button class="btn small" type="button" id="hintBtn">Ledtråd ${nh + 1}/${S.tips.length}</button>` : ""}
          ${canSolve ? `<button class="btn small warn" type="button" id="solBtn">${P.shown[S.id] ? "Ladda lösningsförslaget" : "Visa lösningsförslag"}</button>` : `<span class="muted" style="font-size:.8rem;align-self:center">Lösningsförslag efter 3 misslyckade körningar (${fails}/3).</span>`}
        </div></div>`;
    const hb = $("hintBtn");
    if (hb) hb.addEventListener("click", () => { P.hints[S.id] = nh + 1; save(); renderBrief(); });
    const sb = $("solBtn");
    if (sb) sb.addEventListener("click", () => {
      if (!P.shown[S.id] && !P.solved[S.id] && sb.dataset.sure !== "1") {
        sb.dataset.sure = "1";
        sb.textContent = "Säker? Uppdraget räknas som ”lösning visad”";
        return;
      }
      if (!P.solved[S.id]) P.shown[S.id] = true;
      save();
      if (S.typ === "kod") { P.code[S.id] = S.losning; setCode(S.losning); }
      else { P.graph[S.id] = S.losning; editor.setGraph(S.losning); }
      save();
      renderBrief();
    });
  }

  /* ----- Pseudokod-redigeraren ----- */
  const CHIPS = [["←", "← "], ["OM", "OM "], ["ANNARS OM", "ANNARS OM "], ["ANNARS", "ANNARS"], ["SÅ LÄNGE", "SÅ LÄNGE "], ["FÖR VARJE", "FÖR VARJE "], ["UPPREPA", "UPPREPA  GÅNGER"], ["SKRIV UT", "SKRIV UT "], ["≠", "≠ "], ["≤", "≤ "], ["≥", "≥ "], ["OCH", "OCH "], ['" "', '""']];

  function renderWork() {
    if (editor) { editor.destroy(); editor = null; }
    const w = $("workArea");
    if (S.typ === "kod") {
      w.innerHTML = `
        <div class="wtools" role="toolbar" aria-label="Infoga">${CHIPS.map(([l, v], k) => `<button type="button" class="chip" data-k="${k}">${esc(l)}</button>`).join("")}</div>
        <div class="editor" id="ed"><div class="gutter" id="gut" aria-hidden="true"></div>
          <textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Pseudokod"></textarea>
          <div class="codeview hide" id="cview"></div></div>
        <p class="syntax" id="syn" aria-live="polite"></p>`;
      const ta = $("code");
      ta.value = P.code[S.id] != null ? P.code[S.id] : S.start;
      bindCode(ta);
      w.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
        const v = CHIPS[+b.dataset.k][1];
        ta.focus();
        insert(ta, v);
        if (v === '""' || v === "UPPREPA  GÅNGER") ta.selectionStart = ta.selectionEnd = ta.selectionStart - (v === '""' ? 1 : 7);
      }));
      updateGutter();
    } else {
      w.innerHTML = `<div id="flowEd"></div>`;
      editor = new window.FlowEditor($("flowEd"), P.graph[S.id] || S.graf, {
        onChange: (g) => { P.graph[S.id] = g; save(); editor.setError(null); },
      });
    }
  }

  function insert(ta, text) {
    // execCommand behåller webbläsarens ångra-historik
    if (text === "") {
      if (ta.selectionStart === ta.selectionEnd) return;
      if (document.execCommand && document.execCommand("delete")) return;
    }
    if (text === "" || !document.execCommand || !document.execCommand("insertText", false, text)) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
      ta.dispatchEvent(new Event("input"));
    }
  }
  function setCode(src) {
    const ta = $("code");
    if (!ta) return;
    ta.value = src;
    ta.dispatchEvent(new Event("input"));
  }

  let synTimer = null, errLine = null;
  function bindCode(ta) {
    ta.addEventListener("input", () => {
      P.code[S.id] = ta.value; save();
      errLine = null;
      updateGutter();
      clearTimeout(synTimer);
      synTimer = setTimeout(checkSyntax, 350);
    });
    ta.addEventListener("scroll", () => { $("gut").scrollTop = ta.scrollTop; });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const a = ta.selectionStart, b = ta.selectionEnd, v = ta.value;
        const ls = v.lastIndexOf("\n", a - 1) + 1;
        if (e.shiftKey) {
          // ta bort upp till två mellanslag i början av markerade rader
          const le = v.indexOf("\n", b); const end = le < 0 ? v.length : le;
          const block = v.slice(ls, end).split("\n").map((l) => l.replace(/^ {1,2}/, "")).join("\n");
          ta.setSelectionRange(ls, end); insert(ta, block);
        } else if (a !== b && v.slice(a, b).includes("\n")) {
          const le = v.indexOf("\n", b - 1); const end = le < 0 ? v.length : le;
          const block = v.slice(ls, end).split("\n").map((l) => "  " + l).join("\n");
          ta.setSelectionRange(ls, end); insert(ta, block);
        } else insert(ta, "  ");
      } else if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const a = ta.selectionStart, v = ta.value;
        const ls = v.lastIndexOf("\n", a - 1) + 1;
        const line = v.slice(ls, a);
        let ind = (line.match(/^ */) || [""])[0];
        const t = window.Tolk.fold(line.trim());
        if (/^(OM|ANNARS|SA LANGE|MEDAN|UPPREPA|FOR)\b/.test(t)) ind += "  ";
        insert(ta, "\n" + ind);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault(); runTests();
      }
    });
    checkSyntax();
  }
  function updateGutter() {
    const ta = $("code"); if (!ta) return;
    const n = ta.value.split("\n").length;
    let s = "";
    for (let i = 1; i <= n; i++) s += (i === errLine ? `<span class="e">${i}</span>` : i) + "\n";
    $("gut").innerHTML = s;
  }
  function checkSyntax() {
    const ta = $("code"); if (!ta) return;
    const e = window.Tolk.checkSyntax(ta.value);
    const el = $("syn");
    if (!e) { el.className = "syntax ok"; el.textContent = ta.value.trim() ? "✓ Koden går att läsa. Kör testerna för att se om den gör rätt." : ""; errLine = null; }
    else { el.className = "syntax bad"; el.textContent = (e.line ? "Rad " + e.line + ": " : "") + e.msg; errLine = e.line; }
    updateGutter();
  }

  $("resetBtn").addEventListener("click", () => {
    const b = $("resetBtn");
    if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Säker? Allt du gjort försvinner"; setTimeout(() => { b.dataset.sure = ""; b.textContent = "Börja om"; }, 3500); return; }
    b.dataset.sure = ""; b.textContent = "Börja om";
    stopTrace();
    if (S.typ === "kod") { delete P.code[S.id]; save(); setCode(S.start); }
    else { delete P.graph[S.id]; save(); editor.setGraph(S.graf); }
    $("results").innerHTML = "";
  });
  $("cheatBtn").addEventListener("click", () => $("dlgCheat").showModal());

  /* ----- Köra testerna ----- */
  $("runBtn").addEventListener("click", runTests);

  function program() { return S.typ === "kod" ? $("code").value : editor.getGraph(); }

  function runTests() {
    stopTrace();
    const prog = program();
    const res = S.tester.map((t) => window.provaTest(S, t, prog));
    lastRun = { res, prog };
    const pass = res.filter((r) => r.ok).length;
    const all = pass === res.length;
    const box = $("results");
    const first = res[0];
    let html = "";
    if (first.compileError) {
      const e = first.error;
      html = `<div class="sum bad">MIMER> ALGORITMEN KAN INTE LÄSAS</div><div class="errbox"><b>${e.line ? "Rad " + e.line + ": " : ""}</b>${esc(e.msg)}</div>`;
      if (S.typ === "kod" && e.line) { errLine = e.line; updateGutter(); }
      if (S.typ === "flode" && e.node != null) editor.setError(e.node);
    } else {
      html = `<div class="sum ${all ? "ok" : "bad"}">${all ? "ALLA TESTER GODKÄNDA" : `${pass} AV ${res.length} TESTER GODKÄNDA`}</div>`;
      html += res.map((r, i) => {
        const t = S.tester[i];
        const inp = t.visa || Object.keys(t.indata || {}).map((k) => k + " = " + window.Tolk.fmt(t.indata[k])).join(", ");
        const got = r.out.length ? r.out.join(" / ") : "(inget)";
        return `<div class="res ${r.ok ? "ok" : "bad"}"><span class="ic">${r.ok ? "✓" : "✗"}</span><span class="nm">${esc(t.namn)}</span>
          <button class="btn small" type="button" data-trace="${i}">Spåra</button>
          <span class="det">${esc(inp)}${r.info ? " · " + esc(r.info) : ""}</span>
          <span class="det">Förväntat: <b>${esc(t.vantat.join(" / "))}</b> · Fick: <b>${esc(got)}</b></span>
          ${r.ok ? "" : `<span class="msg">${esc(r.msg)}</span>`}</div>`;
      }).join("");
      const firstBad = res.findIndex((r) => !r.ok && r.error && r.error.node != null);
      if (S.typ === "flode" && firstBad >= 0) editor.setError(res[firstBad].error.node);
      const lineErr = res.find((r) => !r.ok && r.error && r.error.line);
      if (S.typ === "kod" && lineErr) { errLine = lineErr.error.line; updateGutter(); }
    }
    box.innerHTML = html;
    box.querySelectorAll("[data-trace]").forEach((b) => b.addEventListener("click", () => startTrace(+b.dataset.trace)));
    if (all) solved();
    else {
      L.fail();
      if (!P.solved[S.id] && !first.compileError) { P.fails[S.id] = (P.fails[S.id] || 0) + 1; save(); renderBrief(); }
      box.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
    }
  }

  function solved() {
    const before = solvedCount();
    const fails = P.fails[S.id] || 0;
    const status = P.shown[S.id] ? "v" : fails <= 2 ? "c" : "s";
    const old = P.solved[S.id];
    if (!old || RANK[status] > RANK[old.status]) P.solved[S.id] = { status, fails };
    save(); report();
    const after = solvedCount();
    setDefconFromProgress();
    const last = SI === U.length - 1;
    const fresh = after > before;
    $("klarBody").innerHTML = `
      <h2 class="glow">UPPDRAG ${SI + 1} AVVÄRJT</h2>
      ${fresh ? `<div class="big">DEFCON <span class="from">${DEFCON[before]}</span> → <span class="to">${DEFCON[after]}</span> &nbsp; ANFALLSRISK <span class="from">${RISK[before]} %</span> → <span class="to">${RISK[after]} %</span></div>` : ""}
      <p>${S.klart}</p>
      ${status === "v" ? `<p class="muted" style="font-size:.88rem">Du använde lösningsförslaget. Försök gärna skriva algoritmen själv från början – tryck på <i>Börja om</i>.</p>` : ""}
      <div class="row">
        <button class="btn" type="button" id="klarStay">Stanna här</button>
        ${last ? `<button class="btn go" type="button" id="klarNext">Se vad som händer ›</button>`
               : `<button class="btn go" type="button" id="klarNext">Nästa uppdrag ›</button>`}
      </div>`;
    const d = $("dlgKlar");
    d.showModal();
    L.win();
    if (fresh) setTimeout(() => L.defcon(DEFCON[after]), 900);
    $("klarStay").onclick = () => d.close();
    $("klarNext").onclick = () => { d.close(); if (last) ending(); else openStage(SI + 1); };
    $("klarNext").focus();
  }

  /* ----- Spåra en körning steg för steg ----- */
  function startTrace(i) {
    stopTrace();
    const r = lastRun && lastRun.res[i];
    if (!r || !r.trace.length) return;
    trace = { r, i, k: 0, timer: null };
    if (S.typ === "kod") {
      const ta = $("code");
      const cv = $("cview");
      cv.innerHTML = lastRun.prog.split("\n").map((l, n) => `<span class="l" data-n="${n + 1}">${esc(l) || " "}</span>`).join("");
      cv.style.height = ta.offsetHeight + "px";
      ta.classList.add("hide"); cv.classList.remove("hide");
    }
    $("tracebar").classList.remove("hide");
    renderTrace();
    $("tracebar").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
  }
  function stopTrace() {
    if (!trace) return;
    clearInterval(trace.timer);
    trace = null;
    $("tracebar").classList.add("hide");
    if (S && S.typ === "kod" && $("code")) { $("code").classList.remove("hide"); $("cview").classList.add("hide"); }
    if (editor) editor.setActive(null);
  }
  function renderTrace() {
    const { r, k, i } = trace;
    const st = r.trace[k];
    const prev = k > 0 ? r.trace[k - 1] : null;
    const pv = new Map(prev ? prev.vars.map(([n, v]) => [n, v]) : []);
    const t = S.tester[i];
    const end = k === r.trace.length - 1;
    const tb = $("tracebar");
    tb.innerHTML = `<div class="top"><b>Spårar: ${esc(t.namn)}</b><span class="muted">steg ${k + 1}/${r.trace.length}${r.trace.length >= 800 ? " (de första)" : ""}</span><span class="sp"></span>
      <button class="btn small" type="button" data-t="first" aria-label="Första steget">⏮</button>
      <button class="btn small" type="button" data-t="prev" aria-label="Föregående steg">◀</button>
      <button class="btn small" type="button" data-t="play">${trace.timer ? "❚❚" : "▶ Spela"}</button>
      <button class="btn small" type="button" data-t="next" aria-label="Nästa steg">▶</button>
      <button class="btn small" type="button" data-t="last" aria-label="Sista steget">⏭</button>
      <button class="btn small" type="button" data-t="close">Stäng</button></div>
      <div class="vars">${st.vars.length ? st.vars.map(([n, v, inp]) => `<span class="${inp ? "in" : ""} ${pv.has(n) && pv.get(n) === v ? "" : prev || !inp ? "ch" : ""}"><em>${esc(n)} =</em> ${esc(v)}</span>`).join("") : `<span><em>inga variabler än</em></span>`}</div>
      <div class="tout">Utskrift hittills: ${st.out ? r.out.slice(0, st.out).map((o) => `<b>${esc(o)}</b>`).join(" / ") : "–"}</div>
      ${end && r.error ? `<div class="tout" style="color:#ff9a9a">Körningen stoppade: ${esc(r.error.msg)}</div>` : end ? `<div class="tout">Algoritmen är klar.</div>` : ""}`;
    tb.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => traceCmd(b.dataset.t)));
    if (S.typ === "kod") {
      document.querySelectorAll("#cview .l").forEach((el) => el.classList.toggle("on", +el.dataset.n === st.at));
      const on = document.querySelector("#cview .l.on");
      if (on) { const cv = $("cview"); const top = on.offsetTop - cv.clientHeight / 2; cv.scrollTop = Math.max(0, top); }
    } else editor.setActive(st.at);
  }
  function traceCmd(c) {
    if (!trace) return;
    const n = trace.r.trace.length;
    if (c === "close") return stopTrace();
    if (c === "play") {
      if (trace.timer) { clearInterval(trace.timer); trace.timer = null; }
      else {
        if (trace.k >= n - 1) trace.k = 0;
        trace.timer = setInterval(() => {
          if (!trace) return;
          if (trace.k >= n - 1) { clearInterval(trace.timer); trace.timer = null; renderTrace(); return; }
          trace.k++; renderTrace();
        }, 550);
      }
    }
    if (c === "first") trace.k = 0;
    if (c === "last") trace.k = n - 1;
    if (c === "next") trace.k = Math.min(n - 1, trace.k + 1);
    if (c === "prev") trace.k = Math.max(0, trace.k - 1);
    if (c !== "play" && trace.timer) { clearInterval(trace.timer); trace.timer = null; }
    renderTrace();
  }

  /* ---------- Slutet ---------- */
  async function ending() {
    show("vSlut");
    setDefcon(1, 0);
    L.duck(false);
    const t = new Term($("endTerm"));
    t.clear();
    $("endBody").classList.add("hide");
    const SC = ["SOVJETISKT FÖRSTASLAG", "AMERIKANSKT FÖRSTASLAG", "BEGRÄNSAT KRIG I EUROPA", "ANFALL MOT UBÅTSBASER", "NATO-MOTANFALL", "ANFALL FRÅN RYMDEN", "ÖVERRASKNINGSANFALL", "KRIG I MELLANÖSTERN", "KINESISKT INGRIPANDE", "ANFALL MOT LEDNINGEN", "ANDRA VÅGEN", "TREDJE VÅGEN"];
    try {
      await t.line("MIMER> KÖR ALGORITM: SIMULERA ALLA SCENARIER.", "m");
      await t.pause(400);
      for (let i = 0; i < SC.length; i++) {
        await t.line(`SCENARIO ${String(i + 1).padStart(2, "0")}: ${SC[i].padEnd(26, ".")} INGEN VINNARE`, i < 4 ? "" : "", Math.max(2, 14 - i * 2));
        await t.pause(Math.max(40, 260 - i * 28));
      }
      const d = await t.line("SCENARIO 13–4096 ...", "", 10);
      if (!t.fast) for (let n = 13; n <= 4096; n += 97) { d.textContent = `SCENARIO ${n} ........................ INGEN VINNARE`; await sleep(16); }
      d.textContent = "SCENARIO 13–4096 ................... INGEN VINNARE";
      await t.pause(900);
      await t.line("SLUTSATS: INGET SCENARIO SLUTAR MED SEGER.", "m");
      await t.line("DET HÄR SPELET GÅR INTE ATT VINNA.", "m");
      await t.pause(700);
      L.music(null);
      for (const dd of [2, 3, 4, 5]) { setDefcon(dd, Math.round(97 - dd * 19.4)); L.defcon(dd); await t.line("DEFCON " + dd, dd === 5 ? "" : "m", 30); await t.pause(450); }
      setDefcon(5, 0);
      L.music("slut");
      await t.line("ANFALLET AVBRYTS. ROBOTARNA ÅTERGÅR TILL SILORNA.");
      await t.pause(900);
      await t.line("VILL DU SPELA ETT PARTI SCHACK?");
      await t.pause(700);
      await t.line("<b>Sandberg:</b> Du klarade det. I natt lärde sig MIMER något som ingen hade programmerat in: att vissa spel inte går att vinna. Och du gjorde det med samma sak som MIMER själv är byggd av – algoritmer.", "s");
    } catch (e) { if (e !== "stop") throw e; }
    const ST = { c: "Klarat direkt", s: "Klarat efter flera försök", v: "Lösningen visad" };
    $("endBody").innerHTML = `
      <h2 class="glow" style="font-size:3rem;color:var(--g)">VÄRLDEN ÄR RÄDDAD</h2>
      <div class="endgrid">${U.map((s, i) => `<div class="card"><div class="y">${s.ar}</div><b>${i + 1}. ${esc(s.titel)}</b><div class="s muted">${esc(s.begrepp)} · ${P.solved[s.id] ? ST[P.solved[s.id].status] : "Inte klart"}</div></div>`).join("")}</div>
      <div class="card reflect"><h3>ATT DISKUTERA</h3><ol>
        <li>1960, 1979 och 1983 var det människor som stoppade felen. Vad hade hänt om algoritmen själv hade fått bestämma? Vilka beslut ska en AI aldrig få fatta utan en människa?</li>
        <li>Flera av dina algoritmer gick fel just på gränsfallen. Varför är gränsfall extra farliga i system där fel får stora följder?</li>
        <li>MIMER kunde inte skilja på spel och verklighet. Finns det AI-system i dag som tränas i simuleringar och sedan används på riktigt? Vad kan gå fel?</li>
      </ol></div>
      <div class="map-actions" style="justify-content:flex-end">
        <button class="btn" type="button" id="endMap">Tillbaka till uppdragen</button>
        <a class="btn go" href="../" style="text-decoration:none;display:inline-flex;align-items:center">AI 1 – fler material ›</a>
      </div>`;
    $("endBody").classList.remove("hide");
    $("endMap").addEventListener("click", showMap);
  }

  /* ---------- Start ---------- */
  if (P.introSeen || solvedCount()) showMap(); else intro();
})();
