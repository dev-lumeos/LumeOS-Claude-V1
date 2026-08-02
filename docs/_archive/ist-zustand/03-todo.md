# Laufende Todo-Liste – LumeOS Web

**Stand:** 2026-07-30 · **Quelle:** Bestandsaufnahme `00-overview.md`, `01-nutrition.md`, `02-nutrition-spec-code-abgleich.md`
**Konvention:** `[ ]` offen · `[~]` in Arbeit · `[x]` erledigt · Blocker kursiv

## Aktiv geplant

- [ ] **WP-01: Preferences-Schreibpfad** (Nutrition)
  1. [ ] Migration `supabase/migrations/…_nutrition_preferences.sql` mit `nutrition.food_preferences` (+ `food_preference_items`) – *blockiert durch ADR-002 (Tabellendesign)*
  2. [ ] Fachlogik `src/lib/nutrition/preferences-write.ts` (setFavorite / setExclusion / setPortion / setPriority)
  3. [ ] `preference-search-preview.ts` liest echte DB-Preferences statt nur Tag-Regeln
  4. [ ] API `POST/DELETE /api/nutrition/preferences` (Next.js-Route, Validierung: `food_id` existiert, `portion > 0`)
  5. [ ] UI `foods/page.tsx`: Favorit/Ausschluss-Toggles + Revalidate
  6. [ ] Unit-Tests (Muster: 12 vorhandene Nutrition-Tests)
  7. [ ] Abnahme: Favorit → Suche gewichtet; Ausschluss → Treffer weg; Zustand überlebt Container-Neustart

## Danach (Reihenfolge-Empfehlung)

- [ ] **WP-02: Diary-Verdrahtung** – `db/schema/nutrition.sql`-Entwurf an Live-Schema anschließen oder verwerfen; *blockiert durch ADR-003 (Modellkonflikt EAV vs. flach)*
- [ ] **WP-03:** Daily Summary (View/Tabelle) – hängt an WP-02
- [ ] **WP-04:** Water Tracking (`water_logs` fehlt komplett)
- [ ] **WP-05:** Erstes Mock-Modul echt machen (Kandidat: Goals, Spec liegt bereit)

## Klärungsbedarf / Hygiene

- [ ] Quelle der Curation-Tabellen finden (`nutrition.food_curation_candidates/decisions` werden vom Code genutzt, sind aber in keiner Migration) – Nachweis offen
- [ ] Inhalt der Slice-Migrationen `20260513_001/002`, `20260514_001` dokumentieren (enthalten keine CREATE TABLE)
- [ ] `supabase/snippets/` (3 unbenannte SQL-Dateien) einordnen oder löschen
- [ ] `services/` und `packages/` sind in `pnpm-workspace.yaml:2-5` deklariert, aber leer – füllen oder Deklaration entfernen
- [ ] E2E-Tests: `playwright.config.ts` existiert, aber kein Testverzeichnis – Basis-Suite anlegen
- [ ] Verifikation nachholen: `pnpm build` + `pnpm test` laufen lassen, sobald die Shell in dieser Umgebung wieder antwortet (derzeit Timeout bei jedem Kommando)
- [ ] README „Phase 1B"-Status nach WP-01 aktualisieren
- [ ] Remote-Runtime für Nutrition (README: „absent") – Zielbild klären, hängt an ADR-001/ADR-004

## Erledigt

- [x] Bestandsaufnahme Repo + `apps/web` (`00-overview.md` v0.4)
- [x] Modulakte Nutrition (`01-nutrition.md`)
- [x] Spec↔Code-Abgleich Nutrition (`02-nutrition-spec-code-abgleich.md` v0.2)
- [x] Todo- und ADR-Liste angelegt (diese Datei, `04-adr-liste.md`)
