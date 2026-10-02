---
nr: G-584
typ: befund
modul: training
schwere: mittel
angelegt: 2026-10-02

braucht: [G-583]
kind_von: G-583

quellen:
  - docs/punkte/erledigt/quer-g-0583-drei-reste-ohne-aufrufer.md
  - docs/punkte/todos/training-g-0219-liveworkout-ohne-aufrufer.md

beruehrt:
  tabellen:
    - training.workout_sets
  dateien:
    - apps/web/src/app/v2/training/ansicht.tsx
---

# Drei Anzeigen ohne Quelle, aus dem LiveWorkout-Entwurf gerettet

## Woher dieser Punkt kommt

`[cmd]` **G-583 hat `LiveWorkout` entfernt** (147 Zeilen, 0 Aufrufer) —
**aber erst, nachdem die Zielgestalt als Block in `ansicht.tsx` stand.**
Der Entwurf war ihr einziger Ort, und ein toter Zweig ist kein Archiv.
**Dieser Punkt ist dieser Ort.**

## Die drei, wie sie im Entwurf standen

`[cmd]` **1. Pausenuhr.** `restTime` in Sekunden, Start/Pause/Reset,
Beschriftung *„target 3:00 · auto-start after log"* — **die Uhr lief nach
dem Protokollieren eines Satzes von selbst an.** `[read]` **Braucht keine
Quelle** — sie ist reine Anzeige und das billigste der drei.

`[cmd]` **2. PR-Marke.** Pille *„PR attempt"* am Satz. Der Bestwert lag im
Entwurf als Zeichenkette vor (`BW+34kg`, `+30kg ×5`). `[read]` **Braucht
eine Bestwertabfrage** — pro Uebung, pro Nutzer, und die Frage, ob ein PR
am Gewicht, an den Wiederholungen oder am e1RM haengt.

`[cmd]` **3. Zielvorgabe je Satz.** *„Target: 5×5 @ 117.5kg · RIR 2 ·
Last: …"* `[read]` **Braucht einen Trainingsplan je Satz** — und genau
der fehlt: C-145 (*„Plan braucht ein Schema, keine Anzeige"*) und C-169
sind offen.

## Was zu entscheiden ist, bevor etwas gebaut wird

`[read]` **Drei Dinge, drei verschiedene Voraussetzungen** — sie gehoeren
nicht in einen Auftrag:

1. **Die Uhr** ist baubar, sobald jemand sie will. Einzige Frage: laeuft
   sie wirklich von selbst an, und was passiert beim Verlassen des
   Reiters.
2. **Die PR-Marke** haengt an der Definition von PR. `[cmd]` G-429
   (`einRM mit Verweigerung`) und G-502 (`e1RM-Kachel rechnet nicht mit
   der Datenbank`) beruehren dieselbe Rechnung — **erst dort entscheiden,
   dann hier anzeigen.**
3. **Die Zielvorgabe** haengt an C-145/C-169, dem Trainingsplan-Schema.
   **Ohne Plan ist sie eine Attrappe mit Zahlen.**

`[annahme]` **Die Reihenfolge ist 1, 2, 3** — nach steigender
Voraussetzung. Aber das ist eine Vermutung; ob die Pausenuhr allein ein
Gewinn ist, weiss Tom besser als ich.

**Nicht Teil:** `LiveWorkout` selbst (G-583, erledigt) und die
Satzerfassung aus G-217 (gebaut und in Gebrauch).
