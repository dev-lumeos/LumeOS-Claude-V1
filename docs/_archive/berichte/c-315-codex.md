# C-315 - Supplements-C-Punkte: Bestandsaufnahme

Datum: 2026-08-27. Stichtag der DB-Messungen: laufende lokale
`postgres`-Datenbank.

## Ergebnis und Zahlen

`scratchpad/supp-liste.txt` hat tatsaechlich 69 Zeilen, aber nicht 47,
sondern **43 C-Punkte**. Die vier fehlenden C-Punkte stehen in der
Auftragspraemisse nicht in der Liste; ich habe keine Punkte erfunden.

Die Katalogzahl **412 sichtbar** stimmt. Die Folgerung "alle mit
Nutzertext und FAQ" stimmt nicht: 411 von 412 haben jeweils einen
Nutzertext und mindestens eine FAQ. Der fehlende sichtbare Eintrag
`nac` hat zudem keinen deutschen Namen. Alle 412 haben einen
englischen Namen, kein sichtbarer Eintrag einen gefuellten `name_de`.

| Urteil | Zahl |
|---|---:|
| erledigt | 11 |
| teilweise | 19 |
| offen | 9 |
| ueberholt | 2 |
| unklar | 2 |
| geprueft | 43 |

## Je C-Punkt

| Punkt | Urteil | Messbeleg und heutiger Stand |
|---|---|---|
| C-01 | offen | `[cmd]` `node -e` ueber `package.json`: `@dnd-kit/core`, `zustand` und `next-pwa` sind weiterhin alle drei nicht deklariert. |
| C-108 | erledigt | `[cmd]` `SELECT` auf `supplement_interactions`: 78 Zeilen, alle `caution`, 0 `blocks_intake`, 0 Empfehlungen, 0 Medikamentenpartner. Der befuellte Bestand nennt, bewertet oder blockiert nicht. |
| C-113 | teilweise | `[cmd]` `to_regclass` findet `user_supplement_cycles` und `supplement_cycle_events`; die drei sichtbaren Gruppen sind 211 `supplement`, 122 `enhanced`, 79 `peptide`. Planungsstruktur ist da, Injektionsstruktur und der produktseitige Abschluss sind nicht belegt. |
| C-114 | teilweise | `[cmd]` `SELECT` zaehlt 5 `coach.client_permissions` und 37 Coach-Policies. Das neue Rechtefundament existiert; die vier im Punkt genannten Produktentscheidungen sind damit nicht automatisch entschieden. |
| C-115 | unklar | `[cmd]` `rg -l 'CoachRx|My PT Hub|TrueCoach'` findet nur Repo-Dokumente, keine aktuelle, reproduzierbare Marktstichprobe. Fuer ein Urteil ueber Preise und Marktfaehigkeiten waere eine neue externe Recherche noetig. |
| C-116 | ueberholt | `[cmd]` `SELECT count(*) FROM supplements.supplements` ergibt 596 statt 320 Kandidaten; der sichtbare Katalog hat 412 Eintraege. Der 320er Recherchekandidat ist nicht mehr die aktuelle Kataloggrundlage. |
| C-129 | teilweise | `[cmd]` aktuelle Bestandszaehlung: 596 Supplements, 498 Wirkstoffe, 64 Regeln; zugleich 25 Regeln `unsupported_operator` und nur 2 `user_medications`. Import und `missing_input` existieren, der sichere Erfassungs- und Auswertungspfad nicht vollstaendig. |
| C-149 | offen | `[cmd]` `rg -ni 'IU' supabase/_pipeline/13_supplements` findet in Schritt 135 weiterhin den Kommentar, dass offene IU/DFE-Faelle bewusst offen bleiben; kein zentraler Vitamin-D-IU-zu-ug-Umrechnungsweg ist gefunden. |
| C-163 | offen | `[cmd]` `SELECT count(*) FROM supplements.supplement_nutrients` ergibt weiterhin nur 17 Nährstoffbruecken. Die 94er Zahl ist wegen des inzwischen 596er Bestands veraltet, die Etikettmengen-Luecke besteht. |
| C-173 | teilweise | `[cmd]` `SELECT count(*) FROM wissen.product_entities` ergibt 353; Katalog-Evidenz ist vorhanden, aber kein nachgewiesener Marketplace-Lesepfad verbindet Produkte mit Stack und Evidenz. |
| C-186 | teilweise | `[cmd]` `to_regclass` findet beide Zyklustabellen, aber nicht `medical.user_symptom_logs`; der Symptomkatalog `medical.symptoms` existiert. Zyklen sind strukturell angelegt, Symptomprotokolle fehlen. |
| C-195 | erledigt | `[cmd]` `information_schema.tables` zaehlt 56 Tabellen im Schema `supplements`; die getrennten Fakten liegen u. a. in `supplement_safety` 290, `supplement_pharmacology` 566, `supplement_dosing` 596 und `supplement_identifiers` 1.226 Zeilen. Die alte 130-von-146-Spalten-Praemisse ist durch den normalisierten Aufbau ersetzt. |
| C-196 | teilweise | `[cmd]` die alten 290 sind ueberholt: 596 Katalogzeilen, 412 sichtbar. Die Kernimporte stehen, aber nur 411 sichtbare Nutzertext-/FAQ-Beziehungen und 149 `f05_substance_candidate`-Zeilen zeigen einen Restbestand. |
| C-202 | teilweise | `[cmd]` `wissen.product_entities` hat 353 Zeilen; `information_schema` findet dort keine eigene Marken- oder Herstellertabelle. Produkte wurden aufgenommen, das im Punkt geforderte vollstaendige Produkt-/Marken-/Herstellermodell nicht. |
| C-206 | teilweise | `[cmd]` `wissen.community_records` hat 1.033 Zeilen, `supplements.community_anzeige` 212. Die Admin-Datenebene ist gebaut; die Entscheidung ueber eine Nutzersicht ist nicht aus einer Datenzeile ableitbar. |
| C-207 | offen | `[cmd]` `rg -l 'object-store|PDPA|vision_model|vision model' supabase/_pipeline` findet keine Umsetzungsentscheidung. Speicherweg, Rechtsraum-Aufbewahrung, Einwilligungsfuehrung und Vision-Modell bleiben offen. |
| C-208 | erledigt | `[cmd]` aktuelle Tabelle: 596 Supplements, 498 Wirkstoffe, 453 Formulierungen, 448 Produkte. Die Praemisse "Import steht aus" ist widerlegt. |
| C-218 | teilweise | `[cmd]` `rg` findet DB-seitig `manual_v2_c215` und `training_load_points = 0`, aber im Frontend weiter `GEWICHTE.trainingslast = 15`. Die alte Abweichung ist reduziert, die Skalenentscheidung zwischen beiden Seiten nicht geschlossen. |
| C-219 | teilweise | `[cmd]` `to_regclass` findet `medical.symptoms`, beide Supplement-Zyklustabellen, Settings und Templates; 15 der im Punkt genannten Recovery-/Trainingstabellen fehlen weiterhin, darunter `recovery.protocols` und `training.volume_landmarks`. |
| C-221 | ueberholt | `[cmd]` `SELECT count(*) FROM supplements.supplement_interactions` ergibt 78 statt 0. Die Tabelle ist nicht mehr die im Punkt beschriebene leere tote Spec-Tabelle. |
| C-222 | erledigt | `[cmd]` `supplements.supplement_monitoring` existiert und hat 46 Zeilen. Die fruehere Spaltenforderung ist durch eine eigene, strukturierte Tabelle geloest. |
| C-223 | erledigt | `[cmd]` `supplement_warnings` hat 290 Eintraege, 32 `dose_ceiling`-JSON-Objekte. Das problematische flache `numeric`-Modell wurde nicht fortgeschrieben. |
| C-228 | erledigt | `[cmd]` drei Gruppen und 23 Kategorien; 0 der 412 sichtbaren Eintraege fehlen Gruppe oder Kategorie. Die alte 566er Zahl ist heute 596 gesamt beziehungsweise 412 sichtbar. |
| C-229 | unklar | `[cmd]` `rg -l 'DatabaseEcht|SubstanzKatalogKarte' apps/web` findet weiterhin beide Oberflaechenpfade. Wegen paralleler Arbeit in `apps/web` wurde keine Browser-Abnahme des geforderten einen Katalogs gemacht; diese muss nach G-212 erfolgen. |
| C-232 | erledigt | `[cmd]` das Schema `supplements` hat 56 Tabellen, darunter die 26-Tabellen-Struktur aus dem Neuaufbau plus nachfolgende Fakten- und Nutzerstrukturen. Die Struktur ist nicht mehr nur anzulegen. |
| C-233 | teilweise | `[cmd]` `supplements.user_supplement_settings` existiert, hat aber 0 Zeilen und keine `enhanced_mode`-Spalte. Allgemeine Settings sind gebaut, die im Punkt beschriebene Enhanced-Entscheidung nicht. |
| C-234 | offen | `[cmd]` `rg` findet in `136_supplements_neuaufbau.sql` weiterhin `TODO(C-234): marketplace_product_id in user_supplement_cycles`. Die Referenz ist explizit offen, nicht erledigt. |
| C-237 | offen | `[cmd]` die heutige Kimi-Quelle `supplements.jsonl` hat 243 Zeilen sowie 215 leere UK- und 167 leere Australia-Rechtslagefelder. Die alte Zahl 331 ist veraltet; die semantische Luecke bleibt. |
| C-242 | erledigt | `[cmd]` 101 Katalogeintraege sind als Unterformen ueber `parent_id` angehaengt, 0 davon sichtbar; eine Abfrage auf gefuellte sichtbare `name_en`-Dubletten ergibt 0 Gruppen. Der alte Namensdublettenblocker ist so nicht mehr vorhanden. |
| C-244 | erledigt | `[cmd]` dieselbe `parent_id`-Messung zeigt 101 zugeordnete Unterformen statt eines unverbundenen 28-zu-28-Schnitts. Der alte Katalogschnitt ist durch die Eltern-/Kindbeziehung ersetzt. |
| C-253 | teilweise | `[cmd]` es gibt 1.541 `substance_aliases` und 178 `substance_alias_matches`; die UUID/Slug-Bruecke ist gebaut. Ein im Punkt verlangter Gate-Waechter fuer Ziel-/Verweistypen wurde in `tools/` nicht gefunden. |
| C-257 | teilweise | `[cmd]` sichtbare Abdeckung: 411 von 412 mit Nutzertext und FAQ, 1.808 FAQ-Zeilen. Schema und Befuellung sind weitgehend da, aber der fehlende sichtbare `nac` verhindert `erledigt`. |
| C-258 | teilweise | `[cmd]` es gibt 411 verschiedene sichtbare Kurztexte und 1.808 verschiedene sichtbare FAQ-Antworten statt 98 beziehungsweise 3. Die Schablonenpraemisse ist geloest; dieselbe eine fehlende sichtbare Text-/FAQ-Beziehung bleibt. |
| C-259 | teilweise | `[cmd]` die Daten sind umfangreich in die DB uebernommen, etwa CYP 3.001, Transporter 4.617 und 596 Dosis-/Evidenzzeilen; zugleich lesen noch 11 Kettenschritte den alten Kimi-Pfad. Die Bestandsaufnahme wirkte, ist aber nicht vollstaendig konsolidiert. |
| C-261 | offen | `[cmd]` `rg -n '330397|mismatch_dimensions|_baseline_hashes|C-261' tools supabase/_pipeline` findet keinen gefilterten Vergleichslauf. Der im Punkt beschriebene Rohabgleich ist weiter nicht in einen nutzbaren Sachvergleich ueberfuehrt. |
| C-272 | teilweise | `[cmd]` Welle-1-Ergebnis ist vorhanden: WADA 337, Studien 43, Transporter 4.617, CYP 3.001, Monitoring 46 und PubChem-Konflikte. Die frueheren Zielzahlen 446+318 beziehungsweise etwa 1.000 sind keine heutige vollstaendige Abnahme; mehrere Werte weichen ab. |
| C-274 | teilweise | `[cmd]` 412 von 596 sind sichtbar, 101 weitere sind bewusst Unterformen; zugleich verbleiben 149 `f05_substance_candidate`-Zeilen. Die 248er Ausgangszahl ist ueberholt, die restliche Zuordnung ist nicht vollstaendig abgeschlossen. |
| C-279 | teilweise | `[cmd]` `dev@lumeos.app` hat 360 gegen `test-user@lumeos.local` 24 Einnahmen; `EXPLAIN ANALYZE` fuer `rule_assessment` auf dev liegt bei 125.281 ms, aber weiter mit `temp read/written=2387`. Die 926-ms-Lage ist verbessert, die skalierende Zwischenergebnisarbeit bleibt messbar. |
| C-284 | erledigt | `[cmd]` heutige Wirkstoffabdeckung: 498 Wirkstoffe, ATC 497, CAS 489, UNII 420, Wirkmechanismus 494, Vorsichtsmassnahmen 393, 498 Reproduktionszeilen, 498 Nutzertexte und 2.313 FAQs. Die fruehere praktisch leere Sicherheits- und Kennungsannahme gilt nicht mehr. |
| C-287 | offen | `[cmd]` `community_anzeige` hat exakt 212 Zeilen: 64 mit und 148 ohne `substance_ids`. Die unsichere Bindung wurde zu Recht nicht geraten und ist noch offen. |
| C-295 | offen | `[cmd]` `rg -l` zaehlt 11 Kettenschritte mit `backup/kimi-research/Kimi_Agent` und 9 mit `docs/kimi_research`. Die zwei Quellen bestehen weiter. |
| C-301 | erledigt | `[cmd]` `pg_policies` zeigt noch zwei SELECT-Policies, aber `intake_logs_coach_read` nutzt jetzt die einmalige `user_id IN (SELECT ... client_permissions ...)`-Unterabfrage und keinen `coach.hat_sicht()`-Aufruf. |
| C-313 | teilweise | `[cmd]` `node tools/regel-operatoren-pruefen.mjs` ist gruen bei exakt 25 `unsupported_operator`-Regeln, darunter vier `high`. C-313b macht sie sichtbar; die 14 fehlenden Operatorpfade wurden absichtlich noch nicht implementiert. |

## Abweichende Zahlen, die Folgeauftraege aendern

- C-116: 320 Kandidaten -> 596 Katalogzeilen, 412 sichtbar.
- C-129/C-208: 237 Substanzen und 56 Wirkstoffe -> 596 Supplements,
  498 Wirkstoffe, 453 Formulierungen, 448 Produkte und 64 Regeln.
- C-196/C-228: 290 beziehungsweise 566 -> 596 gesamt, 412 sichtbar.
- C-237: 331 leere Rechtslagefelder -> 382 in der heutigen
  243-Zeilen-Quelle (UK 215, Australia 167).
- C-257/C-258: behauptete volle Abdeckung -> 411 von 412; 867/3
  Schablonen-FAQs -> 1.808/1.808 verschiedene sichtbare Antworten.
- C-272: historische Teilziele sind keine aktuelle Vollabnahme;
  WADA 337, Studien 43, Transporter 4.617 und CYP 3.001 sind der
  aktuelle messbare Stand.
- C-274: 248 unsichtbare Eintraege -> 184 nicht sichtbar, davon 101
  als Unterform; 149 F-05-Kandidaten verbleiben.
- C-279: 926 ms auf dev -> 125.281 ms im heutigen authenticated-Lauf
  auf demselben Konto, bei weiter 360 gegen 24 Einnahmen.
- C-284: ATC 56/CAS 56/Reproduktion praktisch leer -> ATC 497,
  CAS 489, 498 Reproduktionszeilen.

Keine Produkt-, Pipeline-, Datenbank- oder `apps/`-Datei wurde
geaendert. `docs/todo/TODO.md` blieb unveraendert. Nichts wurde
gestaged, committet oder gepusht.
