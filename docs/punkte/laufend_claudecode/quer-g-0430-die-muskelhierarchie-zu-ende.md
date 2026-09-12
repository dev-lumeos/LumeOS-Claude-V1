---
nr: G-430
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-468
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  flaechen: 59
  module: 4
---

# G-430 — die Muskelhierarchie zu Ende bringen

## Warum dieser Punkt

Tom, 2026-09-08: *,,irgendwie entsteht hier ein ghetto. in der
grafik ist der latissimus noch nicht anwaehlbar. ich sehe noch
kein parent/child konzept."*

`[read]` **Die Grundlage steht seit C-468 und wird von NIEMANDEM
gelesen.**

`[cmd]` **`public.koerperflaechen`: 59 Zeilen, drei Ebenen,
`parent_id`, `art`, `muscle_group_id`.**

`[cmd]` **Und vier Module arbeiten weiter mit eigenen Listen:**

    packages/ui/koerperkarte-pfade.ts     23 Flaechen, flach
    recovery/muskel-zuordnung.ts          18 Gruppen,
                                          17 Teilstuecke
    recovery/muskel-ebenen.ts             6 Namen auf
                                          upper-back
    lib/medical/injektion-flaechen.ts
    lib/medical/koerperflaechen.ts

`[read]` **Drei Aufraeumpunkte (G-424, G-427) und dieser
Durchgang** ? **die zwei sind aufgeloest, hier steht alles.**

## Was gemessen ist

`[cmd]` **G-425 hat jeden Ruecken-Pfad einzeln eingefaerbt und
fotografiert:**

    upper-back Pfad 1 / 4    Teres major
    upper-back Pfad 2 / 5    Teres minor / oberer Lat-Rand
    upper-back Pfad 3 / 6    Latissimus dorsi
    lower-back  4 Pfade      Erector spinae + Flanke

`[cmd]` **Die anderen 21 Flaechen buendeln EINEN Muskel** ?
`triceps` **hat drei Koepfe und bleibt ein Muskel.**

`[cmd]` **Und drei Muskeln fehlen ganz:** **Rhomboiden, Obliquus
internus, Soleus** ? **nicht gezeichnet.**

`[cmd]` **`training.muscle_groups`: 7 Wurzeln, 88 Kinder, VIER
Ebenen** ? `Arms > Forearms > Forearm Extensors > Extensor Carpi
Radialis`.

## Der Durchgang, drei Teile

### 1 · Jeder Pfad zeigt auf eine Flaeche

`[read]` **`upper-back` wird aufgeteilt:**

    teres_major        Pfad 1, 4
    teres_minor        Pfad 2, 5
    latissimus         Pfad 3, 6

`[read]` **`lower-back` ebenso:** **Erector spinae und Flanke.**

`[read]` **Die Pfade bleiben UNVERAENDERT** ? **nur die
Zuordnung aendert sich.**

`[cmd]` **Und je Flaeche eine `koerperflaechen.id`** ? **die
Tabelle traegt schon `code`.**

### 2 · Die vier Module lesen die Tabelle

`[read]` **Statt fuenf eigener Listen: eine Quelle.**

`[cmd]` **`muskel-ebenen.ts` wirft heute sechs Namen auf
`upper-back`** ? **zwei davon (Rhomboiden, Mid Back) zeigt die
Karte gar nicht.**

`[read]` **Nach dem Umbau faellt diese Datei weg oder wird
duenn** ? **die Hierarchie steht in der Datenbank.**

`[read]` **Miss, was jedes Modul heute aus seiner Liste holt** ?
**und ob die Tabelle dasselbe liefert.**

### 3 · parent/child wird sichtbar

Tom: *,,ein bodybuilder nutzt uebungen fuer einzelne muskeln
sowie gebuendelt."*

    ein Klick auf "Back"        faerbt alle Kinder
    ein Klick auf "Latissimus"  faerbt nur ihn
    Per-muscle detail           zeigt den Elternteil

`[cmd]` **`recovery` hat *Per-muscle detail*** ? **Tom nennt es
ausdruecklich.**

`[read]` **Und die Modale** ? **sie zeigen heute keine
Hierarchie.**

## Was NICHT zu tun ist

`[read]` **Keinen Pfad neu zeichnen.**

`[read]` **Die drei fehlenden Muskeln NICHT erfinden** ?
**Rhomboiden, Obliquus internus und Soleus bleiben Luecken, und
die Luecke wird sichtbar.**

`[read]` **Und nichts in `supabase/`** ? **die Tabelle steht.**

## Abnahmebedingungen

    A1  upper-back und lower-back aufgeteilt, je Pfad
        eine Flaeche. Bildschirmfoto je neuer Flaeche.
    A2  Latissimus einzeln anwaehlbar. Foto.
    A3  die vier Module lesen koerperflaechen.
        Je Modul: was es vorher las, was jetzt.
    A4  ein Klick auf einen Elternteil faerbt die Kinder.
        Zwei Fotos.
    A5  Per-muscle detail zeigt den Elternteil.
    A6  die drei fehlenden Muskeln: sichtbar als Luecke,
        nicht erfunden.
    A7  Recovery, Supplements, Medical und Coach sehen
        unveraendert aus, wo sie es sollen. Je ein Foto.
    A8  apps/web 1620 oder mehr, apps/coach 65.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
