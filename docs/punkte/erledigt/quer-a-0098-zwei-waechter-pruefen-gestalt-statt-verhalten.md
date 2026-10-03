---
nr: A-98
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-03
agent: codex
beauftragt: 2026-10-03
erledigt: 2026-10-03
commit: 6127f57

braucht: [A-97, G-570, A-77]
kind_von: A-97

quellen:
  - docs/punkte/erledigt/quer-a-0097-der-a88-vertrag-hat-eine-tuer-und-der-waechter-sieht-sie-nicht.md
  - docs/punkte/erledigt/goals-g-0570-der-rueckfall-gehoert-nach-dem-einspielen-weg.md
  - docs/punkte/erledigt/goals-g-0595-der-zweiparameter-mantel-war-kein-ueberrest.md
  - docs/punkte/todos/quer-a-0099-der-testdatenpruefer-brach-ab-statt-rot-zu-werden.md

beruehrt:
  tabellen: []
  dateien:
    - tools/pipeline-database-vertrag.mjs
---

# Zwei Waechter pruefen Gestalt statt Verhalten — und beide haben heute versagt

## Auftrag — Kopf

    AUFTRAG FUER Codex - A-98: der Datenbankvertrag wird am Lauf
                              geprueft, nicht am Text
    Bereich: tools/pipeline-database-vertrag.mjs
             supabase/_pipeline/ (nur lesend, falls noetig)
    Fremd:   apps/ und packages/ gehoeren Claude Code. docs/ gehoert
             dem Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-03

## Entschieden — A1 ja, A2 verworfen

**A1 wird gebaut.** Es ist **kein neuer Waechter**, sondern die
Berichtigung eines bestehenden, der heute falsch gruen gemeldet hat.

**A2 ist verworfen** — ein Werkzeug, das `.rpc()`-Aufrufe gegen `pg_proc`
haelt, wird nicht gebaut. `[cmd]` **Begruendung:**
`node tools/schuss.mjs <pfad> <bild.png>` haette beide Ausfaelle des
03.10. gefunden, kostet 1,3 Sekunden und braucht kein neues Werkzeug.
**Der Befund aus G-570/A3 bleibt richtig und bleibt unbearbeitet** — das
ist eine Entscheidung, kein Versehen.

## Der Befund — zwei Ausfaelle an einem Tag, dieselbe Wurzel

`[cmd]` **Erstens, 10:15 bis 11:58 — die Goals-Seite.** A-95 entfernte
`goals.berechne_zielwerte(uuid, date)`; `zielwerte-read.ts` rief sie
weiter. **Niemand hat es gesehen**, bis Tom es sah. `pnpm gate` war gruen
(2.575 Tests), weil es **gegen keine Datenbank laeuft** (A-77).

`[cmd]` **Zweitens, 10:15 bis 12:30 — der A-88-Vertrag.** A-95 baute zwei
Schalter ein, die `PGDATABASE=postgres` zuliessen.
`tools/pipeline-database-vertrag.mjs` blieb **gruen**:

    function hatFailClosed(inhalt, variable) {
      const fehlt = new RegExp(`!\\s*${name}\\b`).test(inhalt)
      const basisdatenbank =
        new RegExp(`\\b${name}\\s*===\\s*(['"])postgres\\1`).test(inhalt)
      return fehlt && basisdatenbank
    }

**Er sucht zwei Muster irgendwo in der Datei und nicht den unbedingten
Wurf.** Beide Muster standen weiter da.

`[read]` **Das ist eine Klasse, nicht zwei Vorfaelle:** ein Waechter, der
Text zaehlt statt einen Lauf zu machen, bestaetigt die Absicht und nicht
die Wirkung. **Dieselbe Klasse wie `assert.match`** in G-578, G-581 und
G-583 — dort eine Ebene tiefer. **Und A-99 ist dieselbe Klasse von der
anderen Seite:** dort bricht ein Pruefer ab, statt rot zu werden.

## A1 — der Datenbankvertrag wird am Lauf geprueft

`[cmd]` **Der Beleg, dass es geht, liegt schon vor.** Der Orchestrator hat
A-97 so abgenommen, von Hand, vier Laeufe:

    030_mikro-uebersicht.ts   PGDATABASE=postgres   Exit 1
    030_mikro-uebersicht.ts   ohne PGDATABASE       Exit 1
    testdaten-einspielen.ts   PGDATABASE=postgres   Exit 1
    testdaten-einspielen.ts   ohne PGDATABASE       Exit 1

`[read]` **Genau das gehoert in den Waechter**, je Skript, statt der zwei
Textmuster.

### Zuerst messen, dann bauen

`[annahme]` **Die Kosten sind der Haken** — ein Lauf je Skript ueber alle
betroffenen Dateien koennte teuer sein. **Also erst zaehlen:**

1. **Wie viele Dateien lesen `PGDATABASE` ueberhaupt?** Nur die kommen in
   Frage.
2. **Wie lange braucht ein Lauf bis zum Wurf?** Die Skripte werfen in den
   ersten Zeilen — messen, nicht schaetzen.
3. **Summe nennen.** Bleibt sie unter ein paar Sekunden, laeuft der
   Waechter alle. Wird sie gross, laufen nur die Dateien, die
   `PGDATABASE` lesen, und der Bericht nennt die Zahl beider Mengen.

**Die gemessenen Zahlen stehen im Bericht, bevor eine Zeile Waechter
entsteht.**

### Was der Waechter danach tut

**Je Skript zwei Laeufe** — mit `PGDATABASE=postgres` und ohne
`PGDATABASE` — und **beide muessen mit Exit ungleich null enden.** Ein
Exit 0 ist rot. **Die Textmuster entfallen**, sie ersetzen nichts und
tragen nichts.

`[read]` **Der Waechter darf nicht selbst stillschweigend scheitern**
(A-99): er nennt die Zahl der geprueften Skripte, und ein Lauf, der
keinen einzigen geprueft hat, ist rot.

## Nachweise

1. **Gegen den heutigen Stand:** gruen, alle Skripte werfen.
2. **Sabotage, und genau die, die heute durchkam:** einen Schalter wie
   `--a95-live` wieder einbauen → der Waechter muss **rot** werden.
   `[read]` **A-88s drei Sabotagen haben diesen Fall nicht abgedeckt** —
   das ist der Grund fuer diesen Punkt.
3. **Zweite Sabotage:** eine Datei, die `PGDATABASE` liest und gar nicht
   wirft → rot.
4. **Gegenprobe:** nach Wiederherstellung wieder gruen, und die Zahl der
   geprueften Skripte ist dieselbe wie in 1.

## Harte Regeln

- **Nie gegen die laufende Datenbank.** Die Proben dieses Punktes
  brauchen keine: die Skripte werfen, bevor sie verbinden. **Falls doch
  eine noetig waere, ist das ein Befund und keine Erlaubnis.**
- **Kein Commit, kein Push.**
- **Keine weiteren Waechter.** Dieser Punkt berichtigt einen
  bestehenden. Faellt dir dabei ein dritter Fall derselben Klasse auf:
  **melden, nicht bauen.**
- **Zahlen im Bericht sind gemessen**, nicht aus diesem Auftrag
  uebernommen.

**Nicht Teil:** A-77 (das Gate hat keine Datenbank, das bleibt so) ·
A-96 (Logdatei des Nachtlaufs) · A-99 (der Testdatenpruefer) · A2, oben
verworfen.

## Abnahme — 2026-10-03, Commit `6127f57`

`[cmd]` **Gate gruen im Vorcommit-Haken.** 1 Datei, +141/−18.

### Die Zahlen des Berichts, von mir nachgemessen

`[cmd]` **211 Quelldateien in `supabase/_pipeline/`, 182 mit
`process.env.PGDATABASE`** — eigene Zaehlung, Zahl fuer Zahl deckungsgleich
mit dem Bericht.

`[cmd]` **Und die Lücke, die ich vermutet hatte, gibt es nicht.** Drei
weitere Dateien nennen `PGDATABASE`, ohne es zu lesen:

    grunddaten-erneuern.ts:129   PGDATABASE: database,
    kette-ausfuehren.ts:328/338  PGDATABASE: db,

**Das sind Setzer, keine Leser** — sie geben den Namen an ein Kind weiter.
Der Zuschnitt des Musters ist also richtig, nicht zu eng.

`[cmd]` **Laufzeit, zweimal gemessen:** 6,804 s und 6,893 s. **Der
Bericht sagte „etwa 6,7 s" — das haelt.** Der eigene Test der Datei
braucht 7,663 s, 5 von 5 gruen.

### Die rote Richtung habe ich selbst erzeugt

`[cmd]` **Eine Wegwerfdatei mit einem Leser ohne Wurf** nach
`supabase/_pipeline/` gelegt, Waechter gefahren:

    183 von 212 Pipeline-Skripten im Lauf geprueft.
    _a98-abnahme-probe.ts:4: PGDATABASE-Leser ist im Lauf nicht
      fail-closed (ohne PGDATABASE: Exit 0; mit PGDATABASE=postgres:
      Exit 0).

`[cmd]` **Datei entfernt, Waechter wieder gruen:** 182 von 211.
**Damit ist die Pruefung in beide Richtungen belegt, und zwar von mir,
nicht vom Bericht.**

### Die Bauart, und warum sie die Klasse wirklich trifft

`[read]` **Der Kern ist `laufVerletztVertrag`:**

    ergebnis.fehler || ergebnis.signal || ergebnis.code === 0
      || ergebnis.code === GESPERRTER_ZUGRIFF

**Exit 86 ist der Griff, der zaehlt:** die Laufzeitsperre beendet das
Skript mit 86, sobald es einen Kindprozess, einen Socket oder `fetch`
anfasst. **Ein Skript, das bis zur Datenbank kommt, verletzt den
Vertrag — und das ist genau die Aussage, die vorher kein Muster traf.**

`[read]` **Und `process.argv.includes` ist waehrend der Probe so
veraendert, dass JEDER `--`-Schalter als gesetzt gilt.** Damit oeffnet
die Probe alle Tueren auf einmal — die `--a95-live`-Tuer aus A-97 waere
nicht durchgekommen.

`[read]` **Die A-99-Lehre ist eingebaut**, ohne dass ich sie verlangt
hatte: `pgLeser.length === 0` ist ein Verstoss, und die Zahl der
geprueften Skripte steht in der Ausgabe. **Ein Lauf, der nichts geprueft
hat, ist nicht mehr von einem gruenen zu unterscheiden — jetzt doch.**

### Ein Restloch, benannt und nicht geschlossen

`[read]` **Ein Exit ungleich 0 und ungleich 86 gilt als vertragstreu.**
Ein Skript, das an einem Tippfehler oder einem fehlenden Import
stirbt, zaehlt damit als fail-closed. **Gedeckt ist das vom Typecheck
und von den Tests im Gate** — aber es ist dieselbe Klasse: ein
Merkmal, zwei Bedeutungen.

`[read]` **Dazu:** die fuenf Proben des eigenen Tests sind die
A-88-Proben. **Der neue Fall — ein Leser, der gar nichts wirft — hat
keine eigene Probe;** ich habe ihn von Hand belegt. **Beides gehoert in
A-99 als Nachtrag, nicht in einen neuen Punkt.**

### Kosten, die jeder Commit jetzt traegt

`[cmd]` **Der Waechter laeuft ueber seinen Test im Gate** (`tools`-Paket,
61 Proben). **6,8 s je Lauf, 364 Kindprozesse, 12 parallel.** Bei
gefuelltem Turbo-Cache faellt das weg; bei kaltem kommt es dazu.
**Gemessen und hingenommen** — A-97 hat von Hand dieselben vier Laeufe
gebraucht, nur ohne Netz.

**A2 bleibt verworfen.** Nicht gebaut, und das war die Entscheidung.
