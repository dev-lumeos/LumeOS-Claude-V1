---
nr: G-611
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-07

braucht: []
kind_von: G-608

quellen:
  - docs/punkte/erledigt/goals-g-0608-die-stufenwochen-sind-im-programm-editierbar.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien: []
---

# Ein Ziel laesst sich nicht loeschen

## Befund

`[read]` Claude Code, G-608: es gibt in der App keinen Loeschweg fuer
Ziele - das Testziel musste per SQL entfernt werden. Ein Nutzer, der sich
vertippt oder ein Ziel aufgibt, kann es nur pausieren.

## Was zu klaeren ist

Messen, ob die Datenbank einen Loesch- oder Archivweg hat (Status,
Funktion, Kaskaden auf Phasen, Programme, Zielwerte, Snapshots), und
was das Mockup vorsieht. Danach entscheiden: echtes Loeschen oder
Archivieren mit Historie.

## Entschieden - 2026-10-08, Tom (Dossier 9, Fragen 1 und 2)

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Frist abgelaufen oder Ziel erreicht: das Ziel wird eingefroren (Status sichtbar, keine weitere Wertung), Details bleiben lesbar; Aktionen Neustart (neue Eingabe, vorbelegt) und Löschen. Ein eingefrorenes steuerndes Ziel heißt: Erhaltung mit Warnung (G-622). Dazu Archivieren für abgeschlossene Ziele. Löschen eines Ziels mit Verlauf: Bestätigung, Hinweis auf Beenden.
