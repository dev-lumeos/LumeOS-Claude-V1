---
nr: C-376
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-306
entscheidung: E-42
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen: null
---

# C-376 — frieren abgeschlossene Plaene auch ein?

## Befund

Aus C-372, Claude Code, 2026-08-31. **Er hat es offengelassen, statt
still zu entscheiden.**

`[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17 nennt nur `active`:**

    MealPlan.status = 'active'
      -> MealPlanDay READ-ONLY
      -> MealPlanItem READ-ONLY

`[read]` **Aber die Begruendung ist das Log:** *,,MealPlanLog
referenziert `plan_item_id`."*

`[read]` **Ein abgeschlossener Plan traegt sein Log genauso.**
**Wer ihn nachtraeglich aendert, verfaelscht dieselbe Auswertung.**

## Die Antwort folgt aus der Begruendung

`[read]` **Die Sperre gehoert an das Log, nicht an den Status.**

    hat der Plan Log-Zeilen?   dann eingefroren
    keine Log-Zeilen           dann bearbeitbar

`[read]` **Damit ist ein Entwurf frei, ein aktiver gesperrt, ein
abgeschlossener gesperrt** — **und ein aktivierter Plan, der noch nie
protokolliert wurde, waere es auch nicht.**

`[cmd]` **`meal_plan_logs` traegt heute 0 Zeilen.** `[read]` **Nach
dieser Regel waere der Bestandsplan also bearbeitbar** — **und das ist
richtig, denn es gibt nichts zu verfaelschen.**

`[read]` **Der ADR hat die einfachere Regel gewaehlt.** **Die
genauere ist die am Log.** **Zu entscheiden, welche gilt.**

## Abnahme

**2026-08-31, durch E-42 beantwortet.**

`[read]` **Die Frage war: frieren `completed`/`archived` auch ein?**

`[read]` **E-42 macht sie gegenstandslos:** **die Sperre haengt an der
einzelnen Position, nicht am Status des Plans.**

`[cmd]` **Eine Position mit Log (`status <> 'pending'`) ist
eingefroren, eine ohne nicht** — **unabhaengig davon, ob der Plan
aktiv, abgeschlossen oder archiviert ist.**

`[read]` **Mein Vorschlag *die Sperre ans Log haengen* war richtig,
die Begruendung aber zu eng:** ich hatte den Planzustand gemeint,
**Tom meint die Position.**

**Geschlossen.**
