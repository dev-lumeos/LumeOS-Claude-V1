---
nr: G-310
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: null
entscheidung: E-41
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen:
  gemessen: 2026-09-01
  mockup_zeilen: 136
---

# G-310 — der Plan-Reiter folgt keinem Mockup

## Befund

Tom, 2026-09-01: *,,irgendwie zweifle ich daran dass das alles anhand
specs oder unserem brainstorm erstellt wird und irgend ein gebastel
ist."*

`[cmd]` **`MealPlansView.js` liegt seit Monaten im Fundus, 136
Zeilen.** `[cmd]` **Der Orchestrator hat es nie gelesen.**

`[read]` **Die Ablaeufe kamen aus `SPEC_03`, die Sperren aus den
ADRs, die Komponenten aus `SPEC_10`.** `[read]` **Das Layout — welche
Kachel wo, was zusammensteht — ist erfunden.**

## Was das Mockup zeigt

    Links (1fr)
      Aktiver Plan   Name, Beschreibung, "Tag 3/12"
                     Compliance-Balken mit Prozent
                     3 bestaetigt · 1 abweichend · 1 uebersprungen
                       · 2 offen
                     vier Kacheln: kcal/Tag, Dauer, Protein, Score
                     Tages-Accordion, heutiger Tag offen
      Alle Plaene    je Zeile Name, Herkunfts-Badge, Beschreibung
                     user ohne Badge, Marketplace orange,
                     Von Coach blau, AI erstellt gruen

    Rechts (280px)
      Lifecycle      "Was passiert nach Tag 12?"
                     drei Radios: Einmalig / Wiederholend /
                     Gefolgt von -> Plan
      Statistiken    Aktiver Plan seit, Compliance gesamt,
                     Mahlzeiten bestaetigt 9/15,
                     Offene Ghost Entries, ø Kalorien (3T)

## Was heute stattdessen steht

`[cmd]` **Vier getrennte Kacheln rechts: *Planumfang*,
*Lebenszyklus*, *Herkunft* mit Knopf *Plan bearbeiten*,
*Einhaltung*.**

`[read]` **Keine davon steht in einem Mockup oder einer Spec.**
**Sie sind aus dem Schema abgeleitet** — eine Kachel je Spaltengruppe.

Tom: *,,irgend einen plannamen anpassen und seine laufzeiten ist fuer
mich nicht planbearbeiten."*

`[cmd]` **Und die Compliance-Zahlen fehlen** — das Mockup zeigt sie
als erste Aussage der aktiven Karte.

## Auftrag — nach dem Mockup bauen

**Mitbeauftragt: G-311, G-307.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-09-01.**

### Lies zuerst, vollstaendig

    mockup-zwischenwurf/features/nutrition/MealPlansView.js
      136 Zeilen. Layout, Kacheln, Reihenfolge, Badges.
    mockup-zwischenwurf/features/nutrition/RecipeList.js
    SPEC_03 Flow 3 und 4
    SPEC_10 Meal Plan Components (8)

`[read]` **Der Orchestrator hat das Mockup nie gelesen und das
Layout erfunden.** **Deshalb steht es hier zuerst.**

`[read]` **Und wenn das Mockup etwas zeigt, das der Spec
widerspricht: melden, nicht auswaehlen.**

### Was das Mockup vorgibt

    Links (1fr)
      Aktiver Plan   Name, Beschreibung, "Tag 3/12"
                     Compliance-Balken mit Prozent
                     3 bestaetigt · 1 abweichend · 1 uebersprungen
                       · 2 offen
                     vier Kacheln: kcal/Tag, Dauer, Protein, Score
                     Tages-Accordion, heutiger Tag offen
      Alle Plaene    je Zeile Name, Herkunfts-Badge, Beschreibung
                     user ohne Badge, Marketplace orange,
                     Von Coach blau, AI erstellt gruen

    Rechts (280px)
      Lifecycle      "Was passiert nach Tag 12?"
                     drei Radios mit Folgesatz
      Statistiken    Aktiver Plan seit, Compliance gesamt,
                     Mahlzeiten bestaetigt 9/15,
                     Offene Ghost Entries, ø Kalorien

`[cmd]` **Die vier heutigen Kacheln — Planumfang, Lebenszyklus,
Herkunft, Einhaltung — stehen in keinem Mockup.** `[read]` **Sie sind
aus dem Schema abgeleitet, eine je Spaltengruppe.**

`[cmd]` **Und die Daten fuer die Compliance stehen seit G-309:**
`meal_plan_logs` mit vier Zustaenden je Position.

### Was aus der Spec kommt und bleibt

`[cmd]` **Der Lifecycle-Picker mit drei Wahlen** — E-31, und das
Mockup zeigt dieselben drei. `[cmd]` **Die Herkunft je Zeile** —
`SPEC_03` Flow 3 nennt die Beschriftungen.

`[read]` **Der Knopf *Plan bearbeiten* gehoert nicht unter
*Herkunft*.** Tom: *,,irgend einen plannamen anpassen und seine
laufzeiten ist fuer mich nicht planbearbeiten."* **Er fuehrt in den
Planner** (E-41, G-307).

### G-311 — drei Sackgassen im Planner

`[cmd]` **1. *In der Werkbank* tut nichts** — der Sprung fehlt
(G-307).

`[cmd]` **2. Ein Rezept im Raster laesst sich nicht oeffnen.**
`RecipeDetail` ist gebaut, im Planner nicht verdrahtet.

`[cmd]` **3. Die Rezepte-Auflistung unter dem Raster steht in keiner
Spec und keinem Mockup** — sie ist seit dem Rezepte-Reiter doppelt.

### Was nicht zu tun ist

**Nichts erfinden, was weder in Mockup noch Spec steht.**
**Kein Layout aus dem Schema ableiten.**
**Nichts auf `dev@lumeos.app`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    je Kachel        steht sie im Mockup? Zeile nennen
    entfernt         welche, und warum sie nirgends stand
    Compliance       Zahlen aus meal_plan_logs, am Schirm
    Plan-Liste       vier Herkuenfte, Badges wie im Mockup
    Werkbank-Knopf   fuehrt in den Planner, belegt
    Rezept im Raster oeffnet das Detail
    Rezepte-Liste    entfernt
    Bildschirmfoto   vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
