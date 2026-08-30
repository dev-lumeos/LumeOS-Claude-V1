---
nr: G-281
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-214
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/substanz-kategorien.ts
zahlen:
  gemessen: 2026-08-30
---

# G-281 — der Treffergrund in der Katalogsuche

## Befund

Aus G-214, Codex, 2026-08-30.

`[cmd]` **Pterostilbene trifft bei der Suche nach *Resveratrol*.**
`[cmd]` **Der Grund: `supplement_user_texts.kurz_was_en` sagt
*,,related to resveratrol"*.**

`[read]` **Der Treffer ist richtig. Die Auskunft fehlt.**

## Warum es an Claude Code geht

`[cmd]` **Die Suche liegt in
`apps/web/src/lib/supplements/substanz-kategorien.ts:trifftSuche()`**
— **kein RPC, kein JSON-Dokument, nur `boolean`.**

`[cmd]` **`food_search` kann den Treffer nicht liefern** — sie sucht
BLS-Lebensmittel und hat keine Verbindung zum `supplements`-Schema.

`[read]` **Codex hat es vermessen und nicht gebaut, weil `apps/`
seinem Auftrag entzogen war.** **Richtig — die Bereichsregel gilt.**

## Was zu bauen ist

**`trifftSuche()` gibt statt `boolean` den Treffergrund zurueck, und
die Kartenzeile zeigt ihn.**

`[cmd]` **Die Funktion prueft der Reihe nach `name`, `description`
und `zwecke`** — **welcher Zweig zugeschlagen hat, weiss sie bereits.**

`[read]` **Die Rangregeln bleiben unveraendert.** `[read]` **Und die
Beschriftung entscheidet, was der Nutzer versteht:** *,,in der
Beschreibung"* sagt mehr als *,,Treffer"*.

## Auftrag

**Beauftragt am 2026-08-30.**

`[cmd]` **Codex hat es in G-214 vermessen und nicht gebaut** — `apps/`
war seinem Auftrag entzogen. **Die Messung liegt vor, der Bau ist
klein.**

### Was zu tun ist

**`trifftSuche()` gibt den Treffergrund zurueck, die Kartenzeile
zeigt ihn.**

`[cmd]` **Die Funktion prueft `name`, `description`, `zwecke` der
Reihe nach** — **welcher Zweig zugeschlagen hat, weiss sie schon.**

`[read]` **Die Beschriftung entscheidet, was der Nutzer versteht:**
*,,in der Beschreibung"* sagt mehr als *,,Treffer"*.

### Was nicht zu tun ist

**Keine Rangregel aendern.**
**Keine zweite Suche bauen** — `food_search` hat mit diesem Katalog
nichts zu tun.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Pterostilbene bei Resveratrol   Grund sichtbar, Bildschirmfoto
    Reihenfolge                     unveraendert
    Treffer ohne Grund              gibt es welche? dann warum
    Attrappen                       am Schirm, vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
