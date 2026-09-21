---
nr: G-487
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-486
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-487 - der Planschirm zeigt den falschen Tag

## Toms Befund

Tom, 2026-09-08, mit dem Schirm:

> bevor ich diesen auftrag rausgebe: wo sehe ich, dass der
> letzte auftrag erfuellt ist? ich sehe nichts davon, und es
> ist nicht wahr betreffs startdatum

```
Aufbau-Wochenplan  aktiv  rollover
Tag 3 von 35 - Start 19.9.2026
noch nichts entschieden - 0 offen
Today's ghost entries  2026-09-18 - kein Eintrag
Fuer diesen Tag fuehrt der Plan keine Eintraege.
Days count       28
Started          19.9.2026
Laeuft bis       23.10.2026
Dauer            28 Tage
```

## Gemessen

`[cmd]` **Heute ist der 2026-09-21.**

### Drei Widersprueche

**1** ? **Der Tag ist drei Tage zu frueh.**

    Flaeche:  "Today's ghost entries  2026-09-18"
    gemessen: heute ist 2026-09-21

`[cmd]` **Und am 21.09. hat der Plan VIER Eintraege** ?
**die Flaeche zeigt den 18., wo keine sind.**

**2** ? **28 oder 35 Tage?**

    meal_plans.days_count:  28
    Flaeche oben:           "Tag 3 von 35"
    Flaeche unten:          "Dauer 28 Tage"

**3** ? **Der Plan hat 63 Tage in der Datenbank.**

`[cmd]` **`meal_plan_days`: 63 Tage, von 2026-06-18 bis
2026-10-23** ? **weder 28 noch 35.**

`[read]` **`Laeuft bis 23.10.2026` stimmt** ? **es ist das
groesste `plan_date`.**

`[cmd]` **Aber 19.09. + 28 Tage = 17.10., nicht 23.10.**

## Warum G-486 nicht sichtbar ist

`[cmd]` **Claude Code hat A4 auf dem 18.09. gemessen** ?
**dort ist der Satz richtig.**

`[read]` **Aber die Flaeche zeigt den 18. als HEUTE, obwohl
der 21. ist** ? **also sieht Tom den Zustand von vor drei
Tagen.**

`[read]` **Und der A4-Satz erscheint nicht:** *,,Fuer diesen
Tag fuehrt der Plan keine Eintraege"* **statt** *,,Dein Plan
beginnt erst am 19.09."*

## Der Verdacht

`[read]` **Ein eingefrorener Tagesbezug** ? **dieselbe Klasse
wie G-450 (`jetzt: Date = new Date()` als Vorgabewert).**

`[cmd]` **MISS, woher der Schirm sein Datum nimmt** ? **und ob
es beim Laden oder beim Bauen gesetzt wird.**

`[read]` **Das erklaert alle vier Male, in denen Tom nichts
gesehen hat.**

## Abnahmebedingungen

    A1  der Schirm zeigt HEUTE. Foto mit Datum.
    A2  woher kommt das Datum? Gemessen.
    A3  "Tag 3 von 35" gegen "28 Tage": welche Zahl
        stimmt? Gemessen und berichtigt.
    A4  63 Tage in der Datenbank, 28 im Plan --
        was gilt? GEMELDET, wenn es ein Datenfehler
        ist.
    A5  "Laeuft bis": gerechnet oder gelesen?
    A6  der A4-Satz aus G-486 erscheint, wo er soll.
        Foto.
    A7  ein Waechter faengt einen eingefrorenen
        Tagesbezug. Sabotageprobe.
    A8  vier Module unveraendert.
    A9  apps/web 1893 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

