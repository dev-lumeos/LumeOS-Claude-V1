---
nr: C-489
typ: fehler
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-488
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 25364531
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
  zeilen: 214780
---

# C-489 — der Produktname ist englisch und heisst `name`

## Toms Befund

Tom, 2026-09-08:

> ich sehe supplement/supplier_products nur eine spalte name und
> da sind englische begriffe drin. denke diese spalte in name_en
> umbenennen und die anderen sprachspalten zumindest anlegen,
> falls wir spaeter deutsche produkte oder thaiprodukte haben.

> supplement/supplier kann als name bleiben, da es ein firmenname
> ist.

## Der Befund stimmt

`[cmd]` **`supplier_products.name`, drei Beispiele:**

    B-2 100 mg
    B-6 100 mg
    C-1000 mg With Protective Bioflavonoids And Wild Rose Hips

`[read]` **Englisch, aus DSLD** ? **214.780 Zeilen.**

`[cmd]` **C-488 hat gerade 32 Thai-Spalten nachgezogen** ?
**diese hier nicht, weil sie nicht `name_de` heisst.**

`[read]` **Der Waechter sucht `_de$`** ? **eine Spalte, die
einfach `name` heisst, faellt durch.**

## Und die Unterscheidung ist richtig

`[read]` **`suppliers.name` bleibt** ? **ein Firmenname wird
nicht uebersetzt.**

`[cmd]` **`Vitamin World, Inc.` heisst in Thailand auch so.**

`[read]` **Ein Produktname schon** ? **ein thailaendisches
Praeparat traegt einen thailaendischen Namen.**

## Was zu tun ist

**1** ? **`name` -> `name_en`.**

`[cmd]` **58 Treffer im Baum** ? **der groesste Teil in
`485_dsld_import.py`.**

`[read]` **Miss, welche davon die SPALTE meinen und welche etwas
anderes** (`suppliers.name`, `supplement_name_snapshot`).

**2** ? **`name_de` und `name_th` anlegen, LEER.**

Tom: *,,zumindest anlegen, falls wir spaeter deutsche produkte
oder thaiprodukte haben."*

`[read]` **Keine Uebersetzung** ? **wie in C-488.**

**3** ? **Die Leseseite.**

`[cmd]` **`apps/` hat Treffer** ? **Claude Code arbeitet dort an
G-438.**

`[read]` **Miss, welche und melde sie** ? **NICHT anfassen.**

`[read]` **Wenn die Umbenennung die Oberflaeche bricht, ist das
derselbe Fall wie C-484/G-435: du baust, er zieht nach.**

## Und `marke`

`[cmd]` **`marke` ist in allen 214.780 Zeilen gefuellt** ?
`Vitamin World`, `Now Foods`.

`[read]` **Eine Marke wird auch nicht uebersetzt** ? **sie bleibt
wie sie ist.**

## Abnahmebedingungen

    A1  name -> name_en, alle 58 Treffer geprueft.
        Welche meinten die Spalte? TABELLE.
    A2  name_de und name_th angelegt, LEER.
    A3  KEINE Uebersetzung eingefuegt.
    A4  suppliers.name und marke unveraendert.
    A5  was in apps/ bricht: gemeldet, NICHT gebaut.
    A6  der Sprachwaechter bleibt GRUEN.
    A7  Struktur nach migrations/, Daten in _pipeline/.
    A8  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**`suppliers.name` NICHT anfassen** ? **Firmenname.**

**`marke` NICHT anfassen** ? **Markenname.**

**`apps/` nicht anfassen** ? **melden, was bricht.**

Nicht committen, nicht stagen, nicht pushen.

## Bericht

### Ergebnis

`supplements.supplier_products.name` ist zu `name_en` geworden.
`name_de` und `name_th` sind vorhanden und in allen 214.780 DSLD-Produkten leer. Es wurde keine Uebersetzung geschrieben.

### A1 — die 58 Treffer

Die 58 breiten `name`-Treffer wurden einzeln nach ihrer Bedeutung geprueft. Nur folgende Stellen meinten die Produktspalte:

| Stelle | meint `supplier_products.name`? | Ergebnis |
| --- | --- | --- |
| C-467-Schema und `create_supplier_product` | ja | Committete Migration unveraendert; C-489 benennt die Spalte um und ersetzt die RPC mit Zielspalte `name_en`. |
| C-485-Constraint | ja | Constraint bei der Umbenennung zu `supplier_products_name_en_check` umbenannt. |
| `485_dsld_import.py` | ja | Staging-Feld, COPY-Kopf, INSERT-Ziel, SELECT und Feldherkunft auf `name_en` umgestellt. |
| C-466-Lesefunktion `nutrient_intake_detail_for_day` | ja | Sie liest nun `sp.name_en`; der C-466-Test ist gruen. |
| C-466-Testfixture | ja | INSERT-Feld auf `name_en` umgestellt. |
| C-467-Testargument `p_product_name` | nein | RPC-Parameter, keine Tabellen- oder Ergebnisfeldreferenz; bleibt fachlich korrekt. |
| `suppliers.name` | nein | Firmenname; unveraendert. |
| `supplement_name_snapshot` | nein | Historischer Text am Einnahmelog, kein Lieferproduktfeld; unveraendert. |
| weitere `name`-Felder, Kommentare und Dokumentation | nein | Andere Objekte bzw. Text, keine Aenderung. |

Die bestehende DSLD-Herkunft wurde ebenfalls nachgezogen: 214.780 Produkt-Feldquellen heissen jetzt `name_en`, keine mehr `name`.

### A2 bis A4 — Sprach- und Markenfelder

Die Strukturmigration `20260913001900_c489_produktname_name_en.sql` benennt die Spalte um und legt `name_de text` sowie `name_th text` an. Der Frischaufbau misst: 214.780 Produkte, 214.780 `name_en`, 0 nichtleere `name_de`, 0 nichtleere `name_th`, 214.780 nichtleere `marke`.

`suppliers.name` existiert unveraendert weiter; `marke` wurde weder umbenannt noch beschrieben. Keine Uebersetzung wurde eingefuegt.

### A5 — Leseseite

`rg -F supplier_products apps/web apps/coach` hat **keinen direkten Treffer** ergeben. Die vorhandenen App-Treffer fuer `supplement_name_snapshot` gehoeren zu `supplements.intake_logs` und sind nicht vom Feldwechsel betroffen. `apps/` wurde nicht angefasst; es gibt daher keinen nachzuziehenden Oberflaechenvertrag zu melden.

### A6 — Waechter

`node tools/sprachspalten-pruefen.mjs` gegen `lumeos_c489_vollkette_final`: gruen, 128 `_de`-Spalten und drei begruendete interne Ausnahmen. Der neue C-489-Test prueft zudem Spalten, Leere der DE/TH-Werte, erhaltenen Firmen-/Markennamen und die DSLD-Feldherkunft; gruen. Die Datenlogik-Selbstprobe ist gruen.

Die erneuerte Schreib-RPC aus C-467 ist im Datenlogik-Waechter als enge Strukturausnahme benannt: vier konkrete INSERTs innerhalb von `create_supplier_product`, die erst bei einem Service-RPC-Aufruf schreiben, nicht beim Einspielen der Migration. Alle absichtlich eingebauten neuen DML-Proben werden weiter rot erkannt.

### A7 — Trennung Struktur/Daten

Struktur liegt in der C-489-Migration. Die bestehende DSLD-Importstufe schreibt neue Produkte direkt mit `name_en`; die nummerierte Pipeline-Stufe `13_supplements/489_produktname_name_en.sql` zieht vorhandene DSLD-Feldherkunft von `name` auf `name_en` nach. Im Frischaufbau war sie idempotent (`UPDATE 0`), im Live-Nachzug wurden 214.780 Feldherkunftszeilen umgestellt.

### A8 — Sicherung und Lauf

Vor dem Live-Nachzug wurde `backup/data/20260913000500_c489_vor_live.dump` erstellt. Die Vollkette mit 205 Schritten lief auf der behaltenen Wegwerf-Datenbank `lumeos_c489_vollkette_final` vollstaendig gruen in 929,6 Sekunden; die Abschlusspruefung meldet `SCHEMA VOLLSTAENDIG`. Der DSLD-Import lief darin mit 214.780 Produkten und 3.000.982 Inhaltszeilen.

`node tools/punkte-pruefen.mjs` ist gruen (25 Befunde, Soll 25), `git diff --check` ohne Fehler. `pnpm gate` erreicht danach die bekannte, fremde G-261-Abweichung in `zwei-wahrheiten-pruefen` (7 statt Soll 6 Naehrstoffspalten) und stoppt vor dem Sprachwaechter; C-489-Test, Sprachwaechter und Datenlogik-Waechter wurden deshalb direkt erfolgreich ausgefuehrt. Nichts wurde committed, gestaged oder in `apps/` geaendert.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    name_en gefuellt   214.780 von 214.780
    name_de gefuellt   0
    name_th            angelegt, leer
    marke              214.780, unveraendert
    suppliers.name     unveraendert
    Vollkette          205 Schritte, 929,6 s

`[cmd]` **Selbst gemessen: alle fuenf.**

`[cmd]` **Beispiel:** `Vitamin World | B-2 100 mg` ? **Marke und
Produktname getrennt.**

### Keine Lesestelle in apps/

> *,,Keine direkte `supplier_products`-Lesestelle in `apps/`;
Apps nicht angefasst."*

`[read]` **Die Oberflaeche liest die Tabelle noch nicht** ?
**C-467 hat sie gebaut, C-485 gefuellt, niemand zeigt sie.**

`[read]` **Die Umbenennung war deshalb folgenlos** ? **das ist
Glueck, kein Verdienst, und er hat es gemessen statt
angenommen.**

### Und G-261 zum dritten Mal

`[cmd]` **`pnpm gate` stoppt am `fiber_g`-Befund aus C-464** ?
**G-439, ein Sollstandeintrag.**

`[read]` **Dreimal richtig als fremd erkannt.**

**Abgenommen.**

