# C-286 / C-287 - Codex

Stand: 2026-08-26

## Ergebnis

### C-286: Migration und Kette

Die Ausgangsvermutung war: beide C-283-Dateien existieren mit 3.237 Bytes.
Gemessen: beide Dateien hatten tatsaechlich 3.237 Bytes und anfangs dieselbe
SHA-256 `27548c4de80006210d06d23e75d141ef1a7dfd22bfb4963b7c0c123d1681c5d3`.

Die Gleichheit war jedoch nicht zulaessig. `supabase/README.md` legt fest:
Migrationen enthalten deploybare Struktur, aber keine Daten; die Kette ist die
lokale Wahrheit fuer Seeds und Ableitungen. C-283 enthielt auch einen
datenveraendernden `UPDATE`. Dieser wurde aus
`migrations/20260826180000_c283_medication_catalog_mapping.sql` entfernt.
Die Migration enthaelt jetzt nur Spalten, Constraints und RLS-kompatible
Struktur; `283_medication_catalog_mapping.sql` bleibt der alleinige
Ketten-Backfill. Deshalb ist keine README-Ausnahme und kein Gleichheitswaechter
mehr richtig oder notwendig.

### ATC und Medikamenten-Enrichments

Vorherige Erwartung: `ATC_all` 419, `ATC_level3` 377, echte Luecke 23.
Gemessen im aktiven Katalog: `ATC_all` 419, `ATC_level3` 377, ihre Vereinigung
434. Das bisherige Top-Level-ATC besitzt 56 weitere, disjunkte Werte. Mit der
Prioritaet `external_ids.ATC_all` -> `external_ids.ATC_level3` -> bestehendem
Top-Level-Rueckfall sind 490 von 498 ATC-Codes belegt; 8 bleiben leer. Die
acht IDs sind Bosentan Monohydrate, Calcitonin, Chlorine, Dabigatran,
Mycophenolate, Nicotine Bitartrate, Tenofovir und Tiotropium Bromide
Monohydrate. Damit gelten 490/8 statt der genannten 475/23.

CAS blieb wie erwartet: `external_ids.CAS` ist 0, das Katalogfeld 56.

Die kanonische Reproduktionsdatei hat 417 Records, alle ueber gueltige
`drug_*`-IDs. Belegte, nichtleere Werte: Schwangerschaft 270, Stillzeit 270,
Fertilitaet 274. Die Zahlen 417/270/270/274 stimmen. Die bisherigen
Rohfeld-Zahlen 1/0/0 maessen nur den falschen Layer.

Der neue Schritt `286_medication_enrichments.ts` importiert additiv und
id-basiert in eigene medizinische Tabellen:

| Datei | Quellrecords | Import |
|---|---:|---:|
| reproductive | 417 | 417 |
| PK | 407 | 407 |
| renal/hepatic | 391 | 391 |
| clinical context | 107 | 107 |
| Thailand regulatory | 477 (476 Wirkstoffe + Quellenregister) | 477 |

`pregnancy`, `lactation`, `fertility` und beide Missing-Reason-Objekte liegen
strukturiert in `medical.medication_reproductive_evidence`. Die anderen
fachlich verschiedenen Enrichments haben ebenfalls eigene Medical-Tabellen.
Der alte Fehlimport wurde entfernt: 1.937 PK- und 7.872
Nieren/Leber/Reproduktions-Zeilen lagen zuvor ohne Katalog-FK im
`supplements`-Schema.

Die Tabellen sind Katalogdaten: RLS aktiv, `authenticated` hat nur `SELECT`,
`service_role` die Importrechte. Keine Nutzermedikation wurde angefasst.

### C-287: Community-Zuordnung

Die Ausgangszahlen stimmen: 212 Community-Zeilen, 148 ohne direkte Bindung,
49 von 412 Katalogsubstanzen mit Community-Reiter. Gegenprobe: Trenbolone
acetate 7, LGD-4033 4, Vitamin D3 0.

Es gibt 19 nichtleere Kimi-Klassen. Sicher automatisch zuordenbar sind 0 von
19: Kategorien wie `injizierbare_aas` umfassen 27 Stoffe. Die zwei noch
ungebundenen Nebenwirkungen `aas_injectable` und `aas` wuerden dadurch auch bei
falschen Wirkstoffen erscheinen. Eine Klasse->Kategorie-Automatik wurde daher
nicht gebaut; die verlangte Negativprobe fuer eine falsche Klasse kann ohne
eine erfundene Zuordnung nicht sinnvoll gruen/rot getestet werden.

Alle 30 Science-Delta-Records und alle 3 Usage-Concepts enthalten keine
maschinenlesbare Zielbindung. Sie vermischen einzelne Stoffe, Klassen,
Kombinationen und Praktiken. Auch die Terminologie ist kein Stoffindex: 57 der
71 Begriffe sind ungebunden; die 14 `sub_*`-Links sind Peptidbegriffe, dazu
kommt ein nicht aufloesbarer alter `drug_*`-Link fuer `test base`.
`blast`, `cruise`, `AI`, `SERM` und `19-nor` sind allgemein bzw.
klassenbezogen. Diese Inhalte brauchen eine kuratierte Zielbruecke bzw. ein
eigenes Glossar, nicht eine automatisch gefuellte Substanzsicht.

### Nachweise

- `c286_medication_enrichments_pruefen.ts`: gruen fuer alle obigen Zahlen;
  Negativprobe mit erwarteten 418 Reproduktionsrecords rot.
- `c283_medication_catalog_pruefen.ts`: gruen, ATC-Erwartung auf 490
  korrigiert.
- `im_katalog` live: 412, sichtbare Unterformen 0. Der vor C-286 gemessene
  Kettenstand war ebenfalls 412/0. Ein frischer C-286-Kettenlauf war nicht
  moeglich: Datenbank-Klon per Template scheiterte an 20 aktiven Sessions;
  der anschliessende Dump-Restore an einer nicht setzbaren Server-Option.
  Dies wurde nicht als erfolgreicher Kettennachweis ausgegeben.
- `schema-vollstaendigkeit-pruefen.ts` lief nach 204 Sekunden ins Timeout
  (C-283: 184 Sekunden). Der Timeout besteht also fort und wurde nicht
  uebersprungen.

Keine Apps, Nutzertexte, Regel-Engine, `user_medications`-Schreibweg, Staging,
Commit oder Push wurden angefasst.
