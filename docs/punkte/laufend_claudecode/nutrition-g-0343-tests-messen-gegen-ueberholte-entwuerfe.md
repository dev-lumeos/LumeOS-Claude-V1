---
nr: G-343
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-342
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/components/shell/__tests__/v2-attrappen.test.ts
zahlen:
  gemessen: 2026-09-07
---

# G-343 — Tests messen gegen ueberholte Entwuerfe

## Befund

Aus G-342, Claude Code, 2026-09-07.

`[cmd]` **`v2-attrappen.test.ts` prueft Vorlagentreue gegen einen
Entwurf von vor E-58.**

`[read]` **Er hat eine Zusage berichtigt und gemeldet, dass eine
Durchsicht lohnt.**

## Zu messen

`[read]` **Welche Tests messen noch gegen Staende, die seit dem
02.09. ueberholt sind?**

`[cmd]` **Neunzehn Entscheidungen an einem Tag** — E-45 bis E-63.
`[cmd]` **Darunter E-58 (Mahlzeitenstruktur), E-59 (Planstruktur),
E-61 (Vitamin A), E-63 (Sonstige faellt weg).**

`[read]` **Ein Test, der eine ueberholte Vorlage sichert, wird gruen
und schuetzt den falschen Zustand.**

`[read]` **Dieselbe Klasse wie die vier Waechter aus G-342:** **sie
hielten toten Code am Leben, weil sie seine Existenz massen.**

## Auftrag — Tests gegen ueberholte Staende

**Mitbeauftragt: G-328, G-279.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-343 — welche Tests messen Vergangenes?

`[cmd]` **Du hast `v2-attrappen.test.ts` gefunden:** **er prueft
Vorlagentreue gegen einen Entwurf von vor E-58.**

`[cmd]` **Und in G-340 musstest du zwei G-339-Waechter nachziehen**,
weil dein Umbau ihnen die Anker nahm.

`[read]` **Zweimal dasselbe Muster** — **ein Waechter, der an einer
Stelle haengt statt an einer Zusage.**

`[cmd]` **Zwanzig Entscheidungen seit dem 02.09.:** E-45 bis E-65.
`[cmd]` **Darunter E-58 (Mahlzeitenstruktur), E-59 (Planstruktur),
E-61 (Vitamin A), E-63 (*Sonstige* faellt weg).**

`[read]` **Miss, welche Tests noch gegen ueberholte Staende
messen.** `[read]` **Ein Test, der eine alte Vorlage sichert, wird
gruen und schuetzt den falschen Zustand.**

`[read]` **Und sag, woran man es erkennt** — **damit der naechste
Waechter an der Zusage haengt, nicht an der Zeile.**

### 2 · G-328 — was zaehlt *am haeufigsten*?

`[cmd]` **E-56 entschied: *Am haeufigsten* mit Zahl** — *,,27 von 30
Tagen"*.

`[read]` **Miss, was gezaehlt wird:** **Tage mit mindestens einem
Eintrag, oder Anzahl der Eintraege?**

`[read]` **Bei sieben Kaffees an einem Tag ist der Unterschied
gross.**

### 3 · G-279 — die Kachel *haeufig erfasst*

`[cmd]` **Sie braucht G-328** — **erst muss feststehen, was gezaehlt
wird.**

`[read]` **Wenn G-328 die Zaehlweise klaert, bau sie** — **sonst
melde, was noch fehlt.**

### Was nicht zu tun ist

**Keine Zusage aendern** — **nur ihren Gegenstand, wo er weggefallen
ist.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Tests           welche messen Vergangenes, gezaehlt
    Erkennung       woran man es merkt, als Regel
    G-328           Tage oder Eintraege, begruendet
    G-279           gebaut oder was fehlt
    Bildschirmfoto  vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
