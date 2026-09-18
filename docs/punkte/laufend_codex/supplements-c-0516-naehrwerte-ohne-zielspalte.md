---
nr: C-516
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-510
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [nutrition.foods_custom]
zahlen:
  gemessen: 2026-09-08
---

# C-516 - Naehrwerte ohne Zielspalte

## Toms Befund

Tom, 2026-09-08:

> ich sehe noch diverse naehrwerte ohne anbindung wie
> cholesterol, trans fat, etc

## Gemessen

    Cholesterol             13.762 Produkte   KEIN Mapping
    Added Sugars             8.271            KEIN Mapping
    Trans Fat                7.581            KEIN Mapping
    Polyunsaturated Fat      3.764            KEIN Mapping
    Monounsaturated Fat      2.485            KEIN Mapping
    Soluble Fiber            1.231            KEIN Mapping
    Insoluble Fiber            545            KEIN Mapping

`[cmd]` **Was gemappt IST:** `Dietary Fiber` **14.602 -> FIBT,**
`Saturated Fat` **13.908 -> FASAT,** `Total Sugars` **10.576 ->
SUGAR.**

## Die Ursache ist tiefer als ein fehlendes Mapping

`[cmd]` **`nutrition.foods_custom` hat fuer Fette und
Ballaststoffe NUR:** `fat`, `fibt`, `sugar`, `fasat`.

`[read]` **Es gibt keine Cholesterinspalte, keine
Transfettspalte, keine Spalte fuer einfach- oder mehrfach
ungesaettigte Fette.**

`[read]` **Zwei verschiedene Faelle:**

    a  der Stoff hat eine Zielspalte, das Mapping fehlt
       -> nachtragen, wie C-510 es getan hat
    b  der Stoff hat KEINE Zielspalte
       -> eine Entscheidung, keine Zuordnung

## Und der Schreibweisenschwanz

`[cmd]` **44 verschiedene Schreibungen gemessen:**

    Trans Fat, Trans Fats, Trans fat, Trans Fatty Acids
    Monounsaturated, Monounsaturated Fat,
      Monounsaturated {Fat}, Monounsaturated Fats,
      Monounsaturated Fatty Acids
    Saturated Fatty Acids, Saturated Fats,
      Saturated fatty acids

`[read]` **Und Artefakte, die KEINE Naehrwerte sind:**

    Cholesterol Support Blend        2
    Cholesterol Health(TM)           1
    Cholesterol D-fense Blend        1
    Trans Fats & Saturated Fats      8

`[read]` **Dieselbe Falle wie in C-509** ? **der Name enthaelt
den Stoff, die Zeile meint eine Mischung.**

## Was zu tun ist

`[read]` **MESSEN und TRENNEN, nicht bauen:**

    A  welche DSLD-Naehrwertnamen haben eine
       LumeOS-Zielspalte und kein Mapping?
       -> die nachtragen
    B  welche haben KEINE Zielspalte?
       -> TABELLE mit Produktzahl, fuer Toms
          Entscheidung
    C  welche sind Mischungsnamen, keine Naehrwerte?
       -> aussortieren, mit Grund

`[cmd]` **Fuer B: was wuerde eine neue Spalte kosten?**
**`foods`, `foods_custom`, `supplier_product_nutrients` und
die Tagesbilanz haengen daran ? miss es.**

`[read]` **Cholesterin ist fuer einen Bodybuilder eine Zahl,
die zaehlt** ? **13.762 Produkte fuehren sie.**

## Abnahmebedingungen

    A1  Fall a: nachgetragen. Zahl vorher/nachher.
    A2  Fall b: TABELLE mit Produktzahl, und was eine
        neue Spalte kosten wuerde. KEINE Spalte
        angelegt.
    A3  Fall c: aussortiert, je mit Grund.
    A4  die Schreibvarianten zusammengefuehrt ? eine
        Variante ist kein Raten.
    A5  Gegenprobe: ein zweiter Lauf aendert nichts.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Was nicht zu tun ist

**KEINE neue Naehrstoffspalte anlegen** ? **das entscheidet
Tom, nachdem er die Zahlen sieht.**

**`apps/` nicht anfassen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

