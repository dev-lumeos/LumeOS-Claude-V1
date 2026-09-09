---
nr: G-383
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-382
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: OFFEN
beruehrt:
  dateien:
    - tools/ssot-nachtragen.mjs
zahlen:
  gemessen: 2026-09-08
  tabellen: 167
  spalten: 2340
  neue_ungenannt: 6
---

# G-383 — der Erzeuger fuer die Modultabellen

## Befund

Aus G-382, Claude Code, 2026-09-08.

`[cmd]` **Von sechs Tabellen, die in zwei Tagen entstanden, nennt
die SSOT keine** ? **und zwei behauptet sie ausdruecklich als nicht
gebaut:**

    128-recovery-scores.md:52    overtraining_alerts
    96-recovery-checkins.md:27   recovery_protocols

`[cmd]` **Beide stehen seit C-421 live.**

`[read]` **Und sein Satz dazu ist die Lehre:**

> *,,Eine fehlende Erwaehnung laedt zum Nachsehen ein; eine
> behauptete Abwesenheit haelt davon ab."*

`[read]` **Der Suchlauf findet den Namen und haelt die Datei fuer
abgedeckt** ? **die Falschaussage verhindert ihre eigene
Entdeckung.**

## Was erzeugbar ist

`[cmd]` **Eine Abfrage deckt alle sieben Schemas:** **167 Tabellen,
2.340 Spalten.**

`[cmd]` **Vorbild: `tools/ssot-nachtragen.mjs`, 85 Zeilen, 326
Eintraege.**

**Erzeugbar, rund ein halber Tag:**

    Tabellen und Spalten je Modul
    Zeilenzahlen mit Stichtag und Konto
    CHECK-Wertelisten
    neue Tabellen seit Datum X

`[read]` **Der letzte Punkt haette diesen Auftrag selbst
beantwortet.**

**Handarbeit bleibt:**

`[read]` **Warum etwas so gebaut ist.** `[read]` **Was bewusst NICHT
gebaut wurde** ? **eine Abwesenheit hat keine Zeile, und genau da
kamen die zwei Falschaussagen her.**

`[read]` **Die Beurteilung Mockup / angebunden / verworfen.**
`[cmd]` **Und die 58 datierten Auftragsschnappschuesse** ? **die
sind Protokoll und duerfen nicht nachgezogen werden.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Den Erzeuger bauen

`[cmd]` **Nach dem Vorbild von `ssot-nachtragen.mjs`.**

`[read]` **Und seine eigene Warnung ist die Bauvorschrift:**

> *,,Ein Erzeuger, der Lese- und Schreibwege nach Dateinamen zaehlt,
> meldet fuer `goals` null Lesewege ? weil `goals` `lesen.ts` und
> `schreiben.ts` heisst statt `*-read.ts`."*

`[read]` **Also: NUR aus der Datenbank ableiten.** `[read]` **Dort
ist der Tabellenname die Sache selbst, keine Konvention.**

`[cmd]` **Eine erzeugte Zahl sieht aus wie eine gemessene** ?
**minus jemand, der sie nachprueft.**

### 2 · Die zwei Abwesenheitsbehauptungen

`[read]` **Miss, welche weiteren Dateien etwas als nicht gebaut
behaupten, das existiert.**

`[cmd]` **Dein eigener Weg: die Namen aus dem Schema gegen die
Dateien halten** ? **aber diesmal auf Verneinungen achten, nicht
auf Erwaehnungen.**

`[read]` **Melden, nicht schreiben** ? `docs/` **gehoert dem
Orchestrator.**

### Abnahmebedingungen

    A1  der Erzeuger laeuft. Zahl: Tabellen, Spalten, Module.
    A2  Gegenprobe: eine Tabelle umbenennen -> der Erzeuger
        meldet sie anders. Zurueckgebaut.
    A3  die sechs neuen Tabellen erscheinen. Belegt.
    A4  keine Zahl aus Dateinamen abgeleitet. Belegt.
    A5  weitere Abwesenheitsbehauptungen: Zahl geprueft /
        gefunden, je mit Fundstelle.
    A6  `docs/ssot/` unveraendert ausser der erzeugten Datei.

### Was nicht zu tun ist

**Keine Moduldatei umschreiben** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-435.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 ? Der Erzeuger laeuft

`[cmd]` **`tools/ssot-modultabellen.mjs`**, nach dem Vorbild von
`ssot-nachtragen.mjs`: Trockenlauf als Voreinstellung,
`--schreiben` zum Ablegen, `--pruefen` fuer den Nachweis aus A4.

    [modultabellen] 167 Tabellen, 2352 Spalten in 7 Modulen

    coach        14 Tabellen,  169 Spalten
    goals         7 Tabellen,  116 Spalten
    medical      29 Tabellen,  451 Spalten
    nutrition    45 Tabellen,  540 Spalten
    recovery      7 Tabellen,  126 Spalten
    supplements  57 Tabellen,  845 Spalten
    training      8 Tabellen,  105 Spalten

`[cmd]` **Je Tabelle vier Angaben:** Name, Spaltenzahl, Zeilenzahl,
und das Datum der Migration, die sie anlegt.

`[read]` **`medical` zeigt 451 Spalten, in G-382 waren es 439** ?
**das ist der Erzeuger bei der Arbeit.** Codex' C-434 hat seither
Herkunftsspalten ergaenzt; von Hand haette das wieder niemand
nachgetragen.

`[read]` **Zwei Entscheidungen im Rumpf, beide gegen die bequeme
Loesung:**

`[cmd]` **`BASE TABLE`, keine Views** ? eine View ist eine Sicht auf
Tabellen, kein eigener Bestand.

`[cmd]` **Zeilen `count(*)`, nicht `pg_class.reltuples`.** Letzteres
waere billiger, **aber geschaetzt** ? und eine geschaetzte Zahl in
einer SSOT ist genau das Problem, das dieser Auftrag behebt.

### A2 ? Gegenprobe: die Umbenennung kommt an

`[cmd]` **`recovery.stress_logs` -> `stress_logs_g383` umbenannt**,
Erzeuger gelaufen, Zeile im Erzeugnis:

    | `stress_logs_g383` | 12 | 7 | ? |

`[cmd]` **Zurueckgebaut**, `information_schema` meldet wieder
`stress_logs`.

`[read]` **Die Gesamtzahlen aendern sich dabei NICHT** (7 Tabellen,
126 Spalten) ? eine Umbenennung verschiebt keine Menge. **Wer nur
die Summe vergleicht, saehe nichts.** Der Beleg ist die **Zeile**,
nicht die Summe ? dieselbe Lehre wie beim Waechter, der zaehlt statt
zu pruefen.

`[read]` **Und das `?` in der letzten Spalte ist selbst eine
Aussage:** keine Migration legt `stress_logs_g383` an. **Eine
Tabelle ohne Migration faellt damit auf** ? unbeabsichtigt, aber
brauchbar.

### A3 ? Die sechs neuen Tabellen erscheinen

`[cmd]` **Alle sechs, mit Spalten, Zeilen und Datum:**

    | `overtraining_alerts`  | 11 |  1 | 2026-09-07 |
    | `recovery_protocols`   | 12 |  2 | 2026-09-07 |
    | `stress_logs`          | 12 |  7 | 2026-09-07 |
    | `score_contributions`  | 11 | 21 | 2026-09-07 |
    | `appointments`         | 16 |  3 | 2026-09-08 |
    | `health_events`        | 13 |  4 | 2026-09-08 |

`[read]` **Genau die Angaben, zu denen `docs/ssot/` bisher schwieg**
? und zwei davon nannte es nur, um sie als *nicht gebaut* zu
behaupten (A5).

`[cmd]` **`appointments` traegt 16 Spalten, in G-382 waren es 12** ?
auch das C-434.

### A4 ? Keine Zahl aus Dateinamen, und es ist pruefbar

`[read]` **Meine eigene Warnung aus G-382 war die Bauvorschrift:**
ein Erzeuger, der ueber Dateinamen zaehlt, meldet fuer `goals` null
Lesewege, weil `goals` seine Dateien `lesen.ts`/`schreiben.ts` nennt.

`[read]` **Eine Zusage im Kommentar ist aber nur ein Satz.** Also
`--pruefen`:

    ok   *-read.ts / *-write.ts
    ok   lesen.ts / schreiben.ts
    ok   apps/web-Pfad
       readdirSync-Aufrufe: ["MIGR"]  (nur Migrationen: ok)

    [pruefen] Keine Zahl aus Dateinamen abgeleitet.

`[cmd]` **Sabotageprobe** ? die verbotene Zeile eingebaut
(`readdirSync('apps/web/src/lib/goals').filter(f => f.endsWith('-read.ts'))`):

    ROT  *-read.ts / *-write.ts
    ROT  apps/web-Pfad
       readdirSync-Aufrufe: ["MIGR","'apps/web/src/lib/goals'"]  ROT
    [pruefen] ROT — 3 Verstoesse

**Zurueckgebaut, wieder gruen.**

`[cmd]` **Ein Fehler dabei, und er gehoert zum Befund:** die Probe
war zuerst **rot auf sich selbst**. Sie fand `*-read.ts` und
`apps/web` in ihrer **eigenen Regeltabelle** ? dort stehen sie als
Suchmuster, nicht als Benutzung.

`[read]` **Kommentare herauszufiltern genuegte nicht**, weil die
Muster in Code-Zeilen stehen. **Der Schnitt geht jetzt ueber eine
Marke im Text, nicht ueber eine Zeichenzahl** ? eine Grenze aus der
Struktur haelt, eine gezaehlte bricht beim naechsten Einfuegen.

`[read]` **Die einzige Stelle mit `readdirSync` bleibt
`supabase/migrations`** ? und sie liefert **kein Mengengeruest**,
nur ein Datum zu einer Tabelle, die die Datenbank schon genannt hat.
**Fehlt die Migration, steht `?`** statt einer stillen Null. **Die
Probe prueft auch das:** jeder `readdirSync`-Aufruf muss auf `MIGR`
zeigen.

### A5 ? Weitere Abwesenheitsbehauptungen: 155 geprueft, 4 gefunden

`[read]` **Der Unterschied zu G-382:** dort suchte ich **Nennungen**
und zaehlte Treffer. **Ein Treffer kann aber eine Verneinung sein** ?
dann taeuscht er Deckung vor, waehrend er das Gegenteil behauptet.

**Der Weg:** 167 Tabellennamen aus der Datenbank (die Sache selbst),
in 155 SSOT-Dateien jede Fundstelle **im Satz** angesehen, und nur
gezaehlt, wo eine Verneinung das **Bau-Verb** regiert.

`[cmd]` **Erster Anlauf: 263 Kandidaten** ? unbrauchbar. Das Fenster
von 160 Zeichen fing jedes „ohne"/„nicht" aus einem anderen Gedanken
(*„ohne Nutzerkennung"*, *„ohne offene Begriffe"*). **Verengt auf
`nicht gebaut|uebernommen|angelegt|umgesetzt|vorhanden`: 58
Kandidaten.**

`[cmd]` **Geeicht an den zwei bekannten Faellen** ? beide kommen
durch. **Ohne diese Eichung hiesse „nichts gefunden" gar nichts.**

**Von 58 Kandidaten halten 4 der Handpruefung stand:**

| Fundstelle | Behauptet nicht gebaut | Ist aber da |
|---|---|---|
| `128-recovery-scores.md:52` | `overtraining_alerts` | **11 Spalten**, seit 2026-09-07 |
| `96-recovery-checkins.md:27` | `overtraining_alerts`, `recovery_protocols` | **11 bzw. 12 Spalten** |
| `105-medical-schema.md:30` | `user_medications` (neben drei anderen) | **25 Spalten** |
| `98-supplements-schema.md:46` | `user_supplement_settings`, `user_inventory`, `stack_templates`, `stack_template_items` | **11, 15, 17, 13 Spalten** |

`[read]` **Und jetzt das Tueckische: jede dieser vier Zeilen ist
teilweise richtig.** Die Gegenprobe:

    user_health_metrics    existiert NICHT   <- 105 hat recht
    user_symptoms          existiert NICHT   <- 105 hat recht
    medical_alerts         existiert NICHT   <- 105 hat recht
    enhanced_substances    existiert NICHT   <- 98 hat recht
    hrv_readings           existiert NICHT   <- 128 hat recht
    sleep_data             existiert NICHT   <- 128 hat recht

`[read]` **In derselben Aufzaehlung stehen wahre und falsche
Glieder.** `105-medical-schema.md` nennt vier Tabellen als *nicht
uebernommen* ? **drei stimmen, eine nicht.**
`98-supplements-schema.md` nennt fuenf ? **eine stimmt, vier
nicht.**

`[read]` **Das ist die schwerste Form:** wer die Zeile liest und
eine Stichprobe macht, trifft mit hoher Wahrscheinlichkeit ein
richtiges Glied ? **und haelt die ganze Aussage fuer geprueft.**

**Keine Falschaussage, obwohl der Sucher sie meldete** ? die
haeufigsten Muster unter den 54 uebrigen:

`[cmd]` **Die Verneinung gilt einem anderen Gegenstand.**
`178-datenluecken-c187.md:61`: *„`medical.lab_markers` existiert
nicht. Die reale Katalogtabelle heisst `medical.lab_marker_catalog`."*
? **eine Berichtigung, kein Mangel.**

`[cmd]` **Die Verneinung gilt nicht der Tabelle, sondern etwas
daran.** `100-koerpermessungen.md:98`: *„Nicht uebernommen wurden
Development-RLS-Policies aus `037_body_measurements.sql`"* ? **die
Policies, nicht die Tabelle.**

`[cmd]` **Bewusste Leere, richtig vermerkt.**
`140-supplements-restliche-tabs.md:37`: *„`supplement_interactions`
? 0 Zeilen, bewusst (C-108)"* ? **die Tabelle ist da und leer, und
genau das steht da.**

**Melden, nicht schreiben** ? keine Moduldatei angefasst.

### A6 ? `docs/ssot/` unveraendert ausser dem Erzeugnis

`[cmd]` **`git status --short docs/`:**

    ?? docs/ssot/00-MODULTABELLEN.md

`[read]` **Ein einziger Eintrag, und der ist neu** ? **keine
bestehende Datei geaendert**, keine der vier Falschaussagen aus A5
berichtigt. **Das gehoert dem Orchestrator.**

### Waechter

`[cmd]` **`encoding-pruefen.mjs`:** siehe unten. `[read]` **Kein
Anwendungscode geaendert** ? die Gates aus G-381 (1510 Tests, tsc,
lint) gelten unveraendert. **Der Erzeuger ist ein Werkzeug, kein
Teil der Anwendung.**

### Neustart

`[read]` **Keiner noetig** ? nichts an `apps/` geaendert.

### Was noch offen ist

**1 ? Die vier Falschaussagen aus A5.** `[read]` **Sie zu
berichtigen ist Handarbeit und deine Entscheidung.** Der Erzeuger
verhindert kuenftige, **er raeumt bestehende nicht weg.**

**2 ? Ein Waechter waere moeglich.** `[read]` Der Suchlauf aus A5
liesse sich als Pruefung fuehren: *„keine SSOT-Datei behauptet eine
Tabelle als nicht gebaut, die in `information_schema` steht."*
`[cmd]` **Er braeuchte eine Ausnahmeliste** fuer die 54 richtigen
Faelle ? **und eine Ausnahmeliste altert nur nach oben.** Das ist
ein eigener Punkt, kein Nebenprodukt.

**3 ? Der Erzeuger sagt nicht, was angebunden ist.** `[read]` **Er
sagt, was an Tabellen da ist** ? nicht, ob eine Kachel sie liest.
**Diese Grenze steht im Kopf der erzeugten Datei**, damit niemand
sie fuer eine Anbindungsuebersicht haelt.


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  167 Tabellen, 2352 Spalten, 7 Module
    A2  Umbenennung erscheint als eigene Zeile
    A3  alle sechs neuen Tabellen mit Spalten, Zeilen, Datum
    A4  keine Zahl aus Dateinamen -- mit Sabotage belegt
    A5  155 geprueft, 58 Kandidaten, 4 bestaetigt
    A6  docs/ssot/ unveraendert ausser der erzeugten Datei

`[cmd]` **Selbst gemessen: der Erzeuger laeuft, 167/2352/7,
`00-MODULTABELLEN.md` mit 222 Zeilen.**

### A5 ist der schaerfste Fund des Tages

`[cmd]` **Nachgemessen, je Zeile:**

    128:52   overtraining_alerts EXISTIERT
             hrv_readings, sleep_data nicht
    96:27    scores, overtraining_alerts,
             recovery_protocols EXISTIEREN
             acht weitere nicht
    105:30   user_medications EXISTIERT
             drei weitere nicht
    98:46    vier EXISTIEREN, enhanced_substances nicht

> *,,Jede dieser vier Zeilen ist teilweise richtig. 105 nennt vier
> Tabellen und hat bei dreien recht. Wer stichprobenartig prueft,
> trifft wahrscheinlich ein wahres Glied und haelt die ganze
> Aussage fuer belegt."*

`[read]` **Eine Liste, in der Wahres und Falsches nebeneinander
steht, schlaegt die Stichprobe.**

`[cmd]` **`96-recovery-checkins.md:27` nennt `recovery_scores` als
nicht uebernommen** ? **die Tabelle mit 34 Spalten, die den
Erholungswert traegt.**

**Berichtigt: alle vier, mit der Messung daneben.**

### A4 — die Warnung wurde pruefbar statt kommentiert

`[read]` **Ich schrieb: leite nichts aus Dateinamen ab.**

`[cmd]` **Er hat daraus `--pruefen` gebaut** ? **Sabotage mit
`readdirSync('.../goals').filter(f => f.endsWith('-read.ts'))`
faerbt alle drei Pruefungen rot.**

`[read]` **Ein Versprechen, das sich selbst prueft, ist mehr wert
als ein Kommentar.**

`[cmd]` **Und die Pruefung war zuerst rot auf sich selbst** ? **sie
fand ihre eigene Regeltabelle.** `[read]` **Der Schnitt laeuft
jetzt an einer Strukturmarke, nicht an einer Zeichenzahl.**

### A2 — und was die Gegenprobe nebenbei zeigt

`[cmd]` **`stress_logs` umbenannt: die Zeile erscheint, die Summen
bewegen sich nicht** ? **7 Tabellen, 126 Spalten, vorher wie
nachher.**

`[read]` **Wer nur die Summe vergleicht, sieht nichts.**

`[cmd]` **Und das `?` in der Datumsspalte ist selbst eine
Auskunft:** **keine Migration erzeugt den Namen** ? **eine Tabelle
ohne Migration faellt auf.**

### Zwei Entscheidungen im Bau, beide richtig

`[cmd]` **Nur `BASE TABLE`** ? **eine Sicht ist eine Sicht auf
Tabellen, kein eigener Bestand.**

`[cmd]` **`count(*)` statt `pg_class.reltuples`** ? **der billigere
Weg ist geschaetzt, und eine geschaetzte Zahl in einer SSOT ist
genau das Problem, das dieser Auftrag behebt.**

### Und der Erzeuger holt auf

`[cmd]` **Medical zeigt 451 Spalten, G-382 mass 439** ? **C-434 hat
seither Herkunftsspalten ergaenzt.**

`[read]` **Von Hand haette das niemand nachgezogen.**

**Abgenommen.**

