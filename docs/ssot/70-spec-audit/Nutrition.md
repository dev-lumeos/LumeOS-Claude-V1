# Spec-Audit: Nutrition

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Nutrition/` · **Prüftiefe:** bewusst begrenzt (grösstes Modul, BLOCKED_BY_PRODUCT_GATE) — Ordnerstruktur vollständig, INDEX-Kopf + Struktur gelesen, Zählprüfungen, Querschnitts-Greps. Kein Review der Patches/ADRs im Einzelnen.

## Dateibestand

`[cmd]` 49 Dateien in 8 Unterordnern + INDEX:
`00_decisions/` (1), `00_raw/` (1), `01_current_specs/` (10, SPEC_01–10),
`02_patches/` (13), `03_sql/` (2), `04_adrs/` (12), `05_reviews/` (4),
`06_workorder_planning/` (3).
(TODO/Auftrag sprachen von 46 Dateien — der Ist-Stand sind 49.)

## Status

`[read]` INDEX trägt als einziges Modul einen expliziten Statuskopf:
`BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY` — keine Freigabe für Import,
Migrationen oder Implementierung ohne explizites Gate-Öffnen durch Tom.

## Vollständigkeit gegen SPEC_01–SPEC_10

Vollständig (01–10 in `01_current_specs/`), dazu die reifste Governance-
Struktur des Baums: Patches als eigene Schicht, 12 ADRs (11 Final, 1 archiviert),
4 Opus-Reviews (Final: PASS), Workorder-Plan.

## Interne Widersprüche / Spannungsfelder

- `[cmd]` **Spec vs. Live-DB:** SPEC_06 enthält 21 `CREATE TABLE`; die
  Live-DB hat 11 Nutrition-Tabellen. Die Spec beschreibt den Vollausbau
  (Diary, Portionen, MealCam, Recipes, Consent …), die DB nur den
  Food-Katalog + Preferences/Curation. Kein Fehler, aber die grösste
  Soll/Ist-Schere im Baum (Detail: `40-spec-code-matrix.md`, D-12).
- `[cmd]` **Portfehler im Workorder-Plan:** `06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md`
  Z. 47 und 134 rufen `supplements:5200` — 5200 ist Training; Supplements
  ist überall sonst 5300.
- `[cmd]` `01_current_specs/SPEC_10_COMPONENTS.md` und der Phase-1-Split
  referenzieren `apps/app` — existiert nicht (`apps/web`).
- `[read]` Die 117-Nährstoff-Zahl der WebPlatform-UI-Spec kollidiert mit den
  138 `nutrient_defs`, die SPEC_06 seedet und die Live-DB enthält
  (Detail im WebPlatform-Audit).

## Tote Verweise

- Kein `CONSOLIDATED_KNOWLEDGE`-Verweis — der Nutrition-INDEX ist der
  einzige Standard-Modul-INDEX ohne diesen toten Link, und seine Links sind
  als relative Markdown-Links gesetzt. Stichprobenhaft geprüft `[cmd]`
  (Ordnerlisten decken alle INDEX-Abschnitte); Einzel-Link-Prüfung aller
  49 Dateien nicht durchgeführt `[annahme]`.

## Modulübergreifend

- `[cmd]` Port 5100 konsistent (INDEX; alle Consumer rufen `nutrition:5100`).
- `[cmd]` `packages/scoring/src/nutrition.ts` mehrfach referenziert
  (SPEC_09, ADR_WATER, Reviews) — Gerüst fehlt.
- `[read]` Next.js 15 (INDEX:223) vs. WebPlatform 14+ / real 14.

## Reifegrad

Höchster im Baum: einziges Modul mit Review-Kette, ADR-Register und
explizitem Status. **Einer Freigabe steht im Weg:** das Product Gate selbst
(Toms Entscheidung), der 5200/5300-Portfehler im WO-Plan, `apps/app`-Referenzen,
und die Rückführung der Live-DB in die Migrationspipeline (D-12), bevor
Spec-Slices weitergebaut werden.
