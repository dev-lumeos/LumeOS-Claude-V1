---
nr: G-416
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-412
entscheidung: E-80
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-insights.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-416 — Hoehen, Flaechen, Deckkraft

## Auftrag

Tom, 2026-09-08, nach dem Blick auf Diary und Insights.

**Beauftragt am 2026-09-08.**

`[read]` **Die Vorlage liegt in
`docs/spezifikation/10-plattform/design-system/coach-portal-draft/`
? `module-nutrition.jsx` und `module-charts-pro.jsx`.**

---

## 1 · Die Flaeche unter der Kurve FEHLT ganz

`[cmd]` **Selbst gemessen am Schirm
(`backup/nut-insights.png`):** **bei *Calorie balance* ist die
Linie da, geglaettet, mit gestricheltem Ziel** ? **aber KEIN
Farbverlauf darunter.**

`[cmd]` **Dasselbe bei *Verlauf - Kalorien - 30 Tage*.**

`[cmd]` **`primitives.tsx` traegt `linearGradient` und
`showArea`** ? **die Bauteile sind da.**

`[read]` **Miss, warum die Flaeche nicht erscheint** ? **wird
`showArea` nicht gesetzt, oder greift der Verlauf nicht?**

`[cmd]` **Die Vorlage:** `module-charts-pro.jsx:115` ?
`showArea = true` **als Vorgabe, Flaeche nur bei `si === 0`.**

## 2 · Verlauf: Flaeche ja, Glaettung NEIN

Tom: *,,die grafik auch abbilden wie in calorie balance, aber
nicht geglaettet ? sprich die untere flaeche schattiert."*

`[read]` **Zwei verschiedene Kurven:**

    Calorie balance   geglaettet + Flaeche
    Verlauf           ECKIG + Flaeche

`[read]` **Also braucht `LineChart` einen Schalter** ? **oder der
Verlauf ruft eine andere Fassung.**

`[cmd]` **`module-charts-pro.jsx` hat `smooth(pts)` als eigene
Funktion** ? **sie laesst sich ueberspringen.**

## 3 · Jede Kachel hat ihre eigene Hoehe

Tom: *,,jede kachel hat ihre hoehe, die sollen nicht mit den
anderen kacheln daneben auf die hoehe abgeglichen werden."*

`[cmd]` **Das Raster gleicht heute ab** ? **`v2-grid` mit
`align-items: stretch` als Vorgabe.**

`[read]` **`align-items: start`** ? **dann nimmt jede Kachel ihre
eigene Hoehe.**

`[read]` **Und die Verlaufskachel passt sich an die Daten an** ?
**Tom: *,,die kachelhoehe auf die daten darin anpassen"*.**

## 4 · Tagesdeckung: Farben zu schrill, Box zu gross

`[cmd]` **Heute: kraeftiges Gruen und Gelb, Zellen gross.**

`[cmd]` **Die Vorlage, `NutrientHeatmap` in
`module-nutrition.jsx:399`:**

    Zellhoehe 16, Abstand 2
    Beschriftungsspalte 80 px
    >= 0.8  var(--pos)
    >= 0.5  var(--warn)
    sonst   var(--neg)

`[cmd]` **Und die DECKKRAFT** ? **messen, ob die Vorlage
`opacity` setzt oder eine gedaempfte Farbe nimmt.**

`[read]` **G-412 hat auf 411 px gestaucht** ? **Tom sagt, es ist
immer noch zu gross.**

`[read]` **Die Zellhoehe 16 der Vorlage ist der Massstab** ?
**nicht die Kachelhoehe.**

## 5 · Micronutrient trend: dasselbe, plus die Durchschnittsspalte

Tom: *,,rechts fehlt durchschnittsprozentangabe, siehe mockup
referenz Micronutrient trend."*

`[cmd]` **`module-nutrition.jsx:399ff` nachsehen** ? **die
Vorlage hat rechts je Zeile einen Prozentwert.**

`[read]` **Das ist der Schnitt ueber die 30 Tage** ? **eine
Zahl je Naehrstoff.**

`[cmd]` **Und die Deckkraft wie bei 4.**

## 6 · Diary: Deckung je Naehrstoff 30 Prozent hoeher

Tom: *,,30% hoeher bauen, dass ein bisschen mehr direkt sehbar
sind."*

`[cmd]` **Heute zeigt die Kachel acht Naehrstoffe** ? **messen,
wie viele bei 30 Prozent mehr Hoehe hineinpassen.**

`[read]` **Mehr Hoehe, nicht kleinere Zeilen.**

## 7 · Und eine Zahl stimmt nicht

`[cmd]` **Sein Bericht sagte *,,8 von 30 am Ziel"*.**

`[cmd]` **Am Schirm steht `7 von 30`.**

`[read]` **Messen, welche stimmt** ? **und ob sich die Zahl
zwischen Bericht und Abnahme geaendert hat (neue Daten) oder ob
eine der beiden falsch ist.**

---

## Abnahmebedingungen

    A1  die Flaeche unter beiden Kurven. Warum sie fehlte:
        gemessen.
    A2  Verlauf: eckig MIT Flaeche, Calorie balance
        geglaettet MIT Flaeche. Zwei Fotos.
    A3  jede Kachel eigene Hoehe. Foto vorher/nachher,
        die Hoehen gemessen.
    A4  Tagesdeckung: Zellhoehe 16 wie die Vorlage,
        Deckkraft gemessen und angeglichen.
    A5  Micronutrient trend: dieselbe Deckkraft, plus
        die Durchschnittsspalte rechts.
    A6  Diary: Deckung je Naehrstoff 30 % hoeher.
        Zahl: Naehrstoffe sichtbar vorher/nachher.
    A7  "7 von 30" oder "8 von 30"? Gemessen.
    A8  apps/web 1552 oder mehr.

## Was nicht zu tun ist

**Die Mockup-Referenz im Insights-Block BLEIBT** ? **Tom: *,,das
kommt weg, wenn ich es abgenommen habe."***

**Nichts in `supabase/`** ? **Codex arbeitet an C-463.**
**Keine Farbe erfinden** ? **die Vorlage nennt sie.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — die Flaeche war DA, nur unsichtbar

`[cmd]` **Nicht im Quelltext geraten, sondern die Bildpunkte
gelesen** (`tools/_g416-pixel.mjs`) — eine senkrechte Reihe durch
das Diagramm:

    y=  0   rgb(22,23,26)   Grund
    y= 72   rgb(48,43,39)   unter der Kurve
    y= 90   rgb(41,37,34)
    y=108   rgb(36,34,32)
    y=126   rgb(31,30,30)
    y=180   rgb(22,23,26)   Grundlinie

`[cmd]` **Der Verlauf wurde gemalt** — warm getoent, sauber
ausblendend. `[cmd]` **Aber nur 26 RGB-Stufen ueber dem Grund**, und
das ist auf dunklem Hintergrund nicht zu sehen.

**Im Browser zusaetzlich geprueft** (`tools/_g416-flaeche.mjs`):

    Flaechenpfad   556x166, fill="url(#R2f9ifnt9uj6-0)"
    aufgeloest     url("#R2f9ifnt9uj6-0")   — gefunden
    Verlaufsmarken oklch(0.78 0.1 70) bei 0.22 -> 0

`[read]` **Kein Baufehler** — die Vorlage nennt 0,22, **zeichnet
aber auf hellerem Grund.** `[cmd]` **Hier 0,45 auf 0,02.**

**Bild:** `docs/bilder/g416/bilanz.png`

### A2 — Verlauf eckig MIT Flaeche

**Tom:** *„die grafik auch abbilden wie in calorie balance, aber
nicht geglaettet — sprich die untere flaeche schattiert."*

    Calorie balance   geglaettet + Flaeche   bilanz.png
    Verlauf           ECKIG + Flaeche        verlauf.png

`[cmd]` **`LineChart` hat einen Schalter bekommen:** `smooth`,
Vorgabe `true` wie die Vorlage. `[read]` **Ein Schalter, keine
zweite Komponente** — sonst laufen zwei Diagramme auseinander.

`[cmd]` **Der Verlauf ist eine eigene SVG** (`TrendGrafik`), die
Luecken bricht. `[cmd]` **Deshalb `flaecheMitLuecken()` daneben** —
**je zusammenhaengendem Stueck eine eigene Flaeche.** `[read]` **Eine
durchgehende Flaeche haette Tage behauptet, die es nicht gibt.**

### A3 — jede Kachel ihre eigene Hoehe

**Vorher gemessen** — paarweise identisch:

    Calorie balance   461    Macro split        461
    Verlauf           514    Tagesdeckung       514
    Makros im Detail  733    Auffaellige        733

`[cmd]` **`align-items` stand auf `normal`** — im Raster heisst das
`stretch`.

**Nachher:**

    Calorie balance   461    Macro split        384
    Verlauf           386    Tagesdeckung       255
    Makros im Detail  458    Auffaellige        733

`[read]` **NICHT `.v2-grid` geaendert** — `[cmd]` **217 Aufrufer im
Haus**, und eine Kachelreihe, die ihre Hoehe teilt, ist anderswo
gewollt. `[cmd]` **Eine eigene Klasse `v2-eigene-hoehe` daneben**,
nur auf den Nutrition-Rastern.

### A4 — Tagesdeckung: die Masse der Vorlage

`[cmd]` **Gemessen, was die Vorlage setzt**
(`module-nutrition.jsx:419-423`):

    height: 16
    gap: 2
    Beschriftungsspalte 80 px
    opacity: 0.25 + v * 0.7     <- DAS fehlte
    background: pos / warn / neg

`[read]` **Die Deckkraft haengt am WERT** — ein schwacher Tag ist
blass, ein starker kraeftig. `[cmd]` **G-412 setzte pauschal 0,85**,
und genau das machte die Farben schrill.

`[cmd]` **Und `aspectRatio: '1'` war der Grund fuer die Groesse** —
das Feld wuchs mit der Kachelbreite auf rund 50 px. `[cmd]`
**Jetzt `height: 16` wie die Vorlage.**

    Tagesdeckung   514 px  ->  255 px

`[read]` **Nicht die Kachel gestaucht, sondern die Zelle auf ihr
Mass gebracht** — Toms Hinweis: *„Die ZELLHOEHE 16 ist der
Massstab."*

### A5 — Micronutrient trend: dieselbe Deckkraft, plus Schnitt

`[cmd]` **Dieselbe Formel** `0.25 + v * 0.7`.

`[cmd]` **Die Schnittspalte rechts, 40 px** — wie die
Mockup-Referenz (`fehlende-kacheln.tsx:120`). `[cmd]` **Der Schnitt
ueber die BELEGTEN Tage**, nicht ueber alle: **eine Luecke zaehlt
nicht als null**, sonst zoege sie den Wert nach unten.

**Bild:** `docs/bilder/g416/trend.png` — 238 %, 60 %, 155 %, 80 %,
155 %, 227 %, 338 %, 81 %.

### A6 — Deckung je Naehrstoff, 30 % hoeher

    Liste       255 px  ->  332 px   (+30 %)
    Kachel      411 px  ->  488 px
    sichtbar      8     ->   10      von 154 Naehrstoffen

`[read]` **Mehr Hoehe, NICHT kleinere Zeilen** — eine gestauchte
Zeile zeigt nicht mehr, sie ist nur schlechter zu lesen.

### A7 — „7 von 30" oder „8 von 30"? BEIDE stimmen

`[cmd]` **Nachgerechnet, Ziel 2.500 kcal, Toleranz ±100:**

    Fenster bis 2026-09-10   8 von 30    (mein Bericht)
    Fenster bis 2026-09-11   7 von 30    (Toms Durchsicht)

`[cmd]` **Der Grund steht in zwei Zeilen:**

    2026-08-12   2.428 kcal   am Ziel   <- verliess das Fenster
    2026-09-11   2.178 kcal   nicht     <- kam hinein

`[read]` **Keine der beiden Zahlen ist falsch** — das Fenster
wandert taeglich, und zwischen Bericht und Durchsicht lag ein Tag.
`[read]` **Die Kachel rechnet richtig.**

### A8 — die Proben

    apps/web    1559 / 1559 gruen   (1552 gefordert)
    apps/coach    65 / 65 gruen     (unberuehrt)

`[cmd]` **Sieben neue Waechter, zwoelf Gegenproben.**

**ZWEI blieben zuerst GRUEN — beide waren blind:**

`[cmd]` **1 — „die Flaeche zieht ueber Luecken"** (das
`schliessen()` bei `null` entfernt): **die Probe pruefte nur, DASS
es die Funktion gibt.** `[read]` **Jetzt ruft sie die Wirkung:** eine
Reihe mit Luecke muss ZWEI geschlossene Stuecke ergeben, eine ohne
genau eines.

`[cmd]` **2 — „die Schnittspalte faellt weg"** (Funktion
umbenannt): **die Probe suchte die Filterzeile, und die ueberlebt
jede Umbenennung.** `[read]` **Jetzt wird der AUFRUF geprueft** —
eine Funktion, die niemand ruft, zeigt nichts.

`[cmd]` **Nach der Berichtigung beide ROT**, dieselbe Sabotage
wiederholt.

**Die zehn uebrigen:**

    die Flaeche wird wieder blass        -> ROT
    der Glaettungsschalter faellt weg    -> ROT
    die Vorgabe wird eckig               -> ROT
    der Verlauf verliert die Flaeche     -> ROT
    die Kacheln gleichen sich wieder ab  -> ROT
    die Zellhoehe waechst wieder mit     -> ROT
    die Deckkraft wird wieder pauschal   -> ROT
    der Trend verliert die Wertdeckkraft -> ROT
    der Schnitt zaehlt Luecken als null  -> ROT
    die Deckung schrumpft wieder         -> ROT

## Drei Waechter, deren Zusage ersetzt wurde

`[read]` **Geprueft wurde die Zusage, nicht der Wortlaut:**

`[cmd]` **1 — G-297 verlangte quadratische Felder.** Das war die
Antwort auf *„wieso verteilt man dann nicht auf optimale
groesse"*. `[cmd]` **G-416 setzt die Zellhoehe 16 der Vorlage** —
die BREITE waechst weiter mit der Kachel, nur die Hoehe ist fest.
**Die Probe verlangt jetzt `height: 16` und verbietet
`aspectRatio`.**

`[cmd]` **2 — meine G-412-Probe pinnte `stopOpacity="0.22"`.**
`[read]` **Die Zusage ist, DASS ein Verlauf da ist**, nicht welche
Zahl er traegt — jetzt `0.\d+`, plus die neue Probe auf
Mindestdeckkraft.

`[cmd]` **3 — meine G-412-Probe pinnte `maxHeight: 255`.**
`[read]` **Die Zusage ist, dass die Liste BEGRENZT ist und
scrollt** — jetzt `<= 400`, die genaue Zahl steht in der
G-416-Probe.

## Was NICHT geaendert wurde

**1 — `.v2-grid` im Paket.** `[cmd]` **217 Aufrufer.** `[read]`
**Eine gemeinsame Hoehe ist anderswo gewollt** — die Ausnahme
gehoert an die Stelle, die sie braucht.

**2 — Die Mockup-Referenz im Insights-Block.** `[cmd]` **Wie
beauftragt** — Tom: *„das kommt weg, wenn ich es abgenommen
habe."*

**3 — Der Stufenfaktor.** `[read]` **E-80 hat ihn entschieden**
(beginner 0.75, advanced 0.90, pro 1.00, elite 1.10). `[read]`
**Dieser Auftrag nennt ihn nicht unter den sieben Punkten** — er
gehoert einem eigenen. **Gemeldet, nicht nebenbei gebaut.**

## Neustart

`[cmd]` **NOETIG** — `packages/ui/primitives.tsx` (der `LineChart`)
ist geaendert. `[read]` **Die Schale laedt das Paket einmal.**
`[cmd]` **Die Messungen dieses Berichts liefen nach der
Aenderung.**

## Abnahme

_(vom Orchestrator)_
