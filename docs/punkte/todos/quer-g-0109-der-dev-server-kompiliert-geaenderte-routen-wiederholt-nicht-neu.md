---
nr: G-109
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-100
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-109 - Der Dev-Server kompiliert geaenderte Routen wiederholt nicht neu

## Befund

(neu 2026-08-20, aus G-100 und G-101).

  `[cmd]` **Zweimal am 2026-08-20**, bei verschiedenen Routen
  (`/v2/dashboard`, `/v2/nutrition?tab=insights`). Der Watcher meldet
  nichts, die Seite liefert den alten Stand — und `pnpm --filter
  @lumeos/web build` laeuft dabei sauber durch.

  `[cmd]` **Beide Male geprueft und ausgeschlossen:** kein fremdes
  Build-Verzeichnis, `.next-gate` sauber getrennt von `.next`. **Die
  B-18-Trennung war intakt.**

  `[read]` **Ein Neustart je Vorfall behebt es** (beenden, starten,
  `.next` bleibt) — kostet aber jedes Mal Zeit und eine Ruecksprache.
  **Die Ursache ist nicht gefunden.**
