# AI 1 — Kursmaterial

Digitalt kursmaterial för **AI 1** på Teknikprogrammet vid Erik Dahlbergsgymnasiet, Jönköping.

## Filstruktur

```
/
├── index.html          ← Startsida / materialöversikt
├── assembler/
│   └── index.html      ← Assembler-simulator (maskinspråk)
├── data-i-datorn/
│   └── index.html      ← Så lagras data (bitar, byte, text, bilder, minne)
└── README.md
```

## Publicering

Sidan publiceras med **Coolify** från grenen `main`. Det är en helt statisk
webbplats: inga byggsteg, bara HTML, CSS och JavaScript som serveras som de är.

- Varje sida har `<meta charset="utf-8">`, så att å, ä och ö visas rätt även om
  webbservern inte skickar teckenkodningen.
- Använd relativa länkar mellan sidorna (t.ex. `../perceptron/`), så att
  materialet fungerar oavsett vilken domän det ligger på.

## Lägg till nytt material

Skapa en ny mapp, t.ex. `talsystem/`, med en `index.html` inuti.
Lägg sedan till ett kort i `index.html` på startsidan som pekar dit.

## Python för AI – övning och lärarvy

`python-for-ai/` innehåller en övning (index.html) där eleven anger namn och
framstegen sparas i webbläsaren, samt en lärarvy (`larare.html`, inte länkad
från startsidan). Uppgifterna ligger i `python-for-ai/ovningar.js`.

Webbplatsen är statisk och kör ingen serverkod, så framstegen skickas till en
Vercel-funktion (`api/progress.js` i repot `prolixab/courses`). Adressen står i
`api` överst i `ovningar.js`. Är den tom fungerar övningen ändå, och läraren kan
samla in framstegen via elevernas *framstegskoder*.
