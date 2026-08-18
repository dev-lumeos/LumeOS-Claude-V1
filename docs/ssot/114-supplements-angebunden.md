# 100 — Supplements an den Katalog angeschlossen (G-37)

Stand: 2026-08-18 · Anker: Zweig `dev` · Auftrag G-37
Herkunft: gebaut und am Bildschirm geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

`[cmd]` **Vier Tabs lesen jetzt aus `supplements` (C-68):** Today,
Stack, Database und Cost. Der Rest bleibt Attrappe und trägt die
Marke weiter.

**Der Auftrag nannte drei anbindbare Tabs. Es sind vier geworden** —
weil `Cost` seine Grundlage entgegen der Annahme im Auftrag hat.

---

## Welche Kacheln echt wurden

`[cmd]` Gezählt im Browser als `dev@lumeos.app`, je Tab die Karten und
die verbliebenen Attrappenmarken:

| Tab | Karten | Marken vorher | Marken nachher |
|---|---|---|---|
| **Today** | 7 | 4 | **0** |
| **Stack** | 2 | 1 | **0** |
| **Database** | 2 | 1 | **0** |
| **Cost** | 7 | 8 | **0** |
| Extended | 1 | (Gate) | 0 |
| Catalog | 3 | 2 | 2 |
| Stacks | 5 | 4 | 4 |
| Intelligence | 8 | 7 | 7 |
| Inventory | 6 | 5 | 5 |
| Injections | 11 | 6 | 6 |
| Compliance | 4 | 3 | 3 |
| Interactions | 4 | 3 | 3 |

**Die Zahl, nach der der Auftrag fragt: 14 Kacheln verlieren die
Marke** — 4 in Today, 1 in Stack, 1 in Database, 8 in Cost.

### Was auf dem Bildschirm steht

`[cmd]` Today, angemeldet als `dev@lumeos.app`:

```
3 / 4 TODAY'S ADHERENCE · Next: Magnesium · 21:30 · LOGGED 2026-08-18
Morning (2)   Creatine Monohydrate 5 g   [S] Performance · seed  ✓ logged
              Vitamin D3 5000 IU         [S] Vitamins    · seed  ✓ logged
With meal (1) Omega-3 (EPA/DHA) 2 g      [A] Recovery    · seed  ✓ logged
Evening (1)   Magnesium 400 mg           [A] Minerals    · seed  [Mark taken]
Refills · Vitamin D3 · 4 d left · 4 / 7 softgels
```

**Jede Zahl darin kommt aus der Datenbank** — Dosis und Timing aus
`stack_items`, Evidenzgrad und Kategorie aus `supplement_catalog`,
Status und Uhrzeit aus `intake_logs`, `seed` aus
`measurement_source`.

`[cmd]` **Die Herkunft wird angezeigt.** Der Auftrag stellte es frei
(*„darf sie zeigen, muss aber nicht"*) — sie steht hinter der
Kategorie, weil vier von vier Zeilen `seed` sind und ein Nutzer sonst
Sitzungsdaten für selbst erfasste hielte.

`[cmd]` Cost rechnet **€20,40 im Monat · €0,68 am Tag · €245
Jahreslauf**, aufgeteilt auf Omega-3 44,1 % · Creatine 22,1 % ·
Magnesium 22,1 % · Vitamin D3 11,8 %. Die Rechnung ist
`Tagesdosis ÷ Portionsgröße × Preis je Portion`.

`[cmd]` Database zeigt **44 von 44 Katalogeinträgen** mit Kategorie,
Evidenzgrad, Portionsgröße und Preis, mit Suche und
Kategorienfilter.

### Was in den angebundenen Tabs bewusst entfallen ist

`[read]` **Nicht ersetzt, sondern weggelassen** — eine erfundene Zahl
neben echten ist schlimmer als eine fehlende:

| Entfallen | Warum |
|---|---|
| „Streak · 23 days" | `[cmd]` Braucht eine Kette von Tagen; es gibt **einen** Protokolltag. |
| „in 4h 02m" | Braucht eine Sollzeit gegen die echte Uhr; die Vorlage rechnet mit festen Vorführwerten. |
| „Active cycles" | `[cmd]` `stack_items.cycling` ist auf allen vier Positionen leer. |
| „Compliance 30d · 94%" im Kopf | `[cmd]` Ein Tag Protokoll. Steht jetzt als **„1 d logged"**. |
| „Cost · 12 months trend" | Kein Monatsverlauf vorhanden. |
| „+ €4.20 vs Apr" | Kein Vormonat vorhanden. |
| „Cost optimization" | Einkaufsempfehlungen, keine Rechnung. |
| Wochentagsspalte `Mon — Sun` | `[cmd]` `frequency` kennt `daily`/`weekdays`/`training_days`/`custom`/`cycling` — **keine Tagesliste.** Sieben Kästchen zu zeichnen, wo ein Wort steht, wäre eine Erfindung. Die Spalte zeigt `frequency` im Klartext. |

`[cmd]` **Eine Spalte wurde getauscht statt geleert:** „Typical dose"
ist auf **allen 44** Einträgen leer (`typical_dose_min IS NULL`),
`serving_size` auf **allen 44** gefüllt. Die Spalte heißt jetzt
„Serving" und zeigt 300 mg, 600 mg, 5 g. Eine Spalte voller Striche
wäre kein Nachweis gewesen, sondern Leerlauf.

---

## Was `Compliance` und `Cost` fehlt

### `Cost` fehlte nichts — die Annahme im Auftrag traf nicht zu

`[cmd]` Der Auftrag sagt: *„`Cost` braucht Preise — prüf, ob der
Katalog sie führt. Wenn nicht, bleibt der Tab Attrappe."*

**Er führt sie, lückenlos:**

| | |
|---|---|
| Einträge mit `cost_per_serving` | **44 von 44** |
| Einträge mit `serving_size` | **44 von 44** |
| Preisspanne | 0,04 € – 0,80 €, Median 0,15 € |

**Damit ist `Cost` angebunden**, und zwar ohne eine einzige geschätzte
Zahl. Was fehlt, ist nur der *Verlauf* (ein Protokolltag) und die
*Sparvorschläge* (keine Rechnung, sondern Einkaufsberatung).

### `Compliance` fehlen Tage — die Zahl ist 30

`[cmd]` Was die Vorlage dort rechnet, gemessen an
`tab-compliance.tsx`:

| Bauteil | Braucht |
|---|---|
| `ComplianceHeatmap` | **90 Tage** × Einnahmequote je Tag (13 Wochen × 7) |
| `ComplianceStrip` | **30 Tage** je Präparat, als Balken |
| Tabelle „key supplements" | **30 Tage**, je Präparat `taken`/`planned` + letzter Auslasser mit Grund |
| `CalendarView` | einen **Monat**, je Tag `taken`/`planned` |

`[cmd]` **Was liegt:** 4 Protokollzeilen an **1 Tag**, Status
`taken` 3 × und `planned` 1 ×. **Kein einziges `skipped`.**

**Die Sicht rechnet trotzdem** — `daily_intake_summary` liefert für
den 2026-08-18 `compliance_pct = 100`. `[read]` **Genau deshalb
bleibt der Tab Attrappe:** eine 100-%-Quote aus einem Tag ohne einen
einzigen Auslasser ist kein Befund, sondern ein Zufall. Die Kachel
„Compliance 30d · 94 %" durch „100 %" zu ersetzen wäre technisch
richtig und inhaltlich eine Täuschung.

**Was es bräuchte, mit Zahl:**

| Bauteil | Mindestens | Für ein aussagekräftiges Bild |
|---|---|---|
| Tagesquote im Kopf | **7 Tage** | 30 Tage |
| `ComplianceStrip` je Präparat | **30 Tage** | 30 Tage |
| Tabelle „key supplements" | **30 Tage** + mindestens ein `skipped` mit `notes` | 30 Tage |
| `ComplianceHeatmap` | **90 Tage** | 90 Tage |
| `CalendarView` | ein voller Kalendermonat | 1 Monat |

`[cmd]` Bei vier aktiven Positionen und täglicher Einnahme sind das
**4 Zeilen je Tag** — für 30 Tage also **120 Zeilen**, für die
Heatmap **360**. Aktuell liegen 4.

`[read]` **Und der Auslasser fehlt strukturell:** Ohne eine einzige
`skipped`-Zeile hat die Spalte „Last skip · reason" nichts zu zeigen,
egal wie viele Tage dazukommen. Wer Testdaten baut, braucht bewusst
Lücken — sonst prüft die Anzeige nur den Schönwetterfall.

---

## Was `refillUrgent` werden sollte

**Melden, nicht entscheiden** — wie der Auftrag es verlangt. Hier die
Grundlage für Toms Entscheidung.

### Der Befund

`[cmd]` In der Attrappe ist `refillUrgent` an **einem von neun**
Einträgen gesetzt und wird an **drei Stellen** gelesen; die übrigen
acht fallen auf die Warnfarbe zurück. In G-33 bewusst übernommen,
nicht begradigt.

`[cmd]` **In der Datenbank gibt es das Feld nicht.** `stack_items`
führt stattdessen zwei Zahlen:

| Spalte | Bedeutung |
|---|---|
| `stock_remaining` | Restbestand |
| `low_stock_threshold` | Schwelle, ab der nachbestellt werden soll |

`[cmd]` **Gemessen auf `dev@lumeos.app`:**

| Position | Bestand | Schwelle | unter Schwelle | Reichweite |
|---|---|---|---|---|
| Creatine Monohydrate | 180 g | 50 | nein | 180 d |
| **Vitamin D3** | **4 softgels** | **7** | **JA** | **4 d** |
| Omega-3 (EPA/DHA) | 30 softgels | 10 | nein | 30 d |
| Magnesium | 400 → 24 capsules | 10 | nein | 24 d |

**Genau der Testfall aus dem Auftrag** (`vitamin-d3`) ist der eine,
der auslöst.

### Die Empfehlung

`[annahme]` **Es sollte eine Schwelle sein, keine Handmarkierung** —
aus drei Gründen:

1. `[cmd]` **Die Daten tragen sie schon.** `low_stock_threshold` steht
   auf allen vier Positionen, und der Index
   `idx_stack_items_low_stock` ist in C-68 genau darauf gebaut. Eine
   Handmarkierung wäre eine zweite Wahrheit neben einer vorhandenen.
2. `[read]` **Eine Handmarkierung veraltet still.** Wer „dringend"
   setzt und nachbestellt, muss es zurücksetzen — sonst steht die
   Warnung dauerhaft. Die Attrappe zeigt das Muster bereits: ein Feld
   gesetzt, acht undefiniert.
3. `[read]` **Die Reichweite ist die bessere Aussage als die
   Schwelle.** „4 d left" sagt mehr als „unter 7 Stück", und sie
   ergibt sich aus Bestand ÷ Tagesdosis, also ohne neue Spalte.

**So ist es gebaut**, weil ohne Entscheidung sonst gar nichts
anzeigbar wäre: Die Kachel „Refills" listet, was `stock_remaining ≤
low_stock_threshold` erfüllt, sortiert nach Reichweite, und nennt die
Tage. **Eine Handmarkierung ist damit nicht verbaut** — käme ein Feld
`refill_urgent` dazu, wäre es ein zusätzliches ODER.

**Zu entscheiden bleibt:**

- **Soll die Schwelle je Position einstellbar sein** (sie ist es
  bereits im Schema) **oder aus der Reichweite abgeleitet werden**
  („weniger als 14 Tage")? `[read]` Letzteres ist einheitlicher,
  ersteres erlaubt lange Lieferzeiten je Präparat.
- **Braucht es eine zweite Stufe** („bald" gelb / „dringend" rot)?
  `[cmd]` Die Vorlage hat zwei Farben, die Datenbank eine Schwelle.

---

## Was nicht angebunden ist, und warum

| Tab | Grund |
|---|---|
| `Compliance` | `[cmd]` 1 Protokolltag, 0 `skipped` — siehe oben |
| `Interactions` | `[cmd]` `supplement_interactions` hat **0 Zeilen**, und C-68 hat die Bewertung ausdrücklich ausgelassen: was gefährlich ist, ist eine medizinische Aussage |
| `Injections` | `[cmd]` Kein Schema — weder Orte noch Protokoll noch Plan (G-45/G-57) |
| `Catalog`, `Stacks`, `Intelligence`, `Inventory` | `[cmd]` Aus `-spec.jsx`, kein Schema dafür |
| `Extended` | Hormonprotokolle, eigenes Thema hinter dem Gate |

---

## Nachweise

`[cmd]` Am Bildschirm geprüft, 2026-08-18, gegen den laufenden
Entwicklungsserver:

| Prüfung | Ergebnis |
|---|---|
| **Angemeldet als `dev@lumeos.app`** | `[cmd]` ja — Kopf zeigt „2026-08-18 · 4 active · 1 d logged" |
| **Kacheln ohne Marke** | `[cmd]` **14** (Today 4, Stack 1, Database 1, Cost 8) |
| Today | `[cmd]` 3/4, vier Positionen nach `timing` gruppiert, Herkunft `seed` |
| Stack | `[cmd]` 4 Positionen mit Dosis, Timing, Evidenz, €/Monat, Bestand |
| Database | `[cmd]` **44 von 44** Einträgen, Suche + Kategorienfilter |
| Cost | `[cmd]` €20,40/Monat · €0,68/Tag · €245/Jahr, Kategorien aus dem Katalog |
| **Zeilenschutz** | `[cmd]` als `test-user@lumeos.local`: **„0 active · 0 d logged"**, Today zeigt `0 / 0` und „Nothing below its threshold" — **leer, nicht fremdgefüllt** |
| **Konsolenfehler** | `[cmd]` **0** bei frischem Laden von `/v2/supplements` |
| `pnpm gate` | `[cmd]` **grün, 8 von 8 Aufgaben** |
| Vier Breiten | `[cmd]` 1440 / 1024 / 768 / **375 px** — **0 Karten mit Überlauf, kein Seitenüberlauf** |
| Hell und dunkel | `[cmd]` beide geprüft, Screenshots je Modus |

### Die Tests

`[cmd]` **Sieben neue Prüfungen** in
`src/lib/supplements/__tests__/stack-read.test.ts` — die reine
Rechnung ohne Netz. Darunter die Gegenprobe zur Messung: die vier
Positionen ergeben 0,68 €/Tag und 20,40 €/Monat.

`[cmd]` **Eine neue Prüfung** in `v2-attrappen.test.ts`: *„die
angebundenen Supplements-Fassungen tragen keine Marke."* **Beide
Richtungen gegengeprobt:**

- `TodayEcht` eine Marke gegeben → **rot** („liest echte Daten und darf
  keine Attrappenmarke tragen"), danach zurückgesetzt.
- `DatabaseAttrappe` die Marke genommen → **rot** („zeigt die Vorlage
  und muss die Attrappenmarke behalten"), danach zurückgesetzt.
- Vorher und nachher je **60 Tests grün, 0 rot.**

`[read]` **Warum die Zahl 17 in `tabs.tsx` unverändert bleibt:** Die
angebundenen Fassungen sind **neue** Komponenten (`TodayEcht`,
`StackMatrixEcht`, `StackListeEcht`, `DatabaseEcht`, `CostEcht`); die
alten bleiben als Rückfall stehen und behalten ihre Marken. Das
Zählen je Datei sähe deshalb unverändert aus, obwohl vier Tabs echt
geworden sind — **genau deshalb prüft der neue Test die Fassungen
einzeln.**

### Zwei Befunde am Rand

`[cmd]` **Der Modulkopf läuft über, und zwar schon vorher.** 860 px
Inhalt auf 810 px Fläche bei 1440 px Fenster. **Gegengeprobt:** mit
der alten, längeren Pille („Compliance 30d · 94%") sind es
**dieselben 860 px** — es sind die drei Aktionsknöpfe, nicht meine
Pillen. `overflow-x: hidden` fängt es ab. `/v2/recovery` zeigt es
nicht (812/812). **Nicht angefasst**, weil ausserhalb des Auftrags.

`[cmd]` **`user_stacks.total_monthly_cost` ist `null`**, obwohl die
Spalte existiert. Die Monatskosten werden deshalb aus den Positionen
gerechnet, nicht aus dem Feld gelesen. `[annahme]` Wer das Feld füllen
will, braucht einen Auslöser wie `refresh_stack_item_count` — sonst
driftet es gegen die Positionen.

### Aufräumen

`[cmd]` Sechs Messskripte liegen unter `tools/g37-*` (`.mjs`, `.py`,
`.js`). Sie sind **nur lesend** und dokumentieren, wie die Zahlen in
diesem Bericht entstanden sind. **Das Löschen wurde mir verweigert**
(Berechtigung) — sie gehören vor dem Commit entfernt.

**Nichts ist committet oder gestaged.**
