# 137 — Phase engine und Physique ratios

**Auftrag G-87** · gemessen am 2026-08-20 gegen die laufende Instanz,
Konto `dev@lumeos.app` (`d15fb34f-…ae1a6`).

Herkunftsmarker: `[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

---

## Was die Phase-Tabelle trägt

`[cmd]` **`goals.goal_phases` hat 14 Spalten und 5 Zeilen.** Der Auftrag
nennt 2 — das stimmt **für `dev@lumeos.app`**; die übrigen drei gehören
einem anderen Konto. Auch die zwei anderen Zahlen des Auftrags zählen
über alle Konten anders als über `dev`: **27 Umfänge** (54 gesamt) und
**93 Körpermessungen bis zum Stichtag** (362 gesamt, 181 für `dev`).

| Spalte | Was drinsteht |
|---|---|
| `phase_type` | `text`, **kein Enum** — belegt sind `maintenance`, `lean_bulk` |
| `variant` | `text` — `baseline`, `moderate`, `performance_placeholder` |
| `parameters` | `jsonb`, frei — heute `source`, `reason`, `note`, `calorie_surplus_kcal` |
| `gueltig_ab` | Start, `NOT NULL` |
| `projected_end_date` | geplantes Ende |
| `actual_end_date` | tatsächliches Ende, leer solange die Phase läuft |
| `transitioned_from` | woher der Wechsel kam |
| `recommended_next` | was als Nächstes empfohlen ist |
| `transition_reason` | Freitext zur Begründung |

`[cmd]` **Die geltende Phase am 2026-08-20:** `lean_bulk` / `moderate`,
`gueltig_ab` 2026-06-04, geplantes Ende 2026-07-18, kein tatsächliches
Ende. Aus `maintenance` gekommen, empfohlen weiter zu `mini_cut`.

### Der Leseweg lag schon da — der Tab hat ihn nicht benutzt

`[cmd]` **`goals.phase_am(user, stichtag)` existiert** und wählt die
zum Stichtag geltende Zeile (`gueltig_ab <= stichtag` und Ende noch
nicht überschritten). **`ladePhase` in `lib/goals/lesen.ts` reicht sie
seit GO-16 bis in `ansicht.tsx` durch**, wo sie im Modulkopf als *„Phase
lean bulk"* erscheint.

**Der Tab „Phase engine" hat die Requisite nie angenommen** —
`GoalsPhaseView()` nahm keine Argumente. Das war die ganze Lücke.

### Ein Fund: `phase_am()` liefert 8 der 14 Spalten

`[cmd]` Geprüft gegen `pg_get_function_result`: die Funktion gibt
`phase_id, goal_id, phase_type, variant, parameters, gueltig_ab,
projected_end_date, actual_end_date` — **`transitioned_from`,
`recommended_next` und `transition_reason` fehlen in ihrer Signatur.**

**Die Funktion wurde nicht geändert** — das Schema gehört Codex. `[read]`
Stattdessen liest `ladePhase` die drei Spalten je Zeile nach, dasselbe
Muster wie `lib/medical/lesen.ts` (G-80) für `fasting_status`. Der
Zeilenschutz greift dabei mit, unten gemessen.

### Was gerechnet wird — und dass es gerechnet ist

`[read]` **Die Regel aus C-119:** *„Wenn ein Wert gerechnet wird und
daneben gespeichert steht, muss klar sein, welcher gilt."*

`[cmd]` **Hier steht nichts daneben:** `goal_phases` führt **weder Woche
noch Adhärenz noch Fortschritt**. Woche, Tage bisher und Restdauer sind
Differenzen aus `gueltig_ab` und dem Ende gegen den Stichtag. **Das
steht als Satz an der Kachel**, damit niemand die gerechnete Woche für
eine gespeicherte hält.

`[cmd]` **Ein Anzeigefehler der eigenen Arbeit, im Browser gefunden:**
Die Kachel sagte zuerst **„Woche 12 von 7"** — beide Zahlen richtig
(77 Tage gelaufen, 44 geplant), die Fügung sinnlos. Über das geplante
Ende hinaus gibt es kein „von"; jetzt steht dort *„Woche 12 · 33 Tage
über das geplante Ende"*, und die Kennzahl heisst **„Tage überzogen 33"**
statt „Tage übrig −33". **Der Typecheck sah das nicht** — nur die
gerenderte Seite.

---

## Welche Verhältnisse rechenbar sind

`[cmd]` **Die Umfänge liegen in `goals.body_circumferences`, nicht in
`body_measurements`** — 54 Zeilen gesamt, **27 für `dev@lumeos.app`**,
vom 2026-05-20 bis 2026-11-16. **Alle 13 Stellen sind auf allen 27
Zeilen belegt**, keine Lücke.

`[cmd]` **Bis zum Stichtag zählen 14 Sätze**, der jüngste vom
**2026-08-19**. Die 13 weiteren liegen in der Zukunft und zählen nicht
mit — `ladeUmfaenge` schneidet mit `lte` ab.

### Die Tabelle deckt das Mockup vollständig

`[cmd]` Die 13 Stellen der Vorlage (`daten.ts:CIRCUMFERENCES`) haben
jede eine Spalte: `neck_cm`, `shoulders_cm`, `chest_cm`,
`upper_arm_left/right_cm`, `forearm_left/right_cm`, `waist_cm`,
`hip_cm`, `thigh_left/right_cm`, `calf_left/right_cm`.

**`shoulders_cm` ist der wichtige Fund** — damit ist Schulter zu Taille
direkt messbar, ohne Umweg.

### Gerechnet, gegen SQL geprüft

`[cmd]` Am **2026-08-19**, gegengerechnet mit
`round(waist_cm/hip_cm, 3)` usw. in psql:

| Verhältnis | Wert | Zutaten |
|---|---:|---|
| Schulter : Taille | **1,492** | 123,8 : 83,0 cm |
| Taille : Hüfte | **0,860** | 83,0 : 96,5 cm |
| Brust : Taille | **1,298** | 107,7 : 83,0 cm |
| Arm : Oberschenkel | **0,649** | 39,0 : 60,0 cm (Mittel beider Seiten) |
| Arm-Symmetrie | **99,4 %** | L 38,7 · R 39,2 cm |
| Bein-Symmetrie | **99,6 %** | L 59,8 · R 60,3 cm |

**Die Zutaten stehen unter jeder Zahl** — ein Quotient ohne seine zwei
Messwerte ist nicht nachrechenbar.

`[read]` **Die Symmetrie ist die Formel der Vorlage**, übernommen statt
neu erfunden (`min / Mittel × 100`, `module-goals-pro.jsx:180-192`). Sie
ist Arithmetik: **100 % heisst gleich lang, nicht gut.**

### Körperfett wird nicht neu gerechnet

`[cmd]` `goals.body_composition_navy` liefert am 2026-08-19:
**11,03 %** (Spanne 7,53 – 14,53), FFMI 21,64, fettfreie Masse 75,1 kg,
Gewicht 84,41 kg, Verfahren `navy_circumference`.

**Der Warnhinweis der Funktion steht mit an der Kachel** — *„Standard­fehler
ca. ±3,5 Prozentpunkte; kann Athleten mit hoher Muskelmasse
überschätzen; Quellen nicht mischen."* `[read]` Eine Zahl ohne ihre
Unsicherheit wäre genauer, als das Verfahren ist.

`[cmd]` **Der Auftrag nennt 11,38 %** — das ist ein anderer Stichtag.
Am 2026-08-19 sagt dieselbe Funktion 11,03 %.

---

## Was eine Quelle bräuchte

`[cmd]` **Gesucht in `supabase/`, `docs/spezifikation/` und
`referenz/lumeos-2026/`:**

| Grösse | Fundort | Urteil |
|---|---|---|
| `1.618` „golden target" | nur `theme-v1/uploads/` (SCORING.md, FEATURES.md, CONSOLIDATED_KNOWLEDGE.md) | **Begleitdateien des Entwurfs, keine Spezifikation** |
| V-Taper score (0–100) | ebenda, als `min(100, round(schulter/taille/1.618*100))` | hängt am selben unbelegten 1,618 |
| Steve Reeves score | dieselben Dateien nennen ihn, **ohne Formel** | `daten.ts:438` gibt fest **`88`** zurück — gar keine Rechnung |
| FFMI-Bänder (18–20 … 25+) | nur die Vorlage | Schwellen ohne Quelle |

**Keine der vier steht in der Datenbank.**

`[read]` **Deshalb bleiben sie Attrappe** — dieselbe Regel wie bei
MEV/MAV/MRV (C-105) und den Injektions-Ruhefenstern (C-109): *eine Zahl
ohne Beleg wird nicht gebaut.* Die angebundene Kachel sagt an Ort und
Stelle, warum kein Zielwert dasteht, statt die Stelle stillschweigend
leer zu lassen.

### Ein Kandidat mit echter Quelle — aber nicht von mir entschieden

`[cmd]` **Taille : Hüfte ist die einzige mit einer belegbaren Schwelle.**
`referenz/lumeos-2026/.../goal-measurements.ts:119` führt
`target: '<0.90 (M) / <0.80 (F)'` — die WHO-Grenzwerte von 2008.

**Nicht gebaut.** `[read]` Eine Zeichenkette im Vorgängerrepo ist ein
Hinweis, keine Freigabe; und ein Grenzwert, der Geschlecht voraussetzt,
ist eine Produktentscheidung. **Das ist eine Frage an Tom**, kein Fund,
den ich still einbaue.

### Und was ohne Quelle trotzdem wegfällt: die Farbe

`[cmd]` Die Vorlage färbt in der Umfangstabelle eine **wachsende Taille
rot und einen wachsenden Arm grün** (`tab-physique.tsx:99-101`).

`[read]` **Das ist eine Bewertung** — welche Richtung erwünscht ist,
hängt vom Ziel ab, und in einer Diät wäre die Färbung genau falsch
herum. Die angebundene Tabelle zeigt die Differenz **mit Vorzeichen,
ohne Farbe**. Sie sagt dasselbe ohne Urteil.

---

## Was Attrappe bleibt

`[cmd]` **Gerenderte Marken: 23 → 14.** Die Entwurfsdateien behalten
alle 23 (sie bleiben Rückfall); gezählt ist, was die angemeldete
Nutzerin sieht.

| Fläche | Marken | Grund |
|---|---:|---|
| **Phase engine** | **−5** | **angebunden** |
| **Physique ratios** | **−4** | **angebunden** |
| Adaptive TDEE (Rest) | 5 | Neun-Wochen-Kurve und Herleitung brauchen eine Historie; Kopfkachel ist seit GO-16 echt |
| Cross-module | 5 | kein Modul postet Beiträge |
| Pose sessions | 3 | braucht Dateiablage, Posenkatalog, Bildmodell |
| `ansicht.tsx` | 1 | |

### Was die Phase-Attrappe zeigt und die Tabelle nicht trägt

`[cmd]` Keine dieser Grössen hat eine Spalte in `goal_phases`:

- *„week 9 of 20"*, *„adherence 94 %"*, *„on track"*
- *„Weight trend −0,18 kg/wk"*, *„Strength +4,2 %"*, *„Body fat −0,12 %/wk"*
- *„Weekly auto-adjustment"* mit `confidence 0.88`
- *„Suggested transition in 4 weeks"* — der **Zeitpunkt** fehlt; nur
  `recommended_next` als Text ist da
- sieben Phasentypen mit Varianten, Guards, Exits, Erfolgsmassen
- *„Expert BB annual"*, der 12-Monats-Zyklus

**Der Entwurf kennt sieben Phasenarten; die Datenbank hat keinen Enum**
— `phase_type` ist freier Text, belegt sind zwei Werte. Welche Arten
gelten sollen, ist offen.

`[cmd]` **Der Phase-Editor** (`phase-editor.tsx`, 795 Zeilen, 0 Marken)
**schreibt nicht**: jedes „Apply" öffnet `InEntwicklungKnopf`. Er
bearbeitet eine tiefe Kopie der Entwurfsdaten. **Nicht angefasst** — ein
Schreibpfad war nicht beauftragt.

`[cmd]` **Eine überholte Begründung gefunden:** der Knopf „Switch to …"
sagt *„Ein Phasenwechsel braucht `goals.goal_phases` — die Tabelle gibt
es noch nicht (GO-07)."* **Die Tabelle gibt es**, mit 5 Zeilen. Der
Knopf bleibt gesperrt (Schreiben war nicht beauftragt), aber die
Begründung nennt einen falschen Grund.

---

## Nachweis

| Prüfung | Ergebnis |
|---|---|
| Typecheck + Tests + Build, ohne Cache erzwungen | **3/3 grün** |
| Tests | **411 grün, 0 rot** (vorher 393 — **18 neue**) |
| `next build` | `/v2/goals` baut, 34,3 kB |
| `pnpm gate` (gecacht) | 8/8 · `lint` siehe Einschränkung unten |
| Gerenderte Marken | **23 → 14** |
| Verhältnisse gegen SQL | **0,860 / 1,492 / 0,649** am 2026-08-19 — Anzeige und psql identisch |
| Phase gegen SQL | `lean_bulk` / `moderate`, 2026-06-04 → 2026-07-18, `maintenance` → `mini_cut` |
| Angemeldet | `dev@lumeos.app`, beide Tabs bebildert, **hell und dunkel** |
| Breiten | **1440 · 1024 · 768 · 375 px** — **kein Seitenüberlauf** bei 375 (`body.scrollWidth == innerWidth == 375`, Karten `scrollWidth == clientWidth`); alle 13 Zeilen und alle vier Verhältnisse lesbar |
| Zeilenschutz | `test-user@lumeos.local`: **0 eigene Phasen, 0 fremde Phasen, 0 Umfänge, 0 Zeilen in `goal_phases`** — auch beim ausdrücklichen Abfragen der fremden UUID |

### Je gebauter Kachel: welche Spalte sie speist

| Kachel | Quelle |
|---|---|
| Phasenkopf (Art, Variante, laufend) | `phase_type`, `variant`, `actual_end_date` |
| Start · Geplantes Ende · Tage | `gueltig_ab`, `projected_end_date` — Tage **gerechnet** |
| Phasenwechsel | `transitioned_from`, `recommended_next`, `transition_reason` (nachgelesen) |
| Phase parameters | `parameters` (jsonb, unverändert gezeigt) |
| Zeile | `id`, `goal_id`, die drei Daten |
| Physique ratios | `shoulders_cm`, `waist_cm`, `hip_cm`, `chest_cm`, `upper_arm_*`, `thigh_*` |
| 13 Umfangsstellen | alle 13 Spalten, zwei jüngste Sätze |
| Körperzusammensetzung | `goals.body_composition_navy` (nicht neu gerechnet) |
| Messreihe | Anzahl und Datumsspanne aus `ladeUmfaenge` |

### Zwei Einschränkungen, offen gesagt

`[cmd]` **1. `lint` bricht repoweit ab — vor dieser Arbeit und ohne
Bezug zu ihr.** `next lint` findet in `@lumeos/web` wie in
`@lumeos/admin` keine ESLint-Konfiguration und stellt stattdessen eine
interaktive Rückfrage; der Schritt ging bisher nur über den
Turbo-Cache durch. **Derselbe Befund steht schon in
`134-medical-score.md`.** `typecheck`, `test` und `build` laufen ohne
Cache erzwungen durch: **3/3, 411 Tests grün, `/v2/goals` baut mit
34,3 kB.** Der gecachte `pnpm gate` meldet 8/8.

`[cmd]` **Ein Zwischenlauf hatte den `build` scheitern lassen** —
Fehler in `apps/web/src/app/v2/training/` (untracked, paralleler
Agent) und einmal eine Kollision im geteilten `.next`. **Beides war
vorübergehend**; nach seinem Abschluss läuft alles durch. `goals/` war
in jedem einzelnen Lauf fehlerfrei.

`[cmd]` **2. Die Bildschirmfotos haben drei Anläufe gebraucht.** Zwei
Agenten teilten sich eine Browsersitzung; die fremden Navigationen haben
meine überschrieben, bis hin zur Abmeldung. Dazu kam ein
`ChunkLoadError`, weil mein `next build` dem laufenden Entwicklungsserver
die Chunks unter den Füssen weggeschrieben hatte — **genau der Fall, vor
dem der Auftrag warnt.** `[read]` Die Lösung war die vorgeschriebene:
`.next` löschen **und** den Server neu starten, beides zusammen, auf
einem eigenen Port. **Danach sauber, alle vier Breiten aufgenommen.**

## Geändert

| Datei | |
|---|---|
| `apps/web/src/lib/goals/verhaeltnisse.ts` | **neu** — die reine Rechnung |
| `apps/web/src/app/v2/goals/phase-echt.tsx` | **neu** — der angebundene Phase-Tab |
| `apps/web/src/app/v2/goals/physique-echt.tsx` | **neu** — die angebundenen Verhältnisse |
| `apps/web/src/lib/goals/__tests__/verhaeltnisse.test.ts` | **neu** — 10 Prüfungen |
| `apps/web/src/app/v2/goals/__tests__/phasenlauf.test.ts` | **neu** — 8 Prüfungen |
| `apps/web/src/lib/goals/lesen.ts` | drei Übergangsspalten nachgelesen |
| `apps/web/src/app/v2/goals/ansicht.tsx` | beide Tabs verdrahtet, Ladefehler deckt sie mit ab |

## Offen — für Tom

1. **Taille : Hüfte hat als Einzige eine belegbare Schwelle** (WHO 2008,
   `<0,90` M / `<0,80` F, im Vorgängerrepo hinterlegt). Einbauen —
   oder aus demselben Grund weglassen wie die anderen?
2. **`phase_type` hat keinen Enum.** Der Entwurf kennt sieben Arten, die
   Datenbank zwei belegte Werte. Welche gelten?
3. **`phase_am()` liefert 8 der 14 Spalten.** Heute nachgelesen; sauberer
   wäre die Funktion — das ist ein Codex-Auftrag.
4. **Die Sperrbegründung am Knopf „Switch to …" ist überholt** — sie
   nennt eine Tabelle, die es seit GO-07 gibt.
5. **Der Phase-Editor schreibt nicht** (795 Zeilen, jedes „Apply" öffnet
   `InEntwicklung`). Ein Schreibpfad war nicht beauftragt.
