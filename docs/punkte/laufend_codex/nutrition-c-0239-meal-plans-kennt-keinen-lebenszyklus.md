---
nr: C-239
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: G-161
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-29
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-239 - `meal_plans` kennt keinen Lebenszyklus

## Befund

(neu
  2026-08-23). Aus G-161.

  `[cmd]` Es fehlen `lifecycle`, `started_at`, `days_count`,
  `confirm_mode`, `next_plan_id`. **Die Kachel „Lifecycle types" ist
  eine Legende ueber Spalten, die es nicht gibt.**

  `[cmd]` Vorhanden sind `name, description, target_kcal,
  target_protein_g, target_carbs_g, target_fat_g, is_active,
  measurement_source, source_detail`.

  `[read]` `is_active` traegt heute die ganze Zustandslogik — ein Plan
  ist an oder aus. Ein Plan, der laeuft, pausiert oder abgeloest wird,
  ist damit nicht abbildbar.

## Auftrag — das Plan-Schema, drei Punkte

**Mitbeauftragt: C-238, C-348.** Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**

`[cmd]` **Der Anlass ist frisch:** Tom ist am 29.08. das
Nutrition-Modul durchgegangen und hat drei Attrappen im
Meal-plans-Reiter benannt — *Today's ghost entries*, *Lifecycle
types*, *7-day compliance*.

`[read]` **Sie sind keine drei Anzeigefehler, sondern eine
Datenluecke mit drei Symptomen** (G-270). `[cmd]` **Und die rechte
Kachel im Reiter sagt es selbst:** *,,Lebenszyklus, Startdatum und
Bestaetigungsmodus fehlen im Schema. Die Vorlage zeigt sie;
`meal_plans` fuehrt dafuer keine Spalten."*

### 1 · C-239 — der Lebenszyklus

`[cmd]` **Die Vorlage nennt drei Arten:** `once` endet nach
`days_count`, `rollover` beginnt bei Tag 1 neu, `sequence` aktiviert
`next_plan_id`.

`[read]` **Miss, was davon heute im Schema steht** — und ob die drei
Arten vollstaendig sind oder nur die drei, die jemand aufgeschrieben
hat.

### 2 · C-238 — `meal_plan_entries` hat keinen Status

`[read]` **Ohne Status gibt es keine Ghost Entries.** `[cmd]` **Die
Vorlage zeigt vier Zustaende:** `confirmed`, `deviated`, `pending`,
`skipped`.

`[cmd]` **`SPEC_03_USER_FLOWS` Flow 4 beschreibt das Bestaetigen in
vier Faellen, einschliesslich rueckwirkend.** `[read]` **Lies ihn,
bevor du den Status entwirfst** — er sagt, welche Uebergaenge es
geben muss.

### 3 · C-348 — die zaehlende Funktion

`[cmd]` **Der Nutrients-Reiter uebertraegt 8,3 MB `jsonb`, entpackt
sie und reduziert sie auf zehn Flags** — rund 895 ms von 6.393 ms
gesamt.

`[read]` **Die Nutzlast wird uebertragen, um sie wegzuwerfen.**

`[read]` **Der Unterschied zum billigen Weg, den G-259 verboten hat:**
dieselbe Referenzlogik nutzen und weniger zurueckgeben — **nicht
nachrechnen.** `[read]` **Das Nachbauen waere die zweite Wahrheit,
die E-31 zurueckgestellt hat.**

### Was nicht zu tun ist

**Keine Oberflaeche** — Claude Code arbeitet an G-271 in denselben
Reitern.
`[read]` **Und der Status entsteht aus dem Flow, nicht aus der
Vorlage** — die Vorlage zeigt, was jemand sich gedacht hat, der Flow
sagt, was passieren muss.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Lebenszyklus im Schema      vorher / nachher
    drei Arten                  vollstaendig? belegt
    Status je Eintrag           vier Zustaende, Uebergaenge aus
                                Flow 4
    zaehlende Funktion          Laufzeit und uebertragene Menge
                                vorher / nachher
    Ergebnisgleichheit          dieselben Flags wie heute
    bestehende Plaene           unveraendert - belegt

`[read]` **Die vorletzte Zeile ist der eigentliche Nachweis:** eine
schnellere Funktion mit anderen Flags ist keine Verbesserung.

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
**Wegwerf-Datenbank, Vollsicherung vor jedem Live-Eingriff.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
