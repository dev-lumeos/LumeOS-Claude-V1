# TODO — LumeOS

**Stand:** 2026-08-14, Anker `7b5e631` auf `dev`.
Die Zahlen im Übersichtsblock unten sind aus dieser Datei gezählt, nicht
von Hand gepflegt — sie stimmen, solange niemand die Konvention bricht.

**Konvention:** `[ ]` offen · `[~]` in Arbeit · *Blocker kursiv*
**Belegpflicht:** Aussagen über den Ist-Zustand tragen `[cmd]`, `[read]`
oder `[annahme]`. Nur `[cmd]` darf zu einer Regel werden.
**Erledigtes** steht vollständig in `docs/todo/ERLEDIGT.md` — mit Datum,
Beleg und Begründung. Diese Datei enthält nur, was noch aussteht.

**Kein Blockzähler mehr.** Der alte Kopf stand bis zuletzt auf
„Block 28, Stand 2026-08-13", während im Repo bereits Block 34 gesichert
war (`backup/nutrition-schema-vor-b34.sql`) und elf Punkte dazugekommen
waren. Ein Zähler, den niemand fortschreibt, wird irgendwann als Wahrheit
gelesen. Anker ist ab jetzt der Commit-Hash.

---

## Wo es steht

**Datenseite:** Nutrition und Training liegen live und validiert in der
lokalen Instanz. Was bei beiden fehlt, ist dasselbe: **UI und
API-Route**. Bei Nutrition wurde das dreimal bewusst zurückgestellt, bis
der Aggregationsweg entschieden war — er ist es.

**Suche:** der zuletzt bearbeitete Strang und ab 2026-08-14 auf einem
anderen Weg. `[cmd]` Der Massstab (`mealcam-zutaten-messen.ts`, 37 Zutaten
mit erwartetem BLS-Code) steht bei **31 von 37 auf Platz 1**, vorher
2 von 16.

**Die Richtungsentscheidung vom 2026-08-14:** Die bisherige Arbeit lag auf
der **Anfrageseite** — Zerlegung, Synonyme, Plural, 32.522 Aliase. Diese
Seite ist unbegrenzt; `[cmd]` für den ganzen Bestand wären 5.000–8.000
Wörterbucheinträge nötig, die 50 häufigsten Erstwörter decken 24,9 % ab.
Die **Bestandsseite** ist endlich: 7.140 Namen, maschinell erzeugt,
regelhaft — und `[cmd]` der eine Eingriff dort (Zubereitungsstufe,
Block 32) hat C-19, C-21 und einen Teil von C-27 auf einmal miterledigt.
Der Umbau läuft deshalb über **C-33 → C-29 → C-30 → C-32 → C-31**:
Arten sauber gruppieren, Namensschichten trennen, Suche auf Arten
umstellen, Reis als ersten durchkurierten Fall, dann erst die
Oberfläche. `[cmd]` Der erste Anlauf (C-28, vierstellige Gruppierung)
ist gemessen und gefallen — 39 von 100 gegen eine Abnahme von 95; die
Ursache steht in C-33. C-20 und C-24 fallen beim Umbau strukturell mit;
C-22 bleibt eigenständig.

**Deployment:** E-08 hat keine Vorbedingung mehr ausser sich selbst.

**Wartet auf Tom, blockiert anderes:** A-06 (Design — hält C-01, C-03,
C-06 auf), A-08 (ADR Medienort), E-07 (Geschlechtsfeld der Medienauswahl).

---

## Reihenfolge

1. **Nutrition-Oberflächen.** Der nächste sichtbare Schritt; die
   Datenseite trägt. Laut D-04 auch der Punkt, an dem ein E2E-Aufbau
   wieder lohnt: die erste Oberfläche, die bleiben soll.
2. **Suche: C-33 zuerst.** `[cmd]` C-28 ist gemessen und die
   vierstellige Gruppierung gefallen — 39 von 100 gegen eine Abnahme von
   95. Die Ursache ist gefunden und liegt in den Stellen 5–7, deren
   Bedeutung von der Warengruppe abhängt (C-33). Erst wenn dieselbe
   Messung dort 95 erreicht, folgen C-29 (Schichten), C-30 (Suche),
   C-32 (Reis), C-31 (Oberfläche). C-20 und C-24 nicht einzeln angehen;
   sie fallen in C-30 mit.
3. **C-18 (Fehlsuchen mitschreiben)** bleibt der einzige Hebel, der nicht
   auf geratenen Begriffen beruht — er priorisiert die Kurationsarbeit
   aus C-31 und kann parallel laufen. **C-17 (Laufzeit)** gehört in
   C-30 hinein, nicht davor: der Index wird beim Umbau der Bedingung
   ohnehin neu gelegt.
4. **C-06**, erstes echt gemachtes Mock-Modul (Kandidat Goals; Goals
   trägt `nutrition_targets`, daran hängt das Wasser-Tagesziel aus C-05).
5. **Training-Oberfläche** — dieselbe Ausgangslage wie Nutrition.
6. **E-08 Deployment**, danach E-04 und E-09.
7. **Sektion F (AMF)** steht neben allem und blockiert nichts. Reihenfolge
   dort bewusst umgedreht: F-01 (Schnittstellenvertrag) vor F-02
   (Ablageort) vor F-04 (Extraktor); F-06 (Backend) erst nach zwei Wochen
   Gebrauch.

---

## Offene Punkte auf einen Blick

`[cmd]` 40 offen, 3 in Arbeit.

| | Punkt | |
|---|---|---|
| **A-05** | Repo-Müll entfernen | ~ |
| **A-06** | Design-System spezifizieren |  |
| **A-08** | ADR Medienort |  |
| **B-20** | Codex-Pfadschutz wiederherstellen | ~ |
| **B-25** | Geteilte Sitzung im Produktbereich prüfen |  |
| **C-01** | Frontend-Stack-Lücke schliessen |  |
| **C-03** | WP-02 Diary-Verdrahtung |  |
| **C-06** | WP-05 erstes Mock-Modul echt machen |  |
| **C-08** | `services/nutrition-api` einordnen |  |
| **C-16** | Training hat dasselbe Wortschatzproblem — eine Runde früher erkennen |  |
| **C-17** | Suchlaufzeit — 547 ms bei zweiwortigen Anfragen |  |
| **C-18** | Fehlsuchen mitschreiben |  |
| **C-20** | Treffer am Wortanfang schlägt Treffer in der Wortmitte |  |
| **C-22** | Phonetische Schreibvarianten |  |
| **C-23** | Systematische Abdeckungsmessung statt handverlesener Begriffe |  |
| **C-24** | Halbfertigprodukte ranken als Grundzutat |  |
| **C-27** | Alltagswörter ohne Treffer — noch zwei |  |
| **C-33** | Der Zubereitungsschlüssel ist warengruppenabhängig — die Ursache hinter C-28 |  |
| **C-34** | Einträge, die der BLS nicht kennt |  |
| **C-29** | Drei Namensschichten und eine Kuration, die den Kettenlauf überlebt |  |
| **C-30** | Suche und Trefferliste auf Arten umstellen |  |
| **C-31** | Admin-Oberfläche für die Kuration |  |
| **C-32** | Reis vollständig kurieren — der erste Fall, an dem sich das Modell beweist |  |
| **D-05** | Spec-Audit | ~ |
| **E-04** | Alte `public`-Tabellen nach `legacy` verschieben |  |
| **E-07** | Lücke weibliche Darstellungen entscheiden |  |
| **E-08** | Deployment nach `main` |  |
| **E-09** | Preview-Branches erst danach |  |
| **E-10** | RLS neu bewerten, sobald `main` produktiv wird |  |
| **E-14** | `image_male_*` zeigt auf `_Female`-Dateien |  |
| **E-15** | Vier `body_region`-Werte im Altbestand sind anatomisch falsch |  |
| **E-17** | `Achilles Tendon` ist eine Sehne in `muscle_groups` |  |
| **E-18** | `none/None` als Muskelgruppe — Restfrage |  |
| **E-19** | Derselbe Muskel mit `primary` UND `secondary` an einer Übung |  |
| **F-01** | Schnittstellenvertrag zuerst |  |
| **F-02** | Ablageort festlegen |  |
| **F-03** | obsidian-skills einbinden |  |
| **F-04** | Sitzungsextraktor |  |
| **F-05** | Suche über das Extrahierte |  |
| **F-06** | Backend erst nach zwei Wochen Gebrauch wählen |  |
| **F-07** | Berechtigungen |  |
| **F-08** | Werkstatt-Inventar |  |
| **F-09** | Wenn AMF steht — die Blueprint-Regeln prüfen |  |

---

## A — Struktur & SSOT (laufend)

- [~] **A-05: Repo-Müll entfernen** (untracked) — **neu erhoben
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

- [ ] **A-06: Design-System spezifizieren** — Stand Audit 2026-08-05:
  `[cmd]` `docs/spezifikation/10-plattform/design-system/` ist **nicht mehr
  leer** — `00-diskussionsstand.md` liegt vor. Quellen weiterhin:
  `docs/design-system/` (DESIGN_CONCEPT, components, tokens), `packages/ui`
  (Gerüst), Altbestand-Specs mit OKLCH-Tokens.
  **Kein Blocker für M2** (umgestuft 2026-08-05) — Design läuft parallel
  bei Tom, gearbeitet wird modulweise mit dem bestehenden Token-Satz; die
  elf Modul-Akzente bleiben unangetastet und weiterhin nicht in
  `tailwind.config.js` gespiegelt.
  A-06-Material: shadcn-Komponenten nutzen `rounded-md` (6 px fest) statt
  der Token-Radien `rounded-token*` — ein Theme steuert die shadcn-Radien
  damit nicht; bei der Design-Entscheidung mitbehandeln.
  Betrifft alle sieben Apps.

- [ ] **A-08: ADR Medienort** — `[read]` Training-Spec nennt Cloudflare R2,
  `[cmd]` der Bestand liegt in Supabase Storage (15 GB, Bucket `exercises`).
  Kostenfolge, und ein Wechsel würde einen Transfer bedeuten.

## B — Entwicklungsumgebung & Absicherung

- [~] **B-20: Codex-Pfadschutz wiederherstellen** (neu 2026-08-06) —
  **Vorarbeit erledigt 2026-08-13 (Block 25), Einhängen bewusst NICHT
  ausgeführt.** Seit B-15 hat Codex keinen Pfadschutz; vorher einen, der
  bei jedem Aufruf am Parser scheiterte — Wirkung null, die Absicht
  bestand.

  **Warum nicht einfach einhängen:** `[cmd]` 2026-08-13 an
  `protect-paths.ps1` gemessen — bei **leerer oder unlesbarer Eingabe
  `exit 0`**, also fail-open. Liefert Codex kein stdin-JSON, steht danach
  eine Konfiguration da, die aussieht wie Schutz und keiner ist. *Das
  wäre schlechter als der heutige Zustand, weil niemand mehr nachsieht.*
  `[annahme]` bleibt deshalb bestehen, bis gemessen: was übergibt Codex?

  **Das Messwerkzeug liegt fertig** —
  `scratchpad/codex-sonde.ps1` (im Sitzungs-Scratchpad, **nicht** in
  `.codex/`): ein Hook, der nichts blockiert und nur mitschreibt, was er
  bekommt (stdin, `args`, Umgebungsvariablen). `[cmd]` Gegen eine
  Testeingabe geprüft, er zeichnet korrekt auf.
  **Nicht eingehängt, weil `.codex/hooks.json` Toms laufende Sitzung
  steuert** — eine kaputte Hook-Konfiguration legt sie lahm.
  Vorgehen, wenn Tom es will: Sonde als dritten `PreToolUse`-Eintrag mit
  Matcher `.*` eintragen, ein paar Aufrufe machen, `%TEMP%\codex-hook-sonde.log`
  lesen, Eintrag wieder entfernen.

  **Was `.codex/hooks.json` heute enthält** `[cmd]`: zwei lean-ctx-Hooks
  (`Bash|bash` → rewrite, eine lange Namensliste → redirect). Codex führt
  Hooks also aus. Die vielen Namensvarianten im Matcher
  (`Read|read|ReadFile|read_file|View|view|…`) sind selbst ein Hinweis:
  wer das schrieb, war sich über Codex' Werkzeugnamen ebenfalls nicht
  sicher.

  **Preis eines Wrappers**, falls die Sonde `param()`-Argumente zeigt:
  eine zusätzliche Datei, die Argumente nach stdin-JSON umformt, plus
  eine zweite Namenszuordnung (Codex-Werkzeugnamen → `Write`/`Edit`/
  `Read`/`Bash`). Zwei Stellen, die auseinanderlaufen können, für einen
  Schutz, der `[cmd]` schon in Claude Code benannte Lücken hat
  (Heredocs, Variablen-Indirektion, Interpreter-Einzeiler). Vertretbar,
  aber keine Kleinigkeit — deshalb erst messen.

  **Die drei ungeschützten Pfade, unverändert offen** `[cmd]` alle drei
  existieren, keiner ist in `protect-paths.ps1` abgedeckt:
  `supabase/config.toml`, `db/migrations/`, `.claude/rules/`.
  *Nebenbefund:* `db/migrations/` trägt genau eine SQL-Datei vom
  2026-04-23 aus der Governance-Ära; die lebende Kette liegt unter
  `supabase/`. Ob der Pfad überhaupt noch geschützt werden muss oder
  eher archiviert gehört, ist ungeklärt.

- [ ] **B-25: Geteilte Sitzung im Produktbereich prüfen** (neu 2026-08-12,
  aus B-12) — B-12 hat die Trennung von `admin` entschieden und belegt.
  **Ungeprüft bleibt die andere Hälfte:** ob die Sitzung zwischen `web`,
  `buddy`, `coach` und `marketplace` tatsächlich geteilt wird
  (`auth-sso` AK-1) und ob eine Abmeldung überall wirkt (AK-5).
  `[cmd]` Derzeit nicht prüfbar: `apps/buddy` und `apps/coach` tragen je
  genau eine Datei (`src/.gitkeep`), `apps/marketplace` existiert nicht.
  Dafür braucht es das produktionsnahe Nachbilden aus dem alten
  B-12-Kern: `hosts`-Einträge und lokale Zertifikate — `[cmd]` eine
  Änderung an Toms System, deshalb nicht eigenmächtig.
  **Wiedervorlage mit der zweiten Produkt-App.** Vorher testet der
  Aufwand etwas, das niemand nutzt.
  *Achtung bei der Umsetzung:* Für den Produktbereich ist Weg A
  vorgesehen (`domain` auf `.lumeos.app`) — und der ist genau der
  umgebungsabhängige Sonderweg, dessentwegen `admin` ihn nicht bekommen
  hat. Vor dem Setzen ist zu klären, wie lokal geprüft wird, sonst
  entsteht wieder eine Konfiguration, die erst beim Deployment auffällt.
  Hintergrund: `docs/ssot/38-cookie-bereich.md` §4 (Weg A steht dort
  bewusst weiterhin ausformuliert).

## C — Produkt: apps/web

- [ ] **C-01: Frontend-Stack-Lücke schliessen** — Reststand korrigiert
  2026-08-05: `[cmd]` **3 von 13 fehlen** (`@dnd-kit/core`, `zustand`,
  `next-pwa`); zehn vorhanden (lucide-react, recharts, framer-motion,
  @radix-ui/react-slot, @tanstack/react-query, react-hook-form, zod,
  date-fns, idb, @types/react-dom). Die alte Angabe „10 von 13 fehlen" ist
  überholt. **Entscheidung: je Feature nachziehen, nicht als Block** — alle
  drei hängen an konkreten Features (Drag-Reihenfolge, Client-State,
  Offline), nicht am Design.
  Dazugekommen 2026-08-05: shadcn-Fundament ohne `init` (components.json von
  Hand, Button als Probe), Abbildung ausschliesslich als Config-Aliase auf
  die bestehenden Tokens — null neue CSS-Variablen.

- [ ] **C-03: WP-02 Diary-Verdrahtung** — **nicht mehr blockiert**
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

- [ ] **C-06: WP-05 erstes Mock-Modul echt machen** — Kandidat Goals.
  *Vorher die 2 kritischen Bugs aus `docs/specs/Goals/OPEN_ITEMS.md` klären
  (Adaptive-TDEE Cross-Schema, Contribution-Timing).*

- [ ] **C-08: `services/nutrition-api` einordnen** — angepasst 2026-08-04:
  Hono-Service, 4 Dateien, von niemandem importiert; seit der
  Governance-Archivierung einer von **vier** lebenden Workspace-Packages
  (`10-workspace.md`). `apps/web` greift inzwischen per supabase-js/rpc()
  direkt zu (M1 Teil C), nicht mehr per Docker-SQL.
  *Antwort Tom: Teil des Endausbaus.* Rahmen dafür jetzt in
  ADR-0001-datenzugriff (A-07): Services als begründete Ausnahme.
  **Stand nach B-21 (2026-08-06) — der Punkt bleibt offen, aber die
  Ausgangslage hat sich geändert:** Die Wahl aus B-21 lautete „prüfen
  oder Skripte entfernen"; gewählt wurde **prüfen**, gerade weil C-08 den
  Dienst als Teil des Endausbaus führt. `[cmd]` Der Dienst typecheckt und
  baut jetzt wirklich (4 von 4 Dateien, vorher 0). Die Prämisse dieses
  Punktes hält unverändert: `[cmd]` `git grep` auf `nutrition-api` über
  `apps/` und `packages/` liefert **0 Importe**. Zu entscheiden bleibt
  also die Einordnung (verdrahten oder verwerfen), nicht mehr die Frage,
  ob das Gate ihn erfasst.

  **Entscheidung 2026-08-06 (Tom, Block 14): bleibt liegen.**
  Damit die Frage beim nächsten Mal nicht bei null anfängt, hier der
  vollständige Befund und die Kostenliste.

  **Wiedervorlage geprüft 2026-08-07 (Block 18) — Bedingung NICHT
  erfüllt, der Punkt bleibt liegen.** Die Wiedervorlage war an „mit C-06
  (Goals)" geknüpft; mit Training existiert jetzt ein zweites Modul, also
  war zu prüfen, ob die Bedingung sinngemäss schon zutrifft.
  `[cmd]` Sie trifft **nicht** zu, und zwar aus einem konkreten Grund:
  **Training hat gar keinen Anwendungspfad.** E-12 hat bewusst nur Schema
  und Seed gebaut — `[cmd]` in `apps/web/src` gibt es zu Training nur
  Shell-Navigation und CSS-Klassen, keinen Datenzugriff.
  Ein Dienst lässt sich nicht daran einordnen, wie ein Modul zugreift, das
  noch gar nicht zugreift.

  **Nebenbefund, der die Frage später vergrössert** `[cmd]` 2026-08-07:
  `services/` enthält **13 Verzeichnisse**, darunter `training-api`,
  `goals-api` und elf weitere. **Nur `nutrition-api` ist ein Dienst** —
  8 `.ts`-Dateien, eine `package.json`. Die anderen **12 sind leere
  Gerüste**: je ein `src/.gitkeep`, sonst nichts.
  *Aus der Existenz eines Verzeichnisses folgt kein Dienst.* Die
  Einordnungsfrage betrifft also nicht einen Dienst, sondern ein Muster —
  und die Antwort auf `nutrition-api` legt fest, was mit zwölf weiteren
  Platzhaltern geschieht. Das erhöht den Wert der Entscheidung, ändert
  aber nichts an ihrer Wartebedingung.
  **Nächste echte Wiedervorlage: wenn C-06 (Goals) einen Anwendungspfad
  bekommt** — oder wenn Training über UI/API zugreifen soll.

  **Was drinsteht** `[cmd]` 2026-08-06: 122 Zeilen in 4 Dateien,
  **8 TODO-Marker**, jede Route liefert eine leere Antwort
  (`{ results: [] }`, `{ meals: [] }`, `{ days: [] }`).
  `@supabase/supabase-js` ist als Abhängigkeit deklariert, `[cmd]` aber
  **nirgends im Quellcode benutzt**. `MealItemSchema` kennt vier
  Mahlzeittypen, `[cmd]` der Live-CHECK auf `nutrition.meals` deren
  sieben.

  **Überschneidung** `[cmd]`: `/food/search` gegen
  `/api/nutrition/foods`, `/meals` und `/diary` gegen das, was C-03/C-04
  in `apps/web` gebaut haben. Der Dienst bildet Endpunkte nach, die heute
  bereits bedient werden — nur leer.

  **Was ADR-0001 wirklich sagt** `[read]`: nicht „Teil des Endausbaus"
  als Freibrief, sondern wörtlich „**kein Vorbild, sondern ein
  unverdrahteter Vorgriff. Sein Verbleib ist offen.**" Die dortige
  Ausnahme für Services gilt, wo etwas *nicht* in die Datenbank gehört
  (Wearables, Zahlungen, Modellaufrufe für Buddy, lange Importe) —
  nichts davon tut dieser Dienst.

  **KOSTENLISTE — Liegenlassen ist seit B-21 nicht mehr gratis** `[cmd]`:
  | Posten | Beleg |
  |---|---|
  | eigene `tsconfig.json` | 26 Zeilen, nur für diesen Dienst |
  | `@types/node` als devDependency | nur nötig, damit er typecheckt |
  | läuft im Gate mit | `build` **und** `typecheck` je Lauf |
  | bei jeder TypeScript-Anhebung mit anzufassen | für Code, der nichts tut |

  **Empfehlung (Claude), falls die Frage wieder aufkommt: Rückbau —
  aber schwächer als bei C-07.** Er ist nur *leer*, nicht *falsch*; er
  behauptet nichts Unwahres. Ein 122-Zeilen-Gerüst aus TODOs steht in
  einer Stunde neu, sobald Modulunabhängigkeit (Toms Grund für Zielbild B
  in ADR-0001) wirklich ansteht. Bis dahin zahlt das Repo die
  Kostenliste oben für Attrappen-Endpunkte.
  Wiederherstellbar wäre er `[cmd]` in jedem Fall: seit 2026-04-23 in der
  Historie, `git revert` genügt.

- [ ] **C-16: Training hat dasselbe Wortschatzproblem — eine Runde
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

- [ ] **C-17: Suchlaufzeit — 547 ms bei zweiwortigen Anfragen** (neu
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

- [ ] **C-18: Fehlsuchen mitschreiben** (neu 2026-08-14). Der nächste
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

- [ ] **C-20: Treffer am Wortanfang schlägt Treffer in der Wortmitte**
  (neu 2026-08-14). **Der grösste verbliebene Hebel für die Relevanz.**

  `[cmd]` Gemessen an sechs Anfragen:

  | Anfrage | Platz 1 heute |
  |---|---|
  | `butter` | Limabohne (**Butter**bohne Mondbohne) |
  | `lachs` | Alaska-Pollack/Alaska-See**lachs** |
  | `kuerbis` | **Kürbis**kern |
  | `huhn` | Suppen**huhn**, Reb**huhn**, Perl**huhn** |

  Die Suche vergleicht mit `LIKE '%tok%'` — ein Treffer **innerhalb**
  eines längeren Wortes zählt genauso viel wie das ganze Wort. `[cmd]`
  Der `huhn`-Fall steht seit `41-…` fest: 31 Treffer, und das gesuchte
  Brustfilet war nicht dabei. *Eine Trefferzahl über null ist noch kein
  Fund.*

  Vorschlag: drei Stufen statt einer — ganzes Wort, Wortanfang,
  Wortmitte. Vor dem Bauen messen, nicht danach.

  ---

  `[cmd]` **Nachgemessen 2026-08-14 am Anker `7b5e631`** — der Punkt ist
  kleiner geworden, aber nicht weg. Von den vier Faellen der Tabelle ist
  einer geloest, drei stehen unveraendert:

  | Anfrage | Platz 1 heute |
  |---|---|
  | `huhn` | **Haehnchen Brustfilet, roh** — geloest |
  | `butter` | Buttermilchpulver |
  | `lachs` | Lachsrogen roh (Lachs roh steht auf 2) |
  | `kuerbis` | Kuerbiskern |

  Die Zubereitungsstufe aus C-25 hat die Wortmitte nicht angetastet —
  sie sortiert innerhalb der Treffermenge, das Problem liegt darin, dass
  ein Treffer *im* Wort so viel zaehlt wie das ganze Wort. Der Vorschlag
  von drei Stufen (ganzes Wort, Wortanfang, Wortmitte) steht unveraendert.

- [ ] **C-22: Phonetische Schreibvarianten** (neu 2026-08-14). Eine
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

- [ ] **C-23: Systematische Abdeckungsmessung statt handverlesener
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

- [ ] **C-24: Halbfertigprodukte ranken als Grundzutat** (neu 2026-08-14).
  Dritte Ursache der Rangfolgelücke, unabhängig von C-20 und C-21.

  `[cmd]` `kartoffelstock` liefert:

  ```
  1. Kartoffelpüree Instantpulver              gew 450  (K)
  2.-7. Gemüse-Kartoffel-Brei, Babynahrung     gew   0  (X)
  8. Kartoffelbrei mit Milch 3,5 % Fett        gew   0  (X)
  ```

  **Niemand isst Instantpulver.** Die Regel „Grundzutat vor Gericht", die
  bei `hähnchen brust` genau richtig ist, dreht hier ins Gegenteil:
  `sort_weight` unterscheidet **Rohstoff gegen Gericht**, nicht
  **verzehrfertig gegen zuzubereiten**. Ein Instantpulver liegt in
  Warengruppe K wie eine Kartoffel, ist aber keine Mahlzeit.

  `[cmd]` **73 Halbfertigprodukte** im Bestand (Instantpulver,
  Backmischung, Granulat, Konzentrat, Trockenprodukt), Durchschnittsgewicht
  **369**. Die zubereiteten Formen desselben Produkts liegen in X/Y bei 0:

  ```
  Kartoffelpüree Instantpulver                              450
  Kartoffelpüree, zubereitet aus Instantpulver und Milch      0
  Kartoffelpüree mit Milch 3,5 % Fett                         0
  ```

  **Die Falle vor der Umsetzung:** `[cmd]` `Sojaschnetzel/Sojagranulat,
  texturiert, trocken` hat Gewicht 770 — eine echte Zutat, die man kauft
  und kocht, kein Instantpulver. Ein Namensmuster auf `granulat` oder
  `trocken` erwischt sie mit. Dieselbe Fallenklasse wie
  „`600` = geräuchert", die bei den Zubereitungsfiltern zugeschnappt wäre:
  **ein Muster, das für die Mehrheit stimmt, ist noch keine Regel.**

  Vorgehen: die 73 einzeln durchsehen, nicht über ein Muster erschlagen.
  Bei dieser Zahl ist Handarbeit billiger als eine Regel mit Ausnahmen.

  Nebenbefund `[cmd]`: Bei `kartoffelbrei` belegen **sechs von sieben**
  Plätzen Babynahrung („Gemüse-Kartoffel-Brei, ohne Salz, geeignet für…").
  Ob Babynahrung in einer Athleten-App überhaupt in den Ergebnissen
  auftauchen soll, ist eine eigene Frage — sie hat einen eigenen
  BLS-Bereich (X5B…) und liesse sich ausblenden wie die Gerichte.

  `[cmd]` Nachgemessen 2026-08-14: `kartoffelstock` liefert jetzt
  `Kartoffel-Gemuesesuppe mit Gemuesebruehe` auf Platz 1 statt des
  Instantpulvers — **anders falsch, nicht besser**. Der Punkt steht
  unveraendert: `sort_weight` unterscheidet Rohstoff gegen Gericht, nicht
  verzehrfertig gegen zuzubereiten.

- [ ] **C-27: Alltagswörter ohne Treffer — noch zwei** (neu 2026-08-14,
  `[cmd]` Null Treffer für `huettenkaese`, `walnuesse`, `blaubeeren`.
  Alle drei stehen im Bestand unter anderem Namen:

  | getippt | im Bestand |
  |---|---|
  | `huettenkaese` | `Körniger Frischkäse < 10 % Fett i. Tr.` (M711100) |
  | `walnuesse` | `Walnuss` (H120100) |
  | `blaubeeren` | `Heidelbeere roh` (F304100) |

  Dazu aus derselben Messung ohne Treffer: `basmatireis`, `vollkornreis`,
  `vollkornnudeln`, `griechischer joghurt`.

  Das sind keine Mundartformen — es sind Wörter, die jeder Kraftsportler
  täglich benutzt. Genau dafür ist die Synonymschicht da; `[cmd]`
  OpenThesaurus kennt sie nicht, sie gehören zu den 12 Brücken von Hand.
  Beim Ergänzen die Häufigkeitsliste aus `daten/wortschatz-luecke.json`
  danebenlegen — dort stehen 1.581 weitere Kandidaten nach Häufigkeit.

  `[cmd]` **Nachgemessen 2026-08-14, groesstenteils geschlossen.**
  `huettenkaese`, `walnuesse`, `blaubeeren` stehen jetzt je auf Platz 1;
  `vollkornreis` -> `Reis unpoliert, roh` und `vollkornnudeln` ->
  `Vollkorneierteigwaren roh` ebenfalls. **Offen bleiben zwei:**
  `basmatireis` und `griechischer joghurt`, beide weiterhin null Treffer.

- [ ] **C-33: Der Zubereitungsschlüssel ist warengruppenabhängig — die
  Ursache hinter C-28** (neu 2026-08-14). **Ersetzt die vierstellige
  Gruppierung. Voraussetzung für C-29, C-30, C-31, C-32.**

  `[cmd]` **Die zehn im Bericht genannten Mischungen sind nicht chaotisch
  — sie sind über die Stellen 5–7 sauber getrennt:**

  | Code | Einträge | Stellen 5–7 |
  |---|---|---|
  | `F201100` | Aprikose roh | `100` |
  | `F201400` | Aprikose getrocknet | `400` |
  | `F201600` | **Aprikosensaft** | `600` |
  | `F603600` | **Orangensaft** | `600` |
  | `F603700` | **Orangennektar** | `700` |
  | `M710100` | Skyr | `100` |
  | `M710700` | **Frischkäsezubereitung** | `700` |

  Der Saft trägt `600`, der Nektar `700`. **Die Information, die der
  vierstellige Code nicht trägt, steht an den Stellen 5–7** — sie wurde
  nur als „Zubereitung" gelesen und deshalb beim Gruppieren ignoriert.

  **Der eigentliche Befund, und er korrigiert eine SSOT-Aussage:**
  `[cmd]` **Die Bedeutung der Stellen 5–7 hängt von der Warengruppe ab.**
  Code `600` heißt

  | Warengruppe | `600` bedeutet | Einträge |
  |---|---|---|
  | `F` Obst | **Saft** (Apfelsaft, Orangensaft, Traubensaft) | 53 |
  | `G` Gemüse | **Saft** (aus Karotte, aus Tomate, aus Sauerkraut) | 10 |
  | `T` Fisch | geräuchert | 24 |
  | `H` Nüsse | geröstet | 11 |
  | `M` Käse | Fettstufe/Sorte | 34 |

  `[cmd]` Ebenso `400`: bei Obst **getrocknet**, laut Tabelle global
  „Konserve". **`docs/ssot/44-bls-codestruktur.md` ist damit an dieser
  Stelle falsch** — die dortige Tabelle ist eine globale Aggregation und
  gilt für Obst und Gemüse nicht. Sie ist zu korrigieren, bevor jemand
  sie als Regel liest. *Aus der Häufigkeit einer Bedeutung folgt nicht
  ihre Allgemeingültigkeit.*

  **Was zu tun ist:**

  1. **Nachsehen wurde versucht und ist erledigt — negativ.** `[cmd]`
     `docs/ssot/daten/BLS_4_0_Dokumentation_DE.pdf`, Abschnitt 2.4
     „BLS Code-Systematik", sagt nur: alphanumerischer Schlüssel der
     Form `[Buchstabe][6 Ziffern]`, führender Buchstabe gleich
     Hauptgruppe, dazu **ein** Beispiel. **Eine Schlüsselliste der
     Stellen 5–7 gibt es dort nicht.** Die Klassifikation muss deshalb
     aus dem Bestand abgeleitet werden — und weil sie abgeleitet ist,
     muss jede Zeile einen Beleg tragen: alle 53 Einträge mit `F…600`
     heissen „…saft", das belegt die Bedeutung. Was sich nicht so
     belegen lässt, bleibt ungeklärt und wird als solches ausgewiesen.
  2. Je Warengruppe die Codes in zwei Klassen teilen: **dieselbe Art,
     andere Zubereitung** (roh, gekocht, tiefgefroren, geräuchert) gegen
     **anderes Erzeugnis** (Saft, Nektar, Mehl, Pulver, Zubereitung).
     `[cmd]` Der Umfang ist überschaubar: **652 Kombinationen aus
     Warengruppe und Zubereitungscode, davon 204 mit mindestens zehn
     Einträgen** — diese 204 decken 5.776 der 7.140 Einträge ab. Die
     Klassifikation ist also eine Liste von rund 200 Zeilen, nicht von
     652.
  3. Die Gruppierung neu bilden: vier Stellen **plus** Erzeugnisklasse.
     Dann trennen sich Aprikose und Aprikosensaft, während Lachs roh und
     Lachs geräuchert zusammenbleiben.
  4. **Dieselbe Messung wie C-28 wiederholen, gleiche Stichprobe,
     gleiche Abnahme von 95 von 100.** Ohne diesen zweiten Lauf ist die
     Reparatur eine Behauptung.

  **Was das nicht löst und was offen bleibt:** `[cmd]` `P273`
  (Roséwein `000` gegen Rotling `100`) und `W154` (Schinkenmettwurst
  `000` gegen Salami `500`) benutzen die Stellen 5–7, um verschiedene
  Erzeugnisse zu unterscheiden — dort trennt keine Klasse, dort bleibt
  Kuration. `[annahme]` Wie viele der 50 echten Mischungen zur einen und
  wie viele zur anderen Sorte gehören, ist **nicht gemessen**. Das ist
  die erste Zahl, die der neue Lauf liefern muss.

  **Auch zu klären:** `[cmd]` 953 Gruppen ohne Vertreter. Ein
  Gattungsname braucht keinen Rohzustand — Pumpernickel ist Pumpernickel.
  Die Vertreterregel muss einen dritten Fall kennen: höchstes
  `sort_weight` innerhalb der Gruppe.

- [ ] **C-34: Einträge, die der BLS nicht kennt** (neu 2026-08-14).
  Unabhängig vom Suchumbau, aber die Entscheidung über den Codebereich
  fällt jetzt, nicht später.

  **Anlass** (Tom, 2026-08-14): Neue Spalten und neue Einträge in
  `nutrition.foods` sind unproblematisch, ein gezieltes Update-Skript
  ersetzt das heutige Überschreiben. Daraus die Frage, ob man Sorten
  durch **Kopieren** eines BLS-Eintrags abbilden könnte — weisser Reis
  kopiert und der Code erweitert.

  **Kopieren für Sorten: nein.** `[cmd]` `C352000` trägt **101
  Nährwerte**; fünf Sorten mal drei Zubereitungen wären 15 Einträge und
  1.515 Werte **ohne eine einzige neue Messung**. `[cmd]` `data_source`
  kennt heute genau zwei Werte, beide auf die amtliche Arbeitsmappe
  zurückführbar — das ist der Grund, warum der Abgleich 353 Abweichungen
  fand und alle als Rundungen erklären konnte. Kopien erzeugen Werte
  ohne Quelle; der nächste Abgleich meldet dann Abweichungen, die keine
  sind. Sorten ohne eigene Messwerte gehören in die **Aliasschicht**.
  Und der BLS-Code ist seit C-28/C-33 tragende Struktur — ein erweiterter
  Code ist dort ein Fremdkörper.

  **Eigene Einträge für echte Lücken: ja**, und sie kommen sicher:
  Supplements (Whey, Kreatin), thailändische Küche — `[cmd]` `name_th`
  ist bei allen 7.140 Einträgen leer, und MealCam wird in Thailand
  betrieben. Der BLS deckt das nicht ab und wird es nie.

  **Zu entscheiden, bevor der erste Eintrag entsteht:**
  - eigener Codebereich, **klar vom BLS getrennt** — kein erweiterter
    BLS-Code, keine freie Vergabe im BLS-Raum
  - eigener `data_source`-Wert je Quelle, damit der Abgleich gegen die
    Arbeitsmappe weiterhin sauber zwischen amtlich und eigen trennt
  - Umgang mit der Architekturentscheidung „BLS 4.0 als einzige
    Datenquelle": eigene Einträge sind eine **benannte Ausnahme** mit
    eigener Quelle, keine stille Aufweichung
  - Verhalten in Suche und Sortierung: rangieren eigene Einträge gleich,
    davor oder dahinter?

- [ ] **C-29: Drei Namensschichten und eine Kuration, die den
  Kettenlauf überlebt** (neu 2026-08-14). Setzt C-28 voraus.

  **Zwei Befunde, die das nötig machen:**

  `[cmd]` **Der heutige Importschritt überschreibt jede Handarbeit.**
  `supabase/_pipeline/03_bls_import/030_apply_local.sql:48` trägt
  `on conflict (bls_code) do update set … name_display = excluded.name_display`.
  Jeder Aufbau — und der läuft in unter zehn Sekunden, also oft — setzt
  den CSV-Wert zurück.

  **Das ist keine Eigenschaft der Kette, sondern dieses einen Skripts**
  (Tom, 2026-08-14). Neue BLS-Codes kommen dazu, Quellwerte ändern sich
  gelegentlich — ein Schritt, der **gezielt** aktualisiert und kuratierte
  Felder unangetastet lässt, löst das sauber. Was bleibt, ist eine
  Reihenfolge: **dieses Skript wird umgebaut, bevor der erste Name
  kuriert wird.** Solange es unverändert läuft, ist jede Handarbeit beim
  nächsten Aufbau verloren.

  `[cmd]` **Die Anzeigespalten sind heute reine Kopien.** `name_display`
  ist bei **7.140 von 7.140** identisch mit `name_de` — null Abweichungen.
  `name_display_en` ist identisch mit `name_en`, `name_display_th` und
  `name_th` sind durchgehend leere Zeichenketten. Die Spalten tragen
  keine Information; sie sind Platzhalter für genau diese Arbeit.

  **Die drei Schichten:**

  | Schicht | Inhalt | editierbar | Zweck |
  |---|---|---|---|
  | Quellname `name_de`/`name_en` | amtlicher BLS-Wortlaut | **nein** | Prüfbarkeit gegen die Arbeitsmappe |
  | Gattungsname (je Art) | wie der Mensch sie nennt | ja | Anzeige und Sortierung |
  | Suchnamen `food_aliases` | alle Schreibweisen | ja | was gefunden wird |

  `name_de` bleibt unveränderlich. `[cmd]` Der Bestand ist gegen die
  amtliche Arbeitsmappe verifiziert — 698.092 Werte, 353 Abweichungen,
  alle Rundungen. Diese Prüfbarkeit hängt am unveränderten Wortlaut. Wer
  den Quellnamen überschreibt, kann nie wieder gegen die Quelle prüfen.

  **`name_en` ist der maschinelle Startwert** (Befund 2026-08-14 am
  Reis-Fall). `[cmd]` Der englische BLS-Name ist durchgängig
  menschenlesbarer als der deutsche: `Reis poliert, roh` heißt dort
  **White rice raw**, `Reis unpoliert` heißt **Brown rice**. Die
  deutsche Fachsprache des BLS (poliert/unpoliert) hat im Englischen
  keine Entsprechung. Der Gattungsname ist damit für einen grossen Teil
  des Bestands keine Erfindung, sondern eine Übersetzung aus einem Feld,
  das bereits vorhanden ist — Handarbeit fällt nur dort an, wo auch das
  Englische Fachsprache bleibt. Vor der Kuration zu messen: bei wie
  vielen Arten weicht `name_en` inhaltlich von `name_de` ab und ist
  dabei das gebräuchlichere Wort.

  **Umfang:**
  - Override-Tabelle je Art, angewandt in einem Kettenschritt unter
    `02_human_layer/` — nach dem Import, wie `024_suchsynonyme.sql` es
    bereits vormacht.
  - Umbenennung `name_display` → `name_display_de`. `[cmd]` 246
    Vorkommen in 32 Dateien. Ein eigener Commit, keine Vermischung.
  - **Offene Entscheidung für Tom:** Erzeugt ein gepflegter Gattungsname
    automatisch einen Alias, oder nur einen Vorschlag zum Bestätigen?
    Automatisch ist bequemer, aber eine Zuordnung wie „Hüttenkäse" auf
    einen Frischkäse ist eine inhaltliche Aussage, die falsch sein kann.

- [ ] **C-30: Suche und Trefferliste auf Arten umstellen** (neu
  2026-08-14). Setzt **C-33** und C-29 voraus — C-28 in der
  vierstelligen Form ist gemessen und gefallen.

  Die Trefferliste zeigt Arten mit ihrem Vertreter, die Zubereitungs-
  varianten hängen darunter. Damit wird die Rangfolge eine Frage
  zwischen **Arten**, nicht mehr zwischen 132 Zeilen.

  **Was dabei strukturell mitfällt, ohne eigene Regel:**
  - **C-20** (Treffer in der Wortmitte): Ein Treffer im Gattungsnamen
    schlägt einen Treffer im Qualifikator. `Kürbiskern` ist eine andere
    Art als `Kürbis`.
  - **C-24** (Halbfertigprodukte): `Kartoffelpüree Instantpulver` ist
    eine eigene Art, nicht die Kartoffel.
  - **C-19/C-21** sind über denselben Weg bereits erledigt (Block 32) —
    das ist der Beleg, dass Eingriffe auf der Bestandsseite mehr tragen
    als weitere Wortlisten auf der Anfrageseite.

  **Abnahme: 34 von 37 im MealCam-Maßstab** (heute 31). Nicht 37 —
  `[cmd]` mindestens zwei der sechs Restfälle sind keine Suchprobleme:
  `milch` → Vollmilch 3,5 % ist eine Produktentscheidung, `erdnussbutter`
  → Erdnussmus eine Bedeutungsfrage. Beide gehören in einen Override,
  nicht in eine Sortierregel.

  **C-17 (Laufzeit) gehört hierher**, nicht davor: wenn die Bedingung
  ohnehin umgebaut wird, wird der Ausdrucks-Index in demselben Zug
  passend gelegt.

- [ ] **C-31: Admin-Oberfläche für die Kuration** (neu 2026-08-14).
  Setzt C-29 und C-30 voraus — bewusst **zuletzt**. `[cmd]` Der Umfang
  ist seit C-28 beziffert: **468 Arten** mit unbrauchbarem Namen, nicht
  rund 2.000 Einträge.

  Die Oberfläche kuriert **Gattungsnamen je Art**, nicht Einzelnamen je
  Eintrag, und schreibt in die Override-Tabelle aus C-29, niemals direkt
  in `nutrition.foods`.

  **Warum nicht zuerst, obwohl Tom dort beginnen wollte:** C-28 bis C-30
  sind Schema- und Vertragsfragen. Eine Oberfläche vor dem Vertrag wird
  zweimal gebaut — und eine Oberfläche auf `name_display` würde Handarbeit
  produzieren, die der nächste Kettenlauf verwirft.

  Priorisierung der Kurationsarbeit, solange C-18 (Fehlsuchen
  mitschreiben) nicht steht: die Häufigkeitsliste aus
  `daten/wortschatz-luecke.json` (1.581 Kandidaten) und die 37 Zutaten
  des MealCam-Maßstabs.

- [ ] **C-32: Reis vollständig kurieren — der erste Fall, an dem sich das
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



## D — Datenbank & Specs

### Übrige DB-Punkte

- [~] **D-05: Spec-Audit** — **zwei Durchgänge geleistet, Überführung offen.**
  1. **Struktur** (2026-08-02): `docs/ssot/70-spec-audit/00-INDEX.md` — je
     Modul eine Akte, modulübergreifende Widersprüche verifiziert.
  2. **Feldabgleich** (2026-08-07, Block 18):
     `docs/ssot/70-spec-audit/01-feldabgleich.md` — die im ersten Durchgang
     ausdrücklich ausgelassene Folgearbeit.
     `[cmd]` **4 Module vollständig** (Training, Nutrition, Goals,
     WebPlatform), **9 nur eingestuft**. Grenze benannt statt überschritten:
     `[cmd]` 161 Dateien, 48.633 Zeilen passen nicht in einen Durchgang.

  **Der härteste Fund ist ein Muster, kein Modulproblem** `[cmd]`: **14
  `FOR ALL`-Policies in vier Modulen** (Buddy 8, Marketplace 3, HumanCoach 2,
  Nutrition-SQL 1) mit `USING`, aber **ohne `WITH CHECK`** — beim INSERT wird
  `USING` nicht ausgewertet, die Policy erlaubt also das Einfügen fremder
  `user_id`. Dazu `::text`-Casts auf UUID-Spalten. **Das steht dort als
  Hausstil**: wer ein weiteres Modul „nach Spec" baut, baut das Leck erneut
  ein. *Regel in die Konventionen, bevor irgendetwas überführt wird.*

  **Zwei Korrekturen an bisherigen Annahmen** `[cmd]`:
  - Training/SPEC_06 trägt **keine** `FOR ALL`-Policies — seine 16 Policies
    sind operationsgetrennt. Das Leck liegt in den vier Modulen oben.
  - `nutrition_targets` steht **nicht** in den Goals-Specs (dort 0 Treffer),
    sondern in **Nutrition** SPEC_06 §14, „gecacht von Goals". **C-05 wartet
    damit auf eine Nutrition-Tabelle, nicht auf das Goals-Schema** — der
    kleinere Schritt. Siehe auch C-05.

  **Empfehlung (Toms Entscheidung):** Ordner **nicht** löschen und **nicht**
  als Ganzes überführen, sondern modulweise ausschlachten — Reihenfolge
  Goals → `nutrition_targets` → Trainingsbetrieb (12 Tabellen, nur dort) →
  Medical. Je Modul erst archivieren, wenn sein Inhalt in
  `docs/spezifikation/` steht. Kopfhinweis „Altbestand, kein Sollwert" in
  `docs/specs/`, sonst werden die Bestandszahlen wieder als Ist gelesen.
  **In Block 18 wurde nichts verschoben, gelöscht oder überführt.**

## E — Legacy-Cloud-Instanz (LumeOS-V2)

*`[cmd]` Stand 2026-08-14: D-12 ist erledigt, E-01 bis E-03, E-05, E-06,*
*E-11, E-12, E-13 und E-16 ebenfalls. Die Bestandszahlen unten stammen*
*vom 2026-08-01 und beschreiben die Legacy-Instanz, nicht den Ist-Stand*
*des Repos — der Trainings-Teil liegt seit 2026-08-07 lokal im Schema*
*`training`. Nächster Schritt ist E-08.*

**Ausgangslage:** Supabase-Cloud-Instanz `LumeOS-V2` (Org `dev-lumeos`, **Pro-Plan,
wird bezahlt**, Branch `main` = Production, erreichbar). Testprojekt mit Dummydaten
aus einer früheren LumeOS-Version. Entweder wir nutzen sie oder sie wird gelöscht —
Entscheidung Tom: nutzen und passend konfigurieren.

**Bestand, `[cmd]` gemessen 2026-08-01:**

| Posten | Wert |
|---|---|
| Storage-Bucket `exercises` | 10.776 Objekte, **15 GB**, `public: true` |
| `public.exercises` | 1.448 Zeilen |
| `public.exercise_muscles` | 6.398 Zuordnungen über 1.362 Übungen, 149 Muskelgruppen |
| `public.equipment` | 61 Einträge, **kein** `equipment_id` NULL |

**Medienabdeckung je Übung:**

| Feld | Vorhanden | Anteil |
|---|---|---|
| `instructions` | 1.448 | **100 %** |
| `tips` | 1.444 | 99,7 % |
| `image_male_start` | 1.370 | 95 % |
| `video_url` | 1.274 | 88 % |
| `image_male_end` | 737 | 51 % |
| `image_female_start` / `_end` | 186 | **13 %** |
| ganz ohne Medien | 40 | 2,8 % |
| ohne Muskelzuordnung | 86 | 5,9 % |

**Der eigentliche Wert sind die Texte, nicht die Dateien.** `instructions` und
`tips` sind ausformulierte, mehrschrittige Anleitungen mit 100 % Abdeckung —
der Posten, der bei Neuerzeugung am teuersten wäre. Danach kommen die 6.398
Muskelzuordnungen (Fachwissen, normalisiert) und erst dann die 15 GB Medien.

`[read]` Medien-URLs sind absolut und öffentlich:
`https://<ref>.supabase.co/storage/v1/object/public/exercises/videos/<Kategorie>/<datei>.mp4`

`[read]` Die Muskelzuordnung ist normalisiert in `public.exercise_muscles`
(`exercise_id`, `muscle_group_id` UUID-FK, `role` primary/secondary).
Die `text[]`-Spalten `primary_muscles`/`secondary_muscles` in `exercises` sind
ein veraltetes Duplikat mit uneinheitlichen Strings — **nicht als Quelle nutzen.**

### Was Supabase-Branching nicht kann

`[read]` Offizielle Doku, geprüft 2026-08-01. Drei Punkte, die das Vorgehen bestimmen:

1. **`main` bleibt Produktion, unwiderruflich.** Welcher Branch als
   Produktions-Branch dient, lässt sich nicht ändern — das Basis-Projekt bleibt
   immer Produktion. „Dev bauen und daraus `main` generieren" ist nicht möglich.
   Die Richtung ist fest: Branch → Merge → Migrationen laufen auf `main`.
2. **Branches enthalten keine Daten.** Ein Branch ist eine Kopie des Projekts
   abzüglich der Daten; befüllt wird über `seed.sql`.
3. **Branches haben eigenen Storage.** Jede Branch-Instanz enthält alle
   Supabase-Dienste isoliert — **ein Dev-Branch hätte kein `exercises`-Bucket.**
   Gegen die 15 GB liesse sich dort nicht testen.

**Kosten:** Preview-Branches werden auf Pro stundenweise abgerechnet. Ein
dauerhaft laufender Dev-Branch kostet laufend; ein Branch je Pull Request,
der wieder verschwindet, kostet fast nichts.

### Vorgehen

`main` wird **umgebaut, nicht ersetzt** — die 15 GB und die 1.448 Übungen sind
der Grund, das Projekt zu behalten. Was „dev neu bauen" wäre, passiert lokal:
dort gibt es `supabase db reset`, kostenlos und beliebig oft.

- [ ] **E-04: Alte `public`-Tabellen nach `legacy` verschieben** — nicht löschen.
  Kostet nichts, macht `public` frei für unsere Schemas, und die Daten bleiben
  greifbar. Bucket und `auth` bleiben unangetastet.
  **ABGEWERTET 2026-08-07 (Block 16) — bleibt offen, ist aber kein Blocker
  und keine Dringlichkeit mehr.** Zwei Messungen nehmen dem Punkt sein
  Gewicht:
  1. `[cmd]` (E-03) An den vier Übernahmekandidaten hängt **nichts** —
     keine Fremdschlüssel, Trigger, Sichten, Funktionen oder Policies. Die
     Warnung „`ALTER TABLE … SET SCHEMA` kann genau diese brechen" hat
     hier kein Ziel: es gibt nichts zu brechen.
  2. `[cmd]` (E-01) **132 von 166 Tabellen in `public` sind leer**, nur 34
     tragen Daten. Der Aufräumgewinn ist damit kleiner, als die Zahl 166
     vermuten liess — verschoben würden überwiegend leere Hüllen.
  **Wer diesen Punkt künftig liest: er blockiert nichts.** Er ist Kosmetik
  an einer Instanz, die ohnehin umgebaut wird, und gehört hinter E-05
  (Mapping) und E-08 (Deployment) eingereiht, nicht davor.

- [ ] **E-07: Lücke weibliche Darstellungen entscheiden** — 186 von 1.448
  Übungen (13 %). Bewusster Verzicht oder Produktionsauftrag über 1.262 Übungen?
  *Gehört in die Produktentscheidung, nicht in eine Fussnote.*
  **`[cmd]` 2026-08-07 gegen die laufende Instanz bestätigt: genau 186.**
  Die Zahl stimmt, sie war keine Schätzung. Aufschlüsselung:
  `image_female_start` 186, `image_female_end` 186 — dieselben Übungen,
  beide Felder gefüllt oder beide leer. Zum Vergleich `image_male_start`
  1.370 (95 %), `video_url` 1.274 (88 %), ganz ohne Medien 39 (2,7 %).
  Die Entscheidung bleibt offen; die Datenlage ist jetzt belegt.

  **Regel entschieden 2026-08-07 (Tom): Ist der Nutzer weiblich, wird die
  weibliche Darstellung gezeigt; fehlt sie, die männliche.**
  Umsetzung wartet auf die Nutzerverwaltung — kein neuer Auftrag heute.

  `[cmd]` 2026-08-07 gegen den Live-Bestand geprüft: Die Regel ist heute
  **nicht umsetzbar** und in der vorliegenden Form **unvollständig**.
  Beides gehört vor die Umsetzung, nicht danach.

  1. **Es gibt kein Geschlecht.** `public.profiles` trägt genau drei Spalten
     (`id`, `created_at`, `updated_at`); `[cmd]` kein Treffer auf
     `gender`/`sex`/`geschlecht` in `apps/`, `packages/` oder
     `supabase/_pipeline/`. Die Bedingung hat keinen Wert, den sie lesen
     könnte. Das Feld gehört zum Onboarding und damit zur Nutzerverwaltung.
  2. **Der Rückfall muss in beide Richtungen gehen.** `[cmd]` Genau **eine**
     Übung trägt ausschliesslich eine weibliche Darstellung ohne männliche —
     dort bekäme ein männlicher Nutzer nichts.
  3. **Es gibt einen dritten und vierten Fall.** `[cmd]` 37 Übungen haben
     Medien, aber kein Bild (nur Video); 39 haben gar keine Medien.

  Vollständige Regel, wie sie umzusetzen wäre: gewünschtes Geschlecht
  vorhanden → nimm es; sonst anderes Geschlecht vorhanden → nimm das; sonst
  Video vorhanden → nimm das; sonst kein Medium, und die Oberfläche sagt es.

  **Zahlenkorrektur `[cmd]` 2026-08-07:** Die oben belegten 186 galten für
  1.448 Übungen. Nach der Dublettenzusammenführung (1.448 → 1.416) sind es
  **170** mit weiblicher Darstellung, 1.339 mit männlicher. Die alten Zahlen
  bleiben stehen, weil sie zum damaligen Bestand gehören.

- [ ] **E-08: Deployment nach `main`** — Wartebedingung korrigiert
  2026-08-05: „erst wenn D-12 abgeschlossen" ist seit 2026-08-02 erfüllt
  und damit hinfällig. **Reale Voraussetzungen: D-17 (Blocker vor jedem
  Cloud-Kontakt inkl. `supabase link`, mitsamt D-19).** B-13 ist seit
  2026-08-13 erledigt — die Werte für `site_url` und Redirect-Liste
  liegen fertig vor (`docs/ssot/39-rueckleitadressen.md` §6); ihr
  Eintragen ist Teil DIESES Punktes, keine Vorbedingung mehr.
  *Die Warnung bleibt: vor einem `link` müssen die Migrationsdateien den
  lokalen Zustand abbilden, sonst entsteht ein dritter Drift-Zustand — in
  einer Instanz, für die bezahlt wird.*

- [ ] **E-09: Preview-Branches erst danach** — und dann als das, wofür sie
  gedacht sind: kurzlebige Testumgebungen je Änderung, kein dauerhaftes Dev.

- [ ] **E-10: RLS neu bewerten, sobald `main` produktiv wird** — viele
  Legacy-Tabellen sind `UNRESTRICTED`. Bei Dummydaten unkritisch (Entscheidung
  Tom), bei echten Nutzerdaten nicht. *Vgl. D-14 — derselbe Befund lokal:
  9 von 11 `nutrition`-Tabellen ohne RLS, obwohl die Migration es beschreibt.
  Das Muster wiederholt sich über zwei unabhängige Instanzen.*

- [ ] **E-14: `image_male_*` zeigt auf `_Female`-Dateien** (neu
  2026-08-13, aus E-11) — `[cmd]` Bei **146 Übungen** trägt ein
  `image_male_*`-Feld einen Pfad auf eine `_Female`-Datei. Beispiel:
  `Ab Wheel Plank` → `image_male_start = images/Yoga/Ab Wheel Plank_Female.jpeg`.
  `[cmd]` Die Gegenrichtung (`image_female_*` auf `_Male`) kommt **0×**
  vor — es ist also keine beidseitige Vertauschung, sondern ein
  einseitiger Importfehler.
  **Wirkung:** Wer nach Geschlecht filtert oder die männliche Darstellung
  zeigt, bekommt in 146 Fällen die weibliche. Das fällt nicht auf, weil
  ein Bild da ist — nur das falsche.
  **Geprüft, und es ist keine Vertauschung:** `[cmd]` 2026-08-13 —
  **in allen 146 Fällen existiert lokal KEINE männliche Datei** (der
  Pfad mit `_Male` statt `_Female` findet sich 0×). Es wurde also nichts
  verwechselt; jemand hat die weibliche Aufnahme eingetragen, weil die
  männliche fehlte. **Eine unmarkierte Notlösung, kein Importfehler.**

  **Damit ist die naheliegende Korrektur die falsche.** Den Pfad
  „richtigzustellen" geht nicht — es gibt kein Ziel. Zur Wahl stehen:
  das Feld **leeren** (ehrlich, aber 146 Übungen verlieren ihr
  Startbild), oder die Belegung **als bewusst kennzeichnen** (etwa ein
  Feld „Darstellung: weiblich, männlich fehlt"). Beides ist eine
  Produktentscheidung und hängt an **E-07**.
  Hängt mit **E-07** zusammen (Lücke weibliche Darstellungen).

- [ ] **E-15: Vier `body_region`-Werte im Altbestand sind anatomisch
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

- [ ] **E-17: `Achilles Tendon` ist eine Sehne in `muscle_groups`** (neu
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

- [ ] **E-18: `none/None` als Muskelgruppe — Restfrage** (neu
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

- [ ] **E-19: Derselbe Muskel mit `primary` UND `secondary` an einer
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

## F — Gedächtnisschichten (AMF)

**Warum das hier steht.** Tom verliert seit Monaten Zeit damit, eigene Inhalte
wiederzufinden, und jede Agentensitzung beginnt bei null. `[cmd]` Unter
`D:\GitHub` liegen 31 Verzeichnisse, neun davon mit „lumeos" im Namen, vier mit
Git, zwei auf dasselbe Remote. `[cmd]` In `~/.claude/projects/` liegen 54
Sitzungen mit 85,5 MB, in `~/.codex/sessions/` weitere 31 — eine davon allein
73 MB. Das Material ist da und maschinenlesbar; es ist nur nicht auffindbar.

**Grundlage:** Toms AMF-Blueprint vom 2026-08-13 (ChatGPT) mit vier Schichten:
was ist WAHR (Repo + Git), was ist RELEVANT (semantisches Retrieval), was ist
PASSIERT (episodisch), was hat sich VERÄNDERT (temporal). Die Zerlegung nach
Fragen statt nach Technologien trägt. Die Reihenfolge im Blueprint nicht:
dort steht die Schnittstelle in Phase 6, nach vier Backends.

**Was hier NICHT gilt:** Das ist kein LumeOS-Produktpunkt. AMF ist
projektübergreifend und lebt in einem eigenen Repo. Es steht hier, weil Tom es
hier führen will und weil LumeOS der erste Anwender ist.

**Recherchebefunde `[read]` 2026-08-13, die die Reihenfolge bestimmen:**

- `kepano/obsidian-skills` — MIT, 44.300 Sterne, 46 Commits, vom Obsidian-CEO.
  Fünf Fertigkeiten (`obsidian-markdown`, `obsidian-bases`, `json-canvas`,
  `obsidian-cli`, `defuddle`), folgen der Agent-Skills-Spezifikation und laufen
  in **Claude Code, Codex und OpenCode**. Kein Speicher — die Fähigkeit, ein
  Format zu lesen und zu schreiben. Das ist der Unterschied: das Gedächtnis
  *sind* die Dateien, nicht ein Index darüber.
- Supermemory — lokale Binärdatei auf `localhost:6767`, fertige Anbindungen für
  Claude Code, Codex und OpenCode. Lizenzlage widersprüchlich (MIT, Apache-2.0
  und „geschlossen" je nach Quelle); vor einer Entscheidung am Objekt zu klären.
- Graphiti — fachlich das stärkste der vier, bi-temporal mit
  `valid_at`/`invalid_at`. Aber: braucht Neo4j, FalkorDB oder Neptune, und
  **jeder `add_episode`-Aufruf kostet Modellaufrufe** zur Entitätsextraktion.
  `[read]` Zep hat den Selbstbetrieb 2025 eingestellt; Graphiti bleibt quelloffen,
  aber es gibt keinen Rückfallweg auf eine fertige Community-Edition.
- MemPalace — **abgelehnt.** Vier Monate alt, 7.199 Sterne pro Tag, und die
  Benchmark-Behauptung von 96,6 % musste binnen 48 Stunden korrigiert werden:
  falsche Tokenizer-Heuristik, „verlustfreie" Kompression ist verlustbehaftet
  und verliert 12,4 Punkte, eine angekündigte Funktion war nicht verdrahtet.
  Speichert unbegrenzt wörtlich. Das ist dieselbe Fehlerklasse, die LumeOS
  heute viermal getroffen hat: ein Werkzeug, das Sicherheit behauptet, ohne
  sie zu erzeugen.
- Alternativen, die der Blueprint nicht kennt: `basic-memory` (lokaler
  MCP-Server über Markdown), `engram` (eine Go-Binärdatei, SQLite + FTS5, MCP),
  `claude-mem`, `Cognee` (Apache-2.0, Graph), `mem0` (grösste Gemeinschaft,
  aber nur 49,0 % LongMemEval).

**Die fünfte Frage, die im Blueprint fehlt:** *Ist das noch wahr?* Alle vier
Schichten beantworten Fragen über die Vergangenheit. Keine beantwortet, ob eine
gefundene Aussage heute noch gilt. `[cmd]` LumeOS trägt 719 `[cmd]`-, 178
`[read]`- und 75 `[annahme]`-Marker mit Datum — semantische Ähnlichkeit
unterscheidet nicht zwischen richtig und veraltet. Jede Antwort aus AMF muss
sagen können: erhoben am X gegen Commit Y, seither Z Commits.

- [ ] **F-01: Schnittstellenvertrag zuerst** — bevor ein Backend gewählt wird.
  Die sechs bis acht Werkzeuge, ihre Ein- und Ausgaben, das Provenance-Feld.
  Das ist ein Dokument, kein Code. Grund: Jarvis und die drei Agenten hängen
  später daran; was zuletzt entworfen wird, wird aus dem geformt, was die
  Backends zufällig können. Mit dem Vertrag ist jedes Backend austauschbar.
  Muss enthalten: Projekt-Namensraum, Zeitfilter, Herkunft je Treffer
  (wann erhoben, gegen welchen Commit), und eine Antwort auf „ist das noch
  aktuell".

- [ ] **F-02: Ablageort festlegen** — ein Obsidian-Tresor als Markdown in Git,
  oder etwas anderes mit denselben Eigenschaften: lesbar ohne Werkzeug,
  versionierbar, korrigierbar, `grep`-bar. `[read]` Der Grund gegen einen
  Vektorspeicher an erster Stelle: dort ist nicht sichtbar, was drinsteht, eine
  Korrektur heisst neu einlesen und hoffen, und `git log` fällt weg.
  Zu klären: ein Tresor für alles oder einer je Projekt, und wie er sich zu
  `docs/ssot/` verhält — **es darf keine zweite Wahrheit entstehen.**

- [ ] **F-03: obsidian-skills einbinden** — `npx skills add
  kepano/obsidian-skills` für Claude Code, `~/.codex/skills` für Codex.
  Danach können beide Agenten den Tresor lesen und schreiben, ohne dass ein
  Backend läuft. Kleinster möglicher erster Schritt; kostet nichts und ist
  umkehrbar. Prüfen: greift der `defuddle`-Skill auch für Rechercheergebnisse?

- [ ] **F-04: Sitzungsextraktor** — der Teil, den kein Backend abnimmt.
  `[cmd]` Claude-Code-Sitzungen liegen als JSONL mit `timestamp`, `cwd`,
  `gitBranch`, `sessionId` und `message`; Codex mit `timestamp` und
  `payload.cwd`. Beide vermischt mit Werkzeugaufrufen und Anhängen — `[cmd]`
  in einer Sitzung 1.138 `attachment`- gegen 800 `user`-Sätze.
  Der Extraktor zieht heraus: wer, wann, welches Projekt, welcher Branch, was
  entschieden wurde. Das Ergebnis ist der Rohstoff für JEDE Schicht.
  Projektzuordnung über `cwd`, nicht über den Verzeichnisnamen — `[cmd]`
  „D--github" und „D--GitHub-LumeOS-Claude-V1" stehen nebeneinander,
  Gross- und Kleinschreibung wechselt.

- [ ] **F-05: Suche über das Extrahierte** — erste Fassung Volltext mit Filtern
  nach Projekt, Agent und Zeitraum. Jeder Treffer mit Datum; ein Treffer ohne
  Datum ist wertlos, weil nicht erkennbar ist, ob die Antwort von gestern oder
  von Mai stammt. Aufruf aus jedem Verzeichnis, nicht nur aus dem AMF-Repo.
  Abnahme an echten Fragen: „security_invoker", „Nemotron", „warum haben wir X
  verworfen".

- [ ] **F-06: Backend erst nach zwei Wochen Gebrauch wählen** — messen, welche
  Frage die Volltextsuche NICHT beantwortet hat. Das ist die Anforderung an
  Schicht zwei, nicht eine Architekturannahme. Kandidaten in dieser Reihenfolge:
  `basic-memory` oder `engram` (beide MCP, beide lokal, beide ohne
  Modellkosten), dann Supermemory-lokal. Graphiti nur, wenn eine Frage übrig
  bleibt, die ohne Graph nicht beantwortbar ist — und dann mit gemessenen
  Modellkosten, nicht geschätzten.

- [ ] **F-07: Berechtigungen** — fehlt im Blueprint ganz. Jarvis ist ein anderer
  Prozess mit anderem Kontext. Darf er schreiben? Darf er projektübergreifend
  lesen? Ein Gedächtnisdienst ohne Zugriffsmodell ist der kürzeste Weg, dass
  Projektinhalte dort auftauchen, wo sie nicht hingehören. Der Blueprint nennt
  nur Secrets, nicht Inhalte.

- [ ] **F-08: Werkstatt-Inventar** — `[cmd]` 31 Verzeichnisse unter `D:\GitHub`,
  neun mit „lumeos" im Namen: `LumeOS-Claude-V1` (aktiv), `LumeOSmacmini` (zeigt
  auf `lumeos-2026`), `LumeOS-Workspace-V1`, `lumeos-app`, `lumeos-app-backup`
  (dasselbe Remote wie `lumeos-app`), dazu `lumeos-2026`, `lumeos-core`,
  `lumeos-stack` ohne Git. Plus `Wayland-LumeOS-Factory`,
  `LumeOS-BigBang-Screenshots`, `governance_brain`, `Design-Intelligence-System`.
  Erheben: was lebt, was ist Duplikat, was ist archivierungsreif. Dieselbe
  Arbeit wie E-01, nur über die Platte statt über die Cloud. **Nichts löschen** —
  `referenz/lumeos-2026` hat gezeigt, was in solchen Verzeichnissen liegen kann
  (22 Stashes, 19 ungepushte Commits, nirgends sonst gesichert).

- [ ] **F-09: Wenn AMF steht — die Blueprint-Regeln prüfen** — §28 sagt „keine
  neue Software-Factory", §1–40 beschreiben CLI, MCP-Server, Context Builder,
  Health Checks, Backup/Restore, 18 Dokumentationsdateien und vier Backends.
  Vor dem Ausbau abgleichen, was davon wirklich gebraucht wird.
  `[read]` Ebenfalls zu prüfen: §15 macht den Dateipfad zur Projektidentität.
  Pfade wandern — `temp/lumeosold` wurde am 2026-08-12 zu
  `referenz/lumeos-2026`. Ein Resolver am Pfad bricht still.
