# Sitzung 2026-08-02 — Zugriffsschicht produktiv

**Ankerhash bei Start:** 6709e9a
**Ziel:** `060_zugriffsschicht.sql` gegen die laufende Datenbank anwenden,
`nutrition` über die API freigeben, Zeilenschutz verifizieren.

---

## Ablauf

### 1. Sicherung vor dem Eingriff

`[cmd]` `backup/schema/2026-08-02_nutrition_schema_vor_060.sql` (20.946 B)
und `backup/data/2026-08-02_nutrition_vor_060.dump` (5.763.594 B).
Integrität geprüft: 11 Tabellen per `pg_restore --list` lesbar.

Ist-Zustand vorher: 31 Indizes, 2 Policies, `pg_trgm` nicht installiert.

### 2. `060` angewendet

`[cmd]` Fehlerfrei mit `ON_ERROR_STOP=1`, Transaktion committet.
`[cmd]` `v060_zugriff.sql`: **22 von 22 Prüfungen bestanden.**

Nachher: 33 Indizes (+2 Trigram), 15 Policies (+13), `pg_trgm` installiert.
Alle Zeilenzahlen unverändert — 7.140 Foods, 698.092 Nährwerte, 21.420 Aliase,
9.265 Tags, 518 Kategorien, 138 Nährstoffdefinitionen.

### 3. Neustart der Instanz

Erster Versuch schlug fehl: `supabase start` lief aus `C:\Users\User` statt aus
dem Repo. Die CLI leitet den Projektnamen aus dem Verzeichnis ab und wollte ein
neues Projekt `User` anlegen — Portkonflikt auf 54322.

Zweiter Versuch aus dem Repo: `supabase stop` lief durch, `supabase start`
scheiterte an einer Container-Leiche `supabase_vector_LumeOS-Claude-V1`, die im
Neustartzyklus hing und nicht sauber entfernt worden war. Das Zurückrollen des
Startversuchs hat sie beseitigt; der dritte Versuch lief durch.

`[cmd]` Daten und `060` haben den Neustart überstanden.
`[cmd]` PostgREST zur Laufzeit: `PGRST_DB_SCHEMAS=public,graphql_public,nutrition`,
Schema-Cache mit 15 Relationen geladen. **Die Konfigurationsänderung greift.**

---

## 4. Verifikation des Zugriffsmodells

`[cmd]` Rollentests direkt in der Datenbank per `SET ROLE`:

| Rolle | Zugriff | Ergebnis | Erwartet |
|---|---|---|---|
| `anon` | Schema `nutrition` | `permission denied for schema` | ✓ |
| `authenticated` | `foods` lesen | 7.140 | ✓ |
| `authenticated` | `food_nutrients` lesen | 698.092 | ✓ |
| `authenticated` | `foods` schreiben | `permission denied for table` | ✓ |
| `authenticated` | `food_preferences` lesen | **0 Zeilen** | ✓ |
| `authenticated` | `food_curation_candidates` | `permission denied for table` | ✓ |

Alle drei Datenklassen aus `docs/spezifikation/10-plattform/datenzugriff`
verhalten sich wie spezifiziert. Besonders die fünfte Zeile: `authenticated`
ohne Nutzeridentität sieht null Preference-Zeilen, weil die Policy über
`auth.uid()` filtert. Es gibt keinen Zustand, in dem jemand fremde Nutzerdaten
sieht.

### Über HTTP

`[cmd]` `Accept-Profile: public` → HTTP 404 (Tabelle dort nicht vorhanden,
Anfrage erreicht PostgREST).
`[cmd]` `Accept-Profile: nutrition` mit Anon-Schlüssel → HTTP 401.
Ursache: `anon` hat kein `USAGE` auf `nutrition` — beabsichtigt.

**Offen `[annahme]`:** Der Weg mit echter Session ist ungetestet. Ein lokal mit
`JWT_SECRET` signiertes Token mit Rolle `authenticated` wurde abgelehnt. Die
CLI-Version 2.75 gibt neben dem klassischen `ANON_KEY` (JWT) auch Schlüssel der
neuen Generation aus (`sb_publishable_`, `sb_secret_`); vermutlich weicht die
Signaturprüfung ab. Kein Hinweis auf einen Fehler im eigenen Aufbau — klärt
sich beim ersten echten Login in M1 Teil C.

---

## Ergebnis

**M1 Teil A und B sind produktiv.** `apps/web` kann auf supabase-js umgestellt
werden: Schema ausgesetzt, Rechte gesetzt, Zeilenschutz verifiziert.

`apps/web` läuft weiterhin über `docker exec psql` als Superuser und ist von
der Änderung nicht betroffen — Superuser umgehen den Zeilenschutz.

## Nebenbefunde

1. `[cmd]` Zwölf Container eines Altprojekts `lumeos-core` liegen seit drei
   Monaten beendet auf dem System. Kein Bezug zum aktuellen Projekt, entfernbar.
2. `supabase_vector` hing vor dem Neustart seit Tagen im Neustartzyklus.
   Ursache vermutlich die Analytics-Warnung unter Windows (Docker-Daemon nicht
   auf `tcp://localhost:2375` freigegeben). Betrifft nur die Protokollsammlung.
3. Die CLI meldet Version 2.75.0, verfügbar ist 2.111.0.
4. Der Anon-Schlüssel in der Kastenausgabe von `supabase status` wird am
   Rahmen abgeschnitten. Für Skripte `supabase status -o env` verwenden.
