---
nr: G-504
typ: befund
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-25
entscheidung: E-52
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/fehlende-kacheln.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-504 - vier Kacheln warten auf dieselbe gemeinsame Sicht

## Die Kacheln

`[cmd]` **Vier Kacheln UEBER der Linie nennen denselben
Grund** - **E-52, die modueluebergreifende Sicht:**

    history    Body stats x strength      goals.body_measurements
    progress   Fatigue detection          training + recovery
    calendar   Cross-module gating        training + recovery
    standards  Training score             Ausspielweg nach goals

`[read]` **Vier Kacheln, EIN Hindernis** - deshalb ein Punkt
und nicht vier. `[read]` **Wer die Sicht baut, loest alle
vier.**

## Der Stand, gemessen

`[cmd]` **Die Daten sind da, in beiden Modulen:**

    goals.body_measurements    362 Zeilen
    recovery.scores            370 Zeilen
    training.workout_sessions   76
    training.workout_sets      396

`[cmd]` **Was fehlt, ist die Sicht ueber die Schemagrenze:**
keine Funktion in `training` liest `goals.` oder `recovery.`
(`pg_proc`-Suche, null Treffer).

`[read]` **Das ist genau, was E-52 beschreibt** - und der
Vermerk an den Kacheln sagt es bereits richtig. **Dieser
Punkt haelt nur fest, dass es VIER sind und sie zusammen
fallen.**

## Was NICHT der Grund ist

`[read]` **Nicht fehlende Daten.** Wer beim Lesen der Marke
denkt *,,es gibt keine Koerpermasse"*, sieht nicht nach - es
gibt 362 Zeilen.

## Zu klaeren

`[read]` **Wo die Sicht hingehoert:** eine Datenbankfunktion
in `training`, oder zwei Lesewege, die die Anzeige
zusammenfuehrt. `[cmd]` **Der erste Weg ist der, den
`nutrition.nutrient_intake_source_totals_for_day` (C-466)
schon geht.**

## Abnahmebedingungen

    A1  eine Entscheidung: Datenbanksicht oder
        zwei Lesewege.
    A2  je Kachel angebunden oder mit dem
        berichtigten Grund. Foto.
    A3  keine Marke ohne echte Zahl entfernt.
