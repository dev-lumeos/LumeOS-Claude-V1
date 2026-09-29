# Punkte — wie sie gefuehrt werden

> **Wenn du nur eine Sache hier liest, lies diese drei Abschnitte:**
>
> | | |
> |---|---|
> | **Der Weg eines Punktes** | wie ein Auftrag rausgeht: Auftragsteil in DIESELBE Datei, verschieben BEIM Beauftragen, die Anweisung traegt den PFAD |
> | **Der Orchestrator zaehlt nicht** | keine Zahlen vom Orchestrator — im Auftrag NICHT und in der Abnahme NICHT |
> | **Der Zyklus laeuft ohne Aufforderung** | sieben Schritte, vier Stufen, `next/` — fertig ist, wenn Schritt 7 steht |
>
> `[cmd]` **Alle drei standen vollstaendig hier, als sie am 2026-09-29
> gebrochen wurden** — zwei davon seit Ende August. **Der Grund war nicht
> Unkenntnis, sondern dass diese Datei nur gelesen wird, wenn jemand
> darauf zeigt** (A-81).
>
> `[cmd]` **Deshalb haengt der Zyklus jetzt nicht mehr an Aufmerksamkeit:**
> `tools/zyklus-pruefen.mjs` erzwingt ihn im Gate, Sollstand 0. Er prueft,
> dass ein laufender Punkt seinen Auftragsteil und seinen Agenten traegt,
> dass ein vorbereiteter den Auftrag hat und den Agenten noch NICHT, und
> dass ein zurueckgelegter Punkt keine Zuteilung mehr behauptet.

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

    quellen:              # Pflicht ab 2026-09-28 (A-75)
      - docs/specs/Supplements/SPEC_01_MODULE_CONTRACT.md:44
      - apps/web/src/lib/supplements/substanz-read.ts

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

### Warum `quellen:` Pflicht ist

Tom, 2026-09-27: *,,ich habe schon tausendmal gesagt es gibt keinen
auftrag der nicht gegen die quellen gecheckt ist, egal was wir fuer
workflows einbauen das klappt einfach nicht."*

`[read]` **Jede bisherige Korrektur war eine Regel.** Ein Agent liest
den Satz und macht danach, was er ohnehin vorhatte. Was in diesem
Repo haelt, sind die Sachen, die rot werden.

`[cmd]` **Der Waechter faellt bei vier Faellen:**

1. der Block fehlt an einem Punkt mit `angelegt: 2026-09-28` oder
   spaeter,
2. der Block ist leer,
3. eine genannte Datei gibt es nicht,
4. ein genannter Pfad steht auf der Liste in `CLAUDE.md:391`
   (`docs/_archive/`, `_archive/`, `AGENTS.md`, `.codex/`,
   `.agents/`, `infra/`).

`[read]` **Ein Stichtag, kein Sollstand.** Die 823 Punkte von vorher
sind frei — sonst waere der Waechter ab Tag eins rot und wuerde
umgangen. **Ein vorhandener Block wird immer geprueft**, auch an
einem alten Punkt.

`[read]` **Die Zeilenangabe ist erlaubt und erwuenscht**
(`PHASE_MODELS.md:28`), aber nicht verlangt. Ein Glob wird
uebersprungen, wie bei `beruehrt.dateien` — eine Menge ist keine
Behauptung ueber eine Datei.

`[read]` **Die ehrliche Grenze:** der Waechter faengt keinen
Agenten, der eine Datei NENNT, ohne sie gelesen zu haben. Das kann
nichts faengen. Er macht aus ,,still uebersprungen" ein ,,muss etwas
nennen" — und eine falsche Angabe faellt bei der Abnahme auf, wo
eine fehlende unsichtbar war.

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

`[cmd]` **Und am 2026-09-29 sechs weitere, alle beim Nachpruefen eines
Agentenberichts:**

    vier Fehlmessungen         PowerShell-Quoting zerlegte das Muster
    fuenf fehlende Objekte     das Muster fing alias.spalte (bm.user_id)
    "faellt nicht am CHECK"    der Aufruf brach vorher mit
                               "Anmeldung erforderlich" ab - als postgres
                               ist auth.uid() NULL
    "Testdatei laeuft nicht"   gesucht wurde nach "g519" in deutschen
                               Testnamen
    tdee_smoothed              eine geratene Spalte; sie heisst
                               adaptive_tdee_kcal
    zehn neue Befunde          sechs gebaute, aber nicht eingespielte
                               Tabellen in beruehrt.tabellen eingetragen

`[read]` **Jedes Mal war die Messung des Agenten richtig und meine
kaputt.** `[read]` **Und jedes Mal war die Frage schon beantwortet** —
ich habe seine Messung nachgebaut, in seiner Domaene, mit Werkzeug, das
ich schlechter beherrsche.

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

### Und dasselbe gilt fuer die Abnahme

`[cmd]` **Ergaenzt am 2026-09-29, nach Toms Hinweis:** *,,du bist
orchestrator und nicht coder ... der agent weiss schon wie man sauber
messen muss im gegensatz zu dir"*.

`[read]` **Die Regel oben galt bisher nur fuer den Auftrag.** Sie gilt
genauso fuer die Pruefung des Berichts — **es ist derselbe Fehler an
einem anderen Ende.**

`[read]` **Die Abnahme zaehlt MERKMALE des Ergebnisses, sie baut keine
Messung nach:**

    geht      existiert das Objekt? steht die Spalte? ist der
              Waechter gruen? stimmt die Testzahl? wurde nur der
              eigene Bereich angefasst? ist aufgeraeumt?
    geht      eine reine Funktion gegen die eigene Rechnung halten
              (goals.kcal_delta_aus_zielrate: vier von vier)
    geht      eine Ableitung aus zwei gemessenen Tatsachen, als
              solche gekennzeichnet
    nicht     den Aufruf des Agenten wiederholen
    nicht     seine Ausgabe nach Stichwoertern durchsuchen
    nicht     eine Zahl nachrechnen, die eine Sitzung oder einen
              Schreibvorgang braucht

`[read]` **Was sich nur mit angemeldeter Sitzung oder durch Schreiben in
die Datenbank nachmessen liesse, bleibt SEIN `[cmd]`** — im Bericht
zitiert, als seines gekennzeichnet, nicht als meines. **Eine
unbestaetigte Zahl wird benannt, nicht mit einer schlechten Probe
uebermalt.**

`[read]` **Der Grund ist nicht Bescheidenheit, sondern Messbarkeit:**
eine Probe, die am falschen Ort abbricht, sieht aus wie ein Ergebnis.
**Elf Fehlzaehlungen am 27.08. und sechs am 29.09. haben denselben Bau.**

### Der Kopf eines Auftrags

`[cmd]` **Tom, 2026-09-28:** *,,in den header eines auftrages
gehoert fuer wen er ist."* Am selben Tag gingen zwei Auftraege
nebeneinander raus, keiner nannte seinen Agenten — der Leser musste
aus dem Inhalt schliessen, wem welcher gehoert.

**Der Kopf traegt vier Angaben, in dieser Reihenfolge:**

    AUFTRAG FUER <agent> - <Nummern>: <Sache in einem Halbsatz>
    Bereich: <Pfade, die er anfasst>
    Fremd:   <Pfade, die ihm NICHT gehoeren, und wer dort arbeitet>
    Stand:   <Datum>

`[read]` **Die dritte Zeile ist die, die Kollisionen verhindert.**
Ein Agent, der weiss, wo er nicht hingehoert, fragt nicht nach und
faesst auch nichts an. Zwei Agenten in `apps/web` teilen sich die
Browsersitzung — das gehoert in dieselbe Zeile.

`[read]` **Der Kopf steht im Auftrag, nicht in der Begleitnachricht.**
Der Auftrag wird kopiert; was danebensteht, geht verloren.
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

## Ein Punkt traegt eine Frage

**Ergaenzt 2026-08-29.**

`[read]` **Ein `typ: entscheidung` mit mehreren Fragen im Text ist
kein Punkt, sondern mehrere.** `[read]` **Das Aufteilen gehoert vor
die Vorlage.**

`[cmd]` **Warum:** G-254 fuehrte sechs Kacheln. Der Orchestrator legte
Tom eine davon vor und schrieb dessen Antwort auf den ganzen Punkt.
**Fuenf Entscheidungen waeren getroffen worden, ohne dass Tom sie
gesehen hat.**

`[read]` **Und beim Vorlegen wird zitiert, nicht referiert.** Die
Datei ist die Wahrheit — **nicht die Zusammenfassung im Kontext des
Orchestrators.**

## Der Ordner ist die Wahrheit ueber den Zustand

**Ergaenzt 2026-08-30.**

`[read]` **Eine Datei in `laufend_*` heisst: der Agent arbeitet
daran.** **Liegt dort etwas, das fertig gemeldet ist, luegt der
Ordner.**

**Tom, 2026-08-30:** *,,abarbeiten, ergaenzen, in erledigt ablegen"*.

`[cmd]` **Kommt ein Bericht, wird der Punkt geschlossen — vor dem
naechsten Auftrag.** `[cmd]` **Am 30.08. lagen zwei fertige Punkte in
`laufend_codex/`, waehrend der Orchestrator neue Auftraege schrieb.**

`[read]` **Das ist derselbe Zustand, den `LAUFEND.md` am 23.08.
erzeugt hat** — drei erledigte Punkte als laufend gefuehrt.
**Die Tabelle wurde deshalb abgeschafft. Der Ordner darf nicht
denselben Weg gehen.**

## Vorbereitete Auftraege: `laufend_<agent>/next/`

**Ergaenzt 2026-08-30, auf Toms Vorschlag.**

*,,mach unter zb laufend_codex einen neuen ordner zb next run da
kannst die vorbereiteten auftraege die in der verfuegbaren zeit wenn
agents laufen erstellen kannst. dann kommt der bericht und wenn es
anpassungen braucht kannst das noch tun und sonst einfach
rueberschieben zur ausfuehrung"*.

**Damit hat das Modell vier Stufen:**

    todos/                    offen, kein Auftrag geschrieben
    laufend_<agent>/next/     Auftrag geschrieben, noch nicht raus
    laufend_<agent>/          laeuft
    erledigt/                 abgenommen

`[read]` **Der Sinn:** waehrend ein Agent arbeitet, hat der
Orchestrator Zeit. **Die gehoert in den naechsten Auftrag, nicht in
einen zweiten Auftrag an denselben Agenten.**

`[read]` **Und wenn der Bericht kommt, laesst sich der vorbereitete
Auftrag noch anpassen** — **oft aendert ein Bericht die Praemisse des
naechsten.**

### Was der Waechter dazu tut

`[cmd]` **`punkte-pruefen.mjs` zaehlt sie und meldet sie getrennt:**
*,,N vorbereitet, noch nicht raus"*. `[read]` **Sie zaehlen nicht als
laufend** — ein Auftrag laeuft erst, wenn er eine Ebene hoeher liegt.

`[cmd]` **Und jeder andere Unterordner unter `laufend_*` macht das
Gate rot.** `[read]` **Sonst waere `next/` ein Ort, an dem Punkte
liegen, die keine Zaehlung erreicht** — genau das, was am 30.08.
beim Nachmessen aufgefallen ist.

`[read]` **Ein vorbereiteter Auftrag traegt `agent:` und
`beauftragt:` noch nicht** — er bekommt sie beim Verschieben.

## Der Zyklus laeuft ohne Aufforderung

**Tom, 2026-08-30:** *,,du spielst nun jedesmal den vollen cycle
durch ohne mein befehl, sprich du bist fertig wenn berichte
kurzcheck, neue auftraege raus, berichte check und abarbeiten, neue
next drin sind"*.

    1  Bericht ueberfliegen - ist der vorbereitete Auftrag betroffen?
    2  falls ja: anpassen
    3  next/ eine Ebene hoeher - der Auftrag geht raus
    4  Bericht pruefen, Abnahme in DIESELBE Datei schreiben
    5  neue Befunde als Punkte
    6  committen, Commit-Hash nachtragen, DANN nach erledigt/
    7  next/ wieder fuellen

`[cmd]` **Berichtigt am 2026-09-29, gemessen.** Frueher stand ,,nach
`erledigt/`" in Schritt 4 und der Commit-Hash in Schritt 6. **In dieser
Reihenfolge geht es nicht:** ein Punkt in `erledigt/` ohne `commit:` macht
`punkte-pruefen.mjs` rot (26 statt 25, selbst gemessen an G-519) — und
weil der Waechter im Gate steht, blockiert das rote Gate genau den
Commit, der den Hash liefern soll. **Ein Zirkel.**

`[read]` **Der Waechter hat recht:** `erledigt/` behauptet belegt UND
gelandet. Ein Punkt dort ohne Hash behauptet mehr, als er hat. **Die
Abnahme entsteht in Schritt 4, der Umzug gehoert hinter den Commit.**

**Fertig ist, wenn Schritt 7 steht.**

`[read]` **Kein Schritt braucht eine Aufforderung.** `[read]` **Und
keiner darf uebersprungen werden, weil gerade etwas anderes
dringender scheint** — **am 30.08. lagen zwei fertige Punkte in
`laufend_codex/`, waehrend neue Auftraege geschrieben wurden.**
