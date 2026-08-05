// Baut docs/design-vorschau/index.html
// Findet alle Vorschauen automatisch. Neue Datei anlegen, Eintrag in BESCHREIBUNG
// ergaenzen (optional), Skript laufen lassen - fertig.
// Aufruf: node docs/design-vorschau/build-index.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const hier = dirname(fileURLToPath(import.meta.url))
const wurzel = join(hier, '..', '..')
const css = readFileSync(join(wurzel, 'apps/web/src/app/globals.css'), 'utf8')
const block = (re) => (css.match(re)?.[1] ?? '').trim()
const rootBlock  = block(/:root\s*\{([\s\S]*?)\}/)
const lightBlock = block(/\[data-theme="light"\]\s*\{([\s\S]*?)\}/)

// Reihenfolge und Beschreibung. Unbekannte Dateien landen automatisch unten.
const BESCHREIBUNG = {
  'themes.html': {
    gruppe: 'Referenz', titel: 'Themes & Komponenten',
    text: 'Vier Themes, je Tag- und Nachtmodus, an neun Komponenten-Primitiven aus den Moduldokumentationen. Umschalter oben, Tastatur: 1–4 und T. Ersetzt das Durchklicken durch Einzelseiten.',
    marke: 'Vergleich',
  },
  'tokens.html': {
    gruppe: 'Referenz', titel: 'Tokens',
    text: 'Alle Farbwerte, Radien, Abstände und die Schrift als Proben. Dunkel und Hell, mit Vermerk, welche Tokens im Hellmodus abweichen.',
    marke: 'Grundlage',
  },
  'altbestand.html': {
    gruppe: 'Referenz', titel: 'Altbestand',
    text: 'Das Konzept vom 27. April, rekonstruiert aus den Token-Dateien des Vorgängercodes. Verlaufsköpfe, Emoji-Anker, helle Flächen.',
    marke: 'historisch',
  },
  'variante-a-instrumententafel.html': {
    gruppe: 'Richtungen', titel: 'A — Instrumententafel',
    text: 'Verdichtung statt Anzeige. Aus vielen Signalen wird eine Zahl, danach drei Stufen: Überblick, Verlauf, Detail.',
    marke: 'WHOOP-Linie',
  },
  'variante-b-bento.html': {
    gruppe: 'Richtungen', titel: 'B — Bento',
    text: 'Die Kachelfläche kommuniziert Priorität, bevor jemand ein Wort liest. Eine Layoutsprache, keine Ästhetik.',
    marke: 'Layout',
  },
  'variante-c-glas.html': {
    gruppe: 'Richtungen', titel: 'C — Liquid Glass',
    text: 'Glas trennt Ebenen ohne zusätzliche Farben. Nur für Navigation und Dialoge — kein Datenwert steht auf Unschärfe.',
    marke: 'Tiefe',
  },
  'variante-d-narrativ.html': {
    gruppe: 'Richtungen', titel: 'D — Datennarrativ',
    text: 'Der Wochenrückblick als Erzählung in vier Kapiteln. Die einzige Variante, die einen Zusammenhang erklärt statt Werte zu zeigen.',
    marke: 'Buddy',
  },
  'variante-e-klinik.html': {
    gruppe: 'Richtungen', titel: 'E — Ruhige Klinik',
    text: 'Körperkarte und Referenzbereiche als Fläche statt Grenzwert. Startet im Hellmodus. Ohne Dringlichkeit.',
    marke: 'Medizin',
  },
}

const dateien = readdirSync(hier)
  .filter(f => f.endsWith('.html') && f !== 'index.html')
  .sort()

const eintrag = (f) => {
  const m = BESCHREIBUNG[f] ?? {
    gruppe: 'Weitere', titel: f.replace(/\.html$/, '').replace(/[-_]/g, ' '),
    text: 'Noch nicht beschrieben — Eintrag in build-index.mjs ergänzen.', marke: 'neu',
  }
  const kb = Math.round(statSync(join(hier, f)).size / 1024)
  return { datei: f, kb, ...m }
}

const alle = dateien.map(eintrag)
const gruppen = ['Referenz', 'Richtungen', 'Weitere']
  .map(g => ({ name: g, posten: alle.filter(a => a.gruppe === g) }))
  .filter(g => g.posten.length)

const karte = (e) => `
  <a class="karte" href="${e.datei}">
    <div class="oben"><h3>${e.titel}</h3><span class="marke">${e.marke}</span></div>
    <p>${e.text}</p>
    <div class="unten"><code>${e.datei}</code><span>${e.kb} KB</span></div>
  </a>`

const html = `<!doctype html>
<html lang="de" data-theme="dark">
<head>
<meta charset="utf-8">
<title>LumeOS — Designvorschau</title>
<style>
:root { ${rootBlock} }
[data-theme="light"] { ${lightBlock} }
* { box-sizing:border-box; }
body { margin:0; padding:34px 26px 60px; background:var(--bg); color:var(--fg);
       font-family:var(--font-mono); font-size:13px; line-height:1.55; }
.huelle { max-width:1000px; margin:0 auto; }
header { display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; margin-bottom:8px; }
h1 { font-size:19px; margin:0; letter-spacing:-.01em; }
.stand { font-size:11px; color:var(--fg-dim); }
button { font:inherit; cursor:pointer; background:var(--surface); color:var(--fg);
         border:1px solid var(--border-strong); border-radius:var(--radius-sm);
         padding:5px 11px; margin-left:auto; }
button:hover { background:var(--surface-hover); }
.lead { color:var(--fg-subtle); max-width:76ch; margin:0 0 30px; }
h2 { font-size:10px; text-transform:uppercase; letter-spacing:.09em; font-weight:600;
     color:var(--fg-dim); margin:30px 0 12px; }
.raster { display:grid; grid-template-columns:repeat(auto-fill,minmax(288px,1fr)); gap:13px; }
.karte { display:block; text-decoration:none; color:inherit;
         background:var(--surface); border:1px solid var(--border);
         border-radius:var(--radius-lg); padding:17px;
         transition:transform .22s cubic-bezier(.16,1,.3,1), border-color .22s, background .22s; }
.karte:hover { transform:translateY(-2px); border-color:var(--acc); background:var(--surface-hover); }
.oben { display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.karte h3 { margin:0; font-size:14px; font-weight:600; }
.marke { font-size:10px; color:var(--fg-dim); border:1px solid var(--border);
         border-radius:99px; padding:1px 8px; white-space:nowrap; }
.karte p { color:var(--fg-muted); margin:9px 0 13px; font-size:12px; }
.unten { display:flex; justify-content:space-between; align-items:baseline;
         font-size:10px; color:var(--fg-dim); border-top:1px solid var(--border); padding-top:9px; }
.unten code { color:var(--fg-subtle); }
.fuss { margin-top:36px; padding-top:18px; border-top:1px solid var(--border);
        color:var(--fg-dim); font-size:11px; max-width:76ch; }
.fuss code { color:var(--fg-subtle); }
@media (prefers-reduced-motion: reduce) { * { transition-duration:.01ms !important; } }
</style>
</head>
<body>
<div class="huelle">
  <header>
    <h1>LumeOS — Designvorschau</h1>
    <span class="stand">${alle.length} Seiten</span>
    <button onclick="const h=document.documentElement;h.dataset.theme=h.dataset.theme==='light'?'dark':'light'">Theme</button>
  </header>
  <p class="lead">Alle Seiten ziehen ihre Farbwerte beim Erzeugen aus
    <code>apps/web/src/app/globals.css</code> — sie zeigen keine Kopie, sondern das,
    was die App hat. Keine davon ist eine Entscheidung.</p>

  ${gruppen.map(g => `<h2>${g.name}</h2><div class="raster">${g.posten.map(karte).join('')}</div>`).join('')}

  <p class="fuss">Neu erzeugen nach Änderungen an <code>globals.css</code>:<br>
    <code>node docs/design-vorschau/build.mjs</code> ·
    <code>build-varianten.mjs</code> ·
    <code>build-altbestand.mjs</code> ·
    <code>build-index.mjs</code><br><br>
    Eine neue Variante wird hier automatisch gefunden. Beschreibung in
    <code>build-index.mjs</code> unter <code>BESCHREIBUNG</code> ergänzen,
    sonst erscheint sie unter „Weitere".</p>
</div>
</body>
</html>`

writeFileSync(join(hier, 'index.html'), html, 'utf8')
console.log(`index.html geschrieben: ${alle.length} Seiten in ${gruppen.length} Gruppen`)
