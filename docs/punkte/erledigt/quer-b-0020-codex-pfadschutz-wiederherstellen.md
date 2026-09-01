---
nr: B-20
typ: blocker
modul: quer
schwere: hoch
angelegt: 2026-08-06
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-01
erledigt: 2026-09-01
commit: 4a2bd5df
beruehrt:
  tabellen: []
  dateien: ["supabase/config.toml"]
zahlen: null
---

# B-20 - Codex-Pfadschutz wiederherstellen

## Befund

(neu 2026-08-06) —
  **Vorarbeit erledigt 2026-08-13 (Block 25), Einhängen bewusst NICHT
  ausgeführt.** Seit B-15 hat Codex keinen Pfadschutz; vorher einen, der
  bei jedem Aufruf am Parser scheiterte — Wirkung null, die Absicht
  bestand.

  **Warum nicht einfach einhängen:** `[cmd]` 2026-08-13 an
  `protect-paths.ps1` gemessen — bei **leerer oder unlesbarer Eingabe
  `exit 0`**, also fail-open. Liefert Codex kein stdin-JSON, steht danach
  eine Konfiguration da, die aussieht wie Schutz und keiner ist. *Das
  wäre schlechter als der heutige Zustand, weil niemand mehr nachsieht.*
  `[annahme]` bleibt deshalb bestehen, bis gemessen: was übergibt Codex?

  **Das Messwerkzeug liegt fertig** —
  `scratchpad/codex-sonde.ps1` (im Sitzungs-Scratchpad, **nicht** in
  `.codex/`): ein Hook, der nichts blockiert und nur mitschreibt, was er
  bekommt (stdin, `args`, Umgebungsvariablen). `[cmd]` Gegen eine
  Testeingabe geprüft, er zeichnet korrekt auf.
  **Nicht eingehängt, weil `.codex/hooks.json` Toms laufende Sitzung
  steuert** — eine kaputte Hook-Konfiguration legt sie lahm.
  Vorgehen, wenn Tom es will: Sonde als dritten `PreToolUse`-Eintrag mit
  Matcher `.*` eintragen, ein paar Aufrufe machen, `%TEMP%\codex-hook-sonde.log`
  lesen, Eintrag wieder entfernen.

  **Was `.codex/hooks.json` heute enthält** `[cmd]`: zwei lean-ctx-Hooks
  (`Bash|bash` → rewrite, eine lange Namensliste → redirect). Codex führt
  Hooks also aus. Die vielen Namensvarianten im Matcher
  (`Read|read|ReadFile|read_file|View|view|…`) sind selbst ein Hinweis:
  wer das schrieb, war sich über Codex' Werkzeugnamen ebenfalls nicht
  sicher.

  **Preis eines Wrappers**, falls die Sonde `param()`-Argumente zeigt:
  eine zusätzliche Datei, die Argumente nach stdin-JSON umformt, plus
  eine zweite Namenszuordnung (Codex-Werkzeugnamen → `Write`/`Edit`/
  `Read`/`Bash`). Zwei Stellen, die auseinanderlaufen können, für einen
  Schutz, der `[cmd]` schon in Claude Code benannte Lücken hat
  (Heredocs, Variablen-Indirektion, Interpreter-Einzeiler). Vertretbar,
  aber keine Kleinigkeit — deshalb erst messen.

  **Die drei ungeschützten Pfade, unverändert offen** `[cmd]` alle drei
  existieren, keiner ist in `protect-paths.ps1` abgedeckt:
  `supabase/config.toml`, `db/migrations/`, `.claude/rules/`.
  *Nebenbefund:* `db/migrations/` trägt genau eine SQL-Datei vom
  2026-04-23 aus der Governance-Ära; die lebende Kette liegt unter
  `supabase/`. Ob der Pfad überhaupt noch geschützt werden muss oder
  eher archiviert gehört, ist ungeklärt.

## Auftrag

**Mitbeauftragt mit C-318 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `server.py neustart`, kein `start`, kein
`aufraeumen`.** `[read]` **Wenn eine Messung ihn braucht: melden,
nicht starten.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-01, Orchestrator.**

### A-23 — eingerichtet, und der Gate ist jetzt ehrlich rot

`[cmd]` **`.eslintrc.json` mit `next/core-web-vitals`, ESLint 8.57.1
und `eslint-config-next` 14.2.35 fest installiert.** `[cmd]` **Keine
Rueckfrage mehr.**

`[cmd]` **Admin Exit 0, Web 18 echte Fehler und 3 Warnungen, Coach 1
Fehler.**

`[cmd]` **Der Gate erreicht Lint und wird deshalb rot — 22 statt 15
Teilschritte.**

`[read]` **Das ist der richtige Zustand.** **Ein Gate, das gruen ist,
weil ein Schritt nicht laeuft, war das halbe Gruen aus G-303.**
`[read]` **Jetzt ist er rot, weil etwas kaputt ist** — **und das ist
messbar besser.**

`[cmd]` **Und die Builds linten nicht doppelt** — Coach-Build sagt
ausdruecklich *,,Skipping linting"*.

**Die 19 Fehler gehen als G-312.**

### B-20 — offen, nicht gegenstandslos

`[cmd]` **`.codex/hooks.json` existiert und ist getrackt** — **aber
es enthaelt nur die zwei `lean-ctx`-Hooks, keinen Pfadschutz.**
`[cmd]` **Der Claude-Hook schuetzt Codex nicht.**

`[cmd]` **Die Ziele existieren weiter:** `supabase/config.toml`,
`db/migrations/` (2 Dateien), `.claude/rules/` (7 Dateien).

`[read]` **Und seine Bedingung ist die richtige:** *,,vor einem
Schutzbau braucht es die harmlose Payload-Sonde; ohne ihr
Eingabeformat waere ein Hook nur scheinbarer Schutz."*

`[read]` **Ein Waechter, der nicht weiss, was er bekommt, prueft
nichts** — dieselbe Klasse, die heute achtmal auffiel.

### C-379 — die Spalte ist da, der Schreiber fehlt

`[cmd]` **`next_plan_id` steht live, mit Ziel- und
Selbstreferenz-Constraint.**

`[cmd]` **Kein Schreiber:** beide Web-Schreibschemata lassen sie
nicht zu, der Aktivierungsdialog bietet nur `once` und `rollover`,
**live 0 `sequence`-Plaene.**

`[read]` **Und der Widerspruch ist benannt:** die Spec fordert
automatische Uebergabe, **C-373 bevorzugt die manuelle Auswahl.**

### Und der zweite falsche Verweis von mir heute

`[cmd]` **Er meldet: E-31 betrifft Referenzbewertungen, nicht
Meal-Plan-Lebenszyklen.**

`[cmd]` **Nachgemessen: E-31 ist *zwei Wahrheiten messen statt
anbinden*, vom 29.08.**

`[read]` **Nach E-03 fuer BLS der zweite an einem Tag.** `[cmd]`
**Als E-44 angelegt, die Verweise berichtigt.**

`[cmd]` **Und ein Nebenbefund: der Lifecycle-Test ist rot**, weil
seine Annahme ueber ausschliesslich alte Nullwerte nicht mehr zum
Bestand passt. **Als G-313.**

**Abgenommen.**


## Neu gemessen, 2026-08-31

`[cmd]` **Codex hat keinen verifizierten Pfadschutz.** `[read]` **Der
Punkt bleibt offen und ist damit belegt statt vermutet.**

## Auftrag — Werkzeugschaeden

**Mitbeauftragt: A-23, C-379.** Bericht in diese Datei.

**Beauftragt am 2026-09-01.**

### 1 · A-23 — Lint scheitert an der Ersteinrichtung

`[cmd]` **Du hast es gerade gemessen:** `pnpm lint` scheitert in Web,
Admin und Coach **an der interaktiven ESLint-Ersteinrichtung.**
`[cmd]` **UI-, Shared- und Root-Typecheck sind gruen — G-308 loeste
eine andere Ursache.**

`[read]` **Ein Befehl, der nach Eingaben fragt, laeuft in keinem
Gate.** **Bau die Einrichtung fest, oder sag, warum Lint nicht in den
Gate gehoert.**

`[cmd]` **Der Gate fuehrt 15 Aufgaben** — `lint` ist keine davon.

### 2 · B-20 — Codex-Pfadschutz

`[read]` **Miss zuerst, was der Schutz war und ob er fehlt.**
`[cmd]` **Der Punkt ist aelter als die Punktverwaltung**, und
`.codex/` steht in `CLAUDE.md` unter *nicht als Referenz lesen*.

`[read]` **Wenn er an einer Stelle liegt, die es nicht mehr gibt:
schliessen.** **Wenn er fehlt und gebraucht wird: sagen, wofuer.**

### 3 · C-379 — `sequence` ohne Folgeplan

`[cmd]` **`meal_plans` hat keine Spalte fuer den Folgeplan.**
`[cmd]` **`sequence` ist waehlbar und tut dasselbe wie `once`.**

`[cmd]` **E-31 sagt: `sequence` uebergibt an den naechsten.**
`[cmd]` **`next_plan_id` steht im Schema** — **es gibt keinen Weg,
sie zu setzen.**

`[read]` **Miss, was fehlt.** `[read]` **Und melde, ob eine Kette
ueberhaupt gebaut werden soll** — Claude Code hat es als *,,reicht,
solange keine Kette gebaut wird"* eingeordnet.

### Der Zusatzbefund aus A-22

`[cmd]` **Du hast gemeldet: die BLS-Regel steht in
`ADR_BLS_ONLY`, `docs/entscheidungen/E-43` behandelt
Recovery/Soreness.** `[read]` **Ich habe E-43 mehrfach als
BLS-Entscheidung zitiert — die Sachregel stimmt, die Kennung nicht.**

`[read]` **Das ist ein Doku-Befund und gehoert dem Orchestrator.**
**Nimm ihn nicht mit auf.**

### Was nicht zu tun ist

**Keine ESLint-Regeln aendern** — nur die Einrichtung.
`apps/` nicht anfassen, ausser es geht um die Einrichtungsdatei.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    pnpm lint         laeuft ohne Rueckfrage? Exit
    Gate              soll lint hinein? begruendet
    B-20              vorhanden / fehlt / gegenstandslos
    next_plan_id      was fehlt zum Setzen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
