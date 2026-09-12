---
nr: G-438
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-436
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-438 — Karte und Liste widersprechen sich

## Toms Befund

Tom, 2026-09-08:

> das ist unlogisches ghetto. beispiel arms triceps ist orange,
> zeigt aber keine werte in der liste

> hauptgruppen sollen besser ersichtlich sein und gegen naechste
> hauptgruppe unterteilt sein

## Der Widerspruch, gemessen

`[cmd]` **Was die KARTE faerbt:**

    triceps-longum      -> Triceps Brachii Long Head
    triceps-lateralis   -> Triceps Brachii Lateral Head
    triceps-mediale     -> Triceps Brachii Medial Head

`[cmd]` **Wo das VOLUMEN liegt:**

    Triceps   305 Uebungszuordnungen
              Eltern: Arms

`[cmd]` **Und `MUSCLE_STATE` in `motor.ts`:**

    triceps: { hours: 38, sets: 12, soreness: 1,
               lastSession: 'Push B - Wed' }

`[read]` **Drei Stellen, drei Kennungen:**

    Karte       triceps-longum, -lateralis, -mediale
    Hierarchie  Triceps  (und drei Koepfe darunter)
    motor.ts    triceps

`[read]` **Die Karte faerbt die KOEPFE, der Wert haengt am
ELTERNTEIL, und die Uebersetzung fehlt.**

`[read]` **Also: orange auf der Karte, `--` in der Liste.**

## Was zu bauen ist

**1** ? **Die Uebersetzung `motor.ts` -> `muscle_groups`.**

`[cmd]` **`MUSCLE_STATE` hat 18 Schluessel** ? `chest`,
`front_deltoids`, `triceps`, `upper_back`, `biceps` ...

`[cmd]` **`muscle_groups` hat 105 Namen.**

`[read]` **Miss, welche der 18 einen Gegenpart haben** ?
`triceps` **-> `Triceps` ist offensichtlich, `upper_back` nicht
(die Gruppe heisst `Upper Back`, aber die Karte hat sie
aufgeteilt).**

`[read]` **Wo eine Zuordnung nicht eindeutig ist: MELDEN.**

**2** ? **Ein Wert am Elternteil vererbt sich NICHT nach unten.**

`[read]` **Wenn `Triceps` 38h hat, haben die drei Koepfe KEINE
38h** ? **sie haben keinen eigenen Wert.**

`[read]` **Aber die Gruppe `Triceps` zeigt ihn.**

`[cmd]` **Dann faerbt die Karte die Koepfe nach dem Wert der
GRUPPE** ? **und die Liste sagt es:**

    Triceps                     38%  1/3 - 38h
      Triceps Brachii Long Head  --   Wert von der Gruppe
      ...

`[read]` **Oder die Karte faerbt sie NICHT** ? **Toms
Entscheidung.**

`[read]` **Was nicht geht: orange faerben und `--` schreiben.**

**3** ? **Die Hauptgruppen abgrenzen.**

Tom: *,,hauptgruppen sollen besser ersichtlich sein und gegen
naechste hauptgruppe unterteilt sein."*

`[cmd]` **Acht Wurzeln:** `Arms`, `Back`, `Chest`, `Core`,
`Legs`, `Neck Muscles`, `Shoulders`, **plus eine.**

`[read]` **Heute stehen sie in derselben Schriftgroesse wie die
Kinder, nur linksbuendig** ? **`Arms` und `Biceps` sehen
gleich wichtig aus.**

`[read]` **Eine Trennlinie zwischen den Wurzeln, und die Wurzel
deutlich groesser oder anders gesetzt.**

## Und die Laenge

`[cmd]` **Die Kachel ist 2.551 px** ? **zwei Bildschirme.**

`[read]` **G-436 hat gefragt, Tom hat nicht geantwortet** ?
**miss, ob die Abgrenzung es besser lesbar macht.**

`[read]` **Wenn nicht: melden, nicht kuerzen.**

## Abnahmebedingungen

    A1  die 18 motor.ts-Schluessel gegen muscle_groups.
        TABELLE: Schluessel, Gegenpart, oder MELDUNG.
    A2  kein Muskel ist auf der Karte gefaerbt und in
        der Liste leer. Gemessen an ALLEN 43 Flaechen.
    A3  wo ein Wert von der Gruppe kommt, sagt die Liste
        es. Foto.
    A4  die acht Wurzeln sind abgegrenzt. Foto
        vorher/nachher.
    A5  Gegenprobe: eine Flaeche gefaerbt ohne
        Listenwert -> faellt sie?
    A6  vier Module unveraendert, je ein Foto.
    A7  apps/web 1676 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINEN Wert nach unten vererben** ? **die Koepfe haben keine
eigene Messung.**

**KEINE Zuordnung erfinden** ? **wo `motor.ts` und
`muscle_groups` nicht zusammenpassen, wird es gemeldet.**

**`motor.ts` nicht umbauen** ? **sie rechnet, das bleibt.**

**Nichts in `supabase/`** ? **Codex arbeitet an C-485 und
C-486.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
