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
| **Fable** | *frei* | | |
| **Claude Code** | *frei* | | |
| **Codex** | *frei* | | |
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
| **G-149** Einnahme-Haken bucht auf den Stichtag statt auf heute | `apps/web` |

**Klein und blockierend**

| Auftrag | Bereich |
|---|---|
| **C-175** `shopping_lists` fehlt (ADR-Pflicht) — **blockiert Reorder** | `supabase/` |
| **C-186** Nebenwirkungen und Zyklen ohne Tabelle | `supabase/` |
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

*Anzeige und Daten*

| | |
|---|---|
| **GO-23** | Deckungsgrenze unter 50 % — Vorschlag: dimmen |
| **G-134** | die vier Filtergruppen gibt es in den Daten nicht |
| **G-136** | Ballaststoffe unter Kohlenhydrate, Wasser unter Sonstige |
| **GO-24** | *„Mineralstoffe"* als Gruppenbegriff |
| **G-150** | Volltexttreffer neben Alias-Treffer zeigen? |
| **C-174** | `strong` als dritte Constraint-Stufe (ADR gegen GO-22) |

*Coach und Rechte*

| | |
|---|---|
| **A-43** | Coach-Permissions pro Subfunktion — ADR-Abweichung |
| **T1–T9** | neun Fragen zum Coach-Portal |

*Aeltere Blocker, die dieselbe Art Entscheidung sind*

| | |
|---|---|
| **A-06** | Design-System — shadcn nutzt `rounded-md` fest statt der Token-Radien; ein Theme steuert sie damit nicht. **Betrifft alle sieben Apps.** |
| **A-08** | **Medienort:** Spec nennt Cloudflare R2, der Bestand liegt in Supabase Storage (15 GB). **Kostenfolge, Wechsel bedeutet Transfer.** |
| **E-07** | **186 von 1.448 Uebungen haben weibliche Darstellungen** (13 %). Die Regel ist entschieden (weiblich, sonst maennlich) — **offen bleibt, ob 1.262 nachproduziert werden.** |
| **C-126** | **Soreness-Mittelung:** Wer Kater 3 an einem Muskel meldet, hat nach V/S denselben Wert wie jemand mit Kater 3 an fuenf. **Soll die Zahl der Muskeln mitzaehlen?** |

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
