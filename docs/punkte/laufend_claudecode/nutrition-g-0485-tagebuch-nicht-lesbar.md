---
nr: G-485
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-519
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-485 - das Tagebuch ist nicht lesbar

## Toms Befund

Tom, 2026-09-08:

> wieso sehe ich keine meals mehr in diary?

> Tagebuch nicht lesbar
> column meal_items.supplement_serving_size does not exist

## Gemessen

`[cmd]` **C-519 ist live: die vier Altspalten sind weg,
`supplement_intake_log_id` ist da.**

`[cmd]` **Und `mahlzeiten.tsx` liest sie noch:**

     98  supplement_serving_size?: string | null
     99  supplement_serving_quantity?: number | null
    100  supplement_nutrient_status?: string | null
   1069  {it.supplement_serving...
   1070  ? ` - ${it.supplement...
   1102  {it.supplement_servi...

`[read]` **Der Zeilenkommentar auf Z85 sagt sogar:**
*,,C-519 entfernt `supplement_servin...`"* ? **der Code wusste
es und hat es trotzdem abgefragt.**

## Was schiefging

`[cmd]` **G-481 meldete:** *,,Jetzt stehen beide Wege offen,
Lesen wie Schreiben, sodass Codex ohne Ausfallfenster
einspielen kann."*

`[read]` **Der SCHREIBweg ruft die RPC. Der LESEweg fragt die
Spalten direkt ab** ? **und `select` auf eine fehlende Spalte
laesst JEDE Zeile scheitern.**

`[cmd]` **Genau der Satz aus `client-grenze.test.ts`:** *,,Ein
`.select()` auf eine fehlende Spalte laesst JEDE Zeile
scheitern."*

## Was zu tun ist

`[read]` **Der Lesepfad nimmt `supplement_intake_log_id` und
holt die Werte aus `intake_logs`.**

`[cmd]` **Die Probe `g478-supplement-kacheln.test.ts` prueft
noch die alten Spalten** ? **sie muss mit.**

## Abnahmebedingungen

    A1  das Tagebuch laedt. Foto.
    A2  Toms Fruehstueck steht: 557,5 kcal, 40,022 g.
        Foto.
    A3  das Whey zeigt Portion und Anzahl. Foto.
    A4  KEINE Abfrage auf die vier Altspalten mehr.
        Belegt.
    A5  ein Waechter faengt es: eine Abfrage auf eine
        entfernte Spalte wird rot. Sabotageprobe.
    A6  vier Module unveraendert.
    A7  apps/web 1878 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

