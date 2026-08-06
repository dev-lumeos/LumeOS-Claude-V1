---
status:     angenommen
stand:      2026-08-06
ankerhash:  7fc5785
betrifft:   30-module/nutrition, 10-plattform/architektur
---

# ADR-0002: Tabellendesign der Nutrition-Preferences

## Kontext

`[read]` Die alte ADR-Liste (`docs/_archive/ist-zustand/04-adr-liste.md`,
Zeile 10) führt ADR-002 als offen und blockierend für „WP-01 Schritt 1“ —
den Preferences-Schreibpfad. Zur Wahl standen das Set-Design aus SPEC_06
(zwei Tabellen: Profil plus Positionsliste) und eine schlanke
Single-Row-Tabelle je Nutzerin.

Der Punkt blieb formal offen, **während er gebaut wurde.** C-02 (M3,
2026-08-04) hat den Schreibpfad umgesetzt; das Design lag danach nur noch
in der Datenbank und im Pipeline-Schritt, nicht als Entscheidung. Genau
diese Lage beschreibt `docs/ssot/30-datenbank.md` unter „Offene Punkte“
Nummer 3: „Das Design von `food_preferences` und `food_preference_items`
existiert nur in der Datenbank.“

Diese ADR dokumentiert nach. Sie trifft keine neue Entscheidung.

## Optionen

**A — Set-Design nach SPEC_06 (zwei Tabellen)**
`food_preferences` trägt das Profil je Nutzerin (Kostform, Allergien,
Mahlzeitenrhythmus, Budget). `food_preference_items` trägt je Zeile genau
eine Zuneigung oder Abneigung gegen genau ein Ziel.
*Dafür:* Eine Position ist eine Zeile — zählbar, einzeln löschbar, einzeln
begründbar. Sechs Zieltypen (Lebensmittel, Kategorie, Tag, Küche,
Ausschlussvorlage, Katalogeintrag) passen ohne Schemaänderung.
Fremdschlüssel greifen je Zieltyp.
*Dagegen:* Zwei Tabellen, zwei Policies, ein Join für die Gesamtansicht.

**B — Schlanke Single-Row-Tabelle**
Eine Zeile je Nutzerin, Listen als Array- oder JSON-Spalten.
*Dafür:* Ein Lesezugriff ohne Join, weniger Schemafläche.
*Dagegen:* Keine Fremdschlüssel auf Lebensmittel, Kategorien oder Tags —
gelöschte Ziele hinterlassen tote Einträge. Kein Duplikatschutz auf
Datenbankebene. Eine einzelne Position lässt sich nicht ohne
Lese-Ändere-Schreibe-Zyklus entfernen, was bei gleichzeitigen Zugriffen
verliert.

## Entscheidung

Gewählt: **A — Set-Design nach SPEC_06.** Materiell entschieden mit C-02
am 2026-08-04, hier nachdokumentiert am 2026-08-06.

`[cmd]` Live belegt (2026-08-06, lokale Instanz):
- Schema `nutrition` enthält beide Tabellen unter den 11 Tabellen.
- `food_preferences` hat `user_id` als Primärschlüssel — also genau ein
  Profil je Nutzerin. Die Profilfelder liegen als Spalten mit
  CHECK-Beschränkungen vor, die Listenfelder (`allergies`,
  `intolerances`, `general_exclusions`, `preferred_cuisines`) als
  Textarrays.
- `food_preference_items` trägt je Zeile genau ein Ziel. Der CHECK
  `food_preference_items_exactly_one_target` erzwingt das arithmetisch:
  die Summe der gesetzten Zielfelder muss 1 sein.
- Beide Tabellen haben Zeilenschutz und **je vier Policies**, eine je
  Operation (SELECT, INSERT, UPDATE, DELETE).

Quelle des Aufbaus: `supabase/_pipeline/05_user_tabellen/050_preferences_foundation.sql`,
Rechte und Policies aus `supabase/_pipeline/06_zugriff/060_zugriffsschicht.sql`.

## Begründung

Der Ausschlag kam nicht aus der Theorie, sondern aus dem Schreibpfad.

**Die Positionsliste braucht Identität je Zeile.** Ein Ausschluss lässt
sich nur dann gezielt zurücknehmen, wenn er eine eigene Zeile mit eigener
ID ist. Bei Variante B wäre jedes Umschalten ein Schreiben des gesamten
Arrays — zwei gleichzeitige Umschaltungen überschreiben einander still.

**Der Duplikatschutz ist nur auf Zeilenebene möglich.** `[cmd]` Der
partielle eindeutige Index `uq_food_pref_items_user_food`
(`WHERE food_id IS NOT NULL`) macht genau eine Zeile je Nutzerin und
Lebensmittel möglich und verwandelt die Select-vor-Insert-Wettlaufsituation
im Anwendungscode in einen sauberen Fehler 23505 → HTTP 409. In einer
Array-Spalte gibt es diesen Schutz nicht.

**`preference` gehört bewusst nicht in den Schlüssel.** Favorit und
Ausschluss sind keine getrennten Zeilen, sondern Zustände derselben Zeile;
eine Umstufung ist ein UPDATE. Zwei Zeilen je Lebensmittel wären ein
widersprüchlicher Zustand.

**Der CHECK macht die künftigen Indizes trennscharf.** Weil je Zeile genau
ein Zielfeld gesetzt ist, fällt jede Zeile in genau einen partiellen Index;
Überlappung ist konstruktiv ausgeschlossen. Das ist die tragende Begründung
für C-12 (die fünf übrigen Zieltypen).

## Folgen

- Der Preferences-Schreibpfad steht (C-02, `[cmd]` Abnahme 2026-08-04:
  Favorit gewichtet ein Lebensmittel von Platz 11 auf 1, Ausschluss
  entfernt es aus der Trefferliste, Zustand überlebt einen
  Containerneustart, Zeilenschutz gegen eine zweite echte Sitzung dicht).
- **Offen bleibt C-12:** Für `category`, `tag`, `cuisine`,
  `exclusion_preset` und `catalog_item` fehlen die analogen partiellen
  eindeutigen Indizes. Sie gehören jeweils **vor** den zugehörigen
  Schreibpfad, konkret vor den Preset-/Profil-Schreibpfad in Settings.
- Die Profilfelder in `food_preferences` haben noch keinen Schreibpfad —
  geschrieben wird bisher nur die Positionsliste.
- Neue Zieltypen kosten einen CHECK-Eintrag und einen partiellen Index,
  keine Schemaumstellung.

## Was diese Entscheidung umstossen würde

- Die Positionsliste wächst je Nutzerin so weit, dass der Join teurer wird
  als der Nutzen der Einzelzeilen. `[annahme]` Bei realistischer Nutzung
  (Dutzende bis Hunderte Positionen) ist das nicht absehbar.
- Ein Zieltyp verlangt mehr als ein Ziel je Zeile — dann bricht der CHECK
  `exactly_one_target` und das Modell müsste neu geschnitten werden.

## Offen

Nichts an dieser Entscheidung. Der Folgepunkt C-12 ist Ausführung, keine
offene Frage — die Begründung dafür steht oben unter „Folgen“.
