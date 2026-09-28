---
nr: A-75
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-27
quellen:
  - CLAUDE.md:391
  - tools/punkte-pruefen.mjs
  - docs/punkte/00-LIESMICH.md

braucht: []
kind_von: A-74
entscheidung: E-68

beruehrt:
  tabellen: []
  dateien:
    - tools/punkte-pruefen.mjs
    - docs/punkte/00-LIESMICH.md

zahlen:
  gemessen: 2026-09-27
  spec_dateien_gesamt: 158
  spec_dateien_goals: 10
  waechter_die_den_quellenabgleich_pruefen: 0
---

# A-75 - Auftraege werden nicht gegen die Quellen geprueft, und nichts wird rot

## Der Befund

Tom, 2026-09-27: *,,ich habe schon tausendmal gesagt es gibt keinen
auftrag der nicht gegen die quellen gecheckt ist, egal was wir fuer
workflows einbauen das klappt einfach nicht."*

`[cmd]` **Drei Belege von einem einzigen Abend:**

- **G-511** wurde aus den Seed-Daten gebaut statt aus der Spec. Der
  Fingerabdruck: die Rechnung kann genau die eine Phasenart, fuer die
  eine Zeile mit `calorie_surplus_kcal` in dev lag. **Zwei von neun.**
- **Die erste Fassung von G-519** entstand, ohne eine einzige Datei
  aus `docs/specs/Goals/` zu oeffnen — und legte Tom eine Entscheidung
  vor, deren Antwort in `PHASE_MODELS.md:28` stand.
- **Die Fuenf-Kopien-Meldung zu PHASE_MODELS.md** entstand durch
  Grepen ueber das ganze Repo, obwohl vier der fuenf Pfade auf der
  Verbotsliste stehen.

## Warum die bisherigen Korrekturen nicht greifen

`[read]` **Jede bisherige Korrektur war eine REGEL** — ein Satz in
CLAUDE.md, eine Zeile in der Auftragsvorlage, ein Vermerk in der
Punktdatei. Ein Agent liest den Satz und macht danach, was er ohnehin
vorhatte.

`[cmd]` **Was in diesem Repo haelt, sind die Sachen, die ROT werden:**
das Gate, der Punktewaechter, `@abwesend` (A-62), die
Sabotageproben, seit G-518 die dist-dir-Sperre.

`[cmd]` **Beim Quellenabgleich wird nichts rot — 0 Waechter.** Das
ist der ganze Unterschied.

## Der Vorschlag

`[read]` **Kein neuer Workflow. Ein Pflichtfeld im Frontmatter:**

```yaml
quellen:
  - docs/specs/Goals/PHASE_MODELS.md:28
  - referenz/lumeos-2026/apps/app/modules/goals/components/nutrition/GoalSelector.tsx:1
```

**Der Punktewaechter faellt, wenn**

1. der Block fehlt,
2. eine genannte Datei nicht existiert,
3. ein genannter Pfad auf der Verbotsliste steht
   (`docs/_archive/`, `_archive/`, `AGENTS.md`, `.codex/`, `.agents/`,
   `infra/`, die Design-System-Upload-Ordner).

`[read]` **Punkt 3 haette den Laerm von heute Abend gefangen.**

`[read]` **Die Bauform existiert schon:** der Waechter liest ohnehin
alle 816 Frontmatter und haelt 427 Tabellenangaben gegen
`information_schema`. Ein Pfadabgleich ist dasselbe Muster.

## Die ehrliche Grenze

`[read]` **Der Waechter faengt keinen Agenten, der eine Datei NENNT,
ohne sie gelesen zu haben.** Das kann nichts faengen. Aber er macht
aus ,,still uebersprungen" ein ,,muss etwas nennen" — und eine falsche
Angabe faellt bei der Abnahme auf, wo eine fehlende unsichtbar war.

## Nachweiszeilen

**A1** — `quellen:` als Pflichtfeld im Punktewaechter, die drei
Faelle oben je mit eigener Meldung.

**A2** — **Sollstand statt Rotlauf.** 816 bestehende Punkte haben
den Block nicht. Der Waechter zaehlt sie wie die 25 `kind_von`-
Befunde: bekannt, mit Sollstand, und faellt erst, wenn eine NEUE
Punktdatei ohne Block dazukommt. Sonst ist er ab Tag eins rot und
wird umgangen.

**A3** — Gegenprobe in beide Richtungen: eine neue Punktdatei ohne
Block wird rot; mit Block auf eine existierende Datei gruen; mit
Block auf `docs/_archive/...` rot; mit Block auf eine nicht
existierende Datei rot.

**A4** — die Auftragsvorlage in `docs/punkte/00-LIESMICH.md`
nachziehen, damit die Form an einer Stelle steht.

**A5** — **messen, nicht behaupten:** nach vier Wochen zaehlen,
wieviele neue Punkte einen Block tragen und wieviele davon auf eine
Datei zeigen, die auch im Bericht vorkommt. Ein Waechter, der nur
Felder fuellt, ist keine Verbesserung.

## Abnahme

`[cmd]` **Gebaut am 2026-09-28.** `tools/punkte-pruefen.mjs`,
Abschnitt 5b. Der Waechter faellt bei vier Faellen: fehlender Block
ab Stichtag, leerer Block, nicht existierende Datei, Pfad von der
Liste in `CLAUDE.md:391`.

### Eine Abweichung von A2, mit Grund

`[read]` **A2 verlangte einen Sollstand. Gebaut ist ein Stichtag.**
Der Grund steht in der Datei selbst: **dieser Waechter faellt in
BEIDE Richtungen** — sinkt die Zahl der Befunde unter den Soll,
verlangt er, den Soll nachzuziehen. Ein Sollstand von 823 waere
also rot geworden, sobald der erste alte Punkt einen Block bekommt,
und jeder geschlossene Punkt haette ihn verschoben. `QUELLEN_AB =
'2026-09-28'` braucht keine Pflege und laesst sich nicht dadurch
gruen machen, dass man alte Punkte loescht.

### Die Gegenprobe, acht Richtungen

    neu, ohne Block                        ROT    quellen: fehlt
    neu, Block auf existierende Datei      GRUEN
    neu, Block auf docs/_archive           ROT    Verbotsliste
    neu, Block auf AGENTS.md               ROT    Verbotsliste
    neu, Block auf fehlende Datei          ROT    gibt es nicht
    neu, Block leer                        ROT    leerer Block
    neu, zwei gute plus eine falsche       ROT    Verbotsliste
    alt (2026-09-01), ohne Block           GRUEN

`[cmd]` **Die Gegenprobe hat einen echten Fehler gefangen, bevor er
stehenblieb:** `tools/punkte-lesen.mjs:122` stuerzte mit
`ziel[liste].push is not a function`, weil ein Schluessel ohne Wert
auf oberster Ebene als Block (`{}`) angelegt wird und `??=` ein
leeres Objekt nicht ersetzt. **`quellen:` ist die erste Liste auf
oberster Ebene im Modell** — vorher gab es nur `braucht: []` inline
und `beruehrt.*` eine Ebene tiefer. Behoben in derselben Datei.

`[read]` **Ohne die Probe waere der Waechter rot gewesen und haette
wie ein Befund ausgesehen.** Genau das ist der Grund fuer die
Regel, dass eine Pruefung in beide Richtungen belegt sein muss.

### Was sonst geschah

`[cmd]` **Acht Punkte tragen den Block jetzt** — A-75, A-76, G-520
bis G-525. Alle genannten Dateien existieren, keine steht auf der
Verbotsliste. **G-519 blieb unberuehrt**, daran arbeitet Claude
Code.

`[cmd]` **`docs/punkte/00-LIESMICH.md` nachgezogen** (A4): der Block
im Frontmatter-Beispiel und ein Abschnitt ,,Warum `quellen:` Pflicht
ist" mit den vier Faellen und der ehrlichen Grenze. Eingesetzt an
zwei exakten Ankern, CRLF erhalten, keine gemischten Zeilenenden.

`[cmd]` **Waechter gruen:** `punkte-pruefen` 25/25, Index 823.

### Offen

`[read]` **A5 bleibt offen und ist der eigentliche Nachweis:** nach
vier Wochen zaehlen, wieviele neue Punkte einen Block tragen und
wieviele davon auf eine Datei zeigen, die auch im Bericht vorkommt.
Ein Waechter, der nur Felder fuellt, ist keine Verbesserung.

## Ein Konstruktionsfehler, vom Waechter selbst gefunden

`[cmd]` **2026-09-28, vier Stunden nach dem Bau:** A-78 trug
`quellen: docs/punkte/todos/goals-g-0524-...md`. Als G-524 nach
`erledigt/` wanderte, meldete der Waechter *,,gibt es nicht"* — und
er hatte recht.

`[read]` **Ein `quellen:`-Eintrag auf eine PUNKTDATEI ist
zerbrechlich, weil der Ordner der Zustand ist.** Jeder Punkt wandert
irgendwann von `todos/` nach `laufend_*/` nach `erledigt/`, und jeder
Verweis auf seinen Pfad wird dabei falsch. **Das ist keine
Nachlaessigkeit, das ist die Bauform.**

**A6 (neu)** — Punktverweise in `quellen:` gehen ueber
`docs/punkte/00-INDEX.md`, nicht ueber einen Ordnerpfad. Die Nummer
steht im Fliesstext, wo sie nicht bricht.

**A7 (neu)** — besser noch: der Waechter loest eine NUMMER in
`quellen:` auf, so wie er es bei `braucht:` und `kind_von:` schon
tut. Dann ist `quellen: [G-514]` ein gueltiger Eintrag und wandert
mit. **Nicht gebaut** — erst messen, wieviele bestehende Eintraege
ueberhaupt auf Punktdateien zeigen.

`[read]` **Der Vorfall ist der Beleg fuer den ganzen Punkt.** Eine
Regel haette gesagt ,,nenne stabile Pfade" und waere ignoriert
worden. Der Waechter hat den falschen Pfad innerhalb eines
Arbeitstages rot gemeldet — beim Autor der Regel selbst.
