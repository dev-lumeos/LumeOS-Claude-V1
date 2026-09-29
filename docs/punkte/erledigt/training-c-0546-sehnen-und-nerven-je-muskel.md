---
nr: C-546
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
erledigt: 2026-09-28
commit: 4972b27e
braucht: []
kind_von: null
entscheidung: E-90
agent: codex
beauftragt: 2026-09-27
beruehrt:
  tabellen:
    - training.muscle_groups
  dateien:
    - supabase/migrations/20260927043000_c546_muscle_anatomy.sql
zahlen:
  gemessen: 2026-09-27
  katalogknoten: 112
  davon_kanonisch: 108
  mit_anatomiefakt: 23
  ohne: 89
  urspruenge: 20
  ansaetze: 21
  nerven: 23
  ausstrahlungsmuster: 0
---

# C-546 - Sehnen und Nerven je Muskel

## Toms Vorgabe

Tom, 2026-09-08:

> vastus medialis hat sehnenansaetze
> vastus medialis painpoints
> vastus medialis nerven, welche vielleicht ausstrahlen oder
> taubheitsgefuehle

## Was heute fehlt

`[cmd]` **Keine Tabelle zu Nerven, Sehnen oder Schmerzpunkten -
gemessen ueber `information_schema`.**

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
medialis** - **sie ist `(Nutzer, Muskel, Zeitpunkt) -> Wert`.**

`[read]` **Und ihr habt es schon einmal richtig gemacht:
`recovery.muscle_recovery_profiles` hat 112 Zeilen - eine je
MUSKEL, nicht je Nutzer.** **Das ist eine Faktentabelle.**

## Painpoint ist zwei Sachen

    Triggerpunkt   wo ein Muskel typischerweise Schmerz
                   projiziert  -> Fakt
    Toms Schulter  wo es ihm heute wehtut  -> Beobachtung

`[read]` **Beide braucht es - aber getrennt.** **Der Fakt
erklaert die Beobachtung.**

## Die Quelle

`[cmd]` **FIPAT TA2 - dieselbe Terminologie wie in C-530 und
C-531.**

`[cmd]` **112 Katalogknoten sind endlich; Anatomie aendert sich
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

## Toms Hinweis macht diesen Punkt zur Voraussetzung

Tom, 2026-09-08:

> an painpoints koennen allfaellige injektionspunkte unter die
> haut fuer peptide sein, sprich als beispiel bpc 157/tb500

`[read]` **Ein Schmerz sitzt am SEHNENANSATZ, im MUSKELBAUCH
oder am NERV** - **wer eine lokale Gabe setzen will, muss
wissen, WORAN es liegt.**

`[cmd]` **`recovery.checkins` traegt heute 370 Zeilen; alle 370
haben leere `pain_areas` und sind unverknuepft.**

`[read]` **Ohne Sehnen und Nerven bleibt *Knie tut weh* eine
Koordinate auf einem Bild.**

`[cmd]` **Das hebt die Dringlichkeit: von *mittel* auf *hoch*.**

## Bericht

`[read]` **Quellenentscheidung:** FIPAT TA2 ist die verbindliche
Terminologie und Hierarchie, aber keine belastbare Quelle fuer die
konkreten Ursprung-, Ansatz- und Nervenrelationen. Diese Fakten sind
deshalb einzeln mit anatomischen Fachquellen aus NCBI
Bookshelf/StatPearls belegt. Ausstrahlungsmuster wurden nicht aus
Muskelname oder Koerperregion abgeleitet.

`[cmd]` **Gebaut wurden vier getrennte Faktrelationen:**
`muscle_origins`, `muscle_insertions`, `muscle_innervations` und
`muscle_pain_referrals`, jeweils mit Quellenbezug. Alias-Knoten sind
technisch ausgeschlossen; nur kanonische Muskeln duerfen Fakten
tragen.

`[cmd]` **Beobachtungen sind getrennt:**
`recovery.muscle_symptom_observations` speichert
`(Nutzer, Muskel, Zeitpunkt, Symptom, Staerke)`. Der Fokus ist
Muskelbauch, Ursprung, Ansatz, Nerv oder unbekannt. Bei Ursprung,
Ansatz oder Nerv erzwingen zusammengesetzte Fremdschluessel, dass
der konkrete Fakt zum selben Muskel gehoert.

`[cmd]` **Belegte Abdeckung:** 23 von 112 Katalogknoten tragen
mindestens einen Anatomiefakt; 89 tragen nichts. Eingespielt sind
20 Urspruenge, 21 Ansaetze und 23 Nervenrelationen. Es gibt bewusst
0 Ausstrahlungsmuster, weil die gewaehlten Quellen sie nicht
systematisch belegen. Der Katalog enthaelt 108 kanonische Knoten,
davon 77 Blaetter; die 112 sind also nicht 112 einzelne Muskeln.

`[cmd]` **Gegenprobe:** Vastus Medialis traegt je einen belegten
Ursprung, Ansatz und Nerv. Brachioradialis traegt 0/0/0/0 und keinen
Platzhalter.

`[cmd]` **Bestehende Beobachtungen:** Die 370 Check-ins wurden
nicht umgedeutet oder veraendert; ihre `pain_areas` sind leer. Die
neue Beobachtungstabelle startet leer.

`[cmd]` **Sicherheit:** Fakten sind fuer angemeldete Nutzer nur
lesbar und nur durch `service_role` pflegbar. Beobachtungen haben
RLS fuer eigene Zeilen. Ein Verhaltenstest mit zwei Nutzern belegt:
der angemeldete Nutzer sieht nur seine zwei Zeilen und kann keine
Zeile fuer den anderen Nutzer anlegen. `anon` hat keine Rechte.

`[cmd]` **Sicherung:**
`backup/schema/20260927111500_c546_vor_bau.dump`, 473.965.860 Byte,
SHA-256
`4B4787B10BE6C96D4D539D3DF5630197B831669988E813E5127372D3FC16FBA3`.

`[cmd]` **Nachweis:** Vollkette mit 281 Schritten und
Schema-Abschlusspruefung gruen. C-546 ist auf Neuaufbau und
Live-Abbild je 6/6 gruen; auf dem Live-Abbild bleiben 370 Check-ins
unveraendert. Die kombinierten Trainingstests C-490/C-543/C-551/C-546
sind gruen. Migration-Kette, Datenlogik- und Encoding-Waechter sind
gruen.

## Abnahme

_(Orchestrator, 2026-09-28 — einen Tag zu spaet. Der Punkt stand seit
dem 27.09. mit vollem Bericht und leerer Abnahme in `laufend_codex`.
Mein Versaeumnis.)_

### A1 und A2 sind strukturell belegt

`[cmd]` **Fuenf eigene Relationen, keine Spalten am Muskel**
(`20260927043000_c546_muscle_anatomy.sql`):

    training.anatomy_sources                 Zeile   3
    training.muscle_origins                  Zeile  21
    training.muscle_insertions               Zeile  32
    training.muscle_innervations             Zeile  43
    training.muscle_pain_referrals           Zeile  55
    recovery.muscle_symptom_observations     Zeile 102

`[cmd]` **Fakt und Beobachtung liegen in verschiedenen Schemas** —
Anatomie in `training`, Beobachtung in `recovery`. Die Beobachtung
traegt `user_id → public.profiles(id) ON DELETE CASCADE`, die
Faktentabellen tragen keinen Nutzerbezug. **Die Trennung ist nicht
nur benannt, sie ist erzwungen.**

`[cmd]` **Jeder Fakt braucht eine Quelle:** vier mal
`source_id text NOT NULL REFERENCES training.anatomy_sources(id)
ON DELETE RESTRICT`. Eine Zeile ohne Quelle ist nicht speicherbar.

### A5 — die Alias-Sperre ist echt, und ich habe sie nachgelesen

`[cmd]` **`training.require_canonical_muscle_reference()`
(Zeile 67-86) wirft `ERRCODE 23514`, wenn der referenzierte Muskel
NICHT selbst kanonisch ist** — die Bedingung ist
`NOT EXISTS (… AND muscle.canonical_muscle_group_id IS NULL)`, und
ein Alias-Knoten traegt dort seinen kanonischen Verweis, ist also
nicht NULL. **Vier Trigger haengen daran** (Zeile 89-100), einer je
Faktrelation.

`[cmd]` **Und die ,,gleicher Muskel"-Erzwingung ist ein
zusammengesetzter Fremdschluessel, keine Prosa** (Zeile 127-131):
`FOREIGN KEY (origin_id, muscle_group_id) REFERENCES
training.muscle_origins(id, muscle_group_id)`, ebenso fuer
`insertion_id`. Eine Beobachtung kann nicht auf den Ansatz eines
anderen Muskels zeigen.

### Was ich NICHT nachgerechnet habe

`[read]` **Die Zahlen 23 von 112, 20/21/23, 0 Ausstrahlungsmuster,
108 kanonische Knoten und 6/6 gruen sind nicht von mir gemessen.**
Sie brauchen einen Kettenlauf gegen eine Wegwerf-Datenbank; den
starte ich nicht, waehrend Codex gegen denselben Server arbeitet.
**Festgehalten als offener Nachweis in C-555.**

`[read]` **Die 0 Ausstrahlungsmuster sind die ehrlichste Zahl im
Bericht.** Tom hat Ausstrahlung ausdruecklich verlangt, die Tabelle
steht leer da, und der Bericht sagt warum: die gewaehlten Quellen
belegen sie nicht systematisch. **Eine leere Tabelle mit Begruendung
ist richtig; geratene Muster waeren der Fehler gewesen.** Was fehlt,
ist der Punkt, der die Quelle dafuer sucht — siehe C-555 A3.

`[cmd]` **Die behauptete Sicherung ist nicht mehr da** (Tom hat
`backup/` geleert). Kein Fund gegen Codex.

### Ein Nebenbefund, der zwei Module beruehrt

`[cmd]` **Diese Trigger werfen `ERRCODE 23514`.** `[cmd]` Und
`apps/web/src/lib/profile/zielwerte-write.ts:31` filtert in
`hindernisAusFehler()` genau darauf: `if (error.code !== '23514')
return null`. **Heute kollidiert das nicht** — die Anatomietabellen
sind nur fuer `service_role` schreibbar, `apps/` schreibt sie nicht.
`[read]` **Aber ein Fehlercode ist kein Fehlergrund.** Wer die
Hindernissatz-Zuordnung je verallgemeinert, bekommt fuer eine
Anatomieverletzung einen Satz ueber Phasen. **In C-555 A4 vermerkt.**

### Nebenbefund zum Commit

`[cmd]` **Dieser Punkt kam unter `4972b27e` herein, Betreff
`goals(G-523, G-529, G-526)`** — der Betreff nennt ihn nicht.
Dasselbe bei C-551. **Der Commit-Betreff ist kein Signal dafuer, was
erledigt wurde.**
