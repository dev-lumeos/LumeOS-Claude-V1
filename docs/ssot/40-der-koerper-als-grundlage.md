# Der Koerper als Grundlage aller Module

**Konzept, 2026-09-08.** Entscheidung: E-90.

`[read]` **Dieses Dokument traegt das Konzept.** **Die
einzelnen Fragen sind eigene Punkte: C-543 bis C-548 und
G-509.**


# E-90 - der Koerper als Grundlage aller Module

## Toms Vorgabe

Tom, 2026-09-08:

> bevor wir irgendwas anbinden, will ich die grundlagen fertig
> haben, sprich die exercises

> ich will viel tiefer gehen in den grundlagen der uebungen ?
> schauen wir es mal global an, unabhaengig von exercises

> die tiefe soll die grundlage bieten, dass wir eben alle module
> damit bedienen koennen. sprich es geht um die grundlagen, dass
> wir individuell in die tiefe bauen koennen

## Die Struktur, wie Tom sie beschrieben hat

    Koerper
      Koerperteil            Beine
        Muskelparent         Quadriceps
          Muskelkind         Vastus medialis
            Sehnenansaetze
            Injektionspunkte
            Painpoints
            Muskelkaterstaerke
            Nerven, Ausstrahlung, Taubheit

## Was davon heute steht

`[cmd]` **Gemessen, 2026-09-08:**

    training.muscle_groups              112, 4 Ebenen
    training.exercise_muscles         6.726
    training.exercises                1.416
    recovery.muscle_recovery_profiles   112
    public.koerperflaechen               51 (33 mit Muskel)
    medical.injection_sites              16
    Sehnen, Nerven, Schmerzpunkte         0

`[cmd]` **Und am Muskel haengen SIEBEN Fremdschluessel** ?
**er IST bereits das Rueckgrat.**

## Die tragende Unterscheidung

`[read]` **Toms Liste mischt zwei Dinge, und die Trennung ist
die ganze Architektur:**

    FAKT ueber den Koerper      gilt fuer JEDEN Menschen
      parent/child
      Ursprung und Ansatz
      versorgender Nerv
      Injektionsstelle
      Ausstrahlungsmuster
      Regenerationsdauer

    BEOBACHTUNG ueber EINEN     gilt fuer IHN, heute
      Muskelkaterstaerke
      Schmerz
      Taubheitsgefuehl
      was er trainiert hat
      wo er gespritzt hat

`[read]` **Muskelkaterstaerke ist keine Eigenschaft des Vastus
medialis. Sie ist `(Nutzer, Muskel, Zeitpunkt) -> Wert`.**

`[cmd]` **`recovery.muscle_recovery_profiles` hat 112 Zeilen ?
eine je MUSKEL. Das ist richtig gebaut und der Massstab.**

## Der Ort am Koerper ist groesser als der Muskel

`[read]` **Toms Peptid-Beispiel deckt es auf:**

    AAS       intramuskulaer  -> die Stelle IST ein Muskel
    Peptide   subkutan        -> die Stelle ist FETT

    Ort am Koerper
      ist ein Muskel        Vastus medialis
      ist ein Fettdepot     Bauch, Oberschenkel aussen
      ist eine Landmarke    Knochenpunkt

`[read]` **Die 18 Koerperflaechen ohne Muskel sind vielleicht
keine Luecke, sondern genau diese anderen Orte.**

## Was die Struktur oeffnet

`[read]` **Fuenf Module laufen ueber DIESELBE Kette:**
`Uebung -> Muskel -> Ebene -> Ort am Koerper`

    Planer      Koerper -> Region -> Muskel -> Uebungen
                braucht: nach unten durchreichen
    Recovery    "Quadriceps hat Kater, was meiden?"
                braucht: dieselbe Kette rueckwaerts
    Injektion   "du spritzt in den Gluteus von gestern"
                braucht: Stelle -> Ort
    Medical     "Schmerz am Ansatz" -> welche Sehne
                braucht: Sehnen je Muskel
    Coach       "was vernachlaessigt mein Kunde?"
                braucht: Belastung je Muskel ueber Zeit

## Drei Spalten, die aussehen wie Daten

`[cmd]` **Beim Messen gefunden ? alle drei sind Pauschalen:**

    exercise_muscles.faktor   1.00 / 0.50, 6.723 Zeilen,
                              EINE Quelle, Klasse C
                              (3 Zeilen sind echt: Klasse A)
    exercises.difficulty      intermediate, 1.416 von 1.416
    foods.is_prepared_dish    false, 7.140 von 7.140 (C-534)

`[read]` **Eine Spalte mit einem Wert fuer alles ist keine
Einstufung, sondern eine Vorgabe, die nie gesetzt wurde.**

`[read]` **Solange sie steht, sieht LumeOS aus, als wuesste es
mehr, als es weiss.**

## Die Reihenfolge

    C-543  ein Muskel erbt die Uebungen seiner Eltern
           -> KEINE Kuration, nur eine Sicht
           -> der Planer traegt danach sofort
    C-544  der Ort am Koerper als Begriff
           -> injection_sites bekommt seinen Ort
    C-545  difficulty ehrlich machen (Messauftrag)
    C-546  Sehnen und Nerven je Muskel (FIPAT TA2)
    C-547  die Prozente je Uebung (Messauftrag)
    G-509  der Workoutplaner (braucht C-543)

`[read]` **C-543 ist der billigste und beweist am meisten.**

`[read]` **C-545 und C-547 sind MESSAUFTRAEGE, keine
Bauauftraege** ? **1.416 Uebungen einstufen heisst: eine
Quelle finden oder raten, und raten waere dasselbe wie die
Pauschale, nur sichtbarer.**

## Was NICHT zu tun ist

`[cmd]` **Die Zeichnung folgt der Anatomie, nicht umgekehrt** ?
**Tom ersetzt die Grafik, sie darf das Modell nicht formen.**

`[read]` **Keine Ebene ohne Frage, die sie beantwortet.**
**Wir haben 121.959 Supplementprodukte und 51 benutzte
Lebensmittel ? Tiefe ohne Gebrauch ist ein Katalog, den
niemand liest.**

`[read]` **Und keine Eigenschaft als Spalte am Muskel** ? **je
Art eine Relation, sonst wird `muscle_groups` zur Halde.**

## Toms Eingrenzung, 2026-09-08

> der workoutplanner wird eine eigene brainstormsession,
> momentan sind mir die grundlagen wichtiger und die exercises
> sauber aufgesetzt

`[cmd]` **G-509 ist zurueckgestellt.**

`[cmd]` **Und beim Messen der Uebungen kam C-548 dazu: FUENF
Spalten mit einem Wert fuer 1.416 Zeilen** ? `exercise_type`,
`tracking_type`, `difficulty`, `sort_weight`, `source`.

`[read]` **Der Widerspruch: 128 Uebungen sind Dehnung, Yoga
oder Ausdauer, tragen aber `strength` und `weight_reps`.**

### Die Reihenfolge, eingegrenzt

    C-543  Vererbung in der Hierarchie
    C-544  der Ort am Koerper
    C-548  die fuenf Spalten (Messauftrag)
    C-545  difficulty (Messauftrag)
    C-547  die Prozente (Messauftrag)
    C-546  Sehnen und Nerven
    G-509  der Planer -- nach der eigenen Sitzung

## Nachtrag: der Painpoint wird ein Ziel

Tom, 2026-09-08:

> an painpoints koennen allfaellige injektionspunkte unter die
> haut fuer peptide sein, zb bpc 157/tb500

`[read]` **Damit ist ein Painpoint nicht nur eine Beobachtung**
? **er kann ein ZIEL werden.**

    Beobachtung   "das Knie tut weh"
    Ort           Ansatz der Patellasehne
    Ziel          subkutane Gabe an genau dieser Stelle

`[read]` **Die Kette laeuft also in beide Richtungen: vom
Koerper zur Beobachtung UND von der Beobachtung zurueck an den
Koerper.**

`[cmd]` **Und sie braucht eine feinere Aufloesung als den
Muskel** ? **C-546 (Sehnen und Nerven) ist deshalb
Voraussetzung, nicht Beiwerk.**

