---
nr: G-348
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-343
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/vorschlags-lage.ts
zahlen:
  gemessen: 2026-09-07
---

# G-348 — `wieGestern` ueberspringt manuelle Posten

## Befund

Aus G-343, Claude Code, 2026-09-07.

`[cmd]` **`wieGestern` ueberspringt Posten ohne `food_id`.**

`[cmd]` **Seit G-340 ist der Fall erreichbar:** `food_source =
'manual'` **traegt weder `food_id` noch `custom_food_id`.**

`[read]` **Quick-Add hat einen Fall geschaffen, den eine aeltere
Funktion nicht kennt.**

## Warum es zaehlt

`[read]` **Wer gestern *450 kcal Restaurant* eingetragen hat, findet
es in *Wie gestern* nicht wieder** — **und merkt nicht, warum.**

`[cmd]` **Die Funktion ueberspringt still** — **sie meldet nichts.**

`[read]` **Dasselbe Muster wie bei den Waechtern in G-343:** **eine
Funktion, die einen neuen Fall nicht kennt, wird nicht rot** — **sie
laesst ihn aus.**

## Zu tun

`[read]` **Manuelle Posten mitnehmen.** `[cmd]` **Sie tragen
`food_name`, `amount_g` und `nutrients`** — **alles, was ein
Vorschlag braucht.**

`[read]` **Und pruefen, ob weitere Funktionen `food_id` als Pflicht
annehmen.** `[cmd]` **`custom_food_id` ist der dritte Fall** —
**`foods_custom` traegt 0 Zeilen, aber der Weg steht.**

## Auftrag — drei zweite Schreibwege

**Mitbeauftragt: G-350, G-152.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-348 — `wieGestern` ueberspringt manuelle Posten

`[cmd]` **Posten ohne `food_id` werden still uebersprungen.**
`[cmd]` **Seit G-340 ist der Fall erreichbar.**

`[read]` **Wer gestern *450 kcal Restaurant* eingetragen hat, findet
es in *Wie gestern* nicht wieder** — **und merkt nicht, warum.**

`[cmd]` **Manuelle Posten tragen `food_name`, `amount_g` und
`nutrients`** — **alles, was ein Vorschlag braucht.**

`[read]` **Und pruef, ob weitere Funktionen `food_id` als Pflicht
annehmen.** `[cmd]` **`custom_food_id` ist der dritte Fall** —
`foods_custom` traegt 0 Zeilen, **aber der Weg steht.**

### 2 · G-350 — der zweite Schreibweg fuer `is_checked`

`[cmd]` **Du hast ihn selbst gemeldet:** `rezepte-echt.tsx` **traegt
seit G-289 einen eigenen Weg.**

`[read]` **Er soll auf die neue Serveraktion umziehen** — **damit es
wieder einen gibt.**

`[read]` **Dasselbe Muster wie bei den Namenslisten (G-335):**
**zwei Wege auf dieselbe Spalte laufen frueher oder spaeter
auseinander.**

### 3 · G-152 — der Aktivitaetsstrom des Dashboards

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Seit C-353 ist die TTFB-Messung da, seit E-52 gilt:
gemeinsame Sichten statt sechs Abfragen.**

`[read]` **Wenn er eine Sicht braucht: melden, nicht bauen** —
`supabase/` **gehoert Codex.**

### Was nicht zu tun ist

**Kein zweiter Schreibweg** — das ist gerade der Befund.
**Nichts in `supabase/` aendern.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    wieGestern      manueller Posten erscheint, belegt
    weitere         welche Funktionen food_id voraussetzen, gezaehlt
    is_checked      ein Schreibweg, gezaehlt
    G-152           gilt noch / was fehlt
    Bildschirmfoto  vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
