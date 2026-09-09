---
nr: C-444
typ: befund
modul: market
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-419
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [medical.lab_reports]
zahlen:
  gemessen: 2026-09-08
  schemas: 8
  market_tabellen: 0
---

# C-444 — das Wallet ist nicht live

## Befund

`[cmd]` **Gemessen 2026-09-08: es gibt KEIN `market`-Schema.**

    nutrition  goals  supplements  medical
    recovery   training  coach  wissen

`[cmd]` **C-419 hat 13 Tabellen gebaut** ? **abgenommen am
2026-09-08, nie eingespielt.**

`[read]` **Der Orchestrator hat es in mehreren Berichten als
vorhanden gefuehrt** ? **`00-ABGENOMMEN.md` sagt *abgenommen*,
nicht *live*.**

`[read]` **Das ist der Unterschied, den A-74 meinte.**

## Und das Altrepo hat mehr

`[cmd]` **`docs/modules/marketplace/DATABASE.md`, 960 Zeilen, 14
Tabellen mit vollem `CREATE TABLE`:**

    marketplace_products          marketplace_creators
    marketplace_purchases         marketplace_wallet_transactions
    marketplace_categories        marketplace_product_variants
    marketplace_reviews           marketplace_review_votes
    marketplace_promotions        marketplace_promotion_usage
    marketplace_product_analytics + zwei Monatspartitionen
    marketplace_search_analytics

`[read]` **Auswertung partitioniert nach Monat** ? **jemand hat mit
Menge gerechnet.**

`[cmd]` **Plus `MIGRATION.md` (22 KB), `FEATURES.md` (21 KB),
`API.md` (18 KB), `COMPONENTS.md` (17 KB),
`seed-marketplace.ts` (20 KB).**

`[cmd]` **Und eine Wettbewerbsanalyse (16 KB) samt Strategie
(15 KB).**

## Was zu tun ist

**1 ? C-419 einspielen.** `[read]` **Vorher messen, ob die 13
Tabellen zu den 14 des Altrepos passen** ? **oder ob etwas
fehlt.**

**2 ? Die Dokumentation lesen, bevor gebaut wird.**

`[cmd]` **`00-QUELLEN.md` nennt fuer Marketplace 12 Spec-Dateien**
? **das Altrepo hat sieben weitere, die niemand gelesen hat.**

`[read]` **Besonders `RESEARCH.md` und die Wettbewerbsanalyse** ?
**sie sagen, WARUM etwas so gebaut wurde.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Einspielen

`[cmd]` **C-419 ist am 2026-09-08 abgenommen: 13 Tabellen, RLS,
`book_wallet_purchase` atomar, Voucher vor Revenue.**

`[cmd]` **Es gibt kein `market`-Schema auf `dev`.**

`[read]` **Vorher Sicherung, wie immer.**

### 2 · Vorher: die 13 gegen die 14 halten

`[cmd]` **Das Altrepo hat 14 Tabellen mit vollem `CREATE TABLE`:**
`docs/modules/marketplace/DATABASE.md`, **960 Zeilen.**

    marketplace_products          marketplace_creators
    marketplace_purchases         marketplace_wallet_transactions
    marketplace_categories        marketplace_product_variants
    marketplace_reviews           marketplace_review_votes
    marketplace_promotions        marketplace_promotion_usage
    marketplace_product_analytics + zwei Monatspartitionen
    marketplace_search_analytics

`[read]` **Miss, welche der 13 welcher entspricht** ? **und was
fehlt.**

`[read]` **Nicht nachbauen** ? **melden.** `[cmd]` **Die
Auswertung ist dort nach Monat partitioniert** ? **jemand hat mit
Menge gerechnet, und das ist eine Entscheidung.**

### 3 · Und was das Altrepo begruendet

`[cmd]` **`docs/modules/marketplace/`: `FEATURES.md` 21 KB,
`API.md` 18 KB, `RESEARCH.md` 14 KB.**

`[cmd]` **Plus `research/marketplace/`: Wettbewerbsanalyse 16 KB,
Strategie 15 KB.**

`[read]` **`RESEARCH.md` sagt, WARUM etwas so gebaut wurde** ?
**das hat keine unserer Specs.**

`[read]` **Lies es und melde, was unsere 13 Tabellen NICHT
tragen** ? **nicht bauen.**

### Abnahmebedingungen

    A1  live: 13 Tabellen, je mit Zeilenzahl.
    A2  RLS je Tabelle, beide Richtungen an einer.
    A3  book_wallet_purchase: ein Kauf, atomar. Belegt.
    A4  die 13 gegen die 14: was fehlt, je mit einem Satz.
    A5  was RESEARCH.md begruendet und wir nicht haben.
    A6  Sicherung: Pfad, Groesse, Pruefsumme.
    A7  Vollkette und Punktelauf gruen.

### Was nicht zu tun ist

**Nichts nachbauen** ? **melden.** `[read]` **Market ist Neuland,
und die Grundmodule sind nicht fertig.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-392.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
