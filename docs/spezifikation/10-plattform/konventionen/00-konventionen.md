---
status:     entwurf
version:    0.2
stand:      2026-08-12
ankerhash:  0b0c5da
quellen:    docs/ssot/ (Ist-Zustand); Erfahrungen 2026-08-01/02;
            Kettenschritte 052/053/060/061/062 und D-05 (§12)
abhaengig:  keine
---

# Plattform: Konventionen

Regeln, die überall gelten und deshalb nirgends wiederholt werden.

## 1. Sprache

Dokumentation auf Deutsch. Code, Bezeichner, Datenbankobjekte, Commit-Meldungen
auf Englisch. Nutzeroberfläche mehrsprachig — Deutsch, Englisch, Thai; das
Datenmodell führt Sprachvarianten als Spalten (`name_de`, `name_en`, `name_th`).

## 2. Dateien und Kodierung

UTF-8 ohne BOM. Ausnahme: PowerShell-Skripte mit Zeichen ausserhalb ASCII
brauchen ein BOM, sonst liest PowerShell 5.1 sie als ANSI und das
String-Quoting zerbricht.

Keine Emoji in ausführbaren Dateien. `[cmd]` Ein Hook im Repo hat monatelang
nicht geparst, weil zwei Emoji ausserhalb der BMP darin standen.

**Bei Verdacht auf beschädigte Zeichen entscheidet der Hex-Dump, nie die
Konsolenausgabe.** `[cmd]` Zweimal wurde korrektes UTF-8 fälschlich als
Schaden gemeldet, weil die Konsole in falscher Codepage lief.

## 3. Markdown

Vollständig schreiben, nie zeilenweise ändern — Teil-Edits zerstören Tabellen.

**Vor dem Schreiben die Datei einlesen.** `[cmd]` Eine aus dem Gedächtnis
rekonstruierte Datei fiel auf einen älteren Stand zurück und verlor vier
Abschnitte; gefunden wurde es nur durch Zählen der Einträge.

## 4. Herkunftsmarker

In `docs/ssot/` trägt jede Tatsachenbehauptung `[cmd]`, `[read]` oder
`[annahme]`. In `docs/spezifikation/` gilt das für Aussagen über den
Ist-Zustand; das Soll braucht keinen Marker.

Zusammenfassungen von Teilagenten sind kein Beleg. Was nicht selbst
ausgeführt oder gelesen wurde, ist `[annahme]`.

## 5. Benennung in der Datenbank

Kleinschreibung mit Unterstrich. Tabellen im Plural (`foods`,
`food_nutrients`), Spalten im Singular. Zeitstempel `created_at`,
`updated_at` mit Zeitzone. Schlüssel `id` als UUID.

Ein Schema je Fachbereich. Objekte immer qualifiziert ansprechen —
`nutrition.foods`, nie `foods`.

`[cmd]` Nährstoffcodes folgen dem BLS-Katalog in Grossschreibung
(`PROT625`, `ENERCC`) und sind keine Ausnahme von der Regel, sondern
Fremdschlüssel in eine externe Systematik.

## 6. Fehler und Status

Fehler tragen einen stabilen Code, eine Meldung für Menschen und optional
Details. Der Code ist Vertrag und ändert sich nicht; die Meldung darf sich
ändern und ist übersetzbar.

Keine internen Ausnahmetexte nach aussen. Keine Personendaten in
Protokollen — weder Namen noch E-Mail-Adressen noch Rohdatenzeilen.

## 7. Zeit, Zahlen, Einheiten

Zeitstempel in UTC speichern, in der Zeitzone der Nutzerin anzeigen. Datum
ohne Zeit nur, wo die Zeit fachlich keine Rolle spielt — ein Tagebucheintrag
gehört zu einem Kalendertag, nicht zu einem Zeitpunkt.

Nährwerte je 100 g, wie im BLS. Umrechnung auf Portionen geschieht bei der
Anzeige, nicht bei der Speicherung. Einheiten sind Anzeigeeinstellung, nie
Speicherformat.

## 8. Ports

Feste Bereiche, damit sieben Apps und neun Services nebeneinander laufen.

| Bereich | Vergabe |
|---|---|
| 3200–3290 | Apps, Zehnerabstand je App |
| 5100–5900 | Services, Hunderterabstand je Modul |
| 54321–54327 | Supabase lokal, von der CLI vergeben |

| App | Port |
|---|---|
| `web` | 3200 |
| `admin` | 3210 |
| `buddy` | 3220 |
| `coach` | 3230 |
| `marketplace` | 3240 |
| `gym` | 3250 |
| `supplier` | 3260 |

Der Zehnerabstand lässt Raum für Nebenprozesse je App (Storybook, Mock-Server).

**Warum nicht 3000 und nicht 3100:** `[cmd]` 3100 und 3180 sind von einer
Docker/WSL-Portweiterleitung belegt, 3000 von einer fremden Anwendung.

**Warum nicht der Standardport:** `[cmd]` Der Next.js-Standardport ist auf Toms Rechner von
einer fremden Anwendung belegt. Ein Standardport ist keine Vergabe — jede App
trägt ihren Port ausdrücklich in `package.json` (`next dev -p`).

`[read]` Die Service-Ports stammen aus den Altbestand-Specs: Nutrition 5100,
Training 5200, Supplements 5300, Recovery 5400, Buddy 5500, HumanCoach 5600,
Marketplace 5700, Medical 5800, Goals 5900. Sie gelten nur, falls die
Servicelayer-Entscheidung (TODO A-07) für Services ausfällt.

`[cmd]` Der Altbestand nennt für Admin den Port 4100 — fällt aus jedem Schema
und wird durch 3210 ersetzt.

---

## 9. Git

Ein logischer Change je Commit. Meldungen englisch, im Format
`typ(bereich): was` — `feat`, `fix`, `docs`, `chore`, `refactor`.

Nie ohne ausdrückliche Anweisung pushen. Commit-Hashes dienen als Anker
zwischen Sitzungen und gehören in Sitzungsberichte.

**Kein untracked Verzeichnis wird dem Namen nach gelöscht.** `[cmd]` Ein als
Müll geführter Ordner enthielt die einzige Quelle von 705.232 Datenzeilen.
Vor jeder Löschung inhaltliche Prüfung.

## 10. Arbeitsteilung zwischen Agenten

Eine Datei hat zu einem Zeitpunkt einen Zuständigen. Wer eine Aufgabe
delegiert, gibt die Datei ab — und liest sie neu ein, bevor er sie wieder
anfasst.

Paralleles Schreiben braucht getrennte Arbeitsbäume oder getrennte Pfade.
Die Berechtigungsschicht von Claude Code prüft einzelne Aufrufe, nicht
Gleichzeitigkeit.

Berichte über getane Arbeit werden geprüft, nicht geglaubt. Die Prüfung ist
ein Zähllauf über nachweisbare Merkmale — Anzahl Einträge, Zeilenzahlen,
Hashes — nicht das Lesen der Zusammenfassung.

## 11. Änderungen an der Datenbank

Nie gegen die laufende Datenbank testen. Jeder Versuch in einer
Wegwerf-Datenbank, danach verwerfen.

Vor jeder strukturellen Änderung eine Sicherung. Eine Sicherung, die nie
zurückgespielt wurde, ist eine Datei und kein Backup.

`[cmd]` `pg_restore` meldet fehlende Policies nur als Warnung und gilt
trotzdem als erfolgreich — der Vergleich nach dem Zurückspielen ist Pflicht.

## 12. Zeilenschutz, Policies und Rechte

Diese Regeln stehen hier, weil jede einzelne aus einem Fehler stammt, der
schon passiert ist. Sie sind nicht Geschmack, sondern Narben.

### 12.1 Policies je Operation — kein `FOR ALL`

Für jede Tabelle je eine Policy für `select`, `insert`, `update`, `delete`.
Lesende Policies tragen `USING`, schreibende `WITH CHECK`.

**Warum `FOR ALL` verboten ist:** Beim `INSERT` gibt es keine alte Zeile,
also wertet Postgres `USING` nicht aus — dafür ist `WITH CHECK` da. Eine
Policy wie

```sql
-- FALSCH: liest sich als "nur der Eigentümer", erlaubt aber jedem
-- Authentifizierten das Einfügen mit fremder user_id.
CREATE POLICY "x_owner" ON schema.tabelle FOR ALL
  USING (auth.uid()::text = user_id::text);
```

deckt `INSERT` formal mit ab, prüft dort aber nichts. Sie **liest** sich als
Eigentümerschutz und **wirkt** beim Einfügen gar nicht.

`[cmd]` Im Altbestand `docs/specs/` stehen **17 solche Policies in sechs
Dateien** (BuddyandAICoach 8, Marketplace 3, HumanCoach 2, Admin 1,
Nutrition `03_sql` 1, Nutrition `05_reviews` 2) — **keine einzige** mit
`WITH CHECK`. Diese Dateien tragen seit 2026-08-12 einen Warnhinweis; sie
sind Altbestand und **keine Vorlage**.

Richtig ist die Trennung:

```sql
CREATE POLICY "x_select" ON schema.tabelle FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "x_insert" ON schema.tabelle FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "x_update" ON schema.tabelle FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "x_delete" ON schema.tabelle FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

`UPDATE` braucht beides: `USING` entscheidet, welche Zeile geändert werden
darf, `WITH CHECK`, wie sie danach aussehen darf. Ohne `WITH CHECK` kann
eine eigene Zeile auf eine fremde `user_id` umgeschrieben werden.

### 12.2 Kein `::text`-Cast auf UUID

`auth.uid()` liefert `uuid`, `user_id` ist `uuid` — direkt vergleichen.
Der Cast `auth.uid()::text = user_id::text` erzwingt einen Textvergleich und
verhindert die Indexnutzung auf jeder Zeile. Er steht im Altbestand
durchgehend neben dem `FOR ALL` und wird nicht übernommen.

### 12.3 Die Grant-Falle: erst Recht, dann Zeilenschutz

**Ein Recht, das nicht erteilt ist, kann keine Policy zurückholen.**
PostgREST und Postgres prüfen das Tabellenrecht **vor** RLS. Wer
`GRANT SELECT` erteilt in der Absicht „schreiben darf nur der Admin",
bekommt `permission denied` — **auch für den Admin**, dessen Policies dann
toter Text sind.

`[cmd]` Genau das ist beim Trainings-Schema passiert: erst stand dort nur
`GRANT SELECT`, die Admin-Schreibpolicies liefen ins Leere. Derselbe
Gedanke steht als bewusste Ergänzung in
`supabase/_pipeline/06_zugriff/060_zugriffsschicht.sql` §3c: *„die Policies
unter 4b wären ohne Tabellenrechte toter Text (PostgREST: erst Grant, dann
RLS)"*.

Regel: **DML-Recht erteilen, Eingrenzung über Policies.** Das Recht sagt
*ob überhaupt*, die Policy sagt *welche Zeilen*. Wer die Eingrenzung ins
Recht legt, verliert die Policy-Ebene.

### 12.4 Sichten: `security_invoker = true` ist Pflicht

Eine Sicht läuft standardmässig mit den Rechten ihrer Eigentümerin. **Die
RLS der darunterliegenden Tabellen greift dann nicht** — die Sicht zeigt
allen alles.

```sql
CREATE OR REPLACE VIEW schema.sicht
WITH (security_invoker = true) AS SELECT ...
```

`[cmd]` Ohne diese Angabe sah der zweite Nutzer beim Diary zwei Zeilen des
ersten. Belegt und behoben in
`supabase/_pipeline/05_user_tabellen/053_daily_summary.sql`, nachgewiesen in
`v053` mit zwei echten Sessions.

### 12.5 Reihenfolge: Rechteprüfung **vor** dem Datenzugriff

`[cmd]` Seit `061_rollen_admin.sql` **filtert** RLS, statt zu sperren. Ein
Nicht-Admin, der eine Admin-Ansicht öffnet, bekommt sonst **stillschweigend
leere Listen statt einer Absage** — er hält das Werkzeug für kaputt statt
für gesperrt, und niemand erfährt vom Zugriffsversuch.

Deshalb: `is_admin()` prüfen und abweisen, **bevor** Daten geladen werden.
Der Zeilenschutz ist die zweite Verteidigungslinie, nicht die erste.

### 12.6 Wie geprüft wird

**Eine Policy zu lesen ist kein Nachweis.** Nachgewiesen wird mit **zwei
echten Sessions** — je ein Nutzer, der darf, und einer, der nicht darf —
gegen eine Wegwerf-Datenbank (§11).

Die wiederholbare Rechteprüfung liegt in
`supabase/_pipeline/_validierung/zugriffsrechte-pruefen.mjs` (B-22). Sie
zieht ihre Objektliste `[cmd]` **nicht** aus PostgREST, sondern aus
`062_pruef_objektliste.sql` — eine entzogene Berechtigung liess die Tabelle
sonst aus der Beschreibung *verschwinden*, und die Prüfung meldete Erfolg,
weil sie nichts mehr fand. **Ein Prüfwerkzeug, das seine Zielliste vom
Prüfling bezieht, prüft nichts.**

## 13. Abnahmekriterien

- **AK-1:** Gegeben eine beliebige Datei im Repo, dann ist sie UTF-8 ohne
  BOM, ausser sie ist ein PowerShell-Skript mit Zeichen ausserhalb ASCII.
- **AK-2:** Gegeben eine Aussage über den Ist-Zustand in `docs/ssot/`, dann
  trägt sie einen Herkunftsmarker.
- **AK-3:** Gegeben ein Fehler verlässt das System, dann enthält er keine
  Personendaten und keinen internen Ausnahmetext.
- **AK-4:** Gegeben ein Zeitstempel in der Datenbank, dann ist er in UTC und
  trägt eine Zeitzone.
- **AK-5:** Gegeben eine Tabelle mit Zeilenschutz, dann trägt sie Policies je
  Operation und keine `FOR ALL`-Policy, und jede schreibende Policy trägt
  `WITH CHECK`.
- **AK-6:** Gegeben eine Sicht auf Tabellen mit Zeilenschutz, dann ist sie mit
  `security_invoker = true` angelegt.

## 14. Offene Fragen

1. **Fehlercodes** — gemeinsamer Katalog über alle Module oder Präfix je
   Modul? Ein Katalog erzwingt Abstimmung, Präfixe erlauben Wildwuchs.
2. **Übersetzungen** — Spalten je Sprache skalieren nicht über drei Sprachen
   hinaus. Ab wann eine eigene Übersetzungstabelle?
3. **Protokollierung** — Format, Ablageort, Aufbewahrungsdauer. Offen, bis
   `10-plattform/ci-cd` steht.
