---
nr: G-296
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: C-364
entscheidung: null
beruehrt:
  dateien:
    - packages/ui
zahlen: null
---

# G-296 — das globale `tsc` ist rot wegen `packages/ui`

## Befund

Aus C-364, Codex, 2026-08-31.

`[cmd]` **Ein globales `tsc` bleibt rot** — **eine bestehende
JSX-Konfiguration in `packages/ui`.**

`[read]` **Codex hat es gemeldet, statt es zu umgehen oder zu
beheben.** **Richtig: es gehoerte nicht zu seinem Auftrag.**

## Warum es zaehlt

`[cmd]` **`pnpm gate` laeuft gruen** — der Gate ruft `tsc` je
Arbeitsbereich, nicht global.

`[read]` **Damit ist es kein Blocker, sondern ein blinder Fleck:**
**wer `tsc` global ruft, bekommt Rot und weiss nicht warum.**

`[cmd]` **Und `packages/ui` traegt `InEntwicklung` mit 135
Aufrufern** (C-177) — **die Datei ist im Umlauf.**

## Zu messen

`[read]` **Was genau ist falsch konfiguriert, und seit wann?**
`[read]` **Und ob der Gate es fangen sollte** — **ein Gruen, das
einen bekannten Fehler nicht sieht, ist ein halbes Gruen.**

## Auftrag — zwei blinde Flecken

**Mitbeauftragt: C-366.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-08-31.**

### 1 · G-296 — das globale `tsc`

`[cmd]` **Du hast es in C-364 gemeldet.** `[read]` **Miss, was genau
falsch konfiguriert ist und seit wann.**

`[cmd]` **`pnpm gate` laeuft gruen**, weil er `tsc` je
Arbeitsbereich ruft. `[read]` **Ein Gruen, das einen bekannten Fehler
nicht sieht, ist ein halbes Gruen** — **sag, ob der Gate es fangen
sollte.**

### 2 · C-366 — `food_tags` hat keinen Pflegeweg

`[cmd]` **30.797 Zeilen, kein Trigger, keine Funktion, keine
Oberflaeche.** `[cmd]` **Und `auto_tag_food` existiert nicht** —
Claude Code hat es in G-226 gemessen.

`[read]` **Die Tags wirken:** `[cmd]` **E-22 fuehrt 14
Tag-Definitionen, `food_search` rankt danach, und G-116 hat gemessen,
dass ein einzelner Tag 162 Treffer entscheidet.**

`[read]` **Etwas, das die Suche steuert und niemand aendern kann, ist
ein Einbahnweg.**

`[cmd]` **`apps/admin` hat eine Kurationsseite mit 314 Zeilen**
(A-36) — **miss, ob sie Tags kennt.**

`[read]` **Und ob der Import sie ueberschreiben wuerde** — **dieselbe
Frage wie C-29 bei den Anzeigenamen, die dort geloest ist:** der
Kettenschritt liest `name_display_de` aus der Quelldatei und laesst
Kuratiertes stehen.

### Was nicht zu tun ist

**Keine Tags aendern** — erst den Weg, dann die Daten.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    tsc global        was ist rot, seit wann
    Gate              soll er es fangen? begruendet
    food_tags         wer koennte pflegen, gemessen
    Import            wuerde er ueberschreiben

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
