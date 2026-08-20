# C-130: Medikamente und Conditions

Stand: 2026-08-20

## Was der Katalog enthält

`[read]` Quelle ist der Kimi-Bestand unter
`backup/kimi-research/Kimi_Agent/supplement_performance_database/data/medications/`.
Er wird gelesen, aber nicht blind als medizinische Wahrheit bewertet.

`[cmd]` Eingespielt sind drei Katalogtabellen:

| Tabelle | Zeilen | Quelle |
|---|---:|---|
| `medical.medication_active_substances` | 56 | `medication_active_substances.jsonl` |
| `medical.medication_formulations` | 119 | `medication_formulations.jsonl` |
| `medical.medication_products` | 124 | `medication_products.jsonl` |

`[cmd]` Der Import bricht ab, wenn die erwarteten 56 / 119 / 124 Zeilen
nicht erreicht werden. Die Struktur ist nicht auf diese 56 begrenzt:
fachlicher Schlüssel ist die Kimi-ID, Rohdaten bleiben als `raw` erhalten,
und `drug_class` / `cyp_profile` sind Arrays mit GIN-Indizes, damit
weitere tausende Einträge denselben Vertrag tragen können.

`[cmd]` Abdeckung der sieben Klassen aus dem Feldvertrag:

| Klasse | Wirkstoffe |
|---|---:|
| `CYP3A4_substrate` | 8 |
| `antidiabetic` | 5 |
| `RAAS_inhibitor` | 2 |
| `SSRI` | 2 |
| `anticoagulant:warfarin` | 1 |
| `sedative` | 1 |
| `MAOI` | 0 |

`[annahme]` `MAOI` fehlt im Top-56-Bestand, nicht in der Struktur. Die
kommenden grösseren Kimi-Lieferungen können dieselbe Klasse tragen, ohne
eine Schemaänderung zu brauchen.

## Wie der Nutzer erfasst

`[cmd]` Neu ist `medical.user_medications`. Die Tabelle hält die
Nutzermedikation getrennt vom Katalog: optionaler Verweis auf Wirkstoff
und Produkt, Freitextname, Dosis, Einheit, Einnahmen pro Tag, Zeitraum,
Aktivstatus und Herkunft.

`[cmd]` Die regelrelevanten Felder werden am Eintrag gespeichert:
`drug_class[]` und `cyp_profile[]`. Das ist absichtlich ein Snapshot.
Wenn ein Katalogeintrag später korrigiert wird, verschiebt sich eine alte
Nutzermedikation nicht still mit.

`[cmd]` Testdaten: `tom.seed@example.com` und `dev@lumeos.app` haben je
eine Warfarin-Medikation mit `anticoagulant:warfarin` und
`CYP2C9_substrate`, `test-user@lumeos.local` hat keine Medikation.

`[read]` Keine Regel, keine Wechselwirkungsbewertung und keine
Dosierungsempfehlung ist Teil dieses Schritts. C-130 schafft nur die
Datenbasis, damit C-133 Regeln überhaupt auswerten kann.

## Wie die Conditions geschützt sind

`[cmd]` Neu ist `medical.user_conditions` mit den 15 Codes aus dem
Feldvertrag: Bluthochdruck, CKD, Diabetes, Schwangerschaft,
geplante Schwangerschaft, Lebererkrankung, Angst, Arrhythmie,
Hämochromatose, hormonsensitiver Krebs, Nierensteine,
Autoimmunthyreoiditis, Transplantation, HIV und Epilepsie.

`[cmd]` Zeilenschutz folgt dem bestehenden Medical-Muster:
`authenticated` sieht und ändert nur eigene Zeilen über `auth.uid()`,
`service_role` darf administrativ arbeiten. Der Nachweis unter der echten
`authenticated`-Rolle:

| Nutzer | sichtbare Medikationen | sichtbare Conditions |
|---|---:|---:|
| `dev@lumeos.app` | 1 | 1 |
| `test-user@lumeos.local` | 0 | 0 |

`[read]` Geprüft wurde auch `140_medical_schema.sql`: `lab_result_values`
nutzt dieselbe Schutzform aus RLS und Grants. Eine eigene
Spaltenverschlüsselung oder eine Coach-Freigabeschicht ist im aktuellen
Medical-Schema nicht gebaut. `[annahme]` Damit ist hier nichts anderes
zu erfinden; Coach-Zugriff bleibt ein eigener Schritt.

## Was die 20 Regeln jetzt könnten

`[cmd]` Vor C-130 waren alle 20 Medikamentenregeln aus dem Kimi-Bestand
blockiert, weil `medical.medications` als Datenseite fehlte. Nach C-130
existieren die benötigten Eingaben: `name`, `drug_class[]`,
`cyp_profile[]`, aktive Zeiträume und Conditions.

`[cmd]` Konkret kann eine spätere Regel jetzt erkennen, dass der
Testnutzer-Bestand auf `dev@lumeos.app` eine aktive
Warfarin-Medikation trägt. Damit ist der spätere Vitamin-K-/Warfarin-Fall
prüfbar, ohne dass diese Regel heute gebaut wird.

`[read]` Eine Regel, der ein Feld fehlt, darf später nicht stumm als
„trifft nicht zu" laufen. Sie braucht denselben Zustand wie
`NO_REFERENCE` bei Nährstoffen: Daten fehlen, also nicht bewertbar.

## Nachweis

`[cmd]` Kettenlauf über `kette-ausfuehren.ts` in einer Wegwerf-Datenbank:
Exit 0, 72 Schritte, anschliessend verworfen.

`[cmd]` Live eingespielt: `145_medications_schema.sql` und
`146_medications_katalog.ts`, danach `testdaten-einspielen.ts` und
`eigenes-konto-fuellen.sql`.

`[cmd]` `schema-vollstaendigkeit-pruefen.ts`: Exit 0, neue Mindestwerte
56 / 119 / 124 erfüllt.

`[cmd]` `testdaten-pruefen.ts`: Exit 0, Warfarin-Medikation,
Hypertension-Condition und sauberes `test-user`-Konto belegt.

`[cmd]` `kette-readme-pruefen.ts`: ok.

`[cmd]` `pnpm gate`: grün.
