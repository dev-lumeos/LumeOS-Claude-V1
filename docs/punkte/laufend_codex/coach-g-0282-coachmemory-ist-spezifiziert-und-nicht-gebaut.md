---
nr: G-282
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-112
entscheidung: null
agent: codex
beauftragt: 2026-09-01
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-08-30
---

# G-282 — CoachMemory ist spezifiziert und nicht gebaut

## Befund

Aus C-112, gegen die Spec geprueft 2026-08-30.

`[cmd]` **`CoachMemory` steht in
`docs/specs/BuddyandAICoach/SPEC_02_ENTITIES.md` und `SPEC_10`** —
als Entitaet, mit Feldern.

`[cmd]` **Keine Tabelle in der Datenbank.**

`[read]` **C-112 nannte es *,,der Kern fehlt"*.** **Richtig, aber es
ist eine Bauaufgabe, keine Entscheidung** — die Struktur ist
beschrieben.

## Was vorher zu klaeren ist

`[cmd]` **`coach-buddy-killer-feature.md` Kapitel 17 heisst *Coach
Memory (Structured, nicht freie Magie)*** mit **17.1 Memory Types**
und **17.2 Memory Fields (Spec-Level)**.

`[read]` **Und C-112 nennt einen Widerspruch:** der Vorgaenger hat
**vier parallele Gedaechtnismodelle**, ein Konsolidierungsvorschlag
steht im Entwurf. **Welches gilt, ist zu messen, bevor gebaut wird.**

`[read]` **Und das Vergessen gehoert dazu:** `[cmd]` C-112 nennt
*,,append-only-Log gegen DSGVO"*. `[cmd]` **Kapitel 17 und die
Retention-Stellen in `SPEC_06`/`SPEC_07` sind zu lesen** — **die
Antwort steht vermutlich dort.**

## Reihenfolge

`[read]` **C-112 sagt: Rechtemodell zuerst (steht), dann
Coach-Athletensicht, dann Buddy-Schema und Engines, dann
Memory/Chat.** **Dieser Punkt ist Stufe vier.**

## Auftrag

**Mitbeauftragt mit C-362 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.
