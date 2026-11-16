/*
 * Ljud – allt ljud i spelet syntetiseras med Web Audio API. Inga ljudfiler.
 *
 *   Ljud.unlock()          måste anropas från ett klick/tangenttryck (webbläsarens regel)
 *   Ljud.tick()            skrivmaskinsklick i terminalen
 *   Ljud.modem()           uppringning och modemtjut
 *   Ljud.alarm()           larm när DEFCON sjunker
 *   Ljud.ok() / fail()     testerna gick igenom / gick fel
 *   Ljud.win()             uppdraget klart
 *   Ljud.defcon(n)         ton när DEFCON stiger
 *   Ljud.blip()            knapptryck
 *   Ljud.music("intro" | "karta" | "slut" | null)
 *   Ljud.duck(true/false)  sänk musiken när eleven arbetar
 */
(function () {
  "use strict";

  const KEY = "defcon-ljud";
  let pref = { fx: true, mus: true };
  try { pref = Object.assign(pref, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { /* */ }
  const savePref = () => { try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) { /* */ } };

  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master, fxBus, musBus, comp, noiseBuf;

  function init() {
    if (ctx || !AC) return !!ctx;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = 0.8;
    fxBus = ctx.createGain(); fxBus.gain.value = pref.fx ? 1 : 0;
    musBus = ctx.createGain(); musBus.gain.value = pref.mus ? 0.55 : 0;
    fxBus.connect(comp); musBus.connect(comp); comp.connect(master); master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  const ready = () => ctx && ctx.state === "running";
  function unlock() {
    if (!init()) return Promise.resolve();
    const go = () => { if (pending !== undefined && ctx.state === "running") { const p = pending; pending = undefined; music(p); } };
    if (ctx.state === "suspended") return ctx.resume().then(go, () => {});
    go();
    return Promise.resolve();
  }
  // Första klicket eller tangenttrycket var som helst låser upp ljudet.
  ["pointerdown", "keydown"].forEach((ev) => window.addEventListener(ev, unlock, { capture: true }));

  /* ---------- Byggstenar ---------- */
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function tone(o) {
    // o: { f, t, dur, type, gain, a, r, bus, lp, q, f2, detune }
    const t = o.t != null ? o.t : ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = o.type || "square";
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    if (o.detune) osc.detune.value = o.detune;
    const g = ctx.createGain();
    const a = o.a != null ? o.a : 0.005, r = o.r != null ? o.r : 0.05, peak = o.gain != null ? o.gain : 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + Math.max(a, o.dur - r));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    let node = osc;
    if (o.lp) {
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; f.Q.value = o.q || 1;
      if (o.lp2) { f.frequency.setValueAtTime(o.lp, t); f.frequency.exponentialRampToValueAtTime(o.lp2, t + o.dur); }
      osc.connect(f); node = f;
    }
    node.connect(g); g.connect(o.bus || fxBus);
    osc.start(t); osc.stop(t + o.dur + 0.02);
    return osc;
  }
  function noise(o) {
    const t = o.t != null ? o.t : ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.ft || "bandpass"; f.frequency.value = o.f || 2000; f.Q.value = o.q || 1;
    const g = ctx.createGain(); const peak = o.gain || 0.1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + (o.a || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(o.bus || fxBus);
    src.start(t, Math.random()); src.stop(t + o.dur + 0.02);
  }

  /* ---------- Effekter ---------- */
  let lastTick = 0;
  function tick() {
    if (!ready() || !pref.fx) return;
    const now = ctx.currentTime;
    if (now - lastTick < 0.045) return;
    lastTick = now;
    noise({ f: 3200 + Math.random() * 1800, q: 6, dur: 0.025, gain: 0.07 });
    tone({ f: 1800 + Math.random() * 300, dur: 0.012, type: "square", gain: 0.012 });
  }
  function blip() {
    if (!ready() || !pref.fx) return;
    tone({ f: 1320, dur: 0.05, type: "square", gain: 0.05, lp: 3000 });
  }
  // Uppringning: knappval (DTMF), kopplingston, sedan modemets handskakning. Ca 3,6 s.
  function modem() {
    if (!ready() || !pref.fx) return 0;
    const DT = { 0: [941, 1336], 1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477] };
    let t = ctx.currentTime + 0.05;
    "0363121983".split("").forEach((d) => {
      DT[d].forEach((f) => tone({ f, t, dur: 0.07, type: "sine", gain: 0.06, a: 0.003, r: 0.01 }));
      t += 0.1;
    });
    t += 0.25;
    tone({ f: 2100, t, dur: 0.7, type: "sine", gain: 0.06, a: 0.01 });           // svarston
    t += 0.75;
    for (let i = 0; i < 6; i++) {                                                 // V.22-kvitter
      tone({ f: 1200 + (i % 2) * 1200, t, dur: 0.11, type: "sine", gain: 0.05 });
      noise({ t, f: 1800, q: 0.7, dur: 0.11, gain: 0.05 });
      t += 0.12;
    }
    noise({ t, f: 1500, q: 0.4, dur: 1.0, gain: 0.07, a: 0.05 });                 // brus
    tone({ f: 1650, t, dur: 1.0, type: "triangle", gain: 0.03 });
    tone({ f: 2400, t: t + 0.3, dur: 0.7, type: "sine", gain: 0.025 });
    return t + 1.0 - ctx.currentTime;
  }
  function alarm() {
    if (!ready() || !pref.fx) return;
    let t = ctx.currentTime + 0.02;
    for (let i = 0; i < 4; i++) {
      tone({ f: i % 2 ? 587 : 440, t, dur: 0.26, type: "sawtooth", gain: 0.07, lp: 2200, a: 0.01 });
      tone({ f: (i % 2 ? 587 : 440) * 1.01, t, dur: 0.26, type: "square", gain: 0.03, lp: 1600 });
      t += 0.27;
    }
    tone({ f: 55, t: ctx.currentTime, dur: 1.1, type: "sine", gain: 0.25, a: 0.01 });
  }
  function ok() {
    if (!ready() || !pref.fx) return;
    const t = ctx.currentTime + 0.02;
    [72, 76, 79, 84].forEach((m, i) => tone({ f: mtof(m), t: t + i * 0.07, dur: 0.16, type: "square", gain: 0.06, lp: 4000 }));
  }
  function fail() {
    if (!ready() || !pref.fx) return;
    const t = ctx.currentTime + 0.02;
    tone({ f: 196, t, dur: 0.18, type: "sawtooth", gain: 0.08, lp: 1200 });
    tone({ f: 147, t: t + 0.2, dur: 0.32, type: "sawtooth", gain: 0.08, lp: 900 });
  }
  function win() {
    if (!ready() || !pref.fx) return;
    const t = ctx.currentTime + 0.05;
    const seq = [[67, 0, 0.12], [72, 0.13, 0.12], [76, 0.26, 0.12], [79, 0.39, 0.5]];
    seq.forEach(([m, d, l]) => {
      tone({ f: mtof(m), t: t + d, dur: l, type: "square", gain: 0.07, lp: 3500 });
      tone({ f: mtof(m - 12), t: t + d, dur: l, type: "triangle", gain: 0.08 });
    });
    [60, 64, 67, 72].forEach((m) => tone({ f: mtof(m), t: t + 0.39, dur: 0.9, type: "sawtooth", gain: 0.03, lp: 1800, a: 0.05, r: 0.5 }));
  }
  function defcon(n) {
    if (!ready() || !pref.fx) return;
    const t = ctx.currentTime + 0.02;
    tone({ f: mtof(60 + n * 2), t, dur: 0.35, type: "triangle", gain: 0.12, a: 0.005, r: 0.3 });
    tone({ f: mtof(72 + n * 2), t, dur: 0.25, type: "sine", gain: 0.05 });
  }
  function power() {
    if (!ready() || !pref.fx) return;
    const t = ctx.currentTime;
    tone({ f: 60, t, dur: 0.5, type: "sawtooth", gain: 0.06, lp: 300 });
    tone({ f: 15000, f2: 15600, t: t + 0.05, dur: 1.4, type: "sine", gain: 0.01, a: 0.2 }); // bildrörets pip
    noise({ t, f: 600, q: 0.5, dur: 0.25, gain: 0.08 });
  }

  /* ---------- Musik ---------- */
  // Egen komposition i a-moll, 80-talssyntar. Sekvensern schemalägger 16-delar en bit framåt.
  const SONGS = {
    // Am – F – Dm – E, fyra takter som loopar
    intro: {
      bpm: 104,
      chords: [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]],
      bass: [45, 41, 38, 40],
      arp: [0, 1, 2, 1, 0, 1, 2, 3], arpOn: true, drums: true,
      lead: [[76, 0, 6], [74, 6, 2], [72, 8, 8], [72, 16, 6], [71, 22, 2], [69, 24, 8], [69, 32, 4], [72, 36, 4], [77, 40, 8], [76, 48, 6], [71, 54, 2], [68, 56, 8]],
    },
    // Lugnare och mörkare: bara bas, ackord och glesa toner
    karta: {
      bpm: 84,
      chords: [[57, 60, 64], [57, 60, 65], [55, 59, 62], [56, 59, 64]],
      bass: [45, 41, 43, 40],
      arp: [0, 2, 1, 2], arpOn: true, sparse: true, drums: false, lead: [],
    },
    // Slutet: dur, ljust
    slut: {
      bpm: 76,
      chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
      bass: [48, 43, 45, 41],
      arp: [0, 1, 2, 3, 2, 1], arpOn: true, drums: false,
      lead: [[79, 0, 8], [76, 8, 8], [74, 16, 12], [76, 28, 4], [72, 32, 16], [72, 48, 4], [74, 52, 4], [77, 56, 8]],
    },
  };

  let song = null, step = 0, nextT = 0, timer = null, pending, ducked = false, current = null;

  function music(name) {
    if (!ctx || ctx.state !== "running") { pending = name; return; }
    if (name === current) return;
    current = name;
    stopSeq();
    if (!name) return;
    song = SONGS[name];
    step = 0;
    nextT = ctx.currentTime + 0.1;
    musBus.gain.cancelScheduledValues(ctx.currentTime);
    musBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    musBus.gain.exponentialRampToValueAtTime(targetGain() || 0.0001, ctx.currentTime + 1.2);
    timer = setInterval(schedule, 25);
  }
  function stopSeq() { clearInterval(timer); timer = null; }
  function targetGain() { return pref.mus ? (ducked ? 0.18 : 0.55) : 0; }
  function duck(on) {
    ducked = !!on;
    if (!ctx) return;
    musBus.gain.cancelScheduledValues(ctx.currentTime);
    musBus.gain.setTargetAtTime(Math.max(0.0001, targetGain()), ctx.currentTime, 0.4);
  }

  function schedule() {
    if (!song || document.hidden) return;
    const s16 = 60 / song.bpm / 4;
    while (nextT < ctx.currentTime + 0.15) {
      play(step, nextT, s16);
      step = (step + 1) % 64;
      nextT += s16;
    }
  }
  function play(st, t, s16) {
    const bar = Math.floor(st / 16), pos = st % 16;
    const ch = song.chords[bar], b = song.bass[bar];
    const M = musBus;
    // Pad: tre ackordtoner, två lätt ostämda sågtänder var
    if (pos === 0) ch.forEach((m) => [-7, 7].forEach((dt) => tone({ f: mtof(m), t, dur: s16 * 16, type: "sawtooth", detune: dt, gain: song.sparse ? 0.022 : 0.016, lp: 900, lp2: song.sparse ? 600 : 1500, a: 0.6, r: 0.8, bus: M })));
    // Bas: pulserande åttondelar (glesare i kartmusiken)
    if (song.sparse ? pos % 8 === 0 : pos % 2 === 0) {
      tone({ f: mtof(b), t, dur: s16 * (song.sparse ? 6 : 1.7), type: "sawtooth", gain: 0.09, lp: 380, lp2: 160, q: 6, bus: M });
      tone({ f: mtof(b - 12), t, dur: s16 * 1.5, type: "sine", gain: 0.1, bus: M });
    }
    // Arpeggio
    if (song.arpOn && (!song.sparse || pos % 2 === 0)) {
      const notes = ch.concat([ch[0] + 12]);
      const m = notes[song.arp[(pos >> (song.sparse ? 1 : 0)) % song.arp.length]] + 12;
      const swell = 0.5 + 0.5 * Math.sin((st / 64) * Math.PI * 2);
      tone({ f: mtof(m), t, dur: s16 * 0.9, type: "square", gain: song.sparse ? 0.018 : 0.026, lp: 1200 + swell * 2600, q: 4, bus: M });
    }
    // Melodi
    song.lead.forEach(([m, at, len]) => {
      if (at === st) {
        tone({ f: mtof(m), t, dur: s16 * len, type: "triangle", gain: 0.06, a: 0.02, r: 0.2, bus: M });
        tone({ f: mtof(m), t, dur: s16 * len, type: "square", gain: 0.014, lp: 2000, detune: 6, a: 0.02, r: 0.2, bus: M });
      }
    });
    // Trummor: kick på 1 och 3, virvel på 2 och 4, hihat
    if (song.drums) {
      if (pos % 8 === 0) tone({ f: 120, f2: 40, t, dur: 0.18, type: "sine", gain: 0.28, a: 0.002, r: 0.12, bus: M });
      if (pos % 8 === 4) noise({ t, f: 1800, q: 0.6, dur: 0.14, gain: 0.07, bus: M });
      if (pos % 2 === 1) noise({ t, f: 9000, q: 1.2, dur: 0.03, gain: 0.03, ft: "highpass", bus: M });
    }
  }

  /* ---------- Knappar ---------- */
  function setFx(on) { pref.fx = on; savePref(); if (fxBus) fxBus.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.05); }
  function setMus(on) { pref.mus = on; savePref(); if (ctx) duck(ducked); }

  window.Ljud = {
    unlock, tick, blip, modem, alarm, ok, fail, win, defcon, power, music, duck,
    get fx() { return pref.fx; }, get mus() { return pref.mus; }, setFx, setMus,
    supported: !!AC,
  };
})();
