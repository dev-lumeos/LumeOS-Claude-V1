# C-283 - Medikamentenkatalog und Erfassungsweg

Stand: 2026-08-26

## Ergebnis

Der Katalog-Abbildungsfehler ist behoben und live eingespielt. Der
Erfassungsweg fuer `medical.user_medications` ist **nicht** gebaut:
die Tabelle traegt den Katalog-FK und die RLS-/Coach-Regeln bereits,
speichert sensible Inhalte aber unverschluesselt. Ohne festgelegte
Schluesselverwaltung und einen dazu passenden Leseweg waere ein neuer
Schreibweg ein Klartext-Schreibweg und verletzt die Vorgabe.

## Zahlen: Auftrag gegen Messung

| Feld / Bestand | Auftrag: Ausgangsvermutung | Eigene Messung vor dem Schritt | Nach C-283 live |
|---|---:|---:|---:|
| `medication_active_substances` | 498 | 498 | 498 |
| `atc_code` | 0, `raw.ATC` 498 gefuellt | 0, Quelle tatsaechlich 56 nichtleere Werte | 56 |
| `cas_number` | 0, `raw.CAS` 498 gefuellt | 0, Quelle tatsaechlich 56 nichtleere Werte | 56 |
| `rxnorm_code` | 0, `raw.external_ids` 498 gefuellt | 0, `RxNorm_salt_rxcui` tatsaechlich 113-mal | 113 |
| `unii_code` | 0, `raw.external_ids` 498 gefuellt | 0, Quelle hat `UNII` direkt 420-mal | 420 |
| `routes` | 0 | 0, `routes_of_administration` nichtleer 334-mal | 334 |
| `raw_drug_class` | 0 | 0, `drug_class` nichtleer 498-mal | 498 |
| `raw.pregnancy` | 498 gefuellt | 1 Textwert, 497-mal JSON-`null` | unveraendert |
| `raw.lactation` | 498 gefuellt | 0 Werte, 498-mal JSON-`null` | unveraendert |
| `raw.fertility` | 498 gefuellt | 0 Werte, 498-mal JSON-`null` | unveraendert |
| `user_medications` | 2 | 2 | 2 |
| Medikamenten-Transporter | 4.482 | 4.482 | 4.482 |
| Medikamenten-CYP | 1.890 | 1.890 | 1.890 |

Die abweichenden Messwerte gelten. Ein Wirkstoff mit allen vier externen
Kennungen ATC, CAS, RxNorm und UNII existiert nicht (`0`). Die verlangte
Gegenprobe "vollstaendige external_ids" ist daher nicht moeglich.
Gegenproben: `Allopurinol` hat ATC und CAS, `6-aminocaproic Acid` hat
UNII und Route, `Metformin` hat ATC und CAS. Metformin ist damit im
Katalog korrekt abbildbar, aber nicht vollstaendig extern gekennzeichnet.

## Datenmodell

`283_medication_catalog_mapping.sql` fuegt an
`medical.medication_active_substances` vier strukturtreue JSONB-Spalten
an: `pharmacology` (Objekt), `dosage_models` (Array),
`food_interactions` (Array) und `evidence_provenance` (Objekt). Die
zugehoerigen JSON-Typen sind per CHECK gesichert. Fuellgrade: 498, 56,
11 und 498.

`pregnancy`, `lactation` und `fertility` erhalten keine Leer-Spalten
oder Leer-Tabellen: die Quelle hat keine strukturierte Information, die
dorthin uebernommen werden koennte. `off_label_contexts` ist ebenfalls
in allen 498 Zeilen leer. `salt_or_ester` bleibt an
`medication_formulations`, wohin es fachlich gehoert. Transporter und
CYP sind bereits normalisiert in `supplements.entity_transporters` bzw.
`supplements.entity_cyp`; eine zweite Tabelle waere eine Dublette.

Der Fehler lag im spaeteren 498er-Import
`145_kimi_wave4_medications_rules.ts`: er las unter anderem
kleingeschriebene oder falsche Feldnamen. Er nutzt nun `ATC`, `CAS`,
`RxNorm_salt_rxcui`, `UNII`, `drug_class` und
`routes_of_administration` der gelieferten Form.

## Erfassungsweg und Sicherheit

`medical.user_medications.active_substance_id` zeigt bereits per FK auf
`medical.medication_active_substances(id)`. Alle zwei bestehenden Zeilen
sind verknuepft; es ist kein Freitext-Schema.

RLS ist aktiv. Nutzer duerfen nur eigene Zeilen lesen, anlegen, aendern
und loeschen; die Policy `user_medications_coach_read` verwendet
`coach.hat_sicht(user_id, 'medical', 'full')`. Die echte RLS-Sicht mit
`test-user@lumeos.local` und Rolle `authenticated` lieferte `0` Zeilen.

Die Sicherheit geht jedoch nicht auf: `dose_amount`, `indication`,
`notes`, `physician`, `rx` und `prescription_ref` liegen als Klartext
vor. Es gibt nur `pgcrypto`, keine Verschluesselungsfunktion, keinen
gespeicherten Schluessel und keinen medizinischen Lese-/Schreibvertrag
fuer entschluesselte Daten. Deshalb wurden Anlegen, Aendern und Absetzen
auf dem Testkonto nicht ausgefuehrt. Der geforderte RLS-Nachweis mit
gezaehltem Rueckbau kann erst nach einer Entscheidung zu
Verschluesselung, Schluessel-Lebenszyklus, Leseweg und Coach-Zugriff
gebaut werden.

## Nachweis

- Test zuerst rot: der neue Pruefer meldete die vier fehlenden JSONB-Spalten.
- Kette auf `lumeos_c283_probe`: 117 Schritte; C-283-Pruefer danach gruen.
  Die Wegwerf-Datenbank wurde wieder entfernt.
- Negativprobe: `--expected-atc 57` meldet rot
  `atc_code: 56, erwartet 57`.
- Live: `c283_medication_catalog_pruefen.ts` ist gruen mit den obigen
  Werten.
- Sicherung vor Live: [20260826_172417_c283_vor_live.dump](/D:/GitHub/LumeOS-Claude-V1/backup/vollsicherung/20260826_172417_c283_vor_live.dump)
  samt SQL-Dump. Restore mit `--role=supabase_admin --no-owner
  --no-privileges` ergab `auth_users=7`, Wirkstoffe `498`,
  Nutzermedikationen `2` und Medical-Policies `31`.
- `im_katalog`: Kette `412/0`, live `412/0`
  (Katalogeintraege / sichtbare Unterformen).
- Der allgemeine `schema-vollstaendigkeit-pruefen.ts` lief nach 184
  Sekunden in das Zeitlimit und ist deshalb nicht als gruen gewertet.
  `pnpm gate` wurde nicht erneut gestartet; der Auftrag nennt den
  parallelen G-195-Stand in `apps/web` als bekannte rote Ursache.

## Geaenderte Dateien

- `supabase/migrations/20260826180000_c283_medication_catalog_mapping.sql`
- `supabase/_pipeline/14_medical/283_medication_catalog_mapping.sql`
- `supabase/_pipeline/13_supplements/145_kimi_wave4_medications_rules.ts`
- `supabase/_pipeline/kette.json`
- `supabase/_pipeline/_validierung/c283_medication_catalog_pruefen.ts`
- `backup/c283/` (Live- und RLS-Nachweis)

Kein Commit, kein Push, keine Aenderung unter `apps/`.
