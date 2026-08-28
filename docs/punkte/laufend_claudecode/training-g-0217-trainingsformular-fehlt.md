---
nr: G-217
typ: feature
modul: training
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-216
agent: claudecode
beauftragt: 2026-08-28
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/training/sitzung-write.ts
    - apps/web/src/app/v2/training
zahlen: null
---

# G-217 — der Trainings-Schreibweg hat keine Oberflaeche

## Befund

Aus G-216, 2026-08-28.

`[read]` **Der Schreibweg ist gebaut und geprueft** — Sitzung
anlegen, Uebung hinzufuegen, Saetze eintragen, abschliessen, mit
Waechter je Tabelle und Rueckbau. `[read]` **Es fehlt das Formular.**

`[cmd]` Der Bildschirm zeigt im Verlaufsreiter eine Attrappe *,,Add
to session"*, **die genau den fehlenden Weg markiert.**

`[read]` **Zweimal an einem Tag habe ich in einem Auftrag ein
Bildschirmfoto verlangt, wo ein Schreibweg gebaut wurde** — bei
G-122 und G-216. **Der Fehler ist meiner, nicht der der Arbeit:** ein
Schreibweg ist kein Bild.

## Was zu tun ist

**Das Formular auf den vorhandenen Schreibweg setzen.** `[read]` Der
Baum entsteht schrittweise — **jemand faengt an, traegt zwischendurch
ein, hoert auf.** Die Oberflaeche muss das aushalten, nicht nur den
abgeschlossenen Fall.

`[cmd]` **Der offene Zustand existiert im Schema** (`active` mit
`ended_time IS NULL`) **und ist im Bestand unbenutzt: 0 von 66.**
`[read]` **Er wird erst durch das Formular entstehen** — und dann
sofort haeufig.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

### Zu tun

**Das Formular auf den Schreibweg aus G-216 setzen.**

`[read]` **Der Baum entsteht schrittweise** — jemand faengt an, traegt
zwischendurch ein, hoert auf. **Die Oberflaeche muss das aushalten,
nicht nur den abgeschlossenen Fall.**

`[cmd]` **Der offene Zustand existiert im Schema und ist im Bestand
unbenutzt** — `active` mit `ended_time IS NULL`, 0 von 66. `[read]`
**Er wird erst durch dieses Formular entstehen, und dann sofort
haeufig.** **Was passiert beim naechsten Aufruf, wenn eine Sitzung
offen ist?** Fortsetzen, verwerfen, fragen — **entscheide und
begruende.**

`[cmd]` **Die Attrappe *,,Add to session"* im Verlaufsreiter markiert
den Ort.**

### Was aus G-216 uebernommen gehoert

`[read]` **Die Naht ist gebaut** — `sitzung-write.ts`, drei Ebenen,
ein Waechter je Tabelle. **Das Formular ruft sie, es baut keine
zweite.**

`[cmd]` **`exercise_name` friert beim Schreiben ein** — live
gegengeprobt. **Das Formular darf den Namen nicht nachschlagen,
sondern muss ihn mitgeben.**

### Was nicht zu tun ist

**Keine eigene Uebung anlegen koennen** — E-17, die Tabelle gibt es
nicht.
**Kein Trainingsplan, keine Vorlagen.**
**Die `planned`-Sitzungen nicht berichtigen** — das ist C-330 und
gehoert in ein `CHECK`, nicht in ein Formular.
**Keine Tabelle anlegen** — Codex arbeitet an C-331.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Sitzung anlegen               ueber das Formular
    Uebung hinzufuegen            ueber das Formular
    Saetze eintragen              ueber das Formular
    unterbrechen und wiederkommen was passiert - belegt
    abschliessen                  Zustand unterscheidbar
    exercise_name eingefroren     Gegenprobe wie in G-216
    Attrappen im Modul            vorher / nachher
    Rueckbau                      gezaehlt, `dev` unberuehrt
    Bildschirmfoto je Zustand     `node tools/schuss.mjs`

`[read]` **Diesmal ist das Bildschirmfoto berechtigt** — zweimal
heute habe ich es verlangt, wo ein Schreibweg gebaut wurde. **Hier
gibt es etwas zu sehen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
