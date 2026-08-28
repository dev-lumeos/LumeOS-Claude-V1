---
nr: E-21
getroffen: 2026-08-28
von: Tom
status: richtung_gesetzt
loest_ab: null
abgeloest_durch: null
betrifft: [G-219]
modul: quer
---

# E-21 — der taegliche Checkin ist der Ort fuer Koerperwerte

## Frage

`[cmd]` Der Nutrition-Mockup fuehrt im `DiaryView` einen
`WeightTracker`, den `SPEC_10_COMPONENTS` dort nicht nennt. **Gehoert
er ins Tagebuch?**

## Richtung

Tom, 2026-08-28: *,,ja koennen wir in diary noch einbauen, ja koennen
wir ebenfalls in dashboard einbauen, aber am ende soll es taeglich
einen user checkin geben wo wir genau solche sachen einbauen und zb
rechts im context abbilden koennen"*.

`[read]` **Also beides:** kurzfristig im Tagebuch und im Dashboard,
**auf Dauer ein eigener taeglicher Checkin.**

## Was es schon gibt

`[cmd]` **`recovery.checkins` — 370 Zeilen, 29 Spalten:**

    Schlaf         Dauer, Qualitaet, Start- und Endzeit
    Befinden       subjektiv, Stimmung, Energie, Motivation
    Koerper        Muskelkater, Schmerzareale
    Stress         allgemein, Arbeit, Leben
    Verhalten      Alkohol, Koffein, Bildschirmzeit vor dem Schlaf
    Messwerte      Ruhepuls, HRV, SpO2, Atemfrequenz

`[cmd]` **`goals.body_measurements` — 362 Zeilen:** Gewicht, KFA,
Messmethode, Groesse als Momentaufnahme, BMI und FFMI (berechnet).

`[read]` **Alles, was der Checkin fragen soll, existiert bereits —
verteilt auf zwei Tabellen in zwei Modulen.** `[cmd]` **Und beide
haben seit G-122 einen Schreibweg.** **Was fehlt, ist der eine Ort, an
dem gefragt wird.**

`[cmd]` **Im Mockup kommt *,,Checkin"* genau einmal vor:**
`recovery/OverviewView.js`.

## Was daraus folgt

`[read]` **Der Checkin ist kein neues Modul, sondern eine Klammer.**
Er schreibt in vorhandene Tabellen und stellt die Fragen an einem
Ort, statt sie ueber Module zu verteilen.

`[read]` **,,Rechts im Kontext abbilden"** — die rechte Spalte, die
das Nutrition-Modul bereits fuehrt (Smart suggestions, Planumfang,
Compliance). **Der Checkin liefert, was dort steht.**

## Offen

`[read]` **Wann und wie oft gefragt wird**, ist nicht entschieden.
`[cmd]` `recovery.checkins` traegt `entry_date` **und** `checkin_time`
— **das Schema laesst mehr als einmal am Tag zu.**

`[read]` **Und ob der Checkin ein eigenes Modul wird oder im
Dashboard wohnt**, ebenfalls nicht. **Beides ist vertretbar, keins
entschieden.**
