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
erledigt: 2026-09-08
commit: c685ea16
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

## Abschluss — 2026-09-16

Die Vollkette auf der frischen Wegwerf-Datenbank `g458_final` ist gruen:
`SCHEMA VOLLSTAENDIG`, `KETTE OK: 969.1s`. Die vier bestehenden
C-496--C-500-Integrationspruefungen bestehen dort ebenfalls mit 6/6 Tests.

Alle Waechter wurden einzeln ausgefuehrt, damit ein frueher Fehler keinen
spaeteren verdeckt. Gruen sind alle Gate-Statikwaechter einschliesslich
`migration-datenlogik-pruefen`, die Kern-/Kennungswaechter,
`serverimport-pruefen` sowie `turbo run typecheck test build` (18/18).
Rot bleiben ausschliesslich fremde Befunde:

| Waechter | Befund | Einordnung |
|---|---|---|
| `abwesenheit-pruefen` | 3 ueberholte Aussagen zu `training.routines`, `routine_exercises`, `routine_schedule_days` | G-444, in `apps/` und SSOT; nicht angefasst |
| `gefallene-spalten-pruefen` | 4 Leser der gefallenen Spalte `ebene` | bestehender C-484-Nachzug, nicht angefasst |
| `turbo run lint` | `apps/coach/src/components/draft/modale.tsx:529`, nicht maskiertes `"` | fremde App-Aenderung, nicht angefasst |
| `testdaten-pruefen` | exakt 15 bekannte aeltere Szenarioabweichungen | der im Auftrag genannte Altbefund; unveraendert |

Die Sicherung und die kompletten Laufprotokolle liegen unter `backup/`:
`20260916065959_g458_vorher.sql`, `_g458_vollkette_20260916.log`,
`_g458_alle_waechter_20260916.log` und
`_g458_korrigierte_waechter_20260916.log`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`migration-datenlogik-pruefen.mjs` selbst gelaufen:**

    exit 0
    "44 historische Datenoperationen, genau Sollstand 44;
     keine neue Datenlogik."

`[cmd]` **Vier neue Kettenschritte, richtig einsortiert:**

    05_user_tabellen/498_global_allergies_daten.sql
    13_supplements/496_supplier_product_nutrients_daten.sql
    13_supplements/499_deactivate_off_market_..._daten.sql
    13_supplements/500_vitamin_e_form_evidence_daten.sql

`[read]` **C-498 nach `05_user_tabellen`, weil die Allergien in
`public` liegen** ? **nach Schema sortiert, nicht nach
Punktnummer.**

### Die zwei Ausnahmen sind EXAKT gefasst

`[cmd]` **Im Waechter, je mit `requiredSql`:**

    c497   supplements.supplier_product_preference_write
           DELETE FROM nutrition.food_preference_items
           INSERT INTO nutrition.food_preference_items

    c498   coach.log_allergy_permission_change
           INSERT INTO coach.allergy_permission_change_log

`[read]` **Nicht *,,diese Datei ist ausgenommen"*, sondern
*,,diese FUNKTION mit GENAU DIESER Anweisung"*.**

`[read]` **Wer die Funktion aendert, faellt wieder durch.**

`[cmd]` **Und die Begruendung steht je Ausnahme:** *,,fuehrt
beim Einspielen keine Datenoperation aus; die bestehende RLS
entscheidet erst beim spaeteren Nutzeraufruf"*.

### Und die Zeilenerkennung wurde praeziser

`[cmd]` **Zeile 46-48:** *,,`FOR UPDATE` sperrt, schreibt aber
nicht; ebenso ist `ON DELETE` Teil einer
Fremdschluesseldefinition. Beide duerfen keinen Befund
erzeugen."*

`[read]` **Genau die Warnung aus meinem Auftrag** ?
**Schluesselwoerter zaehlen ist nicht Anweisungen zaehlen.**

### Die Gegenprobe

> *,,Temporaere Migrationen mit INSERT, UPDATE, COPY, DELETE,
TRUNCATE, MERGE und `DO ... INSERT` werden jeweils erkannt."*

`[read]` **Sieben Befehle, nicht einer.**

### Und A6 erfuellt

`[cmd]` **Alle Gate-Schritte einzeln gelaufen. Rot bleiben vier
FREMDE Befunde:**

    abwesenheit-pruefen        die drei G-444-Aussagen
    gefallene-spalten-pruefen  vier ebene-Lesestellen (C-484)
    Lint                       ein Anfuehrungszeichen in
                               apps/coach/modale.tsx:529
    testdaten-pruefen          die bekannten 15

`[read]` **Zwei davon kannte ich nicht** ?
`gefallene-spalten-pruefen` **und der Lint-Fehler.**

`[cmd]` **Als G-460 und G-461.**

**Abgenommen.**
