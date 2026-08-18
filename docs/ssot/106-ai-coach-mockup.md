# AI Coach als Attrappe (G-42)

**Stand:** 2026-08-18 · **Auftrag:** G-42 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

---

## Kurzfassung

`[cmd]` **`Coach → AI Coach` ist gebaut, vollstaendig: zwanzig Tabs,
42 von 42 Posten**, gezaehlt mit `tools/vollstaendigkeit.mjs`. Damit
sind beide Unterbereiche des Menuepunkts fertig — Human Coaches seit
G-40 (60 von 60), AI Coach seit jetzt.

`[cmd]` Die Platzhalterseite aus G-40, die die zwanzig fehlenden Tabs
namentlich nannte, ist abgeloest.

**Die Frage des Auftrags — „elf Zulieferer haben keine eigene Datei" —
hat eine andere Antwort als vermutet: alle fuenfzehn sind vorhanden.**
Einer davon liegt allerdings in einer *Coach*-Datei, nicht in einer
Buddy-Datei. Abschnitt 1.

| | |
|---|---|
| Route | `/v2/coach/ai` |
| Rahmen der Vorlage | `BuddyModule` (`module-buddy.jsx:67`) |
| Tabs `[cmd]` | **20** (der Auftrag nannte zwoelf) |
| Posten `[cmd]` | **42 von 42** |
| Vorlage | 4 Dateien, 1.746 Zeilen |
| Karten / Marken `[cmd]` | 46 / 46 |
| Konsolenfehler `[cmd]` | **0** |

`[cmd]` **Null Konsolenfehler** — nicht eins. Der sonst uebliche
Grundwert (`Extra attributes from the server: data-mode` aus
`RootLayout`) trat bei den Messungen dieser Seite nicht auf.

---

## 1. Wo die elf fehlenden Zulieferer stecken

### Sie fehlen nicht

`[read]` Der Auftrag: *„Elf Zulieferer haben keine eigene Datei.
Entweder stecken sie in `-engines.jsx`, oder sie liegen woanders — wie
`PhotoUploadPanel` und der Stress-Tab, die in
`module-crossmodule-rest.jsx` lagen. Miss das zuerst."*

`[cmd]` Gemessen. **Alle fuenfzehn sind vorhanden**, verteilt auf vier
Dateien:

| Datei | Zulieferer | Anzahl |
|---|---|---|
| `module-buddy-engines.jsx` | Tiers, Engines, Journey, Watcher, BSS, Signature, Interventions, Safety, Butler | **9** |
| `module-buddy-knowledge.jsx` | Knowledge, Rules, Clone | **3** |
| `module-buddy-voice.jsx` | Voice | **1** |
| `module-coach-meta.jsx` | **CoachOverrides** | **1** |
| im Rahmen selbst | Chat, Feed, MemoryView, Decisions, Settings, StatesShowcase, OrbModule | 7 lokal |

**Neun der elf steckten tatsaechlich in `-engines.jsx`** — die
Vermutung des Auftrags war fuer diese neun richtig. Drei weitere liegen
in `-knowledge.jsx`, das der Auftrag als vorhanden gefuehrt hat.

### Der eine, der woanders liegt

`[cmd]` **`BuddyCoachOverrides` ist in `module-coach-meta.jsx:161`
definiert** — einer Datei der Modulfamilie *Human Coaches*. Der
Buddy-Rahmen ruft sie an `module-buddy.jsx:132`:

```js
{tab === "overrides" && window.BuddyCoachOverrides && <window.BuddyCoachOverrides/>}
```

`[cmd]` Ein Grep nach `BuddyCoachOverrides` in `theme-v1/` liefert
**genau zwei Treffer**: den Aufruf und die Definition. Das ist genau
das Muster, das der Auftrag mit `PhotoUploadPanel` und dem Stress-Tab
beschrieben hat — nur dass es hier **einmal** auftritt, nicht elfmal.

**Warum das ueberhaupt geht:** `[cmd]` Die Vorlage laedt alle Dateien
in denselben Skript-Gueltigkeitsbereich und reicht Komponenten ueber
`window` weiter. **Die Dateizuordnung ist damit rein thematisch, nicht
technisch** — eine Komponente kann in jeder Datei stehen, solange sie
vor dem Aufruf geladen ist. Fuer die Uebernahme heisst das: die
Umsetzung importiert `COACH_OVERRIDES` aus `../daten`, also aus dem
Human-Coaches-Modul, statt die Daten zu verdoppeln.

`[annahme]` Thematisch gehoert der Tab dorthin, wo er steht: er zeigt,
**was Trainer an Buddy verstellt haben** — eine Aussage ueber die
Trainerbeziehung, dargestellt im Buddy-Modul.

### Was die Regel „nicht nur nach `window.` greppen" hier ergab

`[cmd]` Der Auftrag warnte, bei Medical habe ein `window.`-Grep nichts
gefunden, obwohl der Rahmen acht Modale als blosse Globale rief.
**Hier ist es umgekehrt:** der Buddy-Rahmen ruft **ausschliesslich**
ueber `window.X`, sauber und vollstaendig. Die Falle lag woanders — in
der **Exportzeile**:

```js
Object.assign(window, { TIERS, GATED_FEATURES, hasFeature, … });
```

`[cmd]` Diese Zeile fuehrt **nur Daten**, keine der neun Komponenten.
Die Komponenten werden einzeln per `window.BuddyBSS = () => …`
zugewiesen. **Wer die `Object.assign`-Zeile fuer das Inhaltsverzeichnis
der Datei haelt, findet neun von zwoelf Zulieferern nicht.**

`[cmd]` Elf Konstanten stehen ebenfalls nicht in dieser Zeile und sind
trotzdem Inhalt, weil die Ansichten sie lesen: `TIER_LABEL`,
`TIER_PRICE`, `tierRank`, `PATH_LOG`, `DOW`, `PERSONA_LABEL`,
`WATCHER_ALERTS`, `INTERVENTION_LOAD`, `GATE_LOG`, `BUTLER_LOG`,
`STATE_COLOR`. Alle uebernommen.

---

## 2. Die Zaehlung je Tab

`[cmd]` Gezaehlt mit `tools/vollstaendigkeit.mjs`, dem geteilten
Werkzeug.

```
=== COACH-AI ==========================================
  OK   BuddyBSS                 0 Unterkomp., 0 Kacheln
  OK   BuddyButler              0 Unterkomp., 0 Kacheln
  OK   BuddyChat                1 Unterkomp., 1 Kacheln
  OK   BuddyClone               0 Unterkomp., 0 Kacheln
  OK   BuddyCoachOverrides      0 Unterkomp., 0 Kacheln
  OK   BuddyDecisions           0 Unterkomp., 1 Kacheln
  OK   BuddyEngines             0 Unterkomp., 0 Kacheln
  OK   BuddyFeed                0 Unterkomp., 0 Kacheln
  OK   BuddyInterventions       0 Unterkomp., 0 Kacheln
  OK   BuddyJourney             0 Unterkomp., 0 Kacheln
  OK   BuddyKnowledge           0 Unterkomp., 0 Kacheln
  OK   BuddyMemoryView          0 Unterkomp., 0 Kacheln
  OK   BuddyRules               0 Unterkomp., 0 Kacheln
  OK   BuddySafety              0 Unterkomp., 0 Kacheln
  OK   BuddySettings            0 Unterkomp., 5 Kacheln
  OK   BuddySignature           0 Unterkomp., 0 Kacheln
  OK   BuddyStatesShowcase      0 Unterkomp., 1 Kacheln
  OK   BuddyTiers               0 Unterkomp., 0 Kacheln
  OK   BuddyVoice               0 Unterkomp., 5 Kacheln
  OK   BuddyWatcher             0 Unterkomp., 0 Kacheln
  OK   (Daten/Formeln)          7 Stueck
  42 von 42 vorhanden.
```

`[cmd]` Im Browser gegengezaehlt, weil eine Zaehlung im Quelltext nicht
belegt, dass etwas ankommt. Je Tab die Kartenzahl und ein Kennsatz der
Vorlage:

| Tab | Karten | Kennsatz gefunden |
|---|---|---|
| Chat | 3 | Threads · training prep · persona · online |
| Insights feed | 7 | „Pre-workout window opens" |
| Memory | 2 | „What Buddy knows about you" |
| Decisions | 2 | „Decision feed" |
| Personality | 6 | „how Buddy speaks to you" |
| Avatar states | 2 | „5 states reflect what Buddy is doing" |
| Plan & gate | 3 | „feature gate is middleware" |
| Engines | 5 | „deterministic" |
| Journey | 6 | „Heartbeat" |
| Watcher | 4 | „Watcher rules" |
| BSS | 6 | „Behavior Stability Score · rolling 90d" |
| Signature | 5 | „Behavioral signature" |
| Interventions | 4 | „Intervention log" |
| Safety | 3 | „Policy gate" |
| Butler | 4 | „Recent actions" |
| Voice / Live | 6 | „Session state machine" |
| Knowledge | 6 | „Knowledge base" |
| Rules | 2 | „Your rules" |
| Coach overrides | 2 | „What your coaches changed about me" |
| Clone & Gym | 4 | „AI Clone · Anders Lindqvist" · McFit |

`[cmd]` **46 Karten, 46 Marken.** Ein Test prueft nicht die Zahl,
sondern dass **keine Karte ohne Marke** dasteht.

### Was die Zaehlung an ihrer Grenze zeigte

`[cmd]` Zwei Nachbesserungen am geteilten Werkzeug, beide im Skript
begruendet:

1. **Der Verzeichnisname folgte dem Modulnamen.** `coach-ai` suchte
   unter `v2/coach-ai` — ein Verzeichnis, das es nicht gibt und nicht
   geben soll, weil die Route `/v2/coach/ai` lautet. Jetzt traegt ein
   Modul seinen Pfad bei Bedarf selbst ein (`verzeichnis`).
2. **`module-coach-meta.jsx` fehlte in der Dateiliste.** Ohne sie
   meldete die Zaehlung `BuddyCoachOverrides` als fehlend und haette
   seine Vorlage nie gefunden — genau der Fall, vor dem Zaehlregel 2
   warnt („gesucht wird in ALLEN Vorlagendateien eines Moduls").

`[cmd]` Beide Aenderungen gegen alle acht Module geprueft: kein anderes
Modul verschiebt sich.

`[cmd]` Ein Posten ist eine belegte Umbenennung, kein Bau:
`BuddyOrbModule` heisst hier `BuddyOrb` — das `-Module`-Suffix faellt
ab, weil er ein Baustein ist, kein Modul. Begruendung in der
`UMBENANNT`-Tabelle.

---

## 3. Was `uploads/` anders sagt als `docs/specs/`

**Nichts. Und das ist selbst der Befund.**

`[read]` Der Auftrag: *„`uploads/` enthaelt die Spec-Dateien, die
Claude Design bekommen hat — mit Hash im Namen. Wo `uploads/` und
`docs/specs/` auseinanderlaufen: melden. Der Entwurf ist nicht
automatisch veraltet — bei den TDEE-Formeln war die Vorlage genauer als
die Spec."*

`[cmd]` Gemessen mit Byte-Vergleich ueber alle sieben Buddy-Specs, die
in beiden Baeumen liegen:

| Spec | `docs/specs/` | Fassung in `uploads/` | Vergleich |
|---|---|---|---|
| `INDEX.md` | 176 Zeilen | `INDEX-a9aa700c.md` | **identisch** |
| `SPEC_01_MODULE_CONTRACT.md` | 146 | `-8f8224b7.md` | **identisch** |
| `SPEC_02_ENTITIES.md` | 319 | `-f38431ab.md` | **identisch** |
| `SPEC_04_FEATURES.md` | 559 | `-aadfc7f5.md` | **identisch** |
| `SPEC_07_API.md` | 630 | `-5f16d3af.md` | **identisch** |
| `SPEC_09_SCORING.md` | 414 | `-8a1632fa.md` | **identisch** |
| `SPEC_10_COMPONENTS.md` | 263 | `-d99c9f3e.md` | **identisch** |

`[cmd]` **Der Hash unterscheidet Module, nicht Fassungen.** Beleg an
den Kopfzeilen derselben Spec-Nummer:

```
SPEC_09_SCORING-8a1632fa.md   # Buddy / AI Coach Module — Scoring Engine (Spec)
SPEC_09_SCORING-d4545dde.md   # Training Module — Scoring Engine
SPEC_09_SCORING.md            # Nutrition Module — Scoring Engine
```

`[cmd]` `uploads/` fuehrt 128 Dateien: dieselben Spec-Nummern fuer
jedes Modul, mit Hash zur Unterscheidung; die unbehashte Fassung
gehoert Nutrition.

**Fuer diesen Auftrag heisst das: es gibt keinen Widerspruch zu
melden.** Die vier Begriffe des Auftrags — `clone`, `bss`, `signature`,
`butler` — stehen in beiden Baeumen gleichlautend, und die Vorlage
setzt sie um, wie beide sie beschreiben:

| Begriff | Spec | Was die Vorlage zeigt |
|---|---|---|
| `bss` | `SPEC_09_SCORING` | Formel `stability × 0.6 + alignment × 0.4`, fuenf Stabilitaets- und vier Ausrichtungswerte, 90-Tage-Verlauf |
| `signature` | `SPEC_04_FEATURES` | vier Muster mit Konfidenz und Stichprobengroesse, ab acht Wochen (`minWeeks: 8`) |
| `butler` | `SPEC_07_API` | sechs Intents, Konfidenzschwelle 0.80, Vorschau nur bei Mahlzeiten |
| `clone` | `SPEC_10_COMPONENTS` | Methodik, Eskalation an den Trainer, Antwortprotokoll |

`[annahme]` Bei den TDEE-Formeln war die Vorlage genauer als die Spec;
hier ist kein solcher Fall aufgefallen. Geprueft ist die
**Byte-Gleichheit der Dateien**, nicht jede Aussage der Vorlage gegen
jeden Satz der Spec.

---

## 4. Was im Vorgaengerrepo danebenliegt

`[cmd]` Selbst nachgemessen.

### Die Groessenordnung

`[cmd]` **Sechs Migrationen mit `buddy` im Namen, zusammen 650 Zeilen,
13 Tabellen** — der Auftrag nannte zwei:

```
052_buddy_v1_foundation.sql   coach_rules, buddy_decisions, buddy_daily_state
053_buddy_v2_trends.sql       trend_metrics, trend_events, training_adaptations,
                              compliance_metrics, buddy_weekly_reports
055_buddy_events.sql          buddy_events
057_buddy_knowledge_rag.sql   buddy_knowledge  (pgvector 384)
058_buddy_automations.sql     buddy_automations, buddy_automation_runs
20260316_buddy_memories.sql   buddy_memories
```

`[cmd]` Der Code dazu, gemessen in Zeilen:

| Datei | Zeilen |
|---|---|
| `src/api/coach/routes/buddy.ts` | **1.647** |
| `src/api/coach/utils/buddyWatcher.ts` | **922** |
| `src/api/coach/security/buddySecurity.ts` | 721 |
| `src/api/coach/utils/multiUserBuddy.ts` | 620 |
| `src/modules/human-coach/components/BuddyDashboard.tsx` | 802 |

`[read]` Der Auftrag: *„Aber es lag unter `coach/`, nicht als eigenes
Modul."* Bestaetigt — der gesamte Buddy-Code liegt unter
`src/api/coach/` und `src/modules/coach/`, es gibt kein
`src/modules/buddy/`.

### Was eins zu eins passt

`[cmd]` **`behavioral_signatures`** (`046_intervention_notification_system.sql:9`)
fuehrt genau die Mustertypen der Vorlage:

```sql
pattern_type TEXT NOT NULL CHECK (pattern_type IN (
  'stress_skip', 'motivation_type', 'dropout_risk',
  'protein_collapse', 'time_preference', 'response_preference'
)),
detected BOOLEAN, confidence NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
sample_size INT, hits INT, first_observed TIMESTAMPTZ
```

Die Vorlage zeigt vier Muster — `stress_pattern`, `protein_collapse`,
`dropout_risk`, `motivation_type` — **mit Konfidenz und `n`**. Das ist
dieselbe Struktur, bis auf die Namensform des ersten. **Der
Signature-Tab ist der bindungsreifste des Moduls.**

`[cmd]` `buddy_decisions` (`052`) fuehrt `decision_type`, `reasoning`,
`action_status` und — aus `20250320235500_coach_override_system.sql` —
`override_status` und `override_coach_id`. Das deckt den
Decisions-Tab **und** den Tab „Coach overrides".

`[cmd]` `buddy_knowledge` (`057`) ist pgvector mit 384 Dimensionen,
HNSW-Index und deutschem Volltextindex — die Grundlage des
Knowledge-Tabs, dort als „pgvector · 5 of 1,240" dargestellt.

### Drei Unterschiede, die beim Anbinden zaehlen

`[cmd]` **1. BSS gibt es nicht.** Gesucht nach `stability_score` und
`behavior_stability` in `src/`, `supabase/` und `packages/` —
**nichts gefunden.** Der BSS-Tab ist der einzige des Moduls, fuer den
im Vorgaengerrepo keine Entsprechung liegt; er kommt aus
`SPEC_09_SCORING` und ist dort fuer `packages/scoring/src/buddy.ts`
vorgesehen. **Neu zu bauen, nicht zu uebersetzen.**

`[cmd]` **2. Drei Stufen statt vier.** `tier-service.ts` (342 Zeilen)
kennt `free`, `premium`, `pro`. Die Vorlage kennt `free`, `plus`,
`pro`, `elite` — und haengt eine fuenfte Marke `coach` an das Merkmal
`ai_clone`, die in keiner Stufenliste steht. Wer anbindet, entscheidet
zuerst, welche Stufenleiter gilt.

`[cmd]` **3. Voice ist nirgends gebaut.** Gesucht nach `whisper`,
`speechSynthesis` und `parseGymCommand` in `src/` — **nichts
gefunden.** Im Vorgaengerrepo sind `voice_coaching` und `custom_voice`
reine Merkmalsschalter in `tier-service.ts`; es gibt keine
Spracherkennung, keinen Befehlsparser, keine Sitzungsmaschine. **Der
Voice-Tab ist damit — neben BSS — der zweite, der nicht uebersetzt,
sondern gebaut werden muesste.**

`[annahme]` Der Musterabgleich der Vorlage
(`module-buddy-voice.jsx:16-26`, neun Regeln, deutsch und englisch)
ist der konkreteste Entwurf, der dafuer vorliegt.

### Eine Kleinigkeit mit Folgen

`[cmd]` Fuenf Persoenlichkeiten hier wie dort — aber die fuenfte heisst
verschieden: `personas.ts` fuehrt `sensei`, die Vorlage `zen` („Zen
Master"). Die uebrigen vier stimmen ueberein (`scientist`,
`motivator`, `drill_sergeant`/`drill`, `best_friend`/`friend`).
`[annahme]` Kosmetisch, solange die Kennung nicht zum Datenbankschluessel
wird.

---

## 5. Was gebaut wurde

```
apps/web/src/app/v2/coach/ai/
├── page.tsx           Metadaten, CSS — loest die G-40-Platzhalterseite ab
├── ansicht.tsx        Rahmen + Chat, Feed, Memory, Decisions,
│                      Personality, Avatar states
├── tab-motoren.tsx    Tiers, Engines, Journey, Watcher, BSS, Signature,
│                      Interventions, Safety, Butler
├── tab-wissen.tsx     Knowledge, Rules, Clone & Gym
├── tab-stimme.tsx     Voice / Live
├── tab-overrides.tsx  Coach overrides  (Vorlage: module-coach-meta.jsx)
├── orb.tsx            Der Buddy-Orb, fuenf Zustaende
├── kontext.tsx        persona · autonomy · tier
├── daten.ts           Entwurfsdaten aus zwei Vorlagendateien
├── bausteine.tsx      PunktPill — was packages/ui fehlt
└── buddy.css          acht Modul-Raster
```

### Geaendert ist nur das Technische

1. JSX ohne Typen → TypeScript, `strict`.
2. Klassen auf `v2-`-Praefix.
3. `window.X` → Importe.
4. `@media`-Haltepunkte bei 1100px, weil die Vorlage keine hat.
5. `arr_r` → `arrow_right`.
6. `React.useId()` fuer die SVG-Kennungen des Orbs.

Nicht geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
Anordnung angepasst.

### Die eine noetige Abweichung

`[cmd]` Der Orb vergibt in der Vorlage feste SVG-Kennungen
(`borb-${state}`, `bblur-${state}`, `module-buddy.jsx:146`). Der Tab
„Avatar states" zeigt **alle fuenf Zustaende gleichzeitig**, und der
Chat zeigt `responding` erneut — **zwei Elemente mit derselben Kennung
auf einer Seite.** Der zweite Verlauf gewinnt, beide Orbs sehen gleich
aus.

`[read]` Dieselbe Falle hat in G-21 die Koerperkarte getroffen
(`clipPath` mit fester Kennung, zwei Karten auf einer Seite). Dieselbe
Loesung, diesmal von vornherein: `React.useId()`. Im Bildschirmfoto
sind die fuenf Orbs verschieden gefaerbt — waeren die Kennungen
kollidiert, waeren sie es nicht.

---

## 6. Die Pruefungen

`[cmd]` `pnpm gate` — **8 von 8 Aufgaben gruen.**
`[cmd]` `v2-attrappen.test.ts` — **53 Tests, 53 gruen**, davon acht neu.
`[cmd]` `tools/vollstaendigkeit.mjs coach-ai` — **42 von 42.**

Im Browser, gegen `localhost:3200`:

`[cmd]` **Alle zwanzig Tabs: null Fehler, null Hydrationsabweichungen.**
Jeder Tab auf einen Kennsatz der Vorlage geprueft (Tabelle in
Abschnitt 2).

`[cmd]` Die Tableiste rollt: `scrollWidth` 1.723 gegen `clientWidth`
810, `overflow-x: auto` aus der geteilten `Tabs`-Komponente. Der
zwanzigste Tab („Clone & Gym") ist erreichbar und vollstaendig —
gegengeprueft nach dem Rollen.

`[cmd]` **Keine Hydrationsfalle war zu entschaerfen.** Gemessen ueber
die vier Vorlagendateien: null `Math.random()`, null `Date.now()`, null
`new Date()`, null `Math.sin`/`Math.cos`, null Zeitgeber. Anders als
bei Goals (32 Meldungen) und bei Coach (64 QR-Zellen) stand hier jede
Zahl fest. Ein Test haelt das fuer alle sieben Moduldateien fest.

`[cmd]` Die Bewegung ist rein deklarativ: vier SVG-SMIL `<animate>` im
Orb (im Browser gezaehlt: 2 aktive im Chat-Tab) und eine
CSS-Transition am Heartbeat-Schalter. Beides server- wie
browserseitig gleich.

`[cmd]` Der Befehlsparser der Sprachsitzung ist das einzige Stueck
echter Logik im Modul. Ein Test faehrt die neun Muster der Vorlage
gegen sieben Eingaben: `fertig` → `set_complete`, `rpe 8` → `log_rpe`,
`war schwer` → `log_rpe`, `banane` → nichts. Die Muster stehen in
TypeScript doppelt gequotet; wer beim Uebernehmen eine Ebene verliert,
faellt hier auf statt erst im Browser.

`[cmd]` Drei Breiten: 1440, 1100, 375. Kein Querlauf bei 1440 und 1100.

---

## 7. Was gemeldet, nicht umgangen wurde

`[read]` Der Auftrag: *„`packages/ui/` nicht anfassen. Bekannt fehlend:
`history`, `shield` (zweimal), `Pill` ohne `dot`, kein `Empty`-Baustein
— G-43."* `packages/ui/` ist nicht angefasst.

**Bestaetigt fehlend, jetzt zum dritten Mal:**

| Symbol | Wo in diesem Modul | Ersatz |
|---|---|---|
| `shield` | `module-buddy-engines.jsx:263` (Tiers), `:732` (Safety) | `admin` — dasselbe Schutzschild wie in G-36 und G-40 |
| `file` | `module-buddy-knowledge.jsx:68` (Belegkarte) | `copy` — dasselbe Blattmotiv wie in G-36 |

`[cmd]` **`shield` fehlt damit zum dritten Mal** (G-36, G-40, G-42),
jedes Mal an einer Datenschutz- oder Sicherheitsueberschrift. **Es ist
der klarste Kandidat fuer G-43.**

`[cmd]` **`Pill` ohne `dot`** — bestaetigt, modul-lokal in
`bausteine.tsx`. Diese Fassung kann zusaetzlich einen frei gefaerbten
Punkt, weil `module-buddy.jsx:82` das braucht.

`[cmd]` **Ein `Empty` braucht dieses Modul nicht** — anders als Coach
(G-40) fuehrt die Buddy-Vorlage keinen Leerzustand.

**Neu gefunden:**

`[cmd]` **`v2-g-cols-5` gibt es nicht.** `v2.css:470-472` fuehrt
`-2`, `-3`, `-4`; `module-buddy.jsx:397` benutzt `g-cols-5` fuer die
fuenf Avatarzustaende. Modul-lokal als `v2-buddy-zustaende` gebaut,
mit Haltepunkt. **Gehoert zu G-43.**

**Bestand, nicht durch G-42 entstanden:**

`[cmd]` **Querlauf bei 375 px.** Die uebertretenden Elemente sind
ausschliesslich `v2-nav-item` — die Seitenleiste. In G-40 fuer
`/v2/dashboard`, `/v2/medical` und `/v2/goals` gegengeprueft: dieselbe
Ueberschreitung. Betrifft jede `/v2`-Route.

---

## 8. Was als Naechstes ansteht

1. **G-43** — die vier fehlenden Bausteine in `packages/ui`:
   `shield` (dreimal gebraucht), `history`, `file`, `v2-g-cols-5`,
   `Pill` mit `dot`, ein `Empty`. Danach koennen `bausteine.tsx` in
   `coach/` und `coach/ai/` entfallen.
2. **Der Trainerarbeitsplatz** — 20 Posten, seit G-40 als
   `bekanntOffen` eingetragen. Eigener Menuepunkt, eigener Auftrag.
3. **Vor dem Anbinden zu entscheiden:** drei Stufen oder vier
   (Abschnitt 4.2). Und: BSS und Voice sind **neu zu bauen**, nicht zu
   uebersetzen (4.1, 4.3) — bei allen uebrigen Tabs liegt im
   Vorgaengerrepo eine Entsprechung.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| Alle fuenfzehn Zulieferer vorhanden | Grep je Name ueber `theme-v1/*.jsx` |
| `BuddyCoachOverrides` in einer Coach-Datei | `module-coach-meta.jsx:161`, Aufruf `module-buddy.jsx:132` |
| `Object.assign` fuehrt nur Daten | `module-buddy-engines.jsx:847` |
| Zwanzig Tabs, nicht zwoelf | `module-buddy.jsx:91-112` |
| 42 von 42 | `node tools/vollstaendigkeit.mjs coach-ai` |
| `uploads/` = `docs/specs/`, byteweise | Vergleichsskript ueber sieben Specs |
| Hash unterscheidet Module | Kopfzeilen `SPEC_09_SCORING-{8a1632fa,d4545dde}.md` |
| Sechs Buddy-Migrationen, 650 Zeilen, 13 Tabellen | `ls \| grep -ic buddy`, `cat \| wc -l`, `grep CREATE TABLE` |
| `buddy.ts` 1.647 Zeilen | `wc -l src/api/coach/routes/buddy.ts` |
| `behavioral_signatures` passt zur Vorlage | `046_intervention_notification_system.sql:9-21` |
| BSS fehlt im Vorgaenger | `grep -rli "stability_score\|behavior_stability" src/ supabase/ packages/` → leer |
| Drei Stufen statt vier | `grep -oE "'(free\|premium\|pro\|elite\|plus)'" src/api/coach/services/tier-service.ts` |
| Voice fehlt im Vorgaenger | `grep -rli "whisper\|speechSynthesis\|parseGymCommand" src/` → leer |
| Kein Buddy-Schema im neuen Repo | `grep -rniE "CREATE TABLE[^;]*coach" supabase/_pipeline/` → leer |
| Keine Hydrationsfalle | Grep ueber vier Vorlagendateien; Test in `v2-attrappen.test.ts` |
| Gate, Tests | `pnpm gate` 8/8 · `v2-attrappen.test.ts` 53/53 |
