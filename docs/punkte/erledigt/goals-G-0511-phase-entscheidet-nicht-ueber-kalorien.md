---
nr: G-511
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-26
erledigt: 2026-09-28
commit: c572fbab
braucht: []
kind_von: G-510
entscheidung: E-91
agent: codex
beauftragt: 2026-09-27
status: gesperrt_bis_entscheidung
beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.nutrition_targets
    - public.profiles
  dateien:
    - supabase/_pipeline/11_goals/110_goals_zielwerte.sql
    - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql
    - apps/web/src/lib/profile/zielwerte-read.ts
    - apps/web/src/lib/profile/zielwerte-write.ts
zahlen:
  gemessen: 2026-09-27
  zielzeilen_live: 5
  phasen_live: 5
  aktive_phasen_live: 3
  profile_ohne_aktive_phase: 4
  phasenlose_profile_mit_zielzeile: 2
  varianten_ungeprueft_live: 5
---

# G-511 - die Phase entscheidet nicht ueber die Kalorien

## Sperre

**G-511 ist nicht einspielbar.** Die erste Fassung band Zielzeilen richtig
an eine Phase, las aber die tragende Phasenspec nicht vollstaendig. Sie
haette eine Phase technisch erzwungen, obwohl `fat_loss` kein Ziel liefert,
`maintenance` ungefragt die Mitte einer Spanne nimmt und der lebende
Schreibweg die neuen Hindernisse verschluckt.

Kein G-511-SQL wurde live eingespielt. Migration und Datennachzug bleiben
gesperrt, bis N12 bis N15 entschieden beziehungsweise nachgezogen sind.

## Bestehende Entscheidung

- Die aktive Phase ist die Quelle von Kalorien und Makros.
- `profiles.nutrition_goal` ist eine Haltung, kein zeitlicher Plan.
- Ohne aktive Phase gilt `keine_aktive_phase`, kein Rueckfall.
- Eine Zielzeile gehoert ihrer Phase und endet mit ihr.
- Historische Zielzeilen werden keiner Phase geraten zugeordnet.

## Vier Quellen

**Code:** Der CHECK in `111_goals_ziele_phasen.sql` erlaubt neun
`phase_type`-Werte. `variant` ist nullable und ungeprueft. Der lokale
G-511-Entwurf rechnet nur `maintenance` und `lean_bulk`; Protein ist
pauschal Gewicht mal 2, Fett pauschal 25 Prozent.

**Daten:** Live stehen fuenf Phasenzeilen: zweimal `maintenance/baseline`,
einmal `maintenance/performance_placeholder` und zweimal
`lean_bulk/moderate`. Alle fuenf Varianten passieren ohne CHECK. Die zwei
Lean-Bulk-Zeilen tragen noch `calorie_surplus_kcal`.

**Spec und Mockup:** `docs/specs/Goals/PHASE_MODELS.md` wurde vollstaendig
gelesen. Es beschreibt sieben Phasenbloecke, Varianten nur fuer
`fat_loss`, phasenabhaengige Proteinspannen sowie Zeitregeln fuer
`reverse_diet` und `contest_prep`. Die drei Goals-Mockups zeigen dieselben
Spannen, Unterphasen und die Woche innerhalb der Phase. Der Editor zeigt
konkrete persoenliche Overrides; eine Spanne ist nicht automatisch eine
Zahl.

**Vorgaengerrepo:** `research/goals/data/goal-phase-models.md` traegt
dieselben Spannen und Unterphasen. Die spaetere API reduzierte sie auf
Pauschalprozente. Das belegt den frueheren Bruch, nicht neue Defaults.

## N11 - sieben Specbloecke, neun DB-Werte

| DB-Wert | Parametersatz der Spec |
|---|---|
| `fat_loss` | eigener Block, `moderate` und `aggressive` |
| `lean_bulk` | eigener Block |
| `maintenance` | eigener Block |
| `recomp` | eigener Block |
| `contest_prep` | eigener Block mit zeitlichen Unterphasen |
| `reverse_diet` | eigener Block |
| `expert_bb_annual` | eigener Block, delegiert im Jahresplan |
| `mini_cut` | **kein Parametersatz**; nur Uebergangsziel/Knoten `(opt.)` |
| `peak_week` | kein eigener Phasenblock, aber Parametersatz in `contest_prep` |

**DB nach Spec:** `mini_cut` hat keinen Specblock. `peak_week` ist zwar
beschrieben, aber nur als Contest-Prep-Unterphase; daraus folgt keine
autonome Kalorienregel fuer den gleichnamigen DB-Wert.

**Spec-Zustandsmaschine nach DB:** `ONBOARDING` ist Anfangszustand der
Zustandsmaschine, fehlt aber im CHECK. `NEW PHASE` ist eine Auswahlaktion,
kein Phasentyp. `SHOW` steht nur in `PEAK_WEEK+SHOW` des Jahresplans.

Die Differenz ist real: sieben nummerierte Modelle, zwei weitere DB-Werte
und ein nicht persistierter Anfangszustand sind verschiedene Mengen.

## N12 - `variant` ist Fachlogik

Nur `fat_loss` hat in der aktuellen Spec benannte Varianten:

    moderate    -400 bis -600 kcal, Protein 1,8 bis 2,4 g/kg
    aggressive  -750 bis -1000 kcal, Protein 2,3 bis 3,1 g/kg

`contest_prep.early/mid/late/peak_week` sind Zeitabschnitte,
Trainingstag/Ruhetag bei `recomp` ist ein Tageszustand und die Monate des
Jahresplans sind keine Varianten.

Vorgeschlagener CHECK, nicht gebaut:

```sql
CHECK (
  (phase_type = 'fat_loss' AND variant IN ('moderate', 'aggressive'))
  OR (phase_type <> 'fat_loss' AND variant IS NULL)
)
```

Dazu gehoeren kein globaler Default und eine Auswahlliste statt Freitext.
Alle fuenf Live-Zeilen verletzten den CHECK. Ihre Varianten sind fuer ihre
Phase nicht durch die Spec definiert; eine Normalisierung auf `NULL`
braucht Toms Zusage.

## N13 - eine Spanne ist keine Rechenzahl

Der Entwurf waehlt bei `maintenance` still die Mitte von `TDEE +/- 100`,
naemlich TDEE. Das ist ebenso unbeschlossen wie 200, 300 oder 400 kcal bei
Lean Bulk. Auch Fat Loss liefert nur Spannen. Bei den negativen Defiziten
sind `min` und `max` numerisch sogar vertauscht; sie sind als zwei
Intervallenden zu validieren.

**Frage an Tom:** Untergrenze, Obergrenze, Mitte oder Nutzerwahl innerhalb
der Spanne?

**Empfehlung:** Nutzer beziehungsweise Coach waehlt beim Phasenstart einen
exakten, validierten Wert innerhalb der Spec-Spanne. Der skalare Wert wird
im Phasenprotokoll gespeichert. Ohne Wahl gilt `phasenparameter_fehlt`,
nicht ein automatischer Mittelpunkt. Die Spec bleibt die erlaubte
Bandbreite, das Protokoll traegt die geltende Zahl.

## N14 - Zeit und phasenabhaengige Makros

`berechne_zielwerte` braucht mehr als `phase_type`:

1. **Reverse Diet:** Zielwert am Phasenstart, exakt gewaehlter
   `weekly_calorie_increase`, vollendete Woche aus `gueltig_ab` und ein
   festes Endziel/TDEE-Snapshot. Sonst ist `+50..150 pro Woche` nicht
   ausrechenbar; ein beweglicher TDEE darf Historie nicht umschreiben.
2. **Contest Prep:** verpflichtendes Buehnen-/Enddatum. Daraus folgt
   `weeks_out` und damit `early`, `mid`, `late` oder `peak_week`; die
   Grenztage muessen eindeutig sein. Zudem muss `peak_week` entweder
   Unterphase oder eigener `phase_type` sein, nicht beides.
3. **Recomp:** benoetigt den Tageszustand Training/Ruhe, sonst sind
   `TDEE +200` und `TDEE -300` nicht auswaehlbar.
4. **Expert BB Annual:** orchestriert andere Phasen und hat selbst keinen
   Kalorienparametersatz.
5. **Mini Cut:** bleibt ohne Specblock unrechenbar.

Auch die Makros des Entwurfs brechen die Spec:

    gebaut                         Spec
    Protein immer 2,0 g/kg         1,4-2,0 maintenance
                                   1,6-2,2 lean_bulk
                                   1,8-2,4 fat_loss moderate
                                   2,3-3,1 aggressive/contest
                                   2,0-2,4 recomp
    Fett immer 25 %                nur lean_bulk nennt 25-35 %;
                                   fat_loss mindestens 0,5 g/kg

Empfehlung: Die Phase speichert den exakt gewaehlten Kaloriendelta- und
`protein_g_per_kg`-Wert sowie ihre belegte Fettregel. Protein folgt dem
Phasenfaktor, Fett nur einer belegten Regel, Kohlenhydrate sind danach der
Rest. Reverse Diet haelt Protein und erhoeht primaer Kohlenhydrate. Wo eine
Regel fehlt, wird die Luecke gemeldet statt 2,0/25 Prozent fortgeschrieben.

## N15 - der lebende Schreibweg

Gemessen auf einer Wegwerf-Datenbank mit dem lokalen Entwurf:

| Fall | DB-Funktion | App-Schreiber |
|---|---|---|
| keine aktive Phase | `kcal = NULL`, `keine_aktive_phase` | HTTP 400 `INVALID_INPUT`: „Die Formel lieferte keine Zielkalorien.“ |
| `fat_loss/moderate`, `calorie_deficit = -500` | `kcal = NULL`, `phasenparameter_fehlt` | dieselbe generische HTTP-400-Meldung |
| direkter Insert mit kcal ohne Phase | SQLSTATE 23514, „keine aktive Phase“ | nicht der normale Ablauf dieses Schreibers |

Ursache: `zielwerte-read.ts` kennt nur die alten Hindernisse und wandelt
beide neuen Werte in `null` um. `zielwerte-write.ts` sieht nur
`kcal === null`, wirft vor dem Upsert den generischen Fehler und erreicht
den Trigger nicht. Ein erreichter DB-Fehler wuerde als `WRITE_FAILED` zu
HTTP 500.

**An Claude Code gemeldet:** Der Schreiber ist das groessere Risiko als
die fuenf bisherigen Leser. Typunion, Meldungen und Schreibverhalten fuer
beide Hindernisse muessen vor Einspielung nachgezogen werden. `apps/` blieb
unveraendert.

## Namensentscheidung

Kanonisch sind `calorie_surplus` und `calorie_deficit`:

- PHASE_MODELS und API verwenden diese snake_case-Namen.
- `zielphasen-parameter.json` verwendet sie bereits.
- Das Altrepo bestaetigt die Semantik als camelCase.
- `_kcal` nur an einem Gegenstueck waere inkonsistent; Einheit und
  Zeitbasis gehoeren in den Parametervertrag.

Seed, G-511-Test und Funktionsentwurf lesen jetzt nur
`calorie_surplus`. Der neue idempotente Pipeline-Datenschritt benennt
bestehende `calorie_surplus_kcal`-Werte atomar um, entfernt den alten Namen
und bricht bei widerspruechlichen Doppelwerten ab. Belegt: `1 alt / 0 neu`
wurde `0 alt / 1 neu`, Wert 250 blieb 250; die Widerspruchsprobe brach ab
und liess beide Rohwerte unangetastet. Live bleiben die zwei alten Zeilen
unveraendert, weil G-511 nicht eingespielt wurde.

## N1 bis N10 und offene Freigaben

N1 sowie N3 bis N9 sind im Entwurf strukturell angelegt. N2 und N5 bleiben
offen, bis Parameterwahl und Zeitdimension entschieden sind. N10 ist um
den Schreibweg erweitert.

Vor einer Einspielung:

1. Tom entscheidet N13.
2. Tom bestaetigt N12 und die Normalisierung der fuenf Varianten.
3. Die sechs nicht trivial rechenbaren Phasenzustaende erhalten komplette
   Vertraege oder ausdrueckliche Hindernisse.
4. Claude Code zieht Leser und Schreiber nach.
5. Danach werden Migration, 17 Leser, Vollkette und Gegenproben neu
   abgenommen.

## Sicherung und Nachweis

Sicherung vor dem Erstentwurf:
`backup/schema/20260927103356_g511_vor_bau.dump`, 473.965.860 Byte,
SHA-256
`C0C950A3E23941B85CBDF3E2D198D735FA6ED98B26E558D4CA32F50543F93AE8`.

Die fruehere Vollkette und vier Tests waren nur fuer den unvollstaendigen
Vertrag gruen. Nach der Namenskorrektur sind die vier fokussierten Tests
erneut gruen; das ist keine Freigabe fuer N11 bis N15.

## Abnahme

_(gesperrt; nicht einspielen)_
