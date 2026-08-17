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
