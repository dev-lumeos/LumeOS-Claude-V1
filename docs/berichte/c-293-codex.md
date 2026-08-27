# C-293 - Medikamenten-Nutzertexte und FAQ

Datum: 2026-08-27  
Auftrag: `docs/auftraege/c-293-codex.md`

## Ausgangsvermutungen und eigene Messung

Die Quelle ist der neue Pfad unter `docs/`, nicht ein `backup/`-Pfad. Sie
wurde ausschliesslich gelesen. Alle 498 `entity_id` loesen direkt und ohne
Namensheuristik auf `medical.medication_active_substances.id` auf.

| Messung | Ausgangsvermutung | Eigene Messung | Geltender Wert |
|---|---:|---:|---:|
| Dateigroesse | 2,7 MB | 2.756.854 Bytes | 2.756.854 Bytes |
| Records / eindeutige IDs | 498 / 498 | 498 / 498 | 498 / 498 |
| unbekannte IDs | 0 | 0 | 0 |
| Felder je Record | 16 | 16 | 16 |
| FAQ-Antworten | 2.313 | 2.313, 3-6 je Wirkstoff | 2.313 |
| `zu_wenig_de` null | 40 | 40 | 40 |
| Median `zu_wenig_de` | 247 Zeichen | 252 Zeichen | 252 Zeichen |
| `mythen_de` null | 115 | 115 | 115 |
| Median `mythen_de` | 200 Zeichen | nicht als einheitlicher Text messbar | strukturiert, siehe unten |
| Quellenangaben / `verified: true` / nicht verifiziert | 1.342 / 193 / 1.149 | 1.342 / 193 / 1.149 | 1.342 / 193 / 1.149 |

Die anderen angegebenen Mediane stimmen, bis auf Rundung, mit der
Quellmessung ueberein: `kurz_was_de` 126,5, `wie_wirkt_de` 281,
`was_bringt_es_de` 326, `zu_viel_de` 296, `wann_wie_de` 280,
`verschreibungspflicht_klartext_de` 218, `absetzen_de` 255 und
`wechselwirkung_alltag_de` 296 Zeichen.

`mythen_de` ist keine einheitliche Textspalte: 260 Werte sind Strings
(Median 308,5 Zeichen), 123 sind Arrays. Von diesen enthalten 73 Arrays
`mythos_de`/`fakt_de`-Objekte und 50 String-Listen. 115 Werte sind JSON
`null`. Ein flaches Textfeld haette diese Struktur verloren; die Spalte ist
daher JSONB.

## Nullbefund

Die Vermutung, die Nullwerte seien durchgehend Aussagen zu Bedarfs- oder
Kurzzeitmitteln, ist widerlegt. Ein konservativer Signaltest auf
`bei Bedarf`, Akut-/Notfallbezug, Kurzzeit und Tage/Wochen in
`wofuer_de`, `wann_wie_de` und `absetzen_de` findet nur 21 von 40 bei
`zu_wenig_de` und 76 von 115 bei `mythen_de`. Das ist kein durchgaengiges
Muster.

Die Quelle hat in keinem der 498 Records ein `missing_reason`-Feld. Die
Nullen bleiben deshalb unveraendert und erhalten in `null_context` je
Nullfeld den Status `not_supplied` mit der faktischen Begruendung, dass die
Quelle keinen Missing-Grund liefert und keine sichere klinische Inferenz
moeglich ist. Es gibt 155 solcher Kontexteintraege; 11 Wirkstoffe haben beide
Nullfelder. Damit ist die Luecke sichtbar und nicht als fachliche Aussage
umgedeutet.

## Umsetzung

- Neue deploybare Strukturmigration:
  `supabase/migrations/20260827024026_c293_medication_user_texts.sql`.
  Sie enthaelt ausschliesslich Tabellen, Constraints, Index, RLS, Grants,
  Policies und Trigger; der Migrationswaechter ist gruen.
- Neuer Kettenschritt `293` mit derselben Struktur und neuer Datenstep
  `293a` unter `supabase/_pipeline/14_medical/`. Das entspricht der
  festgelegten Trennung Struktur in Migration/Kette, Daten nur in der Kette.
- `medical.medication_user_texts` ist eins zu eins an den Wirkstoff
  gebunden; `medical.medication_faq` ist eins zu n mit stabiler
  `sort_order`. Beide haben `_de`, `_en`, `_th`; nur `_de` ist befuellt.
  Die fuenf supplement-spezifischen Felder wurden nicht uebernommen.
- Beide Tabellen behalten `sources` je Zeile, einschliesslich des
  unveraenderten `verified`-Status, und sind fuer `authenticated` lesbar;
  `service_role` hat die Katalog-Schreibrechte.
- Die neuen Mindestwerte 498 und 2.313 sowie RLS-, Policy-, Grant- und
  FK-Erwartungen stehen in `schema-sollstand.json`.

## Content-QA

| Pruefung | Ergebnis |
|---|---:|
| verschiedene `kurz_was_de` nach Namensbereinigung | 498 von 498 |
| verschiedene FAQ-Antworten | 2.313 von 2.313 |
| bestaetigte Kontaminationstreffer | 0 |
| automatische exakte Fremdnamens-Treffer | 642 |

Die 642 Namens-Treffer sind keine Kopierkontamination: 207 stehen im
expliziten Wechselwirkungsfeld, 169 in FAQ-Antworten und 266 in
Vergleichen, Gegenmitteln, Kombinationen oder Kontraindikationen der anderen
Felder. Die 18 Treffer in `kurz_was_de` sind ebenfalls erklaerbare
Wirkstoffbeziehungen, etwa Acetaminophen/Paracetamol,
Albuterol/Salbutamol, Sacubitril/Valsartan oder
Idarucizumab/Dabigatran. Es gibt damit keine bestaetigten Treffer einzeln zu
nennen; kein Text wurde veraendert.

Die 20-Punkte-Faktikprobe verglich ATC, C-292-Wirkmechanismus und C-292-
Precautions mit den importierten Texten: Pramipexole Dihydrochloride, Insulin
glargine, Dolutegravir, Mercaptopurine, Lacosamide, Linagliptin, Isosorbide
Mononitrate, Pravastatin, Sunitinib, Losartan, Ropinirole Hydrochloride,
Procainamide Hydrochloride, Verapamil, Probenecid, Naltrexone Hydrochloride,
Varenicline, Mexiletine Hydrochloride, Acetazolamide, Tizanidine
Hydrochloride und Baricitinib. Ergebnis: 20 von 20 Wirkmechanismen und
ATC-gebundenen Identitaeten konsistent, 0 Abweichungen. Bei Losartan,
Pravastatin und Verapamil war `precautions` in C-292 selbst leer; dort war
nur eine Widerspruchspruefung, keine Vollstaendigkeitsaussage moeglich.

## Nachweis

Der frische 122-Schritte-Kettenlauf in `lumeos_c293_verify` war gruen
(136,6 Sekunden). Die Abschlusspruefung meldete 33/33 Tabellen mit RLS,
Policies und Grants sowie die neuen Mindestwerte gruen. Vor der
Live-Einspielung entstand die Vollsicherung
`backup/c293/20260827025700_c293_vor_live.dump` (24.251.708 Bytes).

| Tabelle | frische Kette | Live | zeitstempelfreier Inhalts-Hash |
|---|---:|---:|---|
| `medical.medication_user_texts` | 498 | 498 | `0ffa16f6babb3ba692ca0dbe55f43cac` |
| `medical.medication_faq` | 2.313 | 2.313 | `ce2d55c90348fcd40b58ede8a0fd53d9` |

Die Live-Abschlusspruefung ist vollstaendig gruen. Die RLS-Probe mit
`SET LOCAL ROLE authenticated` liest 498 Textzeilen und 2.313 FAQ-Zeilen.

Die Negativprobe verwendete ein temporaeres 121-Schritte-Manifest ohne
`293a`. Die Struktur aus `293` entstand, die Daten blieben aber leer; die
Abschlusspruefung brach erwartungsgemaess mit Exit 1 an den neuen
Mindestwerten ab. Damit wird ein uebersprungener Datenstep erkannt.

## Abgrenzung und offene externe Pruefung

Keine `apps/`-Datei, keine `drug_class`-Tags, keine bestehenden elf
Kettenschritte und kein `user_medications`-Schreibweg wurden angefasst. Kein
Commit, Staging oder Push.

`kette-readme-pruefen.ts` meldet weiterhin 36 README/Ketten-Abweichungen:
34 bereits vorhandene sowie die neuen Schritte 293 und 293a. Die alte
Kettendokumentation ist nicht Teil dieses Auftrags und wurde nicht passend
gemacht.
