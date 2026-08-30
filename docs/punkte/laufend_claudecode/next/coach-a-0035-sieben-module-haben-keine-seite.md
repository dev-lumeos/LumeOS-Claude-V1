---
nr: A-35
typ: messung
modul: coach
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# A-35 - Sieben Module haben keine Seite

## Befund

(neu 2026-08-20). Aus
  SSOT 173. **Ueberblick, kein Auftrag.**

  | Modul | Komponenten im Entwurf |
  |---|---|
  | **market** | **52** — wartet auf Rechtsfragen |
  | **buddy** | **44** — 16 Tabellen spezifiziert |
  | **stubs** | 31 — **zu klaeren, was das ist** |
  | admin | 25 — `apps/admin` existiert separat |
  | **completeness** | 14 — **das sind die Settings** (G-131) |
  | crossmodule | 6 |
  | onboarding | 1 — `WALK`, vier Schritte (G-83) |

  `[cmd]` **`module-stubs.jsx` (60 KB, 31 Komponenten) ist nie erwaehnt
  worden** — **zuerst pruefen, was drinsteht.**

## Auftrag — sieben Module ohne Seite

**Mitbeauftragt mit A-16.** Bericht in die A-16-Datei.

`[read]` **Vorbereitet am 2026-08-30.**

### Warum jetzt

`[cmd]` **A-36 ist heute geschlossen** — drei der Module sind geklaert:
**Marketplace und Admin sind externe Verweise, Admin ist als eigene
App gebaut, Onboarding hat keine Route.**

`[read]` **Dieser Punkt nennt sieben. Miss, welche vier uebrig sind
und was mit ihnen ist.**

### Die drei Faelle, die A-36 unterschieden hat

    gebaut, anderswo    Admin liegt in apps/admin
    externes Produkt    Marketplace auf eigener Domain
    nicht gebaut        Onboarding, keine Route

`[read]` **Je Modul einer davon** — **oder ein vierter, den A-36 nicht
kannte.**

`[cmd]` **Und der Coaches-Fall bleibt die Gegenprobe:** dort stand die
Komponente da und bekam kein Prop. **Miss, ob das bei einem der vier
auch so ist.**

### Was nicht zu tun ist

**Keine Seite bauen** — erst messen, was fehlt und warum.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Modul ein Urteil    gebaut anderswo / extern / nicht gebaut /
                           Komponente ohne Verdrahtung
    Routen                 HTTP-Status je Modul
    Produktfragen          benannt, nicht entschieden

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen** — er laesst einen gesunden
Server stehen. **`neustart` nur, wenn `start` nicht reicht.**

`[cmd]` **Codex fasst ihn nicht an** (Regel seit 2026-08-30).

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
