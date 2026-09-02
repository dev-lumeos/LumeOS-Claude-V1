---
nr: C-110
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: F-02
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-110 - Cost-Rest und Compliance-Notizen

## Befund

(neu 2026-08-19).
  Befund aus F-02.

  `[cmd]` **Compliance ist anbindbar** — 90 Tage, 8 `skipped` im
  30-Tage-Fenster, 93,3 % (C-82/C-103). **Offen nur, ob die
  `skipped`-Zeilen `notes` tragen** — nirgends gemessen.

  `[cmd]` **Bei Cost fehlen:** Trend (**3 ehrliche Monatspunkte statt
  12**) und *„If you removed…"* (**reine Subtraktion**).

  `[read]` **`Cost optimization` bleibt Beratung, keine Rechnung** —
  draussen.

## Auftrag — drei Punkte am Rand des Kernbetriebs

**Mitbeauftragt: C-155, C-170.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-110 — Cost-Rest und Compliance-Notizen

`[read]` **Lies den Punkt und miss, was davon noch gilt.**

`[cmd]` **Seit C-353 ist die TTFB-Messung da**, seit C-381 ein
`action_log`.

### 2 · C-155 — zwei Befunde in `@supabase/ssr` 0.1.0

`[cmd]` **`pnpm audit` meldet 26 High-Severity-Abhaengigkeiten**
(A-69), darunter Next 14.2.35.

`[read]` **C-155 ist aelter und enger** — **miss, ob die zwei Befunde
noch bestehen und ob sie in A-69 aufgehen.**

`[read]` **Nicht aktualisieren** — **ein Abhaengigkeitswechsel
beruehrt beide Agenten gleichzeitig.**

### 3 · C-170 — der Offline-Betrieb steht im Entwurf

`[read]` **Miss, was der Entwurf verlangt und was heute davon
existiert.**

`[read]` **Und sag, ob es zu V1 gehoert** — **oder wie der
Marktplatz zurueckgestellt ist** (E-37).

### Was nicht zu tun ist

**Keine Abhaengigkeit aktualisieren.**
**Nichts in `backup/` loeschen** — dein eigener Vorschlag aus C-216
steht noch aus.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    C-110   was gilt noch, was ist erledigt
    C-155   bestehen die zwei, gehen sie in A-69 auf
    C-170   was existiert, gehoert es zu V1

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
