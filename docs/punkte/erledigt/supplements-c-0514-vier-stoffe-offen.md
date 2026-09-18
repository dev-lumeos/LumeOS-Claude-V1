---
nr: C-514
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-509
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 1a5d3539
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-18
---

# C-514 - vier Stoffe stehen im Katalog und sind offen

## Ergebnis

C-510 konnte keinen der vier Namen erreichen: Es verarbeitet ausschliesslich
`supplier_product_nutrient_name_mappings`; keiner der vier Namen war dort ein
Naehrwertlabel. C-505 verknuepfte ausserdem nur Zeilen mit `ist_wirkstoff`.

| DSLD-Name | Katalogbefund | Entscheidung | Ergebnis |
|---|---|---|---|
| Caffeine | eindeutig; C-515-Wurzel | C-515 hat die exakten Labels bereits verknuepft | 0 offen |
| Selenium | eindeutig; C-515-Wurzel | C-515 hat die exakten Labels bereits verknuepft | 0 offen |
| Glycerin | genau ein Ziel: `Glycerol (hyperhydration)` | exakte chemische Schreibvariante, rueckverknuepft | 25.085 Zeilen / 25.064 Produkte neu |
| Gelatin | ein technischer Alias, aber auf `Collagen peptides (hydrolyzed collagen)` | **offen**: Gelatin bezeichnet nicht sicher hydrolysierte Kollagenpeptide; Herkunft kann zudem Rind, Schwein oder Fisch sein | 35.966 Zeilen / 35.914 Produkte offen |

Nach C-514 tragen 815.461 Inhaltszeilen eine `supplement_id`; davon sind
25.230 Glycerin-Zeilen verknuepft. Die 145 als Wirkstoff markierten Glycerin-
Zeilen waren schon vor C-514 durch C-505 verknuepft. Die abgenommene C-515-
Referenz von 790.378 weicht um zwei Zeilen vom frischen, unmittelbar vor
C-514 herleitbaren Stand 790.376 ab; C-514 selbst hat exakt die 25.085 zuvor
offenen Nicht-Wirkstoff-Zeilen hinzugefuegt.

## Gegenprobe und Kette

- C-514-Schutztest auf `c516_final`: gruen.
- Zweiter Datenlauf: Glycerin-Links 25.230 vor/nachher; keine neue Zeile.
- Sicherung: `backup/schema/20260918041858_c43_vor_kettenlauf.sql`.
- Vollkette: gruen, 246 Schritte, 1.259,1 s, `SCHEMA VOLLSTAENDIG`.

## Abnahme

**2026-09-08, Orchestrator. Gemessen ? NICHT live.**

`[cmd]` **In der laufenden Datenbank: 790.378 verknuepft,
Glycerin 132 von 26.080.**

`[cmd]` **Er meldet 815.461 und 25.085 Zeilen** ? **aus der
Vollkette, nicht aus der laufenden Datenbank.**

`[read]` **Er schreibt *,,in der frischen Vollkette geprueft"*,
nicht *,,live eingespielt"* ? **das ist ehrlich.**

`[cmd]` **Der Kettenschritt liegt vor:**
`514_existing_catalog_exact_backlinks.sql`.

### Gelatin bleibt offen, begruendet

> *,,Gelatin bleibt korrekt offen: der technische Alias fuehrt
zu hydrolysierten Kollagenpeptiden, was keine sichere
Gleichsetzung ist."*

`[read]` **Genau die Frage aus meinem Auftrag** ? **und die
Antwort ist: mehrdeutig, also nicht verknuepfen.**

`[cmd]` **40.651 Produkte enthalten Gelatin** ? **sie bleiben
Kandidaten.**

**Abgenommen, Einspielen steht aus.**

## Nachtrag: LIVE eingespielt, 2026-09-08

`[cmd]` **Selbst nachgemessen:**

    verknuepft   815.463 von 3.000.982  (vorher 790.378)
    Glycerin      25.230 Zeilen, 25.195 Produkte
    Gelatin          176 von 40.651 -- bleibt offen

`[cmd]` **Die 14 Mappings sind da:**

    {Cholesterol}, Cholesterol, Cholesterols,
      Total Cholesterol            -> CHORL
    Monounsaturated, Monounsaturated {Fat},
      Monounsaturated Fat, Monounsaturated Fats,
      Monounsaturated Fatty Acids  -> FAMS
    Polyunsaturated {Fat}, Polyunsaturated Fat,
      Polyunsaturated Fatty Acids  -> FAPU
    Insoluble Fiber                -> FIBINS
    Soluble Fiber                  -> FIBSOL

`[read]` **Die Schreibvarianten sauber zusammengefuehrt** ?
**vier Schreibungen von Cholesterin, fuenf von
einfach ungesaettigt.**

`[cmd]` **Und die Probe lief transaktional:** *,,Produkt mit
10 mg CHORL pro Softgel ergibt bei zwei Portionen 20 mg CHORL
im Snapshot"* ? **nach ROLLBACK ist der Testnutzer weg.**

`[cmd]` **Sicherung:**
`backup/schema/20260918175140_c514_c516_vor_einspielen.sql`
