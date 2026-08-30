# G-200 + G-201 — Der Unterschied war ein Zeichenbereich

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-26**

---

## Kurz

**G-200 ist geschlossen, nicht nur benannt.** Die Frage *„was
unterscheidet die zwei von den anderen 87"* hatte eine Antwort in vier
Messungen — **und die Antwort war schliessbar.**

`[cmd]` **Der Waechter findet jetzt 6 von 6**, quer durch fuenf Module,
Tabellen und Datenbankfunktionen.

**G-201: eine betroffene Stelle, nicht zwanzig.** Also die Regel nach
`CLAUDE.md` und die eine Stelle gerichtet — **kein Waechter.**

---

## 1 · G-200 — was die zwei von den 87 unterschied

**Auftrag: *„Miss die Faelle gegeneinander, statt den Waechter weiter
zu aendern."*** `[read]` **Das war der richtige Schnitt.** Vier
Proben haben gereicht; zehn weitere Waechter-Aenderungen haetten es
nicht gebracht.

### Die Messung

`[cmd]` **Erst gegeneinander gehalten**, mit `--warum`:

| Sabotage | `verdrahtet` | Waechter |
|---|---|---|
| `community_anzeige` → `…X` | **false** | gruen |
| `supplement_interactions` → `…Y` | **false** | gruen |
| `exercises` → `exercises_neu` | **true** | **rot** |

`[read]` **Damit war die Frage praeziser:** die zwei wurden nicht
*„falsch beurteilt"* — **sie kamen in der Liste gar nicht vor.**

### Vier Proben, je eine Groesse geaendert

`[cmd]` Um Datei und Namensform zu trennen:

| Probe | gefunden |
|---|---|
| neuer Name in `uebungen-read.ts` | **ja** |
| **derselbe** neue Name in `substanz-read.ts` | **ja** |
| `exercisesX` in `uebungen-read.ts` | **nein** |
| `community_anzeige_neu` in `substanz-read.ts` | **ja** |

`[read]` **Die Datei ist gleichgueltig. Es ist die Namensform.**

### Die Ursache

`[cmd]` Das Suchmuster hiess `[a-z_][a-z0-9_]*` — **nur
Kleinbuchstaben.** Bei `.from('community_anzeigeX')` bricht die
Zeichenklasse am `X` ab, das schliessende `'` passt nicht mehr, **und
der ganze Treffer entfaellt.**

    .from('community_anzeigeX')   ->  []
    .from('exercises_neu')        ->  ['exercises_neu']
    .from('exercisesX')           ->  []

`[read]` **Der Name wurde nicht als unbekannt gemeldet — er wurde nie
gesehen.** Ein Waechter, der seinen Gegenstand nicht findet, meldet
*„alles in Ordnung"* ueber etwas, das er nie angesehen hat. **Das ist
schlimmer als kein Waechter.**

`[cmd]` **Dieselbe Luecke stand an zwei Stellen:** im Suchmuster und in
der Wortgrenzen-Zeichenklasse von `alsGanzes`. Beide auf `A-Za-z0-9_`
gebracht.

### Warum keine benannte Luecke noetig war

`[read]` **Der Auftrag liess sie zu, falls ich den Unterschied finde,
aber nicht schliessen kann.** `[cmd]` **Er war schliessbar** — es war
ein Zeichenbereich, keine strukturelle Grenze. **Eine Ausnahme
einzutragen waere hier das Falsche gewesen.**

### Der Nachweis

`[cmd]` **Sechs Sabotagen, keine davon namentlich im Waechter:**

| Fall | Modul | |
|---|---|---|
| `community_anzeige` → `…X` | Supplements | **rot** |
| `supplement_interactions` → `…Y` | Supplements | **rot** |
| `exercises` → `exercisesQ` | Training | **rot** |
| `daily_summary` → `daily_summaryZ` | Nutrition | **rot** |
| `scores` → `scoresAbc` | Recovery | **rot** |
| **RPC** `rule_assessment` → `…X` | Supplements | **rot** |

**6 von 6**, Rueckbau je byteidentisch.

`[cmd]` **Und die Gegenprobe auf die Diagnose selbst:** dieselbe
Sabotage stehen lassen und **nur die Zeichenklasse zurueckdrehen** —
der Waechter wird wieder blind (`exit=0`). **Damit ist die Ursache
belegt, nicht nur begleitet.**

---

## 2 · G-201 — eine Stelle, kein Waechter

**Auftrag: *„Miss zuerst, wie viele Stellen betroffen waeren. Sind es
zwei, ist ein Waechter Ueberbau."***

`[cmd]` **Gemessen ueber alle 15 `tools/*-pruefen.mjs`:** 12
`includes`, 12 `indexOf`, **0 unverankerte `new RegExp`.**

`[cmd]` **Davon sind elf harmlos:**

    process.argv.includes('--schreiben')     Schalter
    p.includes('__tests__')                  Pfadteil
    rettbar.includes(spalte)                 FELD, kein Text
    ['with','context',…].includes(w)         Feld

`[read]` **Auf einem Feld ist `includes` richtig** — es vergleicht
Elemente, nicht Teilstrings. **Gefaehrlich ist es nur auf einer
Zeichenkette.**

`[cmd]` **Genau eine Stelle war betroffen:**
`sprachrueckfall-pruefen.mjs:116` — `auswahl.includes(en)` sucht einen
Spaltennamen in einer `.select()`-Zeichenkette. **`note_en` haette auch
`note_en_alt` getroffen** und einen Rueckfall gemeldet, den es nicht
gibt.

**Behoben mit derselben Form wie im Waechter.** `[cmd]` Ergebnis
unveraendert: 12 Abfragen, 0 ohne Rueckfall — **die Aenderung schliesst
ein Loch, ohne das Urteil zu verschieben.**

`[read]` **Kein Waechter.** Bei einer Stelle kostet er mehr, als er
findet — **und die Regel steht jetzt in `CLAUDE.md`, weil der naechste
Fall nicht in `tools/` entstehen wird, sondern in einem Test.**

`[read]` **Deine Pointe hat den Ausschlag gegeben:** ein Waechter gegen
unverankerte Muster, der selbst eines benutzt, waere die dritte
Auflage desselben Fehlers. **Bei einer betroffenen Stelle ist das
Risiko groesser als der Nutzen.**

---

## 3 · Was ich melden muss: der Dev-Server ist aus

`[cmd]` **PID 351936 laeuft nicht mehr.** `python tools/server.py
status` meldet *„keiner laeuft"*; 3210 und 3220 stehen unberuehrt.

`[cmd]` **Ich habe `server.py` in dieser Sitzung nicht aufgerufen** und
`.next` nicht angefasst. `[cmd]` Das Log endet ohne Fehlermeldung, mit
gewoehnlichen Neuuebersetzungen — **jede meiner Sabotagen und jeder
Rueckbau hat eine ausgeloest**, sechs Faelle mal zwei Schreibvorgaenge
plus die Selbstprobe.

`[read]` **Wahrscheinlichste Ursache: der Speicher.** Er stand zuletzt
bei **1598 MB** und ist in dieser Sitzung von 1377 auf 1598 gestiegen.
`[read]` **Beweisen kann ich es nicht** — das Log sagt nichts.

**Ich habe ihn NICHT neu gestartet**, weil der Auftrag es ausdruecklich
untersagt. `[cmd]` `python tools/server.py start` genuegt.

`[read]` **Und ein Hinweis fuer kuenftige Auftraege dieser Art:** wer
Verdrahtung sabotiert, schreibt in `apps/web/src` — **das laesst den
Dev-Server bei jedem Schritt neu uebersetzen.** Fuer eine Probe mit
sechs Faellen sind das zwoelf Uebersetzungen.

---

## 4 · Pruefungen

| Pruefung | Ergebnis |
|---|---|
| volle Testreihe | **663 pass, 0 fail** |
| `tools/verdrahtung-pruefen.mjs` | 89 Namen, kein Zuwachs |
| `tools/sprachrueckfall-pruefen.mjs` | 12 Abfragen, 0 ohne Rueckfall |
| `tools/ladekette-pruefen.mjs` | 13 Seiten, keine ueber 3 |
| `tools/serverimport-pruefen.mjs` | 51 Chunks, 0 Treffer |
| `tools/encoding-pruefen.mjs` | 20.068 Dateien, sauber |
| `pnpm --filter @lumeos/web build` | Compiled successfully, 31/31 |

**Kein Produktcode angefasst** — nur `tools/` und `CLAUDE.md`.
**Die fuenf Einzelwaechter stehen unveraendert.**
**`supabase/_pipeline/` nicht angefasst** (C-289, Codex).
**Nicht committet, nicht gestaged.**

---

## 5 · Befunde

**a) G-200 ist geschlossen.** Keine benannte Luecke noetig — der
Unterschied war ein Zeichenbereich, und der liess sich beheben.

**b) Die Fehlerklasse hat jetzt drei Auflagen** (G-187, G-197, G-201)
und **eine vierte in derselben Datei**: das Suchmuster und die
Wortgrenze im Verdrahtungswaechter trugen beide `[a-z]`. `[read]`
**Das bestaetigt die Einordnung von gestern** — nicht durch
Aufmerksamkeit vermeidbar, deshalb jetzt eine Regel in `CLAUDE.md`.

**c) Ob die fuenf Einzelwaechter jetzt entfallen koennen, ist eine
eigene Entscheidung.** `[cmd]` Der Sammelwaechter deckt **Tabellen,
Sichten und RPC**. `[read]` **Er deckt NICHT**, was G-184 und G-191
gefunden haben — eine Eigenschaft, die an `undefined` haengt, und eine
Funktion ohne Aufrufer. **Sie stehen zu Recht.**

---

## Geaenderte Dateien

| Datei | Was |
|---|---|
| `tools/verdrahtung-pruefen.mjs` | Zeichenbereich an zwei Stellen, mit Begruendung |
| `tools/sprachrueckfall-pruefen.mjs` | die eine betroffene Stelle mit Wortgrenze |
| `CLAUDE.md` | neue Regel *„Wer einen Namen sucht, sucht ihn mit Wortgrenze"* |
