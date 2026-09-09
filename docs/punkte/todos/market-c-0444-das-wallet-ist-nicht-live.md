---
nr: C-444
typ: befund
modul: market
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-419
entscheidung: null
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
