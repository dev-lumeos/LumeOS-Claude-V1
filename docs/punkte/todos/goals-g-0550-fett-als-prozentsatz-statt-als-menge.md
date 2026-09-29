---
nr: G-550
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29

braucht: [G-543]
kind_von: G-545

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
  spalte_heute: fat_percent
  einheit_heute: anteil_der_kalorien
  einheit_der_quelle: gramm_pro_kg
---

# Fett steht als Prozentsatz, gebraucht wird eine Menge

`[cmd]` **`goals.goal_strategies.fat_percent` ist ein Anteil der Kalorien**
(0,15 bis 0,40 nach dem CHECK aus G-536). Die Quelle rechnet in **g/kg
Körpergewicht** mit einem **Mindestwert je Phase**
(`docs/ssot/131`, Abschnitt 3.1).

## Warum das nicht dasselbe ist

`[read]` **Ein Prozentsatz der Kalorien sinkt mit dem Defizit** — und zwar
genau dort, wo die Hormongrenze wichtig wird. Gerechnet bei 83,74 kg:

| Phase | Kalorien | 25 % davon | entspricht g/kg | Quelle verlangt |
|---|---|---|---|---|
| Lean Bulk | 3.300 | 92 g | **1,10** | 0,9 |
| Cut | 2.400 | 67 g | **0,80** | 0,8 ✓ |
| Prep Late | 2.100 | 58 g | **0,70** | 0,6, min 0,5 |
| Peak Week | ~2.250 | 63 g | **0,75** | 0,4 |

`[read]` **Im Aufbau gibt der Prozentsatz zu viel Fett, in der Ladewoche
fast das Doppelte** — und dort ist zu viel Fett der Fehler, weil es den
Kohlenhydraten den Platz nimmt (G-549). Nur im Cut trifft er zufällig.

## Der Mindestwert ist eine eigene Regel, und sie fehlt ganz

    Off-Season · Lean Bulk · Recomp · Cut · Prep Early   min 0,6 g/kg
    Prep Mid · Prep Late                                 min 0,5 g/kg
    Peak Week                                            min 0,4 g/kg

`[read]` Als Rechnung: `max(Gewicht × Faktor, Gewicht × Minimum)` — **ein
Boden, kein Zielwert.** Unser CHECK begrenzt `fat_percent` auf 0,15 bis
0,40, aber das ist eine Grenze am Prozentsatz, nicht am Gramm pro Kilogramm.
**Bei 1.800 kcal sind 15 % noch 30 g — das sind 0,36 g/kg und damit unter
jedem Mindestwert der Quelle.**

## Was zu tun ist

1. `fat_g_per_kg` und `fat_min_g_per_kg` als Spalten, mit CHECK
   (0,3 bis 1,2 beziehungsweise 0,3 bis 0,8).
2. `fat_percent` bleibt, verliert aber die Steuerfunktion — wie
   `tdee_modifier` in G-543. **Nicht löschen:** er ist die Gegenprobe.
3. `berechne_zielwerte` rechnet `max(Gewicht × Faktor, Gewicht × Minimum)`.
4. Die Werte je Strategie aus `docs/ssot/131` Abschnitt 3.1, über die
   Zuordnung in Abschnitt 1.

## Zu belegen

- je Strategie vorher/nachher in Gramm, und die Differenz benannt
- eine Strategie, wo der Mindestwert **greift** (niedriges Kalorienziel),
  und eine, wo er **nicht** greift — beide zeigen, sonst misst die Probe
  nicht, dass der Boden wirkt
- die Kohlenhydrate verschieben sich mit: je Strategie auch deren Änderung,
  weil sie die Restgröße sind
- Nachweise auf `test-user@lumeos.local` · `pnpm gate` grün ·
  Wegwerf-DB verworfen mit Zahl · kein `db push` · live einspielen ·
  nichts committen

**Reihenfolge:** nach G-543. Beide fassen `berechne_zielwerte` an, und zwei
Eingriffe gleichzeitig trennen keinen Nachweis.
