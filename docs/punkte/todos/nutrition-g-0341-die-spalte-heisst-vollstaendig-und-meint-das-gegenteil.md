---
nr: G-341
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-399
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-341 — die Spalte heisst *vollständig* und meint das Gegenteil

## Befund

`[cmd]` **Im Nutrients-Reiter steht je Zeile:**

    VITA        60/60 Tg. vollst.
    CARTB       18/60 Tg. vollst.
    CAROTPAXB    0/60 Tg. vollst.

`[read]` **Bei `60/60` liest es sich richtig.** `[read]` **Bei
`0/60 vollst.` liest es sich wie ein Fehler** — **die Zahl sagt
*null*, das Wort sagt *vollstaendig*.**

## Und der Schnitt sagt nicht, worauf er beruht

`[cmd]` **`SCHNITT/TAG` steht kommentarlos daneben.**

`[read]` **Wenn er aus unvollstaendigen Tagen stammt, gehoert es
dazu** — **oder er wird gar nicht gezeigt** (C-399).

## Zu tun

`[read]` **Erst C-399 messen** — **wenn der Schnitt keine Grundlage
hat, ist die Beschriftung das kleinere Problem.**

`[read]` **Danach: die Spalte sagt, was sie zaehlt.**

## Gemessen am 2026-09-02: 47 Codes betroffen

`[cmd]` **Von 138 Codes zeigt keiner einen Schnitt bei
`value_count = 0`** — **die Rechnung ist richtig.**

`[cmd]` **Aber 47 zeigen einen begruendeten Teilschnitt bei null
vollstaendigen Tagen.**

`[read]` **47 mal dieselbe missverstaendliche Beschriftung** — **Tom
hat drei davon gesehen und alles hinterfragt.**

`[read]` **C-399 ist widerlegt: die Zahlen stimmen.** **Was fehlt,
ist die Spalte, die sagt, was sie zaehlt.**
