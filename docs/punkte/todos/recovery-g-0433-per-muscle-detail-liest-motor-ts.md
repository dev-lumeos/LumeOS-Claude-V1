---
nr: G-433
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-432
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/motor.ts
zahlen:
  gemessen: 2026-09-08
  zeilen: 18
---

# G-433 — Per-muscle detail liest motor.ts

## Toms Befund

Tom, 2026-09-08, nach G-432:

> ich sehe nichts neues aufgeloest und frage mich echt, was es
> braucht, um das endlich zu loesen.

## Was am Schirm steht

`[cmd]` **`/v2/recovery?tab=muscles`, `Per-muscle detail`:**

    Upper back      14 h  18 Saetze   17 %
    Rear delts      14    8           20
    Trapezius       14    8           27
    Biceps          14   10           27
    Forearm         14    6           32
    Front delts     38   10           39
    Chest           38   14           44
    Quadriceps      62   20           47
    Lower back      62   10           50
    Hamstrings      62   12           50
    Triceps         38   12           52

`[cmd]` **Kopf: *,,18 Gruppen"*.**

`[read]` **`Upper back` und `Lower back` gibt es in der Karte
seit G-430 NICHT mehr** ? **dort stehen `latissimus`,
`teres-major`, `teres-minor`, `erector-spinae`, `flanke`.**

`[read]` **Und keine Hierarchie: achtzehn Zeilen flach, keine
Gruppe, kein Kind.**

## Woher die Namen kommen

`[cmd]` **`apps/web/src/app/v2/recovery/motor.ts:41`:**

    trapezius: 'Trapezius', upper_back: 'Upper back', ...

`[read]` **Eine EIGENE Namensliste** ? **mit `koerperflaechen`
hat sie nichts zu tun.**

`[cmd]` **`motor.ts` ist 34 KB** ? **G-430, G-431 und G-432 haben
sie nie angefasst.**

`[cmd]` **Und `tab-messwerte.tsx:113` rendert die Karte mit
`title="Per-muscle detail"`.**

## Was G-432 gebaut hat

`[cmd]` **`apps/web/src/lib/koerper/`:**

    hierarchie.ts        die Rechnung
    hierarchie-read.ts   die Abfrage
    muskelbaum.ts        der Baum
    muskelbaum-read.ts
    ebenen.ts            22 Eintraege, gegen die DB geprueft
    pfadnamen.ts         40 Paare, 158 Pfade

`[cmd]` **`muskelbaum.ts` traegt den Baum, `hierarchie.ts` die
Zugehoerigkeit** ? **die Liste liest beides nicht.**

`[cmd]` **`modale.tsx:117` sagt es selbst:** *,,G-430: der
Flaechenbaum ? fuer *Per-muscle detail*"* ? **gebaut, nicht
gerufen.**

## Der Auftrag

`[read]` **`Per-muscle detail` liest `muskelbaum`, nicht
`motor.ts`.**

**Toms Vorgabe aus G-432, Schritt 6:**

> per muscle detail bildet ALLE muskelgruppen und deren childs ab

    Ruecken
      Latissimus dorsi    Wert
      Trapezius           Wert
      Rhomboiden          (nicht gezeichnet)
      Teres major         Wert
    Beine
      Quadriceps
        Rectus femoris    Wert
      Hamstrings
        Biceps femoris    Wert
        Semitendinosus    Wert

`[cmd]` **G-432 hat gemessen: 21 von 95 gezeichnet, 74
Luecken** ? **die Luecken stehen drin, nicht weggelassen.**

## Und die Werte

`[read]` **Die Zahlen (Stunden, Saetze, Muskelkater, Erholung)
kommen aus `motor.ts`** ? **die bleiben.**

`[read]` **Nur die NAMEN und die ORDNUNG kommen aus dem Baum.**

`[cmd]` **Miss, welche der achtzehn Namen aus `motor.ts` einen
Gegenpart im Baum haben** ? **`upper_back` hat keinen.**

`[read]` **Wo einer fehlt: melden, nicht erfinden.**

## Abnahmebedingungen

    A1  Per-muscle detail liest muskelbaum. Belegt.
    A2  die Hierarchie ist sichtbar: Gruppe, darunter
        Kinder. Foto.
    A3  die 74 Luecken stehen drin. Zahl.
    A4  die Werte kommen weiter aus motor.ts. Belegt.
    A5  motor.ts-Namen ohne Gegenpart im Baum: Liste.
    A6  Gegenprobe: der alte Zustand -> faellt sie?
    A7  vier Module unveraendert.
    A8  apps/web 1660 oder mehr.

## Was nicht zu tun ist

**`motor.ts` NICHT umbauen** ? **sie rechnet, das bleibt.**
**Keinen Namen erfinden.**
**Nichts in `supabase/`** ? **C-472 liegt bei Codex.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Nachgemessen 2026-09-08 — braucht es Codex zuerst?

Tom: *,,bist du sicher? denn ich glaube dir nichts mehr. er meinte,
codex muesse zuerst anlegen."*

`[cmd]` **Gemessen: NEIN.**

`[cmd]` **`muskelbaum-read.ts` liest `training.muscle_groups`:**

    .schema('training').from('muscle_groups')
    .select('id,name,parent_id')

`[cmd]` **95 Namen, vier Ebenen** ? **`koerperflaechen` kommt
darin nicht vor.**

`[read]` **Die LISTE braucht Codex nicht.**

## Was Codex braucht, trifft die FARBE

`[cmd]` **`public.koerperflaechen` traegt heute noch:**

    gluteal, gluteal-l, gluteal-r
    hamstring, hamstring-l, hamstring-r
    quadriceps, quadriceps-l, quadriceps-r
    calves, calves-l, calves-r
    tibialis, tibialis-l, tibialis-r

`[cmd]` **Die KARTE hat seit G-431:**

    gluteus-maximus, gluteus-medius
    biceps-femoris, semitendinosus

`[read]` **Die vier fehlen in der Tabelle** ? **das ist C-482,
und es trifft, welche Flaeche sich faerbt.**

`[read]` **Nicht, welche Namen die Liste zeigt.**

## Also: dieser Auftrag geht JETZT

`[read]` **`Per-muscle detail` kann sofort auf `muskelbaum`
umgestellt werden.**

`[read]` **Die Farbe bleibt, wie sie ist, bis C-482 durch ist.**

`[cmd]` **Und `E1: 8, E2: 26, E3: 34`** ? **die dritte Ebene
steht, die vierte fehlt (C-482).**

`[read]` **Die Liste zeigt die vier Ebenen aus `muscle_groups`**
? **sie ist nicht auf `koerperflaechen` angewiesen.**

## Zurueckgelegt 2026-09-08

`[cmd]` **Lag ohne Bericht in `laufend_claudecode`** ? **der
Auftrag ging raus, der Agent hat ihn nie bearbeitet.**

`[read]` **Ueberholt durch G-440 und G-441:**

`[cmd]` **G-440 hat `MUSCLE_STATE` aus dem Rechenweg der
Muscle-map-Kachel entfernt** ? **das war der Kern dieses
Punktes.**

`[cmd]` **G-441 traegt den Rest: die Today-Kachel rechnet
weiter aus der Attrappe.**

`[cmd]` **Und 22 `MUSCLE_STATE`-Treffer stehen noch in
`recovery/`** ? **`ansicht.tsx:357` und `:521`.**

`[read]` **Vor einem neuen Auftrag messen, was G-440 und G-441
davon schon erledigt haben.**
