# LumeOS — SSOT Index

**Stand:** 2026-08-01
**Gilt für:** `D:\GitHub\LumeOS-Claude-V1`

---

## Für neue Sessions: lies das zuerst

Dieser Ordner ist die einzige verbindliche Beschreibung des Ist-Zustands.
Wenn eine andere Datei im Repo etwas anderes behauptet, gilt diese hier —
ausser der Code selbst widerspricht.

**Rangfolge bei Widerspruch:**

1. Code (verifiziert per Befehl)
2. `docs/ssot/`
3. `docs/specs/` (beschreibt das Ziel, nicht den Ist-Zustand)
4. alles andere

---

## Was LumeOS ist

Ein Health & Performance Operating System. Kernprodukt ist **Buddy**,
ein AI-Companion; die Fachmodule liefern das Wissen, aus dem Buddy schöpft.

Vollständige Produktvision: `docs/specs/00_MASTER_VISION.md`.
Diese SSOT beschreibt **nicht** das Produkt, sondern was davon gebaut ist.

---

## Herkunftsmarker — Pflicht bei jeder Aussage

Jede Tatsachenbehauptung in diesem Ordner trägt einen Marker.
Ohne Marker ist eine Aussage ungültig.

| Marker | Bedeutung | Beispiel |
|---|---|---|
| `[cmd]` | Durch ausgeführten Befehl belegt, mit Datum | `[cmd]` pnpm typecheck 2026-08-01, 17/17 grün |
| `[read]` | Datei gelesen, Inhalt zitierbar | `[read]` apps/web/package.json |
| `[annahme]` | Ungeprüft, Vermutung, Übernahme aus älterem Dokument | `[annahme]` Curation-Tabellen stammen aus manuellem SQL |

**Regel:** Nur `[cmd]`-Aussagen dürfen in `CLAUDE.md` oder in Agent-Anweisungen
als Regel übernommen werden. `[annahme]` gehört auf die Todo-Liste, nicht in eine Regel.

**Warum diese Regel existiert:** Am 2026-07-30 lief eine Bestandsaufnahme ohne
funktionierende Shell. Sie schloss daraus, `services/` und `packages/` seien leer.
Der Satz wanderte ungeprüft in die Projektanweisung und galt dort als Regel.
Tatsächlich enthalten beide Ordner 17 kompilierende Packages.
Ein `[annahme]`-Marker hätte das verhindert.

---

## Inhalt dieses Ordners

| Datei | Beantwortet |
|---|---|
| `00-INDEX.md` | Diese Datei. Einstieg, Regeln, Rangfolge |
| `10-workspace.md` | Was liegt im Monorepo? Was lebt, was ist Gerüst, was ist Altlast? |
| `11-zielarchitektur.md` | Wie soll es am Ende aussehen? Welche Apps, welche Services? |
| `20-apps-web-ist.md` | Was kann `apps/web` heute wirklich? |
| `30-datenbank.md` | Welches Schema ist live? Welche Entwürfe liegen daneben? |
| `35-naehrwert-bezugsgroesse.md` | Worauf beziehen sich die Nährwerte, und wie rechnet man auf eine Menge um? (Grundlage jeder Diary-Rechnung) |
| `36-testbasis.md` | Was wird womit geprüft — und was ausdrücklich **nicht**? (Gate, Rechteprüfung, E2E-Entscheidung) |
| `37-testkonten.md` | Testkonten der lokalen Instanz — wer darf, wer nicht, und wozu die zweite Session gebraucht wird |
| `40-spec-code-matrix.md` | Je Modul: Spec vorhanden? Code vorhanden? Delta? |
| `41-lebensmittelsuche-wortschatz.md` | Wie weit der BLS-Wortschatz von dem entfernt ist, was Menschen tippen |
| `42-dekompositum-messung.md` | Das deutsche Zerlegewörterbuch am BLS-Bestand gemessen |
| `43-wortschatz-luecke.md` | Die volle Lücke gegen OpenThesaurus, in vier Klassen |
| `44-bls-codestruktur.md` | Was der BLS-Code über Warengruppe und Zubereitung bereits sagt |
| `45-bls-dokumentation.md` | Was die amtliche Dokumentation hergibt — und was nicht |
| `46-bls-importluecke.md` | 30 Fettsäuren fehlten; Bestand gegen die Quelle geprüft |
| `48-artengruppierung-messung.md` | Erster Versuch, Arten aus dem BLS-Code abzuleiten — **gemessen gefallen**, 39 von 100 |
| `49-zubereitungsschluessel.md` | Die Reparatur dazu — **ebenfalls gefallen**, 47 von 100; der Schlüssel je Warengruppe, 204 Zellen |
| `51-sortweight-formel.md` | Wie `sort_weight` gerechnet wird: Spec-Formel, zwei Korrekturen, Umsetzung in die Kette |
| `52-anzeigenamen-batch.md` | Wie die 5.775 Anzeigenamen entstanden — und wie 704 Umlaute verloren gingen |
| `53-kettenluecke.md` | Warum fünf Kettenschritte nie liefen, und die Prüfung, die es künftig meldet |
| `54-nutrition-schema-abgleich.md` | Nutrition-Schema: was `SPEC_06` fordert, was gebaut ist, wo es auseinandergeht |
| `31-migrations-rueckbau.md` | Warum migrations/ nur drei Schema-Slices führt und die Kette die Wahrheit ist |
| `32-encoding-schaeden.md` | **Vier Encoding-Varianten** — umschriebene Umlaute, 704 Fragezeichen, doppelte Kodierung, UTF-16. Und warum es dreimal wiederkam |
| `33-pipeline-verifikation.md` | Verifikationslauf der Aufbaukette |
| `34-design-bestandsaufnahme.md` | Design — was vor Theme V1 vorhanden war |
| `38-cookie-bereich.md` | Cookie-Bereich über Apps hinweg, getrennte Sitzungen |
| `39-rueckleitadressen.md` | Rückleitadressen und site_url |
| `55-anzeigenamen-einspielen.md` | Wie die 7.140 Anzeigenamen in die Datenbank kamen — Kettenschritte 025 und 026 |
| `56-suchabdeckung.md` | 152 Lebensmittel mit Sollwerten. **Die Gegenprobe zeigt: C-38 hat die breite Abdeckung nicht verbessert** |
| `57-reis-kuration.md` | Reissorten als Suchbegriffe, griechischer Joghurt nach Recherche |
| `58-phonetische-varianten.md` | c/k, f/ph — gemessen, vorbereitet, **nicht gebaut**; wartet auf echte Fehlsuchen |
| `59-suchprotokoll.md` | nutrition.search_events — jede Anfrage, ohne Nutzerkennung |
| `60-nutrition-specs-auswertung.md` | Vier Specs gegen den Ist-Zustand. **docs/specs/Goals/ meldet vollständige Umsetzung für ein Modul, das hier nicht existiert** |
| `61-referenzwerte.md` | 165 Referenzwerte über alle 138 Codes. Erst abgebrochen, dann aus EFSA und US DRI gebaut |
| `62-lebensmittel-tags.md` | NOVA statt processed_food, Allergene umgekehrt markiert — **enthält Nüsse ist belegbar, enthält keine nicht** |
| `63-suchlaufzeit.md` | 494 auf 234 ms. **Der Index, um den es zwei Tage ging, existierte gar nicht** |
| `64-training-wortschatz.md` | Training hat dasselbe Wortschatzproblem — **3 von 34 Sollwerten**, diesmal vor dem Bau gemessen |
| `65-tags-und-aliase-einspielen.md` | 17.967 Tags und die Reis-Aliase live |
| `66-eigene-lebensmittel-entwurf.md` | Schema-Entwurf für foods_custom |
| `67-fettsaeuren-verlust.md` | **171.409 Nährwerte einen Tag lang verloren** — und die Prüfung schrieb den Schaden als Sollwert fest |
| `68-theme-faehigkeit.md` | 538 harte Farbwerte in 7 Dateien. **Keine davon benutzt einen Token** — zwei Welten, kein Mischzustand |
| `69-kette-ausfuehrbar.md` | **Es gab keine Kettensteuerung** — nur eine Prosa-Tabelle. Jetzt kette.json und ein Ausführer |
| `70-tagesbilanz-mikros.md` | 24 Mikros mit Fehlzählern. Flach statt JSONB, weil **23 von 24 Codes über 94 % belegt** sind |
| `71-eigene-lebensmittel.md` | foods_custom gebaut, Plausibilitätsprüfung meldet statt zu blockieren |
| `72-profil-und-bewertung.md` | Profil und daily_reference_assessment — **dieselbe Mahlzeit, 72,7 % gegen 50,0 % je nach Geschlecht** |
| `73-parallelstruktur.md` | /v2 neben der alten Oberfläche. **Der Bundle-Hash blieb gleich, als v2.css sich änderte** |
| `74-shell.md` | Sidebar, Topbar, Kontextspalte. **Der Entwurf hat null @media-Regeln** |
| `75-nutrition-oberflaeche.md` | Suche und Tagebuch. **Keine gefüllten Ringe ohne Ziel** — ein zu 68 % gefüllter Ring wäre eine Falschaussage |
| `77-profilpflege.md` | /v2/settings — die sechs Felder, ohne die keine Formel rechnet |
| `78-zielwerte.md` | TDEE und Makros. **Der Vorgänger hat GO-02 viermal verschieden beantwortet** |
| `79-portionen.md` | 23.402 Portionen über 7.048 Lebensmittel — **kategoriebasiert übernommen**, nicht kuriert |
| `80-vorgaengerrepo-fundus.md` | **Wegweiser durch referenz/lumeos-2026/** — 75 Migrationen, 52 Seed-Dateien, Formeln nach Thema. Vor jeder Einstufung als fehlend hier nachsehen |
| `81-tagebuch-schreiben.md` | Der Schreibpfad. **Einfrieren belegt: Lebensmittel auf 999 kcal geändert, Position bleibt bei 348** |
| `82-testdaten.md` | 3 Nutzer, 512 Mahlzeiten, 43 Tage — und **11 Szenariotage mit Register** |
| `83-dashboard.md` | Dashboard nach der Vorlage, 12 Kacheln mit Attrappenmarken |
| `84-hydration.md` | Wasserziel und Tagesdaten. **Getrunkenes und Wasser aus Lebensmitteln getrennt** |
| `85-mikro-uebersicht.md` | Netzdiagramm und Schwellenliste — **16 von 17 am Mangel-Szenariotag** |
| `91-training-mockup.md` | Training nach der Vorlage, 38 Kacheln, **alles Attrappe**. Klärt, wie die vier Vorlagendateien eines Moduls zusammenhängen — und welche Kachel zuerst echte Daten bekommen kann |
| `92-recovery-mockup.md` | Recovery nach der Vorlage, 36 Kacheln, **alles Attrappe** (kein Schema). **Zwei konkurrierende Rahmen — `app.jsx:122` entscheidet, welcher gilt.** Damit drei Muster für Vorlagendateien, und die Prüfung, die sie unterscheidet |
| `94-goals-mockup.md` | Goals nach der Vorlage, 39 Kacheln, alle markiert — **obwohl fünf davon auf `goals.zielwerte_am` passen und sofort echt werden könnten.** Dreistufige Vorlagenkette; `Math.random()` der Vorlage ersetzt, weil es die Hydration bricht |
| `95-supplements-mockup.md` | Supplements nach der Vorlage — der Rahmen und seine **sieben eigenen Tabs**, vier weitere als benannte Luecke. **227 KB Vorlage, viertes Muster: arbeitsteilig statt konkurrierend.** Mit dem, was im Vorgaengerrepo danebenliegt (acht Tabellen, 36 KB Seed, Halbwertszeit) |
| `99-medical-mockup.md` | Medical nach der Vorlage, 21 Kacheln, **alles Attrappe** (kein Schema). **Erste gezählte Vollständigkeit: 56 von 56**, mit wiederholbarem Skript. Fünftes Muster: der Rahmen ruft seine Zulieferer als **blosse Globale** — ein `window.`-Grep findet sie nicht. Plus 457 Laborwert-Synonyme im Vorgängerrepo |
| `102-coach-mockup.md` | Coach nach der Vorlage — **zwei Unterbereiche unter einem Menuepunkt.** `Human Coaches` gebaut und **gezaehlt vollstaendig (60 von 60)**, `AI Coach` offen (41 Posten) und in der Oberflaeche namentlich benannt. **Der Auftrag nannte 11 und 12 Tabs; gezaehlt sind es 10 und 20.** `-gaps.jsx` heisst „gap-closers" und gehoert zu zehn Elfteln dem Portal. Im Vorgaengerrepo liegt **ein fertiges Berechtigungsmodell** — aber mit zwei Stufen statt drei, **ohne Widerrufshistorie**, und mit einem `edit_auto_accept`, das dem Vorschlagsmodell der Vorlage widerspricht |
| `106-ai-coach-mockup.md` | AI Coach (Buddy) nach der Vorlage — **20 Tabs, 42 von 42**, damit sind beide Unterbereiche des Menuepunkts fertig. **Die vermuteten „elf fehlenden Zulieferer" fehlen nicht** — alle fuenfzehn liegen vor, einer davon in einer *Coach*-Datei; die Falle war die `Object.assign`-Zeile, die **nur Daten fuehrt, keine Komponenten**. `uploads/` ist byteweise identisch mit `docs/specs/` — **der Hash unterscheidet Module, nicht Fassungen**. Im Vorgaengerrepo liegen 6 Migrationen und `buddy.ts` mit 1.647 Zeilen, aber **BSS und Voice gibt es dort nicht** — die zwei Tabs sind neu zu bauen, nicht zu uebersetzen |
| `109-medical-anbindung.md` | **Medical zeigt eine Liste statt drei** (G-60) — die Form der Attrappe traegt echte Daten: 37 Marker aus 140 Werten und 5 Befunden, Panelfilter, Verlauf (Glucose 88→102, +15,9 %), Bereichsbalken, Popup. Die zwei Listen aus G-46 sind weg, 20 Marken bleiben. **Die elf Panels der Attrappe gibt es in keiner Quelle** — `loinc_class` gibt vier Gruppen, `panel_type` ist bei 11.421 von 11.676 leer, `panels` haengt Kreatinin in 33 Elternpanels, und das Vorgaengerrepo fuehrt `category` als Probenmaterial. Gebaut ist, was da ist; die Zuordnung ist Toms Entscheidung. **Der Bereichsbestand ist duenner als seine Zeilenzahl:** von 464 Zeilen tragen 54 Zahlen — und genau die schliesst die Lesefunktion aus. Teil I (G-46) haelt Lesepfad, Bereichsvorrang und den Befund fest, dass `tom.seed@example.com` kein Passwort hat |
| `113-ui-reste.md` | **Zwölf gemeldete Punkte abgearbeitet** (G-56) — `shield`/`history`/`file`, `Pill dot`, `Empty`, `v2-g-cols-5`, `InEntwicklungKnopf disabled`, JetBrains Mono. **Die 375-px-Ursache war eine andere als gemeldet:** die Seitenleiste rollt längst, breit war die Kopfzeile (606 px, `overflow: visible`). **Und die früheren 375-px-Messungen (G-40/G-42/G-46) waren nicht belastbar gewonnen** — `goto` setzt das Fenster zurück, eine abgelaufene Sitzung misst die Anmeldemaske. `btn-accent` (G-10) trifft nicht mehr zu, gemessen |
| `101-vollstaendigkeit.md` | **Alle sechs Module gegen die Vorlage gezählt** (G-38), mit verallgemeinertem Skript und belegter Umbenennungstabelle. Fünf von sechs vollständig; offen bleibt Supplements (G-31 — **plus eine neu gefundene Lücke in `SuppCost`**). Sechstes Muster: eine „feste" Formel kann engine-abhängig sein — `Math.sin` brach die Hydration trotz grünem Test. **Enthält eine Korrektur:** die Recovery-Zählung 67/71 war falsch |
| `104-muskelkarte.md` | **Die anatomische Muskelkarte** aus dem Mockup in `packages/ui` (G-26) — 17 Muskelgruppen statt 18 Blobs, drei Module können sie nutzen. 19 Hex-Werte auf Tokens gelegt, **ohne neue zu erfinden**; die vierte Aktivierungsstufe per `color-mix`. Siebtes Muster: **eine fehlende Zuordnung sieht aus wie ein fehlendes Bauteil** — `upper-back` mit Bindestrich wäre beinahe dauerhaft grau geblieben. **Nachtrag G-44:** alle 39 IDs eingeordnet (17 Gruppen · 16 Injektionsorte · 6 Nicht-Muskeln), Test macht eine unzugeordnete zum Fehler. Zwei gemeldete Gestaltungsfragen: **die grauen Teile heben sich um 0,012 Helligkeit ab** — praktisch unsichtbar — und **der Umriss der Vorlage ist kaputt** (118 von 200 Pfadbefehlen fehlerhaft, Kontur endet auf halber Höhe) **Nachtrag G-55:** die drei Ebenen stehen — alle **96 Muskelgruppen aus C-73** fallen auf 17 Flaechen, **gemittelt statt maximiert**, und der Klick trennt wieder auf (Flaeche -> Gruppe -> Muskeln). Sichtbarkeit im Dunkelmodus geloest: `--surface-2` lag 0,030 ueber dem Kartengrund, `--border-strong` liegt 0,155 — kein neuer Token. Achtes Muster: **der Umriss der Vorlage ist toter Code** (`outlinePath` wird nie angehaengt), die volle Figur kommt allein aus `MUSCLES`. Die Check-ins sind angebunden, greifen aber erst, wenn `recovery` in `supabase/config.toml:16` freigegeben ist |
| `47-lebensmittelsuche-stand.md` | **Der erreichte Stand** — fasst 41 bis 46 zusammen |
| `60-legacy-cloud.md` | Was liegt wirklich in der Legacy-Cloud-Instanz? (echte Zeilenzahlen, Medienverweise, Schemakonflikt — ersetzt alle Schätzungen) |
| `50-governance-rest.md` | Was ist vom alten Governance-System übrig und warum? |
| `86-erfassung.md` | Erfassung im Tagebuch — Suche in der Mahlzeitenkarte, Portionswahl, `Same as yesterday`. **Ringe springen ohne Neuladen.** |
| `87-preferences.md` | Lebensmittel-Vorlieben — `food_preferences_read/write`, Zeilenschutz beidseitig. **`hard` ist kein Sicherheitsversprechen** (C-62). |
| `88-i18n.md` | Mehrsprachigkeit mit next-intl, **ohne Sprachpraefix**. 95 Schluessel de/en, Thai vorgesehen. Gate-Pruefung erzwingt Vollstaendigkeit. |
| `89-mahlzeitzeit.md` | `meal_time` in `meals`, UNIQUE-Index entfernt — **mehrere Mahlzeiten je Typ moeglich.** 686 bestehende nachgetragen. |
| `90-datum-und-mahlzeiten.md` | Datumsnavigation `‹ Heute ›` und eine Karte je Mahlzeit. **Drei Stellen rechneten ueber Mitternacht** und waeren an Zeitumstellungstagen gekippt. |
| `93-trainingssitzungen.md` | `workout_sessions`, `workout_exercises`, `workout_sets` — **9 Sitzungen, 60 Saetze live.** Der Uebungsname wird eingefroren. |
| `96-recovery-checkins.md` | `recovery.checkins` — **36 Eintraege, davon 27 ohne HRV.** Der `manual`-Modus ist der Normalfall, nicht die Ausnahme. |
| `97-ziele-und-phasen.md` | `user_goals` und `goal_phases`. **Vier Zielvokabulare aufeinander abgebildet** — als Datendatei, ohne offene Begriffe still zu fuellen. |
| `98-supplements-schema.md` | Fuenf Tabellen, eine Sicht — **44 Katalogeintraege live.** Keine Wechselwirkungsbewertung: das waere eine medizinische Aussage. |
| `100-koerpermessungen.md` | `body_measurements` und `body_circumferences`, **43 Messungen.** Dazu Koerperfett nach Navy **mit Spanne** — 10,31 % (6,81–13,81). |
| `103-biomarker-katalog.md` | **11.676 LOINC-Codes** in acht Dateien, mit Einheit, Klasse und deutschem Namen. Normbereiche liefert LOINC nicht — sie docken spaeter an. |
| `105-medical-schema.md` | `biomarker_catalog`, `lab_reports`, `lab_result_values`. **Der Referenzbereich sitzt am Befund**, der Katalogbereich ist der Rueckfall. |
| `107-laborimport.md` | Zuordnung von Markernamen auf LOINC — **292 Aliase.** Drei Faelle belegt: eindeutig, mehrdeutig, **unbekannt mit Rohtext.** |
| `108-muskelgruppen.md` | Kuration der Muskelgruppen: **107 → 96**, 89 Eltern-Beziehungen — **`exercise_muscles` unveraendert bei 6.624.** |
| `110-datenherkunft.md` | Herkunftsspalten in **sieben Messtabellen**, bevor die Geraete kommen. `meal_items` trennt `food_source` von `measurement_source`. |
| `111-meilensteine-und-tdee.md` | Meilensteine und **adaptive TDEE** — 3.143,2 gegen Formel 3.527,0. **`alpha 0.3` macht den Wert zu 70 % zur Formel** (GO-15). |
| `114-supplements-angebunden.md` | Vier Tabs lesen echt, **14 Kacheln verlieren die Marke** — `Cost` entgegen der Auftragsannahme dabei, weil alle 44 Katalogeintraege Preise fuehren. **`Compliance` braucht 30 Tage und einen Auslasser**, es liegt einer. `refillUrgent` sollte eine Schwelle sein, keine Handmarkierung. |
| `115-training-exercises-tab.md` | **Nicht anbindbar, zwei Sperren:** `training` fehlt in `config.toml` (PGRST106) und `exercises` hat RLS an mit **0 Policies** — 0 Zeilen, waehrend die Nachbartabellen normal lesen. Die Kette definiert die Policy, die Datenbank hat sie verloren. Sonst alles gemessen: **Suche unter 1 ms**, 7 Wurzelgruppen (nicht 12), `Type` hat **keine Quelle**, e1RM nur fuer **6 von 1.416**. |
| `116-goals-anbindung.md` | **Fuenf von zehn Tabs lesen echt** (GO-16), 38 Marken werden 23 — vier Tabs zeigen keine mehr. **Drei Zahlen des Auftrags gelten an einem anderen Tag:** KFA 10,31 % und FFMI 21,97 stammen vom 2026-09-13, weil **26 der 43 Messungen in der Zukunft liegen**; heute sind es 11,38 % und 21,49. **Der adaptive TDEE ist leer und bleibt es**, bis 14 von 14 Zufuhrtagen vollstaendig sind (es sind 13) — die Kachel zeigt die Bedingung statt einer Ersatzzahl, daneben die echte Formel 3.527 kcal. `alpha 0.3` steht jetzt ausgeschrieben da (GO-15 offen). Das feste „Heute" der Vorlage ist raus, `lib/datum.ts` rechnet. **16 Eingabefelder bleiben markiert stehen** — Goals erfasst nicht. |

**Was als Nächstes zu tun ist:** `docs/todo/TODO.md`
**Getroffene Entscheidungen:** `docs/spezifikation/90-entscheidungen/`
(D-06, 2026-08-06: `docs/decisions/` war nie befüllt — `[cmd]` einzige
getrackte Datei dort ist `.gitkeep`. Der Ort ist aufgelöst.)
**Sitzungsübergaben:** `docs/sessions/`

---

## Was hier NICHT steht

- **Produktspezifikation** → `docs/specs/` (13 Module, ~1,5 MB, Zielbild)
- **Design-System** → `docs/design-system/`
- **Historische Brainstorms** → `docs/BrainstormDocs/` (archiviert, keine Referenz)
- **Altlast Governance-Dokumentation** → `docs/_archive/`

---

## Pflege

Diese Dateien werden bei jeder Sitzung aktualisiert, in der sich etwas ändert.
Wer eine Aussage ändert, ändert auch ihren Marker und das Datum im Kopf der Datei.
Eine SSOT ohne Datum ist wertlos.
