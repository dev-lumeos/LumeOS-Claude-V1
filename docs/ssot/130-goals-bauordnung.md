# 130 · Goals — die Bauordnung

`[cmd]` Erstellt 2026-09-29, Zweig `dev`, nach Toms Auftrag *„arbeite
dich mit dem neuen Wissen nochmal durch spec / altes repo / mockup und
definiere, was wir nun effektiv bauen und in welcher Reihenfolge."*

**Dieses Dokument baut nichts.** Es ordnet, was aus den vier Quellen
folgt, und legt die Reihenfolge fest.

---

## Toms Definition, und sie ist die kuerzeste Fassung

**2026-09-29, 11:56:**

> subnav goals: user kann einzelne oder mehrere ziele setzen
> subnav phase engine: user kann seine goals planen, terminieren,
> editieren

Zwei Reiter, vier Verben. Alles darunter ist Ableitung.

`[read]` **„Planen", „terminieren", „editieren" sind Operationen auf
Zielen**, nicht auf einem eigenen Objekt. Das entscheidet die
Architektur: die Phase Engine ist eine **Sicht auf Ziele**, keine
parallele Datenwelt.

---

## Die Rangfolge der Quellen

`[read]` Sie steht seit 2026-08-16 in
`docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md` und geht
auf Toms Wort zurueck:

| | Quelle | Was sie liefert |
|---|---|---|
| 1 | `referenz/lumeos-2026/` | **die Rechenwege** — Code, der lief |
| 2 | `theme-v1/module-goals*.jsx` | **der Umfang** — was ins Modul gehoert |
| 3 | `docs/specs/Goals/` | **die Absicht** — die schwaechste der drei |

`[cmd]` Die Spec ist die schwaechste, weil KI-erzeugt und byte-identisch
zu `BrainstormDocs/Goals/new/`. Sie **bestaetigt**, sie entscheidet nicht.

### Es sind drei Mockups, nicht eines

`[cmd]` `docs/spezifikation/10-plattform/design-system/theme-v1/`:

| Datei | Zeilen | Was darin steht |
|---|---:|---|
| `module-goals.jsx` | 903 | Ziele, Timeline, Body Metrics, Measurements, Composition |
| `module-goals-pro.jsx` | 905 | `GOAL_PHASES`, Phasenzustandsraster, Vorschaupanel |
| `module-goals-editor.jsx` | 569 | **der Editor mit zwoelf Reitern** und die Vorlagenbibliothek |

`[read]` **`module-goals-editor.jsx` war bis 2026-09-29 ungelesen.** Er
enthaelt die Antwort auf Toms Vorwurf, man koenne mit dem Phase-Reiter
nicht planen: den `anchor`-Reiter, der ein Showdatum nimmt und alles
rueckwaerts rechnet.

---

## Die sechs Ebenen

| Ebene | Was | Quelle | Stand 2026-09-29 |
|---|---|---|---|
| 1 | **Ziele** — mehrere, messbar, verknuepfte Module | `module-goals.jsx:7-70`, `GoalForm.tsx` | Tabelle fast fertig, **nicht anlegbar** (G-537) |
| 2 | **Strategiekatalog** — 17 ausgelieferte Definitionen | `definitions.ts`, `GOAL_PHASES`, `PHASE_MODELS.md` | **fehlt ganz** (G-536) |
| 3 | **Terminierung** — Ziel + Strategie + Zeitfenster, Anker rueckwaerts | `module-goals-editor.jsx:296` | falsche Annahme verbaut (G-538) |
| 4 | **Editor** — persoenlicher Override, zwoelf Reiter | `module-goals-editor.jsx` ganz | fehlt (G-539) |
| 5 | **Vorlagen** — eigene und geteilte | `PhaseTemplateLibrary` | fehlt, drei Entscheidungen offen (G-540) |
| 6 | **Automatik** — Waechter, Wochenanpassung, Uebergaenge | `PHASE_MODELS.md:180-229` | gebaut (G-520), Schwellwerte nicht konfigurierbar |

### Ebene 1 — Ziele

`[cmd]` `goals.user_goals` traegt `goal_type` mit CHECK ueber
`body_composition, performance, health, lifestyle` — **genau die vier
Typen des Entwurfs**. Dazu Titel, Ist-, Start- und Zielwert, Einheit,
`gueltig_ab`, `target_date`, Status, Prioritaet, `progress_pct`,
`auto_update`.

`[cmd]` **Es fehlt `linked_modules`, und es fehlt jeder Anlegeweg.**
`lib/goals/schreiben.ts` exportiert `zielAendern` und
`reihenfolgeSetzen` — kein `zielAnlegen`. Die fuenf Ziele sind Seed.

`[read]` `linked_modules` ist die **Datenquelle**, nicht Zierde: das
Mockup gibt jedem Ziel `history[]` und `pace`, die Tabelle hat
`auto_update`. Der Ist-Wert wird gezogen, nicht getippt. Fuenf Module:
nutrition, training, recovery, supplements, medical.

### Ebene 2 — der Strategiekatalog

`[read]` 17 Eintraege in `definitions.ts`, je 15 Felder. Vier `simple`,
dreizehn `advanced`. Sechs Kategorien.

`[cmd]` **Keine SQL-Datei im Altrepo nennt `goal_phases` oder
`phase_type`.** Dort waren die Phasen normale Ziele, und `goal_type_new`
trug die Strategie. Genau das sagt Tom: *„phase engine ist nur ein
builder der diese einzel goals plant."*

`[cmd]` Der fehlende Katalog erklaert **neun** Oberflaechenelemente, die
G-534 als „ohne Quelle" gemeldet hat: Sub-phases, Guards, Exit
conditions, Success metrics, Jahreszyklus, Best for, Purpose, die
Variantenkachel, Hoechstdauer und Protein. Das sind Feldnamen dieses
Katalogs.

### Ebene 3 — Terminierung, und hier liegt die Wurzel

`[read]` `111_goals_ziele_phasen.sql:88` traegt als Ueberschrift:

```
-- 2. Phasen, unabhaengig vom konkreten Ziel waehlbar.
goal_id  UUID REFERENCES goals.user_goals(id) ON DELETE SET NULL,
```

**Die Tabelle wurde mit dem Gegenteil von Toms Satz gebaut.** Daraus
folgt, was auf dem Bildschirm steht: der Reiter bietet Phasentypen an,
weil er keine Ziele kennt.

`[read]` Zweiter Fehler aus derselben Annahme: `uq_goal_phases_one_open`
erlaubt **eine** offene Phase je *Nutzer*. Tom sagt „mehrere ziele" —
Fettabbau und Bench-Press laufen parallel. Richtig ist: je *Ziel*.

`[read]` **Terminieren heisst Ankerdatum.** `module-goals-editor.jsx:296`:
Showdatum setzen → Prep start, Mid, Late, Refeeds begin, Peak week, Show
day rechnen rueckwaerts. Sechs Datumsangaben aus einem.

### Ebene 4 — der Editor

`[read]` Zeile 56: *„Personal override — the shipped defaults stay
intact."* Zwei Knoepfe im Fuss: *„Save as my template"*, *„Apply to my
plan"*.

**Damit ist `goal_phases.parameters` nicht ueberfluessig.** Der Katalog
ist ausgeliefert und fuer alle gleich; der Override gehoert einem
Nutzer. Zwei Ebenen, nicht eine — das war bis 2026-09-29 im Auftrag
G-536 falsch angesetzt und wurde als Nachtrag korrigiert.

`[read]` `PE_MODES` (Zeile 3-11) sagt je Strategie, welche Reiter
erscheinen. Das ist eine Eigenschaft der Strategie und gehoert an den
Katalogeintrag, nicht in sieben `if` im Browser.

---

## Die Reihenfolge

| # | Punkt | Bereich | Warum hier |
|---|---|---|---|
| 1 | **G-537** Ziele anlegbar | Claude Code | Ohne Ziel gibt es nichts zu planen |
| 2 | **G-536** der Katalog | Codex | Ohne Katalog hat der Planer nichts zu reihen |
| 3 | **G-538** Terminierung | Codex, dann Claude Code | Loest Toms Vorwurf auf |
| 4 | **G-539** der Editor | Claude Code | Verschiebt Zeitfenster — braucht 3 |
| 5 | **G-540** Vorlagen | offen, drei Entscheidungen zuerst | Braucht alle vier |

1 und 2 laufen seit 2026-09-29 parallel und beruehren sich nicht: der
eine baut `user_goals` und den Dialog, der andere `goal_strategies` und
`berechne_zielwerte`.

3 hat einen Datenbank- und einen Oberflaechenteil, in dieser Ordnung.

### Was ausdruecklich wartet

**Tom, 2026-09-29:** *„physique oder pose interessiert mich noch nicht,
wenn wir nicht mal in der lage sind grundlagen in der ui darzustellen."*

Damit warten: Physique-Verhaeltnisse, Pose-Sessions, C-494 (IFBB-Klassen
und Pflichtposen), G-139 (Fortschrittsfotos).

`phase_rate_rules` bleibt leer. Die Baender gehoeren an den
Katalogeintrag, nicht in eine Nebentabelle — nach G-536 A3 ist sie
redundant und wird Tom zum Fallen vorgelegt.

---

## Was dieses Dokument korrigiert

`[read]` Drei Annahmen, die vor dem 2026-09-29 in Auftraegen standen und
falsch waren:

1. **„Der Phase-Reiter ist Attrappe."** Er ist die Mockup-Referenz unter
   dem Trennstrich (E-68, G-365). Gezaehlt wurden Attrappen-Marken, die
   dort hingehoeren.
2. **„`parameters` wird ueberfluessig."** Es ist die Override-Ebene.
3. **„Die Baender sind unbelegt" (G-521 A1).** Sie stehen in drei
   Quellen: `definitions.ts`, `GOAL_PHASES`, `PHASE_MODELS.md`.

`[read]` Und ein Planungsfehler, den Tom benannt hat: *„du verzettelst
dich immer wieder in irgendwas anstatt dich an das grosse ganze zu
halten."* Die Auftraege E-1, G-511, G-529, G-531, G-533 und G-520 haben
alle geregelt, **wo eine Zahl liegt**. Keiner hat geregelt, **was Tom
sieht und tut**. Diese Bauordnung ist entlang der vier Verben
geschnitten, nicht entlang der Tabellen.

---

## Quellen

- `referenz/lumeos-2026/src/modules/goals/lib/definitions.ts`
- `referenz/lumeos-2026/src/modules/goals/components/nutrition/GoalSelector.tsx`
- `docs/spezifikation/10-plattform/design-system/theme-v1/module-goals.jsx`
- `docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-pro.jsx`
- `docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx`
- `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md`
- `docs/specs/Goals/PHASE_MODELS.md`
- `supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql`
- `docs/ssot/116-goals-anbindung.md`, `docs/ssot/129-goals-prioritaeten.md`
