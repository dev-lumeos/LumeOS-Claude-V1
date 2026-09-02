---
nr: G-335
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: [C-396]
kind_von: G-332
entscheidung: E-59
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
  stellen: 8
---

# G-335 — acht Stellen uebersetzen `meal_type` selbst

## Befund

Tom, 2026-09-02, sechs Befunde am Schirm — **fuenf davon haben
denselben Kern.**

`[cmd]` **Gemessen: `meal_slots` wird an sechs Stellen gelesen**, alle
in Diary, Preferences und Settings.

`[cmd]` **`meal_type` wird an acht Stellen uebersetzt**, jede mit
eigener Liste:

    erfassen-modal.tsx        ['pre_workout', 'Pre-workout']
    plan-eintrag-editor.tsx   pre_workout: 'Vor dem Training'
    plans-echt.tsx            pre_workout: 'Pre-Workout'
    rezepte-echt.tsx          ['pre_workout', 'Vor dem Training']
    erfassen.tsx              pre_workout: 'vor dem Training'
    mahlzeiten.tsx            pre_workout: 'Pre-workout'
    modale.tsx                { id: 'preworkout', time: '16:30' }
    ansicht.tsx               (Kommentar)

`[read]` **Vier verschiedene Schreibweisen fuer dasselbe.**

## Toms Befunde, je Ursache

    Ghost-Karten heissen englisch      liest meal_type
    Pulldown zeigt Pre-workout         liest meal_type
    Planner kennt die Namen nicht      liest meal_type
    Meal plans: Ghosts unangepasst     liest meal_type
    Plan bearbeiten ohne Mahlzeiten    liest meal_type

`[read]` **Eine Baustelle, nicht fuenf.**

## Und zwei Anzeigefehler

`[cmd]` **Das Anlege-Feld verschwindet beim Klick** und zeigte im
ersten Anlauf *12 20* uebereinander.

`[cmd]` **Das *Plan bearbeiten*-Modal muss gescrollt werden.**

## Und eine Verschmelzung

Tom: *,,mahlzeitenstruktur muessen wir mit meine mahlzeiten
verschmelzen."*

`[cmd]` **Heute stehen *Hauptmahlzeiten 4 / Snacks 1* neben fuenf
benannten Zeilen** — **zwei Wahrheiten ueber dieselbe Zahl.**

## Auftrag

**Mitbeauftragt: G-332.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · Eine Namensquelle statt acht

`[cmd]` **Vier verschiedene Schreibweisen fuer `pre_workout`
gemessen.**

`[read]` **Wo ein Plan die Quelle ist, kommt der Name aus dem
Plan** (E-59). `[read]` **Wo der Nutzer die Quelle ist, aus
`meal_slots`** (E-58).

`[cmd]` **`meal_type` bleibt als Kategorie ohne Bedeutung** — **nicht
als Beschriftung.**

`[read]` **Und wenn C-396 die Planstruktur noch nicht liefert:** bau
die Nutzerseite fertig und **sag, worauf du wartest.**

### 2 · Toms sechs Befunde

    Ghost-Karten heissen Breakfast statt Fruehstueck
    Pulldown zeigt Pre-workout statt der eigenen Namen
    Planner kennt die Namen nicht -- Plan neu und Plan bearbeiten
    Meal plans: Ghosts unangepasst
    Anlege-Feld verschwindet beim Klick
    Plan bearbeiten muss gescrollt werden

`[read]` **Die ersten vier sind dieselbe Ursache.** **Die letzten
zwei sind Anzeigefehler.**

### 3 · Verschmelzen

Tom: *,,mahlzeitenstruktur muessen wir mit meine mahlzeiten
verschmelzen."*

`[cmd]` **Heute: *Hauptmahlzeiten 4 / Snacks 1* neben fuenf benannten
Zeilen** — **zwei Wahrheiten ueber dieselbe Zahl.**

`[read]` **Die Slotliste ist die genauere** — **sie nennt Namen und
Zeiten.** `[read]` **Miss, ob `meals_per_day` und `snacks_per_day`
noch gebraucht werden, oder ob die Zahl der Slots reicht.**

`[read]` **`meal_prep_ok` bleibt** — Vorkochen ist etwas anderes.

### 4 · Sechs Slots auf `dev`, vorher fuenf

`[cmd]` **Eine *Spaetmahlzeit 21:30* ist dazugekommen.**

`[read]` **Der Auftrag sagte: nichts auf `dev` schreiben.** `[read]`
**Vermutlich beim Ausprobieren entstanden** — **raeum sie weg oder
sag, dass sie bleiben soll.**

### Was nicht zu tun ist

**Keine neunte Namensliste.**
**Nichts weiter auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Namensquellen    von acht auf wie viele, gezaehlt
    Ghost-Karten     heissen wie die Slots
    Pulldown         zeigt die eigenen Namen
    Planner          Plan neu und Plan bearbeiten kennen sie
    Anlege-Feld      bleibt stehen, ein Wert
    Modal            ohne Scrollen lesbar
    Verschmelzung    eine Zahl, nicht zwei
    dev              sechs Slots oder fuenf, entschieden

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
