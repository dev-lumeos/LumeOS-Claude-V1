---
nr: A-54
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: A-52
kinder: []
entscheidung: null
beruehrt:
  dateien:
    - docs/punkte/00-LIESMICH.md
zahlen:
  gemessen: 2026-08-27
  punkte_gesamt: 244
  ohne_modul: 140
  ohne_angelegt: 23
  waechter_befunde: 202
agent: codex
beauftragt: 2026-08-27
erledigt: 2026-08-27
commit: OFFEN
---

# A-54 — die Punkte modulfaehig machen

## Befund

`[cmd]` **Nach A-52 liegen 244 Punkte in `docs/punkte/todos/`,
Frontmatter vollstaendig, beide Richtungen geprueft.** Drei Dinge
stehen der Modulsicht im Weg:

### 140 von 244 tragen `modul: quer`

`[cmd]` **Die Verteilung:**

    quer  140    nutrition 30    medical 20    supplements 18
    coach  11    recovery  11    training  9   goals      5

`[read]` **57 Prozent ohne Modul.** Tom will modulweise arbeiten —
**solange mehr als die Haelfte `quer` heisst, geht das nicht.**

`[read]` **Und `quer` ist nicht falsch, sondern unbestimmt:** die
Migration durfte nicht raten, das war richtig. **Jetzt darf gelesen
werden.**

### 23 tragen `angelegt: null`

`[cmd]` Darunter `goals-c-0006`, `goals-e-0004`, `quer-a-0006`,
`quer-e-0007`, `quer-e-0008`. `[read]` **Sie trugen im alten
`TODO.md` kein Datum** — kein Migrationsfehler, sondern ein Erbe.

### 105 Dateipfade zeigen ins Leere

`[cmd]` **Claude Codes Waechter meldet 202 Befunde gegen den
migrierten Bestand**, darunter **105 nicht existierende Dateien**,
`wissen.entity_transporters` und `medical.medications`.

`[read]` **Das ist der Beleg fuer die ganze Reform:** eine Liste, die
seit Wochen als Arbeitsgrundlage diente, nennt 105 Dateien, die es
nicht gibt. **Der alte Waechter hat sie nie gesehen.**

## Auftrag

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **Du hast heute dreimal meine Zahl
berichtigt** — 20 statt 31 Regeln, 43 statt 47 C-Punkte, 6.084 statt
6.600 Zeilen. **Meine Zaehlungen scheitern regelmaessig am Abgrenzen
einer Kategorie.**

### Reihenfolge — das ist wichtig

`[read]` **Claude Code baut in A-53 einen Waechter mit Sollstand 202.
Er wartet auf dich.** Wenn du parallel Befunde behebst, aendert sich
die Zahl unter ihm weg. **Sag im Bericht, wie viele Befunde nach
deiner Arbeit uebrig sind** — daraus wird sein Sollstand.

### 1 · Die 140 `quer`-Punkte zuordnen

**Lies je Punkt den Befundtext und bestimme das Modul.** Erlaubt sind
`supplements`, `medical`, `nutrition`, `training`, `recovery`,
`goals`, `coach` — und `quer` bleibt, **wo es wirklich quer liegt.**

`[read]` **`quer` ist eine gueltige Antwort, kein Restehaufen.** Ein
Punkt ueber das Design-System, den Gate-Ablauf oder die Arbeitsweise
gehoert dorthin. **Ein Punkt ueber `intake_logs` nicht.**

`[read]` **Wenn ein Punkt zwei Module beruehrt: nimm das, in dem die
Arbeit stattfindet, nicht das, in dem sie sichtbar wird.** Und nenn
solche Faelle im Bericht — **wenn es viele sind, taugt das Feld
nicht und braucht eine Liste statt eines Werts.**

**Der Dateiname traegt das Modul** — er muss mitwandern. `[cmd]`
`git mv` stagt sofort; **`git diff --cached --name-only` lesen, bevor
du weitergehst.**

### 2 · Die 23 ohne `angelegt`

`[read]` **Nicht erfinden.** Wenn `git log` das Anlegedatum der Zeile
in `TODO.md` hergibt, nimm es und sag, woher. **Sonst bleibt `null`
und wird als Erbe gemeldet.**

### 3 · Die falschen Pfade und Tabellen

`[read]` **Je Fund entscheiden, nicht pauschal loeschen:**

    Pfad hat sich geaendert       -> berichtigen, mit [cmd] wohin
    Datei gab es nie              -> Eintrag entfernen, im Bericht nennen
    Tabelle liegt anderswo        -> Schema berichtigen
                                     (`wissen.` -> `supplements.`)
    Tabelle gibt es nicht         -> Eintrag entfernen, Punkt neu fassen

`[read]` **Der letzte Fall ist der wichtige:** ein Punkt, der eine
Tabelle nennt, die es nie gab, **ist inhaltlich fragwuerdig, nicht
nur formal falsch.** Nenn diese Punkte einzeln — **aus ihnen wird
vermutlich ein Loeschantrag an Tom.**

### Was nicht zu tun ist

**Keinen Punkt zusammenlegen, streichen oder umformulieren.**
`[read]` **Auch nicht die, deren Tabellen es nicht gibt** — melden,
nicht entscheiden.
**Keine Nummern neu vergeben.**
**`TODO.md` und `ERLEDIGT.md` nicht anfassen** — sie sind die
Sicherung.
**`tools/` nicht anfassen** — Claude Code arbeitet dort an A-53.
`apps/` und `supabase/` nicht anfassen. Nicht committen, nicht
stagen, nicht pushen.

### Nachweis

    Punkte gesamt              Zahl, Soll 244
    je Modul                   Verteilung nachher
    `quer` nachher             Zahl, und je Punkt begruendet
    zwei Module beruehrt       Zahl
    angelegt: null nachher     Zahl
    Pfade berichtigt           Zahl
    Pfade entfernt             Zahl, je einzeln benannt
    Tabellen berichtigt        Zahl
    Punkte mit Tabellen,       je einzeln benannt
      die es nie gab
    Waechter-Befunde nachher   Zahl  <- wird A-53s Sollstand

`[read]` **Gegenprobe:** jede Nummer weiterhin genau einmal, kein
Dateiname doppelt, und **jeder umbenannte Punkt muss unter seiner
Nummer auffindbar bleiben.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Markdown nur per `write_file` mit vollstaendigem Inhalt.**
`[read]` **Repo-Text mit Sonderzeichen nicht ueber die
Standardeingabe einer interaktiven Python-Sitzung schreiben** — das
hat mir heute fuenf Doppelkodierungen und einen roten Gate-Lauf
eingebracht.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

### Durchgefuehrt

`[cmd]` Alle 140 urspruenglich als `quer` markierten Befunde wurden gelesen. **80** davon haben ein eindeutiges Arbeitsmodul erhalten; Frontmatter und Dateiname wurden zusammen umgestellt. Die Dateien aus A-52 sind noch untracked, daher war `git mv` nicht anwendbar; die ungestagten Dateisystem-Umbenennungen wurden vor und nachher mit `git diff --cached --name-only` kontrolliert: leer.

### Zahlen: Auftrag gegen Messung

| Nachweis | Auftrag | Eigene Messung |
|---|---:|---:|
| Punkte in `todos/` | 244 | **244** |
| `quer` vorher | 140 | **140** |
| `quer` nachher | - | **60** |
| `angelegt: null` vorher | 23 | **23** |
| `angelegt: null` nachher | - | **0** |
| Waechter-Befunde vorher | 202 | **226** |
| nicht existente Dateiangaben vorher | 105 | **125** |
| Waechter-Befunde nachher | - | **55** |

Die 226 statt 202 kommen aus dem aktuellen A-53-Waechter: 125 Dateiangaben, 23 fehlende Daten, 23 Tabellenangaben, 54 `kind_von`- und 1 `kinder`-Befund. Nach dieser Arbeit bleiben exakt die 54 Elternverweise und die eine Kindbeziehung. **A-53 muss seinen Sollstand auf 55 setzen**, nicht auf 202 oder 226; `tools/` wurde nicht angefasst.

### Modulverteilung

    nutrition 56    supplements 38    medical 32    recovery 20
    coach     19    training    14    goals    5     quer     60

Mehrmodul-Befunde, daher bewusst `quer`: **15**. `C-64, C-110, C-159, C-170, C-187, C-201, C-205, C-219, C-241, C-259, C-271, C-279, G-06, G-122, G-141`. Die Arbeit liegt jeweils in einer gemeinsamen Grundlage oder zugleich in mehreren Moduldom?nen; insbesondere betrifft `C-241` Nutrition und Medical, `G-122` fuenf Module und `G-06`/`G-141` den Gesamtausbau. Kein Punkt wurde nur wegen fehlender Detailkenntnis bei `quer` gelassen.

Die weiteren **45** `quer`-Punkte sind bereichsuebergreifende Arbeitsweise, Plattform, Gate, Deployment oder Werkzeugbetrieb: `A-06, A-15, A-16, A-18, A-19, A-20, A-22, A-23, A-24, A-29, A-34, A-38, A-39, A-40, A-42, A-44, A-48, A-51, B-20, B-29, B-30, C-155, C-216, C-295, C-297, C-298, E-08, E-09, E-10, F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-09, G-07, G-58, G-109, G-155, G-175, G-193, G-204, G-206`.

### Anlagedaten

`[cmd]` Fuer alle 23 ehemaligen `angelegt: null` wurde mit `git log --format=%cs --reverse -S <Punkttitel> -- docs/todo/TODO.md` der erste Treffer uebernommen. Die Quellen liegen zwischen 2026-08-01 und 2026-08-21; kein Datum wurde erfunden.

### Ortsbefunde

`[cmd]` **66** Dateiangaben wurden auf einen vorhandenen vollstaendigen Repository-Pfad berichtigt (per `rg --files` gegengeprueft); **59** nicht eindeutig oder nicht vorhandene Angaben wurden nur aus `beruehrt.dateien` entfernt. Ihr woertlicher Befundtext blieb unveraendert.

Entfernte Dateiangaben, einzeln: `C-75: buddy.ts`; `G-159: ansicht.tsx`; `C-180: constant_evidence_registry.json, recovery_modality_evidence.json, formula_evidence_registry.json, fatigue_signal_evidence.json, training_structure_registry.json, symptom_ontology_seed.json, research_hold_registry.json`; `C-183: symptom_ontology_seed.json`; `C-194: data/metadata/sources.jsonl`; `C-200: symptom_ontology_seed.json`; `A-06: tailwind.config.js`; `B-20: protect-paths.ps1, scratchpad/codex-sonde.ps1, codex/hooks.json`; `C-176: biomarkerDetails.ts, nutrientDetails.ts`; `C-216: -finaldb.json`; `C-233: SPEC_06_DATABASE_SCHEMA.md`; `C-259: RESEARCH_STATUS.md, peptides.jsonl, performance_compounds.jsonl, biomarker_explanations.jsonl, evidence/symptom_ontology_seed.json, biomarkerDetails.ts, evidence/biomarker_explanations.jsonl, medication_cam_contract.json, supplement_cam_contract.json, peptide_cam_contract.json, prescription_vision_contract.json, vision_product_match_signals.json, vision_learning_example_schema.json, buddy_capability_map.json, buddy_dependency_graph.json, recovery_modality_evidence.json, training_structure_registry.json, fatigue_signal_evidence.json, population_response_atlas.jsonl, response_confounder_graph.jsonl, response_modifier_graph.jsonl, symptom_biomarker_map.jsonl, personal_baseline_methodology.json, cyp_enrichment.jsonl, transporter_enrichment.jsonl, supplement_dosing_enrichment.jsonl`; `C-261: K_cache/brand_searches.json, _G_ckpt.json, _apps_stage2.json`; `C-182: fatigue_signal_evidence.json`; `C-217: TODO.md`; `A-27: v2-attrappen.test.ts`; `C-260: A.json, peptides.jsonl, performance_compounds.jsonl`; `C-272: RESEARCH_STATUS.md`; `G-162: page.tsx`; `E-14: fix-exercise-media.ts`; `G-25: OneRepMaxCalculator.tsx`.

`[cmd]` Tabellen: `wissen.entity_transporters` in `A-51` wurde nach `supplements.entity_transporters` berichtigt. **22** Tabellenangaben wurden entfernt, weil sie weder in `information_schema` noch als `CREATE TABLE` im gesamten `supabase/`-SQL-Bestand vorkommen. Das sind die einzeln zu pruefenden, inhaltlich fragwuerdigen Punkte: `A-33: medical.jsx`; `A-37: nutrition.diary, nutrition.water, nutrition.micronutrient, nutrition.mealcam_`; `A-43: nutrition.diary, nutrition.water, nutrition.micronutrient, nutrition.mealcam_`; `C-129: medical.medications`; `C-149: nutrition.micronutrient_snapshot`; `C-159: training.high_impact`; `C-181: training.load_spike`; `C-215: recovery.training_load_score, recovery.acwr_for_day, training.load_spike`; `C-259: supplements.jsonl`; `G-06: supplements.jsx`; `G-98: nutrition.jsx`; `GO-24: supplements.substance_catalog`; `C-87: public.is_admin`; `G-173: training.sessions`.

### Nachweis

`[cmd]` `node tools/punkte-pruefen.mjs` prueft nachher 247 Punktdateien (244 `todos/`, drei laufende) und meldet **55** Befunde, ausschliesslich Beziehungen. Es meldet keine fehlende Datei, keine fehlende Tabelle, kein fehlendes `angelegt`, keinen falschen Moduldateinamen und keine doppelte Nummer. `TODO.md` und `ERLEDIGT.md` haben keinen Diff; nichts wurde gestaged oder committed.


## Abnahme

**2026-08-27, Orchestrator. Selbst nachgemessen.**

`[cmd]` **Bestaetigt:**

    Dateien             244, eindeutig
    angelegt: null        0   (waren 23)
    Namensfehler          0   Modul und Nummer passen zum Frontmatter
    quer                 60   (waren 140)
    nutrition 56 - supplements 38 - medical 32
    recovery 20 - coach 19 - training 14 - goals 5

`[read]` **Die Verschiebung ist staerker als eine Umverteilung** —
`nutrition` von 30 auf 56, `medical` von 20 auf 32, `supplements` von
18 auf 38. **Damit ist die Modulsicht brauchbar.**

`[cmd]` **125 Dateipfade, 23 Tabellen und 23 Datumsangaben behoben**,
Sollstand von 226 auf 55 gesenkt.

### Meine Zuspitzung war falsch

`[read]` Ich hatte *,,105 nicht existierende Dateien"* als Beleg fuer
die Reform verkauft. `[cmd]` **Von 125 Pfaden waren 113 blosse
Dateinamen ohne Pfad, nur 12 echte Pfade.** `[cmd]` Von 23 Tabellen
waren **5 gar keine Tabellen** (`.jsx`, `.jsonl` im falschen Feld) und
**2 Funktionen** (`public.is_admin`).

`[read]` **Das ist ein Formfehler der Migration, kein Nachweis
kaputter Punkte.** Meine Zuspitzung war die elfte falsche Abgrenzung
an diesem Tag.

### Die 55, die bleiben

`[cmd]` **54 `kind_von` und 1 `kinder`.** `[read]` **Beides mein
Modellfehler, nicht deine Arbeit:** `kinder` war ein zweites Feld fuer
dieselbe Beziehung und faellt weg; `kind_von` auf erledigte Punkte ist
der Normalfall und wird jetzt gegen `ERLEDIGT.md` aufgeloest.

**Abgenommen.**

