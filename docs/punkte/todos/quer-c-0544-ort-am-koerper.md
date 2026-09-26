---
nr: C-544
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
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

`[cmd]` **Gemessen ? es gibt sieben Injektionstabellen:**

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
mit Muskel** ? **die 18 ohne sind vielleicht keine Luecke,
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

## Toms Hinweis, 2026-09-08 ? der Painpoint wird ein Ziel

> wenn wir soweit sind und im checkin/recovery painpoints
> deklarieren koennen, muessen wir beachten, dass an
> painpoints allfaellige injektionspunkte unter die haut fuer
> peptide sein koennen, sprich als beispiel bpc 157/tb500

### Was schon da ist

`[cmd]` **Gemessen:**

    recovery.checkins.pain_areas     370 Zeilen liegen vor
    medical.symptoms                  34
    medical.injection_sites           im: 10 | sc: 6
    supplements.supplements
      BPC-157                         Evidenzgrad E
      TB-500 (Thymosin b-4 Fragment)  E
      Thymosin beta-4 (full)          D
      Thymosin alpha-1                B

`[read]` **Die Schmerzangabe ist nicht neu ? sie ist
unverknuepft.**

### Was das strukturell heisst

    heute   Painpoint = Beobachtung, Sackgasse
    mit     Painpoint -> Ort am Koerper
            -> subkutane Injektionsstelle

**1** ? **Die feste Liste reicht nicht.**

`[cmd]` **Die 16 Stellen sind vorgegeben, mit `x_pct`/`y_pct`
auf dem Bild.**

`[read]` **Eine lokale Peptidgabe zielt auf *die Achillessehne
rechts*, nicht auf *Gluteus*** ? **`injection_sites` braucht
eine zweite Art: die Stelle, die aus einem Painpoint
entsteht.**

**2** ? **Die Aufloesung muss feiner sein als der Muskel.**

`[read]` **Ein Schmerz sitzt am SEHNENANSATZ, im MUSKELBAUCH
oder am NERV** ? **genau die drei Dinge aus C-546.**

`[read]` **Damit ist C-546 Voraussetzung, nicht Beiwerk.**

**3** ? **E-89 gilt.**

`[cmd]` **Wo man spritzen KANN, ist Anatomie ? offen.**
**Was und wieviel, ist Protokoll ? gesperrt.**

### Fuer diesen Punkt

`[read]` **Der Begriff *Ort am Koerper* muss tragen, dass ein
Ort AUS EINER BEOBACHTUNG entsteht** ? **nicht nur aus dem
Katalog.**

`[cmd]` **Zusaetzliche Abnahmebedingung: A7 ? eine Stelle,
die kein Katalogeintrag ist, sondern an einem Painpoint haengt,
ist moeglich. Bauform begruendet.**

