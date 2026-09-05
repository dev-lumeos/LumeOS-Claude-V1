---
nr: C-410
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-366
entscheidung: E-55
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-09-07
  leser_richtig: 1
  leser_falsch: 2
---

# C-410 — zwei Leser nehmen `food_tags` statt der Sicht

## Befund

Aus C-409, Codex, 2026-09-07, selbst gemeldet.

`[cmd]` **Der bestehende C-366-Test ist fachlich rot:**

    preference_search_preview              liest food_tags_effective
    food_search                            liest food_tags
    refresh_food_preference_search_targets liest food_tags

`[read]` **C-366 hatte alle drei umgestellt** — **zwei sind
zurueckgefallen.**

`[read]` **Er hat es gemeldet, statt es stillschweigend ausserhalb
des Auftrags zu aendern** — **richtig.**

## Warum es zaehlt

`[cmd]` **E-55: die Kuration liegt in `food_tags_kuriert`, die Sicht
`food_tags_effective` vereint sie mit dem Import.**

`[read]` **Wer `food_tags` direkt liest, sieht die Kuration nicht.**

`[cmd]` **Und `curate_food_tag` schreibt seit C-31 in die
Overlay-Tabelle** — **die Kuration entsteht also, und zwei von drei
Lesern ignorieren sie.**

`[read]` **Das ist schlimmer als vor C-366:** **damals las niemand
die Sicht, jetzt liest einer sie und zwei nicht** — **dieselbe Suche
liefert je nach Weg andere Tags.**

## Zu messen

`[read]` **Wann sind die zwei zurueckgefallen?** `[cmd]` **Ein
Kettenlauf koennte eine aeltere Fassung ueberschrieben haben.**

`[read]` **Und ob der Test es haette melden muessen** — `[cmd]` **er
ist rot, aber niemand hat ihn gelesen.**

## Auftrag — die zwei Leser und die Laufzeit

**Mitbeauftragt: C-404.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-410 — die zwei Leser zurueckholen

`[cmd]` **`food_search` und `refresh_food_preference_search_targets`
lesen `food_tags` statt `food_tags_effective`.**

`[read]` **Miss zuerst, wann sie zurueckgefallen sind** — **ein
Kettenlauf koennte eine aeltere Fassung ueberschrieben haben.**

`[read]` **Und ob der Test es haette melden muessen.** `[cmd]` **Er
ist rot, aber niemand hat ihn gelesen** — **dieselbe Klasse wie ein
Waechter, der still gruen wird.**

`[read]` **Dann umstellen** — **mit einer Gegenprobe: eine kuratierte
Zeile muss in beiden Wegen wirken.**

### 2 · C-404 — `Aufbau-Wochenplan`

`[cmd]` **4 Wochen, 28 Tage, 84 Eintraege bei `days_count 21`.**

`[cmd]` **Der umgekehrte Fall zu Cut und Lean** — **zu viele Tage,
nicht zu wenige.**

`[read]` **E-62: `days_count` ist die Laufzeit.** `[read]` **Wenn der
Plan vier Wochen beschreibt, laeuft er vier Wochen** — **dann ist die
Zahl falsch.**

`[read]` **Oder die vierte Woche gehoert nicht dazu** — **dann sind
84 Eintraege zu viel.**

`[cmd]` **Und `test` traegt 4 Wochen, 28 Tage, 0 Eintraege** — **die
Werkbank, richtig leer.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen — **die 17 seriellen Abfragen sind ein
UI-Auftrag.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    beide Leser    nehmen die Sicht, mit Gegenprobe
    Rueckfall      wann und wodurch, mit Fundstelle
    Test           war rot, jetzt gruen
    Aufbau-Plan    Laufzeit oder Woche, begruendet

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
