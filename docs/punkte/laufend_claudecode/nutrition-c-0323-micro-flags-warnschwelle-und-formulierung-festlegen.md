---
nr: C-323
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: C-49
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-323 - Micro-Flags Warnschwelle und Formulierung festlegen

## Befund

Offene Frage aus C-49: ab wann Unterversorgung gewarnt wird und mit welcher Formulierung.

## Auftrag — Micro-Flags, auf den Bodybuilder zugeschnitten

**Tom, 2026-08-29:** *,,setz es um dass es fuer einen bodybuilder der
beste nutzen gibt"*.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
**Nenn Nutzer und Zeitraum bei jeder Messung.**

`[cmd]` **Es gibt keine `micro_flags`-Tabelle.** `[read]` **Die Frage
ist also nicht, welche Schwelle gilt, sondern woraus ein Flag
entsteht.**

### Was schon da ist

`[cmd]` **Die vier Zustaende stehen seit G-249** — gedeckt, zu wenig,
ueber der Obergrenze, kein Richtwert. `[cmd]` **Die Zeitraeume
7/30/90 seit G-247, der Verlauf mit drei Linien, die Pillen als
Filter.**

`[read]` **Ein Flag ist die Verdichtung davon zu einer Aussage** —
kein neuer Datenweg.

### Drei Vorgaben, die aus dem Bestand folgen

**1 · Dauer statt Hoehe.** `[read]` Ein Tag unter dem Ziel ist normal,
dreissig Tage sind ein Muster. `[cmd]` **Mit den Zeitraeumen aus E-24
ist das rechenbar:** *,,an 42 von 90 Tagen ueber der Grenze"* ist eine
Aussage, *,,heute 172 Prozent"* ist es nicht.

**2 · Die Leserichtung mitfuehren.** `[read]` **C-48 Regel 2:** 80
Prozent eines Zielwerts sind zu wenig, 80 Prozent einer Obergrenze
sind unbedenklich. `[read]` **Ein Flag ohne diese Richtung warnt
falschherum** — deshalb keine reine Prozentschwelle.

**3 · Unvollstaendiges ist kein Mangel.** `[cmd]` `vitc_missing`
feuert an nahezu allen Tagen. `[read]` **Ein Flag, das eine
unvollstaendige Summe als Unterversorgung meldet, erfindet einen
Mangel.** **Dieselbe Regel wie C-48 Regel 1.**

### Der Zuschnitt auf den Bodybuilder

`[read]` **Das ist der eigentliche Auftrag, und er ist eine
Messfrage.**

`[cmd]` **Miss zuerst, welche Naehrstoffe auf `dev` und den drei
Seed-Konten ueberhaupt auffaellig werden** — und ueber welche
Zeitraeume. `[read]` **Wenn dieselben fuenf immer auffallen, ist eine
Liste von fuenf nuetzlicher als eine Regel ueber 138.**

`[read]` **Und was einen Bodybuilder betrifft, unterscheidet sich vom
Durchschnitt:** hohe Proteinzufuhr, hohe Energiezufuhr, oft
Supplementierung. **Eisen, Zink, Magnesium, Vitamin D und Natrium
sind die naheliegenden Kandidaten — aber das ist meine Vermutung, und
sie gehoert gemessen, nicht uebernommen.**

`[cmd]` **Die Supplementeinnahmen liegen in `supplements.intake_logs`.**
`[read]` **Ob ein Flag sie mitzaehlen muss, ist eine echte Frage:**
wer Magnesium nimmt und in der Nahrung wenig hat, ist nicht
unterversorgt. **Miss, ob die Verbindung heute besteht** — und wenn
nicht, **sag es, statt sie zu bauen.**

### Was nicht zu tun ist

**Keine Prozentschwelle als einzige Regel.**
**Keinen Score bauen** — das ist C-324, Codex arbeitet daran.
**Keine Tabelle anlegen.**
**Keine Warnung erfinden, wo die Daten unvollstaendig sind.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    auffaellige Naehrstoffe      gemessen, je Konto und Zeitraum
    Flags je Zeitraum            wie viele bei 7 / 30 / 90
    Leserichtung                 unter Ziel gegen ueber Grenze -
                                 Bildschirmfoto
    unvollstaendig               erzeugt kein Flag - belegt
    Supplemente                  zaehlen sie mit? gemessen
    Formulierung                 je Flag ein Satz, ohne Zahl
    Doppelung                    zeigt der Reiter das schon?
    Attrappen                    am Schirm gezaehlt (A-59)

`[read]` **Die vorletzte Zeile ist die, die ich dreimal uebersehen
habe — und die du in G-11 und G-253 selbst angewandt hast.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30, A-59, A-60 beachten.**
`[cmd]` **Die Seed-Daten reichen bis November 2026** — eine offene
Datumsgrenze faengt alles Zukuenftige mit.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-29.** Alle Zahlen mit Nutzer und Zeitraum.

### Die Kurzfassung

**Der Zuschnitt auf den Bodybuilder war eine Messfrage, und die
Messung hat die Antwort gedreht:** eine feste Liste von fuenf
Naehrstoffen waere moeglich gewesen — dieselben stehen bei 7, 30 und
90 Tagen oben — **und sie waere trotzdem falsch.** Die Reihenfolge
entsteht aus Toms Essgewohnheiten, nicht aus einer Eigenschaft von
Bodybuildern.

**Und die echte Frage hat eine klare Antwort: die Verbindung zu den
Supplementen besteht nicht.** Sie ist gebaut, aber leer — Belege
unten.

**Der wichtigste Einzelbefund:** `[cmd]` **drei von 19 Obergrenzen
gelten laut ihrer eigenen Quelle nicht fuer Nahrung** — und zwei davon
sind die lautesten Warnungen auf dev. **Ein naiver Flag wuerde 87-mal
vor Magnesium aus Lebensmitteln warnen.**

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| auffaellige Naehrstoffe | gemessen, je Konto und Zeitraum — Tabelle unten |
| Flags je Zeitraum | dev **10 / 12 / 10** bei 7 / 30 / 90 Tagen; test-user **0 / 0 / 0** |
| Leserichtung | unter Ziel gegen ueber Grenze — **Bildschirmfoto**, `backup/c323-leserichtung.png` |
| unvollstaendig | **erzeugt kein Flag** — belegt durch Sabotage 4 und zwei Tests |
| Supplemente | **zaehlen NICHT mit** — die Kette bricht, gemessen |
| Formulierung | je Flag ein Satz, ohne Zahl — Test 18 prueft es |
| Doppelung | **keine** — der Reiter zeigt Mittelwerte, nicht Dauer |
| Attrappen | **0 am Schirm** (A-59) |

### 1 · Warum es keine Doppelung ist — die entscheidende Pruefung

`[cmd]` **Der Reiter hat bereits einen Filter „Auffaellig"**
(`naehrstoff-anzeige.ts:197`). **Ich habe zuerst gemessen, was er
bedeutet**, bevor ich etwas daneben baue.

`[cmd]` **Er liest `k.status`, und der entsteht in
`naehrstoff-ordnung.ts:451 aus `avg_per_logged_day` — dem MITTELWERT
ueber das Fenster.**

`[read]` **Damit sind zwei voellig verschiedene Lagen ununterscheidbar:**

    durchgehend 79 %                    -> Mittelwert 79, „unter Ziel"
    45 Tage bei 40 %, 45 Tage bei 118 % -> Mittelwert 79, „unter Ziel"

**Die erste ist ein Muster, die zweite ist Schwankung.** `[cmd]` **Auf
dem Bildschirmfoto steht es als Zahl:** der Reiter meldet fuer 30 Tage
*„13 unter dem Ziel und 3 ueber der Obergrenze"* — zusammen 16.
**Meine Regel findet im selben Zeitraum 12**, und zwei davon sind
Ausnahmen. **Die Differenz ist das, was die Dauer aussortiert.**

**Ein Flag ist also keine zweite Ansicht, sondern die Achse, die
fehlt.** `[cmd]` Am Schirm gezaehlt: **0 Attrappen, kein Kartentitel
doppelt.**

### 2 · Welche Naehrstoffe auffallen — gemessen

`[cmd]` **`dev@lumeos.app`, 90 Tage bis 2026-08-29**, Tage aus
`daily_assessments` entfaltet (nicht Zeilen gezaehlt — dazu unten):

    WATER      88 von 88 unter Ziel     MG    87 von 88 ueber Grenze *
    F18:2CN6   84 von 90 unter Ziel     NIA   51 von 73 ueber Grenze *
    NACL       78 von 90 unter Ziel     VITA  42 von 90 ueber Grenze
    NA         61 von 71 unter Ziel     MN     5 von 90 ueber Grenze
    CA         56 von 90 · VITD 56 von 90 · F18:3CN3 55 von 90

`[cmd]` **`tom.seed@example.com` liefert dieselbe Reihenfolge** —
derselbe Seed. `[cmd]` **`test-user@lumeos.local` hat 12 Tage und
faellt im 7-Tage-Fenster ganz aus.** `[read]` **Das ist die richtige
Antwort, kein Fehler:** „zu wenig gemessen" und „nichts gefunden" sind
zwei Aussagen (G-208).

`[read]` **Deshalb KEINE feste Fuenferliste.** Die Regel zaehlt ueber
alle Naehrstoffe; **was oben steht, entscheiden die Daten.** Bei einem
anderen Nutzer stehen andere oben — und genau das soll sie koennen.

### 3 · Der Befund, der einen naiven Flag unbrauchbar macht

`[cmd]` **Drei von 19 Obergrenzen tragen in `notes` eine
Einschraenkung auf Praeparate:**

    MG     „Applies to pharmacological/supplemental magnesium only,
            not magnesium naturally present in foods."
    NIA    „Applies to synthetic niacin from supplements or
            fortified foods."
    FOLAC  „Applies to supplemental folic acid and related synthetic
            forms, not food folate."

`[cmd]` **MG steht auf dev an 87 von 88 Tagen darueber, NIA an 51 von
73 — zusammen 138 von 185 Ueberschreitungen im 90-Tage-Fenster.**

`[read]` **Ohne diese Ausnahme waere der Flag 87-mal falsch** — und
zwar genau bei Magnesium, dem Stoff, nach dem der Auftrag ausdruecklich
fragt.

`[cmd]` **Und es steht NICHT strukturiert da.** Ich habe
`target_applies_to` geprueft, weil der Name danach klingt: **die Spalte
fuehrt Naehrstoffcodes** (welche Stoffe der Wert abdeckt), **keine
Quellenunterscheidung.** `[cmd]` `daily_reference_assessment` liest sie
ohnehin nicht (`prosrc` geprueft).

`[read]` **Die drei stehen deshalb als Liste im Code, mit dem Zitat
daneben.** **Das ist keine erfundene Regel** — es ist die Aussage der
Quelle, strukturell nicht abfragbar. **Als Befund gemeldet:** entsteht
die Spalte je, ersetzt sie die Liste.

### 4 · Die echte Frage: zaehlen Supplemente mit?

**Nein. Die Kette ist gebaut und bricht an drei Stellen.**

`[cmd]` **`supplements.supplement_nutrients` EXISTIERT** — 17 Zeilen,
16 Naehrstoffcodes, **und alle 16 haben einen Richtwert in
`nutrition.nutrient_reference_values`.** Die Verbindung waere also
technisch moeglich.

`[cmd]` **Sie traegt trotzdem nicht:**

    1  daily_reference_assessment nennt `supplements` nirgends
       (prosrc geprueft) - die Bewertung kennt nur Nahrung.
    2  Von dev's 4 Stack-Posten haben nur 2 eine `supplement_id`.
       Magnesium und Vitamin D3 - die beiden, um die es geht -
       haben NULL und koennen gar nicht anschliessen.
    3  Von 360 Einnahmen laufen 90 bis zu einem Naehrstoffcode
       durch, und zwar zu genau EINEM: FAPUN3 (Omega-3), 82 Tage.

`[read]` **Wer Magnesium nimmt und in der Nahrung wenig hat, ist
nicht unterversorgt — das stimmt, und die Daten koennen es heute nicht
sagen.** `[read]` **Ich habe die Verbindung nicht gebaut**, wie
verlangt. **Sie waere kein kleiner Schritt:** es fehlen die
Zuordnungen in `stack_items`, nicht die Tabelle.

`[read]` **Und der Zufall ist boesartig:** ausgerechnet bei Magnesium
faellt die fehlende Verbindung mit der Obergrenze zusammen, die
ohnehin nicht fuer Nahrung gilt. **Beide Wege fuehren zur selben
Vorsicht.**

### 5 · Woraus ein Flag entsteht

    mikro-flags.ts        NEU, serverfrei (A-30)
      flagVon             zaehlt Tage - die eine Stelle, an der
                          aus Werten Dauer wird
      MUSTER_ANTEIL 0.5   ein ANTEIL der bewerteten Tage,
                          keine Prozentschwelle
      MIN_TAGE 4          darunter gibt es keine Aussage
      GRENZE_NUR_SUPPLEMENT   die drei Ausnahmen, mit Zitat
      FLAG_SATZ           je Art ein Satz, ohne Zahl
      dauerSatz           „an 78 von 90 bewerteten Tagen ..."
      sortiere            nach Anteil, nicht nach Hoehe

**Vorgabe 1, Dauer statt Hoehe:** `[cmd]` Ein einzelner Tag bei 5 %
neben 29 guten Tagen erzeugt **kein** Flag (Test 2).

**Vorgabe 2, die Leserichtung:** `[cmd]` Derselbe Prozentwert, zwei
Richtungen, zwei Ergebnisse — **90 % eines Zielwerts sind zu wenig,
90 % einer Obergrenze sind unbedenklich** (Test 5). `range` und `null`
erzeugen gar nichts, statt als Ziel gelesen zu werden.

**Vorgabe 3, Unvollstaendiges ist kein Mangel:** `[cmd]` 60
unvollstaendige Tage neben 30 guten erzeugen **kein** Flag; die
unvollstaendigen stehen im eigenen Zaehler und **der Nenner sind die
BEWERTETEN Tage** (Tests 7-9).

**Warum die Haelfte und keine Prozentzahl:** `[read]` Bei 90 Tagen
traefe ein Drittel schon zu, wenn an zwei von drei Tagen alles in
Ordnung ist. **Die Haelfte sagt: das ist der Normalfall.**
`[cmd]` **Gegen die Daten geprueft:** sie laesst MG (98,9 %) und NIA
(69,9 %) durch und haelt **VITA bei 46,7 %** und MN bei 5,6 %
zurueck. **VITA liegt knapp darunter — der Beleg, dass die Schwelle
unterscheidet, statt alles durchzulassen.**

### 6 · Gegenprobe gegen die echten Daten

`[cmd]` **Die Regel auf den 154 Naehrstoff-Zeilen von dev laufen
lassen (90 Tage bis 2026-08-29) und gegen die SQL-Zaehlung gehalten:**
**identisch.** 10 Flags — WATER 88/88, F18:2CN6 84/90, NACL 78/90,
NA 61/71 (19 Tage unvollstaendig), CA 56/90, VITD 56/90, F18:3CN3
55/90, CLD 15/25 (65 unvollstaendig), MG und NIA als Ausnahme.

### 7 · Die Sabotagen — 6 von 6 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | ein einzelner Tag erzeugt ein Flag | ja |
| 2 | die Dauer zaehlt nicht mehr | ja |
| 3 | die Leserichtung faellt weg | ja |
| 4 | unvollstaendige Tage zaehlen als Mangel | ja |
| 5 | die Magnesium-Ausnahme faellt | ja |
| 6 | die Reihenfolge nach Dauer faellt weg | ja |

**Zwei ueberlebten im ersten Lauf, und beide haben etwas gefunden:**

`[cmd]` **Sabotage 4** ueberlebte, weil **alle meine Tests
unvollstaendigen Tagen `pct: null` gaben** — dann greift schon die
Nullpruefung, und die Statuspruefung wird nie erreicht. **Ein
`incomplete`-Tag MIT Prozentwert lief durch.** Zwei Tests ergaenzt.
**Dabei fiel eine echte Redundanz auf:** ein `continue` im
Fehlzaehler-Zweig war wirkungslos, weil die naechste Zeile denselben
Fall faengt — entfernt.

`[cmd]` **Sabotage 6** ueberlebte, weil mein Sortiertest nur Flags
**verschiedener Art** enthielt: die Art allein legte die Reihenfolge
fest, der Dauer-Vergleich wurde nie erreicht. **Zwei Faelle mit
gleicher Art ergaenzt.**

`[read]` **Das ist derselbe Fehler wie in G-216/G-247/G-246** — die
Pruefung mass etwas anderes als gemeint.

### 8 · Der Leseweg, und ein Kostenbefund

`getNaehrstoffDauer` in `reference-assessment-read.ts`, ueber
`nutrition.reference_assessment_window`.

`[cmd]` **Gemessen mit `explain (analyze, buffers)`, dev,
2026-08-29:**

    7 Tage     149 ms
    30 Tage    642 ms
    90 Tage  1.786 ms      temp read/written 124.792 Bloecke

`[cmd]` **Die Zeit ist die Rechnung selbst, nicht die Auslieferung:**
ein blosses `count(*)` ueber dieselbe Funktion braucht **1.895 ms**,
serverseitiges Zaehlen **1.864 ms.** `[read]` **Ein Filter spart
nichts** — deshalb ist die Funktion nicht in den Seitenaufbau
gehaengt. **Der Aufrufer entscheidet, wann er die Dauer braucht.**

`[read]` **Der billigere Weg existiert und wurde verworfen:**
`daily_nutrient_summary_long` liefert die Tagesmengen in **195 ms**
(Faktor 9) — **aber ohne Bewertung.** Wer daraus Prozentwerte bildet,
rechnet die Referenzlogik ein zweites Mal nach. **Das ist die zweite
Wahrheit, die der Kopf von `reference-assessment-read.ts` und
`mikro-lage.ts` ausschliessen.** **Gemeldet, nicht umgangen** — die
Entscheidung gehoert nicht in einen Flag-Auftrag.

### 9 · Zwei Befunde nebenbei

**a) `getNaehrstoffZeitraum` hat keinen Aufrufer — und traegt den
G-249-Fehler.** `[cmd]` `reference-assessment-read.ts:199` fragt
`.limit(20000)` fuer 12.420 Zeilen (138 Naehrstoffe x 90 Tage), **ohne
`.range()`-Blaetterung.** `[read]` **PostgREST deckelt bei 1.000** —
genau der Fall aus G-249. **Heute schadet es nicht, weil niemand die
Funktion ruft**; wer sie benutzt, bekommt acht Tage statt 90.
**Nicht angefasst** — sie gehoert nicht zu C-323, und A-59 sagt: Code
ohne Aufrufer wird beim naechsten Mal fuer gebaut gehalten.

**b) Mein eigener Leseweg hat das Problem nicht.** `[cmd]`
`reference_assessment_window` liefert **154 Zeilen**, weit unter dem
Deckel; die 13.860 Tageseintraege stecken im jsonb.

### 10 · Was eingehalten wurde

Kein Score (C-324 ist Codex). Keine Tabelle angelegt. Keine
Prozentschwelle als einzige Regel. Keine Warnung erfunden, wo die
Daten unvollstaendig sind. **Nichts auf `dev@lumeos.app` geschrieben**
— nur gelesen. **Nicht committet, nicht gestaget.**

`[cmd]` **Gate:** Build gruen, Typecheck sauber, `[serverimport]` 51
Client-Chunks / 0 Treffer. **274 von 274 Nutrition-Tests gruen**,
davon 18 neue. **Encoding: 20.618 Dateien, sauber, Exit 0.**

**Bildschirmfoto:** `backup/c323-leserichtung.png`.

## Abnahme

_(vom Orchestrator)_
