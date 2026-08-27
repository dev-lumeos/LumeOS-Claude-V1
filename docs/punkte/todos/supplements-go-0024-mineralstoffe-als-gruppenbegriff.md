---
nr: GO-24
typ: entscheidung
modul: supplements
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: C-165
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# GO-24 - *„Mineralstoffe"* als Gruppenbegriff?

## Befund

(neu
  2026-08-20). **Produktfrage aus C-165.**

  `[cmd]` **`Elektrolyte` trifft fuenf Codes, `Spurenelemente` acht.**
  **Und *„Mineralstoffe"*?**

  `[read]` **Es waere die ganze Gruppe *Elemente* (16 Codes)** —
  **oder nichts**, weil die Karte schon so heisst. **Zu entscheiden, ob
  ein Alias auf eine ganze Karte zeigen darf.**

---

## K — Kimi-Bestand: Abgleich und Vertiefung

`[cmd]` **Aufgenommen am 2026-08-22 (C-194).** Der Bestand liegt unter
`backup/kimi-research/Kimi_Agent/supplement_performance_database/`,
untracked, 346 MB. **Er kommt nicht ins Repo** — der Pre-Commit-Hook
sperrt Dateien ueber 10 MB.

`[read]` **Der Befund, der die Gruppe begruendet:** Wir haben die
Huelle importiert und den Inhalt liegenlassen. `[cmd]`
`supplements.substance_catalog` hat **31 Spalten**, Kimi liefert
**146 Felder** je Substanz — **130 davon haben keine Repo-Spalte.**

`[read]` **Reihenfolge:** Schema vor Import, Import vor Oberflaeche.
K-01 bis K-03 haengen aneinander. Alles mit *„Schema fehlt"* ist
Codex; nichts davon ist Oberflaechenarbeit, solange die Daten fehlen.

### Substanzen — die dichteste Luecke
