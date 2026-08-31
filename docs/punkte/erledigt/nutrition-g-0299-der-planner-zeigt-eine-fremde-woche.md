---
nr: G-299
typ: feature
modul: nutrition
schwere: hoch
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
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen: null
---

# G-299 — der Planner zeigt eine fremde Woche

## Befund

Tom, 2026-08-31: *,,planner ist irgendwas aber noch nicht
brauchbar."*

`[cmd]` **Der Planner oeffnet auf dem 18.6. bis 24.6.** `[cmd]`
**Heute ist der 31.08.**

`[read]` **Er zeigt die erste Woche des Plans, nicht die laufende
Woche** — **und sagt nicht, warum.**

## Was fehlt

**Ein Weg, etwas zu aendern.**

`[cmd]` **Die Knoepfe sind *Copy week* und *New recipe*.** `[cmd]`
**Letzterer ist eine Attrappe** (G-289 baut sie).

`[read]` **Ein Feld anklicken und den Eintrag aendern gibt es
nicht** — **dasselbe wie in G-298, an anderer Stelle.**

## Und die Vorfrage

`[read]` **Was ist der Planner, wenn es den Meal-plans-Reiter
gibt?**

`[cmd]` **Beide zeigen denselben Plan:** der eine als Tagesliste, der
andere als Wochengitter. `[cmd]` **`MealPlanDayView` steht in
`SPEC_10` unter den Plan-Komponenten** — **der Planner ist kein
eigener Bereich der Spec.**

`[read]` **Also entweder ist er die Wochenansicht des Plans und
gehoert dorthin** — **oder er ist etwas anderes und braucht eine
eigene Beschreibung.**

## Auftrag

**Mitbeauftragt mit G-298 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Ergebnis (Kurzfassung, Einzelheiten in G-298)

### Die Vorfrage zuerst: was der Planner ist

`[cmd]` **`SPEC_10_COMPONENTS.md` fuehrt acht Meal-Plan-Komponenten
und keinen Planner** — `MealPlanDayView` heisst dort *„Ein Tag
innerhalb eines Plans"*.

`[cmd]` **Beide Reiter lesen denselben Plan** (`ladePlan`), zeigen
aber Verschiedenes: **Meal plans** die Karte mit Zielen,
Lebenszyklus, Herkunft und Einhaltung — *was der Plan ist*; **der
Planner** das Wochengitter mit einer Zelle je Mahlzeit und Tag —
*wann was gegessen wird*.

`[read]` **Antwort: nicht loeschen, sondern zustaendig machen.** Eine
Position gehoert in ein Raster aus Tag und Mahlzeit, und genau das
ist dieses Gitter. **Der Planner ist ab G-298 die
Bearbeitungsflaeche des aktiven Plans**, Meal plans bleibt seine
Beschreibung. **Keine dritte Ansicht** — das Formular klappt in der
Zelle auf.

### Warum er auf dem 18.6. oeffnete

`[cmd]` **Nicht die Navigation war schuld.** `PlannerEchtTab` sucht
seit jeher die Woche, in der heute liegt, und faellt auf die erste
zurueck. `[cmd]` **Der Plan hat drei Wochen — 18.6.–24.6.,
2.7.–8.7., 9.7.–15.7. — und heute ist in keiner.**

`[read]` **Der Rueckfall war stumm; das war der Fehler.** Jetzt steht
*„keine Planwoche für heute"* in der Leiste, und **gibt es eine,
fuehrt ein Knopf hin.** `[cmd]` Auf einer Probebuehne mit einer Woche
um heute herum ist der heutige Tag hervorgehoben — die Logik greift,
sobald Daten da sind.

Bild: `backup/g298-planner-nachher.png`

## Abnahme

**2026-08-31, mit G-298 abgenommen:** beantwortet und gebaut: der Planner ist die Bearbeitungsflaeche,
das Formular oeffnet in der Zelle.
