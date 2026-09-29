---
nr: G-548
typ: entscheidung
modul: goals
schwere: mittel
angelegt: 2026-09-29

braucht: []
kind_von: G-542

quellen:
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

zahlen:
  gemessen: 2026-09-29
  wert_vorgaenger: 12
  wert_spec_und_mockup: 20
  wert_live: 20
---

# Wie lange darf eine moderate Diaet laufen?

`[cmd]` **`goal_strategies.moderate_cut.max_duration_weeks` steht live auf
20.** Der Vorgaenger trug 12, Spec und Mockup 20. Der Orchestrator hat am
2026-09-29 vorlaeufig 20 gesetzt (eingespielt mit G-538 A7) — **das weicht
bewusst von der Regel „der laufende Vorgaenger gewinnt" ab und braucht
darum eine Bestaetigung.**

## Warum vorlaeufig 20

`[read]` **`max_duration_weeks` ist ein harter Deckel.** Die Spec nennt als
Waechter `duration > max_duration -> force_transition`. Bei 12 Wochen bricht
die Strategie eine normale Diaet mitten im Verlauf ab und erzwingt einen
Wechsel.

| Quelle | Aussage |
|---|---|
| Helms et al. 2014, *JISSN* 11:20 | Wettkampfdiaeten **12 bis 24 Wochen**, je nach Ausgangs-Koerperfett |
| Trexler et al. 2014, *JISSN* 11:7 | metabolische Anpassung waechst mit der Dauer; Diaetpausen mildern sie |
| Byrne et al. 2018, *Int J Obes* 42 (MATADOR) | intermittierende Diaet: mehr Fettverlust, geringere Anpassung als durchgehend |

`[read]` **Die Sicherheit kommt nach MATADOR nicht vom kurzen Deckel**,
sondern von der Diaetpause alle 8 Wochen und den Waechtern (Kraftverlust,
Abnahmerate, HRV) — die greifen ab Woche 1.

`[cmd]` **Und die Quelle des Vorgaengers ist hier schwach:** von 17
Strategien tragen nur 8 einen Wert fuer `max_duration_weeks`. Eine
loeckrige Quelle traegt keine Entscheidung allein.

## Was zu entscheiden ist

**20 Wochen mit Pause alle 8, oder 12 hart?**

Bei 20 gibt es im Verlauf zwei Diaetpausen; bei 12 einen Zwangswechsel nach
knapp drei Monaten. Beide Zahlen liegen in Helms' Spanne.

`[read]` **Fuer Tobias am 2026-09-30.** Es ist eine Erfahrungsfrage, keine
Literaturfrage — die Literatur nennt eine Spanne, nicht einen Wert.

**Bleibt 20:** dieser Punkt wird geschlossen, nichts zu tun.
**Wird es 12:** eine Zeile im Kettenschritt, und die Diaetpausenregel muss
mit, weil zwei Pausen in 12 Wochen nicht mehr passen.
