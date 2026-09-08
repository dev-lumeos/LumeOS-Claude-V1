---
nr: E-76
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-379, C-136, C-434, E-74, E-75]
modul: coach
---

# E-76 — Originale bleiben beim Nutzer

## Entscheidung

Tom, 2026-09-08:

> die werte reichen einem coach, dann muss er nichts suchen

`[read]` **Ein Coach sieht Werte und Ereignisse, nie das
Original.**

## Was gilt

    medical_visibility='full'   Medikamente, Conditions,
                                Termine, Ereignisse, Zeitachse
    medical-originals           Owner-only, immer

`[cmd]` **Keine `medical_originals_visibility`-Freigabe** ? **der
Vorschlag aus C-136 wird nicht gebaut.**

## Warum

Tom: *,,dann muss er nichts suchen."*

`[read]` **Ein Coach, der einen Scan bekommt, muesste den Wert
darin suchen** ? **den er strukturiert schon hat.**

`[read]` **Der Scan gibt ihm nichts dazu, was er braucht** ? **aber
alles, was zufaellig auf demselben Blatt stand.**

`[cmd]` **Briefkopf, Unterschrift, Versichertennummer, andere
Befunde derselben Seite.**

## Und es vereinfacht

`[read]` **Keine zweite Freigabestufe, kein zweites
Aenderungsprotokoll, keine Frage *,,welches Dokument"*.**

`[cmd]` **`medical-originals` bleibt, wie E-75 es angelegt hat:**
**privat, `owner_id = auth.uid()`, Pfad ueber die Nutzerkennung.**

`[read]` **Die sichere Vorgabe war schon richtig** ? **sie bleibt
einfach stehen.**

## Was daraus folgt

`[cmd]` **C-434 baut Policies fuer `appointments` und
`health_events`** ? **nicht fuer Storage.**

`[read]` **Und wenn ein Nutzer seinem Coach doch ein Dokument
zeigen will:** **er kann es herunterladen und selbst schicken.**

`[read]` **Das ist kein Mangel, sondern die Grenze** ? **er
entscheidet je Dokument, nicht ein Schalter fuer alle.**
