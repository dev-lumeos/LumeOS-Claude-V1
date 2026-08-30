---
nr: C-160
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: C-157
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-160 - Der Bewertungshorizont je Naehrstoff ist leer

## Befund

(neu
  2026-08-20). **Fuer den Rechercheweg.** Rest aus C-157.

  `[cmd]` **Die Felder stehen:** `assessment_horizon_days`, `_source`,
  `_notes` an `nutrient_defs`. **138 Zeilen, alle leer.**

  `[read]` **Was gebraucht wird, mit Quelle:**

  | | |
  |---|---|
  | Vitamin D, B12, Eisen, Folat | **Speicher — Wochen bis Monate** |
  | Vitamin C, B1, B2 | wasserloeslich — **Tage** |
  | Natrium, Kalium, Wasser | tagesaktuell |

  `[cmd]` **EFSA und DGE unterscheiden Tagesbedarf von Zufuhr ueber die
  Zeit** — das ist eine Recherche, keine Erfindung.

  `[read]` **Und die Wirkung ist konkret:** Die Anzeige zeigt dann von
  selbst das passende Fenster — **Vitamin D ueber 90 Tage, Natrium ueber
  einen.**

## Auftrag — drei Altlasten pruefen

**Mitbeauftragt: C-08, A-37.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

`[read]` **Alle drei sind aelter als der Katalogneuaufbau.** **Die
Erwartung ist, dass mindestens einer sich als ueberholt erweist** —
**und das ist ein Ergebnis, kein halber Auftrag.** `[cmd]` **Am
30.08. waren es sechs von sechzehn.**

### 1 · C-160 — der Bewertungshorizont je Naehrstoff ist leer

`[cmd]` **Miss zuerst, ob es die Spalte ueberhaupt gibt** — sie war
in meiner Pruefung nicht auffindbar.

`[read]` **Wenn nicht: sag, was der Punkt gemeint hat, und schliess
ihn.** `[read]` **Wenn doch: was traegt sie heute, und was fehlt?**

### 2 · C-08 — `services/nutrition-api`

`[read]` **Der Punkt sagt, der ADR gelte.** `[cmd]` **Miss, ob der
Dienst existiert** — und ob irgendetwas ihn ruft.

`[read]` **A-59 gilt auch fuer Dienste:** was keinen Aufrufer hat,
wird beim naechsten Auftrag fuer gebaut gehalten.

### 3 · A-37 — zwoelf ADRs in `docs/specs/Nutrition/04_adrs/`

`[cmd]` **`docs/specs/` wird prueferisch gelesen, nicht als Archiv**
(CLAUDE.md).

`[read]` **Miss, welche der zwoelf noch gelten und welche durch
`docs/entscheidungen/E-xx` abgeloest sind.** `[cmd]` **Seit dem 29.08.
gibt es E-25 bis E-36** — **einige davon koennten dieselbe Frage
zweimal beantworten.**

`[read]` **Zwei ADRs, die sich widersprechen, sind schlimmer als
keiner.** **Melden, welche das sind — nicht selbst entscheiden.**

### Was nicht zu tun ist

**Keinen ADR aendern oder loeschen** — das ist Toms Bereich.
**Keine deutschen Namen setzen** — C-352 wartet auf eine
Entscheidung.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil     erledigt / gebaut / offen / ueberholt
    Bewertungshorizont      Spalte da? was traegt sie?
    nutrition-api           existiert er, ruft ihn jemand?
    zwoelf ADRs             je gueltig / abgeloest / widerspruechlich
    Widersprueche           benannt, nicht aufgeloest

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
