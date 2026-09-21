---
nr: G-492
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: [G-491]
kind_von: G-484
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-492 - Hinzufuegen ist eine Aktion, keine Detailseite

## Toms Befund

Tom, 2026-09-08:

> ich denke, es ist nicht die richtige richtung, dass man ein
> produkt oeffnen muss, dann runterscrollen, um irgendwo
> hinzuzufuegen

> es ist eine aktion, und aktionen sollten wir mit modals loesen

> meiner meinung nach gehoert in die auflistung als
> zweithinterste spalte action rein, sprich benutzen oder
> hinzufuegen, und wohin/wieviel etc gehoert ins modal

## Die Recherche

### Cronometer macht es genau so

`[cmd]` **Cronometer, Hilfe-Artikel *,,Add a Food"*:** nach dem
Auswaehlen oeffnet sich das Fenster *,,Add Food To Diary"* mit
Portionsgroesse, Menge und **Diary Group** ? **das ist die
Mahlzeitwahl.**

### Die UX-Literatur stuetzt beide Haelften

`[cmd]` **Spalte:** Aktionen einer Zeile gehoeren in die
letzte Spalte (PatternFly); die ein bis zwei haeufigsten
bleiben direkt sichtbar (saasui.design).

`[cmd]` **Modal:** braucht eine Aktion mehrere Felder, ist ein
Modal besser als Inline (Eleken).

`[cmd]` **Eine Warnung, die hier NICHT greift:** NN/G raet bei
tiefer Bearbeitung von Modals ab, weil sie Nachbarzeilen
verdecken.

`[read]` **Beim Hinzufuegen schaut niemand in die
Nachbarzeile** ? **es ist eine Entscheidung, keine
Bearbeitung.**

## Toms Entscheidungen

**1** ? **EIN Knopf.**

> einen

`[read]` **Die Formregel (C-524, in der Datenbank) entscheidet,
was das Modal anbietet** ? **eine Kapsel zeigt nur den
Stack.**

**2** ? **Die Aktion bleibt auch in der Detailansicht, aber
OBEN.**

> kann drin bleiben, aber auch da sehe ich es nicht am ende,
> denn soweit runter scrollt einer nur, wenn er anweisungen
> lesen will

## Die Form

    Name | Marke | Form | Portion | kcal | P | [+] | [>]
                                             ^      ^
                                   zweithinterste  Detail

### Das Modal

    Wohin?     ( ) Stack   ( ) Mahlzeit   <- nach Form
    Welcher?   [Cut-Phase v] / [Mittagessen v]
    Wieviel?   Portion [31 g v]  Anzahl [1]
    nur Stack: Zeitpunkt, Haeufigkeit, Zyklus
               -> "ergibt 120 kcal, 24 g Protein"

## Was bleibt aus G-484

`[cmd]` **Die Schreibwege, die Formregel, die zwei Pulldowns,
die Dosispruefung** ? **alles wird wiederverwendet.**

`[read]` **Nur der ORT wandert: aus der Detailansicht unten ins
Modal.**

## Warum G-491 zuerst

`[cmd]` **Die Tabelle bleibt bei manchen Suchen leer** ?
**ohne Zeilen kein Knopf.**

## Abnahmebedingungen

    A1  der Knopf steht in der zweithintersten Spalte.
        Foto.
    A2  ein Klick oeffnet das Modal, OHNE die Liste zu
        verlassen. Foto.
    A3  eine Kapsel: das Modal zeigt nur den Stack.
        Foto.
    A4  ein Pulver: beides. Foto.
    A5  die Vorschau rechnet vor dem Eintragen mit.
        Foto.
    A6  in der Detailansicht steht derselbe Knopf OBEN,
        ohne Scrollen sichtbar. Foto.
    A7  derselbe Schreibweg wie G-484 -- nicht
        nachgebaut. Belegt.
    A8  nach dem Eintragen: eine Bestaetigung, wohin es
        ging. Foto.
    A9  die elf anderen Reiter unveraendert.
    A10 apps/web 1910 oder mehr, apps/coach 65.

## Nachtrag 2026-09-08 - die Vorlage steht schon im Code

Tom, mit Bildschirmfoto des Substanzen-Reiters:

> oder wir gehen nochmal logisch ueber die darstellung, wenn
> details geoeffnet sind, und bauen das wie bei supplements mit
> subnav, dann muss man nicht mehr soviel runternavigieren

### Was der Substanzen-Reiter schon hat

    Zeile      [+ Add]  -- ganz rechts, in der Liste
    Detail     Subnav: Ueberblick | Dosierung | Sicherheit |
                       Fragen | Rechtslage
    unten      [Zum Stack hinzufuegen]

`[cmd]` **Gemessen: `substanz-tafel.tsx` und
`substanz-abschnitte.tsx`.**

`[cmd]` **`produkt-tafel.tsx` existiert daneben, OHNE
Subnav.**

### Und dasselbe Problem steht auch dort

`[read]` **`Zum Stack hinzufuegen` steht bei den Substanzen
ganz UNTEN** ? **Toms Pfeile zeigen genau darauf.**

## Was sich damit am Auftrag aendert

**1** ? **Die Produkt-Detailansicht bekommt eine Subnav, wie
die Substanzen.**

    Ueberblick     Marke, Form, Portion, Markt
    Inhaltsstoffe  die Tafel (C-505)
    Anwendung      Suggested Use (schon importiert)
    Hinweise       Precautions, Formulation -- erst nach
                   C-527, dann nachziehen

`[read]` **Die Abschnitte sind ein Vorschlag** ? **MISS, was
die Produkt-Tafel heute zeigt, und gruppiere danach.**

**2** ? **Die Aktion steht OBEN, in der Subnav-Zeile.**

`[read]` **Nicht unten, nicht im Abschnitt** ? **sichtbar, egal
welcher Reiter offen ist.**

**3** ? **Dasselbe fuer die Substanzen.**

`[read]` **`Zum Stack hinzufuegen` wandert dort ebenfalls nach
oben** ? **eine Bauform fuer beide Tafeln.**

### Zusaetzliche Abnahmebedingungen

    A11 die Produkt-Tafel hat eine Subnav wie die
        Substanz-Tafel. Foto.
    A12 die Aktion steht in der Subnav-Zeile, in JEDEM
        Reiter sichtbar. Foto aus zwei Reitern.
    A13 die Substanz-Tafel: Zum Stack hinzufuegen oben
        statt unten. Foto vorher/nachher.
    A14 beide Tafeln nutzen DIESELBE Subnav-Bauform --
        nicht zweimal gebaut. Belegt.

