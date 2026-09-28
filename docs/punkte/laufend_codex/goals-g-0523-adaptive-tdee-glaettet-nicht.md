---
nr: G-523
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-27
agent: codex
beauftragt: 2026-09-28
quellen:
  - docs/specs/Goals/SCORING.md
  - docs/specs/Goals/FEATURES.md

beruehrt:
  tabellen:
    - goals.body_measurements
    - goals.nutrition_targets
  dateien:
    - docs/specs/Goals/SCORING.md
    - apps/web/src/app/v2/goals/tab-phase.tsx

zahlen:
  gemessen: 2026-09-27
  alpha_live: 1.0
  alpha_spec: 0.3
  kcal_per_kg_live: 7700
  kcal_per_kg_spec: 7700
---

# G-523 - der adaptive TDEE glaettet nicht, er springt

## Der Befund

`[cmd]` **`goals.adaptive_tdee` gemessen am 2026-09-27 ueber
`pg_get_functiondef`:**

    1.0::numeric AS alpha
    7700::numeric AS kcal_per_kg
    'rolling_14d_intake_weight_delta_alpha_1_formula_baseline' AS method

Der Kern:

    c.alpha * (c.avg_intake_kcal
               - (c.weight_delta_kg * c.kcal_per_kg
                  / c.measurement_span_days))
    + (1 - c.alpha) * c.formula_tdee_kcal

`[cmd]` **`docs/specs/Goals/SCORING.md` Abschnitt 1 verlangt etwas
anderes:**

    const alpha = 0.3;
    return Math.round(alpha * rawTDEE + (1 - alpha) * previousTDEE);

Zwei Unterschiede, beide messbar:

**1. `alpha = 1.0` heisst: keine Glaettung.** Der zweite Term wird
mit Null multipliziert. Der ausgewiesene ,,adaptive" Wert ist der
rohe Wochenwert, ohne jede Daempfung.

**2. Der zweite Term ist der Formelwert, nicht der Vorgaengerwert.**
Die Spec rechnet gegen `previousTDEE` — das ist eine Reihe mit
Gedaechtnis. Live steht dort `formula_tdee_kcal`, also Harris-Benedict.
**Selbst mit `alpha = 0.3` waere es kein EMA**, sondern eine feste
Mischung aus Wochenwert und Formel, die nie lernt.

`[read]` **7700 kcal/kg stimmt.** Das ist die eine Zahl, die passt.

## Warum das schwer wiegt

`[read]` **Die Glaettung ist keine Kosmetik, sie ist die
Entscheidung.** `STRATEGY.md` fuehrt sie zweimal auf: ,,Gewicht =
7-Tage Moving Average — Tägliche Schwankungen frustrieren User" und
,,Adaptive > Static — Dein TDEE ist 2.847 kcal (nicht 2.500 wie eine
Formel sagt)". Ein ungedaempfter Wochenwert springt mit jedem
Wasserstand. Genau das sollte er nicht.

`[cmd]` **Und der Wert steht im Bild.** 38 Treffer auf
`adaptive_tdee` liegen in `ansicht.tsx`, `page.tsx` und
`tab-phase.tsx` — der Nutzer sieht ihn.

## Was zuerst zu klaeren ist

`[read]` **Ob `alpha = 1.0` ein Versehen oder eine Zwischenstufe
war.** Der Methodenname nennt `alpha_1` ausdruecklich, also war es
Absicht — vermutlich, weil ohne Vorgaengerwert nichts zu mischen war.
**Dann ist der fehlende Teil nicht alpha, sondern die Reihe:** es
gibt keine Tabelle, die den letzten TDEE-Wert haelt.
`goals.tdee_settings` aus `DATABASE.md` Abschnitt 5 waere sie — sie
fehlt (G-524).

## Nachweiszeilen

**A1** — messen, ob eine Reihe vergangener adaptiver Werte irgendwo
liegt. Ohne sie ist `previousTDEE` nicht rechenbar, und A2 haengt an
G-524.

**A2** — `alpha = 0.3` gegen den Vorgaengerwert, nicht gegen die
Formel. Der Formelwert bleibt der Startwert der Reihe, das ist er in
der Spec auch.

**A3** — ein Test mit einer Wochenreihe, die einmal springt: mit
`alpha = 1.0` muss er rot werden, mit `0.3` gruen. **Sonst misst er
die Glaettung nicht.**

**A4** — `confidence` und `reliable` bleiben. Sie sind eine
Zutat, die die Spec nicht hat, und sie sind richtig.

**A5** — die Anzeige nennt den Stichtag und die Fensterlaenge. Ein
Wert aus 14 Tagen ist etwas anderes als einer aus 3.

## Stand 2026-09-28 — blockiert, und der Grund ist gemessen

`[cmd]` **Codex hat A1 gemessen: es gibt keine Reihe vergangener
adaptiver TDEE-Werte.** `goals.tdee_settings` waere nur ein
aktueller Zustand, keine Reihe. Im Vorgaengerrepo lag dafuer
`tdee_history`.

`[read]` **Damit haengt B2 an G-524**, nicht an Fleiss: ohne Reihe
ist `previousTDEE` nicht rechenbar, und alpha = 0.3 gegen den
Vorgaengerwert ist nicht baubar.

`[cmd]` **Die Gegenprobe steht aber schon fest**, und sie ist
nachgerechnet: Startwert 2500, Rohwerte 3500 und 2500 ergeben mit
alpha = 0.3 genau 2800 und 2710.

    0.3 * 3500 + 0.7 * 2500 = 2800
    0.3 * 2500 + 0.7 * 2800 = 2710

`[read]` **Diese zwei Zahlen schliessen beide Fehler aus** — alpha = 1
ergaebe 3500 und 2500, eine feste Mischung gegen den Formelwert
etwas Drittes. **Der Test misst die Glaettung, nicht ihre
Anwesenheit.**
