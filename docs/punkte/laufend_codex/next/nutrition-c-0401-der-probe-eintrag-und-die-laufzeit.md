---
nr: C-401
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-400
entscheidung: E-62
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-09-02
---

# C-401 — der Probe-Eintrag und die Laufzeit

## Befund

Aus C-400, Codex, 2026-09-02.

`[cmd]` **`Buddy auto-plan`: eine Woche, 29 statt 28 Eintraege** —
**der Probe-Eintrag vom 02.09.**

`[cmd]` **Er stammt vom Orchestrator.** `[cmd]` **Codex hat ihn
stehen lassen, weil keine Loeschfreigabe vorlag.**

**Tom hat sie am 02.09. erteilt** (E-62).

## Und die Laufzeit

    Aufbau-Wochenplan   days_count 21, 3 Wochen   -- stimmt
    Cut 4-Meal 2200     days_count 28, 1 Woche
    Lean bulk 3100      days_count 84, 1 Woche
    Buddy auto-plan     days_count  7, 1 Woche    -- stimmt

`[cmd]` **E-62: `days_count` ist die Laufzeit, nicht die Zahl der
beschriebenen Tage.**

`[cmd]` **Und E-44 hat den Fall:** **`rollover` — eine Woche,
mehrfach durchlaufen.**

`[read]` **Zu messen: tragen Cut und Lean `lifecycle_type =
'rollover'`?**

`[read]` **Wenn ja, ist nichts falsch** — **die Anzeige muss nur
sagen, dass eine Woche wiederholt wird.** `[read]` **Wenn nein,
fehlen die Wochen im Seed.**

## Auftrag

**Mitbeauftragt: C-187.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-09-02.**

### 1 · Der Probe-Eintrag — Freigabe liegt vor

`[cmd]` **Tom, 2026-09-02: Loeschfreigabe erteilt** (E-62).

`[cmd]` **`Buddy auto-plan`, 29 statt 28 Eintraege, der einzelne am
02.09.**

`[read]` **Damit wird der C-380-Test gruen.**

### 2 · Die Laufzeit

`[cmd]` **E-62: `days_count` ist die Laufzeit.**

    Cut 4-Meal 2200   28, 1 Woche
    Lean bulk 3100    84, 1 Woche

`[read]` **Miss, ob sie `lifecycle_type = 'rollover'` tragen.**

`[read]` **Wenn ja: nichts falsch, aber die Anzeige muss sagen, dass
eine Woche wiederholt wird.** `[read]` **Wenn nein: fehlen die Wochen
im Seed** — **und dann sag, ob der Seed sie anlegen soll oder
`days_count` zu berichtigen ist.**

### 3 · C-187 — der liegengebliebene Kettenschritt

`[cmd]` **Fuer CHOL existiert die C-346-Korrektur, nicht live
eingespielt.**

`[read]` **Spiel sie ein** — **das ist kein offener Befund, sondern
ein Schritt, der nie gelaufen ist.**

`[read]` **EAA und Medication-Monitoring bleiben liegen** — sie
brauchen Entscheidungen, keine Arbeit.

### Was nicht zu tun ist

**Keine weiteren Zeilen loeschen** — die Freigabe gilt fuer den einen
Eintrag.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Buddy        28 Eintraege, C-380-Test gruen
    lifecycle    Cut und Lean, gemessen
    Laufzeit     stimmig oder berichtigt, begruendet
    CHOL         C-346 eingespielt, Livebestand gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
