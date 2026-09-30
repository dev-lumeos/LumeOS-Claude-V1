---
nr: G-542
typ: entscheidung
modul: goals
schwere: hoch
angelegt: 2026-09-29

braucht: []
kind_von: G-536
entscheidung: E-83

quellen:
  - referenz/lumeos-2026/src/modules/goals/lib/definitions.ts
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_strategies
    - goals.goal_phases
  dateien:
    - referenz/lumeos-2026/src/modules/goals/lib/definitions.ts
    - docs/specs/Goals/PHASE_MODELS.md

zahlen:
  gemessen: 2026-09-29
  einheit_im_vorgaengercode: 0
  fundstellen_pro_woche: 4
  fundstellen_pro_monat: 1
---

# Die Zielrate — Einheit geklaert, eine Frage bleibt

**Tom, 2026-09-29, 14:47:** *„nimm was wissenschaftlich bewiesenes und
brauchbares als loesung, dass wir weiterarbeiten koennen."*

`[read]` **Dieser Punkt war bis 16:30 gebuendelt.** Der
Sammelfragen-Waechter hat es gefunden und auf G-254 verwiesen, wo am
2026-08-29 eine Antwort auf mehreres geschrieben wurde. **Aufgeteilt:**
Hoechstdauer → **G-548**, Protein in der Ladewoche → **G-549**, die
Bezugsgroesse von `protein_per_kg` → zurueckgezogen, weil niemand seine
Magermasse kennt (G-543, Ruecknahme).

**Hier bleibt allein die Zielrate.**

---

## Geklaert: die Zielrate ist Prozent pro Woche

`[cmd]` **Der Vorgaengercode legt die Einheit nirgends fest.** Das Interface
sagt `weight_change_target_percent?: number` — ohne Kommentar, ohne Suffix.

`[cmd]` **Die Spec verwendet zwei Einheiten fuer dasselbe Feld:**
`PHASE_MODELS.md` schreibt bei `fat_loss` *„0.5–0.75% BW/week"*, bei
`lean_bulk` *„0.25–0.5% BW/month"*.

`[cmd]` **Vier Fundstellen gegen eine:**

    Encyclopedia 1.4    "Lean Bulk: Target gain 0.25-0.5% bodyweight/week"
    Encyclopedia 3.1    "Phase 1: Rate of loss 0.5-0.8% bodyweight/week"
    Formelsammlung      "Lean Bulk: +0.25-0.5% Koerpergewicht/Woche"
    Contest-Framework   "Phase 1: 0.5-0.8% Koerpergewicht/Woche"

Dazu die Primaerquellen: **Iraki et al. 2019** (0,25–0,5 %/Woche Aufbau),
**Helms et al. 2014** (0,5–1,0 %/Woche Abbau), **Garthe et al. 2011**
(0,7 gegen 1,4 %/Woche).

`[read]` **Die Zahlen im Vorgaenger sind die Randwerte dieser Literatur:**
`lean_bulk` traegt genau 0,25, `moderate_cut` genau 0,75. **Als Wochenwerte.**
Keine Empfehlungsliteratur rechnet in Prozent pro Monat — `PHASE_MODELS.md:68`
ist der Einzelfall und damit der Fehler.

**Folge in Kilokalorien** bei 83,74 kg, nach `kcal/Tag = 11 × Rate × Gewicht`:

    %/Woche   +230 kcal/Tag   0,21 kg/Woche   0,9 kg/Monat
    %/Monat    +53 kcal/Tag   0,05 kg/Woche   0,21 kg/Monat

`[read]` **Als Monatswert waere die Groesse unbrauchbar:** 2,5 kg Zunahme im
Jahr fuer eine Strategie mit Makrozyklen und automatischer Anpassung.

**Gilt damit als entschieden.** G-543 stellt `berechne_zielwerte` darauf um.

---

## Was Tobias noch klaeren soll

**Rechnet ein fortgeschrittener Natural in Prozent pro Woche — oder in
Kilokalorien?**

`[read]` Die Frage steht hier, weil sie die Antwort oben **pruefbar** macht.
Wer in +200 bis +400 kcal denkt statt in Prozent, hat eine andere
Vorstellung vom Aufbau — und dann ist die Rate die falsche **Leitgroesse**,
nicht nur ihre Einheit.

Konkret: `lean_bulk` steht auf +0,25 %/Woche, das sind bei 83,74 kg
**+230 kcal/Tag**. Die Formelsammlung nennt fuer Fortgeschrittene +200,
fuer Profis +150 kcal. **Passt das zusammen, oder liegt unser Wert fuer
einen Fortgeschrittenen zu hoch?**

`[read]` **Die Folge fuer den Bau:** bleibt die Rate die Leitgroesse, gilt
G-543 wie geschrieben. Rechnet er in Kilokalorien, braucht der Katalog eine
zweite Angabe je Erfahrungsstufe — und `requirements.min_experience` waere
dann nicht nur eine Sperre, sondern ein Rechenparameter.

---

## Entschieden 2026-09-30 — E-83

**Tom, 17:43:** *„gerechnet wird immer in kcal, das kann man als mensch
zaehlen, prozente sind nur als grafik besser lesbar und in formel
einfacher rechenbar."*

**Und 17:45, auf den Einwand, kcal sei damit die Anzeigegroesse:** *„das
soll doch ein user entscheiden, manchmal ist es klarer mit prozenten zu
arbeiten und manchmal easier mit direkt kcal. fuer uns doch egal solange
wir wissen wie rechnen."*

`[read]` **Damit ist die Frage dieses Punktes beantwortet, aber anders
gestellt als sie hier stand.** Sie lautete: *welche Einheit fuehrt die
Zielrate?* **Die Antwort: beide, und der Nutzer waehlt.** Gespeichert wird
die Rate, weil eine Kilokalorienzahl am Gewicht haengt und beim naechsten
Wiegen falsch waere, ohne dass sich die Absicht geaendert hat.

`[cmd]` **Der Orchestrator hat dabei einmal zu weit geschlossen:** aus
,,gerechnet wird in kcal" wurde ,,kcal ist die Anzeigegroesse". **Tom hat
es zurueckgeholt** — es ist eine Nutzerwahl, keine Festlegung. Die
Vollstaendigkeit steht in `docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md`.

**Was hier herausfaellt und eigene Punkte bekommt:**

    G-565   der Umschalter in der Oberflaeche, vorbereitet in next/
    G-566   ob 0,25 %/Woche fuer Fortgeschrittene zu hoch ist -
            die Formelsammlung nennt +200 kcal, wir liegen bei +230
            fuer Tobias, und es betrifft den WERT, nicht die Einheit
