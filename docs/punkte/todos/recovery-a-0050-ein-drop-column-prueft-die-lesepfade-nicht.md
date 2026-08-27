---
nr: A-50
typ: feature
modul: recovery
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: G-160
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["recovery.scores"]
  dateien: ["apps/web/src/lib/recovery/scores-read.ts", "CLAUDE.md"]
zahlen: null
---

# A-50 - Ein `DROP COLUMN` prueft die Lesepfade nicht

## Befund

(neu
  2026-08-23). Aus G-160.

  `[cmd]` **`recovery.scores.acwr_used` ist seit C-215 gedroppt und
  seit C-226 live weg** — `scores-read.ts` hat sie trotzdem weiter
  selektiert. **Sechs Treffer im committeten Stand.** Gefunden hat es
  Fable in G-160, drei Tage spaeter, beim Anbinden einer Kachel.

  `[read]` **Die Luecke ist im Ablauf des Orchestrators:** er prueft
  Pipeline-Auftraege gegen die Datenbank — Spalten da, Zeilen stabil,
  Policies gezaehlt — **aber nie gegen die Lesepfade.** Ein
  `DROP COLUMN` braucht denselben `git grep`, den ein
  Tabellenname bekommt.

  `[cmd]` **Gegenprobe ueber alle gedroppten Spalten:** `acwr_used`,
  `enhanced_mode`, `enhanced_accepted_at`, `enhanced_age_verified`.
  **Nur `acwr_used` wurde je in `apps/web` gelesen.** Ein Fall, kein
  Muster — aber einer, der unbemerkt blieb.

  **Zu bauen:** die Regel in `CLAUDE.md` und ein Schritt in jedem
  Pipeline-Auftrag — wer eine Spalte entfernt, zaehlt vorher ihre
  Leser. Besser noch: eine Gate-Pruefung, die selektierte Spalten
  gegen den Sollstand haelt.
