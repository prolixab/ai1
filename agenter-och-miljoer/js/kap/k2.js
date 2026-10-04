// Kapitel 2: sortera PEAS-kort (dra och släpp, eller klicka kort → kolumn).
import { el } from '../sim.js';
import { load, save, markDone } from '../store.js';

const BINS = [
  { k: 'P', namn: 'Prestandamått', hint: 'Vad är ett bra resultat?' },
  { k: 'E', namn: 'Miljö', hint: 'Var verkar agenten?' },
  { k: 'A', namn: 'Ställdon', hint: 'Hur påverkar den?' },
  { k: 'S', namn: 'Sensorer', hint: 'Hur får den information?' },
];

const AGENTS = [
  { namn: 'Självkörande taxi', cards: {
    P: ['Säker resa utan olyckor', 'Kort restid och nöjd kund'],
    E: ['Vägar, trafik och fotgängare', 'Väder och väglag'],
    A: ['Ratt, gas och broms', 'Blinkers och tuta'],
    S: ['Kameror och lidar', 'GPS och hastighetsmätare'] } },
  { namn: 'Spamfilter', cards: {
    P: ['Andel mejl som sorteras rätt', 'Få viktiga mejl i skräpposten'],
    E: ['Användarens inkorg', 'Avsändare av mejl (även spammare)'],
    A: ['Flytta mejl till skräpposten', 'Markera mejl som misstänkt'],
    S: ['Mejlets text och rubrik', 'Användarens ”inte skräppost”-klick'] } },
  { namn: 'Kundtjänst-chattbot', cards: {
    P: ['Kundens problem blir löst', 'Kort tid till rätt svar'],
    E: ['Kunder som skriver i chatten', 'Företagets produkter och regler'],
    A: ['Skriva svar i chatten', 'Skicka ärendet vidare till en människa'],
    S: ['Texten kunden skriver', 'Kundens orderhistorik'] } },
  { namn: 'Rekommendationsalgoritm (videoapp)', cards: {
    P: ['Hur länge användaren tittar', 'Hur ofta användaren kommer tillbaka'],
    E: ['Miljontals användare och videor', 'Trender som ändras hela tiden'],
    A: ['Välja nästa video i flödet', 'Skicka en notis'],
    S: ['Vad du tittar på och hur länge', 'Gillningar, delningar och scrollande'] } },
];

function shuffle(a, seed) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return a.map(x => [r(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
}

export function init() {
  const tabs = document.getElementById('k2-tabs'), host = document.getElementById('k2-ex');
  const solved = load().peas || {};
  let current = 0;
  const tabBtns = AGENTS.map((a, i) => {
    const b = el('button', { role: 'tab', onclick: () => show(i) }, a.namn + (solved[i] ? ' ✓' : ''));
    tabs.append(b); return b;
  });

  function show(i) {
    current = i;
    tabBtns.forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
    const ag = AGENTS[i];
    const all = BINS.flatMap(b => ag.cards[b.k].map(t => ({ t, k: b.k })));
    let selected = null;
    const pool = el('div', { class: 'peas-pool', 'aria-label': 'Kort att sortera' });
    const bins = el('div', { class: 'peas-bins' });
    const result = el('p', { 'aria-live': 'polite' });
    const binEls = {};

    const place = (card, target) => {
      target.append(card);
      card.classList.remove('sel', 'ok', 'bad');
      selected = null;
      bins.querySelectorAll('.bin').forEach(b => b.classList.remove('target'));
      result.textContent = '';
    };

    for (const c of shuffle(all, i * 31 + 7)) {
      const card = el('button', { class: 'card', draggable: 'true', 'data-k': c.k }, c.t);
      card.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', ''); selected = card; });
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selected === card) { card.classList.remove('sel'); selected = null; return; }
        pool.querySelectorAll('.card.sel, .bin .card.sel').forEach(x => x.classList.remove('sel'));
        bins.querySelectorAll('.card.sel').forEach(x => x.classList.remove('sel'));
        selected = card; card.classList.add('sel');
      });
      pool.append(card);
    }
    for (const b of BINS) {
      const bin = el('div', { class: 'bin', 'data-k': b.k, role: 'button', tabindex: '0', 'aria-label': `Lägg i ${b.namn}` },
        el('h4', {}, el('span', { class: 'peas-letter' }, b.k), ' ', b.namn, el('small', {}, b.hint)));
      const drop = () => { if (selected) place(selected, bin); };
      bin.addEventListener('click', drop);
      bin.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(); } });
      bin.addEventListener('dragover', (e) => { e.preventDefault(); bin.classList.add('target'); });
      bin.addEventListener('dragleave', () => bin.classList.remove('target'));
      bin.addEventListener('drop', (e) => { e.preventDefault(); drop(); });
      binEls[b.k] = bin;
      bins.append(bin);
    }
    pool.addEventListener('click', () => { if (selected && selected.parentElement !== pool) place(selected, pool); });
    pool.addEventListener('dragover', (e) => e.preventDefault());
    pool.addEventListener('drop', (e) => { e.preventDefault(); if (selected) place(selected, pool); });

    const check = el('button', { onclick: () => {
      let right = 0, placed = 0;
      for (const b of BINS) for (const card of binEls[b.k].querySelectorAll('.card')) {
        placed++;
        const ok = card.dataset.k === b.k;
        card.classList.toggle('ok', ok); card.classList.toggle('bad', !ok);
        right += ok;
      }
      if (placed < all.length) { result.textContent = `Du har placerat ${placed} av ${all.length} kort. Placera alla först.`; return; }
      if (right === all.length) {
        result.innerHTML = '<b>Alla rätt!</b> Fundera på diskussionsfrågan nedanför.';
        solved[i] = true; save({ peas: solved });
        tabBtns[i].textContent = ag.namn + ' ✓';
        if (Object.keys(solved).length === AGENTS.length) markDone('k2');
      } else result.textContent = `${right} av ${all.length} rätt. Flytta de röda korten och rätta igen.`;
    } }, 'Rätta');
    const facit = el('button', { class: 'ghost', onclick: () => {
      for (const card of [...host.querySelectorAll('.card')]) place(card, binEls[card.dataset.k]);
      result.textContent = 'Så här ser facit ut. Tryck på Rätta för att se det färgmarkerat.';
    } }, 'Visa facit');

    host.replaceChildren(el('h3', {}, ag.namn), pool, bins, el('div', { class: 'toolbar' }, check, facit), result);
  }
  show(current);
}
