---
nr: G-464
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-453
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/produkt-etikett.ts
zahlen:
  gemessen: 2026-09-08
---

# G-464 - die Tafel fragt die falsche Spalte

## Toms Befund

Tom, 2026-09-08, am Schirm:

> Calcium 1440 mg  (ohne "auswertbar")
> Vitamin C 65 mg  (ohne)
> Iron 5.3 mg      (ohne)
> Zinc 18 mg       (ohne)

> Thiamin 5.1 mg   auswertbar
> Biotin 300 mcg   auswertbar

`[read]` **Das ist widerspruechlich, und die Ursache liegt in
der Anzeige.**

## Gemessen

    Zutat        supplement_id   nutrient_code
    Biotin       ja              NEIN     -> auswertbar
    Thiamin      ja              NEIN     -> auswertbar
    Calcium      NEIN            CA       -> NICHT
    Iron         NEIN            FE       -> NICHT
    Zinc         NEIN            ZN       -> NICHT
    Vitamin C    NEIN            VITC     -> NICHT

`[read]` **Die Marke *auswertbar* haengt an `supplement_id`
allein.**

`[cmd]` **`Calcium` hat ein gueltiges Naehrstoff-Mapping (`CA`)
und wird trotzdem als *nicht im Katalog* gezeigt.**

## Was zu bauen ist

`[read]` **Die Marke haengt an BEIDEM:**

    supplement_id   -> als Wirkstoff auswertbar
    nutrient_code   -> als Naehrwert auswertbar
    beides null     -> Kandidat

`[cmd]` **C-505 hat die Klassifikation schon gebaut** ?
**Naehrwert, Wirkstoff, Hilfsstoff, Kandidat.**

`[read]` **MISS, ob die Tafel sie liest** ? **oder ob sie
`supplement_id` direkt abfragt.**

## Und die Gruppierung stimmt auch nicht

`[cmd]` **In Toms Beispiel stehen `Vitamin A`, `Calcium`,
`Iron` unter WIRKSTOFFE.**

`[read]` **Das sind Naehrwerte** ? **sie gehoeren in die erste
Gruppe, zu `Total Fat` und `Protein`.**

`[cmd]` **Die Tafel hat *Naehrwerte 12* und *Wirkstoffe 62*** ?
**miss, woran die Gruppierung haengt.**

`[read]` **Vermutlich an `ingredient_category`** ? `vitamin`,
`mineral` **landen bei den Wirkstoffen, obwohl sie
Naehrwerte sind.**

## Und die doppelten Zeilen

`[cmd]` **Toms Beispiel zeigt JEDEN Wert zweimal:**
`Total Fat 19 g` **und** `Total Fat 4 g`, `Vitamin A 6500 IU`
**und** `5000 IU`.

`[read]` **Das ist das Etikett mit ZWEI Portionsgroessen** ?
**C-485 hat es gemessen, `product_contents` hat keine
Portionsspalte.**

`[read]` **MELDEN, nicht bauen** ? **das ist ein
Datenbankpunkt.**

## Abnahmebedingungen

    A1  die Marke haengt an supplement_id ODER
        nutrient_code. Foto.
    A2  Toms Beispielprodukt: wie viele der 62 sind
        nachher markiert? Zahl vorher/nachher.
    A3  Naehrwerte stehen bei den Naehrwerten,
        nicht bei den Wirkstoffen. Foto.
    A4  die doppelten Zeilen: gemeldet, mit Zahl.
    A5  Gegenprobe: eine Zeile ohne beides -> Kandidat.
    A6  vier Module unveraendert.
    A7  apps/web 1793 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Die Mappings NICHT erweitern** ? **das ist C-510 bei
Codex.**

**Nichts in `supabase/`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

