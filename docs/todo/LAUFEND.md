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
| **Claude Code** | *frei* | — | — |
| **Codex** | *frei* | — | — |
| **Fable** | *frei* | — | — |
| *Kimi* | Dose–Response, Zeitverlauf, Streuung — **Crawl 35 laeuft** | extern, siehe unten | 2026-08-20 |

`[cmd]` **Alle drei Agenten sind frei, Stand 2026-08-23.** G-160, G-161
und C-235 stehen seit dem 2026-08-23 in `ERLEDIGT.md`, mit vom
Orchestrator selbst gemessenen Zahlen. **Der Wachter hat den
Widerspruch gefunden** — `laufend-erledigt` schlug dreimal an, weil
diese Datei die drei noch als laufend fuehrte, nachdem sie geschlossen
waren.

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

## Der Faden: Supplements-Neuaufbau

| Schritt | Stand |
|---|---|
| 1 · Anlegen | **durch** (C-232) — 33 Tabellen, live |
| 2 · Befuellen | **durch** (C-235) — live, vom Orchestrator nachgemessen |
| **3 · Umhaengen** | **blockiert durch C-242** — Entscheidung bei Tom |
| 4 · Lesepfade | wartet auf 3 — `stack-read`, `stack-write`, `substanz-read`, `medical/page.tsx`, `supplements/ansicht.tsx`, `supplements/substanz-detail.tsx` |
| 5 · Alte weg | erst wenn 3 und 4 gemessen sind |

`[cmd]` **Sechs Dateien lesen heute `supplement_catalog`** — das ist der
Umfang von Schritt 4:

    apps/web/src/app/v2/medical/page.tsx
    apps/web/src/app/v2/supplements/ansicht.tsx
    apps/web/src/app/v2/supplements/substanz-detail.tsx
    apps/web/src/lib/supplements/stack-read.ts
    apps/web/src/lib/supplements/stack-write.ts
    apps/web/src/lib/supplements/substanz-read.ts

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

**Nicht beauftragbar, bis C-241 entschieden ist**

| Auftrag | Grund |
|---|---|
| **G-162** medical-Teil | `[cmd]` `user_medications` auf `test-user@lumeos.local` **0** — der Nachweis ist dort nicht fuehrbar |

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

*Supplements — blockieren den Faden*

| | |
|---|---|
| **C-242** | `[cmd]` 13 Namensdubletten, alle `f05` + `lumeos`, beide Seiten leer. **Magnesium und Vitamin D3 sind darunter** und fehlen deshalb in `stack_item_substance_matches`. **Blockiert Schritt 3.** |
| **C-242** (zweiter Teil) | `[cmd]` 276 von 566 Zeilen (48,8 %) ohne Beschreibung und ohne Evidenzgrad. Gehoeren sie in den Katalog? |
| **C-241** | `[cmd]` Nachweiskonto ohne `meal_plans` und `user_medications`. Soll das so bleiben? |
| **G-163** | Die Rueckfallfassungen — bleiben oder fliegen? `[cmd]` `supplements/tabs.tsx` 16, `tab-plans` 8, `tab-prefs` 6, `recovery/tab-messwerte.tsx` 10, `recovery/ansicht.tsx` 5, `recovery/tab-protokolle.tsx` 19, `nutrition/nutrients-entwurf.tsx` 12 **ohne Marke**. `G-171`: sie machen die Markenzaehlung unbrauchbar |
| Taxonomie | 59 feine Kategorien neben 23 Filtern — Abnahme offen |
| **C-223** | `dose_ceiling` als Freitext — wird ueber `supplement_regulatory` loesbar |

*Anzeige und Daten*

| | |
|---|---|
| **GO-23** | Deckungsgrenze unter 50 % — Vorschlag: dimmen |
| **G-134** | die vier Filtergruppen gibt es in den Daten nicht |
| **G-136** | Ballaststoffe unter Kohlenhydrate, Wasser unter Sonstige |
| **GO-24** | *„Mineralstoffe"* als Gruppenbegriff |
| **G-150** | Volltexttreffer neben Alias-Treffer zeigen? |
| **C-174** | `strong` als dritte Constraint-Stufe (ADR gegen GO-22) |
| **C-207** | Vier Cam-Entscheidungen: Speicherweg, Datenschutz je Rechtsraum, Einwilligung, Vision-Modell |
| **C-218** | Zwei Skalen im Recovery-Score |

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
