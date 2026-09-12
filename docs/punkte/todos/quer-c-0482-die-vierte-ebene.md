---
nr: C-482
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-432
entscheidung: null
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
  betroffen: 10
---

# C-482 — die vierte Ebene

## Befund

Aus G-432, Claude Code, 2026-09-08:

> *,,Ja, eine vierte Ebene wird gebraucht: ZEHN gezeichnete
> Flaechen stehen auf `muscle_groups`-Ebene 3+; es fehlt die
> Gruppe zwischen Wurzel und Flaeche."*

`[cmd]` **`public.koerperflaechen` hat heute drei Ebenen:**

    E1   8 Wurzeln
    E2  26 Flaechen
    E3  34 Seiten

`[cmd]` **`training.muscle_groups` hat VIER:**

    Legs > Quadriceps > Rectus Femoris
    Legs > Lower Legs > Calves

`[read]` **`calves` ist eine gezeichnete Flaeche und ein KIND von
`Lower Legs`** ? **die Gruppe dazwischen fehlt in
`koerperflaechen`.**

## Was zu bauen ist

    E1  Wurzel     Beine
    E2  Gruppe     Lower Legs, Quadriceps, Hamstrings, Glutes
    E3  Muskel     calves, rectus-femoris, biceps-femoris
    E4  Seite      -l, -r

`[cmd]` **Miss, welche zehn betroffen sind** ? **G-432 hat sie
gezaehlt, die Liste steht in der Punktdatei.**

## Und die vier Flaechen aus C-481

`[cmd]` **`gluteus-maximus`, `gluteus-medius`, `biceps-femoris`,
`semitendinosus` fehlen weiter in der Tabelle.**

`[read]` **Sie gehoeren unter ihre Gruppe** (`Glutes`,
`Hamstrings`) ? **also erst die vierte Ebene, dann die vier.**

`[cmd]` **C-481 geht darin auf.**

## Was danach faellt

`[cmd]` **`AUS_AUFTEILUNG` in `apps/web`** ? **die Bruecke, die
G-430 und G-431 gebaut haben.**

`[read]` **Und `MUSKEL_ZU_FLAECHE`?** `[cmd]` **G-430 hat sie
behalten, weil nur 60 von 96 Namen die Tabelle erreichten** ?
**G-432 misst jetzt 21 von 95 gezeichnet.**

`[read]` **Miss, ob die Tabelle nach der vierten Ebene reicht.**
