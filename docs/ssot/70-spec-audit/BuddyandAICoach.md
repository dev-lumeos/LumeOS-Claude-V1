# Spec-Audit: BuddyandAICoach

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/BuddyandAICoach/` · **Prüftiefe:** Dateibestand vollständig, INDEX vollständig gelesen, Zählprüfungen, Querschnitts-Greps.

## Dateibestand

`[cmd]` 12 Dateien: `INDEX.md` + `SPEC_01_MODULE_CONTRACT` bis `SPEC_11_UI_DESIGN`.

## Vollständigkeit gegen SPEC_01–SPEC_10

Vollständig (01–10 vorhanden), plus SPEC_11 (UI). SPEC_05 heißt hier
`ENGINES` (modulspezifisch statt Katalog-Slot) — konsistent mit den anderen
Modulen, die Slot 05 frei belegen.

## Interne Widersprüche

- `[cmd]` Zählprüfung: INDEX behauptet 12 Entities und 16 Tabellen —
  SPEC_02 hat 12 Entity-Überschriften, SPEC_06 hat 16 `CREATE TABLE`. Deckt sich.
- Kein Zeilen-Review Entities↔DB↔API durchgeführt `[annahme]` — Feldabgleich steht aus.

## Tote Verweise (der schwerste Fall im Spec-Baum)

`[read]` `INDEX.md` referenziert:

1. **9 Übersichtsdateien, die nicht existieren:** `CONSOLIDATED_KNOWLEDGE.md`
   („24 Alt-Dokumente, 702 Zeilen"), `README.md`, `STRATEGY.md`, `FEATURES.md`,
   `DATABASE.md`, `API.md`, `COMPONENTS.md`, `SCORING.md`, `OPEN_ITEMS.md` —
   `[cmd]` keine davon liegt im Ordner.
2. **Falsches Pfad-Präfix:** alle 10 Spec-Einträge zeigen auf `spec/SPEC_xx…` —
   ein Unterordner `spec/` existiert nicht; die Dateien liegen auf Top-Level.
3. **SPEC_11_UI_DESIGN.md fehlt im INDEX**, obwohl vorhanden und von
   `WebPlatform/INDEX.md:48` referenziert.

Das Muster (Übersichts-Neuner + spec/-Präfix) entspricht exakt der
Goals-Ordnerstruktur — `[annahme]` der Buddy-INDEX wurde von einem
Goals-artigen Stand kopiert, die Übersichtsdateien wurden nie migriert
oder gingen verloren.

## Modulübergreifend

- `[cmd]` Port 5500, konsistent im 5x00-Schema.
- `[cmd]` `packages/scoring/src/buddy.ts` + `policy-gate.ts` referenziert
  (SPEC_09, SPEC_08, SPEC_04) — `packages/scoring` existiert nicht.
- `[read]` INDEX nennt LLM-Modelle „GLM-4.7-Flash / Haiku / Sonnet" — Modell-
  und Kostenangaben sind zeitgebunden und als Planungsstand zu lesen.
- `[cmd]` Gerüst `apps/buddy` existiert; `services/`-Gegenstück heißt nicht
  „buddy", Kandidaten wären `coach-api`/`memory-api`/`retrieval-api` — Zuordnung
  ungeklärt `[annahme]`.

## Reifegrad

Inhaltlich das ausgearbeitetste Modul-Set (11 Engines, Safety-Regeln,
Feature-Gates, Cron-Jobs), aber der INDEX ist der kaputteste im Baum.
**Einer Freigabe steht im Weg:** INDEX neu schreiben (Pfade, fehlende
Übersichten entweder erzeugen oder streichen, SPEC_11 aufnehmen);
Klärung, ob die 9 verschwundenen Übersichtsdateien je existierten.
