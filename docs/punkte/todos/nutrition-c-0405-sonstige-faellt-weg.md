---
nr: C-405
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: E-63
beruehrt:
  tabellen: [nutrition.nutrient_defs]
zahlen:
  gemessen: 2026-09-02
  in_sonstige: 2
---

# C-405 — *Sonstige* faellt weg

## Befund

Tom, 2026-09-02: *,,das sieht unprofessionell aus denn die sind alle
zuteilbar."*

`[cmd]` **`group_de = 'Sonstige Naehrstoffe'` haelt zwei Codes:**

    CHORL   Cholesterin        parent = NULL
    NT      Stickstoff, gesamt parent = NULL

## Was zu tun ist

### 1 · `CHORL` in *Fettbegleitstoffe*

`[read]` **Cholesterin ist ein Sterol, kein Fett.** `[cmd]`
**`FAMS + FAPU + FASAT` ergeben `FAT`, Cholesterin nicht.**

`[read]` **Kein `parent_code`** — **sonst erschiene es in einer
Summe, in die es nicht gehoert.** `[read]` **Dieselbe Trennung wie
bei `FIBT`** (E-48).

`[read]` **Neue Gruppe, direkt nach den Fettsaeuren einsortiert** —
`sort_index` entsprechend.

### 2 · `NT` zu Protein

`[cmd]` **`PROT625` heisst so, weil es `NT x 6,25` ist.**

`[read]` **Miss, ob ein `parent_code` richtig ist:** `[read]`
**Stickstoff ist kein Bestandteil von Protein, sondern seine
Quelle.** `[read]` **Die Gruppe reicht vermutlich.**

### 3 · Die Gruppe entfernen

`[cmd]` **Danach ist `Sonstige Naehrstoffe` leer** — **und die
Anzeige zeigt sie nicht mehr.**

`[cmd]` **G-136 hat am 02.09. den Kartenbau geaendert:**
`naehrstoff-anzeige.ts:karteFuerWurzel`. `[read]` **Melde, wenn dort
etwas nachzuziehen ist** — **das ist ein UI-Auftrag.**

## Und der Name

`[cmd]` **Der Code heisst `CHORL`, nicht `CHOL`.**

`[cmd]` **C-346 hat am 02.09. *CHORL auf CHOL* im Legacy-Mapping
gesetzt** — **nicht in `nutrient_defs`.**

`[read]` **Zu klaeren, ob die Definition mitziehen soll** — **oder ob
`CHORL` der BLS-Code bleibt und `CHOL` nur die Anzeige ist.**
