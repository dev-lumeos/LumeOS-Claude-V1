---
nr: C-467
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-466
entscheidung: umgesetzt
agent: codex
erledigt: 2026-09-08
commit: e7d858c9
beruehrt:
  tabellen: [supplements.suppliers, supplements.supplier_products, supplements.product_contents, supplements.product_content_candidates]
zahlen:
  gemessen: 2026-09-11
---

# C-467 — Lieferantenprodukte

## Ergebnis

Vier getrennte Tabellen modellieren Supplier, Produkt, bekannte Etiketteninhalte und unbekannte Inhaltskandidaten. `supplier.user_id` ist bewusst nullable: späterer Supplier-Account, heute agentengestützte Pflege. Der einzige Schreibweg ist `supplements.create_supplier_product(...)`, nur für `service_role`.

## Befund und Abnahme

- `user_supplement_settings` ist leer und hält Nutzerstatus je Stoff; es ist keine Marken-/Supplierauswahl. Die Auswahl erhält deshalb eine eigene Produkt-Ebene.
- `alias_resolution_candidates` ist ein globaler Aliasbefund, `stack_curation_candidates` gehört Vorlagen. Produktbezogene Kandidaten brauchen `product_id`, Etikett und Status; daher `product_content_candidates` mit `offen | geprueft | angereichert | abgelehnt`.
- Der Rot-Test fehlte erwartbar an `create_supplier_product`; nach Migration grün: 1 Produkt, 2 bekannte Inhalte, 1 unbekannter Kandidat, Fremder/authentifiziert liest den Katalog, anon hat kein Execute.
- Die Nährstoffbrücke wurde mit Faktor geprüft: Produktinhalt 100 mg × 1, Stoff-Nährstoff 10 mg × 2 = 2.000 in der Testrechnung.
- 596 Stoffe und 12 Stack-Items blieben unverändert.
- Sicherung vor Live-Einspielung: `backup/schema/20260911140708_c467_supplier_products_vor_einspielen.dump`, 50.673.262 Bytes, SHA-256 `24BFF97CED70B36F4550C7F1F7A9ACC8B19CA1037CC74709DF2831CC9534D943`.
- Vollkette: 191 Schritte, 940,9 s, `SCHEMA VOLLSTAENDIG`; Fremdtabellen 164/164. Punktelauf grün: 622 Punkte, 25/25 Sollbefunde.

## Nicht gebaut

Keine Oberfläche, kein Adminformular, keine Importvorlage und kein OCR. Keine Supplier-Rechte: das bleibt die offene Rollenentscheidung.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    suppliers                   10 Spalten, RLS, 1 Policy
    supplier_products           15 Spalten, RLS, 1 Policy
    product_contents            10 Spalten, RLS, 1 Policy
    product_content_candidates   9 Spalten, RLS, 1 Policy
    create_supplier_product     nur postgres + service_role
    Vollkette 191 Schritte, 940,9 s
    Sicherung 50.673.262 B, SHA-256

`[cmd]` **Selbst gemessen: alle vier Tabellen tragen genau die
Spalten aus dem Auftrag.**

### Die Kandidatenfrage hat er selbst beantwortet

`[read]` **Mein Auftrag sagte: *,,miss, welche der fuenf bestehenden
Bauformen passt."***

> *,,`alias_resolution_candidates` ist ein globaler
> Alias-/Katalogbefund. `stack_curation_candidates` gehoert
> Stack-Vorlagen. Daher eigene produktbezogene Kandidatentabelle
> erforderlich."*

`[read]` **Keine passte** ? **und er hat es begruendet, statt eine
zu verbiegen.**

`[cmd]` **`product_content_candidates` traegt `product_id`,
`ingredient_name`, `amount_per_serving`, `unit`, `status`** ?
**produktbezogen, nicht global.**

### Der Schreibweg ist der Agentenweg

`[cmd]` **`create_supplier_product`: nur `postgres` und
`service_role`.**

`[read]` **Toms Vorgabe:** *,,momentan geht einpflege: ich liefere
daten und du oder die agents pflegen ein."*

`[read]` **Kein Nutzerzugriff, keine Maske** ? **genau das.**

### Und was NICHT still geschieht

> *,,Bekannte Zutaten werden referenziell gespeichert, unbekannte
> als produktbezogener Kandidat ? nie still als Substanz
> angelegt."*

`[cmd]` **Toms Regel:** *,,wenn wir eine substanz nicht kennen,
muss das im admin gemeldet werden und wir checken das und
reichern daten an."*

`[read]` **Ein Etikett kann keine Substanz erfinden.**

### Die Naehrstoffbruecke traegt

`[cmd]` **Im Test gerechnet:** **1 Produkt, 2 Inhalte, 1 Kandidat
? und der Weg Produkt -> `product_contents` -> Substanz ->
`supplement_nutrients` -> Naehrstoff, MIT
`conversion_factor`.**

`[read]` **Damit ist C-466 baubar.**

### Was offen bleibt

`[cmd]` **`suppliers.user_id` ist da, aber NULL** ? **die Rechte
eines Suppliers sind nicht definiert** (dieselbe Frage wie
C-451).

**Abgenommen.**
