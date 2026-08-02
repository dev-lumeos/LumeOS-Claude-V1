# Spec-Audit: Marketplace

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Marketplace/` · **Prüftiefe:** Dateibestand vollständig, INDEX vollständig gelesen, Zählprüfungen, Querschnitts-Greps.

## Dateibestand

`[cmd]` 12 Dateien: `INDEX.md` + `SPEC_01` bis `SPEC_11_UI_DESIGN`
(Slot 05 = `WALLET_ECONOMICS`).

## Vollständigkeit gegen SPEC_01–SPEC_10

Vollständig, plus SPEC_11 (UI). SPEC_11 fehlt im eigenen INDEX, wird von
`WebPlatform/INDEX.md:49` referenziert.

## Interne Widersprüche

- `[cmd]` Zählprüfung: INDEX „10 Core Entities" / „11 Tabellen" — SPEC_02 hat
  10 Entity-Überschriften, SPEC_06 hat 11 `CREATE TABLE`. In sich konsistent
  (1 Tabelle mehr als Entities ist plausibel, z.B. Join-Tabelle) —
  Feldabgleich nicht durchgeführt `[annahme]`.

## Tote Verweise

- `[read]` `INDEX.md:10` referenziert `CONSOLIDATED_KNOWLEDGE.md`
  („13 Alt-Dokumente") — `[cmd]` existiert nicht.

## Modulübergreifend

- `[cmd]` Port 5700 konsistent (INDEX, SPEC_01-Verweise anderer Module:
  Buddy ruft `marketplace:5700`).
- `[cmd]` **`apps/marketplace` existiert nicht** — INDEX:116 deklariert
  „Next.js 15 (apps/marketplace/, Port 8503)". `WebPlatform/INDEX.md:49`
  sagt korrekt „zukünftig apps/marketplace" — der Marketplace-INDEX
  präsentiert Zukunft als Bestand.
- `[read]` „Embedded: In apps/app/modules/marketplace/" (INDEX:117) —
  `[cmd]` `apps/app` existiert nicht.
- `[cmd]` `packages/scoring/src/marketplace.ts` referenziert — Gerüst fehlt.
- `[cmd]` Gerüst `services/marketplace-api` existiert.
- Wallet-Prinzipien überschneiden `docs/specs/Core/AI_USAGE_WALLET_ADR.md` —
  nicht zeilenweise abgeglichen `[annahme]`.

## Reifegrad

Wirtschaftslogik ungewöhnlich detailliert (Fees, Promotion-Preise,
Revenue-Shares). Struktur komplett. **Einer Freigabe steht im Weg:**
toter CONSOLIDATED-Verweis, `apps/app`/`apps/marketplace`-Ist-Soll-Trennung,
Abgleich mit Core-Wallet-ADR, SPEC_11 in INDEX.
