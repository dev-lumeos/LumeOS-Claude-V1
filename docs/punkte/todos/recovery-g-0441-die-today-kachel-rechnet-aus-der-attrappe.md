---
nr: G-441
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-440
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-441 — die Today-Kachel rechnet weiter aus der Attrappe

## Befund

`[cmd]` **G-440 hat die Muscle-map-Kachel umgestellt** ? **die
Today-Kachel nicht.**

`[cmd]` **`ansicht.tsx:354`:**

    const recoveryValues = React.useMemo(() => {
      for (const slug of MUSCLE_GROUPS_BODYMAP) {
        const st = MUSCLE_STATE[slug]      <- die Attrappe
        ...

`[cmd]` **Und `:432` speist damit die `ErmuedungsKarte`** ? **im
Reiter `Today`, Kopfzeile *,,18 groups - click for the
calculation"*.**

`[read]` **Zwei Kacheln, dieselbe Karte, zwei Quellen.**

## Und eine tote Funktion

`[cmd]` **`ansicht.tsx:519`, `muskelwerte()`** ? **KEIN
Aufrufer.**

`[cmd]` **Ihr Kommentar sagt:** *,,Die Muskelwerte, wie Today und
Muscle map sie berechnen."*

`[read]` **Das stimmt nicht mehr** ? **Muscle map rechnet anders,
Today ruft sie nicht.**

`[cmd]` **Dritter Fall dieser Art** (G-422): **ein fertiges
Bauteil ohne Aufrufer.**

## Was zu tun ist

`[read]` **Die Today-Kachel liest dieselbe Quelle wie Muscle
map.**

`[cmd]` **G-440 hat den Rechenweg gebaut** ? **er wird
gerufen, nicht nachgebaut.**

`[read]` **Und `muskelwerte()` faellt weg oder bekommt einen
Aufrufer** ? **gemessen entscheiden.**

## Und die Kopfzeile

`[cmd]` **`18 groups`** ? **die Zahl kommt aus
`MUSCLE_GROUPS_BODYMAP`.**

`[cmd]` **Die Karte hat 43 Flaechen** (G-434), **die Hierarchie
105 Namen.**

`[read]` **Miss, was die Zahl sagen soll.**

## Was NICHT zu tun ist

`[read]` **`MUSCLE_STATE` nicht loeschen** ? **G-440 hat sie
stehen lassen, nur nicht mehr gelesen.**

`[read]` **Erst wenn NIEMAND sie liest, kann sie weg** ? **das
ist dieser Punkt.**
