---
nr: C-454
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-453
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 2fa1e5fc
beruehrt:
  tabellen: [medical.injection_logs]
zahlen:
  gemessen: 2026-09-08
  orte: 16
  konfigurationstabellen: 0
---

# C-454 — der Nutzer waehlt seine Punkte

## Was Tom beschreibt

Tom, 2026-09-08:

> der user waehlt: peptide oder enhanced, wieviel, nadel, moegliche
> injektionspunkte ? und wir verwalten es. rotationsplaene fuer alle
> injektionen gemaess KONFIGURIERTEN injektionspunkten. wenn er
> triceps waehlt weil er lokal ein tendonproblem hat, dann zeigen
> wir den triceps und keinen rotationsvorschlag, weil nur triceps
> vorhanden ist.
>
> ja wir kennen die ueblichen einstichstellen, das heisst aber
> nicht dass ein user nicht andere waehlen kann.

`[read]` **Der Katalog ist Vorschlag, nicht Vorgabe.**

## Was das Schema heute traegt

`[cmd]` **`medical.injection_sites`, 10 Spalten:**

    id, route, display_name
    minimum_rest_days + _reason
    rotation_required
    rotation_distance_mm
    rotation_quadrant_interval_days

`[cmd]` **KEINE `user_id`** ? **ein Katalog fuer alle.**

`[cmd]` **`medical.injection_logs`, 12 Spalten:** **was war.**

`[cmd]` **Und dazwischen: NICHTS.** `[cmd]` **Null Tabellen mit
`user_injection`, `injection_config`, `injection_plan` oder
`rotation` im Namen.**

`[read]` **Es fehlt die Ebene, die Tom beschreibt:** **was der
Nutzer fuer DIESE Substanz gewaehlt hat.**

## Was fehlt, in seinen Worten

    peptide oder enhanced      -> supplement_id, gibt es
    wieviel                    -> Dosis, gehoert zum Stack
    nadel                      -> je Substanz und Ort, nicht global
    moegliche injektionspunkte -> FEHLT VOLLSTAENDIG

`[read]` **Der vierte Punkt ist die Luecke** ? **eine Auswahl je
Nutzer und Substanz, aus dem Katalog ODER frei.**

## Was daraus folgt

**1** ? **Die Rotation laeuft ueber die KONFIGURIERTEN Punkte, nicht
ueber alle 16.**

`[read]` **Wer vier Orte gewaehlt hat, rotiert ueber vier.**
`[read]` **Wer einen gewaehlt hat, bekommt keinen Vorschlag** ? **es
gibt nichts zu waehlen.**

`[cmd]` **`suggestSite` in der Spec rechnet ueber alle Orte
(Zeile 138)** ? **das muesste auf die Auswahl eingeschraenkt
werden.**

**2** ? **Ein Ort ohne Rotation ist ein gueltiger Fall.**

`[read]` **Toms Trizeps-Beispiel:** **lokal, verletzungsnah, keine
Rotation.**

`[cmd]` **`rotation_required` steht in `injection_sites`** ? **aber
je ORT, nicht je Nutzer-Substanz-Paar.**

`[read]` **Und BPC-157 an der Problemstelle ist derselbe Fall**
(C-453).

**3** ? **Der Nutzer kann Orte waehlen, die der Katalog nicht
kennt.**

`[read]` **Trizeps steht nicht unter den 16.** `[cmd]` **Die
Muskelkarte hat ihn** (`tricep_l/r`).

`[read]` **Also: die Auswahl zeigt die Muskelkarte, nicht die
Katalogliste** ? **und der Katalog ergaenzt Ruhezeit, Volumen und
Nadel, wo er den Ort kennt.**

`[read]` **Wo nicht, bleiben die Felder leer und benannt** ?
**E-72.**

## Die offene Frage

`[read]` **Traegt `injection_sites` dann noch alle Orte, oder nur
die mit Fachwissen?**

`[read]` **Ein Nutzer kann den Bizeps waehlen** ? **soll dafuer
eine Katalogzeile entstehen, oder bleibt er ein Ort ohne
Kataloguntermauerung?**

`[cmd]` **Die Spec beantwortet das nicht** ? `Injection Planner:33
**nennt `id` als *,,e.g. `glute_l`, `vglute_r`, `abd_l`"*, ohne zu
sagen, ob die Liste geschlossen ist.**

## Auftrag

**Beauftragt am 2026-09-08, als Teil der Kette C-455 -> C-454 ->
C-457 -> C-459.**

`[read]` **Der Kettenauftrag steht in C-455.**

---

## Bericht — 2026-09-10

**Erledigt.** Die Auswahl ist jetzt eine eigene, private Ebene und
bleibt klar vom medizinischen Ortskatalog getrennt.

### Schreibmodell

`medical.user_injection_site_selections` hat **9 Spalten**:
`id`, `user_id`, `substance_id`, `route`, `body_area_code`,
`needle_gauge`, `needle_length_in`, `created_at`, `updated_at`.

`body_area_code` ist auf die 21 Flächen der Muskelkarte begrenzt;
es gibt keine freien Koordinaten und keine neuen Fachorte. Die
Routenprüfung akzeptiert nur die bei der Substanz hinterlegte
Injektionsroute. Damit bleibt E-79 gewahrt: die Karte ist Auswahl,
`injection_sites` bleibt Fachwissen.

### Rotation und E-72

`medical.suggest_configured_injection_area(substance_id, route)`
liest ausschließlich die eigene Auswahl. Bei genau einer Fläche
liefert sie **0** Zeilen; nach Auswahl von `triceps` und `abs`
liefert sie die am längsten nicht verwendete konfigurierte Fläche.

`medical.configured_injection_areas(...)` weist mit
`has_catalog_knowledge` aus, ob der Katalog die gewählte Fläche
kennt. Die Grünprobe wählte `triceps`: erlaubt, aber ohne
Katalogwissen. Damit bleibt die fehlende Fachangabe sichtbar statt
erfunden (E-72).

### RLS und Nachweis

RLS ist aktiv; vier Eigentümer-Policies decken SELECT, INSERT,
UPDATE und DELETE ab. Live: **0** Auswahlzeilen, **2/2** Funktionen
für `authenticated`, **0/2** für `anon`. In der frischen Datenbank
sah ein zweiter Nutzer **0** fremde Auswahlzeilen und sein Insert
wurde abgewiesen. Die Probe lief transaktional mit `ROLLBACK`:
keine Fixture-Daten blieben zurück.

Der zuerst rote Test belegte die fehlende Tabelle. Nach dem
Migrationsschritt: **1 Subtest grün** in **0,89 s**
(`backup/c454-final-test.out`).

### Sicherung und Kette

Vor dem Einspielen:
`backup/schema/20260910111000_c454_nutzerauswahl_vor_einspielen.dump`,
**50.421 B**, SHA-256
`EB9D34222BCB08D35068D88D33D079B185F586E69E83BD52D9699DA78B6A09E1`.

Frischer Aufbau `lumeos_c454_final`: **SCHEMA VOLLSTAENDIG**,
**353,7 s**; die sichtbare Abschlussprüfung meldete 35/35 Tabellen,
41/41 Funktionen, 35/35 RLS- und Policy-Prüfungen sowie 39/39
GRANT-Prüfungen (`backup/c454-final-kette.out`).

Der Windows-Ausgabefehler des Kettenabschlusses ist davor repariert:
`runFinalCheck()` reicht seine Ausgabe nun direkt durch. Die
Gegenprobe mit einer absichtlich fehlenden Solllisten-Tabelle zeigte
deren Namen in der `FEHLT`-Liste; nach Rückbau wieder grün.

`node tools/punkte-pruefen.mjs`: **grün**, 599 Punkte, 25/25
erwartete Befunde, kein neuer Schaden.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`medical.user_injection_site_selections` live:**

    id, user_id, substance_id, route,
    body_area_code, needle_gauge, needle_length_in,
    created_at, updated_at

`[cmd]` **RLS an, vier Policies, 0 Zeilen.**

### `body_area_code` ist genau E-79

`[read]` **Er hat die MUSKELFLAECHE als Auswahl genommen, nicht
den Katalogort.**

`[cmd]` **E-79:** *,,die Muskelkarte ist die Auswahl, die 16 Orte
sind Fachwissen."*

`[read]` **Damit kann ein Nutzer den Trizeps waehlen** ? **Toms
Beispiel mit dem lokalen Sehnenproblem.**

### Und die Nadel gehoert an die Auswahl

`[cmd]` **`needle_gauge` und `needle_length_in` stehen JE
Nutzer-Substanz-Paar** ? **nicht global am Ort.**

Tom: *,,der user waehlt: peptide oder enhanced, wieviel, nadel,
moegliche injektionspunkte."*

`[read]` **Alle vier sind jetzt abbildbar.**

### Drei Funktionen

`[cmd]` **`validate_injection_site_selection`,
`suggest_configured_injection_area`,
`injection_needle_suggestions`.**

`[read]` **Die zweite ist der Kern:** **sie schlaegt aus den
KONFIGURIERTEN Flaechen vor, nicht aus allen 21.**

`[read]` **Wer eine Flaeche gewaehlt hat, bekommt keinen
Vorschlag** ? **es gibt nichts zu waehlen.**

**Abgenommen.**
