# Goals als Mockup (G-28)

`[cmd]` Stand 2026-08-17. Route `/v2/goals` angelegt, die Vorlage
übernommen. **39 Kacheln, alle als Attrappe markiert** — obwohl Goals
als erstes Modul echte Daten in Reichweite hat.

`[cmd]` 136 KB Vorlage über drei Dateien — das umfangreichste Modul
bisher (Training 122 KB, Recovery 159 KB über fünf).

---

## Was gebaut wurde

`[cmd]` Neun Dateien unter `apps/web/src/app/v2/goals/`:

| Datei | Zeilen | Inhalt |
|---|---|---|
| `page.tsx` | 31 | Einstieg. Liest nichts — Begründung unten. |
| `ansicht.tsx` | 685 | Rahmen, zehn Tabs, fünf eigene Ansichten |
| `daten.ts` | 471 | Daten und Formeln, kein JSX |
| `tab-phase.tsx` | 701 | Phase engine, Adaptive TDEE, Cross-module |
| `tab-physique.tsx` | 312 | Physique ratios, Pose sessions |
| `modale.tsx` | 456 | Die sechs Modale des Rahmens |
| `phase-editor.tsx` | 795 | Phasen-Editor (zwölf Reiter) + Vorlagensammlung |
| `kontext.tsx` | 35 | Der Modalkontext |
| `goals.css` | 181 | Zwölf Raster — siehe „Was in v2.css fehlt" |

`[cmd]` 3.667 Zeilen gegen 2.377 Zeilen Vorlage — das Verhältnis
entspricht Training und Recovery (TypeScript-Typen, Haltepunkte,
Herkunftsvermerke je Kachel).

`[cmd]` `pnpm gate` grün (8/8). `[cmd]` 208 Tests grün, vorher 199 —
sechs neue in `v2-attrappen.test.ts` (die übrigen drei kamen vom
parallel laufenden Supplements-Auftrag).

---

## Wie sich die drei Vorlagendateien zueinander verhalten

**Ein Rahmen, zwei Zulieferer — das Training-Muster, nicht das
Recovery-Muster.** Der Name `-pro.jsx` deutet auf eine Profi-Fassung;
das ist er nicht.

### Der Beleg

`[cmd]` **`app.jsx:125`** entscheidet ohne Weiche:

```js
case "goals": return <GoalsModule />;
```

Zum Vergleich Recovery in derselben Datei, Zeile 122:

```js
case "recovery": return window.RecoveryModuleV2
  ? <window.RecoveryModuleV2 /> : <RecoveryModule />;
```

`[cmd]` **`window.GoalsModule` wird genau einmal gesetzt** —
`module-goals.jsx:903`. Weder `-pro.jsx` noch `-editor.jsx`
überschreiben es; sie setzen ausschliesslich eigene Namen. Es gibt
kein `GoalsModulePro` und kein `GoalsModuleV2`.

### Die Kette ist dreistufig

`[cmd]` Gemessen über die `window.`-Aufrufe je Datei:

| Datei | ruft auf | definiert |
|---|---|---|
| `module-goals.jsx` (903 Z) | `GoalsPhaseView`, `GoalsTDEEView`, `GoalsCrossModuleView`, `GoalsPhysiqueView`, `GoalsPosesView`, `PhotoUploadPanel` | `GoalsModule` |
| `module-goals-pro.jsx` (905 Z) | `PhaseEditorModal`, `PhaseTemplateLibrary` | die fünf `Goals*View` |
| `module-goals-editor.jsx` (569 Z) | — | die zwei `Phase*` |

**Fünf der zehn Tabs sind im Rahmen leer** und werden aus `-pro.jsx`
gefüllt (`module-goals.jsx:191-195`). **Zwei Knöpfe in `-pro.jsx` tun
nichts ohne `-editor.jsx`.** Wer nur die Hauptdatei übernimmt, baut ein
Modul, bei dem die Hälfte der Tabs leer bleibt.

### Damit vier Module, drei Muster

| Modul | Muster | Prüfung |
|---|---|---|
| Nutrition | konkurrierende Fassung | `-spec.jsx` definiert dieselben Komponenten nochmal |
| Training | ein System, zweistufig | Rahmen ruft `window.X`, Begleitdatei definiert es |
| Recovery | abgelöster Rahmen | `app.jsx` wählt mit `window.XV2 ? … : …` |
| **Goals** | **ein System, dreistufig** | wie Training, plus eine dritte Ebene |

`[read]` **Die verlässliche Prüfung bleibt `app.jsx`.** Sie ist die
einzige Stelle, an der die Vorlage selbst sagt, was gilt. Danach im
gewählten Rahmen nach `window.` greppen, und das rekursiv — bei Goals
führt die erste Runde zu `-pro.jsx`, die zweite zu `-editor.jsx`.

### Eine Komponente fehlt auch hier

`[cmd]` `module-goals.jsx:515` schiebt `window.PhotoUploadPanel` in den
Measurements-Tab. Definiert ist es in **`module-crossmodule-rest.jsx:120`**
— derselben Sammeldatei, aus der bei Recovery der Stress-Tab kam.

**Nicht übernommen.** Es lädt Dateien über `URL.createObjectURL` in den
Browserspeicher; ohne Ablage wäre das eine Attrappe, die etwas
verspricht, was sie nicht kann — und der Umsetzungsplan führt
Fotosessions ausdrücklich unter „Was nicht gebaut wird". Die Karte
„Photo progression" daneben steht vollständig da.

---

## Welche Kachel auf vorhandene Daten passt

**Das ist der Unterschied zu Training und Recovery.** `[cmd]` Dort gab
es nichts anzubinden. Hier liegt seit GO-03/GO-04 echtes Material:

`[cmd]` `supabase/_pipeline/11_goals/110_goals_zielwerte.sql` und
`apps/web/src/lib/profile/zielwerte-read.ts` liefern über
`getZielwerteAm(stichtag)`:

| Feld | Typ |
|---|---|
| `kcal`, `protein_g`, `carbs_g`, `fat_g` | Zielwerte |
| `linoleic_acid_g`, `alpha_linolenic_acid_g` | seit `d438ca4` |
| `tdee` | die gerechnete Gesamtumsatzzahl |
| `nutrition_goal` | die Zielrichtung |
| `herkunft` | `formel` oder `manuell` |
| `gueltig_ab` | Gültigkeitsdatum |

Dazu `getZielwertVorschlag` mit `bmr`, `tdee`, `kalorienfaktor` und
`hindernis` (`profil_unvollstaendig` / `zielrichtung_ohne_faktor`).

### Die Überschneidung ist punktgenau

**Der Composition-Tab rechnet dieselbe Formelkette wie GO-04.**
`[cmd]` `module-goals.jsx:556-560`:

```js
const bmr = 10*weight + 6.25*height - 5*age + 5;   // Mifflin-St Jeor
const tdee = bmr * 1.725;                          // Aktivitätsfaktor
```

`[read]` Der Umsetzungsplan hält als **W-6** fest, dass die
*Spec*-Formel den Aktivitätsfaktor vergisst und deshalb um Faktor
1,2–1,9 zu niedrig liegt. **Die Designvorlage macht es richtig** — sie
wendet ihn an. Das deckt sich mit dem, was GO-04 gebaut hat.

### Die fünf Kacheln, die sofort echt werden könnten

| Kachel | Tab | Feld aus `zielwerte_am` | Aufwand |
|---|---|---|---|
| **`CalcRow` „TDEE"** | Composition | `tdee` | eine Zeile |
| **`CalcRow` „BMR"** | Composition | `getZielwertVorschlag().bmr` | eine Zeile |
| **„Energy balance · today"** — Ring-Maximum | Composition | `kcal` | eine Zeile |
| **„Profile · inputs"** — die sechs Felder | Composition | `public.profiles` (GO-01 füllt sie) | Lesepfad da |
| **„Formula baseline"** | Adaptive TDEE | `tdee` (Herkunft `formel`) | eine Zeile |

**Alle fünf liegen in zwei Tabs.** Ein Folgeauftrag, der nur
`Composition` und die Kopfzeile von `Adaptive TDEE` anbindet, nimmt
fünf von 39 Marken weg — ohne eine einzige neue Tabelle.

`[annahme]` Der Rest des Composition-Tabs (BMI, FFMI, Lean mass, Fat
mass) braucht **Gewicht und Körperfett**. Beides steht in
`public.profiles.body_weight_kg`, ist aber `[cmd]` in 0 von 2 Zeilen
gefüllt; Körperfett hat gar keine Spalte. Das ist GO-01 und GO-10.

---

## Was zuerst echte Daten bekommen könnte

**Anders als bei Training und Recovery ist die Antwort nicht „erst
eine Tabelle bauen".** Die Reihenfolge, die der Umsetzungsplan
vorgibt, deckt sich mit dem, was das Mockup zeigt:

**1. Composition-Tab anbinden — kein Schema nötig.** Siehe oben. Fünf
Kacheln, fünf Zeilen Lesecode, `getZielwerteAm` existiert.

**2. `goals.user_goals` + `goals.goal_phases` (GO-07).** Weckt den
Goals-Tab (vier Zielkarten), den Timeline-Tab (Gantt) und die
Kopfzeile. `[read]` Setzt **GO-06** voraus — die Entscheidung über das
Zielvokabular. `[cmd]` Der Plan führt als **W-3** vier
unterschiedliche Listen ohne Abbildung: `profiles.nutrition_goal` (6
Werte), `ONBOARDING_ADR` (12), `goal_phases.phase_type` (9),
`user_goals.goal_type` (4). **Die Vorlage benutzt eine fünfte:** sechs
Typen im New-goal-Modal (`body_comp`, `weight`, `strength`,
`performance`, `habit`, `custom`).

**3. `goals.body_measurements` (GO-10).** Weckt Body metrics,
Measurements und die 13 Umfänge in Physique ratios.

**4. Adaptive TDEE (GO-13) — nicht terminierbar.** `[read]` Der Plan:
*„Vor Woche 2 gibt es nichts zu adaptieren."* Die Rechnung braucht
zwei volle Wochen Zufuhr **und** Gewicht; `[cmd]` `meals` hat 0
Zeilen. Der Tab beschreibt exakt, was GO-13 bauen würde — inklusive
der EMA-Glättung (α = 0.3) und der 7.700 kcal/kg.

**5. Cross-module (GO-15) — wartet auf vier Module.** `[read]` Setzt
voraus, dass Training, Recovery, Supplements und Medical täglich
Scores liefern. Keines tut das.

**Nicht anbindbar bleiben Pose sessions und die Physique-Verhältnisse.**
`[read]` Der Plan führt beide unter „Was nicht gebaut wird" — das eine
braucht Dateiablage und ein Bildmodell, das andere hat keine
Eingabemöglichkeit.

---

## Abweichungen von der Vorlage, mit Grund

**Nur Technisches.** Keine Kachel weggelassen, keine Zahl ersetzt,
keine Anordnung geändert.

| Abweichung | Grund |
|---|---|
| JSX → TypeScript | die App übersetzt mit |
| Klassen auf `v2-` | Präfixregel von v2.css |
| `window.Goals*View` → Import | Module statt globaler Namensraum |
| `color-mix(in srgb, …)` → `in oklch` | wie im Rest von v2 |
| Knöpfe ohne Ziel → `InEntwicklungKnopf` | Regel aus G-05 |
| Escape schliesst jedes Modal | die Vorlage hat es nicht |
| `<div onClick>` → `<button>` (Phasenkacheln, Zieltypen, Umschalter) | dieselbe Begründung wie bei `Tabs` in packages/ui |
| Strichfigur einmal statt zweimal | die Vorlage kopiert dasselbe SVG; hier eine Komponente mit zwei Requisiten |
| `@media`-Haltepunkte | die Vorlage hat null |

### Zwei Abweichungen, die eine Entscheidung waren

**1. `Math.random()` in den Verlaufsdaten ersetzt.**
`[cmd]` `module-goals.jsx:101-121` erzeugt die Gewichts- und
Körperfettverläufe mit `Math.random()`. **Serverseitig kommen andere
Zahlen heraus als im Browser** — das ergibt bei jedem Aufruf eine
Hydrations-Abweichung. `[cmd]` Bei Recovery hat dieselbe Fehlerklasse
(die `<title>`-Schreibweise) **32 Konsolenmeldungen** erzeugt.

Ersetzt durch eine feste Pseudofolge derselben Form (Sinus + Drift,
Streuung an den Index gebunden statt an den Zufallsgenerator). **Am
Bildschirm gemessen: 1 Konsolenfehler**, und das ist der vorbestehende
`data-mode`-Hinweis, der auf `/v2/dashboard` genauso auftritt. Ein
Test hält fest, dass `Math.random()` nicht zurückkommt.

**2. Das feste „Heute" der Vorlage übernommen.**
`[cmd]` `module-goals.jsx:317` rechnet Fristen gegen
`new Date("2026-05-16T12:00:00")`. Ein echtes `Date.now()` wäre hier
falsch: die Fristen der Attrappe liegen 2026 und liefen sonst je nach
Tag anders ab — und es wäre dieselbe Hydrationsfalle wie oben.

### Was die Vorlage falsch macht und stehen bleibt

`[cmd]` **`calcGoalProgress` teilt durch die Gewichtssumme** — die sich
zu 1.0 addiert. Die Division ist wirkungslos. `[read]` Der
Umsetzungsplan führt das als **W-8** und schliesst daraus, der Code sei
nie gelaufen. **Übernommen wie er dasteht:** das Ergebnis ist
dasselbe, und wer die Zeile streicht, macht die Herkunft
unauffindbar.

`[cmd]` **`GOAL_PHASES.expert_bb_annual` setzt `requires` zweimal**
(Zeile 57 und 65). In JS gewinnt der zweite. Übernommen ist der
zweite — das ist, was dort läuft.

`[cmd]` **Das Posen-Etikett stimmt nicht mit der Liste überein:**
„8 IFBB Mandatory", aber `POSE_SETS.mandatory` führt **zehn** Posen.
Beides unverändert übernommen — es ist eine Attrappe.

---

## Was in v2.css fehlt

`[read]` Der Auftrag: „fehlt ein Symbol oder eine Klasse: melden."

**Es fehlt kein Symbol.** `[cmd]` Alle 20 gebrauchten liegen in
`icons.tsx`: goals, training, brain, medical, nutrition, recovery,
supplements, check, x, arrow_right, edit, layers, download, copy,
camera, plus, trend_up, trend_down, chevron_right, trash.

`[cmd]` **`arr_r` kommt in keiner der drei Goals-Dateien vor** — der
Tippfehler, der in G-20 und G-21 auftrat, ist hier kein Thema.

**Die geteilten Raster reichen weitgehend.** `v2-grid-15` trägt vier
Tabs (Goals, Phase engine, Adaptive TDEE, Cross-module), `v2-grid-14`
vier weitere. Übrig bleiben **zwölf Raster** in
`apps/web/src/app/v2/goals/goals.css`:

`v2-goals-comp` (Composition — zwei gleiche Spalten **mit**
Haltepunkt), `-gantt` (180px + Balken), `-phase-kopf`, `-phasen`
(4→3→2 Spalten), `-tdee-kopf` samt `-trenner`, `-cross-kopf`,
`-trace` (die Herleitung, scrollt in sich), `-typen`, `-detail-kopf`,
`-posen` (5→4→3), `-muskelwert`, `-energie`.

**`v2-grid v2-g-cols-2` ist kein Ersatz für `v2-goals-comp`.**
`[cmd]` `v2.css:470` setzt nur die Spalten, ohne Haltepunkt — die
linke Kachel trägt sechs Rechenzeilen und braucht auf dem Telefon die
volle Breite. Dieselbe Feststellung wie bei Recovery.

### Eine Meldung zur Shell

`[cmd]` **`.v2-btn` hat kein `white-space: nowrap`** (v2.css:344 ff.).
Die drei Kopfknöpfe („Log weight", „Measurements", „New goal") brechen
deshalb **innerhalb** des Knopfes um, sobald die Kontextspalte den
Inhalt verschmälert — der Knopf selbst bleibt bei 26 px, gemessen.
Das betrifft **jedes** Modul mit längeren Knopfbeschriftungen, nicht
nur Goals; `packages/ui` war für diesen Auftrag gesperrt. **Gemeldet,
nicht umgangen** — ein lokales `nowrap` in `goals.css` würde den
Unterschied zwischen den Modulen verstecken statt ihn zu beheben.

---

## Nachweis

`[cmd]` Geprüft am 2026-08-17 im Browser, lokal auf Port 3200.

**Angemeldet als `test-user@lumeos.local`.** `[read]`
`docs/ssot/37-testkonten.md:15` führt für `dev@lumeos.app` „(Toms
eigenes)" Passwort — es steht nicht im Repo. Für diese Prüfung macht
es keinen Unterschied: die Seite liest nichts.

| Punkt | Ergebnis |
|---|---|
| `/v2/goals` zeigt das Modul | ja, Bildschirmfoto |
| Alle zehn Tabs, je Breite | **30 von 30** — je Tab `[selected]` **und** eigener Inhalt geprüft |
| Jede Kachel trägt eine Marke | 39 von 39 |
| `v2-attrappen.test.ts` greift | ja, sechs neue Prüfungen |
| Jeder Knopf tut etwas | Modal oder Funktion, keiner tot |
| Modale schliessen mit Escape | geprüft an New goal, Log weight, Phasen-Editor, Vorlagensammlung |
| **Konsolenfehler** | **1** — derselbe wie auf `/v2/dashboard` (vorbestehend, `data-mode`) |
| Drei Breiten | 1440 / 1100 / 640 — **30 von 30** ohne waagerechtes Schieben |
| `pnpm gate` | grün, 8/8 |
| Tests | 208 grün (vorher 199) |

**Der Phasen-Editor läuft vollständig.** `[cmd]` Zwölf Reiter je nach
Phase; für `recomp` erscheinen „Parameters" und „Calorie cycling", die
camelCase-Feldnamen werden umgesetzt („Rest Days"), der Fusszeilenknopf
„Apply to my plan" öffnet `InEntwicklung`, Escape schliesst.

`[annahme]` **Ein Werkzeughinweis, keine Beobachtung am Produkt:** Der
Klick des Browse-Werkzeugs auf den „Edit"-Knopf löste nichts aus,
während ein natives `element.click()` den Editor korrekt öffnete. Das
ist ein Artefakt des Werkzeugs; das Modal selbst funktioniert.
