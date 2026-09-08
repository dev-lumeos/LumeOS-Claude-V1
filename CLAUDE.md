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
