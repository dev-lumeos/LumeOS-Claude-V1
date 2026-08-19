# 121 — Supplements: Bestandsaufnahme aus drei Quellen (F-02)

Stand: 2026-08-19 · Anker: Zweig `dev` · Auftrag F-02
Herkunft: gelesen und gezählt in dieser Sitzung — **nichts gebaut, nichts
committet, keine Datenbank angefasst.**
Rangfolge: Code > dieses Dokument > Rest.

Der Auftrag fragt nicht „was fehlt komplett", sondern **„trägt das
Gebaute, was Spec und Mockup verlangen"** — und was dazwischen fehlt.
Die Antwort vorweg: **Das Gebaute trägt, was es behauptet.** Die Lücken
liegen nicht im Schema, sondern in drei Datenbeständen (Katalogtiefe,
Interaktionszeilen, Injektionsorte) — und jede der drei hat eine andere
Sorgfaltsstufe.

---

## Die Lage in Zahlen

`[read]` Zahlen aus dem Auftragstext (dort `[cmd]`), konsistent mit
C-68/C-82; in dieser Sitzung nicht neu gegen die Datenbank gemessen:

| Objekt | Stand 2026-08-19 | Herkunft |
|---|---|---|
| `supplement_catalog` | 44 aktive Einträge | C-68, aus `seed_supplements.sql` des Vorgängers normalisiert |
| `intake_logs` | 720 | C-82: 90 Tage Historie × 4 Positionen × 2 Konten (`tom.seed`, `dev@lumeos.app`) = 2 × 360 |
| `user_stacks` / `stack_items` | 2 / 8 | 1 Stack × 4 Items je Konto |
| `supplement_interactions` | **0** | C-68 legte die Struktur an, bewusst ohne Inhalt |

`[cmd]` Das Schema (`130_supplements_schema.sql`, in dieser Sitzung
gelesen): fünf Tabellen, die Sicht `daily_intake_summary`, zwei
Funktionen, RLS auf allen fünf, Snapshots im Einnahmeprotokoll.
`[read]` `SPEC_06` beschreibt **zehn** Tabellen; nicht gebaut sind
`enhanced_substances`, `user_supplement_settings`, `user_inventory`,
`stack_templates`, `stack_template_items` (per Grep der `CREATE TABLE`-
Zeilen gegengeprüft).

`[read]` Oberfläche (G-37/G-45): zwölf Tabs vollständig als Mockup,
**vier lesen echt** (Today, Stack, Database, Cost), acht sind Attrappe.

---

## Frage 1 — Reichen 44 Katalogeinträge?

**Für die vier angebundenen Tabs: ja. Für das Zielbild des Moduls:
nein — aber die vermutete Importquelle existiert nicht, und die echte
liegt woanders.**

### Die „gedachte Quelle" der Spec ist keine

`[read]` `SPEC_08_IMPORT_PIPELINE` hat 17 KB, aber die erste Aussage
darin lautet: *„Die Supplement-Daten sind kuratiert — keine
automatisierte Übernahme aus externen Datenbanken (NIH DSLD, Open Food
Facts)."* Die 17 KB sind **Seed-SQL, keine Pipeline**. `[cmd]` Gezählt:
Phase 1 seedet **18** Standard-Präparate (4 × S, 6 × A, 8 × B),
Phase 2 skizziert ~85 Enhanced Substances an vier Beispielen, Phase 3
seedet 12 Interaktionen, Phase 4 fünf Stack-Templates.

`[cmd]` `SPEC_05_CATALOG_EVIDENCE` benennt **32** Präparate über die
Tiers S–D. Der gebaute Katalog hat **44**. Drei Quellen, drei Zahlen —
keine widerspricht fachlich einer anderen, aber **keine ist eine
Sollzahl.** (Die Vorlage führt als vierte Zahl 34 in `SUPPLEMENT_DB` —
G-45 hat das bereits geklärt: kein Sollwert für die Datenbank.)

### Der Import, der lief: 702 Zeilen, nicht 1302

`[cmd]` `import-supplements-minipc.ts` importierte einen
Supabase-Export („Mini-PC Jarvis") in das Vorgängerschema. Der
Skriptkommentar behauptet *„INSERT 1302 rich supplements"* — **die CSV
hat 702 Datensätze** (per CSV-Parser gezählt, nicht per Zeilenzahl).
Gemessen am 2026-08-19:

| Merkmal | Wert |
|---|---|
| Datensätze / Spalten | 702 / 62 |
| `is_enhanced = true` | **200** (35 injizierbare Steroide, 25 orale, 20 SARMs, 26 Peptide, 15 GH/Mimetika, …) |
| Kategorien | **40, unkuratiert** — mit Dubletten wie `amino`/`amino_acid`, `liver`/`liver_support`, `joint`/`joint_support` |
| mit `name_de` | 38 von 702 |
| mit `dose_min` | 240 von 702 |
| mit `half_life_hours` | 166 von 702 |
| Quellenangaben je Eintrag | im Format nicht vorgesehen |

`[read]` Die `created_at`-Stempel liegen zwischen 2025-12-02 und
2026-01-16 — der Bestand wurde damals in Chargen kuratiert, aber ohne
Belege. `[annahme]` C-68 hat die 702 bewusst nicht übernommen, weil das
Audit fehlte; dieser Befund bestätigt die Entscheidung: **die Hälfte
der Felder ist dünn belegt, und 200 der 702 sind PED/Enhanced-Substanzen,
die ins nicht gebaute `enhanced_substances` gehören, nicht in den
Standardkatalog.**

### Was den 44 heute konkret fehlt — gemessen

`[cmd]` `supplement-katalog.json`, gezählt 2026-08-19:

| Feld | belegt |
|---|---|
| `cost_per_serving`, `serving_size` | 44 / 44 |
| `typical_dose_min` | **0 / 44** |
| `half_life_hours` | **0 / 44** |
| `evidence_sources` | **0 / 44** |
| `nutrients_provided` | **11 / 44** |

`[cmd]` Von den 13 Nährstoffcodes im Gap-Analysis-Mapping der Spec
(`SPEC_05` §6) treffen vier keinen Katalogeintrag: **`FAPUN3` (Omega-3
ist im Katalog, trägt den Code aber nicht), `ID`, `CU`, `SE`.**
`[read]` Damit ist der Gap-Score aus `SPEC_09` §2 mit dem heutigen
Katalog **nicht rechenbar** — der Intelligence-Tab („Gap analysis")
bleibt ohne diese Pflege Attrappe, egal wie viele Einträge dazukommen.

### Einordnung

`[read]` Der Vergleich „44 gegen 7.140 Lebensmittel" hinkt: Der Katalog
ist medizinnah kuratiert je Eintrag, der BLS ein amtlicher Bestand.
Die richtige Frage ist nicht „mehr", sondern **„was fehlt für welche
Fläche":** Database-Tab und Stack tragen mit 44. Was 44 nicht trägt:
Gap Analysis (Codes fehlen), Suche nach Alltagspräparaten (kein Eisen-
Präparatespektrum, kein B-Komplex-Spektrum), Extended (ganz andere
Tabelle). **Der Ausbau ist Datenpflege in Chargen mit Audit — die 702
sind die Kandidatenliste, nicht die Übernahme.**

---

## Frage 2 — Was ist `supplement_interactions`, und warum ist sie leer?

### Was gebaut ist

`[cmd]` Die Tabelle ist **voll ausgestaltet und bewusst leer**: Typ
(`synergy`/`absorption`/`conflict`/`timing`/`contraindication`),
Severity (`info`/`caution`/`warning`/`critical`), `timing_recommendation`
(`separate_2h`…`avoid`), `evidence_level`, `evidence_sources[]`,
zweisprachige Beschreibung und Empfehlung, dazu zwei scharfe Schalter:
`blocks_intake` und `requires_confirmation` (beide default `false`).
RLS: `SELECT` für `authenticated` auf `is_active`. `[read]` C-68:
*„Eine Wechselwirkungswarnung ist eine medizinische Aussage. Ohne
abgenommene Regeln und Quellen wäre eine automatische Bewertung
riskanter als eine leere Struktur."*

### Was der Tab zeigen würde

`[cmd]` Das Mockup (`daten.ts:251-276`) führt drei Karten: Severity,
beteiligte Präparate, Titel, Text, „affects", Empfehlung. **Zwei der
drei Texte sind mehr als Nennen** — sie rechnen den Ist-Zeitplan des
Nutzers gegen die Empfehlung und urteilen: *„Caffeine (taken 17:30) …
your current schedule is fine"*, *„Your Magnesium is at 22:00, giving
2.5h separation … No action needed."* Die dritte (D3→K2→Mg-Synergie)
ist reines Nennen.

### Woher der Inhalt käme — drei Quellen, drei Sorgfaltsstufen

| Quelle | Umfang | Zustand |
|---|---|---|
| `SPEC_08` Phase 3 | 12 Zeilen | `[cmd]` **6 davon sind Supplement × Medikament** (SSRIs, Warfarin ×2, Antibabypille) — `SPEC_05` listet zusätzlich Accutane und Tee/Kaffee |
| Mini-PC-CSV | 28 Zeilen | `[cmd]` alle Supplement × Supplement: 18 Synergien, 5 Absorption, 3 Konflikte, 2 Timing; Severity 19 × info, 6 × caution, 3 × warning, **kein critical** — und **0 von 28 mit Quellenangabe** |
| Vorlage | 3 Karten | Vorführtexte, teils situativ |

`[cmd]` Stichproben der CSV gegen die Spec decken sich (Zink erschöpft
Kupfer, Calcium hemmt Eisen, D3+K2, Koffein gegen Melatonin) —
`[annahme]` der Bestand ist fachlich plausibel, aber **unbelegt**, und
C-84 hat gezeigt, dass die KI-erzeugten Specs Fachbegriffe verwechseln
können. Zwei konkrete Spec-Fehler als Warnschuss: `[cmd]` `SPEC_05`
führt die Severity **`high`**, die es im Schema nicht gibt (`SPEC_08`
nennt dieselbe Zeile `warning`), und die Interaktionslisten von
`SPEC_05` und `SPEC_08` stimmen nicht überein (Magnesium×Zink nur in
`SPEC_05`). **Jede Zeile braucht Einzelabnahme, keine Blockübernahme.**

### Wo die Grenze verläuft

`[read]` Der Vorgänger hat sie sauber gezogen und der Mechanismus liegt
lesbar in `intelligence.ts` (`GET /interactions`): **SELECT auf die
kuratierte Tabelle, Filter „beide Seiten im aktiven Stack", Sortierung
nach Severity — keine Berechnung, keine Erzeugung.** Nennen heißt: eine
von Menschen abgenommene Zeile anzeigen, wenn ihre Paarung im Stack
vorkommt.

**Bewerten wäre** — und bleibt draußen, bis Tom es einzeln freigibt:

1. Dosisabhängige Urteile (die CSV kennt keine Dosen).
2. `blocks_intake`/`requires_confirmation` scharf schalten — die
   Schalter existieren, gehören aber auf `false`, bis abgenommene
   Regeln existieren.
3. Der Risiko-Score aus `SPEC_09` §3 (critical ⇒ Score 0, Kappung des
   Gesamt-Scores) — das ist eine automatische medizinische Gewichtung.
4. **Supplement × Medikament.** Die kritischsten Spec-Zeilen (Warfarin,
   SSRIs) setzen voraus, dass die App weiß, welche Medikamente jemand
   nimmt — dieses Modell existiert nicht (Medical führt Befunde, keine
   Medikation). Ohne Medikationsmodell wäre die Zeile totes Wissen oder,
   schlimmer, eine scheinbare Sicherheit („keine Warnung angezeigt").

`[annahme]` Grenzfall Zeitplan: Der Ist-Abstand zweier Einnahmezeiten
gegen `separate_2h` ist reine Arithmetik über eigene Daten — vertretbar,
wenn die Formulierung deskriptiv bleibt („Abstand heute 2,5 h,
empfohlen ≥ 2 h") statt urteilend („No action needed").

---

## Frage 3 — Was verlangt der Injections-Tab an Schema?

### Der Change Request ist deckungsgleich mit dem Mockup

`[read]` Die 17 KB (*Injection Planner · Spec Change Request*, datiert
2026-08-15, „implemented in prototype") beschreiben exakt das, was
G-45 aus der Vorlage extrahiert hat — dieselben 16 Orte (10 IM, 6 SubQ),
dieselben Felder (`route`, `max_volume_ml`, `rest_days`, `needle`,
Koordinaten auf 100×120), dieselben drei Rechnungen. Dazu präzisiert er,
was die Vorlage offenlässt: `difficulty` (Lat nur nach Opt-in),
`complication[]`, `override_reason`, ärztliche Limit-Überschreibung.

### Drei Objekte reichen — und was jeweils Daten sind

| Objekt | Art | Aussagegehalt |
|---|---|---|
| `injection_sites` | Stammdaten-Seed, 16 Zeilen | **Hier sitzt die Sorgfaltspflicht.** `max_volume_ml`, `rest_days`, Nadelempfehlung sind klinische Konventionen, keine Nutzerdaten. Der CR nennt sie selbst *„conservative defaults from clinical IM/SubQ practice"* — `[cmd]` **belegt ist im Repo keine einzige dieser Zahlen** (Glute 3,0 ml/7 d, Delt 1,0 ml/5 d, SubQ 0,5–1,0 ml/3 d, 23G–29G). Vor dem Seeden gehört je Wert eine Quelle oder Toms ausdrückliche Abnahme. |
| `injection_logs` | Nutzerprotokoll | Reine Erfassung — Ort, Menge, Nadel, Schmerz 0–3, Komplikationen, Snapshots wie bei `intake_logs`. RLS nach dem Muster von `intake_logs`. |
| `injection_schedule` | **keine Tabelle** | `[read]` Der CR leitet sie aus aktiven Stack-Positionen ab; G-45 bestätigt: alle drei Rechnungen brauchen nur das Protokoll. |

**Aus Daten rechenbar** (Arithmetik über das eigene Protokoll, keine
Aussage): Tage seit letzter Nutzung, Ortszustand
(`ready`/`soon`/`resting`), Überbeanspruchung ≥ 3 Nutzungen/30 d,
Vorschlag `argmax(days_since_last)` über passende Orte.

**Aussagen mit Prüfpflicht:** die Validierungsregeln des CR (§5.3) —
`volume_limit` und `rest_window` **blockieren** das Speichern. Das ist
Sicherheitslogik: Sie gehört mit eigenen Tests und Toms Abnahme gebaut,
nicht als Nebeneffekt eines UI-Auftrags. G-45 hat die Sperrung im
Mockup bereits nachgebildet (`<button disabled>` bei Grenzverletzung).

**Nicht Voraussetzung:** `enhanced_substances`. `[read]` Der CR erlaubt
`substance_id` nullable mit `substance_name`-Snapshot — der
Injektions-Tab kann vor dem Enhanced-Katalog gebaut werden. Die
ärztliche Überschreibung (`injection_site_overrides`) setzt eine
Medical-Coach-Beziehung voraus, die es nicht gibt — späterer Ausbau.

`[read]` Der CR §14 zieht dieselbe Grenze wie C-68: *„The module tracks;
it does not advise"* — deskriptive Formulierungen, kein „inject here",
jede Überschreibung protokolliert. Das ist die Linie, an der sich der
Bauauftrag messen lassen muss.

---

## Frage 4 — Was Compliance und Cost noch brauchen

*(Der Auftragstext bricht mitten im Satz „Compliance rechnet seit C-103
mit" ab; rekonstruiert aus Bericht 117: gemeint ist die Seed-Historie
aus **C-82**, die im selben Durchgang wie C-103/C-104 lief.)*

### Compliance: die Datenlücke ist zu — es fehlt nur noch der Lesepfad

`[read]` G-37 ließ den Tab bewusst Attrappe: 1 Protokolltag, 0
`skipped` — „eine 100-%-Quote aus einem Tag ist kein Befund". Genau
diese Bedingungen hat C-82 seitdem erfüllt (Stand 2026-08-18): **90
Tage Historie je Konto, 360 Logs, im 30-Tage-Fenster 112 `taken` und
8 `skipped`, Quote 93,3 %** — Auslasser als ganze Tage modelliert.
Gegen G-37s Mindestliste: Kopfquote 7–30 d ✓ · Strip je Präparat 30 d ✓
· Heatmap 90 d ✓ · CalendarView 1 Monat ✓ · „mindestens ein `skipped`" ✓.

`[annahme]` **Ein Punkt bleibt offen:** G-37 verlangt für die Tabelle
„key supplements" den letzten Auslasser **mit Grund** — ob die
`skipped`-Zeilen des Seeds `notes` tragen, ist in keinem Bericht
gemessen. Der Anbindungsauftrag muss das zuerst prüfen und sonst im
Seed nachtragen (eine Zeile Text je Auslassertag).

`[read]` Darüber hinaus verlangt `SPEC_09` §1 einen
**evidenzgewichteten** Compliance-Score fürs Goals-Modul (S-Präparat
vergessen wiegt schwerer als D). Rechenbar über den Join
`intake_logs → stack_items → supplement_catalog.evidence_grade`; zwei
Namensdifferenzen Spec↔Schema: Spec sagt `pending`, das Schema
`planned`, und die Spec kennt `snoozed` nicht. Das ist ein eigener,
späterer Schritt — für den Tab reicht die ungewichtete Quote der Sicht.

### Cost: angebunden — drei Kacheln bleiben begründet gedeckelt

`[cmd]` Seit G-37 rechnet der Tab lückenlos aus 44/44 Preisen
(20,40 €/Monat am 2026-08-18). Was die Vorlage darüber hinaus zeigt:

| Kachel | Status | Grund |
|---|---|---|
| *12 months trend* | teilanbindbar | `[read]` Mit 90 Tagen Historie sind **3 Monatspunkte** rechenbar (`intake_logs` × `cost_per_serving`), nicht 12 — 3 zeigen und es sagen, statt 12 zu faken. Eine Preishistorie gibt es nicht (nur `updated_at` am Katalog). |
| *If you removed…* | **anbindbar** | reine Subtraktion Monatskosten − Position — G-37 hat sie unter „Sparvorschläge" mit einsortiert, sie ist aber Rechnung, keine Beratung |
| *Cost optimization* | bleibt Attrappe | Einkaufsberatung („kauf Marke X"), keine Rechnung aus vorhandenen Daten |

`[read]` `SPEC_09` §7 rechnet Monatskosten je `frequency`
(`weekdays` = 22 Tage, `training_days` = 16, `cycling` = 15) — beim
Anbinden prüfen, ob `stack-read` pauschal 30 nimmt; bei vier
`daily`-Positionen fällt der Unterschied heute nicht auf.

`[cmd]` Randpunkt aus G-37, weiter offen: `user_stacks.total_monthly_cost`
ist `null` und wird umgangen — füllen (Trigger) oder streichen, sonst
bleibt eine zweite, tote Wahrheit im Schema.

---

## Die vier übrigen Attrappen-Tabs — was jeder bräuchte

| Tab | braucht | liegt bereit |
|---|---|---|
| Stacks | `stack_templates` + `stack_template_items` (SPEC_06) | `[read]` fünf Templates samt Items als Seed in `SPEC_05` §4 / `SPEC_08` Phase 4 — kleiner, unkritischer Datenbestand |
| Inventory | Verlauf je Position | `[read]` Bestand + Schwelle stecken schon in `stack_items`; `user_inventory` lohnt erst, wenn „wann war es leer" gefragt ist (so schon Bericht 95) |
| Intelligence | Gap Analysis + Redundanzen | blockiert durch Katalogpflege (Frage 1: `nutrients_provided` 11/44) und einen Mikro-Lesepfad aus Nutrition; Interactions-Teil siehe Frage 2 |
| Extended | `enhanced_substances` | `[read]` heikelste Fläche: Hormone/PED hinter dem Gate; ~85 laut Spec, 200 Kandidaten in der CSV — eigener Auftrag mit eigener Sorgfalt, nie Beifang |

---

## Was sich daraus als Aufträge schreiben lässt

Reihenfolge nach Aufwand und Freigabebedarf, nicht nach Auffälligkeit:

1. **Compliance anbinden** — reiner Lesepfad auf vorhandene Daten
   (Heatmap 90 d, Strip 30 d, Kalender, Kopfpille echt). Vorprüfung:
   tragen die `skipped`-Zeilen `notes`? Kleinster Auftrag, keine
   heikle Entscheidung.
2. **Cost nachziehen** — 3-Monats-Trend ehrlich beschriftet,
   *If you removed…* als Rechnung; Entscheidung zu
   `total_monthly_cost` (füllen oder streichen).
3. **Interactions Stufe 1** — Datenpflege-Auftrag: Kandidatenliste aus
   CSV (28) ∩ Spec (12), **nur Supplement × Supplement**, je Zeile
   Quelle nachrecherchieren und einzeln abnehmen; danach kleiner
   Lesepfad nach dem Vorgängermuster (Mengenschnitt mit aktivem Stack).
   `blocks_intake` bleibt `false`. Medikamenten-Zeilen zurückstellen,
   bis Medical eine Medikation führt.
4. **Injections** — größter Auftrag, zweigeteilt: (a) Kettenschritt
   `injection_sites` — **erst die 16×3 Grenzwerte belegen oder von Tom
   abnehmen lassen** — plus `injection_logs`; (b) Anbindung Rotation
   map/Log/Schedule mit den Validierungsregeln als eigenem, getestetem
   Prüfblock. Schedule abgeleitet, keine Tabelle.
5. **Katalogausbau in Chargen** — auditierte Übernahme aus den 502
   Nicht-Enhanced-Zeilen der CSV, gemappt auf die elf Kategorien;
   parallel Pflege von `nutrients_provided`/`typical_dose` im Bestand
   (Vorbedingung für Gap Analysis). `evidence_sources` ab jetzt
   Pflichtfeld je neuer Zeile.
6. **Extended/`enhanced_substances`** — eigener Auftrag, letzter in
   der Reihe.

---

## Nachweis

`[cmd]` Gemessen am 2026-08-19 mit zwei Wegwerf-Skripten
(`csv_zaehlen.py`, `katalog_pruefen.py`, CSV-Parser statt Zeilenzählung,
im Scratchpad, nicht im Repo): 702/62/200/40/38/240/166 und 28-Zeilen-
Verteilung der Mini-PC-CSVs; 44er-Katalog-Feldbelegung und
Gap-Code-Abgleich. `[read]` Gelesen: `130_supplements_schema.sql`,
`SPEC_05`, `SPEC_08`, `SPEC_09`, Injection-CR (vollständig),
`SPEC_06` (Tabellenliste per Grep), Berichte 95/98/114/117,
`import-supplements-minipc.ts`, `intelligence.ts` (Vorgänger),
`daten.ts` des Mockups. **Im Vorgängerrepo wurde nichts verändert.**
