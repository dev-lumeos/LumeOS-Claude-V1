# Auftraege

## Keine Ursachenvermutung im Auftrag

Tom, 2026-09-08: *,,wie waers, wenn du das raten weglaesst und die
tokens sparst und einfach den agenten arbeiten laesst?"*

`[cmd]` **An einem Tag vier Auftraege mit einer vermuteten
Ursache ? alle vier widerlegt:**

    G-413  "ersterLauf blockiert den Filter"   falsch
           "start ist ungefiltert"             falsch
    G-421  "vier Reiter fehlen"                falsch,
           es waren Umbenennungen
    C-462  "vier Tabellen fehlen"              falsch,
           drei gab es unter anderem Namen

`[read]` **Der Agent misst die Vermutung, widerlegt sie, und
schreibt das in den Bericht** ? **Arbeit, die niemand
gebraucht hat.**

`[read]` **Und schlimmer: eine falsche Ursache im Auftrag lenkt.**
`[cmd]` **G-413 hat zuerst genau dort gemessen, wo ich gezeigt
habe** ? **die echte Ursache lag im Konto.**

### Was in einen Auftrag gehoert

    Was Tom sieht oder will   woertlich
    Wo die Vorlage steht      Pfad, Zeile
    Was gemessen IST          nur mit [cmd] und nur,
                              was ich selbst gemessen habe
    Was nicht angefasst wird  Bereiche, Dev-Server
    Abnahmebedingungen        was belegt sein muss

### Was NICHT hineingehoert

`[read]` **Die vermutete Ursache.**

`[read]` **Zeilennummern als *,,der Verdacht liegt hier"*** ?
**ein Hinweis, wo etwas STEHT, ist in Ordnung; ein Hinweis,
warum es falsch ist, nicht.**

`[read]` **Zahlen aus Werkzeugen, die ich nicht nachgemessen
habe** ? `vollstaendigkeit.mjs` **misst NAMEN, nicht Bestand.**

`[read]` **Und keine Loesung** ? **wer die Loesung in den Auftrag
schreibt, bekommt sie gebaut, auch wenn sie falsch ist.**

### Warum das gilt

`[read]` **Der Agent ist am Code, der Orchestrator ist es
nicht.**

`[cmd]` **Fuenfmal an einem Tag hat der Orchestrator einen Namen
geraten** ? `scores`, `lab_result_values`, `modality_log`,
`body`, `CompositionTab`.

`[read]` **Jedes Mal hat ein Agent es aufgefangen.**

`[read]` **Das ist die richtige Rollenverteilung ? aber sie
kostet einen Durchlauf, den man sparen kann.**

## Vor jedem Auftrag: die Punkte durchsuchen

Tom, 2026-09-08: *,,und wieso passiert sowas? beschaeftigungs-
therapie, weil du nicht sauber recherchierst?"*

`[cmd]` **C-469: der Auftrag verlangte 26 Formeln.**

`[cmd]` **21 existierten. Fuenf waren ENTSCHIEDEN:**

    ACWR, calcTrainingLoadScore
      -> C-181, abgenommen, acwr_decision = implement:no
    MODALITY_BONUS, MAX_DAILY_BONUS, calcModalityBonus
      -> C-167, die Werte sind unbelegte Entwurfswerte

`[read]` **Beide Punkte lagen im Repo. Beide hatte der
Orchestrator am selben Tag gelesen.**

`[cmd]` **Eine Suche nach `ACWR` haette C-181 gefunden** ? **zwei
Minuten gegen zwanzig Minuten Agentenzeit.**

### Dasselbe Muster, vier Mal an einem Tag

    C-462   vier Tabellen "fehlen"   drei unter anderem Namen
    G-421   vier Reiter "fehlen"     alles Umbenennungen
    C-468   "zwei Ebenen"            es sind vier
    C-469   26 Formeln "fehlen"      21 da, 5 entschieden

`[read]` **Immer dieselbe Quelle: ein Werkzeug zaehlt NAMEN, der
Orchestrator liest das Ergebnis als BESTAND.**

### Die Regel

    Vor jedem Auftrag: jeden genannten Namen in
    docs/punkte/ suchen.

    Ein Treffer in erledigt/ heisst: es gibt eine
    Entscheidung. Sie gilt.

    Ein Treffer in todos/ heisst: die Frage ist bekannt
    und offen. Sie gehoert in den Auftrag.

`[cmd]` **`git grep -l "<Name>" -- docs/punkte/`** ? **ein
Aufruf.**

`[read]` **Und wenn ein Werkzeug eine Zahl nennt: die Zahl
NICHT in den Auftrag schreiben, ohne zwei Stichproben davon
selbst geprueft zu haben.**

`[cmd]` **`vollstaendigkeit.mjs` misst Namen. `104-muskelkarte.md`
zaehlt Muskeln, nicht Pfade. `pg_stat_user_tables` ist
veraltet.**

`[read]` **Drei Werkzeuge, drei Fallen, alle an einem Tag
zugeschnappt.**

## Vor jedem Auftrag: `/clear` ja oder nein

Tom, 2026-09-08: *,,ok, von jetzt an sagst du mir vor dem auftrag,
ob ich /clear machen muss."*

**Die Ansage gehoert AN TOM, VOR den Auftragstext** ? **NICHT
in den Codeblock.**

`[cmd]` **2026-09-08 falsch gemacht:** **`/clear NEIN` stand als
erste Zeile IM Auftrag.**

`[read]` **Claude Code liest das als Anweisung an sich selbst** ?
**und weiss nicht, was er damit soll.**

**Richtig:**

    Orchestrator an Tom, vor dem Codeblock:
      "Kein /clear -- er kommt direkt aus G-423."
      oder
      "Mach /clear -- neues Modul."

    Im Codeblock steht NICHTS davon.

`[read]` **Der Auftrag enthaelt nur, was der Agent tun soll.**

### Wann NEIN

`[read]` **Der Auftrag liegt im selben Modul wie der vorige.**

`[read]` **Oder er baut auf einer Messung auf, die der Agent
gerade gemacht hat** ? **dann waere ein `/clear` teurer, weil er
sie wiederholen muesste.**

`[cmd]` **Beispiel: G-423 (Injektionskonfiguration) -> G-389
(Injektion erfassen)** ? **dieselben Tabellen, dieselben
Funktionen.**

### Wann JA

`[read]` **Der Gegenstand wechselt** ? **von Supplements nach
Coach, von der Datenbank in die Oberflaeche.**

`[read]` **Oder der Kontext ist lang und der neue Auftrag braucht
nichts davon.**

**Und dann gehoert der Wiedereinstieg mit in den Auftrag:**

    Lies zuerst docs/sessions/<datum>-uebergabe.md und
    docs/lehren/ -- besonders auftraege.md, messen.md
    und werkzeuge.md.

### Was ein `/clear` KOSTET

`[read]` **Der Agent verliert, was er selbst gelernt hat** ?
**nicht nur, was in den Punktdateien steht.**

`[cmd]` **2026-09-08, Claude Code an einem Tag:** **die
Konstanten-Falle (`'use client'` zieht `next/headers` mit), die
Bildpunkt-Messung statt Vermutung, die Gegenprobe in beide
Richtungen.**

`[read]` **Das steht in seinen Skill-Dateien** ? **aber der
Zusammenhang, in dem es galt, nicht.**

