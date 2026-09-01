---
nr: G-323
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: [G-322]
kind_von: G-320
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
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

## Tom will es zuerst fuer Rezepte

Tom, 2026-09-02: *,,das modal ist perfekt, wieso nutzen wir das nicht
auch fuer rezepte? anstatt das pulldown wo nur kalorien zeigt."*

`[read]` **Damit ist die Reihenfolge aus diesem Punkt umgedreht:**
**Rezepte zuerst, `tab-foods.tsx` herausloesen (G-322) spaeter.**

`[read]` **Und das geht**, weil das Modal aus G-320 bereits eigene
Bauteile hat — **es braucht `tab-foods.tsx` nicht.**

## Die Angleichung, gemessen

    ZutatSuche       onWaehlen: (z: ZutatEntwurf) => void
                     rezepte-echt.tsx:89-90

    FoodSuchModal    onWaehlen: (food: NutritionFoodSearchRow,
                                 mengeG: number) => Promise<void>
                     food-such-modal.tsx:228

`[read]` **Beide heissen `onWaehlen`, geben aber Verschiedenes
zurueck.** `[cmd]` **`ZutatEntwurf` traegt Naehrwerte, das Modal gibt
Lebensmittel plus Menge.**

`[read]` **Das ist die ganze Arbeit:** **aus `food` und `mengeG` einen
`ZutatEntwurf` bauen.**

`[cmd]` **Die Naehrwerte kommen aus `menge-rechnen.ts`** — dieselbe
Datei, die im Modal die Live-Vorschau rechnet. `[cmd]` **Und sie ist
gegen `food_nutrient_snapshot()` geprueft, identisch auf die
Nachkommastelle** (G-320).

## Auftrag

**Beauftragt am 2026-09-02.**

### Was zu bauen ist

**`ZutatSuche` durch `FoodSuchModal` ersetzen.**

`[cmd]` **Aufrufstelle: `rezepte-echt.tsx:392`.**

`[read]` **Der `SuchKontext` muss anders gefuellt werden als im
Planner:** dort ist es Tag und Mahlzeit, **hier das Rezept und was
schon an Zutaten drinsteht.**

`[read]` **Und die Tageslage entfaellt** — ein Rezept hat kein
Tagesziel. `[cmd]` **Miss, ob `SuchKontext` das trennen kann, oder
ob es ein Feld braucht.**

### Was dabei mitkommt

`[cmd]` **`ZutatSuche` sucht auf Absenden statt beim Tippen und
kennt weder Sortierung noch Filter noch Vorlieben** — **acht Lehren
fehlen ihr.**

`[read]` **Mit dem Modal kommen alle acht.**

### Was nicht zu tun ist

**Kein Umbau von `tab-foods.tsx`** — das bleibt G-322.
**Keine dritte Suche.**
**Nichts auf `dev@lumeos.app` schreiben** — 4 Plaene, 6
Protokollzeilen, 6 Rezepte stehen dort.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Zutat hinzufuegen   ueber das Modal, mit Sortierung und Filter
    ZutatEntwurf        Naehrwerte stimmen, gegen
                        food_nutrient_snapshot geprueft
    Kontext             zeigt das Rezept, nicht ein Tagesziel
    ZutatSuche          geloescht, nicht auskommentiert (A-59)
    Live-Vorschau       Menge aendern aendert die Werte
    Bildschirmfoto      vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
