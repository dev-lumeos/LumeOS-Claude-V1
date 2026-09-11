---
nr: G-417
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-416
entscheidung: E-80
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 58726c65
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-insights.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-417 — zwei Spalten und der Score

## Auftrag

Tom, 2026-09-08, nach dem Blick auf den neuen Stand.

**Beauftragt am 2026-09-08.**

---

## 1 · Der Nutrition score rechnet immer noch nicht

`[cmd]` **Selbst gemessen (`backup/score-jetzt.png`), ZWEI
Sperren:**

    Level multiplier   pro - offen (G-228)
    Ballaststoffe      kein Ziel im Schema

`[read]` **Sperre 2 ist VERALTET.**

`[cmd]` **C-464 ist live:** `goals.nutrition_targets.fiber_g`
**existiert, `dev` hat 30,0 g, `herkunft: formel`.**

`[cmd]` **Fuenf Nutzer haben den Wert.**

`[read]` **Die Kachel zeigt die alte Meldung** ? **sie liest die
neue Spalte nicht.**

`[read]` **Sperre 1 haelt zu Recht** ? **E-80 ist entschieden,
aber nicht gebaut.**

### E-80 bauen

`[cmd]` **`docs/entscheidungen/E-80-vier-erfahrungsstufen.md`:**

    beginner  0.75
    advanced  0.90
    pro       1.00
    elite     1.10

`[cmd]` **`public.profiles.experience_level` ist die Quelle**
(G-412), **CHECK: `beginner | advanced | pro | elite`.**

`[read]` **Vier Werte, vier Faktoren** ? **kein `intermediate`.**

`[cmd]` **Codex misst in C-464, WO die Faktoren hingehoeren** ?
`packages/scoring/` **oder eine Tabelle im Modul.**

`[read]` **Wenn sein Bericht das schon beantwortet: dorthin.**
`[read]` **Sonst: in das Modul, wo die Kachel heute rechnet.**

`[cmd]` **Und die Zeile *,,Source of level"* bleibt** ? **sie
sagt, woher der Wert kommt.**

### Danach

`[read]` **`dev` steht auf `pro` = 1.00, und Ballaststoffe haben
ein Ziel.**

`[read]` **Der Score muesste `0.85 von 1.00` -> `1.00 von 1.00`
zeigen, und eine ZAHL statt eines Grundes.**

---

## 2 · Die Kacheln richten sich immer noch aus

Tom: *,,insights hat er die kacheln immer noch ausgerichtet an dem
links ? das sind zwei unabhaengige spalten."*

`[cmd]` **Im Bild gemessen:** *Calorie balance* **und** *Macro
split* **enden auf derselben Hoehe.**

`[read]` **G-416 hat `align-items` gesetzt** ? **das reicht
nicht.**

`[read]` **Ein Raster mit zwei Spalten haelt Zeilen zusammen** ?
**auch mit `align-items: start` beginnt Zeile 2 erst, wenn beide
Kacheln aus Zeile 1 fertig sind.**

`[read]` **Was Tom will, sind ZWEI UNABHAENGIGE SPALTEN** ?
**jede fuellt sich fuer sich.**

`[cmd]` **Bauformen, die das koennen:**

    zwei <div> nebeneinander, je ein eigener Stapel
    oder CSS columns
    oder ein Masonry-Raster

`[read]` **Miss, welche zu `v2-` passt** ? **und ob es das schon
irgendwo gibt.**

`[cmd]` **`.v2-grid` NICHT anfassen** ? **217 Aufrufer** (G-416).

---

## 3 · Die neue Anordnung

Tom:

    links    Calorie balance
             Verlauf
             Makros im Detail

    rechts   Macro split
             Auffaellige Naehrstoffe
             Tagesdeckung

    darunter Micronutrient trend

`[read]` **Drei Kacheln je Spalte, eine ueber die volle
Breite.**

`[read]` **Die Ordnung folgt dem Inhalt:**

    links    Kalorien -- Bilanz, Verlauf, Aufschluesselung
    rechts   Verteilung -- Makros, Auffaelligkeiten, Deckung
    unten    der Naehrstoffverlauf ueber 30 Tage

`[cmd]` **`Micronutrient trend` hat in der Vorlage
`gridColumn: span 2`** (`module-nutrition.jsx:393`) ? **volle
Breite ist die Vorlage.**

---

## Abnahmebedingungen

    A1  der Score zeigt eine ZAHL, nicht zwei Gruende.
        Bildschirmfoto.
    A2  E-80 gebaut: vier Stufen, vier Faktoren. Wo?
        Begruendet.
    A3  die Ballaststoffzeile liest fiber_g. Gemessen:
        0.85 -> 1.00.
    A4  zwei unabhaengige Spalten. Gegenprobe: eine Kachel
        links hoeher machen -- rechts darf sich NICHTS
        verschieben. Zwei Fotos.
    A5  die Anordnung wie oben. Foto.
    A6  Micronutrient trend ueber die volle Breite.
    A7  .v2-grid unveraendert. Belegt.
    A8  apps/web 1559 oder mehr.

## Was nicht zu tun ist

**Die Mockup-Referenz BLEIBT** ? **Tom nimmt sie selbst ab.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-465.**
**`.v2-grid` nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 laeuft** (PID 1332072, `server.py start`).
`[cmd]` **3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 + A3 — der Score ist eine ZAHL: 86 von 100

**Am Schirm gemessen** (`docs/bilder/g417/score.png`):

    ok        86  score
    protein  1.00 x 0.30
    calorie  0.87 x 0.25
    carbs    0.82 x 0.15
    fat      0.48 x 0.15
    fiber    1.00 x 0.15      <- vorher „— x 0.15"

    Level multiplier    pro · x1.00   (E-80 · packages/scoring)
    Gewicht gerechnet   1.00 von 1.00

`[cmd]` **Vorher standen dort zwei Gruende, jetzt zwei Zahlen.**

`[cmd]` **Unabhaengig nachgerechnet**, bevor der Schirm angesehen
wurde — dieselben Werte aus `psql`:

    dev@lumeos.app, 2026-09-11
    ist    2178 kcal · 178 P · 256 KH · 36 F · 55 Ballast
    ziel   2500 kcal · 170 P · 313 KH · 75 F · 30 Ballast
    -> SCORE 86, Gewicht 1.00

`[read]` **Die Rechnung stimmt mit dem Schirm ueberein** — beide 86.

**Das Gewicht: 0.85 -> 1.00.** `[cmd]` **Als Gegenprobe dieselbe
Rechnung mit `fiber_g: null`** ergibt wieder 0,85 — **die Zeile
rechnet wirklich mit, sie steht nicht nur da.**

### A3 — der Vermerk war veraltet, nicht der Leseweg

`[cmd]` **`goals.zielwerte_am()` gab `fiber_g` schon zurueck** —
gemessen an `pg_get_function_result`:

    zielwerte_am       TABLE(… fat_g numeric, fiber_g numeric, …)
    berechne_zielwerte TABLE(… fat_g numeric, fiber_g numeric, …)

`[read]` **Die Datenbank war fertig, der TypeScript-Typ liess die
Spalte fallen.** `[cmd]` **Drei Stellen nachgezogen:** `Zielwerte`,
`Zielvorschlag` und der Rueckleseweg in `zielwerte-write.ts`.

`[read]` **Die letzte haette sonst still `null` zurueckgegeben**,
nachdem sie den Wert gerade geschrieben hat.

### A2 — E-80 gebaut, in `packages/scoring`

**Codex hat die Frage in C-464 beantwortet**, und der Auftrag sagt,
dann dorthin:

> *„Die Faktoren sind reine Score-Regeln. `SPEC_09_SCORING.md:9-13`
> verlangt pure Funktionen und nennt `packages/scoring/src/
> nutrition.ts`; dieses Paket fehlt derzeit. Eine Modultabelle waere
> falsch; C-464 baut die Faktoren nicht."*

`[cmd]` **Das Paket gab es nicht — jetzt gibt es es.** Vier Dateien,
zehn eigene Proben.

    beginner 0.75 · advanced 0.90 · pro 1.00 · elite 1.10

`[cmd]` **Gegen die Spec entschieden, und zwar belegt:**
`SPEC_09:441-445` nennt noch `intermediate 0,90`, **aber der CHECK
auf `public.profiles.experience_level` kennt den Wert nicht.**
`[read]` **E-80 ist juenger UND passt zum Schema** — ein Faktor fuer
`intermediate` waere einer fuer etwas, das niemand haben kann.

**ZWEI UNTERSCHIEDE ZUR ALTEN RECHNUNG, beide aus der Spec:**

`[cmd]` **1 — Der Faktor skaliert die ZIELE, nicht den Score**
(`SPEC_09:33-40`, `adj = ziel * faktor`). `[read]` **Das ist keine
Feinheit:** ein `beginner` bekommt ein leichteres Ziel und kann es
VOLL erfuellen. **Bei der alten Rechnung war sein Hoechstwert 0,75** —
sie bestrafte die Stufe, statt Erfuellung zu belohnen.

`[cmd]` **2 — Kalorien zaehlen beidseitig** (`:48-51`): zu viel ist
genauso eine Abweichung wie zu wenig. `[read]` **Bei Protein ist mehr
kein Fehler** — dort weiter `min(ist/ziel, 1)`.

**UND: die alte Tabelle ist kein zweiter Ort mehr.**

`[cmd]` **`lib/nutrition/stufenfaktor.ts` trug eine EIGENE Tabelle**
mit `advanced 1.00` und `pro: null` — **ohne Aufrufer ausser dem
Entwurf, und im Widerspruch zu E-80.** `[read]` **Genau die Sorte
toter Code, die eine alte Regel konserviert, bis jemand sie fuer die
geltende haelt.** `[cmd]` **Sie reicht jetzt das Paket durch.**

### A4 — zwei unabhaengige Spalten, mit der Gegenprobe

**Tom:** *„das sind zwei unabhaengige spalten."*

`[cmd]` **`align-items: start` (G-416) war nicht der Fehler, sondern
zu wenig.** `[read]` **Der Grund ist die RASTERZEILE:** in einem
zweispaltigen Raster beginnt Zeile 2 erst, wenn BEIDE Kacheln der
Zeile 1 fertig sind. **`align-items` richtet die Kachel IN ihrer Zeile
aus — die Zeile bleibt so hoch wie ihr groesstes Kind.**

`[cmd]` **Jetzt zwei Stapel nebeneinander** (`.v2-zwei-saeulen` /
`.v2-saeule`), jeder fuellt fuer sich.

**DIE GEGENPROBE** (`tools/_g417-gegenprobe.mjs`) — erste Kachel
LINKS um 300 px aufgeblasen:

    LINKS    Calorie balance     hoehe 461 -> 761  (+300)
             Verlauf             oben  708 -> 1008 (+300)
             Makros im Detail    oben 1110 -> 1410 (+300)

    RECHTS   Macro split         oben  231 -> 231  (+0)
             Auffaellige         oben  631 -> 631  (+0)
             Tagesdeckung        oben 1380 -> 1380 (+0)

`[cmd]` **RECHTS verschoben: 0 von 3.**

**UND DIE GEGENPROBE ZUR GEGENPROBE** (`_g417-gegenprobe-alt.mjs`) —
`[read]` **eine Probe, die nur gruen werden kann, misst nichts.**
`[cmd]` **Dieselben 300 px am ALTEN Raster, mit `align-items: start`:**

    RECHTS   Macro split         oben  16 ->  16  (+0)
             Auffaellige         oben 519 -> 845  (+326)
             Tagesdeckung        oben 1294 -> 1620 (+326)

`[read]` **Die alte Bauform faellt bei derselben Probe** — 2 von 3
Kacheln verschoben. **Die Frage war echt.**

**Bilder:** `docs/bilder/g417/insights.png`, `gegenprobe.png`

### A5 — die Anordnung, am Schirm nachgemessen

    LINKS                          RECHTS
    Calorie balance    231-692     Macro split      231-615
    Verlauf            708-1094    Auffaellige      631-1364
    Makros im Detail   1110-1569   Tagesdeckung     1380-1635

`[read]` **Man sieht die Unabhaengigkeit an den Zahlen:** links endet
die erste Kachel bei 692, **rechts hat die zweite da schon bei 631
angefangen.**

`[cmd]` **Die Zuordnung wurde ueber die Bildschirmtitel geprueft**,
nicht ueber die Komponentennamen geraten — `MakroschnittKachel`
heisst am Schirm „Macro split · 30d avg".

### A6 — Micronutrient trend, volle Breite

    Saeule je             518 px
    Micronutrient trend  1052 px    (= die ganze Inhaltsbreite)
    oben bei             1651       (unter beiden Saeulen)

`[cmd]` **Die Vorlage setzt `gridColumn: "span 2"`**
(`module-nutrition.jsx:393`). `[read]` **Hier steht die Kachel NEBEN
den Saeulen statt in einer** — dann braucht sie keine Spannweite, sie
hat die Breite schon.

### A7 — `.v2-grid` unveraendert

    git status --porcelain packages/ui/    ->  0 Zeilen
    git diff --stat packages/ui/src/styles ->  leer

`[cmd]` **301 Vorkommen von `v2-grid` im Haus, keines angefasst.**
`[read]` **Die Ausnahme steht neben der Route**, wie schon bei
G-416.

### A8 — die Proben

    apps/web         1570 / 1570 gruen   (1559 gefordert)
    packages/scoring   10 / 10 gruen     (neu)
    apps/coach         65 / 65 gruen     (unberuehrt)
    tsc apps/web       EXIT 0
    tsc packages/scoring EXIT 0

**NEUN GEGENPROBEN, ALLE ROT** (`tools/_g417-sabotage.mjs`):

    die Kachel rechnet den Score wieder selbst    -> ROT
    das Ballaststoffziel wird fallengelassen      -> ROT
    pro verliert seinen Faktor wieder             -> ROT
    der Faktor skaliert wieder den Score          -> ROT
    intermediate kommt zurueck                    -> ROT
    die Saeule wird wieder ein Raster             -> ROT
    die Anordnung wird vertauscht                 -> ROT
    der Verlauf wandert in eine Saeule            -> ROT
    die alte Faktortabelle kehrt zurueck          -> ROT

`[cmd]` **Jede Probe prueft ZUERST, ob die Sabotage ueberhaupt
ankommt** — ein Ersetzen, das ins Leere laeuft, sieht aus wie ein
blinder Waechter (Lehre aus G-410). **Alle neun kamen an.**
`[cmd]` **Nach dem Zuruecksetzen wieder gruen.**

`[read]` **Die Waechter rufen die Wirkung auf, nicht das Wort:** der
Score wird mit den echten Zahlen von `dev` gerechnet (86), und die
Ballaststoffzeile wird gegen dieselbe Rechnung OHNE Ziel gehalten
(0,85).

## Fuenf Waechter, deren Zusage ersetzt wurde

`[read]` **Geprueft wurde die Zusage, nicht der Wortlaut.**

`[cmd]` **1 — „kein Ballaststoffziel wird erfunden" (G-412).** Die
Zusage war *nichts erfinden*. `[cmd]` **Seit C-464 gibt es das Ziel**
— **jetzt heisst dieselbe Zusage LESEN statt offenlassen.** Der alte
Waechter haette den neuen Wert verboten.

`[cmd]` **2 — „`pro` hat keinen geratenen Faktor" (G-283).** Die
Zusage war *kein GERATENER Wert*, nicht *`pro` bleibt leer*.
`[cmd]` **E-80 hat ihn entschieden** — **ein entschiedener ist kein
geratener.**

`[cmd]` **3 — „der Score raet keinen Stufenfaktor" (G-412).**
Dasselbe. `[read]` **Der echte Fall bleibt geprueft:** ein
UNBEKANNTER Name bekommt weiter keinen Score.

`[cmd]` **4 — „der Stufenfaktor liegt ausserhalb der Client-Grenze"
(G-412).** `[read]` **Die Gefahr ist dieselbe geblieben, nur der Ort
hat sich geaendert** — der Waechter zeigt jetzt auf
`packages/scoring` und verbietet zusaetzlich den Import aus dem
Entwurf.

`[cmd]` **5 — „die Kacheln gleichen ihre Hoehe nicht mehr ab"
(G-416).** `[cmd]` **G-417 hat die Zusage VERSCHAERFT** — der
Waechter prueft jetzt die neue Mechanik (Stapel statt Rasterzeile)
und verbietet die Rueckkehr ins Zweierraster.

`[cmd]` **Und `STUFE_OFFEN_SATZ` ist entfallen** — er galt dem Fall
*„gueltige Stufe, kein Faktor"*, **und den gibt es seit E-80 nicht
mehr.** `[read]` **Ein Satz fuer einen Fall, den es nicht gibt, wird
irgendwann auf einen anderen angewendet.**

## Was NICHT geaendert wurde

**1 — `.v2-grid`.** `[cmd]` **301 Vorkommen.** Wie beauftragt.

**2 — Die Mockup-Referenz.** `[cmd]` **Wie beauftragt** — Tom nimmt
sie selbst ab.

**3 — `supabase/`.** `[cmd]` **Nichts angefasst.** `[read]`
**Hinweis:** `supabase/_pipeline/kette.json` traegt eine Aenderung im
Arbeitsbaum (C-465, `465_marketplace_training_delivery`) — **die ist
nicht von mir**, Codex arbeitet daran.

**4 — Nicht committet, nicht gestaged.**

## Ein Befund nebenbei

`[cmd]` **Die juengste Zeile in `nutrition.daily_summary` fuer `dev`
ist der 2026-11-16** — **zwei Monate in der Zukunft.** `[read]` **Fuer
diesen Auftrag ohne Folgen** (die Kachel liest den gewaehlten Tag, und
heute hat eine Zeile), **aber wer ueber „den letzten Tag" misst,
trifft einen Seed-Tag, den es noch nicht gibt.**

## Neustart

`[cmd]` **NOETIG** — **`packages/scoring` ist neu** und
`apps/web/package.json` hat eine Abhaengigkeit mehr. `[read]` **Die
Schale liest Arbeitsbereiche beim Start.**

`[cmd]` **Die Messungen dieses Berichts liefen auf dem laufenden
3200er und zeigen die neuen Werte** — Next hat die Dateien heiss
nachgeladen. `[read]` **Ein Neustart ist trotzdem faellig, bevor
jemand anderes misst.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  Score 86, gruener Ring, "ok"
    A2  E-80 in packages/scoring, vier Faktoren
    A3  Gewicht 1.00 von 1.00
    A4  Gegenprobe belegt
    A5  die Anordnung wie verlangt
    A6  Micronutrient trend volle Breite
    A7  .v2-grid unveraendert
    A8  web 1570, scoring 10, coach 65

`[cmd]` **Selbst gemessen: `packages/scoring/src/nutrition.ts`
mit `beginner 0.75`, `advanced 0.90`, `pro 1.00`, `elite 1.10`,
und Tests darauf.**

`[cmd]` **`score.png`:** `Level multiplier: E-80 - packages/scoring
- pro x1.00`, `Gewicht gerechnet 1.00 von 1.00`.

`[cmd]` **`insights.png`:** **links Calorie balance, Verlauf,
Makros im Detail** ? **rechts Macro split, Auffaellige
Naehrstoffe.**

`[read]` **Die rechte Spalte beginnt ihre zweite Kachel, waehrend
links noch der Verlauf laeuft** ? **unabhaengig.**

### Keine der beiden Sperren war ein Baufehler

> *,,`goals.zielwerte_am()` gab `fiber_g` laengst zurueck, der
> TypeScript-Typ liess die Spalte fallen. Der Vermerk *kein Ziel
> im Schema* war schlicht veraltet."*

`[read]` **Die Datenbank hatte es, die Schnittstelle nicht** ?
**und die Meldung am Schirm log seit C-464.**

### A2 — zwei Abweichungen zur alten Rechnung, beide belegt

`[cmd]` **`SPEC_09_SCORING.md:33-40`: der Faktor skaliert die
ZIELE, nicht den fertigen Score.**

> *,,Sonst waere der Hoechstwert eines `beginner` 0,75 gewesen."*

`[read]` **Ein Anfaenger bekommt niedrigere Ziele, nicht einen
gedeckelten Score** ? **das ist der Unterschied zwischen
*milder bewerten* und *nie voll erreichen koennen*.**

`[cmd]` **Und `:48-51`: Kalorien zaehlen BEIDSEITIG** ? **zu viel
ist so weit vom Ziel wie zu wenig.**

### Die alte Tabelle widersprach E-80

`[cmd]` **`lib/nutrition/stufenfaktor.ts` trug `advanced 1.00`
und `pro: null`** ? **ohne Aufrufer.**

`[read]` **Sie reicht das Paket jetzt durch** ? **eine Stelle,
nicht zwei.**

### A4 — die Gegenprobe in beide Richtungen

`[cmd]` **Links 300 px aufgeblasen -> rechts 0 von 3 Kacheln
verschoben.**

`[cmd]` **Dieselben 300 px gegen die ALTE Bauform -> 2 von 3
Kacheln um 326 px verschoben.**

> *,,`align-items: start` war nicht falsch, nur zu wenig ? eine
> Rasterzeile bindet, egal wie man in ihr ausrichtet."*

`[read]` **Er hat belegt, dass die Probe etwas misst** ? **nicht
nur, dass sie gruen ist.**

### Der Befund nebenbei

`[cmd]` **Die juengste Zeile in `nutrition.daily_summary` fuer
`dev` ist der 2026-11-16** ? **zwei Monate in der Zukunft.**

`[read]` **Fuer diesen Auftrag folgenlos** ? **aber wer ueber
*den letzten Tag* misst, trifft einen Seed-Tag, den es noch nicht
gibt.**

**Abgenommen.**

