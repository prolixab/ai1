/*
 * De sex uppdragen. Varje uppdrag har en berättelse, en historisk bakgrund,
 * en uppgift, tester som elevens algoritm körs mot, ledtrådar och ett lösningsförslag.
 *
 * Ett test: { namn, indata (variabler), visa (indata som text), vantat: [rader],
 *             fn: () => ({ builtins, check(res) → felmeddelande | null }) }
 */
(function () {
  "use strict";

  const N = (id, type, x, y, text, links) => Object.assign({ id, type, x, y, text: text || "" }, links || {});

  window.UPPDRAG = [
    /* ---------------------------------------------------------------- 1 */
    {
      id: "s1",
      titel: "Månen över Norge",
      typ: "kod",
      begrepp: "Selektion",
      ar: 1960,
      mimer: "RADAREKO REGISTRERAT. 99,9 % SANNOLIKHET: ROBOTANFALL.",
      brev: "MIMER:s radarfilter tror att allt som syns på skärmen är robotar. Det har redan larmat för månen en gång i natt. Skriv ett nytt filter som sorterar ekona rätt – innan MIMER svarar på ett anfall som inte finns.",
      historia: "Den 5 oktober 1960 larmade den nya radarstationen i Thule på Grönland: dussintals sovjetiska robotar var på väg, med 99,9 procents säkerhet. Det var månen som gick upp över Norge. Ingen hade tänkt på att radarn kunde få eko från något så långt bort. Att Chrusjtjov just då var på besök i New York fick befälet att tvivla på larmet.",
      uppgift: [
        "Om ekot är <b>längre bort än 100 000 km</b>: skriv ut <code>\"MÅNEN\"</code>",
        "Annars, om det rör sig <b>snabbare än 5 km/s</b>: skriv ut <code>\"MISSIL\"</code>",
        "Annars: skriv ut <code>\"FLYGPLAN\"</code>",
      ],
      indata: [["avstånd", "hur långt bort ekot är, i km"], ["hastighet", "hur snabbt det rör sig, i km/s"]],
      utdata: "En rad: MÅNEN, MISSIL eller FLYGPLAN.",
      start:
`// Indata: avstånd (km) och hastighet (km/s)
// Skriv ut "MÅNEN", "MISSIL" eller "FLYGPLAN".

OM avstånd > 100000
  SKRIV UT "MÅNEN"
ANNARS
  // Fortsätt här. Tips: ANNARS OM …
`,
      losning:
`OM avstånd > 100000
  SKRIV UT "MÅNEN"
ANNARS OM hastighet > 5
  SKRIV UT "MISSIL"
ANNARS
  SKRIV UT "FLYGPLAN"
`,
      tips: [
        "Algoritmen har tre möjliga vägar. Använd <code>OM</code> … <code>ANNARS OM</code> … <code>ANNARS</code>. Allt som hör till en del skrivs med indrag (två mellanslag).",
        "Ordningen spelar roll. Kolla avståndet <i>först</i>: månen rör sig också, men den är aldrig en robot.",
        "Gränsfall: exakt 100 000 km är <b>inte</b> längre bort än 100 000 km. Använd <code>&gt;</code>, inte <code>≥</code>.",
      ],
      tester: [
        { namn: "Månen går upp över Norge", indata: { avstånd: 384400, hastighet: 1 }, vantat: ["MÅNEN"] },
        { namn: "Interkontinental robot", indata: { avstånd: 2500, hastighet: 7 }, vantat: ["MISSIL"] },
        { namn: "Passagerarflyg", indata: { avstånd: 300, hastighet: 0.25 }, vantat: ["FLYGPLAN"] },
        { namn: "Gränsfall: exakt 100 000 km", indata: { avstånd: 100000, hastighet: 6 }, vantat: ["MISSIL"] },
        { namn: "Gränsfall: exakt 5 km/s", indata: { avstånd: 1500, hastighet: 5 }, vantat: ["FLYGPLAN"] },
        { namn: "Ett snabbt eko långt bort", indata: { avstånd: 384400, hastighet: 9 }, vantat: ["MÅNEN"] },
      ],
      klart: "Det här är <b>selektion</b>: algoritmen väljer väg med villkor. Två saker avgör om den blir rätt – i vilken <b>ordning</b> villkoren prövas och hur <b>gränsfallen</b> hanteras. Radarn 1960 saknade helt enkelt ett villkor för ”för långt bort”.",
    },

    /* ---------------------------------------------------------------- 2 */
    {
      id: "s2",
      titel: "Solreflexen",
      typ: "flode",
      begrepp: "Nästlade val",
      ar: 1983,
      mimer: "SATELLIT OKO: 5 ROBOTAR UPPSKJUTNA. MOTANFALL REKOMMENDERAS.",
      brev: "MIMER litar blint på satelliterna. Men en enda sensor kan luras. Bygg ett flödesschema som tänker som Stanislav Petrov: ett larm räknas bara när markradarn bekräftar det, och ett riktigt anfall skulle aldrig bestå av en handfull robotar.",
      historia: "Natten till den 26 september 1983 visade det sovjetiska satellitsystemet Oko att fem amerikanska robotar var på väg. Den vakthavande officeren Stanislav Petrov skulle rapportera vidare – men han rapporterade falskt alarm. Ett riktigt förstaslag skulle bestå av hundratals robotar, och markradarn såg ingenting. Satelliterna hade luras av solljus som reflekterades i höga moln.",
      uppgift: [
        "Om markradarn <b>inte</b> ser något: skriv ut <code>\"FALSKT ALARM\"</code>",
        "Annars, om satelliten ser <b>färre än 20</b> robotar: skriv ut <code>\"KONTROLLERA\"</code>",
        "Annars: skriv ut <code>\"LARM\"</code>",
      ],
      indata: [["satellit", "antal robotar som satelliten ser"], ["radar", "SANT om markradarn också ser något, annars FALSKT"]],
      utdata: "En rad: FALSKT ALARM, KONTROLLERA eller LARM.",
      graf: {
        nodes: [
          N(1, "start", 420, 50),
          N(2, "output", 170, 430, '"FALSKT ALARM"', { next: 5 }),
          N(3, "output", 420, 430, '"KONTROLLERA"', { next: 5 }),
          N(4, "output", 670, 430, '"LARM"', { next: 5 }),
          N(5, "end", 420, 560),
        ],
      },
      losning: {
        nodes: [
          N(1, "start", 420, 50, "", { next: 6 }),
          N(6, "decision", 420, 160, "radar = SANT", { ja: 7, nej: 2 }),
          N(7, "decision", 560, 290, "satellit < 20", { ja: 3, nej: 4 }),
          N(2, "output", 170, 430, '"FALSKT ALARM"', { next: 5 }),
          N(3, "output", 420, 430, '"KONTROLLERA"', { next: 5 }),
          N(4, "output", 670, 430, '"LARM"', { next: 5 }),
          N(5, "end", 420, 560),
        ],
      },
      tips: [
        "Lägg till en <b>Beslut</b>-ruta (romben). Skriv ett villkor i den, till exempel <code>radar = SANT</code>.",
        "Ett beslut har två pilar ut: <b>Ja</b> och <b>Nej</b>. Markera rutan och välj vart pilarna går i panelen under schemat – eller dra från den lilla pricken till en annan ruta.",
        "Du behöver två beslut. Det andra, <code>satellit &lt; 20</code>, ska bara nås när radarn har sett något – alltså från Ja-pilen i det första.",
      ],
      tester: [
        { namn: "Petrovs natt", indata: { satellit: 5, radar: false }, vantat: ["FALSKT ALARM"] },
        { namn: "Stort larm, men bara från satelliten", indata: { satellit: 300, radar: false }, vantat: ["FALSKT ALARM"] },
        { namn: "Få robotar, radarn bekräftar", indata: { satellit: 5, radar: true }, vantat: ["KONTROLLERA"] },
        { namn: "Gränsfall: 19 robotar", indata: { satellit: 19, radar: true }, vantat: ["KONTROLLERA"] },
        { namn: "Gränsfall: 20 robotar", indata: { satellit: 20, radar: true }, vantat: ["LARM"] },
        { namn: "Massivt anfall", indata: { satellit: 250, radar: true }, vantat: ["LARM"] },
      ],
      klart: "Ett flödesschema visar samma sak som pseudokod, fast som bild: <b>romben</b> är ett val och pilarna Ja/Nej är vägarna. Två <b>oberoende sensorer</b> som båda måste bekräfta gör systemet mycket svårare att lura. Och 1983 var det en människa – inte en algoritm – som stoppade felet.",
    },

    /* ---------------------------------------------------------------- 3 */
    {
      id: "s3",
      titel: "Övningsbandet",
      typ: "kod",
      begrepp: "Iteration",
      ar: 1979,
      mimer: "INKOMMANDE: 2 200 SIGNALER. KLASSIFICERAR ALLA SOM FIENTLIGA.",
      brev: "Någon har laddat in ett övningsband i MIMER. Skärmarna fylls av signaler – de flesta är övningsdata och brus. Skriv en algoritm som går igenom signalerna en i taget och räknar hur många som är skarpa.",
      historia: "Den 9 november 1979 visade NORAD:s datorer plötsligt ett massivt sovjetiskt anfall. Stridsflygplan lyfte och den flygande ledningscentralen startade. Efter ungefär sex minuter stod det klart att inga satelliter eller radarstationer såg något: ett band med ett övningsscenario hade laddats in i det skarpa systemet.",
      uppgift: [
        "Gå igenom listan <code>signaler</code>, en signal i taget.",
        "Räkna hur många signaler som är <code>\"SKARP\"</code>. Signaler som är <code>\"ÖVNING\"</code> eller <code>\"BRUS\"</code> räknas inte.",
        "Skriv ut antalet – en gång, när du har gått igenom hela listan.",
      ],
      indata: [["signaler", "en lista, t.ex. [\"ÖVNING\", \"SKARP\", \"BRUS\"]"]],
      utdata: "En rad: antalet skarpa signaler, t.ex. 1.",
      start:
`// Indata: signaler, en lista med "SKARP", "ÖVNING" och "BRUS"
// Skriv ut hur många signaler som är "SKARP".

`,
      losning:
`antal ← 0
FÖR VARJE signal I signaler
  OM signal = "SKARP"
    antal ← antal + 1
SKRIV UT antal
`,
      tips: [
        "Du behöver en <b>räknare</b>, t.ex. <code>antal ← 0</code>. Den ska få sitt startvärde <i>före</i> loopen.",
        "<code>FÖR VARJE signal I signaler</code> går igenom listan. Varje varv har variabeln <code>signal</code> värdet på nästa signal.",
        "Inuti loopen: <code>OM signal = \"SKARP\"</code> så ökar du räknaren med <code>antal ← antal + 1</code>. Skriv ut <i>efter</i> loopen – utan indrag.",
      ],
      tester: [
        { namn: "Kort band", indata: { signaler: ["ÖVNING", "ÖVNING", "SKARP", "BRUS"] }, vantat: ["1"] },
        { namn: "Bara övning", indata: { signaler: ["ÖVNING", "ÖVNING", "ÖVNING", "ÖVNING", "ÖVNING", "ÖVNING"] }, vantat: ["0"] },
        { namn: "Flera skarpa", indata: { signaler: ["SKARP", "SKARP", "ÖVNING", "SKARP"] }, vantat: ["3"] },
        { namn: "Tomt band", indata: { signaler: [] }, vantat: ["0"] },
        { namn: "Bara brus", indata: { signaler: ["BRUS"] }, vantat: ["0"] },
        { namn: "Långt band", indata: { signaler: ["BRUS", "SKARP", "ÖVNING", "ÖVNING", "SKARP", "BRUS", "BRUS", "ÖVNING", "SKARP", "ÖVNING", "BRUS", "SKARP"] }, vantat: ["4"] },
      ],
      klart: "Det här är <b>iteration</b>: samma steg upprepas för varje signal. Mönstret <i>räknare före loopen – öka i loopen – svara efter loopen</i> kommer du att använda om och om igen. Testet med det tomma bandet visar varför startvärdet är viktigt.",
    },

    /* ---------------------------------------------------------------- 4 */
    {
      id: "s4",
      titel: "Heta linjen",
      typ: "flode",
      begrepp: "Loop med räknare",
      ar: 1963,
      mimer: "KOMMUNIKATION MED MOTSTÅNDAREN: ONÖDIG.",
      brev: "Om vi når andra sidan kan vi förklara att det är MIMER som spökar. Men linjen är störd och meddelandet kommer inte alltid fram. Försök <b>högst 5 gånger</b> – fler försök tolkar MIMER som en attack. Och sluta skicka så fort det har kommit fram.",
      historia: "Under Kubakrisen 1962 tog det timmar att få fram meddelanden mellan Washington och Moskva. Därför öppnades den 30 augusti 1963 ”heta linjen”. Det var ingen röd telefon, utan en fjärrskrivare: skriven text ansågs svårare att missförstå än ett samtal.",
      uppgift: [
        "Anropa <code>SKICKA()</code>. Den svarar <code>SANT</code> om meddelandet kom fram, annars <code>FALSKT</code>.",
        "Så fort svaret är SANT: skriv ut <code>\"KONTAKT\"</code> och sluta.",
        "Om det inte har kommit fram efter <b>5 försök</b>: skriv ut <code>\"INGEN KONTAKT\"</code>.",
      ],
      indata: [["SKICKA()", "funktion som försöker skicka meddelandet – svarar SANT eller FALSKT"]],
      utdata: "En rad: KONTAKT eller INGEN KONTAKT. SKICKA() får anropas högst 5 gånger.",
      graf: {
        nodes: [
          N(1, "start", 420, 50, "", { next: 2 }),
          N(2, "process", 420, 140, "försök ← 0"),
          N(3, "output", 200, 520, '"KONTAKT"', { next: 5 }),
          N(4, "output", 640, 520, '"INGEN KONTAKT"', { next: 5 }),
          N(5, "end", 420, 620),
        ],
      },
      losning: {
        nodes: [
          N(1, "start", 420, 50, "", { next: 2 }),
          N(2, "process", 420, 140, "försök ← 0", { next: 6 }),
          N(6, "process", 420, 240, "försök ← försök + 1\nsvar ← SKICKA()", { next: 7 }),
          N(7, "decision", 420, 350, "svar = SANT", { ja: 3, nej: 8 }),
          N(8, "decision", 640, 420, "försök < 5", { ja: 6, nej: 4 }),
          N(3, "output", 200, 520, '"KONTAKT"', { next: 5 }),
          N(4, "output", 640, 520, '"INGEN KONTAKT"', { next: 5 }),
          N(5, "end", 420, 620),
        ],
      },
      tips: [
        "Lägg till en Process-ruta som gör två saker: ökar räknaren och skickar. Skriv två rader i samma ruta: <code>försök ← försök + 1</code> och <code>svar ← SKICKA()</code>.",
        "Kolla först om meddelandet kom fram: <code>svar = SANT</code>. Om inte – har du försökt färre än 5 gånger? <code>försök &lt; 5</code>",
        "En pil som pekar <b>tillbaka uppåt</b> till en tidigare ruta är en loop. Så visar ett flödesschema iteration.",
      ],
      tester: mkHotline(),
      klart: "En pil tillbaka uppåt gör flödesschemat till en <b>loop</b>. Räknaren <code>försök</code> garanterar att loopen tar slut – algoritmen är <b>ändlig</b> även om linjen aldrig fungerar. Två villkor styr: ett som avbryter när vi lyckats och ett som avbryter när vi har försökt nog.",
    },

    /* ---------------------------------------------------------------- 5 */
    {
      id: "s5",
      titel: "Frekvensjakten",
      typ: "kod",
      begrepp: "Binärsökning",
      ar: 1983,
      mimer: "STYRFREKVENS KRYPTERAD. INTRÅNGSFÖRSÖK LOGGAS.",
      brev: "MIMER styr robotsilorna på en hemlig frekvens – ett heltal mellan 1 och 1000. Hittar vi den kan vi skicka stoppkoden. Men MIMER upptäcker oss efter <b>10 gissningar</b>. Att prova 1, 2, 3 … kommer inte att räcka.",
      historia: "I november 1983 övade NATO ett kärnvapenkrig, Able Archer 83, med nya krypterade radiorutiner. Den sovjetiska ledningen var rädd att övningen var täckmantel för ett verkligt anfall och höjde beredskapen. Många historiker räknar det som ett av kalla krigets farligaste ögonblick – och ingen på västsidan förstod det förrän långt efteråt.",
      uppgift: [
        "<code>GISSA(tal)</code> svarar <code>\"HÖGRE\"</code> om frekvensen är högre än talet, <code>\"LÄGRE\"</code> om den är lägre och <code>\"RÄTT\"</code> om du hittat den.",
        "Frekvensen är ett heltal från 1 till 1000. Du får anropa GISSA högst <b>10 gånger</b>.",
        "Skriv ut frekvensen när du hittat den.",
      ],
      indata: [["GISSA(tal)", "svarar \"HÖGRE\", \"LÄGRE\" eller \"RÄTT\""]],
      utdata: "En rad: frekvensen, t.ex. 737.",
      start:
`// GISSA(tal) svarar "HÖGRE", "LÄGRE" eller "RÄTT".
// Frekvensen är ett heltal 1–1000. Högst 10 gissningar!
// Skriv ut frekvensen när du hittat den.

låg ← 1
hög ← 1000
`,
      losning:
`låg ← 1
hög ← 1000
svar ← ""
SÅ LÄNGE svar ≠ "RÄTT"
  mitt ← (låg + hög) DIV 2
  svar ← GISSA(mitt)
  OM svar = "HÖGRE"
    låg ← mitt + 1
  ANNARS OM svar = "LÄGRE"
    hög ← mitt - 1
SKRIV UT mitt
`,
      tips: [
        "Att gissa 1, 2, 3 … kan kräva 1000 gissningar. Du har 10. Varje gissning måste alltså <b>halvera</b> antalet möjliga frekvenser.",
        "Gissa alltid i mitten av det som är kvar: <code>mitt ← (låg + hög) DIV 2</code>. <code>DIV</code> är heltalsdivision (7 DIV 2 = 3).",
        "Svarar GISSA <code>\"HÖGRE\"</code> flyttar du upp den nedre gränsen: <code>låg ← mitt + 1</code>. Svarar den <code>\"LÄGRE\"</code>: <code>hög ← mitt - 1</code>. Upprepa <code>SÅ LÄNGE svar ≠ \"RÄTT\"</code> – och ge <code>svar</code> ett startvärde före loopen.",
      ],
      tester: [737, 1, 1000, 500, 42, 999, 2, 618].map(mkFrekvens),
      klart: "Det här är <b>binärsökning</b>. Linjär sökning behöver upp till 1000 gissningar – den växer som <b>O(n)</b>. Binärsökning halverar varje gång och behöver högst 10 – den växer som <b>O(log n)</b>. Med en miljon frekvenser skulle du fortfarande klara dig på 20 gissningar.",
    },

    /* ---------------------------------------------------------------- 6 */
    {
      id: "s6",
      titel: "Spelet som inte går att vinna",
      typ: "flode",
      begrepp: "Allt på en gång",
      ar: 1983,
      mimer: "STRATEGI FÖR SEGER BERÄKNAS. VÄNTA.",
      brev: "MIMER förstår bara det den själv har räknat ut. Låt den spela alla sina krigsscenarier mot sig själv, ett i taget. Om <b>inget</b> scenario slutar med SEGER måste MIMER avbryta anfallet. Det här är sista chansen.",
      historia: "Under kalla kriget byggde båda sidor så många kärnvapen att den som anföll först ändå skulle förintas av motanfallet. Läget kallades MAD – <i>Mutual Assured Destruction</i>, ömsesidigt garanterad förstörelse. Samma år som Petrovs larm och Able Archer, 1983, gick filmen <i>WarGames</i> upp på biograferna: en dator som håller på att starta ett kärnvapenkrig eftersom den inte förstår skillnaden mellan spel och verklighet.",
      uppgift: [
        "Simulera scenario <b>1, 2, 3 … upp till <code>antal</code></b> i tur och ordning med <code>SIMULERA(n)</code>.",
        "Om något scenario svarar <code>\"SEGER\"</code>: skriv ut <code>\"SIMULERA IGEN\"</code> (du får sluta direkt).",
        "Om <b>alla</b> scenarier har simulerats utan seger: skriv ut <code>\"AVBRYT ANFALLET\"</code>.",
      ],
      indata: [["antal", "hur många scenarier MIMER har"], ["SIMULERA(n)", "spelar scenario n och svarar \"SEGER\" eller \"INGEN VINNARE\""]],
      utdata: "En rad: AVBRYT ANFALLET eller SIMULERA IGEN.",
      graf: {
        nodes: [
          N(1, "start", 420, 50, "", { next: 2 }),
          N(2, "process", 420, 130, "n ← 1"),
          N(3, "output", 170, 560, '"AVBRYT ANFALLET"', { next: 5 }),
          N(4, "output", 670, 560, '"SIMULERA IGEN"', { next: 5 }),
          N(5, "end", 420, 650),
        ],
      },
      losning: {
        nodes: [
          N(1, "start", 420, 50, "", { next: 2 }),
          N(2, "process", 420, 130, "n ← 1", { next: 6 }),
          N(6, "decision", 420, 230, "n ≤ antal", { ja: 7, nej: 3 }),
          N(7, "process", 420, 340, "resultat ← SIMULERA(n)", { next: 8 }),
          N(8, "decision", 420, 440, 'resultat = "SEGER"', { ja: 4, nej: 9 }),
          N(9, "process", 680, 440, "n ← n + 1", { next: 6 }),
          N(3, "output", 170, 560, '"AVBRYT ANFALLET"', { next: 5 }),
          N(4, "output", 670, 560, '"SIMULERA IGEN"', { next: 5 }),
          N(5, "end", 420, 650),
        ],
      },
      tips: [
        "Samma mönster som heta linjen: en räknare (<code>n</code>), ett villkor som avgör om loopen ska fortsätta, och en pil tillbaka.",
        "Första beslutet: finns det fler scenarier kvar? <code>n ≤ antal</code>. Nej-pilen leder till AVBRYT ANFALLET – då har inget scenario gett seger.",
        "I loopen: <code>resultat ← SIMULERA(n)</code>, sedan ett beslut <code>resultat = \"SEGER\"</code>. Om inte: <code>n ← n + 1</code> och pilen tillbaka till första beslutet.",
      ],
      tester: [
        mkSim("Tre scenarier", 3, 0),
        mkSim("Tio scenarier", 10, 0),
        mkSim("Ett enda scenario", 1, 0),
        mkSim("Seger i sista scenariot", 4, 4),
        mkSim("Seger i första scenariot", 5, 1),
        mkSim("Seger i mitten", 6, 3),
      ],
      klart: "Här använde du allt: <b>sekvens</b>, <b>selektion</b> och <b>iteration</b> – i ett flödesschema. Och tanken bakom slutet är verklig: när varje scenario slutar med att ingen vinner, är det enda vettiga draget att inte spela alls.",
    },
  ];

  /* ---------- Testfabriker ---------- */

  function mkHotline() {
    const fall = [["Fram på första försöket", 1], ["Fram på tredje försöket", 3], ["Fram på femte och sista försöket", 5], ["Linjen är helt död", 0], ["Fram på andra försöket", 2]];
    return fall.map(([namn, k]) => ({
      namn,
      visa: k ? "meddelandet kommer fram på försök " + k : "meddelandet kommer aldrig fram",
      vantat: [k ? "KONTAKT" : "INGEN KONTAKT"],
      fn() {
        let calls = 0;
        return {
          builtins: {
            SKICKA: { n: 0, f: () => {
              calls++;
              if (calls > 6) throw "Linjen överbelastades – SKICKA() anropades fler än 5 gånger. MIMER tolkar det som en attack!";
              return k > 0 && calls >= k;
            } },
          },
          check() {
            if (k && calls > k) return "Meddelandet kom fram på försök " + k + ", men du skickade " + calls + " gånger. Sluta skicka när svaret är SANT.";
            if (calls > 5) return "Du skickade " + calls + " gånger – max är 5!";
            if (!k && calls < 5) return "Du gav upp efter " + calls + " försök. Försök 5 gånger innan du ger upp.";
            return null;
          },
          info: () => "SKICKA() anropades " + calls + " " + (calls === 1 ? "gång" : "gånger"),
        };
      },
    }));
  }

  function mkFrekvens(f) {
    return {
      namn: "Frekvens " + f,
      visa: "hemlig frekvens: " + f,
      vantat: [String(f)],
      fn() {
        let calls = 0;
        return {
          builtins: {
            GISSA: { n: 1, f: (x) => {
              if (typeof x !== "number") throw "GISSA() behöver ett tal.";
              calls++;
              if (calls > 10) throw "MIMER upptäckte intrånget! Du gissade mer än 10 gånger.";
              return x === f ? "RÄTT" : f > x ? "HÖGRE" : "LÄGRE";
            } },
          },
          check: () => null,
          info: () => calls + " " + (calls === 1 ? "gissning" : "gissningar"),
        };
      },
    };
  }

  function mkSim(namn, antal, seger) {
    return {
      namn,
      indata: { antal },
      visa: "antal = " + antal + (seger ? ", scenario " + seger + " ger SEGER" : ", inget scenario ger seger"),
      vantat: [seger ? "SIMULERA IGEN" : "AVBRYT ANFALLET"],
      fn() {
        const done = new Set();
        let calls = 0;
        return {
          builtins: {
            SIMULERA: { n: 1, f: (n) => {
              if (typeof n !== "number" || !Number.isInteger(n)) throw "SIMULERA() behöver ett heltal.";
              if (n < 1 || n > antal) throw "Scenario " + n + " finns inte. Det finns bara scenario 1–" + antal + ".";
              if (++calls > antal * 3) throw "SIMULERA() anropades " + calls + " gånger – loopen verkar inte ta slut.";
              done.add(n);
              return n === seger ? "SEGER" : "INGEN VINNARE";
            } },
          },
          check() {
            if (!seger) for (let i = 1; i <= antal; i++) if (!done.has(i)) return "Scenario " + i + " simulerades aldrig. Slutar loopen för tidigt?";
            return null;
          },
          info: () => "simulerade " + done.size + " av " + antal + " scenarier",
        };
      },
    };
  }
})();

/*
 * Kör ett test mot elevens program (text eller flödesschema).
 * Svarar { ok, out, error, msg, trace, info }.
 */
(function () {
  "use strict";
  const norm = (s) => window.Tolk.fold(String(s)).replace(/\s+/g, " ").trim();

  window.provaTest = function (stage, test, program) {
    const env = test.fn ? test.fn() : { builtins: {}, check: () => null, info: () => "" };
    const vars = JSON.parse(JSON.stringify(test.indata || {}));
    const res = stage.typ === "kod" ? window.Tolk.runCode(program, vars, env.builtins) : window.Tolk.runFlow(program, vars, env.builtins);
    const r = { out: res.out, error: res.error, trace: res.trace, compileError: !!res.compileError, info: env.info ? env.info() : "" };
    if (res.error) { r.ok = false; r.msg = res.error.msg; return r; }
    const want = test.vantat;
    if (!res.out.length) { r.ok = false; r.msg = "Algoritmen skrev inte ut något. Saknas SKRIV UT?"; return r; }
    if (res.out.length > want.length) {
      r.ok = false;
      r.msg = "Algoritmen skrev ut " + res.out.length + " rader, men bara " + want.length + " behövs." + (stage.typ === "kod" ? " Ligger SKRIV UT inuti en loop?" : " Går flödet genom flera utskrifter?");
      return r;
    }
    const same = want.every((w, i) => res.out[i] !== undefined && norm(res.out[i]) === norm(w));
    if (!same) { r.ok = false; r.msg = "Fel svar."; return r; }
    const extra = env.check ? env.check() : null;
    if (extra) { r.ok = false; r.msg = extra; return r; }
    r.ok = true;
    return r;
  };
})();
