---
nr: G-435
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-432
entscheidung: E-81
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/modale.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-435 — die Hierarchie an den richtigen Ort

## Teil 1: die Liste steht am falschen Ort

Tom, 2026-09-08:

> in den details hat es eine auflistung *,,Alle Muskelgruppen ?
> 22 von 95 gezeichnet ? 73 Luecken"* ? fuer was ist die?

`[cmd]` **`modale.tsx:730-800`** ? **die vollstaendige Hierarchie
mit Einrueckung, *(nicht gezeichnet)* und der Pille *hier*.**

`[read]` **Aus G-432/A6, technisch richtig gebaut** ? **aber sie
steht im MODAL eines EINZELNEN Muskels.**

`[read]` **Wer den Latissimus anklickt, will den Latissimus
sehen** ? **nicht alle 95 Gruppen.**

Tom:

> Per-muscle detail die auflistung: da will ich parent und
> darunter childs sehen.

**Also:**

    Modal (ein Muskel)    nur dieser Muskel, seine Gruppe,
                          seine Geschwister
    Per-muscle detail     die Hierarchie: Gruppe, darunter
      (die Kachel)        eingerueckt die Kinder mit Werten

`[cmd]` **Die Kachel ist heute flach
(`tab-messwerte.tsx:113`) und liest `motor.ts`.**

`[cmd]` **G-433 stellt sie um und laeuft noch** ? **stimme dich
damit ab: G-433 baut die Kachel, dieser Auftrag raeumt das
Modal.**

## Teil 2: die Seite wird eine Spalte

`[cmd]` **E-81, Tom entschieden:**

    Tiefe        parent_id, KEINE Ebenenzahl
    Bedeutung    art: wurzel | gruppe | muskel | umriss
    Seite        eine SPALTE am Messwert

`[read]` **Begruendung:** *,,die trainings muessen bis auf die
kleinsten muskeln runterbrechen koennen."*

`[read]` **Eine feste Ebenenzahl zwingt dazu, die Tiefe vorher zu
kennen** ? **`Chest > Pectoralis Major > Pars clavicularis` sind
drei, `Legs > Lower Legs > Calves > Gastrocnemius > Caput
mediale` sind fuenf.**

`[read]` **Und die Seite gehoert zur MESSUNG, nicht zum
Muskel.**

### Dein Teil

`[read]` **Die Karte faerbt weiter beide Seiten getrennt** ?
**sie liest die Seite aus dem Messwert statt aus der
Flaechenzeile.**

`[cmd]` **Miss, wo heute eine Seitenzeile (`latissimus-l`)
gelesen wird** ? **und wo stattdessen Flaeche plus Seite stehen
muss.**

`[read]` **`supabase/` gehoert Codex** (C-484) ? **melde, was die
Oberflaeche braucht, BEVOR er anfaengt.**

## Abnahmebedingungen

    A1  das Modal zeigt den Muskel, seine Gruppe, seine
        Geschwister -- nicht alle 95. Foto vorher/nachher.
    A2  Per-muscle detail zeigt Gruppe + eingerueckte
        Kinder mit Werten. Foto. (Abstimmung mit G-433.)
    A3  wo heute Seitenzeilen gelesen werden: Liste.
    A4  was die Oberflaeche nach dem Umbau braucht:
        gemeldet, BEVOR Codex baut.
    A5  Gegenprobe: der alte Zustand -> faellt sie?
    A6  vier Module unveraendert, je ein Foto.
    A7  apps/web 1661 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex baut die Tabelle um.**
**Keinen Muskelnamen erfinden.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
