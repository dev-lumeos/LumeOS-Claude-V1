---
nr: G-306
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-298
entscheidung: E-41
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 18a4e31b
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-08-31
---

# G-306 — der Planeditor verletzt die Immutabilitaet

## Befund

`[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17, bestaetigt in `SPEC_01`
Abschnitt 8, `SPEC_04` und `SPEC_02_PATCH_NOTES`:**

    MealPlan.status = 'active'
      -> MealPlanDay READ-ONLY
      -> MealPlanItem READ-ONLY
      -> API gibt 409 bei PUT/PATCH/DELETE

`[cmd]` **G-298 hat am 31.08. genau das gebaut, was der ADR
verbietet** — hinzufuegen, aendern und entfernen an einem Plan mit
`status = active`.

`[read]` **Weder Claude Code noch der Orchestrator hatten den ADR
gelesen.** `[read]` **Der Auftrag nannte `SPEC_03` und `SPEC_10`,
nicht die ADRs.**

## Warum die Regel gut ist

`[cmd]` **Die Begruendung steht im ADR:** *,,MealPlanLog referenziert
`plan_item_id`. Wenn Items nachtraeglich geaendert werden, stimmt die
Compliance-History nicht mehr und Deviation-Berechnungen werden
falsch."*

`[read]` **Aus einem aktiven Plan entstehen Ghost Entries im
Tagebuch.** **Wer ihn nachtraeglich aendert, aendert rueckwirkend,
was geplant war.**

## Was zu tun ist

`[read]` **Die Bearbeitung an `status` binden:** Entwurf ja, aktiv
nein.

`[cmd]` **Und der Ausweg steht im ADR:** *,,pausieren, eine Kopie
erstellen, bearbeiten und neu aktivieren."*

`[read]` **Ohne einen Knopf dafuer ist die Regel eine Sackgasse** —
der Nutzer sieht, dass er nicht darf, und findet keinen Weg. **E-41
schlaegt *Kopie bearbeiten* vor.**

## Auftrag

**Mitbeauftragt mit C-372 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis (Kurzfassung, Einzelheiten in C-372)

`[cmd]` **Zurueckgebaut und abgesichert.** `ADR_IMPROVEMENTS_PACKAGE`
#17 verlangt: `status = 'active'` -> Positionen READ-ONLY, **API gibt
409**.

`[cmd]` **Im Browser an einem echten aktiven Plan gefahren:**

    Aenderung an einer Position -> HTTP 409
    „Dieser Plan läuft. Seine Positionen sind eingefroren, weil das
     Protokoll auf sie zeigt … Über „Kopie bearbeiten“ entsteht ein
     Entwurf …"

`[cmd]` **409, nicht 403** — dafuer gibt es den neuen Fehlercode
`PLAN_AKTIV`. `[read]` **Der Unterschied traegt:** bei 403 fehlt das
Recht dauerhaft, bei 409 ist der Zustand im Weg, **und der laesst
sich aendern.**

### Warum die Regel in der Anwendung stehen MUSS

`[cmd]` **Gemessen: `meal_plan_logs.plan_entry_id` traegt
`ON DELETE RESTRICT`** — **die Datenbank verhindert nur das LOESCHEN
einer protokollierten Position, nicht ihr AENDERN.** `[cmd]` **In der
Probe ging `UPDATE amount_g = 999` auf eine Position eines aktiven
Plans glatt durch.**

`[read]` **Genau diese Luecke hat G-298 aufgemacht.**

### Der Ausweg — sonst waere die Regel eine Sackgasse

`[cmd]` **Am gesperrten Plan steht *Kopie bearbeiten*.** Die Kopie
traegt Wochen, Tage und Positionen, ist **`assigned`** (also
bearbeitbar), **und das Original bleibt `active` mit seinem
Protokoll.** `[read]` **Waere die Kopie sofort aktiv, fuehrte der
Ausweg im Kreis** — ein Waechter haelt das fest.

`[cmd]` **Das Pausieren des Originals ist eine Wahl, kein
Automatismus.**

### Ein bestehender Waechter ist gefallen — zu Recht

`[cmd]` **`G-298: der Schreibweg prueft die Coach-Sperre"` zaehlte
`pruefeFreigabe`-Aufrufe**, und die Funktion prueft nur die Herkunft.
**`pruefePositionsRecht` prueft beide Sperren in einer Abfrage**;
`pruefeFreigabe` und `herkunftDesTages` sind entfernt (A-59).

## Abnahme

**2026-08-31, mit C-372 abgenommen:** gebaut: HTTP 409 mit Grund und Ausweg. Der Befund dazu: `ON DELETE
RESTRICT` blockiert nur das Loeschen, nicht das Aendern.
