# Recovery als Mockup (G-21)

`[cmd]` Stand 2026-08-17. Route `/v2/recovery` angelegt, die Vorlage
übernommen. **Alles ist Attrappe** — 36 Kacheln, keine angebunden.

Die Seitenleiste führte seit G-02 einen Eintrag `Recovery`
(`packages/ui/src/shell/nav.ts:72`), der ins Leere zeigte. Er zeigt
jetzt auf das Modul.

---

## Was gebaut wurde

`[cmd]` Acht Dateien unter `apps/web/src/app/v2/recovery/`:

| Datei | Zeilen | Inhalt |
|---|---|---|
| `page.tsx` | 25 | Einstieg. Liest nichts — Begründung unten. |
| `ansicht.tsx` | 336 | Kopf, neun Tabs, Tab „Today" |
| `motor.ts` | 544 | Daten und Formeln, kein JSX |
| `tab-checkin.tsx` | 239 | Check-in samt Live-Vorschau |
| `tab-messwerte.tsx` | 365 | Muscle map, HRV, Sleep |
| `tab-protokolle.tsx` | 502 | Modalities, Overtraining, Protocols, Stress |
| `modale.tsx` | 500 | Die vier Modale |
| `koerperkarte.tsx` | 104 | Die Figur mit 18 Muskelgruppen |
| `kontext.tsx` | 62 | Modal- und Zustandskontext |
| `recovery.css` | 229 | Vier Raster — siehe „Was in v2.css fehlt" |

`[cmd]` `pnpm gate` grün (8/8). `[cmd]` 199 Tests grün, vorher 194 —
die fünf neuen stehen in `v2-attrappen.test.ts`.

---

## Was die fünf Vorlagendateien enthalten

**Das war die Frage, die der Auftrag zuerst gestellt hat.** Die Antwort
ist eine dritte, die es bei Nutrition und Training so nicht gab:

> **Es ist beides zugleich — ein System AUS zwei Rahmen, von denen einer
> den anderen ersetzt hat.**

### Der Beleg: `app.jsx:122`

`[cmd]` Die Anwendung entscheidet selbst, welcher Rahmen gilt:

```js
case "recovery":  return window.RecoveryModuleV2
  ? <window.RecoveryModuleV2 /> : <RecoveryModule />;
```

`RecoveryModuleV2` liegt vor (`module-recovery-v2.jsx:899`,
`Object.assign(window, { RecoveryModuleV2, … })`). **Die Bedingung ist
immer wahr; der alte Rahmen ist ein Notnagel, der nie greift.**
`[cmd]` `LumeOS.html:25-29` lädt die fünf Dateien in fester
Reihenfolge, `-v2.jsx` zuletzt.

**Übernommen ist deshalb `-v2.jsx`.**

### Datei für Datei

| Datei | Zeilen | Rolle | Übernommen? |
|---|---|---|---|
| `module-recovery-v2.jsx` | 899 | **Der geltende Rahmen** — neun Tabs, acht davon selbst gefüllt | **ja, ganz** |
| `module-recovery-engine.jsx` | 394 | **Daten und Formeln**, kein JSX. Speist beide Rahmen | **ja, ganz** (`motor.ts`) |
| `module-recovery-modals2.jsx` | 266 | Vier Modale **für den neuen Rahmen** | **ja, ganz** (`modale.tsx`) |
| `module-recovery.jsx` | 545 | Der **abgelöste** Rahmen — sieben andere Tabs | **nein** |
| `module-recovery-modals.jsx` | 567 | Sechs Modale **für den alten Rahmen** | **nein** |

**Die beiden Rahmen sind nicht verwandt.** Sie führen verschiedene
Tabs, verschiedene Kontexte (`RecCtx` gegen `RecCtx2`), verschiedene
Modale:

| | alter Rahmen | neuer Rahmen (gilt) |
|---|---|---|
| Tabs | Today, Sleep, Biometrics, Protocols, Body map, Stress, Insights | Today, Check-in, Muscle map, HRV, Sleep, Modalities, Overtraining, Protocols, Stress |
| Kontext | `RecCtx` | `RecCtx2` |
| Modale | 6 aus `-modals.jsx` | 4 aus `-modals2.jsx` |
| Rechnung | fest verdrahtete Zahlen | `-engine.jsx` |

**Der neue Rahmen ist die Spec-Fassung.** Seine Kopfzeile sagt es:
*„Recovery · spec UI"*; die des Motors: *„spec-compliant engine — 3
score modes, 18-muscle map, HRV PPG, overtraining signals"*. Der alte
kennt weder Check-in noch Übertraining noch Modalitäten — die drei
Dinge, die das Modul laut Spec ausmachen.

### Die Falle bei den Modalen

`[cmd]` Ein Grep nach `MuscleDetail` und `ProtocolDetail` trifft
**beide** Rahmen und legt nahe, `-modals.jsx` gehöre dazu. Das täuscht:
der neue Rahmen ruft `MuscleDetailModal2` und `ProtocolDetailModal`
auf (`-v2.jsx:61-62`), nicht `MuscleDetail` und `ProtocolDetail`.
**Die „2" im Namen ist die Fassung für den zweiten Rahmen.** Alle sechs
Modale aus `-modals.jsx` werden ausschliesslich von
`module-recovery.jsx` benutzt.

### Der neunte Tab steht in einer sechsten Datei

`[cmd]` **„Stress" steht in KEINER der fünf Dateien.** Beide Rahmen
rufen `window.RecoveryStress` auf (`module-recovery.jsx:47`,
`-v2.jsx:56`); definiert ist es in **`module-crossmodule-rest.jsx:22`**
— einer Sammeldatei, die daneben Goals-Fotoupload und die
Marketplace-Börse enthält. Ohne sie bliebe der neunte Tab leer.
Übernommen ist er mit, samt seiner Daten (`STRESS_TODAY`,
`STRESS_SOURCES`, `STRESS_BANDS`, `STRESS_14D`).

### Für das nächste Modul

Die drei bisherigen Module ergeben drei verschiedene Muster:

| Modul | Muster | Woran erkennbar |
|---|---|---|
| Nutrition | `-spec.jsx` ist eine **konkurrierende Fassung** | definiert dieselben Komponenten noch einmal |
| Training | die vier Dateien sind **ein System** | der Rahmen ruft `window.X` auf, die Begleitdatei definiert `window.X = …` |
| Recovery | **zwei Rahmen, einer abgelöst** | `app.jsx` wählt mit `window.XV2 ? … : …` |

**Die verlässliche Prüfung ist immer dieselbe: in `app.jsx` nachsehen,
was das Modul tatsächlich mountet.** Das ist die einzige Stelle, an
der die Vorlage selbst sagt, was gilt. Danach im gewählten Rahmen nach
`window.` greppen — was dort steht, muss aus einer Begleitdatei
kommen, sonst ist es eine Lücke.

---

## Was zuerst echte Daten bekommen könnte

`[cmd]` **`recovery` hat kein Schema.** Der Begriff kommt in
`supabase/_pipeline/` in **keiner einzigen SQL-Datei** vor — anders als
bei Training, wo immerhin 1.416 Übungen als Stammdaten liegen. Hier
gibt es nicht einmal Stammdaten.

**Damit ist die Antwort auf „was zuerst" eine andere als bei
Training:** Es gibt keine Kachel, die ohne neue Tabelle echt werden
kann. Die Frage ist, welche Tabelle den grössten Teil des Moduls
aufweckt.

### Die Reihenfolge

**1. `recovery.checkins` — eine Tabelle, sieben Kacheln.**

Der Check-in ist der billigste Anfang und der grösste Hebel. Die
Vorlage nennt ihn selbst *„the one required interaction"*. Die Spalten
stehen fertig in `CHECKIN` (`motor.ts`): `date`, `logged_at`,
`sleep_hours`, `sleep_quality`, `subjective_feeling`, `mood`,
`soreness` (JSONB je Muskelkürzel), `stress_level`, `alcohol_units`,
`caffeine_mg`, `screen_time_before_bed`, `hrv_rmssd`.

Damit werden echt:

- der **Check-in-Tab** selbst samt Live-Vorschau,
- der **Erholungswert** im `manual`-Modus — er braucht nur
  Check-in-Werte, **kein HRV, kein Wearable** (`calcRecoveryScore`,
  Gewichte 30/15/15/10/15/10/5),
- die **Kopfzeile** (Score, Bereitschaftsstufe, Ratschlag),
- die **Muskelkarte**, sobald Training Sitzungen hat — der
  Muskelkater-Anteil kommt aus dem Check-in, die Stunden und Sätze aus
  `training.sets`.

**2. `training.sessions` / `training.sets` — die Muskelkarte.**
`[read]` Das ist derselbe Punkt wie in `91-training-mockup.md`: ohne
Sitzungen kein `hours` und kein `sets`, und ohne die beiden rechnet
`calcMuscleRecovery` nicht. **Die Naht liegt fertig da:**
`MUSCLE_SLUG_MAP` (`motor.ts`) übersetzt 18 Trainings-Muskelnamen in
die Kürzel der Körperkarte. Wer Training anbindet, bekommt Recovery
zur Hälfte geschenkt.

**3. `recovery.modality_log` — Modalitäten.** Eigenständig, klein,
ohne Fremdabhängigkeit: Typ, Datum, Dauer, Detail, Sofortbewertung,
Folgetagsbewertung. Der Bonus samt Deckel (`MAX_DAILY_BONUS = 5.0`)
rechnet dann echt.

**4. `recovery.hrv_readings` — der `hrv`-Modus.** Braucht eine
Messquelle. Die Vorlage sieht drei vor (`phone_ppg`, `chest_strap`,
`wearable`); die Handykamera-Messung ist eine eigene Baustelle, kein
Anbinden.

**5. Schlaf.** Braucht ein Wearable. `[read]` Die Vorlage hat dafür
vorgesorgt: `calcSleepScore` kennt einen **subjektiven Rückfallpfad**
(0.6 × Qualität + 0.4 × Dauer) aus dem Check-in. *„The subjective path
is what most users get. It never blocks a score."* Damit ist Schlaf
teilweise schon mit Schritt 1 erledigt.

**Nicht anbindbar bleibt „Overtraining".** Die acht Signale vergleichen
7-, 3- und 5-Tage-Mittel gegen Grundlinien — sie brauchen Wochen an
Verlauf, nicht eine Tabelle. Die Kachel bleibt Attrappe, bis die
anderen vier laufen.

---

## Abweichungen von der Vorlage, mit Grund

**Nur Technisches.** Keine Kachel weggelassen, keine Zahl ersetzt,
keine Anordnung geändert.

| Abweichung | Grund |
|---|---|
| JSX → TypeScript | die App übersetzt mit |
| Klassen auf `v2-` | Präfixregel von v2.css |
| `window.RecoveryStress` → Import | Module statt globaler Namensraum |
| `window.dispatchEvent("rec-tab")` → `zeigeTab` im Kontext | das Ereignis war der Ersatz für Kontext, den die Vorlage an der Stelle nicht durchreichte |
| `color-mix(in srgb, …)` → `in oklch` | wie im Rest von v2 |
| Knöpfe ohne Ziel → `InEntwicklungKnopf` | Regel aus G-05 |
| Escape schliesst jedes Modal | die Vorlage hat es nicht; ohne ist ein Modal per Tastatur eine Sackgasse |
| `<div onClick>` → `<button>` bei Protokollen und Progressionsmodellen | dieselbe Begründung wie bei `Tabs` in packages/ui |
| Muskelflächen der Körperkarte tastaturbedienbar | ein SVG-Pfad mit `onClick` ist per Tastatur nicht erreichbar |
| `@media`-Haltepunkte | die Vorlage hat null |

### Drei Abweichungen, die eine Entscheidung waren

**1. `arr_r` gibt es nicht — der Pfeil der Vorlage zeichnet nichts.**
`[cmd]` `module-recovery-v2.jsx:811` schreibt
`<Icon name="arr_r" className="ic ic-sm"/>` im Warnungs-Lebenszyklus.
Ein Symbol `arr_r` existiert **weder in der Vorlage noch in
packages/ui** — es ist ein Tippfehler für `arrow_right`. **In der
Vorlage bleibt die Stelle deshalb leer.** Hier steht der gemeinte
Pfeil. Das ist eine Abweichung vom Bild, aber keine von der Absicht.

**2. Eindeutige `clipPath`-IDs in der Körperkarte.**
`[cmd]` Die Vorlage vergibt `bodyclip-front` und `bodyclip-back` fest
(`-v2.jsx:80`). Sobald zwei Karten gleichzeitig im Dokument stehen —
Today zeigt eine, das Muskeldetail-Modal die zweite — kollidieren die
IDs und beide Figuren greifen auf denselben Beschnitt zu. Hier vergibt
`React.useId()` je Einbindung eine eigene ID.

**3. Ein Textknoten statt drei im `<title>` der Muskelflächen.**
`[cmd]` **Am Bildschirm gemessen:** die Schreibweise der Vorlage
(`{label} · {wert}{einheit}` als drei Ausdrücke) erzeugte **32
Konsolenfehler** — der Server fasst die Knoten zusammen, der Browser
trennt sie, und React meldet eine Hydrations-Abweichung. Als ein
Template-Literal geschrieben: **1 Fehler**, und der ist der
vorbestehende `data-mode`-Hinweis aus `RootLayout`, der auf
`/v2/dashboard` genauso auftritt.

---

## Was in v2.css fehlt

`[read]` Der Auftrag: „fehlt eine Klasse oder ein Symbol: melden."

**Diesmal fehlt kein Symbol.** `[cmd]` Alle 19 gebrauchten liegen in
`icons.tsx`: moon, brain, droplet, camera, recovery, flame, alert,
edit, plus, check, play, x, chevron_right, chevron_down, trend_up,
zap, calendar, training, arrow_right. Anders als bei Training
(`chevron_up`).

**Bei den Klassen hat sich die Lage während des Auftrags geändert.**
`[cmd]` Ein anderer Agent hat die geteilten Raster nach `v2.css`
geholt und `app/v2/training/training.css` gelöscht. Zentral verfügbar
sind seither `v2-grid-14`, `v2-grid-15`, `v2-grid-21`, `v2-span-2` und
`v2-tbl-wrap`. **Dieses Modul benutzt sie**, statt sie zu wiederholen.

Übrig bleiben **vier Raster**, die es sonst nirgends gibt, in
`apps/web/src/app/v2/recovery/recovery.css`:

| Klasse | Verhältnis | Wo |
|---|---|---|
| `v2-rec-grid-13` | 1.3fr / 1fr | Check-in, Protocols |
| `v2-rec-grid-1135` | 1fr / 1.35fr | Muscle map — **links schmaler als rechts**, umgekehrt zu allen anderen |
| `v2-rec-grid-11` | 1fr / 1fr **mit Haltepunkt** | Modalities |
| plus zehn Detailraster | | Körperkarte, Score-Zeile, Schlafphasen, Formelkästen, Modalitätenwahl, Muskelrechnung, Stresszeile |

**`v2-grid v2-g-cols-2` ist kein Ersatz für `v2-rec-grid-11`.**
`[cmd]` `v2.css:470` setzt nur `grid-template-columns: 1fr 1fr` — ohne
Haltepunkt. Wo zwei Kacheln mit Tabellen nebeneinander stehen, bleiben
sie damit auch auf dem Telefon zweispaltig.

`[annahme]` Wandern auch diese vier später nach v2.css, fällt
`recovery.css` ganz weg.

---

## Nachweis

`[cmd]` Geprüft am 2026-08-17 im Browser, lokal auf Port 3200.

**Angemeldet als `test-user@lumeos.local`.** `[read]`
`docs/ssot/37-testkonten.md:15` führt für `dev@lumeos.app` „(Toms
eigenes)" Passwort — es steht nicht im Repo, und `.env.local` ist
durch einen Hook gesperrt. Für diese Prüfung macht es keinen
Unterschied: die Seite liest nichts, es gibt keinen Adminpfad und
keine rollenabhängige Anzeige.

| Punkt | Ergebnis |
|---|---|
| `/v2/recovery` zeigt das Modul | ja, Bildschirmfoto |
| Alle neun Tabs durchgeklickt | ja — je Tab `[selected]` **und** ein für ihn eindeutiger Inhalt geprüft |
| Jede Kachel trägt eine Marke | 36 von 36 |
| `v2-attrappen.test.ts` greift | ja, fünf neue Prüfungen |
| Jeder Knopf tut etwas | Modal oder Funktion, keiner tot |
| Modale öffnen und schliessen mit Escape | geprüft an „Measure HRV" und „Log modality" |
| `pnpm gate` | grün, 8/8 |
| Tests | 199 grün (vorher 194) |
| Drei Breiten | 1440 / 1100 / 640 — **alle neun Tabs je Breite geprüft**, 27 von 27 ohne waagerechtes Schieben |
| Konsole | 1 Fehler, derselbe wie auf `/v2/dashboard` (vorbestehend) |

**Die Live-Vorschau rechnet wirklich.** `[cmd]` Schlafdauer im
Check-in von 7,7 h auf 3 h gezogen: die Bereitschaft fällt von
„Good · Normal training" auf „Moderate intensity". Die Gewichte sind
die der Vorlage.

**Die Rechnungen liegen offen.** Jeder Messwert-Tab druckt seine
Herleitung als Text unter das Ergebnis — HRV
(`70 + z × 15`), Schlaf (`0.4 + 0.4 + 0.2`), Muskelerholung
(`base × volume × sleep × nutrition × soreness`). Das ist aus der
Vorlage übernommen und durch einen Test festgehalten.
