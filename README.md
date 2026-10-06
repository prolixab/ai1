# AI 1 — Kursmaterial

Digitalt kursmaterial för **AI 1** på Teknikprogrammet vid Erik Dahlbergsgymnasiet, Jönköping.

## Filstruktur

```
/
├── index.html          ← Startsida / materialöversikt
├── assembler/
│   └── index.html      ← Assembler-simulator (maskinspråk)
└── README.md
```

## Publicera på GitHub Pages

1. Skapa ett nytt GitHub-repository (t.ex. `ai1-material`)
2. Ladda upp alla filer — behåll mappstrukturen
3. Gå till **Settings → Pages**
4. Under *Source*: välj **Deploy from a branch** → `main` → `/ (root)`
5. Klicka **Save** — sidan är live på `https://<användarnamn>.github.io/ai1-material/`

## Lägg till nytt material

Skapa en ny mapp, t.ex. `talsystem/`, med en `index.html` inuti.
Lägg sedan till ett kort i `index.html` på startsidan som pekar dit.

## Python för AI – övning och lärarvy

`python-for-ai/` innehåller en övning (index.html) där eleven anger namn och
framstegen sparas i webbläsaren, samt en lärarvy (`larare.html`, inte länkad
från startsidan). Uppgifterna ligger i `python-for-ai/ovningar.js`.

GitHub Pages kan inte köra serverkod, så framstegen skickas till en
Vercel-funktion (`api/progress.js` i repot `prolixab/courses`). Adressen står i
`api` överst i `ovningar.js`. Är den tom fungerar övningen ändå, och läraren kan
samla in framstegen via elevernas *framstegskoder*.
