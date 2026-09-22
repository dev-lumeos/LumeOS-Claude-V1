---
nr: G-493
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-492
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/produkt-aktion.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-493 - das Hinzufuegen-Modal nachbessern

## Vier Befunde

### 1 - zwei Woerter fuer dieselbe Aktion

Tom, 2026-09-08:

> in der auflistung heisst es + Add und aufgeklappt
> + hinzufuegen

`[cmd]` **`ansicht.tsx:404` gegen `produkt-tafel.tsx:301`.**

`[read]` **EIN Wort, ueberall** ? **auch bei den Substanzen.**

### 2 - keine neue Mahlzeit im Modal

Tom, 2026-09-08:

> im modal, wenn man mahlzeit waehlt, kommen die definierten
> standards, da muss noch mahlzeit hinzufuegen wie in diary
> rein, dass man ohne slot hinzufuegen kann, zb
> preworkout/postworkout oder andere

`[cmd]` **Die Datenbank kennt sie schon:**

    meals.meal_type  breakfast | lunch | dinner | snack |
                     pre_workout | post_workout | other

`[cmd]` **Und das Diary hat den Weg: `mahlzeiten.tsx:630`,
*,,Mahlzeit hinzufuegen"*.**

`[read]` **Das Modal zeigt nur die HEUTE angelegten
Mahlzeiten** ? **es fehlt der Weg, eine neue anzulegen.**

`[read]` **Denselben Weg wie das Diary benutzen, nicht
nachbauen.**

### 3 - die Zielwahl zeigt ihren Zustand nicht

`[cmd]` **`In den Stack` und `Zu einer Mahlzeit` sehen gleich
aus, ob gewaehlt oder nicht.**

### 4 - die Produkt-Id steht noch in notes

`[cmd]` **C-529 ist live: `stack_items.supplier_product_id`,
optional.**

`[cmd]` **Gemessen: 0 von 11 Eintraegen haben ein Produkt** ?
**weil `produkt-aktion.tsx` noch in `notes` schreibt.**

> Codex: *,,`notes` wurde bewusst NICHT entfernt; Claude Code
kann jetzt auf die neue Spalte umstellen, ohne Nutzernotizen zu
beschaedigen."*

`[read]` **Schreiben und Lesen auf die Spalte umstellen** ?
**und die Kruecke aus `notes` erst entfernen, wenn nichts sie
mehr liest.**

## Abnahmebedingungen

    A1  ein Wort fuer die Aktion, in Liste, Tafel und
        Substanzen. Belegt.
    A2  im Modal: eine neue Mahlzeit anlegen, mit
        pre_workout / post_workout / other. Foto.
    A3  derselbe Weg wie das Diary -- nicht nachgebaut.
        Belegt.
    A4  der gewaehlte Zielknopf ist erkennbar. Foto
        beider Zustaende.
    A5  ein neuer Stackeintrag traegt
        supplier_product_id. Gegen die Datenbank belegt.
    A6  notes enthaelt keine Produkt-Id mehr bei neuen
        Eintraegen.
    A7  bestehende Eintraege unveraendert.
    A8  Kontraste gemessen.
    A9  apps/web 1934 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

