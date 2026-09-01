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
erledigt: 2026-09-02
commit: c9d91b1c
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

**2026-09-02, Orchestrator. Bildschirmfoto angesehen.**

`[cmd]` **Beides sitzt:** Grammfeld schmal, vier Makros je Zeile,
*Zutat suchen* als Knopf mit Lupe.

    Hafer Flocken                        [80]  g  278 kcal  10,6 P  5,3 F  42,6 C
    Joghurt aus entrahmter Milch         [250] g  120 kcal  13,2 P  0,3 F  14,6 C
    Banane roh                           [120] g   95 kcal   1,6 P  0,5 F  19,1 C

`[cmd]` **Gegen die Datenbank geprueft, alle vier Werte exakt:**
`food_nutrient_snapshot` liefert fuer 80 g Hafer 278,4 / 10,6 / 5,3 /
42,6, **fuer 300 g 1044,0 / 39,7 / 20,0 / 159,9.**

### Meine Frage war falsch gestellt

`[read]` **Ich fragte: *,,kann `SuchKontext` das trennen, oder
braucht es ein Feld?"***

`[cmd]` **Seine Antwort: nein — `datum`, `slot` und `ziel` waren
Pflichtfelder, und der Anzeigeblock schrieb *,,am {datum}"*.**

`[read]` **Ein Rezept mit `datum: ''` zu fuettern hiesse, die
Anzeige zu beluegen.**

`[cmd]` **Er hat zwei Typen gemacht: `TagesKontext` und
`RezeptKontext`** — **der Compiler erzwingt jetzt, dass beide Zweige
behandelt werden.**

`[read]` **Besser als mein Vorschlag.** **Ein optionales Feld haette
den Fehler moeglich gelassen; zwei Typen machen ihn unmoeglich.**

`[cmd]` **Und der Kontext liest jetzt:** *,,Zutat fuer
Banane-Joghurt-Haferflocken · 3 Zutaten · bisher 1259 kcal · danach
1354 kcal"* — **kein Tagesziel.**

### Zwei Sachen, die erst das Messen zeigte

`[cmd]` **1. Der Leseweg lieferte je Zutat keine Naehrwerte.**

`[read]` **Bestehende Rezepte haetten vier Striche gezeigt, waehrend
eine neu hinzugefuegte Zutat ihre Makros trug** — **am Schirm
gemessen, bevor er verdrahtet hat.**

`[read]` **Ein Test haette das nicht gefunden:** beide Wege waren
fuer sich richtig. `[cmd]` **`rezept-lesen.ts` beschafft sie jetzt
ueber `food_nutrient_snapshot(…, 100)`, gleichzeitig ueber alle
Lebensmittel** (G-252).

`[cmd]` **2. Das schmale Grammfeld war 262 px breit.** `[cmd]`
**`.v2-feld` setzt `flex: 1`** (`v2.css:1396`) — **`width: 56` war
nur die Basisbreite.**

`[read]` **Dieselbe Klasse wie `v2-tab` in G-321:** **eine CSS-Regel
kippt die Mechanik, und der Fehler sieht aus wie ein falscher Wert.**

`[cmd]` **Und wieder ein Waechter auf die Ursache:** faellt `flex: 1`
weg, ist die Begruendung hinfaellig.

### Zwei fremde Waechter, richtig behandelt

`[cmd]` **G-289 und G-300 prueften `/api/nutrition/foods?q=` und
`gewaehlt.enercc`** — **beides Teile der geloeschten `ZutatSuche`.**

`[read]` **Was sie sichern, gilt weiter** — die Suche sitzt im
Rezept, Naehrwerte werden gewandelt. `[cmd]` **Sie messen jetzt die
Sache statt den alten Wortlaut, und die Wandlung wird gezaehlt
(4 von 4).**

### Und die dritte Zahl von mir

`[cmd]` **Ich schrieb *,,6 Rezepte auf dev"*.** `[cmd]` **Es sind
3** — die anderen liegen auf `tom.seed@example.com`.

`[read]` **Dritte Zaehlung ohne `user_id`** — nach den 112 Eintraegen
(G-286) und den 8 Plaenen (G-321).

`[cmd]` **Er hat mit Zeitstempeln belegt, dass sein Lauf nichts
geschrieben hat:** letzte Aenderung 31.08.

`[cmd]` Gate 15/15, 1.264 Tests, 21 von 21 Sabotagen.

**Abgenommen.** **`ZutatSuche` geloescht, 123 Zeilen** (A-59).

