---
nr: G-301
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: E-39
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-301 — der Meal-plans-Reiter folgt keinem Flow

## Befund

Tom, 2026-08-31: *,,was soll das fuer ein activer plan sein? new plan
fuer tagesziele? ist das so definiert in specs usw?"*

`[cmd]` **Nein.** `[cmd]` **`SPEC_03_USER_FLOWS.md` Flow 3 beschreibt
den Plan-Ablauf:**

    1  Uebersicht zeigt ALLE verfuegbaren Plaene
         Eigene        ohne Label
         Vom Coach     "Von [Coach-Name]"
         Marketplace   "Gekauft: [Produkt-Name]"
         Von Buddy     "Erstellt von Buddy"
    2  Tap auf Plan -> Plan-Vorschau
    3  "Plan aktivieren"
    4  Startdatum waehlen (Default morgen, max 7 Tage voraus)
    5  Lifecycle waehlen
    6  Bestaetigen -> status: active
         bestehender aktiver Plan -> status: paused
         ab Startdatum: Ghost Entries im Diary

## Was daraus folgt

`[read]` **Es gibt keine drei Unterreiter.** **Es gibt eine
Uebersicht, und ein Plan darin traegt `status: active`.**

`[cmd]` **Die Reiter *Active plan*, *Plan library* und *Shopping
list* stehen in keiner Spec.** `[read]` **Sie sind erfunden.**

`[cmd]` **Und die Einkaufsliste gehoert gar nicht hierher:** `[cmd]`
**Flow 8 sagt *Einkaufsliste aus Rezept generieren*** — **nicht aus
einer Planwoche.** `[read]` **Die heutige Kachel behauptet das
Gegenteil.**

## Und das Anlegen fehlt in der Spec

`[cmd]` **Flow 3 beginnt bei der Uebersicht.** `[read]` **Woher ein
eigener Plan kommt, steht nirgends** — **Coach, Marketplace und Buddy
sind genannt, *Eigene (source: user)* ohne Weg.**

`[cmd]` **`SPEC_10` nennt `MealPlanActivationModal` — kein
`MealPlanCreateModal`.**

`[read]` **Das *Neuer Plan*-Formular mit Name, Beschreibung und
Tageszielen hat der Orchestrator in G-290 aus dem Schema
abgeleitet.** **Das war eine Erfindung.**

`[read]` **Als C-370 an Tom: soll ein Nutzer einen leeren Plan
anlegen koennen, und wenn ja, wie?**

## Auftrag

**Mitbeauftragt mit G-289 am 2026-08-31.** Der Bericht steht dort.

`[cmd]` **E-39 entscheidet: gebaut wird, was in `SPEC_03` steht.**

`[read]` **Flow 3 kennt eine Uebersicht aller Plaene, nicht drei
Unterreiter.** **Ein Plan darin traegt `status: active`, die anderen
`paused` oder `completed`.**

`[cmd]` **Und die Einkaufsliste gehoert zum Rezept** (Flow 8), **nicht
in den Plan-Reiter.**

`[read]` **Die Herkunft wird je Zeile gezeigt** — eigene ohne Label,
Coach mit Namen, Marketplace mit Produktnamen. `[cmd]` **Heute sind
alle `self_created`.**

## Ergebnis (Kurzfassung, Einzelheiten in G-289)

`[cmd]` **Die drei Unterreiter sind entfernt.** `Active plan`,
`Plan library` und `Shopping list` stehen in keiner Spec.

`[cmd]` **`SPEC_03` Flow 3, Schritt 2 kennt EINE Uebersicht:**
*„Uebersicht zeigt alle verfuegbaren Plaene"* — **und ein Plan DARIN
traegt `status: active`.** Genau so steht es jetzt da: „Alle Pläne",
der aktive oben, mit seinem Zustand an der Karte.

`[cmd]` **Der Shopping-Unterreiter ist ENTFERNT, nicht abgeschaltet**
(A-59) — mit ihm zwei Attrappenkarten (*„from Recomp 5-Meal Plan"*,
Print/Export ohne Wirkung). `[cmd]` **Die Attrappenzahl in
`tab-plans.tsx` faellt damit von 8 auf 6**, und der Waechter ist mit
Begruendung nachgezogen.

`[read]` **Flow 8 sagt, wohin die Liste gehoert:** *„Rezept oeffnen
-> Einkaufsliste erstellen"*. **Sie steht jetzt echt im
Rezepte-Reiter**, mit Schreibweg und Abhaken (G-288).

### Die Herkunft ist vorgesehen, nicht gebaut

`[cmd]` **Flow 3, Schritt 2 nennt die Beschriftung je Quelle** —
eigene **ohne Label**, *„Von [Coach-Name]"*, *„Gekauft:
[Produkt-Name]"*, *„Erstellt von Buddy"*. **Alle vier sind gebaut und
geprueft.**

`[read]` **Kein leerer Coach-Bereich, keine eigene Route** — E-29 und
die Sperre aus G-269 gelten unveraendert.

Bild: `backup/g289-final-plans.png`

## Abnahme

**2026-08-31, mit G-289 abgenommen:** gebaut: drei Unterreiter durch eine Uebersicht ersetzt, der
Shopping-Unterreiter entfernt statt versteckt.
