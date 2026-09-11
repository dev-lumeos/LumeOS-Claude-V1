---
nr: G-423
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-79
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-423 — Zyklen, Protokolle und die Injektionskarte

## Was gemessen ist

### Die Datenbank steht

`[cmd]` **C-456, heute abgenommen:**

    user_supplement_cycles                 0 Zeilen
    supplement_cycle_events                0
    supplement_protocols                   0
    supplement_protocol_items              0
    supplement_protocol_templates          3
    supplement_protocol_template_items     9
    intake_schedule                        0

`[cmd]` **Fuenf Schreibwege:**

    start_supplement_cycle
    set_supplement_cycle_status
    create_supplement_protocol_from_template
    refresh_intake_schedule
    supplement_nutrient_intake_for_day

`[cmd]` **C-455 und C-454, heute abgenommen:**

    medical.injection_sites                 16 Zeilen
      (zehn neue Spalten: max_volume_ml, rest_days,
       body_view, x_pct, y_pct, needle_gauge,
       needle_length_in, landmark_note, difficulty,
       is_active)
    medical.injection_logs                   0
      (sieben neue Spalten: substance_id, dose_amount,
       dose_unit, needle_gauge, needle_length_in,
       notes, stack_item_id)
    medical.injection_site_overrides         0
    medical.user_injection_site_selections   0
      (user_id, substance_id, route, body_area_code,
       needle_gauge, needle_length_in)

`[cmd]` **Drei Funktionen:**

    validate_injection_site_selection
    suggest_configured_injection_area
    injection_needle_suggestions

### E-79 gilt

`[cmd]` **`docs/entscheidungen/E-79-die-muskelkarte-ist-die-auswahl.md`:**

> die Muskelkarte ist die Auswahl, die 16 Orte sind Fachwissen

`[cmd]` **`packages/ui/src/koerperkarte-pfade.ts` fuehrt 21
Flaechen**, `side` **ist gepflegt.**

Tom, 2026-09-08:

> der user waehlt: peptide oder enhanced, wieviel, nadel,
> moegliche injektionspunkte ? und wir verwalten es.
> rotationsplaene gemaess KONFIGURIERTEN injektionspunkten.
> wenn er triceps waehlt weil er lokal ein tendonproblem hat,
> dann zeigen wir den triceps und keinen rotationsvorschlag,
> weil nur triceps vorhanden ist.

### Was in `apps/web/v2/supplements` steht

`[cmd]` **21 Dateien:**

    tabs.tsx                58,6 KB
    substanz-tafel.tsx      44,4
    modale.tsx              39,9
    tab-injektionen.tsx     31,8
    mockup-referenz.tsx     30,5
    tab-spec.tsx            29,4
    substanz-abschnitte     25,3
    tab-extended.tsx        23,8
    substanz-detail.tsx     23,4
    tab-inventory-echt      21,9
    ansicht.tsx             21,6
    fehlende-kacheln.tsx    18,7
    tab-compliance.tsx      13,6
    tab-interactions-echt   12,0
    stack-bearbeiten.tsx    10,2
    injektion-modal.tsx      9,4
    extended-gate.tsx        5,8
    tab-bilanz.tsx           5,1

`[cmd]` **`tools/vollstaendigkeit.mjs supplements`: 65 von 67.**

    FEHLT  SuppExtended      8 Unterkomp., 4 Kacheln
    FEHLT  SuppInteractions

`[read]` **Das Werkzeug misst NAMEN** ? **`tab-extended.tsx`
(23,8 KB) und `tab-interactions-echt.tsx` (12,0 KB) gibt es.**

`[read]` **Miss selbst, ob etwas fehlt.**

### Die Vorlage

`[cmd]` **`docs/spezifikation/10-plattform/design-system/theme-v1/`**
? **NICHT `coach-portal-draft/`, das traegt nur Coach-Module.**

## Der Auftrag

**1** ? **Die Zyklen und Protokolle sichtbar machen.**

`[read]` **Die Tabellen sind leer, die Schreibwege stehen.**

`[read]` **Was die Vorlage an dieser Stelle zeigt, wird
gebaut** ? **und wo ein Schreibweg da ist, wird er gerufen.**

`[cmd]` **Drei PCT-Vorlagen liegen bereit
(`supplement_protocol_templates`).**

**2** ? **Die Injektionskarte auf E-79 umstellen.**

`[cmd]` **G-396 hat die Karte gegen den ALTEN Stand gebaut** ?
**vor `user_injection_site_selections`.**

`[read]` **Die Rotation laeuft ueber die KONFIGURIERTEN
Flaechen** ? `suggest_configured_injection_area` **gibt sie.**

`[read]` **Eine gewaehlte Flaeche: kein Vorschlag.**

**3** ? **Die Nutzerkonfiguration.**

`[read]` **Ein Nutzer muss waehlen koennen, wo er eine Substanz
spritzt** ? **heute gibt es dafuer keine Oberflaeche.**

`[cmd]` **`validate_injection_site_selection` prueft die
Auswahl.**

## Abnahmebedingungen

    A1  was in supplements heute steht und was die Vorlage
        zeigt: je Reiter gemessen. TABELLE.
    A2  SuppExtended und SuppInteractions: fehlen sie
        wirklich, oder sind es Umbenennungen? Belegt.
    A3  Zyklen: ein Zyklus gestartet, pausiert, beendet.
        Am Schirm, mit Bildschirmfoto.
    A4  ein Protokoll aus einer Vorlage angelegt.
    A5  die Injektionskarte zeigt die konfigurierten
        Flaechen. Eine Flaeche gewaehlt -> kein Vorschlag.
        Zwei Fotos.
    A6  die Nutzerkonfiguration: eine Substanz, eine
        Flaeche, eine Nadel. Geschrieben und gelesen.
    A7  was du NICHT bauen konntest und warum.
    A8  apps/web 1587 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-460.**
**Die Mockup-Referenz BLEIBT** ? **Tom nimmt sie ab.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 laeuft** (PID 1332072), **3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
