---
nr: C-155
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: F-07
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-155 - Zwei Befunde in `@supabase/ssr` 0.1.0

## Befund

(neu
  2026-08-20). Befund aus F-07.

  `[cmd]` *„Browser-Client crasht bei `cookieOptions` ohne `cookies`;
  `storageKey` nur im `ServerClient`."* **Lokal umgangen,
  `packages/shared` unangetastet.**

  `[read]` **`apps/admin` nutzt denselben Pfad und sollte geprueft
  werden** — der F-07-Agent hat es gemeldet statt nebenbei angefasst.

## Auftrag

**Mitbeauftragt mit C-110 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: beide Befunde bestehen.

`[cmd]` **Der Admin nutzt den gefaehrdeten Shared-Pfad.**

`[cmd]` **A-69 ersetzt C-155 nicht** — **es ueberschneidet sich nur
ueber ein transitives `ws`-High-Advisory.**

`[read]` **Zwei verschiedene Sachen: A-69 ist eine Zaehlung, C-155
ein benannter Pfad.**
