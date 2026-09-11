---
nr: C-463
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: db75b776
beruehrt:
  tabellen: [goals.progress_photos, goals.body_measurements, goals.goal_phases, goals.phase_transition_responses, goals.user_goals]
zahlen:
  gemessen: 2026-09-10
  fehlend: 0
---

# C-463 — drei Modale ohne Ziel

## Ergebnis

Nur `goals.progress_photos` fehlte wirklich. Es steht jetzt mit einem eigenen privaten Bucket. `body_weight_log` waere eine zweite Wahrheit; `phase_transitions` waere eine zweite Tabelle fuer bereits vorhandene Phasenhistorie und Antworten. Beides wurde nicht gebaut.

## A1 — jede Annahme gegen Spalten gemessen

| Behauptung | Messung auf dev | Ergebnis |
|---|---|---|
| `progress_photos` | Die sieben Goals-Tabellen hatten keine Foto-/URL-/Pose-/Analyse-Spalte; Storage hatte nur `medical-originals` mit einem Objekt. | fehlte wirklich |
| `phase_transitions` | `goal_phases` hat `gueltig_ab`, `projected_end_date`, `actual_end_date`, `transitioned_from`, `recommended_next`, `transition_reason`; `phase_transition_responses` hat `phase_id`, `user_id`, `accepted/rejected`, `reason`, `created_at`. 5 Phasen, 3 offen, 0 Antworten. | keine Tabelle und kein Feld fehlt |
| `body_weight_log` | `body_measurements.weight_kg` ist NOT NULL; 362/362 Zeilen tragen Gewicht. Die Tabelle hat Datum, Uhrzeit, Koerperfett, Masse, BMI, FFMI und Herkunft. | keine zweite Gewichtslog-Tabelle |

`goal_phase_start` und `goal_phase_end` binden Start bzw. Ende an den angemeldeten Eigentümer; `phase_transition_respond` schreibt die Antwort nur für die eigene Phase. Ein späterer einzelner, atomarer UI/API-Übergang ist keine fehlende Tabelle: Die Spec sagt in `Goals/OPEN_ITEMS.md:75`, dass Transitions manuell via API erfolgen und keinen automatischen DB-Guard haben. Daher wurde kein Ablauf erfunden.

## A2/A3 — gebaut: private Foto-Metadaten und Objektpfad

Migration: `supabase/migrations/20260909260000_c463_goals_progress_photos.sql`.

`goals.progress_photos` hat 13 Spalten: `id`, `user_id` (FK `auth.users`, CASCADE), `session_date`, `pose_type`, `pose_name`, `pose_number`, `photo_url`, `thumbnail_url`, `ai_analysis`, `ai_analyzed_at`, `notes`, `is_private`, `created_at`.

Die Quelle ist `docs/specs/Goals/DATABASE.md:310-340`: Pose, Objekt-URL, optionale Thumbnail-URL, Analyse, Privatheit sowie die beiden Indizes. Indizes: `(user_id, session_date DESC)` und `(user_id, pose_name)`. `pose_type` folgt der Spec-Werteliste `mandatory_8`, `quarter_turns`, `detail`, `custom`; die einzelne Pose bleibt absichtlich frei benannt.

Der Draft ist dort widersprüchlich: `module-goals-pro.jsx:158-160` nennt zehn Mandatory-Namen trotz "8 IFBB Mandatory"-Label, daneben vier Quarter Turns und neun Detail-Close-Ups; `module-goals.jsx:864-888` zeigt nur Front/Side/Back. Ein enger Namens-CHECK würde eine dieser Quellen erfinden.

Der neue Bucket `goals-progress-photos` ist privat, 20 MiB, und akzeptiert JPEG, PNG, HEIC. Er wird nicht mit `medical-originals` geteilt: dessen Objekte haben einen medizinischen Zweck und E-76-Privatheit. Auch bei voller Goals-Sicht gibt es keine Coach-Policy für Fotozeilen oder Fotoobjekte; der Draft verlangt ausdrücklich privat bis zu einer späteren, expliziten Freigabe (`module-goals.jsx:884-887`, `Goals/OPEN_ITEMS.md:64`).

## A4/A5 — Schreibprobe, RLS und anon

Der Test `supabase/_pipeline/_validierung/goals-c463-progress-photos.test.ts` lief auf `lumeos_c463_final` und rollte vollständig zurück:

| Prüfung | Eigentümer | fremder authentifizierter Nutzer | anon |
|---|---:|---:|---:|
| Fotozeile lesen/schreiben | 1 / erlaubt | 0 / verweigert | kein SELECT und kein Schema-USAGE |
| Storage-Objekt lesen/schreiben | 1 / erlaubt | 0 / verweigert | kein SELECT |

Die Tabelle hat RLS und vier Owner-Policies (SELECT, INSERT, UPDATE, DELETE), der Bucket vier gleichartige pfad- und `owner_id`-gebundene Policies. Nach `ROLLBACK`: 0 Fotozeilen und 0 Bucket-Objekte. Keine neue Funktion wurde angelegt; anon hat deshalb auch kein EXECUTE.

## A6 — Bestand unberührt

Nach dem Einspielen auf dev: 11 Ziele, 362 Messungen, davon 362 mit `weight_kg`; `progress_photos` steht bei 0. Die Migration ergänzt nur leere Foto-Metadaten und einen leeren Bucket.

## A7 — Sicherung und Läufe

Vor dem Einspielen:

`backup/schema/20260910183913_c463_goals_progress_photos_vor_einspielen.dump` — 26.491.880 Byte, SHA-256 `CEE4AAA420906B86CB6A22559EF7AC38A6D121F0C9385986216A33EF97A984FA`.

Der frische Aufbau `lumeos_c463_final` lief mit 188 Schritten in 605,8 s: 35/35 Tabellen, 4/4 Sichten, 41/41 Funktionen, 35/35 RLS/Policies, `SCHEMA VOLLSTAENDIG`.

Der C-463-Test: 1 Zusicherung, 0 Fehler, 1,224 s. Protokolle: `backup/c463-vollkette-live.out` und `backup/c463-progress-photos-test.out`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    progress_photos    13 Spalten, RLS an, vier Policies
    Bucket             goals-progress-photos, public=false
    body_weight_log    NICHT gebaut, begruendet
    phase_transitions  NICHT gebaut, begruendet
    Vollkette          188 Schritte, 605,8 s
    Sicherung          26.491.880 B, SHA-256

`[cmd]` **Selbst gemessen: alle sechs.**

### Zwei von drei nicht gebaut — und beide Begruendungen tragen

**1** ? `[cmd]` **`body_measurements`: 362 von 362 Zeilen haben
`weight_kg`.**

`[read]` **Eine eigene `body_weight_log` waere eine zweite
Wahrheit ueber dasselbe Gewicht.**

**2** ? `[cmd]` **`goal_phases` traegt:**

    phase_type, variant, parameters,
    gueltig_ab, projected_end_date, actual_end_date,
    transitioned_from, recommended_next,
    transition_reason

`[cmd]` **Und `phase_transition_responses`:** `phase_id`,
`user_id`, `response`, `reason`.

`[read]` **Der Uebergang IST eine Phase mit Vorgaenger und
Grund** ? **keine eigene Tabelle noetig.**

`[read]` **Zum zweiten Mal in dieser Kette hat er eine Tabelle
NICHT gebaut, die mein Auftrag verlangte** ? **und beide Male zu
Recht.**

### Der Bucket ist privat

`[cmd]` **`public=false`, vier Owner-Policies, KEINE
Coach-Lesepolicy.**

`[read]` **Ein Fortschrittsfoto ist so sensibel wie ein
Laborbefund** (C-429) ? **und ein Coach sieht es nur, wenn der
Klient es freigibt.**

`[read]` **Die Freigabe ist noch nicht gebaut** ? **richtig so,
das ist eine eigene Entscheidung.**

### `pose_type`, `pose_name`, `pose_number`

`[read]` **Drei Spalten fuer die Pose** ? **die Vorlage
(`GoalsPosesView`) nennt sie.**

`[cmd]` **Und `ai_analysis` mit `ai_analyzed_at`** ? **eine
spaetere Auswertung hat ihren Platz, ohne dass heute etwas
rechnet.**

**Abgenommen.**
