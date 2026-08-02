# Spec-Audit: Core

**Stand:** 2026-08-02 · **Ordner:** `docs/specs/Core/` · **Prüftiefe:** Dateibestand vollständig, Köpfe gelesen.

## Dateibestand

`[cmd]` 3 Dateien: `AI_USAGE_WALLET_ADR.md`, `ONBOARDING_ADR.md`,
`SUBSCRIPTION_GATES_ADR.md`.

## Vollständigkeit gegen SPEC_01–SPEC_10

Nicht anwendbar — Core ist kein Modul, sondern ein ADR-Ablageort für
modulübergreifende Entscheidungen (`[read]` alle 3 sind als ADR betitelt,
Datum April 2026; ONBOARDING „Status: Final", AI_USAGE_WALLET
„V1 = Tracking only / Endausbau = Wallet-Transaktion").

## Befund

- Kein INDEX, keine Einbindung: kein anderes Verzeichnis deklariert, dass
  Core-ADRs existieren `[annahme]` (kein Gegen-Grep auf alle Module gelaufen).
- Überschneidung mit `docs/specs/Marketplace/` (Wallet) und den Feature-Gates
  im Buddy-INDEX ist naheliegend, wurde aber nicht zeilenweise abgeglichen `[annahme]`.
- D-06 (ADRs nach `docs/decisions/`) betrifft auch diese 3 Dateien.

## Reifegrad

ADRs wirken final, aber heimatlos. **Einer Freigabe steht im Weg:** Klärung,
ob Core-ADRs nach `docs/decisions/` wandern (D-06) oder ein eigenes
Modul „Core/Platform" mit Contract entsteht.
