# Spec-Audit: Recovery

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Recovery/` · **Prüftiefe:** Dateibestand vollständig, INDEX vollständig gelesen, Zählprüfungen, Querschnitts-Greps.

## Dateibestand

`[cmd]` 11 Dateien: `INDEX.md` + `SPEC_01` bis `SPEC_10`
(Slot 05 = `METRICS_ALGORITHMS`). Kein SPEC_11 — UI liegt in
`WebPlatform/SPEC_06_RECOVERY_UI.md`.

## Vollständigkeit gegen SPEC_01–SPEC_10

Vollständig (01–10).

## Interne Widersprüche

- `[cmd]` Zählprüfung: INDEX „10 Core Entities" / „10 Tabellen" — SPEC_02 hat
  10 Entity-Überschriften, SPEC_06 hat 10 `CREATE TABLE`. Deckt sich.
- `[read]` `SPEC_06:134` verweist für die vollständige Score-Implementierung
  auf `packages/scoring` — siehe unten.
- Feldabgleich Entities↔DB↔API nicht durchgeführt `[annahme]`.

## Tote Verweise

- `[read]` `INDEX.md:10` referenziert `CONSOLIDATED_KNOWLEDGE.md`
  („12 Alt-Dokumente") — `[cmd]` existiert nicht.

## Modulübergreifend

- `[cmd]` Port 5400 konsistent (INDEX, SPEC_01, SPEC_07; Training/Buddy/
  HumanCoach rufen `recovery:5400`).
- `[cmd]` `packages/scoring/src/recovery.ts` referenziert — Gerüst fehlt.
- `[read]` Next.js 15 (INDEX:80) vs. WebPlatform 14+.
- `[cmd]` Gerüst `services/recovery-api` existiert.
- `[read]` react-body-highlighter in Recovery-INDEX **und** Goals-README —
  konsistente Bibliothekswahl, in `apps/web/package.json` lt. C-01 nicht vorhanden.

## Reifegrad

Strukturell sauber, Algorithmus-Slot (05) klar getrennt.
**Einer Freigabe steht im Weg:** toter CONSOLIDATED-Verweis; Feldabgleich;
Klärung, wo Score-Formeln normativ liegen (SPEC_05 vs. SPEC_09 vs.
packages/scoring, das nicht existiert).
