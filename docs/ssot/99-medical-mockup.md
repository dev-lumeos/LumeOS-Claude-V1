# Medical als Mockup (G-36)

`[cmd]` Stand 2026-08-17. Route `/v2/medical` angelegt, die Vorlage
übernommen. **21 Kacheln, alle als Attrappe markiert.**

`[cmd]` **Die Zählung: 56 von 56 vorhanden.** Das Skript liegt neben
der Route (`vollstaendigkeit.mjs`) und ist wiederholbar.

`[cmd]` Zehn Dateien unter `apps/web/src/app/v2/medical/`, 3.209 Zeilen
gegen 1.569 Zeilen Vorlage:

| Datei | Zeilen | Inhalt |
|---|---:|---|
| `page.tsx` | 24 | Einstieg. Liest nichts. |
| `ansicht.tsx` | 342 | Rahmen, fünf Tabs, Tab „Dashboard" |
| `daten.ts` | 431 | 48 Biomarker, fünf Formeln, kein JSX |
| `bausteine.tsx` | 113 | `RangeIndicator`, `FlagPill`, `TrendBadge` |
| `tab-biomarker.tsx` | 422 | Biomarkers, Import |
| `tab-tracking.tsx` | 598 | Tracking, Insights |
| `modale.tsx` | 922 | Die acht Modale |
| `kontext.tsx` | 36 | Der Modalkontext |
| `medical.css` | 119 | Sieben Raster |
| `vollstaendigkeit.mjs` | 202 | **Das Zählskript** |

---

## Welcher Rahmen gilt und wen er aufruft

**Ein abgelöster Rahmen wie bei Recovery — aber die rekursive Prüfung
fällt anders aus als bei Goals.**

### Erste Ebene: welcher Rahmen

`[cmd]` **`app.jsx:124`:**

```js
case "medical": return window.MedicalModuleV2
  ? <window.MedicalModuleV2 /> : <MedicalModule />;
```

`[cmd]` `MedicalModuleV2` wird gesetzt — nicht als `window.X = …`,
sondern über `Object.assign(window, { MedicalModuleV2, RangeIndicator,
FlagPill, TrendBadge, MedCtx2 })` (`module-medical-v2.jsx:818`). Die
Bedingung ist damit immer wahr; `module-medical.jsx` (809 Zeilen,
`window.MedicalModule` in Zeile 809) ist toter Notnagel.

**Übernommen ist `-v2.jsx`.**

### Zweite Ebene: und hier ist der neue Befund

`[read]` Aus G-28: *„`app.jsx` ist die verlässliche Prüfung, aber
rekursiv."* Bei Goals rief der Rahmen 5× `window.GoalsPhaseView` usw.

`[cmd]` **Ein Grep nach `window.` in `module-medical-v2.jsx` findet
NICHTS.** Nach dem Goals-Muster hiesse das: der Rahmen steht allein.
**Das ist falsch.**

`[cmd]` Der Rahmen ruft acht Modale und zwanzig Datennamen als **blosse
Globale** auf:

```jsx
{modal?.type === "biomarker" && <BiomarkerDetailModal b={…}/>}
```

— nicht `<window.BiomarkerDetailModal/>`. Definiert sind sie in
`module-medical-modals.jsx` als `window.BiomarkerDetailModal = …`.
**Beides funktioniert**, weil `LumeOS.html` alle vier Dateien in
denselben Skript-Gültigkeitsbereich lädt: was an `window` hängt, ist
zugleich eine globale Variable.

**Die Lehre:** Ein `window.`-Grep im Rahmen ist **nicht hinreichend**.
Wer ihn allein benutzt, hält den Rahmen für alleinstehend und baut
acht Modale und den halben Datenbestand nicht. **Zusätzlich muss man
prüfen, welche Grossbuchstaben-Namen der Rahmen benutzt, ohne sie
selbst zu definieren.** Genau das tut das Zählskript.

### Die vier Dateien

| Datei | Zeilen | Rolle | Übernommen? |
|---|---:|---|---|
| `module-medical-v2.jsx` | 818 | **Der geltende Rahmen** — 5 Tabs, alle selbst gefüllt | **ja, ganz** |
| `module-medical-data.jsx` | 298 | **Daten und Formeln**, kein JSX | **ja, ganz** (`daten.ts`) |
| `module-medical-modals.jsx` | 453 | Acht Modale | **ja, ganz** (`modale.tsx`) |
| `module-medical.jsx` | 809 | Der **abgelöste** Rahmen | **nein** |

`[cmd]` **`-data.jsx` ist neu in der Vorlagenwelt.** Bei keinem der
sechs bisherigen Module gab es eine reine Datendatei. Recovery hatte
mit `-engine.jsx` Formeln, aber keinen Katalog. Hier liegen **48
Biomarker** mit LOINC-Code, Doppelbereich und Sechs-Panel-Verlauf.
**Extrahiert, nicht abgetippt** — die Datei ist 1:1 nach `daten.ts`
übersetzt und durch einen Test auf 48 Einträge festgenagelt.

### Damit sieben Module, fünf Muster

| Modul | Muster |
|---|---|
| Nutrition | konkurrierende Fassung |
| Training | ein System, zweistufig (`window.X`) |
| Recovery | abgelöster Rahmen |
| Goals | ein System, dreistufig (`window.X`) |
| **Medical** | **abgelöster Rahmen + Zulieferer über blosse Globale** |

---

## Die Zählung je Tab

`[read]` `theme-v1-umsetzung.md`, *„Vollständigkeit wird gezählt, nicht
angesehen"*. `[cmd]` Bei Supplements wurden 1.605 Zeilen Vorlage zu 708
— unbemerkt, weil der Nachweis „alle Tabs durchgeklickt" lautete.

**Das Skript:** `apps/web/src/app/v2/medical/vollstaendigkeit.mjs`,
Aufruf aus `apps/web` mit `node src/app/v2/medical/vollstaendigkeit.mjs`.
Rückgabe 0 = vollständig.

```
OK   Dashboard    MedDashboard   — 0 Unterkomponenten, 5 Kacheln
OK   Biomarkers   MedBiomarkers  — 3 Unterkomponenten, 0 Kacheln
OK   Import       MedImport      — 0 Unterkomponenten, 7 Kacheln
OK   Tracking     MedTracking    — 0 Unterkomponenten, 1 Kacheln
OK   Insights     MedInsights    — 1 Unterkomponenten, 3 Kacheln

OK   Modale           — 8 Stueck
OK   Daten/Formeln    — 20 Stueck
OK   Rahmenbausteine  — 3 Stueck

56 von 56 vorhanden.
```

### Warum es nicht bei Unterkomponenten bleiben konnte

`[cmd]` **Drei Tabs melden „0 Unterkomponenten" — und das stimmt.**
Medicals Tabs rufen kaum eigene Komponenten auf; sie setzen die
Kacheln direkt mit `Card`, `Pill`, `Row`. Ein Skript, das nur Namen
zählt, hätte bei „0 von 0" **grün gemeldet, während vier von fünf
Kacheln fehlen.**

**Deshalb zählt das Skript zusätzlich die Kacheltitel** — `<Card
title="…">` — und prüft jeden gegen die Umsetzung. Das ist die Grösse,
die bei Supplements gefehlt hat. Beim ersten Lauf gegen das leere Modul
meldete es genau die 16 Titel, die zu bauen waren:

> `Health score | Alerts | Quick actions | Last panel | Non-optimal
> markers | Upload lab report | Pipeline | Confidence thresholds | Last
> extraction | Manual entry | Import history | Unit normalization map |
> Symptom → biomarker map | Population benchmark | Doctor export ·
> report structure | Generate report`

`[annahme]` Für das nächste Modul ist das die brauchbarere Grösse:
**Kacheltitel schlagen Komponentennamen**, weil ein Tab seine Kacheln
inline setzen kann, aber selten seinen Titel weglässt.

### Was das Skript nicht prüft

`[read]` Es zählt **Namen und Titel, nicht Inhalt.** Eine Kachel mit
richtigem Titel und halbem Inhalt fällt nicht auf. Das ist die
verbleibende Lücke; sie zu schliessen hiesse, die Vorlage zu parsen
statt zu greppen. **Für den Zweck reicht es:** der Supplements-Fehler
war eine fehlende Kachel, kein halber Inhalt.

---

## Was im Vorgängerrepo danebenliegt

**Für das Mockup zählte nur die Vorlage.** Was hier steht, ist für den
Schemaauftrag — `[read]` gemessen, nicht aus dem Auftrag übernommen:
die Pfade im Auftrag stimmten nicht, die Dateien liegen unter
`src/modules/medical/data/`.

| Datei | Grösse | Inhalt, gemessen |
|---|---:|---|
| `src/modules/medical/data/biomarkerDetails.ts` | **122 KB** | `[cmd]` 242 Einträge, 1.563 Zeilen |
| `src/modules/medical/data/biomarkerSynonyms.ts` | 15 KB | `[cmd]` **457 Synonympaare auf 91 kanonische Namen** |
| `scripts/seed-medical.ts` | 37 KB | Testdaten |
| `supabase/migrations/015_medical.sql` | 3 KB | `[cmd]` **7 Tabellen** |

### Die Synonyme lösen dieselbe Aufgabe wie unsere Lebensmittel-Aliase

`[read]` Der Dateikopf sagt es selbst: *„Maps common lab report names
(EN, DE, TH, abbreviations) → canonical DB name."*

`[cmd]` **457 Paare, davon 18 auf Thai.** Beispiel Hämoglobin:
`'hemoglobin'`, `'haemoglobin'`, `'hgb'`, `'hb'`, `'hämoglobin'` →
alle auf `'Hemoglobin'`.

**Das ist genau die Naht, die der Import-Tab des Mockups zeichnet.**
`[cmd]` Die Vorlage nennt dort als Pipeline-Schritt 3: *„extracted name
→ alias table → LOINC → biomarker_id"* — und wirbt im Uploadfeld mit
*„German, English, Thai lab formats supported"*. **Die Aliastabelle,
die dieser Satz voraussetzt, liegt fertig im Vorgängerrepo, in genau
den drei Sprachen.**

`[read]` Dieselbe Klasse Arbeit wie `nutrition`-Aliase — dort hat sie
Wochen gekostet. Wer den Medical-Schemaauftrag beginnt, ohne hier
nachzusehen, baut sie zum zweiten Mal.

### Die sieben Tabellen der alten Migration

`[cmd]` `015_medical.sql`: `biomarkers`, `lab_results`, `lab_values`,
`medications`, `medication_logs`, `symptom_types`, `symptom_logs`.

`[annahme]` Sie decken sich grob mit SPEC_06, benennen aber anders
(`lab_values` gegen `user_biomarker_results`). Der Schemaauftrag muss
entscheiden, welche Benennung gilt — **die Messung dieser Frage steht
noch aus.**

### Der Spec-Widerspruch, den das Audit nennt

`[cmd]` **Selbst nachgemessen, das Audit stimmt:**

- `docs/specs/Medical/SPEC_06_DATABASE_SCHEMA.md` führt **8**
  `CREATE TABLE`: `medical.biomarkers`,
  `medical.biomarker_reference_ranges`, `medical.lab_reports`,
  `medical.user_biomarker_results`, `medical.user_health_metrics`,
  `medical.user_symptoms`, `medical.user_medications`,
  `medical.medical_alerts`.
- `SPEC_02_ENTITIES.md` nennt `UserMedicalInsight` und
  `UserHealthReport` **4-mal**; `SPEC_06` definiert sie **0-mal**.

**Für das Mockup folgenlos** — die Vorlage zeigt beides ohnehin nicht.
**Für den Schemaauftrag nicht:** wer SPEC_06 abarbeitet, baut zwei
Entitäten weniger, als SPEC_02 verspricht, und merkt es nicht.

---

## Abweichungen von der Vorlage, mit Grund

**Nur Technisches.** Keine Kachel weggelassen, keine Zahl ersetzt.

| Abweichung | Grund |
|---|---|
| JSX → TypeScript | die App übersetzt mit |
| Klassen auf `v2-` | Präfixregel von v2.css |
| Blosse Globale → Importe | Module statt geteiltem Namensraum |
| `color-mix(in srgb, …)` → `in oklch` | wie im Rest von v2 |
| Knöpfe ohne Ziel → `InEntwicklungKnopf` | Regel aus G-05 |
| Escape schliesst jedes Modal | die Vorlage hat es nicht |
| `<div onClick>` → `<button>` (Vertraulichkeitsstufen, Marker-Liste) | dieselbe Begründung wie bei `Tabs` in packages/ui |
| `@media`-Haltepunkte | die Vorlage hat null |

### Drei Abweichungen, die eine Entscheidung waren

**1. `arr_r` nicht übernommen.** `[cmd]`
`module-medical-v2.jsx:708` schreibt `<Icon name="arr_r"/>` — ein
Symbol, das es weder in der Vorlage noch in `packages/ui` gibt; dort
zeichnet die Stelle **nichts**. Derselbe Tippfehler steht in vier
weiteren Modulen der Vorlage. Hier der gemeinte `arrow_right`, wie in
G-20 und G-21. **Ein Test hält fest, dass er nicht zurückkommt.**

**2. Zwei Symbole fehlen in `packages/ui` — gemeldet, ersetzt.**
`[cmd]` Geprüft gegen `icons.tsx`:

| Vorlage | Wo | Ersatz | Warum |
|---|---|---|---|
| `shield` | Kopfzeile „Privacy" (`-v2.jsx:28`) **und** Modalkopf (`-modals.jsx:411`) | `admin` | dasselbe Schutzschild-Motiv, das die Seitenleiste für den Adminbereich benutzt |
| `file` | Knopf „Choose file" (`-v2.jsx:341`) | `copy` | das Blattmotiv des Satzes |

Alle übrigen 20 gebrauchten Symbole liegen vor. **Ein Auftrag, der
`packages/ui` öffnen darf, sollte `shield` und `file` nachtragen** —
`shield` besonders, weil es zweimal an der sichtbarsten Stelle des
Moduls steht.

**3. Keine Hydrationsfalle gefunden — geprüft, nicht angenommen.**
`[cmd]` Weder `Math.random()` noch `Date.now()` noch `new Date()` in
den vier Medical-Dateien. Anders als bei Goals, wo `Math.random()` in
den Verlaufsdaten stand und ersetzt werden musste. **Am Bildschirm
bestätigt: 1 Konsolenfehler**, der vorbestehende `data-mode`-Hinweis.

### Was die Vorlage falsch macht und stehen bleibt

`[cmd]` **„Q2 2026 panel · 12 of 34 shown"** über einer Tabelle, die
`.slice(0,7)` zeigt — die Zahl stimmt weder mit der Anzeige noch mit
`OCR_EXTRACTED.length` (12). Übernommen.

`[cmd]` **Die Benchmark-Tabelle führt „Percentile" zweimal** als
Spaltenkopf — einmal der Balken, einmal die Zahl. Übernommen.

`[cmd]` **Der Tracking-Tab zeigt ALLE Symptome**, während die Tab-Zahl
nur die offenen zählt. Übernommen.

---

## Nachweis

`[cmd]` Geprüft am 2026-08-17 im Browser, lokal auf Port 3200.

**Angemeldet als `test-user@lumeos.local`.** `[read]`
`docs/ssot/37-testkonten.md:15` führt für `dev@lumeos.app` „(Toms
eigenes)" Passwort — es steht nicht im Repo. Für diese Prüfung ohne
Belang: die Seite liest nichts.

| Punkt | Ergebnis |
|---|---|
| `/v2/medical` zeigt das Modul | ja, Bildschirmfoto je Tab |
| **Das Zählskript** | **56 von 56** |
| Alle fünf Tabs, je Breite | **15 von 15** — aktiv **und** eigener Inhalt |
| Jede Kachel trägt eine Marke | 21 von 21 |
| `v2-attrappen.test.ts` greift | ja, fünf neue Prüfungen |
| Jeder Knopf tut etwas | Modal oder Funktion, keiner tot |
| Modale schliessen mit Escape | geprüft an Doctor export, Privacy, Biomarker-Detail |
| **Konsolenfehler** | **1** — der Normalwert (`data-mode`) |
| Drei Breiten | 1440 / 1100 / 640 — 15 von 15 ohne waagerechtes Schieben |
| `pnpm gate` | grün, 8/8 |
| Tests | 214 grün (vorher 209) |

**Die Rechnungen liegen offen.** Der Dashboard-Tab druckt seine
Herleitung als Text: `overall = Σ(system_score × weight) /
Σ(weight_with_data)`, die fünf Gewichte und die Flaggenpunkte. Am
Bildschirm: Health score **81** aus Liver 92, Cardiovascular 88,
Kidney 66, Hormonal 96, Metabolic 66.

**Der Doppelbereich funktioniert.** `[cmd]` Glucose (fasting) steht
mit 102 mg/dL über der Laborobergrenze 99 und wird als **High**
geflaggt; HbA1c mit 5,4 % liegt im Labor-, aber über dem Optimalband
und heisst **Normal**. Genau diese Unterscheidung ist die Kernaussage
des Moduls — sie ist der Grund, warum `RangeIndicator` zwei Bänder
zeichnet statt einem.

---

## Für das nächste Modul

1. **`app.jsx` prüfen — und dann prüfen, was der Rahmen ohne
   `window.`-Präfix benutzt.** Bei Medical hätte der Grep allein acht
   Modale unterschlagen.
2. **Kacheltitel zählen, nicht nur Komponentennamen.** Drei von fünf
   Medical-Tabs haben null Unterkomponenten und trotzdem fünf bis
   sieben Kacheln.
3. **Das Zählskript ist übertragbar:** `vollstaendigkeit.mjs` braucht
   nur die drei Dateinamen und die Tab-Zuordnung am Kopf.
