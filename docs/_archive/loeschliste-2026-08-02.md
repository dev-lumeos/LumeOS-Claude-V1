# Löschliste — untracked Ballast (A-05)

**Stand:** 2026-08-02 · **Ankerhash:** b0441a9
**Regel:** Jeder Pfad wurde inhaltlich geprüft (`[cmd]`), nicht dem Namen nach.
**Ausführung:** `loeschliste-2026-08-02.ps1` — führt Tom aus. In dieser
Sitzung wurde nichts gelöscht (`rm` ist per Permission-Schicht geblockt;
das gilt auch für das eigentlich freigegebene `supabase/snippets/`).

**Voraussetzung erfüllt:** Der Reproduzierbarkeitsnachweis aus dem
versionierten Archiv ist grün (`docs/ssot/33-pipeline-verifikation.md`,
dritter Lauf) — `tmp/` darf damit auf die Liste.

---

## Empfehlung LÖSCHEN

| Pfad | Grösse | Inhalt (geprüft) | Begründung |
|---|---|---|---|
| `tmp/` | 31 MB | `nutrition/p1-005-bls-local-import/` (CSV-Quelldaten), `governance-ui-browser-smoke/`, `governance-ui-dev/`, `p1-005-nutrient-defs-local-seed.sql` | CSVs sind byte-identisch in `supabase/_data/…zip` versioniert und der Kettenlauf daraus verifiziert; Governance-UI ist tot; die Seed-Datei ist eine **ältere Variante** (184 Zeilen) des verifizierten `_pipeline/015` (209 Zeilen) — nicht Teil der Kette |
| `temp/antigravity-awesome-skills-main/` | Teil der 16,5 GB | Heruntergeladenes Skills-Repo | Jederzeit neu ladbar, kein LumeOS-Inhalt |
| `_tmp_inventory/` | 26 KB | 5 Inventar-CSVs (nutrition_specs, system_workorders) | Einmal-Inventur, durch `docs/ssot/` ersetzt |
| `backup_system.zip` | 1,4 MB | Snapshot `system/` (496 Dateien, Mai) | `system/` liegt tracked im Repo; Zip ist redundanter Zwischenstand |
| `services.zip` | 84 KB | Snapshot `services/` (April) | dito |
| `system.zip` | 60 KB | Snapshot `system/` (180 Dateien, April) | dito |
| `nul` | 99 B | `[cmd]` Windows-Fehlermeldung „FEHLER: Argument/Option ungültig - F:/" | Redirektions-Artefakt |
| `.codex-governance-ui.log` | 4 KB | Log der toten Governance-UI | Governance tot |
| `supabase/snippets/` | <10 KB | 3 Studio-Snippets | `[cmd]` byte-identische Kopien in `supabase/_snippets/` (cmp je Datei); Löschung von Tom ausdrücklich freigegeben (D-03) |
| `.wayland-core/` | 2,5 MB | `memory/`, `skills/` eines nicht mehr referenzierten Agent-Tools | `[annahme]` Tool ausser Betrieb — nirgends in CLAUDE.md/Settings referenziert; im Zweifel vorher kurz öffnen |
| `.wayland/` | 9 KB | `CONTEXT.md`, `decisions.md`, `rules.md` desselben Tools | dito |

## Empfehlung BEHALTEN

| Pfad | Grösse | Inhalt (geprüft) | Begründung |
|---|---|---|---|
| **`temp/lumeosold/`** | Grossteil der 16,5 GB (inkl. `.git`, `.next`, `node_modules`-Caches) | **Vollständige Arbeitskopie des Vorgängerrepos** — darin `backups/` und `recovery/` (identische MD5): `lumeos_prod_20260305_184212.sql` (Schema, 95 Tabellen) + `lumeos_prod_data_…` (11,5 MB Daten) | `[cmd]` Der Daten-Dump enthält `public.exercises` (alle Medien-Spalten), `exercise_muscles`, `muscle_groups`, `equipment`, `storage.buckets`/`objects` — ein **Produktions-Schnappschuss der LumeOS-V2-Instanz vom 2026-03-05**. Das ist exakt das Material für Sektion E (E-05 Übernahmekandidaten) und von der Aufbaukette **nicht** abgedeckt. Vor jeder Löschung mindestens `backups/` an einen versionierten Ort retten — Entscheidung gehört zu Sektion E |
| `.ijfw/` | 7,1 MB | Plugin-State (index, logs, memory, metrics) | An B-10 gekoppelt: solange das ijfw-Plugin aktiv ist, wird der Ordner neu erzeugt; erst nach der B-10-Entscheidung löschen |
| `ijfw/` | ~0 (leere Ordner) | `dump/`, `memory/`, `sessions/`, `wiki/` | dito |

---

## Kurzfassung

Sofort löschbar: `tmp/`, `temp/antigravity-awesome-skills-main/`,
`_tmp_inventory/`, 3 Zips, `nul`, `.codex-governance-ui.log`,
`supabase/snippets/`, `.wayland-core/`, `.wayland/`.
**Nicht löschen:** `temp/lumeosold/` (LumeOS-V2-Produktionsdump → Sektion E),
`.ijfw/` + `ijfw/` (erst nach B-10).
