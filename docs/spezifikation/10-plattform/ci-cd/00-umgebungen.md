---
status:     entwurf
version:    0.1
stand:      2026-08-03
ankerhash:  919f2bd
quellen:    Gespräch Tom 2026-08-03; Ist-Zustand aus supabase/ und docs/todo
abhaengig:  10-plattform/datenzugriff, auth-sso
---

# Plattform: Umgebungen und Auslieferung

**Grundsatz:** Lokal wird für den produktiven Fall entwickelt. Abweichungen
gibt es nur dort, wo sie technisch unvermeidbar sind — und dann benannt.

## 1. Drei Umgebungen

| Umgebung | Frontend | Datenbank | Zweck |
|---|---|---|---|
| **lokal** | `pnpm dev`, Port 3200 ff. | Supabase im Docker-Container | Entwicklung |
| **Vorschau** | Vercel Preview je Pull Request | offen — siehe Abschnitt 6 | Prüfen vor dem Zusammenführen |
| **produktiv** | Vercel, später eigene Domain | Supabase Cloud | Betrieb |

Vorschau und Produktion laufen über https. Lokal über http auf `localhost` —
`[read]` das ist kein Sonderfall, weil lokale Adressen als potenziell
vertrauenswürdig gelten und `Secure`-Cookies dort funktionieren.

## 2. Wie die Datenbank in eine Umgebung kommt

`[cmd]` Der Datenbankzustand entsteht aus der Kette in `supabase/_pipeline/`,
nicht aus manuellen Eingriffen. Dreifach verifiziert: aus einer leeren
Datenbank entstehen bitgenau 11 Tabellen, 105 Spalten, 33 Indizes,
15 Policies und 727.000 Zeilen — in unter zehn Sekunden.

**Dieselbe Kette gilt für jede Umgebung.** Was lokal läuft, läuft in der
Cloud. Ein Zustand, der nur in einer Umgebung existiert, ist ein Fehler.

**Offen:** Die Kette wird heute von Hand ausgeführt. Ob sie in reguläre
Supabase-Migrationen überführt wird — dann trägt `supabase db push` sie —
oder ob ein Skript sie in Reihenfolge anwendet, ist nicht entschieden.
Siehe TODO D-17.

## 3. Was nicht mitwandert

| Posten | Warum |
|---|---|
| Die BLS-Rohdaten (30 MB) | als Archiv versioniert unter `supabase/_data/`, Import ist ein Kettenschritt |
| `auth.users` | je Umgebung eigene Identitäten; keine Übernahme von Testkonten |
| Storage-Objekte | eigener Speicher je Instanz, kein Bestandteil eines Dumps |
| Zugangsdaten | siehe Abschnitt 5 |

## 4. Rückleitadressen

Jede App braucht je Umgebung einen Eintrag in
`additional_redirect_urls` der Supabase-Instanz. Bei sieben Apps und drei
Umgebungen sind das bis zu einundzwanzig Adressen.

`[cmd]` Heute steht dort ein einziger Eintrag, und er zeigt auf Port 3000,
während die App auf 3200 läuft — jeder Anmeldeversuch würde ins Leere
leiten. Siehe TODO B-13.

**Regel:** Die Liste wird in `supabase/config.toml` gepflegt und ist damit
versioniert. Für die Cloud-Instanz gilt dieselbe Datei — sie darf nicht im
Dashboard von Hand gepflegt werden, sonst weicht sie ab und niemand merkt es.

**Offen:** Vercel erzeugt je Pull Request eine eigene Vorschau-Adresse. Diese
lassen sich nicht vorab eintragen. Entweder Vorschauen ohne Anmeldung, oder
eine Platzhalter-Regel, sofern die Instanz das unterstützt — ungeprüft.

## 5. Zugangsdaten

| Schlüssel | Wo | Sichtbarkeit |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Umgebungsvariable | öffentlich, erreicht den Browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Umgebungsvariable | öffentlich, durch Zeilenschutz abgesichert |
| `SUPABASE_SERVICE_ROLE_KEY` | nur serverseitig | **umgeht jeden Zeilenschutz** |

Der Service-Schlüssel darf in keinem Artefakt auftauchen, das den Browser
erreicht. Er gehört nicht ins Repo — `[cmd]` `.gitignore` deckt `.env` und
`.env.*` ab, und beide waren nie in einem Commit.

Lokal liegt er in `apps/web/.env.local`, in Vercel als Umgebungsvariable des
Projekts.

## 6. Offene Grundsatzentscheidung: die Cloud-Instanz

`[cmd]` Es existiert eine bezahlte Supabase-Instanz `LumeOS-V2` (Pro-Plan)
mit 15 GB Trainingsmedien im Bucket `exercises` und einer weitgehend
ausgebauten Vorgängerimplementierung in `public`.

Drei Möglichkeiten, keine entschieden:

**A — `LumeOS-V2` wird Produktion.** `public` wird geleert, unsere Schemas
kommen frisch hinein, Bucket und `auth` bleiben. Kein Medientransfer.
Nachteil: Produktion erbt die Geschichte einer Testinstanz.

**B — Neue Instanz für Produktion**, `LumeOS-V2` bleibt Medienspeicher.
Sauberer Start, aber zwei bezahlte Projekte und Medien in einer anderen
Instanz als die Daten.

**C — Neue Instanz, Medien wandern mit.** Am saubersten, kostet einen
Transfer von 15 GB.

Siehe Sektion E in `docs/todo/TODO.md`. Die Entscheidung blockiert die
Vorschau-Umgebung, weil deren Datenbank an ihr hängt.

## 7. Prüfliste vor dem ersten Deployment

Diese Punkte gelten unabhängig davon, welche Instanz gewählt wird. Sie sind
nicht Empfehlung, sondern Bedingung.

- [ ] **Kein `service_role` im Anwendungspfad.** `[cmd]` `apps/web` liest
      heute serverseitig mit `service_role` und umgeht damit die 15 Policies
      aus Kettenschritt 060. Lokal ohne Nutzerdaten folgenlos, produktiv nicht.
      Siehe TODO C-11.
- [ ] **Zeilenschutz mit zwei echten Identitäten geprüft.** Nicht per
      `SET ROLE`, sondern über zwei angemeldete Konten und alle vier
      Operationen.
- [ ] **`site_url` und Rückleitadressen** für die Zielumgebung gesetzt.
- [ ] **Kein Testkonto und keine Testdaten** in `auth.users` der
      Produktionsinstanz.
- [ ] **Sicherung vor dem ersten Kettenlauf**, Wiederherstellung einmal
      geprüft. `[cmd]` Ein Dump verliert Policies stillschweigend, wenn das
      Schema `auth` fehlt — `pg_restore` meldet das nur als Warnung.
- [ ] **Entwicklungsmodus der Berechtigungsschicht aus.** Er schaltet für
      Tom alle Module frei; produktiv darf er nicht greifen. Siehe
      `10-plattform/berechtigungen`.
- [ ] **RLS-Status je Tabelle geprüft.** `[cmd]` Das Muster fehlender
      Policies ist über zwei unabhängige Instanzen aufgetreten — es geht im
      Aufbau systematisch unter, nicht versehentlich.

## 8. Abnahmekriterien

- **AK-1:** Gegeben eine leere Cloud-Instanz, wenn die Kette läuft, dann
  entsteht derselbe Zustand wie lokal — Tabellen, Spalten, Indizes, Policies
  und Zeilenzahlen identisch.
- **AK-2:** Gegeben ein Deployment, dann enthält kein an den Browser
  ausgeliefertes Artefakt den Service-Schlüssel.
- **AK-3:** Gegeben eine Anmeldung in der Zielumgebung, dann landet die
  Nutzerin nach dem Rückweg auf dieser Umgebung und nicht auf einer anderen.
- **AK-4:** Gegeben ein Zustand existiert in einer Umgebung, dann lässt er
  sich aus dem Repo in jeder anderen herstellen.

## 9. Offene Fragen

1. **Cloud-Instanz** — siehe Abschnitt 6. Blockiert die Vorschau-Umgebung.
2. **Kette als Migration oder als Skript** — siehe Abschnitt 2, TODO D-17.
3. **Vorschau-Adressen von Vercel** — je Pull Request neu, nicht vorab
   eintragbar. Siehe Abschnitt 4.
4. **Datenbank für Vorschauen** — eigene Supabase-Branches (kostenpflichtig
   je Stunde), eine gemeinsame Vorschau-Instanz, oder keine Datenbank und
   damit keine anmeldepflichtigen Vorschauen?
5. **Automatisierung** — heute läuft alles von Hand. Ab wann lohnt eine
   Pipeline, und was gehört hinein: Typprüfung, Tests, Kettenlauf gegen eine
   Wegwerf-Datenbank?
6. **Testbarkeit** — `[cmd]` es gibt keinen Test-Runner (TODO C-09). Ohne
   ihn kann keine Pipeline etwas prüfen ausser der Typprüfung.
