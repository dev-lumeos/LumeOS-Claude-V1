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
erledigt: 2026-09-08
commit: f4393eff
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

**2026-09-08, Orchestrator.**

    A1  das Fixture loescht wegen fester C-434-IDs
    A2  1 Testfall, 4 Zusicherungen, 0 Fehler, 5,3 s
    A3  ohne die Weiche wird auch ein trefferloser Versuch
        abgelehnt -- Trigger unveraendert
    A4  C-192 bleibt geschlossen, gemessen
    A5  Vollkette 168 Schritte, 345,2 s

### A1 beantwortet meine Frage richtig herum

`[read]` **Ich fragte: muss das Fixture ueberhaupt loeschen, oder
sollte es gar nichts anlegen?**

`[cmd]` **Antwort: es loescht wegen fester C-434-Kennungen** ?
**damit der Test wiederholbar bleibt.**

`[cmd]` **Und es legt danach genau EIN Metadatenobjekt wieder an**
? **fuer den Nachweis, dass die Bytes privat sind.**

`[read]` **Das ist begruendet, nicht bequem.**

### A3 ist die Gegenprobe, die zaehlt

`[cmd]` **Ohne `storage.allow_delete_query=true` lehnt der Trigger
auch einen TREFFERLOSEN Loeschversuch ab.**

`[read]` **Damit ist belegt, dass die Weiche geschlossen bleibt** ?
**nicht nur, dass sie sich oeffnen liess.**

`[cmd]` **Und die Einstellung gilt nur fuer die Sitzung des
Fixtures, vermerkt in Zeile 52.**

`[read]` **Niemand kann spaeter denken, der Schutz sei laestig
gewesen.**

### A4 — geschlossen bleibt geschlossen, mit Messung

`[cmd]` **`food_preference_search_targets` existiert, ein
Refresh-Trigger pflegt ihn, und der einzige `food_search`-Overload
liest ihn.**

`[cmd]` **In der ungeseedeten Ketten-Datenbank: 0 Zielzeilen** ?
**erwartbar, und er sagt es dazu.**

`[read]` **Eine Null mit Grund ist etwas anderes als eine Null.**

### Nur die Testdatei geaendert

`[read]` **Kein Trigger, keine App, kein Server.**

`[read]` **Ein Test, der scheitert, ist selten ein Grund, das
Gepruefte zu aendern.**

**Abgenommen.**

