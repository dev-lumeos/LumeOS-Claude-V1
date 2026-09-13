---
nr: C-472
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-471
entscheidung: Sollstand 44 fuer 15 bereits committete Migrationsdateien; neue Datenlogik bleibt rot.
erledigt: 2026-09-08
commit: b31cb284
beruehrt:
  dateien:
    - tools/migration-datenlogik-pruefen.mjs
zahlen:
  gemessen: 2026-09-12
  migrationen: 15
  echte_verletzungen: 44
  fehlerkennungen: 5
---

# C-472 - der Datenlogik-Waechter ist rot

## Befund

C-471 fand den Waechter rot wegen fuenfzehn aelterer, committeter Migrationen C-428 bis C-467. D-17 in `supabase/README.md` verbietet `INSERT`, `UPDATE`, `COPY`, `DELETE`, `TRUNCATE` und `MERGE` in Migrationen; sie gehoeren in `_pipeline/`. Die einzige benannte Strukturausnahme bleibt `public.handle_new_user()` in der Baseline.

## Bericht

### Entscheidung

Alle 15 Dateien enthalten echte ausfuehrbare Datenoperationen. Sie sind bereits committet und liegen als Schritte in der Aufbaukette; daher werden sie nicht nachtraeglich umgeschrieben. C-472 setzt den gemessenen Altbestand auf **44**. Wie bei `punkte-pruefen.mjs` macht jede Abweichung in beide Richtungen rot. Neue Katalogdaten und Backfills gehoeren weiter in neue nummerierte `_pipeline/`-Schritte.

### A1 - Fundstellen

| Migration | Ausfuehrbare Fundstellen | Urteil | Entscheidung / Grund |
|---|---|---|---|
| C-429 `20260908113000_c429_medical_documents_timeline.sql` | 12 `INSERT storage.buckets`; 107 `UPDATE medical.lab_reports` (2) | echt | Sollstand: committeter Bucket-Seed und Laufzeitfunktion. |
| C-432 `20260908130000_c432_active_goal_create.sql` | 86 `INSERT goals.user_goals` (1) | echt | Sollstand: committierte Erstellfunktion. |
| C-428 `20260909150000_c428_coach_pending_invites.sql` | 142, 225, 288 `UPDATE pending_invites`; 172 `INSERT pending_invites`; 238 `INSERT relationships`; 245 `INSERT client_permissions`; 271 `INSERT client_autonomy` (7) | echt | Sollstand: atomare Invite-Funktionen; Historie bleibt unveraendert. |
| C-440 `20260909160000_c440_coach_onboarding.sql` | 33 `INSERT coach_profiles` (1) | echt | Sollstand: Onboarding-Funktion ist committiert. |
| C-441 `20260909170000_c441_injection_site_catalog.sql` | 23 `DELETE injection_sites`; 28 `INSERT injection_sites` (2) | echt | Sollstand: historischer Katalogwechsel; Weglassprobe bricht die Kette. |
| C-453 `20260909190000_c453_supplement_peptide_routes.sql` | 13 `INSERT supplement_pharmacology`; 24 `UPDATE supplement_pharmacology` (2) | echt | Sollstand: Katalognachpflege im committeten Schritt. |
| C-455 `20260909210000_c455_injection_planner.sql` | 139 `INSERT coach.action_log` (1) | echt | Sollstand: Audit-Laufzeitfunktion ist Teil der Strukturdatei. |
| C-457 `20260909230000_c457_lab_report_ocr.sql` | 89, 161 `UPDATE medical.lab_reports` (2) | echt | Sollstand: zwei OCR-Laufzeitfunktionen. |
| C-459 `20260909240000_c459_coach_alert_producer.sql` | 12 `INSERT coach.alerts` (1) | echt | Sollstand: Alert-Erzeuger liegt als Einzeilen-Funktion vor. |
| C-463 `20260909260000_c463_goals_progress_photos.sql` | 7 `INSERT storage.buckets` (1) | echt | Sollstand: committierter Storage-Bucket-Seed. |
| C-464 `20260909270000_c464_nutrition_fiber_target.sql` | 33 `UPDATE nutrition_targets`; 307 `INSERT nutrition_targets`; 318 `UPDATE nutrition_targets`; 327 `UPDATE pending_actions`; 333 `INSERT action_log` (5) | echt | Sollstand: Backfill plus bestaetigende Laufzeitfunktion. |
| C-465 `20260909280000_c465_marketplace_training_delivery.sql` | 27-29, 44-48 `INSERT`; 49, 57, 59 (zweimal) `UPDATE` (12) | echt | Sollstand: Kauf-, Auslieferungs- und Widerrufsfunktionen. |
| C-467 `20260909290000_c467_supplier_products.sql` | 51, 52, 57, 59 `INSERT` (4) | echt | Sollstand: Lieferantenimport-Funktion. |
| C-460 `20260909300000_c460_relationship_specialties.sql` | 22 `DELETE`; 23 `INSERT relationship_specialties` (2) | echt | Sollstand: ersetzende Beziehungsfunktion. |
| C-466 `20260909310000_c466_nutrient_supplement_sources.sql` | 28 `UPDATE supplement_nutrients` (1) | echt | Sollstand: committeter Backfill. |

Summe: **44 echte Operationen in 15 committeten Migrationen.**

Die urspruenglichen 49 Meldungen enthielten fuenf Fehlerkennungen: `FOR UPDATE` in C-428:219, C-464:248/282/289 und C-465:38. Der alte Dollarblock-Scanner suchte dort nur nach Woertern. Er erkennt jetzt nur den Beginn einer ausfuehrbaren SQL-Anweisung; Kommentare, Zeichenketten, `ON DELETE` und Sperrklauseln bleiben ohne Befund. Die Selbstprobe `do_for_update` war vor der Parserkorrektur rot und ist danach gruen.

### A2 - Umzug oder Ausnahme

Alle 44 echten Operationen bleiben als begruendeter Altbestand im Sollstand, nicht als unbenannte Freigabe. Die C-441-Gegenprobe mit einer isolierten Manifestkopie ohne `DELETE`/`INSERT` brach bei `C-441: Injektionsorte 4 / alte IDs 4 statt 16 / 0` ab. Die unveraenderte Vollkette fuehrte denselben Schritt mit `INSERT 0 16` aus und bestand.

### A3 - Tom

Die Hook-Luecke fuer Interpreteraufrufe wurde nicht gebaut. Node- und Python-Aufrufe umfassend mitzulesen ist eine bereichsweite Hook-Entscheidung mit Folgekosten und gehoert Tom.

### A4 - Gegenprobe

Temporär angelegt: `99999999999999_c472_gegenprobe.sql` mit `INSERT`. Der Waechter meldete rot: **Ist 45, Soll 44, neue Befunde 1**. Die Datei wurde danach vollstaendig entfernt. Der Selbsttest deckt zusaetzlich `INSERT`, `UPDATE`, `COPY`, `DELETE`, `TRUNCATE`, `MERGE` und einen Dollarblock-`INSERT` ab.

### A5 - Gate

`migration-datenlogik-pruefen.mjs` steht in `pnpm gate` und ist einzeln gruen: `44 historische Datenoperationen, genau Sollstand 44`. `pnpm gate` selbst stoppt vorher an einem fremden Befund in `zwei-wahrheiten-pruefen.mjs`: **7** Nährstoffspalten in `goals.nutrition_targets`, Soll **6**. Der Datenlogik-Waechter wird in diesem Lauf daher nicht erreicht; diese Sollstandsfrage wurde nicht in C-472 veraendert.

### A6 - Vollkette, Sicherung, Punktelauf

Die Wegwerf-Vollkette lief mit `lumeos_c472_vollkette`: **198 Schritte, KETTE OK: 747.6 s**, danach geloescht. Vorher entstand die Sicherung `backup/schema/20260912024526_c43_vor_kettenlauf.sql`. Die isolierte C-441-Gegenprobe verwendete `lumeos_c472_ohne_c441`, brach absichtlich ab und wurde danach ebenfalls geloescht. `node tools/punkte-pruefen.mjs` ist gruen: 649 Punkte, 25 Befunde bei Soll 25.

## Abnahme

**2026-09-08, Orchestrator.**

> *,,C-472 war BEREITS IM BESTAND umgesetzt: 15 Migrationen /
44 echte historische Datenoperationen als begruendeter
Sollstand."*

`[cmd]` **Parser-Selbstprobe und Datenlogik-Waechter gruen.**

`[read]` **Er hat gemessen, dass der Punkt erledigt war, statt
ihn nochmal zu bauen.**

`[cmd]` **44 Datenoperationen in 15 Migrationen** ? **die Zahl
aus C-471 war *,,fuenfzehn Migrationen"*, die echte Menge ist
groesser.**

`[read]` **Und sie stehen als BEGRUENDETER Sollstand** ? **nicht
als Liste ohne Grund, wie ich es verboten hatte.**

**Abgenommen.**
