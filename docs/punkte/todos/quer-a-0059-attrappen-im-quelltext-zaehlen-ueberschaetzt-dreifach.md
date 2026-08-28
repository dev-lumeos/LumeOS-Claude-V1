---
nr: A-59
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-240
entscheidung: null
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md, tools/schuss.mjs]
zahlen:
  gemessen: 2026-08-28
  marken_im_quelltext: 89
  attrappen_auf_dem_schirm: 24
---

# A-59 — Attrappen im Quelltext zaehlen ueberschaetzt dreifach

## Befund

Aus G-240, Claude Code, 2026-08-28.

`[cmd]` **In `v2/supplements/` stehen 89 Attrappenmarken im
Quelltext. Auf dem Schirm sind es 24.**

`[read]` **Kein Widerspruch, sondern das Rueckfallmuster:**

    daten ? <Echt /> : <Attrappe />

**Die Marke steht fuer den Fall, dass nichts laedt.** `[read]` **Wer
im Quelltext zaehlt, ueberschaetzt den Anteil um mehr als das
Dreifache.**

## Was das entwertet

`[cmd]` **Meine Attrappenzaehlung im Modulstand vom 28.08.** —
`docs/spezifikation/00-MODULSTAND.md` nennt *,,elf
Attrappen-Vorkommen in fuenf Dateien"* fuer `v2/coach`. **Das ist eine
Quelltextzaehlung.**

`[cmd]` **`tools/schuss.mjs` zaehlt richtig** — es misst am
gerenderten Bildschirm. `[read]` **Wer eine Attrappenzahl nennt, muss
sagen, welche der beiden er meint.**

## Zu tun

**Den Modulstand um den Hinweis ergaenzen** und dort, wo eine
Attrappenzahl steht, die Herkunft nennen.

`[read]` **Und in Auftraegen die Bildschirmzahl verlangen, nicht die
Quelltextzahl** — sie ist die, die einen Nutzer betrifft.
