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
| `47-lebensmittelsuche-stand.md` | **Der erreichte Stand** — fasst 41 bis 46 zusammen |
| `60-legacy-cloud.md` | Was liegt wirklich in der Legacy-Cloud-Instanz? (echte Zeilenzahlen, Medienverweise, Schemakonflikt — ersetzt alle Schätzungen) |
| `50-governance-rest.md` | Was ist vom alten Governance-System übrig und warum? |

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
