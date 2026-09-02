---
nr: G-332
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: [C-392]
kind_von: G-72
entscheidung: E-58
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-vorlieben.tsx
zahlen: null
---

# G-332 — die Mahlzeiten benennen und terminieren

## Befund

Aus E-58, 2026-09-02.

Tom: *,,kuenftig sagt man wieviele mahlzeiten man hat und dann
definiert man jede einzelne mit zeit und namen."*

`[cmd]` **Heute steht in Preferences die Kachel *Mahlzeitenstruktur*
mit drei Zahlen** (G-72) — **Hauptmahlzeiten, Snacks, Vorkochen.**

`[read]` **Was fehlt: der Ort, an dem der Nutzer Name und Zeit einmal
definiert, statt sie je Eintrag zu wiederholen.**

## Was zu bauen ist

**Zwei Schritte:** Anzahl nennen, **dann jede Zeile mit Zeit und
Namen.**

    3   Fruehstueck        07:30
        Mittag             12:30
        Abend              19:30

`[read]` **Namen als Vorschlagsliste plus Freitext** — die
gaengigsten als Auswahl, **der Rest ist Eingabe.**

`[cmd]` **Initialwerte aus `meals_per_day` und `snacks_per_day`**,
**mit den gemessenen Zeiten** (07:30 / 12:30 / 16:00 / 19:30) —
**dann editierbar.**

## Drei Orte

    Preferences   linke Seite unten
    Settings      /v2/settings
    Onboarding    spaeter (G-222)

`[cmd]` **Die Kollision aus G-72 faellt weg:** `/v2/settings` schrieb
nach `user_profiles`, die Struktur lag in `food_preferences`.
`[cmd]` **Mit `meal_slots` als eigener Tabelle kann Settings direkt
darauf schreiben.**

## Und die Anzeige

`[cmd]` **Tagebuch und Planner lesen die Slots statt `SLOT_LABEL`.**

`[read]` **Die Zuordnung macht die Zeit** — **naechstliegende
Slot-Zeit, ohne gespeicherte Kennung.**

`[read]` **Wer die Slot-Zeit spaeter verschiebt, sieht alte Eintraege
anders gruppiert** — **aber kein gespeicherter Wert aendert sich.**
