---
nr: G-424
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-423
entscheidung: null
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  flaechen: 21
---

# G-424 — latissimus ist waehlbar und nicht zeichenbar

## Befund

Aus G-423, Claude Code, 2026-09-08.

`[cmd]` **Selbst nachgemessen:**

    CHECK auf user_injection_site_selections.body_area_code
      enthaelt latissimus                      JA
    packages/ui/src/koerperkarte-pfade.ts
      enthaelt latissimus                      NEIN
      enthaelt hair                            JA

`[read]` **Beide fuehren 21 Flaechen** ? **aber nicht
dieselben.**

`[read]` **Ein Nutzer kann `latissimus` waehlen, und die Karte
kann ihn nicht zeichnen.**

`[cmd]` **Und umgekehrt: `hair` steht in der Karte und ist kein
Injektionsort.**

## Warum es liegen blieb

> *,,Gemeldet, nicht geflickt ? `packages/ui` gehoert allen
> Apps."*

`[read]` **Richtig** ? **eine Aenderung dort trifft `apps/web`,
`apps/coach` und `apps/admin`.**

`[cmd]` **G-388 hatte denselben Befund schon:** `lat_l/r` **faellt
auf `trapezius`, eine Naeherung.**

`[read]` **Anatomisch falsch: der Latissimus liegt seitlich am
Ruecken, der Trapezius oben.**

## Was zu entscheiden ist

**a** ? **Die Karte bekommt einen `latissimus`-Pfad.**

`[read]` **Neue Pfaddaten in `packages/ui`** ? **mit Gegenprobe,
dass die anderen Apps unveraendert aussehen.**

**b** ? **Der CHECK verliert `latissimus`.**

`[read]` **Dann kann niemand ihn waehlen** ? **aber ein
BPC-157-Nutzer mit Rueckenproblem braucht ihn.**

**c** ? **Die zwei Listen gleichen sich an.**

`[cmd]` **`hair`, `head`, `hands`, `feet`, `ankles` sind in der
Karte und keine Injektionsorte.**

`[read]` **Eine gemeinsame Liste mit einem Merkmal
*,,injizierbar"* waere sauberer als zwei Listen, die man
vergleichen muss.**

## Und der zweite Teil

`[cmd]` **Die Injektionskarte zeichnet die konfigurierten
Flaechen noch nicht ein.**

> *,,Sie kennt 16 anatomische Orte MIT Seitigkeit, die
> Konfiguration 21 Flaechen OHNE. Eine Zuordnung waere eine
> Behauptung."*

`[read]` **Das ist derselbe Bruch** ? **zwei Listen, die nicht
zueinander passen.**

`[read]` **Wer c entscheidet, loest beides.**
