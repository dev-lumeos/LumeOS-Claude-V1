---
nr: G-345
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-344
entscheidung: E-64
agent: claudecode
beauftragt: 2026-09-07
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

## Auftrag — die Oberflaeche fuer Einkaufslisten

**Mitbeauftragt: G-347, G-346.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.** `[cmd]` **C-407 ist erledigt** — der
Leseweg steht.

### 1 · G-347 — die Anzeige zieht nach (zuerst)

`[cmd]` **`NT` liegt jetzt bei Makronaehrstoffen, ohne
`parent_code`.** `[cmd]` **Und *Fettbegleitstoffe* ist neu** — **es
gehoert direkt nach *Fette*.**

`[cmd]` **`CHORL` traegt kein `parent_code`** (E-63) — **es
erscheint nicht in der Fettsumme.**

`[cmd]` **Und vier `strong_avoid`-Stellen unter `apps/`:**
`vorlieben-aktionen.ts`, `daumen-schreiben.ts`, `food-search.ts`,
`daumen-schreiben.test.ts`.

`[read]` **Der CHECK kennt den Wert nicht mehr** — **beim naechsten
Schreibversuch faellt er.** `[cmd]` **Die mittlere Stufe bleibt ueber
`intolerances`, Laktose liefert `strong / intolerance` mit -25.**

### 2 · G-345 — drei Orte fuer Einkaufslisten

`[cmd]` **Vier Listen und 17 Posten liegen auf `dev`** — **niemand
zeigt sie.**

**Im Planner, an der Woche.** `[cmd]` **Dort steht bereits *,,28
Eintraege · Copy week"*** — **daneben gehoert *Einkaufsliste*.**
`[read]` **Der Hauptfall** (E-64): wer eine Woche plant, kauft fuer
die Woche.

**Am Rezept.** `[cmd]` **Flow 8 funktioniert im Schema** — drei
Listen liegen so auf `dev`. **Der Nebenfall.**

**Ein eigener Reiter.** `[read]` **Wo man alle Listen sieht, offene
und archivierte.** `[cmd]` **Supplements haben
`tab-inventory-echt.tsx`** — **dieselbe Machart.**

**Was die Liste kann:**

    abhaken       is_checked je Posten
    bearbeiten    Posten hinzufuegen, Menge aendern
    archivieren   status = 'archived'
    teilen        SPEC_03 Flow 8, Schritt 6

`[read]` **Loeschen heisst archivieren** — **eine Einkaufsliste ist
ein Beleg, was man gekauft hat.**

### 3 · G-346 — braucht Quick-Add eine Mahlzeit?

`[cmd]` **Der Posten haengt an einer echten Mahlzeit** — **fuer den
Tag muss eine angelegt sein.**

`[read]` **Drei Wege, und der dritte scheint richtig:**
**Quick-Add fragt nach der Zeit und legt die Mahlzeit mit an** —
**ein Schritt, zwei Wirkungen.** `[read]` **Das folgt E-58: die Zeit
ordnet zu.**

`[read]` **Miss, was es kostet** — **und melde, wenn es eine
Produktentscheidung bleibt.**

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** — **der Leseweg ist C-407.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    NT              bei Makronaehrstoffen, am Schirm
    Fettbegl.       nach Fette, CHORL ohne Fettsumme
    strong_avoid    vier Stellen weg, Gate gruen
    Wochenliste     im Planner erreichbar
    archivieren     Liste verschwindet aus offen, bleibt lesbar
    Bildschirmfoto  vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
