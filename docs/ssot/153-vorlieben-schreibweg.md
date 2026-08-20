# C-156: Vorlieben-Schreibweg und Datenluecken

Stand: 2026-08-20.

## Wie der Schreibweg jetzt arbeitet

[cmd] Vorher loeschte `nutrition.food_preferences_write` alle
`food_preference_items` eines Nutzers und schrieb die vom Browser
gelieferten Zeilen neu. Damit verschwand alles, was die Seite nicht
kannte; ausserdem wurde aus `source = search_thumb` beim naechsten
Speichern `source = settings`.

[cmd] Der Schreibweg bleibt ein atomarer Settings-Schreibweg, aber nicht
mehr ein Komplettloescher. `food_preferences` wird weiter als
Basisdatensatz upserted. Die Items werden nun ueber ihren fachlichen
Schluessel zusammengefuehrt: `target_type` plus `food_id`,
`category_id`, `tag_code`, `cuisine_code`, `exclusion_preset_code` oder
`catalog_item_code`.

[cmd] Eingehende Zeilen aktualisieren passende bestehende Zeilen, die
bestehende `source` bleibt dabei erhalten. Neue Zeilen werden eingefuegt.
Geloescht werden nur alte Zeilen mit `source = settings`, die im
aktuellen Settings-Payload fehlen. Zeilen aus `search_thumb` oder anderen
Herkunften bleiben stehen, wenn die Settings-Seite sie nicht mitschickt.

[read] Begruendung: Die Kachel speichert den Settings-Ausschnitt. Ein
Daumen-Klick und eine Suche sind andere Herkunftsarten und duerfen nicht
durch einen Kachel-Speicherlauf verschwinden. Ein RPC pro Kachel waere
moeglich, wuerde aber die Basisfelder von `food_preferences` wieder in
mehrere nicht-atomare Schreibwege zerlegen.

[cmd] Gegenprobe auf der Wegwerf-Datenbank: Eine bestehende Food-Zeile
mit `source = search_thumb` blieb nach einem Settings-Schreiblauf
erhalten; eine zweite Kategorie-Zeile wurde von `disliked` auf `liked`
geaendert; die Herkunft der ersten Zeile blieb `search_thumb`.

Ergebnis nach dem Lauf:

| target_type | preference | strength | source | Zeilen |
|---|---:|---:|---|---:|
| food | liked | boost | search_thumb | 1 |
| category | liked | boost | settings | 1 |
| food | liked | boost | settings | 1 |

[cmd] Der Schreibweg meldet jetzt, wenn die Basiszeile nicht geschrieben
wurde oder wenn nicht alle Payload-Items geschrieben/aktualisiert wurden.
Die RLS-Gegenprobe ohne Nutzerkontext bricht sichtbar ab:
`new row violates row-level security policy for table "food_preferences"`.
Das ist kein stilles `ok` ueber eine leergefilterte Operation.

## Was die vier Policies entfernt hat

[cmd] Live fehlten vor der Reparatur die zwoelf Admin-Policies aus
`100_training_schema.sql`; vorhanden waren nur die vier
`SELECT`-Policies. Die Grants auf `authenticated` waren live da. Die
Wegwerf-Datenbank aus dem Kettenlauf hatte alle Policies.

[cmd] Nach erneutem Einspielen von `100_training_schema.sql` auf live:
`training_admin_policies = 12`. Die Live-Schemapruefung meldet danach
Exit 0 und `SCHEMA VOLLSTAENDIG`.

[annahme] Ursache ist Live-Drift oder ein frueherer partieller Stand,
nicht die aktuelle Kette. Eine Suche in den spaeteren Pipeline-Schritten
fand keinen Schritt, der diese Policies entfernt.

## Wie die Coach-Beziehungen ueberleben

[cmd] Der Seed-Aufraeumteil loeschte bisher Seed-Auth-Nutzer neu. Damit
starben Beziehungen auf `max.seed` und `sarah.seed` per FK-Kaskade. Der
Aufraeumteil ist jetzt auf `coach.seed` begrenzt; Seed-Nutzer werden per
`ON CONFLICT (id) DO UPDATE` stabil gehalten, nicht geloescht.

[cmd] Nachweis live:

| Messpunkt | Beziehungen fuer `coach@lumeos.app` |
|---|---:|
| vor dem Seed-Lauf | 3 |
| nach `testdaten-einspielen.ts` | 3 |
| nach `eigenes-konto-fuellen.sql` | 3 |

[cmd] `test-user@lumeos.local` bleibt klein: 1 Mahlzeit, 2 Positionen,
1 Zielwert, keine kopierten Coach-/Medical-/Training-Daten.

[cmd] `testdaten-pruefen.ts` zaehlt den Seed-Basisbestand nun als
Mindestbestand und erlaubt stabile Portalbeziehungen daneben. Damit wird
die Wegwerf-Datenbank ohne Portalbestand weiter geprueft und live wird
nicht mehr verlangt, die Portalbeziehungen zu loeschen.

## Was ein unbekanntes Flag ausloest

[cmd] `testdaten-einspielen.ts` akzeptiert nur `--start`,
`--next-start`, `--days` und `--today`, jeweils mit Wert. Ein unbekannter
Parameter bricht vor jedem Datenbankzugriff ab.

Gegenprobe:

```text
pnpm exec tsx supabase/_pipeline/_testdaten/testdaten-einspielen.ts --bogus 1
Error: Unbekannter Parameter: --bogus
```

[read] Das verhindert denselben Fehler wie bei `.in()`-Grenzen: ein
unbekannter Eingang ist kein harmloser Default, sondern ein Zustand, der
sichtbar abbrechen muss.

## Nachweis

[cmd] Kettenlauf auf Wegwerf-Datenbank
`lumeos_kette_20260820111623`: Exit 0. Schema-Backup vorher:
`backup/schema/20260820111623_c43_vor_kettenlauf.sql`.

[cmd] Schemapruefung Wegwerf-Datenbank: Exit 0.

[cmd] Schemapruefung live nach Policy-Reparatur: Exit 0,
`SCHEMA VOLLSTAENDIG`.

[cmd] Testdatenpruefung Wegwerf-Datenbank: Exit 0. Coach-Bestand dort:
`2/2/1/1/6` fuer Permissions/Autonomy/Pending/Actions/Logs.

[cmd] Testdatenpruefung live: Exit 0. Coach-Bestand dort:
`3/3/1/1/8`, weil die erhaltenen Portalbeziehungen danebenliegen.

[cmd] `pnpm gate`: Exit 0.

[cmd] Live auf `dev@lumeos.app`: 1 `food_preferences`-Zeile und
3 `food_preference_items`; der kopierte Demobestand liegt weiter auf
Toms Dev-Konto.
