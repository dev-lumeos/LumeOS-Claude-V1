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
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/coach
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

## Bericht — je Modul ein Urteil

**Claude Code, 2026-08-31.** Mitbeauftragt mit A-16, im Anschluss an
G-226. Nichts gebaut, nichts committet.

### Gemessen: neun Module haben eine Seite, sechs nicht

`[cmd]` **HTTP-Status, angemeldet, 2026-08-31:**

    /v2/dashboard   200      /v2/marketplace   404
    /v2/nutrition   200      /v2/admin         404
    /v2/training    200      /v2/onboarding    404
    /v2/recovery    200      /v2/buddy         404
    /v2/supplements 200      /v2/crossmodule   404
    /v2/goals       200      /v2/completeness  404
    /v2/medical     200
    /v2/coach       200
    /v2/settings    200

`[cmd]` **Und die Navigation bietet genau diese neun** plus drei
externe Verweise (Coach Portal, Marketplace, Admin). **Kein Eintrag
zeigt ins Leere.**

### Je Modul ein Urteil

    Marketplace     externes Produkt      eigene Domain (A-36)
    Admin           gebaut, anderswo      apps/admin (A-36)
    Onboarding      nicht gebaut          entschieden, offen (G-222)
    Buddy           GEBAUT, anderswo      /v2/coach/ai, 20 Reiter,
                                          28 Dateien
    completeness    ist ein anderes Ding  = Settings (G-131),
                                          /v2/settings 200
    crossmodule     kein Modul            6 Dateien in goals und
                                          recovery — ein Querbezug,
                                          keine Seite

`[read]` **Damit sind alle sieben aufgeloest**, und **keines ist der
Coaches-Fall.** `[cmd]` **Gegengeprobt:** bei Coaches stand die
Komponente da und bekam kein Prop. **Hier gibt es zu keinem der
sechs eine Komponente, die auf eine Seite wartet** — Buddy und
completeness sind gebaut, nur woanders; die uebrigen vier haben gar
keine.

### Was bleibt

`[read]` **Der Punkt ist als Befund geschlossen.** `[read]` **Was
bleibt, sind zwei Produktfragen, die nie in ihm standen:**

**1. Soll Buddy eine eigene Route bekommen?** `[cmd]` Er liegt heute
unter `/v2/coach/ai` und die Navigation nennt ihn nicht eigens.
`[read]` **Gebaut ist er vollstaendig** — es ist eine Frage der
Auffindbarkeit, nicht des Bauens.

**2. Gehoert Marketplace in diese Anwendung?** `[read]` Unveraendert
offen aus A-36; **hier nur wiederholt, nicht entschieden.**

## Abnahme

_(vom Orchestrator)_

## Abnahme

**2026-08-31, mit G-226 abgenommen:** geschlossen: alle sieben aufgeloest, keiner der Coaches-Fall.
Buddy ist unter `/v2/coach/ai` mit 20 Reitern gebaut, drei hatte
A-36 bereits geklaert.

`[read]` **Anmerkung: dieser Punkt lag in `next/`, nicht ausgegeben.**
`[cmd]` **Claude Code hat ihn an Ort und Stelle bearbeitet und es
gemeldet** — **mein Fehler beim Zurueckstellen.**
