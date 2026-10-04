---
nr: C-559
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-10-04
agent: codex
beauftragt: 2026-10-04

braucht: [C-558]
kind_von: C-558

quellen:
  - docs/punkte/erledigt/supplements-c-0558-die-kette-laeuft-gruen.md

beruehrt:
  tabellen:
    - supplements.supplements
  dateien: []
---

# Der neue Grundbestand hat 45 Supplements weniger als Live

## Auftrag — Kopf

    AUFTRAG FUER Codex - C-559: welche Supplements fehlen dem neuen
                               Grundbestand, und haengt etwas daran?
    Bereich: supabase/_pipeline/ (lesend), Wegwerf-Datenbanken
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-04

## Der Befund

`[cmd]` **Live, gelesen am 04.10.:** `supplements.supplements` 617, davon 430
`im_katalog`.
`[cmd]` **Neuer Grundbestand (C-558, Dump `grunddaten-20261004T011755Z.dump`):**
572, davon 446 im Katalog, 126 nicht.
`[cmd]` **Die alte Kettenerwartung war 596** — C-558 hat sie auf 572 gesenkt.

## Was zu tun ist — nur messen, nichts aendern

1. **Den Dump in eine Wegwerf-Datenbank laden** und gegen Live halten:
   welche `supplements.supplements` gibt es live und nicht im Grundbestand,
   und umgekehrt. **Abgleich ueber `slug`, nicht ueber `id`.**
2. **Je fehlendem Supplement:** woher kommt es (Quelle, Anlagedatum), und
   haengen **Nutzerdaten** daran — Einnahmen, Stacks, Inventar,
   Nutzereinstellungen? Zahl je Tabelle.
3. **Die 24 zwischen 596 und 572:** welche Datensaetze sind das, und warum
   entstehen sie nicht mehr (Deduplizierung, C-557, Kern-Dubletten)?

## Harte Regeln

- **Nie in die laufende Datenbank schreiben.** Live nur lesen.
- **Nichts reparieren.** Das Ergebnis ist eine Liste und eine Empfehlung;
  ob Live je auf diesen Stand abgeglichen wird, entscheidet Tom.
- Wegwerf-Datenbank danach loeschen. Kein Commit.
