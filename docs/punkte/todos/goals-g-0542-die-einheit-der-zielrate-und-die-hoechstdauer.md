---
nr: G-542
typ: entscheidung
modul: goals
schwere: hoch
angelegt: 2026-09-29

braucht: []
kind_von: G-536

quellen:
  - referenz/lumeos-2026/src/modules/goals/lib/definitions.ts
  - docs/specs/Goals/PHASE_MODELS.md
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
  einheiten_in_der_spec: 2
  vorlaeufig_gesetzt: 2
---

# Die Einheit der Zielrate und die Hoechstdauer — vorlaeufig gesetzt

**Tom, 2026-09-29, 14:47:** *„nimm was wissenschaftlich bewiesenes und
brauchbares als loesung, dass wir weiterarbeiten koennen. mach da einen
vermerk fuer morgen, dann ist tobias hier und kann das definitiv
klaeren."*

**Fuer Tobias, 2026-09-30.** Zwei Zahlen sind vorlaeufig gesetzt, damit
gebaut werden kann. Beide sind einzeilig zu bestaetigen oder zu
korrigieren; die zweite Spalte sagt, was am Bau haengt.

## Frage 1 — ist `weight_change_target_percent` pro Woche oder pro Monat?

`[cmd]` **Der Vorgaengercode legt die Einheit nirgends fest.** Das
Interface sagt `weight_change_target_percent?: number`, ohne Kommentar,
ohne Suffix im Namen.

`[cmd]` **Die Spec verwendet zwei Einheiten fuer dasselbe Feld:**
`PHASE_MODELS.md` schreibt bei `fat_loss` *„rate_of_loss: 0.5–0.75%
BW/week"* und bei `lean_bulk` *„rate_of_gain: 0.25–0.5% BW/month"*.

### Vorlaeufig gesetzt: **Prozent pro Woche**

`[read]` **Die Zahlen selbst verraten die Einheit** — sie sind die
Literaturwerte, und die Literatur rechnet ausschliesslich in %/Woche:

| Quelle | Aussage |
|---|---|
| Iraki et al. 2019, *Sports* 7(7):154 — „Nutrition Recommendations for Bodybuilders in the Off-Season" | Zunahme **0,25–0,5 % Koerpergewicht pro Woche** fuer Fortgeschrittene |
| Garthe et al. 2011, *IJSNEM* 21(2) | 0,7 %/Woche gegen 1,4 %/Woche: die langsamere Gruppe gewann mehr Magermasse bei weniger Fett |
| Helms et al. 2014, *JISSN* 11:20 — „Evidence-based recommendations for natural bodybuilding contest preparation" | Abnahme **0,5–1,0 % Koerpergewicht pro Woche** zum Muskelerhalt |

`[cmd]` Der Vorgaenger traegt bei `lean_bulk` genau `0.25` und bei
`moderate_cut` genau `0.75`. Das sind die Randwerte von Iraki (Aufbau)
und Helms (Abbau) — **als Wochenwerte**. Es existiert keine
Empfehlungsliteratur, die diese Groesse in %/Monat angibt.

`[read]` **Und als Monatswert waere der Wert unbrauchbar:** 0,25 %/Monat
sind bei 83,74 kg 0,21 kg im Monat, also 2,5 kg im Jahr — fuer eine
Strategie, die Makrozyklen und automatische Anpassung mitbringt, ist das
keine Steuergroesse. Als Wochenwert sind es 0,9 kg/Monat, der uebliche
Lean Bulk.

**Folge in Kilokalorien**, nach `kcal/Tag = 11 × Rate × Gewicht` bei
83,74 kg:

    %/Woche   +230 kcal/Tag   0,21 kg/Woche   0,9 kg/Monat
    %/Monat    +53 kcal/Tag   0,05 kg/Woche   0,21 kg/Monat

**Was daran haengt:** die Rechnung nimmt heute `tdee_modifier` statt der
Rate. Die Umstellung auf die Rate — E1, *„die Parameter haengen an der
Rate, nicht an der Art"* — braucht diese Einheit. Solange sie offen ist,
bleibt der Faktor die wirksame Groesse und E1 ist nicht umgesetzt.

## Frage 2 — `moderate_cut`: 12 oder 20 Wochen Hoechstdauer?

`[cmd]` **Vorgaenger 12, Spec und Mockup 20.** Der Auftrag G-536 sagte
„der laufende Vorgaenger gewinnt", darum steht live die 12.

### Vorlaeufig gesetzt: **20 Wochen**, mit Diaetpause alle 8

| Quelle | Aussage |
|---|---|
| Helms et al. 2014, *JISSN* 11:20 | Wettkampfdiaeten **12 bis 24 Wochen**, abhaengig vom Ausgangs-Koerperfettanteil |
| Trexler et al. 2014, *JISSN* 11:7 | metabolische Anpassung waechst mit der Dauer; Diaetpausen mildern sie |
| Byrne et al. 2018, *Int J Obes* 42 (MATADOR) | intermittierende Diaet: mehr Fettverlust, geringere Anpassung als durchgehend |

`[read]` **Die Begruendung ist die Wirkung von `max_duration_weeks`:**
Sie ist ein harter Deckel — die Spec nennt als Waechter
*„duration > max_duration → force_transition"*. Bei 12 Wochen bricht die
Strategie eine normale Diaet mitten im Verlauf ab und erzwingt einen
Wechsel. Helms' Spanne beginnt bei 12 und geht bis 24; 20 liegt darin und
laesst eine vollstaendige Diaet auch bei hoeherem Ausgangs-Koerperfett zu.

**Die Sicherheit kommt nicht vom kurzen Deckel**, sondern von der
Diaetpause alle 8 Wochen und den Waechtern (Kraftverlust, Abnahmerate,
HRV) — die greifen ab Woche 1 und sind nach MATADOR das wirksamere
Mittel gegen die Anpassung.

`[read]` **Damit weicht dieser Punkt bewusst von „der Vorgaenger
gewinnt" ab.** Der Grund: `max_duration_weeks` ist im Vorgaenger
luekenhaft — von 17 Strategien tragen nur 8 einen Wert. Wo eine Quelle
loeckrig ist, traegt sie die Entscheidung nicht allein.

## Was Tobias entscheidet

    1  Zielrate in %/Woche - ja oder nein?
       Bei nein: in welcher Einheit, und woher?

    2  moderate_cut: 20 Wochen mit Pause alle 8, oder 12 hart?
       Nebenfrage, falls 20: bleibt die Pause bei 8/1?

    3  lean_bulk +0,25 %/Woche - ist das fuer einen fortgeschrittenen
       Natural die richtige Groesse, oder rechnet er in kcal?

Frage 3 steht hier, weil sie die Antwort auf 1 pruefbar macht: wer in
+200 bis +400 kcal denkt statt in Prozent, hat eine andere Vorstellung
vom Aufbau — und dann ist die Rate die falsche Leitgroesse, nicht nur
ihre Einheit.

## Bis dahin

`[cmd]` **Beide Werte sind gesetzt und im Katalog nachvollziehbar
markiert.** Es wird damit gebaut. Aendert Tobias eine Zahl, ist es eine
Zeile im Kettenschritt und kein Umbau — genau dafuer steht der Katalog
(G-536) und nicht ein Wert im Code.

**Nicht gesetzt, weil es keine Einheitenfrage ist:** `contest_prep`
rechnet pauschal −25 % TDEE und ignoriert die Unterphasen
(−300/−600/−750 kcal). Das ist ein Fehler, keine Entscheidung — er
gehoert zu G-530.
