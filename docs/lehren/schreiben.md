# Schreiben und Ablage

Belege zu den Regeln in `CLAUDE.md`. **Wer eine Regel anwendet,
liest hier den Grund** ? die Regel allein sagt nicht, warum sie
entstanden ist.

## Der SSOT-Index wird vom Orchestrator gepflegt

`[cmd]` Am 2026-08-18 standen **16 von 86 Berichten nicht in
`docs/ssot/00-INDEX.md`** — alle von Codex.

`[read]` **Der Grund ist strukturell, kein Versaeumnis:** Claude Code
traegt die Indexzeile ein, weil es im Auftrag steht und er die Datei
ohnehin anfasst. **Codex arbeitet in `supabase/` und beruehrt
`docs/ssot/` nur fuer seinen eigenen Bericht.**

**Der Index ist laut dieser Datei der Einstieg** — ein Bericht, der
nicht darin steht, existiert fuer die naechste Sitzung nicht.

**Deshalb:** Der Orchestrator traegt ihn nach, wenn er den Bericht
committet. **Eine Zeile mit dem Befund, nicht mit dem Dateinamen** —
der steht schon in der ersten Spalte.

### Und seit 2026-08-22: der Bericht selbst gehoert auch dem Orchestrator

**Tom, 2026-08-22:** *„und der update von ssot ist auch dein job"*

**Agenten schreiben nichts in `docs/`.** Kein `TODO.md`, kein
`ERLEDIGT.md`, **und keinen SSOT-Bericht**. Der
Bericht geht als Text in den Chat; der Orchestrator prueft die
tragenden Zahlen selbst und schreibt daraus, was er geprueft hat.

`[read]` **Der Grund:** Ein SSOT-Bericht, den der Ausfuehrende selbst
verfasst, ist seine Selbstauskunft — genau die Zusammenfassung, die die
Pruefregel nicht lesen soll. `[cmd]` Bericht 178 sagt *„Kettenlauf: 87
Schritte, Exit 0"*, und das stimmt; es steht dort aber, weil Codex es
hingeschrieben hat, nicht weil es geprueft wurde.

**Was geprueft ist, traegt `[cmd]`. Was nur berichtet wurde, traegt
`[read]`.** Diese Unterscheidung kann nur treffen, wer selbst gemessen
hat.

`[cmd]` **Am 2026-08-22 hielt es sich noch niemand daran** — Fable und
Codex hatten `TODO.md`, `ERLEDIGT.md`, `00-UEBERSICHT.md` und
`00-INDEX.md` gleichzeitig offen, waehrend der Orchestrator dieselben
Dateien schreiben wollte. `[read]` **Die Regel stand in der
Bereichstabelle einer Uebersichtsdatei — der Agent liest keine Uebersicht,
er liest seinen Auftrag.** Deshalb steht sie ab jetzt in jedem Auftrag.

### Nachweisdateien in `backup/` gehoeren derselben Encoding-Regel

`[cmd]` **Am 2026-08-22 haben zwei Nachweisdateien jeden Commit im
gesamten Repo blockiert:** `backup/c192/final-nachweis.json` und
`-finaldb.json`, je sechsmal die Doppelkodierungsmarke (U+00E2 U+20AC)
und CRLF — Ausgabe eines Kettenlaufs durch eine Windows-Konsole.

`[cmd]` `encoding-pruefen.mjs` laeuft als **erster** Gate-Schritt ueber
alle 10.661 Dateien. Ein einziger Fund legt alles lahm, auch Commits,
die die Datei nicht anfassen.

`[read]` **Die Regel stand fuer Quelldateien** — fuer `backup/` galt sie
offenbar als nicht gemeint. **Sie gilt.** `encoding="utf-8",
newline="\n"`, auch fuer Messprotokolle.

Umkehrbar war es: von `cp1252` nach `utf-8` zurueckdrehen, mit zwei
Gegenproben — bleibt gueltiges JSON, keine Marken uebrig.

## `TODO.md` ist ein Befundregister, kein Arbeitsvorrat

**Tom, 2026-08-22:** *„undundundund kann ich stunden weiter machen und
du sagst hast nichts und das war nur ein modul"*

`[cmd]` **Der Orchestrator hatte gemeldet, es gebe keine Arbeit fuer
zwei freie Agenten.** Tom schickte daraufhin sieben Bildschirmfotos aus
**einem** Modul, auf denen jede Kachel *„Attrappe"* traegt.

`[read]` **Der Fehler war die Quelle, nicht die Suche.** In `TODO.md`
steht, was jemandem aufgefallen ist und aufgeschrieben wurde. **Ein
ganzes Modul mit Attrappen steht nicht drin, weil es niemand als Befund
notiert hat** — es ist ja kein Fehler, sondern unfertige Arbeit.

**Wer wissen will, was zu tun ist, sieht ins Produkt.** `TODO.md` sagt,
was schiefgegangen ist. `docs/spezifikation/00-MODULPLAN.md` sagt, was
gebaut werden soll. Die Liste allein sagt es nicht.

`[cmd]` **Der Beleg liegt unter `backup/bestand/00-toms-bildschirmfotos.md`**
— mit dem Bildinhalt als Text, damit ihn niemand ein zweites Mal
erfragen muss.

`[cmd]` **Und die Liste kann sogar das Gegenteil behaupten:** Recovery
zeigt auf jeder Kachel *„das Schema `recovery` gibt es noch nicht"*,
waehrend `recovery.checkins` 340 Zeilen hat, `recovery.scores` 340 und
`recovery.modality_log` 178 — und drei Lesefunktionen bereits darauf
zugreifen. **Der Banner war falsch, und er hat den Orchestrator
mitgetaeuscht.**

### Der Rohbericht gehoert ins Repo, der SSOT dem Orchestrator

**Tom, 2026-08-23:** *„diese berichte gehoeren sowieso protokolliert
ins repo."*

**Der Agent haengt seinen Bericht an die Punktdatei** — unter
`## Bericht`, roh und unbearbeitet. Der Orchestrator prueft ihn und
schreibt seine Abnahme darunter.

`[read]` **Berichtigt 2026-08-29 (A-61):** bis dahin lag er unter
`docs/berichte/`. **Auftrag, Bericht und Abnahme stehen jetzt in
derselben Datei.**

`[read]` **Das schaerft die Regel darueber, statt sie aufzuheben.** Ihr
Kern stimmt: der Agent schreibt nicht den SSOT — dort steht, was
**geprueft** ist. Sein Rohbericht ist etwas anderes: die
Selbstauskunft, **gegen die** geprueft wird. **Beides nebeneinander
zeigt, was behauptet wurde und was stimmte.**

`[cmd]` **Der Anlass war ein Verlust:** am 2026-08-23 kamen vier
Agentenberichte hintereinander als leerer Anhang an — in einem langen
Gespraech faellt Anhangsinhalt zuerst weg. Der Orchestrator hat C-235
abgenommen, indem er die 33 Zeilenzahlen selbst nachmass, ohne den
Bericht je gesehen zu haben.

`[read]` **Mit einer Datei im Repo waere das kein Problem gewesen** —
nachsehen statt raten. Und es bleibt nachlesbar, statt in einem Verlauf
zu verschwinden.

`docs/todo/` und `docs/ssot/` bleiben beim Orchestrator.

## Markdown nur ueber write_file

`[cmd]` **`edit_block` und `str_replace` zerstoeren Tabellen** —
Pipes gehen verloren, Zeilen verschmelzen.

**Vollstaendiger Inhalt, dann `git diff` zur Kontrolle.**

`[read]` **Und die Datei vorher einlesen, nicht aus dem Kontext
rekonstruieren.** `[cmd]` **Am 02.09. hat ein `UnicodeEncodeError`
`plan-lesen.ts` von 645 auf 119 Zeilen abgeschnitten** —
`io.open(...,"w")` leert die Datei sofort, der Fehler kam erst beim
Schreiben.

`[read]` **Wer ueber eine Nebendatei mit `os.replace` schreibt, hat
das Problem nicht.**

## Wer einen Namen sucht, sucht ihn mit Wortgrenze

`[cmd]` **Dreimal in fuenf Tagen hat derselbe Fehler eine Pruefung
gruen gehalten, die haette fallen muessen:**

    G-187  /daten\?\.wechselwirkungen/   traf auch ...wechselwirkungenX
    G-197  includes('community_anzeige')  traf auch community_anzeigeX
    G-201  includes(en)                   traefe auch note_en_alt

`[read]` **Der dritte Fall ist der, auf den es ankommt:** er stand im
Waechter **gegen** den ersten. Wer den Fehler kennt, macht ihn beim
naechsten Mal trotzdem — **das ist keine Frage der Aufmerksamkeit,
sondern eine Bauvorschrift.**

**Deshalb, ohne Ausnahme:**

- **Nie `includes` auf einer Zeichenkette**, wenn ein NAME gesucht
  wird. `[read]` Auf einem Feld ist es richtig (dort vergleicht es
  Elemente), auf einem Text luegt jeder laengere Name.
- **Nie ein unverankertes Muster** aus einem Namen bauen.
- **Stattdessen** eine der drei Formen:

```js
// 1. Zeichenklassen um den Namen (wirkt auch bei _ und Ziffern)
new RegExp(`(?<![a-z0-9_])${name}(?![a-z0-9_])`).test(text)

// 2. \b, wo der Name keine Unterstriche traegt
new RegExp(`\\b${name}\\b`).test(text)

// 3. exakter Vergleich, wo eine Liste vorliegt
liste.includes(name)   // Feld, nicht Zeichenkette — das ist in Ordnung
```

`[cmd]` **Gemessen am 2026-08-26 ueber alle 15 `tools/*-pruefen.mjs`:**
12 `includes`, davon **elf harmlos** (Schalter wie `--schreiben`,
Pfadteile wie `__tests__`, echte Felder) und **eines betroffen**
(`sprachrueckfall-pruefen.mjs:116`, behoben).

`[read]` **Ein Waechter dafuer waere Ueberbau** — bei einer Stelle
kostet er mehr, als er findet. **Die Regel steht hier, weil der
naechste Fall nicht in `tools/` entstehen wird, sondern in einem
Test.**

## Schreibregeln

- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom. Ein logischer Change pro Commit.
- Markdown nur mit vollständigem Inhalt schreiben, Datei vorher einlesen —
  Teil-Edits zerstören Tabellen, Rekonstruktion aus dem Gedächtnis hat
  schon Abschnitte verloren.
- **Markdown mit Sonderzeichen über das Datei-Werkzeug schreiben, nie über
  eine interaktive Python-Sitzung.** `[cmd]` Am 2026-08-23 hat der Weg über
  stdin einer PowerShell-Sitzung 78 doppelt kodierte Sequenzen in
  `TODO.md` und `ERLEDIGT.md` erzeugt und den Commit blockiert — dieselbe
  Sitzung schrieb die Uebersicht über das Datei-Werkzeug sauber. Der
  Python-Aufruf war korrekt (`encoding="utf-8"`); der Text kam bereits
  beschädigt an. Hergang: `docs/ssot/32-encoding-schaeden.md`.
- Aussagen über den Ist-Zustand tragen `[cmd]`, `[read]` oder `[annahme]` —
  Details in `docs/spezifikation/10-plattform/konventionen/`.
- Nie gegen die laufende Datenbank testen; Wegwerf-Datenbank, danach
  verwerfen. Strukturelle Live-Änderungen nur nach Freigabe.
- **`docs/specs/` und `docs/BrainstormDocs/` sind Datenquelle, nie
  Current Truth.** Sie beschreiben teils eine Vorgänger-Codebasis. Wer an
  einem Modul arbeitet, liest den zugehörigen Altbestand **mit** — er
  enthält getroffene Produktentscheidungen, die sonst zweimal getroffen
  werden. Verbindlich wird ein Inhalt erst, wenn er besprochen und nach
  `docs/spezifikation/` (Soll) oder `docs/ssot/` (Ist) übernommen ist.
  Ablauf und Stand: `docs/spezifikation/00-KONSOLIDIERUNG.md`.
- In `docs/specs/` wird nicht geschrieben — einzige Ausnahme ist ein
  Statusvermerk im Kopf, der auf das Konsolidierungsregister zeigt.
- Bei Unsicherheit: im Repo nachsehen, nicht raten.


---

## Altlasten

Die frühere Governance-Maschinerie ist archiviert (`_archive/governance/`,
Regeln im dortigen README) bzw. in ein eigenes Repo umgezogen.
**Die Wurzel ist seit 2026-08-06 (A-10) geräumt:** `COMMANDS.md`,
`SESSION_ONBOARDING.md`, `STACK_REFERENCE.md` und `CLAUDE.md.v1.bak`
liegen jetzt unter `_archive/governance/wurzel-altlast/` (mit README, das
je Datei nennt, warum). `project.profile.json` ist bereits früher
entfallen.
**`AGENTS.md` bleibt bewusst im Wurzelverzeichnis** — sie ist keine
Altlast mehr, sondern der Einstiegspunkt für Agenten-Werkzeuge
(lean-ctx-Block, Verweis auf `CLAUDE.md`); mehrere Werkzeuge lesen sie von
sich aus. Wenn Tom nach Governance fragt: das gehört ins Governance-Repo,
nicht hierher.

---
