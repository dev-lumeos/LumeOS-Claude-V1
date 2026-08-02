# Spec-Audit: Medical

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Medical/` · **Prüftiefe:** Dateibestand vollständig, INDEX vollständig gelesen, Tabellen/Entities einzeln aufgelistet, Querschnitts-Greps.

## Dateibestand

`[cmd]` 11 Dateien: `INDEX.md` + `SPEC_01` bis `SPEC_10`
(Slot 05 = `BIOMARKER_CATALOG`). **Kein SPEC_11** — konsistent, da die
Medical-UI in `WebPlatform/SPEC_09_MEDICAL_UI.md` liegt.

## Vollständigkeit gegen SPEC_01–SPEC_10

Vollständig (01–10).

## Interne Widersprüche — härtester Befund des Audits

`[cmd]` **SPEC_02 deklariert 10 Entities, SPEC_06 definiert nur 8 Tabellen.**
Es fehlen `CREATE TABLE` für die Entities **#9 UserMedicalInsight** und
**#10 UserHealthReport** (SPEC_02 Z. 243, 264). Vorhandene 8:
`biomarkers`, `biomarker_reference_ranges`, `lab_reports`,
`user_biomarker_results`, `user_health_metrics`, `user_symptoms`,
`user_medications`, `medical_alerts`.
`[read]` Der eigene INDEX (Z. 16) behauptet zusätzlich „10 Tabellen" — falsch.

## Tote Verweise

- `[read]` `INDEX.md:10` referenziert `CONSOLIDATED_KNOWLEDGE.md`
  („13 Alt-Dokumente") — `[cmd]` existiert nicht.

## Modulübergreifend

- `[cmd]` Port 5800 konsistent (INDEX, SPEC_01, SPEC_07; Consumer nennen
  `medical:5800`).
- `[cmd]` `packages/scoring/src/medical.ts` referenziert — Gerüst fehlt.
- `[read]` Next.js 15 (INDEX:96) vs. WebPlatform 14+.
- `[cmd]` Gerüst `services/medical-api` existiert.
- Regel-Hinweis: `.claude/rules/database.md` verlangt für Medical-Daten
  security-specialist-Review — für jede spätere Umsetzung relevant.

## Reifegrad

Inhaltlich weit (Safety Rules, LOINC, Dual-Range, OCR-Flow), aber mit dem
einzigen nachgewiesenen Entity↔Schema-Bruch des Audits.
**Einer Freigabe steht im Weg:** die 2 fehlenden Tabellen definieren oder
die 2 Entities streichen; INDEX-Zahl korrigieren; toten CONSOLIDATED-Verweis
entfernen.
