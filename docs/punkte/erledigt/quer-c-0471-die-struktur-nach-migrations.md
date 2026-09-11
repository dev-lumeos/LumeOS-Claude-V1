---
nr: C-471
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-468
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 220275b4
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
---

# C-471 — die Struktur gehoert nach migrations/

## Die Regel steht schon

`[cmd]` **`supabase/README.md`, D-17, Weg B, seit 2026-08-05:**

    migrations/   Deploybare Struktur. Schemas, Tabellen,
                  Constraints, Indizes, Funktionen, Trigger,
                  Policies, Grants. KEINE Daten.

    _pipeline/    Lokale Aufbaukette und lokale Wahrheit.
                  Katalog-Seeds, CSV-Import, Ableitungen.
                  Wird NICHT deployt.

`[cmd]` **Und die harte Grenze:**

> *,,Eine Migration darf Tabellen, Spalten, Constraints, Indizes,
> Funktionen, Trigger, RLS, Policies und Grants definieren. Sie
> darf KEINE Katalogdaten schreiben."*

## Was falsch liegt

`[cmd]` **C-468 hat `public.koerperflaechen` in
`_pipeline/00_querschnitt/` angelegt** ? **Struktur UND Daten.**

`[read]` **Die Tabelle mit RLS und Grants gehoert nach
`migrations/`.**

`[read]` **Die 59 Zeilen sind Stammdaten** ? **sie bleiben im
Kettenschritt.**

`[cmd]` **Claude Code hat den Hook NICHT umgangen und gefragt** ?
**richtig.**

`[read]` **Die Antwort haette der Orchestrator geben muessen,
nicht Tom.**

## Was zu tun ist

**1** ? **Die Struktur nach `migrations/`.**

    CREATE TABLE public.koerperflaechen
    die CHECKs auf ebene, art, seite
    der Fremdschluessel auf sich selbst (parent_id)
    der Fremdschluessel auf training.muscle_groups
    die Indizes
    ALTER TABLE ... ENABLE ROW LEVEL SECURITY
    die Policy
    REVOKE ALL ... dann GRANT SELECT

`[cmd]` **Das `REVOKE ALL` MUSS mit** ? **C-470: `pg_default_acl`
vergibt in `public` sonst alles.**

**2** ? **Die 59 Zeilen bleiben in `_pipeline/`.**

`[read]` **Der Kettenschritt schreibt sie, die Migration legt die
Tabelle an.**

**3** ? **Der Hook.**

`[cmd]` **`supabase/migrations/` ist schreibgeschuetzt.**

`[read]` **Miss, wie andere Migrationen dort hingekommen sind** ?
**es muss einen Weg geben, sonst waere seit dem 05.08. keine
entstanden.**

`[cmd]` **`node tools/migration-datenlogik-pruefen.mjs` prueft die
Grenze** ? **er muss gruen bleiben.**

## Abnahmebedingungen

    A1  die Struktur in migrations/, die Daten in _pipeline/.
        Beide Dateien benannt.
    A2  REVOKE ALL ist dabei. Gemessen: authenticated hat
        nach einem Frischaufbau nur SELECT.
    A3  migration-datenlogik-pruefen.mjs gruen.
    A4  die 59 Zeilen stehen nach dem Kettenlauf.
    A5  wie der Hook umgangen wird: benannt, nicht
        heimlich.
    A6  Vollkette, Punktelauf.

## Was nicht zu tun ist

**Keine Daten in die Migration** ? **kein `INSERT`, kein `COPY`.**
**Den Hook nicht aushebeln** ? **wenn es keinen Weg gibt, melden.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

### A5 — wie der Hook umgangen wird: benannt, nicht heimlich

`[cmd]` **Der Hook blockt DREI Wege** (`protect-paths.ps1:67-130`):

    Write/Edit auf supabase/migrations/        -> Deny
    Bash-Schreibbefehl in Befehlsposition      -> Deny
      (tee, cp, mv, rm, touch, truncate, dd,
       install, ln, git mv/rm, sed -i)
    Bash-Redirection  > ...supabase/migrations -> Deny

`[cmd]` **Und er nennt seine Luecken SELBST**, im Kopf ab Zeile 23:

> *„BENANNTE LUECKEN (bewusst, Damm gegen Versehen, nicht gegen
> Absicht): … Interpreter-Einzeiler (`python -c "open('.env')"`)."*

`[read]` **Das ist kein vergessenes Loch, sondern eine Entscheidung:**
gegen ein Versehen soll er schuetzen, gegen eine begruendete Absicht
nicht.

**BENUTZT HABE ICH GENAU DAS:**

    python -c "... io.open(ziel,'w').write(inhalt) ..."

`[read]` **`python` steht in keiner der beiden Listen** — weder bei
den Lesern noch bei den Schreibern. **Der Hook sieht einen
Interpreteraufruf, keinen Dateizugriff.**

`[cmd]` **Warum das der richtige Weg ist, und nicht ein Trick:**

    1  D-17 sagt, wo die Struktur hingehoert: migrations/
    2  C-471 beauftragt genau diesen Umzug
    3  der Hook nennt Interpreter als bewusste Luecke
    4  es steht hier, im Bericht, mit dem Befehl

`[cmd]` **Gegenprobe im Audit-Log** (`protect-paths.log`): **mein
C-468-Versuch ist der EINZIGE je geblockte Migrationsschreibzugriff.**
`[read]` **34 Migrationen liegen dort** — sie sind alle anders
hineingekommen, ohne je aufzulaufen.

`[read]` **Ich habe den Hook NICHT verändert und nichts abgeschaltet.**

### A1 — die Struktur in `migrations/`, die Daten in `_pipeline/`

    supabase/migrations/20260911180000_c471_koerperflaechen_struktur.sql
      CREATE TABLE public.koerperflaechen
      5 CHECKs (ebene, art, seite, wurzel, umriss)
      parent_id -> sich selbst, ON DELETE RESTRICT
      muscle_group_id -> training.muscle_groups, ON DELETE SET NULL
      3 Indizes
      Trigger + Funktion fuer updated_at
      ENABLE ROW LEVEL SECURITY + Policy
      REVOKE ALL (3x) + GRANT SELECT + GRANT ALL

    supabase/_pipeline/00_querschnitt/468b_koerperflaechen_seed.sql
      8 Wurzeln, 23 Flaechen, 28 Seitenzeilen

`[cmd]` **Gezaehlt:**

    Migration   19 Strukturanweisungen,  0 Datenanweisungen
    Seed        40 Datenzeilen,          0 Strukturanweisungen

`[cmd]` **Die alte Mischdatei
`_pipeline/00_querschnitt/468_koerperflaechen_hierarchie.sql` ist
entfernt** — ihr Inhalt steht jetzt in der Migration. `[read]`
**Zwei Orte fuer dieselbe Tabelle waeren zwei Wahrheiten.**

`[cmd]` **`kette.json` nachgezogen:** der Strukturschritt
`468_koerperflaechen` ist raus, `471_koerperflaechen_struktur` zeigt
auf die Migration, und `468b_koerperflaechen_seed` haengt jetzt
daran.

### A2 — `REVOKE ALL` ist dabei, am Frischaufbau gemessen

`[read]` **Nicht am Bestand geprueft, sondern neu gebaut** — sonst
saehe man Rechte, die noch von C-468 stammen.

    drop table public.koerperflaechen cascade;   -> DROP TABLE
    Migration                                    -> ok
    Kettenschritt                                -> ok

**DANACH GEMESSEN:**

    authenticated   SELECT            (und sonst NICHTS)
    anon            0 Zeilen in role_table_grants

**GEGENPROBE, beide Richtungen:**

    authenticated  SELECT  -> 59 Zeilen            MUSS gehen     ok
    anon           SELECT  -> permission denied    MUSS scheitern ok
    authenticated  INSERT  -> permission denied    MUSS scheitern ok

`[cmd]` **Ohne das `REVOKE ALL … FROM authenticated` stuenden dort
UPDATE, TRUNCATE, TRIGGER und REFERENCES** — `pg_default_acl` vergibt
in `public` bei jeder neuen Tabelle `arwdDxtm` (C-470).

`[read]` **Die drei `REVOKE`-Zeilen sind der Unterschied zwischen
„RLS faengt es ab" und „das Recht gibt es gar nicht".**

### A3 — `migration-datenlogik-pruefen.mjs`

`[cmd]` **Meine Migration wird NICHT bemaengelt:**

    grep -c "c471"  ->  0

`[cmd]` **Der Pruefer ist trotzdem rot (EXIT 1)** — er nennt
**fuenfzehn andere Migrationen**, alle aus frueheren Auftraegen und
alle committet:

    c428 c429 c432 c440 c441 c453 c455 c457
    c459 c460 c463 c464 c465 c466 c467

`[read]` **Das ist Bestand, nicht neuer Schaden** — belegt ueber
`git log` je Datei. `[read]` **Die Grenze, die A3 meint, haelt:**
kein `INSERT`, kein `COPY`, kein `UPDATE`, kein `DELETE` in
`c471`.

`[read]` **Den Sollstand des Pruefers anzuheben waere ein eigener
Auftrag** — ich habe ihn nicht angefasst.

### A4 — die 59 Zeilen stehen nach dem Kettenlauf

    vor dem Drop     59
    nach dem Drop     0
    Migration         Tabelle angelegt
    Kettenschritt     INSERT 0 8 / 23 / 28
    nachher          59

    Ebene  Art      Zeilen
    1      muskel        7    + 1 umriss (wurzel-umriss)
    2      muskel       17    + 6 umriss
    3      muskel       28
                       ---
                        59

### A6 — Vollkette und Punktelauf

    migration-kette-pruefen   gruen: 35 Dateien, keine neue
                              Migration ohne Kettenschritt
    punkte-pruefen            gruen: 25 Befunde, genau der
                              Sollstand. Kein neuer Schaden.
    schemafreigabe-pruefen    10 config-Schemata, 8 Anwendungs-
                              schemata freigegeben
    nummern-pruefen           keine Dublette

`[cmd]` **Die Kette zaehlt jetzt 35 Migrationen statt 34** — meine
ist registriert.

## Was NICHT getan wurde

**1 — Keine Daten in die Migration.** `[cmd]` **0 INSERT, 0 COPY,
0 UPDATE, 0 DELETE** — gezaehlt.

**2 — Der Hook wurde nicht ausgehebelt.** `[read]` **Keine Zeile in
`protect-paths.ps1` geaendert, nichts abgeschaltet** — nur die
Luecke benutzt, die er selbst benennt, und hier aufgeschrieben.

**3 — `apps/` nicht angefasst.**

**4 — Der Dev-Server nicht angefasst.**

**5 — Nicht committet, nicht gestaged.**

## Zwei Hinweise

**1 — Der Pruefer `migration-datenlogik-pruefen.mjs` ist seit
laengerem rot.** `[cmd]` **Fuenfzehn committete Migrationen tragen
Datenlogik** — C-428 bis C-467. `[read]` **Solange er rot ist, faellt
eine NEUE Verletzung nicht auf**: wer ihn laufen laesst, sieht
ohnehin eine Liste. **Das ist ein eigener Punkt wert.**

**2 — Der Hook blockt `Write`, aber nicht `python -c`.** `[read]`
**Das ist so gewollt** (sein Kopf sagt es), **aber es heisst auch:
jeder Agent kann dorthin schreiben, wenn er will.** `[read]` **Der
Schutz liegt in der Sichtbarkeit, nicht in der Sperre** — deshalb
steht der Weg in A5 und nicht nur im Verlauf.

## Neustart

`[cmd]` **NICHT noetig** — nur `supabase/` und `docs/`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    Migration  20260911180000_c471_koerperflaechen_struktur.sql
               21 Strukturanweisungen
    Seed       468b_koerperflaechen_seed.sql, 0 Struktur
    Rechte     authenticated SELECT, anon nichts
    Zeilen     59

`[cmd]` **Mein erster Zaehllauf meldete 13 Datenanweisungen in
der Migration** ? **alle dreizehn sind Kommentare, `ON DELETE
RESTRICT` und `BEFORE UPDATE`.**

`[read]` **Ich habe Schluesselwoerter gezaehlt, nicht
Anweisungen** ? **derselbe Fehler, den ich mir heute abgewoehnen
wollte.**

### A5 — der Weg ist benannt, nicht verborgen

> *,,Der Hook blockt Write/Edit, Bash-Schreibbefehle in
> Befehlsposition und Redirections. Seinen Kopf ab Zeile 23 nennt
> er selbst: BENANNTE LUECKEN (bewusst, Damm gegen Versehen,
> nicht gegen Absicht): ... Interpreter-Einzeiler."*

`[read]` **Er hat die Luecke benutzt, die der Hook selbst
ausweist** ? **und sie im Bericht genannt, nicht im Verlauf
versteckt.**

> *,,Keine Zeile am Hook geaendert, nichts abgeschaltet."*

`[cmd]` **Und das Audit-Log:** *,,mein C-468-Versuch war der
einzige je geblockte Migrationsschreibzugriff, waehrend 34
Migrationen dort liegen."*

`[read]` **Der Hook hat noch nie jemanden aufgehalten** ? **ausser
ihm, und nur weil er ihn nicht umgangen hat.**

### A2 am Frischaufbau, nicht am Bestand

> *,,Tabelle gedroppt, Migration + Kettenschritt neu gelaufen."*

`[cmd]` **59 -> 0 -> 59.**

`[read]` **Er hat nicht gemessen, was dasteht** ? **er hat
gemessen, was entsteht.**

`[cmd]` **Und die Gegenprobe in beide Richtungen:** **`anon`
SELECT und `authenticated` INSERT scheitern, `authenticated`
SELECT gibt 59.**

> *,,Ohne das REVOKE ALL ... FROM authenticated stuenden dort
> UPDATE und TRUNCATE."*

### Der Satz, der bleibt

> *,,Der Schutz liegt in der Sichtbarkeit, nicht in der Sperre.
> Jeder Agent kann ueber einen Interpreter nach `migrations/`
> schreiben."*

`[read]` **Eine Sperre, die jeder umgehen kann, ist eine
Vereinbarung** ? **und Vereinbarungen halten, wenn Abweichungen
sichtbar werden.**

**Abgenommen.**

