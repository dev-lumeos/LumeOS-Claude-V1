# 156 — Interactions und das Gate von Extended (G-110)

**Stand:** 2026-08-20 · **Modul:** Supplements · **Auftrag:** G-110

---

## Was die Regeln zeigen

`[cmd]` **G-91 hat `Interactions` als blockiert gemeldet — das gilt
nicht mehr.** C-133 hat das Regelwerk geliefert:
`supplements.rule_catalog` mit **64 Regeln** und
`rule_assessment(user_id, entry_date)` mit drei Zustaenden.

`[cmd]` **Gemessen fuer `dev@lumeos.app` am 2026-08-20** — genau die
Zahlen des Auftrags:

| Zustand | Anzahl |
|---|---|
| `fulfilled` | **1** |
| `not_fulfilled` | **50** |
| `missing_input` | **13** |

### Die drei benannten Regeln, im Bild belegt

`[cmd]` **`wr_anticoag_stack` — zutreffend.** Schwere `medium`,
Empfehlung `physician_referral`. Der Text kommt unveraendert aus
`message_de`:

> Additive Blutungsneigung. Kombination ärztlich abklären; vor OPs
> absetzen besprechen.

`[cmd]` **Und die Kachel sagt, WORAUF sie getroffen hat** —
`anticoagulant_vka`, `anticoagulant:warfarin`, `CYP2C9_substrate`,
`hypertension`. Das steht in `matched_context`.

`[cmd]` **`wr_warfarin_vitk` — nicht zutreffend.** Sie steht deshalb
nicht einzeln da; die Kachel unten nennt die Zahl.

`[cmd]` **`wr_lab_biotin` — Daten fehlen.** Schwere `high`,
`lab_context`; es fehlen `supplements.daily_total_mg` und
`medical.lab_draw_scheduled_within_days`. **Beide Pfade stehen an der
Kachel.**

### Eine Berichtigung zum Auftrag

`[cmd]` **Die sieben Arten sind `rule_kind`, nicht `rule_type`.**
`rule_type` hat **drei** Werte: `warning` 29 · `medication` 20 ·
`nutrient_gap` 15. Die im Auftrag genannten sieben — `interaction` 21,
`nutrient_gap` 15, `safety` 9, `monitoring` 6, `information` 5,
`lab_interference` 4, `lab_monitoring` 4 — stehen in `rule_kind`.

`[read]` **Die Oberflaeche zeigt `rule_kind`**, weil er das Nuetzlichere
ist: „Laborstoerung" sagt mehr als „warning". `rule_assessment` gibt ihn
allerdings **nicht** zurueck — er wird ueber `rule_id` aus dem Katalog
dazugeholt.

### Die Grenze, im Text der Kachel

`[read]` **C-108 gilt: *„Nennen ja, bewerten nein."*** Die Kachel
schreibt es aus, damit niemand die Liste fuer einen Befund haelt:

> Eine **zutreffende** Regel heisst: beide Seiten stehen in deinem
> Stack. Sie ist ein **Hinweis, keine Bewertung** — LumeOS gibt keine
> Dosierung vor, sperrt nichts und rechnet daraus keine Note.

`[cmd]` **Was nicht gebaut ist:** kein Score, keine Blockade, **keine
Zeitplan-Urteile.** F-02 nennt *„your current schedule is fine"*
ausdruecklich als das, was draussen bleibt — so ein Satz kommt hier
nicht vor.

`[cmd]` **`physician_referral` steht 33-mal im Katalog** und erscheint
als Wort („aerztlich abklaeren"), nicht als Handlung. Unter dem Tab
steht der Satz:

> Das Regelwerk ist kuratiert und ersetzt keine ärztliche Beratung.
> **Keine Diagnose, keine Therapieempfehlung.**

`[read]` **Und die Farbe ist die Schwere der Regel, keine Note.**
`critical`/`high` rot, `medium` gelb, `low` blass — so steht es im
Katalog. Daraus wird **kein** Gesamtwert gebildet.

---

## Wie `missing_input` aussieht

`[read]` **Das ist der Kern von C-132:** Eine Regel, die auf fehlende
Daten trifft, **faellt nicht stumm durch.**

`[cmd]` **Alle 13 stehen einzeln da, mit ihren Pfaden:**

| Regel | Schwere | Es fehlt |
|---|---|---|
| `wr_lab_biotin` | high | `supplements.daily_total_mg`, `medical.lab_draw_scheduled_within_days` |
| `wr_lab_b6_neuropathy` | medium | `supplements.daily_total_mg` |
| `wr_lab_zinc_copper` | medium | `supplements.daily_total_mg` |
| `wr_drug_chelation_timing` | medium | `supplements.substance_group_membership` |
| `wr_drug_statin_ck` | medium | `medical.symptoms` |
| `wr_stimulant_stack_total` | medium | `supplements.computed.stimulant_load_mg_caffeine_equiv` |
| `wr_drug_symptom_contributor` | low | `medical.symptoms` |
| `gap_calcium_dairy` | low | `nutrition.daily.dairy_servings_day` |
| `gap_joint_loading` | low | `training.high_impact`, `medical.symptoms` |
| `gap_omega3_fish` | low | `nutrition.daily.fish_servings_week` |
| `gap_sleep_onset` | low | `sleep.sleep_latency_min` |
| `gap_stress_training_load` | low | `sleep.quality_score` |
| `gap_vitd_sun` | low | `profile.indoor_dominant`, `location.low_sun` |

`[read]` **Der Satz darueber ist der wichtige:**

> Diese Regeln liessen sich nicht prüfen. **Sie sind weder zutreffend
> noch ausgeschlossen** — es fehlen Angaben.

`[read]` **Dieselbe Sprache wie anderswo:** *„braucht ACWR"* beim
Erholungswert (G-82), `NO_REFERENCE` bei den Naehrstoffen,
*„Tagessumme unvollstaendig"* bei den Mikronaehrstoffen (G-101). **Eine
fehlende Angabe ist ein Zustand, kein Nullwert.**

`[cmd]` **Die Pfade nennen, was fehlt und wo es herkaeme.** Und sie
zeigen, dass ein Teil davon **heute nirgends steht** — gegen das Schema
geprueft:

| Pfad | Quelle vorhanden? |
|---|---|
| `sleep.*` (2 Regeln) | **nein** — kein Schema `sleep` |
| `location.low_sun` | **nein** — kein Schema `location` |
| `medical.symptoms` (3 Regeln) | **nein** — keine Symptomtabelle (deckt sich mit G-84) |
| `training.high_impact` | **nein** — keine solche Spalte |
| `profile.indoor_dominant` | **nein** — keine solche Spalte |
| `supplements.daily_total_mg` (3 Regeln) | rechenbar aus dem Stack |
| `nutrition.daily.*` (2 Regeln) | rechenbar aus dem Tagebuch |

`[read]` **Sieben der zwoelf Pfade haengen an Quellen, die es nicht
gibt.** Das ist kein Fehler der Regeln — es ist die Landkarte dessen,
was noch fehlt.

---

## Wie das Gate jetzt schützt

`[cmd]` **G-92 hat gemessen:** *„Sein Gate ist ein blosses `useState`
und schuetzt nichts. **Wer klickt, sieht die Protokolle.**"*

`[cmd]` **Bestaetigt:** In `tab-extended.tsx` stand
`const [unlocked, setUnlocked] = React.useState(false)` und darunter
`if (!unlocked) return <ExtendedGate onUnlock={…} />`. **Ein Knopf, der
eine Zustandsvariable umlegt.**

### Was jetzt entscheidet

`[cmd]` **`public.profiles.experience_level`, seit C-140** — `text`,
nullable, kein Default, **CHECK auf genau `beginner | advanced | pro |
elite`**.

`[cmd]` **Auf allen 7 Profilen NULL** (gemessen 2026-08-20): angelegt,
aber nie gesetzt. **Selbst geprueft, wie der Auftrag verlangt.**

`[cmd]` **Die Entscheidung faellt in `ansicht.tsx`, nicht im Tab.**
Reicht der Grad nicht, wird `SuppExtended` **gar nicht gerendert.**

### Gemessen, Stufe für Stufe

`[cmd]` Der Grad wurde nacheinander gesetzt, die Seite jedes Mal im
Browser aufgenommen — **danach wieder auf NULL zurueckgesetzt:**

| Grad | Gate sichtbar | Active protocols | Side effect log | Half-life |
|---|---|---|---|---|
| **(NULL)** | **ja** | 0 | 0 | 0 |
| **beginner** | **ja** | 0 | 0 | 0 |
| advanced | nein | **1** | **1** | **6** |
| pro | nein | 1 | 1 | 6 |
| elite | nein | 1 | 1 | 6 |

`[read]` **Die Grenze steht bei `advanced`** — Toms Vorgabe (C-113):
*„Ich stelle mir vor, es ist nur für bestimmte Level-User
aktivierbar."* Sie steht als eine Konstante (`GRAD_FUER_EXTENDED`), nicht
verstreut; **fuenf Tests halten sie fest**, darunter: ein unbekannter
Wert oeffnet nicht.

### Und ein Weg hinaus

`[read]` **Ein gesperrter Bereich ohne Ausweg ist eine Sackgasse.** Die
Gate-Kachel nennt den eigenen Stand („nicht angegeben") und fuehrt nach
`/v2/settings`.

`[cmd]` **Die Kachel dort ist entsperrt.** Sie stand seit G-80 mit
`disabled` und dem Satz *„lässt sich noch nicht speichern — im Profil
gibt es kein Feld dafür"*. **Das stimmte bis C-140.** Jetzt ist die
Auswahl bedienbar, `experience_level` steht im Schreibweg
(`profile-write.ts`), und ein zweiter Klick nimmt die Angabe zurueck —
**„nicht angegeben" ist ein gueltiger Zustand.**

`[read]` **Der Grad ist Selbstauskunft** (C-71), nicht
Fremdeinschaetzung. Der Satz steht an beiden Stellen, damit er nicht
mit der Autonomy-Stufe des Coach-Moduls verwechselt wird.

### Ein Versuch, der zurückgenommen wurde

`[cmd]` **Der Code lag trotz Gate im Buendel.** Gemessen: bei
statischem Import steht „Active protocols" in **einem von sieben**
JS-Chunks der Seite — auch fuer jemanden, dessen Grad nicht reicht.

`[cmd]` **Ein `dynamic({ ssr: false })` hat das behoben** (der Chunk
war danach nicht mehr im Seitenmanifest) — **und den Tab
unbrauchbar gemacht:** er zeigte gar nichts mehr, auch nicht den
Ladehinweis.

`[read]` **Zurueckgenommen.** Der Gewinn waere gewesen, dass der Code
nicht mitreist; der Preis war ein Tab, der niemandem etwas zeigt.
**Das Gate haelt trotzdem** — der Code liegt im Buendel, die Daten
kommen nicht. **Als Befund aufgenommen (G-117).**

---

## Was Attrappe bleibt

`[cmd]` **`enhanced_substances` existiert nicht** — bestaetigt. Der
Extended-Tab zeigt weiter die sechs Kacheln des Entwurfs mit ihren
Marken; **gebaut wurde das Gate davor, nicht der Inhalt dahinter.**

`[read]` **Toms Vorgabe steht:** *„planen, protokollieren,
modulübergreifende Analysen für Warnings. **Wir werden nicht
Empfehlungen oder Papa spielen.**"* Die Analysen sind mit dem
Regelwerk jetzt da — die Protokolle brauchen ein Schema.

`[cmd]` **Die 50 nicht zutreffenden Regeln stehen nicht einzeln da.**
Die Kachel unten nennt die Zahl und sagt, dass sie bei jeder Aenderung
neu geprueft werden. `[read]` Fuenfzig Zeilen „trifft nicht zu" waeren
Laerm, kein Nachweis.

`[cmd]` **Fuenf der 13 Luecken haengen an Daten, die kein Modul
fuehrt** — `sleep.sleep_latency_min`, `sleep.quality_score`,
`profile.indoor_dominant`, `location.low_sun`, `training.high_impact`.
**Sie werden nicht verschwiegen, sondern benannt.**

### Zum Attrappen-Test

`[cmd]` **Der Auftrag nennt 18 `RUECKFALL` und 2 `ATTRAPPE` — gemessen
sind es 16 und 1.** Der Test erwartet `[SUPP, 1, 16]`, also genau den
gemessenen Stand; **die 18/2 duerfte `tab-spec.tsx` (18 Marken)
mitgezaehlt haben.**

`[cmd]` **Eine Erwartung musste nachgezogen werden, und zwar bewusst:**
Der Test verlangte die Unterkomponente `ExtendedGate`. Sie ist
**ersetzt, nicht weggelassen** — das neue Gate heisst
`ExtendedGesperrt` und steht in `extended-gate.tsx`. Der Test prueft
jetzt diesen Namen und liest die neue Datei mit.

`[read]` **Der Test bleibt streng.** Er hielt die G-33-Regel fest
(*„der Rumpf ist nicht das Modul"*), und das tut er weiter: eine
Aufklaerungsflaeche muss es geben, nur unter ihrem neuen Namen.

`[cmd]` **Marken unveraendert:** `tabs.tsx` 1 + 16, `tab-extended.tsx`
6, `tab-compliance.tsx` 4. **76 Attrappen-Tests gruen.**

---

## Nachweis

`[cmd]` **441 Tests gruen** (vorher 434 — fuenf neue fuer das Gate),
Typecheck sauber.

`[cmd]` **Attrappen gerendert gezaehlt (A-24): 1** auf
`/v2/supplements`, unveraendert gegen vorher. `[read]` Die eine ist die
Buddy-Kachel der Kontextspalte, nicht der Tab.

`[cmd]` **Zeilenschutz, im Browser gemessen:**

| | `dev@lumeos.app` | `test-user@lumeos.local` |
|---|---|---|
| Zutreffende Regeln | **1** (`wr_anticoag_stack`) | **0** |
| `anticoagulant_vka` sichtbar | ja | **nein** |
| `missing_input` | 13 | 11 |
| Regelkatalog sichtbar | 64 | **64** |

`[read]` **Der Katalog ist geteilt, die Bewertung nicht** — wie die
Lebensmitteldatenbank. `test-user` sieht dieselben Regeln, aber **keine
trifft auf ihn zu**, und die Merkmale aus `matched_context` erscheinen
bei ihm nicht.

`[cmd]` **Bildschirmfotos** ueber `tools/schuss.mjs`, headless:
Interactions und Gate je 1440 und 375 px, hell und dunkel; dazu die
Settings-Kachel. **Zwei Konsolenfehler** an jeder Breite — die
Hydrationswarnung des Rahmens, nicht aus dieser Arbeit.

---

## Geänderte und neue Dateien

| Datei | Was |
|---|---|
| `lib/supplements/regeln-read.ts` | **neu** — Regelwerk und Gate |
| `v2/supplements/tab-interactions-echt.tsx` | **neu** — die drei Zustaende |
| `v2/supplements/extended-gate.tsx` | **neu** — das echte Gate |
| `lib/supplements/__tests__/regeln-read.test.ts` | **neu** — 5 Tests |
| `v2/supplements/tab-extended.tsx` | **das innere `useState`-Gate entfernt** |
| `v2/supplements/ansicht.tsx`, `page.tsx` | Regelwerk und Gate durchgereicht |
| `lib/profile/profile-model.ts`, `profile-write.ts` | `experience_level` angeschlossen |
| `v2/settings/formular.tsx` | die Auswahl entsperrt |
| `components/shell/__tests__/v2-attrappen.test.ts` | `ExtendedGate` → `ExtendedGesperrt` |

**Nicht angefasst:** `packages/ui`, `apps/coach`, `supabase/`,
`tab-injektionen.tsx`, die sechs angebundenen Tabs.

---

## Neue Befunde

1. **G-117 — Der Extended-Code liegt im Buendel, auch ohne Grad.**
   Ein `dynamic({ ssr: false })` behebt es, macht den Tab aber leer.
   **Das Gate schuetzt die Daten, nicht den Code.**
2. **Fuenf der 13 Regelluecken haengen an Daten, die kein Modul
   fuehrt** — `sleep.*`, `location.*`, `training.high_impact`. Wer sie
   schliessen will, braucht zuerst die Quellen.
3. **`rule_assessment` gibt `rule_kind` nicht zurueck.** Die feinere
   Einteilung muss ueber `rule_id` aus dem Katalog geholt werden —
   eine zweite Abfrage je Seitenaufruf.
4. **Die Zahlen des Auftrags zum Attrappen-Test (18/2) stimmen nicht**
   — gemessen 16/1, und der Test erwartet genau das.
