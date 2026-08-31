---
nr: G-295
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-295 — Die Heatmap wurde entfernt, und die Spec verlangt sie

## Befund

`[cmd]` **`SPEC_10` nennt `NutrientHeatmap`:** *,,28-Tage Grid:
Compliance-Farbe pro Tag"*.

`[cmd]` **Sie wurde am 30.08. in G-264 entfernt** — mit meiner
Abnahme.

`[read]` **Die Begruendung war: *,,der Nutrients-Reiter zeigt
denselben Verlauf je Naehrstoff"*.** `[read]` **Das war falsch.**

`[cmd]` **Der Nutrients-Reiter zeigt eine Sparkline je Naehrstoff
ueber den gewaehlten Zeitraum.** `[cmd]` **Die Heatmap zeigt einen
Tag je Feld, gefaerbt nach Vollstaendigkeit** — **28 Tage
nebeneinander, alle Naehrstoffe zusammen.**

`[read]` **Das ist eine andere Frage: nicht *,,wie lief Vitamin C"*,
sondern *,,welche Tage waren gut"*.**

## Die Daten stehen

`[cmd]` **74 Tage mit vollstaendiger Bilanz in den letzten 30 Tagen**
— `daily_nutrient_summary_long` traegt `value_complete` je Naehrstoff
und Tag.

`[read]` **Die entfernte Attrappe war richtig entfernt** — sie war
erfunden. **Der Platz bleibt trotzdem leer.**

## Auftrag

**Mitbeauftragt mit G-291 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis (Kurzfassung, Einzelheiten in G-291)

`[cmd]` **Echt gebaut. 28 Tage, ein Feld je Tag, Ziel 2.500 kcal**
aus `goals.nutrition_targets` (gueltig ab 2026-05-21). Verteilung fuer
`dev@lumeos.app` am 2026-08-31: **18 optimal, 5 gut, 4 knapp, 1
gering, 0 ohne Eintrag** — die Legende zaehlt sie mit, und die Zahlen
stimmen mit der Datenbank ueberein.

`[read]` **Toms Berichtigung war richtig, meine Abnahme vom 30.08.
falsch.** Die Sparkline zeigt einen Naehrstoff ueber die Zeit, die
Heatmap einen Tag je Feld — *„welche Tage waren gut"*, nicht *„wie
lief Vitamin C"*.

`[cmd]` **Die Vorlage rechnet gegen ein festes `calTarget = 2100`;
hier kommt das Ziel aus der Datenbank.** `[read]` **Fehlt es, steht
ein Satz statt eines gefaerbten Gitters** — eine erfundene Zahl
faerbte 28 Felder, ohne dass jemand saehe, dass sie erfunden ist.

Bild: `backup/g291-heatmap.png`

## Abnahme

**2026-08-31, mit G-291 abgenommen:** gebaut: 28 Felder gegen das echte Ziel, ohne Ziel ein Satz statt
eines gefaerbten Gitters.
