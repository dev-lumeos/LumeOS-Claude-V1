---
nr: C-562
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-07

braucht: []
kind_von: C-522

quellen:
  - docs/punkte/erledigt/quer-c-0522-allergiesuche-kennt-nur-tagnamen.md

beruehrt:
  tabellen:
    - nutrition.tag_definitions
  dateien: []
---

# Erdnuss ist keine Nuss

## Befund

`[read]` Codex, C-522 (07.10.): live tragen alle zehn Foods mit ,Erdnuss" im
Namen das Tag `contains_nuts`, und die Allergiesuche schlaegt bei ,erdnuss"
`contains_nuts` vor. In der EU-Allergenliste (VO 1169/2011, Anhang II) sind
Erdnuesse und Schalenfruechte getrennte Kategorien - wer nur auf Erdnuss
allergisch ist, bekommt falsch ausgeschlossene Lebensmittel, und umgekehrt.
Dazu treffen ,laktosefrei", ,milchfrei", ,nussfrei", ,sojafrei" das
jeweilige ,enthaelt"-Tag.

## Was zu tun ist

Erdnuss als eigenes Ausschluss-Tag nach EU-Anhang II, Zuordnung der Foods
pruefen; Verneinungen (,-frei") treffen nicht das ,enthaelt"-Tag. Kette,
dann live nach Freigabe.
