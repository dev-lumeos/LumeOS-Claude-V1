# Spec ↔ Code Matrix — je Modul: was spezifiziert, was gebaut, was fehlt

**Stand:** 2026-08-01
**Methode:** `[cmd]` Dateizählung je Spec-Ordner, ADR-/Review-Listings, Greps
auf tote Verweise; `[read]` Nutrition-INDEX-Kopf, Opus-Final-Review, Goals
README/OPEN_ITEMS, `docs/ist-zustand/02-nutrition-spec-code-abgleich.md`
vollständig. Code-Stand aus `20-apps-web-ist.md` (dort belegt).
**Diese Datei beantwortet: was ist als Nächstes zu bauen.**

---

## Gesamtmatrix

`[cmd]` Dateizahlen 2026-08-01. „Code" bezieht sich auf dieses Repo, nicht auf
die Vorgänger-Codebasis, die manche Specs beschreiben.

| Modul (Spec-Ordner) | Spec-Tiefe | Code in diesem Repo | Delta in einem Satz |
|---|---|---|---|
| **Nutrition** (49 Dateien) | ★★★★★ einzige mit ADRs (12), Patches, 4 Opus-Reviews, SQL, WO-Planung | 3 echte Read-only-Seiten + Such-/Curation-Lib; EAV-Schema als Migration | Schreibpfad fehlt komplett (Preferences, Diary, Water); Spec-Status blockiert Ausführung |
| **Training** (11) | ★★★★ SPEC_01–10 vollständig | `[cmd]` Placeholder-Seite, leeres Service-Gerüst | alles |
| **Recovery** (11) | ★★★★ SPEC_01–10 | Placeholder, leeres Gerüst | alles |
| **Supplements** (11) | ★★★★ SPEC_01–10 | Placeholder, leeres Gerüst | alles |
| **Medical** (11) | ★★★★ SPEC_01–10 (inkl. Biomarker-Katalog) | Mock-Seite, leeres Gerüst | alles; Security-Review-Pflicht beachten |
| **BuddyandAICoach** (12) | ★★★★ SPEC_01–11 | nichts (kein `apps/buddy`-Code) | alles — und Buddy ist laut Vision das Kernprodukt |
| **HumanCoach** (12) | ★★★★ SPEC_01–11 | `/coach` fällt auf Settings-Platzhalter zurück | alles |
| **Marketplace** (12) | ★★★★ SPEC_01–11 (Wallet-Economics) | nichts, nicht mal App-Gerüst (`apps/marketplace` fehlt) | alles + Gerüst-Frage |
| **Goals** (10) | ★★★ eigenes Namensschema, kein SPEC_0x | Mock-Seite, leeres Gerüst | alles; 2 bekannte Spec-Bugs (unten) |
| **WebPlatform** (11) | ★★★ 10 UI-Specs, orthogonal | Shell steht (3-Spalten, Routen), aber 10 von 13 Stack-Positionen fehlen | Stack-Lücke (C-01), alle Modul-UIs |
| **Admin** (5) | ★★ uneinheitlich benannt | Governance-Konsole existiert (anderer Scope), sonst nichts | Spec beschreibt Vorgänger-Code („Backend complete" ≠ dieses Repo) |
| **Core** (3) | ★ nur 3 ADRs (Wallet, Onboarding, Subscription-Gates), kein INDEX | nichts | Grundsatzfragen, kein Bauplan |
| **Dashboard** (1) | ✗ `dashmod.md` = `[read]` Checkbox-Liste ohne Status/Datum | Mock-Seite | echte Spec liegt in `WebPlatform/SPEC_03` |

---

## Nutrition — das einzige teilgebaute Modul

**Spec-Status zuerst:** `[read]` `Nutrition/INDEX.md` Kopf:
„STATUS: BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY … does not authorize BLS
import, Supabase commands, migrations, Nutrition implementation … unless Tom
explicitly opens a specific product gate." **Jede Nutrition-Implementierung
braucht also zuerst ein von Tom geöffnetes Product Gate.**

- `[cmd]` `04_adrs/`: exakt 12 ADRs (BLS_ONLY, MEALCAM_V1, MEALCAM_CONSENT,
  PREFERENCES_V1, CUSTOM_FOODS_V1, WATER_TOTAL_HYDRATION, RECIPES_SCHEMA_ONLY,
  GHOST_ENTRY_RECIPE, RECIPE_SOURCE_BUDDY, COACH_PERMISSIONS_V1,
  SUPPLEMENTS_API_BOUNDARY, IMPROVEMENTS_PACKAGE).
- `[read]` Finales Opus-Review: Verdict **PASS_WITH_FIXES** — nicht PASS;
  offen bleiben zwei externe Punkte, die auch `[read]` `INDEX.md:182–183` als
  „Vor Implementierung" führt: MealCam-Vision-Provider entscheiden,
  `nutrient_reference_values`-Seed-Daten beschaffen.
- MealCam ist **kein eigenes Modul**, sondern über ADRs/Patches in Nutrition
  spezifiziert.

**Spec↔Code-Delta** — `[read]` `docs/ist-zustand/02-nutrition-spec-code-abgleich.md`
(v0.2, 2026-07-30; Methodik dort selbst deklariert: SPEC_04/06/07 nur in
Auszügen, Patches nicht abgeglichen — als Richtwert, nicht als Vollabgleich):

1. **Architektur-Abweichung, tragend:** Spec will eigenständigen Service
   `http://nutrition:5100` mit JWT; Code hat Next.js-API-Routen ohne Auth und
   psql-gegen-Docker. → Entscheidungsfrage D-08/C-08.
2. **V1-Scope (14 Punkte):** ✓ nur Food Search; ~ Kuration (lesend),
   Preview-Engine, Smart-Search-Ansatz; ✗ Preferences-Schreibpfad, Water,
   Diary, Copy-Day, MealCam, Targets, Summary, Onboarding, Auth, for-ai/for-goals.
3. **SPEC_06-Deckung:** 7 von 15 Konzepten live (kompletter Katalog-Kern inkl.
   EAV), 2 als nicht verdrahtete Entwürfe, 6 fehlend — größte Lücke ist der
   Schreibpfad, nicht das Nährstoffmodell.

Dazu produktseitig unverdrahtet (`[read]` `10-workspace.md`, TODO C-07/C-08):
`services/nutrition-api` (`[cmd]` 4 Dateien: index + Routen diary/food/meals,
Hono + zod + supabase-js — genau der Spec-Architekturansatz, von nichts
verwendet; Tom: Teil des Endausbaus), `packages/shared` (Supabase-Clients),
`packages/types` (Nutrition-Typen).

---

## Befunde zur Spec-Qualität (für das Spec-Audit D-05)

1. **Tote Verweise:** `[cmd]` `CONSOLIDATED_KNOWLEDGE.md` wird in 7
   INDEX-Dateien referenziert (Buddy, HumanCoach, Marketplace, Medical,
   Recovery, Supplements, Training), existiert aber nur in `Goals/`.
2. **Buddy-INDEX zeigt auf Phantome:** `[cmd]`/`[read]` `BuddyandAICoach/INDEX.md`
   verweist auf `spec/SPEC_01…`-Pfade und auf `README.md`/`STRATEGY.md` —
   die SPEC-Dateien liegen flach im Ordner, README/STRATEGY existieren nicht.
3. **Specs beschreiben teils Vorgänger-Code als erledigt:** `[read]`
   `Goals/OPEN_ITEMS.md:3` „Status: Vollständig implementiert (2026-04-14)" und
   `Goals/README.md` nennt Pfade wie `apps/app/modules/goals/` — beides passt
   nicht zu diesem Repo (`[cmd]` `services/goals-api` ist leer, `/goals` ist
   Mock). Gleiches Muster in `Admin/13_MODULE_ADMIN.md` („Backend complete").
   **Solche Status-Zeilen nie als Ist-Zustand übernehmen.**
4. **Goals-Spec hat 2 selbst deklarierte kritische Bugs:** `[read]`
   `OPEN_ITEMS.md:9–17` — Adaptive-TDEE braucht Cross-Schema-Batch;
   Contribution-Score-Aggregation nur tagesbasiert. Vor einem Goals-Bau
   einarbeiten.
5. Zählungs- und Versions-Widersprüche (10/11/7/13 Module, Next 14 vs. 15):
   siehe `11-zielarchitektur.md`.

---

## Was als Nächstes zu bauen ist — Ableitung

Empfehlung aus der Matrix, **keine getroffene Entscheidung**. Reihenfolge folgt
den Blockern:

1. **Entscheidungen vor Code** (alles Weitere hängt daran):
   a. Architektur: Next.js-In-App vs. 5100er-Service (TODO D-08, C-08) —
      betrifft auch supabase-js vs. Docker-psql.
   b. Nutrition Product Gate öffnen oder geschlossen lassen (`[read]`
      INDEX-Status oben).
   c. ADR-002 (Preferences-Tabellendesign) und ADR-003 (Diary: EAV vs. flach,
      `30-datenbank.md`).
2. **Preferences-Schreibpfad** (TODO C-02) — kleinster Blocker, größter Hebel:
   erste Schreib-Migration, erste echte Persistenz; macht Smart Search und
   Preferences-Engine echt.
3. **Diary-Verdrahtung** (C-03) + Daily Summary (C-04) — danach Water (C-05).
4. **Frontend-Stack-Lücke schließen** (C-01) — spätestens, wenn erste
   Formulare/Charts gebraucht werden (zod, react-hook-form, Recharts …).
5. **Erstes Mock-Modul echt machen** (C-06) — Kandidat Goals; vorher die
   2 Spec-Bugs (oben) klären. Alternative mit weniger Spec-Risiko: keins —
   Goals ist laut Specs der Aggregationskern, aber jedes andere Modul liefert
   ihm nur Contributions.
6. Parallel, ohne Produktentscheidung möglich: Test-Runner einrichten
   (12 Unit-Tests derzeit nicht ausführbar, `20-apps-web-ist.md`) und
   Spec-Audit D-05 (tote Links, Zählungen, Status-Zeilen).
