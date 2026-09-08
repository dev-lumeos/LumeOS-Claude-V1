---
nr: C-430
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-152
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [public.activity_stream]
zahlen:
  gemessen: 2026-09-08
  sprachen: 1
---

# C-430 — die Sicht traegt nur Deutsch

## Befund

Aus G-152, Claude Code, 2026-09-08. **Nachgemessen.**

`[cmd]` **`public.activity_stream` traegt `summary_de`, sonst
keine Sprachspalte.**

`[cmd]` **Und der deutsche Text steht als Zeichenkette IN der
Sichtdefinition:** `'Mahlzeit erfasst: '`, `'Abendessen'`.

`[cmd]` **`supplement_evidence` traegt `_de`, `_en`, `_th`** —
**die Sicht ist der Ausreisser.**

`[read]` **Die App ist dreisprachig** (DE/EN/TH) — **der
Aktivitaetsstrom ist es nicht.**

## Warum es zaehlt

`[cmd]` **C-420 hat gezeigt, was Einsprachigkeit anrichtet:** **der
Mockup-Waechter meldete 170 fehlende Elemente, 11 fehlten
wirklich** — **weil er `Muscle readiness` gegen
`Muskelbereitschaft` verglich.**

`[read]` **Hier ist es umgekehrt: die Daten sind deutsch, die
Oberflaeche kann drei Sprachen.**

## Die Regel steht schon fest

**Berichtigung 2026-09-08.** `[read]` **Der Orchestrator hat zwei
Wege zur Wahl gestellt, obwohl die Konvention entschieden ist.**

`[cmd]` **`docs/spezifikation/10-plattform/konventionen/
00-konventionen.md`, Abschnitt 1:**

> Nutzeroberflaeche mehrsprachig ? Deutsch, Englisch, Thai; das
> Datenmodell fuehrt Sprachvarianten als Spalten (`name_de`,
> `name_en`, `name_th`).

Tom, 2026-09-08: *,,ist es eine datenbankabfrage? dann in der db
loesen. ist es eine bezeichnung oder sonst was das im code als
variable steht, dann i18n."*

`[read]` **Der Aktivitaetsstrom ist eine Datenbankabfrage** —
**also drei Spalten.**

## Zu bauen

`[cmd]` **`summary_de`, `summary_en`, `summary_th` in der Sicht.**

`[cmd]` **`supplement_evidence` macht es bereits so** — **die
Sicht ist der Ausreisser, nicht das Vorbild.**

`[read]` **Die deutschen Zeichenketten in der Sichtdefinition
werden zu drei Faellen je Ereignisart** — `'Mahlzeit erfasst: '`
neben `'Meal logged: '` und der thailaendischen Fassung.

`[read]` **Und die Oberflaeche waehlt die Spalte nach der
eingestellten Sprache** — **wie ueberall sonst.**

## Auftrag

**Mitbeauftragt mit C-429 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.
