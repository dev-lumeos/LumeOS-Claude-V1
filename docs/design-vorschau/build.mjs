// Baut docs/design-vorschau/tokens.html aus apps/web/src/app/globals.css
// Aufruf: node docs/design-vorschau/build.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const hier = dirname(fileURLToPath(import.meta.url))
const wurzel = join(hier, '..', '..')
const css = readFileSync(join(wurzel, 'apps/web/src/app/globals.css'), 'utf8')

const block = (re) => (css.match(re)?.[1] ?? '').trim()
const rootBlock  = block(/:root\s*\{([\s\S]*?)\}/)
const lightBlock = block(/\[data-theme="light"\]\s*\{([\s\S]*?)\}/)

const namen = (b) => [...b.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
  .map(([, name, wert]) => ({ name, wert: wert.trim() }))

const rootTokens  = namen(rootBlock)
const lightTokens = namen(lightBlock)
const lightNamen  = new Set(lightTokens.map(t => t.name))

const gruppen = [
  { titel: 'Flächen',   art: 'farbe', tokens: ['--bg','--bg-elev','--surface','--surface-2','--surface-hover'] },
  { titel: 'Ränder',    art: 'farbe', tokens: ['--border','--border-strong'] },
  { titel: 'Text',      art: 'farbe', tokens: ['--fg','--fg-muted','--fg-subtle','--fg-dim'] },
  { titel: 'Status',    art: 'farbe', tokens: ['--pos','--warn','--neg'] },
  { titel: 'Akzente je Modul und App', art: 'farbe', tokens: ['--acc-dash','--acc-nutri','--acc-train','--acc-recov','--acc-suppl','--acc-goals','--acc-medic','--acc-coach','--acc-buddy','--acc-mkt','--acc-admin','--acc'] },
  { titel: 'Radien',    art: 'radius', tokens: ['--radius-sm','--radius','--radius-lg'] },
  { titel: 'Abstände',  art: 'mass',   tokens: ['--pad-card'] },
  { titel: 'Schrift',   art: 'schrift',tokens: ['--font-mono'] },
]

const wertVon = (n) => rootTokens.find(t => t.name === n)?.wert ?? ''
const uebersteuert = (n) => lightNamen.has(n)

const feld = (g, n) => {
  const w = wertVon(n)
  const marke = uebersteuert(n) ? '<span class="hell">hell abweichend</span>' : ''
  if (g.art === 'farbe')
    return `<div class="feld"><div class="probe" style="background:var(${n})"></div>
      <code>${n}</code><span class="wert">${w}</span>${marke}</div>`
  if (g.art === 'radius')
    return `<div class="feld"><div class="probe rad" style="border-radius:var(${n})"></div>
      <code>${n}</code><span class="wert">${w}</span></div>`
  if (g.art === 'mass')
    return `<div class="feld"><div class="probe mass"><i style="width:var(${n})"></i></div>
      <code>${n}</code><span class="wert">${w}</span></div>`
  return `<div class="feld breit"><div class="probe schrift">0123456789 · Käse Nüsse · ${w.split(',')[0]}</div>
      <code>${n}</code><span class="wert">${w}</span></div>`
}

const abschnitte = gruppen.map(g => `
  <section>
    <h2>${g.titel}</h2>
    <div class="raster">${g.tokens.filter(n => wertVon(n)).map(n => feld(g, n)).join('')}</div>
  </section>`).join('')

const html = `<!doctype html>
<html lang="de" data-theme="dark">
<head>
<meta charset="utf-8">
<title>LumeOS — Design-Tokens</title>
<style>
:root { ${rootBlock} }
[data-theme="light"] { ${lightBlock} }
* { box-sizing: border-box; }
body { margin:0; padding:32px; background:var(--bg); color:var(--fg);
       font-family:var(--font-mono); font-size:13px; line-height:1.5; }
header { display:flex; align-items:baseline; gap:16px; margin-bottom:8px; }
h1 { font-size:18px; margin:0; }
.hinweis { color:var(--fg-subtle); margin:0 0 28px; max-width:70ch; }
button { font:inherit; cursor:pointer; background:var(--surface); color:var(--fg);
         border:1px solid var(--border-strong); border-radius:var(--radius-sm); padding:6px 12px; }
button:hover { background:var(--surface-hover); }
section { margin-bottom:32px; }
h2 { font-size:11px; text-transform:uppercase; letter-spacing:.08em;
     color:var(--fg-dim); margin:0 0 12px; }
.raster { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:12px; }
.feld { background:var(--surface); border:1px solid var(--border);
        border-radius:var(--radius); padding:var(--pad-card); }
.feld.breit { grid-column:1/-1; }
.probe { height:44px; border-radius:var(--radius-sm); border:1px solid var(--border); }
.probe.rad { background:var(--surface-2); }
.probe.mass { background:transparent; border:none; display:flex; align-items:center; }
.probe.mass i { display:block; height:14px; background:var(--acc); border-radius:2px; }
.probe.schrift { border:none; height:auto; font-size:15px; padding:6px 0; }
code { display:block; margin-top:8px; color:var(--fg); }
.wert { display:block; color:var(--fg-subtle); font-size:11px; word-break:break-all; }
.hell { display:inline-block; margin-top:6px; font-size:10px; color:var(--warn); }
.beispiele { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }
.karte { background:var(--surface); border:1px solid var(--border);
         border-radius:var(--radius); padding:var(--pad-card); }
.karte h3 { margin:0 0 10px; font-size:14px; }
.zeile { display:flex; justify-content:space-between; padding:5px 0;
         border-bottom:1px solid var(--border); }
.zeile:last-child { border-bottom:none; }
.zeile span:last-child { color:var(--fg); }
.zeile span:first-child { color:var(--fg-muted); }
.abzeichen { display:inline-block; padding:2px 8px; border-radius:99px; font-size:11px;
             border:1px solid var(--border-strong); }
.knopf { background:var(--acc); color:var(--bg); border:none; border-radius:var(--radius-sm);
         padding:7px 14px; font:inherit; }
</style>
</head>
<body>
<header>
  <h1>LumeOS — Design-Tokens</h1>
  <button onclick="const h=document.documentElement;h.dataset.theme=h.dataset.theme==='light'?'dark':'light'">Theme wechseln</button>
</header>
<p class="hinweis">Erzeugt aus <code style="display:inline">apps/web/src/app/globals.css</code>.
${rootTokens.length} Tokens in <code style="display:inline">:root</code>,
davon ${lightTokens.length} im Hellmodus überschrieben.
Diese Seite liest keine Kopie — was hier steht, hat die App.</p>
${abschnitte}
<section>
  <h2>Zusammengesetzt</h2>
  <div class="beispiele">
    <div class="karte">
      <h3>Tageswerte</h3>
      <div class="zeile"><span>Energie</span><span>1.840 kcal</span></div>
      <div class="zeile"><span>Protein</span><span>142 g</span></div>
      <div class="zeile"><span>Kohlenhydrate</span><span>186 g</span></div>
    </div>
    <div class="karte">
      <h3>Status</h3>
      <p><span class="abzeichen" style="color:var(--pos);border-color:var(--pos)">im Ziel</span>
         <span class="abzeichen" style="color:var(--warn);border-color:var(--warn)">knapp</span>
         <span class="abzeichen" style="color:var(--neg);border-color:var(--neg)">darüber</span></p>
      <button class="knopf">Eintragen</button>
    </div>
    <div class="karte" style="background:var(--bg-elev)">
      <h3>Erhöhte Fläche</h3>
      <div class="zeile"><span>--bg-elev</span><span>hebt sich ab</span></div>
      <div class="zeile"><span>--surface-2</span><span style="background:var(--surface-2);padding:2px 8px;border-radius:var(--radius-sm)">Feld</span></div>
    </div>
  </div>
</section>
</body>
</html>`

writeFileSync(join(hier, 'tokens.html'), html, 'utf8')
console.log(`tokens.html geschrieben: ${rootTokens.length} Tokens, ${lightTokens.length} Hell-Überschreibungen`)
