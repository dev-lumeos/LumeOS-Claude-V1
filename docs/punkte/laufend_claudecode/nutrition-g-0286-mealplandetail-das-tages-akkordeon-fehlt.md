---
nr: G-286
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-286 — MealPlanDetail — das Tages-Akkordeon fehlt

## Befund

`[cmd]` **`SPEC_10` nennt `MealPlanDetail`: *,,Plan-Vorschau:
Tages-Accordion mit Items"*.**

`[cmd]` **Der *Active plan*-Reiter zeigt heute Zahlen** — 3 Wochen,
21 Tage, 56 Eintraege — **aber nicht die 56 Eintraege.**

`[read]` **Tom, 2026-08-31:** *,,ist das was wir spezifieziert haben
und editierbar sein soll? dann erklaer mir mal was das alles soll
darin."*

`[read]` **Ein Plan, den man nicht aufklappen kann, ist eine
Kennzahl, kein Plan.**

## Was zu bauen ist

**Das Tages-Akkordeon: je Tag die Eintraege, aufklappbar,
bearbeitbar.**

`[cmd]` **Die Daten stehen:** `meal_plan_entries` traegt 112 Zeilen,
`meal_plan_days` 42, `meal_plan_weeks` die Wochen. `[cmd]` **Der
Schreibweg steht seit G-267/G-268.**

`[cmd]` **Und `MealPlanDayView` ist gebaut** — im Planner-Reiter,
siebenmal nebeneinander. **Es fehlt die Tagesansicht innerhalb eines
Plans.**

## Auftrag — der Meal-plans-Reiter wird benutzbar

**Mitbeauftragt: G-287, G-290.** Bericht in diese Datei.

**Beauftragt am 2026-08-31.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag kann man einen Plan oeffnen, seine
Tage sehen, ihn bearbeiten und aktivieren.**

`[read]` **Tom hat den Reiter am 31.08. durchgesehen. Sein Urteil:**
*,,irgend eine auflistung die gar nichts sagt, nichtmal anschaubar ist
oder editierbar."*

### Die Spec nennt die Komponenten

`[cmd]` **`docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md`,
Abschnitt *Meal Plan Components (8)*:**

    MealPlanList              gebaut, ohne Karte
    MealPlanCard              fehlt
    MealPlanDetail            fehlt
    MealPlanActivationModal   fehlt
    MealPlanDayView           gebaut, im Planner
    MealPlanComplianceBar     gebaut
    GhostEntryList            gebaut
    LifecyclePicker           fehlt

**Drei davon sind dieser Auftrag: `MealPlanCard`, `MealPlanDetail`,
`MealPlanActivationModal` mit `LifecyclePicker`.**

### Die Vorlagen im Altbestand

`[cmd]` **CLAUDE.md: Struktur ja, Code nie.**

    referenz/.../nutrition/components/MealPlanView.tsx   21 kB
    referenz/.../nutrition/hooks/useMealPlans.ts          6 kB
    referenz/.../api/coach/engines/meal-planner.ts      18 kB
    mockup-zwischenwurf/features/nutrition/...          11 kB

`[read]` **`MealPlanView.tsx` ist mit 21 kB die groesste** — **sie
zeigt, wie Liste, Karte und Detail zusammenhaengen.**

`[read]` **`meal-planner.ts` gehoert zum Coach-Modul** — **lies sie
nur, wenn du wissen willst, wie ein Plan entsteht; sie ist nicht Teil
dieses Auftrags.**

`[read]` **Wenn eine Vorlage etwas zeigt, das `SPEC_10` nicht nennt:
melden, nicht weglassen.**

### Was da ist

`[cmd]` **`meal_plan_entries` 112 Zeilen, `meal_plan_days` 42,
`meal_plan_weeks` die Wochen.** `[cmd]` **Der Schreibweg steht seit
G-267/G-268, der Lebenszyklus seit dem 30.08. im Schema.**

`[cmd]` **`plan_origin` traegt die Quelle** — das Source-Badge aus der
Spec. `[cmd]` **Die zwei Bestandsplaene haben `NULL`** — **zeigen,
nicht fuellen.**

### Was nicht zu tun ist

**Keine zweite Ansicht neben `MealPlanDayView`** — die ist gebaut und
wird wiederverwendet.
**Nichts auf `dev@lumeos.app` schreiben** — `test-user@lumeos.local`
mit Rueckbau.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.** **Codex fasst ihn nicht
an.**

### Nachweis

    Plan oeffnen           Karte fuehrt aufs Detail, Bildschirmfoto
    Tage aufklappen        die 112 Eintraege sichtbar
    bearbeiten             schreibt, belegt mit Rueckbau
    aktivieren             Startdatum und Lebenszyklus waehlbar
    plan_origin NULL       wie sieht die Zeile aus
    Attrappen              am Schirm, vorher / nachher
    Ladezeit               ms, kalt und warm

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
