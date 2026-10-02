---
nr: G-583
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-10-02

braucht: [G-581]
kind_von: G-581

quellen:
  - docs/punkte/todos/recovery-g-0449-wertkommtvongruppe-ohne-aufrufer.md
  - docs/punkte/todos/training-g-0219-liveworkout-ohne-aufrufer.md
  - docs/punkte/erledigt/nutrition-g-0581-ein-modal-ohne-aufrufer-mit-eigener-wahrheit.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/lib/koerper/schluessel-gruppe.ts
    - apps/web/src/app/v2/training/ansicht.tsx
    - apps/web/src/app/v2/nutrition/plans-echt.tsx
---

# Drei Reste ohne Aufrufer, nach demselben Verfahren wie G-581

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-583: drei Reste, ein Verfahren
    Bereich: apps/web/src/lib/koerper/
             apps/web/src/app/v2/training/
             apps/web/src/app/v2/nutrition/plans-echt.tsx
    Fremd:   supabase/ gehoert Codex (A-88, G-567). apps/coach liegt
             bei G-582, falls das noch laeuft. docs/ gehoert dem
             Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

**Zuerst lesen:** diese Datei und deinen eigenen G-581-Bericht — **das
Verfahren von dort gilt hier**, nur dreimal kleiner.

## Die drei, heute gemessen

`[cmd]` **1. `wertKommtVonGruppe` — 0 Aufrufer.** Definition in
`lib/koerper/schluessel-gruppe.ts:108`. Vier Nennungen, alle Kommentare:
`__tests__/g438-geliehen.test.ts:148` und `:150`,
`app/v2/recovery/tab-messwerte.tsx:47` und `:399`. **G-446 hat sie
ausgetragen** (der vierte Fall dieser Art, nach `logPhoto` G-421,
`messungAnlegenAktion` G-422, `muskelwerte()` G-441).

`[cmd]` **2. `LiveWorkout` — 0 Aufrufer.** Definition in
`app/v2/training/ansicht.tsx:1138`, ausgetragen von G-217, Kommentare in
`:301` und `:306`. `placeholder-page.tsx:28` nennt den Namen nur als
Beschriftung. `[read]` **Hier ist die Lage anders als bei 1:** der
Entwurf traegt Pausenuhr, PR-Marke und Zielvorgabe — **Dinge, die das
Formular aus G-217 nicht hat und die jemand gedacht hat.** G-189 hat
gezeigt, was passiert, wenn man einen toten Zweig entfernt, der nebenbei
etwas trug.

`[cmd]` **3. Drei Kommentarzeilen, die eine geloeschte Datei im Praesens
nennen:** `app/v2/nutrition/plans-echt.tsx:404`, `:959`, `:963` sagen
`plan-detail.tsx` — seit deinem G-581-Commit `7b37e6a2` gibt es die
Datei nicht mehr, und `:963` behauptet *„zeigt ihn bereits"*.

## Das Verfahren — dasselbe wie in G-581

**A1 — messen, nicht annehmen:** je Fall die Aufrufer zaehlen, **ohne
Kommentare**. `[cmd]` **Genau daran war der Waechter in G-446 blind** —
er las seine eigene Begruendung mit. Dein G-581-Waechter zaehlt
stattdessen; nimm dieselbe Bauart.

**A2 — die Begruendung der Austragung lesen** (G-446 fuer 1, G-217 und
G-189 fuer 2) **und sagen, ob sie heute noch traegt.** Traegt sie: weg,
entfernt und nicht auskommentiert (A-59). Traegt sie nicht: stehen
lassen **mit** dem Satz, warum.

**A3 — was der Entwurf traegt, wird Text, bevor er geloescht wird.**
`[read]` Fall 2 ist der einzige mit Inhalt, den sonst niemand
aufgeschrieben hat: **melde Pausenuhr, PR-Marke und Zielvorgabe als
Befund**, dann darf der Code gehen. Ich lege den Punkt daraus an.

**A4 — Fall 3 ist nur Text:** die drei Zeilen richtigstellen, nicht
loeschen — sie erklaeren, warum dort etwas fehlt.

**Nicht Teil:** `plan-werkbank.ts` und alles aus G-581 (erledigt), und
`tab-messwerte.tsx` ausser den zwei Kommentarzeilen.

**Zu belegen:** je Fall die Aufrufzahl vorher und nachher · die
Attrappenzahl der beruehrten Reiter vorher und nachher · Sabotage je
Waechter in beide Richtungen · `pnpm gate` gruen mit Testzahl · nichts
committen.

`[read]` **Keine Datenbank, kein Kettenlauf.**
