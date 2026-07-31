# ADR-Liste – LumeOS Web

**Stand:** 2026-07-30 · **Status-Konvention:** `entschieden` · `vorläufig` (mündlich/implizit, ADR-Text fehlt) · `offen`
**Hinweis:** Modul-spezifische ADRs leben in `docs/specs/<Modul>/` (z. B. `Nutrition/01_current_specs/ADRs/`). Diese Liste ist der repo-weite Index; bei Bedarf werden Einträge als vollwertige ADR-Dateien ausgelagert.

## Offen

| # | Entscheidung | Optionen | Empfehlung | Blockiert |
|---|---|---|---|---|
| ADR-002 | Preferences-Tabellendesign | SPEC_06-Set-Design (`food_preferences` + `food_preference_items`) vs. schlanke Single-Row-Tabelle | SPEC_06-Design, damit Spec und Code konvergieren | WP-01 Schritt 1 |
| ADR-003 | Diary-Nährstoffmodell | EAV anschließen (`meal_items` frieren Nährstoffe ein, wie SPEC_06) vs. flacher Entwurf aus `db/schema/nutrition.sql` | EAV; flachen Entwurf verwerfen oder als Remote-Variante neu ableiten | WP-02 |
| ADR-004 | DB-Zugriffspattern | Direktes SQL gegen lokalen Docker-Container (Ist) vs. `@supabase/supabase-js` (deklariert, ungenutzt; Diary-Entwurf hat RLS + `auth.uid()`) | Nach ADR-001-Umsetzung festlegen; kurzfristig: Ist-Pattern beibehalten | Remote-Zielbild, WP-02 |

## Vorläufig entschieden (ADR-Text nachziehen)

| # | Entscheidung | Inhalt | Nachzuziehen |
|---|---|---|---|
| ADR-001 | Runtime-Architektur Nutrition | Next.js-In-App (API-Routen) als Zielbild; eigenständiger Service auf Port 5100 (SPEC_07) vorerst nicht bauen | SPEC_07 und SPEC_06 an Realität angleichen; ADR-Datei in `docs/specs/Nutrition/01_current_specs/ADRs/` |

## Entschieden

| # | Entscheidung | Inhalt | Quelle |
|---|---|---|---|
| ADR-005 | Datenquelle BLS-only | Nur BLS 4.0 als Nährwertquelle | bereits vorhanden: `docs/specs/Nutrition/01_current_specs/ADRs/ADR_BLS_ONLY.md` |
| ADR-006 | Scope der Bestandsaufnahme | Governance-Code und -Daten (`src/app/governance`, `src/lib/governance`, `system/`, Control-Plane-Migrationen) ausgenommen | Nutzer-Vorgabe, 2026-07-30 |
| ADR-007 | Ablage der Bestandsaufnahme | Protokolle im Repo unter `docs/ist-zustand/`; Wayland-Memory enthält nur Verweis | Nutzer-Entscheid, 2026-07-30 |

## Verworfen / nicht mehr relevant

| # | Frage | Auflösung |
|---|---|---|
| – | EAV-Nährstoffmodell neu einführen? | Entfällt: EAV ist bereits im Live-Schema (`supabase/migrations/20240522_002:13-16`). Nur noch Diary-Anschluss offen → ADR-003 |
