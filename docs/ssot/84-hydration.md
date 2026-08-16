# Hydration-Datenseite

**Stand:** 2026-08-16

## Ausgang

`[read]` `055_water_logs.sql` legt `nutrition.water_logs` mit RLS, vier Owner-Policies und DML-Rechten fuer `authenticated` an. Der Schreibpfad ist datenbankseitig vorhanden, aber ohne Oberflaeche.

`[cmd]` `hydration_summary` fuehrt `user_id`, `entry_date`, `logged_ml`, `log_count`, `food_ml`, `food_ml_missing`, `total_ml`, `total_complete`. Die Sicht summiert damit getrunkenes Wasser und Wasser aus Mahlzeiten, aber sie liefert kein Tagesziel, keine Glaeserzahl und keinen 14-Tage-Vergleich.

`[read]` `ADR_WATER_TOTAL_HYDRATION.md` verlangt Gesamt-Hydration: explizit geloggtes Wasser plus Wasser aus Lebensmitteln. Das bleibt richtig und wurde nicht entfernt. Die Designvorlage zeigt weniger, aber die Daten behalten beide Quellen.

## Umsetzung

`[cmd]` Neuer Kettenschritt `056a_hydration_day.sql` erzeugt `nutrition.hydration_day(user_id, date)`. Die Funktion liest `hydration_summary` und `public.profiles.body_weight_kg` und liefert Tagesziel, Fortschritt, 250-ml-Glaeser und den Vergleich gegen die vorherigen 14 Kalendertage.

`[cmd]` Die Kettensteuerung hat 44 Schritte; `kette-readme-pruefen.ts` meldet `README/Kette: ok`. Der neue Schritt laeuft nach `090`, weil `body_weight_kg` erst dort entsteht. Der erste Wegwerf-Kettenlauf hatte genau das als Fehler gezeigt.

`[cmd]` Wegwerf-Kettenlauf ueber `kette-ausfuehren.ts`: `KETTE OK: 37.5s`, Abschlusspruefung `SCHEMA VOLLSTAENDIG`.

## Woher das Tagesziel kommt

`[read]` Im Vorgaengerrepo steht im WaterTracker: `Based on {bodyWeight}kg body weight (35ml/kg recommendation)`. Die Quick-Add-Mengen dort sind 250, 500, 750 und 1000 ml.

`[cmd]` C-55 startete mit Toms Testprofil: 85 kg mal 35 ml ergaben 2.975 ml, also die 3,0 L aus der Designvorlage gerundet. Das war der Stand aus dem Vorgaengerrepo.

`[read]` Die alte ADR nennt als Zielquelle `nutrition_targets.water_target`. Das aktuelle Goals-Schema fuehrt diese Spalte nicht. Deshalb wurde kein neues Goals-Ziel erfunden, sondern fuer V1 ein berechneter Lesewert aus dem Profil verwendet. Ein historisiertes, manuell aenderbares Wasserziel gehoert spaeter nach Goals.

## Wasserziel-Formel mit Faktoren

`[cmd]` Am 2026-08-16 wurde `056a_hydration_day.sql` von `body_weight_kg * 35` auf die Konsensformel erweitert:

```
body_weight_kg * 30 ml/kg * activity_factor * climate_factor
+ training_bonus_ml
+ pregnancy_bonus_ml
+ lactation_bonus_ml
```

`[cmd]` Die Ausgabe der Funktion blieb gleich. `target_ml` wird neu berechnet, `target_source` nennt alle Faktoren einschliesslich der neutralen Werte.

`[cmd]` Die fuenf erlaubten `activity_level`-Werte lassen sich ohne harte Rundung abbilden:

| `activity_level` | Faktor | Entspricht |
|---|---:|---:|
| `sedentary` | 1,0000 | 30,0 ml/kg |
| `light` | 1,0833 | 32,5 ml/kg |
| `moderate` | 1,1667 | 35,0 ml/kg |
| `active` | 1,2500 | 37,5 ml/kg |
| `very_active` | 1,3333 | 40,0 ml/kg |

`[cmd]` Toms Testprofil hat 85 kg und `activity_level = very_active`.
Neuer Wert: `85 * 30 * 1,3333 * 1,0 + 0 + 0 + 0 = 3.400 ml`.
`target_source` lautet:
`profile_body_weight_activity_formula(base_30_ml_per_kg*activity_factor_1.3333*climate_factor_1.0000+training_bonus_0_ml+pregnancy_bonus_0_ml+lactation_bonus_0_ml)`.

`[cmd]` Ein anderes Profil zeigt einen anderen Wert: Max Schmidt hat 78 kg und `activity_level = light`, Ergebnis `2.535 ml`.

`[cmd]` Ohne Gewicht bleibt der Zielwert leer: Sarah Johnson liefert `target_ml = NULL`, `target_available = false`, `target_source = missing_body_weight`.

`[cmd]` `progress_pct` wird nicht gekappt. Max Schmidt liegt am 2026-08-03 bei `total_ml = 2.601,8094`, `target_ml = 2.535`, `progress_pct = 102,6`. Die Funktion liefert kein UL-, Status- oder Warnfeld.

`[read]` Quellenlage: Die IOM/NASEM-Logik wird in oeffentlichen Zusammenfassungen als Gesamtwasserbedarf in der Groessenordnung 2,7 L fuer Frauen und 3,7 L fuer Maenner beschrieben, abhaengig von Aktivitaet und Umwelt. Die NHMRC-Zusammenfassung nennt normalen Wasserumsatz bei Erwachsenen von 2,5-3,0 L fuer 70 kg. ACSM-Positionen behandeln Training separat ueber Fluessigkeitsersatz rund um Belastung. Daraus wurde keine geschlechtsspezifische ml/kg-Formel gebaut.

`[annahme]` Geschlecht fliesst V1 nicht in die Formel ein. Es gibt geschlechtsspezifische Gesamt-AI-Werte, aber keine im Repo belegte, mehrfach wiederholte kg-Formel, die sauber neben Aktivitaets-, Klima- und Trainingsfaktor passt. Wenn Tom spaeter NASEM/IOM-AI statt kg-Formel als Zielmodell will, ist das eine eigene Entscheidung.

## Was noch auf 1,0 steht

`[cmd]` `climate_factor` existiert in `target_source`, steht aber fest auf `1.0000`. Es gibt kein Profilfeld dafuer.

`[read]` Entscheidung Tom, 2026-08-16: Klima gehoert an den Ort des Trainings, nicht an den Wohnort. Ein Studio in Bangkok kann klimatisiert sein, ein Lauf draussen nicht. Der Faktor wird erst sinnvoll, wenn Gym-/Ort-/Sessiondaten vorhanden sind.

`[cmd]` `training_bonus_ml` existiert in `target_source`, steht aber fest auf `0 ml`.

`[read]` Entscheidung Tom, 2026-08-16: Trainingseinheiten werden spaeter bekannt sein; bis dahin wird kein Bonus geraten. Das Training-Schema hat Uebungen, aber noch keine Sessions.

`[cmd]` Schwangerschaft und Stillzeit sind nicht neutral, wenn die Zeitraeume im Profil den abgefragten Tag einschliessen: Schwangerschaft addiert 300 ml, Stillzeit 1.100 ml. Beide Werte sind Zuschlaege, keine Profil-Defaults.

## Testdaten

`[cmd]` `testdaten-einspielen.ts` legt jetzt 212 `water_logs` zusaetzlich zu 3 Nutzern, 512 Mahlzeiten und 1.560 Positionen an.

`[cmd]` Der Registerfall `Tom Miller, 2026-08-16` zeigt den Vorlagenzustand nach der Faktorformel: `logged_ml 250`, `food_ml 1242.7445`, `total_ml 1492.7445`, `target_ml 3400`, `progress_pct 43.9`, `glasses_total 5`, `glasses_target 14`, `avg_14d_total_ml 2728.1`, `behind_14d_avg_pct 45.3`.

`[cmd]` `testdaten-pruefen.ts` meldet gruen: 512 Mahlzeiten, 1.560 Positionen, 212 Wassereintraege, 128 `daily_summary`-Zeilen und 47 Zeilen aus `daily_reference_assessment` fuer den Referenztag.

## Zeilenschutz

`[cmd]` Als Rolle `authenticated` mit Toms JWT-Sub sieht Tom 85 eigene Wasserzeilen und 0 Wasserzeilen von Max.

`[cmd]` Ein eigener Test-Insert in `nutrition.water_logs` ist in einer Rollback-Transaktion sichtbar. Ein Insert fuer Max mit Toms JWT-Sub scheitert mit `new row violates row-level security policy for table "water_logs"`.

## Was fehlt

`[annahme]` Die Oberflaeche muss die Funktion aufrufen und den Quick-Add-Button als Insert in `water_logs` verdrahten. Dieser Auftrag baut keine UI.

`[annahme]` Es gibt noch kein historisiertes Wasserziel. Wenn Tom spaeter pro Nutzer oder Zeitraum 2,5 L statt 3,0 L setzen will, braucht `goals.nutrition_targets` oder ein eigenes Zielmodell eine Wasserziel-Spalte.

`[read]` Lebensmittelwasser wird aus `meal_items.water_g` berechnet. Wenn dort Werte fehlen, zeigt `food_ml_missing` die Luecke; `total_complete` bleibt die Warnung, dass die Summe eine Untergrenze sein kann.
