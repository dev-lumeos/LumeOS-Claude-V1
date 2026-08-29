---
nr: C-102
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: C-100
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-28
beruehrt:
  tabellen: []
  dateien: ["docs/ssot/51-sortweight-formel.md"]
zahlen: null
---

# C-102 - `milch` findet Joghurt statt Milch

## Befund

(neu 2026-08-19).
  Rest aus C-100.

  `[cmd]` **Der Pulver-Abzug wirkt** — Magermilchpulver ist von 1000 auf
  780 gefallen. **Aber `milch` traegt weiter nicht:** Gewinner ist
  **Joghurt (0,5 % Fett) mit 980**, Vollmilch frisch bleibt bei **510.**

  `[read]` **Der C-100-Agent nennt es richtig:** *„ein Ranking-/Intent-
  Thema, nicht mehr der Pulver-Abzug."*

  `[cmd]` **Die Ursache steht in `51-sortweight-formel.md`:** *„Ein
  Getraenk, das zu 87 % aus Wasser besteht, kann gegen ein Pulver keine
  Naehrwertpunkte gewinnen."* **Joghurt hat mehr Protein je 100 g als
  Milch — die Formel belohnt Dichte.**

  `[read]` **Zwei Wege, beide noch nicht entschieden:**

  **Trinkform vor Pulverform** — der Vorschlag aus dem Bericht, *„die
  steht nicht in der Spec und wurde nicht erfunden."*

  **Oder Haeufigkeit statt Dichte** — `meal_items` protokolliert, was
  gegessen wird. `[cmd]` **Cronometer sortiert nach zuletzt und am
  haeufigsten benutzt.**

  `[read]` **Und G-65 loest es womoeglich von selbst:** Wer `Joghurt`
  abwertet, sieht ihn nicht mehr oben. **Erst Preferences bauen, dann
  neu messen.**

## Auftrag

**Mitbeauftragt mit C-20 am 2026-08-28.** Der Auftragstext
und der Bericht stehen dort.
