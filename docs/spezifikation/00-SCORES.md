# Scores — wie andere rechnen und was daraus folgt

**Recherchiert 2026-08-29** auf Toms Frage: *,,ein tagesscore ob fuer
nutrition oder recovery muss doch sicher eine formel haben die
wissenschaftlich belegbar ist? … jede app hat scores also rechnen sie
irgendwie."*

## Der Befund, der die Frage umkehrt

**Eine Auswertung von 2025 hat 14 zusammengesetzte Gesundheits-Scores
von 10 grossen Herstellern geprueft: keiner hatte eine rigorose
unabhaengige Validierung in der Fachliteratur durchlaufen.** Eine
zweite Uebersicht zaehlt **2 von 12 Scores mit veroeffentlichter
Validierung.**

`[read]` **Scores sind in dieser Branche Produktentscheidungen, keine
wissenschaftlichen.** `[read]` **NRF9.3 war der Ausreisser** — eine
der wenigen Formeln, die ueberhaupt gegen einen unabhaengigen
Massstab geprueft wurde (E-25).

## Die Eingaenge sind fast ueberall dieselben

**Etwa 86 Prozent der Geraete nutzen naechtliche HRV als
Primaersignal**, dazu Ruhepuls und Schlaf. **Was sich unterscheidet,
ist was obendrauf kommt und wie es gewichtet wird.**

    Whoop      HRV, Ruhepuls, Atemfrequenz, Schlaf -> 0-100 %
               HRV aus dem Tiefschlaf, gegen 60-Tage-Basislinie
    Oura       Ruhepuls, HRV-Balance (14-Tage-Mittel),
               Koerpertemperatur, Schlafqualitaet, Aktivitaet
               - sieben Beitraege ueber drei Saeulen
    Garmin     sechs Faktoren: Schlafscore, HRV-Status, Restzeit,
               akute Trainingslast, Stressverlauf, Body Battery
               Gewichtung nicht offengelegt, normiert auf 0-100
    Coros      HRV, Ruhepuls, Trainingslast - Last staerker
               gewichtet als bei Garmin
    Apple      kein Score; HRV und Schlaf als Vitals-Uebersicht

## Die Gewichtung entscheidet alles

**HRV erklaert 56 Prozent der Varianz beim Whoop-Score, aber unter
5 Prozent bei Oura.**

`[read]` **Derselbe Athlet, derselbe Morgen, ueber 20 Punkte
Unterschied — und beide nach ihrer eigenen Logik richtig.**

## Drei Dinge, die fuer LumeOS folgen

### Die Zeitachse ist eine eigene Entscheidung

**Whoop setzt jede Nacht zurueck**, jeder Score betrifft vor allem
den autonomen Zustand der letzten Nacht. **Garmin laesst mehrere Tage
nachwirken** — ein hartes Wochenende drueckt den Montag, auch nach
gutem Schlaf. **Oura mischt Vierzehntagekontext dazu.**

`[read]` **Das ist keine Genauigkeitsfrage, sondern eine
Produktfrage** — und sie erklaert einen Grossteil der Abweichungen
zwischen Geraeten.

### Normierung gegen die eigene Basislinie ist Standard

**Whoop rechnet gegen 60 Tage, Oura gegen drei Monate.**

`[read]` **Ein absoluter Wert sagt weniger als die Abweichung vom
eigenen Normalzustand.** `[cmd]` **Und der Bestand traegt es:**
`recovery.checkins` hat 370 Zeilen ueber 181 Tage.

### Offenlegung kann der Unterschied sein

`[read]` **Wenn keiner validiert ist und keiner seine Gewichtung
offenlegt, ist Offenlegung eine Moeglichkeit, die niemand nutzt.**

`[cmd]` **Wir tun es an anderer Stelle bereits:** Quelle je
Referenzwert, Herkunft je Detailtext, `unsupported_operator` statt
stillem Rueckfall, *begruendet leer* statt *nicht bearbeitet*.

## Was das fuer C-143 und C-218 bedeutet

`[cmd]` **Zwei Wege rechnen 36 gegen 35,3** (gemessen 2026-08-29).

`[read]` **Das ist kein Skandal — es ist derselbe Effekt wie Whoop
gegen Garmin.** `[read]` **Der Fehler ist nicht die Abweichung,
sondern dass wir nicht sagen koennen, welche Gewichtung gilt.**

`[read]` **Damit ist die Reihenfolge klar:** erst festlegen und
aufschreiben, was gewichtet wird — **dann rechnet ein Weg, und der
andere liest ihn.**

## Quellen

Doherty et al. 2025, Auswertung zusammengesetzter Gesundheits-Scores
in Verbrauchergeraeten (14 Scores, 10 Hersteller).
Sportsmith-Auswertung zur Varianzaufklaerung durch HRV.
Herstellerangaben Whoop, Oura, Garmin, Coros, Suunto, Fitbit.
