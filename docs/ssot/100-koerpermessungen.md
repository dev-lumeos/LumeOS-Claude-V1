# GO-10: Koerpermessungen und Gewichtsverlauf

Stand: 2026-08-17

## Ergebnis

[cmd] Neuer Kettenschritt: `supabase/_pipeline/11_goals/112_body_measurements.sql`.

[cmd] Der Schritt erzeugt zwei Nutzerdaten-Tabellen im Schema `goals`:

| Tabelle | Zweck | Zeilenschutz |
|---|---|---|
| `goals.body_measurements` | Gewicht, optional Koerperfett, Hoehen-Snapshot, abgeleitete Werte | eigene Zeilen |
| `goals.body_circumferences` | 13 Koerperumfaenge | eigene Zeilen |

[cmd] Kettensteuerung und README stimmen: `kette-readme-pruefen.ts` meldet `README/Kette: ok (53 Schritte dokumentiert)`.

[cmd] Kompletter Kettenlauf in der Wegwerf-Datenbank `lumeos_kette_20260817091717`: Exit 0, Abschlusspruefung gruen, Wegwerf-Datenbank geloescht. Der Lauf dauerte 56,1 Sekunden und legte vorher `backup/schema/20260817091717_c43_vor_kettenlauf.sql` an.

[cmd] Live eingespielt: `112_body_measurements.sql` meldete `112_body_measurements ok: 2 Tabellen, 8 Policies, RLS aktiv.`

[cmd] `schema-vollstaendigkeit-pruefen.ts`: Exit 0. Relevante Zeilen: Tabellen 22/22, Funktionen 20/20, Zeilenschutz 22/22, Policies 22/22, GRANTs 24/24, Fremde Tabellen 14/14, Fremde Funktionen 14/14.

## Welche der beiden `body_measurements` gilt

[cmd] `referenz/lumeos-2026/supabase/migrations/016_create_goals_tables.sql` ist die fruehere Fassung. Sie trennt `body_measurements` und `body_circumferences`, fuehrt aber auch Foto-Tabellen.

[cmd] `referenz/lumeos-2026/supabase/migrations/037_body_measurements.sql` ist nach Nummer die spaetere Fassung. Sie legt eine zweite `body_measurements`-Form an, mit Gewicht, Koerperfett und Umfangsfeldern in einer Tabelle, sowie `USING (true)`-Development-RLS.

[read] `docs/specs/Goals/DATABASE.md` beschreibt Gewicht/Koerperfett und Umfaenge als getrennte Tabellen. Die Spec nennt 13 Umfangsfelder und Fotos getrennt.

[annahme] Fachlich traegt die Trennung aus `016` und der Spec besser fuer dieses Repo: Gewicht kann taeglich kommen, Umfaenge eher woechentlich. Die spaetere `037` wurde nicht direkt uebernommen, weil sie die Messarten zusammenzieht und eine Development-Policy enthaelt.

## Wie Profilgewicht und Verlauf zusammenhaengen

[cmd] `public.profiles.body_weight_kg` existiert seit GO-01 als aktueller Profilwert. `goals.body_measurements` ist der Verlauf.

[cmd] Der neue Trigger aktualisiert `public.profiles.body_weight_kg` aus dem neuesten Messpunkt nach `measurement_date`, `measurement_time`, `created_at`, `id`. Damit gibt es fuer den aktuellen Wert keine zweite Wahrheit.

[cmd] Testdaten-Nachweis: Tom hat 43 Messpunkte vom 2026-08-02 bis 2026-09-13, min. 83,64 kg, max. 85,07 kg. Das Profilgewicht steht nach dem Einspielen auf 85,000 kg und der neueste Messpunkt auf 85,00 kg.

[cmd] Ein eigener Insert als `authenticated` mit Toms JWT-Kontext wurde akzeptiert und per `ROLLBACK` verworfen; eine Einfuegung fuer Max mit Toms JWT-Kontext scheiterte mit `new row violates row-level security policy`.

[annahme] Wenn ein Nutzer alle Messpunkte loescht, bleibt ein eventuell vorhandenes Profilgewicht stehen. Das ist absichtlich konservativ: ein Onboarding-Gewicht darf nicht automatisch verschwinden, nur weil der Verlauf leer ist.

## Welche Umfaenge gebaut sind

[cmd] Die Spec nennt 13 Umfaenge: Nacken, Schultern, Brust, linker/rechter Oberarm, linker/rechter Unterarm, Taille, Huefte, linker/rechter Oberschenkel, linke/rechte Wade.

[cmd] Die Designvorlage zeigt 12 Zeilen: Nacken, Brust, Schultern, Taille, Huefte, Arm rechts/links, Unterarm, Oberschenkel rechts/links, Wade rechts/links. Der Unterarm ist dort nicht seitengetrennt.

[annahme] Gebaut wurde die vollstaendige 13er-Liste aus der Spec. Die Designvorlage kann spaeter beide Unterarmseiten zusammenfassen; die Daten behalten die genauere Form.

## Welche Koerperfettformeln danebenliegen

[cmd] `referenz/lumeos-2026/src/modules/goals/lib/goal-measurements.ts` fuehrt Measurement-Profile und verweist auf KPIs wie `waist_hip_ratio`, `shoulder_waist_ratio`, `weight_delta_7d`, `muscle_retention_pct`, `body_fat_latest`, `ai_conditioning`.

[cmd] Die Vorgabe meldete 51 Fundstellen zu Koerperfett im Vorgaengerrepo, unter anderem Jackson-Pollock, Durnin, Navy und FFMI.

[read] Diese Formeln wurden nicht gebaut. Der Auftrag schliesst Koerperfettformeln ausdruecklich aus; welche Methode gilt, ist Toms Entscheidung.

[cmd] Gebaut sind nur abgeleitete Werte aus bereits erfassten Messwerten: `lean_mass_kg`, `fat_mass_kg`, `bmi`, `ffmi`. Es wird kein Koerperfettwert aus Umfaengen berechnet.

## Testdaten

[cmd] `_testdaten/testdaten-einspielen.ts` legt jetzt zusaetzlich 43 Koerpermessungen und 7 Umfangsmessungen fuer Tom an.

[cmd] `_testdaten/testdaten-register.json` enthaelt den neuen Fall `Gewichtsverlauf und Koerperumfaenge`.

[cmd] `testdaten-pruefen.ts`: Exit 0. Relevante Zeilen: `Koerpermessungen/Umfaenge: 43/7`, `OK: C-82 Testdaten stimmen.`

[cmd] Die Pruefung belegt, dass der Verlauf vom 2026-08-02 bis 2026-09-13 reicht, einen sichtbaren Trend hat, das Profilgewicht dem neuesten Messpunkt entspricht, der Hoehen-Snapshot gesetzt ist und die letzte Umfangsmessung alle 13 Felder fuehrt.

## Was nicht gebaut wurde

[read] Fotosessions und Fotos stehen im Umsetzungsplan unter "Was nicht gebaut wird" und wurden nicht uebernommen.

[read] Koerperfettformeln wurden nicht umgesetzt.

[annahme] Messungen sind Zeitpunkte, keine Gueltigkeitszeitraeume. Die `gueltig_ab`-Regel aus Zielwerten und Phasen gilt hier deshalb nicht: ein Messpunkt vor dem ersten Datum bleibt ein historischer Messpunkt, nicht eine Phase, die einen Zeitraum oeffnet.

[cmd] Keine Oberflaeche wurde geaendert.

## Validierung

[cmd] `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts`: Exit 0.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`: Exit 0.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/kette-readme-pruefen.ts`: Exit 0.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts`: Exit 0.

[cmd] `pnpm exec tsc --noEmit --pretty false`: Exit 1 wegen bestehender Root-TS-Konfiguration ohne JSX fuer `packages/ui`; die Fehler liegen in `packages/ui/src/*.tsx` und nicht in den GO-10-Dateien.

[cmd] `pnpm gate`: Exit 0. Turbo meldete 8/8 Tasks erfolgreich; Encoding und i18n liefen davor durch.

[cmd] `git diff --cached --name-only`: keine Ausgabe, also nichts gestaged.
