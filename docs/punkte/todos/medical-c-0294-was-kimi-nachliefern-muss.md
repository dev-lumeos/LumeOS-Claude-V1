---
nr: C-294
typ: feature
modul: medical
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-294 - was Kimi nachliefern muss

## Befund

(neu 2026-08-27,
  **erweitert nach C-293**). Eine Nachforderung, sobald Kontingent da
  ist.

  `[cmd]` **101 Wirkstoffe ohne `precautions`.** 12 standen im
  Bestand, 385 kamen von Kimi, das ergibt 393 von 498. **Vier davon
  nennt Kimi namentlich offen** — Gliclazide, Domperidone, Melatonin,
  Chlorine. **Die uebrigen 97 sind nicht begruendet leer, sondern
  nicht bearbeitet.**

  `[cmd]` **40 Wirkstoffe ohne `zu_wenig_de`, 115 ohne `mythen_de`**,
  11 davon ohne beides — zusammen 144 Zeilen mit `null_context`.

  `[read]` **Und hier liegt der Befund, der wichtiger ist als die
  Zahl:** ich hatte im Auftrag vermutet, Bedarfsmedikamente haetten
  kein *,,zu wenig"*, und die Pruefung solle das bestaetigen. **Codex
  hat geprueft, und es haelt nicht durchgaengig.**

  `[cmd]` Der Eintrag lautet deshalb `reason_status: "not_supplied"`
  mit der Begruendung *,,master_de_meds.jsonl has no missing_reason
  field; no safe clinical inference"*.

  `[read]` **Der naheliegende Weg waere gewesen, meine Vermutung als
  `BEDARFSMEDIKATION` in die Datenbank zu schreiben** — sie klingt
  plausibel, sie kam vom Orchestrator, und niemand haette es je
  gemerkt. **Das waere eine erfundene fachliche Aussage in einer
  Medikamententabelle gewesen.**

  **Zu tun:** die 101, die 40 und die 115 je als Wirkstoffliste
  ausgeben und gemeinsam nachfordern. `[read]` **Benannte Luecken
  lassen sich nachfordern, erklaerte nicht.**
