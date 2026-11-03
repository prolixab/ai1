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
 *           sim (i stället för runs): elevens kod definierar agent(percept) som styr dammsugaren
 *           i världen från Agenter och miljöer. sim: { world, steps, runs: [{seed | dirt, start, label}],
 *           goal: { clean, avgClean, noBump, suckDirty, alive } }
 */
window.PYAI = {
  quiz: "python-for-ai",
  title: "Python för AI",
  parts: [
    { id: "p1", title: "Varför Python?" },
    { id: "p2", title: "Grunderna" },
    // sim = världen som visas när koden i Fri lek definierar en agent
    { id: "p3", title: "Programmera en agent", sim: { world: { map: "lagenhet", observable: "partial" }, steps: 120, runs: [{ seed: 1 }] } },
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
        tasks: ["p2-input-flode", "p2-input-typ", "p2-int", "p2-fstring", "p2-kod-input", "p2-kod-alder10"],
        html: "<p>Hittills har programmen gjort exakt samma sak varje gång. Med <code>input()</code> kan programmet <b>fråga</b> användaren och använda svaret. Så här går det till:</p>" +
          "<ol><li>Programmet <b>stannar</b> på raden och visar texten inom parentesen – frågan.</li>" +
          "<li>Användaren skriver ett svar och trycker <kbd>Enter</kbd>. Här i webbläsaren öppnas en ruta för svaret. I Thonny eller VS Code skriver du svaret där utskriften syns.</li>" +
          "<li><code>input()</code> <b>lämnar tillbaka</b> svaret. Spara det i en variabel – annars försvinner det.</li></ol>" +
          "<ul><li>Avsluta frågan med ett mellanslag, <code>\"Vad heter du? \"</code>, så att svaret inte klistras ihop med frågetecknet.</li>" +
          "<li>Svaret är <b>alltid text</b> – även om användaren skriver en siffra. Vill du räkna – gör om det med <code>int()</code>.</li>" +
          "<li>Ett <code>f</code> före citattecknet låter dig stoppa in variabler med <code>{ }</code>.</li></ul>" +
          "<p>Prova att ta bort <code>int()</code> och kör igen – vad händer?</p>",
        code: 'namn = input("Vad heter du? ")\nprint(f"Hej {namn}!")\nalder = int(input("Ålder? "))\nprint(f"Om 10 år är du {alder + 10}")'
      },
      {
        title: "Räkna med indata",
        tasks: ["p2-input-text", "p2-float", "p2-komma", "p2-kod-temp", "p2-kod-snitt"],
        html: "<p>Svaret från <code>input()</code> är text. Innan du räknar gör du om det till rätt sorts tal:</p>" +
          "<table><thead><tr><th>Funktion</th><th>Gör om till</th><th>Exempel</th></tr></thead><tbody>" +
          "<tr><td><code>int()</code></td><td>Heltal</td><td><code>int(\"16\")</code> → <code>16</code></td></tr>" +
          "<tr><td><code>float()</code></td><td>Decimaltal</td><td><code>float(\"1.75\")</code> → <code>1.75</code></td></tr>" +
          "<tr><td><code>str()</code></td><td>Text</td><td><code>str(16)</code> → <code>\"16\"</code></td></tr></tbody></table>" +
          "<ul><li><b>Decimalkomma.</b> Python vill ha punkt. Skriver användaren <code>1,75</code> blir det <code>ValueError</code>. Byt kommat mot en punkt först: <code>input(\"Längd? \").replace(\",\", \".\")</code>.</li>" +
          "<li><b>Flera värden?</b> Ställ en fråga per värde – ett <code>input()</code> för varje.</li>" +
          "<li><b>Text där det ska vara ett tal</b>, t.ex. <code>int(\"hej\")</code>, ger också <code>ValueError</code>.</li>" +
          "<li><code>round(x, 2)</code> avrundar till två decimaler.</li></ul>" +
          "<p><b>AI-koppling:</b> en modell förstår bara tal. Allt som ska in i den – text, bilder, ljud – måste först göras om till tal, precis som här.</p>",
        code: 'pris = float(input("Vad kostar pizzan? ").replace(",", "."))\nbitar = int(input("Hur många bitar? "))\nprint(f"Varje bit kostar {round(pris / bitar, 2)} kr")'
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
        tasks: ["p2-if", "p2-jamfor", "p2-ordna-if", "p2-kod-betyg", "p2-kod-svar"],
        html: "<ul><li><code>if</code> = om, <code>elif</code> = annars om, <code>else</code> = annars.</li><li>Varje villkor slutar med kolon <code>:</code></li>" +
          "<li>Koden som hör till villkoret får <b>indrag</b> – fyra mellanslag eller Tab. I Python är indraget en del av språket.</li>" +
          "<li>Jämförelser: <code>==</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code>. Obs: <code>=</code> tilldelar, <code>==</code> jämför.</li>" +
          "<li>Jämför du ett textsvar från <code>input()</code>? <code>\"Ja\" == \"ja\"</code> är <code>False</code>. Med <code>svar.strip().lower()</code> tas mellanslag runt svaret bort och alla bokstäver blir små – då blir både <code>\" Ja\"</code> och <code>\"JA\"</code> till <code>\"ja\"</code>.</li></ul>",
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
        title: "while – fråga tills det blir rätt",
        tasks: ["p2-while", "p2-kod-losen", "p2-kod-gissa"],
        html: "<p><code>for</code> passar när du vet hur många varv det blir. När du inte vet – t.ex. hur många gånger användaren behöver gissa – använder du <code>while</code>.</p>" +
          "<ul><li><code>while villkor:</code> kör den indragna koden om och om igen <b>så länge</b> villkoret är sant.</li>" +
          "<li><code>break</code> hoppar ur loopen direkt. <code>while True:</code> med en <code>break</code> inuti är ett vanligt sätt att fråga tills användaren skriver något särskilt.</li>" +
          "<li>Något i loopen måste kunna göra villkoret falskt – annars snurrar den för evigt. Fastnar ett program i Thonny eller VS Code stoppar du det med <kbd>Ctrl</kbd>+<kbd>C</kbd>. Fryser sidan här – ladda om den.</li></ul>" +
          "<p><b>AI-koppling:</b> en chattbot är i grunden en <code>while</code>-loop: läs en fråga, svara, vänta på nästa.</p>",
        code: 'summa = 0\nwhile True:\n    svar = input("Skriv ett tal (eller klar): ")\n    if svar == "klar":\n        break\n    summa = summa + int(svar)\nprint("Summan är", summa)'
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
      },
      {
        title: "Projekt: bygg egna program",
        tasks: ["p2-kod-kalk", "p2-kod-quiz", "p2-kod-inkop"],
        html: "<p>Nu kan du allt som behövs för att bygga små riktiga program: ta emot indata, räkna, välja och upprepa. Uppgifterna här är större – så jobba som en programmerare:</p>" +
          "<ol><li><b>Vad ska in?</b> Vilka frågor ska programmet ställa – och ska svaren vara text eller tal?</li>" +
          "<li><b>Vad ska ut?</b> Bestäm exakt vad som ska skrivas ut för ett exempel.</li>" +
          "<li><b>Lite i taget.</b> Skriv några rader, kör, kolla – och bygg vidare.</li>" +
          "<li><b>Testa konstiga svar.</b> Vad händer om användaren skriver stora bokstäver, ett mellanslag för mycket eller ett decimalkomma?</li></ol>" +
          "<p>Exemplet är en mycket enkel chattbot. <code>\"namn\" in fraga</code> kollar om ordet finns någonstans i texten. Kör den och bygg vidare i Fri lek!</p>",
        code: 'print("Hej! Jag är PyBot. Skriv hejdå för att sluta.")\nwhile True:\n    fraga = input("Du: ").strip().lower()\n    if fraga == "hejdå":\n        print("PyBot: Hejdå!")\n        break\n    elif "namn" in fraga or "heter" in fraga:\n        print("PyBot: Jag heter PyBot.")\n    elif "python" in fraga:\n        print("PyBot: Python är mitt favoritspråk!")\n    else:\n        print("PyBot: Det förstod jag inte. Fråga om mitt namn eller om Python.")'
      }
    ],
    p3: [
      {
        title: "Agenten är en funktion",
        tasks: ["p3-vad", "p3-handling", "p3-kod-tvarum"],
        html: "<p>I temat <a href=\"../agenter-och-miljoer/\" target=\"_blank\">Agenter och miljöer</a> såg du dammsugaren städa. Nu skriver <b>du</b> agentprogrammet. I Python är en agent helt enkelt en funktion:</p>" +
          "<ul><li>In kommer ett <b>percept</b> – det agenten uppfattar just nu.</li><li>Ut kommer en <b>handling</b> – en text som <code>\"sug\"</code> eller <code>\"höger\"</code>.</li>" +
          "<li>Världen anropar funktionen en gång per steg: percept → agent → handling → ny värld → nytt percept …</li></ul>" +
          "<p>Perceptet är en <b>ordbok</b> (dictionary). Du hämtar ett värde med nyckeln inom hakparenteser, t.ex. <code>percept[\"smutsig\"]</code>.</p>" +
          "<table><thead><tr><th>Nyckel</th><th>Värde</th></tr></thead><tbody>" +
          "<tr><td><code>\"smutsig\"</code></td><td><code>True</code> om rutan agenten står på är smutsig</td></tr>" +
          "<tr><td><code>\"fritt\"</code></td><td>Lista med hållen utan vägg, t.ex. <code>[\"upp\", \"höger\"]</code></td></tr>" +
          "<tr><td><code>\"x\"</code>, <code>\"y\"</code></td><td>Var agenten står (x åt höger, y nedåt)</td></tr>" +
          "<tr><td><code>\"batteri\"</code>, <code>\"laddare\"</code></td><td>Batterinivå och laddarens ruta – används i sista uppgiften</td></tr></tbody></table>" +
          "<p><b>Handlingar:</b> <code>\"sug\"</code>, <code>\"upp\"</code>, <code>\"ner\"</code>, <code>\"höger\"</code>, <code>\"vänster\"</code> och <code>\"vänta\"</code>.</p>" +
          "<p>Kör exemplet: världen ritas ovanför utskriften. Vad händer när agenten kommer fram till väggen?</p>",
        code: 'def agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    return "höger"'
      },
      {
        title: "Regler med if och listan fritt",
        tasks: ["p3-in", "p3-kod-reflex", "p3-loop"],
        html: "<p>En <b>enkel reflexagent</b> är en lista med regler: <i>OM detta – GÖR det</i>. Den första regeln som passar bestämmer.</p>" +
          "<ul><li>Med <code>in</code> kollar du om något finns i en lista: <code>\"höger\" in percept[\"fritt\"]</code> är <code>True</code> om det inte är vägg till höger.</li>" +
          "<li>Ordningen på <code>if</code> och <code>elif</code> är ordningen på reglerna.</li>" +
          "<li>Agenten har <b>inget minne</b> – den ser bara rutan den står på och väggarna runt den.</li></ul>" +
          "<p>Kör och titta på spåret efter agenten. Blir lägenheten helt ren?</p>",
        code: 'def agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    elif "höger" in percept["fritt"]:\n        return "höger"\n    elif "ner" in percept["fritt"]:\n        return "ner"\n    else:\n        return "vänster"'
      },
      {
        title: "Slumpen kan hjälpa",
        tasks: ["p3-kod-slump"],
        html: "<p>En reflexagent utan minne gör alltid samma sak i samma situation – därför kan den fastna i en loop. Ett enkelt knep: låt agenten <b>slumpa</b> när den inte vet bättre.</p>" +
          "<ul><li><code>import random</code> hämtar slumpbiblioteket.</li><li><code>random.choice(lista)</code> väljer ett slumpat element ur listan.</li>" +
          "<li><code>random.choice(percept[\"fritt\"])</code> blir alltså ett slumpat håll utan vägg.</li></ul>" +
          "<p>Slumpagenten fastnar inte, men den slösar steg på rutor den redan har städat.</p>",
        code: 'import random\n\ndef agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    return random.choice(percept["fritt"])'
      },
      {
        title: "Minne gör agenten smartare",
        tasks: ["p3-tupel", "p3-kod-minne"],
        html: "<p>En <b>modellbaserad agent</b> kommer ihåg saker om världen. Vi ger agenten en lista med rutor den har besökt.</p>" +
          "<ul><li>En ruta skrivs som ett par <code>(x, y)</code> – en <b>tupel</b>. <code>(2, 1)</code> är rutan med x = 2 och y = 1.</li>" +
          "<li>Listan skapas <b>utanför</b> funktionen. Då finns den kvar mellan stegen i stället för att bli tom varje gång agenten anropas.</li>" +
          "<li><code>(x, y) not in besokta</code> är <code>True</code> om rutan inte finns i listan.</li>" +
          "<li>Strategi: gå till en fri granne som du inte har besökt. Finns ingen sådan – slumpa.</li></ul>",
        code: 'besokta = []\n\ndef agent(percept):\n    plats = (percept["x"], percept["y"])\n    if plats not in besokta:\n        besokta.append(plats)\n        print("Ny ruta:", plats, "– har besökt", len(besokta))\n    if percept["smutsig"]:\n        return "sug"\n    return "höger"'
      },
      {
        title: "Batteriet – att väga mål mot varandra",
        tasks: ["p3-kod-batteri", "p3-nytta"],
        html: "<p>Nu har dammsugaren ett batteri. Varje steg och varje sugning kostar 1. Står den på laddaren (blixten) och väljer <code>\"vänta\"</code> laddas den med 8, upp till 40. Tar batteriet slut står agenten still för alltid.</p>" +
          "<ul><li><code>percept[\"batteri\"]</code> är batterinivån och <code>percept[\"laddare\"]</code> laddarens ruta.</li>" +
          "<li><code>lx, ly = percept[\"laddare\"]</code> plockar isär paret i två variabler.</li>" +
          "<li><code>abs(x - lx) + abs(y - ly)</code> är antalet steg hem i ett rum utan väggar. <code>abs</code> tar bort minustecknet.</li></ul>" +
          "<p>Agenten måste alltså <b>väga</b> två saker: att städa mer – och att hinna hem. Det är tanken bakom en <b>nyttobaserad agent</b>.</p>"
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
      id: "p2-input-flode", part: "p2", type: "mc", title: "Vad gör input()?",
      q: 'Vad händer när Python kommer till raden <code>namn = input("Vad heter du? ")</code>?',
      options: [
        "Programmet visar frågan och väntar tills användaren har skrivit ett svar och tryckt Enter – svaret hamnar i <code>namn</code>",
        "Python hittar själv på ett namn och sparar det i <code>namn</code>",
        "Frågan skrivs ut, men programmet fortsätter direkt utan att vänta",
        "Programmet skriver ut texten <code>namn</code>"
      ],
      answer: 0,
      explain: "<code>input()</code> pausar programmet. När användaren tryckt Enter lämnas svaret tillbaka och sparas i variabeln."
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
      id: "p2-input-text", part: "p2", type: "output", title: "Text plus text",
      q: "Användaren svarar <code>5</code>. Vad skriver <code>print</code>-raden ut?",
      code: 'x = input("Ett tal? ")\nprint(x + x)',
      answer: "55",
      near: { "10": "Svaret från <code>input()</code> är texten <code>\"5\"</code>. Vad händer när man lägger ihop två texter?" },
      hint: "Vilken typ har svaret från <code>input()</code>?",
      explain: "<code>x</code> är texten <code>\"5\"</code>, och <code>+</code> mellan två texter sätter ihop dem: <code>\"55\"</code>. Med <code>int(input(...))</code> hade det blivit 10."
    },
    {
      id: "p2-float", part: "p2", type: "mc", title: "Decimaltal från användaren",
      q: "Användaren ska skriva sin längd i meter, t.ex. <code>1.75</code>. Vilken rad sparar svaret så att du kan räkna med det?",
      options: [
        '<code>langd = float(input("Längd? "))</code>',
        '<code>langd = int(input("Längd? "))</code>',
        '<code>langd = input("Längd? ")</code>',
        '<code>langd = str(input("Längd? "))</code>'
      ],
      answer: 0,
      explain: "<code>float()</code> gör om texten till ett decimaltal. <code>int(\"1.75\")</code> ger <code>ValueError</code>, och utan omvandling är svaret fortfarande text."
    },
    {
      id: "p2-komma", part: "p2", type: "mc", title: "Decimalkomma",
      q: 'Användaren skriver <code>1,75</code> – med komma. Vad händer på raden <code>langd = float(input("Längd? "))</code>?',
      options: [
        "Programmet kraschar med <code>ValueError</code>",
        "<code>langd</code> blir 1.75",
        "<code>langd</code> blir 1",
        "<code>langd</code> blir 175"
      ],
      answer: 0,
      explain: "Python använder punkt som decimaltecken. Byt kommat först: <code>float(input(\"Längd? \").replace(\",\", \".\"))</code>."
    },
    {
      id: "p2-kod-temp", part: "p2", type: "code", title: "Celsius till Fahrenheit",
      q: "Fråga efter en temperatur i Celsius och skriv ut den i Fahrenheit. Formeln är <code>F = C · 1,8 + 32</code>.<br>Temperaturen kan vara ett decimaltal – även med decimalkomma, t.ex. <code>37,5</code>.",
      starter: "",
      solution: 'c = float(input("Grader Celsius? ").replace(",", "."))\nf = c * 1.8 + 32\nprint(f"Det är {f} grader Fahrenheit")',
      hint: 'Använd <code>float()</code> och <code>.replace(",", ".")</code>. Multiplikation skrivs <code>*</code> och decimaltal med punkt: <code>1.8</code>.',
      runs: [{ inputs: ["20"], contains: ["68"] }, { inputs: ["-5"], contains: ["23"] }, { inputs: ["37,5"], contains: ["99.5"] }],
      explain: "Testet körde programmet med 20, −5 och 37,5. Tack vare <code>replace</code> klarar programmet både punkt och komma."
    },
    {
      id: "p2-kod-snitt", part: "p2", type: "code", title: "Medelvärde av tre prov",
      q: "Fråga efter poängen på tre prov, ett i taget, och skriv ut medelvärdet på sista raden, t.ex. <code>Medelvärdet är 80.0</code>.",
      starter: "",
      solution: 'a = int(input("Prov 1? "))\nb = int(input("Prov 2? "))\nc = int(input("Prov 3? "))\nsnitt = (a + b + c) / 3\nprint("Medelvärdet är", round(snitt, 1))',
      hint: "Tre <code>int(input(...))</code>. Glöm inte parenteserna: <code>(a + b + c) / 3</code> – annars delas bara <code>c</code> med 3.",
      runs: [
        { inputs: ["70", "80", "90"], test: "assert '80' in _out.strip().split('\\n')[-1], 'Med 70, 80 och 90 ska medelvärdet bli 80 – på sista raden.'" },
        { inputs: ["60", "75", "100"], test: "assert '78.3' in _out.strip().split('\\n')[-1], 'Med 60, 75 och 100 ska medelvärdet bli 78.3… – på sista raden.'" }
      ],
      explain: "Summan delad med antalet. Utan parenteser räknar Python <code>a + b + c / 3</code> – division går före addition, precis som i matten."
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
      id: "p2-kod-svar", part: "p2", type: "code", title: "Ja eller JA?",
      q: "Fråga <code>Gillar du Python?</code>. Svarar användaren ja – oavsett stora bokstäver och mellanslag – ska programmet skriva <code>Toppen!</code>. Annars ska det skriva <code>Synd, ge det en chans till.</code>",
      starter: 'svar = input("Gillar du Python? ")\n',
      solution: 'svar = input("Gillar du Python? ").strip().lower()\nif svar == "ja":\n    print("Toppen!")\nelse:\n    print("Synd, ge det en chans till.")',
      hint: '<code>svar.strip().lower()</code> gör om <code>" JA "</code> till <code>"ja"</code>. Jämför sedan med <code>==</code>.',
      runs: [
        { inputs: ["ja"], contains: ["Toppen!"], excludes: ["Synd"] },
        { inputs: ["  JA "], contains: ["Toppen!"], excludes: ["Synd"] },
        { inputs: ["Ja"], contains: ["Toppen!"], excludes: ["Synd"] },
        { inputs: ["nej"], contains: ["Synd"], excludes: ["Toppen!"] }
      ],
      explain: "Användare skriver på alla möjliga sätt. Att städa svaret innan du jämför gör programmet mycket mer användarvänligt."
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
      id: "p2-while", part: "p2", type: "output", title: "Så länge villkoret är sant",
      q: "Vad skriver programmet ut?",
      code: "n = 1\nwhile n < 20:\n    n = n * 2\nprint(n)",
      answer: "32",
      near: { "16": "Kolla villkoret när <code>n</code> är 16: är 16 &lt; 20? Då blir det ett varv till.", "20": "<code>n</code> dubblas varje varv: 1, 2, 4, 8 …" },
      hint: "Skriv upp värdet på <code>n</code> efter varje varv: 1, 2, 4 … Loopen slutar först när villkoret är falskt.",
      explain: "<code>n</code> blir 2, 4, 8, 16 och 32. När <code>n</code> är 32 är villkoret falskt och loopen slutar. <code>print</code> saknar indrag och körs bara en gång, efter loopen."
    },
    {
      id: "p2-kod-losen", part: "p2", type: "code", title: "Lösenordskoll",
      q: "Fråga efter ett lösenord tills användaren skriver <code>drake</code>. Efter varje fel svar skriver programmet <code>Fel lösenord, försök igen.</code> När svaret är rätt skriver det <code>Välkommen in!</code>",
      starter: "",
      solution: 'losen = input("Lösenord? ")\nwhile losen != "drake":\n    print("Fel lösenord, försök igen.")\n    losen = input("Lösenord? ")\nprint("Välkommen in!")',
      hint: 'Fråga en gång före loopen. Sedan: <code>while losen != "drake":</code> – skriv felmeddelandet och fråga igen inne i loopen.',
      runs: [
        { inputs: ["kalle", "1234", "drake"], contains: ["Fel lösenord", "Välkommen in!"] },
        { inputs: ["drake"], contains: ["Välkommen in!"], excludes: ["Fel lösenord"] }
      ],
      explain: "Loopen snurrar så länge svaret är fel. Programmet vet inte i förväg hur många försök som behövs – därför <code>while</code> och inte <code>for</code>."
    },
    {
      id: "p2-kod-gissa", part: "p2", type: "code", title: "Gissa talet",
      q: "Låt användaren gissa det hemliga talet tills hen hittar det. Efter varje gissning skriver programmet <code>För högt</code>, <code>För lågt</code> eller <code>Rätt!</code> – och vid rätt svar ska loopen sluta.",
      starter: "hemligt = 7   # testet räknar med 7 – byt till ett slumptal när du är klar\n\n",
      solution: 'hemligt = 7\n\nwhile True:\n    gissning = int(input("Gissa ett tal mellan 1 och 20: "))\n    if gissning > hemligt:\n        print("För högt")\n    elif gissning < hemligt:\n        print("För lågt")\n    else:\n        print("Rätt!")\n        break',
      hint: "<code>while True:</code> med en <code>int(input(...))</code> inuti. Jämför med <code>&gt;</code> och <code>&lt;</code>, och avsluta med <code>break</code> när gissningen är rätt.",
      runs: [
        { inputs: ["3", "12", "7"], contains: ["För lågt", "För högt", "Rätt!"] },
        { inputs: ["7"], contains: ["Rätt!"], excludes: ["För högt", "För lågt"] }
      ],
      explain: "Spela på riktigt i Fri lek: lägg till <code>import random</code> och skriv <code>hemligt = random.randint(1, 20)</code>. Bästa strategin är att alltid gissa i mitten – då räcker fem gissningar."
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
    {
      id: "p2-kod-kalk", part: "p2", type: "code", title: "Projekt: miniräknare",
      q: "Bygg en miniräknare. Fråga, i den här ordningen, efter<ol><li>ett tal,</li><li>ett räknesätt: <code>+</code>, <code>-</code>, <code>*</code> eller <code>/</code>,</li><li>ett tal till.</li></ol>" +
        "Skriv ut resultatet. Talen kan vara decimaltal, även med decimalkomma. Skriver användaren ett annat räknesätt ska programmet skriva <code>Okänt räknesätt</code>.",
      starter: "",
      solution: 'a = float(input("Första talet? ").replace(",", "."))\nop = input("Räknesätt (+ - * /)? ").strip()\nb = float(input("Andra talet? ").replace(",", "."))\n\nif op == "+":\n    print(a + b)\nelif op == "-":\n    print(a - b)\nelif op == "*":\n    print(a * b)\nelif op == "/":\n    print(a / b)\nelse:\n    print("Okänt räknesätt")',
      hint: "Tre <code>input()</code>. Räknesättet är text, så jämför med t.ex. <code>op == \"+\"</code>. En <code>elif</code> per räknesätt och <code>else</code> sist.",
      runs: [
        { inputs: ["6", "*", "3"], contains: ["18"] },
        { inputs: ["7", "/", "2"], contains: ["3.5"] },
        { inputs: ["5", "-", "8"], contains: ["-3"] },
        { inputs: ["2,5", "+", "1"], contains: ["3.5"] },
        { inputs: ["2", "%", "3"], contains: ["Okänt räknesätt"] }
      ],
      explain: "Indata, omvandling, villkor och utskrift – i ett riktigt program. Vad händer om någon delar med 0? Prova att lägga till ett eget felmeddelande för det."
    },
    {
      id: "p2-kod-quiz", part: "p2", type: "code", title: "Projekt: frågesport",
      q: "Gör en frågesport. Ställ frågorna i listan <code>fragor</code> en i taget. Är svaret rätt (oavsett stora bokstäver och mellanslag) – skriv <code>Rätt!</code> och ge en poäng. Annars – skriv <code>Fel</code> och det rätta svaret.<br>Sista raden skriver redan ut poängen.",
      starter: 'fragor = ["Vilket programspråk används mest inom AI?", "Vilken funktion läser in svar från användaren?", "Vad är 6 * 7?"]\nsvar = ["python", "input", "42"]\npoang = 0\n\n# Ställ frågorna en i taget och räkna poängen\n\nprint(f"Du fick {poang} av {len(fragor)} poäng")\n',
      solution: 'fragor = ["Vilket programspråk används mest inom AI?", "Vilken funktion läser in svar från användaren?", "Vad är 6 * 7?"]\nsvar = ["python", "input", "42"]\npoang = 0\n\nfor i in range(len(fragor)):\n    gissning = input(fragor[i] + " ").strip().lower()\n    if gissning == svar[i]:\n        print("Rätt!")\n        poang = poang + 1\n    else:\n        print(f"Fel – rätt svar är {svar[i]}.")\n\nprint(f"Du fick {poang} av {len(fragor)} poäng")',
      hint: "<code>for i in range(len(fragor)):</code> ger 0, 1 och 2. Då är <code>fragor[i]</code> frågan och <code>svar[i]</code> det rätta svaret.",
      runs: [
        { inputs: ["Python", "input", "42"], contains: ["3 av 3"] },
        { inputs: ["java", " INPUT ", "42"], contains: ["2 av 3"] },
        { inputs: ["c", "print", "41"], contains: ["0 av 3"] }
      ],
      explain: "Två listor där samma index hör ihop – fråga nummer <code>i</code> och svar nummer <code>i</code>. Lägg till egna frågor i båda listorna, så växer quizet av sig självt."
    },
    {
      id: "p2-kod-inkop", part: "p2", type: "code", title: "Projekt: inköpslista",
      q: "Låt användaren skriva in varor, en i taget, tills hen skriver <code>klar</code>. Skriv sedan ut <code>Du ska köpa 3 saker:</code> (med rätt antal) följt av varorna på var sin rad. Ordet <code>klar</code> ska inte hamna i listan.",
      starter: "varor = []\n\n",
      solution: 'varor = []\n\nwhile True:\n    vara = input("Vara (skriv klar när du är klar): ").strip()\n    if vara == "klar":\n        break\n    varor.append(vara)\n\nprint(f"Du ska köpa {len(varor)} saker:")\nfor vara in varor:\n    print(vara)',
      hint: "<code>while True:</code> + <code>input()</code> + <code>break</code> när svaret är <code>klar</code>, annars <code>varor.append(vara)</code>. Efter loopen: <code>len(varor)</code> och en <code>for</code>-loop.",
      runs: [
        { inputs: ["mjölk", "bröd", "ost", "klar"], test: `
lines = [l.strip() for l in _out.strip().split("\\n")]
rub = [k for k, l in enumerate(lines) if "Du ska köpa" in l]
assert rub, "Skriv ut en rad som börjar med: Du ska köpa"
assert "3" in lines[rub[-1]], "Med mjölk, bröd och ost ska det stå: Du ska köpa 3 saker:"
rest = [l.lstrip("-•*0123456789.) ") for l in lines[rub[-1] + 1:] if l]
assert rest == ["mjölk", "bröd", "ost"], "Efter rubriken ska mjölk, bröd och ost stå på var sin rad – utan klar."
` },
        { inputs: ["klar"], test: `
lines = [l.strip() for l in _out.strip().split("\\n")]
assert any("Du ska köpa" in l and "0" in l for l in lines), "Skriver användaren klar direkt ska det stå: Du ska köpa 0 saker:"
` }
      ],
      explain: "Listan växer med <code>append()</code> så länge användaren vill. Samma mönster – samla in data i en loop – används när man bygger upp träningsdata till en AI."
    },

    /* ---------- 03 Programmera en agent ---------- */
    {
      id: "p3-vad", part: "p3", type: "mc", title: "Vad är agenten?",
      q: "Vad gör funktionen <code>agent</code> i den här delen?",
      options: [
        "Den får ett percept – det agenten uppfattar – och returnerar en handling",
        "Den ritar dammsugaren på skärmen",
        "Den räknar ut hur ren lägenheten är",
        "Den bestämmer var smutsen ska ligga"
      ],
      answer: 0,
      explain: "Världen anropar <code>agent(percept)</code> en gång per steg och utför handlingen som funktionen returnerar."
    },
    {
      id: "p3-handling", part: "p3", type: "output", title: "Vilken handling?",
      q: "Vad skriver programmet ut?",
      code: 'def agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    return "höger"\n\nprint(agent({"smutsig": True, "x": 0}))\nprint(agent({"smutsig": False, "x": 0}))',
      answer: "sug\nhöger",
      explain: "Första anropet får ett smutsigt percept och returnerar <code>sug</code>. Andra gången är rutan ren, så <code>if</code> hoppas över och funktionen returnerar <code>höger</code>."
    },
    {
      id: "p3-kod-tvarum", part: "p3", type: "code", title: "Två rum",
      q: "Världen har två rutor: rum A (<code>x</code> = 0) och rum B (<code>x</code> = 1). Skriv en agent som städar båda:<ul>" +
        "<li>Är rutan smutsig – returnera <code>\"sug\"</code>.</li><li>Annars: står du i A – gå <code>\"höger\"</code>, står du i B – gå <code>\"vänster\"</code>.</li></ul>" +
        "Båda rummen ska vara rena inom 6 steg, oavsett var agenten startar och var smutsen ligger.",
      starter: 'def agent(percept):\n    # percept["smutsig"] är True om rutan är smutsig\n    # percept["x"] är 0 i rum A och 1 i rum B\n    return "vänta"\n',
      solution: 'def agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    elif percept["x"] == 0:\n        return "höger"\n    else:\n        return "vänster"',
      hint: "Tre fall: <code>if percept[\"smutsig\"]:</code>, <code>elif percept[\"x\"] == 0:</code> och <code>else:</code> – med en <code>return</code> i varje.",
      sim: {
        world: { map: "tvarum" }, steps: 6,
        runs: [
          { dirt: [1, 1], start: [0, 0], label: "smuts i båda rummen, start i A" },
          { dirt: [0, 1], start: [0, 0], label: "smuts i B, start i A" },
          { dirt: [1, 0], start: [1, 0], label: "smuts i A, start i B" },
          { dirt: [1, 1], start: [1, 0], label: "smuts i båda rummen, start i B" }
        ],
        goal: { clean: 1 }
      },
      explain: "Det här är världens mest kända agent – den finns i nästan varje lärobok om AI. Tre regler räcker för två rum."
    },
    {
      id: "p3-in", part: "p3", type: "output", title: "Finns det i listan?",
      q: "Vad skriver programmet ut? (Två rader.)",
      code: 'fritt = ["upp", "vänster"]\nif "höger" in fritt:\n    print("höger")\nelif "upp" in fritt:\n    print("upp")\nelse:\n    print("vänta")\nprint(len(fritt))',
      answer: "upp\n2",
      explain: "<code>\"höger\" in fritt</code> är <code>False</code>, men <code>\"upp\" in fritt</code> är <code>True</code>. Listan har två element."
    },
    {
      id: "p3-kod-reflex", part: "p3", type: "code", title: "En reflexagent i lägenheten",
      q: "Nu städar agenten en hel lägenhet. Skriv en enkel reflexagent:<ol>" +
        "<li>Är rutan smutsig – <code>\"sug\"</code>.</li><li>Annars: gå åt första fria hållet i ordningen <b>höger, ner, vänster, upp</b>. Använd <code>in percept[\"fritt\"]</code>.</li></ol>" +
        "Agenten får aldrig köra in i en vägg och ska alltid suga upp smuts den står på. Kör och titta på spåret – blir lägenheten ren?",
      starter: 'def agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    # Gå åt första fria hållet: höger, ner, vänster, upp\n    return "höger"\n',
      solution: 'def agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    elif "höger" in percept["fritt"]:\n        return "höger"\n    elif "ner" in percept["fritt"]:\n        return "ner"\n    elif "vänster" in percept["fritt"]:\n        return "vänster"\n    else:\n        return "upp"',
      hint: "En <code>elif</code> per håll, t.ex. <code>elif \"ner\" in percept[\"fritt\"]:</code> följt av <code>return \"ner\"</code>.",
      sim: {
        world: { map: "lagenhet", observable: "partial" }, steps: 150,
        runs: [{ seed: 1, label: "lägenhet 1" }, { seed: 2, label: "lägenhet 2" }, { seed: 3, label: "lägenhet 3" }],
        goal: { noBump: true, suckDirty: true }
      },
      explain: "Agenten följer sina regler perfekt – men titta på slutet: den åker fram och tillbaka på samma ställe och blir aldrig klar."
    },
    {
      id: "p3-loop", part: "p3", type: "mc", title: "Varför blev den inte klar?",
      q: "Reflexagenten städade bara en del av lägenheten och åkte sedan fram och tillbaka på samma ställe. Varför?",
      options: [
        "Den har inget minne – samma percept ger alltid samma handling, så den hamnar i samma loop",
        "Batteriet tog slut",
        "Python är för långsamt för att städa en hel lägenhet",
        "Den kan inte se smuts"
      ],
      answer: 0,
      explain: "En enkel reflexagent ser bara nuet. När den kommer tillbaka till samma ruta med samma percept gör den exakt samma sak igen – och fastnar i en loop."
    },
    {
      id: "p3-kod-slump", part: "p3", type: "code", title: "Slumpagenten",
      q: "Låt agenten slumpa: suger den inte ska den gå åt ett slumpat fritt håll med <code>random.choice(percept[\"fritt\"])</code>. " +
        "Den ska i snitt få lägenheterna minst <b>85 % rena</b> på 300 steg.",
      starter: 'import random\n\ndef agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    # Välj ett slumpat håll bland de fria\n    return "höger"\n',
      solution: 'import random\n\ndef agent(percept):\n    if percept["smutsig"]:\n        return "sug"\n    return random.choice(percept["fritt"])',
      hint: "Byt sista raden mot <code>return random.choice(percept[\"fritt\"])</code>.",
      sim: {
        world: { map: "lagenhet", observable: "partial" }, steps: 300,
        runs: [{ seed: 1, label: "lägenhet 1" }, { seed: 2, label: "lägenhet 2" }, { seed: 3, label: "lägenhet 3" }],
        goal: { noBump: true, suckDirty: true, avgClean: 0.85 }
      },
      explain: "Slumpen tar agenten ur loopen. Men titta på spåret: den passerar samma rutor många gånger. Med minne kan den göra bättre."
    },
    {
      id: "p3-tupel", part: "p3", type: "output", title: "En lista med rutor",
      q: "Vad skriver programmet ut? (Tre rader.)",
      code: 'besokta = []\nbesokta.append((2, 1))\nbesokta.append((3, 1))\nprint((3, 1) in besokta)\nprint((4, 1) in besokta)\nprint(len(besokta))',
      answer: "True\nFalse\n2",
      explain: "Rutan <code>(3, 1)</code> finns i listan men inte <code>(4, 1)</code>. Listan innehåller två rutor."
    },
    {
      id: "p3-kod-minne", part: "p3", type: "code", title: "En agent med minne",
      q: "Startkoden kommer redan ihåg vilka rutor agenten har besökt. Gör agenten smartare:<ol>" +
        "<li>Gå igenom hållen i <code>percept[\"fritt\"]</code> med en <code>for</code>-loop.</li>" +
        "<li>Använd <code>granne(x, y, hall)</code> för att se vilken ruta hållet leder till. Är den inte besökt – gå dit.</li>" +
        "<li>Finns ingen obesökt granne – slumpa som förut.</li></ol>" +
        "Agenten ska i snitt få lägenheterna minst <b>92 % rena</b> på bara 100 steg. (Slumpagenten klarar ungefär 85 %.)",
      starter: 'import random\n\nbesokta = []   # rutor agenten har varit på – finns kvar mellan stegen\n\ndef granne(x, y, hall):\n    # Vilken ruta hamnar agenten på om den går åt hållet hall?\n    if hall == "upp":\n        return (x, y - 1)\n    elif hall == "ner":\n        return (x, y + 1)\n    elif hall == "höger":\n        return (x + 1, y)\n    else:\n        return (x - 1, y)\n\ndef agent(percept):\n    x = percept["x"]\n    y = percept["y"]\n    if (x, y) not in besokta:\n        besokta.append((x, y))\n    if percept["smutsig"]:\n        return "sug"\n    # Gå till en fri granne som inte finns i besokta\n\n    return random.choice(percept["fritt"])\n',
      solution: 'import random\n\nbesokta = []\n\ndef granne(x, y, hall):\n    if hall == "upp":\n        return (x, y - 1)\n    elif hall == "ner":\n        return (x, y + 1)\n    elif hall == "höger":\n        return (x + 1, y)\n    else:\n        return (x - 1, y)\n\ndef agent(percept):\n    x = percept["x"]\n    y = percept["y"]\n    if (x, y) not in besokta:\n        besokta.append((x, y))\n    if percept["smutsig"]:\n        return "sug"\n    for hall in percept["fritt"]:\n        if granne(x, y, hall) not in besokta:\n            return hall\n    return random.choice(percept["fritt"])',
      hint: "<code>for hall in percept[\"fritt\"]:</code> och inuti <code>if granne(x, y, hall) not in besokta:</code> följt av <code>return hall</code>.",
      sim: {
        world: { map: "lagenhet", observable: "partial" }, steps: 100,
        runs: [{ seed: 1, label: "lägenhet 1" }, { seed: 2, label: "lägenhet 2" }, { seed: 3, label: "lägenhet 3" }],
        goal: { noBump: true, suckDirty: true, avgClean: 0.92 }
      },
      explain: "Med en enkel modell av världen – listan med besökta rutor – utforskar agenten systematiskt i stället för att irra runt."
    },
    {
      id: "p3-kod-batteri", part: "p3", type: "code", title: "Hinn hem innan batteriet tar slut",
      q: "I det här rummet räcker batteriet bara till 40 handlingar, men agenten ska städa i 300 steg. Lägg till två regler <b>först</b> i agenten:<ol>" +
        "<li>Står agenten på laddaren (<code>avstand == 0</code>) och batteriet är under 40 – <code>\"vänta\"</code> (då laddas den).</li>" +
        "<li>Är batteriet nere på <code>avstand + 3</code> eller lägre – gå hem med <code>hem(x, y, lx, ly)</code>.</li></ol>" +
        "Batteriet får aldrig ta slut, och rummen ska i snitt bli minst <b>90 % rena</b>.",
      starter: 'import random\n\nbesokta = []\n\ndef granne(x, y, hall):\n    if hall == "upp":\n        return (x, y - 1)\n    elif hall == "ner":\n        return (x, y + 1)\n    elif hall == "höger":\n        return (x + 1, y)\n    else:\n        return (x - 1, y)\n\ndef hem(x, y, lx, ly):\n    # Ett steg närmare laddaren (rummet har inga väggar i vägen)\n    if x > lx:\n        return "vänster"\n    elif x < lx:\n        return "höger"\n    elif y > ly:\n        return "upp"\n    else:\n        return "ner"\n\ndef agent(percept):\n    x = percept["x"]\n    y = percept["y"]\n    lx, ly = percept["laddare"]\n    batteri = percept["batteri"]\n    avstand = abs(x - lx) + abs(y - ly)\n\n    # Lägg till dina två batteriregler här\n\n    if (x, y) not in besokta:\n        besokta.append((x, y))\n    if percept["smutsig"]:\n        return "sug"\n    for hall in percept["fritt"]:\n        if granne(x, y, hall) not in besokta:\n            return hall\n    return random.choice(percept["fritt"])\n',
      solution: 'import random\n\nbesokta = []\n\ndef granne(x, y, hall):\n    if hall == "upp":\n        return (x, y - 1)\n    elif hall == "ner":\n        return (x, y + 1)\n    elif hall == "höger":\n        return (x + 1, y)\n    else:\n        return (x - 1, y)\n\ndef hem(x, y, lx, ly):\n    if x > lx:\n        return "vänster"\n    elif x < lx:\n        return "höger"\n    elif y > ly:\n        return "upp"\n    else:\n        return "ner"\n\ndef agent(percept):\n    x = percept["x"]\n    y = percept["y"]\n    lx, ly = percept["laddare"]\n    batteri = percept["batteri"]\n    avstand = abs(x - lx) + abs(y - ly)\n\n    if avstand == 0 and batteri < 40:\n        return "vänta"\n    if batteri <= avstand + 3:\n        return hem(x, y, lx, ly)\n\n    if (x, y) not in besokta:\n        besokta.append((x, y))\n    if percept["smutsig"]:\n        return "sug"\n    for hall in percept["fritt"]:\n        if granne(x, y, hall) not in besokta:\n            return hall\n    return random.choice(percept["fritt"])',
      hint: "<code>if avstand == 0 and batteri &lt; 40:</code> → <code>return \"vänta\"</code>. Sedan <code>if batteri &lt;= avstand + 3:</code> → <code>return hem(x, y, lx, ly)</code>.",
      sim: {
        world: { map: "oppen", observable: "partial", battery: true }, steps: 300,
        runs: [{ seed: 1, label: "rum 1" }, { seed: 2, label: "rum 2" }, { seed: 3, label: "rum 3" }],
        goal: { alive: true, noBump: true, avgClean: 0.9 }
      },
      explain: "Agenten väger nu att städa mot risken att bli stående. Marginalen <code>+ 3</code> är ett val – vad händer med <code>+ 0</code>? Prova!"
    },
    {
      id: "p3-nytta", part: "p3", type: "mc", title: "Mål eller nytta?",
      q: "Varför räcker det inte att agenten har målet \"städa allt\" när den har ett batteri?",
      options: [
        "Den måste väga nyttan av att städa mer mot risken att batteriet tar slut",
        "Med batteri kan agenten inte se smutsen",
        "Målet blir lättare att nå med batteri",
        "Det räcker – batteriet spelar ingen roll"
      ],
      answer: 0,
      explain: "En nyttobaserad agent jämför hur bra olika val är. Att städa en ruta till är bra – men inte om agenten då aldrig kommer hem."
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
