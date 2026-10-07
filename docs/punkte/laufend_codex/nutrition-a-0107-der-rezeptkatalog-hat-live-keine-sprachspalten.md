---
nr: A-107
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-10-07
agent: codex
beauftragt: 2026-10-07

braucht: [A-105]
kind_von: A-105

quellen:
  - docs/punkte/erledigt/quer-a-0105-der-live-nachzug-der-sieben-schritte.md

beruehrt:
  tabellen:
    - nutrition.recipe_curation_catalog
  dateien: []
---

# Der Rezeptkatalog hat live keine Sprachspalten

## Auftrag - Kopf

    AUFTRAG FUER Codex - A-107: C-417 live vollstaendig - die Sprachspalten
    Bereich: Live-Datenbank, nur nutrition.recipe_curation_catalog
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

## Befund

`[cmd]` Nach A-105 hat `nutrition.recipe_curation_catalog` live nur
`name_de`. In der Kette legt `488_sprachspalten` `name_en` und `name_th`
an. 488 lief live frueher schon fuer andere Tabellen - ein blindes
Wiederholen ist nicht gemeint.

## Was zu tun ist

Unter der A-105-Freigabe (C-417 ist einer der sieben Schritte, Tom 06.10.):

1. Aus `488_sprachspalten` genau den Teil fuer `recipe_curation_catalog`
   bestimmen (Spalten, Defaults, Constraints, Grants) und nennen.
2. Sicherung vorher, nur diesen Teil einspielen, `NOTIFY pgrst`,
   Nachweis gegen die Kette (Spalten und Typen gleich), Sicherung nachher.
3. Zeigen, dass alle anderen Tabellen, die 488 beruehrt, unveraendert
   sind (Vergleich vorher/nachher).

Stopp und melden bei jeder Abweichung. Kein Commit.
