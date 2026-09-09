---
nr: G-394
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-392
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/shell.tsx
zahlen:
  gemessen: 2026-09-08
  ohne_ladezustand: 6
---

# G-394 — sechs Module ohne Ladezustand

## Befund

Aus G-392, Claude Code, 2026-09-08.

`[cmd]` **Nur `supplements` hat eine `loading.tsx`** ? **neun
Module geprueft.**

`[cmd]` **Gemessen am 2026-08-25: die Seite braucht 1,9 bis 2,9 s
bis `networkidle`** ? **in dieser Zeit sieht der Nutzer die ALTE
Seite und einen wartenden Browser.**

`[read]` **Es sieht aus, als haette der Klick nicht gewirkt.**

## Und jetzt ist der Weg frei

`[read]` **Vor G-392 haette ein Skelett die Hydration zerlegt** ?
**das ist jetzt belegt, nicht vermutet.**

`[cmd]` **Der Anker der Schale liegt vor der Suspense-Grenze**
(`shell.tsx:153`, Zeichen 1.560 gegen 10.860).

> *,,Wer das naechste baut, braucht den Anker der Schale."*

## Was zu tun ist

`[read]` **Je Modul eine `loading.tsx`, die dem echten Aufbau
folgt** ? **`supplements/loading.tsx` ist die Vorlage.**

`[cmd]` **Ihr Kommentar sagt, warum:** *,,Ein Skelett, das anders
aussieht als das Ergebnis, ist schlimmer als keines ? der Inhalt
springt beim Eintreffen."*

`[read]` **Und kein Schimmern** ? **bei zwei Sekunden ist eine
Animation eher Unruhe als Auskunft.**

## Die sechs

    dashboard   goals   medical
    nutrition   recovery   training

`[read]` **`coach` und `settings` haben andere Koepfe** ? **erst
messen, ob dieselbe Vorlage passt.**

## Berichtigung 2026-09-08 — es ist kein Modulskelett

Tom: *,,das war doch von anfang an so ?
topheader/header/modulnavigation/navigationchilds/modulinhalte."*

`[cmd]` **Nachgemessen: acht von neun Modulen tragen
`v2-module-hero-lite`.** `[cmd]` **Nur `settings` nicht** ? **es
hat `v2-wahl-titel`, eine eigene Form** (G-384, A3).

`[cmd]` **Und das Skelett baut genau diese Ebenen nach:**

    v2-skel-hero      der Modulkopf
    v2-skel-reiter    die Modulnavigation, viermal
    v2-skel-karte     der Inhalt, zweimal

`[read]` **Es ist NICHT modulspezifisch** ? **es ist die
gemeinsame Struktur.**

`[read]` **Die Datei heisst nur `supplements/loading.tsx`, weil sie
dort gebaut wurde** ? **nicht, weil sie dorthin gehoert.**

## Also: eine Datei, nicht sechs

`[cmd]` **`apps/web/src/app/v2/loading.tsx`** ? **Next.js nutzt
sie fuer jede Unterroute, die keine eigene hat.**

`[read]` **Ein Skelett fuer alle, statt sieben, die
auseinanderlaufen.**

`[cmd]` **Und `supplements/loading.tsx` faellt weg** ? **sie
enthaelt nichts, was die Schale nicht auch weiss.**

### Was zu messen ist

`[read]` **Der Text *,,Supplements werden geladen"* ist das
Einzige, was modulspezifisch ist.**

`[cmd]` **Die Schale kennt den Pfad** ? **`usePathname` sagt,
welches Modul.**

`[read]` **Oder er wird allgemein** ? *,,Wird geladen"* ? **und
das reicht fuer eine Vorlesehilfe.**

### Und `settings` bekommt einen Kopf

Tom: *,,dann baut man settings gleich auf, wo liegt das
problem?"*

`[cmd]` **Nachgemessen: `settings/page.tsx` hat 50 Zeilen und
rendert direkt `<ProfilFormular>`** ? **kein Kopf, keine Reiter.**

`[cmd]` **`v2-wahl-titel` ist eine Ueberschrift IM Formular, kein
Modulkopf** ? **der Orchestrator hat das in G-384 falsch
gelesen.**

`[read]` **Aber die Seitenleiste fuehrt `Settings` als eigenen
Eintrag unter SYSTEM** ? **es ist eine Seite wie die anderen.**

`[read]` **Und zwei Sekunden Stillstand hat es genauso.**

**Also: Kopf dazu.**

    v2-module-header v2-module-hero-lite
      Titel        "Einstellungen"
      Untertitel   was die Seite tut
      Mitte        der Wechslerplatz -- LEER lassen
      Rechts       Aktionen, wenn es welche gibt

`[cmd]` **Kein `data-fuehrt-tag`** ? **Einstellungen haben keinen
Tag** (C-426: ein Regler ohne Wirkung).

`[cmd]` **Und `ONBOARDING_ADR` sagt:** *,,jedes Modul hat einen
Settings-Tab, Settings ist immer der letzte Tab."*

`[read]` **Das Profil ist die moduluebergreifende Ecke davon** ?
`page.tsx:9-10. `[read]` **Ob daraus spaeter Reiter werden, ist
eine eigene Frage.**

## Der Auftrag ist damit kleiner

    eine Datei in der Schale
    supplements/loading.tsx entfernen
    der Anker aus G-392 traegt sie bereits

`[read]` **Und der Nachweis ist einfach:** **von einem Modul zum
anderen klicken, das Skelett erscheint.**