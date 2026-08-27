---
nr: B-29
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: C-236
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["tools/lauf.py"]
zahlen: null
---

# B-29 - 21 Wegwerf-Datenbanken, 3,58 GB

## Befund

(neu 2026-08-23). Aus
  C-236.

  `[cmd]` **Nicht sieben, wie gemeldet, sondern einundzwanzig.** Neun
  `wegwerf_c23x` von heute (je 214–241 MB), sechs `lumeos_kette_*` vom
  16. bis 23. August, dazu `lumeos_c73_muscle_groups`, `lumeos_f07`,
  `lumeos_g05`, `wegwerf_c226_restore`.

  `[cmd]` **Allein die neun von heute sind 2,1 GB** — `c235b` bis
  `c235g` sind sechs Anlaeufe desselben Auftrags.

  `[read]` **Jeder Auftrag sagt *„Wegwerf-Datenbank, danach
  verwerfen"*, und jeder Bericht meldet sie als geloescht.** Die
  Meldung stimmt vermutlich fuer den letzten Lauf, nicht fuer die
  Zwischenlaeufe.

  **Zu bauen:** die Raeumung ans Ende des Laufs binden, statt sie zu
  melden — ein `DROP DATABASE` im Abschluss von `lauf.py` oder im
  Kettenwerkzeug. **Eine Regel, die berichtet statt erzwungen wird,
  bricht.** Dasselbe wie bei der Doppelkodierung (C-216).
