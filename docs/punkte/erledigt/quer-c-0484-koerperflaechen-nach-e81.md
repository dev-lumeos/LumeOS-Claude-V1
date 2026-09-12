---
nr: C-484
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-483
entscheidung: E-81
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 934d2ae1
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-12
  zeilen_vorher: 68
  zeilen_nachher: 51
---

# C-484 — koerperflaechen nach E-81

## Die Entscheidung

`[cmd]` **E-81, Tom, 2026-09-08:**

    Tiefe        parent_id, KEINE Ebenenzahl
    Bedeutung    art: wurzel | gruppe | muskel | umriss
                 (spaeter: kopf)
    Seite        eine SPALTE am Messwert,
                 keine eigene Flaechenzeile

> die trainings muessen bis auf die kleinsten muskeln
> runterbrechen koennen

## Abnahmebedingungen

    A1  ebene faellt weg. Wer las sie? Gemessen.
    A2  34 Seitenzeilen weg, 68 -> 34.
    A3  art erlaubt kopf. CHECK belegt.
    A4  die 43 Kartenflaechen angelegt. Zahl.
    A5  seite an user_injection_site_selections und
        an alles andere mit Flaechenbezug. Liste.
    A6  die zehn C-482-Namen sind live.
    A7  RLS und Rechte unveraendert:
        authenticated SELECT, anon nichts.
    A8  Struktur nach migrations/, Daten in _pipeline/.
    A9  Waechter GRUEN -- oder jede rote Zeile mit Grund
        im Sollstand.
    A10 Sicherung, Vollkette, Punktelauf.

## Der Vertrag mit G-435

`[cmd]` **Codex baute zuerst.** Claude Code zieht danach genau diese
drei Oberflaechenzeilen nach:

    hierarchie-read.ts:59
      .select('id,parent_id,code,name_de,name_en,art,muscle_group_id')

    hierarchie.ts
      ebene: number | null  -> weg
      seite: string | null  -> weg

`[read]` **Zwischen C-484 und G-435 ist Recovery absichtlich ein
Entwicklungsstand mit altem Select, kein C-484-Befund.** Codex hat
`apps/` nicht angefasst.

## Bericht

2026-09-12, Codex.

### A1 — `ebene` ist entfernt

`[cmd]` Vorher las ausschliesslich der Recovery-Leseweg die Spalten:
`apps/web/src/lib/koerper/hierarchie-read.ts:59` selektierte `ebene`
und `seite`; der Typ `Flaeche` in `hierarchie.ts` fuehrte beide.
Der vom Auftrag nachgereichte G-435-Vertrag ersetzt sie. Sonstige
Lesewege fuer `ebene` waren Tests, Kommentartext oder der alte
Aufbaupfad C-468/C-479.

`[cmd]` Live nachher hat `public.koerperflaechen` elf Spalten:
`id`, `parent_id`, `code`, `name_de`, `name_en`, `art`,
`muscle_group_id`, `hinweis`, `sortierung`, `created_at`, `updated_at`.
`ebene` und `seite` fehlen. Die Tiefe ist allein die `parent_id`-Kette;
eine Lesefunktion kann sie bei Bedarf mit `WITH RECURSIVE` rechnen.

### A2 und A4 — Seiten weg, Karte vollstaendig

`[cmd]` Ausgang: 68 Zeilen = 8 Wurzeln + 26 Flaechen + 34
Seitenzeilen. Der Kettenschritt loescht zuerst exakt die 34 Codes mit
`-l`/`-r`: **68 -> 34**. Anschliessend ersetzt er die alten,
nicht-gezeichneten Sammelflaechen durch die 43 G-434-Codes. Endstand:
**51 = 8 Wurzeln + 43 Kartenflaechen**, **0** Seitenzeilen.

`[cmd]` Die 43 Codes sind: `achillessehne`, `adductor-brevis`,
`adductor-longus`, `adductor-magnus`, `ankles`, `biceps`,
`biceps-femoris`, `brachioradialis`, `chest`, `deltoids`,
`erector-spinae`, `external-oblique`, `feet`, `flanke`,
`forearm-extensors`, `forearm-extensors-ulnar`, `forearm-flexors`,
`gastrocnemius-lateralis`, `gastrocnemius-medialis`,
`gluteus-maximus`, `gluteus-medius`, `hair`, `hands`, `head`, `kehle`,
`knees`, `latissimus`, `nacken`, `rectus-abdominis`,
`rectus-femoris`, `semitendinosus`, `serratus-anterior`,
`sternocleidomastoid`, `tendinous-inscriptions`, `teres-major`,
`teres-minor`, `tibialis`, `trapezius`, `triceps-lateralis`,
`triceps-longum`, `triceps-mediale`, `vastus-lateralis`,
`vastus-medialis`.

### A3 — `kopf` ist erlaubt

`[cmd]` Der Live-CHECK lautet:

    art IN ('wurzel', 'gruppe', 'muskel', 'umriss', 'kopf')

`kopf` ist noch keiner Zeile zugewiesen. Die erlaubte Bedeutung steht
aber bereits im deploybaren Vertrag.

### A5 — Seite nur am Messwert

`[cmd]` Flaechenbezug lag in drei Medical-Tabellen:

| Tabelle | Befund | C-484-Entscheidung |
| --- | --- | --- |
| `medical.user_injection_site_selections` | Nutzerwaehlung je `body_area_code` | nullable `seite` (`links`/`rechts`), Eindeutigkeit schliesst Seite ein |
| `medical.injection_logs` | beobachteter Injektionsmesswert | nullable `seite` (`links`/`rechts`) |
| `medical.injection_sites` | 16 Fachkatalogorte, bereits `*_l`/`*_r` | unveraendert: Katalogort, kein Messwert |

`[cmd]` Vor dem Umbau hatten Selections und Logs je **0** Zeilen; keine
Seite wurde nacherfunden. Die Nullable-Regel erhaelt mittige sowie
historische Werte. Beide SQL-Funktionen fuer Auswahl und Rotation fuehren
die Seite nun mit; die Rotation vergleicht `body_area_code` und `seite`.

### A6 — C-482 ist live

`[cmd]` Vorher: `training.muscle_groups = 95`. Nach dem kontrollierten
Nachzug von `107_muscle_groups_hierarchy.sql` und C-108: **105**, davon
alle zehn C-482-Namen. Der 107-Waechter akzeptiert jetzt begruendet beide
Kettenzustaende: 106/6.624 vor C-108 (Achilles vorhanden) und
105/6.588 nach C-108 (Achilles entfernt). Damit wird der vorhandene
Kettenschritt wiederholbar, ohne die zehn Namen in C-484 zu duplizieren.

### A7 — Rechte und RLS

`[cmd]` Frischaufbau und Live-Gegenprobe: `authenticated` hat auf
`public.koerperflaechen` nur `SELECT`; `authenticated INSERT = false`,
`anon SELECT = false`. RLS und die einzelne authenticated-SELECT-Policy
blieben unveraendert. Das explizite REVOKE-then-GRANT aus C-471/C-479
bleibt in der C-484-Migration als Schutz fuer die bestehende Tabelle.

### A8 — Trennung Struktur/Daten

- Struktur: `supabase/migrations/20260912001700_c484_koerperflaechen_e81.sql`
  (Spalten, CHECK, Rechte/RLS, Medical-Messspalten und Lesefunktionen).
- Daten: `supabase/_pipeline/00_querschnitt/484_koerperflaechen_e81.sql`
  (34 Seitenzeilen, 43 Kartenzeilen, Wurzelarten und Sollwerte).
- Kette: `supabase/_pipeline/kette.json`, zwei Schritte nach C-479.

### A9 — Waechter

`[cmd]` Gruen:

- `node tools/migration-datenlogik-pruefen.mjs` — 44 historische
  Datenoperationen, genau Sollstand; C-484-Migration ohne Datenlogik.
- `node tools/migration-kette-pruefen.mjs` — jede Migration hat einen
  Kettenschritt.
- `schema-vollstaendigkeit-pruefen.ts` auf `lumeos_c484_vollkette` —
  gruen nach Aufnahme der zwei neuen `seite`-Spalten in den Sollstand.
- C-454/C-455-Regressionen — drei Tests gruen, einschliesslich linker
  und rechter Auswahl sowie doppelter gleicher Seite.
- `g432-ebenen.test.ts` — 10/10 gruen; kein Kartenname ist erfunden.

Der erste Abschlusslauf meldete genau zwei rote Zeilen, beide neue
`seite`-Spalten. Sie wurden mit Herkunft C-484 im Schema-Sollstand
aufgenommen; der Wiederholungslauf ist gruen. Keine Ausnahme wurde
eingetragen.

### A10 — Sicherung, Vollkette, Punktelauf

`[cmd]` Sicherungen vor dem Live-Schritt:

- `backup/schema/20260912083248_c43_vor_kettenlauf.sql`
- `backup/data/20260912084000_c484_vor_live.dump`
  (SHA-256 `3052C153AABAC57AC2E1C846AEEF2E4A82712E86A7D918C6F048FF1D02584B37`)

`[cmd]` Vollkette in `lumeos_c484_vollkette`: 200 Schritte. C-484
Struktur und Daten gruen (`DELETE 34`, `INSERT 43`); die anschliessende
Schema-Abschlusspruefung ist gruen. Der Punktlauf meldet 655 Punkte,
25 Befunde bei Soll 25 und ist gruen.

`[read]` Kein Muskelkater-Schema wurde angelegt. `checkins.soreness` und
`checkins.pain_areas` bleiben unveraendert; eine dortige Seite ist ein
eigener Punkt.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    koerperflaechen   51 Zeilen (8 Wurzeln, 43 Flaechen)
                      ebene und seite WEG
                      art erlaubt kopf
    muscle_groups     105, Serratus Anterior live
    seite             an user_injection_site_selections
                      und injection_logs
                      NICHT an injection_sites
    Rechte            authenticated SELECT, anon nichts

`[cmd]` **Selbst gemessen: alle fuenf.**

`[cmd]` **68 -> 51** ? **34 Seitenzeilen weg, 17 Kartenflaechen
dazu.**

### Ein zweiter CHECK, den ich nicht verlangt habe

`[cmd]` **`(art <> ALL (ARRAY['umriss','kopf'])) OR
(muscle_group_id IS NULL)`**

`[read]` **Ein Umriss hat keinen Muskel, ein Kopf hat keinen
EIGENEN** ? **die Datenbank laesst es gar nicht erst zu.**

`[read]` **Das stand nicht im Auftrag** ? **er hat es aus E-81
abgeleitet.**

### injection_sites blieb, mit Grund

`[read]` **Mein Auftrag sagte: *,,miss, ob E-81 dort ueberhaupt
gilt."***

> *,,`injection_sites` blieb als SEITLICHER KATALOG
> unveraendert."*

`[cmd]` **16 Orte, alle bereits `*_l`/`*_r` codiert** ? **ein
Katalog, kein Messwert.**

`[read]` **E-81 sagt: die Seite gehoert an den MESSWERT** ?
**`injection_logs` und `_selections` haben sie jetzt.**

`[read]` **Er hat nicht umgebaut, weil es symmetrisch aussieht.**

### Und der Konflikt ist geloest

`[cmd]` **`tabs.tsx`: `M` statt `UU`** ? **sechs Konfliktmarker
weg.**

> *,,Die nicht kompilierbare Stash-Haelfte verworfen; der
> bestehende Datenbankpfad bleibt erhalten. Die verbliebene, nicht
> definierte Referenz `RUECKFALL` korrekt zu `ATTRAPPE`
> geaendert."*

`[cmd]` **`pnpm --filter @lumeos/web build` erfolgreich,
einschliesslich Typecheck und `/v2/supplements`.**

`[read]` **Der Stash-Stand war *vor G-91*** ? **er hat die alte
Haelfte verworfen, nicht die neue.**

### Was offen bleibt

`[cmd]` **Recovery selektiert noch `ebene` und `seite`** ? **die
drei Vertragszeilen aus G-435.**

`[read]` **Erwartet** ? **das ist die vereinbarte Reihenfolge.**

**Abgenommen.**

