---
nr: C-479
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-430
entscheidung: null
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
  fehlend_flaechen: 5
  unverbunden: 78
---

# C-479 — fuenf Flaechen und achtundsiebzig Muskeln

## Befund

Aus G-430, Claude Code, 2026-09-08.

`[cmd]` **Die Karte hat seit G-430 26 Flaechen:**

    latissimus, teres-major, teres-minor,
    erector-spinae, flanke        -- NEU
    upper-back, lower-back        -- weg

`[cmd]` **`public.koerperflaechen` traegt weiter:**

    upper-back, upper-back-l, upper-back-r
    lower-back, lower-back-l, lower-back-r

`[read]` **Die fuenf neuen fehlen** ? **die Karte zeigt sie mit
dem Vermerk *,,geerbt ? diese Flaeche steht noch nicht in
public.koerperflaechen"*.**

`[cmd]` **`AUS_AUFTEILUNG` in `apps/web` ueberbrueckt es** ?
**die einzige doppelte Stelle, faellt weg, sobald die Zeilen
stehen.**

## Was zu bauen ist

**1** ? **Fuenf Flaechen unter `wurzel-ruecken`, je mit Ebene 3
fuer links und rechts.**

    latissimus       + latissimus-l, latissimus-r
    teres-major      + -l, -r
    teres-minor      + -l, -r
    erector-spinae   + -l, -r
    flanke           + -l, -r

`[read]` **Und `upper-back`/`lower-back` fallen weg** ? **oder
bleiben als Elternteil?**

`[cmd]` **Messen, ob etwas sie liest.**

**2** ? **Die 78 unverbundenen Muskelnamen.**

`[cmd]` **Selbst gemessen:**

    training.muscle_groups                95
    davon mit koerperflaechen verbunden   17

`[cmd]` **Nicht verbunden, unter anderem:** `Abductors`, `Arms`,
`Back`, `Core`, `Gluteus Maximus`, `Forearm Extensors`,
`Brachialis`, `Hip Flexors`.

`[read]` **Nicht alle GEHOEREN verbunden** ? `Arms` **und**
`Core` **sind Wurzeln, keine Flaechen.**

`[read]` **Aber `Gluteus Maximus` und `Brachialis` sind Muskeln,
die die Karte zeigt.**

`[cmd]` **G-430 hat deshalb `MUSKEL_ZU_FLAECHE` BEHALTEN** ?
**die Handliste traegt die Abdeckung, die Tabelle die
Hierarchie.**

`[read]` **Ziel: die Handliste faellt weg.**

## Was zu messen ist

**1** ? **Welche der 78 zeigt die Karte ueberhaupt?**

`[read]` **Ein Muskelname ohne Flaeche ist kein Fehler** ?
`Grip Muscles` **zeichnet niemand.**

**2** ? **Und welche fehlen der Karte?**

`[cmd]` **G-425 und G-430 haben vier Luecken gefunden:**
**Rhomboiden, Obliquus internus, Soleus, und die Flanke ohne
eigenen Muskelnamen.**

`[read]` **Die bleiben Luecken** ? **sie werden nicht erfunden.**
