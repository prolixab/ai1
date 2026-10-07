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
 *   code    skriv kod      starter, solution, runs: [{inputs, expect, contains, excludes, test}]
 *           test är Python som körs efter elevens kod; _out = utskriften, _code = koden.
 */
window.PYAI = {
  quiz: "python-for-ai",
  title: "Python för AI",
  parts: [
    { id: "p1", title: "Varför Python?" },
    { id: "p2", title: "Grunderna" },
    { id: "p4", title: "Din första AI-modell" }
  ],
  // Datafiler som finns i editorns "mapp" (kan läsas med pd.read_csv m.m.)
  files: {
    "elever.csv": "namn,timmar,poang\nAli,2,55\nSara,8,91\nLeo,5,74\n"
  },
  // Genomgång per del. code = exempel som kan köras i editorn.
  lessons: {
    p1: [
      {
        title: "Python är det gemensamma språket för AI",
        tasks: ["p1-skal", "p1-gemenskap"],
        html: "<p>ChatGPT, bildigenkänning, självkörande bilar – forskarna och företagen bakom dem använder Python. Tre skäl:</p>" +
          "<ul><li><b>Lättläst.</b> Koden ser nästan ut som engelska, så du kan fokusera på problemet i stället för krånglig syntax.</li>" +
          "<li><b>Färdiga verktyg.</b> Tusentals gratis bibliotek för data, grafer och maskininlärning.</li>" +
          "<li><b>Stor gemenskap.</b> Miljontals användare – har du fastnat har någon annan nästan alltid haft samma problem.</li></ul>"
      },
      {
        title: "AI-verktygslådan",
        html: "<table><thead><tr><th>Bibliotek</th><th>Används till</th></tr></thead><tbody>" +
          "<tr><td><code>numpy</code></td><td>Snabba beräkningar med stora mängder tal</td></tr>" +
          "<tr><td><code>pandas</code></td><td>Läsa och bearbeta tabeller, t.ex. CSV- och Excel-filer</td></tr>" +
          "<tr><td><code>matplotlib</code></td><td>Rita diagram och visualisera data</td></tr>" +
          "<tr><td><code>scikit-learn</code></td><td>Klassisk maskininlärning – perfekt att börja med</td></tr>" +
          "<tr><td><code>PyTorch</code> / <code>TensorFlow</code></td><td>Neurala nätverk och djupinlärning</td></tr>" +
          "<tr><td><code>transformers</code></td><td>Färdiga språk- och bildmodeller från Hugging Face</td></tr></tbody></table>" +
          "<p>Du behöver inte kunna dem – men namnen dyker upp överallt när man pratar om AI. I sista delen provar vi <code>scikit-learn</code>.</p>"
      },
      {
        title: "Kodmiljö",
        tasks: ["p1-path", "p1-kor"],
        html: "<p>Editorn till höger kör Python direkt i webbläsaren – du behöver inte installera något för att öva här.</p>" +
          "<p>På din egen dator:</p><ol>" +
          "<li><b>Välj editor.</b> Thonny (thonny.org) är enklast, Python ingår. VS Code är mer kraftfull och används av proffs.</li>" +
          "<li><b>VS Code?</b> Installera Python från python.org (kryssa i <i>Add Python to PATH</i>) och tillägget <i>Python</i> i VS Code.</li>" +
          "<li><b>Testa.</b> Skapa filen <code>test.py</code>, skriv en rad kod och kör: F5 i Thonny, ▶-knappen i VS Code.</li></ol>"
      },
      {
        title: "Ditt första program",
        tasks: ["p1-kod-hej"],
        html: "<p>Klicka på <b>Kör i editorn</b>. Koden hamnar till höger och körs – utskriften syns under editorn. Ändra sedan texten och kör igen med <b>▶ Kör</b> eller <kbd>Ctrl</kbd>+<kbd>Enter</kbd>.</p>",
        code: 'print("Hej, AI!")'
      }
    ],
    p2: [
      {
        title: "print() och kommentarer",
        tasks: ["p2-print", "p2-kod-print"],
        html: "<ul><li><code>print()</code> skriver ut något på skärmen.</li><li>Text kallas <b>sträng</b> och skrivs alltid inom citattecken.</li>" +
          "<li>Rader som börjar med <code>#</code> är kommentarer – Python hoppar över dem.</li></ul>",
        code: '# Mitt första program\nprint("Hej världen!")\nprint("Jag lär mig Python.")'
      },
      {
        title: "Variabler sparar information",
        tasks: ["p2-namn", "p2-tilldela", "p2-kod-variabler"],
        html: "<p>En variabel är som en låda med en etikett. Med <code>=</code> lägger du något i lådan – det betyder <i>tilldela</i>, inte \"är lika med\" som i matten.</p>" +
          "<p><b>Regler för namn:</b> inga mellanslag (använd <code>_</code>), får inte börja med en siffra, undvik å, ä och ö.</p>",
        code: 'namn = "Sara"\nalder = 17\nlangd = 1.68\nprint(namn, "är", alder, "år")\nalder = alder + 1   # ny födelsedag\nprint(alder)'
      },
      {
        title: "Fyra datatyper",
        tasks: ["p2-typer"],
        html: "<p>Allt som lagras i en variabel har en <b>datatyp</b>. Typen talar om vilken sorts värde det är – och därmed vad du kan göra med det. Tal kan du räkna med, text kan du skriva ut och sätta ihop, men <code>\"5\" + 3</code> går inte eftersom det blandar text och tal.</p>" +
          "<table><thead><tr><th>Typ</th><th>Exempel</th><th>Betyder</th></tr></thead><tbody>" +
          "<tr><td><code>int</code></td><td><code>42</code></td><td>Heltal</td></tr>" +
          "<tr><td><code>float</code></td><td><code>3.14</code></td><td>Decimaltal – med punkt, inte komma!</td></tr>" +
          "<tr><td><code>str</code></td><td><code>\"hej\"</code></td><td>Text (sträng)</td></tr>" +
          "<tr><td><code>bool</code></td><td><code>True</code> / <code>False</code></td><td>Sant eller falskt</td></tr></tbody></table>" +
          "<p>Python ser typen på hur värdet är skrivet: citattecken betyder text (<code>\"42\"</code> är alltså en <code>str</code>), en punkt betyder decimaltal, och <code>True</code>/<code>False</code> skrivs med stor bokstav och utan citattecken.</p>" +
          "<p>Osäker på vilken typ något är? <code>print(type(x))</code> berättar.</p>",
        code: 'print(type(42))\nprint(type(3.14))\nprint(type("hej"))\nprint(type(True))'
      },
      {
        title: "Prata med användaren",
        tasks: ["p2-input-typ", "p2-int", "p2-fstring", "p2-kod-input", "p2-kod-alder10"],
        html: "<ul><li><code>input()</code> frågar användaren och väntar på svar. Här öppnas en ruta där du skriver svaret.</li>" +
          "<li>Svaret är <b>alltid text</b>. Vill du räkna – gör om det med <code>int()</code>.</li>" +
          "<li>Ett <code>f</code> före citattecknet låter dig stoppa in variabler med <code>{ }</code>.</li></ul>" +
          "<p>Prova att ta bort <code>int()</code> och kör igen – vad händer?</p>",
        code: 'namn = input("Vad heter du? ")\nprint(f"Hej {namn}!")\nalder = int(input("Ålder? "))\nprint(f"Om 10 år är du {alder + 10}")'
      },
      {
        title: "Listor håller många värden",
        tasks: ["p2-index", "p2-append", "p2-kod-lista"],
        html: "<ul><li>En lista skrivs med <code>[ ]</code> och kommatecken mellan värdena.</li><li>Räkningen börjar på 0 – första elementet är <code>[0]</code>.</li>" +
          "<li><b>AI-koppling:</b> träningsdata är i grunden långa listor med tal.</li></ul><p>Vad skriver <code>poang[1]</code> ut? Och <code>poang[-1]</code>? Prova!</p>",
        code: 'poang = [72, 85, 90]\nprint(poang[0])\npoang.append(64)   # lägg till\nprint(len(poang))\nprint(max(poang))'
      },
      {
        title: "Villkor låter programmet välja",
        tasks: ["p2-if", "p2-jamfor", "p2-ordna-if", "p2-kod-betyg"],
        html: "<ul><li><code>if</code> = om, <code>elif</code> = annars om, <code>else</code> = annars.</li><li>Varje villkor slutar med kolon <code>:</code></li>" +
          "<li>Koden som hör till villkoret får <b>indrag</b> – fyra mellanslag eller Tab. I Python är indraget en del av språket.</li>" +
          "<li>Jämförelser: <code>==</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code>. Obs: <code>=</code> tilldelar, <code>==</code> jämför.</li></ul>",
        code: 'poang = 72\nif poang >= 90:\n    print("Toppen!")\nelif poang >= 60:\n    print("Godkänt")\nelse:\n    print("Försök igen")'
      },
      {
        title: "Loopar upprepar arbetet",
        tasks: ["p2-range", "p2-for", "p2-kod-sjugang"],
        html: "<ul><li><code>for</code> går igenom något, ett element i taget.</li><li><code>range(3)</code> ger talen 0, 1 och 2.</li>" +
          "<li><b>AI-koppling:</b> en modell tränas genom att loopa över datan om och om igen – varje varv kallas en <b>epok</b>.</li></ul>",
        code: 'elever = ["Ali", "Sara"]\nfor elev in elever:\n    print(f"Hej {elev}!")\nfor epok in range(2):\n    print("Tränar, varv", epok)'
      },
      {
        title: "Felmeddelanden är dina vänner",
        tasks: ["p5-sista", "p5-type", "p5-kod-name"],
        html: "<p>Alla får fel hela tiden – även proffs. Läs <b>sista raden först</b>: där står vilken typ av fel det är, och raden ovanför visar var.</p>" +
          "<table><thead><tr><th>Fel</th><th>Vanlig orsak</th></tr></thead><tbody>" +
          "<tr><td><code>SyntaxError</code></td><td>Glömt kolon, parentes eller citattecken</td></tr>" +
          "<tr><td><code>IndentationError</code></td><td>Fel indrag efter if eller for</td></tr>" +
          "<tr><td><code>NameError</code></td><td>Stavat fel på en variabel</td></tr>" +
          "<tr><td><code>TypeError</code></td><td>Blandar text och tal, t.ex. <code>\"5\" + 3</code></td></tr></tbody></table>" +
          "<p><b>Tips:</b> skriv några rader i taget och kör ofta. Fråga gärna en AI <i>varför</i> du får ett fel – men be om en ledtråd, inte hela lösningen.</p>",
        code: 'print("5" + 3)'
      }
    ],
    p4: [
      {
        title: "Vad är maskininlärning?",
        tasks: ["p4-ml", "p4-spam"],
        html: "<p>I stället för att du skriver reglerna låter du datorn hitta reglerna själv i exempel.</p>" +
          "<table><tbody><tr><td><b>Vanlig programmering</b></td><td>Regler + Data → Svar</td></tr>" +
          "<tr><td><b>Maskininlärning</b></td><td>Data + Svar → Regler (= modell)</td></tr></tbody></table>" +
          "<p><b>Exempel – spamfilter.</b> Vanlig kod: du skriver regler som \"om mejlet innehåller VINST är det spam\". Maskininlärning: du visar tusentals mejl märkta spam/inte spam och datorn listar själv ut mönstren.</p>"
      },
      {
        title: "Träna en modell på 8 rader",
        tasks: ["p4-ordna", "p4-kod-modell", "p4-kod-fraga", "p4-kod-egen"],
        html: "<p>Kan datorn förutsäga om någon klarar provet utifrån plugg och sömn? Vi använder ett <b>beslutsträd</b> från scikit-learn – det lär sig enkla ja/nej-frågor ur exemplen.</p>" +
          "<p>Modellen har aldrig sett en elev med 6 timmar plugg och 7 timmar sömn – ändå gissar den. Ändra värdena i <code>predict</code> och kör igen!</p>",
        code: 'from sklearn.tree import DecisionTreeClassifier\n\n# Indata: [timmar plugg, timmar sömn]\nX = [[1, 5], [2, 6], [3, 4], [7, 8], [8, 7], [9, 8]]\n# Facit: U = underkänd, G = godkänd\ny = ["U", "U", "U", "G", "G", "G"]\n\nmodell = DecisionTreeClassifier()\nmodell.fit(X, y)                  # träna\nprint(modell.predict([[6, 7]]))   # gissa'
      },
      {
        title: "Vad hände egentligen?",
        tasks: ["p4-begrepp", "p4-fit", "p4-monster", "p4-data", "p4-partisk"],
        html: "<table><tbody><tr><td><code>X</code></td><td><b>Indata</b> – egenskaperna vi mäter, här plugg och sömn.</td></tr>" +
          "<tr><td><code>y</code></td><td><b>Facit</b> – rätt svar för varje exempel, så kallade etiketter.</td></tr>" +
          "<tr><td><code>fit()</code></td><td><b>Träning</b> – modellen letar efter mönster som kopplar X till y.</td></tr>" +
          "<tr><td><code>predict()</code></td><td><b>Förutsägelse</b> – modellen gissar svaret för helt nya exempel.</td></tr></tbody></table>" +
          "<p>Sex exempel är för lite för en riktig AI. Ju mer och bättre data, desto bättre modell – och dålig data ger dåliga svar. Vad händer om exemplen inte är representativa?</p>"
      }
    ]
  },
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
    {
      id: "p1-kod-hej", part: "p1", type: "code", title: "Ditt första program",
      q: "Skriv ett program i editorn som skriver ut exakt <code>Hej, AI!</code>",
      starter: "# Skriv ditt första program här\n",
      solution: 'print("Hej, AI!")',
      hint: "Använd <code>print()</code> och glöm inte citattecknen runt texten.",
      runs: [{ expect: "Hej, AI!" }],
      explain: "Grattis – det är en milstolpe! <code>print()</code> skriver ut det som står inom parentesen."
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
      id: "p2-kod-print", part: "p2", type: "code", title: "Två rader och en kommentar",
      q: "Skriv ett program som skriver ut två rader: först <code>Hej världen!</code> och sedan en egen mening. Börja med en kommentar som berättar vad programmet gör.",
      starter: "",
      solution: '# Mitt första program\nprint("Hej världen!")\nprint("Jag lär mig Python.")',
      hint: "En kommentar börjar med <code>#</code>. Varje <code>print()</code> blir en egen rad.",
      runs: [{ test: `
lines = [l for l in _out.strip().split("\\n") if l.strip()]
assert len(lines) >= 2, "Programmet ska skriva ut minst två rader."
assert lines[0].strip() == "Hej världen!", "Första raden ska vara exakt: Hej världen!"
assert "#" in _code, "Glöm inte kommentaren – den börjar med #."
` }],
      explain: "Kommentaren hoppas över när programmet körs, men hjälper den som läser koden."
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
      id: "p2-kod-variabler", part: "p2", type: "code", title: "Skapa egna variabler",
      q: "Skapa variablerna <code>namn</code> (en text) och <code>alder</code> (ett heltal) med dina egna uppgifter, så att sista raden skriver ut t.ex. <code>Sara är 17 år</code>.",
      starter: '# Skapa variablerna namn och alder här\n\n\nprint(namn, "är", alder, "år")\n',
      solution: 'namn = "Sara"\nalder = 17\n\nprint(namn, "är", alder, "år")',
      hint: "Text skrivs inom citattecken, tal utan: <code>alder = 17</code>.",
      runs: [{ test: `
assert "namn" in dir(), "Variabeln namn finns inte."
assert "alder" in dir(), "Variabeln alder finns inte."
assert isinstance(namn, str), "namn ska vara text (str) – glöm inte citattecknen."
assert isinstance(alder, int) and not isinstance(alder, bool), "alder ska vara ett heltal (int) – utan citattecken."
assert f"{namn} är {alder} år" in _out, "Utskriften ska bli: namn är ålder år."
` }],
      explain: "<code>namn</code> är en <code>str</code> och <code>alder</code> en <code>int</code>. <code>print()</code> skriver ut värdena – inte variabelnamnen."
    },
    {
      id: "p2-typer", part: "p2", type: "match", title: "Fyra datatyper",
      q: "Vilken datatyp har varje värde?",
      pairs: [["42", "int"], ["3.14", "float"], ['"hej"', "str"], ["True", "bool"]],
      code: true, codeRight: true,
      explain: "<code>int</code> heltal, <code>float</code> decimaltal, <code>str</code> text och <code>bool</code> sant/falskt."
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
      id: "p2-kod-input", part: "p2", type: "code", title: "Hälsa på användaren",
      q: "Fråga användaren vad hen heter med <code>input()</code> och skriv sedan ut <code>Hej</code> följt av namnet och ett utropstecken, t.ex. <code>Hej Ali!</code>",
      starter: "",
      solution: 'namn = input("Vad heter du? ")\nprint(f"Hej {namn}!")',
      hint: 'Spara svaret i en variabel: <code>namn = input("Vad heter du? ")</code>. Använd sedan en f-sträng.',
      runs: [{ inputs: ["Ali"], contains: ["Hej Ali!"] }, { inputs: ["Sara"], contains: ["Hej Sara!"] }],
      explain: "Testet körde ditt program två gånger, med svaren Ali och Sara."
    },
    {
      id: "p2-kod-alder10", part: "p2", type: "code", title: "Om tio år",
      q: "Fråga efter användarens ålder och skriv ut hur gammal hen är om 10 år, t.ex. <code>Om 10 år är du 26</code>.",
      starter: 'alder = input("Ålder? ")\n',
      solution: 'alder = int(input("Ålder? "))\nprint(f"Om 10 år är du {alder + 10}")',
      hint: "Svaret från <code>input()</code> är text. Gör om det till ett heltal med <code>int()</code> innan du räknar.",
      runs: [{ inputs: ["16"], contains: ["26"] }, { inputs: ["40"], contains: ["50"] }],
      explain: "<code>int()</code> gör om texten till ett tal. Utan den får du <code>TypeError</code>."
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
      id: "p2-append", part: "p2", type: "output", title: "append, len och max",
      q: "Vad skriver programmet ut? (Två rader.)",
      code: "poang = [72, 85, 90]\npoang.append(64)    # lägg till\nprint(len(poang))\nprint(max(poang))",
      answer: "4\n90",
      near: { "3\n90": "<code>append()</code> lägger till ett element – hur många finns det sen?" },
      hint: "<code>append()</code> lägger till sist, <code>len()</code> räknar elementen och <code>max()</code> ger det största.",
      explain: "Efter <code>append(64)</code> är listan <code>[72, 85, 90, 64]</code>: fyra element, och det största är fortfarande 90."
    },
    {
      id: "p2-kod-lista", part: "p2", type: "code", title: "Jobba med en lista",
      q: "Lägg till talet 64 sist i listan och skriv sedan ut hur många tal listan innehåller och det största talet – på var sin rad.",
      starter: "poang = [72, 85, 90]\n",
      solution: "poang = [72, 85, 90]\npoang.append(64)\nprint(len(poang))\nprint(max(poang))",
      hint: "<code>append()</code>, <code>len()</code> och <code>max()</code>.",
      runs: [{ expect: "4\n90", test: `
assert poang == [72, 85, 90, 64], "Lägg till 64 sist i listan med poang.append(64)."
` }],
      explain: "Listan blir <code>[72, 85, 90, 64]</code>: fyra tal, och det största är 90."
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
      id: "p2-kod-betyg", part: "p2", type: "code", title: "Toppen, godkänt eller försök igen",
      q: "Fråga efter poäng med <code>input()</code>. Skriv ut <code>Toppen!</code> om poängen är 90 eller mer, <code>Godkänt</code> om den är 60 eller mer, och annars <code>Försök igen</code>.",
      starter: 'poang = int(input("Poäng? "))\n',
      solution: 'poang = int(input("Poäng? "))\nif poang >= 90:\n    print("Toppen!")\nelif poang >= 60:\n    print("Godkänt")\nelse:\n    print("Försök igen")',
      hint: "Använd <code>if</code>, <code>elif</code> och <code>else</code>. Kolon sist på raden och indrag på raden under.",
      runs: [
        { inputs: ["95"], contains: ["Toppen!"], excludes: ["Godkänt", "Försök igen"] },
        { inputs: ["72"], contains: ["Godkänt"], excludes: ["Toppen!", "Försök igen"] },
        { inputs: ["30"], contains: ["Försök igen"], excludes: ["Toppen!", "Godkänt"] }
      ],
      explain: "Testet körde programmet med 95, 72 och 30. Villkoren prövas uppifrån – den första som stämmer vinner."
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
      id: "p2-for", part: "p2", type: "output", title: "Loopa över en lista",
      q: "Vad skriver programmet ut?",
      code: 'elever = ["Ali", "Sara"]\nfor elev in elever:\n    print(f"Hej {elev}!")',
      answer: "Hej Ali!\nHej Sara!",
      hint: "<code>for</code> tar ett element i taget och kör den indragna raden en gång per element.",
      explain: "Första varvet är <code>elev</code> = \"Ali\", andra varvet \"Sara\"."
    },
    {
      id: "p2-kod-sjugang", part: "p2", type: "code", title: "Sjugångertabellen",
      q: "Skriv ut multiplikationstabellen för 7 (7, 14, 21 … 70) med en <code>for</code>-loop och <code>range()</code>.",
      starter: "",
      solution: "for i in range(1, 11):\n    print(7 * i)",
      hint: "<code>range(1, 11)</code> ger talen 1 till 10. Multiplicera med <code>*</code>.",
      runs: [{ test: `
import re
assert "for" in _code and "range" in _code, "Använd en for-loop med range()."
nums = [int(n) for n in re.findall(r"\\d+", _out)]
it = iter(nums)
assert all(p in it for p in [7 * i for i in range(1, 11)]), "Utskriften ska innehålla 7, 14, 21 … 70 i ordning."
` }],
      explain: "Loopen kör den indragna raden tio gånger, en gång för varje tal från <code>range(1, 11)</code>."
    },
    {
      id: "p5-sista", part: "p2", type: "mc", title: "Läs felmeddelandet",
      q: "Var i ett felmeddelande ska du börja läsa?",
      options: ["Sista raden", "Första raden", "Mitten", "Ingenstans – starta om programmet"],
      answer: 0,
      explain: "På sista raden står vilken typ av fel det är. Raden ovanför visar på vilken rad i koden."
    },
    {
      id: "p5-type", part: "p2", type: "mc", title: "Vilket fel?",
      q: "Vilket fel ger den här koden?",
      code: 'print("5" + 3)',
      options: ["TypeError", "SyntaxError", "NameError", "IndentationError"],
      answer: 0,
      explain: "<code>\"5\"</code> är text och <code>3</code> är ett tal – de går inte att lägga ihop."
    },
    {
      id: "p5-kod-name", part: "p2", type: "code", title: "Laga felet",
      q: "Kör programmet, läs felmeddelandet och laga felet så att det skriver ut <code>Hej Ali!</code>",
      starter: 'namn = "Ali"\nprint(f"Hej {nman}!")\n',
      solution: 'namn = "Ali"\nprint(f"Hej {namn}!")',
      hint: "Läs sista raden i felmeddelandet. Vilket namn känner Python inte till?",
      runs: [{ expect: "Hej Ali!" }],
      explain: "<code>NameError</code> – variabeln var felstavad."
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
      id: "p4-kod-modell", part: "p4", type: "code", title: "Träna din första modell",
      q: "Skapa ett beslutsträd som heter <code>modell</code>, träna det på <code>X</code> och <code>y</code> och skriv ut förutsägelsen för en elev som pluggat 6 timmar och sovit 7.",
      starter: 'from sklearn.tree import DecisionTreeClassifier\n\n# Indata: [timmar plugg, timmar sömn]\nX = [[1, 5], [2, 6], [3, 4], [7, 8], [8, 7], [9, 8]]\n# Facit: U = underkänd, G = godkänd\ny = ["U", "U", "U", "G", "G", "G"]\n\n# Skapa, träna och gissa här\n',
      solution: 'from sklearn.tree import DecisionTreeClassifier\n\nX = [[1, 5], [2, 6], [3, 4], [7, 8], [8, 7], [9, 8]]\ny = ["U", "U", "U", "G", "G", "G"]\n\nmodell = DecisionTreeClassifier()\nmodell.fit(X, y)\nprint(modell.predict([[6, 7]]))',
      hint: "Tre rader: <code>modell = DecisionTreeClassifier()</code>, <code>modell.fit(X, y)</code> och <code>print(modell.predict([[6, 7]]))</code>.",
      runs: [{ test: `
assert "modell" in dir(), "Skapa en variabel som heter modell."
assert hasattr(modell, "classes_"), "Modellen är inte tränad – anropa modell.fit(X, y)."
assert "'G'" in _out, "Skriv ut förutsägelsen för [[6, 7]] – den ska bli ['G']."
` }],
      explain: "Första gången laddas scikit-learn, sedan går det snabbt. Modellen gissar G fast den aldrig sett just den eleven."
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
    {
      id: "p4-kod-fraga", part: "p4", type: "code", title: "Fråga användaren",
      q: "Låt användaren skriva in timmar plugg och timmar sömn med <code>input()</code>, och skriv ut modellens förutsägelse på sista raden.",
      starter: 'from sklearn.tree import DecisionTreeClassifier\n\nX = [[1, 5], [2, 6], [3, 4], [7, 8], [8, 7], [9, 8]]\ny = ["U", "U", "U", "G", "G", "G"]\nmodell = DecisionTreeClassifier()\nmodell.fit(X, y)\n\n# Fråga användaren och gör en förutsägelse\n',
      solution: 'from sklearn.tree import DecisionTreeClassifier\n\nX = [[1, 5], [2, 6], [3, 4], [7, 8], [8, 7], [9, 8]]\ny = ["U", "U", "U", "G", "G", "G"]\nmodell = DecisionTreeClassifier()\nmodell.fit(X, y)\n\nplugg = int(input("Timmar plugg? "))\nsomn = int(input("Timmar sömn? "))\nprint(modell.predict([[plugg, somn]]))',
      hint: "Två <code>int(input(...))</code>, sedan <code>modell.predict([[plugg, somn]])</code>. Notera dubbla hakparenteser.",
      runs: [
        { inputs: ["9", "8"], test: "import re\nassert re.search(r'\\bG\\b', _out.strip().split('\\n')[-1]), 'Med 9 timmar plugg och 8 sömn ska modellen gissa G.'" },
        { inputs: ["1", "4"], test: "import re\nassert re.search(r'\\bU\\b', _out.strip().split('\\n')[-1]), 'Med 1 timme plugg och 4 sömn ska modellen gissa U.'" }
      ],
      explain: "Nu knyter du ihop grunderna (input, int) med AI-delen."
    },
    {
      id: "p4-kod-egen", part: "p4", type: "code", title: "Utmaning: gör modellen till din egen",
      q: "Lägg till en <b>tredje egenskap</b>, t.ex. närvaro i procent, och <b>fler exempel</b> – minst 8 stycken. Träna modellen och gör en förutsägelse.<br><small>Vill du mer? Välj ett eget problem: gissa sport utifrån längd och vikt, eller musikgenre utifrån tempo.</small>",
      starter: 'from sklearn.tree import DecisionTreeClassifier\n\n# [timmar plugg, timmar sömn, närvaro i %]\nX = [[1, 5, 60], [2, 6, 70], [3, 4, 65], [7, 8, 95], [8, 7, 90], [9, 8, 98]]\ny = ["U", "U", "U", "G", "G", "G"]\n\nmodell = DecisionTreeClassifier()\nmodell.fit(X, y)\nprint(modell.predict([[6, 7, 85]]))\n',
      solution: 'from sklearn.tree import DecisionTreeClassifier\n\nX = [[1, 5, 60], [2, 6, 70], [3, 4, 65], [7, 8, 95], [8, 7, 90], [9, 8, 98], [4, 7, 80], [5, 5, 75]]\ny = ["U", "U", "U", "G", "G", "G", "G", "U"]\n\nmodell = DecisionTreeClassifier()\nmodell.fit(X, y)\nprint(modell.predict([[6, 7, 85]]))',
      hint: "Varje rad i <code>X</code> behöver tre tal, och <code>y</code> behöver lika många svar som <code>X</code> har rader.",
      runs: [{ test: `
assert len(X) >= 8, f"Lägg till fler exempel – du har {len(X)}, minst 8 behövs."
assert len(X) == len(y), f"X har {len(X)} exempel men y har {len(y)} svar – de måste vara lika många."
assert all(len(r) == 3 for r in X), "Varje exempel i X ska ha tre egenskaper."
assert "modell" in dir() and getattr(modell, "n_features_in_", 0) == 3, "Träna modellen på dina nya X och y."
` }],
      explain: "Samma fyra steg – X, y, fit, predict – fungerar för alla problem. Ju mer och bättre data, desto bättre modell."
    }
  ]
};
