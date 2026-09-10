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
