---
nr: C-452
typ: befund
modul: market
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-444
entscheidung: null
beruehrt:
  tabellen: [marketplace.product_licenses]
zahlen:
  gemessen: 2026-09-08
  tabellen: 13
  leser: 0
---

# C-452 — ein Kauf kommt nirgends an

## Befund

Aus C-444, Codex, 2026-09-08:

> *,,Der neue Kern traegt Bundle-Komponenten und Gebuehren, aber
> noch keine Integration gekaufter Inhalte in Fachmodule, keine
> Empfehlungen, Suche oder Analytik und keine
> Creator-Qualitaetssicherung."*

`[cmd]` **Live gemessen: 13 Tabellen, 13 mit RLS, 13 Policies.**

    subscription_plans        3
    fee_schedules             7
    promotion_slot_catalog    4
    alle uebrigen             0

`[read]` **Der Kaufweg steht** ? `book_wallet_purchase` **ist
atomar belegt: 900 Cent, Voucher 500 vor Revenue 400, Gebuehr 180,
Verkaeufer 720, zwei Journalzeilen.**

`[read]` **Aber `product_licenses` hat keinen Leser.**

## Was das heisst

`[read]` **Jemand kauft ein Trainingsprogramm** ? **eine Zeile
entsteht in `product_licenses`.**

`[read]` **Und dann?** `[cmd]` **`training` liest sie nicht.**
`[cmd]` **`nutrition` auch nicht.**

`[read]` **Ein Marktplatz, dessen Kaeufe nirgends ankommen.**

## Was die Forschung dazu sagt

`[cmd]` **`referenz/lumeos-2026/docs/modules/marketplace/RESEARCH.md:36`
und `research/marketplace/lumeos-marketplace-strategy.md:235`:**

    integrierte, adaptive Inhalte
    Health-Daten-gestuetzte Discovery
    Creator-Analytics und -Verifikation
    Cross-Module-Auslieferung

`[read]` **Der letzte Punkt IST der Befund** ? **das Altrepo hat
ihn als Kern beschrieben, nicht als Zusatz.**

## Und was noch fehlt

`[cmd]` **Codex' Abgleich gegen die 14 des Altrepos:**

    haben Entsprechung   products, creators, wallet_transactions,
                         reviews
    aufgeteilt           purchases -> orders, order_items,
                         product_licenses
    FEHLEN               categories, product_variants,
                         review_votes, promotions,
                         promotion_usage, product_analytics
                         (mit Monatspartitionen),
                         search_analytics

`[cmd]` **Und sein Hinweis:** *,,`promotion_slots` sind
Werbeplaetze, kein Ersatz fuer Rabattcodes."*

`[read]` **Zwei Sachen mit aehnlichem Namen, verschiedener
Zweck** ? **das haette man verwechseln koennen.**

## Warum es wartet

`[read]` **Market ist Neuland, und die Grundmodule sind nicht
fertig** ? **Toms Vorgabe.**

`[read]` **Aber der Befund gehoert festgehalten:** **wer spaeter
den Kaufweg baut, muss wissen, dass er nirgends endet.**
