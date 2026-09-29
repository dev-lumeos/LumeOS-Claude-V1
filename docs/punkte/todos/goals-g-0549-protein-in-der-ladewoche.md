---
nr: G-549
typ: entscheidung
modul: goals
schwere: mittel
angelegt: 2026-09-29

braucht: []
kind_von: G-542

quellen:
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

zahlen:
  gemessen: 2026-09-29
  peak_week_protein_live: 2.50
  band_aus_der_quelle_unten: 2.0
  band_aus_der_quelle_oben: 2.4
---

# Wieviel Protein weicht in der Ladewoche?

`[cmd]` **`goal_strategies.peak_week.protein_per_kg` steht live auf 2,50 g/kg
Koerpergewicht.** Die Quelle (Dokument D vom 2026-09-29) nennt fuer Peak Week
**2,0 bis 2,4** — und senkt gleichzeitig Fett auf 0,5 g/kg.

## Warum das keine Zahlenkorrektur ist

`[read]` **Beides sinkt aus demselben Grund: um Platz zu machen.** In der
Ladephase sind 6 bis 8 g/kg Kohlenhydrate das Ziel (`docs/ssot/131`,
Abschnitt 5.2), und Kohlenhydrate sind bei uns die **Restgroesse**.

Gerechnet bei 83,74 kg und einem Tagesziel von 3.000 kcal:

    Protein 2,50 · Fett 0,5 g/kg    209 g · 42 g    ->  Carbs 432 g = 5,2 g/kg
    Protein 2,20 · Fett 0,5 g/kg    184 g · 42 g    ->  Carbs 457 g = 5,5 g/kg
    Protein 2,00 · Fett 0,4 g/kg    167 g · 34 g    ->  Carbs 490 g = 5,9 g/kg

`[read]` **Keine der drei Zeilen erreicht 6 g/kg** — das Tagesziel muesste
dafuer hoeher liegen. **Das ist der eigentliche Befund:** in der Ladewoche
kann die Restgroessenrechnung die Kohlenhydrate nicht liefern, die das
Protokoll verlangt, solange das Kalorienziel aus einem Defizitfaktor kommt.

`[cmd]` Und die Quellen sagen es auch: Peak Week rechnet **nicht** mit einem
Defizit, sondern mit Kohlenhydraten pro Kilogramm als **Vorgabe** (A 6.3,
C 4). **Das ist eine andere Rechenrichtung als alle anderen Phasen.**

## Was zu entscheiden ist

**Wieviel Protein und Fett weichen in der Ladewoche, damit die
Kohlenhydrate hineinpassen?**

`[read]` **Fuer Tobias am 2026-09-30.** Er hat Ladewochen selbst gemacht —
die Frage ist, wie er es haelt: Protein senken, Fett fast auf null, oder das
Kalorienziel anheben und die Vorzeichen umdrehen.

**Die Folge fuer den Bau haengt daran:** wird Protein nur gesenkt, ist es
eine Zeile im Katalog. Rechnet Peak Week dagegen mit Kohlenhydraten als
Vorgabe und den Kalorien als Ergebnis, ist es ein eigener Rechenweg neben
`berechne_zielwerte` — und dann gehoert er zu G-530
(Wettkampfvorbereitung braucht eine eigene Struktur).
