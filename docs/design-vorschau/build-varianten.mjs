// Baut drei Designvarianten aus apps/web/src/app/globals.css
// Aufruf: node docs/design-vorschau/build-varianten.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const hier = dirname(fileURLToPath(import.meta.url))
const wurzel = join(hier, '..', '..')
const css = readFileSync(join(wurzel, 'apps/web/src/app/globals.css'), 'utf8')
const block = (re) => (css.match(re)?.[1] ?? '').trim()
const rootBlock  = block(/:root\s*\{([\s\S]*?)\}/)
const lightBlock = block(/\[data-theme="light"\]\s*\{([\s\S]*?)\}/)

const basis = `
:root { ${rootBlock} }
[data-theme="light"] { ${lightBlock} }
* { box-sizing:border-box; }
body { margin:0; padding:26px; background:var(--bg); color:var(--fg);
       font-family:var(--font-mono); font-size:13px; line-height:1.5;
       -webkit-font-smoothing:antialiased; }
header { display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; margin-bottom:6px; }
h1 { font-size:17px; margin:0; }
.tag { font-size:11px; color:var(--fg-dim); border:1px solid var(--border);
       border-radius:99px; padding:2px 9px; }
.lead { color:var(--fg-subtle); margin:0 0 24px; max-width:78ch; }
button.um { font:inherit; cursor:pointer; background:var(--surface); color:var(--fg);
            border:1px solid var(--border-strong); border-radius:var(--radius-sm); padding:5px 11px; }
button.um:hover { background:var(--surface-hover); }
h2 { font-size:10px; text-transform:uppercase; letter-spacing:.09em;
     color:var(--fg-dim); margin:28px 0 10px; font-weight:600; }
.zahl { font-variant-numeric:tabular-nums; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms !important; transition-duration:.01ms !important; }
}
`

const kopf = (titel, tag, lead) => `<!doctype html>
<html lang="de" data-theme="dark"><head><meta charset="utf-8"><title>${titel}</title>
<style>${basis}`

const fuss = (js = '') => `</body>${js}</html>`

const kopfzeile = (titel, tag, lead) => `</style></head><body>
<header><h1>${titel}</h1><span class="tag">${tag}</span>
<button class="um" onclick="const h=document.documentElement;h.dataset.theme=h.dataset.theme==='light'?'dark':'light'">Theme</button>
</header><p class="lead">${lead}</p>`

// ---------------------------------------------------------------- A: Instrumententafel
const varianteA = kopf('LumeOS — Instrumententafel') + `
.tafel { display:grid; grid-template-columns:280px 1fr; gap:20px; align-items:start; }
.hauptwert { background:var(--surface); border:1px solid var(--border);
             border-radius:var(--radius-lg); padding:24px; text-align:center; }
.ring { width:190px; height:190px; margin:0 auto 14px; position:relative; }
.ring svg { transform:rotate(-90deg); }
.ring circle { fill:none; stroke-width:12; stroke-linecap:round; }
.ring .spur { stroke:var(--surface-2); }
.ring .wert { stroke:var(--acc-recov); stroke-dasharray:534; stroke-dashoffset:534;
              animation:fuellen 1.4s cubic-bezier(.16,1,.3,1) .2s forwards; }
@keyframes fuellen { to { stroke-dashoffset:112; } }
.ring .mitte { position:absolute; inset:0; display:flex; flex-direction:column;
               align-items:center; justify-content:center; }
.ring .gross { font-size:46px; font-weight:700; letter-spacing:-.02em; }
.ring .klein { font-size:11px; color:var(--fg-subtle); text-transform:uppercase; letter-spacing:.08em; }
.deutung { color:var(--fg-muted); font-size:12px; margin:0; }
.stufe2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; }
.mess { background:var(--surface); border:1px solid var(--border);
        border-radius:var(--radius); padding:14px; position:relative; overflow:hidden; }
.mess:hover { background:var(--surface-hover); }
.mess .l { font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:var(--fg-dim); }
.mess .w { font-size:23px; font-weight:600; margin:3px 0 1px; }
.mess .d { font-size:11px; color:var(--fg-subtle); }
.mess .balken { position:absolute; left:0; bottom:0; height:2px;
                animation:wachsen 1s cubic-bezier(.16,1,.3,1) forwards; width:0; }
@keyframes wachsen { to { width:var(--anteil); } }
.spark { display:flex; align-items:flex-end; gap:2px; height:34px; margin-top:9px; }
.spark i { flex:1; background:var(--acc); border-radius:1px; opacity:.55;
           animation:auf .7s cubic-bezier(.16,1,.3,1) forwards; height:0; }
@keyframes auf { to { height:var(--h); } }
.stufe3 { background:var(--surface); border:1px solid var(--border);
          border-radius:var(--radius); padding:16px; margin-top:12px; }
.zeile { display:flex; justify-content:space-between; padding:6px 0;
         border-bottom:1px solid var(--border); }
.zeile:last-child { border:none; }
.zeile span:first-child { color:var(--fg-muted); }
` + kopfzeile('LumeOS — Instrumententafel', 'Variante A',
  'Verdichtung statt Anzeige. Aus vielen Signalen wird eine Zahl, danach drei Stufen: Überblick, Verlauf, Detail. Dunkel ist funktional — farbige Datenpunkte treten hervor. Bewegung nur dort, wo sie einen Zustand mitteilt.') + `
<div class="tafel">
  <div class="hauptwert">
    <div class="ring">
      <svg width="190" height="190" viewBox="0 0 190 190">
        <circle class="spur" cx="95" cy="95" r="85"></circle>
        <circle class="wert" cx="95" cy="95" r="85"></circle>
      </svg>
      <div class="mitte"><span class="gross zahl" id="score">0</span><span class="klein">Bereitschaft</span></div>
    </div>
    <p class="deutung">Erholt. Gestern 6 h 40 Schlaf bei erhöhter HRV — Training möglich.</p>
  </div>
  <div>
    <h2>Stufe 2 — Verlauf</h2>
    <div class="stufe2">
      <div class="mess"><div class="l">Energie</div><div class="w zahl" data-ziel="1840">0</div>
        <div class="d">von 2.150 kcal</div>
        <div class="spark"><i style="--h:40%"></i><i style="--h:65%"></i><i style="--h:52%"></i><i style="--h:78%"></i><i style="--h:60%"></i><i style="--h:86%"></i><i style="--h:71%"></i></div>
        <div class="balken" style="--anteil:86%;background:var(--acc-nutri)"></div></div>
      <div class="mess"><div class="l">Protein</div><div class="w zahl" data-ziel="142">0</div>
        <div class="d">von 160 g</div>
        <div class="spark"><i style="--h:55%"></i><i style="--h:70%"></i><i style="--h:62%"></i><i style="--h:88%"></i><i style="--h:75%"></i><i style="--h:90%"></i><i style="--h:89%"></i></div>
        <div class="balken" style="--anteil:89%;background:var(--pos)"></div></div>
      <div class="mess"><div class="l">HRV</div><div class="w zahl" data-ziel="58">0</div>
        <div class="d">7-Tage-Mittel 51 ms</div>
        <div class="spark"><i style="--h:48%"></i><i style="--h:44%"></i><i style="--h:60%"></i><i style="--h:52%"></i><i style="--h:66%"></i><i style="--h:72%"></i><i style="--h:80%"></i></div>
        <div class="balken" style="--anteil:80%;background:var(--acc-recov)"></div></div>
      <div class="mess"><div class="l">Volumen</div><div class="w zahl" data-ziel="8400">0</div>
        <div class="d">kg diese Woche</div>
        <div class="spark"><i style="--h:30%"></i><i style="--h:0%"></i><i style="--h:75%"></i><i style="--h:20%"></i><i style="--h:82%"></i><i style="--h:0%"></i><i style="--h:64%"></i></div>
        <div class="balken" style="--anteil:64%;background:var(--acc-train)"></div></div>
    </div>
    <h2>Stufe 3 — Detail</h2>
    <div class="stufe3">
      <div class="zeile"><span>Kohlenhydrate</span><b class="zahl">186 g</b></div>
      <div class="zeile"><span>Fett</span><b class="zahl">64 g</b></div>
      <div class="zeile"><span>Ballaststoffe</span><b class="zahl">31 g</b></div>
      <div class="zeile"><span>Ruhepuls</span><b class="zahl">52 bpm</b></div>
    </div>
  </div>
</div>
` + fuss(`<script>
const anim=(el,ziel,dauer)=>{const start=performance.now();const schritt=t=>{
 const p=Math.min((t-start)/dauer,1);const e=1-Math.pow(1-p,3);
 el.textContent=Math.round(ziel*e).toLocaleString('de-DE');if(p<1)requestAnimationFrame(schritt)};
 requestAnimationFrame(schritt)}
anim(document.getElementById('score'),79,1400)
document.querySelectorAll('[data-ziel]').forEach(el=>anim(el,+el.dataset.ziel,1100))
</script>`)

writeFileSync(join(hier, 'variante-a-instrumententafel.html'), varianteA, 'utf8')
console.log('variante-a-instrumententafel.html')

// ---------------------------------------------------------------- B: Bento
const varianteB = kopf('LumeOS — Bento') + `
.bento { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
.k { background:var(--surface); border:1px solid var(--border);
     border-radius:var(--radius-lg); padding:var(--pad-card);
     transition:transform .25s cubic-bezier(.16,1,.3,1), border-color .25s;
     animation:rein .5s cubic-bezier(.16,1,.3,1) backwards; }
.k:hover { transform:translateY(-2px); border-color:var(--border-strong); }
@keyframes rein { from { opacity:0; transform:translateY(10px); } }
.k .l { font-size:10px; text-transform:uppercase; letter-spacing:.07em;
        color:var(--fg-dim); margin-bottom:6px; }
.k .w { font-size:26px; font-weight:600; letter-spacing:-.01em; }
.k .d { font-size:11px; color:var(--fg-subtle); margin-top:2px; }
.gross { grid-column:span 3; grid-row:span 2; }
.gross .w { font-size:52px; line-height:1; }
.breit { grid-column:span 3; }
.mittel { grid-column:span 2; }
.klein { grid-column:span 1; }
.hoch { grid-column:span 2; grid-row:span 2; }
.balken { display:flex; align-items:flex-end; gap:4px; height:70px; margin-top:12px; }
.balken i { flex:1; border-radius:2px 2px 0 0; background:var(--acc);
            opacity:.7; height:0; animation:auf .8s cubic-bezier(.16,1,.3,1) forwards; }
.balken i:hover { opacity:1; }
@keyframes auf { to { height:var(--h); } }
.liste { margin-top:10px; }
.liste div { display:flex; justify-content:space-between; padding:5px 0;
             border-bottom:1px solid var(--border); font-size:12px; }
.liste div:last-child { border:none; }
.liste span { color:var(--fg-muted); }
.punkte { display:flex; gap:5px; margin-top:12px; flex-wrap:wrap; }
.punkt { width:11px; height:11px; border-radius:3px; background:var(--surface-2); }
.punkt.an { background:var(--acc-train); }
.ziel { height:5px; border-radius:99px; background:var(--surface-2); margin-top:10px; overflow:hidden; }
.ziel i { display:block; height:100%; background:var(--acc-goals); width:0;
          animation:breit 1s cubic-bezier(.16,1,.3,1) forwards; }
@keyframes breit { to { width:var(--p); } }
` + kopfzeile('LumeOS — Bento', 'Variante B',
  'Die Fläche kommuniziert Priorität, bevor jemand ein Wort liest. Absichtliche Asymmetrie: eine Kennzahl über drei Spalten neben kleineren Kacheln. Weissraum gehört in die Karten, nicht zwischen sie. Bewegung nur beim Eintreten und beim Zeigen.') + `
<div class="bento">
  <div class="k gross" style="animation-delay:0ms">
    <div class="l">Energie heute</div>
    <div class="w zahl">1.840</div>
    <div class="d">von 2.150 kcal · 86 %</div>
    <div class="balken">
      <i style="--h:40%;animation-delay:.1s"></i><i style="--h:65%;animation-delay:.15s"></i>
      <i style="--h:52%;animation-delay:.2s"></i><i style="--h:78%;animation-delay:.25s"></i>
      <i style="--h:60%;animation-delay:.3s"></i><i style="--h:86%;animation-delay:.35s"></i>
      <i style="--h:71%;animation-delay:.4s"></i>
    </div>
  </div>
  <div class="k hoch" style="animation-delay:50ms">
    <div class="l">Makros</div>
    <div class="liste">
      <div><span>Protein</span><b class="zahl">142 g</b></div>
      <div><span>Kohlenhydrate</span><b class="zahl">186 g</b></div>
      <div><span>Fett</span><b class="zahl">64 g</b></div>
      <div><span>Ballaststoffe</span><b class="zahl">31 g</b></div>
      <div><span>Zucker</span><b class="zahl">42 g</b></div>
      <div><span>Wasser</span><b class="zahl">2,1 L</b></div>
    </div>
  </div>
  <div class="k klein" style="animation-delay:100ms">
    <div class="l">HRV</div><div class="w zahl">58</div><div class="d">ms</div>
  </div>
  <div class="k klein" style="animation-delay:150ms">
    <div class="l">Puls</div><div class="w zahl">52</div><div class="d">Ruhe</div>
  </div>
  <div class="k mittel" style="animation-delay:200ms">
    <div class="l">Trainingswoche</div>
    <div class="punkte">
      <span class="punkt an"></span><span class="punkt"></span><span class="punkt an"></span>
      <span class="punkt an"></span><span class="punkt"></span><span class="punkt an"></span>
      <span class="punkt"></span>
    </div>
    <div class="d" style="margin-top:9px">4 von 7 Tagen · 8,4 t Volumen</div>
  </div>
  <div class="k breit" style="animation-delay:250ms">
    <div class="l">Ziel — Körperfett unter 12 %</div>
    <div class="w zahl">13,4 %</div>
    <div class="ziel"><i style="--p:68%"></i></div>
    <div class="d">68 % erreicht · noch 12 Tage</div>
  </div>
  <div class="k mittel" style="animation-delay:300ms">
    <div class="l">Schlaf</div><div class="w zahl">7 h 20</div>
    <div class="d">Tiefschlaf 1 h 45</div>
  </div>
  <div class="k klein" style="animation-delay:350ms">
    <div class="l">Suppl.</div><div class="w zahl">4/6</div><div class="d">heute</div>
  </div>
  <div class="k breit" style="animation-delay:400ms">
    <div class="l">Lebensmitteldatenbank</div>
    <div class="w zahl">7.140</div>
    <div class="d">Einträge · 698.092 Nährwerte · BLS 4.0</div>
  </div>
  <div class="k mittel" style="animation-delay:450ms">
    <div class="l">Medizin</div><div class="w zahl">12</div>
    <div class="d">Werte · 1 auffällig</div>
  </div>
</div>
` + fuss()

writeFileSync(join(hier, 'variante-b-bento.html'), varianteB, 'utf8')
console.log('variante-b-bento.html')

// ---------------------------------------------------------------- C: Liquid Glass
const varianteC = kopf('LumeOS — Liquid Glass') + `
body { position:relative; min-height:100vh; }
body::before { content:''; position:fixed; inset:0; z-index:-1;
  background:
    radial-gradient(48rem 34rem at 12% 8%, color-mix(in oklch, var(--acc-nutri) 22%, transparent), transparent 62%),
    radial-gradient(42rem 30rem at 88% 22%, color-mix(in oklch, var(--acc-train) 20%, transparent), transparent 60%),
    radial-gradient(50rem 36rem at 55% 92%, color-mix(in oklch, var(--acc-recov) 18%, transparent), transparent 62%),
    var(--bg);
  animation:driften 26s ease-in-out infinite alternate; }
@keyframes driften { to { transform:scale(1.09) translate3d(-1.5%, 1.5%, 0); } }

.leiste { position:sticky; top:14px; z-index:5; display:flex; gap:6px; align-items:center;
  padding:9px 12px; margin-bottom:20px; border-radius:99px;
  background:color-mix(in oklch, var(--surface) 55%, transparent);
  backdrop-filter:blur(20px) saturate(1.5); -webkit-backdrop-filter:blur(20px) saturate(1.5);
  border:1px solid color-mix(in oklch, var(--fg) 12%, transparent);
  box-shadow:0 10px 34px -14px rgba(0,0,0,.65); }
.leiste a { padding:6px 13px; border-radius:99px; color:var(--fg-muted);
  text-decoration:none; font-size:12px; transition:background .2s, color .2s; }
.leiste a:hover { background:color-mix(in oklch, var(--fg) 9%, transparent); color:var(--fg); }
.leiste a.an { background:color-mix(in oklch, var(--acc) 26%, transparent); color:var(--fg); }

.raster { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:14px; }

/* Glas nur fuer Rahmen und Ueberlagerungen */
.glas { border-radius:var(--radius-lg); padding:1px;
  background:linear-gradient(150deg,
    color-mix(in oklch, var(--fg) 20%, transparent),
    color-mix(in oklch, var(--fg) 4%, transparent));
  box-shadow:0 16px 40px -20px rgba(0,0,0,.7); }
/* Daten stehen auf deckender Flaeche - nie auf Glas */
.inhalt { background:var(--surface); border-radius:calc(var(--radius-lg) - 1px);
  padding:var(--pad-card); }
.l { font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:var(--fg-dim); }
.w { font-size:30px; font-weight:600; margin:5px 0 1px; letter-spacing:-.01em; }
.d { font-size:11px; color:var(--fg-subtle); }
.zeile { display:flex; justify-content:space-between; padding:5px 0;
  border-bottom:1px solid var(--border); font-size:12px; }
.zeile:last-child { border:none; }
.zeile span { color:var(--fg-muted); }

/* Ueberlagerung: hier ist Glas richtig */
.dialog { margin-top:22px; max-width:480px; border-radius:var(--radius-lg); padding:20px;
  background:color-mix(in oklch, var(--surface) 62%, transparent);
  backdrop-filter:blur(24px) saturate(1.6); -webkit-backdrop-filter:blur(24px) saturate(1.6);
  border:1px solid color-mix(in oklch, var(--fg) 14%, transparent);
  box-shadow:0 24px 60px -26px rgba(0,0,0,.8); }
.dialog h3 { margin:0 0 7px; font-size:14px; }
.dialog p { margin:0 0 14px; color:var(--fg-muted); font-size:12px; }
.knopf { background:var(--acc); color:var(--bg); border:none; font:inherit; font-size:12px;
  border-radius:var(--radius-sm); padding:7px 14px; cursor:pointer; }
.knopf.zweit { background:color-mix(in oklch, var(--fg) 10%, transparent); color:var(--fg); }
.hinweis { margin-top:26px; padding:13px 15px; border-radius:var(--radius);
  border:1px solid var(--warn); color:var(--warn); font-size:12px; max-width:78ch; }
` + kopfzeile('LumeOS — Liquid Glass', 'Variante C',
  'Glas trennt Ebenen, ohne zusätzliche Farben einzuführen — deshalb wirkt es in dunklen Oberflächen besonders gut. Die Einschränkung ist hart: Glasmorphismus scheitert, sobald der Kontrast unter WCAG AA fällt. Hier steht deshalb keine Zahl auf Glas.') + `
<nav class="leiste">
  <a href="#" class="an">Dashboard</a><a href="#">Ernährung</a><a href="#">Training</a>
  <a href="#">Erholung</a><a href="#">Ziele</a><a href="#">Medizin</a>
</nav>
<div class="raster">
  <div class="glas"><div class="inhalt">
    <div class="l">Energie heute</div><div class="w zahl">1.840</div>
    <div class="d">von 2.150 kcal</div></div></div>
  <div class="glas"><div class="inhalt">
    <div class="l">Bereitschaft</div><div class="w zahl">79</div>
    <div class="d">erholt · HRV 58 ms</div></div></div>
  <div class="glas"><div class="inhalt">
    <div class="l">Trainingsvolumen</div><div class="w zahl">8,4 t</div>
    <div class="d">diese Woche · 4 Einheiten</div></div></div>
  <div class="glas"><div class="inhalt">
    <div class="l">Makros</div>
    <div class="zeile"><span>Protein</span><b class="zahl">142 g</b></div>
    <div class="zeile"><span>Kohlenhydrate</span><b class="zahl">186 g</b></div>
    <div class="zeile"><span>Fett</span><b class="zahl">64 g</b></div>
  </div></div>
</div>
<div class="dialog">
  <h3>Buddy</h3>
  <p>Du liegst 310 kcal unter deinem Ziel und hast heute trainiert. Soll ich etwas vorschlagen?</p>
  <button class="knopf">Vorschlag ansehen</button>
  <button class="knopf zweit">Später</button>
</div>
<p class="hinweis">Glas hier nur für Navigation und Dialog. Die Datenkarten haben einen
Glasrand, aber eine deckende Fläche — sonst sinkt der Kontrast unter die Grenze.
Zusätzlich: <code>backdrop-filter</code> läuft GPU-beschleunigt gut auf moderner Hardware,
verursacht auf schwächeren Geräten aber Bildratenabfälle.</p>
` + fuss()

writeFileSync(join(hier, 'variante-c-glas.html'), varianteC, 'utf8')
console.log('variante-c-glas.html')

// ---------------------------------------------------------------- D: Datennarrativ
const varianteD = kopf('LumeOS — Datennarrativ') + `
body { padding:0; }
.huelle { max-width:980px; margin:0 auto; padding:26px; }
.kapitel { min-height:78vh; display:grid; grid-template-columns:1fr 1fr; gap:34px;
  align-items:center; padding:56px 0; border-bottom:1px solid var(--border); }
.kapitel:last-child { border:none; }
.text h3 { font-size:22px; margin:0 0 10px; letter-spacing:-.01em; line-height:1.25; }
.text p { color:var(--fg-muted); margin:0 0 12px; max-width:44ch; }
.text .marke { font-size:10px; text-transform:uppercase; letter-spacing:.1em;
  color:var(--acc); margin-bottom:10px; }
.bild { background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius-lg); padding:22px; }

/* Erscheinen beim Scrollen */
.kapitel > * { opacity:0; transform:translateY(22px);
  transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
.kapitel.sicht > * { opacity:1; transform:none; }
.kapitel.sicht .bild { transition-delay:.12s; }

.verlauf { height:150px; display:flex; align-items:flex-end; gap:5px; }
.verlauf i { flex:1; border-radius:2px 2px 0 0; background:var(--surface-2);
  height:0; transition:height .8s cubic-bezier(.16,1,.3,1); }
.sicht .verlauf i { height:var(--h); }
.verlauf i.hoch { background:var(--acc-recov); }
.verlauf i.tief { background:var(--neg); }
.achse { display:flex; gap:5px; margin-top:7px; }
.achse span { flex:1; text-align:center; font-size:10px; color:var(--fg-dim); }

.paar { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.zelle { background:var(--surface-2); border-radius:var(--radius); padding:14px; text-align:center; }
.zelle .w { font-size:30px; font-weight:600; }
.zelle .l { font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:var(--fg-dim); }
.pfeil { text-align:center; color:var(--fg-subtle); font-size:11px; margin:9px 0; }

.streu { position:relative; height:170px; }
.streu i { position:absolute; width:9px; height:9px; border-radius:99px;
  background:var(--acc-nutri); opacity:0; transform:scale(.4);
  transition:opacity .5s, transform .5s cubic-bezier(.16,1,.3,1); }
.sicht .streu i { opacity:.85; transform:none; }
.streu .linie { position:absolute; left:0; right:0; height:1px; background:var(--border-strong);
  transform:rotate(-16deg); top:52%; }

.fazit { background:var(--surface); border:1px solid var(--acc);
  border-radius:var(--radius-lg); padding:22px; }
.fazit h3 { margin:0 0 8px; font-size:16px; }
.fazit p { color:var(--fg-muted); margin:0; }
.fortschritt { position:fixed; top:0; left:0; height:2px; background:var(--acc);
  width:0; z-index:9; transition:width .1s linear; }
` + kopfzeile('LumeOS — Datennarrativ', 'Variante D',
  'Aus Diagrammen wird eine Erzählung. Der Wochenrückblick führt schrittweise durch Zusammenhänge, statt sie nebeneinanderzustellen. Nicht für die tägliche Eingabe — für Buddy und für das Verstehen. Scrollen.') + `
<div class="fortschritt" id="fortschritt"></div>
<div class="huelle">

  <section class="kapitel">
    <div class="text">
      <div class="marke">Kapitel 1 — Beobachtung</div>
      <h3>Deine Erholung schwankte diese Woche stärker als sonst.</h3>
      <p>Die HRV lag an drei Tagen deutlich über deinem Mittel, an zwei Tagen darunter.
         Solche Ausschläge haben meist eine Ursache.</p>
    </div>
    <div class="bild">
      <div class="verlauf">
        <i class="hoch" style="--h:78%"></i><i style="--h:52%"></i><i class="tief" style="--h:30%"></i>
        <i style="--h:58%"></i><i class="hoch" style="--h:86%"></i><i class="tief" style="--h:34%"></i>
        <i class="hoch" style="--h:80%"></i>
      </div>
      <div class="achse"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div>
    </div>
  </section>

  <section class="kapitel">
    <div class="text">
      <div class="marke">Kapitel 2 — Vergleich</div>
      <h3>An den schwachen Tagen hast du spät gegessen.</h3>
      <p>Die letzte Mahlzeit lag im Mittel zwei Stunden und vierzig Minuten später
         als an den starken Tagen.</p>
    </div>
    <div class="bild">
      <div class="paar">
        <div class="zelle"><div class="l">starke Tage</div><div class="w zahl">18:40</div></div>
        <div class="zelle"><div class="l">schwache Tage</div><div class="w zahl">21:20</div></div>
      </div>
      <div class="pfeil">Unterschied 2 h 40</div>
      <div class="paar">
        <div class="zelle"><div class="l">HRV Ø</div><div class="w zahl" style="color:var(--pos)">72</div></div>
        <div class="zelle"><div class="l">HRV Ø</div><div class="w zahl" style="color:var(--neg)">44</div></div>
      </div>
    </div>
  </section>

  <section class="kapitel">
    <div class="text">
      <div class="marke">Kapitel 3 — Zusammenhang</div>
      <h3>Über acht Wochen zeigt sich dasselbe Muster.</h3>
      <p>Je später die letzte Mahlzeit, desto niedriger die HRV in der Nacht darauf.
         Der Zusammenhang ist deutlich, aber kein Beweis.</p>
    </div>
    <div class="bild">
      <div class="streu">
        <div class="linie"></div>
        <i style="left:6%;top:22%;transition-delay:.05s"></i><i style="left:18%;top:30%;transition-delay:.1s"></i>
        <i style="left:29%;top:26%;transition-delay:.15s"></i><i style="left:38%;top:44%;transition-delay:.2s"></i>
        <i style="left:47%;top:50%;transition-delay:.25s"></i><i style="left:56%;top:47%;transition-delay:.3s"></i>
        <i style="left:65%;top:62%;transition-delay:.35s"></i><i style="left:74%;top:70%;transition-delay:.4s"></i>
        <i style="left:83%;top:66%;transition-delay:.45s"></i><i style="left:91%;top:78%;transition-delay:.5s"></i>
      </div>
      <div class="achse"><span>18:00</span><span></span><span>20:00</span><span></span><span>22:00</span></div>
    </div>
  </section>

  <section class="kapitel">
    <div class="text">
      <div class="marke">Kapitel 4 — Vorschlag</div>
      <h3>Ein Versuch für nächste Woche.</h3>
      <p>Letzte Mahlzeit vor 20:00 an fünf Tagen. Ich vergleiche danach dieselben Werte
         und sage dir, ob es etwas gebracht hat.</p>
    </div>
    <div class="fazit">
      <h3>Buddy schlägt vor</h3>
      <p>Erinnerung um 19:15 · Auswertung nach sieben Tagen · jederzeit abschaltbar</p>
    </div>
  </section>

</div>
` + fuss(`<script>
const b=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('sicht')}),{threshold:.28})
document.querySelectorAll('.kapitel').forEach(k=>b.observe(k))
const f=document.getElementById('fortschritt')
addEventListener('scroll',()=>{const h=document.body.scrollHeight-innerHeight
  f.style.width=(h>0?scrollY/h*100:0)+'%'},{passive:true})
</script>`)

writeFileSync(join(hier, 'variante-d-narrativ.html'), varianteD, 'utf8')
console.log('variante-d-narrativ.html')

// ---------------------------------------------------------------- E: Ruhige Klinik
// Startet im Hellmodus. Sehr flache Kontraste, viel Weissraum, ein einziger Akzent.
const varianteE = kopf('LumeOS — Ruhige Klinik') + `
body { padding:32px 26px; }
.huelle { max-width:1080px; margin:0 auto; }
h1 { font-weight:500; letter-spacing:-.01em; }
.gitter { display:grid; grid-template-columns:250px 1fr 280px; gap:26px; align-items:start; }
.tafel { background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius-lg); padding:22px; }
.tafel h3 { margin:0 0 16px; font-size:13px; font-weight:600; letter-spacing:.01em; }

/* Koerperkarte */
.koerper { display:flex; justify-content:center; padding:8px 0; }
.koerper svg { width:150px; height:auto; }
.koerper .form { fill:var(--surface-2); stroke:var(--border-strong); stroke-width:1.5; }
.koerper .stelle { fill:var(--acc-medic); opacity:0; transform-origin:center;
  animation:pochen 3.4s ease-in-out infinite; }
@keyframes pochen { 0%,100% { opacity:.25; r:5 } 50% { opacity:.65; r:7 } }
.koerper .stelle:nth-of-type(2) { animation-delay:1.1s; }
.legende { margin-top:14px; font-size:11px; color:var(--fg-subtle); text-align:center; }

/* Werteliste mit Referenzbereich */
.wert { padding:13px 0; border-bottom:1px solid var(--border); }
.wert:last-child { border:none; }
.wert .kopf { display:flex; justify-content:space-between; align-items:baseline; }
.wert .name { font-size:13px; }
.wert .zahl2 { font-size:15px; font-weight:600; font-variant-numeric:tabular-nums; }
.wert .einheit { font-size:11px; color:var(--fg-subtle); margin-left:4px; font-weight:400; }
.bereich { position:relative; height:5px; border-radius:99px;
  background:var(--surface-2); margin-top:9px; }
.bereich .gut { position:absolute; top:0; bottom:0; border-radius:99px;
  background:color-mix(in oklch, var(--pos) 38%, transparent); }
.bereich .marke { position:absolute; top:-3px; width:2px; height:11px; border-radius:1px;
  background:var(--fg); transform:scaleY(0); transform-origin:center;
  animation:setzen .6s cubic-bezier(.16,1,.3,1) forwards; }
@keyframes setzen { to { transform:scaleY(1); } }
.bereich .marke.warn { background:var(--warn); }
.mini { display:flex; justify-content:space-between; font-size:10px;
  color:var(--fg-dim); margin-top:5px; }

.notiz { background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius-lg); padding:20px; }
.notiz p { color:var(--fg-muted); margin:0 0 12px; font-size:12px; }
.termin { display:flex; justify-content:space-between; padding:9px 0;
  border-bottom:1px solid var(--border); font-size:12px; }
.termin:last-child { border:none; }
.termin span { color:var(--fg-muted); }
.ruhig { color:var(--fg-subtle); font-size:11px; margin-top:20px; max-width:78ch; }
` + kopfzeile('LumeOS — Ruhige Klinik', 'Variante E',
  'Der Gegenentwurf: ruhig, klinisch, ohne Dringlichkeit. Ein einziger Akzent, flache Kontraste, viel Raum. Bewegung nur dort, wo sie etwas verortet — der pochende Punkt auf der Körperkarte, die Marke, die sich in den Referenzbereich setzt. Für Medizin und für Werte, bei denen Beunruhigung fehl am Platz ist.') + `
<div class="huelle">
<div class="gitter">

  <div class="tafel">
    <h3>Körperkarte</h3>
    <div class="koerper">
      <svg viewBox="0 0 100 210">
        <ellipse class="form" cx="50" cy="20" rx="14" ry="17"/>
        <rect class="form" x="43" y="37" width="14" height="12" rx="5"/>
        <path class="form" d="M30 50 Q50 44 70 50 L74 108 Q50 116 26 108 Z"/>
        <path class="form" d="M30 52 L16 100 L21 104 L34 60 Z"/>
        <path class="form" d="M70 52 L84 100 L79 104 L66 60 Z"/>
        <path class="form" d="M34 112 L30 196 L40 196 L47 118 Z"/>
        <path class="form" d="M66 112 L70 196 L60 196 L53 118 Z"/>
        <circle class="stelle" cx="50" cy="76" r="5"/>
        <circle class="stelle" cx="36" cy="128" r="5"/>
      </svg>
    </div>
    <p class="legende">2 Bereiche mit Auffälligkeiten</p>
  </div>

  <div class="tafel">
    <h3>Blutwerte — Befund vom 04.07.2026</h3>

    <div class="wert">
      <div class="kopf"><span class="name">Ferritin</span>
        <span class="zahl2">142<span class="einheit">µg/l</span></span></div>
      <div class="bereich"><i class="gut" style="left:20%;right:22%"></i>
        <i class="marke" style="left:56%;animation-delay:.1s"></i></div>
      <div class="mini"><span>30</span><span>Referenz 30–300</span><span>400</span></div>
    </div>

    <div class="wert">
      <div class="kopf"><span class="name">Vitamin D</span>
        <span class="zahl2">24<span class="einheit">ng/ml</span></span></div>
      <div class="bereich"><i class="gut" style="left:38%;right:12%"></i>
        <i class="marke warn" style="left:30%;animation-delay:.2s"></i></div>
      <div class="mini"><span>0</span><span>Referenz 30–80 — leicht darunter</span><span>100</span></div>
    </div>

    <div class="wert">
      <div class="kopf"><span class="name">HbA1c</span>
        <span class="zahl2">5,1<span class="einheit">%</span></span></div>
      <div class="bereich"><i class="gut" style="left:8%;right:44%"></i>
        <i class="marke" style="left:32%;animation-delay:.3s"></i></div>
      <div class="mini"><span>4</span><span>Referenz 4,0–5,6</span><span>8</span></div>
    </div>

    <div class="wert">
      <div class="kopf"><span class="name">CRP</span>
        <span class="zahl2">0,8<span class="einheit">mg/l</span></span></div>
      <div class="bereich"><i class="gut" style="left:4%;right:60%"></i>
        <i class="marke" style="left:14%;animation-delay:.4s"></i></div>
      <div class="mini"><span>0</span><span>Referenz unter 5</span><span>20</span></div>
    </div>
  </div>

  <div>
    <div class="notiz">
      <h3 style="margin:0 0 9px;font-size:13px">Einordnung</h3>
      <p>Ein Wert liegt leicht unter dem Referenzbereich. Das ist im Winter häufig
         und meist ohne Beschwerden.</p>
      <p style="margin:0">Eine Kontrolle in acht Wochen genügt.</p>
    </div>
    <div class="notiz" style="margin-top:14px">
      <h3 style="margin:0 0 9px;font-size:13px">Verlauf</h3>
      <div class="termin"><span>04.07.2026</span><b>Grosses Blutbild</b></div>
      <div class="termin"><span>18.03.2026</span><b>Kontrolle</b></div>
      <div class="termin"><span>02.11.2025</span><b>Erstbefund</b></div>
    </div>
  </div>

</div>
<p class="ruhig">Diese Variante startet im Hellmodus — der Umschalter oben zeigt,
ob sie im Dunkeln trägt. Referenzbereiche sind als Fläche dargestellt, nicht als
Grenzwert: ein Wert ausserhalb ist eine Beobachtung, kein Alarm.</p>
</div>
` + fuss(`<script>document.documentElement.dataset.theme='light'</script>`)

writeFileSync(join(hier, 'variante-e-klinik.html'), varianteE, 'utf8')
console.log('variante-e-klinik.html')
