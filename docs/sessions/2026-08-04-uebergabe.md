# Übergabe — Stand 2026-08-04

**Ankerhash:** `bce3e07` · Branch `dev`, **46 Commits ahead, nicht gepusht**
**Offen im Working Tree:** nur `AGENTS.md` und `CLAUDE.md` (siehe B-10)

Diese Datei ist der Einstieg für eine neue Sitzung. Sie ersetzt kein Dokument,
sondern sagt, welches wann zu lesen ist.

---

## 1. Zuerst lesen, in dieser Reihenfolge

| Datei | Wofür |
|---|---|
| `docs/ssot/00-INDEX.md` | Rangfolge bei Widerspruch, Marker-Regel |
| `docs/todo/TODO.md` | Kritischer Pfad und 60 Punkte in fünf Sektionen |
| `docs/spezifikation/00-INDEX.md` | Aufbau der Spezifikation, zwei Achsen |
| `supabase/README.md` | Aufbaukette der Datenbank |

**Rangfolge bei Widerspruch:** Code (per Befehl verifiziert) → `docs/ssot/` →
`docs/spezifikation/` → alles andere.

`docs/specs/` ist **Altbestand**, Datenquelle für die Auswertung, kein Sollwert.
`docs/_archive/` und `_archive/governance/` werden **nicht zitiert**.

---

## 2. Wie hier gearbeitet wird

### Herkunftsmarker sind Pflicht

In `docs/ssot/` trägt jede Tatsachenbehauptung `[cmd]`, `[read]` oder
`[annahme]`. Nur `[cmd]`-Aussagen dürfen zu Regeln in `CLAUDE.md` werden.

**Warum:** Am 2026-07-30 lief eine Bestandsaufnahme ohne funktionierende Shell
und schloss daraus, `services/` und `packages/` seien leer. Der Satz wanderte
ungeprüft in die Projektanweisung und galt dort als Regel. Tatsächlich standen
dort 17 kompilierende Packages.

**Ein Befehl ausgeführt zu haben genügt nicht — es muss der richtige sein.**
Beispiel: Ich habe drei Migrationen einmal laufen lassen und daraus geschlossen,
sie seien wiederholbar. Der Zweitlauf scheitert bei zweien von dreien.

### Berichte werden geprüft, nicht geglaubt

Zusammenfassungen von Teilagenten sind kein Beleg. Die Prüfung ist ein Zähllauf
über nachweisbare Merkmale — Anzahl Einträge, Zeilenzahlen, Hashes — nicht das
Lesen der Zusammenfassung. `[cmd]` In einem Lauf waren vier Angaben falsch, in
einem anderen fiel eine ganze Sektion auf einen älteren Stand zurück.

### Encoding

Bei Verdacht auf beschädigte Zeichen entscheidet **der Hex-Dump**, nie die
Konsolenausgabe. `[cmd]` Zweimal wurde korrektes UTF-8 fälschlich als Schaden
gemeldet, weil die Konsole in falscher Codepage lief.

### Markdown

Vollständig schreiben, nie zeilenweise ändern — Teil-Edits zerstören Tabellen.
**Datei vorher einlesen**, nicht aus dem Kontext rekonstruieren.

Beim Einfügen an einer Zeilennummer: `$l[0..$i] + $neu + $l[($i+1)..]`.
Ein Off-by-one setzt den Block vor die Überschrift statt darin — das ist
zweimal passiert.

### Git

`git mv` **stagt sofort**. Ein anschliessendes `git commit` nimmt alles
Gestagte mit, auch fremdes. Zweimal sind so zusammenhanglose Änderungen in einen
Commit geraten.

**Regel: vor jedem Commit `git diff --cached --name-only` lesen** und den
vollständigen `git status`, nicht die ersten Zeilen.

Nie ohne ausdrückliche Anweisung pushen.

### Löschen

**Kein untracked Verzeichnis wird dem Namen nach gelöscht.** `[cmd]` Zweimal
lag darin das Einzige seiner Art: die BLS-Rohdaten unter `tmp/` und der
Produktionsdump der Vorgängerinstanz unter `temp/lumeosold/`. Beide standen auf
meiner eigenen Löschliste.

### Datenbank

Nie gegen die laufende Datenbank testen. Jeder Versuch in einer
Wegwerf-Datenbank, danach verwerfen. Vor jeder strukturellen Änderung eine
Sicherung nach `backup/`.

`[cmd]` `pg_restore` meldet fehlende Policies nur als Warnung und gilt trotzdem
als erfolgreich — der Vergleich nach dem Zurückspielen ist Pflicht.

### Arbeitsteilung

Eine Datei hat zu einem Zeitpunkt einen Zuständigen. Wer eine Aufgabe an Claude
Code delegiert, gibt die Datei ab — und liest sie neu ein, bevor er sie wieder
anfasst. Während ein Lauf arbeitet, wird nicht committet.

`desktop-commander` umgeht die Permission-Schicht von Claude Code vollständig.
Risikoreiche Schritte gehören in eine Claude-Code-Sitzung.

---

## 3. Was in drei Tagen entstanden ist

### Datenbank — reproduzierbar

`[cmd]` Dreifach verifiziert: aus einer leeren Datenbank entstehen in unter
zehn Sekunden 11 Tabellen, 105 Spalten, 33 Indizes, 15 Policies und 727.000
Zeilen — bitgenau identisch zum laufenden Container.

Die Kette liegt in `supabase/_pipeline/`:

| Schritt | Inhalt |
|---|---|
| `supabase/migrations/` (3 Slices) | Schema: `nutrient_defs`, `foods`, `food_nutrients` |
| `015_kataloge` | 138 Nährstoffdefinitionen |
| `020` / `021` | Kategorien, Tags, Aliase, Ableitungen — **`020` läuft zweimal** |
| `030` | BLS-Import aus `supabase/_data/bls_4_0_local_import.zip` |
| `050` / `051` | Preferences, Curation |
| `060` | Rechte, RLS, Trigram-Indizes |
| `070` | fünf Lesefunktionen (rpc) |
| `080` | `public` bereinigt |
| `090` | `profiles` + Trigger auf `auth.users` |

**Einschränkung:** Wiederholbar sind nur 015 bis 090. `[cmd]` Von den drei
Slices in `supabase/migrations/` scheitern zwei im Zweitlauf.

### Zugriff — abgesichert

`nutrition` ist der API ausgesetzt, Rechte gesetzt, RLS auf allen Tabellen.
`[cmd]` `anon` kommt nicht ins Schema, `authenticated` liest Stammdaten und nur
eigene Nutzerdaten, Betriebsdaten sind dicht.

**`apps/web` hat den Service-Schlüssel nicht mehr** — die App kann den
Zeilenschutz nicht umgehen. Zugriff über `rpc()` und den Session-Client aus
`packages/shared`.

### Anmeldung — läuft

`[cmd]` Registrierung getestet: ein Nutzer, ein Profil, identischer Zeitstempel,
null Waisen. Middleware leitet ungeschützte Aufrufe nach
`/login?redirect=<ziel>`, `/` und `/login` bleiben öffentlich.

### Governance — raus

476 Dateien nach `_archive/governance/`. Workspace von 17 auf 4 Pakete:
`apps/web`, `services/nutrition-api`, `packages/shared`, `packages/types`.

`[cmd]` Anlass: Der Scheduler versuchte bei einem gewöhnlichen `pnpm dev` zwei
Workorders zu dispatchen — abgelehnt nur, weil die Agent-Registry den
Agentnamen nicht kannte, nicht durch eine Absicherung.

`pnpm dev` startet seither nur `./apps/*`.

### Spezifikation — Ebene 0 vollständig

`docs/spezifikation/`, 11 Dokumente, 1.806 Zeilen, 49 Abnahmekriterien.

Alle sieben Plattform-Bausteine sind geschrieben: architektur, auth-sso,
berechtigungen, ci-cd, datenzugriff, design-system, konventionen.
Dazu `20-apps/web`, `30-module/core/login`, `ADR-0001-datenzugriff`.

**Zwei Achsen, die der Altbestand vermischt:** Apps sind Auslieferungseinheiten
(`web`, `admin`, `buddy`, `coach`, `marketplace`, `gym`, `supplier`), Module
sind Funktionsbereiche darin (9 core + 2 addon). Daher die vier unversöhnten
Modulzählungen 10/11/7/13 im Altbestand.

---

## 4. Umgebung

| Posten | Wert |
|---|---|
| Repo | `D:\GitHub\LumeOS-Claude-V1`, Branch `dev` |
| App | `pnpm dev` → Port **3200** |
| Supabase | Docker, API 54321, DB 54322, Studio 54323 |
| Portschema | Apps 3200–3290 (Zehnerabstand), Services 5100–5900 |
| CLI | 2.75.0 — Update auf 2.111.0 steht aus, siehe unten |

**Wichtig:** `supabase start` muss aus dem Repo-Verzeichnis laufen, sonst legt
die CLI ein Projekt nach dem aktuellen Ordnernamen an und kollidiert auf den
Ports.

`[cmd]` Analytics ist in `config.toml` deaktiviert — auf Windows braucht es den
Docker-Daemon auf `tcp://localhost:2375`, ohne den läuft `vector` in eine
Endlosschleife und blockiert beim nächsten Start seinen eigenen Namen.

---

## 5. Design — hier stecken wir fest

**Stand: Tom ist von keiner der fünf Richtungen überzeugt. Wörtlich: „die
überzeugen mich alle nicht, nicht mal ansatzweise."**

Das ist der wichtigste offene Punkt dieser Übergabe.

### Was vorliegt

`docs/design-vorschau/index.html` — Startseite, findet neue Varianten von
selbst. Sieben Seiten:

| Seite | Inhalt |
|---|---|
| `tokens.html` | die 31 Tokens als Proben, Dunkel und Hell |
| `altbestand.html` | das Konzept vom April, historisch |
| `variante-a-instrumententafel.html` | WHOOP-Linie: eine Zahl, drei Stufen |
| `variante-b-bento.html` | Kachelfläche als Priorität |
| `variante-c-glas.html` | Liquid Glass, nur für Navigation und Dialoge |
| `variante-d-narrativ.html` | Wochenrückblick als Erzählung, vier Kapitel |
| `variante-e-klinik.html` | Körperkarte, Referenzbereiche, Hellmodus |

Alle ziehen ihre Farbwerte beim Erzeugen aus `apps/web/src/app/globals.css`.
Neu erzeugen: `node docs/design-vorschau/build-varianten.mjs` und
`build-index.mjs`.

### Was Tom will

„Ein bisschen futuristisch, animiert, neuzeitlich." Themes werden später über
Settings wählbar sein, der Altbestand-Look ist eines davon.

Geräte: Tablet, Notebook, Rechner. Skaliert bis aufs Handy herunter, **aber
Handy ist Testumgebung, kein Ziel.** Nicht mobile-first — das Notebook-Layout
wird geschrieben und nach unten reduziert.

### Warum die fünf nicht treffen — meine Vermutung, ungeprüft

`[annahme]` Ich habe „futuristisch" als *technisch fortgeschritten* gelesen
statt als *fremdartig*. Alle fünf sind im Kern Karten mit Zahlen darin —
sortiert und animiert, aber strukturell wie 2015.

Drei mögliche Ursachen, keine bestätigt:

1. **Zu brav.** An jeder Stelle wurde Lesbarkeit über Wirkung gestellt.
   Korrekt und langweilig.
2. **Zu flach.** Keine Tiefe, kein Raum, kein 3D. Der Körper in E ist eine
   SVG-Silhouette, kein Objekt.
3. **Zu sehr Dashboard.** Alle zeigen Zahlen, die man schon kennt. Nichts
   fühlt sich an, als würde ein System mitarbeiten — bei einem Produkt, dessen
   Kern ein AI-Companion ist, womöglich das Fehlende.

### Was die nächste Sitzung tun sollte

**Nicht sofort weiterbauen.** Sechs Versuche ins Blaue sind nicht besser als
fünf. Zuerst einen Anker holen:

> Tom um zwei bis drei Referenzen bitten — Produkte, Filme, Oberflächen, die
> den Eindruck treffen. **Ausdrücklich nicht aus dem Gesundheitsbereich.**
> Gerade wenn es woanders herkommt, ist es brauchbarer.

Erst danach bauen, dann gezielt statt geraten.

### Messbefund, der unabhängig davon gilt

`[cmd]` Alle elf Akzenttokens liegen bei **L = 0,74 bis 0,80** und
unterscheiden sich fast nur im Farbton. Medizin und Supplemente liegen zehn
Grad auseinander, Marketplace und Erholung fünfzehn.

`[read]` Farben bleiben bei eingeschränkter Farbwahrnehmung nur unterscheidbar,
wenn sich die **Helligkeit** unterscheidet. Kategorische Paletten sollten
höchstens sieben Farben umfassen.

Dazu: `--pos` liegt bei L = 0,78, exakt auf Akzenthöhe — Statuszeichen und
Modulakzent sind per Helligkeit nicht trennbar.

**Das ist ein Befund zur Grundpalette, kein Themeproblem, und er gehört vor
jede Themeentscheidung.** Vollständig in
`docs/spezifikation/10-plattform/design-system/00-diskussionsstand.md`.

---

## 6. Todo-Liste — wo wir stehen

`docs/todo/TODO.md`, **60 Punkte, 44 offen, 31 erledigt**, fünf Sektionen:
A Struktur, B Entwicklungsumgebung, C Produkt, D Datenbank, E Legacy-Cloud.

### Kritischer Pfad

| | Stand |
|---|---|
| **M1 Datenzugriffsschicht** | **erledigt** |
| **M2 Frontend-Fundament** | **halb** — die fünf designneutralen Bibliotheken sind drin (zod, TanStack Query, react-hook-form, date-fns, idb), die fünf designtragenden hängen an A-06 |
| **M3 Erster Schreibpfad** (C-02) | startbereit — Product Gate offen, Tabellen da, `auth.uid()` liefert jetzt einen Wert |
| **M4 Cloud-Deployment** | wartet auf E-06 |

### Was als Nächstes sinnvoll ist

**Ohne Toms Entscheidung machbar:**

- **M3 / C-02** — Preferences-Schreibpfad. Der natürliche nächste Bauschritt.
  `food_preferences` und `food_preference_items` existieren mit
  `auth.uid()`-Policies, Formularbibliothek und Schemastelle liegen seit M2.
- **C-09** — Test-Runner. `[cmd]` 11 Testdateien in `apps/web`, kein vitest
  oder jest im Repo, `turbo run test` läuft ins Leere. Ohne ihn prüft keine
  Pipeline etwas ausser der Typprüfung.
- **B-04 / B-05** — PreToolUse-Hook neu bauen: stdin-JSON statt `param()`,
  Matcher `Write|Edit|Read`, **Exit-Code 2** (nicht 1), mit BOM, ohne Emoji.
  Die beiden alten Hookdateien sind zielos, seit `system/` archiviert ist.
- **CLI-Update** 2.75 → 2.111. `major_version = 17` ist in `config.toml`
  festgeschrieben, ein Sprung auf Postgres 18 ist ausgeschlossen. Vorher
  Sicherung, danach `v060`/`v070`/`v090` und die Anmeldung prüfen.

**Braucht Tom:**

- **A-06 Design** — siehe Abschnitt 5. Blockiert die halbe Hälfte von M2.
- **B-10 ijfw-Plugin** — `[cmd]` schreibt selbsttätig in `CLAUDE.md` (3 Zeilen)
  und `AGENTS.md` (104 Zeilen). Blockiert A-02, weil eine ausgedünnte
  `CLAUDE.md` wieder befüllt würde. **Seit vier Tagen offen, deshalb sind die
  beiden Dateien dauerhaft im Working Tree.**
- **E-06 Cloud-Instanz** — `LumeOS-V2` als Produktion übernehmen, oder neu
  aufsetzen? `[cmd]` 15 GB Trainingsmedien im Bucket, 10.776 Objekte.
  Blockiert die Vorschau-Umgebung.
- **A-05 Löschliste** — liegt fertig in `docs/_archive/` mit `-WhatIf`.
  16,5 GB. `temp/lumeosold/` ist ausgenommen, der Dump ist gesichert.

### Nützlich zu wissen

`[cmd]` Unter `temp/lumeosold/backups/` lag ein Produktionsdump der
Vorgängerinstanz vom 2026-03-05, gesichert nach
`backup/legacy-v2/lumeos_v2_prod_20260305.zip`. Er enthält `exercises` (~1.448
Übungen mit vollständigen Anleitungen und Tipps), `exercise_muscles` (6.398
Zuordnungen), `equipment`, `muscle_groups` **und `storage.objects`** — also die
vollständige Verknüpfung Übung zu Mediendatei, lokal.

**Damit sind E-01 bis E-04 ohne Zugriff auf die Cloud-Instanz beantwortbar.**

---

## 7. Was ich in diesen drei Tagen falsch hatte

Zur Einordnung, damit die nächste Sitzung dieselben Fehler nicht wiederholt:

- `services/` und `packages/` seien leer — aus der Projektanweisung übernommen,
  ohne zu prüfen. Es waren 17 kompilierende Packages.
- Die Datenbank sei nicht reproduzierbar — die Kette lag vollständig in
  `docs/project/p1-005/` und `tmp/`.
- `tmp/` und `temp/` als Müll eingeordnet — beide enthielten unersetzliche Daten.
- Die drei Slice-Migrationen seien idempotent — `[cmd]`-markiert, aber nur ein
  Lauf getestet. Zwei scheitern im Zweitlauf.
- `httpOnly: true` als Cookie-Vorgabe — die Voreinstellung von
  `@supabase/ssr` ist `false`, und `true` würde den Browser-Client aussperren.
- Mojibake in `packages/shared/src/supabase/client.ts` — war ein
  Konsolen-Anzeigefehler, die Datei ist sauber.
- Zweimal `git commit` ausgeführt, während fremde `git mv`-Umbenennungen im
  Index lagen.

Gemeinsamer Nenner: **aus der Existenz einer Sache auf ihre Funktion
geschlossen**, statt sie auszuführen. Die Marker-Regel adressiert genau das.
