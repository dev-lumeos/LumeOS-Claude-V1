---
nr: G-480
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-83
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/food-such-modal.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-480 - ein Modal statt zwei

## Der Anlass

Tom, 2026-09-08, mit Bildschirmfoto:

> wo kann der tom das eingeben? auf diesem laecherlichen modal?
> wo nicht mal fuer nutrition passt? lass dieses modal besser
> bauen (fooddb suche like) und supplement mit einbinden

## Die Vorlage stand die ganze Zeit da

`[cmd]` **`module-nutrition.jsx:557`, selbst nachgelesen:**

    ["All", "Favorites", "Recent", "Meat", "Fish",
     "Grains", "Dairy", "Produce", "Beverages",
     "Supplements"]

`[cmd]` **Eine Suche, `Supplements` als Filter darin,
Quellenspalte je Zeile (`<Pill>{f.src}</Pill>`).**

`[cmd]` **Und `SPEC_10:92`: die Liste ist bereits nach Quelle
geteilt** ? **eine dritte Sektion ist die vorgesehene
Erweiterung.**

### Der Fehler war meiner

Claude Code in E-83:

> *,,Das stand die ganze Zeit da, und `00-QUELLEN.md` nennt die
Datei. Ich habe bei G-475/G-478 die DRITTE QUELLE uebersprungen
und danebengebaut."*

`[read]` **Ich habe die Auftraege geschrieben, ohne Spec und
Mockup zu lesen** ? **zwei von vier Quellen ausgelassen.**

## Was heute dasteht

`[cmd]` **`food-such-modal.tsx`** ? **Suchfeld, Sortierleiste
(Relevanz, Name, Protein hoch/niedrig, Kalorien,
Kohlenhydrate, Fett), *,,Mindestens zwei Zeichen eingeben"*.**

`[cmd]` **`supplement-modal.tsx`** ? **ein Freitextfeld, kein
Suchergebnis, keine Sortierung.**

## Toms Formregel

> pillen/tablet/capsule gehoeren nicht in meals ? der wird
> nicht eine tablette zerhacken, nur dass es in einen shake
> rein passt

    Meal    Powder, Liquid, Bar, Gummy
    Stack   Capsule, Tablet, Softgel, Lozenge
    Other   nicht zuordenbar

`[cmd]` **Gemessen, On Market: Powder 24.074, Liquid 20.534,
Gummy 3.007, Bar 40.**

`[cmd]` **Und aus E-83: 82 % von `Other` tragen keinen
Formhinweis im Namen** ? **MELDEN, wie es gezeigt wird.**

`[cmd]` **`Lozenge` ist klar Stack:** **Melatonin, Zink,
sublinguales B12 ? sublingual ist der Zweck.**

## Was NICHT zu aendern ist

`[cmd]` **Die Datenseite** ? **Codex baut C-519 (Toms
Entscheidung E-84: ein Supplement bleibt ein Supplement und
wird im Stack gespeichert, auch wenn es in einer Mahlzeit
steht).**

`[read]` **Die Schreibwege ziehen danach nach** ? **bau die
SUCHE.**

## Abnahmebedingungen

    A1  eine Suche, mit Supplements als Filterpille.
        Foto.
    A2  je Zeile die Quelle erkennbar. Foto.
    A3  nur untermischbare Formen erscheinen. Zahl.
    A4  supplement-modal.tsx ist weg oder leitet um.
    A5  die bestehende Lebensmittelsuche unveraendert
        bedienbar. Foto vorher/nachher.
    A6  Kontraste gemessen.
    A7  vier Module unveraendert.
    A8  apps/web 1865 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

