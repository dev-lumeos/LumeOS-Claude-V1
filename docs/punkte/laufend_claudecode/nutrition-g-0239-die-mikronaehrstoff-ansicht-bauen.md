---
nr: G-239
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-48
entscheidung: null
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
  dateien:
    - apps/web/public/mockup/features/nutrition/MicroDashboard.js
    - docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md
zahlen: null
agent: claudecode
beauftragt: 2026-08-28
---

# G-239 — die Mikronaehrstoff-Ansicht bauen

## Befund

`[cmd]` **Die Opus-Review fuehrt *,,Micronutrient Review UI"* als
einen von sieben Bereichen mit Status `Ready`** — Components, Hooks
und Flow vollstaendig, **ohne Abhaengigkeit von den offenen
Entscheidungen.**

`[cmd]` **Die Datenseite traegt:** `nutrition.daily_reference_assessment(user_id, date)`
ist eine **Funktion**, keine Tabelle, und liefert je Naehrstoff eine
Zeile mit unter anderem:

    actual_value · reference_value_min · reference_value_max
    reference_kind · reference_direction · reference_pct
    reference_pct_min · reference_pct_max · reference_status
    value_complete · missing_count
    nutrient_display_tier · source · source_locator
    profile_age_years · profile_biological_sex
    profile_is_pregnant · profile_is_lactating

`[read]` **Die vier Regeln aus C-48 sind darin bereits abgebildet** —
sie muessen nicht erfunden, sondern gelesen werden.

`[cmd]` **`nutrient_reference_values` traegt 165 Zeilen zu 138
Codes**, mit Quelle je Zeile: EFSA, National Academies, WHO/FAO/UNU.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

`[read]` **Und lies zuerst die drei Quellen**, wie Tom es am 28.08.
zum Massstab gemacht hat:

    docs/specs/.../SPEC_10_COMPONENTS.md      MicroDashboard,
                                              MicroNutrientCard
    apps/web/public/mockup/.../MicroDashboard.js
    referenz/lumeos-2026/                     Struktur, nie Code

`[read]` **Der Mockup ist aus der Spec entstanden, mit Abgleich zum
alten Repo.** **Wenn du einen Unterschied findest, ist die erste
Frage, ob du richtig hingesehen hast** — nicht, ob jemand etwas
erfunden hat. **Das war mein Fehler heute, dreimal.**

### Die vier Regeln aus C-48

**1 · Fehlzaehler bleiben sichtbar.** `[cmd]` `missing_count` und
`value_complete` sagen, ob die Summe vollstaendig ist.
`reference_status` liefert dann `incomplete` **ohne Prozentwert**.
`[read]` **Die Oberflaeche darf daraus keine Null machen.**

**2 · Die Wertart entscheidet die Leserichtung.** `[cmd]`
`reference_kind` und `reference_direction` stehen im Rueckgabewert.
`[read]` **80 Prozent eines `PRI` ist zu wenig, 80 Prozent eines `UL`
ist zu viel. Beides als *,,80 %"* anzuzeigen waere gefaehrlich.**

**3 · `NO_STANDALONE_REFERENCE` und `NO_REFERENCE` sind kein
*,,0 % gedeckt"*.** `[read]` **Sie sind eine eigene Aussage** —
dieselbe Klasse wie *begruendet leer* gegen *nicht bearbeitet* aus
G-208, wo du die Form schon gebaut hast.

**4 · Die Referenzwerte gelten fuer gesunde Erwachsene.** `[cmd]`
Die Funktion liefert `profile_age_years`, `profile_biological_sex`,
`profile_is_pregnant`, `profile_is_lactating` mit. `[read]` **Pruef,
ob und wie das sichtbar wird.**

### Was aus G-218 uebernommen gehoert

`[read]` **Du hast dort gemessen, dass zwei Achsen sichtbar, aber
nicht unterscheidbar waren.** **Dieselbe Frage stellt sich hier:**
`reference_kind` hat zehn Auspraegungen — **welche davon muss ein
Nutzer unterscheiden koennen, und welche sind eine Sache fuer den
Beleg?**

`[cmd]` **`nutrient_display_tier` ist laut G-140 ein Abo-Tier, keine
Baumebene.** `[read]` **Nicht als Gliederung benutzen, ohne das
geklaert zu haben** — G-235 haelt die Frage offen.

### Was nicht zu tun ist

**Keine Referenzwerte aendern, keine Schwellen setzen.**
**Keine Tabelle anlegen** — Codex arbeitet an G-221.
**Keine Bewertung erfinden, wo die Funktion keine liefert.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Zeilen je Zustand            gedeckt / zu wenig / zu viel /
                                 unvollstaendig / ohne Referenz
    Leserichtung                 PRI und UL unterscheidbar -
                                 Bildschirmfoto
    unvollstaendig               kein Prozentwert, kein Null
    ohne Referenz                eigene Aussage, kein 0 %
    Quelle je Naehrstoff         erreichbar
    Attrappen im Modul           vorher / nachher
    Ladezeit                     ms, kalt und warm getrennt
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

`[read]` **Gegenprobe:** einen Naehrstoff finden, der ueber seinem
`UL` liegt, und einen unter seinem `PRI`. `[read]` **Beide muessen
verschieden aussehen — und wenn es auf `dev` keinen ueber `UL` gibt,
sag das, statt einen zu erfinden.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
