# TODO — LumeOS

**Stand:** 2026-08-18, Anker `e14ddf9` auf `dev`.
Die Zahlen im Übersichtsblock unten sind aus dieser Datei gezählt, nicht
von Hand gepflegt — sie stimmen, solange niemand die Konvention bricht.

**Konvention:** `[ ]` offen · `[~]` in Arbeit · *Blocker kursiv*
**Belegpflicht:** Aussagen über den Ist-Zustand tragen `[cmd]`, `[read]`
oder `[annahme]`. Nur `[cmd]` darf zu einer Regel werden.
**Erledigtes** steht vollständig in `docs/todo/ERLEDIGT.md` — mit Datum,
Beleg und Begründung. Diese Datei enthält nur, was noch aussteht.

**Grössere Vorhaben haben einen eigenen Plan.** Er steht nicht in dieser
Datei, damit sie lesbar bleibt — aber er wird hier genannt, sonst geht er
verloren:

| | |
|---|---|
| **Theme V1 umsetzen** (Sektion G) | `docs/spezifikation/10-plattform/design-system/theme-v1-umsetzung.md` |
| **Altbestand konsolidieren** (A-11) | `docs/spezifikation/00-KONSOLIDIERUNG.md` |
| **Goals** (GO-01 ff.) | `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md` |
| **Rollen der Ordner, Statuskopf, Regeln** | `docs/spezifikation/00-INDEX.md` |

**Jedes Modul, das neu angepackt wird, bekommt vorher einen
Umsetzungsplan** — und der wird hier verlinkt, sonst geht er verloren.
Das Verfahren steht in `docs/spezifikation/00-UMSETZUNGSPLAENE.md`.
`[read]` Zweimal hat das Fehlen einer solchen Datei Tage gekostet:
`SPEC_05_FOOD_TAXONOMY.md` wurde am vierten Tag der Arbeit an genau
ihren Fragen gelesen, und `docs/specs/Goals/` meldet „vollständig
implementiert" für ein Modul, das in diesem Repo nicht existiert.

**Quellen für Nutrition** (Tom, 2026-08-14): Bei Arbeit am Nutrition-Modul
gehören `docs/specs/Nutrition/` und `docs/BrainstormDocs/Nutrition/`
**mit gelesen**. Sie sind **Grundlage der Diskussion** darüber, was gilt —
kein Ist-Zustand und für sich noch kein Sollwert. Die Rangfolge bleibt
Code > `docs/ssot/` > `docs/spezifikation/`. Verbindlich wird ein Inhalt
erst, wenn er besprochen und festgeschrieben ist; der Ablauf dafür steht
in **A-11**. `[cmd]` Allein unter `04_adrs/` liegen dreizehn ADRs, darunter
`ADR_CUSTOM_FOODS_V1`, `ADR_BLS_ONLY`, `ADR_MEALCAM_V1`. Die generelle
Regel „`docs/specs/` nicht als Referenz lesen" gilt **für Nutrition
eingeschränkt**: als Quelle für Entscheidungen ja, als Beschreibung des
Ist-Zustands nein. Widersprüche zwischen zwei Spec-Dateien sind
vorhanden (siehe C-34, Punkt 4) und beim Lesen zu erwarten.

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
`[cmd]` **Zwei maschinelle Modelle sind gemessen und gefallen** —
C-28 (Gruppierung über vier Codestellen) mit 39 von 100, C-33 (dazu der
Zubereitungsschlüssel) mit 47 von 100, gegen eine Abnahme von 95. Die
Annahme, dass sich eine Lebensmittel-„Art" aus dem BLS-Code ableiten
lässt, ist damit widerlegt: der BLS führt je Warengruppe ein eigenes
Schema, eine gemeinsame Semantik gibt es nicht.

Der Weg läuft deshalb über **C-18 → C-29 → C-30 → C-32 → C-31**:
erst mitschreiben, was Menschen tatsächlich suchen, dann die
Namensschichten trennen, die Rangfolge über eine **kuratierte
Zuordnung** setzen, Reis als ersten durchkurierten Fall, dann die
Oberfläche. Begründung und Form in C-36, verwertbare Reste in C-35.
C-20 und C-24 fallen bei der Rangfolgearbeit mit; C-22 bleibt
eigenständig.

**Deployment:** E-08 hat keine Vorbedingung mehr ausser sich selbst.

**Wartet auf Tom, blockiert anderes:** A-06 (Design — hält C-01, C-03,
C-06 auf), A-08 (ADR Medienort), E-07 (Geschlechtsfeld der Medienauswahl).

---

## Reihenfolge

1. **Nutrition-Oberflächen.** Der nächste sichtbare Schritt; die
   Datenseite trägt. Laut D-04 auch der Punkt, an dem ein E2E-Aufbau
   wieder lohnt: die erste Oberfläche, die bleiben soll.
2. **Suche: C-38 zuerst** — `sort_weight` nach der Spec-Formel. Der
   billigste Hebel: deterministisch, alle Eingangswerte vorhanden, keine
   Kuration. Dann **C-39 Phase 1** (regelbasierte Namen, 1.365 Einträge),
   dann **C-39 Phase 2** (KI-Batch über Codex). **C-18** (Fehlsuchen
   mitschreiben) läuft daneben und liefert die Priorisierung für später;
   **C-32** (Reis) ist der erste durchkurierte Fall und braucht keine
   Vorbedingung. Danach C-29 (Schichten), C-30 (Rangfolge),
   C-31 (Oberfläche). C-20 und C-24 nicht einzeln angehen; sie fallen
   dabei mit.

   `[read]` **Grundlage ist seit dem 2026-08-14
   `SPEC_05_FOOD_TAXONOMY.md`** — sie enthält Namensstrategie,
   Scoring-Formel und die Core-Fitness-Liste. Vier Tage Modellsuche
   (C-28, C-33) wären mit dieser Datei kürzer ausgefallen.
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

`[cmd]` 126 offen, 1 in Arbeit.

| | Punkt | |
|---|---|---|
| **A-06** | Design-System spezifizieren |  |
| **A-08** | ADR Medienort |  |
| **A-13** | Das Konsolidierungsregister abarbeiten |  |
| **C-64** | 942 Schluessel und Thai aus dem Vorgaengerrepo uebertragen |  |
| **A-15** | Sprachpflege als laufende Regel |  |
| **B-20** | Codex-Pfadschutz wiederherstellen |  |
| **B-25** | Geteilte Sitzung im Produktbereich prüfen |  |
| **C-01** | Frontend-Stack-Lücke schliessen |  |
| **C-06** | WP-05 erstes Mock-Modul echt machen |  |
| **C-08** | `services/nutrition-api` — der ADR gilt |  |
| **A-20** | Die Spec-Fehlerliste |  |
| **C-20** | Treffer am Wortanfang schlägt Treffer in der Wortmitte |  |
| **C-24** | Halbfertigprodukte ranken als Grundzutat |  |
| **C-27** | Alltagswörter ohne Treffer — noch zwei |  |
| **C-29** | Drei Namensschichten und eine Kuration, die den Kettenlauf überlebt |  |
| **C-30** | Suche und Trefferliste auf Arten umstellen |  |
| **C-31** | Admin-Oberfläche für die Kuration |  |
| **C-35** | Was aus zwei gefallenen Modellen brauchbar bleibt |  |
| **C-36** | Kuratierte Zuordnung statt Ableitung — die Richtung nach zwei Messungen |  |
| **C-48** | Die Tagesbilanz sichtbar machen |  |
| **C-49** | Deckungsgrad, Warnungen und Tages-Score — die drei Stufen danach |  |
| **D-05** | Spec-Audit | ~ |
| **E-04** | Alte `public`-Tabellen nach `legacy` verschieben |  |
| **E-07** | Lücke weibliche Darstellungen entscheiden |  |
| **E-08** | Deployment nach `main` |  |
| **E-09** | Preview-Branches erst danach |  |
| **E-10** | RLS neu bewerten, sobald `main` produktiv wird |  |
| **E-14** | 26 `image_male_start`-Pfade zeigen auf `_Female`-Dateien |  |
| **F-01** | Schnittstellenvertrag zuerst |  |
| **F-02** | Ablageort festlegen |  |
| **F-03** | obsidian-skills einbinden |  |
| **F-04** | Sitzungsextraktor |  |
| **F-05** | Suche über das Extrahierte |  |
| **F-06** | Backend erst nach zwei Wochen Gebrauch wählen |  |
| **F-07** | Berechtigungen |  |
| **F-08** | Werkstatt-Inventar |  |
| **F-09** | Wenn AMF steht — die Blueprint-Regeln prüfen |  |
| **G-107** | Der Mikronaehrstoff-Trend braucht eine Referenz je Tag |  |
| **G-108** | Die Filter des Nutrients-Tabs |  |
| **G-109** | Der Dev-Server kompiliert geaenderte Routen wiederholt nicht neu |  |
| **G-04** | Zwei Zahlen im Entwurf, die nicht stimmen |  |
| **G-06** | Die übrigen Module nach Datenlage |  |
| **G-07** | Umschalten |  |
| **G-11** | Die restlichen Nutrition-Tabs anbinden |  |
| **G-17** | Datum beim Modulwechsel mitgeben |  |
| **A-21** | Kimi-K3-Schwarm als Rechercheweg |  |
| **A-22** | Was an Kimi gehen kann — klassifiziert |  |
| **A-18** | `theme-v1/uploads/` — die Bruecke zwischen Spec und Entwurf |  |
| **A-16** | `public/mockup/` als dritten Fundus auswerten |  |
| **G-83** | Es gibt kein Onboarding |  |
| **G-93** | Der Anzeigename fehlt im laufenden Erfassungsdialog |  |
| **G-98** | Meal plans braucht einen Zustand und eine Herkunft |  |
| **G-101** | Der Aktivitaetsstrom des Dashboards |  |
| **G-102** | Zwei SVG-Pfade der Muskelkarte sind abgeschnitten |  |
| **G-99** | Drei der acht Planner-Spalten bleiben wirkungslos |  |
| **G-25** | Training an echte Daten anschliessen |  |
| **C-87** | `exercises_select` war aus der Datenbank verschwunden |  |
| **G-70** | Sortierbare Spalten und Herkunfts-Filter im Food-DB-Tab |  |
| **C-107** | Der Supplement-Katalog und was ihm fehlt |  |
| **C-108** | Wechselwirkungen — nennen ja, bewerten nein |  |
| **C-109** | Die Injektions-Grenzwerte sind unbelegt |  |
| **C-110** | Cost-Rest und Compliance-Notizen |  |
| **C-111** | Recovery — neun Entscheidungen und drei Formelfehler |  |
| **C-112** | Buddy, Coach und Marketplace — elf Entscheidungen |  |
| **C-113** | Enhanced Mode — entschieden |  |
| **C-114** | Was das Vorgaengerrepo beim Coach falsch machte |  |
| **C-115** | Was der Markt kann und was LumeOS eigen ist |  |
| **C-116** | Der Substanzkatalog — 320 Zeilen als Kandidat |  |
| **C-71** | Permissions und Autonomy sind zwei verschiedene Sachen |  |
| **C-75** | BSS und Voice sind Neubau |  |
| **G-53** | `InjektionsKarte` in `packages/ui` hat keinen Aufrufer |  |
| **G-58** | Kontrast auf Attrappenkarten gegen den gerenderten Grund messen |  |
| **C-85** | Kurznamen fehlen bei 11 von 35 |  |
| **C-86** | 8 mehrdeutige Uebungen und 1 ohne DB-Namen |  |
| **C-91** | Die Spec nennt LOINC-Codes, die nicht die ueblichen sind |  |
| **C-92** | Die Spec verwechselt Marker |  |
| **G-68** | `e1RM` deckt 6 von 1.416 |  |
| **C-102** | `milch` findet Joghurt statt Milch |  |
| **C-123** | Recovery — die neun Entscheidungen |  |
| **C-124** | Recovery-Recherche — Modalitaeten und Schwellen |  |
| **C-126** | E2 braucht Toms Bestaetigung |  |
| **C-127** | Drei Wearable-Spalten sind leer |  |
| **C-129** | Der Kimi-Bestand — brauchbar, aber nicht importierbar |  |
| **C-136** | Medikamente und Conditions brauchen die Coach-Freigabeschicht |  |
| **G-85** | Der Health score haengt an zwei Unbekannten |  |
| **C-142** | Die Sperrbegruendung nennt eine Tabelle, die es gibt |  |
| **A-23** | `lint` bricht repoweit ab |  |
| **C-143** | Die zwei Erholungsrechnungen weichen ab |  |
| **C-145** | `Plan` braucht ein Schema, keine Anzeige |  |
| **G-88** | Die Sitzungskarte auf `Today` |  |
| **A-24** | Attrappenmarken sind kein brauchbares Mass |  |
| **GO-21** | Taille:Huefte mit Geschlechtsbezug |  |
| **C-146** | `phase_am()` liefert 8 von 14 Spalten |  |
| **G-89** | Die Idealwerte stehen nur in Begleitdateien |  |
| **G-117** | Der Extended-Code liegt im Buendel, auch ohne Erfahrungsgrad |  |
| **C-149** | Vitamin D in IU gegen µg |  |
| **G-95** | Sieben Module, aber nicht dieselben sieben |  |
| **G-96** | Der Bestaetigungspfad wechselt nur den Zustand |  |
| **G-98** | Der `Meal plans`-Tab hat eine Vorlage, aber keine Daten |  |
| **G-99** | Drei der acht G-72-Spalten bleiben wirkungslos |  |
| **G-105** | Zwei abgeschnittene SVG-Pfade in `packages/ui` |  |
| **G-106** | Der Readiness-Komposit waere ein zweiter Gesamtwert |  |
| **G-112** | Der Food-DB-Filter laesst nur einen Wert zu |  |
| **G-113** | Die Naehrstoffordnung braucht Klappen und Zeitfilter |  |
| **G-114** | `daily_summary` fuehrt nur 33 der 138 Naehrstoffe |  |
| **C-105** | MEV/MAV/MRV haben keine Tabelle |  |
| **A-18** | Berichtsnummern kollidieren |  |
| **G-72** | Acht Spalten ohne Wirkung und ohne Kachel |  |
| **A-19** | Zwei README-Abweichungen in der Kette |  |
| **C-117** | `milch` traegt auch mit Vorlieben nicht |  |
| **C-120** | Drei Sperren in `food_search` |  |
| **C-121** | Die Suche ist langsamer geworden |  |
| **G-75** | Die alte Oberflaeche nennt den BLS ebenfalls |  |
| **G-77** | Streaks bei 32 Auslassern |  |
| **G-78** | Ein Fehler, den nur der Browser zeigte |  |
| **A-27** | Zwei Agenten, zwei Attrappen-Erwartungen |  |
| **A-29** | Der Attrappen-Test koennte die gerenderte Seite zaehlen |  |
| **C-155** | Zwei Befunde in `@supabase/ssr` 0.1.0 |  |
| **G-102** | Der Ausfuehrer fuer bestaetigte Vorschlaege |  |
| **C-158** | Der Gap-Score braucht Naehrstoffcodes je Substanz |  |
| **G-116** | Generelle Ausschluesse bewerten mit 0, statt zu filtern |  |
| **C-159** | Sieben Regelpfade zeigen auf Schemata, die es nicht gibt |  |
| **G-118** | Der Extended-Code liegt im Buendel |  |
| **C-160** | Der Bewertungshorizont je Naehrstoff ist leer |  |
| **G-119** | `supplements` ist das letzte Modul mit `useState`-Tab |  |
| **G-120** | `updateWaterLogAmount` liegt fertig und ungenutzt |  |
| **A-29** | `schuss.mjs` und die Git-Bash-Pfadumwandlung |  |

---

## A — Struktur & SSOT (laufend)


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



- [ ] **A-13: Das Konsolidierungsregister abarbeiten** (neu 2026-08-16).
  Setzt A-11 fort.

  `[cmd]` **74 von 84 Nutrition-Dateien stehen auf `offen`**, 6 gelesen,
  4 aufgelöst.

  `[read]` Zweimal hat das Fehlen einer Auswertung Tage gekostet:
  `SPEC_05_FOOD_TAXONOMY.md` wurde am vierten Tag der Arbeit an genau
  ihren Fragen gelesen, und `docs/specs/Goals/` meldet vollständige
  Umsetzung für ein Modul, das hier nicht existiert.

  **Nicht alles auf einmal.** `[read]` Das Verfahren in
  `00-UMSETZUNGSPLAENE.md` sagt: je Modul ein Plan, bevor gebaut wird.
  Die Nutrition-Dateien sind zum Grossteil abgearbeitet **im Sinne des
  Gebauten** — was fehlt, ist der Vermerk im Register.

  `[cmd]` **Nächste Kandidaten**, weil ihre Module anstehen:
  `SPEC_09_SCORING.md` (C-49), die Preferences-Specs (G-11), und die
  Planner-/Meal-plans-Specs.


- [ ] **C-64: 942 Schluessel und Thai aus dem Vorgaengerrepo uebertragen**
  (neu 2026-08-17). Folgt aus A-14.

  `[cmd]` `referenz/lumeos-2026/src/i18n/translations/` traegt **961
  Blattschluessel je Sprache in 17 Namensraeumen — Thai vollstaendig.**
  Uebernommen sind bisher 19.

  **Das ist kein Uebersetzungsauftrag, sondern eine Uebertragung.** Die
  Werte existieren; was fehlt, ist die Zuordnung auf den neuen
  Zuschnitt.

  `[read]` Tom, 2026-08-17: *„Thai sehen wir vor und ziehen wir bei
  Bedarf nach."* **Der Bestand ist der Grund, warum das billig wird** —
  wer neu uebersetzen laesst, zahlt fuer etwas, das dasteht.

  **Sinnvoll erst, wenn mehr Seiten umgestellt sind** — sonst werden
  Schluessel zugeordnet, die niemand benutzt.


- [ ] **A-15: Sprachpflege als laufende Regel** (neu 2026-08-17). Folgt
  auf A-14.

  **Jeder Auftrag, der Text erzeugt, füllt Englisch und Deutsch.** Thai
  bleibt leer, bis ein Übersetzungsauftrag läuft.

  **Eine Prüfung, die das hält:** `[cmd]` Nach dem Muster von
  `tools/encoding-pruefen.mjs` — ein Schlüssel, der in `de` fehlt oder
  in `en` fehlt, lässt das Gate fehlschlagen. Thai wird gezählt, nicht
  erzwungen.

  `[read]` Ohne die Prüfung verlässt es sich auf Disziplin — und daran
  ist in diesem Projekt schon dreimal etwas gescheitert.


## B — Entwicklungsumgebung & Absicherung

- [ ] **B-20: Codex-Pfadschutz wiederherstellen** (neu 2026-08-06) —
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


- [ ] **C-06: WP-05 erstes Mock-Modul echt machen** — Kandidat Goals.
  *Vorher die 2 kritischen Bugs aus `docs/specs/Goals/OPEN_ITEMS.md` klären
  (Adaptive-TDEE Cross-Schema, Contribution-Timing).*

- [ ] **C-08: `services/nutrition-api` — der ADR gilt** (neu gefasst
  2026-08-19). **Nichts zu entscheiden, nur zu wissen.**

  ### Die Frage war 2026-08-03 schon beantwortet

  `[cmd]` **ADR-0001:** *„Gewaehlt: **A fuer jetzt, B als Zielbild.**
  Von: Tom. Am: 2026-08-03. Apps lesen vorerst direkt. **Module bekommen
  spaeter eigene APIs — dann, wenn das jeweilige Modul steht, nicht
  vorher.**"*

  `[read]` **Und der Grund steht dort:** *„Toms Grund fuer B ist
  Modulunabhaengigkeit: ersetzbar, aktivierbar, eigenstaendig lauffaehig.
  Das ist eine Produktanforderung, keine technische Vorliebe."*

  ### Was die Messung vom 2026-08-19 ergaenzt

  `[cmd]` **`services/nutrition-api` ist unveraendert ein Geruest** —
  vier Dateien je 1 KB (`index.ts`, `diary.ts`, `food.ts`, `meals.ts`),
  **in keiner Quelldatei importiert.** Die 20 Fundstellen sind
  Dokumente, Archiv und `pnpm-lock`.

  `[cmd]` **Aber `apps/web` liest inzwischen dreifach:**

  | | |
  |---|---|
  | Next-Routen `/api/nutrition/*` | **29 Vorkommen**, fuenf Routen |
  | `rpc()` direkt | 16 |
  | `.from()` direkt | 9 |

  `[read]` **Das war am 2026-08-03 noch nicht so** — die Next-Routen
  sind seither dazugekommen. **Sie sind faktisch schon eine halbe API,
  nur an der falschen Stelle.**

  ### Was daraus folgt

  `[cmd]` **`nutrition-api` bleibt leer, bis Nutrition steht.** Offen
  sind noch G-70 (Filter und Blaettern) und die Meal plans.

  `[read]` **Eine API muss nicht mitwachsen, wenn das Schema stabil
  ist** — und das ist es: Kettenschritte, `schema-sollstand.json`,
  Vollstaendigkeitspruefung. **Die API waere eine Fassade ueber etwas
  Fertiges, kein mitwachsendes Gebilde.**

  `[cmd]` **Die fuenf Next-Routen sind der Umzugskandidat:**
  `nutrition/diary`, `foods`, `foods/categories`, `foods/smart-preview`,
  `local-schema`.

- [ ] **A-20: Die Spec-Fehlerliste** (neu 2026-08-19). **Ersetzt den
  Konsolidierungsteil von A-11.**

  `[read]` **Die Lage hat sich gedreht:** A-11 wollte die Specs zu SSOT
  konsolidieren. **Sechs gemessene Fehler spaeter hiesse das, Falsches zu
  uebernehmen.**

  `[cmd]` **Was stattdessen gilt:** Jeder Entwurf prueft und meldet.
  **Die vier Fable-Auftraege haben genau das getan** — und dabei
  gefunden:

  | | |
  |---|---|
  | C-84 | **Magnesium RBC gegen Methaemoglobin**, ApoB/ApoA1, Reverse T3/T3 |
  | C-84 | Lp(a) `nmol/L` gegen `mg/dL`, eGFR mit und ohne Bezug |
  | C-108 | **Severity `high`, die es im Schema nicht gibt** |
  | C-111 | **drei Recovery-Formelfehler** — Score-Trigger, ACWR-Kurve, HRV-Anker |
  | C-112 | **BSS-Formel 0,5/0,5 gegen 0,6/0,4**, Unit-Test schlaegt nachgerechnet fehl |
  | C-112 | **Proaktivitaetsskala invertiert dokumentiert** (`SPEC_03` gegen `SPEC_11`) |
  | C-91 | **LOINC-Codes, die nicht die ueblichen sind** — IGF-1, Zink, Selen |

  `[cmd]` **Und die Zahlen stimmen auch nicht:** *„100+ Biomarker"* gegen
  74 gegen **47 tatsaechliche SQL-Zeilen** (C-84). *„1.302
  Datensaetze"* gegen **702 gemessene** (F-02).

  `[read]` **Die Liste gehoert gepflegt, nicht abgearbeitet** — sie ist
  der Beleg dafuer, dass `docs/specs/` Datenquelle bleibt und kein
  Sollwert wird. **So steht es in `CLAUDE.md`, und jeder Fund
  bestaetigt es.**

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
  | Anzeigename (je Zuordnung) | wie der Mensch es nennt | ja | Anzeige und Sortierung |
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
  - Override-Tabelle je kuratierter Zuordnung (nicht je Art — siehe
    C-36), angewandt in einem Kettenschritt unter
    `02_human_layer/` — nach dem Import, wie `024_suchsynonyme.sql` es
    bereits vormacht.
  - Umbenennung `name_display` → `name_display_de`. `[cmd]` 246
    Vorkommen in 32 Dateien. Ein eigener Commit, keine Vermischung.
  - **Offene Entscheidung für Tom:** Erzeugt ein gepflegter Gattungsname
    automatisch einen Alias, oder nur einen Vorschlag zum Bestätigen?
    Automatisch ist bequemer, aber eine Zuordnung wie „Hüttenkäse" auf
    einen Frischkäse ist eine inhaltliche Aussage, die falsch sein kann.

- [ ] **C-30: Suche und Trefferliste auf Arten umstellen** (neu
  2026-08-14). Setzt C-29 und C-36 voraus. `[cmd]` C-28 und C-33 sind
  beide gemessen und gefallen; die Rangfolge kommt aus der kuratierten
  Zuordnung, nicht aus einer Artengruppierung.

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

  Die Oberfläche kuriert **Zuordnungen** — Begriff auf Eintrag, samt
  Anzeigename — und schreibt in die Override-Tabelle aus C-29, niemals
  direkt in `nutrition.foods`. `[cmd]` Die frühere Fassung „Gattungsnamen
  je Art" ist mit C-28/C-33 hinfällig; die Priorisierung kommt aus C-18,
  nicht aus einer Artenliste.

  **Warum nicht zuerst, obwohl Tom dort beginnen wollte:** C-28 bis C-30
  sind Schema- und Vertragsfragen. Eine Oberfläche vor dem Vertrag wird
  zweimal gebaut — und eine Oberfläche auf `name_display` würde Handarbeit
  produzieren, die der nächste Kettenlauf verwirft.

  Priorisierung der Kurationsarbeit, solange C-18 (Fehlsuchen
  mitschreiben) nicht steht: die Häufigkeitsliste aus
  `daten/wortschatz-luecke.json` (1.581 Kandidaten) und die 37 Zutaten
  des MealCam-Maßstabs.


- [ ] **C-35: Was aus zwei gefallenen Modellen brauchbar bleibt** (neu
  2026-08-14). Drei Reste aus C-28 und C-33, die unabhängig von jeder
  Gruppierung gelten und nicht verloren gehen dürfen.

  1. **Die Vertreterregel mit drittem Fall.** `[cmd]` Gruppen ohne
     Vertreter: 953 → **0**; eindeutige Vertreter 1.564 → 2.131. Der
     dritte Fall lautet: kein `100`, kein `000` → höchstes `sort_weight`.
     Gilt überall dort, wo aus mehreren Einträgen einer gezeigt werden
     muss. **Preis, noch offen:** `[cmd]` mehrdeutige Gruppen steigen von
     128 auf 583; bei rund 450 ist die Entscheidung verschoben, nicht
     getroffen. `[annahme]` Ein zweites Merkmal (Namenslänge, wie in
     `073_suchfilter.sql`) löst das vermutlich auf — ungemessen.
  2. **Die vier Erzeugnis-Zellen.** Saft und Nektar trennen sich von der
     Frucht (`F201`, `F603`, `F310`). Klein, aber je ein echter
     Suchfehler weniger, und ohne Kuration zu haben.
  3. **Der Zubereitungsschlüssel als Anzeigehilfe.** Auch ohne
     Gruppierung sagt er, welcher Teil eines Namens Zubereitungsangabe
     ist — also was beim Anzeigenamen wegfallen kann. `Banane roh` →
     `Banane`. Das ist genau der maschinelle Anteil, den C-29 braucht.

  **Entscheidung Toms zu den elf strittigen Zellen (2026-08-14):** zehn
  bleiben wie eingeordnet. **Die sieben Käse-Fettstufen** (`M` 200–800,
  `[cmd]` 209 Einträge) sind **keine Zubereitung** — 45 % und 50 % Fett
  i. Tr. sind für einen Kalorienzähler nicht dieselbe Ware, der
  Unterschied ist grösser als der zwischen Hähnchenbrust und Brustfilet.
  Die Einstufung war technisch begründet (sonst zerfällt `M710`) — nach
  dem Fall der Gruppierung ist dieser Grund entfallen.

- [ ] **C-36: Kuratierte Zuordnung statt Ableitung — die Richtung nach
  zwei Messungen** (neu 2026-08-14). **Ersetzt C-28 und C-33 als
  Grundlage für C-29 bis C-32.**

  `[cmd]` Zwei maschinelle Modelle sind an derselben Stelle gescheitert:
  39/100 und 47/100 gegen eine Abnahme von 95. Die Annahme, dass eine
  Lebensmittel-„Art" aus dem BLS-Code ableitbar ist, ist damit
  **widerlegt, nicht offen**.

  **Was stattdessen gilt:** Für eine brauchbare Suche braucht es keine
  vollständige, maschinell korrekte Taxonomie über 7.140 Einträge. Es
  braucht eine richtige Rangfolge für die Begriffe, die **tatsächlich
  getippt werden** — und die sind wenige.

  **Die Priorisierung ist der eigentliche Punkt.** Nicht 7.140 Namen,
  nicht die 468 Arten mit schlechtem Namen, sondern die tatsächlichen
  Anfragen. Die kennen wir nicht; seit dem 2026-08-11 werden sie geraten.
  **Deshalb C-18 (Fehlsuchen mitschreiben) vor allem Weiteren** — der
  Punkt steht seit Block 28 und ist zweimal zugunsten von Modellen
  verschoben worden, die dann gefallen sind.

  **Bis genug Daten da sind**, wird gegen das kuriert, was konkret
  vorliegt: die 37 Zutaten des MealCam-Massstabs (`[cmd]` 31 auf Platz 1,
  sechs Restfälle namentlich) und die 13 Arten aus C-32.

  **Die Form der Kuration:** eine Zuordnung *Begriff → Eintrag*, nicht
  eine Umbenennung des Bestands. `reis` → `C352000`, `lachs` → `T410100`,
  `huhn` → `V416100`. Technisch ist das die Aliasschicht, die es schon
  gibt — `[cmd]` 32.522 Einträge, maschinell erzeugt und deshalb
  ungenau. Der Unterschied liegt nicht in der Tabelle, sondern darin,
  dass ein Mensch die Zuordnung setzt und ein Massstab sie prüft.

  **Was das für die Folgereihenfolge heisst:**
  - **C-29** bleibt gültig — die drei Namensschichten hängen nicht am
    Gruppierungsmodell. Nur „je Art" wird zu „je Zuordnung".
  - **C-30** wird kleiner: keine Umstellung auf Arten, sondern Rangfolge
    über die kuratierte Zuordnung. Abnahme unverändert 34 von 37.
  - **C-31** kuriert Zuordnungen, nicht Gattungsnamen je Art. Umfang ist
    nicht mehr beziffert — er ergibt sich aus C-18.
  - **C-32 (Reis)** bleibt der erste durchkurierte Fall und ist jetzt
    ohne Vorbedingung machbar.

- [ ] **C-48: Die Tagesbilanz sichtbar machen** (neu 2026-08-15).
  Der nächste Schritt, sobald Theme V1 steht.

  `[cmd]` **Alles darunter ist fertig und live.** Was fehlt, ist
  ausschliesslich Oberfläche:

  | | |
  |---|---|
  | `daily_summary` | 70 Spalten, 24 Mikros mit Fehlzählern |
  | `daily_reference_assessment` | Deckungsgrad je Nährstoff |
  | `nutrient_reference_values` | 165 Zeilen, alle 138 Codes, Quelle je Zeile |
  | `profiles` | `birth_date`, `biological_sex`, Zeiträume für Schwangerschaft/Stillzeit |
  | `food_search` | 234 ms, Massstab 34/37 |

  **Vier Regeln, die aus der Datenseite kommen und die Oberfläche binden:**

  1. `[cmd]` **Fehlzähler müssen sichtbar bleiben.** Steht
     `vita_missing` auf 2, ist die Summe unvollständig — die Bewertung
     liefert dann `reference_status = 'incomplete'` **ohne** Prozentwert.
     Die Oberfläche darf daraus keine Null machen.
  2. `[cmd]` **Die Wertart entscheidet die Leserichtung.** 80 % eines
     `PRI` ist zu wenig, 80 % eines `UL` ist zu viel. Beides als
     „80 %" anzuzeigen wäre gefährlich.
  3. `[cmd]` **57 Nährstoffe tragen `NO_STANDALONE_REFERENCE`**, 21
     `NO_REFERENCE`. Beide sind kein „0 % gedeckt", sondern eine eigene
     Aussage.
  4. `[read]` **Die Referenzwerte gelten für gesunde Erwachsene in
     Ruhe.** 100 % Deckung heisst nicht „genug für dich" — ein
     Kraftsportler im Aufbau hat einen anderen Bedarf, und EFSA sagt
     dazu nichts.

  **Blockiert durch A-06** (Theme V1). `[cmd]` Und durch den Zustand von
  `foods/page.tsx`: 208 harte Farbwerte, **eine einzige
  Token-Verwendung**. Die Seite müsste vor oder mit dem Umbau auf Tokens
  gezogen werden — sonst bleibt sie im Hellmodus dunkel.

- [ ] **C-49: Deckungsgrad, Warnungen und Tages-Score — die drei Stufen
  danach** (neu 2026-08-15). Jede braucht eine eigene Entscheidung.

  **Stufe 1, gebaut:** `daily_reference_assessment` liefert Zahl und
  Wertart. Keine Bewertung in Worten, kein Ampelzustand — bewusst.

  **Stufe 2, offen: `micro_flags`.** `[read]` `SPEC_06` sieht die Tabelle
  vor, sie existiert nicht. Eine Warnung bei Unterversorgung ist eine
  medizinisch heikle Aussage — sie braucht eine Entscheidung darüber,
  **ab wann gewarnt wird und mit welcher Formulierung**. `[cmd]` Bei 21
  Nährstoffen ohne Referenzwert und 57 ohne eigenständigen kann die
  Warnung nur einen Teil abdecken.

  **Stufe 3, offen: der Tages-Score.** `[read]` `SPEC_09` führt eine
  Kennzahl 0–100 in `packages/scoring/`. `[cmd]` Das Paket existiert
  nicht. Ein einzelner Wert, der 24 Nährstoffe zusammenfasst, ist eine
  Gewichtungsentscheidung — welcher Nährstoff wie stark zählt, steht
  nirgends.

  **Reihenfolge:** erst die Oberfläche für Stufe 1 (C-48), dann sehen,
  ob Stufe 2 und 3 überhaupt gebraucht werden. `[read]` Die Lehre aus dem
  Suchumbau: vier Tage an Modellen gearbeitet, bevor jemand gemessen hat,
  was Menschen tatsächlich suchen.






















### F-07-Folgepunkte (Coach-Portal, 2026-08-20) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/146-coach-portal.md`. Bewusst ohne
eigene Nummern angelegt (A-18: die Nummer vergibt der Orchestrator).

- [ ] **Der Ausführer** — ein bestätigter `pending_actions`-Eintrag
  ändert nur seinen Status; niemand wendet `payload` auf das Zielmodul
  an, `action_log`/`undo_data` bleiben ungenutzt (seit ssot/139 offen,
  in F-07 bewusst nicht gebaut: braucht die Autonomy-Wirkungsregeln).
- [ ] **@supabase/ssr-0.1.0-Befund in `packages/shared` prüfen:**
  `[cmd]` `createBrowserClient` mit `cookieOptions` ohne `cookies`
  stürzt beim Session-Speichern ab, und `cookieOptions.name` wird im
  BrowserClient nicht zum storageKey — **`apps/admin` nutzt genau
  diesen Pfad** (Anmeldung dort gegenprüfen); Umgehung liegt als
  Vorlage in `apps/coach/src/lib/browser-client.ts`.
- [ ] **`apps/coach/.env.local` anlegen** (Tom — der Hook sperrt
  `.env`-Dateien zu Recht): drei Variablen nach `apps/admin`-Muster,
  Scope `coach`; bis dahin Startbefehl aus ssot/146.
- [ ] **`testdaten-einspielen.ts`: unbekannte Argumente ablehnen.**
  `[cmd]` `--database` wird still ignoriert (DB kommt aus
  `PGDATABASE`) — ein Lauf ging dadurch gegen live und blieb nur dank
  Ein-Transaktions-Bauweise folgenlos.
- [ ] **`kette-ausfuehren.ts`: tar-Aufruf Git-Bash-fest machen**
  (`--force-local` oder absoluter bsdtar-Pfad) — `[cmd]` MSYS-tar
  liest `D:\…` als Hostnamen.
- [ ] **Tokens-Duplikat auflösen:** `apps/coach/src/app/tokens.css`
  ist eine dokumentierte Kopie von `apps/web/.../lume.css` — in ein
  Paket ziehen, sobald `apps/web` frei ist.
- [ ] **Coach-Passwort:** `coach@lumeos.app` / `LumeosCoach2026` aus
  dem Seed — Tom ändert es bei Bedarf.
### G-117-Folgepunkte (Tab-Zustand/Wasser, 2026-08-20) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/158-tab-zustand.md`.

- [ ] **Supplements-Tab auf `useTabParam` umstellen** — das einzige
  Modul, dessen Tab noch in `useState` liegt (fremder Arbeitsbereich
  bei G-117); Zwei-Zeilen-Aenderung nach dem Muster der sechs anderen
  (`lib/tab-url.ts`).
- [ ] **Wassereintrag korrigieren statt loeschen+neu:**
  `updateWaterLogAmount` (Codex) liegt fertig und ungenutzt — ein
  Stift-Knopf neben dem Papierkorb waere der vollstaendige
  Fehlklick-Weg.
- [ ] **`tools/schuss.mjs` Git-Bash-fest machen:** Pfade ohne `?`
  werden von MSYS umgewandelt (`/v2/nutrition` → `C:/Program
  Files/Git/...`); `MSYS_NO_PATHCONV=1` im Skriptkopf setzen oder
  dokumentieren.

### G-104-Folgepunkte (Preferences, 2026-08-20) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/154-preferences.md`.

- [ ] **`ultra_processed` filtert haerter, als die Kachel sagt:**
  `[cmd]` Ein General-Ausschluss mit Tag-Entsprechung wirkt hart wie
  ein Allergen (075:382-390) — `schokolade` 163 → 1. Entweder ein
  Wirkungshinweis an der Pille oder Toms Entscheidung, ob ein
  Verarbeitungsmerkmal hart ausschliessen soll.
- [ ] **Intoleranz-Stufe erklaeren:** „Sensibel" schliesst nur bei
  leerer Anfrage aus, sonst −25 (`[cmd]` 075:453-455) — gewollt, aber
  fuer den Nutzer nirgends gesagt.
- [ ] **Rezept-/Planner-Zutatensuche:** sobald G-97 dort ein Suchfeld
  bekommt, `prefs=1` mitentscheiden (Erfassungs-Grundsatz spricht
  fuer an).
- [ ] **Food-DB-Katalog:** sichtbarer „mit meinen
  Vorlieben"-Schalter (serverseitig) statt der
  G-73-Client-Ausblendung — Produktfrage, in G-104 bewusst nicht
  umgebaut.

- [ ] **Seed-Neulauf reisst die Portal-Athleten aus den Seed-Konten:**
  `[cmd]` `max.seed`/`sarah.seed` werden beim Auffrischen neu angelegt,
  ihre Beziehungen zu `coach@lumeos.app` sterben per FK-Kaskade — das
  Portal zeigt dann 1 statt 3 Athleten (die `dev`-Beziehung überlebt
  seit dem Fix vom 2026-08-20). Entweder `coach-portal-fuellen.sql` an
  den Auffrisch-Ablauf anhängen oder in den Seed-Erzeuger ziehen.

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

  **Nachgetragen 2026-08-16:** `[cmd]` Der Bericht stand bis dahin
  **nicht im SSOT-Index** — deshalb hat ihn niemand gelesen. Jetzt
  eingetragen.

  `[cmd]` **Der dort genannte haerteste Fund ist erledigt, ohne dass es
  jemand bemerkt hat:** *„14 `FOR ALL`-Policies in vier Modulen mit
  `USING`, aber ohne `WITH CHECK` — ein INSERT-Leck."* Heute: **null
  solche Policies**, die Trennung je Operation kam mit C-42. **Der
  Befund betraf die Specs, nicht das Gebaute.**

  **Vor jedem neuen Modul die zugehoerige Modulakte lesen** — `[read]`
  das gehoert zu Schritt 1c in `00-UMSETZUNGSPLAENE.md`.

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

- [ ] **E-14: 26 `image_male_start`-Pfade zeigen auf `_Female`-Dateien**
  (offen geblieben aus der E-Kuration, 2026-08-18).

  `[cmd]` **26 Pfade gemessen.** Der Agent hat **keine Bilder erzeugt oder
  umbenannt**, wie beauftragt.

  `[read]` **Haengt an E-07** - der offenen Frage, ob es weibliche
  Darstellungen ueberhaupt geben soll. **Solange die nicht entschieden
  ist, waere jede Umbenennung geraten.**

  **Zwei Wege:** die Pfade auf vorhandene maennliche Dateien zeigen
  lassen - oder die Bilder besorgen. `[cmd]` Das Vorgaengerrepo hat
  `fix-exercise-media.ts`; **dort nachsehen, bevor jemand entscheidet.**






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

---

---

## GO - Goals

`[read]` Plan: `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md`



- [ ] **G-107: Der Mikronaehrstoff-Trend braucht eine Referenz je Tag**
  (neu 2026-08-20, aus G-101).

  `[cmd]` **Die Werte liegen je Tag vor** — `daily_summary` fuehrt 28
  Mikronaehrstoffe als Spalten. Ein Trend waere rechenbar.

  `[cmd]` **Was fehlt, ist die Referenz je Tag.**
  `daily_reference_assessment` rechnet **einen Tag auf einmal**; ein
  Trend ueber 30 Tage braeuchte 30 Aufrufe je Seitenaufruf.

  `[read]` **Zwei Wege:** eine Sammelfunktion in der Datenbank (die
  bessere), oder die Referenz einmal holen und ueber den Zeitraum
  konstant halten (die billigere — sie unterschlaegt aber, dass sich
  Profilwerte aendern koennen).

- [ ] **G-108: Die Filter des Nutrients-Tabs** (neu 2026-08-20, aus
  G-101).

  `[cmd]` Der Entwurf zeigt `Today · 7d avg · 30d avg · 90d avg` und
  `All · Out of range · Deficient only`. **Die Ordnung steht seit
  G-101, die Filter fehlen.**

  `[read]` Die Zeitraeume haengen an derselben Frage wie G-107; „Out of
  range" braucht je Naehrstoff die persoenliche Referenz.

- [ ] **G-109: Der Dev-Server kompiliert geaenderte Routen wiederholt
  nicht neu** (neu 2026-08-20, aus G-100 und G-101).

  `[cmd]` **Zweimal am 2026-08-20**, bei verschiedenen Routen
  (`/v2/dashboard`, `/v2/nutrition?tab=insights`). Der Watcher meldet
  nichts, die Seite liefert den alten Stand — und `pnpm --filter
  @lumeos/web build` laeuft dabei sauber durch.

  `[cmd]` **Beide Male geprueft und ausgeschlossen:** kein fremdes
  Build-Verzeichnis, `.next-gate` sauber getrennt von `.next`. **Die
  B-18-Trennung war intakt.**

  `[read]` **Ein Neustart je Vorfall behebt es** (beenden, starten,
  `.next` bleibt) — kostet aber jedes Mal Zeit und eine Ruecksprache.
  **Die Ursache ist nicht gefunden.**

- [x] **C-54: `display_tier` als Ordnung der Anzeige benutzen**
  (neu 2026-08-16, **erledigt 2026-08-20** — Bericht
  `docs/ssot/152-nutrition-feinschliff-2.md`).

  `[cmd]` **Der Nutrients-Tab liest jetzt die Stufen.** 138
  Naehrstoffe in 12 Gruppen statt der 79 erfundenen Eintraege des
  Entwurfs; die Einrueckung folgt `display_tier`. Die Zahlen des
  Punktes bestaetigt: **31 / 47 / 60**.

  `[cmd]` **Die Falle steckte in den Daten:** `SUGAR` hat Stufe 1,
  aber `sort_index` **73** — seine Kinder beginnen bei 65. Ein
  einzelner Durchlauf haette die ersten sechs verloren; **fuenf Tests
  halten es fest.**

  `[cmd]` **Berichtigung zum Punkt:** `display_tier` wurde sehr wohl
  schon benutzt — **neunmal in `/nutrition/local-schema`**, nur nie in
  der v2-Oberflaeche.

  **Offen geblieben:** die Filter des Tabs (G-108).

  **Alter Wortlaut:**









## G - Theme V1 umsetzen

`[read]` Plan: `docs/spezifikation/10-plattform/design-system/theme-v1-umsetzung.md`

Grundlage ist `theme-v1/` - `[cmd]` 55 Modulseiten, `shell.jsx`,
`shared.jsx`, `styles.css` mit 32 Tokens und 123 Klassen, dazu zwoelf
Bildschirmfotos. **Vorlage, nicht Vertrag** (Tom, 2026-08-15): Es gibt
diverse Dinge, die ihm noch nicht gefallen - grafische Elemente, die beim
Umsetzen angepasst werden.

**Die bestehende Oberflaeche bleibt.** Die neue laeuft parallel unter
`/v2`, gegen dieselbe Datenschicht. Umgeschaltet wird am Ende (G-07).

- [ ] **G-04: Zwei Zahlen im Entwurf, die nicht stimmen** (neu
  2026-08-15). Klein, aber vor dem Bau zu klären.

  **Der Nutrition-Score steht auf `1`.** `[read]` Der Bildschirm zeigt
  Faktoren um 0,7 und Schwellen `ok ≥ 80 · warn 50–79 · block < 50`.
  `[annahme]` Skalierung 0–1 gegen Schwellen 0–100. Es ist der Wert, den
  ein Nutzer zuerst ansieht.

  **Vitamin D: 20 µg im Entwurf, 15 µg in der Datenbank.** `[cmd]` Wir
  haben EFSA `AI 15 µg` eingetragen; der Entwurf zeigt „12µg (target
  20µg)", das ist der DGE-Wert. **Beide sind belegbar, aber es muss einer
  gelten** — sonst zeigt die Oberfläche etwas anderes, als die
  Bewertungsfunktion rechnet.


- [ ] **G-06: Die übrigen Module nach Datenlage** (neu 2026-08-15).

  `[cmd]` **Training** hat 1.416 Übungen, aber keine deutsche
  Namensschicht und keine Suchfunktion — C-16 hat gemessen: 3 von 34
  Sollwerten auf Platz 1, 25 ohne Treffer. **Vor der Oberfläche zu
  lösen.**

  **Recovery, Supplements, Medical, Goals, Coach, Marketplace** haben
  keine Datenseite. Die Entwürfe stehen (`module-recovery-v2.jsx`,
  `module-supplements.jsx` mit 81 KB, `module-medical-v2.jsx`) — sie
  liefen bis dahin gegen Attrappen.

  **Reihenfolge offen.** `[read]` Die Lehre aus dem Suchumbau: erst
  messen, was die Datenseite hergibt, dann bauen.

- [ ] **G-07: Umschalten** (neu 2026-08-15). Der letzte Schritt.

  Wenn alle Module unter `/v2` stehen: die alten Ordner entfernen, `v2`
  hochziehen, Verweise anpassen. **Erst dann**, und nicht früher.

  Mit abzuräumen: `[cmd]` `apps/admin` nutzt **null Tokens** und ist
  vollständig hart verdrahtet — eigener Posten, eigene Entscheidung, ob
  Theme V1 auch dort gilt.



- [ ] **G-11: Die restlichen Nutrition-Tabs anbinden** (neu 2026-08-16).
  Setzt G-08 voraus.

  `[cmd]` Sieben Tabs stehen, drei tragen Daten (`Diary`, `Nutrients`,
  `Food DB`). **Vier sind Attrappen:** `Insights`, `Meal plans`,
  `Preferences`, `Planner`.

  | | woran es hängt |
  |---|---|
  | `Insights` | Auswertungen über Zeiträume — `daily_summary` rechnet je Tag, nicht je Woche |
  | `Meal plans` | `[cmd]` `meal_plans` existiert nicht |
  | `Preferences` | `[cmd]` `food_preferences` und `food_preference_items` existieren, sind leer und nirgends angebunden |
  | `Planner` | setzt `meal_plans` voraus |

  **`Preferences` ist der nächste realistische Schritt** — `[cmd]` die
  Tabellen stehen seit Kettenschritt `050`, mit Zeilenschutz und
  Policies. Was fehlt, ist die Oberfläche und die Verbindung zur Suche.

  `[read]` `Insights` braucht eine Wochen- oder Monatsaggregation. Seit
  den Testdaten gibt es **43 Tage je Nutzer** — das wäre erstmals
  belegbar.




- [ ] **G-17: Datum beim Modulwechsel mitgeben** (neu 2026-08-17). Rest
  aus G-14.

  `[cmd]` Heute lebt das Datum nur in der Nutrition-Adresse. Wer im
  Tagebuch auf gestern blaettert und aufs Dashboard wechselt, sieht dort
  wieder heute.

  `[read]` **Ein gemeinsamer Zustand wurde geprueft und verworfen:** Der
  Kontext des Vorgaengers ist ein Browser-Zustand, hier gibt es
  Serverkomponenten je Route — ein Browser-Kontext wuesste das Datum,
  der Server nicht. Ein Cookie waere serverseitig richtig, **aber ein
  Datum, das sich ueber Tage merkt, ist eines, das man vergisst.**

  **Der Weg: als Suchparameter im Link.** `[cmd]` Heute gibt es genau
  eine Verlinkung zwischen Dashboard und Tagebuch — **deshalb noch
  nicht dringend.** Es wird dringend, sobald das Dashboard
  datumsabhaengige Kacheln bekommt.







- [ ] **A-21: Kimi-K3-Schwarm als Rechercheweg** (neu 2026-08-19).
  **Merkposten, kein Auftrag.**

  `[cmd]` **Aufstellung seit 2026-08-19:** ChatGPT als Orchestrator,
  Kimi K3 im Schwarm als Rechercheure. **Liefert schnell und
  belegt.**

  ### Wie die Uebergabe laeuft

  `[cmd]` **Kein Repozugriff.** Er liefert **ein ZIP mit allen Daten
  darin**, das unter `backup/kimi-research/` landet — in `.gitignore`,
  wie der Cloud-Dump und der LOINC-Quellordner.

  `[read]` **Was daraus folgt fuer die Auftragsform:** Er kennt unsere
  Schemata nicht. **Jeder Auftrag muss das Zielformat mitliefern** —
  Feldnamen, Einheiten, wie eine Quelle notiert wird. **Sonst kommt ein
  guter Bestand in einer Sprache, die wir uebersetzen muessen** (siehe
  unten).

  ### Die Qualitaet ist gemessen besser als unsere Specs

  `[cmd]` **Der erste Bestand:** 1.035 Quellen, **9 gespeicherte
  Konflikte**, Evidenzgrade A–F, Validierungsbericht mit 0 Fehlern.

  `[read]` **Unsere KI-erzeugten Specs haben in derselben Zeit sieben
  inhaltliche Fehler produziert** (A-20). **Der Unterschied liegt am
  Verfahren:** Dort werden Konflikte festgehalten statt weggeglaettet,
  und jede Aussage traegt ihre Quelle.

  ### Und der Bruch beim Wachstum ist die Lehre

  `[cmd]` **Von 56 auf 503 Wirkstoffe** — dabei fielen **alle sieben
  Feldvertragsklassen weg** (`anticoagulant:warfarin`, `SSRI`, …), **224
  von 503 stehen auf `unclassified`**, und **ATC steht auf genau den
  alten 56.**

  `[read]` **Deshalb gehoert in jeden Auftrag:** das Zielvokabular
  ausdruecklich, **und die Bitte, es bei jeder Erweiterung zu
  halten.**

- [ ] **A-22: Was an Kimi gehen kann — klassifiziert** (neu
  2026-08-19). **Auftraege schreiben, sobald er frei ist.**

  ### Klasse A — Fachliteratur, klar umrissen

  `[read]` **Zahlen, die im Repo als *„conservative defaults"* stehen und
  niemand belegen kann. Jede blockiert eine Kachel.**

  | | |
  |---|---|
  | **C-105** | **MEV/MAV/MRV** — blockiert dreifach: Volume landmarks, Zielband *14/16 Saetze*, Einstufung Beginner…Elite |
  | **C-124 (E5)** | **Modalitaeten-Bonuswerte** — Sauna, Massage, Eisbad, Dehnen |
  | **C-124 (E8)** | **Motivations-Schwelle** · und: ab wie vielen Signalen ueber wie viele Tage ist ein Arzt-Hinweis angebracht? |
  | **C-109** | **`rest_days` und Nadelstaerke je Injektionsort** — die Volumina hat F-05 belegt |

  `[cmd]` **Vorschlag: C-105 und C-124 als ein Auftrag** — dieselbe
  Literatur, dieselben Zeitschriften, **zusammen fuenf Kacheln.**

  ### Klasse A — Nachtrag 2026-08-19

  `[cmd]` **G-89: Koerperproportionen.** 1.618, V-Taper und der
  Reeves-Wert stehen nur in `theme-v1/uploads/` — **Begleitdateien, keine
  Spezifikation.** *„`daten.ts:438` gibt fest 88 zurueck."*

  `[read]` **Zu recherchieren:** Gibt es belegte Referenzwerte fuer
  Koerperproportionen im Kraftsport — oder ist das durchweg Tradition
  ohne Datengrundlage? **Beide Antworten sind brauchbar.** WHO 2008 zu
  Taille:Huefte zeigt, dass es fuer manche Verhaeltnisse Belege gibt.

  `[cmd]` **C-145: Trainingsplanung.** *„Bloecke, Wochen mit Phasenzweck,
  Routinen mit Herkunft"* — **welche Strukturen sind in der
  Trainingsliteratur ueblich?** Periodisierung, Mesozyklen,
  Undulating gegen Block. `[read]` **Das entscheidet das Schema**, und
  ein falsches Schema kostet mehr als die Recherche.

  ### Klasse B — Datenluecken im bestehenden Format

  `[cmd]` **Die 9 Marker aus G-84** — ApoB, PSA, Zink, FSH, IGF-1,
  Prolaktin, Calcium. **Mit LOINC-Code, Einheit, Referenzbereich,
  Quelle.** `[read]` **Der einfachste Auftrag:** Das Format steht (C-84
  hat 560 Bereiche gebaut), es fehlen neun Zeilen.

  `[cmd]` **C-108** — die **6 Supplement×Medikament-Wechselwirkungen**
  (Warfarin, SSRIs, Pille). **Unsere 28 CSV-Zeilen sind unbelegt.**

  ### Klasse C — geht nicht an Kimi

  `[cmd]` **C-71, C-123** — Toms Entscheidungen, keine Recherche.
  **C-114, C-115** — von Fable erledigt. **C-116** — wartet auf Kimis
  eigene Lieferung. **C-127, E-14, G-70** — Befunde im Repo, keine
  Aussenfrage.

- [ ] **A-18: `theme-v1/uploads/` — die Bruecke zwischen Spec und
  Entwurf** (neu 2026-08-18). Befund aus der G-42-Vorarbeit.

  `[cmd]` `docs/spezifikation/10-plattform/design-system/theme-v1/uploads/`
  enthaelt **die Spec-Dateien, die Claude Design bekommen hat** — mit
  Hash im Namen: `SPEC_10_COMPONENTS-d99c9f3e.md`,
  `SPEC_04_FEATURES-aadfc7f5.md`, `SPEC_09_SCORING-8a1632fa.md`.

  `[cmd]` **Sie steht in keinem Index** — weder im SSOT noch in der
  Spezifikation. **Vierter unentdeckter Fundus** nach
  `referenz/lumeos-2026/`, `docs/ssot/70-spec-audit/` und
  `apps/web/public/mockup/`.

  ### Warum sie zaehlt

  `[read]` **Tom, 2026-08-18:** *„Das Design wurde aus den Specs und der
  Vision von Claude Design erstellt, also muss das irgendwo definiert
  sein."* — **Und es war so.** Alle vier unklaren Buddy-Tabs
  (`clone`, `bss`, `signature`, `butler`) stehen dort definiert.

  **Damit laesst sich pruefen, ob der Entwurf auf dem aktuellen
  Spec-Stand beruht** — und was sich seither geaendert hat. `[cmd]` Ein
  Vergleich der Hash-Dateien gegen `docs/specs/` sagt es Datei fuer
  Datei.

  **Was zu tun ist:** Bestand aufnehmen, in den Index, und den Abgleich
  fahren. `[read]` Wo Entwurf und heutige Spec auseinanderlaufen, ist
  **der Entwurf nicht automatisch veraltet** — bei den TDEE-Formeln war
  die Vorlage genauer als die Spec (W-6).

- [ ] **A-16: `public/mockup/` als dritten Fundus auswerten** (neu
  2026-08-17). **Tom, 2026-08-17:** *„Der Rest — koennen wir als
  Ergaenzung anschauen und weitere Ideen einbringen; das war ein
  Zwischenwurf, der auch schon sehr weit war."*

  `[cmd]` **Ueber 90 Dateien fuer alle elf Module**, teils sehr
  ausgearbeitet: `MicroDashboard.js` 27 KB, `PreferencesView.js` 18 KB,
  `DiaryView.js` 17 KB, `HistoryView.js` 12 KB, dazu `tokens.css`,
  `index.html` und ein Shell-Geruest.

  `[cmd]` **Es stand in keinem Index** — weder im SSOT noch in der
  Spezifikation. Damit ist es der dritte unentdeckte Fundus nach
  `referenz/lumeos-2026/` und `theme-v1/`.

  ### Der Rang ist geklaert

  `[read]` **`theme-v1/` bleibt die Vorgabe.** `public/mockup/` ist
  **Ergaenzung und Ideenquelle**, kein Sollwert — Tom nennt es einen
  Zwischenwurf.

  **Was das praktisch heisst:** Wo `theme-v1` etwas zeigt, gilt
  `theme-v1`. Wo es eine Luecke hat oder `public/mockup` eine bessere
  Loesung traegt — wie bei der Muskelkarte — **wird sie vorgelegt, nicht
  uebernommen.**

  **Der Wegweiser fehlt.** `[read]` Bei `referenz/` hat
  `docs/ssot/80-vorgaengerrepo-fundus.md` das geloest; hier braucht es
  dasselbe: was liegt wo, und was davon ist besser als das, was wir
  haben.




- [ ] **G-83: Es gibt kein Onboarding** (neu 2026-08-19). Befund aus
  G-80.

  `[cmd]` **Gemessen:** *„Die einzige Datei ist der Klienten-Assistent im
  Coach-Modul."* **Ein Onboarding fuer den Nutzer existiert nicht.**

  `[read]` **Das betrifft mehr als den Erfahrungsgrad (C-118).** Wer sich
  neu anmeldet, hat kein Profil, keine Vorlieben, keine Ziele — **und
  die Anwendung fragt ihn nichts.**

  `[cmd]` **Was beim ersten Start gebraucht wuerde:** Alter, Geschlecht,
  Groesse, Gewicht, Aktivitaetsniveau (fuer die TDEE-Formel) ·
  Erfahrungsgrad · die vier Preferences-Schritte · ein erstes Ziel.

  `[read]` **Das Vorgaengerrepo hatte es als vierstufigen Assistenten**
  (`FoodPreferences.tsx`) — **aber der war der Preferences-Tab, kein
  Onboarding.**

  `[cmd]` **Und C-122 hat gezeigt, was ohne Profilangaben passiert:**
  `very_active` gegen 0,58 Trainings je Woche, **1.030 kcal Abstand
  zwischen Formel und Messung.**

- [x] **G-13: Der Add-Food-Dialog braucht die ganze Suchlogik**
  (neu 2026-08-17, **erledigt 2026-08-20** — Bericht
  `docs/ssot/144-erfassungsdialog.md`).

  **Gebaut:** Vorlieben (C-94) gelten jetzt beim Erfassen — `p_user_id`
  aus der SITZUNG, nicht aus der Anfrage. `[cmd]` Fuer `dev@lumeos.app`
  faellt „mandel" von **64 auf 0** (Nussallergie, 63 der 64 Treffer
  tragen `contains_nuts`), „nuss" von 125 auf 42. **Dazu der Satz, der
  die leere Liste erklaert** („64 Eintraege sind durch deine Vorlieben
  ausgeblendet") — sonst sieht das wie ein Datenbankfehler aus.
  **Vier Filter, 4/4 gegen SQL geprueft** (1.751 / 1.377 / 1.400 /
  2.884), zwei Sortierungen. **Zeilenschutz:** `test-user` sieht
  64/125, wo `dev` 0/42 sieht.

  `[cmd]` **Der Auftrag nannte die falsche Datei:** `erfassen.tsx` hat
  **null Importeure**; gebaut wurde in `mahlzeiten.tsx`
  (`HinzufuegenModal`).

  **OFFEN GEBLIEBEN — der Namensteil, siehe G-93.**

- [ ] **G-93: Der Anzeigename fehlt im laufenden Erfassungsdialog**
  (neu 2026-08-20, aus G-13).

  **Tom, 2026-08-17:** *„richtige Begriffe wie weisser Reis anstatt
  Reis poliert."*

  `[cmd]` **Der Punkt galt weiter, nur nicht dort, wo G-13 ihn suchte.**
  Der G-13-Auftrag hielt ihn fuer erledigt — **erledigt ist er in
  `erfassen.tsx`, und die Datei wird nicht ausgeliefert.**

  `[cmd]` **Die laufende Fassung `mahlzeiten.tsx` zeigt `name_de` an
  drei Stellen:** **750** (Trefferliste), **766** (Auswahlkopf), **535**
  (was nach der Auswahl im Suchfeld steht).

  `[cmd]` **5.014 von 7.140** Eintraegen tragen einen abweichenden
  `name_display_de` — gemessen 2026-08-20, **nicht 2.870 wie frueher
  notiert.** `food_search` liefert beide Felder, `food-search.ts` kennt
  beide.

  `[read]` **Eine Zeile je Stelle:** `f.name_display_de || f.name_de`.
  Der Rueckfall bleibt noetig, weil nicht jeder Eintrag einen
  Anzeigenamen hat.

- [x] **G-97: Planner an die C-150-Tabellen anschliessen**
  (neu 2026-08-20, **erledigt 2026-08-20** — Bericht
  `docs/ssot/147-meal-plans.md`).

  `[cmd]` **Der Planner liest echt:** Plan „Aufbau-Wochenplan"
  (2.500 kcal / 170 g P), drei Wochen — gefuellt 28, leer 0, kopiert 28
  —, angezeigt **18.6.–24.6. mit 28 kcal-Zellen**, Attrappenmarken im
  Tab **0**.

  `[cmd]` **Die kcal sind gerechnet**, nicht wie im Entwurf gewuerfelt:
  `recipe_nutrition` und `food_nutrient_snapshot` (C-150). Sichtbar an
  der Skalierung — 493 kcal bei 1×, **617 bei 1,25×**.

  `[cmd]` **Zwei der acht G-72-Spalten wirken jetzt**
  (`meals_per_day`, `snacks_per_day` bestimmen die Rasterzeilen), drei
  sind sichtbar vergleichbar, **drei bleiben wirkungslos** — Details in
  G-99.

  **Kein Generator gebaut**, wie verlangt.

- [ ] **G-98: Meal plans braucht einen Zustand und eine Herkunft**
  (neu 2026-08-20, aus G-97). **Schemafrage — Codex.**

  `[cmd]` **`MealPlansView` IST im Mockup definiert**, entgegen der
  Annahme in G-97 und C-150: `module-nutrition-spec.jsx:334`. **Beide
  suchten in `module-nutrition.jsx`**, die es ueber die Dateigrenze
  hinweg als `window.MealPlansView` aufruft.

  **Der Tab hat also eine Vorlage. Ihm fehlen die Daten:**

  `[cmd]` **1. Ein Zustand je Planeintrag.** `meal_plan_entries` fuehrt
  keine Spalte fuer `confirmed`/`deviated`/`skipped`/`pending`. Die
  Kachel „Today's ghost entries" und die 7-Tage-Compliance rechnen
  genau darueber.

  `[cmd]` **2. Eine Herkunft am Tagebuch.** `meals` und `meal_items`
  tragen **keinen Verweis auf einen Planeintrag**. Ohne ihn ist nicht
  entscheidbar, ob ein erfasster Eintrag der geplante war.

  `[read]` **Zusammen heisst das: Compliance ist heute nicht
  ableitbar, auch nicht naeherungsweise.** Die beiden Punkte gehoeren
  zusammen entschieden — ein Zustand ohne Herkunft bliebe Handarbeit.

  `[cmd]` **3. Lebenszyklus und Urheberschaft.** Der Entwurf zeigt
  *„Day 3 of 7 · started May 14"* und die Quellen `coach`/`user`/
  `marketplace`/`buddy`. `meal_plans` fuehrt weder Startdatum noch
  Laufzeit noch Urheber; `measurement_source` meint die Messherkunft.

  `[read]` **4. Die Einkaufsliste waere OHNE Schemaaenderung baubar** —
  `[cmd]` **72 von 112** Planeintraegen haengen an Rezepten mit Mengen.
  Es fehlt nur eine Kategorie je Lebensmittel („Fleisch & Fisch") und
  die Umrechnung in Einkaufseinheiten. **Der guenstigste der vier
  Punkte.**

- [x] **G-100: Das Dashboard an die Module anschliessen**
  (neu 2026-08-20, **erledigt 2026-08-20** — Bericht
  `docs/ssot/149-dashboard.md`).

  `[cmd]` **Attrappen gerendert 11 → 6.** Das Dashboard war das
  einzige nie angebundene Modul und die erste Seite, die ein Nutzer
  sieht.

  `[cmd]` **Gemessen fuer den 2026-08-20:** Recovery **83,9** (Schnitt
  der sieben Tage davor 80,7), Schlaf **7,8 h**, Kalorien
  **2.727/2.500**, Training **15/14**, **3 von 41 PRs**, Medical
  **2 + 5**, Supplements **93,5 %**.

  `[read]` **Nichts neu gerechnet** — Medical laeuft ueber dieselbe
  Kette wie sein Modul (G-84), die Tagesziele ueber `getZielwerteAm`.

  `[cmd]` **Der Stichtag statt der juengsten Zeile:** Die Seeds laufen
  bis 2026-11-06; `ladeScores()` haette einen Novemberwert als „heute"
  gezeigt.

  **Gemeldet statt gebaut:** der Readiness-Komposit und *„Push hard"*,
  Body battery (**gibt es im Schema nicht**), Block/Woche/Coach bei
  „Tonight", die Dauer je Ereignis beim Tagesverlauf.

  **Offen geblieben:** G-101 und G-102.

- [ ] **G-101: Der Aktivitaetsstrom des Dashboards** (neu 2026-08-20,
  aus G-100).

  `[cmd]` **Er waere baubar** — anders als der Tagesverlauf braucht er
  keine Dauer, nur Zeitpunkt, Modul und einen Satz. Die Zeitpunkte
  liegen vollstaendig vor: `meals.meal_time` **725/725**,
  `intake_logs.intake_time` **360/360**,
  `workout_sessions.started_time` **30/30**.

  `[read]` **Was fehlt, ist eine Entscheidung, keine Spalte:** Es gibt
  keine gemeinsame Ereignistabelle. Sechs Abfragen je Seitenaufruf,
  nach Zeit gemischt — **oder** eine Sicht in der Datenbank, die das
  einmal tut. Das Zweite waere die Loesung, das Erste die Abkuerzung.

- [ ] **G-102: Zwei SVG-Pfade der Muskelkarte sind abgeschnitten**
  (neu 2026-08-20, aus G-100). **`packages/ui`.**

  `[cmd]` **Zwei Konsolenfehler auf jeder Recovery-Seite:**
  `<path> attribute d: Expected number`.

  `[cmd]` **Kein Encoding-Problem**, obwohl die Meldung so aussieht:
  `packages/ui/src/koerperkarte-pfade.ts` enthaelt **0 Ersatzzeichen
  (U+FFFD)** — das `?` in der Konsole ist die Konsole.

  `[cmd]` **Es sind abgeschnittene Pfaddaten.** Ein `C` braucht sechs
  Zahlen:

  ```
  … C 89.50 823.53 109.24 767.88 A 0.37 …   ← vier, dann folgt A
  … C 1039.32 221.19 C 1041.33 230.61 …     ← zwei, dann folgt C
  ```

  `[cmd]` **Unveraendert seit `3dae1a2`** — die Daten kamen so ins
  Repo. Die Karte zeichnet; nur diese zwei Teilstuecke fehlen.

  `[read]` In G-100 nicht behoben, weil `packages/ui` dort gesperrt
  war.

- [ ] **G-99: Drei der acht Planner-Spalten bleiben wirkungslos**
  (neu 2026-08-20, aus G-97).

  `[cmd]` **Gemessen am 2026-08-20:**

  | Spalte | Wert bei `dev` | Zustand |
  |---|---|---|
  | `meals_per_day` | 4 | **wirkt** — Rasterzeilen |
  | `snacks_per_day` | 1 | **wirkt** — Snackreihe |
  | `cooking_skill` | `advanced` | sichtbar je Rezept |
  | `prep_time_max_min` | 30 | sichtbar vergleichbar |
  | `preferred_cuisines` | `{mediterranean}` | sichtbar je Rezept |
  | `budget_level` | `medium` | **wirkungslos** |
  | `meal_prep_ok` | `true` | **wirkungslos** |
  | `planner_notes` | Testtext | **wirkungslos** |

  `[cmd]` **Der Grund ist kein Anzeigefehler:** `nutrition.recipes`
  fuehrt **kein Preis- und kein Vorkochfeld** — gegen
  `information_schema` geprueft. Von den acht Spalten hat **nur
  `cooking_skill`** eine Entsprechung an `recipes`.

  `[read]` **„Sichtbar" ist nicht „filtert".** Die drei mittleren lassen
  sich vergleichen; ein Filter waere eine Rezeptauswahl und gehoert zum
  Schreibpfad.





- [ ] **G-25: Training an echte Daten anschliessen** (neu 2026-08-17).
  Folgt auf C-66.

  `[cmd]` `/v2/training` steht mit **38 Kacheln, alle Attrappe** — der
  Grund war, dass es keine Sitzungen gab. **Seit `106` gibt es sie.**

  `[cmd]` Live liegen 9 Sitzungen, 18 Uebungen, 60 Saetze; dazu die
  Stammdaten mit 1.416 Uebungen, 58 Geraeten und 6.624
  Muskelzuordnungen.

  **Der Tab „Exercises" ist der naechste Schritt.** `[read]` Aus dem
  G-16-Bericht: *vier von sechs Spalten sind sofort da; `e1RM` und
  `Best set` bleiben `—`, weil sie Saetze brauchen.* **Jetzt sind sie
  da.**

  `[cmd]` `e1RM` braucht eine Formel — `[read]` das Vorgaengerrepo hat
  `OneRepMaxCalculator.tsx` mit **42 Fundstellen zu Epley und Brzycki**.
  **Dort nachsehen, bevor jemand rechnet.**

  **Angebunden heisst: Marke weg.** Alles andere behaelt sie.
















- [ ] **C-87: `exercises_select` war aus der Datenbank verschwunden**
  (neu 2026-08-18). **Behoben, aber die Ursache ist offen.** Befund aus
  G-64.

  `[cmd]` **`training.exercises` hatte RLS an und null Policies.** Alle
  sieben anderen `training`-Tabellen hatten welche — `equipment` 1,
  `exercise_muscles` 1, `muscle_groups` 1, `workout_*` je 4.

  `[cmd]` **Es ist Drift, kein Entwurf:** Die Kette definiert
  `exercises_select` in `100_training_schema.sql:266`, und sie greift —
  alle 1.416 sind `is_active`, `public.is_admin()` existiert.

  `[cmd]` **Wiederhergestellt am 2026-08-18**, woertlich aus der Kette.
  **Der Beleg fuer das Verschwinden:** `DROP POLICY IF EXISTS` meldete
  *„does not exist, skipping"*. Danach 1.416 Zeilen als `authenticated`.

  **Offen:** Wie ist sie verlorengegangen? `[read]` Ein Kettenschritt,
  der die Tabelle neu anlegt, waere der Verdacht — **`108` und `109`
  haben `training` angefasst.** `[cmd]` **Und die
  Schema-Vollstaendigkeitspruefung hat es nicht gemeldet** — sie prueft
  Tabellen und Spalten, offenbar nicht Policies.






- [ ] **G-70: Sortierbare Spalten und Herkunfts-Filter im Food-DB-Tab**
  (neu 2026-08-19). **Nach G-65 und C-94.**

  **Tom, 2026-08-19:** *„Ich will mehr Filter haben. Wenn man schon eine
  Tabelle hat, wieso die Spalten nicht gleich sortierbar machen, wie z.
  B. P/C/F/kcal. Favoritenfilter, eigene Foods (fuer spaeter), wie
  gestern, aus Mealplan. Weitere sortierbare Filter, die wir eh schon in
  den Daten haben."*

  ### Warum nach G-65

  **Tom:** *„Preferences fertigbauen, das loest auch schon viel
  Sortiererei."*

  `[read]` **Richtig — wer Magermilchpulver nie isst, sieht es nicht
  mehr.** Dann muss die Sortierung weniger leisten. **Umgekehrt waere
  Doppelarbeit:** Wer die Filterleiste baut, bevor die Vorlieben
  greifen, baut sie zweimal.

  ### Spalten sortierbar

  `[cmd]` **Die Tabelle traegt sie bereits als Ueberschriften:**
  `KCAL/100G`, `P`, `C`, `F`. **Ein Klick muesste reichen**, ein zweiter
  kehrt um.

  `[read]` **Ein Cronometer-Nutzer wuenscht sich genau das:** *„Protein
  > 70 %, Kalorien < 40/100 g, sortiert nach hoechstem Protein,
  untersortiert nach niedrigsten Kalorien."* — **Fuer einen
  Bodybuilder ist das der eigentliche Griff.**

  ### Herkunfts-Filter

  | | Quelle |
  |---|---|
  | **Favoriten** | `food_preference_items` — kommt mit G-65 |
  | **Wie gestern** | `meal_items` des Vortags |
  | **Eigene Foods** | `foods_custom` — spaeter, Tabelle existiert |
  | **Aus Mealplan** | **kein Schema** — melden, nicht bauen |

  `[read]` **„Wie gestern" ist der staerkste davon** — es ist der
  haeufigste Griff beim Erfassen, und `meal_items` protokolliert es
  bereits. `[cmd]` **Cronometer sortiert nach zuletzt und am
  haeufigsten benutzt.**

  ### Was die Daten sonst hergeben

  `[cmd]` **`preparation_kinds`** — 11 Zubereitungsarten mit
  gemessenem Muster (roh 662×, gebraten 562×, tiefgefroren 430×,
  gekocht 284×).

  `[cmd]` **`processing_level`** — seit C-100 **acht Stufen**: `raw`
  3.251, `cooked` 2.346, `ultra_processed` 927, `minimally_processed`
  254, dazu `canned`, `dried`, `fermented`, `smoked`.

  `[cmd]` **`is_prepared_dish`** und **`food_source`** (BLS gegen
  eigene).

  ### Was die Recherche vorgibt

  `[cmd]` **Trefferzahl an jede Option** — *Proteinreich (1.400)*,
  *Vegan (1.377)*. `[read]` **Das verhindert den Fall, dass zwei Filter
  null Treffer ergeben.**

  `[cmd]` **ODER innerhalb einer Gruppe, UND zwischen den Gruppen.**
  **Echtzeit-Aktualisierung auf dem Desktop** — Baymard nennt es das
  bevorzugte Muster.

  `[cmd]` **Bei 375 px ein Vollbild-Fenster** statt der Zeile —
  Seitenleisten funktionieren dort nicht.

  ### Und die Blaetterfunktion fehlt

  `[cmd]` **Der Tab zeigt „die ersten 50" von 279** — kein
  Weiterblaettern, kein Nachladen. **Tom:** *„Wenn man Treffer 279
  zeigt, dann gibt man auch die Moeglichkeit, die alle anzuschauen."*



- [ ] **C-107: Der Supplement-Katalog und was ihm fehlt** (neu
  2026-08-19). Befund aus der F-02-Bestandsaufnahme
  (`docs/ssot/121-supplements-bestandsaufnahme.md`).

  ### Die gedachte Importquelle existiert nicht

  `[cmd]` **`SPEC_08_IMPORT_PIPELINE` (17 KB) sagt selbst *„kuratiert,
  keine automatisierte Uebernahme"*** — und ist Seed-SQL fuer **nur 18
  Praeparate.**

  `[cmd]` **Die echte Kandidatenliste ist die Mini-PC-CSV: 702
  Datensaetze** — **nicht 1.302, wie der Kommentar im Importskript
  behauptet.** Davon **200 Enhanced/PED** (Steroide, SARMs, Peptide), 40
  unkuratierte Kategorien, **0 mit Quellenangabe.**

  ### Konkreter als die Stueckzahl

  `[cmd]` **Dem 44er-Katalog fehlen `nutrients_provided` auf 33
  Eintraegen** und **vier Gap-Analysis-Codes** — darunter `FAPUN3`:
  *„Omega-3 ist da, traegt aber den Code nicht."*

  `[read]` **Damit ist der Gap-Score der Spec heute nicht rechenbar.**
  **Das wiegt schwerer als die Katalogzahl** — 44 Eintraege ohne
  Naehrstoffbezug tragen weniger als 20 mit.

- [ ] **C-108: Wechselwirkungen — nennen ja, bewerten nein** (neu
  2026-08-19). Befund aus F-02.

  `[cmd]` **Die Tabelle ist voll ausgestaltet** (Severity, Timing,
  `blocks_intake`) **und bewusst leer** (C-68).

  `[cmd]` **Zum Befuellen liegen bereit:** 28 CSV-Zeilen (alle
  Supplement×Supplement, plausibel, **aber unbelegt**) und 12
  Spec-Zeilen — **6 davon Supplement×Medikament** (Warfarin, SSRIs,
  Pille) **und brauchen ein Medikationsmodell, das Medical nicht
  fuehrt.**

  `[read]` **Die Grenze, wie F-02 sie zieht:** *„Nennen = kuratierte
  Zeile zeigen, wenn beide Seiten im Stack — genau so tat es der
  Vorgaenger in `intelligence.ts`. Bewerten (Score, Blockade,
  Zeitplan-Urteile wie im Mockup: „your current schedule is fine")
  bleibt draussen."*

  `[cmd]` **Warnschuss:** `SPEC_05` fuehrt eine **Severity `high`, die es
  im Schema gar nicht gibt.** `[read]` Dritter Beleg dafuer, dass die
  Specs nicht stimmen (nach C-84 und C-92).

- [ ] **C-109: Die Injektions-Grenzwerte sind unbelegt** (neu
  2026-08-19). Befund aus F-02. **Entscheidung fuer Tom.**

  `[cmd]` **Der 17-KB-Change-Request ist deckungsgleich mit dem
  G-45-Mockup.** **Drei Objekte reichen:** `injection_sites` als
  Stammdaten, `injection_logs`, **Schedule abgeleitet — keine
  Tabelle.** Enhanced ist keine Voraussetzung.

  `[cmd]` **Aus Daten kommen:** Ruhefenster-Zustand,
  Ueberbeanspruchung, Ortsvorschlag — **reine Arithmetik ueber das
  eigene Protokoll.**

  `[cmd]` **Aussagen sind die 16×3 Grenzwerte selbst** — `max_ml`,
  `rest_days`, Nadelstaerke. **Der CR nennt sie *„conservative
  defaults"*, belegt ist im Repo keine einzige Zahl.**

  `[cmd]` **Teilweise erledigt durch F-05 (2026-08-19):** Die
  IM-Volumina sind aus Pflegeliteratur belegt — **Deltoid 1–2 ml, Vastus
  1–5 ml, Ventrogluteal bis 3 ml.** *„Die haengen damit nicht mehr an
  deiner Abnahme."*

  `[cmd]` **Was die Literatur nicht liefert:** `rest_days` und
  **Nadelempfehlung je Ort** — die bleiben *„conservative defaults"*.

  **Entschieden (Tom, 2026-08-19): wissenschaftliche Quellen suchen.**
  `[read]` **Keine Abnahme aus dem Bauch** — fuer `rest_days` und
  Nadelstaerke je Ort gibt es Pflege- und Fachliteratur, wie fuer die
  Volumina.

  ### Und die Grafik gehoert getauscht

  **Tom, 2026-08-19:** *„Bei Injections muessen noch die neuen Grafiken
  rein."*

  `[cmd]` **Der Tab zeigt heute die einfache Silhouette der Vorlage**
  (viewBox 100×120), in G-57 sichtbar gemacht. **Gemeint ist die
  vollstaendige Figur** wie in `MuscleBodyMap_test.html` — mit Anatomie,
  wie sie die Koerperkarte seit G-55 traegt.

  `[cmd]` **G-53 haengt daran:** `InjektionsKarte` in `packages/ui` hat
  keinen Aufrufer, **weil die Vorlage sechs Felder je Ort fuehrt, die
  der Baustein nicht hat.** Beim Grafiktausch entscheidet sich, ob sie
  bleibt oder faellt.
  **Dieselbe Regel wie bei MEV/MAV/MRV (C-105) und den
  Naehrstoff-Referenzwerten (C-45).**

- [ ] **C-110: Cost-Rest und Compliance-Notizen** (neu 2026-08-19).
  Befund aus F-02.

  `[cmd]` **Compliance ist anbindbar** — 90 Tage, 8 `skipped` im
  30-Tage-Fenster, 93,3 % (C-82/C-103). **Offen nur, ob die
  `skipped`-Zeilen `notes` tragen** — nirgends gemessen.

  `[cmd]` **Bei Cost fehlen:** Trend (**3 ehrliche Monatspunkte statt
  12**) und *„If you removed…"* (**reine Subtraktion**).

  `[read]` **`Cost optimization` bleibt Beratung, keine Rechnung** —
  draussen.

- [ ] **C-111: Recovery — neun Entscheidungen und drei Formelfehler**
  (neu 2026-08-19). **Entscheidungen fuer Tom.** Aus dem F-01-Entwurf
  (`docs/spezifikation/30-module/core/recovery/00-schemaentwurf.md`).

  ### Der Zuschnitt

  `[cmd]` **`recovery.checkins` passt unveraendert.** Dazu **fuenf neue
  Strukturen:** `scores`, `hrv_readings`, `modality_log`,
  `overtraining_alerts`, `protocols`/`protocol_assignments`.

  `[cmd]` **Plus eine Luecke, die keine der drei Quellen abdeckt:**
  `protocol_task_checks` — *„das Mockup zeigt abhakbare Tagesaufgaben,
  die Spec hat keinen Ort dafuer."*

  `[cmd]` **Zwei zurueckgestellt:** `sleep_data` bis zum
  Wearable-Import, Stress bis zur Produktentscheidung.

  ### Vier Spec-Tabellen verworfen — mit Begruendung

  `[read]` **Vor allem `training_load_logs`:** *„Die Spec kopiert
  Trainingsdaten ins Recovery-Schema, der Vorgaenger hat nachweislich
  direkt aus `workout_sets` gerechnet."* `[cmd]` Und
  `training.workout_sets` existiert hier seit Schritt `106` mit allen
  noetigen Spalten.

  ### Drei echte Formelfehler

  `[cmd]` **Der SQL-Score-Trigger der `SPEC_06`** — der Trainingsterm
  ergibt **immer rund volle Punkte.**

  `[cmd]` **Die ACWR-Kurve des Mockup-Motors** — **Faktor 1.1 bei ACWR
  1.4**: *„erhoehtes Verletzungsrisiko verbessert den Score."*

  `[cmd]` **Die gedruckten HRV-Anker widersprechen der eigenen Formel.**

  `[read]` **Vierter Beleg dafuer, dass die Specs nicht stimmen** — nach
  C-84 (Magnesium/Methaemoglobin), C-92 und C-108 (Severity `high` ohne
  Schema).

  ### Der stabile Kern stimmt ueberall

  `[cmd]` **In allen drei Quellen identisch:** Manual-Gewichte
  30/15/15/10/15/10/5, HRV 70 + z×15, Basiskurve, Bonusdeckel 5.
  **Darum herum liegen rund zwoelf Widersprueche.**

  `[cmd]` **Und die Soreness-Mittelung entscheidet, ob der Term
  ueberhaupt wirkt:** *„ein Muskel mit Kater 3 ergibt je nach Quelle
  9,4/10 oder 0/10 Punkte."*

  ### Neun Entscheidungen (E1–E9)

  **Kern:** Score-Gewichte bestaetigen · **oder V1 bewusst nur
  `manual`** (`[cmd]` 27 von 36 Check-ins hatten kein HRV) ·
  Soreness-Mittelung · **die sechs Readiness-Texte und der Arzt-Hinweis
  als Urteilssprache** · Stress-Score ja oder nein.

  ### Reihenfolge

  Score → Modalitaeten → Muskelkarte (**nur Lesefunktion ueber
  Training**) → HRV → Protokolle → Uebertraining (braucht Wochen
  Verlauf) → Schlaf und Stress zuletzt.

  `[cmd]` **Der genannte Querblocker ist bereits behoben** — `recovery`
  steht seit 2026-08-18 in `config.toml` (G-55). **Der Entwurf ist an
  dieser Stelle veraltet.**

- [ ] **C-112: Buddy, Coach und Marketplace — elf Entscheidungen** (neu
  2026-08-19). **Entscheidungen fuer Tom.** Aus dem F-03-Entwurf
  (`docs/spezifikation/30-module/addon/00-entwurf-buddy-coach-marketplace.md`,
  680 Zeilen).

  ### Das Rechtemodell traegt fuer beide — auf einer Achse

  `[cmd]` **Sicht:** ein Grant-Objekt, **7 Module, 3 Stufen, Historie
  append-only.** *„Die Vorlage zeigt Buddy ohnehin als Spalte in
  derselben Matrix."*

  `[cmd]` **Autonomie muss sich unterscheiden:** beim Coach zweiwertig
  nach C-95, **bei Buddy eine Proaktivitaetsstufe** — *„deren Skala in
  den Specs exakt invertiert dokumentiert ist: `SPEC_03` Level 5 = Buddy
  entscheidet, `SPEC_11` Level 1 = Buddy entscheidet."*

  `[cmd]` **Die Widerrufshistorie wird gebraucht** — C-71 hatte sie als
  fehlend vermerkt, **hier ist die Antwort ja, mit Begruendung.**

  `[read]` **Die wichtigste Regel im Entwurf:** *„Buddys Ausleitung an
  den Human Coach (`/for-human-coach`, ohne Consent-Check in der Spec)
  erbt die Coach-Freigabematrix, sie bekommt keine eigene."*

  ### Buddy: 16 Tabellen, aber der Kern fehlt

  `[cmd]` **`CoachMemory`, die Kernstruktur, hat keine Tabelle.**
  **Vergessen ist nirgends geregelt** — append-only-Log gegen DSGVO. Der
  Vorgaenger hat **vier parallele Gedaechtnismodelle**;
  Konsolidierungsvorschlag steht im Entwurf.

  `[cmd]` **Die Daten fuer die elf deterministischen Engines liegen seit
  C-78 fast vollstaendig vor.**

  ### Coach: vier Luecken in den Specs

  `[cmd]` **Kein Beendigungspfad.** **Consent-Log zweimal zugesichert
  und nie modelliert.** **Auto-Delivery hebt das Vorschlagsmodell aus.**
  **Der Einwilligungs-Trigger ist ein Placebo.**

  `[read]` **Uebernahmekandidat:** der Rule-Builder v2 des Vorgaengers —
  *„dessen Metrik-Whitelist enthaelt keine medizinischen Werte (selbst
  gegrept)."*

  ### Marketplace: drei oekonomische Befunde

  `[cmd]` **Creator erhaelt real 64 % statt 80 %** — Doppelabzug,
  `SPEC_09:198-200`. **Das Abo ist wirtschaftlich gratis** (1:1-Voucher).
  **Gebuehrensatz 15 % gegen 20/10/25 % nebeneinander.**

  `[read]` **Acht Rechtsfragen benannt, nicht entschieden — die
  schaerfste:** *„die „kein E-Geld"-Konstruktion wird vom eigenen Top-up
  unterlaufen (echtes Geld → nicht auszahlbarer, verfallender
  EUR-Saldo)."*

  ### Reihenfolge

  **Rechtemodell zuerst** (blockiert alle drei, ist klein) →
  Coach-Athletensicht → Buddy-Schema und Engines → Memory/Chat →
  Portal als eigene App → **Marketplace zuletzt** (blockiert nichts,
  **braucht vorher den Anwalt**).

  ### Zwei Korrekturen am Auftrag

  `[cmd]` **Alle drei Module haben ein `SPEC_06_DATABASE_SCHEMA` und ein
  `SPEC_11`** — *„„kein Schema" stimmt nur fuers neue Repo (`_pipeline`
  leer, gegrept)."*

  `[cmd]` **Und neu gefunden:** **die BSS-Formel weicht zwischen Spec
  (0,5/0,5) und Vorlage (0,6/0,4) ab**, und **der Spec-eigene Unit-Test
  dazu schlaegt nachgerechnet fehl.** `[read]` Fuenfter Spec-Fehler in
  Folge.

- [ ] **C-113: Enhanced Mode — entschieden** (neu gefasst 2026-08-19).
  **Toms Vorgaben vom 2026-08-19.**

  **Tom:** *„Ist ein Feature im Supplement-Modul, das wir spaeter
  definieren, wann es aktiv ist — im Moment bauen wir es. Am Ende geben
  wir dem User nur die Moeglichkeit, seinen Konsum zu planen, zu
  protokollieren, moduluebergreifende Analysen fuer Warnings zu geben.
  **Wir werden nicht Empfehlungen oder Papa spielen fuer diese User.**"*

  ### Was gebaut wird

  | | |
  |---|---|
  | **Planen** | Zyklus, Zeitplan, Injektionsorte |
  | **Protokollieren** | was genommen wurde, wann, wo |
  | **Warnungen** | **moduluebergreifend** — Supplements gegen Medical gegen Recovery |

  `[read]` **Was nicht gebaut wird:** Dosierungsempfehlung,
  Zyklusaufbau, PCT-Protokoll, Kombinationsvorschlag. **Dieselbe Linie
  wie bei den Wechselwirkungen (C-108):** nennen ja, bewerten nein.

  ### Blutcheck: Empfehlung ja, Pflicht nein

  **Tom:** *„Eine Empfehlung fuer Blutchecks muss sicher rein, aber hart
  abhaengig machen will ich nicht. Denn ich denke, diverse Pros werden
  Blutbilder monatlich machen, aber die wollen sie nicht online
  haben."*

  `[read]` **Das ist begruendet:** Eine Pflicht wuerde genau die Nutzer
  ausschliessen, die am sorgfaeltigsten arbeiten — **und sie nicht
  sicherer machen, sondern woanders hintreiben.**

  `[cmd]` **Damit faellt die Blutbild-Pflicht aus dem Coach-Mockup weg**
  — sie wird zur Empfehlung.

  ### Die drei Fundstellen sind damit eingeordnet

  `[cmd]` **Coach-Blutbildpflicht** → wird Empfehlung.
  **Buddys `cycle_consulting` als Bezahlfeature** → faellt weg, das
  waere Beratung. **Marketplace *„TRT protocol consultation"*** → dieselbe
  Frage, gehoert zu C-112.


- [ ] **C-114: Was das Vorgaengerrepo beim Coach falsch machte** (neu
  2026-08-19). **Vier Entscheidungen fuer Tom.** Aus der F-04-Recherche
  (`docs/spezifikation/recherche-coach-portale.md`, 477 Zeilen).

  ### `056_coach_autonomy` — die Mechanik trug, die Governance nicht

  `[cmd]` **Fuenf Stufen je Modul** (Training, Nutrition, Recovery,
  Supplements; Vorgabe 2) **plus `safety_level` 1–3**, im Buddy-Code
  real durchgesetzt.

  `[read]` **Aber:** *„Die Stufen setzt der Coach selbst per `PUT`, ohne
  Bestaetigung des Klienten — genau umgekehrt zu Toms
  C-95-Vorgabe."*

  `[cmd]` **Und es existieren vier konkurrierende
  Autonomie-Repraesentationen** — zwei davon (`coach_autonomy_settings`,
  `client_autonomy`) **werden vom Code benutzt, obwohl keine Migration
  sie je anlegt.**

  ### `coach_pending_actions` ist Toms Muster — aber nicht uebernehmbar

  `[cmd]` **Vorschau, 10-Minuten-Verfall, `confirmed_at`**, daneben
  `coach_action_log` mit Undo. **Genau *„mit Bestaetigung des Users"*.**

  `[read]` **Gebaut fuer den Einzelnutzer-Betrieb:** *„hartkodierte
  Default-User-UUID, keine Akteursspalte, keine RLS. Muster
  uebernehmbar, Tabelle nicht."*

  ### Die Widerrufsfrage ist praeziser als C-71 sagte

  `[cmd]` **`user_preference_audit` (043) existiert** — alt, neu,
  Quelle, Grund. **Aktionen haben mit `coach_action_log` und
  `intervention_log` eine Spur.**

  `[cmd]` **Fuer Rechte- und Autonomie-Aenderungen gibt es nichts** —
  **und das dokumentierte `coach_client_autonomy_log` hat nachweislich
  keine Migration.**

  `[read]` *„Das Wissen lag vor, kam aber nie in die Datenbank."*

  ### Was trotzdem fehlte — der Grund fuer den Neubau

  `[cmd]` **Der Klient hatte keine Stimme** — *„Seed vergibt sogar
  Medical-Einwilligung per Skript."*

  `[cmd]` **RLS war auf den Coach-Tabellen Attrappe** — `USING (true)`
  oder ganz fehlend.

  `[read]` **Und es gab keinen Mechanismus, der eine neue Antwort
  zwang, die alte abzuloesen** — *„jede Welle baute neu."*

- [ ] **C-115: Was der Markt kann und was LumeOS eigen ist** (neu
  2026-08-19). Aus F-04.

  ### Der Kernbefund haelt

  `[cmd]` **Niemand hat Supplements, Blutwerte oder Recovery als
  Coaching-Gegenstand** — auch Stand August 2026 nicht. **Die eigene
  Recherche von Februar 2026 stimmt darin weiter.**

  ### Was veraltet war

  `[cmd]` **Preise:** reale Endkosten **40–60 % ueber Werbepreis.**
  CoachRx fehlte ganz — jetzt 25/67/169 $.

  `[cmd]` **AI-Check-in-Analyse ist inzwischen Marktware** — My PT Hub
  verkauft sie als Zusatz. **Im Februar war sie noch ein unerfuellter
  Trainerwunsch.**

  `[cmd]` **Groesste Zeitsenke im Traineralltag:** der Check-in-Review —
  **2–3 Minuten je Klient gegen 10–15.**

  ### Rechte und Geld

  `[cmd]` **Kein Marktplayer hat ein klientenseitiges
  Sicht-/Autonomie-Modell** — `[read]` **Art. 9 DSGVO verlangt aber
  genau die Richtung, die Tom vorgibt.**

  `[cmd]` **Der Markt faehrt Abo + Stripe + Provision, ohne eigenes
  Guthaben.** `[read]` **Die Wallet aus `048` waere eigenes Terrain mit
  ungepruefter Regulierungslast** — deckt sich mit dem F-03-Befund zur
  E-Geld-Konstruktion.

  ### Vier Entscheidungen vorgelegt

  **Stufigkeit** (fuenf Stufen oder Toms zweiwertiges Modell) ·
  **Sichtstufen** (2 oder 3) · **Wallet ja oder nein** ·
  **Provisionsmodell.**

  `[read]` **Und die Luecken stehen benannt:** keine Reddit-Rohquellen
  erreichbar, keine PSD2-Rechtspruefung, Apps nicht selbst bedient.
  **Widersprueche ebenfalls** — TrueCoach 107 gegen 137 $, My PT Hub 105
  gegen 59 $.

- [ ] **C-116: Der Substanzkatalog — 320 Zeilen als Kandidat** (neu
  2026-08-19). Aus F-05
  (`docs/spezifikation/substanz-katalog-recherche.md`,
  `supabase/_pipeline/daten/substanz-katalog.json`).

  `[cmd]` **320 Substanzen, 207 KB, ein Stueck.** Status
  **`curation_candidate_not_import_ready`**, `sources`-Register mit
  Pruefdatum, **je Zeile eine Quellenkennung.**

  | Klasse | |
  |---|---|
  | injizierbare AAS | **35** |
  | orale 17aa-Steroide | 25 |
  | Peptide | **26** |
  | SARMs | 19 |
  | GH und Sekretagoga | 15 |
  | dazu | SERM, AI, Insulin, Diuretika, Schilddruese |

  `[cmd]` **Vitamine und Mineralstoffe mit belegten EFSA/DRI-Obergrenzen**
  — **Vitamin B6 auf 12 mg gesenkt, Selen auf 255 µg.**

  `[read]` **Botanicals, Nootropika und Anti-Aging (124 Zeilen) bewusst
  nur als Namensbestand** — *„Kuratierung lohnt erst, wenn das Modul sie
  zeigt."*

  ### Neun Ueberwachungsprofile docken an Medical an

  `[cmd]` **Ihre Marker treffen Medicals 560 Referenzbereiche.**

  `[read]` **Der Kreatinin-Hinweis ist explizit drin:** *„Kreatin und
  Muskelmasse heben Serum-Kreatinin ohne Nierenschaden, eGFR wirkt
  faelschlich niedrig, **Cystatin C ist der muskelunabhaengige
  Marker**."* — Genau die Fehldeutung, die im Auftrag stand.

  ### Rechtslage laenderweise, mit zwei Wackelstellen

  `[cmd]` **DE, US und TH je `legal_framework`.** **Schaerfster
  Kontrast:** anabole Steroide sind **in Thailand ueber die
  *„dangerous drug"*-Kategorie in der Apotheke**, in DE und US
  kontrolliert.

  `[cmd]` **Zwei Wackelstellen vermerkt statt geglaettet:** der
  US-Peptid-Status ist **seit Februar 2026 im Umbruch**
  (HHS-Ankuendigung, noch nicht formal), und **die
  AntiDopG-Mengenschwellen stehen je Stoff in der DmMV** — Rahmenwerk
  genannt, nicht jede Einzelschwelle recherchiert.

  ### Was unbelegt bleibt

  `[cmd]` **Alle 151 Halbwertszeiten stammen unbelegt aus dem
  Vorgaenger-Export** — sie tragen `half_life_source: "minipc_csv"` plus
  Vermerk.

  `[cmd]` **PED- und Peptid-Dosen bleiben leer** — nie am Menschen
  belegt, und eine Angabe waere eine medizinische Aussage. `[read]`
  **Leeres Feld plus Grund, keine Forenzahl.**

  ### Der Uebertrag ist ein eigener Auftrag

  `[cmd]` **Die 44er-Naehrstoffluecke aus F-02 ist im Sammelbestand
  geschlossen** — 16 Eintraege mit `nutrients_provided`. **Aber das ist
  die Recherche-Datei, nicht der Live-Katalog.**

  `[read]` **Zurueckgestellt (Tom, 2026-08-19):** *„onhold. Kimi3 macht im
  Moment nichts anderes als Daten sammeln, du kriegst bald eine
  komplette Supplementliste detailliert und eine Medikamentenliste
  detailliert."*

  `[read]` **Die Medikamentenliste ist der interessantere Teil** —
  C-108 hat gemessen, dass **6 der 12 Spec-Wechselwirkungen
  Supplement×Medikament sind** (Warfarin, SSRIs, Pille) **und ein
  Medikationsmodell brauchen, das Medical nicht fuehrt.**

  **Alt:** Wie viel des Bestands wird
  uebernommen? **320 Zeilen ohne Kuration sind kein Katalog** — und
  200 davon sind PED, was C-113 beruehrt.


















- [ ] **C-71: Permissions und Autonomy sind zwei verschiedene Sachen**
  (neu gefasst 2026-08-19). **Toms Klarstellung.**

  **Tom, 2026-08-19:** *„In Permissions setzt der User, was der Coach
  sehen darf und wie autonom es sein soll. Unter Autonomy setzt der
  Coach den Level seines Users, welches Autonomy definiert. Das sind
  zwei verschiedene Sachen."*

  ### Zwei Achsen, zwei Orte, zwei Akteure

  | | wer setzt | was |
  |---|---|---|
  | **Permissions** | **der Nutzer** | was der Coach **sehen** darf · und ob er **ohne Bestaetigung aendern** darf (je Modul) |
  | **Autonomy** | **der Coach** | den **Level seines Athleten** — wie selbstaendig der arbeiten darf |

  `[read]` **Das erklaert `056_coach_autonomy` mit den fuenf Stufen:**
  Sie beschreiben nicht die Coach-Rechte, sondern **die Reife des
  Athleten.** Ein Anfaenger bekommt engere Fuehrung, ein
  Fortgeschrittener entscheidet mehr selbst.

  `[cmd]` **Und der Tab `Autonomie` in `/v2/coach/human` ist genau
  das** — die Coach-Sicht auf seiner Plattform, **nicht die
  Nutzerrechte.** Der Orchestrator hatte beides in einen Topf geworfen.

  ### Entschieden

  `[cmd]` **Fuenf Stufen des Vorgaengers** fuer die Autonomy-Achse —
  Toms Entscheidung 2026-08-19.

  `[cmd]` **Fuer Permissions bleibt es bei C-95:** je Modul zweiwertig,
  mit oder ohne Bestaetigung.

  `[read]` **Was aus der F-04-Recherche uebernommen wird:** das Muster
  von `coach_pending_actions` — Vorschau, 10-Minuten-Verfall,
  `confirmed_at`, daneben ein Log mit Undo. **Die Tabelle nicht** —
  *„hartkodierte Default-User-UUID, keine Akteursspalte, keine RLS."*

  `[cmd]` **Und die Widerrufshistorie wird gebraucht** — F-03 sagt ja
  mit Begruendung, F-04 misst, dass sie fehlt: **das dokumentierte
  `coach_client_autonomy_log` hat keine Migration.**

- [ ] **C-75: BSS und Voice sind Neubau** (neu 2026-08-18). Befund aus
  G-42.

  `[cmd]` Das Vorgaengerrepo hat **sechs Buddy-Migrationen, 13 Tabellen,
  `buddy.ts` mit 1.647 Zeilen** — und `behavioral_signatures` deckt den
  Signature-Tab **bis zu den Musternamen.**

  `[cmd]` **Aber zwei Tabs haben dort kein Gegenstueck:**

  | | |
  |---|---|
  | **BSS** | `stability_score`, `behavior_stability` — **nichts gefunden** |
  | **Voice** | kein `whisper`, kein `speechSynthesis`, kein `parseGymCommand` |

  `[read]` **Das aendert den Aufwand:** Fuer die uebrigen 18 Tabs ist
  eine Anbindung eine Uebersetzung — **fuer diese beiden ein Neubau.**

  `[cmd]` **Und die Stufen weichen ab:** drei im Vorgaengerrepo
  (`free`/`premium`/`pro`) gegen **vier in der Vorlage.** `[read]` Das
  beruehrt C-71, wo die Autonomiestufen des menschlichen Coaches
  anstehen — **beide Male geht es um dieselbe Frage: wie fein wird
  abgestuft.**



- [ ] **G-53: `InjektionsKarte` in `packages/ui` hat keinen Aufrufer**
  (neu 2026-08-18). Befund aus G-45.

  `[cmd]` **Gebaut und exportiert in G-26, von keinem Tab gerufen.** Die
  Supplements-Karte wurde nach Toms Entscheidung **im Modul** gebaut,
  weil die Vorlage sechs Felder je Ort fuehrt, die der Baustein nicht
  hat.

  `[read]` **Nicht loeschen, aber entscheiden:** entweder sie bekommt
  die fehlenden Felder und den Injections-Tab als Aufrufer, **oder sie
  faellt weg.** Ein Baustein ohne Aufrufer wird beim naechsten Mal ein
  zweites Mal gebaut — **das ist bereits passiert.**

- [ ] **G-58: Kontrast auf Attrappenkarten gegen den gerenderten Grund
  messen** (neu 2026-08-18). Befund aus G-57.

  `[cmd]` **Die `v2-attrappe`-Toenung verschiebt jeden Kontrast auf
  Attrappenkarten um rund 0,015.**

  `[read]` **Wer dort Farbabstaende misst, muss gegen den gerenderten
  Grund messen, nicht gegen den Token.** In G-57 war der Unterschied
  klein genug, um die Entscheidung nicht zu drehen — **beim naechsten
  Mal muss er das nicht sein.**

  **Betrifft G-56** (die `packages/ui`-Reste) und jede kuenftige
  Kontrastmessung. `[cmd]` Sieben von acht Modulen sind noch Attrappe.






- [ ] **C-85: Kurznamen fehlen bei 11 von 35** (neu 2026-08-18). Befund
  aus G-60.

  `[cmd]` **`short_name` im Katalog ist ein Kodierkuerzel** — `718-7`
  wird zu `Hgb Bld-mCnc`. **Unbrauchbar als Anzeige.**

  `[cmd]` **`biomarker_aliases.canonical_name` deckt 24 der 35 ab** —
  elf bleiben ohne.

  `[read]` **Die Attrappe zeigt `TT`, `GLU`, `HbA1c`** — Trainings- und
  Laborjargon. **Das ist Kuration, keine Ableitung.**


- [ ] **C-86: 8 mehrdeutige Uebungen und 1 ohne DB-Namen** (neu
  2026-08-18). Rest aus C-83.

  `[cmd]` **8 Matches waren mehrdeutig und wurden bewusst ausgelassen**,
  **1 Name findet keine Entsprechung** — *MAJOR GROUPS Muscle body*.

  `[read]` **Richtig so** — eine mehrdeutige Zuordnung still zu waehlen
  waere schlimmer als keine. **Aber neun Uebungen ohne Anreicherung sind
  neun ohne Muskelangaben in der Suche.**

  `[cmd]` **Und die 462 aus der XLSX, die keine Uebung haben, sind noch
  nicht eingeordnet** — 1.878 in der Datei gegen 1.416 in der Datenbank.
  `[read]` **Absichtlich weggelassen oder beim Import verloren — das
  sind zwei verschiedene Antworten.**

- [ ] **C-91: Die Spec nennt LOINC-Codes, die nicht die ueblichen sind**
  (neu gefasst 2026-08-19). **Nicht dringend.**

  ### Der urspruengliche Befund war falsch gestellt

  `[cmd]` C-84 meldete *„IGF-1, Zink und Selen fehlen im Zuschnitt"*.
  **Gemessen: alle drei sind da, unter anderen Codes.**

  | | Spec | im Katalog |
  |---|---|---|
  | IGF-1 | `10231-9` | **`2484-4`** — live in Toms Befundliste, 286 ng/mL |
  | Zink | `5762-0` | **`14955-9`** (Serum/Plasma), `10918-1`, +4 weitere |
  | Selen | `2913-2` | **`5722-4`** (Blut), `5723-2` (Erythrozyten), +3 |

  `[read]` **Die Marker fehlen nicht — die Spec nennt Codes, die nicht
  die ueblichen sind.** Vermutlich veraltet oder falsch abgeschrieben.

  `[cmd]` **Sechster Spec-Fehler in Folge** — nach
  Magnesium/Methaemoglobin (C-84), C-92, der Severity ohne Schema
  (C-108), den drei Recovery-Formelfehlern (C-111) und der BSS-Formel
  (C-112).

  **Was bleibt:** `[read]` **Wenn ein Labor mit `10231-9` liefert,
  trifft der Import ins Leere.** `[cmd]` Ein Alias-Eintrag in
  `biomarker_aliases` waere die kleine Loesung — **292 Aliase liegen
  dort bereits.**

- [ ] **C-92: Die Spec verwechselt Marker** (neu 2026-08-18). **Befund
  aus C-84, betrifft jede weitere Spec-Uebernahme.**

  `[cmd]` **Identitaetsfehler:** ApoB/ApoA1 · Reverse T3/T3 ·
  TPO-Ab/TRAb · **Magnesium RBC gegen Methaemoglobin.**

  `[cmd]` **Einheiten- und Bezugsfehler:** Lp(a) `nmol/L` gegen `mg/dL`,
  eGFR `mL/min` gegen `mL/min/{1.73_m2}`.

  `[read]` **`CLAUDE.md` sagt es:** *„Die Specs sind KI-erzeugt und an
  einer Stelle nachweislich eine Kopie des Brainstorms."* **Hier ist der
  zweite Beleg** — und diesmal mit medizinischer Folge.

  **Was daraus folgt:** `[read]` **Spec-Uebernahmen brauchen einen
  Identitaetsabgleich gegen LOINC**, nicht nur einen Codeabgleich. Der
  C-84-Agent hat ihn gefahren — **das gehoert zur Regel, nicht zum
  Zufall.**




- [ ] **G-68: `e1RM` deckt 6 von 1.416** (neu 2026-08-18). Meldung aus
  G-64.

  `[read]` *„Sie traegt beim Filtern auf trainierte Uebungen sofort,
  aber als Spalte fuer den ganzen Katalog sind 1.410 Striche viel. Die
  ehrlichere Bauform waere ein eigener Bereich „meine Uebungen"."*

  `[cmd]` **Gehoert zum Sitzungs-Schritt**, nicht zum Katalog — dort
  liegen 9 Sitzungen, 18 Uebungen, 60 Saetze.





- [ ] **C-102: `milch` findet Joghurt statt Milch** (neu 2026-08-19).
  Rest aus C-100.

  `[cmd]` **Der Pulver-Abzug wirkt** — Magermilchpulver ist von 1000 auf
  780 gefallen. **Aber `milch` traegt weiter nicht:** Gewinner ist
  **Joghurt (0,5 % Fett) mit 980**, Vollmilch frisch bleibt bei **510.**

  `[read]` **Der C-100-Agent nennt es richtig:** *„ein Ranking-/Intent-
  Thema, nicht mehr der Pulver-Abzug."*

  `[cmd]` **Die Ursache steht in `51-sortweight-formel.md`:** *„Ein
  Getraenk, das zu 87 % aus Wasser besteht, kann gegen ein Pulver keine
  Naehrwertpunkte gewinnen."* **Joghurt hat mehr Protein je 100 g als
  Milch — die Formel belohnt Dichte.**

  `[read]` **Zwei Wege, beide noch nicht entschieden:**

  **Trinkform vor Pulverform** — der Vorschlag aus dem Bericht, *„die
  steht nicht in der Spec und wurde nicht erfunden."*

  **Oder Haeufigkeit statt Dichte** — `meal_items` protokolliert, was
  gegessen wird. `[cmd]` **Cronometer sortiert nach zuletzt und am
  haeufigsten benutzt.**

  `[read]` **Und G-65 loest es womoeglich von selbst:** Wer `Joghurt`
  abwertet, sieht ihn nicht mehr oben. **Erst Preferences bauen, dann
  neu messen.**



- [ ] **C-123: Recovery — die neun Entscheidungen** (neu 2026-08-19).
  **Von Tom entschieden am 2026-08-19.** Grundlage fuer die Bauauftraege.

  | | Entscheidung |
  |---|---|
  | **E1** | **Nur `manual`.** *Die Wearables kommen spaeter.* |
  | **E2** | Soreness: **nur gemeldete Muskeln > 0** |
  | **E3** | **Sechs Readiness-Stufen**, Texte einzeln abnehmen |
  | **E4** | **siehe unten** |
  | **E5** | **Recherchieren** statt setzen |
  | **E6** | **Stress-Score bauen** — nicht zurueckstellen |
  | **E7** | **Eine Erholungskurve** |
  | **E8** | **Recherchieren** |
  | **E9** | Naehrstoff-Term: **Rueckfall 70**, als Rueckfall markiert |

  ### E4 — die wichtigste Praezisierung

  **Tom:** *„Wichtig: Wir bewerten nur Fakten. Die Empfehlung sehe ich
  als angebracht, wenn die Datenlage dem entspricht — **aber nicht wegen
  eines Uebertrainingssymptoms.**"*

  `[read]` **Der Arzt-Hinweis haengt an mehreren Signalen ueber Zeit**,
  nicht an einem Ausschlag. **Ein schlechter Tag ist kein Befund.**

  `[cmd]` **Was daraus folgt:** Die neun Signale werden gezaehlt und
  gezeigt — **die Empfehlung erscheint erst, wenn mehrere ueber mehrere
  Tage zusammenkommen.** Wie viele und wie lange, muss die Recherche
  aus E5/E8 mitbeantworten.

  ### E6 weicht vom Vorschlag ab

  `[cmd]` **Der Entwurf schlug zurueckstellen vor, Tom sagt bauen.**
  `[read]` Stress steht im Check-in und wirkt auf die Erholung — ihn
  wegzulassen hiesse, einen erfassten Wert unbenutzt zu lassen.

- [ ] **C-124: Recovery-Recherche — Modalitaeten und Schwellen** (neu
  2026-08-19). **E5 und E8 aus C-123.**

  **Tom, 2026-08-19:** *„Womoeglich gibt ein Research Aufklaerung, wir
  sind nicht die Ersten, die sowas bauen."*

  ### E5 — Modalitaeten-Bonuswerte

  `[cmd]` **Sauna, Massage, Eisbad, Dehnen** — je ein Bonuspunkt im
  Score. **Keine Quelle im Repo.**

  `[read]` **Was zu suchen ist:** Belegt die Sportwissenschaft eine
  messbare Wirkung auf die Erholung — und in welcher
  Groessenordnung? **Kaltwasserimmersion ist gut untersucht, Sauna
  teilweise, Massage strittig.**

  ### E8 — Motivations-Schwelle

  `[cmd]` **Das Uebertrainings-Signal feuert bei niedriger Motivation.**
  Die Schwelle stammt aus einer anderen Skala: `[annahme]` **≤ 5 von 10,
  umgerechnet, nicht belegt.**

  `[read]` **Und die E4-Frage gehoert dazu:** Wie viele Signale ueber wie
  viele Tage rechtfertigen einen Arzt-Hinweis? **Uebertraining hat eine
  Forschungsliteratur** — REST-Q, RESTQ-Sport, die Uebertrainings-Syndrom-
  Kriterien.

  `[read]` **Was nicht gesucht wird:** eine Diagnoseregel. **Nur die
  Frage, ab wann eine Haeufung so ungewoehnlich ist, dass ein Hinweis
  angebracht ist.**

- [ ] **C-126: E2 braucht Toms Bestaetigung** (neu 2026-08-19). Befund
  aus G-76.

  `[cmd]` **Der G-76-Agent hat V/S genommen** — Mittel **nur ueber die
  gemeldeten Muskeln** — und begruendet es mit den Daten:

  `[read]` *„Das JSONB fuehrt hoechstens fuenf Muskeln, nie 18 und nie ein
  leeres Objekt (0 von 340). Ueber 18 zu mitteln hiesse, 13 Nullen zu
  erfinden."*

  `[cmd]` **Und er nennt das Gegenargument des Entwurfs:** *„die Karte
  belegt 18 Gruppen vor — das ist eine Aussage ueber die Oberflaeche,
  nicht ueber die Daten. Tom muss es bestaetigen."*

  `[read]` **Die Frage praktisch:** Wer Kater 3 an einem Muskel meldet,
  hat nach V/S denselben Soreness-Wert wie jemand mit Kater 3 an fuenf
  Muskeln. **Ist das richtig, oder soll die Zahl der betroffenen
  Muskeln mitzaehlen?**

- [ ] **C-127: Drei Wearable-Spalten sind leer** (neu 2026-08-19).
  Befund aus G-76.

  `[cmd]` **`resting_hr`, `spo2_pct`, `respiratory_rate` — je 0 von
  340.** Und **127 von 170 Check-ins haben kein HRV.**

  `[read]` **Das bestaetigt E1** (nur `manual`) und zeigt, warum: **Ohne
  Wearable-Anbindung gibt es keine Quelle.** A-17 hat die
  Herkunftsspalten gebaut, damit sie spaeter kommen kann.

  `[cmd]` **Der Score rechnet deshalb 75 von 100 Gewichtspunkten** —
  *„die zwei offenen stehen sichtbar in der Zusammensetzung mit Grund
  („braucht ACWR", „nicht im Check-in") statt still zu verschwinden."*

  `[read]` **Richtig so** — fehlende Anteile zaehlen weder als null noch
  als voll. **Aber die Zahl 82 bedeutet dann etwas anderes als 82 von
  100.** Zu klaeren, ob die Anzeige das deutlich genug sagt.

- [ ] **C-129: Der Kimi-Bestand — brauchbar, aber nicht importierbar**
  (neu 2026-08-19). Aus C-128
  (`docs/spezifikation/pruefung-kimi-bestand.md`).

  ### Was vorliegt

  `[cmd]` **237 Substanzen, 56 Medikamentenwirkstoffe, 124
  Medikamentenprodukte** · **29 Warnregeln, 15 Gap-Regeln, 20
  Medikamentenregeln.**

  `[cmd]` **157 Quellen, 9 gespeicherte Konflikte, Evidenzgrade A–F,
  Validation Report mit 0 Fehlern.**

  `[read]` **Zum Vergleich:** Unsere eigenen Specs haben in derselben
  Zeit **sieben gemessene Fehler** produziert (A-20). **Der Unterschied
  liegt nicht am Modell, sondern daran, dass dort Konflikte festgehalten
  statt weggeglaettet werden.**

  ### Die Ueberschneidung ist klein

  | | |
  |---|---|
  | gegen unsere **44** Supplements | **16 direkte Treffer** |
  | gegen den F-05-Katalog (320) | **53** |

  `[read]` **Drei Bestaende, kaum Ueberlappung** — das ist keine
  Dublette, sondern drei verschiedene Ausschnitte.

  ### Kein einziges Regelwerk laeuft heute

  | | voll | teilweise | blockiert |
  |---|---|---|---|
  | `warning_rules` (29) | **0** | 18 | 11 |
  | `nutrient_gap_rules` (15) | **1** | 10 | 4 |
  | `medication_rules` (20) | **0** | 0 | **20** |

  `[cmd]` **Alle 20 Medikamentenregeln blockiert durch fehlendes
  `medical.medications`.**

  ### Was es braucht, in dieser Reihenfolge

  `[cmd]` **1. `medical.medications`** — neue Tabelle, blockiert 20
  Regeln. **Tom, 2026-08-19:** *„LumeOS/Buddy muss auch wissen, was der
  User fuer Medikamente nimmt — also brauchen wir die Daten fuer den
  User zum Erfassen der Medikamente."*

  `[cmd]` **2. Conditions** — 15 Werte (Schwangerschaft, CKD, Leber,
  Epilepsie …).

  `[cmd]` **3. Eine substanzstabile ID- und Aliasschicht** — sonst
  laufen drei Kataloge nebeneinander.

  `[cmd]` **4. `missing_input`-Status fuer Regeln.** `[read]` **Der
  wichtigste Punkt:** Eine Regel, die auf fehlende Daten trifft, darf
  nicht stumm durchfallen. **Dieselbe Lage wie `NO_REFERENCE` bei den
  Naehrstoffen** — Fehlen ist ein Zustand, kein Nichtereignis.

  `[cmd]` **Und tausende Medikamente kommen** — im selben Format. **Die
  Struktur muss sie tragen**, der erste Import nur die 56.






- [ ] **C-136: Medikamente und Conditions brauchen die
  Coach-Freigabeschicht** (neu 2026-08-19). Meldung aus C-130.

  `[cmd]` **Der C-130-Agent hat es gemeldet:** *„Medical nutzt hier wie
  `lab_result_values` RLS/GRANTs; **eine zusaetzliche
  Spaltenverschluesselung oder Coach-Freigabeschicht ist nicht
  gebaut.**"*

  `[read]` **Medikamente und Diagnosen sind sensibler als Laborwerte.**
  Wer HIV, Epilepsie oder eine Krebserkrankung eingetragen hat, hat
  etwas anderes preisgegeben als einen Cholesterinwert.

  `[cmd]` **Und die Freigabeschicht existiert seit C-119** —
  `coach.client_permissions` mit sieben Modulen und drei Stufen.
  **Sie greift auf diese Tabellen noch nicht.**

  **Zu klaeren:** `[cmd]` Reicht die Modulstufe *medical*, oder brauchen
  Medikamente und Conditions eine eigene? `[read]` **Ein Coach, der
  Blutwerte sehen darf, muss nicht die Diagnosen sehen.**

  `[cmd]` **Dazu:** Die Produktentscheidung aus dem Umsetzungsplan sagt
  *„Medizinische Daten verschluesselt gespeichert"* — **das ist bei
  `lab_result_values` bereits nicht umgesetzt**, hier also kein neuer
  Rueckstand, aber ein groesserer.


- [ ] **G-85: Der Health score haengt an zwei Unbekannten** (neu
  2026-08-19). Befund aus G-84. **Der Score ist ersatzlos aus dem Kopf
  entfernt.**

  `[cmd]` **Vorher:** `Health score 87` und `6 alerts` — **beide aus dem
  Entwurfskatalog.** *„Dass die 6 zufaellig stimmte, haette sich bei
  keinem neuen Befund bewegt."*

  ### Erste Unbekannte: die Gruppierung

  `[cmd]` **23 von 37 Markern gruppierbar**, 47 von 140 Werten fielen
  heraus. **5 LOINC-Abweichungen** und **9 echte Luecken** (ApoB, PSA,
  Zink, FSH, IGF-1, Prolaktin, Calcium + 2 Rohmarker).

  `[read]` **Der Orchestrator nannte die fuenf *„einen Codex-Auftrag von
  zwanzig Minuten"* — falsch.** Der Bericht korrigiert: **bei Glukose und
  Vitamin D messen die Codes nicht dasselbe.** `1558-6` ist *Fasting*
  Glukose, `2345-7` nicht. **Keine Aliasfrage, eine inhaltliche.**

  ### Zweite Unbekannte: die Gewichtung

  `[cmd]` **`.25/.25/.20/.15/.15` steht nur in `daten.ts`** — keine
  Quelle. **Und die 8 DB-Kategorien passen nicht auf die 5 Systeme.**

  `[read]` **Zwei Unbekannte in einer Zahl** — deshalb bleibt die
  Dashboard-Kachel markiert.


- [ ] **C-142: Die Sperrbegruendung nennt eine Tabelle, die es gibt**
  (neu 2026-08-19). Befund aus G-84.

  `[cmd]` **`medical.user_medications` existiert** — 2 Zeilen, 124
  Produkte, seit C-130. **Der Knopf *„Add medication"* ist trotzdem
  gesperrt, mit einer Begruendung, die auf eine fehlende Tabelle
  verweist.**

  `[cmd]` **Was wirklich fehlt: die Ueberwachungsspalten** — *„aus denen
  vier der sechs Alert-Eintraege stammen."*

  `[read]` **Kleine Sache, aber sie sagt etwas Falsches** — und der
  naechste Agent sucht an der falschen Stelle.

- [ ] **A-23: `lint` bricht repoweit ab** (neu 2026-08-19). Befund aus
  G-84.

  `[cmd]` **Fehlende ESLint-Konfiguration**, mit interaktiver
  Rueckfrage — in `@lumeos/web` wie in `@lumeos/admin`.

  `[read]` **Bestand vorher schon** — *„ging nur ueber den Turbo-Cache
  durch."* **Das ist dieselbe Klasse wie G-81:** Der Cache verdeckte
  einen Fehler, statt ihn zu zeigen.

  `[cmd]` **Der G-84-Agent hat Typecheck und Tests ohne Cache
  erzwungen** — 3 von 3, 393 gruen. **Das gehoert zur Nachweisregel.**

- [ ] **C-143: Die zwei Erholungsrechnungen weichen ab** (neu
  2026-08-19). **Befund aus G-82, gemessen ueber fuenf Tage.**

  | Tag | Tabelle | `score.ts` | Diff |
  |---|---|---|---|
  | 2026-06-05 | **43,0** | 36 | **−7,0** |
  | 2026-07-15 | 83,8 | 83 | −0,8 |
  | 2026-09-01 / 10-20 / 11-06 | **79,4** | 82 | **+2,6** |

  `[cmd]` **C-125s Referenztag stimmt (43,0), G-76s nicht:** *„Die
  Tabelle sagt 79,4, nicht 82. **Die 82 war nie gespeichert**, sondern
  das, was die Browserrechnung an dem Tag ergab."*

  ### Die Ursache sind nicht die Gewichte

  `[read]` *„Der Kern ist identisch — der Unterschied ist, **wie viele
  Anteile zaehlen**: `score.ts` rechnet fuenf von sieben (Basis 75), die
  Tabelle alle sieben mit Rueckfallwerten (Basis 100)."*

  `[cmd]` **Die Tabelle ist die bessere Zahl:** *„Sie nutzt den
  gemessenen ACWR auf **118 von 170 Tagen**, die `score.ts`
  wegwirft."*

  ### Und die Anzeige liest jetzt die Tabelle

  `[cmd]` **`score.ts` bleibt** — aber der Auftrag ging von einer
  falschen Annahme aus: *„Die Live-Vorschau benutzte sie nie."*

  `[cmd]` **`tab-checkin.tsx` rechnete mit der Entwurfsformel** — eigene
  Gewichte, **HRV aus der Attrappe, `0.88 * 10` als erfundene
  Ernaehrung**, `readinessFor` als Urteilssprache.

  `[read]` **Nach dem Umbau haette `score.ts` null Aufrufer gehabt** —
  derselbe Fall wie `InjektionsKarte` (G-53). **Jetzt an die Vorschau
  gebunden, mit genannter Basis** und dem Hinweis, dass sie bewusst
  nicht die gespeicherte Zahl ist.

  **Offen:** `[read]` Ob die Vorschau ueberhaupt eine zweite Zahl zeigen
  soll, oder ob sie nach dem Speichern die gespeicherte nachreicht.


- [ ] **C-145: `Plan` braucht ein Schema, keine Anzeige** (neu
  2026-08-19). **Befund aus G-86, eindeutig gemessen.**

  `[cmd]` **Von elf Feldern, die die zwei Kacheln brauchen, fuehrt
  `workout_sessions` keines.**

  `[read]` **Der entscheidende Punkt:** *„`name` traegt 30 Sitzungen mit
  30 verschiedenen Namen, jeder genau einmal — **eine Routine ist etwas
  Wiederverwendbares, hier wiederholt sich nichts.**"*

  `[read]` **Und die Abgrenzung zum Kalender sitzt:** *„Der Kalender
  zeigt datierte Sitzungen, **Plan zeigt die Struktur darueber** —
  Bloecke, Wochen mit Phasenzweck, Routinen mit Herkunft. Fehlendes
  Schema, kein Anzeigeproblem."*

  `[cmd]` **Was es braeuchte:** Routinen als eigene Objekte,
  Bloecke/Wochen, und eine Verbindung von der Sitzung zur Routine.

- [ ] **G-88: Die Sitzungskarte auf `Today`** (neu 2026-08-19).
  **Entscheidung fuer Tom.** Rest aus G-86.

  `[cmd]` **Teilweise baubar:** `planned_sets`, `planned_reps`,
  `planned_weight_kg` stehen auf **60 von 60** — **aber `rir` und
  `is_pr` sind 0 von 101.** Zwei von fuenf Spalten fehlen.

  `[read]` **Der Agent hat sie ganz beim Entwurf gelassen statt halb
  gefuellt** — richtig. **Zu entscheiden:** drei von fuenf zeigen und
  zwei weglassen, oder warten, bis die Seeds `rir` und `is_pr`
  liefern?

  `[cmd]` **Die Spalten existieren** — `workout_sets` traegt `rpe`,
  `rir`, `set_type`, `rest_seconds`, `logged_via`. **Sie sind nur
  leer.**

- [ ] **A-24: Attrappenmarken sind kein brauchbares Mass** (neu
  2026-08-19). **Befund aus G-86.**

  `[cmd]` **Der Auftrag nannte *„Marken 40 → 24"* und 15/14/10/3 je
  Datei** — gemessen sind es **11/17/9/1 = 38**, im Browser gezaehlt
  **22**.

  `[read]` *„Die Textmarken sind ohnehin kein brauchbares Mass“* — seit
  G-74 gibt es `RUECKFALL` neben `ATTRAPPE`, **und eine Datei kann
  beide tragen.**

  `[cmd]` **Was zaehlt, ist die gerenderte Seite:** Today 1,
  History/Progression/Standards/Calendar 0.

  `[read]` **Fuer den Orchestrator:** Keine Markenzahl mehr aus einem
  alten Bericht uebernehmen. **Entweder im Browser zaehlen lassen oder
  weglassen.**

  `[cmd]` **Dritter Fall heute** — nach *„erreicht, offen, verfehlt"*
  (G-79) und *„Kreatin 30 Tage"* (G-74). **Und *„200 Saetze"* war auch
  falsch: es sind 101.**

- [ ] **GO-21: Taille:Huefte mit Geschlechtsbezug** (entschieden
  2026-08-19). Befund aus G-87.

  **Tom, 2026-08-19: mit Geschlechtsbezug zeigen.**

  `[cmd]` **Die Quelle:** WHO 2008 — **unter 0,90 bei Maennern, unter
  0,80 bei Frauen.** Im Vorgaengerrepo hinterlegt.

  `[cmd]` **Toms Wert am 2026-08-19: 0,860** — unter der Maennerschwelle.

  `[cmd]` **`public.profiles` traegt das Geschlecht**, technisch geht
  es.

  `[read]` **Und die Sprachregel gilt:** *„Unter dem Grenzwert"* ist eine
  Lage, *„gesund"* ein Urteil. **Mit Quelle und Jahr daneben**, wie bei
  den Biomarker-Bereichen.

  **Was fehlt:** `[read]` Was, wenn das Geschlecht nicht gesetzt ist?
  **Dann keine Schwelle, nur das Verhaeltnis** — wie `fasting_status`,
  das nur erscheint, wenn es belegt ist.

- [ ] **C-146: `phase_am()` liefert 8 von 14 Spalten** (neu
  2026-08-19). Befund aus G-87.

  `[cmd]` **Es fehlen `transitioned_from`, `recommended_next`,
  `transition_reason`** — genau die drei, die den Phasenwechsel
  beschreiben.

  `[read]` **Der Agent hat sie nachgelesen statt die Funktion zu
  aendern** — *„das Schema gehoert Codex."* **Richtig, aber ein zweiter
  Leseweg neben der Funktion ist auf Dauer schlecht.**

  `[cmd]` **Dazu:** Die Sperrbegruendung am Knopf *„Switch to …"* nennt
  `goals.goal_phases` als fehlend — **die Tabelle gibt es seit GO-07.**
  `[read]` **Dieselbe Klasse wie C-142** bei den Medikamenten: eine
  Begruendung, die etwas Falsches sagt.

- [ ] **G-89: Die Idealwerte stehen nur in Begleitdateien** (neu
  2026-08-19). Befund aus G-87.

  `[cmd]` **1.618, V-Taper und Steve Reeves stehen ausschliesslich in
  `theme-v1/uploads/`** — Begleitdateien des Entwurfs, **keine
  Spezifikation.**

  `[cmd]` **Und der Reeves-Wert ist gar keine Rechnung:**
  *„`daten.ts:438` gibt fest 88 zurueck."*

  `[read]` **Auch die Farbe faellt weg, mit gutem Grund:** *„Die Vorlage
  faerbt eine wachsende Taille rot und einen wachsenden Arm gruen —
  welche Richtung erwuenscht ist, haengt vom Ziel ab."* **In einer
  Aufbauphase ist eine wachsende Taille normal.**

  **Zu klaeren:** Braucht es Idealwerte ueberhaupt? `[read]` **Die
  Verhaeltnisse selbst sind Arithmetik und stehen** — die Einstufung
  waere eine Bewertung.


- [ ] **G-117: Der Extended-Code liegt im Buendel, auch ohne
  Erfahrungsgrad** (neu 2026-08-20, aus G-110).

  `[cmd]` **Das Gate haelt die Daten, nicht den Code.** Gemessen: bei
  statischem Import steht „Active protocols" in **einem von sieben**
  JS-Chunks der Seite — auch fuer jemanden, dessen Grad nicht reicht.

  `[cmd]` **Ein `dynamic({ ssr: false })` behebt es** (der Chunk war
  danach nicht mehr im Seitenmanifest) — **und macht den Tab leer:** er
  zeigte gar nichts mehr, auch nicht den Ladehinweis. **Zurueckgenommen.**

  `[read]` **Wie schwer es wiegt:** Die Protokolle selbst kommen NICHT
  mit — nur die Attrappenzahlen des Entwurfs. Wer den Code liest,
  erfaehrt nichts ueber den Nutzer. **Sobald Extended echte Daten
  fuehrt, wird es ernst.**

- [x] **G-92: Das Extended-Gate schuetzt nichts** (neu 2026-08-20).

  **ERLEDIGT 2026-08-20** (G-110) — Bericht
  `docs/ssot/156-supplements-interactions.md`.

  `[cmd]` **Das innere `useState`-Gate ist entfernt.** Die Entscheidung
  faellt jetzt in `ansicht.tsx` gegen `profiles.experience_level`
  (C-140) — **bevor `SuppExtended` gerendert wird.**

  `[cmd]` **Stufe fuer Stufe gemessen** (der Grad danach wieder auf
  NULL):

  | Grad | Gate | Protokolle |
  |---|---|---|
  | (NULL) | **ja** | 0 |
  | beginner | **ja** | 0 |
  | advanced / pro / elite | nein | **1** |

  `[read]` **Und ein Weg hinaus:** Die Kachel in `/v2/settings` ist
  entsperrt — sie stand seit G-80 mit *„gibt es kein Feld dafuer"*,
  **was bis C-140 stimmte.**

  **Offen geblieben:** der Code im Buendel (G-117).
  **Befund aus G-91, ernst.**

  `[cmd]` **Es ist ein blosses `useState`.** *„Wer klickt, sieht die
  Protokolle."*

  `[cmd]` **Und `enhanced_substances` existiert nicht**,
  `experience_level` ist **auf allen 5 Profilen NULL** — die geplante
  Sperre aus C-113 greift also auch nicht.

  `[read]` **Der Zugang zu PED-Protokollen haengt an einem
  Browserzustand** — keine Pruefung, keine Rechte, kein Zeilenschutz.
  **Das gehoert vor jeder weiteren Extended-Arbeit geklaert.**

- [ ] **C-149: Vitamin D in IU gegen µg** (neu 2026-08-20). Befund aus
  G-91.

  `[cmd]` **Naiv addiert: 33.430 % statt rund 930 %** — **Faktor 40.**
  Supplement in IU, Mikro-Pfad in µg.

  `[cmd]` **Ein Umrechnungsfaktor liegt nirgends im Repo, auch nicht im
  Vorgaengerrepo.** Betroffen ist **genau eine von 11 Zeilen.**

  `[read]` **Nicht gesetzt** — *„das waere die Zahl ohne Beleg."*
  **Richtig: 1 µg Vitamin D3 sind 40 IU, aber der Faktor gehoert
  belegt, nicht aus dem Kopf.**

  `[cmd]` **Und der halbe Blocker ist weg:**
  `nutrition.micronutrient_snapshot` hat 8 echte Zeilen, **7 der 8 Codes
  kommen in `nutrients_provided` vor.**


- [ ] **G-95: Sieben Module, aber nicht dieselben sieben** (neu
  2026-08-20). Befund aus G-90.

  `[cmd]` **Mockup und Schema fuehren beide sieben Module** — aber
  **`buddy` gegen `body_metrics`.**

  `[cmd]` **Gebaut ist das Schema.** `[read]` *„Ein
  `body_metrics`-Schalter waere stumm geblieben."*

  **Zu klaeren:** Welche sieben gelten? `[read]` **`buddy` passt zum
  F-03-Entwurf** — dort steht Buddy als Spalte in derselben Matrix.

- [ ] **G-96: Der Bestaetigungspfad wechselt nur den Zustand** (neu
  2026-08-20). Befund aus G-90.

  `[cmd]` **Gebaut ist der Zustandswechsel, nicht die Ausfuehrung:**
  *„`payload` beschreibt, was geschehen soll, **niemand wendet es an**."*

  `[cmd]` **Drei Luecken benannt:** der Verfall gehoert in die Datenbank
  · `action_log` bleibt ungenutzt · **Eintraege koennen ohnehin nur aus
  dem Coach-Portal kommen** — das es noch nicht gibt.



- [ ] **G-98: Der `Meal plans`-Tab hat eine Vorlage, aber keine Daten**
  (neu 2026-08-20). Befund aus G-97.

  `[cmd]` **`MealPlansView` ist definiert** —
  `module-nutrition-spec.jsx:334`. **Auftrag und C-150 sagten beide das
  Gegenteil** — *„beide suchten in der anderen Mockup-Datei."*

  `[read]` **Der Orchestrator hat nur `module-nutrition.jsx` gelesen**
  und daraus geschlossen, es gebe keine Vorlage. **Es gibt drei
  Nutrition-Mockups.**

  `[cmd]` **Was dem Tab fehlt:** *„kein Zustand am Planeintrag, keine
  Herkunft am Tagebuch → **Compliance ist nicht ableitbar**."*

  `[read]` **Ein Essensplan-Tab zeigt, wie gut man sich an den Plan
  gehalten hat.** Ohne Zustand und Herkunft ist das nicht rechenbar.

- [ ] **G-99: Drei der acht G-72-Spalten bleiben wirkungslos** (neu
  2026-08-20). Befund aus G-97.

  `[cmd]` **Gemessen:** *„Zwei wirken, drei sind sichtbar vergleichbar,
  drei bleiben wirkungslos — `recipes` hat kein Preis- und kein
  Vorkochfeld."*

  `[read]` **Damit ist G-72 teilweise beantwortet:** `budget_level` und
  `meal_prep_ok` haben kein Gegenstueck im Rezeptschema. **Entweder
  kommen die Felder dazu, oder die Spalten fallen weg.**


- [ ] **G-105: Zwei abgeschnittene SVG-Pfade in `packages/ui`** (neu
  2026-08-20). Befund aus G-100. **Klein, aber alt.**

  `[cmd]` **Kein Encoding-Problem** — *„die Datei enthaelt 0
  Ersatzzeichen. Es sind **abgeschnittene Pfaddaten**: ein `C` mit vier
  statt sechs Zahlen, ein zweiter mit zwei."*

  `[cmd]` **Seit `3dae1a2` unveraendert** — sie erzeugen die zwei
  Konsolenfehler, die auf jeder Seite mit Muskelkarte stehen.

  `[read]` **Nicht behoben, weil `packages/ui` gesperrt war** — der
  G-100-Agent hat es gemeldet. **Ein eigener kleiner Auftrag, sobald
  niemand dort arbeitet.**

- [ ] **G-106: Der Readiness-Komposit waere ein zweiter Gesamtwert**
  (neu 2026-08-20). Befund aus G-100. **Gemeldet statt gebaut.**

  `[cmd]` **Der Entwurf rechnet aus fuenf Anteilen einen Wert und
  schreibt *„Push hard"* daneben.**

  `[read]` **Zwei Gruende, warum er draussen blieb:** *„`recovery.scores`
  fuehrt bereits einen Gesamtwert mit sieben Anteilen (G-82) — **zwei
  Gesamtwerte nebeneinander waeren schlimmer als einer**."* Und *„Push
  hard"* ist Urteilssprache, wie *„Good"* (G-76) und *„Optimal"*
  (G-60).

  `[cmd]` **`Body battery` gibt es im Schema nicht** — *„keine Spalte
  `batter*` irgendwo."*

  **Zu entscheiden:** Faellt die Kachel weg, oder zeigt sie den
  vorhandenen Erholungswert?


- [ ] **G-112: Der Food-DB-Filter laesst nur einen Wert zu** (neu
  2026-08-20). Toms Befund.

  **Tom:** *„Foodsdb-Filter ist immer nur einer waehlbar, da muss auch
  eine Kombination ueber Gruppen filtern."*

  `[cmd]` **Die Ursache steht in C-120:** *„`p_tag_code` ist Singular —
  kein ODER/UND, nur Einfachauswahl."*

  `[read]` **Das ist eine Schemafrage, keine Anzeigefrage.**
  `food_search` muesste mehrere Tags entgegennehmen — **ODER innerhalb
  einer Gruppe, UND zwischen den Gruppen**, wie die Recherche zu
  Faceted Search es vorgibt.

  `[cmd]` **Und der Ausschluss fehlt ganz** — C-120: *„kein
  Ausschluss-Parameter, die Allergen-Schalter wirken nur auf der
  angezeigten Seite."*

- [ ] **G-113: Die Naehrstoffordnung braucht Klappen und Zeitfilter**
  (neu 2026-08-20). Toms Befund zu G-101.

  **Tom:** *„Schoen, dass nun alles da ist, aber das sollte schon alles
  ein- und ausklappbar sein und standard eingeklappt."* Und: *„Nutrients
  hat keine Zeitfilter, ein Tag interessiert niemanden — da muss 1 fuer
  heute / 7 / 14 / 30 / 45 / 60 / 90 rein."*

  `[cmd]` **12 Gruppen, 138 Naehrstoffe** — die Fettsaeuren allein 36
  Zeilen. **Alles offen ist unlesbar.**

  `[read]` **Und der Zeitfilter ist der wichtigere Teil:** Ein
  Tagesmangel sagt nichts, **ein Schnitt ueber 30 Tage schon.** `[cmd]`
  Der Auftrag G-101 nannte die Filter (*Today / 7d / 30d / 90d*) — sie
  wurden nicht gebaut.

  `[cmd]` **Teil 1 erledigt 2026-08-20 mit G-117.** **12 von 12 Gruppen
  zu**, der Kopf traegt weiter *„N Eintraege · M mit Wert"*.

  `[read]` *„Die Klappmechanik gab es seit G-101, nur der Standard war
  „erste Gruppe offen"."*

  `[cmd]` **Teil 2 — die Zeitfilter (1/7/14/30/45/60/90) — ist jetzt
  baubar:** C-157 hat `nutrient_summary_window` geliefert, **30 Tage in
  34 ms.** **Der Platz ist im Code markiert.**

- [ ] **G-114: `daily_summary` fuehrt nur 33 der 138 Naehrstoffe** (neu
  2026-08-20). **Der Grund fuer Toms Zweifel.**

  **Tom:** *„Ob da wirklich alle Daten angezeigt werden, bezweifle ich —
  ich denke, unsere Foods haben sehr wohl Aminosaeuren drin."*

  `[cmd]` **Er hat recht. Gemessen:**

  | Gruppe | Codes | Zeilen in `food_nutrients` |
  |---|---|---|
  | Fettsaeuren | 36 | **212.242** |
  | **Aminosaeuren** | **19** | **131.584** |
  | Fettloesliche Vitamine | 17 | 109.304 |
  | Elemente | 16 | 105.918 |
  | Wasserloesliche Vitamine | 12 | 83.696 |

  `[cmd]` **7.107 von 7.140 Lebensmitteln tragen Aminosaeurewerte.**

  `[read]` **Die Werte liegen je Lebensmittel vor** — **`daily_summary`
  summiert sie nur nicht auf.** Der G-101-Bericht sagt es selbst:
  *„`daily_summary` fuehrt keine Spalte dafuer."*

  **Zu klaeren:** Waechst `daily_summary` auf 138 Spalten, oder wird
  je Abfrage aus `meal_items` gerechnet? `[read]` **Das ist eine
  Codex-Frage** — 105 fehlende Spalten sind kein Anzeigeproblem.



- [ ] **C-105: MEV/MAV/MRV haben keine Tabelle** (neu 2026-08-19).
  Befund aus G-69.

  `[cmd]` **Sie stehen nur in Vorlagendateien.** `[read]` **Die Regel
  greift dreimal:** Volume landmarks bleibt Attrappe, **das Zielband der
  Volumenkachel** (*14/16 Saetze*) und **die Einstufung
  Beginner…Elite** in den Standards fallen aus demselben Grund weg.

  `[read]` **Es sind Schwellen aus der Trainingsliteratur** — sie
  brauchen eine Quelle, wie die Referenzbereiche bei den Naehrstoffen
  (C-45) und den Biomarkern (C-84). **Keine erfundene Zahl.**



- [ ] **A-18: Berichtsnummern kollidieren** (neu 2026-08-19).

  `[cmd]` **116, 117 und 118 sind doppelt belegt:** `116-food-db-tab` /
  `116-goals-anbindung` · `117-ausschluss-presets` /
  `117-zusammenhaengende-seeds` · `118-training-sitzungen` und der
  Daumen-Bericht, **der deshalb auf 120 verschoben wurde.**

  `[read]` **Die Ursache ist der Parallelbetrieb:** Fuenf Agenten
  vergeben Nummern gleichzeitig, **jeder nimmt die naechste freie, die er
  sieht.**

  **Zu klaeren:** Vergibt der Orchestrator die Nummer im Auftrag? `[cmd]`
  **Umbenennen der bereits committeten waere riskant** — sie stehen im
  Index und in Querverweisen.

- [ ] **G-72: Acht Spalten ohne Wirkung und ohne Kachel** (neu
  2026-08-19). **Entscheidung fuer Tom.** Rest aus G-65.

  `[cmd]` **`cooking_skill`, `prep_time_max_min`, `budget_level`,
  `meals_per_day`, `snacks_per_day`, `meal_prep_ok`,
  `preferred_cuisines`, `planner_notes`** — gespeichert, ohne Wirkung,
  **und das Mockup hat fuer keine eine Stelle.**

  `[read]` **Der Agent hat richtig gemeldet statt gebaut:** *„Der
  Auftrag sagte „Zeigen ja" — aber das Mockup hat fuer keine eine
  Stelle, und eine zu erfinden waere eine doppelte Erfindung."*

  `[cmd]` **Sie stammen aus Schritt 3 des Vorgaenger-Assistenten** —
  Kochen & Alltag. **Und sie wirken erst mit Rezepten und
  Essensplaenen**, die es nicht gibt.

  **Zu entscheiden:** Kachel dazu, oder liegenlassen bis Meal plans?

- [ ] **A-19: Zwei README-Abweichungen in der Kette** (neu 2026-08-19).
  Meldung aus C-99.

  `[cmd]` **`kette-readme-pruefen.ts` meldet Abweichungen bei `018` und
  `032`** — den Kettenschritten aus C-93 (Ausschluss-Presets und
  Halal/Koscher-Tags).

  `[read]` **Der C-99-Agent hat sie gemeldet und nicht nebenbei
  repariert** — richtig so: *„023a ist dort nicht das Problem."*

  `[cmd]` **Vermutlich hat der C-93-Agent `supabase/README.md` nicht
  vollstaendig nachgezogen.** Kleine Sache, aber der Pruefer bleibt gelb,
  bis sie behoben ist.

- [ ] **C-117: `milch` traegt auch mit Vorlieben nicht** (neu
  2026-08-19). Rest aus C-94, **ersetzt C-102 nicht, praezisiert es.**

  `[cmd]` **Gemessen nach C-94:** MealCam gewinnt weiterhin mit
  **Joghurt (0,5 % Fett)**, Soll bleibt **Vollmilch.**

  `[read]` **Damit ist die Hoffnung aus C-102 widerlegt:** *„G-65 loest
  es womoeglich von selbst — wer Joghurt abwertet, sieht ihn nicht mehr
  oben."* **Die Vorlieben greifen, aber sie loesen die Rangfrage
  nicht** — weil niemand Joghurt abgewertet hat und es auch niemand
  tun sollte.

  `[cmd]` **Die Ursache bleibt die Formel:** Joghurt hat mehr Protein je
  100 g als Milch, und `sort_weight` belohnt Dichte. **Der Pulverabzug
  aus C-100 hat den ersten Fehler behoben, nicht den zweiten.**

  `[read]` **Die zwei Wege aus C-102 stehen weiter offen:** *Trinkform
  vor Pulverform* als Regel, **oder Haeufigkeit statt Dichte** —
  `meal_items` protokolliert, was gegessen wird.

- [ ] **C-120: Drei Sperren in `food_search`** (neu 2026-08-19). Befund
  aus G-73.

  `[cmd]` **Alle drei in der Suchfunktion, die C-94 gesperrt hat:**

  | | |
  |---|---|
  | **`p_tag_code` ist Singular** | kein ODER/UND, nur Einfachauswahl |
  | **kein Ausschluss-Parameter** | die Allergen-Schalter wirken **nur auf der angezeigten Seite** — und sagen das an |
  | **kein `processing_level`** | die acht Stufen aus C-100 sind **nicht filterbar** |

  `[read]` **Der G-73-Agent hat sie gemeldet statt umgangen** — richtig,
  denn ein zweiter Suchweg neben `food_search` waere die schlechtere
  Loesung.

  `[cmd]` **Und ein Befund, der die Bauform bestimmt hat:** *„jeder
  vegane Eintrag traegt auch `vegetarian` (Schnittmenge 0) — „vegan ODER
  vegetarisch" waere also eine Scheinwahl."*

- [ ] **C-121: Die Suche ist langsamer geworden** (neu 2026-08-19).
  Befund aus G-73.

  `[cmd]` **330–492 ms gegen 199–304 ms in G-66** — **aber nicht durch
  den Umbau.** In SQL gemessen braucht die RPC allein **366–406 ms**,
  und **bei `limit 25` genauso lange wie bei `limit 50`.**

  `[annahme]` *„Die Funktion ist seit G-66 um die Presets (C-93) und die
  Vorlieben-Auswertung (C-94) gewachsen; das zu belegen hiesse sie zu
  zerlegen — eigener Auftrag."*

  `[read]` **Dass `limit 25` und `limit 50` gleich lange brauchen, ist
  der Hinweis:** Die Arbeit faellt vor dem Begrenzen an. **Zum
  Vergleich:** Uebungen 142–172 ms ueber 1.416, Biomarker 130–160 ms
  ueber 11.676.

- [ ] **G-75: Die alte Oberflaeche nennt den BLS ebenfalls** (neu
  2026-08-19). Meldung aus G-73.

  `[cmd]` **`/nutrition` ohne `/v2`** — ausserhalb des Auftrags, deshalb
  nicht angefasst.

  `[read]` **Kleine Sache**, aber sie gehoert mit weg, wenn die alte
  Oberflaeche bleibt — **oder die Frage lautet, ob sie bleibt.**

- [ ] **G-77: Streaks bei 32 Auslassern** (neu 2026-08-19). Befund aus
  G-74.

  `[cmd]` **Der Agent hat sie nicht gebaut und begruendet:** *„Bei 32
  Auslassern reisst jede Serie — eine Zahl ohne Aussage."*

  `[read]` **Das Mockup zeigt eine Streak-Kachel.** Bei 93,1 %
  Compliance ueber 90 Tage ist die laengste ununterbrochene Serie
  vermutlich wenige Tage lang.

  **Zu klaeren:** Zeigt die Kachel die laengste Serie, die aktuelle, oder
  faellt sie weg? `[read]` **Eine Serie, die staendig reisst, motiviert
  nicht — sie beschaemt.**

- [ ] **G-78: Ein Fehler, den nur der Browser zeigte** (neu
  2026-08-19). **Merkposten, kein Auftrag.**

  `[cmd]` **HTTP 500:** *„Ein Wert-Import aus `stack-read.ts` (das
  `next/headers` laedt) zog das Server-I/O ins Browserbuendel. **Der
  Typecheck war gruen.**"*

  `[read]` **Dritter Fall derselben Klasse:** In G-69 standen die
  Uebungsnamen im DOM und waren unsichtbar (*„ein Test auf „Name steht
  im DOM" waere gruen gewesen"*), in G-64 kippte `.in()` ueber 200 IDs
  **und schwieg.**

  `[cmd]` **Was daraus folgt:** Das Bildschirmfoto ist kein Beiwerk —
  **es ist die einzige Pruefung, die diese Klasse findet.** Steht schon
  als Nachweis in jedem Auftrag; **hier ist der dritte Beleg.**


- [x] **G-81: Registerkarten wechseln nicht — der Build-Cache war
  kaputt** (2026-08-19). Befund aus G-79, **behoben.**

  `[cmd]` **Der Server antwortete mit 200**, lieferte aber 404 auf
  RSC-Anfragen, und die Bildschirmfotos zeigten die Seite unformatiert.

  `[cmd]` **Behoben durch:** Server beenden → **`apps/web/.next` und
  `node_modules/.cache` loeschen** → neu starten. **Danach 200 mit
  Stilen**, im Browser bestaetigt.

  `[read]` **Die Ursache:** Drei Agenten haben gleichzeitig Dateien
  geaendert, der Entwicklungsserver hat sich verschluckt. **Kein
  Codefehler.**

  ### Was dabei auffiel

  `[cmd]` **Die Pruefung ohne Cookie landet auf der Anmeldeseite** — 22
  KB, kein v2-CSS. **Genau Regel 13** aus G-56: *„Eine abgelaufene
  Sitzung liefert die Anmeldeseite, die keine v2-Huelle hat."*

  `[read]` **Der Orchestrator ist erst darauf hereingefallen** — er
  mass *„0 CSS-Dateien"* und hielt den Server fuer kaputt. **Der Titel
  `Anmelden — LumeOS` hat es aufgeklaert.**

  ### Merksatz fuer die naechste Runde

  **Wenn die Oberflaeche unformatiert aussieht oder Registerkarten nicht
  wechseln:** `[cmd]` **erst `.next` loeschen und neu starten**, bevor
  jemand den Code sucht.

  ### Ergaenzung aus G-82 (2026-08-19)

  `[cmd]` **Wer `.next` raeumt, startet den Server neu.** Der G-82-Agent
  hat es teuer gelernt: *„Nach dem Raeumen von `.next` lieferte der
  laufende Server 404 fuer jeden Chunk, die Anmeldung hydrierte nicht
  und **schickte die Zugangsdaten per GET in die URL**."*

  `[read]` **Das Letzte ist der ernste Teil** — ein Passwort in der
  Adresszeile landet im Verlauf und in jedem Protokoll.



- [ ] **A-27: Zwei Agenten, zwei Attrappen-Erwartungen** (neu
  2026-08-20). **Das Gate ist rot.**

  `[cmd]` **`v2-attrappen.test.ts` scheitert zweimal:** *„Supplements
  erwartet 1 Attrappenmarke, findet 17"* und *„`TodayAttrappe` braucht
  laut Test eine Rueckfallmarke."*

  `[read]` **Die Ursache ist der Parallelbetrieb:** G-74 hat die
  Rueckfallfassungen markiert und den Test auf 1 gesetzt. **G-91 hat
  danach den Catalog-Tab gebaut** — und die Zaehlung stimmt nicht mehr.

  `[cmd]` **A-24 haelt fest, dass Textmarken kein brauchbares Mass
  sind.** `[read]` **Und `tools/schuss.mjs` misst seit heute die
  gerenderte Seite** — 7 Attrappen auf `/v2/nutrition`, in einem
  Aufruf.

  **Zu tun:** Test auf den gemessenen Stand ziehen — **oder ihn durch
  die gerenderte Zaehlung ersetzen.**

- [x] **A-28: Der Attrappen-Test blockiert das Gate**
  (neu 2026-08-20, **erledigt 2026-08-20** — Bericht
  `docs/ssot/147-meal-plans.md`).

  **Der Test war richtig. Die Datei war falsch.** `[cmd]` Der
  Arbeitsstand von `supplements/tabs.tsx` war **eine ganze Fassung VOR
  G-91**, nicht nur zurueckgedrehte Marken:

  | | HEAD | Arbeitsstand |
  |---|---|---|
  | `attrappe={RUECKFALL}` | **16** | 0 |
  | `attrappe={ATTRAPPE}` | 1 | **16** |
  | Import `CostErgaenzung` | da | **geloescht** |
  | Katalogspalte | `Serving` | **`Typical dose`** |

  `[cmd]` **Die letzte Zeile ist der Beweis:** G-91 hat `Typical dose`
  entfernt, weil `typical_dose_min/_max` **auf allen 44 Eintraegen leer**
  sind. Der Arbeitsstand haette eine Spalte voller Striche
  zurueckgebracht.

  **Deshalb wurde der Test NICHT nachgezogen** — er beschrieb den
  richtigen Zustand. `[cmd]` Der Stand ist **gestasht, nicht verworfen**
  (`stash@{0}`). Danach: 1 + 16, Marke je Fassung richtig, **76 Tests
  gruen**, gerendert **1 Attrappe statt 17**.

  `[read]` **Die vorgeschlagene Loesung waere falsch gewesen.** Wer den
  Test „auf den gemessenen Stand gezogen" haette, haette den
  Rueckschritt festgeschrieben — **und den Zaehler wieder blind
  gemacht**, wovor G-74 ausdruecklich warnt.

  `[read]` **Der Vorschlag, auf die gerenderte Zaehlung umzustellen,
  bleibt offen und richtig** — er steht als eigener Punkt (A-29), weil
  er den Test ERSETZT und nicht repariert.

- [ ] **A-29: Der Attrappen-Test koennte die gerenderte Seite zaehlen**
  (neu 2026-08-20, aus A-28).

  `[cmd]` **Der Test liest Quelltext** (`v2-attrappen.test.ts` zaehlt
  `attrappe={ATTRAPPE}` je Datei). **A-24 haelt fest, dass Textmarken
  kein Mass sind** — und `tools/schuss.mjs` misst die gerenderte Seite
  in einem Aufruf.

  `[cmd]` **Die zwei Zaehlweisen gehen auseinander**, gemessen am
  2026-08-20 auf `/v2/nutrition?tab=plans`: **6 sichtbare Marken gegen
  10 `v2-attrappe`-Klassen** im HTML, weil die Klasse auch an
  Unterelementen haengt.

  `[read]` **Beide Zahlen sind richtig, sie messen Verschiedenes.**
  Wer umstellt, entscheidet damit auch, **welche der beiden die
  verbindliche ist** — und muss die Erwartungen aller Module neu setzen.

  `[cmd]` **Der Test braucht dann einen laufenden Dev-Server.** Heute
  laeuft er ohne. Das ist der eigentliche Preis, nicht der Umbau.


- [ ] **C-155: Zwei Befunde in `@supabase/ssr` 0.1.0** (neu
  2026-08-20). Befund aus F-07.

  `[cmd]` *„Browser-Client crasht bei `cookieOptions` ohne `cookies`;
  `storageKey` nur im `ServerClient`."* **Lokal umgangen,
  `packages/shared` unangetastet.**

  `[read]` **`apps/admin` nutzt denselben Pfad und sollte geprueft
  werden** — der F-07-Agent hat es gemeldet statt nebenbei angefasst.


- [ ] **G-102: Der Ausfuehrer fuer bestaetigte Vorschlaege** (neu
  2026-08-20). Aus F-07, bewusst nicht gebaut.

  `[cmd]` **`pending_actions` traegt Vorschau, Verfall und
  `confirmed_at`** — **aber niemand wendet den `payload` an.**

  `[read]` **Das war schon G-94s Befund:** *„`payload` beschreibt, was
  geschehen soll, niemand wendet es an."*

  `[cmd]` **Er braucht die Autonomy-Wirkungsregeln** — und die haengen
  an T-Entscheidungen. **Eigener Auftrag, nach Toms Antworten.**

- [ ] **C-158: Der Gap-Score braucht Naehrstoffcodes je Substanz** (neu
  gefasst 2026-08-20). **Codex-Auftrag, nicht Kimi.**

  ### Der Import ist erledigt

  `[cmd]` **567 Substanzen liegen im Katalog** (C-134). **Was fehlt, ist
  nicht der Bestand, sondern die Verbindung:** Ein Eintrag *„Vitamin D3
  5000 IU"* traegt den Namen, **aber kein Feld sagt `VITD = 125 µg`.**

  `[cmd]` **Deshalb bleiben 15 `nutrient_gap_rules` blockiert** — sie
  fragen *„deckt ein Supplement die Luecke bei Magnesium?"*, **und der
  Bestand antwortet in Prosa.**

  ### Warum Codex und nicht der Rechercheweg

  **Tom, 2026-08-20:** *„Kimi hat nur seine Sachen im Kontext. Wenn du
  Repo- oder DB-Sachen mit ihm abarbeiten willst, musst du ihm den
  Kontext dazu geben — oder wir lassen das Codex machen, der hat Repo-
  und DB-Zugriff."*

  `[cmd]` **Die 138 BLS-Codes stehen in `nutrient_defs`** — mit Namen,
  Einheiten und Gruppen. **Kimi muesste sie erst bekommen und wuerde
  dann raten, welcher zu *„Vitamin D3"* gehoert.**

  `[read]` **Codex hat beides** — die Codes und die 567 Substanzen.
  **Er kann zuordnen statt raten.**

  `[cmd]` **Und der Umfang ist klein:** Von 567 tragen die meisten gar
  keinen Naehrstoff — Peptide, SARMs, Botanicals. **Es geht um
  Vitamine, Mineralien und Aminosaeuren**, etwa 60 Eintraege.

  ### Der erste Schritt ist messen

  `[cmd]` **Pruefen, ob die Mengen schon im Bestand stehen** —
  `dosing.official_label_dose`, `studied_dose_ranges`, oder
  `products.jsonl` (50 Eintraege). **Wenn ja, braucht es Kimi gar
  nicht.**

  `[read]` **Wenn nein: melden** — dann geht eine gezielte Frage an den
  Rechercheweg, **mit den 138 Codes im Anhang.**

  ### Die Einheitenfalle gehoert dazu

  `[cmd]` **C-149:** Vitamin D steht im Supplement in **IU**, im
  Naehrstoffpfad in **µg**. **Naiv addiert: 33.430 % statt 930 %,
  Faktor 40.**

  `[read]` **Ein Umrechnungsfaktor liegt nirgends im Repo.** **1 µg
  Vitamin D3 sind 40 IU** — aber der Faktor gehoert belegt, nicht aus
  dem Kopf.

- [ ] **G-116: Generelle Ausschluesse bewerten mit 0, statt zu
  filtern** (entschieden 2026-08-20). Befund aus G-104.

  **Tom, 2026-08-20:** *„Ich wuerde es einfach mit 0 bewerten, dass es am
  Schluss noch auftaucht."*

  ### Der Befund

  `[cmd]` **Gemessen:** `schokolade` **163 → 1.** *„Kommt vom
  Seed-Ausschluss `ultra_processed`, der ueber die Tag-Schiene hart
  filtert — korrekt, aber an der Pille nicht ablesbar."*

  ### Die Unterscheidung

  | | wirkt | warum |
  |---|---|---|
  | **Allergen** | **hart raus** | Sicherheit — sonst nuetzt es nichts |
  | **Diet type** | hart raus | eine Entscheidung, keine Neigung |
  | **Genereller Ausschluss** | **auf 0, ganz unten** | eine Vorliebe |

  `[read]` **Wer `ultra_processed` meidet, will es trotzdem finden, wenn
  er danach sucht.** Und praktisch loest es das Anzeigeproblem mit: **163
  Treffer, Schokolade unten** — statt eines Treffers ohne Erklaerung.

  ### Was zu tun ist

  `[cmd]` **`general_exclusions[]` und `exclusion_preset_code` wirken
  als Bewertung, nicht als Filter** — die Rangfolge nennt sie heute
  nicht, **sie verhalten sich aber wie Allergene.**

  `[cmd]` **Und die Presets aus C-93 gehoeren dazu** — Halal, Koscher,
  kein Rind. `[read]` **Auch dort gilt: wer Schwein meidet, will
  Schweinefleisch finden koennen**, wenn er ausdruecklich danach sucht.

  `[read]` **Die Allergene bleiben hart** — G-67 hat es begruendet:
  *„`hard_exclude` ist die Stufe, die auch fuer Allergene gilt."*

- [ ] **C-159: Sieben Regelpfade zeigen auf Schemata, die es nicht
  gibt** (neu 2026-08-20). **Die Landkarte dessen, was fehlt.** Befund
  aus G-110.

  `[cmd]` **Von zwoelf `missing_input`-Pfaden haengen sieben an Quellen
  ohne Tabelle:**

  | | |
  |---|---|
  | **kein Schema `sleep`** | Recovery-Entwurf: `sleep_data` zurueckgestellt bis Wearable-Import |
  | **kein `location`** | nirgends im Repo |
  | **keine Symptomtabelle** | G-84: *„fuer Symptome gibt es keine Tabelle im ganzen Schema"* |
  | **kein `training.high_impact`** | im Feldvertrag genannt, nicht gebaut |

  `[read]` **Das ist wertvoller als eine Liste fehlender Felder** — es
  sagt, **welche Module die Regel-Engine noch nicht erreicht.**

  `[cmd]` **Und es deckt sich mit F-06:** *„Die Arbeitsobjekte haben keine
  Tabelle."* **Dieselbe Luecke aus anderer Richtung gemessen.**

- [ ] **G-118: Der Extended-Code liegt im Buendel** (neu 2026-08-20).
  Rest aus G-110.

  `[cmd]` **Das Gate haelt** — serverseitig gegen `experience_level`.
  **Aber der Code wird trotzdem ausgeliefert.**

  `[read]` *„Ein `dynamic({ssr:false})` hielt ihn heraus — und machte den
  Tab leer."* **Der Agent hat es zurueckgenommen, richtig.**

  **Zu klaeren:** Reicht das Gate, oder soll der Code gar nicht erst zum
  Browser? `[read]` **Es geht um PED-Protokolle** — die Frage ist
  nicht rein technisch.

- [ ] **C-160: Der Bewertungshorizont je Naehrstoff ist leer** (neu
  2026-08-20). **Fuer den Rechercheweg.** Rest aus C-157.

  `[cmd]` **Die Felder stehen:** `assessment_horizon_days`, `_source`,
  `_notes` an `nutrient_defs`. **138 Zeilen, alle leer.**

  `[read]` **Was gebraucht wird, mit Quelle:**

  | | |
  |---|---|
  | Vitamin D, B12, Eisen, Folat | **Speicher — Wochen bis Monate** |
  | Vitamin C, B1, B2 | wasserloeslich — **Tage** |
  | Natrium, Kalium, Wasser | tagesaktuell |

  `[cmd]` **EFSA und DGE unterscheiden Tagesbedarf von Zufuhr ueber die
  Zeit** — das ist eine Recherche, keine Erfindung.

  `[read]` **Und die Wirkung ist konkret:** Die Anzeige zeigt dann von
  selbst das passende Fenster — **Vitamin D ueber 90 Tage, Natrium ueber
  einen.**

- [ ] **G-119: `supplements` ist das letzte Modul mit `useState`-Tab**
  (neu 2026-08-20). Rest aus G-117.

  `[cmd]` **Sechs Module nutzen `lib/tab-url.ts`**, Nutrition hatte das
  Muster — **`supplements` nicht.** *„Fremder Bereich, gemeldet —
  dieselbe Zwei-Zeilen-Aenderung."*

- [ ] **G-120: `updateWaterLogAmount` liegt fertig und ungenutzt** (neu
  2026-08-20). Rest aus G-117.

  `[cmd]` **Der Schreibweg existiert**, nur der Knopf fehlt. `[read]`
  *„Ein Stift-Knopf waere der vollstaendige Korrekturweg."*

  `[read]` **Dritter Fall dieser Art** — nach `InjektionsKarte` (G-53)
  und `score.ts` (G-82): **gebaut und nie gerufen.**

- [ ] **A-29: `schuss.mjs` und die Git-Bash-Pfadumwandlung** (neu
  2026-08-20). Werkzeugfund aus G-117.

  `[cmd]` *„`schuss.mjs`-Pfade ohne `?` fallen der
  Git-Bash-Pfadumwandlung zum Opfer — **`MSYS_NO_PATHCONV=1` loest
  es**."*

  `[read]` **Gehoert in die Datei selbst oder in `CLAUDE.md`**, sonst
  faellt der naechste Agent darauf herein.
