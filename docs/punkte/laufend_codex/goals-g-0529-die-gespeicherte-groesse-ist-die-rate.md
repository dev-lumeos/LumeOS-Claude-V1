---
nr: G-529
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-28
agent: codex
beauftragt: 2026-09-28

quellen:
  - docs/punkte/todos/goals-g-0521-phasenmodellierung-tiefenrecherche.md
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/specs/Goals/DATABASE.md
  - supabase/migrations/20260927034024_g511_phase_calories.sql

braucht: [G-521]
kind_von: G-521

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.nutrition_targets
    - goals.body_measurements
  dateien:
    - supabase/migrations/20260927034024_g511_phase_calories.sql
    - apps/web/src/lib/goals/phase-regeln.ts

zahlen:
  gemessen: 2026-09-28
  phasenarten_bleiben: 9
  gespeicherte_groesse_alt: kcal
  gespeicherte_groesse_neu: rate
  gewichtsfenster_aggressive_kg: 45-91
---

# G-529 - die gespeicherte Groesse ist die Rate, nicht das Kaloriendelta

## Die Entscheidung

`[cmd]` **Tom, 2026-09-28, E1:** die neun Phasenarten bleiben als
Auswahl fuer den Nutzer. **Die Parameter haengen an der RATE, nicht an
der Art.**

Gespeichert wird eine Zielrate in Prozent Koerpergewicht je Woche.
Die Zielkalorien sind eine **abgeleitete Groesse** aus Rate und
geschaetztem TDEE, keine Eingabe.

## Warum

`[read]` **Zwei unabhaengige Wege fuehren dahin.**

**1. Unsere eigene Messung.** Ein Defizitband in kcal und ein
Ratenband in Prozent erfuellen sich nur in einem Gewichtsfenster:
`fat_loss/aggressive` (-750 bis -1000 kcal gegen 1.0 bis 1.5 %/Woche)
nur zwischen **45 und 91 kg**. Bei 95 kg verlangt 1.0 %/Woche schon
1045 kcal — das Band endet bei 1000. **Ueber 91 kg ist die Phase
unbenutzbar.** Mit 7700 kcal/kg gilt `kcal/Tag = 11 x Rate x Gewicht`.

**2. Die Recherche (G-521, F2).** Helms et al. 2014 parametrisiert
ueber die Rate. MacroFactor verlangt vom Nutzer ausschliesslich die
Zielrate; die Kalorienziele sind Ausgabe. Kein untersuchtes System
speichert feste kcal-Baender.

`[read]` **Die Rate skaliert mit dem Nutzer, das kcal-Band nicht.**
Ein Prozent bei 120 kg ist ein anderes Defizit als bei 50 kg. Genau
das ist der Grund, warum unsere Baender an den Raendern brechen.

## Was das fuer G-511 heisst

`[cmd]` **G-511 speichert das Falsche.** Die gesperrte Migration legt
`calorie_surplus_kcal` beziehungsweise `calorie_deficit` in
`goal_phases.parameters` und laesst `berechne_zielwerte` die
Zielkalorien daraus bestimmen. **Mit dieser Entscheidung ist das
Kaloriendelta eine Ableitung und gehoert nicht in die Parameter.**

`[read]` **Dass G-511 gesperrt ist, war Glueck.** Waere sie
eingespielt, wanderte die Aenderung zweimal durch die Kette: einmal
das Delta hinein, einmal wieder hinaus.

**G-511 geht nicht live, bevor dieser Punkt gebaut ist.**

## Was die Variantenachse betrifft

`[cmd]` **N12 ist damit beantwortet, und zwar anders als beide
Vorschlaege.** Der Recherchebericht widerspricht sich selbst: F3 sagt
,,Varianten streichen", die Abschlusstabelle gibt `moderate` und
`aggressive` verschiedene Maximaldauern (12-16 gegen 4-8 Wochen) und
Pausentakte (8 gegen 4 Wochen).

`[read]` **Die Aufloesung: Dauer und Pausentakt sind Funktionen der
Rate.** Je hoeher die Rate, desto kuerzer die zulaessige Dauer und
desto dichter die Pause. Dann traegt der Name keine Daten mehr.

    kein CHECK auf variant
    kein Default auf variant
    variant wird zur ANZEIGE aus der Rate, nicht zum Speicher

Die drei lebenden Werte (`moderate`, `baseline`,
`performance_placeholder`) sind Testdaten und werden aufgeraeumt
(G-528 A1).

## Nachweiszeilen

**A1** — **zuerst messen, was G-511 aendern muesste**, Zeile fuer
Zeile: welche Stellen der gesperrten Migration bleiben, welche
fallen. Ergebnis ist eine Liste, kein Umbau.

**A2** — die Umrechnung als geprueftes Bauteil, mit der Identitaet
`kcal/Tag = 11 x Rate x Gewicht` als Test. **Die Gegenprobe rechnet
in beide Richtungen** und trifft die Raender: 45 kg und 120 kg.

**A3** — Maximaldauer und Pausentakt als Funktionen der Rate, mit
den Werten aus G-528. **Ein Test je Grenze, von beiden Seiten.**

**A4** — `[read]` **Die Rate braucht einen geschaetzten TDEE, und der
ist heute unbrauchbar** (G-523: alpha = 1.0, keine Glaettung). **G-523
ist damit keine Kosmetik mehr, sondern Voraussetzung** — eine Rate
gegen einen springenden TDEE ergibt ein springendes Ziel.

**A5** — Rangfolge aus G-526 einhalten: wenn die Makroboeden nicht in
das Ziel passen, wird die RATE gesenkt, nicht das Protein.

**A6** — die Anzeige nennt beides, kcal und Prozent (N13), und sagt,
welches davon gespeichert ist.

**A7** — nichts live, bis A1 bis A5 stehen. Wegwerf-Datenbank,
Sicherung nach `backup/`.

## Was dieser Punkt NICHT tut

`[read]` **Er faltet die neun Arten nicht auf drei zusammen.** Die
Recherche empfiehlt das (F1), und es waere ein Schemabruch: das
lebende `goal_phases_phase_type_check`, `DATABASE.md`, `SCORING.md`
und G-519 bauen alle auf neun. **Und es loest contest_prep und
expert_bb_annual ohnehin nicht** — die brauchen eine eigene Struktur
(G-530).

## Drei Kandidaten, nicht zwei

`[cmd]` **Der Schieber im Vorgaengerrepo misst etwas anderes als die
Rate.** G-519 A4 beschreibt ihn als ,,Schieber fuer die
TDEE-Anpassung" mit **-40 % bis +30 %**. Das ist ein Anteil am
VERBRAUCH, nicht am Koerpergewicht je Woche.

Damit lagen nie zwei Modelle auf dem Tisch, sondern drei:

    1  absolute kcal                 unsere Spec
    2  Prozent vom TDEE              das Vorgaengerrepo (-40..+30 %)
    3  Prozent Koerpergewicht/Woche  die Recherche, MacroFactor

`[cmd]` **Entschieden ist 3.**

`[read]` **Prozent vom TDEE hat denselben Baufehler wie absolute
kcal, nur milder:** es skaliert mit dem Verbrauch, nicht mit der
Masse, die abgebaut werden soll. Zwei Nutzer mit -30 % TDEE, einer
mit 100 kg und niedrigem Verbrauch, einer mit 70 kg und hohem
Verbrauch, bekommen voellig verschiedene Raten. Die Groesse, die
der Nutzer steuern will, ist die Rate — alles andere ist ein
Umweg dorthin.

`[read]` **Die Bedienung aus dem Altrepo bleibt trotzdem richtig:**
ein Schieber mit live gerechneten Zielkalorien, ueberschreibbaren
Makros, einer Warnungsbestaetigung und einem Coach-Haekchen. **Nur
die Achse darunter wechselt** — der Schieber fuehrt die Rate, und
die kcal laufen daneben mit (N13).

`[read]` **Wer G-529 spaeter gegen das Altrepo prueft, darf den
Schieber NICHT als Bestaetigung lesen.** Er zeigt eine andere
Groesse. Das ist genau die Verwechslung, die dieser Abschnitt
verhindern soll.

## Warum dieser Punkt kein Entscheidungspunkt mehr ist

`[cmd]` **`sammelfragen-pruefen` hat ihn am 2026-09-28 rot
gemeldet:** `typ: entscheidung` mit sieben Abschnitten.

`[read]` **Hier zaehlt der Waechter einen Stellvertreter** —
Abschnitte statt Fragen. Dieser Punkt traegt EINE Entscheidung
mit ihrer Begruendung, nicht sieben. **Aber die Entscheidung ist
gefallen** (Tom, 2026-09-28, E1), und was bleibt, sind A1 bis A7:
Bauarbeit. Ein Bauauftrag ist `typ: feature`.

`[read]` **Die Abschnitte habe ich NICHT zusammengelegt.** Das
waere Zaehlerpflege statt Inhalt — der Punkt waere gruen und
schlechter zu lesen. Wer den Stellvertreter genauer machen will,
macht das im Waechter, nicht in den Punkten.

## A1 geliefert — 2026-09-28

`[cmd]` **Die Zerlegung in BLEIBT / FAELLT / NEU liegt vor.** Das
wichtigste Einzelergebnis: **der Parameter-Nachzug
`calorie_surplus_kcal` -> `calorie_surplus` faellt vollstaendig** —
beide Namen speichern die verworfene Groesse. Ein Schritt, der
gestern noch richtig war, ist damit erledigt, ohne gelaufen zu
sein.

`[read]` **A2 bleibt bewusst offen: wo liegt die Rate?** JSON ist
flexibel, prueft aber weder Typ noch Einheit; eine Spalte ist
eindeutig, passt aber nicht ohne Weiteres zu allen neun Phasen.
**Das ist die richtige Antwort auf eine Messfrage** — sie legt die
Abwaegung vor, statt zu waehlen.

`[cmd]` **Restbefund, geprueft und praeziser:** die zwei gesperrten
G-511-Schritte stehen als 276 und 277 in `kette.json`. **Sie
spielen nichts live ein** — der Tageslauf geht gegen eine datierte
Wegwerf-Datenbank (`lumeos_tageskette_20260927`). Was sie tun, ist
das Gegenteil: **sie werden taeglich mitgeprueft.**

`[read]` **Der Lauf vom 27.09. kannte G-526 noch nicht.** Der erste
echte Test der neuen Struktur ist der Lauf heute Nacht. Faellt er,
faellt `punkte-pruefen` mit — `kettenlauf-status-pruefen` haengt
darin.

## A2 entschieden — 2026-09-28: Spalte, nicht JSON

Tom, 2026-09-28: *,,ich bin nicht freund von externen json wenn wir
mit datenbanken arbeiten"* und *,,mach die beste funktionierende
loesung."*

### Der Schnitt

`[read]` **Die Rate ist nicht ein Parameter wie die anderen.** Sie
ist die EINE Groesse, von der die ganze Rechnung haengt, und sie hat
in jeder kalorientragenden Phase dieselbe Bedeutung und dieselbe
Einheit. Alles andere in `parameters` ist phasenspezifisch in der
FORM: `carb_depletion_days` nur bei `peak_week`, `sub_phases` nur
bei `contest_prep`, Trainings- und Ruhetagsdelta nur bei `recomp`.

**Eine Groesse mit fester Bedeutung gehoert in eine Spalte. Ein Sack
unterschiedlich geformter Zusaetze bleibt JSON.**

### Der Beleg, warum JSON hier der falsche Ort ist

`[cmd]` **Der Schaden ist in diesem Repo eingetreten, nicht
hypothetisch.** Fuer dieselbe Groesse waren zwei Schluesselnamen im
Umlauf — `calorie_surplus_kcal` und `calorie_surplus` — und es
brauchte einen Kettenschritt, der **abbricht, wenn eine Zeile beide
traegt und sie sich widersprechen**
(`511_goals_phase_parameter_name.sql`).

`[read]` **Praezise, damit nichts uebertrieben wird:** eine Zeile
mit BEIDEN Schluesseln wurde live nicht gemessen. Belegt ist, dass
zwei Namen fuer einen Wert existierten und ein Waechter dagegen
noetig wurde. **Eine Spalte kann diese Fehlerklasse nicht haben.**

### Die zwei Ebenen

**1. Der gewaehlte Wert — Spalte auf `goals.goal_phases`:**

    zielrate_pct_kg_woche  numeric(5,3)  NULL erlaubt

mit zwei CHECKs:

    goal_phases_zielrate_passt_zur_art
      fat_loss, mini_cut    NOT NULL und < 0
      lean_bulk             NOT NULL und > 0
      maintenance           NULL oder Betrag <= 0.1
      peak_week             NULL
      expert_bb_annual      NULL
      contest_prep, reverse_diet, recomp   -> siehe A2b

    goal_phases_zielrate_aussengrenze
      NULL oder zwischen -2.5 und 1.5
      (Tippfehlerschutz, KEINE Spec-Spanne)

`[read]` **Codex' Gegenargument dreht sich beim Hinsehen um.**
",,Passt nicht zu allen neun Phasen" ist der GRUND fuer die Spalte:
eine nullable Spalte mit CHECK sagt genau, welche Art eine Rate
traegt und welche nicht. **JSON kann ,,muss bei `peak_week` fehlen"
praktisch nicht ausdruecken.**

**A2b (neu)** — `[annahme]` **Drei Arten sind offen und werden
gemessen, nicht behauptet:** `reverse_diet` wird ueber einen
Wochenschritt in kcal parametrisiert, `recomp` ueber Trainings- und
Ruhetagsdelta, `contest_prep` ueber die Unterphase am Termin. Keine
dieser drei ist eine Rate. **Ob sie die Spalte leer lassen oder eine
abgeleitete Rate tragen, entscheidet die Messung.**

**2. Die erlaubte Spanne — eine eigene Regeltabelle:**

`[cmd]` `goals.nutrition_macro_rules` (G-526, heute gebaut) hat
genau den richtigen Bauplan: `phase_type`, `experience_level`,
`lower_value`/`upper_value`, `evidence_status`, und die CHECKs, dass
eine offene Regel KEINE Zahl tragen darf und eine belegte Quelle UND
Fundstelle braucht.

`[cmd]` **Sie passt nur nicht hinein:** ihr CHECK lautet
`nutrient IN ('protein','fat','carbohydrate','fiber')`, und eine
Rate ist kein Naehrstoff.

**A2c (neu)** — eine Schwestertabelle `goals.phase_rate_rules` mit
demselben Bauplan und denselben CHECKs. **Nicht abschreiben —
dieselben Zusicherungen erzeugen.**

### Was das aufloest

`[read]` **N13 ist damit sauber verteilt:** die Regeltabelle haelt
die Schiene (Spec-Spannen, mit Beleg oder ohne Zahl), die Phasenzeile
haelt den gewaehlten Wert (den Schieber), die kcal sind abgeleitet
und werden angezeigt. **Drei Dinge, drei Orte, keiner doppelt.**

### Der Preis, ehrlich

`[read]` **Eine Spalte heisst: eine Migration bei jeder
Modellaenderung** — und das Modell hat sich heute geaendert. Kippt F2
der Recherche spaeter, ist eine Spalte eine Migration zum
Zuruecknehmen, ein JSON-Schluessel nur ein Schreibstopp.

**Der Preis ist richtig:** die Kollisionsgefahr ist gemessen, die
Modellaenderung ist hypothetisch, und die betroffene Migration ist
gesperrt und nie gelaufen. Eine gesperrte Migration umzuschreiben
kostet nichts.

### Zur Benennung

`[read]` **Die Spalte heisst deutsch, die Tabelle englisch, und das
ist Absicht, nicht Schlamperei.** `goal_phases` traegt seine neueren
Spalten deutsch (`gueltig_ab`), und die Schwestertabelle von
`nutrition_macro_rules` traegt dessen Sprache. Jedes Objekt folgt
seiner Nachbarschaft. Die gemischte Benennung im Repo ist eine
aeltere Sache und wird hier nicht mitentschieden.

## Abnahme A5 bis A8 — 2026-09-28

`[cmd]` **Gebaut, 7/7 gruen, nichts live** — die Spalte, die
Regeltabelle und die Spalte selbst haben im laufenden Schema null
Treffer (selbst gemessen).

`[cmd]` **Die Spalte steht wie festgelegt:**
`zielrate_pct_kg_woche numeric(5,3)`, Aussengrenze `-2.5 bis 1.5`,
dazu die Phasenartgrenze mit Vorzeichen je Art.

`[cmd]` **`goals.phase_rate_rules` ist leer und quellpflichtig** —
offene Regeln duerfen keine Zahl tragen, belegte brauchen Quelle und
Fundstelle. **Beidseitige Trigger** verhindern, dass eine Phase oder
eine nachtraeglich eingefuegte Regel der anderen widerspricht.
**Ohne belegte Regel gilt nur die Aussengrenze** — genau die
Unterscheidung aus A8 zwischen ,,keine Regel" und ,,Regel erlaubt
alles".

`[cmd]` **Der Phasenart-CHECK ist `NOT VALID`**, weil zwei
bestehende `lean_bulk`-Zeilen noch keine Rate haben. **Neue und
geaenderte Zeilen werden geprueft, der Altbestand wird nicht
geraten.** Dieselbe Bauform wie in G-511 — und die zwei Zeilen sind
Testdaten aus `GO-07`, also mit G-528 A1 aufzuraeumen. **Danach kann
der CHECK validiert werden.**

### A6 entschieden — 2026-09-28, Orchestrator

Codex hat A6 offen vorgelegt und empfohlen, die Spalte bei
`reverse_diet`, `recomp` und `contest_prep` NULL zu lassen und eine
errechnete Momentanrate nur abzuleiten, nicht zu speichern.
**Die Empfehlung ist richtig und wird erzwungen, nicht nur notiert.**

`[read]` **Der Grund:** eine nullable Spalte, die bei drei
Phasenarten ,,nicht gefuellt werden sollte", wird gefuellt. Eine
weiche Regel ohne CHECK ist genau das, was A-75 und A-76 zu diesem
Repo sagen.

`[read]` **Der Preis ist klein und umkehrbar:** ein CHECK, der NULL
erzwingt, laesst sich lockern, wenn G-530 fuer `contest_prep` je
Unterphase doch eine Rate braucht. Garbage in einer Spalte laesst
sich nicht zurueckrechnen.

**A9 (neu)** — die drei Arten tragen `zielrate_pct_kg_woche IS
NULL` im Phasenart-CHECK, mit einem Kommentar, der auf G-530
verweist. **Ein Test je Art, von beiden Seiten.**
