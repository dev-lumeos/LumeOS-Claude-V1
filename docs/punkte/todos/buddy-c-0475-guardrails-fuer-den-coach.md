---
nr: C-475
typ: entscheidung
modul: buddy
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [coach.pending_actions]
zahlen:
  gemessen: 2026-09-08
---

# C-475 — Guardrails fuer den KI-Coach

## Woher

`[cmd]` **Due Diligence openGym, Abschnitt 09.**

`[read]` **Das Fremdprojekt bekommt 7/10 fuer KI-Safety und 3/10
fuer Wissensqualitaet** ? **die Muster sind gut, die Grundlage
nicht.**

## Die acht Muster

    1  Allowlist-Payload
       Plan, Training, Koerpergewicht, Einschraenkungen,
       Praeferenzen -- NUR nach Kategorie-Einwilligung

    2  pseudonymer Handle
       Nutzer-ID, Name, Passkeys, Push-Daten, andere
       Profile ausgeschlossen

    3  striktes JSON-Schema
       geschlossene Liste von 18 Aenderungstypen

    4  nur bekannte IDs
       eine unbekannte Exercise-ID macht den GANZEN
       Vorschlag ungueltig

    5  All-or-nothing
       genau EIN Repair-Versuch

    6  Plan-Fingerprint
       gegen Vorschlaege auf veraltetem Stand

    7  Snapshot und Undo

    8  begrenzte Reichweite
       der Coach aendert Plan und Routinen,
       NICHT Historie, Koerpergewicht oder Einstellungen

## Was LumeOS heute hat

`[cmd]` **`coach.pending_actions`** ? **Vorschlag mit
10-Minuten-Frist, wartet auf Bestaetigung des Klienten.**

`[cmd]` **F-06 4.3:** *,,Der Coach schreibt nie direkt."*

`[read]` **Das deckt Muster 8 ab** ? **die Reichweite ist
begrenzt.**

`[read]` **Die anderen sieben fehlen.**

## Was besonders zaehlt

**Muster 4** ? **eine unbekannte ID macht den ganzen Vorschlag
ungueltig.**

`[read]` **Nicht *,,die eine Uebung weglassen"*** ? **der ganze
Vorschlag faellt.**

`[read]` **Weil ein halb angewandter Plan schlimmer ist als
keiner.**

**Muster 6** ? **der Fingerprint.**

`[read]` **Ein Vorschlag, der auf einem alten Plan beruht, darf
nicht auf den neuen angewandt werden.**

`[cmd]` **`pending_actions` hat eine FRIST (10 Minuten), aber
keinen Fingerprint** ? **wer in der Frist den Plan aendert,
bekommt den Vorschlag trotzdem.**

## Und die Schmerzregel

`[cmd]` **Das Fremdprojekt:** *,,konservativ bleiben, schmerzhafte
Bewegung meiden, professionelle Hilfe empfehlen, NICHT
diagnostizieren."*

`[cmd]` **LumeOS E-74** ? **dieselbe Regel, fuer Medical.**

`[read]` **Sie gilt auch fuer Training.**

## Was zu entscheiden ist

`[read]` **Welche der acht Muster gelten fuer Buddy?**

`[cmd]` **Buddy ist heute 42 von 42 Bauteilen** ? **alles
Attrappe, keine Modellanbindung.**

`[read]` **Die Guardrails gehoeren VOR die Anbindung** ? **nicht
danach.**
