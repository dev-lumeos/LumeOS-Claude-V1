# Abgenommen seit 2026-08-28

**Erzeugt von `tools/ssot-nachtragen.mjs`.** `[read]` **Nicht von
Hand aendern** ? **die Quelle ist `docs/punkte/erledigt/`.**

`[read]` **Diese Datei sagt, WAS abgenommen wurde.** `[read]` **Was
gebaut IST, beschreiben die Modul-Dateien in diesem Ordner** ? **das
bleibt Handarbeit, aber sie hat jetzt eine Grundlage.**

`[cmd]` **Stand: 2026-09-08, 326 Punkte.**

## coach ? 16 Punkte

| Datum | Nr | Titel | Commit |
|---|---|---|---|
| 2026-08-30 | A-36 | `module-stubs-replacement.jsx` traegt drei ganze Module | `f4da9eb5` |
| 2026-08-30 | B-25 | Geteilte Sitzung im Produktbereich prüfen | `f4da9eb5` |
| 2026-08-30 | C-112 | Buddy, Coach und Marketplace — elf Entscheidungen | `f4010501` |
| 2026-08-30 | C-358 | abgelaufene Aktionen bleiben `pending` | `4c10e821` |
| 2026-08-30 | G-277 | der Rechte-Reiter nennt einen Grund, den es nicht gibt | `4c10e821` |
| 2026-08-31 | A-35 | Sieben Module haben keine Seite | `fcd36338` |
| 2026-08-31 | C-318 | ADR-Coach-Permissions weicht von der Umsetzung ab | `fcd36338` |
| 2026-09-01 | C-362 | das Consent-Log ist beschrieben und nicht gebaut | `a598cb88` |
| 2026-09-02 | C-173 | `MARKETPLACE_PRODUCTS` traegt `inStack` und `evidence` | `7a6e77a7` |
| 2026-09-02 | C-381 | die Freigaberegel liegt im Browser | `dddbe5fc` |
| 2026-09-02 | G-151 | Der Ausfuehrer fuer bestaetigte Vorschlaege | `dddbe5fc` |
| 2026-09-02 | G-169 | `coach.checkins` und `checkin_templates` liegen ungelesen | `7a6e77a7` |
| 2026-09-08 | C-268 | Beim Einladen gibt es keine Namensaufloesung | `1d5f8785` |
| 2026-09-08 | C-269 | Eine Einladung laesst sich nicht zuruecknehmen | `0e8cdc8f` |
| 2026-09-08 | G-324 | der Browser ruft den alten Schreibweg | `0e8cdc8f` |
| 2026-09-08 | G-379 | brauchen Originale eine eigene Freigabe? | `OFFEN` |

## goals ? 5 Punkte

| Datum | Nr | Titel | Commit |
|---|---|---|---|
| 2026-09-01 | E-04 | Alte `public`-Tabellen nach `legacy` verschieben | `a598cb88` |
| 2026-09-07 | G-83 | Das Onboarding ist entworfen, aber nicht gebaut | `034a4620` |
| 2026-09-08 | C-425 | die Vorgabe von `priority` faellt durch den CHECK | `9a9a7564` |
| 2026-09-08 | C-432 | der freie Platz fuer ein neues Ziel | `9a9a7564` |
| 2026-09-08 | C-433 | C-432 einspielen | `cf1eae2a` |

## medical ? 15 Punkte

| Datum | Nr | Titel | Commit |
|---|---|---|---|
| 2026-08-28 | C-285 | `user_medications` speichert Medikamente im Klartext | `3c632b05` |
| 2026-08-28 | C-313 | 25 Regeln koennen nicht feuern | `53560696` |
| 2026-08-28 | C-327 | Die Chelationsregel kennt keine Gruppenmitgliedschaft | `8003800e` |
| 2026-08-28 | C-328 | `count_risk_flag_gte` zaehlt Schluessel statt Werte | `53560696` |
| 2026-08-28 | C-331 | C-328 live einspielen und den Durchstich wiederholen | `942e9259` |
| 2026-08-28 | G-218 | kommt die `critical`-Warnung auf den Bildschirm? | `c24b6642` |
| 2026-08-30 | C-209 | Die laufende Instanz wird nach einem Kettenschritt nicht nachgezogen | `f4da9eb5` |
| 2026-09-01 | A-33 | Der Medical-Abgleich, den der Orchestrator nachgeholt hat | `a33ca39c` |
| 2026-09-02 | C-385 | das Datenmodell fuer Injektionsstellen | `f9db161b` |
| 2026-09-08 | C-136 | Medikamente und Conditions brauchen die Coach-Freigabeschicht | `cf1eae2a` |
| 2026-09-08 | C-429 | die zentrale Zeitachse fehlt | `9ef63179` |
| 2026-09-08 | C-431 | C-429 einspielen | `6ba3d57f` |
| 2026-09-08 | G-241 | zwei Reiterschnitte im Medical-Mockup | `10a330e4` |
| 2026-09-08 | G-256 | die Originaldatei zum Laborbericht | `1df88b1d` |
| 2026-09-08 | G-376 | die Medical-Oberflaeche fuer Dokumente | `1df88b1d` |

## nutrition ? 197 Punkte

| Datum | Nr | Titel | Commit |
|---|---|---|---|
| 2026-08-28 | C-149 | Vitamin D in IU gegen µg | `c24b6642` |
| 2026-08-28 | C-334 | die Tagesbewertung hat sich zwischen zwei Messungen verschoben | `0a027544` |
| 2026-08-28 | C-48 | Die Tagesbilanz sichtbar machen | `28f311cd` |
| 2026-08-28 | G-107 | Der Mikronaehrstoff-Trend braucht eine Referenz je Tag | `daf4f7a1` |
| 2026-08-28 | G-112 | Der Food-DB-Filter laesst nur einen Wert zu | `daf4f7a1` |
| 2026-08-28 | G-220 | MealCam Auto-Accept widerspricht ADR_MEALCAM_V1 | `3c632b05` |
| 2026-08-28 | G-221 | Food-Tag-Set V1 widersprüchlich definiert | `5665e43e` |
| 2026-08-28 | G-239 | die Mikronaehrstoff-Ansicht bauen | `3a87eb62` |
| 2026-08-28 | G-245 | die Sortier-Tags bauen | `28f311cd` |
| 2026-08-28 | G-246 | die Detailtexte liegen in der Datenbank und werden nicht gelesen | `8003800e` |
| 2026-08-28 | G-247 | der Zeitraumwechsel braucht eine eigene Funktion | `b3f54031` |
| 2026-08-28 | G-249 | zwei Ansichten zusammenfuehren und den Verlauf als Trend zeigen | `ecc05083` |
| 2026-08-28 | G-70 | Sortierbare Spalten und Herkunfts-Filter im Food-DB-Tab | `daf4f7a1` |
| 2026-08-29 | C-102 | `milch` findet Joghurt statt Milch | `5f8414b0` |
| 2026-08-29 | C-117 | `milch` traegt auch mit Vorlieben nicht | `5f8414b0` |
| 2026-08-29 | C-121 | Die Suche ist langsamer geworden | `5f8414b0` |
| 2026-08-29 | C-175 | `shopping_lists` fehlt | `1a2032b0` |
| 2026-08-29 | C-192 | `p_user_id` kostet in `food_search` das Dreifache | `5f8414b0` |
| 2026-08-29 | C-20 | Treffer am Wortanfang schlägt Treffer in der Wortmitte | `5f8414b0` |
| 2026-08-29 | C-211 | Selen fehlt im BLS-Katalog | `7017e5e3` |
| 2026-08-29 | C-212 | `CHORL` haengt nicht im Naehrstoffbaum | `7017e5e3` |
| 2026-08-29 | C-239 | `meal_plans` kennt keinen Lebenszyklus | `1a2032b0` |
| 2026-08-29 | C-323 | Micro-Flags Warnschwelle und Formulierung festlegen | `370abf3e` |
| 2026-08-29 | C-333 | Selen fehlt in der Bewertung auf dev | `7017e5e3` |
| 2026-08-29 | C-336 | FD traegt den Text eines anderen Naehrstoffs | `101053b9` |
| 2026-08-29 | C-338 | sechs Sortierwerte fehlen live | `5f8414b0` |
| 2026-08-29 | C-344 | drei Obergrenzen gelten nicht fuer Nahrung | `101053b9` |
| 2026-08-29 | C-346 | zwei Detailtexte neu verknuepfen | `7017e5e3` |
| 2026-08-29 | C-347 | generelle Ausschluesse in \`food_search\` | `53670f2b` |
| 2026-08-29 | C-348 | eine zaehlende Funktion fuer die Flags | `1a2032b0` |
| 2026-08-29 | G-108 | Die Filter des Nutrients-Tabs | `7017e5e3` |
| 2026-08-29 | G-11 | Die restlichen Nutrition-Tabs anbinden | `5f8414b0` |
| 2026-08-29 | G-116 | Generelle Ausschluesse bewerten mit 0, statt zu filtern | `7017e5e3` |
| 2026-08-29 | G-137 | Acht Karten — die alten Ansichtsschluessel verfallen | `5f8414b0` |
| 2026-08-29 | G-248 | der Leseweg laedt neun von 35 Fehlzaehlern | `5f8414b0` |
| 2026-08-29 | G-250 | die vier Zustaende fehlen in der Ordnung | `7017e5e3` |
| 2026-08-29 | G-252 | die Ladezeit hat eine andere Ursache | `53670f2b` |
| 2026-08-29 | G-254 | sechs Kacheln brauchen eine Entscheidung | `1a2032b0` |
| 2026-08-29 | G-259 | toter Leseweg und die Fensterlaufzeit | `53670f2b` |
| 2026-08-29 | G-260 | die Dauerregel anbinden | `53670f2b` |
| 2026-08-29 | G-265 | Add im Food DB oeffnet das falsche Modal | `1a2032b0` |
| 2026-08-29 | G-271 | Meal plans und Planner gegen die Quellen halten | `1a2032b0` |
| 2026-08-30 | A-37 | Zwoelf ADRs in `docs/specs/Nutrition/04_adrs/` | `be998f73` |
| 2026-08-30 | C-08 | `services/nutrition-api` — der ADR gilt | `be998f73` |
| 2026-08-30 | C-120 | Drei Sperren in `food_search` | `c7837649` |
| 2026-08-30 | C-160 | Der Bewertungshorizont je Naehrstoff ist leer | `be998f73` |
| 2026-08-30 | C-163 | 94 Substanzen ohne maschinenlesbare Naehrstoffmenge | `7146abc8` |
| 2026-08-30 | C-177 | Thai-Aliase fehlen bewusst | `be998f73` |
| 2026-08-30 | C-191 | `p_user_id` kostet das Dreifache | `c7837649` |
| 2026-08-30 | C-229 | Ein Katalog aus `DatabaseEcht`, Detail und Add getrennt | `7136eabd` |
| 2026-08-30 | C-27 | Alltagswörter ohne Treffer — noch zwei | `c7837649` |
| 2026-08-30 | C-342 | Vitamin A in IE gegen Mikrogramm | `bdecfcfa` |
| 2026-08-30 | C-349 | die Flag-Funktion einspielen | `9ca3e6e9` |
| 2026-08-30 | C-350 | zwei Obergrenzen fuer Magnesium | `9ca3e6e9` |
| 2026-08-30 | C-353 | die erwartete Ersparnis tritt nicht ein | `be998f73` |
| 2026-08-30 | C-355 | `food_search` kennt keine Herkunft | `6d089067` |
| 2026-08-30 | C-356 | woraus die 1.620 ms HTML bestehen | `707cba93` |
| 2026-08-30 | C-49 | Deckungsgrad, Warnungen und Tages-Score — die drei Stufen danach | `f4da9eb5` |
| 2026-08-30 | G-251 | die Herkunfts-Filter im Food-DB-Reiter | `7136eabd` |
| 2026-08-30 | G-258 | Pending actions im Tagebuch | `7136eabd` |
| 2026-08-30 | G-262 | Pre-workout window ist Attrappe | `4c10e821` |
| 2026-08-30 | G-263 | Smart suggestions ist Attrappe | `4c10e821` |
| 2026-08-30 | G-264 | Micronutrient trend steht noch als Attrappe | `6d089067` |
| 2026-08-30 | G-266 | Detailsuche mit Naehrwerten oeffnet eine eigene Seite | `bdecfcfa` |
| 2026-08-30 | G-267 | *New plan* tut nichts | `9ca3e6e9` |
| 2026-08-30 | G-268 | Plaene bearbeiten fehlt | `9ca3e6e9` |
| 2026-08-30 | G-269 | Plaene von Coach und Marketplace | `9ca3e6e9` |
| 2026-08-30 | G-270 | Drei Attrappen im Meal-plans-Reiter | `9ca3e6e9` |
| 2026-08-30 | G-272 | `+ Add` braucht ein Erfassungsmodal | `bdecfcfa` |
| 2026-08-30 | G-273 | den Reiter auf die zaehlende Funktion umstellen | `12ffc1bf` |
| 2026-08-30 | G-274 | der Bestaetigungsweg fuer Plan-Eintraege | `7146abc8` |
| 2026-08-30 | G-276 | MealCam schreibt `confirmation_mode` ohne Fotoweg | `74423655` |
| 2026-08-30 | G-93 | Der Anzeigename fehlt im laufenden Erfassungsdialog | `6d089067` |
| 2026-08-31 | C-29 | Drei Namensschichten und eine Kuration, die den Kettenlauf überlebt | `ea312816` |
| 2026-08-31 | C-324 | Tages-Score Gewichtung festlegen | `45687f24` |
| 2026-08-31 | C-343 | zwei Schreibweisen fuer *,,kein Vitamin C"* | `33a526a3` |
| 2026-08-31 | C-345 | Spurenwerte im Lebensmittelimport | `33a526a3` |
| 2026-08-31 | C-367 | Vitamin A blockiert den Score an allen Tagen | `4dd81ed9` |
| 2026-08-31 | C-369 | was mit einem abgelaufenen Plan geschieht | `ea312816` |
| 2026-08-31 | C-370 | wie entsteht ein eigener Plan? | `18a4e31b` |
| 2026-08-31 | C-372 | Planwochen haben keinen Schreibweg | `18a4e31b` |
| 2026-08-31 | C-376 | frieren abgeschlossene Plaene auch ein? | `0b985fdc` |
| 2026-08-31 | G-226 | V1-Status-Marker fehlen für Recipes/Shopping/MealPlans Components in SPEC_10 | `fcd36338` |
| 2026-08-31 | G-230 | `nutrition.water/page.tsx` und `nutrition.shopping-lists/page.tsx` als separate Pages | `fcd36338` |
| 2026-08-31 | G-235 | `MicroDashboard` Tier-System (Tier 1/2/3) und Subscription-Gates ungeklärt | `fcd36338` |
| 2026-08-31 | G-283 | ein `pro`-Profil faellt still auf 0,90 | `33a526a3` |
| 2026-08-31 | G-285 | `display_tier` heisst im Code weiter *Abo-Gate* | `33a526a3` |
| 2026-08-31 | G-286 | MealPlanDetail — das Tages-Akkordeon fehlt | `023eb511` |
| 2026-08-31 | G-287 | MealPlanCard — die Plan-Liste ist nicht anklickbar | `023eb511` |
| 2026-08-31 | G-288 | Die Einkaufsliste ist eine leere Kachel | `5bb0e056` |
| 2026-08-31 | G-289 | Fünf Rezeptkomponenten fehlen | `5bb0e056` |
| 2026-08-31 | G-290 | Der Aktivierungsdialog mit LifecyclePicker fehlt | `023eb511` |
| 2026-08-31 | G-291 | TrendChart fehlt im Insights-Reiter | `45687f24` |
| 2026-08-31 | G-292 | MicroFlagsList — die Warnungen werden nicht gezeigt | `45687f24` |
| 2026-08-31 | G-293 | MacroDetail — die Fetthierarchie fehlt | `45687f24` |
| 2026-08-31 | G-295 | Die Heatmap wurde entfernt, und die Spec verlangt sie | `45687f24` |
| 2026-08-31 | G-297 | die Tagesdeckung nimmt zu viel Platz | `5bb0e056` |
| 2026-08-31 | G-298 | Plaene lassen sich ansehen, nicht aendern | `4dd81ed9` |
| 2026-08-31 | G-299 | der Planner zeigt eine fremde Woche | `4dd81ed9` |
| 2026-08-31 | G-300 | Lebensmittel lassen sich nicht in einen Plan legen | `5bb0e056` |
| 2026-08-31 | G-301 | der Meal-plans-Reiter folgt keinem Flow | `5bb0e056` |
| 2026-08-31 | G-304 | was ein Nutzer in Plaenen und Rezepten tun kann | `451d3413` |
| 2026-08-31 | G-98 | Meal plans braucht einen Zustand und eine Herkunft | `ea312816` |
| 2026-09-01 | C-368 | fuenfzehn Lebensmittel blockieren den Score | `6c0b84b1` |
| 2026-09-01 | C-371 | `recipes` hat keine Herkunftsspalte | `6c0b84b1` |
| 2026-09-01 | C-373 | der Lebenszyklus wird gespeichert und nie ausgefuehrt | `aae75918` |
| 2026-09-01 | C-374 | `plan_origin` kennt `buddy` nicht | `6c0b84b1` |
| 2026-09-01 | C-375 | ein Flag fuer fremde Plaene und Rezepte | `aae75918` |
| 2026-09-01 | C-377 | ein abgelaufener Plan braucht eine Frage | `aae75918` |
| 2026-09-01 | C-378 | NRF9.3 ist fuer einen normalen Speiseplan nicht rechenbar | `bbefc328` |
| 2026-09-01 | G-306 | der Planeditor verletzt die Immutabilitaet | `aae75918` |
| 2026-09-02 | C-109 | Die Injektions-Grenzwerte sind unbelegt | `c7aac690` |
| 2026-09-02 | C-360 | darf ein fehlender Naehrwert als 0 zaehlen? | `31e5588e` |
| 2026-09-02 | C-366 | `food_tags` hat keinen Pflegeweg | `ae0fb34b` |
| 2026-09-02 | C-380 | die Seed-Plaene tragen 84 mal Hammelfilet | `6992fca2` |
| 2026-09-02 | C-384 | wer schreibt die 30.797 Tag-Zeilen? | `1ab6a431` |
| 2026-09-02 | C-386 | sind die drei Reste aus C-35 eingeflossen? | `1ab6a431` |
| 2026-09-02 | C-387 | vier Kettenschritte schreiben Tags | `77cb7fb6` |
| 2026-09-02 | C-388 | die Vertreterregel ist nicht erreicht | `f86eefbe` |
| 2026-09-02 | C-389 | Saft und Nektar liegen bei der Frucht | `cd07bf99` |
| 2026-09-02 | C-390 | `tag_definitions` hat keine Untergruppe | `77cb7fb6` |
| 2026-09-02 | C-391 | `food_search` hat keinen Treffergrund | `77cb7fb6` |
| 2026-09-02 | C-392 | die Tabelle `meal_slots` | `1360e3c2` |
| 2026-09-02 | C-394 | `test-user` hat keine Slots | `13c12f6f` |
| 2026-09-02 | C-396 | `meal_plans` traegt keine Struktur | `ae0fb34b` |
| 2026-09-02 | C-397 | die gelieferten Plaene haben keine Slots | `cd07bf99` |
| 2026-09-02 | C-398 | - `CAROTPAXB` fehlt an 1.983 Lebensmitteln | `51531f39` |
| 2026-09-02 | C-399 | ein Schnitt ohne einen einzigen Wert | `2796ee5c` |
| 2026-09-02 | C-400 | - eine Woche zuviel im Buddy-Plan | `7dc4073e` |
| 2026-09-02 | C-401 | der Probe-Eintrag und die Laufzeit | `0d63a69f` |
| 2026-09-02 | C-402 | `VITC` fehlt an 39 Tagen | `72b77a4c` |
| 2026-09-02 | C-403 | den `once`-Plaenen fehlen die Wochen | `72b77a4c` |
| 2026-09-02 | G-134 | Die vier Filtergruppen gibt es in den Daten nicht | `8ecaa528` |
| 2026-09-02 | G-136 | Zwei Kartenzuordnungen sind Auslegung | `8ecaa528` |
| 2026-09-02 | G-232 | Quick-Add Makros UI-Component fehlt in SPEC_10 | `d4c6a1be` |
| 2026-09-02 | G-234 | `IntoleranceSelector` und `ReligiousDietarySelector` nur als Onboarding-Components definiert | `d4c6a1be` |
| 2026-09-02 | G-238 | `Plan.source = 'buddy'` in SPEC_10 ohne UI-Trigger | `987e82c7` |
| 2026-09-02 | G-294 | CrossModuleInsights — Goals bekommt nichts | `d4c6a1be` |
| 2026-09-02 | G-302 | die Zielzeile bricht um | `0c70caec` |
| 2026-09-02 | G-305 | vier Sackgassen in Plaenen und Planner | `13c12f6f` |
| 2026-09-02 | G-307 | *Bearbeiten* in der Bibliothek fuehrt nirgendwohin | `69abd8f0` |
| 2026-09-02 | G-309 | der Plan erzeugt keine Eintraege im Tagebuch | `012962d5` |
| 2026-09-02 | G-310 | der Plan-Reiter folgt keinem Mockup | `43e6154e` |
| 2026-09-02 | G-311 | drei Sackgassen im Planner | `69abd8f0` |
| 2026-09-02 | G-313 | der Lifecycle-Test ist rot | `43e6154e` |
| 2026-09-02 | G-314 | die Vorschau fuer nicht-aktive Plaene | `13c12f6f` |
| 2026-09-02 | G-315 | die Kopien sind keine Kopien | `0bf96461` |
| 2026-09-02 | G-316 | *Log deviation* braucht die Posten | `3d5854f7` |
| 2026-09-02 | G-317 | drei Zeilen der Vorlage fehlen am Schirm | `3d5854f7` |
| 2026-09-02 | G-318 | Planner und Diary sehen einander nicht | `3d5854f7` |
| 2026-09-02 | G-319 | die Bedienung in *Alle Plaene* | `3d5854f7` |
| 2026-09-02 | G-320 | die Lebensmittelsuche als Modal | `849568bc` |
| 2026-09-02 | G-321 | drei Befunde am Suchmodal | `e70e1cfe` |
| 2026-09-02 | G-322 | die Bauteile aus `tab-foods.tsx` herausloesen | `6cc890c1` |
| 2026-09-02 | G-323 | vier Suchen ohne die Lehren | `c9d91b1c` |
| 2026-09-02 | G-325 | Zutaten zeigen ihre Makros nicht | `c9d91b1c` |
| 2026-09-02 | G-326 | der Rezepteditor liest sich nicht | `0dfa6788` |
| 2026-09-02 | G-327 | `?plan=` galt in beiden Reitern | `0dfa6788` |
| 2026-09-02 | G-329 | Ghost-Eintraege koennen nur bestaetigen oder auslassen | `eecfede1` |
| 2026-09-02 | G-330 | die Kopfzeile zeigt zwei von vier Werten | `eecfede1` |
| 2026-09-02 | G-331 | vier Suchen auf den Hook umstellen | `13c12f6f` |
| 2026-09-02 | G-332 | die Mahlzeiten benennen und terminieren | `b2d3248d` |
| 2026-09-02 | G-335 | acht Stellen uebersetzen `meal_type` selbst | `b2d3248d` |
| 2026-09-02 | G-336 | das Raster liest `meal_plan_slots` nicht | `9ff2f0ec` |
| 2026-09-02 | G-339 | Quick-Add liest die Namen nicht | `0c70caec` |
| 2026-09-02 | G-341 | die Spalte heisst *vollständig* und meint das Gegenteil | `55f0c8a8` |
| 2026-09-02 | G-72 | Acht Spalten ohne Wirkung und ohne Kachel | `6cc890c1` |
| 2026-09-02 | G-99 | Drei der acht Planner-Spalten bleiben wirkungslos | `6cc890c1` |
| 2026-09-07 | C-35 | Was aus zwei gefallenen Modellen brauchbar bleibt | `a1a818b0` |
| 2026-09-07 | C-379 | `sequence` hat kein Ziel | `ec3fa071` |
| 2026-09-07 | C-404 | `Aufbau-Wochenplan` beschreibt 28 Tage, behauptet 21 | `0a0b8b93` |
| 2026-09-07 | C-405 | *Sonstige* faellt weg | `4b841cca` |
| 2026-09-07 | C-406 | `strong_avoid` an vier Stellen entfernen | `4b841cca` |
| 2026-09-07 | C-407 | der Leseweg fuer Wochenlisten | `f3675133` |
| 2026-09-07 | C-408 | Vorrat nach dem Vorbild von Supplements | `f3675133` |
| 2026-09-07 | C-409 | `nutrition_reorder` ist unerreichbar | `b268640a` |
| 2026-09-07 | C-410 | zwei Leser nehmen `food_tags` statt der Sicht | `9940d6b3` |
| 2026-09-07 | C-411 | Rezeptvorschlaege in der Kuration | `0a0b8b93` |
| 2026-09-07 | C-413 | `tom.seed` traegt `days_count 7` bei 21 Tagen | `a80b4459` |
| 2026-09-07 | G-222 | Onboarding Flow für Nutrition Preferences fehlt in SPEC_03 | `74c42842` |
| 2026-09-07 | G-328 | was zaehlt *am haeufigsten*? | `7759013e` |
| 2026-09-07 | G-333 | `erfassen.tsx` hat keinen Aufrufer | `adff4a07` |
| 2026-09-07 | G-337 | `strong_avoid` hat keinen Schreibweg | `adff4a07` |
| 2026-09-07 | G-340 | Quick-Add hat keinen Schreibweg | `f8893422` |
| 2026-09-07 | G-342 | `nutsettings` hat keinen Aufrufer | `adff4a07` |
| 2026-09-07 | G-343 | Tests messen gegen ueberholte Entwuerfe | `7759013e` |
| 2026-09-07 | G-345 | die Oberflaeche fuer Einkaufslisten | `1450c56b` |
| 2026-09-07 | G-346 | Quick-Add braucht eine Mahlzeit | `de9f4351` |
| 2026-09-07 | G-347 | die Anzeige zieht nach | `1450c56b` |
| 2026-09-07 | G-348 | `wieGestern` ueberspringt manuelle Posten | `dd20f24c` |
| 2026-09-07 | G-350 | ein zweiter Schreibweg fuer `is_checked` | `dd20f24c` |
| 2026-09-07 | G-351 | `other` hat keine Karte | `de9f4351` |
| 2026-09-08 | G-152 | Der Aktivitaetsstrom des Dashboards | `64937c89` |
| 2026-09-08 | G-17 | Datum beim Modulwechsel mitgeben | `b3bb6420` |
| 2026-09-08 | G-338 | eine freie Mahlzeit hat keinen Namen | `b3bb6420` |
| 2026-09-08 | G-344 | Einkaufslisten koennen mehr, als die Spec sagt | `d4d2689a` |
| 2026-09-08 | G-353 | Setup-Karten nach dem Onboarding | `d8b7cc58` |

## quer ? 53 Punkte

| Datum | Nr | Titel | Commit |
|---|---|---|---|
| 2026-08-28 | A-57 | 24 Punkte wurden per Textheuristik geschlossen und sind ungeprueft | `ce10df59` |
| 2026-08-28 | A-58 | der Waechter verlangt ein Feld, das es nicht mehr gibt | `4ceae7eb` |
| 2026-08-28 | G-215 | der Durchstich: kommt eine Warnung beim Nutzer an? | `aa04c004` |
| 2026-08-29 | A-61 | das alte Auftragswesen abloesen | `b91067c0` |
| 2026-08-30 | A-29 | Der Attrappen-Test koennte die gerenderte Seite zaehlen | `851fa077` |
| 2026-08-30 | A-60 | eine `Map` ueber die Client-Grenze kommt leer an | `851fa077` |
| 2026-08-30 | A-62 | Waechter kippen still, wenn das Schema nachkommt | `6d089067` |
| 2026-08-30 | C-205 | `research_hold_registry` — 305 Saetze | `7136eabd` |
| 2026-08-30 | C-354 | eine Lesefunktion fuer offene Coach-Aktionen | `6d089067` |
| 2026-08-30 | C-357 | vier ADRs widersprechen neueren Entscheidungen | `3ff91754` |
| 2026-08-30 | G-278 | die restlichen 222 Abwesenheitsaussagen | `4c10e821` |
| 2026-08-30 | G-280 | der Dev-Server ueberlebt lange Testlaeufe nicht | `f4da9eb5` |
| 2026-08-31 | A-16 | `public/mockup/` als dritten Fundus auswerten | `fcd36338` |
| 2026-08-31 | C-361 | die Datenbank fuehrt keine Pipeline-Historie | `fcd36338` |
| 2026-08-31 | G-284 | die Mockups werden ohne Anmeldung ausgeliefert | `33a526a3` |
| 2026-08-31 | G-296 | das globale `tsc` ist rot wegen `packages/ui` | `5bb0e056` |
| 2026-09-01 | A-22 | Was an Kimi gehen kann — klassifiziert | `cf61b6c4` |
| 2026-09-01 | A-23 | `lint` bricht repoweit ab | `4a2bd5df` |
| 2026-09-01 | B-20 | Codex-Pfadschutz wiederherstellen | `4a2bd5df` |
| 2026-09-01 | G-303 | der Gate prueft `packages/ui` nicht | `6c0b84b1` |
| 2026-09-01 | G-308 | die zwei Pakete brauchen eigene Pruefungen | `6d4a155a` |
| 2026-09-02 | A-68 | der Waechter fuer leerlaufende Agenten | `66eb3824` |
| 2026-09-02 | A-70 | ein Backupsystem statt eines wachsenden Ordners | `4da2c419` |
| 2026-09-02 | C-170 | Der Offline-Betrieb steht im Entwurf | `f38363c5` |
| 2026-09-02 | C-241 | Das Nachweiskonto traegt weder Essensplaene noch Medikamente | `ae0fb34b` |
| 2026-09-02 | C-383 | gehoeren Plaene in `goal_phases`? | `107387fd` |
| 2026-09-02 | C-395 | drei Migrationen tragen Datenlogik | `ae0fb34b` |
| 2026-09-02 | G-312 | neunzehn Lint-Fehler | `43e6154e` |
| 2026-09-02 | G-334 | `test-user` taugt nicht mehr als Nachweiskonto | `ae0fb34b` |
| 2026-09-07 | C-412 | `intake_logs` endet am 19. August | `eff0c27d` |
| 2026-09-07 | C-414 | die Querschnittssicht liegt in `nutrition` | `14bbc565` |
| 2026-09-07 | C-415 | der Vollkettenlauf scheitert in Schritt 075 | `9c9a250d` |
| 2026-09-07 | C-416 | ein taeglicher Kettenlauf | `027a383e` |
| 2026-09-07 | C-417 | der Schirm wird nicht gemessen | `0b19887f` |
| 2026-09-07 | C-418 | der Waechter vergleicht Zeichenketten, nicht Inhalte | `a880e92b` |
| 2026-09-07 | C-419 | das Wallet existiert nicht | `cc54cbbb` |
| 2026-09-07 | C-420 | der Waechter kennt keine Uebersetzung | `cc54cbbb` |
| 2026-09-07 | G-141 | Das Onboarding ist als ADR final entschieden | `e748fbdb` |
| 2026-09-07 | G-352 | drei Zielskalen widersprechen sich | `d5cad642` |
| 2026-09-07 | G-354 | ein sechstes Ziellisten-Modal | `d5cad642` |
| 2026-09-07 | G-355 | Goals und Body gegen alle Quellen pruefen | `a880e92b` |
| 2026-09-07 | G-356 | die Umfangserfassung fehlt | `ec3fa071` |
| 2026-09-07 | G-357 | kein Weg in eine Phase | `ec3fa071` |
| 2026-09-07 | G-358 | 62 Vermerke ohne Grund | `a880e92b` |
| 2026-09-07 | G-359 | 1.343 Mockup-Elemente fehlen in der UI | `a880e92b` |
| 2026-09-07 | G-365 | vier Schritte je Kachel | `a880e92b` |
| 2026-09-07 | G-370 | Unternavigationen vollstaendig pruefen | `259d7d0f` |
| 2026-09-08 | A-71 | der Leseweg liegt daneben | `a47dbb65` |
| 2026-09-08 | C-422 | die Lesewege fuer elf Kacheln | `d40e847e` |
| 2026-09-08 | C-424 | eine Leser-Registry | `a5b1f323` |
| 2026-09-08 | C-430 | die Sicht traegt nur Deutsch | `9ef63179` |
| 2026-09-08 | G-363 | wer schlaegt die naechste Phase vor? | `d40e847e` |
| 2026-09-08 | G-375 | der Tageswechsler gehoert in die Schale | `84bb575f` |

## recovery ? 12 Punkte

| Datum | Nr | Titel | Commit |
|---|---|---|---|
| 2026-08-29 | C-127 | Drei Wearable-Spalten sind leer | `d2f692b2` |
| 2026-08-29 | C-143 | Die zwei Erholungsrechnungen weichen ab | `d2f692b2` |
| 2026-08-29 | C-166 | Recovery hat 3 Tabellen, der Entwurf 25 Konstanten | `d2f692b2` |
| 2026-08-29 | C-168 | Die Uebertrainings-Schwellen stehen im Entwurf | `d2f692b2` |
| 2026-08-29 | C-181 | ACWR wird gerechnet und muss raus | `d2f692b2` |
| 2026-08-29 | C-238 | `meal_plan_entries` hat keinen Status | `1a2032b0` |
| 2026-08-30 | A-50 | Ein `DROP COLUMN` prueft die Lesepfade nicht | `707cba93` |
| 2026-08-30 | G-102 | Zwei SVG-Pfade der Muskelkarte sind abgeschnitten | `707cba93` |
| 2026-09-07 | C-421 | vier Tabellen fuer die 17 Attrappen | `c3067369` |
| 2026-09-07 | G-364 | die Muskelkacheln waren angebunden | `a880e92b` |
| 2026-09-07 | G-367 | Stunden und Saetze je Muskel | `c3067369` |
| 2026-09-07 | G-371 | `modalities` nimmt den Leseweg nicht | `259d7d0f` |

## supplements ? 24 Punkte

| Datum | Nr | Titel | Commit |
|---|---|---|---|
| 2026-08-28 | C-208 | C-129 neu fassen: der Import ist laengst passiert | `6c78603c` |
| 2026-08-28 | C-326 | C-129 auf die verbleibende Luecke neu fassen | `6c78603c` |
| 2026-08-28 | G-240 | der massgebliche Supplements-Mockup ist ungelesen | `0a027544` |
| 2026-08-29 | G-253 | Stacks und Compliance anbinden | `618fa72a` |
| 2026-08-29 | G-255 | drei Attrappen-Konstanten ohne Aufrufer | `101053b9` |
| 2026-08-30 | A-49 | Der Attrappen-Waechter traegt eine veraltete Behauptung | `12ffc1bf` |
| 2026-08-30 | C-202 | Produkte, Marken, Hersteller, Kennungen | `707cba93` |
| 2026-08-30 | C-260 | Die Arbeitsberichte sind nicht in die Daten zurueckgeflossen | `707cba93` |
| 2026-08-30 | C-316 | NAC steht im Katalog ohne deutschen Namen | `12ffc1bf` |
| 2026-08-30 | C-351 | Supplements braucht eine Tagesbilanz | `7146abc8` |
| 2026-08-30 | C-352 | der Katalog hat keine deutschen Namen | `4c10e821` |
| 2026-08-30 | G-202 | der Dublettenpruefer schreibt bei jedem Gate-Lauf | `12ffc1bf` |
| 2026-08-30 | G-214 | die Katalogsuche sagt nicht, warum ein Treffer passt | `851fa077` |
| 2026-08-30 | G-275 | die Supplement-Tagesbilanz anzeigen | `12ffc1bf` |
| 2026-08-30 | G-281 | der Treffergrund in der Katalogsuche | `707cba93` |
| 2026-08-31 | C-364 | die Produktebene ist Wissen, kein Bestand | `023eb511` |
| 2026-08-31 | C-365 | Peptidsequenzen haben kein Ziel im Schema | `023eb511` |
| 2026-09-01 | C-129 | Der Kimi-Import ist da; die Restluecken sind getrennt | `cf61b6c4` |
| 2026-09-01 | C-207 | Vier Entscheidungen aus dem 035-Handoff | `fa117b20` |
| 2026-09-02 | C-393 | `substance_group_memberships` ist leer | `f9db161b` |
| 2026-09-08 | C-423 | `stack_templates` hat null Zeilen | `a47dbb65` |
| 2026-09-08 | G-372 | die Stack-Kachel kann nichts | `994de555` |
| 2026-09-08 | G-373 | Stacks editieren und anlegen | `989500e0` |
| 2026-09-08 | G-374 | Zyklen brauchen eine eigene Eingabe | `9ef63179` |

## training ? 4 Punkte

| Datum | Nr | Titel | Commit |
|---|---|---|---|
| 2026-08-28 | G-216 | Training hat Daten und keinen Schreibweg | `53560696` |
| 2026-08-28 | G-217 | der Trainings-Schreibweg hat keine Oberflaeche | `942e9259` |
| 2026-08-30 | G-173 | Ein falscher Punktverweis in `scores-read.ts` | `851fa077` |
| 2026-09-07 | G-366 | die Uebungsliste der Sitzung | `259d7d0f` |
