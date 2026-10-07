// Kapitel 8: quiz med direkt återkoppling.
import { el } from '../sim.js';
import { load, save, markDone } from '../store.js';

const QS = [
  { q: 'Vad är ett percept?', alts: ['Det agenten uppfattar med sina sensorer vid ett visst tillfälle', 'Den handling agenten väljer', 'Agentens mål', 'Agentens minne av allt som har hänt'], r: 0,
    ex: 'Ett percept är agentens sinnesintryck just nu, till exempel [A, Smutsig].' },
  { q: 'Vad står A för i PEAS?', alts: ['Agent', 'Actuators – ställdon', 'Algorithm – algoritm', 'Accuracy – träffsäkerhet'], r: 1,
    ex: 'Performance, Environment, Actuators, Sensors. Ställdonen är det agenten påverkar miljön med.' },
  { q: 'En rationell agent …', alts: ['vet alltid vad som kommer att hända', 'gör aldrig fel', 'väljer den handling som förväntas ge bäst resultat utifrån det den vet', 'följer alltid sina regler, oavsett resultat'], r: 2,
    ex: 'Rationell betyder inte allvetande. Agenten gör det bästa den kan med den information den har.' },
  { q: 'I poker är motståndarnas kort dolda. Miljön är därför …', alts: ['delvis observerbar', 'dynamisk', 'kontinuerlig', 'episodisk'], r: 0,
    ex: 'Agenten kan inte se allt som är viktigt för beslutet – den är delvis observerbar.' },
  { q: 'En AI som bedömer röntgenbilder, en i taget, verkar i en miljö som är …', alts: ['sekventiell', 'episodisk', 'dynamisk', 'med flera agenter'], r: 1,
    ex: 'Bedömningen av en bild påverkar inte nästa bild. Varje beslut är en egen episod.' },
  { q: 'Vilken egenskap gör att en plan kan misslyckas även om agenten ser allt?', alts: ['Att miljön är diskret', 'Att miljön är stokastisk', 'Att miljön är episodisk', 'Att det bara finns en agent'], r: 1,
    ex: 'I en stokastisk miljö blir resultatet av en handling inte alltid det man räknat med – hjul slirar, tärningar kastas.' },
  { q: 'Varför fastnade den enkla reflexagenten i en loop i den delvis observerbara lägenheten?', alts: ['Batteriet tog slut', 'Den har inget minne, så samma percept ger alltid samma handling', 'Den hade fel mål', 'Hunden stod i vägen'], r: 1,
    ex: 'Utan minne vet den inte att den redan har varit på en ruta. Samma situation → samma handling → samma loop.' },
  { q: 'Vad har en modellbaserad agent som en enkel reflexagent saknar?', alts: ['Sensorer', 'Ett inre tillstånd – en modell av världen', 'En nyttofunktion', 'Förmåga att lära sig'], r: 1,
    ex: 'Den modellbaserade agenten bygger upp en bild av världen, även av det den inte ser just nu.' },
  { q: 'Vad skiljer en nyttobaserad agent från en målbaserad?', alts: ['Den nyttobaserade har inga sensorer', 'Den nyttobaserade kan avgöra hur bra olika lägen är och göra avvägningar', 'Den målbaserade kan inte planera', 'Det finns ingen skillnad'], r: 1,
    ex: 'Ett mål är ja/nej. En nyttofunktion ger ett mått på hur bra – till exempel att det är värt att åka hem och ladda.' },
  { q: 'Vad betyder ”utforska eller utnyttja” för en lärande agent?', alts: ['Att välja mellan att prova nytt och att göra det den redan vet fungerar', 'Att välja mellan att lära sig och att glömma', 'Att välja mellan två olika mål', 'Att välja mellan att spara och använda batteri'], r: 0,
    ex: 'Utforskar den för lite hittar den aldrig bättre lösningar. Utforskar den för mycket använder den aldrig det den har lärt sig.' },
  { q: 'En robot belönas för varje gång den suger upp smuts. Vad är risken?', alts: ['Att den blir för långsam', 'Att den hittar ett sätt att få poäng utan att det blir rent, till exempel genom att tömma påsen och suga igen', 'Att batteriet tar slut', 'Ingen risk – det är ett bra mått'], r: 1,
    ex: 'Belöningsfusk: mät det du vill ha i miljön (en ren lägenhet), inte ett beteende du tror leder dit.' },
  { q: 'En AI-assistent som kan läsa kalendrar och boka rum är …', alts: ['ingen agent, bara en chattbot', 'en agent: den uppfattar (verktygssvar, text) och handlar (bokar, skickar)', 'en enkel reflexagent', 'en agent i en fullt observerbar och deterministisk miljö'], r: 1,
    ex: 'Den uppfattar och påverkar sin omgivning genom verktyg. Miljön är dessutom delvis observerbar och stokastisk.' },
];

export function init() {
  const host = document.getElementById('k8-quiz'), scoreEl = document.getElementById('k8-score');
  let answers = load().quiz || {};
  const update = () => {
    const n = Object.keys(answers).length, right = Object.entries(answers).filter(([i, a]) => QS[i].r === a).length;
    scoreEl.textContent = n ? `${right} av ${QS.length} rätt${n < QS.length ? ` (${n} besvarade)` : ''}` : '';
    if (n === QS.length) markDone('k8');
    const prev = load().quizScore;
    if (!prev || prev.right !== right || prev.n !== n) save({ quizScore: { right, n, max: QS.length } });
  };
  function build() {
    host.replaceChildren();
    QS.forEach((q, i) => {
      const ex = el('p', { class: 'ex', hidden: true }, q.ex);
      const btns = q.alts.map((a, j) => el('button', { onclick: () => answer(j) }, a));
      const answer = (j, silent) => {
        btns.forEach((b, k) => { b.disabled = true; if (k === q.r) b.classList.add('ok'); else if (k === j) b.classList.add('bad'); });
        ex.hidden = false;
        ex.prepend(el('b', {}, j === q.r ? 'Rätt! ' : 'Inte riktigt. '));
        if (!silent) { answers[i] = j; save({ quiz: answers }); update(); }
      };
      host.append(el('div', { class: 'q' }, el('p', { class: 'qt' }, `${i + 1}. ${q.q}`), el('div', { class: 'alts' }, btns), ex));
      if (answers[i] !== undefined) answer(answers[i], true);
    });
    update();
  }
  document.getElementById('k8-reset').addEventListener('click', () => { answers = {}; save({ quiz: {} }); build(); });
  build();
}
