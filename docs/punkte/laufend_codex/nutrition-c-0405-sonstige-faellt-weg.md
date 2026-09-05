---
nr: C-405
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: E-63
agent: codex
beauftragt: 2026-09-07
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

## Auftrag

**Mitbeauftragt: C-406.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-405 — *Sonstige* faellt weg (E-63)

`[cmd]` **`nutrition.nutrient_defs`, `group_de = 'Sonstige
Naehrstoffe'` haelt zwei Codes:** `CHORL` und `NT`, beide ohne
`parent_code`.

**`CHORL` in *Fettbegleitstoffe*, kein `parent_code`.**

`[read]` **Cholesterin ist ein Sterol, kein Fett.** `[cmd]`
**`FAMS + FAPU + FASAT` ergeben `FAT`, Cholesterin nicht.**
`[read]` **Ein `parent_code` liesse es in einer Summe erscheinen, in
die es nicht gehoert** — dieselbe Trennung wie bei `FIBT` (E-48).

**`NT` zu Protein.** `[cmd]` **`PROT625` heisst so, weil es
`NT x 6,25` ist.** `[read]` **Miss, ob ein `parent_code` richtig
ist** — **Stickstoff ist kein Bestandteil von Protein, sondern seine
Quelle.** **Die Gruppe reicht vermutlich.**

`[cmd]` **Danach ist die Gruppe leer** — **melde, wenn in
`naehrstoff-anzeige.ts` etwas nachzuziehen ist** (UI-Auftrag).

`[cmd]` **Und der Code heisst `CHORL`, nicht `CHOL`.** `[cmd]`
**C-346 setzte *CHORL auf CHOL* im Legacy-Mapping, nicht in
`nutrient_defs`.** `[read]` **Zu klaeren, ob die Definition
mitzieht.**

### 2 · C-406 — `strong_avoid` entfernen

`[cmd]` **Claude Code hat gemessen: der Nutzer braucht die mittlere
Stufe je Lebensmittel nicht.**

`[cmd]` **Vier Stellen in `supabase/`:** `050:63`, `074:75`,
`075:263`, `075:837`.

`[read]` **Die mittlere Stufe bleibt ueber `intolerances`
erhalten** — `075:1053-1065`: **`strong` schliesst bei leerem
Suchbegriff aus.** `[read]` **Sie kommt nur nicht mehr aus einem
Wert, den niemand setzt.**

`[cmd]` **`apps/` traegt ihn noch an vier Stellen** —
`vorlieben-aktionen.ts`, `daumen-schreiben.ts`, `food-search.ts` und
ein Test. `[read]` **Melde, was dort nachzuziehen ist** — **nicht
selbst aendern.**

### Was nicht zu tun ist

**Kein `parent_code` fuer `CHORL`** — E-63.
**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    CHORL          Fettbegleitstoffe, kein parent_code
    NT             bei Protein, parent oder nur Gruppe -- begruendet
    Sonstige       leer, gezaehlt
    strong_avoid   vier Stellen weg, CHECK bereinigt
    intolerances   die mittlere Stufe wirkt weiter, belegt
    apps/          was nachzuziehen ist, gemeldet

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
