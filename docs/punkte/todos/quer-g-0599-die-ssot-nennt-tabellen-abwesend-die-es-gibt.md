---
nr: G-599
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-10-03

braucht: [G-386, G-593]
kind_von: G-593

quellen:
  - docs/punkte/erledigt/quer-g-0386-die-ssot-in-den-abwesenheitswaechter.md
  - docs/punkte/erledigt/recovery-g-0593-die-attrappe-nennt-eine-tabelle-die-es-unter-anderem-namen-gibt.md

beruehrt:
  tabellen: []
  dateien:
    - docs/ssot/127-recovery-checkins.md
    - docs/ssot/162-recovery-rest.md
    - tools/ssot-abwesenheit-pruefen.mjs
---

# Die SSOT nennt Tabellen abwesend, die es gibt — und der Waechter sieht den Fast-Treffer nicht

## Der Befund — zwei Teile, einer davon unsichtbar

`[cmd]` **`node tools/ssot-abwesenheit-pruefen.mjs`, gemessen am 03.10.:**

    206 Tabellen, 162 Dateien, 73 Zeilen mit Verneinung
    ROT - 73 Zeile(n). Die genannten Tabellen stehen in
          information_schema.

**Darunter Stellen wie** `97-ziele-und-phasen.md:72` (`nutrition_targets`),
`105-medical-schema.md:28` (vier Tabellen auf einer Zeile),
`130-goals-bauordnung.md:154` (`goal_strategies`, `user_goals`).

`[read]` **Der Waechter laeuft nicht im Gate** — weder in `gate:docs`
noch im vollen Lauf. **Er ist eine Inventur von Hand, und 73 rote Zeilen
gehoeren heute niemandem.**

### Der zweite Teil ist der interessante

`[cmd]` **Die drei Stellen, die Claude Code in G-593 gefunden hat, sind
NICHT unter den 73:**

    docs/ssot/127-recovery-checkins.md:173
      Braucht `recovery.protocols` + `protocol_assignments`
      (Entwurf 2.6) - beide gibt es nicht.
    docs/ssot/127-recovery-checkins.md:213
      `recovery.protocols` + `_assignments` | Protokolle | 2.6
    docs/ssot/162-recovery-rest.md:163
      `recovery.protocols`, `training.routines`, `training.blocks`.

`[cmd]` **Weil `recovery.protocols` tatsaechlich nicht existiert.** Die
Tabelle heisst `recovery.recovery_protocols`, 12 Spalten, 2 Zeilen, RLS
mit 4 Policies. **Die Aussage ist woertlich wahr und sachlich falsch** —
und der Waechter kann das nicht sehen, weil er den genannten Namen
prueft und keinen Fast-Treffer kennt.

`[read]` **Das ist dieselbe Falle, an der das Modal haengengeblieben
ist.** Derselbe Satz, einmal im Code und einmal in der SSOT, und beide
Male hat die wortgetreue Richtigkeit die Sache verdeckt. **Ein Waechter,
der nur den exakten Namen prueft, deckt die ganze Klasse nicht.**

## Was zu tun ist — alles beim Orchestrator

### A1 — die drei Recovery-Stellen nachziehen

**`127:173`, `127:213`, `162:163`** sagen, es gebe die Tabelle nicht.
**Sie gibt es, unter anderem Namen, und seit `c3e2c7fd` schreibt die
Oberflaeche hinein.** Nachziehen mit dem gemessenen Stand und dem Datum.

`[read]` **`protocol_assignments` dagegen gibt es wirklich nicht** —
nicht mitberichtigen, nur den Teil, der falsch ist.

### A2 — der Waechter lernt den Fast-Treffer

**Wenn eine Zeile `<schema>.<name>` fuer abwesend erklaert und es im
selben Schema einen Namen gibt, der `<name>` enthaelt oder von ihm
enthalten wird, ist das ein eigener Befund** — nicht ROT wie ein
Volltreffer, aber genannt. **Soll-Zahl setzen und in beide Richtungen
belegen:** mit `recovery.protocols` muss der neue Befund anspringen, nach
der Berichtigung aus A1 nicht mehr.

`[annahme]` **Kosten gering** — der Waechter hat die Tabellenliste schon
im Speicher. **Zu messen, nicht zu schaetzen.**

### A3 — die 73 entscheiden, nicht sammeln

`[read]` **73 Zeilen sind keine Aufgabe, sondern eine Frage an Tom:**
sollen sie nachgezogen werden, oder ist die SSOT an diesen Stellen als
historischer Stand gemeint? **Vorher keine Massenkorrektur.** Wenn ja:
nach Modul geteilt, je ein Punkt, mit gemessenem Stand.

`[read]` **Und die dazugehoerige Frage:** gehoert der Waechter ins
`gate:docs`? **Erst nach A3** — ein Waechter mit 73 roten Zeilen im Gate
haelt jeden Commit an.

**Nicht Teil:** G-596 (Bibliothek gegen Verlauf) · G-597 · G-598 · der
Abwesenheitswaechter fuer den CODE (`tools/abwesenheit-pruefen.mjs`), der
ist gruen: 18 markierte Aussagen, alle gelten noch.

## Toms Antwort, 2026-10-03 — A3 ist entschieden

**Tom:** *„ja das ist dein orchestrator job die immer nachzuziehen"*

`[read]` **Damit ist A3 keine Frage mehr, sondern eine Daueraufgabe.** Die
73 Zeilen werden nachgezogen, nicht als historischer Stand gelassen, und
die SSOT wird laufend nachgezogen statt einmalig.

## Erster Durchgang — und er hat den Waechter verschlechtert

`[cmd]` **Nachgezogen am 03.10. (Recovery, der gemessene Stand):**

    recovery hat NEUN Tabellen, nicht eine und nicht drei:
      checkins 29 · scores 34 · modality_log 17 ·
      overtraining_alerts 11 · score_contributions 11 ·
      stress_logs 12 · recovery_protocols 12 ·
      muscle_recovery_profiles 6 · recovery_effort_factors 6
    alle mit RLS, gemessen gegen pg_class

**Geaendert:** `127-recovery-checkins.md` — die Protocols-Zeile, der Satz
*„genau eine Tabelle"*, und die `Fehlt`-Tabelle nennt jetzt nur noch
Fehlendes (`hrv_readings`, `protocol_assignments`, Abhak-Zustand).
`162-recovery-rest.md` — zwei Nachtraege mit dem heutigen Stand.

`[cmd]` **Und der Waechter ist dadurch von 73 auf 76 gestiegen:**

    vorher                 73 Zeilen
    nach dem Nachziehen    76 Zeilen
    neu rot: 162-recovery-rest.md:168, :176, :177

`[cmd]` **Der Grund ist der Nachzug selbst.** Die drei neuen Zeilen nennen
Tabellen, **die es gibt** — das ist der Inhalt einer Berichtigung —, und
sie stehen in einem Absatz, den der Waechter als Verneinung liest.
**Die Rows aus der `Fehlt`-Tabelle zu entfernen hat nichts geaendert;**
es sind die Berichtigungssaetze.

`[read]` **Damit ist A2 keine Kuer mehr.** Solange der Waechter eine
Berichtigung nicht von der Behauptung unterscheiden kann, die sie
berichtigt, **treibt jede Erfuellung der Daueraufgabe seine Zahl nach
oben** — und die Daueraufgabe ist mit ihm nicht durchfuehrbar.

### A2 neu — der Waechter lernt die Berichtigung, dann den Fast-Treffer

**Zuerst:** eine Zeile, die eine Berichtigung traegt, zaehlt nicht als
Verneinung. Form zu entscheiden — eine Marke am Zeilenanfang ist das
einfachste, etwa `[berichtigt]`. **Soll-Zahl setzen und in beide
Richtungen belegen:** mit der Marke gruen, ohne sie rot.

**Danach** der Fast-Treffer aus A2 alt: `recovery.protocols` gegen
`recovery.recovery_protocols`.

`[read]` **Ich habe die Saetze NICHT umgeschrieben, um den Waechter
gruen zu bekommen.** Der Text ist richtig; der Waechter ist zu eng.
**Einen Waechter mit Prosa zu bedienen ist die Umkehrung von A-98.**

## Rest der Daueraufgabe

`[read]` **70 Zeilen bleiben**, nach Modul zu teilen. **Reihenfolge nach
Schaden:** zuerst die Zeilen mit `[cmd]`-Marker und einer Zahl — die
liest niemand nach —, dann der Rest. **Nicht in einem Zug**, und jede
Stelle mit gemessenem Stand und Datum.
