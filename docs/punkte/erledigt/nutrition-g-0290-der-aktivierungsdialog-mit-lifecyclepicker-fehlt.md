---
nr: G-290
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-modal.tsx
zahlen: null
---

# G-290 — Der Aktivierungsdialog mit LifecyclePicker fehlt

## Befund

`[cmd]` **`SPEC_10` nennt `MealPlanActivationModal`:** *,,Startdatum +
Lifecycle-Wahl + Bestaetigung"* — **und `LifecyclePicker`:
*,,once / rollover / sequence Auswahl mit visueller
Sequenz-Preview"*.**

`[cmd]` **Gebaut ist keins von beiden.** `[cmd]` **Deshalb liest die
Karte *,,kein Lebenszyklus hinterlegt"* und *,,Was am Ende geschieht,
ist fuer diesen Plan nicht festgelegt"*.**

## Was da ist

`[cmd]` **Das Schema steht seit dem 30.08.:** `lifecycle_type`,
`start_date`, `days_count`, `next_plan_id`, `rollover_count`.
`[cmd]` **Vorgabe `'once'`, Tageszahl 7.**

`[read]` **Ein neuer Plan bekommt also einen Lebenszyklus — nur die
zwei Bestandsplaene nicht.** `[cmd]` **Die tragen `NULL`, weil ihre
Herkunft nicht belegbar war.**

`[read]` **Was fehlt, ist die Wahl beim Aktivieren.**

## Auftrag

**Mitbeauftragt mit G-286 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — erledigt

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-286. **Der vollstaendige Bericht steht in [G-286](nutrition-g-0286-mealplandetail-das-tages-akkordeon-fehlt.md#bericht).**

### Der Dialog, am Schirm

    Plan aktivieren · Aufbau-Wochenplan
    STARTDATUM · LÄNGE IN TAGEN
    WAS AM ENDE GESCHIEHT
      läuft einmal ab          Nach der letzten Woche endet der Plan.
      beginnt danach von vorn  … startet er wieder bei Tag 1.
      geht in einen Folgeplan über … wird der Folgeplan aktiv.

`[read]` **Jede Wahl traegt ihre Wirkung** — G-270 hatte an der alten
Legende bemaengelt, dass drei Woerter ohne Erklaerung dastehen.

`[read]` **`unbekannt` ist nicht waehlbar** — es ist der Zustand der
Bestandsplaene, keine Wahl.

### Er schreibt — belegt mit Rueckbau

`[read]` **Nichts auf `dev@lumeos.app`.** `[cmd]` **`test-user` hat
keinen Plan** — also einen angelegt, aktiviert, geloescht:

    vorher       0 Zeilen (test-user)
    anlegen      status assigned · lifecycle once · self_created
    aktivieren   status active · lifecycle rollover
                 start_date 2026-09-01 · days_count 14
    Rueckbau     DELETE 1
    nachher      0 Zeilen · dev-Plan unveraendert (lifecycle NULL)

`[cmd]` **Vier Felder gehen zusammen raus** — `lifecycle_type`,
`start_date`, `days_count`, `status`. **Ein Waechter zaehlt sie:**
fehlt eines, ist der Plan halb aktiviert (aktiv ohne Startdatum).

### Eine zweite Wahrheit, im ersten Entwurf gebaut und wieder raus

`[cmd]` **Ich hatte `ZYKLUS_TEXT` und `ZYKLUS_ERKLAERUNG` neu
definiert** — sie stehen seit G-270 in `plan-lage.ts`. **Behoben, und
ein Waechter verbietet die Doppelung.**

## Abnahme

**2026-08-31, mit G-286 abgenommen:** gebaut: Aktivierung mit allen drei Zyklen und ihrer Folge;
`unbekannt` bewusst nicht angeboten.
