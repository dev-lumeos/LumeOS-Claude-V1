---
nr: G-323
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: [G-322]
kind_von: G-320
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/rezepte-echt.tsx
zahlen:
  gemessen: 2026-09-02
  suchen: 5
  lehren: 8
---

# G-323 — vier Suchen ohne die Lehren

## Befund

Aus G-320, Claude Code, 2026-09-02.

    Lehre                  tab-foods  mahlzeiten  rezepte  vorlieben  erfassen
    G-70   Seitensortier.     ja          -          -         -         -
    G-112  mehrere Tags       ja          -          -         -         -
    G-133  ohne               ja          -          -         -         -
    G-154  prefs              ja         ja          -        ja         -
    G-251  herkunft           ja          -          -         -         -
    G-266  Erstlauf           ja          -          -         -         -
    Abbruch                   ja          -          -        ja         -
    Entprellen                ja         ja          -        ja         -
    fehlen von 8:              0          6          8         5         8

`[read]` **Der Schaden einer zweiten Suche sind nicht die doppelten
Zeilen** — **es sind sechs teuer gelernte Lehren, die in vier Kopien
fehlen.**

`[cmd]` **`rezepte-echt.tsx` und `erfassen.tsx` haben keine
einzige.**

## Die Angleichung, die vorher noetig ist

`[cmd]` **`ZutatSuche` in `rezepte-echt.tsx` sucht auf Absenden statt
beim Tippen, kennt weder Sortierung noch Filter noch Vorlieben.**

`[cmd]` **Ihr Rueckgabewert `ZutatEntwurf` traegt Naehrwerte, das
Modal aus G-320 gibt Lebensmittel plus Menge.**

`[read]` **Die zwei muessen angeglichen werden, bevor eine die andere
ruft.**

## Reihenfolge

`[read]` **G-322 zuerst** — solange die Bauteile privat sind, baut
jeder Aufrufer sie nach.
