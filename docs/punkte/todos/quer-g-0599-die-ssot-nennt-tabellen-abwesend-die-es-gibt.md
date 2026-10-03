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
