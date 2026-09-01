---
nr: G-319
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-317
entscheidung: E-41
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 3d5854f7
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen:
  gemessen: 2026-09-02
  befunde: 7
---

# G-319 — die Bedienung in *Alle Plaene*

## Befund

Tom, 2026-09-02, direkt an Claude Code: *,,planner: die bedienung
macht keinen sinn in alle plaene."*

`[read]` **Sieben Befunde, im Chat vergeben, ohne Punktdatei.**
**Diese Datei traegt sie nach, damit der Bericht auffindbar bleibt.**

    1  Anwaehlen soll die Werkbank zeigen
    2  Bearbeiten gehoert oben rechts
    3  gesperrter Plan ausweisen, Knopf deaktivieren
    4  Plaene nehmen die ganze Breite
    5  "+ New recipe" gibt es im Planner nicht
    6  "Copy week" braucht eine Funktion
    7  Meal plans: Plaene unten nicht aktivierbar

## Die zwei Ursachen, die tiefer lagen

`[cmd]` **Befund 7 war kein fehlender Knopf.** `[cmd]` **Der Aufrufer
gab `onAktivieren={() => setAktivieren(true)}`** — **die `id` wurde
verworfen, und der Dialog oeffnete fuer den aktiven Plan.**

`[read]` **Nicht *der Knopf fehlt*, sondern *der Knopf trifft den
falschen Plan*.**

`[cmd]` **Befund 6: `nutrition.copy_meal_plan_week(p_week_id,
p_target_week_start)` existiert seit C-150, mit
`auth.uid()`-Zeilenschutz** — **unter einem Attrappen-Knopf.**

`[read]` **Kein Bauauftrag, ein Verdrahtungsauftrag.** **Dieselbe
Klasse wie `meal_plan_day_to_diary` und
`reference_assessment_window_flags`.**

## Abnahme

**2026-09-02, Orchestrator.**

`[cmd]` **Drei anwaehlbare Kacheln, 0 echte *Anwaehlen*-Knoepfe** —
**die ganze Kachel ist der Knopf, mit `role="button"`, `tabIndex`,
Enter und Leertaste.**

`[cmd]` **Und die Durchschlagprobe ist der Nachweis, der zaehlt:**
*Aktivieren* geklickt, `plan` bleibt `null`, die Frage oeffnet —
**der Klick im Inneren loest nicht den Kachelklick aus.**

`[read]` **Genau das leistet `stopPropagation`, und ohne Probe sieht
es niemand.**

`[cmd]` **`Copy week` schreibt jetzt ueber `copy_meal_plan_week`,
mit Kalender: belegte Wochen rot und nicht waehlbar.**

`[cmd]` 19 Sabotagen, 19 gefangen. Gate 15/15, `dev` unberuehrt.

**Abgenommen.**
