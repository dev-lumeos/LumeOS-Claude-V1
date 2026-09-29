---
nr: G-536
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
agent: codex
beauftragt: 2026-09-29

braucht: [G-533]
kind_von: null
entscheidung: E-1

quellen:
  - docs/specs/Goals/PHASE_MODELS.md
  - docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql
    - referenz/lumeos-2026/src/modules/goals/lib/definitions.ts
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx

zahlen:
  gemessen: 2026-09-29
  strategien_im_altrepo: 17
  strategien_live: 0
  elemente_ohne_quelle: 9
---

# Der Strategiekatalog fehlt ganz — Schicht 2

**Tom, 2026-09-29, 11:47:** *„die massgeblichen goals gingen vergessen,
die schicht 2 vom alten repo."*

`[cmd]` Und es ist zaehlbar. G-534 meldet neun Elemente der Oberflaeche
**ohne Quelle**: Sub-phases, Guards, Exit conditions, Success metrics,
Jahreszyklus, Best for, Purpose, die Variantenkachel, Hoechstdauer und
Protein. Das sind nicht neun fehlende Quellen. Das ist **eine fehlende
Tabelle**, deren Felder neunmal gebraucht werden.

## Die Quellen, und sie ergaenzen sich

`[read]` **1. `referenz/lumeos-2026/src/modules/goals/lib/definitions.ts`**
— 17 Eintraege, Interface `GoalDefinition`:

| Feld | Beispiel |
|---|---|
| `type` · `label` · `description` · `icon` | — |
| `category` | fat_loss, muscle_gain, hybrid, contest_prep, recovery, expert |
| `tier` | simple (4) · advanced (13) |
| `tdee_modifier` | `-0.25` — ein Faktor |
| `weight_change_target_percent` | `-1.0` — %/Woche |
| `max_duration_weeks` | `8` |
| `macro_cycling` · `refeed_schedule` · `auto_adjust` · `peak_week` | Schalter |
| `badge` · `warnings[]` | — |
| `requirements` | min_experience, min_body_fat, max_body_fat, coach_approval |
| `protein_per_kg` · `fat_percent` | `2.5` · `0.20` |

Die 17: `lose, maintain, gain, profile` (simple) · `aggressive_cut,
moderate_cut, conservative_cut, mini_cut, lean_bulk, clean_bulk,
aggressive_bulk, body_recomp, reverse_diet, contest_prep, peak_week,
maintenance_diet_break, custom` (advanced).

`[read]` **2. `module-goals-pro.jsx:5-69`, `GOAL_PHASES`** — dieselben
Phasen, aber mit genau den Feldern, die `definitions.ts` **nicht** hat:
`guards[]`, `next[]`, `exits[]`, `success[]`, `bestFor[]`, `purpose[]`,
`subPhases[]`, `refeeds`, `peakWeek`, `annual[]`.

`[read]` **3. `docs/specs/Goals/PHASE_MODELS.md`** — dieselben Zahlen in
JSON, plus die Uebergangstabelle und den Wochenanpassungsalgorithmus.
Nach `00-umsetzungsplan.md` ist die Spec die **schwaechste** der drei
Quellen (KI-erzeugt, byte-identisch zu `BrainstormDocs/`), aber sie
bestaetigt die Baender: `fat_loss.moderate.calorie_deficit
{-400,-600}`, `rate_of_loss "0.5–0.75% BW/week"`, `max_duration_weeks 20`.

`[read]` **Damit fallen die vier Zahlen ohne Seitenbeleg aus G-521 A1.**
Sie standen die ganze Zeit in drei Quellen.

Beide ersten Quellen lesen, **keine Zahl erfinden**. Wo sie sich
widersprechen, ist das ein Befund fuer den Bericht, keine stille Wahl —
und `definitions.ts` gilt, weil es lief.

## Der Auftrag

### A1 — die Tabelle

`goals.goal_strategies`, Katalog: lesbar fuer angemeldete Nutzer,
pflegbar durch `service_role`. Struktur nach `migrations/`, die 17 Zeilen
als Kettenschritt nach `_pipeline/11_goals/` — die Datenlogikgrenze gilt.

CHECKs, die den Inhalt ernst nehmen:

- `category` und `tier` ueber ihre Wertelisten
- `tdee_modifier` zwischen `-0.40` und `+0.25`
- `protein_per_kg` zwischen `1.2` und `3.5`, `fat_percent` `0.15`–`0.40`
- `max_duration_weeks` NULL oder `>= 1`
- `requirements` als jsonb-**Objekt**, nicht als Text
- `weight_change_target_percent` NULL oder `-2.5`–`1.5` — dieselbe
  Aussengrenze wie `goal_phases.zielrate_pct_kg_woche`

Die Listenfelder (`guards`, `next`, `exits`, `success`, `bestFor`,
`purpose`) als `text[]`. `subPhases` und `annual` als jsonb, weil sie
Datensaetze sind, keine Zeichenketten.

### A2 — `goal_phases` liest den Katalog

Neue Spalte `strategie_code text REFERENCES goals.goal_strategies(code)`.

Und dann die Einordnung, die daran haengt:

| Spalte | Befund |
|---|---|
| `phase_type` | bleibt vorerst — die Oberflaeche liest ihn |
| `variant` | **wird ueberfluessig**: `moderate` ist kein Zusatz zu `fat_loss`, `moderate_cut` IST ein eigener Katalogeintrag |
| `parameters` | **bleibt** — siehe Nachtrag unten |

Nichts loeschen in diesem Auftrag. Melden, mit Zahl: wie viele Zeilen
tragen heute `variant`, wie viele `parameters`, und welche Schluessel.

### A3 — `berechne_zielwerte` nimmt die Werte vom Katalog

Heute raet sie beziehungsweise liest aus `parameters`. Nachher kommen
`tdee_modifier`, `protein_per_kg`, `fat_percent` aus `goal_strategies`
ueber `strategie_code`.

Die Rate: `weight_change_target_percent` am Katalog ist die **Vorgabe**,
`goal_phases.zielrate_pct_kg_woche` die **Ueberschreibung**. Ist sie
NULL, gilt der Katalog. Das Altrepo hat dafuer den Typ `custom`.

`[read]` **Das loest E-1 auf.** Das Altrepo speichert beides — den Faktor
und die Rate — aber an der **Definition**, nicht am Nutzerdatensatz. Wir
haben die Rate an die Instanz gehaengt und dann gefragt, woher die
Baender kommen. Sie kommen vom Katalogeintrag.

### A4 — was damit zufaellt, und das ist der Nachweis

Nach A1 bis A3 hat jedes dieser Elemente eine Quelle. Liste im Bericht,
je Element die Spalte: Sub-phases · Guards · Exit conditions · Success
metrics · Jahreszyklus · Best for · Purpose (G-534, „keine Quelle") ·
die Variantenkachel (G-534, „ohne jede Zahl") · Hoechstdauer · Protein
(G-534, Strich mit Grund) · `mini_cut` vollstaendig (G-528) · die vier
Zahlen ohne Seitenbeleg (G-521 A1).

### A5 — `phase_rate_rules` wird nicht gefuellt

Sie ist eine Nebentabelle zu `goal_phases` fuer Werte, die an den Katalog
gehoeren. Nach A3 ist sie redundant. Melden, nicht loeschen — der
Orchestrator legt Tom vor, ob sie fallen soll.

## Nachtrag, 2026-09-29 12:00 — `parameters` bleibt

`[read]` **`module-goals-editor.jsx:56` sagt woertlich:** *„Personal
override — the shipped defaults stay intact"*, und der Fuss des Dialogs
hat zwei Knoepfe: *„Save as my template"* und *„Apply to my plan"*.

`goal_phases.parameters` ist **nicht** der Ersatz fuer den fehlenden
Katalog, sondern die **persoenliche Abweichung davon**. Das sind zwei
Ebenen, nicht eine. Der Katalog ist ausgeliefert und fuer alle gleich;
der Override gehoert einem Nutzer.

Damit aendert sich A2: `variant` wird als ueberfluessig gemeldet,
`parameters` wird als **Override-Ebene benannt**, nicht als Altlast.

## Nachtrag — `PE_MODES` gehoert an den Katalogeintrag

`[read]` `module-goals-editor.jsx:3-11` sagt je Phase, **welche Reiter
der Editor zeigt**:

```
fat_loss          variants · guards · duration
lean_bulk         params · guards · duration
maintenance       params
recomp            params · cycling
contest_prep      subphases · refeeds · peakweek · guards · anchor
reverse_diet      params · exits · guards
expert_bb_annual  annual · anchor · overrides
```

Das ist eine Eigenschaft der Strategie, keine Fallunterscheidung im
Browser. Als `text[]` an den Katalogeintrag, damit der Editor (G-539)
nicht sieben `if` braucht.

## Zu belegen

- 17 Zeilen, je Zeile alle Pflichtfelder, objektweise vorher/nachher
- je CHECK eine Gegenprobe von **beiden** Seiten: ein Wert ausserhalb
  muss fallen, der Randwert muss durchgehen
- ein Widerspruch zwischen den zwei Quellen: gemeldet, nicht gewaehlt
- `berechne_zielwerte` vorher/nachher fuer `test-user@lumeos.local`:
  dieselbe Zahl, solange derselbe Wert gilt — und eine **andere**, wenn
  der Katalog einen anderen `tdee_modifier` traegt als das JSON-Feld.
  Beides zeigen, sonst misst die Probe nicht, dass der Katalog gilt.
- die Zahlen zu `variant` und `parameters`
- `pnpm gate` gruen · Wegwerf-DB verworfen mit Zahl · kein `db push`
- **live einspielen** — ohne das liest die Oberflaeche nichts

Nichts committen.

---

## Abnahme, Orchestrator, 2026-09-29 14:40

**Angenommen, mit einem benannten Rest.** Selbst gemessen gegen die
laufende Datenbank, nicht aus dem Bericht uebernommen:

    strategien                        17
    phasen mit strategie_code       5 / 5
    zeilen mit editor_modes        17 / 17
    tier (DISTINCT)                    2
    category (DISTINCT)                6
    phase_rate_rules                   0
    expert_bb_annual.protein_per_kg  NULL

`[cmd]` **Die Aufteilung stimmt mit der Quelle:** 3 simple, 14 advanced.
Und `expert_bb_annual` traegt keinen Proteinwert, weil es aus Spec und
Mockup kommt, wo keiner steht. **Eine NULL mit Grund ist besser als eine
uebernommene Zahl** — das ist konsequent und war nicht beauftragt.

### Codex hat einem falschen Auftrag widersprochen, und er hatte recht

`[cmd]` **Der Auftrag nannte 17 Definitionen im Vorgaenger, darunter
`profile`. Es sind 16, und `profile` ist keine Strategie.**
`GOAL_DEFINITIONS` endet in `definitions.ts:263` mit `custom`; das
`profile:` in Zeile 287 ist der **Parameter** von `isGoalAvailable`:

```ts
profile: { experience?: string; bodyFat?: number; hasCoach?: boolean }
```

Eine TypeScript-Signatur, kein Katalogeintrag. Der Orchestrator hat ein
Muster auf Einrueckungsebene 2 laufen lassen und den Funktionsparameter
mitgezaehlt — **dieselbe Fehlerart wie `alias.spalte` heute Morgen, und
wieder ohne Gegenprobe.** Codex hat nicht abgeschrieben, sondern
nachgezaehlt und gemeldet.

### Der Rest, und er ist benannt

`[cmd]` **A3 ist zur Haelfte umgesetzt.** `tdee_modifier`,
`protein_per_kg` und `fat_percent` kommen aus dem Katalog — belegt durch
Codex' Gegenprobe (persoenlicher Faktor 0,20 gibt 2625,4 kcal gegen 2187,8
aus dem Katalog, und der Katalogwert bleibt unveraendert).

**Aber die Rechnung nimmt weiterhin den Faktor, nicht die Rate.** Damit
ist E1 (*„die Parameter haengen an der Rate, nicht an der Art"*) noch
nicht umgesetzt. Die Umstellung braucht die Einheit von
`weight_change_target_percent`, und die legt der Vorgaenger nirgends fest
— **das ist G-542**, vorlaeufig auf %/Woche gesetzt, Tobias klaert es am
30.09.

**A5 erledigt:** `phase_rate_rules` bleibt bei 0, weder gefuellt noch
geloescht, wie beauftragt. Sie ist nach A3 redundant und liegt Tom vor.

### Was damit eine Quelle hat

Die zehn Elemente aus G-534 („keine Quelle", „ohne jede Zahl", „Strich
mit Grund") tragen jetzt eine Spalte. Der Bau der Anzeige ist **G-541**.
