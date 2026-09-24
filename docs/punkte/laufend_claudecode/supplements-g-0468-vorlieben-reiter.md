---
nr: G-468
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: [C-511]
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-468 - der Vorlieben-Reiter fuer Supplements

## Toms Vorgabe

> jedes modul braucht seine preferences

> nutrition haben wir das schon

## Die Vorlage

`[cmd]` **`apps/web/src/app/v2/nutrition/tab-vorlieben.tsx`**

`[read]` **Sieh sie an, bevor du baust.**

## Was hineingehoert

`[read]` **C-511 liefert die Tabelle** ? **warte darauf.**

    bevorzugte Marken     mehrere, verwaltbar
    gemiedene Stoffe      mehrere
    Allergien             GEZEIGT aus public.user_allergies,
                          dort aenderbar -- nicht kopiert
    bevorzugte Formen     Capsule, Powder, Liquid
    nur On Market         Schalter

`[cmd]` **Elf Reiter heute** ? **der neue steht bei den
Einstellungen, nicht bei den Produkten.**

`[cmd]` **MISS, wo `nutrition` seinen hat** ? **dieselbe
Stelle.**

## Abnahmebedingungen

    A1  ein Vorlieben-Reiter, wie in nutrition. Foto.
    A2  mehrere Marken setzbar. Foto.
    A3  die Allergien: gezeigt und aenderbar, eine
        Aenderung wirkt in Settings. Belegt.
    A4  die Vorlieben wirken auf die Produktsuche.
        Zahl vorher/nachher.
    A5  Kontraste gemessen.
    A6  die elf anderen Reiter unveraendert.
    A7  apps/web 1811 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
