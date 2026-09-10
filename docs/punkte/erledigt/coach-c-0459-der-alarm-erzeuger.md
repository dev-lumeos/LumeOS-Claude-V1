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
erledigt: 2026-09-08
commit: d582052b
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

---

## Bericht — 2026-09-10

**Erledigt: Erzeuger-Kern, keine erfundenen Fachregeln.**

`coach.alerts` trägt jetzt `kind` und `severity`; bestehende Alerts
bleiben dort ehrlich leer. `coach.alert_settings` enthält pro Coach
Schwellen und Schalter für Aktivität, Adherence und Engagement, aber
keine Abrechnungs-`tier`.

`coach.raise_alert(...)` verlangt eine aktive eigene Beziehung,
nimmt einen transaktionalen Advisory Lock und dedupliziert gleichen
Coach, Klient und Kind über 24 Stunden. Nur faktische,
nichtmedizinische Kinds werden angenommen.

Die fünf Altrepo-Prüfungen: Beziehungen und Check-ins existieren;
die Quellen für Nutrition-Inaktivität, Buddy-Engagement und
Buddy-Safety fehlen. Adherence ist ohne Plan gegen Ist nicht
berechenbar. Daher keine erfundene Prozentzahl oder automatische
Regel. `checkSafetyIssues` bleibt wegen E-74 ausgeschlossen.

Sicherung: `backup/schema/20260910150000_c459_alerts_vor_einspielen.dump`,
**12.661 B**, SHA-256
`20271D23FE842C298243B54E85E788C6C296B75330068B66AC63992E1B571222`.

Frischer Aufbau `lumeos_c459_final3`: **SCHEMA VOLLSTAENDIG**,
**367,4 s**. Gegenprobe grün: 1 Subtest, **1,00 s**; Duplikat bleibt
bei 1, fremder Coach und `medical` werden abgewiesen, anon hat kein
EXECUTE (`backup/c459-final-test.out`).

`node tools/punkte-pruefen.mjs`: **grün**, 607 Punkte und 25/25
erwartete Befunde; TypeScript-Prüfung ebenfalls grün.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    kind und severity an coach.alerts, beide mit CHECK
    severity: info | low | medium | high | critical
    coach.alert_settings, RLS an, vier Policies
    coach.raise_alert(client, kind, severity, title,
                      detail, metric)
    anon ohne EXECUTE
    Vollkette SCHEMA VOLLSTAENDIG, 367,4 s
    Sicherung 12.661 B, SHA-256

`[cmd]` **Selbst gemessen: alle sechs Punkte stimmen.**

### `alert_settings` traegt genau, was ein Coach einstellt

`[cmd]` **Sieben Felder:**

    activity_threshold_days
    adherence_threshold_pct
    engagement_threshold_days
    notify_activity
    notify_adherence
    notify_progress
    notify_engagement

`[read]` **Drei Schwellen und vier Schalter** ? **nicht eine
JSONB-Wolke.**

### Die wichtigste Zeile des Berichts

> *,,Keine erfundenen Regeln: Adherence, Buddy-Engagement und
> Safety fehlen als belastbare Eingaenge. Medical-/Safety-Erzeugung
> bleibt wegen E-74 ausgeschlossen."*

`[cmd]` **Der Auftrag nannte fuenf Pruefungen aus dem Altrepo:**
`checkAdherence`, `checkEngagement`, `checkInactivity`,
`checkProgressStagnation`, `checkSafetyIssues`.

`[read]` **Er hat gemessen, welche Daten haben** ? **und die
anderen NICHT gebaut.**

`[cmd]` **`checkSafetyIssues` haette E-74 gebrochen** ? **genau
der Fall, den ich zu messen verlangt hatte.**

`[read]` **Und die Schwellen stehen trotzdem in
`alert_settings`** ? **die Einstellung ist da, der Erzeuger
folgt, wenn die Eingaenge stehen.**

### Die Doppelsperre ist belegt

`[cmd]` **24 Stunden, mit Gegenprobe:** *,,Duplikat bleibt bei
einer Zeile, fremder Coach und medical werden abgewiesen."*

`[read]` **Drei Bedingungen in einer Probe.**

**Abgenommen.**
