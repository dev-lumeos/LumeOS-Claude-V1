---
nr: G-420
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-413
entscheidung: null
beruehrt:
  tabellen: [nutrition.food_preferences]
zahlen:
  gemessen: 2026-09-08
---

# G-420 — Kettenlaeufe setzen Testdaten zurueck

## Befund

`[cmd]` **Claude Code mass in G-413: `dev@lumeos.app` steht auf
`diet_type = 'vegan'`, Fleisch faellt auf null.**

`[cmd]` **Der Orchestrator mass Stunden spaeter: `omnivore`,
Fleisch 1.073.**

`[cmd]` **`food_preferences.updated_at` fuer `dev`: 2026-09-11
07:27:41** ? **der Kommentar sagt *,,G-11a Testdaten"*.**

`[cmd]` **Kettenlaeufe an diesem Tag:**

    C-464  08:24
    C-465  13:07
    C-467  14:07

`[read]` **Beide Messungen waren richtig** ? **zu ihrer Zeit.**

## Warum das zaehlt

`[read]` **Ein Agent misst, berichtet, und die Zahl ist beim
Abnehmen falsch** ? **ohne dass jemand einen Fehler gemacht
hat.**

`[cmd]` **Und die Regel *,,Zahlen tragen ihren Stichtag"*
(CLAUDE.md) traegt das nicht** ? **der Stichtag war derselbe
Tag.**

## Was zu messen ist

**1** ? **Welche Testdaten setzt die Kette zurueck?**

`[cmd]` **`nutrition.food_preferences` nachweislich.**

`[read]` **Was noch? Messen, welche Seeds beim Vollaufbau
laufen.**

**2** ? **Ist das gewollt?**

`[read]` **Eine Wegwerf-Datenbank soll reproduzierbar sein** ?
**das spricht dafuer.**

`[read]` **Aber `dev` ist Toms Konto** ? **wenn ein Kettenlauf
seine Einstellungen ueberschreibt, verliert er Arbeit.**

`[cmd]` **CLAUDE.md sagt: *,,Nachweise auf
`test-user@lumeos.local` fuehren ? Laeufe auf `dev`
ueberschreiben Toms gespeicherte Einstellungen."***

`[read]` **Die Regel gibt es** ? **aber sie gilt fuer Nachweise,
nicht fuer Kettenlaeufe.**

**3** ? **Was ein Agent daraus machen sollte.**

`[read]` **Wer eine Zahl misst, die aus einem Seed stammt, sollte
es benennen** ? **`[cmd]` mit dem Hinweis, dass sie beim
naechsten Vollaufbau anders sein kann.**
