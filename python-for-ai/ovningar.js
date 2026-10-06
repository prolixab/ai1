/*
 * Uppgiftsbank för "Python för AI – kom igång".
 * Delas av övningssidan (index.html) och lärarvyn (larare.html).
 *
 * Ändra inte id på en befintlig uppgift – elevernas sparade framsteg
 * är kopplade till id. Nya uppgifter kan läggas till var som helst.
 *
 * Typer:
 *   mc      flerval        options: [...], answer: index
 *   output  vad skrivs ut  code, answer: "rad1\nrad2", near: {felsvar: "ledtråd"}
 *   fill    fyll i luckor  code med {{0}}, {{1}} …, blanks: [[godkända svar], …]
 *   match   para ihop      pairs: [[vänster, höger], …]
 *   order   sortera rader  lines: rätt ordning, deps: [[i, j], …] (rad i före rad j)
 */
window.PYAI = {
  quiz: "python-for-ai",
  // Vercel-funktionen som sparar elevernas framsteg (api/progress.js i repot prolixab/courses).
  // Tom sträng = ingen server; då fungerar bara framstegskoderna.
  api: "https://VERCEL-SAJTEN.vercel.app/api/progress/",
  title: "Python för AI",
  parts: [
    { id: "p1", title: "Varför Python?" },
    { id: "p2", title: "Grunderna" },
    { id: "p3", title: "Bibliotek och data" },
    { id: "p4", title: "Din första AI-modell" },
    { id: "p5", title: "Felsökning och tips" }
  ],
  exercises: [
    /* ---------- 01 Varför Python? ---------- */
    {
      id: "p1-skal", part: "p1", type: "mc", title: "Varför Python?",
      q: "Vilket av följande är ett av skälen till att Python har blivit AI-världens gemensamma språk?",
      options: [
        "Det finns tusentals gratis bibliotek för data, grafer och maskininlärning",
        "Python är det enda språket som kan köras på en dator med grafikkort",
        "Python-kod behöver aldrig testas",
        "Python förstår vanlig svenska utan särskild syntax"
      ],
      answer: 0,
      explain: "Tre skäl: koden är <b>lättläst</b>, det finns <b>färdiga verktyg</b> (bibliotek) och en <b>stor gemenskap</b>."
    },
    {
      id: "p1-gemenskap", part: "p1", type: "mc", title: "Stor gemenskap",
      q: "Du har fastnat på ett problem. Vad är fördelen med att Python har en så stor gemenskap?",
      options: [
        "Någon annan har nästan alltid haft samma problem – och svaret finns ofta att hitta",
        "Gemenskapen rättar din kod automatiskt",
        "Du får gratis support via telefon dygnet runt",
        "Felet försvinner om du startar om datorn"
      ],
      answer: 0,
      explain: "Miljontals använder Python. Den som har fastnat hittar nästan alltid någon som löst samma sak."
    },
    {
      id: "p1-bibliotek", part: "p1", type: "match", title: "AI-verktygslådan",
      q: "Para ihop varje bibliotek med vad det används till.",
      pairs: [
        ["numpy", "Snabba beräkningar med stora mängder tal"],
        ["pandas", "Läsa och bearbeta tabeller, t.ex. CSV-filer"],
        ["matplotlib", "Rita diagram och visualisera data"],
        ["scikit-learn", "Klassisk maskininlärning – bra att börja med"],
        ["PyTorch / TensorFlow", "Neurala nätverk och djupinlärning"],
        ["transformers", "Färdiga språk- och bildmodeller från Hugging Face"]
      ],
      code: true,
      explain: "Du behöver inte kunna alla nu – i den här lektionen provar vi <code>pandas</code> och <code>scikit-learn</code>."
    },
    {
      id: "p1-idag", part: "p1", type: "mc", title: "Dagens bibliotek",
      q: "Vilka två bibliotek provar vi i den här lektionen?",
      options: ["pandas och scikit-learn", "numpy och matplotlib", "PyTorch och transformers", "math och random"],
      answer: 0,
      explain: "<code>pandas</code> för att läsa in data och <code>scikit-learn</code> för att träna en modell."
    },
    {
      id: "p1-path", part: "p1", type: "mc", title: "Installera Python",
      q: "Du installerar Python från python.org på en Windows-dator. Vilken ruta är viktig att kryssa i?",
      options: ["Add Python to PATH", "Install Java", "Use dark mode", "Start Python when Windows starts"],
      answer: 0,
      explain: "Utan <b>Add Python to PATH</b> hittar terminalen inte Python. Använder du Thonny ingår Python redan."
    },
    {
      id: "p1-kor", part: "p1", type: "mc", title: "Köra ett program",
      q: "Du har skrivit filen <code>test.py</code> i Thonny. Hur kör du programmet?",
      options: ["Trycker på F5", "Dubbelklickar på varje rad", "Sparar filen som test.txt", "Skriver run i en kommentar"],
      answer: 0,
      explain: "F5 i Thonny. I VS Code klickar du på ▶-knappen."
    },

    /* ---------- 02 Grunderna ---------- */
    {
      id: "p2-print", part: "p2", type: "output", title: "print och kommentarer",
      q: "Vad skriver programmet ut?",
      code: '# print("Hej!")\nprint("Hej världen!")\nprint("Jag lär mig Python.")',
      answer: "Hej världen!\nJag lär mig Python.",
      hint: "Rader som börjar med <code>#</code> är kommentarer – Python hoppar över dem.",
      explain: "Första raden är en kommentar och körs inte. Varje <code>print()</code> skriver en egen rad."
    },
    {
      id: "p2-namn", part: "p2", type: "mc", title: "Variabelnamn",
      q: "Vilket variabelnamn följer reglerna från lektionen?",
      options: ["<code>min_alder</code>", "<code>min alder</code>", "<code>2alder</code>", "<code>ålder</code>"],
      answer: 0,
      explain: "Inga mellanslag (använd <code>_</code>), får inte börja med en siffra, och undvik å, ä och ö."
    },
    {
      id: "p2-tilldela", part: "p2", type: "output", title: "Ändra en variabel",
      q: "Vad skriver programmet ut?",
      code: "alder = 17\nalder = alder + 1\nprint(alder)",
      answer: "18",
      hint: "<code>=</code> betyder <i>lägg in i lådan</i>. Räkna ut högersidan först.",
      explain: "<code>=</code> betyder tilldela, inte \"är lika med\". Högersidan <code>17 + 1</code> räknas ut och läggs i <code>alder</code>."
    },
    {
      id: "p2-flera", part: "p2", type: "output", title: "print med flera delar",
      q: "Vad skriver programmet ut?",
      code: 'namn = "Sara"\nalder = 17\nprint(namn, "är", alder, "år")',
      answer: "Sara är 17 år",
      hint: "<code>print()</code> skriver ut värdet i variablerna – inte deras namn – och sätter mellanslag mellan delarna.",
      explain: "Kommatecknen i <code>print()</code> blir mellanslag i utskriften."
    },
    {
      id: "p2-typer", part: "p2", type: "match", title: "Fyra datatyper",
      q: "Vilken datatyp har varje värde?",
      pairs: [["42", "int"], ["3.14", "float"], ['"hej"', "str"], ["True", "bool"]],
      code: true, codeRight: true,
      explain: "<code>int</code> heltal, <code>float</code> decimaltal, <code>str</code> text och <code>bool</code> sant/falskt."
    },
    {
      id: "p2-komma", part: "p2", type: "mc", title: "Decimaltal",
      q: "Kim skriver <code>pi = 3,14</code>. Vad är problemet?",
      options: [
        "Decimaltal skrivs med punkt: <code>3.14</code>",
        "<code>pi</code> får inte användas som variabelnamn",
        "Det måste stå <code>int</code> framför",
        "Det är inget problem"
      ],
      answer: 0,
      explain: "Vanligt nybörjarfel! Med komma blir det två separata tal, inte ett decimaltal. I AI är nästan all data <code>float</code>."
    },
    {
      id: "p2-type", part: "p2", type: "mc", title: "Vilken typ?",
      q: "Du är osäker på vilken typ variabeln <code>x</code> har. Hur tar du reda på det?",
      options: ["<code>print(type(x))</code>", "<code>print(x.typ)</code>", "<code>type x</code>", '<code>print("type", x)</code>'],
      answer: 0,
      explain: "<code>type(x)</code> ger typen och <code>print()</code> visar den, t.ex. <code>&lt;class 'float'&gt;</code>."
    },
    {
      id: "p2-input-typ", part: "p2", type: "mc", title: "Svaret från input()",
      q: "Vilken typ har svaret som <code>input()</code> ger tillbaka?",
      options: ["Alltid text (<code>str</code>)", "Alltid heltal (<code>int</code>)", "Det beror på vad användaren skriver", "<code>bool</code>"],
      answer: 0,
      explain: "Även om användaren skriver <code>16</code> blir det texten <code>\"16\"</code>. Vill du räkna måste du göra om det med <code>int()</code>."
    },
    {
      id: "p2-int", part: "p2", type: "fill", title: "Gör om text till tal",
      q: "Fyll i luckan så att programmet kan räkna med åldern.",
      code: 'alder = {{0}}(input("Ålder? "))\nprint(f"Om 10 år är du {alder + 10}")',
      blanks: [["int"]],
      hint: "Svaret från <code>input()</code> är text. Vilken funktion gör om text till ett heltal?",
      explain: "<code>int()</code> gör om texten till ett heltal. Utan den får du ett <code>TypeError</code> när du försöker räkna."
    },
    {
      id: "p2-fstring", part: "p2", type: "output", title: "f-strängar",
      q: "Vad skriver programmet ut?",
      code: 'namn = "Ali"\nprint(f"Hej {namn}!")',
      answer: "Hej Ali!",
      hint: "<code>f</code> före citattecknet gör att <code>{namn}</code> byts ut mot variabelns värde.",
      explain: "I en f-sträng ersätts allt inom <code>{ }</code> med värdet."
    },
    {
      id: "p2-index", part: "p2", type: "output", title: "Index i en lista",
      q: "Vad skriver programmet ut?",
      code: "poang = [72, 85, 90]\nprint(poang[1])",
      answer: "85",
      near: { "72": "Räkningen börjar på 0 – <code>poang[0]</code> är det första elementet." },
      hint: "Räkningen börjar på 0.",
      explain: "<code>poang[0]</code> är 72, <code>poang[1]</code> är 85 och <code>poang[2]</code> är 90."
    },
    {
      id: "p2-negindex", part: "p2", type: "output", title: "Negativt index",
      q: "Vad skriver programmet ut?",
      code: "poang = [72, 85, 90]\nprint(poang[-1])",
      answer: "90",
      hint: "Negativa index räknar bakifrån.",
      explain: "<code>[-1]</code> är alltid det sista elementet, <code>[-2]</code> det näst sista och så vidare."
    },
    {
      id: "p2-append", part: "p2", type: "output", title: "append, len och max",
      q: "Vad skriver programmet ut? (Två rader.)",
      code: "poang = [72, 85, 90]\npoang.append(64)    # lägg till\nprint(len(poang))\nprint(max(poang))",
      answer: "4\n90",
      near: { "3\n90": "<code>append()</code> lägger till ett element – hur många finns det sen?" },
      hint: "<code>append()</code> lägger till sist, <code>len()</code> räknar elementen och <code>max()</code> ger det största.",
      explain: "Efter <code>append(64)</code> är listan <code>[72, 85, 90, 64]</code>: fyra element, och det största är fortfarande 90."
    },
    {
      id: "p2-if", part: "p2", type: "output", title: "if, elif, else",
      q: "Vad skriver programmet ut?",
      code: 'poang = 55\nif poang >= 90:\n    print("Toppen!")\nelif poang >= 60:\n    print("Godkänt")\nelse:\n    print("Försök igen")',
      answer: "Försök igen",
      hint: "Gå igenom villkoren uppifrån. Är 55 större än eller lika med 90? Med 60?",
      explain: "Inget av villkoren stämmer för 55, så det blir <code>else</code>-grenen."
    },
    {
      id: "p2-jamfor", part: "p2", type: "mc", title: "= eller ==",
      q: "Vilken rad kontrollerar om <code>x</code> är lika med 5?",
      options: ["<code>if x == 5:</code>", "<code>if x = 5:</code>", "<code>if x == 5</code>", "<code>if x =&gt; 5:</code>"],
      answer: 0,
      explain: "<code>==</code> jämför och <code>=</code> tilldelar. Villkoret måste också sluta med kolon."
    },
    {
      id: "p2-kolon", part: "p2", type: "mc", title: "Kolon och indrag",
      q: "Vad måste stå sist på raden <code>if poang &gt;= 60</code>?",
      options: ["Ett kolon <code>:</code>", "Ett semikolon <code>;</code>", "Ordet <code>then</code>", "Ingenting"],
      answer: 0,
      explain: "Varje villkor slutar med kolon, och koden som hör till får indrag (fyra mellanslag eller Tab)."
    },
    {
      id: "p2-ordna-if", part: "p2", type: "order", title: "Bygg en betygskoll",
      q: "Klicka på raderna i rätt ordning så att programmet skriver <code>Godkänt</code>.",
      lines: [
        "poang = 72",
        "if poang >= 90:",
        '    print("Toppen!")',
        "elif poang >= 60:",
        '    print("Godkänt")',
        "else:",
        '    print("Försök igen")'
      ],
      explain: "Variabeln måste finnas innan den jämförs. Sen kommer <code>if</code>, <code>elif</code> och <code>else</code> i den ordningen – med indrag på det som hör till."
    },
    {
      id: "p2-range", part: "p2", type: "output", title: "for och range",
      q: "Vad skriver programmet ut? (Skriv en rad per utskrift.)",
      code: "for i in range(3):\n    print(i)",
      answer: "0\n1\n2",
      near: { "1\n2\n3": "Nästan! <code>range(3)</code> börjar på 0.", "0\n1\n2\n3": "<code>range(3)</code> ger tre tal – det sista är 2." },
      hint: "<code>range(3)</code> ger talen 0, 1 och 2.",
      explain: "<code>range(3)</code> ger 0, 1, 2 – tre tal, men det börjar på 0."
    },
    {
      id: "p2-epok", part: "p2", type: "mc", title: "Epok",
      q: "En AI-modell tränas genom att loopa över datan om och om igen. Vad kallas ett sådant varv?",
      options: ["En epok", "En etikett", "En dictionary", "En parameter"],
      answer: 0,
      explain: "Ett varv genom all träningsdata kallas en <b>epok</b>."
    },
    {
      id: "p2-for", part: "p2", type: "output", title: "Loopa över en lista",
      q: "Vad skriver programmet ut?",
      code: 'elever = ["Ali", "Sara"]\nfor elev in elever:\n    print(f"Hej {elev}!")',
      answer: "Hej Ali!\nHej Sara!",
      hint: "<code>for</code> tar ett element i taget och kör den indragna raden en gång per element.",
      explain: "Första varvet är <code>elev</code> = \"Ali\", andra varvet \"Sara\"."
    },
    {
      id: "p2-def", part: "p2", type: "fill", title: "Skriv en funktion",
      q: "Fyll i de två nyckelorden så att funktionen räknar ut medelvärdet.",
      code: "{{0}} medel(lista):\n    {{1}} sum(lista) / len(lista)\n\nprint(medel([4, 6, 8]))",
      blanks: [["def"], ["return"]],
      hint: "Ett ord skapar en funktion, ett annat skickar tillbaka svaret.",
      explain: "<code>def</code> skapar funktionen och <code>return</code> skickar tillbaka svaret till den som anropade."
    },
    {
      id: "p2-medel", part: "p2", type: "output", title: "Anropa en funktion",
      q: "Vad skriver programmet ut?",
      code: "def medel(lista):\n    return sum(lista) / len(lista)\n\nprint(medel([60, 95, 70, 83]))",
      answer: "77.0",
      near: { "77": "Nästan! Division med <code>/</code> ger alltid ett decimaltal (<code>float</code>)." },
      hint: "Summan är 308 och det finns 4 tal. Tänk på att <code>/</code> ger ett decimaltal.",
      explain: "308 / 4 = 77, men eftersom <code>/</code> alltid ger <code>float</code> skrivs det ut som <code>77.0</code>."
    },
    {
      id: "p2-dict", part: "p2", type: "output", title: "Slå upp i en ordbok",
      q: "Vad skriver programmet ut?",
      code: 'elev = {"namn": "Sara", "poang": 85}\nprint(elev["poang"])',
      answer: "85",
      hint: "Du slår upp värdet som hör till nyckeln <code>\"poang\"</code>.",
      explain: "En dictionary kopplar nyckel till värde. Nyckeln <code>\"poang\"</code> har värdet 85."
    },
    {
      id: "p2-dict-ny", part: "p2", type: "fill", title: "Lägg till i en ordbok",
      q: "Fyll i luckan så att utskriften blir <code>{'namn': 'Sara', 'poang': 85, 'klass': 'TE24'}</code>",
      code: 'elev = {"namn": "Sara", "poang": 85}\nelev[{{0}}] = "TE24"\nprint(elev)',
      blanks: [['"klass"', "'klass'"]],
      hint: "Nyckeln är text – glöm inte citattecknen.",
      explain: "<code>elev[\"klass\"] = \"TE24\"</code> lägger till ett nytt par nyckel: värde."
    },
    {
      id: "p2-dict-varfor", part: "p2", type: "mc", title: "Dictionary",
      q: "Hur hämtar du ett värde ur en dictionary?",
      options: [
        "Med nyckeln, t.ex. <code>elev[\"namn\"]</code>",
        "Med positionen, t.ex. <code>elev[0]</code>",
        "Med <code>elev.append(\"namn\")</code>",
        "Det går inte – man kan bara skriva ut hela"
      ],
      answer: 0,
      explain: "Precis som i en riktig ordbok slår du upp ordet (nyckeln) och får förklaringen (värdet). Svar från AI-tjänster (JSON) ser ut så här."
    },

    /* ---------- 03 Bibliotek och data ---------- */
    {
      id: "p3-import", part: "p3", type: "fill", title: "import",
      q: "Fyll i luckan så att programmet kan använda matematikbiblioteket.",
      code: "{{0}} math\nprint(math.sqrt(16))",
      blanks: [["import"]],
      explain: "Med <code>import</code> hämtar du in ett bibliotek – färdig kod som någon annan har skrivit."
    },
    {
      id: "p3-sqrt", part: "p3", type: "output", title: "math.sqrt",
      q: "Vad skriver programmet ut?",
      code: "import math\nprint(math.sqrt(16))",
      answer: "4.0",
      near: { "4": "Nästan! <code>math.sqrt()</code> ger alltid ett decimaltal." },
      hint: "Roten ur 16 – och svaret är en <code>float</code>.",
      explain: "<code>math.sqrt(16)</code> ger <code>4.0</code> – ett decimaltal."
    },
    {
      id: "p3-pip", part: "p3", type: "mc", title: "pip install",
      q: "Hur installerar du pandas och scikit-learn från terminalen i VS Code?",
      options: [
        "<code>pip install pandas scikit-learn</code>",
        "<code>import pandas scikit-learn</code>",
        "<code>python install pandas</code>",
        "<code>download pandas scikit-learn</code>"
      ],
      answer: 0,
      explain: "I Thonny: <i>Verktyg → Hantera paket</i>. Fungerar inte <code>pip</code> i Windows kan du prova <code>py -m pip install …</code>."
    },
    {
      id: "p3-pip-import", part: "p3", type: "mc", title: "pip eller import?",
      q: "Vad är skillnaden mellan <code>pip install</code> och <code>import</code>?",
      options: [
        "pip installerar biblioteket på datorn en gång – import hämtar in det i ditt program",
        "De gör exakt samma sak",
        "import installerar biblioteket – pip kör programmet",
        "pip används bara för bibliotek som ingår i Python"
      ],
      answer: 0,
      explain: "Vissa bibliotek (som <code>math</code>) ingår i Python. Andra måste installeras med <code>pip</code> först, och sedan importeras i varje program."
    },
    {
      id: "p3-read-csv", part: "p3", type: "fill", title: "Läs in en CSV-fil",
      q: "Fyll i luckorna så att filen <code>elever.csv</code> läses in.",
      code: 'import pandas {{0}} pd\ndf = pd.{{1}}("elever.csv")\nprint(df.head())',
      blanks: [["as"], ["read_csv"]],
      hint: "Det första ordet ger biblioteket ett kortare namn. Funktionen heter <i>läs csv</i> på engelska.",
      explain: "<code>import pandas as pd</code> ger kortnamnet <code>pd</code>, och <code>pd.read_csv()</code> läser in filen."
    },
    {
      id: "p3-dataframe", part: "p3", type: "mc", title: "DataFrame",
      q: "Vad kallas tabellen som pandas skapar när du läser in en fil?",
      options: ["DataFrame", "Lista", "Dictionary", "CSV-objekt"],
      answer: 0,
      explain: "pandas gör om en CSV- eller Excel-fil till en tabell som kallas <b>DataFrame</b>."
    },
    {
      id: "p3-head", part: "p3", type: "mc", title: "df.head()",
      q: "Vad visar <code>df.head()</code>?",
      options: ["De första fem raderna i tabellen", "Bara rubrikraden", "Hela tabellen", "Den sista raden"],
      answer: 0,
      explain: "<code>head()</code> visar de första fem raderna – ett snabbt sätt att titta på datan. All AI börjar med att titta på datan."
    },
    {
      id: "p3-mean", part: "p3", type: "mc", title: "Medelvärde av en kolumn",
      q: "Tabellen har kolumnerna <code>namn</code>, <code>timmar</code> och <code>poang</code>. Vad räknar <code>df[\"poang\"].mean()</code> ut?",
      options: ["Medelvärdet av kolumnen poang", "Antalet rader i tabellen", "Det högsta värdet i poang", "Summan av alla kolumner"],
      answer: 0,
      explain: "<code>df[\"poang\"]</code> väljer kolumnen och <code>.mean()</code> ger medelvärdet."
    },
    {
      id: "p3-mapp", part: "p3", type: "mc", title: "Var ligger filen?",
      q: "Var ska <code>elever.csv</code> ligga för att <code>pd.read_csv(\"elever.csv\")</code> ska hitta den?",
      options: ["I samma mapp som din kod", "På skrivbordet", "I papperskorgen", "Var som helst – Python söker igenom hela datorn"],
      answer: 0,
      explain: "Med bara filnamnet letar Python i samma mapp som programmet."
    },

    /* ---------- 04 Din första AI-modell ---------- */
    {
      id: "p4-ml", part: "p4", type: "mc", title: "Vad är maskininlärning?",
      q: "Vad är den stora skillnaden mellan vanlig programmering och maskininlärning?",
      options: [
        "I maskininlärning ger du datorn data och svar – och den hittar reglerna själv",
        "I maskininlärning skriver du fler regler än i vanlig programmering",
        "Maskininlärning behöver ingen data",
        "Det finns ingen skillnad"
      ],
      answer: 0,
      explain: "Vanlig programmering: regler + data → svar. Maskininlärning: data + svar → regler, och reglerna kallas en <b>modell</b>."
    },
    {
      id: "p4-spam", part: "p4", type: "mc", title: "Spamfilter",
      q: "Vilket sätt att bygga ett spamfilter är maskininlärning?",
      options: [
        "Visa datorn tusentals mejl märkta spam/inte spam så att den hittar mönstren",
        "Skriva regeln: om mejlet innehåller VINST är det spam",
        "Läsa alla mejl själv och sortera dem för hand",
        "Blockera alla mejl med bilagor"
      ],
      answer: 0,
      explain: "Att skriva reglerna själv är vanlig programmering. I maskininlärning lär sig datorn av märkta exempel."
    },
    {
      id: "p4-begrepp", part: "p4", type: "match", title: "X, y, fit och predict",
      q: "Para ihop varje del med vad den betyder.",
      pairs: [
        ["X", "Indata – egenskaperna vi mäter"],
        ["y", "Facit – rätt svar för varje exempel"],
        ["fit()", "Träning – modellen letar mönster mellan X och y"],
        ["predict()", "Förutsägelse – gissar svaret för nya exempel"]
      ],
      code: true,
      explain: "Samma fyra steg används i nästan all maskininlärning, från beslutsträd till stora neurala nätverk."
    },
    {
      id: "p4-rad", part: "p4", type: "mc", title: "Ett exempel i X",
      q: "I modellen är <code>X = [[1, 5], [2, 6], [3, 4], …]</code> med kommentaren <code># [timmar plugg, timmar sömn]</code>. Vad betyder <code>[1, 5]</code>?",
      options: [
        "En elev som pluggat 1 timme och sovit 5 timmar",
        "En elev som fått betyget 1 av 5",
        "Elev nummer 1 till 5",
        "Att modellen ska tränas 1 till 5 gånger"
      ],
      answer: 0,
      explain: "Varje inre lista är ett exempel, och varje tal i den är en egenskap."
    },
    {
      id: "p4-antal", part: "p4", type: "mc", title: "Lika många svar",
      q: "<code>X</code> innehåller 6 exempel. Hur många etiketter måste <code>y</code> innehålla?",
      options: ["6", "2", "1", "12"],
      answer: 0,
      explain: "Varje exempel i <code>X</code> behöver sitt rätta svar i <code>y</code> – lika många."
    },
    {
      id: "p4-fit", part: "p4", type: "fill", title: "Träna och gissa",
      q: "Fyll i metoderna som tränar modellen och gör en förutsägelse.",
      code: "modell = DecisionTreeClassifier()\nmodell.{{0}}(X, y)              # träna\nprint(modell.{{1}}([[6, 7]]))   # gissa",
      blanks: [["fit"], ["predict"]],
      hint: "Engelska: <i>anpassa</i> och <i>förutsäga</i>.",
      explain: "<code>fit()</code> tränar på exemplen och <code>predict()</code> gissar för nya."
    },
    {
      id: "p4-ordna", part: "p4", type: "order", title: "Bygg din första modell",
      q: "Klicka på raderna i en ordning som fungerar.",
      lines: [
        "from sklearn.tree import DecisionTreeClassifier",
        "X = [[1, 5], [2, 6], [7, 8], [9, 8]]",
        'y = ["U", "U", "G", "G"]',
        "modell = DecisionTreeClassifier()",
        "modell.fit(X, y)",
        "print(modell.predict([[6, 7]]))"
      ],
      deps: [[0, 3], [1, 4], [2, 4], [3, 4], [4, 5]],
      explain: "Importera först, skapa sedan modellen och datan (i valfri ordning), träna med <code>fit()</code> och gissa sist med <code>predict()</code>."
    },
    {
      id: "p4-monster", part: "p4", type: "mc", title: "Varför kan den gissa?",
      q: "Modellen svarar <code>['G']</code> för <code>[[6, 7]]</code>, fast den aldrig har sett just den eleven. Varför?",
      options: [
        "Den har lärt sig ett mönster från exemplen",
        "Den slumpar fram ett svar",
        "Den har sparat svaret i förväg",
        "Den söker på internet"
      ],
      answer: 0,
      explain: "Elever som pluggat och sovit mycket var godkända i exemplen – modellen har lärt sig det mönstret."
    },
    {
      id: "p4-trad", part: "p4", type: "mc", title: "Beslutsträd",
      q: "Vad gör ett beslutsträd (<code>DecisionTreeClassifier</code>)?",
      options: [
        "Lär sig enkla ja/nej-frågor ur exemplen",
        "Ritar ett diagram över datan",
        "Sorterar listor i bokstavsordning",
        "Laddar ner färdiga språkmodeller"
      ],
      answer: 0,
      explain: "Trädet ställer frågor som \"pluggade eleven mer än 5 timmar?\" och kommer fram till ett svar."
    },
    {
      id: "p4-data", part: "p4", type: "mc", title: "Mer och bättre data",
      q: "Vad gör oftast en modell bättre?",
      options: ["Mer och bättre data", "Kortare variabelnamn", "Färre exempel", "Att köra programmet flera gånger"],
      answer: 0,
      explain: "Sex exempel är för lite för en riktig AI. Ju mer och bättre data, desto bättre modell."
    },
    {
      id: "p4-partisk", part: "p4", type: "mc", title: "Dålig data",
      q: "All träningsdata kommer från elever som pluggar mycket. Vad är risken?",
      options: [
        "Modellen kan ge dåliga svar för elever som inte liknar exemplen",
        "Modellen blir perfekt för alla elever",
        "Programmet kraschar med SyntaxError",
        "Ingen risk – modellen hittar själv de saknade eleverna"
      ],
      answer: 0,
      explain: "Dålig eller ensidig (partisk) data ger dåliga svar. Exemplen behöver vara representativa."
    },

    /* ---------- 05 Felsökning och tips ---------- */
    {
      id: "p5-sista", part: "p5", type: "mc", title: "Läs felmeddelandet",
      q: "Var i ett felmeddelande ska du börja läsa?",
      options: ["Sista raden", "Första raden", "Mitten", "Ingenstans – starta om programmet"],
      answer: 0,
      explain: "På sista raden står vilken typ av fel det är. Raden ovanför visar på vilken rad i koden."
    },
    {
      id: "p5-fel", part: "p5", type: "match", title: "Vanliga fel",
      q: "Para ihop felet med den vanligaste orsaken.",
      pairs: [
        ["SyntaxError", "Glömt kolon, parentes eller citattecken"],
        ["IndentationError", "Fel indrag efter if, for eller def"],
        ["NameError", "Stavat fel på en variabel eller funktion"],
        ["TypeError", "Blandar text och tal, t.ex. \"5\" + 3"],
        ["ModuleNotFoundError", "Biblioteket är inte installerat"]
      ],
      code: true,
      explain: "Felmeddelanden är dina vänner – även proffs får dem hela dagarna."
    },
    {
      id: "p5-type", part: "p5", type: "mc", title: "Vilket fel? (1)",
      q: "Vilket fel ger den här koden?",
      code: 'print("5" + 3)',
      options: ["TypeError", "SyntaxError", "NameError", "IndentationError"],
      answer: 0,
      explain: "<code>\"5\"</code> är text och <code>3</code> är ett tal – de går inte att lägga ihop."
    },
    {
      id: "p5-syntax", part: "p5", type: "mc", title: "Vilket fel? (2)",
      q: "Vilket fel ger den här koden?",
      code: 'poang = 72\nif poang > 60\n    print("Godkänt")',
      options: ["SyntaxError", "TypeError", "NameError", "ModuleNotFoundError"],
      answer: 0,
      explain: "Kolonet saknas efter villkoret."
    },
    {
      id: "p5-name", part: "p5", type: "mc", title: "Vilket fel? (3)",
      q: "Vilket fel ger den här koden?",
      code: 'namn = "Ali"\nprint(nman)',
      options: ["NameError", "SyntaxError", "TypeError", "IndentationError"],
      answer: 0,
      explain: "<code>nman</code> är felstavat – Python känner bara till <code>namn</code>."
    },
    {
      id: "p5-indent", part: "p5", type: "mc", title: "Vilket fel? (4)",
      q: "Vilket fel ger den här koden?",
      code: "for i in range(3):\nprint(i)",
      options: ["IndentationError", "NameError", "TypeError", "ModuleNotFoundError"],
      answer: 0,
      explain: "Raden efter <code>for</code> måste ha indrag. I Python är indraget en del av språket."
    },
    {
      id: "p5-modul", part: "p5", type: "mc", title: "Saknat bibliotek",
      q: "Du får felet <code>ModuleNotFoundError: No module named 'pandas'</code>. Vad gör du?",
      options: ["Kör <code>pip install pandas</code>", "Byter namn på filen", "Lägger till ett kolon", "Tar bort <code>import</code>-raden"],
      answer: 0,
      explain: "Biblioteket finns inte installerat än – installera det med <code>pip</code> (eller via Thonnys pakethanterare)."
    },
    {
      id: "p5-print", part: "p5", type: "mc", title: "Felsök med print()",
      q: "Programmet ger fel svar men inget felmeddelande. Vad är ett bra första steg?",
      options: [
        "Skriv ut variablerna med <code>print()</code> för att se vad som händer",
        "Radera allt och börja om",
        "Lägg till fler kommentarer",
        "Vänta och kör igen"
      ],
      answer: 0,
      explain: "Med <code>print()</code> ser du vad som faktiskt finns i variablerna."
    },
    {
      id: "p5-steg", part: "p5", type: "mc", title: "Små steg",
      q: "Varför ska du köra koden ofta, efter bara några rader?",
      options: [
        "Då hittar du felen snabbt och vet ungefär var de sitter",
        "Datorn blir snabbare av det",
        "Annars sparas inte filen",
        "Python kräver det"
      ],
      answer: 0,
      explain: "Små steg, kör ofta: skriver du några rader i taget vet du att felet finns bland dem."
    },
    {
      id: "p5-ai", part: "p5", type: "mc", title: "AI som handledare",
      q: "Vilken fråga till en AI-assistent följer tipsen från lektionen bäst?",
      options: [
        "\"Varför får jag det här felet? Ge mig en ledtråd.\"",
        "\"Skriv hela betygsräknaren åt mig.\"",
        "\"Gör klart min uppgift.\"",
        "\"Skriv om all min kod så att den fungerar.\""
      ],
      answer: 0,
      explain: "Be AI förklara och ge ledtrådar – inte skriva hela lösningen. Då lär du dig mer."
    }
  ]
};
