---
nr: C-436
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-435
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.client_permissions]
zahlen:
  gemessen: 2026-09-08
---

# C-436 — der Test scheitert am Schutztrigger

## Befund

Aus C-435, Codex, 2026-09-08:

> *,,Ein Wiederholungslauf gegen eine aus `dev` restaurierte DB
> scheitert im Fixture-Setup am produktiven Storage-Schutztrigger
> `protect_objects_delete`, bevor eine C-434-Assertion laeuft."*

`[cmd]` **Claude Code hat denselben Trigger in G-381 gemessen:**

    IF COALESCE(current_setting('storage.allow_delete_query',
                true), 'false') != 'true' THEN
      RAISE EXCEPTION 'Direct deletion from storage tables is not
        allowed. Use the Storage API instead.'

`[read]` **Es ist eine Weiche, keine Sperre** ? **die
Sitzungseinstellung oeffnet sie.**

`[read]` **Und die Fehlermeldung nennt den vorgesehenen Weg
selbst.**

## Auftrag

**Mitbeauftragt: C-192.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · Den Test wieder lauffaehig machen

`[read]` **Miss zuerst, ob das Fixture ueberhaupt Speicherobjekte
loeschen muss** ? **oder ob es sie gar nicht anlegen sollte.**

`[read]` **Ein Test, der aufraeumen muss, hat vorher etwas
angelegt.**

`[cmd]` **Wenn das Loeschen noetig ist: die Sitzungseinstellung
setzen, nicht den Trigger umgehen.**

`[read]` **Und im Test vermerken, warum** ? **damit niemand denkt,
der Schutz sei laestig.**

### 2 · C-192 — was noch offen ist

`[read]` **Lies den Punkt und miss, was heute davon steht.**

`[read]` **Wenn er ueberholt ist: schliessen mit Begruendung.**

### Abnahmebedingungen

    A1  warum das Fixture loescht: gemessen, mit Fundstelle.
    A2  der Test laeuft wieder. Zahl: Zusicherungen, Sekunden.
    A3  der Schutztrigger bleibt scharf ausserhalb des Tests.
        Belegt.
    A4  C-192: Stand gemessen, offen oder geschlossen mit Grund.
    A5  Vollkette laeuft durch. Schritte und Sekunden.

### Was nicht zu tun ist

**Den Trigger nicht entfernen** ? **er ist die Sperre gegen
direktes SQL.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-384.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
