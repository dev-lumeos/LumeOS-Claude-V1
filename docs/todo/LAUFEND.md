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
| **Fable** | **G-160** recovery Messwerte an `checkins` | `apps/web` Recovery | 2026-08-23 |
| **Claude Code** | **G-161** nutrition Meal plans an die Daten | `apps/web` Nutrition | 2026-08-23 |
| **Codex** | **C-235** Schritt 2 — die 33 Tabellen befuellen | `supabase/_pipeline/` | 2026-08-23 |
| *Kimi* | Dose–Response, Zeitverlauf, Streuung — **Crawl 35 laeuft** | extern, siehe unten | 2026-08-20 |

`[cmd]` **Wo die Kimi-Ergebnisse liegen** (Tom, 2026-08-22):

    backup/kimi-research/Kimi_Agent/supplement_performance_database/

`[cmd]` **Auf der Platte liegen die Crawls 017 bis 028** als
`lumeos_core_crawl_0NN.tar.gz`, dazu `RESEARCH_STATUS.md` (32 KB),
`SCHEMA.md`, `RULE_ENGINE_SPEC.md` und `substance_groups.json`.

`[read]` **Crawl 35 laeuft, 029 bis 035 sind hier noch nicht
angekommen.** C-185 und C-188 sind gegen **027** gebaut — wer eine
neuere Zahl braucht, holt sie sich nicht aus diesem Ordner, ohne
vorher nachzusehen, was tatsaechlich da ist.

`[read]` **C-164 war zwischenzeitlich faelschlich als laufend
eingetragen** — der Auftragstext ging erst am Abend raus. **Eintragen,
wenn er rausgeht, nicht wenn er geschrieben ist.**

## Wartet auf einen freien Agenten

**Sofort, weil sichtbar falsch**

| Auftrag | Bereich |
|---|---|
| **G-149** Einnahme-Haken bucht auf den Stichtag statt auf heute | `apps/web` |

**Klein und blockierend**

| Auftrag | Bereich |
|---|---|
| **C-186** Nebenwirkungen und Zyklen ohne Tabelle | `supabase/` |

`[read]` **C-175, C-179, G-124, G-126 und C-178 stehen nicht mehr
einzeln hier** — sie sind seit 2026-08-21 in **C-187** gebuendelt und
laufen als ein Auftrag.

**Gross, aber vorbereitet**

| Auftrag | Bereich |
|---|---|
| **C-183** Symptom-Ontologie (21 Records) | `supabase/` |
| **C-176** `biomarkerDetails.ts` (121 KB) | `supabase/` |
| **G-141** Onboarding nach ADR (7 Schritte) | `apps/web` |
| **G-131** Settings, sieben Bereiche | `apps/web` |

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

`[read]` **Zwei Agenten in `apps/web` teilen sich die Browsersitzung** —
das hat am 2026-08-20 dreimal Zeit gekostet. **Ein UI-Agent je Modul.**

---

## Regel

`[cmd]` **Vor jedem neuen Auftrag: hier nachsehen.**
`[cmd]` **Nach jedem Bericht: Zeile streichen.**

`[read]` **Und die Nummer wird hier vergeben** — **A-41** haelt fest,
dass 116 bis 119 doppelt belegt waren, weil fuenf Agenten gleichzeitig
die naechste freie Zahl nahmen. `[cmd]` **Der Punkt hiess bis zum
2026-08-21 A-18**; bei der Aufloesung der neun Nummernkollisionen ist
der juengere Eintrag gewandert. `tools/nummern-pruefen.mjs` findet
solche Kollisionen jetzt im Gate — tote Verweise im Fliesstext aber
nicht.
