---
nr: G-11
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-16
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-28
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-11 - Die restlichen Nutrition-Tabs anbinden

## Befund

(neu 2026-08-16).
  Setzt G-08 voraus.

  `[cmd]` Sieben Tabs stehen, drei tragen Daten (`Diary`, `Nutrients`,
  `Food DB`). **Vier sind Attrappen:** `Insights`, `Meal plans`,
  `Preferences`, `Planner`.

  | | woran es hängt |
  |---|---|
  | `Insights` | Auswertungen über Zeiträume — `daily_summary` rechnet je Tag, nicht je Woche |
  | `Meal plans` | `[cmd]` `meal_plans` existiert nicht |
  | `Preferences` | `[cmd]` `food_preferences` und `food_preference_items` existieren, sind leer und nirgends angebunden |
  | `Planner` | setzt `meal_plans` voraus |

  **`Preferences` ist der nächste realistische Schritt** — `[cmd]` die
  Tabellen stehen seit Kettenschritt `050`, mit Zeilenschutz und
  Policies. Was fehlt, ist die Oberfläche und die Verbindung zur Suche.

  `[read]` `Insights` braucht eine Wochen- oder Monatsaggregation. Seit
  den Testdaten gibt es **43 Tage je Nutzer** — das wäre erstmals
  belegbar.

## Auftrag — die Attrappen-Tabs, vier Punkte

**Mitbeauftragt: G-248, G-137, G-152.** Bericht in diese Datei, die
anderen tragen einen Verweis.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Seit heute Regel in `CLAUDE.md`** — am 28.08. sind fuenf
Auftragspraemissen gefallen, weil ich gemessen und dann etwas anderes
behauptet habe.

`[read]` **Der Punkt selbst ist vom 16.08. und vermutlich zur Haelfte
ueberholt.** `[read]` **Er sagt *,,`meal_plans` existiert nicht"* —
Toms Bildschirmfoto vom 28.08. zeigt einen Meal-plans-Reiter mit
einem Wochenplan. **Miss zuerst, was heute gilt.**

`[cmd]` **Der massgebliche Mockup liegt in
`docs/spezifikation/10-plattform/design-system/theme-v1/`** —
`module-nutrition.jsx` und `module-nutrition-spec.jsx`. **NICHT der
`.js`-Ordner.** `[read]` **Und Vorlagen koennen ueber die
Dateigrenze hinweg aufgerufen werden:** G-98 hat gemessen, dass
`MealPlansView` in `-spec.jsx` steht und aus `module-nutrition.jsx`
als `window.MealPlansView` gerufen wird. **Zwei Punkte haben es
vorher nicht gefunden, weil sie nur eine Datei gelesen haben.**

### 1 · Welche Tabs sind heute noch Attrappe?

`[read]` **Der Punkt nennt vier: Insights, Meal plans, Preferences,
Planner.** **Miss es nach — am Bildschirm, nicht im Quelltext**
(A-59: 89 Marken im Code gegen 24 auf dem Schirm).

**Je Tab:** woran haengt er? Fehlt eine Tabelle, eine Entscheidung,
oder nur die Anbindung?

### 2 · Anbinden, was ohne Entscheidung geht

`[read]` **Der Punkt selbst schlaegt `Preferences` als naechsten
vor**, weil die Tabellen existieren. **Pruef das und bau, was
traegt.**

`[read]` **Was eine Entscheidung braucht, wird gemeldet, nicht
geraten.**

### 3 · G-248 — die Fehlzaehler

`[cmd]` **`daily_summary` fuehrt 35 `_missing`-Zaehler, der
Diary-Leseweg laedt neun** — und die, die feuern, sind nicht dabei.

`[read]` **35 im Tagebuch waeren zu viel.** `[read]` **Die Frage ist,
ob ein Sammelhinweis reicht** — *,,drei Naehrstoffe unvollstaendig"*
mit Verweis auf den Nutrients-Reiter — **statt neun einzelne.**

### 4 · G-137 — die verfallenen Ansichtsschluessel

`[read]` **Einmalige Nebenwirkung aus G-129:** gespeicherte Ansichten
tragen alte Gruppenschluessel, die Karten heissen anders. **Wer eine
Ansicht gespeichert hatte, startet einmal mit allem zugeklappt.**

`[cmd]` **Die Speicherung verwirft kaputte Werte sauber** (G-122).
`[read]` **Also kein Fehler — pruef, ob es nach G-249 ueberhaupt noch
gilt**, und schliess den Punkt oder benenne, was bleibt.

### Was nicht zu tun ist

**Keine Tabelle anlegen** — Codex arbeitet an der Suche.
**Nichts erfinden, wo Daten fehlen.** `[read]` **Ein Tab, der ehrlich
sagt, was ihm fehlt, ist besser als einer mit erfundenen Zahlen** —
das ist die Form, die seit G-208 im Haus ist.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Attrappen-Tabs               vorher / nachher, am Schirm
    je Tab                       woran es haengt
    angebunden                   welche, mit Datenquelle
    gemeldet statt gebaut        welche, mit Grund
    G-248                        Sammelhinweis oder Begruendung
                                 dagegen
    G-137                        gilt es noch?
    Ladezeit je Tab              ms, kalt und warm
    Bildschirmfoto je Tab        `node tools/schuss.mjs`

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und eine
Messung vor dem Neukompilieren zeigt alte Zahlen.
`[cmd]` **A-30** und **A-60** beachten.
`[read]` **Und eine Sabotage, die nicht faellt, kann zweierlei
heissen** — der Waechter taugt nichts, oder die sabotierte Stelle ist
wirkungslos. **Zweimal am 28.08. war es das Zweite.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Nachtrag vom Orchestrator, 2026-08-28

**Der gebaute `/v2/`-Stand ist der Massstab, nicht der Mockup.**

**Tom:** *,,theme-v1 ist das claude design von welchem wir v2
abgeleitet haben ... also ist theme-v1 nur noch eine ideen struktur
falls uns in v2 was fehlt."*

`[read]` **Also nicht: den Mockup gegen den gebauten Stand halten.**
**Sondern: den gebauten Stand messen.** `theme-v1` **nur
nachschlagen, wenn etwas fehlt und die Frage ist, wie es gemeint
war.**

`[cmd]` **Und es gibt zwei Routenbaeume:** `/v2/nutrition` und
`/nutrition`. **Der alte traegt ein eigenes Template und bleibt** —
Tom: *,,da laeuft ein anderes template und das soll bleiben"*.
**Nicht anfassen.**

`[read]` **Mein Fehler in diesem Auftrag:** ich habe `theme-v1` als
*,,massgeblich"* bezeichnet. **Das war falsch.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
