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
  // Datafiler som finns i editorns "mapp" (kan läsas med pd.read_csv m.m.)
  files: {
    "elever.csv": "namn,timmar,poang\nAli,2,55\nSara,8,91\nLeo,5,74\n"
  },
  // Genomgång per del. code = exempel som kan köras i editorn.
  lessons: {
    p1: [
      {
        title: "Python är det gemensamma språket för AI",
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
          "<p>Du behöver inte kunna alla nu. I den här lektionen provar vi <code>pandas</code> och <code>scikit-learn</code>.</p>"
      },
      {
        title: "Kodmiljö",
        html: "<p>Editorn till höger kör Python direkt i webbläsaren – du behöver inte installera något för att öva här.</p>" +
          "<p>På din egen dator:</p><ol>" +
          "<li><b>Välj editor.</b> Thonny (thonny.org) är enklast, Python ingår. VS Code är mer kraftfull och används av proffs.</li>" +
          "<li><b>VS Code?</b> Installera Python från python.org (kryssa i <i>Add Python to PATH</i>) och tillägget <i>Python</i> i VS Code.</li>" +
          "<li><b>Testa.</b> Skapa filen <code>test.py</code>, skriv en rad kod och kör: F5 i Thonny, ▶-knappen i VS Code.</li></ol>"
      },
      {
        title: "Ditt första program",
        html: "<p>Klicka på <b>Kör i editorn</b>. Koden hamnar till höger och körs – utskriften syns under editorn. Ändra sedan texten och kör igen med <b>▶ Kör</b> eller <kbd>Ctrl</kbd>+<kbd>Enter</kbd>.</p>",
        code: 'print("Hej, AI!")'
      }
    ],
    p2: [
      {
        title: "print() och kommentarer",
        html: "<ul><li><code>print()</code> skriver ut något på skärmen.</li><li>Text kallas <b>sträng</b> och skrivs alltid inom citattecken.</li>" +
          "<li>Rader som börjar med <code>#</code> är kommentarer – Python hoppar över dem.</li></ul>",
        code: '# Mitt första program\nprint("Hej världen!")\nprint("Jag lär mig Python.")'
      },
      {
        title: "Variabler sparar information",
        html: "<p>En variabel är som en låda med en etikett. Med <code>=</code> lägger du något i lådan – det betyder <i>tilldela</i>, inte \"är lika med\" som i matten.</p>" +
          "<p><b>Regler för namn:</b> inga mellanslag (använd <code>_</code>), får inte börja med en siffra, undvik å, ä och ö.</p>",
        code: 'namn = "Sara"\nalder = 17\nlangd = 1.68\nprint(namn, "är", alder, "år")\nalder = alder + 1   # ny födelsedag\nprint(alder)'
      },
      {
        title: "Fyra datatyper",
        html: "<table><thead><tr><th>Typ</th><th>Exempel</th><th>Betyder</th></tr></thead><tbody>" +
          "<tr><td><code>int</code></td><td><code>42</code></td><td>Heltal</td></tr>" +
          "<tr><td><code>float</code></td><td><code>3.14</code></td><td>Decimaltal – med punkt, inte komma!</td></tr>" +
          "<tr><td><code>str</code></td><td><code>\"hej\"</code></td><td>Text (sträng)</td></tr>" +
          "<tr><td><code>bool</code></td><td><code>True</code> / <code>False</code></td><td>Sant eller falskt</td></tr></tbody></table>" +
          "<p>Osäker på vilken typ något är? <code>print(type(x))</code> berättar.</p>",
        code: 'print(type(42))\nprint(type(3.14))\nprint(type("hej"))\nprint(type(True))'
      },
      {
        title: "Prata med användaren",
        html: "<ul><li><code>input()</code> frågar användaren och väntar på svar. Här öppnas en ruta där du skriver svaret.</li>" +
          "<li>Svaret är <b>alltid text</b>. Vill du räkna – gör om det med <code>int()</code>.</li>" +
          "<li>Ett <code>f</code> före citattecknet låter dig stoppa in variabler med <code>{ }</code>.</li></ul>" +
          "<p>Prova att ta bort <code>int()</code> och kör igen – vad händer?</p>",
        code: 'namn = input("Vad heter du? ")\nprint(f"Hej {namn}!")\nalder = int(input("Ålder? "))\nprint(f"Om 10 år är du {alder + 10}")'
      },
      {
        title: "Listor håller många värden",
        html: "<ul><li>En lista skrivs med <code>[ ]</code> och kommatecken mellan värdena.</li><li>Räkningen börjar på 0 – första elementet är <code>[0]</code>.</li>" +
          "<li><b>AI-koppling:</b> träningsdata är i grunden långa listor med tal.</li></ul><p>Vad skriver <code>poang[1]</code> ut? Och <code>poang[-1]</code>? Prova!</p>",
        code: 'poang = [72, 85, 90]\nprint(poang[0])\npoang.append(64)   # lägg till\nprint(len(poang))\nprint(max(poang))'
      },
      {
        title: "Villkor låter programmet välja",
        html: "<ul><li><code>if</code> = om, <code>elif</code> = annars om, <code>else</code> = annars.</li><li>Varje villkor slutar med kolon <code>:</code></li>" +
          "<li>Koden som hör till villkoret får <b>indrag</b> – fyra mellanslag eller Tab. I Python är indraget en del av språket.</li>" +
          "<li>Jämförelser: <code>==</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code>. Obs: <code>=</code> tilldelar, <code>==</code> jämför.</li></ul>",
        code: 'poang = 72\nif poang >= 90:\n    print("Toppen!")\nelif poang >= 60:\n    print("Godkänt")\nelse:\n    print("Försök igen")'
      },
      {
        title: "Loopar upprepar arbetet",
        html: "<ul><li><code>for</code> går igenom något, ett element i taget.</li><li><code>range(3)</code> ger talen 0, 1 och 2.</li>" +
          "<li><b>AI-koppling:</b> en modell tränas genom att loopa över datan om och om igen – varje varv kallas en <b>epok</b>.</li></ul>",
        code: 'elever = ["Ali", "Sara"]\nfor elev in elever:\n    print(f"Hej {elev}!")\nfor epok in range(2):\n    print("Tränar, varv", epok)'
      },
      {
        title: "Funktioner är återanvändbar kod",
        html: "<ul><li>Med <code>def</code> skapar du en egen funktion – ett recept du kan använda igen.</li>" +
          "<li>Det inom parentesen är <b>parametrar</b>, alltså det du skickar in.</li><li><code>return</code> skickar tillbaka svaret.</li></ul>" +
          "<p><code>print()</code> och <code>len()</code> är också funktioner – färdiga sådana. AI-bibliotek har funktioner som <code>fit()</code> och <code>predict()</code>.</p>",
        code: 'def medel(lista):\n    return sum(lista) / len(lista)\n\nklass_a = [72, 85, 90]\nklass_b = [60, 95, 70, 83]\nprint(medel(klass_a))\nprint(medel(klass_b))'
      },
      {
        title: "Ordböcker kopplar nyckel till värde",
        html: "<ul><li>En dictionary skrivs med <code>{ }</code> och par av <code>nyckel: värde</code>.</li><li>Du slår upp med nyckeln, inte med en siffra.</li>" +
          "<li><b>AI-koppling:</b> svar från AI-tjänster (JSON) ser ut precis så här.</li></ul>",
        code: 'elev = {\n    "namn": "Sara",\n    "poang": 85\n}\nprint(elev["namn"])\nelev["klass"] = "TE24"\nprint(elev)'
      }
    ],
    p3: [
      {
        title: "Bibliotek – stå på jättarnas axlar",
        html: "<p>Ett bibliotek är färdig kod som någon annan har skrivit. Du hämtar in det med <code>import</code>. Vissa ingår i Python, andra installerar du först med <code>pip</code>.</p>" +
          "<p><b>Här i webbläsaren</b> laddas pandas och scikit-learn automatiskt när du importerar dem (första gången tar det en stund). På din egen dator:</p>" +
          "<ul><li><b>Thonny:</b> Verktyg → Hantera paket → sök och installera.</li><li><b>VS Code:</b> skriv i terminalen <code>pip install pandas scikit-learn</code> (fungerar inte det i Windows: <code>py -m pip install …</code>).</li></ul>",
        code: 'import math\nprint(math.sqrt(16))   # 4.0'
      },
      {
        title: "Läs in data med pandas",
        html: "<p>pandas gör om en CSV- eller Excel-fil till en tabell som kallas <b>DataFrame</b>. Filen <code>elever.csv</code> finns redan i editorns mapp:</p>" +
          "<pre class=\"code\"><code>namn,timmar,poang\nAli,2,55\nSara,8,91\nLeo,5,74</code></pre>" +
          "<p><code>head()</code> visar de första fem raderna. All AI börjar med data – och att titta på den först.</p>",
        code: 'import pandas as pd\ndf = pd.read_csv("elever.csv")\nprint(df.head())\nprint(df["poang"].mean())'
      }
    ],
    p4: [
      {
        title: "Vad är maskininlärning?",
        html: "<p>I stället för att du skriver reglerna låter du datorn hitta reglerna själv i exempel.</p>" +
          "<table><tbody><tr><td><b>Vanlig programmering</b></td><td>Regler + Data → Svar</td></tr>" +
          "<tr><td><b>Maskininlärning</b></td><td>Data + Svar → Regler (= modell)</td></tr></tbody></table>" +
          "<p><b>Exempel – spamfilter.</b> Vanlig kod: du skriver regler som \"om mejlet innehåller VINST är det spam\". Maskininlärning: du visar tusentals mejl märkta spam/inte spam och datorn listar själv ut mönstren.</p>"
      },
      {
        title: "Träna en modell på 8 rader",
        html: "<p>Kan datorn förutsäga om någon klarar provet utifrån plugg och sömn? Vi använder ett <b>beslutsträd</b> från scikit-learn – det lär sig enkla ja/nej-frågor ur exemplen.</p>" +
          "<p>Modellen har aldrig sett en elev med 6 timmar plugg och 7 timmar sömn – ändå gissar den. Ändra värdena i <code>predict</code> och kör igen!</p>",
        code: 'from sklearn.tree import DecisionTreeClassifier\n\n# Indata: [timmar plugg, timmar sömn]\nX = [[1, 5], [2, 6], [3, 4], [7, 8], [8, 7], [9, 8]]\n# Facit: U = underkänd, G = godkänd\ny = ["U", "U", "U", "G", "G", "G"]\n\nmodell = DecisionTreeClassifier()\nmodell.fit(X, y)                  # träna\nprint(modell.predict([[6, 7]]))   # gissa'
      },
      {
        title: "Vad hände egentligen?",
        html: "<table><tbody><tr><td><code>X</code></td><td><b>Indata</b> – egenskaperna vi mäter, här plugg och sömn.</td></tr>" +
          "<tr><td><code>y</code></td><td><b>Facit</b> – rätt svar för varje exempel, så kallade etiketter.</td></tr>" +
          "<tr><td><code>fit()</code></td><td><b>Träning</b> – modellen letar efter mönster som kopplar X till y.</td></tr>" +
          "<tr><td><code>predict()</code></td><td><b>Förutsägelse</b> – modellen gissar svaret för helt nya exempel.</td></tr></tbody></table>" +
          "<p>Sex exempel är för lite för en riktig AI. Ju mer och bättre data, desto bättre modell – och dålig data ger dåliga svar. Vad händer om exemplen inte är representativa?</p>"
      }
    ],
    p5: [
      {
        title: "Felmeddelanden är dina vänner",
        html: "<p>Läs <b>sista raden först</b> – där står vilken typ av fel det är, och raden ovanför visar var.</p>" +
          "<table><thead><tr><th>Fel</th><th>Vanlig orsak</th></tr></thead><tbody>" +
          "<tr><td><code>SyntaxError</code></td><td>Glömt kolon, parentes eller citattecken</td></tr>" +
          "<tr><td><code>IndentationError</code></td><td>Fel indrag efter if, for eller def</td></tr>" +
          "<tr><td><code>NameError</code></td><td>Stavat fel på en variabel eller funktion</td></tr>" +
          "<tr><td><code>TypeError</code></td><td>Blandar text och tal, t.ex. <code>\"5\" + 3</code></td></tr>" +
          "<tr><td><code>ModuleNotFoundError</code></td><td>Biblioteket är inte installerat – kör pip install</td></tr></tbody></table>",
        code: 'print("5" + 3)'
      },
      {
        title: "Fyra vanor som gör dig bättre",
        html: "<ul><li><b>Skriv koden själv.</b> Att skriva av för hand bygger förståelse. Kopiera inte bara.</li>" +
          "<li><b>Små steg, kör ofta.</b> Skriv några rader och testa direkt. Då hittar du felen snabbt.</li>" +
          "<li><b>Felsök med print().</b> Skriv ut variabler för att se vad som faktiskt händer.</li>" +
          "<li><b>AI som handledare.</b> Be AI förklara och ge ledtrådar – inte skriva hela lösningen. Fråga t.ex. \"Varför får jag det här felet?\" eller \"Ge mig en ledtråd\".</li></ul>"
      },
      {
        title: "Nästa steg",
        html: "<p>Nu kan du grunderna: variabler, datatyper och listor, villkor, loopar och funktioner, bibliotek och pip, pandas och <code>fit()</code>/<code>predict()</code>.</p>" +
          "<p>Fortsätt med: visualisera data med matplotlib, dela upp data i tränings- och testdata, mät hur bra modellen är och prova neurala nätverk.</p>",
        code: 'print("Bra jobbat!")'
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
      id: "p2-flera", part: "p2", type: "output", title: "print med flera delar",
      q: "Vad skriver programmet ut?",
      code: 'namn = "Sara"\nalder = 17\nprint(namn, "är", alder, "år")',
      answer: "Sara är 17 år",
      hint: "<code>print()</code> skriver ut värdet i variablerna – inte deras namn – och sätter mellanslag mellan delarna.",
      explain: "Kommatecknen i <code>print()</code> blir mellanslag i utskriften."
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
      id: "p2-kod-fodelsedag", part: "p2", type: "code", title: "Ny födelsedag",
      q: "Lägg till en rad som ökar <code>alder</code> med 1, så att programmet skriver ut <code>18</code>. Låt Python räkna – skriv inte 18 själv.",
      starter: "alder = 17\n# Öka alder med 1 här\n\nprint(alder)\n",
      solution: "alder = 17\nalder = alder + 1\nprint(alder)",
      hint: "<code>alder = alder + 1</code> räknar ut högersidan och lägger svaret i lådan igen.",
      runs: [{ expect: "18", test: `
assert "18" not in _code, "Skriv inte 18 i koden – låt Python räkna ut det."
` }],
      explain: "<code>=</code> betyder tilldela: först räknas <code>alder + 1</code> ut, sedan sparas svaret i <code>alder</code>."
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
      id: "p2-kod-medel", part: "p2", type: "code", title: "Din egen medel-funktion",
      q: "Skriv klart funktionen <code>medel(lista)</code> så att den <b>returnerar</b> medelvärdet av talen i listan.",
      starter: "def medel(lista):\n    pass   # byt ut den här raden\n\n\nprint(medel([72, 85, 90]))\n",
      solution: "def medel(lista):\n    return sum(lista) / len(lista)\n\n\nprint(medel([72, 85, 90]))",
      hint: "<code>sum(lista)</code> ger summan och <code>len(lista)</code> antalet. Glöm inte <code>return</code>.",
      runs: [{ test: `
assert "medel" in dir(), "Funktionen medel saknas."
r = medel([72, 85, 90])
assert r is not None, "Funktionen returnerar inget – använd return."
assert abs(r - 82.3333) < 0.01, "medel([72, 85, 90]) ska bli ungefär 82.33."
assert medel([60, 95, 70, 83]) == 77, "medel([60, 95, 70, 83]) ska bli 77.0."
assert medel([5]) == 5, "medel([5]) ska bli 5.0."
` }],
      explain: "Testet anropade din funktion med flera olika listor – det är det fina med funktioner."
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
    {
      id: "p2-kod-dict", part: "p2", type: "code", title: "Din egen ordbok",
      q: "Skapa en dictionary <code>elev</code> med nycklarna <code>\"namn\"</code> och <code>\"poang\"</code>. Lägg sedan till nyckeln <code>\"klass\"</code> och skriv ut elevens namn.",
      starter: "",
      solution: 'elev = {"namn": "Sara", "poang": 85}\nelev["klass"] = "TE24"\nprint(elev["namn"])',
      hint: 'Skapa med <code>{"namn": "Sara", "poang": 85}</code>, lägg till med <code>elev["klass"] = …</code>.',
      runs: [{ test: `
assert "elev" in dir() and isinstance(elev, dict), "Skapa en dictionary som heter elev."
for k in ("namn", "poang", "klass"):
    assert k in elev, f'Nyckeln "{k}" saknas i elev.'
assert str(elev["namn"]) in _out, "Skriv ut elevens namn med print(elev[\\"namn\\"])."
` }],
      explain: "Du slår upp och lägger till värden med nyckeln."
    },
    {
      id: "p2-kod-betygsraknare", part: "p2", type: "code", title: "Övning: betygsräknare",
      q: "Bygg en betygsräknare – ett steg i taget, och kör efter varje steg:<ol>" +
        "<li>Fråga efter tre provresultat med <code>input()</code> och spara dem i en lista.</li>" +
        "<li>Skriv en funktion som räknar ut medelvärdet.</li>" +
        "<li>Skriv ut ett betyg på <b>sista raden</b>: A (90+), B (80+), C (70+), D (60+), E (50+), annars F.</li></ol>" +
        "<b>Extra:</b> använd en loop så att användaren kan mata in hur många resultat som helst.",
      starter: "# Steg 1: fråga efter tre resultat och spara i en lista\n\n\n# Steg 2: funktion för medelvärde\n\n\n# Steg 3: skriv ut betyget\n",
      solution: 'resultat = []\nfor i in range(3):\n    resultat.append(int(input("Resultat? ")))\n\ndef medel(lista):\n    return sum(lista) / len(lista)\n\nm = medel(resultat)\nif m >= 90:\n    print("A")\nelif m >= 80:\n    print("B")\nelif m >= 70:\n    print("C")\nelif m >= 60:\n    print("D")\nelif m >= 50:\n    print("E")\nelse:\n    print("F")',
      hint: "Gör ett steg i taget och kör efter varje. Medelvärdet av 80, 70 och 75 är 75 – det ska bli C.",
      runs: [
        { inputs: ["95", "90", "92"], test: "import re\nlast = _out.strip().split('\\n')[-1]\nassert re.search(r'\\bA\\b', last), 'Med 95, 90 och 92 ska sista raden visa betyget A.'\nassert 'def' in _code, 'Använd en egen funktion (def) för medelvärdet.'" },
        { inputs: ["80", "70", "75"], test: "import re\nlast = _out.strip().split('\\n')[-1]\nassert re.search(r'\\bC\\b', last), 'Med 80, 70 och 75 (medel 75) ska sista raden visa betyget C.'" },
        { inputs: ["40", "50", "30"], test: "import re\nlast = _out.strip().split('\\n')[-1]\nassert re.search(r'\\bF\\b', last), 'Med 40, 50 och 30 (medel 40) ska sista raden visa betyget F.'" }
      ],
      explain: "Här kombinerade du input, listor, funktioner och villkor – grunderna i ett och samma program."
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
      id: "p3-kod-math", part: "p3", type: "code", title: "Använd ett bibliotek",
      q: "Importera <code>math</code> och skriv ut kvadratroten ur 81.",
      starter: "",
      solution: "import math\nprint(math.sqrt(81))",
      hint: "<code>import math</code> överst, sedan <code>math.sqrt(…)</code>.",
      runs: [{ expect: "9.0", test: `
assert "import math" in _code, "Börja med import math."
` }],
      explain: "<code>math.sqrt()</code> ger alltid ett decimaltal, därför 9.0."
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
      id: "p3-kod-pandas", part: "p3", type: "code", title: "Läs in elever.csv",
      q: "Läs in <code>elever.csv</code> med pandas, visa tabellen med <code>head()</code> och skriv ut medelvärdet av kolumnen <code>poang</code>.",
      starter: "import pandas as pd\n\n",
      solution: 'import pandas as pd\ndf = pd.read_csv("elever.csv")\nprint(df.head())\nprint(df["poang"].mean())',
      hint: '<code>pd.read_csv("elever.csv")</code> och <code>df["poang"].mean()</code>. Första körningen laddar pandas – det tar en stund.',
      runs: [{ test: `
assert "read_csv" in _code, "Läs in filen med pd.read_csv."
assert "73.3" in _out, "Skriv ut medelvärdet av poang (ca 73.3)."
` }],
      explain: "(55 + 91 + 74) / 3 ≈ 73.3. All AI börjar med att titta på datan."
    },
    {
      id: "p3-kod-max", part: "p3", type: "code", title: "Vem pluggade mest?",
      q: "Läs in <code>elever.csv</code> och skriv ut det <b>största</b> värdet i kolumnen <code>timmar</code> på sista raden.",
      starter: "import pandas as pd\n\n",
      solution: 'import pandas as pd\ndf = pd.read_csv("elever.csv")\nprint(df["timmar"].max())',
      hint: 'Precis som <code>.mean()</code> finns <code>.max()</code>.',
      runs: [{ test: `
assert "read_csv" in _code, "Läs in filen med pd.read_csv."
assert _out.strip().split("\\n")[-1].strip() == "8", "Sista raden ska vara det största värdet i timmar (8)."
` }],
      explain: "<code>df[\"timmar\"].max()</code> ger 8 – det var Sara."
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
      id: "p5-kod-syntax", part: "p5", type: "code", title: "Laga felet (1)",
      q: "Kör programmet, läs felmeddelandet och laga felet så att det skriver ut <code>Godkänt</code>.",
      starter: 'poang = 72\nif poang >= 60\n    print("Godkänt")\n',
      solution: 'poang = 72\nif poang >= 60:\n    print("Godkänt")',
      hint: "Vad ska stå sist på en rad med <code>if</code>?",
      runs: [{ expect: "Godkänt" }],
      explain: "<code>SyntaxError</code> – kolonet saknades."
    },
    {
      id: "p5-kod-name", part: "p5", type: "code", title: "Laga felet (2)",
      q: "Kör programmet, läs felmeddelandet och laga felet så att det skriver ut <code>Hej Ali!</code>",
      starter: 'namn = "Ali"\nprint(f"Hej {nman}!")\n',
      solution: 'namn = "Ali"\nprint(f"Hej {namn}!")',
      hint: "Läs sista raden i felmeddelandet. Vilket namn känner Python inte till?",
      runs: [{ expect: "Hej Ali!" }],
      explain: "<code>NameError</code> – variabeln var felstavad."
    },
    {
      id: "p5-kod-type", part: "p5", type: "code", title: "Laga felet (3)",
      q: "Kör programmet (skriv t.ex. 16), läs felmeddelandet och laga felet.",
      starter: 'alder = input("Ålder? ")\nprint("Om 10 år är du", alder + 10)\n',
      solution: 'alder = int(input("Ålder? "))\nprint("Om 10 år är du", alder + 10)',
      hint: "Svaret från <code>input()</code> är text. Hur gör man om text till ett tal?",
      runs: [{ inputs: ["16"], contains: ["26"] }, { inputs: ["3"], contains: ["13"] }],
      explain: "<code>TypeError</code> – det gick inte att lägga ihop text och tal."
    },
    {
      id: "p5-kod-indent", part: "p5", type: "code", title: "Laga felet (4)",
      q: "Kör programmet, läs felmeddelandet och laga felet så att det skriver ut 0, 1 och 2.",
      starter: "for i in range(3):\nprint(i)\n",
      solution: "for i in range(3):\n    print(i)",
      hint: "Raden efter <code>for</code> behöver indrag – fyra mellanslag eller Tab.",
      runs: [{ expect: "0\n1\n2" }],
      explain: "<code>IndentationError</code> – i Python är indraget en del av språket."
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
