---
nr: G-248
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: C-48
entscheidung: null
agent: claudecode
beauftragt: 2026-08-28
beruehrt:
  dateien: [apps/web/src/lib/nutrition]
zahlen:
  gemessen: 2026-08-28
  zaehler_gesamt: 35
  zaehler_geladen: 9
  vitc_missing_tage: 180
  tage_gesamt: 181
---

# G-248 — der Leseweg laedt neun von 35 Fehlzaehlern

## Befund

Aus C-48, Claude Code, 2026-08-28.

`[cmd]` **`nutrition.daily_summary` fuehrt 35 `_missing`-Zaehler.**
`[cmd]` **Der Leseweg des Diary-Reiters laedt neun** — `SUMMARY_MACROS`.

`[cmd]` **Und die Zaehler, die tatsaechlich feuern, sind nicht dabei:**

    vitc      180 von 181 Tagen     nicht geladen
    water_g     3                   geladen
    zn          3                   geladen
    fe          1                   nicht geladen
    enercc · prot625 · cho · fat    0   geladen

`[read]` **Die Regel 1 aus C-48 ist damit gebaut und unsichtbar.**
*,,Die Regel ist nicht tot, sie trifft nur andere Naehrstoffe als
die, die dieser Reiter laedt."*

`[read]` **Dass Vitamin C an 180 von 181 Tagen unvollstaendig ist,
weiss heute niemand** — weder der Diary-Reiter noch der Nutzer.

## Zu klaeren

**Erweitern oder nicht?** `[read]` **35 Zaehler im Tagebuch waeren zu
viel.** `[cmd]` Die Mikronaehrstoff-Ansicht aus G-239 zeigt sie
ohnehin je Naehrstoff.

`[read]` **Die Frage ist eher, ob das Tagebuch einen Sammelhinweis
braucht** — *,,drei Naehrstoffe unvollstaendig"* mit Verweis auf die
Mikroansicht — **statt neun einzelne.**

## Auftrag

**Mitbeauftragt mit G-11 am 2026-08-28.** Der Auftragstext
und der Bericht stehen dort.

`[cmd]` **Beantwortet und gebaut** — der Bericht steht in G-11.
**Gemessen 2026-08-29:** von 35 Zaehlern feuern neun, der Leseweg
laedt neun andere, Schnittmenge `fibt`. **Gebaut ist der
Sammelhinweis** aus `daily_nutrient_summary_long` — 76 von 138
Naehrstoffen unvollstaendig, in einer Abfrage.

