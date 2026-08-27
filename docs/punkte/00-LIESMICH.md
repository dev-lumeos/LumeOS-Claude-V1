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
    kind_von: null
    kinder: [C-314]
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
