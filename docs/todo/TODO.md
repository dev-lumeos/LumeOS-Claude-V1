# TODO — LumeOS

**Stand:** 2026-08-17, Anker `0c70437` auf `dev`.
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

`[cmd]` 72 offen, 4 in Arbeit.

| | Punkt | |
|---|---|---|
| **A-06** | Design-System spezifizieren |  |
| **A-08** | ADR Medienort |  |
| **A-11** | Specs laufend zu SSOT konsolidieren | ~ |
| **A-13** | Das Konsolidierungsregister abarbeiten |  |
| **C-64** | 942 Schluessel und Thai aus dem Vorgaengerrepo uebertragen |  |
| **A-15** | Sprachpflege als laufende Regel |  |
| **B-20** | Codex-Pfadschutz wiederherstellen |  |
| **B-25** | Geteilte Sitzung im Produktbereich prüfen |  |
| **C-01** | Frontend-Stack-Lücke schliessen |  |
| **C-06** | WP-05 erstes Mock-Modul echt machen |  |
| **C-08** | `services/nutrition-api` einordnen |  |
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
| **C-54** | `display_tier` als Ordnung der Anzeige benutzen |  |
| **C-52** | Zwei essenzielle Fettsäuren ohne Ziel und ohne Bewertung |  |
| **C-53** | Elf Nährstoffe erreichen die Bewertung nicht |  |
| **GO-01** | Goals | ~ |
| **G-04** | Zwei Zahlen im Entwurf, die nicht stimmen |  |
| **G-06** | Die übrigen Module nach Datenlage |  |
| **G-07** | Umschalten |  |
| **G-10** | `btn-accent` auf Seiten ohne Modulakzent |  |
| **G-11a** | Preferences — die Oberflaeche |  |
| **C-62** | `hard` auf Allergene ist kein Sicherheitsversprechen |  |
| **G-11** | Die restlichen Nutrition-Tabs anbinden |  |
| **G-17** | Datum beim Modulwechsel mitgeben |  |
| **G-23** | Der Modulkopf bricht um |  |
| **G-24** | JetBrains Mono laden |  |
| **G-26** | `MuscleBodyMap` nach `packages/ui` |  |
| **A-17** | Datenherkunft, bevor die Geraete kommen |  |
| **A-16** | `public/mockup/` als dritten Fundus auswerten |  |
| **G-13** | Der Add-Food-Dialog braucht die ganze Suchlogik |  |
| **C-65** | Toms Passwort steht nirgends |  |
| **G-25** | Training an echte Daten anschliessen |  |
| **G-27** | `v2-rec-grid-1135` und drei weitere Raster |  |
| **G-30** | Recovery an die Check-ins anschliessen |  |
| **GO-09** | Zieluebersicht in `/v2/goals` |  |
| **G-31** | Die fuenf fehlenden Supplements-Tabs |  |
| **G-32** | `refillUrgent` ist an einem von neun Eintraegen gesetzt |  |
| **GO-13** | Fuenf Goals-Kacheln koennen sofort echt werden |  |
| **G-34** | `.v2-btn` hat kein `white-space: nowrap` |  |
| **G-35** | Zwoelf Modul-Raster in `goals.css` |  |
| **G-37** | Supplements an den Katalog anschliessen |  |
| **GO-14** | Welche Koerperfettformel gilt |  |
| **GO-11** | Meilensteine und Fortschritt je Ziel |  |
| **C-69** | Medical-Schema |  |
| **G-39** | Zwei Symbole fehlen (`shield`, `file`) |  |
| **G-38** | Vollstaendigkeit aller Mockups nachmessen | ~ |
| **G-40** | Coach als Mockup — zwei Unterbereiche |  |

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

- [~] **A-11: Specs laufend zu SSOT konsolidieren** (neu 2026-08-14).
  Arbeitsregel, kein Bauauftrag. **Ablauf und Register stehen seit dem
  2026-08-14 in `docs/spezifikation/00-KONSOLIDIERUNG.md`.**

  **Toms Festlegung (2026-08-14):** Die Specs sind **Grundlage der
  Diskussion** darüber, was verbindlich gilt. Sie werden laufend
  konsolidiert — nicht in einem Zug, sondern jeweils dann, wenn an einem
  Bereich gearbeitet wird. Das Verfahren muss für jeden gleich
  funktionieren, auch für einen fremden Agenten.

  `[read]` **Das Verfahren war bereits vollständig beschrieben** und
  wurde nur nicht angewandt: `docs/spezifikation/00-INDEX.md` (Stand
  2026-08-02) legt die Rollen der Ordner fest, den Pflicht-Statuskopf,
  die vier Regeln aus dem Spec-Audit und die Reihenfolge — und benennt
  Nutrition als Kandidaten mit offenem Gate. Es fehlte kein Prozess,
  sondern der Nachweis, wie weit er angewandt ist.

  **Die Ablagefrage ist damit beantwortet, nicht offen:** `[read]`
  Regel 2 dort lautet „Ist und Soll getrennt". Produktentscheidungen
  gehen nach `docs/spezifikation/`, Messungen und Code-Befunde nach
  `docs/ssot/`, offene Punkte in diese Datei. Eine Produktentscheidung
  ist Soll, auch wenn sie vor Monaten getroffen wurde.

  **Was neu entstanden ist**, und mehr soll es nicht werden:
  - `docs/spezifikation/00-KONSOLIDIERUNG.md` — vier Schritte, vier
    Zustände (`offen` · `gelesen` · `aufgeloest` · `verworfen`), ein
    Register über `[cmd]` **84 Dateien** (45 Specs, 39 Brainstorm).
  - `CLAUDE.md` nachgezogen: Altbestand wird **mitgelesen**, ist aber nie
    Current Truth; in `docs/specs/` wird nicht geschrieben.
  - `[read]` Der Steuersatz `BLOCKED_BY_PRODUCT_GATE` im Kopf von
    `docs/specs/Nutrition/INDEX.md` ist als überholt gekennzeichnet — er
    stammt aus dem abgelegten Governance-Modell und hätte beim nächsten
    Lesen jemanden angehalten.

  **Die Grenze, die dabei gilt:** kein Freigabelauf, keine Risikoklassen,
  keine Warteschlange, keine Werkzeuge. Der Altbestand hat 1,5 MB
  Spezifikation und nichts Gebautes hervorgebracht, die frühere
  Governance-Maschinerie 476 Dateien. Wenn das Register anfängt, Pflege
  zu kosten, ist es falsch gebaut.

  **Offen bleibt nur die Anwendung.** `[cmd]` Drei von 84 Dateien sind
  eingetragen — die beiden, aus denen C-34 entstanden ist, plus die
  Entscheidungssammlung. Der Punkt bleibt dauerhaft in Arbeit; er wird
  nicht abgeschlossen, sondern angewandt.


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

---

---

## GO - Goals

`[read]` Plan: `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md`



- [ ] **C-54: `display_tier` als Ordnung der Anzeige benutzen** (neu
  2026-08-16). **Tom, 2026-08-16:** *„Es gibt Hauptmakros und
  Nebenmakros — auch das findest du im alten Repo, und ich wiederhole
  mich zum tausendsten Mal."*

  `[cmd]` **Die Struktur existiert seit dem BLS-Import und wird nirgends
  benutzt:** `nutrition.nutrient_defs.display_tier`.

  | Stufe | Anzahl | Beispiele |
  |---|---|---|
  | **1** | 31 | Energie, Protein, Fett, Kohlenhydrate, Ballaststoffe, Zucker, gesättigte Fettsäuren, Salz |
  | **2** | 47 | Linsäure, Alpha-Linolensäure, Leucin |
  | **3** | 60 | der Rest |

  **Das ist die Haupt-/Nebenmakro-Unterscheidung.** `[cmd]` Die
  Designvorlage zeigt sie bereits: im Diary die vier Hauptwerte mit
  Ringen, darunter `Ballaststoffe · Zucker · gesättigte Fettsäuren ·
  Salz · Wasser` als Zeilen ohne Ring — alles Stufe 1.

  **Zwei offene Fragen lösen sich damit:**

  - `[cmd]` Linsäure und Alpha-Linolensäure zeigen heute **3,43 g und
    0,21 g ohne Bezug**, obwohl seit `d438ca4` Zielwerte existieren
    (13,2 g und 1,7 g). Sie sind Stufe 2 — sie gehören unter die
    Hauptmakros, nicht in die Mikronährstoffliste.
  - Die Nährstoffliste bekommt eine Ordnung, **die nicht erfunden ist.**

  **Was zu tun ist:** `display_tier` in `daily_summary` oder in der
  Leseschicht verfügbar machen und die Anzeige danach gliedern.
  `[cmd]` Die Spalte steht in `nutrient_defs`, nicht in der Tagessicht.

  **Zu prüfen, bevor gebaut wird:** `[cmd]` 31 Einträge in Stufe 1 —
  das sind mehr als die acht, die `daily_summary` als Makros führt. Sieh
  nach, welche das sind und ob die Einstufung trägt.

- [ ] **C-52: Zwei essenzielle Fettsäuren ohne Ziel und ohne
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

- [ ] **C-53: Elf Nährstoffe erreichen die Bewertung nicht** (neu
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





- [~] **GO-01 bis GO-17: Goals** (neu 2026-08-15). **Block A zu vier
  Fünfteln erledigt.**

  `[cmd]` **Erledigt 2026-08-15:**

  | | |
  |---|---|
  | **GO-01** Profilpflege | `/v2/settings`, sechs Felder, 0/6 → 6/6, Zeilenschutz beidseitig belegt |
  | **GO-02** Zielzuordnung | `daten/zielrichtung-kalorienzuschlag.json` |
  | **GO-03** Zieltabelle | `goals.nutrition_targets` mit `gueltig_ab` |
  | **GO-04** Berechnung | `goals.berechne_zielwerte` — BMR 1.746,5 · TDEE 2.707,1 · **2.977,8 kcal** · 156,8 g Protein |
  | **GO-05** Ringe | mit C-03 angeschlossen, `goals.zielwerte_am` als Nenner |

  **Der Vorgänger hatte GO-02 nicht gelöst, sondern viermal verschieden
  beantwortet:** `[cmd]` `calculateTDEE.ts` nimmt die Trainingsfrequenz
  und rechnet Prozent, `useTDEE.ts` nimmt `activity_level` und rechnet
  absolute kcal, eine dritte Stelle führt ein viertes Zielvokabular.
  **Der Fundus muss das sagen**, sonst liest es beim nächsten Mal wieder
  jemand als gelöst.

  **Drei Stellen bewusst nicht übernommen:** `[cmd]`
  `getFullYear() - Geburtsjahr` ignoriert den Geburtstag (für den
  1.12.1990 sagt der Vorgänger 36, die neue Funktion 35). Der Rückfall
  `|| 1.55`. Und `targetCalories: 0` — *eine 0 im Kalorienziel ist keine
  Fehlermeldung, sondern eine Behauptung.*

  `[cmd]` **`health` bleibt offen** mit `null` und Status `OFFEN`. Der
  Vorgänger kennt die Zielrichtung nicht; 0,0 wäre eine stille
  Entscheidung gewesen.

  `[cmd]` **Das Gültigkeitsdatum belegt:** 20.08. liefert 2.978, 15.09.
  liefert 2.200, 01.08. liefert **keine Zeile** — nicht das älteste Ziel
  als Näherung.

  **Offen bleibt Block B (GO-06 … GO-12) und Block C (GO-13 … GO-17).**
  `[cmd]` Block C ist seit den Testdaten prüfbar — 14 Tage je Nutzer —
  aber fachlich weiterhin auf echte Verläufe angewiesen.
  **Plan: `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md`**
  — 353 Zeilen, mit Quellenregister, gemessenem Ist-Zustand, neun
  Widersprüchen und der Abgrenzung, was **nicht** gebaut wird.

  `[read]` Goals ist der Massstab, an dem Buddy seine Empfehlungen misst
  — **keine eigenständige Dateneingabe.** `[cmd]` Die Vision nennt
  „Goals" einmal, „Buddy" 22-mal; Prinzip 1 lautet *„Buddy IST das
  Produkt"*. Die Spec nennt Goals „Betriebssystem-Kern" — das trägt die
  Vision so nicht.

  **Der Blocker ist nicht das fehlende Schema.** `[cmd]` Die sechs
  Profilspalten für die TDEE-Formel existieren seit dem 2026-08-15 und
  sind bei **beiden** Nutzern leer — 0 von 2. Nichts füllt sie. Deshalb
  steht Profilpflege als GO-01 vor allem anderen; sie braucht kein neues
  Schema.

  **Block A — die Ringe füllen** (GO-01 … GO-05): Profilpflege ·
  Makro-Regel entscheiden · `goals`-Zieltabelle mit vier Zahlen · TDEE
  als reine Funktion · Ringe anschliessen.
  `[cmd]` Danach zeigt `/v2/nutrition` gefüllte Ringe statt leerer.

  **Block B — Goals als Modul** (GO-06 … GO-12): Zielvokabular
  vereinheitlichen, `user_goals` und `goal_phases`, Phasenparameter,
  Zielübersicht, Körpermessungen, Meilensteine, Onboarding.

  **Block C — nicht terminierbar** (GO-13 … GO-17): `[cmd]` Die adaptive
  TDEE braucht **zwei volle Wochen** Gewichts- und Kaloriendaten;
  `meals` hat 0 Zeilen und es gibt keinen Schreibpfad. Ein Datum dafür
  wäre erfunden.

  **Entscheidungen Toms, 2026-08-15:** Die Zieltabelle gehört in ein
  eigenes `goals`-Schema, nicht nach `nutrition`. Der Plan liegt unter
  `30-module/core/`, nicht unter `40-…` (das ist für Lieferungen
  reserviert).

  **Die Rangfolge der Quellen ist nicht die übliche:**

  | | | |
  |---|---|---|
  | 1. Vorgängerrepo | `referenz/lumeos-2026/` | die **Rechenwege** |
  | 2. Designvorlage | `theme-v1/module-goals*.jsx` | der **Umfang** |
  | 3. Spec | `docs/specs/Goals/` | die **Absicht** |

  `[cmd]` **Die Formeln existieren als laufender Code:**
  `referenz/lumeos-2026/src/modules/onboarding/utils/calculateTDEE.ts`
  liefert `tdee`, `targetCalories`, `proteinG`, `fatG`, `carbsG` — und
  beantwortet zwei der gemeldeten Lücken: **Mifflin-St Jeor mit
  angewandtem Aktivitätsfaktor** (die Spec-Formel liefert BMR und liegt
  um Faktor 1,2–1,9 zu niedrig) und **Kohlenhydrate als Restgrösse**
  (steht in keiner Goals-Spec).

  `[cmd]` Die Spec ist die schwächste Quelle: KI-erzeugt, und
  `BrainstormDocs/Goals/new/` ist byte-identisch — an dieser Stelle eine
  Kopie, keine Synthese. `[cmd]` `DATABASE.md` ist nicht ausführbar wie
  abgedruckt (`UNIQUE (…) WHERE` gibt es in PostgreSQL nicht).

  **Drei Korrekturen am Plan, beim Bauen von GO-01 sichtbar geworden:**

  - **Eine vierte Entscheidung gehört nach Block A.** `[cmd]`
    `nutrition_goal` kennt sechs Werte, die Phasenmodelle neun —
    `performance` und `health` haben dort **keine Entsprechung**. Ohne
    diese Abbildung weiss GO-04 nicht, ob Defizit oder Überschuss. Das
    ist das Vorzeichen, keine Feinheit. Der Plan ordnete es GO-06 zu.
  - **GO-03 braucht ein Gültigkeitsdatum.** Sonst ist später nicht
    sagbar, gegen welches Ziel ein vergangener Tag lief — das Tagebuch
    zeigte rückwirkend falsche Deckungsgrade, sobald jemand die Phase
    wechselt.
  - **Zwischen GO-04 und GO-05 fehlt ein Schritt:** Was zeigt das
    Tagebuch bei halbem Profil? Heute sagt es „keine Ziele". Es muss
    sagen, **was fehlt und wohin man geht** — dieselbe Logik wie beim
    Ring, der nicht lügen soll.

  `[cmd]` Ausserdem: GO-04 ist kleiner als gedacht (zwei Formeln, alle
  Eingaben liegen vor), GO-03 grösser.

  **Offene Entscheidungen vor Block B:** vier verschiedene
  Zielvokabulare ohne Abbildung (6 / 12 / 9 / 4 Werte) und derselbe
  Anpassungsalgorithmus zweimal mit unterschiedlichen Schwellen.

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

- [ ] **G-10: `btn-accent` auf Seiten ohne Modulakzent** (neu
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

- [ ] **G-11a: Preferences — die Oberflaeche** (neu 2026-08-17).
  Datenseite erledigt.

  `[cmd]` **Erledigt 2026-08-17**, Kettenschritt `074`:
  `nutrition.food_preferences_read` und `food_preferences_write`, beide
  live. Testdaten: Tom hat 1 Praeferenzzeile und 3 Eintraege — **`hard`
  Nuesse, `soft` Kekse, `boost` Weisser Reis.**

  `[cmd]` Zeilenschutz in beide Richtungen belegt: eigene Zeile lesen 1,
  fremde 0; eigener Schreibzugriff ok, fremder blockiert mit `42501`.

  `[cmd]` **`food_search` blieb unveraendert** — wie beauftragt. Wo die
  vier Stufen ansetzen muessten, steht im Bericht.

  **Was offen ist:** die Oberflaeche im Tab `Preferences`. `[cmd]` Die
  Designvorlage hat dafuer **keinen Inhalt** — nur den
  Navigationseintrag. `[cmd]` Das Vorgaengerrepo hat
  `FoodPreferences.tsx` mit **48 KB**.

  **Und die Wirkung auf die Suche ist ein eigener Schritt** — sie
  greift erst, wenn `food_search` die Praeferenzen liest.

- [ ] **C-62: `hard` auf Allergene ist kein Sicherheitsversprechen**
  (neu 2026-08-17). Befund aus G-11a.

  `[read]` Aus dem Bericht: *„`hard` auf Allergene ist technisch ein
  harter Ausschluss, aber fachlich kein Sicherheitsversprechen, weil
  `contains_nuts` nur 120 von 7.140 Foods markiert. Unmarkiert heisst
  ungeprueft, nicht nussfrei."*

  `[read]` Das ist die Kehrseite der richtigen Entscheidung aus C-44:
  Allergene wurden **umgekehrt** markiert, weil „enthaelt Nuesse"
  belegbar ist und „enthaelt keine" nicht.

  **Ein Ausschluss auf dieser Grundlage wirkt in beide Richtungen
  falsch:** Er blendet aus, was markiert ist — und zeigt alles, was nur
  nicht markiert wurde.

  **Zu entscheiden, bevor die Oberflaeche Allergien anbietet:**
  - Sagt die Anzeige, dass die Markierung unvollstaendig ist?
  - Oder wird `hard` erst angeboten, wenn die Abdeckung reicht?
  - `[cmd]` Wie viele Lebensmittel muessten markiert sein, damit es
    traegt? **Das ist eine Kurationsfrage in der Groessenordnung der
    Anzeigenamen.**

  `[read]` Eine Allergikerin, die sich auf einen Filter verlaesst, der
  nur 120 von 7.140 kennt, ist schlechter dran als ohne Filter.

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


- [ ] **G-23: Der Modulkopf bricht um** (neu 2026-08-17). Befund aus
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

- [ ] **G-24: JetBrains Mono laden** (neu 2026-08-17). Rest aus G-18.

  `[cmd]` Die Vorlage setzt `--font-mono: 'JetBrains Mono', ui-monospace,
  monospace`; hier steht nur die Systemkette. `v2.css` benutzt
  `var(--font-mono)` an sechs Stellen — dort stehen in der Vorlage die
  Kennzahlen.

  `[annahme]` Der Unterschied duerfte klein sein. **Belegbar erst, wenn
  die Schrift geladen ist** — dann laesst sich vergleichen statt
  vermuten.

  `[cmd]` Der Weg ist derselbe wie bei Inter: `next/font/google`, beim
  Bauen geladen, keine Laufzeitabhaengigkeit.


- [ ] **G-26: `MuscleBodyMap` nach `packages/ui`** (neu 2026-08-17).
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

- [ ] **A-17: Datenherkunft, bevor die Geraete kommen** (neu
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

- [ ] **G-13: Der Add-Food-Dialog braucht die ganze Suchlogik** (neu
  2026-08-17). **Tom, 2026-08-17:** *„Add food — da muss unsere ganze
  Logik rein mit Filter und Suche und Alias und richtige Begriffe wie
  weisser Reis anstatt Reis poliert."*

  **Der Dialog zeigt den falschen Namen.** `[cmd]` Er zeigt
  `Reis poliert, roh` — das ist `name_de`, der amtliche BLS-Wortlaut.
  **`name_display_de` sagt `Weisser Reis (roh)`.**

  `[cmd]` `food_search` liefert **beide Felder**, und
  `lib/nutrition/food-search.ts` kennt beide — **der Dialog greift auf
  das falsche zu.** Ein Anzeigefehler, keine fehlende Datenbasis.
  `[read]` Damit ist die Arbeit von C-39 und C-41 unsichtbar: 7.140
  Anzeigenamen, davon 2.870 abweichend vom amtlichen Namen.

  **Was sonst fehlt:** `[cmd]` `food_search` nimmt `p_category_slug`,
  `p_category_id`, `p_tag_code` und `p_sort` entgegen — der Dialog
  nutzt nichts davon.

  | | |
  |---|---|
  | Filter nach Kategorie | `[cmd]` 518 Kategorien |
  | Filter nach Tag | `[cmd]` 11 vergebene — `whole_food` 2.884, `vegan` 1.377 |
  | Aliase | `[cmd]` 32.845 in vier Herkuenften |
  | Sortierung | `sort_weight`, 95 Stufen |

  `[cmd]` Die Suchseite unter `Food DB` nutzt einen Teil davon; **der
  Dialog faengt bei null an.**

  **Portionen als Vorwahl:** `[cmd]` Heute zeigt die Auswahl
  `100 g (100 g) · Vorgabe` — **das ist C-60 und wird in den Daten
  behoben.** Der Dialog zeigt nur die Vorgabe; stimmt sie, stimmt die
  Vorauswahl. `[read]` Tom: *„die Darstellung danach in der View in
  Gramm ist korrekt."*



- [ ] **C-65: Toms Passwort steht nirgends** (neu 2026-08-17). Befund
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


- [ ] **G-27: `v2-rec-grid-1135` und drei weitere Raster** (neu
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

- [ ] **G-30: Recovery an die Check-ins anschliessen** (neu 2026-08-17).
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

- [ ] **GO-09: Zieluebersicht in `/v2/goals`** (neu 2026-08-17). Folgt
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

- [ ] **G-31: Die fuenf fehlenden Supplements-Tabs** (neu 2026-08-17).
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


- [ ] **G-32: `refillUrgent` ist an einem von neun Eintraegen gesetzt**
  (neu 2026-08-17). Befund aus G-29.

  `[cmd]` Das Feld wird **an drei Stellen gelesen**, ist aber nur an
  einem der neun Praeparate gesetzt — **acht fallen auf die Warnfarbe
  zurueck.**

  `[read]` **Uebernommen wie es ist; begradigen waere eine Erfindung.**
  Richtig so — aber sobald echte Daten kommen, gehoert entschieden, ob
  das Feld eine Schwelle ist (Bestand unter X Tagen) oder eine
  Markierung von Hand.

- [ ] **GO-13: Fuenf Goals-Kacheln koennen sofort echt werden** (neu
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

- [ ] **G-34: `.v2-btn` hat kein `white-space: nowrap`** (neu
  2026-08-17). Befund aus G-28.

  `[cmd]` `v2.css:344`. **Die Kopfknoepfe brechen innerhalb des Knopfes
  um** — die Knopfhoehe bleibt bei 26 px, gemessen.

  **Betrifft jedes Modul.** `packages/ui` war waehrend G-28 gesperrt —
  gemeldet, nicht lokal umgangen.

  `[read]` Haengt mit G-23 zusammen: Dort bricht der **Modulkopf** um,
  weil zu viele Knoepfe drin sind. **Hier bricht der Knopf selbst.**
  Zwei verschiedene Fehler, dieselbe Stelle.

- [ ] **G-35: Zwoelf Modul-Raster in `goals.css`** (neu 2026-08-17). Rest
  aus G-28.

  `[cmd]` Die geteilten `v2-grid-14`/`-15` tragen **acht der zehn
  Tabs** — der Rest sind Sonderfaelle.

  **Gleiche Behandlung wie G-19 und G-27:** in den `zusatz`-Block des
  Erzeugers, **beim Verschieben zusammenfassen.** `[read]` Sonst stehen
  am Ende elf Modul-Rastersaetze nebeneinander, die dasselbe tun.

- [ ] **G-37: Supplements an den Katalog anschliessen** (neu
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

- [ ] **GO-14: Welche Koerperfettformel gilt** (neu 2026-08-17).
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

- [ ] **GO-11: Meilensteine und Fortschritt je Ziel** (neu 2026-08-17).
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

- [ ] **C-69: Medical-Schema** (neu 2026-08-17). Befund aus G-36.

  `[cmd]` **Kein `medical`-Schema** — alle 21 Kacheln sind Attrappe.

  **Der Fundus ist der groesste bisher:** `[cmd]` **selbst gemessen**
  (die Pfade im Auftrag stimmten nicht — die Dateien liegen unter
  `src/modules/medical/data/`):

  | | |
  |---|---|
  | `biomarkerSynonyms.ts` | **457 Synonympaare auf 91 kanonische Namen, davon 18 auf Thai** |
  | `biomarkerDetails.ts` | **242 Eintraege, 1.563 Zeilen** |
  | `015_medical.sql` | 7 Tabellen, teils anders benannt als `SPEC_06` |

  `[read]` **Die Synonymtabelle ist exakt das, was der Import-Tab
  voraussetzt** — der Uploadtext der Vorlage wirbt mit *„German,
  English, Thai lab formats supported"*. **Und die 18 Thai-Eintraege
  sind der einzige Thai-Bestand im ganzen Projekt neben den 961
  i18n-Schluesseln.**

  `[cmd]` **Der Spec-Widerspruch ist bestaetigt:** `SPEC_06` hat 8
  `CREATE TABLE`; `UserMedicalInsight` und `UserHealthReport` kommen in
  `SPEC_02` **4-mal** vor, in `SPEC_06` **0-mal**. `[read]` Das ist der
  haerteste Befund des Spec-Audits, und er gilt.

- [ ] **G-39: Zwei Symbole fehlen (`shield`, `file`)** (neu 2026-08-17).
  Befund aus G-36.

  `[cmd]` `shield` **zweimal, an der sichtbarsten Stelle** → ersetzt
  durch `admin`; `file` → `copy`. `packages/ui` war gesperrt.

  `[read]` Dritter Fund dieser Art nach G-20 (fuenf Symbole) und G-21.
  **`arr_r` nicht uebernommen** — ein Test haelt das fest.

- [~] **G-38: Vollstaendigkeit aller Mockups nachmessen** (neu
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

- [ ] **G-40: Coach als Mockup — zwei Unterbereiche** (neu 2026-08-17).
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
