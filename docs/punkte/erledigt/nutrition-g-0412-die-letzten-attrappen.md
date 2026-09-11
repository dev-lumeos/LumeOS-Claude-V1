---
nr: G-412
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 22a53856
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  referenzkarten: 21
---

# G-412 — die letzten Attrappen in Nutrition

## Befund

Tom, 2026-09-08, aus der Ansicht:

> aus meiner sicht, was ich in der ui noch nicht angebunden sehe:
> Nutrition score, Pre-workout window, Micronutrient snapshot,
> Below threshold. und dann kann die mockup-referenz-linie und
> alles darunter weg.

`[cmd]` **`mockup-referenz.tsx`, 1.023 Zeilen, 21 Karten.**

`[cmd]` **Acht Referenzbloecke in `ansicht.tsx`:** Diary,
Nutrients, Insights, Plans, Prefs, Planner, Einkauf, Foods.

## Die vier Kacheln

### 1 · Nutrition score

`[cmd]` **Toms Bild vom 2026-09-10 zeigt sie mit *Attrappe* und
*block*:**

    protein 0.79 x 0.30
    calorie 0.68 x 0.25
    carbs   0.53 x 0.15
    fat     0.80 x 0.15
    fiber   0.69 x 0.15
    Level multiplier  advanced x1
    Thresholds  ok >= 80 - warn 50-79 - block < 50
    Source of level  fest im Entwurf - liest kein Profil

`[read]` **Die Formel steht da** ? **fuenf Anteile, Summe 1,0.**

`[cmd]` **Miss, ob die fuenf Werte rechenbar sind** ?
`nutrition.daily_summary` **traegt sie vermutlich.**

`[cmd]` **Und *Source of level*:** *,,liest kein Profil"* ? **der
Multiplikator kommt aus dem Entwurf.**

`[read]` **`user_settings` hat eine Erfahrungsstufe** ? **messen,
ob sie passt.**

### 2 · Pre-workout window

`[cmd]` **`pre-workout-echt.tsx` GIBT ES** ? **4,2 KB.**

`[read]` **Miss, warum die Attrappe trotzdem steht** ? **wird sie
nicht gerufen, oder zeigt sie etwas anderes?**

`[cmd]` **Toms Bild zeigt:** *Eat by 16:00*, *90 min before
training*, *Window is 60-120 min before compound lifting. You have
2h 28m.* ? **plus drei Makrovorgaben und drei Vorschlaege.**

`[cmd]` **Die Sitzung kommt aus `training.workout_sessions`** ?
**die Kachel *Naechstes Training* darueber ist bereits
angebunden.**

### 3 · Micronutrient snapshot — die Grafik IN die obere Kachel

Tom: *,,bau die grafik in die obere kachel unter den balken mit
rein, dann hat man zwei ansichten."*

`[cmd]` **Die angebundene Kachel zeigt acht Naehrstoffe mit
Balken und Prozent** ? **Vitamin C 258,9 mg / 110 mg,
Vitamin D 11,2 ug / 15 ug 74 %, ... Omega-3 0,7 g / 1 g 49 %.**

`[cmd]` **Die Attrappe darunter zeigt ein NETZDIAGRAMM** ? **acht
Achsen, *Today* gegen *Target*.**

`[read]` **Beides zeigt dieselben acht** ? **die Grafik gehoert
unter die Balken, in dieselbe Kachel.**

`[read]` **Dann faellt die Attrappe weg.**

### 4 · Below threshold — die Attrappe kann raus

`[cmd]` **Die angebundene Fassung steht direkt darueber:**
**7 von 32 geprueften, mit Balken, Werten und Referenzen.**

`[cmd]` **Die Attrappe zeigt 3 von 117 mit erfundenen Zahlen.**

`[read]` **Doppelt** ? **die Attrappe faellt weg.**

## Und dann die Trennlinie

Tom: *,,dann kann die mockup-referenzlinie und alles darunter
weg."*

`[read]` **Das gilt fuer den REITER, in dem die vier stehen** ?
**nicht fuer alle acht.**

`[cmd]` **Messen, welche Bloecke danach leer waeren** ? **ein
Block ohne Karten ist eine Linie ohne Inhalt.**

## Was zu messen ist, bevor gebaut wird

`[read]` **Je Kachel: welche Tabelle traegt sie?**

    Nutrition score       nutrition.daily_summary?
                          user_settings fuer die Stufe?
    Pre-workout window    training.workout_sessions
                          + die Makroziele
    Micronutrient chart   dieselben Daten wie die Balken
    Below threshold       ist schon angebunden

`[read]` **Wenn eine nicht rechenbar ist: melden, nicht
erfinden.**

## Nachtrag 2026-09-08 — der Insights-Reiter

Tom, aus der Ansicht:

> Macro split - 30d avg: fehlen unten Highest day, Lowest day,
> Days at target. die verlaufgrafik soll aussehen wie im mockup
> Calorie balance, farbliche schattierung unter der linie fuer
> kontrast. Micronutrient trend -> anbinden. Tagesdeckung 2/3 so
> hoch, und die kachel daneben auch weniger hoch.

### 5 · Macro split — drei Zeilen fehlen unten

`[cmd]` **`module-nutrition.jsx:386-390`, nach der Trennlinie:**

    Avg calories          2,617 kcal
    Highest day           Tue - 2,890
    Lowest day            Wed - 2,410
    Days at target +/-100 9 of 14

`[cmd]` **Die Umsetzung zeigt nur die drei Makrobalken.**

`[read]` **Alle vier sind rechenbar** ? **aus
`nutrition.daily_summary` ueber den Zeitraum.**

`[read]` **Und *Days at target*: eine Toleranz von +/-100 kcal**
? **die Zahl steht in der Vorlage, das Ziel im Profil.**

### 6 · Die Verlaufsgrafik — Flaeche unter der Linie

`[cmd]` **`module-charts-pro.jsx:115`,
`window.LineChart`** ? **die Vorlage ueberschreibt die einfache
Fassung aus `shared.jsx:213`.**

**Was sie kann:**

    smooth(pts)     quadratische Bezier je Punktpaar,
                    Kontrollpunkt in der Mitte
    linearGradient  je Reihe, von 0.22 auf 0 Deckkraft,
                    senkrecht
    showArea        nur si === 0, geschlossener Pfad
                    bis zur Grundlinie
    Gitter          fuenf Linien, die unterste voll,
                    die anderen 0.55
    Punkte          nur bei <= 16 Werten, r=2,
                    Fuellung var(--bg)
    zweite Reihe    gestrichelt "3 3", wenn
                    color === var(--fg-dim)

`[cmd]` **`Calorie balance` ruft sie mit ZWEI Reihen:** **die
Werte in `var(--acc-nutri)`, das Ziel als flache Linie in
`var(--fg-dim)`.**

`[read]` **Der Verlauf bekommt also: geglaettete Kurve, Verlauf
unter der Linie, gestricheltes Ziel.**

`[cmd]` **`range={[1500, 3200]}`, `h={180}`** ? **feste Grenzen,
nicht aus den Daten.**

### 7 · Micronutrient trend — anbinden

`[cmd]` **`module-nutrition.jsx:393`:**

    <Card title="Micronutrient trend" sub="30 days - top 8"
          style={{gridColumn: "span 2"}}>
      <NutrientHeatmap />

`[cmd]` **`NutrientHeatmap`, Zeile 399:** **acht Naehrstoffe x 30
Tage, Zellhoehe 16, Abstand 2, Beschriftungsspalte 80 px.**

    >= 0.8   var(--pos)
    >= 0.5   var(--warn)
    sonst    var(--neg)

`[cmd]` **In der Vorlage sind die Werte `Math.random()`** ?
**hier nicht.**

`[read]` **Die acht Naehrstoffe stehen schon in der angebundenen
Snapshot-Kachel** ? **Vitamin C, D, Eisen, Calcium, Magnesium,
Zink, B12, Omega-3.**

`[read]` **Und der Wert je Tag ist derselbe Anteil, den die
Kachel heute fuer HEUTE rechnet** ? **ueber 30 Tage.**

`[cmd]` **Miss, ob das je Tag rechenbar ist** ? **oder ob es zu
teuer wird.**

### 8 · Tagesdeckung — zwei Drittel Hoehe

Tom: *,,Tagesdeckung 2/3 so hoch, und die kachel daneben
dementsprechend auch weniger hoch."*

`[read]` **Eine reine Hoehenfrage** ? **keine Daten.**

`[cmd]` **Messen, wie hoch sie heute ist, und ob die
Nachbarkachel ihre Hoehe von ihr nimmt** (Raster) **oder eigene
hat.**

`[read]` **Wenn das Raster sie koppelt, reicht eine Aenderung.**

## Bericht

### A1 — die vier Attrappen

**1 · Nutrition score — ANGEBUNDEN.**

`[cmd]` **Traegt: `nutrition.daily_summary`** (`prot625`, `enercc`,
`cho`, `fat`, `fibt`), **Ziele aus `zielwerte-read`**, **Stufe aus
`public.profiles.experience_level`**. `[cmd]` **181 Tage fuer
`dev@lumeos.app`, gemessen.**

`[cmd]` **Am Schirm:** protein 0.95, calorie 0.87, carbs 0.71,
fat 0.86 — **echte Deckungen**, keine Entwurfszahlen.

**Zwei Grenzen, beide gemessen und in der Kachel sichtbar:**

    Ballaststoffe   KEIN ZIEL im Schema. Gemessen ueber alle Spalten
                    mit „fib": daily_summary.fibt, foods_custom.fibt,
                    meal_items.fibt — alles Zufuhr, kein Zielwert.
                    Die Zeile zeigt „— × 0.15" und nennt den Grund.
                    „Gewicht gerechnet: 0.85 von 1.00".

    Stufenfaktor    `dev` steht auf `pro`, und fuer `pro` ist kein
                    Faktor entschieden (G-228). Die Kachel zeigt
                    „pro · offen (G-228)" statt eines Rings.

`[read]` **Die Zeile *„Source of level: fest im Entwurf · liest kein
Profil"* ist entfallen** — sie liest es jetzt.

**2 · Pre-workout window — die Attrappe ist RAUS.**

`[cmd]` **Gemessen, warum sie trotz `pre-workout-echt.tsx` stand:**
sie wurde **nicht als Sonst-Zweig** gerendert, sondern **immer** —
eine Zeile unter der echten Kachel (`ansicht.tsx:624`).

`[read]` **Beide zeigten verschiedene Sachen:** die echte sagt,
WANN die naechste Einheit ist (`training.workout_sessions`), die
Attrappe zeigte einen Zeitfenster-Ring mit erfundenen 68 %.

`[read]` **Der Ring braeuchte eine Naehrstoffplanung je Einheit** —
dafuer gibt es keine Tabelle.

**3 · Micronutrient snapshot — das Netz sitzt IN der oberen Kachel.**

**4 · Below threshold — RAUS.** `[cmd]` **Die angebundene Fassung
stand direkt darueber** (`UnterSchwelle`, echte Werte); die Attrappe
zeigte 3 von 117 mit erfundenen.

### A2 — das Netz unter den Balken

**Tom:** *„bau die grafik in die obere kachel unter den balken mit
rein, dann hat man zwei ansichten."*

**Bild:** `docs/bilder/g412/mikro-netz.png` — acht Balken, darunter
das Netz mit denselben Zahlen.

`[cmd]` **Nur Zeilen MIT Prozentwert** — `1 von 8` fehlt im Netz
(Vitamin C, unvollstaendige Tagessumme), **und das steht darunter.**
`[read]` **Eine Ecke auf 0 waere eine Aussage, die die Funktion
ausdruecklich nicht trifft.**

### A3 — die Diary-Linie weg, sieben bleiben

    vorher   8 Referenzbloecke
    nachher  7   (Nutrients, Insights, Plans, Prefs,
                  Planner, Einkauf, Foods)

`[cmd]` **Am Schirm gemessen:** Diary-Reiter **17 Karten, 0
Attrappen, 0 Trennlinien.**

### A4 — die drei Zeilen unter Macro split

**Bild:** `docs/bilder/g412/makro.png`

    Kalorien im Schnitt    2.426 kcal
    Hoechster Tag          Mo · 3.382
    Niedrigster Tag        Mi · 1.780
    Tage am Ziel ±100      8 von 30

`[cmd]` **Alle aus `d.reihe`** — derselben Tagesreihe, die die
Grafik zeichnet. **Kein zweiter Leseweg**, sonst koennten beide
verschiedene Zahlen zeigen.

`[read]` **Ohne Kalorienziel keine Quote** — die Zeile sagt dann,
dass das Ziel fehlt, statt „0 von 30" zu behaupten.

### A5 — die Verlaufsgrafik

**Bild:** `docs/bilder/g412/bilanz.png`

`[cmd]` **`LineChart` im Paket auf die Fassung aus
`module-charts-pro.jsx:115` gehoben** — sechs Unterschiede, jeder
abgelesen:

    smooth()        quadratische Bezier je Punktpaar (`:127-135`)
    linearGradient  je Reihe, 0.22 -> 0, senkrecht (`:141-146`)
    showArea        nur si === 0, geschlossen bis zur Grundlinie
    Gitter          fuenf Linien, unterste voll, andere 0.55
    Punkte          nur bei <= 16 Werten, r=2, Fuellung bg
    zweite Reihe    gestrichelt „3 3" bei fg-dim

`[cmd]` **Calorie balance ruft sie mit ZWEI Reihen:** Zufuhr in
`--acc-nutri`, Ziel flach in `--fg-dim`, `range={[1500, 3200]}`,
`h={180}`.

`[read]` **Ohne Ziel nur EINE Reihe** — eine flache Linie auf einem
geratenen Wert waere eine Aussage ueber den Nutzer.

**Eine Abweichung mit Grund:** `[cmd]` **die Vorlage bildet die
Verlaufskennung mit `Math.random()`** (`:126`). `[cmd]` **Hier
`React.useId()`** — der Server rendert vor, und eine Zufallszahl
waere im Browser eine andere (Hydration).

### A6 — Micronutrient trend: ANGEBUNDEN

**Bild:** `docs/bilder/g412/trend.png` — acht Naehrstoffe x 30 Tage.

`[cmd]` **Gemessen, ob es zu teuer wird** (`explain analyze`):

    ein Tag    6.70 s   (fast alles Prozessstart)
    30 Tage    7.12 s
    reine Abfrage:  645 ms fuer 240 Zeilen

`[read]` **Also NICHT zu teuer** — aber zu teuer fuer das Tagebuch,
das man staendig oeffnet. `[cmd]` **Deshalb nur im Insights-Reiter.**

**Eine Grenze, gemeldet statt umgangen:** `[cmd]` **In SQL ginge es
in EINEM Aufruf** (`generate_series`). `[cmd]` **Ein Client kann das
nicht stellen** — er ruft Funktionen ueber RPC, und eine
`micronutrient_trend(von, bis)` gibt es nicht. `[read]` **Sie
anzulegen hiesse `supabase/` anzufassen** — das gehoert Codex
(C-463) und ist hier verboten.

`[cmd]` **Also dreissig Aufrufe GLEICHZEITIG** (`Promise.all`) —
eine Rundreise-Wartezeit statt dreissig. `[read]` **Als Folgearbeit
vermerkt.**

`[cmd]` **In der Vorlage sind die Zellen `Math.random()`**
(`:399`). `[cmd]` **Hier nicht:** 12 von 240 Zellen bleiben leer,
weil dort die Tagessumme unvollstaendig ist — **leer heisst nicht
null**, und das steht darunter.

### A7 — die Tagesdeckung auf zwei Drittel

    vorher   616 px
    nachher  411 px   (= 2/3 von 616)

`[cmd]` **Gemessen, ob die Nachbarkachel ihre Hoehe aus einem Raster
nimmt: NEIN.** `[read]` **Die rechte Spalte ist `flex`, die Kacheln
stapeln sich** — es gibt keine Nachbarin, die mitwaechst. **Eine
Aenderung reicht.**

**Zwei Fehlversuche, beide am Schirm aufgefallen:**

`[cmd]` **1 — Eine Regel in `nutrition.css` blieb wirkungslos:**
die Kachel hatte schon einen Scrollkasten mit `maxHeight: 460`
INLINE, und ein Inline-Stil gewinnt immer. **Gemessen: `maxHeight`
blieb bei 460 px, obwohl `overflow: auto` von meiner Regel kam.**

`[cmd]` **2 — Mit 410 px Liste wurde die Kachel 566, nicht 411** —
sie besteht nicht nur aus der Liste: Kopf 21 px, Hinweis 77 px,
Polsterung. **Nachgemessen, dann 255 px fuer die Liste.**

`[read]` **Der Inhalt bleibt vollstaendig** — die Liste scrollt,
statt gekuerzt zu werden. **Eine gekuerzte Liste saehe aus wie
weniger Naehrstoffe.**

### A8 — die Proben

    apps/web   1552 / 1552 gruen   (1551 gefordert)
    apps/coach   65 / 65 gruen     (unberuehrt)

`[cmd]` **Zehn neue Waechter, elf Gegenproben** — jede einzeln
verifiziert, dass die Sabotage ankam UND zurueckgesetzt wurde:

    eine Attrappe kehrt zurueck        -> ROT
    ein Referenzblock faellt weg       -> ROT
    der Stufenfaktor wird geraten      -> ROT
    die Tabelle wird zur Client-Datei  -> ROT
    ein Ballaststoffziel wird erfunden -> ROT
    die Waermekarte wuerfelt           -> ROT
    dreissig Aufrufe nacheinander      -> ROT
    die Toleranz faellt weg            -> ROT
    die Ziellinie wird durchgezogen    -> ROT
    die Glaettung faellt weg           -> ROT
    die Tagesdeckung wird wieder hoch  -> ROT

## Ein Laufzeitfehler, den `tsc` nicht sah

`[cmd]` **Nach dem Anbinden des Scores: 0 Karten am Schirm,
zweimal**

    TypeError: stufenFaktor is not a function

`[cmd]` **Ursache:** die Formel stand in `diary-entwurf.tsx`, und
die traegt `'use client'`. **Die angebundene Kachel ist eine
SERVER-Komponente** — ein WERT-Import ueber diese Grenze zieht den
Client-Baum in den Server.

`[read]` **`tsc` blieb gruen** — der Typ stimmt ja. **Dieselbe
Klasse wie G-402 und G-388.**

`[cmd]` **Die Tabelle liegt jetzt in
`lib/nutrition/stufenfaktor.ts`** — ohne `'use client'`, von beiden
Seiten benutzbar. `[cmd]` **`diary-entwurf.tsx` verweist nur noch**,
damit bestehende Aufrufer nicht brechen.

## Drei Waechter, die ihre Zusage behalten haben

`[read]` **Alle drei zeigten auf Dateien, aus denen etwas umgezogen
oder entfernt wurde** — geprueft wurde die Zusage, nicht der
Wortlaut:

    entwurf-wird-nicht-verdraengt   drei Faelle entfallen: die
                                    Attrappen sind ENTFERNT, nicht
                                    verdraengt (A-59)
    v2-attrappen                    Formel nach lib/, Kartenliste
                                    um vier gekuerzt
    stufenfaktor (G-283)            Kachel nach score-echt.tsx

`[cmd]` **Und einer hat sich UMGEDREHT:** G-283 verbot den Satz
*„Source of level: experience_level"*, weil die Kachel ihn nicht
las. `[cmd]` **Jetzt liest sie ihn** — **derselbe Satz ist keine
Falschaussage mehr, sondern die Wahrheit**, und die Probe verlangt
ihn statt ihn zu verbieten. `[cmd]` **Geprueft wird beides:** die
Zeile nennt die Quelle, UND der Leseweg holt sie.

## Was NICHT gebaut ist

**1 — Kein Ballaststoffziel.** `[cmd]` **Gemessen: es gibt keines im
Schema.** `[read]` **Der fuenfte Anteil (0,15) bleibt offen**, und
die Kachel sagt es. **Eine geratene Grenze waere eine Aussage ueber
den Nutzer.**

**2 — Kein Stufenfaktor fuer `pro`.** `[cmd]` **G-228, gehoert
Tom.** `[read]` **Solange er offen ist, zeigt die Kachel den Grund
statt einer Zahl** — und `dev` steht genau auf `pro`, also ist das
am Schirm sichtbar.

**3 — Keine `micronutrient_trend`-Funktion.** `[read]` **Sie machte
aus dreissig Aufrufen einen** — braucht aber `supabase/`, und das
gehoert Codex (C-463).

## Neustart

`[cmd]` **NOETIG** — `packages/ui` wurde geaendert
(`primitives.tsx`, der `LineChart`). `[read]` **Die Schale laedt das
Paket einmal.** `[cmd]` **Die Messungen dieses Berichts liefen nach
der Aenderung.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  Score und Pre-workout angebunden
    A2  Netz unter den Balken, gleiche Zahlen
    A3  Diary-Block weg, sieben bleiben
    A4  2.426 kcal / Mo 3.382 / Mi 1.780 / 8 von 30
    A5  LineChart auf die Pro-Fassung
    A6  Heatmap angebunden, 645 ms fuer 240 Zeilen
    A7  616 -> 411 px
    A8  web 1552/1552, coach 65/65

`[cmd]` **Selbst gemessen: `NutritionDiaryReferenz` wird NICHT
mehr gerufen, die anderen sieben schon.**

`[cmd]` **`primitives.tsx`: `linearGradient`, `useId`,
`showArea`, `strokeDasharray`, `Q` und `glaett`** ? **die
Glaettung ist da, deutsch benannt.**

### A1 — zwei Grenzen, beide sichtbar gemacht

> *,,Kein Ballaststoffziel im Schema ? die Zeile zeigt
> *,,- x 0.15"* und *,,Gewicht gerechnet 0.85 von 1.00"*."*

`[read]` **Die Formel rechnet mit dem, was da ist, und SAGT, dass
ein Anteil fehlt.**

> *,,Fuer `pro` kein Faktor entschieden (G-228) ? `dev` steht
> genau darauf."*

`[read]` **Er hat keinen Faktor erfunden** ? **die Kachel zeigt
einen Grund statt einer Zahl.**

### Pre-workout: die Ursache war nicht, was ich vermutete

`[read]` **Ich hatte gefragt, ob die echte Fassung nicht gerufen
wird.**

> *,,Sie war kein Sonst-Zweig, sondern rendert immer, eine Zeile
> darunter. Beide zeigten Verschiedenes."*

`[cmd]` **Zwei Kacheln uebereinander, eine echt, eine erfunden.**

### A6 — gemessen statt abgelehnt

`[cmd]` **645 ms fuer 240 Zeilen.**

> *,,In SQL ginge es in einem Aufruf, ein Client kann das nicht ?
> die noetige Funktion anzulegen hiesse `supabase/` anfassen.
> Also 30 Aufrufe gleichzeitig."*

`[read]` **Die Grenze des Auftrags benannt, nicht umgangen.**

`[cmd]` **Und 12 von 240 Zellen bleiben leer, mit Grund** ? **in
der Vorlage sind sie `Math.random()`.**

### A5 — eine Abweichung mit Grund

> *,,`React.useId()` statt `Math.random()`, sonst springt die
> Hydration."*

`[read]` **Dieselbe Klasse wie G-390** ? **ein Zufallswert im
Server-Rendering erzeugt zwei verschiedene Ergebnisse.**

### A7 — zwei Fehlversuche, beide am Schirm

`[cmd]` **Eine CSS-Regel blieb wirkungslos** ? **der Inline-Stil
gewinnt.**

`[cmd]` **Und 410 px Liste ergaben 566 px Kachel** ? **Kopf und
Hinweis zaehlen mit.**

`[read]` **Kein Test haette das gefunden.**

### Und ein Waechter hat sich umgedreht

`[cmd]` **G-283 verbot den Satz *,,Source of level:
experience_level"*, weil die Kachel ihn nicht las.**

> *,,Jetzt liest sie ihn ? derselbe Satz ist die Wahrheit, und die
> Probe verlangt ihn."*

`[read]` **Ein Waechter, der eine Luege verbot, verlangt jetzt
dieselbe Aussage als Wahrheit.**

### Was toter Code bleibt

`[cmd]` **`NutritionDiaryReferenz` steht noch in
`mockup-referenz.tsx`, wird aber nicht gerufen.**

`[read]` **Am Schirm kein Fehler** ? **aber die Datei traegt einen
Block, den niemand sieht.**

**Abgenommen.**
