# 162 — Recovery, `supplements`-Tab und 17 Sperrbegründungen (G-123)

**Stand:** 2026-08-20 · **Module:** Recovery, Supplements, Medical,
Goals, Training · **Auftrag:** G-123

---

## Was die Konsolenfehler sind

`[cmd]` **Es sind vier, nicht fünf — und es gibt keinen unbekannten
dritten.** Der Auftrag nennt fünf; gemessen am 2026-08-20 sind es
**vier**, und jeder einzelne ist zugeordnet.

| Fehler | Wo | Was |
|---|---|---|
| 2× `Extra attributes from the server: data-mode` | **jede Seite** | Hydrationswarnung des Rahmens (`RootLayout`) |
| 2× `<path> attribute d: Expected number` | nur mit Muskelkarte | **die abgeschnittenen SVG-Pfade** (G-105) |

### Je Tab gemessen — das ist der Beleg

`[cmd]` Seit G-117 ist jeder Tab einzeln messbar. **Alle neun
Recovery-Tabs:**

| Tab | Fehler | SVG | Hydration | sonst |
|---|---|---|---|---|
| today | 4 | **2** | 2 | **0** |
| checkin | 4 | **2** | 2 | **0** |
| muscles | 4 | **2** | 2 | **0** |
| hrv | 2 | 0 | 2 | **0** |
| sleep | 2 | 0 | 2 | **0** |
| modalities | 2 | 0 | 2 | **0** |
| overtraining | 2 | 0 | 2 | **0** |
| protocols | 2 | 0 | 2 | **0** |
| stress | 2 | 0 | 2 | **0** |

`[read]` **Die Spalte „sonst" ist überall null.** Die zwei SVG-Fehler
erscheinen genau auf den drei Tabs, die die Muskelkarte zeigen — sonst
nirgends. **Damit ist die Frage des Auftrags beantwortet: es gibt
nichts Drittes.**

`[cmd]` **Zum Vergleich: Nutrition 2, Medical 2.** Der Auftrag nennt
fuer Medical drei — bei einem Lauf erschien tatsaechlich ein dritter
(`Failed to fetch RSC payload for /dashboard`), beim naechsten nicht
mehr. **Er ist ein abgebrochener Vorablauf beim Modulwechsel, kein
Modulfehler** — und nicht reproduzierbar.

### Die zwei SVG-Stellen, genau

`[cmd]` **Beide in `packages/ui/src/koerperkarte-pfade.ts`, unverändert
seit `3dae1a2`:**

```
… C 89.50 823.53 109.24 767.88 A 0.37 …      ← C mit VIER Zahlen, dann A
… C 1039.32 221.19 C 1041.33 230.61 …        ← C mit ZWEI Zahlen, dann C
```

Ein `C` braucht sechs. **Nicht behoben — `packages/ui` ist gesperrt**
(G-105 führt es).

`[read]` **Ein eigener Zählversuch ist gescheitert und wird hier
festgehalten**, damit ihn niemand wiederholt: Ein selbstgebauter
Pfadprüfer meldete **291** unvollständige Befehle. Er war falsch — SVG
erlaubt **wiederholte Parametersätze ohne neuen Befehlsbuchstaben**
(`C a b c d e f a b c d e f`), und der Prüfer zählte jeden davon als
Fehler. **Der Browser ist die Autorität, und er nennt genau zwei.**

---

## Was Recovery jetzt zeigt

### Der gemessene Folgetagsunterschied (C-153)

`[cmd]` **`next_day_score_delta` ist auf allen 89 Zeilen gefüllt** —
und wurde **nicht angezeigt.** Die Kachel las `next_day_effect`, die
Selbsteinschätzung 1–10; die gemessene Differenz blieb liegen.

`[cmd]` **Jetzt steht sie je Art in der Übersicht:**

| Art | Anzahl | ⌀ Dauer | **⌀ Folgetag** |
|---|---|---|---|
| Sauna | 19 | 24′ | **+2,76** |
| Dehnen | 42 | 16′ | +0,13 |
| Massage | 13 | 55′ | +0,05 |
| Eisbad | 15 | 4′ | **−0,07** |

`[read]` **Das ist genau Toms Satz:** *„wer am Montag in die Sauna
geht, sieht am Dienstag den Unterschied."* Sauna hebt den Wert im
Schnitt um knapp drei Punkte, Eisbad praktisch nicht.

**Die Grenze bleibt** (G-76): `[read]` **Kein Urteil an der Zahl.** Es
steht nicht da, dass Sauna „besser" ist. Der Satz unter der Tabelle
sagt nur, wie gerechnet wurde:

> Die rechte Spalte ist der **gemessene** Unterschied des
> Erholungswerts am Folgetag (C-153) — Tag danach minus Tag selbst,
> über alle erfassten Fälle gemittelt. `next_day_score_delta`, nicht
> die Selbsteinschätzung.

`[cmd]` **Nur gefüllte Werte werden gemittelt** — eine fehlende Messung
ist keine Null. Der Titel je Zeile nennt, aus wie vielen Messungen der
Schnitt kommt.

### Was unverändert bleibt

`[cmd]` **Der Bonus steht weiter auf 0** mit `pending_c124_e5`, und die
Kachel sagt weiter, worauf sie wartet. **Keine Übertrainings-Warnung**
— sie braucht C-124.

`[cmd]` **E1 gilt:** `resting_hr` und `spo2_pct` sind **0 von 340**;
HRV liegt auf **43 von 170** Check-ins.

---

## Was Attrappe bleibt

`[cmd]` **Recovery: 4 Attrappen, unverändert.** Die Modalitäten-Kachel
war schon vor G-123 echt — sie hat nur eine Spalte dazubekommen.

`[cmd]` **Je Tab gezählt:** `muscles` 3 · `today`/`checkin`/
`overtraining`/`protocols` 4 · `hrv`/`sleep` 5 · `stress` 6 ·
`modalities` 7.

`[read]` **Der `modalities`-Tab zeigt weiter die Entwurfsfassung.** Die
echte Kachel sitzt auf `today` — das ist die Anordnung der Vorlage und
wurde nicht angetastet.

`[cmd]` **`supplements`: 1 Attrappe**, unverändert.

---

## Was die Begründungen jetzt sagen

`[cmd]` **Der Auftrag nannte zwei. Es waren siebzehn.**

Nach den zwei aus dem Auftrag habe ich alle `grund=`-Texte in
`apps/web/src/app/v2/` gegen `information_schema` geprüft — **145
Tabellen gegen jede genannte.** Dabei kamen zwei Klassen heraus.

**Klasse 1: die Tabelle gibt es — neun Fälle.** Die Sperre bleibt
richtig, aber der Grund ist ein anderer.

| Datei | nannte als fehlend | Wirklichkeit |
|---|---|---|
| `medical/tab-tracking.tsx` | `medical.medications` | **`user_medications`: 21 Spalten, 2 Zeilen** |
| `goals/phase-editor.tsx` | `goals.goal_phases` | **14 Spalten, 5 Zeilen** |
| `goals/tab-phase.tsx` | `goals.goal_phases` | **dieselbe** |
| `goals/modale.tsx` | `goals.user_goals` | **23 Spalten, 11 Zeilen, Schreibweg existiert** |
| `goals/modale.tsx` (2×) | `goals.body_measurements` | **17 Spalten, 362 Zeilen** |
| `medical/marker-modal.tsx` | `medical.lab_result_values` | **27 Spalten, 280 Zeilen** |
| `recovery/modale.tsx` | *„das Schema `recovery` gibt es noch nicht"* | **178 Zeilen in `modality_log`** |
| `recovery/tab-checkin.tsx` | *„das Schema `recovery` gibt es noch nicht"* | **340 Zeilen in `checkins`** |
| `training/modale.tsx` | `training.exercises` | **1.416 Zeilen** |

`[read]` **Die zwei Recovery-Sätze waren die schlimmsten:** Sie
behaupteten, es gebe **das Schema nicht** — auf einer Seite, deren
Kopfzeile *„aus `recovery.scores`"* schreibt und 170 Tage anzeigt.

### Klasse 2: die Tabelle fehlt wirklich — der Zusatz ist falsch

`[cmd]` **Acht weitere Begründungen nennen eine Tabelle, die es
tatsächlich nicht gibt** — `medical.symptoms`,
`medical.biomarker_results`, `recovery.hrv_readings`,
`recovery.protocols`, `training.routines`, `training.blocks`.
**Insoweit stimmen sie.**

`[cmd]` **Falsch ist der Halbsatz dahinter:** *„das Schema gibt es noch
nicht."* Gemessen: **`medical` 11 Tabellen, `training` 8, `recovery`
3.** Alle drei Schemata stehen.

`[cmd]` **Und zweimal in `supplements/tab-extended.tsx`:** *„Das Modul
`/v2/medical` gibt es noch nicht."* **Es gibt es** — mit 140 Werten und
fünf Befunden.

`[read]` **Diese Sätze sind gefährlicher als die ersten neun**, weil
sie halb stimmen. Wer den ersten Teil prüft, findet ihn bestätigt und
glaubt den zweiten mit.

`[cmd]` **Jetzt steht dort, was zutrifft** — etwa bei HRV: *„die gibt
es nicht. HRV steht heute in `recovery.checkins.hrv_rmssd` (43 von 170
Tagen)."*

### Die Sperren bleiben — der Grund ist ein anderer

`[cmd]` **Geprüft: keine der fünf Tabellen hat einen Schreibweg** in
`apps/web/src/lib`. Die Knöpfe sind also **zu Recht gesperrt** — nur
nicht aus dem genannten Grund.

`[read]` **Der Unterschied ist nicht kosmetisch.** *„Die Tabelle gibt
es nicht"* schickt den nächsten Agenten zu Codex ins Schema. *„Der
Schreibweg fehlt"* sagt ihm, dass die Arbeit in `apps/web` liegt.
**Siebzehn Wegweiser zeigten in die falsche Richtung** — neun ganz, acht zur Hälfte.

`[cmd]` **Was jetzt dasteht, mit dem, was wirklich fehlt:**

- **Medikamente:** die **zehn Überwachungsspalten** (`monitoring`,
  `monitoring_frequency`, `last_test`, `next_due`,
  `monitoring_overdue`, `targets`, `side_effects`, `physician`, `rx`) —
  **keine davon in der Tabelle.** Aus `next_due` und
  `monitoring_overdue` speisen sich vier der sechs Warnungen im Kopf.
- **Phasen:** nichts fehlt in den Daten — nur der Schreibweg.
  `goal_phases` trägt `transitioned_from`, `recommended_next`,
  `transition_reason`, `actual_end_date`.
- **Ziele anlegen:** `user_goals` **wird bereits geschrieben**
  (`lib/goals/schreiben.ts`). Es fehlt allein das Anlegen — und die
  Entscheidung, welcher der **genau drei aktiven Plätze**
  (`user_goals_check1` 1–3, `uq_user_goals_active_slot`) frei wird.
- **Eigene Übung:** dazu die Abgrenzung — **der Katalog ist geteilt,
  eine eigene Übung wäre es nicht.**
- **Eigener Messwert:** dazu die Frage, **wie er von einem Laborbefund
  zu unterscheiden ist.**

---

## `supplements` war das letzte `useState`-Modul

`[cmd]` **Erledigt, die beschriebene Zwei-Zeilen-Änderung** — Import
und `useTabParam('today')` statt `React.useState('today')`.

`[cmd]` **Gemessen, fünf Tabs über die Adresse:**

| Adresse | Beleg im Bild |
|---|---|
| `?tab=interactions` | „Regelwerk" |
| `?tab=extended` | „Extended supplements" |
| `?tab=compliance` | „Compliance" |
| `?tab=cost` | „Annual run-rate" |
| `?tab=catalog` | „Evidenz" |

`[read]` **Damit sind alle Module umgestellt.** Zwei Wirkungen: der Tab
überlebt eine Navigation, und `schuss.mjs` kann einzelne Tabs messen —
**genau das hat die Fehlersuche in Teil A erst möglich gemacht.**

---

## Was nur gemeldet wird

`[cmd]` **G-120, `updateWaterLogAmount`:** liegt fertig und ungenutzt.
**Nicht angefasst** — das ist `nutrition`, wo Fable arbeitet.

`[read]` Ein Stift-Knopf neben jedem Eintrag der Hydrationsliste wäre
der vollständige Korrekturweg; heute bleibt nur Löschen und neu
Eintragen.

---

## Nachweis

`[cmd]` **447 Tests grün**, Typecheck sauber in meinem Bereich.

`[read]` **Während der Arbeit stand `nutrition` zeitweise rot** —
Fable hat dort `referenz` zu `ziel` umbenannt. Die Fehler waren nicht
meine und sind inzwischen weg; ich habe deshalb nach Bereich getrennt
geprüft.

`[cmd]` **Attrappen gerendert (A-24):** Recovery **4**, Supplements
**1**, Medical 6, Goals 1.

`[cmd]` **Zeilenschutz** auf `/v2/recovery`:

| | `dev@lumeos.app` | `test-user@lumeos.local` |
|---|---|---|
| Sauna +2,76 sichtbar | **ja** | **nein** |
| `next_day_score_delta` genannt | ja | nein |
| Attrappen | **4** | **6** |

`[read]` **Die höhere Attrappenzahl bei `test-user` ist der Beleg:**
Ohne Modalitäten fällt die Kachel auf den Entwurf zurück — mit Marke,
wie vorgesehen.

`[cmd]` **Bildschirmfotos** über `tools/schuss.mjs`, headless: Recovery
1440 und 375 px, hell und dunkel; dazu Supplements mit `?tab=`, Medical
und Goals.

---

## Geänderte Dateien

| Datei | Was |
|---|---|
| `lib/recovery/scores-read.ts` | `next_day_score_delta` gelesen und je Art gemittelt |
| `v2/recovery/modalitaeten-kachel.tsx` | die Spalte, mit Erklärung |
| `v2/supplements/ansicht.tsx` | `useTabParam` statt `useState` |
| `v2/medical/tab-tracking.tsx` | Begründung berichtigt, mit den zehn fehlenden Spalten |
| `v2/medical/marker-modal.tsx` | Begründung berichtigt |
| `v2/goals/phase-editor.tsx`, `tab-phase.tsx`, `modale.tsx` | vier Begründungen berichtigt |
| `v2/recovery/modale.tsx`, `tab-checkin.tsx` | zwei Begründungen berichtigt |
| `v2/training/modale.tsx` | zwei Begründungen berichtigt |
| `v2/medical/modale.tsx`, `tab-biomarker.tsx` | sieben Halbsätze berichtigt |
| `v2/supplements/tab-extended.tsx` | zweimal: /v2/medical gibt es sehr wohl |

**Nicht angefasst:** `nutrition` (Fable), `supabase/` (Codex),
`packages/ui`, die Muskelkarte, `tab-injektionen.tsx`.

---

## Neue Befunde

1. **G-122 — Fünf Tabellen mit Daten haben keinen Schreibweg.**
   `body_measurements` (362), `lab_result_values` (280),
   `modality_log` (178), `checkins` (340), `exercises` (1.416). Jede
   wird gelesen, keine geschrieben. **Fünf gesperrte Knöpfe hängen
   daran.**
2. **G-124 — Die Medikamentenkachel braucht zehn Spalten.**
   `user_medications` führt keine davon; vier der sechs Warnungen im
   Medical-Kopf hängen an `next_due` und `monitoring_overdue`.
3. **Der `modalities`-Tab zeigt weiter den Entwurf**, während die echte
   Kachel auf `today` sitzt. Das ist die Anordnung der Vorlage — wer
   sie ändert, entscheidet gegen den Entwurf.
4. **Ein selbstgebauter SVG-Pfadprüfer ist unbrauchbar** (291 falsche
   Treffer). Wiederholte Parametersätze ohne Befehlsbuchstaben sind
   gültig. **Für SVG ist der Browser die Messung.**
