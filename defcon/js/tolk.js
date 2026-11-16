/*
 * Tolk – kör elevens pseudokod och flödesscheman.
 *
 * Pseudokoden är svensk och styrs av indrag, som i materialet Algoritmer:
 *   x ← 5                 (även <-, := och =)
 *   OM villkor [SÅ]  /  ANNARS OM villkor  /  ANNARS
 *   SÅ LÄNGE villkor [GÖR]
 *   UPPREPA n GÅNGER
 *   FÖR VARJE x I lista
 *   FÖR i FRÅN a TILL b
 *   SKRIV UT uttryck[, uttryck]
 *   STOPPA
 * Uttryck: + - * / MOD DIV, = ≠ < > ≤ ≥ (även == != <> <= >=), OCH ELLER INTE,
 * SANT FALSKT, "text", [1, 2, 3], lista[0], LÄNGD(lista).
 * Namn tål stora/små bokstäver och å/ä/ö skrivet som a/a/o.
 */
(function () {
  "use strict";

  class PErr extends Error {
    constructor(msg, line) { super(msg); this.line = line; }
  }
  class Halt { }

  const STEG_MAX = 20000;
  const TRACE_MAX = 800;

  // å→a, ä→a, ö→o, versaler. Samma längd som originalet.
  function fold(s) {
    return String(s).toUpperCase().replace(/[ÅÄ]/g, "A").replace(/Ö/g, "O").replace(/É/g, "E");
  }
  function nameKey(s) { return fold(s).toLowerCase(); }

  // Gör ett nyckelord tåligt för å/ä/ö skrivna som a/o.
  function K(s) { return s.replace(/Å/g, "[ÅA]").replace(/Ä/g, "[ÄA]").replace(/Ö/g, "[ÖO]").replace(/ /g, "\\s+"); }
  const ID = "[\\p{L}_][\\p{L}\\p{N}_]*";
  const RX = {
    elif: new RegExp("^" + K("ANNARS OM") + "\\s+(.+?)(?:\\s+" + K("SÅ") + ")?\\s*:?$", "iu"),
    els: new RegExp("^ANNARS\\s*:?$", "iu"),
    iff: new RegExp("^OM\\s+(.+?)(?:\\s+" + K("SÅ") + ")?\\s*:?$", "iu"),
    whl: new RegExp("^(?:" + K("SÅ LÄNGE") + "|MEDAN)\\s+(.+?)(?:\\s+" + K("GÖR") + ")?\\s*:?$", "iu"),
    rep: new RegExp("^UPPREPA\\s+(.+?)\\s+" + K("GÅNGER") + "\\s*:?$", "iu"),
    each: new RegExp("^" + K("FÖR VARJE") + "\\s+(" + ID + ")\\s+I\\s+(.+?)\\s*:?$", "iu"),
    range: new RegExp("^" + K("FÖR") + "\\s+(" + ID + ")\\s+(?:" + K("FRÅN") + "|←|<-|=)\\s+(.+?)\\s+TILL\\s+(.+?)\\s*:?$", "iu"),
    print: new RegExp("^(?:SKRIV\\s+UT|SKRIV|VISA)\\s+(.+)$", "iu"),
    halt: new RegExp("^(?:STOPPA|AVSLUTA)\\s*$", "iu"),
    end: new RegExp("^SLUT(?:\\s|$)", "iu"),
    assign: new RegExp("^(" + ID + "(?:\\s*\\[.+\\])?)\\s*(←|<-|:=|=(?!=))\\s*(.+)$", "u"),
  };

  /* ---------------- Uttryck ---------------- */

  const WORDS = { OCH: "and", AND: "and", ELLER: "or", OR: "or", INTE: "not", NOT: "not", MOD: "mod", DIV: "div" };
  const LITS = { SANT: true, TRUE: true, FALSKT: false, FALSE: false };

  function normalize(src) {
    return src.replace(/[“”„″]/g, '"').replace(/[‘’]/g, "'").replace(/−/g, "-").replace(/ /g, " ");
  }

  function tokenize(src, line) {
    const t = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9]/.test(c)) {
        let j = i; while (j < src.length && /[0-9.]/.test(src[j])) j++;
        t.push({ k: "num", v: parseFloat(src.slice(i, j)) }); i = j; continue;
      }
      if (c === '"' || c === "'") {
        const j = src.indexOf(c, i + 1);
        if (j < 0) throw new PErr("Texten saknar ett avslutande citattecken " + c, line);
        t.push({ k: "str", v: src.slice(i + 1, j) }); i = j + 1; continue;
      }
      const m = /^[\p{L}_][\p{L}\p{N}_]*/u.exec(src.slice(i));
      if (m) {
        const w = fold(m[0]);
        if (WORDS[w]) t.push({ k: "op", v: WORDS[w] });
        else if (w in LITS) t.push({ k: "bool", v: LITS[w] });
        else t.push({ k: "id", v: m[0] });
        i += m[0].length; continue;
      }
      const two = src.slice(i, i + 2);
      const TWO = { "<=": "<=", ">=": ">=", "!=": "!=", "<>": "!=", "==": "=" };
      if (TWO[two]) { t.push({ k: "op", v: TWO[two] }); i += 2; continue; }
      const ONE = { "<": "<", ">": ">", "=": "=", "≠": "!=", "≤": "<=", "≥": ">=", "+": "+", "-": "-", "*": "*", "×": "*", "/": "/", "÷": "/", "%": "mod", "(": "(", ")": ")", "[": "[", "]": "]", ",": "," };
      if (ONE[c]) { t.push({ k: "op", v: ONE[c] }); i++; continue; }
      if (c === "←") throw new PErr("Pilen ← kan bara stå i början av en tilldelning, t.ex. x ← 5", line);
      throw new PErr("Tecknet " + c + " förstår jag inte", line);
    }
    return t;
  }

  function parseExpr(src, line) {
    const t = tokenize(src, line);
    let p = 0;
    const peek = () => t[p];
    const isOp = (v) => t[p] && t[p].k === "op" && t[p].v === v;
    const eat = (v) => { if (!isOp(v)) throw new PErr("Här saknas " + v, line); p++; };

    function or() { let a = and(); while (isOp("or")) { p++; a = { o: "or", a, b: and() }; } return a; }
    function and() { let a = not(); while (isOp("and")) { p++; a = { o: "and", a, b: not() }; } return a; }
    function not() { if (isOp("not")) { p++; return { o: "not", a: not() }; } return cmp(); }
    function cmp() {
      let a = add();
      while (t[p] && t[p].k === "op" && ["=", "!=", "<", ">", "<=", ">="].includes(t[p].v)) { const o = t[p++].v; a = { o, a, b: add() }; }
      return a;
    }
    function add() { let a = mul(); while (isOp("+") || isOp("-")) { const o = t[p++].v; a = { o, a, b: mul() }; } return a; }
    function mul() { let a = un(); while (isOp("*") || isOp("/") || isOp("mod") || isOp("div")) { const o = t[p++].v; a = { o, a, b: un() }; } return a; }
    function un() { if (isOp("-")) { p++; return { o: "neg", a: un() }; } return post(); }
    function post() {
      let a = prim();
      while (isOp("[")) { p++; const i = or(); eat("]"); a = { o: "idx", a, i }; }
      return a;
    }
    function prim() {
      const x = t[p];
      if (!x) throw new PErr("Uttrycket tar slut för tidigt", line);
      if (x.k === "num" || x.k === "str" || x.k === "bool") { p++; return { o: "lit", v: x.v }; }
      if (x.k === "id") {
        p++;
        if (isOp("(")) {
          p++; const args = [];
          if (!isOp(")")) { args.push(or()); while (isOp(",")) { p++; args.push(or()); } }
          eat(")");
          return { o: "call", n: x.v, args };
        }
        return { o: "var", n: x.v };
      }
      if (isOp("(")) { p++; const e = or(); eat(")"); return e; }
      if (isOp("[")) {
        p++; const items = [];
        if (!isOp("]")) { items.push(or()); while (isOp(",")) { p++; items.push(or()); } }
        eat("]");
        return { o: "list", items };
      }
      throw new PErr("Jag väntade mig ett värde men hittade " + show(x), line);
    }
    function show(x) { return x.k === "op" ? "”" + ({ and: "OCH", or: "ELLER", not: "INTE", mod: "MOD", div: "DIV" }[x.v] || x.v) + "”" : "”" + x.v + "”"; }

    // En lista av uttryck separerade med komma (för SKRIV UT).
    function list() {
      const out = [or()];
      while (isOp(",")) { p++; out.push(or()); }
      return out;
    }
    return {
      one() { const e = or(); if (p < t.length) throw new PErr("Något blev över i slutet: " + show(t[p]), line); return e; },
      many() { const e = list(); if (p < t.length) throw new PErr("Något blev över i slutet: " + show(t[p]), line); return e; },
    };
  }
  const expr1 = (s, l) => parseExpr(s, l).one();
  const exprN = (s, l) => parseExpr(s, l).many();

  /* ---------------- Satser ---------------- */

  function stripComment(s) {
    let q = null;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === "#" || (c === "/" && s[i + 1] === "/")) return s.slice(0, i);
    }
    return s;
  }

  function compile(src, firstLine) {
    firstLine = firstLine || 1;
    const lines = [];
    normalize(src).split("\n").forEach((raw, i) => {
      const s = stripComment(raw.replace(/\t/g, "    ")).replace(/\s+$/, "");
      if (!s.trim()) return;
      const text = s.trim();
      if (RX.end.test(text)) return; // SLUT OM, SLUT SÅ LÄNGE … behövs inte, indraget räcker
      lines.push({ ind: s.length - s.trimStart().length, text, n: i + firstLine });
    });
    let i = 0;

    function block(ind) {
      const out = [];
      while (i < lines.length && lines[i].ind >= ind) {
        const L = lines[i];
        if (L.ind > ind) throw new PErr("Oväntat indrag. Raden ligger längre in än raden ovanför, men raden ovanför är inte OM, ANNARS, SÅ LÄNGE, UPPREPA eller FÖR.", L.n);
        const st = stmt(out);
        if (st.t !== "skip") out.push(st);
      }
      return out;
    }
    function body(L, what) {
      i++;
      if (i >= lines.length || lines[i].ind <= L.ind) throw new PErr(what + " behöver minst en indragen rad under sig – det är den koden som ska köras.", L.n);
      return block(lines[i].ind);
    }
    function stmt(prev) {
      const L = lines[i], s = L.text;
      let m;
      if ((m = RX.elif.exec(s)) || (m = RX.els.exec(s))) {
        const isElif = RX.elif.test(s);
        const last = prev[prev.length - 1];
        if (!last || last.t !== "if" || last.closed)
          throw new PErr((isElif ? "ANNARS OM" : "ANNARS") + " måste komma direkt efter en OM-del, med samma indrag som OM.", L.n);
        if (isElif) {
          const node = { t: "if", c: expr1(m[1], L.n), n: L.n };
          node.then = body(L, "ANNARS OM");
          last.chainEnd.els = [node];
          last.chainEnd = node;
        } else {
          last.chainEnd.els = body(L, "ANNARS");
          last.closed = true;
        }
        return { t: "skip" };
      }
      if ((m = RX.iff.exec(s))) { const node = { t: "if", c: expr1(m[1], L.n), n: L.n }; node.chainEnd = node; node.then = body(L, "OM"); return node; }
      if ((m = RX.whl.exec(s))) { const node = { t: "while", c: expr1(m[1], L.n), n: L.n }; node.body = body(L, "SÅ LÄNGE"); return node; }
      if ((m = RX.rep.exec(s))) { const node = { t: "rep", c: expr1(m[1], L.n), n: L.n }; node.body = body(L, "UPPREPA"); return node; }
      if ((m = RX.each.exec(s))) { const node = { t: "each", v: m[1], c: expr1(m[2], L.n), n: L.n }; node.body = body(L, "FÖR VARJE"); return node; }
      if ((m = RX.range.exec(s))) { const node = { t: "range", v: m[1], a: expr1(m[2], L.n), b: expr1(m[3], L.n), n: L.n }; node.body = body(L, "FÖR"); return node; }
      if ((m = RX.print.exec(s))) { i++; return { t: "print", e: exprN(m[1], L.n), n: L.n }; }
      if (RX.halt.test(s)) { i++; return { t: "halt", n: L.n }; }
      if (/^(OM|ANNARS|UPPREPA|MEDAN)\s*:?$/iu.test(s) || new RegExp("^" + K("SÅ LÄNGE") + "\\s*$", "iu").test(s))
        throw new PErr("Här saknas ett villkor efter " + s.replace(/:$/, ""), L.n);
      if ((m = RX.assign.exec(s))) {
        i++;
        const lhs = m[1].trim();
        const mi = /^([\p{L}_][\p{L}\p{N}_]*)\s*\[(.+)\]$/u.exec(lhs);
        if (mi) return { t: "setidx", v: mi[1], i: expr1(mi[2], L.n), e: expr1(m[3], L.n), n: L.n };
        if (WORDS[fold(lhs)] || fold(lhs) in LITS) throw new PErr(lhs + " är ett reserverat ord och kan inte vara ett variabelnamn.", L.n);
        return { t: "set", v: lhs, e: expr1(m[3], L.n), n: L.n };
      }
      // Ett ensamt funktionsanrop, t.ex. SKICKA()
      let e;
      try { e = expr1(s, L.n); } catch (err) { e = null; }
      if (e && e.o === "call") { i++; return { t: "expr", e, n: L.n }; }
      if (/^\p{L}+\s*$/u.test(s)) throw new PErr("Förstår inte raden ”" + s + "”. Ska det vara en text? Skriv den inom citattecken och med SKRIV UT framför.", L.n);
      throw new PErr("Förstår inte raden ”" + s + "”. Börjar den med OM, SÅ LÄNGE, FÖR VARJE, UPPREPA, SKRIV UT – eller är det en tilldelning som x ← 5?", L.n);
    }
    const prog = block(lines.length ? lines[0].ind : 0);
    if (i < lines.length) throw new PErr("Raden har mindre indrag än den första raden i programmet.", lines[i].n);
    return prog;
  }

  /* ---------------- Körning ---------------- */

  function typ(v) {
    if (typeof v === "number") return "ett tal";
    if (typeof v === "string") return "en text";
    if (typeof v === "boolean") return "SANT/FALSKT";
    if (Array.isArray(v)) return "en lista";
    return "inget värde";
  }
  function fmt(v) {
    if (typeof v === "boolean") return v ? "SANT" : "FALSKT";
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6);
    if (Array.isArray(v)) return "[" + v.map((x) => (typeof x === "string" ? '"' + x + '"' : fmt(x))).join(", ") + "]";
    if (v === undefined) return "–";
    return String(v);
  }
  function eq(a, b) {
    if (typeof a === "string" && typeof b === "string") return fold(a.trim()) === fold(b.trim());
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => eq(x, b[i]));
    return a === b;
  }

  class Machine {
    constructor(vars, builtins) {
      this.vars = new Map();
      this.names = new Map(); // nyckel → namnet som eleven skrev
      Object.keys(vars || {}).forEach((k) => this.set(k, vars[k]));
      this.inputs = new Set(Object.keys(vars || {}).map(nameKey));
      this.builtins = new Map();
      this.builtins.set("langd", { n: 1, f: (x) => { if (typeof x === "string" || Array.isArray(x)) return x.length; throw "LÄNGD() behöver en lista eller en text"; } });
      this.builtins.set("heltal", { n: 1, f: (x) => { if (typeof x !== "number") throw "HELTAL() behöver ett tal"; return Math.floor(x); } });
      Object.keys(builtins || {}).forEach((k) => this.builtins.set(nameKey(k), builtins[k]));
      this.out = [];
      this.steps = 0;
      this.trace = [];
      this.where = null;
    }
    set(name, v) { const k = nameKey(name); this.vars.set(k, v); if (!this.names.has(k)) this.names.set(k, name); }
    get(name, line) {
      const k = nameKey(name);
      if (!this.vars.has(k)) {
        if (this.builtins.has(k)) throw new PErr(name + " är en funktion. Anropa den med parenteser: " + name + "(…)", line);
        throw new PErr("Variabeln ”" + name + "” har inget värde än. Har du stavat rätt, och får den ett värde innan den används?", line);
      }
      return this.vars.get(k);
    }
    tick(where, line) {
      if (++this.steps > STEG_MAX) throw new PErr("Algoritmen tar aldrig slut! Efter " + STEG_MAX + " steg gav jag upp. Kolla att villkoret i loopen till slut blir falskt (krav: ändlighet).", line);
      this.where = where;
      if (this.trace.length < TRACE_MAX) this.trace.push({ at: where, vars: this.snapshot(), out: this.out.length });
    }
    snapshot() {
      const s = [];
      this.vars.forEach((v, k) => s.push([this.names.get(k), fmt(v), this.inputs.has(k)]));
      return s;
    }
    num(v, line, what) {
      if (typeof v !== "number") throw new PErr("Kan inte räkna " + what + " med " + typ(v) + " (" + fmt(v) + ").", line);
      return v;
    }
    bool(v, line) {
      if (typeof v !== "boolean") throw new PErr("Ett villkor måste bli SANT eller FALSKT, men det här blev " + typ(v) + " (" + fmt(v) + "). Saknas en jämförelse som = eller >?", line);
      return v;
    }
    ev(e, L) {
      switch (e.o) {
        case "lit": return e.v;
        case "var": return this.get(e.n, L);
        case "list": return e.items.map((x) => this.ev(x, L));
        case "neg": return -this.num(this.ev(e.a, L), L, "minus");
        case "not": return !this.bool(this.ev(e.a, L), L);
        case "and": return this.bool(this.ev(e.a, L), L) && this.bool(this.ev(e.b, L), L);
        case "or": return this.bool(this.ev(e.a, L), L) || this.bool(this.ev(e.b, L), L);
        case "idx": {
          const a = this.ev(e.a, L), i = this.ev(e.i, L);
          if (!Array.isArray(a) && typeof a !== "string") throw new PErr("Bara listor och texter kan indexeras med [ ].", L);
          if (typeof i !== "number" || !Number.isInteger(i)) throw new PErr("Ett index måste vara ett heltal.", L);
          if (i < 0 || i >= a.length) throw new PErr("Index " + i + " finns inte. Listan har " + a.length + " element med index 0–" + (a.length - 1) + ".", L);
          return a[i];
        }
        case "call": {
          const b = this.builtins.get(nameKey(e.n));
          if (!b) throw new PErr("Funktionen " + e.n + "() finns inte här.", L);
          const args = e.args.map((x) => this.ev(x, L));
          if (b.n !== undefined && args.length !== b.n) throw new PErr(e.n.toUpperCase() + "() ska ha " + (b.n === 0 ? "tomma parenteser" : b.n + " värde" + (b.n > 1 ? "n" : "") + " inom parentesen") + ".", L);
          try { return b.f(...args); } catch (err) {
            if (err instanceof PErr || err instanceof Halt) throw err;
            throw new PErr(String(err && err.message ? err.message : err), L);
          }
        }
        case "+": {
          const a = this.ev(e.a, L), b = this.ev(e.b, L);
          if (typeof a === "string" || typeof b === "string") return fmt(a) + fmt(b);
          if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
          return this.num(a, L, "plus") + this.num(b, L, "plus");
        }
        case "-": return this.num(this.ev(e.a, L), L, "minus") - this.num(this.ev(e.b, L), L, "minus");
        case "*": return this.num(this.ev(e.a, L), L, "gånger") * this.num(this.ev(e.b, L), L, "gånger");
        case "/": case "div": case "mod": {
          const a = this.num(this.ev(e.a, L), L, "division"), b = this.num(this.ev(e.b, L), L, "division");
          if (b === 0) throw new PErr("Division med noll går inte.", L);
          if (e.o === "/") return a / b;
          if (e.o === "div") return Math.floor(a / b);
          return ((a % b) + b) % b;
        }
        case "=": return eq(this.ev(e.a, L), this.ev(e.b, L));
        case "!=": return !eq(this.ev(e.a, L), this.ev(e.b, L));
        default: {
          const a = this.ev(e.a, L), b = this.ev(e.b, L);
          if (typeof a !== typeof b || (typeof a !== "number" && typeof a !== "string"))
            throw new PErr("Kan inte jämföra " + typ(a) + " med " + typ(b) + " med " + e.o + ".", L);
          const x = typeof a === "string" ? fold(a) : a, y = typeof b === "string" ? fold(b) : b;
          return e.o === "<" ? x < y : e.o === ">" ? x > y : e.o === "<=" ? x <= y : x >= y;
        }
      }
    }
    run(stmts, where) {
      for (const s of stmts) this.exec(s, where);
    }
    exec(s, where) {
      if (s.t === "skip") return;
      const at = where ? where : s.n;
      const L = s.n;
      this.tick(at, L);
      switch (s.t) {
        case "set": this.set(s.v, this.ev(s.e, L)); return;
        case "setidx": {
          const a = this.get(s.v, L), i = this.ev(s.i, L);
          if (!Array.isArray(a)) throw new PErr(s.v + " är ingen lista.", L);
          if (typeof i !== "number" || i < 0 || i >= a.length) throw new PErr("Index " + fmt(i) + " finns inte i listan.", L);
          a[i] = this.ev(s.e, L); return;
        }
        case "print": this.out.push(s.e.map((x) => fmt(this.ev(x, L))).join(" ")); return;
        case "halt": throw new Halt();
        case "expr": this.ev(s.e, L); return;
        case "if": {
          if (this.bool(this.ev(s.c, L), L)) this.run(s.then, where);
          else if (s.els) this.run(s.els, where);
          return;
        }
        case "while": {
          while (this.bool(this.ev(s.c, L), L)) { this.run(s.body, where); this.tick(at, L); }
          return;
        }
        case "rep": {
          const n = this.num(this.ev(s.c, L), L, "antal varv");
          for (let k = 0; k < n; k++) { this.run(s.body, where); if (k < n - 1) this.tick(at, L); }
          return;
        }
        case "each": {
          const list = this.ev(s.c, L);
          if (!Array.isArray(list) && typeof list !== "string") throw new PErr("FÖR VARJE behöver en lista, men fick " + typ(list) + ".", L);
          const items = Array.from(list);
          items.forEach((x, k) => { if (k > 0) this.tick(at, L); this.set(s.v, x); this.run(s.body, where); });
          return;
        }
        case "range": {
          const a = this.num(this.ev(s.a, L), L, "FÖR"), b = this.num(this.ev(s.b, L), L, "FÖR");
          for (let k = a; k <= b; k++) { if (k > a) this.tick(at, L); this.set(s.v, k); this.run(s.body, where); }
          return;
        }
      }
    }
  }

  // Kör ett pseudokodprogram. Svarar { out, trace, error, steps }.
  function runCode(src, vars, builtins) {
    const m = new Machine(vars, builtins);
    let prog;
    try { prog = compile(src); } catch (e) { return { out: [], trace: [], error: errOf(e), compileError: true }; }
    if (!prog.length) return { out: [], trace: [], error: { msg: "Programmet är tomt.", line: null }, compileError: true };
    try { m.run(prog); } catch (e) { if (!(e instanceof Halt)) return finish(m, errOf(e)); }
    return finish(m, null);
  }
  function finish(m, error) {
    m.trace.push({ at: null, vars: m.snapshot(), out: m.out.length, end: true });
    return { out: m.out, trace: m.trace, error, steps: m.steps };
  }
  function errOf(e) {
    if (e instanceof PErr) return { msg: e.message, line: e.line };
    console.error(e);
    return { msg: "Något gick fel: " + (e && e.message ? e.message : e), line: null };
  }

  function checkSyntax(src) {
    try { compile(src); return null; } catch (e) { return errOf(e); }
  }

  /* ---------------- Flödesschema ---------------- */
  // graph = { nodes: [{ id, type: start|process|decision|output|end, x, y, text, next, ja, nej }] }

  function nodeLabel(n) {
    const T = { start: "Start", end: "Slut", process: "Process", decision: "Beslut", output: "Utskrift" };
    return T[n.type] + " " + n.id;
  }

  function compileNode(n) {
    const txt = (n.text || "").trim();
    if (n.type === "process") {
      if (!txt) throw new PErr(nodeLabel(n) + " är tom. Skriv en tilldelning, t.ex. x ← 0.", null);
      return compile(txt);
    }
    if (n.type === "output") {
      if (!txt) throw new PErr(nodeLabel(n) + " är tom. Skriv det som ska skrivas ut, t.ex. \"LARM\".", null);
      const s = RX.print.test(txt) ? txt : "SKRIV UT " + txt;
      return compile(s);
    }
    if (n.type === "decision") {
      const c = txt.replace(/\?+\s*$/, "").replace(/^OM\s+/i, "").trim();
      if (!c) throw new PErr(nodeLabel(n) + " saknar ett villkor, t.ex. x > 5.", null);
      return expr1(c, null);
    }
    return null;
  }

  function runFlow(graph, vars, builtins) {
    const m = new Machine(vars, builtins);
    const byId = new Map(graph.nodes.map((n) => [n.id, n]));
    const code = new Map();
    const fail = (msg, id) => ({ msg, node: id, line: null });
    const start = graph.nodes.find((n) => n.type === "start");
    if (!start) return { out: [], trace: [], error: fail("Flödesschemat saknar Start."), compileError: true };
    try {
      graph.nodes.forEach((n) => {
        try { code.set(n.id, compileNode(n)); }
        catch (e) { const er = errOf(e); throw Object.assign(new Error(), { flow: true, msg: nodeLabel(n) + ": " + er.msg.replace(/ på rad \d+/, ""), node: n.id }); }
      });
    } catch (e) {
      if (e.flow) return { out: [], trace: [], error: { msg: e.msg, node: e.node }, compileError: true };
      throw e;
    }
    let cur = start;
    try {
      for (;;) {
        if (cur.type === "end") { m.tick(cur.id, null); break; }
        if (cur.type === "decision") {
          m.tick(cur.id, null);
          let v;
          try { v = m.bool(m.ev(code.get(cur.id), null), null); }
          catch (e) { throw Object.assign(e, { node: cur.id }); }
          const to = v ? cur.ja : cur.nej;
          if (!to || !byId.has(to)) throw Object.assign(new PErr(nodeLabel(cur) + " blev " + (v ? "SANT" : "FALSKT") + ", men " + (v ? "Ja" : "Nej") + "-pilen pekar inte på någon ruta."), { node: cur.id });
          cur = byId.get(to);
          continue;
        }
        if (cur.type === "start") m.tick(cur.id, null);
        else {
          try { m.run(code.get(cur.id), cur.id); }
          catch (e) { if (e instanceof Halt) break; throw Object.assign(e, { node: cur.id }); }
        }
        if (!cur.next || !byId.has(cur.next)) throw Object.assign(new PErr(nodeLabel(cur) + " har ingen pil ut. Vart ska algoritmen ta vägen sedan?"), { node: cur.id });
        cur = byId.get(cur.next);
      }
    } catch (e) {
      const er = errOf(e);
      er.node = e.node != null ? e.node : m.where;
      if (er.node != null && e instanceof PErr && !/^(Start|Slut|Process|Beslut|Utskrift) \d/.test(er.msg)) {
        const n = byId.get(er.node); if (n) er.msg = nodeLabel(n) + ": " + er.msg;
      }
      return finish(m, er);
    }
    return finish(m, null);
  }

  window.Tolk = { runCode, runFlow, checkSyntax, fmt, fold, eq, nameKey, nodeLabel, compileNode, PErr };
})();
