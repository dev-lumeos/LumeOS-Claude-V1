---
nr: G-276
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-274
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  tabellen: [nutrition.meal_plan_logs]
zahlen: null
---

# G-276 — MealCam schreibt `confirmation_mode` ohne Fotoweg

## Befund

Aus G-274, Claude Code, 2026-08-30.

`[cmd]` **Der MealCam-Knopf schreibt `confirmation_mode: 'mealcam'`**
— **ohne dass ein Foto aufgenommen oder ausgewertet wird.**

`[read]` **Damit steht in den Daten, dass eine Mahlzeit per Kamera
bestaetigt wurde, obwohl niemand fotografiert hat.**

`[cmd]` **`SPEC_03` Flow 4, Fall 1 beschreibt den Fotoweg als eigenen
Schritt.**

## Was daran haengt

`[cmd]` **`ADR_MEALCAM_V1`:** *,,MealCam darf NIE automatisch finale
Meal Items schreiben."* `[read]` **Hier schreibt nicht MealCam,
sondern der Bestaetigungsweg unter falschem Namen** — **die Wirkung
ist harmlos, die Angabe ist es nicht.**

`[read]` **Zwei Wege:** den Knopf entfernen, bis der Fotoweg steht.
**Oder `confirmation_mode` auf das setzen, was tatsaechlich passiert
ist.**

`[read]` **Ein Feld, das die Herkunft einer Bestaetigung benennt,
muss die Wahrheit sagen** — sonst ist es schlimmer als keins.

## Auftrag — drei kleine, alle entschieden

**Mitbeauftragt: G-258, G-251.** Bericht in diese Datei.

`[read]` **Beauftragt am 2026-08-30.**

### 1 · G-276 — MealCam sagt die Unwahrheit

`[cmd]` **Der Knopf schreibt `confirmation_mode: 'mealcam'`, ohne
dass fotografiert wird.**

`[read]` **Zwei Wege, und du entscheidest nach der Messung:** den
Knopf entfernen, bis der Fotoweg steht — **oder den Modus auf das
setzen, was tatsaechlich passiert ist.**

`[read]` **Ein Feld, das die Herkunft einer Bestaetigung benennt,
muss die Wahrheit sagen.** `[cmd]` **`ADR_MEALCAM_V1` verlangt
ohnehin, dass MealCam nie automatisch schreibt** — hier schreibt
nicht MealCam, sondern der Bestaetigungsweg unter falschem Namen.

### 2 · G-258 — Pending actions im Tagebuch

**Entschieden in E-29: ueber eine Funktion, nicht direkt.**

`[cmd]` **`coach.pending_actions` traegt 3 Zeilen und eine Spalte
`module`.** `[cmd]` **Und `coach.darf_nutrition_plan_aendern()` steht
seit dem 30.08. live** — **das ist die Naht, die E-29 meint.**

`[read]` **Miss zuerst, ob es schon eine Lesefunktion gibt** — Codex
hat in C-342 eine Rechteregel gebaut, **vielleicht liegt daneben
schon eine, die liest.** `[read]` **Wenn nicht: melden, nicht selbst
direkt lesen.**

`[read]` **Und die Gegenrichtung ist offen:** ob der Nutzer eine
Aktion bestaetigen kann, beruehrt `confirmed_by` und die drei
Aenderungsprotokolle. **Das ist ein eigener Punkt, kein Teil
hiervon.**

### 3 · G-251 — die Herkunfts-Filter im Food-DB-Reiter

`[read]` **Drei genannt:** Favoriten, *,,wie gestern"*, eigene Foods.

`[read]` **Vor dem Bau messen, woraus jeder kommt.** `[read]` **Und
*,,wie gestern"* setzt voraus, dass gestern etwas erfasst wurde** —
**was zeigt der Filter an einem Tag ohne Vortag?** `[cmd]` **Seit
G-274 kann das Tagebuch gefuellt sein, also ist der Fall
herstellbar.**

### Was nicht zu tun ist

**Kein Schema aendern.**
**Nicht direkt in `coach.*` lesen** — E-29.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    MealCam-Modus       was steht jetzt drin, was danach
    Lesefunktion        existiert sie? gemessen
    Pending actions     echte Zeilen, ueber die Funktion
    drei Filter         je woraus, oder als offen gemeldet
    ohne Vortag         was zeigt "wie gestern"?
    Attrappen           am Schirm, vorher / nachher

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **A-30, A-59, A-60, A-62.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
