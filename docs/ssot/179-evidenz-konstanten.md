# 179 — Vier beantwortete Fragen umgesetzt: C-105, C-124, GO-21, G-89

**Auftrag:** „Vier beantwortete Fragen umsetzen" · **Stand:**
2026-08-22 · **Bereich:** Evidenz-Konstanten in `apps/web`
(Recovery-Motor, Training-Landmarks, Goals-Verhältnisse)
**Quelle der Entscheidungen:** crawl_025 —
`backup/kimi-research/Kimi_Agent/supplement_performance_database/data/evidence/`
(`constant_evidence_registry.json` 181 Einträge,
`recovery_modality_evidence.json` 32, `training_structure_registry.json` 13)

**Kurz:** Die Registry ist lokalisiert und je Konstante gegen den Code
gelegt. `[cmd]` **C-124: 17 numerische Bonuswerte → 0** (11 Katalog +
1 Deckel + 5 scoreDelta) — an ihrer Stelle Richtung + Endpunkt +
Quelle je Modalität. **C-105: MAV komplett raus (10 Werte, 5
Verwendungen → 0)**, MEV als Richtungshinweis, MRV/Rahmenwerk als
Heuristik beschriftet. **GO-21: WHR/WHtR/Bauchumfang/BMI mit
WHO-Quelle und Jahr**, geschlechtsabhängig, ohne Geschlecht keine
Schwelle. **G-89: die vier Traditionen als beschriftete Heuristik,
ohne Richtungsfarbe; FFMI bleibt draussen.** Ein
**Registry-Widerspruch zum Auftragstext** ist gemeldet (WHR Frauen).
Tests grün, Typecheck grün.

---

## Wo die Registry liegt

`[cmd]` **`backup/kimi-research/Kimi_Agent/supplement_performance_database/data/evidence/`** —
die Haupt-Registry `constant_evidence_registry.json` (181 Records mit
`constant_id`, `classification`, `evidence_grade`,
`recommended_product_handling`, `sources`), daneben
`recovery_modality_evidence.json` (32 Records, **alle
REMOVE_NUMERIC_VALUE**, mit `effect_direction`, `endpoint`, PMID) und
`training_structure_registry.json` (13 Records B01–B13). Die vier
Seed-Boni (2,76 / 0,13 / 0,05 / −0,07) stehen dort als
`synthetic_seed_flags: synthetic_demo, not_evidence`.

## Je Konstante: vorher → nachher, mit der Registry-Einstufung

### C-124 — Modalitäts-Boni (REMOVE_NUMERIC_VALUE, 32/32 Zeilen)

| | vorher `[cmd]` | nachher `[cmd]` |
|---|---|---|
| `MODALITY_BONUS` (motor.ts) | 11 Punktwerte (sauna 2.0 … active_recovery 0.5) | **entfernt** — `MODALITY_EVIDENZ` mit Aussage/Grad/Registry-ID/PMID |
| `MAX_DAILY_BONUS` | 5.0 | **entfernt** (gehörte zum Bonussystem) |
| `MODALITY_LOG.scoreDelta` | +4/+6/+8/+2/+3 | **entfernt** — `immediate`/`nextDay` bleiben (Nutzer-Ratings, keine behaupteten Effekte) |
| `calcRecoveryScore` | `score = subtotal + bonus.capped` | `score = subtotal` |
| Summe numerischer Bonuswerte | **17** | **0** |

Die Kachel zeigt jetzt z. B. **„Sauna: verbessert die
Ausdauerleistung in Hitze (Grad C, PMID 16877041 · 2007)"** statt
„+2.0". Ehrlich in beide Richtungen: Kaltwasser lindert Muskelkater
(A), **dämpft aber chronisch die Hypertrophie-Anpassung (A)**;
statisches Dehnen hat **keinen** Effekt auf Muskelkater (A). Fünf
Katalog-Modalitäten (Foam Rolling, Yoga, Meditation, Nap, Breathwork)
haben **keine Registry-Zeile** — sie behaupten jetzt nichts
(„ohne Eintrag im Evidenzregister"), statt einen Wert zu erfinden.

`[cmd]` **Die Datenbank war schon sauber:** `recovery.modality_log`
(178 Zeilen) und `recovery.scores` (340) tragen durchweg
`0.00 / pending_c124_e5` — die not_evidence-Seeds wurden nie live
eingespielt. Der Quelltext-Hinweis der Score-Kachel sagt statt „wartet
auf C-124" jetzt „ohne Punktbonus — C-124: keine Evidenz für
Bonuswerte". `[read]` Ob Codex die `pending`-Quelle in der Pipeline
umbenennt, ist sein Bereich — Befund gemeldet, nicht übergriffen.

### C-105 — Volume Landmarks (RP_VOLUME_LANDMARKS_FRAMEWORK: HEURISTIC/LABEL_HEURISTIC)

| | vorher `[cmd]` | nachher `[cmd]` |
|---|---|---|
| `mav` je Muskelgruppe | 10 Werte (18/20/16/…) | **0 — DO_NOT_IMPLEMENT, kein Ersatzwert** |
| Zonen im Balken | 4 (mit „approaching MRV" via MAV) | 3: unter MEV · MEV–MRV · über MRV |
| `feedbackVerdict` | „MAV +1" | „can handle more" — Richtung ohne Zahlwert |
| Feedback-Pseudocode | `personal_mav += 1` | Richtungs-Vorschlag; die MRV-Kappung bleibt, als Heuristik markiert |
| Beschriftung | „RP Hypertrophy defaults" | **„RP-Rahmenwerk — Heuristik (Grad E) · Orientierung, kein Messwert"** + Fussnote mit der gestützten Richtung (Meta-Regression, Sports Medicine 2017) |

Die MEV/MRV-Zahlen je Muskelgruppe **bleiben stehen** — als
Orientierung beschriftet, wie der Auftrag es erlaubt
(USE_DIRECTIONAL_GUIDANCE für MEV, LABEL_HEURISTIC für MRV). Der
Wächtertest, der die Vorlagen-Formeln festhält, ist auf die neue
Wahrheit umgestellt: er schlägt jetzt an, wenn ein Bonus- oder
MAV-Wert **zurückkommt**.

### GO-21 — WHO-Grenzwerte (Grad A, KEEP_NUMERIC)

Neu in `lib/goals/verhaeltnisse.ts` (reine, testbare Funktionen) und
als „Einordnung"-Kachel im Physique-Tab, **jede Zahl mit Quelle und
Jahr daneben**, Sprachregel „unter/über dem Grenzwert", nie „gesund":

| Konstante | Registry | Wert |
|---|---|---|
| WHR | BP-WHR-001, A | ab **0,90** (M) / **0,85** (F) — WHO 2008 |
| WHtR | BP-WHTR-002, A | Grenzwert **0,5** — Ashwell/NICE |
| Bauchumfang | BP-WC-003, A | zweistufig 94/102 cm (M), 80/88 cm (F) — WHO 2008 |
| BMI | BP-BMI-004, A | WHO-Klassen (TRS 894, 2000) **mit dem Registry-Vorbehalt in der Kachel:** bei hoher Muskelmasse ohne Aussage, Taille mitlesen |

**Ohne gesetztes Geschlecht keine Schwelle** — WHR und Bauchumfang
zeigen dann nur das Verhältnis bzw. den Umfang, mit dem Satz
„Grenzwert erst mit gesetztem Geschlecht".

`[cmd]` **Der gemeldete Widerspruch:** Der Auftrag nannte für Frauen
**„unter 0,80"**. Die Registry (BP-WHR-001) und die zitierte WHO
2008-Konsultation führen **0,85** („substantially increased risk";
0,80 ist dort die niedrigere Stufe „increased risk" des
*Bauchumfang*-Rasters, nicht der WHR). Gebaut ist die Registry-Zahl
mit ihrer Quelle — eine Zahl mit falscher Quellenangabe wäre schlimmer.
**Nicht selbst aufgelöst: wenn Tom 0,80 will, ist das eine Zeile,
aber dann ohne das WHO-2008-Etikett.**

### G-89 — Proportionen als Heuristik (Grad E, LABEL_HEURISTIC)

Neue Kachel „Traditionswerte — Heuristik aus der
Bodybuilding-Literatur, keine Messlatte": BP-GR-006 (1,618 neben dem
gemessenen Schulter:Taille-Wert, Herkunft Sandow 1894/„Adonis
Index"), BP-CLASSIC-010 (Arm = Hals = Wade, mit den drei gemessenen
Zahlen nebeneinander), BP-REEVES-008 und BP-MCCALLUM-009 als
Formeltext — **Handgelenk, Knöchel und Becken werden nicht gemessen,
also gibt es dort keinen Ist-Vergleich statt eines erfundenen.**
**Keine Einfärbung nach Richtung** (in einer Aufbauphase ist eine
wachsende Taille normal). **BP-FFMI-005 bleibt draussen**
(CONFLICTING_EVIDENCE, DO_NOT_IMPLEMENT) — die Kachel sagt es.

## Nachweise

| Behauptung | Beleg |
|---|---|
| Registry lokalisiert | `[cmd]` Pfad oben; 181/32/13 Records gezählt |
| 17 → 0 Bonuswerte | `[cmd]` Zählskript gegen `git show HEAD:` vs. Arbeitsbaum (11+1+5 → 0+0+0) |
| MAV 10 → 0 | `[cmd]` dasselbe Skript (mav-Werte 10 → 0, Verwendungen 5 → 0) |
| WHO/Heuristik eingebaut | `[cmd]` Registry-IDs im Code: WHO 0 → 5, Heuristik 0 → 8, FFMI-Vermerk 1 |
| DB-Seeds | `[cmd]` `modality_log` 178 und `scores` 340 Zeilen: alle `0.00 / pending_c124_e5` — die 2,76er-Seeds waren nie live |
| Wächter | `[cmd]` `v2-attrappen.test.ts` prüft jetzt die Abwesenheit von `MODALITY_BONUS`/`MAX_DAILY_BONUS` und die Anwesenheit der Registry-IDs |
| Typen und Tests | `[cmd]` Typecheck grün (Supplements-Fehler eines parallelen Agenten ausgenommen), Tests grün (fail 0) |
| Bilder | `backup/evidenz/`: Recovery-Modalities, Training-Landmarks und Goals-Physique, je **hell + dunkel** (sechs Bilder; die Attrappen-Marken der Entwurfs-Tabs stehen). Der Landmarks-Schuss zeigt die drei Zonen, „in MEV–MRV band" und „can handle more" ohne MAV |

## Randbefund: warum der Dev-Server „nach jedem Lauf" hing — gelöst

`[cmd]` Während der Nachweise hing der Server erneut; die Diagnose
fand die Wurzel: **fünf `next dev`-Instanzen liefen parallel gegen
dieses Repo** (3200 mit 1,5 GB RSS hängend; 3201/3205/3207/3310
munter antwortend). Mechanismus: `pnpm dev` bei besetztem Port →
**Next weicht stumm auf den nächsten Port aus** → jede Instanz hält
eigene Watcher, jeder Edit kompiliert fünffach. Headless-Leichen und
Docker waren es nicht (0 bzw. healthy, gemessen).

**Der Dauerfix:** `tools/server.py`
(status/aufraeumen/start/neustart) — startet nur bei freiem Port
3200, weicht nie aus, räumt Duplikate und alte Headless-Chromes
(> 15 min), fasst Admin/Coach (3210/3220) nie an, kein Fenster.
`[cmd]` Gegengeprobt: neustart räumte die fünf, der frische Server
stand in 6 s, /login antwortet in 0,1 s. Die Regel steht in
`CLAUDE.md`: **nie `pnpm dev`/`npx next dev` von Hand.**

## Was nicht angefasst wurde

- **`supabase/_pipeline/`** (Codex): die `pending_c124_e5`-Quelle in
  Seeds/Pipeline bleibt, wie sie ist — Befund für Codex: sie kann
  jetzt in eine endgültige Quelle umbenannt werden.
- **`apps/web/nutrition`** (Claude Code): unberührt.
- **Keine Zahl erfunden:** entfernte Werte sind `null`/weg; die fünf
  registerlosen Modalitäten behaupten nichts.
- `LANDMARKS`-Zahlen (MEV/MRV je Muskelgruppe) stehen als
  Orientierung — beauftragt, beschriftet.
