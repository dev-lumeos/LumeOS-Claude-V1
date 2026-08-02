---
status:     entwurf
version:    0.1
stand:      2026-08-02
ankerhash:  b0441a9
quellen:    supabase/_pipeline/06_zugriff/060_zugriffsschicht.sql (gebaut)
            docs/ssot/33-pipeline-verifikation.md (verifiziert)
abhaengig:  10-plattform/auth-sso, 10-plattform/berechtigungen
---

# Plattform: Datenzugriff

**Grundsatz:** Die Datenbank ist die Zugriffsgrenze, nicht die Anwendung.
Was eine Oberfläche nicht anzeigt, muss die Datenbank trotzdem verweigern.

## 1. Zweck

Regelt, wie Anwendungen an Daten kommen: Schemas, Rechte, Zeilenschutz,
Client-Schicht. Dieser Baustein ist als einziger in Ebene 0 bereits gebaut
und verifiziert — die Spezifikation beschreibt das Zielbild, der Ist-Zustand
steht in `docs/ssot/`.

## 2. Ein Schema je Fachbereich

Jeder Fachbereich bekommt ein eigenes Postgres-Schema: `nutrition`,
`training`, `medical` und so fort. Nicht alles nach `public`.

**Begründung:** Rechte und Zeilenschutz lassen sich je Schema vergeben,
Namenskollisionen entfallen, und die Herkunft einer Tabelle ist am Namen
ablesbar. `public` bleibt der Ablage vorbehalten, die keinem Fachbereich
zuzuordnen ist.

`[cmd]` Der Altbestand `db/schema/nutrition.sql` schreibt sechs Tabellen ohne
Schemaqualifizierung, also nach `public`, darunter ein zweites `foods` neben
dem bestehenden `nutrition.foods` mit 7.140 Zeilen. Bei Übernahme ist zu
qualifizieren.

## 3. Nur ausgesetzte Schemas sind erreichbar

Ein Schema ist über die API nur erreichbar, wenn es in `config.toml` unter
`[api] schemas` steht. Fehlt es dort, kann der Client es nicht ansprechen —
unabhängig von Rechten.

`[cmd]` Genau daran scheiterte der bisherige Zugriff: `nutrition` war nicht
ausgesetzt, weshalb `apps/web` den Umweg über `docker exec psql` als
Superuser nahm. Nicht auslieferbar, nicht authentifizierbar, kein Zeilenschutz.

**Regel:** Ein neues Fachschema wird ausgesetzt, mit Rechten versehen und mit
Zeilenschutz belegt — in einem Schritt. Aussetzen ohne Zeilenschutz macht die
Daten für jeden mit dem öffentlichen Schlüssel lesbar.

## 4. Rechte vor Zeilenschutz

Die API prüft **zuerst Tabellenrechte, dann Policies**. Eine Policy auf einer
Tabelle ohne passendes Recht ist wirkungslos — der Zugriff scheitert vorher.

`[cmd]` Dieser Zusammenhang wurde beim Bau von `060_zugriffsschicht.sql`
gefunden: Die Schreib-Policies auf den Preference-Tabellen wären ohne
INSERT-, UPDATE- und DELETE-Recht für `authenticated` folgenlos geblieben.

Daraus folgt die Reihenfolge in jedem Zugriffsschritt:
Schema aussetzen → `USAGE` auf das Schema → Tabellenrechte → Zeilenschutz →
Policies → Standardrechte für künftige Tabellen.

## 5. Drei Datenklassen, drei Muster

Jede Tabelle gehört genau einer Klasse an. Die Klasse bestimmt das Muster.

### Stammdaten

Referenzdaten ohne Personenbezug: Lebensmittel, Nährstoffdefinitionen,
Kategorien, Übungen, Geräte.

Zeilenschutz aktiv, **genau eine** Policy: `FOR SELECT TO authenticated
USING (true)`. Keine Schreib-Policy. Importe laufen als `service_role` und
umgehen den Zeilenschutz ohnehin.

**Warum Zeilenschutz, wenn alle lesen dürfen:** Ohne aktivierten Zeilenschutz
liest jeder mit dem öffentlichen Schlüssel alles. Die konstant wahre Policy
kostet praktisch nichts — der Planer optimiert sie weg — und macht die
Absicht ausdrücklich.

### Nutzerdaten

Alles mit `user_id`: Präferenzen, Tagebücher, Messwerte, Ziele.

Zeilenschutz aktiv, **getrennte Policies je Operation** — SELECT, INSERT,
UPDATE, DELETE — mit `auth.uid() = user_id` und ausdrücklichem `WITH CHECK`
bei INSERT und UPDATE.

**Nicht `FOR ALL`.** Es funktioniert, verschleiert aber, was erlaubt ist, und
macht spätere Abweichungen je Operation schwierig.

### Betriebsdaten

Ohne Personenbezug, nur für den Betrieb: Kurationswarteschlangen,
Importprotokolle, Auswertungen.

Zeilenschutz aktiv, **keine Policy**, kein Recht für `authenticated`. Damit
dicht für Endnutzer; `service_role` arbeitet daran vorbei. Zugriff aus der
App `admin` läuft serverseitig.

`[cmd]` Die Kurationstabellen haben keine `user_id` und fallen deshalb heute
in diese Klasse. Ob Kuration eine Nutzertätigkeit wird, ist offen.

## 6. Modulaktivierung im Zeilenschutz

Für Nutzerdaten eines Moduls genügt `auth.uid() = user_id` nicht. Ist das
Modul für die Identität nicht aktiv, muss der Zugriff scheitern, auch auf
eigene Daten.

Die Policy ruft dazu die Auflösungsfunktion aus
`10-plattform/berechtigungen` auf. Damit gilt dieselbe Regel für Navigation
und Datenbank, mit einer einzigen Umsetzung.

**Kosten beachten:** Eine Funktion in einer Policy läuft je Zeile, wenn der
Planer sie nicht heraushebt. Die Funktion ist deshalb als `STABLE` zu
kennzeichnen und darf nicht von Zeilendaten abhängen. `[annahme]` — bei den
ersten Modulen zu messen.

## 7. Client-Schicht

Anwendungen sprechen ausschliesslich über die Supabase-Clients aus
`packages/shared` mit der Datenbank. Kein direkter Datenbankzugriff, keine
Shell-Aufrufe, keine hartkodierten Containernamen.

| Umgebung | Client | Schlüssel |
|---|---|---|
| Browser | Browser-Client | öffentlich |
| Server | Server-Client mit Session | öffentlich, Session aus Cookie |
| Hintergrund, Import | Service-Client | `service_role`, nie im Browser |

**Der `service_role`-Schlüssel umgeht den Zeilenschutz vollständig.** Er
gehört ausschliesslich in serverseitige Umgebungsvariablen und nie in Code,
der den Browser erreicht.

## 8. Grenzen der API

`max_rows` begrenzt die Antwortgrösse. Jede Liste braucht Blättern von
Anfang an; eine ungefilterte Katalogabfrage ist kein gültiger Zugriff.

Lässt sich eine Abfrage nicht sinnvoll über die API abbilden, entsteht eine
Datenbankfunktion, die per RPC gerufen wird. Die Funktion gehört in den
Kettenschritt des Moduls, nicht in den Anwendungscode — sonst liegt Fachlogik
an zwei Orten.

## 9. Aufbau und Reproduzierbarkeit

Der Datenbankzustand entsteht aus einer Kette von Schritten im Repo, nicht
aus manuellen Eingriffen. Die Kette muss aus einer leeren Datenbank denselben
Zustand erzeugen.

| Stufe | Inhalt |
|---|---|
| Schema | Tabellen, Constraints, Indizes |
| Kataloge | Referenzwerte, die zum Schema gehören |
| Import | Rohdaten aus versionierten Quellen |
| Ableitungen | Berechnetes: Tags, Aliase, Zuordnungen |
| Zugriff | Rechte, Zeilenschutz, Policies |

**Zwei Regeln, aus dem Verifikationslauf abgeleitet:**

Jeder Schritt ist wiederholbar — `IF NOT EXISTS`, `ON CONFLICT`, Guards.
Ein Schritt, der beim zweiten Lauf scheitert, ist kein Kettenglied.

Jeder Schritt hat eine Prüfung, die Soll gegen Ist stellt. Ohne Prüfung gilt
er als unbelegt.

**Ableitungsregeln existieren genau einmal.** Wer eine Schwelle kopiert,
erzeugt zwei Wahrheiten, die auseinanderlaufen.

## 10. Migrationen und Ketten sind zweierlei

`supabase/migrations/` gehört dem CLI: alles darin läuft bei `db reset`
automatisch. Dort liegt ausschliesslich, was tatsächlich angewendet werden
soll.

Entwürfe, überholte Fassungen und Reviewstände gehören ins Archiv. `[cmd]`
Vier Dateien lagen dort, die nie angewendet wurden oder Governance-Altlast
waren — sie hätten bei einem `db reset` einen Zustand erzeugt, den es nie gab.

## 11. Abnahmekriterien

- **AK-1:** Gegeben eine leere Datenbank, wenn die vollständige Kette läuft,
  dann stimmen Tabellen, Spalten, Indizes, Policies und alle Zeilenzahlen mit
  der Referenz überein.
- **AK-2:** Gegeben ein neues Fachschema, wenn es ausgesetzt wird, dann hat
  jede Tabelle darin aktivierten Zeilenschutz und eine Klassenzuordnung.
- **AK-3:** Gegeben eine angemeldete Identität, wenn sie Stammdaten liest,
  dann gelingt es; wenn sie Stammdaten schreibt, scheitert es.
- **AK-4:** Gegeben zwei Identitäten mit Nutzerdaten, dann sieht keine die
  Daten der anderen — geprüft für alle vier Operationen.
- **AK-5:** Gegeben ein Modul ist für eine Identität nicht aktiv, dann
  scheitert der Zugriff auf dessen Nutzerdaten, auch auf eigene Zeilen.
- **AK-6:** Gegeben eine Anwendung, dann enthält sie keinen direkten
  Datenbankzugriff ausserhalb der Clients aus `packages/shared`.
- **AK-7:** Gegeben der `service_role`-Schlüssel, dann taucht er in keinem
  Artefakt auf, das den Browser erreicht.
- **AK-8:** Gegeben jeder Kettenschritt, wenn er zweimal läuft, dann ist das
  Ergebnis identisch und es tritt kein Fehler auf.

## 12. Offene Fragen

1. **Kosten der Aktivierungsprüfung in Policies** — siehe Abschnitt 6, zu messen.
2. **Kurationstabellen** — `user_id` nachrüsten und zu Nutzerdaten machen,
   oder Betriebsdaten bleiben?
3. **Materialisierung von Anzeigewerten** — für Sortieren und Filtern nach
   Nährwerten braucht die EAV-Struktur je Abfrage einen Pivot über 698.092
   Zeilen. Vorschlag: wenige Anzeigewerte als Spalten, gefüllt im
   Ableitungsschritt. Entscheidung vertagt, bis Last es zeigt.
4. **Migrationsregister** — die Kettenschritte sind nicht registriert.
   In reguläre Migrationen überführen oder als dokumentierten Ablauf belassen?
5. **Umgebungen** — dieses Dokument beschreibt lokal. Übertragung auf eine
   Cloud-Instanz gehört nach `10-plattform/ci-cd`.
