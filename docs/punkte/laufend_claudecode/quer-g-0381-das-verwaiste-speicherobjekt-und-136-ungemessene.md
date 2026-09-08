---
nr: G-381
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-380
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/medical/dokumente-write.ts
zahlen:
  gemessen: 2026-09-08
  objekte: 3
  ssot_geprueft: 21
  ssot_ungemessen: 135
---

# G-381 — das verwaiste Speicherobjekt und 135 ungemessene Dateien

## Befund 1 — ein Objekt ohne Zeile

Aus G-380, Claude Code, 2026-09-08.

`[cmd]` **Der A4-Nachweis liess ein Objekt zurueck** ? **die
Buehne wurde abgeraeumt, `lab_reports` steht wieder bei 2, das
Objekt bei 3.**

`[cmd]` **Direktes DELETE ist durch `storage.protect_delete`
gesperrt.** `[cmd]` **Der Dienstschluessel ist seit 2026-08-03
absichtlich entfernt.** `[cmd]` **Und die Anwendung hat keinen
Loeschweg** ? `rg` **findet kein `.remove(`.**

`[read]` **Er hat aufgehoert, statt einen zu bauen** ? richtig.

> *,,Ein Original zu loeschen ist eine Entscheidung mit Gewicht."*

## Befund 2 — die Zahl 3 ist eine untere Schranke

`[cmd]` **21 von 156 SSOT-Dateien geprueft, 3 ueberholt.**

`[read]` **Seine eigene Einschraenkung:** *,,Die Methode faengt nur
Dokumente mit einem falsifizierbaren Merkmal. Eine Datei kann
inhaltlich ueberholt sein, waehrend jeder Name noch stimmt."*

`[cmd]` **135 Dateien sind ungemessen.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Ein Loeschweg fuer Originale

`[read]` **Nicht das eine Objekt entfernen** ? **den Weg bauen,
den ein Nutzer braucht.**

`[cmd]` **`E-75`: der Bucket ist privat, `owner_id = auth.uid()`.**
`[cmd]` **`storage.protect_delete` sperrt heute jedes DELETE.**

`[read]` **Miss zuerst, was `protect_delete` genau tut** ? **und
ob es einen bewussten Weg vorsieht oder alles sperrt.**

`[read]` **Ein Nutzer muss sein Dokument entfernen koennen** ?
**sonst ist der Bucket eine Falle: hochladen ja, zuruecknehmen
nie.**

`[cmd]` **Und `file_ref` muss mit** ? **ein Verweis auf ein
geloeschtes Objekt ist schlimmer als keiner.**

### 2 · Die restlichen 135 SSOT-Dateien

`[read]` **Deine Methode faengt falsifizierbare Merkmale** ?
**Dateinamen, Funktionsnamen, Spalten.**

`[read]` **Lauf sie ueber alle 156** ? **die 21 waren eine Stichprobe,
keine Auswahl.**

`[cmd]` **Und melde je Datei EIN Merkmal, das nicht mehr stimmt** ?
**nicht den ganzen Inhalt bewerten.**

`[read]` **Was danach bleibt, ist inhaltlich zu pruefen** ? **das
ist Handarbeit und ein eigener Punkt.**

### Abnahmebedingungen

    A1  protect_delete: was sperrt es genau? Fundstelle.
    A2  ein Loeschweg, oder der Nachweis, dass er nicht gebaut
        werden darf.
    A3  ein Original geloescht und file_ref geleert.
        Zahl: objects vorher/nachher.
    A4  156 SSOT-Dateien geprueft. Zahl: geprueft / mit
        falschem Merkmal, je mit einem Satz.
    A5  das verwaiste Objekt: weg oder benannt geblieben.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-434.**
**Kein Dienstschluessel** ? **er ist absichtlich weg.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

`[read]` **Und sag, wenn deine Aenderung einen Neustart braucht.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
