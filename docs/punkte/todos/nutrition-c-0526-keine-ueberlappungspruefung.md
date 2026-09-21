---
nr: C-526
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-486
entscheidung: null
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-08
  plaene: 3
---

# C-526 - keine Ueberlappungspruefung bei Plaenen

## Toms Vorgabe

Tom, 2026-09-08:

> der job der software ist, den aktiven anzuzeigen und die
> planung so zu gestalten, dass es keine ueberlappungen gibt

## Gemessen

`[cmd]` **Drei Plaene decken denselben Tag ab:**

    Lean bulk 3100      assigned   ab 2026-09-01
    Cut 4-Meal 2200     paused     ab 2026-09-19
    Aufbau-Wochenplan   active     ab 2026-09-19

`[cmd]` **Und es gibt keine Pruefung:**

    13 CHECKs auf meal_plans -- keiner auf Datumsfenster
    3 Trigger: copy_slots, status_compatibility,
      touch_updated_at
    0 Funktionen
    0 in der Anwendung

Claude Code in G-486: *,,An vier Stellen gemessen. Drei Plaene
ueberlappen bereits auf denselben Tagen."*

## Was zu klaeren ist

`[read]` **Toms Regel: nur EIN aktiver Plan ist SSOT.**

    active     der eine, der gilt
    assigned   ein geplanter zukuenftiger Plan
    paused     pausierend

`[read]` **Ueberlappen DUERFEN sie ? was nicht sein darf, ist
ZWEI AKTIVE auf demselben Tag.**

`[cmd]` **MISS, ob das heute moeglich ist** ? **der
`status_compatibility`-Trigger koennte es schon verhindern.**

### Und die zweite Frage

`[read]` **Was passiert, wenn ein `assigned`-Plan startet,
waehrend ein anderer aktiv ist?**

`[cmd]` **`Cut 4-Meal 2200` beginnt am selben Tag wie der
aktive** ? **miss, was beim Aktivieren geschieht.**

## Abnahmebedingungen

    A1  koennen zwei AKTIVE Plaene denselben Tag
        decken? Gemessen.
    A2  was tut der status_compatibility-Trigger?
        Gelesen, nicht vermutet.
    A3  was passiert beim Aktivieren eines zweiten
        Plans? Gemessen.
    A4  wenn eine Pruefung fehlt: gebaut, mit
        Gegenprobe.
    A5  bestehende Plaene bleiben unveraendert.
    A6  Sicherung, Vollkette, ALLE Waechter.
