---
nr: G-336
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-335
entscheidung: E-59
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/plan-lesen.ts
zahlen:
  gemessen: 2026-09-02
---

# G-336 — das Raster liest `meal_plan_slots` nicht

## Befund

Tom, 2026-09-02: *,,ich habe getestet einen neuen plan anzulegen,
genau was ich sage es uebernimmt die definition in preferences
nicht."*

`[cmd]` **Gemessen: der Plan *test* HAT fuenf Slots.** **Die Kopie
greift.**

    test                 5 Slots
    Aufbau-Wochenplan    0
    Buddy auto-plan      0
    Cut 4-Meal 2200      0
    Lean bulk 3100       0

`[cmd]` **Aber das Raster zeigt vier Zeilen und schreibt:** *,,4
Reihen aus deinen Vorlieben — 4 Hauptmahlzeiten und 1 Snack."*

`[cmd]` **`meal_plan_slots` wird in `apps/` nirgends gelesen** — **nur
in der Pipeline und im Test.**

`[read]` **Die Tabelle ist gebaut, gefuellt, und hat keinen Aufrufer
im Browser.**

`[read]` **Die vierte Funktion ohne Aufrufer** — nach
`meal_plan_day_to_diary`, `copy_meal_plan_week` und
`reference_assessment_window_flags`.

## Und die vier alten Plaene sind leer

`[cmd]` **Die Kopie wirkt beim Anlegen** — **die geseedeten Plaene
sind vorher entstanden.**

`[read]` **Tom: *,,der bestehende eigene (geseedete plan) hat auch
nicht was in preferences ist."***

`[read]` **Zwei Faelle, zwei Loesungen:**

`[read]` **Selbstplaene ohne Slots** — **duerfen die Vorlieben lesen,
solange sie keine eigenen haben.** `[cmd]` **Das ist der Rueckfall,
den G-335 fuer das Tagebuch schon gebaut hat.**

`[read]` **Gelieferte Plaene ohne Slots** — **der Seed muesste sie
mitbringen.** `[cmd]` **C-380 hat die drei Plaene gefuellt, bevor
`meal_plan_slots` existierte.**

## Und die Ghost-Eintraege

Tom: *,,ghostentries sind klar die bilden ab was im plan drin ist
also muss der plan angepasst werden."*

`[read]` **Richtig** — **wenn der Plan seine Struktur traegt und das
Raster sie liest, folgen die Ghost-Eintraege von selbst.**

## Auftrag — das Raster liest die Planstruktur

**Beauftragt am 2026-09-02.**

### 1 · `meal_plan_slots` anschliessen

`[cmd]` **Die Tabelle ist gebaut und gefuellt** (C-396) — **`test`
traegt fuenf Slots.**

`[cmd]` **In `apps/` liest sie niemand.**

`[read]` **`rasterZeilen` rechnet weiter aus `food_preferences`** —
**deshalb vier Zeilen statt fuenf, und der Satz *aus deinen
Vorlieben*.**

### 2 · Die Rangfolge, wie in G-335

`[read]` **Du hast sie fuer die Namen schon gebaut** — **dieselbe
Ordnung gilt fuer die Zeilen:**

    Plan-Slots         wenn der Plan welche hat
    Nutzer-Slots       wenn nicht, und es ein Selbstplan ist
    meals_per_day      Rueckfall, wie im Tagebuch

`[cmd]` **Und der Satz unter dem Raster muss sagen, welche Quelle
gilt** — heute behauptet er *aus deinen Vorlieben*, **auch wenn der
Plan eigene traegt.**

### 3 · Die vier alten Plaene

`[cmd]` **`Aufbau-Wochenplan`, `Cut 4-Meal 2200`, `Lean bulk 3100`,
`Buddy auto-plan`: 0 Slots.**

`[read]` **Sie entstanden, bevor `meal_plan_slots` existierte.**

`[read]` **Selbstplaene ohne Slots duerfen die Vorlieben lesen** —
**das ist der Rueckfall.** `[read]` **Aber die drei gelieferten
muessten ihre eigene Struktur haben** — **melde, wenn Codex den Seed
nachziehen muss.**

### 4 · Die Ghost-Eintraege folgen

Tom: *,,ghostentries bilden ab was im plan drin ist, also muss der
plan angepasst werden."*

`[read]` **Richtig** — **wenn das Raster die Struktur liest, folgen
sie von selbst.** `[cmd]` **Miss es, statt es anzunehmen.**

### 5 · *Mahlzeit hinzufuegen* wird ein Modal

Tom, 2026-09-02: *,,das unten in diary auch nicht geloest, ich denke
da ist ein modal besser."*

`[cmd]` **Heute steht das Formular inline unter der letzten Karte** —
**deshalb verschwindet der Knopf beim Klick, deshalb draengeln sich
Uhrzeit und Auswahl.**

`[cmd]` **Und die Auswahl heisst weiter *Sonstiges*** — **sie liest
die Slots nicht.**

`[read]` **Ein Modal hat Platz fuer das, was eine neue Mahlzeit
braucht:** Name, Zeit, und den Hinweis, wo sie einsortiert wird.

`[cmd]` **Und es gibt schon eins:** `FoodSuchModal` aus G-320,
**ziehbar seit G-321.** `[read]` **Dieselbe Machart, keine neue.**

### Was die Auswahl anbietet

`[read]` **Die eigenen Slots, mit ihrer Zeit** — **und Freitext
daneben.**

`[cmd]` **E-58: wer um 22:00 isst und keinen Slot dafuer hat, erfasst
trotzdem.** `[read]` **Die Slots ordnen, sie schreiben nicht vor.**

`[read]` **Der Satz *,,Wird bei Nachmittagssnack (16:00) einsortiert
— die naechstliegende Zeit"* ist richtig** — **er gehoert ins Modal,
nicht unter ein halb verdecktes Feld.**

### Was nicht zu tun ist

**Keine zweite Rangfolge** — die aus `slots-lage.ts` gilt.
**Nichts auf `dev@lumeos.app` schreiben** — der Plan `test` ist Toms
Probe, er bleibt stehen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    test              fuenf Zeilen im Raster, nicht vier
    Satz darunter     nennt die richtige Quelle
    Aufbau-Plan       Rueckfall greift, gezaehlt
    Ghost-Eintraege   folgen der Planstruktur, gemessen
    gelieferte Plaene was fehlt, gemeldet
    Mahlzeit anlegen  im Modal, Slots als Auswahl plus Freitext
    22-Uhr-Fall       ohne passenden Slot erfassbar
    Einsortiersatz    steht im Modal, sichtbar
    Bildschirmfoto    vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
