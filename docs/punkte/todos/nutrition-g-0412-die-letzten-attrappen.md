---
nr: G-412
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
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
