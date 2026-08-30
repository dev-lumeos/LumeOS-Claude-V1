---
nr: G-276
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-274
entscheidung: null
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
