---
nr: A-61
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: null
erledigt: 2026-08-29
commit: OFFEN
beruehrt:
  dateien:
    - tools/nummern-pruefen.mjs
zahlen:
  gemessen: 2026-08-29
  auftraege_dateien: 71
  berichte_dateien: 74
  todo_md_bytes: 270193
  erledigt_md_bytes: 681505
---

# A-61 — das alte Auftragswesen abloesen

## Befund

**Tom, 2026-08-29:** *,,laufend gibt es nicht mehr wir arbeiten nur
noch mit punkten"*.

`[cmd]` **Der Altbestand liegt noch vollstaendig da:**

    docs/todo/LAUFEND.md          1.809 B
    docs/todo/TODO.md           270.193 B
    docs/todo/ERLEDIGT.md       681.505 B
    docs/auftraege/                  71 Dateien
    docs/berichte/                   74 Dateien

`[cmd]` **Und `tools/nummern-pruefen.mjs` prueft dagegen** — fuenf
seiner Pruefungen betreffen `LAUFEND.md`, `docs/auftraege/` und
`docs/berichte/`.

## Warum es nicht nur Aufraeumen ist

`[read]` **A-59: Code ohne Aufrufer wird beim naechsten Auftrag fuer
gebaut gehalten.** **Bei 145 Auftrags- und Berichtsdateien gilt das
doppelt** — sie sehen aus wie gueltige Vorgaben.

`[cmd]` **Aber `punkte-pruefen.mjs` meldet: *,,69 Verweise nur ueber
`ERLEDIGT.md` aufloesbar"*.** `[read]` **Die alten Dateien tragen
Historie, die noch gebraucht wird** — sie duerfen nicht verschwinden,
nur aus dem Weg.

## Schritte

    1  LAUFEND.md weg, die zwei Pruefungen dazu aus dem Waechter
    2  docs/auftraege/ und docs/berichte/ nach docs/_archive/
       die drei Pruefungen dazu aus dem Waechter
    3  messen, was von nummern-pruefen.mjs bleibt

`[read]` **Nach jedem Schritt das Gate pruefen** — der Waechter hat
am 23.08. drei falsche Eintraege gefunden, die niemand bemerkt hatte.
**Was von ihm bleibt, soll bleiben.**

## Abnahme

**2026-08-29, Orchestrator. Selbst gemessen.**

### Schritt 1 — `LAUFEND.md`

`[cmd]` **Geloescht.** `[cmd]` **Zwei Pruefungen aus
`nummern-pruefen.mjs` entfernt** (`laufend-unbekannt`,
`laufend-erledigt`) **samt ihren Sabotagen.**

### Schritt 2 — die alten Ordner

`[cmd]` **145 Dateien nach `docs/_archive/` verschoben** — 71
Auftraege, 74 Berichte, mit `git mv`, also mit Historie.

`[cmd]` **Der Ordnerumzug am Stueck scheiterte an *Permission
denied*** — einzeln ging es. `[read]` **`docs/auftraege/wartend/` war
leer** und ist der Rest des alten Abhaengigkeitsverfahrens.

`[cmd]` **Vier weitere Pruefungen entfernt:** `auftrag-ohne-punkt`,
`auftrag-ohne-bericht`, `auftrag-vor-vorbedingung`,
`bericht-ohne-auftrag`.

### Was bleibt, und warum

`[cmd]` **Sieben Sabotagen fallen weiterhin:** `dublette-todo`,
`dublette-erledigt`, `beide-dateien`, `haken-in-todo`,
`uebersicht-veraltet`, `kopfzaehler`, `ssot-ohne-index`.

`[read]` **Und `vorbedingung-unbekannt` bleibt** — sie haengt am
Register, nicht an den Ordnern. **Eine Vorbedingung, die es nicht
gibt, ist ein Tippfehler.**

`[cmd]` **`TODO.md` und `ERLEDIGT.md` bleiben, wo sie sind** —
`punkte-pruefen.mjs` meldet **69 Verweise, die nur ueber `ERLEDIGT.md`
aufloesbar sind.**

### Schritt 3 — `CLAUDE.md`

`[cmd]` **Drei Stellen nachgezogen:** *,,Wer arbeitet woran"* nennt
jetzt den Ordnernamen statt einer Tabelle, die Berichtsablage nennt
die Punktdatei statt `docs/berichte/`, und zwei Nebenerwaehnungen
sind bereinigt.

`[read]` **Toms Satz vom 20.08. steht weiter drin** — *,,eine
laufende Todoliste, wo du nachschauen kannst, was wo laeuft"*. **Er
gilt; nur die Antwort darauf ist eine andere.**

**Abgenommen.**
