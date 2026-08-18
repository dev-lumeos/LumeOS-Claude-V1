# 95 — Supplements als Mockup (G-29)

Stand: 2026-08-17 · Anker: Zweig `dev` · Auftrag G-29
Herkunft: gebaut und geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

Route `/v2/supplements`. `[cmd]` **Es gibt kein `supplements`-Schema**
(`information_schema.schemata` kennt keines) — alles ist Attrappe, jede
Zahl stammt aus der Vorlage.

| Datei | Rolle |
|---|---|
| `daten.ts` | 433 Zeilen, **mechanisch extrahiert** — Stack, Slots, Datenbank, Interaktionen, Extended, Labs |
| `kontext.tsx` | der geteilte Zustand der Vorlage (`SuppCtx`) |
| `tabs.tsx` | die sieben Tabs, die der Rahmen selbst trägt |
| `modale.tsx` | elf Modalarten |
| `ansicht.tsx` | Kopfzeile, elf Tabs, Modalverwaltung |
| `supplements.css` | fünf Modul-Raster |

---

## Wie sich die vier Vorlagendateien zueinander verhalten

`[cmd]` **`app.jsx:123` sagt `case "supplements": return
<SupplementsModule />`** — ein Rahmen, keine V2-Weiche. Das ist das
vierte Muster in vier Modulen:

| Modul | Muster |
|---|---|
| Nutrition | `-spec.jsx` war eine **konkurrierende Fassung** |
| Training | `-spec.jsx` lieferte **vier Tabs und die Formeln** |
| Recovery | `RecoveryModuleV2` hatte den alten Rahmen **abgelöst** |
| **Supplements** | **arbeitsteilig** — ein Rahmen, drei Zulieferer |

**Selbst geprüft, nicht aus `app.jsx` geschlossen.** Die Exporte je
Datei und die Aufrufe im Rahmen:

| Datei | exportiert | vom Rahmen benutzt |
|---|---|---|
| `module-supplements.jsx` (81 KB) | `SupplementsModule` | — (er **ist** der Rahmen) |
| `module-supplements-spec.jsx` (72 KB) | 10 Namen | 5 Tabs + 2 Seitenkarten + 2 Modale |
| `module-supplements-injection.jsx` (36 KB) | 3 Namen | 1 Tab + 1 Modal + 1 Launcher |
| `module-supplements-modals.jsx` (38 KB) | **nichts über `window`** | indirekt — elf Modale, die der Rahmen namentlich aufruft |

`[cmd]` Der Rahmen ruft sie mit `window.X && <window.X />` auf — also
**mit Ausfallsicherung**: fehlt der Zulieferer, bleibt der Tab leer statt
zu brechen. Bei `interactions` gibt es sogar einen Rückfall auf die
eigene Fassung (`window.SuppInteractionsView ? … : <SuppInteractions />`).

**Das ist die Antwort auf die Frage des Auftrags:** `-spec.jsx` ist hier
**keine konkurrierende Fassung**, sondern eine Erweiterung. Nichts
davon widerspricht dem Rahmen.

### Was dieser Durchgang gebaut hat — und was nicht

`[cmd]` **227 KB waren zu viel für einen Durchgang.** Gebaut ist der
Rahmen mit **seinen sieben eigenen Tabs**:

| gebaut | Herkunft |
|---|---|
| Today | `module-supplements.jsx:292` — Ring, vier Slot-Karten, Next dose, Refills, Active cycles |
| Stack | `:489` — Timing-Matrix und Listenansicht |
| Extended | Compounds und Bloodwork |
| Database | `:640` — 15 Wirkstoffe, Suche, Evidenzgrade |
| Compliance | `:710` — Heatmap und Kalender |
| Interactions | drei Wechselwirkungen |
| Cost | Kosten je Präparat, Summe, Kosten je Evidenzgrad |

**Nicht gebaut, aber als Tab sichtbar:** Catalog, Stacks, Intelligence,
Inventory (alle `-spec.jsx`) und Injections (`-injection.jsx`). Sie
stehen in der Tab-Leiste und sagen an ihrer Stelle, woher sie kommen und
was sie zeigen würden.

`[read]` **Weglassen wäre schlechter gewesen** — eine Tab-Leiste mit
sieben statt elf Einträgen sieht vollständig aus und ist es nicht.

---

## Was im Vorgängerrepo danebenliegt

`[cmd]` Gemessen, nicht geschätzt:

| | |
|---|---|
| **Migrationen** | `008_supplements.sql` (5,2 KB), `009_supplement_enhanced.sql` (1,7 KB), `050_supplements_schema_expansion.sql` (8,4 KB) |
| **Tabellen darin** | `supplements`, `user_stacks`, `stack_items`, `intake_schedule`, `intake_logs`, `supplement_interactions`, `user_inventory`, `enhanced_substances` — **acht** |
| **Seed** | `supabase/seed.disabled/seed_supplements.sql`, **35,9 KB**, 13 `INSERT`-Blöcke |
| **Komponenten** | `apps/app/modules/supplements/components/` — **15 Dateien** |

**Die Halbwertszeit ist die interessanteste Fundstelle.** `[cmd]` Sie
kommt in fünf Dateien vor, darunter:

- `hooks/useBloodLevels.ts` — führt `half_life` und `half_life_hours`
- `components/BloodLevelChart.tsx` — der Verlauf im Blut
- `components/CyclePlanner.tsx` — Zyklusplanung
- `components/InjectionSiteTracker.tsx` — Injektionsstellen

`[read]` Das deckt genau den Tab ab, den dieser Durchgang **nicht**
gebaut hat: Injections. Wer ihn baut, hat im Vorgängerrepo eine
gerechnete Fassung liegen — samt Halbwertszeit-Formel — statt bei null
anzufangen.

`[cmd]` **Der Seed ist der zweite Schatz.** 35,9 KB Wirkstoffdaten
sind mehr, als die Vorlage in ihrer `SUPPLEMENT_DB` führt (15
Einträge). Was dort steht, wurde einmal recherchiert.

`[annahme]` Das Schema ist nicht übertragbar wie es ist: der Vorgänger
nutzt `public.` mit UUID-Fremdschlüsseln, dieses Repo eigene Schemata je
Modul (`nutrition`, `goals`, `hydration`). Die **Spaltennamen und
Wertebereiche** sind übertragbar, die Struktur ist Übersetzungsarbeit.

---

## Was zuerst echte Daten bekommen könnte

**Die Reihenfolge nach Aufwand, nicht nach Auffälligkeit:**

### 1. Der Stack selbst (Tab „Stack", Teile von „Today")

**Was fehlt:** ein Schema mit zwei Tabellen — Präparate und die Zuordnung
zur Nutzerin.

| gebraucht | wofür |
|---|---|
| `supplements.products` | Name, Marke, Form, Dosis, Evidenzgrad |
| `supplements.user_stack` | wer nimmt was, in welchem Slot, an welchen Tagen |

`[cmd]` Die Vorlage trägt neun Einträge mit je 17 Feldern — die Form
steht also fest. `days` ist ein Array aus sieben 0/1, `slot` eine
Aufzählung mit fünf Werten (`SLOTS`).

**Das reicht für:** Timing-Matrix, Listenansicht, die Slot-Karten in
„Today" und die Kostenrechnung (`monthlyCost` je Eintrag).

### 2. Die Einnahme (Tab „Today", „Compliance")

**Was fehlt:** `supplements.intake_logs` — eine Zeile je Einnahme, mit
Zeitstempel und Grund beim Auslassen.

`[read]` Dieselbe Form wie `nutrition.water_logs`: ein Insert je
Ereignis, keine Aggregation in der Tabelle. Die Quote rechnet eine
Sicht, nicht die Anwendung — dieselbe Linie wie bei
`daily_summary` und `hydration_day`.

**Das reicht für:** den Ring in „Today", die Streaks, die Heatmap.

### 3. Der Bestand (Tab „Inventory", Karte „Refills")

**Was fehlt:** `servings_left` und `servings_total` je Stack-Eintrag,
plus ein Nachbestelldatum.

`[annahme]` Das könnte in `user_stack` mitlaufen statt eine eigene
Tabelle zu bekommen — die Vorlage führt es dort auch. Erst wenn ein
Verlauf gebraucht wird („wann war es zuletzt leer"), lohnt eine eigene.

### Was zuletzt käme

`[read]` **Interactions und Intelligence brauchen kuratiertes Wissen**,
keine Nutzerdaten: welche Kombination wie wirkt. Das ist eine
Datenpflege-Aufgabe, kein Schemaproblem — und der Vorgänger hat mit
`supplement_interactions` eine Tabelle dafür, aber der Inhalt ist
Fachwissen.

`[read]` **Injections zuletzt**, obwohl der Vorgänger dort am meisten
liegen hat — es ist der Bereich mit der grössten Sorgfaltspflicht.

---

## Abweichungen von der Vorlage

| Stelle | Vorlage | hier | Grund |
|---|---|---|---|
| Vier Tabs | eigene Ansichten aus `-spec.jsx` | Karte „kommt aus …" | **227 KB, ein Durchgang.** Der Auftrag erlaubt es ausdrücklich. |
| `<Card>`-Markierung | keine | jede Kachel trägt `Attrappe` | Regel seit G-05 |
| Slot-Karten | — | Marke **ohne** Begründungssatz | Vier Karten untereinander mit demselben Satz sind Lärm; die Marke allein genügt, der Satz steht auf der Kachel darüber. |
| `refillUrgent` | an **einem** von neun Einträgen gesetzt | unverändert übernommen | **Befund der Vorlage:** die Anzeige liest das Feld an drei Stellen, acht Einträge haben es nicht. Nicht begradigt — das wäre eine Erfindung. |
| `arr_r` | — | kommt hier nicht vor | Der Tippfehler steckt in `module-recovery-v2.jsx`, nicht in Supplements. |
| Zeitwerte | `TODAY_DOW = 5`, `NOW_HOUR = 13.5` | unverändert | Feste Vorführwerte, kein `new Date()` — ein Modul ohne Datenquelle hätte von der echten Uhr nichts. |

---

## Nachweise

| Prüfung | Ergebnis |
|---|---|
| Angemeldet als `dev@lumeos.app` | `[cmd]` ja |
| Elf Tabs | `[cmd]` `["Today","Stack 9","Extended 5","Catalog","Stacks","Intelligence","Inventory","Injections","Compliance","Interactions 3","Cost"]` |
| Jede Kachel markiert | `[cmd]` je Tab Karten = Attrappen (Today 9/9, Cost 3/3, Interactions 3/3 …) |
| Modal | `[cmd]` öffnet, schliesst mit Escape (1 → 0) |
| **Konsolenfehler** | `[cmd]` **1 — identisch mit `/v2/dashboard`.** Die `<title>`-Schreibweise, die bei Recovery 32 Fehler erzeugte, kommt in dieser Vorlage **nicht vor** (`grep <title>` = 0). |
| Seitenfehler | `[cmd]` 0 |
| Drei Breiten | `[cmd]` 1600 / 1100 / 800 px, kein Überlauf |
| `pnpm test` | `[cmd]` **202** Tests (199 + 3 neue), 0 fehlgeschlagen |
| i18n-Prüfung | `[cmd]` 103 Schlüssel, 74 Verwendungen, grün |

### Drei neue Prüfungen in `v2-attrappen.test.ts`

- **Elf Tabs vorhanden** — gegengeprobt: `Inventory` entfernt → rot mit
  „Der Tab „Inventory" fehlt. Die Vorlage führt elf."
- **17 Kacheln markiert** — wer eine anbindet, senkt die Zahl.
- **Stack vollständig** — neun Einträge, 15 in `SUPPLEMENT_DB`; wer die
  Liste kürzt, fällt auf. Dasselbe Muster wie beim Nährstoffbaum.

### Anmerkung zum Gate

`[cmd]` `pnpm gate` ist beim Schreiben dieses Berichts **rot durch
`/v2/goals`** — `ansicht.tsx` dort importiert `./modale`, das es noch
nicht gibt. Das ist der parallel arbeitende Agent, nicht dieser Auftrag.
`tsc` über `apps/web` meldet **ausserhalb von `v2/goals` null Fehler**.


---

## Nachtrag 2026-08-17 (G-33): gegen die Vorlage nachgezogen

**Tom:** *„Extended weit weg von der Vorgabe und viel anderes auch."*
**Der Befund war richtig, und zwar messbar.**

### Der Abgleich, als Skript

`[cmd]` Ein Skript liest je Tab, welche Unterkomponenten die Vorlage
aufruft — rekursiv, über alle vier Vorlagendateien — und prüft, ob es
sie in der Umsetzung gibt.

**Vorher:**

| Tab | Vorlage | gebaut | fehlend |
|---|---|---|---|
| today | 2 | 2 | — |
| stack | 2 | 2 | — |
| **extended** | **8** | **0** | ExtendedGate, ExtendedHeader, ExtendedCompoundCard, CycleTimeline, BloodworkPanel, SideEffectLog, HalfLifeChart, ExtendedDrawer |
| database | 0 | 0 | — |
| **compliance** | **3** | **0** | ComplianceHeatmap, ComplianceStrip, CalendarView |
| interactions | 0 | 0 | — |
| cost | 0 | 0 | — |

**11 Unterkomponenten, rund 530 Zeilen Vorlage.**

**Nachher: 15 von 15, fehlend 0.** Dieselbe Messung, dasselbe Skript.

`[cmd]` Die Umsetzung wuchs von 708 auf **1.865 Zeilen** über fünf
Dateien — `tab-extended.tsx` und `tab-compliance.tsx` sind neu, weil
`tabs.tsx` sonst über 1.200 Zeilen läge.

### Was beim ersten Durchgang fehlte und warum

`[read]` **Der Tab-Rumpf ist nicht das Modul.** Das ist die Falle, und
sie sieht harmlos aus:

`SuppExtended` hat in der Vorlage **46 Zeilen**. Meine Fassung hatte
97 — nach Zeilenzahl also *mehr*. Tatsächlich fehlte alles, was zählt:
der Rumpf **ruft acht Komponenten auf**, die zusammen 365 Zeilen tragen.
Wer den Rumpf liest und nachbaut, hat einen Tab, der aussieht wie
gemeint und drei Viertel des Inhalts nicht hat.

**Drei Dinge, die der nächste Modulauftrag prüfen sollte:**

1. **Den Aufrufbaum, nicht die Zeilenzahl.** Ein Rumpf mit 40 Zeilen
   kann 400 Zeilen Inhalt haben.
2. **Über alle Vorlagendateien.** `[cmd]` `CalendarView` steht in
   `module-supplements-modals.jsx`, wird aber vom Rahmen aufgerufen —
   mein erstes Abgleichskript las nur den Rahmen und hielt sie für
   undefiniert. Erst der Blick in alle vier Dateien zeigte es.
3. **Eigene Zustände sind eigene Bildschirme.** `ExtendedGate` ist eine
   ganze Aufklärungsseite vor dem Tab. Wer sie weglässt, zeigt sofort
   Hormonprotokolle — genau das, was die Vorlage verhindert.

`[annahme]` Der Grund für das Übersehen war die Reihenfolge: G-29 hat
die Tab-Rümpfe gelesen, gebaut und die Zeilenzahl des Ergebnisses mit
der des Rumpfs verglichen. Beide Zahlen sahen stimmig aus. **Verglichen
wurde nie, was der Rumpf aufruft.**

### Der Tab „Database" — Entscheidung

`[cmd]` **Die Tab-Leiste der Vorlage hat elf Einträge; `database` ist
keiner davon.** Der Rahmen rendert ihn aber und erreicht ihn über einen
Kopfknopf (`onClick={() => setTab("database")}`, Zeile 234).

**Entscheidung: so lassen, wie die Vorlage es hält** — nicht in der
Leiste, aber über den Knopf „Database" erreichbar. Die Umsetzung tut das
bereits.

`[read]` **Anders als `PeriodizationFullView` bei Training.** Dort zeigte
ein Aufruf ins Leere — die Komponente gab es nicht, also war der Aufruf
tot und wurde entfernt. Hier ist es umgekehrt: die Komponente ist
vollständig und erreichbar, nur nicht in der Leiste. Das ist kein
Versehen, sondern eine zweite Zugangsebene — die Wirkstoffdatenbank ist
Nachschlagewerk, kein Tagesbereich.

### Verbliebene Abweichungen

| Stelle | Vorlage | hier | Grund |
|---|---|---|---|
| Fünf Tabs | eigene Ansichten aus `-spec.jsx` / `-injection.jsx` | Karte „kommt aus …" | **G-31**, nicht dieser Auftrag |
| Attrappenmarke | keine | jede Kachel | Regel seit G-05 |
| Slot-Karten | — | Marke ohne Begründungssatz | vier gleiche Sätze untereinander sind Lärm |
| `refillUrgent` | an **einem** von neun Einträgen | unverändert | Befund der Vorlage, nicht begradigt |
| Modul-Raster | inline | `supplements.css` | `packages/ui` ist gesperrt |

**Ohne technischen Grund weicht nichts ab.**

### Nachweise

| Prüfung | Ergebnis |
|---|---|
| Unterkomponenten je Tab | `[cmd]` **15 von 15**, fehlend 0 (vorher 4 von 15) |
| Extended-Gate | `[cmd]` sichtbar vor der Freischaltung; danach sechs Karten, alle markiert |
| Compliance | `[cmd]` 3 Karten (Heatmap, Streaks, Tabelle mit acht Zeilen) statt vorher 2 |
| Jeder Tab markiert | `[cmd]` Karten = Attrappen in allen elf Tabs |
| Modal | `[cmd]` öffnet, schliesst mit Escape (1 → 0) |
| Konsolenfehler | `[cmd]` 5, davon 4 die bekannte `data-mode`-Warnung und 1 ein RSC-Vorabruf — **identisch mit `/v2/dashboard`**, nichts modul-eigenes |
| Seitenfehler | `[cmd]` 0 |
| Drei Breiten | `[cmd]` 1600 / 1100 / 800 px, kein Überlauf |
| `pnpm gate` | `[cmd]` **grün, 8 Tasks** — das rote Gate lag an `/v2/goals` und ist behoben, nicht von mir |
| `pnpm test` | `[cmd]` **209** Tests, 0 fehlgeschlagen |

**Zwei neue Prüfungen**, beide gegengeprobt:

- **Marken je Datei** (12 / 6 / 4) — wer eine Kachel anbindet, senkt die
  Zahl.
- **Alle 15 Unterkomponenten vorhanden** — `HalfLifeChart` versteckt →
  rot mit „Die Unterkomponente „HalfLifeChart" der Vorlage fehlt.",
  danach zurückgesetzt.

---

# Nachtrag 2026-08-18 (G-45): die fünf offenen Tabs

`[read]` **Tom, 2026-08-18:** *„Supplements ist nicht fertig als Mockup
erstellt worden, denn da hat es Injektionsorte mit dieser speziellen
Map. In Supplements nochmal an den Subnavigationen checken und das
Mockup duplizieren."*

**Alle zwölf Tabs sind jetzt gebaut.** `[cmd]` Die Zählung steht bei
**67 von 67**.

---

## Ob `-injection.jsx` ein Tab oder ein Bereich ist

**Es ist ein Tab.** Drei Belege, in dieser Reihenfolge geprüft:

| Beleg | Fundstelle |
|---|---|
| `app.jsx` führt **einen** Fall für Supplements | `app.jsx:123` — `case "supplements": return <SupplementsModule />` |
| Der Rahmen listet `injection` in seiner Tab-Leiste | `module-supplements.jsx:249` — `{ id: "injection", label: "Injections" }` |
| Der Rahmen rendert ihn im selben Rumpf | `module-supplements.jsx:270` — `{tab === "injection" && <window.InjectionPlannerView />}` |

`[read]` Der Auftrag fragte, ob 36 KB nicht zu viel für einen Tab
seien. **Sie sind es nicht** — die Datei ist groß, weil der Tab vier
eigene Unter-Tabs hat (Rotation map · Schedule · Log · Site guide),
nicht weil er ein eigener Bereich wäre. `-spec.jsx` mit 72 KB trägt
sogar vier Tabs auf einmal.

**Gegenprobe:** `module-supplements.jsx:286` bindet zusätzlich
`SuppInjectionLauncher` ein — ein Verteiler für das Log-Fenster, kein
zweiter Einstiegspunkt.

---

## Die Zählung je Tab

`[cmd]` `node tools/vollstaendigkeit.mjs supplements`, 2026-08-18.

| Tab | Unterkomponenten | Kacheln | Stand |
|---|---|---|---|
| Today | 1 | 3 | vorher gebaut |
| Stack | 2 | — | vorher gebaut |
| Extended | 8 | 4 | G-33 |
| **Catalog** | — | 2 | **G-45** |
| **Stacks** | — | 4 | **G-45** |
| **Intelligence** | — | 6 | **G-45** |
| **Inventory** | — | 5 | **G-45** |
| **Injections** | 2 | 14 | **G-45** |
| Compliance | 3 | 3 | G-33 |
| Interactions | — | — | vorher gebaut |
| **Cost** | — | **5 statt 2** | **G-45 nachgezogen** |
| Database | — | — | vorher gebaut |

**Elf Modale**, alle als `case`-Zweige eines gemeinsamen Verteilers
(`SupplementsModale`), plus `LogInjektionFenster` als eigene
Komponente — es braucht Zustand, weil Ort, Menge und Schmerz die
Prüfung live ändern.

### Was die Zählung vorher falsch meldete

`[cmd]` Vor diesem Durchgang stand Supplements bei **42 von 67**, und
die Liste nannte neun fehlende Modale. **Sie waren alle da** — die
Vorlage baut je Fenster eine eigene Komponente, die Umsetzung einen
Verteiler mit `case`-Zweigen. Die Umbenennungstabelle in
`tools/vollstaendigkeit.mjs` kannte diese Bauform nicht.

**Nachgetragen mit Beleg je Eintrag.** Dieselbe Klasse Fehler wie in
G-26 bei `BodyMap18`: **eine fehlende Zuordnung sieht aus wie ein
fehlendes Bauteil.**

### Der Rest aus G-33

`[cmd]` **`SuppCost` führte zwei Kacheln, die Vorlage fünf.** Nachgezogen
sind *Cost · 12 months trend*, *Spend per supplement*, *Category
split*, *If you removed…* und *Cost optimization*. `[read]` Dieselbe
Klasse Lücke wie `SuppExtended` — sah beim Klicken vollständig aus.

`[cmd]` **`refillUrgent` steht unverändert** an einem von neun
Einträgen, gelesen an drei Stellen. **Nicht begradigt**, wie im Auftrag
verlangt.

---

## Was der Injections-Tab an Daten brauchen wird

`[cmd]` **Das `supplements`-Schema führt seit C-68 fünf Tabellen —
keine davon für Injektionen.** Weder Orte noch Protokoll noch Plan.
Alles in diesem Tab ist Attrappe.

### Was fehlt, nach Tabellen sortiert

| Was | Felder aus der Vorlage |
|---|---|
| **Injektionsorte** | `id`, `name`, `short`, `route` (im/subq), `max_ml`, `rest_days`, `view`, `x`/`y`, `needle`, `note` |
| **Protokoll** | `date`, `site_id`, `compound_id`, `ml`, `mg`, `route`, `needle`, `pain` (0–3), `notes` |
| **Rotationsplan** | `date`, `compound_id`, `ml`, `route`, `suggested_site_id`, `why` |

**Die 16 Orte sind Stammdaten, keine Nutzerdaten** — sie ändern sich
nicht je Person. Sie gehören in eine Katalogtabelle, wie die
Nährstoffreferenzen.

### Die Rechnungen, die daran hängen

`[cmd]` Drei, alle aus der Vorlage übernommen:

1. **Ruhefenster** — `rest_days − days_since_last`; über 1 Tag Rest
   heißt `resting`, 0 oder 1 heißt `soon`, darunter `ready`.
2. **Überbeanspruchung** — mehr als drei Nutzungen eines Orts in 30
   Tagen.
3. **Vorschlag** — `argmax(days_since_last)` über Orte, deren Weg
   passt, deren Volumengrenze reicht und deren Ruhefenster um ist.

**Alle drei brauchen nur das Protokoll**, keine weitere Tabelle. `[read]`
Wer die Injektionen anbindet, hat die Logik damit schon.

### Was im Vorgängerrepo danebenliegt

`[read]` Der Auftrag nennt es, hier zur Vollständigkeit:
`CyclePlanner.tsx`, `BloodLevelChart.tsx`, **28 Fundstellen zu
Halbwertszeit und Blutspiegelverlauf**, darunter `useBloodLevels.ts`
mit `half_life_hours`.

`[cmd]` **Für diesen Tab war das nicht nötig** — die Vorlage rechnet
keinen Blutspiegel, sie plant Orte. Der Blutspiegelverlauf steckt im
Extended-Tab (`HalfLifeChart`, seit G-33). **Wenn der Injections-Tab
später einen Verlauf zeigen soll, liegt der Vorgängercode bereit.**

---

## Zwei gemeldete Punkte

### `InjektionsKarte` aus `packages/ui` passt hier nicht

`[cmd]` **Gemessen: nur 8 von 16 Orten decken sich.** Die Vorlage führt
acht, die es dort nicht gibt (`vglute_*`, `abd_*`, `sq_delt_*`,
`thigh_sq_*` — die SubQ-Stellen), und sechs Felder je Ort, die dort
fehlen: `route`, `maxMl`, `restDays`, `needle`, `short`, `note`.

Dazu eine andere Koordinatenwelt: die Vorlage zeichnet in einem
`viewBox` von **100×120** mit einer einfachen Silhouette, die
anatomische Figur misst **724×1448**.

**Entscheidung Tom, 2026-08-18:** Vorlage 1:1 im Modul,
`packages/ui` bleibt unangetastet. `[cmd]` Nachgeprüft: `packages/ui/`
zeigt keine Änderung.

**`InjektionsKarte` bleibt damit ungenutzt.** Sie ist gebaut,
exportiert und funktioniert — aber kein Tab ruft sie. Wenn die beiden
Ortslisten je zusammengeführt werden, ist sie die Grundlage.

### `InEntwicklungKnopf` kennt kein `disabled`

`[cmd]` `packages/ui/src/in-entwicklung.tsx:81-88` — die Prop gibt es
nicht.

**Das ist im Log-Fenster nicht nebensächlich:** die Vorlage **sperrt**
den Speichern-Knopf, wenn die Menge über der Ortsgrenze liegt oder das
Ruhefenster noch läuft. Ein Fenster, das die Grenze anzeigt und
trotzdem speichern ließe, wäre schlechter als keines.

**Gelöst ohne `packages/ui` anzufassen:** der gesperrte Fall
rendert einen echten `<button disabled>`, nur der freigegebene geht
durch `InEntwicklungKnopf`. **Gemeldet** — wenn die Prop dazukommt,
fällt die Weiche weg.

`[read]` Zusammen mit den aus G-43 bekannten Lücken (`history`,
`shield`, `Pill` ohne `dot`, kein `Empty`) ist das der fünfte Fall.

---

## Nachweis

`[cmd]` **Am Bildschirm geprüft**, 2026-08-18, `/v2/supplements`:

- **Elf Tabs in der Leiste**, jeder mit eigenem Inhalt — je Tab an
  einem Merkmal geprüft (*Evidence grading*, *System templates*, *Gap
  analysis*, *consumption rate*, *Rotation map*, *Category split*).
- **Die Rotationskarte zeigt 16 Orte** auf zwei Silhouetten,
  Zweibuchstaben-Kürzel im Punkt, gestrichelter Ring bei SubQ.
- **Klick funktioniert** — „Quad L" ausgewählt, die Detailkarte zeigt
  seine Nadel (25G).
- **Der Wegfilter rechnet:** 6 SubQ + 10 IM = 16.
- **Hell und dunkel** geprüft, die Karte färbt mit.
- **375 / 768 / 1440 px** — beide Silhouetten überall, kein Überlauf
  des Inhalts. `[cmd]` Der Seitenüberlauf bei 375 px kommt aus
  `.v2-sidebar-nav` (880 px) und betrifft jede v2-Seite; nicht
  angefasst.
- `[cmd]` **1 Konsolenfehler** — der bekannte Normalwert. **Keine
  Hydrationsmeldung.**

`[cmd]` `pnpm gate` — **8 von 8 Aufgaben grün, 269 Web-Tests + 7
Admin-Tests**, kein Fehlschlag. Davon 11 neu in zwei Dateien
(`spec-daten.test.ts`, `tabs-vollstaendig.test.ts`), jeder absichtlich
zum Fehlschlagen gebracht.

`[cmd]` **`rgba` bleibt bei 4**, keine neuen Farbtokens,
`packages/ui/` unverändert.

### Eine Zahl im Auftrag traf nicht zu

`[cmd]` Der Auftrag nennt **44 Katalogeinträge**. Die stehen in der
**Datenbank** (Schema seit C-68) — **die Vorlage führt 34**. Der erste
Entwurf des Tests hat die 44 ungeprüft übernommen und schlug fehl;
nachgezählt sind es 34, und genau 34 sind übernommen.

**Die Zahl im Auftragstext war kein Sollwert für das Mockup.**

**Nichts ist committet oder gestaged.**

---

# Nachtrag 2026-08-18 (G-57): die Silhouette im Injections-Tab

**Eine Zeile geändert** — `tab-injektionen.tsx`, die Füllung der
Silhouette. Die 16 Orte, ihre Logik und der Wegfilter sind nicht
angefasst.

```
- <path d={SILHOUETTE} fill="var(--surface)"       stroke="var(--border)"        strokeWidth="0.6" />
+ <path d={SILHOUETTE} fill="var(--border-strong)" stroke="var(--border-strong)" strokeWidth="0.6" />
```

---

## Was gemessen wurde

### Der Ausgangsbefund stimmt — mit einer Präzisierung

`[cmd]` **Die Füllung war `var(--surface)`, der Kartengrund ist
`var(--surface)`** (`.v2-card`, `packages/ui/src/styles/v2.css:435`).
Nach Tokenrechnung ist der Abstand **0,000 in beiden Modi** — genau der
Befund aus G-55.

`[cmd]` **Am Bildschirm ist der Grund aber nicht der reine Token.** Die
Karte trägt zusätzlich `v2-attrappe`, und die Marke tönt sie ein.
Gemessen mit `getComputedStyle` in der laufenden Seite:

| | Token `--surface` | tatsächlich gerendert |
|---|---|---|
| dunkel | 0,205 | **0,223** |
| hell | 1,000 | **0,987** |

`[read]` **Das ändert den Befund nicht, es verschiebt ihn nur:** Der
Restabstand von 0,018 (dunkel) bzw. 0,013 (hell) kam nicht von der
Figur, sondern von der Attrappenmarke unter ihr. Sichtbar war davon die
Kontur, nicht der Körper.

### Vorher und nachher, beide Modi

`[cmd]` Gemessen als OKLCH-Helligkeit gegen den **gerenderten** Grund:

| Modus | vorher | nachher | Faktor |
|---|---|---|---|
| **dunkel** | 0,018 | **0,137** | 7,4× |
| **hell** | 0,013 | **0,167** | 12,3× |

`[cmd]` Nach reiner Tokenrechnung — also ohne die Attrappentönung —
liefert `--border-strong` auf `--surface` **0,155 dunkel / 0,180 hell**.
Das sind exakt die Zahlen aus dem Auftrag, und sie treffen zu: die
Abweichung nach unten stammt allein aus der Marke.

### Die Kontur musste mit

`[cmd]` **Das war nicht im Auftrag und ergab sich aus der Messung.**
`--border` gegen eine Füllung aus `--border-strong`:

| Modus | `--border` | `--border-strong` | Abstand | Richtung |
|---|---|---|---|---|
| dunkel | 0,280 | 0,360 | 0,080 | **Kontur dunkler als Füllung** |
| hell | 0,910 | 0,820 | 0,090 | Kontur heller als Füllung |

`[read]` **Im Nachtmodus hätte die alte Kontur die Figur nach innen
abgeschnitten** statt sie abzugrenzen — ein dunkler Saum auf einem
helleren Körper. Die Füllung allein trägt mit 0,137/0,167 mehr, als die
Kontur je beigetragen hat. **Deshalb fällt die Kontur mit der Füllung
zusammen**, statt einen dritten Wert einzuführen.

### Die 16 Punkte bleiben lesbar

`[cmd]` Abstand der Punktfarben zur **neuen** Füllung, schlechtester
Fall hell `--warn` mit **0,270** — dreimal so viel wie die Figur selbst
zum Grund hat:

| | dunkel | hell |
|---|---|---|
| `--pos` | 0,420 | 0,300 |
| `--warn` | 0,460 | **0,270** |
| `--neg` | 0,360 | 0,320 |

`[cmd]` Die Kürzelschrift (`fill: var(--bg)`) auf den Punkten: mindestens
**0,435**. **Keine Punktfarbe wurde angefasst.**

---

## Warum diese Lösung und nicht die aus G-55

**Sie ist dieselbe — die Bezugsgrösse ist eine andere.**

`[cmd]` G-55 füllt die Körperkarte mit `--surface-2` und konturiert mit
`--border-strong` (`recovery/koerperkarte.tsx:76-77`). **Das funktioniert
dort, weil die Recovery-Karte Muskelgruppen einfärbt** — die Figur
bekommt ihren Halt aus den Farbflächen darin, die Füllung ist nur der
Untergrund dazwischen.

`[cmd]` **Der Injections-Tab hat keine Flächen, nur 16 Punkte.** Hier
trägt die Füllung die ganze Figur. `--surface-2` würde dafür nicht
reichen:

| Füllung auf `--surface` | dunkel | hell |
|---|---|---|
| `--surface-2` (wie G-55) | 0,030 | 0,025 |
| **`--border-strong`** (hier) | **0,155** | **0,180** |

`[read]` **Der G-55-Agent hat richtig nicht umgebaut.** Seine Lösung
greift hier nicht mit, weil sie eine Kontur-plus-Flächen-Figur
beschreibt, keine Flächenfigur. Übernommen ist nicht der Wert, sondern
der Befund: **`--border-strong` ist der einzige vorhandene Token über
0,15 in beiden Modi.**

**Kein neuer Token.** `[cmd]` `rgba` steht unverändert bei **4** in
`v2.css`; `lume.css` führt dieselben 57 Tokendefinitionen wie vorher.

---

## Nachweis

`[cmd]` Am Bildschirm geprüft, 2026-08-18, `/v2/supplements` →
Injections, gegen den laufenden Entwicklungsserver:

| Prüfung | Ergebnis |
|---|---|
| Füllung im DOM nach Neuladen | `[cmd]` `oklch(0.36 0.005 270)` — der echte Code, nicht gesetzt |
| Gerenderter Abstand dunkel | `[cmd]` 0,018 → **0,137** |
| Gerenderter Abstand hell | `[cmd]` 0,013 → **0,167** |
| Beide Silhouetten im DOM | `[cmd]` 2 Pfade |
| **Die 16 Punkte** | `[cmd]` **12 vorne + 4 hinten = 16**, unverändert |
| **Wegfilter** | `[cmd]` All 16 · **IM 10** · **SubQ 6** — rechnet weiter |
| Silhouettenpfad | `[cmd]` `SILHOUETTE`-Konstante und `viewBox 0 0 100 120` unberührt |
| Breiten | `[cmd]` **1440 / 1024 / 768 / 375 px**, beide Silhouetten überall |
| `pnpm gate` | `[cmd]` **grün, 8 von 8 Aufgaben** |
| `packages/ui` | `[cmd]` **von diesem Auftrag nicht angefasst** |

### Bildschirmfotos

`[cmd]` Aufgenommen je Modus und Breite, plus der Vorzustand zum
Vergleich (Füllung testweise auf `--surface` zurückgesetzt, danach
neu geladen):

| Datei | Inhalt |
|---|---|
| `g57-VORHER-dunkel-1440.png` | der Befund: Figur als Geisterkontur, Punkte frei im Raum |
| `g57-VORHER-hell-1440.png` | hell war die Kontur schwach sichtbar, der Körper nicht |
| `g57-dunkel-{1440,1024,768,375}.png` | nachher, Nachtmodus |
| `g57-hell-{1440,1024,768,375}.png` | nachher, Tagmodus |

`[read]` **Der Vorzustand ist mitgemessen und nicht nur behauptet** — in
G-45 fehlte genau das. Der Unterschied zwischen den beiden
1440er-Bildern je Modus ist der ganze Auftrag.

### Abstimmung mit G-56

`[cmd]` **`packages/ui` ist von diesem Auftrag unberührt.** Die dort
offenen Änderungen (`icons.tsx`, `primitives.tsx`, `v2.css`,
`in-entwicklung.tsx`, `index.ts`, `klassen-uebernehmen.mjs`) lagen beim
Sitzungsbeginn bereits im Arbeitsbaum und gehören zu G-56. `[cmd]`
Dasselbe gilt für `supplements/modale.tsx`. **Von G-57 stammt genau eine
geänderte Datei:** `apps/web/src/app/v2/supplements/tab-injektionen.tsx`.

**Nichts ist committet oder gestaged.**
