# Profil und Bewertung der Tagesbilanz

Stand: 2026-08-15. Anlass: C-47.

`[cmd]` Gebaut wurden zwei getrennte Änderungen: Profilachsen in
`public.profiles` und die Funktion
`nutrition.daily_reference_assessment(user_id, date)`. Es wurde keine
Oberfläche, kein Tages-Score, keine Ampel und keine `micro_flags` gebaut.

---

## Profil

`[cmd]` Schritt `090_profile.sql` ergänzt `public.profiles` um die Achsen,
die Referenzwerte und spätere Makroziele brauchen:

| Feld | Zweck |
|---|---|
| `birth_date` | Alter wird zum Abfragetag berechnet |
| `biological_sex` | Referenzwert-Achse, `male` oder `female` |
| `height_cm`, `body_weight_kg` | spätere Makro-/TDEE-Berechnung |
| `activity_level`, `nutrition_goal` | spätere Makro-Zielrichtung |
| `pregnancy_started_on`, `pregnancy_ended_on` | Schwangerschaft als Zeitraum |
| `lactation_started_on`, `lactation_ended_on` | Stillzeit als Zeitraum |

`[read]` Entscheidung Tom, 2026-08-15: Geschlecht ist ein Feld mit zwei
Werten, biologisch, `male` / `female`. Kein drittes Profilfeld und keine
getrennte Identitätsangabe.

`[cmd]` Das passt zur Referenztabelle: `nutrient_reference_values.sex`
führt `male`, `female` und `both`. Der Testfall mit 8 mg Eisen liefert
für einen Mann 30 `72,7 %` gegen `PRI 11 mg`, für eine Frau 30 `50,0 %`
gegen `PRI 16 mg`.

`[read]` E-07 bleibt davon unberührt. Dort geht es um Trainingsmedien:
146 Übungen, bei denen ein `image_male_*`-Feld auf eine `_Female`-Datei
zeigt. Das ist eine Medienfrage, keine Profilfrage.

`[read]` Schwangerschaft und Stillzeit sind Zustände. Deshalb sind sie als
Zeiträume modelliert, nicht als Boolesche Dauereigenschaften. Die
Bewertung berechnet den Zustand zum abgefragten Tag.

`[cmd]` RLS und Policies bleiben im Muster der bestehenden Profiltabelle:
`authenticated` darf die eigene Zeile lesen, einfügen und ändern; löschen
ist weiterhin nicht gegrantet. Die neuen Felder sind nullable, damit der
Auth-Trigger Registrierungen nicht blockiert.

---

## Bewertung der Tagesbilanz

`[cmd]` Neuer Kettenschritt:
`supabase/_pipeline/05_user_tabellen/059_daily_reference_assessment.sql`.
Er läuft bewusst nach `090`, obwohl die Dateinummer `059` ist, weil die
Funktion die neuen Profilspalten liest.

Die Funktion verbindet:

- `nutrition.daily_summary`
- `public.profiles`
- `nutrition.nutrient_reference_values`
- `nutrition.nutrient_defs`

`[cmd]` Sie gibt je verfügbarem Tagesnährstoff den Tageswert, den
passenden Referenzwert, die Wertart, die Richtung und den Deckungsgrad
aus. Wenn mehrere Wertarten passen, etwa `PRI` und `UL`, gibt es mehrere
Zeilen. Dadurch bleibt sichtbar, dass ein `UL` eine Obergrenze ist und
kein Zielwert.

`[cmd]` Fehlzähler schlagen durch: Ein Test mit fehlendem Vitamin-A-Wert
lieferte für `VITA` `missing_count = 1`, `reference_status =
'incomplete'` und `reference_pct = NULL` für `PRI` und `UL`. Damit kann
eine unvollständige Summe nicht als vollständige Deckung erscheinen.

`[cmd]` `NO_REFERENCE` und `NO_STANDALONE_REFERENCE` werden als
`reference_direction = 'not_applicable'` geführt und erzeugen keinen
Prozentwert. Sie sind keine Null.

`[read]` `daily_summary` wurde nicht geändert. Die Bewertung liegt als
eigene Funktion daneben; die Summenlogik bleibt in `053`.

---

## Kettenlauf und Prüfungen

`[cmd]` Vor dem Wegwerf-Kettenlauf wurde eine Schema-Sicherung erzeugt:
`backup/schema/20260815074454_c43_vor_kettenlauf.sql`.

`[cmd]` `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts
--keep-database` lief auf `lumeos_kette_20260815074454` mit 40 Schritten
durch: `KETTE OK: 33.6s`.

`[cmd]` Die Abschlussprüfung meldete:

| Prüfung | Ergebnis |
|---|---:|
| Tabellen | 20/20 |
| Sichten | 2/2 |
| Funktionen | 15/15 |
| RLS | 20/20 |
| Policies | 20/20 |
| GRANTs | 22/22 |
| Fremdschlüssel | 16/16 |
| Ergebnis | `SCHEMA VOLLSTAENDIG` |

`[cmd]` `kette-readme-pruefen.ts` meldet:
`README/Kette: ok (40 Schritte dokumentiert)`.

`[cmd]` `kette.json` und `schema-sollstand.json` sind gültiges JSON.
`schema-sollstand.json` führt `daily_reference_assessment` als erwartete
Funktion aus Schritt `059`.

---

## Was das Profil noch nicht kann

`[cmd]` Es gibt keine Oberfläche, kein Formular und keinen App-Schreibpfad
für die neuen Profilfelder. Die Tabelle kann die Daten aufnehmen; Nutzer
können sie noch nicht pflegen.

`[read]` `nutrition_targets` bleibt laut Sollliste bewusst
`nicht_erwartet`, weil dieser Ziel-Cache zu Goals gehört. Die neuen Felder
reichen für spätere Makroberechnung, bauen aber noch keine Makroziele.

`[annahme]` Es wurde keine Feldverschlüsselung eingebaut. Ich habe im
aktuellen Auftrag keinen Produktpfad gefunden, der Profil-Gesundheitsdaten
automatisch verschlüsselt; geschützt sind sie über RLS, Policies und
enge Grants. Falls LumeOS dafür eine eigene Verschlüsselungsschicht will,
ist das ein separater Sicherheitsentscheid.

`[annahme]` Schwangerschaft und Stillzeit werden nur als Zeiträume
gespeichert und zum Stichtag ausgewertet. Es gibt noch keine Logik, die
Enddaten setzt, Konflikte verhindert oder Nutzer daran erinnert, den
Zustand zu aktualisieren.

`[read]` E-07 ist nicht gelöst. Das Profilfeld darf nicht als Antwort auf
die Medienfrage im Trainingsmodul verwendet werden.

---

## Was diese Zahlen nicht sagen

`[read]` Die Referenzwerte sind Zufuhrempfehlungen für gesunde Erwachsene,
keine Laborreferenzbereiche und keine medizinische Diagnose.

`[annahme]` Ein Kraftsportler im Aufbau, in Diät oder mit Krankheit kann
einen anderen Bedarf haben. EFSA beantwortet diese sport- oder
therapiebezogene Frage nicht. `100 %` Deckung heißt deshalb nicht
automatisch: genug für dich.

`[cmd]` Ein `AI` ist kein `PRI`, ein `UL` ist eine Obergrenze, und
`NO_REFERENCE` ist keine Null. Die Funktion führt diese Wertart mit,
statt sie in eine einzige Prozentzahl zu glätten.

`[cmd]` Ein Prozentwert wird nur ausgegeben, wenn der Tageswert vollständig
ist. Sobald ein `*_missing`-Zähler größer null ist, bleibt der
Deckungsgrad leer.

`[read]` SPEC_09 nennt einen Score und `micro_flags`; beides wurde hier
nicht gebaut. Eine Warnung wie "zu wenig Eisen" ist eine Produkt- und
Gesundheitsaussage und braucht einen eigenen Auftrag.

