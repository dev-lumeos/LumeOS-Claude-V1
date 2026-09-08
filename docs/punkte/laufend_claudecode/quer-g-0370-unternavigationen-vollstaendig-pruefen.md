---
nr: G-370
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: E-69
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/app/v2/medical/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
  reiter: 85
  geprueft: 3
---

# G-370 — Unternavigationen vollstaendig pruefen

## Befund

Aus G-365, Claude Code, 2026-09-07, selbst offengelegt:

> *,,Der vollstaendige Unternavigations-Durchlauf ueber alle 85
> Reiter lief in eine Zeitgrenze. Geprueft sind die DREI gemeldeten
> Faelle."*

`[read]` **Das ist eine Luecke im Nachweis, keine Aussage ueber
Fehler** — **seine eigene Formulierung.**

## Die Klasse

`[cmd]` **Drei Faelle gefunden, alle gleich:** **die Referenz hing
in `ansicht.tsx`, wo der Unterreiter nicht bekannt ist** — **er ist
Zustand der Komponente und steht nicht in der Adresse.**

    medical/tracking   zeigte auf beiden Unterreitern denselben
                       Symptom-Mockup
    medical/import     zeigte alle sieben Kacheln, egal welcher
                       Unterreiter oben stand
                       auf "Manual entry": oben 1, unten 7
    goals/poses        zeigte immer `mandatory`, waehrend oben
                       `quarter` oder `detail` stand

`[cmd]` **Mit Sabotageprobe belegt:** `unter === 'history'` **auf
`true` gesetzt, die falsche Kachel erschien, zurueckgedreht.**

## Zu messen

`[read]` **Welche der 85 Reiter tragen eine Unternavigation?**

`[read]` **Und je solchem Reiter: folgt die Referenz unten dem
Unterreiter oben?**

`[cmd]` **Ein Reiter mit Unternavigation ist daran erkennbar, dass
er einen Zustand fuehrt, der nicht in der Adresse steht.**

`[read]` **Die drei behobenen sind der Massstab** — **dieselbe
Sabotageprobe je Fall.**

## Warum es zaehlt

`[read]` **Tom klickt durch und sieht unten etwas, das nicht zu oben
gehoert** — **und kann nicht vergleichen.**

`[cmd]` **E-69: die Referenz steht da, damit er Ist gegen Soll
sieht.** `[read]` **Eine falsche Referenz ist schlimmer als keine.**

## Auftrag — Unternavigationen und der fuenfte A-71-Fall

**Mitbeauftragt: G-371, G-366.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-370 — alle Unternavigationen

`[read]` **Du hast selbst gemeldet, dass der Durchlauf in eine
Zeitgrenze lief.**

`[cmd]` **Drei Faelle sind behoben und belegt:** `medical/tracking`,
`medical/import`, `goals/poses`.

`[read]` **Geh die restlichen 82 Reiter durch:** **welche tragen
eine Unternavigation, und folgt die Referenz unten dem Unterreiter
oben?**

`[cmd]` **Ein Reiter mit Unternavigation fuehrt einen Zustand, der
nicht in der Adresse steht** — **das ist das Erkennungsmerkmal.**

### 2 · G-371 — `modalities` nimmt den Leseweg nicht

`[cmd]` **Dein Befund aus G-365.** `[cmd]`
**`modalitaeten-kachel.tsx`, und `recovery.modality_log` traegt 178
Zeilen.**

`[read]` **Fuenfter Fall von A-71** — **vier Kacheln wurden am 07.09.
angebunden, eine nicht.**

`[read]` **Miss, welche, und bind sie an.**

### 3 · G-366 — die Uebungsliste der Sitzung

`[cmd]` **Die Today-Sitzungskarte liest die geplante Sitzung
(G-365), aber die Uebungsliste braucht `ladeSitzungsUebungen`** —
**die Funktion existiert und wird nicht durchgereicht.**

`[read]` **Sechster Fall derselben Klasse.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  Reiter mit Unternavigation: gezaehlt.
        Zahl: 85 geprueft / n mit Unternavigation.

    A2  je solchem Reiter: folgt die Referenz dem Unterreiter?
        Zahl: n geprueft / n richtig / n berichtigt.
        Je Berichtigung eine Sabotageprobe wie bei medical/import.

    A3  G-371: welche Kachel, welcher Leseweg, angebunden.
        Zahl: Zeilen aus modality_log am Schirm.

    A4  G-366: Uebungsliste zeigt echte Uebungen.
        Zahl: wie viele Uebungen, aus welcher Sitzung.

    A5  keine weiteren ungenutzten Lesewege in den beruehrten
        Dateien. Zahl: geprueft / gefunden.

### Was nicht zu tun ist

**Bestehendes bleibt unangetastet.**
**Nichts in `supabase/` aendern** — **Codex arbeitet dort an
C-422.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
