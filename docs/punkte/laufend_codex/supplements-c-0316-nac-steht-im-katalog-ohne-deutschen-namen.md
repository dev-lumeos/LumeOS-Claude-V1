---
nr: C-316
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: C-315
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-316 - NAC steht im Katalog ohne deutschen Namen

## Befund

(neu
  2026-08-27). Aus C-315.

  `[cmd]` **412 sichtbar, 411 mit Nutzertext.** Der eine ist
  `slug = nac`, id `bf39e459-7e2e-dc9c-09d5-b14c65902284`, **`name_de`
  ist NULL.**

  `[read]` **Kein Zaehlfehler, sondern eine sichtbare Luecke:** eine
  Substanz, die im Katalog erscheint und keinen Namen hat, den man
  anzeigen kann. `[read]` **Sie ist durch alle bisherigen Pruefungen
  gefallen, weil `im_katalog` sie durchlaesst und niemand auf
  `name_de IS NULL` geprueft hat.**

  `[cmd]` **Und sie versteckt sich beim Messen:** `string_agg` ueber
  `name_de` liefert bei NULL nichts — meine erste Abfrage meldete
  *keine* Substanz ohne Text, obwohl die Zaehlung 411 gegen 412 sagte.

  **Zu tun:** Namen setzen — und einen Waechter, der
  `im_katalog AND name_de IS NULL` verbietet.

## Auftrag

**Mitbeauftragt mit G-202 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
