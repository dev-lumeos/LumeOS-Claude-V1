---
nr: A-85
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-01
beauftragt: 2026-10-01
agent: claudecode
erledigt: 2026-10-01
commit: c62bd149

braucht: [A-81]
kind_von: A-81

quellen:
  - docs/punkte/erledigt/quer-a-0081-der-dokumentierte-zyklus-laeuft-nicht.md
  - docs/punkte/00-LIESMICH.md
  - docs/todo/LAUFEND.md

beruehrt:
  dateien:
    - tools/zyklus-pruefen.mjs
    - tools/punkte-index.mjs
    - tools/__tests__/
    - docs/todo/LAUFEND.md
---

# Der Zyklus wird geprueft, aber nichts fuehrt ihn aus

    AUFTRAG FUER Claude Code - A-85: der Zyklus wird geprueft, aber
                                    nichts fuehrt ihn aus
    Bereich: tools/ (neue Datei plus Test in tools/__tests__/)
    Fremd:   apps/ baut die ANDERE Claude-Code-Sitzung gerade (G-569).
             Diese hier laesst apps/ und packages/ unangetastet.
             package.json gehoert bis auf Weiteres Codex, der an A-77
             die Gate-Zeilen umbaut - der Test braucht KEINE Aenderung
             dort, siehe A4.
             docs/ gehoert dem Orchestrator: das Werkzeug SCHREIBT
             nach docs/, aber dieser Auftrag aendert dort keine Datei
             von Hand. Nachweise laufen auf Attrappen.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/punkte/erledigt/quer-a-0081-der-dokumentierte-zyklus-laeuft-nicht.md`
— besonders den Absatz *„Das war die teure Antwort auf das falsche
Problem"*. Dort wurde schon einmal ein Werkzeug vorgeschlagen und
verworfen. **Dieses hier ist ein anderes, und der Unterschied ist die
Grenze dieses Auftrags.**

## Der Befund

`[cmd]` **In `tools/` liegen fuenf Werkzeuge fuer Punkte** —
`punkte-index`, `punkte-lesen`, `punkte-pruefen`, `zyklus-pruefen`,
`fragen-index`. **Alle fuenf lesen oder pruefen. Keines fuehrt aus.**

`[cmd]` **Was der Orchestrator deshalb je Zyklus von Hand macht:** die
Punktdatei zwischen vier Ordnern verschieben, `agent:` und
`beauftragt:` beim Rausgeben setzen, `erledigt:` und `commit:` beim
Abnehmen setzen, die Tabelle oben in `docs/todo/LAUFEND.md` nachziehen,
die Generatoren in der richtigen Reihenfolge rufen.

`[cmd]` **Die Tabelle ist der teuerste Posten.** `LAUFEND.md` hat
heute 604 Zeilen; die Tabelle darin hat 5 Zeilen und ist vollstaendig
aus dem Frontmatter ableitbar. **Dass sie ableitbar ist, steht als
Befund in der Datei selbst** — und sie wird weiter von Hand gepflegt.
Am 01.10. kostete das Nachziehen den aufwendigsten Einzelschritt des
Tages, inklusive eines Hilfsskripts, das die Datei an zwei Ankern
zusammensetzt.

`[read]` **Das ist keine Disziplinfrage mehr, sondern eine fehlende
Hand.** A-81 hat die pruefende Haelfte gebaut (`zyklus-pruefen.mjs`,
Sollstand 0, im Gate). **Die ausfuehrende Haelfte fehlt.**

## Wo die Grenze liegt — und warum sie wichtig ist

`[read]` **A-81 hat ein Werkzeug verworfen, das aus einer Nummer einen
Pfad macht**, mit der Begruendung, die Regel loese das Problem besser:
erst verschieben, dann beauftragen. **Diese Begruendung gilt
weiterhin.**

`[read]` **Der Unterschied:** dieses Werkzeug entscheidet nichts. Es
ersetzt keinen Abnahmetext, keinen Auftragstext, keine Messung und
keine Reihenfolge. **Es fuehrt aus, was der Orchestrator ohnehin tut,
und es tut es gleich.** Wer es benutzt, hat vorher entschieden.

`[read]` **Daraus folgt eine harte Grenze:** kein Schritt des Werkzeugs
darf eine Zahl, einen Hash oder einen Text erfinden. Fehlt der Hash,
bricht es ab. **Ein Werkzeug, das einen Platzhalter einsetzt, erzeugt
genau die Fehlerklasse, die `punkte-pruefen` sucht.**

## Auftrag

**A1 — den Tabellengenerator, und zwar nur die Tabelle.**
`LAUFEND.md` bekommt zwischen zwei Markierungen einen erzeugten
Abschnitt; alles ausserhalb bleibt unberuehrt, byteidentisch. Die
Zeilen entstehen aus dem Frontmatter von `laufend_<agent>/` und
`laufend_<agent>/next/`: Agent, Nummer, Titel aus der H1, Stand
(`laeuft` mit `beauftragt:`, `bereit in next/`). `[read]` **Die
uebrigen 590 Zeilen sind NICHT ableitbar** — was auf Tom wartet, die
Regeln, die Lehren. **Wer sie anfasst, hat den Auftrag verfehlt.**

**A2 — der Frontmatter-Setzer.** Vier Felder, je mit Vorbedingung:
`agent:`/`beauftragt:` nur beim Weg nach `laufend_<agent>/`,
`erledigt:`/`commit:` nur beim Weg nach `erledigt/`. **Steht ein Feld
schon drin, ist das ein Abbruch, keine Ueberschreibung.**

`[cmd]` **Und die Falle dabei ist belegt:** am 01.10. standen zwei
Punktdateien auf 0 Bytes, weil ein Schreibgriff die Datei leerte,
bevor der Lesezugriff lief. **Lesen, Ergebnis in eine Variable,
Temporaerdatei, umbenennen.** Nie in einem Ausdruck, nie direkt auf
die Zieldatei.

**A3 — der Umzug zwischen den vier Ordnern.** `[cmd]` **`git mv`
scheitert an untracked Dateien** — ein frisch geschriebener Punkt ist
nicht im Index. Umbenennen auf Dateisystemebene, git sieht ihn am neuen
Ort. **Die Richtung wird geprueft:** `todos/ -> next/ -> laufend/ ->
erledigt/`, und ein Sprung ueber eine Stufe ist ein Abbruch mit
Begruendung.

**A4 — der Test, ohne `package.json` anzufassen.** `[cmd]` **Der erste
Gate-Schritt ist ein Glob:** `node --test "tools/__tests__/*.test.mjs"`
— eine neue Datei dort laeuft mit, ohne dass eine Zeile in
`package.json` geaendert wird. Heute: 5 Dateien, 37 Pruefungen, 12,9 s.

`[cmd]` **Die Nachweise laufen auf Attrappen, nicht auf echten
Punkten.** `tools/__tests__/fixtures/` existiert (eine Datei,
`c554-gegenprobe.sql`). Zwei Auftraege laufen gerade — **eine Probe,
die eine echte Punktdatei verschiebt, zerstoert laufende Arbeit.**

`[read]` **Was `gate:docs` angeht:** dort fehlt der Werkzeugtest, und
weil dieses Werkzeug auf `docs/` arbeitet, gehoerte er hinein. **Das
ist eine Zeile in `package.json`, und die liegt bei Codex (A-77) —
melde sie als Vorschlag, aendere sie nicht.**

**A5 — `zyklus-pruefen` bleibt die Wahrheit.** Nach jedem Schritt des
Werkzeugs muss er gruen sein, Sollstand 0. `[read]` **Das Werkzeug
prueft nicht selbst, was der Waechter prueft** — zwei Pruefungen, die
dasselbe behaupten, laufen irgendwann auseinander. **Es ruft ihn auf
und bricht ab, wenn er rot ist.**

**Nicht Teil:** aus einer Nummer einen Pfad machen (A-81 hat das
verworfen, mit Begruendung) · Abnahmetexte oder Auftragstexte erzeugen ·
committen (der Commit bleibt beim Orchestrator, mit dem vollstaendigen
`git status` davor) · die Generatoren aendern.

**Zu belegen:** Sabotage je Zusicherung in beide Richtungen · ein Lauf
auf Attrappen, der alle vier Stufen durchgeht · `LAUFEND.md` vor und
nach dem Generator byteidentisch ausserhalb der Markierungen, mit
Pruefsumme · `zyklus-pruefen` gruen danach ·
`node --test "tools/__tests__/*.test.mjs"` mit Testzahl · **`pnpm gate`
nur abgesprochen**, die andere Sitzung laeuft an G-569 · nichts
committen.

---

# Bericht — Claude Code, 2026-10-01

**Gebaut:** `tools/zyklus-fahren.mjs` (neu, 530 Zeilen) ·
`tools/__tests__/a85-zyklus-fahren.test.mjs` (neu, 17 Pruefungen) ·
`docs/todo/LAUFEND.md` (zwei Markierungen plus ein Hinweisabsatz).
**Nicht angefasst:** `apps/`, `packages/`, `package.json`,
`tools/zyklus-pruefen.mjs`, `tools/punkte-index.mjs`. **Nichts
committet.**

    node tools/zyklus-fahren.mjs tabelle [--schreiben]
    node tools/zyklus-fahren.mjs vorbereiten <pfad> --agent <name>
    node tools/zyklus-fahren.mjs rausgeben   <pfad> [--agent <name>]
    node tools/zyklus-fahren.mjs abnehmen    <pfad> --commit <hash>

## A1 — die Tabelle, und nur die Tabelle

`[cmd]` **`LAUFEND.md` hat 628 Zeilen, erzeugt sind 6** — Kopf,
Trennzeile und vier Datenzeilen. Der Abschnitt steht zwischen
`<!-- ERZEUGT:laufend-tabelle -->` und `<!-- /ERZEUGT:laufend-tabelle -->`.

`[cmd]` **Byteidentisch ausserhalb der Markierungen, in drei Zustaenden
gemessen** — A vor dem Lauf, B mit absichtlich verstellter Tabelle, C
nach dem Generator:

    Zustand                 gesamt            ausserhalb der Marken
    A  vor dem Lauf         1ca9c98a4669a278  3c2246133b2b6709
    B  Tabelle verstellt    2c5a127da6e9f556  3c2246133b2b6709
    C  Generator gelaufen   1ca9c98a4669a278  3c2246133b2b6709

`[read]` **A == C vollstaendig, `diff` leer.** `[read]` **Die
Pruefsumme ausserhalb bleibt durch B hindurch dieselbe** — der
Generator hat den Abschnitt ersetzt und sonst nichts. Ein zweiter Lauf
meldet *„die Tabelle ist schon aktuell, nichts geschrieben"*.

`[cmd]` **Fehlt eine Markierung, bricht er ab statt zu raten** —
eine geratene Grenze loescht Prosa.

### Zwei Befunde beim ersten Lauf, beide berichtigt

`[cmd]` **`laufend_fable/` und `laufend_kimi/` existieren und tragen nur
`.gitkeep`.** Die erste Fassung schrieb fuer beide *„`next/` ist leer,
Schritt 7 des Zyklus offen"*. `[read]` **Das ist eine Falschaussage** —
niemand wartet dort auf einen vorbereiteten Auftrag. **Ein Agent kommt
in die Tabelle, wenn er etwas hat;** eigener Test, von Sabotage S5
gefangen.

`[cmd]` **Zwei Titel in der handgefuehrten Tabelle waren Umschreibungen,
nicht die H1:** A-77 stand als *„114 von 120 Proben laufen in keinem
Lauf"*, die H1 sagt *„vier Werkzeugtests liefen nirgends"*; A-85 stand
als *„der Zyklus wird geprueft, aber nicht ausgefuehrt"*, die H1 sagt
*„Der Zyklus wird geprueft, aber nichts fuehrt ihn aus"*. `[read]`
**A1 nennt die H1 als Quelle, also gewinnt sie** — und das ist der
Punkt an einer erzeugten Tabelle: sie kann nicht von der Datei
abweichen.

## A2 — der Setzer schreibt nie auf die Zieldatei

`[cmd]` **Lesen, Variable, Temporaerdatei, umbenennen.** Die vier
Felder landen vor der ersten Leerzeile des Frontmatters — dort, wo
`agent:` und `beauftragt:` in allen Punktdateien stehen, die sie
tragen. Belegt am Attrappenlauf: 196 Bytes vorher, 270 nachher, keine
`.tmp`-Reste, keine Datei mit 0 Bytes.

`[cmd]` **Ein Feld, das schon dasteht, ist ein Abbruch:**
*„beauftragt: steht schon da (2026-09-29) — das Werkzeug ueberschreibt
nicht, es bricht ab"*. `[read]` **Nur `null` darf ersetzt werden** —
ein leeres Feld ist keine Aussage.

`[read]` **Der Test misst die Reihenfolge, nicht die Atomizitaet**, und
das steht als Kommentar an ihm. Eine erste Sabotage (`writeFileSync('')`
plus `appendFileSync`) blieb gruen, weil der Endzustand derselbe ist;
`sicherSchreiben` ist am Ergebnis nicht sichtbar. **Die Sabotage, die
den echten Fehler vom 01.10. nachbaut — leeren, dann lesen — macht vier
Pruefungen rot.**

## A3 — der Umzug, mit geprueftem Weg

`[cmd]` **Umbenannt auf Dateisystemebene**, nicht `git mv`: ein frisch
geschriebener Punkt ist nicht im Index.

    todos/ -> next/ -> laufend/ -> erledigt/   je eine Stufe, erlaubt
    nach todos/                                aus jeder Stufe, erlaubt
    todos/ -> laufend/                         "springt ueber eine Stufe"
    next/ -> erledigt/                         "springt ueber eine Stufe"
    erledigt/ -> laufend/                      "geht rueckwaerts"

`[cmd]` **Liegt am Ziel schon eine Datei, ist das ein Abbruch** — kein
Ueberschreiben.

## A4 — der Test laeuft im Glob mit, `package.json` unberuehrt

`[cmd]` **Vorher 5 Dateien, 37 Pruefungen. Nachher 6 Dateien, 54
Pruefungen, 3,8 s.** Gemessen beides am selben Stand, einmal mit und
einmal ohne die neue Datei — **+17, genau die neuen.**

`[read]` **Die Nachweise laufen auf Attrappen.** Jeder Test baut sich
seine eigene Punktewurzel in `mkdtempSync` und raeumt sie in `finally`
weg. **Keine echte Punktdatei wurde verschoben** — `git status` zeigt
unter `docs/punkte/` keine Aenderung.

`[read]` **Vorschlag fuer A-77, nicht von mir geaendert:** `gate:docs`
fuehrt den Werkzeugtest nicht, obwohl dieses Werkzeug auf `docs/`
arbeitet. Eine Zeile `node --test "tools/__tests__/*.test.mjs"` am
Anfang von `gate:docs` wuerde ihn mitnehmen — **die Datei liegt bei
Codex.**

## A5 — `zyklus-pruefen` bleibt die Wahrheit

`[cmd]` **Nach jedem schreibenden Schritt ruft das Werkzeug ihn auf und
bricht ab, wenn er rot ist.** Es prueft nicht selbst, was der Waechter
prueft.

`[read]` **Auf einer Attrappenwurzel laeuft er nicht** — er liest
`docs/punkte/` und wuerde ueber den echten Bestand urteilen, nicht ueber
die Probe. **Deshalb `--waechter <pfad>` fuer die Probe:** ein
untergeschobener roter macht den Lauf rot (*„zyklus-pruefen ist ROT nach
diesem Schritt … 3 Verstoesse"*), ein gruener laesst ihn durch.
Sabotage S7 belegt, dass das Urteil durchschlaegt.

`[cmd]` **Nach allen Laeufen gruen:** *„271 offen · 0+0 vorbereitet ·
1+1 laufend"*. Ebenso `punkte-pruefen` (25, genau der Sollstand) und
`punkte-index --pruefen` (882 Punkte).

## Die harte Grenze: kein Platzhalter

`[cmd]` **`abnehmen` ohne `--commit` bricht ab**, mit dem Grund:
*„Der Hash wird nicht erfunden und nicht als Platzhalter gesetzt: erst
committen, dann abnehmen."* Die Datei bleibt liegen, und sie traegt
danach kein `commit:`.

`[cmd]` **`--commit TODO` bricht ab:** *„sieht nicht wie ein Git-Hash
aus (7 bis 40 Hexzeichen)"*. `[read]` **Ein Platzhalter erzeugte genau
die Fehlerklasse, die `punkte-pruefen` sucht** — ein Punkt in
`erledigt/` ohne Hash behauptet mehr, als er hat (A-81/A6).

`[read]` **Und `vorbereiten` setzt NICHTS** — ein vorbereiteter Auftrag
traegt den Auftragsteil, aber noch kein `agent:` (`00-LIESMICH.md:430`).
Eigener Test.

## Sabotage: neun Stellen, je von ihrer eigenen Zeile gefangen

    S1  if (!opt.commit) ausgeschaltet        rot: Platzhalter-Test
    S2  Ueberschreibschutz ausgeschaltet      rot: Feld-steht-schon-da
    S3  Stufensprung erlaubt                  rot: 2 Wegpruefungen
    S4  Markierungspruefung ausgeschaltet     rot: Marken-fehlen
    S5  leere Agenten in die Tabelle          rot: 2 Tabellentests
    S6  leeren, dann lesen (der 01.10.-Fehler) rot: 5 Pruefungen
    S7  Waechterurteil verworfen (return)     rot: A5-Test
    S8  Hashform nicht geprueft               rot: Platzhalter-Test
    S9  Prosa hinter der Endmarke geloescht   rot: 2 Byteidentitaeten
    alle neun zurueckgestellt                 GRUEN 17/17, byteidentisch

`[cmd]` **Kontrollprobe: Pruefsumme der Datei vor der ersten und nach
der letzten Sabotage identisch** (`bfda53ffa8d16862`). `[read]` **Keine
Sabotage blieb gruen** — die eine, die es tat, war eine falsche
Sabotage und ist oben unter A2 erklaert.

## Ein Lauf durch alle vier Stufen, auf einer Attrappe

    0  todos/              196 Bytes
    1  vorbereiten         -> laufend_codex/next/   (keine Felder gesetzt)
    2  rausgeben           -> laufend_codex/        agent:, beauftragt:
    3  abnehmen            -> erledigt/             erledigt:, commit:
       Ergebnis            270 Bytes, "## Auftrag" noch da,
                           0 Temporaerreste, 0 leere Dateien

## Was das Werkzeug nicht tut

`[read]` **Es entscheidet nichts.** Kein Abnahmetext, kein
Auftragstext, keine Messung, keine Reihenfolge, kein Commit. **Es macht
aus keiner Nummer einen Pfad** — A-81 hat das verworfen, und die
Begruendung gilt weiter: erst verschieben, dann beauftragen, die
Anweisung traegt den Pfad. **Es aendert die Generatoren nicht.**

## Offen

`[read]` **`pnpm gate` ist nicht gelaufen** — nur abgesprochen, und die
andere Sitzung baute an G-569. **Einzeln gelaufen und gruen:**
`node --test "tools/__tests__/*.test.mjs"` (54), `zyklus-pruefen`,
`punkte-pruefen`, `punkte-index --pruefen`. `[read]` **Ein Einzellauf
ersetzt den Gatelauf nicht.**

`[read]` **Nichts committet.** Offen im Baum: `tools/zyklus-fahren.mjs`
und `tools/__tests__/a85-zyklus-fahren.test.mjs` (beide neu).
`[cmd]` **Die zwei Markierungen in `LAUFEND.md` sind mit `90918f2e`
hereingekommen** — der Orchestrator hat sie in seinem eigenen
`punkte(G-569)`-Commit mitgenommen, nicht ich. `supabase/_pipeline/kette.json`
ist aus einer anderen Sitzung.

`[read]` **Ein Zustandsfeld im Frontmatter wurde erwogen und
verworfen** (Entscheidung Tom, 01.10.): „gebaut, nicht eingespielt"
gehoert in den Abschnitt *Die Einspielreihenfolge*, der von Hand bleibt
und Beurteilung samt gemessener Zahlen traegt. **Braucht es spaeter
doch eines, dann mit geschlossener Werteliste** — Freitext im
Frontmatter ist eine zweite Wahrheit, die unbemerkt veraltet (G-572).

---

## Abnahme — 2026-10-01, Commit `c62bd149`

**Der Nachweis, der zaehlt, ist der Gebrauch.** Ich habe das Werkzeug bei
dieser Abnahme selbst benutzt.

`[cmd]` **`zyklus-fahren tabelle --schreiben`: fuenf Zeilen erzeugt,
Meldung „ausserhalb der Markierungen unveraendert".** Und die erzeugte
Tabelle hat sofort **zwei Abweichungen meiner Handpflege** aufgedeckt:
A-77 und A-85 standen dort mit meinen Umschreibungen statt mit ihrer H1.
`[read]` **Eine erzeugte Tabelle kann nicht von der Datei abweichen, die
handgefuehrte konnte es** — das ist der ganze Zweck.

`[cmd]` **12 Funktionen in 535 Zeilen, 20 Zusicherungen** in
`tools/__tests__/a85-zyklus-fahren.test.mjs`. **Der Test laeuft im Glob
mit, `package.json` unberuehrt:** vorher 5 Dateien / 37 Pruefungen,
nachher 6 / 54.

`[cmd]` **Die harte Grenze ist gebaut:** `abnehmen` ohne `--commit`
bricht ab, `--commit TODO` bricht ab, ein Feld das schon dasteht bricht
ab statt zu ueberschreiben, ein Stufensprung bricht ab, und nach jedem
schreibenden Schritt ruft es `zyklus-pruefen` und bricht ab, wenn der
rot ist.

`[read]` **Und der Agent hat eine eigene falsche Sabotage als solche
gemeldet statt sie gruen zu lassen:** `writeFileSync('')` plus
`appendFileSync` hat denselben Endzustand, misst also nichts. Die
Sabotage, die den Fehler vom 01.10. nachbaut — leeren, dann lesen —
macht vier Pruefungen rot. Steht als Kommentar am Test. **Das ist der
Unterschied zwischen einer Probe und einer Behauptung ueber eine Probe.**

### Ein Befund aus dem Gebrauch

`[cmd]` **Derselbe Schreibweg ist mir zweimal mit `EPERM` gescheitert**,
weil ein Agent dieselbe Datei offen hatte — einmal an A-77s Punktdatei,
einmal an `LAUFEND.md`. **Das Werkzeug benutzt dasselbe Muster** und
wuerde dabei eine `.neu`-Datei liegen lassen, die kein Waechter kennt.
**Das ist A-89.**

### Offen

`[read]` **`gate:docs` fuehrt den Werkzeugtest nicht**, obwohl dieses
Werkzeug auf `docs/` arbeitet. Der Agent hat die Zeile vorgeschlagen und
`package.json` nicht angefasst — **richtig, die Datei lag bei Codex
(A-77).** A-77 ist jetzt abgenommen, die Zeile ist frei und gehoert in
den naechsten Werkzeug-Auftrag.

`[read]` **`pnpm gate` lief bei ihm nicht**, nur die Waechter einzeln.
**Beim Commit ist er gelaufen und war gruen** — damit ist die Luecke
geschlossen, aber die Aussage im Bericht war korrekt eingeschraenkt.
