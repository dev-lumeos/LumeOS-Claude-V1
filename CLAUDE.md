# LumeOS ? Regeln

**Diese Datei traegt die Regeln. Die Gruende stehen in
`docs/lehren/`.**

`[read]` **Eine Regel ohne Grund wird irgendwann fuer laestig
gehalten und umgangen.** `[cmd]` **Deshalb: wer eine Regel anwendet
und nicht versteht, warum sie gilt, liest die Lehre nach ? nicht
umgekehrt.**

`[cmd]` **Am 2026-09-08 nannte der Orchestrator
`server.py aufraeumen`, um den Server zu stoppen. Der richtige
Befehl stand seit dem 22.08. in Zeile 1307 einer 1817-Zeilen-Datei.
Sie ist deshalb aufgeteilt.**

## Wo was steht

    docs/lehren/ablauf.md      Rolle, Auftrag, Bericht, Abnahme
    docs/lehren/messen.md      Pruefungen, Zahlen, Gegenproben
    docs/lehren/quellen.md     die vier Quellen vor jedem Auftrag
    docs/lehren/werkzeuge.md   Server, Gate, Terminal, Datenbank
    docs/lehren/daten.md       Schema, Seeds, Sprachen, Backup
    docs/lehren/mockup.md      Attrappen, Referenzen, E-68 bis E-70
    docs/lehren/schreiben.md   Dateien, Suche, Index, Altlasten

---

## `docs/ssot/` ist die Wahrheit ? Punkte sind der Arbeitsvorrat

**Tom, 2026-09-08:**

> ja wir koennen den ganzen tag in punkte arbeiten, aber wenn wir
> den tag abschliessen wird nachgetragen, denn da liegt die wahre
> source

`[cmd]` **`docs/ssot/00-INDEX.md`:** *,,Dieser Ordner ist die
einzige verbindliche Beschreibung des Ist-Zustands."*

    Rangfolge bei Widerspruch:
    1  Code (verifiziert per Befehl)
    2  docs/ssot/
    3  docs/specs/  (das Ziel, nicht der Ist-Zustand)
    4  alles andere

### Die Arbeitsteilung

    docs/punkte/          der Arbeitsvorrat: was offen ist,
                          was laeuft, was abgenommen wurde
    docs/entscheidungen/  was Tom entschieden hat
    docs/ssot/            WAS GEBAUT IST -- die Wahrheit

### Nachsehen statt messen

`[cmd]` **Drei erzeugte Dateien beantworten die haeufigsten
Fragen:**

    00-MODULTABELLEN.md   Tabellen, Spalten, Zeilen, Datum
    00-SCHEMA.md          Funktionen, Policies, CHECKs, Sichten
    00-ABGENOMMEN.md      was wann abgenommen wurde
    00-SPEC-ABGLEICH.md   was die Spec nennt und das Schema nicht
                          hat -- und umgekehrt

`[read]` **Heisst die Tabelle so? Gibt es den Schreibweg? Was
erlaubt der CHECK?** ? **erst dort nachsehen, dann messen.**

### Vor jedem Auftrag: der Abgleich, nicht das Gedaechtnis

**Tom, 2026-09-08:** *,,du fantasierst dich durch themen durch, die
definiert sind ? und wenn nicht, fragst du mich."*

`[cmd]` **Fuenf Behauptungen an einem Tag, alle von Agenten
berichtigt:**

    `conditions`                    heisst `user_conditions`
    `is_primary` gibt es nicht      gibt es, mit eigenem Index
    `client_id` ist nullable        NOT NULL, zweifach
    keine Spec nennt den Erzeuger   SPEC_08:163 und SPEC_07:10
    `supplements.injection_*`       liegt in `medical`, fuenf Tabellen

`[read]` **Vier davon standen in einer Datei, die der Orchestrator
selbst erzeugt hatte.**

`[cmd]` **`docs/ssot/00-SPEC-ABGLEICH.md` sagt, WO gelesen werden
muss** ? **bei 159 Spec-Dateien ist das der Unterschied.**

`[read]` **Es ersetzt das Lesen nicht.**

`[cmd]` **Am 2026-09-08 hat der Orchestrator dutzende Male `psql`
gerufen und wurde dreimal berichtigt** ? `user_conditions` **statt**
`conditions`, `is_primary` **existiert,** `client_id` **ist NOT
NULL.** `[read]` **Alle drei standen in der Datenbank, keine in
einer Datei.**

### Der Orchestrator pflegt sie ? das ist seine Arbeit

**Tom, 2026-09-08:** *,,claude.md muss dir auch sagen, dass du diese
daten zu pflegen hast."*

`[read]` **Niemand sonst tut es.** `[cmd]` **Agenten schreiben nicht
nach `docs/`** ? **sie messen und melden.**

**Nach jeder Abnahme, die Schema oder Daten beruehrt:**

    node tools/ssot-modultabellen.mjs --schreiben
    node tools/ssot-schema.mjs --schreiben
    node tools/spec-abgleich.mjs --schreiben

**Zum Tagesabschluss zusaetzlich:**

    node tools/ssot-nachtragen.mjs --schreiben

`[read]` **Das kostet Sekunden** ? **eine erzeugte Datei liest die
Datenbank, sie fragt niemanden.**

**Und was NICHT erzeugt wird, ist Handarbeit:**

`[read]` **Wozu eine Tabelle da ist.** `[read]` **Was bewusst nicht
gebaut wurde** ? **eine Abwesenheit hat keine Zeile, und genau da
entstanden fuenf Falschaussagen** (G-382 bis G-384).

`[read]` **Die Beurteilung Mockup / angebunden / verworfen.**

`[cmd]` **Am 2026-09-08 lag die SSOT zwoelf Tage zurueck** ? **112
Commits, keiner nachgetragen** (A-74).

`[cmd]` **`tools/ssot-alter-pruefen.mjs` steht deshalb im Gate** ?
**es meldet, wenn seit dem letzten Nachtrag zu viel gebaut wurde.**

`[read]` **Ein Waechter ersetzt die Pflege nicht** ? **er erinnert
nur daran.**

`[read]` **Ein Punkt beschreibt einen Auftrag.** `[read]` **Die
SSOT beschreibt den Zustand.**

### Zum Tagesabschluss wird nachgetragen

`[read]` **Nicht nach jedem Punkt** ? **das waere doppelte
Buchfuehrung.**

`[read]` **Aber am Ende des Tages:** **was heute gebaut wurde,
steht in `docs/ssot/`.**

`[cmd]` **Am 2026-09-08 gemessen: letzter Commit in `ssot/` am
27.08., seither 112 Commits in `supabase/` und `apps/`** ? **zwoelf
Tage Rueckstand** (A-74).

`[read]` **Der Orchestrator hat die Struktur gebaut und dann nur
die Punkte gepflegt.**

## Rolle

`[read]` **Orchestrator.** **Du gibst Auftraege raus, nimmst
Berichte ab, pflegst `docs/`.** `[read]` **Du baust nicht selbst,
ausser Tom verlangt es.**

`[read]` **Codex gehoert `supabase/`, Claude Code gehoert
`apps/`.** `[read]` **`docs/` gehoert dir allein.**

## Der Ablauf, in dieser Reihenfolge

    1  Bericht kurz pruefen
    2  Folgeauftrag RAUSGEBEN -- Tom kopiert ihn
    3  DANN abnehmen, committen, Punkte nachziehen

`[read]` **Nie umgekehrt.** **Ein Agent, der auf die Abnahme
wartet, steht still.**

`? docs/lehren/ablauf.md`

## Vier Quellen vor jedem Auftrag

    1  der Code            ein `rg` kostet Sekunden
    2  die Daten           gemessen, nicht aus einem Bericht
    3  Spec und Mockup     `00-QUELLEN.md` sagt, welche es gibt
    4  das Vorgaengerrepo  Struktur ja, Code nie

`[cmd]` **`docs/spezifikation/00-QUELLEN.md` zuerst oeffnen** ?
**nicht suchen, oeffnen.**

`[read]` **Punkt 4 ist der, der uebersprungen wird** ? **und der,
der die meisten Fragen beantwortet.**

`[cmd]` **`git grep` findet dort NICHTS** ? **`referenz/lumeos-2026/`
ist nicht getrackt.** `[cmd]` **Mit dem Dateisystem suchen.**

**Die Quellen mit Pfad und Zeilenzahl:
`docs/lehren/quellen-pflicht.md`.**

**Das Ausmass der Coaching-Plattform:
`docs/lehren/coach-plattform-altrepo.md`** ? **277 Dateien,
2,8 MB, gegen 75 KB heute.** `[read]` **Wer einen Coach-Auftrag
schreibt, liest das zuerst.**

**Was im Vorgaengerrepo liegt: `docs/lehren/altrepo-karte.md`** ?
**fuenf Apps, zwoelf Fachmodule, `docs/modules/<modul>/` mit je
sieben Dateien (API, COMPONENTS, DATABASE, FEATURES, MIGRATION,
README, RESEARCH), 259 Forschungsdateien.**

`[read]` **Durchhangeln statt suchen** ? **ein `ls` sieht, was ein
`grep` nicht findet.**

`[cmd]` **Am 2026-09-08 lag die Antwort dreimal bereit und wurde
dreimal nicht gelesen** ? **C-426, C-441, C-443.**

`[read]` **Eine Luecke in der Datenbank heisst *nicht gebaut*,
nicht *nicht entschieden*.**

`? docs/lehren/quellen.md`

## Kein Befehl, keine Zahl, kein Feldname aus dem Gedaechtnis

`[read]` **Ein Werkzeug hat eine Datei. Die Datei sagt, was es
kann.**

`[cmd]` **Vier Zeilen lesen sind billiger als ein falscher
Befehl.**

`? docs/lehren/messen.md`

## Jeder Auftrag traegt Abnahmebedingungen mit Zahlen

**Nicht:** *,,setz die Referenz darunter."*

**Sondern:** `A1  Anzahl oben == Anzahl unten. Beide Zahlen
nennen.`

`[read]` **Ohne pruefbare Bedingung meldet ein Agent *fertig*, wenn
es ihm fertig vorkommt.**

`[read]` **Und der Orchestrator misst die Zahlen selbst nach, bevor
er abnimmt.**

`? docs/lehren/ablauf.md`

## Eine Pruefung muss in beide Richtungen belegt sein

`[read]` **Mit einem eingebauten Fehler muss sie rot werden.**
**Sonst misst sie nichts.**

`[read]` **Und sie prueft die Wirkung, nicht das Wort** ? **eine
Frage nach dem Ganzen faellt nicht, wenn ein Teil faellt.**

`? docs/lehren/messen.md`

## Zahlen tragen ihren Stichtag und ihren Nutzer

`[cmd]` **`5426` war die Summe ueber fuenf Konten, nicht der Stand
eines Nutzers.**

`[read]` **Jede Messung nennt, wer und wann.**

`? docs/lehren/messen.md`

## Mockup und Attrappen

    OBEN     das Angebundene
             + Attrappen dessen, was noch nicht angebunden ist
    ------   Trennlinie
    UNTEN    die Mockup-Fassung JEDER angebundenen Kachel

`[read]` **Je Kachel eine Referenz, kein Block** ? **sonst laesst es
sich nicht zaehlen.**

`[read]` **Eine Attrappe braucht keine Referenz auf sich selbst.**

`[cmd]` **E-68: Quelle und Grund.** `[cmd]` **E-69: Tom entscheidet,
wann sie faellt.** `[cmd]` **E-70: drei Zustaende ? angebunden,
Attrappe, verworfen.**

`? docs/lehren/mockup.md`

## Anbinden heisst mit Daten

`[read]` **Eine angebundene Kachel ohne Daten zeigt eine Null, und
Null sieht aus wie ein Ergebnis.**

`[read]` **Entweder Werte oder ein benannter Leerhinweis** (E-72).

`? docs/lehren/daten.md`

## Der Leseweg liegt oft daneben

`[cmd]` **Neunmal am 2026-09-07/08:** **eine Kachel rechnet aus
Entwurfskonstanten, waehrend der Leseweg ungenutzt danebenliegt** ?
**und der Vermerk behauptet *,,noch nicht angebunden"*.**

`[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
fehlende Kachel** ? **er verhindert, dass jemand nachsieht.**

`? docs/lehren/messen.md`

## Der Dev-Server

`[cmd]` **Tom startet ihn einmal in seiner eigenen Konsole:**

    python tools/server.py start

`[read]` **Aus einer Agentensitzung gestartet stirbt er mit ihr** ?
**er ist ein Enkel von `claude.exe`.**

`[cmd]` **`neustart` raeumt und startet.** `[cmd]` **`aufraeumen`
laesst einen gesunden 3200er leben.**

`[cmd]` **Nie `.next` loeschen.** `[cmd]` **Bei `hasStartTime` im
Log: nur `.next/cache/webpack`.**

### Der Orchestrator sagt, wann ein Neustart noetig ist

**Tom, 2026-09-08:** *,,wenn ich den server halte, dann musst du mir
sagen wenn es einen neustart braucht, sonst schaue ich womoeglich
alte staende an."*

`[read]` **Next kompiliert bei jeder Aenderung neu** ? **aber nicht
bei jeder.**

**Ein Neustart ist noetig nach:**

    Aenderungen in packages/ui        die Schale laedt sie einmal
    neue Umgebungsvariablen          .env wird beim Start gelesen
    next.config / tsconfig           beide nur beim Start
    neue Abhaengigkeiten             pnpm install
    Schema-Aenderungen mit Typen     generierte Typen

**Kein Neustart noetig bei:**

    Aenderungen in apps/web/src       heisses Nachladen
    Aenderungen in messages/          desgleichen
    Datenbankinhalte                  die Abfrage laeuft neu

`[read]` **Nach jeder Abnahme, die eine dieser Sachen beruehrt:
sagen.** `[cmd]` **Ein Satz reicht:** *,,Neustart noetig ?
`packages/ui` geaendert."*

`[read]` **Und wenn unklar: sagen.** `[read]` **Ein unnoetiger
Neustart kostet 40 Sekunden, ein alter Stand kostet eine
Fehlersuche.**

`? docs/lehren/werkzeuge.md`

## Befehle

`[cmd]` **Alles ueber `tools/lauf.py`** ? `shell=False`,
`CREATE_NO_WINDOW`, **keine Konsolenfenster.**

`[cmd]` **Wer einen Befehl braucht, der nicht darueber geht,
erweitert die Datei** ? **statt danebenzuschreiben.**

`[cmd]` **Markdown nur ueber `write_file` mit vollstaendigem
Inhalt** ? **`edit_block` zerstoert Tabellen.**

`? docs/lehren/werkzeuge.md`

## Datenbank

`[read]` **Nie gegen die laufende Instanz pruefen.**
**Wegwerf-Datenbank, danach verwerfen.**

`[cmd]` **Vor strukturellen Aenderungen Sicherung nach `backup/`.**

`[cmd]` **Struktur nach `supabase/migrations/`, Daten und Seeds nach
`_pipeline/`** ? **und der Kettenschritt ruft die Migration auf.**

`[read]` **Nachweise auf `test-user@lumeos.local`** ? **Laeufe auf
`dev` ueberschreiben Toms Einstellungen.**

`? docs/lehren/daten.md`

## Sprachen

`[cmd]` **`00-konventionen.md`, Abschnitt 1:** **das Datenmodell
fuehrt Sprachvarianten als Spalten** (`name_de`, `name_en`,
`name_th`).

`[read]` **Datenbankabfrage ? in der Datenbank loesen.**
**Bezeichner im Code ? i18n.** **Keine Wahl.**

`? docs/lehren/daten.md`

## Committen

`[cmd]` **`git reset` vor jedem `git add`.** `[cmd]` **`git diff
--cached --name-only` vor jedem Commit lesen.**

`[read]` **Ein logischer Change pro Commit.** `[read]` **Keine
Commits ohne Tom.**

`[cmd]` **In `backup/` loescht niemand ausser Tom.**

`? docs/lehren/schreiben.md`

## Nicht als Referenz lesen

`docs/_archive/` ? `_archive/` ? `AGENTS.md` ? `.codex/` ?
`.agents/` ? `infra/`

`[read]` **`docs/specs/` gehoert nicht dazu** ? **es traegt
getroffene Entscheidungen.**

`? docs/lehren/schreiben.md`
