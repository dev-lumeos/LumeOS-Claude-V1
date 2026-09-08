---
nr: G-376
typ: feature
modul: medical
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-431
entscheidung: E-74
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/medical/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  tabellen: 3
---

# G-376 — die Medical-Oberflaeche fuer Dokumente

## Befund

`[cmd]` **Seit C-431 steht das Schema live:**

    medical.health_events     13 Sp, 3 Zeilen
    medical.health_timeline   12 Sp, 4 Zeilen
    medical.appointments      12 Sp, 1 Zeile
    Bucket medical-originals  privat, 1 Objekt

`[cmd]` **Und die Oberflaeche kennt nichts davon.**

`[read]` **Neunter Fall von A-71** — **der Leseweg steht, niemand
ruft ihn.**

## Was E-74 verlangt

Tom, 2026-09-08: *,,dessen inhalt mit herkunft bei fragen des users
wiedergeben."*

`[read]` **Jede Zeile zeigt, woher sie kommt** — **wer, wann, und
ob ein Dokument dahinterliegt.**

`[read]` **LumeOS sagt nicht *,,du hast X"*, sondern *,,Dr. Y hat am
Z. X festgestellt"*.**

## Was zu bauen ist

    Dokumente     hochladen, ansehen, dem Befund zuordnen
    Termine       anlegen, aendern, absagen
    Ereignisse    Diagnose, Behandlung, Operation erfassen
    Zeitachse     alles in einer Abfolge

`[cmd]` **G-256 wartet darauf** — **die zwei Entscheidungen sind
mit E-75 gefallen.**

## Zu lesen

`[cmd]` **`00-QUELLEN.md`, Abschnitt medical** — **15 Dateien.**

`[cmd]` **Und `E-26`** — **Tom hat beide Reiter begruendet, bevor
sie gebaut wurden.**

`[read]` **Der History-Reiter aus dem Mockup ist der Ort fuer die
Zeitachse** — **C-429 hat gemessen, dass er weder Reiter noch
Tabelle hatte.**

## Auftrag

**Mitbeauftragt: G-256.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Live nachgemessen 2026-09-08

    medical.appointments      12 Sp
    medical.health_events     13 Sp
    medical.health_timeline   12 Sp
    Bucket medical-originals  privat

`[read]` **Alles steht. Die Oberflaeche kennt nichts davon.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt medical** ?
**15 Dateien.**

`[cmd]` **Dann `E-74`** ? **erfassen ist nicht diagnostizieren** ?
**und `E-75`** ? **Bucket, Pfadregel.**

`[cmd]` **Und `E-26`** ? **Tom hat beide Reiter begruendet.**

### Was E-74 verlangt

Tom: *,,dessen inhalt mit herkunft bei fragen des users
wiedergeben."*

`[read]` **Jede Zeile zeigt, woher sie kommt** ? **wer, wann, und ob
ein Dokument dahinterliegt.**

`[read]` **LumeOS sagt nicht *,,du hast X"*, sondern *,,Dr. Y hat am
Z. X festgestellt"*.**

### Was zu bauen ist

    Dokumente     hochladen, ansehen, dem Befund zuordnen
    Termine       anlegen, aendern, absagen
    Ereignisse    Diagnose, Behandlung, Operation erfassen
    Zeitachse     alles in einer Abfolge

`[cmd]` **`E-75`: Pfad `<user_id>/<report_id>.<ext>`** ? **die
Zeilensicherheit laeuft ueber das erste Segment.**

`[cmd]` **`file_ref` traegt den PFAD, nicht die URL** ? **die URL
entsteht beim Lesen, zeitlich begrenzt.**

### Der History-Reiter

`[cmd]` **C-429 hat gemessen: die alte Zeitachse hatte weder Reiter
noch Tabelle** ? **Diagnose, Behandlung, Bildgebung, Operation
lagen nirgends.**

`[read]` **Jetzt liegen sie in `health_events`** ? **der
Mockup-Reiter ist der Ort dafuer.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  eine Datei hochgeladen und wieder angesehen.
        Zahl: Groesse in Byte, Pfad.
    A2  ein Termin angelegt und geaendert.
        Zahl: appointments vorher/nachher.
    A3  je Ereignisart eine Zeile erfasst.
        Zahl: health_events vorher/nachher, je Art.
    A4  jede Zeile zeigt ihre Herkunft am Schirm.
        Zahl: Zeilen / davon mit Herkunft sichtbar.
    A5  E-72: keine nackte Null. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.
    A6  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** ? **Codex arbeitet an C-432.**
**Keine Ableitung aus den Daten** ? **E-74: kein Wert wird
bewertet.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **Tom startet ihn selbst** ? **`server.py start` in seiner
Konsole.**

`[read]` **Wenn er nicht laeuft: sagen, nicht suchen.**
`[cmd]` **Ein Neustart aus deiner Sitzung stirbt mit ihr** (A-73).

`[cmd]` **Bei `hasStartTime` im Log: nur `.next/cache/webpack`
loeschen, nie `.next`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
