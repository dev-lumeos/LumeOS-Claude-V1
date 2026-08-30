---
nr: C-205
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/lib/evidenz/registry.ts"]
zahlen: null
---

# C-205 - `research_hold_registry` — 305 Saetze

## Befund

(neu 2026-08-22).

  `[cmd]` **305 Eintraege** als Kuratierungs-Warteschlange. Koennte wie
  `lib/evidenz/registry.ts` (C-180) erzeugt werden statt in die
  Datenbank zu wandern.

## Auftrag — drei Altbestaende messen

**Mitbeauftragt: C-229, G-214.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

`[read]` **Alle drei sind Befunde ohne Messung von heute.** **Die
Erwartung: mindestens einer ist ueberholt** — **am 30.08. waren es
neun von zweiundzwanzig.**

### 1 · C-205 — `research_hold_registry`, 305 Saetze

`[cmd]` **Miss, ob die Tabelle existiert und was sie traegt.**
`[read]` **Und ob irgendetwas sie liest** — A-59 gilt auch fuer
Tabellen.

### 2 · C-229 — der Katalog aus `DatabaseEcht`

`[read]` **Der Punkt nennt Katalog, Detail und *Add*.** `[cmd]`
**Seit G-265 und G-272 ist der Add-Weg neu.** **Miss, was vom Befund
bleibt.**

### 3 · G-214 — die Katalogsuche sagt nicht, warum ein Treffer passt

`[read]` **Miss zuerst, ob die Suche heute eine Begruendung
mitliefert.** `[cmd]` **`food_search` traegt seit C-20 zehn
Sortierwerte und `unsupported_sort`** — **vielleicht gibt es die
Auskunft schon und sie kommt nur nicht an.**

### Was nicht zu tun ist

**Keine deutschen Namen setzen** — C-352 wartet auf Tom.
**Keine ADRs anfassen** — C-357 wartet ebenfalls.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil    erledigt / gebaut / offen / ueberholt
    research_hold          existiert? wird gelesen?
    DatabaseEcht           was bleibt nach G-265/G-272
    Trefferbegruendung     gibt es sie, kommt sie an?

## Bericht

**Nachgemessen am 2026-08-30.** Alle drei Altbestaende sind gegen den
laufenden Datenbankstand und die heutigen Leserpfade gemessen. Es wurde
nichts in `apps/`, am Schema oder an Katalogdaten geaendert.

| Punkt | Urteil | Nachweis |
|---|---|---|
| C-205 | **ueberholt als Tabellenbefund; Datenbestand verwaist** | Eine Tabelle `research_hold_registry` gibt es nicht. Die 305 Saetze liegen als Datensatztyp in `wissen.knowledge_gap_records`; nur der Pipeline-Import schreibt sie, kein Anwendungs- oder Datenbankleser liest sie. |
| C-229 | **ueberholt / gebaut** | Es gibt einen Katalog und einen Add-Weg: beide Navigationswege rendern dieselbe `SubstanzDatenbank`, und Add waehlt/sendet den Stack sichtbar. Die zwei alten Katalogtabellen existieren nicht mehr. |
| G-214 | **offen** | Die Suche filtert im Browser ueber Name, Beschreibung und Zweck, liefert aber keinen Treffergrund mit. Der konkrete fremde Treffer besteht weiter. |

### 1. C-205 - kein `research_hold_registry` als Tabelle

`information_schema` liefert fuer `research_hold_registry` keine Tabelle
und keine Spalten. Der Name bezeichnet heute einen Importdatensatz:
`wissen.knowledge_gap_records` hat genau **305** Zeilen mit
`source = 'kimi:c273'` und `dataset = 'research_hold_registry'`.

| Hold-State im JSON-Rohsatz | Saetze |
|---|---:|
| `RESEARCH_AGAIN_LATER` | 141 |
| `REPO_DEPENDENCY` | 67 |
| `DEAD_END` | 55 |
| `WAIT_FOR_NEW_EVIDENCE` | 42 |
| **gesamt** | **305** |

Jeder Rohsatz hat `entity`, `field`, `hold_state`, `hold_reason`,
`last_attempted` und `resume_condition`; zusaetzliche Kennungen
(`substance_id`, `lab_marker_id`, `relationship_id`, `concept`) haengen
vom Eintrag ab. Die formalen Spalten `hold_category` und
`terminal_status` sind bei allen 305 Zeilen leer: der Import liest
`hold_state` in den JSON-Rohsatz, ordnet ihn aber nicht in diese beiden
Spalten ab.

Der einzige Fund ausserhalb von Dokumentation und Backups ist
`supabase/_pipeline/16_wissen/273c_wissen_lueckenkarten.ts`: Er loescht
die Quelle `kimi:c273` und schreibt die 305 Rohsaetze neu. Es gibt keine
View, keine Funktion und keinen Anwendungsleser auf
`wissen.knowledge_gap_records`; der einzig gefundene Trigger pflegt nur
`updated_at`. Damit ist die Behauptung einer Datenbank-"Tabelle" fuer
den Registry-Namen ueberholt, aber der importierte Bestand selbst ist
heute eine ungelesene Warteschlange.

### 2. C-229 - ein Katalog, Detail und Add getrennt

Die heute gelesene Quelle ist ausschliesslich `supplements.supplements`:
**596** Saetze insgesamt, davon **412** mit `im_katalog = true`.
Alle 412 haben Namen, Unterzeile und einen zugeordneten Nutzertext;
384 haben einen Evidenzgrad. Die sichtbaren Gruppen zaehlen 211
Supplements, 122 Enhanced und 79 Peptide. Weder
`supplements.substance_catalog` noch `supplements.supplement_catalog`
existieren noch.

`catalog` und der alte URL-Weg `database` rendern beide
`SubstanzDatenbank`; `DatabaseEcht` ist nicht mehr ausgeliefert. Die
Liste hat eine Suche, Gruppen/Kategorien, Zeilenklick fuer das Detail
und getrennte `View`-/`Add`-Knoepfe mit `stopPropagation`.

Der Add-Weg ist seit G-272 kein Detailverweis: Er oeffnet den Dialog,
zeigt die eigene Stack-Auswahl, sendet deren `stack_id` an
`/api/supplements/intake?was=position` und der Schreibweg prueft den
Besitz dieses Stacks. Die Katalogzeile reicht ausserdem ihren
Substanz-Anker mit. Der urspruengliche C-229-Befund (drei parallele
Kataloge, Add schreibt still in den aktiven Stack) bleibt daher nicht
bestehen. Einige Quellkommentare nennen noch die alten Zahlen 44/566;
sie werden nicht ausgefuehrt und bilden den heutigen Datenbestand nicht
ab.

### 3. G-214 - die Begruendung kommt nicht an

Die Supplementsuche verwendet **nicht** `nutrition.food_search`:
`food_search` hat keinen Aufrufer im Supplements-Katalog. Sie filtert
die bereits serverseitig geladene Liste im Browser mit `trifftSuche()`
und gibt nur ein Boolean zurueck: erst Name, dann Beschreibung, dann
Zweck. Weder `SubstanzListenEintrag` noch die gerenderte Zeile tragen
`match_reason`, `match_type` oder den treffenden Text. Es gibt deshalb
keine vorhandene Begruendung, die zwischen Datenbank und Anzeige
verlorengeht.

Die Gegenprobe mit der aktuellen Katalogmenge ergibt fuer
`resveratrol` genau zwei Treffer:

| Treffer | Name | Beschreibung | Zweck | sichtbare Begruendung |
|---|---:|---:|---:|---|
| Resveratrol | ja | ja | nein | keine |
| Pterostilbene | nein | **ja** | nein | keine |

Pterostilbene passt nur, weil seine Unterzeile Resveratrol als
verwandten Stoff nennt. Genau der missverstaendliche Fall aus G-214
ist damit noch live. `unsupported_sort` und die zehn Sortierwerte von
`nutrition.food_search` koennen ihn nicht erklaeren, weil diese
Nahrungsmittelfunktion nicht Teil dieses Katalogpfads ist.

## Abnahme

_(vom Orchestrator)_
