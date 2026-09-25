---
nr: G-503
typ: befund
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-25
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-503 - der Plan-Reiter steht auf leeren Tabellen

## Die Kacheln

`[cmd]` **`training/plan`, zwei Kacheln UEBER der Linie**
(`ansicht.tsx:866` und `:905`):

    Mesocycle - Block 3 - May 5 - Jun 8 - 5 weeks
    Routines - 6 total

`[read]` **Beide unbedingt markiert** - kein Rueckfallzweig,
also auch kein echter Zweig daneben. **Die einzigen zwei
dieser Art im ganzen Modul.**

## Der Grund, gemessen

`[cmd]` **Die Tabellen gibt es, sie sind leer:**

    training.programs               0 Zeilen
    training.routines               0
    training.program_days           0
    training.program_assignments    0
    training.program_blocks         0
    training.routine_exercises      0
    training.routine_schedule_days  0

`[cmd]` **RLS ist da** (2 Policies auf `routines`/`programs`),
**`routines` hat 9 Spalten** - **die Struktur steht, der
Inhalt fehlt.**

`[cmd]` **Und es gibt keinen Leseweg:** `grep` ueber
`apps/web/src/lib/training/*.ts` nach `programs`, `routines`,
`program_days` findet **null Treffer.**

`[cmd]` **Aber die Sitzungen zeigen darauf:**
`workout_sessions.program_assignment_id` und
`.program_day_id` existieren als Spalten.

## Was fehlt

`[read]` **Zwei Dinge, in dieser Reihenfolge:** Zeilen in
`programs`/`routines` (ein Seed oder ein Schreibweg), dann ein
Leseweg.

`[read]` **Solange beides fehlt, ist die Marke richtig** - die
Kachel zeigt einen Block *,,May 5 - Jun 8"*, den es nicht gibt.

## Abnahmebedingungen

    A1  Zeilen in programs/routines - Zahl.
    A2  ein Leseweg, der sie liest.
    A3  beide Kacheln angebunden oder mit
        berichtigtem Grund markiert. Foto.
