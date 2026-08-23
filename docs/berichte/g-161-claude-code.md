# G-161 — Claude Code, 2026-08-23

**Roh, unbearbeitet.** Geprueft vom Orchestrator; die Pruefung steht in
`docs/todo/ERLEDIGT.md`.

---

G-161 ist fertig. Nicht committet, nicht gestaged.

## Was RLS zeigt — und das ist nicht 2/6/42/112

`[cmd]` Der Gesamtbestand stimmt, aber dev gehört nur die Hälfte:

| Ebene | gesamt | dev sieht | test-user |
|---|---:|---:|---:|
| Pläne | 2 | 1 | 0 |
| Wochen | 6 | 3 | 0 |
| Tage | 42 | 21 | 0 |
| Einträge | 112 | 56 | 0 |

Der zweite Plan gehört einem anderen Konto. Gerendert gemessen:
„3 Wochen · 21 Tage · 56 Einträge" — genau die Ansage.

## Drei von acht angebunden

`plan-lesen` benutzt, nicht nachgebaut — derselbe Aufruf wie der Planner,
`page.tsx` lädt jetzt auch auf `?tab=plans`.

| Kachel | Stand |
|---|---|
| Plankopf | echt — Name, `is_active`, Ziele (2.500 kcal / 170 / 313 / 75 g), Zählung |
| Planumfang | echt — ersetzt „Plan settings" |
| Bibliothek | echt — ein Plan mit seinen drei Wochen, kopierte markiert |

## Fünf bleiben Attrappe — mit gemessenem Grund

`[cmd]` `meal_plan_entries` hat keine Statusspalte
(pending/confirmed/deviated/skipped) → Ghost entries und beide
Compliance-Kacheln sind nicht ableitbar.

`[cmd]` `meal_plans` hat kein `lifecycle`, `started_at`, `days_count`,
`confirm_mode`, `next_plan_id` → „Lifecycle types" ist eine Legende über
Spalten, die es nicht gibt.

`[cmd]` 0 `shopping%`-Tabellen → Shopping list und Scale list hängen an C-175.

Der Ring ist bewusst weg. Eine Compliance in Prozent braucht einen
Ist-Soll-Vergleich je Eintrag; ohne Status wäre jede Zahl erfunden.
Statt dessen steht die gemessene Zählung da.
