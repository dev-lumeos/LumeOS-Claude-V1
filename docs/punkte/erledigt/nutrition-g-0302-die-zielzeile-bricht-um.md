---
nr: G-302
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-08-31
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 0c70caec
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plans-echt.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-302 — die Zielzeile bricht um

## Befund

Tom, 2026-08-31, am Schirm: **bei 1440 px stand *Kohlenhydrate
313 g* ueber der Beschriftung statt daneben.**

`[cmd]` **Vier Werte in einer Zeile, der dritte hat die laengste
Beschriftung.**

## Warum die Datei fehlte

`[read]` **Die Nummer wurde am 31.08. vergeben und dreimal
mitbeauftragt** — **in G-317, G-331 und G-339.**

`[cmd]` **Die Punktdatei wurde nie angelegt.**

`[read]` **Claude Code hat es am 02.09. gemeldet:** *,,G-302 wird in
der Punktdatei als mitbeauftragt gefuehrt, hat aber nirgends eine
Datei."*

`[read]` **Ein Punkt ohne Datei ist ein Auftrag ohne Nachweis** —
**niemand haette gemerkt, wenn er nie erledigt worden waere.**

## Abnahme

**2026-09-02, Orchestrator. Nachgetragen.**

`[cmd]` **Im Code geloest:** `plans-echt.tsx` und
`plan-kopfkarte-zeilen.test.ts` **tragen die Kennung.**

`[cmd]` **Und G-317 fuehrt ihn als abgenommen** — *,,behoben: die
Zielzeile bricht bei 1440 px nicht mehr um."*

`[read]` **Die Arbeit war getan, nur die Akte fehlte.**

**Geschlossen.**
