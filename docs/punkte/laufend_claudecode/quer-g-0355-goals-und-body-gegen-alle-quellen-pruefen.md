---
nr: G-355
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-67
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-07
  tabellen: 6
  spalten: 110
  zeilen: 450
  leser: 37
---

# G-355 — Goals und Body gegen alle Quellen pruefen

## Befund

Tom, 2026-09-07:

> ich denke goals & body solltest nochmal komplett gegen spec, old
> repo, new design mockup und sonstigen quellen pruefen, denn da
> wurde einiges schon angepasst dass nicht der sinn der sache ist
> denke ich. da fehlt mittlerweile sehr viel das ploetzlich
> verschwunden ist

## Was gemessen ist

`[cmd]` **Sechs Tabellen, 110 Spalten, 450 Zeilen:**

    user_goals            23 Sp,  11 Zeilen
    goal_milestones       20 Sp,  13 Zeilen
    body_circumferences   22 Sp,  54 Zeilen
    body_measurements     17 Sp, 362 Zeilen
    goal_phases           14 Sp,   5 Zeilen
    nutrition_targets     14 Sp,   5 Zeilen

`[cmd]` **Und 37 Dateien in `apps/web/src` lesen `goals.`**

`[read]` **Die Daten sind also da** — **Toms Beobachtung betrifft die
Oberflaeche, nicht das Schema.**

## Was der Verdacht heisst

`[read]` **Wenn 110 Spalten existieren und der Schirm wenig zeigt,
gibt es zwei Erklaerungen:**

`[read]` **Entweder wurde nie alles angeschlossen** — **dann ist es
eine Luecke, kein Verlust.**

`[read]` **Oder etwas wurde entfernt** — **dann steht es in der
Geschichte, und man kann sagen wann und warum.**

`[cmd]` **Der Unterschied ist messbar:** `git log` **je Datei.**

## Die vier Quellen

`[cmd]` **Spec:** `docs/specs/` — **welche Spec traegt Goals?**
`[cmd]` **Altrepo:** `referenz/lumeos-2026/`, 91.290 Dateien —
**Struktur ja, Code nie.**
`[cmd]` **Mockup:** `00-QUELLEN.md` sagt, welche es je Modul gibt.
`[cmd]` **Und die Entscheidungen:** E-54 (Zeitachse), E-46
(Erfahrungsgrade), E-67 (Onboarding gegen Goals).

## Was der Auftrag liefern soll

`[read]` **Eine Gegenueberstellung, nicht eine Meinung:**

    was die Spec verlangt
    was die Datenbank traegt
    was der Schirm zeigt
    was fehlt -- und ob es je da war

## Auftrag — die Gegenueberstellung

**Beauftragt am 2026-09-07.**

### Warum der Punkt jetzt kommt

`[cmd]` **Du hast in G-354 einen Kommentar gefunden, der zwei
vorhandene Tabellen fuer abwesend erklaerte** —
`modale.tsx:13`: *,,es gibt weder `goals.user_goals` noch
`goals.body_measurements`."*

`[read]` **Das ist vermutlich die Erklaerung fuer Toms
Beobachtung** — *,,da fehlt mittlerweile sehr viel das ploetzlich
verschwunden ist."*

`[read]` **Vielleicht ist nichts verschwunden.** `[read]`
**Vielleicht steht an mehreren Stellen, es sei nie da gewesen.**

### Was zu messen ist

    was die Spec verlangt
    was die Datenbank traegt
    was der Schirm zeigt
    was fehlt -- und ob es je da war

`[cmd]` **Gemessen 2026-09-07: sechs Tabellen, 110 Spalten, 450
Zeilen, 37 Leser in `apps/web/src`.**

`[read]` **Die Daten sind da** — **die Frage ist die Oberflaeche.**

### Der Unterschied ist messbar

`[read]` **Nie angeschlossen** — **eine Luecke, kein Verlust.**

`[read]` **Entfernt** — **dann steht es in der Geschichte, und `git
log` sagt wann und warum.**

`[cmd]` **Sucht gezielt nach weiteren Kommentaren wie dem aus
G-354** — **eine Zeile, die eine vorhandene Sache fuer abwesend
erklaert, wird beim naechsten Auftrag als Grund zitiert.**

### Die vier Quellen

`[cmd]` **`00-QUELLEN.md` sagt, welche Specs und Mockups es je Modul
gibt** — **lies es zuerst.**

`[cmd]` **Altrepo:** `referenz/lumeos-2026/` — **Struktur ja, Code
nie.** `[read]` **Und nachsehen, warum es ersetzt wurde.**

`[cmd]` **Entscheidungen:** E-54 (Zeitachse), E-46
(Erfahrungsgrade), E-67 (Onboarding gegen Goals).

### Was nicht zu tun ist

**Nichts bauen** — **dieser Auftrag stellt gegenueber.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Gegenueberstellung  Spec / Datenbank / Schirm, je Bereich
    fehlt               was, und ob es je da war
    Kommentare          weitere Falschaussagen, gezaehlt
    Bildschirmfoto      was Goals und Body heute zeigen

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
