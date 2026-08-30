---
nr: C-202
typ: blocker
modul: supplements
schwere: hoch
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-202 - Produkte, Marken, Hersteller, Kennungen

## Befund

(neu 2026-08-22). **Blockiert durch Tom-Entscheidungen.**

  `[cmd]` `products` 50 · `brands` 120 · `manufacturers` 63 ·
  `product_identifiers` 72 (crawl_035) · `product_media` 3
  (Schema-Muster). **Im Repo: kein Produkt- oder Markenschema.**

  `[cmd]` Der 035-Handoff markiert `REQUIRES_REPO_SCHEMA` fuer
  `product_identifiers`, `product_media`, `packaging_versions`,
  `batch/COA`, `vision_learning_examples`.

  `[cmd]` **Duenn:** `thai_label` 2 %, GTIN/EAN fuer Medikamente 0
  (Quelle nicht offen), Supplement-Kennungen 30 von 31 unverifiziert.

## Auftrag — messen, was der Katalog traegt

**Mitbeauftragt: C-260.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

`[read]` **Beide sind aelter als der Katalogneuaufbau.** **Die
Erwartung: mindestens einer ist ueberholt** — **das war bei
zweiundzwanzig geprueften Altpunkten neunmal so.**

### 1 · C-202 — Produkte, Marken, Hersteller, Kennungen

`[cmd]` **Miss zuerst, was heute existiert.** `[cmd]` **`supplements`
traegt 412 sichtbare Substanzen** — **ob daneben Produkte, Marken oder
Kennungen stehen, ist die Frage.**

`[cmd]` **C-250 hat gemessen, dass `cost_per_serving` und
`serving_size` fehlen** — das deutet auf eine Produktebene, die es
nicht gibt.

`[read]` **Und die Vorfrage ist eine Produktfrage, keine Datenfrage:**
**ist ein Praeparat eine Substanz oder ein Produkt?** `[cmd]` **Der
Nutzer nimmt ein Produkt mit einer Dosierung, der Katalog fuehrt
Substanzen.** **Wenn das der Befund ist: sagen, nicht bauen.**

### 2 · C-260 — die Arbeitsberichte sind nicht in die Daten zurueckgeflossen

`[read]` **Miss, welche Berichte gemeint sind und was daraus fehlt.**
`[cmd]` **Kimis Forschungsdaten liegen in
`docs/kimi_research/supplement_performance_database/data/`** — **im
`.gitignore`.**

`[read]` **Wenn der Rueckfluss stattgefunden hat: schliessen.**
**Wenn nicht: sagen, was fehlt und wie viel.**

### Was nicht zu tun ist

**Kein Katalogausbau.**
**Keine deutschen Namen** — die 20 aus C-352 sind der belegte Satz.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil    erledigt / gebaut / offen / ueberholt
    Produktebene           existiert sie? gemessen
    Substanz gegen Produkt als Befund benannt
    Kimi-Rueckfluss        was fehlt, wie viel

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
