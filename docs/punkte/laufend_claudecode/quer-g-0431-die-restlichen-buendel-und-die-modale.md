---
nr: G-431
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-430
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  buendel: 14
---

# G-431 — die restlichen Buendel und die Modale

## Toms Befund

Tom, 2026-09-08, nach G-430:

> Muscle recovery: sehe ich nun latissimus/teres major/teres minor,
> aber alle anderen bundles wurden nicht freigeloest wie
> calves/quadriceps/adductors/abs/forearm/obliques/neck/triceps/
> hamstrings.

> Per-muscle detail: werden die alten gelistet, da will ich das
> parent/child konzept sehen, sowie die einzelnen modals
> angepasst ? sprich wenn gruppe, wird im modal aufgeschluesselt,
> und wenn child, dann nur dieses.

## Was gemessen ist

`[cmd]` **VIERZEHN Flaechen mit mehr als zwei Pfaden je
Ansicht:**

    obliques      front 16
    hands         front 12  back 11
    abs           front  8
    hamstring     front  8
    calves        front  4  back  8
    forearm       front  6  back  8
    triceps       front  2  back  6
    adductors     front  6  back  2
    quadriceps    front  6
    neck          front  5  back  2
    gluteal       front  4
    knees         front  4
    ankles        front  4  back  2
    feet          front  4  back  2

`[read]` **G-430 hat NUR den Ruecken aufgeteilt** ? **fuenf
Flaechen aus zwei.**

## Die Regel aus G-425 gilt weiter

    EIN Muskel, mehrere Pfade     zusammenlassen
    Spiegelpaare                  links/rechts trennen
    VERSCHIEDENE Muskeln          aufteilen

`[cmd]` **G-425 hat `triceps` geprueft:** **acht Pfade, EIN
Muskel mit drei Koepfen** ? **zusammenlassen.**

`[cmd]` **Und C-468 hat `obliques` geprueft:** **sechzehn Pfade,
EIN Muskel je Seite plus sieben Zeichenteile** ? **der Internus
liegt darunter und wird nicht gezeichnet.**

`[read]` **Zwei der vierzehn sind also schon entschieden.**

`[read]` **Die anderen zwoelf sind UNGEPRUEFT.**

## Was anatomisch zu erwarten ist

`[read]` **Nicht als Vorgabe, als Anhaltspunkt** ? **das Bild
entscheidet:**

    quadriceps    vier Koepfe, aber EIN Muskel
                  (rectus femoris, vastus lateralis/
                   medialis/intermedius)
    hamstring     DREI Muskeln je Seite
                  (biceps femoris, semitendinosus,
                   semimembranosus)
    calves        ZWEI je Seite
                  (gastrocnemius, soleus)
    adductors     mehrere (longus, magnus, brevis)
    forearm       Beuger und Strecker -- zwei Gruppen
    neck          Sternocleidomastoideus, Trapezius-Anteil
    abs           rectus abdominis -- EIN Muskel,
                  die Segmente sind Sehnenzwischenstuecke
    hands/feet/
    ankles/knees  Umriss, kein Muskel (art='umriss')

`[cmd]` **`training.muscle_groups` fuehrt sie:** `Biceps Femoris`,
`Gluteus Maximus/Medius/Minimus`, `Forearm Extensors`,
`Forearm Flexors`, `Hip Adductors`.

`[read]` **Die Namen stehen** ? **sie muessen nicht erfunden
werden.**

## Teil 2: die Modale

Tom: *,,wenn gruppe, wird im modal aufgeschluesselt, und wenn
child, dann nur dieses."*

`[read]` **Ein Klick auf `Back` zeigt im Modal die Kinder mit je
ihrem Wert.**

`[read]` **Ein Klick auf `latissimus` zeigt nur ihn.**

`[cmd]` **G-430 hat das Detail gebaut** (`hierarchie.ts`,
`hierarchie-read.ts`) ? **die Modale nicht.**

## Teil 3: Per-muscle detail listet die alten

Tom: *,,werden die alten gelistet."*

`[cmd]` **Miss, WORAUS die Liste kommt** ? **aus
`MUSKEL_ZU_FLAECHE` oder aus `koerperflaechen`?**

`[read]` **G-430 hat die Handliste bewusst behalten** ? **60 von
96 Namen erreichen die Tabelle.**

`[read]` **Aber die LISTE sollte die Hierarchie zeigen, auch wenn
die Farbe aus der Handliste kommt.**

## Abnahmebedingungen

    A1  je der zwoelf ungeprueften Flaechen: ein Bild
        je Pfad, wie in G-425. Welcher Muskel?
    A2  aufgeteilt oder zusammengelassen, je mit
        Begruendung aus dem Bild. TABELLE.
    A3  Umriss-Flaechen (hands, feet, ankles, knees)
        als art='umriss' behandelt, nicht aufgeteilt.
    A4  die Modale: Gruppe -> aufgeschluesselt,
        Kind -> nur dieses. Zwei Fotos.
    A5  Per-muscle detail zeigt die Hierarchie.
        Foto vorher/nachher.
    A6  was NICHT gezeichnet ist, bleibt Luecke.
    A7  vier Module unveraendert, je ein Foto.
    A8  apps/web 1631 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Keinen Pfad neu zeichnen.**
**Keinen Muskelnamen erfinden** ? **`training.muscle_groups`
fuehrt 95.**
**Nichts in `supabase/`** ? **C-479 liegt bei Codex.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
