# GO-10 / GO-14: Koerpermessungen, Gewichtsverlauf und Navy-Koerperfett

Stand: 2026-08-17

## Ergebnis GO-10

[cmd] Neuer Kettenschritt: `supabase/_pipeline/11_goals/112_body_measurements.sql`.

[cmd] Der Schritt erzeugt zwei Nutzerdaten-Tabellen im Schema `goals`:

| Tabelle | Zweck | Zeilenschutz |
|---|---|---|
| `goals.body_measurements` | Gewicht, optional Koerperfett, Hoehen-Snapshot, abgeleitete Werte | eigene Zeilen |
| `goals.body_circumferences` | 13 Koerperumfaenge | eigene Zeilen |

[cmd] Kettensteuerung und README stimmen: `kette-readme-pruefen.ts` meldet `README/Kette: ok (53 Schritte dokumentiert)`.

[cmd] Kompletter Kettenlauf in der Wegwerf-Datenbank `lumeos_kette_20260817091717`: Exit 0, Abschlusspruefung gruen, Wegwerf-Datenbank geloescht. Der Lauf dauerte 56,1 Sekunden und legte vorher `backup/schema/20260817091717_c43_vor_kettenlauf.sql` an.

[cmd] Live eingespielt: `112_body_measurements.sql` meldete in GO-10 `112_body_measurements ok: 2 Tabellen, 8 Policies, RLS aktiv.`

[cmd] `schema-vollstaendigkeit-pruefen.ts`: Exit 0. Relevante Zeilen damals: Tabellen 22/22, Funktionen 20/20, Zeilenschutz 22/22, Policies 22/22, GRANTs 24/24, Fremde Tabellen 14/14, Fremde Funktionen 14/14.

## Welche der beiden `body_measurements` gilt

[cmd] `referenz/lumeos-2026/supabase/migrations/016_create_goals_tables.sql` ist die fruehere Fassung. Sie trennt `body_measurements` und `body_circumferences`, fuehrt aber auch Foto-Tabellen.

[cmd] `referenz/lumeos-2026/supabase/migrations/037_body_measurements.sql` ist nach Nummer die spaetere Fassung. Sie legt eine zweite `body_measurements`-Form an, mit Gewicht, Koerperfett und Umfangsfeldern in einer Tabelle, sowie `USING (true)`-Development-RLS.

[read] `docs/specs/Goals/DATABASE.md` beschreibt Gewicht/Koerperfett und Umfaenge als getrennte Tabellen. Die Spec nennt 13 Umfangsfelder und Fotos getrennt.

[annahme] Fachlich traegt die Trennung aus `016` und der Spec besser fuer dieses Repo: Gewicht kann taeglich kommen, Umfaenge eher woechentlich. Die spaetere `037` wurde nicht direkt uebernommen, weil sie die Messarten zusammenzieht und eine Development-Policy enthaelt.

## Wie Profilgewicht und Verlauf zusammenhaengen

[cmd] `public.profiles.body_weight_kg` existiert seit GO-01 als aktueller Profilwert. `goals.body_measurements` ist der Verlauf.

[cmd] Der Trigger aktualisiert `public.profiles.body_weight_kg` aus dem neuesten Messpunkt nach `measurement_date`, `measurement_time`, `created_at`, `id`. Damit gibt es fuer den aktuellen Wert keine zweite Wahrheit.

[cmd] Testdaten-Nachweis: Tom hat 43 Messpunkte vom 2026-08-02 bis 2026-09-13, min. 83,64 kg, max. 85,07 kg. Das Profilgewicht steht nach dem Einspielen auf 85,000 kg und der neueste Messpunkt auf 85,00 kg.

[cmd] Ein eigener Insert als `authenticated` mit Toms JWT-Kontext wurde akzeptiert und per `ROLLBACK` verworfen; eine Einfuegung fuer Max mit Toms JWT-Kontext scheiterte mit `new row violates row-level security policy`.

[annahme] Wenn ein Nutzer alle Messpunkte loescht, bleibt ein eventuell vorhandenes Profilgewicht stehen. Das ist absichtlich konservativ: ein Onboarding-Gewicht darf nicht automatisch verschwinden, nur weil der Verlauf leer ist.

## Welche Umfaenge gebaut sind

[cmd] Die Spec nennt 13 Umfaenge: Nacken, Schultern, Brust, linker/rechter Oberarm, linker/rechter Unterarm, Taille, Huefte, linker/rechter Oberschenkel, linke/rechte Wade.

[cmd] Die Designvorlage zeigt 12 Zeilen: Nacken, Brust, Schultern, Taille, Huefte, Arm rechts/links, Unterarm, Oberschenkel rechts/links, Wade rechts/links. Der Unterarm ist dort nicht seitengetrennt.

[annahme] Gebaut wurde die vollstaendige 13er-Liste aus der Spec. Die Designvorlage kann spaeter beide Unterarmseiten zusammenfassen; die Daten behalten die genauere Form.

## Welche Koerperfettformeln danebenliegen

[cmd] `rg` im Vorgaengerrepo fand 426 Treffer zu Koerperfett, FFMI, BIA, Caliper und verwandten Begriffen.

[cmd] `rg -n "Navy|navy|Hodgdon|Beckett|Siri"` in `referenz/lumeos-2026/src`, `apps` und `supabase` fand 0 Treffer. Es lag dort keine Navy-Implementierung vor, die direkt uebernommen werden konnte.

[cmd] `referenz/lumeos-2026/src/api/goals/routes/measurements.ts` und `referenz/lumeos-2026/src/modules/goals/lib/goal-measurements.ts` speichern beziehungsweise nutzen `body_fat_pct` und FFMI-artige Ableitungen. Sie berechnen den Koerperfettanteil aber nicht aus Umfaengen.

[cmd] Die Vorgabe meldete 51 Fundstellen zu Koerperfett im Vorgaengerrepo, unter anderem Jackson-Pollock, Durnin, Navy und FFMI.

[read] Jackson-Pollock und Durnin brauchen Hautfaltenmessungen mit Caliper. Diese Felder gibt es in diesem Repo nicht.

[cmd] Gebaut waren vor GO-14 nur abgeleitete Werte aus bereits erfassten Messwerten: `lean_mass_kg`, `fat_mass_kg`, `bmi`, `ffmi`. Es wurde kein Koerperfettwert aus Umfaengen berechnet.

## Ergebnis GO-14

[cmd] `112_body_measurements.sql` fuehrt jetzt Herkunftsspalten an beiden Rohmessungstabellen: `measurement_source` mit `CHECK IN ('manual','device','import','admin')` und `source_detail`.

[cmd] Live eingespielt: `112_body_measurements.sql` meldete `112_body_measurements ok: 2 Tabellen, 8 Policies, RLS aktiv, 4 Funktionen.`

[cmd] Neue Funktion: `goals.body_composition_navy(user_id uuid, p_date date)`. Sie liest das letzte vollstaendige Umfangsset bis zum Stichtag, nutzt `public.profiles.biological_sex` und `height_cm`, nimmt fuer FFMI das letzte Gewicht bis zum Stichtag oder `profiles.body_weight_kg`, und liefert keine Zeile, wenn Pflichtdaten fehlen.

[cmd] Toms Testwert am 2026-09-13: Koerperfett Navy 10,31 %, Spanne 6,81-13,81 %, FFMI 21,97, Lean Mass 76,24 kg, Gewicht 85,00 kg, `method=navy_circumference`, `source=derived_navy`, `input_source=manual`.

[cmd] Ohne notwendige Umfaenge liefert die Funktion nichts: Sarah am 2026-09-13 erzeugt 0 Zeilen.

[cmd] Der Testdatenverlauf zeigt eine erkennbare fallende Tendenz: Navy-KFA 11,82 % am 2026-08-02 gegen 10,31 % am 2026-09-13, Differenz 1,51 Prozentpunkte.

[cmd] `schema-vollstaendigkeit-pruefen.ts`: Exit 0 nach Live-Einspielung. Relevante Zeilen: Tabellen 22/22, Funktionen 20/20, Fremde Funktionen 15/15, `SCHEMA VOLLSTAENDIG`.

[cmd] `_testdaten/testdaten-einspielen.ts` aktualisiert die Testdaten: 3 Nutzer, 513 Mahlzeiten, 1561 Positionen, 212 Wassereintraege, 9 Trainingssitzungen, 36 Recovery-Check-ins, 43 Koerpermessungen, 7 Umfangsmessungen.

[cmd] `testdaten-pruefen.ts`: Exit 0. Relevante Zeilen: `Koerpermessungen/Umfaenge: 43/7`, `OK: C-82 Testdaten stimmen.`

[cmd] Herkunft im Seed: `body_measurements|manual|43`, `body_circumferences|manual|7`.

[cmd] RLS-Gegentest: Als Tom (`authenticated` mit Toms JWT-Kontext) wurde eine eigene Umfangszeile akzeptiert; eine anschliessende Einfuegung fuer Max brach mit `new row violates row-level security policy` ab. Die Transaktion wurde dadurch nicht committed.

## Was aus dem Vorgaengerrepo uebernommen wurde

[cmd] Uebernommen wurde die Strukturidee: Gewicht/KFA und Umfaenge als Nutzerdaten mit Verlauf, dazu FFMI als abgeleiteter Wert aus Gewicht, Groesse und Koerperfett.

[cmd] Nicht uebernommen wurde eine Navy-Implementierung aus dem Vorgaengerrepo, weil `Navy`, `Hodgdon`, `Beckett` und `Siri` dort in den geprueften Code- und SQL-Pfaden nicht vorkamen.

[cmd] Nicht uebernommen wurden Development-RLS-Policies aus `037_body_measurements.sql`. Dieses Repo verwendet `auth.uid() = user_id` je Operation.

[annahme] Die Navy-Formel selbst ist daher kein Copy aus dem Vorgaengerrepo, sondern die jetzt entschiedene, rechenbare Methode auf Basis der vorhandenen Umfangsfelder.

## Warum die Spanne mitgeliefert wird

[read] Tom hat am 2026-08-17 entschieden: Navy, mit ausgewiesener Spanne statt einer Zahl.

[read] Der angegebene Standardfehler liegt bei 3 bis 4 Prozentpunkten gegen DEXA; bei einem gemessenen Wert von 18 % ist die fachlich ehrliche Darstellung etwa 14,5-21,5 %.

[cmd] Die Funktion fuehrt deshalb `standard_error_pct_points = 3.5`, `body_fat_pct_min` und `body_fat_pct_max`. Der Punktwert bleibt sichtbar, aber nicht allein.

[cmd] Am Testwert 10,31 % zeigt die Funktion 6,81-13,81 %. Das ist absichtlich breiter als eine normale UI-Zahl und verhindert eine Scheingenauigkeit.

[read] Umfangsverfahren koennen Athleten mit hoher Muskelmasse ueberschaetzen, und die Genauigkeit sinkt bei extremer Koerperzusammensetzung.

[cmd] Dieser Vorbehalt steht im Funktionswert selbst in `caution`, damit er mit dem Wert transportiert wird und nicht nur im Bericht existiert.

## Wie die Herkunft gefuehrt wird

[cmd] Rohwerte fuehren `measurement_source` und optional `source_detail`. Erlaubt sind `manual`, `device`, `import`, `admin`. Aktuell tragen alle 50 Testmessungszeilen `manual`.

[cmd] Der berechnete Navy-Wert fuehrt `source = 'derived_navy'` und `input_source` aus der verwendeten Umfangszeile. Damit ist sichtbar, dass der Wert nicht gemessen, sondern aus manuellen Umfaengen abgeleitet wurde.

[read] Grund: Eine BIA-Waage und Navy koennen fuer denselben Menschen 8 bis 10 Prozentpunkte auseinanderliegen. Gemischte Quellen duerfen im Verlauf spaeter nicht als biologische Veraenderung erscheinen.

[cmd] Im Vorgaengerrepo gab es 296 Treffer zu Device/Wearable/HRV/Readiness/BIA-nahen Begriffen.

[cmd] Konkret gefunden: `referenz/lumeos-2026/supabase/migrations/049_local_first_architecture.sql` legt `user_devices` fuer lokale Geraetesynchronisation an; Recovery-/Readiness-Pfade nutzen HRV-Begriffe; Uebersetzungen fuehren `methodBIA`. Nicht gefunden wurde eine konkrete Importtabelle fuer Koerperzusammensetzung aus einer BIA-Waage.

[annahme] Fuer A-17/Geraeteanbindung reicht die jetzige Struktur als Anker: neue Integrationen koennen `measurement_source='device'` setzen und Details in `source_detail` ablegen, ohne alte manuelle Werte umzudeuten.

## Was eine spaetere Fotosession an der Struktur braucht

[cmd] `body_circumferences` traegt `measurement_date` und `measurement_time`; `body_measurements` ebenso. Eine spaetere Fotosession kann an denselben Nutzer und denselben Zeitpunkt andocken, ohne eine neue Tageslogik zu erfinden.

[read] Fotosessions und Fotos stehen im Umsetzungsplan unter "Was nicht gebaut wird" und wurden in GO-10 nicht angelegt.

[annahme] Damit Bild und Umfang wirklich vergleichbar sind, braucht die Fotosession spaeter mindestens `user_id`, lokales Datum, lokale Uhrzeit und eine klare Herkunft des Bildes. Ein reines Datum waere zu grob, weil Umfang und Foto sonst an verschiedenen Tagen oder Tageszeiten gemischt werden koennen.

[annahme] Ein Fremdschluessel direkt auf `body_circumferences.id` waere spaeter moeglich, koppelt Fotos aber hart an Umfangsmessungen. Eine Zeitkoppelung ueber denselben Zeitpunkt haelt offen, ob ein Foto allein oder zusammen mit Umfaengen entsteht.

## Testdaten

[cmd] `_testdaten/testdaten-einspielen.ts` legt 43 Koerpermessungen und 7 Umfangsmessungen fuer Tom an.

[cmd] `_testdaten/testdaten-register.json` enthaelt den Fall `Gewichtsverlauf und Koerperumfaenge` und nennt jetzt auch Navy-KFA, Spanne, FFMI und Herkunft.

[cmd] Die Pruefung belegt, dass der Verlauf vom 2026-08-02 bis 2026-09-13 reicht, einen sichtbaren Trend hat, das Profilgewicht dem neuesten Messpunkt entspricht, der Hoehen-Snapshot gesetzt ist, die letzte Umfangsmessung alle 13 Felder fuehrt und Navy nur bei vollstaendigen Eingaben rechnet.

## Was nicht gebaut wurde

[read] Fotosessions und Fotos wurden nicht gebaut.

[read] Hautfaltenverfahren wurden nicht gebaut. Jackson-Pollock und Durnin brauchen Felder, die es nicht gibt.

[read] Keine Bewertung, ob ein Koerperfettwert gut oder schlecht ist. Das ist eine Aussage ueber einen Menschen und gehoert nicht in GO-14.

[cmd] Keine Oberflaeche wurde geaendert.

[annahme] Messungen sind Zeitpunkte, keine Gueltigkeitszeitraeume. Die `gueltig_ab`-Regel aus Zielwerten und Phasen gilt hier deshalb nicht: ein Messpunkt vor dem ersten Datum bleibt ein historischer Messpunkt, nicht eine Phase, die einen Zeitraum oeffnet.

## Validierung

[cmd] `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts`: Exit 0. Wegwerf-Datenbank `lumeos_kette_20260817094829`, Schema-Backup `backup/schema/20260817094829_c43_vor_kettenlauf.sql`.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`: Exit 0.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/kette-readme-pruefen.ts`: Exit 0.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts`: Exit 0.

[cmd] `pnpm gate`: Exit 0. Turbo meldete 8/8 Tasks erfolgreich.
