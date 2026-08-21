# 170 - Medical: Medikamente und Lab-Marker

Stand: 2026-08-21

## Was der Medikationskachel fehlt

`[cmd]` `medical.user_medications` ist vorhanden und fuehrt 21 Spalten:
`id`, `user_id`, `active_substance_id`, `product_id`, `name`, `drug_class`,
`cyp_profile`, `dose_amount`, `dose_unit`, `doses_per_day`, `route`,
`start_date`, `end_date`, `is_active`, `indication`, `notes`,
`measurement_source`, `source_detail`, `frozen_at`, `created_at`,
`updated_at`.

`[cmd]` Auf `dev@lumeos.app` liegen 1 Medikation und 1 Condition. Auf
`test-user@lumeos.local` liegen 0 Medikationen und 0 Conditions.

`[cmd]` Die zehn Spalten, die die Medikationskachel der Vorlage fuer die
Monitoring-Anzeige erwartet und die in der Tabelle nicht stehen:
`monitoring`, `monitoring_frequency`, `last_test`, `next_due`,
`monitoring_overdue`, `targets`, `side_effects`, `physician`, `rx`,
`prescription_ref`.

`[read]` Der Knopf "Add medication" bleibt deshalb gesperrt, aber nicht
mehr mit der falschen Begruendung "Tabelle fehlt". Die Tabelle existiert;
was fehlt, ist der Monitoring-Schreibpfad samt diesen Spalten. Aus
`next_due` und `monitoring_overdue` speisen sich vier der sechs
Alert-Eintraege des Entwurfs.

## Was ein Laborwert jetzt zeigt

`[cmd]` Der Katalog steht: `medical.lab_marker_catalog` hat 66 Marker,
64 davon mit LOINC-Code. `supplements.substance_lab_effects` hat 222
Zeilen:

| effect_type | Zeilen |
|---|---:|
| physiological_lab_effect | 161 |
| monitoring_requirement | 42 |
| assay_interference | 19 |

`[cmd]` Fuer den aktiven Stack von `dev@lumeos.app` werden 7 Effekte
gefunden: 5 physiologische Lab-Effekte und 2 Assay-Interferenzen.

| Substanz | Marker | Art | Richtung | Aussage |
|---|---|---|---|---|
| Creatine Monohydrate | Kreatinin `2160-0` | assay_interference | increase | Kreatin -> Kreatinin erhoeht das Substrat |
| Creatine Monohydrate | eGFR CKD-EPI `62238-1` | assay_interference | false_low | eGFR ist aus Kreatinin abgeleitet |
| Creatine Monohydrate | Cystatin C `33863-2` | physiological_lab_effect | leer | unabhaengiger Marker |
| Omega-3 (EPA/DHA) | LDL `13457-7` | physiological_lab_effect | increase | lipid remodeling |
| Omega-3 (EPA/DHA) | Triglyceride `2571-8` | physiological_lab_effect | decrease | reduced VLDL synthesis |

`[read]` Die Anzeige nennt die Verschiebung, bewertet sie aber nicht.
"ALT steigt" oder "Kreatinin steigt" ist eine Information; "Leberschaden"
oder "Nierenschaden" waere eine Diagnose und wird nicht gebaut.

`[cmd]` Der Referenzbereich kommt weiterhin aus `medical.biomarker_reference_ranges`:
Kreatinin `2160-0` hat Labor- und Optimalbereiche, eGFR `62238-1` hat
textuelle Bereiche, Cystatin C `33863-2` hat im aktuellen Bestand keinen
Bereich. Genau diese Grenze bleibt sichtbar.

`[annahme]` Die `Creatine monohydrate`-Effektzeilen selbst tragen keine
Quellen-URL. Verwandte Kreatin-Formen im selben Bestand tragen
`https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z`.
Das ist eine Datenluecke an diesen konkreten Monohydrat-Zeilen, nicht an
der Anzeige.

## Wie die Pfadpruefung misst

`[cmd]` `tools/svgpfade-pruefen.mjs` prueft jeden SVG-Pfad im Browser,
nicht mit einem eigenen Parser. Der normale Lauf meldet:

```text
Pfade insgesamt: 160
vom Browser bemaengelt: 0
EXIT=0
```

`[cmd]` Der Selbsttest mit einem eingebauten kaputten Pfad meldet:

```text
Pfade insgesamt: 161
vom Browser bemaengelt: 1
   [160] M 0 0 C 1 2 3
EXIT=1
```

`[cmd]` Die Pruefung steht jetzt im Gate nach `i18n-pruefen.mjs` und vor
`turbo run typecheck test build`.

`[cmd]` `apps/web/public/mockup/components/MuscleBodyMap.js` wird im
Produktpfad nicht importiert. `rg` findet sie nur im oeffentlichen
Mockup-Test `MuscleBodyMap_test.html`; die produktive Karte liegt in
`packages/ui/src/koerperkarte.tsx` und nutzt die Pfade aus
`packages/ui/src/koerperkarte-pfade.ts`.

## Was Attrappe bleibt

`[cmd]` Gerendert auf `/v2/medical`: Dashboard 5 Attrappenmarken,
Tracking nach Klick auf "Medications" 1 Attrappenmarke, Biomarker-Modal
nach Klick auf "Creatinine" 1 Attrappenmarke. Der vom Auftrag genannte
Stand "6 auf `/v2/medical`" trifft fuer den Tracking-Kontext weiterhin:
`/v2/medical?tab=tracking` rendert vor Subtab-Klick 6 Attrappenmarken.

`[cmd]` Sichtbarer Nachweis:

| Ansicht | Befund |
|---|---|
| Tracking -> Medications | `Warfarin` sichtbar, Monitoring-Grenze sichtbar |
| Biomarkers -> Creatinine | `Stack effects` sichtbar, `Creatine Monohydrate` sichtbar |
| Biomarkers -> Creatinine | `assay interference` getrennt sichtbar |

`[read]` Weiter Attrappe bleiben der Health-Score im Dashboard, die
Alert-Liste aus dem Entwurf, Symptome, manuelle Werteingabe,
Laborimport/OCR, Privacy/Export-Workflows und der Medikamenten-Schreibweg.

`[cmd]` Zeilenschutz: als `test-user@lumeos.local` sind 0 Zeilen aus
`medical.user_medications` und 0 aus `medical.user_conditions` sichtbar;
explizit gegen `dev@lumeos.app` ebenfalls 0.
