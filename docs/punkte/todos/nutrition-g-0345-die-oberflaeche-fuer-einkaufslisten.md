---
nr: G-345
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: [C-407]
kind_von: G-344
entscheidung: E-64
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-345 — die Oberflaeche fuer Einkaufslisten

## Befund

Aus E-64, 2026-09-07.

`[cmd]` **Vier Listen und 17 Posten liegen auf `dev`** — **niemand
zeigt sie.**

## Drei Orte

### 1 · Im Planner, an der Woche

`[cmd]` **Dort steht bereits *,,28 Eintraege · Copy week"*** —
**daneben gehoert *Einkaufsliste*.**

`[read]` **Der Hauptfall** (E-64): wer eine Woche plant, kauft fuer
die Woche.

### 2 · Am Rezept

`[cmd]` **Flow 8 funktioniert im Schema** — drei Listen liegen so
auf `dev`.

`[read]` **Der Nebenfall:** ein Rezept, das nicht im Plan steht.

### 3 · Ein eigener Reiter

`[read]` **Wo man alle Listen sieht, offene und archivierte.**

`[cmd]` **Supplements haben `tab-inventory-echt.tsx`** — **dieselbe
Machart.**

## Was die Liste kann

    abhaken       is_checked je Posten
    bearbeiten    Posten hinzufuegen, Menge aendern
    archivieren   status = 'archived' -- Loeschen heisst archivieren
    teilen        SPEC_03 Flow 8, Schritt 6

`[read]` **Eine Einkaufsliste ist ein Beleg, was man gekauft hat** —
**deshalb archivieren statt loeschen.**

## Was zuerst steht

`[read]` **C-407 baut den Leseweg** — **ohne ihn gibt es nichts
anzuzeigen.**
