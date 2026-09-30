---
nr: G-565
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30

braucht: [G-539, G-543]
kind_von: G-543
entscheidung: E-83

quellen:
  - docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md
  - docs/punkte/erledigt/goals-g-0539-der-phasen-editor-fehlt.md

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - apps/web/src/app/v2/goals/phasen-editor-echt.tsx
    - apps/web/src/app/v2/goals/modale.tsx
    - apps/web/src/lib/goals/
---

# Die Einheit ist eine Nutzerwahl, heute gibt es nur Prozent

## Der Befund

**Tom, 2026-09-30, 17:45:** *„das soll doch ein user entscheiden,
manchmal ist es klarer mit prozenten zu arbeiten und manchmal easier mit
direkt kcal."*

`[cmd]` **Heute gibt es nur Prozent.** Das Editorfeld fuehrt
`weight_change_target_percent` mit `%` als Suffix, `tdee_modifier` ist
ein nackter Faktor (0,85). **Keine Stelle zeigt den
Kilokalorienbetrag daneben** — gemessen in
`phasen-editor-echt.tsx:148-156`.

`[cmd]` **Und im selben Editor rechnet das Kalorienradeln schon in
kcal** (+200 / −300). **Dieselbe Oberflaeche fuehrt beide Einheiten, ohne
dass eine Stelle sie ineinander umrechnet.**

`[read]` **Was fehlt, ist nicht ein zweites Feld, sondern ein
Umschalter.** Zwei Eingabefelder fuer dieselbe Groesse waeren die
Fehlerklasse aus G-529 — zwei Namen fuer eine Sache, die auseinanderlaufen.

## Was gilt

`[cmd]` **Gespeichert wird die Rate** (E-83): kcal haengt am Gewicht und
waere beim naechsten Wiegen falsch, ohne dass sich die Absicht geaendert
hat. **Die Umrechnung ist E-1, in beide Richtungen:**

    kcal/Tag = 11 × Rate × Gewicht        Rate = kcal / (11 × Gewicht)

`[cmd]` **Das Gewicht ist das am Phasenbeginn**, nicht das heutige
(G-543).

## Auftrag

**A1 — der Umschalter, dort wo die Rate vorkommt.** Messen, wo das ist:
Anlegen-Modal, Editor, Zeitachse, Zielkarten. **Sag, wie du abgegrenzt
hast.** Je Stelle: dieselbe Groesse, zwei Einheiten, ein gespeicherter
Wert.

**A2 — die Umrechnung liegt server-frei in `lib/goals/`**, neben E-1, und
wird nicht in der Komponente wiederholt. `goals.kcal_delta_aus_zielrate`
ist die Datenbankseite — **die Zahlen muessen auf beiden Wegen
uebereinstimmen, und das ist zu belegen, nicht zu behaupten.**

**A3 — die Rueckrichtung darf nicht driften.** Gibt der Nutzer kcal ein,
wird eine Rate gespeichert. **Zu belegen mit einer Zahl, die von Hand
nachrechenbar ist:** kcal eingeben, Rate lesen, wieder anzeigen — dieselbe
Kilokalorienzahl, kein Rundungsverlust, der sich aufschaukelt. `numeric(5,3)`
ist die Grenze.

**A4 — die Wahl gehoert an den Nutzer, nicht an die Phase.** Eine
Einstellung, keine Spalte in `goal_phases`. **Wo sie liegt, ist zu
melden** — wenn es keinen Ort dafuer gibt, ist das ein Befund fuer Codex
und kein Grund, sie in die Phase zu schreiben.

**Nicht Teil:** ob unsere Katalogwerte stimmen (G-566, bei Tobias), und
`tdee_modifier` als Faktor — der ist eine eigene Groesse, und ob er
ueberhaupt bleibt, haengt an G-530.

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · Bilder je
Einheit · die Umrechnung in beide Richtungen mit einer von Hand
nachrechenbaren Zahl · Sabotage je Waechter in beide Richtungen ·
`pnpm gate` gruen mit Testzahl UND der Aussage zu den neun Waechtern im
Vorcommit-Haken · nichts committen.
