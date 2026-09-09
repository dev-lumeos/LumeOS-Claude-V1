---
nr: C-452
typ: befund
modul: market
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-444
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: OFFEN
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

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  product_licenses: 10 Spalten, je mit Bedeutung
    A2  ein Kauf braucht vier Zeilen, die vierte fehlt
    A3  das Altrepo hatte ZWEI widerspruechliche Wege
    A4  Widerruf: in der Spec, nicht gebaut
    A5  ein Vorschlag mit Reihenfolge und Aufwand

`[cmd]` **Selbst gemessen: keine Programm-Tabelle in `training`,
kein Fremdschluessel nach `marketplace`.**

### Er hat zwei meiner Zahlen berichtigt

**1** ? `[read]` **Die Punktdatei nahm an, `book_wallet_purchase`
erzeuge eine Lizenz.**

`[cmd]` **`419_wallet_booking.sql:70`: sie bucht ausschliesslich
Wallets und Journalzeilen** ? **kein `product_id`, keine
Lizenz.**

`[read]` **Der Kaufweg ist kuerzer, als ich dachte.**

**2** ? `[cmd]` **`training.exercises` hat 1.416 Zeilen.**

`[read]` **Mein Lagebericht von heute Mittag sagte *,,der
Uebungskatalog ist leer"*** ? **falsch, die Statistik war
veraltet.**

`[read]` **Und das aendert seinen Vorschlag:** **es fehlt nicht der
Katalog, sondern die Programmvorlage darueber.**

### A2 — die Luecke ist genau benannt

    1  orders                                 fehlt
    2  order_items                            fehlt
    3  product_licenses, delivery_status pending  fehlt
    4  eine Trainings-Auslieferung mit
       fachmodul-eigener Zuweisungs-ID        FEHLT GANZ

`[cmd]` **`workout_sessions`, `workout_exercises`, `workout_sets`
sind Protokolle** ? **kein Platz fuer ein gekauftes Programm.**

`[cmd]` **Und die Spec beschreibt den Weg genau**
(`SPEC_04_FEATURES.md:94`): `routine`, `user_id`,
`source: marketplace`, `product_id` **an**
`POST /api/training/routines`.

`[read]` **Beschrieben, nicht gebaut.**

### A3 — das Altrepo widerspricht sich selbst

`[cmd]` **`routes/activate.ts`: ein echter Weg** ? **Programm ->
`training_plans`, `training_plan_days`, `routines`,
`routine_exercises`.**

`[cmd]` **Aber der von der Bibliothek benutzte Pfad
(`purchases.ts:174`) setzt nur `activated` und gibt Inhalt
zurueck** ? **er schreibt NICHTS nach Training.**

`[read]` **Zwei Ansaetze, einer verdrahtet** ? **er hat den
Unterschied gemessen, statt den ersten fuer den Stand zu
halten.**

### A5 — die Reihenfolge ist der Kern

> *,,Nicht Training direkt `product_licenses` lesen lassen."*

    1  Kaufvertrag klaeren        1-2 Tage
    2  Training fachlich fertig   mittel bis gross
       -- ohne Zieltyp kann kein Produkt ankommen
    3  Delivery-Workflow          4-6 Tage danach

`[read]` **Und der Satz, der die Falle benennt:**

> *,,Die Wallet-Buchung sollte finanziell atomar bleiben, aber
> nicht faelschlich eine externe HTTP-Auslieferung in dieselbe
> Datenbanktransaktion pressen."*

`[read]` **Ein Kauf, der scheitert, weil das Fachmodul nicht
antwortet, waere schlimmer als eine verzoegerte Auslieferung.**

**Abgenommen. Nicht beauftragt** ? **Market wartet auf die
Grundmodule.**
