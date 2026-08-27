---
nr: A-53
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  dateien:
    - docs/punkte/00-LIESMICH.md
    - tools/nummern-pruefen.mjs
    - package.json
zahlen:
  gemessen: 2026-08-27
  offene_punkte: 244
  reihen: 8
agent: claudecode
beauftragt: 2026-08-27
erledigt: 2026-08-27
commit: e272343b
---

# A-53 — Index und Waechter fuer die Punktverwaltung

## Befund

`[cmd]` **Das Modell steht in `docs/punkte/00-LIESMICH.md`** und ist
committet (`d2bf623`). **Codex ueberfuehrt gerade die 244 offenen
Punkte** nach `docs/punkte/todos/` (A-52).

`[read]` **Was fehlt, ist der Teil, der die Ablage zu einer Pruefung
macht.** Ohne ihn ist das neue Modell nur besser sortiert.

`[cmd]` **`tools/nummern-pruefen.mjs` prueft heute `TODO.md` gegen
`ERLEDIGT.md`, `LAUFEND.md` und `docs/auftraege/`** — **also die
Buchhaltung gegen sich selbst, nie gegen das Repo.**

`[cmd]` **Was dadurch am 27.08. durchgekommen ist:**

    G-186 nannte `wissen.entity_transporters`
          -> die Tabellen liegen in `supplements.`
    G-170 nannte `medical.medications`
          -> gibt es nicht
    G-176 sprach von 290 Substanzen
          -> es sind 412
    G-138 verglich Vorlagennamen mit Codenamen
          -> `LogDoseModal` heisst hier `LogDoseFenster`

`[read]` **Vier Auftraege auf toten Praemissen, in einem Tag.**

## Auftrag

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **Meine Zaehlungen lagen heute siebenmal
daneben, jedes Mal beim Abgrenzen einer Kategorie.**

### Du musst nicht auf Codex warten

`[read]` **Das Modell ist festgeschrieben — entwickle gegen die
Vorgabe, nicht gegen den Bestand.** Ein paar selbstgebaute
Beispieldateien reichen zum Testen.

`[read]` **Und wenn Codex' Ergebnis spaeter abweicht, ist die
Abweichung selbst der Befund:** entweder haelt sich die Migration
nicht ans Modell, oder das Modell taugt nicht. **Beides gehoert
gemeldet, nicht angepasst.**

### Was der Waechter prueft

    beruehrt.tabellen   gegen `information_schema`
    beruehrt.dateien    gegen das Dateisystem
    zahlen ohne         rot
      gemessen:
    nr                  genau einmal ueber ALLE Ordner
    braucht             zeigt auf eine Nummer, die es gibt
    kind_von / kinder   beide Richtungen stimmen ueberein
    Dateiname           passt zu `nr` und `modul` im Frontmatter
    erledigt/           Pflicht: erledigt, commit, beruehrt

`[read]` **Die letzte Zeile ist eine bewusste Entscheidung:**
`beruehrt` ist in `todos/` **optional**, in `erledigt/` **Pflicht**.
**Die Beweislast liegt bei dem, der am Code war** — beim Anlegen
waere sie geraten.

`[read]` **Und `nr` genau einmal ueber alle Ordner** ist der Ersatz
fuer die drei Meldungen *,,steht offen UND erledigt"*, die der alte
Waechter heute ausgegeben hat. **Im neuen Modell kann das nicht
entstehen — der Waechter belegt, dass es nicht entsteht.**

### Was der Index enthaelt

**Eine Zeile je Punkt, erzeugt aus dem Frontmatter:** Nummer, Modul,
Typ, Schwere, Titel, Zustand (aus dem Ordner), Blocker.

`[read]` **Gruppiert nach Modul** — das ist die Sicht, in der
gearbeitet wird. **Blockierte Punkte sichtbar von unblockierten
getrennt**, damit man sieht, was ueberhaupt beauftragbar ist.

`[read]` **Nie von Hand pflegen.** Ein handgefuehrter Index driftet —
so wie meine Zahlen gedriftet sind.

### In `pnpm gate` aufnehmen

`[read]` **Ein Waechter, der nicht laeuft, ist ein Kommentar.**
`[cmd]` Das war C-291: `migration-datenlogik-pruefen.mjs` war gebaut
und stand in keinem Gate.

`[cmd]` **Der alte `nummern-pruefen.mjs` bleibt vorerst stehen** —
`TODO.md` und `ERLEDIGT.md` sind die Sicherung, aus der neu erzeugt
wird. **Zwei Waechter nebeneinander, bis der neue traegt.**

### Was nicht zu tun ist

**Keine Punktdatei aendern.** `[read]` `docs/punkte/` gehoert dem
Orchestrator und Codex. **Der Waechter urteilt, er repariert nicht.**
**`nummern-pruefen.mjs` nicht anfassen und nicht ersetzen.**
**`TODO.md` und `ERLEDIGT.md` nicht anfassen.**
`apps/` und `supabase/` nicht anfassen. Nicht committen, nicht
stagen, nicht pushen.

### Nachweis — in beide Richtungen

    Normalzustand                gruen
    Tabelle erfunden             rot, Name genannt
    Datei erfunden               rot, Pfad genannt
    zahlen ohne gemessen         rot
    Nummer zweimal               rot, beide Pfade genannt
    braucht auf Unbekanntes      rot
    kind_von ohne Gegenstueck    rot
    Dateiname passt nicht zu nr  rot
    erledigt/ ohne commit        rot
    Index gegen todos/           Zahl stimmt ueberein

`[read]` **Jede Sabotage einzeln, jede muss genau eine Meldung
ausloesen.** `[read]` **Und der Rueckbau byteidentisch geprueft** —
so wie du es in G-207 und G-210 gemacht hast.

`[cmd]` **`beruehrt.tabellen` braucht die Datenbank.** Lesend gegen
live ist in Ordnung; **wenn du dafuer eine Wegwerf-Datenbank
brauchst, sag es, statt gegen die laufende zu schreiben.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205) — fuer
diesen Auftrag brauchst du ihn vermutlich nicht.
**Markdown nur per `write_file` mit vollstaendigem Inhalt.**
`[read]` **Repo-Text mit Sonderzeichen nicht ueber die
Standardeingabe einer interaktiven Python-Sitzung schreiben** — das
hat mir heute fuenf Doppelkodierungen und einen roten Gate-Lauf
eingebracht.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Nachtrag vom Orchestrator, 2026-08-27

**Setz den Sollstand nicht auf 202.**

`[cmd]` **Codex arbeitet an A-54 und behebt einen Teil der 202
Befunde** - falsche Pfade, falsche Schemata, fehlende Datumsangaben.
**Die Zahl aendert sich unter dir weg.**

`[read]` **Bau den Waechter fertig, mit der Sollstandzahl an einer
benannten Stelle**, und lass sie auf dem Wert, den du beim
Fertigstellen misst. **Ich ziehe sie nach, sobald Codex' Bericht da
ist - er nennt die Zahl darin.**

**Der Rest bleibt wie besprochen:** Sollstand-Muster wie C-313b,
scharf im Gate, mehr ist rot und weniger auch.

## Bericht

**Claude Code, 2026-08-27.**

**Gebaut: drei Dateien in `tools/`, beide scharf im Gate. Der
Waechter meldet 226 Befunde gegen Codex' Migration — darunter die
zwei Faelle, an denen der Auftrag haengt.**

### Die Zahlen des Auftrags

| | Auftrag | Gemessen |
|---|---|---|
| offene Punkte | 244 | **244** in `todos/` |
| Reihen | 8 | **7** — A, B, C, E, F, G, GO |

`[cmd]` **Die 244 stimmen genau.** `[cmd]` **Die Reihen sind 7, nicht
8** — gezaehlt ueber `TODO.md` und gegengeprueft an den 247
Punktdateien: `A 34 · B 4 · C 130 · E 6 · F 9 · G 61 · GO 2`.

`[read]` **`ERLEDIGT.md` scheint mehr zu fuehren** — `AK`, `BPC`,
`D`, `UTF`. `[cmd]` **Das sind Fehltreffer aus Fliesstext:** `AK-5`
und `AK-6` sind Sicherheitsbefunde in einem Absatz, keine Punkte.
**Der Waechter leitet die Reihen deshalb aus den Punktdateien ab,
nicht aus einer festen Liste.**

### Was gebaut ist

    tools/punkte-lesen.mjs     Frontmatter-Leser (gemeinsam)
    tools/punkte-pruefen.mjs   der Waechter, Sollstand 226
    tools/punkte-index.mjs     der Index, --schreiben / --pruefen
    docs/punkte/00-INDEX.md    erzeugt, 247 Punkte
    package.json               beide in `pnpm gate`

`[read]` **Ein gemeinsamer Leser, nicht zwei.** Zwei Leser waeren
zwei Auffassungen davon, was ein Punkt ist — und die erste Abweichung
faende niemand, weil beide fuer sich gruen blieben.

`[cmd]` **Kein YAML-Paket.** Das Repo fuehrt keines; eine neue
Abhaengigkeit fuer einen Waechter braeuchte einen eigenen Task
(Hausregel). Der Frontmatter des Modells ist flach genug fuer 80
Zeilen — **aber der Leser meldet, was er nicht versteht, statt es zu
verschlucken.** `[cmd]` Gegen alle 247 Dateien: **0 Lesefehler.**

### Der Waechter prueft, was der alte nicht prueft

`[cmd]` **Alle acht Vorgaben gebaut und einzeln belegt.** Je Sabotage
**genau eine Meldung**, Bestand danach byteidentisch (SHA-256 ueber
den ganzen Baum):

    Normalzustand                gruen (0 Befunde)
    Tabelle erfunden             1  wissen.entity_transporters — gibt es
                                    nicht (aber: supplements.entity_transporters)
    Datei erfunden               1  gibtesnicht.ts — gibt es nicht
    zahlen ohne gemessen         1  zahlen: ohne gemessen: — zeilen
    Nummer zweimal               1  Nummer C-900 liegt 2-mal
    braucht auf Unbekanntes      1  braucht: C-999 — gibt es nicht
    Dateiname passt nicht        1  erwartet Beginn `quer-c-0901-`
    erledigt/ ohne commit        1  Pflichtfeld fehlt — commit
    erledigt/ ohne beruehrt      1  beruehrt ist leer — Pflicht in erledigt/

`[read]` **Die erste Zeile ist der Beleg, dass er den Auftrag
erfuellt:** die Sabotage *„Tabelle erfunden"* ist woertlich der
G-186-Fall — und der Waechter nennt **nicht nur den Fehler, sondern
den richtigen Ort.**

**Eine Ausnahme, bewusst:** `kind_von` umbiegen erzeugt **zwei**
Meldungen — einmal beim Elternteil (*„mein Kind kennt mich nicht"*),
einmal beim Kind (*„mein Elternteil fuehrt mich nicht"*). `[read]`
**Das sind zwei Befunde, nicht eine Doppelmeldung:** beide Dateien
sind falsch, beide muessen angefasst werden. **Wer nur eine meldet,
versteckt die Haelfte der Arbeit.**

### Der Sollstand — nach C-313b

`[cmd]` **Scharf im Gate, Sollstand `55` in `tools/punkte-pruefen.mjs`.**
**Mehr ist rot, weniger ist rot** mit dem Hinweis, wo nachzuziehen
ist:

     56 Befunde  ->  ROT: 1 neu hinzugekommen
     55 Befunde  ->  gruen: kein neuer Schaden
     54 Befunde  ->  ROT: 1 behoben — Sollstand nachziehen

`[cmd]` **Beide Richtungen am echten Bestand belegt**, Rueckbau
byteidentisch.

`[read]` **Die Zahl steht an einer benannten Stelle** —
`const SOLLSTAND` mit Begruendung daneben, nicht als Aufrufparameter
in `package.json`. **Ein Sollstand ist eine Messung, kein Schalter.**

#### Sie ist waehrend des Auftrags zweimal gewandert

    225   erste Messung nach der Altbestands-Ausnahme
    226   Codex legt A-54 an — kind_von: A-52, aber A-52 fuehrt
          ihn nicht in kinder
     55   Codex behebt in A-54 die Pfade und Schemata — 171 weg

`[read]` **Beide Bewegungen sind der Beleg, dass die Ratsche
funktioniert.** `[cmd]` **Nach oben:** ein frisch angelegter Punkt
mit einem Verdrahtungsfehler wurde binnen Minuten gefangen.
`[cmd]` **Nach unten:** als Codex 171 Befunde behob, wurde das Gate
rot mit *„171 behoben — Sollstand nachziehen"*, statt die Verbesserung
stillschweigend zu schlucken.

`[read]` **Ich habe die Zahl auf den Endstand gesetzt**, dreimal
hintereinander gleich gemessen. **Weicht Codex' Bericht ab, gilt
seine** — die Stelle ist benannt und traegt das Datum.

### Die 55 Befunde, nach Art

**Das ist die Aufschluesselung fuer die Punkte — Endstand:**

| Art | Zahl | Was dahinter steckt |
|---|---|---|
| `kind_von` | **54** | Elternnummer ist kein Punkt |
| `kinder` | **1** | beide Richtungen widersprechen sich |

**Und so sah es vor Codex' Behebung aus (der Stand, aus dem Punkte
zu machen waren):**

| Art | Zahl | Was dahinter steckt |
|---|---|---|
| `beruehrt.dateien` | **125** | Pfad zeigt ins Leere |
| `kind_von` | **54** | Elternnummer ist kein Punkt |
| `Pflichtfeld fehlt` | **23** | `angelegt:` ist `null` |
| `beruehrt.tabellen` | **23** | Tabelle gibt es nicht |
| `kinder` | **1** | beide Richtungen widersprechen sich |

`[read]` **Die drei erledigten Arten sind unten trotzdem
aufgeschluesselt** — sie waren der Auftrag, und die Aufteilung zeigt,
was Codex behoben hat und was nicht.

`[read]` **Die Aufschluesselung steht bei JEDEM Lauf im Kopf** — auch
im gruenen. Ein Sollstand ohne sie ist eine Zahl, aus der niemand
Punkte machen kann.

#### Die 23 Tabellen — 18 verschiedene

`[cmd]` **Beide historischen Faelle sind dabei:**

    wissen.entity_transporters   -> supplements.entity_transporters   (G-186)
    medical.medications          -> gibt es nicht                     (G-170)
    training.sessions            -> gibt es nicht (aber: auth.sessions)
    supplements.substance_catalog

`[cmd]` **Fuenf sind gar keine Tabellen, sondern Dateiendungen im
falschen Feld:** `medical.jsx`, `nutrition.jsx`, `supplements.jsx`,
`supplements.jsonl`, `nutrition.mealcam_`.

`[cmd]` **Zwei sind Funktionen, keine Tabellen:** `public.is_admin`,
`recovery.acwr_for_day`.

`[cmd]` **Der Rest sind Namen, die es nie gab oder nicht mehr gibt:**
`nutrition.diary`, `nutrition.water`, `nutrition.micronutrient`,
`nutrition.micronutrient_snapshot`, `training.high_impact`,
`training.load_spike`, `recovery.training_load_score`.

#### Die 125 Dateien — 105 verschiedene

`[cmd]` **113 sind blosse Dateinamen ohne Pfad** — `buddy.ts`,
`A.json`, `DiaryView.js`, `024_suchsynonyme.sql`. `[read]` **Sie sind
nicht falsch, sie sind unvollstaendig:** die Datei existiert
vermutlich, nur nicht an der Wurzel.

`[cmd]` **12 tragen einen Pfad, der trotzdem ins Leere zeigt** —
`lib/tab-url.ts`, `foods/page.tsx`, `tools/testdaten-pruefen.ts`,
`evidence/symptom_ontology_seed.json` und sieben weitere. `[read]`
**Auch das sind gekuerzte Pfade** (`lib/tab-url.ts` liegt unter
`apps/web/src/`), keine verschwundenen Dateien.

`[read]` **Daraus wird ein Punkt, nicht 125:** *„`beruehrt.dateien`
traegt Dateinamen statt Repo-Pfaden"*.

#### Die 54 `kind_von`

`[cmd]` **72 Verweise loesen sich nur ueber `ERLEDIGT.md` auf** — sie
sind ausgenommen (siehe unten). **Von den uebrigen 54 zeigen 15 auf
Auftragsnummern statt auf Punkte:** `G-90`, `G-135`, `C-128` und
zwoelf weitere kommen in `TODO.md` und `ERLEDIGT.md` **nur als
Fliesstext** vor — es sind Agentenauftraege wie dieser hier, keine
Punkte. `[read]` **`kind_von: G-90` ist damit eine Aussage ueber
etwas, das die Punktverwaltung nicht kennt.**

#### Die 23 ohne `angelegt`

`[cmd]` **Codex' Migrationsergebnis, nicht sein Fehler** — die Punkte
trugen im alten `TODO.md` kein Datum. **Sie zaehlten mit**, wie
besprochen — **und sind mit A-54 behoben.**

#### Was Codex behoben hat und was blieb

`[cmd]` **Behoben (171):** alle 125 Dateipfade, alle 23 Tabellen,
alle 23 fehlenden Datumsangaben.

`[cmd]` **Geblieben (55):** die 54 `kind_von` und der eine
`kinder`-Widerspruch. `[read]` **Das ist kein Versaeumnis** — es ist
die einzige Art, die sich nicht durch Nachtragen beheben laesst:
**ein Verweis auf `G-90` zeigt auf einen Auftrag, nicht auf einen
Punkt. Dafuer braucht es eine Modellentscheidung**, siehe Befund 5.

### Eine Ausnahme, die ich gebaut habe

`[cmd]` **61 verschiedene Nummern werden als `kind_von` oder
`braucht` genannt und liegen in keinem Punktordner — 46 davon stehen
in `ERLEDIGT.md`.** `[read]` **Sie existieren, sie sind nur nicht
migriert:** A-52 hat die 244 **offenen** ueberfuehrt, nicht die 385
erledigten.

`[read]` **Ohne Ausnahme haette der Waechter 93 Mal etwas Richtiges
als falsch gemeldet** — ein Punkt darf auf einen erledigten
Vorgaenger zeigen, genau dafuer ist `kind_von` da. **Deshalb gilt
`ERLEDIGT.md` als zweite Quelle bekannter Nummern, bis die erledigten
Punkte migriert sind.**

`[cmd]` **Der Waechter sagt bei jedem Lauf, wie viele Verweise er nur
so aufloesen konnte: heute 72.** `[read]` **Diese Zahl ist der
Fortschrittsbalken der Migration** — sie muss auf 0 fallen.

### Der Index

`[cmd]` **247 Punkte, gruppiert nach Modul**, blockierte sichtbar von
unblockierten getrennt. **Gegen das Dateisystem gezaehlt:**

    todos                244 / 244   GLEICH
    laufend_codex          2 /   2   GLEICH
    laufend_claudecode     1 /   1   GLEICH
    erledigt               0 /   0   GLEICH
    Punktzeilen          247

`[read]` **`--pruefen` steht im Gate, `--schreiben` nicht.** Ein
Gate, das schreibt, hinterlaesst bei jedem Lauf eine geaenderte Datei
— **das ist G-202**, und der Punkt ist offen.

`[read]` **Blockiert heisst: der Blocker ist selbst noch offen.** Ein
`braucht:` auf einen erledigten Punkt blockiert nichts, sonst stuende
die halbe Liste dauerhaft als *„wartet"*.

### Die Abweichung zwischen Modell und Migration

**Auftrag: *„Wenn Codex' Ergebnis abweicht, ist die Abweichung selbst
der Befund."***

`[cmd]` **Die Migration haelt sich ans Modell, wo es zaehlt:** 247
Dateien, **0 Lesefehler, 0 Dateinamen, die nicht zu `nr`/`modul`
passen, 0 doppelte Nummern.** `[read]` **Der Dateiname und die
Nummernfuehrung sind sauber uebernommen.**

`[cmd]` **Was abweicht, ist der INHALT der Felder** — `beruehrt` und
`kind_von` tragen, was im alten `TODO.md` stand, ungeprueft. `[read]`
**Das ist keine Regelverletzung der Migration**, sondern genau der
Grund, aus dem das Modell diese Felder pflichtig macht: **die
Altlast wird jetzt sichtbar, statt weiter mitgeschleppt zu werden.**

`[read]` **Eine echte Modell-Luecke habe ich gefunden:** das Modell
sagt nicht, was mit Verweisen auf **erledigte** Punkte geschieht,
solange die nicht migriert sind. **Ich habe es als Ausnahme geloest
und die Zahl sichtbar gemacht — die Entscheidung gehoert aber ins
Modell.**

### Was ich nicht getan habe

**Keine Punktdatei geaendert** — ausser dieser hier, unter
`## Bericht`, wie beauftragt. **Die Sabotagen liefen gegen einen
Wegwerf-Bestand unter `backup/a53-probe/`**, danach geloescht; die
zwei Ratschen-Proben am echten Bestand sind byteidentisch
zurueckgerollt.
**`nummern-pruefen.mjs` nicht angefasst**, steht unveraendert daneben.
**`TODO.md` und `ERLEDIGT.md` nicht angefasst** — nur gelesen.
**`apps/` und `supabase/` nicht angefasst.**
**Nicht committet, nicht gestaged, nicht gepusht.**

`[cmd]` **`docs/punkte/00-INDEX.md` ist neu erzeugt** — er muss
existieren, sonst ist `--pruefen` im Gate rot.

### Gates

    encoding      20.467 Dateien sauber
    punkte        226 Befunde, Soll 226 — gruen
    index         stimmt mit 247 Punkten ueberein

### Was mir aufgefallen ist

**1. Ein Sollstand ueber ALLE Arten ist zu grob.** `[cmd]` Er stieg
waehrend dieses Auftrags von 225 auf 226, weil ein neuer Punkt
angelegt wurde. `[read]` **Beim Nachziehen sieht niemand, ob die Zahl
wegen eines neuen Fehlers oder wegen einer Behebung gewandert ist.**
**Die bessere Bauform waere ein Sollstand je Art** (125 Dateien, 54
`kind_von`, 23 …). **Bewusst nicht gebaut** — der Auftrag nennt eine
Zahl, und eine Bauform zu erweitern, die keinen Tag alt ist, waere
geraten.

**2. `beruehrt.tabellen` faengt drei verschiedene Fehler.** *„Gibt es
nicht"*, *„falsches Schema"* und *„ist gar keine Tabelle"* sehen im
Frontmatter gleich aus. `[read]` **Der Waechter nennt bei falschem
Schema den richtigen Ort** (`aber: supplements.entity_transporters`)
— **bei `medical.jsx` kann er nur sagen, dass es das nicht gibt.**

**3. Funktionen sind keine Tabellen.** `[cmd]` `public.is_admin` und
`recovery.acwr_for_day` existieren als Funktionen. `[read]` **Der
Waechter prueft nur `information_schema.tables`** — ein Punkt, der
eine Funktion nennt, ist damit rot, obwohl die Sache existiert.
**Entweder bekommt `beruehrt` ein Feld `funktionen`, oder die
Pruefung nimmt `routines` mit. Das ist eine Modellentscheidung.**

**4. Der alte Waechter meldet weiter seine drei Faelle.** `[cmd]`
`nummern-pruefen.mjs` laeuft unveraendert vor dem neuen. `[read]`
**Solange `TODO.md` die Sicherung ist, ist das richtig** — aber es
sind jetzt zwei Buchhaltungen nebeneinander, und die eine wird
gepflegt, die andere nicht.

**5. Der Index kennt keine Auftragsnummern.** `[cmd]` 15 `kind_von`
zeigen auf Agentenauftraege (`G-90`, `G-135`). `[read]` **Das Modell
trennt Punkte und Auftraege nicht** — beide heissen `G-nnn`. **Wer
`kind_von: G-90` schreibt, meint vermutlich den Punkt, aus dem der
Auftrag entstand; im Repo ist das nicht dieselbe Nummer.**

## Abnahme

**2026-08-27, Orchestrator. Vier eigene Sabotagen, je einzeln.**

`[cmd]`

    tabelle erfunden      exit=1   56 Befunde, Soll 55
    datei erfunden        exit=1   56 Befunde, Soll 55
    zahl ohne stichtag    exit=1   56 Befunde, Soll 55
    braucht unbekannt     exit=1   56 Befunde, Soll 55
    Rueckbau              sha256-identisch

`[cmd]` **Normalzustand gruen:** 247 Punkte, 39 Tabellenangaben gegen
`information_schema` gehalten, 55 Befunde genau im Sollstand, Index
stimmt. `const SOLLSTAND = 55`, im Gate.

`[read]` **Mein erster Sabotageversuch blieb gruen** — ich hatte
`beruehrt:` durch einen Block mit zweitem `tabellen:` ersetzt, statt
das vorhandene `tabellen: []` zu fuellen. **Der Waechter war richtig,
mein Test war falsch.**

### Die Sollstand-Bewegung ist der Beleg, den kein Test liefert

`[cmd]` **225 → 226**, weil ich A-54 mit `kind_von: A-52` angelegt
habe, ohne die Gegenrichtung zu pflegen. **Binnen Minuten gefangen,
waehrend der Fehler entstand.**

`[cmd]` **226 → 55** mit *,,171 behoben — Sollstand nachziehen"*
statt stillschweigendem Schlucken.

### Drei Vorschlaege uebernommen

**`ERLEDIGT.md` als zweite Quelle** — ohne sie haette der Waechter
93-mal etwas Richtiges als falsch gemeldet. **Und die Zahl der nur so
aufloesbaren Verweise (heute 72) als Fortschrittsbalken der Migration
ist besser als alles, was ich vorgesehen hatte.**

**`kinder` faellt weg** — 121 gegen 1 war meine Redundanz.

**Sollstand je Art statt Summe** — heute koennten 54 `kind_von`
verschwinden und 54 Tabellenfehler entstehen, **die Summe bliebe 55,
das Gate gruen.**

**Alle drei sind im Modell nachgezogen.**

**Abgenommen.**

