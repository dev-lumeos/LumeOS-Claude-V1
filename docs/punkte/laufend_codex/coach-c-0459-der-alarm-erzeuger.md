---
nr: C-459
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-402
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
---

# C-459 — der Alarm-Erzeuger

## Befund

Aus G-402, Claude Code, 2026-09-08:

> *,,Was ein Erzeuger braeuchte: `severity`, `kind`, eine
> Doppelsperre ueber 24 h, eine Tabelle fuer Coach-Einstellungen,
> und Adherence als Zahl."*

`[cmd]` **`coach.alerts` steht** ? **der Erzeuger fehlt.**

`[cmd]` **Das Altrepo hat `services/alertGenerator.ts`, 12,9 KB,
und `routes/alerting.ts`, 13,6 KB.**

## Die fuenf Teile

**1** ? `severity` **und** `kind` **an `coach.alerts`.**

`[read]` **Miss, was heute dasteht** ? **vielleicht heisst es
anders.**

**2** ? **Eine Doppelsperre ueber 24 Stunden.**

`[read]` **Derselbe Alarm zweimal am Tag ist Laerm** ? **und
Laerm wird weggeklickt.**

**3** ? **Eine Tabelle fuer Coach-Einstellungen.**

`[cmd]` **C-458 hat denselben Bedarf gemessen** ? **zweimal
verlangt, einmal bauen.**

`[read]` **Was ein Coach einstellt: Schwellen, welche Alarme er
will, wie oft.**

**4** ? **Adherence als Zahl.**

`[cmd]` **Das Altrepo hat `services/adherence.ts`, 20,8 KB.**

`[read]` **Miss, woraus sie sich rechnet** ? **Trainingslogs,
Ernaehrungslogs, Check-ins.**

`[read]` **Und ob sie gespeichert oder gerechnet wird** ? **eine
gespeicherte Zahl veraltet.**

**5** ? **Der Erzeuger selbst.**

`[cmd]` **Das Altrepo prueft in `checkClientForAlerts`:**
`checkAdherence`, `checkEngagement`, `checkInactivity`,
`checkProgressStagnation`, `checkSafetyIssues`.

`[read]` **Fuenf Pruefungen** ? **miss je eine, ob die Daten dafuer
da sind.**

## Was NICHT zu bauen ist

`[read]` **Keine Bewertung medizinischer Daten** ? **E-74.**

`[cmd]` **`checkSafetyIssues` koennte genau das sein** ? **messen
und melden, bevor du es baust.**
