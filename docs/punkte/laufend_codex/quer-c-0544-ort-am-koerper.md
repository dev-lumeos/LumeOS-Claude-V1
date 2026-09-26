---
nr: C-544
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
agent: codex
beauftragt: 2026-09-26
beruehrt:
  tabellen: [medical.injection_sites]
zahlen:
  gemessen: 2026-09-08
---

# C-544 - der Ort am Koerper als Begriff

## Die Frage

`[read]` **Eine Injektionsstelle haengt nicht immer an einem
Muskel.**

    AAS       intramuskulaer  -> die Stelle IST ein Muskel
    Peptide   subkutan        -> die Stelle ist FETT

Tom, 2026-09-08: *,,wir muessen auch das bauchfett und
painpoints/injektionspunkte fuer die peptides kennen"*

## Der Befund

`[cmd]` **Gemessen - es gibt sieben Injektionstabellen:**

    medical.injection_sites                      16
    medical.injection_needle_recommendations      8
    medical.injection_tissue_condition_guidance   1
    medical.injection_site_conditions             0
    medical.injection_logs                        0
    medical.injection_site_overrides              0
    medical.user_injection_site_selections        0

`[cmd]` **`injection_sites` traegt `route`, `body_view`,
`x_pct`, `y_pct`, `needle_gauge`, `needle_length_in`,
`minimum_rest_days`, `rotation_distance_mm`, `max_volume_ml`.**

`[cmd]` **Aber KEIN Fremdschluessel auf `muscle_groups`.**

`[read]` **Die Stelle kennt ihre Koordinate auf dem BILD, nicht
ihren Muskel.**

## Was daraus folgt

    Ort am Koerper
      ist ein Muskel        Vastus medialis
      ist ein Fettdepot     Bauch, Oberschenkel aussen
      ist eine Landmarke    Knochenpunkt fuer die Stelle

`[cmd]` **Und `public.koerperflaechen` hat 51 Zeilen, davon 33
mit Muskel** - **die 18 ohne sind vielleicht keine Luecke,
sondern genau diese anderen Orte. MISS es.**

## Abnahmebedingungen

    A1  die 16 Stellen: welche sind Muskel, welche
        Fettdepot, welche Landmarke? TABELLE.
    A2  eine Stelle kennt ihren Ort. Fremdschluessel.
    A3  die 18 Koerperflaechen ohne Muskel: gemessen
        und eingeordnet.
    A4  ein subkutaner Ort ohne Muskel ist moeglich.
        Belegt.
    A5  bestehende Stellen unveraendert.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
