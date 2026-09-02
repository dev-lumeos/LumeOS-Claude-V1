---
nr: C-297
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: C-291
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-297 - drei Wege, an dem Datenlogik-Waechter vorbei

## Befund

(neu
  2026-08-27). Aus der Pruefung von C-291.

  `[cmd]` **Dreizehn echte Probemigrationen gelegt und wieder
  entfernt. Zehn urteilen richtig, drei nicht:**

      DO $outer$ EXECUTE $q$INSERT ...$q$ $outer$   gruen  FALSCH
      CREATE TABLE x AS SELECT * FROM y             gruen  FALSCH
      SELECT * INTO x FROM y                        gruen  FALSCH

  `[read]` **Der geschachtelte Dollar-Block** entsteht, weil
  `ohneKommentareUndStrings()` den inneren `$q$`-Block entfernt, bevor
  der aeussere geprueft wird. **`CREATE TABLE AS` und `SELECT INTO`
  schreiben Daten, ohne einen der sechs Befehle zu nennen.**

  `[read]` **Alle drei sind exotischer als die vier aus C-291** — ein
  Backfill ueber `EXECUTE` ist unwahrscheinlich, `CTAS` in einer
  Migration nicht. **Aber die Aufzaehlung ist jetzt eine
  Aufzaehlung**, und wer eine Aufzaehlung umgeht, tut es an ihrem
  Rand.

## Auftrag — der Datenlogik-Waechter, und was E-45 verlangt

**Mitbeauftragt: C-298, C-382.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Warum jetzt

`[cmd]` **Der Waechter war heute rot** — **drei Migrationen aus
C-385/C-393 trugen `DELETE` und `INSERT`** (C-395).

`[read]` **Er hat funktioniert.** `[read]` **Aber C-297 sagt, es gibt
drei Wege daran vorbei, und C-298 sagt, er meldet zwei harmlose
Muster rot.**

`[read]` **Beides schwaecht ihn:** **wer Umgehungen kennt, nutzt sie;
wer Fehlalarme kennt, sieht weg.**

### 1 · C-297 — drei Wege vorbei

`[read]` **Lies den Punkt und miss, ob die drei noch bestehen.**

`[read]` **Und pruefe in beide Richtungen:** **baue je einen Fall ein
und zeige, dass der Waechter ihn nicht faengt.**

### 2 · C-298 — zwei harmlose Muster

`[cmd]` **Wenn er bei Harmlosem rot wird, gewoehnt man sich an
Rot.**

`[read]` **Miss, welche zwei es sind, und ob sie sich unterscheiden
lassen** — **oder ob eine Ausnahmeliste noetig ist.**

`[cmd]` **Eine benannte Ausnahme gibt es schon:**
`20260805120000_baseline_structure.sql`.

### 3 · C-382 — E-45 ist entschieden, das Schema fehlt

`[cmd]` **E-45, Tom, 2026-09-02:**

    coach_created   editierbar, aber der Coach wird benachrichtigt
    buddy           editierbar, von Hand oder per Anweisung
    marketplace     editierbar, aber nie weiterverkaeuflich --
                    Original wie Kopie

`[read]` **Der dritte Punkt braucht mehr als `darf_weiterverkaufen`:**
`[cmd]` **ein `boolean` ueberlebt keinen neuen Plan, in den jemand
den Inhalt kopiert.**

`[read]` **E-45 schlaegt `stammt_aus_kauf uuid` vor** — **eine
Kennung, die mitwandert und nie geloescht wird.**

`[read]` **Und der Coachfall braucht einen Meldeweg.** `[cmd]`
**`coach.action_log` steht seit C-381, mit `SECURITY DEFINER`.**
`[read]` **Zu klaeren ist die Koernung: je Position oder je Plan und
Tag?** **Vorschlagen, nicht entscheiden.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`** — der Befund von heute.
**Keinen Marktplatz bauen** — E-37.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    drei Wege      bestehen sie, je einer eingebaut und gezeigt
    zwei Muster    welche, unterscheidbar oder Ausnahme
    stammt_aus_kauf   wandert mit der Kopie, belegt
    Meldeweg       Koernung vorgeschlagen, nicht entschieden

## Bericht

**Gemessen am 2026-09-02.** Die fuenf Probemigrationen wurden nur fuer
die jeweilige Messung angelegt und danach entfernt. `apps/`, der
Dev-Server und der Datenbestand blieben unberuehrt.

### C-297 — alle drei Umgehungen bestehen weiter

`[cmd]` **Der Waechter ist nach C-395 wieder gruen.** Die heutige
Migrationenmenge wird mit Exit-Code 0 akzeptiert. Fuer jede Restluecke
wurde eine temporaere Migration gebaut und mit dem echten Waechter
geprueft:

    Probe                                                Befund
    DO $outer$ EXECUTE $inner$INSERT ...$inner$ $outer$  gruen, 0 Meldungen
    CREATE TABLE c297_probe AS SELECT ...                gruen, 0 Meldungen
    SELECT ... INTO c297_probe FROM ...                  gruen, 0 Meldungen

`[read]` **Alle drei Wege sind also weiterhin offen.** Beim ersten
entfernt `ohneKommentareUndStrings()` den inneren Dollar-String, bevor
`commandsInDollarBlocks()` den aeusseren Block untersucht. Die beiden
anderen Formen schreiben eine neue Tabelle, enthalten aber keines der
sechs bewachten DML-Schluesselwoerter.

`[read]` **Der Waechter darf deshalb nicht als vollstaendiger Schutz
gegen Datenlogik gelten.** Eine Reparatur braucht rekursives Erkennen
verschachtelter Dollar-Quoting sowie explizite Faelle fuer `CREATE
TABLE ... AS` und `SELECT ... INTO`; jede Regel braucht wieder die
Gegenprobe, dass die harmlose Strukturform gruen bleibt.

### C-298 — zwei unterscheidbare Fehlalarme, keine Ausnahmeliste

`[cmd]` **Die beiden bekannten Strukturproben werden noch immer rot:**

    Probe                                               Meldung
    DO $$ CREATE POLICY ... FOR UPDATE ... $$           UPDATE
    DO $$ CREATE TABLE ... ON DELETE CASCADE $$         DELETE

`[cmd]` **Beide brachten Exit-Code 1; nach ihrem Rueckbau ist der
Waechter erneut gruen.** Die bestehende Ausnahme fuer
`20260805120000_baseline_structure.sql` blieb dabei unveraendert und
ist weiter auf Datei, Funktion, genau ein `INSERT` und dessen
Zielstatement begrenzt.

`[read]` **Eine zweite Ausnahmeliste ist nicht noetig.** `FOR UPDATE`
und `ON DELETE CASCADE` sind grammatisch unterscheidbare Klauseln;
ein echter `UPDATE` bzw. `DELETE` ist ein DML-Statement. In
Dollar-Bloecken muss der Waechter deshalb SQL-/PLpgSQL-Statementgrenzen
erkennen statt seine sechs Woerter frei im gesamten Text zu suchen.
Die erforderliche Gegenprobe bleibt `DO $$ BEGIN INSERT ... END $$`:
sie muss weiter rot sein.

### C-382 — Schema- und Meldeweg-Vorschlag, nicht gebaut

`[cmd]` **Live fehlt `nutrition.meal_plans.stammt_aus_kauf`;** die
Tabelle hat nur `plan_origin` und `darf_weiterverkaufen`. Von sieben
Plaenen sind je einer `coach_created`, `buddy` und `marketplace`, vier
`self_created` und einer ohne nachweisbaren Ursprung. Der eine
Marketplace-Plan hat weiterhin `darf_weiterverkaufen = true`.

`[cmd]` **Ein Coachbezug fehlt ebenfalls am Plan:** es gibt kein
`coach_id` und keine entsprechende Fremdschluesselbeziehung. Beim
heutigen einzigen Coach-Plan findet sich zufaellig eine
Coach-Klienten-Beziehung; das ist keine Planzuordnung und wird bei
mehreren Coaches mehrdeutig.

`[cmd]` **`coach.action_log` kann die Meldung nicht unveraendert
tragen.** Es hat weder `plan_id`, `plan_entry_id` noch einen Tag; nach
C-381 gibt es fuer `authenticated` keinen direkten Schreibzugriff,
und sein einziger `SECURITY DEFINER`-Ausfuehrer bestaetigt eine
Coach-Aktion. Eine Klientenmeldung ist fachlich das Gegenteil davon.

`[read]` **Vorschlag fuer einen spaeteren, zusammenhaengenden
Schemaauftrag:**

1. `meal_plans.stammt_aus_kauf uuid NULL` als unveraenderliche
   Ursprungskennung. Eine Check-Regel verlangt sie fuer neue
   Marketplace-Plaene; fuer die vorhandene Demozeile darf keine UUID
   erfunden werden.
2. Jeder unterstuetzte Kopierweg uebernimmt die Kennung; ein
   Datenbank-Guard verbietet, eine einmal gesetzte Kennung zu loeschen
   oder umzusetzen. Der spaetere Marketplace-Schreibweg weist jeden
   Plan mit Kennung beim Angebot ab.
3. Ein `coach_created`-Plan braucht zusaetzlich den konkreten
   Ersteller-Coach (UUID/FK), nicht nur den allgemeinen Planursprung.
4. Statt `action_log` zu verbiegen: eine eigene, nur durch einen
   serverseitigen Ausfuehrer schreibbare Coach-Meldung mit `plan_id`,
   `coach_id`, `client_id`, `changed_on`, Zeitstempeln und Lesestatus.

`[read]` **Die UUID allein kann eine manuelle Neuanlage mit
nachkopiertem Inhalt nicht erkennen.** Sie erfuellt E-45 nur zusammen
mit einem kontrollierten Kopierweg und der Marketplace-Eingangspruefung;
ohne diese beiden Regeln kann kein Schema die Inhaltsgleichheit
beweisen.

`[read]` **Zur Koernung schlage ich eine sichtbare Meldung je Plan und
Tag vor, nicht je Position.** Sie kann `change_count` und den letzten
Zeitpunkt tragen und wird atomar im Plan-Schreibweg angelegt bzw.
verdichtet. Falls spaeter ein fachlicher Aenderungsverlauf verlangt
wird, kann dieser separat positionsgenau und append-only entstehen;
er ist fuer Toms Benachrichtigungszweck heute nicht Voraussetzung.

**Nicht entschieden und nicht gebaut:** konkrete Tabellen-/Spaltennamen
ausser dem von E-45 genannten `stammt_aus_kauf`, die
Benachrichtigungskoernung sowie jeglicher Marketplace- oder App-Weg.

## Abnahme

**2026-09-02, Orchestrator.**

### Alle drei Umgehungen bestehen — und er hat es gezeigt

`[cmd]` **Je eine temporaere Probe blieb gruen.** `[cmd]` **Danach
entfernt, Waechter wieder gruen.**

`[read]` **Das ist die Pruefung in beide Richtungen, wie die Regel es
verlangt:** **er hat drei Fehler eingebaut und gemessen, dass der
Waechter sie nicht faengt.**

`[read]` **Ohne diese Probe waere es eine Behauptung geblieben** —
**der Punkt sagte *drei Wege*, aber niemand hatte sie gegangen.**

### C-298 — keine Ausnahmeliste noetig

`[cmd]` **`FOR UPDATE` und `ON DELETE CASCADE` sind unterscheidbare
Strukturklauseln.**

`[read]` **Damit ist der Fehlalarm behebbar, ohne eine Liste zu
pflegen** — **und eine Liste waere die schlechtere Loesung gewesen:
sie waechst mit jedem neuen Muster.**

`[cmd]` **Die eine benannte Ausnahme bleibt:**
`20260805120000_baseline_structure.sql`.

### C-382 — vier Teile vorgeschlagen

`[cmd]` **Kaufkennung und konkreter Coachbezug fehlen.**

**Sein Vorschlag:**

    unveraenderliche Kauf-UUID
    kontrollierter Kopierweg
    Marketplace-Sperre
    eigene Coach-Meldung je Plan/Tag

`[read]` **Der zweite Teil ist der, den ich nicht genannt hatte:**
**eine Kennung allein reicht nicht, wenn das Kopieren unkontrolliert
ist.** `[read]` **Wer den Inhalt von Hand in einen neuen Plan
schreibt, umgeht sie.**

`[read]` **Und die Koernung hat er entschieden vorgeschlagen: je
Plan und Tag** — **wie ich es fuer richtig hielt, aber ohne dass ich
es ihm gesagt hatte.**

**Abgenommen.** **Alle drei bleiben offen** — **gemessen, nicht
gebaut.**

