---
nr: G-437
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-484
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tabs.tsx
zahlen:
  gemessen: 2026-09-08
  karten_weg: 14
  zeilen_weg: 58
---

# G-437 — tabs.tsx hat vierzehn Karten verloren

## Befund

Aus G-435, Claude Code, 2026-09-08 ? **er hat seine EIGENE
abgenommene Arbeit widerlegt:**

> *,,Ich habe bei der C-484-Konfliktloesung Schaden angerichtet.
> Nicht *RUECKFALL zu ATTRAPPE berichtigt* ? gemessen an
> `934d2ae1`: vorher 1 Attrappe + 19 RUECKFALL, nachher 17
> Attrappen + 0 RUECKFALL, 58 Zeilen raus, 14 `<Card>`-Bloecke
> weg. Ich habe die FALSCHE Stash-Haelfte behalten (Stand vor
> G-91)."*

`[cmd]` **Und die zwei roten Supplements-Waechter melden es
korrekt** ? **er hat ihre Zahl NICHT angepasst.**

## Mein Fehler bei der Abnahme

`[cmd]` **Ich habe C-484 abgenommen mit:** *,,er hat die alte
Stash-Haelfte verworfen, nicht die neue."*

`[read]` **Das stand in seinem Bericht, und ich habe es
geglaubt** ? **statt `git diff 934d2ae1^ 934d2ae1` zu lesen.**

`[cmd]` **Die Regel steht in `docs/lehren/`:** *,,Berichte von
Agenten werden geprueft, nicht geglaubt."*

## Was zu entscheiden ist

**a** ? **`tabs.tsx` aus `934d2ae1^` zurueckholen, dann die
C-484-Aenderung neu anwenden.**

`[read]` **Ein Eingriff in einen abgenommenen Commit** ? **aber
der Commit ist nicht gepusht.**

`[cmd]` **Miss, was in `934d2ae1` an `tabs.tsx` ueberhaupt
gehoerte** ? **die Konfliktloesung war nicht Teil von C-484.**

**b** ? **Die 14 Karten von Hand nachtragen.**

`[read]` **Mehr Arbeit, und die 19 `RUECKFALL`-Zweige waren
Rueckfallpfade** ? **wer sie neu schreibt, erfindet sie.**

**c** ? **So lassen und die Waechterzahl anpassen.**

`[read]` **Dann sind 14 Karten weg und niemand weiss mehr,
welche.**

## Empfehlung

`[read]` **a** ? **der Commit ist nicht gepusht, `git` hat den
alten Stand.**

`[cmd]` **`git show 934d2ae1^:apps/web/src/app/v2/supplements/tabs.tsx`**
? **der Stand vor dem Schaden.**

`[read]` **Und die C-484-Aenderung war klein** ? **sie laesst
sich neu anwenden.**
