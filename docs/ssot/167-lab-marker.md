# C-162: Welcher Blutwert sich verschiebt

**Stand:** 2026-08-21  
**Gilt fuer:** `medical.lab_marker_catalog`, `supplements.substance_lab_effects`

---

## Wie viele LOINC-Codes treffen

`[cmd]` Quelle ist
`backup/kimi-research/Kimi_Agent/supplement_performance_database/data/platform/lab_markers.json`
aus `crawl_024`. Die Datei fuehrt 66 Marker. Alle 66 tragen
`needs_repo_validation = true`, weil Kimi den LumeOS-Medical-Katalog
nicht im Kontext hatte.

`[cmd]` 46 Marker tragen `loinc_candidates`. Alle 46 Kandidaten wurden
gegen `medical.biomarker_catalog` geprueft und liegen im 11.676er
LOINC-Katalog. Beispiele:

| Marker | Kimi/Repo-LOINC | Katalogtreffer |
|---|---:|---|
| ALT | `1742-6` | Alanine aminotransferase in Serum or Plasma |
| AST | `1920-8` | Aspartate aminotransferase in Serum or Plasma |
| GGT | `2324-2` | Gamma glutamyl transferase in Serum or Plasma |

`[cmd]` Von den 20 Markern ohne Kimi-Kandidat konnten 18 ueber den
lokalen Katalog eindeutig aufgeloest werden. Beispiele: IGF-1
`2484-4`, Magnesium `2601-3`, DHEA-S `2191-5`, Retinol `2923-1`,
Herzfrequenz `8867-4`, okkultes Blut im Stuhl `50196-5`.

`[cmd]` Zwei bleiben ohne LOINC-Code:

| Marker | Grund |
|---|---|
| `lab_hcg` | Kein eindeutiger Einzeltest: qualitativ/quantitativ, Urin/Serum und Beta/gesamt moeglich. |
| `lab_blood_pressure` | Sammelmarker: LOINC trennt systolischen und diastolischen Blutdruck. |

`[read]` Diese beiden bleiben nicht unsichtbar. Sie stehen im
`lab_marker_catalog` mit `validation_status = 'unresolved_no_unique_loinc'`
und `loinc_code = NULL`.

---

## Was die Substanzen verschieben

`[cmd]` 90 von 291 Kimi-Substanzen tragen `lab_effects`. Das sind 156
Kimi-Eintraege. Weil ein Eintrag mehrere Marker nennen kann, entstehen
222 Datenbankzeilen in `supplements.substance_lab_effects`: 203
Substanz-Marker-Verbindungen und 19 Effekte ohne Markerliste.

`[cmd]` Die Verteilung nach Kimi-Eintrag bleibt sichtbar:

| `effect_type` | Kimi-Eintraege | DB-Zeilen nach Marker-Expansion |
|---|---:|---:|
| `physiological_lab_effect` | 112 | 161 |
| `monitoring_requirement` | 31 | 42 |
| `assay_interference` | 13 | 19 |

`[cmd]` Beispiel physiologisch: `1-Andro (1-DHEA)` senkt Testosterone
`2986-8`; der Katalog liefert dafuer einen Laborbereich von 15-70 ng/dL.

`[cmd]` Beispiel Monitoring: Berberine verknuepft Fasting glucose
`1558-6`; der Marker ist im Katalog, aber die aktuelle
Referenzbereichstabelle liefert dafuer keinen numerischen Fallback.

`[cmd]` Beispiel Assay-Interferenz: Ashwagandha verknuepft TSH
`3016-3` mit `direction_enum = 'increase'`; der Katalogbereich liegt bei
0,4-4,0 mIU/L.

`[cmd]` Fuer Toms Stack gibt es live Treffer:

| Stack-Eintrag | Marker | Richtung | Bereich |
|---|---|---|---|
| Creatine Monohydrate | Creatinine `2160-0` | increase | Katalog-Fallback vorhanden, aber ohne numerische Werte |
| Creatine Monohydrate | eGFR CKD-EPI `62238-1` | false_low | Kein numerischer Bereich; C-84 hatte die Bezugsflaeche als offene Einheit benannt |
| Creatine Monohydrate | Cystatin C `33863-2` | unaffected | Kein numerischer Bereich |
| Omega-3 (EPA/DHA) | LDL `13457-7` | increase | 0-130 mg/dL |
| Omega-3 (EPA/DHA) | Triglyceride `2571-8` | decrease | 0-150 mg/dL |

---

## Was `assay_interference` bedeutet

`[read]` `assay_interference` ist getrennt von einem physiologischen
Effekt. Ein physiologischer Effekt sagt: Der Koerperwert verschiebt
sich. Eine Assay-Interferenz sagt: Die Messung oder abgeleitete
Interpretation kann falsch erscheinen.

`[cmd]` Die Trennung steht in den Daten: `effect_type` bleibt eine eigene
Spalte und wird nicht mit `direction_enum` vermischt.

`[cmd]` Biotin ist der klassische Fall: Kimi fuehrt
`Vitamin B7 (biotin)` mit Assay-Interferenzen fuer immunologische Tests.
Die bestehende Regel `wr_lab_biotin` bleibt unveraendert; C-162 baut nur
die Markerbruecke daneben.

`[cmd]` Kreatin ist der Randfall: Kimi klassifiziert Serum-Creatinin und
creatininbasiertes eGFR als `assay_interference`, obwohl das Creatinin
laut Mechanismus real erhoeht ist und eGFR als abgeleiteter Wert
falsch niedrig wirkt. Diese Klassifikation wurde nicht umgeschrieben;
der Mechanismus und die Konsequenz stehen unveraendert an der Zeile.

`[read]` Daraus folgt keine Bewertung und keine Empfehlung. Die Tabelle
sagt, welcher Marker betroffen sein kann und ob der Marker selbst oder
die Mess-/Ableitungslogik betroffen ist.

---

## Was leer bleibt

`[cmd]` `lab_hcg` und `lab_blood_pressure` bleiben ohne LOINC-Code. Das
ist keine Datenluecke im Sinne von "nicht gesucht", sondern eine
Identitaetsentscheidung: Bei hCG fehlt der konkrete Testtyp; bei
Blutdruck braucht es mindestens systolisch und diastolisch statt eines
Sammelcodes.

`[cmd]` 19 Effekte haben keine `lab_marker_ids`. Sie werden trotzdem als
`mapping_status = 'effect_without_marker_id'` gespeichert. So bleiben
Kimi-Nullen wie "(none routine)" sichtbar und verschwinden nicht im
Import.

`[cmd]` Nicht jeder LOINC-Code hat einen numerischen Referenzbereich. Die
Bruecke speichert deshalb den Code und laesst den Bereich leer, wenn
`medical.biomarker_reference_ranges` keinen nutzbaren Fallback liefert.
Das entspricht der bestehenden NO_REFERENCE-Logik: Der Marker ist
bekannt, aber nicht bewertbar.

---

## Nachweis

`[cmd]` Live-Einspielung von
`supabase/_pipeline/14_medical/147_substance_lab_markers.ts`: Exit 0.
Ergebnis: 66 Marker, 64 mit LOINC, 222 Effektzeilen, 203
Substanz-Marker-Verbindungen.

`[cmd]` Zeilenschutz: `medical.lab_marker_catalog` und
`supplements.substance_lab_effects` haben RLS aktiv, je eine
`SELECT`-Policy fuer `authenticated`, und nur Katalogrechte. Es gibt
keine Nutzerzeilen in diesen Tabellen.
