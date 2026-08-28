---
nr: C-329
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-215
entscheidung: null
beruehrt:
  tabellen: [supplements.rule_catalog]
zahlen:
  gemessen: 2026-08-28
  auswertbar_laut_katalog: 44
  teilweise: 14
  nicht: 6
---

# C-329 — `input_coverage_status` ist eine Selbsteinschaetzung, keine Zusage

## Befund

Aus G-215, Claude Code, 2026-08-28.

`[cmd]` **`rule_catalog.input_coverage_status` fuehrt 44 Regeln als
auswertbar, 14 als teilweise, 6 als nicht.**

`[cmd]` **`wr_drug_bleeding_stack` steht dort als auswertbar — und
ist es nachweislich nicht.** Der Grund ist C-328: der Operator
`count_risk_flag_gte` zaehlt Schluessel statt Werte, die Regel kann
nie zutreffen.

`[read]` **Das Feld beschreibt, ob die Eingaben da sind — nicht, ob
die Auswertung funktioniert.** Zwei verschiedene Aussagen unter einem
Namen.

`[read]` **Und es ist die dritte Zahl fuer dieselbe Frage:**

    input_coverage_status      44 auswertbar   (Katalog-Selbstaussage)
    evaluation_state           41 auswertbar   (Laufzeit, nach C-313)
    unsupported_operator       23 nicht        (Laufzeit)

`[read]` **Wer den Katalog fragt, bekommt eine andere Antwort als wer
die Engine fragt.** **Und keiner der beiden weiss, ob eine Regel
richtig rechnet** — das hat erst der Durchstich gezeigt.

## Was zu tun ist

**Entweder das Feld gegen die Laufzeit pruefen und rot werden, wenn
es abweicht** — oder es als das benennen, was es ist.

`[read]` **Ein Feld, das *auswertbar* sagt und nicht auswertbar
meint, ist schlimmer als kein Feld:** es beantwortet die Frage, die
man sonst gestellt haette.
