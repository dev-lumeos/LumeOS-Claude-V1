---
nr: G-458
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-472
entscheidung: null
agent: codex
beruehrt:
  dateien:
    - tools/migration-datenlogik-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  soll: 44
  ist: 53
---

# G-458 - neun Migrationen schreiben Daten

## Befund

`[cmd]` **`migration-datenlogik-pruefen.mjs`: Soll 44, Ist 53.**

`[cmd]` **Die neun neuen, gemessen:**

    c496_supplier_product_nutrients      INSERT
    c497_supplier_product_preferences    DELETE, INSERT
    c498_global_allergies                INSERT x3
    c499_deactivate_off_market           UPDATE
    c500_vitamin_e_form_evidence         INSERT x2

`[read]` **Alle aus den Punkten von heute** ? **C-496 bis
C-500.**

## Die Regel

`[cmd]` **`supabase/README.md`, D-17:** **eine Migration darf
keine Katalogdaten schreiben.**

`[cmd]` **C-472 hat 44 als begruendeten Sollstand gesetzt** ?
**historische Faelle, einzeln belegt.**

`[read]` **Neun neue sind dazugekommen, ohne Begruendung.**

## Mein Anteil

`[read]` **Ich habe C-496 bis C-500 abgenommen, OHNE den
Waechter zu pruefen.**

`[cmd]` **Er stand in den Abnahmebedingungen** (*,,Punktelauf"*)
? **aber `migration-datenlogik-pruefen.mjs` ist ein anderer
Lauf.**

## Was zu tun ist

`[read]` **Je der neun messen: echte Verletzung oder
Fehlerkennung?**

`[cmd]` **WARNUNG: ich habe selbst schon 13 Treffer gezaehlt,
die alle Kommentare und `ON DELETE`-Klauseln waren.**

`[read]` **Schluesselwoerter zaehlen ist nicht Anweisungen
zaehlen.**

### Und dann eine Entscheidung

**a** ? **Die Daten in `_pipeline/` umziehen.**

`[read]` **Richtig nach D-17, aber neun Migrationen sind
schon eingespielt.**

**b** ? **In den Sollstand, je mit Grund.**

`[read]` **Wie C-472 es fuer die 44 gemacht hat.**

`[cmd]` **Manche sind vermutlich echte Kataloge** ?
`c500_vitamin_e_form_evidence` **traegt 1.433 belegte
Formen.**

`[read]` **Die gehoeren in die Kette, nicht in eine
Migration.**

## Abnahmebedingungen

    A1  je der neun: echte Verletzung oder
        Fehlerkennung? TABELLE.
    A2  je echter Verletzung: umgezogen oder mit
        Grund im Sollstand.
    A3  KEINE Ausnahme ohne Grund.
    A4  der Waechter ist GRUEN.
    A5  Gegenprobe: eine neue Migration mit INSERT
        -> faellt er?
    A6  Sicherung, Vollkette, Punktelauf.

## Bericht — 2026-09-16

Sicherung vorher: `backup/schema/20260916065959_g458_vorher.sql`.

| Befund des Waechters | Einordnung | Entscheidung |
|---|---|---|
| C-496: `INSERT` in `supplier_product_nutrient_name_mappings` | echte Katalogdaten, 39 DSLD-Namen | nach `13_supplements/496_supplier_product_nutrients_daten.sql` umgezogen |
| C-497: `DELETE` im RPC `supplier_product_preference_write` | Fehlerkennung: kuenftiger authenticated-Nutzerpfad, beim Einspielen keine Zeile | eng an Funktion, Befehlsfolge und SQL-Fragment gebundene Strukturausnahme |
| C-497: `INSERT` im selben RPC | Fehlerkennung: kuenftiger authenticated-Nutzerpfad, RLS wirkt erst beim Aufruf | dieselbe eng gebundene Strukturausnahme |
| C-498: `INSERT` in `allergen_aliases` | echte Katalogdaten, 3 Magnesiumstearat-Aliase | nach `05_user_tabellen/498_global_allergies_daten.sql` umgezogen |
| C-498: `INSERT` im Trigger `log_allergy_permission_change` | Fehlerkennung: kuenftiges, append-only Auditprotokoll; kein Einspielen | eng an Triggerfunktion und Zielfeld gebundene Strukturausnahme |
| C-498: Uebernahme aus `food_preferences.allergies` | echte einmalige Datenuebernahme, 2 Zeilen live | in denselben Kettenschritt umgezogen; danach struktureller `DROP COLUMN IF EXISTS` in eigener Migration |
| C-499: `UPDATE supplier_products` | echte Katalogstatus-Ableitung, 92.821 Zeilen | nach `13_supplements/499_deactivate_off_market_supplier_products_daten.sql` umgezogen |
| C-500: Zutatenzeilen-Evidenz | echte abgeleitete Katalogdaten, 1.409 Formen | nach `13_supplements/500_vitamin_e_form_evidence_daten.sql` umgezogen |
| C-500: NOW-Herstellerseiten-Evidenz | echte kuratierte Katalogdaten, 24 Formen | in denselben Kettenschritt umgezogen |

Keine Sollstanderhoehung und keine unbegruendete Ausnahme: Die beiden
Funktionsausnahmen pruefen Datei, Funktionsname, exakte Befehlsfolge und
Pflichtfragmente. Jeder weitere Schreibbefehl bleibt rot.

`migration-datenlogik-pruefen.mjs` ist wieder gruen: exakt 44 historische
Datenoperationen. Seine Selbstprobe hat eine temporaere neue Migration mit
`INSERT`, `UPDATE`, `COPY`, `DELETE`, `TRUNCATE`, `MERGE` und `DO ... INSERT`
jeweils erkannt; `FOR UPDATE` und `ALTER` bleiben korrekt ohne Befund.
