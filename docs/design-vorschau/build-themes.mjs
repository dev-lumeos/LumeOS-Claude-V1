// Baut docs/design-vorschau/themes.html
// Eine Seite: vier Themes x zwei Modi x neun Komponenten-Primitive.
// Umschalter oben, kein Klicken durch Einzelseiten.
// Das Theme "bestand" zieht live aus apps/web/src/app/globals.css.
// Aufruf: node docs/design-vorschau/build-themes.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const hier = dirname(fileURLToPath(import.meta.url))
const wurzel = join(hier, '..', '..')
const css = readFileSync(join(wurzel, 'apps/web/src/app/globals.css'), 'utf8')
const block = (re) => (css.match(re)?.[1] ?? '').trim()
const bestandDark = block(/:root\s*\{([\s\S]*?)\}/)
const bestandLight = block(/\[data-theme="light"\]\s*\{([\s\S]*?)\}/)

// Zustandsrampe: sechs Stufen, Helligkeit streng monoton fallend.
// Genau das leistet die aktuelle Palette nicht - alle elf Akzente liegen
// zwischen L 0,74 und 0,80 und trennen sich nur ueber den Farbton.
const rampeDunkel = `
  --s1: oklch(0.88 0.13 152); --s2: oklch(0.81 0.12 140);
  --s3: oklch(0.74 0.13 95);  --s4: oklch(0.67 0.14 62);
  --s5: oklch(0.60 0.16 32);  --s6: oklch(0.53 0.19 22);`
const rampeHell = `
  --s1: oklch(0.72 0.14 152); --s2: oklch(0.66 0.13 140);
  --s3: oklch(0.60 0.14 95);  --s4: oklch(0.55 0.15 62);
  --s5: oklch(0.49 0.17 32);  --s6: oklch(0.43 0.20 22);`

const gemeinsam = `
  --radius: 8px; --radius-sm: 4px; --radius-lg: 12px; --pad-card: 16px;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  --font-ui: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;`

const THEMES = {
  instrument: {
    titel: 'Instrument',
    text: 'Fast-Schwarz, ein Mintakzent, Monospace durchgehend, HUD-Rahmen mit Passermarken. Aus dem Recovery-Deck. Panels haengen am Raster statt frei zu liegen.',
    radius: '2px', raster: 'an', marken: 'an', schrift: 'mono',
    dark: `--bg:oklch(0.135 0.010 158); --bg-elev:oklch(0.165 0.012 158);
      --surface:oklch(0.185 0.012 158); --surface-2:oklch(0.215 0.012 158);
      --border:oklch(0.275 0.014 158); --border-strong:oklch(0.380 0.020 158);
      --fg:oklch(0.955 0.010 158); --fg-muted:oklch(0.760 0.020 158);
      --fg-subtle:oklch(0.600 0.020 158); --fg-dim:oklch(0.440 0.018 158);
      --acc:oklch(0.840 0.115 158); --acc-weak:oklch(0.840 0.115 158 / 0.14);
      --pos:oklch(0.84 0.12 152); --warn:oklch(0.76 0.13 78); --neg:oklch(0.62 0.18 25);`,
    light: `--bg:oklch(0.970 0.008 158); --bg-elev:oklch(1 0 0);
      --surface:oklch(1 0 0); --surface-2:oklch(0.955 0.008 158);
      --border:oklch(0.895 0.010 158); --border-strong:oklch(0.790 0.016 158);
      --fg:oklch(0.200 0.014 158); --fg-muted:oklch(0.400 0.016 158);
      --fg-subtle:oklch(0.545 0.016 158); --fg-dim:oklch(0.680 0.014 158);
      --acc:oklch(0.480 0.105 158); --acc-weak:oklch(0.480 0.105 158 / 0.12);
      --pos:oklch(0.55 0.12 152); --warn:oklch(0.58 0.13 70); --neg:oklch(0.50 0.19 25);`,
  },
  telemetrie: {
    titel: 'Telemetrie',
    text: 'Tiefes Marineblau, Kupferakzent, weichere Kanten. Aus dem Medical-Deck - die Struktur davon, nicht der Hochglanz. Gefaste 3D-Panels bleiben aussen vor.',
    radius: '8px', raster: 'aus', marken: 'aus', schrift: 'gemischt',
    dark: `--bg:oklch(0.155 0.022 258); --bg-elev:oklch(0.190 0.024 258);
      --surface:oklch(0.215 0.026 258); --surface-2:oklch(0.250 0.028 258);
      --border:oklch(0.300 0.030 258); --border-strong:oklch(0.400 0.036 258);
      --fg:oklch(0.965 0.006 258); --fg-muted:oklch(0.755 0.020 258);
      --fg-subtle:oklch(0.590 0.024 258); --fg-dim:oklch(0.450 0.024 258);
      --acc:oklch(0.760 0.125 58); --acc-weak:oklch(0.760 0.125 58 / 0.16);
      --pos:oklch(0.80 0.12 152); --warn:oklch(0.80 0.13 82); --neg:oklch(0.66 0.18 25);`,
    light: `--bg:oklch(0.975 0.006 258); --bg-elev:oklch(1 0 0);
      --surface:oklch(1 0 0); --surface-2:oklch(0.962 0.008 258);
      --border:oklch(0.905 0.010 258); --border-strong:oklch(0.800 0.018 258);
      --fg:oklch(0.215 0.024 258); --fg-muted:oklch(0.410 0.024 258);
      --fg-subtle:oklch(0.550 0.022 258); --fg-dim:oklch(0.685 0.018 258);
      --acc:oklch(0.545 0.115 50); --acc-weak:oklch(0.545 0.115 50 / 0.13);
      --pos:oklch(0.55 0.12 152); --warn:oklch(0.60 0.13 72); --neg:oklch(0.52 0.19 25);`,
  },
  journal: {
    titel: 'Journal',
    text: 'Papierfarbener Grund, dunkles Gruen, flache Linien ohne Flaeche. Aus dem Neural-Ecosystem-Deck. Ruhig, lesbar - und bewusst nicht futuristisch, als Gegenprobe.',
    radius: '3px', raster: 'aus', marken: 'aus', schrift: 'ui',
    dark: `--bg:oklch(0.175 0.014 148); --bg-elev:oklch(0.205 0.014 148);
      --surface:oklch(0.225 0.014 148); --surface-2:oklch(0.258 0.014 148);
      --border:oklch(0.310 0.016 148); --border-strong:oklch(0.410 0.020 148);
      --fg:oklch(0.950 0.008 148); --fg-muted:oklch(0.750 0.014 148);
      --fg-subtle:oklch(0.595 0.014 148); --fg-dim:oklch(0.450 0.012 148);
      --acc:oklch(0.740 0.100 152); --acc-weak:oklch(0.740 0.100 152 / 0.15);
      --pos:oklch(0.78 0.11 152); --warn:oklch(0.78 0.12 82); --neg:oklch(0.65 0.17 25);`,
    light: `--bg:oklch(0.962 0.014 108); --bg-elev:oklch(0.985 0.010 108);
      --surface:oklch(0.985 0.010 108); --surface-2:oklch(0.945 0.014 108);
      --border:oklch(0.885 0.014 108); --border-strong:oklch(0.775 0.020 118);
      --fg:oklch(0.235 0.030 152); --fg-muted:oklch(0.420 0.028 152);
      --fg-subtle:oklch(0.555 0.022 152); --fg-dim:oklch(0.690 0.016 122);
      --acc:oklch(0.420 0.092 152); --acc-weak:oklch(0.420 0.092 152 / 0.12);
      --pos:oklch(0.50 0.11 152); --warn:oklch(0.58 0.12 72); --neg:oklch(0.50 0.18 25);`,
  },
  bestand: {
    titel: 'Bestand',
    text: 'Die aktuelle Palette aus globals.css, unveraendert. Kontrollgruppe - hier laesst sich pruefen, ob ein Vorschlag wirklich besser ist oder nur anders.',
    radius: '8px', raster: 'aus', marken: 'aus', schrift: 'mono',
    dark: bestandDark + ' --acc-weak:oklch(0.78 0.04 240 / 0.16);',
    light: bestandLight + ' --acc-weak:oklch(0.48 0.06 240 / 0.12);',
  },
}

const stil = (t) => `
[data-theme="${t}"][data-modus="dark"] { ${THEMES[t].dark} ${rampeDunkel} ${gemeinsam} }
[data-theme="${t}"][data-modus="light"] { ${THEMES[t].light} ${rampeHell} ${gemeinsam} }
[data-theme="${t}"] { --radius: ${THEMES[t].radius}; }`

// ---------- Primitive ----------

// 1 Korridor-Balken: Laborbereich, Zielkorridor, Ist-Marker ausserhalb.
const korridor = (name, einheit, von, bis, zielVon, zielBis, ist) => {
  const p = (v) => ((v - von) / (bis - von)) * 100
  const drin = ist >= zielVon && ist <= zielBis
  return `<div class="korridor">
    <div class="kopf"><span>${name}</span><b class="${drin ? 'ok' : 'ab'}">${ist} ${einheit}</b></div>
    <div class="spur">
      <div class="ziel" style="left:${p(zielVon)}%;width:${p(zielBis) - p(zielVon)}%"></div>
      <div class="marke" style="left:${p(ist)}%"></div>
    </div>
    <div class="skala"><span>${von}</span><span class="zl">Zielkorridor ${zielVon}\u2013${zielBis}</span><span>${bis}</span></div>
  </div>`
}

// 2 Stufenleiste: sechs Readiness-Stufen mit Systemfolge.
const STUFEN = [
  ['90\u2013100', 'Excellent', 'allow_training = MAX', 1],
  ['80\u201389', 'Good', 'allow_training = BASELINE', 2],
  ['70\u201379', 'Moderate', 'allow_training = REDUCED', 3],
  ['60\u201369', 'Poor', 'allow_training = LIGHT', 4],
  ['40\u201359', 'Rest', 'allow_training = REST', 5],
  ['< 40', 'Critical', 'allow_training = BLOCKED', 6],
]
const stufenleiste = (aktiv = 3) => `<div class="stufen">
  ${STUFEN.map(([r, n, f, i]) => `<div class="stufe${i === aktiv ? ' aktiv' : ''}" style="--st:var(--s${i})">
      <div class="band"></div><div class="sr">${r}</div>
      <div class="sn">${n}</div><code class="sf">${f}</code>
    </div>`).join('')}
</div>`

// 3 Zustandszeile: Schluessel-Wert in Monospace, sehr niedrige Prioritaet.
const zustandszeile = (posten) => `<div class="zzeile">
  ${posten.map(([k, v, art = '']) => `<span class="zp ${art}"><i></i>${k}: <b>${v}</b></span>`).join('')}
</div>`

// 4 Gate-Karte: Bedingung, Schwellen, drei Ausgaenge.
const gate = () => `<div class="gate">
  <code class="bed">if (confidence)</code>
  <div class="aus">
    <div class="ag ok"><b>&ge; 0.85</b><span>auto_accept</span></div>
    <div class="ag warn"><b>0.60 \u2013 0.84</b><span>needs_verification</span></div>
    <div class="ag neg"><b>&lt; 0.60</b><span>reject \u2192 manuell</span></div>
  </div>
</div>`

// 5 Radar: n Achsen, Ist-Polygon, Referenzring.
const radar = (achsen, groesse = 168) => {
  const c = groesse / 2, r = c - 30, n = achsen.length
  const pt = (i, f) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return [c + Math.cos(a) * r * f, c + Math.sin(a) * r * f]
  }
  const poly = achsen.map((a, i) => pt(i, a[1] / 100).map(v => v.toFixed(1)).join(',')).join(' ')
  const ring = (f) => achsen.map((_, i) => pt(i, f).map(v => v.toFixed(1)).join(',')).join(' ')
  return `<svg viewBox="0 0 ${groesse} ${groesse}" class="radar" role="img" aria-label="Systemwerte">
    ${[0.33, 0.66, 1].map(f => `<polygon points="${ring(f)}" class="rg"/>`).join('')}
    ${achsen.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="rg"/>` }).join('')}
    <polygon points="${poly}" class="rp"/>
    ${achsen.map((a, i) => { const [x, y] = pt(i, 1.24); return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="rt">${a[0]}</text>` }).join('')}
    ${achsen.map((a, i) => { const [x, y] = pt(i, a[1] / 100); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" class="rk"/>` }).join('')}
  </svg>`
}

// 6 Doppelachsen-Verlauf: zwei Reihen, eine Flaeche, eine Linie, Gefahrenzone.
const verlauf = (akut, chronisch, schwelle) => {
  const w = 320, h = 108, max = Math.max(...akut, ...chronisch) * 1.12
  const x = (i, a) => (i / (a.length - 1)) * w
  const y = (v) => h - (v / max) * h
  const pfad = (a) => a.map((v, i) => `${i ? 'L' : 'M'}${x(i, a).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const flaeche = `${pfad(chronisch)} L${w} ${h} L0 ${h} Z`
  const gefahr = akut.map((v, i) => (v > chronisch[i] * schwelle ? i : -1)).filter(i => i >= 0)
  return `<svg viewBox="0 0 ${w} ${h}" class="verlauf" role="img" aria-label="Akute gegen chronische Last">
    ${[0.25, 0.5, 0.75].map(f => `<line x1="0" y1="${(h * f).toFixed(0)}" x2="${w}" y2="${(h * f).toFixed(0)}" class="vg"/>`).join('')}
    <path d="${flaeche}" class="vf"/>
    ${gefahr.map(i => `<rect x="${(x(i, akut) - 4).toFixed(1)}" y="0" width="8" height="${h}" class="vz"/>`).join('')}
    <path d="${pfad(chronisch)}" class="vc"/>
    <path d="${pfad(akut)}" class="va"/>
  </svg>`
}

// 7 Koerperkarte: Drahtgitter, Gruppen einzeln adressierbar, vier Stufen.
const GRUPPEN = [
  ['Brust', 'M46 46 h22 v16 h-22 z', 1], ['Schultern', 'M34 42 h10 v12 h-10 z', 1],
  ['Schultern2', 'M70 42 h10 v12 h-10 z', 1], ['Bizeps', 'M31 56 h9 v20 h-9 z', 2],
  ['Bizeps2', 'M74 56 h9 v20 h-9 z', 2], ['Bauch', 'M48 64 h18 v24 h-18 z', 2],
  ['Unterarm', 'M29 78 h9 v20 h-9 z', 1], ['Unterarm2', 'M76 78 h9 v20 h-9 z', 1],
  ['Quads', 'M45 92 h11 v34 h-11 z', 6], ['Quads2', 'M58 92 h11 v34 h-11 z', 6],
  ['Waden', 'M46 130 h9 v26 h-9 z', 4], ['Waden2', 'M59 130 h9 v26 h-9 z', 4],
]
const koerper = () => `<svg viewBox="0 0 114 170" class="koerper" role="img" aria-label="Muskelbereitschaft">
  <g class="kw">
    <circle cx="57" cy="26" r="12"/><path d="M50 38 h14 l6 6 v50 h-26 v-50 z"/>
    <path d="M44 44 l-14 6 v52 M70 44 l14 6 v52"/><path d="M46 94 v62 M68 94 v62"/>
    <path d="M40 156 h16 M58 156 h16"/>
  </g>
  ${GRUPPEN.map(([n, d, s]) => `<path d="${d}" class="kg" style="--st:var(--s${s})"><title>${n.replace(/2$/, '')}</title></path>`).join('')}
  <g class="kc"><line x1="69" y1="112" x2="97" y2="112"/><circle cx="69" cy="112" r="2"/></g>
  <text x="99" y="110" class="kt">Quads</text><text x="99" y="120" class="ktv">31 %</text>
</svg>`

// 8 Beitragsdiagramm: Nabe mit gewichteten Speichen.
const BEITRAG = [['Ernaehrung', 40], ['Training', 35], ['Recovery', 20], ['Supplements', 10], ['Medical', 5]]
const beitrag = () => {
  const c = 92, r = 62
  return `<svg viewBox="0 0 184 184" class="beitrag" role="img" aria-label="Zielbeitrag je Modul">
    <circle cx="${c}" cy="${c}" r="26" class="bn"/>
    <text x="${c}" y="${c + 4}" class="bnt">Goals</text>
    ${BEITRAG.map(([n, p], i) => {
      const a = (Math.PI * 2 * i) / BEITRAG.length - Math.PI / 2
      const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r
      const x0 = c + Math.cos(a) * 28, y0 = c + Math.sin(a) * 28
      return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x0.toFixed(1)}" y2="${y0.toFixed(1)}"
        class="bs" style="stroke-width:${(1 + p / 11).toFixed(2)}"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" class="bk"/>
      <text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" class="bp">${p}%</text>
      <text x="${x.toFixed(1)}" y="${(y + 27).toFixed(1)}" class="bt">${n}</text>`
    }).join('')}
  </svg>`
}

// 9 Konzentrische Schichten: drei Ringe, aeussere optional.
const schichten = () => `<div class="schichten">
  ${[['Tier 1', 'Local-First', 'SQLite on Device. Zero-Knowledge.', 'pflicht'],
     ['Tier 2', 'E2E Cloud', 'Nur verschluesselt, User-held Keys.', 'optin'],
     ['Tier 3', 'Provider', 'Granulare Freigabe an Arzt oder Coach.', 'optin']]
    .map(([t, n, x, art], i) => `<div class="sch ${art}" style="--tief:${i}">
      <div class="schr"><b>${t}</b><span>${n}</span></div>
      <p>${x}</p>${art === 'optin' ? '<code>opt-in</code>' : '<code>default</code>'}
    </div>`).join('')}
</div>`

// ---------- Stil ----------
const STIL = `
* { box-sizing:border-box; }
body { margin:0; padding:0 0 72px; background:var(--bg); color:var(--fg);
  font-family:var(--font-mono); font-size:12.5px; line-height:1.5;
  transition:background .3s, color .3s; }
[data-theme="journal"] body, [data-theme="telemetrie"] body { font-family:var(--font-ui); }
.huelle { max-width:1180px; margin:0 auto; padding:0 22px; }

/* Kopf */
.leiste { position:sticky; top:0; z-index:9; background:var(--bg-elev);
  border-bottom:1px solid var(--border); padding:11px 0; margin-bottom:26px; }
.leiste .huelle { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
.leiste h1 { font-size:14px; margin:0; font-weight:600; letter-spacing:-.01em; }
.wahl { display:flex; gap:0; border:1px solid var(--border-strong); border-radius:var(--radius); overflow:hidden; }
.wahl button { font:inherit; font-size:11px; cursor:pointer; border:0; padding:5px 12px;
  background:transparent; color:var(--fg-subtle); }
.wahl button[aria-pressed="true"] { background:var(--acc); color:var(--bg); font-weight:600; }
.wahl button:not([aria-pressed="true"]):hover { background:var(--surface-hover,var(--surface-2)); color:var(--fg); }
.rechts { margin-left:auto; font-size:11px; color:var(--fg-dim); }
.lead { color:var(--fg-muted); max-width:82ch; margin:0 0 26px; font-size:12px; }
.lead b { color:var(--fg); font-weight:600; }

/* Panel */
.gitter { display:grid; grid-template-columns:repeat(auto-fill,minmax(330px,1fr)); gap:16px; }
.panel { position:relative; background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:16px; transition:background .3s, border-color .3s; }
.panel > h2 { font-size:9.5px; text-transform:uppercase; letter-spacing:.1em; font-weight:600;
  color:var(--fg-dim); margin:0 0 3px; }
.panel > .wo { font-size:10.5px; color:var(--fg-subtle); margin:0 0 14px; }
.panel.breit { grid-column:1/-1; }
[data-theme="instrument"] .panel::before, [data-theme="instrument"] .panel::after {
  content:''; position:absolute; width:9px; height:9px; border:1px solid var(--acc); opacity:.55; }
[data-theme="instrument"] .panel::before { top:-1px; left:-1px; border-right:0; border-bottom:0; }
[data-theme="instrument"] .panel::after { bottom:-1px; right:-1px; border-left:0; border-top:0; }
[data-theme="instrument"] .gitter { background-image:
  linear-gradient(var(--border) 1px, transparent 1px),
  linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size:44px 44px; background-position:-1px -1px; }
[data-theme="instrument"] .panel { box-shadow:0 0 0 4px var(--bg); }
`

const STIL2 = `
/* 1 Korridor */
.korridor + .korridor { margin-top:15px; }
.korridor .kopf { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:7px; }
.korridor .kopf span { color:var(--fg-muted); font-size:11.5px; }
.korridor .kopf b { font-family:var(--font-mono); font-size:14px; }
.kopf b.ok { color:var(--pos); } .kopf b.ab { color:var(--neg); }
.spur { position:relative; height:11px; background:var(--surface-2);
  border:1px solid var(--border); border-radius:99px; }
.ziel { position:absolute; top:-1px; bottom:-1px; background:var(--acc-weak);
  border:1px solid var(--acc); border-radius:99px; }
.marke { position:absolute; top:50%; width:3px; height:19px; margin:-9.5px 0 0 -1.5px;
  background:var(--fg); border-radius:2px; box-shadow:0 0 0 2px var(--surface); }
.skala { display:flex; justify-content:space-between; margin-top:5px;
  font-size:10px; color:var(--fg-dim); }
.skala .zl { color:var(--acc); }

/* 2 Stufenleiste */
.stufen { display:grid; grid-template-columns:repeat(6,1fr); gap:5px; }
.stufe { opacity:.5; transition:opacity .2s; }
.stufe.aktiv { opacity:1; }
.band { height:5px; background:var(--st); border-radius:2px; margin-bottom:6px; }
.stufe.aktiv .band { height:9px; margin-bottom:2px; }
.sr { font-family:var(--font-mono); font-size:11px; color:var(--fg); }
.sn { font-size:10.5px; color:var(--st); font-weight:600; }
.sf { display:block; font-size:8.5px; color:var(--fg-dim); margin-top:3px;
  overflow-wrap:anywhere; }

/* 3 Zustandszeile */
.zzeile { display:flex; flex-wrap:wrap; gap:4px 16px; font-family:var(--font-mono);
  font-size:10.5px; color:var(--fg-dim); border-top:1px solid var(--border); padding-top:9px; }
.zp i { display:inline-block; width:5px; height:5px; border-radius:99px;
  background:var(--fg-dim); margin-right:6px; vertical-align:1px; }
.zp.ok i { background:var(--pos); } .zp.warn i { background:var(--warn); }
.zp.neg i { background:var(--neg); }
.zp b { color:var(--fg-subtle); font-weight:400; }

/* 4 Gate */
.gate .bed { display:inline-block; font-size:11px; color:var(--acc);
  border:1px dashed var(--acc); border-radius:var(--radius-sm); padding:3px 9px; margin-bottom:11px; }
.aus { display:grid; gap:7px; }
.ag { display:flex; justify-content:space-between; align-items:baseline; gap:10px;
  padding:7px 10px; border-radius:var(--radius-sm); border:1px solid var(--border);
  border-left-width:3px; background:var(--surface-2); }
.ag b { font-family:var(--font-mono); font-size:11.5px; }
.ag span { font-size:10.5px; color:var(--fg-muted); font-family:var(--font-mono); }
.ag.ok { border-left-color:var(--pos); } .ag.ok b { color:var(--pos); }
.ag.warn { border-left-color:var(--warn); } .ag.warn b { color:var(--warn); }
.ag.neg { border-left-color:var(--neg); } .ag.neg b { color:var(--neg); }
`

const STIL3 = `
/* 5 Radar */
.radar { width:100%; max-width:210px; display:block; margin:0 auto; overflow:visible; }
.radar .rg { fill:none; stroke:var(--border); stroke-width:1; }
.radar .rp { fill:var(--acc-weak); stroke:var(--acc); stroke-width:1.6; stroke-linejoin:round; }
.radar .rk { fill:var(--acc); }
.radar .rt { fill:var(--fg-subtle); font-size:8px; text-anchor:middle;
  font-family:var(--font-mono); dominant-baseline:middle; }

/* 6 Verlauf */
.verlauf { width:100%; display:block; overflow:visible; }
.verlauf .vg { stroke:var(--border); stroke-width:1; }
.verlauf .vf { fill:var(--acc-weak); }
.verlauf .vc { fill:none; stroke:var(--fg-dim); stroke-width:1.4; stroke-dasharray:3 3; }
.verlauf .va { fill:none; stroke:var(--acc); stroke-width:1.8; stroke-linejoin:round; }
.verlauf .vz { fill:var(--neg); opacity:.16; }
.legende { display:flex; gap:16px; margin-top:9px; font-size:10px; color:var(--fg-dim); }
.legende i { display:inline-block; width:14px; height:2px; margin-right:5px; vertical-align:3px; }
.legende .la i { background:var(--acc); } .legende .lc i { background:var(--fg-dim); }
.legende .lz i { background:var(--neg); opacity:.5; height:8px; vertical-align:0; }

/* 7 Koerperkarte */
.koerper { width:100%; max-width:230px; display:block; margin:0 auto; overflow:visible; }
.koerper .kw { fill:none; stroke:var(--border-strong); stroke-width:.9; }
.koerper .kg { fill:var(--st); opacity:.82; }
.koerper .kc { stroke:var(--fg-dim); stroke-width:.8; fill:var(--fg-dim); }
.koerper .kt { fill:var(--fg-muted); font-size:7px; font-family:var(--font-mono); }
.koerper .ktv { fill:var(--s6); font-size:8px; font-weight:600; font-family:var(--font-mono); }

/* 8 Beitrag */
.beitrag { width:100%; max-width:250px; display:block; margin:0 auto; overflow:visible; }
.beitrag .bn { fill:var(--acc-weak); stroke:var(--acc); stroke-width:1.4; }
.beitrag .bnt { fill:var(--acc); font-size:9px; text-anchor:middle; font-weight:600;
  font-family:var(--font-mono); }
.beitrag .bs { stroke:var(--acc); opacity:.45; }
.beitrag .bk { fill:var(--surface-2); stroke:var(--border-strong); stroke-width:1; }
.beitrag .bp { fill:var(--fg); font-size:8.5px; text-anchor:middle; font-family:var(--font-mono); }
.beitrag .bt { fill:var(--fg-subtle); font-size:7.5px; text-anchor:middle; font-family:var(--font-mono); }

/* 9 Schichten */
.schichten { display:grid; gap:8px; }
.sch { border:1px solid var(--border); border-radius:var(--radius-sm);
  padding:9px 11px; background:var(--surface-2);
  margin-left:calc(var(--tief) * 14px); }
.sch.pflicht { border-color:var(--acc); background:var(--acc-weak); }
.schr { display:flex; gap:8px; align-items:baseline; }
.schr b { font-size:11px; } .schr span { font-size:11px; color:var(--fg-muted); }
.sch p { margin:3px 0 0; font-size:10.5px; color:var(--fg-subtle); }
.sch code { font-size:9px; color:var(--fg-dim); }
.sch.pflicht code { color:var(--acc); }
@media (prefers-reduced-motion: reduce) { * { transition-duration:.01ms !important; } }
`

// ---------- Seite ----------
const panel = (nr, titel, wo, inhalt, breit = false) => `
<section class="panel${breit ? ' breit' : ''}">
  <h2>${nr} \u00b7 ${titel}</h2><p class="wo">${wo}</p>${inhalt}
</section>`

const AKUT = [280, 420, 390, 520, 610, 480, 900, 1180, 1420, 1310, 860, 640, 520, 470]
const CHRON = [300, 330, 360, 400, 440, 470, 520, 590, 660, 720, 740, 720, 690, 650]

const inhalt = `
<div class="gitter">
${panel(1, 'Korridor-Balken', 'Medical \u00b7 Laborbereich gegen Zielkorridor',
  korridor('Testosteron', 'ng/dL', 240, 1000, 500, 900, 350) +
  korridor('Vitamin D', 'ng/mL', 0, 80, 40, 60, 52) +
  korridor('hs-CRP', 'mg/L', 0, 10, 0, 1, 2.4))}
${panel(2, 'Stufenleiste', 'Recovery \u00b7 Readiness mit Systemfolge', stufenleiste(3), true)}
${panel(3, 'Radar', 'Medical \u00b7 f\u00fcnf System Scores',
  radar([['Cardio', 92], ['Metabolic', 88], ['Liver', 75], ['Kidney', 90], ['Hormone', 85]]))}
${panel(4, 'Doppelachsen-Verlauf', 'Recovery \u00b7 ACWR akut gegen chronisch',
  verlauf(AKUT, CHRON, 1.5) +
  `<div class="legende"><span class="la"><i></i>Akut 7 d</span>
   <span class="lc"><i></i>Chronisch 28 d</span><span class="lz"><i></i>ACWR &gt; 1.5</span></div>`)}
${panel(5, 'K\u00f6rperkarte', 'Recovery \u00b7 Bereitschaft je Muskelgruppe', koerper())}
${panel(6, 'Beitragsdiagramm', 'Goals \u00b7 Zielbeitrag der Module', beitrag())}
${panel(7, 'Konzentrische Schichten', 'Settings \u00b7 Datensouver\u00e4nit\u00e4t', schichten())}
${panel(8, 'Gate-Karte', 'Nutrition \u00b7 MealCam-Konfidenz', gate())}
${panel(9, 'Zustandszeile', 'Systemweit \u00b7 niedrigste Priorit\u00e4t',
  zustandszeile([['SYSTEM', 'ONLINE', 'ok'], ['MODULE_PORT', '5400'], ['ENGINE', 'DETERMINISTIC'],
    ['vol_modifier', '0.70', 'warn'], ['allow_training', 'false', 'neg'],
    ['LAST_SYNC', '14:23:05 UTC']]), true)}
</div>`

const namen = Object.keys(THEMES)
const html = `<!doctype html>
<html lang="de" data-theme="instrument" data-modus="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LumeOS \u2014 Themes und Komponenten</title>
<style>
${namen.map(stil).join('\n')}
${STIL}${STIL2}${STIL3}
</style>
</head>
<body>
<div class="leiste"><div class="huelle">
  <h1>LumeOS \u2014 Themes</h1>
  <div class="wahl" id="wt">${namen.map((n, i) =>
    `<button data-t="${n}" aria-pressed="${i === 0}">${THEMES[n].titel}</button>`).join('')}</div>
  <div class="wahl" id="wm">
    <button data-m="dark" aria-pressed="true">Nacht</button>
    <button data-m="light" aria-pressed="false">Tag</button>
  </div>
  <span class="rechts" id="tinfo"></span>
</div></div>
<div class="huelle">
  <p class="lead" id="tbeschreibung"></p>
  ${inhalt}
</div>
<script>
const B = ${JSON.stringify(Object.fromEntries(namen.map(n => [n, THEMES[n].text])))};
const h = document.documentElement;
const setzen = () => {
  document.querySelectorAll('#wt button').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.t === h.dataset.theme)));
  document.querySelectorAll('#wm button').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.m === h.dataset.modus)));
  document.getElementById('tbeschreibung').textContent = B[h.dataset.theme];
  document.getElementById('tinfo').textContent =
    h.dataset.theme + ' \u00b7 ' + (h.dataset.modus === 'dark' ? 'Nachtmodus' : 'Tagmodus');
};
document.getElementById('wt').onclick = e => {
  if (!e.target.dataset.t) return; h.dataset.theme = e.target.dataset.t; setzen(); };
document.getElementById('wm').onclick = e => {
  if (!e.target.dataset.m) return; h.dataset.modus = e.target.dataset.m; setzen(); };
addEventListener('keydown', e => {
  if (e.key === 't' || e.key === 'T') {
    h.dataset.modus = h.dataset.modus === 'dark' ? 'light' : 'dark'; setzen(); }
  const i = parseInt(e.key, 10);
  if (i >= 1 && i <= ${namen.length}) { h.dataset.theme = ${JSON.stringify(namen)}[i - 1]; setzen(); }
});
setzen();
</script>
</body>
</html>`

writeFileSync(join(hier, 'themes.html'), html, 'utf8')
console.log(`themes.html geschrieben: ${namen.length} Themes x 2 Modi x 9 Primitive`)
