---
nr: G-436
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-435
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/tab-messwerte.tsx
zahlen:
  gemessen: 2026-09-08
  namen: 105
  mit_wert: 22
---

# G-436 — die Hierarchie als Ansicht

## Toms Vorgabe

Tom, 2026-09-08:

> wir haben eine schoene auflistung und die soll aufgebohrt werden
> auf die hierarchie darunter im style von parent/childs, immer
> offen, und jedes teil anwaehlbar fuer details ? gruppen und
> einzelmuskel

> ich denke irgendwann kriegen wir die auswertung von
> training/recovery auch soweit, dass wir einzelne muskeln
> ansteuern koennen

`[read]` **Die obere Liste** (`Per-muscle detail`, 18 Zeilen)
**WIRD die Hierarchie** ? **sie wird nicht ergaenzt.**

`[read]` **Die untere Liste** (`HIERARCHIE ? 22 von 105 ? 83
Luecken`) **faellt weg** ? **sie war der Notbehelf aus G-435.**

## Was die Ansicht zeigt

    Arms                 O 62%  ?  schwaechstes: Biceps 31%
      Biceps             31%    1/3 ? 14h
      Brachialis         --     kein Volumen zugeordnet
      Forearms           O 68%  ?  schwaechstes: Brachiorad. 37%
        Brachioradialis  37%    0/3 ? 14h
        Wrist Flexors    --     kein Volumen zugeordnet

Tom: *,,wieso waehlen, wenn man beides haben kann? schnitt von
kindern MIT WERTEN und daneben schwaechstes glied."*

`[read]` **Der Schnitt rechnet NUR ueber Kinder mit Wert** ?
**ein Kind ohne Volumen zieht ihn nicht herunter.**

`[read]` **Und das schwaechste Glied ist der Engpass** ? **wer
trainieren will, sieht sofort, was noch nicht bereit ist.**

## Drei Zustaende, nicht zwei

    Wert        gemessen                 31%  1/3 ? 14h
    --          kein Volumen zugeordnet
    (grau)      nicht gezeichnet

`[read]` **Die Luecke wird BENANNT, nicht verschwiegen** ? **und
sie sagt, WARUM sie da ist.**

`[cmd]` **Gemessen:**

    exercise_muscles   6.588 Zuordnungen
      auf Blatt        2.152
      auf Gruppe       3.331
      auf Wurzel       1.105

`[read]` **Ein Muskel ohne Volumenzuordnung kann keinen Wert
haben** ? **das ist C-487, die Daten kommen nach.**

`[cmd]` **Und der Muskelkater: `checkins.soreness` traegt
`{"back": 1, "chest": 1}`** ? **zwei Regionen, kein
Muskelname.**

`[read]` **Ein Muskel kann also Volumen haben und keinen
Kater** ? **die Ansicht muss beides getrennt zeigen koennen.**

## Immer offen

Tom: *,,immer offen."*

`[read]` **Kein Aufklappen, kein Zustand** ? **die ganze
Hierarchie steht da.**

`[cmd]` **105 Namen in vier Ebenen** ? **das ist lang, aber
vollstaendig.**

`[read]` **Wenn es zu lang wird: melden, nicht kuerzen.**

## Jedes Teil anwaehlbar

Tom: *,,jedes teil anwaehlbar fuer details ? gruppen und
einzelmuskel."*

`[read]` **Ein Klick auf `Biceps` zeigt den Bizeps.**

`[read]` **Ein Klick auf `Arms` zeigt die Gruppe** ? **mit ihren
Kindern, dem Schnitt und dem Engpass.**

`[cmd]` **G-435 hat das Modal geraeumt** ? **es zeigt jetzt den
Muskel, seine Gruppe, seine Geschwister.**

`[read]` **Miss, ob dasselbe Modal fuer eine GRUPPE taugt** ?
**oder ob es eine zweite Form braucht.**

## Was aus der Karte kommt

`[cmd]` **G-434: 43 Kartenflaechen, jeder Muskel einzeln
anwaehlbar.**

`[read]` **Ein Klick auf der Karte und ein Klick in der Liste
sollten dasselbe zeigen.**

`[cmd]` **`public.koerperflaechen`: 51 Zeilen, `art`,
`muscle_group_id`, `parent_id`** ? **die Bruecke steht.**

## Abnahmebedingungen

    A1  Per-muscle detail IST die Hierarchie. Die untere
        Liste ist weg. Foto vorher/nachher.
    A2  je Gruppe: Schnitt der Kinder MIT Wert, plus
        das schwaechste Glied. Gemessen an einem Zweig,
        von Hand nachgerechnet.
    A3  drei Zustaende unterscheidbar: Wert, kein
        Volumen, nicht gezeichnet. Je ein Beispiel.
    A4  immer offen, kein Aufklappen. Foto.
    A5  jede Zeile anwaehlbar -- Gruppe UND Muskel.
        Zwei Fotos.
    A6  Klick auf der Karte und in der Liste zeigen
        dasselbe. Belegt.
    A7  Gegenprobe: der Schnitt mit einem erfundenen
        Kind -> faellt sie?
    A8  vier Module unveraendert, je ein Foto.
    A9  apps/web 1670 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINEN Wert erfinden, wo keiner ist** ? **`--` ist die
Antwort, nicht 0.**

**Den Schnitt NICHT ueber Kinder ohne Wert rechnen** ? **er
waere falsch.**

**Nichts in `supabase/`** ? **Codex arbeitet an C-485 und
C-486.**

**`exercise_muscles` nicht anfassen** ? **das ist C-487.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
