---
nr: C-537
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: E-87
entscheidung: E-87
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a975287a
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-08
---

# C-537 - days_count zieht beim Rollover mit

## Die Entscheidung (E-87)

`[read]` **Der Plan IST nach dem Rollover 35 Tage lang** ?
**`days_count` schreibt das fort.**

## Der Befund

Aus G-488, Claude Code, 2026-09-08:

> *,,`ablaufKlaeren` verschiebt bei einem Rollover die Wochen
und erhoeht `rollover_count`, fuehrt aber `days_count` NIE
nach."*

`[cmd]` **Gemessen:**

    Aufbau-Wochenplan  days_count 28  rollover 1  35 Tage
    Nachweiswoche      days_count  7  rollover 0   7 Tage
    Aufbau-Wochenplan  days_count 21  rollover 0  21 Tage

`[cmd]` **28 + 7 = 35** ? **genau ein Rollover.**

## Zu bauen

    1  ablaufKlaeren schreibt days_count fort
    2  die bestehenden Plaene werden nachgezogen
    3  ein Waechter: days_count gleich der Zahl der
       materialisierten Tage

`[read]` **Punkt 3 faengt den naechsten Rollover, der es
vergisst.**

`[cmd]` **Und der Schirm zeigt heute die GEZAEHLTEN Tage plus
einen Satz zur Abweichung (G-488)** ? **wenn die Zahlen
stimmen, faellt der Satz weg. MELDEN, damit Claude Code ihn
entfernt.**

## Abnahmebedingungen

    A1  ablaufKlaeren schreibt days_count fort. Belegt.
    A2  der Aufbau-Wochenplan traegt 35. Zahl.
    A3  die beiden anderen unveraendert.
    A4  ein Waechter faengt eine Abweichung.
        Sabotageprobe.
    A5  ein zweiter Rollover in einer Transaktion:
        days_count waechst mit. Belegt, ROLLBACK.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Gebaut ? NICHT live.**

`[cmd]` **Kein `days_count`-Trigger auf `meal_plan_days`, und
der Aufbau-Wochenplan traegt weiter 28.**

### Er hat es als TRIGGER gebaut, nicht als Zeile

> *,,`days_count` folgt nun per DB-Trigger den
materialisierten Tagen; Nachzug liegt getrennt im Datenpfad."*

`[read]` **Ich hatte *,,`ablaufKlaeren` schreibt fort"*
geschrieben** ? **ein Trigger faengt auch jeden anderen Weg,
der Tage anlegt.**

`[cmd]` **Belegt: 28 -> 35, zweiter Rollover 35 -> 42 in einer
Transaktion, danach ROLLBACK.**

**Abgenommen. Einspielen steht aus.**

## Nachtrag: LIVE eingespielt, 2026-09-08

`[cmd]` **Selbst nachgemessen:**

    Aufbau-Wochenplan  days_count 35  Tage 35
    Nachweiswoche      days_count  7  Tage  7
    Aufbau-Wochenplan  days_count 21  Tage 21

`[cmd]` **Kein Plan weicht mehr ab.**

`[cmd]` **Transaktionsprobe: 7 -> 14 beim Rollover, ROLLBACK
stellt 7/7 wieder her.**

