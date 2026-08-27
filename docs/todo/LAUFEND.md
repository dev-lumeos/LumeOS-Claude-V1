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

## Der Faden: Supplements-Neuaufbau — DURCH

| Schritt | Stand |
|---|---|
| 1 · Anlegen | **durch** (C-232) |
| 2 · Befuellen | **durch** (C-235) |
| 3 · Umhaengen | **durch** (C-243 + C-245) |
| 4A · Stack-Pfad | **durch** (C-250) |
| 4B · Substanz-Pfad | **durch** (C-252) |
| 5 · Alte weg | **durch** (C-255) — `supplement_catalog` und `substance_catalog` existieren nicht mehr, 0 Anhaengsel, 0 Sichten |

`[cmd]` **Stand 2026-08-26:** **412 sichtbare Substanzen**, 596 Zeilen
gesamt, **101 Formen unter ihren Sammelnamen**, 0 sichtbare
Unterformen. **446 Nutzertexte, 1.970 FAQ-Zeilen.**

`[read]` **Der Sprung von 318 auf 412 kam aus C-275** — Kimi hatte 446
Stammdatensaetze geliefert, importiert waren 318. **Testosteron mit
allen acht Estern, sieben Insuline, die HGH-Klasse, PCT, Diuretika,
elf Racetame und rund fuenfzig Pflanzenstoffe fehlten.**

`[cmd]` **Angereichert (C-262, C-270, C-272):** WADA-Geltungsbereich
**320** · Thailand **1.061** · Human-Evidenz 293 · Dosis 290 ·
Studien 43 · PubChem-Konflikte 20 · `entity_transporters` 4.617 ·
`entity_cyp` 3.001.

`[cmd]` **Angezeigt:** sechs bis acht Reiter je Datenlage — Ueberblick,
Dosierung, Sicherheit, Community (49 Substanzen), Rechtslage (345),
Fragen, Quellen.

### Was am Katalog noch offen ist

`[cmd]` **C-274** die 149 unsichtbaren zuordnen, 66 mit sichtbarem
Gegenstueck · **C-287** 148 Community-Zeilen ohne Bindung, **bewusst
nicht geraten**. `[cmd]` **G-200 und G-201 sind seit 2026-08-27
geschlossen** — der Unterschied war ein Zeichenbereich, die fuenf
Einzelwaechter bleiben trotzdem stehen.

---

## Der Faden: Medikamentenkatalog — begonnen

`[cmd]` **498 Wirkstoffe**, ATC bei **490**, dazu **1.799 Zeilen
Enrichment** in fuenf Tabellen: Reproduktion 417 · PK 407 ·
renal/hepatisch 391 · Thailand 477 · klinischer Kontext 107.

`[cmd]` **Was fehlt: die Nutzertexte.** Keine `description`, keine
deutsche Ebene, keine FAQ. **Bei Kimi seit 2026-08-26**, in vier
Bloecken — die drei Sicherheitsfelder zuerst.

`[read]` **Und der Erfassungsweg ist blockiert:** `[cmd]`
`user_medications` speichert `name`, `indication`, `notes` im
**Klartext**. **C-285** — Schluesselverwaltung, dann Leseweg, dann
Schreibweg. `[read]` **Solange das offen ist, feuert keine der 31
Medikamentenregeln**, weil niemand erfassen kann, was er nimmt.



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

### Was Kimi liefert — Stand 2026-08-26

`[cmd]` **Der Substanzkatalog ist durch:** 446 Stammdatensaetze, 446
Nutzertexte dreisprachig, 1.970 FAQ-Zeilen. **446 von 446 verschieden
nach Herausrechnen des Namens.**

`[cmd]` **Laufend: der Medikamentenkatalog**, Welle 1 mit acht
Agenten — 442 CAS · 23 ATC · 81 Reproduktionsdaten · 385 Precautions ·
302 `mechanism_of_action`. **Danach Welle 2: 498 deutsche Nutzertexte
plus FAQ.**

`[read]` **Zwei Befunde von Kimi haben unseren Auftrag halbiert:**
`[cmd]` ATC lag bereits vor — `external_ids.ATC_all` traegt 419, wir
hatten das Top-Level-Feld mit 56 gemessen. **Und die
Reproduktionsdaten lagen seit CRAWL_038 im Enrichment-Layer** (417
Records), waren aber nie importiert.

`[read]` **Beides derselbe Fehler wie bei den Supplements:** die
kanonische Datei gemessen, den Enrichment-Layer uebersehen. **Dort hat
er C-262 und C-270 gekostet, hier C-288.**

`[read]` **Architekturentscheidung dazu:** Kimi hat eine gebuendelte
Exportdatei angeboten. **Abgelehnt** — das additive Prinzip ist
richtig, und zwei Bestaende zusammenzufuehren wuerde die Trennung
aufloesen, die den Vorteil ausmacht. **Wir lesen die
Evidence-Dateien.**




## Wartet auf einen freien Agenten

**Nach Gewicht, nicht nach Nummer**

| Auftrag | Bereich | warum |
|---|---|---|
| **C-285** `user_medications` speichert im Klartext | `supabase/` | **blockiert den ganzen Medikamentenstrang** — ohne Erfassung feuert keine der 31 Regeln |
| **C-274** die 149 unsichtbaren zuordnen | `supabase/` | 66 haben ein sichtbares Gegenstueck |
| **C-287** 148 Community-Zeilen ohne Bindung | `supabase/` | **bewusst nicht geraten** (C-286) — braucht eine Entscheidung, keine Automatik |
| **C-279** Kreuzprodukt in `rule_assessment` | `supabase/` | skaliert mit `intake_logs`, also mit der Nutzungsdauer |
| **C-278** 700 ms zwischen Datenbank und Anwendung | messen | der groessere Posten gegenueber G-190 |
| **C-171** Medical: Symptome, Termine, Dokumente | `apps/web` | **34 Symptome liegen seit C-262 vor** |

`[cmd]` **G-197 und G-198 sind erledigt** (2026-08-26, Claude Code) —
Kontrast 4.32 → 4.58, Farbzuweisungen ausserhalb `tonFuer` 3 → 0.



### Die Gate-Pruefungen, die aus Fehlern entstanden sind

`[read]` **Jede steht fuer einen Fehler, der sonst wiedergekommen
waere** — und die Reihe ist der beste Beleg dafuer, dass ein Merksatz
nicht traegt:

    kataloganker-pruefen.mjs            typfalsche Ankerverweise
    sprachrueckfall-pruefen.mjs         fehlender Sprachrueckfall
    supplement-kennungen-pruefen.mjs    widerspruechliche Kennungen
    supplement-kern-dubletten-pruefen   derselbe Stoff zweimal
    ladekette-pruefen.mjs               sequenzielle Abfragen
    verdrahtung-pruefen.mjs             Namen ohne Test
    texte-pruefen.mjs                   Schablonentexte
    nummern-pruefen.mjs                 Abhaengigkeiten, seit 2026-08-25

`[cmd]` **Acht Pruefungen, alle aus einem konkreten Fehler.**

`[read]` **Der Ausloeser fuer die Ladekette:** dieselbe Lehre stand
bereits einmal in `CLAUDE.md` — *„fuenf Auftraege haben ihn angefasst,
keiner hat es gemessen"*, 7.641 ms auf 144 ms. **Als Merksatz. Er hat
nicht getragen.**

`[read]` **Was seit dem 2026-08-23 geschlossen wurde, steht
vollstaendig in `ERLEDIGT.md`** — mit Datum, Beleg und Begruendung.






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

| | |
|---|---|
| **C-285** | `[cmd]` **Wie werden Medikamente verschluesselt?** `user_medications` speichert `name`, `indication`, `notes` im Klartext. **Schluesselverwaltung ist die erste Frage** — und sie betrifft vermutlich mehr Tabellen als diese eine. |
| **C-287** | `[cmd]` **148 Community-Zeilen ohne Bindung**, darunter alle 30 Mythen und 3 Konzepte. `[read]` Sie betreffen eine **Praxis**, nicht einen Stoff — *„SARMs sind selektiv"* gehoert zu keiner einzelnen Substanz. **Eigener Ort oder Gruppenbindung?** |
| Taxonomie | 59 feine Kategorien neben 23 Filtern — Abnahme offen |

`[cmd]` **Beantwortet und gebaut am 2026-08-26:** der WADA-Geltungs-
bereich steht bei 320 von 320, mit den Ligen namentlich — und
**genauer als meine Vermutung:** die Natural-Ligen fuehren eigene,
weitergehende Sperrlisten mit Sperrfristen bis zehn Jahre. Dazu ein
eigener Reiter *Rechtslage* vor *Quellen*, und **acht Reiter statt
Deckel** mit immer sichtbaren Kacheln in drei Zustaenden.

`[read]` **Toms Begruendung zur Reiterzahl, sie ersetzt meine
Faustregel:** *„lieber acht thematische reiter und das im ueberblick
dass der user auf die schnelle sehen will als 10 kacheln in einem
reiter die niemand liest."*


`[read]` **Toms Begruendung zur Reiterzahl, sie ersetzt meine
Faustregel:** *„lieber acht thematische reiter und das im ueberblick
dass der user auf die schnelle sehen will als 10 kacheln in einem
reiter die niemand liest."*


`[cmd]` **Beantwortet und erledigt:** **C-244** (*„c244 magnesium"* —
Sammelname gewinnt, 101 Unterformen ueber `parent_id`) · **C-242**
(Ursache war der Benennungsschnitt, nicht die Dubletten) · **C-241**
(Nachweiskonto hat seit C-251 eine Einkaufsliste mit 6 echten Posten).

*Anzeige und Daten*

| | |
|---|---|
| **C-223** | `dose_ceiling` als Freitext — wird ueber `supplement_regulatory` loesbar |
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
