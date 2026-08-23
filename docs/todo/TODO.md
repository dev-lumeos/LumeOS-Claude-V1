# TODO — LumeOS

**Stand: 2026-08-22.** 220 offen, 0 in Arbeit.
Die Zahl ist aus dieser Datei gezählt.

**Konvention:** `[ ]` offen · `[~]` in Arbeit · *Blocker kursiv*

**Belegpflicht:** Aussagen über den Ist-Zustand tragen `[cmd]`, `[read]`
oder `[annahme]`. Nur `[cmd]` darf zu einer Regel werden.

**Erledigtes** steht vollständig in `docs/todo/ERLEDIGT.md` — mit Datum,
Beleg und Begründung. Diese Datei enthält nur, was noch aussteht.

**Wer gerade woran arbeitet:** `docs/todo/LAUFEND.md`.

**Alle Punkte auf einen Blick:** `docs/todo/00-UEBERSICHT.md` — erzeugt,
nicht gepflegt. `node tools/nummern-pruefen.mjs --schreiben` schreibt sie
neu, das Gate wird rot, wenn sie vom Bestand abweicht.

---

## Vor jedem Auftrag

`docs/spezifikation/00-QUELLEN.md` sagt je Modul, welche Mockups und
Specs es gibt — **49 Mockups (1,7 MB), 160 Spec-Dateien (15,8 MB).**

`[read]` **Kein Modul hat nur eine Mockup-Datei.** Nutrition hat drei,
Recovery fünf, Coach acht. **Und zwei Dateien tragen Rechenwerke, keine
Anzeige:** `module-training-spec.jsx` und `module-recovery-engine.jsx`.

`[cmd]` **`docs/specs/` ist kein Altbestand.** Es enthält getroffene
Entscheidungen — Health score, Onboarding, zwölf ADRs zu Nutrition.
**Prüfend lesen, jede Zahl gegen den Bestand prüfen.** A-20 zählt sieben
inhaltliche Fehler, G-135 fünf weitere allein in `SPEC_09_SCORING`.

**Die Begründung steht in `docs/sessions/2026-08-20-uebergabe.md`.**

**Tom, 2026-08-14:** Bei Arbeit am Nutrition-Modul gehören
`docs/specs/Nutrition/` **und** `docs/BrainstormDocs/Nutrition/` mit
gelesen. `[read]` Die Anweisung ist am 2026-08-21 beim Neuschreiben des
Kopfes mit der kassierten *„nicht als Referenz"*-Regel verlorengegangen
und am selben Tag wieder eingesetzt. `docs/BrainstormDocs/` führt zwölf
Modulordner.

---

## Grössere Vorhaben mit eigenem Plan

| | |
|---|---|
| **Theme V1** (Sektion G) | `docs/spezifikation/10-plattform/design-system/theme-v1-umsetzung.md` |
| **Altbestand konsolidieren** (A-11) | `docs/spezifikation/00-KONSOLIDIERUNG.md` |
| **Goals** (GO-01 ff.) | `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md` |
| **Coach-Portal** | `docs/spezifikation/30-module/addon/01-entwurf-coach-portal.md` |

**Jedes Modul, das neu angepackt wird, bekommt vorher einen
Umsetzungsplan** — Verfahren in `docs/spezifikation/00-UMSETZUNGSPLAENE.md`.

`[read]` Zweimal hat das Fehlen einer solchen Datei Tage gekostet:
`SPEC_05_FOOD_TAXONOMY.md` wurde am vierten Tag der Arbeit an genau
ihren Fragen gelesen, und `docs/specs/Goals/` meldet „vollständig
implementiert" für ein Modul, das in diesem Repo nicht existiert.

---

## Zwei Zähler, die als Wahrheit gelesen wurden

`[read]` **Der alte Kopf stand auf „Block 28, Stand 2026-08-13"**,
während im Repo bereits Block 34 gesichert war. **Und am 2026-08-21 auf
„170 Punkte, Anker `bbd2202`, dreizehn ADRs"** — der Anker war tot, und
es sind zwölf ADRs.

`[cmd]` **Gemessen am 2026-08-21, vor dem Aufräumen: 169 Einträge auf
oberster Ebene, davon neun Nummern doppelt vergeben — 160 eindeutige.**
Weder die 170 des alten Kopfes noch die 178, die eine Zwischenfassung
dieses Absatzes nannte, lassen sich damit belegen. **Die 178 ist ersatzlos
raus:** eine dritte ungeprüfte Zahl in einem Absatz über zwei
fortgeschriebene Zähler.

`[cmd]` **A-44 ist gebaut** — `tools/nummern-pruefen.mjs` hängt im Gate
und prüft sieben Dinge: Dubletten je Datei, Nummern in beiden Dateien,
abgehakte Punkte in `TODO.md`, `LAUFEND.md` gegen den Bestand, und den
Zähler oben gegen die Datei. **Jede Prüfung ist über einen eingebauten
Fehler einzeln belegt** (`LUMEOS_NUMMERN_SELBSTTEST=1`).

---

---

## Die Sektionen sind keine Reihenordnung

`[cmd]` **Gemessen am 2026-08-22: 28 Reihenwechsel quer durch die
Datei.** Unter `## GO - Goals` liegen Punkte aus **A, C, G und GO**, in
vierzehn Wechseln hin und her. Unter `## C — Produkt: apps/web` liegen
A, C und E. Der erste `C`-Punkt steht in Sektion A, der erste `G`-Punkt
in dem Block, der spaeter `## GO` ueberschrieben ist.

`[cmd]` Verteilung: **C 87 · G 46 · A 28 · F 9 · E 6 · B 2 · GO 2.**

`[read]` **`## D`, `## E` und `## G` fehlen nicht, weil jemand sie
geloescht haette.** Die Datei ist chronologisch gewachsen: neue Punkte
kamen beim Thema dazu, die Ueberschriften blieben stehen, wo sie einmal
standen. **Der Buchstabe im Punkt sagt die Reihe. Die Ueberschrift
darueber sagt nichts.**

`[read]` **Wer sortiert sucht, nimmt `docs/todo/00-UEBERSICHT.md`** —
erzeugt, gruppiert, mit Zeilennummern, im Gate gegen den Bestand
geprueft. **Diese Datei hier ist der Volltext, und Volltexte sind
chronologisch.** Ueberschriften nachtraeglich einzuziehen hiesse, 180
Punkte umzusortieren — fuer eine Ordnung, die nie gegolten hat.

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

### C-165-Folgepunkte (Naehrstoff-Aliase, 2026-08-21) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/172-naehrstoff-aliase.md`.

- [ ] **apps/web-Anschluss der Aliase** (G-Auftrag, Nutrition-Agent):
  eine Abfrage auf `nutrition.nutrient_search_aliases` in
  `ladeOrdnung`, drittes Suchfeld `suchAlias` je Knoten, und die
  **Kurz-Token-Regelerweiterung** (Token trifft auch bei exakter
  Gleichheit mit einem `aliases_folded`-Eintrag — sonst findet
  „Vitamin B5" oder „kJ" nie etwas). Ohne diesen Auftrag liegen die
  98 Zeilen brach.
- [ ] **Thai-Umgangsnamen:** bewusst 0 importiert — ohne Sprecher oder
  Quelle waere jede Zeile erfunden. Braucht Recherche oder einen
  Sprecher, dann eine Erweiterung der Datendatei.
- [ ] **„Mineralstoffe" als Suchbegriff:** deckungsgleich mit der
  Elemente-Karte (16 Treffer) — Produktfrage, ob das Rauschen oder
  Hilfe ist.

### G-129-Folgepunkte (Naehrstoff-Suche, 2026-08-21) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/168-naehrstoff-suche.md`.

- [ ] **Probelaeufe ueberschreiben die gespeicherte Nutzeransicht:**
  seit G-122 ist jeder Klick im Nutrients-Tab Nutzerzustand — der
  G-129-Messlauf hat Toms Sicht („Auffaellig", 30 Tage) mit seinen
  Proben ueberschrieben. Kuenftige Nachweise sichern die Zeile vorher
  und schreiben sie zurueck, oder laufen auf `test-user`.
- [ ] **Kartenzuordnung als Auslegung gemeldet:** `FIBT` unter
  „Kohlenhydrate", Wasser/Alkohol/Organische Saeuren/Rohasche unter
  „Sonstige" — je eine Zeile in `karteFuerWurzel`, falls Tom es anders
  will.

### G-122-Folgepunkte (Naehrstoffbaum-Anzeige, 2026-08-21) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/166-naehrstoffbaum-anzeige.md`.

- [ ] **`CHOL` → `CHORL` fehlt (Codex):** der Cholesterin-Erklaertext
  liegt im Altbestand (Schluessel `CHOL`), `nutrient_defs` fuehrt
  `CHORL` — das Legacy-Mapping wurde bei C-161 nicht gezogen; das
  Modal zeigt fuer Cholesterin darum keine Erklaerung.
- [ ] **28 Codes ohne Erklaertext** (26 einzelne Fettsaeuren, `OLSAC`,
  `F18:2C9T11`) — das Vorgaengerrepo hat sie nie beschrieben. Ob sie
  Texte brauchen oder bewusst leer bleiben, ist eine Fach-Entscheidung
  mit Quellenarbeit, kein Import.
- [ ] **Deckungsgrenze (Tom):** Vorschlag aus G-122 — unter 50 %
  gedeckter Positionen (heute 9 Codes) den Wert dimmen und die „aus X
  von Y"-Angabe hervorheben; nicht ausblenden, nicht werten.
- [ ] **`SE` (Selen) hat keinen Zielcode** — BLS/`nutrient_defs`
  fuehren kein Selen; der Erklaertext liegt brach. Falls Selen je als
  Code dazukommt (Supplements fuehren es), haengt der Text dann dran.

### G-121-Folgepunkte (Naehrstoffanzeige, 2026-08-20) — Nummern vergibt der Orchestrator

Quelle und Belege: `docs/ssot/161-naehrstoffanzeige.md`.

- [ ] **Die Ziele haengen am Stichtag:** `daily_reference_assessment`
  liefert an einem Tag ohne Eintraege keine Zeilen — ein Zeitfenster,
  das auf einem leeren Tag endet, zeigt Werte, aber keine Ziele.
  Entweder die Referenzauswahl vom Tagesprotokoll entkoppeln (Codex)
  oder in der Anzeige auf den letzten protokollierten Tag ausweichen.
- [ ] **`test-user@lumeos.local` traegt eine Mahlzeit** (2026-08-16,
  aus einem frueheren Nachweis) — Nullzustands-Messungen muessen sie
  erst abraeumen oder einrechnen.

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






- [ ] **C-192: `p_user_id` kostet in `food_search` das Dreifache** (neu
  2026-08-22). **Laeuft bei Codex.**

  `[cmd]` `EXPLAIN (ANALYZE)`: ohne 414,7 ms, mit `dev@lumeos.app`
  1.172,6 ms. Claude Code misst unabhaengig 360,4 / 383,2 / 1.160,2 ms.
  **Kein temp read/written** — also die Preference-CTEs, kein
  Kreuzprodukt.

  `[read]` **Seit G-154 laedt der Katalog immer mit `prefs=1`**, weil
  der ADR es verlangt. Aus dem Randfall ist der Normalfall geworden.
  **Die Regel bleibt, nur ihre Kosten sind zu senken.**

- [ ] **C-193: MealCam warnt bei hart ausgeschlossenen Zutaten** (neu
  2026-08-22).

  **Tom, 2026-08-22:** *„MealCam kann alles einlesen, muss aber bei
  Erkennung darauf hinweisen, dass X laut Preferences hard excluded
  ist, und der User muss das bestaetigen."*

  `[read]` **Der Unterschied zum Katalog:** die FoodDB WENDET
  Preferences AN. **MealCam ERKENNT, was auf dem Teller liegt** —
  wegfiltern waere dort falsch. Einlesen, benennen, bestaetigen lassen.

  `[cmd]` **Nur `hard` loest aus** (Allergen, Diet type). Food ±100,
  Category ±50, Tag ±30 sind Bewertung, keine Sperre.

  `[cmd]` `ADR_MEALCAM_V1.md` kennt bisher nur *„Erst nach
  User-Bestaetigung: Meal Item erstellen"*. Der Preference-Hinweis
  fehlt dort und gehoert ergaenzt.

  **Offen:** ob ein bestaetigter Treffer die Preference dauerhaft
  aendern darf oder einmalig durchgewunken wird.

- [ ] **C-194: Den Kimi-Bestand vollstaendig aufnehmen** (neu
  2026-08-22). **Bei Fable gelaufen, Bericht geprueft.**

  `[cmd]` **8.881 Dateien, 346 MB, Crawls 017-035.** Neun Unterordner
  unter `data/`. Ergebnis: `backup/kimi-bestand-aufnahme.json`,
  Werkzeug `tools/_kimi-bestand.py`.

  **Der Bericht ist die Grundlage der Gruppe K.** Schliessen, sobald
  die Gruppe angelegt und die widerlegten Punkte nachgezogen sind.

  `[cmd]` **Drei Zaehlkorrekturen aus der Gegenpruefung:**
  `data/metadata/sources.jsonl` hat **2.288 Zeilen** (Fable suchte ohne
  `metadata/`) · **163 Punkte**, nicht 189 (Fable zaehlte Checkboxen
  inklusive Unterpunkten) · `symptom_ontology_seed` hat **32**
  Symptome, nicht 21 — **das war mein Fehler**, aus dem Punkttext
  uebernommen statt aus der Datei.

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




- [ ] **G-83: Das Onboarding ist entworfen, aber nicht gebaut**
  (berichtigt 2026-08-20). **Der urspruengliche Befund war falsch.**

  `[cmd]` **Der G-80-Agent meldete:** *„Die einzige Datei ist der
  Klienten-Assistent im Coach-Modul."* **Das stimmt fuer den Code.**

  `[cmd]` **Aber `module-onboarding.jsx` existiert** — **361 Zeilen,
  ein vollstaendiger Assistent:**

  | Schritt | |
  |---|---|
  | 1 | **Willkommen** — *„Elf Module, ein Bild … nichts verlaesst dein Konto, bis du es entscheidest."* |
  | 2 | **Grunddaten** — Name, Geschlecht, Geburtsdatum, Groesse, Gewicht, Land |
  | 3 | **Ziele** — ein Hauptziel aus sechs, mehrere Nebenziele, Zielgewicht, Zielfettanteil, Datum |
  | 4 | **Trainingsart** — setzt den Aktivitaetsfaktor |

  `[read]` **Und Schritt 4 traegt die Begruendung mit:** *„Setzt deinen
  Aktivitaetsmultiplikator — **1,725 fuer fuenf harte Einheiten die
  Woche**."*

  `[cmd]` **Genau der Wert, den C-122 als falsch gesetzt gemessen hat**
  — `very_active` bei 0,58 Trainings je Woche, **1.030 kcal Abstand.**
  **Der Entwurf haette es verhindert.**

  `[cmd]` **Schritt 2 und 3 speisen `profiles` und `user_goals`** —
  beide Tabellen stehen. **Der Erfahrungsgrad (C-118) gehoert hier
  hinein.**

- [ ] **G-131: `module-completeness.jsx` ist die Settings-Seite** (neu
  2026-08-20). **837 Zeilen, nie erwaehnt.**

  `[cmd]` **Der Name ist irrefuehrend** — die Datei enthaelt:

  | | |
  |---|---|
  | `ProfileSettingsModal`, `ProfilePanel` | Profildaten |
  | `UnitsPanel`, `UnitRow` | **Einheiten** (kg/lb, cm/in) |
  | `ModulesPanel` | welche Module sichtbar sind |
  | `PrivacyPanel`, `PermSelect` | **Freigaben** |
  | `DataSourcesPanel` | Wearables und Importe |
  | `BillingPanel` | Abrechnung |
  | `DangerPanel` | Konto loeschen |
  | **`AnatomyMap`, `MUSCLE_RECOVERY`** | Muskelkarte mit Erholungswerten |

  `[cmd]` **`MUSCLE_RECOVERY` traegt einen Wert je Muskel** — Kopf 100,
  Bizeps 90, Trizeps 82, unterer Ruecken 70, Schultern 70.

  `[read]` **C-124 meldet die Erholungszeiten als unbelegt** — **hier
  stehen sie.** Aber als Anzeigewerte eines Entwurfs, **ohne Quelle**.
  **Der Rechercheauftrag bleibt richtig**, das Format ist damit
  vorgegeben.

  `[cmd]` **Und `/v2/settings` traegt heute nur die
  Erfahrungsgrad-Kachel** (G-80). **Sieben Bereiche fehlen.**


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


- [ ] **G-152: Der Aktivitaetsstrom des Dashboards** (neu 2026-08-20,
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

- [ ] **G-126: Drei Reste aus G-122** (neu 2026-08-20).

  `[cmd]` **`CHOL` → `CHORL` (Cholesterin) waere mappbar und fehlt** —
  ein Erklaertext mehr. **Codex.**

  `[cmd]` **28 Codes haben keinen Erklaertext** — 26 einzelne
  Fettsaeuren, `OLSAC`, `F18:2C9T11`.

  ### Selen: nachgemessen, der Befund stimmt

  `[cmd]` **BLS 4.0 fuehrt kein Selen** — `nutrient_defs` hat **16
  Elemente**, Selen ist nicht dabei. Der `SE`-Treffer war `SER` (Serin).

  | | |
  |---|---|
  | gefuehrt | NACL, NA, CLD, K, CA, MG, P, S, FE, ZN, ID, CU, MN, FD, CR, MO |
  | **fehlt** | **Selen** |

  `[read]` **Das ist eine echte Luecke im Lebensmittelbestand**, kein
  Zuordnungsfehler — **und sie ist relevant:** Selen ist essenziell,
  EFSA fuehrt einen AI-Wert, und es steht in jeder
  Naehrstoffempfehlung.

  **Zu klaeren:** Bleibt es weg, oder kommt eine zweite Quelle dazu?
  `[cmd]` **BLS ist als alleinige Quelle festgelegt** — das waere eine
  Produktentscheidung.

- [ ] **GO-23: Unter 50 % Deckung wird gedimmt** (entschieden
  2026-08-20). Vorschlag aus G-122.

  **Tom, 2026-08-20: ok.**

  `[cmd]` **Gemessen:** 59 Codes zu 100 % gedeckt, 20 bei 80–99 %, **50
  bei 50–79 %, 9 unter 50 %.**

  `[cmd]` **Umsetzung:** unter 50 % den Wert dimmen und die
  *„aus X von Y"*-Angabe hervorheben. **Nicht ausblenden, nicht
  werten.**

- [ ] **A-33: Der Medical-Abgleich, den der Orchestrator nachgeholt
  hat** (neu 2026-08-20). **Tom hat danach gefragt, zu Recht.**

  `[read]` **Drei Auftraege gingen raus, ohne dass Spec, Mockup und
  Vorgaengerrepo gelesen waren.** Der Abgleich danach hat mehr gefunden
  als die Auftraege enthielten.

  ### 1. Der Health score ist entschieden — seit Monaten

  `[cmd]` **`docs/specs/Medical/SPEC_09_SCORING.md`, 408 Zeilen**,
  definiert **beide** Unbekannten aus G-85:

  ```
  SYSTEM_MARKERS = {
    liver:          [ALT, AST, GGT, ALP, Bilirubin, Albumin]
    cardiovascular: [LDL, HDL, Triglyceride, hs-CRP, Homocystein, ApoB]
    kidney:         [Kreatinin, BUN, eGFR, Harnsaeure]
    hormonal:       [Testosteron, Oestradiol, Cortisol, TSH, Free T3, Prolaktin]
    metabolic:      [HbA1c, Glukose, Insulin, HOMA-IR]
  }
  WEIGHTS = { cardiovascular .25, metabolic .25, hormonal .20,
              liver .15, kidney .15 }
  FLAG_SCORE = { optimal 100, normal 75, low/high 40, critical 10 }
  ```

  `[read]` **Der Orchestrator hat G-85 als offene Frage an Tom
  weitergegeben, obwohl die Antwort im Repo lag.**

  `[cmd]` **Und der Umgang mit Luecken ist definiert:** `totalW`
  normalisiert ueber die vorhandenen Systeme, `no_data` wenn keiner
  traegt, **`missing` zaehlt die fehlenden Marker.**

  ### 2. Warum G-84 nur 23 von 37 gruppieren konnte

  `[cmd]` **Die Spec sucht ueber Namen, nicht ueber LOINC:**
  `biomarker_name`, `common_name`, `abbreviation`.

  `[cmd]` **Nachgemessen: 18 der 26 Spec-Marker treffen unseren
  Katalog ueber den Namen.** **Die acht Fehlenden sind
  Namensvarianten** — `GGT` heisst im LOINC *Gamma glutamyl
  transferase*, `eGFR` *Glomerular filtration rate*, `Triglycerides`
  *Triglyceride*.

  `[read]` **`biomarker_aliases` hat 292 Eintraege und ist genau dafuer
  gebaut.** **Damit waeren es 26 von 26.**

  ### 3. `module-medical-data.jsx` traegt dieselbe Rechnung — und mehr

  `[cmd]` **298 Zeilen mit:** `SYSTEM_MARKERS`, `SYSTEM_WEIGHTS`,
  `calcSystemScore`, `calcOverallHealthScore`, `calcBiomarkerTrend`,
  `generateAlerts`, `UNIT_CONVERSIONS`.

  **Und zwei, die woanders fehlen:**

  `[cmd]` **`SUPPLEMENT_BIOMARKER_MAP` und
  `calcSupplementEffectiveness`** — `[read]` **genau das, was C-162
  heute in der Datenbank gebaut hat** (222 Zeilen, 66 Marker). **Die
  Vorlage lag die ganze Zeit da.**

  `[cmd]` **`SYMPTOM_BIOMARKER_MAP` und `SYMPTOMS`** — `[read]` **C-159
  meldet *„keine Symptomtabelle im ganzen Schema"*.** **Das Mockup hat
  sie.**

  ### 4. Vier Medical-Tabs, die nie erwaehnt wurden

  `[cmd]` **`module-medical.jsx`, 809 Zeilen:** `MedMedications`,
  `MedHistory`, `MedDocuments`, `MedAppointments` — **mit
  `AddLabModal`, `UploadDocModal`, `BookAptModal`, fuenf
  Detailmodalen.**

  `[cmd]` **Und `module-medical-modals.jsx`** (453 Zeilen) plus
  **`module-medical-v2.jsx`** (818) mit `RangeIndicator`, `FlagPill`,
  `TrendBadge`.

  `[read]` **176 KB Mockup, elf Specs mit 100 KB** — **davon war bisher
  nichts gelesen.**

  ### Was daraus folgt

  `[cmd]` **G-85 ist nicht blockiert.** Die Zuordnung steht, die
  Gewichtung steht, der Umgang mit Luecken steht.

  `[cmd]` **Pruefend bleibt:** A-20 zaehlt sieben Spec-Fehler.
  **Die 26 Marker gehoeren gegen den Katalog geprueft, bevor jemand
  danach baut** — und die acht Namensvarianten in
  `biomarker_aliases`.

  `[read]` **Und C-159s Landkarte wird kuerzer:** Die Symptomtabelle
  fehlt im Schema, **aber nicht im Entwurf.**

- [ ] **A-34: Nachweislaeufe ueberschreiben Toms gespeicherte Ansicht**
  (neu 2026-08-20). Randbefund aus G-129.

  `[cmd]` *„Beim ersten Messlauf stand deine live gespeicherte Ansicht
  auf „Auffaellig / 30 Tage" — meine Probelaeufe haben sie ueberschrieben
  (jetzt „Alle / Heute")."*

  `[read]` **Das ist das korrekte Verhalten der Speicherung** — aber es
  heisst: **jeder Agent, der als `dev@lumeos.app` misst, aendert Toms
  Einstellungen.**

  `[cmd]` **Seit G-122 gilt das fuer `user_display_preferences`** — und
  kuenftig fuer jede gespeicherte Ansicht.

  **Regel fuer Auftraege:** `[cmd]` **Nachweise auf
  `test-user@lumeos.local` fuehren**, oder die Zeile vorher sichern und
  danach zuruecksetzen. `[read]` **Gehoert in die Nachweisliste jedes
  UI-Auftrags.**

- [ ] **G-136: Zwei Kartenzuordnungen sind Auslegung** (neu
  2026-08-20). **Entscheidung fuer Tom.** Aus G-129.

  `[cmd]` **Die Acht-Karten-Liste aus GO-22 nennt sie nicht** — der
  Agent hat entschieden und markiert:

  | | wohin | Begruendung |
  |---|---|---|
  | **`FIBT` Ballaststoffe** | **Kohlenhydrate** | *„sind Kohlenhydrate; Cronometer ebenso"* |
  | Wasser, Alkohol, Organische Saeuren, Rohasche | **Sonstige** | *„die Liste laesst ihnen keinen anderen Platz"* |

  `[cmd]` **Je eine Zeile in `karteFuerWurzel`**, falls es anders sein
  soll.

  `[read]` **Beide sind vertretbar.** Ballaststoffe unter Kohlenhydrate
  ist fachlich richtig. **Wasser bei *„Sonstige"* ist der schwaechere
  Teil** — es ist einer der sechs Naehrstoffklassen, aber eine eigene
  Karte fuer einen Eintrag waere seltsam.

- [ ] **G-137: Acht Karten — die alten Ansichtsschluessel verfallen**
  (neu 2026-08-20). Nebenwirkung aus G-129, **einmalig.**

  `[cmd]` **Die gespeicherte Ansicht traegt Gruppenschluessel wie
  `g:Makronaehrstoffe`** — die Karte heisst jetzt anders.

  `[read]` **Wer eine Ansicht gespeichert hatte, startet einmal mit
  allem zugeklappt.** **Kein Fehler, aber es gehoert erwaehnt**, falls
  jemand danach fragt.

  `[cmd]` **Und die Speicherung verwirft kaputte Werte** (G-122) — sie
  faellt sauber auf *„alles zu"* zurueck.


- [ ] **C-166: Recovery hat 3 Tabellen, der Entwurf 25 Konstanten**
  (neu 2026-08-20). Aus dem Gesamtabgleich (SSOT 173).

  `[cmd]` **`recovery` fuehrt `checkins`, `modality_log`, `scores`.**
  **Ohne Gegenstueck im Schema:**

  | | |
  |---|---|
  | **`SLEEP_DATA`** | Schlafphasen, Rhythmus — `RecoverySleep`, `SleepStaging`, `SleepRhythm` |
  | **`HRV_LOG`, `HRV_BASELINE`** | HRV-Verlauf und Grundlinie |
  | **`ACWR_DATA`** | Belastungsverhaeltnis — **wird nirgends gerechnet** |
  | **`PROTOCOL_DEFS`, `RECOVERY_PROTOCOLS`, `ACTIVE_PROTOCOL`** | Erholungsprotokolle |
  | `RECOMMENDATIONS`, `READINESS_LEVELS`, `MOOD_MULTIPLIER` | |

  `[read]` **17 von 61 Komponenten fehlen** — darunter `RecoverySleep`,
  `RecoveryProtocols`, `RecoveryInsights`, `CorrelationChart`.

  `[cmd]` **`module-recovery-engine.jsx` traegt das Rechenwerk** — nie
  gelesen.

- [ ] **C-167: `MODALITY_BONUS` hat elf Modalitaeten, wir kennen vier**
  (neu 2026-08-20). Aus SSOT 173. **Betrifft C-124.**

  `[cmd]` **Der Entwurf:**

  ```
  sauna 2.0 · massage 2.5 · cold_plunge 1.5 · contrast_therapy 2.0
  nap 1.5 · meditation 1.0 · breathwork 1.0 · yoga 0.75
  foam_rolling 0.5 · stretching 0.5 · active_recovery 0.5
  MAX_DAILY_BONUS = 5.0
  ```

  `[cmd]` **`recovery.modality_log` kennt vier** — Sauna, Dehnen,
  Massage, Eisbad.

  `[read]` **C-124 fuehrt die Werte als unbelegt** — **das bleibt
  richtig**, sie sind Entwurfswerte. **Aber die Liste ist laenger als
  gedacht, und der Deckel von 5,0 ist eine Entscheidung, die niemand
  kennt.**

- [ ] **C-168: Die Uebertrainings-Schwellen stehen im Entwurf** (neu
  2026-08-20). Aus SSOT 173. **Betrifft C-124/E8.**

  `[cmd]` **`OVERTRAINING_SIGNALS` traegt vier Pruefungen mit
  Schwellen und `check`-Funktion:**

  | Signal | Schwelle |
  |---|---|
  | `hrv_low` | 7-Tage-Schnitt **unter 90 % der Grundlinie** |
  | `rhr_high` | Ruhepuls **+5 bpm** ueber Grundlinie |
  | `sleep_poor` | Schlafqualitaet **unter 6** ueber 3 Tage |
  | `fatigue` | subjektives Gefuehl **≤ 4** ueber 3 Tage |

  `[read]` **E8 fragt: *„ab wie vielen Signalen ueber wie viele Tage ist
  ein Arzt-Hinweis angebracht?"*** — **der Entwurf beantwortet den
  ersten Teil.**

  `[cmd]` **Und drei der vier Eingaenge fehlen im Bestand:** HRV auf 127
  von 170 Tagen leer, `resting_hr` 0 von 340. **Nur die Schlafqualitaet
  ist da.**

- [ ] **C-169: Das Trainingsplan-Schema steht im Entwurf** (neu
  2026-08-20). Aus SSOT 173. **Betrifft C-145.**

  `[cmd]` **`module-training-spec.jsx` traegt:**

  | | |
  |---|---|
  | **`LANDMARKS`** | MEV/MAV/MRV je Muskelgruppe, zehn Gruppen |
  | **`PROGRESSION_MODELS`** | linear, doppelt — **mit Formel** |
  | **`ROUTINE_TEMPLATES`** | Routinen als Vorlagen |
  | **`DELOAD_TRIGGERS`** | wann entlastet wird |
  | `HR_ZONES`, `HR_MAX`, `SET_TYPES` | |

  `[cmd]` **`PROGRESSION_MODELS` mit Formeln:**
  *linear: `next_weight = current + 2.5 kg`* ·
  *double: `reps < max ? reps+1 : (weight+inc, reps=min)`*

  `[read]` **C-145 meldet *„Bloecke, Wochen, Routinen — fehlendes
  Schema"*.** **Der Entwurf sagt, woraus es besteht.**

- [ ] **C-170: Der Offline-Betrieb steht im Entwurf** (neu 2026-08-20).
  Aus SSOT 173.

  `[cmd]` **`IDB_STORES`, `OUTBOX`, `SYNC_LOG`** — IndexedDB-Speicher,
  Warteschlange, Abgleichsprotokoll.

  `[cmd]` **G-86 meldet:** *„keine Warteschlangentabelle, `logged_via`
  auf 101 von 101 Zeilen `manual` — erst die Faehigkeit, dann die
  Anzeige."* **Die Faehigkeit ist entworfen.**

- [ ] **C-171: Medical — neun Konstanten ohne Tabelle** (neu
  2026-08-20). Aus SSOT 173.

  `[cmd]` **`SYMPTOMS` und `SYMPTOM_BIOMARKER_MAP`** — `[read]` **C-159
  meldet *„keine Symptomtabelle im ganzen Schema"*. Der Entwurf hat
  sie**, mit Zuordnung zu Biomarkern.

  `[cmd]` **Dazu:** `APPOINTMENTS`, `DOCUMENTS`, `HISTORY_TIMELINE`,
  `DIAGNOSES`, `OCR_EXTRACTED`, `CORRELATIONS`, `UNIT_CONVERSIONS`.

  `[read]` **Und vier ganze Tabs fehlen** — `MedMedications`,
  `MedHistory`, `MedDocuments`, `MedAppointments`, **mit acht
  Modalen.**

- [ ] **G-138: Supplements zeigt, nimmt aber nichts auf** (neu
  2026-08-20). Aus SSOT 173.

  `[cmd]` **16 von 68 Komponenten fehlen — fast alle sind
  Schreibwege:**

  `AddSupplementModal` · `AddCompoundModal` · **`LogDoseModal`** ·
  **`LogSkipModal`** · `AddSideEffectModal` · `AddLabResultModal` ·
  `ReorderModal` · `PlanCycleModal` · `PermissionsModal` ·
  `ProductDetailDrawer`.

  `[read]` **Das Modul liest 360 Einnahmen und rechnet 93,1 %
  Compliance** — **aber niemand kann eine Einnahme eintragen.**

  `[cmd]` **Ohne Gegenstueck im Schema:** `INJ_SITES`, `INJ_SCHEDULE`,
  `INJ_LOG`, `STACK_TEMPLATES`, `PRODUCT_DETAILS`, `EXTENDED_LABS`,
  `BLOODWORK_PANEL`.

- [ ] **G-139: Goals — Fortschrittsfotos mit Posen-Sets** (neu
  2026-08-20). Aus SSOT 173.

  `[cmd]` **`PHOTO_PROGRESSION`, `POSE_SETS`, `PE_MODES`** — im
  Entwurf, nicht im Schema.

  `[cmd]` **Und `CONTRIBUTIONS`, `CONTRIB_WEIGHTS`** — was ein Ziel
  vorantreibt und mit welchem Gewicht.

  `[read]` **Sechs von 40 Komponenten fehlen** — `BodyFatScale`,
  `MetricKPI`, `CompTab`, `MeasureTab`.

- [ ] **A-35: Sieben Module haben keine Seite** (neu 2026-08-20). Aus
  SSOT 173. **Ueberblick, kein Auftrag.**

  | Modul | Komponenten im Entwurf |
  |---|---|
  | **market** | **52** — wartet auf Rechtsfragen |
  | **buddy** | **44** — 16 Tabellen spezifiziert |
  | **stubs** | 31 — **zu klaeren, was das ist** |
  | admin | 25 — `apps/admin` existiert separat |
  | **completeness** | 14 — **das sind die Settings** (G-131) |
  | crossmodule | 6 |
  | onboarding | 1 — `WALK`, vier Schritte (G-83) |

  `[cmd]` **`module-stubs.jsx` (60 KB, 31 Komponenten) ist nie erwaehnt
  worden** — **zuerst pruefen, was drinsteht.**

- [ ] **C-172: Der Stress-Tab steht im Entwurf** (neu 2026-08-20).
  Aus SSOT 173. **Betrifft E6.**

  `[cmd]` **`module-crossmodule-rest.jsx` (275 Zeilen) traegt
  `STRESS_SOURCES` — sechs Quellen mit Wert und Begruendung:**

  | Quelle | Wert | Begruendung im Entwurf |
  |---|---|---|
  | Arbeitslast | 62 | *„Zwei Abgaben diese Woche"* |
  | Schlafschuld | 48 | *„1,6 h zu wenig ueber fuenf Naechte"* |
  | **Trainingslast** | 55 | *„**ACWR 1,08 — inside the window**"* |
  | Lebensereignisse | 20 | *„nichts protokolliert"* |
  | Koffein-Zeitpunkt | 51 | *„200 mg um 17:30 an Trainingstagen"* |
  | Alkohol | 5 | *„keiner in 14 Tagen"* |

  `[cmd]` **Und `STRESS_BANDS`** — Low bis 25, Moderate bis 50, mit
  Beschreibung: *„Full training capacity"*, *„Normal load, watch …"*.

  `[read]` **Toms E6 lautet *„Stress bauen"*** — **der Entwurf sagt,
  woraus er sich zusammensetzt.** Und **die ACWR-Schwelle steht
  nebenbei drin** (1,08 = *inside the window*), obwohl ACWR nirgends
  gerechnet wird.

  `[cmd]` **Dazu `STRESS_14D`** — der Verlauf.

- [ ] **A-36: `module-stubs-replacement.jsx` traegt drei ganze Module**
  (neu 2026-08-20). Aus SSOT 173. **730 Zeilen, nie erwaehnt.**

  `[cmd]` **Marketplace:** `MARKETPLACE_CATEGORIES`,
  `MARKETPLACE_PRODUCTS` (mit Preis, Bewertung, Haendler, Evidenzgrad,
  `inStack`), `COACH_PROFILES`, `ORDERS`, `SUBSCRIPTIONS` — dazu
  `MarketBrowse`, `MarketCoaches`, `MarketPlans`, `MarketOrders`,
  `MarketSubs`, `MarketSeller`.

  `[cmd]` **Auth und Onboarding:** **`OnboardingFlow`, `LoginScreen`,
  `RegisterScreen`, `ProfileSetupScreen`, `PrivacyPreview`.**

  `[read]` **G-83 haelt fest, dass es kein Onboarding gibt.**
  **`module-onboarding.jsx` hat den Assistenten, und diese Datei hat
  die Bildschirme dazu** — Anmeldung, Registrierung, Profilaufbau,
  Datenschutzvorschau.

  `[cmd]` **Admin:** `ADMIN_USERS`, `ADMIN_MODERATION`,
  `AdminDashboard`, `AdminUsers`, `AdminModeration`, `AdminAnalytics`,
  `AdminSystem`, **`AdminFoodDB`**, `AdminAudit`.

  `[read]` **`AdminFoodDB` ist der Ort fuer die manuelle Kuration** —
  C-125 haelt 124 Zutaten fuer eine Woche Handarbeit fest, und
  `name_display` wartet auf menschliche Namen.

  `[cmd]` **`module-stubs.jsx` selbst (230 Zeilen) ist nur der
  Platzhalter** — *„keep the shell coherent when navigating."*
  **Der ist erledigt, sobald die Module stehen.**

- [ ] **C-173: `MARKETPLACE_PRODUCTS` traegt `inStack` und
  `evidence`** (neu 2026-08-20). Aus SSOT 173. **Kleiner, wichtiger
  Befund.**

  `[cmd]` **Die Produktzeilen im Entwurf tragen `inStack: true` und
  `evidence: "A"`** — sie kennen den Stack des Nutzers und den
  Evidenzgrad aus dem Katalog.

  `[read]` **Das ist die Verbindung Marketplace → Supplements**, und
  sie zeigt, dass der Marktplatz nicht als getrennter Laden gedacht war.

  `[cmd]` **`substance_catalog` traegt 567 Eintraege mit Evidenzgrad**
  — die Gegenseite steht.

- [ ] **A-37: Zwoelf ADRs in `docs/specs/Nutrition/04_adrs/`** (neu
  2026-08-20). **Entscheidungen, die niemand kannte.** Aus SSOT 173.

  `[cmd]` **`docs/specs/Nutrition/` hat sieben Unterordner mit 45
  Dateien** — `00_decisions/` (22 KB), `01_current_specs/` (10 Dateien,
  darunter `SPEC_06_DATABASE_SCHEMA.md` mit **64 KB**), `02_patches/`
  (13), `03_sql/`, **`04_adrs/` (12 ADRs)**, `05_reviews/` (122 KB
  Opus-Reviews), `06_workorder_planning/`.

  `[read]` **Rekursiv gezaehlt sind es 160 Spec-Dateien, nicht 120** —
  `00-QUELLEN.md` ist berichtigt.

  ### Was bestaetigt wird

  `[cmd]` **`ADR_BLS_ONLY`** — *„BLS 4.0 ist die einzige
  Master-Food-Datenquelle fuer V1. OpenFoodFacts und USDA sind nicht
  Teil von V1."* **Deckt sich mit dem Bau.** `[read]` **Und beantwortet
  G-126:** Selen fehlt, weil BLS es nicht fuehrt — **eine zweite Quelle
  waere ein ADR-Bruch.**

  `[cmd]` **`ADR_WATER_TOTAL_HYDRATION`** — *„Gesamt-Hydration =
  geloggtes Wasser + Wasser aus Lebensmitteln."* **Gebaut:**
  `hydration_summary` mit `logged_ml`, `food_ml`, `total_ml`,
  `total_complete`. **Passt genau.**

  `[cmd]` **`ADR_SUPPLEMENTS_API_BOUNDARY`** — *„Supplements-Modul
  speichert alle Supplement-Daten, Nutrition fragt nur per API ab."*
  **C-158 hat `supplement_nutrient_mappings` in `supplements` gebaut** —
  richtig.

  ### Was abweicht

  `[cmd]` **`ADR_COACH_PERMISSIONS_V1`:** *„User kann **pro Modul und
  Subfunktion** freigeben"* — mit Beispielen: `nutrition.diary`,
  `nutrition.water`, `nutrition.micronutrient`, `nutrition.mealcam_*`.

  `[cmd]` **Gebaut ist nur pro Modul** — `client_permissions` hat
  `nutrition_visibility`, nicht `nutrition_diary_visibility`.

  `[read]` **Das ist eine echte Abweichung**, und sie betrifft die
  Kernanforderung des Coach-Portals. **Zu entscheiden: reicht die
  Modulstufe, oder kommt die Feinstufe?**

  `[cmd]` **`ADR_RECIPES_SCHEMA_ONLY`** nennt `recipe_items`,
  **gebaut ist `recipe_ingredients`.** Und **`shopping_lists` fehlt
  ganz** — die ADR fuehrt sie als V1-Pflicht.

  `[read]` **Der Rest passt:** `recipes`, `meal_plans`,
  `meal_plan_days`, `meal_plan_weeks`, `meal_plan_entries`. **C-150 hat
  mehr gebaut als die ADR verlangt** — kein Fehler.

  ### Was noch offen ist

  `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`** — *„Ghost Entries aus einem
  Rezept zeigen **immer alle Einzelzutaten**, nie das Rezept als
  Einheit."* **Zu pruefen, ob G-97 sich daran haelt.**

  `[cmd]` **`ADR_MEALCAM_V1`** — *„MealCam ist V1, Barcode Scanner ist
  Phase 2."* **Mit Begruendung:** *„Es gibt keinen serioesen Competitor,
  der Teller-Erkennung mit BLS-Matching und Portionsschaetzung
  anbietet."*

  `[cmd]` **`ADR_MEALCAM_CONSENT`** — Bilder standardmaessig privat,
  Training-Freigabe **ausdruecklich nicht im Onboarding.**

  `[cmd]` **`ADR_CUSTOM_FOODS_V1`** — nur nutzerprivat, `is_public` ist
  Phase 2, mit Pflichtfeldern. **`foods_custom` existiert.**

  `[cmd]` **`ADR_RECIPE_SOURCE_BUDDY`** — `source` bekommt den Wert
  `buddy`, **in V1 nur als Schemawert vorbereitet.**

- [ ] **C-174: `ADR_NUTRITION_PREFERENCES_V1` kennt drei
  Constraint-Stufen** (neu 2026-08-20). **Betrifft GO-22.**

  `[cmd]` **Die ADR:**

  | Typ | Stufe | Wirkung |
  |---|---|---|
  | **Allergie** | `hard` | *„absoluter Ausschluss — nie anzeigen, nie vorschlagen"* |
  | **Unvertraeglichkeit** | **`strong`** | *„nur auf **explizite User-Suche** anzeigen"* |
  | Religioes/kulturell | `hard` | wenn der User es so setzt |

  `[cmd]` **Toms Entscheidung vom 2026-08-20 (GO-22):** generelle
  Ausschluesse **bewerten mit 0**, statt zu filtern.

  `[read]` **Die ADR ist naeher dran, als es aussieht:** *„nur auf
  explizite Suche"* heisst — wer `schokolade` tippt, bekommt sie;
  **wer blaettert, nicht.** **Toms `0` heisst: wer blaettert, findet sie
  ganz unten.**

  **Zu klaeren:** Bleibt es bei `0`, oder wird `strong` als eigene Stufe
  gebaut? `[cmd]` **Heute kennt `food_preference_items` nur `liked`,
  `disliked`, `hard_exclude`, `soft_dislike`.**

- [ ] **C-175: `shopping_lists` fehlt** (neu 2026-08-20). Aus A-37.

  `[cmd]` **`ADR_RECIPES_SCHEMA_ONLY` fuehrt sie als V1-Pflicht:**
  *„Tabellen anlegen: `nutrition.recipes`, `recipe_items`,
  `meal_plans`, `meal_plan_days`, …"* — **und Shopping Lists in der
  Aufzaehlung.**

  `[read]` **C-150 hat alles ausser dieser gebaut.** **Ein Wochenplan
  ohne Einkaufsliste ist halb** — die Zutaten stehen bereits in
  `recipe_ingredients`.

- [ ] **G-140: `display_tier` ist ein Abo-Tier, keine Baumebene** (neu
  2026-08-20). **Fehler in der Anzeige.** Aus SSOT 173.

  `[cmd]` **`docs/specs/Core/SUBSCRIPTION_GATES_ADR.md` sagt es
  ausdruecklich:**

  | Feature | Gate spaeter |
  |---|---|
  | **Mikro-Tier 2 (Athlete)** | **Plus-only** |
  | **Mikro-Tier 3 (Medical)** | **Pro-only** |

  *„`nutrient_defs.display_tier` (1/2/3) ist in DB vorhanden ·
  `nutrition_settings.show_micros_tier` existiert · User-Profile hat
  `subscription_tier` (free | plus | pro | coach)."*

  `[cmd]` **Verteilung passt:** Stufe 1 **31**, Stufe 2 **47**, Stufe 3
  **60**.

  `[read]` **G-101 hat es als Hierarchie-Ebene gelesen** und daraus die
  Einrueckung gebaut. **C-161 hat das mit `parent_code` behoben.**

  `[cmd]` **Aber die Anzeige traegt weiter eine Spalte *„STUFE"* mit
  1/2/3** — sichtbar in Toms Bildschirmfoto. **Sie zeigt das Abo-Tier,
  als waere es eine Baumtiefe.**

  **Zu tun:** Spalte umbenennen oder entfernen. `[read]` **In V1 gibt es
  kein Gate** (derselbe ADR), **aber die Bedeutung ist eine andere.**

- [ ] **C-176: `biomarkerDetails.ts` im Vorgaengerrepo — 121 KB** (neu
  2026-08-20). Aus SSOT 173. **Das Pendant zu `nutrientDetails.ts`.**

  `[cmd]` **1.564 Zeilen, zweisprachig:**

  ```ts
  interface BiomarkerDetail {
    description, description_de
    whatItMeasures, whatItMeasures_de
    ifHigh, ifHigh_de        // was ein hoher Wert bedeutet
    ifLow,  ifLow_de         // was ein niedriger bedeutet
    ranges: { male: { lab, optimal, athlete? } , female: … }
  }
  ```

  `[read]` **`athlete` ist der Wert, den es fuer LumeOS braucht** —
  dieselbe Lage wie `rda_athlete` bei den Naehrstoffen (C-161).

  `[cmd]` **Und `ifHigh` / `ifLow` sind genau das, was Tom fuer die
  Naehrstoffe verlangt hat:** *„im Detail dann die Erklaerungen, was bei
  Mangel, was bei zuviel."*

  `[cmd]` **Die Gegenseite steht:** `biomarker_catalog` mit 11.676
  LOINC-Codes, `biomarker_reference_ranges` mit 560 Bereichen.

- [ ] **G-141: Das Onboarding ist als ADR final entschieden** (neu
  2026-08-20). **Betrifft G-83.** Aus SSOT 173.

  `[cmd]` **`docs/specs/Core/ONBOARDING_ADR.md`, April 2026, Status
  final:** *„Option C: 7-Step Kern-Onboarding + Post-Onboarding
  Setup-Cards."*

  | Schritt | Inhalt | Ziel |
  |---|---|---|
  | 1 | Name, Sprache, Einheitensystem | Auth / Profil |
  | 2 | Geschlecht, Geburtstag, Groesse, Gewicht, **KFA** | Goals (TDEE) |
  | 3 | **Experience Level** | Goals, Nutrition, Training |
  | 4 | **Primaerziel: 12 Goal-Typen** | Goals → TDEE + Makros |
  | 5 | Training: Frequenz, Dauer, Equipment | Training |
  | 6 | Nutrition: Diaettyp, Allergien, Mahlzeiten, Vorlieben | Nutrition |
  | 7 | Zusammenfassung | alle Module |

  `[cmd]` **Beim Abschliessen:** `calculateTDEE()` → Goals-Targets →
  alle Modul-Einstellungen initialisieren.

  ### Eine Abweichung

  `[cmd]` **Der ADR nennt `beginner / intermediate / advanced / elite`.**
  **C-118 hat `beginner / advanced / pro / elite` gebaut** — Toms
  Vorgabe vom 2026-08-19.

  `[read]` **Toms Entscheidung ist juenger und gilt.** **Aber es gehoert
  gewusst**, dass der ADR etwas anderes sagt.

  `[cmd]` **Und *„Post-Onboarding Setup-Cards"*** — in noch nicht
  konfigurierten Modulen erscheinen Einrichtungskarten. **Das ist eine
  eigene Bauform, die niemand kennt.**

- [ ] **A-38: Drei Core-ADRs** (neu 2026-08-20). Aus SSOT 173.

  `[cmd]` **`docs/specs/Core/` hat drei ADRs, alle April 2026:**

  **`SUBSCRIPTION_GATES_ADR`** — *„Kein Subscription-Gate in V1. Alle
  Features ohne Einschraenkung."* `[read]` **Aber das Datenmodell ist
  tier-ready** — siehe G-140. **Sieben Features sind als spaetere
  Gates benannt**, darunter MealCam, Trend-Charts ueber 7 Tage, Coach
  Autonomy, Korrelationen, Export.

  `[cmd]` **`AI_USAGE_WALLET_ADR`** (120 Zeilen) — *„AI-Features sind
  keine Subscription-Features — sie werden aus dem **User-Wallet**
  bezahlt."* **V1 = nur Nutzungserfassung, Endausbau = Wallet.**

  `[read]` **`module-crossmodule-rest.jsx` traegt `WALLET` und
  `WALLET_TX`** — die Anzeige dazu.

  `[cmd]` **`ONBOARDING_ADR`** — siehe G-141.

- [ ] **C-179: `EAA` zeigt auf den Summenwert, nicht auf die neun**
  (neu 2026-08-20). **Toms Befund.**

  **Tom, 2026-08-20:** *„Nebst BCAA gibt es auch EAA mit 9."*

  `[cmd]` **Heute:** `eaa` → **`AAE9`** (*„Aminosaeuren, unentbehrlich,
  gesamt"*) — **eine Zeile, kein Gruppenbegriff.**

  `[cmd]` **`BCAA` ist dagegen als Gruppe angelegt** — drei Zeilen,
  `kind='gruppe'`, `ILE`/`LEU`/`VAL`.

  `[read]` **Beides ist fuer sich richtig, aber ungleich:** Wer *„BCAA"*
  tippt, bekommt die drei Aminosaeuren. **Wer *„EAA"* tippt, bekommt
  einen Summenwert und sieht die neun nicht.**

  ### Die neun

  `[cmd]` **Histidin, Isoleucin, Leucin, Lysin, Methionin,
  Phenylalanin, Threonin, Tryptophan, Valin** — alle als eigene Codes
  im Bestand.

  `[cmd]` **`AAE9` bleibt als eigener Eintrag** — der Name traegt die 9
  schon. **Aber `eaa` sollte auf die neun zeigen**, wie `bcaa` auf drei.

  `[read]` **Und dieselbe Frage bei den anderen Gruppen:**
  `Spurenelemente` (8), `B-Vitamine` (8), `Elektrolyte` (5) — **haben
  die einen Summenwert, der stattdessen getroffen wird?**

- [ ] **C-180: `crawl_025` liefert die Evidenzeinstufung fuer 181
  Konstanten** (neu 2026-08-20). **Der Rechercheweg hat geliefert.**

  `[cmd]` **`backup/kimi-research/.../data/evidence/` — fuenf
  Registries:**

  | | |
  |---|---|
  | `constant_evidence_registry.json` | **181 Konstanten** |
  | `recovery_modality_evidence.json` | 32 |
  | `formula_evidence_registry.json` | 22 |
  | `fatigue_signal_evidence.json` | 17 |
  | `training_structure_registry.json` | 13 |
  | **`symptom_ontology_seed.json`** | **21 Symptome** |
  | `research_hold_registry.json` | 256 |

  ### Die Einstufung ist ernuechternd — und brauchbar

  | Klasse | |
  |---|---|
  | `SUPPORTED_DIRECTION_ONLY` | **104** |
  | `CONTEXT_DEPENDENT` | 45 |
  | `INSUFFICIENT_EVIDENCE` | 11 |
  | `HEURISTIC` | 9 |
  | **`SUPPORTED_NUMERIC_THRESHOLD`** | **7** |
  | `CONFLICTING_EVIDENCE` | 4 |
  | `REPO_DEPENDENCY` | 1 |

  `[read]` **Nur sieben von 181 Zahlen duerfen hart eingebaut werden.**

  ### Je Eintrag steht die Handlungsanweisung

  `[cmd]` **`recommended_product_handling`:** `KEEP_NUMERIC` ·
  `USE_RANGE` · `USE_DIRECTIONAL_GUIDANCE` · `LABEL_HEURISTIC` ·
  **`DO_NOT_IMPLEMENT`** · `REMOVE_NUMERIC_VALUE`.

  `[read]` **Damit ist je Kachel entschieden, was gezeigt werden
  darf** — genau das, was der Auftrag verlangt hat.





- [ ] **C-181: ACWR wird gerechnet und muss raus** (neu gefasst
  2026-08-22, vorher *„nicht implementieren"*). Aus C-180.

  `[cmd]` **Kimi-Kernentscheidung 1:** *„Safe-Zone 0,8–1,3 / >1,5 als
  HEURISTIC entfernt."* `formula_evidence_registry` fuehrt
  `acwr_decision = implement:no` mit drei Quellen.

  **Der Punkt sagte bis heute das Gegenteil der Lage.** `[read]` Er
  behauptete, *„ACWR werde nirgends gerechnet — gut so"*. `[cmd]` Es
  wird gerechnet, und der Wert steht in der Oberflaeche:

  | Fundstelle | |
  |---|---|
  | `motor.ts:335` | `ACWR_DATA = { acute_7d: 2142, chronic_28d: 1980, acwr: 1.08 }` |
  | `motor.ts:337` | `export function calcTrainingLoadScore(acwr: number)` |
  | `motor.ts:338` | `if (acwr >= 0.8 && acwr <= 1.3) return 1.0` |
  | `motor.ts:431` | `const tls = calcTrainingLoadScore(ACWR_DATA.acwr)` |
  | `ansicht.tsx:262` | `['ACWR', String(ACWR_DATA.acwr), 'load ...']` |

  `[cmd]` **56 Treffer auf `ACWR` im Baum.** Die Zahlen sind Attrappen,
  die Formel ist echt, und der Score gewichtet sie.

  `[read]` **Woher der Irrtum kam:** gesucht wurde nach
  `training.load_spike`, dem Namen aus dem Feldvertrag. `[cmd]` Der
  findet drei Treffer, alle in der Regel-Engine, keinen im
  Recovery-Motor — die Umsetzung heisst `ACWR_DATA`. **Der Name im
  Vertrag ist nicht der Name im Code.** Dieselbe Falle wie `tree_nuts`
  gegen `contains_nuts` und `SE` gegen `SER`.

  `[read]` **Das ist dieselbe Klasse wie die Modalitaets-Boni aus
  C-124:** eine unbelegte Zahl, die in einen Score einfliesst und
  angezeigt wird. C-124 ist erledigt, das hier nicht.

- [ ] **C-182: Kein numerischer OTS-Schwellenwert** (beantwortet
  2026-08-20). Aus C-180. **Betrifft C-168 und E8.**

  `[cmd]` **Kimi:** *„Kein numerischer OTS-Schwellenwert —
  Ausschlussdiagnose + Referral-Klassen."*

  `[read]` **Damit sind die vier Schwellen aus `OVERTRAINING_SIGNALS`
  (HRV unter 90 %, Ruhepuls +5, Schlaf unter 6, Gefuehl ≤ 4)
  Entwurfswerte** — **nicht belegt.**

  `[cmd]` **`fatigue_signal_evidence.json` traegt 17 Signale** mit
  Einstufung. **Was bleibt: Signale zeigen, nicht summieren.**

- [ ] **C-183: Die Symptom-Ontologie ist geliefert** (neu 2026-08-20).
  Aus C-180. **Betrifft C-159 und C-171.**

  `[cmd]` **`symptom_ontology_seed.json` — 21 Symptome**,
  MedlinePlus-verifiziert, **ausdruecklich ohne Diagnosen.**

  `[cmd]` **Je Eintrag:** `symptom_id`, `canonical_name`, **`synonyms`**,
  `system`, **`severity_dimensions`** (mild bis
  `functional_impairment`), **`time_dimensions`** (Beginn, Dauer,
  Haeufigkeit, Muster).

  `[read]` **C-159 meldet *„keine Symptomtabelle im ganzen Schema"*** —
  **und das Mockup hat `SYMPTOM_BIOMARKER_MAP`.** **Jetzt gibt es
  beides: die Ontologie und die Zuordnung.**

- [ ] **C-184: 66 LOINC-Handoff-Items, 20 noch offen** (neu
  2026-08-20). Aus `crawl_026A`.

  `[cmd]` **C-162 hat 46 validiert und 18 der 20 offenen selbst
  aufgeloest.** `[read]` **Kimi zaehlt weiter 20 offen** — er kennt
  unsere Aufloesung nicht.

  **Zu tun:** Rueckmeldung, welche 18 wir aufgeloest haben. `[cmd]`
  **Offen bleiben `lab_hcg` und `lab_blood_pressure`.**


- [ ] **G-150: Die Volltextsuche findet ueber Erklaertexte** (neu
  2026-08-21). Befund aus G-147. **Zu entscheiden, ob erwuenscht.**

  `[cmd]` **Die BCAA-Ursache war nicht der vermutete Zielwert:**
  *„„BCAA" stand woertlich in den `function_de`-Texten von Isoleucin und
  Valin, in keinem Leucin-Text — der Volltext-Zufall fand zwei."*

  `[cmd]` **Nachgemessen: `ILE` und `VAL` tragen *„BCAA"* im
  Erklaertext, `LEU` nicht.**

  `[read]` **Der Orchestrator hatte auf den Zielwert getippt** — Leucin
  ist der einzige der drei mit eigener Referenz. **Falsch geraten, der
  Agent hat gemessen.**

  ### Die Frage dahinter

  `[cmd]` **Die Suche durchsucht seit G-129 auch die 110
  Erklaertexte** — das war Absicht: *„wer „Skorbut" eingibt, sollte
  Vitamin C finden."*

  `[read]` **Aber sie findet dabei auch Zufallstreffer**, die kein Alias
  sind. **Seit G-147 ist der Alias sauber** — `bcaa` liefert drei.
  **Die Frage ist, ob der Volltexttreffer daneben stehen soll.**

  **Vorschlag:** Alias-Treffer und Texttreffer unterscheidbar zeigen.
  `[read]` **Wer *„Skorbut"* sucht, will den Texttreffer. Wer *„BCAA"*
  sucht, will die drei.**

- [ ] **A-39: `backup/` wird nicht geraeumt, solange Agenten laufen**
  (neu 2026-08-21). **Fehler des Orchestrators.**

  `[cmd]` **Der G-147-Agent hat es gemeldet:** *„Zwei frisch angelegte
  Probeskripte verschwanden waehrend des Auftrags aus `backup/` —
  mutmasslich ein parallel aufraeumender Agent."*

  `[cmd]` **Das war der Orchestrator.** Er hat 13 Agentenskripte
  entfernt, waehrend drei Agenten arbeiteten.

  `[read]` **`backup/` ist in `.gitignore` und wird von Agenten als
  Ablage benutzt.** **Aufraeumen erst, wenn niemand arbeitet** —
  `LAUFEND.md` sagt, wer laeuft.

  `[cmd]` **Dasselbe gilt fuer `tools/`** — dort lagen die
  `_g135-*`-Skripte, als G-135 noch lief.

- [ ] **A-40: Nachweise ohne Stichtag belegen nichts** (neu
  2026-08-21). Befund aus G-147.

  `[cmd]` **Vitamin A stand gestern bei 411 %, heute bei 478 %** —
  *„anderes Tagesprofil."*

  `[read]` **Kein Fehler**, aber es zeigt: **Eine Prozentzahl aus einem
  Bildschirmfoto belegt nichts ohne Datum und Fenster.**

  `[cmd]` **Die Regel steht schon** — *„eine Zahl ohne Stichtag ist
  keine Zahl"* (`CLAUDE.md`). **Sie gilt auch fuer Bildschirmfotos.**

  `[cmd]` **Und die Seeds enden bewusst in der Zukunft** (±90 Tage) —
  **die Tageswerte aendern sich mit jedem Lauf.**

- [ ] **C-187: Fuenf kleine Datenluecken — als ein Auftrag** (neu
  2026-08-21). **Klammer, kein neuer Inhalt.**

  `[read]` **Der Orchestrator hat dieses Buendel am 2026-08-20 im
  Fliesstext der Uebergabe als *„C-186"* vergeben und nie angelegt.**
  **Am 2026-08-21 hat G-148 sich C-186 genommen** — exakt das Muster,
  das A-41 beschreibt.

  `[cmd]` **Die fuenf bestehen einzeln weiter und werden hier nur
  zusammengefasst:**

  | | |
  |---|---|
  | **C-175** | `shopping_lists` fehlt — ADR-Pflicht |
  | **C-179** | `EAA` zeigt auf `AAE9` statt auf die neun |
  | **C-178** | Prolactin und ApoB fehlen in `system_groups` |
  | **G-124** | zehn Medication-Spalten |
  | **G-126** | `CHOL` → `CHORL`, 28 Texte, Selen |

  `[read]` **Sie liegen alle in `supabase/`** — ein Agent, ein
  Durchgang. **Wer C-187 abarbeitet, schliesst die fuenf einzeln.**

- [ ] **A-43: Coach-Permissions pro Subfunktion** (neu 2026-08-21).
  **Entscheidung fuer Tom.** Abgespalten von A-37.

  `[read]` **A-37 traegt zwei Titel** — in `TODO.md` *„Zwoelf ADRs"*, in
  der Entscheidungsliste *„Coach-Permissions pro Subfunktion"*. **Das
  ist ein eigener Punkt.**

  `[cmd]` **`ADR_COACH_PERMISSIONS_V1`:** *„User kann **pro Modul und
  Subfunktion** freigeben"* — mit Beispielen: `nutrition.diary`,
  `nutrition.water`, `nutrition.micronutrient`, `nutrition.mealcam_*`.

  `[cmd]` **Gebaut ist nur pro Modul** — `client_permissions` hat
  `nutrition_visibility`, nicht `nutrition_diary_visibility`.

  `[read]` **Das betrifft die Kernanforderung des Coach-Portals.**
  **Zu entscheiden: reicht die Modulstufe, oder kommt die Feinstufe?**

  `[cmd]` **F-06 hat gemessen, dass die Freigabe ueberhaupt erst seit
  C-162 wirkt** — 22 `coach_read`-Policies ueber sechs Module. **Eine
  Feinstufe waere sechs mal soviel.**

- [ ] **A-44: Eine Nummernpruefung fuers Gate** (neu 2026-08-21).
  **Damit A-41 zugehen kann.**

  `[cmd]` **Am 2026-08-21 waren neun Nummern doppelt vergeben** —
  A-18, A-29, G-102, C-105, C-124, GO-21, G-89, G-98, G-99. **Und A-18
  heisst *„Berichtsnummern kollidieren"*.**

  `[read]` **Die Regel steht in `CLAUDE.md` und greift nicht** — weil
  sie ein Absatz ist, kein Werkzeug.

  ### Was sie pruefen muss

  `[cmd]` **Dubletten ueber alle Reihen** in `TODO.md` und
  `ERLEDIGT.md` — **auch ueber beide Dateien hinweg**, eine erledigte
  Nummer darf nicht neu vergeben werden.

  `[cmd]` **Den Zaehler im Kopf gegen die Datei.**

  `[cmd]` **Und die hoechste Nummer je Reihe ausgeben** — dann muss der
  Orchestrator nicht raten.

  `[read]` **In beide Richtungen belegen:** mit einer eingebauten
  Dublette muss sie rot werden. **Vorbild:
  `tools/schemafreigabe-pruefen.mjs`.**


- [ ] **C-191: `p_user_id` kostet das Dreifache** (neu 2026-08-22).
  Befund aus G-154. **Messung, keine Vermutung.**

  `[cmd]` **`explain (analyze, buffers)` auf der laufenden DB,
  leere Suche, `limit 50`:**

  | Aufruf | Laufzeit |
  |---|---:|
  | ohne `p_user_id` | **360,4 ms** |
  | `test-user` (0 Preferences) | 383,2 ms |
  | `dev` (3 Preferences) | **1.160,2 ms** |

  `[cmd]` **Kein `temp read/written`** — es ist kein Kreuzprodukt,
  sondern die Preference-CTEs selbst. **Und kein Kaltstart:** der
  zweite Seitenlauf misst dasselbe (4.498 / 4.779 ms, Suchaufruf
  1.232 ms).

  `[read]` **Das faellt jetzt jedem auf**, weil der Katalog seit G-154
  immer mit `prefs=1` laedt. **Vorher trug die Kosten nur der
  Erfassungsdialog.**

  `[cmd]` **Nicht `verborgeneTreffer`:** der zweite Aufruf ist auf
  kurze Trefferlisten begrenzt und laeuft bei 5.292 Treffern nicht.

- [ ] **A-47: Der ADR widerspricht sich bei `hard`** (neu 2026-08-22).
  Befund aus G-154. **Dokumentenfrage, kein Code.**

  `[cmd]` **`ADR_NUTRITION_PREFERENCES_V1` sagt zweimal
  Verschiedenes.** Die Entscheidungstabelle: Allergie ist `hard`,
  *„absoluter Ausschluss — nie anzeigen, nie vorschlagen"*. Der
  Abschnitt *„Food Search Ranking-Einfluss"* darunter: `-300 fuer
  allergen match (hard constraint)`.

  `[read]` **Punkte schliessen nicht aus.** Ein Eintrag mit -300 steht
  weiter in der Liste, nur weiter unten. **Die Implementierung folgt
  der Tabelle** (`preference_excluded`), nicht dem Rangmodell — und
  das ist die richtige Wahl.

  `[cmd]` **Weitere Abweichungen zwischen ADR und Bestand:** die
  Spalte heisst `strength`, nicht `severity`; es gibt
  `general_exclusions`, nicht `excluded_foods`; `religious_dietary`
  und `religious_is_hard` fehlen ganz.

  **Zu tun:** den ADR nachziehen oder den Widerspruch als bewusst
  vermerken. **Nicht den Code aendern** — er tut das Richtige.

- [ ] **G-134: Die vier Filtergruppen gibt es in den Daten nicht** (neu
  2026-08-20). **Entscheidung.** Befund aus C-164.

  `[cmd]` **`tag_type` traegt drei Werte:** `diet` (9 Codes),
  `processing` (2), `allergen` (3).

  `[read]` **Die Oberflaeche zeigt vier Gruppen** — Ernaehrungsform,
  Naehrwert, Verarbeitung, Allergene. **„Ernaehrungsform" und „Naehrwert"
  sind beide `diet`.**

  `[cmd]` **Folge:** *„Wer stumpf nach `tag_type` gruppiert, verodert
  `vegan` mit `high_protein`."*

  `[read]` **Damit ist die Gruppierung eine Entscheidung, keine
  Ablesung.** **Entweder eine Gruppenspalte in `tag_definitions`, oder
  die Zuordnung bleibt in der Anzeige** — dann steht sie an zwei
  Stellen.




- [ ] **A-41: Berichtsnummern kollidieren** (neu 2026-08-19).

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


- [ ] **G-151: Der Ausfuehrer fuer bestaetigte Vorschlaege** (neu
  2026-08-20). Aus F-07, bewusst nicht gebaut.

  `[cmd]` **`pending_actions` traegt Vorschau, Verfall und
  `confirmed_at`** — **aber niemand wendet den `payload` an.**

  `[read]` **Das war schon G-94s Befund:** *„`payload` beschreibt, was
  geschehen soll, niemand wendet es an."*

  `[cmd]` **Er braucht die Autonomy-Wirkungsregeln** — und die haengen
  an T-Entscheidungen. **Eigener Auftrag, nach Toms Antworten.**


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

- [ ] **G-122: Fuenf Tabellen mit Daten haben keinen Schreibweg**
  (neu 2026-08-20, aus G-123).

  `[cmd]` **Gemessen: gelesen ja, geschrieben nie.**

  | Tabelle | Zeilen | gesperrter Knopf |
  |---|---|---|
  | `training.exercises` | **1.416** | „Eigene Uebung" |
  | `goals.body_measurements` | **362** | Gewicht, Umfaenge |
  | `recovery.checkins` | **340** | „Check-in" |
  | `medical.lab_result_values` | **280** | „Eigener Messwert" |
  | `recovery.modality_log` | **178** | „Log modality" |

  `[read]` **Zwei brauchen vorher eine Entscheidung:** Bei der eigenen
  Uebung die Abgrenzung (der Katalog ist geteilt, eine eigene waere es
  nicht), beim eigenen Messwert die Unterscheidung von einem
  Laborbefund.

- [ ] **G-124: Die Medikamentenkachel braucht zehn Spalten**
  (neu 2026-08-20, aus G-123).

  `[cmd]` **`medical.user_medications` gibt es seit C-130** (21
  Spalten, 2 Zeilen) — **aber keine der zehn, die die Kachel zeigt:**
  `monitoring`, `monitoring_frequency`, `last_test`, `next_due`,
  `monitoring_overdue`, `targets`, `side_effects`, `physician`, `rx`,
  `prescription_ref`.

  `[cmd]` **Vier der sechs Warnungen im Medical-Kopf** speisen sich aus
  `next_due` und `monitoring_overdue`.

  `[read]` **Ein Schreibweg allein genuegt hier nicht** — er wuerde
  Medikamente speichern, waehrend die Kachel darueber weiter erfundene
  Ueberwachungsdaten zeigt.

  `[cmd]` **Gemessen 2026-08-20 mit G-130 — zehn Spalten fehlen:**

  `monitoring` · `monitoring_frequency` · `last_test` · `next_due` ·
  `monitoring_overdue` · `targets` · `side_effects` · `physician` ·
  `rx` · `prescription_ref`

  `[read]` **Vier der sechs Alert-Eintraege speisen sich daraus.**
  **Codex-Auftrag** — der Rest der Kachel liest bereits echt.

- [ ] **A-32: Die Nummer G-124 war doppelt vergeben** (neu 2026-08-21).

  `[cmd]` **Der Auftrag vom 2026-08-21 trug die Nummer G-124** — die
  gehoert seit dem 2026-08-20 der Medikamentenkachel
  (`TODO.md:256`). **Die Arbeit schliesst G-105 und G-120**, nicht
  G-124.

  `[read]` **A-18 hatte dasselbe Problem** (116-119 doppelt belegt) und
  wurde mit *„die Nummer steht im Auftrag"* geloest. **Diesmal stand
  sie im Auftrag und war trotzdem belegt** — der Griff zur Liste fehlte.
  Bericht 165 traegt den Dateinamen `165-svg-und-wasser.md` wie
  beauftragt.

- [ ] **A-42: `schuss.mjs` und die Git-Bash-Pfadumwandlung** (neu
  2026-08-20). Werkzeugfund aus G-117.

  `[cmd]` *„`schuss.mjs`-Pfade ohne `?` fallen der
  Git-Bash-Pfadumwandlung zum Opfer — **`MSYS_NO_PATHCONV=1` loest
  es**."*

  `[read]` **Gehoert in die Datei selbst oder in `CLAUDE.md`**, sonst
  faellt der naechste Agent darauf herein.

- [ ] **C-163: 94 Substanzen ohne maschinenlesbare Naehrstoffmenge**
  (neu 2026-08-20). **Fuer den Rechercheweg.** Rest aus C-158.

  `[cmd]` **Gemessen:** 567 Substanzen, **111 moegliche
  Naehrstofftraeger, 17 eindeutig zugeordnet.**

  `[cmd]` **Was fehlt, je Substanz:** **BLS-Code** (aus unseren 138) und
  **Menge je Portion mit Einheit.**

  `[read]` **Der Code kommt von uns** — Kimi kennt `nutrient_defs` nicht.
  **Die Menge steht auf dem Etikett** und ist seine Aufgabe.

  `[cmd]` **Und drei Einheiten brauchen die Form**, bevor sie
  umgerechnet werden koennen: **Vitamin A** (Retinol gegen Carotinoide),
  **Vitamin E** (natuerlich gegen synthetisch), **Folat** (Folat,
  Folsaeure, DFE).

- [ ] **C-178: Prolactin und ApoB fehlen dem Health score**
  (neu 2026-08-21). Befund aus G-135. **Zwei Zeilen in
  `medical.biomarker_spec_enrichment`, mehr nicht.**

  `[cmd]` **Prolactin:** Der Nutzer hat **4 Werte** unter LOINC
  `2842-3`, `enrichment` hat **keine Zeile**. Mit ihr haette `hormonal`
  sieben statt sechs Marker.

  `[cmd]` **ApoB:** Der Bestand fuehrt ihn unter **1884-6**,
  `enrichment` unter **1869-7** — dieselbe Groesse, zwei Codes.
  `[read]` **Das ist der Marker, den Tom in G-84 ausdruecklich genannt
  hat** (*„die beiden wichtigsten Lipidmarker"*); **LDL trifft, ApoB
  nicht.**

  `[read]` **Erst pruefen, ob es dieselbe Messgroesse ist** — bei
  Glukose und Vitamin D war es das nicht (G-85: `1558-6` ist *Fasting*,
  `2345-7` nicht). **Keine Aliasfrage, eine inhaltliche.**

- [ ] **G-146: Zehn Marker in `enrichment` ohne `system_groups`**
  (neu 2026-08-21). Befund aus G-135. **Produktentscheidung, keine
  Datenluecke.**

  `[cmd]` Ferritin, Haemoglobin, Vitamin B12, Vitamin D, SHBG, LH,
  Haematokrit, Magnesium, **Gesamtcholesterin**, freies Testosteron.

  `[read]` **Gesamtcholesterin gehoert inhaltlich zu
  `cardiovascular`** — ob es dorthin soll, entscheidet Tom. Die
  uebrigen neun haben kein offensichtliches System, und ein erfundenes
  waere schlechter als keins.


- [ ] **C-186: Nebenwirkungen und Zyklen haben keine Tabelle**
  (neu 2026-08-21). Befund aus G-148.

  `[cmd]` **`addSideEffect` und `planCycle` sind die zwei Fenster, die
  an gar nichts haengen** — die uebrigen fuenf Attrappen warten auf
  bereits vermerkte Tabellen (C-109 Injections, C-175
  `shopping_lists`, SSOT 173 fuer `EXTENDED_LABS`, `PRODUCT_DETAILS`,
  `STACK_TEMPLATES`).

  `[read]` **Die Vorlage zeigt, was erwartet wird:**
  `AddSideEffectModal` fuehrt Substanz, Schweregrad und Zeitpunkt;
  `PlanCycleModal` Laenge, Pause und Startdatum. **Erst die
  Produktentscheidung, dann das Schema.**

- [ ] **G-149: Der Einnahme-Haken bucht auf den Stichtag, nicht auf
  heute** (neu 2026-08-21). Befund aus G-148. **Klein.**

  `[cmd]` **`stichtag` ist der juengste Protokolltag** (2026-08-20),
  weil `new Date()` im Browser die Hydration zerlegt (G-74). **Wer
  heute etwas nachtraegt, bucht auf den letzten protokollierten Tag.**

  `[cmd]` **Der Weg liegt bereit:** `SupplementsAnsicht` nimmt
  `heute`-Prop entgegen (`heuteProp`), die Seite reicht es nur nicht
  durch. **Serverseitig gesetzt ist es hydrationssicher.**

  `[read]` **Dazu gehoert der zweite Rest:** `LogDose` mit Zeit und
  Notiz ist nur ueber den Extended-Tab erreichbar. **Ein Stift-Knopf je
  Zeile auf „Today" waere der vollstaendige Weg** — dasselbe Muster wie
  G-124 beim Wasser.

- [ ] **C-177: Thai-Aliase fehlen bewusst** (neu 2026-08-20). Rest aus
  C-165.

  `[cmd]` **0 Thai-Zeilen** — *„ohne Sprecher oder Quelle waere jede
  Zeile erfunden."*

  `[read]` **Richtig entschieden.** `[cmd]` **Die 138 `name_th` sind
  da**, die Umgangsnamen nicht. **Tom lebt in Thailand** — er kann sie
  liefern oder pruefen.

- [ ] **GO-24: *„Mineralstoffe"* als Gruppenbegriff?** (neu
  2026-08-20). **Produktfrage aus C-165.**

  `[cmd]` **`Elektrolyte` trifft fuenf Codes, `Spurenelemente` acht.**
  **Und *„Mineralstoffe"*?**

  `[read]` **Es waere die ganze Gruppe *Elemente* (16 Codes)** —
  **oder nichts**, weil die Karte schon so heisst. **Zu entscheiden, ob
  ein Alias auf eine ganze Karte zeigen darf.**

---

## K — Kimi-Bestand: Abgleich und Vertiefung

`[cmd]` **Aufgenommen am 2026-08-22 (C-194).** Der Bestand liegt unter
`backup/kimi-research/Kimi_Agent/supplement_performance_database/`,
untracked, 346 MB. **Er kommt nicht ins Repo** — der Pre-Commit-Hook
sperrt Dateien ueber 10 MB.

`[read]` **Der Befund, der die Gruppe begruendet:** Wir haben die
Huelle importiert und den Inhalt liegenlassen. `[cmd]`
`supplements.substance_catalog` hat **31 Spalten**, Kimi liefert
**146 Felder** je Substanz — **130 davon haben keine Repo-Spalte.**

`[read]` **Reihenfolge:** Schema vor Import, Import vor Oberflaeche.
K-01 bis K-03 haengen aneinander. Alles mit *„Schema fehlt"* ist
Codex; nichts davon ist Oberflaechenarbeit, solange die Daten fehlen.

### Substanzen — die dichteste Luecke

- [ ] **C-195: `substance_catalog` auf die Kimi-Tiefe bringen**
  (neu 2026-08-22). **Blockiert C-196.**

  `[cmd]` **130 von 146 Kimi-Feldern fehlen als Spalte.** Darunter
  vollstaendig: `safety` (Kontraindikationen, Nebenwirkungen, Toxizitaet,
  Niere/Leber/Herz/Endokrin/Neuro, Schwangerschaft mit Stillzeit),
  `interactions` (Arzneimittel, Supplement, Nahrung, Alkohol,
  Krankheit), `regulatory` (USA, EU, UK, Thailand, Australien,
  `wada_status`, `wada_category`, `prescription_required`),
  `warning_triggers` (`dose_ceiling` mit Wert/Basis/Quelle,
  `doctor_consult_flags`), `quality` (Verunreinigung, Faelschung,
  Lagerung, Licht, Temperatur), `evidence_provenance` je Feld mit
  `source_id`/`as_of`/`evidence_class`, `external_ids` (UNII, PubChem,
  ChEMBL, InChIKey, Summenformel), `platform` (`recommendable`,
  `warning_only`, `physician_referral`, `athlete_flag`, `modules`).

  **Vorschlag des Orchestrators, zu entscheiden:** Bloecke als `jsonb`
  (`safety`, `interactions`, `regulatory`, `quality`, `pharmacology`,
  `warning_triggers`), flach nur was gefiltert oder gewarnt wird —
  `wada_status`, `prescription_required`, `dose_ceiling.value`,
  `recommendable`, `warning_only`, `physician_referral`.
  `[read]` **130 flache Spalten waeren abfragbar und unpflegbar**;
  reines `jsonb` kostet bei jeder Abfrage — C-192 zeigt gerade, was
  CTEs auf dem heissen Pfad kosten.

  `[cmd]` **`evidence_provenance` muss mitwandern.** Sonst entstehen
  wieder Zahlen ohne Beleg — genau das Muster von C-185 (fabriziertes
  UNII bei BPC-157).

- [ ] **C-196: Die 290 Substanzen in die neue Tiefe importieren**
  (neu 2026-08-22). **Haengt an C-195.**

  `[cmd]` Quellen: `supplements.jsonl` 154 · `performance_compounds`
  75 · `peptides` 61. Repo heute 566 Zeilen (konsolidiert inkl.
  LumeOS/F-05).

  `[cmd]` **Die vorhandenen Spalten sind duenn:** `guideline_dose`
  **0 %**, `official_label_dose` **0,2 %**, `tolerable_upper_intake_level`
  **8,5 %**, `half_life` **9,4 %**, `cas_number` 29,2 %,
  `chemical_form` 19,3 %.

  `[read]` **Wo Kimi nichts hat, wird nichts erfunden.**
  `missing_fields` und `missing_reason` wandern mit — sie sagen, warum
  eine Zahl fehlt.

### Medikamente — Zeilen da, Spalten leer

- [ ] **C-198: ATC, CAS und CYP der 498 Wirkstoffe nachziehen**
  (neu 2026-08-22).

  `[cmd]` `medical.medication_active_substances` **498 Zeilen** — aber
  **ATC 56, CAS 56, CYP 22**. `risk_flags` **498**,
  `contraindications` **433**, `regulatory_state` 498, `sources` 498.

  `[read]` **Erst pruefen, ob Kimi mehr hat als wir importiert haben.**
  Fable meldet, die Quelle sei gleich duenn (1:1-Import) — dann ist es
  eine Recherchefrage an Kimi, keine Importfrage. **Das entscheidet,
  ob der Punkt zu Codex oder in die naechste Crawl-Runde geht.**

- [ ] **C-199: `medication_regulatory` als eigene Entitaet**
  (neu 2026-08-22). **Zu entscheiden.**

  `[cmd]` Kimi fuehrt 498 Saetze mit `wada.status`, `wada.tue_context`
  und `change_history`. Im Repo liegt das als `regulatory_state jsonb`
  in `active_substances` — **es gibt keine vierte Tabelle.**

  `[cmd]` **WADA ist nur zu 11 % bewertet** (56 von 498).

  `[read]` **Fuer Wettkampfsportler ist WADA-Status eine Abfrage, kein
  Anhaengsel.** Als `jsonb` ist er nicht filterbar.

### Was gar kein Schema hat

- [ ] **C-200: Symptomtabelle anlegen und fuellen** (neu 2026-08-22).
  **Beantwortet C-183, gehoert zu C-159 und C-171.**

  `[cmd]` Quelle liegt bereit: `symptom_ontology_seed.json` **32
  Symptome**, `taxonomy/symptom_ids` **34**, dazu
  `community_side_effect_patterns` 37 als Ergaenzung (admin-only).

  `[cmd]` **C-159:** *„keine Symptomtabelle im ganzen Schema"* — gilt
  weiter.

  `[read]` **Der naechste Schritt danach:** 32 Symptome gegen
  `lab_trigger_index` (77 Analyte) — *„welcher Blutwert klaert das?"*
  Die kuratierte SYMPTOM→BIOMARKER-Map fehlt bei Kimi ebenfalls.

- [ ] **C-201: Der Populations-Atlas hat kein Schema**
  (neu 2026-08-22). **Der groesste ungenutzte Posten.**

  `[cmd]` `population_response_atlas` **425** (39 Felder je Satz) ·
  `population_response_synthesis` 277 · `population_applicability_atlas`
  277 · `response_confounder_graph` **799 Kanten** ·
  `response_modifier_graph` 453 · `response_resolver_index` 277 ·
  `context_requirement_index` 277 · `exposure_response_summary` 182 ·
  `personal_response_readiness_model` 66. **Im Repo: nichts davon.**

  `[cmd]` Ein Satz traegt: `dose_response`, `magnitude` mit
  Konfidenzintervall und `missing_reason`, `confounders[]` je mit
  `status` (`demonstrated` / `strongly_supported`), `population` nach
  Geschlecht, Alter, Gesundheits- und Trainingsstand, `evidence_grade`,
  `inference_type`, PMIDs.

  `[read]` **Das ist der Rohstoff fuer „wirkt das bei mir?"** — eine
  belegte Richtung je Endpunkt fuer die passende Population, statt
  einer erfundenen Zahl.

- [ ] **C-202: Produkte, Marken, Hersteller, Kennungen**
  (neu 2026-08-22). **Blockiert durch Tom-Entscheidungen.**

  `[cmd]` `products` 50 · `brands` 120 · `manufacturers` 63 ·
  `product_identifiers` 72 (crawl_035) · `product_media` 3
  (Schema-Muster). **Im Repo: kein Produkt- oder Markenschema.**

  `[cmd]` Der 035-Handoff markiert `REQUIRES_REPO_SCHEMA` fuer
  `product_identifiers`, `product_media`, `packaging_versions`,
  `batch/COA`, `vision_learning_examples`.

  `[cmd]` **Duenn:** `thai_label` 2 %, GTIN/EAN fuer Medikamente 0
  (Quelle nicht offen), Supplement-Kennungen 30 von 31 unverifiziert.

- [ ] **C-203: Beobachtung gegen Erwartung (crawl_033)**
  (neu 2026-08-22).

  `[cmd]` Fertig spezifiziert, schema-only: `observation_event_schema`
  (14 Felder), `observation_comparison_semantics` (**20 Zustaende**),
  `_rules` 20, Result-Schemata, 13 Flagship- und 46
  Synthetik-Beispiele, `personal_baseline_methodology`,
  `comparison_context_requirements`. **RCV-Inventar fuer 55 von 66
  Markern.**

  `[read]` Damit waere sagbar: *„Dein CK ist drei Tage nach
  Beintraining hoch — RCV 39,3 sagt: noch im Rauschen."*

- [ ] **C-204: `lab_trigger_index` — 77 Analyte** (neu 2026-08-22).

  `[cmd]` 77 Analyte neben dem vorhandenen `lab_marker_catalog` (66,
  davon 64 mit LOINC). **Kein Schemaneubau noetig**, laut Aufnahme
  sofort importierbar.

- [ ] **C-205: `research_hold_registry` — 305 Saetze**
  (neu 2026-08-22).

  `[cmd]` **305 Eintraege** als Kuratierungs-Warteschlange. Koennte wie
  `lib/evidenz/registry.ts` (C-180) erzeugt werden statt in die
  Datenbank zu wandern.

- [ ] **C-206: Die Community-Schicht — nur Admin, oder nie?**
  (neu 2026-08-22). **Entscheidung Tom.**

  `[cmd]` 16 Dateien aus crawl_034, ausdruecklich `admin_only` und
  E-Klasse: `community_intelligence_patterns` 123 ·
  `exposure_patterns` 86 · `lab_patterns` 43 · `side_effect_patterns`
  37 · `stack_patterns` 31 · `science_delta` 30 ·
  `product_quality_signals` 40 · `terminology` (71 Begriffe, 179
  Aliase) · `_canonical_id_lookup` 1.131 Namen.

  `[read]` **Deskriptiv, keine Empfehlungen, keine Praevalenzen.**
  Taugt als Coach-Werkzeug (*„was die Szene glaubt vs. was belegt
  ist"*), nie als Empfehlung. **Zu entscheiden, ob es je nutzersichtbar
  wird.**

### Was Tom entscheiden muss, bevor Codex anfaengt

- [ ] **C-207: Vier Entscheidungen aus dem 035-Handoff**
  (neu 2026-08-22). **Entscheidung Tom. Blockiert C-202 und die
  Cam-Funktionen.**

  `[cmd]` Der Handoff nennt sie ausdruecklich als offen:
  **Speicherweg** (hybrid / remote-url / object-store) ·
  **Datenschutz und Aufbewahrung je Rechtsraum** (Thai PDPA, DSGVO) ·
  **Einwilligungs-Fuehrung** · **Wahl des Vision-Modells**.

  `[cmd]` Fertig liegen: **vier Cam-Contracts** (medication,
  supplement, peptide, prescription), `vision_product_match_signals`,
  `vision_learning_example_schema`, `product_media_rights_registry`
  (8 Rechte-Zustaende). **Spezifiziert bis zu den OCR-Grenzen.**

### Widerlegt oder ueberholt

- [ ] **C-208: C-129 neu fassen — der Import ist laengst passiert**
  (neu 2026-08-22).

  `[cmd]` C-129 heisst *„brauchbar, aber nicht importiert"* und ist
  gegen **237 Substanzen und 56 Wirkstoffe** geschrieben. Heute:
  **290 Substanzen, 498 Wirkstoffe** — und `medication_active_substances`
  498, `_formulations` 453, `_products` 448 stehen **1:1 im Repo**.

  `[read]` **Der Punkt beschreibt einen Zustand, den es nicht mehr
  gibt.** Er ist neu zu schreiben — die Luecke ist nicht der Import,
  sondern die Tiefe (C-195).

- [ ] **C-209: Die laufende Instanz wird nach einem Kettenschritt nicht
  nachgezogen** (neu 2026-08-22).

  `[cmd]` `tools/testdaten-pruefen.ts` ist rot:
  `medical.biomarker_reference_ranges` ist live **564**, erwartet
  **566**. `[cmd]` `144_biomarker_spec_enrichment.ts:771` und
  `schema-sollstand.json:1459` sagen beide 566.

  `[read]` **Kein Fehler in C-191 und keiner in C-192.** Die Erwartung
  ist der neuen Wahrheit vorausgeeilt, der Bestand nicht nachgezogen —
  weil wir bewusst nie gegen die laufende Datenbank arbeiten und
  niemand einen Schritt dafuer hat.

  `[read]` **Ein dauerhaft roter Waechter wird uebersprungen.** Dasselbe
  Muster wie der Selbsttest, der die falsche Pruefung feuerte.

  ### Nachgeschaerft 2026-08-22 — es sind zwei Dinge

  `[cmd]` Codex meldet aus C-215 die Zahlen **umgekehrt**: *„ist 566,
  erwartet 564"*. **Beide Beobachtungen stimmen — sie messen
  verschiedene Datenbanken.**

  | | Bestand | Erwartung |
  |---|---:|---:|
  | laufende Instanz | **564** | 566 |
  | frisch gebaute Kette | **566** | 564 |

  `[cmd]` **Auf der Wegwerf-Instanz erzeugt C-191 die zwei
  ApoB/Prolactin-Zeilen**, also 566 — waehrend
  `testdaten-pruefen.ts:126` noch 564 erwartet.
  `[cmd]` **Live steht 564**, weil die Kette dort nie lief, waehrend
  `144_biomarker_spec_enrichment.ts:772` auf 566 steht.

  **Damit zerfaellt der Punkt in zwei Arbeiten:**

  **1.** `testdaten-pruefen.ts` traegt eine stehengebliebene Erwartung.
  Sie gehoert auf 566 gezogen — das ist eine Zeile und blockiert heute
  jeden Kettenlauf mit einem Fehler, der keiner ist.

  **2.** Die laufende Instanz ist nie nachgezogen worden. `[read]` Hier
  ist die Frage groesser als die Zahl: **wann und wie wird sie nach
  einem Schemaschritt aktualisiert, ohne Toms Daten zu verlieren?**
  Solange das offen ist, faellt es bei jeder Pipeline-Aenderung wieder
  an.

- [ ] **C-210: Die 28 fehlenden Naehrstofftexte — was ist gemeint?**
  (neu 2026-08-22). Aus G-126.

  `[cmd]` **`nutrition.nutrient_defs` hat keine Beschreibungsspalte.**
  Die zwanzig Spalten sind `code, name_de, name_en, unit, group_de,
  group_en, sort_index, display_tier, is_always_computed,
  is_partly_computed, formula, rda_male, rda_female, rda_unit, name_th,
  group_th, assessment_horizon_days, assessment_horizon_source,
  assessment_horizon_notes, parent_code`.

  `[cmd]` **`name_th` und `group_th` sind 138 von 138 leer** — also
  alle, nicht 28. Die Thai-Vermutung ist widerlegt (Codex, C-191).

  `[read]` **Voellig offen, worauf sich die 28 beziehen.** Ohne
  Klaerung raet der Naechste wieder.

- [ ] **C-211: Selen fehlt im BLS-Katalog** (neu 2026-08-22). Aus
  G-126.

  `[cmd]` **Kein Selen-Eintrag in `nutrient_defs`.** `S` ist Schwefel,
  `SER` ist Serin, `SE` existiert nicht. Codex hat keinen Code
  erfunden — richtig so.

  `[read]` **BLS 4.0 ist die einzige zulaessige Quelle.** Fuehrt BLS
  Selen nicht, wird nichts angelegt und der Punkt geschlossen.

- [ ] **C-212: `CHORL` haengt nicht im Naehrstoffbaum** (neu
  2026-08-22). Aus G-126.

  `[cmd]` Cholesterin heisst `CHORL` und hat `parent_code = NULL`.
  `[cmd]` Von 138 Naehrstoffen sind 40 Wurzeln und 98 Kinder —
  gewollt oder nicht, ist ungeprueft. Codex hat gemeldet statt gesetzt.

- [ ] **C-213: C-124-E8 — die Arzt-Hinweis-Schwelle ist offen** (neu
  2026-08-22). Aus C-124.

  `[read]` Der Abschluss von C-124 haelt fest, dass **E8 mit E5 nicht
  beantwortet** ist. Die uebrigen Modalitaetsfragen sind geklaert, diese
  nicht.

- [ ] **C-214: Fuenf Modalitaeten ohne Registerzeile** (neu
  2026-08-22). Aus C-124.

  `[cmd]` **Foam Rolling, Yoga, Meditation, Nap, Breathwork** haben
  keinen Eintrag in `recovery_modality_evidence` (32 Records, 14
  Modalitaetsbezeichnungen).

  `[read]` **Sie behaupten jetzt nichts** statt einen Wert zu erfinden —
  der richtige Zwischenzustand. Offen ist, ob ein spaeterer Crawl sie
  liefert oder ob sie dauerhaft ohne Aussage bleiben.

- [ ] **A-48: Der Index wird vor dem `git add` nicht geleert** (neu
  2026-08-22).

  `[cmd]` **`LAUFEND.md` ist im falschen Commit gelandet** — `863124c`
  traegt Fables Evidenz-Code **und** den Eintrag *„G-133 laeuft bei
  Claude Code"*. Zwei logische Changes in einem Commit.

  `[read]` Die Datei war seit Stunden gestaged, und `git add <pfad>`
  entfernt nichts aus dem Index. **Die Projektanweisung sagt, vor jedem
  Commit `git diff --cached --name-only` zu lesen** — das Skript hat
  es ausgegeben, der Orchestrator hat es erst nachher gelesen.

  **Zu bauen:** vor einem gezielten Commit den Index leeren, oder die
  gestagten Pfade gegen die beabsichtigten pruefen und abbrechen, wenn
  sie abweichen.

- [ ] **C-215: ACWR rechnet in der Datenbank weiter** (neu 2026-08-22).
  **Laeuft bei Codex.** Die zweite Haelfte von C-181.

  `[read]` **Seit `538b7dd` zeigt die Oberflaeche einen Recovery-Score
  OHNE ACWR, die Datenbank rechnet einen MIT.** Zwei Wahrheiten
  nebeneinander — der 79,4 im Bildschirmfoto kam aus der Tabelle, nicht
  aus dem bereinigten Motor.

  `[cmd]` Alles in `121_recovery_scores_modalities.sql`:

  | Zeile | |
  |---|---|
  | 85 | `CREATE FUNCTION recovery.training_load_score(p_acwr NUMERIC)` |
  | 93–97 | die Kurve: NULL→70, **0,8–1,2**→100, drei Abfallzweige |
  | 105 | `CREATE FUNCTION recovery.acwr_for_day(p_user_id, p_entry_date)` |
  | 165 | `acwr_used NUMERIC(8,3)` in `recovery.scores` |
  | 336–337 | Aufruf und Einsetzen in den Score |
  | 485 | `GRANT EXECUTE ON acwr_for_day TO authenticated` |

  `[cmd]` **Die DB-Kurve ist nicht die des Frontends.** Dort galt
  0,8–1,3, hier **0,8–1,2** mit drei Abfallzweigen und einem
  NULL-Fallback auf 70. Eigenstaendig gebaut, eigenstaendig zu
  entfernen — nicht nach dem Muster des Frontends raten.

  `[cmd]` `recovery.scores.acwr_used` ist die einzige `acwr`-Spalte im
  ganzen Schema.

  `[cmd]` **`132a_rule_input_status.sql` ruft `acwr_for_day`** (Zeile
  100) und schreibt den Feldvertrag `training.load_spike` (Zeile
  337–339). **Der Vertrag bleibt** — aber der Aufruf bricht, wenn die
  Funktion faellt. Zu loesen, bevor entfernt wird.

  **Offen fuer Tom:** faellt `acwr_used` als Spalte, oder bleibt sie
  leer stehen? In `recovery.scores` liegen Zeilen, und eine geloeschte
  Spalte nimmt Messwerte mit.

- [ ] **C-216: Nachweisdateien blockieren das ganze Repo** (neu
  2026-08-22).

  `[cmd]` **`backup/c192/final-nachweis.json` und
  `-finaldb.json` waren doppelt kodiert** — je sechsmal die
  Doppelkodierungsmarke (U+00E2 U+20AC), dazu
  CRLF. Ausgabe eines Kettenlaufs durch eine Windows-Konsole.

  `[cmd]` **Das hat jeden Commit im Repo blockiert**, auch die, die
  diese Dateien nicht anfassten: `encoding-pruefen.mjs` laeuft als
  erster Gate-Schritt ueber alle 10.661 Dateien.

  `[cmd]` Zurueckgedreht (`cp1252` → `utf-8`), mit zwei Gegenproben:
  bleibt gueltiges JSON, keine Marken uebrig. Encoding-Pruefung danach
  Exit 0.

  **Zu bauen:** Agenten schreiben Nachweisdateien mit
  `encoding="utf-8", newline="\n"`. `[read]` Die Regel steht in
  `CLAUDE.md` fuer Quelldateien — fuer `backup/` galt sie offenbar als
  nicht gemeint.

  `[cmd]` **Nebenbefund:** fuenf `*_c192_vor_schema.sql` aus 14 Minuten
  (09:05–09:19). Jeder Wegwerf-Lauf legt eine Sicherung an. Bei diesem
  Tempo sammeln sich hundert je Woche.

- [ ] **C-217: Was ist gebaut, was ist Attrappe — je Modul, je Kachel**
  (neu 2026-08-22). **Laeuft bei Fable.**

  `[read]` **Anlass:** Der Orchestrator hat behauptet, es gebe keine
  Arbeit fuer zwei freie Agenten. Tom hat sieben Bildschirmfotos aus
  **einem** Modul geschickt, auf denen jede Kachel *„Attrappe"* traegt.
  **`TODO.md` ist ein Befundregister, kein Arbeitsvorrat** — ein ganzes
  Modul voller Attrappen steht nicht drin, weil es niemand als Befund
  aufgeschrieben hat.

  `[cmd]` Beleg und Bildinhalt: `backup/bestand/00-toms-bildschirmfotos.md`.

  `[cmd]` **Recovery zeigt auf jeder Kachel *„das Schema `recovery` gibt
  es noch nicht"*** — dabei hat `recovery.checkins` **340** Zeilen,
  `recovery.scores` **340**, `recovery.modality_log` **178**, und drei
  Lesefunktionen greifen bereits darauf zu (`checkin-read.ts:62`,
  `scores-read.ts:145`, `scores-read.ts:239`).

  `[cmd]` **42 Attrappen-Marken in sieben Recovery-Dateien.** Dasselbe
  Pauschalbanner in `coach`, `coach/ai`, `medical`, `training`.

  **Was der Bericht liefert:** je Kachel echt oder Attrappe, je Modul
  Schema und Zeilenzahlen, je Attrappe was zum Anbinden fehlt — Tabelle
  fehlt / leer / nicht verdrahtet / haengt an einer Entscheidung. Gegen
  alle vier Quellen. **Daraus werden die Gruppen mit Abhaengigkeiten.**

- [ ] **G-155: Jede Kachel jedes Moduls als Bild** (neu 2026-08-22).
  **Laeuft bei Claude Code.** Gegenstueck zu C-217.

  `tools/schuss.mjs` ueber alle Module und Tabs, hell und dunkel, je
  zwei Laeufe. Ablage `backup/bestand/`, Liste als `aufnahme.json`.

  `[read]` **Zweck:** Behauptung und Anblick vergleichbar machen. Wo
  eine Kachel ohne Marke erfundene Zahlen zeigt oder eine mit Marke echt
  aussieht, ist das der Befund.

- [ ] **C-218: Frontend und Datenbank normieren den Recovery-Score
  verschieden** (neu 2026-08-22). Aus C-181 und C-215.

  `[cmd]` **Fable rechnet `subtotal/85 × 100`** (C-181), damit die
  Readiness-Schwellen 90/80/70/60/40 ihre Skala behalten.
  `[cmd]` **Codex laesst den Term ersatzlos wegfallen** (C-215):
  `manual_v2_c215`, `training_load_points` 0,00.

  `[cmd]` **Live vorher 79,4 mit `training_load_points` 10,50. Nach der
  Kette 68,9.** Ein Szenariotag faellt auf 35,3.

  `[cmd]` **`GEWICHTE.trainingslast: 15` steht weiter in `score.ts`** —
  mit `roh: 'entfaellt — C-181, ACWR ohne Beleg'`, aber das Gewicht ist
  da.

  `[read]` **Beide Wege sind fuer sich begruendet, zusammen ergeben sie
  zwei Skalen.** Zu entscheiden: normiert wird auf 100, oder die Skala
  faellt auf 85 und die Schwellen wandern mit. **Nicht beides.**

  `[read]` Und der Nutzer sieht eine Verschlechterung um zehn Punkte.
  Das ist die richtige Zahl — aber sie gehoert erklaert, nicht
  kommentarlos angezeigt.

---

## M — Die Module sagen die Unwahrheit ueber sich selbst

`[cmd]` **Aufgenommen am 2026-08-22** (C-217 Code, G-155 Bild).
Werkzeuge: `tools/_modul-bestand.py`, `tools/_g155-bestand.mjs`.
Maschinenlesbar: `backup/modul-bestand.json`, `backup/bestand/aufnahme.json`
(128 Eintraege), 128 Bildschirmfotos.

`[cmd]` **Gegengeprueft: 25 von 25 Zeilenzahlen exakt.** Der Bestand
stimmt, die Oberflaeche nicht.

`[read]` **Der Befund in einem Satz:** Sieben Module tragen einen
Pauschalbanner *„das Schema gibt es noch nicht"*. **Bei sechs ist er
falsch.** Und der groesste Posten ist nicht fehlendes Schema, sondern
**Daten liegen und werden nicht gelesen**.

`[cmd]` **Gesamtlage, Marken gegen Kacheln:**

| Modul | Marken | Kacheln | Schema | Zeilen | Lage |
|---|---:|---:|---|---:|---|
| supplements | 59 | 79 | da | 3.852 | 16 markierte Rueckfaelle neben echten Fassungen |
| coach/ai | 46 | 36 | **fehlt** | 0 | der einzige Banner, der stimmt |
| training | 38 | 56 | da | 9.946 | Banner nennt Tabellennamen, die nie existierten |
| recovery | 36 | 40 | da | 858 | Banner behauptet das Gegenteil der Datenbank |
| coach | 33 | 36 | da | 63 | Daten vollstaendig, Oberflaeche liest an einer Stelle |
| nutrition | 25 | 55 | da | 990.000+ | am weitesten echt; Plans-Tab Attrappe trotz Daten |
| goals | 23 | 71 | da | 450 | echt und Attrappen-Doppel je Tab |
| medical | 18 | 44 | da | 14.340 | Banner falsch, Detail-Banner praezise |
| dashboard | 12 | 8 | quer | — | haengt an den Quellmodulen |
| settings | 0 | 3 | — | 7 | echt |

### Die falschen Banner — eine Zeile je Modul

- [ ] **G-157: Eine Kachel zeigt erfundene Zahlen ohne Marke** (neu
  2026-08-22).

  `[cmd]` `nutrition/nutrients-entwurf.tsx` — **12 Kacheln, null
  Marken, keine Lesezugriffe.** Rueckfall des Nutrients-Tabs
  (`ansicht.tsx:531`), zeigt ohne Sitzung erfundene Zahlen.

  `[cmd]` **Einziger gefundener Fall dieser Art** — und aus dem Bild
  nicht auffindbar: *„eine erfundene 87 sieht aus wie eine gemessene
  87"* (G-155). Gefunden nur durch die Code-Aufnahme.

  `[read]` **Der Fall ist nicht neu:** G-135 fand die
  Health-Score-Kachel, die nie eine Marke trug und mit Entwurfszahlen
  rechnete. **Beide Male beim Anbinden entdeckt, nie am Bild.**

### Daten liegen, werden nicht gelesen — der groesste Posten

`[read]` Diese Punkte brauchen **kein Schema und keine Entscheidung**.
Die Tabellen sind da, gefuellt, und in denselben Modulen liest schon
etwas anderes daraus. **Das ist die billigste echte Arbeit im Repo.**

- [ ] **G-159: training Today zeigt nicht, was History liest** (neu
  2026-08-22).

  `[cmd]` `ansicht.tsx` 11 Marken — This week, Weekly volume, Streak,
  Recent sessions, Volume by muscle. **Derselbe Stoff, den
  `tab-verlauf` bereits echt liest** (`workout_sessions` 60,
  `workout_sets` 202).

  `[cmd]` Dazu `tabs-extras` 1 Marke: Body stats × strength —
  `goals.body_measurements` × `workout_sets`, beides da.

- [ ] **G-160: recovery Messwerte liegen in `checkins`** (neu
  2026-08-22).

  `[cmd]` `tab-messwerte` 10 Marken (Muscle recovery, Per-muscle
  detail, HRV score, 30-day trend, Last night, 14 nights, Score paths,
  Sleep hygiene). **`checkins` traegt `hrv_rmssd`, `sleep_hours`,
  `sleep_quality`, `sleep_start`/`end`, `soreness`, sogar
  `screen_time_before_bed`.**

  `[cmd]` Ausnahme: *„Phone camera HRV"* braucht eine Geraetefunktion,
  die ganz fehlt; mehrfach-taegliche HRV braucht `hrv_measurements`.

- [ ] **G-161: nutrition Meal plans — der krasseste Fall** (neu
  2026-08-22).

  `[cmd]` 8 Marken, Banner *„Es gibt kein Schema fuer Essensplaene"* —
  **`meal_plans` 2, `meal_plan_weeks` 6, `meal_plan_days` 42,
  `meal_plan_entries` 112, und `plan-lesen` existiert.** Der
  Planner-Tab liest damit bereits echt.

- [ ] **G-162: supplements Compliance und medical Tracking** (neu
  2026-08-22).

  `[cmd]` `tab-compliance` 4 Marken (Heatmap, Streaks) —
  `intake_logs` **720**.
  `[cmd]` `medical/tab-tracking` Medications — `user_medications` 2
  plus 1.399 Katalogzeilen, **`page.tsx` liest sie bereits**.

- [ ] **G-163: 16 markierte Rueckfallfassungen in supplements** (neu
  2026-08-22).

  `[cmd]` In `tabs.tsx` stehen 16 `RUECKFALL`-Fassungen neben den
  echten. Von 59 Marken sind nur 43 echte Attrappen.
  `[cmd]` Dasselbe Muster: `nutrition/tab-prefs` (6) und `tab-planner`
  (1) neben `tab-vorlieben`; `coach/tab-rechte` (5) neben `rechte-echt`.

  `[read]` **Ein Rueckfall mit veraltetem Text ist schlimmer als
  keiner** — `tab-prefs` behauptet, Vorlieben haetten keine Spalten.

### Schema fehlt wirklich — Codex-Arbeit

- [ ] **C-219: Tabellen, die die Spec kennt und die es nicht gibt**
  (neu 2026-08-22).

  `[cmd]` **recovery:** `protocols`, `hrv_measurements`, `baselines`,
  `sleep_data`, `overtraining_alerts`, `training_load_logs`,
  `user_protocol_assignments`
  `[cmd]` **training:** `volume_landmarks`, `strength_standards`,
  `exercise_progression_configs`, `post_workout_feedback`, `routines`,
  `blocks` — alle in SPEC_06 spezifiziert, keine gebaut (17 Marken in
  `tabs-spec`)
  `[cmd]` **medical:** `user_symptoms`, `medical_alerts`,
  `biomarker_results` (Schreibweg fuer Werte ohne Laborbericht)
  `[cmd]` **goals:** `goal_adjustments`, `weekly_reports`,
  `goal_contributions`, `tdee_settings`, `progress_photos`
  `[cmd]` **supplements:** `stack_templates`/`items`, Injektionstabellen
  (14 Marken, korrekt markiert)
  `[cmd]` **nutrition:** `mealcam_scans`, `shopping_lists`,
  `meal_plan_logs`, `micro_flags`, `coach_nutrition_suggestions`

  **Reihenfolge nach Marken je fehlender Tabelle** — `tabs-spec`
  (training, 17) und die Injektionen (14) sind die dichtesten.
  `shopping_lists` ist bereits C-175 in C-187.

- [ ] **C-220: `buddy` — 0 von 16 Tabellen** (neu 2026-08-22).
  **Groesstes Einzelvorhaben, haengt an Entscheidungen.**

  `[cmd]` `coach/ai`: **20 Tabs, 46 Marken, alles Attrappe** — und zu
  Recht. `buddy` hat 0 Tabellen; SPEC_06 BuddyandAICoach fuehrt 16.
  `SPEC_05_ENGINES` und `SPEC_09_SCORING` liegen vor.
  `[cmd]` Kimi liefert `buddy_capability_map` (23 Capabilities) und
  `buddy_dependency_graph` (140 Kanten) — s. Gruppe K.

### Was ganz fehlt

- [ ] **G-164: Drei Module des Vorgaengers haben hier kein Gegenstueck**
  (neu 2026-08-22).

  `[cmd]` Aus `referenz/lumeos-2026/src/modules`: **marketplace** (10
  Dateien), **onboarding** (9), **human-coach** (30 — hier nur eine
  Stub-Seite). `intelligence` (8) ist der Vorlaeufer von `coach/ai`.

  `[read]` Die Sidebar fuehrt Marketplace, Coach Portal und Admin als
  eigene Arbeitsbereiche (3210/3220) — nicht Teil dieser Aufnahme.
  **Zu klaeren, ob Onboarding in `apps/web` gehoert.**

### Befunde am Rand

- [ ] **A-49: Der Attrappen-Waechter traegt eine veraltete Behauptung**
  (neu 2026-08-22).

  `[cmd]` `v2-attrappen.test.ts:963` sagt *„SuppInteractions ist
  unangebunden"* — `tab-interactions-echt.tsx` existiert inzwischen.
  Ungeprueft, ob der Test noch die Rueckfall-Lage meint.

- [ ] **C-221: `supplement_interactions` ist eine tote Spec-Tabelle**
  (neu 2026-08-22).

  `[cmd]` **0 Zeilen, und niemand liest sie.** Die echte
  Interactions-Kachel laeuft ueber `rule_catalog` (64). Kein
  Oberflaechenwiderspruch — aber eine Tabelle, die es ohne Grund gibt.

- [ ] **G-165: `nutrition-foods` zahlt die Preference-Kosten zweimal**
  (neu 2026-08-22). Gehoert zu C-192.

  `[cmd]` **1.830 ms im Dokument und 1.750 ms im `fetch` danach** —
  beide mit `prefs=1`, dieselbe Abfrage. Gesamt 4.287 ms im zweiten
  Lauf, also kein Kaltstart.

  `[read]` **Das serverseitige Erstladen hat der Orchestrator in G-154
  beauftragt**, damit die Liste nicht von 7.140 auf 5.292 springt.
  **Dass es die teuerste Abfrage verdoppelt, war nicht bedacht.**

  `[cmd]` Nebenbefund: `supplements` liegt durchgehend bei ~2.100 ms
  ueber alle elf Tabs — kein Ausreisser, aber der langsamste
  Modulrahmen.

- [ ] **C-222: `monitoring` fehlt als siebter Block** (neu 2026-08-22).
  Aus C-196. **Auslassung des Orchestrators in C-195.**

  `[cmd]` **Kein `ADD COLUMN monitoring`** unter den 60 Spalten. Die
  Quelle traegt es bei **46 Saetzen**: 39 Supplements, 2 Performance
  Compounds, 5 Peptide. Die Daten liegen weiter nur in `raw`.

  `[read]` **Der Orchestrator hat `monitoring` in C-195 in der
  Fuellgrad-Tabelle aufgefuehrt und dann nicht in die Liste der sechs
  Bloecke aufgenommen.** Kein Fehler von Codex — der Auftrag hat es
  nicht verlangt.

  `[read]` **Und es ist kein Randfeld:** `monitoring` fuehrt
  `relevant_blood_tests` und `relevant_biomarkers` je Substanz. **Das
  ist die Bruecke zwischen Supplements und
  `medical.lab_marker_catalog`** — dieselbe Verbindung, an der C-183
  (Symptom-Ontologie) und die Symptom-Biomarker-Frage aus C-171
  haengen.

  **Zu tun:** Spalte aufnehmen wie die sechs anderen, Sollstand
  nachziehen, die 46 Saetze heben. Erwartung: `monitoring` 46/46,
  Spaltenzahl 60 → 61, Zeilenzahl unveraendert 566.

- [ ] **C-223: `dose_ceiling_value numeric` ist die falsche Form** (neu
  2026-08-22). Aus C-196. **Entscheidung Tom.**

  `[cmd]` **32 von 32 Eintraegen tragen einen Freitext, keinen
  Zahlwert:**

  | Substanz | `dose_ceiling.value` |
  |---|---|
  | Vitamin A | `UL 3000 mcg RAE/day adults` |
  | Magnesium citrate | `UL 350 mg/day supplemental` |
  | Coffein | `EFSA: single doses <=200 mg, daily <=400 mg (adults)` |
  | Vitamin B6 | `US UL 100 mg/d — EFSA UL 12 mg/d (2023); DB stores BOTH (conflict record)` |
  | hCG | `Per label (fertility indications)` |
  | Insulin | `Per prescription only` |

  `[read]` **Die Erwartung „dose_ceiling_value 32" war falsch
  gebaut** — der Orchestrator hat eine `numeric`-Spalte fuer ein Feld
  spezifiziert, das die Quelle als Satz fuehrt: mit Einheit,
  Rechtsraum, Begruendung und teils zwei widersprechenden Werten in
  einem String.

  `[cmd]` Codex hat 29 gefuellt, indem es die Zahl aus dem Text zog,
  und die drei ohne Zahl gemeldet. **Das ist mehr Interpretation, als
  „heben, nicht interpretieren" erlaubt** — die richtige Reaktion auf
  einen Auftrag, der so nicht erfuellbar war.

  `[read]` **Vitamin B6 zeigt, warum die Form grundsaetzlich nicht
  traegt:** US 100 mg/d gegen EFSA 12 mg/d, und die Quelle sagt
  ausdruecklich, sie speichere **beide**. Ein `numeric`-Feld kann das
  nicht, egal welche Zahl man waehlt.

  **Drei Wege, einer zu waehlen:**

  **A** — `dose_ceiling_text` daneben, `numeric` nur wo eindeutig.
  Filterbar bleibt, was eine Zahl hat; der Rest ist lesbar.

  **B** — Wert, Einheit und Rechtsraum getrennt, mit einer Zeile je
  Jurisdiktion. Sauber, aber eine eigene Tabelle.

  **C** — das flache Feld streichen, nur der `jsonb`-Block bleibt.
  Dann gibt es keinen Dosisfilter.

  `[read]` **Der Grund fuer die flache Spalte war ein Filter** — „zeig
  mir alles ueber der Obergrenze". **Der funktioniert in keiner der drei
  Varianten so, wie gedacht**, solange die Obergrenze vom Rechtsraum
  abhaengt. Das ist die eigentliche Frage: **gilt fuer einen Nutzer in
  Thailand die US-Zahl oder die EFSA-Zahl?**

- [ ] **G-168: Die coach-Kopfzeile widerspricht dem eigenen Tab** (neu
  2026-08-22). Aus G-158.

  `[cmd]` *„4 active · 1 unread"* liest weiter den Entwurf, waehrend
  der Messages-Tab echt **0 ungelesen** zeigt. Eine Zeile.

- [ ] **G-169: `coach.checkins` und `checkin_templates` liegen
  ungelesen** (neu 2026-08-22). Aus G-158.

  `[cmd]` `checkins` 6, `checkin_templates` 2 — nach G-158 der
  billigste Treffer im Modul.

- [ ] **C-225: Vier Schreibwege fehlen in coach** (neu 2026-08-22).
  Aus G-158.

  `[cmd]` Antworten (`messages` INSERT), Einladen (`relationships`
  INSERT mit `status='invited'`), Als-gelesen (`messages` UPDATE
  `read_at`), und **`coach_profiles`** als Namensquelle —
  `[cmd]` `to_regclass('coach.coach_profiles')` ist `null`.

  `[read]` **Es gibt heute keine Namensquelle:** `public.profiles`
  fuehrt kein Namensfeld. Die Kachel zeigt Rolle und Kurzkennung und
  sagt das sichtbar dazu, statt einen Namen zu erfinden — richtig so.

  `[read]` Der ADR *„Coach schreibt nie direkt"* ist davon unberuehrt:
  hier schreibt der Klient.

- [ ] **G-170: `medical/tab-tracking` behauptet ein fehlendes Schema**
  (neu 2026-08-22). Aus G-156. **Neunter Fall desselben Musters.**

  `[cmd]` `tab-tracking.tsx:39` sagt *„`medical.medications` — das
  Schema gibt es noch nicht."* **Der Tabellenname stimmt nicht, die
  Sache schon:** `medication_active_substances` **498**,
  `_formulations` **453**, `_products` **448**.

  `[read]` Dieselbe Klasse wie `training.sessions` gegen
  `workout_sessions`. **Und es gehoert zum Substanz-Strang** —
  genau diese Medikamente sollen sichtbar werden.

- [ ] **G-171: Die Code-Markenzahl misst den Fortschritt nicht** (neu
  2026-08-22). Aus G-158. Gehoert zu G-163.

  `[cmd]` **33 → 33 Marken, und trotzdem sind Kacheln echt geworden.**
  Keine Marke wurde entfernt; die markierten Entwuerfe rendern nur
  nicht mehr, solange eine Sitzung besteht.

  `[cmd]` Gerendert und angemeldet gemessen: Overview 7 → 6,
  Messages 3 → 2, Autonomy 1 — die Reste sind die Buddy-Kontextkachel.

  `[read]` **Solange Rueckfallfassungen existieren, zaehlt nur die
  gerenderte Zahl.** Das macht G-163 dringender: betroffen sind
  `supplements/tabs.tsx` (16), `nutrition/tab-prefs`,
  `coach/tab-rechte`, plus die neuen Entwurfszweige von Autonomy,
  Overview und Messages.

- [ ] **C-228: Drei Gruppen, saubere Kategorien, Beschreibung** (neu
  2026-08-22). **Laeuft bei Codex.** Korrigiert C-197.

  **Tom, 2026-08-22:** *„wir haben normale supplements … wir haben
  peptides … wir haben enhanced supplement — das ist je eine Gruppe
  mit ihren Filtern."*

  `[cmd]` **C-197 hat 276 Zeilen als „ohne kanonische Kategorie"
  gelassen. Von diesen 276 haben 276 eine `category` und 248 einen
  `compound_type`. Wirklich leer: null.**

  `[read]` **Der Fehler war der des Orchestrators:** im Auftrag stand
  *„wo nicht aus `raw` ableitbar, bleibt leer"* — die vorhandene
  `category`-Spalte kam darin nicht vor. **Und er hat es abgenommen**
  mit dem Satz *„276 leer ist der korrekte Zustand"*. Tom hat es an der
  Oberflaeche gesehen.

  `[cmd]` **Die Gruppen sind aus `domain` und `category` ableitbar:**
  supplement 307 · peptide 82 · enhanced 177 = 566.

  `[cmd]` **Kategorien stehen zweimal da, deutsch und englisch:**
  `Herbal/botanical` 28 gegen `herbal` 40 · `Minerals` 23 gegen
  `Mineral` 8 · `Nootropics` 6 gegen `nootropic` 25 gegen
  `Nootropikum` 25. **Deshalb sind sie nie zusammengekommen.**

  `[cmd]` **Die Untergliederung liegt in `subcategory`:** enhanced hat
  `Injectable AAS` 10, `Oral AAS` 10, `Ancillaries` 10, `SARM` 8 …;
  peptide hat `Growth hormone axis` 5+4+2, `Neuro/cognitive` 6,
  `Muscle/growth axis` 5, `Metabolic/incretin` 3+3+2+1+1 …

  `[cmd]` **`description` liegt in `raw` bei 290 von 290**, Median 97
  Zeichen — **und `substance_catalog` hat keine Spalte dafuer.**
  Dieselbe Auslassung wie `monitoring` (C-222); geht im selben Lauf mit.

  **Einspielen live ist Teil des Auftrags**, seit C-226.

- [ ] **C-229: Ein Katalog aus `DatabaseEcht`, Detail und Add
  getrennt** (neu 2026-08-22). **Laeuft bei Fable.** Haengt an C-228.

  **Tom, 2026-08-22:** *„das sieht viel mehr wie eine brauchbare
  version aus plus noch bisschen erweitern. detail ist das supplement
  / add ist separat / links wird name und keypoints was es macht
  angezeigt"*

  `[cmd]` **Die Vorlage steht im Repo:** `tabs.tsx:779`,
  `DatabaseEcht`. Sie macht richtig, was der neue Katalog nicht kann —
  links Name mit Keypoints als Unterzeile, Add als eigene Spalte,
  `Active`/`View` wenn im Stack, Zeilenklick oeffnet das Detail mit
  `stopPropagation` auf den Knoepfen, **eine** Suche, **ein**
  Kategorienfeld.

  `[cmd]` **Ihr fehlt nur die Tabelle:** sie liest
  `supplement_catalog` mit 44 Eintraegen.

  `[cmd]` **Heute stehen drei Einstiege nebeneinander** — `Catalog`
  mit 44 und Evidenzleiste, `Database` mit 44, die
  `SubstanzKatalogKarte` mit 566 als Anhang darunter. **Es bleibt
  einer.**

  `[cmd]` **Toms Add-Befund:** `modale.tsx:589` sendet
  `supplement_id`, `custom_name`, `dose`, `dose_unit`, `timing` —
  **keine `stack_id`.** Der Dialog schreibt in den aktiven Stack, ohne
  dass man ihn sieht oder waehlen kann. Der Weg existiert seit C-224.

  `[cmd]` **Das Klappen ist gebaut und wird abgeschaut, nicht
  nacherfunden:** `naehrstoff-ordnung-tab.tsx` (518 Zeilen) und
  `naehrstoff-anzeige.ts` — `Sicht` mit `zeige`/`kindZeige`/
  `erzwungenOffen`, Start ueberall zu, Ansicht gespeichert nach
  `user_display_preferences`.

  `[read]` **Der Orchestrator hatte gemeldet, es gebe kein klappbares
  Element** — er hatte in `packages/ui` gesucht, nichts gefunden und
  daraus auf Nichtexistenz geschlossen. **Dasselbe Muster wie die neun
  falschen Banner.** Was generisch ist, gehoert nach `packages/ui`,
  sonst wird es ein drittes Mal neu erfunden.

- [ ] **C-232: Schritt 1 des Neuaufbaus — die 26 Tabellen anlegen**
  (neu 2026-08-23). **Laeuft bei Codex.**

  **Vorlage:** `docs/specs/Supplements/SCHEMA_NEUAUFBAU.md`, 375
  Zeilen, gegen vier Quellen geprueft, von Tom abgenommen.

  `[read]` **Anlass, Tom am 2026-08-22:** *„wieso haben wir
  supplement_catalog und substance_catalog? … jetzt wird zuerst
  aufgeraeumt und definiert bevor wir nur eine zeile mehr code
  machen."*

  `[cmd]` **Woher die zwei kommen:** `a02e838` legt
  `supplement_catalog` an (44 Zeilen), `022f2ce` — Titel *„one
  catalogue from three sources"* — legt `substance_catalog` daneben.
  Danach vier Commits, die nur den zweiten ausbauen: 31→60→63→68
  Spalten. **Beide werden bis heute gelesen.**

  `[read]` **Der Orchestrator hat die Doppelung zementiert:** in C-224
  stand *„`supplement_catalog` nicht anfassen — die Abloesung ist ein
  eigener Punkt"*. Diesen Punkt hat er nie angelegt.

  **Nur anlegen, leer.** Kein Umhaengen, kein Loeschen. Neuer
  Kettenschritt `136`, nach 135.

  **Drei Regeln je Tabelle:** Fremdschluessel auf
  `supplements.supplements` · `status` mit
  `bekannt | unbekannt | nicht_zutreffend` · `_de`/`_en`/`_th` bei
  jedem Anzeigetext.

  `[read]` **Warum `status`:** Buddy wird ein deterministischer Layer.
  `[cmd]` `interactions` ist bei 78 von 290 gefuellt — bei 212 wissen
  wir es **nicht**. Ohne diesen Zustand macht Buddy daraus *„keine
  Wechselwirkung"*.

  **Abgelehnt und begruendet:** `enhanced_substances` (SPEC) waere eine
  dritte Substanztabelle — `enhanced` ist ein Wert in
  `supplement_groups`, kein Katalog. `supplement_knowledge` (ALT)
  mischt vier Informationsarten.

  **Offen fuer Tom:** zwei Wege zum Enhanced-Gate —
  `user_supplement_settings.enhanced_mode` mit Altersprueferung (SPEC,
  Flow 9) gegen `experience_level` (G-167, Provisorium).

- [ ] **G-172: Deutsch, scrollbar, ein Katalog auf dem Catalog-Tab**
  (neu 2026-08-23).

  `[cmd]` **22 englische Sichttexte** in `supplements`, waehrend
  `apps/web/messages/de.json`, `en.json` und `th.json` existieren und
  Nutrition sie ueber `next-intl` nutzt. **Supplements nirgends.**

  `[read]` Der Orchestrator hatte gemeldet, es gebe keine
  i18n-Schicht — er hatte nach `useTranslation` gesucht. Es ist
  `next-intl`. **Nach dem falschen Namen gesucht, zum wiederholten
  Mal.**

  **Tom, 2026-08-22:** *„i18n ist fuer die UI und auch da gilt: wir
  entwickeln immer de plus en, thai machen wir spaeter."*

  `[cmd]` **Kein `overflow`, kein `maxHeight` an einer Liste im ganzen
  Modul** — nur an den Modals. Bei 566 Zeilen ist unten alles
  unerreichbar.

  `[cmd]` **Und `Catalog` zeigt weiter eine Attrappe**, waehrend die
  echte Substanzdatenbank am `Database`-Knopf im Kopf haengt. Zwei
  Einstiege, einer davon Vorlage. Der Orchestrator hatte geschrieben
  *„welcher Tab ihn traegt, entscheidet die Navigation spaeter"* —
  das war falsch.

- [ ] **C-233: `user_supplement_settings` — die Spec sieht es vor, wir
  bauen es nicht** (neu 2026-08-23). **Wartet auf Subscription und
  Tiers.**

  `[cmd]` `SPEC_06_DATABASE_SCHEMA.md`, Abschnitt 4:
  `enhanced_mode` · `enhanced_accepted_at` · `enhanced_age_verified` ·
  `reminder_morning`/`_evening`/`_pre_workout` · `low_stock_days`.

  **Tom, 2026-08-23:** *„wir sind am entwickeln und das werden wir noch
  ein jahr sein. wenn dann irgendwann mal das subscription modell und
  die tiers definiert sind … dann diskutieren wir ueber sachen wie
  alterspruefung."*

  `[read]` **Bis dahin entscheidet `experience_level`** (G-167,
  ausdruecklich als Provisorium beschriftet). Ein zweites Gate daneben
  waere derselbe Fehler wie zwei Kataloge.

  `[cmd]` **Die Auslassung steht im Kettenschritt 136 als Textblock**,
  mit Quelle und diesem Punkt — nicht stillschweigend weggelassen.
  Toms Regel vom 2026-08-23: *„sehe es vor und mach texteintraege da im
  code und verweise im todo darauf."*

  **Die Erinnerungszeiten sind davon unberuehrt** und koennten frueher
  kommen — sie haengen an keiner Tarifentscheidung. Wenn der
  Einnahme-Plan (`intake_schedule`) gebaut wird, gehoeren sie dazu.

- [ ] **C-234: `marketplace_product_id` — zeigt auf ein Modul, das es
  nicht gibt** (neu 2026-08-23).

  `[cmd]` `user_supplement_cycles` im Vorgaengerrepo
  (`047_coach_planning_system.sql`) traegt `marketplace_product_id` und
  `suggestion_source: marketplace_product`. **Der Vorgaenger hatte eine
  Marketplace-Anbindung.**

  `[cmd]` **Hier gibt es kein Marketplace-Modul** — G-164:
  `referenz/lumeos-2026/src/modules/marketplace` hat 10 Dateien, in
  `apps/web` existiert nichts davon. Die Seitenleiste fuehrt Marketplace
  als eigenen Arbeitsbereich.

  `[read]` **Die Spalte wird nicht angelegt.** Ein Fremdschluessel auf
  eine Tabelle, die es nicht gibt, ist entweder kaputt oder eine Luege.
  Der Textblock im Kettenschritt sagt, dass sie vorgesehen war.

- [ ] **C-235: Schritt 2 des Neuaufbaus — die 33 Tabellen befuellen**
  (neu 2026-08-23). **Laeuft bei Codex.** Nach C-232.

  `[cmd]` **Aus bestehenden Tabellen, 1:1:** `substance_catalog` 566 →
  `supplements` · `substance_aliases` 1.541 ·
  `substance_lab_effects` 222 · `supplement_nutrient_mappings` 17.

  `[cmd]` **Struktur:** `supplement_groups` 3 (supplement 307,
  enhanced 177, peptide 82) · `supplement_categories` 23 aus der
  `filter`-Spalte.

  `[cmd]` **C-230 ist durchgelaufen, ohne dass ein Bericht ankam** —
  `filter` ist auf allen 566 gefuellt und traegt genau die Buendelung
  aus dem Auftrag: 9 supplement, 7 peptide, 7 enhanced.

  `[cmd]` **`kategorie` hat 59 Werte** (22 enhanced, 24 peptide, 16
  supplement) — das ist die feine Fassung. Sie bleibt Spalte an
  `supplements` fuer die Detailanzeige, sie wird **nicht**
  Filterleiste.

  `[cmd]` **Mit Zweitschluessel entstehen mehr Zeilen als Substanzen:**
  `supplement_organ_risks` **1.450** (290 × 5 Organe) ·
  `supplement_identifiers` **1.226** · `supplement_regulatory`
  **1.185** · `supplement_field_sources` **2.147** ·
  `supplement_interactions` 78.

  `[read]` **Eine Korrektur an einer eigenen Messung:** der
  Orchestrator hatte die Organprofile mit *„2 / 1 / 1"* gezaehlt —
  sein Muster trennte `""` und `"unknown"` nicht. **Es sind 290 × 5,
  alle gefuellt.**

  `[read]` **Der Kern des Auftrags ist `status`:** wo die Quelle
  *„unknown"* sagt, ist der Wert `unbekannt` — nicht eine leere Zeile
  und nicht `bekannt` mit leerem Inhalt. `[cmd]` `regulatory` traegt
  *„unknown"* massenhaft: `uk` nur 115 von 290 mit echtem Wert,
  `australia` 134.

  **Leer bleiben mangels Quelldaten:** `intake_schedule`,
  `user_inventory`, `user_supplement_settings`, `stack_templates` und
  die Zyklus- und Protokolltabellen.

- [ ] **A-50: Ein `DROP COLUMN` prueft die Lesepfade nicht** (neu
  2026-08-23). Aus G-160.

  `[cmd]` **`recovery.scores.acwr_used` ist seit C-215 gedroppt und
  seit C-226 live weg** — `scores-read.ts` hat sie trotzdem weiter
  selektiert. **Sechs Treffer im committeten Stand.** Gefunden hat es
  Fable in G-160, drei Tage spaeter, beim Anbinden einer Kachel.

  `[read]` **Die Luecke ist im Ablauf des Orchestrators:** er prueft
  Pipeline-Auftraege gegen die Datenbank — Spalten da, Zeilen stabil,
  Policies gezaehlt — **aber nie gegen die Lesepfade.** Ein
  `DROP COLUMN` braucht denselben `git grep`, den ein
  Tabellenname bekommt.

  `[cmd]` **Gegenprobe ueber alle gedroppten Spalten:** `acwr_used`,
  `enhanced_mode`, `enhanced_accepted_at`, `enhanced_age_verified`.
  **Nur `acwr_used` wurde je in `apps/web` gelesen.** Ein Fall, kein
  Muster — aber einer, der unbemerkt blieb.

  **Zu bauen:** die Regel in `CLAUDE.md` und ein Schritt in jedem
  Pipeline-Auftrag — wer eine Spalte entfernt, zaehlt vorher ihre
  Leser. Besser noch: eine Gate-Pruefung, die selektierte Spalten
  gegen den Sollstand haelt.

- [ ] **C-236: Die Recovery-Seeds sind Zaehlreihen, keine Messwerte**
  (neu 2026-08-23). Aus G-160.

  `[cmd]` `hrv_rmssd` bei `dev@lumeos.app`: **min 62, max 230,
  Schnitt 146** über 43 Werte. Die juengsten acht:
  `230 · 226 · 222 · 218 · 214 · 210 · 206 · 202` — **eine perfekte
  arithmetische Reihe, +4 pro Tag.**

  `[read]` **Menschliche RMSSD liegt bei 20–80 ms.** 146 im Schnitt ist
  physiologisch unmoeglich, und +4 pro Tag ist kein Messwert, sondern
  ein Zaehler.

  `[cmd]` **Und die Luecken:** `sleep_start_time` **0**,
  `sleep_end_time` **0**, `work_stress` **0**, `life_stress` **0** von
  170. Die Sleep-Kachel kann keine Bettzeit zeigen, weil keine da ist.
  `caffeine_mg` und `screen_time_before_bed` sind vollstaendig.

  `[read]` **Fable hat die Kacheln gebaut und die Zahlen nicht
  schoengerechnet** — richtig. Eine Kachel, die 146 ms zeigt, ist
  ehrlich kaputt; eine, die es kaschiert, ist unehrlich heil.

  `[cmd]` **`test-user@lumeos.local` hat 0 Check-ins** — wie schon 0
  Trainingssitzungen (G-159) und 0 Coach-Beziehungen (G-158).
  **Als Nachweiskonto ist es fuer drei Module unbrauchbar**, obwohl die
  Regel aus C-209 es dafuer vorsieht.

  **Zu tun:** plausible Seeds fuer Recovery und Training, die fehlenden
  Spalten fuellen, und `test-user` mit Daten versehen.

- [ ] **G-173: Ein falscher Punktverweis in `scores-read.ts`** (neu
  2026-08-23). Aus G-160. Eine Zeile.

  `[cmd]` `scores-read.ts:42` sagt *„C-195 hat die Spalte entfernt"* —
  **es war C-215.** C-195 war der Substanzkatalog.

  `[read]` Kleinigkeit, aber ein falscher Verweis fuehrt beim naechsten
  Suchen in die Irre — dasselbe Muster wie `training.sessions` gegen
  `workout_sessions`.
