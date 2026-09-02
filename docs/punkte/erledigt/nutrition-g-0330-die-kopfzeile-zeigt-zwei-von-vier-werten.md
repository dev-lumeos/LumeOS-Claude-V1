---
nr: G-330
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: eecfede1
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-330 — die Kopfzeile zeigt zwei von vier Werten

## Befund

Tom, 2026-09-02:

> normale eintraege sind auch noch nicht vollstaendig: Totale im
> header fuer alle werte und beschriftung darunter, dann zaehlt die
> auch fuer den inhalt

`[cmd]` **Die Kopfzeile einer Mahlzeit zeigt heute:**

    07:30  Breakfast · 3 items        413 kcal · 23g P

`[cmd]` **Die Zeilen darunter zeigen vier Werte:**

    Vollkornbrot   81 g   170 kcal   6 g   31 g   1 g

`[read]` **Der Kopf summiert zwei, die Zeilen zeigen vier.**

## Was zu bauen ist

Tom, 2026-09-02, praezisiert:

> es sind 5 werte die in header als total rein muessen und einzeln in
> den positionen. gewicht/kalorien/protein/kohlenhydrate/fat
>
> header zeigt total von gewicht/kalorien/protein/kohlenhydrate/fat
> und darunter die spaltenueberschrift was es ist, kann verstaendliche
> kurzform sein wie G/KCAL/P/K oder C/F. diese spalten muessen mit den
> unteren korrespondieren dass sie auch fuer die einzelwerte sichtbar
> passen

**Fuenf Werte, nicht vier** — **das Gewicht gehoert dazu.**

    07:30  Breakfast · 3 items      333  413   23   47    2
                                      G  KCAL    P    K    F

    Vollkornbrot                      81  170    6   31    1
    Ei (roh)                         126  170   17    0   11
    Apfel                            126   73    1   15    1

`[read]` **Die Summe des Gewichts ist eine Angabe, die heute
fehlt** — **und sie ist die einzige, die man direkt nachwiegen
kann.**

`[read]` **Und die Spalten muessen senkrecht fluchten:** `[cmd]`
**die Ueberschrift im Kopf steht ueber derselben Spalte wie die
Einzelwerte darunter.** `[read]` **Sonst beschriftet sie nichts.**

`[cmd]` **Reihenfolge: Gewicht, kcal, Protein, Kohlenhydrate, Fett.**
`[cmd]` **Heute zeigt `mahlzeiten.tsx:799` kcal, P, C, F** — **das
Gewicht steht davor in der Zeile, aber nicht im Kopf.**

## Auftrag

**Mitbeauftragt mit G-329 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit G-329 abgenommen: gebaut.**

`[cmd]` **Fuenf Werte statt zwei:** *333g 413kcal 23P 46K 13F*.
`[cmd]` **8 von 8 Spalten fluchten, delta 0.**

`[read]` **Die Beschriftung steht im `<thead>` derselben Tabelle** —
**nicht als gerechneter Abstand in der Kopfzeile.** `[cmd]` **Der
erste Versuch lag 66 px daneben, der Ausgleich verschob die ganze
Karte.**

`[cmd]` **Und der Kopf summiert ungerundet und rundet einmal am
Ende** — er erbt nicht die Rundungsfehler der Anzeige.
