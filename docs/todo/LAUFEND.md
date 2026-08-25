# Was wartet und wem was gehoert

**Was gerade laeuft, steht nicht mehr hier.** Seit 2026-08-23 ist es
aus dem Dateisystem ableitbar: **eine Datei in `docs/auftraege/` ohne
Gegenstueck in `docs/berichte/` ist ein laufender Auftrag.**

`[read]` **Warum die Tabelle weg ist:** Sie war handgepflegt und am
2026-08-23 dreimal falsch — sie fuehrte G-160, G-161 und C-235 als
laufend, obwohl alle drei fertig waren. `[cmd]` Gefunden hat es der
Waechter (`laufend-erledigt`), nicht der Orchestrator. *Regeln, die
berichtet statt erzwungen werden, brechen.*

`[read]` **Was hier bleibt, ist nicht ableitbar:** welcher der offenen
Punkte als Naechstes drankommt, ist eine Priorisierung; wem welcher
Bereich gehoert, ist eine Regel. Aus einem Ordner voller Auftraege folgt
beides nicht.

**Anlass fuer diese Datei (Tom, 2026-08-20):** *,Du hast es nicht mal
mehr im Griff zu wissen, welcher Agent noch laeuft."*

---

## Der Faden: Supplements-Neuaufbau

| Schritt | Stand |
|---|---|
| 1 · Anlegen | **durch** (C-232) — 33 Tabellen, live |
| 2 · Befuellen | **durch** (C-235) — live, nachgemessen |
| 3 · Umhaengen | **durch** (C-243 + C-245) — `im_katalog` 290/276, FK auf `supplements.supplements` |
| 4A · Stack-Pfad | **durch** (C-250) — `git grep supplement_catalog` findet nur noch zwei Kommentare |
| 4B · Substanz-Pfad | **durch** (C-252) — Liste 290 mit Filter, 566 ohne |
| **5 · Alte weg** | **jetzt moeglich.** `supplement_catalog` (44) und `substance_catalog` (566) werden von keinem Lesepfad mehr gebraucht. **Vorher C-253 und C-254**, sonst faellt beim Loeschen auf, was vorher haette auffallen muessen |

`[cmd]` **Stand 2026-08-23 nach C-250 und C-252:** `git grep
supplement_catalog` findet in `lib/supplements/`, `v2/medical/` und
`v2/supplements/` **nur noch zwei Kommentare, keinen Lesezugriff.**

## Kimi

**Tom, 2026-08-25:** *„merk dir dass kimis daten hier liegen."*

    docs/kimi_research/supplement_performance_database/data/   aktuell
    docs/kimi_research/snapshots/                              aelter

`[cmd]` **Beides in `.gitignore`** — Datenquelle, kein Sollwert.
**Lesen, nicht committen.** Was daraus erhoben wurde, steht in
`docs/ssot/95-kimi-bestand.md`.

`[read]` **Der Ort hat am 2026-08-25 gewechselt.** Frueher
`backup/kimi-research/` — dort liegt noch der Stand, gegen den der
Bestandsbericht erhoben wurde. **Wer den aktuellen Lauf braucht, nimmt
den neuen Pfad.**

`[cmd]` **38 Crawls, 10.030 Dateien, 189 MB** — Stand der Erhebung vom
2026-08-23. Darunter `RESEARCH_STATUS.md` (32 KB) mit Kimis eigenem
Uebergabestand und `context_kimiclaw/` mit seiner Betriebsanleitung.

`[read]` **Die Substanzdomaene ist `FROZEN_PENDING_REPO_NEED`** — Kimi
forscht dort nicht weiter, sondern wartet auf uns. `[cmd]` **249 Holds,
davon 66 `REPO_DEPENDENCY`**, und ein Backlog von 17 Punkten, alle mit
`blocked_until_repo_access=true`.


## Wartet auf einen freien Agenten

**Sofort, weil eine Lehre sonst nur notiert bleibt**

| Auftrag | Bereich |
|---|---|
| **G-175** Nachweiskonto ohne bekanntes Passwort — blockiert Browser-Nachweise | `supabase/` |

`[cmd]` **C-253 und C-254 sind durch** (2026-08-23). Beide haben eine
Gate-Pruefung hinterlassen statt eines Merksatzes:
`tools/kataloganker-pruefen.mjs` (3 Ankerstellen, 0 typfalsch) und
`tools/sprachrueckfall-pruefen.mjs` (11 Abfragen auf 14 riskante
Tabellen, 0 ohne Rueckfall). **Damit sind es fuenf Gate-Pruefungen, die
aus einem Fehler entstanden sind.**

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
| **C-244** | `[cmd]` **Substanz oder Form?** Kimi fuehrt sieben Magnesiumsalze und `Vitamin D3 (cholecalciferol)`, der alte Katalog den Sammelnamen. **28 von 28 Eintraegen ohne Gegenpart.** Waehlt der Nutzer *„Magnesium"* oder *„Magnesiumglycinat"*? |
| **C-241** | `[cmd]` Nachweiskonto ohne `meal_plans` und `user_medications`. Soll das so bleiben? |
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

`[cmd]` **Vor jedem neuen Auftrag: hier nachsehen** — wegen der
Bereichstabelle, damit zwei Agenten nicht dieselbe Datei anfassen.

`[cmd]` **Was laeuft, steht in `docs/auftraege/`.** Eine Datei dort ohne
Gegenstueck in `docs/berichte/` ist ein laufender Auftrag. **Nach jedem
Bericht ist nichts mehr zu streichen** — der Zustand aendert sich, indem
der Bericht abgelegt wird.

`[read]` **Und die Nummer wird hier vergeben** — **A-41** haelt fest,
dass 116 bis 119 doppelt belegt waren, weil fuenf Agenten gleichzeitig
die naechste freie Zahl nahmen. `[cmd]` **Der Punkt hiess bis zum
2026-08-21 A-18**; bei der Aufloesung der neun Nummernkollisionen ist
der juengere Eintrag gewandert. `tools/nummern-pruefen.mjs` findet
solche Kollisionen jetzt im Gate — tote Verweise im Fliesstext aber
nicht.
