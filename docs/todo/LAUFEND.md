# Wer arbeitet gerade woran

**Diese Datei ist die Wahrheit ueber laufende Auftraege.**
Der Orchestrator traegt sie ein, wenn ein Auftrag rausgeht, und
streicht sie, wenn der Bericht eintrifft.

**Anlass (Tom, 2026-08-20):** *,Du hast es nicht mal mehr im Griff zu
wissen, welcher Agent noch laeuft."*

---

## Laufend

| Agent | Auftrag | Bereich | seit |
|---|---|---|---|
| **Fable** | **G-147** Makroziele, Alias-Suche, Einzelwurzel | `apps/web/v2/nutrition` | 2026-08-20 |
| **Claude Code** | **G-148** Elf Supplements-Modale | `apps/web/v2/supplements` | 2026-08-20 |
| **Codex** | **C-164** `food_search` mit mehreren Tags | `supabase/` | 2026-08-20 |
| *Kimi* | Dose–Response, Zeitverlauf, Streuung | extern | 2026-08-20 |

`[read]` **C-164 war zwischenzeitlich faelschlich als laufend
eingetragen** — der Auftragstext ging erst am Abend raus. **Eintragen,
wenn er rausgeht, nicht wenn er geschrieben ist.**

## Wartet auf einen freien Agenten

**Sofort, weil sichtbar falsch**

| Auftrag | Bereich |
|---|---|
| **G-133** Allergen-Pillen: *„Ohne Laktose 1.021"* statt 6.119 | `apps/web` |
| **G-140** Spalte *„Stufe"* zeigt das Abo-Tier | `apps/web` |

**Klein und blockierend**

| Auftrag | Bereich |
|---|---|
| **C-175** `shopping_lists` fehlt (ADR-Pflicht) | `supabase/` |
| **G-126** drei Reste aus G-122 (CHOL, 28 Texte, Selen) | `supabase/` |
| **C-179** `EAA` zeigt auf Summenwert statt neun | `supabase/` |
| **G-124** zehn Medication-Spalten | `supabase/` |
| **C-178** Prolactin + ApoB in `system_groups` | `supabase/` |

**Gross, aber vorbereitet**

| Auftrag | Bereich |
|---|---|
| **C-180** 181 Evidenz-Konstanten importieren | `supabase/` |
| **C-183** Symptom-Ontologie (21 Records) | `supabase/` |
| **C-176** `biomarkerDetails.ts` (121 KB) | `supabase/` |
| **G-141** Onboarding nach ADR (7 Schritte) | `apps/web` |
| **G-131** Settings, sieben Bereiche | `apps/web` |
| **C-185** Peptide 62→61, vier Identitaetsfehler | `supabase/` |

**Schema-Auftraege aus dem Gesamtabgleich**

| Auftrag | |
|---|---|
| **C-166** Recovery: Schlaf, HRV, Protokolle | 25 Konstanten, 3 Tabellen |
| **C-169** Trainingsplan: Bloecke, Routinen, Deload | |
| **C-171** Medical: Symptome, Termine, Dokumente | vier Tabs fehlen |
| **C-170** Offline-Betrieb | `OUTBOX`, `SYNC_LOG` |
| **C-172** Stress-Tab | sechs Quellen |
| **G-139** Goals: Fortschrittsfotos, Posen | |

**Entscheidungen fuer Tom**

| | |
|---|---|
| **GO-23** Deckungsgrenze unter 50 % | Vorschlag: dimmen |
| **G-134** vier Filtergruppen gibt es nicht | |
| **G-136** zwei Kartenzuordnungen | Ballaststoffe, Wasser |
| **C-174** `strong` als dritte Constraint-Stufe | ADR gegen GO-22 |
| **GO-24** *„Mineralstoffe"* als Gruppenbegriff | |
| **A-37** Coach-Permissions pro Subfunktion | ADR-Abweichung |
| **T1–T9** Coach-Portal | neun Fragen |

## Bereiche, damit nichts kollidiert

| Bereich | wer darf |
|---|---|
| `supabase/_pipeline/` | **nur Codex** |
| `apps/web/src/app/v2/nutrition` | ein Agent zur Zeit |
| `apps/web/src/app/v2/supplements` | ein Agent zur Zeit |
| `apps/coach/` | ein Agent zur Zeit |
| `docs/` | Orchestrator |

`[read]` **Zwei Agenten in `apps/web` teilen sich die Browsersitzung** \u2014
das hat am 2026-08-20 dreimal Zeit gekostet. **Ein UI-Agent je Modul.**

---

## Regel

`[cmd]` **Vor jedem neuen Auftrag: hier nachsehen.**
`[cmd]` **Nach jedem Bericht: Zeile streichen.**

`[read]` **Und die Nummer wird hier vergeben** \u2014 A-18 haelt fest, dass
116 bis 119 doppelt belegt waren, weil fuenf Agenten gleichzeitig die
naechste freie Zahl nahmen.
