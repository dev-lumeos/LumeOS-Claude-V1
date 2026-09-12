---
nr: C-484
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-483
entscheidung: E-81
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
  zeilen_heute: 68
---

# C-484 — koerperflaechen nach E-81

## Die Entscheidung

`[cmd]` **E-81, Tom, 2026-09-08:**

    Tiefe        parent_id, KEINE Ebenenzahl
    Bedeutung    art: wurzel | gruppe | muskel | umriss
                 (spaeter: kopf)
    Seite        eine SPALTE am Messwert,
                 keine eigene Flaechenzeile

> die trainings muessen bis auf die kleinsten muskeln
> runterbrechen koennen

## Was heute dasteht

`[cmd]` **`public.koerperflaechen`: 68 Zeilen.**

    E1   8 Wurzeln
    E2  26 Flaechen
    E3  34 Seiten

`[cmd]` **Spalten:** `id`, `parent_id`, `code`, `name_de`,
`name_en`, `ebene`, `art`, `seite`, `muscle_group_id`,
`hinweis`, `sortierung`.

`[cmd]` **Und die KARTE hat 43 Flaechen** (G-434) ? **die
Tabelle 26.**

## Was zu bauen ist

**1** ? **Die 34 Seitenzeilen fallen weg.**

`[cmd]` **`latissimus-l` und `latissimus-r` werden zu einer
Zeile `latissimus`.**

`[read]` **Miss, wer sie heute liest** ? **`recovery` ist der
einzige Tabellenleser** (C-479).

**2** ? **Die Spalte `ebene` faellt weg.**

`[read]` **`parent_id` traegt die Tiefe, `art` die Bedeutung.**

`[cmd]` **Miss, wer `ebene` liest** ? **wenn jemand die Tiefe
braucht, gibt `WITH RECURSIVE` sie.**

**3** ? **`art` bekommt `kopf`.**

`[read]` **Noch nicht benutzt** ? **aber der CHECK muss es
erlauben, bevor jemand Muskelkoepfe anlegt.**

**4** ? **Die 43 Kartenflaechen anlegen.**

`[cmd]` **G-434 hat die Karte auf 43 gebracht** ?
`adductor-brevis`, `adductor-longus`, `gluteus-maximus`,
`gluteus-medius`, `biceps-femoris`, `semitendinosus` **und
die uebrigen.**

`[cmd]` **`AUS_AUFTEILUNG` in `apps/web` ueberbrueckt heute die
Luecke** ? **danach faellt sie weg.**

**5** ? **`seite` an die Tabellen mit Flaechenbezug.**

`[cmd]` **`medical.user_injection_site_selections` hat
`body_area_code`** ? **es braucht `seite` dazu.**

`[read]` **Miss, welche anderen Tabellen auf eine Flaeche
zeigen.**

`[cmd]` **C-482 hat die zehn Muskelnamen in den Kettenschritt
gelegt, aber NICHT live eingespielt** ? **das kommt mit.**

## Was NICHT zu tun ist

`[read]` **Keine Muskelkater-Tabelle bauen** ? **C-462 hat
gemessen, dass die Werte in `checkins.soreness` und
`checkins.pain_areas` stehen.**

`[read]` **Ob dort eine Seite hinkommt, ist ein eigener
Punkt.**

`[read]` **Und `apps/` nicht anfassen** ? **Claude Code stellt
die Oberflaeche um (G-435).**

## Abnahmebedingungen

    A1  ebene faellt weg. Wer las sie? Gemessen.
    A2  34 Seitenzeilen weg, 68 -> 34.
    A3  art erlaubt kopf. CHECK belegt.
    A4  die 43 Kartenflaechen angelegt. Zahl.
    A5  seite an user_injection_site_selections und
        an alles andere mit Flaechenbezug. Liste.
    A6  die zehn C-482-Namen sind live.
    A7  RLS und Rechte unveraendert:
        authenticated SELECT, anon nichts.
    A8  Struktur nach migrations/, Daten in _pipeline/.
    A9  Waechter GRUEN -- oder jede rote Zeile mit Grund
        im Sollstand.
    A10 Sicherung, Vollkette, Punktelauf.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen** ? **NICHT anfassen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
