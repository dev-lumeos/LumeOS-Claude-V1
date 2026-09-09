---
nr: G-400
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-398
entscheidung: null
beruehrt:
  dateien:
    - apps/coach/src/app/tokens.css
zahlen:
  gemessen: 2026-09-08
  tokens_coach: 73
  globals_web: 1184
---

# G-400 — das Portal sieht nicht aus wie LumeOS

## Befund

Tom, 2026-09-08, nach dem Blick auf 3220: *,,alles
schwachsinn."*

`[cmd]` **Bildschirmfoto `backup/g398-overview.png` nachgesehen:
weisser Hintergrund, andere Typografie, kein Modulkopf.**

`[read]` **Die Karten sind richtig eingeordnet** ? **aber es sieht
nicht aus wie LumeOS.**

## Warum

`[cmd]` **`apps/coach/src/app/layout.tsx` laedt:**

    @lumeos/ui/styles.css
    ./tokens.css      73 Zeilen
    ./portal.css     281 Zeilen

`[cmd]` **`apps/web` laedt `globals.css`** ? **1.184 Zeilen, plus
`AppShell`, `next-intl`, Modus-Cookie.**

### Die Tokens sind eine Kopie

`[cmd]` **`tokens.css`, Zeile 1-7:**

> *,,KOPIE aus `apps/web/src/styles/themes/lume.css` (Stand
> 2026-08-20), Werte unveraendert ? `v2.css` (aus `@lumeos/ui`)
> braucht sie, und `apps/web` darf von diesem Auftrag nicht
> angefasst werden (F-07). Wer die Tokens aendert, aendert BEIDE
> Dateien ? oder zieht sie in ein Paket."*

`[cmd]` **Stand 2026-08-20** ? **drei Wochen alt.**

`[read]` **Und `apps/web` hat seither elf Modul-Akzenttokens
bekommen** (G-384).

### Und die Klassen sind eigene

`[cmd]` **`portal.css`:** *,,eigene Klassen unter `cp-`, damit
keine Regel die v2-Bausteine aus `@lumeos/ui` trifft."*

    .cp-shell   .cp-kopf   ...

`[read]` **`apps/web` nutzt `v2-module-header`,
`v2-module-hero-lite`, `v2-kopf-mitte`** ? **das Portal keines
davon.**

`[read]` **Zwei Designs im selben Haus.**

### Der helle Modus

`[cmd]` **`layout.tsx`: der Modus kommt aus
`prefers-color-scheme`** ? **KEIN Modus-Cookie in dieser App.**

`[cmd]` **`apps/web` liest den Cookie** ? **deshalb dort dunkel,
hier hell.**

`[read]` **Wer zwischen den Anwendungen wechselt, sieht zwei
verschiedene Produkte.**

## Was zu entscheiden ist

**a** ? **Die Tokens nach `packages/ui`**, beide Anwendungen
darauf.

`[cmd]` **Der Kommentar in `tokens.css` schlaegt es selbst vor.**

`[read]` **Loest die Kopie, aber nicht die `cp-`-Klassen.**

**b** ? **Das Portal auf die `v2-`-Bausteine umstellen.**

`[read]` **Dann sieht es aus wie LumeOS** ? **aber es ist ein
anderer Aufbau: kein Tageswechsler, keine Modulnavigation, ein
Athlet statt eines Tages.**

`[cmd]` **G-399 hat denselben Befund im Kleinen:** **der
Referenz-Trenner steht jetzt zweimal.**

**c** ? **Beides.** `[read]` **Tokens ins Paket, Klassen
angleichen, Modus-Cookie teilen.**

## Was gemessen werden muss

`[read]` **Welche `cp-`-Klasse hat ein `v2-`-Gegenstueck?**

`[cmd]` **281 Zeilen `portal.css` gegen 1.184 `globals.css`** ?
**die Schnittmenge ist zu messen, nicht zu schaetzen.**

`[read]` **Und ob der Aufbau ueberhaupt derselbe sein soll** ?
**ein Arbeitsplatz ist kein Tagebuch.**
