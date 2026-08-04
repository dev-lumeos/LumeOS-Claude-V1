# Sitzung — SSOT-Nachzug nach der Governance-Archivierung

**Datum der Durchführung:** 2026-08-04 · **Ankerhash bei Start:** 71ccf52 (verifiziert, HEAD)
**Auftrag:** SSOT auf den Stand nach der Archivierung bringen (10/50/20),
zweite Governance-Kopie (Onyx-Seed) stilllegen, TODO aktualisieren.
Grenzen eingehalten: keine Commits, nichts gelöscht, `supabase/`, `backup/`,
`apps/`, `packages/`, `services/`, `docs/spezifikation/` nicht angefasst.

---

## Aufgabe 1 — SSOT aktualisiert (alle Zahlen selbst neu erhoben)

### `docs/ssot/10-workspace.md` — vollständig neu geschrieben

`[cmd]` 2026-08-04 erhoben: `pnpm-workspace.yaml` deklariert nur noch
`apps/*`, `services/*`, `packages/*` (der `tools`-Eintrag fiel mit Commit
71ccf52); **31 Verzeichnisse** unter den Globs, **4 mit package.json**
(web 51 TS, nutrition-api 4, shared 3, types 3), **27 Gerüste**
(5 apps, 12 services, 10 packages). `pnpm typecheck`: Exit 0,
„Packages in scope: 4", 2 Tasks (shared/types haben kein typecheck-Script —
war schon immer so). `apps/web` hat jetzt genau **einen** internen Import:
`nutrition-db.ts:11` → `@lumeos/shared`. Root-Inventar per `git ls-files`
neu gezählt (u. a. `_archive/` 477 Dateien / 7 MB, `docs/` 1.538 / 74 MB);
`pnpm-lock.yaml` trägt noch 27 Erwähnungen archivierter Packages (Staleness,
bereinigt das nächste `pnpm install`). Der alte Stand (59/17/42) steht als
Abschnitt „Was sich am 2026-08-03 geändert hat" in der Datei.

### `docs/ssot/50-governance-rest.md` — umgeschrieben

Beschreibt jetzt die Archivierung statt eines Clusters im Workspace:
was wohin verschoben wurde (Tabelle, 476 R + Onyx-Seed), der Dispatch-Vorfall
als Auslöser, und was physisch bleibt — die vier Tabellen in `public`
(Tom parallel dran, `[cmd]` untracked `backup/schema/2026-08-03_public_vor_drop.sql`
liegt bereit), Altlast-Doku/Configs, `infra/`-Anteile, Lockfile-Staleness,
Dashboard-Prosa. Festgehalten: der Dispatch-**Auslöser** ist weiterhin
ungeklärt — Angriffsfläche entfernt, Ursache nicht benannt.

### `docs/ssot/20-apps-web-ist.md` — korrigiert, Zahlen neu erhoben

`[cmd]` 2026-08-04: **14 Seiten** (vorher 24), **6 API-Routen** (vorher 8),
1 Layout; `apps/web/e2e/` leer; `src/lib` = **11 Dateien**, alle
`lib/nutrition` (`lib/governance` existiert nicht mehr); **11 Testdateien**
(vorher 12, der Governance-Test ist im Archiv); kein `child_process`, kein
`docker exec`, kein Containername (nur 2 Kommentar-Erwähnungen in
`nutrition-db.ts`). DB-Mechanik-Abschnitt neu: supabase-js über
`@lumeos/shared`, fünf Abfragen als `nutrition`-Funktionen per rpc(),
Service-Client als dokumentierter Interimszustand. Der frühere Befund „beide
Supabase-Dependencies tot" ist als überholt markiert. Die
`runtime='nodejs'`-Begründung wurde von `child_process` auf den serverseitigen
Service-Client umgestellt.

---

## Aufgabe 2 — Onyx-Seed stillgelegt

`[cmd]` Befund vor dem Verschieben: `tools/onyx/seed/lumeos-governance-current-truth/`
= **108 Dateien** (51 md, 32 txt, 24 json — nicht ~150; die Zahl im Auftrag war
höher als der Messwert), dazu als Geschwister `CURRENT_TRUTH_CLEANUP_REPORT.md`
und `lumeos-governance-current-truth.zip`. `[read]` `SEED_MANIFEST.md`:
Seed für das Onyx-Document-Set `LUMEOS_GOVERNANCE_CURRENT_TRUTH`, erstellt
**2026-04-30** — „current-truth" beschreibt den Stand vor der Umstellung.

- **Nur 2 der 108 Dateien waren getrackt** (`.gitignore` ignoriert
  `tools/onyx/seed/` seit jeher). `git mv` des Ordners + des Cleanup-Reports
  nach `_archive/governance/onyx-seed/` → 2 R-Einträge; die untracked Dateien
  sind physisch mitgewandert.
- `.gitignore` ergänzt um `_archive/governance/onyx-seed/`, damit die
  bewusst untrackten Seed-Dateien es bleiben (alte Regel bleibt für das Zip).
- **Rest:** das Zip liegt weiter unter `tools/onyx/seed/` — untracked,
  `git mv` kann es nicht bewegen; Behandlung über die Löschliste.
- `[cmd]` **Keine Verweise auf den Seed-Pfad**: weder `tools/onyx/install.ps1`
  noch `install.original.ps1` erwähnen `seed`/`current-truth`; eine
  docker-compose existiert unter `tools/onyx/` nicht. Nichts anzupassen,
  keine offene Frage.
- Vermerk im Archiv-README ergänzt (eigener Abschnitt + Tabellenzeile).

---

## Aufgabe 3 — TODO.md (achte Aktualisierung)

Datei vollständig eingelesen, gezielt geändert, danach `[cmd]` ID-Prüfung:
A-01..08, B-01..11, C-01..11, D-01..18, E-01..10 vollständig, **keine
Duplikate**.

- **A-07 → [x]:** Entscheidung getroffen — `[cmd]`
  `docs/spezifikation/90-entscheidungen/ADR-0001-datenzugriff.md` existiert
  (Tom, parallel; nur Existenz geprüft, nicht gelesen); direkter Zugriff mit
  M1 Teil C real, Neun-Services-Altbestand archiviert.
- **B-05 → [x]:** gegenstandslos — Hooks waren ausgehängt, Schreibziel
  `system/state/` existiert nicht mehr; Dateien gehen mit der
  `.claude`-Altlast-Folgerunde.
- **D-10 → [x]:** hinfällig — beide Services im Archiv (der im Punkt
  vorgesehene Fall).
- **D-04 angepasst:** `e2e/` leer, keine Playwright-Config mehr im Repo,
  `@playwright/test` noch in Root-devDependencies; Kern (Produkt-E2E) offen.
- **C-08 angepasst:** nutrition-api ist einer von vier lebenden Packages;
  Docker-SQL-Formulierung ersetzt; Verweis auf ADR-0001-Rahmen.
- **D-18 neu ([~], Tom parallel):** die vier Control-Plane-Tabellen in
  `public` entfernen; Sicherungsdatei liegt bereit.
- Kleine Faktennoten ohne Auftrag, der Genauigkeit halber: B-06 (PowerShell
  steht seit 2026-08-04 auf `ask`), C-09 (jetzt 11 statt 12 Testdateien).
- **Nicht angefasst,** obwohl inhaltlich überholt: der Kritische-Pfad-Kopf
  (M1 nennt noch `docker exec`/„keine Grants") und D-08 (durch M1 Teil C
  faktisch beantwortet) — Statusänderung dort ist Toms Entscheidung, nicht
  Teil dieses Auftrags.

---

## Geänderte Dateien dieser Sitzung

- `docs/ssot/10-workspace.md`, `docs/ssot/50-governance-rest.md`,
  `docs/ssot/20-apps-web-ist.md` (Vollrewrites)
- `docs/todo/TODO.md` (achte Aktualisierung)
- `_archive/governance/README.md` (Onyx-Seed-Vermerk)
- `.gitignore` (+1 Regel `_archive/governance/onyx-seed/`)
- `git mv`: `tools/onyx/seed/lumeos-governance-current-truth/` und
  `CURRENT_TRUTH_CLEANUP_REPORT.md` → `_archive/governance/onyx-seed/`
  (2 R-Einträge, 0 D; 106 untracked Dateien physisch mitverschoben)

Kein Commit — der Index enthält die 2 Umbenennungen, Commit ist Toms Schritt.
