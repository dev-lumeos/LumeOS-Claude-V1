---
nr: G-315
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-310
entscheidung: E-41
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-315 — die Kopien sind keine Kopien

## Befund

Tom, 2026-09-02, am Schirm: *,,wo siehst du hier die parallelen zu
dem mockup? das ist irgend eine haluzinierte drecksscheisse aber
ganz und gar nicht was wir spezifiziert haben oder das mockup
grafisch zeigt."*

`[read]` **Die Titel stimmen, der Inhalt nicht.** `[read]` **Der
Orchestrator hat Kachelnamen abgehakt statt zu vergleichen, was
drinsteht.**

## Zeile fuer Zeile, Vorlage gegen Ist

    Vorlage Z. 391-396          Ist
    ------------------------    ----------------------------
    Zeit links, 38 px breit     fehlt
    Mahlzeitname                da
    Status-Pille farbig         "offen", grau
    kcal rechtsbuendig          fehlt
    Lebensmittel darunter,      fehlt
      46 px eingerueckt,
      mit " ? " verbunden
    Notiz bei Abweichung        fehlt
      ("Mandeln -> Walnuesse")
    vier Knoepfe bei pending:   zwei ("Wie geplant",
      Confirm as planned,         "Auslassen")
      MealCam, Log deviation,
      Skip

    Vorlage Z. 414-419          Ist
    ------------------------    ----------------------------
    Plan settings, 5 Zeilen:    8 Zeilen, vier davon stehen
      Lifecycle, Days count,      schon in der Karte links
      Started, Next restart,      (Wochen, Tage gesamt,
      Confirm mode                Eintraege, Zustand)

    Vorlage Z. 364              Ist
    ------------------------    ----------------------------
    Ring, size 92, stroke 7,    Ring, aber "COMPLIANCE" liegt
      label unter der Zahl        im Ring und ueberlagert

    Vorlage Z. 436              Ist
    ------------------------    ----------------------------
    Sparkline, h=44,            Balken ohne erkennbaren
      sieben Werte                Verlauf

## Und zwei Fehler, keine Layoutfragen

`[cmd]` **1. *In der Werkbank* steht am aktiven Plan** — **dem, der
schon offen ist.** `[read]` **Der Knopf gehoert an die anderen.**

`[cmd]` **2. Beim Aktivieren steht: *,,Dieser Plan kommt von deinem
Coach und ist fuer direkte Aenderungen gesperrt."*** — **und der
Aktivieren-Knopf ist gesperrt.**

`[read]` **Das ist eine Bearbeitungssperre, die das Aktivieren
blockiert.** `[cmd]` **E-42: `darf_weiterverkaufen` ist ein
Weiterverkaufsschutz, kein Editierschutz** — **und Aktivieren ist
weder das eine noch das andere.**

Tom: *,,schwachsinn hoch 2 plan aktivieren gesperrt wegen aenderung?
wenn man starten will."*

## Und der untere Teil

Tom: *,,der untere teil alles ineinander verschoben."*

`[cmd]` **Der aktive Plan steht dreimal:** oben als Karte, in der
Mitte als Aufklappzeile mit *Tage ansehen*, unten in *ALLE PLAENE*.

`[cmd]` **Die Vorlage zeigt ihn einmal** — Z. 449: `plans.slice(1)`,
**die Bibliothek laesst den aktiven aus.**

## Auftrag — Zeile fuer Zeile gegen die Vorlage

**Beauftragt am 2026-09-02.**

### Zuerst die zwei Fehler

`[cmd]` **1. Aktivieren ist gesperrt, weil der Plan vom Coach
kommt.** `[read]` **Das ist falsch.** `[cmd]` **E-42:
`darf_weiterverkaufen` schuetzt vor Weiterverkauf, nicht vor
Benutzung.** **Aktivieren ist keine Aenderung.**

`[cmd]` **2. *In der Werkbank* steht am aktiven Plan** — dem, der
schon offen ist. **Der Knopf gehoert an die anderen.**

### Dann die Kopie, Zeile fuer Zeile

**Vorlage: `theme-v1/module-nutrition-spec.jsx`, `MealPlansView`,
Zeile 334-521.** **Oeffne sie und halte jede Zeile daneben.**

    Z. 364     Ring size 92 stroke 7, label UNTER der Zahl
    Z. 373     die Rechnung, mono, 10,5 px
    Z. 391     Zeit links, 38 px breit, num dim
    Z. 392     Mahlzeitname 12,5 px, 600
    Z. 393     Status-Pille in der Statusfarbe
    Z. 394     kcal rechtsbuendig, marginLeft auto
    Z. 396     Lebensmittel, 46 px eingerueckt, mit " ? "
    Z. 397     Notiz bei Abweichung, in var(--warn), mono
    Z. 398-404 bei pending VIER Knoepfe: Confirm as planned,
               MealCam, Log deviation, Skip
    Z. 386-388 pending = gestrichelt, sonst durchgezogen mit
               Statusfarbe 5 % Hintergrund
    Z. 414-419 Plan settings: GENAU fuenf Zeilen
    Z. 435-441 Sparkline h=44, darunter Avg, Deviations, Skips

`[read]` **Vier Zeilen der Vorlage sind durch spaetere
Entscheidungen ueberholt** — **die bleiben weg:**

    Z. 418  Next restart      C-373: kein Automatismus
    Z. 419  Confirm mode      liegt in meal_plan_logs, je Ausfuehrung
    Z. 421  read-only-Kasten  E-42
    Z. 426  Pause plan        E-42

`[read]` **Alles andere wird kopiert, nicht ausgewaehlt.**

### Und der aktive Plan steht dreimal

`[cmd]` **Oben als Karte, in der Mitte als Aufklappzeile mit *Tage
ansehen*, unten in *ALLE PLAENE*.**

`[cmd]` **Die Vorlage zeigt ihn einmal** — Z. 449: `plans.slice(1)`.

`[read]` **Die Aufklappzeile in der Mitte ist die alte
`PlanKurzEcht`** — **sie stand vor der Bibliothek und ist jetzt
doppelt.**

### Wie du es belegst

`[cmd]` **`dev@lumeos.app` traegt jetzt vier Plaene mit allen vier
Herkuenften und sechs Protokollzeilen** — der Orchestrator hat sie
angelegt, damit am Schirm etwas zu sehen ist.

`[read]` **Bau nicht auf `test-user` und raeum es weg.** **Diesmal
soll Tom es sehen koennen.**

`[cmd]` **Ausnahmsweise: `dev` darf gelesen und angesehen werden.**
**Nicht schreiben** — die Seed-Daten stehen schon.

### Nachweis

    je Zeile der Vorlage   Ist-Zustand daneben, Zeilennummer
    Aktivieren             geht bei einem Coach-Plan
    In der Werkbank        steht an den nicht-aktiven
    aktiver Plan           steht EINMAL
    Bildschirmfoto         vorher / nachher, 1440 px

`[read]` **Die erste Zeile ist der Auftrag.** **Wenn eine Zeile der
Vorlage nicht umsetzbar ist, sag welche und warum** — **nicht
weglassen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
