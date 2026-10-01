---
nr: A-85
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-01
beauftragt: 2026-10-01
agent: claudecode

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
