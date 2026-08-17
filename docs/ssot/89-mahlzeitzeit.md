# C-61/C-59 — Uhrzeit fuer Mahlzeiten und mehrere je Typ

**Stand:** 2026-08-17

## Ergebnis

`[cmd]` `nutrition.meals` traegt jetzt `meal_time time without time zone`. Der Kettenschritt `052a_meal_time.sql` laeuft nach `052` und vor `053`, entfernt den alten Unique-Index `uq_meals_user_date_type` und legt Sortierindizes auf `(user_id, entry_date, meal_time, created_at, id)` sowie `(user_id, entry_date, meal_type, meal_time, id)` an.

`[cmd]` Live-Lauf von `052a`: 685 bestehende Mahlzeiten bekamen stabile Uhrzeiten, der Unique-Index wurde entfernt, beide neuen Indizes wurden angelegt.

`[cmd]` Nach dem Testdatenlauf stehen zwei Snacks am 2026-08-14 fuer Tom Miller: `10:14 Snack` und `16:00 Snack`. `testdaten-pruefen.ts` meldet 513 Mahlzeiten, 1.561 Positionen, 212 Wassereintraege und Exit 0.

## Was die Zeitzone bedeutet

`[cmd]` Die Datenbank meldet `TimeZone = UTC`. `public.profiles` hat kein Zeit- oder Zeitzonenfeld. `entry_date` wird heute als Datum vom Webpfad uebergeben; es ist kein aus `created_at` abgeleiteter UTC-Tag.

`[read]` `created_at` ist der Erfassungszeitpunkt, nicht der Essenszeitpunkt. Eine Mahlzeit um 20:00 Uhr in Thailand waere 13:00 UTC; wuerde die Datenbank `now()` als Uhrzeit setzen, stimmte die Mahlzeitenuhrzeit fuer Tom sichtbar nicht.

`[annahme]` Deshalb setzt die Datenbank keinen Default fuer `meal_time`. Die Oberflaeche muss die aktuelle lokale Uhrzeit als editierbare Vorgabe schicken. Der Nachtragefall ist dort ebenfalls eindeutig: `entry_date` ist nicht der heutige lokale Tag. Ohne lokale Client-Zeitzone kann die Datenbank diese Warnung nicht korrekt ausgeben.

## Was beim Wegfall des Index sonst noch hing

`[cmd]` `daily_summary` gruppiert nach `m.user_id, m.entry_date` und summiert alle `meal_items` des Tages. `meal_type` und der alte Unique-Index kommen in der Aggregation nicht vor.

`[cmd]` Live-Vergleich vor/nach `052a`, Tom Miller 2026-08-14: `meal_count=4`, `item_count=13`, `enercc=2371,95`, `prot625=166,35`, `fat=70,83`, `cho=246,08` blieb unveraendert. Erst der spaetere Testdatenlauf ergaenzte bewusst den zweiten Snack und erhoehte diesen Tag auf `meal_count=5`, `item_count=14`.

`[cmd]` Der heutige Web-Lesepfad sortiert Mahlzeiten nach `created_at`, nicht nach `meal_time` (`apps/web/src/lib/nutrition/diary-write.ts`). `[read]` Die aktuelle v2-Mahlzeitenansicht bildet eine Map nach `meal_type`; mehrere Snacks desselben Tages wuerden dort noch kollabieren. `[read]` `Same as yesterday` sucht die erste Mahlzeit eines Typs am Vortag; bei mehreren Snacks waere das ohne UI-Entscheidung nicht mehr eindeutig.

`[annahme]` Der Datenbankstand erlaubt mehrere Mahlzeiten je Typ und macht sie sortierbar. Die App muss als Folgeschritt `meal_time` lesen/schreiben, nach Zeit sortieren und fuer "Same as yesterday" entscheiden, ob genau eine Mahlzeit, alle Mahlzeiten eines Typs oder eine ausgewaehlte Uhrzeit kopiert wird.

## Testdaten

`[cmd]` `_testdaten/testdaten-einspielen.ts` schreibt fuer jede Seed-Mahlzeit eine stabile `meal_time`: Fruehstueck `07:30`, Mittag `12:30`, Snack `16:00`, Abendessen `19:30`.

`[cmd]` Das Szenarioregister fuehrt neu den Fall "Mehrere Snacks am selben Tag" fuer Tom Miller am 2026-08-14. `testdaten-pruefen.ts` schlaegt fehl, wenn dort nicht exakt zwei Snacks mit `10:14,16:00` stehen.

`[read]` `_testdaten/eigenes-konto-fuellen.sql` musste mitgezogen werden: es bildete kopierte Mahlzeiten bisher ueber `(entry_date, meal_type)` ab. Das ist nach C-59 nicht mehr eindeutig. Die Abbildung laeuft jetzt ueber explizite Alt-/Neu-IDs und kopiert `meal_time` mit.

## Nachweise

`[cmd]` Kettenlauf in Wegwerf-Datenbank `lumeos_kette_c61_c59`: 47 Schritte, Abschlusspruefung `SCHEMA VOLLSTAENDIG`, `KETTE OK: 38.0s`.

`[cmd]` `schema-vollstaendigkeit-pruefen.ts` live: Tabellen 22/22, Sichten 2/2, Funktionen 20/20, Zeilenschutz 22/22, Policies 22/22, GRANTs 24/24, `SCHEMA VOLLSTAENDIG`.

`[cmd]` `v052_diary.sql` live: `meal_time_column_exists=true`, `uq_meals_user_date_type_absent=true`, `idx_meals_user_date_time_exists=true`, 0 Owner-Mismatches, 0 verwaiste Positionen.

`[cmd]` `pnpm gate`: 8/8 Tasks erfolgreich.

## Was nicht gebaut wurde

`[read]` Keine Oberflaeche und keine Datei unter `apps/web/` oder `packages/ui/` wurde fuer diesen Auftrag geaendert. Der bestehende App-Schreibpfad sendet noch kein `meal_time` und behandelt `23505` fuer den alten Unique-Fall weiter als `DUPLICATE_MEAL`; das ist nach dem DB-Schritt veraltet, aber bewusst nicht Teil dieses Auftrags.

`[annahme]` `meal_time` bleibt vorerst nullable, damit der existierende Schreibpfad ohne UI-Anpassung nicht sofort bricht. Neue Produktwrites sollen die lokale Uhrzeit explizit setzen.
