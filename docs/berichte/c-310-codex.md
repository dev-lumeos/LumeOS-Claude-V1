# C-310 - Medikamenten-Identitaetsdubletten erheben

Datum: 2026-08-27
Auftrag: `docs/auftraege/c-310-codex.md`

## Ergebnis

Die drei genannten CAS-Gruppen sind reale, unverbundene
Identitaetsdublettten. Jede Gruppe besteht aus genau zwei Zeilen, die
gegenseitigen Namen fehlen jeweils in `synonyms`, und alle drei Gruppen
haben unterschiedliche ATC-Werte. Es wurde nichts zusammengefuehrt,
geloescht oder geaendert.

Die Regel-Engine erkennt keine Identitaetsschicht: Sie liest Namen,
Klassen und CYP-Profile aus `medical.user_medications` sowie Risikoflags
ueber dessen direkte `active_substance_id`. Damit fuehren die abweichenden
Katalogwerte zu unterschiedlichen Warnvoraussetzungen.

Alle Datenbankabfragen liefen lesend in `lumeos_c310_verify`, einer Kopie
der laufenden Datenbank.

## Zahlen: Auftrag gegen Messung

| Messpunkt | Auftrag | Eigene Messung | Geltend |
|---|---:|---:|---:|
| CAS-Dublettgruppen | 3 genannt | 3 | 3 |
| Zeilen in CAS-Dublettgruppen | 6 impliziert | 6 | 6 |
| Gruppen mit abweichendem ATC | 3 impliziert | 3 | 3 |
| Regeln vom Typ `medication` | 31 | 20 | 20 |
| Regeln mit mindestens einer medizinischen Bedingung | nicht beziffert | 37 | 37 |
| Wirkstoffe ohne CAS | 9, dokumentierte Gruende | 9, dokumentierte Gruende | 9 |

Die Zahl 31 ist im aktuellen `supplements.rule_catalog` nicht
reproduzierbar. Es gibt 20 `rule_type = 'medication'`; weitere 17
`warning`-Regeln enthalten medizinische Bedingungen. Beide Mengen sind
von der nachfolgend beschriebenen Identitaetsluecke betroffen, aber nicht
deckungsgleich.

## CAS-Befund

| CAS | Eintrag A | Eintrag B | ATC A / B | Gegenseitiges Synonym |
|---|---|---|---|---|
| `103-90-2` | `drug_9321661b46` Acetaminophen | `drug_34060417ee` Paracetamol | `["N02AC", "N02AJ", "N02BE", "R01BA", "R05CA"]` / `N02BE01` | nein / nein |
| `59865-13-3` | `drug_658312fcde` Ciclosporin | `drug_839a589ddb` Cyclosporine | `L04AD01` / `["L04AD", "S01XA"]` | nein / nein |
| `8064-90-2` | `drug_fb49962b0e` Sulfamethoxazole / Trimethoprim | `drug_e33c5010fd` Trimethoprim-sulfamethoxazole | `["J01EA", "J01EC", "J01EE"]` / `J01EE01` | nein / nein |

Die neun leeren CAS-Felder sind kein weiterer Dublettenhinweis: acht
sind Kombinationen mit `MIXTURE_NO_SINGLE_CAS`; Protamine Hydrochloride
hat `BIOLOGIC_NO_CAS`. Die Begruendung steht jeweils in der importierten
C-292-Identifier-Provenance.

Die vier geprueften US/EU-Freinamen bestaetigen die Ausgangsvermutung
nur teilweise: `Glyburide` und `Rifampin` sind vorhanden, `Glibenclamide`
und `Rifampicin` fehlen. Von `Epinephrine`/`Adrenaline` sowie
`Meperidine`/`Pethidine` ist keine Seite im Katalog. Das sind Datenluecken,
keine weiteren Zusammenfuehrungsfaelle.

ATC wurde ausschliesslich als Gegenprobe betrachtet, nie als
Zusammenfuehrungskriterium. `G03BA03` liegt tatsaechlich an Testosterone
undecanoate sowie Testosterone enanthate mit unterschiedlichen CAS. Die
weiteren im Auftrag genannten Gegenbeispiele waren in dieser Datenbank
nicht vollstaendig: Nebivolol und Ivabradine fehlen, daher existieren dort
nur Bisoprolol (`C07AB`) beziehungsweise Ranolazine (`C01EB`). Das aendert
nichts an der Regel: Gruppen-ATC ist kein Identitaetsbeweis.

## Abhaengige Inhalte

Jede der sechs Zeilen hat einen eigenen Nutzertext. Die bereinigten
Text-Payloads sind in jeder CAS-Gruppe verschieden. Auch die deutschen
FAQ-Payloads sind nicht identisch; kein einzelner Frage-Antwort-Payload
ueberschneidet sich innerhalb einer Gruppe.

| Paar | Nutzertexte | FAQ A / B | Formulierungen A / B | Produkte A / B |
|---|---:|---:|---:|---:|
| Acetaminophen / Paracetamol | 1 / 1 | 5 / 5 | 1 / 2 | 1 / 2 |
| Ciclosporin / Cyclosporine | 1 / 1 | 5 / 5 | 2 / 1 | 2 / 1 |
| Sulfamethoxazole / Trimethoprim / Trimethoprim-sulfamethoxazole | 1 / 1 | 4 / 6 | 1 / 2 | 1 / 2 |

Produkte haengen folglich an beiden Eintraegen. Eine spaetere
Identitaetsloesung darf diese Kinder weder umhaengen noch ihre Inhalte
vereinheitlichen, ohne Produkt-, Markt- und Formulierungsbezug separat zu
entscheiden.

## Regel-Engine und Warnluecken

`supplements.rule_assessment` bildet `v_med_names` aus dem gespeicherten
Namen in `medical.user_medications`, Klassen und CYP-Profile ebenfalls aus
der eingefrorenen Nutzerzeile. Risikoflags werden hingegen ueber deren
direkte `active_substance_id` aus dem Katalog gelesen. Es gibt weder eine
Alias- noch eine Gruppenauflosung.

Keine der 20 Regeln vom Typ `medication` nennt einen der sechs Namen
direkt. Das Acetaminophen/Paracetamol-Beispiel aus dem Auftrag trifft also
nicht als gegenwaertige `contains_medication`-Regel zu. Die Warnluecke ist
dennoch real, weil die Katalogwerte der Dubletten voneinander abweichen:

| Nur diese Variante liefert die benoetigte Eigenschaft | Betroffene Regel | Auswirkung |
|---|---|---|
| Ciclosporin: `CYP3A4_inhibitor` und `CYP3A4_substrate` | `wr_drug_cyp3a4_inhibition` | Die gegenwaertige Funktion wertet `exclude_same` nicht aus. Dadurch kann nur Ciclosporin beide Praedikate erfuellen; Cyclosporine nicht. |
| Ciclosporin: `CYP3A4_substrate` | `wr_drug_cyp3a4_induction`, `wr_drug_sjw_cyp_med`, `wr_sjw_cyp3a4` | Bei vorhandenem CYP3A4-Induktor beziehungsweise Johanniskraut kann nur Ciclosporin die Substratbedingung erfuellen. |
| Cyclosporine: `bleeding_risk` | `wr_drug_bleeding_stack` | Bei mindestens einem weiteren blutungsfoerdernden Medikament kann nur Cyclosporine den zweiten Zaehlerbeitrag liefern. |
| Sulfamethoxazole / Trimethoprim: `QT_risk` | `wr_drug_qt_stack` | Bei einem weiteren QT-Risikomedikament kann nur diese Schreibweise den zweiten Zaehlerbeitrag liefern. |

Gemeinsame Risikoflags bleiben gemeinsam wirksam: beide Ciclosporin- und
beide TMP-SMX-Varianten haben `hyperkalemia_risk`; die
Hyperkaliaemie-Regeln unterscheiden deshalb nicht. Paracetamol hat
`hepatotoxicity_risk`, Acetaminophen nicht, aber keine aktuelle Regel
wertet dieses Flag aus. Die abweichende Klasse `opioid` bei Acetaminophen
trifft ebenfalls auf keine aktuelle Klassenregel zu.

Dies ist eine statische Regel- und Katalogmessung, keine synthetische
Nutzermedikation: Ein Schreibweg ist laut Auftrag offen. Fuer die fuenf
bedingten Regeln haengt das endgueltige Feuern zusaetzlich von der jeweils
zweiten Bedingung ab. Die Varianten liefern jedoch bereits heute
unterschiedliche notwendige Eingaben und koennen damit eine Warnung
unterdruecken.

## Vorschlag fuer die spaetere Entscheidung

Empfohlen ist eine eigene, evidenzierte Zuordnungstabelle, beispielsweise
`medical.medication_identity_links`, mit beiden vorhandenen
`active_substance_id`-Werten, Beziehungstyp `same_active_moiety`,
Nachweis (hier CAS), Status und einer von Tom entschiedenen kanonischen
Richtung. Sie bewahrt beide Katalogzeilen und alle Kinder, macht die
Verbindung pruefbar und erlaubt fuer Markt- oder Produktfaelle auch eine
bewusst fehlende kanonische Richtung.

`parent_id` wie bei Supplements waere technisch moeglich, erzwingt aber
sofort die fachliche Fuehrungsentscheidung und macht die Beziehung nur
indirekt sichtbar. Ein Eintrag im Array `synonyms` reicht nicht: Er
verbindet keine IDs, kann die abweichenden Sicherheitsfelder nicht
nachvollziehbar behandeln und normalisiert bestehende Nutzerzeilen nicht.

Unabhaengig von der Speicherform muss die Regel-Engine vor dem Aufbau von
Name, Klassen, CYP und Risikoflags die Identitaetsgruppe aufloesen. Bei
konfligierenden Sicherheitsdaten darf sie nicht stillschweigend einen Wert
waehlen: entweder kuratierter kanonischer Sicherheitsdatensatz oder
explizite konservative Vereinigung mit Provenance. Erst danach kann ein
Eintrag als Paracetamol dieselben relevanten Regeln ausloesen wie sein
bestaetigtes Acetaminophen-Aequivalent.

Keine `apps/`-Datei wurde veraendert. Kein Staging, Commit oder Push.
