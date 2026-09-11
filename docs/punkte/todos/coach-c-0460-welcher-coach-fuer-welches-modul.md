---
nr: C-460
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-409
entscheidung: null
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
---

# C-460 — welcher Coach fuer welches Modul?

## Befund

Aus G-409, Claude Code, 2026-09-08.

`[cmd]` **Die Vorlage zeigt je Klient DREI Coaches mit Fach:**

    Anders Lindqvist - training
    Jana Bauer       - nutrition
    Dr. Kessler      - medical

`[cmd]` **Live: `coach.relationships` traegt eine Zeile je
Coach-Klient-Paar** ? **ohne Typ.**

> *,,Ein Klient mit vier Coaches ist vier Zeilen, aber welcher der
> Trainingscoach ist, steht nirgends."*

## Warum es die ganze Vorlage traegt

`[cmd]` **`SPEC_11:44` nennt CoachCards je Coach-Typ:**
**Training, Nutrition, Supplement, Medical.**

`[cmd]` **Und `shell.jsx:493` im Draft:** *,,42 notes / 86 messages
in 30d. Bench PR + TRT stability both attributed to coordinated
coaching."*

`[read]` **Die Klientensicht in `apps/web` zeigt *,,4 of 4
categories"*** ? **auch dort fehlt der Typ.**

## Was zu entscheiden ist

**a** ? **Eine Spalte `coach_type` an `relationships`.**

`[cmd]` **Werte: `training | nutrition | supplement | medical`**
? **aus SPEC_11:44.**

`[read]` **Dann kann ein Klient je Fach einen Coach haben.**

**b** ? **Eine eigene Tabelle.**

`[read]` **Wenn ein Coach mehrere Faecher abdeckt** ? **Anders
macht Training UND Recovery.**

`[cmd]` **`client_permissions` hat sieben Module** ? **die Faecher
der Vorlage sind vier.**

`[read]` **Miss, ob die vier auf die sieben Module abbildbar
sind** ? **oder ob es eine eigene Liste ist.**

## Und was daran haengt

`[read]` **Die Vorlage zeigt bei jedem Klienten, WER wofuer
zustaendig ist** ? **ohne Typ ist die Karte nicht baubar.**

`[cmd]` **G-409 hat sie mit den Vorlagenwerten gebaut** ? **als
Attrappe mit Vermerk.**

## Auftrag

**Beauftragt am 2026-09-08, als Teil der Kette C-464 -> C-452 ->
C-460.**

`[read]` **Der Kettenauftrag steht in C-464.**

## Zurueckgenommen 2026-09-08

Tom: *,,lass kettenauftraege komplett melden, wir brauchen keine
zwischenresultate."*

`[read]` **Die Kette C-464 -> C-465 -> C-460 ist aufgeloest.**

`[cmd]` **C-464 ist abgenommen, C-465 laeuft als Einzelauftrag.**

`[read]` **C-460 wartet auf Toms Entscheidung.**
