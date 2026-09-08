---
nr: G-373
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-372
entscheidung: E-72
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-spec.tsx
zahlen:
  gemessen: 2026-09-08
  fehlend: 2
---

# G-373 — Stacks editieren und anlegen

## Befund

Aus G-372, Claude Code, 2026-09-08, A6:

> *,,Editieren braucht keine Datenbankarbeit: `ergaenzePosition`,
> `entfernePosition` und `setzeBestand` stehen in `stack-write.ts`
> mit null UI-Aufrufern."*

`[read]` **Siebter Fall von A-71** — **der Leseweg liegt daneben,
niemand ruft ihn.**

    G-364   <RecMuscleMap /> ohne Prop                3 Kacheln
    G-365   Today-Sitzung aus festem Objekt           1
    G-365   Modalitaeten, modality_log ungenutzt      4
    G-365   Rechenweg las TDEE_STATE statt tdee-Prop  1
    G-366   ladeSitzungsUebungen nicht durchgereicht  1
    G-353   vorlagenLageVon(0) fest verdrahtet        1
    G-373   drei Schreibwege ohne Aufrufer            3

`[cmd]` **`Neuer Stack` ist der letzte `InEntwicklungKnopf` in der
Kachel.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Editieren

`[cmd]` **Die drei Funktionen stehen** — **`ergaenzePosition`,
`entfernePosition`, `setzeBestand`.**

`[read]` **Reich sie durch, wie du es bei `ladeSitzungsUebungen`
gemacht hast** (G-366).

### 2 · Neuer Stack

`[cmd]` **`authenticated` haelt INSERT auf beiden Tabellen** —
**keine Datenbankarbeit noetig.**

`[read]` **Aber `goal` ist die Frage:** `[cmd]` **`user_stacks`
traegt sieben Werte im CHECK** (C-427).

`[read]` **Bis C-427 entschieden ist, gilt die Siebenerliste** —
**sie steht in der Datenbank und ist die aeltere.**

### Lies zuerst

`[cmd]` **`00-QUELLEN.md`, Abschnitt Supplements.** `[cmd]` **Und
`module-supplements-spec.jsx`** — **dort stand die Regel, die keine
Spec nennt** (G-372).

`[cmd]` **Der Mockup nennt es *Item customization*** — **das ist der
Gegenpart zum Editieren** (A5 aus G-372).

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  eine Position ergaenzt. Zahl: stack_items vorher/nachher.
    A2  eine Position entfernt. Zahl: vorher/nachher.
    A3  ein Bestand gesetzt. Zahl: der Wert vorher/nachher.
    A4  ein neuer Stack angelegt. Zahl: user_stacks
        vorher/nachher, und welches `goal` er traegt.
    A5  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.
    A6  kein `InEntwicklungKnopf` mehr in der Kachel. Zahl:
        vorher/nachher.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern.**
**C-427 nicht entscheiden** — **die Siebenerliste gilt bis dahin.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
