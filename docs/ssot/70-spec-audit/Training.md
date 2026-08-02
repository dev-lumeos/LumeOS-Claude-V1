# Spec-Audit: Training

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Training/` · **Prüftiefe:** Dateibestand vollständig, INDEX vollständig gelesen, Zählprüfungen, Querschnitts-Greps.

## Dateibestand

`[cmd]` 11 Dateien: `INDEX.md` + `SPEC_01` bis `SPEC_10`
(Slot 05 = `EXERCISE_TAXONOMY`). Kein SPEC_11 — UI in
`WebPlatform/SPEC_05_TRAINING_UI.md`.

## Vollständigkeit gegen SPEC_01–SPEC_10

Vollständig (01–10).

## Interne Widersprüche

- `[cmd]` Zählprüfung: INDEX „16 Core Entities" / „16 Tabellen" — SPEC_02 hat
  16 Entity-Überschriften, SPEC_06 hat 16 `CREATE TABLE`. Deckt sich.
- `[read]` INDEX behauptet Bestandsdaten als Fakt: „1.200+ Übungen",
  „4.645 Bilder", „1.850/1.850 Instructions übersetzt, TH fertig",
  „Cloudflare R2 (~15 GB)". Im Repo existiert keine dieser Datenmengen;
  die Medien liegen `[annahme]` in der Legacy-Cloud-Instanz LumeOS-V2
  (TODO Sektion E: Storage-Bucket `exercises`, Supabase — nicht Cloudflare R2).
  **Widerspruch Medienort:** Spec sagt R2, TODO-E-Befund sagt Supabase Storage.
- Feldabgleich Entities↔DB↔API nicht durchgeführt `[annahme]`.

## Tote Verweise

- `[read]` `INDEX.md:10` referenziert `CONSOLIDATED_KNOWLEDGE.md`
  („12 Alt-Dokumente") — `[cmd]` existiert nicht.

## Modulübergreifend

- `[cmd]` Port 5200 konsistent (INDEX, SPEC_01, SPEC_07; alle Consumer
  nutzen `training:5200`).
- `[cmd]` `packages/scoring/src/training.ts` referenziert — Gerüst fehlt.
- `[read]` Next.js 15 (INDEX:89) vs. WebPlatform 14+.
- `[cmd]` Gerüst `services/training-api` existiert.
- Für TODO E-04/E-05 relevant: SPEC_05_EXERCISE_TAXONOMY (Muscle Hierarchy)
  ist die Referenz, gegen die die Legacy-`exercises`-Daten gemappt werden
  müssen — Abgleich steht aus (Sektion E).

## Reifegrad

Strukturell sauber, Zählungen stimmen; Schwäche sind Ist-Behauptungen über
Datenbestände, die im Repo nicht existieren und deren Speicherort der Spec
widerspricht. **Einer Freigabe steht im Weg:** toter CONSOLIDATED-Verweis;
Ist/Soll-Trennung der Bestandszahlen; Klärung Medien-Storage (R2 vs.
Supabase LumeOS-V2, hängt an TODO E-06/E-07).
