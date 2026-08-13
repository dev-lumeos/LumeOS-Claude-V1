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

| App | Port | Domain (entschieden 2026-08-13) |
|---|---|---|
| `web` | 3200 | `web.lumeos.app` |
| `admin` | 3210 | `admin.lumeos.app` |
| `buddy` | 3220 | `buddy.lumeos.app` |
| `coach` | 3230 | `coach.lumeos.app` |
| `marketplace` | 3240 | `marketplace.lumeos.app` |
| `gym` | 3250 | `gym.lumeos.app` *(kommt später, `[read]` Tom 2026-08-13)* |
| `supplier` | 3260 | `supplier.lumeos.app` *(kommt später, `[read]` Tom 2026-08-13)* |

`www.lumeos.app` trägt die Landingpage und ist **keine App** — kein Port,
kein Verzeichnis unter `apps/`.

`[cmd]` 2026-08-13: `apps/mobile` und `apps/staff` existieren als Gerüste,
haben aber **weder Port noch Domain**. Wer sie baut, vergibt beides und
trägt es hier nach.

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

### 10.1 Zwei Werkzeuge im selben Arbeitsbaum (B-11)

Der Anlass ist real: Claude Code und Codex arbeiten in demselben Repo.
Die Konflikte entstehen dabei **nicht** in den Quelldateien — dort greift
die Regel oben — sondern in **generierten Zuständen**, die niemandem
gehören und die beide Werkzeuge beschreiben.

**Was geteilt ist** `[cmd]` 2026-08-13 erhoben:

| Zustand | Ort | getrennt? |
|---|---|---|
| Gate-Build | `apps/*/.next-gate` | **ja**, seit B-18 |
| Dev-Server-Build | `apps/*/.next` | nein — je App einer |
| Turbo-Cache | `.turbo/cache` | nein |
| Abhängigkeiten | `node_modules/` (Wurzel + je Paket) | nein |
| Datenbank | lokale Supabase-Instanz, ein Satz Ports | nein |
| Dev-Server | 3200 (`web`), 3210 (`admin`) | nein — je ein Prozess |

**Die Bruchstelle ist `.next/types/`.** `[cmd]` Beide `tsconfig.json`
listen `.next/types/**/*.ts` **und** `.next-gate/types/**/*.ts` im
`include`. Der Dev-Server schreibt dort für jede Route eine Typdatei —
also schreibt ein laufender Dev-Server in die Eingabemenge von `tsc`.
Zwei belegte Folgen:

1. `[cmd]` 2026-08-06 (B-18): Der Gate-Build räumte `.next` ab, während
   der Dev-Server dieselben Dateien fortschrieb; `tsc` brach mit TS6053
   ab, 3 von 5 Läufen rot. Behoben durch das eigene `.next-gate` **und**
   `dependsOn: ["^build", "build"]` bei `typecheck` — beide Teile
   zusammen, die Trennung allein genügte nicht.
2. `[cmd]` 2026-08-12 (Block 21): Nach dem Umzug der Kurationsseite blieb
   unter `apps/web/.next/types/app/api/nutrition/curation/route.ts` eine
   Typdatei für eine Route liegen, die es nicht mehr gab. Der Quellcode
   war sauber (`✓ Compiled successfully`), der Typcheck scheiterte
   trotzdem. Der laufende Dev-Server hatte sie erzeugt und räumte sie
   nicht ab.

**Regel — Betrieb, nicht Werkzeug:**

1. **Generierte Verzeichnisse gehören niemandem.** Wer `.next`, `.turbo`
   oder `node_modules` aufräumt, sagt es vorher an. Ein „leeres"
   Verzeichnis kann der Zwischenstand des anderen sein.
2. **Nach jedem Umzug oder jeder Löschung einer Route den Dev-Server
   dieser App neu starten.** Er räumt verwaiste Typdateien nicht ab.
   Symptom: Der Build kompiliert, der Typcheck findet ein Modul nicht,
   dessen Pfad es im Quellcode nicht mehr gibt.
3. **Ein Gate-Lauf, der ohne Quelländerung rot wird, ist zuerst ein
   Verdacht auf generierten Zustand** — nicht auf den eigenen Code.
   Gegenprobe: `LUMEOS_DIST_DIR=.next-probe npx next build` baut in ein
   frisches Verzeichnis. Kompiliert das sauber und scheitert nur der
   Typcheck, liegt es an `.next/types`.
4. **Die Datenbank ist einer.** Wegwerf-Datenbanken bekommen einen
   eigenen Namen (§11); wer die laufende Instanz anfasst, tut das mit
   Freigabe und sagt es an.
5. **Je Port ein Prozess.** Wer einen Dev-Server neu startet, den ein
   anderes Werkzeug gestartet hat, meldet es im Bericht.

**`git worktree` ist NICHT die Empfehlung — aus Preisgründen:**
`[cmd]` `node_modules` im Wurzelverzeichnis trägt **30.528 Dateien,
409 MB**; dazu kommen die je Paket. Ein zweiter Arbeitsbaum braucht einen
eigenen vollständigen `pnpm install` und pflegt ihn dauerhaft mit. Er
löst ausserdem **die tatsächliche Bruchstelle nicht**: `.next/types`
entsteht in *beiden* Bäumen neu, und die lokale Datenbank bliebe
trotzdem geteilt. Er hilft nur gegen gleichzeitiges Schreiben an
denselben Quelldateien — und dagegen hilft die Regel oben billiger.

**Wann ein Worktree doch richtig ist:** wenn beide Werkzeuge über
längere Zeit an **verschiedenen Branches** arbeiten sollen. Dann ist es
kein Aufräumproblem mehr, sondern eine Frage des Git-Zustands, und die
409 MB sind gut angelegt.

### 10.2 Der Pfadschutz gilt nur für Claude Code (B-26, B-20)

`.claude/hooks/protect-paths.ps1` schützt `supabase/migrations/`
(Schreiben) und `.env*` (Lesen **und** Schreiben). **Er wirkt
ausschliesslich in Claude Code** — jedes andere Werkzeug arbeitet ohne
ihn.

**Warum, an der Mechanik belegt** `[cmd]` 2026-08-13:

| Eingabe | Ergebnis |
|---|---|
| `{"tool_name":"Write","tool_input":{"file_path":".env"}}` | **Exit 2, blockiert** |
| dieselbe Nutzlast, `tool_name` = `mcp__desktop-commander__write_file` | Exit 0, **durchgelassen** |
| dieselbe Nutzlast, `tool_name` fehlt | Exit 0, durchgelassen |
| `path` statt `file_path` | Exit 0, durchgelassen |
| leere Eingabe / kein JSON | Exit 0, durchgelassen |

Zwei Ursachen, beide bewusst:
1. **Namensvergleich.** Der Hook prüft `$tool -eq 'Write' -or 'Edit' -or
   'Read'` — exakte Gleichheit auf Claude Codes Werkzeugnamen. Ein
   MCP-Werkzeug heisst anders und fällt durch.
2. **Fail-open.** Bei unlesbarer oder leerer Eingabe `exit 0`. Das ist
   Absicht (der Hook darf den Normalbetrieb nicht zerlegen), heisst aber:
   **wer nichts über stdin liefert, wird nicht geprüft.**

**Regel:**

- **Risikoreiche Schritte gehören in eine Claude-Code-Sitzung** —
  Schreiben auf `supabase/migrations/`, Zugriff auf `.env*`, Löschungen,
  Datenbankeingriffe. Nicht, weil andere Werkzeuge schlechter wären,
  sondern weil dort **kein Damm steht**.
- **Aus der Existenz eines Hooks folgt nicht sein Wirken.** Wer eine
  Schutzwirkung annimmt, prüft sie mit einer Testeingabe nach — das
  obige Verfahren dauert eine Minute.
- **Was übrig bleibt, wenn der Hook nicht greift:** die
  Berechtigungsliste in `.claude/settings.json` (ebenfalls nur Claude
  Code), das Dateisystem und der Mensch. Sonst nichts.

`[cmd]` 2026-08-13: `desktop-commander` ist derzeit **in keiner
MCP-Konfiguration eingetragen** (weder `~/.claude.json` global noch
projektbezogen — dort stehen `serena`, `context7`, `lean-ctx`). Die Regel
gilt trotzdem, weil sie für **jedes** Werkzeug ausserhalb Claude Codes
gilt, nicht für ein bestimmtes.

**Codex** führt eigene Hooks (`.codex/hooks.json`, heute zwei
lean-ctx-Einträge), hat aber `[cmd]` seit 2026-08-06 **keinen
Pfadschutz**. Ihn einzuhängen ist erst sinnvoll, wenn belegt ist, was
Codex an Hooks übergibt: liefert es kein stdin-JSON, greift Ursache 2
oben und der Hook ist wirkungslos — *diesmal aber unbemerkt, weil eine
Konfiguration dasteht.* Ein wirkungsloser Schutz, den man für wirksam
hält, ist schlechter als gar keiner. Stand und Vorgehen: TODO B-20.

## 11. Änderungen an der Datenbank

Nie gegen die laufende Datenbank testen. Jeder Versuch in einer
Wegwerf-Datenbank, danach verwerfen.

Vor jeder strukturellen Änderung eine Sicherung. Eine Sicherung, die nie
zurückgespielt wurde, ist eine Datei und kein Backup.

`[cmd]` `pg_restore` meldet fehlende Policies nur als Warnung und gilt
trotzdem als erfolgreich — der Vergleich nach dem Zurückspielen ist Pflicht.

### 11.1 Dubletten: der Massstab ist eine Frage an die Daten

Beim Übernehmen des Legacy-Bestands sind `[cmd]` **sechs
Dublettenklassen** aufgetreten, jede erst nachdem die vorige beseitigt
war:

| # | Klasse | Beispiel | gefunden durch |
|---|---|---|---|
| 1 | überzählige schliessende Klammer | `Trapezius)` | Normalisierung |
| 2 | Schreibweise | `Chair` / `chair` | Normalisierung |
| 3 | doppeltes Leerzeichen | `Bench  Press` | Normalisierung |
| 4 | Singular/Plural | `Inner Thigh` / `Inner Thighs` | Einzelfallprüfung |
| 5 | **Tippfehler** | `Calvicular`/`Clavicular`, `mideus`/`Medius` | Levenshtein-Abstand |
| — | *gepaarte Klammer* | `Chest dip (on dip station)` | **KEINE Klasse** |

Die ersten drei fallen unter **einen** normalisierten
Vergleichsschlüssel. Klasse 4 und 5 nicht: `thigh`/`thighs` und
`calvicular`/`clavicular` bleiben nach jeder Normalisierung verschieden.

**Die eigentliche Regel ist keine über Namen.** Jede dieser
Entscheidungen fiel an einer **Frage an die Daten**, nicht an der
Ähnlichkeit der Zeichenketten:

- **Übungen:** *„Zeigen sie auf identische Medienpfade?"* `[cmd]` Das
  führte 32 echte Dubletten zusammen und liess **46 Scheindubletten
  stehen** — darunter `"Ankle plantar flexion"` gegen
  `"Ankle - Plantar Flexion"`, die verschiedene Aufnahmen haben und
  deshalb verschiedene Übungen sind.
- **Muskelgruppen:** *„Werden beide je DERSELBEN Übung zugeordnet?"*
  Eine Übung listet einen Muskel nicht zweimal.
- **Wo auch das nicht reicht: die Verwendung.** `[cmd]`
  `Clavicular Head` steht 16 von 22 Mal an einer Incline-Übung — der
  Schlüsselbeinanteil des Pectoralis ist genau das, was Schrägbank
  trifft. `Calvicular Head` steht an zwei Kabelzug-Übungen derselben
  Funktionsgruppe. Die Verwendung trennt die Namen nicht.

**Aber: derselbe Massstab trug bei den Muskelgruppen nur in EINE
Richtung — und ich habe ihn zuerst in die falsche gelesen.**

Bei den Übungen entschied „identische Medienpfade?" **beidseitig**:
gleiche Pfade ⇒ dieselbe Übung, verschiedene Pfade ⇒ verschiedene
Übungen. Beide Schlüsse tragen.

Bei den Muskelgruppen trägt nur einer. `[cmd]` 2026-08-13 an allen acht
Levenshtein-Paaren gemessen:

| Paar | gemeinsame Übungen | Befund |
|---|---|---|
| `Biceps` / `Triceps` | 11 | zwei Muskeln |
| `Gluteus Medius` / `gluteus mideus` | **5** | **Tippfehler** |
| `Abductors` / `Adductors` | 1 | zwei Muskeln |
| `Teres Major` / `Teres Minor` | **0** | zwei Muskeln |
| `Lats` / `Legs` | 0 | zwei Muskeln |

- **Eine gemeinsame Übung BELASTET** — dieselbe Muskelgruppe zweimal an
  einer Übung kommt bei zwei verschiedenen Muskeln nicht vor.
- **Keine gemeinsame Übung entlastet NICHT** — vier Paare mit 0 sind
  trotzdem verschiedene Muskeln. Sie kommen nur nie zusammen vor.

**Der Fehler, den das gekostet hat:** Die erste Fassung dieser Prüfung
meldete `tippfehler_ohne_gegenbeleg` — Paare *ohne* gemeinsame Übung —
in der Annahme, eine gemeinsame Übung entlaste. Sie meldete damit **vier
Nicht-Fälle und übersah den einen echten**, weil der fünf gemeinsame
Übungen hatte und deshalb in die „unverdächtig"-Gruppe fiel.
*Der Massstab war richtig, seine Leserichtung falsch.*

**Regel daraus:** Bevor ein Massstab in eine Prüfung wandert, ist an
**bekannten Fällen beider Sorten** zu belegen, in welche Richtung er
trägt — an mindestens einem bestätigten Treffer und einem bestätigten
Nicht-Treffer. Ein Massstab, der nur an den Nicht-Treffern geprüft wurde,
zeigt zuverlässig in die falsche Richtung.

**Ein Nullergebnis ist zuerst ein Verdacht gegen den eigenen Massstab.**
`[cmd]` Zweimal geschehen: 153 „Byte-Abweichungen" bei den Medienpfaden
waren Kodierungsstil, nicht verschiedene Ziele; „0 % Geschwister" bei den
verwaisten Medien lag daran, dass der Vergleichsschlüssel `_Female` auch
aus den referenzierten Pfaden strich. *Beide Male war der Massstab zu
korrigieren, nicht das Ergebnis.*

**Deshalb gilt für die siebte Klasse:** erst die Frage an die Daten
suchen, dann die Regel schreiben. Eine Schwelle zu raten (`Abstand ≤ 2`)
erzeugt Scheintreffer, die entweder falsch bereinigt oder — schlimmer —
als Dauerrot abgeschaltet werden. Prüfungen, die sich nicht hart machen
lassen, gehören als **Meldung** in die Validierung, mit dem Grund im
Kommentar (Muster: `tippfehler_ohne_gegenbeleg` in `v100_training.sql`).

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
