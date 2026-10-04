// Kapitel 3: miljöns sex egenskaper och klassificeringsövning.
import { el } from '../sim.js';
import { load, save, markDone } from '../store.js';

const DIMS = [
  { k: 'obs', q: 'Ser agenten allt?', a: 'Fullt observerbar', b: 'Delvis observerbar',
    txt: 'Ser agentens sensorer allt som är viktigt för beslutet? I schack syns hela brädet. I poker är motståndarnas kort dolda.' },
  { k: 'det', q: 'Finns det slump?', a: 'Deterministisk', b: 'Stokastisk',
    txt: 'Bestäms nästa läge helt av nuläget och agentens handling? Eller finns slump och osäkerhet, som när en tärning kastas eller ett hjul slirar?' },
  { k: 'epi', q: 'Påverkar beslut framtiden?', a: 'Episodisk', b: 'Sekventiell',
    txt: 'Är varje beslut fristående (som att bedöma en bild i taget), eller påverkar dagens beslut framtiden (som ett drag i schack)?' },
  { k: 'sta', q: 'Ändras världen medan agenten tänker?', a: 'Statisk', b: 'Dynamisk',
    txt: 'Står världen still medan agenten tänker? Ett korsord väntar på dig – trafiken gör det inte.' },
  { k: 'dis', q: 'Rutor eller flytande värden?', a: 'Diskret', b: 'Kontinuerlig',
    txt: 'Finns ett begränsat antal lägen och handlingar (rutor, drag), eller flytande värden som hastighet, vinkel och tid?' },
  { k: 'ag', q: 'Finns det andra agenter?', a: 'En agent', b: 'Flera agenter',
    txt: 'Finns det andra agenter vars handlingar påverkar resultatet – motspelare eller medspelare?' },
];

// v: 'a' eller 'b' (vänster/höger alternativ). m: diskutabel – båda godkänns.
const ENVS = [
  { namn: 'Korsord', desc: 'Du löser ett korsord i en tidning.', ans: {
    obs: { v: 'a', e: 'Hela korsordet syns.' }, det: { v: 'a', e: 'Det finns ingen slump – det du skriver står kvar.' },
    epi: { v: 'b', e: 'Ett ord påverkar vilka bokstäver som passar i andra ord.' }, sta: { v: 'a', e: 'Korsordet väntar medan du tänker.' },
    dis: { v: 'a', e: 'Ett begränsat antal rutor och bokstäver.' }, ag: { v: 'a', e: 'Bara du.' } } },
  { namn: 'Schack (utan klocka)', desc: 'Ett schackprogram spelar mot en människa.', ans: {
    obs: { v: 'a', e: 'Hela brädet syns.' }, det: { v: 'a', e: 'Ett drag ger alltid samma resultat. Motståndarens drag är svåra att förutse, men inte slumpmässiga i regelmässig mening – därför kallas schack ofta deterministiskt.' },
    epi: { v: 'b', e: 'Varje drag påverkar resten av partiet.' }, sta: { v: 'a', e: 'Utan klocka står partiet still medan agenten tänker.' },
    dis: { v: 'a', e: 'Ändligt antal ställningar och drag.' }, ag: { v: 'b', e: 'Två spelare med motsatta mål.' } } },
  { namn: 'Poker', desc: 'En AI spelar Texas hold’em mot fem människor.', ans: {
    obs: { v: 'b', e: 'Motståndarnas kort är dolda.' }, det: { v: 'b', e: 'Korten blandas – slumpen avgör vad som kommer.' },
    epi: { v: 'b', e: 'Hur du har spelat tidigare påverkar hur motståndarna tolkar dig.' }, sta: { v: 'a', e: 'Spelet väntar på din tur.' },
    dis: { v: 'a', e: 'Begränsat antal kort och handlingar (passa, syna, höja).' }, ag: { v: 'b', e: 'Flera motspelare.' } } },
  { namn: 'Självkörande taxi', desc: 'En taxi utan förare kör i stadstrafik.', ans: {
    obs: { v: 'b', e: 'Den kan inte se runt hörn eller veta vad andra förare tänker göra.' }, det: { v: 'b', e: 'Däck kan slira, fotgängare kan kliva ut.' },
    epi: { v: 'b', e: 'Varje beslut påverkar var bilen befinner sig sedan.' }, sta: { v: 'b', e: 'Trafiken rör sig medan taxin tänker.' },
    dis: { v: 'b', e: 'Hastighet, position och rattvinkel är kontinuerliga.' }, ag: { v: 'b', e: 'Andra bilar, cyklister och fotgängare.' } } },
  { namn: 'Bildanalys av röntgenbilder', desc: 'En AI bedömer om en röntgenbild visar en tumör, en bild i taget.', ans: {
    obs: { v: 'a', m: true, e: 'Hela bilden syns – men patientens kropp gör det inte. Därför diskutabelt.' }, det: { v: 'a', e: 'Samma bild ger samma bedömning.' },
    epi: { v: 'a', e: 'Varje bild bedöms för sig – beslutet om en bild påverkar inte nästa. Typexemplet på episodisk!' }, sta: { v: 'a', e: 'Bilden ändras inte medan AI:n tittar.' },
    dis: { v: 'b', m: true, e: 'Pixlarna är diskreta tal, men ljusstyrkan beskriver något kontinuerligt. Båda svaren går att motivera.' }, ag: { v: 'a', e: 'Bara agenten (läkaren fattar sedan beslut, men påverkar inte bilden).' } } },
  { namn: 'Dammsugarrobot i ett hem', desc: 'En riktig robotdammsugare i en lägenhet med en familj och en hund.', ans: {
    obs: { v: 'b', e: 'Den ser bara det som är precis framför sensorerna.' }, det: { v: 'b', e: 'Hjul slirar, mattor fastnar.' },
    epi: { v: 'b', e: 'Var den städar nu påverkar vad som är kvar att städa.' }, sta: { v: 'b', e: 'Människor och hunden flyttar saker och drar in smuts.' },
    dis: { v: 'b', e: 'En riktig robot rör sig fritt – det är bara vår simulering som har rutor.' }, ag: { v: 'b', m: true, e: 'Hunden och människorna påverkar miljön. Om de räknas som agenter med egna mål är en tolkningsfråga.' } } },
  { namn: 'Tetris', desc: 'En AI spelar klassiskt Tetris där bitarna faller allt snabbare.', ans: {
    obs: { v: 'a', e: 'Hela spelplanen (och ofta nästa bit) syns.' }, det: { v: 'b', e: 'Vilken bit som kommer härnäst slumpas.' },
    epi: { v: 'b', e: 'Där du lägger en bit påverkar resten av spelet.' }, sta: { v: 'b', e: 'Biten faller medan agenten tänker.' },
    dis: { v: 'a', e: 'Rutnät och ett fåtal handlingar.' }, ag: { v: 'a', e: 'Bara spelaren.' } } },
  { namn: 'Kundtjänst-chattbot', desc: 'En chattbot svarar på frågor från kunder i en webbutik.', ans: {
    obs: { v: 'b', e: 'Den vet inte vad kunden egentligen menar eller känner.' }, det: { v: 'b', e: 'Den kan inte förutse vad kunden svarar.' },
    epi: { v: 'b', m: true, e: 'Inom ett samtal är den sekventiell (tidigare svar spelar roll). Mellan olika kunder är den nästan episodisk.' }, sta: { v: 'a', m: true, e: 'Kunden väntar oftast på svaret, men om boten är för långsam lämnar kunden. Diskutabelt.' },
    dis: { v: 'a', e: 'Text består av ett begränsat antal tecken och ord.' }, ag: { v: 'b', e: 'Kunden är en annan agent med egna mål.' } } },
];

export function init() {
  const dims = document.getElementById('k3-dims');
  for (const d of DIMS) dims.append(el('div', { class: 'dim' }, el('h4', {}, `${d.a} – ${d.b}`), el('p', {}, d.txt)));

  const state = load().envs || {}; // { envIndex: { choices: {k: 'a'|'b'}, checked: bool, perfect: bool } }
  const dots = document.getElementById('k3-dots'), host = document.getElementById('k3-env');
  let cur = 0;
  const dotBtns = ENVS.map((e, i) => {
    const b = el('button', { title: e.namn, 'aria-label': e.namn, onclick: () => show(i) }, String(i + 1));
    dots.append(b); return b;
  });
  const refreshDots = () => dotBtns.forEach((b, i) => { b.setAttribute('aria-current', String(i === cur)); b.classList.toggle('ok', !!state[i]?.perfect); });

  function show(i) {
    cur = i; refreshDots();
    const env = ENVS[i];
    const s = state[i] || (state[i] = { choices: {} });
    const rows = [], rowEls = [];
    const result = el('p', { 'aria-live': 'polite' });
    for (const d of DIMS) {
      const fb = el('div', { class: 'env-fb', hidden: true });
      const btns = ['a', 'b'].map(v => el('button', { 'aria-pressed': String(s.choices[d.k] === v), onclick: () => {
        s.choices[d.k] = v; btns.forEach((b, j) => b.setAttribute('aria-pressed', String(['a', 'b'][j] === v)));
        fb.hidden = true; save({ envs: state });
      } }, d[v]));
      const row = el('div', { class: 'env-row' }, el('span', {}, d.q), el('div', { class: 'seg' }, btns), fb);
      rows.push({ d, fb });
      rowEls.push(row);
    }
    const check = () => {
      let right = 0, total = 0;
      for (const { d, fb } of rows) {
        const a = env.ans[d.k], c = s.choices[d.k];
        if (!c) { fb.hidden = true; continue; }
        total++;
        const ok = c === a.v || !!a.m;
        right += ok;
        fb.hidden = false;
        fb.className = 'env-fb ' + (a.m ? 'maybe' : ok ? 'ok' : 'bad');
        fb.textContent = (a.m ? `Diskutabelt (facit: ${d[a.v].toLowerCase()}). ` : ok ? 'Rätt. ' : `Facit: ${d[a.v].toLowerCase()}. `) + a.e;
      }
      if (total < DIMS.length) { result.textContent = `Du har valt på ${total} av ${DIMS.length} rader.`; return; }
      s.checked = true; s.perfect = right === DIMS.length; save({ envs: state }); refreshDots();
      result.innerHTML = s.perfect ? '<b>Alla rätt!</b>' : `${right} av ${DIMS.length} rätt. Läs förklaringarna.`;
      if (ENVS.every((_, j) => state[j]?.checked)) markDone('k3');
    };
    host.replaceChildren(el('div', { class: 'env-card' },
      el('div', { class: 'env-head' }, el('h4', {}, `${i + 1}. ${env.namn}`), el('span', { class: 'muted small' }, `Miljö ${i + 1} av ${ENVS.length}`)),
      el('p', { class: 'env-desc' }, env.desc),
      ...rowEls));
    host.append(el('div', { class: 'toolbar' },
      el('button', { onclick: check }, 'Rätta'),
      el('button', { class: 'ghost', disabled: i === 0, onclick: () => show(i - 1) }, '← Föregående'),
      el('button', { class: 'ghost', disabled: i === ENVS.length - 1, onclick: () => show(i + 1) }, 'Nästa →')), result);
    if (s.checked) check();
  }
  host.replaceChildren();
  show(0);
}
