# Inventory, Compliance und die Rückfallfassungen (G-74)

**Stand:** 2026-08-20 · **Auftrag:** G-74 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

Vorgeschichte: `docs/ssot/114-supplements-angebunden.md` (G-37, die
ersten vier Tabs), `docs/ssot/121-supplements-bestandsaufnahme.md`
(F-02, was noch fehlt).

---

## Kurzfassung

`[cmd]` **Drei Tabs mehr lesen echt** — Inventory, Compliance und die
zwei fehlenden Cost-Kacheln. **Und der Markenzähler kann jetzt
unterscheiden**, was nie angebunden war und was abgelöst, aber
aufgehoben ist.

| | |
|---|---|
| Marken in `tabs.tsx` `[cmd]` | **1 echte Attrappe · 16 Rückfallfassungen** (vorher: pauschal 17) |
| Nachfüllstufen `[cmd]` | alle drei lösen aus: **4 d · 14 d · 24/30 d** |
| Compliance `[cmd]` | **93,1 %** über 30 Tage, nicht 100 |
| Kostenverlauf `[cmd]` | **4 Monatspunkte** aus dem Protokoll, nicht 12 |
| `pnpm gate` `[cmd]` | 8 von 8 grün · **378 Tests** (15 neu) |

---

## 1. Wie die Rückfallfassungen markiert sind

**Tom, 2026-08-19:** *„Im Code ausdokumentieren, sprich den Code als
alten Mockup-Code markieren, falls wir später was brauchen."*

### Das Problem, das zu lösen war

`[cmd]` Seit G-37 stehen die angebundenen Fassungen **neben** den
alten, die als Rückfall bleiben:

```
SuppToday() → daten ? <TodayEcht/> : <TodayAttrappe/>
```

`[cmd]` **Der Zähler in `v2-attrappen.test.ts` meldete deshalb weiter
17** — dieselbe Zahl wie vor der Anbindung, obwohl vier Tabs echt
lesen. Die Zahl beschrieb die Lage nicht mehr.

`[read]` **Goals hat es anders gelöst** (GO-16): die Attrappenfassungen
wurden gelöscht, `ansicht.tsx` schrumpfte von 772 auf 315 Zeilen.
**Tom will hier den dritten Weg** — stehenlassen, aber erkennbar.

### Die Lösung: eine zweite Marke

`[cmd]` Die Rückfallfassungen tragen seit G-74
`attrappe={RUECKFALL}` statt `{ATTRAPPE}`:

```ts
const RUECKFALL = 'Rueckfallfassung: der urspruengliche Entwurf. Die '
  + 'angebundene Fassung steht daneben und wird gezeigt, sobald Daten '
  + 'vorliegen — diese hier bleibt als Vorlage aufgehoben (G-74).'
```

`[read]` **Warum eine Konstante und kein Kommentar:** Der Auftrag
verlangt es ausdrücklich — *„Die Markierung muss maschinenlesbar sein,
nicht nur ein Kommentar für Menschen."* Ein Kommentar hätte den Zähler
nicht klüger gemacht.

**Die Marke leistet zweierlei:**

- **Für Menschen** steht der Grund an der Kachel: wer eine
  Rückfallfassung wieder braucht, findet sie daran; wer sie löschen
  will, sieht, dass es eine bewusste Aufbewahrung war und kein
  vergessener Code.
- **Für den Zähler** ist sie ein eigenes Muster.

### Wie der Zähler sie liest

`[cmd]` Der Test zählt jetzt **zwei Zahlen je Datei**:

| Datei | echte Attrappen | Rückfallfassungen |
|---|---|---|
| `tabs.tsx` | **1** | **16** |
| `tab-extended.tsx` | 6 | 0 |
| `tab-compliance.tsx` | 4 | 0 |

`[cmd]` **Die eine verbliebene Attrappe ist `SuppInteractions`** — der
Tab hat keine angebundene Fassung daneben und ist damit keine
Rückfallfassung, sondern schlicht unangebunden.

**Ein zweiter Test hält fest, dass die Marke am richtigen Ort sitzt:**

- Die sechs abgelösten Fassungen (`TodayAttrappe`, `SlotCard`,
  `StackMatrix`, `StackList`, `DatabaseAttrappe`, `CostAttrappe`)
  tragen **nur** `RUECKFALL`.
- `SuppInteractions` trägt **nur** `ATTRAPPE` — die Rückfallmarke wäre
  dort eine Lüge, weil keine echte Fassung danebensteht.

`[read]` **Ohne diesen zweiten Test wäre die Trennung Kosmetik:** wer
`RUECKFALL` an eine nie angebundene Kachel schriebe, behauptete, daneben
stehe eine echte Fassung.

`[cmd]` **Der ältere G-37-Test wurde angepasst**, nicht ersetzt: er
prüft weiterhin, dass angebundene Fassungen **keine** Marke tragen und
Rückfallfassungen **eine** — jetzt zählt er beide Muster als „markiert".

---

## 2. Was Inventory zeigt

`[cmd]` Vier Kopfzahlen und die Bestandstabelle, gerechnet aus
`stack_items`:

| Kopfzahl | Wert |
|---|---|
| Positionen | **4** im aktiven Stack |
| Bestellen | **2**, davon **1 dringend** |
| Im Blick | **2** unter 1 Monat |
| Nachkauf · 90 Tage | **61,20 €** |

### Die drei Stufen und was sie auslöst

`[read]` Toms Entscheidung: die Stufe kommt aus der **Reichweite**,
nicht aus einer Schwelle je Position — *„‚4 d left' sagt mehr als
‚unter 7 Stück'"*.

| Präparat | Bestand | Reichweite | Stufe |
|---|---|---|---|
| **Vitamin D3** | 4 softgels | **4 d** | dringend · unter 1 Woche |
| **Omega-3** | 14 softgels | **14 d** | bestellen · unter 2 Wochen |
| **Magnesium** | 24 capsules | **24 d** | im Blick · unter 1 Monat |
| **Kreatin** | 150 g | **30 d** | im Blick · unter 1 Monat |

`[cmd]` **Alle drei Stufen lösen aus** — im Browser belegt.

### Die Reichweite hängt an der Einheit — der wichtigste Befund

`[cmd]` **Die alte Formel rechnete falsch.** `ableiten` teilte den
Bestand immer durch die *Portionen* pro Tag. Für Kreatin ergab das:

```
30 g ÷ 1 Portion/Tag = 30 Tage        ← falsch
30 g ÷ 5 g/Tag       =  6 Tage        ← richtig
```

**Der Auftragstext nannte ebenfalls „Kreatin bei 30"** — die Zahl
stammte aus einem älteren Bericht, ohne dass die Einheit geprüft
worden wäre.

`[read]` **Tom dazu:** *„`stock_unit` sagt `g`, und die Tagesdosis sagt
5 g. Die Spalten sind eindeutig — sie zu ignorieren, weil eine
Auftragszahl anders klingt, wäre der Fehler. Meine Zahl war falsch,
nicht deine Rechnung."*

**Die Regel, die daraus folgt:**

| Fall | Rechnung |
|---|---|
| `stock_unit == dose_unit` | Bestand ÷ **Tagesdosis** |
| ungleich (Stück gegen mg/IU) | Bestand ÷ **Portionen pro Tag** |

`[cmd]` Der Vergleich ignoriert Gross-/Kleinschreibung und Leerraum —
`„ G "` und `„g"` sind dieselbe Einheit.

`[cmd]` **`low_stock_threshold` bleibt der Rückfall**, wo keine
Reichweite berechenbar ist. Die Schwelle kennt keine Abstufung, deshalb
liefert sie die **mittlere** Stufe: eine Warnung ist richtiger als ein
Hinweis, wenn man nicht weiss, wie knapp es ist.

### Ein Nachtrag: die Seeds wurden mitten im Auftrag korrigiert

`[cmd]` Beim Messen führte Kreatin **30 g** (= 6 Tage, Stufe
*dringend*). Um **04:09** wurde der Bestand auf **150 g** geändert —
damit sind es 30 Tage und die Stufe *Hinweis*. **Die Formel liefert in
beiden Fällen das Richtige**; die Verteilung des Auftragstexts stimmt
nach der Korrektur.

`[read]` Genau das hatte Tom vorgesehen: *„Dass keine Monatsstufe
auslöst, ist dann ein Datenbefund — melde ihn. Wenn Codex die Seeds das
nächste Mal anfasst, kann er einen Fall dafür anlegen."*

### Was Inventory nicht zeigt

`[cmd]` **Das Verfallsdatum.** Die Vorlage führt eine Spalte `Expiry`
und eine Kopfzahl „Expiring soon". **`stack_items` hat keine solche
Spalte** — die Spalte entfällt, statt ein Datum zu raten. Der Hinweis
unter der Tabelle sagt es.

---

## 3. Was Compliance zeigt und was fehlt

`[cmd]` **Die Datenlücke aus F-02 ist zu:** 360 Einnahmen über 90 Tage,
**32 `skipped`**.

| Kachel | Wert |
|---|---|
| Heatmap · 90 Tage | 90 Tage erfasst, 360 Einträge |
| 30 Tage | **93,1 %** — 108 genommen, 8 ausgelassen |
| Je Präparat | vier Zeilen, je **27 von 29** = 93,1 % |
| Letzter Auslasser | **2026-08-13**, 4 Präparate |

`[cmd]` **Der Auftrag nennt 93,3 %; gemessen sind 93,1 %.** Die Zahl
wandert mit dem Fenster — der Bestand endet am 2026-08-19, der Stichtag
ist der 20. **Nicht angeglichen:** eine Anzeige, die eine Zahl
festhält, damit sie zum Auftrag passt, wäre die falsche Richtung.

### „Last skip · reason" — das Datum ist echt, der Text nicht

**Der Auftrag verlangte, vorher zu messen.** `[cmd]` Gemessen:
**alle 32 `skipped`-Zeilen tragen `notes`** — F-02 hatte es nicht
geprüft. Aber der Inhalt ist ein Erzeugungsvermerk:

> *„C-82 Szenario: voller Supplement-Tag ausgelassen, gekoppelt an
> harte Trainings-/Erholungsphase"*

`[read]` **Tom dazu:** *„Das Datum ist echt, der Text ist es nicht.
Der Seed-Marker ist eine Herkunftsangabe, kein Nutzergrund."* Und:
*„Der Hinweis muss sagen, was fehlt — nicht ‚aus dem Seed', sondern:
ein eingegebener Grund liegt nicht vor. Der Nutzer weiss nicht, was ein
Seed ist."*

**Gebaut ist deshalb:** Datum und Zahl der betroffenen Präparate, dazu
der Satz *„Ein Grund ist nicht hinterlegt — beim Auslassen wird bisher
keiner erfasst."*

`[read]` **Für die Seeds gemeldet:** Wenn `notes` bei `skipped` einen
Nutzergrund tragen soll, braucht der Erzeuger plausible Texte —
„vergessen", „unterwegs", „keine Lust". Eigener Punkt, nicht Teil
dieses Auftrags.

### Zwei Entscheidungen in der Heatmap

`[cmd]` **Tage ohne Eintrag bleiben leer, nicht 0 %.** „nichts erfasst"
und „nichts genommen" sind zwei Aussagen; die Legende und ein Satz
darunter sagen es.

`[cmd]` **Gruppiert wird nach `supplement_name_snapshot`, nicht nach
`stack_item_id`** — der Fremdschlüssel ist `ON DELETE SET NULL`, ein
Eintrag kann seine Position überleben. Wer nach der Id gruppiert,
verliert diese Zeilen stillschweigend. Ein Test hält es fest.

### Was Compliance nicht zeigt

| Was die Vorlage hat | Warum es fehlt |
|---|---|
| **Streaks je Präparat** | `[cmd]` Braucht eine ununterbrochene Kette; die Daten haben regelmässige Lücken (32 Auslasser). Eine Serie zu zeigen, die an jedem Auslasser reisst, wäre eine Zahl ohne Aussage — **gemeldet, nicht gebaut.** |
| **Kalenderansicht** | `[cmd]` Die Umschaltung Heatmap/Kalender bleibt im Entwurf; die echte Fassung zeigt die Heatmap. Der Kalender wäre dieselbe Information in anderer Form. |

---

## 4. Was Cost noch nicht kann

`[cmd]` **Cost liest seit G-37** — 20,40 €/Monat, 0,68 €/Tag.
**Zwei Kacheln kommen dazu:**

### Der Verlauf: vier ehrliche Punkte

| Monat | Kosten | Tage |
|---|---|---|
| 2026-05 | 6,12 € | 9 d |
| 2026-06 | 18,36 € | 27 d |
| 2026-07 | 19,04 € | 28 d |
| 2026-08 | 12,24 € | 18 d |

`[read]` Der Auftrag: *„3 ehrliche Monatspunkte statt 12. Zwölf zu
zeigen wäre erfunden."* `[cmd]` **Es sind vier** — das Protokoll reicht
vom 22.05. bis 19.08. und berührt damit vier Kalendermonate.

`[cmd]` **Gerechnet aus den tatsächlich genommenen Einnahmen**, nicht
aus dem Monatspreis: ein ausgelassener Tag kostet nichts.

`[cmd]` **Der erste und der letzte Monat sind angeschnitten** und
werden **gestrichelt** gezeichnet. Ohne diese Kennzeichnung läse sich
der Verlauf als Rückgang von 19,04 auf 12,24 € — tatsächlich ist der
August nur halb vorbei.

### „If you removed…": reine Subtraktion

| Präparat | Spart/Monat | Rest/Monat | Anteil |
|---|---|---|---|
| Omega-3 | 9,00 € | 11,40 € | 44,1 % |
| Kreatin | 4,50 € | 15,90 € | 22,1 % |
| Magnesium | 4,50 € | 15,90 € | 22,1 % |
| Vitamin D3 | 2,40 € | 18,00 € | 11,8 % |

`[read]` **`Cost optimization` bleibt draussen** — *„Beratung, keine
Rechnung."* Der Satz unter der Tabelle sagt es: *„Was ein Präparat
kostet, nicht was es bringt."*

---

## 5. Ein Fehler beim Bau, im Browser gefunden

`[cmd]` **Die Seite antwortete mit HTTP 500.** Ursache: die neue
Rechendatei importierte `nachfuellstufe` als **Wert** aus
`stack-read.ts` — und die importiert `next/headers`. Damit zog eine
Client-Komponente das Server-I/O-Modul ins Browserbündel:

> *„You're importing a component that needs next/headers."*

**Behoben,** indem die Stufenrechnung nach `auswertung.ts` gezogen
wurde; aus `stack-read.ts` kommen nur noch **Typen**. Ein Kommentar an
beiden Stellen hält den Grund fest.

`[read]` Gefunden wurde er nur, weil die Seite im Browser aufgerufen
wurde — **der Typecheck war grün.** Ein Test auf „Datei kompiliert"
hätte ihn nicht gezeigt.

---

## 6. Nachweis

### Angemeldet, beide Modi

`[cmd]` Als `dev@lumeos.app`, 1440 × 1100, hell und dunkel: Inventory
mit vier Kopfzahlen und der Bestandstabelle, Compliance mit Heatmap und
93,1 %, Cost mit Verlauf und Subtraktionstabelle.

### Zeilenschutz

`[cmd]` Als `test-user@lumeos.local` im Browser: **beide Tabs fallen
auf den Entwurf zurück**, mit Marke — keine leere echte Kachel.

`[cmd]` **An der Datenbank gegengeprüft:**

| Rolle `authenticated`, `sub` = | Stacks | Positionen | Einnahmen | Katalog |
|---|---|---|---|---|
| `dev@lumeos.app` | 1 | 4 | 360 | 44 |
| `test-user@lumeos.local` | **0** | **0** | **0** | **44** |

`[cmd]` **Und der Quergriff:** test-user fragt ausdrücklich nach
`user_id = dev` → **0 Zeilen.** Der Katalog bleibt sichtbar, wie es
sein soll.

### Breiten

`[cmd]` Seitenüberlauf bei **375 · 768 · 1024 · 1440 px: keiner.**

### Gate und Tests

| | |
|---|---|
| `pnpm gate` `[cmd]` | **8 von 8 grün** |
| Alle Tests `[cmd]` | **378 von 378** (vorher 363) |
| Neu `[cmd]` | **15** in `lib/supplements/__tests__/auswertung.test.ts` |

**Die Prüfungen halten die Entscheidungen fest:**

1. *„die Reichweite folgt der Einheit — Kreatin reicht 6 Tage, nicht
   30"* — der Fall, um den es ging.
2. *„ohne Einheiten bleibt die alte Lesart"* — rückwärtsverträglich.
3. *„die drei Nachfüllstufen greifen an ihren Grenzen"* — 7/14/30, und
   der Schwellen-Rückfall.
4. *„der Nachkaufwert bleibt null, wenn ein Preis fehlt"* — eine zu
   niedrige Summe wäre schlimmer als keine.
5. *„ein leeres Fenster ergibt keine Quote von 0 %"*.
6. *„die Compliance gruppiert nach Namen, nicht nach `stack_item_id`"*.
7. *„Tage ohne Eintrag erscheinen nicht als 0 Prozent"*.
8. *„angeschnittene Monate sind als solche gekennzeichnet"*.

**Dazu zwei Prüfungen für Teil A** in `v2-attrappen.test.ts`: die
zweigeteilte Zählung und *„die Rückfallmarke sitzt an den abgelösten
Fassungen"*.

---

## 7. Was als Nächstes ansteht

1. **Seeds: `notes` bei `skipped` mit Nutzergründen füllen** — dann
   trägt „Last skip · reason" einen echten Grund.
2. **Streaks je Präparat entscheiden** — die Daten haben regelmässige
   Lücken; eine Serie, die an jedem Auslasser reisst, sagt wenig.
3. **`expiry` am Stack** — die Vorlage zeigt es, die Tabelle führt es
   nicht.
4. **Kalenderansicht der Compliance** — dieselbe Information, andere
   Form.
5. **Die vier verbliebenen Attrappen-Tabs** — Interactions (C-108),
   Extended (C-113/C-118), Injections (C-109), Intelligence.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| 360 Einnahmen, 32 `skipped` | `GROUP BY status` auf `intake_logs` |
| 93,1 % über 30 Tage | `count FILTER (WHERE status='taken')` gegen `count(*)` |
| Alle 32 `skipped` tragen `notes` | `count(notes)` je Status |
| Der Text ist ein Seed-Vermerk | `SELECT notes … WHERE status='skipped' LIMIT 8` |
| Kreatin 30 g bei 5 g/Tag = 6 Tage | Einheitenvergleich in SQL, beide Lesarten gegenübergestellt |
| Kreatin-Bestand um 04:09 auf 150 g geändert | `updated_at` in `stack_items` |
| Vier Monatspunkte | `GROUP BY to_char(intake_date,'YYYY-MM')` |
| 20,40 €/Monat | `sum(cost_per_serving × dose/serving_size × 30)` |
| Marken 1 + 16 in `tabs.tsx` | `grep -c` je Muster + `v2-attrappen.test.ts` |
| HTTP 500 durch `next/headers` | Browserkonsole, Fehlertext wörtlich |
| Zeilenschutz | `SET LOCAL ROLE authenticated` mit zwei `sub`-Werten + Quergriff + Browser |
| Kein Seitenüberlauf 375–1440 | `scrollWidth > clientWidth` je Breite |
| Gate, Tests | `pnpm gate` 8/8 · 378/378 |
