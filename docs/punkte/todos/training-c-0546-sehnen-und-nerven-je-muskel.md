---
nr: C-546
typ: feature
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
beruehrt:
  tabellen: [training.muscle_groups]
zahlen:
  gemessen: 2026-09-08
---

# C-546 - Sehnen und Nerven je Muskel

## Toms Vorgabe

Tom, 2026-09-08:

> vastus medialis hat sehnenansaetze
> vastus medialis painpoints
> vastus medialis nerven, welche vielleicht ausstrahlen oder
> taubheitsgefuehle

## Was heute fehlt

`[cmd]` **Keine Tabelle zu Nerven, Sehnen oder Schmerzpunkten
? gemessen ueber `information_schema`.**

`[cmd]` **`muscle_groups` traegt: `name`, `body_region`,
`display_order`, `parent_id`, `name_display_en`,
`canonical_muscle_group_id`.**

## Die Trennung, die entscheidend ist

    FAKT ueber den Koerper      gilt fuer jeden
      Ursprung und Ansatz
      versorgender Nerv
      Ausstrahlungsmuster (wohin projiziert er)

    BEOBACHTUNG ueber EINEN     gilt fuer ihn, heute
      Muskelkaterstaerke
      Schmerz
      Taubheitsgefuehl

`[read]` **Muskelkaterstaerke ist KEINE Eigenschaft des Vastus
medialis** ? **sie ist `(Nutzer, Muskel, Zeitpunkt) -> Wert`.**

`[cmd]` **Und ihr habt es schon einmal richtig gemacht:
`recovery.muscle_recovery_profiles` hat 112 Zeilen ? eine je
MUSKEL, nicht je Nutzer.** **Das ist eine Faktentabelle.**

## Painpoint ist zwei Sachen

    Triggerpunkt   wo ein Muskel typischerweise Schmerz
                   projiziert  -> Fakt
    Toms Schulter  wo es ihm heute wehtut  -> Beobachtung

`[read]` **Beide braucht es ? aber getrennt.** **Der Fakt
erklaert die Beobachtung.**

## Die Quelle

`[cmd]` **FIPAT TA2 ? dieselbe, die C-530 und C-531 benutzt
haben.**

`[cmd]` **112 Muskeln sind endlich; Anatomie aendert sich
nicht.**

## Abnahmebedingungen

    A1  je Eigenschaft eine eigene Relation, nicht
        Spalten am Muskel. Begruendet.
    A2  FAKT und BEOBACHTUNG sind getrennt. Belegt.
    A3  wie viele der 112 lassen sich belegen, wie
        viele nicht? Zahl.
    A4  die Reste GEMELDET, nicht geraten.
    A5  Gegenprobe: ein Muskel ohne Beleg traegt NICHTS,
        keinen Platzhalter.
    A6  Sicherung, Vollkette, ALLE Waechter.
