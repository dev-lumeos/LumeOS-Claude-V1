---
nr: C-441
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-388
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 7bb3eb7a
beruehrt:
  tabellen: [medical.injection_sites]
zahlen:
  gemessen: 2026-09-08
  ist: 4
  soll: 16
---

# C-441 — sechzehn Injektionsorte statt vier

## Befund

Tom, 2026-09-08, am Schirm: *,,da fehlen viele
injektionspunkte."*

`[cmd]` **`medical.injection_sites` hat VIER Zeilen:**

    Deltoid (im)   Vastus lateralis (im)
    Ventrogluteal (im)   Subkutan (sc)

`[read]` **Ohne Seite** ? **kein *Deltoid L* und *R*.**

`[cmd]` **Die Spec nennt SECHZEHN:**
`docs/specs/Supplements/Injection Planner - Spec Change Request.md:48`
**?Seed data ? 16 sites"**

    IM     glute_l/r, vglute_l/r, quad_l/r, delt_l/r, lat_l/r
    SubQ   abd_l/r, sq_delt_l/r, sq_thigh_l/r

`[cmd]` **Je Ort: `max_volume_ml`, `rest_days`, Seite,
Nadelgroesse, Hinweis, `difficulty`, `is_active`.**

`[cmd]` **Und `INJEKTIONS_ORTE` in `packages/ui` fuehrt 16
Punkte** ? **mit links und rechts.**

`[read]` **Drei Listen, eine davon zu kurz** ? **die Datenbank.**

`[cmd]` **Das Altrepo kennt Injektionen NICHT** ? **null Treffer
fuer `ventrogluteal`, `INJECTION_SITE`, `injectionSite`.**

## Was die Spec noch traegt

`[cmd]` **Sie ist 371 Zeilen lang und beschreibt mehr als die
Orte:**

    5.1  siteState: fresh | ready | soon | resting
    5.2  suggestSite: longest-rest-first, mit
         contralateral_rotation als Gleichstandsregel
    6    Regeln: volume_limit, rest_window, route_mismatch
         (block); overuse_30d, advanced_site,
         complication_repeat, pain_trend (warn)
    7    siteLoad ueber 28 Tage

`[read]` **`isContralateral` ist der feinste Punkt:** **derselbe
Muskel auf der Gegenseite zaehlt NICHT als Wechsel** (Zeile 182).

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die zwoelf fehlenden Orte

`[cmd]` **Lies `Injection Planner - Spec Change Request.md`,
Abschnitt 2** ? **die Tabelle ab Zeile 48 traegt alle Werte.**

`[read]` **Miss zuerst, was die vier bestehenden Zeilen tragen** ?
**sie haben keine Seite und muessen vermutlich weichen.**

`[cmd]` **Und `injection_logs` hat 0 Zeilen** ? **es haengt nichts
daran.**

### 2 · Die Spalten der Spec gegen das Schema

`[cmd]` **Die Spec nennt `max_volume_ml`, `rest_days`,
`difficulty`, `is_active`, `needle_gauge`, `note`.**

`[cmd]` **Das Schema hat `minimum_rest_days`,
`rotation_distance_mm`, `rotation_quadrant_interval_days`.**

`[read]` **Miss, welche fehlen und welche anders heissen** ? **und
melde, bevor du umbenennst.**

`[cmd]` **`00-SPEC-ABGLEICH.md` sagt dir, was noch auseinanderlaeuft.**

### 3 · `site_id` als TEXT

`[cmd]` **Die Spec: `site_id TEXT FK -> injection_sites`
(Zeile 87).**

`[cmd]` **Das Schema hat `injection_site_id`** ? **miss den Typ.**

`[read]` **Wenn es UUID ist, kann die Oberflaeche nicht mit
`delt_l` arbeiten** ? **und die Karte tut genau das.**

### Abnahmebedingungen

    A1  16 Orte in injection_sites. Zahl vorher/nachher,
        je mit Kennung.
    A2  welche Spec-Spalten fehlen. Liste.
    A3  site_id: Typ gemessen, passt er zur Karte?
    A4  die vier alten Zeilen: weg oder umgestellt, mit Grund.
    A5  RLS unveraendert, beide Richtungen.
    A6  Vollkette laeuft durch.

### Was nicht zu tun ist

**Kein `siteState`, kein `suggestSite`** ? **das ist Abschnitt 5
und ein eigener Auftrag.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-389.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator.**

    A1  4 -> 16 Orte: 10 IM, 6 SC, je mit Seite
    A2  neun Spec-Spalten fehlen, mit Begruendung je Fall
    A3  beide TEXT, FK besteht -- delt_l passt
    A4  die vier alten nur entfernt, wenn nichts sie nutzt
        gemessen: 0 Logs, 0 Zustaende
    A5  RLS unveraendert, beide Richtungen
    A6  Vollkette 414,3 s, SCHEMA VOLLSTAENDIG

### A4 ist die beste Stelle

`[cmd]` **Die vier alten IDs werden entfernt** ? **aber nur unter
der Bedingung, dass nichts sie referenziert.**

> *,,Der Schutz verhindert historische Umdeutung."*

`[read]` **Ein Protokolleintrag auf `deltoid` haette sonst still
zu `delt_l` werden koennen** ? **eine Injektion, die die Seite
wechselt.**

`[cmd]` **Gemessen: 0 Logs, 0 Zustaende** ? **also greift die
Bedingung heute nicht, aber sie steht.**

### A2 — er hat die Spec nicht ueber eine Regel gestellt

`[cmd]` **Es fehlen `short_code`, `max_volume_ml`, `rest_days`,
`body_view`, Koordinaten, Nadelgroesse, Landmark, `difficulty`,
`is_active`.**

`[cmd]` **Aber:** *,,`minimum_rest_days` ist absichtlich kein
`rest_days`: E-57/C-385 erzwingt dort begruendetes NULL."*

`[read]` **Die Spec verlangt eine Spalte, eine bestehende
Entscheidung verlangt etwas anderes** ? **er hat beide genannt,
statt eine zu ueberfahren.**

`[cmd]` **Und: *,,Nadelwissen bleibt quellen- und koerperabhaengig
getrennt."***

### A3 — die Karte passt technisch

`[cmd]` **`injection_sites.id` und `injection_logs.injection_site_id`
sind beide TEXT, der Fremdschluessel besteht.**

`[read]` **`delt_l` aus `INJEKTIONS_ORTE` laesst sich also direkt
verwenden** ? **kein Umweg ueber eine UUID-Zuordnung.**

### Zwei Befunde, beide gemeldet statt geloest

`[cmd]` **Die acht Nadel-Empfehlungen zeigen auf `deltoid`,
`ventrogluteal`, `vastus_lateralis`, `subcutaneous`** ? **die
alten Schluessel.**

> *,,Eine seitige Aufloesung waere ein eigener Funktionsauftrag;
> sie wurde hier nicht erfunden."*

`[cmd]` **Und `measurement_date` in
`injection_body_measurement_context` ist mehrdeutig** ? **gefunden
von der C-385-Probe, ausserhalb des Auftrags.**

`[read]` **Beides steht in C-445.**

**Abgenommen.**

