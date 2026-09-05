---
nr: G-346
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-340
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: de9f4351
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/modale.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-346 — Quick-Add braucht eine Mahlzeit

## Befund

Aus G-340, Claude Code, 2026-09-07.

`[cmd]` **Der Quick-Add-Posten haengt an einer echten Mahlzeit,
nicht an einer Kategorie.**

`[read]` **Das heisst: fuer den Tag muss mindestens eine Mahlzeit
angelegt sein.** `[cmd]` **Das Modal sagt es.**

`[read]` **Er hat es gemeldet, statt einen Einstieg zu erfinden.**

## Warum es so gebaut ist

`[cmd]` **`meal_items.meal_id` ist Pflicht** — **ein Posten ohne
Mahlzeit gibt es nicht.**

`[read]` **Und E-58 sagt: die Zeit ordnet zu.** `[read]` **Ein
Posten ohne Mahlzeit haette keine Zeit und damit keinen Ort im
Tag.**

## Zu entscheiden

`[read]` **Soll Quick-Add die Mahlzeit selbst anlegen?**

`[read]` **Dafuer:** **wer schnell etwas eintraegt, will nicht erst
eine Mahlzeit anlegen.** `[cmd]` **Und seit G-336 gibt es das
Mahlzeiten-Modal** — **der Weg existiert, er ist nur ein zweiter
Schritt.**

`[read]` **Dagegen:** **eine automatisch angelegte Mahlzeit hat einen
Namen und eine Zeit, die niemand gewaehlt hat.** `[read]` **Die
naechstliegende Slot-Zeit waere der naheliegende Wert** — **aber
dann entstehen Mahlzeiten, die der Nutzer nicht erwartet.**

`[read]` **Ein dritter Weg: Quick-Add fragt nach der Zeit und legt
die Mahlzeit mit an** — **ein Schritt, zwei Wirkungen.**

## Auftrag

**Mitbeauftragt mit G-345 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: bleibt Produktentscheidung

`[cmd]` **Ohne das entfallene UNIQUE ist offen, ob *Mahlzeit mit
anlegen* immer eine neue erzeugt oder eine bestehende
wiederverwendet** — **und wenn ja, nach welcher Regel.**

`[read]` **Das ist die Frage, die im Auftrag fehlte.** `[read]` **Der
Vorschlag lautete *ein Schritt, zwei Wirkungen*** — **und liess
offen, was bei einer zweiten Erfassung um dieselbe Zeit geschieht.**

`[read]` **Wer um 15:00 einen Kaffee und um 15:10 einen Keks
erfasst: eine Mahlzeit oder zwei?**

**Drei Wege:**

`[read]` **Immer neu** — **dann entstehen viele kleine Mahlzeiten.**

`[read]` **Bestehende im selben Slot wiederverwenden** — **dann
landet der Keks im *Nachmittagssnack*, was richtig waere.**

`[read]` **Nach Zeitfenster** — **etwa 30 Minuten.** `[read]` **Aber
eine Zahl, die niemand gewaehlt hat.**

## Auftrag

**Mitbeauftragt mit G-351 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-07, mit G-351 abgenommen: war schon gebaut.**

`[cmd]` **So, wie Tom es vorgeschlagen hatte** — **die bestehende
Mahlzeit im selben Slot wird wiederverwendet.**

`[cmd]` **Der 15:00/15:10-Fall am Schirm belegt:** **ein
Nachmittagssnack, nicht zwei.**

`[read]` **Ich hatte es als offene Produktentscheidung
weitergegeben** — **es war entschieden und umgesetzt.**

`[read]` **Und E-66 hat dasselbe fuer MealCam festgeschrieben:** die
Mahlzeit steht vor dem Foto.
