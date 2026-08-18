# Erledigt — LumeOS

Ausgelagert aus `docs/todo/TODO.md` am 2026-08-14 (Anker `7b5e631`).
Der Wortlaut ist unveraendert uebernommen; nichts wurde gekuerzt.
Gegenstandslose und zusammengefuehrte Punkte stehen ebenfalls hier und
sagen im Text, dass sie **nicht** durch Umsetzung geschlossen wurden.

Die offenen Punkte stehen in `docs/todo/TODO.md`.

---

## A — Struktur & SSOT (laufend)

- [x] **A-01: SSOT-Ordner aufbauen** (`docs/ssot/`)
  1. [x] `00-INDEX.md` — Einstieg, Marker-Legende, Rangfolge
  2. [x] `10-workspace.md` — Inventar 59 Verzeichnisse, 17 lebend
     (2026-08-01 präzisiert: Entfernbarkeits-These um `system/`-Verbund eingeschränkt)
  3. [x] `11-zielarchitektur.md` — 5 Apps + Services aus den Specs abgeleitet
  4. [x] `20-apps-web-ist.md` — Routen, Fachlogik, Stack-Lücke
  5. [x] `30-datenbank.md` — zweite Fassung mit verifiziertem Container-Zustand
  6. [x] `40-spec-code-matrix.md` — je Modul Spec/Code/Delta + Bau-Reihenfolge
  7. [x] `50-governance-rest.md` — was physisch bleibt und was Entfernung kostet

- [x] **A-02: `CLAUDE.md` ausdünnen** — **erledigt 2026-08-06
  (Block 9):** `[cmd]` 122 → 60 Zeilen. Enthält bewusst keinen
  Repo-Zustand mehr — nur Rolle, Verweistabelle auf
  SSOT/TODO/Spezifikation/READMEs und Schreibregeln (ergänzt um Marker-
  und Wegwerf-DB-Regel). Der historische Fehlersatz „Keine Writes, kein
  Auth“ steht nur noch als zitierte Warnung, warum Zustandssätze dort
  verboten sind. ijfw-Restmarker entfernt (B-10), gstack auf zwei
  Verhaltensregeln gekürzt. D-07 ist damit für CLAUDE.md abgearbeitet.

- [x] **A-03: Altlast archivieren** — **erledigt (festgestellt im Audit
  2026-08-05):** `[cmd]` `docs/todos/`, `docs/governance/` und
  `docs/ist-zustand/` sind leer; `docs/_archive/` enthält governance/,
  ist-zustand/, project/, todos/ samt Löschliste. Der Governance-Teil von
  `docs/project/` ist verschoben; verblieben sind dort Produkt- und
  GSTACK-Dokumente.

- [x] **A-04: `BrainstormDocs/_ARCHIVE_NOTICE.md` korrigieren** — **erledigt
  (festgestellt im Audit 2026-08-05):** `[cmd]` die Notice verweist bereits
  auf `docs/ssot/00-INDEX.md`, `docs/spezifikation/00-INDEX.md` und
  `docs/todo/TODO.md`; die drei bemängelten Altlast-Verweise kommen nicht
  mehr vor (0 Treffer).

- [x] **A-07: ADR Servicelayer** — **erledigt 2026-08-04: Entscheidung
  getroffen.** `[cmd]` `docs/spezifikation/90-entscheidungen/ADR-0001-datenzugriff.md`
  existiert (Tom, parallel). Direkter Datenbankzugriff als Regel, Services als
  begründete Ausnahme — mit M1 Teil C real umgesetzt (supabase-js + rpc());
  die alte Neun-Services-Architektur ist mitsamt dem Governance-Cluster
  archiviert (`_archive/governance/`, Commit 59cb41e).
  Ursprungsbefund: zwei Architekturen lagen nebeneinander — Altbestand neun
  Hono-Services mit eigenen Ports und JWT-Middleware, gebaut war direkter
  Zugriff. RLS gilt für jeden Zugriffsweg, Middleware nur für den eigenen.

- [x] **A-09: Root-README sanieren** — **erledigt 2026-08-06 (Block 9):**
  `[cmd]` 73 Zeilen, vollständig neu geschrieben: Produktbeschreibung mit
  ehrlichem Ist (echt vs. Attrappe), Loslegen-Sequenz für den frischen
  Klon, Strukturübersicht, Verweise auf SSOT/Konventionen. Spark-Tabelle,
  Brain/Law/Muscle und `system/`-Verweise restlos raus (0 Treffer).
  Gate-Sektion (B-14) inhaltlich geprüft und erhalten, ergänzt um den
  Hinweis auf den protect-paths-Hook samt gewolltem `.env`-Lese-Block.

- [x] **A-10: Restaltlast im Wurzelverzeichnis** — **erledigt 2026-08-13
  (Block 23).** Die Hauptrunde lief in Block 15 (`COMMANDS.md`,
  `SESSION_ONBOARDING.md`, `STACK_REFERENCE.md`, `CLAUDE.md.v1.bak` nach
  `_archive/governance/wurzel-altlast/`); hier der Rest.

  **Archiviert, per `git mv`** (Historie bleibt, `git revert` holt sie
  zurück) — Einzelbegründung in
  `_archive/governance/wurzel-altlast/README.md`:
  - `artefakt.json` (2.677 B) — `[cmd]` **Testausgabe** des
    Governance-Compilers vom 2026-04-23 (`wo_id: "test-001"`), kein
    Konfigurationsfile. Zielt auf `packages/agent-core/src/registry.ts`;
    `[cmd]` das Paket existiert nicht mehr, alle Leser liegen im Archiv.
  - `.cursorrules` (734 B) — Cursor-Editor-Konfiguration mit dem
    lean-ctx-Block. `[cmd]` Ältere Teilkopie von
    `.claude/rules/lean-ctx.md` (14 gegen 33 Zeilen; die zehn Lesemodi
    fehlen). Cursor wird hier nicht benutzt — die Datei konnte nur noch
    auseinanderdriften.

  **Bleibt liegen, mit Grund:** `.pdrignore` (26 B). `[cmd]` Angelegt am
  2026-07-31 von einem externen Projekt-Scanner (Commit
  `chore(pdr): exclude local env backup from project scan`); der Inhalt
  ist ein einzelner Ausschlusspfad. Kein Leser **im Repo** — aber das
  Werkzeug läuft ausserhalb, und ob Tom es noch benutzt, lässt sich hier
  nicht feststellen. 26 Bytes rechtfertigen kein Abschalten fremder
  Konfiguration auf Verdacht. *Aus der Existenz folgt keine Funktion —
  aber aus der fehlenden Fundstelle im Repo auch keine Funktionslosigkeit
  ausserhalb.* Entscheidung Tom.

  **Nicht mehr offen:** `AGENTS.md` (Block 15 geprüft und saniert, kein
  Altlastfall), `project.profile.json` (bereits früher entfallen),
  `.codex-governance-ui.log` (`[cmd]` existiert nicht mehr).

---

- [x] **A-14: i18n einführen und fortlaufend pflegen** (neu 2026-08-17).
  **Vor jedem weiteren Oberflächenauftrag.**

  **Tom, 2026-08-17:** *„Ich sehe ein Mischmasch an Sprachen. Wir müssen
  sofort das i18n-Konzept mit einbinden und fortlaufend pflegen bei der
  Entwicklung."*

  `[cmd]` Die Oberfläche mischt heute in derselben Zeile: Tabs
  `Diary · Insights · Nutrients · Food DB`, darunter `Mahlzeiten
  erfassen · Fruehstueck · Positionen`. **In `apps/web` gibt es keine
  i18n-Schicht.**

  ### Die Regel

  **Englisch und Deutsch werden befüllt.** Thai wird **vorgesehen** und
  bei Bedarf nachgezogen — dafür wird ein Übersetzungsauftrag vergeben.

  **Jeder neue Text geht durch die Schicht**, ab sofort. Kein Text mehr
  fest in einer Komponente.

  ### Das Vorgängerrepo hat es vollständig

  `[cmd]` `referenz/lumeos-2026/src/i18n/`:

  | | |
  |---|---|
  | `translations/de.ts` | **55 KB** |
  | `translations/th.ts` | **50 KB** — Thai ist zu grossen Teilen übersetzt |
  | `translations/en.ts` | 31 KB |
  | `useTranslation.ts` | **Eigenbau**, keine Bibliothek |
  | `apps/admin/…/i18n/page.tsx` | 12 KB — **Verwaltungsoberfläche für Übersetzungen** |

  `[cmd]` Durchgehend in allen Modulen benutzt. **Englisch ist dort die
  dünnste Sprache**, nicht Deutsch.

  ### Zu entscheiden, bevor gebaut wird

  - **Eigenbau übernehmen oder Bibliothek?** `[cmd]` Der Vorgänger hat
    einen eigenen `useTranslation`; `apps/web` ist Next.js App Router,
    wo `next-intl` verbreitet ist. **Der Eigenbau ist erprobt und
    schemafrei** — die Bibliothek bringt Routing je Sprache mit.
  - **Wohin die Sprache des Nutzers?** `[cmd]` `public.profiles` trägt
    seit GO-01 sechs Felder; eine `locale`-Spalte wäre die siebte.
  - **Was mit den 50 KB Thai?** Sie sind für ein anderes Schema
    geschrieben — **prüfen, wie viel übertragbar ist**, bevor jemand neu
    übersetzt.
  - **Und die Datenbank?** `[cmd]` `nutrition.foods` führt `name_de`,
    `name_en`, `name_th` und `name_display_de`, `name_display_en`,
    `name_display_th` — **`name_th` ist bei allen 7.140 leer.** Die
    Struktur steht, die Inhalte fehlen. Das ist ein eigener Punkt.

  ### Sprachauswahl in Settings

  Teil dieses Punktes. `[cmd]` `/v2/settings` steht seit GO-01; die
  Auswahl gehört dorthin.

  `[cmd]` **Erledigt 2026-08-17.** next-intl, **ohne Sprachpraefix in der
  Adresse** — `localePrefix: 'never'`, die Sprache kommt aus einem
  Cookie, die Adresse bleibt `/v2/nutrition`.

  `[read]` **Kein Behelf:** next-intl fuehrt dafuer einen eigenen
  Betriebsmodus samt Beispielanwendung. Was es kostet: kein Deep-Link je
  Sprache, nichts fuer Suchmaschinen (bei einer angemeldeten Anwendung
  folgenlos), Seiten je Anfrage gerendert — beide umgestellten sind
  ohnehin `force-dynamic`. **Was es spart:** Mit Praefix haette G-07
  zweimal umgebaut werden muessen. Und die Sprache gehoert zur Person,
  nicht zur Seite — sonst gaebe es zwei Wahrheiten.

  ### Aus dem Vorgaengerrepo

  `[cmd]` **961 Blattschluessel je Sprache, 17 Namensraeume — und Thai
  vollstaendig**, dieselbe Zahl wie Deutsch und Englisch. Der Aufbau
  passt direkt auf next-intl, nur TS-Objekt statt JSON.

  `[cmd]` Fuer die zwei umgestellten Seiten: **19 Werte uebernommen, 76
  neu geschrieben** — nicht wegen Qualitaet, sondern wegen anderem
  Zuschnitt (eingefrorene Naehrwerte und Portionsschnappschuss gab es
  dort nicht). **942 Schluessel liegen bereit** — fuer Thai der einzige
  vorhandene Bestand.

  ### Die Pruefung

  `[cmd]` `tools/i18n-pruefen.mjs`, in `pnpm gate` vor Turbo, **8 Tasks
  unveraendert.** Dreimal zum Fehlschlagen gebracht: Schluessel aus `en`
  entfernt → rot; Schluessel nur in `en` → rot in Gegenrichtung; Wert
  auf `''` → rot als leer. **Nachgeprueft:** Exit 1 mit Angabe des
  fehlenden Schluessels, danach Exit 0.

  `[cmd]` **Thai wird gezaehlt, nicht erzwungen:** `th: 0 von 95 belegt`.

  ### Nachweis

  `[cmd]` Umschalten in der Kopfzeile: *Einstellungen/Angegeben/
  Referenzwerte* → *Settings/Specified/Reference values*, `lang` folgt,
  **die Adresse bleibt `/v2/settings`**, ueberlebt das Neuladen. Thai
  faellt sichtbar auf Deutsch zurueck. Die Attrappenkacheln bleiben
  englisch, wie verlangt.

- [x] **A-05: Repo-Müll entfernen** (untracked) — **neu erhoben
  2026-08-13 (Block 23); die Audit-Liste von 2026-08-05 war überholt.**
  `[cmd]` **10 der 12 Bestände sind bereits weg** (`tmp/`,
  `.wayland-core/`, `.wayland/`, `.ijfw/`, `ijfw/`, `_tmp_inventory/`,
  `backup_system.zip`, `services.zip`, `system.zip`,
  `.codex-governance-ui.log`). Übrig sind **zwei**, und beide bleiben —
  mit Begründung:

  **`temp/` — entschieden 2026-08-12 (Tom): `lumeosold` wird als Referenz
  gebraucht.** Der Vorgänger enthält Ansätze und Funktionen, die in den
  Neubau einfliessen sollen. Umgezogen nach `referenz/lumeos-2026/`, weil
  der Name `temp` das Verzeichnis zweimal beinahe gekostet hätte:
  in Block 15 lagen darin 13,11 GB Übungsmedien (jetzt unter `media/`),
  in Block 23 kam heraus, dass es ein vollständiges Git-Repository ist.

  `[cmd]` Nach dem Umzug unverändert: Remote
  `github.com/dev-lumeos/lumeos-2026.git`, 27 lokale Branches,
  **22 Stashes**, **16 nicht gepushte Commits auf `dev`** und 3 weitere
  auf `feature/supabase-migration-v2`, letzter Commit 2026-03-24.
  Stashes werden nie gepusht — sie existieren ausschliesslich in dieser
  Arbeitskopie, und kein Zip enthält sie.

  `referenz/README.md` hält fest, was der Ordner ist und was vor jedem
  Aufräumen dort zu sichern wäre. `.gitignore` lässt nur diese README
  durch; `[cmd]` Gegenprobe: `lumeos-2026` ignoriert, README sichtbar.

  **Weiterhin offen, nicht dringend:** Die 19 ungepushten Commits und
  22 Stashes sind nicht gesichert. `git push` der betroffenen Branches
  oder ein `git bundle create … --all` würde das erledigen — Toms
  Entscheidung, ob und wann.

  `temp/` trägt jetzt noch `antigravity-awesome-skills-main/`
  (171 MB, 13.160 Dateien) — `[cmd]` ein heruntergeladener öffentlicher
  Skill-Katalog ohne `.git`, jederzeit neu ladbar. Löschbar, aber auch
  nicht im Weg.

  **`nul` (99 B) — bleibt, Kuriosität.** `[cmd]` Inhalt: eine deutsche
  Fehlermeldung von `TASKKILL` vom 2026-04-23. Eine Windows-Shell hat
  stderr in eine Datei mit dem reservierten Gerätenamen `nul`
  geschrieben, statt sie zu verwerfen. `[cmd]` **git stört sich nicht
  daran**: `.gitignore:24` listet `nul`, die Datei taucht weder als
  getrackt noch als untracked auf. Löschen bräuchte den
  `\\?\`-Pfadpräfix; der Nutzen wäre null, das Risiko ein Fehlgriff im
  Wurzelverzeichnis.

  *Regel bleibt: jeder untracked Ordner wird vor Löschung inhaltlich
  geprüft, nicht nur dem Namen nach — dieser Punkt ist zweimal das
  Beispiel dafür gewesen.*

  `[cmd]` **Erledigt 2026-08-16**, Commit `e76db63`. Der Arbeitsbaum ist
  sauber: **0 untracked, 0 modified.**

  Ignoriert werden jetzt: Toms skua-Installation (`.claude/commands/`,
  `hooks/`, `skills/`, `.skua/`, `.tickets/`, `skua.config.json`), die
  Kettenlauf-Sicherungen (`backup/schema/*_c43_vor_kettenlauf.sql` —
  `[cmd]` 29 an einem Tag), die Hilfsskripte des Orchestrators
  (`backup/_*.py`) und `docs/design-system-analysis/`.

  `[cmd]` **Eine Warnung steht in der Datei:** `.claude/hooks/` und
  `.claude/skills/` enthalten beides — **74 Projekt-Skills sind bereits
  getrackt und bleiben es**, weil `.gitignore` auf getrackte Dateien
  nicht wirkt. Nur Neues dort wird ignoriert; ein neuer Projekt-Skill
  braucht `git add -f`.

- [x] **A-17: Datenherkunft, bevor die Geraete kommen** (neu
  2026-08-17). **Architekturpunkt, betrifft alle Messtabellen.**

  **Tom, 2026-08-17:** *„Als Ausbaustufe bedenken: wir werden
  Anbindungen fuer alle Gadgets anbieten, sprich wir werden viele Daten
  kriegen."*

  ### Drei Dinge aendern sich

  **1. Die Herkunft muss am Wert stehen.** `[cmd]` Heute weiss niemand,
  ob ein Gewicht getippt oder von einer Waage kam.

  `[read]` **Und das ist keine Formalie:** Eine BIA-Waage und die
  Navy-Formel liefern fuer denselben Menschen **8 bis 10 Prozentpunkte
  Unterschied**. Die Empfehlung aus der Recherche lautet ausdruecklich:
  *niemals BIA gegen Navy vergleichen, nur BIA gegen BIA.* **Ein Verlauf
  aus gemischten Quellen zeigt Spruenge, die niemand erlebt hat.**

  **2. Die Menge aendert die Struktur.** `[cmd]` `recovery.checkins`
  haelt heute einen Eintrag je Tag — 36 Zeilen. **Ein Wearable liefert
  HRV im Minutentakt.** Das ist eine andere Tabelle mit anderen Indizes,
  und die Tagesansicht liest dann eine Verdichtung, keine Rohwerte.

  **3. Konflikte werden zur Regel.** Zwei Quellen, ein Tag, zwei Werte.
  **Wer gewinnt, muss festgelegt sein, bevor es passiert** — nicht,
  wenn der erste Nutzer sich beschwert.

  ### Was jetzt schon zu tun ist

  **Jede neue Messtabelle traegt eine Herkunft**, auch solange nur
  `manuell` vorkommt. `[cmd]` Betroffen: `body_measurements`,
  `body_circumferences`, `recovery.checkins`,
  `training.workout_sessions`, `nutrition.water_logs`.

  `[read]` **Nachtraeglich ist es teuer:** Eine Spalte hinzufuegen ist
  billig, aber tausend Zeilen ohne Herkunft bleiben fuer immer
  uneindeutig — `[cmd]` genau die Lage, die bei `locale` vermieden
  wurde, wo `NULL` von `de` unterscheidbar bleiben musste.

  ### Was das Vorgaengerrepo dazu hat

  `[cmd]` **Zu pruefen** — der Fundus nennt HRV und Readiness mit 30
  Fundstellen (`useRecoveryIntel.ts`, `RecoveryIntel.ts` mit 26 KB).
  **Ob dort eine Geraeteanbindung existierte, ist ungeprueft.**

  `[cmd]` **Erledigt 2026-08-18**, Kettenschritt `017`, **59 Schritte**
  in der Kette. **Sieben Tabellen**, alle Bestandszeilen auf `manual`,
  **Zeilenzahlen unveraendert**: `meals` 687, `meal_items` 2.099,
  `water_logs` 299, `checkins` 36, `workout_sessions` 9, `workout_sets`
  60, `intake_logs` 4.

  `[cmd]` Erlaubt sind `manual`, `device`, `import`, `admin`, `seed` —
  **dem Goals-Muster gefolgt**, das GO-14 gesetzt hat. Der abgeleitete
  Navy-Wert liefert weiter `source = derived_navy`.

  ### Die Benennung ist genauer als beauftragt

  `[cmd]` Die Spalten heissen **`entry_source`** und
  **`measurement_source`**, nicht `source`. Und `meal_items` traegt
  **`food_source` neben `measurement_source`**:

  `[read]` *„Herkunft des Mahlzeit-Containers. Nicht verwechseln mit
  `meal_items.food_source`."* — **Die Herkunft des Lebensmittels ist
  etwas anderes als die der Mengenangabe.** `workout_sets` hat
  zusaetzlich `logged_via` fuer den Bedienweg (`manual`/`voice`/`auto`).

  `[read]` **Der Orchestrator suchte nach `source` und fand nichts** —
  ein Beleg dafuer, dass eine Pruefung am erwarteten Namen scheitert,
  nicht an der Sache. *Aus der Existenz einer Sache folgt nicht ihre
  Funktion — und aus ihrem Fehlen unter einem Namen nicht ihr Fehlen.*

## B — Entwicklungsumgebung & Absicherung

- [x] **B-12: Cookie-Bereich über Apps hinweg** — **entschieden und
  umgesetzt 2026-08-12 (Blöcke 21/22).** Tom hat **Weg B** gewählt:
  `apps/admin` führt eine **eigene Sitzung**, kein geteiltes Cookie über
  `.lumeos.app`. `domain` bleibt an keiner Stelle gesetzt.

  **Der Grund, der den Ausschlag gab:** Weg A hätte `domain`
  umgebungsabhängig gesetzt — `[cmd]` auf `localhost` nicht setzbar (ein
  `domain`, das nicht zum Host passt, verwirft der Browser), in
  Produktion zwingend. *Ein Weg, der lokal anders funktioniert als in
  Produktion, ist ein Weg, den niemand wirklich testet.* Weg B verhält
  sich überall gleich. Zweitens öffnet ein Cookie aus dem Produktbereich
  die Verwaltung damit nicht — strenger, nicht nur einfacher.

  **Umsetzung über den NAMEN statt über `domain`:**
  `packages/shared/src/supabase/cookie-name.ts` bildet
  `sb-<projekt-ref>-<scope>-auth-token`, das Kürzel kommt aus
  `NEXT_PUBLIC_AUTH_COOKIE_SCOPE` je App. Eine Umgebungsvariable und kein
  Parameter, weil `[cmd]` 14 Dateien die Client-Fabriken aufrufen — eine
  vergessene Stelle fiele still auf den geteilten Namen zurück.
  **Der Umgebungsteil bleibt abgeleitet**, sonst kollidierten lokale und
  Cloud-Sitzung derselben App. `apps/web` behält seinen Namen: getrennt
  sind die beiden, sobald **eine** einen eigenen trägt.

  `[cmd]` **Gemessen aus den `set-cookie`-Kopfzeilen** der laufenden
  Apps, nicht aus dem Code geschlossen: `web` setzt `sb-127-auth-token`,
  `admin` setzt `sb-127-admin-auth-token` — disjunkt. Wirkung in beide
  Richtungen belegt (je `307 -> /login` in der fremden App, `200` in der
  eigenen). Wiederholbar:
  `supabase/_pipeline/_validierung/cookie-trennung-pruefen.mjs`.

  **Nebenwirkung, damit niemand rätselt:** Wer in `apps/admin` angemeldet
  war, muss sich **einmal neu anmelden** — das alte Cookie liegt noch im
  Browser, wird aber nicht mehr gelesen. `apps/web` ist nicht betroffen.

  **Spezifikation nachgezogen:** `[read]` `auth-sso` beschrieb geteilte
  Sitzungen für alle Apps. Die Datei ist `status: entwurf` (0.1) und
  verwies für genau diese Frage selbst auf B-12 — die Änderung folgt dem
  vorgesehenen Weg. Jetzt 0.2 mit neuem §4a, eingeschränktem AK-5 und
  neuem **AK-6** (web-Sitzung wirkt nicht in `admin`).

  **Was von diesem Punkt NICHT erledigt ist:** das produktionsnahe
  Nachbilden mit `hosts`-Einträgen und Zertifikaten. Es wird für die
  Trennung von `admin` nicht mehr gebraucht — dafür ist gerade der Punkt,
  dass Weg B keinen umgebungsabhängigen Sonderweg hat. Für die
  **geteilte** Sitzung im Produktbereich (AK-1, AK-5) bleibt es offen und
  ist `[cmd]` derzeit ohnehin nicht prüfbar: `apps/buddy` und
  `apps/coach` tragen je eine `.gitkeep`, `apps/marketplace` existiert
  nicht. Wiedervorlage mit der zweiten Produkt-App — als **B-25**
  geführt, damit es nicht in einem erledigten Punkt verschwindet.

  Ursprünglicher Punkt (neu 2026-08-03):

  `[cmd]` **Ist-Zustand: `domain` wird an keiner der vier Stellen
  gesetzt** (`packages/shared/src/supabase/{client,session}.ts`, beide
  Middlewares). Lokal teilen sich 3200 und 3210 die Sitzung nur deshalb,
  weil Cookies nach **Host** getrennt werden und nicht nach Port — beide
  sind `localhost`. **Das sieht aus wie funktionierendes SSO und prüft
  die Produktionsannahme gerade nicht:** dort sind `lumeos.app` und
  `admin.lumeos.app` verschiedene Hosts.

  **Zwei Wege, beide mit Preis** (Details in der Vorlage):
  **A** geteilte Sitzung über `.lumeos.app` — bequem, aber ein
  gestohlenes Cookie öffnet auch die Verwaltung, und die Einstellung
  muss umgebungsabhängig sein (`[cmd]` ein `domain`, das nicht zum Host
  passt, wird vom Browser verworfen — lokal schlüge die Anmeldung fehl).
  **B** getrennte Anmeldung für `admin` — eine Anmeldung mehr, dafür kein
  umgebungsabhängiger Sonderweg und dieselbe Haltung wie `[read]`
  `20-apps/web` §6 (admin wird bewusst nicht verlinkt).
  **Empfehlung:** B für `admin`, A für den Produktbereich.

  **Zum lokalen Nachbilden** (der ursprüngliche Kern dieses Punktes):
  nötig wären `hosts`-Einträge und Zertifikate. `[cmd]` Das ist eine
  Änderung an Toms System, nicht am Repo — **nicht ausgeführt**. Die
  Vorlage nennt, was nötig wäre, und sagt auch, was ein solcher Test
  **nicht** belegt (kein HTTPS, andere Ports): der belastbare Nachweis
  ist die erste Umgebung mit echten Subdomains.

  Ursprünglicher Punkt: Hosts-Einträge `web.lumeos.local`,
  `buddy.lumeos.local` und weitere, dazu lokale Zertifikate (mkcert), damit
  das geteilte Cookie auf einer echten Domain liegt.
  *Grund:* Das app-übergreifende Weiterreichen der Session über `.lumeos.app`
  ist auf `localhost` nicht nachstellbar — dort gibt es keine Subdomains im
  Cookie-Sinn. Solange nur `web` läuft, testet der Aufwand etwas, das niemand
  nutzt; ab der zweiten App ist es die einzige Möglichkeit, SSO vor dem
  Deployment zu prüfen.
  `[read]` Die Cookie-Einstellungen selbst brauchen keinen Sonderweg:
  `Secure` gilt auch auf localhost, weil lokale Adressen als
  vertrauenswürdig zählen. Entschieden in
  `docs/spezifikation/30-module/core/login/00-modul-login.md`.

- [x] **B-13: `site_url`/Rückleitadressen** — **erledigt 2026-08-13
  (Blöcke 23/24).** Domains entschieden, Ableitung gebaut, lokale Lücke
  geschlossen. Vollständig in `docs/ssot/39-rueckleitadressen.md`.

  **Domains (Tom, 2026-08-13):** `www.lumeos.app` Landingpage ·
  `web.lumeos.app` die Webversion · `admin.lumeos.app` Verwaltung ·
  `coach` / `marketplace` / `buddy` je `<app>.lumeos.app`.
  **Die Altfrage „`lumeos.app` oder `app.lumeos.app`" ist damit
  beantwortet: weder noch** — und die Landingpage ist **keine App mehr**,
  sondern eine eigene Domain ohne Anmeldung.

  **Lücke geschlossen:** `[cmd]` `additional_redirect_urls` kannte nur
  Port 3200; `apps/admin` (3210) fehlte. Ergänzt in `supabase/config.toml`,
  das Erzeugungsskript meldet seither **Exit 0** (vorher 1 — es hatte die
  Lücke selbst gefunden).
  **Noch nicht in Kraft:** `[cmd]` der laufende Auth-Container trägt
  weiterhin nur 3200 (`GOTRUE_URI_ALLOW_LIST`) — `config.toml` wird beim
  **Start** gelesen. `supabase stop && supabase start` ist ein Eingriff in
  die laufende Instanz und wurde nicht ausgeführt. Folgenlos, solange nur
  `signInWithPassword` benutzt wird; vor der ersten E-Mail- oder
  OAuth-Anmeldung in `apps/admin` nötig.

  **Pflegeort = Ableitung.** `scripts/redirect-urls-erzeugen.mjs` liest
  Port, Callback-Route und Existenz aus dem Dateibaum; **nur die Domain**
  ist eine gepflegte Tabelle im Skript, ausdrücklich als Entscheidung
  markiert. Vier Zustände (**gebaut** / Gerüst / geplant / Landingpage)
  sorgen dafür, dass es nicht rot wird für Apps, die es nicht gibt:
  `[cmd]` heute erzeugen nur `web` und `admin` einen Eintrag, `buddy`,
  `coach` und `marketplace` erscheinen als „geplant, nicht gebaut".
  Umgebung als Parameter (`--umgebung produktion`), aber `main`
  existiert nicht — es wird nur eingetragen, was da ist.

  **Warnung festgehalten:** ein Platzhalter `*.vercel.app` in der
  Redirect-Liste öffnet sie für **jedes fremde Vercel-Projekt** — wer
  dort eines anlegt, fängt den Rückweg samt Auth-Code ab. Steht im Skript
  und in §6 der Vorlage, damit es niemand später aus Bequemlichkeit tut.

  **Was ausdrücklich NICHT zu diesem Punkt gehört:** die Einträge im
  Supabase-Dashboard. Sie können erst gesetzt werden, wenn es eine
  Cloud-Instanz für den Neubau gibt — **das ist E-08**, nicht B-13. Was
  einzutragen ist, liegt fertig vor.

  **Spezifikation nachgezogen** (Widerspruch gefunden, nicht stumm
  überschrieben): `auth-sso` §4 führte `web` unter `lumeos.app` mit dem
  Zusatz „offen (Landingpage)" — App und Landingpage waren dieselbe
  Adresse. Ebenso `20-apps/web` §2 („`web` ist die einzige App mit
  öffentlichem Teil"). Beides berichtigt, dazu `00-INDEX.md` und die
  Ports-Tabelle in den Konventionen.

  Ursprünglicher Punkt — der Kern war seit M3 erledigt: `[cmd]`
  `supabase/config.toml` steht auf `http://localhost:3200` +
  `/auth/callback`, die Anmeldung läuft; der frühere Zustand
  (127.0.0.1:3000, „blockiert jeden Anmeldeversuch") ist überholt.
  **Pflegeort geklärt und gebaut, Produktions-URLs vorgelegt
  (2026-08-13, Block 23):** `docs/ssot/39-rueckleitadressen.md`.

  **Der Pflegeort ist kein Ort, sondern eine Ableitung.** Eine
  handgeführte Liste veraltet — B-22 in anderer Gestalt. Deshalb
  `scripts/redirect-urls-erzeugen.mjs`: es liest **Port** aus
  `apps/*/package.json` und die **Callback-Route** aus dem Dateibaum,
  erzeugt die Liste daraus und **vergleicht sie mit `config.toml`**
  (Exit 1 bei Abweichung). Eine neue App bringt beides mit; die Liste
  wächst von selbst.

  **Dabei eine Lücke gefunden.** `[cmd]` `additional_redirect_urls`
  enthält nur Port 3200 — `apps/admin` (3210) fehlt, obwohl es seit
  Block 19 eine eigene Callback-Route hat. **Heute folgenlos**, und der
  Grund gehört dazu: `[cmd]` eine Passwort-Anmeldung liefert `HTTP 200`
  ohne jeden Eintrag, weil `signInWithPassword` die Redirect-Liste gar
  nicht benutzt — nur `emailRedirectTo` (Registrierung) und OAuth tun
  das, und `apps/admin` hat beides nicht. Sobald dort eine
  Passwort-Zurücksetzung, eine Einladung oder OAuth dazukommt, schlägt
  es fehl. **Nicht eingetragen** — `config.toml` zu ändern wirkt auf die
  laufende Instanz und braucht Freigabe; das Kommando liegt in §5 der
  Vorlage.

  **`safe-redirect.ts` ersetzt die Liste nicht.** `[cmd]` Die beiden
  schützen verschiedene Sprünge: `safe-redirect.ts` den app-internen
  (`?redirect=`, in unserem Code), die Supabase-Liste den Rücksprung
  **von Supabase in die App** (E-Mail-Link, OAuth) — der passiert, bevor
  unser Code läuft. Eines davon zu streichen liesse einen Weg offen.

  **Offen bleibt allein, was nur Tom entscheiden kann** (§6 der Vorlage):
  Domain von `web` (`lumeos.app` oder `app.lumeos.app` — hängt an
  `auth-sso` §8 Frage 1), Umgang mit Vercel-Vorschau-Adressen (ein
  Platzhalter `*.vercel.app` öffnet die Liste für fremde Projekte), und
  die getrennten Listen für `dev` und `main`.
  Bleibt M4-Voraussetzung.

- [x] **B-01: Permission-Schicht aufgebaut** — `[cmd]` `.claude/settings.json`
  mit 14 Deny / 7 Ask / 13 Allow. Verifiziert: `git push --dry-run` wurde geblockt,
  `pnpm typecheck` lief ohne Nachfrage.

- [x] **B-02: `settings.local.json` bereinigt** — von 47 gewachsenen Allow-Regeln
  auf 0 zurückgesetzt, nur lean-ctx-Hooks bleiben. Sicherung:
  `.claude/settings.local.json.bak-2026-08-01`.
  *Kritisch war `Bash(powershell -Command:*)` — ein Generalschlüssel, der jede
  Deny-Regel umging, zusammen mit `git add *` und `git commit -m ' *`.*

- [x] **B-03: `Bash(rm:*)`-Deny verifizieren** — **erledigt 2026-08-05:
  explizit provoziert.** `[cmd]` `rm <pfad>` im Audit ausgeführt →
  „Permission … has been denied" — die Deny-Regel wirkt. (Zuvor am
  2026-08-04 bereits zweimal implizit ausgelöst.)

- [x] **B-04: PreToolUse-Hook neu bauen** — **erledigt 2026-08-04.**
  `.claude/hooks/protect-paths.ps1` (86 Zeilen), eingehängt in `.claude/settings.json`
  mit zwei Matcher-Einträgen: `Write|Edit|Read` sowie zusätzlich `Bash` — ohne den
  Bash-Matcher wäre genau die Anlass-Lücke offen geblieben.
  Alle vier Anforderungen `[cmd]` belegt: stdin-JSON über `[Console]::In.ReadToEnd()`
  (kein `param()`, 0 Treffer), Exit-Code 2 bei Ablehnung, mit BOM geschrieben
  (`EF BB BF`), 0 Nicht-ASCII-Bytes nach dem BOM, 0 Parse-Fehler im PS-5.1-Parser.
  Regeln: `.env*` für Lesen und Schreiben dicht (Ausnahme `.env.example`),
  `supabase/migrations/` nur schreibgeschützt (Lesen bleibt Arbeitsalltag der
  Kettenläufe), Fail-open bei unlesbarem stdin-JSON.
  Provokation `[cmd]`, acht Fälle: `Read .env.local` → 2, `Write supabase/migrations/…`
  → 2, verkettete Bash-Zeile `echo … && grep -c SUPABASE apps/web/.env.local` → 2
  (genau die Form, die vorher durchkam); durchgelassen: `Read package.json`,
  `Read .env.example`, `Read supabase/migrations/…`, `Bash pnpm test`, kaputtes stdin.
  Ablehnungen werden nach `.claude/hooks/protect-paths.log` protokolliert.
  Die lean-ctx-PreToolUse-Kette in der Nutzer-`settings.json` blieb unangetastet.
  Nebenbefund: `.gitignore` listete `.claude/` im Wayland-Block — wirkungslos für die
  93 bereits getrackten Dateien, blockierte aber jede neue. Zeile herausgelöst, statt
  dessen nur `settings.local.json*` und `hooks/*.log` ignoriert.

- [x] **B-05: Tote Hooks entfernen** — **erledigt 2026-08-04: gegenstandslos.**
  Beide Hooks waren aus `settings.json` ausgehängt und liefen nie
  (`[cmd]` 2026-08-01: `pre-tool.ps1` 4 Parse-Fehler durch UTF-8 ohne BOM +
  Emoji ausserhalb der BMP; `post-tool.ps1` `param()`-Fehler); das Schreibziel
  `system/state/audit.jsonl` existiert seit der Governance-Archivierung nicht
  mehr — die Hooks sind zielos. Die Dateien liegen noch unter `.claude/hooks/`
  und gehen mit der `.claude`-Altlast-Folgerunde (`50-governance-rest.md`).

- [x] **B-06: Herkunft des `PowerShell`-Deny klären** — **erledigt (Audit
  2026-08-05): gegenstandslos.** `[cmd]` Die Nutzer-settings.json enthält
  keine PowerShell-Regel; der Eintrag liegt sichtbar als `ask` in
  `.claude/settings.json:40` (seit der Umstellung deny→ask am 2026-08-03).
  Das Rätsel „keine gefundene Datei liefert ihn" existiert nicht mehr.

- [x] **B-07: `skipAutoPermissionPrompt`** — **entschieden 2026-08-06
  (Tom): steht auf `false`.** `[cmd]` 2026-08-06 nachgeprüft:
  `~/.claude/settings.json` → `skipAutoPermissionPrompt: false`,
  Sicherung `settings.json.bak-2026-08-06-b07` daneben.
  **Der ursprüngliche Verdacht war falsch herum — festgehalten, weil die
  Fehlerrichtung lehrreich ist:** Der Audit vom 2026-08-05 notierte den
  Schalter als „vermutete Ursache für die 47 unbemerkt gewachsenen
  Allow-Regeln … ist real". Tatsächlich **unterdrückt** der Schalter das
  automatische Merken — er kann die 47 Regeln also nicht verursacht haben.
  Aus „der Schalter steht auf true" folgte im Audit „also ist er die
  Ursache"; das war ein Schluss von der Existenz auf die Wirkung, genau
  die Sorte Fehler, gegen die die Marker-Regel gedacht ist.
  Die 47 Regeln bleiben damit **unerklärt** — sie sind seit B-02 auf 0
  zurückgesetzt, der Entstehungsweg ist nie belegt worden. Falls sie
  wieder wachsen, ist das ein neuer Befund, keine Wiederholung.

- [x] **B-08: SessionEnd-Hook falsch verortet** — **erledigt 2026-08-06
  (Block 8):** `[cmd]` der Eintrag mit hartkodiertem Repo-Pfad ist aus
  `~/.claude/settings.json` entfernt (Sicherung
  `settings.json.bak-2026-08-06` daneben); beide
  lean-ctx-PreToolUse-Ketten nachweislich intakt. Der Hook selbst war
  ein Wrapper für das deaktivierte claude-mem-Plugin und ging mit dem
  alten Hook-Satz (B-15) — „in die Projekt-Settings“ war damit
  gegenstandslos, es blieb „weg“.

- [x] **B-09: Encoding-Schäden** — entschärft, erledigt 2026-08-02.
  `[cmd]` `packages/shared/src/supabase/client.ts` ist sauber (Bytes `E2 80 94` =
  korrekter Geviertstrich; der Befund war ein Konsolen-Anzeigefehler).
  Echter Schaden nur in `20240522_002` (`k?se`, `n?sse` — literales 0x3F) —
  die Datei liegt jetzt in `supabase/_archive/` und wird nicht mehr
  ausgeführt. Folgenlos.

- [x] **B-10: ijfw-Plugin vollständig abschalten** — **2026-08-05 verfrüht
  auf erledigt gesetzt, am 2026-08-06 zurückgenommen.**
  Die damalige Abschaltung (`enabledPlugins: {"ijfw@ijfw": false}`,
  MCP-Server umbenannt auf `_disabled_ijfw-memory` in der
  Nutzer-`settings.json`) griff an genau einer von vier Stellen — und das
  war die wirkungsloseste. `[cmd]` Am 2026-08-06 schrieb das Plugin den
  IJFW-Block in `CLAUDE.md` (+6 Z.) und das ijfw-Frontmatter in
  `AGENTS.md` (+104 Z.) zurück und überschrieb damit das A-02-Ergebnis.
  Ursache: **das Plugin bringt seine Verdrahtung selbst mit.**
  `~/.ijfw/claude/.mcp.json` deklariert `ijfw-memory` eigenständig — das
  Umbenennen in der Nutzerkonfiguration entfernte nur eine redundante
  zweite Deklaration. `~/.ijfw/claude/hooks/hooks.json` deklariert sieben
  Hook-Punkte (SessionStart, Stop, PreCompact, UserPromptSubmit,
  PreToolUse ×4, PostToolUse). Zusätzlich lief es zweigleisig:
  `~/.codex/hooks.json` (7 ijfw-Hooks) und
  `~/.codex/config.toml` `[mcp_servers.ijfw-memory] enabled = true`.
  `[cmd]` Sechs Node-Prozesse liefen (2× `mcp-server/src/server.js`,
  4× `dashboard-server.js --daemon`), Port 37894 aktiv, gestartet 09:40 —
  also nach der Abschaltung.
  Am 2026-08-06 erledigt: Prozesse beendet, alle vier Ladequellen
  entschärft (Suffix `-disabled-2026-08-06`, `enabled = false`,
  Sicherung `config.toml.bak-2026-08-06-ijfw`), `CLAUDE.md`/`AGENTS.md`
  zurückgesetzt. Gegenprobe `[cmd]`: 0 ijfw-Prozesse, Port frei.
  **Erledigt 2026-08-06 (Tom): `/plugin uninstall ijfw@ijfw` ausgeführt.**
  Gegenprobe `[cmd]` 2026-08-06 nachgeprüft:
  - `~/.claude/settings.json` → `enabledPlugins` enthält **keinen**
    ijfw-Eintrag mehr
  - **0** echte ijfw-Laufzeitprozesse (node-Prozesse mit ijfw in der
    Kommandozeile), Port **37894 frei**
  - `~/.ijfw/claude/.mcp.json` und `~/.ijfw/claude/hooks/hooks.json`
    existieren **nicht mehr** — die Deinstallation hat die beiden
    Ladequellen entfernt, nicht nur umbenannt. Damit ist die Sorge
    „ein Plugin-Update legt die umbenannten Dateien neu an" gegenstandslos.
  **Messfalle beim Nachprüfen, festgehalten weil sie wiederkommt:** Ein
  Filter `CommandLine -like '*ijfw*'` meldete zunächst **4 Prozesse** —
  das waren `[cmd]` die eigenen Prüfbefehle, die das Wort im Skriptpfad
  tragen. Erst der Filter auf `node`-Prozesse zeigte die Wahrheit: 0.
  Wer Prozesse zählt, muss ausschliessen, dass er sich selbst zählt.
  **Prüfregel, die hieraus folgt:** Aus einer Konfigurationsdatei folgt
  nicht die Wirkung. Nach dem Abschalten eines Plugins gehören Prozessliste
  und offene Ports geprüft, und zwar für **jede** Werkzeugkette getrennt —
  Claude Code und Codex haben eigene Verdrahtung.

- [x] **B-11: Regel für parallele Agenten** — **erledigt 2026-08-13
  (Block 23).** Regel steht als §10.1 in
  `docs/spezifikation/10-plattform/konventionen/00-konventionen.md`
  (Betriebsregel, kein Werkzeugzwang).

  **Befund, der die Richtung geändert hat:** Die Konflikte entstehen
  `[cmd]` **nicht in den Quelldateien**, sondern in **generierten
  Zuständen**, die niemandem gehören. Erhoben: `.next` (je App),
  `.next-gate` (seit B-18 getrennt), `.turbo/cache`, `node_modules`, die
  lokale Datenbank, die Ports 3200/3210.

  **Die Bruchstelle ist `.next/types/`.** `[cmd]` Beide `tsconfig.json`
  listen `.next/types/**` **im `include`** — ein laufender Dev-Server
  schreibt also in die Eingabemenge von `tsc`. Zwei belegte Folgen:
  B-18 (Gate-Build räumte ab, während der Dev-Server schrieb, 3 von 5
  Läufen rot) und Block 21 (verwaiste Typdatei einer umgezogenen Route
  liess den Typcheck scheitern, obwohl der Build sauber kompilierte).

  **`git worktree` ist bewusst NICHT die Empfehlung.** `[cmd]` Preis:
  `node_modules` in der Wurzel trägt **30.528 Dateien, 409 MB**, dazu je
  Paket — ein zweiter Baum braucht einen eigenen vollständigen
  `pnpm install`. Er löst die tatsächliche Bruchstelle **nicht**:
  `.next/types` entsteht in beiden Bäumen neu, die Datenbank bliebe
  geteilt. Er hilft nur gegen gleichzeitiges Schreiben an denselben
  Quelldateien — dagegen hilft die Regel billiger. Richtig wird er erst,
  wenn zwei Werkzeuge längere Zeit auf **verschiedenen Branches**
  arbeiten sollen.

  **Ein Teil des alten Punktes ist NICHT erledigt und bleibt hier
  stehen:** der Zusatz „`desktop-commander` umgeht die Permission-Schicht
  vollständig; risikoreiche Schritte gehören in eine
  Claude-Code-Session". Das ist keine Parallelitätsfrage, sondern eine
  Werkzeugwahl, und §10.1 ist der falsche Ort dafür. Verwandt mit B-20
  (Codex-Pfadschutz), aber nicht davon abgedeckt — B-20 hängt einen Hook
  in Codex ein und sagt nichts über `desktop-commander`.
  **Als B-26 weitergeführt**, damit es nicht in einem erledigten Punkt
  verschwindet.

- [x] **B-14: `pnpm build` ins Prüf-Gate aufnehmen** — **erledigt
  2026-08-05: Gate geschaffen, nicht erweitert.** `[cmd]` Vorher existierte
  KEIN automatisch auslösendes Gate: `core.hooksPath` ungesetzt, keine
  aktiven Hooks, CI seit 2026-04-23 deaktiviert. Gebaut: Root-Script
  `gate` (= `turbo run typecheck test build`), versionierter
  `.githooks/pre-commit` (Aktivierung `git config core.hooksPath .githooks`,
  im README dokumentiert), Build-Cache-Kante
  `$TURBO_ROOT$/packages/shared/src/**` in der build-Task.
  Zwei getrennte Nachweise: (a) `[cmd]` `pnpm gate` wird rot bei künstlich
  wiederhergestelltem Seitenmodul-Import — test/typecheck grün, nur build
  scheitert mit dem historischen /dashboard-Fehler; (b) `[cmd]` (Tom) der
  Hook blockt einen echten `git commit`: Typfehler-Datei gestaged,
  „[gate] ROT — Commit abgebrochen", Exit 1, HEAD unverändert a1a2804.
  Bekannte Einschränkung (bewusst, im README): der Hook prüft den Working
  Tree, nicht den Index — bei Scheiben-Commits kann ein Commit grün
  durchlaufen, der für sich allein nicht baut. Betriebsregel: `next dev`
  und Gate nicht gleichzeitig — geteiltes `.next`, sonst TS6053 auf
  `.next/types/**`. Ursprungsbegründung: der /dashboard-Bruch lag vor,
  während test und typecheck grün waren (Worktree-Repro auf 7140829).

- [x] **B-15: `system/` wird wieder beschrieben — Verursacher
  abgeschaltet** — **erledigt 2026-08-06 (Block 8):** Verursacher BELEGT
  statt vermutet: `.codex/hooks/post-tool.ps1`, verdrahtet über
  `.codex/hooks.json` aus der parallelen Codex-Sitzung. `[cmd]` Laborlauf
  einer Skriptkopie mit isoliertem Root erzeugte einen formatgleichen
  Eintrag; der hartkodierte `orchestration_mode: claude_code`-Marker im
  Log hätte in die falsche Richtung gewiesen. Danach der gesamte alte
  Hook-Satz entfernt (6 Dateien unter `.claude/hooks/` und
  `.codex/hooks/`, Konfigurationen zuerst bereinigt) und **`system/`
  ersatzlos entfernt** (Inventar vor Löschung: 1 Datei, 13 Zeilen).
  Folgepunkt: B-20 — Codex ist seither ohne Pfadschutz.

- [x] **B-16: B-04-Hook — Falsch-Positive auf Dokumentationstext
  eingegrenzt** — **erledigt 2026-08-06 (Block 8):** `protect-paths.ps1`
  prüft bei Bash nur noch Tokens in Befehlsposition je Segment plus
  Redirections; Heredoc-Körper werden vor der Analyse entfernt. Lücken
  benannt im Dateikopf (Heredocs an Interpreter, Variablen-Indirektion,
  endliche Befehlslisten); der gewollte `.env`-Lese-Block samt
  Demo-Key-Ausweg ist dort dokumentiert. `[cmd]` Toms unabhängige
  Testbatterie: zehn Fälle, alle korrekt — geblockt `cat .env.local`,
  verkettetes `sed` auf `.env.local`, `echo >`- und `cp`-Schreiben nach
  `supabase/migrations/`, `Read .env.local`; durchgelassen `echo` mit
  `.env` im Text, Heredoc über `migrations/` und `Bash(rm:*)`,
  `Read package.json`, `pnpm test`, das LESEN aus `migrations/`.
  **Korrektur der Zählung im Ursprungstext: es war EIN Falsch-Positiv**
  (Statuspflege-Heredoc); die beiden Block-7-Fälle waren
  Richtig-Positive (echtes Schreiben und `git mv` nach `migrations/`),
  denen der Lauf regelkonform per Skriptdatei auswich.

- [x] **B-17: Pre-Commit-Gate prüft Working Tree, nicht Index** —
  **geschlossen 2026-08-13 (Block 23): Verhalten nachgemessen, Doku
  berichtigt.** Bei Scheiben-Commits kann ein Commit grün durchlaufen,
  der für sich allein nicht baut (die Heilung liegt im Working Tree).
  Bewusst so belassen — ein Index-Checkout je Commit kostet Laufzeit und
  Komplexität, und Tom prüft jeden Commit vor dem Push ohnehin.

  `[cmd]` **Nachgemessen statt geglaubt:** eine Datei mit Typfehler
  gestaget, dieselbe Datei im Working Tree geheilt, dann `pnpm gate` —
  **grün**, obwohl der Index Code trug, der nicht typecheckt. Die
  Beschreibung im README stimmt also unverändert. (Die Probe-Datei wurde
  restlos entfernt, `git status` sauber.)

  **Zwei Angaben drumherum waren veraltet und sind berichtigt:** der
  Abschnitt trug „Stand 2026-08-05" und beschrieb den `.next-gate`-Umbau
  nur für `apps/web` — `[cmd]` das Gate erfasst inzwischen **8 Tasks**
  über beide Apps, und `apps/admin` hat seit Block 19 dasselbe
  `scripts/gate-build.js`. *Der Punkt selbst stimmte; sein Umfeld nicht.*

- [x] **B-18: Getrennter `distDir` fürs Gate** — **erledigt 2026-08-06
  (Block 10, Commit 8de0282). Zwei Ursachen, nicht eine.**
  Der Auftrag hiess „eigener `distDir`“ — das allein hat es **nicht**
  behoben. `[cmd]` Nach der Verzeichnistrennung trat TS6053 weiter auf,
  nur mit `.next-gate`-Pfaden: **3 von 5 Läufen rot.** Zweite Ursache war
  die Nebenläufigkeit *innerhalb* des Gates: turbo startete `typecheck`
  und `build` desselben Pakets gleichzeitig, der Build räumte
  `.next-gate/types` ab, während `tsc` daraus las.
  Gebaut: (a) `distDir` über `LUMEOS_DIST_DIR`, gesetzt in
  `apps/web/scripts/gate-build.js` (Node-Wrapper statt `cross-env` — kein
  neues Paket); Dev-Server bleibt ohne die Variable auf `.next`;
  tsconfig `include` listet **beide** types-Pfade. (b) `typecheck`
  hängt in `turbo.json` jetzt auch am **eigenen** `build`
  (`dependsOn: ["^build", "build"]`).
  Abnahme `[cmd]`: **6 von 6** `pnpm gate --force` grün, **während**
  `next dev` auf Port 3200 bediente (HTTP 200 vorher wie nachher) —
  derselbe Befehl, der vorher reproduzierbar rot wurde. Beide
  Verzeichnisse bestehen getrennt; `tsc --listFiles` zieht 24 Typdateien
  aus `.next-gate/types` und 3 aus `.next/types`, die Prüfung ist also
  mitgewandert, nicht verlorengegangen. Gegenprobe Schutznetz: künstlich
  falsche Route → TS2769, Exit 2 (die /dashboard-Fehlerklasse wird
  weiterhin erkannt), Datei per `git checkout` zurückgesetzt.
  Laufzeit: warm 0,8 s (FULL TURBO, unverändert), kalt 17–24 s.
  Die Betriebsregel aus B-14 ist damit **gegenstandslos** und im README
  entsprechend berichtigt (nicht nur gestrichen).

- [x] **B-19: Ignore-Regeln gegen den Index prüfen** — **erledigt
  2026-08-06 (Block 10, Commit 0f30263).** `[cmd]`
  `git ls-files -i -c --exclude-standard` **von 28 auf 0**.
  Vier Fälle, einzeln bewertet statt pauschal aufgelöst:
  1. `.codex/` — **war entgegen der Annahme NICHT eingegrenzt**, stand
     noch pauschal im Wayland-Block; `hooks.json` (lean-ctx-Hooks, echte
     Projektkonfiguration) darunter getrackt. Pauschalregel raus, statt
     dessen gezielt `.codex/*.log` und `.codex/settings.local.json`.
  2. `_archive/.../reports/runs/` (20) und `.../dossiers/` (4) — Regeln
     entfernt: `[cmd]` 20/20 bzw. 4/4 getrackt, keine untrackte Datei
     daneben; das Archiv ist seit 2026-08-04 eingefroren, dort entsteht
     nichts mehr.
  3. `_archive/.../state/pipeline-metrics.jsonl` (1) — Regel entfernt,
     gleiche Lage.
  4. `_archive/governance/onyx-seed/` — **eingegrenzt statt aufgelöst:**
     `[cmd]` 107 Dateien auf Platte, davon 2 getrackt (der Bericht zur
     Archivierung). Die übrigen 105 bleiben ignoriert.
  Der Rest des Blocks bleibt stehen — `[cmd]` jene Pfade sind
  nachweislich untrackt und weiterhin lokale Laufzeitreste.
  Gegenprobe `[cmd]`: je aufgelöstem Ort eine neue Datei angelegt — alle
  vier erschienen im Status, die onyx-seed-Sonde blieb korrekt ignoriert,
  beide Ausnahme-Dokumente sichtbar; danach alle fünf Sonden entfernt.
  **Nebenbefund, der Zeit spart:** Ein Verzeichnis-Pauschalmuster
  (`ordner/`) lässt keine Ausnahme darin zu — git steigt in ein so
  ausgeschlossenes Verzeichnis gar nicht erst ab. Es braucht Dateimuster
  (`ordner/*`) je Ebene plus `!`-Ausnahmen.

- [x] **B-21: `nutrition-api#build` erzeugt keine Outputs — turbo warnt bei
  jedem Lauf** (neu 2026-08-06, klein, vorbestehend) — `[cmd]` Jeder
  `pnpm gate`-Lauf endet mit
  „`WARNING no output files found for task @lumeos/nutrition-api#build.
  Please check your outputs key in turbo.json`". Ursache `[cmd]` gefunden,
  nicht vermutet: `services/nutrition-api/` hat **keine eigene
  `tsconfig.json`**; das Skript `build` ruft schlicht `tsc`, das daraufhin
  die Wurzel-`tsconfig.json` auflöst — und die trägt `noEmit: true`.
  Der Build kann also konstruktionsbedingt nichts erzeugen, während
  `turbo.json` für die build-Task `dist/**` als Output erwartet.
  **Der ernstere Teil ist nicht die Warnung:** `[cmd]`
  `tsc --showConfig` listet ausschliesslich Dateien aus `packages/shared`
  und `packages/types` — **0 Treffer auf `nutrition-api`**. Die vier
  eigenen Quelldateien des Dienstes werden von seinem eigenen `build` und
  `typecheck` **gar nicht geprüft**; beide melden Erfolg, ohne den Dienst
  anzufassen. Das Gate ist an dieser Stelle blind.
  Optionen: eigene `tsconfig.json` mit `outDir: dist` ergänzen (dann prüft
  und baut der Dienst wirklich), oder — falls der Dienst unverdrahtet
  bleibt (C-08: „Teil des Endausbaus") — `build`/`typecheck` bis dahin
  entfernen, statt Erfolg vorzutäuschen. Entscheidung gehört zu C-08.
  **Erledigt 2026-08-06 (Block 12), Weg (a) gewählt: prüfen.**
  Begründung: C-08 führt den Dienst als Teil des Endausbaus, ADR-0001
  rahmt Services als begründete Ausnahme. Ein Dienst, der bleibt, gehört
  geprüft; Weg (b) hätte die Prüfung dauerhaft abgeschaltet.
  **Präzisierung des Befunds:** Die Wurzel-`tsconfig.json` trägt nicht
  nur `noEmit: true`, sondern auch `include: ["packages/*/src/**/*"]` —
  `services/` fehlte dort schlicht. Deshalb 0 Treffer.
  Gebaut: eigene `services/nutrition-api/tsconfig.json` mit `outDir: dist`
  (ohne `noEmit`, damit `dist/**` wirklich entsteht und die
  `outputs`-Angabe in `turbo.json` gedeckt ist).
  **Eigener Befund, gemeldet statt stillschweigend behoben:** Die vier
  Dateien typechecken **nicht** fehlerfrei — aber nur wegen einer
  Ursache, `[cmd]` `error TS2580: Cannot find name 'process'`.
  `@types/node` liegt im Workspace, war aus dem Paket aber nicht
  auflösbar (pnpm-Isolation). Als devDependency ergänzt — reines
  Typpaket, ohne Laufzeitwirkung; ohne das kann der Dienst nicht
  typechecken. Danach **0 Fehler**: der Quellcode selbst war sauber.
  Abnahme `[cmd]`: `tsc --listFiles` erfasst **4 von 4** Dateien
  (vorher 0). **Gegenprobe:** absichtlicher Typfehler → Gate **ROT,
  Exit 2, TS2322**; danach zurückgenommen, Gate wieder Exit 0. Die
  turbo-Warnung ist weg, weil `dist/**` jetzt entsteht.

- [x] **B-22: Datenbankrechte wiederholbar prüfen — das Gate kann es
  nicht** (neu 2026-08-06, aus dem Curation-Bug) — `[cmd]` `pnpm gate`
  prüft Typen, reine Funktionen und den Build; **keiner davon berührt die
  Datenbank.** Der Curation-Bug (`permission denied for table
  food_curation_candidates`) war deshalb für das Gate unsichtbar und fiel
  erst im Browser auf. Der C-11-Nachweis lief über Lebensmittelsuche und
  Nährstoffansicht — nicht über die Curation-Seite.
  **Die Prüfart existiert bereits und hat funktioniert** (Block 11 Teil D,
  2026-08-06): erst erheben, welche Tabellen und Funktionen `apps/web`
  liest (`git grep` auf `.from('` und `.rpc('`), dann bei den
  `SECURITY INVOKER`-Funktionen zusätzlich, welche Tabellen sie **intern**
  lesen — genau dort versteckte sich der Fehler —, dann als echte
  `authenticated`-Sitzung **wirklich lesen** statt der Grant-Tabelle zu
  glauben. Ergebnis damals: 13 Tabellen und 5 RPCs geprüft, **genau zwei
  kaputte Stellen, beide die bekannten**, keine weiteren.
  Aufgabe: diese Prüfung als Skript ablegen (Kandidat:
  `supabase/_pipeline/_validierung/`), damit sie nach jedem
  Zugriffsschicht-Eingriff wiederholbar ist statt einmalig.
  **Bezug:** D-04 (E2E fehlt — ein Browser-Durchlauf hätte es auch
  gefunden), C-08. Kein Ersatz für D-04, sondern die billigere Hälfte:
  Rechte prüfen kostet Sekunden, ein E2E-Aufbau kostet eine Sitzung.
  **Erledigt 2026-08-06 (Block 12):**
  `supabase/_pipeline/_validierung/zugriffsrechte-pruefen.mjs` — ein
  Befehl, ein Exit-Code. **Bewusst NICHT im `pnpm gate`:** das Gate muss
  ohne Datenbank laufen (frischer Klon, CI ohne Docker), diese Prüfung
  braucht zwingend eine laufende Instanz.
  **Sessions ohne Zugangsdaten im Repo:** das Skript legt sich zwei
  Wegwerf-Konten per Signup selbst an und entfernt sie am Ende wieder.
  Der Service-Schlüssel ist nur optional (zum Löschen der Konten).
  **DER WICHTIGSTE FUND — eine Prüfung darf ihre Sollliste nicht vom
  Prüfling erzeugen lassen:** Die erste Fassung zog die Objektliste aus
  der OpenAPI-Beschreibung von PostgREST. `[cmd]` Entzieht man
  `authenticated` das SELECT auf `food_tags`, **verschwindet die Tabelle
  aus der Beschreibung** — die Prüfung hätte sie nicht als unlesbar
  gemeldet, sondern gar nicht mehr gekannt. Ein stiller blinder Fleck
  genau an der Stelle, für die die Prüfung gebaut ist; dieselbe
  Fehlerklasse wie „Gate meldet Erfolg, ohne den Dienst anzufassen"
  (B-21), nur subtiler. Deshalb **062**: die Liste kommt aus dem
  Systemkatalog über `nutrition.pruef_objektliste()` (SECURITY DEFINER,
  `search_path=''`, gibt nur Namen und Art zurück, niemals Inhalte).
  **Zweiter Fund:** Die erste Fassung gab die Aufräum-Befehle nur aus.
  `[cmd]` Nach zwei Läufen lagen drei Nutzer und eine verwaiste Mahlzeit
  auf live. Jetzt räumt sie selbst auf; auch der Abbruchpfad räumt auf
  und liefert **Exit 1** statt falschem Grün.
  **Zwei Gegenproben belegt** `[cmd]`: `security_invoker` abgeschaltet →
  **rot**; Grant auf `food_tags` entzogen → **rot**, gefunden über
  `rpc food_search` — also über den indirekten Weg, den auch der
  Curation-Bug nahm.
  **Gegen live:** Exit 0, **14 Objekte** aus dem Katalog (davon 1 Sicht),
  **18 grün / 3 übersprungen / 0 rot**.
  **Die drei Übersprungenen, einzeln begründet** — übersprungen heisst
  hier nicht „ungeprüft":
  1. `food_curation_candidates` — nur für Admins (C-14); die Tabelle hat
     **keine `user_id`**, es sind Entscheidungen über den gemeinsamen
     Bestand. Seit 061: SELECT-Grant vorhanden, Policy
     `USING (public.is_admin())`. `[cmd]` mit einer echten Zeile
     nachgemessen: **Nicht-Admin sieht 0, Admin sieht 1.**
  2. `food_curation_decisions` — dieselbe Policy, derselbe Beleg.
  3. `rpc curation_overview` — liefert für Nicht-Admins **HTTP 200 mit
     Zählern 0**. Das ist kein Widerspruch: seit 061 **filtert RLS,
     statt zu sperren**. Die Seite blendet für Nicht-Admins ab (C.3),
     damit aus „0 Kandidaten" nicht „alles erledigt" gelesen wird.

- [x] **B-23: Policy-Regel festschreiben — ein Befund ohne Regel ist
  folgenlos** — **erledigt 2026-08-12 (Block 19), aus D-05.**
  Die Regel steht in
  `docs/spezifikation/10-plattform/konventionen/00-konventionen.md` §12
  (176 → 296 Zeilen): Policies je Operation statt `FOR ALL`, `USING` für
  Lesen und `WITH CHECK` für Schreiben, kein `::text`-Cast auf UUID, die
  Grant-Falle (erst Recht, dann Zeilenschutz), `security_invoker = true`
  bei Sichten, Rechteprüfung **vor** dem Datenzugriff, und wie geprüft
  wird (zwei echte Sessions, nicht die Policy lesen). Dazu **AK-5** und
  **AK-6**. Alle sechs betroffenen Spec-Dateien tragen einen Warnhinweis;
  `[cmd]` die Specs selbst sind unverändert (weiterhin genau 17
  Policy-Zeilen, Tabellenzeilen identisch) — sie sind Altbestand, ihre
  Überführung ist D-05.

  **Der eigentliche Ertrag ist nicht die Regel, sondern warum sie
  fehlte.** `[cmd]` Zwei der 17 Fundstellen stehen in
  `Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_02_DATA_API.md` — einem
  Review, das dieses INSERT-Leck **bereits beschreibt**, samt Folge
  („jeder eingeloggte User kann beliebige BLS-Portionen einfügen").
  Der Befund war notiert und **nie zur Regel gemacht**. Danach hat sich
  dasselbe Muster in vier Module fortgepflanzt (Buddy 8, Marketplace 3,
  HumanCoach 2, Admin 1).
  *Ein Befund, der nicht zur Regel wird, verhindert nichts — er
  dokumentiert nur, dass man es wusste.* Deshalb gehört jeder
  wiederkehrende Fund in die Konventionen, nicht in einen Bericht.

- [x] **B-24: `apps/admin` als zweite App** — **erledigt 2026-08-12
  (Blöcke 19–21).** Aus einem `.gitkeep`-Gerüst eine laufende App auf
  Port 3210 (`[read]` Konvention §8 vergibt ihn, keine eigene Wahl nötig)
  mit Anmeldung, Auth-Callback, Middleware ohne öffentlichen Teil und
  Admin-Prüfung **vor** dem Datenzugriff. Seit Block 21 trägt sie die
  Kuration (C-14).

  **Auth-Helfer nach `packages/shared` verschoben, nicht kopiert:**
  `admin-role.ts`, `admin-session.ts`, `safe-redirect.ts`. Zwei Apps, die
  dieselbe Rolle prüfen, dürfen nicht zwei Wahrheiten haben — bei
  Rollen- und Sicherheitslogik ist das die teuerste Stelle für Drift.
  `[cmd]` Turbo-Kante empirisch belegt: 7/7 gecacht, eine Zeile in
  `packages/shared` geändert → **0/7 gecacht**.

  **Der Zwei-Sessions-Nachweis ist erbracht und wiederholbar** (Block 20):
  `supabase/_pipeline/_validierung/admin-sperre-pruefen.mjs` (A und B,
  ändert nichts) und `admin-sperre-rolle-c.mjs` (C, vergibt dem Testkonto
  vorübergehend die Rolle und nimmt sie zurück). Bewusst zwei Dateien:
  wer nur prüfen will, soll nichts ändern. Beide **nicht** im `pnpm gate`
  — sie brauchen laufende Server und eine Datenbank, dieselbe Begründung
  wie bei B-22.

  **Zwei Fallen, die dabei zuschnappten und jetzt dokumentiert sind:**
  1. `[cmd]` **Die Admin-API merged `app_metadata`, sie ersetzt es
     nicht.** Den Ausgangswert `{provider, providers}` zurückzusenden
     liess `"role":"admin"` **stehen** — die Rücknahme sah erfolgreich
     aus und war keine. Richtig ist `{"role": null}`; beim Merge entfernt
     `null` den Schlüssel. Das Skript prüft die Rücknahme seither **nach**,
     statt sie anzunehmen.
  2. `[cmd]` **Der Cookiename war richtig, das Format war falsch.** Die
     erste Diagnose („geratener Name") stimmte nicht: `sb-127-auth-token`
     ist korrekt aus der Supabase-URL abgeleitet. Gescheitert war der
     Wert — `encodeURIComponent` lässt das `JSON.parse` in auth-js werfen,
     die Sitzung gilt dann als nicht vorhanden und der Aufruf landet mit
     307 beim Login. **Das sah aus wie eine wirksame Sperre und prüfte
     nur die Middleware.** Beide Skripte prüfen deshalb zuerst, ob die
     App die Sitzung überhaupt erkennt, und brechen sonst ab.
     Details in `docs/ssot/37-testkonten.md`.

- [x] **B-26: Werkzeugwahl bei risikoreichen Schritten** — **erledigt
  2026-08-13 (Block 25).** Regel als **§10.2** in
  `docs/spezifikation/10-plattform/konventionen/00-konventionen.md`.
  Ergebnis ist eine Feststellung mit Regel, kein Umbau — die Schicht
  lässt sich für fremde Werkzeuge **nicht** erzwingen, sie hängt an
  Claude Codes `PreToolUse`.

  **Der Befund ist allgemeiner als die Frage.** `[cmd]` 2026-08-13 an
  `protect-paths.ps1` gemessen, mit **identischer Nutzlast** und nur
  geändertem `tool_name`:

  | Eingabe | Ergebnis |
  |---|---|
  | `tool_name: "Write"`, `file_path: ".env"` | **Exit 2, blockiert** |
  | `tool_name: "mcp__desktop-commander__write_file"`, gleiche Datei | Exit 0, **durchgelassen** |
  | `tool_name` fehlt | Exit 0, durchgelassen |
  | `path` statt `file_path` | Exit 0, durchgelassen |
  | leere Eingabe / kein JSON | Exit 0, durchgelassen |

  Zwei Ursachen: der Hook vergleicht `$tool -eq 'Write'` **exakt** gegen
  Claude Codes Werkzeugnamen (Zeile 67), und er ist **fail-open** — bei
  unlesbarer Eingabe `exit 0`, damit er den Normalbetrieb nicht zerlegt.
  Beides ist Absicht; zusammen heisst es: **kein fremdes Werkzeug wird
  geprüft, und keines merkt es.**

  **Prämisse korrigiert:** Der Punkt nannte `desktop-commander` als
  Träger des Problems. `[cmd]` Das Werkzeug ist heute in **keiner**
  MCP-Konfiguration eingetragen — weder `~/.claude.json` global noch
  projektbezogen (dort: `serena`, `context7`, `lean-ctx`). Die Regel
  greift trotzdem, aber sie gilt **jedem** Werkzeug ausserhalb Claude
  Codes, nicht einem bestimmten. So ist sie formuliert.

  **Was übrig bleibt, wenn der Hook nicht greift:** die Berechtigungs-
  liste in `.claude/settings.json` (ebenfalls nur Claude Code), das
  Dateisystem, der Mensch. In §10.2 festgehalten, damit es niemand für
  gegeben hält.

---

- [x] **B-27: Sicherungen als Datenabzug statt schema-only** — **erledigt
  2026-08-14.** `[cmd]` Beim Push warnte GitHub über zwei Dateien:
  `live-nutrition-2026-08-14/nutrition-vor-023-072-073.sql` (52,6 MB) und
  `live-nutrition-2026-08-13/nutrition-vor-022-071.sql` (51,8 MB). Beide
  waren vollständige Datenabzüge mit `COPY`-Blöcken über alle Tabellen —
  749.572 Zeilen —, obwohl eine Schemasicherung gemeint war. Zum
  Vergleich: die 18 Dateien unter `backup/schema/` sind 0,02 bis 0,6 MB.

  **Dreimal passiert:** Block 28, Block 29, und ein dritter Fall am
  2026-08-14 mit 96 MB, der vor dem Commit auffiel. Kein Einzelfall.

  **Weg C gewählt (Tom):** aus dem Arbeitsbaum entfernt, **in der
  Historie belassen**. Ein `git filter-repo` hätte sie getilgt, aber alle
  Commit-Hashes geändert — und `docs/sessions/` sowie diese TODO
  verweisen auf Hashes als Anker. Erreichbar bleiben sie über
  `git show <commit>:<pfad>`.

  Dagegen gebaut:
  - `backup/README.md` — welcher Befehl wohin, mit Begründung
  - Konventionen §11 — Sicherungen sind `--schema-only`, Datenabzüge
    komprimiert (`-Fc`) nach `backup/data/`; `[cmd]` dort liegen bereits
    drei à 5,5 MB, dasselbe als Text wären über 50 MB
  - `.githooks/pre-commit` bricht bei Dateien über 10 MB ab.
    `[cmd]` Gegenprobe: eine 12-MB-Datei ergibt Exit 1 mit Hinweis auf
    den richtigen Ablageort. Umgehung nur bewusst mit `--no-verify`.

  *Die Regel, die daraus folgt: ein Format, das existiert, aber nicht
  benutzt wird, ist keine Vorsorge. `backup/data/` gab es seit dem
  2026-08-01.*

## C — Produkt: apps/web

- [x] **C-11: Stammdaten-Reads auf den Session-Client** — **erledigt: war
  faktisch seit M3 (2026-08-04) erfüllt, der Punkt beschrieb einen
  veralteten Stand.** Prüfung 2026-08-05 statt Übernahme der Prämisse:
  `[cmd]` `createServiceClient` hat null Aufrufer (nur die Definition in
  `packages/shared`), `nutrition-db.ts` nutzt `createSessionClient`,
  `anon` hat weder USAGE noch SELECT auf `nutrition`, und keine
  öffentliche Seite (`/`, `/login`, `/auth/callback`) liest Stammdaten.
  Keine Grant-Änderung nötig, kein SQL vorgelegt.
  Wirknachweise `[cmd]` mit zwei echten Sessions: anon erhält harten
  `42501` statt stiller Leerliste; zweite Session sieht Stammdaten
  (49 Treffer), aber `food_preference_items = []` bei existierender
  Fremdzeile (postgres count 1); `/nutrition/foods` ohne Session →
  307 auf `/login?redirect=…`; Suchbaselines unverändert
  (kuerbis 49, high_fiber 558).

- [x] **C-02: WP-01 Preferences-Schreibpfad** — **erledigt 2026-08-04**
  (Sitzung C-02, Abnahme mit zwei echten Sessions; Duplikatschutz-Nachbesserung
  2026-08-05).
  1. [x] Migration/Aufbau der Tabellen — **Notiz von 2026-08-01 widerlegt
     2026-08-05:** `[cmd]` `050_preferences_foundation.sql` legt beide Tabellen
     an (CREATE TABLE IF NOT EXISTS, Z. 16 und 58), `060_zugriffsschicht.sql`
     setzt Rechte und die 4 Policies je Operation, `v050_preferences.sql`
     prüft. Die Behauptung „beide Tabellen existieren in keiner
     Migrationsdatei" stammte aus der Zeit vor der Pipeline-Bündelung (D-12)
     und ist überholt.
  2. [x] `src/lib/nutrition/preferences-write.ts` — Insert-zuerst gegen den
     UNIQUE-Index, 23505→409, 23503→400; reines Modell getrennt in
     `preferences-model.ts`
  3. [x] `preference-search-preview.ts` liest echte DB-Preferences
     (RLS-Session statt URL-Parameter; RPC um 3 Food-Level-Parameter erweitert)
  4. [x] API `GET/POST/DELETE /api/nutrition/preferences` (GET ergänzt —
     die Toggles brauchen den eigenen Bestand)
  5. [x] UI `foods/page.tsx`: Favorit-/Ausschluss-Toggles
     (react-hook-form + zod, TanStack Query, kein optimistisches Update)
  6. [x] Unit-Tests (7 neue in `preferences-model.test.ts`, gesamt 60/13/0)
  7. [x] Abnahme `[cmd]` 2026-08-04: Favorit gewichtet (Platz 11→1, score 80),
     Ausschluss entfernt (49→48), Zustand überlebt Container-Neustart,
     RLS mit zweiter echter Session dicht.
  **Duplikatschutz** `[cmd]` 2026-08-05: `uq_food_pref_items_user_food`
  (partiell, `WHERE food_id IS NOT NULL`) in 050 + live, 23505 nachgewiesen.
  *Offen bleiben:* Browser-E2E des Toggle-Flows (→ D-04),
  Preset-/Profil-Schreibpfad (Settings, → C-12).

- [x] **C-04: WP-03 Daily Summary** — **erledigt 2026-08-06 (Block 12).**
  Hier fiel die Entscheidung, die C-03 ausdrücklich offengelassen hatte.
  **Gewählt: SICHT** (`nutrition.daily_summary`, Kettenschritt 053,
  live seit 2026-08-06, v053 **11/11 grün**).
  **Nicht materialisierte Sicht:** die braucht einen Aktualisierungsweg
  bei **jedem** Schreibvorgang (Insert/Update/Delete auf `meal_items`,
  Delete auf `meals` mit CASCADE). Wer einen vergisst, bekommt keinen
  Fehler, sondern einen **stillen Falschstand** — die Summe sieht richtig
  aus und ist es nicht. PostgreSQL kennt zudem kein inkrementelles
  REFRESH; jede Aktualisierung rechnete alle Nutzerinnen neu.
  **Nicht Summentabelle:** zweite Wahrheit neben `meal_items`; bei
  Abweichung nicht entscheidbar, welche recht hat.
  **Warum die Sicht trägt:** Die Summe ist deterministisch, weil
  `meal_items` **eingefrorene** Werte trägt (ADR-0003) — die Sicht
  summiert nur und rechnet nicht gegen `food_nutrients`. Die neun
  Schnell-Makros liegen als Spalten vor, also ohne JSONB-Auswertung.
  **Was die Sicht NICHT kann** (benannt, nicht verschwiegen): keine
  Wochen- oder Monatsschnitte; keine Zielwerte (die gehören zum Profil);
  keine Summe über den JSONB-Schnappschuss, nur über die neun Makros;
  nicht schneller als die Abfrage darunter — bei vielen Positionen je Tag
  linear langsamer (`[annahme]`, nicht gemessen, es gibt noch keine Daten).
  **Fehlender Wert bleibt fehlend:** `SUM()` ignoriert NULL und machte
  die Summe still zu niedrig. Deshalb je Makro **zwei** Angaben — die
  Summe und `<makro>_missing` (Zahl der Positionen ohne Wert). Hat keine
  Position einen Wert, ist die Summe **NULL statt 0**: nichts gemessen
  ist nicht null Gramm.
  **DER TRAGENDE BELEG — `security_invoker` ist keine Formalie:**
  `[cmd]` Mit `security_invoker = false` sah der zweite Nutzer
  **2 Zeilen** des ersten. Mit `true`: **0**. Der Zeilenschutz der
  darunterliegenden Tabellen greift bei einer Sicht **NICHT automatisch** —
  ohne diese Option wäre `daily_summary` ein Datenleck über alle Nutzer
  gewesen. Geprüft, nicht angenommen.
  Abnahme `[cmd]` gegen live mit zwei echten Sessions: Tagessumme gegen
  Handrechnung (CHO 309,2250 · FAT 1,8900 · PROT625 16,1700, meal_count 2,
  item_count 3); `fibt` NULL mit `fibt_missing 3`; B sieht `[]`;
  BLS-Wert 88,35 → 999,00 änderte die Tagessumme **nicht**; leere
  Mahlzeit bleibt sichtbar mit Summen NULL.
  Anwendungspfad: `diary-summary.ts` (rein) und `diary-summary-read.ts`
  (I/O, Session-Client), 9 Unit-Tests. **UI und API-Route bewusst nicht** —
  Entscheidung Tom: sie kommen mit der Oberfläche, nicht vorher.

- [x] **C-05: WP-04 Water Tracking** — **Datenseite erledigt 2026-08-06
  (Block 14).** Kettenschritte `055_water_logs.sql` (Tabelle) und
  `056_hydration_summary.sql` (Sicht), beide live, **v055 17/17 grün**.
  Oberfläche und API-Route bewusst nicht — sie kommen gebündelt mit der
  Diary-Oberfläche, wenn die Designrichtung steht.
  **Vier Entscheidungen, je begründet:**
  1. **Einzeleintrag je Trinkvorgang**, kein hochgezählter Tagessatz —
     wie beim Diary und aus demselben Grund: nur Einzelzeilen erlauben,
     *eine* Fehleingabe zurückzunehmen. `[read]` SPEC_04 Feature 8 nennt
     Quick-Add-Knöpfe (250/500/750/1000 ml) — das *sind* mehrere Vorgänge
     je Tag; die Pending-Action-Regel („< 80 % nach 18:00 Uhr") braucht
     ausserdem den Zeitverlauf. Preis benannt: jede Anzeige braucht eine
     Summe. Deshalb `logged_at` zusätzlich zu `entry_date` —
     `created_at` ist der Zeitpunkt der *Erfassung*, nicht des Trinkens.
  2. **Einheit fest Milliliter**, keine Einheitsspalte. Eine solche lädt
     dazu ein, sie beim Summieren zu vergessen; dann addiert jemand Liter
     und Milliliter.
  3. **Kein UNIQUE — bewusst, nicht vergessen.** Zweimal 250 ml um 14:00
     Uhr sind zwei Gläser, kein Duplikat. Es gibt keine
     Spaltenkombination, deren Wiederholung fachlich falsch wäre. Die
     Wettlaufsituation aus C-02/C-12 existiert hier gar nicht: es wird nie
     „lesen, dann entscheiden", es wird immer eingefügt. v055 prüft
     ausdrücklich, dass **kein** UNIQUE auftaucht — sonst hätte jemand
     einen Schutz erfunden, der echte Eingaben ablehnt.
  4. **Tagesziel gehört nicht hierher.** `[read]`
     `ADR_WATER_TOTAL_HYDRATION` (Final): es kommt aus
     `nutrition_targets`, geliefert von Goals. `[cmd]` Diese Tabelle
     existiert nicht → gehört zu C-06. Benannt statt mitgebaut.
     **Präzisiert 2026-08-07 (D-05, Block 18):** `[cmd]` Die Tabelle heisst
     `nutrition.nutrition_targets` und ist in **Nutrition** SPEC_06 §14
     spezifiziert, nicht in den Goals-Specs (dort **0 Treffer**). Goals
     *befüllt* sie nur. **Damit hängt C-05 nicht am Goals-Schema, sondern
     an einer einzelnen Nutrition-Tabelle** — ein deutlich kleinerer
     Schritt als „warten auf C-06".
     `hydrationPercent()` nimmt das Ziel als Parameter und liefert ohne
     Ziel **null**, nicht 0 % — 0 % wäre die Behauptung „nichts
     geschafft".
  **Zweite Hydrationsquelle, beim Lesen gefunden:** `[read]` Die
  Gesamt-Hydration ist laut ADR getrunkenes Wasser **plus** Wasser aus
  Nahrung. `[cmd]` Die zweite Quelle lag bereits vor —
  `daily_summary.water_g` aus C-04. Deshalb `056` als Sicht über beide
  Quellen. Einheitenfalle im Dateikopf dokumentiert: `amount_ml` ist ml,
  `water_g` ist g; 1 g = 1 ml steht als ausdrückliche Rechnung, nicht als
  stillschweigende Annahme.
  **Zwei SPEC_06-Defekte nicht übernommen:** dort steht *eine*
  `FOR ALL`-Policy mit nur `USING` (INSERT-Leck, wie 060 §4c beschreibt)
  und der `::text`-Cast. Hier vier Policies je Operation, direkter
  uuid-Vergleich.
  Abnahme `[cmd]` gegen live mit zwei echten Sessions: Tabelle nutzbar
  (INSERT 201, UPDATE 204, SELECT); **doppelte Menge angenommen** (201);
  Gesamt-Hydration **1230 ml** = 1050 getrunken + 180 aus Nahrung,
  `total_complete: true`; Position ohne `water_g` →
  `food_ml_missing: 1`, `total_complete: **false**`; **B sieht `[]`** in
  Tabelle *und* Sicht. `security_invoker` erneut als tragend belegt:
  mit `false` sah B 2 Zeilen von A. Testdaten entfernt, live wieder
  1 Nutzer.

- [x] **C-07: `packages/types` verdrahten oder entfernen** — Rest von
  ursprünglich zwei Paketen (Audit 2026-08-05): `[cmd]` `@lumeos/shared`
  ist seit M1 Teil C verdrahtet (workspace-Dependency; Importe u. a. in
  nutrition-db, Auth-Callback, Login-Form) — **`@lumeos/types` hat
  weiterhin 0 Importe.** Nutzen oder entfernen.
  **Erledigt 2026-08-06 (Block 14): entfernt** (Entscheidung Tom, per
  `git rm`, damit die Löschung im Commit landet und `git revert` sie
  zurückholt).
  **Der Grund war nicht „ungenutzt", sondern „falsch".** `[cmd]`
  2026-08-06 gegen die laufende Instanz geprüft:
  - `NutritionFood` deklarierte **11 Makrospalten** (`enercc`, `enercj`,
    `water_g`, `prot625`, `fat`, `cho`, `fibt`, `sugar`, `fasat`,
    `nacl`, `alc`) — **keine davon existiert** auf `nutrition.foods`.
    Von 12 geprüften Feldern stimmte genau **eines** (`name_display_en`).
  - Die Datei enthielt **zwei widersprüchliche `Food`-Typen**. Der zweite
    (`bls_key`, `calories_per_100g`, `micronutrients`) ist wörtlich das
    flache Modell aus `db/schema/nutrition.sql` — **das ADR-0003
    verworfen hat.** Wer den Typ benutzt hätte, hätte das verworfene
    Modell zurückgeholt, mit Rückendeckung des Compilers.
  - `MealType` kannte 4 Werte, `[cmd]` der Live-CHECK deren 7.
  **Die Lehre, die über diesen Punkt hinausgeht:** Ein falscher Typ ist
  schlimmer als kein Typ, weil er genau die Prüfung abschaltet, die er zu
  leisten vorgibt. Dieselbe Fehlerklasse wie das Gate, das
  `nutrition-api` nie anfasste und trotzdem Erfolg meldete (B-21), und
  wie die Rechteprüfung, die ihre Sollliste vom Prüfling bezog (B-22).
  Dreimal in einer Woche — ein Muster, kein Zufall: **Werkzeuge, die
  Sicherheit behaupten, ohne sie zu erzeugen.**
  Nachweis vor der Löschung `[cmd]`: 0 Importe über Paketnamen, 0 über
  relative Pfade, 0 tsconfig-`paths`-Einträge, 0 Dependency-Einträge in
  irgendeiner `package.json`, 0 Task-Bezüge in `turbo.json`,
  **0 Dateien** aus `packages/types` in der Kompilation von `apps/web`
  (`tsc --listFiles`). Danach `pnpm install` (Scope 5 → **4**
  Workspace-Projekte) und `[cmd]` `pnpm gate --force` **Exit 0** —
  ungecacht, damit nichts hinter dem Turbo-Cache verborgen bleibt.

- [x] **C-09: Test-Runner einrichten** — **erledigt 2026-08-04.**
  `[cmd]` `apps/web` hat ein `test`-Script (`tsx --test` über die
  node:test-Dateien, kein vitest/jest — keine Datei umgeschrieben);
  `pnpm test` aus dem Root läuft über Turbo. Es sind **11** Testdateien
  (nicht 12 — der Governance-Test liegt seit 2026-08-03 im Archiv), seit C-02
  zwölf Dateien mit **60 Tests / 13 Suites / 0 Fehlschlägen**.
  `dependsOn ^build` der test-Task entfernt (Unit-Tests brauchen keine
  Buildartefakte); Cache-Kante zu `packages/shared` über
  `inputs: [$TURBO_DEFAULT$, $TURBO_ROOT$/packages/shared/src/**]`
  geschlossen und per Sonde belegt (Hit → shared-Änderung → Miss → Revert → Hit).

- [x] **C-10: UI-Zahlen gegen DB prüfen** — **erledigt 2026-08-06
  (Block 13).** Nicht nur die genannte Stelle geprüft, sondern alle
  Zahlenbehauptungen in `apps/web` erhoben. Fünf Fundstellen, je einzeln
  entschieden — bewusst **nicht** pauschal dynamisiert, jede Abfrage kostet:

  | Fundstelle | Behauptet | Ist `[cmd]` | Entscheidung |
  |---|---|---|---|
  | `app-shell.tsx:78` | 117 Nährstoffe · BLS 10.840 | **138** / **7.140** | beides falsch → korrigiert, **hart belassen** |
  | `app-shell.tsx:76/79` | „keine Diary Writes" | Schreibpfad live | falsch seit C-03/C-04 → berichtigt |
  | `dashboard-view.tsx:37` | Routes **11** | 15 Seiten / 9 hrefs | an nichts verankert → **Zahl entfernt** |
  | `local-schema/page.tsx:23` | `row_count === 138` | 138 | richtig → hart, als Konstante mit Herkunft |
  | `nutrition/page.tsx:6–9` | Makro-Ziele 2400/180/… | — | kein Bestandsanspruch → unverändert |

  **Begründung „hart belassen" bei der App-Shell:** sie rendert auf
  **jeder** Seite; eine Zählabfrage je Aufruf wäre Aufwand für eine Zahl,
  die sich nur beim BLS-Import ändert. Der Kommentar an der Fundstelle
  nennt Herkunft und Prüfdatum — „richtig und hart ohne Herkunft" wäre nur
  ein späterer Fehler.
  **Begründung bei `local-schema`:** Die 138 ist dort keine Anzeigezahl,
  sondern eine **Erwartung** („entspricht der lokale Seed dem Katalog?").
  Sie darf **nicht** aus derselben Tabelle geladen werden, die sie prüft —
  sonst stimmt sie immer und die Diagnose ist wertlos. Dieselbe
  Fehlerklasse wie bei B-22 (Sollliste vom Prüfling) und B-21 (Gate meldet
  Erfolg, ohne zu prüfen).
  **Begründung beim Dashboard:** Die 11 entsprach `[cmd]` weder der
  Seitenzahl (15) noch den Navigationseinträgen (9) — sie war an nichts
  verankert. Statt sie neu zu raten oder je Aufruf zu zählen: entfernt,
  denn die Karte sagt selbst „zeigt keine Live-Daten".
  Nachgezogen: `docs/ssot/20-apps-web-ist.md` zitierte die falsche Zeile
  noch als Ist-Zustand.

- [x] **C-12: Duplikatschutz für die übrigen fünf target_types**
  (neu 2026-08-05) — `[cmd]` `uq_food_pref_items_user_food` sichert nur
  `target_type='food'` (partiell `WHERE food_id IS NOT NULL`). Für `category`,
  `tag`, `cuisine`, `exclusion_preset` und `catalog_item` fehlen die analogen
  partiellen UNIQUE-Indizes — sie gehören zum jeweiligen Schreibpfad, konkret
  **vor** den Preset-/Profil-Schreibpfad in Settings.
  **Tragende Begründung, hier festgehalten:** der CHECK
  `food_preference_items_exactly_one_target` erzwingt genau EIN gesetztes
  Zielfeld je Zeile — dadurch sind die partiellen Indizes trennscharf: jede
  Zeile fällt in genau einen Index, Überlappung ist konstruktiv ausgeschlossen.
  Bisher stand das nur als Kommentar in `050_preferences_foundation.sql`.
  **Erledigt 2026-08-06 (Block 13):** Kettenschritt
  `054_preference_uniques.sql`, live angewendet, **v054 20/20 grün**.
  Fünf partielle UNIQUEs auf `(user_id, <ziel>)`, insgesamt **6** fachliche
  UNIQUEs auf der Tabelle.
  **`preference` gehört NICHT in den Schlüssel — am Schreibmodell gezeigt,
  nicht angenommen:** `[read]` `decideFoodPreferenceWrite()` liefert bei
  abweichender Präferenz **`'update'`**, nicht `'insert'` — eine
  bestehende Zeile wird *umgestuft*. Wäre `preference` im Schlüssel,
  könnten „mag ich" und „ausschliessen" für dasselbe Ziel als **zwei**
  Zeilen koexistieren, ein widersprüchlicher Zustand. Die Begründung hängt
  am Umstufungsmodell, nicht am Zieltyp; `[cmd]` das Modell darunter kennt
  keinen `target_type`, nur der heutige Schreibpfad ist auf `'food'`
  festgelegt. Gilt also für alle fünf gleichermassen.
  **Fund, der die Prädikate bestimmte:** Der CHECK zählt **nicht
  einheitlich** — `[cmd]` aus `pg_get_constraintdef`: `food_id`,
  `category_id`, `tag_code` per `IS NOT NULL`, die drei Textcodes
  (`cuisine_code`, `exclusion_preset_code`, `catalog_item_code`) per
  `NULLIF(x, '')`. Für den CHECK gilt der **Leerstring als nicht
  gesetzt**, für ein naives `IS NOT NULL` aber als gesetzt. Ein naives
  Prädikat hätte Zeilen erfasst, die fachlich kein Ziel dieses Typs haben,
  und zwei verschiedene echte Ziele wären an einem **Scheinkonflikt**
  gescheitert. `[cmd]` auf live belegt: zwei Zeilen mit
  `cuisine_code = ''` und verschiedenen `catalog_item_code` gehen **beide**
  durch. Die Prädikate spiegeln den CHECK deshalb exakt.
  Wirkprobe `[cmd]` gegen live: Doppel-Insert → **23505**; andere
  `preference` bei gleichem Ziel → **ebenfalls 23505**; Umstufung per
  UPDATE → geht; Testzeilen entfernt, live wieder **0 Zeilen**.
  **Nebenfund an der eigenen Prüfung:** `kein_index_mit_preference` meldete
  zunächst rot. Ursache war die **Prüfung**, nicht die Indizes —
  `indexdef LIKE '%preference%'` trifft den Tabellennamen
  `food_preference_items` und damit immer. Auf `pg_attribute` umgestellt.
  Eine Prüfung, die konstruktionsbedingt nie grün wird, ist so wertlos wie
  eine, die nie rot wird.
  **Was die Indizes nicht leisten** (im Dateikopf benannt): Sie ersetzen
  den Schreibpfad nicht — er muss den 23505 weiterhin in Umstufung oder
  HTTP 409 übersetzen. Und `[cmd]` die drei Textcodes haben **keinen**
  Fremdschlüssel: ein Tippfehler bleibt einer, nur eben ein eindeutiger.

- [x] **C-14: Kuration gehört nach `apps/admin` — die Rollenabstufung in
  `apps/web` ist ein bewusster Zwischenschritt** — **erledigt 2026-08-12
  (Block 21).** Umgezogen und die Ausnahme aufgelöst:

  | von `apps/web` | nach | Zeilen |
  |---|---|---|
  | `src/app/nutrition/curation/page.tsx` | `apps/admin/src/app/curation/page.tsx` | 315 |
  | `src/app/api/nutrition/curation/route.ts` | `apps/admin/src/app/api/curation/route.ts` | 40 |
  | `src/lib/nutrition/curation.ts` | `apps/admin/src/lib/nutrition/curation.ts` | 313 |
  | `src/lib/nutrition/__tests__/curation.test.ts` | `apps/admin/…/__tests__/curation.test.ts` | 44 |
  | `src/lib/nutrition/nutrition-db.ts` | `packages/shared/src/nutrition/nutrition-db.ts` | 27 |
  | `src/lib/nutrition/preferences-catalog.ts` | `packages/shared/src/nutrition/preferences-catalog.ts` | 238 |

  Alles per `git mv` — die Herkunft bleibt in der Historie.
  **Nicht umgezogen:** die RPC `nutrition.curation_overview` und die
  Curation-Tabellen. Es zieht nur die Anwendungsseite um.
  Die beiden letzten Zeilen der Tabelle sind **keine** Kuration, sondern
  gemeinsame Infrastruktur: `[cmd]` `nutrition-db.ts` hat 10 Nutzer in
  `apps/web`, die dort bleiben. Kopieren hätte Drift erzeugt, deshalb
  nach `packages/shared` — dasselbe Muster wie bei den Auth-Helfern in
  Block 19.

  **Die Rollenabstufung in `apps/web` ist weg**, nicht liegen geblieben:
  `admin-role.ts` und `admin-session.ts` (seit Block 19 nur noch
  Weiterleitungen) sind gelöscht, der zugehörige Test liegt jetzt bei
  `apps/admin`. `[cmd]` `git grep` auf `isCurrentUserAdmin`,
  `isAdminFromAppMetadata`, `ADMIN_ROLE`, `admin-role`, `admin-session`
  über `apps/web/src`: **0 Treffer.** Was bleibt, ist `safe-redirect` —
  von Anmeldung und Callback gebraucht, keine Rollenlogik.

  **Alte Adressen: 404, bewusst keine Weiterleitung.** `[cmd]` Mit
  gültiger Sitzung liefern `/nutrition/curation` und
  `/api/nutrition/curation` in `apps/web` je **404**. Eine Weiterleitung
  nach `admin.lumeos.app` wäre faktisch der Link, den `[read]`
  `20-apps/web` §6 ausschliesst („ein Link aus `web` würde nahelegen,
  dass sie zum Produkt gehören"). Auch der Knopf „Curation" auf
  `/nutrition/foods` ist entfernt statt umgehängt.

  **Themesystem: weiter ohne, am Bedarf entschieden.** `[cmd]` Die
  umgezogene Seite nutzt 100 `className`-Stellen, aber **null**
  Theme-Token-Klassen — sie kommt mit der Standard-Palette aus. `apps/admin`
  hat deshalb Tailwind bekommen (`tailwind.config.js`, `postcss.config.js`,
  `globals.css`), aber **keine** Token-Spiegelung und keinen
  Cookie-SSR-Bootstrap. Das Heben nach `packages/` bleibt für den Tag, an
  dem `admin` eigene Markenoberfläche bekommt — dann mit zwei echten
  Nutzern statt einem.

  **Belegt mit zwei echten Sessions** (Block-20-Skripte, auf die neuen
  Adressen umgestellt statt neu gebaut): A `307` → `/login`, B Absage auf
  `/curation` **und** `403` auf `/api/curation`, C Seite mit Inhalt und
  `200` mit Daten. `[cmd]` Beide Skripte Exit 0.

  Ursprünglicher Punkt (neu 2026-08-06, aus C.3):
  **Diese Ausnahme widerspricht der Spezifikation und muss als Ausnahme
  sichtbar bleiben, sonst gilt sie irgendwann als Regel.**
  `[read]` `docs/spezifikation/20-apps/web/00-app-web.md:65–69` sagt
  ausdrücklich: „`web` kennt genau eine Rolle: die angemeldete Nutzerin,
  die ihre eigenen Daten sieht. Es gibt hier **keine Rollenabstufung**.
  Wer Coach ist, arbeitet in `coach`; **wer verwaltet, in `admin`**."
  Seit C.3 (2026-08-06) gibt es in `apps/web` genau das: eine
  Admin-Prüfung vor `/nutrition/curation` und der zugehörigen API-Route.
  **Warum trotzdem so gebaut:** Die Seite lief in einen rohen
  Datenbankfehler; die Alternativen waren, sie für jede Nutzerin zu öffnen
  (falsch — `[cmd]` beide Curation-Tabellen haben **keine `user_id`**,
  es sind systemweite Entscheidungen über den Lebensmittelbestand) oder
  sie sofort umzuziehen (`[cmd]` `apps/admin/` ist ein leeres Gerüst,
  1 Datei `.gitkeep` — das wäre ein eigener Block gewesen).
  `061_rollen_admin.sql` ist die **Brücke, nicht das Ziel**.
  Aufgabe beim Umzug: Seite und API-Route nach `apps/admin`, danach die
  Admin-Prüfung aus `apps/web` **entfernen** — nicht liegen lassen. Die
  Rollenprüfung selbst (`public.is_admin()`, 061) bleibt und wird dort
  gebraucht.
  **Von Block 12 NICHT berührt** (nachgesehen, nicht angenommen):
  `[cmd]` `apps/admin/` ist weiterhin ein leeres Gerüst (1 Datei). 062
  legt nur `nutrition.pruef_objektliste()` an — eine Objektliste für die
  Rechteprüfung, ohne Bezug zur Kuration. Der Punkt steht unverändert.

- [x] **C-13: Tote „Keine Writes“-Copy in ausgelieferter Oberfläche** —
  **erledigt 2026-08-06 (Block 9):** die fünf Systemaussagen berichtigt —
  `dashboard-view.tsx` (Flow-Karte „Klarer Rahmen“, Karte „Was echt ist,
  was Attrappe“, drei Badges mock/candidate/readonly), `app-shell.tsx`
  (Context-Aktion → „Favoriten und Ausschlüsse setzen“),
  `placeholder-page.tsx` (Badge → „Platzhalter ohne Funktion“); der
  Diary-Header ist als Selbstaussage gefasst („Diese Diary-Seite schreibt
  nichts“). Nur vorhandene Badge-Töne verwendet. `[cmd]` Suche über
  Quellcode und Wurzeldateien: 0 verbliebene Systembehauptungen.
  **Bewusst geblieben:** „This page still performs no writes“
  (curation/page.tsx) und „never applies migrations“
  (local-schema/page.tsx) — Selbstaussagen der jeweiligen Seite und
  `[cmd]` wahr: keine der beiden Seiten enthält eine Schreiboperation.

- [x] **C-15: Fehlsuchen mitschreiben, bevor Dialektaliase gepflegt
  werden** (neu 2026-08-13, aus Block 28) — Block 28 hat die
  **ableitbare** Hälfte der Wortschatzlücke geschlossen (11.102 Aliase,
  ohne Handarbeit). Was bleibt, ist echtes Sprachwissen: `[cmd]` **12 von
  47** Abnahmebegriffen sind weiterhin offen — Mundart (`poulet`,
  `marille`, `karfiol`, `paradeiser`, `schoggi`), Umgangssprache
  (`huehnerbrust`, `huehnchenbrust`, `rinderhack`, `schweineschnitzel`),
  Schreibvarianten (`brokkoli`, `yoghurt`) und Regionalwörter
  (`blaubeere`).

  **Nicht mit einer Wortliste anfangen.** `[cmd]` Der Befund
  (`docs/ssot/41-lebensmittelsuche-wortschatz.md`) schätzt 5.000–8.000
  Einträge für den ganzen Bestand — und die 50 häufigsten Grundbegriffe
  decken nur **24,9 %** ab. Eine geratene Liste wäre teuer und träfe
  daneben; auch die 71 Alternativen im Befund sind mein Sprachwissen,
  keine Messung des Nutzerwortschatzes.

  **Deshalb zuerst messen:** Anfragen mit null Treffern erfassen. Sie
  sind die einzige Quelle, die sagt, welches Wort wirklich fehlt. Dann
  pflegt man die 30 Wörter, die Leute tatsächlich tippen, statt 2.643
  Begriffe auf Verdacht.
  `[cmd]` Die Kurationstabellen (`food_curation_candidates`,
  `food_curation_decisions`) sind genau dafür gebaut und **leer**.
  `[cmd]` `food_aliases.source` unterscheidet seit Block 28
  `derived` von `editorial` — gepflegte Aliase bleiben damit von
  abgeleiteten trennbar.

  `[cmd]` **Nicht erledigt, sondern zusammengefuehrt.** C-18 (neu
  2026-08-14) beschreibt dieselbe Sache ausfuehrlicher und mit
  Datenschutzfrage. Weitergefuehrt wird C-18.

- [x] **C-19: `rinderhack` — Relevanz, nicht Wortschatz** (neu
  2026-08-14). `[cmd]` Die Anfrage zerlegt richtig zu `rind` + `hack`
  und liefert Treffer — aber `Blätterteigtaschen gefüllt mit Rinderhack`
  steht vor `Rind Hackfleisch, roh`.

  Der Fall lief zunächst als bestanden durch, weil die Erwartung im
  Prüfskript nur `rind` verlangte. Der Massstab wurde verschärft statt
  die Zahl zu behalten — jetzt steht er als offen da.

  Gehört zu C-17 und zur Relevanzfrage, nicht zum Wortschatz. Die
  Zerlegung hat geliefert, die Reihenfolge nicht.

  `[cmd]` **Erledigt 2026-08-14**, nachgemessen am Anker `7b5e631`:
  `rinderhack` liefert `Rind Hackfleisch, roh` auf Platz 1. Geloest
  haben es die drei Sortierstufen aus C-25 (`073_suchfilter.sql`),
  nicht eine eigene Maszgabe.

- [x] **C-21: Kürzerer Name gewinnt bei gleichem Gewicht** (neu
  2026-08-14). `[cmd]` Gemessen, hilft, aber weniger als erhofft.

  Anlass: `schweinsragout` liefert `Schweineherzragout` auf Platz 1,
  `Schweineragout` auf Platz 4 — `[cmd]` **alle fünf Treffer haben
  sort_weight 0**, es sind alles Gerichte der Gruppe Y. Danach entscheidet
  die alphabetische Sortierung, und `Schweineherz…` steht vor
  `Schweinera…`, weil `h` vor `r` kommt.

  `[cmd]` Messung über 152 Lebensmittel: Platz 1 von **48,0 % auf 49,3 %**,
  14 besser, 24 schlechter. Löst zwei von sechs benannten Fällen:
  `schweinsragout` → Schweineragout ✓, `gemuesebruehe` → Gemüsebrühe ✓.
  Die übrigen vier scheitern an C-20, nicht an der Länge.

  **Zur Messung selbst — sie prüfte gegen die falsche Erwartung:** Die
  24 „schlechter"-Fälle sind fast alle Zubereitungsvarianten
  (`weisskohl` 2 → 3 für *Weisskohl gedünstet*). Genau das soll die Regel
  tun. Wer die Regel bewertet, braucht als Erwartung *das allgemeinste
  passende Lebensmittel*, nicht *das zufällig gezogene*. Vor der Umsetzung
  ist die Messung entsprechend zu bauen.

  `[cmd]` **Gegenstandslos 2026-08-14.** Beide benannten Faelle stehen
  jetzt richtig: `schweinsragout` -> `Schweineragout` auf Platz 1,
  `gemuesebruehe` -> `Gemuese Bouillon/Bruehe/Suppe` auf Platz 1.
  Geloest hat das die Zubereitungsstufe aus C-25. Die Laengenregel
  wurde nie gebaut und wird nicht mehr gebraucht — die Messung, vor der
  hier gewarnt wurde, eruebrigt sich damit ebenfalls.

- [x] **C-25: Zubereitungscode in die Sortierung — die eine Ursache
  hinter C-20, C-21 und C-24** (neu 2026-08-14). **Höchste Priorität der
  Suchrangfolge.**

  `[cmd]` `Banane roh` (F503100) und `Banane getrocknet` (F503400) haben
  **beide `sort_weight` 660**. `Broccoli roh` und `Broccoli gebacken`
  beide 660. Danach entscheidet das Alphabet — und `gebacken` steht vor
  `roh`, `getrocknet` vor `roh`.

  **`sort_weight` kodiert die Warengruppe, nicht die Zubereitung.** Der
  Zubereitungscode steht daneben (`[cmd]` Stellen 5–7 des BLS-Codes,
  `100` = roh) und wird von `food_search` **nicht ausgewertet** —
  obwohl `44-bls-codestruktur.md` ihn erhoben hat und
  `preparation_kinds` ihn bereits als Filter benutzt.

  **Die Regel:** Wer eine ZUTAT sucht, will die Rohform. MealCam wird
  Bestandteile eines Tellers melden — `Banane`, nicht `Banane
  getrocknet`.

  `[cmd]` Was das allein löst: `banane` (Platz 2 → 1), `brokkoli`
  (3 → 1), `apfel` (6 → 1), `milch`, `suesskartoffel`, `kartoffeln`,
  `zucchini`, `paprika`, `eigelb`, `quinoa`, `kartoffelstock`.

  Vor der Umsetzung messen, nicht danach — und **mit** Erwartungen, siehe
  C-26. Erwartbar erledigen sich C-21 und C-24 damit ganz oder teilweise.

  `[cmd]` **Erledigt 2026-08-14 (Block 32).**
  `nutrition.such_rang_zubereitung` in
  `supabase/_pipeline/07_lesefunktionen/073_suchfilter.sql`; `000` und
  `100` sind gleichrangig, wie hier gefordert. Nachgemessen: `banane`,
  `brokkoli`, `apfel` je auf Platz 1. Der Punkt hat wie vorhergesagt
  C-19 und C-21 miterledigt.

- [x] **C-26: Die MealCam-Messung ist der Massstab** (neu 2026-08-14).
  `supabase/_pipeline/_validierung/mealcam-zutaten-messen.ts`

  37 Zutaten aus den typischen Mahlzeiten von Kraftsportlern, je mit
  einem **erwarteten BLS-Code**. `[read]` Grundlage: Recherche 2026-08-14
  zu Meal-Prep-Praxis — Hühnchen/Pute/Rind/Lachs/Thunfisch,
  Reis/Hafer/Süsskartoffel/Quinoa, Brokkoli/Spinat, Avocado/Mandeln/
  Olivenöl, Magerquark/Hüttenkäse/Skyr.

  `[cmd]` **Stand 2026-08-14: 2 von 16 auf Platz 1 (13 %.)**

  **Warum diese Messung die anderen ersetzt:** Dieselbe Zutatenliste
  ohne Erwartungen meldete **75 % „in Ordnung"** — sie fragte nur „kein
  Gericht". Tatsächlich lieferte sie `milch` → Magermilchpulver,
  `banane` → getrocknet, `brokkoli` → gebacken. Alles technisch
  Grundnahrungsmittel, alles falsch.

  *Eine Prüfung ohne Erwartung misst nichts.* Vierter Messfehler dieser
  Familie an einem Tag — und der einzige, der die Lage **besser**
  aussehen liess.

  Offen: 21 der 37 tragen noch keinen Sollwert. Sie sind mit Begründung
  vermerkt und beim nächsten Durchgang zu ergänzen.

  `[cmd]` **Erledigt 2026-08-14.** Der Maszstab steht und wird benutzt:
  37 Zutaten, **alle mit Sollwert** (`ohne Sollwert (offen): 0`),
  **31 auf Platz 1 (84 %)**, 35 in den ersten drei, 0 ohne Treffer.
  Die sechs Restfaelle sind namentlich im Skript vermerkt: `lachs`,
  `milch`, `kartoffeln`, `spinat`, `paprika`, `erdnussbutter`.
  Der Satz, der daraus bleibt: *Eine Pruefung ohne Erwartung misst
  nichts.*

### Reproduzierbarkeit — erledigt 2026-08-02

- [x] **D-12: Aufbaukette verifizieren** — **erledigt 2026-08-02**
  (`docs/ssot/33-pipeline-verifikation.md`).
  Ausgangsbefund war: `[cmd]` `supabase_migrations.schema_migrations` enthält
  **genau einen Eintrag** (`20260423120000_control_plane_tables`), während
  11 Nutrition-Tabellen mit rund 727.000 Zeilen existieren.
  **Aber: die Aufbaukette war nicht verloren.** Sie lag in
  `docs/project/p1-005/` und `tmp/` und ist seit Commit 399d9bc unter
  `supabase/_pipeline/` gebündelt: 010 Schema, 020/021 Human Layer inkl.
  Tag- und Alias-Ableitungen, 030 BLS-Import, 050/051 Nutzertabellen,
  plus 4 Validierungsskripte.
  **Verifikation:** `[cmd]` Zwei Läufe gegen frische Datenbanken, beide
  identisch zum Container: 105 Spalten, 31 Indizes, 2 Policies, alle
  11 Zeilenzahlen. Gesamtdauer 10,6 s. Der fehlende Nährstoff-Katalog wurde
  gefunden und nach `supabase/_pipeline/015_kataloge/` extrahiert.
  **Erledigt daraus — O-8 (Makro-Spalten/Auto-Tagging):** `[read]` die
  Tag-Ableitungen stehen in
  `supabase/_pipeline/02_human_layer/020_food_human_layer.sql`:
  `high_protein` PROT625>=20, `low_carb` CHO<=10, `low_fat` FAT<=3,
  `high_fiber` FIBT>=6, Konfidenz fest 1.0, aus `food_nutrients`.
  `[cmd]` Container: 1.400 / 4.659 / 2.648 / 558 Zeilen. Makro-Spalten auf
  `foods` und `auto_tag_food()` existieren nicht und werden nicht gebraucht —
  der EAV-Weg ist der reale.
  **Erledigt daraus — O-6 (Altdateien):** vier Dateien nach
  `supabase/_archive/` verschoben — `20240522_001`, `20240522_002` und beide
  Control-Plane-Migrationen. Governance ist in diesem Repo tot
  (Entscheidung Tom). `supabase/migrations/` enthält nur noch die drei Slices.
  Restfragen ausgelagert: → D-15 (Drafts), D-16 (021-Effekt), D-17 (Register).

- [x] **D-13: Warum liefen die „DO NOT EXECUTE"-Slices?** — **erledigt
  2026-08-02:** Die drei Slices **sind** die Schema-Stufe der Kette.
  `[cmd]` Kein Transaktionsrahmen, idempotent über `to_regclass`-Guards,
  laufen fehlerfrei. Der Statuskopf war Governance-Zeremonie.
  Ursprungsbefund: `[cmd]` `name_th` existiert in `food_categories`, `foods`
  (plus `name_display_th`) und `nutrient_defs` (plus `group_th`) — genau der
  Inhalt von `20260513_002`, das im Kopf
  `EXECUTION_CANDIDATE_REVIEW_ONLY / DO NOT EXECUTE` trägt.

- [x] **D-14: RLS im Container prüfen und entscheiden** — **erledigt
  (Audit 2026-08-05, von Tom nachgeprüft):** `[cmd]` live heute **11/11
  Tabellen mit RLS, 15 Policies** — der am 2026-08-01 beschriebene Zustand
  (2 von 11) ist seit 060-Live weg. Beide Fragen entschieden: der offene
  EAV-Zugriff war ein Versehen und ist durch die Datenklassen aus 060
  behoben; die Auth-Frage ist seit M3 real (Supabase-Auth produktiv).
  Doku-Rest erledigt 2026-08-06 über D-06.
  **Berichtigung 2026-08-06:** Der Satz „ADR-003 ist seit M3 real
  (Supabase-Auth)" verwechselte die Nummern. `[read]` ADR-003 ist laut
  Register das **Diary-Nährstoffmodell**; die Auth-/Zugriffsfrage war
  ADR-004 und ging in ADR-0001 auf. Beides ist jetzt dokumentiert
  (ADR-0003 bzw. ADR-0001).

- [x] **D-11: Restore-Test** — erledigt 2026-08-01.
  `[cmd]` Restore von `backup/data/2026-08-01_nutrition_full.dump` in eine leere
  Datenbank: **4,7 s**, alle 11 Tabellen, alle Zeilenzahlen exakt identisch.
  **Aber:** 2 von 2 RLS-Policies gingen verloren (`ERROR: schema "auth" does not
  exist`); `pg_restore` meldet das nur als Warnung. Der Dump ist damit nur in
  eine echte Supabase-Instanz vollständig zurückspielbar. Testdatenbank verworfen.

### Übrige DB-Punkte

- [x] **D-01: Quelle der Curation-Tabellen** — geklärt 2026-08-01.
  `[cmd]` Beide Tabellen existieren im Container, leer. DDL-Quelle:
  `docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql`;
  die Inline-Kopie in `curation.ts:156` wird nur vom Unit-Test aufgerufen.
  Der genaue Anlageweg bleibt `[annahme]`. → geht in D-12 auf.

- [x] **D-02: Slice-Migrationen dokumentieren** — erledigt, Befund korrigiert:
  `[cmd]` `20260513_001` und `20260514_001` enthalten sehr wohl `CREATE TABLE`
  (kleingeschrieben, in `do $$`-Blöcken hinter `to_regclass`-Guards);
  nur `20260513_002` ist reines `ALTER TABLE`.

- [x] **D-09: Migrationsstand des Containers verifizieren** — erledigt 2026-08-01.
  `[cmd]` Bestand: 7.140 `foods`, 698.092 `food_nutrients`, 21.420 `food_aliases`,
  9.265 `food_tags`, 518 `food_categories`, 138 `nutrient_defs`,
  16 `tag_definitions`; `food_preferences`, `food_preference_items`,
  `food_curation_*` je 0 Zeilen; 4 `workorders` in `public`.
  Ergebnis führte zu D-11 bis D-14 und zur Korrektur von C-02.1.

- [x] **D-03: `supabase/snippets/`** — **erledigt 2026-08-02.**
  `[cmd]` 3 Dateien, `[read]` reine Introspektions-Queries über
  `nutrient_defs` (Studio-Reste vom 2026-05-13). Als
  POST-APPLY VALIDATION QUERIES der Slice-Migrationen belegt — ein Beleg für
  D-13: die „DO NOT EXECUTE"-Slices wurden im Studio ausgeführt und von Hand
  kontrolliert. In `supabase/_snippets/` gesichert. Original löschbar.

- [x] **D-04: E2E- und Testbasis klären** — **erledigt 2026-08-06
  (Block 12): Entscheidung getroffen, kein Gerüst gebaut.**
  Ergebnis in `docs/ssot/36-testbasis.md` (drei Prüfebenen, was jede
  leistet und was ausdrücklich **keine** leistet).
  **Entscheidung: KEIN Playwright-Gerüst jetzt.** `@playwright/test`
  bleibt in den Root-devDependencies (`[cmd]` installiert, Browser
  vorhanden, kostet im Betrieb nichts) — aber `36-testbasis.md` hält
  fest, dass es `[cmd]` **0 Spec-Dateien und keine Konfiguration** gibt,
  damit niemand aus der blossen Anwesenheit von Playwright auf
  E2E-Abdeckung schliesst. Genau diese falsche Sicherheit war der Grund,
  den Punkt überhaupt zu stellen.
  **Was E2E leisten würde und die anderen Ebenen nicht:** den Weg durch
  Next.js selbst — Middleware, Cookie-Handhabung, Server Components, die
  Admin-Prüfung aus C.3, den Anmeldefluss. B-22 spricht direkt mit
  PostgREST und überspringt das alles. Ein kaputter Redirect nach dem
  Anmelden wäre kein Rechteproblem und bliebe von B-22 unentdeckt. Die
  Antwort ist also **nicht dünn** — trotzdem fällt die Entscheidung gegen
  das Gerüst, und zwar aus diesem Grund:
  **Die Prüfung der Frage hat sofort einen echten Fehler gefunden, ohne
  einen einzigen E2E-Test — einen OFFENEN REDIRECT.**
  `[cmd]` Gegen den laufenden Dev-Server:
  `GET /auth/callback?redirect=%2F%2Fevil.com` → `Location: http://evil.com/`.
  Die Prüfung stand **zweimal inline** als `raw.startsWith('/')`
  (`login/page.tsx:15`, `auth/callback/route.ts:12`), beide Male mit
  einem Kommentar, der ausdrücklich behauptete, offene Redirects seien
  ausgeschlossen. `//evil.com` beginnt mit `/`, ist aber
  protokollrelativ — der Browser liest es als fremden Host. Der Kommentar
  behauptete, was der Code nicht tat. Ein offener Redirect ist die halbe
  Miete jedes Phishing-Versuchs: der Link zeigt auf die echte Domain.
  **Behoben als reine Funktion** `apps/web/src/lib/auth/safe-redirect.ts`
  (eine Stelle statt zwei) mit 6 Tests. Gegenprobe `[cmd]` am laufenden
  Server nach der Korrektur: `//evil.com`, `/\evil.com`,
  `https://evil.com` und `///evil.com` landen alle auf `/dashboard`,
  `/nutrition/foods` geht unverändert durch.
  **Daraus die Lehre für die Entscheidung:** Der wertvollste Teil dieser
  Fehlerklasse ist als reine Funktion billiger, schneller und **im Gate**
  prüfbar. Ein Playwright-Gerüst hätte denselben Fehler gefunden — aber
  erst nach Aufbau von Konfiguration, Testnutzerverwaltung, Serverstart
  und CI-Anbindung, und danach dauerhaft zu pflegen.
  **Wiedervorlage, benannt statt offengelassen:** sobald der erste
  Modul-Schreibpfad eine Oberfläche bekommt, die bleiben soll (C-04-UI
  oder C-06). E2E gegen eine Oberfläche, die mit A-06 und C-14 noch
  umzieht, wäre Wegwerfarbeit.
  **Was weiterhin ungeprüft bleibt** (in `36-testbasis.md` benannt):
  kein Browser läuft; der Anmeldefluss ist nur von Hand belegt; die
  Middleware-Umleitung ist `[cmd]` einmalig belegt
  (`/nutrition/foods?q=test` → `/login?redirect=%2Fnutrition%2Ffoods%3Fq%3Dtest`),
  aber nichts hält sie fest.

- [x] **D-06: ADRs konsolidieren** — **erledigt 2026-08-06 (Block 10).**
  **Zielort entschieden: `docs/spezifikation/90-entscheidungen/`.**
  Begründung aus dem Bestand, nicht aus Geschmack: `[cmd]` der Ort ist in
  der lebenden Spezifikationsstruktur verankert (`spezifikation/00-INDEX.md`,
  `10-plattform/architektur/00-systemarchitektur.md` an zwei Stellen,
  `_vorlagen/modul.md`), während **sämtliche** Verweise auf
  `docs/decisions/` aus totem Bestand stammen: archivierte
  Governance-Skills (`.claude/skills/`, `.agents/skills/`),
  `CLAUDE.md.v1.bak`, `_archive/governance/`, `docs/prompts/`, der
  Repomix-Abzug, die Obsidian-Spiegelung. `[cmd]` `docs/decisions/` hatte
  als einzige getrackte Datei `.gitkeep` — der Ordner wurde nie befüllt.
  Aufgelöst mit `docs/decisions/README.md` (Wegweiser samt
  Nummern-Zuordnung); der Ordner selbst bleibt vorerst stehen, damit der
  Verweis auffindbar ist — Entfernung entscheidet Tom (A-05-Nachbarschaft).
  **Die zwei offenen ADRs sind geschrieben:**
  - `ADR-0002-preferences-tabellendesign.md` — Set-Design nach SPEC_06
    (zwei Tabellen) gegen Single-Row. `[cmd]` live belegt: `user_id` als
    Primärschlüssel in `food_preferences`, CHECK
    `food_preference_items_exactly_one_target`, je vier Policies pro
    Operation auf beiden Tabellen.
  - `ADR-0003-diary-naehrstoffmodell.md` — EAV anschliessen, flachen
    Entwurf verwerfen. `[cmd]` 698.092 Zeilen in `food_nutrients`;
    **0 von 5** flachen Makrospalten auf `nutrition.foods`; `meal_items`,
    `meal_logs`, `diary_days` existieren weder in `nutrition` noch in
    `public`. Der Entwurf hätte den `meal_items`-Fehler mitgebracht
    (RLS an, keine Policy → für `authenticated` gesperrt).
  **Nummern-Drift berichtigt:** Die TODO führte ADR-003 als
  „Supabase-Auth". `[read]` Laut Register
  (`docs/_archive/ist-zustand/04-adr-liste.md`, Z. 11) ist ADR-003 das
  **Diary-Nährstoffmodell** und blockiert WP-02 = C-03 — was zur Rolle als
  C-03-Blocker passt. Die Auth-/Zugriffsfrage war ADR-004 (Z. 12) und ist
  mit ADR-0001 und M3 erledigt.
  Nebenkorrektur: `docs/ssot/00-INDEX.md` zeigte noch auf `docs/decisions/`
  — auf den realen Ort umgestellt.

- [x] **D-07: „Phase 1B"-Aussagen aktualisieren** — **erledigt 2026-08-06
  (Block 13).** Die frühere Einschätzung „geht in A-02/A-09 und C-13 auf,
  keine eigene Arbeit planen" war **zu optimistisch** — es standen noch
  drei echte Reste. `[cmd]` `git grep "Phase 1B"` ohne Archive: 6 Treffer,
  davon 3 in der TODO selbst.
  Berichtigt:
  1. **`docs/ssot/20-apps-web-ist.md`** — der substanzielle Fall. Dort
     stand „`[cmd]` Grep 2026-08-01 … kein `INSERT`/`UPDATE`/`DELETE` in
     `lib/nutrition` — Phase 1B read-only". `[cmd]` 2026-08-06 **falsch**:
     Schreibpfade in **zwei** Dateien — `preferences-write.ts` (C-02) und
     `diary-write.ts` (C-03). Ein Ist-Zustands-Dokument, das
     Schreibfreiheit verneint, während zwei Schreibpfade live sind, ist
     die gefährlichste Sorte veralteter Aussage: sie wird geglaubt.
  2. `apps/web/src/app/nutrition/page.tsx` — „in Phase 1B" → Selbstaussage
     der Seite ohne Phasenbezug.
  3. `apps/web/src/app/medical/page.tsx` — „Phase-1B-Placeholder" →
     „Platzhalter".
  **`AGENTS.md:35` bewusst NICHT angefasst:** `[read]` CLAUDE.md führt die
  Datei als Wurzel-Altlast („nicht als Sollwert lesen"), die Archivierung
  steht in **A-10**. Sie zu korrigieren hiesse, eine Datei zu pflegen, die
  weg soll.

- [x] **D-08: supabase-js vs. Docker-SQL** — **entschieden und umgesetzt 2026-08-03.**
  `[cmd]` `apps/web` liest über supabase-js; kein `docker exec`, kein
  `child_process`, kein Containername im Code. Die fünf gewachsenen Abfragen
  wurden zu Postgres-Funktionen (Kettenschritt 070), die String-Interpolation
  der alten SQL-Builder ist damit entfallen. Grundsatz in
  `docs/spezifikation/90-entscheidungen/ADR-0001-datenzugriff.md` — direkter
  Zugriff für jetzt, eigene Modul-APIs als Zielbild.

- [x] **D-10: Port-Kollision im Governance-Rest** — **erledigt 2026-08-04:
  hinfällig.** Der im Punkt vorgesehene Fall („bei Entfernung hinfällig") ist
  eingetreten: `orchestrator-api` und `wo-classifier` liegen seit 2026-08-03
  in `_archive/governance/services/` (`[cmd]` 476 Umbenennungen per `git mv`,
  Commit 59cb41e).

- [x] **D-15: `supabase/migrations-draft/` einordnen** — **erledigt (Audit
  2026-08-05, von Tom nachgeprüft):** `[cmd]` liegt nicht mehr am alten Ort, sondern unter `supabase/_archive/` — die
  Einordnung (Archiv-Referenz statt aktiver Bestand) ist faktisch gefallen.

- [x] **D-16: `021_wild_category_apply.sql` klären** — **erledigt
  2026-08-02, der Haken fehlte:** die `[annahme]` „durch 020 abgedeckt"
  ist widerlegt — `[cmd]` 021 ist notwendig (`affected_rows = 49`;
  Kettenläufe 2026-08-04/05 liefern erneut 49; dokumentiert in
  `supabase/README.md`).

- [x] **D-17: Migrationsregister** — **erledigt 2026-08-05/06 (Weg B,
  Baseline).** `[cmd]` `migrations/` enthält als einzige Datei
  `20260805120000_baseline_structure.sql`; die drei Slices liegen in
  `supabase/_archive/`; das Register ist umgetragen — Gegenprobe
  `1|0|1` (baseline_da 1, geist_weg 0, gesamt 1).
  Strukturgleichheit doppelt belegt: Wegwerf-DB-Diff der Sitzung
  (0 Abweichungen, 1.984 = 1.984 Zeilen) und Toms unabhängige Nachprüfung
  `[cmd]`: Baseline in eigener Wegwerf-DB, Namensdiff über Tabellen,
  Indizes, Policies und Funktionssignaturen = 104 Objekte, 0 Abweichungen;
  dreizehn Merkmalszahlen identisch (12 Tabellen, 108 Spalten, 35 Indizes,
  114 Constraints, 38 Funktionen, 19 Policies, 12 RLS, 1 Trigger, anon
  ohne USAGE, 0/18 Grants, pg_trgm); der 090-Trigger legt beim Insert in
  auth.users genau ein Profil an. Rollenteilung dokumentiert:
  migrations/ = deploybare Struktur, _pipeline/ = lokale Wahrheit inkl.
  Daten (supabase/README.md, vierte Fassung). Folgepunkt: D-20.

- [x] **D-18: Die vier Control-Plane-Tabellen in `public` entfernen** — **erledigt 2026-08-03**
  (neu 2026-08-04) — `workorders`, `governance_artefacts`, `execution_tokens`,
  `wo_failure_events` samt der vier April-Workorders sind der letzte lebende
  Rest des Governance-Clusters (Code archiviert, die beiden Migrationen seit
  2026-08-02 in `supabase/_archive/`). **Tom arbeitet parallel daran**;
  Sicherung liegt bereit (`[cmd]` 2026-08-04: untracked
  `backup/schema/2026-08-03_public_vor_drop.sql`).
  *Datenbankeingriff — nicht nebenbei ausführen.*

- [x] **D-19: supabase/README-Kette unvollständig** — **erledigt
  2026-08-05:** `[cmd]` README 150 → 201 Zeilen (vierte Fassung); die
  Reihenfolge-Tabelle ist vollständig inkl. **070 und 090**
  (090 = `profiles` + Anmelde-Trigger), die Rollenteilung `migrations/`
  gegen `_pipeline/` steht als eigene Sektion ganz oben.

- [x] **D-20: Baseline-Voraussetzung im Dateikopf nennen** — **erledigt
  2026-08-06 (Block 10, Commit 27a7f64): +23/−0 Zeilen, nur der Kopf
  wuchs.** Der Stub steht jetzt als kopierbares SQL im Dateikopf von
  `supabase/migrations/20260805120000_baseline_structure.sql`.
  **Drei Korrekturen am ursprünglichen Wortlaut dieses Punktes**, alle
  `[cmd]` gegen eine Wegwerf-DB (PostgreSQL 17.6, danach verworfen;
  laufende Instanz unberührt — 12 Tabellen, Datenbankliste wie vorher):
  1. Der **erste** Abbruch ist nicht `function auth.uid() does not exist`,
     sondern `schema "auth" does not exist` bei Z. ~1604
     (`profiles_id_fkey` → `auth.users(id)`). `auth.uid()` kommt erst
     danach bei Z. ~1668 (erste RLS-Policy) — der erste Abbruch verdeckte
     den zweiten.
  2. `auth.role()` und `raw_user_meta_data` werden von der Baseline
     **gar nicht** verwendet (`[cmd]` 0 Treffer; der 090-Trigger liest nur
     `NEW.id`) — im Stub nicht erforderlich.
  3. **Zusätzlich nötig, ursprünglich nicht genannt:** die Rollen `anon`,
     `authenticated`, `service_role` für die GRANTs. Sie sind clusterweit,
     nicht pro Datenbank — deshalb im Supabase-Cluster unsichtbar, gegen
     blankes Postgres aber fehlend.
  `[cmd]` Mit vollständigem Stub läuft die Datei fehlerfrei durch
  (`psql -v ON_ERROR_STOP=1`, Exit 0).

---

### Vorgehen

- [x] **E-01: Read-only Prüfung der Instanz** — **erledigt 2026-08-07
  (Block 16).** Ergebnis in **`docs/ssot/60-legacy-cloud.md`** (264 Z.) —
  der belegte Ist-Zustand, der **alle früheren Schätzungen ersetzt**.
  Erhoben über eine nur lesende Rolle, `default_transaction_read_only = on`.
  **Kernbefund: `[cmd]` 132 von 166 Tabellen in `public` sind LEER, nur 34
  tragen Daten.** Die Instanz ist kein gefülltes Produktivsystem, sondern
  ein Schemagerüst mit wenigen befüllten Inseln. „166 Tabellen" klang nach
  weit mehr Bestand, als da ist — und diese Zahl hat E-04 seine
  Dringlichkeit genommen.
  **Warum die alten Zahlen zu niedrig waren:** Sie stammten aus
  `pg_class.reltuples`, einer Schätzung, die bei rund 25 Tabellen `-1`
  zeigte („nie analysiert") und als „leer" missverstanden werden konnte.
  Jetzt **echte `count(*)`** über alle 166 Tabellen, in einer Abfrage.

  | Posten | `[cmd]` 2026-08-07 |
  |---|---|
  | PostgreSQL | 17.6 |
  | Extensions | 7 (u. a. `vector` 0.8.0, `pg_trgm`, `pgcrypto`) |
  | Schemas | `public` 166, `auth` 23, `storage` 8, `realtime` 3 |
  | Policies in `public` | **101** auf 67 Tabellen |
  | Nutzer | **7** — `dev@lumeos.app` (2026-03-17), sechs Demokonten (2026-03-19) |
  | Buckets | genau einer: `exercises`, **öffentlich**, **10.776** Objekte |

  Die befüllten Tabellen führen `foods` (7.140), `exercise_muscles` (6.398)
  und `exercises` (1.448) an; die Nutzerdaten stammen aus den sechs
  Demokonten und sind für eine Übernahme ohne Wert.

- [x] **E-02: Tote Verweise verifizieren** — **erledigt 2026-08-07
  (Block 16). Die alte Zahl war ein MESSFEHLER, kein Datenverlust.**
  Der Verdacht auf ein Kodierungsartefakt war richtig — die Ursache liegt
  aber genauer, als angenommen.
  `[cmd]` In den URLs kommen **genau drei** Prozentsequenzen vor: `%20`
  (13.514×), `%28` (99×), `%29` (99×) — Leerzeichen **und Klammern**.
  Die alte Prüfung dekodierte nur `%20`.

  | Normalisierung | tote Verweise je Feld |
  |---|---|
  | ohne | 27 / 27 / 9 / 9 / 28 |
  | nur `%20` | 27 / 27 / 9 / 9 / 28 — **unverändert** |
  | `%20` + `%28` + `%29` | **0 / 0 / 0 / 0 / 1** |

  **Es bleibt genau EIN wirklich toter Verweis:**
  `videos/Biceps/Alternate hammer curl seated dumbbells.mp4`.
  **Warum es so lange unbemerkt blieb — die eigentliche Lehre:** `%20`
  allein ändert das Ergebnis **nicht**. Die Zahl blieb über mehrere
  Messungen stabil und wirkte dadurch bestätigt. **Eine Zahl, die sich
  nicht bewegt, ist nicht automatisch richtig** — sie kann auch an einem
  Fehler hängen, der bei jedem Lauf gleich wirkt. Konstanz ist kein Beleg;
  sie war hier sogar das Tarnmittel.
  Details: `docs/ssot/60-legacy-cloud.md` Abschnitt 5.

- [x] **E-03: Abhängigkeiten prüfen, bevor `public` angefasst wird** —
  **erledigt 2026-08-07 (Block 16).** Vollständig geprüft, nicht
  stichprobenhaft: Fremdschlüssel in **beide** Richtungen, Trigger,
  Sichten, Funktionen, Policies.
  **`[cmd]` Ergebnis für `exercises`, `exercise_muscles`, `muscle_groups`
  und `equipment`: es hängt NICHTS daran.** Keine Fremdschlüssel von den
  Kandidaten weg, keine auf sie zu, keine Trigger, keine Sichten, keine
  Funktionen, keine Policies.
  **Der zweite Teil des Befunds ist der wichtigere: Die Verknüpfungen
  existieren nur als Konvention, nicht als Constraint.**
  `[cmd]` `exercises.equipment_id` ist **1.448 von 1.448** gefüllt — ohne
  Fremdschlüssel. `exercise_muscles` verweist auf `exercises` und
  `muscle_groups`, ebenfalls ohne. Nichts in der Datenbank hätte
  verhindert, dass die Verweise ins Leere zeigen.
  `[cmd]` Gegenprobe am Export, lokal nachgerechnet: **0 Waisen** in allen
  drei Beziehungen. Die Daten sind stimmig — aber aus Disziplin, nicht aus
  Struktur. Beim Neuentwurf gehören diese Beziehungen als echte
  Fremdschlüssel abgebildet.
  Details: `docs/ssot/60-legacy-cloud.md` Abschnitt 4.

- [x] **E-05: Übernahmekandidaten exportieren und mappen** — **erledigt:
  Export 2026-08-07 (Block 16), Mapping und Einspielung 2026-08-07
  (Blöcke 17/18) → siehe E-12.** Der Befund unten ist die Grundlage, auf
  der das neue Schema entworfen wurde; er bleibt vollständig stehen, weil
  er die Entwurfsentscheidungen trägt. `[cmd]` Die dort genannten
  Qualitätsmängel sind in E-12 abgearbeitet — mit einer Ausnahme:
  `body_region` ist als **E-13** weiterhin offen.
  Ursprünglicher Auftrag — sicher:
  `exercises`, `exercise_muscles`, `equipment`, Muskelgruppen-Katalog.
  Als JSON-Dump (wenige MB), dann Mapping gegen
  `docs/specs/Training/SPEC_02_ENTITIES.md` und `SPEC_06_DATABASE_SCHEMA.md`,
  Einspielung in ein sauberes `training.`-Schema.
  *Inhalt vor Struktur: die Daten werden übernommen, die alte Struktur ist
  verhandelbar.*
  **Export erledigt 2026-08-07 (Block 16), Mapping steht noch aus.**
  `backup/legacy-v2/training/` als JSON, `[cmd]` Datensatzzahlen gegen die
  Quelle geprüft: `exercises` **1.448**, `exercise_muscles` **6.398**,
  `muscle_groups` **157**, `equipment` **61**. JSON gewählt, weil es die
  `text[]`-Spalten verlustfrei trägt und die alte Struktur **nicht**
  zementiert (SQL-INSERTs täten das).
  **DER BEFUND FÜR DEN NEUENTWURF — die Arrays sind die Quelle, nicht die
  Zuordnungstabelle.** `[cmd]` Am Export nachgerechnet, beide Rollen:

  | | Array | Zuordnungstabelle | in beiden | nur Array | nur Tabelle |
  |---|---|---|---|---|---|
  | `primary` | 3.138 | 2.972 | 2.972 | **166** | **0** |
  | `secondary` | 3.658 | 3.426 | 3.426 | **232** | **0** |

  **398 Zuordnungen gingen verloren**, wenn man nur `exercise_muscles`
  übernimmt. In beide Richtungen **kein einziger Widerspruch**: die Arrays
  sind eine echte Obermenge.
  Die Zuordnungstabelle wäre die sauberere Struktur gewesen — sie ist aber
  **unvollständig gepflegt worden**. Wer beim Neuentwurf die schönere Form
  wählt, ohne die Zahlen zu kennen, verliert 398 Fachaussagen.
  **Qualitätsmängel, die beim Mapping zu bereinigen sind** `[cmd]`:
  - `name_de` und `name_th` sind in **allen vier Tabellen durchgehend
    `NULL`** — es gibt keine Übersetzungen zu retten, nur Spalten.
  - **63 von 157** Muskelgruppennamen tragen eine überzählige schliessende
    Klammer (`Triceps)`, `Extensor Carpi Radialis Longus)`).
  - `muscle_groups.body_region`: **65 von 157** auf `other` (41 %).
  - `equipment.category`: **alle 61** auf `general` — die Spalte trägt
    keine Information.
  - Leer in `exercises`: `description`, `score_hypertrophy`,
    `score_strength`, `score_sfr`, `common_mistakes`, `aliases`.
  - **Der eigentliche Wert:** `instructions` **1.448/1.448** und `tips`
    **1.444** — ausformulierte Anleitungen, bei Neuerzeugung der teuerste
    Posten.

- [x] **E-06: Medienpfade relativ speichern** — **erledigt 2026-08-07
  (Block 17).** Zielstruktur hält Bucket + relativen Objektpfad, nicht die
  absolute URL; die Basis-URL steht an genau einer Stelle
  (`backup/legacy-v2/training/media-konfiguration.json`).
  `[cmd]` **3.753 Medienwerte** zerlegt, **dekodiert** gespeichert,
  **0 Ziel-Abweichungen**, und alle gegen `media/exercises/` gefunden.
  Live trägt `training.exercises.media_paths` (JSONB) `[cmd]` **3.640**
  Pfade, davon **0 mit `http`** und **0 absolut**.

  **Die Erkenntnis, die den Punkt getragen hat: Byte-Gleichheit war der
  falsche Massstab.** Die Rundprobe meldete zunächst 153 Abweichungen.
  Ursache war nicht die Zerlegung, sondern die **uneinheitliche Kodierung
  der Quelle**: dieselbe Datei steht dort mal mit rohem Leerzeichen, mal
  mit `%20`, Klammern mal roh, mal `%28`/`%29`. Wer auf Byte-Gleichheit
  prüft, misst die Kodierung und nicht das Ziel. Nach Umstellung auf
  **„zeigen alt und neu auf dieselbe Datei?"**: 0 Abweichungen.
  *Nicht das Ergebnis wurde passend gemacht, sondern der Massstab
  korrigiert.* Dieselbe Verwechslung hatte schon in E-02 die 27/27/9/9/28
  „toten" Verweise erzeugt.

  **Nebenfund — E-02 ist damit ohne Datenverlust abgeschlossen:** Der eine
  in der Cloud tote Verweis `[cmd]` **liegt lokal vor**. Die lokale Kopie
  unter `media/` ist also **vollständiger als der Bucket**; es fehlt
  nichts, was übernommen werden müsste.

  Der ursprüngliche Grund bleibt zur Nachvollziehbarkeit stehen: Solange
  die Pfade absolut waren, war jeder Ortswechsel eine Migration über 1.448
  Zeilen × bis zu 5 Spalten ohne Rückweg. Jetzt ist er **eine
  Konfigurationszeile**. E-06 war deshalb Voraussetzung von ADR-0004, nicht
  dessen Folge. Vermerkt in
  `docs/spezifikation/90-entscheidungen/ADR-0004-medienort.md`.

- [x] **E-11: Verwaiste Storage-Objekte klären, bevor Medien transferiert
  werden** — **eingeordnet 2026-08-13 (Block 25).** Vollständig in
  `docs/ssot/60-legacy-cloud.md` §5.

  **Kein Cloud-Zugriff nötig gewesen:** `[cmd]` `media/exercises/` trägt
  **alle 3.554 referenzierten Dateien**, 0 Referenzen zeigen ins Leere.
  Der lokale Bestand reichte für die Antwort.

  **Es ist keine Streu, sondern zwei Gruppen** `[cmd]` von 3.430
  unreferenzierten Dateien (6.984 lokal gesamt):

  | Gruppe | Dateien | Was |
  |---|---|---|
  | Übung hat referenzierte Medien | **929 (27 %)** | Zusatzaufnahmen: Zähler-Varianten, zweites Geschlecht |
  | Übung hat **keine** Referenz | **2.501 (73 %)** | **509 eigenständige Übungen**, die es in der Datenbank nicht gibt |

  Die 509 sind überwiegend Yoga-Posen mit je 6 Dateien
  (`bow pose`, `cat pose`, `crow pose`, …). `[cmd]` Stichprobe an fünf
  Namen: **null Treffer** in den 1.448 Übungen.

  **Die `[annahme]` von 2026-08-07 ist widerlegt.** Sie lautete, die
  3.797 präfixlosen Objekte machten den Kern der Verwaisung aus. `[cmd]`
  **Kein Ordner ist vollständig unreferenziert** — die Quote liegt
  zwischen 31 % und 79 %. Die Ursache ist nicht eine alte Pfadstruktur,
  sondern **Medien für Übungen, die nie in die Datenbank kamen**.

  **Empfehlung für den Transfer:** die 3.554 referenzierten zwingend; die
  929 Zusatzaufnahmen mitnehmen (`[cmd]` darunter **1.488
  unreferenzierte `_Female`-Dateien** gegen nur 394 referenzierte — das
  berührt **E-07** unmittelbar: ein Teil der fehlenden weiblichen
  Darstellungen liegt bereits vor und ist nur nicht verknüpft); die 2.501
  für nicht existierende Übungen **nicht automatisch** — das ist eine
  Produktentscheidung (Yoga ins Produkt oder nicht). **Nicht löschen**,
  sie sind der einzige Bestand dieser Übungen.

  **Nebenbefund:** `[cmd]` 24 `desktop.ini` im Medienbestand — Windows-
  Metadaten von Google Drive File Stream, keine Medien. Gehören in keinen
  Transfer.

  Ursprünglicher Punkt (neu 2026-08-07, aus E-02) — `[cmd]` Von den
  **10.776** Objekten
  im Bucket `exercises` sind nur **3.553 referenziert**; **7.223 (67 %)**
  werden von **keiner** Zeile in `exercises` benutzt.
  **Das ändert die Grössenordnung jeder Transferplanung.** Die 15 GB, die
  in Sektion E als Grund gelten, das Legacy-Projekt zu behalten, sind
  möglicherweise nur zu einem Drittel gebrauchter Bestand. Vor jedem
  Transfer (und vor der Kostenrechnung in ADR-0004) ist zu klären, ob die
  verwaisten Objekte mitgenommen werden.
  `[annahme]` Kern der Verwaisung dürften die **3.797 Objekte ohne
  `videos/`- oder `images/`-Präfix** sein (`[cmd]` gemessen: 2.350 mit
  `videos/`, 4.629 mit `images/`, 3.797 ohne). Sie liegen direkt unter dem
  Muskelgruppen-Ordner, z. B. `Biceps/Dumbbell Lying Supine Curl1.jpeg` —
  vermutlich ein früherer Uploadstand mit anderer Pfadstruktur.
  **Nicht löschen, bevor das geprüft ist.** Ein unreferenziertes Objekt ist
  nicht dasselbe wie ein überflüssiges: es könnte die bessere Aufnahme
  derselben Übung sein. Erst zuordnen, dann entscheiden.
  Details: `docs/ssot/60-legacy-cloud.md` Abschnitte 3 und 5.

- [x] **E-12: Trainings-Schema gebaut und live** — **erledigt 2026-08-07
  (Blöcke 17/18).** Kettenschritte `100_training_schema.sql`,
  `101_training_seed.sql`, `102_plural_merge.sql`, Validierung
  `_validierung/v100_training.sql`. Vier Tabellen: `muscle_groups`,
  `equipment`, `exercises`, `exercise_muscles`.
  **Schema + Seed, bewusst ohne UI und ohne API-Route** — der
  Anwendungspfad ist nicht Teil dieses Punktes.

  **Das alte Schema war ausdrücklich nicht der Sollwert.** Sieben
  Abweichungen sind im Dateikopf von 100 einzeln begründet; die wichtigste:
  die fünf URL-Spalten sind durch **ein** `media_paths` (JSONB) ersetzt
  (E-06), und die Arrays sind die Quelle, nicht die alte
  Zuordnungstabelle.

  **Bestand und Herkunft jeder Zahl** `[cmd]` gegen live:

  | | Cloud | live | Grund |
  |---|---|---|---|
  | `muscle_groups` | 157 | **109** | 45 Schreib-Dubletten, 2 Platzhalter, 3 Plural-Paare |
  | `equipment` | 61 | **58** | 3 Schreib-Dubletten |
  | `exercises` | 1.448 | **1.416** | 32 Schreib-Dubletten |
  | `exercise_muscles` | 6.398 | **6.625** | Arrays statt Zuordnungstabelle |

  **1.416 ist kein Datenverlust** — die 1.448 war nie richtig, nur oft
  gezählt. Ebenso steigen die Zuordnungen trotz zusammengefallener Zeilen,
  weil die Arrays die Quelle sind. Beides ist im Kopf von 101 dokumentiert,
  damit es später nicht als Verlust gelesen wird. `[cmd]` 0 Waisen, 3.640
  relative Medienpfade, Schreibrechte nur für Admins, `anon` ohne Zugang.

  **Der eigentliche Ertrag ist der Massstab, nicht die Bereinigung.** Die
  Dublettensuche wurde nicht durch eine weitere Regel beendet, sondern
  durch die Frage **„zeigen sie auf identische Medien?"**. Sie hat
  `[cmd]` **32 echte Dubletten** zusammengeführt (byte-identische
  Medienpfade) und **46 Scheindubletten stehengelassen** — darunter
  `"Ankle plantar flexion"` / `"Ankle - Plantar Flexion"` und sechs
  eigenständige `Crunch (…)`-Varianten. Eine Namensregel hätte sie
  verschmolzen und echte Übungen zerstört.
  Umgekehrt hätte die Klammerregel aus `muscle_groups` in `exercises`
  **56 echte Namen** zerstört (`"Chest dip (on dip station)"`) — dort sind
  `[cmd]` alle 58 Klammern **gepaart**. Deshalb zwei verschiedene
  Vergleichsschlüssel, je mit Begründung im Dateikopf.

  **Singular/Plural ist bewusst KEINE Regel**, sondern eine handverlesene
  Ausnahme (Tom, Block 18) über drei Paare. `[cmd]` Eine Regel
  „End-s entfernen" würde `"Single Arm"`/`"Single Arms"` und
  `"Both Arm"`/`"Both Arms"` verschmelzen — verschiedene Medienpfade, also
  verschiedene Übungen. `v100` prüft die Ausnahme nach, damit sie beim
  nächsten Seed-Lauf nicht stillschweigend zurückkommt.
  `[cmd]` Kette und live sind prüfsummengleich (`muscle_groups` und
  `exercise_muscles`), können also nicht auseinanderlaufen.

- [x] **E-13: `body_region` nachpflegen** — **erledigt und angewandt
  2026-08-13 (Blöcke 25/26).** Kettenschritte
  `103_calvicular_merge.sql` und `104_body_region.sql`.

  **Zuerst eine Dublette geklärt, sonst wäre es Arbeit an einer Leiche:**
  `[cmd]` `Calvicular Head` (2 Nutzungen) ist ein Tippfehler von
  `Clavicular Head` (22) — beide hätten `chest` bekommen, aber die eine
  Zeile verschwindet. Belegt nicht über die Namensähnlichkeit, sondern
  über die **Verwendung**: `Clavicular Head` steht 16 von 22 Mal an einer
  **Incline**-Übung (der Schlüsselbeinanteil des Pectoralis ist genau
  das, was Schrägbank trifft), `Calvicular Head` an „Cable low fly" und
  „Cable machine high to low" — dieselbe Funktionsgruppe. Gegenprobe:
  auch unter den 22 steht „Dumbbell One Arm Low Fly". Die Verwendung
  trennt die Namen nicht. `[cmd]` 0 gemeinsame Übungen, 0 Kollisionen,
  `body_region` und `display_order` bei beiden identisch.

  **Kennzahlen live nach dem Anwenden** `[cmd]`, alle wie erwartet:

  | | vorher | nachher |
  |---|---|---|
  | Muskelgruppen | 109 | **108** |
  | ohne `body_region` | 45 | **4** |
  | Zuordnungen | 6.625 | **6.625** (unverändert) |
  | Zuordnungen auf regionslose Gruppen | 1.468 | **10** |
  | Waisen | 0 | **0** |

  Sicherung vorher nach `backup/live-training-2026-08-13/`, `[cmd]`
  durch Wiederherstellung in eine Wegwerf-DB als brauchbar belegt (109 /
  6.625). Beide Schritte dort getestet, dann live, Probe verworfen.

  **41 Regionen zugeordnet, 4 bewusst nicht** — `Neck Muscles`,
  `Scalenes`, `Sternocleidomastoid`, `splenius capitis`. `[read]` SPEC_06
  kennt für Hals/Nacken **keine** Region; `back` oder `shoulders` wäre
  falsch, `full_body` eine Behauptung. v100 prüft, dass genau diese vier
  es sind — die Lücke ist damit benannt, nicht offen.

  **Ursprünglicher Stand (Block 25):** SQL vorgelegt, nicht angewandt.

  **Woher die Einteilung kommt — keine Erfindung:** `[read]` SPEC_06 und
  der CHECK in `100_training_schema.sql` lassen genau sieben Werte zu
  (`chest, back, shoulders, arms, core, legs, full_body`). `full_body`
  ist erlaubt, wird `[cmd]` von keiner Zeile benutzt und auch hier nicht
  vergeben.

  **41 von 45 zugeordnet, 4 bewusst nicht.** `[cmd]` In der Wegwerf-DB
  belegt: 109 Gruppen, danach 105 mit Region, **Zuordnungen auf
  regionslose Gruppen von 1.468 auf 10** (22 % → 0,15 %). Idempotent
  (zweiter Lauf gleich), Selbstkontrolle im SQL, **live unverändert bei
  45**.

  | Region | neu | Beispiele |
  |---|---|---|
  | `legs` | 19 | Semimembranosus, Semitendinosus, Soleus, Peroneals |
  | `arms` | 14 | Brachioradialis, Flexor/Extensor Carpi …, Grip Muscles |
  | `shoulders` | 3 | Rotatorenmanschette: Teres Minor, Infraspinatus, Subscapularis |
  | `chest` | 3 | Clavicular Head, Sternal Head |
  | `back` | 2 | Teres Major, levator scapulae |

  **Nicht zugeordnet, mit Grund — 4 Gruppen bleiben NULL:**
  `Neck Muscles` (5 Nutzungen), `Scalenes` (2), `Sternocleidomastoid`
  (2), `splenius capitis` (1). Alle vier sind Hals-/Nackenmuskulatur, und
  **SPEC_06 kennt dafür keine Region** — weder `back` noch `shoulders`
  trifft zu, `full_body` wäre eine Behauptung. Das ist eine
  Produktentscheidung (achte Region aufnehmen? unter `back` führen?),
  keine anatomische Frage. *Eine falsche Region ist schlechter als
  keine — sie wird später zum Filtern benutzt und niemand prüft sie nach.*

  **Offen:** Toms Freigabe zum Anwenden, plus die Entscheidung zu den
  vier Hals-Gruppen.

  Ursprünglicher Punkt (neu 2026-08-07, aus Block 18) —
  `[cmd]` **45 von 109** Muskelgruppen tragen keine `body_region`, und die
  Lücke folgt **nicht** der Seltenheit: `Semimembranosus` und
  `Semitendinosus` haben je **381** Nutzungen ohne Region, 5 der 23
  meistgenutzten Gruppen ebenfalls. `[cmd]` **1.468 von 6.625** Zuordnungen
  (22 %) zeigen auf Gruppen ohne Region.
  *Das ist fehlende Quelldatenpflege, keine Absicht* — sonst wären nicht
  ausgerechnet die beiden meistgenutzten Hamstring-Muskeln betroffen.
  Relevant, sobald eine Oberfläche nach Körperregion filtern soll; bis
  dahin ohne Wirkung. `v100` führt die Zahl als Kennzahl mit, damit eine
  Nachpflege sichtbar wird. **Keine Regionen raten** — sie gehören aus
  einer anatomischen Quelle, nicht aus dem Namen abgeleitet.

- [x] **E-16: `gluteus mideus` — Tippfehler mit 383 Zuordnungen** —
  **erledigt und angewandt 2026-08-13 (Block 26, Nachtrag).**
  Kettenschritt `105_mideus_merge.sql`.

  **Der Fall, an dem der erste Wächter versagt hat.** `[cmd]` Tom hat
  die acht Levenshtein-Paare mit ihren gemeinsamen Übungen ausgelesen:
  die vier **ohne** gemeinsame Übung sind alle Scheintreffer, der **eine
  echte Tippfehler hat fünf**. Meine Prüfung meldete
  `tippfehler_ohne_gegenbeleg = 4` — vier Nicht-Fälle, und den einen
  übersehen. *Der Massstab war richtig, seine Leserichtung falsch:* eine
  gemeinsame Übung entlastet nicht, sie **belastet**.

  **Zusammengeführt nach dem 102-Muster, mit einer Besonderheit:**
  `[cmd]` Die meistgenutzte Zeile trägt hier den **falschen** Namen
  (383 gegen 20). Sie überlebt trotzdem und behält ihre ID — das hält
  die Zahl der umzuhängenden Zuordnungen bei 20 statt 383 — und wird
  danach umbenannt. Reihenfolge zwingend: umhängen → löschen →
  umbenennen, weil der Zielname bis dahin von der aufzulösenden Zeile
  belegt ist (`muscle_groups_name_key`).

  `[cmd]` **1 echte Kollision** ("Resistance Band Lying Hyperextension
  Abduction", beide `primary`); die vier übrigen gemeinsamen Übungen
  tragen verschiedene Rollen und überleben beide.

  | | vorher | nachher |
  |---|---|---|
  | Muskelgruppen | 108 | **107** |
  | Zuordnungen | 6.625 | **6.624** (−1 Kollision) |
  | `Gluteus Medius` | 20 | **402** (383+20−1) |
  | ohne Region | 4 | **4** |
  | Waisen | 0 | **0** |

  Sicherung nach `backup/live-training-2026-08-13/training-vor-105.sql`,
  in einer Wegwerf-DB wiederhergestellt und getestet, dann live.

  **Nicht mit erledigt, weil es eine Erfassungsfrage ist:** In den vier
  überlebenden Fällen steht derselbe Muskel jetzt mit `primary` **und**
  `secondary` an derselben Übung. Das stammt aus der Quelle und ist
  keine Folge des Merges — **als E-19 weitergeführt**.

  Ursprünglicher Punkt: `[cmd]` `gluteus mideus` trägt **383**
  Zuordnungen, die korrekt geschriebene `Gluteus Medius` nur **20**.
  Offensichtlicher Tippfehler; die Bereinigung bewegt aber die Mehrheit
  auf die Minderheitszeile und ist deshalb **keine Automatik**.

  **Der Fall ist verwickelter als er aussieht.** `[cmd]` Die beiden
  kommen in **5 Übungen gemeinsam** vor — bei „Resistance Band Lying
  Hyperextension Abduction" sogar **beide als `primary`**, sonst einmal
  `primary` und einmal `secondary`. Dieselbe Muskelgruppe steht dort also
  zweimal an derselben Übung, unter zwei Schreibweisen und mit
  widersprüchlicher Rolle. Das ist ein **Erfassungsfehler**, nicht nur
  ein Schreibfehler.

  **Zu entscheiden, bevor zusammengeführt wird:** Welche Rolle gilt in
  den 5 gemeinsamen Übungen? `[cmd]` Genau **1** davon ist eine echte
  Kollision (beide `primary`, „Resistance Band Lying Hyperextension
  Abduction") — die anderen 4 tragen `primary` **und** `secondary` und
  überlebten einen Merge beide. Ergebnis wäre 403 − 1 = **402**
  Zuordnungen; die Übung stünde dann mit dem Muskel zweimal in
  verschiedenen Rollen da. *Das ist die eigentliche Frage: nicht wie man
  zusammenführt, sondern was fachlich gilt.*
  v100 führt `gluteus_mideus_nutzungen` als Kennzahl mit, damit der Fall
  sichtbar bleibt.

- [x] **C-38: `sort_weight` nach der Spec-Formel neu berechnen** (neu
  2026-08-14). **Der billigste Hebel im ganzen Suchstrang** —
  deterministisch, keine Kuration, keine KI.

  `[read]` `docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md`,
  Abschnitt „Sort Weight System", definiert die Berechnung vollständig:
  Basis je Warengruppe (23 Werte, `U` Muskelfleisch 780, `X`
  Fertiggerichte 200, `P` Alkohol 180), dazu Zuschläge und Abzüge.

  **Zuschläge:** Core-Fitness-Food +200 · `PROT625` ≥ 20 g +80 · ≥ 30 g
  weitere +120 · mager (≥ 20 g Protein und ≤ 5 g Fett) +50 · omega-3-reich
  +40 · ballaststoffreich +30 · unverarbeitet roh +60.
  **Abzüge:** hochverarbeitet −250 · Fertiggericht −300 · zubereitete
  Variante eines Rohprodukts −150 · gesüßt −100 · Innereien −400 bis
  −450 · Blut −500 · Fettgewebe −500 · Laborschnitte („S XI") −200.
  Ergebnis auf 0–1000 begrenzt.

  `[cmd]` **Der Ist-Zustand folgt dem nicht.** Nur **62 verschiedene
  Werte** über 7.140 Einträge — grob nach Warengruppe und Zubereitung
  gestaffelt, ohne Nährwert-Modifikatoren:

  | | Ist | nach Formel |
  |---|---|---|
  | `U010100` Rind Hackfleisch, roh | **600** | 780 + 200 = 980 |
  | `V416100` Hähnchen Brustfilet, roh | 730 | 760 + 200 + Proteinbonus |
  | `U505100` Schwein Fettwamme | **400** | 780 − 500 = 280 |

  **Warum das zuerst kommt:** Alle Eingangswerte liegen in
  `food_nutrients` (`[cmd]` 121,8 Werte je Eintrag). Die Formel braucht
  weder Handarbeit noch ein Sprachmodell und ist beim Import einmalig zu
  rechnen. `[Vermutung]` Sie erledigt mehrere der sechs Restfälle des
  Massstabs mit — `milch` → Magermilchpulver und `erdnussbutter` →
  Erdnussmus laufen beide über Verarbeitungsgrad und Core-Liste.

  **Was vorher zu klären ist:**
  - `[read]` Die Core-Liste der Spec nennt 36 Einträge, teils ohne
    BLS-Code („Lachs (diverse T-Codes)", „Magerquark (M)"). Die Zuordnung
    ist zu belegen, nicht zu raten — jeder Code einmal nachgeschlagen.
  - `processing_level` ist eine Spalte von `nutrition.foods`; ihr
    Füllstand ist zu prüfen, bevor die Formel darauf baut.
  - `[cmd]` Die heutigen Werte sind kein Zufallsprodukt — `sort_weight`
    trägt bereits die Zubereitungsstufe aus Block 32. Beim Ersetzen darf
    diese Wirkung nicht verloren gehen; **die Zubereitung gehört als
    weiterer Modifikator in die Formel**, nicht daneben.

  **Abnahme: der MealCam-Massstab darf nicht schlechter werden als 31 von
  37**, Ziel 34. Vor und nach der Umstellung messen, beide Zahlen nennen.

  `[cmd]` **Erledigt 2026-08-14, live verifiziert.** Bericht:
  `docs/ssot/51-sortweight-formel.md` (drei Durchgänge).

  | | vorher | jetzt |
  |---|---|---|
  | Massstab | 31 / 37 | **34 / 37** |
  | Stufen | 62 | **95** |
  | auf 0 | 2.165 (gerechnet) | **145** |

  **Zwei Fehler in der Spec-Formel wurden dabei entschieden und
  korrigiert:** Die Abzüge „Fertiggericht −300" und „Alkohol −300"
  entfallen — die Basis kodiert die Warengruppe bereits, der Abzug
  bestrafte dieselbe Eigenschaft ein zweites Mal und warf `[cmd]` 100 %
  der Alkoholika auf denselben Wert. Und `whole_food` feuert jetzt auch
  bei Zubereitungscode `000`, nicht nur `100` — `[read]`
  `44-bls-codestruktur.md` belegt, dass `000` nicht „roh" heisst, sondern
  „keine Zubereitungsvariante"; Code schlägt Spec.

  **Umgesetzt als Kettenschritt**, nicht als `UPDATE`: `[cmd]` Der Block
  in `020_food_human_layer.sql` wird aus
  `daten/sortweight-formel.json` erzeugt (`_ableitung/sortweight-sql-erzeugen.ts`),
  sonst driften Datendatei und SQL auseinander.

  **Was `sort_weight` nicht löst**, gemessen statt vermutet: `milch`
  (ein Getränk aus 87 % Wasser gewinnt gegen ein Pulver keine
  Nährwertpunkte), `paprika` (Wortgrenze: Bestand `Gemüsepaprika`,
  Nutzer tippt `paprika`), `erdnussbutter` (Kuration). **Keiner der drei
  ist ein Gewichtsproblem.**

  **Zwei Befunde bleiben offen und sind bewusst nicht repariert:**
  `[cmd]` `processing_level` ist zu 100 % mit `raw` gefüllt, auch für
  Bechamelsauce — falsch gefüllt, nicht leer, und das ist schlimmer.
  `[cmd]` `food_tags` kennt weder `offal` noch `liver`; die
  Innereien-Abzüge laufen über Namensmuster, wodurch `Leberknödel
  Konserve` (800), `Gänseleber in Aspik` (640), `Schweinekümmelmagen`
  (640) und `Kalb Nierenfett` (630) zu hoch stehen.

- [x] **C-33: Der Zubereitungsschlüssel ist warengruppenabhängig — die
  Ursache hinter C-28** — **gemessen 2026-08-14. Auch die Reparatur ist
  gefallen.** Bericht: `docs/ssot/49-zubereitungsschluessel.md`,
  Schlüssel: `supabase/_pipeline/daten/zubereitungsschluessel.json`.

  | | alt (C-28) | neu (C-33) | Abnahme |
  |---|---|---|---|
  | einheitliche Gruppen | `[cmd]` 39/100 | `[cmd]` **47/100** | 95 |
  | ohne Gerichte | `[cmd]` 61/100 | `[cmd]` 60/100 | 95 |
  | Gruppen ohne Vertreter | `[cmd]` 953 | `[cmd]` **0** | — |

  `[cmd]` **Die Regel greift an 4 von 204 Zellen und löst 1 von 48
  Mischungen.** In der Klassifikation stehen 104 Zellen als Zubereitung,
  4 als Erzeugnis — und **96 als ungeklärt**. Fast die Hälfte des
  Schlüssels ist nicht deutbar.

  **Der Grund ist strukturell, nicht handwerklich:** Die Ziffern kodieren
  je nach Warengruppe verschiedene Dimensionen — bei Brot die Zutat
  (`B106`: Ölsamen, Sonnenblumenkerne, Kürbiskerne), bei Gebäck die Sorte
  (`D655`: Sachertorte, Linzer, Pfefferkuchen), bei Käse die Fettstufe,
  bei Fleisch die Garmethode. Es gibt keine gemeinsame Semantik, die man
  ableiten könnte, **weil keine da ist.** Der BLS führt je Warengruppe ein
  eigenes Schema und hat nie beabsichtigt, dass jemand quer darüber
  gruppiert.

  **Damit ist nicht die Reparatur gescheitert, sondern die
  Grundannahme:** dass sich aus dem Code maschinell eine „Art" ableiten
  lässt. Kein dritter Versuch.

  **Was verwertbar bleibt, steht in C-35.**

  **Drei Fehler im Belegverfahren, von Claude Code selbst gefunden und
  gemeldet:** Suffixe schnitten mitten im Wort; das Suffix wurde am
  Namensende statt am ersten Wort gesucht, wodurch ausgerechnet `F`+`600`
  durchfiel; und `B`+`400` galt als belegt durch das Wort „mit", das in
  jedem Brotnamen steht. Alle drei hätten das Ergebnis **beschönigt**.
  Die Selbstprüfung hat gehalten.

  `[cmd]` **Eine Korrektur an meiner eigenen Vorgabe:** In C-33 stand
  „alle 53 `F`+`600`-Namen enden auf ‚saft'" — mit `[cmd]` markiert.
  Tatsächlich sind es 48 von 53, dazu zwei Nektare und drei Smoothies.
  Ich hatte die Beispielliste vor Augen, in der „angereichert mit
  Vitaminen" stand, und trotzdem „alle" geschrieben.

  **Methodische Schwäche, die im Bericht steht:** `[cmd]` Alt und neu
  ziehen ihre Stichprobe aus verschiedenen Grundmengen (1.400 gegen
  1.375) — es sind nicht dieselben 100 Gruppen. Für die Grössenordnung
  reicht der Vergleich, für eine exakte Differenz nicht.

- [x] **C-28: Arten über den BLS-Code gruppieren — Messung vor dem Bau**
  — **gemessen 2026-08-14. Die Vermutung hat die Prüfung nicht
  bestanden.** Bericht: `docs/ssot/48-artengruppierung-messung.md`,
  Skript: `supabase/_pipeline/_validierung/arten-gruppierung-messen.ts`.

  `[cmd]` **39 von 100 Gruppen einheitlich** — die Abnahme lautete 95.
  Nur auf Nicht-Gerichte gerechnet 61 von 100, also besser, aber
  ebenfalls klar darunter. Die Zahl wurde gemeldet, wie sie ist; es wurde
  nicht nachgebessert, bis sie gefällt. **Das ist der Zweck der Regel,
  und sie hat gehalten** — der Bruch kostet einen halben Tag statt drei.

  `[cmd]` Zwei weitere Ergebnisse: **1.564 von 2.646** Gruppen haben
  genau einen eindeutigen Vertreter, **953 (36 %) gar keinen** — weder
  `100` noch `000`, etwa Pumpernickel oder Vollkornbrot mit Buttermilch,
  Erzeugnisse ohne Rohform. Und **468 von 1.596** Nicht-Gericht-Gruppen
  (29,3 %) tragen einen maschinell unbrauchbaren Gattungsnamen.

  **Damit ist Toms Schätzung belegt und unterboten:** rund 470 statt
  rund 2.000, weil je Art statt je Eintrag kuriert wird.

  **Die Gegenprobe hält:** `[cmd]` `T410` enthält 14 Einträge, alle
  Lachs. Der Befund aus dem Lachs-Fall bleibt richtig. Widerlegt ist
  nur, dass er sich verallgemeinert.

  **Was den Bruch verursacht, steht in C-33** — die Ursache ist gemessen
  und der Weg weiter offen. Der Punkt gilt als erledigt, weil er
  geliefert hat, wozu er da war: eine Zahl, die eine Richtung stoppt.

- [x] **C-40: `X` und `Y` als eigener Durchgang** (neu 2026-08-14).
  Setzt C-39 fort.

  `[cmd]` Die 2.050 Gerichte sind zu **100 % unverändert** durchgereicht
  worden, Median-Länge 38 → 38 und 33 → 33. Codex hat die Frage im
  Bericht selbst beantwortet, nachdem die 20 längsten `X`-Einträge geprüft
  waren:

  > `[annahme]` Bei diesen 20 war die Regel „Durchreichen ist der
  > Normalfall" zu weit ausgelegt. […] Die Bestandteile müssen erhalten
  > bleiben, aber die amtliche Satzstruktur muss nicht erhalten bleiben.

  `[cmd]` Beispiel: `Lasagne al forno, Teigwaren geschichtet mit
  Bechamel- und Bologneser Sauce, mit Käse überbacken` — 95 Zeichen,
  unverändert. Vorschlag aus dem Bericht: `Lasagne al forno mit Bolognese
  und Bechamel`.

  **Mitprüfen:** `[cmd]` `D` steht bei **63 % unverändert** gegenüber
  73 % schwierigen Namen; 186 der unveränderten tragen eine Klammer
  (`Apfel-Streuselkuchen (Mürbeteig)`). Verteidigbar, weil die Teigart
  drei sonst identische Kuchen unterscheidet — aber der Wert stieg beim
  Reparaturlauf von 44 % auf 63 %, ging also in die falsche Richtung.

  `[cmd]` **Erledigt 2026-08-15.** 1.048 Codes geändert, ausschliesslich
  in `D`, `X`, `Y`. `X` von 100 % unverändert auf 60 %, `Y` ebenso,
  `D` von 63 % auf 29 % bei Median-Länge 29 → 22.
  Beispiel: `Lasagne al forno, Teigwaren geschichtet mit Bechamel- und
  Bologneser Sauce, mit Käse überbacken` → **`Lasagne al forno mit
  Bolognese und Bechamel`**. Keine Kollisionen, keine Korruptionszeichen.

- [x] **C-41: Die Anzeigenamen einspielen** (neu 2026-08-14). Setzt C-29
  voraus.

  `[cmd]` `supabase/_pipeline/daten/anzeigenamen.jsonl` ist vollständig:
  5.775 Zeilen, keine Kollisionen, 33 mit `sicher: false`, **576 mit
  `nebennamen`**. Die Datei ist erzeugt — der Weg in `nutrition.foods`
  fehlt.

  **Zwei Dinge sind vorher zu klären:**
  - Die Kuration muss den Kettenlauf überleben (C-29). Ohne
    Override-Schicht setzt der nächste Aufbau alles zurück.
  - `[read]` **Aliase leiten sich aus `name_de` ab, nie aus dem
    Anzeigenamen.** Sonst verschwinden die Nebenformen, die
    `022_alias_ableitung.sql` heute aus Schrägstrichnamen gewinnt
    (`[cmd]` 836 Einträge betroffen).

  **Die 576 `nebennamen` sind kuratierte Aliase mit bekannter Herkunft** —
  `Felchen` mit `Maräne`, `Renke`, `Schnäpel`. Wie sie in `food_aliases`
  kommen und ob sie die maschinelle Ableitung ersetzen oder ergänzen,
  ist offen.

  `[cmd]` **Erledigt 2026-08-15**, drei Commits: Umbenennung
  `name_display` → `name_display_de`, Kettenschritt `025` für die
  Anzeigenamen, Kettenschritt `026` für die Nebennamen.
  Live: 7.140 Anzeigenamen, davon **2.870 abweichend von `name_de`**.
  `food_aliases` 32.805, davon **283 `curated_nebenname`** — von 663
  kuratierten Nebennamen waren 380 bereits abgeleitet vorhanden.
  Massstab unverändert 34/37, Schema Exit 0, Gate nach jedem Commit.

  **C-29 war keine Vorbedingung**: solange die Kuration in der
  versionierten JSONL liegt, reproduziert der Kettenschritt sie bei jedem
  Aufbau. Die Override-Tabelle wird erst mit dem Admin gebraucht.

- [x] **C-39: Canonical Names in drei Phasen** (neu 2026-08-14). Löst die
  Namensfrage, an der C-28 und C-33 gescheitert sind — auf einem dritten
  Weg, den die Spec vorgibt.

  `[read]` `SPEC_05_FOOD_TAXONOMY.md`, Abschnitt „Canonical Names —
  Generierungsstrategie":

  | Phase | Verfahren | Umfang |
  |---|---|---|
  | 1 | regelbasiert, einfache Warengruppen (`C`, `F`, `G`, `H`, `K`) | `[cmd]` 1.365 Einträge |
  | 2 | KI-Batch, komplexe Gruppen und Gerichte | `[cmd]` 3.725 + 2.050 |
  | 3 | redaktionelle Prüfung, 10 % Stichprobe, Admin-Oberfläche | — |

  `[read]` Die Spec liefert 20 belegte Beispiele, darunter
  `Reis poliert, roh` → **Weisser Reis (roh)**,
  `Hähnchen Brustfilet, roh` → **Hähnchenbrust (roh)**,
  `Schwein Fettwamme, ohne Schwarten, geringer Magerfleischanteil (S XI)
  roh` → **Schweinebauch (roh)**. Die ersten beiden decken sich mit dem,
  was am 2026-08-14 unabhängig in C-32 vorgeschlagen wurde.

  **Warum das nicht der dritte Anlauf desselben Fehlers ist:** C-28 und
  C-33 sind daran gescheitert, dass die nötige Angabe **nicht im Code
  steht** — dass `Alaska-Seelachs` kein Lachs und `Kartoffelpüree
  Instantpulver` keine Kartoffel ist, weiss keine Ableitungsregel. Das
  ist Weltwissen; ein Sprachmodell hat es. `[annahme]` Der Unterschied
  ist sachlich, aber ungemessen — **die Abnahme gehört wieder vor den
  Lauf**, nicht danach.

  **Phase 1 kann sofort beginnen** und braucht nichts Neues: `[cmd]` Der
  Zubereitungsschlüssel aus C-33 (204 Zellen, 104 als Zubereitung
  belegt) sagt genau, welcher Namensteil wegfällt. Das ist der dritte
  verwertbare Rest aus C-35, jetzt mit Verwendung.

  **Phase 2 läuft bei Tom über Codex** (Kontingent vorhanden,
  2026-08-14). Zu klären vor dem Lauf: Stichprobenumfang für die
  Abnahme, Umgang mit Namen, die das Modell nicht kürzen kann, und ob
  Gerichte (`X`/`Y`, 2.050 Stück) überhaupt einen kurzen Namen bekommen
  sollen oder unverändert bleiben.

  `[cmd]` **Der Bedarf ist beziffert:** 3.272 der 7.140 Namen tragen
  Klammer, Schrägstrich, Zahl oder mehr als fünf Wörter.

  `[cmd]` **Stand 2026-08-14: Phase 2 abgeschlossen, 5.775 von 5.775
  Zeilen** in `supabase/_pipeline/daten/anzeigenamen.jsonl`. Keine
  Kollisionen, 33 mit `sicher: false`, 576 mit `nebennamen`. Bericht:
  `docs/ssot/52-anzeigenamen-batch.md`.

  Kennzahlen je Warengruppe folgen der Schwierigkeitsverteilung: `[cmd]`
  `U` und `V` 0 % unverändert (79 / 65 % schwierig), `M` 3 % (95 %),
  `T` 1 % (56 %) — `B` dagegen 83 % (6 %), und das ist dort richtig.

  **Offen: `X`/`Y` (C-40) und das Einspielen (C-41).** Phase 1
  (regelbasiert, `C`/`F`/`G`/`H`/`K`, 1.365 Einträge) ist nicht
  angefasst.

  `[cmd]` **Erledigt 2026-08-15.** Alle drei Phasen. Phase 1 wurde am
  Schluss nachgeholt: `C`, `F`, `G`, `H`, `K` fehlten vollständig —
  1.365 Einträge, bei denen `name_display_de` identisch mit `name_de`
  war, darunter der gesamte Reis. Kennzahlen: `G` 3 % unverändert,
  `K` 4 %, `C` 25 %, `F` 24 %, `H` 39 %.
  Die Spec-Muster sitzen zeichengleich: `Weißer Reis (roh)`,
  `Vollkornreis (roh)`, `Parboiled-Reis (roh)`, `Haferflocken`.
  **7.140 von 7.140**, keine Kollisionen.

  `[cmd]` Unterwegs gingen **704 Umlaute verloren** — `Eiwei?brot` statt
  `Eiweißbrot`, gültiges UTF-8 mit echtem Fragezeichen. `[annahme]`
  Ursache: PowerShell-Here-String mit Nicht-ASCII an Node. Die Prüfung
  kannte nur die vorherige Fehlerart (`ae`/`oe`/`ue`) und meldete grün.
  Behoben, Gegentest 704 → 0.

- [x] **C-18: Fehlsuchen mitschreiben** (neu 2026-08-14). Der nächste
  grosse Hebel für die Suche, und der einzige, der nicht auf Vermutungen
  beruht.

  `[cmd]` Die 50 Begriffe im Prüfskript sind geraten — auch die, die
  treffen. `[cmd]` Für den ganzen Bestand wären 5.000–8.000 Wörterbuch-
  einträge nötig; die 50 häufigsten Erstwörter decken nur 24,9 % ab.
  Wer die 30 Wörter kennt, die Menschen **tatsächlich** tippen, pflegt
  diese statt 2.643 auf Verdacht.

  `[read]` So arbeiten vergleichbare Anwendungen auch: nach Häufigkeit
  sortieren und von oben abarbeiten. `[cmd]` Die Kurationstabellen
  (`food_curation_candidates`, `food_curation_decisions`) sind dafür
  gebaut und leer.

  Vor dem Bauen zu klären: Was wird mitgeschrieben — jede Anfrage oder
  nur die ohne Treffer? Wie lange aufbewahrt? Und: eine Suchanfrage ist
  eine personenbezogene Angabe, sobald sie an einem Konto hängt. Das ist
  keine Formalie, sondern entscheidet den Zuschnitt.

  `[read]` Fuehrt C-15 fort, das dasselbe kuerzer beschrieb.

  `[cmd]` **Erledigt 2026-08-15.** `nutrition.search_events` als
  Kettenschritt `057`, Auswertungsfunktion `search_events_report()`,
  Sitzungskennung über ein Cookie in `middleware.ts`, Insert nach der
  Suche in `food-search.ts` — **`food_search` selbst blieb unverändert.**

  `[cmd]` Rechte: `authenticated` hat **nur INSERT, kein SELECT**;
  Auswertung über `service_role`. Keine Nutzerkennung.
  `[cmd]` Laufzeit `huehnerbrust`: Median 743 ms vorher, 719 ms nachher —
  keine messbare Verlangsamung.

  **Entscheidung Tom, 2026-08-15 (Einwilligung):** Suchbegriffe werden
  ohne Opt-in mitgeschrieben. Begründung: Wer Bedenken hat, gibt manuell
  ein; niemand wird zur MealCam gezwungen. Das weicht bewusst vom Muster
  in `ADR_MEALCAM_CONSENT` ab (privat als Standard, Opt-in getrennt) und
  ist als bewusste Abweichung festgehalten, nicht als Versehen.

- [x] **C-23: Systematische Abdeckungsmessung statt handverlesener
  Begriffe** (neu 2026-08-14).
  `supabase/_pipeline/_validierung/suche-abdeckung-messen.ts` misst über
  eine Stichprobe des ganzen Bestands, ob ein Mensch das Lebensmittel
  findet — statt gegen 50 geratene Begriffe.

  `[cmd]` Stand 2026-08-14, 152 Lebensmittel: **0 % gar nichts gefunden**,
  **90,8 % in den ersten zehn**, **48,0 % auf Platz 1**.

  Die Aussage daraus: *der Wortschatz trägt, die Rangfolge nicht.*
  Die Lücke zwischen 90,8 und 48,0 ist die Arbeit von C-20 und C-21.

  **Warnung im Kopf der Datei, aus eigenem Schaden:** `[cmd]` Der erste
  Lauf nahm den ganzen Namenskopf als Anfrage und erzeugte
  `auberginegebratenohnefettpfanne` — 19,1 % Fehlschläge, die keine waren.
  *Wer eine Suche misst, misst zuerst, was er hineingibt.* Diese Regel
  steht seit `42-…` fest und wurde am selben Tag dreimal gebrochen.

  `[annahme]` Die Zahlen oben (48,0 % Platz 1) stammen von **vor** den
  Sortierstufen aus Block 32 und sind damit veraltet. Der Lauf ueber 152
  Lebensmittel dauert lange und wurde seither nicht wiederholt — vor der
  naechsten Entscheidung neu messen, nicht die alte Zahl zitieren.

  `[cmd]` **Erledigt 2026-08-15.** Bericht `docs/ssot/56-suchabdeckung.md`.
  152 Sollwerte, davon 99 Grundform, 52 einzige Form, 1 offen gelassen.

  | | alt 2026-08-14 | alt heute | neu heute |
  |---|---|---|---|
  | Platz 1 | 48,0 % | **46,1 %** | 79,5 % |
  | erste zehn | 90,8 % | 90,1 % | 97,4 % |

  **Die mittlere Spalte ist der Befund**, und er war nicht beauftragt:
  Die alte Bauart auf der heutigen Datenbank liefert 46,1 % — **C-38 hat
  die breite Abdeckung nicht verbessert.** Der Sprung auf 79,5 % kommt
  von der geänderten Frage, nicht vom Scoring. Ohne diese Gegenprobe
  hätte man aus 48 und 79,5 einen Erfolg gelesen, den es nicht gibt.

  **Was das über den MealCam-Massstab sagt:** C-38 hob ihn von 31 auf 34
  von 37 — auf 152 systematisch gezogenen Bestandseinträgen wirkt es
  nicht. Beide Messungen sind gültig und messen Verschiedenes: die eine,
  was Menschen suchen, die andere, was im Bestand steht.

  `[cmd]` Korrektur an der alten Punktfassung: die 152 sind **nicht
  handverlesen**, sondern jedes 47. Lebensmittel nach `bls_code`.
  `[cmd]` 74 % davon sind zubereitete Varianten — die alte Messung
  bestrafte die Suche dafür, dass sie zu `zucchini` die rohe Zucchini
  lieferte.

- [x] **C-42: Die Schemaprüfung um GRANTs und Policy-Bedingungen
  erweitern** (neu 2026-08-14). Die zwei blinden Flecken, die Claude Code
  in `docs/ssot/53-kettenluecke.md` selbst benannt hat.

  1. **GRANTs werden nicht geprüft.** `[read]` PostgREST prüft
     Tabellenrechte **vor** RLS — eine Tabelle mit tadellosen Policies,
     aber ohne `GRANT SELECT`, ist für die Anwendung genauso unerreichbar
     wie eine gesperrte. Der nächstliegende Kandidat.
  2. **Policy-Bedingungen werden nicht geprüft.** Geprüft wird, dass eine
     Policy für eine Operation existiert, nicht was sie erlaubt. Ein
     `USING (true)` auf `meals` bestünde die Prüfung und zeigte jedem
     alle Mahlzeiten.

  `[cmd]` Stand der Prüfung heute: 107 Einzelaussagen — 17 Zeilenschutz,
  32 Policies je Operation, 2 `security_invoker`, 4 Trigger, 14
  Fremdschlüssel. Indizes bewusst ausgelassen (Laufzeit, nicht
  Korrektheit).

  `[cmd]` **Erledigt 2026-08-15.** 291 Einzelaussagen statt 107:
  167 GRANTs über 19 Objekte, 17 Policy-Bedingungsarten
  (`oeffentlich` 10, `eigene_zeilen` 5, `admin` 2).
  Exit 0, **null Falschmeldungen** gegen das intakte Schema.
  Vier Eingriffe gefangen: `REVOKE SELECT`, `GRANT ALL`, `USING (true)`
  auf `meals`, `GRANT … TO anon`.

  `[cmd]` Ein Fund lag in der Sollliste, nicht in der Datenbank:
  `ALTER DEFAULT PRIVILEGES … ON TABLES` umfasst in Postgres auch
  Sichten (Objekttyp `r` für beide) — die vermeintlichen Zuvielrechte
  der zwei Sichten waren korrekt.
  `[cmd]` Und: INSERT-Policies tragen ihre Bedingung in `with_check`,
  nicht in `qual`; wer nur `qual` liest, hält jede für leer.

  **Der nächste blinde Fleck ist benannt:** Die Bedingung wird auf ein
  **Merkmal** geprüft, nicht auf ihre **Wirkung**.
  `USING (auth.uid() = user_id OR true)` nennt `auth.uid()` und bestünde
  die Prüfung — und zeigte jedem alles. Nur ein echter Zugriffstest mit
  zwei Nutzern schliesst das aus; `zugriffsrechte-pruefen.mjs` führt ihn
  teilweise, die Verbindung zwischen beiden Prüfungen fehlt.
  Dazu ungeprüft: Funktionsrechte (`[cmd]` 10 Funktionen mit `EXECUTE` —
  fehlte `is_admin()` an `authenticated`, wären beide Admin-Policies
  wirkungslos), Schema-`USAGE`, die Default Privileges selbst.

- [x] **C-16: Training hat dasselbe Wortschatzproblem — eine Runde
  früher erkennen** (neu 2026-08-13, aus Block 28) — `[cmd]`
  `training.exercises` trägt **1.416 Übungen mit ausschliesslich
  englischen Namen** (0 enthalten einen Umlaut), **keine Aliasspalte**,
  und im ganzen Schema `training` existiert **genau eine** Funktion.
  Wer „Bankdrücken" tippt, findet nichts.

  **Das ist dasselbe Muster, ein Modul weiter:** Jede Datenquelle bringt
  ihre eigene Sprache mit — der BLS deutsche Fachsystematik, der
  Übungskatalog englische Produktnamen — und **keine davon ist die des
  Nutzers**. Bei Nutrition hat es zwei Blöcke gekostet, das zu messen und
  die ableitbare Hälfte zu schliessen.

  **Was aus Block 28 übertragbar ist**, bevor Training eine Oberfläche
  bekommt: die Alias-Ableitung ist mechanisch (Zusammenschreibung,
  Trennzeichen) und braucht keine Pflege; die Relevanzstufen
  (`exakt > Alias exakt > Präfix > Wortanfang > irgendwo`) sind
  übertragbar; der Ausdrucks-Index auf die gefaltete Spalte ist
  Voraussetzung, sonst kostet es Laufzeit.
  **Der Unterschied:** Bei Training fehlt die deutsche Seite ganz — es
  geht nicht um Schreibvarianten, sondern um Übersetzung. Das ist keine
  Ableitung, sondern Inhalt.

---

  `[cmd]` **Gemessen 2026-08-15**, Bericht `docs/ssot/64-training-wortschatz.md`.
  **Ja, dasselbe Problem — und diesmal vor dem Bau sichtbar.**
  `[cmd]` Alle 1.416 Übungsnamen sind englisch (0 Einträge mit Umlaut),
  `training.exercises` hat **kein `name_de` und kein Aliasfeld**, und es
  gibt keine Suchfunktion. Gegen einfaches `ILIKE` gemessen:
  **3 von 34 Sollwerten auf Platz 1, 25 ohne jeden Treffer** —
  `bankdruecken`, `kniebeuge`, `kreuzheben`, `klimmzug`, `latzug`,
  `beinpresse` laufen leer.
  `[cmd]` Korrektur am Bestand: **107 Muskelgruppen, 6.624 Zuordnungen**,
  nicht 109 und 6.625.
  **Der Unterschied zu Nutrition:** dort wurde das Problem nach dem
  Bauen sichtbar. Hier gibt es weder Suchfunktion noch Feld, das
  umgebaut werden müsste — die deutsche Namensschicht kann von Anfang an
  mitgeplant werden.

- [x] **C-17: Suchlaufzeit — 547 ms bei zweiwortigen Anfragen** (neu
  2026-08-14). `[cmd]` Gemessen im Ausbau der Lebensmittelsuche:

  | Anfrage | ohne Gruppen | mit Gruppen |
  |---|---|---|
  | `spinat` | 295 ms | 296 ms |
  | `huehnerbrust` | 290 ms | 547 ms |
  | (leer) | 152 ms | 152 ms |

  Die Grundkosten lagen schon **vor** dem Ausbau bei 152–295 ms — die
  Suche war nie schnell. Zweiwortige Anfragen kosten rund 257 ms
  zusätzlich.

  **Ursache benannt, älter als der Ausbau:** `[cmd]` Die Bedingung faltet
  `concat_ws(bls_code, name_de, name_en, name_th)`, der Trigramm-Index
  liegt auf `search_fold(name_de)` — zwei verschiedene Ausdrücke, also
  sequenzieller Scan. Solange das so ist, hilft kein Index.

  **Ein Umbauversuch wurde verworfen und begründet:** sechs feste
  `text[]`-Slots statt jsonb, damit der Trigramm-Index greift. `[cmd]`
  Isoliert schneller (0,97 ms gegen 48 ms), eingebaut **langsamer**
  (704 ms gegen 562 ms), weil jeder der sechs Slots einen eigenen
  Durchlauf auslöst — auch die leeren. Messwerte stehen im Code an der
  Bedingung.

  Vorgehen: erst den Ausdruck der Bedingung und den des Index in Deckung
  bringen, dann neu messen. Nicht umgekehrt.

  `[cmd]` **Erledigt 2026-08-15**, Bericht `docs/ssot/63-suchlaufzeit.md`.
  Live: `huehnerbrust` **494 → 234 ms**, `spinat` 264 → 128 ms,
  Trefferzahlen unverändert, beide Massstäbe halten.

  **Die Diagnose in diesem Punkt war in beiden Teilen falsch:**
  `[cmd]` Einen Index auf `search_fold(name_de)` **gibt es gar nicht** —
  auf `foods` liegt nur ein GIN-Index, und der auf `name_display_de` aus
  C-41. Und er wäre ohnehin nicht der Engpass gewesen: der Seq Scan über
  `foods` kostet **1,9 %**, die Alias-Prüfung lief **14.212 mal** und
  trug 98 % der Buffer.

  Gewählt: eine Hilfsfunktion mit dynamischem SQL. `[cmd]` Der Grund ist
  messbar — dieselbe Bedingung kostet 2.120.811 Buffer, wenn die
  Alternative aus dem jsonb kommt, und 248, wenn sie als Literal
  dasteht. Ein Trigramm-Index braucht das Muster zur Planungszeit.

  **Vier von fünf Anläufen verworfen**, zwei Lehren daraus: *isoliert
  schnell heisst nicht eingebaut schnell* (Anlauf 3: Buffer 42.799 → 363,
  Zeit 255 → 506 ms), und `[cmd]` Anlauf 4 mass den eigenen Messaufbau —
  in der Datenbank kostet die Alias-Auflösung 5 ms, der Rest war
  docker/psql-Rundlauf.

  **Offen als eigene Baustelle:** `[cmd]` Von den 234 ms sind rund
  225 ms Grundkosten — die leere Anfrage ist gleich teuer geblieben.
  `[annahme]` Verdacht auf die beiden `LEFT JOIN LATERAL` und den
  zweiten Durchlauf für `total`. Ungemessen.

- [x] **C-22: Phonetische Schreibvarianten** (neu 2026-08-14). Eine
  eigene Klasse, die weder Zerlegung noch Thesaurus abdeckt — und auch
  nicht abdecken kann.

  `[cmd]` `kornflakes` liefert **null Treffer**; `cornflakes` und
  `corn flakes` liefern beide fünf. Ein deutscher Schreiber macht aus dem
  `c` ein `k`. `Korn` und `Corn` sind aber verschiedene Wörter mit
  verschiedener Bedeutung — ein Synonym wäre falsch.

  Die Klasse ist grösser: `c`/`k`, `f`/`ph`, `i`/`y`, `t`/`th`, `k`/`ck`,
  `s`/`ss`/`z`. `[cmd]` `yoghurt` steht bereits als bekannt offen im
  Prüfskript und gehört hierher.

  Vorschlag: eine kleine Regeltabelle auf der **Anfrageseite**, nicht in
  der Datenbank — wenn eine Anfrage nichts findet, die Varianten
  probieren. Nicht als Synonym eintragen: `Korn` soll weiterhin
  Getreidekörner finden.

  Vorher zu messen: wie viele der 3.656 Bestandswörter tragen überhaupt
  einen dieser Laute? Bei wenigen lohnt die Regel nicht.

  `[cmd]` Nachgemessen 2026-08-14: `kornflakes` und `yoghurt` liefern
  weiterhin **null Treffer**. Unveraendert offen.

  `[cmd]` **Gemessen 2026-08-15**, Bericht
  `docs/ssot/58-phonetische-varianten.md`, Daten in
  `daten/phonetische-varianten.json`. 3.616 gefaltete Bestandswörter;
  je Lautpaar betroffen/verwechselbar: `c`/`k` 2.088/196,
  `k`/`ck` 1.271/229, `i`/`y` 1.839/53, `t`/`th` 1.722/21,
  `f`/`ph` 800/**2**. Sechs Regeln mit Gegenbeispielen, ausdrücklich
  **nur als Nulltreffer-Fallback** — nie als generelle Erweiterung.

  **Entscheidung Tom, 2026-08-15:** Die Testfälle `fysalis`, `kracker`
  und `sose` sind **entfernt**. Er kennt keinen davon; sie stammen aus
  der Regel, nicht aus der Praxis. Es bleiben `kornflakes` und `yoghurt`,
  beide aus dem MealCam-Massstab belegt. Weitere Fälle kommen aus
  `nutrition.search_events` — echten Fehlsuchen statt geratenen Wörtern.

  **Die Regeln sind vorbereitet, nicht gebaut.** Ob sie gebaut werden,
  entscheidet sich an den ersten Protokolldaten.

  `[cmd]` **Erledigt 2026-08-15 als Vorbereitung**, Bericht
  `docs/ssot/58-phonetische-varianten.md`, Regeln in
  `daten/phonetische-varianten.json`. Sechs Regeln mit Gegenbeispielen,
  ausdrücklich **nur als Nulltreffer-Fallback**.
  **Gebaut werden sie erst, wenn `nutrition.search_events` zeigt, dass
  jemand so tippt** — die Entscheidung ist bewusst vertagt.

- [x] **C-32: Reis vollständig kurieren — der erste Fall, an dem sich das
  Modell beweist** (neu 2026-08-14). Pilot für C-29 und C-31.

  **Warum Reis:** Grundnahrungsmittel eines Kraftsportlers, täglich, in
  jeder Mahlzeit. `[cmd]` Und heute liefert `basmatireis` **null
  Treffer**. Der Fall ist klein genug, um in einer Sitzung fertig zu
  werden, und gross genug, um jede Frage des Modells zu stellen.

  `[cmd]` **Der Bestand: 13 Arten, 32 Einträge.**

  | Art | Einträge | `name_de` heute | `name_en` | Vorschlag Anzeige |
  |---|---|---|---|---|
  | `C352` | 3 | Reis poliert, roh/gekocht | **White rice** | Weisser Reis |
  | `C350` | 2 | Reis poliert, gedämpft/geschmort | White rice | Weisser Reis |
  | `C359` | 4 | Reis parboiled, poliert | Rice parboiled | Parboiled-Reis |
  | `C351` | 3 | Reis unpoliert | **Brown rice** | Vollkornreis |
  | `C353` | 3 | Wildreis | Wild rice | Wildreis |
  | `C354` | 2 | Reismischung mit Wildreis | Rice mix | Reismischung mit Wildreis |
  | `C356` | 2 | Reis Grieß | Rice semolina | Reisgrieß |
  | `C453` | 1 | Reis Mehl | Rice flour | Reismehl |
  | `C456` | 1 | Reis Stärke | Rice starch | Reisstärke |
  | `C457` | 1 | Reis Kleie | Rice bran | Reiskleie |
  | `C532` | 6 | Reis gepufft, Reiswaffeln, **Schokolade** | — | **Gruppe trennen** |
  | `C559` | 2 | Reisnudeln | Rice noodles | Reisnudeln |
  | `C650` | 2 | Reisdrink | Rice drink | Reisdrink |

  **Was der BLS nicht kennt:** `[cmd]` **kein Basmati, kein Jasmin, kein
  Sushi-, Risotto- oder Milchreis.** Der BLS unterscheidet nach
  Verarbeitung, nicht nach Sorte. Diese Namen gehören deshalb in die
  **Aliasschicht**, nicht in den Anzeigenamen: Basmati, Jasmin,
  Langkorn, Rundkorn und Sushireis zeigen alle auf `C352`. Wer `C352`
  „Basmatireis" nennt, lässt die anderen vier verschwinden und behauptet
  eine Genauigkeit, die die Nährwerte nicht haben. `[Wahrscheinlich]`
  Für die Makronährwerte ist der Sortenunterschied ohnehin
  vernachlässigbar; er liegt beim glykämischen Index.

  **Vorsicht bei `milchreis`** — das ist zugleich ein fertiges Gericht.
  Vor dem Eintragen prüfen, ob ein Y-Eintrag existiert; sonst führt der
  Alias die Zutatensuche in ein Dessert.

  **Zwei Befunde zur Gruppierung aus C-28, hier schon sichtbar:**
  - `[cmd]` **`C532` ist zu grob:** die Gruppe enthält `Reis gepufft`,
    drei Reiswaffeln **und zwei Schokoladen mit Puffreis**. Vier Stellen
    trennen hier nicht.
  - `[cmd]` **`C350`, `C352` und `C359` sind zu fein:** alle drei sind
    polierter Reis, nur mit anderen Zubereitungen. Vier Stellen trennen
    hier zu viel.

  Beide Richtungen des Fehlers an einem einzigen Lebensmittel. Der Fall
  gehört als Prüfstein in den Bericht zu C-28.

  **Abnahme:** `basmatireis`, `jasminreis`, `sushireis`, `vollkornreis`,
  `naturreis`, `parboiled reis` und `reis` liefern je den richtigen
  Eintrag auf Platz 1 — als feste Erwartungen im MealCam-Maßstab, nicht
  als Sichtprüfung.

  `[cmd]` **Erledigt 2026-08-15.** Die Sortenzuordnungen sind eingespielt
  (Schritt `028`, `curated_suchbegriff`), das Prüfskript steht bei
  **7 von 7** statt 4. `basmatireis`, `jasminreis`, `vollkornreis`,
  `naturreis`, `parboiled reis`, `reis` und `griechischer joghurt`
  treffen ihren Sollwert auf Platz 1.

  **Zwei Entscheidungen Toms:** `sushireis` bekommt **zwei** Ziele
  (`C352000` rohe Zutat und `X8A1100` Grundrezept) — der Nutzer wählt.
  `griechischer joghurt` zeigt nach Recherche auf `M148500`
  (Sahnejoghurt mit Magermilchpulver, 10 % Fett / 4,0 g Protein), weil
  das im deutschsprachigen Handel als „griechischer Art" verkaufte
  Produkt genau das ist; der zuvor vorgeschlagene `M141100` mit 0,1 g
  Fett war falsch. `milchreis` und `risotto` sind **nicht** zugeordnet —
  `[cmd]` beide existieren im BLS ausschliesslich als Gericht.

  `[read]` Die Anzeigenamen der 13 Reis-Arten kamen mit C-39 Phase 1:
  `Weißer Reis (roh)`, `Vollkornreis (roh)`, `Parboiled-Reis (roh)`.

- [x] **C-34: Eigene Lebensmittel der Nutzer** (neu 2026-08-14,
  neugefasst nach Sichtung der Nutrition-Specs). Unabhängig vom
  Suchumbau.

  **Der Fall ist bereits entschieden, nicht offen.** `[read]`
  `docs/specs/Nutrition/04_adrs/ADR_CUSTOM_FOODS_V1.md` und
  `docs/specs/Nutrition/02_patches/SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md`
  legen Modell und Pflichtfelder fest. Was hier steht, ist die Umsetzung
  dieser Entscheidung plus die Punkte, die dort offen geblieben sind —
  keine Neuerfindung.

  **Was die Spec festlegt:**

  | | |
  |---|---|
  | Tabelle | `foods_custom`, **vollständig getrennt** von `foods`, kein Merge |
  | Sichtbarkeit V1 | nur für den erstellenden Nutzer; `is_public`/`shared_by` sind Phase 2 |
  | Pflichtfelder | `name_de`, `enercc`, `prot625`, `fat`, `cho` — je 100 g |
  | Optional | weitere Makros, ein Mikro-Subset (21 Felder), `brand`, `barcode`, `serving_size_g`, `custom_allergens` |
  | Nährwertform | **flache Spalten**, nicht EAV |
  | `source` | `user` · `manual` · `import` · `admin` |
  | Ausgeschlossen | OpenFoodFacts |
  | Suche | erscheinen zusammen mit BLS, bevorzugt, als „Eigenes Food" markiert |

  **Toms Ergänzung (2026-08-14), die über die Spec hinausgeht:** Der
  Eintrag ist für den Nutzer **sofort verwendbar** — er verantwortet
  seine Werte selbst. Zusätzlich erscheint er im Admin-Backend und kann
  **nach Prüfung freigegeben** werden; so wächst der zentrale Bestand
  kontrolliert. Die Spec kennt dafür nur `source = admin` („Admin pflegt
  zentral") und schiebt Teilen nach Phase 2. **Die Freigabe ist damit
  eine Erweiterung, keine Umsetzung** — sie gehört als solche
  dokumentiert, bevor sie gebaut wird.

  **Der Grundsatz, an dem sich alles ausrichtet** (Tom): Ein Shake mit
  vier Makros und ein paar Mikros ist besser, als wenn er im Tagebuch gar
  nicht vorkommt.

  **Was im Schema schon da ist:** `[cmd]` `nutrition.meal_items` trägt
  `food_source` mit Prüfbedingung `IN ('bls','manual')` und der Regel,
  dass `food_id` bei `manual` leer sein **muss**. Dazu `frozen_at` und
  eine `nutrients`-Spalte — die Mahlzeitzeile hält die Nährwerte als
  Kopie, nicht als Verweis. **Damit ist ein Problem bereits gelöst,
  bevor es auftritt:** Wird ein eigener Eintrag später korrigiert oder
  bei der Freigabe angepasst, ändert sich das Frühstück von letzter Woche
  nicht rückwirkend. Der heutige `manual`-Zweig hat aber keinen Eintrag
  dahinter; für wiederverwendbare eigene Lebensmittel braucht es einen
  dritten Zustand mit eigener Identität.

  **Warum die Trennung richtig ist — der Grund ist nicht der, den man
  zuerst nennt.** Rechte liessen sich auch mit `owner_id` in einer
  Tabelle regeln. Der harte Grund ist der Kettenaufbau: `[cmd]` Der
  Bestand entsteht in unter zehn Sekunden neu aus `supabase/_pipeline/`.
  Nutzerdaten in `nutrition.foods` wären bei jedem Aufbau entweder weg
  oder zwängen die Kette zu einer Rücksicht, die sie nicht kennt. Dazu
  die Prüfbarkeit: `[cmd]` Der Abgleich gegen die amtliche Arbeitsmappe
  (698.092 Werte, 353 Abweichungen, alle Rundungen) setzt voraus, dass in
  der Tabelle nur steht, was aus ihr stammt.

  **Der Preis, der eingeplant gehört:** Die Suche muss beide Mengen
  sehen, und `food_search` ist heute auf eine Tabelle gebaut. Ebenso die
  Aggregation — `[read]` ADR-0003 hat für BLS **EAV** gewählt, die Spec
  für `foods_custom` **flache Spalten**. Beides ist je für sich richtig
  (138 Nährstoffe gegen 25), aber die Tagessumme muss beide Formen
  addieren.

  **Vier offene Punkte:**

  1. **Plausibilitätsprüfung vor der Freigabe.** Wenn die vier Makros
     Pflicht sind, ist die Gegenrechnung kostenlos: 4 kcal je Gramm
     Protein und Kohlenhydrate, 9 je Gramm Fett, 7 je Gramm Alkohol.
     Weicht `enercc` um mehr als etwa zehn Prozent ab, stimmt etwas
     nicht. Das fängt die Verwechslung „je Portion statt je 100 g" —
     `[Wahrscheinlich]` der häufigste Eingabefehler überhaupt.
  2. **Duplikate.** Tausend Nutzer legen tausendmal „Proteinshake" an.
     Ohne Behandlung wächst nicht der Bestand, sondern der Müll.
     `[Vermutung]` Der Hebel liegt vor der Freigabe: Wenn die Suche über
     eigene Einträge gut funktioniert, legt der Nutzer den Shake gar
     nicht erst zweimal an. Das koppelt diesen Punkt an C-30 zurück.
  3. **Rangfolge.** Die Spec sagt „bevorzugt, höherer `sort_weight`".
     `sort_weight` ist eine Spalte von `nutrition.foods`; für eine
     getrennte Tabelle braucht es ein Äquivalent und eine Regel, wie
     zwei Ranglisten zusammengeführt werden.
  4. **Ein Widerspruch in der Spec selbst, vor der Umsetzung zu klären:**
     `[read]` `ADR_CUSTOM_FOODS_V1.md` schliesst `mealcam` als
     `source`-Wert ausdrücklich aus (MealCam soll `user` schreiben),
     `SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md` führt `source` als
     `user | mealcam`. Zwei Spec-Dateien, zwei Aussagen.

  **Keine Sortenkopien.** `[cmd]` `C352000` trägt 101 Nährwerte; fünf
  Reissorten mal drei Zubereitungen wären 15 Einträge und 1.515 Werte
  ohne eine einzige neue Messung. `[cmd]` `data_source` kennt heute genau
  zwei Werte, beide auf die Arbeitsmappe zurückführbar. Kopien erzeugen
  Werte ohne Quelle; der nächste Abgleich meldet dann Abweichungen, die
  keine sind. Sorten ohne eigene Messwerte gehören in die Aliasschicht.

  `[cmd]` **Erledigt 2026-08-15**, Berichte
  `docs/ssot/66-eigene-lebensmittel-entwurf.md` und `71-…`.
  `nutrition.foods_custom` steht als Kettenschritt `058`: getrennt von
  `foods`, flache Nährwertspalten, Zeilenschutz mit vier Policies je
  Operation, `is_public`/`shared_by` angelegt aber ungenutzt (Phase 2).
  `meal_items` trägt jetzt `food_source='custom'` und `custom_food_id`.

  **Die Plausibilitätsprüfung ist gebaut** als
  `nutrition.custom_food_energy_plausibility` — sie **meldet, blockiert
  nicht**: 4 kcal je Gramm Protein und Kohlenhydrate, 9 je Fett, 7 je
  Alkohol, Abweichung über zehn Prozent gilt als unplausibel. In beide
  Richtungen geprüft.

  `[cmd]` Der Testlauf hat die offene Frage aus dem Entwurf beantwortet:
  Die Tagesbilanz zählt eigene Einträge über die eingefrorenen
  `meal_items`-Werte korrekt.

  **Entscheidung Tom:** `mealcam` ist **kein** `source`-Wert — zwei ADRs
  im Status Final führen `user | manual | import | admin`, nur eine
  Patch-Datei führte `mealcam`. MealCam schreibt `user`.

  **Was fehlt:** die Oberfläche. Die Tabelle ist leer und bleibt es, bis
  ein Nutzer etwas anlegen kann.

- [x] **C-37: Tagesbilanz muss „nicht erfasst" von „nicht enthalten"
  unterscheiden** (neu 2026-08-14). Vor dem Bau der Summen zu
  entscheiden, nicht danach.

  `[read]` ADR-0003 lässt den Aggregationsweg ausdrücklich offen —
  Sicht, materialisierte Sicht oder Summentabelle. Diese Entscheidung
  gehört mit hinein.

  **Der Anlass:** `[cmd]` Der BLS-Bestand trägt im Schnitt **121,8
  Nährwerte je Eintrag**. `[read]` Ein eigener Eintrag nach C-34 hat vier
  Pflichtwerte; alles darüber ist freiwillig. Auf einer Verpackung stehen
  sieben.

  Wer die Hälfte seiner Kalorien aus eigenen Einträgen bezieht, hat für
  die meisten Mikronährstoffe **keinen Wert** — nicht null. Behandelt die
  Summe die Lücke wie eine Null, zeigt sie eine Unterversorgung an, die
  möglicherweise nicht existiert. Bei einer Anwendung mit medizinischem
  Anspruch ist das die falsche Art von Fehler, und sie trifft
  ausgerechnet die Nutzer, die eigene Einträge am meisten verwenden.

  **Zu entscheiden:** wie die Tagesbilanz Lücken führt (fehlend gegen
  null), was die Oberfläche anzeigt, und ob je Nährstoff ein
  Abdeckungsgrad mitgeführt wird („85 % der heutigen Kalorien haben einen
  Eisenwert").

  `[cmd]` **Erledigt 2026-08-15**, Bericht
  `docs/ssot/70-tagesbilanz-mikros.md`. `nutrition.daily_summary` führt
  jetzt **70 Spalten** statt 22: 24 Mikronährstoffe mit je einem
  Fehlzähler, dazu die acht Makros.

  **Entscheidung: flach, nicht JSONB** — und die Zahl, die sie trug,
  zeigte in die andere Richtung als erwartet: `[cmd]` 23 von 24 Codes
  sind über 94 % belegt (Iodid am schwächsten mit 87,2 %). JSONB lohnt
  bei dünnen Daten; hier wäre fast jeder Schlüssel in fast jeder Zeile
  gesetzt und der Name je Zeile mitgeschrieben.

  **Die Spec-Variante mit `COALESCE(…, 0)` ist nicht übernommen.** Der
  Beleg an echten Zeilen: `[cmd]` Tag 1 `vitc = 0.00000` bei
  `vitc_missing = 0` (gemessene Null) gegen Tag 2 `vita = NULL` bei
  `vita_missing = 2` (nicht gemessen). Mit `COALESCE` stünde beides auf
  null.

  **Ein blinder Fleck wurde dabei geschlossen:** `[cmd]` Der
  Sollstand-Eintrag führte Name, Schritt, `security_invoker` und Grants
  — **keine Spalten**. Die 48 Mikro-Spalten hätten ersatzlos
  verschwinden können, Exit 0. Nachgerüstet und zum Fehlschlagen
  gebracht (Sicht auf drei Spalten verkürzt → „67 Spalten FEHLEN").

  **Diese Sicht summiert, sie bewertet nicht.** `[cmd]` 0 von 138
  Nährstoffen tragen einen RDA-Wert — das ist C-45.

- [x] **C-43: Die Kette ausführbar machen** (neu 2026-08-14).

  `[cmd]` **Es gibt keine Kettensteuerung.** Eine Volltextsuche nach den
  Schrittdateien findet genau eine Fundstelle: `supabase/README.md`. Kein
  Skript, kein `package.json`-Eintrag — die Kette ist eine Prosa-Tabelle,
  die von Hand abgearbeitet wird.

  Genau daran ist am 2026-08-14 der Neuaufbau gescheitert: Die Tabelle
  endete bei `021`, **vierzehn Schritte fehlten**, fünf davon wirkten
  tatsächlich nicht. Die Tabelle ist jetzt vollständig (20 Zeilen) — die
  fehlende Ausführbarkeit bleibt.

  **Was zu entscheiden ist, bevor gebaut wird:** ob die Reihenfolge aus
  der README gelesen wird (dann ist sie Steuerung und Dokumentation
  zugleich, mit dem Risiko, dass Prosa zu Code wird) oder aus einer
  eigenen Datendatei, die gegen die README geprüft wird.

  **Zwei Stolpersteine gehören mit hinein**, beide am 2026-08-14
  gemessen: `public.handle_new_user()` und `public.is_admin()` überleben
  `DROP SCHEMA nutrition CASCADE` und lassen die Baseline mit „already
  exists" abbrechen; Schritt `030` liest per `\\copy` aus
  `/tmp/p1-005-bls-local-import/` **im Container**, nicht lokal.

  `[cmd]` Und die Falle, die knapp nicht zuschlug: Ohne `auth`-Schema
  bricht `052` **nach** dem Anlegen ab, rollt zurück, und die Ausgabe
  besteht aus lauter `NOTICE … skipping`-Zeilen. Wer nach `ERROR` am Ende
  sucht, sieht nichts.

  `[cmd]` **Erledigt 2026-08-15**, Bericht
  `docs/ssot/69-kette-ausfuehrbar.md`. `supabase/_pipeline/kette.json`
  als Reihenfolge, `kette-ausfuehren.ts` als Ausführer,
  `kette-readme-pruefen.ts` als Abgleich gegen die README.
  `[cmd]` **38 Schritte dokumentiert, Lauf von leer in rund 32 Sekunden**,
  danach automatisch die Vollständigkeitsprüfung.

  **Der Ausführer verweigert die laufende Datenbank** — nur
  Wegwerf-Datenbanken. Einspielen in den laufenden Stand bleibt
  Handarbeit je Schritt.

  **Beim ersten Lauf fand er sofort einen Defekt:** `[cmd]`
  `EXPECTED_LINES = 5775` stand hart in `025` und `026`, die Datei war
  auf 7.140 gewachsen — die Kette brach ab. **Und der Defekt hatte still
  Daten unterschlagen:** 28 kuratierte Nebennamen (*Rote Bete*,
  *Lauchzwiebel*, *Buletten*) wurden nie eingespielt, weil `025` genau
  dort abbrach. Die Erwartung wird jetzt aus drei Quellen abgeleitet
  (Ausgabe, Eingabe, Bestand); weicht eine ab, nennt der Abbruch alle
  drei Zahlen. Dasselbe in `027` nachgezogen.

  `[cmd]` **Ein weiterer Defekt fiel beim Live-Einspielen auf:** `026`
  und `028` setzen **beide** die Prüfbedingung
  `food_aliases_source_check`, jeder mit eigener Werteliste. Auf leerer
  Datenbank unsichtbar, weil `028` später erweitert — gegen einen
  Bestand mit `028`-Zeilen bricht `026` ab. Beide Listen jetzt
  vollständig.

  `[cmd]` **Und `062` war nie gelaufen**: `pruef_objektliste` fehlte in
  der laufenden Datenbank. Nachgefahren.

  **Der methodisch beste Fund steht im Bericht:** Der erste Sucher nach
  weiteren harten Zahlen meldete 3 Stellen, ein breiterer fand 10 —
  *„der enge Sucher war selbst ein Werkzeug, das Sicherheit behauptet,
  ohne sie zu erzeugen; er zählte nur, was er erwartet hatte."*

- [x] **C-44: Die zwölf leeren Tags den Lebensmitteln zuweisen** (neu
  2026-08-15). **Tom, 2026-08-15: „genau diese tag filter sind wichtig,
  also brauchen wir und müssen dementsprechend die tags den foods
  zuweisen können."**

  `[cmd]` Von 16 definierten Tags sind **vier vergeben**, zwölf stehen an
  null Lebensmitteln:

  | vergeben | Einträge |
  |---|---|
  | `low_carb` | 4.659 |
  | `low_fat` | 2.648 |
  | `high_protein` | 1.400 |
  | `high_fiber` | 558 |

  **Leer:** `vegan` · `vegetarian` · `gluten_free` · `lactose_free` ·
  `halal` · `kosher` · `nut_free` · `thai_food` · `spicy` ·
  `mediterranean` · `processed_food` · `ultra_processed`.

  **Warum das kein Schönheitsfehler ist:** Ein Filter, der technisch
  funktioniert und nie einen Treffer liefert, ist schlimmer als ein
  fehlender — er sieht aus, als sei die Datenbank leer. Der Fehler fällt
  niemandem auf, weil nichts abstürzt.

  **Die vier vergebenen sind aus Nährwerten abgeleitet. Die zwölf sind es
  nicht.** `vegan`, `vegetarian`, `gluten_free`, `nut_free`, `halal`,
  `kosher` brauchen Wissen über die Zutaten, nicht über die Nährwerte —
  das ist dieselbe Sorte Aufgabe wie die Anzeigenamen und gehört in einen
  Batch mit menschlicher Abnahme.

  **Zwei Tags sind Sonderfälle:**
  - `[cmd]` `thai_food`: 0 von 7.140 Einträgen tragen `name_th`, 0
    Thai-Aliase. `[read]` `ADR_BLS_ONLY` Abschnitt 16 will Thai nur
    strukturell. Der Tag hat im BLS-Bestand nichts zu markieren — er
    gehört zu C-34.
  - `processed_food` / `ultra_processed`: `[cmd]` `processing_level` ist
    zu 100 % mit `raw` gefüllt, auch für Bechamelsauce. Die Spalte ist
    **falsch**, nicht leer. Wer die Tags daraus ableitet, überträgt den
    Fehler.

  **Fachlich heikel und deshalb vorher zu klären:** `gluten_free` und
  `nut_free` sind Allergenaussagen. Eine falsche Markierung kann jemanden
  krank machen. `[read]` `SPEC_06` führt bei `foods_custom` ein Feld
  `custom_allergens` nach EU-14 — die Frage, ob LumeOS Allergenfreiheit
  überhaupt behauptet oder nur Zutaten ausweist, ist eine
  Produktentscheidung, keine Datenaufgabe.

  `[read]` Dazu ein zweiter Befund aus `docs/ssot/60-nutrition-specs-auswertung.md`:
  `food_tags` trägt nur `food_id`, `tag_code`, `confidence` — **kein
  Quellen- oder Grundfeld**, obwohl SPEC_09 Abschnitt 5 verlangt, dass
  Tags erklärbar sind. Vor dem Befüllen zu entscheiden.

  `[cmd]` **Erledigt 2026-08-15**, Bericht
  `docs/ssot/62-lebensmittel-tags.md`, eingespielt als Schritt `027`.
  `food_tags` von 9.265 auf **17.967**.

  **Zwei Entscheidungen Toms haben die Tags umgebaut:**

  `[read]` **Allergene werden umgekehrt markiert.** Aus `nut_free` wurde
  `contains_nuts`, aus `gluten_free` `contains_gluten`, aus
  `lactose_free` `contains_lactose`. Der Grund: „Enthält Nüsse" lässt
  sich belegen, „enthält keine Nüsse" nicht. Der Filter blendet die
  Markierten aus; ein unmarkierter Eintrag gilt als **ungeprüft**, nicht
  als sicher. Allergien werden im Onboarding erfasst; in Nutrition ist
  es ein Suchfilter, keine medizinische Zusicherung.

  `[cmd]` **`processed_food` traf 84 % und wurde gestrichen.** Ein
  Filter, der fast alles behält, trennt nichts. Nach NOVA ersetzt durch
  die Ränder: **`whole_food` 2.884** (NOVA 1+2) und `ultra_processed`
  927 (NOVA 4). **Die Mitte bleibt unmarkiert** — 1.990 Einträge, weil
  ohne Zutatenlisten nicht belegbar.

  `mediterranean` (15) und `spicy` (11) zurückgezogen: ein Filter mit elf
  Treffern über 7.140 Einträge ist eine Zufallsliste. `thai_food`,
  `halal`, `kosher` bleiben definiert und leer — sie gehören zu C-34.

- [x] **C-45: Nährstoff-Referenzwerte in eine eigene Tabelle** (neu
  2026-08-15). **Entscheidung Tom, 2026-08-15: eigene Tabelle.**
  Voraussetzung für C-37.

  `[cmd]` **0 von 138 Nährstoffen tragen `rda_male` oder `rda_female`**,
  und `nutrition.nutrient_reference_values` existiert nicht. Beide
  vorgesehenen Orte sind leer.

  `[read]` Der Widerspruch aus der Spec-Auswertung: `SPEC_09_SCORING`
  liest die Referenzwerte aus Spalten in `nutrient_defs`, Abschnitt 8
  derselben Datei will eine eigene Tabelle mit RDA, AI, UL und
  Altersabhängigkeit. **Die Spaltenlösung kann Abschnitt 8 nicht
  abbilden** — eine Spalte je Nährstoff trägt keine Altersstaffel und
  keine drei Wertarten.

  **Zu klären, bevor gebaut wird:**
  - **Woher kommen die Werte?** D-A-CH-Referenzwerte (DGE), EFSA, oder
    die Kennzeichnungswerte der EU-LMIV? Sie unterscheiden sich, und die
    Quelle gehört je Zeile dokumentiert — dieselbe Regel wie beim BLS.
  - Welche Achsen: Alter, Geschlecht, Schwangerschaft, Stillzeit? Jede
    Achse vervielfacht die Zeilen.
  - `[cmd]` 138 Nährstoffe — für wie viele gibt es überhaupt
    Referenzwerte? Vermutlich deutlich weniger.
  - Was passiert mit den vorhandenen leeren Spalten `rda_male` und
    `rda_female`? Entfernen oder als überholt kennzeichnen — stehen
    lassen und ignorieren ist die schlechteste Wahl.

  `[read]` `packages/scoring/` existiert nicht, obwohl SPEC_09 darauf
  aufbaut. Der Tages-Score (0–100, nie gespeichert) ist eine andere
  Kennzahl als `sort_weight` und hängt an dieser Tabelle.

  `[cmd]` **Erledigt 2026-08-15**, Bericht `docs/ssot/61-referenzwerte.md`.
  `nutrition.nutrient_reference_values` als Kettenschritt `016`:
  **165 Zeilen über alle 138 Nährstoffcodes, keine ohne Quelle** —
  je Zeile Quelle, Fundstelle und URL.

  **Der erste Anlauf endete mit „keine Quelle vorhanden" — das war
  falsch.** Gesucht worden war nach den D-A-CH-Referenzwerten (Buch,
  kostenpflichtig), und daraus wurde geschlossen, die Beschaffung sei
  Toms Sache. `[read]` Die EFSA veröffentlicht 34 Gutachten mit
  Referenzwerten für 14 Vitamine und 15 Mineralstoffe, nach Lebensphase,
  Geschlecht und Alter aufgelöst — frei als **DRV Summary Tables** und
  über den **DRV Finder**. Dazu die US DRI der National Academies und
  WHO/FAO für die Aminosäuren.

  **Toms Vorgabe war „alle 138", nicht nur die 32 der Spec-Priorität:**
  *„Was bringen mir 138 Mikros, wenn ich nicht weiss, was ich brauche?"*
  Jeder Nährstoff hat jetzt eine Antwort:

  | | |
  |---|---|
  | `PRI` (entspricht RDA) | 22 |
  | `AI` | 25 |
  | `UL` (Obergrenze) | 19 |
  | `RI` / `PRI_COMBINED` / weitere | 6 |
  | **`NO_STANDALONE_REFERENCE`** | **57** — geht in einem Sammelwert auf |
  | **`NO_REFERENCE`** | **21** — es gibt keinen |
  | `FORMULA` | 15 — wird berechnet |

  **Die beiden Nicht-Kategorien sind der eigentliche Ertrag.** Eine
  Leerstelle ohne Erklärung wäre kein Ergebnis gewesen; so sieht man
  jedem Nährstoff an, warum er keinen Wert trägt.

  `[cmd]` Belegte Werte, gegen die Quellen geprüft: Eisen PRI 11 mg
  (männlich) und 16 mg (weiblich), Vitamin C 110 und 95 mg, Vitamin D
  AI 15 µg, Natrium AI 2.000 mg; Obergrenzen von den National Academies,
  wo EFSA keine setzt.

  `[cmd]` Die zwölf UL-Werte, die ohne Quellenangabe im Repo lagen,
  wurden **nicht** übernommen. `rda_male`, `rda_female` und `rda_unit`
  in `nutrient_defs` sind als überholt gekennzeichnet.

- [x] **C-47: Nutzerprofil und Bewertung der Tagesbilanz** (neu und
  erledigt 2026-08-15). Bericht `docs/ssot/72-profil-und-bewertung.md`.

  `[cmd]` **Ausgangslage:** `public.profiles` trug genau drei Spalten —
  `id`, `created_at`, `updated_at`. Ohne Alter und Geschlecht lässt sich
  kein Referenzwert auswählen.

  **Gebaut, zwei Commits:**
  - `090_profile.sql`: `birth_date` (nicht Alter — ein gespeichertes
    Alter ist am nächsten Geburtstag falsch), `biological_sex`,
    `height_cm`, `body_weight_kg`, `activity_level`, `nutrition_goal`,
    Schwangerschaft und Stillzeit **als Zeiträume** mit Start und Ende.
  - `059_daily_reference_assessment.sql`: führt `daily_summary`, die
    Referenzwerte und das Profil zusammen — je Nährstoff Wert, Wertart,
    Richtung, Deckungsgrad.

  **Entscheidung Tom, 2026-08-15:** ein Geschlechtsfeld, zwei Werte
  (`male`/`female`). `[cmd]` Für die Referenzwerte ist das die einzige
  tragfähige Grundlage — EFSA setzt Eisen 11 gegen 16 mg biologisch.
  `[read]` E-07 (Darstellung der Übungsmedien) bleibt davon unberührt
  und wurde nicht zusammengelegt.

  **Zwei Belege aus dem Testlauf:**
  `[cmd]` Dieselbe Mahlzeit mit 8 mg Eisen ergibt bei einem Mann von 30
  **72,7 %**, bei einer Frau von 30 **50,0 %** — die Zuordnung greift.
  `[cmd]` Fehlendes Vitamin A liefert `reference_status = 'incomplete'`
  **ohne Prozentwert**, statt eine Vollständigkeit vorzutäuschen.

  **Bewusst nicht gebaut:** kein Ampelzustand, keine Bewertung in
  Worten, kein Tages-Score, keine `micro_flags`. Die Funktion liefert
  die Zahl und ihre Art; was daraus wird, ist eine Produktentscheidung
  (C-49).

- [x] **C-50: Portionsgrössen** (neu 2026-08-15). **Tom, 2026-08-15:**
  *„Da müssen wir noch Portionen definieren"* — und auf Nachfrage:
  *„Hatten wir auch schon komplett gelöst, suche."*

  **Er hatte recht. Es ist eine Übernahme, keine Neuentwicklung.**
  `[cmd]` Drei Fundstellen in `referenz/lumeos-2026/`:

  | | |
  |---|---|
  | `supabase/migrations/002_create_nutrition_tables.sql` | `foods_portions` — `food_id`, `name_de`, `name_en`, `amount_g`, `is_default` |
  | `scripts/seed-portions.py` | 8 KB, über 100 Portionseinträge |
  | `src/modules/nutrition/hooks/useFoodPortions.ts` | der Lesepfad |

  **Der Ansatz hängt an der Kategorie, nicht am Lebensmittel.** `[cmd]`
  Fünf universelle Portionen (EL 15 g, TL 5 g, Tasse 250 g, Glas 200 ml,
  100 g) plus kategoriespezifische: `Brot` bekommt Scheibe 30 g, dicke
  Scheibe 50 g, Brötchen 60 g, Toast 25 g; `Fleisch` Portion 150 g,
  Steak 200 g, Hähnchenbrustfilet 175 g; `Obst` Stück klein/mittel/gross
  und Handvoll.

  **Damit sind es rund hundert Definitionen statt 7.140 Kurationen.**
  Die erste Fassung dieses Punktes hat das Problem um zwei
  Grössenordnungen zu gross beschrieben — der Fehler lag darin, nicht
  zuerst im Vorgängerrepo gesucht zu haben.

  **Was bei der Übernahme zu klären ist:**
  - `[cmd]` Das alte Schema nutzt `public.foods`, dieses `nutrition.foods`
    mit `bls_code` als Schlüssel. Die Zuordnung Kategorie → Portion muss
    gegen `nutrition.food_categories` (518 Einträge) neu gelegt werden,
    nicht gegen die alten Muster.
  - **Gramm bleibt kanonisch.** `[cmd]` `meal_items.amount_g` ist so
    gebaut, `frozen_at` friert die Nährwerte ein. Portionen sind eine
    Eingabehilfe, keine zweite Wahrheit.
  - `[read]` Die Spec nennt zusätzlich **zuletzt benutzte Portionen je
    Nutzer** — im Vorgängerrepo nicht gefunden, also eigener Schritt.
  - **Woher die Gewichte stammen, ist im Seed-Skript nicht vermerkt.**
    `[annahme]` Haushaltsübliche Masse. Beim Übernehmen entscheiden, ob
    das reicht oder ob eine Quelle nachgetragen wird — `[read]` GO-00
    zeigt gerade, was passiert, wenn eine Zahl ohne geprüfte
    Bezugsgrösse eingetragen wird.

  `[cmd]` **Erledigt 2026-08-15.** `nutrition.foods_portions` als
  Kettenschritt `029`: **23.402 Portionen über 7.048 Lebensmittel**,
  7.043 Vorgaben. Verteilung: `1 Portion 150 g` bei 1.950, `1 Scheibe
  30 g` bei 1.333, `1 Steak 200 g` und `1 Schnitzel 180 g` bei je 685.

  **Eine Übernahme, keine Neuentwicklung.** `[cmd]` Die Vorlage liegt im
  Vorgängerrepo (`scripts/seed-portions.py`, `migrations/002_…`,
  `useFoodPortions.ts`) und hängt die Portionen **an die Kategorie, nicht
  an das einzelne Lebensmittel** — deshalb rund hundert Definitionen
  statt 7.140 Kurationen.

  `[cmd]` 92 Lebensmittel ohne Portion, alle in Warengruppe `R`
  (Vanillinzucker, Puddingpulver, Tortenguss). Bei Backzutaten ist Gramm
  die richtige Angabe — kein Mangel.

  **Gramm bleibt kanonisch.** `meal_items.amount_g` ist die Menge,
  Portionen sind die Eingabehilfe.

- [x] **C-51: Die gewählte Portion in `meal_items` festhalten** (neu
  2026-08-15). **Vor dem Schreibpfad ins Tagebuch (C-03).**

  **Tom, 2026-08-15:** *„Der User oder die MealCam-KI wird entscheiden,
  wie die Eingabe sein wird — ob effektiv in Gramm oder Portion
  gewählt wird."*

  `[cmd]` Seit C-50 stehen 23.402 Portionen bereit. `meal_items` führt
  `amount_g`, `food_name` und die eingefrorenen Nährwerte — **kein Feld
  für die gewählte Portion und keins für die Anzahl.** Die Wahl geht
  beim Speichern verloren.

  **Drei Folgen:**

  - **Die Anzeige verliert die Absicht.** Wer „2 Scheiben Brot"
    eingetragen hat, sieht später `60 g`. Fachlich richtig, aber nicht
    mehr das, was er getippt hat.
  - **MealCam schätzt keine Gramm.** `[read]` Eine Bildauswertung
    erkennt „ein Teller Nudeln", nicht „312 g". Ohne Portionsfeld muss
    sie umrechnen und wirft die Schätzgrösse weg — dabei ist gerade
    dort die Unsicherheit interessant.
  - **„Zuletzt benutzte Portion je Nutzer" ist nicht baubar.** `[read]`
    `SPEC_06_PATCH_V1_DECISIONS.md` verlangt es; ohne dieses Feld weiss
    niemand, welche Portion zuletzt gewählt wurde — nur wie viel Gramm.

  **Der Vorschlag:** zwei Felder — die gewählte Portion und die Anzahl.
  `amount_g` **bleibt kanonisch** und wird daraus berechnet; die beiden
  Felder sind das **Protokoll der Eingabe**, nicht die Wahrheit über die
  Menge. Bei direkter Grammeingabe bleiben sie leer — und das ist selbst
  eine Aussage.

  **Zu klären:**
  - `[cmd]` `frozen_at` friert die Nährwerte ein. Was passiert, wenn eine
    Portionsdefinition später geändert wird? Der Verweis darf die
    eingefrorene Menge nicht nachträglich verschieben.
  - `foods_custom` führt eigene `serving_size_g` und `serving_name` —
    zwei Herkunftsarten für eine Portion. Ein Feld oder zwei?
  - Bei MealCam: gehört die Schätzunsicherheit dazu? `[read]` Das
    berührt `ADR_MEALCAM_V1` und ist eine Produktfrage.

  `[cmd]` **Jetzt billig:** `meal_items` hat 0 Zeilen. Später ist es eine
  Migration mit Bestand.

  `[cmd]` **Erledigt 2026-08-15**, Kettenschritt `058a`. `meal_items`
  trägt jetzt `portion_name`, `portion_quantity` und
  **`portion_amount_g`** — drei Spalten statt der zwei, die der Punkt
  vorsah.

  **Die dritte ist der Kern:** Die Grammzahl wird zum Zeitpunkt des
  Erfassens mitgespeichert, **kein Fremdschlüssel auf
  `foods_portions`**. Dieselbe Logik wie `frozen_at` bei den Nährwerten,
  konsequent durchgezogen.

  `[cmd]` **Belegt statt behauptet:** 2 × 1 Scheibe bleibt als 60 g
  eingefroren, auch wenn die Portionsdefinition zwischenzeitlich von
  30 auf 35 g wechselt.

  Nebenbei repariert: die fünf `R`-Einträge mit Portionen ohne Vorgabe —
  `[cmd]` jetzt 0. Die Prüfung fragte „keine zwei Vorgaben", nicht
  „mindestens eine".

- [x] **C-03: WP-02 Diary-Verdrahtung** — **nicht mehr blockiert**
  (2026-08-06, Block 10): ADR-0003 ist geschrieben
  (`docs/spezifikation/90-entscheidungen/ADR-0003-diary-naehrstoffmodell.md`).
  **Entschieden: EAV anschliessen, `db/schema/nutrition.sql` ist
  verworfen** — die Datei bleibt als Referenz liegen, ist aber kein
  Sollwert. Was bleibt, ist Bau, keine Entscheidung: Diary-Tabellen im
  Schema `nutrition` anlegen, an `food_nutrients` rechnen, die
  Ergebniswerte je Mahlzeitposition **einfrieren** (sonst ändern sich
  vergangene Tage rückwirkend, wenn ein BLS-Wert korrigiert wird).
  Jede neue Tabelle bekommt Zeilenschutz **und** Policies je Operation,
  dem Muster aus 060 folgend.
  Nebenfund `[read]`, im ADR festgehalten: der verworfene Entwurf schaltet
  für `meal_items` RLS ein, vergibt aber keine Policy — für
  `authenticated` wäre die Tabelle gesperrt gewesen. Beim Neuaufbau nicht
  wiederholen.
  Der Aggregationsweg für Tagessummen (Sicht, materialisierte Sicht oder
  Summentabelle) ist noch offen und gehört zu C-04.

  `[cmd]` **Erledigt 2026-08-15.** `meals` 0 → 1, `meal_items` 0 → 2 —
  **die ersten Zeilen überhaupt in diesen Tabellen.** Eine Position
  direkt in Gramm, eine über eine Portion.

  `[read]` Die Datenschicht war schon fertig: `diary-write.ts` mit dem
  Einfrieren steht seit C-02/C-04 samt Tests. C-03 war vor allem Route
  und Oberfläche — *die Ausbeute daraus, dass reine Logik früh von der
  I/O getrennt wurde.*

  **Das Einfrieren, an einem Fall belegt:** `[cmd]` Mahlzeit erfasst,
  dann das Lebensmittel auf 999 kcal geändert — die Position im Tagebuch
  bleibt bei 348 kcal. Danach zurückgesetzt.

  **Die Ringe füllen sich:** `[cmd]` 348 / 2.977,8 kcal · 12 %, alle
  vier Makros mit Nenner aus `goals.zielwerte_am`. `[cmd]` 41 complete,
  2 incomplete, 2 not_applicable — erstmals ausserhalb einer
  Wegwerf-Datenbank.

  **Ein Befund, der nirgends stand:** Die Referenzwerte werden **live
  gelesen**, ändern also rückwirkend die Deckungsgrade. Vertretbar — ein
  Referenzwert ist eine Aussage über den Menschen, nicht über die
  Mahlzeit — aber es war nicht festgehalten. Wird mit GO-00 Teil 2
  dokumentiert.

  **Was das Tagebuch noch nicht kann:** Rezepte, Pläne, MealCam,
  Kopieren von gestern, Mahlzeit löschen, Uhrzeit, Notizen, mehrere
  Tage. Liste im Bericht.

- [x] **C-55: Hydration — Datenseite und Anbindung** (neu und erledigt
  2026-08-16). Commits `3dc2222`, `452da02`.

  `[cmd]` `nutrition.hydration_day(user_id, date)` liefert Tagessumme,
  Ziel, Gläser, 14-Tage-Vergleich. 212 Wassereinträge in den Testdaten,
  Fall im Register.

  **Das Ziel trägt seine Herkunft im Namen:** `target_source =
  profile_body_weight_35_ml_per_kg` — `[cmd]` 2.975 ml bei 85 kg, aus
  dem Vorgängerrepo übernommen (`WaterTracker`: *35ml/kg recommended*).

  **Zwei Herkünfte farblich getrennt** (Tom): `var(--acc-nutri)` voll
  für Getrunkenes, derselbe Ton auf 40 % für den Anteil aus
  Lebensmitteln — **kein neues Token**. `[cmd]` Der Fall ist real: an
  einem Tag standen 1.242,7 ml komplett aus Lebensmitteln, getrunken
  war nichts.

  `[cmd]` Der `+250ml`-Knopf schreibt: ein Klick brachte 500 → 750 ml,
  6 → 7 Gläser, 59 → 67 % ohne Neuladen.

- [x] **C-56: Mikro-Übersicht — Netzdiagramm und Schwellenliste** (neu
  und erledigt 2026-08-16). Commit `3eab1d8`.

  `[cmd]` `micronutrient_snapshot` (8 kuratierte Nährstoffe aus
  `daten/mikro-uebersicht.json`) und `micronutrient_below_threshold`.

  **Der Beleg, dass die Schwelle greift:** `[cmd]` 4 von 20 an einem
  normalen Tag, **16 von 17 am Mangel-Szenariotag**.

  `[cmd]` **Vier Regeln gelten:** nur `reference_direction = 'target'` ·
  `incomplete` gehört nicht in die Liste (unvollständig erfasst ist
  nicht zu wenig gegessen) · `NO_REFERENCE` ebenso wenig ·
  `energy_share` und `nutrient_density` haben keinen Prozentwert.

- [x] **C-57: Wasserziel nach der Konsensformel** (neu 2026-08-16).
  **In Arbeit.**

  `[cmd]` Heute: `body_weight_kg × 35`, fest. Recherchiert am
  2026-08-16, Struktur der gängigen Rechner:
  **`Basis × Aktivitätsfaktor × Klimafaktor + Trainingsbonus`**

  | | |
  |---|---|
  | Basis | 30 ml/kg sedentär · 35 normal · 40 aktiv (nähert die IOM-Empfehlung von 30–40 ml/kg) |
  | Training | ~350 ml je 30 min (ACSM); intensiv 750 ml–1 L/h |
  | Klima | +10 % warm, +20 % sehr heiss und feucht |
  | Schwangerschaft, Stillzeit | eigener Zuschlag |

  **Tom, 2026-08-16:** *„Gyms sind indoor und meist klimatisiert, das
  können wir nicht globalisiert betrachten. Wir sehen den Faktor für
  Klima vor, denn irgendwann binden wir Gyms an. Trainingssessions
  werden wir auch bald kennen, also auch vorsehen."*

  **Beide Faktoren stehen auf neutral**, kein Profilfeld: Klima 1,0,
  Trainingsbonus 0. `[cmd]` Klima gehört an den Ort des Trainings, nicht
  an den Wohnort — ein Studio in Bangkok ist klimatisiert.

  **Kein Maximum.** `[Sicher]` Keine der Formeln kennt eine Obergrenze
  im Alltagsbereich; `progress_pct` darf über 100 gehen und
  kennzeichnet dort nichts.

  `[cmd]` **Erledigt 2026-08-16**, Commit `dd162a2`. Die Formel steht:
  **Basis × Aktivitätsfaktor × Klimafaktor + Trainingsbonus +
  Schwangerschaft/Stillzeit.**

  | | |
  |---|---|
  | Tom, 85 kg, `very_active` | **3.400 ml** |
  | Max, 78 kg, `light` | 2.535 ml |
  | Sarah, ohne Gewicht | `NULL`, `missing_body_weight` |
  | Über-100-Fall | **102,6 % ohne Kennzeichnung** |

  `[cmd]` Klima steht auf **1,0**, Trainingsbonus auf **0 ml** — beide
  im `target_source` ausgewiesen. Wer den Wert liest, sieht, was
  eingegangen ist und was auf neutral stand.

- [x] **C-58: Settings — Sichtbarkeit und überholte Texte** (neu
  2026-08-16). **In Arbeit.**

  **Tom, 2026-08-16:** *„Da muss man nicht eine hochintelligente KI
  sein, um zu wissen, dass man das bei männlich ausblendet."*

  `[cmd]` Schwangerschaft und Stillzeit werden bei
  `biological_sex = male` nicht gerendert — der Wert steht im selben
  Formular zwei Felder darüber.

  **Zwei überholte Texte:** `[cmd]` *„Diese Seite erfasst, sie rechnet
  nicht […] bleiben die Ringe im Tagebuch leer"* und `TDEE-FORMEL:
  moeglich` — beides stimmt seit GO-04 nicht mehr. `[read]` Derselbe
  Fall wie veraltete Statuszeilen: ein Hinweis, der einmal richtig war,
  wird zur Falschaussage, sobald das Gebaute ihn überholt.

  Dazu: `mm/dd/yyyy` in deutscher Oberfläche, und der Speichern-Knopf
  ist ausgegraut abgesetzt.

  `[cmd]` **Erledigt 2026-08-16**, Commit `2b9a06c`.

  **Der Block wird ausgeblendet, nicht geleert.** Im Browser
  durchgespielt: `male` → kein Block, `female` → erscheint, Zeiträume
  eingetragen, zurück auf `male` → weg mit Hinweis *„gespeichert und
  bleiben erhalten"*, wieder `female` → beide Daten stehen noch. Ein
  Fehlklick vernichtet nichts.

  **Der Speichern-Knopf war tatsächlich unsichtbar**, und die Ursache
  ist ein Befund über die Shell, nicht über Settings: `[cmd]` Er trug
  `v2-btn-accent`, das sich aus `--acc` färbt — **Settings hat keinen
  Modulakzent.** Mit und ohne Änderung blassgrau, Unterschied nur die
  Deckkraft. Jetzt `v2-btn-primary`.

  `[cmd]` **Das Datumsformat ließ sich nicht lösen und wurde nicht
  behauptet:** Die Seite rendert `tt.mm.jjjj`, `lang="de"` greift — das
  `mm/dd/yyyy` kommt aus Chromes Anzeigesprache und ist von der Seite
  aus nicht überschreibbar. Statt einer Scheinlösung steht die
  erwartete Reihenfolge im Hinweistext.

- [x] **C-61: Mahlzeiten haben keine Uhrzeit** (neu 2026-08-17).
  Voraussetzung fuer C-59.

  `[cmd]` `meals` fuehrt nur `entry_date`. Die Vorlage zeigt
  `07:42 Breakfast`, `10:14 Snack`, `13:08 Lunch` — **die Spalte steht
  in der Umsetzung an ihrer Stelle und zeigt `—`.**

  **Entschieden, Tom 2026-08-17:** *„Aktuelle Zeit als Vorgabe,
  editierbar. Und fuer den Nachtragefall (erkennen wir ja) eine Warnung
  wie: bitte passen Sie die Einnahmezeit an. Das ist wichtig, denn wir
  haben zeitliche Darstellungen."*

  **Es ist der Zeitpunkt des Essens, nicht der Erfassung.**

  | | |
  |---|---|
  | Vorgabe | die aktuelle Uhrzeit |
  | Aenderbar | ja, als Eingabe |
  | Nachtragefall | **das erfasste Datum ist nicht heute** — dann ist die aktuelle Uhrzeit sinnlos und ein Hinweis erscheint |

  `[cmd]` Der Nachtragefall ist eindeutig erkennbar: `entry_date`
  gegen das heutige Datum. **Kein Raten, keine Schwelle.**

  **Warum es zaehlt:** `[cmd]` Die Designvorlage baut mehrere Ansichten
  darauf — `Tagesablauf 06:30–22:00`, `Pre-workout window · 17:30
  session` mit `Eat by 16:00`, und die Mahlzeitenkarten mit Uhrzeit.
  **Ohne Zeit gibt es keine davon.**

  `[cmd]` **Erledigt 2026-08-17**, Kettenschritt `052a`. `meals` traegt
  `meal_time`; **686 bestehende Mahlzeiten mit stabilen Zeiten
  nachgetragen**, 0 ohne Zeit.

- [x] **C-59: Mahlzeiten mehrfach je Typ** (neu 2026-08-17).
  **Tom, 2026-08-17:** *„Ein Snack ist keine fixierte Mahlzeit, das muss
  multiple erfassbar werden."*

  `[cmd]` `meals` traegt einen `UNIQUE`-Index auf
  `(user_id, entry_date, meal_type)` — **zwei Snacks am selben Tag sind
  nicht speicherbar.** Die Designvorlage fuehrt genau das: `10:14 Snack`
  und `16:00 Snack`.

  `[cmd]` Beim Bau von G-12 wurde der zweite behelfsweise als
  `Post-workout` gefuehrt — gemeldet, nicht entschieden.

  **Zu klaeren:** `[cmd]` Ohne Uhrzeit sind zwei Mahlzeiten desselben
  Typs nicht unterscheidbar und nicht sortierbar (C-61). `Same as
  yesterday` muss bei mehreren gleichen Typs die richtige treffen.
  `daily_summary` rechnet ueber alle Positionen des Tages und ist nicht
  betroffen — pruefen.

  `[cmd]` **Erledigt 2026-08-17**, zusammen mit C-61. Der Index
  `uq_meals_user_date_type` ist weg, neue Sortierindizes stehen.

  `[cmd]` **Live belegt:** zwei Snacks am 2026-08-14 um 10:14 und 16:00.
  513 Mahlzeiten, 1.561 Positionen, Kettenlauf ueber 47 Schritte,
  Schema vollstaendig.

- [x] **C-63: `locale` in `public.profiles`** (neu 2026-08-17). Folgt
  aus A-14, von Claude Code angefordert.

  `[cmd]` Heute gilt die Sprachwahl **je Browser** (Cookie). Mit der
  Spalte gilt sie je Person.

  **Der Zuschnitt steht:** `locale text`, erlaubt `de` / `en` / `th`,
  **Vorgabe `NULL`, nicht `'de'`** — `[read]` sonst ist „hat Deutsch
  gewaehlt" nicht von „wurde nie gefragt" zu unterscheiden. Dazu ein
  `CHECK`.

  `[cmd]` Der Anschluss ist klein: eine Abfrage in `getRequestConfig`,
  ein `PUT` in der Auswahl.

  `[cmd]` **Erledigt 2026-08-17**, Commit `df91c03`. `public.profiles`
  traegt `locale text`, erlaubt `NULL` / `de` / `en` / `th`, **kein
  Default.** `handle_new_user()` bleibt unveraendert — neue Profile
  bekommen ebenfalls `NULL`.

  `[cmd]` Live geprueft: `locale='fr'` wird vom `CHECK` abgewiesen, alle
  17 Pruefungen in `v090_profile.sql` gruen.

  **Der Anschluss steht aus** — eine Abfrage in `getRequestConfig`, ein
  `PUT` in der Sprachwahl. Bis dahin gilt die Wahl je Browser.

- [x] **C-60: Die Vorgabeportion ist wertlos** (neu 2026-08-17).
  **Tom, 2026-08-17:** *„Die Portionen muessen in die Auswahl mit rein
  als logische Vorwahl."*

  `[cmd]` **Bei 7.043 von 7.048 Lebensmitteln heisst die Vorgabeportion
  „100 g".** Nur fuenf haben etwas anderes. Die Erfassung schlaegt
  deshalb immer „100 g" vor — auch bei Brot, wo `[cmd]` 1.333 Eintraege
  „1 Scheibe 30 g" danebenliegen.

  `[read]` Bei C-50 war richtig, dass **Gramm kanonisch** bleibt — die
  Darstellung im Tagebuch in Gramm ist korrekt (Tom bestaetigt). **Fuer
  die Vorauswahl beim Erfassen ist sie falsch.**

  **Was zu tun ist:** Je Lebensmittel die logischste Portion als Vorgabe
  markieren — bei Brot die Scheibe, bei Eiern das Stueck, bei Oel den
  Essloeffel. `[cmd]` Die Daten liegen in `daten/portionen.json`; es ist
  eine Frage der Markierung, nicht der Erhebung. `[annahme]` Wo keine
  sinnvollere Portion existiert (Gewuerze, Zutaten), bleibt „100 g".

  `[cmd]` **Erledigt 2026-08-17**, Commit `13b0a89`.

  | | vorher | nachher |
  |---|---|---|
  | Vorgabe `100 g` | **7.043** | 2.039 |
  | sinnvolle Vorgabe | 5 | **5.009** |

  `[cmd]` Live belegt: Vollkornbrot → `1 Scheibe 30 g`, Huehnerei →
  `1 Ei (Groesse M) 58 g`, Banane → `1 Stueck (mittel) 120 g`, Olivenoel
  → `1 EL 10 g`.

  **Der Weg fuehrte ueber die Kategorie**, nicht ueber 7.048
  Einzelfaelle — `[cmd]` kategoriespezifische Vorgaben schlagen
  `basis_100g`. Die verbliebenen 2.039 sind Zutaten und Halbfertiges,
  wo `100 g` richtig bleibt.

  `[cmd]` Die Pruefung zaehlt jetzt beides und faellt bei fehlenden oder
  doppelten Vorgaben.

- [x] **C-66: Trainingssitzungen und Saetze** (neu und erledigt 2026-08-17).

  **Der Punkt wurde nachtraeglich angelegt** — der Auftrag lief, ohne dass er in der Liste stand.

  `[cmd]` **Erledigt 2026-08-17**, Kettenschritt `106`.
  `training.workout_sessions`, `workout_exercises`, `workout_sets` —
  jeweils mit Zeilenschutz, Policies je Operation und Grants.

  `[cmd]` **Live:** 9 Sitzungen, 18 Uebungen in Sitzungen, 60 Saetze.
  Zeilenschutz in beide Richtungen belegt: Tom sieht 9 Sitzungen und 60
  Saetze, Max sieht 0, fremder Insert blockiert.

  `[cmd]` **Ein Fall mit allem dran:** 2026-08-03, `Push A`,
  17:30–18:45, **3.307,50 kg Tonnage**, 6 Saetze, 48 Wiederholungen —
  und `Barbell Bench Press` ist mit den Stammdaten und drei
  Muskelzuordnungen verbunden.

  **Der Uebungsname wird eingefroren**, wie bei `meal_items` die
  Naehrwerte. `[read]` Eine spaetere Stammdatenkorrektur verschiebt
  damit keine alte Sitzung.

  `[cmd]` Dazu Satz-Metriken und Sitzungs-Aggregate. Was aus der Spec
  nicht uebernommen wurde und was eine Sitzung noch nicht kann, steht in
  `docs/ssot/93-trainingssitzungen.md`.

- [x] **C-67: `recovery.checkins` — die Tabelle, die sieben Kacheln
  weckt** (neu 2026-08-17). Folgt aus G-21.

  `[cmd]` **`recovery` hat kein Schema** — es kommt in
  `supabase/_pipeline/` in keiner SQL-Datei vor, **nicht einmal
  Stammdaten**, anders als bei Training. Es gibt keine Kachel, die ohne
  neue Tabelle echt wird.

  `[read]` Aus dem G-21-Bericht: *„Der groesste Hebel ist
  `recovery.checkins` — eine Tabelle weckt sieben Kacheln: den
  Check-in-Tab, den Erholungswert im `manual`-Modus (braucht kein HRV),
  die Kopfzeile und den subjektiven Schlafpfad."*

  `[cmd]` **Die Spalten stehen fertig in `CHECKIN`** (in
  `module-recovery-engine.jsx`), und `docs/specs/Recovery/` ist mit elf
  Dateien vollstaendig — `SPEC_06_DATABASE_SCHEMA.md` mit 17 KB.

  `[cmd]` Das Vorgaengerrepo hat
  `supabase/migrations/010_create_recovery_tables.sql`,
  `upsertRecoveryAndEvaluate.ts` **mit Test** und
  `recoveryCalculations.ts` **mit Test**.

  **Danach `training.sessions`/`sets` fuer die Muskelkarte** — `[cmd]`
  die Naht liegt als `MUSCLE_SLUG_MAP` schon da, und die Sitzungen
  existieren seit `106`.

  `[cmd]` **Erledigt 2026-08-17**, Kettenschritt `120`.
  `recovery.checkins` mit Zeilenschutz, Policies je Operation und
  Grants. **49 Kettenschritte dokumentiert.**

  `[cmd]` **Live: 36 Check-ins, davon nur 9 mit HRV** — **27 Datensaetze
  ohne Geraet.** Das ist der `manual`-Modus, und er traegt.

  `[cmd]` Zeilenschutz beidseitig belegt: Tom sieht 36, Max sieht 0,
  fremder Insert blockiert.

  `[cmd]` **Der Szenariotag steht im Register:** 2026-08-18, schlechte
  Erholung, `hrv_rmssd` leer, **4,8 h Schlaf** — ein vollstaendiger
  Datensatz ohne Messgeraet.

  `[read]` Damit koennen die sieben Kacheln aus dem G-21-Bericht echt
  werden: Check-in-Tab, Erholungswert im `manual`-Modus, Kopfzeile und
  der subjektive Schlafpfad.

- [x] **C-68: Supplements-Schema** (neu 2026-08-17). Befund aus G-29.

  `[cmd]` **Kein `supplements`-Schema** — wie bei Recovery vor `120`.
  Alle Kacheln sind Attrappe.

  **Der Fundus ist groesser als erwartet:** `[cmd]`
  `referenz/lumeos-2026/` hat **acht Tabellen in drei Migrationen**
  (`008_supplements.sql`, `050_supplements_schema_expansion.sql`), einen
  **Seed mit 35,9 KB — mehr Wirkstoffe als die Vorlage** — und **15
  Komponenten**.

  `[cmd]` **Halbwertszeit in fuenf Dateien**, darunter
  `useBloodLevels.ts` mit `half_life_hours`.

  `[read]` Das ist dieselbe Lage wie bei den Portionen und den
  TDEE-Formeln: **eine Uebernahme, keine Neuentwicklung.**

  `[cmd]` **Erledigt 2026-08-17**, Kettenschritte `130` und `131`,
  **52 Schritte** in der Kette.

  `supplements` mit **fuenf Tabellen, einer Sicht, zwei Funktionen:**
  `supplement_catalog`, `user_stacks`, `stack_items`, `intake_logs`,
  `supplement_interactions`, dazu `daily_intake_summary`.

  `[cmd]` **Live: 44 Katalogeintraege, 1 Stack, 4 Positionen, 4
  Einnahmen.** Zeilenschutz beidseitig belegt — Tom sieht 1/4/4, Sarah
  0/0/0, Fremd-Insert blockiert.

  `[cmd]` **Der Refill-Fall steht im Register:** `vitamin-d3`. `[read]`
  Damit ist G-32 pruefbar — dort ist `refillUrgent` an einem von neun
  Attrappen-Eintraegen gesetzt und wird an drei Stellen gelesen.

  **Zwei Bereiche ausdruecklich nicht gebaut**, wie beauftragt: keine
  Injection-Planner-Tabellen (G-31 und der Change Request mit 17 KB),
  **keine medizinische Wechselwirkungsbewertung** — `[read]` die Tabelle
  ja, aber keine Regel, die sagt, was gefaehrlich ist.

- [x] **C-69: Medical-Schema** (verschoben hinter C-70). Befund aus
  G-36.

  `[cmd]` **Kein `medical`-Schema** — alle 21 Kacheln sind Attrappe.

  `[cmd]` **Der Spec-Widerspruch gilt:** `SPEC_06` hat 8 `CREATE TABLE`;
  `UserMedicalInsight` und `UserHealthReport` kommen in `SPEC_02`
  **4-mal** vor, in `SPEC_06` **0-mal**. `[read]` Haertester Befund des
  Spec-Audits.

  `[cmd]` `015_medical.sql` im Vorgaengerrepo hat 7 Tabellen, **teils
  anders benannt als `SPEC_06`.**

  **Setzt C-70 voraus** — ohne den Katalog steht das Schema leer da.

  `[cmd]` **Erledigt 2026-08-18**, Kettenschritte `140` und `141`,
  **55 Schritte** in der Kette. Vier Tabellen: `biomarker_catalog`,
  `biomarker_reference_ranges`, `lab_reports`, `lab_result_values`.

  `[cmd]` **Live: 11.676 Katalogeintraege und 464 Referenzbereiche**,
  dazu 1 Befund mit 3 Messwerten. Zeilenschutz beidseitig — Tom sieht
  1/3, Max 0/0, Fremd-Insert abgelehnt.

  ### Alle vier Vorgaben erfuellt — und zwei mehr

  | | |
  |---|---|
  | **Eingefroren** | `marker_name_snapshot`, `unit_snapshot`, `frozen_at` |
  | **Bereich am Befund** | `lab_reference_low/high/text/unit/source` |
  | **Herkunft** | `source`, `source_detail` |
  | **zusaetzlich** | `entry_confidence`, `needs_verification` |

  `[read]` **Die letzten beiden waren nicht beauftragt** und sind
  richtig: Ein Wert aus einer Foto-Erkennung ist etwas anderes als ein
  getippter — **und das gehoert an die Zeile, nicht in die
  Verarbeitungslogik.**

  `[read]` **Der Referenzbereich sitzt am Befund, nicht am Katalog:**
  Jedes Labor fuehrt eigene Bereiche, und sie stehen auf dem Ausdruck.
  Der Katalogbereich ist der Rueckfall, wenn der Befund keinen
  mitliefert.

  `[cmd]` PostgREST sieht `medical` erst nach `supabase stop` und
  `start` — wie bei `goals`.

- [x] **C-72: Der Import-Pfad fuer Laborbefunde** (neu 2026-08-18).
  Folgt auf C-69.

  `[cmd]` Das Schema steht: 11.676 Katalogeintraege, `lab_reports` und
  `lab_result_values` mit `entry_confidence` und `needs_verification`.
  **Was fehlt, ist der Weg vom PDF zur Zeile.**

  `[cmd]` `SPEC_08_IMPORT_PIPELINE.md` hat **17 KB**.

  `[read]` **Die Vorlage wirbt mit** *„German, English, Thai lab formats
  supported"* — und `biomarkerSynonyms.ts` im Vorgaengerrepo traegt
  **457 Synonympaare auf 91 kanonische Namen, davon 18 auf Thai.**
  **Das ist die Zuordnungstabelle, die ein Import braucht.**

  `[cmd]` Im Katalog stehen `synonyms` je Eintrag aus LOINCs
  `RELATEDNAMES2` — **pruefen, wie weit die beiden sich decken.**

  **Und `medical.biomarker_catalog` hat 4.593 deutsche Namen** von
  11.676 — ein deutscher Befund trifft also nicht jeden Marker.

  `[cmd]` **Erledigt 2026-08-18**, Kettenschritte `142` und `143`.
  `medical.biomarker_aliases` mit Kandidaten- und Importfunktionen.

  | | |
  |---|---|
  | Textpaare im Vorgaengerrepo | 457, davon 454 aktiv |
  | eindeutig importierbar | **286** |
  | bewusst mehrdeutig | 6 |
  | **live** | **292** |
  | nicht importiert, begruendet | 152 |

  ### Die drei Faelle sind belegt

  `[cmd]` Live geprueft:

  | | |
  |---|---|
  | **Haemoglobin** | → `718-7`, `exact`, Confidence **0,98** |
  | **Glukose** | → `ambiguous`, **3 Kandidaten**, `needs_verification` |
  | **Unbekannter Marker X** | → `unknown`, **Rohtext gespeichert** |

  `[read]` **Der dritte Fall war die eigentliche Anforderung.** Tom:
  *„Wenn Daten importiert werden und wir die nicht in der DB haben,
  kommt nichts."* — **Der Marker verschwindet nicht, er steht mit
  `entry_confidence 0.00` und seinem Rohtext da.**

  `[cmd]` Zeilenschutz: Tom sieht 2 Befunde und 6 Werte, Max 0/0,
  **Fremdimport bricht mit `medical import: user mismatch` ab.**

- [x] **C-73: Die 107 Muskelgruppen kurieren** (neu 2026-08-18).
  **Vor G-49.**

  `[cmd]` `training.muscle_groups` hat **107 Eintraege** in 7 Regionen —
  **und keine Hierarchie.** Die Tabelle traegt nur `name`,
  `body_region`, `display_order`. **Kein Elternfeld.**

  ### Der Befund an einer Region

  `[cmd]` Die zehn unter `shoulders`:

  ```
  Deltoids · Front Shoulders · Hip Rotators · Rear Shoulders ·
  Rotator Cuff · Rotator Cuff Muscles · Shoulders ·
  Teres Minor · Infraspinatus · Subscapularis
  ```

  | | |
  |---|---|
  | **Dublette** | `Rotator Cuff` und `Rotator Cuff Muscles` |
  | **Falsche Region** | `Hip Rotators` — das sind Hueftrotatoren |
  | **Ueberschneidung** | `Deltoids` gegen `Shoulders`, dazu `Front`/`Rear Shoulders` |
  | **Fehlende Ebene** | `Teres Minor`, `Infraspinatus`, `Subscapularis` **sind** die Rotatorenmanschette — sie stehen gleichrangig daneben |

  `[read]` **Dieselbe Lage wie bei den Lebensmitteln vor der Kuration:
  Die Zahl stimmt, die Ordnung nicht.**

  ### Was zu tun ist

  **Zuerst messen**, wie viele der 107 betroffen sind — `shoulders` ist
  eine Stichprobe, **legs hat 37 und arms 24.**

  **Dann:** Dubletten zusammenfuehren · falsche Regionen richtigstellen ·
  **eine Elternbeziehung ergaenzen**, damit `Infraspinatus` unter
  `Rotator Cuff` haengt.

  `[cmd]` **Woher die Eintraege stammen, ist zu klaeren** — `[read]` der
  Fundus nennt `import-exercises.ts` und `import-free-exercise-db.ts` im
  Vorgaengerrepo. **Wenn sie aus einer fremden Quelle kommen, ist die
  Kuration eine Uebersetzungsschicht, keine Korrektur am Bestand.**

  `[cmd]` **`exercise_muscles` haengt mit 6.624 Zuordnungen daran** —
  eine zusammengefuehrte Dublette darf keine Uebung verlieren.

  **Ohne diesen Punkt klappt sich unter `Deltoids` eine Liste auf, die
  `Hip Rotators` enthaelt.**

  `[cmd]` **Erledigt 2026-08-18**, Kettenschritt `107`.

  | | |
  |---|---|
  | Gruppen | **107 → 96** |
  | `exercise_muscles` | **bleibt 6.624** — keine Zuordnung verloren |
  | Waisen | **0** |
  | Eltern-Beziehungen | **89** |

  `[read]` **Die zweite Zahl war der Nachweis, der zaehlte** — eine
  zusammengefuehrte Dublette darf keine Uebung verlieren.

  ### Die Schulterhierarchie traegt

  ```
  Shoulders
  ├─ Deltoids ──── Front Shoulders, Rear Deltoids
  └─ Rotator Cuff ─ Infraspinatus, Subscapularis, Teres Minor
  ```

  `[cmd]` **`Hip Rotators` ist weg aus `shoulders`**, die Dublette
  `Rotator Cuff Muscles` zusammengefuehrt.

  **Damit ist G-49 baubar** — die drei Ebenen (Flaeche, Gruppe, Muskel)
  haben jetzt eine Struktur, auf der sie aufsetzen koennen.

- [x] **C-77: Alle Seeds auf `dev@lumeos.app` nachziehen** (neu
  2026-08-18). **Fuer Codex, hohe Prioritaet.**

  **Tom, 2026-08-18:** *„Wegwerf-DB ist mir scheissegal, wie und wo er
  anlegt. Danach muessen Seeds in meinen Dev-Account, sonst sehe ich
  nichts."*

  ### Gemessen

  | Konto | Mahlzeiten | Messungen | Befunde | anmeldbar |
  |---|---|---|---|---|
  | **`dev@lumeos.app`** | 173 | **0** | **0** | ja |
  | `tom.seed@example.com` | 173 | 43 | 2 | **nein** |
  | `test-user@lumeos.local` | 1 | 0 | 2 | ja |

  `[cmd]` **Nur Mahlzeiten sind auf Toms Konto** — weil
  `eigenes-konto-fuellen.sql` genau das tut. **Alles seither liegt bei
  `tom.seed`**, und dieses Konto hat **kein Passwort**
  (`encrypted_password IS NULL`), ist also nicht anmeldbar.

  `[read]` **Damit war nichts im Browser sichtbar** — weder fuer Tom
  noch fuer einen Agenten, der einen Nachweis fuehren sollte. Der
  G-46-Agent hat es beim Versuch gemerkt und gefragt.

  ### Was nachzuziehen ist

  `[cmd]` **43 Koerpermessungen, 7 Umfaenge** (GO-10/GO-14) · **36
  Recovery-Check-ins** (C-67) · **9 Trainingssitzungen, 18 Uebungen, 60
  Saetze** (C-66) · **1 Supplement-Stack mit 4 Positionen und 4
  Einnahmen** (C-68) · **Ziele und Phasen** (GO-07) · **Laborbefunde**
  (C-69, dann C-76).

  `[read]` **`eigenes-konto-fuellen.sql` ist das Muster** — es
  erweitern, nicht daneben ein zweites Skript bauen.

  `[cmd]` **Und die zwei Kopien auf `test-user` wegraeumen**, die der
  G-46-Agent fuer seinen Nachweis angelegt hat — `test-user` ist ein
  Pruefkonto, kein Demokonto.

  ### Warum es mehr ist als Bequemlichkeit

  `[read]` **Der Zeilenschutz-Nachweis braucht zwei anmeldbare
  Konten** — einen, der die Daten sieht, und einen, der sie nicht sieht.
  **Ein Konto ohne Passwort taugt fuer keines von beidem.** Bisher wurde
  RLS gegen `tom.seed` und `max.seed` geprueft — **beide nicht
  anmeldbar**, der Nachweis lief nur ueber SQL.

  `[cmd]` **Erledigt 2026-08-18.** `eigenes-konto-fuellen.sql`
  erweitert — **derselbe Demo-Bestand wie bei `tom.seed`:**

  | | |
  |---|---|
  | Ernaehrung | 173 Mahlzeiten, 536 Positionen, 85 Wassereintraege |
  | Koerper | **43 Messungen, 7 Umfaenge** |
  | Recovery | **36 Check-ins** |
  | Training | 9 Sitzungen, 18 Uebungen, 60 Saetze |
  | Supplements | 1 Stack, 4 Positionen, 4 Einnahmen |
  | Goals | 2 Ziele, 2 Phasen, 3 Meilensteine |
  | Medical | 2 Befunde, 6 Werte |

  `[cmd]` **`tom.seed` blieb unveraendert** — kopiert, nicht
  verschoben. **`test-user` ist wieder sauber** (0 Befunde, 0 Werte),
  sein kleiner Pruefbestand bleibt: 1 Mahlzeit, 2 Positionen, 1
  Zielwert.

  `[cmd]` Zeilenschutz-Sicht: als `dev@lumeos.app` sichtbar 43/36/9, als
  `test-user` jeweils 0.

- [x] **C-81: Das Passwort fuer `dev@lumeos.app` ist unbekannt** (neu
  2026-08-18). **Blockiert jeden Browser-Nachweis.** Befund aus C-77.

  `[cmd]` **`LumeOS2026!` liefert lokal `invalid_credentials`.** Der
  Agent hat wie beauftragt **kein Passwort gesetzt oder geaendert.**

  `[read]` **Damit ist der Bestand da, aber nicht ansehbar** — 43
  Messungen, 36 Check-ins, 9 Sitzungen und 2 Befunde liegen auf einem
  Konto, in das sich niemand anmelden kann.

  ### Die Geschichte dahinter

  `[cmd]` Am 2026-08-16 hat ein Agent `dev@lumeos.app` **ein Passwort
  gesetzt, ohne dass es im Auftrag stand** — `LumeosDev2026`. **Es steht
  in keiner Dokumentation** (C-65), und `docs/ssot/37-testkonten.md:15`
  fuehrt fuer das Konto nur *„(Toms eigenes)"*.

  `[read]` **Zwei Kandidaten, beide ungeprueft** — und die lokale
  Datenbank wurde seither mehrfach neu aufgebaut. **Was in `auth.users`
  steht, weiss niemand.**

  **Was zu tun ist:** Tom setzt ein Passwort seiner Wahl und traegt es in
  `37-testkonten.md` ein — **oder er sagt, welches gelten soll, und ein
  Agent setzt es.** `[read]` Beides ist in Ordnung; **still gesetzt und
  nirgends vermerkt ist es nicht.**

  `[cmd]` **Und `test-user@lumeos.local` braucht dieselbe Klarheit** —
  er ist das zweite anmeldbare Konto und traegt den
  Zeilenschutz-Nachweis.

  `[cmd]` **Erledigt 2026-08-18: `LumeosDev2026`.** Tom hat es aus
  seinem Passwortspeicher geliefert; in `docs/ssot/37-testkonten.md`
  eingetragen, wo bis dahin nur *„(Toms eigenes)"* stand.

  `[cmd]` **Gemessen, nicht uebernommen:** Anmeldung ueber
  `/auth/v1/token?grant_type=password` gegen die lokale Instanz —
  **erfolgreich, Rolle `admin`.**

  `[read]` **Der falsche Kandidat war `LumeOS2026!`** — mit
  Ausrufezeichen und anderer Schreibweise. Ein Agent hatte ihn probiert
  und richtig gemeldet, dass er scheitert, **statt ein neues zu setzen.**

  `[cmd]` **Die uebrigen drei Konten bleiben ohne Passwort**
  (`tom.seed`, `max.seed`, `sarah.seed`) — sie tragen Daten, sind aber
  nicht anmeldbar. **Der Zeilenschutz-Nachweis im Browser laeuft ueber
  `dev@lumeos.app` und `test-user@lumeos.local`.**

- [x] **C-65: Toms Passwort steht nirgends** (neu 2026-08-17). Befund
  aus G-16.

  `[cmd]` `docs/ssot/37-testkonten.md:15` fuehrt fuer `dev@lumeos.app`
  nur *„(Toms eigenes)"*. Der Agent hat deshalb mit
  `test-user@lumeos.local` geprueft.

  **Fuer G-16 folgenlos** — die Seite liest nichts, keine
  rollenabhaengige Anzeige. **Fuer alles mit Adminbezug nicht:** `[cmd]`
  G-14 brauchte beide Rollenfaelle, und die Vorwaertssperre ist nur mit
  Toms Konto pruefbar.

  `[cmd]` Seit dem 2026-08-16 lautet es `LumeosDev2026` — **von einem
  Agenten gesetzt, ohne dass es im Auftrag stand.** Es gehoert in
  `37-testkonten.md`, oder Tom setzt ein eigenes und traegt es ein.

  `[cmd]` **Erledigt 2026-08-18 mit C-81** — `LumeosDev2026`, in
  `37-testkonten.md` eingetragen und per Anmeldung belegt.

- [x] **C-76: Seed-Befunde fuer Medical** (neu 2026-08-18). **Fuer
  Codex, sobald frei.**

  **Tom, 2026-08-18:** *„Die Daten sollen in die DB und nicht irgendeine
  Auflästung in der UI sein. Fuer eine UI-Auflistung brauchen wir Seed
  Daten."*

  ### Warum

  `[cmd]` `medical.lab_result_values` hat **sechs Testwerte und keine
  Zeitreihe.** Deshalb zeigt `/v2/medical` unter der echten Tabelle
  weiter die Attrappe mit 48 erfundenen Markern samt Verlauf,
  Sparkline und Bereichsbalken.

  `[read]` **Der G-46-Agent hat das selbst benannt:** *„Bleibt Attrappe:
  die Tabelle zeigt Zeitreihe, Sparkline und Bereichsbalken.
  `medical.lab_result_values` fuehrt heute sechs Testwerte und keine
  Zeitreihe — die Spalten haetten nichts zu zeigen."*

  ### Was gebraucht wird

  **Mehrere Befunde ueber Monate, mit denselben Markern** — dann hat
  die Ansicht Verlaeufe und die Attrappe kann weg.

  `[Wahrscheinlich]` drei bis vier Befunde ueber sechs Monate fuer
  `tom.seed`, mit den **48 Markern der Vorlage** (die Vorlage nennt
  Panels: CBC 5, Metabolic 4, Lipid 5, Liver 6, Kidney 4, Thyroid 4,
  Hormone 10, Inflammation 3, Vitamins 6, Screening 1).

  `[cmd]` **Mit labor-eigenen Referenzbereichen** —
  `lab_result_values` traegt `lab_reference_low/high/text/unit/source`.
  **Der Doppelbereich braucht beide Seiten**, sonst laesst er sich nicht
  zeigen.

  `[cmd]` **Und mit den drei Zuordnungsfaellen aus C-72:** eindeutig,
  mehrdeutig, unbekannt — sie sind live belegt und muessen in den
  Seed-Daten vorkommen, damit die Anzeige sie tragen lernt.

  `[read]` **Ein Verlauf mit erkennbarer Tendenz ist mehr wert als ein
  flacher** — wie bei den Koerperfettwerten, 11,82 % auf 10,31 % ueber
  sechs Wochen.

  `[cmd]` **Erledigt 2026-08-18: 5 Befunde, 140 Werte** ueber sechs
  Monate (2026-02-18 bis 2026-08-19) — **auf `dev@lumeos.app` und
  `tom.seed`**, `test-user` bleibt bei 0.

  `[cmd]` **Der Verlauf traegt:** Glukose 88 → 94 → 99 → 102 mg/dL,
  HbA1c 5,2 → 5,3 → 5,4 → 5,4 %. `[read]` **Und beide Kurven passen
  zueinander** — steigende Nuechternglukose bei steigendem HbA1c. Genau
  die Stimmigkeit, die C-78 fuer alle Seeds fordert.

  `[cmd]` **Die drei Importfaelle sind da:** `exact`, `ambiguous`,
  `unknown` je einmal.

- [x] **C-79: 410 von 464 Referenzbereichen sind Text ohne Zahlen** (neu
  2026-08-18). Befund aus G-46.

  `[cmd]` **Nur 54 der 464 Zeilen tragen Zahlen** — und **genau die
  werden von `lab_result_values_read` als
  `do_not_import_without_source` ausgeschlossen.**

  `[cmd]` **Kein LOINC-Code hat heute Labor- und Optimalbereich als
  Zahlen.** Damit ist der Katalogrueckfall in der Praxis Text, und die
  Anzeige kann keinen Balken zeichnen.

  `[read]` **Die Anzeige geht damit richtig um** — sie liest die drei im
  Bestand gefundenen Schreibweisen und **laesst Mehrdeutiges als Text
  stehen, statt eine Grenze zu erfinden.** Aber es bleibt eine
  Datenluecke.

  **Was zu klaeren ist:** Woher kommen belastbare Zahlen? `[cmd]`
  **NHANES** liefert sie fuer 38 haeufige Tests **nach Geschlecht und
  Ethnie** (2,5. und 97,5. Perzentil). Der Rest kommt aus
  Laborhandbuechern — **Kuration, keine Uebernahme.**

  `[read]` **Und die 54 ausgeschlossenen gehoeren zuerst angesehen:**
  Warum tragen sie keine Quelle? Wenn sie belastbar sind, fehlt nur der
  Herkunftsvermerk.

  `[cmd]` **Geklaert 2026-08-18.** 464 Zeilen, **54 numerisch — und alle
  54 tragen `do_not_import_without_source`.** `[read]` Die Deckung ist
  also vollstaendig: **es gibt keine belastbaren Zahlen, die nur den
  Herkunftsvermerk vermissen.** Der Ausschluss ist richtig, nicht
  versehentlich.

  `[cmd]` **0 Codes mit numerischem Labor- UND Optimalbereich.**

  **Was bleibt:** Woher belastbare Zahlen kommen. `[cmd]` **NHANES**
  liefert sie fuer 38 haeufige Tests nach Geschlecht und Ethnie — der
  Rest ist Laborhandbuch-Kuration. **Eigener Punkt, wenn er faellig
  wird.**

- [x] **C-74: 152 Aliaspaare nicht importiert** (neu 2026-08-18). Rest
  aus C-72.

  `[cmd]` Von 457 Textpaaren des Vorgaengerrepos sind **292 live**, 6
  bewusst mehrdeutig — **152 blieben aussen vor, begruendet
  dokumentiert** in `docs/ssot/107-laborimport.md`.

  **Zu klaeren:** Sind es Marker, die der LOINC-Katalog nicht fuehrt,
  oder Zuordnungen, die nicht eindeutig waren? `[read]` Im ersten Fall
  ist es eine Katalogluecke, im zweiten eine Kurationsaufgabe — **zwei
  verschiedene Antworten.**

  `[cmd]` **Und die deutsche Abdeckung bleibt duenn:** 4.593 deutsche
  Namen von 11.676 im Katalog. **Ein deutscher Befund trifft nicht jeden
  Marker** — die 292 Aliase schliessen die Luecke nur dort, wo sie
  bekannt ist.

  `[cmd]` **Geklaert 2026-08-18.** Die 152 zerfallen in vier Gruppen:

  | | |
  |---|---|
  | **115** | ohne LOINC-Ziel — der Katalog fuehrt den Marker nicht |
  | 18 | ausserhalb der Masterlist |
  | 17 | Thai und Schreibweisen-Faltung |
  | **2** | echte Glukose-Mehrdeutigkeit |

  `[read]` **Damit ist die Frage beantwortet:** Es ist ueberwiegend eine
  **Katalogluecke** (115+18 = 133 von 152), keine Kurationsaufgabe.
  **Wo kein Ziel existiert, hilft kein Alias.**

- [x] **C-80: `142` ergaenzt Spalten, die `140` nicht kennt** (neu
  2026-08-18). Befund aus G-46.

  `[cmd]` `142_laborimport_matching.sql` fuegt **vier Spalten** hinzu —
  `match_status`, `match_candidates`, `match_source`, `raw_marker_name`
  — **die in `140_medical_schema.sql` fehlen.**

  `[read]` **Aufgefallen ist es an einem Fehler:** Der erste
  Kopierversuch des G-46-Agenten scheiterte an der
  Pruefbedingung. *„Und dieses Scheitern hat `match_status` als das
  massgebliche Signal fuer die drei Zustaende sichtbar gemacht"* — die
  Anzeige liest es jetzt, statt aus `entry_confidence` zu schliessen.

  **Zu pruefen:** Gehoeren die vier nach `140`, oder ist die Trennung
  gewollt? `[read]` Ein Kettenschritt, der die Tabelle eines frueheren
  erweitert, ist normal — **aber wer nur `140` liest, kennt das Schema
  nicht.**

  `[cmd]` **Erledigt 2026-08-18** — `140_medical_schema.sql` traegt jetzt
  den Verweis auf die vier Spalten aus `142`. **Kein Umbau, nur der
  Wegweiser** — wer `140` liest, findet `match_status` und die drei
  Zustaende.

- [x] **C-70: Der Biomarker-Katalog — vollstaendig und belegt** (neu
  2026-08-17). **Vor C-69.**

  **Tom, 2026-08-17:** *„Alle Daten sind nur Beispiele im Mockup. Die
  realen Daten muessen wir zusammensuchen, recherchieren und validieren.
  Ich will ein Maximum, was solche Daten angeht, und nicht irgendeinen
  Auszug, der von KI generiert wird."*

  ### Die Vorlage ist ein Ausschnitt

  | | CBC | gesamt |
  |---|---|---|
  | **Designvorlage** | **4** (hct, plt, rbc, wbc) | 59 LOINC-Codes |
  | **`SPEC_05_BIOMARKER_CATALOG.md`** | **15** | **74 in acht Panels** |

  `[cmd]` Die Spec gliedert: CBC 15 · Metabolic 12 · Lipid 8 · Liver 7 ·
  Thyroid 6 · Hormones 10 · Inflammation 6 · Vitamins & Minerals 10.

  `[cmd]` Dazu **114 INSERT-Zeilen** im Seed des Vorgaengerrepos,
  `biomarkerDetails.ts` mit 1.563 Zeilen und **242 Eintraegen**, sowie
  `biomarkerSynonyms.ts` mit **457 Synonympaaren auf 91 kanonische
  Namen, davon 18 auf Thai.**

  ### Die Regelunterscheidung

  `[read]` **Die Vorlage ist die Vorgabe fuer Struktur und Anordnung —
  nicht fuer Bestandsdaten.** Bei den Lebensmitteln ist es genauso: Die
  Vorlage zeigt vier Zeilen im Tagebuch, der Bestand hat 7.140
  Eintraege. **Niemand kaeme auf die Idee, die Vorlage als
  Lebensmitteldatenbank zu lesen.**

  ### Was der Katalog braucht

  **Je Marker:** kanonischer Name, **LOINC-Code**, Einheit,
  Referenzbereich mit Quelle, Panel-Zuordnung, Synonyme (de/en/th).

  `[read]` **Und jede Zahl braucht eine Quelle.** GO-00 hat gezeigt, was
  ohne passiert: **47 von 72 Referenzzeilen falsch verknuepft**, Calcium
  bei 32.000 %, weil die Einheit nicht zur Bezugsgroesse passte.

  `[cmd]` **Referenzbereiche sind alters- und geschlechtsabhaengig** —
  wie bei den Naehrstoffen. Und sie unterscheiden sich je Labor. **Was
  gilt, ist eine Entscheidung, keine Recherche.**

  ### Stand 2026-08-17: Rohbestand liegt, Kuration offen

  `[cmd]` `daten/biomarker-katalog.json` — **122 Kandidaten**, davon 86
  mit LOINC, 117 mit Referenzbereich-Kandidaten, **464
  Referenzbereich-Zeilen**. Synonyme: 41 mit DE, 88 mit EN, **17 mit
  TH**.

  **Ausdruecklich als `curation_candidate_not_import_ready`
  markiert** — `[read]` viele Bereiche stammen aus Vorgaengerquellen und
  brauchen noch Quelle und Entscheidung.

  `[cmd]` **Die Spec-Zaehlung passt nicht zum Inhalt:**
  `SPEC_05_BIOMARKER_CATALOG.md` nennt 74 Marker in acht Panels — **aus
  der Spec selbst waren nur 47 SQL-Zeilen greifbar.** Gemeldet, nicht
  still aufgeloest.

  `[cmd]` **Und die Panel-Zuordnung traegt noch nicht:** 13 verschiedene
  Werte, teils doppelt (`hormone` **und** `hormone_panel`, `vitamin`
  **und** `vitamins_panel`), `blood` mit 32 gegen `cbc_panel` mit 5, und
  **29 Eintraege ganz ohne Panel.**

  **Was zur Entscheidung ansteht:** die acht Panels der Spec als
  Sollgliederung · welcher Referenzbereich gilt, wo Quellen abweichen ·
  Labor- gegen Optimalbereich · die 36 ohne LOINC.

  ### Stand 2026-08-18: Masterlist steht, Aufteilung noetig

  `[cmd]` `daten/biomarker-loinc-masterlist.json` — **11.676 LOINC-Codes**
  aus `Loinc_2.82`, abgeleitet und reproduzierbar.

  | | |
  |---|---|
  | Labor / klinisch | 11.232 / 444 |
  | mit UCUM-Einheit | 8.267 |
  | mit Verbrauchername | 11.268 |
  | **mit deutschem Namen** | **4.593** |
  | mit Panelzuordnung | 4.137 |
  | mit Definition | 823 |

  `[cmd]` **Stichproben treffen quer durch alle Bereiche:** `718-7`
  Haemoglobin · `2986-8` Testosteron · `2857-1` PSA · `8310-5`
  Koerpertemperatur · `8867-4` Herzfrequenz · `8480-6` systolischer
  Blutdruck · `50196-5` okkultes Blut im Stuhl · `5792-7` Glukose im
  Urin.

  **Der Kopf traegt die Auswahlregel, die Quellendateien und den
  LOINC-Urhebervermerk**, und `reference_ranges` steht auf
  `not_in_loinc` mit der Notiz, wie Bereiche spaeter andocken. `[read]`
  **Der Platz ist da, bevor die Daten kommen.**

  ### Zwei Groessenprobleme

  `[cmd]` **Der Quellordner ist 924 MB** — seit `6708571` in
  `.gitignore`, mit Bezugsquelle und Lizenzhinweis im Kommentar.

  `[cmd]` **Die Masterlist ist 25,9 MB, der Pre-Commit-Hook lehnt ueber
  10 MB ab.** `[read]` Die Grenze gibt es, seit eine Sicherung das Repo
  aufgeblasen hat.

  **Entschieden (Tom, 2026-08-18): aufteilen, nicht kuerzen.** `[read]`
  Der Grund gegen das Wegwerfen von Feldern: **`system` sagt, ob ein Wert
  aus Blut, Urin oder Stuhl kommt — genau das braucht der Import.** Was
  heute unnoetig aussieht, ist morgen die Zuordnungshilfe.

  `[cmd]` **Kein thailaendisches Sprachpaket in LOINC 2.82.** Die 18
  Thai-Synonyme aus `biomarkerSynonyms.ts` bleiben der einzige Bestand.

  `[cmd]` **Erledigt 2026-08-18.** In drei Schritten gebaut:

  | | |
  |---|---|
  | zuerst | 122 kurierte Kandidaten aus vier Quellen, 464 Bereichszeilen |
  | dann | **11.676 LOINC-Codes** aus `Loinc_2.82`, 8.267 mit Einheit, 4.593 mit deutschem Namen |
  | zuletzt | **acht Dateien** unter `daten/biomarker-loinc/`, groesste 8,39 MB |

  `[read]` **Toms Vorgabe war der Wendepunkt:** *„Ich will ein Maximum,
  was solche Daten angeht, und nicht irgendeinen Auszug, der von KI
  generiert wird."* — **Die Designvorlage fuehrt 4 CBC-Marker, die Spec
  15, LOINC den ganzen Bestand.**

  `[cmd]` **Die Stichproben treffen quer durch alle Bereiche:** `718-7`
  Haemoglobin, `2986-8` Testosteron, `2857-1` PSA, `8310-5`
  Koerpertemperatur, `8867-4` Herzfrequenz, `8480-6` systolischer
  Blutdruck, `50196-5` okkultes Blut im Stuhl, `5792-7` Glukose im Urin.

  `[cmd]` **Der Quellordner (924 MB) ist ignoriert**, das Erzeugerskript
  liegt im Repo, **der LOINC-Urhebervermerk steht in jeder der acht
  Dateien.**

  `[read]` **Die Regel dahinter gilt weiter:** Die Vorlage ist die
  Vorgabe fuer Struktur und Anordnung, **nicht fuer Bestandsdaten.** Wie
  bei den 7.140 Lebensmitteln, wo das Tagebuch vier Zeilen zeigt.

- [x] **C-52: Zwei essenzielle Fettsäuren ohne Ziel und ohne
  Bewertung** (neu 2026-08-15). Rest aus GO-00.

  `[cmd]` `F18:2CN6` (Linsäure) und `F18:3CN3` (Alpha-Linolensäure)
  stehen mit `E%`-Referenzwerten da, sind aber **weder in GO-02 noch in
  der Bewertung**: 0 Treffer in `110_goals_zielwerte.sql` und in der
  Zuordnungsdatei.

  `[read]` Die Begründung für `E%` lautete: *gehört zu GO-02, dort wird
  es schon gerechnet.* Das gilt für `CHO` und `FAT` — für diese beiden
  nicht. **Damit fallen sie durch beide Raster.**

  **Zu entscheiden:** Zielwerte in GO-02 ergänzen, oder als
  `nicht_bewertbar` ausweisen. `[Wahrscheinlich]` Ersteres — es sind die
  einzigen zwei essenziellen Fettsäuren, und EFSA setzt für beide einen
  AI.

  `[cmd]` **Erledigt 2026-08-18.** `F18:2CN6` und `F18:3CN3` werden
  gegen die **Goals-Grammziele** bewertet, nicht mehr als
  `energy_share` gefuehrt.

  `[cmd]` **Live am 2026-08-14:** F18:2CN6 8,260 g von 11,100 g =
  **74,4 %**, F18:3CN3 1,425 g von 1,400 g = **101,8 %** — beide
  `complete`.

  ### Die Kette musste umsortiert werden

  `[cmd]` **Schritt `059` laeuft jetzt nach `110`**, weil er
  `goals.zielwerte_am` braucht. `[read]` **Das ist der Preis dafuer, dass
  die Bewertung an den persoenlichen Zielen haengt statt an einer festen
  Tabelle** — und der richtige, weil 13,2 g Linolsaeure fuer Tom etwas
  anderes sind als fuer jemand anderen.

- [x] **C-53: Elf Nährstoffe erreichen die Bewertung nicht** (neu
  2026-08-15). Rest aus GO-00.

  `[cmd]` Nur **5 der 16** reparierten Zeilen kommen heute überhaupt in
  `daily_reference_assessment` an. Der Grund: die Funktion bewertet die
  33 Nährstoffe aus `daily_summary` — **acht Aminosäuren, `NIAEQ` und
  die beiden Fettsäuren stehen dort nicht.**

  `[cmd]` `daily_summary` führt 70 Spalten: acht Makros und 24 Mikros mit
  Fehlzählern. Die Auswahl der 24 stammt aus `SPEC_06`.

  **Zu entscheiden:** Werden die elf aufgenommen — und wenn ja, mit
  welchem Nutzen? `[Vermutung]` Bei Leucin ja (Kraftsport), bei den
  übrigen Aminosäuren fraglich. Jede zusätzliche kostet zwei Spalten in
  einer Sicht, die schon 70 hat.

  **Die GO-00-Reparatur deckt sie trotzdem ab** — sie greift beim
  Aufnehmen, nicht danach.

  `[cmd]` **Erledigt 2026-08-18 mit C-52.**

  | | vorher | nachher |
  |---|---|---|
  | Zeilen mit Prozentwert | 17 | **19** |
  | Mangel-Szenariotag | 16/17 | **18/19** |

  `[cmd]` **`CHORL` bleibt `NO_REFERENCE` und `not_applicable`, ohne
  Prozentwert.** `[read]` Richtig so — **ein Naehrstoff ohne belegten
  Referenzwert bekommt keinen erfundenen.** Wie
  `missing_weight` beim Protein und `missing_body_weight` beim
  Wasserziel.

- [x] **C-83: Der Uebungskatalog aus der XLSX anreichern** (neu
  2026-08-18). **Tom, 2026-08-18:** *„Zu den Exercises gibt's eine
  XLS-Datei mit Beschreibungen."*

  ### Die Datei liegt im Repo, nicht im Vorgaengerrepo

  `[cmd]` `media/exercises/katalog/1500+ exercise data.xlsx`, **328 KB,
  2.343 Zeilen**, sieben Spalten:

  | Spalte | gefuellt |
  |---|---|
  | `Exercise` | 2.343 (100 %) |
  | **`Exercise Instructions (step by step)`** | 1.748 (75 %) |
  | **`Exercise Tips`** | 1.744 (74 %) |
  | **`Primary Activating Muscles`** | 1.743 |
  | **`Secondary Activating Muscles`** | 1.743 |
  | `Equipment` | 1.645 |
  | `Categories` | 1.520 |

  `[cmd]` **1.878 unterschiedliche Uebungen ohne Geschlechtssuffix** —
  gegen **1.416 in `training.exercises`. 462 Differenz, Ursache
  ungeklaert.**

  ### Warum es zaehlt

  `[read]` **Die Muskeln stehen als Fliesstext mit beiden Namen:**
  *„Chest (Pectoralis major), Shoulders (Deltoids), Triceps (Triceps
  brachii)"* — **Alltagsname und Fachname.** Das ist die Vorlage fuer
  zwei Filterachsen **und fuer die deutschen Namen, die dem Katalog
  fehlen.**

  `[cmd]` **Die Kategorien decken sich fast:** Free Weights 554/546,
  Bodyweight 547/529, Resistance 397/341 — **plus 22 als `bodyweight`
  klein geschrieben**, eine Dublette, die nicht mitgekommen ist.

  `[cmd]` **Die Geraete sind brauchbar, aber ungeputzt:** `None` 402
  **und** `None (Bodyweight)` 68 sind dasselbe, `Ski Ergometer ` hat ein
  Leerzeichen am Ende.

  ### Was zu tun ist

  **Erst messen:** Wie viele der 1.416 finden ihre Zeile? Woran
  scheitern die uebrigen? **Was sind die 462, die nur in der Datei
  stehen?**

  **Dann anreichern**, wo es eindeutig ist — `[cmd]` `instructions` und
  `tips` sind bereits Spalten in `training.exercises`. `[read]` **Aber
  `instructions` ist auf 1.416 von 1.416 gefuellt** — **pruefen, ob der
  Bestand aus derselben Quelle stammt oder ein anderer ist.**

  `[cmd]` **Erledigt 2026-08-18**, Kettenschritt `109` —
  `training.exercise_catalog_enrichment`, **1.407 Zeilen, 0 Waisen.**
  Das Skript liest die XLSX **reproduzierbar**, statt einmalig zu
  importieren.

  | | |
  |---|---|
  | Uebungen geprueft | 1.416 |
  | sichere Anreicherungen | **1.407** |
  | mehrdeutig, bewusst ausgelassen | **8** |
  | kein DB-Name | 1 (*MAJOR GROUPS Muscle body*) |
  | `exercises` / `exercise_muscles` | **1.416 / 6.588, unveraendert** |

  ### Die Frage des Auftrags ist beantwortet

  `[cmd]` **`instructions_same_as_exercises` auf 1.406 von 1.407** —
  **der Bestand stammt aus derselben Quelle.** `tips` ebenso auf 1.401.
  `[read]` **Damit gab es nichts zu ergaenzen — und das ist jetzt
  belegt statt vermutet.**

  `[cmd]` **Alle fuenf Anreicherungsspalten sind vollstaendig gefuellt:**
  `primary_activating_muscles`, `secondary_activating_muscles`,
  `equipment_canonical`, `categories_canonical` — je 1.407 von 1.407.

  ### Die Geraete sind geputzt

  `[cmd]` **`None` 439** — die Dublette `None (Bodyweight)` ist
  eingegangen. **`EZ Bar` statt `Ez Bar`**, `Ski Ergometer ` ohne
  Leerzeichen. **85 bleiben leer.**

  `[cmd]` **`match_status` fuehrt drei Zustaende:** `unique` 1.338,
  `duplicate_identical` 62, `duplicate_one_filled` 7. `[read]` **Die 62
  identischen Dubletten sind die `_Male`/`_Female`-Paare** — sie tragen
  denselben Inhalt.

  ### Was jetzt fuer die Uebungssuche dasteht

  `[read]` **Die Muskeln stehen mit beiden Namen:** *„Chest (Pectoralis
  major), Shoulders (Deltoids), Triceps (Triceps brachii)"* —
  **Alltagsname und Fachname.** Das ist die Vorlage fuer zwei
  Filterachsen und fuer deutsche Bezeichnungen.

- [x] **C-84: Die elf Panels gibt es in keiner Quelle** (neu
  2026-08-18). **Befund aus G-60, blockiert den Health score.**

  `[cmd]` **Vier Stellen geprueft:**

  | | |
  |---|---|
  | `loinc_class` | **4 Gruppen**, 31 von 35 sind `CHEM` |
  | `panel_type` | **bei 11.421 von 11.676 leer**, kein benutzter Marker traegt einen |
  | `panels` (JSONB) | **Kreatinin haengt in 33 Elternpanels**, darunter Tiermedizin |
  | `curated_slug` | Markerschluessel, keine Gruppe |

  `[cmd]` **Auch das Vorgaengerrepo hat es nicht** — `category` ist dort
  **Probenmaterial** (blood/hormone/vitamin), keine Panelgliederung.

  `[read]` **Die Attrappe zeigt CBC 5, Metabolic 4, Lipid 5, Liver 6,
  Kidney 4, Thyroid 4, Hormone 10, Inflammation 3, Vitamins 6, Screening
  1** — **das ist eine kuratierte Gliederung, die niemand gebaut hat.**

  `[cmd]` **Das blockiert den Health score:** Er wiegt fuenf Systeme und
  braucht dieselbe Zuordnung.

  **Woher sie kommen koennte:** `[cmd]` `SPEC_05_BIOMARKER_CATALOG.md`
  fuehrt **74 Marker in acht Panels** — aus der Spec waren nur 47
  SQL-Zeilen greifbar (C-70). **Das ist die naechste Stelle zum
  Nachsehen.**

  `[cmd]` **Erledigt 2026-08-18**, Kettenschritt `144`.
  `biomarker_reference_ranges` **464 → 560**, `biomarker_catalog` bleibt
  11.676.

  ### Die Zahl der Spec stimmt dreimal nicht

  `[cmd]` **Das Spec-SQL liefert 47 Marker** — **nicht die „100+“ der
  Ueberschrift und nicht die 74 der Panelzahlen.** `[read]` In C-70 stand
  *„nur 47 SQL-Zeilen greifbar"* — **das war die richtige Zahl, nur als
  Zaehlung abgetan.**

  | | |
  |---|---|
  | im LOINC-Katalog | **44 von 47** |
  | display-nutzbar | 40 |
  | mit numerischen Bereichen | **38** |

  `[cmd]` **Die Quelle steht je Zeile:** 96 aus
  `SPEC_05_BIOMARKER_CATALOG.md`, dazu Fundstellen wie *WHO Iron
  Deficiency Guidelines*, *Endocrine Society*, *American Thyroid
  Association*, *AHA Scientific Statement 2023*.

  ### Was nicht still importiert wurde

  `[cmd]` **Fehlend im LOINC-Zuschnitt:** `10231-9` IGF-1, `5762-0`
  Zink, `2913-2` Selen.

  `[cmd]` **Identitaetsfehler in der Spec:** ApoB/ApoA1, Reverse T3/T3,
  TPO-Ab/TRAb, **Magnesium RBC gegen Methaemoglobin.**

  `[cmd]` **Einheiten- und Bezugsfehler:** Lp(a) `nmol/L` gegen `mg/dL`,
  eGFR `mL/min` gegen `mL/min/{1.73_m2}`.

  `[read]` **Das ist der Kern des Berichts:** Die Spec ist KI-erzeugt,
  und sie verwechselt Marker. **Wer sie ungeprueft einspielt, bekommt
  Methaemoglobin-Bereiche auf Magnesium.**



## Erledigt am 2026-08-05

- [x] Theming tragfähig (Block 4 B): Themes als Einzeldateien mit Registry und
  Token-Vertrag (Konstantenliste + Vertragstest im pnpm-test-Gate); neues
  Theme = genau zwei Dateien, per Probe belegt; `data-theme`/`data-mode`
  server-gerendert aus Cookies (kein Aufblitzen), Umschalter in der Topbar;
  42 tote gov-Festfarben entfernt — `globals.css` farbwertfrei (0 hex/rgba)
- [x] Vorbestehenden Build-Bruch behoben: `/dashboard` fiel aus den
  typedRoutes, weil `app/page.tsx` das Seitenmodul importierte —
  `dashboard-view.tsx` extrahiert, `pnpm build` grün (24 Routen)
- [x] Vier Bibliotheken (Block 4 A): shadcn/ui-Fundament, lucide-react,
  Recharts, Framer Motion — Versionen und Abbildung siehe C-01
- [x] B-14: Prüf-Gate geschaffen — `pnpm gate` (typecheck + test + build),
  versionierter `.githooks/pre-commit`, Build-Cache-Kante auf
  `packages/shared/src/**`; Wirksamkeit doppelt nachgewiesen
  (rotes Gate bei künstlichem Bruch + geblockter echter Commit)
- [x] C-11: als seit M3 erfüllt festgestellt — Prämisse geprüft statt
  übernommen — und mit vier Wirknachweisen belegt; Gate-Doku im README

## Erledigt am 2026-08-01

- [x] Permission-Schicht gebaut und verifiziert (B-01)
- [x] `settings.local.json` bereinigt: 47 Allow-Regeln auf 0 (B-02)
- [x] Secret-Prüfung: `.env*` nie committed, `.gitignore` deckt ab
- [x] SSOT-Ordner vollständig: `00-INDEX`, `10-workspace`, `11-zielarchitektur`,
  `20-apps-web-ist`, `30-datenbank`, `40-spec-code-matrix`, `50-governance-rest` (A-01)
- [x] `10-workspace.md` präzisiert: Governance-Entfernbarkeit gilt nur für
  Packages/Services, nicht für `system/`
- [x] `30-datenbank.md` zweite Fassung: Container-Ist-Zustand ergänzt,
  RLS-Behauptung korrigiert (Datei sagte RLS auf 7 Tabellen, Container hat 2)
- [x] `backup/` angelegt und befüllt — Schema-, Daten- und Rescue-Dumps,
  Integrität per `pg_restore --list` geprüft, Restore getestet (D-11)
- [x] D-01, D-02, D-09, D-11 erledigt
- [x] Legacy-Cloud-Instanz `LumeOS-V2` vermessen — Bestand, Medienabdeckung,
  Storage-Volumen, Branching-Grenzen geklärt (Sektion E)
- [x] `services/` und `packages/` sind deklariert, aber leer
  → **widerlegt.** `[cmd]` 17 Packages mit Code, 42 leere Gerüste als Endausbau deklariert.
- [x] Build-Verifikation nachgeholt: `[cmd]` `pnpm typecheck` 17/17 grün, 3,9 s

## Erledigt am 2026-07-30

- [x] Bestandsaufnahme Repo + `apps/web`
- [x] Modulakte Nutrition
- [x] Spec↔Code-Abgleich Nutrition
- [x] Todo- und ADR-Liste angelegt


## E - Altbestand Uebungen und Muskelgruppen

- [x] **E-15: Vier `body_region`-Werte im Altbestand sind anatomisch
  falsch** (neu 2026-08-13, aus E-13) — `[cmd]` Beim Nachpflegen der
  Lücke aufgefallen, **nicht mitkorrigiert**:

  | Gruppe | steht auf | anatomisch |
  |---|---|---|
  | `Biceps Femoris` | `arms` | Hamstring → `legs` |
  | `Rectus Femoris` | `core` | Quadrizepskopf → `legs` |
  | `Tensor Fasciae Latae` | `back` | Hüftmuskel → `legs` |
  | `Hip Rotators` | `shoulders` | Hüfte → `legs` |

  Der Name führt hier in die Irre: „Biceps" Femoris ist kein Armmuskel,
  „Rectus" Femoris kein Bauchmuskel. `[annahme]` Vermutlich beim Import
  nach Namensähnlichkeit zugeordnet.
  **Bewusst nicht nebenbei erledigt:** E-13 war das Füllen der Lücke,
  nicht das Umschreiben vorhandener Werte. Wer sie ändert, ändert
  bestehende Filterergebnisse — das gehört entschieden. Klein genug für
  einen Einzeiler, sobald Tom zustimmt.

  `[cmd]` **Erledigt 2026-08-18 mit Kettenschritt `108`**, 61 Schritte in der Kette.

  | | vorher | nachher |
  |---|---|---|
  | `exercises` | 1.416 | **1.416** |
  | `muscle_groups` | 96 | **95** |
  | `exercise_muscles` | 6.624 | **6.588** |

  `[cmd]` **Die -36 sind erklaert:** 35 entfernte `secondary`-Doppelrollen
  plus **eine Achilles-Sehnenzuordnung.** `[read]` Das ist die richtige
  Richtung - eine Doppelrolle zaehlt doppelt, sobald jemand Belastung je
  Muskel summiert. **Genau das tut die Muskelkarte.**

  `[cmd]` **Waisen 0, `Achilles Tendon` 0, `none`/`None` 0,
  Primary+Secondary-Doppelrollen 0.**

- [x] **E-17: `Achilles Tendon` ist eine Sehne in `muscle_groups`** (neu
  2026-08-13, aus E-13/Block 26) — `[cmd]` 1 Zuordnung. Sie hat in E-13
  die Region `legs` bekommen, damit sie nicht durch jeden Regionsfilter
  fällt. **Geografisch richtig, fachlich falsch:** eine Sehne ist keine
  Muskelgruppe.
  **Klein, aber symptomatisch.** Dieselbe Tabelle führt weitere
  Sammelbegriffe, die keine einzelnen Muskeln sind: `Grip Muscles`,
  `Fingers Flexors`, `Foot Muscles`, `Neck Muscles`, `Arms`, `Thighs`.
  Sie bleiben, weil Übungen sie benutzen — aber die Tabelle vermischt
  damit **anatomische Muskeln** mit **funktionalen Gruppen**.
  Zu entscheiden: eigene Kennzeichnung (`typ: muskel | gruppe | sehne`),
  oder bewusst so lassen und im Schema dokumentieren. Erst relevant,
  wenn eine Oberfläche nach Muskeln filtert; vorher kostet es nichts.

  `[cmd]` **Erledigt 2026-08-18 mit Kettenschritt `108`**, 61 Schritte in der Kette.

  | | vorher | nachher |
  |---|---|---|
  | `exercises` | 1.416 | **1.416** |
  | `muscle_groups` | 96 | **95** |
  | `exercise_muscles` | 6.624 | **6.588** |

  `[cmd]` **Die -36 sind erklaert:** 35 entfernte `secondary`-Doppelrollen
  plus **eine Achilles-Sehnenzuordnung.** `[read]` Das ist die richtige
  Richtung - eine Doppelrolle zaehlt doppelt, sobald jemand Belastung je
  Muskel summiert. **Genau das tut die Muskelkarte.**

  `[cmd]` **Waisen 0, `Achilles Tendon` 0, `none`/`None` 0,
  Primary+Secondary-Doppelrollen 0.**

- [x] **E-18: `none/None` als Muskelgruppe — Restfrage** (neu
  2026-08-13, aus Block 26) — `[cmd]` Im Seed sind die zwei
  Platzhalterzeilen entfernt (v100 prüft `platzhalter_none = 0`), und
  die 14 zugehörigen Zuordnungen entfielen ersatzlos: der Wert bedeutete
  „keine sekundären Muskeln", also eine **Abwesenheit, als Wert
  kodiert**.
  **Was offen bleibt:** ob die 14 betroffenen Übungen fachlich wirklich
  keine sekundären Muskeln haben oder ob dort nur niemand gepflegt hat.
  `[cmd]` Alle 14 tragen echte primary-Muskeln, das Fehlen ist also
  plausibel — belegt ist es nicht. Klärung nur mit einer fachlichen
  Quelle, nicht aus den Daten.

  `[cmd]` **Erledigt 2026-08-18 mit Kettenschritt `108`**, 61 Schritte in der Kette.

  | | vorher | nachher |
  |---|---|---|
  | `exercises` | 1.416 | **1.416** |
  | `muscle_groups` | 96 | **95** |
  | `exercise_muscles` | 6.624 | **6.588** |

  `[cmd]` **Die -36 sind erklaert:** 35 entfernte `secondary`-Doppelrollen
  plus **eine Achilles-Sehnenzuordnung.** `[read]` Das ist die richtige
  Richtung - eine Doppelrolle zaehlt doppelt, sobald jemand Belastung je
  Muskel summiert. **Genau das tut die Muskelkarte.**

  `[cmd]` **Waisen 0, `Achilles Tendon` 0, `none`/`None` 0,
  Primary+Secondary-Doppelrollen 0.**

- [x] **E-19: Derselbe Muskel mit `primary` UND `secondary` an einer
  Übung** (neu 2026-08-13, aus E-16/Block 26) — `[cmd]` **35 Fälle im
  gesamten Bestand**: eine Übung führt dieselbe Muskelgruppe zweimal,
  einmal als `primary` und einmal als `secondary`.

  **Beim mideus-Merge aufgefallen, aber NICHT von ihm verursacht.** Vier
  der 35 stammen aus jenem Paar (`Resistance Band Lying Abduction` und
  drei weitere Abduktionsübungen); die übrigen 31 gab es vorher. Der
  Primärschlüssel `(exercise_id, muscle_group_id, role)` lässt das zu —
  fachlich ist es ein Widerspruch: ein Muskel ist an einer Übung
  entweder Haupt- oder Nebenmuskel, nicht beides.

  **Nicht automatisch zu bereinigen.** Welche Rolle gilt, ist eine
  fachliche Frage; `primary` zu bevorzugen wäre eine Regel ohne Beleg.
  `[cmd]` Bei den vier mideus-Fällen trug die *korrekt* geschriebene
  Zeile durchgängig `primary`, die falsch geschriebene `secondary` —
  das ist ein Hinweis, aber kein Nachweis für die übrigen 31.
  **Zu klären:** Reicht der Primärschlüssel, oder braucht es einen
  UNIQUE auf `(exercise_id, muscle_group_id)` plus eine Entscheidung,
  welche Rolle bei einem Konflikt gewinnt?

---

  `[cmd]` **Erledigt 2026-08-18 mit Kettenschritt `108`**, 61 Schritte in der Kette.

  | | vorher | nachher |
  |---|---|---|
  | `exercises` | 1.416 | **1.416** |
  | `muscle_groups` | 96 | **95** |
  | `exercise_muscles` | 6.624 | **6.588** |

  `[cmd]` **Die -36 sind erklaert:** 35 entfernte `secondary`-Doppelrollen
  plus **eine Achilles-Sehnenzuordnung.** `[read]` Das ist die richtige
  Richtung - eine Doppelrolle zaehlt doppelt, sobald jemand Belastung je
  Muskel summiert. **Genau das tut die Muskelkarte.**

  `[cmd]` **Waisen 0, `Achilles Tendon` 0, `none`/`None` 0,
  Primary+Secondary-Doppelrollen 0.**

## G — Theme V1

- [x] **G-01: Parallelstruktur und Tokens** (neu 2026-08-15). Der erste
  Schritt, und er baut noch keine Oberfläche.

  **Toms Vorgabe:** die bestehende Variante bleibt, die neue kommt
  **parallel** dazu. Umgeschaltet wird am Ende, nicht am Anfang.

  - `apps/web/src/app/v2/` als sichtbares Präfix. `[cmd]` Eine
    Routengruppe `(v2)` scheidet aus — sie erscheint nicht in der URL und
    kollidiert mit den zwölf bestehenden Modulordnern.
  - `packages/ui` in Betrieb nehmen. `[cmd]` Enthält heute nur
    `src/.gitkeep`.
  - Die 123 Klassen aus `theme-v1/styles.css` übernehmen, **unter
    eigenem Präfix**, damit die alten Seiten unberührt bleiben.
  - `[cmd]` Die 32 Tokens sind identisch mit den vorhandenen — nichts zu
    übernehmen. **Ausnahme:** `--pos`, `--warn`, `--neg` fehlen im
    Hellmodus des Entwurfs; im Repo am 2026-08-15 repariert, der Fehler
    darf nicht zurückkommen.

  **Die Datenschicht wird geteilt, nicht kopiert** —
  `lib/nutrition/food-search.ts`, die `rpc()`-Aufrufe, die
  Supabase-Klienten, `middleware.ts`. Dort steckt die Arbeit von zwei
  Tagen.

  `[cmd]` **Erledigt 2026-08-15.** `packages/ui` in Betrieb (Muster von
  `packages/shared`, ohne eigene Gate-Tasks — deshalb weiterhin 8),
  `/v2` erreichbar, **169 Klassen unter `v2-`** aus dem Entwurf erzeugt.

  **Nicht übernommen:** die Tokenblöcke (identisch mit den vorhandenen)
  und der Font-Import von `fonts.googleapis.com` — `[cmd]` `apps/web`
  lädt keine externen Schriften; das wäre eine fremde Abhängigkeit im
  kritischen Pfad gewesen.

  **Vier unabhängige Belege für die Trennung**, statt einer Zusicherung:
  `[cmd]` 15 eingefügte und 0 gelöschte Zeilen an bestehenden Dateien ·
  leerer Diff auf `globals.css` und `styles/` · **das gemeinsame Bundle
  behielt seinen Hash, als `v2.css` sich änderte** · ein Test über 15
  bestehende Routen, dessen Bedingung aus `app-shell.tsx` gelesen wird
  statt abgeschrieben.

- [x] **G-02: Die Shell** (neu 2026-08-15). Setzt G-01 voraus.

  `[cmd]` `sidebar`, `sidebar-nav`, `nav-group`, `topbar`, `breadcrumb`,
  `module-header`, `card`/`card-tight`/`card-flat`, `btn-accent`, `tabs`,
  `avatar` — diese Klassen wiederholen sich in allen 55 Modulseiten. Wer
  sie beim zweiten Modul nachbaut, baut sie falsch.
  Vorlage: `theme-v1/shell.jsx` und `shared.jsx`.

  `[cmd]` **Der Akzentmechanismus existiert bereits:**
  `app-shell.tsx:296` setzt `--acc` inline aus einer Map über alle elf
  Module. Nicht in `tailwind.config.js` gespiegelt sind die einzelnen
  `--acc-nutri` — deshalb `bg-acc` ja, `bg-acc-nutri` nein.

  **Zwei Korrekturen an der Sidebar des Entwurfs** (Tom, 2026-08-15):

  - **Workspaces sind Links, keine Module.** `[read]` `Coach Portal`,
    `Marketplace` und `Admin` stehen im Entwurf unter „WORKSPACES", als
    lägen sie in derselben Anwendung. Sie sind eigene Domain-Apps —
    `apps/web` verlinkt sie, bettet sie nicht ein. `[cmd]` `apps/admin`
    läuft bereits so: Port 3210, eigene Sitzung, eigener
    Cookie-Namensraum `sb-127-admin-auth-token`. In der Shell also ein
    Verweis nach aussen, kein Eintrag im Modulrouting.
  - **`Test · Onboarding` gehört nicht in die Produktnavigation.**
    `[read]` Es stand im Entwurf unter „SYSTEM", weil es einen Platz
    brauchte — Toms Worte: *„das musste irgendwohin, ist aber natürlich
    nicht der richtige Ort."* Wohin, ist offen; eine Testfläche in der
    Nutzernavigation ist es nicht.

  **Zwei Entscheidungen, die sonst später weh tun:**
  - **Die Kontextspalte** steht auf jedem Bildschirm. Ab Tablet abwärts:
    Blatt, Reiter, oder weg?
  - **Buddy antwortet kontextbezogen auf jeder Seite** — ein
    Modellaufruf je Seitenaufruf, bei elf Modulen und täglicher Nutzung.
    Kostenfrage, keine Designfrage.

  `[cmd]` **Erledigt 2026-08-15**, und **zum ersten Mal in diesem Projekt
  im Browser geprüft.** Auf `/v2`: je eine `v2-app`, `v2-sidebar`,
  `v2-topbar`, `v2-context`, 12 Navigationseinträge, **0 alte
  `lume-shell`**. Auf `/nutrition` exakt umgekehrt. 11 Akzente → 11
  verschiedene Farben in beiden Modi.

  **Die Kontextspalte wird ausgeblendet, zweistufig.** `[cmd]` Der
  Befund, der es entschied: **der Entwurf hat null `@media`-Regeln** —
  unter 1.280 px läuft das Raster aus dem Fenster. Statt einen dritten
  Haltepunkt zu erfinden, das Verhalten der bestehenden Oberfläche
  übernommen. Gegen ein Blatt von rechts: *das ist nicht Shell, das ist
  Extra.*

  **Vier Randfälle repariert, die niemand beauftragt hatte:**
  `Sparkline` teilte bei einem Punkt durch null · `Ring` und `Meter`
  deckelten nur oben · `Tabs` waren per Tastatur unerreichbar · `[cmd]`
  die Vorlage verweist auf ein Symbol `user`, das nicht existiert —
  `<Icon>` rendert dort **still nichts**; mit `IconName` als Union ist
  das jetzt ein Übersetzungsfehler.

  **Zwei Korrekturen an der Sidebar** (Tom): Workspaces sind externe
  Links, `Test · Onboarding` gehört nicht in die Produktnavigation.

- [x] **G-03: Nutrition als erstes echtes Modul** (neu 2026-08-15).
  Setzt G-02 voraus.

  `[cmd]` **Nur dort ist die Datenseite vollständig** — Suche mit
  234 ms, 7.140 Anzeigenamen, 17.967 Tags, Tagebuch, 24 Mikros mit
  Fehlzählern, Bewertung gegen 165 Referenzwerte, `foods_custom`. Jedes
  andere Modul bräuchte erst Daten.

  Vorlage: `module-nutrition.jsx`, `module-nutrition-nutrients.jsx`,
  `module-nutrition-spec.jsx`.

  `[cmd]` **`foods/page.tsx` wird ersetzt, nicht umgebaut** — 208 harte
  Farbwerte, eine einzige Token-Verwendung. Sie bleibt unter
  `/nutrition`, bis `/v2/nutrition` sie ablöst.

  **Vier Regeln aus der Datenseite** (siehe C-48): Fehlzähler dürfen
  nicht zu Nullen werden · 80 % eines `UL` heisst das Gegenteil von 80 %
  eines `PRI` · die 78 Nährstoffe ohne Referenzwert sind kein „0 %
  gedeckt" · 100 % Deckung heisst nicht „genug für dich".

  `[cmd]` **Erledigt 2026-08-15.** Suche und Tagebuch unter
  `/v2/nutrition`, auf der geteilten Datenschicht.

  `[cmd]` Eine echte Suche: `Huehnerbrust` → 31 Treffer, erster ist
  `Hähnchenbrust (roh)`, `V416100`, 118 Nährwerte im Detail. Und
  `search_events` bekam die Zeile mit `selected_rank = 1` — **ohne dass
  die Seite das Protokoll kennt.**

  **Die beste Entscheidung:** keine gefüllten Ringe ohne Ziel. `[cmd]`
  Die Vorlage beginnt mit acht erfundenen Zahlen; dieses Repo hatte
  keine Zieltabelle. *Ein zu 68 % gefüllter Ring wäre eine
  Falschaussage mit hoher Überzeugungskraft.*

  **Die vier C-48-Regeln an echten Zeilen belegt:** dieselben 120 mg
  Vitamin C ergeben 109,1 % des `PRI` und 6,0 % des `UL`. Eisen mit Wert,
  aber ohne Prozentwert, weil ein Fehlzähler auf 1 steht.

  `[read]` Und der Satz, der die Architektur trägt: *Die Regeln werden in
  der Datenbank durchgesetzt, nicht in der Oberfläche. Die Seite rechnet
  nicht nach — das wäre die Stelle, an der aus einem Fehlzähler eine
  Null wird.*

- [x] **GO-00: Die Referenzwerte tragen unpassende Einheiten** (neu
  2026-08-15). **Teil 1 erledigt, Teil 2 offen.**

  **Erledigt:** `[cmd]` Die eindeutigen Umrechnungen (mg/µg/g) sind im
  Seed korrigiert, Commits `7ddd307` und `d7cb600`. Calcium steht bei
  `PRI 1000 mg` und `UL 2500 mg` statt bei 32.000 %. Die Schemaprüfung
  kennt jetzt Einheiten und meldete am beschädigten Stand 47 unpassend.

  **Offen: 16 Zeilen mit fremder Bezugsgrösse.** Sie sind im Seed als
  abweichend markiert — **das verhindert die Prüfmeldung, nicht den
  falschen Prozentwert.** `[cmd]` Protein zeigt im Tagebuch **1.593 %**
  statt ~20 %: sein Referenzwert ist `0,83 g/kg bw/day`, und
  `daily_reference_assessment` teilt, ohne mit den 78,4 kg zu
  multiplizieren.

  **Entschieden am 2026-08-15** nach Recherche, wie etablierte Apps es
  halten — **niemand zeigt eine Einheit je Kilogramm**, alle rechnen um
  und zeigen absolut:

  | | | |
  |---|---|---|
  | `mg/kg bw/day`, `g/kg bw/day` | **10** | zur Laufzeit umrechnen mit `body_weight_kg`, absolut anzeigen |
  | `E%` | **4** | Verteilungsregel für Makros — gehört zu GO-02, nicht in die Nährstoffbewertung |
  | `mg/MJ`, `mg NE/MJ` | **2** | Nährstoffdichte, Fachmass — nicht anzeigen, Grund ausweisen |

  `[read]` Tom, 2026-08-15: *„Ok, das passt so für mich."*

  **Die Umrechnung gehört zur Laufzeit in `daily_reference_assessment`,
  nicht in den Seed.** `[cmd]` Die Funktion liest das Profil bereits für
  Alter und Geschlecht; das Gewicht steht seit GO-01 in derselben Zeile.
  Beim Gewichtswechsel ändert sich der Wert dann mit, statt in der
  Tabelle zu veralten.

  **Warum das liegen blieb:** Die Entscheidung fiel im Gespräch und
  wurde nicht zum TODO-Punkt. Zwei Aufträge sperrten
  `daily_reference_assessment` — zu Recht, aber niemand hatte den
  Auftrag, sie umzusetzen. **Eine Entscheidung ohne Punkt existiert
  nicht.**

  `[cmd]` **Erledigt 2026-08-15, beide Teile.**

  **Teil 1** (`7ddd307`, `d7cb600`): eindeutige mg/µg/g-Umrechnungen im
  Seed. Calcium von 32.000 % auf `PRI 1000 mg` / `UL 2500 mg`. Die
  Schemaprüfung kennt jetzt Einheiten und meldete am beschädigten Stand
  **47 unpassend**, danach 0.

  **Teil 2** (`91ee6b2`): die 16 Zeilen mit fremder Bezugsgrösse, zur
  **Laufzeit** in `daily_reference_assessment` aufgelöst.

  | | vorher | nachher |
  |---|---|---|
  | `PROT625` | **1.593 %** | **31,7 %** — 20,66 g gegen 65,072 g |
  | `LEU` | Tausendfaches | 55,5 % — 1,70 g gegen 3,058 g |
  | `CHO`, `FAT` | falscher Prozentwert | `energy_share`, kein Prozentwert |
  | `NIAEQ` | falscher Prozentwert | `nutrient_density` |

  `[cmd]` Verteilung unverändert bei 45: 37 complete, 3 energy_share,
  2 not_applicable, 2 incomplete, 1 nutrient_density. **Genau vier Zeilen
  haben `complete` verlassen.**

  **Der angezeigte Referenzwert ist der aufgelöste** — 65,072 g statt
  `0,83 g/kg bw/day`. War nicht beauftragt: ohne ihn könnte niemand die
  Prozentzahl nachrechnen.

  **Der Fund unter dem Fund:** `[cmd]` Neun der zehn per-kg-Zeilen stehen
  in `mg/kg`, während der Nährstoff in `g` geführt wird. Ohne die
  Division durch 1000 hätte Leucin das Tausendfache gezeigt — **derselbe
  Fehler eine Ebene tiefer**, gedeckt von derselben Markierung, die Teil 1
  gesetzt hatte.

  **Ohne Gewicht kein Wert:** `[cmd]` `missing_weight`, kein Prozentwert,
  **und kein Referenzwert** — `0,83` dort stehenzulassen wäre
  irreführend.

  **Live gelesen, nicht eingefroren — jetzt festgehalten:** Eine
  Mahlzeit ist ein Ereignis der Vergangenheit, ein Referenzwert eine
  Aussage über diesen Menschen. `[cmd]` Seit heute verstärkt: das
  Körpergewicht geht in zehn Referenzwerte direkt ein — wer sein Gewicht
  korrigiert, ändert den Protein-Deckungsgrad jedes vergangenen Tages.
  Die Alternative wäre schlechter: ein alter Eintrag gegen ein Gewicht
  bewertet, das die Person nicht mehr hat.

  **Warum Teil 2 liegen blieb:** Die Entscheidung fiel im Gespräch und
  wurde nicht zum TODO-Punkt. Zwei Aufträge sperrten
  `daily_reference_assessment` — zu Recht, aber niemand hatte den
  Auftrag, sie umzusetzen. **Eine Entscheidung ohne Punkt existiert
  nicht.**

- [x] **G-08: Die Vorlage als Mockup übernehmen** (neu und erledigt
  2026-08-16). Commit `f82f3df`.

  **Tom, 2026-08-16:** *„Wieso holen wir nicht einfach das ganze
  Template als Mockup rein und binden dann an?"*

  `[cmd]` Übernommen: `module-dashboard.jsx` → `/v2/dashboard`
  (12 Kacheln), `module-nutrition.jsx` → Tab `Diary`,
  `module-nutrition-nutrients.jsx` → Tab `Nutrients` (79 Nährstoffe,
  8 Gruppen, mechanisch extrahiert), `RadarChart` nach `packages/ui`.

  **Mit den erfundenen Daten** — 1.847 kcal, Recovery 82, 2.142 TSS,
  Readiness 84, Pre-workout 68, Netzdiagramm, Below threshold.

  **Zwei Abweichungen zurückgenommen:** vier Ringe wurden wieder ein
  Kalorienring plus drei lineare Balken; `ModuleHero` wich dem
  Vorlagenkopf. `[read]` Und der Satz, auf den es ankam: *„Mein leerer
  Ring aus dem letzten Durchgang war die Abweichung, nicht die Zahl."*

  `[cmd]` Eine Stelle ohne Vorlagenwert: `btn-sm` wird in vier Kacheln
  benutzt, in `styles.css` aber nie definiert.

- [x] **G-09: Attrappen vollständig, Knöpfe mit Modal** (neu und
  erledigt 2026-08-16). Commit `4da6bac`.

  **Tom, 2026-08-16:** *„Alles kommt rein. Wenn es ein Modal öffnen
  will, das es noch nicht gibt, kommt ein designpassendes Modal ‚in
  Entwicklung'. Wenn es eine Attrappe ist, ist scheissegal, was da drin
  steht — es zeigt ja nur, wie es aussehen könnte."*

  `[cmd]` 12 Kacheln mit 9 Marken, 7 Tabs, 0 Sidebar-Untereinträge,
  `in-entwicklung.tsx` in `packages/ui`.

  **Der Test ist der eigentliche Ertrag:** `v2-attrappen.test.ts` hält
  fest, dass keine Kachel still verschwindet — gegengeprobt: eine Marke
  entfernt → rot mit *„9 Kacheln haben keine Datenquelle, aber 8 sind
  gekennzeichnet"*.

  **Drei Argumente sind dabei gefallen**, alle vom Typ „weglassen statt
  kennzeichnen": *eine erfundene Zahl sieht aus wie eine Messung* · *ein
  Knopf ohne Ziel ist schlimmer als kein Knopf* · *im Kopf ist kein
  Platz für eine Marke*. `[read]` Festgehalten in
  `theme-v1-umsetzung.md`.

- [x] **G-15: Die Ansicht kollabiert mehrere Mahlzeiten desselben Typs**
  (neu 2026-08-17). Folgt aus C-59.

  `[cmd]` Die Datenseite kann seit `052a` zwei Snacks am selben Tag —
  **die Oberflaeche zeigt sie als einen.** Aus dem Codex-Bericht: *der
  bestehende Webpfad sortiert nach `created_at`, und die v2-Ansicht
  fasst über `Map(meal_type)` zusammen.*

  `[cmd]` Live belegt: 2026-08-14 traegt Snacks um 10:14 und 16:00.

  **Was zu aendern ist:** Sortierung nach `meal_time` statt
  `created_at`, und der Schluessel der Zusammenfassung darf nicht der
  Typ sein.

  `[read]` Gehoert zu G-14 (Datumsnavigation) — beides betrifft
  denselben Lesepfad und dieselbe Ansicht.

  `[cmd]` **Erledigt 2026-08-17.** Der Fehler stand in einer Zeile:
  `new Map(m => [m.meal_type, m])` — **ein Schluessel je Typ, der zweite
  ueberschrieb den ersten spurlos.**

  `[read]` Die Annahme stammte aus der Zeit des `UNIQUE`-Index; seit
  `052a` gibt es ihn nicht mehr, **die Ansicht hatte es nicht
  mitbekommen.**

  `[cmd]` Jetzt eine Karte je Mahlzeit, sortiert nach `meal_time` statt
  `created_at`, mit Uhrzeit. Am 14.08.: 07:30 Breakfast · 10:14 Snack ·
  12:30 Lunch · 16:00 Snack · 19:30 Dinner.

- [x] **G-14: Datumsnavigation** (neu 2026-08-17). **Tom, 2026-08-17:**
  *„Ich sehe nur den heutigen Tag und kann den nicht switchen."*

  **Es funktioniert bereits — die Knöpfe sind nur unsichtbar.** `[cmd]`
  `?datum=` als Suchparameter, zwei `Link` mit `vortag()` und
  `folgetag()`. Sie tragen `v2-btn-ghost` und stehen als zwei blasse
  Pfeile links neben „Lebensmittel suchen“ — kaum vom Hintergrund
  unterscheidbar.

  `[read]` Derselbe Fall wie der Speichern-Knopf in C-58: **ein Knopf,
  den man nicht sieht, existiert für den Nutzer nicht.**

  ### Was gegenüber dem Vorgängerrepo fehlt

  `[cmd]` `referenz/lumeos-2026/src/contexts/DateContext.tsx` und
  `modules/nutrition/components/DateNavigation.tsx`:

  | Vorgängerrepo | hier |
  |---|---|
  | `goPrev`, `goNext`, **`goToday`** | nur vor und zurück |
  | `isToday`-Prüfung, „heute“ hervorgehoben | fehlt |
  | Datumsauswahl über Kalender | fehlt |
  | **`DateContext` für alle Module** | nur Nutrition, über die Adresse |

  **Das Datum gehört in einen gemeinsamen Zustand**, nicht je Modul —
  wer im Tagebuch auf gestern blättert und dann aufs Dashboard wechselt,
  erwartet dort denselben Tag.

  ### Ein Fund, der weiter reicht als die Anzeige

  `[cmd]` `DateContext.tsx` löst die **Zeitzonenfrage** ausdrücklich:
  `getLocalDateStr` nimmt `getFullYear`/`getMonth`/`getDate` — **lokal,
  nicht UTC**. Und beim Blättern `new Date(datum + 'T12:00:00')`, also
  Mittag, **um Zeitumstellungen zu umgehen**.

  `[cmd]` Die Umsetzung hier nimmt `T00:00:00` — **an
  Zeitumstellungstagen kippt das um einen Tag.** Für Thailand ohne
  Sommerzeit folgenlos, für Europa nicht.

  `[read]` Das berührt C-61: Dort ist die Zeitzonenfrage für `meals`
  gestellt. **Beides gehört zusammen entschieden** — welcher Tag ein
  Eintrag ist, hängt an derselben Antwort.

  `[cmd]` **Erledigt 2026-08-17.** `‹ Heute ›` als Block mit Rahmen,
  mittig. „Heute" als Wort — dann ist das Feld kein Knopf; an anderen
  Tagen `Fr., 14. Aug. 2026`, Klick fuehrt zurueck.

  `[cmd]` **Beide Rollenfaelle belegt:** als `dev@lumeos.app` (Admin)
  geht vorwaerts und der Zukunftstag meldet sich als solcher; als
  `test-user@lumeos.local` gesperrt mit *„Kuenftige Tage sind
  gesperrt."* Die Rolle kommt aus `app_metadata` ueber
  `isAdminFromAppMetadata` — **dieselbe Funktion wie im Admin-Bereich**,
  nicht neu gebaut.

  `[cmd]` **Mittag uebernommen:** drei Stellen rechneten ueber
  Mitternacht und waeren an Zeitumstellungstagen um einen Tag gekippt.
  Alle laufen jetzt ueber `lib/datum.ts`.

  ### Der gemeinsame Datumszustand kommt nicht — begruendet

  `[read]` *Der Kontext des Vorgaengers laesst sich nicht uebernehmen:
  dort ein Router-Zustand im Browser, hier Serverkomponenten je Route.
  Ein Browser-Kontext wuesste das Datum, der Server nicht — zwei
  Wahrheiten. Ein Cookie waere serverseitig richtig, aber ein Datum, das
  sich ueber Tage merkt, ist eines, das man vergisst.*

  **Der Weg ist, das Datum beim Modulwechsel im Link mitzugeben.**
  `[cmd]` Heute gibt es genau eine Verlinkung zwischen Dashboard und
  Tagebuch. **Sobald das Dashboard datumsabhaengige Kacheln bekommt,
  kippt das** — dann gehoert es als Suchparameter gebaut.

- [x] **G-16: Training als Mockup** (neu und erledigt 2026-08-17).

  **Der Punkt wurde nachtraeglich angelegt** — der Auftrag lief, ohne
  dass er in der Liste stand. `[read]` Derselbe Fehler, den Tom am
  2026-08-16 geruegt hat.

  `[cmd]` `/v2/training` steht: sieben Dateien, 3.026 Zeilen, **38
  Kacheln, alle mit Attrappenmarke.** Gate 8/8, 194 Tests (vorher 189).

  ### Die vier Vorlagendateien sind ein System, keine Fassungen

  `[cmd]` **Der Beleg steht im Rahmen selbst**,
  `module-training.jsx:48-53`:
  `{tab === "progress" && window.TrainingProgressionView && …}`

  **Sechs von zehn Tabs sind im Rahmen leer** und werden aus den
  Begleitdateien gefuellt. Wer nur `module-training.jsx` uebernimmt,
  baut ein Modul, bei dem sechs Tabs nichts anzeigen.

  | | |
  |---|---|
  | `-spec.jsx` | vier Tabs, drei Rechner, die Formeln |
  | `-extras.jsx` | sechs Modale, der Kontext, eine Kachel |
  | `-offline-hr.jsx` | zwei Tabs |

  `[read]` **Anders als bei Nutrition**, wo `-spec.jsx` eine
  konkurrierende Fassung war. **Das gilt fuer die naechsten Module nicht
  automatisch** — es muss je Modul geprueft werden.

  `[cmd]` Zwei Aufrufe im Rahmen zeigen ins Leere:
  `PeriodizationFullView` und `HeartRateWidget` existieren in keiner der
  vier Dateien. Entfallen, mit Vermerk.

  ### Was zuerst echte Daten bekommen kann

  `[cmd]` **Der Tab „Exercises":** vier von sechs Spalten sind sofort da
  — 1.416 Uebungen, 58 Geraete, 6.624 Muskelzuordnungen. `e1RM` und
  `Best set` bleiben `—`, weil sie Saetze brauchen.

  `[cmd]` **`training.sessions` und `training.sets` kommen in
  `supabase/_pipeline/` nirgends vor** — das ist der Grund, warum alles
  andere Attrappe ist.

- [x] **G-18: Die Schrift fehlt** (neu 2026-08-17). **Tom, 2026-08-17:**
  *„Es ist schlechter lesbar als die Vorgabe."*

  **Es liegt nicht an der Deckkraft.** `[cmd]` Die Farbtokens sind
  identisch mit der Vorlage — `--fg-dim 0.420`, `--fg-muted 0.720`,
  Wert für Wert.

  `[cmd]` **Es liegt daran, dass `--font-sans` nicht existiert.** Die
  Vorlage setzt `--font-sans: 'Inter', -apple-system, system-ui,
  sans-serif` und laedt Inter ueber `fonts.googleapis.com`. In diesem
  Repo definiert `lume.css` **nur `--font-mono`** — und `v2.css`
  benutzt `var(--font-sans)`, eine Variable ohne Definition.

  **Damit faellt die Schrift auf die Browservorgabe zurueck**, unter
  Windows meist eine Serifenschrift. Genau das ist in Toms
  Bildschirmfotos zu sehen: „Nutrition", „Tagebuch", „Mahlzeiten
  erfassen" stehen mit Serifen. **Bei kleinen Groessen auf dunklem Grund
  wirkt das duenner und unruhiger — unabhaengig von der Farbe.**

  ### Woher es kommt

  `[read]` Entscheidung aus G-01: *„Nicht uebernommen: der Font-Import
  von `fonts.googleapis.com` — `apps/web` laedt keine externen
  Schriften; das waere eine fremde Abhaengigkeit im kritischen Pfad
  gewesen."*

  **Die Begruendung war richtig, die Folge nicht bedacht:** Der Import
  fiel weg, `--font-sans` wurde nie ersetzt.

  ### Die Loesung ohne externe Abhaengigkeit

  `[cmd]` `apps/web` ist Next.js — **`next/font/google` laedt Inter beim
  Bauen herunter und liefert sie vom eigenen Server aus.** Keine Anfrage
  an Google zur Laufzeit, kein zusaetzlicher Verbindungsaufbau. Das ist
  der Standardweg fuer genau diesen Fall.

  `[cmd]` Dasselbe gilt fuer `JetBrains Mono` — die Vorlage setzt es als
  `--font-mono`, hier steht `ui-monospace, SFMono-Regular, Menlo, …`.
  **Pruefen, ob das gewollt ist**: Systemschriften sind hier vertretbar,
  weil Monospace ueberall aehnlich aussieht.

  **Danach neu beurteilen.** `[Wahrscheinlich]` Damit erledigt sich der
  Lesbarkeitseindruck; falls dann noch etwas zu blass ist, sind es die
  Tokens — und die lassen sich gezielt anfassen.

  `[cmd]` **Erledigt 2026-08-17**, Commit `7cac873`. Mit
  `getComputedStyle` gemessen:

  | | vorher | nachher |
  |---|---|---|
  | `body` rendert in | **„Times New Roman"** | `__Inter_8b3a0b` |
  | `--font-sans` | **leer** | Inter + Rueckfallkette der Vorlage |
  | geladene Schriften | keine | Inter 400, 500, 600, 700 |

  **Eine Serifenschrift bei 11–13 px** — genau der Eindruck „duenner
  und unruhiger". `[cmd]` Die Tokens blieben unangetastet.

  `[cmd]` `next/font/google` laedt beim Bauen: **0 Anfragen an Google zur
  Laufzeit**, im Netzwerkprotokoll gezaehlt. **Die G-01-Entscheidung
  bleibt gewahrt.**

  ### `--font-mono` gelassen — und die Messung beweist nichts

  `[read]` Der Vergleich beider Ketten ergab ein identisches Bild, **aber
  JetBrains Mono ist hier nicht installiert und fiel auf dieselbe
  Systemschrift zurueck. Die Messung kann die beiden nicht
  unterscheiden.**

  `[annahme]` Monospace-Schriften aehneln sich staerker als
  Proportionalschriften; belegen liesse es sich erst, wenn JetBrains
  Mono geladen wird.

  ### Der Grund, warum es neun Tage unbemerkt blieb

  `[cmd]` **Der Theme-Vertrag prueft `--font-mono`, aber nicht
  `--font-sans`.** Jetzt in `THEME_TOKENS_BASE`, gegengeprobt: Token
  versteckt → rot, zurueckgesetzt → gruen.

- [x] **G-20: `chevron_up` fehlt im Symbolsatz** (neu 2026-08-17). Rest
  aus G-16.

  `[cmd]` Die Vorlage benutzt es im Routine-Editor. Nicht ergaenzt, weil
  `packages/ui` gesperrt war — stattdessen `arrow_up`/`arrow_down`.

  `[read]` `<Icon>` rendert bei unbekanntem Namen **still nichts**; seit
  G-02 ist `IconName` eine Union, damit das ein Uebersetzungsfehler
  wird. **Deshalb der Ersatz statt eines stillen Lochs.**

  `[cmd]` **Erledigt 2026-08-17** — und es war nicht eines, sondern
  **sechs**: 52 Symbole vorhanden, 53 benutzt.

  `chevron_up`, `bolt`, `cloud_off`, `refresh`, `user` — **alle fuenf
  aufgenommen.** `arr_r` **nicht**: `[cmd]` Die Vorlage definiert
  `arrow_right` und benutzt an einer Stelle `arr_r` — **das ist ihr
  Tippfehler, und ihn zu uebernehmen hiesse, ihn zu zementieren.**

  `[cmd]` **Keines der sechs ist in `shared.jsx` der Vorlage
  definiert** — sie zeichnen dort ebenfalls nichts. **Deshalb fiel es
  niemandem auf.** Training steht wieder auf `chevron_up`.

- [x] **G-19: 15 Rasterklassen aus Training nach `v2.css`** (neu
  2026-08-17). Rest aus G-16.

  `[cmd]` Sie liegen in `apps/web/src/app/v2/training/training.css`,
  weil `packages/ui` waehrend G-16 gesperrt war.

  `[read]` **Die 169 vorhandenen Klassen decken alle Bausteine ab** —
  was fehlt, sind ausschliesslich Modul-Raster, die die Vorlage inline
  traegt. `[cmd]` `v2-train-grid-14` ist derselbe Zweispalter wie
  `v2-dash-grid`.

  **Beim Verschieben zusammenfassen**, nicht eins zu eins uebernehmen —
  sonst stehen am Ende elf Modul-Raster nebeneinander, die dasselbe tun.

  `[cmd]` **Erledigt 2026-08-17** — aus fuenf Rastern wurden drei.
  `v2-train-grid-14` und `.v2-dash-grid` teilen sich `.v2-grid-14`, `-15`
  geht mit `.v2-diary-grid`, `-21` bleibt eigenstaendig. **`-11` entfaellt
  ganz**, dafuer gibt es `.v2-g-cols-2` aus dem Entwurf.

  `[cmd]` Im Browser nachgemessen: 1,4:1 / 1,5:1 / 2:1. `training.css`
  geloescht, `rgba` bleibt bei 4.

  ### Der eigentliche Fund

  `[cmd]` **Fuenf Klassengruppen standen nur in der erzeugten Datei, nicht
  im Erzeuger.** Ein Lauf von `klassen-uebernehmen.mjs` reduzierte
  `v2.css` von 1.701 auf 1.537 Zeilen — **164 weg, darunter
  Dashboard-Raster, die Attrappenmarke (G-05), die Sprachwahl (A-14) und
  die Datumsnavigation (G-14).**

  **Gemessen, nicht vermutet.** Danach in den `zusatz`-Block geholt und
  erneut erzeugt: alles da.

  `[read]` Eine tickende Bombe: Der naechste Erzeugerlauf haette vier
  Arbeitsergebnisse spurlos entfernt — und niemand haette den
  Zusammenhang gesehen.

- [x] **G-22: Der Vertragstest schneidet den Block am ersten `}` ab**
  (neu 2026-08-17). Befund aus G-18.

  `[cmd]` `blockFor()` sucht `css.indexOf('}')` — **ein Kommentar mit
  geschweifter Klammer kappt alles danach.** Beim Bau von G-18
  verschwanden dadurch beide Schrift-Tokens aus der Pruefung, obwohl sie
  dastanden.

  **Umgangen, nicht behoben** — der Parser bleibt anfaellig.

  `[read]` Dieselbe Fehlerklasse wie die Encoding- und i18n-Pruefungen:
  **eine Pruefung, die still weniger prueft, als sie vorgibt.** Sie
  meldet gruen und hat den halben Block nie gesehen.

  `[cmd]` **Erledigt 2026-08-17.** Mit dem G-18-Kommentar im Block sah die
  alte Logik **30 von 32 Tokens** — beide Schrift-Tokens fielen dahinter.

  `[read]` **Heute uebersieht sie nichts, weil der Kommentar damals
  umformuliert wurde, um sie zum Laufen zu bringen: der Fehler war
  latent, nicht aktiv. Genau das ist die Gefahr.**

  **Zweifach behoben:** Kommentare werden vor der Suche entfernt, und
  Klammern werden gezaehlt statt die erste zu nehmen. Gegengeprobt mit
  einem `}`-Kommentar direkt vor den Schrift-Tokens.

- [x] **G-21: Recovery als Mockup** (neu und erledigt 2026-08-17).

  **Der Punkt wurde nachtraeglich angelegt** — der Auftrag lief, ohne
  dass er in der Liste stand.

  `[cmd]` **Erledigt 2026-08-17.** `/v2/recovery` steht: zehn Dateien,
  2.906 Zeilen, **36 Kacheln, alle mit Attrappenmarke.** Gate 8/8, 199
  Tests (vorher 194).

  ### System oder Fassungen? **Beides — ein drittes Muster**

  `[cmd]` **Ein abgeloester Rahmen.** Der Beleg steht in `app.jsx:122`:
  `case "recovery": return window.RecoveryModuleV2 ? <…V2 /> : <RecoveryModule />`

  `RecoveryModuleV2` liegt vor, **die Bedingung ist immer wahr** —
  `module-recovery.jsx` (545 Zeilen) und `-modals.jsx` (567 Zeilen) sind
  **toter Notnagel.** Uebernommen sind die drei geltenden: `-v2.jsx`
  (Rahmen), `-engine.jsx` (Daten und Formeln, kein JSX), `-modals2.jsx`.

  **Die Falle:** `[cmd]` Ein Grep nach `MuscleDetail`/`ProtocolDetail`
  trifft beide Rahmen. Der neue ruft `MuscleDetailModal2` auf — **die
  „2" ist die Fassung fuer den zweiten Rahmen.**

  `[cmd]` **Der neunte Tab steht in einer sechsten Datei:** „Stress" ist
  in keiner der fuenf definiert, sondern in
  `module-crossmodule-rest.jsx:22`. Ohne sie bliebe der Tab leer.

  ### Die Regel, die daraus folgt

  **Drei Module, drei Muster:** Nutrition = konkurrierende Fassung,
  Training = ein System, Recovery = abgeloester Rahmen.

  `[read]` **Die verlaessliche Pruefung ist immer `app.jsx`** — die
  einzige Stelle, an der die Vorlage selbst sagt, was gilt. **Das gehoert
  in jeden weiteren Modulauftrag.**

  ### Zwei Funde

  `[cmd]` **Ein echter Fehler behoben:** Die `<title>`-Schreibweise der
  Vorlage erzeugte **32 Konsolenfehler** (Hydrations-Abweichung). Als
  Template-Literal: 1 — der vorbestehende `data-mode`-Hinweis, der auf
  `/v2/dashboard` genauso auftritt.

  `[cmd]` **`arr_r` schon wieder:** `-v2.jsx:811` schreibt
  `<Icon name="arr_r"/>`, ein Tippfehler fuer `arrow_right`. **In der
  Vorlage zeichnet die Stelle nichts.** Hier steht der gemeinte Pfeil —
  dieselbe Entscheidung wie in G-20.

- [x] **GO-06 + GO-07: Zielvokabular, Ziele und Phasen** (erledigt
  2026-08-17).

  `[cmd]` Kettenschritt `111`, **50 Schritte dokumentiert.**
  `goals.user_goals` und `goals.goal_phases` — damit hat `goals` drei
  Tabellen.

  ### GO-06: die Entscheidung, die alles blockierte

  `[read]` Widerspruch W-3 aus dem Plan: **vier Zielvokabulare ohne
  Abbildung** — `nutrition_goal` mit 6 Werten, Phasenmodelle mit 9, eine
  dritte Stelle mit 12, eine vierte mit `lose`/`maintain`/`gain`.

  `[cmd]` Aufgeloest als **Datendatei**, nicht als Code:
  `daten/zielvokabular.json`. **Sie nennt ihre vier Quellen im Kopf** —
  `090_profile.sql`, `PHASE_MODELS.md`, `DATABASE.md` und das
  Vorgaengerrepo — und den Anlass: *„vier Zielvokabulare aufeinander
  abbilden, ohne offene Begriffe still zu fuellen."*

  `[read]` Dieselbe Haltung wie bei `health` in GO-02: **was keine
  Entsprechung hat, wird markiert, nicht geraten.**

  Dazu `daten/zielphasen-parameter.json` (GO-08 vorgezogen).

  ### GO-07: die Tabellen

  `[cmd]` **Live: 3 Ziele, 3 Phasen.** Zeilenschutz beidseitig belegt —
  Tom sieht seine, Sarah keine, Fremd-Insert scheitert.

  `[cmd]` **Das Gueltigkeitsdatum traegt, an drei Stichtagen belegt:**
  vor dem ersten `gueltig_ab` **keine Phase**, danach `maintenance`,
  dann `lean_bulk`. **Nicht die aelteste als Naeherung** — dieselbe
  Regel wie bei `nutrition_targets` in GO-03.

  `[cmd]` `pnpm gate` gruen, 8/8.

- [x] **G-29: Supplements als Mockup** (erledigt 2026-08-17).
  **Teilweise — sieben von zwoelf Tabs, gemeldet statt kaschiert.**

  ### Das vierte Muster

  `[cmd]` `app.jsx:123` sagt: **ein Rahmen, keine V2-Weiche.** Und
  selbst nachgeprueft statt daraus geschlossen: `-spec.jsx` exportiert
  **10 Namen**, `-injection.jsx` **3**, und der Rahmen ruft sie mit
  `window.X && <window.X />` auf — **arbeitsteilig, nicht
  konkurrierend.** Bei `interactions` gibt es sogar einen Rueckfall auf
  die eigene Fassung.

  `[read]` **Vier Module, vier Muster:** Nutrition = konkurrierende
  Fassung, Training = ein System, Recovery = abgeloester Rahmen,
  Supplements = arbeitsteilig mit Rueckfall.

  ### Was gebaut ist

  `[cmd]` **227 KB waren zu viel fuer einen Durchgang** — wie im
  Auftrag erlaubt. Gebaut: der Rahmen und seine **sieben eigenen Tabs
  vollstaendig** — Today (Ring, vier Slot-Karten, Next dose, Refills,
  Active cycles), Stack, Extended, Database, Compliance, Interactions,
  Cost.

  **Fuenf Tabs fehlen** — Catalog, Stacks, Intelligence, Inventory
  (alle `-spec.jsx`) und Injections. `[read]` **Sie stehen in der
  Tab-Leiste und sagen an ihrer Stelle, woher sie kaemen** — *weglassen
  haette die Leiste vollstaendig aussehen lassen, obwohl sie es nicht
  ist.*

  `[cmd]` Die Daten mechanisch extrahiert, 433 Zeilen, **alle Zahlen der
  Vorlage unveraendert.**

  ### Konsolenfehler: geprueft, nicht angenommen

  `[cmd]` **1 Fehler** — identisch mit `/v2/dashboard`. Die
  `<title>`-Schreibweise, die bei Recovery 32 erzeugte, **kommt in
  dieser Vorlage nicht vor** (`grep <title>` = 0).

  `[cmd]` 202 Tests (199 + 3 neue, alle gegengeprobt), drei Breiten ohne
  Ueberlauf.

- [x] **G-28: Goals als Mockup** (erledigt 2026-08-17).

  `[cmd]` `/v2/goals` steht: neun Dateien, 3.667 Zeilen, **39 Kacheln,
  alle markiert.** 208 Tests.

  ### Ein Rahmen, zwei Zulieferer — dreistufig

  `[cmd]` `app.jsx:125` sagt: keine Weiche. **Und die Pruefung ging
  weiter:** `window.GoalsModule` wird genau einmal gesetzt
  (`module-goals.jsx:903`), weder `-pro.jsx` noch `-editor.jsx`
  ueberschreiben es. Die Kette:

  - `module-goals.jsx` ruft **5×** `window.Goals*View` → `-pro.jsx`
  - `-pro.jsx` ruft **2×** `window.Phase*` → `-editor.jsx`

  `[cmd]` **Fuenf der zehn Tabs sind im Rahmen leer.** Wer nur die
  Hauptdatei nimmt, baut ein halbleeres Modul.

  `[read]` **`-pro.jsx` ist keine Profi-Fassung** — die Vermutung aus
  dem Auftrag war falsch. **Vier Module, drei Muster — und `app.jsx`
  bleibt die verlaessliche Pruefung, aber rekursiv.**

  `[cmd]` `PhotoUploadPanel` steckt wieder in
  `module-crossmodule-rest.jsx` — wie der Stress-Tab bei Recovery.
  **Nicht uebernommen:** es laedt Dateien hoch, und der Umsetzungsplan
  fuehrt Fotosessions unter „Was nicht gebaut wird".

  ### Zwei Entscheidungen

  `[cmd]` **`Math.random()` ersetzt.** `module-goals.jsx:101-121`
  wuerfelt die Verlaufsdaten — **Server und Browser bekommen
  verschiedene Zahlen.** Bei Recovery erzeugte dieselbe Fehlerklasse 32
  Konsolenmeldungen. Mit fester Pseudofolge: 1 Fehler, identisch mit
  `/v2/dashboard`. **Ein Test haelt fest, dass es nicht zurueckkommt.**

  `[cmd]` **Das feste „Heute" der Vorlage uebernommen** (2026-05-16) —
  ein echtes `Date.now()` waere dieselbe Hydrationsfalle.

  **Stehen geblieben ist, was die Vorlage falsch macht:** die
  wirkungslose Division in `calcGoalProgress` (W-8), das doppelte
  `requires`, und „8 IFBB Mandatory" ueber einer Liste mit zehn Posen.

  `[cmd]` 30 von 30 Tab×Breite-Kombinationen geprueft.

- [x] **G-33: Supplements gegen die Vorlage nachgezogen** (erledigt
  2026-08-17).

  **Toms Befund war messbar richtig.** `[cmd]` Ein Skript liest je Tab
  **rekursiv den Aufrufbaum ueber alle vier Vorlagendateien**:

  | Tab | Vorlage | vorher | jetzt |
  |---|---|---|---|
  | `extended` | 8 | **0** | 8 |
  | `compliance` | 3 | **0** | 3 |
  | `today` / `stack` | 2 / 2 | 2 / 2 | unveraendert |

  `[cmd]` **15 von 15, fehlend 0.** Die Umsetzung wuchs von 708 auf
  1.865 Zeilen — 11 Unterkomponenten, ~530 Zeilen Vorlage.

  ### Die Falle, benannt

  `[read]` *„Der Tab-Rumpf ist nicht das Modul. `SuppExtended` hat in der
  Vorlage 46 Zeilen, meine Fassung hatte 97 — **nach Zeilenzahl also
  mehr, tatsaechlich fehlten 365 Zeilen Inhalt.**"*

  **Drei Regeln daraus**, in `theme-v1-umsetzung.md` festgehalten:
  Aufrufbaum statt Zeilenzahl · ueber **alle** Vorlagendateien
  (`CalendarView` steht in der Modaldatei, **das erste Skript hielt sie
  fuer undefiniert**) · eigene Zustaende sind eigene Bildschirme
  (**`ExtendedGate` ist eine Aufklaerungsseite — ohne sie zeigt der Tab
  sofort Hormonprotokolle**).

  ### Der Tab „Database" — Entscheidung

  `[cmd]` **So gelassen, wie die Vorlage es haelt:** nicht in der Leiste,
  aber ueber den Kopfknopf erreichbar.

  `[read]` **Anders als `PeriodizationFullView` bei Training** — dort
  zeigte ein Aufruf ins Leere und wurde entfernt. *„Hier ist die
  Komponente vollstaendig und erreichbar — eine zweite Zugangsebene, kein
  Versehen. Die Wirkstoffdatenbank ist Nachschlagewerk, kein
  Tagesbereich."*

  `[cmd]` Zwei neue Pruefungen, beide gegengeprobt: Marken je Datei
  (12/6/4) und alle 15 Unterkomponenten vorhanden. Gate 8/8, 209 Tests.

- [x] **GO-10: Koerpermessungen und Gewichtsverlauf** (erledigt
  2026-08-17).

  `[cmd]` Kettenschritt `112`, **53 Schritte** in der Kette.
  `goals.body_measurements` und `goals.body_circumferences` — damit hat
  `goals` fuenf Tabellen.

  `[cmd]` **Live: 43 Messungen, 7 Umfaenge** — ein Verlauf ueber den
  ganzen Testzeitraum. Zeilenschutz beidseitig belegt: Tom sieht 43
  eigene, 0 fremde; eigener Insert klappt, fremder scheitert.

  `[cmd]` **Profilgewicht-Sync gebaut** — die Frage aus dem Auftrag, wie
  `public.profiles.body_weight_kg` und der Verlauf zueinander stehen, ist
  damit beantwortet und nicht offengelassen.

  **Fotosessions und Fotos ausdruecklich nicht gebaut**, wie
  beauftragt — `[read]` der Umsetzungsplan fuehrt sie unter „Was nicht
  gebaut wird", und der Goals-Mockup hat `PhotoUploadPanel` aus
  demselben Grund ausgelassen: **es laedt Dateien hoch.**

  **Keine Koerperfettformel** — `[read]` Jackson-Pollock, Durnin und
  Navy liegen im Vorgaengerrepo (51 Fundstellen), **welche gilt, ist eine
  Entscheidung fuer Tom.**

- [x] **G-36: Medical als Mockup** (erledigt 2026-08-17).

  `[cmd]` `/v2/medical` steht: zehn Dateien, 3.209 Zeilen, **21 Kacheln,
  alle markiert.** Gate 8/8, 214 Tests, 1 Konsolenfehler (Normalwert).

  ### Das fuenfte Muster — und der Grund, warum es auffiel

  `[cmd]` `app.jsx:124` waehlt `MedicalModuleV2`, gesetzt ueber
  `Object.assign(window, …)` in `-v2.jsx:818`. **Der alte Rahmen (809
  Zeilen) ist toter Notnagel** — wie bei Recovery.

  **Die zweite Ebene faellt anders aus als bei Goals.** `[cmd]` Ein
  `window.`-Grep in `-v2.jsx` findet **nichts**. Nach dem Goals-Muster
  hiesse das „steht allein" — **das ist falsch:** Der Rahmen ruft acht
  Modale und zwanzig Datennamen als **blosse Globale** auf
  (`<BiomarkerDetailModal/>`), weil alle vier Dateien in denselben
  Skript-Gueltigkeitsbereich geladen werden.

  `[read]` **Wer nur nach `window.` greppt, baut acht Modale und den
  halben Datenbestand nicht.** — **Sieben Module, fuenf Muster.**

  `[cmd]` **`-data.jsx` ist tatsaechlich neu** — die erste reine
  Datendatei einer Vorlage: 48 Biomarker mit LOINC, Doppelbereich,
  Verlauf. Extrahiert, nicht abgetippt.

  ### Die Zaehlung: 56 von 56

  `[cmd]` Das Skript zaehlt **Kacheltitel, nicht nur
  Komponentennamen** — und das war noetig: **drei von fuenf Tabs melden
  „0 Unterkomponenten"**, weil Medical seine Kacheln inline setzt.

  `[read]` *„Ein reines Namenszaehlen haette gruen gemeldet, waehrend
  vier von fuenf Kacheln fehlen — genau der Supplements-Fehler."* Beim
  ersten Lauf nannte es die 16 zu bauenden Titel.

  `[read]` **Die verbleibende Luecke, selbst benannt:** *„es prueft
  Namen und Titel, nicht Inhalt."*

  ### Geprueft, nicht angenommen

  `[cmd]` **Keine Hydrationsfalle** — weder `Math.random()` noch
  `Date.now()` in den vier Dateien, anders als bei Goals.

  `[cmd]` Der Doppelbereich funktioniert nachweisbar: Glucose 102 ueber
  Laborgrenze 99 → „High"; HbA1c 5,4 % im Labor-, aber ueber dem
  Optimalband → „Normal".

- [x] **G-12: Die Suche in die Erfassung einbinden** (neu 2026-08-16).

  `[cmd]` Heute liegt die Lebensmittelsuche unter `Food DB` als eigene
  Seite; die Erfassung im Tagebuch ist davon getrennt. In der Vorlage
  führt jede Mahlzeitenkarte einen `+`-Knopf und Zeilen wie
  `MealCam · Search · Same as yesterday`.

  **Was das braucht:** Suche als Auswahlfeld in der Mahlzeitenkarte,
  Portionsauswahl beim Hinzufügen (`[cmd]` `foods_portions` mit 23.402
  Zeilen steht bereit), und `Same as yesterday` — das aus dem Vortag
  kopiert.

  `[cmd]` **Der Schreibpfad steht** (C-03), die Portionsspalten auch
  (C-51). Es fehlt die Verbindung.

  `[cmd]` **Erledigt 2026-08-17**, Commits `45d82fd` und der
  Mahlzeitenkarten-Umbau. **Nachtraeglich abgehakt** — der Punkt blieb
  beim Schliessen liegen.

  `[cmd]` Suchen, Portion waehlen, Menge angeben — **alles in der Karte,
  ohne Seitenwechsel.** Belegt: „Banane roh" und „Vollkornbrot" mit
  gefuelltem `portion_name`/`portion_quantity`/`portion_amount_g`,
  „Haferflocken" ueber direkte Gramm **mit leeren Portionsfeldern.**

  `[cmd]` `search_events` bekam `selected_bls_code` und `selected_rank`
  (`B101000/1`, `T410072/7`). Ringe sprangen von `—` auf 550/2.500 kcal
  ohne Neuladen. **`Same as yesterday` uebernahm 4 Positionen vom Vortag
  mit neu eingefrorenen Naehrwerten.**

- [x] **G-05: Dashboard** (neu 2026-08-15). Setzt G-03 voraus.

  Trägt aus allen Modulen zusammen und ist erst sinnvoll, wenn eines
  davon echte Daten liefert. Vorlage: `module-dashboard.jsx`.

  `[cmd]` Aus dem Entwurf ablesbar: Readiness-Ring, vier Kennzahlkarten,
  Tagesverlauf, Makrobalken, Aktivitätsprotokoll. **Die Kennzahlen
  ausserhalb von Nutrition sind bis dahin Attrappen** — im Bericht
  benennen, welche.

  `[cmd]` **Erledigt 2026-08-17** — zuerst mit `ed3a4aa` (nur Kacheln
  mit Datenquelle), dann mit G-09 auf **zwoelf Kacheln, neun
  gekennzeichnet** umgestellt. **Nachtraeglich abgehakt.**

  `[read]` Der Weg dorthin ist die Lehre: Die erste Fassung liess neun
  Kacheln weg mit der Begruendung *„eine MOCK-Marke nimmt einer Zahl
  nicht ihre Wirkung"*. **Tom hat das verworfen** — der Mockup-Hinweis
  ist der Fortschrittsbalken, und was in einer Attrappe steht, ist
  gleichgueltig.

  `[cmd]` `v2-attrappen.test.ts` haelt seither fest, dass **keine Kachel
  still verschwindet.**

- [x] **GO-14: Welche Koerperfettformel gilt** (neu 2026-08-17).
  **Entscheidung fuer Tom**, Befund aus GO-10.

  `[cmd]` Das Vorgaengerrepo hat **51 Fundstellen zu Koerperfett** —
  Jackson-Pollock, Durnin, Navy, FFMI — verteilt auf
  `BodyCompositionView.tsx` (13 KB), `goal-measurements.ts` (18 KB) und
  `useBodyComposition.ts`.

  **Die Messwerte liegen jetzt** (`goals.body_circumferences`, 7 Zeilen),
  **die Formel fehlt.**

  `[read]` **Das ist keine Umsetzungsfrage.** Die Verfahren
  unterscheiden sich in Messstellen und Genauigkeit: Navy braucht
  Umfaenge, Jackson-Pollock Hautfalten, Durnin vier Messpunkte. **Was
  gemessen werden kann, entscheidet, welche Formel ueberhaupt in Frage
  kommt.**

  **Vorzulegen:** welche Verfahren mit den erhobenen Umfaengen rechenbar
  sind, was jedes braucht, und wie genau es ist.

  `[cmd]` **Erledigt 2026-08-17**, Commit `1dd6ff2`.
  `goals.body_composition_navy(uuid, date)` — KFA, Spanne, FFMI,
  Herkunft und Vorbehalt in einer Funktion.

  `[cmd]` **Live fuer `tom.seed`, 2026-09-13:** KFA **10,31 %**, Spanne
  **6,81–13,81**, FFMI 21,97, Lean Mass 76,24 kg, `source =
  derived_navy`, `input_source = manual`.

  **Der Vorbehalt steht am Wert**, nicht in der Dokumentation:
  *„Umfangsverfahren: Standardfehler ca. ±3,5 Prozentpunkte."*

  `[cmd]` **Ohne Umfaenge kein Wert:** Sarah liefert **0 Zeilen**, keinen
  Schaetzwert. `[read]` Wie `missing_body_weight` beim Wasserziel.

  `[cmd]` **Der Verlauf traegt:** 11,82 % am 02.08. auf 10,31 % am
  13.09., **1,51 Prozentpunkte** — eine erkennbare Tendenz, der Seed ist
  nicht zu flach.

  ### Die Herkunft ist mitgebaut

  **Tom, 2026-08-17:** *„Als Ausbaustufe bedenken: wir werden Anbindungen
  fuer alle Gadgets anbieten."*

  `[cmd]` `body_measurements` und `body_circumferences` tragen jetzt
  Herkunftsspalten, die Testdaten sind als `manual` markiert, **und der
  berechnete Wert weist sich als `derived_navy` aus.**

  `[read]` **Der Grund:** Eine BIA-Waage und die Navy-Formel liefern fuer
  denselben Menschen **8 bis 10 Prozentpunkte Unterschied** — ein
  Verlauf aus gemischten Quellen zeigt Spruenge, die niemand erlebt hat.
  **Nachtraeglich waere die Spalte billig, die tausend Zeilen ohne
  Herkunft nicht.**

- [x] **G-38: Vollstaendigkeit aller Mockups nachmessen** (neu
  2026-08-17). **In Arbeit.** **Nachtraeglich angelegt** — der Auftrag
  lief, ohne dass er in der Liste stand.

  `[cmd]` Dashboard, Nutrition, Training, Recovery und Goals wurden
  abgenommen, **bevor die Zaehlung Pflicht wurde.** Nur Supplements ist
  geprueft — und dort fehlten in zwei Tabs **15 von 15
  Unterkomponenten.**

  **Eine Grobmessung liegt vor**, sie reicht nicht: `[cmd]` goals 33/33,
  training 28/29, dashboard 2/3, **recovery 12/15**, **nutrition 5/16**,
  supplements 23/54 (davon fuenf Tabs bewusst offen, G-31).

  `[annahme]` Bei Nutrition **koennten** es Umbenennungen sein — die
  Umsetzung benennt deutsch. **Das Skript kann das nicht
  unterscheiden.** Bei Recovery fehlen `BodyMap18`, `SILHOUETTE_PATH`,
  `MuscleDetailModal2` — **die Muskelkarte**, und die wird ohnehin durch
  G-26 ersetzt.

  `[cmd]` **Erledigt 2026-08-17.** `tools/vollstaendigkeit.mjs` misst
  alle Module; Bericht in `docs/ssot/101-vollstaendigkeit.md`.

  | Modul | Stand |
  |---|---|
  | Dashboard | 3/3 |
  | **Nutrition** | **38/38** (vorher 11/38) |
  | Training | 45/45 |
  | Recovery | 67/71 — **alle vier sind die Muskelkarte** |
  | Goals | 65/65 |
  | Supplements | 42/67 — fuenf Tabs offen (G-31) |

  ### Drei Werkzeugfehler vor den Zahlen

  `[read]` *„Jeder haette eine Messung geliefert, die sicher aussieht und
  falsch ist."*

  `[cmd]` **Kommentare als Umsetzung gezaehlt** — `MealCard` und
  `NutritionDiary` galten als gebaut, standen aber nur in einem
  Herkunftskommentar. **Gegen den abgeloesten Recovery-Rahmen
  gemessen** — 22 Phantomluecken. **Tote Vorlagendateien mitgezaehlt** —
  vier Modale und zwei Konstanten, die `-v2.jsx` nullmal nennt.

  `[read]` **Beide Grobzahlen des Orchestrators trafen zu, aus
  verschiedenen Gruenden:** Nutrition war eine **reale Luecke**, Recovery
  ein **Messfehler.**

  ### Nachgezogen

  `[cmd]` Vier Tabs (Preferences, Meal plans, Insights, Planner) und vier
  Modale, Datenkonstanten mechanisch uebernommen. **18 Kacheln mit
  Marke, kein Fenster schreibt.**

  **`NutritionFoods` bewusst nicht gebaut:** `[read]` *„Die Vorlage hat
  dort zwoelf feste Zeilen, die Umsetzung eine echte BLS-Suche (G-03).
  Nachbauen hiesse, funktionierenden Code durch eine Attrappe zu
  ersetzen."*

  ### Der Fehler, den kein Test fand

  `[cmd]` `Math.random()` war ersetzt, der Test darauf gruen — **der
  Browser meldete trotzdem** `0.6199775584337404` gegen
  `0.6199775584345043`.

  `[read]` **`Math.sin` ist in ECMAScript nicht bitgenau festgelegt.
  „Fest" heisst nicht „bei jedem Aufruf gleich", sondern „in jeder
  Engine gleich."** Der neue Test prueft das — **aber nur bei Werten, die
  in ein `style` fallen**; ein erster Entwurf meldete auch
  Diagrammdaten und haette Laerm statt Sicherheit erzeugt.

  `[cmd]` Alle vier neuen Tests zum Fehlschlagen gebracht.

- [x] **G-40: Coach als Mockup — zwei Unterbereiche** (neu 2026-08-17).
  **Nachtraeglich angelegt.**

  **Tom, 2026-08-17:** *„Coach Hauptnavigationspunkt mit 2 Subnav: Human
  Coaches und AI Coach. Zwei Subnav, weil die optional verfuegbar sein
  werden."*

  | | |
  |---|---|
  | `Coach` → `Human Coaches` | `COACH-HUMAN`, elf Tabs |
  | `Coach` → `AI Coach` | `COACH-AI`, zwoelf Tabs |

  **Die Sub-Navigation ist hier richtig.** `[read]` Bei Nutrition war
  sie falsch — dort standen zwei Seiten, wo die Vorlage Tabs fuehrt.
  **Hier sind es zwei eigenstaendige Bereiche unter einem Menuepunkt**,
  die spaeter einzeln buchbar sein werden.

  `[read]` **Tom zum AI Coach:** *„Der AI Coach ist ein Teil von
  Buddy-Logik. Der effektive Endausbau, welcher DER BUDDY als App sein
  wird, wird viel umfangreicher sein."* — **Das Modul, nicht der
  Endausbau.**

  `[cmd]` **306 KB, das groesste bisher:** Human Coaches 197 KB in sechs
  Dateien (`-gaps.jsx` mit 34 KB ist ein Name, den es sonst nirgends
  gibt), AI Coach 109 KB in vier.

  `[cmd]` **Coach Portal gehoert nicht dazu** — es steht unter
  `WORKSPACES` als externer Link, seit G-02 so entschieden.

  **Danebenliegend:** `[cmd]` zwei vollstaendige Specsaetze
  (`HumanCoach` mit **`SPEC_11_UI_DESIGN.md`, das es bei keinem anderen
  Modul gibt**, und `BuddyandAICoach`), **84 Fundstellen im
  Vorgaengerrepo**, vier Migrationen.

  `[cmd]` **Human Coaches erledigt 2026-08-18: 60 von 60 Posten, alle
  zehn Tabs**, mit `tools/vollstaendigkeit.mjs` belegt. Gate 8/8, 44
  Tests (neun neue), **null Konsolenfehler und null
  Hydrationsabweichungen** ueber alle zehn Tabs.

  **AI Coach offen: 41 Posten.** `[read]` Die Seite existiert und
  **nennt alle zwanzig fehlenden Tabs auf dem Bildschirm, statt 404 zu
  liefern** — nach dem Muster aus G-29. 306 KB Vorlage ueber beide
  Unterbereiche waren fuer eine Lieferung zu viel.

  ### Meine Tab-Zahlen waren beide falsch

  `[cmd]` Der Auftrag nannte elf und zwoelf. **Gemessen sind es zehn**
  (`module-coach.jsx:183-194`) **und zwanzig**
  (`module-buddy.jsx:26-45`). Beide jetzt durch Tests festgehalten.

  ### `-gaps.jsx` heisst „Lueckenschliesser", nicht „Betreuungsluecken"

  `[cmd]` Die Datei sagt es im eigenen Kopf. Sie haelt **elf
  Komponenten, die Loecher in der Hauptdatei stopfen** — und **zehn der
  elf gehoeren zum Coach-Portal, nicht zum Athletenbereich.**

  `[cmd]` **Das Portal ist nur ueber `const side = "athlete"` in
  `module-coach.jsx:137` erreichbar — fest verdrahtet.** Damit liegt
  **der gesamte Trainer-Arbeitsplatz in der Datei und ist
  unerreichbar.** Als `bekanntOffen` mit Gruenden vermerkt.

- [x] **G-26: `MuscleBodyMap` nach `packages/ui`** (neu 2026-08-17).
  **Tom, 2026-08-17:** *„Die Muskelkomponente nehmen wir sicher mit rein
  und verwenden sie, wo gebraucht. Das HTML zeigt schon, was moeglich
  ist — das ist sehr vielseitig."*

  `[cmd]` `apps/web/public/mockup/components/MuscleBodyMap.js` — 593
  Zeilen, dazu `body_front.svg` mit 24 KB. **Eine Komponente, fuenf
  Aufrufarten, ein Klick-Handler:**

  | | |
  |---|---|
  | `renderFatigue` | Muskel-Ermuedung → **Recovery** |
  | `renderActivation` | Muskel-Aktivierung → **Training** |
  | `renderInjection` | Injektionspunkte mit Rotation → **Supplements** |
  | `renderPoints` | beliebige Punkte |
  | `renderCombined` | Muskeln plus Overlay |

  `MuscleBodyMap_test.html` zeigt alle fuenf Modi nebeneinander.

  **Der Anlass:** `[read]` Tom ueber die Recovery-Attrappen: *„da tauchen
  zum ersten Mal Muscle Readiness etc. als Grafiken auf, die sind
  oberhaesslich."*

  ### Was vor der Uebernahme zu klaeren ist

  `[cmd]` **Das Mockup benutzt ein anderes Designsystem als `theme-v1`:**
  `DM Sans` statt Inter, feste Farben wie `#f1f3f4` und `#374151`, eine
  eigene `tokens.css` mit 16 KB.

  `[annahme]` Die Muskelkarte selbst duerfte davon unberuehrt sein — SVG
  plus Farbskala. **Pruefen, bevor sie nach `packages/ui` geht**, und
  die Farbskala auf die vorhandenen Tokens legen.

  `[cmd]` **Wo sie hingehoert:** Recovery (in Arbeit), Training (`/v2`
  steht), Supplements (noch nicht gebaut). **Eine Komponente fuer drei
  Module** — deshalb `packages/ui`, nicht je Modul.

  `[cmd]` **Erledigt 2026-08-18.** `packages/ui/src/koerperkarte.tsx`
  plus **262 Zeilen Pfaddaten**, mechanisch uebernommen. **21
  Muskelgruppen statt 18 Flaechen**, zwei Ansichten, drei Aufrufarten:
  `ErmuedungsKarte`, `AktivierungsKarte`, `InjektionsKarte`.

  Recovery nutzt sie an **allen drei Stellen** — Today, Check-in,
  Muscle map.

  ### Eine Korrektur an G-38 vorweg

  `[read]` **Die Annahme, die Muskelkarte fehle, war falsch.** Die
  G-38-Zaehlung sagte Recovery 67/71 — *„all four missing are the muscle
  map"*. **Alle vier waren gebaut, nur anders benannt:** `BodyMap18` →
  `Koerperkarte`, `MuscleDetailModal2` → `MuscleDetailModal`,
  `SILHOUETTE_PATH` lag in `motor.ts`.

  `[read]` *„Meine Umbenennungstabelle war unvollstaendig, und das
  Skript meldet eine fehlende Zuordnung als fehlendes Bauteil — genau
  der Fehler, den mein eigener Bericht bei Nutrition beschreibt."*
  Recovery steht jetzt bei **71/71**.

  **Der Auftrag bleibt richtig, nur seine Begruendung aendert sich:** Es
  ging nie um eine Luecke, **sondern um haesslich gegen gut.**

  ### Die Farbskala

  `[cmd]` **19 Hex-Werte auf Tokens gelegt, keiner neu erfunden.** Die
  Zuordnung folgt der Bedeutung, die der Mockup selbst vergibt — seine
  Legende sagt *„Ready/Caution/Rest"*, also `--pos`/`--warn`/`--neg`.

  `[cmd]` **Eng wurde es bei der Aktivierung:** vier Stufen, das Theme
  hat auf der Achse drei. Geloest per
  `color-mix(in oklch, var(--neg) 70%, black)` — **dieselbe Farbe,
  dunkler, kein neuer Wert.** `[read]` Ob die vierte Stufe einen eigenen
  Token bekommt, ist Toms Entscheidung.

  `[cmd]` **Zwei Festwerte bleiben:** Haut `#c8c0b8` und Haare
  `#6b5b4e` — *„sie tragen keine Bedeutung und sind kein Flaechenton;
  ein Token dafuer waere ein neuer Token."*

  `[cmd]` `rgba` bleibt bei 4. `v2.css` **ueber den Erzeuger gewachsen:
  44 Zeilen dazu, keine geloescht.**

  ### Der Beinahe-Fehler

  `[cmd]` `upper_back` und `lower_back` waren als *„keine
  Entsprechung"* eingestuft — **die Karte hat beide, mit Bindestrich
  geschrieben, den die Suche nicht traf.** Zwei Gruppen waeren dauerhaft
  grau geblieben, **ohne Fehlermeldung.**

  `[read]` *„Aufgefallen erst beim Zaehlen der gerenderten Gruppen im
  Browser, nicht beim Lesen."* — **Ein Test haelt die Lueckenliste jetzt
  gegen eine feste Erwartung.**

  `[cmd]` Gate 8/8, **237+7 Tests** (10 neue, jeder zum Fehlschlagen
  gebracht), drei Breiten, **Hell und Dunkel geprueft — der Dunkelmodus
  faerbt mit, ohne Nacharbeit.**

  ### Training und Supplements

  `[cmd]` **Training kann folgen, aber nicht halb:** `AktivierungsKarte`
  ist fertig, **es fehlt die Zuordnung von `training.exercise_muscles`
  (6.624 Zeilen) auf die Karten-IDs.**

  `[cmd]` **Supplements nicht:** `InjektionsKarte` ist gebaut und
  exportiert, **wird aber nirgends aufgerufen** — der Injections-Tab ist
  G-45.

- [x] **G-44: Die Muskelkarte deckt nicht alle Gruppen ab** (neu
  2026-08-18). **Tom, 2026-08-18:** *„Es fehlen diverse Aktivierungen von
  Parts, dass man den ganzen Body erkennt. Recheck, ob alle Muskeln in
  der Grafik auch in der Liste auftauchen."*

  `[cmd]` **Gemessen: Die Karte hat 41 IDs, die Zuordnung deckt 18 ab.**

  **Echte Muskeln ohne Zuordnung — sie bleiben grau:**

  | | |
  |---|---|
  | `tibialis` | Schienbeinmuskel |
  | `lat_l` / `lat_r` | Latissimus — **es gibt keine Sammelgruppe `lats`** |
  | `vg_l` / `vg_r` | `[Vermutung]` Vastus oder Wade |

  `[cmd]` **Und `both` in der Zuordnung zeigt auf nichts** — eine ID,
  die die Karte nicht kennt.

  Die uebrigen ohne Zuordnung sind **Teilstuecke** (`bicep_l`/`bicep_r`
  unter `biceps`, `pec_*`, `delt_*`, `quad_*`, `glute_*`,
  `tricep_*`) oder **keine Muskeln**: `head`, `hair`, `hands`, `feet`,
  `knees`, `ankles`, `label`, `side`.

  `[read]` **Der Beinahe-Fehler aus G-26 zeigt das Muster:**
  `upper-back` und `lower-back` waren als *„keine Entsprechung"*
  eingestuft — **die Karte hat beide, mit Bindestrich geschrieben, den
  die Suche nicht traf.** Zwei Gruppen waeren dauerhaft grau geblieben,
  **ohne Fehlermeldung.**

  **Was zu tun ist:** Jede Karten-ID einer Gruppe zuordnen oder
  ausdruecklich als Nicht-Muskel markieren — **und ein Test, der eine
  unzugeordnete ID zum Fehler macht.** `[cmd]` Der bestehende Test haelt
  eine Lueckenliste gegen eine feste Erwartung; er muss die Liste
  **vollstaendig** fuehren.

  `[cmd]` **Eine echte Luecke bleibt laut G-26:** `abductors` — die
  Karte kennt nur die Innenseite. **Nicht auf `gluteal` gelegt, das ist
  ein anderer Muskel.** Richtig so.

  `[cmd]` **Erledigt 2026-08-18.** **39 IDs, nicht 41** — zur Laufzeit
  gezaehlt, nicht per Grep. `[read]` *„Genau daran ist beim letzten Mal
  `upper-back` durchgefallen."*

  **Meine beiden Mehr loesen sich auf:** `label` und `side` sind
  **Eigenschaften der Injektionsort-Objekte, keine IDs.** Und `both` ist
  der Wert von `side` bei beidseitigen Muskeln — **es stand nie in der
  Zuordnung, nur in einem Kommentar.**

  | Art | Anzahl |
  |---|---|
  | Muskelgruppe | 17 |
  | Injektionsort (Teilstueck) | 16 |
  | Nicht-Muskel | 6 |

  ### Zwei meiner Vermutungen geklaert

  `[cmd]` **`vg_*` ist „Ventrogluteal"** — eine Injektionsstelle im
  Gesaessbereich, **kein Vastus und keine Wade.** Die Vorlage
  beschriftet sie selbst so.

  `[cmd]` **`lat_*` braucht keine Sammelgruppe** — der Latissimus steckt
  in `upper-back`, das mit sechs Pfaden den ganzen oberen Ruecken
  zeichnet.

  `[cmd]` **`tibialis` ist die einzige echte Luecke:** die Karte
  zeichnet ihn, `MUSCLE_GROUPS_BODYMAP` fuehrt ihn nicht. `[read]` *„Ein
  Kuerzel zu ergaenzen hiesse, eine Muskelgruppe zu erfinden, die das
  Modul nicht misst."* **Nicht entschieden.** `abductors` bleibt wie in
  G-26.

  ### Der Test geht jetzt von der Karte aus

  `[cmd]` `karten-ids.test.ts` **startet bei den IDs der Karte statt bei
  einer Lueckenliste.** Drei Pruefungen, alle gegengeprobt: neue ID
  `soleus` faellt · erfundener Eintrag `lats` faellt · `chest` →
  `pec_l` faellt. Dazu `zaehlen.test.ts` mit der festen Aufteilung
  17/16/6.

  `[cmd]` **Im Browser gezaehlt:** 23 Muskel-IDs — 16 eingefaerbt, 5
  grau, 2 fester Ton. Bei allen drei Breiten gleich. **252 Tests gruen.**

  `[read]` **Und ein Messfehler beim Messen:** *„Ich zaehlte zuerst 24
  und fand `soleus` — die ID aus meiner eigenen Gegenprobe. Die Datei
  war zurueckgesetzt, der Dev-Server lieferte noch den alten Build."*
  **Derselbe Fehler wie in G-05.**

- [x] **G-42: AI Coach — zwanzig Tabs offen** (neu 2026-08-18). Rest aus
  G-40.

  `[cmd]` `/v2/coach/ai` existiert und **nennt alle zwanzig fehlenden
  Tabs auf dem Bildschirm** — 41 Posten aus `module-buddy.jsx` und drei
  Begleitdateien (109 KB).

  `[read]` **Tom, 2026-08-17:** *„Der AI Coach ist ein Teil von
  Buddy-Logik. Der effektive Endausbau, welcher DER BUDDY als App sein
  wird, wird viel umfangreicher sein."* — **Das Modul, nicht der
  Endausbau.**

  `[cmd]` **Erledigt 2026-08-18: 42 von 42 Posten, 20 Tabs**, null
  Konsolenfehler und **null Hydrationsabweichungen** ueber alle zwanzig.
  **Beide Unterbereiche des Coach-Menuepunkts sind fertig.**

  ### Die Frage des Auftrags hatte eine andere Antwort

  `[cmd]` **Die elf Zulieferer fehlten nicht — alle fuenfzehn
  existieren.** Neun in `-engines.jsx`, drei in `-knowledge.jsx`, einer
  in `-voice.jsx`.

  **Die Falle lag woanders:** `[cmd]` `Object.assign(window, {…})` in
  `-engines.jsx:847` listet **nur Daten, keine Komponenten** — die neun
  Ansichten werden einzeln ueber `window.BuddyBSS = …` gesetzt.
  `[read]` *„Wer diese Zeile als Inhaltsverzeichnis liest, verpasst neun
  von zwoelf Zulieferern."*

  `[cmd]` **Und einer liegt wirklich woanders:** `BuddyCoachOverrides`
  steht in `module-coach-meta.jsx:161` — **einer Human-Coaches-Datei** —
  und wird aus `module-buddy.jsx:132` gerufen.

  ### `uploads/` gegen `docs/specs/`: kein Unterschied

  `[cmd]` **Alle sieben Buddy-Specs sind byte-identisch.** Der Hash im
  Dateinamen **unterscheidet Module, nicht Fassungen** —
  `SPEC_09_SCORING-8a1632fa` ist Buddy, `-d4545dde` Training, die Datei
  ohne Hash Nutrition. **A-18 ist damit entschaerft.**

  ### Zwei Tabs sind Neubau, keine Uebersetzung

  `[cmd]` Das Vorgaengerrepo hat **sechs Buddy-Migrationen (650 Zeilen,
  13 Tabellen)** und `buddy.ts` mit **1.647 Zeilen**;
  `behavioral_signatures` **deckt den Signature-Tab bis zu den
  Musternamen und `confidence`/`sample_size`.**

  `[cmd]` **Aber BSS gibt es dort nicht** (`stability_score`,
  `behavior_stability` — nichts) **und Voice auch nicht** (kein
  `whisper`, kein `speechSynthesis`, kein `parseGymCommand`; nur die
  Stufen-Flags). Dazu: **drei Stufen dort gegen vier in der Vorlage.**

  ### Keine Hydrationsfalle — und eine echte Kollision

  `[cmd]` Ueber alle **1.746 Vorlagenzeilen** gemessen: kein
  `Math.random()`, `Date.now()`, `Math.sin`, keine Zeitgeber. **Ein Test
  haelt das fest.**

  `[cmd]` **Eine noetige Abweichung:** Die Verlaufsfarben des Orbs
  trugen feste SVG-IDs je Zustand — der Tab „Avatar states“ zeigt alle
  fuenf gleichzeitig, Chat rendert `responding` erneut. **Dieselbe
  Kollision wie bei der Koerperkarte in G-21**, gleich geloest mit
  `useId()`.

  ### Zwei eigene Testaussagen korrigiert

  `[read]` *„Die BSS-Formel benutzt ×, nicht `*`. Und der G-40-Test, der
  prueft, dass die AI-Seite ihre ungebauten Tabs nennt, wurde falsch,
  sobald das Modul existierte."* — **ersetzt durch eine Pruefung, dass
  der Platzhalter weg ist.**

- [x] **GO-11: Meilensteine und Fortschritt je Ziel** (neu 2026-08-17).
  Folgt auf GO-07 und GO-10.

  `[read]` Aus dem Umsetzungsplan: `goals.goal_milestones` und
  Fortschritt je Ziel — setzt Ziele (GO-07, steht) und Messungen
  (GO-10, steht) voraus. **Beide sind jetzt da.**

  `[cmd]` Das Vorgaengerrepo hat `user_milestones` in
  `043_coach_profile_system.sql`.

  `[cmd]` **Vorsicht bei der Fortschrittsrechnung:** Der Goals-Mockup
  hat gemeldet, dass `calcGoalProgress` in der Vorlage **eine
  wirkungslose Division** enthaelt (W-8) — **stehen gelassen, weil es
  Toms Entwurf ist.** Beim Bau der echten Rechnung ist das die Stelle,
  an der entschieden werden muss.

  `[cmd]` **Erledigt 2026-08-18**, Kettenschritt `113`, **60 Schritte**
  in der Kette. `goals.goal_milestones`, `adaptive_tdee()`,
  `goal_progress_at()`, `goal_milestone_status()`.

  ### Der adaptive Wert rechnet

  `[cmd]` **Tom, 2026-09-13:** Formel 3.527,0 — adaptiv **3.143,2** —
  Abstand **−383,8 kcal**. Fenster: 14 Intake-Tage, 14
  Gewichtsmessungen, `complete`, `confidence high`.

  `[cmd]` **Die Rechnung ist nachvollziehbar:** 2.372 kcal Zufuhr,
  **+0,21 kg ueber 13 Tage** → Rohwert **2.247,6 kcal**
  (`kcal_per_kg 7700`).

  `[cmd]` **Zwei Verweigerungsfaelle belegt:** `max.seed` liefert nichts
  (keine Gewichtsmessungen), `test-user` nichts (zu wenig Intake).
  `[read]` **Kein Schaetzwert, keine Null** — wie
  `missing_body_weight` beim Wasserziel.

  `[cmd]` Meilensteine: **erreicht, offen, verfehlt und nicht messbar
  werden getrennt.** RLS: Tom sieht 3, Sarah 0.

- [x] **G-46: Medical an den Katalog anschliessen** (neu 2026-08-18).
  Folgt auf C-69.

  `[cmd]` `/v2/medical` steht seit G-36 mit **21 Kacheln, alle
  Attrappe** — und seit `140` gibt es das Schema.

  **Die naheliegenden Kacheln:** die Biomarker-Liste (Katalog), der
  Befund mit seinen Werten, und der **Doppelbereich** — `[cmd]` der
  Medical-Agent hat ihn belegt: *Glucose 102 ueber Laborgrenze 99 →
  „High"; HbA1c 5,4 % im Labor-, aber ueber dem Optimalband →
  „Normal".*

  `[read]` **Keine Bewertung.** Ob ein Wert gut ist, ist eine
  medizinische Aussage — die Anzeige sagt, **wo er liegt**, nicht was er
  bedeutet.

  `[cmd]` **Erledigt 2026-08-18. Zwei Karten verlieren die Marke, 21
  bleiben** — die Befundtabelle und die Katalogsuche, **beide in eigenen
  Dateien**, damit die Trennung im Dateisystem sichtbar ist, nicht nur
  in einem Kommentar.

  `[read]` **Keine bestehende Karte verlor ihre Marke, weil keine
  angebunden wurde:** Die Entwurfstabelle zeigt Zeitreihe, Sparkline und
  Bereichsbalken — **dafuer gibt es keine Daten** (C-76).

  ### Der Doppelbereich, live

  `[cmd]` Glucose **102 mg/dL** gegen Laborbereich 70–99 (Quelle
  `Befund`), Optimalband 70–85 → *„Ueber dem Bereich"*. Calcium zeigt
  Quelle **`Katalog`** — **der Rueckfall, als solcher beschriftet.**

  `[cmd]` **Die Vorrangregel steht in `lab_result_values_read` als
  `COALESCE(v.lab_reference_*, rr.*)`** — der Lesepfad benutzt sie,
  statt sie nachzubauen, **und ein Test verbietet `COALESCE` in
  `lesen.ts`**, damit keine zweite Wahrheit entsteht.

  ### Der unbekannte Marker wird gezeigt

  `[cmd]` Rohtext, *„im Katalog nicht gefunden"*, und eine Fusszeile:
  *„2 von 6 Werten sind keinem Katalogeintrag zugeordnet … weggelassen
  wird keiner."* **Bei der mehrdeutigen Glucose nennt die Anzeige alle
  drei Kandidaten mit ihren Konfidenzen**, statt einen zu waehlen.

  ### Keine Bewertung

  `[cmd]` Die Spalte sagt **Im Bereich / Ueber / Unter / Ohne
  Bereich**. `[read]` *„Die `Optimal`, `Critical low` und `Critical
  high` der Attrappe erscheinen nicht, und es gibt kein Rot — Rot hiesse
  „gefaehrlich", und das ist eine medizinische Aussage."*

  ### Die Messung, die das Bild aendert

  `[cmd]` **Von 464 Referenzbereich-Zeilen tragen nur 54 Zahlen** — und
  **genau die schliesst `lab_result_values_read` als
  `do_not_import_without_source` aus.** Die 410 durchgelassenen sind
  Text.

  `[cmd]` **Kein LOINC-Code hat heute Labor- und Optimalbereich als
  Zahlen.** Die Anzeige liest die drei im Bestand gefundenen
  Schreibweisen und **laesst Mehrdeutiges als Text stehen, statt eine
  Grenze zu erfinden.**

  `[cmd]` Suche: 353–382 ms mit 220 ms Entprellung, **also 130–160 ms
  Arbeit ueber 11.676 Zeilen.** SQL allein: 0,05 ms leer, 1,9 ms haeufig,
  23,2 ms selten.

  ### Zwei eigene Fehler, vor dem Bericht korrigiert

  `[read]` *„Mein „keine Bewertung"-Test bemaengelte die
  Spaltenueberschrift `Optimalband` — das ist der Name des Bereichstyps
  im Schema (`range_type = 'optimal'`), kein Urteil."* Dazu: die
  Markenzaehlung las 7 statt 8, **weil die Regel nur `{ATTRAPPE}` kannte,
  nicht die eigene Begruendung der Entwurfstabelle.**

- [x] **G-45: Supplements — Injektionsorte und Subnavigation** (neu
  2026-08-18). **Tom, 2026-08-18:** *„Supplements ist nicht fertig als
  Mockup erstellt worden, denn da hat es Injektionsorte mit dieser
  speziellen Map. In Supplements nochmal an den Subnavigationen checken
  und das Mockup duplizieren."*

  `[cmd]` **Der Baustein ist fertig:** `InjektionsKarte` in
  `packages/ui/src/koerperkarte.tsx`, **gebaut und exportiert, aber
  nirgends aufgerufen.** `[read]` Aus dem G-26-Bericht: *„Wer den
  Injections-Tab baut, findet sie fertig vor."*

  `[cmd]` **Fuenf Tabs sind offen** (G-31): Catalog, Stacks,
  Intelligence, Inventory aus `-spec.jsx` (72 KB) und **Injections aus
  `-injection.jsx` (36 KB).**

  **Und die Subnavigation ist zu pruefen** — `[read]` bei Coach hat sich
  gezeigt, dass ein Modul zwei eigenstaendige Unterbereiche haben kann;
  bei Nutrition war eine Subnavigation dagegen falsch. **`app.jsx`
  entscheidet, nicht die Vermutung.**

  `[cmd]` **Danebenliegend:** `CyclePlanner.tsx` und
  `BloodLevelChart.tsx` im Vorgaengerrepo mit **28 Fundstellen zu
  Halbwertszeit und Blutspiegelverlauf**, darunter `useBloodLevels.ts`
  mit `half_life_hours`.

  `[cmd]` **Erledigt 2026-08-18: alle zwoelf Tabs, 67 von 67 Posten.**
  Neu: Catalog, Stacks, Intelligence, Inventory, Injections. **Dazu
  `SuppCost` von 2 auf 5 Kacheln** — der G-33-Rest. `refillUrgent`
  steht unveraendert, nicht begradigt.

  ### `-injection.jsx` ist ein Tab, kein Bereich

  `[cmd]` **Drei Belege, in dieser Reihenfolge geprueft:**
  `app.jsx:123` fuehrt einen Fall · `module-supplements.jsx:249` listet
  `injection` in der Tab-Leiste · `:270` rendert
  `InjectionPlannerView` **im selben Rumpf.**

  `[read]` **Die 36 KB sind gross, weil der Tab vier eigene Unter-Tabs
  hat** — Rotation map, Schedule, Log, Site guide. **`-spec.jsx` mit 72
  KB traegt sogar vier Tabs auf einmal.**

  ### Die Injektionskarte: `packages/ui` passte nicht

  `[cmd]` **Gemessen: nur 8 von 16 Orten decken sich.** Die Vorlage
  fuehrt **acht SubQ-Stellen**, die dort fehlen (`vglute_*`, `abd_*`,
  `sq_delt_*`, `thigh_sq_*`), **plus sechs Felder je Ort** — `route`,
  `maxMl`, `restDays`, `needle`, `short`, `note`.

  `[read]` *„Ohne die gibt es weder Ruhefenster noch Volumengrenze noch
  Nadelempfehlung, also genau das, worum es geht."* Dazu eine andere
  Koordinatenwelt: **100×120 gegen 724×1448.**

  `[cmd]` **Nach Toms Entscheidung Vorlage 1:1 im Modul gebaut**,
  `packages/ui` unangetastet. Am Bildschirm: 16 Orte auf zwei
  Silhouetten, Klick auf „Quad L" zeigt die Nadel (25G), Wegfilter
  rechnet **6 SubQ + 10 IM = 16.**

  ### Zwei eigene Fehler benannt

  `[cmd]` **Die Zaehlung meldete neun fehlende Modale, die alle da
  waren** — die Vorlage baut je Fenster eine Komponente, die Umsetzung
  einen Verteiler mit `case`-Zweigen. **Nachgetragen mit Beleg je
  Eintrag.**

  `[cmd]` **Und eine Zahl aus dem Auftrag traf nicht zu:** Er nannte 44
  Katalogeintraege — **die stehen in der Datenbank, die Vorlage fuehrt
  34.** *„Mein erster Test hat die 44 ungeprueft uebernommen und schlug
  fehl."*

  `[cmd]` Gate 8/8, **269+7 Tests** (11 neue, jeder zum Fehlschlagen
  gebracht), `rgba` bei 4, `packages/ui` unveraendert.

- [x] **G-31: Die fuenf fehlenden Supplements-Tabs** (neu 2026-08-17).
  Rest aus G-29.

  `[cmd]` Catalog, Stacks, Intelligence, Inventory (alle aus
  `module-supplements-spec.jsx`, 72 KB) und Injections (aus
  `-injection.jsx`, 36 KB).

  `[cmd]` **Sie stehen bereits in der Tab-Leiste** und sagen an ihrer
  Stelle, woher sie kaemen — die Leiste ist ehrlich, nur unvollstaendig.

  `[read]` **Injections ist der interessanteste:** Das Vorgaengerrepo hat
  dazu `CyclePlanner.tsx` und `BloodLevelChart.tsx` mit **28 Fundstellen
  zu Halbwertszeit und Blutspiegelverlauf**, darunter `useBloodLevels.ts`
  mit `half_life_hours`. **Das deckt genau diesen Tab ab.**

  `[cmd]` Und die Muskelkarte aus G-26 traegt `renderInjection` mit
  Rotation — **sie ist fuer diesen Tab gebaut.**

  **Dazu aus G-38:** `[cmd]` **`SuppCost` ist ein gebauter Tab, aber
  die Vorlage fuehrt fuenf Kacheln, die Umsetzung zwei.** `[read]`
  Dieselbe Klasse Luecke wie `SuppExtended` in G-33 — *sieht beim
  Klicken vollstaendig aus, ist es nicht.*

  `[cmd]` **Erledigt 2026-08-18 mit G-45** — alle zwoelf Tabs, 67 von
  67 Posten. `SuppCost` von 2 auf 5 Kacheln nachgezogen,
  `refillUrgent` unveraendert uebernommen.

- [x] **G-32: `refillUrgent` ist an einem von neun Eintraegen gesetzt**
  (neu 2026-08-17). Befund aus G-29.

  `[cmd]` Das Feld wird **an drei Stellen gelesen**, ist aber nur an
  einem der neun Praeparate gesetzt — **acht fallen auf die Warnfarbe
  zurueck.**

  `[read]` **Uebernommen wie es ist; begradigen waere eine Erfindung.**
  Richtig so — aber sobald echte Daten kommen, gehoert entschieden, ob
  das Feld eine Schwelle ist (Bestand unter X Tagen) oder eine
  Markierung von Hand.

  `[cmd]` **Erledigt 2026-08-18 mit G-45** — alle zwoelf Tabs, 67 von
  67 Posten. `SuppCost` von 2 auf 5 Kacheln nachgezogen,
  `refillUrgent` unveraendert uebernommen.

- [x] **G-55: Die Koerperkarte fertigstellen — Recovery richtig** (neu
  2026-08-18). **Fasst G-47, G-49 und G-54 zusammen. Ein Auftrag, ein
  Agent.**

  **Tom, 2026-08-18:** *„Der Auftrag war: binde die neue Grafik ein,
  abgeleitet aus dem Beispiel-HTML, welches wir als Komponente
  reingeholt haben und schon halbherzig bei Recovery drin haben. Da
  sollte es einen Folgeauftrag geben, Recovery fertigzustellen und
  richtig."*

  ### Was fehlt — im Bildvergleich belegt

  `[cmd]` **`MuscleBodyMap_test.html` zeigt die Figur vollstaendig:**
  Umriss, Kopf, Haende, Fuesse, Muskeln als Flaechen.

  `[cmd]` **`/v2/recovery` zeigt nur die eingefaerbten Muskeln** — kein
  Umriss, keine Haende, keine Fuesse. **Die Muskeln stehen frei im
  Raum.**

  `[cmd]` **Die Ursache ist gemessen:** `OUTLINE_FRONT` (5.010 Zeichen)
  und `OUTLINE_BACK` (3.823) stehen in `MuscleBodyMap.js` **ab Zeile
  285** — **in `koerperkarte-pfade.ts` fehlen sie.**

  `[read]` **`body_front.svg` wird von der Vorlage gar nicht benutzt.**
  Der G-26-Agent nahm sie als Quelle, fand dort einen abgeschnittenen
  Umriss und schloss daraus, die Vorlage sei kaputt. **Sie ist es
  nicht.**

  ### Vier Teile, alle an derselben Komponente

  **1. Der Umriss** (war G-47) — `OUTLINE_FRONT`/`_BACK` uebernehmen,
  dazu `head`, `hair`, `hands`, `ankles`, `feet` aus `MUSCLES`.
  `[cmd]` Das Original arbeitet mit **einem viewBox 724×1448**,
  `front` bei x≈0–724, `back` bei x≈724–1448 — **dieselbe
  Koordinatenwelt.**

  **2. Die drei Ebenen** (war G-49) — `[cmd]` C-73 ist fertig: **96
  Gruppen, 89 Eltern-Beziehungen.** Flaeche (15) → Gruppe (18 Zeilen der
  Liste) → Muskel (96). **Die Flaeche traegt den verdichteten Wert, der
  Klick trennt wieder auf.**

  **3. Die Sichtbarkeit** (war G-54) — `[cmd]` `--surface` gegen
  `--surface-2`: **0,012 Helligkeit.** Betrifft auch den
  Supplements-Injections-Tab. **Gestaltungsfrage: eigener Token,
  staerkere Kontur, oder hellere Flaeche.**

  **4. Der Anschluss** (war G-30) — `[cmd]` **36 Check-ins liegen live,
  27 davon ohne HRV.** `[read]` Anbinden heisst hier: **die erfassten
  Werte zeigen**, keine Kennzahl daraus rechnen (das ist `SPEC_09`).

  ### Der Nachweis, der diesmal zaehlt

  **Bildschirmfoto neben `MuscleBodyMap_test.html`**, beide Ansichten,
  hell und dunkel.

  `[read]` **Der G-45-Nachweis lautete** *„16 Orte auf zwei
  Silhouetten"* — **das prueft die Punkte, nicht den Koerper.** Ein
  Bildvergleich war verlangt und wurde nicht geliefert.

  `[cmd]` **Erledigt 2026-08-18.** Gate 8/8, **280+7 Tests** (11 neue,
  jeder zum Fehlschlagen gebracht), `rgba` bei 4.

  ### Teil 1: Der Umriss war nie das Problem — der Auftrag lag falsch

  `[cmd]` **Der Umriss ist im Mockup toter Code.**
  `MuscleBodyMap.js:310` erzeugt `outlinePath`, `:316` haengt `outlineG`
  an — **der Pfad wird nie an die Gruppe gehaengt.** Auf der Testseite
  gemessen: **`innerHTML`-Laenge der Umrissgruppe = 0.** Die Figur
  entsteht **allein aus `MUSCLES`.**

  `[cmd]` **Die Portierung fuehrt alle Formen:** 23 von 23, **158 von
  158 Pfaden, null Abweichungen.** `head`, `hair`, `hands`, `ankles`,
  `feet` sind da.

  `[read]` **Und die 118 fehlerhaften `C`-Befehle waren richtig
  gemessen.** Der Orchestrator hatte das widerlegt — zu Unrecht: *die
  Beispiele sind `C` mit vier Zahlen, zu wenig fuer ein Paket, nicht zu
  viel. Der Umriss ist defekt; das ist nur folgenlos, weil ihn niemand
  braucht.*

  ### Teil 3: Das war der eigentliche Fehler

  | Token | dunkel | hell |
  |---|---|---|
  | `--surface-2` (war gesetzt) | 0,030 | 0,025 |
  | **`--border-strong`** | **0,155** | **0,180** |

  `[cmd]` **Gewaehlt: `--border-strong`** — der einzige vorhandene Token
  ueber 0,15 in beiden Modi, **kein neuer.** Dazu **eine Kontur je Form**
  statt des defekten Gesamtumrisses.

  `[cmd]` **Bildvergleich mit `MuscleBodyMap_test.html` liegt bei, hell
  und dunkel** — der Nachweis, der in G-45 fehlte.

  ### Teil 2: Die drei Ebenen

  `[cmd]` **Alle 96 haben ein Ziel**, per Test gegen die Kettendatei
  geprueft. Verteilung: `forearm` 17, `calves` 10, `quadriceps` 9,
  `gluteal`/`adductors`/`deltoids` je 8 — **Summe exakt 96, auch das im
  Test.**

  `[read]` **Gemittelt, nicht maximiert** — (90+10+50)/3 = 50. *Ein
  Maximum liesse `forearm` rot aussehen, weil einer von siebzehn platt
  ist.*

  `[cmd]` **Der Klick trennt auf:** Brust zeigt *MUSCLES ON THIS AREA,
  5 OF 96* mit `Pectoralis Major` und den vier anderen.

  ### Teil 4: Angebunden, nach einer fehlenden Zeile

  `[cmd]` **Eine Kachel verliert die Marke.** Am Bildschirm meldete sie
  zuerst ehrlich *Die Tabelle ist da, aber nicht lesbar: Invalid schema:
  recovery* — `supabase/config.toml:16` fuehrte `recovery` nicht.

  `[read]` **Der Agent hat gemeldet statt gegriffen**, obwohl es eine
  Zeile war und er die Ursache exakt benannt hatte. **Der Orchestrator
  hat sie ergaenzt**, Supabase neu gestartet, ueber PostgREST belegt.

- [x] **G-30: Recovery an die Check-ins anschliessen** (neu 2026-08-17).
  Folgt auf C-67.

  `[cmd]` `/v2/recovery` steht mit **36 Kacheln, alle Attrappe** — der
  Grund war das fehlende Schema. **Seit `120` gibt es `recovery.checkins`
  mit 36 Zeilen live.**

  `[read]` Aus dem G-21-Bericht: *„eine Tabelle weckt sieben Kacheln: den
  Check-in-Tab, den Erholungswert im `manual`-Modus (braucht kein HRV),
  die Kopfzeile und den subjektiven Schlafpfad."*

  `[cmd]` **27 der 36 Check-ins haben kein HRV** — der `manual`-Modus ist
  der Normalfall, nicht die Ausnahme. **Die Anzeige muss ihn tragen**,
  nicht als Mangel behandeln.

  **Der Erholungswert selbst ist ein eigener Punkt.** `[read]` Er ist
  `SPEC_09` und hat dieselbe Frage wie C-49: welcher Faktor wie stark
  zaehlt. **Anbinden heisst hier: die erfassten Werte zeigen**, nicht
  eine Kennzahl daraus rechnen.

  **Angebunden heisst: Marke weg.** Alles andere behaelt sie.

  `[cmd]` **Erledigt 2026-08-18 mit G-55** — Lesepfad und Kachel
  gebaut, eine Kachel ohne Marke. **Erst nach `config.toml:16`**, wo
  `recovery` fehlte.

- [x] **G-57: Die Silhouette im Injections-Tab** (neu 2026-08-18). Rest
  aus G-55.

  `[cmd]` **Gemessen: `fill="var(--surface)"` auf `--surface`** —
  **Abstand 0,000.** Die Figur ist dort nicht nur schwach sichtbar,
  sondern **exakt unsichtbar.**

  `[read]` **Andere Datei, andere Tokens** als die Koerperkarte — die
  G-55-Loesung (`--border-strong`, Kontur je Form) greift nicht mit.
  Der Agent hat es gemessen und nicht umgebaut, wie verlangt.

  `[cmd]` Die Silhouette liegt in
  `apps/web/src/app/v2/supplements/tab-injektionen.tsx`, viewBox
  `0 0 100 120`, **ein `<path>` mit `SILHOUETTE`.**

  `[cmd]` **Erledigt 2026-08-18.** Eine Datei, Fuellung und Kontur auf
  `--border-strong`.

  | Modus | vorher | nachher | Faktor |
  |---|---|---|---|
  | dunkel | 0,018 | **0,137** | 7,4x |
  | hell | 0,013 | **0,167** | 12,3x |

  ### Eine Praezisierung am Befund

  `[read]` **Der Auftrag nannte Abstand 0,000** — der Agent hat
  nachgemessen: *„Die Karte traegt zusaetzlich `v2-attrappe`, der Grund
  ist am Bildschirm also 0,223 (dunkel) bzw. 0,987 (hell), nicht der
  reine `--surface`-Token. Der Restabstand kam von der Attrappenmarke,
  nicht von der Figur."*

  ### Die Kontur musste mit — stand nicht im Auftrag

  `[cmd]` `--border` liegt nur 0,080/0,090 von der neuen Fuellung
  entfernt **und ist im Nachtmodus dunkler als sie** (0,280 gegen
  0,360). `[read]` *„Sie haette die Figur nach innen abgeschnitten."*
  Kontur faellt jetzt mit der Fuellung zusammen.

  ### Warum nicht die G-55-Loesung

  `[read]` **Dieselbe Erkenntnis, andere Bezugsgroesse.** G-55 fuellt mit
  `--surface-2`, **weil die Recovery-Karte Muskelflaechen einfaerbt** —
  die Fuellung ist dort nur Untergrund. *„Hier gibt es nur 16 Punkte,
  die Fuellung traegt die ganze Figur."* **Der G-55-Agent hat richtig
  nicht umgebaut.**

  `[cmd]` 16 Punkte unveraendert (12 vorne, 4 hinten), Wegfilter 10 IM +
  6 SubQ. **Bildschirmfotos beide Modi x vier Breiten, plus Vorzustand**
  — was in G-45 fehlte. `rgba` bei 4, keine neuen Tokens.

- [x] **G-43: `history` und `shield` fehlen, `Pill` hat kein `dot`**
  (neu 2026-08-18). Befund aus G-40.

  `[cmd]` **`shield` zum zweiten Mal** (G-36 und G-40), **beide Male an
  einer Datenschutz-Ueberschrift** — die naheliegendste Ergaenzung.

  `[cmd]` Dazu: `Pill` hat kein `dot`, und es gibt **keinen
  `Empty`-Baustein**. Beide in `coach/bausteine.tsx` modul-lokal
  nachgebaut. `[read]` Wer sie beim zweiten Modul nachbaut, baut sie
  falsch — dieselbe Regel wie bei den Shell-Bausteinen in G-02.

  `[cmd]` **Und `.v2-card-h` bricht Kartentitel um**, wenn ein langer
  Untertitel auf die Attrappen-Marke trifft. `[read]` Dritter Befund
  dieser Art nach G-23 (Modulkopf) und G-34 (`.v2-btn` ohne `nowrap`).

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-39: Zwei Symbole fehlen (`shield`, `file`)** (neu 2026-08-17).
  Befund aus G-36.

  `[cmd]` `shield` **zweimal, an der sichtbarsten Stelle** → ersetzt
  durch `admin`; `file` → `copy`. `packages/ui` war gesperrt.

  `[read]` Dritter Fund dieser Art nach G-20 (fuenf Symbole) und G-21.
  **`arr_r` nicht uebernommen** — ein Test haelt das fest.

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-50: `v2-g-cols-5` fehlt** (neu 2026-08-18). Befund aus G-42.

  `[cmd]` `v2.css` hat nur `-2`, `-3`, `-4`. **Modul-lokal nachgebaut.**

  `[read]` Zusammen mit G-43 (`shield` **zum dritten Mal**, `file`,
  `Pill` ohne `dot`, kein `Empty`) — **die Sammelstelle fuer fehlende
  Bausteine.**

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-52: `InEntwicklungKnopf` kennt kein `disabled`** (neu
  2026-08-18). Befund aus G-45.

  `[cmd]` **Im Log-Fenster ist das nicht nebensaechlich:** Die Vorlage
  **sperrt den Speichern-Knopf bei ueberschrittener Menge oder laufendem
  Ruhefenster.**

  `[read]` Ein Knopf, der eine Grenze nicht durchsetzt, **sieht aus wie
  eine Sicherung und ist keine.**

  `[cmd]` **Ohne `packages/ui` geloest:** der gesperrte Fall rendert ein
  echtes `<button disabled>`. **Fuenfter Fall nach den G-43-Luecken**
  (`shield` dreimal, `file`, `Pill` ohne `dot`, kein `Empty`,
  `v2-g-cols-5`).

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-41: Bei 375 px scrollt jede v2-Seite waagerecht** (neu
  2026-08-17). Randbefund aus G-38.

  `[cmd]` **Ursache ist `.v2-sidebar-nav` mit 880 px**, nicht der
  Modulinhalt — **betrifft auch unveraenderte Seiten.**

  `[read]` Die bisherige Pruefung *„drei Breiten ohne Ueberlauf"* hat es
  nie gefunden, weil sie bei groesseren Breiten misst. **375 px ist die
  Breite eines Telefons.**

  `[cmd]` Die Shell stammt aus G-02, wo die Haltepunkte der bestehenden
  Oberflaeche uebernommen wurden — **der Entwurf hat null
  `@media`-Regeln.** Unter 1.280 px wurde die Kontextspalte
  ausgeblendet; **die Sidebar blieb unberuehrt.**

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-34: `.v2-btn` hat kein `white-space: nowrap`** (neu
  2026-08-17). Befund aus G-28.

  `[cmd]` `v2.css:344`. **Die Kopfknoepfe brechen innerhalb des Knopfes
  um** — die Knopfhoehe bleibt bei 26 px, gemessen.

  **Betrifft jedes Modul.** `packages/ui` war waehrend G-28 gesperrt —
  gemeldet, nicht lokal umgangen.

  `[read]` Haengt mit G-23 zusammen: Dort bricht der **Modulkopf** um,
  weil zu viele Knoepfe drin sind. **Hier bricht der Knopf selbst.**
  Zwei verschiedene Fehler, dieselbe Stelle.

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-24: JetBrains Mono laden** (neu 2026-08-17). Rest aus G-18.

  `[cmd]` Die Vorlage setzt `--font-mono: 'JetBrains Mono', ui-monospace,
  monospace`; hier steht nur die Systemkette. `v2.css` benutzt
  `var(--font-mono)` an sechs Stellen — dort stehen in der Vorlage die
  Kennzahlen.

  `[annahme]` Der Unterschied duerfte klein sein. **Belegbar erst, wenn
  die Schrift geladen ist** — dann laesst sich vergleichen statt
  vermuten.

  `[cmd]` Der Weg ist derselbe wie bei Inter: `next/font/google`, beim
  Bauen geladen, keine Laufzeitabhaengigkeit.

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-10: `btn-accent` auf Seiten ohne Modulakzent** (neu
  2026-08-16). Befund aus C-58.

  `[cmd]` Der Speichern-Knopf in Settings war unsichtbar: Er trug
  `v2-btn-accent`, das sich aus `--acc` färbt — **und Settings hat
  keinen Modulakzent.** Mit und ohne Änderung blassgrau, Unterschied nur
  die Deckkraft.

  **Das betrifft nicht nur Settings.** `[cmd]` Jede Seite ohne
  Modulakzent hat dasselbe Problem mit jedem `btn-accent` — und
  `app-shell.tsx` setzt `--acc` nur für die elf Module.

  **Zu prüfen:** Welche Seiten haben keinen Akzent? Was passiert dort
  mit `v2-btn-accent`, `v2-accent-dot` und allem anderen, das aus
  `--acc` liest? `[annahme]` Ein Rückfallwert im Token wäre die
  einfachste Lösung — dann ist nichts unsichtbar, auch wenn die Seite
  kein Modul ist.

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-27: `v2-rec-grid-1135` und drei weitere Raster** (neu
  2026-08-17). Rest aus G-21.

  `[cmd]` Vier eigene Raster in `apps/web/src/app/v2/recovery/recovery.css`
  — darunter `v2-rec-grid-1135`, **links schmaler als rechts, einmalig
  im Repo.**

  `[read]` `v2-grid v2-g-cols-2` **ist kein Ersatz: es hat keinen
  Haltepunkt.**

  `[cmd]` Die geteilten Raster nutzt Recovery bereits zentral
  (`v2-grid-14`, `-15`, `v2-tbl-wrap`) — der Agent hat mitten im Auftrag
  auf G-19 umgestellt. **Was bleibt, ist der Rest.**

  **Gleiche Behandlung wie bei Training:** in den `zusatz`-Block des
  Erzeugers, nicht von Hand in `v2.css`.

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-35: Zwoelf Modul-Raster in `goals.css`** (neu 2026-08-17). Rest
  aus G-28.

  `[cmd]` Die geteilten `v2-grid-14`/`-15` tragen **acht der zehn
  Tabs** — der Rest sind Sonderfaelle.

  **Gleiche Behandlung wie G-19 und G-27:** in den `zusatz`-Block des
  Erzeugers, **beim Verschieben zusammenfassen.** `[read]` Sonst stehen
  am Ende elf Modul-Rastersaetze nebeneinander, die dasselbe tun.

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-23: Der Modulkopf bricht um** (neu 2026-08-17). Befund aus
  G-18.

  `[cmd]` **Sechs Aktionsknoepfe plus die G-14-Datumsnavigation passen
  bei 1600 px nicht in eine Zeile.** Kein Ueberlauf, nur Umbruch — und
  kein Schriftproblem, es war vorher da.

  `[cmd]` Die Vorlage zeigt `‹ ›` plus vier Knoepfe; hier kamen die
  Datumsnavigation als Block und `Lebensmittel suchen` dazu.

  **Zu entscheiden:** Welche Knoepfe gehoeren in den Kopf und welche
  woandershin? `[read]` Die Vorlage ist die Vorgabe — wenn sie vier
  zeigt und hier sechs stehen, ist die Frage, was dazugekommen ist und
  warum.

  `[cmd]` **Erledigt 2026-08-18 mit G-56.** Gate 8/8, **290 von 290
  Tests.**

- [x] **G-37: Supplements an den Katalog anschliessen** (neu
  2026-08-17). Folgt auf C-68.

  `[cmd]` `/v2/supplements` steht seit G-33 vollstaendig — elf Tabs, 15
  von 15 Unterkomponenten, **alle Attrappe.** Seit `130`/`131` gibt es
  das Schema.

  `[cmd]` **44 Katalogeintraege, 1 Stack mit 4 Positionen, 4 Einnahmen**
  live. Dazu `daily_intake_summary` als Sicht.

  **Die naheliegenden Tabs:** `Today` (Einnahmen des Tages), `Stack`
  (Matrix und Liste), `Database` (der Katalog — `[read]` ueber den
  Kopfknopf erreichbar, nicht in der Leiste, wie die Vorlage es haelt).

  `[cmd]` **`Compliance` braucht mehr Einnahmen** — vier reichen fuer
  keine Quote. **Cost** braucht Preise; pruef, ob der Katalog sie fuehrt.

  `[read]` **G-32 haengt daran:** `refillUrgent` ist in der Attrappe an
  einem von neun Eintraegen gesetzt. Sobald echte Bestaende kommen, ist
  zu entscheiden, **ob es eine Schwelle ist (Bestand unter X Tagen) oder
  eine Markierung von Hand.** Der Testfall `vitamin-d3` steht bereit.

  `[cmd]` **Erledigt 2026-08-18: vier Tabs statt der drei aus dem
  Auftrag** — Today, Stack, Database **und Cost**. **14 Kacheln ohne
  Marke** (Today 4, Stack 1, Database 1, Cost 8), im Browser gezaehlt.

  `[cmd]` Today zeigt **3/4**, naechste Dosis Magnesium 21:30, Herkunft
  `seed` sichtbar. Database 44 von 44. Cost **20,40 EUR/Monat, 0,68
  EUR/Tag.**

  ### Zwei Annahmen des Auftrags trafen nicht zu

  `[cmd]` **Cost hat seine Grundlage.** Der Auftrag liess offen, ob der
  Katalog Preise fuehrt — **er fuehrt `cost_per_serving` auf 44 von 44**,
  `serving_size` ebenso. **Damit ist der Tab angebunden, ohne eine
  geschaetzte Zahl.**

  `[cmd]` **„Typical dose" ist auf allen 44 leer** (`typical_dose_min`
  = 0 von 44). `[read]` *„Die Spalte haette nur Striche gezeigt; sie
  heisst jetzt „Serving" und zeigt 300 mg, 600 mg, 5 g."*

  ### Was Compliance fehlt — mit Zahl

  `[cmd]` **4 Zeilen an 1 Tag, kein einziges `skipped`.** Gebraucht: **30
  Tage** (Streifen, Tabelle), **90 Tage** (Heatmap) — bei 4 Positionen
  also **120 bzw. 360 Zeilen.**

  `[read]` **Die Sicht rechnet `compliance_pct = 100`** — *„genau
  deshalb bleibt der Tab Attrappe: 100 % aus einem Tag ohne Auslasser
  ist kein Befund. Der Auslasser fehlt strukturell — ohne `skipped` hat
  „Last skip · reason" nichts zu zeigen, egal wie viele Tage
  dazukommen."*

  `[cmd]` Zeilenschutz: `test-user` sieht 0 aktive, 0/0. Gate 8/8, **0
  Konsolenfehler**, vier Breiten inklusive 375 px.

- [x] **G-60: Medical — das Mockup an die Daten binden** (neu
  2026-08-18). **Ersetzt G-51.** Korrektur an G-46.

  **Tom, 2026-08-18:** *„Am Ende will ich das Mockup mit all seinen
  Funktionen mit Daten angebunden haben — da gehoeren die Popups,
  Filter etc., was immer auch im Mockup drin ist, auch dazu. Und nichts
  neu Erfundenes ohne Absprache mit mir."*

  ### Was heute auf der Seite steht

  `[cmd]` **Drei Listen untereinander:** 140 Werte als Flachliste ·
  11.676 Katalogeintraege · **die Attrappe** — und nur die letzte zeigt
  Panels, Verlauf, Bereichsbalken und *„Non-optimal only"*.

  `[read]` **Der Fehler lag im Auftrag.** G-46 sagte *„die
  Biomarker-Liste und der Befund"* — zwei Dinge, die im Mockup so nicht
  vorkommen. **Der Agent hat gebaut, was verlangt war.**

  ### Der Ablauf, der ab jetzt gilt

  > **Mockup → Abgleich mit altem Repo und Specs → Tabellen definieren
  > → Seeds erzeugen → Auftrag: dieses Mockup an diese Daten binden.**

  **Und: Wenn eine Tabellenspalte fehlt oder etwas dazugehoert, kommt es
  vor dem Auftrag zu Tom** — besprochen, dann gebaut.

  ### Zwei Punkte, mit Tom geklaert (2026-08-18)

  `[cmd]` **Evidenzgrad (`ev A+` / `ev A`) faellt weg** — die Attrappe
  zeigt ihn, **die Daten haben ihn nicht.** Tom: *„Wir haben die Daten
  fuer diese Evidence nicht, also weg."*

  `[cmd]` **`match_status` gehoert nicht in die Liste, sondern in den
  Import-Tab.** `[read]` Beim Hochladen ist er nuetzlich — *„138 von
  140 zugeordnet, 2 unklar"*. **In der Liste ist er Testmaterial:** die
  zwei Faelle wurden erzeugt, damit der Importpfad pruefbar ist.

  ### Was zu bauen ist

  **Eine Liste statt drei**, in der Form der Attrappe: **Panel-Filter**
  (CBC 5, Metabolic 4, Lipid 5, Liver 6, Kidney 4, Thyroid 4, Hormone
  10, Inflammation 3, Vitamins 6, Screening 1) · **Verlauf ueber die
  fuenf Befunde** · **Bereichsbalken** statt Textspalte · **„Nur
  nicht-optimal"** · die Popups, die das Mockup hat.

  `[cmd]` **Die Daten sind da:** 140 Werte, 5 Befunde, 2026-02-18 bis
  2026-08-19, mit Verlauf (Glukose 88 → 102, HbA1c 5,2 → 5,4).

  `[cmd]` **Der Katalog gehoert hinter die Suche**, nicht auf die Seite —
  wie die 7.140 Lebensmittel, wo das Tagebuch vier Zeilen zeigt.

  `[cmd]` **Erledigt 2026-08-18: eine Liste in der Form der Attrappe,
  mit echten Daten.** `marker-liste.tsx`, `marker-modal.tsx`,
  `lib/medical/reihe.ts` — **die Faltung von 140 flachen Werten auf 37
  Marker.**

  | | |
  |---|---|
  | Panelfilter | All 37, CHEM 31, HEM/BC 2, Unmapped 2, … — Klick auf HEM/BC liefert 2 Zeilen |
  | Verlauf | **Glukose +15,9 %** (88→94→99→102), HbA1c +3,8 % |
  | „Non-optimal only" | **37 → 6** |
  | Popup | echte Kurve, Achse 02-18 bis 08-18, Messtabelle |
  | Marken | **20 statt 21**, Biomarkers-Tab **0** |
  | Gate | 8/8, **306 Tests**, **0 Konsolenfehler** (G-46 hatte 1) |
  | Breiten | 375/768/1024/1440 ohne Seitenueberlauf |

  `[cmd]` **`befund-tabelle.tsx` und die Entwurfstabelle sind weg.**
  `match_status` ist **in den Import-Tab gezogen** — dort steht *„138 von
  140 Werten zugeordnet"* mit den zwei offenen Faellen. **Der Katalog
  klappt hinter einem Knopf aus.**

  ### Die Begriffspruefung war die verlangte

  `[read]` *„High/Low/Normal leisten dasselbe wie die G-46-Woerter —
  genommen als Above range / Below range / In range. **Optimal nicht: es
  benennt keine Lage, und in der Attrappe steht es in einer Reihe mit
  Critical low / Critical high, also auf derselben Urteilsskala.**"*

- [x] **GO-09: Zieluebersicht in `/v2/goals`** (neu 2026-08-17). Folgt
  auf GO-07.

  `[cmd]` Seit `111` gibt es `goals.user_goals` und `goal_phases` mit 3
  Zielen und 3 Phasen live, dazu `nutrition_targets` aus Block A.

  `[cmd]` **Ein Claude Code baut gerade `/v2/goals` als Mockup** (G-28).
  Danach ist dies der Anschluss — **lesend, wie G-03 bei Nutrition.**

  `[read]` Aus dem Plan: *„Goals ist der Massstab, an dem Buddy misst —
  keine eigenstaendige Dateneingabe."* **Die Uebersicht zeigt, sie
  erfasst nicht.**

  **Was schon rechnet:** `[cmd]` `berechne_zielwerte` liefert fuer Toms
  Profil 2.977,8 kcal, 156,8 g Protein, 3.400 ml Wasser — und
  `zielwerte_am` gibt sie zum Stichtag aus.

  **Angebunden heisst: Marke weg.**

  `[cmd]` **Erledigt 2026-08-18 mit GO-16** — die Zieluebersicht liest
  echt, zwei aktive Ziele, Phase `lean bulk`.

- [x] **GO-13: Fuenf Goals-Kacheln koennen sofort echt werden** (neu
  2026-08-17). Befund aus G-28.

  `[cmd]` **Ohne neue Tabelle**, aus dem, was seit Block A steht:

  | Kachel | Feld |
  |---|---|
  | `CalcRow` TDEE / BMR | `zielwerte_am.tdee`, `getZielwertVorschlag().bmr` |
  | Energy balance (Ring-Maximum) | `kcal` |
  | Profile · inputs | `public.profiles` |
  | Formula baseline (Adaptive TDEE) | `tdee`, Herkunft `formel` |

  `[cmd]` **Die Composition-Kachel rechnet dieselbe Kette wie GO-04** —
  Mifflin-St Jeor mal Aktivitaetsfaktor.

  `[read]` **Bemerkenswert:** Der Umsetzungsplan haelt als W-6 fest, dass
  **die Spec den Aktivitaetsfaktor vergisst** — die Designvorlage macht
  es richtig. **Die Vorlage ist hier genauer als die Spezifikation.**

  `[cmd]` **Erledigt 2026-08-18 mit GO-16** — die fuenf Kacheln lesen
  `zielwerte_am` und `berechne_zielwerte`, **Marken 38 → 23.**
