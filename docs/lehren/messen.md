# Messen und Pruefen

Belege zu den Regeln in `CLAUDE.md`. **Wer eine Regel anwendet,
liest hier den Grund** ? die Regel allein sagt nicht, warum sie
entstanden ist.

## Ein Waechter prueft die Wirkung, nicht das Wort

`[cmd]` **Dreimal in Folge derselbe Fehler** — G-216, G-247, G-246:
ein Waechter suchte den Feldnamen im Quelltext, statt zu pruefen, ob
die Wirkung eintritt.

    G-216   verglich die Anzahl `.select(` mit der Anzahl
            Schreibzugriffe - ein Zugriff mit zwei `.select()` glich
            den Verlust bei einem anderen aus
    G-247   prueft, ob `setFilter` im Text steht, statt ob die Liste
            geschnitten wird
    G-246   sucht den Feldnamen, statt den Aufruf

`[read]` **Alle drei fielen erst durch die Sabotageprobe auf** — der
Waechter selbst blieb gruen, waehrend die Sache kaputt war.

`[read]` **Also: ein Waechter misst das Ergebnis.** Steht der Wert im
DOM? Ist die Liste kuerzer? Fehlt die Zeile in der Datenbank?
**Nicht: kommt das Wort im Quelltext vor.**

`[cmd]` **Und A-59 ist derselbe Fehler beim Zaehlen:** 89
Attrappenmarken im Quelltext gegen 24 auf dem Schirm.

## Jede Messung nennt Nutzer und Zeitraum

`[cmd]` **Am 28.08. haben zweimal zwei Beteiligte verschiedene Zahlen
fuer dieselbe Sache gemeldet** — Vitamin A bei 164 gegen 172 Prozent
(C-334), und 1.794 gegen 724 Tageszeilen (G-247).

`[read]` **Beide Male lag es nicht an den Daten**, sondern daran, dass
niemand angegeben hat, fuer wen und ueber welchen Zeitraum gemessen
wurde.

`[cmd]` **Fuenf Nutzer haben Tagesdaten** — `dev@lumeos.app`, drei
Seed-Konten mit je 180 Tagen, und `test-user@lumeos.local` mit einem.
**Eine Zahl ohne Nutzerangabe kann alles bedeuten.**

**Also: jede gemeldete Zahl nennt Nutzer und Zeitraum.** `[read]`
**Sonst ist sie nicht nachpruefbar — und eine Abweichung sieht aus
wie ein Defekt.**

## Eine Pruefung muss in beide Richtungen belegt sein

`[read]` **Ein Waechter, der laeuft und nichts findet, ist von einem,
der nichts prueft, nicht zu unterscheiden** — **ausser man baut einen
Fehler ein.**

`[cmd]` **Am 01.09. waren acht Waechter gruen, waehrend `tsc` acht
Syntaxfehler meldete.** Ursache: ein JSX-Kommentar als erstes Element
nach `return (` — dort gilt er nicht.

`[cmd]` **Und am 02.09. fiel dieselbe Klasse zwoelfmal an einem Tag:**
**der Waechter prueft das Wort statt der Wirkung.**

    onAktivieren?: (id: string) => void
      der Name war da, die id wurde verworfen

    pruefeHerkunft == 4
      wocheKopieren ist der fuenfte

    posten.slice(0,0).map
      das Wort stand da, die Liste war leer

### Die Regel

**Vor jeder Validierung: einen Fehler einbauen und messen, dass sie
rot wird.**

`[read]` **Und die Frage dabei ist nicht *,,steht das Wort da"*,
sondern *,,was wuerde die Sabotage aendern, und faengt der Waechter
genau das"*.**

`[cmd]` **`nutrition-c380-seed-plan-variety.test.ts` ist das
Vorbild:** erst rot gegen die 84 Hammelfilet-Zeilen, danach gruen.

## Eine Sammelfrage misst nichts

**G-370, 2026-09-07.** `[cmd]` **Claude Codes Pruefung fragte:
*,,aendert sich unten ueberhaupt etwas?"***

`[cmd]` **Drei von vier Zweigen aenderten sich** — **die Pruefung
blieb gruen, waehrend der vierte kaputt war.**

`[read]` **Die Sabotageprobe hat die Pruefung widerlegt, nicht den
Code.**

`[read]` **Eine Frage nach dem Ganzen faellt nicht, wenn ein Teil
faellt.** `[read]` **Sie muss je Fall fragen und den Fall
benennen.**

`[cmd]` **Geschaerft: *,,erscheint diese Kachel auf JEDEM
Unterreiter unten, waehrend nur einer sie oben zeigt?"*** — **mit
Namen der Kachel.**

## Ein Bericht ist kein Nachweis

**Tom, 2026-09-02:** *,,da hat sich null komma nichts geaendert."*

`[cmd]` **Anlass: G-311 meldete *vier von vier Plaenen sichtbar, alle
Herkunfts-Badges belegt*.** `[cmd]` **Die Buehne lag auf
`test-user` und war nach dem Nachweis zurueckgebaut** — **der Beleg
existierte nicht mehr, als der Orchestrator abnahm.**

`[read]` **Zwei Fassungen des Fehlers, beide an einem Tag:**

    "vier von vier sichtbar"     die Buehne war weg
    Kacheltitel abgehakt         der Inhalt war ein anderer

`[read]` **Was zaehlt, ist der Zustand, den Tom sieht** —
`dev@lumeos.app`, im Browser, mit Daten.

### Drei Regeln daraus

**Wer einen Nachweis fuehrt, laesst die Buehne stehen** — oder der
Orchestrator legt Daten an, bevor er abnimmt.

**Wer eine Kachel abnimmt, vergleicht den Inhalt** — nicht den
Titel. `[cmd]` **Zeile der Vorlage gegen Zeile am Schirm, mit
Zeilennummer.**

**Und wer eine Komponente in einen Auftrag schreibt, prueft, dass es
sie gibt.** `[cmd]` **`RecipeDetail` und `MealPlansView.js` waren
beide erfunden** — die eine ein Kommentar, die andere die falsche
von zwei gleichnamigen Dateien.

## Suchen nach der Sache, nicht nach dem Wort

`[cmd]` **Am 2026-08-30 gesucht: *,,noch nicht entwickelt"*.**
`[cmd]` **Der Baustein heisst `InEntwicklungKnopf` und schreibt
*,,in Entwicklung"*** — **39 Aufrufer, quer durch alle v2-Module.**
**Nicht gefunden, und daraufhin behauptet, es gebe ihn nicht.**

`[read]` **Tom hat ihn mit einem Bildschirmfoto belegt.**

### Dasselbe Muster, das die Waechter betrifft

`[cmd]` **G-216, G-247, G-246, G-108: ein Waechter prueft das Wort
statt der Wirkung.** `[read]` **Hier sucht der Orchestrator das Wort
statt der Sache** — dieselbe Klasse, andere Rolle.

### Was stattdessen

**Nach der Wirkung suchen, nicht nach dem Wortlaut.**

    schlecht   grep "noch nicht entwickelt"
    besser     grep "Entwicklung|Platzhalter|nicht angebunden"
               oder: welche Datei rendert das Modal aus dem Bild?
               oder: was importiert die Datei, die den Knopf traegt?

`[read]` **Und wenn ein Bildschirmfoto vorliegt: von dort ausgehen.**
**Der Knopf im Bild hat einen Aufrufer, und der hat einen Import.**

## Die Datei ist die Wahrheit, nicht ihre Zusammenfassung

**Tom, 2026-08-29:** *,,wir arbeiten mit lokalen md dateien und nicht
mit deinen erinnerungen, deswegen bauen wir diese strukturen und
ssot"*.

`[read]` **Wer eine Frage vorlegt, einen Auftrag schreibt oder einen
Stand meldet, liest die Datei zuerst.** **Nicht: aus dem Kontext
rekonstruieren, was darin stand.**

### Was am 2026-08-29 daran haengengeblieben ist

`[cmd]` **G-254 heisst *,,sechs Kacheln brauchen eine
Entscheidung"*.** Ich habe Tom **eine** davon vorgelegt und seine
Antwort auf den ganzen Punkt geschrieben. **Fuenf Kacheln waeren
stillschweigend entschieden gewesen** — als seine Entscheidung, im
ADR. **Berichtigt: der eine Fall ist G-258, G-254 blieb offen.**

`[cmd]` **G-245/G-70:** beide Zahlen gemessen — live vier
Sortierwerte, im Kettenschritt zehn — **und die falsche in den
Auftrag geschrieben.**

`[cmd]` **Der Mockup-Massstab:** drei Stunden im falschen Ordner
gesucht. **`00-QUELLEN.md` nannte den richtigen seit dem 20.08.**

`[read]` **Alle drei entstanden beim Umformulieren, nicht beim
Messen.** **Die Datei lag jedes Mal daneben.**

### Was daraus folgt

**Eine Frage wird aus der Datei zitiert, nicht referiert.**
**Ein Punkt mit mehreren Fragen wird aufgeteilt, bevor er vorgelegt
wird** — eine Sammelfrage ist keine Frage.
**Ein Auftrag nennt die Punktdatei, und der Agent liest sie** — die
Chatnachricht ist der Anstoss, nicht die Vorgabe.

`[read]` **Und wenn Datei und Gedaechtnis auseinandergehen, gilt die
Datei** — ohne Nachdenken darueber, welche Fassung plausibler
klingt.

## Zahlen im Auftrag sind Ausgangsvermutungen

**Tom, 2026-08-26:** *„mittlerweile in jedem bericht lese ich dass du
fehler machst, loese das oder sag im auftrag er soll selber messen wenn
du nicht faehig bist."*

`[read]` **Die Loesung ist nicht mehr Sorgfalt, sondern eine andere
Formulierung:**

    NICHT   "Erwartung: 292 Zeilen"
    SONDERN "Meine Messung ergab 292 -- pruef sie zuerst.
             Weicht deine ab, gilt deine, und du nennst beide."

`[read]` **Der Unterschied ist verfahrenstechnisch.** Eine
Erwartungszahl wird zum Sollwert: der Agent baut, bis sie erreicht ist.
**Eine Ausgangsvermutung wird geprueft — und wenn sie faellt, ist das
ein Befund und kein Streit.**

`[cmd]` **Neun Faelle in fuenf Tagen, alle derselben Art: die Abfrage
traf den falschen Ausschnitt.**

    C-275   im_katalog::text gegen 't' statt 'true'   -> 0 statt 317
    C-276   Dublettenprobe auf name_en statt Kern     -> 18 durch
    G-184   Kategorie als Code angenommen             -> 41 Werte
    G-191   upper_limit gegen 290 statt 412 Zeilen    -> 3 statt 13
    C-280   substance_class als einzige Zuordnung     -> auch IDs
    G-195   note_de 320 / rechtslage 136              -> 305 / 201
    G-196   Kontrast aus kaputter Messung             -> gab es nie
    C-284   raw->'pregnancy' is not null              -> 1 statt 498
    C-288   kanonische Datei statt Enrichment-Layer   -> ATC 56/419

`[read]` **In sieben von neun Faellen hat der Agent es gefunden, nicht
der Orchestrator.**

`[read]` **Wer eine Zahl nennt, nennt auch die Abfrage, mit der sie
entstand.** Dann ist nachpruefbar, ob sie den richtigen Ausschnitt
getroffen hat — **das war in allen neun Faellen das Problem, nicht die
Rechnung.**

**Und die Schwester dieser Regel, aus G-190:** `[read]` **jede
Leistungszahl nennt das Konto**, so wie jede Bestandszahl den Stichtag
nennt. `[cmd]` `ladeRegeln` braucht auf dev 926 ms, auf test-user
62 ms — **Faktor 15, weil dort 360 Einnahmen gegen 24 stehen.**

## Teilstring-Vergleiche brauchen Wortgrenzen

`[cmd]` **Zweimal derselbe Fehler, und beim zweiten Mal im Waechter
gegen ihn:**

    G-187   /daten\?\.wechselwirkungen/  traf ...wechselwirkungenX
    G-197   includes('community_anzeige') traf ...anzeigeX

`[read]` **Claude Codes Einordnung:** *„Das sagt, dass diese Klasse
nicht durch Aufmerksamkeit vermeidbar ist."*

**Wer einen Namen in einem Waechter sucht, sucht ihn mit Wortgrenze** —
`\b`, Zeichenklasse oder exakter Vergleich. **Nie `includes`, nie ein
unverankertes Muster.**

`[read]` **Und die Pointe:** ein Waechter gegen unverankerte Muster,
der selbst eines benutzt, ist die dritte Auflage desselben Fehlers.

## Eine Pruefung misst oft etwas anderes als gemeint

`[cmd]` **Sechs Faelle in drei Tagen**, alle nach demselben Muster: die
Pruefung war gruen, das Ergebnis falsch.

    G-186   der Waechter fand wofuer_de erst in der Abfrage,
            dann in der Abbildung, dann im eigenen Kommentar
    G-187   /daten\?\.wechselwirkungen/ traf auch ...X
    G-191   scrollWidth > clientWidth misst nur den eigenen Kasten --
            der Text brach darin um, erst die Tafel beschnitt ihn
    G-184   wadaNote={undefined} kam durch, weil der Name in der
            Typdeklaration weiterlebt
    G-196   Hintergrund von Weiss aus komponiert, oklch als RGB
            gelesen -- die Zahlen waren nicht unsicher, sondern falsch
    G-199   .from('community_anzeige') auf ...X, kein Test fiel um

`[read]` **Der letzte war teuer:** genau so ist G-192 haengen
geblieben — der Lesepfad gab still `null` zurueck, **und niemand
merkte es, bis Tom fragte, wo das Community-Zeug bleibt.**

**Die Lehre: bewach die Verdrahtung, nicht nur die Funktion.** `[cmd]`
`tools/verdrahtung-pruefen.mjs` (G-197) misst 89 verdrahtete Namen, 54
in keinem Test — **aber zwei bekannte Faelle fallen nicht, Ursache
offen (G-200). Die fuenf Einzelwaechter bleiben stehen.**

## Eine Zahl ohne Stichtag ist keine Zahl

**Tom, 2026-08-18:** *,Es geht nicht darum, was der User macht. Es geht
darum, dass wir Daten haben fuer die Entwicklung — und wenn diese Daten
heute stoppen, kann ich die naechsten Tage nicht entwickeln, ohne jeden
Tag neu zu seeden."*

`[cmd]` **Zwei Auftraege sind am 2026-08-18 daran gescheitert.** Der
Orchestrator nannte *„Koerperfett 10,31 %, FFMI 21,97"* und *„adaptiver
TDEE 3.143,2"* — **beides richtig, beides fuer den 2026-09-13.** Heute
liefert dieselbe Funktion 11,38 % und NULL.

**Die Zahlen waren nicht falsch, ihnen fehlte der Tag.**

`[read]` **In jedem Auftrag gehoert der Stichtag zur Zahl:** nicht
*„Koerperfett 10,31 %"*, sondern *„10,31 % am 13.9., heute 11,38 %"*.
**Sonst prueft der Agent gegen eine Zahl, die fuer einen anderen Tag
gilt** — und meldet einen Widerspruch, den es nicht gibt.

**Und die Seeds reichen bewusst in die Zukunft.** `[cmd]` Seit C-78
laufen sie ueber ±90 Tage, mit einem Startdatum als einzigem
Parameter. **Das ist kein Fehler in den Daten, sondern der Vorrat, aus
dem entwickelt wird.**

## Karten zaehlen misst nichts

`[cmd]` **2026-09-08, G-391 und G-398:** *,,62 Karten, 23 haben ein
Gegenstueck"* **und** *,,44 Portalkarten, 14 angebunden"*.

`[read]` **Beide Zahlen waren richtig. Beide sagten nichts.**

Tom: *,,das hat nicht mal 1% etwas mit meiner coaching plattform zu
tun."*

`[cmd]` **Eine Karte namens *Rules* stand neben einem
30-KB-Regelbauer** ? **und galt als Entsprechung.**

**Der Massstab ist die Faehigkeit, nicht der Titel:**

    falsch   gibt es eine Karte mit diesem Namen?
    richtig  welche Felder zeigt die Vorlage?
             welche zeigt der Bau?
             was KANN der Nutzer damit tun?

`[cmd]` **Beispiel, an einer Karte gemessen:**

    Athletes needing attention
      Vorlage: Avatar, Name, Plan, letzte Sitzung,
               Alertzahl, Compliance farbig,
               Klick -> Detail-Modal
      Bau:     Name, Datum
      fehlt:   5 von 7 Feldern

`[read]` **Und auf Modulebene dasselbe:** **ein Coach, der
zustimmen und ablehnen kann, hat nichts gemein mit einem, der
Programme baut, Regeln schreibt und Automatisierungen
einrichtet.**

