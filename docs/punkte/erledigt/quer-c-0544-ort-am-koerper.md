---
nr: C-544
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-90
agent: codex
beauftragt: 2026-09-26
erledigt: 2026-09-08
commit: b51b080e
beruehrt:
  tabellen: [medical.injection_sites]
zahlen:
  gemessen: 2026-09-26
  koerperorte: 8
  muskelrelationen: 7
  injektionsstellen: 16
---

# C-544 - der Ort am Koerper als Begriff

## Die Frage

`[read]` **Eine Injektionsstelle haengt nicht immer an einem
Muskel.**

    AAS       intramuskulaer  -> die Stelle IST ein Muskel
    Peptide   subkutan        -> die Stelle ist FETT

Tom, 2026-09-08: *,,wir muessen auch das bauchfett und
painpoints/injektionspunkte fuer die peptides kennen"*

## Der Befund

`[cmd]` **Gemessen - es gibt sieben Injektionstabellen:**

    medical.injection_sites                      16
    medical.injection_needle_recommendations      8
    medical.injection_tissue_condition_guidance   1
    medical.injection_site_conditions             0
    medical.injection_logs                        0
    medical.injection_site_overrides              0
    medical.user_injection_site_selections        0

`[cmd]` **`injection_sites` traegt `route`, `body_view`,
`x_pct`, `y_pct`, `needle_gauge`, `needle_length_in`,
`minimum_rest_days`, `rotation_distance_mm`, `max_volume_ml`.**

`[cmd]` **Aber KEINEN Fremdschluessel auf einen anatomischen
Ort.**

`[read]` **Die Stelle kennt ihre Koordinate auf dem BILD, nicht
ihre Zielstruktur am Koerper.**

## Was daraus folgt

    Ort am Koerper
      ist ein Muskel        Vastus medialis
      ist ein Fettdepot     Bauch, Oberschenkel aussen
      ist eine Landmarke    Knochenpunkt fuer die Stelle

`[cmd]` **Und `public.koerperflaechen` hat 51 Zeilen, davon 33
mit Muskel** - **die 18 ohne sind vielleicht keine Luecke,
sondern genau diese anderen Orte. MISS es.**

## Abnahmebedingungen

    A1  die 16 Stellen: welche sind Muskel, welche
        Fettdepot, welche Landmarke? TABELLE.
    A2  eine Stelle kennt ihren Ort. Fremdschluessel.
    A3  die 18 Koerperflaechen ohne Muskel: gemessen
        und eingeordnet.
    A4  ein subkutaner Ort ohne Muskel ist moeglich.
        Belegt.
    A5  bestehende Stellen unveraendert.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht, 2026-09-26

### Die vier Quellen

1. **Code:**
   `20260902070205_c385_injection_site_model.sql`,
   `385_injection_site_seed.sql`,
   `20260909210000_c455_injection_planner.sql` und
   `455_injection_planner_catalog_seed.sql` fuehren den bestehenden
   16er-Katalog, seine Koordinaten und seine `im`/`sc`-Route. Die
   C-471/C-484-Dateien definieren `public.koerperflaechen`
   ausdruecklich als Hierarchie der Koerpergrafik.
2. **Daten:** 16 Stellen, davon 10 `im` und 6 `sc`. Nur 6 der 16
   freien `body_area_code`-Werte treffen ueberhaupt einen Code in
   `koerperflaechen`; derselbe Code `deltoids` bezeichnet dort sowohl
   den IM-Muskel als auch den benachbarten SC-Fettbereich. Die 18
   Grafikflaechen ohne Muskel enthalten kein Fettdepot.
3. **Spec und Mockup:**
   `docs/specs/Supplements/Injection Planner · Spec Change Request.md`
   und
   `docs/spezifikation/10-plattform/design-system/theme-v1/module-supplements-injection.jsx`
   fuehren dieselben 16 Stellen. Das Mockup markiert SubQ anders als
   IM; seine Hinweise nennen Bauchfalte, Fettpolster am hinteren
   Oberarm und anterolaterales Oberschenkelfett.
4. **Vorgaengerrepo:**
   `referenz/lumeos-2026/src/api/supplements/routes/injections.ts`
   speichert `site` als Text; `InjectionSiteTracker.tsx` fuehrt eine
   bildbezogene Standortliste. Es gibt dort weder einen kanonischen
   Koerperort noch eine Muskel-/Fett-Relation. Der Vorgaenger ist damit
   Beleg fuer die alte Koordinaten-/Textloesung, nicht Vorlage fuer das
   neue Modell.

Das neue SSOT `docs/ssot/40-der-koerper-als-grundlage.md` bestaetigt
die Grenze: Ein anatomischer Fakt gilt fuer jeden; eine Grafik ist nur
eine Darstellung dieses Fakts.

### A1 - alle 16 Stellen eingeordnet

| Stelle | Route | kanonischer Koerperort | Art | Muskelrelation |
|---|---|---|---|---|
| `delt_l` - Deltoid L | `im` | Deltamuskelregion | Muskel | Deltoids |
| `delt_r` - Deltoid R | `im` | Deltamuskelregion | Muskel | Deltoids |
| `glute_l` - Gluteus L | `im` | dorsogluteale Muskelregion | Muskel | Gluteus Maximus + Medius |
| `glute_r` - Gluteus R | `im` | dorsogluteale Muskelregion | Muskel | Gluteus Maximus + Medius |
| `lat_l` - Latissimus L | `im` | Latissimus-dorsi-Muskelregion | Muskel | latissimus dorsi |
| `lat_r` - Latissimus R | `im` | Latissimus-dorsi-Muskelregion | Muskel | latissimus dorsi |
| `quad_l` - Quadriceps L | `im` | Vastus-lateralis-Muskelregion | Muskel | Vastus Lateralis |
| `quad_r` - Quadriceps R | `im` | Vastus-lateralis-Muskelregion | Muskel | Vastus Lateralis |
| `vglute_l` - Ventrogluteal L | `im` | ventrogluteale Muskelregion | Muskel | Gluteus Medius + Minimus |
| `vglute_r` - Ventrogluteal R | `im` | ventrogluteale Muskelregion | Muskel | Gluteus Medius + Minimus |
| `abd_l` - Abdomen L | `sc` | subkutanes Bauchfett | Fettdepot | keine |
| `abd_r` - Abdomen R | `sc` | subkutanes Bauchfett | Fettdepot | keine |
| `sq_delt_l` - SubQ Deltoid L | `sc` | posteriores Oberarmfett | Fettdepot | keine |
| `sq_delt_r` - SubQ Deltoid R | `sc` | posteriores Oberarmfett | Fettdepot | keine |
| `thigh_sq_l` - SubQ Thigh L | `sc` | anterolaterales Oberschenkelfett | Fettdepot | keine |
| `thigh_sq_r` - SubQ Thigh R | `sc` | anterolaterales Oberschenkelfett | Fettdepot | keine |

Ergebnis: **10 Muskelstellen, 6 Fettdepotstellen, 0 reine
Landmarkenstellen.** `landmark_note` ist die Anleitung zum Auffinden
des Zielgewebes; sie macht dieses Zielgewebe nicht zur Landmarke.

Die Mehrwertigkeit ist notwendig: Ventrogluteal umfasst Gluteus
Medius und Minimus, dorsogluteal Maximus und Medius. Alle sieben
Relationen zeigen auf kanonische `training.muscle_groups`; Aliaszeilen
werden nicht verwendet.

### A2 - eine Stelle kennt ihren Ort

Die Strukturmigration
`20260926003956_c544_koerperorte.sql` legt an:

- `public.koerperorte`: grafikneutraler Katalog mit kanonischem Code,
  Namen, Art (`muskel`, `fettdepot`, `landmarke`) und Beleg;
- `public.koerperort_muskeln`: mehrwertige Relation zu
  `training.muscle_groups`;
- `medical.injection_sites.koerperort_id`: FK auf den Koerperort mit
  `ON DELETE RESTRICT`.

Der Seed `544_koerperorte.sql` schreibt 8 Orte, 7 Muskelrelationen und
die 16 expliziten Stellenzuordnungen. Erst danach setzt
`20260926004445_c544_injection_site_location_required.sql` die FK-Spalte
auf `NOT NULL`. Es gibt bewusst keinen Default: Ein neuer Schreibweg,
der den Koerperort vergisst, muss scheitern.

Eine zusammengesetzte FK in `koerperort_muskeln` erzwingt ausserdem
`koerperort_art = 'muskel'`. Damit kann ein Fettdepot nicht versehentlich
eine Muskelrelation tragen.

### A3 - die 18 Grafikflaechen ohne Muskel

| Einordnung | Anzahl | Codes |
|---|---:|---|
| Hierarchiewurzeln | 8 | `wurzel-ruecken`, `wurzel-brust`, `wurzel-rumpf`, `wurzel-arme`, `wurzel-schultern`, `wurzel-beine`, `wurzel-hals`, `wurzel-umriss` |
| reine Umriss-/Orientierungsflaechen | 7 | `head`, `hair`, `hands`, `feet`, `ankles`, `knees`, `kehle` |
| Sehne bzw. grafische Trennlinie | 2 | `achillessehne`, `tendinous-inscriptions` |
| grafische Muskelflaeche ohne Trainings-FK | 1 | `flanke` |

**Keiner dieser 18 Eintraege ist ein Fettdepot.** Sie sind
Hierarchie- oder Zeichenobjekte der Koerperkarte. Eine FK von
Injektionsstellen auf `koerperflaechen` haette daher die Darstellung
zum Fachmodell gemacht und den SubQ-Fall weiterhin nicht getragen.
`koerperflaechen` bleibt unveraendert.

### A4 - subkutan ohne Muskel ist belegt

Die [CDC Pink Book guidance](https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-6-vaccine-administration.html)
ordnet subkutane Injektionen dem Fettgewebe unter der Dermis und oberhalb
des Muskels zu. Die
[CDC Vaccine Administration guidance](https://www.cdc.gov/vaccines/hcp/imz-best-practices/vaccine-administration.html)
grenzt davon die intramuskulaere Gabe in Muskelmasse ab. Fuer die
glutealen Mehrfachzuordnungen belegt die
[systematische Review zur ventroglutealen Stelle](https://pmc.ncbi.nlm.nih.gov/articles/PMC10415997/)
die beteiligten Muskeln.

Die Gegenprobe ist im Integrationstest fest: Alle 6 `sc`-Stellen zeigen
auf `fettdepot`, alle 10 `im`-Stellen auf `muskel`; Fettdepots haben
0 Muskelrelationen.

### A5 - bestehende Stellen unveraendert

Vor C-544 hatten die 16 Zeilen ueber alle bisherigen Fachfelder ohne
`created_at`/`updated_at` den Hash
`82e0d88d47e2aa6e6a6c23bb4f209f49`. Nach dem Seed ist derselbe Hash
vorhanden, wenn nur die neue FK-Spalte zusaetzlich ausgenommen wird.
Zeilenzahl, IDs, Route, Namen, Koordinaten, Nadeldaten, Rotation und
Hinweise sind unveraendert. Es wurde nur `koerperort_id` befuellt.

### Security-Review

```yaml
security_review:
  status: passed
  issues: []
```

Beide neuen Tabellen haben RLS. `anon` und `PUBLIC` haben keine Rechte;
`authenticated` hat ausschliesslich `SELECT`; `service_role` pflegt den
gemeinsamen Katalog. Der Test wechselt tatsaechlich auf
`authenticated` und liest 8 Orte sowie 7 Relationen. C-544 fuehrt keine
personenbezogenen medizinischen Daten, keinen oeffentlichen Endpunkt und
keine Secrets ein.

### A6 - Sicherung und Pruefung

- Vollstaendige Sicherung des Live-Stands nach C-543 und vor einem
  moeglichen C-544-Einspielen:
  `backup/schema/20260926075434_c544_vor_live.dump`, 473.951.744 Byte,
  SHA-256
  `8E94D83033512057CBD4F6781A516E5D47C56032CBE20D599BD45D1D3BCD6E18`.
- Restore in eine isolierte Datenbank mit `--no-acl`: 312 Tabellen,
  509 Policies; C-543 blieb mit 6.726 Grundzuordnungen, 23.402
  effektiven Paaren, Vastus Lateralis 356 und Legs 613 erhalten.
- Vollkette aus leerer Datenbank `lumeos_c544_vollkette`: 276 Schritte,
  Exit-Code 0.
- Fokussierter Red/Green-Test: erst 0 statt 8 Orte und nullable FK;
  danach 6/6 Tests gruen gegen die frische Vollkette.
- Schema-Sollstand gegen die frische Vollkette: 187/187 fremde Tabellen,
  63/63 fremde Funktionen, 68/68 Fremdschluessel und die Mindestzeilen
  8/7/16; `SCHEMA VOLLSTAENDIG`.
- `pnpm gate`: gruen, inklusive aller Waechter, Lint, Typpruefung,
  Tests und Builds.

**C-544 ist gebaut und vollstaendig geprueft, aber noch nicht live
eingespielt.** `apps/` und die Dev-Server wurden nicht angefasst; die
dort sichtbaren Aenderungen stammen aus fremder Arbeit.

## Abnahme

**2026-09-08, Orchestrator. Gebaut ? NICHT live.**

`[cmd]` **Keine `koerperort`-Tabelle in der laufenden
Datenbank.**

    8 kanonische Koerperorte
      5 Muskelregionen, 3 Fettdepots
    7 mehrwertige Muskelrelationen
    alle 16 Injektionsstellen zugeordnet
    koerperort_id nach dem Seed NOT NULL

### Der Bauentscheid, der Toms Beispiel traegt

> *,,Fettdepots koennen TECHNISCH keine Muskelrelation
tragen."*

`[read]` **Nicht *sollten nicht*, sondern *koennen nicht*** ?
**die Regel steht in der Datenbank, nicht in einem Kommentar.**

`[cmd]` **Damit traegt Toms Peptid-Beispiel: eine subkutane
Stelle IST Fett, und die Datenbank laesst nichts anderes zu.**

### Und die bestehenden Felder

`[cmd]` **Kontrollhash identisch, Fachfelder unveraendert.**

`[read]` **Er hat den Beweis mitgeliefert, dass nichts
danebenging** ? **statt es zu behaupten.**

`[cmd]` **Sicherung wiederhergestellt und geprueft, Vollkette
276 Schritte, Test 6/6, Gate gruen.**

**Abgenommen. Einspielen steht aus.**

