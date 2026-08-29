---
nr: C-347
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: G-116
entscheidung: E-30
agent: codex
beauftragt: 2026-08-29
beruehrt:
  dateien: [supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql]
zahlen:
  gemessen: 2026-08-29
  schokolade_vorher: 162
  schokolade_nachher: 0
  ultra_processed: 162
  contains_nuts: 10
---

# C-347 — generelle Ausschluesse in `food_search`

## Befund

Aus G-116, Claude Code, 2026-08-29. **Vom Orchestrator ueber die Tags
nachgemessen.**

`[cmd]` **`schokolade` 162 → 0. `cola` 243 → 42. `wurst` 206 → 42.**

`[cmd]` **Und die Ursache ist der generelle Ausschluss, nicht die
Allergie:** 162 Schokoladen-Treffer tragen `ultra_processed`, nur 10
tragen `contains_nuts`.

`[read]` **Was hier passiert, ist eine dritte Art von Null:** der
Treffer existiert, wird bewertet, **und wird nicht gezeigt.** **Kein
gemessener Wert, keine fehlende Aussage — eine unterdrueckte.**

## Die Stufe existiert bereits

`[cmd]` **Starke Filter wirken nur ohne Suchbegriff und ranken sonst
ab.** `[cmd]` **Generelle Ausschluesse sind hart zugewiesen.**

`[read]` **Wer *schokolade* eintippt, hat eine Absicht** — und
bekommt nichts, weil er einmal *ultra_processed* abgewaehlt hat.

## Die Entscheidung

**Sollen generelle Ausschluesse dieselbe Stufe bekommen wie starke
Filter?**

`[read]` **Dann wirken sie ohne Suchbegriff und ranken mit Suchbegriff
nur ab.** `[cmd]` **Laut G-116 ein einzeiliger Eingriff in
`food_search`** — Codex' Bereich.

`[read]` **Dagegen spricht: wer *ultra_processed* ausschliesst, will
es vielleicht wirklich nie sehen.** **Dafuer spricht: eine leere
Trefferliste erklaert sich nicht selbst.**

## Auftrag — Ausschluesse ranken ab

**Entschieden in `docs/entscheidungen/E-30`.** `[read]` **Lies sie
zuerst.**

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Die Zahlen im Befundteil stammen aus G-116** — pruef sie
nach, sie sind gemessen, aber nicht von mir.

`[read]` **Mein eigener `food_search`-Aufruf lieferte 1 statt 162** —
ich habe die Signatur falsch bedient. **Wenn deine Zahl abweicht,
gilt deine.**

### Zu tun

**Generelle Ausschluesse bekommen dieselbe Stufe wie starke Filter:**
ohne Suchbegriff wirken sie, mit Suchbegriff ranken sie ab.

`[read]` **Und die Rangfolge muss die Ausschlusstiefe abbilden**, nicht
nur *ausgeschlossen ja/nein*. **Tom:** *,,wenn einer zb schwarze
schokolade disliked oder ausgeschlossen hat und dann nach schokolade
sucht kommen alle andere vorher angezeigt."*

### Der Fall, der die Regel erklaert

    schwarze Schokolade ausgeschlossen, Suche "schokolade"
      -> Vollmilch, weisse, Nuss zuerst - schwarze zuletzt

    ultra_processed ausgeschlossen, Suche "schokolade"
      -> alle Treffer tragen es; "alle anderen" ist leer

`[read]` **Der zweite Fall ist der Grund fuer die heutige Null.**
`[read]` **Miss, ob deine Loesung ihn traegt** — eine Rangfolge, in
der alle gleich schlecht stehen, ist keine Rangfolge.

### Was unberuehrt bleibt

**Allergien sind kein genereller Ausschluss.** `[cmd]`
`is_exclusion_relevant` traegt `contains_gluten`,
`contains_lactose`, `contains_nuts`, `vegan`, `vegetarian`.

`[read]` **Wer eine Nussallergie eingetragen hat, will Nuesse gar
nicht sehen, nicht weiter unten.** **Diese Klasse aendert sich
nicht** — und das gehoert belegt, nicht angenommen.

### Was nicht zu tun ist

**Keine Tags aendern, keine Vorlieben aendern.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Suchbegriff vorher / nachher   schokolade, cola, wurst
    Rangfolge                         wo stehen die
                                      ausgeschlossenen?
    ohne Suchbegriff                  wirkt der Ausschluss noch?
    Allergie                          unveraendert - belegt
    Laufzeit                          ms vorher / nachher
    Gegenprobe                        ein Nutzer ohne Ausschluesse
                                      sieht dieselbe Reihenfolge
                                      wie vorher

`[read]` **Die vorletzte Zeile ist Pflicht:** `food_search` ist
gemessen empfindlich — C-121, C-191, C-192.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
