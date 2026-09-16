---
nr: G-461
typ: fehler
modul: coach
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-458
entscheidung: null
erledigt: 2026-09-08
commit: 96e80560
beruehrt:
  dateien:
    - apps/coach/src/components/draft/modale.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-461 - ein nicht maskiertes Anfuehrungszeichen

## Befund

Aus G-458, Codex, 2026-09-08:

> *,,Lint: nicht maskiertes Anfuehrungszeichen in
`apps/coach/src/components/draft/modale.tsx:529`."*

`[read]` **Klein, aber es haelt `pnpm gate` auf.**

## Was zu tun ist

`[read]` **Maskieren** ? **und messen, ob es sonst noch
welche gibt.**

`[cmd]` **`apps/coach` hat 65 Proben** ? **sie laufen gruen,
der Lint nicht.**

## Bericht

**Claude Code, 2026-09-16.**

### Der Stand in einem Satz

`[read]` **Es war nicht eines, sondern drei** ? **und hinter ihnen
stand ein vierter Fehler, den sie verdeckt hatten.**

### A3 ? gemessen, ob es weitere gibt

`[cmd]` **Der Auftrag nannte eine Stelle. `next lint` ueber BEIDE
Apps nennt drei:**

    apps/coach  draft/modale.tsx:529      „Vorschlag senden"
    apps/web    goals/fehlende-kacheln.tsx:498   „New session"
    apps/web    supplements/zyklus-karten.tsx:103 „Zyklus starten"

`[read]` **`apps/web` fiel also ebenfalls** ? der Auftrag ging von
`apps/coach` aus, weil Codex' Gate-Lauf dort haengengeblieben war.
**Ein Lint meldet, was er zuerst findet.**

`[cmd]` **Alle drei sind dasselbe Muster:** das OEFFNENDE Zeichen ist
schon das deutsche `„`, **nur das schliessende ist ein ASCII-`"`.**

`[read]` **Maskiert wird deshalb nicht mit `&quot;`, sondern mit dem
passenden deutschen Schlusszeichen** ? die Paarung `„…"` ist die
richtige Schreibweise, und der Lint ist damit zufrieden. **Ein
`&quot;` haette dieselbe Zeile unleserlich gemacht.**

### Der Fehler, der dahinter stand

`[cmd]` **Nach der Behebung meldete `apps/web` einen VIERTEN
Fehler:**

    insights-kacheln.tsx:97
    React Hook "React.useId" is called conditionally
    (react-hooks/rules-of-hooks)

`[cmd]` **Aus G-416, von mir nicht angefasst** ? `git log` nennt
`937bd02e`. **Er stand hinter den zwei Anfuehrungszeichen und wurde
erst sichtbar, als sie weg waren.**

`[read]` **Dieselbe Form wie der HTTP 431 in G-455:** *ein Fehler
verdeckte den anderen, und nur der eine war sichtbar.* **Nur hier
andersherum ? die zwei lauten verdeckten den stillen.**

**Tom hat entschieden, ihn mitzunehmen** (Rueckfrage 2026-09-16),
**weil er sonst als einziger `pnpm gate` weiter aufhaelt** ? und genau
dafuer gibt es beide Auftraege.

`[cmd]` **Die Behebung ist eine Zeile:** der `useId`-Aufruf steht
jetzt VOR dem fruehen `return`.

`[read]` **Die Regel ist keine Formsache:** ein Hook nach einem
frueheren `return` wird in manchen Anstrichen gerufen und in anderen
nicht. **Bei EINEM Hook faellt es nicht auf; beim zweiten bekaeme er
den Zustand des ersten.**

`[cmd]` **Gegengeprobt, dass die Grafik weiter steht** ? `uid` traegt
eine SVG-Verlaufskennung:

    Verlaeufe                3
    gefuellte Flaechen       2
    tote Verweise            0
    Seitenfehler             keine

### A3 ? das Ergebnis

    apps/coach   next lint   exit 0   keine Warnung, kein Fehler
    apps/web     next lint   exit 0   nur Warnungen (img-Element)
    apps/coach   tsc         exit 0
    apps/web     tsc         exit 0

### A4 ? die Gegenprobe

`[cmd]` **Ein neues unmaskiertes `"` in den JSX-Text gesetzt:**

    coach lint   exit 1   ROT
    zurueckgenommen, wieder exit 0

### Was gebaut wurde

    GEAENDERT  apps/coach/src/components/draft/modale.tsx:529
               apps/web/src/app/v2/goals/fehlende-kacheln.tsx:498
               apps/web/src/app/v2/supplements/zyklus-karten.tsx:103
                 je ein ASCII-" zum deutschen Schlusszeichen
               apps/web/src/app/v2/nutrition/insights-kacheln.tsx
                 useId vor den fruehen Return (Toms Entscheidung)

    NEU        tools/_g461-insights.mjs   die Verlaufsmessung

`[cmd]` **Nichts in `supabase/`, nichts committet.**

### Was offen bleibt

`[cmd]` **`apps/web` traegt weiter WARNUNGEN** ? unter anderem
`@next/next/no-img-element` in `goals/fehlende-kacheln.tsx:520`.
`[read]` **Sie halten das Gate nicht auf** (exit 0), **und sie
gehoeren nicht zu diesem Auftrag** ? gemeldet, nicht behoben.

## Abnahme

**2026-09-08, Orchestrator.**

> *,,Es waren DREI, und dahinter stand ein VIERTER."*

`[cmd]` **`apps/web` fiel ebenfalls (goals, supplements).**

`[read]` **Alle drei dasselbe Muster: deutsches Anfuehrungs-
zeichen geoeffnet, ASCII geschlossen** ? **maskiert mit dem
PASSENDEN Schlusszeichen, nicht mit `&quot;`.**

### Der vierte stand dahinter

> *,,Nach der Behebung stand ein vierter Fehler allein da:
`React.useId` nach einem fruehen Return (aus G-416). Dieselbe
Form wie der HTTP 431 ? ein Fehler verdeckte den anderen, hier
andersherum: die zwei LAUTEN verdeckten den STILLEN."*

`[read]` **Und das ist genau der Befund, den Codex als G-462
gemeldet hat** ? **zwei Wege, dieselbe Stelle.**

`[cmd]` **Lint gruen in beiden Apps, tsc sauber, web 1780,
coach 65, alle fuenf Module zeichengleich.**

### Und er hat aufgeraeumt, was er nicht durfte

> *,,Einer der Waechter schrieb beim Lauf seinen eigenen
Schnappschuss in `backup/` um ? zurueckgesetzt, dort loescht nur
du."*

**Abgenommen.**

