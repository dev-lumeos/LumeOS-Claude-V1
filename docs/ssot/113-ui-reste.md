# Die Reste in `packages/ui` und im Raster (G-56)

**Stand:** 2026-08-18 · **Auftrag:** G-56 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

---

## Kurzfassung

`[cmd]` **Zehn der zwölf Punkte sind erledigt, zwei sind gemessen
erledigt gewesen** — einer davon war nie ein Problem, einer war es und
ist es nicht mehr, ohne dass jemand ihn angefasst hätte.

`[cmd]` **Bei 375 px schiebt keine der acht Modulseiten mehr.** Vorher
schoben alle acht, zwischen 530 und 606 px breit.

`[cmd]` **Die Raster gingen von 70 auf 68 Deklarationen zurück** — und
die Zahl allein sagt wenig, weil die meisten „Raster" derselbe
Klassenname bei verschiedenen Haltepunkten sind. Abschnitt 3.

**Und ein Messfehler in eigener Sache:** `[cmd]` Die Berichte zu G-40,
G-42 und G-46 melden „Querlauf bei 375 px". Diese Messung war
teilweise wertlos — nicht falsch im Ergebnis, aber nicht belastbar
gewonnen. Abschnitt 2.

---

## 1. Was je Punkt geschehen ist

| # | Punkt | Was daraus wurde |
|---|---|---|
| 1 | **`shield`** (G-36, G-40, G-42) | **Gebaut.** Eigenes Motiv, nicht `admin` |
| 2 | **`history`** (G-40) | **Gebaut** |
| 3 | **`file`** (G-36, G-42) | **Gebaut** |
| 4 | **`Pill` ohne `dot`** (G-39) | **Gebaut**, beide Nachbauten aufgelöst |
| 5 | **kein `Empty`** (G-39) | **Gebaut**, Nachbau aufgelöst |
| 6 | **`v2-g-cols-5`** (G-50) | **Gebaut**, Nachbau aufgelöst |
| 7 | **`InEntwicklungKnopf` ohne `disabled`** (G-52) | **Gebaut**, Doppelzweig in Supplements aufgelöst |
| 8 | **375 px schiebt** (G-41) | **Behoben** — aber die Ursache war eine andere |
| 9 | **`.v2-btn` ohne `nowrap`** (G-23) | **Behoben** |
| 10 | **Modulkopf bricht um** (G-34) | **Entschärft**, Entscheidung offen (siehe unten) |
| 11 | **`.v2-card-h` bricht Titel** (G-34) | **Behoben** |
| 12 | **Modul-Raster zusammenführen** (G-27, G-35) | **Teilweise** — zwei zusammengeführt, Recovery bewusst nicht |
| D1 | **JetBrains Mono** (G-24) | **Geladen**, im Browser belegt |
| D2 | **`btn-accent` ohne Modulakzent** (G-10) | **Trifft nicht mehr zu** — gemessen |

### Die drei Symbole (1–3)

`[cmd]` **Sie fehlen nicht nur hier — sie fehlen auch in der Vorlage.**
`shared.jsx` definiert keines der drei; die Modulvorlagen rufen sie
**14-mal** auf (`shield` 10×, `file` 3×, `history` 1×). Dort rendert
`<Icon name="shield"/>` still nichts. Hier wäre es seit G-02 ein
Übersetzungsfehler, weil `IconName` eine Union über die vorhandenen
Schlüssel ist — deshalb haben G-36, G-40 und G-42 ersetzt statt
weggelassen.

`[cmd]` **`shield` ist bewusst nicht dasselbe Motiv wie `admin`.** Das
Schutzschild der Seitenleiste ist massiv und steht für einen Bereich;
das neue trägt einen Haken und steht für eine Zusicherung („You own
your data", „Policy gate"). Wer beide gleich zeichnet, nimmt der
Überschrift ihre Aussage.

### `Pill dot` und `Empty` (4–5)

`[read]` Der Auftrag: *„Wer sie beim zweiten Modul nachbaut, baut sie
falsch."*

`[cmd]` **Genau das war passiert.** Die zwei `PunktPill`-Nachbauten
waren schon verschieden: `coach/ai/bausteine.tsx` hatte eine
Farboption (`farbe`), `coach/bausteine.tsx` nicht. Die zentrale
Fassung kann beides — `dot` nimmt `true` (folgt der Pillenfarbe) oder
einen Farbwert.

`[cmd]` Der Punkt benutzt jetzt die vorhandene Klasse `v2-dot` für
Größe und Form statt eines Inline-Stils; nur die Farbe kommt aus der
Requisite. Die Nachbauten hatten `width/height/borderRadius` dreimal
eigenständig gesetzt.

`[cmd]` `Empty` gab es in der Vorlage ebenso wenig wie die drei
Symbole — fünf Aufrufe, keine Definition.

### Der gesperrte Knopf (7)

`[read]` *„Ein Knopf, der eine Grenze nicht durchsetzt, sieht aus wie
eine Sicherung und ist keine."*

`[cmd]` In `supplements/modale.tsx` stand ein doppelter Zweig: ein
echter `<button disabled>` für den gesperrten Fall, `InEntwicklungKnopf`
nur für den freigegebenen. Jetzt ein Aufruf mit `disabled={gesperrt}`.

**Die Reihenfolge ist die Sache:** `disabled` schlägt das Fenster. Ein
gesperrter Knopf, der noch ein Attrappenfenster öffnet, wäre genau die
Sicherung, die keine ist — ein Test hält das fest
(`offen && !disabled`).

### Der Modulkopf (10) — was ich für richtig halte

`[cmd]` Behoben ist das Technische: `.v2-module-header` und
`.v2-module-actions` brechen jetzt kontrolliert um, statt sich
gegenseitig zu quetschen.

`[read]` **Welche Knöpfe in den Kopf gehören, entscheidet Tom.** Was
ich für richtig halte:

Die Vorlage zeigt **vier**. Dazugekommen sind die Datumsnavigation als
Block und „Lebensmittel suchen". `[annahme]` Die Datumsnavigation ist
kein Knopf, sondern ein Zustand — sie sagt, *welchen Tag man sieht*,
nicht *was man tun kann*. Sie gehört meines Erachtens **unter** die
Kopfzeile, auf Höhe der Tableiste, wo auch die Filter stehen. Dann
blieben fünf Knöpfe, und der Kopf käme bei 1.600 px wieder in eine
Zeile.

**Nicht gebaut** — das wäre eine Entscheidung über die Anordnung, keine
Aufräumarbeit.

### JetBrains Mono (D1)

`[cmd]` Geladen wie Inter: `next/font/google`, beim Bauen
heruntergeladen, vom eigenen Server ausgeliefert. Zur Laufzeit keine
Anfrage an Google — die G-01-Entscheidung bleibt gewahrt.

`[cmd]` Im Browser belegt: `--font-mono` löst auf
`__JetBrains_Mono_e896d9` auf, **19 Schriftschnitte geladen**. Die
Gewichte sind die der Vorlage (400, 500, 600), die Rückfallkette bleibt
die bisherige Systemkette.

`[read]` Aus G-18: *„Die Messung kann die beiden nicht unterscheiden,
weil JetBrains Mono hier nicht installiert ist."* — **Jetzt ist sie
da.** Ein Vergleich der Kennzahlendarstellung gegen die Vorlage ist
damit erst möglich; er war nicht Teil dieses Auftrags.

### `btn-accent` (D2) — trifft nicht mehr zu

`[cmd]` **Gemessen, nicht angenommen.** Auf `/v2/training` steht auf
`.v2-app` `--acc: oklch(0.74 0.10 290)` — und das ist `--acc-train`,
nicht `--acc-dash`. Die Hülle setzt den Modulakzent korrekt
(`app-shell.tsx:64`).

**Eine Korrektur in eigener Sache:** meine erste Messung las `--acc`
von `document.documentElement` und fand dort die Dashboard-Farbe. Das
war der falsche Knoten — gesetzt wird der Akzent auf `.v2-app`.

`[cmd]` `/v2/settings` fällt tatsächlich auf die Dashboard-Farbe zurück
(kein Modulakzent), benutzt aber **null** `btn-accent`-Knöpfe: G-10 ist
dort schon gelöst, der Knopf wurde auf `btn-primary` umgestellt, mit
Begründung im Code. **Nichts zu tun.**

---

## 2. Was bei 375 px wirklich passiert

### Die Ursache war eine andere als angenommen

`[read]` Der Auftrag: *„Ursache ist `.v2-sidebar-nav` mit 880 px."*

`[cmd]` **Die 880 px stimmen** — `nav.scrollWidth` ist 880 bei
`clientWidth` 251. **Aber die Seitenleiste schiebt die Seite nicht
auf:** `.v2-sidebar` und `.v2-sidebar-nav` haben beide bereits
`overflow-x: auto` (v2.css, Regel bei 1023 px), und gemessen ist
`.v2-sidebar` 375 breit bei `scrollWidth` 375. Sie rollt in sich, wie
vorgesehen.

`[cmd]` **Breit war `.v2-topbar`:** 606 px, `overflow: visible`, keine
Umbruchregel, in keiner `@media`-Regel erwähnt. Sie besteht aus
Brotkrume (242 px) und Aktionen (336 px) — zusammen mit dem Innenabstand
genau die 606 px, die `.v2-app` meldete.

### Was gebaut wurde

Unter 1023 px:

- die Kopfzeile rollt in sich (`overflow-x: auto`, Rollbalken versteckt)
- die Brotkrume schrumpft und schneidet ab (`text-overflow: ellipsis`)
- die Aktionen behalten ihre Größe (`flex-shrink: 0`)

`[annahme]` Die Aktionen bleiben vollständig, weil es Schalter sind,
keine Zierde. Die Brotkrume sagt, wo man ist — und das steht auch in
der Seitenleiste.

### Das Ergebnis, auf allen acht Seiten

| Seite | vorher | nachher |
|---|---|---|
| dashboard | 582 px | **375** |
| nutrition | 570 px | **375** |
| training | 561 px | **375** |
| recovery | 568 px | **375** |
| supplements | 606 px | **375** |
| goals | 530 px | **375** |
| medical | 554 px | **375** |
| coach/human | 606 px | **375** |

`[cmd]` Bei `clientWidth` 375. **Keine Seite schiebt mehr.**

`[cmd]` Elemente ragen weiterhin über den Rand — auf Supplements 69
Stück. **Alle 69 stecken in einem rollenden Behälter**, gemessen: die
Seite selbst bewegt sich nicht. Das ist die richtige Auflösung, nicht
ein Restproblem: eine Tabelle mit 16 Spalten *soll* in sich rollen.

### Der Messfehler, den ich melden muss

`[cmd]` **Die 375-px-Messungen in G-40, G-42 und G-46 waren nicht
belastbar gewonnen.** Drei Fallen, alle drei erst hier aufgefallen:

1. **`goto` setzt das Fenster zurück.** Wer die Breite vor dem Laden
   setzt, misst bei 1280 px und sieht keinen Überlauf.
2. **Eine abgelaufene Sitzung leitet auf `/login` um.** Die Anmeldeseite
   hat keine `v2`-Hülle — acht „Messungen" galten derselben Seite. Beim
   ersten Durchlauf heute meldete sie brav „kein Überlauf" für alle
   acht, und das war schlicht die Anmeldemaske.
3. **`+2` Toleranz** verdeckt einen Überlauf von genau 2 px.

`[cmd]` Das Skript prüft jetzt je Seite, **ob die v2-Hülle überhaupt
dasteht** (`!!document.querySelector('.v2-sidebar-nav')`), setzt die
Breite **nach** dem Laden und misst mit `+1`.

`[annahme]` Die Berichtszeilen „Querlauf bei 375 px, Ursache
`v2-nav-item`" in G-40/G-42/G-46 waren im Ergebnis richtig — es gab
einen Überlauf, und `v2-nav-item` ragte heraus. Die *Ursache* war aber
nicht die Seitenleiste, sondern die Kopfzeile; `v2-nav-item` war das,
was das Messskript zuerst fand.

---

## 3. Wieviele Raster übrig sind

### Die Zahl, und warum sie allein nichts sagt

`[cmd]` **Vorher 70 `grid-template-columns`-Deklarationen in sechs
Modul-CSS-Dateien, nachher 68.**

**Das klingt nach wenig, und die Zahl führt in die Irre.** Von den 70
sind die meisten **derselbe Klassenname bei verschiedenen
Haltepunkten**: `.v2-goals-phasen` steht dreimal da (vier, drei, zwei
Spalten), `.v2-med-medfelder` ebenso. Wer sie als „Raster" zählt, zählt
Haltepunkte.

`[cmd]` Nach **Rasterklassen** statt Deklarationen gezählt — also nach
Klassennamen, in deren Regel ein `grid-template-columns` steht,
Haltepunkte nicht doppelt:

| Modul | nachher |
|---|---|
| supplements | 16 |
| recovery | 9 |
| goals | 7 |
| medical | 6 |
| coach/ai (buddy) | 5 |
| nutrition | 4 |
| coach | 2 |
| **gesamt** | **49** |

`[cmd]` Zwei Klassen sind entfallen (`v2-med-export`,
`v2-buddy-grid-13`), eine dritte (`v2-buddy-zustaende`) ebenfalls —
dafür kamen zwei zentrale hinzu (`v2-grid-13`, `v2-g-cols-5`). Der
Nettogewinn ist klein; **der Gewinn liegt nicht in der Zahl, sondern
darin, dass dasselbe Verhältnis nicht mehr an drei Stellen gepflegt
werden muss.**

### Was zusammengeführt wurde

`[cmd]` **`1.3fr 1fr` stand dreimal** — `medical.css:70` (Export),
`recovery.css:45` (Check-in, Protocols), `buddy.css:56` (Engines,
Clone). Dieselbe Zahl, drei Dateien, drei Haltepunkte, die
auseinanderlaufen konnten.

Jetzt `v2-grid-13` in `v2.css`, neben `-14`, `-15` und `-21`. Die vier
Verhältnisse decken damit ab, was G-19 begonnen hat.

`[cmd]` **`v2-g-cols-5`** löst `v2-buddy-zustaende` ab — dieselbe
Regel samt 1100-px-Haltepunkt, einmal statt modul-lokal.

### Was bewusst nicht zusammengeführt wurde

`[cmd]` **Recovery behält seine vier Raster**, auch das einmalige
`v2-rec-grid-1135` (1fr / 1.35fr, links schmaler als rechts). `[read]`
Der Auftrag: *„Ein anderer Agent arbeitet an der Körperkarte und fasst
`koerperkarte.tsx`, `koerperkarte-pfade.ts` und `/v2/recovery` an — davon
Finger weg."* Zwei Hände in einer Datei sind der Weg zum Konflikt.
`v2-rec-grid-13` zeigt jetzt auf dasselbe Verhältnis wie `v2-grid-13`,
ist aber nicht umgestellt.

`[cmd]` **Supplements bleibt bei 13 Klassen** (12,5 KB). Nachgesehen wie
verlangt: die Raster dort sind **Zeilenraster mit festen Pixelbreiten**
— `140px 1fr` für Namensspalte plus Matrix, `100px 1fr 60px` für
Kostenzeilen, `repeat(16, 1fr)` für die Wochenmatrix. Zwei Paare sind
identisch (`140px 1fr` und `100px 1fr 60px` je zweimal), aber **innerhalb
desselben Moduls** und an fachlich verschiedenen Stellen (Compliance
gegen Zyklus, Kosten gegen Kategorien). Sie zusammenzuziehen hiesse,
zwei Tabellen aneinanderzuketten, die sich unabhängig ändern dürfen.

`[cmd]` **`1fr` (10×) und `1fr 1fr` (8×) sind keine Kandidaten** —
das sind fast durchweg die `@media`-Zusammenbrüche der jeweiligen
Klasse, nicht eigenständige Raster.

### Wo die Ergänzungen stehen

`[read]` Der Auftrag: *„In den `zusatz`-Block von
`klassen-uebernehmen.mjs`, nicht von Hand in `v2.css`."*

`[cmd]` **Alle sechs Ergänzungen stehen im Erzeuger.** Ein Test prüft
das (`v2-g-cols-5`, `v2-grid-13`, `v2-empty`, `white-space: nowrap`) —
`[cmd]` in G-19 hat ein Erzeugerlauf 164 Zeilen gelöscht, darunter die
Attrappenmarke, die Sprachwahl und die Datumsnavigation.

`[cmd]` Gegenprobe gemacht: **vor** der ersten Änderung einmal erzeugt
und mit dem Bestand verglichen — Byte für Byte identisch. Der Erzeuger
gibt den Bestand wieder, es war also sicher, ihn laufen zu lassen.
`v2.css` ging von 1.949 auf 2.064 Zeilen; die Klassen aus G-19 und die
Körperkarte des Parallelagenten stehen unverändert da.

---

## 4. Was gebaut wurde

```
packages/ui/src/
├── icons.tsx                 + shield, history, file
├── primitives.tsx            + Pill dot, + Empty
├── in-entwicklung.tsx        + InEntwicklungKnopf disabled
├── index.ts                  + Empty, EmptyProps
└── styles/
    └── klassen-uebernehmen.mjs   + v2-g-cols-5, v2-grid-13, v2-empty,
                                    btn nowrap, card-title, topbar,
                                    module-header
apps/web/src/
├── app/layout.tsx            + JetBrains_Mono
├── styles/themes/lume.css    --font-mono -> var(--lumeos-mono)
└── components/shell/__tests__/v2-bausteine.test.ts   (neu, 10 Tests)

GELÖSCHT:
  apps/web/src/app/v2/coach/bausteine.tsx
  apps/web/src/app/v2/coach/ai/bausteine.tsx
```

`[cmd]` Umgestellt: vier Coach-Dateien (`PunktPill` → `Pill dot`,
`Leer` → `Empty`), `supplements/modale.tsx` (Doppelzweig →
`disabled`), `medical/tab-tracking.tsx` und drei Buddy-Tabs
(`v2-grid-13`).

`[cmd]` **Keine neuen Farbtokens.** `rgba` steht unverändert bei 4 —
gegengeprüft.

---

## 5. Die Prüfungen

`[cmd]` `pnpm gate` — **8 von 8 Aufgaben grün.**
`[cmd]` `v2-bausteine.test.ts` — **10 Tests, 10 grün** (neu).
`[cmd]` Alle Testdateien zusammen — grün.

Im Browser, angemeldet:

`[cmd]` **375 px auf allen acht Modulseiten: kein Schieben.** Je Seite
geprüft, dass die v2-Hülle dasteht.

`[cmd]` `Pill dot` rendert (`v2-dot` mit `oklch(0.78 0.13 150)` an der
Synced-Pille). `Empty` ist im Bestand hinter einer Bedingung, die mit
den aktuellen Daten falsch ist — **die Klassen wurden deshalb direkt
gemessen**: `padding: 32px 20px`, zentriert, Titel 600, Untertitel
gedämpft. Aus der Existenz einer Komponente folgt nicht ihre Wirkung.

`[cmd]` JetBrains Mono geladen: 19 Schnitte, `--font-mono` löst auf den
`next/font`-Namen auf.

`[cmd]` Kartentitel: alle einzeilig (18 px), `flex-shrink: 0` greift.

`[cmd]` Hell und Dunkel geprüft, drei Breiten plus 375 px.

**Zwei Korrekturen an eigener Arbeit**, beide vor dem Bericht gefunden:

`[cmd]` Der Test „die modul-lokalen Nachbauten sind weg" meldete
zunächst drei Medical-Dateien. **Das war mein Test, nicht ihr Fehler:**
Medical führt eine eigene `bausteine.tsx` mit `RangeIndicator` und
`FlagPill` — Fachbausteine des Moduls, keine Ersatzteile für
`packages/ui`. Die Prüfung ist jetzt auf `PunktPill` und `Leer`
begrenzt.

`[cmd]` Zweimal hat ein unmaskierter Backtick im Kommentar den Erzeuger
zerlegt (`SyntaxError`). Beim zweiten Mal stand `v2.css` kurzzeitig
veraltet da — aufgefallen, weil `grep -c` null lieferte. Der
`zusatz`-Block ist ein Template-Literal; Backticks darin gehören
maskiert oder weggelassen.

---

## 6. Was offen bleibt

1. **Welche Knöpfe in den Modulkopf gehören** — meine Sicht steht in
   Abschnitt 1; die Entscheidung ist Toms.
2. **Recovery-Raster** — vier Klassen, darunter das einmalige
   `1fr 1.35fr`. Sobald der Körperkarten-Agent fertig ist, lässt sich
   `v2-rec-grid-13` auf `v2-grid-13` umstellen.
3. **Der Schriftvergleich** — JetBrains Mono ist jetzt da, also lässt
   sich die Kennzahlendarstellung erstmals gegen die Vorlage halten
   (G-18 konnte das nicht).
4. **`supplements.css` mit 12,5 KB** — nachgesehen, nichts
   Zusammenführbares gefunden; die Raster sind fachlich getrennt.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| Drei Symbole fehlen auch in der Vorlage | `grep` in `shared.jsx` → keine Definition; 14 Aufrufe in den Modulvorlagen |
| Die zwei `PunktPill`-Nachbauten waren verschieden | `coach/ai/bausteine.tsx` hatte `farbe`, `coach/bausteine.tsx` nicht |
| Sidebar rollt bereits | `.v2-sidebar` 375/375, `.v2-sidebar-nav` scrollWidth 880 bei clientWidth 251 |
| Ursache war die Kopfzeile | `.v2-topbar` scrollWidth 606, `overflow: visible` |
| 375 px auf acht Seiten | Skript mit Hüllenprüfung, Breite nach dem Laden |
| 69 Überläufe alle in Rollern | JS-Messung über `overflowX` der Vorfahren |
| `--acc` ist der Modulakzent | `.v2-app` auf `/v2/training`: `oklch(0.74 0.10 290)` = `--acc-train` |
| Settings ohne `btn-accent` | 0 Knöpfe gemessen |
| JetBrains Mono geladen | 19 Schnitte, `--font-mono` = `__JetBrains_Mono_e896d9` |
| Erzeuger gibt Bestand wieder | Lauf vor der ersten Änderung, `diff` leer |
| Raster 70 → 68 | Skript über sechs Modul-CSS-Dateien |
| `rgba` bleibt bei 4 | `grep -c` in `v2.css` |
| Gate, Tests | `pnpm gate` 8/8 · `v2-bausteine.test.ts` 10/10 |
