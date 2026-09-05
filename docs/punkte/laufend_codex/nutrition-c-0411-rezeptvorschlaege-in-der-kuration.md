---
nr: C-411
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-66
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.food_curation_candidates]
zahlen:
  gemessen: 2026-09-07
  kandidaten: 0
---

# C-411 — Rezeptvorschlaege in der Kuration

## Befund

Tom, 2026-09-07, zu MealCam: *,,das rezept muss aber auch im
adminbereich zur validierung auftauchen, dann koennen wir einen
ausbau administrieren."*

`[cmd]` **Der Weg existiert, fuer Lebensmittel:**

    food_curation_candidates
      food_id, target_type, target_field, proposed_value,
      source, reason, status, reviewer
      0 Zeilen

    food_curation_decisions
      candidate_id, decision, reviewer, reason
      0 Zeilen

`[cmd]` **`status`:** `pending`, `accepted`, `rejected`,
`superseded`.

`[cmd]` **`target_type`:** `category_assignment`, `display_name`,
`alias`, `preference_item_mapping`.

`[read]` **Kein Wert fuer Rezepte** — **das ist die Luecke.**

`[read]` **Und `food_id` ist Pflicht** — **ein Rezeptvorschlag haengt
an keinem einzelnen Lebensmittel.**

## Zu entscheiden

`[read]` **Ein `target_type` fuer Rezepte** — **oder eine eigene
Kandidatentabelle?**

`[read]` **Ein Rezept traegt Zutaten mit Mengen** — **das passt
schlecht in `proposed_value`.**

`[cmd]` **Und `food_id` muesste optional werden** — **eine
Strukturaenderung an einer Tabelle mit 0 Zeilen ist billig, spaeter
nicht.**

## Und der Herkunftswert

`[cmd]` **`recipes.source` kennt `user`, `coach`, `marketplace`,
`buddy`.**

`[read]` **Traegt ein MealCam-Rezept `buddy`, oder braucht es einen
eigenen Wert?**

`[read]` **`buddy` ist der Gefaehrte, MealCam ist eine Kamera** —
**zwei verschiedene Herkuenfte.**

`[cmd]` **E-45 regelt, was mit jeder Herkunft geschieht** —
**ein fuenfter Wert braucht dort einen Eintrag.**

## Auftrag — Rezeptvorschlaege und die Laufzeit

**Mitbeauftragt: C-404, C-193.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-411 — Rezepte in die Kuration

`[cmd]` **E-66, Tom 2026-09-07:** *,,mealcam kann rezepte im
userprofil erstellen, das rezept muss aber auch im adminbereich zur
validierung auftauchen."*

`[cmd]` **Der Weg existiert:** `food_curation_candidates` und
`food_curation_decisions`, **beide 0 Zeilen.**

`[cmd]` **Aber `target_type` kennt nur `category_assignment`,
`display_name`, `alias`, `preference_item_mapping`** — **kein
Rezept.**

`[cmd]` **Und `food_id` ist Pflicht** — **ein Rezeptvorschlag haengt
an keinem einzelnen Lebensmittel.**

`[read]` **Entscheide: ein `target_type` fuer Rezepte, oder eine
eigene Kandidatentabelle?** `[read]` **Ein Rezept traegt Zutaten mit
Mengen** — **das passt schlecht in `proposed_value`.**

`[cmd]` **Eine Strukturaenderung an einer Tabelle mit 0 Zeilen ist
billig, spaeter nicht.**

### Und der Herkunftswert

`[cmd]` **`recipes.source` kennt `user`, `coach`, `marketplace`,
`buddy`** (E-45).

`[read]` **Traegt ein MealCam-Rezept `buddy`, oder braucht es einen
eigenen Wert?** `[read]` **`buddy` ist der Gefaehrte, MealCam eine
Kamera** — **zwei Herkuenfte.**

`[cmd]` **E-45 regelt, was mit jeder Herkunft geschieht** — **ein
fuenfter Wert braucht dort einen Eintrag.** `[read]` **Vorschlagen,
nicht entscheiden.**

### 2 · C-404 — die Laufzeit, jetzt mit Auftrag

`[cmd]` **Du hast gemessen: die vierte Aufbau-Woche ist beabsichtigt
(kopierte Woche) und darf nicht geloescht werden.**

`[read]` **Damit ist E-62 eindeutig:** `days_count` **ist die
Laufzeit** — **vier Wochen heisst 28.**

`[cmd]` **Du hast ohne Auftrag keine nicht-persistente
Einzelkorrektur vorgenommen** — richtig.

**Hiermit beauftragt:** `[read]` **modelliere die Lifecycle-Felder in
der Seedquelle** — **damit `days_count 28` den naechsten Kettenlauf
ueberlebt.**

### 3 · C-193 — der Leseweg fuer MealCam

`[cmd]` **Du hast gemessen: MealCam ist rein statisch, kein
Leseweg.**

`[cmd]` **Und `SPEC_11` steht seit heute** — **mit vier
Aufloesungsgraden und dem Kandidatenraum aus dem BLS.**

`[read]` **Miss, was ein Leseweg braeuchte, der harte Ausschluesse
beachtet:** `[cmd]` **A-47 hat belegt, dass die Suche 120
`contains_nuts`-Zeilen bei JEDER Suche entfernt.**

`[read]` **Ein Vorschlag, der eine Allergie enthaelt, waere
schlimmer als kein Vorschlag.**

`[read]` **Melden, nicht bauen** — **MealCam ist Phase 0.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Rezeptkandidat   angelegt und wieder entfernt, belegt
    Herkunftswert    vorgeschlagen, begruendet
    Aufbau-Plan      days_count 28, ueberlebt den Kettenlauf
    C-193            was ein Leseweg braeuchte, mit Zahl

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
