# Punkte — wie sie gefuehrt werden

**Seit 2026-08-27.** Loest `docs/todo/TODO.md` und
`docs/todo/ERLEDIGT.md` ab.

---

## Der Ordner ist der Zustand

    docs/punkte/todos/                angelegt, noch nicht beauftragt
    docs/punkte/laufend_codex/        beauftragt, laeuft
    docs/punkte/laufend_claudecode/
    docs/punkte/laufend_fable/
    docs/punkte/laufend_kimi/
    docs/punkte/erledigt/             geprueft und abgeschlossen
    docs/punkte/00-INDEX.md           erzeugt, nie von Hand

`[read]` **Ein Punkt liegt in genau einem Ordner.** Damit kann er
nicht *offen* heissen und erledigt sein — der Fehler, den der
Nummernwaechter am 27.08. dreimal gemeldet hat.

## Der Weg eines Punktes

1. **Angelegt** — blanko in `todos/`. Nur der Befund, keine
   Auftragsdaten.
2. **Beauftragt** — der Orchestrator reichert *dieselbe Datei* um den
   Auftragsteil an und verschiebt sie nach `laufend_<agent>/`. Tom
   bekommt die Anweisung mit dem Pfad zur Datei.
3. **Bearbeitet** — der Agent haengt seinen Bericht **unten an
   dieselbe Datei**. Er verschiebt nichts.
4. **Abgenommen** — der Orchestrator prueft gegen die Datenbank, nicht
   gegen den Bericht. Bei Gruen: `erledigt`, `commit` und `durch`
   eintragen, Datei nach `erledigt/`.

`[read]` **Auftrag, Bericht und Befund stehen in einer Datei.** Kein
Abgleich zwischen drei Verzeichnissen, kein Auftrag ohne Punkt, kein
Bericht ohne Auftrag.

`[read]` **Verschieben darf nur der Orchestrator.** Der Agent
schreibt, der Orchestrator urteilt.

## Kimi ist ein Sonderfall

`[read]` **Kimi liefert Dateien, keine Commits.** Ein Punkt in
`laufend_kimi/` wartet nicht auf einen Bericht im Repo, sondern auf
Daten unter `docs/kimi_research/`.

**Die Abnahme heisst dort: Datei oeffnen, Zeilen zaehlen, gegen den
Bestand halten.** `[cmd]` So lief C-292 (442 CAS, 23 ATC, 302 MoA,
385 Precautions, 81 Reproduktionsdaten) und C-293 (498 Nutzertexte,
2.313 FAQ).

**Was das fuer die Felder bedeutet:**

    beruehrt.dateien   die gelieferten .jsonl, mit Pfad
    zahlen.gemessen    das Datum der eigenen Zaehlung, nicht Kimis
    commit             der Commit des IMPORTS, nicht Kimis Lieferung

`[read]` **Und der Fallstrick, der zweimal zugeschlagen hat:** in die
Dateien sehen, nicht auf die Dateinamen. `[cmd]` **`sex_specific` war
bei allen 81 ein leeres Objekt** — wer auf Schluesselanwesenheit
prueft, zaehlt 81 Treffer und importiert 81 leere Objekte.

## Der Dateiname

    <modul>-<reihe>-<nummer vierstellig>-<kurztitel>.md

    supplements-C-0296-drug-class-fallverdopplung.md
    medical-G-0208-wirkstoffkatalog-unsichtbar.md
    quer-A-0051-zahlen-brauchen-stichtag.md

**Modul zuerst**, damit `ls` nach Modul gruppiert — das ist die
Sicht, in der gearbeitet wird.
**Nummer vierstellig**, damit alphabetisch gleich numerisch ist:
`C-0296` sortiert nach `C-0030`, `C-296` nicht.
**Der Name aendert sich beim Wandern nie** — Auftraege, Berichte und
Commits verweisen auf die Nummer.

`[read]` **Kein Datum im Dateinamen** — es steht im Frontmatter und
wuerde die Modulsortierung zerschlagen. **Abweichung von Toms
Entwurf, bewusst und hier begruendet.**

## Frontmatter

    ---
    nr: C-296
    typ: befund          # befund | feature | blocker | entscheidung | messung
    modul: supplements   # medical, nutrition, training, recovery,
                         # goals, coach, quer
    schwere: hoch        # hoch | mittel | niedrig
    angelegt: 2026-08-27

    braucht: []          # blockiert von diesen Nummern
    kind_von: null       # aus welchem Punkt ist dieser entstanden
    entscheidung: E-01   # welche Entscheidung haengt dran

    beruehrt:
      tabellen: [medical.medication_active_substances]
      dateien: [apps/web/src/lib/supplements/substanz-read.ts]

    zahlen:
      gemessen: 2026-08-27   # Pflicht, sobald zahlen: steht
      maoi_gross: 15
      maoi_klein: 15

    # erst beim Beauftragen
    agent: codex
    beauftragt: 2026-08-27

    # erst beim Abschluss
    erledigt: 2026-08-27
    commit: 677344f
    durch: G-208         # falls ein anderer Punkt ihn miterledigt hat
    ---

### Warum `beruehrt` und `zahlen.gemessen` Pflicht sind

`[cmd]` **Am 27.08. sind vier Auftraege an ihrer eigenen Praemisse
gescheitert**, weil Punkte Zahlen und Orte nannten, die niemand gegen
die Wirklichkeit gehalten hat:

    G-186 nannte `wissen.entity_transporters`
          -> die Tabellen liegen in `supplements.`
    G-170 nannte `medical.medications`
          -> gibt es nicht
    G-176 sprach von 290 Substanzen
          -> es sind 412
    G-138 zaehlte Vorlagennamen gegen Codenamen
          -> `LogDoseModal` heisst hier `LogDoseFenster`

`[read]` **Ein Punkt behauptet etwas ueber die Welt. Diese
Behauptung muss maschinell pruefbar sein** — `beruehrt.tabellen`
gegen `information_schema`, `beruehrt.dateien` gegen das
Dateisystem, jede Zahl mit ihrem Stichtag.

`[read]` **Sonst prueft der Waechter die Buchhaltung gegen sich
selbst** — genau wie der Regelkatalog 64 Regeln meldet, von denen 25
nicht feuern.

### Es gibt kein Feld `kinder`

`[cmd]` **Es gab eins, und es hat sich nicht bewaehrt:** nach der
Migration standen **121 `kind_von` gegen 1 `kinder`.**

`[read]` **Das war zwangslaeufig, nicht nachlaessig.** Wer ein Kind
anlegt, traegt `kind_von` ein — **niemand geht zum Elternteil zurueck
und pflegt die Gegenrichtung.** Zwei Felder fuer dieselbe Beziehung
sind eine Driftquelle, und das Modell soll Drift verhindern, nicht
erzeugen.

**Die Kinder stehen im Index**, abgeleitet aus `kind_von`.

### `kind_von` darf auf erledigte Punkte zeigen

`[read]` **Der Normalfall, nicht die Ausnahme:** C-303 ist aus G-207
entstanden, C-306 aus G-208 — **die Eltern sind laengst
geschlossen.**

`[cmd]` **Der Waechter loest deshalb auch gegen `ERLEDIGT.md` auf.**
Ohne das haette er **93-mal etwas Richtiges als falsch gemeldet.**

`[cmd]` **Und er nennt bei jedem Lauf, wie viele Verweise nur so
aufloesbar sind — heute 72.** `[read]` **Diese Zahl ist der
Fortschrittsbalken der Migration:** sie sinkt auf null, wenn die 385
erledigten Punkte nach `erledigt/` gewandert sind. **Dann kann
`ERLEDIGT.md` weg.**

## Aufbau der Datei

    ---
    (Frontmatter)
    ---

    # C-296 - drug_class fuehrt jeden Tag doppelt

    ## Befund
    Was gemessen wurde, mit [cmd] je Zahl.

    ## Auftrag        <- vom Orchestrator beim Beauftragen
    Zu tun / Was nicht zu tun ist / Nachweis / Regeln.

    ## Bericht        <- vom Agenten angehaengt
    Was er gemessen und gebaut hat.

    ## Abnahme        <- vom Orchestrator
    Was unabhaengig nachgemessen wurde, mit [cmd].

## Der Orchestrator zaehlt nicht

**Seit 2026-08-27, auf Toms Anweisung.**

`[read]` **Ein Auftrag traegt die Frage und die Messanweisung — keine
Zahlen vom Orchestrator.**

### Warum

`[cmd]` **Am 27.08. lagen meine Zaehlungen elfmal daneben, jedes Mal
beim Abgrenzen einer Kategorie:**

    27 statt 18 Attrappen      `git grep -c` zaehlt Zeilen, nicht Treffer
    5 statt 7 Tabellen         ein Regex loest keine View auf
    124 statt 380 Wirkstoffe   ueber Formulierungen statt bis zum Produkt
    31 statt 20 Regeln         Textsuchtreffer fuer eine Kategorie gehalten
    3 statt 1 Schreibstelle    Fundstellen statt schreibende Aufrufe
    47 statt 43 Punkte         A-, F-, GO-Reihen nicht abgezogen
    244 statt 221 Datumsangaben  `null` ist ein Zeichen
    105 kaputte Dateien        113 waren Namen ohne Pfad
    6.600 statt 6.084 Zeilen   Zahl aus einer aelteren Messung

`[cmd]` **Und derselbe Fehler auf 25 Punkte gleichzeitig angewandt:**
eine Textheuristik ueber Berichte statt einer Messung je Punkt.
**Mindestens einer davon war falsch** (C-274), gefunden von Codex,
**weil er eine Anweisung verweigert und stattdessen gemessen hat.**

`[read]` **Der Befund, der es entscheidet:** in jedem Fall haette der
Agent dieselbe Zahl gemessen, auch ohne meine. **Meine Zahl hat nie
etwas beigetragen — sie hat nur einen Umweg erzeugt.**

`[read]` **Die Regel *,,die Zahlen sind Ausgangsvermutungen"* war eine
Kruecke fuer ein Problem, das ich selbst erzeuge.** Sie hat gewirkt —
sechsmal hat ein Agent berichtigt — **aber sie hat ein Risiko
verwaltet, statt es zu beseitigen.**

### Was der Orchestrator weiter prueft

**Ob das Ziel existiert und nicht schon erledigt ist.** `[cmd]`
**Viermal hat das einen Auftrag gerettet:** G-207 (die Tabellen gab
es schon), G-211 (`active_substance_id` wird von keiner Regel
gelesen), G-138 (der Schreibweg existierte seit G-148), G-176 (die
Grenze war entfernt und ein Test hielt sie draussen).

`[read]` **Das ist eine Ja/Nein-Frage, keine Zaehlung.** *,,Gibt es
die Tabelle?"* geht. *,,Wie viele Zeilen hat sie unter welcher
Bedingung?"* nicht.

### Wie ein Auftrag stattdessen formuliert wird

    frueher   ,,Es sind 31 Regeln, pruef das."

    jetzt     ,,Miss, wie viele Regeln ueber `drug_class` gehen -
               und sag mir, wie du abgegrenzt hast."

`[read]` **Die zweite Form erzeugt dieselbe Zahl ohne den Umweg —
und verlangt die Abgrenzung mit, die bei mir jedes Mal schiefging.**

## Der Waechter arbeitet mit Sollstand je Art

`[cmd]` **Muster wie C-313b:** der Waechter zaehlt Befunde gegen einen
erwarteten Stand. **Mehr ist rot. Weniger ist auch rot** — mit dem
Hinweis, den Sollstand nachzuziehen.

`[read]` **Je Art, nicht als Summe.** Ein Sollstand ueber alle Arten
ist zu grob: **54 `kind_von`-Befunde koennten verschwinden und 54
Tabellenfehler entstehen — die Summe bliebe gleich, das Gate gruen.**

`[read]` **Die Ratsche wirkt nachweislich.** `[cmd]` Am 27.08. stieg
der Stand binnen Minuten von 225 auf 226, **weil ich A-54 mit
`kind_von: A-52` angelegt habe, ohne die Gegenrichtung zu pflegen** —
gefangen, waehrend der Fehler entstand.

## Entscheidungen

    docs/entscheidungen/E-01-inn-form-fuehrt.md

**Nach ADR-Muster, anhaengend.** Eine getroffene Entscheidung wird
nicht nachtraeglich geaendert — aendert sie sich, entsteht ein neuer
Eintrag mit `loest_ab: E-01`, und der alte bekommt
`abgeloest_durch`.

`[read]` **Der Grund ist derselbe wie bei den Punkten:** Toms
INN-Entscheidung vom 27.08. steckt heute als Prosa in C-314. **Wer in
sechs Monaten fragt, warum Paracetamol fuehrt, findet sie dort
nicht.**

### Ein ADR ist das Ergebnis, nicht die Frage

`[read]` **`docs/entscheidungen/` enthaelt getroffene Entscheidungen.**
Ein offener Entscheidungsbedarf ist noch kein ADR — er bleibt ein
Punkt mit `typ: entscheidung` in `todos/`.

`[cmd]` **Heute stehen dort 43 solche Punkte.** `[read]` **Sie warten
nicht auf einen Agenten, sondern auf Tom.**

**Wenn Tom entscheidet:** ADR anlegen, und der Punkt bekommt
`entscheidung: E-xx` — damit ist er beauftragbar.

`[read]` **Das war eine Praezisierung meines eigenen Vorschlags:** ich
hatte gesagt, die 43 gehoerten *nach* `docs/entscheidungen/`. **Falsch
— dorthin gehoert nur, was entschieden ist.**

## Reihen

`C` Daten und Schema · `G` Oberflaeche · `A` Arbeitsweise ·
`E` Entscheidungen · `B`, `F`, `GO` bestehend.

`[read]` **Bleiben, obwohl das Modul jetzt im Dateinamen steht.** 385
erledigte Punkte, alle Berichte und alle Commits verweisen darauf —
eine Umnummerierung waere teuer und ohne Gewinn.

## Der Index

`00-INDEX.md` wird aus dem Frontmatter erzeugt: eine Zeile je Punkt
mit Nummer, Modul, Typ, Schwere, Titel, Zustand und Blockern.

`[read]` **Nie von Hand pflegen.** Ein handgefuehrter Index driftet —
so wie meine Zahlen gedriftet sind.
