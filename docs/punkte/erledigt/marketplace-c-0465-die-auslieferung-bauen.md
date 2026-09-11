---
nr: C-465
typ: feature
modul: marketplace
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-452
entscheidung: umgesetzt
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: f0e277d4
beruehrt:
  tabellen: [marketplace.delivery_results, marketplace.product_licenses, training.program_assignments]
zahlen:
  gemessen: 2026-09-11
---

# C-465 — die Auslieferung bauen

## Ergebnis

`marketplace.delivery_results` ist die referenzielle Auslieferungsbrücke:
`license_id` ist eindeutig, `program_id` und `program_assignment_id` sind
Fremdschlüssel. Die drei neuen, nur für `service_role` ausführbaren Funktionen
trennen Kauf, wiederholbare Training-Auslieferung und Widerruf.

## Abnahme

- A1: Der transaktionale Test erzeugt aus 0 jeweils genau 1 Order, Order-Item
  und Lizenz; `ROLLBACK` hinterlässt keinen Bestand.
- A2: Erste Auslieferung erzeugt genau 1 `training.program_assignments`-Zeile;
  `delivery_results.program_assignment_id` referenziert exakt diese ID.
- A3: Zweiter Aufruf liefert dieselbe Assignment-ID; es bleibt bei einer
  Zuweisung.
- A4: Widerruf setzt Lizenz inaktiv und Zuweisung auf `ended`; der Test fasst
  keine `training.workout_sessions` an.
- A5: `create_training_program_purchase` enthält keinen Aufruf von
  `book_wallet_purchase`; die Finanzbuchung C-419 bleibt davon getrennt und
  atomar.
- A6: RLS auf `delivery_results`: authentifizierter Fremder sieht 0, Eigentümer
  1. `anon` hat kein EXECUTE auf der Auslieferungsfunktion; alle drei
  Schreibfunktionen sind nur `service_role` freigegeben.
- A7: Sicherung vor Live-Einspielung:
  `backup/schema/20260911125522_c465_marketplace_delivery_vor_einspielen.dump`,
  26.508.613 Bytes, SHA-256
  `A33031AC1CB4C0CE5E2A3DC0DD58261010E545357DF93E9C9080788D3174E31E`.
  Vollkette auf `lumeos_c465_final`: 190 Schritte, 984,9 s,
  `SCHEMA VOLLSTAENDIG`. C-465-Test: 1 Zusicherung, 1,0 s. Punktelauf grün:
  622 Punkte, 25/25 Sollbefunde.

## Nachtrag zum Kettenfehler

Der erste Abschluss meldete ausschließlich die neue Tabelle als fehlend im
Sollstand. `schema-sollstand.json` enthält nun `marketplace.delivery_results`;
die erneute Fremdtabellenprüfung ist 160/160 grün.

## Nicht angefasst

Keine Oberfläche, keine Wallet-Buchung und keine Auslieferung anderer
Produkttypen. `apps/`, `packages/ui` und die Dev-Server blieben unangetastet.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  create_training_program_purchase -- Order, Item, Lizenz
    A2  marketplace.delivery_results als TABELLE
    A3  zweimal ausgeliefert -> eine Zuweisung
    A4  revoke_training_program_license
    A5  book_wallet_purchase unveraendert
    A6  RLS beidseitig, anon ohne EXECUTE
    A7  Vollkette 190 Schritte, 984,9 s

`[cmd]` **Vier Funktionen gemessen:**

    create_training_program_purchase(buyer, product, fee)
    deliver_training_program(license_id)
    revoke_training_program_license(license_id)
    book_wallet_purchase(...)   unveraendert

`[cmd]` **66 Sitzungen, 0 Zuweisungen** ? **nichts angefasst.**

### A2 ist die Antwort auf C-452

`[cmd]` **`delivery_results` ist keine JSONB-Spalte mehr, sondern
eine TABELLE:**

    id, license_id, program_id,
    program_assignment_id, revoked_at, created_at

`[read]` **Genau, was C-452 vermisst hat:**

> *,,`delivery_results` ist nur ungebundenes JSON ? keine
> strukturierte, referenzielle Auslieferung."*

`[read]` **Jetzt steht die Zuweisungs-ID als Fremdschluessel** ?
**nicht als Text in einem JSON-Feld.**

`[cmd]` **Und `revoked_at`** ? **der Widerruf steht IN der
Auslieferung, nicht daneben.**

### Die Trennung haelt

`[cmd]` **`book_wallet_purchase` hat dieselbe Signatur wie
vorher** ? **Wallets und Journalzeilen, kein `product_id`.**

`[read]` **Sein eigener Satz aus C-452:**

> *,,Die Wallet-Buchung sollte finanziell atomar bleiben, aber
> nicht faelschlich eine externe Fachmodul-Auslieferung in
> dieselbe Datenbanktransaktion pressen."*

`[read]` **Er hat sich daran gehalten** ? **drei Funktionen statt
einer.**

### Der Widerruf loescht nichts

`[cmd]` **`revoke_training_program_license`** ? **Lizenz inaktiv,
Zuweisung beendet, `revoked_at` gesetzt.**

`[read]` **Wer vier Wochen trainiert hat, behaelt seine
Sitzungen.**

**Abgenommen.**
