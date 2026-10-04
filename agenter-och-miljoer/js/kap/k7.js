// Kapitel 7: en AI-assistent med verktyg, steg för steg.
import { el } from '../sim.js';
import { markDone } from '../store.js';

const STEPS = [
  { c: 'goal', lab: 'Uppgift från användaren', t: '”Hitta en tid nästa vecka när hela gruppen (jag, Sara och Malik) kan ses en timme för grupparbetet, och boka ett grupprum.”' },
  { c: 'think', lab: 'Tänker', t: 'Jag behöver veta när alla tre är lediga. Jag börjar med att läsa kalendrarna.' },
  { c: 'act', lab: 'Handling – verktygsanrop', t: '<code>läs_kalender(personer=["jag", "Sara", "Malik"], vecka=46)</code>' },
  { c: 'obs', lab: 'Percept – svar från verktyget', t: 'Gemensamt lediga tider: tisdag 13–14, torsdag 10–11, fredag 14–15.' },
  { c: 'think', lab: 'Tänker', t: 'Tre möjliga tider. Nu kollar jag vilka grupprum som är lediga då.' },
  { c: 'act', lab: 'Handling – verktygsanrop', t: '<code>sök_lediga_rum(tider=["tis 13–14", "tor 10–11", "fre 14–15"])</code>' },
  { c: 'obs', lab: 'Percept – svar från verktyget', t: 'Tisdag: inga rum lediga. Torsdag: rum B12. Fredag: rum B12 och C03.' },
  { c: 'think', lab: 'Tänker', t: 'Torsdag 10–11 i B12 är den tidigaste tiden som fungerar. Att boka och meddela andra påverkar världen – jag bör fråga användaren först.' },
  { c: 'act', lab: 'Handling – fråga användaren', t: '”Jag hittade torsdag 10–11 i rum B12. Ska jag boka det och meddela Sara och Malik?”' },
  { c: 'obs', lab: 'Percept – användaren svarar', t: '”Ja, kör!”' },
  { c: 'act', lab: 'Handling – verktygsanrop', t: '<code>boka_rum(rum="B12", tid="tor 10–11")</code> och <code>skicka_meddelande(till=["Sara", "Malik"], text="Grupparbete torsdag 10–11 i B12")</code>' },
  { c: 'obs', lab: 'Percept – svar från verktyget', t: 'Bokning bekräftad. Meddelanden skickade.' },
  { c: 'done', lab: 'Klart', t: '”Klart! Ni ses torsdag 10–11 i B12. Sara och Malik har fått ett meddelande.”' },
];

export function init() {
  const trace = document.getElementById('k7-trace');
  const next = document.getElementById('k7-next');
  let i = 0;
  const add = () => {
    if (i >= STEPS.length) return;
    const s = STEPS[i++];
    const box = el('div', { class: `tstep ${s.c}` }, el('div', { class: 'lab' }, s.lab), el('div'));
    box.lastChild.innerHTML = s.t;
    trace.append(box);
    if (i >= STEPS.length) { next.disabled = true; markDone('k7'); }
  };
  next.addEventListener('click', add);
  document.getElementById('k7-reset').addEventListener('click', () => { trace.replaceChildren(); i = 0; next.disabled = false; add(); });
  add();
}
