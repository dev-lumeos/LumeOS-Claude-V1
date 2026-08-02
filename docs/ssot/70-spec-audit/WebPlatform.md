# Spec-Audit: WebPlatform

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/WebPlatform/` · **Prüftiefe:** Dateibestand vollständig, INDEX vollständig gelesen, Querschnitts-Greps.

## Dateibestand

`[cmd]` 11 Dateien: `INDEX.md` + `SPEC_01_APP_SHELL` bis
`SPEC_10_WORKSPACE_LINKS`.

## Vollständigkeit

Eigenes, bewusst orthogonales Schema (UI-Specs je Modul statt
Contract/Entities/API) — `[read]` INDEX deklariert das explizit. Vollständig
in sich; alle 4 referenzierten Workspace-UI-Specs existieren `[cmd]`
(HumanCoach/SPEC_11, BuddyandAICoach/SPEC_11, Marketplace/SPEC_11,
Admin/SPEC_01_UI_DESIGN).

## Interne Widersprüche

- `[cmd]` **117 vs. 138 Nährstoffe:** `INDEX.md:33`, `SPEC_01_APP_SHELL.md:190`
  („117 nutrients · BLS 10.840") und `SPEC_04_NUTRITION_UI.md:9` sprechen von
  117 Nährstoffen. Nutrition-SPEC_06 seedet 138 `nutrient_defs`, die Live-DB
  hat 138 (und 7.140 foods, nicht 10.840). Deckt sich mit TODO C-10 —
  die Zahl stammt aus der Spec, nicht nur aus der App-Shell.

## Modulübergreifend

- `[cmd]` **Next.js 14+** (INDEX:66) — 10 andere Spec-Quellen sagen
  Next.js 15 (Training, Goals, Admin×2, Marketplace, HumanCoach, Supplements,
  Medical, Recovery, Nutrition). WebPlatform + Admin-INDEX sind die einzigen
  mit „14+". `apps/web` nutzt real Next.js 14 (`[read]` lt. `20-apps-web-ist.md`).
- `[read]` Modulzählung: „alle 11 Module" (Design-Referenz) und
  „7 Core-Module + Dashboard + Auth" — gegen 10 (Master Vision) und 13
  (Spec-Ordner). Vier verschiedene Zählungen im Baum.
- `[read]` INDEX benennt die Haupt-App korrekt `apps/web` — im Gegensatz zu
  Goals/HumanCoach/Marketplace/Nutrition/…, die von `apps/app` sprechen
  (`[cmd]` 14 Dateien im Spec-Baum referenzieren `apps/app`).
- `[read]` Tech-Stack-Tabelle (13 Bibliotheken) ist die Referenz für die
  Stack-Lücke aus TODO C-01 (10 von 13 fehlen in `apps/web`).

## Reifegrad

Jüngste und konsistenteste Schicht (Stand Mai 2026, Status draft, kennt die
Workspace-Trennung und die realen App-Namen). Die 117er-Zahl ist ihr
Hauptfehler. **Einer Freigabe steht im Weg:** 117→138 und 10.840→Ist
korrigieren (oder als bewusstes Denormalisierungs-Subset begründen);
Versionsfrage 14 vs. 15 repo-weit entscheiden; Modulzählung vereinheitlichen.
