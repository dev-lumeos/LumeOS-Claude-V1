---
nr: G-552
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-29

braucht: [G-545]
kind_von: null

quellen:
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - recovery.scores
    - recovery.score_contributions
    - training.program_blocks
  dateien:
    - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

zahlen:
  gemessen: 2026-09-29
  recovery_tabellen_live: 9
  training_tabellen_live: 17
---

# Training und Erholung kennen die Phase nicht

`[cmd]` **Beide Module sind gebaut** — `recovery.scores`,
`recovery.score_contributions`, `training.programs`, `program_blocks`,
`routines`. **Was fehlt, ist die Kopplung an die Phase.**

`docs/ssot/131` Abschnitte 3.4 und 4.1 liefern sie, und zwar vollstaendig.

## Zwei getrennte Abgleiche, nicht ein Auftrag

### A — Trainingsvolumen und Intensitaet je Phase (Abschnitt 3.4)

Saetze je Muskelgruppe und Woche, nach Erfahrung **und** Phase: von 3
(beginner, Peak Week) bis 24 (elite, Lean Bulk). Dazu die Intensitaet in
% 1RM je Phase und die Erholungsanpassung (<50 → ×0,70 bis >85 → ×1,05).

`[read]` **Die interessante Zeile ist Lean Bulk**: sie traegt **mehr**
Volumen als Off-Season (20 gegen 18 bei advanced) — im Aufbau mit
kontrolliertem Ueberschuss ist die Erholung besser als bei hohem
Ueberschuss. Das ist nicht offensichtlich und waere geraten falsch.

**Zu pruefen, bevor etwas gebaut wird:** kennt `training.program_blocks`
schon eine Phase oder ein Volumenziel? Wenn ja, ist es ein Abgleich; wenn
nein, eine neue Spalte.

### B — Die Gewichtung der Erholungsbewertung (Abschnitt 4.1)

    Schlaf 30 · HRV 30 · Stress 20 · Muskelkater 20 Punkte

Mit Stufen je Grösse, nicht linear: HRV >100 % der Baseline gibt 30, 70–80 %
gibt 10, darunter 5.

`[cmd]` **`recovery.score_contributions` existiert** — die Gewichtung ist
nicht geprueft. **Das ist der eigentliche Abgleich:** stimmen die vier
Beitraege und ihre Punkte, oder rechnet LumeOS anders?

`[read]` **Und eine Zahl steht schon im Widerspruch:** G-520 nutzt
`hrv7d < baseline × 0.85`, also 15 %. Die Quelle nennt 10 % (Intensitaet
senken) und 20 % (Ruhetag) als zwei Schwellen. **Eine Zahl zwischen zwei
belegten ist keine dritte Meinung, sondern eine ungepruefte.**

## Was ausdruecklich nicht uebernommen wird

`[cmd]` **Die Kalorien-Senkung bei hohem Koerperfett** (Abschnitt 3.2):
`high −3 %`, `very_high −5 %`, begruendet mit *„konservativer"*. Das
widerspricht Helms — wer mehr Reserve hat, kann schneller abnehmen, nicht
langsamer. **Die Proteinreihe derselben Tabelle ist begruendet** (Muskelschutz
bei wenig Reserve) und darf; die Kalorienreihe braucht Tobias.

**Damit ist das die einzige Frage in diesem Punkt, die eine Entscheidung
verlangt.** Der Rest ist Messung gegen eine Quelle.

## Reihenfolge

`[read]` **Nach den Goals-Grundlagen.** Beide Abgleiche sind nuetzlich und
keiner blockiert etwas — und ein Waechter, der Trainingsvolumen gegen eine
Phase prueft, braucht erst die Phase, die G-538 und G-544 gerade bauen.
