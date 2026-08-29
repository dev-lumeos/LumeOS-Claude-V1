---
nr: G-254
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-11
entscheidung: null
beruehrt:
  tabellen: [coach.pending_actions]
  dateien: [apps/web/src/app/v2/nutrition/ansicht.tsx]
zahlen: null
---

# G-254 — sechs Kacheln brauchen eine Entscheidung

## Befund

Aus G-11, Claude Code, 2026-08-29. **Bewusst nicht gebaut.**

`[read]` **Vier Kacheln im Diary, zwei in Plans.** `[read]` **Je
Kachel dieselbe Frage: woraus soll die Zahl entstehen?**

`[read]` **Der Bericht nennt drei Beispiele, und sie zeigen, dass es
keine Bauentscheidung ist:** *,,was ist ein Vorschlag, was misst ein
Score, was ist ein *ghost entry*."*

## Berichtigung, 2026-08-29

`[read]` **Ich hatte Tom diesen Punkt vorgelegt, aber nur den einen
Fall beschrieben, der darin steht.** Seine Antwort *,,funktion die
liefert"* **galt Pending actions, nicht den sechs Kacheln.**

`[cmd]` **Pending actions ist als G-258 herausgeloest und mit E-29
entschieden.** **Dieser Punkt bleibt offen fuer die fuenf
uebrigen** — vier im Diary, eine in Plans, **und keine davon hat Tom
je gesehen.**

`[read]` **Vor der naechsten Vorlage: je Kachel benennen, welche es
ist und woraus die Zahl entstehen soll.** **Eine Sammelfrage ist
keine Frage.**

## Der Fall, der herausgeloest wurde

`[cmd]` ***,,Pending actions"* — `coach.pending_actions` existiert
und traegt Zeilen.**

`[read]` **Die Frage ist keine Datenfrage, sondern eine
Modulgrenze:** darf das Tagebuch aus dem Coach-Modul lesen?

`[read]` **Und sie hat eine Vorgeschichte:** `SICHERHEIT.md` fuehrt
die Nachvollziehbarkeit des Coach-Zugriffs als offenen Punkt, und
`coach` hat drei Aenderungsprotokolle. **Wenn Nutrition dort liest,
gilt die Frage in beide Richtungen.**

## Was nicht entschieden werden muss

`[read]` ***,,Micronutrient trend"* im Insights-Reiter ist gestrichen,
nicht offen** — der Nutrients-Reiter zeigt dasselbe je Naehrstoff,
und eine zweite Fassung waere die Doppelung, die aus G-249 und G-11
gerade zweimal entfernt wurde.
