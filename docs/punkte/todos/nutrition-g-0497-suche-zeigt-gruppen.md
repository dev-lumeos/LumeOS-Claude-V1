---
nr: G-497
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-535]
kind_von: C-507
entscheidung: C-507
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/food-such-modal.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-497 - die Suche zeigt Gruppen statt Zeilen

## Die Frage

`[read]` **Wie sieht die Gruppierung in der Suche aus?**

## Toms Entscheidung (C-507)

> dann ist er nicht ueberwaeltigt von 31 resultaten

> aber er kann die child anwaehlen, wenn er will

`[read]` **NICHTS wird weggenommen** ? **eine Gruppierung, die
eingeklappt startet.**

`[cmd]` **Der Erfahrungsgrad entscheidet nur, ob sie
EINGEKLAPPT oder OFFEN startet** ? **nicht, ob sie da ist.**

`[read]` **Das zaehlt fuer den Coach: er sieht, was sein Kunde
gewaehlt hat, auch wenn der Kunde `beginner` ist.**

## Was da ist

`[cmd]` **`public.profiles.experience_level`, vier Stufen:**
`beginner`, `advanced`, `pro`, `elite`.

`[cmd]` **Heute: 2 Nutzer auf `pro`, 5 ohne Angabe.**

`[read]` **Und wenn der Grad fehlt? Vorgabe oder Frage** ?
**zu entscheiden.**

## Braucht C-535

## Abnahmebedingungen

    A1  eine Gruppe erscheint als EINE Zeile,
        aufklappbar. Foto.
    A2  beginner: eingeklappt. advanced: offen. Foto
        beider.
    A3  aufgeklappt sind alle 31 da -- nichts
        weggenommen. Zahl.
    A4  ohne Erfahrungsgrad: was passiert? Begruendet.
    A5  die bestehende Suche unveraendert bedienbar.
    A6  vier Module unveraendert.

## Wartet auf C-535, 2026-09-08

Tom: *,,keinen parent, loesen wir spaeter"*

`[read]` **Ohne Parent gibt es nichts, was eingeklappt als
Vorgabe stehen koennte** ? **dieser Punkt ruht mit C-535.**

