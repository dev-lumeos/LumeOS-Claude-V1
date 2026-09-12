---
nr: G-432
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-431
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  pfade: 160
---

# G-432 — jeder gezeichnete Muskel ist anwaehlbar

## Toms Auftrag, woertlich

Tom, 2026-09-08:

> 1. schauen was die grafik an einzelmuskeln hergibt
> 2. online anatomie analysieren und matchen
> 3. muskelgruppen definieren und childs zuweisen
> 4. auf der grafik muss jeder angezeigte muskel anwaehlbar sein
>    (nicht die gruppe)
> 5. die details zeigen die zugehoerigkeit
> 6. per muscle detail bildet alle muskelgruppen und deren childs
>    ab

## Warum es bisher schieflief

`[read]` **Der Orchestrator hat bei Schritt 4 angefangen** ?
**ohne 1 bis 3.**

`[cmd]` **Und mit einer falschen Regel:** *,,triceps hat drei
Koepfe und bleibt EIN Muskel"* (G-425) ? **anatomisch falsch,
dreimal weitergereicht.**

`[read]` **Die Frage war nie *,,ist das ein Muskel?"*** ?
**sondern *,,welchen Muskel zeigt dieser Pfad?"*.**

## Schritt 1 — was die Grafik hergibt

`[cmd]` **160 Pfade in 28 Flaechen.**

`[cmd]` **`docs/bilder/g431/`: 38 Einzelbilder, 13 Tafeln** ?
**fuer zwoelf Flaechen.**

`[read]` **Die anderen sechzehn sind nicht einzeln fotografiert**
? **`chest`, `biceps`, `deltoids`, `trapezius`, `obliques`,
`tibialis`, `knees` und die Rueckenflaechen aus G-430.**

`[read]` **Je Pfad ein Bild, bis alle 160 einen Namen haben.**

`[read]` **Wo ein Pfad KEINEN eigenen Muskel zeigt** (Segment,
Sehne, Schattierung) ? **das wird so benannt.**

## Schritt 2 — Anatomie abgleichen

`[read]` **Je Pfad: welcher Muskel ist das anatomisch?**

`[cmd]` **`training.muscle_groups` fuehrt 95 Namen in vier
Ebenen** ? **das ist die Namensquelle.**

`[cmd]` **Beispiele, gemessen:**

    Legs > Quadriceps  > Rectus Femoris
    Legs > Hamstrings  > Biceps Femoris
                       > Semimembranosus
                       > Semitendinosus
    Legs > Glutes      > Gluteus Maximus / Medius / Minimus
    Legs > Lower Legs  > Calves / Anterior Tibialis /
                         Tibialis Posterior / Peroneals
    Arms > Triceps
    Back > Latissimus dorsi / Rhomboids / Teres Major /
           Trapezius / Erector spinae

`[read]` **Wo die Grafik einen Muskel zeigt, den
`muscle_groups` NICHT fuehrt** ? **melden.**

`[read]` **Wo `muscle_groups` einen fuehrt, den die Grafik nicht
zeigt** ? **auch melden.**

`[read]` **Nichts erfinden, in beide Richtungen.**

## Schritt 3 — Gruppen und Kinder

`[read]` **Die Hierarchie steht in `muscle_groups`** ? **sie wird
uebernommen, nicht neu erfunden.**

`[cmd]` **`public.koerperflaechen` traegt heute 59 Zeilen plus
die fuenf aus C-479** ? **Ebene 1 Wurzel, 2 Flaeche, 3
Seite.**

`[read]` **Eine vierte Ebene kann noetig werden:** **Wurzel >
Gruppe > Muskel > Seite.**

`[cmd]` **Das ist Codex** ? **melden, nicht bauen.**

## Schritt 4 — jeder Muskel anwaehlbar

Tom: *,,jeder angezeigte muskel anwaehlbar (NICHT die gruppe)."*

`[read]` **Ein Klick trifft den MUSKEL, nicht seine Gruppe.**

`[cmd]` **Heute faerbt ein Klick auf `latissimus` drei Flaechen**
(G-430: `["latissimus","teres-major","teres-minor"]`) ? **das
ist die Gruppe.**

`[read]` **Nach dem Umbau: ein Klick auf den Latissimus faerbt
den Latissimus.**

## Schritt 5 — das Detail zeigt die Zugehoerigkeit

`[read]` **Wer einen Muskel waehlt, sieht, zu welcher Gruppe er
gehoert.**

    Latissimus dorsi
    gehoert zu: Ruecken

## Schritt 6 — Per-muscle detail bildet alles ab

Tom: *,,bildet ALLE muskelgruppen und deren childs ab."*

`[read]` **Nicht eine Liste der gefaerbten Flaechen** ? **die
vollstaendige Hierarchie.**

    Ruecken
      Latissimus dorsi      Wert
      Trapezius             Wert
      Rhomboiden            (nicht gezeichnet)
      Teres major           Wert
    Beine
      Quadriceps
        Rectus femoris      Wert
      Hamstrings
        Biceps femoris      Wert
        Semitendinosus      Wert

`[read]` **Was nicht gezeichnet ist, steht als Luecke drin** ?
**nicht weggelassen.**

## Abnahmebedingungen

    A1  alle 160 Pfade benannt. TABELLE: Pfad, Bild,
        Muskel, muscle_groups-Name.
    A2  wo kein eigener Muskel: als Segment/Sehne/
        Schattierung benannt.
    A3  Grafik ohne muscle_groups-Namen: gemeldet.
        muscle_groups ohne Grafik: gemeldet.
    A4  jeder gezeichnete Muskel einzeln anwaehlbar.
        Foto: Klick auf Latissimus faerbt NUR ihn.
    A5  das Detail zeigt die Gruppe. Foto.
    A6  Per-muscle detail zeigt die vollstaendige
        Hierarchie, Luecken eingeschlossen. Foto.
    A7  braucht koerperflaechen eine vierte Ebene?
        Gemeldet, nicht gebaut.
    A8  vier Module unveraendert, je ein Foto.
    A9  apps/web 1642 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Keinen Pfad neu zeichnen.**
**Keinen Muskelnamen erfinden** ? **`muscle_groups` ist die
Quelle.**
**Nichts in `supabase/`** ? **C-481 liegt bei Codex.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
