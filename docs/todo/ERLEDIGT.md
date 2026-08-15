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
