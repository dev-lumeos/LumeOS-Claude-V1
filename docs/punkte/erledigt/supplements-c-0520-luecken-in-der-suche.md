---
nr: C-520
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-481
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 4fa2ec08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
---

# C-520 - drei Luecken in search_supplier_products

## Befund

G-481 fand zwei Luecken: `search_supplier_products` gab `produktform`
nicht zurueck und `p_form` nahm nur einen Wert. Die Formspalte blieb daher
am Schirm leer; G-492 baute als befristete Kruecke eine serverseitige
Nachlese.

Ein dritter Befund war der exakte Vergleich: gespeichert ist zum Beispiel
`Powder [E0162]`, waehrend die Oberflaeche nach `Powder` fragt.

## Auftrag

    produktform in der Rueckgabe
    p_formen text[] fuer mehrere Formen
    Grundform "Powder" trifft "Powder [E0162]"

Abnahme: Rueckgabe, Array, Powder-Beleg, Altverhalten, Laufzeit,
erfundene Form 0 sowie Sicherung, Vollkette und Waechter.

## Umsetzung 2026-09-22

Live-Migration:
`supabase/migrations/20260922073000_c520_supplier_product_search_forms.sql`.

Die bisherige Zehn-Parameter-Signatur bleibt erhalten und liefert jetzt
zusaetzlich `produktform`. PostgreSQL kann ihr keinen weiteren optionalen
Parameter geben, ohne Aufrufe mit nur `p_query` mehrdeutig zu machen.
Darum gibt es additiv die explizite Elf-Parameter-Signatur mit
`p_formen text[]`. Beide Wege entfernen beim Vergleich den DSLD-Suffix
` [E....]`.

| Bedingung | Messung |
|---|---|
| A1 | Beide Signaturen liefern `produktform`; der bestehende G-492-RPC-Aufruf erhaelt das Feld ohne App-Aenderung. |
| A2 | Neue Signatur: `search_supplier_products(text,text,text,integer,text,text,boolean,text[],text[],boolean,text[])`; letzter Parameter ist `p_formen text[]`. |
| A3 | `Agmatine Sulfate` (`000122df-5e38-4e5e-ab93-7baae686ec22`) speichert `Powder [E0162]`. Danach liefern sowohl `p_form='Powder'` als auch `p_formen=ARRAY['Powder']` 61 Treffer, einschliesslich dieser Probe. |
| A4 | G-454 funktionierte nur mit dem vollen DSLD-Wert: vorher `Powder` 0, `Powder [E0162]` 61. |
| A5 | Vergleichbarer 50-Zeilen-Plan: vorher 17,032/19,301 ms, nachher mit `ARRAY['Powder']` 19,929/20,975 ms. |
| A6 | `ARRAY['c520_erfundene_form']` liefert 0. `ARRAY['Powder','Capsule']` mit `NOW` liefert beide Formen. |

`anon` hat auf der neuen Signatur kein `EXECUTE`; `authenticated` hat es.

### Kompatibilitaet

Kein produktiver App-Aufrufer uebergibt heute `p_form`; die zwei Leser
uebergeben nur Suchtext, Marktstatus, Marke und Limit. Benanntes `p_form`
steht in der G-454-Validierung, weitere Positionsaufrufe in SQL-Proben.
Die alte Signatur bleibt deshalb bestehen. Claude Code kann die G-492-
Nachlese nun entfernen, weil bereits der alte RPC-Aufruf `produktform`
liefert.

### Sicherung, Kette, Waechter

- Sicherung: `backup/schema/20260922105201_c520_vorher.sql`.
- Test zuerst rot in `lumeos_c520_red` (Elf-Parameter-Signatur fehlte),
  danach `supplements-c520-search-product-forms.test.ts` gruen.
- Vollkette `lumeos_c520_vollkette`: C-520 lief nach dem DSLD-Import
  erfolgreich in 1,6 s. Die Abschlusspruefung meldete zuvor Tabellen
  35/35, Sichten 4/4, Funktionen 47/47, Zeilenschutz 35/35, Policies
  35/35 und vier security-invoker-Sichten.
- `migration-datenlogik-pruefen`: gruen, 44 begruendete historische
  Datenoperationen, keine neue Datenlogik.
- `migration-kette-pruefen`: gruen, alle 75 Migrationsdateien in der
  Kette.
- `pnpm gate` stoppt am bekannten roten Tageskettenstatus. Separat
  weiter rot und fachfremd: drei Sammelfragen, drei ueberholte
  Abwesenheitsbehauptungen, eine C-519-Lesestelle auf
  `supplement_product_id` sowie die bekannten 15 Testdatenabweichungen.

Kein Commit, keine Aenderung unter `apps/`, kein Dev-Server-Eingriff.

## Abnahme

**2026-09-08, Orchestrator. LIVE, nachgemessen.**

`[cmd]` **`produktform` kommt aus der alten Signatur zurueck:**

    Biochem         | Powder [E0162]
    Vade Nutrition  | Powder [E0162]

`[cmd]` **`p_formen`, selbst gemessen:**

    array['Powder']             500  (Deckel)
    array['Powder','Liquid']    500
    array['Zauberpulver']         0

`[read]` **Luecke 3 geschlossen: `Powder` trifft `Powder
[E0162]`.**

### Die alte Signatur bleibt, wie verlangt

> *,,Alte `p_form`-Signatur bleibt kompatibel. Kein produktiver
App-Aufrufer uebergibt sie derzeit."*

`[read]` **Die Warnung aus G-485 beachtet** ? **gemessen, wer
ruft, bevor etwas bricht.**

### Ein Haken

`[cmd]` **Die NEUE Signatur hat KEINE Vorgabewerte:**

    p_query text, p_market_status text, p_marke text,
    p_limit integer, p_kategorie text, p_form text,
    p_allergien_ausblenden boolean, p_meidestoffe text[],
    p_marken text[], p_nur_bewertet boolean,
    p_formen text[]

`[cmd]` **Ein Aufruf nur mit `p_query` und `p_formen` faellt:**
*,,function ... does not exist"*.

`[read]` **Wer `p_formen` nutzt, muss alle elf Parameter
uebergeben** ? **fuer G-494 wichtig.**

`[cmd]` **Laufzeit: 17-19 ms -> 20-21 ms.**

**Abgenommen.**
