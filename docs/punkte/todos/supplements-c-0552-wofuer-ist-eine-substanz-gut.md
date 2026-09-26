---
nr: C-552
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: [C-546]
kind_von: null
entscheidung: E-89
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-09-08
  substanzen: 617
---

# C-552 - wofuer ist eine Substanz gut?

## Toms Regel

Tom, 2026-09-08:

> unser ruling funktioniert genau gleich. der user hat in
> seinem stack die peptides und welche dosis er verwenden will,
> wir haben nur das wissen ? sprich ellenbogen painpoint sehne,
> folglich sinnvoll bpc157 und tb500 injizieren

`[read]` **Die Grenze ist nicht *kein Stoffname neben einem
Koerperteil* ? sie ist: WIR ERFINDEN NIE DIE DOSIS.**

    LumeOS weiss   der Painpoint sitzt an einer Sehne
                   welche Stoffe damit in Verbindung
                   gebracht werden
                   wo die Stelle dafuer liegt

    Der Nutzer     hat das Peptid in seinem Stack
                   und die Dosis, die er verwenden will

`[cmd]` **Das ist E-89 an einem schaerferen Beispiel.**

## Der Befund

`[cmd]` **50 Tabellen haengen an einer Substanz:**
Pharmakologie, Sicherheit, WADA, Organrisiken,
Wechselwirkungen, Laborwerte, Dosierung, Qualitaet.

`[cmd]` **KEINE sagt, wofuer sie gut ist.**

`[read]` **Ohne diese Bruecke bleibt der Painpoint eine
Sackgasse ? und Toms Beispiel unbaubar.**

## Der Evidenzgrad ist Pflicht

`[cmd]` **BPC-157: Grad E. TB-500 (Fragment): E.
Thymosin beta-4 (full): D. Thymosin alpha-1: B.**

`[read]` **Wenn LumeOS sagt *bei Sehnenschmerz kommen BPC-157
und TB-500 in Betracht*, MUSS das E daneben stehen** ? **sonst
liest es sich als Empfehlung.**

`[cmd]` **Toms eigener Katalog zeigt die Haltung schon:
1-Testosterone steht dort mit *Beleglage D ? schwach belegt*
und *WADA verboten*.**

## Zu klaeren

    A  gibt es eine Quelle fuer Anwendungsgebiete?
       supplement_tags hat 425 Zeilen -- was steht drin?
    B  welches Gegenstueck? Gewebe (Sehne, Knorpel,
       Muskel), Symptom (medical.symptoms, 34), oder
       ein eigener Begriff?
    C  wie viele der 617 lassen sich belegen?
    D  eine Substanz kann mehreres ? mehrwertig,
       wie die Tierarten in C-540.

## Abnahmebedingungen

    A1  eine Relation Substanz -> Anwendung,
        mehrwertig.
    A2  der Evidenzgrad ist Pflichtfeld, nicht optional.
    A3  wie viele der 617 belegt, wie viele nicht? Zahl.
    A4  die Reste GEMELDET, nicht geraten.
    A5  Gegenprobe: eine Anwendung ohne Beleg laesst
        sich NICHT speichern.
    A6  KEINE Dosis, kein Schema -- E-89.
    A7  Sicherung, Vollkette, ALLE Waechter.
