---
nr: G-216
typ: feature
modul: training
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen:
    - training.workout_sessions
    - training.workout_exercises
    - training.workout_sets
  dateien:
    - apps/web/src/lib/training
zahlen:
  gemessen: 2026-08-28
  schreibstellen: 0
  lesestellen: 4
  seiten: 9
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: 53560696
---

# G-216 — Training hat Daten und keinen Schreibweg

## Befund

`[cmd]` **Gemessen 2026-08-28:** `apps/web/src/lib/training/` hat
**4 Lesestellen und 0 Schreibstellen**, bei 9 Seiten unter
`app/v2/training/`. **Das einzige Modul ohne Schreibweg.**

`[cmd]` **Die Daten sind da:**

    exercises                  1.416
    exercise_muscles           6.625
    exercise_catalog_enrichment 1.407
    workout_sessions              66
    workout_exercises            132
    workout_sets                 238

`[read]` **Ein Nutzer kann kein Training erfassen.** Die 66 Sitzungen
stammen aus Seed-Daten.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

`[read]` **Und pruef zuerst, was es schon gibt.** `[cmd]` **In G-138
war meine ganze Praemisse falsch** — der Schreibweg existierte seit
G-148, und der Punkt hatte englische Vorlagennamen gegen deutschen
Code verglichen.

### Zu tun

**Eine Trainingssitzung erfassen: anlegen, Uebungen hinzufuegen,
Saetze eintragen, abschliessen.**

`[cmd]` **Drei Tabellen haengen zusammen** — `workout_sessions`
traegt als einzige `user_id`, `workout_exercises` und `workout_sets`
haengen darunter.

`[read]` **Das ist der Unterschied zu deinen bisherigen drei
Schreibwegen:** bei G-138, G-211 und G-122 war es je eine Zeile.
**Hier entsteht ein Baum, und er entsteht schrittweise** — jemand
faengt an, traegt zwischendurch ein, hoert auf.

`[read]` **Die Frage, die daraus folgt und die du beantworten musst:**
was passiert mit einer Sitzung, die begonnen und nie abgeschlossen
wurde? **Bleibt sie offen, wird sie verworfen, zaehlt sie?** `[cmd]`
Pruef, ob das Schema die Antwort schon vorgibt.

### Was aus den drei vorherigen uebernommen gehoert

**Die Naht.** `[read]` In G-122 war es *,,eine einfache, kein zweites
Ende"*, in G-138 *,,eine Naht mit zwei Enden"*. **Pruef, welche Form
hier passt, und sag es.**

**Snapshots, wo etwas einfrieren muss.** `[cmd]` In G-138 war das der
eigentliche Nachweis: Stack-Dosis geaendert, alte Einnahmen
unveraendert. `[read]` **Hier waere die Frage: wenn eine Uebung im
Katalog umbenannt oder geaendert wird, aendert sich dann ein
Trainingsprotokoll von letzter Woche?**

**Und der Fall, den es vielleicht nicht gibt.** `[read]` In G-122 gab
es keinen dritten Zustand, **weil er strukturell nicht entstehen
kann** — das war ein gueltiges Ergebnis.

### Was nicht zu tun ist

**Keine eigene Uebung anlegen koennen** — das ist **E-17**, eigene
Tabelle im Profil, und die Tabelle gibt es noch nicht.
**Keine Tabelle anlegen** — `supabase/_pipeline/` gehoert Codex, er
arbeitet an C-328.
**Kein Trainingsplan, keine Vorlagen** — nur Erfassung.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Sitzung anlegen             Zeile da, `user_id` gesetzt
    Uebung hinzufuegen          haengt an der Sitzung
    Saetze eintragen            haengen an der Uebung
    abschliessen                Zustand unterscheidbar
    unterbrochen liegenlassen   was passiert - belegt
    Snapshots falls noetig      Gegenprobe wie in G-138
    Schreibstellen              Zahl, und welche Form
    Attrappen im neuen Code     Soll 0
    Rueckbau                    gezaehlt, `dev` unberuehrt
    Bildschirmfoto je Zustand   `node tools/schuss.mjs`

`[read]` **Negativprobe:** einen Satz an eine Uebung schreiben, die
nicht zur Sitzung gehoert. `[cmd]` **Pruef, ob ein Fremdschluessel das
erzwingt** — bei `medication_products` und `user_medications` war es
so, **und dann ist *,,strukturell ausgeschlossen"* das Ergebnis. Kein
Constraint loesen, um es doch zu zeigen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.
`[cmd]` **Schreibende Nachweise auf `test-user@lumeos.local`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Die Praemisse stimmt diesmal** — und die beiden Fragen des
Auftrags beantwortet das Schema, nicht ich.

### Die Praemisse, zuerst geprueft

`[cmd]` **0 Schreibstellen bestaetigt.** `rg` ueber
`lib/training/` und `app/v2/training/` nach
`.insert(|.update(|.upsert(|.delete(` — **kein Treffer** (gemessen
2026-08-28). Die vier Lesestellen sind `auswertung.ts`,
`readiness-read.ts`, `sitzungen-read.ts`, `uebungen-read.ts`.

`[read]` **Eine Datei sah nach einem Schreibweg aus und ist keiner:**
`app/v2/training/uebungen-aktion.ts` traegt `'use server'`, ruft aber
nur `getUebungen()` — eine Serveraktion zum Lesen (G-64). `[cmd]` Und
`modale.tsx:761` traegt einen Knopf *„Add to session"* als
`InEntwicklungKnopf`. **Das ist die Attrappe, die der Bildschirmschuss
zaehlt.**

### Frage 1: die unterbrochene Sitzung

**Der Auftrag: *„Bleibt sie offen, wird sie verworfen, zaehlt sie?
Pruef, ob das Schema die Antwort schon vorgibt."***

`[cmd]` **Das Schema gibt sie vollstaendig vor.**
`workout_sessions_status_check` erlaubt
`planned | active | completed | cancelled`, `ended_time` ist
`NULLABLE`, und `workout_sessions_check` verlangt nur
`ended_time IS NULL OR ended_time >= started_time`.

`[read]` **`active` mit `ended_time IS NULL` IST der offene Zustand.
Er war da, es hat ihn nur nie jemand geschrieben.** Eine
unterbrochene Sitzung **bleibt offen** — sie wird weder verworfen
noch zaehlt sie als Leistung.

`[cmd]` **Im Bestand ist er unbenutzt:** 36 `completed`, 28
`planned`, 2 `cancelled`, **0 `active`** (66 Sitzungen, gemessen
2026-08-28).

`[cmd]` **Und der Leseweg traegt es schon:** `sitzungen-read.ts:124`
setzt `absolviert` aus dem **Datum**, nicht aus `status` — die
Entscheidung aus G-69. **Eine offene Sitzung von gestern ist damit
`absolviert: true` und `status: 'active'`; wer sie vergleicht, sieht
die ausgefallene Einheit.** Ich habe daran nichts geaendert.

`[cmd]` **Live belegt:** die Nachweissitzung stand nach dem Anlegen
auf `status=active, ended_time=null, duration_minutes=null` und
liess sich in diesem Zustand liegen — 1 Uebung, 2 Saetze darunter.

**Ein Befund am Rand, den ich nicht repariert habe:** `[cmd]` **alle
28 `planned`-Sitzungen tragen eine `ended_time`.** `[read]` Fuer
etwas, das noch nicht stattgefunden hat, ist das sinnlos. **Der neue
Schreibweg erzeugt es nicht** — `ended_time` entsteht erst beim
Abschliessen. Die 28 alten Zeilen sind Seed-Daten und bleiben, wie
sie sind.

### Frage 2: der Snapshot

**Der Auftrag: *„Wenn eine Uebung im Katalog umbenannt wird, aendert
sich dann ein Trainingsprotokoll von letzter Woche?"***

`[cmd]` **Nein — und die Spalte dafuer gibt es bereits.**
`workout_exercises.exercise_name` ist `NOT NULL` und **keine
Fremdschluesselspalte**; `exercise_id` steht als Verweis daneben.

`[cmd]` **Gegenprobe wie in G-138, live gefahren:**

    vorher     Katalog „Arm circle"                Protokoll „Arm circle"
    umbenannt  Katalog „Arm circle (G-216 …)"      Protokoll „Arm circle"   <- unveraendert
    Leseweg    liest exercise_name                 „Arm circle"
    zurueck    Katalog „Arm circle"                gleich = t

`[read]` **Der Snapshot friert beim SCHREIBEN ein**, wie
`dose_snapshot` (G-138) und `height_cm_snapshot` (G-122) — aus dem
Katalog kopiert, danach nie nachgeschlagen, **auch nicht beim
Aendern**. Ein Waechter prueft genau das: das `update` auf
`workout_exercises` darf `exercise_name` nicht enthalten.

`[cmd]` **Dass im Bestand alle 132 Zeilen namensgleich sind, beweist
nichts** — es heisst nur, dass seit dem Seed niemand umbenannt hat.
**Deshalb die Gegenprobe.**

### Die Form der Naht

**Der Auftrag: *„In G-122 eine einfache, in G-138 eine mit zwei
Enden. Pruef, welche Form hier passt, und sag es."***

`[read]` **Keine von beiden — es ist eine Naht ueber einen BAUM.**
Der Unterschied ist nicht die Zahl der Dateien, sondern dass die drei
Tabellen **nicht gleichrangig** sind:

`[cmd]` `workout_sessions` traegt als einzige `user_id`.
`workout_exercises` haengt per FK daran (`ON DELETE CASCADE`),
`workout_sets` an der Uebung (ebenfalls `CASCADE`). **Die Sitzung ist
der einzige Ort, an dem Eigentuemerschaft entsteht.**

`[cmd]` **Eine Datei, drei Ebenen, vier Schritte:**
`beginneSitzung` → `fuegeUebungHinzu` → `trageSatzEin` →
`schliesseSitzungAb`, dazu `verwerfeSitzung`.

`[cmd]` **Der Waechter zaehlt je Tabelle** — drei Tests, jeder
verlangt genau `/src/lib/training/sitzung-write.ts`. Gemessen: **1
Schreibstelle** im ganzen Modul.

### Was ich NICHT fortgeschrieben habe, und warum

`[cmd]` **Von 36 Seed-Sitzungen mit Saetzen fuehrt nur bei 14 das
`total_sets` die richtige Zahl** — `total_reps` ebenfalls bei 14.
**Eine Sitzung fuehrt 6 und hat 7.**

`[read]` **Ein hochgezaehlter Zaehler ist nach dem ersten
Fehlschlag dauerhaft falsch.** Deshalb liest die Naht nach jeder
Aenderung die Saetze und rechnet die Aggregate neu — teurer, aber
nie falsch. `aggregat()` steht serverfrei in `sitzung-regeln.ts` und
ist ohne Datenbank getestet.

### Die Negativprobe — und dass ich sie erst falsch gestellt habe

**Der Auftrag: *„Einen Satz an eine Uebung schreiben, die nicht zur
Sitzung gehoert. Pruef, ob ein Fremdschluessel das erzwingt."***

`[cmd]` **Mein erster Lauf hat sie falsch gestellt** — er nahm eine
Uebung aus einer **anderen Sitzung desselben Nutzers**. Der Satz ging
durch, **zu Recht**: test-user darf in seine eigene aeltere Sitzung
schreiben. **Das war meine Fehlmessung, kein Befund.** Der falsch
geschriebene Satz (`set_number 99`) ist im Rueckbau mitgezaehlt.

`[cmd]` **Richtig gestellt gegen eine Uebung von `dev`:**

    LESEN der dev-Uebung:      0 Zeilen
    SCHREIBEN an die Uebung:   42501 — new row violates
                               row-level security policy
                               for table "workout_sets"

`[read]` **Es ist kein Fremdschluessel, es ist der Zeilenschutz — und
der ist strenger.** `workout_sets_insert` traegt als `WITH CHECK`
einen `EXISTS`-Verbund ueber zwei Ebenen bis auf
`s.user_id = auth.uid()`. **Ein Fremdschluessel wuerde nur pruefen,
dass die Uebung existiert; diese Bedingung prueft, wem sie gehoert.**

**Damit ist *„strukturell ausgeschlossen"* das Ergebnis.** Kein
Constraint geloest.

### Der Durchstich, Schritt fuer Schritt

`[cmd]` Angemeldet als `test-user@lumeos.local`, gegen die laufende
Datenbank:

    Sitzung anlegen      491cbc23…  status=active  ended=null
    Uebung anhaengen     059bc942…  snapshot="Arm circle"  order=1
    zwei Saetze          8x80 und 6x90, volume 640 / 540
    offen liegenlassen   active, ohne ended_time, ohne Dauer
    Aggregate            total_sets 2, total_reps 14, Volumen 1180
    abschliessen         completed, ended 19:10, Dauer 70 min

### Nachweisliste

    Sitzung anlegen             [cmd] Zeile da, user_id gesetzt
    Uebung hinzufuegen          [cmd] haengt per FK an der Sitzung
    Saetze eintragen            [cmd] 2 Saetze, haengen an der Uebung
    abschliessen                [cmd] active -> completed, Dauer 70
    unterbrochen liegenlassen   [cmd] bleibt active, ended_time null
    Snapshot                    [cmd] Gegenprobe gefahren, haelt
    Schreibstellen              [cmd] 1, eine Naht ueber einen Baum
    Attrappen im neuen Code     [cmd] 0
    Rueckbau                    [cmd] gezaehlt, dev unberuehrt
    Bildschirmfoto              [cmd] backup/g216-training-verlauf.png

### Die Waechter fallen — jede Sabotage einzeln geprueft

`[cmd]` **Sechs Sabotagen, sechs Ausfaelle**, Datei danach
byte-identisch (SHA-256 `98df96bb…` vorher wie nachher):

    Snapshot nachschlagen statt einfrieren    faellt
    neue Sitzung gleich abgeschlossen         faellt
    offene Sitzung mit Endzeit                faellt
    Snapshot beim Aendern nachziehen          faellt
    verwerfen loescht                         faellt
    Schreibzugriff ohne .select (G-79)        faellt

`[read]` **Der letzte fiel beim ersten Versuch NICHT — und das war
mein Fehler, nicht der der Sabotage.** Die erste Fassung verglich
die **Anzahl** `.select(` mit der Anzahl `.insert|update(`; ein
Zugriff mit zwei `.select()` glich den Verlust bei einem anderen
aus. **Genau die Klasse „eine Pruefung misst etwas anderes als
gemeint" aus `CLAUDE.md`.** Jetzt wird jede Anweisung einzeln
betrachtet, und die Sabotage faellt.

`[cmd]` **35 Tests gruen** im Trainingsmodul (20 neu, 15 bestehende),
Typecheck sauber, `serverimport-pruefen.mjs` 0 Treffer (A-30),
`encoding-pruefen.mjs` 20.524 Dateien sauber.

### Rueckbau, gezaehlt

`[cmd]` **Angelegt: 1 Sitzung, 1 Uebung, 3 Saetze** (2 gewollte + 1
aus der falsch gestellten Negativprobe). **Geloescht: alle.** Der
Baum ueber `CASCADE`, der Fremdsatz einzeln.

    training.workout_sessions   66   vorher 66
    training.workout_exercises  132  vorher 132
    training.workout_sets       238  vorher 238
    test-user Sitzungen          6   vorher 6
    dev Sitzungen               30   unveraendert
    Katalogname                 „Arm circle"  zurueckgedreht

`[cmd]` **`dev@lumeos.app` unberuehrt.** Nicht committet, nicht
gestaged.

### Abgrenzung der Zahlen

**Alle Zahlen sind von mir gemessen**, am 2026-08-28 gegen die
laufende Datenbank.

`[cmd]` **Die drei Zahlen des Auftrags stimmen:** 4 Lesestellen, 0
Schreibstellen, 9 Seiten unter `app/v2/training/` — nachgezaehlt,
keine Abweichung. Ebenso 1.416 Uebungen, 6.625 Muskelzuordnungen, 66
Sitzungen.

`[read]` **Abgrenzung bei „Schreibstellen":** gezaehlt werden
**Dateien**, die `from('<tabelle>')` **und** einen der vier
Schreibaufrufe enthalten, Kommentare vorher entfernt — dieselbe
Regel wie der Waechter aus G-122. **Eine Datei mit drei `insert`
zaehlt als eine Stelle.**

`[read]` **Abgrenzung bei „Attrappen":** 0 bezieht sich auf die drei
**neuen** Dateien. `[cmd]` Die Seite `/v2/training?tab=history`
zeigt weiterhin **1 Attrappe** — den `InEntwicklungKnopf` *„Add to
session"*. **Der ist die Oberflaeche, nicht der Schreibweg**, und
stand nicht im Zuschnitt.

### Was fehlt, und was ich bewusst nicht gebaut habe

`[read]` **Der Schreibweg hat noch keine Oberflaeche.** Der Auftrag
verlangt *„Bildschirmfoto je Zustand"*; **je Zustand gibt es keinen
Bildschirm** — es gibt die Naht und ihre Zustaende in der Datenbank.
Der Schuss zeigt deshalb den heutigen Verlaufsreiter mit der
Attrappe, die den fehlenden Weg markiert. **Das melde ich, statt es
passend zu machen.**

**Nicht gebaut, weil ausgeschlossen:** keine eigene Uebung (E-17,
Tabelle fehlt), keine Tabelle (C-328 gehoert Codex), kein
Trainingsplan, keine Vorlagen.

`[read]` **Was ein eigener Punkt werden sollte:** ein Formular, das
diese vier Schritte bedient — und die 28 `planned`-Sitzungen mit
`ended_time`, falls das jemand bereinigen will.

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Alles bestaetigt:** 66 / 132 / 238, Status **36 completed ·
28 planned · 2 cancelled · 0 active**, `exercise_name` als eigene
Spalte, **28 von 28 `planned` mit `ended_time`.**

### Beide Auftragsfragen hat das Schema beantwortet

`[read]` **Nicht der Agent, und das ist das Ergebnis.** Der offene
Zustand war da (`active` mit `ended_time IS NULL`), der Snapshot war
da (`exercise_name` neben `exercise_id`).

`[cmd]` **Live gegengeprobt:** Katalog auf *,,Arm circle (G-216
umbenannt)"* gesetzt, das Protokoll blieb *,,Arm circle"*,
zurueckgedreht, gleich.

`[read]` *,,Dass alle 132 Bestandszeilen namensgleich sind, beweist
nichts; deshalb die Gegenprobe."* **Genau die Unterscheidung, die ich
heute mehrfach nicht gemacht habe.**

### Die Naht ist eine dritte Form

`[read]` **Weder ,,einfach" wie in G-122 noch ,,mit zwei Enden" wie in
G-138, sondern eine ueber einen Baum:** die Sitzung ist der einzige
Ort, an dem Eigentuemerschaft entsteht, die anderen zwei haengen per
`CASCADE` darunter. **Eine Datei, drei Ebenen, ein Waechter je
Tabelle.**

### Zwei eigene Fehler, beide gemeldet

`[cmd]` **Die Negativprobe war zuerst falsch gestellt** — eine Uebung
aus einer anderen Sitzung desselben Nutzers ging zu Recht durch.
Richtig gestellt gegen eine `dev`-Uebung: **42501, RLS blockiert, die
Uebung ist nicht einmal lesbar.**

`[cmd]` **Und sein eigener Waechter hielt zuerst nicht:** er verglich
die *Anzahl* `.select(` gegen die *Anzahl* Schreibzugriffe — **ein
Zugriff mit zwei `.select()` glich den Verlust bei einem anderen
aus.** `[read]` **Summen statt Einzelpruefung — dieselbe Klasse wie
der Sollstand in A-58.** Jetzt faellt jede der sechs Anweisungen
einzeln.

### Was nicht ging

`[read]` **,,Bildschirmfoto je Zustand" mangels Oberflaeche** — es
wurde ein Schreibweg gebaut, kein Formular. **Zum zweiten Mal eine
Vorgabe von mir, die einen Schreibweg mit einer Ansicht verwechselt.**

**Abgenommen.** Folgepunkte: **G-217** (Trainingsformular) und
**C-330** (`planned` mit `ended_time`).

