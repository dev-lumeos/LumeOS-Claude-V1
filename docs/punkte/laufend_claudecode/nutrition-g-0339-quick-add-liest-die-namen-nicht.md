---
nr: G-339
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-232
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/kopfknoepfe.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-339 — Quick-Add liest die Namen nicht

## Befund

Aus G-294, Claude Code, 2026-09-02.

`[cmd]` **Die Komponente ist gebaut** — **aber sie traegt eine
sechste Namensliste**, mit einem ungueltigen Wert: `preworkout`
statt `pre_workout`.

`[read]` **G-335 hat fuenf Listen auf `KATEGORIE_TEXT`
zusammengefuehrt.** `[read]` **Diese ist durchgerutscht, weil sie
einen anderen Schluessel schreibt.**

`[cmd]` **Und der `meal_type`-CHECK kennt `preworkout` nicht** —
`pre_workout` ja, `preworkout` nein.

## Zu tun

**Anschluss an `KATEGORIE_TEXT`, und der Wert berichtigt.**

`[read]` **Danach gibt es eine Namensquelle, nicht sechs.**

## Auftrag — eine Namensquelle, und zwei Reste

**Mitbeauftragt: G-302, GO-23.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-339 — die sechste Liste

`[cmd]` **Du hast sie selbst gefunden:** `kopfknoepfe.tsx` **traegt
eine eigene Namensliste mit `preworkout` statt `pre_workout`.**

`[cmd]` **Der `meal_type`-CHECK kennt `preworkout` nicht.**

`[read]` **Anschluss an `KATEGORIE_TEXT`, Wert berichtigt** —
**danach gibt es eine Quelle, nicht sechs.**

### 2 · G-302 — die Zielzeile bricht um

`[cmd]` **Seit dem 31.08. offen.** `[read]` **Miss, ob es noch gilt**
— **seit G-326 ist der Rezepteditor umgebaut, seit G-330 die
Kopfzeile.**

### 3 · GO-23 — Dimmung unter 50 Prozent

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Das Theme-Audit steht seit langem offen** — **elf
Modul-Akzenttoken in engem Helligkeitsband.**

### Was nicht zu tun ist

**Keine siebte Namensliste.**
**Kein Schreibweg fuer Quick-Add** — das ist G-340, erst zu
entscheiden.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Namensquellen   von sechs auf eine, gezaehlt
    preworkout      berichtigt, CHECK-tauglich
    G-302           gilt noch / behoben
    GO-23           gilt noch / ueberholt
    Bildschirmfoto  vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
