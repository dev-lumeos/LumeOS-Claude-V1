# Spec-Audit: Admin

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Admin/` · **Prüftiefe:** Dateibestand vollständig, INDEX + Köpfe gelesen, Querschnitts-Greps; kein Zeilen-Review der Einzelspecs.

## Dateibestand

`[cmd]` 5 Dateien: `INDEX.md`, `SPEC_01_UI_DESIGN.md`, `13_MODULE_ADMIN.md`,
`SPEC-ADMIN-BACKEND-v1.md`, `admin-panel-spec.md`.

## Vollständigkeit gegen SPEC_01–SPEC_10

Folgt dem Schema **nicht**. Nur `SPEC_01_UI_DESIGN.md` trägt das Namensmuster;
Contract, Entities, DB-Schema, API, Import, Scoring, Components fehlen als
eigene Specs. Drei Alt-Dokumente (`13_MODULE_ADMIN.md`, `SPEC-ADMIN-BACKEND-v1.md`,
`admin-panel-spec.md`) decken Teile davon ab, ohne erkennbare Rangfolge.

## Interne Widersprüche

- `[read]` **Framework:** `INDEX.md:30` sagt „Next.js 14+", `13_MODULE_ADMIN.md:33`
  und `SPEC-ADMIN-BACKEND-v1.md:40` sagen „Next.js 15 App Router".
- `[read]` **Implementierungsstand:** `13_MODULE_ADMIN.md:271` behauptet
  „Admin API (Port 4100) Backend ✅ Komplett" — im Repo existiert
  `services/admin-api` nur als Gerüst (`[cmd]` Verzeichnis vorhanden, Inhalt
  nicht auditiert; laut `docs/ssot/40-spec-code-matrix.md` Vorgängerrepo-Claim).
- `[read]` `SPEC-ADMIN-BACKEND-v1.md:67`: „Mini-PC hat packages/contracts,
  packages/rules-engine, packages/scoring bereits mit Tests gebaut" —
  `[cmd]` `packages/` enthält weder `rules-engine` noch `scoring`.

## Tote Verweise

- `[read]` `INDEX.md` listet als einzige Datei `SPEC_01_UI_DESIGN.md` — die
  übrigen 3 Spec-Dokumente des Ordners sind unindiziert (kein toter Link,
  aber ein blinder Index).

## Modulübergreifend

- `[cmd]` **Port 4100** (`admin-panel-spec.md:6`, `13_MODULE_ADMIN.md:232`)
  fällt aus dem 5x00-Schema aller anderen Service-APIs (5100–5900).
- `[cmd]` Gerüst `apps/admin` existiert.

## Reifegrad

Niedrig — Sammelordner aus drei Generationen (Panel-Spec, Backend-v1,
Modul-13-Doc) plus neuer UI-Spec, ohne deklarierte SSOT-Datei.
**Einer Freigabe steht im Weg:** Entscheidung, welches der 3 Alt-Dokumente
gilt; Schema-Angleichung (SPEC_01–10 oder bewusst abweichend); Klärung
Port 4100 vs. 5x00; Korrektur der „Komplett"-Behauptungen aus dem Vorgängerrepo.
