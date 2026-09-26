---
nr: C-548
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
  uebungen: 1416
---

# C-548 - fuenf Spalten mit einem Wert fuer 1.416 Uebungen

## Toms Vorgabe

Tom, 2026-09-08: *,,die grundlagen und die exercises sauber
aufgesetzt"*

## Gemessen

    Spalte            gefuellt   verschiedene Werte
    name               1.416      1.416
    instructions       1.416      1.357
    media_paths        1.416      1.378
    tips               1.412      1.181
    equipment_id       1.416         58
    discipline         1.416          5
    discipline_rule    1.416          5
    category           1.416          3
    exercise_type      1.416          1   <- strength
    tracking_type      1.416          1   <- weight_reps
    difficulty         1.416          1   <- intermediate
    sort_weight        1.416          1
    source             1.416          1

## Der Widerspruch

`[cmd]` **`discipline` traegt fuenf Werte:**

    Strength    777
    Bodyweight  511
    Stretching  108
    Yoga         11
    Cardio        9

`[read]` **128 Uebungen sind Dehnung, Yoga oder Ausdauer ? und
ALLE tragen `exercise_type: strength` und `tracking_type:
weight_reps`.**

`[read]` **Ein Lauf wird nicht in Gewicht x Wiederholungen
gemessen, eine Dehnung nicht in Saetzen.**

## Warum tracking_type der schwerste ist

`[cmd]` **Er entscheidet, welche Felder beim Erfassen
erscheinen** ? **MISS, wer ihn liest, bevor du ihn
aenderst.**

`[cmd]` **396 Saetze liegen vor** ? **sie sind alle als
`weight_reps` erfasst. Eine Aenderung darf sie nicht
entwerten.**

## Zu messen, je Spalte

    A  wer liest sie? Oberflaeche, Datenbank, Coach.
    B  laesst sich der richtige Wert ABLEITEN?
       discipline und equipment sagen viel:
       Stretching + kein Geraet -> kaum weight_reps.
    C  wie viele lassen sich sicher setzen,
       wie viele nicht?
    D  was passiert mit den 396 bestehenden Saetzen?

`[read]` **`difficulty` ist ausgelagert nach C-545** ? **hier
geht es um die anderen vier.**

`[read]` **MESSEN und EMPFEHLEN je Spalte** ? **eine Spalte,
die niemand liest, braucht keine Kuration, sondern eine
Entscheidung, ob sie bleibt.**

## Abnahmebedingungen

    A1  je Spalte: wer liest sie? TABELLE.
    A2  je Spalte: ableitbar? An einer Stichprobe
        belegt.
    A3  die 128 Nicht-Kraftuebungen: welcher
        tracking_type waere richtig?
    A4  was passiert mit den 396 Saetzen?
    A5  je Spalte eine Empfehlung: setzen, ableiten
        oder streichen.
    A6  KEINE Umsetzung.

## Bericht, 2026-09-25, Codex

### Vier Quellen

- **Code:** `training.exercises`, die aktuellen Training-Leser,
  Datenbankfunktionen und Sichten sowie die Import-Pipeline wurden
  nach allen fuenf Spalten durchsucht.
- **Daten:** 1.416 Uebungen und 396 Saetze wurden live nur lesend
  vermessen. Die oben genannten Ein-Wert-Verteilungen gelten am
  2026-09-25 weiterhin.
- **Spec und Mockup:** `SPEC_02`, `SPEC_05`, `SPEC_06`, `SPEC_07`,
  `SPEC_08` und `SPEC_10` sowie die vier Training-Mockups wurden
  gelesen. `SPEC_08:222-242` enthaelt eine beabsichtigte
  Tracking-Ableitung; ihre Voraussetzungen stimmen nicht voll mit
  dem heutigen Katalog ueberein.
- **Vorgaengerrepo:** Migration, Training-Typen und Exercise-API
  wurden gelesen. Dort entstanden dieselben Defaults. Die alte API
  gab drei Felder aus und filterte nach `exercise_type`, verwendete
  `tracking_type` und `difficulty` aber nicht zur Erfassung.

### A1 - heutige Leser

| Spalte | Oberflaeche heute | Datenbank / Coach heute | Bereits beschriebener spaeterer Leser |
|---|---|---|---|
| `exercise_type` | keiner | keine Sicht/Funktion; Coach keiner | Spec-API-Filter und Suchgewichtung |
| `tracking_type` | keiner; die heutige Training-Ansicht liest es nicht | keine Sicht/Funktion; Coach keiner | Spec-Erfassungsformular fuer Gewicht, Wiederholungen, Dauer oder Distanz |
| `difficulty` | keiner | keine Sicht/Funktion; Coach keiner | Spec-Filter und Sortierung; vollstaendig in C-545 untersucht |
| `sort_weight` | bewusst nicht gelesen; `uebungen-read.ts` nennt den konstanten Wert und sortiert nach Name | nur der ungenutzte Index; keine Sicht/Funktion | Spec-Relevanzformel |
| `source` | keiner | keine Sicht/Funktion; Coach keiner | Herkunft/Nachvollziehbarkeit des Katalogimports |

Die Konstanz verursacht heute noch keine falsche Anzeige, weil kein
produktiver Leser die Werte benutzt. Sie wird zum Fehler, sobald die
in der Spec vorgesehenen Filter und Eingabefelder angebunden werden.

### A2 - was sich ableiten laesst

Fuer `exercise_type` ergibt die widerspruchsfreie Taxonomie:

| Zielwert | Zahl | Ableitung |
|---|---:|---|
| `strength` | 777 | `discipline=Strength` |
| `cardio` | 9 | `discipline=Cardio` |
| `stretching` | 108 | `discipline=Stretching` |
| `yoga` | 11 | `discipline=Yoga` |
| `calisthenics` | 411 | `discipline=Bodyweight` und `category=Bodyweight` |
| vorerst unklar | 100 | `discipline=Bodyweight`, aber `category=Free Weights` (14) oder `Resistance` (86) |

Die 100 Reste sind echte Widersprueche. Beispiele sind `Barbell
squat back POV`, `Barbell Alternate Biceps Curl` und `Band Bench
Press`: Der Disziplinwert sagt Koerpergewicht, Name und Kategorie
sagen externe Last. Sie duerfen nicht automatisch zu
`calisthenics` werden. Damit sind **1.316 von 1.416**
`exercise_type`-Werten ableitbar und 100 offen.

Fuer `tracking_type` ist die Grenze enger. Die Spec-Regel wuerde auf
den 411 konsistenten Bodyweight-Zeilen anhand der Wortstaemme
`plank`, `hold`, `wall sit` und `hang` 34 Dauer- und 377
Wiederholungsuebungen erzeugen. Die Gegenprobe widerlegt die sichere
Automatik: Unter den 34 stehen `Hanging knee raises`, `Plank jack`,
`Plank shoulder taps` und `Elbow-Up and Down Dynamic Plank` - alles
wiederholungsbasierte Bewegungen. Ein Wortstamm bestimmt die Messart
nicht.

Sicher auf Gruppenebene ableitbar sind deshalb zunaechst 905 Zeilen:

    Strength      777 -> weight_reps
    Stretching    108 -> duration
    Yoga           11 -> duration
    Cardio          7 -> duration
    Cardio          2 -> distance_duration

Die **511 Bodyweight-Zeilen** brauchen eine echte Kuration aus
Bewegungsablauf und erlaubter Zusatzlast. 100 davon tragen schon auf
Kategorieebene widerspruechliche Angaben; fuer die anderen 411
liefert die Spec-Regel nur Kandidaten, keine sichere Zuordnung.

`sort_weight` ist derzeit fuer **0 von 1.416** fachlich voll
ableitbar. Die Spec-Formel braucht unter anderem
`evaluation_score`, `movement_pattern`, `stretch_position` und eine
echte Schwierigkeit; diese Grundlagen fehlen beziehungsweise sind
pauschal. Der konstante Wert 500 ist nur ein Default.

`source` ist dagegen fuer **1.416 von 1.416** belegt: Der generierte
Seed nennt als Quelle den Legacy-Export
`backup/legacy-v2/training/exercises.json`, und dieser homogene
Bestand stammt aus `exercise_animatic`. Ein konstanter Quellenwert
ist hier eine reale gemeinsame Herkunft, keine Klassifikation.

### A3 - die 128 Nicht-Kraftuebungen

Die richtige Katalogvorgabe ist:

    Stretching   108 -> duration
    Yoga          11 -> duration
    Cardio         7 -> duration
    Cardio         2 -> distance_duration

Die beiden Distanzfaelle sind `Gym Rowing Machine Normal Speed` und
`Stationary Exercise Bike`. Das Equipment verhindert dabei den
falschen Wortstamm-Treffer `Jump Rope row`: Es ist ein Springseil
und kein Rudergeraet.

### A4 - die 396 bestehenden Saetze

Alle 396 Saetze haben `reps` **und** `weight_kg`; keiner hat
`duration_seconds` oder `distance_meters`:

    Strength       254 Saetze
    Bodyweight     103 Saetze
    Cardio          30 Saetze
    Stretching       9 Saetze

Eine reine Katalogaenderung loescht keine Satzzeile. Ein spaeteres
Formular, das alte Saetze nur nach dem **heutigen** Trackingtyp der
Uebung rendert, wuerde aber die 39 Cardio-/Stretching-Saetze sicher
falsch ausblenden oder umdeuten; fuer 103 Bodyweight-Saetze ist die
Zielart noch zu kurieren. Die Messart eines bereits gespeicherten
Satzes muss deshalb aus seinen eigenen belegten Feldern
beziehungsweise einem Satz-Snapshot folgen. Der neue Katalogwert
darf nur die kuenftige Eingabe steuern.

### A5 - Empfehlung je Spalte

- **`exercise_type`: ableiten und Reste kurieren.** Die 1.316
  widerspruchsfreien Zeilen folgen aus der Taxonomie; die 100
  Konflikte werden gemeldet und einzeln geklaert.
- **`tracking_type`: die 128 Nicht-Kraft- und 777 Kraftuebungen
  ableiten, Bodyweight kurieren.** Vor Anbindung muss der Altbestand
  der Saetze unabhaengig vom aktuellen Uebungswert lesbar bleiben.
- **`difficulty`: nicht hier setzen.** Ergebnis und Empfehlung stehen
  in C-545.
- **`sort_weight`: vorerst nicht kurieren.** Entweder werden zuerst
  die fehlenden Eingangsmerkmale gebaut und die Spec-Formel benutzt,
  oder Tom entscheidet, die ungenutzte Spalte zu entfernen. Eine
  neue Pauschale waere kein Fortschritt.
- **`source`: behalten.** Der Wert ist gemeinsame Provenienz. Bei
  weiteren Importen sollte er als kontrollierte Quellenkennung statt
  als frei geratener Text fortgefuehrt werden.

### A6 - keine Umsetzung

C-548 hat weder Schema noch Katalogdaten noch `apps/` geaendert. Der
Dev-Server wurde nicht beruehrt und es wurde nicht committed.

## Abnahme

_(vom Orchestrator)_
