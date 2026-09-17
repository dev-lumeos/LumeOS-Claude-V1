---
nr: G-467
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-504
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-467 - die Filter werden nicht gespeichert

## Toms Befund, zum zweiten Mal

Tom, 2026-09-08:

> meine filtereinstellungen werden nicht gespeichert

> und die zusatzfilter sollen bei start eingeblendet sein.
> das wuerde schon massiv an daten weniger geben zum anzeigen

`[read]` **Er hat es vor zwei Stunden schon gesagt** ? **und
C-504 hat den Speicher gebaut, aber niemand liest ihn.**

## Gemessen

`[cmd]` **`public.user_display_preferences` existiert:**

    user_id, preference_key, value,
    created_at, updated_at
    2 Zeilen

`[cmd]` **Und in `apps/web/src/app/v2/supplements` und
`lib/supplements`: NULL Treffer fuer `display_pref`.**

`[read]` **Die Oberflaeche kennt die Tabelle nicht.**

`[read]` **Das ist mein Auftragsschnitt** ? **ich habe Codex
den Speicher bauen lassen und Claude Code nie gesagt, dass er
ihn benutzen soll.**

## Was zu bauen ist

**1** ? **Die Filter lesen und schreiben.**

`[read]` **Was zu speichern ist: Marktstatus, Kategorie, Form,
Marken, ob Allergien ausgeblendet sind.**

`[read]` **NICHT die Sucheingabe** ? **die ist
augenblicklich.**

**2** ? **Die Filterleiste startet OFFEN.**

Tom: *,,die zusatzfilter sollen bei start eingeblendet sein.
das wuerde schon massiv an daten weniger geben zum anzeigen"*

`[read]` **Wer die Leiste sieht, filtert** ? **wer sie nicht
sieht, bekommt 214.780 Produkte.**

## Und die Marken

`[cmd]` **C-511 baut die Lieblingsmarken** ? **warte darauf.**

`[read]` **Der Pulldown zeigt dann: meine Marken zuoberst, dann
die 25 haeufigsten, Eingabefeld fuer alle 4.907.**

## Abnahmebedingungen

    A1  ein gesetzter Filter ueberlebt Strg-F5. Foto
        vorher/nachher.
    A2  die Leiste startet offen. Foto.
    A3  die Sucheingabe wird NICHT gespeichert.
    A4  Gegenprobe: ein Nutzer ohne gespeicherte
        Filter -> Vorgabe.
    A5  vier Module unveraendert.
    A6  apps/web 1803 oder mehr, apps/coach 65.
