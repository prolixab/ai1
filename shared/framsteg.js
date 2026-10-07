/*
 * Framsteg – skickar elevens framsteg till lärarpanelen.
 *
 * Eleven anger en klasskod (som läraren skapar i lärarpanelen) och ett
 * smeknamn. Inga riktiga namn sparas. Klasskod och smeknamn sparas i
 * webbläsaren och delas av allt material på kurssidan.
 *
 * Användning i ett material:
 *   <script src="../shared/framsteg.js"></script>
 *   Framsteg.widget(document.querySelector(".hero .wrap"));   // knapp "Koppla till klassen"
 *   Framsteg.report("mitt-material", { k1: { s: "c" }, quiz: { s: "v", score: 7, max: 12 } }, manifest);
 *
 * Status per del: "c" = klar, "s" = klar efter flera försök, "v" = fel/svaret visat.
 */
(function () {
  "use strict";

  // Lärarpanelen (exit-ticket-platform på Vercel).
  var PROD_API = "https://exitticket.teed.se/api/progress";
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = LOCAL ? "http://localhost:3000/api/progress" : PROD_API;

  var KEY = "ai1-framsteg";
  var PENDING = "ai1-framsteg-vantar";

  function read(k, fallback) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function write(k, v) {
    try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ingen lagring */ }
  }

  var listeners = [], connectListeners = [];
  var state = "off"; // off | pending | ok | offline | no-class
  function setState(s) {
    state = s;
    listeners.forEach(function (fn) { try { fn(s); } catch (e) { /* */ } });
  }

  function identity() {
    var id = read(KEY, null);
    return id && id.classCode && id.nick ? id : null;
  }

  function normCode(c) { return String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function normNick(n) { return String(n || "").replace(/\s+/g, " ").trim().slice(0, 24); }

  // Kollar klasskoden mot servern. Svarar { ok, name } eller { ok: false, reason: "unknown" | "offline" }.
  function checkClass(code) {
    code = normCode(code);
    if (code.length < 3) return Promise.resolve({ ok: false, reason: "unknown" });
    return fetch(API + "/class?code=" + encodeURIComponent(code), { cache: "no-store" })
      .then(function (r) {
        if (r.status === 404) return { ok: false, reason: "unknown" };
        if (!r.ok) return { ok: false, reason: "offline" };
        return r.json().then(function (j) { return { ok: true, code: j.code, name: j.name }; });
      })
      .catch(function () { return { ok: false, reason: "offline" }; });
  }

  function setIdentity(classCode, nick, className) {
    var id = { classCode: normCode(classCode), nick: normNick(nick), className: className || "" };
    write(KEY, id);
    setState("pending");
    flush();
    connectListeners.forEach(function (fn) { try { fn(id); } catch (e) { /* */ } });
    return id;
  }
  function clearIdentity() { write(KEY, null); setState("off"); }

  /* ---------- Skicka ---------- */
  var timers = {};
  var manifestSent = {};

  function send(payload) {
    // text/plain = ingen CORS-förfrågan i förväg
    return fetch(API, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload), keepalive: true })
      .then(function (r) { return r.ok ? "ok" : r.status === 404 ? "no-class" : "offline"; })
      .catch(function () { return "offline"; });
  }

  // Det som inte har kommit fram sparas och skickas igen nästa gång.
  function flush() {
    var pending = read(PENDING, {});
    Object.keys(pending).forEach(function (k) {
      var p = pending[k];
      send(p).then(function (res) {
        var now = read(PENDING, {});
        if (res !== "offline" && now[k] && now[k].stamp === p.stamp) { delete now[k]; write(PENDING, now); }
        if (res === "ok" && p.manifest) manifestSent[p.material] = true;
        setState(res);
      });
    });
  }

  /*
   * report(material, items, manifest[, who])
   * who = { classCode, nick } om materialet har egna elevprofiler (som Python-övningen),
   * annars används klasskoden och smeknamnet som eleven har angett på kurssidan.
   */
  function report(material, items, manifest, who) {
    var id = who && who.classCode && who.nick ? who : identity();
    if (!id || !window.fetch) return;
    clearTimeout(timers[material]);
    setState("pending");
    timers[material] = setTimeout(function () {
      var pending = read(PENDING, {});
      var key = normCode(id.classCode) + "|" + normNick(id.nick).toLowerCase() + "|" + material;
      pending[key] = {
        classCode: normCode(id.classCode), nick: normNick(id.nick), material: material, items: items,
        manifest: manifestSent[material] ? undefined : manifest, stamp: Date.now()
      };
      write(PENDING, pending);
      flush();
    }, 800);
  }

  function onStatus(fn) { listeners.push(fn); fn(state); }
  // Anropas när eleven kopplar sig till en klass – då ska materialet skicka allt den redan har gjort.
  function onConnect(fn) { connectListeners.push(fn); }

  /* ---------- Knapp + dialog för material utan egen inloggning ---------- */
  var CSS =
    ".fs-chip{display:inline-flex;align-items:center;gap:8px;font:600 .9rem/1.2 system-ui,sans-serif;padding:6px 12px;border-radius:99px;" +
    "border:1.5px solid currentColor;background:transparent;color:inherit;cursor:pointer;opacity:.95}" +
    ".fs-chip:hover{opacity:1}.fs-dot{width:9px;height:9px;border-radius:50%;background:#999}" +
    ".fs-chip[data-s=ok] .fs-dot{background:#3fb871}.fs-chip[data-s=pending] .fs-dot{background:#e6a23c}" +
    ".fs-chip[data-s=offline] .fs-dot,.fs-chip[data-s=no-class] .fs-dot{background:#e5533d}" +
    ".fs-dlg{border:0;border-radius:14px;padding:22px;max-width:420px;width:calc(100% - 32px);font:1rem/1.5 system-ui,sans-serif;color:#1b2733;background:#fff}" +
    ".fs-dlg::backdrop{background:rgba(0,0,0,.45)}.fs-dlg h2{margin:0 0 .4em;font-size:1.3rem}" +
    ".fs-dlg label{display:block;font-weight:600;margin:12px 0 4px}.fs-dlg input{width:100%;box-sizing:border-box;font:inherit;padding:8px 10px;border:1.5px solid #c9d2d9;border-radius:9px}" +
    ".fs-dlg input.code{text-transform:uppercase;letter-spacing:.15em;font-family:ui-monospace,Consolas,monospace}" +
    ".fs-dlg .fs-row{display:flex;gap:8px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap}" +
    ".fs-dlg button{font:600 .95rem system-ui,sans-serif;padding:8px 14px;border-radius:9px;border:1.5px solid #c9d2d9;background:#fff;color:#1b2733;cursor:pointer}" +
    ".fs-dlg button.primary{background:#2d68b0;border-color:#2d68b0;color:#fff}.fs-dlg .fs-msg{min-height:1.4em;margin:10px 0 0;font-size:.9rem;color:#c8402f}" +
    ".fs-dlg .fs-note{font-size:.85rem;color:#566573;margin:10px 0 0}" +
    "@media (prefers-color-scheme:dark){.fs-dlg{background:#1b232b;color:#e5ebef}.fs-dlg input,.fs-dlg button{background:#131a20;color:#e5ebef;border-color:#2f3b46}" +
    ".fs-dlg .fs-note{color:#9ba9b5}.fs-dlg button.primary{background:#62a1ec;border-color:#62a1ec;color:#0b1520}}";

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var dlg = null;
  function openDialog(onDone) {
    if (!dlg) {
      dlg = el("dialog", { class: "fs-dlg", "aria-labelledby": "fsTitle" },
        '<form method="dialog" novalidate>' +
        '<h2 id="fsTitle">Koppla till din klass</h2>' +
        '<p style="margin:0">Då kan din lärare se hur långt du har kommit.</p>' +
        '<label for="fsCode">Klasskod</label><input id="fsCode" class="code" maxlength="12" autocomplete="off" placeholder="t.ex. K7RM2P">' +
        '<label for="fsNick">Smeknamn</label><input id="fsNick" maxlength="24" autocomplete="off" placeholder="Hitta på ett – inte ditt riktiga namn">' +
        '<p class="fs-note">Använd samma smeknamn i allt material och på alla datorer. Läraren vet vem som är vem.</p>' +
        '<p class="fs-msg" id="fsMsg" aria-live="polite"></p>' +
        '<div class="fs-row"><button type="button" id="fsOff" hidden>Koppla bort</button><span style="flex:1"></span>' +
        '<button type="button" id="fsCancel">Avbryt</button><button class="primary" type="submit" id="fsOk">Spara</button></div></form>');
      document.body.appendChild(dlg);
      dlg.querySelector("#fsCancel").onclick = function () { dlg.close(); };
    }
    var id = identity();
    var code = dlg.querySelector("#fsCode"), nick = dlg.querySelector("#fsNick"), msg = dlg.querySelector("#fsMsg");
    code.value = id ? id.classCode : ""; nick.value = id ? id.nick : ""; msg.textContent = "";
    var off = dlg.querySelector("#fsOff");
    off.hidden = !id;
    off.onclick = function () { clearIdentity(); dlg.close(); onDone && onDone(); };
    dlg.querySelector("form").onsubmit = function (e) {
      e.preventDefault();
      var n = normNick(nick.value);
      if (!normCode(code.value)) { msg.textContent = "Skriv klasskoden du har fått av läraren."; code.focus(); return; }
      if (!n) { msg.textContent = "Välj ett smeknamn."; nick.focus(); return; }
      msg.textContent = "Kollar klasskoden …";
      checkClass(code.value).then(function (r) {
        if (r.ok) { setIdentity(r.code, n, r.name); dlg.close(); onDone && onDone(); }
        else if (r.reason === "unknown") { msg.textContent = "Klasskoden finns inte. Kolla stavningen med läraren."; code.focus(); }
        else { msg.textContent = "Kunde inte nå servern. Försök igen om en stund."; }
      });
    };
    dlg.showModal();
    (id ? nick : code).focus();
  }

  var LABEL = { ok: "Läraren ser dina framsteg", pending: "Sparar …", offline: "Inte skickat – försöker igen", "no-class": "Klasskoden gäller inte längre" };

  // Lägger en knapp i container som visar om eleven är kopplad till en klass.
  function widget(container) {
    if (!container) return;
    if (!document.getElementById("fs-css")) document.head.appendChild(el("style", { id: "fs-css" }, CSS));
    var b = el("button", { type: "button", class: "fs-chip" });
    function render() {
      var id = identity();
      b.dataset.s = id ? state : "off";
      b.innerHTML = '<span class="fs-dot" aria-hidden="true"></span>' + (id
        ? esc(id.nick) + (id.className ? " · " + esc(id.className) : "") + ' <span style="font-weight:400;opacity:.8">– ' + (LABEL[state] || "Kopplad") + "</span>"
        : "Koppla till klassen");
      b.title = id ? "Ändra klasskod eller smeknamn" : "Ange klasskod och smeknamn så att läraren ser dina framsteg";
    }
    b.onclick = function () { openDialog(render); };
    onStatus(render);
    container.appendChild(b);
  }

  window.Framsteg = {
    api: API, identity: identity, setIdentity: setIdentity, clearIdentity: clearIdentity,
    checkClass: checkClass, report: report, onStatus: onStatus, onConnect: onConnect, widget: widget, openDialog: openDialog
  };
  if (identity()) flush();
})();
