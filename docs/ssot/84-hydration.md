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

`[cmd]` Toms Testprofil hat 85 kg. `85 * 35 ml = 2.975 ml`, also die 3,0 L aus der Designvorlage gerundet.

`[read]` Die alte ADR nennt als Zielquelle `nutrition_targets.water_target`. Das aktuelle Goals-Schema fuehrt diese Spalte nicht. Deshalb wurde kein neues Goals-Ziel erfunden, sondern fuer V1 ein berechneter Lesewert aus dem Profil verwendet. Ein historisiertes, manuell aenderbares Wasserziel gehoert spaeter nach Goals.

## Testdaten

`[cmd]` `testdaten-einspielen.ts` legt jetzt 212 `water_logs` zusaetzlich zu 3 Nutzern, 512 Mahlzeiten und 1.560 Positionen an.

`[cmd]` Der Registerfall `Tom Miller, 2026-08-16` zeigt den Vorlagenzustand: `logged_ml 250`, `food_ml 1242.7445`, `total_ml 1492.7445`, `target_ml 2975`, `progress_pct 50.2`, `glasses_total 5`, `glasses_target 12`, `avg_14d_total_ml 2728.1`, `behind_14d_avg_pct 45.3`.

`[cmd]` `testdaten-pruefen.ts` meldet gruen: 512 Mahlzeiten, 1.560 Positionen, 212 Wassereintraege, 128 `daily_summary`-Zeilen und 47 Zeilen aus `daily_reference_assessment` fuer den Referenztag.

## Zeilenschutz

`[cmd]` Als Rolle `authenticated` mit Toms JWT-Sub sieht Tom 85 eigene Wasserzeilen und 0 Wasserzeilen von Max.

`[cmd]` Ein eigener Test-Insert in `nutrition.water_logs` ist in einer Rollback-Transaktion sichtbar. Ein Insert fuer Max mit Toms JWT-Sub scheitert mit `new row violates row-level security policy for table "water_logs"`.

## Was fehlt

`[annahme]` Die Oberflaeche muss die Funktion aufrufen und den Quick-Add-Button als Insert in `water_logs` verdrahten. Dieser Auftrag baut keine UI.

`[annahme]` Es gibt noch kein historisiertes Wasserziel. Wenn Tom spaeter pro Nutzer oder Zeitraum 2,5 L statt 3,0 L setzen will, braucht `goals.nutrition_targets` oder ein eigenes Zielmodell eine Wasserziel-Spalte.

`[read]` Lebensmittelwasser wird aus `meal_items.water_g` berechnet. Wenn dort Werte fehlen, zeigt `food_ml_missing` die Luecke; `total_complete` bleibt die Warnung, dass die Summe eine Untergrenze sein kann.
