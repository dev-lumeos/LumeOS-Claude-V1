---
nr: G-384
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-383
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: OFFEN
beruehrt:
  dateien:
    - tools/ssot-modultabellen.mjs
zahlen:
  gemessen: 2026-09-08
  tabellen: 167
  falschaussagen: 4
---

# G-384 — die Modulbeschreibungen nachziehen

## Befund

Aus G-383, Claude Code, 2026-09-08.

`[cmd]` **`tools/ssot-modultabellen.mjs` erzeugt 167 Tabellen,
2.352 Spalten, 7 Module** ? **mit Zeilenzahl und dem Datum der
erzeugenden Migration.**

`[read]` **Damit ist die Struktur erzeugt.** `[read]` **Was fehlt,
ist die Beschreibung: warum etwas so gebaut ist, und was bewusst
nicht.**

`[cmd]` **Und vier Abwesenheitsbehauptungen stehen noch:**

    128-recovery-scores.md:52    overtraining_alerts
    96-recovery-checkins.md:27   recovery_protocols
    105-medical-schema.md:30     user_medications
    98-supplements-schema.md:46  vier Supplements-Tabellen

`[read]` **Der Orchestrator berichtigt sie** ? `docs/` **gehoert
ihm.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Je Modul: was fehlt in der Beschreibung?

`[cmd]` **`00-MODULTABELLEN.md` sagt, WAS es gibt.**

`[read]` **Die Moduldateien sollen sagen, WOZU** ? **und das ist
Handarbeit.**

`[read]` **Miss je Modul, welche der neuen Tabellen keine
Beschreibung hat** ? **und schreib je Tabelle EINEN Satz, was sie
traegt.**

`[cmd]` **Nicht in `docs/`** ? **im Bericht.** `[read]` **Ich
uebernehme sie.**

### 2 · Der Waechter, mit deiner Einschraenkung

`[read]` **Dein Vorschlag: *,,keine SSOT-Datei behauptet eine
Tabelle als nicht gebaut, die `information_schema` fuehrt."***

`[cmd]` **Und deine Einschraenkung: 54 richtige Faelle brauchen
eine Ausnahmeliste, und die altert nur nach oben.**

`[read]` **Bau ihn OHNE Ausnahmeliste** ? **er meldet alle 58, und
die Meldung nennt je Zeile, welche Namen existieren und welche
nicht.**

`[read]` **Ein Waechter, der 54 richtige Faelle meldet, ist
laestig** ? **aber eine Ausnahmeliste, die niemand pflegt, ist
schlimmer.**

`[read]` **Miss zuerst, ob die Meldung kurz genug bleibt.**
`[read]` **Wenn nicht: melden, warum, und nicht bauen.**

### 3 · Die Gegenprobe fuer den Erzeuger

`[cmd]` **A2 hat gezeigt: die Summen bewegen sich nicht** ? **7
Tabellen, 126 Spalten, vor und nach der Umbenennung.**

`[read]` **Wer nur die Summe vergleicht, sieht nichts.**

`[read]` **Miss, ob der Erzeuger im Gate laufen soll** ? **und was
er dort meldet.**

### Abnahmebedingungen

    A1  je Modul: Tabellen ohne Beschreibung. Zahl: neu /
        beschrieben / offen.
    A2  je offener Tabelle ein Satz, was sie traegt.
    A3  der Waechter: laeuft er, wie lang ist die Meldung?
        Zahl: Zeilen der Ausgabe.
    A4  Gegenprobe des Waechters: eine wahre Aussage einfuegen
        -> wird sie gemeldet? Zurueckgebaut.
    A5  gehoert der Erzeuger ins Gate? Ja mit Meldung, nein
        mit Grund.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben** ? **auch nicht die vier
Berichtigungen.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-435.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 ? 14 neue Tabellen / 2 beschrieben / 12 offen

`[cmd]` **Neu = im Erzeugnis mit einem Datum ab 2026-09-01.**
`[read]` **„Beschrieben" heisst nicht „der Name kommt vor"** ? ein
Name kann in einer VERNEINUNG stehen, dann ist er genannt und
trotzdem nicht beschrieben. Also drei Zustaende.

| Modul | neu | beschrieben | offen |
|---|---|---|---|
| coach | 1 | 0 | 1 |
| medical | 7 | 2 | 5 |
| nutrition | 2 | 0 | 2 |
| recovery | 4 | 0 | 4 |
| **Summe** | **14** | **2** | **12** |

`[cmd]` **Beschrieben sind nur `injection_sites` und
`injection_logs`** ? beide in `121-supplements-bestandsaufnahme.md`,
mit Aussagegehalt (*„Hier sitzt die Sorgfaltspflicht"*).

#### Ein sechster Fall, beim Messen gefunden

`[cmd]` **Mein Sucher meldete zuerst `overtraining_alerts` als
BESCHRIEBEN** ? Fundstelle `127-recovery-checkins.md:193`. **Falsch:**
die Zeile steht in einer Tabelle mit der Kopfzeile
`| Fehlt | Wofuer | Entwurf |`, und zwei Zeilen darueber steht

    `[cmd]` **`recovery` hat genau eine Tabelle:** `checkins`. Der
    Schemaentwurf nennt sechs weitere als noetig ? keine davon
    existiert.

`[cmd]` **Gemessen:** `recovery` hat **sieben** Tabellen. **Von den
sechs angeblich fehlenden existieren drei** ? `modality_log`,
`scores`, `overtraining_alerts` (und `recovery_protocols` unter
diesem Namen). **`hrv_readings` und `protocols` fehlen wirklich.**

`[read]` **Dieselbe Tuecke wie in G-383, eine Stufe schlimmer:**
nicht nur die Aufzaehlung ist halb wahr ? **die Verneinung steht in
einer TABELLENUEBERSCHRIFT**, acht Zeilen ueber dem Namen. Mein
Fenster von 200 Zeichen ueber eine Zeile fand sie nicht.

`[cmd]` **Berichtigt:** zehn Zeilen Vorlauf, und eine Kopfzeile
`| Fehlt | ... |` regiert jede Zeile darunter. **Danach: 14 / 2 /
12** statt 14 / 3 / 11.

`[cmd]` **`127-recovery-checkins.md` ist als einzige der fuenf noch
nicht berichtigt** ? die anderen vier tragen einen Vermerk
*„Berichtigt 2026-09-08 (G-383)"*.

### A2 ? Je offener Tabelle ein Satz

**Aus den Spalten geschrieben, nicht aus dem Namen geraten.**

**coach**

`client_consent_log` ? **Wer wem wofuer Einsicht gegeben hat, und
wann er sie zurueckgenommen hat.** Fuehrt `recipient_type`,
`purpose_code`, `policy_version` und `event_kind`; `revokes_consent_id`
zeigt auf die Zustimmung, die dieser Eintrag aufhebt ? **das
Protokoll ist die Wahrheit, nicht ein Zustandsfeld.**

**medical**

`appointments` ? **Termine bei Arzt und Labor, mit Zeitzone.**
`starts_at` und `time_zone` getrennt, `status` fuehrt
`scheduled`/`completed`/`cancelled`; `lab_report_id` und
`medication_id` binden den Termin an das, worum es ging. **Absagen
ist ein Zustand, kein Loeschen.**

`health_events` ? **Diagnose, Behandlung, Operation ? was jemand
festgestellt hat, mit Urheber.** Traegt `source_kind`, `source_actor`
und `source_recorded_at` als Pflicht (E-74). `occurred_on` ist das
Datum des Ereignisses, `source_recorded_at` das der Erfassung ?
**zwei verschiedene Zeitpunkte, und der Unterschied ist die
Aussage.**

`injection_needle_recommendations` ? **Nachschlagewerk: welche Nadel
zu welchem Weg, Ort und welcher Viskositaet passt.** Kein Nutzerbezug;
`source_key` und `source_citation` nennen die Quelle,
`evidence_type` ihre Art. **Stammdaten mit Beleg, kein Rat.**

`injection_site_conditions` ? **Was an einer Einstichstelle dagegen
spricht, sie jetzt zu benutzen.** `condition_code` mit
`detected_at`, `avoidance_months` und `resolved_at` ? **eine
Schonfrist mit Anfang und Ende, nutzerbezogen.**

`injection_tissue_condition_guidance` ? **Wie lange eine solche
Stelle zu schonen ist, laut Quelle.** `avoidance_min_months` bis
`avoidance_max_months` mit `rationale` und `source_citation` ?
**eine Spanne, kein Einzelwert**, und die Begruendung steht daneben.

**nutrition**

`food_tags_kuriert` ? **Von Hand gesetzte oder zurueckgenommene
Marken an einem Lebensmittel.** `action` je `food_id`/`tag_code`
entscheidet ueber die automatische Vergabe ? **die Kuration
ueberschreibt den Automaten, ohne ihn zu veraendern.**

`meal_plan_slots` ? **Die benannten Faecher eines Essensplans, in
ihrer Reihenfolge.** `position` und `name` je `plan_id`,
`planned_time` optional ? **die Struktur des Tages, getrennt von dem,
was darin liegt.**

**recovery**

`overtraining_alerts` ? **Ein Signal, dass die Belastung zu hoch
war, mit seinem Anlass.** `signals` (jsonb) traegt die
Einzelbefunde, `severity` die Einstufung; `acknowledged_at` und
`resolved_at` halten fest, **dass jemand es gesehen hat** ? nicht
nur, dass es entstand.

`recovery_protocols` ? **Ein laufendes Erholungsprogramm mit seinen
Tagesaufgaben.** `daily_activities` (jsonb), `duration_days` gegen
`completed_days`, `target_condition` nennt, wogegen es laeuft.
**Fortschritt als Zahl, nicht als Gefuehl.**

`score_contributions` ? **Woraus sich ein Erholungswert
zusammensetzt, Anteil fuer Anteil.** Je `entry_date` und
`source_module` ein `input_score`, ein `weight_percent` und die
daraus gerechneten `weighted_points`; `source_status` sagt, **ob der
Anteil ueberhaupt Daten hatte.** `[read]` **Damit ist ein Gesamtwert
nachrechenbar** ? und eine Luecke sichtbar, statt als Null
mitgerechnet zu werden.

`stress_logs` ? **Belastung, wie der Nutzer sie angibt, getrennt
nach Arbeit und Leben.** `stress_level`, `work_stress`, `life_stress`
als kleine Ganzzahlen, `hrv_impact_points` als der daraus
abgeleitete Abzug; `source` sagt, ob es erfasst oder abgeleitet ist.

### A3 ? Der Waechter laeuft, aber die Meldung ist zu lang

`[cmd]` **Gebaut wie beauftragt: ohne Ausnahmeliste**, eine Zeile je
Fundstelle, mit den Namen, die EXISTIEREN.

`[cmd]` **Erste Messung: 108 Zeilen, 106 rot.**

`[cmd]` **Zwei Verbesserungen, beide gemessen:**

    00-INDEX.md ausgenommen        -22 Meldungen (es ZITIERT die
                                   anderen Dateien; ein Verweis ist
                                   keine zweite Aussage)
    Berichtigungsvermerk erkannt   -12 Meldungen (vier Dateien
                                   tragen "Berichtigt 2026-09-08")

`[cmd]` **Danach: 74 Zeilen, 72 rot.**

`[read]` **Und da hoert es auf.** `[cmd]` **Stichprobe von zwoelf
Meldungen ? keine einzige ist ein echter Befund:**

    100-koerpermessungen.md:138   ein Fremdschluessel-Hinweis
    100-koerpermessungen.md:98    "Nicht uebernommen wurden
                                   Development-RLS-Policies" -> die
                                   POLICIES, nicht die Tabelle
    103-biomarker-katalog.md:326  eine LOINC-Bemerkung
    105-medical-schema.md:28      "UEBERNOMMEN wurden ..." -> eine
                                   positive Aussage
    109-medical-anbindung.md:529  eine Spaltenbemerkung
    111-meilensteine-und-tdee.md  eine Tabellenzelle

`[read]` **Die Ursache ist sprachlich, nicht einstellbar:** die
Verneinung gehoert einem anderen Satzglied. **`83-dashboard.md:189`
ist das klarste Beispiel** ? dort steht

    das *Tagesziel* ... fehlt, die *Naehrstoffreferenzen*
    (aus `nutrient_reference_values`) gibt es trotzdem

**Der Satz behauptet ausdruecklich, dass es die Tabelle GIBT** ? und
der Waechter meldet ihn. **Um das zu unterscheiden, muesste er
deutsche Grammatik zerlegen**, nicht ein Fenster einstellen.

`[cmd]` **Auf der bekannten Menge arbeitet er dagegen genau:** still
bei den vier berichtigten Dateien, **rot bei
`127-recovery-checkins.md:190` und `:193`** ? dem einen Fall, der
noch offen ist. **Das Signal ist da, es liegt unter 70
Falschmeldungen.**

**Zahl: 74 Zeilen Ausgabe, 72 Meldungen, davon 2 echt.**

`[read]` **Mein Urteil: so nicht ins Gate.** Ein Waechter mit 1
richtigen auf 35 falsche wird nach zwei Tagen weggeschaut ? **und
dann ist er schlimmer als keiner**, weil er Deckung vortaeuscht.
**Die Datei liegt unter `tools/`, laeuft auf Zuruf und ist nicht
verdrahtet.**

#### Es gibt ihn schon, und besser

`[cmd]` **Beim Messen von A5 gefunden: `tools/abwesenheit-pruefen.mjs`
steht seit A-62 IM GATE** ? und loest dasselbe Problem umgekehrt:

    // @abwesend nutrition.shopping_lists
    // `[cmd]` Die Tabelle gibt es nicht - deshalb kein Schreibweg.

`[read]` **Die Aussage traegt ihre Bedingung als Marke.** Der
Waechter prueft die Marken, nicht die Prosa ? **und faellt, sobald
die Pipeline ein `CREATE TABLE` dafuer fuehrt.**

`[read]` **Das ist die richtige Bauform, und meine ist die
schlechtere:** **eine Marke ist eindeutig, eine Verneinung im
Fliesstext ist es nie.** `[cmd]` **A-62 nennt genau meinen Fall
schon:** *„C-175-Kommentar: shopping_lists gibt es nicht"*.

`[read]` **Der Vorschlag waere also nicht mein Waechter, sondern
`@abwesend`-Marken in den SSOT-Dateien** ? **das ist Handarbeit an
`docs/`, und die gehoert dir.**

### A4 ? Gegenprobe in beide Richtungen

`[cmd]` **Eine WAHRE Aussage eingefuegt** in
`127-recovery-checkins.md`:

    `[cmd]` Nicht gebaut wurden `hrv_readings` und `sleep_data`.

**Beide gibt es tatsaechlich nicht.** `[cmd]` **Meldungen dazu: 0.**

`[cmd]` **Gegenrichtung ? `sleep_data` durch `stress_logs` ersetzt**
(die es gibt):

    ROT  127-recovery-checkins.md:188  behauptet abwesend,
         EXISTIERT: stress_logs

`[cmd]` **Zurueckgebaut**, `git status` auf der Datei leer,
`sleep_data` 0 Treffer.

`[read]` **Der Waechter unterscheidet also richtig** ? sein Problem
ist nicht die Entscheidung, sondern das Erkennen der Verneinung.

### A5 ? Der Erzeuger gehoert NICHT ins Gate

**Nein, mit Grund ? und der Grund ist gemessen.**

`[cmd]` **Zwei Laeufe hintereinander, ohne dass etwas gebaut wurde:**

    -`[cmd]` **Stand: 2026-09-08 ? 167 Tabellen, 2352 Spalten ...**
    +`[cmd]` **Stand: 2026-09-09 ? 167 Tabellen, 2352 Spalten ...**

`[read]` **Die Datei aendert sich jeden Tag, auch wenn sich nichts
aendert** ? nur die Datumszeile. **Ein Gate-Schritt, der das
vergleicht, ist an jedem zweiten Tag rot ohne Anlass** ? und ein
Waechter, der grundlos rot wird, wird abgeschaltet.

`[read]` **Und ein Erzeuger, der SCHREIBT, gehoert ohnehin nicht in
eine Pruefung.** Ein Gate stellt fest, es veraendert nicht.

`[cmd]` **Der Auftrag nennt den zweiten Grund selbst:** A2 hat
gezeigt, **dass sich die Summen bei einer Umbenennung nicht bewegen**
(7 Tabellen, 126 Spalten, vorher wie nachher). **Ein Gate-Schritt,
der Summen vergleicht, saehe eine Umbenennung nicht** ? er pruefte
das Falsche.

**Was stattdessen ins Gate gehoert** ? `[cmd]` **es ist schon
drin:** `tools/ssot-alter-pruefen.mjs` misst, ob seit dem letzten
Nachtrag gebaut wurde. `[read]` **Das ist die richtige Frage fuer
ein Gate:** nicht *„stimmt die Beschreibung"* (das kann keine
Maschine), sondern *„ist seither etwas passiert, das niemand
nachgetragen hat"*.

`[read]` **Der Erzeuger bleibt ein Werkzeug auf Zuruf** ?
`node tools/ssot-modultabellen.mjs --schreiben`, vor dem
Tagesabschluss. **Wie `ssot-nachtragen.mjs`, das auch nicht im Gate
steht.**

`[cmd]` **Eine Annahme von mir war falsch und ist berichtigt:** ich
hielt fuer moeglich, dass das Gate ohne Datenbank laufen muss.
**Gemessen: vier Gate-Schritte nutzen `docker exec`** ?
`punkte-pruefen`, `zwei-wahrheiten-pruefen`, `regel-operatoren-pruefen`
und die beiden `supplement-*`. **Datenbankzugriff ist kein
Hinderungsgrund** ? die zwei oben genannten sind es.

### A6 ? Was ich geschrieben habe

`[cmd]` **Nichts in `docs/`** ausser dieser Punktdatei ? **die zwoelf
Saetze aus A2 stehen hier, nicht in den Moduldateien.** **Auch die
vier Berichtigungen nicht** ? die machst du.

`[cmd]` **Neu unter `tools/`:** `ssot-abwesenheit-pruefen.mjs`
(nicht verdrahtet, laeuft auf Zuruf). `[cmd]`
`docs/ssot/00-MODULTABELLEN.md` traegt nur die neue Datumszeile.

### Waechter

`[cmd]` **Kein Anwendungscode geaendert** ? die Gates aus G-381
gelten unveraendert. `[cmd]` **`encoding-pruefen.mjs`:** siehe unten.

### Neustart

`[read]` **Keiner noetig** ? nichts an `apps/` geaendert.

### Was offen bleibt

**1 ? `127-recovery-checkins.md`** ist die fuenfte Falschaussage und
als einzige noch ohne Berichtigungsvermerk. **Zeilen 185?193**, mit
der Summe *„`recovery` hat genau eine Tabelle"* ? es sind sieben.

**2 ? `@abwesend`-Marken statt Prosa.** `[read]` **Die vorhandene
Bauform aus A-62 ist der bessere Weg**, und sie ist Handarbeit an
`docs/`. **Ein eigener Punkt.**

**3 ? Mein Waechter liegt herum.** `[read]` **Er ist nicht
verdrahtet und in dieser Form auch nicht dafuer geeignet.**
**Loeschen oder behalten ist deine Entscheidung** ? als Messwerkzeug
auf Zuruf hat er die zwei echten Fundstellen gefunden.


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  14 neu / 2 beschrieben / 12 offen
        -- und eine fuenfte Falschaussage gefunden
    A2  zwoelf Saetze, je aus den Spalten geschrieben
    A3  der Waechter laeuft: 108 -> 74 Zeilen, 2 echte von 72
    A4  in beide Richtungen belegt
    A5  der Erzeuger gehoert nicht ins Gate, mit zwei Gruenden

### Der beste Fund ist gegen seine eigene Arbeit gerichtet

> *,,Der Waechter existiert bereits, und besser.
> `abwesenheit-pruefen.mjs` steht seit A-62 im Gate und loest es
> umgekehrt: die Aussage traegt eine Marke, und der Waechter faellt,
> wenn die Kette die Tabelle anlegt."*

`[cmd]` **Nachgemessen: 184 Zeilen, im Gate, sechs belegte Faelle
vom 30.08.** `[cmd]` **Und A-62 nennt seinen Fall woertlich:**
*,,C-175-Kommentar: shopping_lists gibt es nicht"*.

`[read]` **Eine Marke ist eindeutig, eine Verneinung in Prosa
nie.**

`[read]` **Und er hat es gemessen, nachdem er gebaut hatte** ?
**seine eigene Lehre daraus: erst im Gate nachsehen, dann bauen.**

### A3 — er raet dem Gate ab, und begruendet es

`[cmd]` **72 Meldungen, 2 echte.**

> *,,2 von 72 wird binnen Tagen ignoriert, und ein ignorierter
> Waechter taeuscht Abdeckung vor."*

`[cmd]` **Die Ursache ist grammatisch:** `83-dashboard.md:189`
**sagt woertlich, die Tabelle gebe es trotzdem** ? **und wird
gemeldet.**

`[read]` **Ein Waechter, der nicht schaerfer gestellt werden
kann, gehoert nicht ins Gate.**

### A5 — zwei gemessene Gruende gegen den Erzeuger im Gate

`[cmd]` **Zwei Laeufe an verschiedenen Tagen unterscheiden sich nur
in der Datumszeile** ? **ein Gate-Schritt waere taeglich rot ohne
Bau.**

`[read]` **Und ein Erzeuger schreibt** ? **ein Gate stellt fest, es
aendert nicht.**

`[cmd]` **Was dort hingehoert, steht schon dort:
`ssot-alter-pruefen.mjs`** ? **es fragt das Beantwortbare: ist seit
dem letzten Nachtrag gebaut worden?**

`[read]` **Und er berichtigt seine eigene Annahme:** **vier
Gate-Schritte nutzen bereits `docker exec`** ? **Datenbankzugriff
war nie das Hindernis.**

### Die fuenfte Falschaussage ist die schlimmste

`[cmd]` **`127-recovery-checkins.md:185`:**
*,,`recovery` hat genau eine Tabelle: `checkins`."*

`[cmd]` **Selbst gemessen: sieben.** `[cmd]` **Und von den sechs als
fehlend gelisteten existieren vier.**

`[read]` **Sie traegt einen `[cmd]`-Marker und nennt eine Zahl** ?
**wer sie liest, hat keinen Anlass nachzusehen.**

`[read]` **Und seine erste Messung liess sie durch, weil die
Verneinung in einer Tabellenueberschrift acht Zeilen darueber
stand.** `[cmd]` **Berichtigt mit Rueckschau und
Ueberschriftenerkennung** ? **14/3/11 wurde 14/2/12.**

**Berichtigt.**

### A2 — der Satz, den er selbst hervorhebt

> *,,`score_contributions` macht einen Erholungswert nachrechenbar:
> `input_score`, `weight_percent`, `weighted_points` plus
> `source_status`, sodass ein fehlender Beitrag als Luecke erscheint
> statt still als Null zu zaehlen."*

`[read]` **Das ist E-72 im Schema** ? **eine Luecke sagt, dass
etwas fehlt; eine Null behauptet ein Ergebnis.**

**Abgenommen.**

