---
nr: C-545
typ: befund
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.exercises]
zahlen:
  gemessen: 2026-09-08
---

# C-545 - difficulty ist ein Wert fuer alles

## Toms Idee

Tom, 2026-09-08:

> jede exercise kriegt ein erfahrungslevel, dass wir fuer
> anfaenger anderst sortieren koennen als fuer pros, sprich
> kriegt eine spalte mehr und die sortierung wird dann
> abhaengig von dem erfahrungswert

## Der Befund: die Spalte gibt es, und sie ist leer

`[cmd]` **`training.exercises.difficulty`:**

    intermediate   1.416 von 1.416

`[read]` **Ein Wert fuer alles ist keine Einstufung, sondern
eine Vorgabe, die nie gesetzt wurde.**

`[cmd]` **Dieselbe Sorte wie `faktor 1.00/0.50` (C-547) und
`is_prepared_dish false` (C-534)** ? **eine Spalte, die
aussieht wie Daten.**

## Und die zweite Haelfte

`[cmd]` **`public.profiles.experience_level` ist seit C-541
NOT NULL und traegt vier Stufen: `beginner`, `advanced`, `pro`,
`elite`.**

`[read]` **`difficulty` muss dieselben Stufen sprechen, sonst
passt die Sortierung nie.**

## Die Falle

`[read]` **1.416 Uebungen einstufen heisst: eine Quelle finden
oder raten.** **Raten waere dasselbe wie die
`faktor`-Pauschale, nur sichtbarer.**

## Zu messen, VOR dem Bauen

    A  woher kommt eine Einstufung? Traegt das
       Vorgaengerrepo etwas? Eine Quelle im Netz?
    B  laesst sie sich ableiten? Geraet, Bewegungsart,
       Zahl der belasteten Muskeln, freies Gewicht
       gegen Maschine.
    C  wie viele lassen sich SICHER einstufen, wie
       viele nicht?
    D  vier Stufen wie beim Nutzer -- oder braucht eine
       Uebung eine SPANNE (ab advanced)?

`[read]` **MESSEN und EMPFEHLEN, nicht einstufen.**

## Abnahmebedingungen

    A1  woher koennte eine Einstufung kommen? Gemessen.
    A2  laesst sie sich ableiten? Zahl, an einer
        Stichprobe belegt.
    A3  wie viele bleiben unsicher?
    A4  Stufe oder Spanne? Empfohlen, begruendet.
    A5  KEINE Umsetzung.

## Bericht, 2026-09-25, Codex

### Vier Quellen

- **Code:** Die aktuelle Spalte, ihre Check-Constraint, alle
  produktiven Training-Leser und die vorgesehenen Spec-Leser wurden
  untersucht. Heute liest kein produktiver Code `difficulty`.
- **Daten:** Live stehen 1.416 von 1.416 Zeilen auf
  `intermediate`. Die strukturierten Merkmale Disziplin, Kategorie,
  Equipment und Muskelzahl wurden auf Ableitbarkeit geprueft.
- **Spec und Mockup:** Spec und Mockup kennen einen
  Difficulty-Filter und eine Suchgewichtung. Die aktuelle Spec kennt
  jedoch nur `beginner/intermediate/advanced`, waehrend das seit
  C-541 verbindliche Nutzerprofil `beginner/advanced/pro/elite`
  spricht.
- **Vorgaengerrepo:** Der unverarbeitete Legacy-Export enthaelt 1.448
  Difficulty-Felder, ausnahmslos `intermediate`; nach Bereinigung
  blieben die heutigen 1.416. Das Vorgaengerrepo liefert damit keine
  Einstufung, sondern die Quelle der Pauschale.

### A1 - moegliche Quellen

Zwei externe Quellen wurden tatsaechlich gelesen:

1. Die peer-reviewte Delphi-Studie
   [Selecting Resistance Training Exercises for Novices](https://pmc.ncbi.nlm.nih.gov/articles/PMC11873903/)
   liess 17 Fachleute 77 Kraftuebungen nach technischer Komplexitaet
   bewerten und fand spaeter Konsens fuer 41 novice-taugliche
   Uebungen. Sie trennt ausdruecklich technische Schwierigkeit von
   der verwendeten Last.
2. Die [ACE Exercise Library](https://www.acefitness.org/resources/everyone/exercise-library/body-part/full-body-integrated/full-body-integrated/)
   fuehrt 330 katalogisierte Uebungen als 112 Beginner, 118
   Intermediate und 100 Advanced. Sie ist breiter, aber weder eine
   vierstufige LumeOS-Skala noch deckungsgleich mit den 1.416
   Exercise-Animatic-Zeilen.

Die Delphi-Quelle ist fachlich staerker, aber absichtlich klein. Von
ihren 41 novice-tauglichen Bezeichnungen stimmen nur **3**
wortgleich mit einem LumeOS-Namen ueberein. Fuzzy-Namenssuche ist
keine ausreichende Kuration: `Cable curl` waehlt beispielsweise
`Cable wrist curl`, und `Ab bike` waehlt `air bike`.

### A2 - keine sichere Ableitung aus den vorhandenen Merkmalen

Die Studie nennt die fuer technische Schwierigkeit relevanten
Merkmale: unilateral gegen bilateral, Geschwindigkeit, Balance,
Koordination, Rumpf- und Gelenkstabilitaet, ein- gegen mehrgelenkig
und mehrsegmentig. Diese Merkmale liegen im aktuellen Katalog nicht
strukturiert vor.

Die vorhandenen Felder widerlegen einfache Regeln:

- Innerhalb **Dumbbell** reicht die gemessene Fachbewertung von
  `Dumbbell calf raise` (2,24/10) bis `Single leg Romanian deadlift`
  (8,29/10).
- Innerhalb **Bodyweight** reicht sie von `Wall sit` (2,47/10) bis
  `Chin ups` (6,53/10).
- Eine Maschine ist haeufig leichter, aber Equipment allein reicht
  nicht: Sitzposition, Standsicherheit, Unilateralitaet und
  Bewegungsfolge veraendern die technische Anforderung.
- Muskelzahl misst beanspruchte Anatomie, nicht Balance,
  Koordination oder Technik. Sie kann deshalb keine Erfahrungsstufe
  bestimmen.

Ergebnis: Aus den heutigen LumeOS-Feldern sind **0 von 1.416** ueber
eine allgemeine Regel sicher vierstufig einstufbar. Die 3
wortgleichen Delphi-Treffer sind belegte **Kandidaten** fuer
`beginner`, aber selbst ihre Uebernahme braucht zuerst Toms
Entscheidung, dass *novice-tauglich* genau `beginner` bedeutet.

### A3 - offene Zahl

Ohne diese Bedeutungsentscheidung bleiben **1.416 von 1.416**
unsicher. Nach Zustimmung zur Abbildung
`novice-tauglich -> beginner` koennten 3 wortgleiche Treffer
quellenbelegt kuratiert werden; **1.413** blieben weiterhin offen.

Eine groessere Zahl durch Namensaehnlichkeit, Equipment oder
Muskelzahl waere geraten. Sinnvoll ist eine eigene Kuration mit
Quellenkennung und einer offenen Restliste, genau wie bei C-540.

### A4 - Empfehlung: Mindeststufe, keine geschlossene Spanne

Empfohlen wird ein Feld mit der Bedeutung
`minimum_experience_level` und genau den vier Profilcodes:

    beginner < advanced < pro < elite

Es ist eine **untere Schwelle**, keine Spanne. Eine als `beginner`
geeignete Kniebeuge wird fuer einen Pro nicht ungeeignet. Eine
Obergrenze wuerde deshalb fachlich falsche Ausschluesse erzeugen.
Die Suche kann Uebungen bis zur Nutzerstufe bevorzugen und hoehere
Stufen nach hinten sortieren beziehungsweise erklaeren, ohne
niedrigere Uebungen fuer Erfahrene zu verstecken.

Die externe Forschung traegt ausserdem eine wichtige Trennung:

- **nominale technische Komplexitaet** ist eine Eigenschaft der
  Uebung;
- **funktionale Schwierigkeit** entsteht erst aus Uebung, Last,
  Person und Situation.

Der Katalog darf nur die erste als Fakt speichern. Last, Verletzung,
Mobilitaet und Tagesform gehoeren spaeter in die Nutzerbeobachtung
und duerfen den Katalogwert nicht ueberschreiben.

### Entscheidung fuer Tom

Vor einem Bau muss Tom bestaetigen:

1. Bedeutet `beginner`, dass eine Uebung fuer untrainierte gesunde
   Erwachsene technisch geeignet ist?
2. Soll der bestehende Name `difficulty` in
   `minimum_experience_level` ueberfuehrt werden, damit die Semantik
   nicht erneut verwechselt wird?

Bis dahin bleibt der gemessene Bestand gemeldet und unveraendert.

### A5 - keine Umsetzung

C-545 hat weder Schema noch Daten noch `apps/` geaendert. Der
Dev-Server wurde nicht beruehrt und es wurde nicht committed.

## Abnahme

_(vom Orchestrator)_
