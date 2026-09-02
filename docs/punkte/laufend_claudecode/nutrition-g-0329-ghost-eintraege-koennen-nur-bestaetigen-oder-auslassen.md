---
nr: G-329
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-309
entscheidung: E-42
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-329 — Ghost-Eintraege koennen nur bestaetigen oder auslassen

## Befund

Tom, 2026-09-02, am Schirm:

> die ghosteintraege des mealplanners brauchen bearbeiten (fuer
> manuelle aenderungen) und mealcam (fuer visuelle bestaetigung oder
> korrektur)
>
> und die positionen sollen gleich abgebildet sein wie in den
> normalen eintraegen

`[cmd]` **Heute traegt eine Ghost-Karte zwei Knoepfe: *Bestaetigen*
und *Auslassen*.**

`[cmd]` **Und die Positionen zeigen nur Menge und kcal:**

    Haferflocken          [80]  g   278 kcal
    Joghurt (0,5% Fett)   [250] g   120 kcal
    Banane                [120] g    95 kcal

`[cmd]` **Eine normale Mahlzeitzeile zeigt vier Werte:**

    Vollkornbrot   81 g   170 kcal   6 g   31 g   1 g

## Was fehlt

### 1 · Bearbeiten

`[read]` **Wer 80 g Haferflocken auf 120 aendert, kann das heute
nur ueber das Mengenfeld** — **aber keine Zutat austauschen oder
hinzufuegen.**

`[cmd]` **E-42: geloggt ist eingefroren, nicht geloggt ist frei.**
`[read]` **Ein Ghost-Eintrag ist nicht geloggt** — **er darf
geaendert werden.**

### 2 · MealCam

`[cmd]` **Der Knopf existiert in der leeren Mahlzeit**
(`mahlzeiten.tsx:451`) — **als Attrappe** (G-276, kein Modell).

`[read]` **Und Flow 4 nennt ihn ausdruecklich fuer Ghost Entries:**
*,,confirm via MealCam or manually"* — **die Attrappe aus G-315 stand
so in der Vorlage.**

`[read]` **Solange kein Modell da ist, bleibt er eine Attrappe** —
**aber an der richtigen Stelle, mit dem Vermerk warum.**

### 3 · Dieselbe Zeilenform

`[cmd]` **Die normale Zeile: Punkt, Name, Menge, kcal, P, C, F,
Menue.** `[cmd]` **Die Ghost-Zeile: Name, Mengenfeld, kcal.**

`[read]` **Zwei Darstellungen fuer dieselbe Sache** — **und die
Ghost-Zeile zeigt weniger, obwohl die Werte da sind.**

`[cmd]` **`menge-rechnen.ts` liefert alle vier** — G-320, gegen
`food_nutrient_snapshot` geprueft.

## Auftrag — Ghost-Eintraege wie normale Eintraege

**Mitbeauftragt: G-330.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · Dieselbe Zeilenform

`[cmd]` **Normal:** Punkt, Name, Menge, kcal, P, C, F, Menue.
`[cmd]` **Ghost:** Name, Mengenfeld, kcal.

`[read]` **Zwei Darstellungen fuer dieselbe Sache** — **und die
Ghost-Zeile zeigt weniger, obwohl die Werte da sind.**

`[cmd]` **`menge-rechnen.ts` liefert alle vier** (G-320, gegen
`food_nutrient_snapshot` geprueft).

`[read]` **Das Mengenfeld bleibt** — es ist der Unterschied: **ein
Ghost-Eintrag ist ein Vorschlag, den man aendern darf, bevor man ihn
bestaetigt.**

### 2 · Bearbeiten

Tom: *,,fuer manuelle aenderungen."*

`[cmd]` **Heute laesst sich nur die Menge aendern** — **keine Zutat
austauschen, keine hinzufuegen, keine entfernen.**

`[cmd]` **E-42: geloggt ist eingefroren, nicht geloggt ist frei.**
`[read]` **Ein Ghost-Eintrag ist nicht geloggt.**

`[read]` **Und das Suchmodal steht** (G-320, G-323) — **es kann eine
Zutat liefern.**

`[read]` **Zu klaeren, bevor du baust: aendert *Bearbeiten* den
Plan oder nur diesen Tag?** `[cmd]` **E-42 sagt: nicht geloggte
Planpositionen sind frei** — **aber ein Ghost-Eintrag zeigt eine
Planposition, er ist keine.**

**Miss, was `bestaetigen` heute schreibt, und sag was richtig
waere.**

### 3 · MealCam

Tom: *,,fuer visuelle bestaetigung oder korrektur."*

`[cmd]` **Der Knopf existiert in der leeren Mahlzeit**
(`mahlzeiten.tsx:451`) — **als Attrappe, G-276: kein Modell.**

`[cmd]` **Flow 4 nennt ihn fuer Ghost Entries:** *,,confirm via
MealCam or manually"*.

`[read]` **Er gehoert an die Ghost-Karte, mit demselben Vermerk wie
in der leeren Mahlzeit** — **eine Attrappe an der richtigen Stelle
ist besser als keine an der falschen.**

### 4 · G-330 — die Kopfzeile

Tom: *,,Totale im header fuer alle werte und beschriftung darunter,
dann zaehlt die auch fuer den inhalt."*

`[cmd]` **Heute:** `413 kcal · 23g P` — **zwei von vier.**

`[read]` **Alle vier, mit Spaltenbeschriftung darunter** — **sie gilt
dann fuer die Zeilen.** `[read]` **Heute steht ueber den Zahlen
nichts: wer *6 g 31 g 1 g* liest, muss raten.**

`[cmd]` **Reihenfolge kcal, P, C, F** — wie in `mahlzeiten.tsx:799`.

### Was nicht zu tun ist

**Kein MealCam-Modell** — G-276, der Knopf bleibt Attrappe.
**Keine zweite Zeilenkomponente** — dieselbe fuer beide.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Ghost-Zeile      vier Werte wie die normale
    Bearbeiten       Zutat tauschen, hinzufuegen, entfernen
    Wirkung          aendert es den Plan oder den Tag? gemessen
    MealCam          an der Ghost-Karte, mit Vermerk
    Kopfzeile        vier Werte, Beschriftung darunter
    Bildschirmfoto   vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
