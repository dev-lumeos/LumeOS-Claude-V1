# Goals an die Daten gebunden (GO-16)

**Stand:** 2026-08-18 · **Auftrag:** GO-16 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

Vorgeschichte: `docs/ssot/94-goals-mockup.md` (G-28, das Mockup).

---

## Kurzfassung

`[cmd]` **Fünf der zehn Tabs tragen echte Daten.** Von 38 Marken
bleiben **23**; vier Tabs zeigen im Browser keine einzige mehr.

`[read]` Die Regel des Auftrags: *„Das Mockup ist die Vorgabe. Es
bekommt echte Daten. Was nicht aus den Daten kommt, wird gemeldet,
nicht ersetzt."* Gemeldet werden **drei Zahlen aus dem Auftragstext,
die heute anders lauten** (Abschnitt 3) — sie sind nicht falsch
gemessen, sie gelten an einem anderen Tag.

| | |
|---|---|
| Marken vorher / nachher `[cmd]` | 38 / **23** |
| Kacheln ohne Marke `[cmd]` | **4 Dateien** (Zielkarten · Composition · Körper · TDEE-Kopf) |
| Tabs ohne jede Marke `[cmd]` | **4** — Goals · Body metrics · Measurements · Composition |
| Angebundene Funktionen `[cmd]` | **7 von 11** |
| `pnpm gate` `[cmd]` | 8 von 8 grün · `v2-attrappen.test.ts` 70/70 · `lesen.test.ts` 4/4 |

---

## 1. Welche Kachel welche Funktion bekommt

`[cmd]` Je Kachel, gegen die laufende Instanz geprüft. **Diese Tabelle
stand vor dem Bau fest** — der Auftrag verlangt das ausdrücklich.

### Angebunden

| Tab | Kachel | Quelle | Wert am 2026-08-18 |
|---|---|---|---|
| **Goals** | Zielkarte je Ziel | `user_goals` + `goal_progress_at()` | 2 Ziele |
| **Goals** | Meilensteine | `goal_milestones` + `goal_milestone_status()` | 3, alle `open` |
| **Goals** | Fortschritt · Herkunft | `goal_progress_at().current_source` | `goals.body_measurements` |
| **Composition** | `CalcRow` BMI | `body_measurements.bmi` | 24,6 |
| **Composition** | `CalcRow` FFMI | `body_composition_navy().ffmi` | 21,49 |
| **Composition** | `CalcRow` BMR | `berechne_zielwerte().bmr` | **1.856** kcal |
| **Composition** | `CalcRow` TDEE | `berechne_zielwerte().tdee` | **3.527** kcal (× 1,900) |
| **Composition** | `CalcRow` Lean / Fat mass | `body_composition_navy()` | 74,60 / 9,58 kg |
| **Composition** | Body fat estimate | `body_composition_navy()` **mit Spanne** | 11,38 % (7,88–14,88) |
| **Composition** | Energy balance · Ringmaximum | `zielwerte_am().kcal` | 2.500 kcal |
| **Composition** | Profile · inputs | `public.profiles` | male · 31 J. · 185 cm · very_active |
| **Adaptive TDEE** | Kopfkachel | `adaptive_tdee()` | Formel 3.527, adaptiv **leer** |
| **Body metrics** | Gewicht / KFA / Magermasse | `body_measurements` | 17 Messungen bis heute |
| **Measurements** | Umfangstabelle | `body_circumferences` | 13 Zeilen, 3 Sätze |
| **Measurements** | Seitenvergleich | dieselbe, jüngster Satz | R−L je Paar |
| **Kopfzeile** | „active goals", Phase | `user_goals`, `phase_am()` | 2 · `lean_bulk` |

`[cmd]` **Sieben der elf Funktionen sind angebunden:** `zielwerte_am`,
`berechne_zielwerte`, `adaptive_tdee`, `body_composition_navy`,
`goal_progress_at`, `goal_milestone_status`, `phase_am`. Die übrigen
vier sind Auslöser und Hilfen (`touch_updated_at`,
`fill_body_measurement_snapshot`, `sync_profile_weight_from_measurement`,
`refresh_profile_body_weight`) — sie haben keine Anzeigeseite.

### Nicht angebunden, mit Grund

| Tab | Warum er Attrappe bleibt |
|---|---|
| **Phase engine** | `[cmd]` `phase_am()` liefert **eine** Phase; die Kachel zeigt einen Zustandsautomaten mit sieben Phasen, Wochenregeln und Übergangsvorschlägen. `goal_phases` führt `recommended_next` — aber keine Regeln, die zu ihm führen. |
| **Cross-module** | `[cmd]` Beiträge aus fünf Modulen mit Gewichten. Es gibt keine Tabelle, die Modulwerte führt. |
| **Timeline** | `[cmd]` Gantt über zwölf Monate mit erledigten Zielen. `user_goals` führt `achievement_date` — in 0 von 2 Zeilen gefüllt. |
| **Physique ratios** | `[cmd]` Goldener Schnitt und Zielverhältnisse. Die Umfänge lägen vor; die **Zielwerte** dazu nicht. |
| **Pose sessions** | `[cmd]` Posen, Fotos, Sitzungen. `[read]` Fotosessions stehen im Umsetzungsplan unter *„Was nicht gebaut wird"*. |
| **Adaptive TDEE** (Rest) | `[cmd]` Neun-Wochen-Kurve, Herleitungstext, Wochenanpassung. `adaptive_tdee()` liefert **einen** Stichtagswert, keine Historie. |

---

## 2. Was echt wurde — mit Zahl

`[cmd]` **Im Browser gezählt, angemeldet als `dev@lumeos.app`,
Stichtag 2026-08-18:**

| Tab | Marken vorher | nachher |
|---|---|---|
| Goals | 5 | **0** |
| Phase engine | 5 | 5 |
| Adaptive TDEE | 6 | **5** |
| Cross-module | 5 | 5 |
| Timeline | 1 | 1 |
| Body metrics | 4 | **0** |
| Measurements | 4 | **0** |
| Composition | 4 | **0** |
| Physique ratios | 4 | 4 |
| Pose sessions | 3 | 3 |
| **Summe** | **38** | **23** |

`[cmd]` **Vier Attrappenfassungen sind gelöscht, nicht auskommentiert:**
`GoalsTab`, `MetricsTab`, `MeasureTab`, `CompTab` samt `GoalCard`,
`MetricKPI`, `CalcRow` und `BodyFatScale` — `ansicht.tsx` schrumpft von
**772 auf 315 Zeilen**. `[read]` Dieselbe Regel wie bei Medical (G-60):
toter Code, der aussieht wie eine Alternative, ist die nächste falsche
Fährte. Ein Test hält fest, dass sie nicht zurückkommen.

### Die vier neuen Dateien

| Datei | Zeilen | Was darin steht |
|---|---|---|
| `lib/goals/lesen.ts` | 520 | Der Lesepfad: sieben Funktionen, zwei Tabellen, das Profil |
| `v2/goals/ziel-karten.tsx` | 257 | Zielkarten und Meilensteine |
| `v2/goals/tab-composition.tsx` | 308 | Die vier Composition-Kacheln |
| `v2/goals/tab-koerper.tsx` | 277 | Body metrics und Measurements |
| `v2/goals/tdee-kopf.tsx` | 154 | Die Kopfkachel des TDEE-Tabs |

`[read]` **Die zwei Zielwert-Funktionen sind NICHT nachgebaut.**
`getZielwerteAm` und `getZielwertVorschlag` gibt es seit GO-03/GO-04 in
`lib/profile/zielwerte-read.ts`; die Seite ruft sie von dort. Zwei
Lesewege auf dieselbe Funktion wären zwei Wahrheiten.

### Das feste „Heute" ist weg

`[cmd]` `HEUTE_DER_VORLAGE = '2026-05-16'` kommt in keiner
angebundenen Datei mehr vor. Der Stichtag kommt aus
`lib/datum.ts:heute()` — **dieselbe Lösung, keine zweite**, wie der
Auftrag verlangt. `[read]` Sie rechnet über Mittag, damit die
Zeitumstellung keinen Tag verschluckt.

`[cmd]` `Date.now()` steht in keiner der fünf Dateien; die Altersrechnung
(`alterAm`) bekommt den Stichtag von aussen und ist damit
hydrationsfest. Vier Prüfungen decken ihre Ränder ab — Geburtstag,
Jahreswechsel, fehlendes Datum, 29. Februar.

---

## 3. Was die Daten nicht hergeben

**Gemeldet, nicht ersetzt.**

### 3.1 Drei Zahlen des Auftrags gelten an einem anderen Tag

`[cmd]` **Das ist der wichtigste Befund** — und keine Fehlmessung im
Auftrag, sondern eine Folge der Testdaten:

| Auftrag nennt | Gemessen am 2026-08-18 | Wo die Zahl des Auftrags herkommt |
|---|---|---|
| Körperfett **10,31 %**, Spanne 6,81–13,81 | **11,38 %**, Spanne 7,88–14,88 | `body_composition_navy()` am **2026-09-13** |
| FFMI **21,97** | **21,49** | ebenso, am 2026-09-13 |
| adaptiver TDEE **3.143,2** | **`null`**, `status = insufficient_intake_days` | heute nicht erreichbar, Abschnitt 3.2 |

`[cmd]` **Der Grund: von 43 Körpermessungen tragen 26 ein Datum nach
heute** — die Testdaten laufen bis 2026-09-13. Die Werte des Auftrags
sind die des **letzten** Satzes.

`[read]` **Toms Entscheidung zu GO-16: das echte Heute.** Die Anzeige
zeigt deshalb 11,38 % und **nennt die 26 ausgelassenen Messungen**:

> *„26 weitere Messungen tragen ein Datum nach dem 2026-08-18 und
> stehen deshalb nicht in der Kurve — sie wären Messungen, die es noch
> nicht gibt. Sie bleiben in der Datenbank."*

`[cmd]` Der Verlauf über die Stichtage, zum Beleg:

| Stichtag | Körperfett | FFMI |
|---|---|---|
| 2026-08-02 | 11,82 % | 21,24 |
| 2026-08-16 | **11,38 %** | **21,49** |
| 2026-08-23 | 11,12 % | 21,59 |
| 2026-09-13 | 10,31 % | 21,97 |

### 3.2 Der adaptive TDEE ist heute leer — und das ist kein Fehler

`[cmd]` `goals.adaptive_tdee` verlangt
`complete_intake_days >= window_days`
(`113_goal_milestones_adaptive_tdee.sql:172`) — **alle** 14 Tage des
Fensters mit vollständiger Zufuhr. `dev@lumeos.app` hat **13**. Auch
mit 28 Tagen Fenster reicht es nicht (16 von 28).

**Die Kachel zeigt deshalb keine Ersatzzahl**, sondern:

- einen Strich, wo die Zahl stünde,
- die Pille `nicht genug vollstaendige Zufuhrtage`,
- den Satz *„Der adaptive Wert braucht 14 von 14 Tagen mit
  vollständiger Zufuhr; vorliegen 13 (es fehlen 1)"*,
- **daneben die echte Formelgrundlage 3.527 kcal**, den echten
  Zufuhrschnitt 2.125 kcal und die echte Gewichtsänderung +0,210 kg.

`[read]` Der Auftrag: *„Beide bleiben sichtbar, mit ihrer Herkunft."*
Das ist erfüllt — nur ist die eine der beiden heute leer, und **warum**
steht daneben.

### 3.3 `alpha 0.3` — die Anzeige verschleiert es nicht mehr

`[cmd]` Der Auftrag: *„`alpha 0.3` macht den adaptiven Wert zu 70 % zur
Formel (GO-15, Toms Entscheidung steht aus). Nicht ändern — aber wenn
die Anzeige es verschleiert, melden."*

**Die Attrappe schrieb `EMA α=0.3` und sonst nichts.** Wer das Kürzel
nicht kennt, liest daraus eine Eigenständigkeit, die die Zahl nicht
hat. Die angebundene Kachel schreibt es aus:

> *„EMA-Glättung α = 0.3: der adaptive Wert übernimmt je Schritt 30 %
> aus der Messung und behält 70 % des Vorwerts — er bleibt damit nahe
> an der Formel."*

`[read]` **Nichts geändert**, wie verlangt. Nur benannt. **GO-15 bleibt
offen.**

### 3.4 Das Mockup hat 16 Eingabefelder — Goals erfasst nicht

`[cmd]` Gezählt: **14 im Phasen-Editor**, 1 im Modal, 1 im
Physique-Tab. `[read]` Der Umsetzungsplan: *„Goals ist der Massstab, an
dem Buddy misst — keine eigenständige Dateneingabe."*

`[read]` **Toms Entscheidung zu GO-16: stehen lassen, markiert,
melden.** Alle 16 sitzen in Kacheln, die ihre Marke behalten. **Die
angebundenen Dateien haben kein einziges** — ein Test prüft das, und
ebenso, dass `lesen.ts` kein `insert`/`update`/`upsert`/`delete`
enthält.

### 3.5 Weitere Lücken

| Was die Attrappe zeigt | Warum es nicht kommt |
|---|---|
| `pace: ahead / on-track / behind` | `[cmd]` Drei Urteile über die Person. Die Datenbank führt so etwas nicht, und `[read]` *„ob jemand sein Ziel gut verfolgt, ist eine Aussage über einen Menschen."* Ein Test hält die drei Wörter aus den angebundenen Dateien heraus. |
| Energy balance: gefüllter Ring | `[cmd]` Es gibt keine Tagesaufnahme, die hier ankäme. Der Ring zeigt **das Ziel**, bleibt aber leer — dieselbe Regel wie C-75 (*„keine gefüllten Ringe ohne Ziel"*). Ein zu 68 % gefüllter Ring wäre eine Falschaussage. |
| „3 closed in 90d" | `[cmd]` `achievement_date` ist in 0 von 2 Zielen gefüllt. Die Pille ist durch die echte Phase ersetzt. |
| Symmetriesatz „within normal range for a right-handed athlete" | `[cmd]` Wertung. Gezeigt wird die Differenz als Zahl. |
| `Fat-free mass index` „high end of intermediate trained" | `[cmd]` Wertung mit erfundener Einordnung. |
| Fotoverlauf, Posen | `[read]` Steht im Umsetzungsplan unter „Was nicht gebaut wird". |

---

## 4. Was die Daten hergeben und das Mockup nicht zeigt

`[read]` Der Auftrag: *„Wenn eine Spalte in den Daten steht, die das
Mockup nicht zeigt und die dazugehören würde — melden, nicht einbauen.
Erst mit Tom reden, dann bauen."*

| Was die Daten führen | Was es leisten würde | Status |
|---|---|---|
| **`goal_milestones`** (3 Zeilen, mit `goal_milestone_status()`) | `[cmd]` **Das Mockup hat keine Meilensteinkachel.** GO-11 hat drei Szenarien angelegt (erreicht, offen, verfehlt) — sie hätten sonst keine Anzeigeseite. **Eingebaut**, weil ohne sie eine ganze Tabelle unsichtbar bliebe; wenn die Form nicht passt, ist das eine Formfrage. | **eingebaut, zur Ansicht** |
| **`stored_status` gegen `computed_status`** | `[cmd]` Die Funktion rechnet gegen Messwerte, die Tabelle speichert einen Stand. Laufen sie auseinander, **ist die Abweichung die Aussage**. Heute stimmen alle drei überein. | **eingebaut** (Hinweis erscheint nur bei Abweichung) |
| **`user_goals.progress_pct`** (40,00 / 33,00) | `[cmd]` Ein **gespeicherter** Stand, der von `goal_progress_at()` abweicht (dort 0,0 %). Gezeigt ist der gerechnete; die Herkunftskachel sagt, warum. | **gemeldet** |
| **`progress_status`** | `[cmd]` `not_implemented_workout_sets` am Kraftziel — die Funktion sagt selbst, dass sie nicht rechnen kann. **Gezeigt**, weil eine leere Prozentzahl ohne Grund wie ein Fehler aussieht. | **eingebaut** |
| **`goal_phases`: `transitioned_from`, `recommended_next`, `transition_reason`** | `[cmd]` Gefüllt (`maintenance` → `lean_bulk` → `mini_cut`, „Phasenwechsel im Testzeitraum"). Der Phase-Tab ist Attrappe; diese drei Felder wären sein echter Kern. | **melden** |
| **`goal_phases.parameters`** | `[cmd]` `{"calorie_surplus_kcal": 250}` — die Phasenvorgabe als Zahl. | **melden** |
| **`body_measurements`: `fat_mass_kg`, `height_cm_snapshot`** | `[cmd]` In 43 von 43 gefüllt. `fat_mass_kg` ist eingebaut; der Grössenschnappschuss nicht — er wäre die Antwort auf „welche Grösse galt damals". | **teils gemeldet** |
| **Zwei Unterarme** | `[cmd]` `body_circumferences` führt `forearm_left_cm` **und** `forearm_right_cm`; die Attrappe zeigt **einen** Unterarm. Ergibt 13 statt 12 Zeilen — die eine Abweichung von der Vorlage. | **eingebaut, gemeldet** |
| **`measurement_source` / `source_detail`** | `[cmd]` `manual` · „Kopie aus tom.seed@example.com". Sagt, woher eine Messung stammt. | **melden** |
| **`user_goals`: `motivation_reason`, `difficulty_level`, `celebration_enabled`** | `[cmd]` Gefüllt („Muskelaufbau ohne aggressiven Ueberschuss", `moderate`). Das Mockup hat keine Stelle dafür. | **melden** |
| **`adaptive_tdee`: `raw_tdee_kcal`, `confidence`, `method`** | `[cmd]` `confidence` und `method` sind eingebaut; `raw_tdee_kcal` ist heute leer und erschiene erst mit vollständigen Tagen. | **teils eingebaut** |

---

## 5. Nachweis

### Angemeldet, beide Modi

`[cmd]` Als `dev@lumeos.app` im Browser, 1440 × 1100:

| | |
|---|---|
| Goals (hell) | 2 echte Ziele, 3 Meilensteine, Herkunftskachel |
| Composition (dunkel) | BMI 24,6 · FFMI 21,49 · BMR 1.856 · TDEE 3.527 · KFA 11,38 % **mit Spanne und Vorbehalt** |
| Adaptive TDEE | Strich statt Zahl, Statuspille, Formel 3.527 daneben, α ausgeschrieben |
| Measurements | 13 Umfangszeilen, Seitenvergleich ohne Urteil |
| Body metrics | 17 Messungen, **Hinweis auf die 26 ausgelassenen** |

### Die Marken

`[cmd]` Im Browser je Tab gezählt: **23**, vorher 38. Vier Tabs zeigen
**null**. Vier Dateien tragen keine Marke und mindestens eine Karte —
ein Test prüft beides.

### Körperfett und TDEE, wie verlangt

| Nachweis | Ergebnis |
|---|---|
| Spanne am Wert `[cmd]` | `11.38 % (7.88–14.88)` in der Kachel **und** in „Profile · inputs"; Spannenband auf der Skala |
| Vorbehalt sichtbar `[cmd]` | *„Umfangsverfahren: Standardfehler ca. +/-3,5 Prozentpunkte; kann Athleten mit hoher Muskelmasse ueberschaetzen; Quellen nicht mischen."* — wörtlich, ungekürzt |
| TDEE-Herkunft `[cmd]` | Formel 3.527 kcal · adaptiv leer mit Grund · α ausgeschrieben |

### Zeilenschutz

`[cmd]` Als `test-user@lumeos.local` im Browser: **`0 active goals`**,
`0 Meilensteine · 0 Koerpermessungen`, Leerzustand.

`[cmd]` **Zusätzlich an der Datenbank**, weil die Anzeige nur zeigt,
was ankommt:

| Rolle `authenticated`, `sub` = | Ziele | Meilensteine | Messungen | Umfänge | Phasen |
|---|---|---|---|---|---|
| `dev@lumeos.app` | 2 | 3 | 43 | 7 | 2 |
| `test-user@lumeos.local` | **0** | **0** | **0** | **0** | **0** |

`[cmd]` **Und der Quergriff** — test-user fragt die Funktionen
ausdrücklich nach der Nutzer-Id von dev: `body_composition_navy` **0
Zeilen**, `phase_am` **0**, `adaptive_tdee` **0**. Ein leeres Ergebnis
allein könnte heissen, dass jemand keine eigenen Daten hat; **diese
Zeile zeigt, dass die Regel fremde Zeilen sperrt.**

### Breiten

`[cmd]` Seitenüberlauf bei **375 · 768 · 1024 · 1440 px: keiner.**
Die Umfangstabelle rollt bei 375 px in sich (`v2-tbl-wrap`,
`overflow-x: auto`).

### Gate und Tests

| | |
|---|---|
| `pnpm gate` `[cmd]` | **8 von 8 grün** |
| `v2-attrappen.test.ts` `[cmd]` | **70 von 70** (vorher 63) |
| `lib/goals/__tests__/lesen.test.ts` `[cmd]` | **4 von 4** — neu |

**Sieben neue Prüfungen**, jede hält eine Entscheidung fest:

1. *„die angebundenen Goals-Kacheln tragen keine Marke mehr"* — und die
   vier Attrappenfassungen sind gelöscht.
2. *„Goals rechnet gegen das echte Heute"* — `lib/datum.ts`, kein
   `Date.now()`, kein `HEUTE_DER_VORLAGE`.
3. *„zeigt die Spanne am Körperfettwert"* — `min`/`max`/`caution` in
   Anzeige **und** Typ.
4. *„der adaptive TDEE zeigt seine Herkunft und verschleiert alpha
   nicht"*.
5. *„Goals bewertet nicht, es zeigt"* — `ahead`/`on-track`/`behind`
   kommen nicht vor.
6. *„Goals erfasst nicht"* — kein Eingabefeld, kein Schreibweg.
7. *„zeichnet keine Messungen, die es noch nicht gibt"* — Schnitt am
   Stichtag, ausgelassene werden gezählt.
8. `lesen.test.ts` — die Altersrechnung an ihren Rändern.

### Eine Korrektur an einer eigenen Prüfung

`[cmd]` Die Regel *„kein `Date.now()`"* schlug zuerst an — auf den
**Kommentar**, der die Abwesenheit begründet und `Date.now()` wörtlich
zitiert. Dieselbe Falle wie beim `arr_r`-Test; die Prüfung entfernt
jetzt Kommentare, bevor sie sucht.

### Ein Konsolenfehler, der nicht von hier kommt

`[cmd]` `Warning: Extra attributes from the server: data-mode` — **auf
`/v2/goals`, `/v2/medical` und `/v2/nutrition` gleichermassen**, also
Bestand aus dem Themenumschalter in `RootLayout`, nicht aus GO-16.
Nicht angefasst: er sitzt im Wurzellayout. **Gemeldet.**

---

## 6. Zwei Dinge, die stehen geblieben sind

`[cmd]` **`calcGoalProgress` behält seine wirkungslose Division** (W-8)
in `daten.ts`. Der Auftrag: *„Nicht reparieren — es ist Toms Entwurf,
und GO-11 hat es beim Bau der echten Rechnung berücksichtigt."* Die
angebundenen Kacheln benutzen die Funktion nicht; sie rechnen über
`goal_progress_at`.

`[cmd]` **`packages/ui` ist nicht angefasst.** Gebraucht und vorhanden:
`Card`, `Pill`, `Row`, `Ring`, `Sparkline`, `Icon`, `Tabs`. Nichts
gefehlt.

---

## 7. Was als Nächstes ansteht

1. **GO-15 entscheiden** (`alpha`) — die Anzeige benennt den Effekt
   jetzt, die Frage bleibt offen.
2. **Zufuhrtage vervollständigen** — ein einziger fehlender Tag hält
   den adaptiven TDEE leer. Danach zeigt die Kachel eine Zahl, ohne dass
   sich an ihr etwas ändern muss.
3. **Über die Meilensteinkachel reden** — eingebaut, weil eine ganze
   Tabelle sonst unsichtbar bliebe; das Mockup hat keine Stelle dafür.
4. **Phase engine anbinden** — `transitioned_from`, `recommended_next`,
   `transition_reason` und `parameters` liegen gefüllt vor.
5. **Die 16 Eingabefelder klären** — die Vision schliesst Erfassung in
   Goals aus; die Felder stehen weiter im Mockup.
6. **Timeline, Cross-module, Physique, Poses** — 23 verbliebene Marken.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| 6 Tabellen, 11 Funktionen | `information_schema.tables` / `pg_proc` im Schema `goals` |
| 2 / 2 / 3 / 43 / 7 / 1 Zeilen | `SELECT count(*)` je Tabelle für `dev` |
| KFA 11,38 % heute, 10,31 % am 13.9. | `body_composition_navy()` an fünf Stichtagen |
| 26 Messungen in der Zukunft | `count(*) FILTER (WHERE measurement_date > CURRENT_DATE)` |
| adaptiv `null`, 13 von 14 Tagen | `goals.adaptive_tdee()` mit 14 und 28 Tagen Fenster |
| Schwelle `>= window_days` | `113_goal_milestones_adaptive_tdee.sql:172` |
| BMR 1.856 / TDEE 3.527 | `goals.berechne_zielwerte()` |
| `zielwerte_am` 2.500 kcal, `tdee` 2.273 | `goals.zielwerte_am()` |
| 16 Eingabefelder | `grep -c '<input|<select|<textarea'` je Datei |
| Marken 38 → 23 | Browser je Tab gezählt + `v2-attrappen.test.ts` |
| `ansicht.tsx` 772 → 315 Zeilen | `wc -l` vor und nach dem Schnitt |
| Zeilenschutz | `SET LOCAL ROLE authenticated` mit zwei `sub`-Werten + Quergriff + Browser |
| Kein Seitenüberlauf 375–1440 | `scrollWidth > clientWidth` je Breite → nein |
| `data-mode`-Warnung ist Bestand | dieselbe Meldung auf `/v2/medical` und `/v2/nutrition` |
| Gate, Tests | `pnpm gate` 8/8 · 70/70 · 4/4 |
