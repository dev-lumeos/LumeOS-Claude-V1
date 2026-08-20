# C-140 — Erfahrungsgrad, LOINC-Luecken, Zielhistorie, feste Erwartungen

Datum: 2026-08-20

## Wo der Erfahrungsgrad sitzt

`[read]` Erfahrungsgrad ist Selbstauskunft des Nutzers. Er ist nicht
`activity_level`: ein Beginner kann `very_active` sein. Er ist auch
nicht Coach-Autonomy: Autonomy ist die Fremdeinschaetzung durch den
Coach.

`[cmd]` `public.profiles` fuehrt jetzt `experience_level text`, nullable,
ohne Default. Erlaubt sind genau vier Werte:

| Wert | Bedeutung |
|---|---|
| `beginner` | Beginner |
| `advanced` | Advanced |
| `pro` | Pro |
| `elite` | Elite |

`[cmd]` Der Test auf der laufenden Datenbank: `advanced` laesst sich
setzen und lesen. `rookie` verletzt
`profiles_experience_level_check`. Die Testtransaktion wurde
zurueckgerollt; `dev@lumeos.app` steht danach weiter auf `NULL`.

`[cmd]` `v090_profile.sql` prueft jetzt 18 Aussagen: 15 Profilspalten,
12 nullable Profilachsen, 10 Check-Constraints und
`experience_level ohne default`.

`[read]` Die Settings-Kachel kann die Spalte jetzt aufnehmen. Die UI
ist in diesem Auftrag nicht geaendert worden.

## Wie die LOINC-Abweichungen behoben sind

`[cmd]` Vorher stand im G-84-Bericht: 23 von 37 Markern waren
gruppierbar. Die 14 offenen zerfielen in fuenf LOINC-Abweichungen und
neun echte Luecken.

`[cmd]` Schritt `144_biomarker_spec_enrichment.ts` fuehrt jetzt fuenf
Aliaszeilen mit `source_status = spec_loinc_alias_c140`:

| Daten-Code | Spec-Code | Marker | Bereich gespiegelt? | Grund |
|---|---|---|---|---|
| `1558-6` | `2345-7` | Glucose fasting | nein | Fasting-Code statt allgemeiner Serumglukose |
| `13457-7` | `2089-1` | LDL Cholesterol | ja | LDL berechnet, gleiche Einheit `mg/dL` |
| `4544-3` | `20570-8` | Hematocrit | ja | automatisches Blutbild statt berechnet, gleiche Einheit `%` |
| `14635-7` | `1989-3` | Vitamin D, 25-OH | nein | LOINC-Einheit `nmol/L`, Seed/Spec `ng/mL` |
| `2601-3` | `2614-6` | Magnesium | nein | Spec-Zeile zeigt auf Methemoglobin; Daten-Code ist Magnesium |

`[cmd]` Ergebnis nach Live-Einspielen:

| Messung | Wert |
|---|---:|
| `biomarker_spec_enrichment` | 49 Zeilen |
| davon direkte Spec-Zeilen | 44 |
| davon C-140-Aliaszeilen | 5 |
| display-nutzbar | 45 |
| Spec-Bereichszeilen | 100 |
| `biomarker_reference_ranges` gesamt | 564 |
| Gruppierbarkeit im Seedbestand | 29 von 38 distinct Markern |

`[annahme]` Die Abweichung 37 gegen 38 kommt aus der aktuellen
Seed-Identitaet: die Zaehlung ueber distinct Rohmarker unterscheidet
zwei rohe Glukose-/Unbekannt-Faelle. Der alte Bericht zaehlte 37
Anzeige-Marker. Die Richtung ist gleich: fuenf zusaetzliche Marker sind
gruppierbar.

`[cmd]` IGF-1 bleibt offen: die Spec nennt `10231-9`, der Seed fuehrt
`2484-4`. Das ist C-91/A-20 und nicht einer der fuenf G-84-Faelle.
Nicht stillschweigend geloest.

## Was die Zielhistorie zeigt

`[read]` Abgeschlossene Ziele duerfen keinen aktiven Slot belegen.
`uq_user_goals_active_slot` gilt nur fuer `status = active`.

`[cmd]` `goals.user_goals.status` kennt jetzt auch `missed`. Ohne diesen
Wert waere "nicht erreicht" nur als falsches `abandoned` speicherbar.
`goal_milestone_status()` behandelt `missed` wie `achieved` und
`abandoned` als terminalen gespeicherten Zustand.

`[cmd]` Seedbestand fuer `tom.seed`, `max.seed`, `sarah.seed`:

| Zielstatus | Anzahl |
|---|---:|
| `active` | 3 |
| `achieved` | 1 |
| `missed` | 1 |
| `abandoned` | 1 |

| Meilensteinstatus | Anzahl |
|---|---:|
| `open` | 2 |
| `achieved` | 2 |
| `missed` | 2 |
| `abandoned` | 1 |

`[cmd]` Aktive Slots bleiben frei von Historie: Tom hat aktive Slots
`1,2`, Max Slot `1`; die abgeschlossenen Ziele nutzen Prioritaeten 4
bis 6 und fallen nicht unter den Unique-Index.

`[cmd]` Auf `dev@lumeos.app` liegen durch
`eigenes-konto-fuellen.sql` dieselben Tom-Daten: 5 `user_goals`, 6
`goal_milestones`, 2 Phasen. `test-user@lumeos.local` bleibt klein:
1 Mahlzeit, 2 Positionen, 1 Zielwert, keine Goal-Historie.

## Welche Erwartungen fest sind und welche nicht

`[read]` Eine Erwartung ohne Zahl misst nichts. Eine Erwartung auf die
Kommastelle misst aber die Quelle, nicht das Ergebnis, wenn die Quelle
wachsen darf.

`[cmd]` Gepruefte feste Erwartungen und Bewertung:

| Stelle | Erwartung | Entscheidung |
|---|---:|---|
| `food_nutrients` | 869.501 Werte, 138 Codes, 2 Quellen | exakt richtig: fester BLS+Nachtrag-Stand |
| `foods` | 7.140 | exakt richtig: BLS-4.0-Bestand |
| `medical.biomarker_catalog` | 11.676 | exakt richtig: C-70b LOINC-Zuschnitt, Version 2.82 |
| `medical.biomarker_spec_enrichment` | 49 | exakt richtig: feste Spec plus fuenf C-140-Aliaszeilen |
| `medical.biomarker_reference_ranges` | 564 | exakt richtig fuer aktuelle Quellen; steigt nur bei neuer belegter Quelle |
| `training.exercises` | 1.416 | exakt richtig: aktueller Uebungskatalog, Kuration darf nichts verlieren |
| `training.exercise_muscles` | 6.588 | exakt richtig: Verlust waere Fehler, ausser E-19 wird bewusst bereinigt |
| `training.exercise_catalog_enrichment` | 1.407 | exakt richtig: sichere XLSX-Matches aus fester Datei |
| `medical.medication_*` | mindestens 56 / 119 / 124 | Untergrenze richtig: Kimi-Quelle darf wachsen; C-138-Falle |
| `medical.biomarker_aliases` | mindestens 292 | Untergrenze richtig: Alias-Kuration darf wachsen |
| `supplements.substance_aliases` | mindestens 1.132 | Untergrenze richtig: Bruecke darf wachsen |
| `supplements.supplement_catalog` | mindestens 44 | Untergrenze richtig: Katalog darf erweitert werden |
| `food_aliases`, `food_tags`, `foods_portions` | Mindestzeilen | Untergrenze richtig: kuratierte Daten wachsen |

`[cmd]` `146_medications_katalog.ts` ist bereits auf "mindestens"
gebaut: Wirkstoffe/Formulierungen/Produkte brechen nur, wenn der
Bestand unter 56/119/124 faellt. `testdaten-pruefen.ts` folgt dem jetzt
ebenfalls.

`[cmd]` Kettenlauf auf Wegwerf-Datenbank:
`pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_kette_c140_20260820`
lief gruen. Live danach gezielt eingespielt: `090`, `111`, `113`,
`144`, Testdaten und `eigenes-konto-fuellen.sql`.

`[cmd]` Abschlusspruefungen live:

| Pruefung | Ergebnis |
|---|---|
| `schema-vollstaendigkeit-pruefen.ts` | `SCHEMA VOLLSTAENDIG` |
| `testdaten-pruefen.ts` | `OK: C-82 Testdaten stimmen.` |
| `kette-readme-pruefen.ts` | `README/Kette: ok (74 Schritte dokumentiert)` |
| `v090_profile.sql` | 18 von 18 ok |
| `pnpm gate` | gruen, 393 Webtests |

