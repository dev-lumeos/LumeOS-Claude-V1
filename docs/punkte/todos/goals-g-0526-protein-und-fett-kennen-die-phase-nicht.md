---
nr: G-526
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-28

quellen:
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/specs/Goals/CONSOLIDATED_KNOWLEDGE.md
  - docs/punkte/00-INDEX.md  # G-511 ueber den Index, A-75 A6

braucht: [G-511]
kind_von: G-511

beruehrt:
  tabellen:
    - goals.nutrition_targets
    - goals.goal_phases
  dateien:
    - docs/specs/Goals/PHASE_MODELS.md

zahlen:
  gemessen: 2026-09-28
  protein_live_g_pro_kg: 2
  protein_spec_spannen: 5
  fett_live_pct: 25
  faser_live_g: 30
---

# G-526 - Protein, Fett und Faser kennen die Phase nicht

## Der Befund

`[cmd]` **`goals.berechne_zielwerte`, gemessen am 2026-09-28 in der
laufenden Instanz:**

    ROUND(a.body_weight_kg * 2, 1)        AS protein_wert
    ROUND(a.kcal_wert * 0.25 / 9, 1)      AS fett_wert
    30.0::NUMERIC                         AS fiber_wert

**Drei feste Zahlen. Keine liest die Phase.**

`[cmd]` **Die Spec gibt fuenf verschiedene Proteinspannen je Phase**
(`PHASE_MODELS.md`):

| Phase | protein_g_per_kg |
|---|---|
| maintenance | 1.4 bis 2.0 |
| lean_bulk | 1.6 bis 2.2 |
| fat_loss moderate | 1.8 bis 2.4 |
| recomp | 2.0 bis 2.4 |
| fat_loss aggressive, contest_prep | 2.3 bis 3.1 |

`[read]` **2.0 liegt in drei dieser fuenf Spannen und unter zwei.**
Wer in der Wettkampfvorbereitung steht, bekommt bis zu 1.1 g/kg zu
wenig — bei 90 kg sind das 99 g Protein und rund 400 kcal, die
woanders landen.

`[cmd]` **Fett ist doppelt falsch.** Die Spec nennt zwei verschiedene
Groessen, nie eine feste: `fat_min_g_per_kg: 0.5` bei FAT_LOSS (eine
UNTERGRENZE, kein Ziel) und `fat_pct_calories: 25 bis 35` bei
LEAN_BULK (eine Spanne). Fuer die anderen sieben Phasen sagt die Spec
nichts. Live steht 25 Prozent fuer alle.

`[read]` **Faser ist die einzige, die stehenbleiben darf.** 30 g ist
kein Phasenparameter, sondern eine allgemeine Empfehlung. Die Spec
nennt sie nicht — also gehoert sie belegt oder als Annahme markiert,
nicht korrigiert.

## Warum das an G-511 haengt

`[read]` **G-511 hat die Kalorien an die Phase gebunden und die
Makros liegengelassen.** Damit steht ein halbes Modell in der
Funktion: die Kalorien kommen aus der Phase, das Protein aus dem
Koerpergewicht. **Wer die Kalorien aendert, ohne das Protein
mitzuziehen, verschiebt nur die Kohlenhydrate** — die Rechnung fuellt
den Rest auf.

`[cmd]` **Der Beleg steht in derselben Funktion:**

    ELSE ROUND(GREATEST(m.kcal_wert
      - (m.protein_wert * 4 + m.fett_wert * 9), 0) / 4, 1)

Kohlenhydrate sind der Rest. Jeder Fehler in Protein und Fett landet
dort.

## Nachweiszeilen

**A1** — die fuenf Spannen aus `PHASE_MODELS.md` als Daten, nicht als
`CASE` im Funktionskoerper. Sie gehoeren dorthin, wo auch die
Kaloriendelta liegen.

**A2** — **je Phase eine Wahl innerhalb der Spanne, wie bei N13.**
Eine Spanne ist kein Wert. Ohne Wahl gilt dasselbe wie dort:
`phasenparameter_fehlt`, nicht heimlich die Mitte.

**A3** — Fett: die Untergrenze bei FAT_LOSS als Untergrenze bauen,
die Spanne bei LEAN_BULK als Spanne. **Fuer die sieben Phasen ohne
Angabe ist zuerst zu klaeren, was gilt** — das ist eine Frage an die
Recherche G-521, keine Annahme in SQL.

**A4** — Faser: 30 g bleibt, aber mit Beleg oder als `[annahme]`
gekennzeichnet. Eine Zahl ohne Quelle in einer Rechnung ist ein
Befund, kein Parameter.

**A5** — ein Test je Phase, der die Grenze von beiden Seiten trifft:
mit einer Phase am unteren Rand der Spanne gruen, mit einem Wert
darunter rot.

**A6** — nichts live, bis G-511 entsperrt ist. Wegwerf-Datenbank.

## Nachtrag aus G-521, 2026-09-28

`[cmd]` **Die Bezugsgroesse ist falsch, nicht nur die Zahl.**
Helms et al. 2014 nennt 2.3 bis 3.1 g **je kg fettfreier Masse**,
nicht je kg Koerpergewicht. Die lebende Funktion rechnet
`body_weight_kg * 2`.

`[cmd]` **Und es ist ein Einzeiler.**
`goals.body_measurements.lean_mass_kg` existiert als generierte
Spalte — `weight_kg * (1 - body_fat_pct/100)` — und **alle 362
Messungen tragen `body_fat_pct`.** Es fehlt keine Daten, nur der
Bezug.

### E2 — das Proteinband wird nach Trainingsstatus geteilt

`[cmd]` **Tom, 2026-09-28:** ja.

`[read]` **Der Grund ist ein Befund am Recherchebericht.** Dessen
Abschlusstabelle traegt 2.3 bis 3.1 in eine allgemeine
Fettabbauphase — aber Helms et al. 2014 ist eine Arbeit ueber
WETTKAMPFVORBEREITUNG. **Vierzig Prozent unserer Nutzer sind keine
Bodybuilder.** Iraki 2019 (Off-Season) nennt 1.6 bis 2.2, unsere
Vorlage hatte 1.8 bis 2.4.

**A7 (neu)** — das Band haengt am Trainingsstatus, nicht an der
Phasenart allein. Ein Abnehmwilliger bekommt nicht das Band eines
Wettkampfathleten. **Messen, ob `experience_level` ueberhaupt
gefuellt ist**, bevor daran eine Rechnung haengt.

**A8 (neu)** — die Rangfolge aus G-521 F7, als Waechter:

    Max_Defizit = TDEE - (Protein_kcal + Fett_min_kcal)

Protein zuerst, dann Fett, Kohlenhydrate sind der Rest. **Bleibt
nichts uebrig, wird die RATE gesenkt** — nicht das Protein und
nicht die Fettuntergrenze. Das ist die Antwort auf Befund B, und
sie ersetzt das stille `GREATEST(..., 0)`.

**A9 (neu)** — Fett bleibt **0.5 g/kg als harte Untergrenze**,
eine Zahl. Der Recherchebericht schreibt in seiner Tabelle
,,0.5 bis 1.5" in die Spalte Minimum — das ist Irakis
Aufnahmeempfehlung, nicht eine Untergrenze mit Spanne. **Ein
Minimum ist keine Spanne.**

## Pruefung der Struktur — Orchestrator, 2026-09-28

`[cmd]` **Nachgemessen, nicht gelesen.** Die Struktur liegt in
`supabase/migrations/20260928095000_g526_macro_rule_structure.sql`
und ist als Schritt 278 in `kette.json` eingetragen.

**Was traegt:**

- `nutrition_macro_rules_open_has_no_values` — eine offene Regel
  darf technisch keine Zahl haben. **Damit steht die
  Belegdisziplin als CHECK in der Datenbank**, nicht als Vorsatz.
- `nutrition_macro_rules_source_complete` — `sourced` verlangt
  Quelle UND Fundstelle, beide nicht leer. Das ist G-521 A1
  maschinell.
- `nutrition_macro_rules_value_shape` — je Regelart die richtige
  Form: Spanne braucht beide Grenzen mit `lower <= upper`, harte
  Untergrenze genau eine, Festwert `upper = lower`.
- `nutrition_macro_rules_basis_unit` — verhindert die Kreuzung
  `lean_mass_kg` mit `percent_kcal`.
- Die neun Phasen bleiben getrennt (E1 gehalten), RLS an, Rechte
  erst entzogen, dann gezielt erteilt.

`[cmd]` **Die Kennungsregel ist gueltig.** `^[a-z0-9]+(?:-[a-z0-9]+)*$`
gegen sechs Faelle geprueft: drei wahr, drei falsch. **Mein erster
Test meldete falsch**, weil PowerShell das `$` verstuemmelte — die
Probe lief danach ueber eine Datei. Derselbe Fehler wie beim
Encoding: die Konsole entscheidet nichts.

`[cmd]` **Nichts ist live.** `goals.nutrition_macro_rules` hat null
Treffer in `information_schema`. Die Sicherung liegt mit den
genannten 473.968.376 Byte.

### Drei Befunde aus der Pruefung

**A10 (neu)** — `[read]` **Die Struktur hat keinen Verbraucher.**
Die Tabelle ist leer, und `berechne_zielwerte` rechnet weiter
`body_weight_kg * 2`. **Am Tag, an dem die erste Zeile eingetragen
wird, gibt es zwei Orte fuer dieselbe Wahrheit** — die Tabelle und
die feste Zahl —, und nichts entscheidet, welcher gilt. **Das
Fuellen und das Lesen gehoeren in EINE Aenderung.**

**A11 (neu)** — `[cmd]` **Kein `updated_at`-Anstoss.** Die Spalte
hat `DEFAULT now()` und keinen Trigger, obwohl
`goals.touch_updated_at` existiert und anderswo benutzt wird.
`updated_at` bleibt still auf dem Einfuegezeitpunkt stehen.

**A12 (neu)** — `[cmd]` **Die Abhaengigkeit ist duenner als der
Inhalt.** Schritt 278 traegt `depends_on: ["111"]`, die Datei
kommentiert aber `goals.berechne_zielwerte`, das in Schritt 117
entsteht. Heute laeuft die Kette in Feldreihenfolge, 278 nach 117 —
**es haelt durch die Position, nicht durch die Erklaerung.**
