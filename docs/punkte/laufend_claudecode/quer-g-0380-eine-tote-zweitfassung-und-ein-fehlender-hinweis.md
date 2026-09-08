---
nr: G-380
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-378
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  zeilen_neu: 499
  zeilen_echt: 502
---

# G-380 — eine tote Zweitfassung und ein fehlender Hinweis

## Befund 1 — `ansicht.tsx.neu` ist committet

Aus G-378, Claude Code, 2026-09-08, selbst gemeldet.

`[cmd]` **Nachgemessen: `apps/web/src/app/v2/recovery/
ansicht.tsx.neu` ist getrackt, seit `84bb575f`.**

`[cmd]` **499 Zeilen gegen 502 im Original, nicht gleich.**

`[cmd]` **Es ist die einzige `.neu`-Datei im Repo.**

`[read]` **Eine zweite Fassung einer lebenden Datei, ohne
Aufrufer** ? **sie wird irgendwann gelesen und fuer den Stand
gehalten.**

`[read]` **Sein Schreibhelfer haette sie mit `os.replace`
verbrauchen sollen** ? **er hat sie nicht geloescht, sondern
gemeldet.** `[cmd]` **Richtig: kein untracktes Verzeichnis wird
dem Namen nach geloescht** ? **und ein getracktes erst recht
nicht.**

## Befund 2 — der Bucket lehnt `text/plain` ohne Vorwarnung ab

`[cmd]` **`allowed_mime_types`: pdf, jpeg, png, heic.**

`[read]` **Wer eine `.txt` waehlt, bekommt einen Fehler, wo ein
`accept`-Merkmal und ein benannter Hinweis hingehoeren.**

`[read]` **Dieselbe Klasse wie E-72:** **ein Fehler, wo eine
Erklaerung stehen sollte.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die Zweitfassung

`[read]` **Miss zuerst, was sie enthaelt** ? `git diff` **gegen
das Original.**

`[read]` **Wenn nichts Eigenes drinsteht: entfernen.**
`[read]` **Wenn doch: melden, was, bevor du sie entfernst.**

`[read]` **Und sieh nach, ob dein Schreibhelfer sie erzeugen
kann** ? **einmal ist ein Versehen, zweimal ist ein Fehler im
Werkzeug.**

### 2 · Der Dateihinweis

`[cmd]` **`accept` am Eingabefeld, aus den erlaubten Arten
abgeleitet** ? **nicht aus dem Gedaechtnis geschrieben.**

`[read]` **Und ein Satz daneben, der sagt, was geht** ? **statt
eines Fehlers hinterher.**

### 3 · Die Modul-Dateien in `docs/ssot/`

`[cmd]` **A-74: die SSOT lag zwoelf Tage zurueck.**
`[cmd]` **`00-ABGENOMMEN.md` traegt jetzt 326 Punkte, erzeugt.**

`[read]` **Aber die Beschreibung des Ist-Zustands je Modul ist
Handarbeit** ? **und `recovery`, `medical` und `supplements` haben
sich in zwei Tagen stark veraendert.**

`[read]` **Miss, welche Modul-Datei in `docs/ssot/` ueberholt ist**
? **und melde es, ohne sie zu schreiben.**

`[cmd]` **`docs/` gehoert dem Orchestrator** ? **du misst, ich
schreibe.**

### Abnahmebedingungen

    A1  ansicht.tsx.neu: was steht drin, was nicht im Original?
        Entfernt oder gemeldet, mit Grund.
    A2  der Schreibhelfer: kann er sie wieder erzeugen? Belegt.
    A3  accept am Feld, aus den erlaubten Arten. Eine .txt
        waehlen: was geschieht jetzt?
    A4  eine erlaubte Datei hochladen: geht weiter. Belegt.
    A5  docs/ssot/: welche Modul-Dateien sind ueberholt?
        Zahl: geprueft / ueberholt, je mit einem Satz.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-434.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`** ? **Tom haelt
ihn.**

`[read]` **Und sag mir, wenn deine Aenderung einen Neustart
braucht** ? `packages/ui`, `.env`, `next.config`, neue
Abhaengigkeiten.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
