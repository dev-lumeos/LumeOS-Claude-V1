---
nr: C-421
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: null
beruehrt:
  tabellen: [recovery.checkins]
zahlen:
  gemessen: 2026-09-07
  attrappen: 17
  vorhandene_tabellen: 3
---

# C-421 — vier Tabellen fuer die 17 Attrappen

## Befund

Aus G-365, Claude Code, 2026-09-07.

`[cmd]` **`recovery` traegt drei Tabellen:** `checkins`,
`modality_log`, `scores`.

`[cmd]` **17 Kacheln sind ehrlich als Attrappe markiert** — **kein
Leseweg, weil kein Schema.**

**Was fehlt:**

    Overtraining-Signale     acht Signale, vier Schwellen
    Protokolltabelle         Erholungsprotokolle
    Stresstabelle
    Score-Beitraege je Modul

`[cmd]` **Und `module-recovery-engine.jsx` traegt die Rechenwerke
schon** — `MODALITY_BONUS` (elf Modalitaeten),
`OVERTRAINING_SIGNALS` (vier Schwellen), `ACWR_DATA`,
`HRV_BASELINE` (`00-QUELLEN.md`).

`[read]` **Die Fachlogik ist entworfen, das Schema fehlt.**

## Zu lesen

`[cmd]` **`docs/specs/Recovery/`, 11 Dateien, 3.654 Zeilen** —
**`SPEC_06_DATABASE_SCHEMA.md` sagt vermutlich, was zu bauen ist.**

`[cmd]` **Und `00-QUELLEN.md` nennt fuenf Recovery-Mockups.**
