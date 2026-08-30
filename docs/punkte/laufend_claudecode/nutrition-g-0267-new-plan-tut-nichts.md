---
nr: G-267
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/ansicht.tsx]
zahlen: null
---
# G-267 — *New plan* tut nichts

## Befund

**Tom, 2026-08-29:** *,,new plan geht nix"*.

`[cmd]` **Der Knopf steht oben rechts im Meal-plans-Reiter.**

`[read]` **Und daran haengt mehr als ein Knopf:** wer Plaene erstellen
kann, muss sie auch bearbeiten koennen. **Tom:** *,,wenn man plaene
erstellen kann dann kann man die auch editieren"*. **Als G-268
angelegt.**

## Auftrag

**Mitbeauftragt mit G-271 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Zwischenstand, 2026-08-29

**Aus G-271 gemessen:** nicht gebaut: `meal_plans` hat keinen Lebenszyklus, `meal_plan_entries` keinen Status.
**Die Messung steht dort.**

## Auftrag — der Meal-plans-Reiter, vier Punkte

**Mitbeauftragt: G-268, G-269, G-270.** Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt Zahlen, weil sie gemessen sind** —
alle vom 2026-08-30. **Pruef sie nach.**

`[read]` **Und du hast G-267 im letzten Durchgang zu Recht nicht
gebaut:** *,,ein Knopf, der ein Formular oeffnet, das die Haelfte
seiner Felder nicht speichern kann, ist schlimmer als einer, der
wartet."* **Jetzt kann es speichern.**

### Was seit heute live steht

`[cmd]` **`nutrition.meal_plans` hat sechs neue Spalten:**

    lifecycle_type · start_date · days_count · next_plan_id
    rollover_count · status · plan_origin

`[cmd]` **Und eine neue Tabelle `nutrition.meal_plan_logs`:**

    plan_id · plan_entry_id · execution_date · status
    actual_meal_id · confirmation_mode
    deviation_kcal · deviation_pct · confirmed_at · skipped_at

`[read]` **Das ist die wichtigste Messung des Auftrags:** **der
Status liegt im Log, nicht am Eintrag.** `[cmd]`
**`meal_plan_entries` hat keine Statusspalte** — der Eintrag ist die
Vorlage, das Log die Ausfuehrung.

`[read]` **Wer am Eintrag nach Status sucht, findet keinen und haelt
ihn fuer fehlend.**

### 1 · G-267 — *New plan*

`[read]` **Der Knopf kann jetzt speichern.** `[cmd]` **Die Felder
stehen:** Name, Beschreibung, Ziele, Lebenszyklus, Startdatum,
Tageszahl.

`[cmd]` **`plan_origin` erlaubt `self_created`, `coach_created`,
`marketplace`** — **ein selbst erstellter Plan traegt `self_created`.**

### 2 · G-268 — bearbeiten

`[cmd]` **Die zwei Bestandsplaene tragen `plan_origin = NULL`**, weil
die Herkunft nicht belegbar war. `[read]` **Das ist kein Fehler,
sondern eine ehrliche Leerstelle** — **aber die Oberflaeche muss
damit umgehen koennen.**

### 3 · G-269 — Herkunft und Bearbeitungsrecht

`[cmd]` **`coach.darf_nutrition_plan_aendern(p_client uuid)` existiert
live.** `[cmd]` **Sie erlaubt direkte Aenderungen nur bei voller
Sicht, `nutrition_auto_apply` und Stufe 5.** `[cmd]` **`dev` steht
auf Stufe 3 und bekommt keine Freigabe.**

`[read]` **Also: der Reiter muss den Fall zeigen koennen, in dem
Bearbeiten nicht erlaubt ist** — **und sagen warum, nicht nur den
Knopf ausgrauen.**

`[read]` **E-29 gilt:** ueber die Funktion lesen, nicht direkt in
`coach.client_autonomy`.

### 4 · G-270 — die drei Attrappen

`[cmd]` **Sie haengen alle an `meal_plan_logs`:**

    ghost entries     status je Eintrag und Tag
    Lifecycle types   lifecycle_type am Plan
    7-day compliance  status ueber eine Zeitreihe

`[cmd]` **Und du hast gemessen, dass es fuenf sind, nicht drei** —
zwei weitere unter *Shopping list*. `[cmd]` **`nutrition.shopping_lists`
existiert mit einer Zeile und sechs Positionen** — **die Kachel ist
Attrappe, weil `dev` keine Liste hat, nicht weil die Tabelle fehlt.**

`[read]` **Das ist ein Leerzustand, kein fehlendes Feature** —
dieselbe Unterscheidung wie in C-48.

### Was nicht zu tun ist

**Kein Schema aendern** — Codex arbeitet an C-350.
**Keine zweite Ansicht neben eine bestehende.**
**Nichts erfinden, wo Daten fehlen** — `plan_origin` und
`lifecycle_type` sind bei den Bestandsplaenen `NULL`, **und das
gehoert gezeigt, nicht gefuellt.**
**Nichts auf `dev@lumeos.app` schreiben** — `test-user@lumeos.local`
mit Rueckbau, wie in G-272.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    New plan               schreibt, belegt mit Rueckbau
    bearbeiten             schreibt, belegt mit Rueckbau
    plan_origin NULL       wie sieht die Zeile aus?
    Bearbeiten gesperrt    dev auf Stufe 3 - was zeigt der Reiter?
    ghost entries          echte Zeilen aus meal_plan_logs
    Lifecycle types        aus lifecycle_type, nicht aus der Vorlage
    7-day compliance       aus dem Log
    Shopping list          Leerzustand, nicht Attrappe
    Attrappen im Reiter    vorher 5, nachher - am Schirm gezaehlt
    Ladezeit               ms, kalt und warm
    Bildschirmfoto         je Zustand

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30, A-59, A-60**, **`.limit()` hebt den PostgREST-Deckel
nicht auf**, **ein `await` in einer Schleife kostet je Durchlauf
voll.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
