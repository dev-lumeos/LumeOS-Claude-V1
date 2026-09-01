---
nr: G-316
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-315
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 3d5854f7
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/plan-lesen.ts
zahlen: null
---

# G-316 — *Log deviation* braucht die Posten

## Befund

Aus G-315, Claude Code, 2026-09-02.

`[cmd]` **Die Vorlage zeigt bei `pending` vier Knoepfe** (Z. 398-404):
Confirm as planned, MealCam, **Log deviation**, Skip.

`[cmd]` **Zwei sind gebaut.** `[cmd]` **MealCam bleibt weg** — der
Knopf schrieb `confirmation_mode: 'mealcam'` ohne Foto (G-276).

`[cmd]` **Und *Log deviation* fehlt, weil `ladeTagesEintraege` nur
Bezeichnung und kcal liefert.**

`[read]` **Ohne Posten keine Mengenfelder, ohne Mengenfelder keine
bezifferbare Abweichung.**

## Der Weg steht schon

`[cmd]` **G-309 hat die Ghost-Anzeige mit Einzelzutaten gebaut** —
Rezeptname als Ueberschrift, je Zutat ein Mengenfeld.

`[cmd]` **Und `plan-log-write.ts` rechnet `deviation_kcal` und
`deviation_pct`** — belegt: 1.028 kcal, 76,3 Prozent.

`[read]` **Es fehlt der Leseweg im Tageseintrag** — **derselbe, den
G-311 fuer das Rezept im Raster gebraucht hat.**

## Auftrag

**Mitbeauftragt mit G-317 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-02, mit G-317 abgenommen:** gebaut: der Leseweg liefert die Posten, die Abweichung ist
bezifferbar.
