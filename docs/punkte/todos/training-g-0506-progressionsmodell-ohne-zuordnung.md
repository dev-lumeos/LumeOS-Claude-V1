---
nr: G-506
typ: befund
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-25
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/fehlende-kacheln.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-506 - das Progressionsmodell hat keine Zuordnung

## Die Kacheln

`[cmd]` **Zwei Kacheln auf `training/progress`, UEBER der
Linie:**

    Progression models - 5 models, one per routine
    Next-session prescription - computed by the
      assigned model

`[cmd]` **Die fuenf Modelle stehen als Konstante**
(`tabs-spec.tsx`, `PROGRESSION_MODELS`) - **aus
`module-training-spec.jsx:20-56`.**

## Der Grund, gemessen

`[cmd]` **Der Vermerk stimmt:** *,,eine Zuordnung Modell zu
Routine - weder Spalte noch Tabelle im Repo."*

`[cmd]` **Nachgesehen:** `training.routines` hat 9 Spalten,
**keine davon nennt ein Modell.** **Und die Tabelle ist
leer** (0 Zeilen, siehe G-503).

`[read]` **Zwei Hindernisse uebereinander:** es gibt keine
Routinen (G-503), und selbst mit Routinen faehlte die Spalte.

## Warum getrennt von G-503

`[read]` **G-503 ist gefuellt, wenn Zeilen da sind.** `[read]`
**Dieser Punkt braucht zusaetzlich eine Schemaaenderung** -
eine Spalte `progression_model` oder eine eigene Tabelle.

`[read]` **Die Reihenfolge ist: erst G-503, dann dieser.**

## Abnahmebedingungen

    A1  eine Entscheidung: Spalte oder Tabelle.
    A2  danach: die Zuordnung je Routine sichtbar.
    A3  die Vorgabe der naechsten Sitzung rechnet
        aus dem zugeordneten Modell. Zahl.
