// Baut docs/design-vorschau/altbestand.html aus docs/design-system/tokens/*.json
// Zeigt das Designkonzept vom 2026-04-27, extrahiert aus dem Vorgaengercode.
// Aufruf: node docs/design-vorschau/build-altbestand.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const hier = dirname(fileURLToPath(import.meta.url))
const wurzel = join(hier, '..', '..')
const lies = (p) => JSON.parse(readFileSync(join(wurzel, 'docs/design-system/tokens', p), 'utf8'))

const farben = lies('colors.json')
const L = farben.lightTheme
const D = farben.darkTheme

// Tailwind-Verlaufsklassen in echte CSS-Verlaeufe uebersetzen
const tw = {
  'green-500':'#22c55e','teal-400':'#2dd4bf','orange-500':'#f97316','red-500':'#ef4444',
  'blue-600':'#2563eb','indigo-600':'#4f46e5','purple-500':'#a855f7','pink-500':'#ec4899',
  'teal-500':'#14b8a6','cyan-500':'#06b6d4','blue-500':'#3b82f6','rose-500':'#f43f5e',
  'blue-50':'#eff6ff','indigo-50':'#eef2ff',
}
const verlauf = (s) => {
  const [von, bis] = s.split(' ').map(x => tw[x.replace(/^(from|to)-/, '')])
  return `linear-gradient(135deg, ${von}, ${bis})`
}

const module = [
  { id:'nutrition',   name:'Ernährung',   emoji:'🍽️', kpis:[['Kalorien','1.840','🔥'],['Protein','142 g','💪'],['Wasser','2,1 L','💧']] },
  { id:'training',    name:'Training',    emoji:'🏋️', kpis:[['Sätze','24','📊'],['Volumen','8,4 t','⚡'],['Dauer','62 min','⏱️']] },
  { id:'recovery',    name:'Erholung',    emoji:'😴', kpis:[['Schlaf','7 h 20','🌙'],['HRV','58 ms','❤️'],['Ruhepuls','52','📉']] },
  { id:'supplements', name:'Supplemente', emoji:'💊', kpis:[['Heute','4 / 6','✅'],['Vorrat','18 Tage','📦'],['Kosten','42 €','💶']] },
  { id:'goals',       name:'Ziele',       emoji:'🎯', kpis:[['Aktiv','3','🎯'],['Fortschritt','68 %','📈'],['Frist','12 Tage','📅']] },
  { id:'medical',     name:'Medizin',     emoji:'🩺', kpis:[['Werte','12','🧪'],['Auffällig','1','⚠️'],['Letzter','04.07.','📆']] },
]

const kachel = (m) => `
  <div class="modul">
    <div class="kopf" style="background:${verlauf(farben.gradients[m.id])}">
      <div class="titelzeile"><span class="emoji">${m.emoji}</span>
        <div><h3>${m.name}</h3><p>Dein Tagesprotokoll</p></div></div>
      <div class="kpis">${m.kpis.map(([l,w,e]) =>
        `<div class="kpi"><span class="kpi-e">${e}</span><span class="kpi-w">${w}</span><span class="kpi-l">${l}</span></div>`).join('')}</div>
    </div>
    <div class="karte">
      <div class="karte-kopf"><h4>Heute</h4><span class="meta">vor 2 Std.</span></div>
      <p class="abschnitt">ÜBERSICHT</p>
      <div class="zeile"><span>Frühstück</span><b>420 kcal</b></div>
      <div class="zeile"><span>Mittagessen</span><b>780 kcal</b></div>
      <div class="zeile"><span>Abendessen</span><b>640 kcal</b></div>
    </div>
  </div>`

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>LumeOS — Designkonzept Altbestand (2026-04-27)</title>
<style>
* { box-sizing:border-box; }
body { margin:0; padding:28px; background:${L.surface.page.value}; color:${L.text.primary.value};
       font-family:system-ui,-apple-system,'Segoe UI',sans-serif; font-size:14px;
       -webkit-font-smoothing:antialiased; }
h1 { font-size:19px; margin:0 0 4px; }
.warnung { background:#fef3c7; border:1px solid #fcd34d; color:#78350f;
           border-radius:12px; padding:14px 16px; margin:0 0 26px; max-width:80ch; font-size:13px; }
.warnung b { display:block; margin-bottom:4px; }
h2 { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.08em;
     color:${L.text.subtle.value}; margin:32px 0 12px; }
.raster { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
.modul { display:flex; flex-direction:column; gap:12px; }
.kopf { border-radius:12px; padding:18px; color:#fff; box-shadow:0 10px 15px -3px rgba(0,0,0,.1); }
.titelzeile { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.emoji { font-size:26px; }
.kopf h3 { margin:0; font-size:17px; font-weight:700; }
.kopf p { margin:2px 0 0; font-size:12px; opacity:.85; }
.kpis { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.kpi { background:rgba(255,255,255,.15); backdrop-filter:blur(4px);
       border-radius:12px; padding:10px; text-align:center; }
.kpi-e { display:block; font-size:14px; }
.kpi-w { display:block; font-weight:700; font-size:15px; margin-top:2px; }
.kpi-l { display:block; font-size:10px; opacity:.85; }
.karte { background:${L.surface.card.value}; border:1px solid ${L.surface.border.value};
         border-radius:12px; padding:20px; }
.karte-kopf { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.karte-kopf h4 { margin:0; font-size:17px; font-weight:700; }
.meta { font-size:13px; color:${L.text.muted.value}; }
.abschnitt { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.05em;
             color:${L.text.subtle.value}; margin:0 0 10px; }
.zeile { display:flex; align-items:center; justify-content:space-between; padding:5px 0; }
.zeile span { font-size:13px; color:${L.text.secondary.value}; }
.zeile b { font-size:13px; font-weight:600; color:${L.text.primary.value}; }
.leiste { background:${L.surface.card.value}; border:1px solid ${L.surface.border.value};
          border-radius:12px; padding:12px; width:230px; }
.nav { display:flex; align-items:center; gap:12px; border-radius:8px;
       padding:9px 12px; font-size:14px; color:${L.text.tertiary.value}; }
.nav.aktiv { background:#f0fdf4; color:#15803d; font-weight:500;
             border-left:3px solid ${farben.effects.sidebarIndicator.value}; }
.buddy { background:${verlauf(farben.gradients.buddy_card)}; border:1px solid #dbeafe;
         border-radius:8px; padding:16px; box-shadow:0 4px 6px -1px rgba(0,0,0,.1); max-width:75%; }
.buddy h4 { margin:0 0 8px; font-size:14px; font-weight:600; color:#1f2937; }
.buddy p { margin:0 0 14px; font-size:14px; color:${L.text.secondary.value}; }
.knopf { background:${farben.brand['600'].value}; color:#fff; border:none;
         border-radius:8px; padding:8px 14px; font:inherit; font-size:13px; cursor:pointer; }
.knopf.zweit { background:#fff; color:${L.text.secondary.value};
               border:1px solid ${L.surface.border.value}; }
.abzeichen { display:inline-block; padding:3px 10px; border-radius:99px; font-size:12px; margin-right:6px; }
.flex { display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap; }
</style>
</head>
<body>
<h1>LumeOS — Designkonzept Altbestand</h1>
<div class="warnung">
  <b>Das ist nicht der aktuelle Stand.</b>
  Erzeugt aus <code>docs/design-system/tokens/*.json</code>, generiert am 2026-04-27
  durch AST-Analyse von 534 TSX-Dateien des Vorgängercodes (<code>apps/app/modules/**</code>).
  Diese App existiert nicht mehr. Der heutige Stand ist dunkel als Voreinstellung mit
  OKLCH-Tokens — siehe <code>tokens.html</code>.
</div>

<h2>Modulidentität — Verlaufskopf mit Emoji und Kennzahlen</h2>
<div class="raster">${module.map(kachel).join('')}</div>

<h2>Navigation und Buddy-Karte</h2>
<div class="flex">
  <div class="leiste">
    <p class="abschnitt" style="padding:0 12px">MODULE</p>
    <div class="nav aktiv"><span style="font-size:17px">🍽️</span> Ernährung</div>
    <div class="nav"><span style="font-size:17px">🏋️</span> Training</div>
    <div class="nav"><span style="font-size:17px">😴</span> Erholung</div>
    <div class="nav"><span style="font-size:17px">🎯</span> Ziele</div>
  </div>
  <div style="flex:1;min-width:280px">
    <div class="buddy">
      <h4>Buddy</h4>
      <p>Du liegst heute 320 kcal unter deinem Ziel. Soll ich einen Snack vorschlagen?</p>
      <button class="knopf">Vorschlag ansehen</button>
      <button class="knopf zweit">Später</button>
    </div>
    <div class="karte" style="margin-top:14px">
      <p class="abschnitt">STATUS</p>
      <span class="abzeichen" style="background:#dcfce7;color:#15803d">im Ziel</span>
      <span class="abzeichen" style="background:#fef9c3;color:#854d0e">knapp</span>
      <span class="abzeichen" style="background:#fee2e2;color:#991b1b">darüber</span>
    </div>
  </div>
</div>
</body>
</html>`

writeFileSync(join(hier, 'altbestand.html'), html, 'utf8')
console.log(`altbestand.html geschrieben: ${module.length} Module, ${Object.keys(farben.gradients).length - 1} Verläufe`)
