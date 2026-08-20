# 136 — Plan, Volume, Standards und was davon trägt

**Auftrag:** G-86 · **Stand:** 2026-08-20 · **Modul:** Training
**Vorher:** G-64 (Exercises), G-69 (fünf Sitzungs-Tabs), C-105
(Landmarks), C-125 (`recovery.scores`)

**Kurz:** Zwei Kacheln wurden echt — **Training readiness** aus
`recovery.scores` und **Diese Woche** aus `workout_sessions`. Auf
`Today` bleibt damit **eine** sichtbare Attrappenmarke (die
Sitzungskarte), über alle Tabs **22**. Der Plan-Tab lässt sich
**nicht** bauen: von den elf Feldern, die seine zwei Kacheln brauchen,
führt `workout_sessions` **keines**. HR zones und Offline sync bleiben
ohne Datengrundlage.

---

## Welche Kachel welche Tabelle bekommt

`[cmd]` Die Vorlage führt **38 Kacheln** in vier Dateien
(`tools/g86-kacheln.mjs`, gegen `module-training*.jsx`). Die
Tab-Ansichten verteilen sich so:

| Kachel | Tab | Quelle | Stand |
|---|---|---|---|
| This week | Today | `workout_sessions` | **echt (G-86)** |
| Training readiness | Today | `recovery.scores` | **echt (G-86)** |
| Weekly volume | Today | `workout_sets` → `exercise_muscles` | echt (G-69), **ohne Zielband** |
| Streak | Today | `workout_sessions` | echt (G-69) |
| Sitzungskarte (Push B) | Today | — | Attrappe, siehe unten |
| e1RM progression | History | `workout_sets.estimated_1rm` | echt (G-69) |
| Recent sessions | History | `workout_sessions` | echt (G-69) |
| Volume by muscle | History | `workout_sets` | echt (G-69) |
| Progression models · Next-session · Fatigue · Set types | Progression | teils `workout_sets` | echt (G-69) |
| Strength standards | Standards | `workout_sets` + `goals.body_measurements` | echt (G-69), **ohne Einstufung** |
| Training score | Standards | — | Attrappe: hängt zu 0,30 an `landmarks` |
| Mesocycle · Block 3 | Plan | — | **Attrappe, nicht baubar** |
| Routines | Plan | — | **Attrappe, nicht baubar** |
| Volume landmarks · Feedback loop · Post-workout feedback | Volume landmarks | — | Attrappe (C-105, A-22) |
| Time in zone · Per-set response · HR trace · Z-Zeilen | HR zones | — | Attrappe, **keine HR-Spalte existiert** |
| Outbox · Sync log · IndexedDB · Conflict resolution | Offline sync | — | Attrappe, **Betriebsart, kein Datenbestand** |
| May 2026 · Streak · Cross-module gating · Pending actions | Calendar | `workout_sessions` | echt (G-69) |

`[cmd]` **Die Tabellen, die es gibt** (gemessen 2026-08-20 auf
`dev@lumeos.app`): `workout_sessions` 30 · `workout_exercises` 60 ·
`workout_sets` 101 · `exercises` 1.416 · `muscle_groups` 95 ·
`exercise_muscles` 6.588 · `equipment` 58 · `recovery.scores` 170 ·
`goals.body_measurements` 181.

---

## Was echt wurde

### Training readiness — 5 Zeilen aus `recovery.scores`

`[read]` Der Auftrag hatte recht: **das ist Recovery.** Eine
Lesefunktion reicht, gerechnet wird nichts — C-125 hat die Anteile je
Tag gespeichert.

`[cmd]` **Alle fünf Zeilen der Vorlage sind gedeckt**, auf allen 170
Tagen belegt (`tools/g86-readiness.mjs`):

| Zeile der Vorlage | Spalte | Spanne über 170 Tage |
|---|---|---|
| Recovery | `score` | 43,0 … 84,7 |
| Sleep quality | `sleep_quality_score` | 30 … 80 |
| Soreness — chest | `soreness_score` | 22,3 … 66,7 |
| Nutrition | `nutrition_score` | **70 … 70** |
| Mood | `mood_score` | 45 … 100 |

`[read]` **Die `*_score`-Spalten, nicht die `*_points`.** Der Meter
will 0–100; `*_points` trägt je Anteil ein eigenes Gewicht (30, 15,
10, 5) und wäre auf einem gemeinsamen Balken nicht vergleichbar.

`[cmd]` **`nutrition_score` ist auf allen 170 Zeilen 70** — der
Rückfallwert aus C-123/E9, keine Messung. **Er wird gezeigt und als
Rückfall gekennzeichnet:** der Balken steht auf `opacity: 0.45`, und
darunter steht der Grund mit der Quelle `fallback_c123_e9`. Dieselbe
Linie wie in G-82.

`[cmd]` **Der Muskelname kommt aus dem Check-in, nicht aus dem
Mockup.** Die Vorlage schreibt „Soreness — chest" hart hin; die
Tabelle führt nur einen Schnitt. Gelesen wird
`recovery.checkins.soreness` desselben Tages — heute
`{"back":1,"chest":1}`, angezeigt als „Muskelkater — back, chest".

`[read]` **Kein Urteil.** Die Vorlage schreibt „Good to go" neben den
Ring und rät „consider attempting 120kg ×3 on bench". Das sind die
Readiness-Stufen der `SPEC_09` — Entscheidungspunkt E3. G-76 und G-82
haben sie aus Recovery entfernt; **hier kommen sie nicht durch die
Hintertür wieder herein.** Statt der Deutung steht da, woher die Zahl
stammt.

`[cmd]` **Im Browser gegengeprüft:** die Kachel zeigt **79,4** für den
2026-11-06 — dieselbe Zahl, die das Recovery-Modul für denselben Tag
zeigt. Sie wird nicht zweimal verschieden gerechnet.

### Diese Woche — 7 Tage aus `workout_sessions`

`[cmd]` **Hier entscheidet `status`, nicht das Datum — und das ist
neu.** G-69 hielt fest: *„alle 30 Sitzungen stehen auf `completed`,
auch die 15 in der Zukunft"* (2026-08-18). **Das gilt nicht mehr:**
gemessen am 2026-08-20 stehen **15 auf `completed`, 14 auf `planned`,
1 auf `cancelled`.** Der Seed hat sich dazwischen geändert.

`[read]` **Beides zusammen ist richtig, und beides bleibt stehen.**
Der Status sagt, was die Sitzung sein soll; der Stichtag sagt, ob ihr
Tag vorbei ist. Eine `planned`-Sitzung in der Vergangenheit ist
ausgefallen und darf nicht als Leistung zählen — das verhindert der
Datumsschnitt, an dem `absolviert` weiter hängt. **Die neue Kachel
braucht den Status**, weil sie `cancelled` von `planned` unterscheiden
muss; sie zeigt das durchgestrichen.

Die Kommentare in `sitzungen-read.ts` und `tab-verlauf.tsx`, die den
alten Stand als geltend beschrieben, sind auf den gemessenen
korrigiert.

`[read]` **Volumen nur, wo es eines gibt:** geplante Sitzungen tragen
0 kg, und eine 0 sieht aus wie ein Ergebnis. Steht kein Volumen an,
zeigt der Tag die Satzzahl.

---

## Was Attrappe bleibt und warum

### Plan — nicht baubar, und zwar eindeutig

`[cmd]` **Von elf Feldern, die die zwei Kacheln brauchen, führt
`workout_sessions` keines** (`tools/g86-plan.mjs`):

- **Mesocycle · Block 3** braucht `block`, `mesocycle`, `week`,
  `phase`, `focus`, `load_pct`, `deload` — **alle sieben fehlen.**
- **Routines** braucht `routine`, `template`, `origin`, `coach` —
  **alle vier fehlen.**

`[cmd]` **`name` ist keine Vorlage, sondern ein Einzeletikett:** 30
Sitzungen tragen 30 verschiedene Namen („Push 1", „Pull 1", … „Legs
10"), **jeder genau einmal.** Eine Routine ist etwas
Wiederverwendbares; hier gibt es nichts, was sich wiederholt.

`[read]` **Der Auftrag fragt: „Der Kalender zeigt sie schon — was
macht `Plan` darüber hinaus?"** Die Antwort aus den Daten: **nichts,
was heute belegbar wäre.** Der Kalender zeigt datierte Sitzungen, und
genau das sind die 14 `planned`-Zeilen. Plan zeigt etwas anderes — die
**Struktur über den Sitzungen**: Blöcke, Wochen mit Phasenzweck und
Lastprozent, und wiederverwendbare Routinen mit Herkunft. **Das ist
kein Anzeigeproblem, sondern ein fehlendes Schema.**

Die zwei Kacheln behalten deshalb ihre Marke. **Nachgebaut wurde
nichts** — ein „Block 3 · Woche 2 von 5" aus 14 Sitzungen zu erfinden
wäre genau die Schwellenerfindung, die der Auftrag verbietet.

### Volume landmarks und die Zielbänder — dreifach dieselbe Regel

`[cmd]` **Bestätigt: MEV/MAV/MRV stehen in keiner Tabelle.**
`training.volume_landmarks`, `training.strength_standards`,
`training.standards`, `training.landmarks` melden alle **PGRST205
„Could not find the table"** — sie existieren nicht, sie sind nicht
etwa gesperrt.

**Die Regel greift an drei Stellen, wie der Auftrag sagt:**

1. **Volume landmarks (Tab)** — 7 Marken, unverändert.
2. **Das Zielband der Volumenkachel** — die Vorlage zeigt „14 / 16
   Sätze". `[cmd]` **Die linke Hälfte ist zählbar** und wird seit G-69
   gezeigt: Sätze je Wurzelgruppe über `workout_sets` →
   `workout_exercises` → `exercise_muscles`, aufgerollt über
   `parent_id` auf die **7 Wurzelgruppen** (Back, Chest, Core, Arms,
   Legs, Neck Muscles, Shoulders). **Die rechte Hälfte fehlt** — die
   Kachel sagt es unter den Balken.
3. **Die Einstufung Beginner…Elite** — `[cmd]` die Vorlage bringt
   **20 Verhältniszahlen** hart mit (vier Übungen × fünf Stufen).
   G-69 hat den Bruch `e1RM ÷ Körpergewicht` gebaut und die Einstufung
   weggelassen, mit dem Grund in der Oberfläche. **Unverändert
   richtig.**

`[cmd]` **Was für die Standards vorhanden wäre:** e1RM auf **90 von
101 Sätzen** (47,8 … 138,0 kg), Bestwerte je Übung auf 30 von 60
`workout_exercises`, Körpergewicht aus `goals.body_measurements` (181
Zeilen, jüngste 85,0 kg am 2026-11-16). **Drei der vier Übungen der
Kachel sind belegt** — Bench (99,3), Squat (126), Deadlift (138);
**OHP fehlt ganz.** Nur die Einstufung fehlt.

**Training score** bleibt Attrappe: `landmarks` geht mit **0,30** in
die Formel ein. Ohne Landmarks ist der Wert nicht rechenbar, und die
0,30 wegzulassen hiesse, eine andere Formel zu behaupten.

### HR zones — keine Spalte, nirgends

`[cmd]` **Es gibt keine Herzfrequenz je Satz oder Sitzung:**
`workout_sets` und `workout_sessions` führen **keine einzige** Spalte
mit `hr`, `heart`, `bpm` oder `zone` im Namen.
`training.heart_rate_samples`, `hr_zones`, `workout_hr` melden
PGRST205.

`[cmd]` **Und die Nachbarwerte sind leer:** `recovery.checkins`
trägt `resting_hr` auf **0 von 170** Zeilen und `spo2_pct` auf **0 von
170**; nur `hrv_rmssd` ist auf **43 von 170** belegt. Das bestätigt
C-127. **Eine Zonenverteilung aus 43 Ruhewerten ohne einen einzigen
Messpunkt während des Trainings gibt es nicht.**

### Offline sync — was es überhaupt bedeuten würde

`[read]` **Der Auftrag hat den Kern benannt: das ist eine Betriebsart,
kein Datenbestand.** Deshalb ausgeschrieben, was die vier Kacheln
behaupten würden:

- **Outbox** — Einträge, die im Gerät liegen und noch nicht beim
  Server sind. Setzt voraus, dass die Anwendung **schreibt, wenn kein
  Netz da ist**, und das Geschriebene lokal vorhält.
- **Sync log** — die Geschichte solcher Übertragungen, mit Zeitpunkt
  und Ergebnis.
- **IndexedDB** — der Ort dieses lokalen Vorrats im Browser, mit
  Füllstand.
- **Conflict resolution** — was gilt, wenn dieselbe Sitzung offline
  und auf einem anderen Gerät geändert wurde.

`[cmd]` **Nichts davon hat heute eine Entsprechung.** Es gibt keine
Warteschlangentabelle (`sync_queue`, `outbox`, `sync_log`: alle
PGRST205), und `workout_sets.logged_via` steht auf **101 von 101**
Zeilen auf `manual` — kein einziger Satz kam je über einen anderen
Weg herein. `workout_sessions.measurement_source` ist auf allen 30
Zeilen `seed`.

`[read]` **Diese vier Kacheln lassen sich auch mit einem Schema nicht
„anbinden".** Sie zeigen den Zustand einer Offline-Fähigkeit, die es
im Produkt nicht gibt. **Erst die Betriebsart, dann die Anzeige** — in
dieser Reihenfolge, nicht umgekehrt. Der Schemaentwurf dafür ist eine
eigene Frage und keine Datenlücke.

### Die Sitzungskarte auf Today

Bleibt Attrappe. `[cmd]` Sie zeigt je Übung `Target` („5×5 @
117.5kg"), `RIR` und `Last session`. **`workout_exercises` führt
`planned_sets`, `planned_reps` und `planned_weight_kg` auf 60 von 60
Zeilen** — das Target wäre also da. **`workout_sets.rir` ist auf 0 von
101 Zeilen belegt**, ebenso `is_pr`. Ohne RIR und ohne PR-Kennzeichen
fehlen zwei der fünf Spalten; die Karte bleibt deshalb ganz beim
Entwurf, statt halb gefüllt zu erscheinen. **Ein eigener, kleiner
Auftrag** — hier nicht ohne Rückfrage angefangen.

---

## Nachweise

`[cmd]` **Angemeldet als `dev@lumeos.app`**, eigener Server auf Port
3207 mit frisch geräumtem `.next`. Screenshots hell und dunkel, vier
Breiten: 1440, 1024, 768, **375 px**. Auf 375 px stapeln beide neuen
Kacheln sauber, der Wochenstreifen bricht auf zwei Reihen um, kein
Seitenüberlauf.

`[cmd]` **Sichtbare Attrappenmarken je Tab**, im Browser gezählt:

| Tab | Marken |
|---|---:|
| Today | **1** |
| Plan | 2 |
| History · Progression · Standards · Calendar | **0** |
| Volume landmarks | 7 |
| HR zones | 7 |
| Offline sync | 5 |
| **gesamt** | **22** |

`[read]` **Die Zahl der `attrappe`-Marken im Text bleibt bei 38** und
ist als Mass untauglich: seit G-74 gilt das RUECKFALL-Muster —
`echt ? <Echt/> : <Entwurf attrappe/>`. Die Marke verschwindet nicht,
wenn eine Kachel echt wird, sie wandert in den Zweig, der nur ohne
Daten greift. **Auf `Today` stehen jetzt vier solcher Zweige** (Weekly
volume und Streak aus G-69, Training readiness und Diese Woche aus
G-86). Gezählt gehört, **was der angemeldete Nutzer sieht.**

`[cmd]` **Zeilenschutz mit zwei anmeldbaren Konten**
(`tools/g86-zeilenschutz.mjs`):

| Konto | Sitzungen | Übungen | Sätze | Scores | Katalog |
|---|---:|---:|---:|---:|---:|
| `dev@lumeos.app` | 30 | 60 | 101 | 170 | 1.416 |
| `test-user@lumeos.local` | **0** | **0** | **0** | **0** | **1.416** |

**Wie verlangt: Sitzungen leer, Katalog sichtbar.** Und es ist eine
Gegenprobe — das zweite Konto meldet sich **erfolgreich** an und sieht
die Sitzungen trotzdem nicht.

`[cmd]` **`pnpm gate --force` grün, 8 von 8, 0 aus dem Zwischenspeicher**
— 411 Tests, 31 statische Seiten.

`[cmd]` **Kein Serverfehler im Browserbündel:** `/login` liefert 200,
`/v2/training` 307 (Anmeldeweiche). Der Import von `ReadinessStand` in
die `'use client'`-Datei ist ein `import type` und wird beim
Übersetzen entfernt — die Falle aus G-74/G-79 greift hier nicht.

### Drei Messfehler der eigenen Arbeit, korrigiert

`[cmd]` **1. Die 1.000-Zeilen-Grenze, wieder.** Der erste Lauf zählte
**0 Sätze je Muskelgruppe**. Ursache: `exercise_muscles` hat 6.588
Zeilen, ein blankes `select` liefert 1.000 **und meldet keinen
Fehler**. Behoben durch `.in()` auf die tatsächlich benutzten Übungen.

`[cmd]` **2. `muscle_groups` schien leer.** Sie hat **95 Zeilen**; die
Abfrage suchte `name_de` und `slug`, die Tabelle führt `name`.

`[cmd]` **3. „Geplante Sitzungen haben keine Übungen" war falsch.**
Der erste Lauf meldete 0 — er filterte auf eine abgeschnittene
ID-Liste. **Alle 14 geplanten Sitzungen haben Übungen**, und alle 60
`workout_exercises` tragen `planned_sets`.

`[read]` **Alle drei hätten in den Bericht gekonnt wie Befunde.** Sie
waren keine — die Datenbank war in Ordnung, die Abfrage nicht.

### Und ein Umstand, der Zeit kostete

`[cmd]` **Der Server verlor sein `.next` mitten im Lauf** — 404 für
jeden Chunk, keine Hydrierung, das Anmeldeformular ging als GET ab,
mit den Zugangsdaten in der URL. **Genau das Bild aus G-82.** Ursache
war diesmal nicht das eigene Räumen, sondern ein paralleler Lauf, der
dasselbe Verzeichnis räumte. **Die Regel des Auftrags gilt
unverändert und hat auch hier geholfen:** räumen *und* neu starten,
auf einem eigenen Port.

`[read]` Dazu die bekannte Reibung: der geteilte Browsertabellen-Tab
wanderte dreimal auf den Server eines anderen Agenten (Port 3310,
`/v2/goals`), einmal startete der Browse-Dienst neu und verlor die
Anmeldung. Kein Produktbefund, aber der Grund, warum die Zählung je
Tab in einem Rutsch läuft.

## Was nicht angefasst wurde

- **Exercises-Tab** (G-64) und die **fünf Sitzungs-Tabs** (G-69) —
  unverändert, ausser den zwei korrigierten Kommentaren zum `status`.
- **Kein Schema geändert** — nur gelesen; `supabase/` gehört Codex.
- **`packages/ui` nicht angefasst.**
- **Keine Schwelle erfunden** — kein MEV/MAV/MRV, kein Zielband, keine
  Einstufung, kein Blockplan.

## Hilfsskripte

Nur lesend, unter `tools/`: `g86-kacheln.mjs` (die 38 Kacheln der
Vorlage), `g86-plan.mjs` (trägt `workout_sessions` den Plan-Tab?),
`g86-readiness.mjs` (die fünf Zeilen gegen `recovery.scores`),
`g86-volumen.mjs` (Sätze je Muskel, Serie, Woche),
`g86-standards.mjs` (e1RM, Körpergewicht, fehlende Tabellen),
`g86-hr-offline.mjs` (HR- und Sync-Spalten), `g86-muskelgruppen.mjs`
(Zeilenzahlen der Katalogtabellen), `g86-marken.mjs` (Marken und
Rückfallzweige), `g86-zeilenschutz.mjs` (zwei Konten),
`g86-neustart.mjs` (`.next` räumen, mit dem Hinweis auf den Neustart).
