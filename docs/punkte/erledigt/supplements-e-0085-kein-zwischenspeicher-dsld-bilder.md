---
nr: E-85
typ: entscheidung
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-496
entscheidung: null
erledigt: 2026-09-08
commit: entschieden
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
---

# E-85 - kein Zwischenspeicher fuer die DSLD-Bilder

## Toms Entscheidung

Tom, 2026-09-08:

> ich sehe keinen grund die daten runterzuladen. wir sind am
> entwickeln und werden nie 1000 aufrufe die stunde haben

> dazu kommt, das sind die ersten daten, wo wir beginnen mit zu
> arbeiten, sprich der endausbau ist: supplier oder
> manufacteurs werden ihre daten selber pflegen

## Die Zahlen dazu

`[cmd]` **G-496 hat gemessen:**

    Grenze        1.000 Aufrufe je Stunde, je SERVER-IP
    Katalog       214.780 x 21 KB = 4,3 GB
    Dauer         neun Tage bei dieser Grenze
    Browser       max-age=3600 ist drin

`[read]` **Ein Vorratslauf waere neun Tage und 4,3 GB fuer
Daten, die spaeter ersetzt werden.**

## Was daraus folgt

`[read]` **Die DSLD ist ein ANFANG, kein Ziel** ? **der
Endausbau sind gepflegte Herstellerdaten.**

`[read]` **Also: nichts vorhalten, was ersetzt wird.**

`[cmd]` **Der Browserspeicher (max-age=3600) reicht.**

`[read]` **Wenn spaeter mehr als die Tafel das Bild nutzt ?
eine Liste mit Vorschaubildern, ein Ausdruck ? wird neu
gemessen.**

## Und was das fuer die Datenhaltung heisst

`[read]` **Dieselbe Frage kommt bei jedem DSLD-Feld wieder:
importieren oder abrufen?**

    importiert   Naehrwerte, Zutaten, Statements (C-532)
                 -- durchsuchbar, gefiltert, gerechnet
    abgerufen    das Etikettenbild
                 -- nur angesehen, nie durchsucht

`[read]` **Die Trennlinie: was LumeOS rechnet oder durchsucht,
wird importiert. Was nur angeschaut wird, wird abgerufen.**

