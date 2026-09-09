---
nr: G-394
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-392
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/shell.tsx
zahlen:
  gemessen: 2026-09-08
  ohne_ladezustand: 6
---

# G-394 — sechs Module ohne Ladezustand

## Befund

Aus G-392, Claude Code, 2026-09-08.

`[cmd]` **Nur `supplements` hat eine `loading.tsx`** ? **neun
Module geprueft.**

`[cmd]` **Gemessen am 2026-08-25: die Seite braucht 1,9 bis 2,9 s
bis `networkidle`** ? **in dieser Zeit sieht der Nutzer die ALTE
Seite und einen wartenden Browser.**

`[read]` **Es sieht aus, als haette der Klick nicht gewirkt.**

## Und jetzt ist der Weg frei

`[read]` **Vor G-392 haette ein Skelett die Hydration zerlegt** ?
**das ist jetzt belegt, nicht vermutet.**

`[cmd]` **Der Anker der Schale liegt vor der Suspense-Grenze**
(`shell.tsx:153`, Zeichen 1.560 gegen 10.860).

> *,,Wer das naechste baut, braucht den Anker der Schale."*

## Was zu tun ist

`[read]` **Je Modul eine `loading.tsx`, die dem echten Aufbau
folgt** ? **`supplements/loading.tsx` ist die Vorlage.**

`[cmd]` **Ihr Kommentar sagt, warum:** *,,Ein Skelett, das anders
aussieht als das Ergebnis, ist schlimmer als keines ? der Inhalt
springt beim Eintreffen."*

`[read]` **Und kein Schimmern** ? **bei zwei Sekunden ist eine
Animation eher Unruhe als Auskunft.**

## Die sechs

    dashboard   goals   medical
    nutrition   recovery   training

`[read]` **`coach` und `settings` haben andere Koepfe** ? **erst
messen, ob dieselbe Vorlage passt.**
