# Training als Mockup (G-16)

`[cmd]` Stand 2026-08-17. Route `/v2/training` angelegt, die Vorlage
uebernommen. **Alles ist Attrappe** — 38 Kacheln, keine angebunden.

Die Seitenleiste fuehrte seit G-02 einen Eintrag `Training`
(`packages/ui/src/shell/nav.ts:71`), der ins Leere zeigte. Er zeigt
jetzt auf das Modul.

---

## Was gebaut wurde

`[cmd]` Sieben Dateien unter `apps/web/src/app/v2/training/`:

| Datei | Zeilen | Inhalt |
|---|---|---|
| `page.tsx` | 26 | Einstieg. Liest nichts — Begruendung unten. |
| `ansicht.tsx` | 783 | Kopf, zehn Tabs, Today/Plan/History/Exercises, Live-Workout |
| `tabs-spec.tsx` | 621 | Progression, Volume landmarks, Standards, Calendar |
| `tabs-offline-hr.tsx` | 357 | Offline sync, HR zones |
| `tabs-extras.tsx` | 62 | Body stats × strength (Fuss des History-Tabs) |
| `modale.tsx` | 899 | Die neun Modale |
| `kontext.tsx` | 45 | Der Modal-Kontext |
| `training.css` | 233 | Die Modul-Raster — siehe „Was in v2.css fehlt" |

`[cmd]` `pnpm gate` gruen (8/8 Tasks). `[cmd]` 194 Tests gruen, vorher
189 — die fuenf neuen stehen in `v2-attrappen.test.ts`.

---

## Was die vier Vorlagendateien enthalten

**Das war die offene Frage des Auftrags.** Die Antwort ist anders als
bei Nutrition, wo `-spec.jsx` eine konkurrierende Fassung desselben
Moduls war.

`[cmd]` **Die vier Training-Dateien sind KEINE Fassungen. Sie sind ein
System aus vier Teilen, die zusammen ein Modul ergeben.**
`module-training.jsx` ist der Rahmen; die anderen drei liefern Teile,
die der Rahmen namentlich anfordert. Der Beleg steht im Rahmen selbst,
Zeilen 48-53:

```
{tab === "progress"  && window.TrainingProgressionView && <window.TrainingProgressionView />}
{tab === "landmarks" && window.TrainingLandmarksView && <window.TrainingLandmarksView />}
{tab === "standards" && window.TrainingStandardsView && <window.TrainingStandardsView />}
{tab === "calendar"  && window.TrainingCalendarView && <window.TrainingCalendarView />}
{tab === "hrzones"   && window.TrainingHRAnalysis && <window.TrainingHRAnalysis/>}
{tab === "offline"   && window.TrainingOfflineView && <window.TrainingOfflineView/>}
```

**Sechs der zehn Tabs sind im Rahmen leer.** Sie werden aus den
Begleitdateien gefuellt. Wer nur `module-training.jsx` uebernimmt,
baut ein Modul, bei dem sechs von zehn Tabs nichts anzeigen.

### Datei fuer Datei

**`module-training.jsx` (646 Zeilen) — der Rahmen.**
Kopfzeile, die Tab-Liste (zehn Eintraege, Zeilen 28-39) und vier
eigene Ansichten: `TrainingToday`, `TrainingPlan`, `TrainingHistory`,
`TrainingLibrary`. Dazu das Live-Workout-Modal mit Pausenzaehler.

**`module-training-spec.jsx` (713 Zeilen) — vier Tabs plus drei
Rechner.** Trotz des Namens keine „Spec-Fassung": die Datei definiert
`TrainingProgressionView` (fuenf Progressionsmodelle, Deload-Ausloeser),
`TrainingLandmarksView` (MEV/MAV/MRV fuer zehn Muskelgruppen),
`TrainingStandardsView` (Kraftstandards nach Koerpergewicht,
Training-Score) und `TrainingCalendarView` (Monatsraster,
Cross-Module-Gating, Pending actions). Dazu die Modale
`PlateCalculatorModal`, `WarmupCalculatorModal`, `AIWorkoutGenModal`.

**Hier stehen die Formeln** — wie bei Nutrition in `-spec.jsx`:
Training-Score `0.40·adherence + 0.30·landmarks + 0.20·strength +
0.10·balance`, die MEV/MAV/MRV-Schwellen, die Rueckmeldungsregel
(`pump ≥ 2.5 UND sore ≤ 1.5 → MAV +1`), die Brzycki-Kategorien.
**Uebernommen, nicht erfunden**, und durch einen Test festgehalten.

**`module-training-extras.jsx` (487 Zeilen) — sechs Modale, der
Kontext, eine Kachel.** `RoutineEditorModal` (mit Supersatz-Gruppierung),
`ExerciseDetailModal`, `CustomExerciseModal`, `BlockEditorModal`,
`AssignWeekModal`, `SupersetEditorModal`. Dazu `TrainCtx` und
`TrainingBodyStatsCorrelation` (Kachel am Fuss des History-Tabs).

`[cmd]` **Die Datei ueberschreibt `window.TrainingModule`** (Zeile 50):
sie umhuellt das im Rahmen definierte Modul nachtraeglich mit einem
Kontext-Provider. Das ist eine Notloesung des Ladeverfahrens — die vier
Dateien landen nacheinander in einem globalen Namensraum. Hier gibt es
Kontext; `ansicht.tsx` spannt ihn selbst auf.

**`module-training-offline-hr.jsx` (285 Zeilen) — zwei Tabs.**
`TrainingOfflineView` (IndexedDB-Speicher, Outbox, Sync-Protokoll,
Konfliktaufloesung) und `TrainingHRAnalysis` (fuenf Herzfrequenzzonen,
Antwort je Satz, Verlaufskurve).

### Zwei Komponenten fehlen in allen vier Dateien

`[cmd]` Der Rahmen ruft zwei Dinge auf, die nirgends definiert sind:

| Aufruf | Wo | Was gemacht wurde |
|---|---|---|
| `window.PeriodizationFullView` | `module-training.jsx:289`, Kopf des Plan-Tabs | entfaellt — es gibt nichts anzuzeigen |
| `window.HeartRateWidget` | `:616`, Fuss des Live-Modals | entfaellt — der HR-Teil steht als eigener Tab |
| `window.OfflineStatusWidget` | `:14`, Kopfzeile | die Vorlage hat selbst einen Ersatz (`Pill`), der greift |

**Fuer das naechste Modul heisst das:** Vor der Uebernahme im Rahmen
nach `window.` greppen. Was dort steht, muss in einer der
Begleitdateien liegen — sonst ist es eine Luecke der Vorlage, keine
Auslassung des Nachbaus.

---

## Was angebunden werden koennte

`[cmd]` **Es gibt vier Trainingstabellen, alle Stammdaten:**

| Tabelle | Zeilen |
|---|---|
| `training.exercises` | 1.416 |
| `training.exercise_muscles` | 6.624 |
| `training.muscle_groups` | 107 |
| `training.equipment` | 58 |

`[cmd]` **`training.sessions` und `training.sets` kommen in
`supabase/_pipeline/` nirgends vor.** Gesucht ueber alle SQL-Dateien.

**Das ist der Grund, warum alles Attrappe ist.** Jede Zahl des Moduls
— Volumen, e1RM, Streak, Wochenplan, Herzfrequenz, Adhaerenz — leitet
sich aus absolvierten Saetzen ab. Ohne Sitzungen ist keine davon
berechenbar.

### Die erste Kachel: der Tab „Exercises"

**`TrainingLibrary` (`ansicht.tsx`) ist die einzige Ansicht, die ohne
eine einzige neue Tabelle echt werden kann.** Die Vorlage zeigt dort
zehn erfundene Uebungen; die Spalten decken sich fast eins zu eins mit
`training.exercises`:

| Spalte der Vorlage | Herkunft | Da? |
|---|---|---|
| Exercise | `exercises.name` | ja |
| Equipment | `equipment.name` ueber `equipment_id` | ja |
| Muscles | `exercise_muscles` + `muscle_groups.name` | ja |
| Type | `exercises.category` / `exercise_type` | ja |
| e1RM | aus Saetzen berechnet | **nein** |
| Best set | aus Saetzen berechnet | **nein** |

**Vier von sechs Spalten sofort, zwei bleiben `—`.** Das ist kein
Mangel: `—` ist die richtige Anzeige fuer „kein Wert", und die Vorlage
zeigt bei `Lateral Raise` selbst `—` in der e1RM-Spalte. Die
Suchleiste bekaeme 1.416 statt 1.200 Uebungen; die
Ausruestungs-Auswahl 58 statt vier Eintraege.

**Dazu gehoert `ExerciseDetailModal`** (`modale.tsx`): Primaer- und
Synergistenmuskel kommen aus `exercise_muscles.role`
(`primary`/`secondary`/`stabilizer`), die Technikhinweise aus
`exercises.instructions` und `exercises.tips` — beide Spalten stehen im
Schema. Die Kurve und „Last 5 sessions" bleiben Attrappe.

### Danach, in dieser Reihenfolge

1. **`training.sessions` + `training.sets` anlegen.** Ohne sie geht
   nichts weiter. Die Vorlage sagt selbst, welche Felder sie braucht:
   `set_type` (working/warmup/dropset/failure, mit dem Vermerk, dass
   Aufwaermsaetze nicht ins Volumen zaehlen), Gewicht, Wiederholungen,
   RIR/RPE, Dauer.
2. **„Today" und „Recent sessions"** — direkte Abfragen, keine
   Rechnung.
3. **Volumen und Streak** — Summen ueber Saetze je Muskelgruppe; die
   Zuordnung liegt in `exercise_muscles`.
4. **e1RM, Standards, Progression** — die Formeln stehen fertig in
   `module-training-spec.jsx` und sind in `tabs-spec.tsx` uebernommen.
5. **HR zones** — braucht zusaetzlich eine Geraetequelle. Am weitesten
   entfernt.

**Nicht anbindbar ist der Tab „Offline sync".** Er zeigt einen
IndexedDB-Speicher, den es nicht gibt; „Flush outbox" leert einen
`useState`. Er bleibt Attrappe, bis es Offline-Schreiben gibt — und
das ist kein Anbinden, sondern ein eigener Bau.

---

## Abweichungen von der Vorlage, mit Grund

**Nur Technisches.** Keine Kachel weggelassen, keine Zahl ersetzt,
keine Anordnung geaendert.

| Abweichung | Grund |
|---|---|
| JSX → TypeScript | die App uebersetzt mit |
| Klassen auf `v2-` | Praefixregel von v2.css |
| `window.Training*View` → Import | Module statt globaler Namensraum |
| `window.dispatchEvent("training-modal")` → Kontext | das Ereignis war der Ersatz fuer Kontext, den die Vorlage nicht hatte |
| `color-mix(in srgb, …)` → `in oklch` | wie im Rest von v2 |
| Knoepfe ohne Ziel → `InEntwicklungKnopf` | Regel aus G-05 |
| Escape schliesst jedes Modal | die Vorlage hat es nicht; ohne ist ein Modal per Tastatur eine Sackgasse |
| `<div onClick>` → `<button>` bei den Progressionsmodellen | dasselbe wie bei `Tabs` in `packages/ui` |
| Timer im Offline-Tab wird aufgeraeumt | ohne das setzt er den Zustand einer Komponente, die es nach einem Tabwechsel nicht mehr gibt |
| `@media`-Haltepunkte | die Vorlage hat null |

### Zwei Abweichungen, die eine Entscheidung waren

**1. `chevron_up` fehlt im Symbolsatz.**
`[cmd]` `packages/ui/src/icons.tsx` fuehrt `chevron_down`,
`chevron_left`, `chevron_right` — **kein `chevron_up`**. Die Vorlage
benutzt es im Routine-Editor fuer „Move up"
(`module-training-extras.jsx:176`).

**Ergaenzt wurde es nicht** — G-16 sperrt `packages/ui`. Genommen ist
das vorhandene Paar `arrow_up`/`arrow_down` fuer beide Knoepfe: ein
Chevron neben einem Pfeil waere schlechter als zwei Pfeile.
**Das ist die gemeldete Luecke.** Ein Auftrag, der `packages/ui`
oeffnen darf, sollte `chevron_up` nachtragen.

**2. Die kleinen Zahlenkacheln tragen die Marke ohne Begruendungstext.**
Bei den vier Kacheln der Volume landmarks und den vier der HR zones
steht `attrappe` statt `attrappe={ATTRAPPE}`. `[cmd]` Am Bildschirm
nachgesehen: der Begruendungssatz ist dreimal so lang wie die Kachel
und schiebt die Zahl aus dem Blick. **Die Marke bleibt** — der Grund
steht an der grossen Kachel darunter. Der Test zaehlt beide
Schreibweisen.

---

## Was in v2.css fehlt

`[read]` Der Auftrag: „Fehlt eine: melden, nicht ergaenzen."

`[cmd]` **Die 169 Klassen decken alles ab, was Bausteine sind** —
`v2-card`, `v2-pill`, `v2-btn` samt `-sm`/`-ghost`/`-primary`/`-accent`,
`v2-tbl`, `v2-modal*`, `v2-row*`, `v2-eyebrow`, `v2-num`, `v2-mono`,
`v2-dim`, `v2-muted`, `v2-divider`, `v2-col-gap`, `v2-row-gap`,
`v2-grid`, `v2-g-cols-2/3/4`, `v2-card-tight`, `v2-placeholder-img`,
`v2-icon-btn`, `v2-spacer`, `v2-dot`. **Nichts davon fehlte.**

**Was fehlt, sind ausschliesslich Modul-Raster** — die Vorlage traegt
sie inline als `style={{gridTemplateColumns: …}}`, und ein Raster ohne
Haltepunkt ist auf dem Telefon unbrauchbar. Sie stehen deshalb in
`apps/web/src/app/v2/training/training.css`, 15 Klassen:

`v2-train-grid-14` (1.4fr/1fr), `-grid-15`, `-grid-11`, `-grid-21`,
`-span-2`, `-week`, `-session-kopf`, `-medallion`, `-vol-tbl`,
`-lib-filter`, `-rest`, `-landmark-row`, `-feedback-row`, `-hr-row`,
`-offline-kopf`, `-ex-row`, `-block-felder`, dazu `v2-tbl-wrap`.

**Sie gehoeren spaeter nach v2.css.** `v2-train-grid-14` ist derselbe
Zweispalter wie `v2-dash-grid`; `v2-tbl-wrap` (Tabellen scrollen in
sich statt die Seite aufzuschieben) braucht jedes Modul mit breiten
Tabellen. Sobald ein Auftrag v2.css oeffnen darf, wandern sie dorthin.
Bis dahin liegen sie neben der Route, weil eine Route ohne Raster
schlechter waere als eine spaeter zu verschiebende Regel.

`[cmd]` Der Haltepunkt 1100px ist derselbe, den v2.css fuer
`.v2-dash-grid` und `.v2-diary-grid` setzt — uebernommen, nicht neu
erfunden.

---

## Nachweis

`[cmd]` Geprueft am 2026-08-17 im Browser, lokal auf Port 3200.

**Anmeldung:** `test-user@lumeos.local`, **nicht** `dev@lumeos.app`.
`[read]` `docs/ssot/37-testkonten.md:15` fuehrt fuer `dev@lumeos.app`
„(Toms eigenes)" Passwort — es steht nicht im Repo, und die
`.env.local` ist durch einen Hook gesperrt. **Fuer diese Pruefung
macht es keinen Unterschied:** die Seite liest nichts, es gibt keinen
Adminpfad und keine rollenabhaengige Anzeige. Wer es mit Toms Konto
nachsehen will, sieht dasselbe.

| Punkt | Ergebnis |
|---|---|
| `/v2/training` zeigt das Modul | ja, Bildschirmfoto |
| Alle zehn Tabs erreichbar | ja, durchgeklickt — die Leiste scrollt (`overflow-x: auto` in v2.css, bestand schon) |
| Jede Kachel traegt eine Marke | 38 von 38 |
| `v2-attrappen.test.ts` greift | ja, fuenf neue Pruefungen |
| Jeder Knopf tut etwas | Modal oder Funktion, keiner tot |
| `pnpm gate` | gruen, 8/8 |
| Tests | 194 gruen (vorher 189) |
| Drei Breiten | 1440 / 1100 / 640 — kein waagerechtes Schieben |
| `/nutrition`, `/v2/nutrition` unveraendert | ja, laden wie vorher |

**Die Rechner rechnen wirklich.** `[cmd]` Plate calculator, 117.5 kg
bei 20-kg-Stange: 48,75 kg je Seite = 25 + 20 + 2,5 + 1,25, ohne Rest.
Die Formeln sind die der Vorlage. Sie sind nur nicht an
Trainingsdaten angebunden — das Zielgewicht gibt man selbst ein.
Deshalb tragen `PlateCalculatorModal` und `WarmupCalculatorModal`
keine Marke: es gibt nichts anzubinden, was sie zeigen wuerden.

**Eine Konsolenwarnung**, auf `/v2/training` wie auf `/v2/dashboard`
gleich haeufig: „Extra attributes from the server: data-mode" aus
`RootLayout`. `[cmd]` Bestand vorher, gehoert zum Themenumschalter,
nicht zu diesem Auftrag.

---

## Fuer das naechste Modul

1. **Im Rahmen nach `window.` greppen**, bevor man ihn uebernimmt. Die
   Begleitdateien fuellen Tabs, die im Rahmen leer aussehen.
2. **`-spec.jsx` ist nicht automatisch eine Zweitfassung.** Bei
   Nutrition war es eine, bei Training ist es die Fortsetzung. Der
   Unterschied steht in der ersten Zeile: definiert die Datei
   `window.X = …`, ergaenzt sie; definiert sie dieselben Komponenten
   noch einmal, konkurriert sie.
3. **Die Formeln stehen in `-spec.jsx`** — bei Nutrition wie bei
   Training. Sie werden uebernommen und durch einen Test festgehalten.
4. **Kleine Zahlenkacheln vertragen keinen Begruendungstext.** `attrappe`
   ohne Satz genuegt.
