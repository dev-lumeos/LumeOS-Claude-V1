---
nr: C-481
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-431
entscheidung: null
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
  fehlend: 4
---

# C-481 — vier Flaechen und lat_l

## Befund 1: vier Flaechen fehlen noch

`[cmd]` **G-431 hat `gluteal` und `hamstring` geteilt:**

    gluteus-maximus   + -l, -r
    gluteus-medius    + -l, -r
    biceps-femoris    + -l, -r
    semitendinosus    + -l, -r

`[cmd]` **`public.koerperflaechen` traegt sie NICHT** ? **die
Karte zeigt sie mit dem *geerbt*-Vermerk.**

`[cmd]` **C-479 hat die fuenf aus G-430 angelegt** ? **diese vier
kamen danach.**

`[read]` **Unter `wurzel-beine`, mit Ebene 3 fuer links und
rechts** ? **dieselbe Form wie C-479.**

`[read]` **Danach faellt `AUS_AUFTEILUNG` ganz weg.**

## Befund 2: lat_l zeigt auf trapezius

Aus G-431, Claude Code:

> *,,`lat_l`/`lat_r` zeigen weiter auf `trapezius`, obwohl
> `latissimus` jetzt existiert ? ich habe es markiert und
> bewusst NICHT geaendert."*

`[cmd]` **`muskel-zuordnung.ts:143`:** `lat_l: { art:
'teilstueck', von: ... }`.

`[cmd]` **G-388 hatte den Befund schon:** *,,`lat_*` faellt auf
`trapezius`, eine Naeherung."*

`[read]` **Anatomisch falsch: der Latissimus liegt seitlich am
Ruecken, der Trapezius oben.**

`[read]` **Seit G-430 gibt es die richtige Flaeche** ? **die
Naeherung ist nicht mehr noetig.**

`[cmd]` **Und `injektion-daten.ts:79` fuehrt `lat_l` als
Injektionsort** ? **miss, ob die Umstellung dort ankommt.**

## Was zu tun ist

    1  vier Flaechen plus acht Seitenzeilen anlegen
    2  lat_l/lat_r auf latissimus statt trapezius
    3  AUS_AUFTEILUNG entfernen -- die Bruecke ist leer

`[read]` **Teil 1 ist Codex, Teil 2 und 3 sind Claude Code.**

`[read]` **Reihenfolge: erst die Flaechen, dann die
Umstellung.**
