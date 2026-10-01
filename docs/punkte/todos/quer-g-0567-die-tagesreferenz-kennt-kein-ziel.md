---
nr: G-567
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-10-01

braucht: [G-538, G-563]
kind_von: G-563

quellen:
  - docs/punkte/erledigt/goals-g-0563-berechne-zielwerte-waehlt-selbst-eine-phase.md

beruehrt:
  funktionen:
    - nutrition.micronutrient_snapshot
    - nutrition.micronutrient_snapshot_with_supplements
    - goals.berechne_zielwerte
---

# Die Tagesreferenz kennt kein Ziel

## Der Befund

`[cmd]` **Codex hat es beim Abgrenzen von G-563/A1 gemessen und gemeldet,
statt ein Ziel zu erfinden:** `nutrition.micronutrient_snapshot` ruft
`berechne_zielwerte` auf und **kennt keine `goal_id`.** Es meint eine
allgemeine Tagesreferenz, nicht die Zielwerte einer Phase.

`[read]` **Bei einem Ziel fiel das nicht auf** — die eine Phase war die
Tagesreferenz. **Seit G-538 laufen mehrere Ziele parallel**, und damit ist
die Frage offen, was ein Mikronährstoff-Tagesbezug bedeutet, wenn zwei
Phasen gleichzeitig gelten.

`[cmd]` **Bis zur Entscheidung wirft der Aufruf** bei Mehrdeutigkeit
sichtbar, statt still eine Phase zu nehmen. **Das ist richtig und darf so
bleiben** — aber es ist ein Hindernis, keine Antwort.

## Was zu entscheiden ist

`[read]` **Drei Formen, und sie unterscheiden sich fachlich, nicht
technisch:**

1. **Zielfrei rechnen** — die Referenz nimmt den TDEE ohne
   Phasenfaktor. Mikronährstoffe haengen am Energiebedarf und am
   Koerpergewicht, nicht an der Absicht einer Diaetphase. `[annahme]`
   **Das ist die fachlich naheliegende Form**, weil eine Vitaminempfehlung
   nicht davon abhaengt, ob jemand gerade aufbaut oder abbaut.
2. **Ein fuehrendes Ziel** — der Nutzer bestimmt, welches Ziel die
   Tagesreferenz stellt. Dann braucht es dafuer ein Feld.
3. **Je Ziel eine Referenz** — dann zeigt die Oberflaeche mehrere, und
   der Nutzer sieht, welche zu welchem Ziel gehoert.

`[read]` **Die erste Form ist die einzige, die ohne neue Eingabe
auskommt** — und die einzige, bei der ein Nutzer ohne Ziel ueberhaupt eine
Referenz bekommt. Das ist ein Argument, keine Messung.

## Warum es nicht nebenbei entschieden wird

`[read]` **Es beruehrt Nutrition, nicht Goals.** Ein Mikronährstoff-Ziel
ist eine Gesundheitsaussage; sie aus einer Diaetphase abzuleiten, waere
eine fachliche Entscheidung, die niemand getroffen hat. **Codex hat genau
deshalb nicht gewaehlt.**

## Nachtrag — es sind zwei Aufrufer, und keiner ist eine Tabelle

`[cmd]` **Der Orchestrator hat `micronutrient_snapshot` zuerst unter
`beruehrt.tabellen` eingetragen. Es ist eine FUNKTION.** Der Waechter hat
es gefangen. Gemessen in `pg_proc`:

    nutrition.micronutrient_snapshot
    nutrition.micronutrient_snapshot_with_supplements
    nutrition.micronutrient_below_threshold

`[read]` **Die zweite ist dieselbe Frage mit Ergaenzungsmitteln** — wer
die Entscheidung trifft, trifft sie fuer beide. Die dritte ist eine
Schwellenpruefung und haengt an dem, was die erste liefert.

`[cmd]` **Die einzige Tabelle in der Naehe heisst
`nutrition.micronutrient_overview_items`** — sie ist nicht gemeint.

`[read]` **Die Lehre stand schon in LAUFEND:** *„`beruehrt.tabellen` ist
eine Behauptung ueber die laufende Datenbank, keine Inhaltsangabe."* Ein
Name aus einem Bericht ist keine Messung.
