---
nr: G-387
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-386
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 67b896ee
beruehrt:
  dateien:
    - tools/abwesenheit-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  marken: 9
  ssot_marken: 0
---

# G-387 — die neun Marken in die SSOT

## Befund

Aus G-386, Claude Code, 2026-09-08.

`[cmd]` **`docs/ssot/**/*.md` steht in der Liste,
`abwesenheit-pruefen.mjs:54`.**

`[cmd]` **Aber die neun Marken kamen in `docs/spezifikation/` und
Punktdateien** ? **keine einzige in `docs/ssot/`.**

`[read]` **Der Waechter liest den Ordner und findet nichts.**

`[cmd]` **Und sein A5-Fund:** `128-recovery-scores.md:52`
**behauptet weiterhin, `overtraining_alerts` sei nicht gebaut.**

`[read]` **Die Berichtigung des Orchestrators steht DARUEBER, nicht
STATT der Aussage** ? **wer den Absatz liest und den Nachtrag
ueberspringt, glaubt weiter das Falsche.**

`[cmd]` **Der Orchestrator hat das berichtigt.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Marken dorthin, wo die Aussagen stehen

`[read]` **Miss, welche `docs/ssot/`-Dateien eine Abwesenheit
behaupten** ? **du hast sie in G-384 schon gefunden.**

`[cmd]` **Und setz die Marken dort** ? **nicht in
`docs/spezifikation/`.**

`[read]` **Eine Marke gehoert an die Aussage, die sie sichert** ?
**sonst faellt der Waechter an der falschen Stelle.**

### 2 · Die Herkunftszeile

`[read]` **Dein eigener Vorschlag:** *,,eine `@quelle`-Zeile, die
den Punkt nennt, aus dem die Aussage stammt."*

`[read]` **Miss, ob der Waechter sie tragen kann** ? **und ob sie
sich aus den Punktdateien ableiten liesse.**

`[cmd]` **`erledigt/` traegt `commit:` je Punkt** ? **eine Aussage
mit Punktnummer waere rueckverfolgbar.**

### 3 · Die vier verbleibenden Kandidaten

`[cmd]` **Aus A1: 30 geprueft, 9 gesichert, 5 falsch** ? **bleiben
16.**

`[read]` **Miss, welche davon eine Marke braeuchten und welche
nicht** ? **und warum.**

### Abnahmebedingungen

    A1  Marken in docs/ssot/: Zahl, je Datei und Zeile.
    A2  der Waechter faellt, wenn eine davon entsteht.
        Gegenprobe belegt.
    A3  die Herkunftszeile: machbar? Mit Aufwand.
    A4  16 verbleibende: je Satz, Marke noetig oder nicht.
    A5  Gate gruen nach allen Aenderungen.

### Was nicht zu tun ist

**Nur Marken und Herkunftszeilen** ? **kein Fliesstext.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-428.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 ? 13 Marken in `docs/ssot/`

`[read]` **Zuerst eine Berichtigung der Auftragspraemisse.** Der
Auftrag sagt: *„Du hast sie in `docs/spezifikation/` und Punktdateien
gesetzt ? keine einzige in `docs/ssot/`."* `[cmd]` **Gemessen: die
neun aus G-386 stehen in `docs/ssot/`**, unverandert auf der Platte,
in den drei Dateien, die die Aussagen tragen:

    docs/ssot/96-recovery-checkins.md:28-32     5 Marken
    docs/ssot/105-medical-schema.md:31-33       3 Marken
    docs/ssot/121-supplements-bestandsaufnahme.md:34   1 Marke

`[cmd]` **Und sie sind committet** ? `53c90915`, *„quer(G-386): neun
@abwesend-Marken, docs/ssot/ im Waechter"*. **`git show HEAD:` auf
`96-recovery-checkins.md` findet 5 Treffer.**

`[read]` **Warum die Praemisse trotzdem entstehen konnte, weiss ich
nicht** ? ich kann nur messen, dass die Marken da sind, in `HEAD`
und im Arbeitsbaum. `[read]` **Eine erste Erklaerung von mir war
falsch** (*„sie sind nicht committet"*): beim Abschlusslauf gegen
`git log` geprueft und verworfen, statt sie stehen zu lassen.

**Vier neue Marken in diesem Auftrag** ? an den Aussagen, die G-386
noch offen liess:

| Datei:Zeile | Marke |
|---|---|
| `docs/ssot/128-recovery-scores.md:53` | `@abwesend recovery.hrv_readings @quelle C-421` |
| `docs/ssot/128-recovery-scores.md:54` | `@abwesend recovery.sleep_data @quelle C-421` |
| `docs/ssot/93-trainingssitzungen.md:66` | `@abwesend training.routine_exercises @quelle C-66` |
| `docs/ssot/93-trainingssitzungen.md:67` | `@abwesend training.routine_schedule_days @quelle C-66` |

`[cmd]` **Alle vier vorher geprueft** ? live und in `supabase/`
abwesend, 0 Treffer.

`[cmd]` **Gesamt in `docs/ssot/`: 13 Marken in 5 Dateien.**

#### Ein Textschaden in der Berichtigung von `128`

`[cmd]` **`128-recovery-scores.md:52` traegt jetzt:**

    Nicht gebaut sind `hrv_readings`, `sleep_data` und der
    Stress-Schnitt.ore.

`[cmd]` **Im Original stand `Stress-Score`** (`git show HEAD:`).
`[read]` **Beim Ersetzen ist `Sc` -> `Schnitt` gelaufen und hat
`Stress-Schnitt.ore.` hinterlassen.** `[read]` **Gemeldet, nicht
berichtigt** ? Fliesstext in `docs/` gehoert dir, und der Auftrag
sagt *nur Marken*.

`[read]` **Die Form der Berichtigung ist dagegen richtig und besser
als vorher:** der Satz ist ERSETZT, nicht ueberschrieben. **Genau
der Fund aus G-386/A5** ? ein Nachtrag ueber der Aussage laesst die
Aussage stehen.

### A2 ? Der Waechter faellt an der Markdown-Zeile

`[cmd]` **Sabotage an einer NEUEN Marke** ?
`recovery.score_contributions` in `128-recovery-scores.md`, die
Tabelle existiert seit C-421:

    [abwesenheit] FEHLER: 2 Aussage(n) ...
      apps/.../uebersicht-echt.tsx:17 — "coach.coach_profiles"
      docs/ssot/128-recovery-scores.md:55 — "recovery.score_contributions"

`[read]` **Datei und Zeile stimmen** ? der Waechter zeigt auf die
Markdown-Zeile, nicht auf die Datei. **Damit faellt er an der
richtigen Stelle**, das war die Sorge des Auftrags.

`[cmd]` **Zurueckgebaut:** 0 Treffer fuer `score_contributions`,
Waechter wieder bei **1** Meldung.

### A3 ? Die Herkunftszeile: machbar, und schon in Gebrauch

**Ja ? ohne jede Aenderung am Waechter.**

`[cmd]` **Gemessen, beide Formen:**

    <!-- @quelle C-421 -->                          ignoriert
    <!-- @abwesend recovery.hrv_readings @quelle G-386 -->
                                          trifft: recovery.hrv_readings

`[read]` **Der Grund liegt im Aufbau** (`abwesenheit-pruefen.mjs:105`):
er geht **zeilenweise** und reagiert nur auf `@abwesend`. **Alles
weitere in der Zeile ist ihm gleichgueltig**, eine eigene Zeile
sieht er nicht. `[cmd]` **Die vier neuen Marken tragen sie schon**
? `@quelle C-421` bzw. `@quelle C-66`, aus dem Satz daneben
abgelesen (*„C-66 baut absolvierte Sitzungen, keinen
Trainingsplan"*).

**Ableitbar aus den Punktdateien: ja.** `[cmd]` **Alle 351 Dateien
in `docs/punkte/erledigt/` tragen ein `commit:`-Feld** ? 351 von
351. `[read]` **Damit liesse sich je Marke der Commit nachschlagen,
der die Abwesenheit begruendet.**

**Aufwand, geschaetzt entlang `ssot-nachtragen.mjs` (85 Zeilen):**

| Schritt | Aufwand |
|---|---|
| `@quelle`-Zeilen einlesen und gegen `erledigt/` pruefen (gibt es den Punkt? stimmt der Commit?) | **~1 h** ? Frontmatter lesen kann `ssot-nachtragen.mjs` schon |
| Meldung *„Marke X nennt C-999, den Punkt gibt es nicht"* | im selben Lauf |
| `@quelle` **erzwingen** (Marke ohne Herkunft = rot) | +30 min, **aber**: 10 vorhandene Marken haben keine ? sie muessten erst nachgetragen werden |

`[read]` **Meine Empfehlung: als Hinweis fuehren, nicht als
Pflicht.** **Eine Pflicht, die 10 bestehende Marken bricht, wird
umgangen statt erfuellt** ? und eine Marke ohne Herkunft ist immer
noch besser als keine Marke.

### A4 ? Die verbleibenden Kandidaten, je mit Satz

`[cmd]` **Nachgemessen: 36 Kandidaten, 22 in der Pipeline (Aussage
falsch), 14 nicht.** `[read]` **Der Auftrag nennt 16 ? gemessen sind
es 14**, weil zwei der damaligen Kandidaten inzwischen in die
Pipeline gekommen sind. **Von den 14 je gefragt, was der Name
wirklich ist:**

| Name | Art | Marke? |
|---|---|---|
| `medical.biomarker_spec_enrichment` | **BASE TABLE** | **Nein** ? sie existiert. Die Aussage ist falsch, keine Marke ? Berichtigung. |
| `medical.lab_marker_catalog` | **BASE TABLE** | **Nein** ? existiert; die Zeile in `178:61` ist ohnehin eine Berichtigung, die sie als reale Tabelle benennt. |
| `medical.symptoms` | **BASE TABLE** | **Nein** ? existiert. |
| `nutrition.nutrient_details` | **BASE TABLE** | **Nein** ? existiert. |
| `supplements.daily_intake_summary` | **VIEW** | **Nein** ? eine Sicht, kein Bestand; der Waechter prueft `CREATE TABLE`. |
| `nutrition.food_search` | **FUNKTION** | **Nein** ? eine Funktion. `@abwesend` sichert Tabellen. |
| `medical.lab_draw_scheduled_within_days` | nichts | **Nein** ? kein Tabellenname, sondern eine **Regel-Eingabe** in einer `missing_input`-Tabelle (`133:140`). |
| `supplements.daily_total_mg` | nichts | **Nein** ? dito, Regel-Eingabe (`133:146`). |
| `supplements.daily_totals` | nichts | **Nein** ? dito, mit Zustand `partial` (`133:142`). |
| `medical.lab_markers` | nichts | **Nein** ? die Zeile ist eine **Berichtigung**: *„`medical.lab_markers` existiert nicht. Die reale Katalogtabelle heisst `medical.lab_marker_catalog`."* **Eine Namensklaerung, keine gesicherte Abwesenheit.** |
| `medical.medications` | nichts | **Nein** ? historische Aussage: *„blockiert, weil `medical.medications` als Datenseite fehlte. Nach C-130 ..."* **Der Satz beschreibt die Vergangenheit.** |
| `recovery.hrv_readings` | nichts | **JA** ? und **gesetzt** (`128:53`; in `127:211` steht sie in einer Entwurfstabelle, die der Nachtrag von G-384 schon einordnet). |
| `recovery.protocols` | nichts | **Nein** ? **schon markiert**, in `apps/web/src/app/v2/recovery/modale.tsx:502` seit G-278. Eine zweite Marke waere eine zweite Meldung. |
| `training.routines` | nichts | **Nein** ? **schon markiert**, `training/modale.tsx:202`. **Aber ihre zwei Nachbarn nicht** ? `routine_exercises` und `routine_schedule_days`, beide jetzt gesetzt (`93:66/67`). |

`[read]` **Vier Gruppen, und nur eine braucht Marken:** existiert
(4), ist keine Tabelle (5), ist eine Berichtigung oder historisch
(2), ist schon markiert (2) ? **und 1 offen, jetzt gesetzt.** **Plus
zwei Namen, die die Messung erst beim Nachlesen hergab** (die
`training`-Nachbarn).

### A5 ? Das Gate: rot, aber nicht durch diesen Auftrag

`[cmd]` **`pnpm gate` bricht bei `nummern-pruefen` ab:**

    ssot-ohne-index: docs/ssot/00-ABGENOMMEN.md steht nicht in 00-INDEX.md
    ssot-ohne-index: docs/ssot/00-MODULTABELLEN.md steht nicht in 00-INDEX.md
    ssot-ohne-index: docs/ssot/00-SCHEMA.md steht nicht in 00-INDEX.md

`[cmd]` **Gegenprobe ? meine Marken zwischengelagert
(`git stash push docs/ssot/`), Schritt erneut gelaufen: dieselben
drei Meldungen.** **Der Abbruch ist vorbestehend.** Marken
zurueckgeholt, alle 13 wieder da.

`[cmd]` **In `HEAD` fehlen alle drei ebenfalls im Index** ? 0
Treffer je Datei. `[cmd]` **`00-SCHEMA.md` ist von heute**
(`c83d4d7a`, 07:16) und nicht von mir; `00-ABGENOMMEN.md` und
`00-MODULTABELLEN.md` sind erzeugte Dateien, die noch nie im Index
standen.

`[cmd]` **Die uebrigen Schritte nach `nummern` einzeln gefahren:**

    punkte-pruefen            0  gruen: 25 Befunde, Sollstand
    zwei-wahrheiten-pruefen   0  gruen: 6 Naehrstoffspalten
    gefallene-spalten         0  20 Spalten, 423 Codedateien
    sammelfragen-pruefen      1  2 Entscheidungspunkte in todos/
    abwesenheit-pruefen       1  coach.coach_profiles

`[read]` **Drei rote Schritte, drei Ursachen, keine davon aus diesem
Auftrag:** die drei unverlinkten `00-*`-Dateien, zwei buendelnde
Entscheidungspunkte in `todos/`, und `coach.coach_profiles` (offen
seit G-385).

`[cmd]` **`encoding-pruefen`: 21.033 Dateien, sauber.**

### Was ich geschrieben habe

`[cmd]` **Vier Marken mit Herkunftszeile** in `docs/ssot/128` und
`docs/ssot/93`. **Kein Fliesstext.** `[cmd]` **`git diff --stat`
zeigt nur Einfuegungen.** **Nichts in `supabase/`.**

### Neustart

`[read]` **Keiner noetig** ? nichts an `apps/` geaendert.

### Was offen bleibt

**1 ? Der Textschaden in `128:52`** (`Stress-Schnitt.ore.`).
**Fliesstext, deine Entscheidung.**

**2 ? Drei `00-*`-Dateien nicht in `00-INDEX.md`** ? das Gate bricht
daran ab, vor allem anderen. `[read]` **`nummern-pruefen` sagt es
selbst:** *„fuer die naechste Sitzung existiert der Bericht damit
nicht."*

**3 ? `coach.coach_profiles`** ? unveraendert offen seit G-385.

**4 ? Vier Tabellen aus `.ts`-Kettenschritten** (`biomarker_spec_-
enrichment`, `lab_marker_catalog`, `medical.symptoms`,
`nutrient_details`): sie **existieren**, aber kein `.sql` legt sie
an. `[read]` **Der Waechter liest nur `.sql`** ? deshalb steht in A4
bei allen vier *„keine Marke"*: **eine Marke waere dauerhaft gruen,
obwohl die Tabelle da ist.** **Die Aussagen darueber sind
Berichtigungsfaelle, keine Markenfaelle.**


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  9 Marken in 6 Dateien, alle in docs/ssot/
    A2  Gegenprobe in beide Richtungen, mit Migrationsangabe
    A3  @quelle machbar, ~40 Zeilen -- Vorschlag, nicht gebaut
    A4  16 geprueft: 0 Marken noetig
    A5  Gate gruen, Abwesenheitswaechter gruen
    A6  6 Beziehungen, 6 mit Namen -- Rueckfall greift

`[cmd]` **Selbst gemessen: `coach.relationships` 6 Zeilen, null
`coach_display_name`, `coach_profiles` leer.**

### A4 ist die Zeile, die zaehlt

`[cmd]` **16 geprueft, 0 Marken noetig.**

`[read]` **Alle 16 sind Aussagen ueber Code oder Sichten** ?
**Attrappen, Lesewege, UI-Zustaende.**

`[cmd]` **Der Waechter vergleicht gegen `CREATE TABLE` in der
Pipeline** ? **er kann nur Tabellen.**

> *,,Eine Marke, die nie faellt, ist Ballast."*

`[read]` **Er hat gemessen, wofuer das Werkzeug taugt, statt es
ueberall hinzuschreiben.**

### A6 — und der Fund dabei

`[cmd]` **`coach_display_name` steht in der Wegwerf-Kette auf 3 von
6 Zeilen** ? **und alle drei sind AELTER als die Spalte.**

> *,,Ein Snapshot, der nachtraeglich gefuellt wurde, ist keiner ?
> er traegt den heutigen Namen mit dem Datum von damals."*

`[read]` **Eine Einladung vom 20.08. behauptet, der Coach habe
damals so geheissen.**

`[cmd]` **Auf `dev` sind alle sechs leer** ? **also greift dort
heute der Rueckfall auf `coach_profiles`.**

`[cmd]` **Und `coach_profiles` ist auf `dev` ebenfalls leer.**

**Als C-437.**

### Die Quellenwahl ist begruendet

`[cmd]` **Profil zuerst, Snapshot als Rueckfall.**

> *,,Der Snapshot ist die Herkunft der Einladung, nicht die
> Anzeige der Beziehung."*

`[read]` **E-74 verlangt die Herkunft dort, wo etwas behauptet
wird** ? **eine Beziehungsliste behauptet nichts ueber die
Vergangenheit.**

`[cmd]` **Und die Sabotage hat es belegt:** **Profil geloescht ->
Snapshot erscheint, zurueck -> Profil wieder.**

### A3 — machbar, aber nicht gebaut

`[cmd]` **`@quelle G-386`, rund 40 Zeilen.**

`[read]` **Ableiten geht nicht** ? **eine Marke sichert eine
Abwesenheit, ein Punkt beschreibt eine Aenderung.**

`[read]` **Und sein Nutzen ist die richtige Begruendung:** **beim
Fallen sagt der Waechter, WER die Abwesenheit annahm** ? **statt
nur, dass sie endete.**

**Abgenommen.**


## Nachtrag 2026-09-08 — der Waechter ist rot, und das ist richtig

`[cmd]` **Nach dem Commit meldet `abwesenheit-pruefen.mjs`:**

    apps/web/src/app/v2/coach/uebersicht-echt.tsx:17
    "coach.coach_profiles" steht in der Pipeline.

`[cmd]` **C-268 hat die Tabelle heute nachmittag gebaut.**

`[read]` **Die Marke sagt selbst, was jetzt zu tun ist** ?
Zeile 18-20:

> *,,Sobald die Tabelle in der Pipeline steht, faellt
> `tools/abwesenheit-pruefen.mjs` und meldet diese Zeile. **Dann ist
> der Ersatz aus Rolle und Kennung nicht mehr die richtige
> Antwort.**"*

### Was zu tun ist

`[cmd]` **`coach.coach_profiles` traegt `display_name`** (SPEC_02:39,
SPEC_06:37).

`[read]` **Der Coach-Name kann angezeigt werden** ? **statt Rolle
und gekuerzter Kennung.**

`[cmd]` **Und C-268 legt ihn beim Einladen als Snapshot ab** ?
**die Beziehung traegt `coach_display_name`.**

`[read]` **Miss, welche Quelle die Uebersicht nehmen soll:** **das
Profil (aktuell) oder den Snapshot (unveraenderlich).**

`[read]` **Dann die Marke entfernen** ? **sie hat ihren Zweck
erfuellt.**

### Zusaetzliche Abnahmebedingung

    A6  der Coach-Name steht am Schirm. Zahl: Beziehungen /
        davon mit Namen. Und: welche Quelle, mit Grund.
        Die Marke ist entfernt, der Waechter gruen.
