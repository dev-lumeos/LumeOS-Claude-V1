---
nr: G-540
typ: befund
modul: goals
schwere: niedrig
angelegt: 2026-09-29

braucht: [G-539]
kind_von: G-534

quellen:
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx

zahlen:
  gemessen: 2026-09-29
  eigene_vorlagen_im_entwurf: 3
  geteilte_vorlagen_im_entwurf: 3
  tabellen_dafuer_live: 0
---

# Vorlagen fuer Phasenplaene — die fuenfte Ebene

`[read]` `module-goals-editor.jsx:490-569`, `PhaseTemplateLibrary`. Der
Editor hat den Knopf *„Save as my template"*; dieser Dialog ist, wo die
Vorlagen landen.

Zwei Listen:

| Eigene | `{ name, base, edited, uses, note }` — „My 2026 contest cycle", from „Expert BB Annual", used 1× |
| Geteilte | `{ name, author, rating, uses }` — vom Coach, von anderen Nutzern, von LumeOS |

Bei den eigenen: Apply · Edit · Duplicate · **Share with coach**. Bei den
geteilten: Preview · Import.

## Was daran zu entscheiden ist, bevor gebaut wird

Das ist kein reines Oberflaechenthema. Drei Fragen, die Tom entscheidet:

1. **Geteilte Vorlagen mit Bewertung und Nutzungszahl** sind ein
   Marktplatz-Merkmal. Gehoert das zu Goals oder zum Marketplace-Modul?
   `[cmd]` „IFBB standard 24wk prep · LumeOS · 4.7 ★ · 310 uses" — die
   Zahl setzt voraus, dass Nutzungen modulweit gezaehlt werden.
2. **„Share with coach"** braucht die Freigabeschicht des Coach-Moduls.
   Die existiert (C-381, C-379). Ob eine Vorlage denselben Weg nimmt wie
   ein Originalbild, ist offen.
3. **Wer pflegt die LumeOS-Vorlagen?** Ein Katalogeintrag (G-536) ist
   ausgeliefert; eine LumeOS-Vorlage ist ein vorkonfigurierter Plan. Das
   ist eine dritte Sorte Inhalt mit eigener Pflege.

Bis das entschieden ist: **kein Knopf im Editor, der hierher zeigt.**

## Grenze

Zuletzt. Weder Ziele (G-537), Katalog (G-536), Terminierung (G-538) noch
Editor (G-539) brauchen Vorlagen — Vorlagen brauchen alle vier.

---

## Entschieden — 2026-10-01, E-88

**Tom:** Marketplace fuer geteilte Vorlagen, Goals fuehrt nur eigene.

    Goals          "Save as my template", Apply, Edit, Duplicate
    Marketplace    geteilte Vorlagen mit Bewertung und Nutzungszahl

`[cmd]` **Der Grund ist die Zaehlung:** „4,7 ★ · 310 uses" setzt eine
modulweite Zaehlung voraus, und zwei Zaehlungen laufen auseinander.

`[read]` **Damit sind auch die zwei Folgefragen beantwortet:** die
LumeOS-Vorlagen sind geteilte Vorlagen, also Marketplace-Inhalt und dort
gepflegt. „Share with coach" nimmt die bestehende Freigabeschicht
(C-381, C-379) — ein zweiter Freigabeweg waere dieselbe
Zwei-Wahrheiten-Klasse.

`[read]` **Reihenfolge unveraendert:** Vorlagen kommen zuletzt, und die
geteilte Liste braucht zusaetzlich den Marketplace (G-362).
