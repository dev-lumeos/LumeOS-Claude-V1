---
nr: C-465
typ: feature
modul: marketplace
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-452
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [marketplace.product_licenses]
zahlen:
  gemessen: 2026-09-08
---

# C-465 — die Auslieferung bauen

## Warum jetzt

`[cmd]` **C-452 hat gemessen: ein Kauf kommt nirgends an.**

`[cmd]` **C-461 ist abgenommen** ? **`training` hat jetzt
`programs`, `program_blocks`, `program_days`,
`program_assignments`, `routines`, `routine_exercises`,
`routine_schedule_days`.**

`[read]` **Der Zieltyp, der in C-452 fehlte, existiert.**

## Dein eigener Vorschlag aus C-452

> *,,Serverseitiger Kauf-/Delivery-Workflow ? Order, Item, Lizenz
> und eine ausstehende Auslieferung erfassen; der Dispatcher ruft
> das Fachmodul mit idempotentem Schluessel auf und speichert
> dessen Zuweisungs-ID strukturiert. Bei Refund/Entzug folgt eine
> ebenso idempotente Gegenaktion, ohne Nutzerfortschritt zu
> loeschen."*

`[cmd]` **`program_assignments` ist die Zuweisungs-ID.**

## Und deine Warnung gilt weiter

> *,,Die Wallet-Buchung sollte finanziell atomar bleiben, aber
> nicht faelschlich eine externe Fachmodul-HTTP-Auslieferung in
> dieselbe Datenbanktransaktion pressen."*

`[read]` **Der Kauf schreibt die Lizenz, die Auslieferung ist ein
eigener, wiederholbarer Schritt.**

`[read]` **Ein Kauf, der scheitert, weil das Fachmodul nicht
antwortet, waere schlimmer als eine verzoegerte Auslieferung.**

## Was gemessen ist

`[cmd]` **`marketplace.product_licenses` hat zehn Spalten:**

    id, order_id, user_id, product_id,
    license_type, valid_from, valid_until,
    is_active, delivery_status, delivered_at,
    delivery_results

`[cmd]` **`delivery_status`: `pending | delivered | failed |
partial`.**

`[cmd]` **`delivery_results` ist ungebundenes JSON** ? **dein
Befund: *,,keine referenzielle Auslieferung"*.**

`[read]` **Jetzt kann dort eine echte `program_assignments.id`
stehen.**

## Was zu bauen ist

**1** ? **Der Kaufweg schreibt Order, Item, Lizenz.**

`[cmd]` **`book_wallet_purchase` bucht heute NUR Wallets und
Journalzeilen** (dein Befund, `419_wallet_booking.sql:70`).

`[read]` **Erweitern oder danebenstellen** ? **miss, was
richtiger ist.**

**2** ? **Die Auslieferung als eigener Schritt.**

`[read]` **Idempotent:** **zweimal gerufen, eine Zuweisung.**

`[cmd]` **`SPEC_04_FEATURES.md:94` beschreibt den Payload:**
`routine`, `user_id`, `source: marketplace`, `product_id`.

`[cmd]` **`training.programs` hat eine Quelle** (C-461) ?
`self | coach | marketplace`.

**3** ? **Der Widerruf.**

`[cmd]` **`SPEC_03_USER_FLOWS.md:156`: beim Refund die Lizenz
deaktivieren.**

`[read]` **Ebenso idempotent, und OHNE Nutzerfortschritt zu
loeschen** ? **wer vier Wochen trainiert hat, behaelt seine
Sitzungen.**

## Abnahmebedingungen

    A1  ein Kauf: Order, Item, Lizenz. Zahlen vorher/
        nachher. ROLLBACK.
    A2  die Auslieferung: eine program_assignments-Zeile,
        die ID in delivery_results. Referenziell, nicht
        als freier Text.
    A3  zweimal ausgeliefert -> eine Zuweisung. Gemessen.
    A4  Widerruf: Lizenz inaktiv, Zuweisung beendet,
        workout_sessions unberuehrt. Zahlen.
    A5  die Wallet-Buchung bleibt atomar und OHNE
        Fachmodulaufruf. Belegt.
    A6  RLS je neue Funktion, beide Richtungen.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu bauen ist

`[read]` **Keine Oberflaeche.**

`[read]` **Und keine Auslieferung fuer Produkttypen, die es nicht
gibt** ? **miss, welche `marketplace.products.product_type`
kennt.**
