# Theme-Fähigkeit von `apps/web`: der Ist-Zustand

`[cmd]` Erhoben 2026-08-15. Reine Zählung über den Quelltext von
`apps/web/src`, `apps/admin/src` und `packages/ui` — keine Datenbank,
kein Kettenlauf, keine Änderung an `apps/` oder `packages/`.

**Kein Bauauftrag.** Diese Messung legt den Ist-Zustand hin, damit er im
Design-Gespräch nicht geraten werden muss. Es wird kein Farbwert
vorgeschlagen und nichts umgebaut.

---

## Das Ergebnis in vier Zahlen

| | |
|---|---|
| Harte Farbwerte gesamt | `[cmd]` **538** |
| verteilt auf | `[cmd]` **7 Dateien** — zwei davon tragen die Hälfte |
| Werte über Token (`var(--…)`) | `[cmd]` **341** |
| Variablen, die der Hellmodus **nicht** neu setzt | `[cmd]` **9 von 31** |

---

## 1. Wo Farben an den Tokens vorbeigehen

`[cmd]` Gezählt über alle `.ts/.tsx/.css/.js/.jsx` ohne `node_modules`,
`.next`, `dist`, `build`, `.turbo`:

| | |
|---|---|
| Tailwind-Palettenklassen (`bg-slate-900`, `text-gray-500` …) | `[cmd]` **537** |
| `white`/`black`-Klassen | `[cmd]` 0 |
| Hex-Werte | `[cmd]` **1** |
| `rgb()` / `hsl()` | `[cmd]` 0 |
| **hart gesamt** | `[cmd]` **538** |
| `var(--token)` | `[cmd]` 341 |
| `*-token*`-Klassen | `[cmd]` 0 |

### Je Datei — hier steckt es

```
hart  Token  Zeilen  Datei
 208      0     723  apps/web/src/app/nutrition/foods/page.tsx
 119      0     315  apps/admin/src/app/curation/page.tsx
 110      0     281  apps/web/src/app/nutrition/local-schema/page.tsx
  45      0     219  apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx
  44      0     149  apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx
  11      0     108  apps/web/src/app/nutrition/foods/food-preference-toggles.tsx
   1      0     105  apps/admin/src/components/admin-login-form.tsx
```

`[cmd]` **Zwei von sieben Dateien tragen die Hälfte aller 538 Werte.**
Das ist die Antwort auf die Frage „wo konzentriert es sich": nicht
verstreut über achtzig Dateien, sondern in den drei Seiten, die im
Suchstrang der letzten Wochen entstanden sind.

`[cmd]` Bemerkenswert: **keine dieser sieben Dateien benutzt eine
einzige Token-Variable.** Die 341 Token-Verwendungen liegen anderswo —
in `globals.css`, im App-Shell und in den fünf `components/ui`-Bausteinen.
Es gibt also nicht „teilweise Token", sondern **zwei getrennte Welten**.

### Nach Bereich

| | hart | über Token | Dateien |
|---|---|---|---|
| `apps/web/src` | `[cmd]` 418 | `[cmd]` 341 | 15 |
| `apps/admin/src` | `[cmd]` 120 | `[cmd]` **0** | 2 |
| `packages/ui` | `[cmd]` 0 | `[cmd]` 0 | `[cmd]` **0** |

`[cmd]` **`packages/ui` enthält genau eine Datei: `src/.gitkeep`.** Das
Paket ist ein leeres Gerüst. Wer dort gemeinsame Komponenten vermutet,
sucht ins Leere — sie liegen unter `apps/web/src/components/`.

`[cmd]` **`apps/admin` benutzt keine einzige Token-Variable.** Es ist
vollständig hart verdrahtet.

---

## 2. Der shadcn-Radius-Befund

`[read]` A-06 hält fest: *„shadcn-Komponenten nutzen `rounded-md` (6 px
fest) statt der Token-Radien `rounded-token*` — ein Theme steuert die
shadcn-Radien damit nicht."*

**Der Befund stimmt, ist aber viel kleiner als der Satz nahelegt.**

`[cmd]` Es gibt **fünf** Komponenten in `apps/web/src/components/ui`:

| Datei | Radius fest | Radius Token | Abstand fest | Schrift fest | shadcn-Namen |
|---|---|---|---|---|---|
| `button.tsx` | **3** | 0 | 5 | 2 | 15 |
| `cards.tsx` | 0 | 0 | 14 | 0 | 0 |
| `page-header.tsx` | 0 | 0 | 0 | 0 | 0 |
| `placeholder-page.tsx` | 0 | 0 | 7 | 0 | 0 |
| `status-badge.tsx` | 0 | 0 | 0 | 0 | 0 |
| **Summe** | **3** | **0** | **26** | **2** | **15** |

`[cmd]` **Eine einzige Komponente** (`button.tsx`) trägt feste Radien,
dreimal `rounded-md`. Keine der fünf benutzt einen Token-Radius.

`[cmd]` **Die Abstände sind das grössere Thema: 26 feste Werte gegen 0
Token-Abstände** — vor allem in `cards.tsx` (14). Der Radius ist also
nicht der Hauptfall; die Abstände sind es.

### Eine Korrektur an A-06

`[read]` A-06 vermerkt, die Modul-Akzente seien *„weiterhin nicht in
`tailwind.config.js` gespiegelt"*, und der Punkt legt nahe, dass auch
die Token-Radien dort fehlen.

`[cmd]` **Die Token-Radien sind gespiegelt.** `tailwind.config.js`
definiert:

```js
borderRadius: { token: 'var(--radius)', 'token-sm': 'var(--radius-sm)',
                'token-lg': 'var(--radius-lg)' },
spacing:      { card: 'var(--pad-card)' }
```

`rounded-token`, `rounded-token-sm`, `rounded-token-lg` und `p-card`
sind also **benutzbar**. `button.tsx` benutzt sie nur nicht. Das ist ein
Unterschied: es fehlt nicht das Werkzeug, es fehlt die Anwendung.

### Der shadcn-Namensraum ist bereits verdrahtet

`[cmd]` Die 15 shadcn-Namen in `button.tsx` (`bg-primary`,
`text-foreground` …) sind **keine zweite Farbwelt**:
`tailwind.config.js` bildet sie als reine Aliase auf die Lume-Tokens ab
— `primary → var(--acc)`, `background → var(--bg)`,
`destructive → var(--neg)`. Ein Themewechsel erreicht sie also.

---

## 3. Die elf Modul-Akzente

`[cmd]` Alle elf sind in `lume.css` definiert und in `contract.ts`
verzeichnet. Verwendung ausserhalb der Definition:

| Datei | Vorkommen |
|---|---|
| `components/ui/placeholder-page.tsx` | `[cmd]` 31 — alle elf |
| `app/globals.css` | `[cmd]` 11 |
| `app/dashboard/dashboard-view.tsx` | `[cmd]` 8 |
| `app/nutrition/page.tsx` | `[cmd]` 4 |
| `app/goals/page.tsx` · `app/medical/page.tsx` | `[cmd]` je 1 |

`[cmd]` **Ausserhalb der Platzhalterseite werden sie kaum benutzt** —
14 Vorkommen in vier echten Seiten. Sie sind vorbereitet, nicht
ausgespielt.

### Wie der Akzent je Modul gesetzt wird — zwei Mechanismen

`[cmd]` **Erstens, inline im App-Shell** (`app-shell.tsx:296`):

```tsx
style={{ '--acc': accentVar(activeAccentKey) } as React.CSSProperties}
```

`activeAccentKey` kommt aus `moduleAccentMap` (`app-shell.tsx:10–23`),
die **alle elf Module** abdeckt. Das läuft automatisch, nicht je Seite
von Hand.

`[cmd]` **Zweitens, über CSS-Klassen** in `globals.css`:
`.lume-shell-dashboard`, `-goals`, `-training`, `-recovery`,
`-supplements`, `-coach`, `-medical`, `-settings` — **acht Klassen für
elf Akzente.** Für `nutrition`, `buddy`, `marketplace` und `admin` gibt
es keine.

`[annahme]` Die CSS-Klassen sind damit **redundant**: der Inline-Stil
aus dem Shell gewinnt gegen sie (Spezifität), und er deckt alle elf ab.
Die Lücke bei den vier Klassen dürfte folgenlos sein — **geprüft ist das
nicht**, es wäre eine Messung im Browser.

### Zur Spiegelung in Tailwind

`[cmd]` **A-06 hat hier recht: keiner der elf Akzente steht in
`tailwind.config.js`.** Gespiegelt ist nur der zusammengesetzte
`acc: 'var(--acc)'`.

**Was daraus folgt:** Eine Komponente kann `bg-acc` schreiben und
bekommt den Akzent des **aktuellen Moduls**. Sie kann aber **nicht**
`bg-acc-nutri` schreiben — dafür gibt es keine Klasse. Wer einen
bestimmten Modulakzent braucht, muss `style={{ color: 'var(--acc-nutri)' }}`
schreiben, und genau das tun `nutrition/page.tsx` und
`placeholder-page.tsx`.

`[annahme]` Für den Regelfall ist das richtig so — eine Seite soll den
Akzent ihres Moduls tragen, nicht einen fremden. Die fehlende
Spiegelung fällt nur dort auf, wo mehrere Akzente **nebeneinander**
stehen, etwa in einer Übersicht. Ob das gebraucht wird, ist eine
Designfrage.

---

## 4. Was ein Themewechsel heute nicht erreicht

`[cmd]` `lume.css` definiert im Nachtblock **31** Variablen, im
Hellblock **22**. **Neun werden im Hellmodus nicht neu gesetzt** und
behalten damit ihren Nachtwert:

| Variable | Nachtwert | Folge im Hellmodus |
|---|---|---|
| `--pos` | `oklch(0.78 0.13 150)` | helles Grün auf weissem Grund |
| `--warn` | `oklch(0.82 0.13 80)` | helles Gelb auf weissem Grund |
| `--neg` | `oklch(0.72 0.16 22)` | helles Rot auf weissem Grund |
| `--acc` | `var(--acc-dash)` | folgt korrekt, weil die Akzente selbst umgesetzt werden |
| `--radius`, `--radius-sm`, `--radius-lg` | 8/6/12 px | `[annahme]` gewollt — Radien sind modusunabhängig |
| `--pad-card` | 16 px | `[annahme]` gewollt |
| `--font-mono` | Schriftliste | `[annahme]` gewollt |

**Die drei Statusfarben sind der eigentliche Befund.** `--pos`, `--warn`
und `--neg` sind für dunklen Grund gebaut (Helligkeit 0,72–0,82). Im
Tagmodus stehen sie auf `--bg: oklch(0.985 …)` — hell auf hell. Die
übrigen sechs sind `[annahme]` bewusst modusunabhängig.

### Und die 538 harten Werte

Sie folgen **keinem** Themewechsel, weder Hell/Dunkel noch einem
künftigen zweiten Theme. Konkret, mit Datei und erster Fundstelle:

| Datei | ab Zeile | Muster |
|---|---|---|
| `apps/web/src/app/nutrition/foods/page.tsx` | `[cmd]` 60 | `bg-slate-950`, `border-slate-800`, `text-slate-100` |
| `apps/admin/src/app/curation/page.tsx` | `[cmd]` 43 | `text-slate-300`, `border-slate-700` |
| `apps/web/src/app/nutrition/local-schema/page.tsx` | `[cmd]` 41 | `border-slate-800`, `bg-slate-900` |
| `apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx` | `[cmd]` 59 | dito |
| `apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx` | `[cmd]` 38 | dito |
| `apps/web/src/app/nutrition/foods/food-preference-toggles.tsx` | `[cmd]` 83 | dito |
| `apps/admin/src/components/admin-login-form.tsx` | `[cmd]` 91 | `color: '#b00020'` |

`[cmd]` Allein in `foods/page.tsx` sind **58 der 208 Werte**
`bg-slate-800/900/950` oder `border-slate-800/900/950` — dunkle Flächen,
fest verdrahtet, mit hellem Text darauf (`text-slate-100`, `-300`).

**Diese drei Seiten würden im Hellmodus dunkel bleiben.** Das ist kein
Feinschliff, sondern ein sichtbarer Bruch mitten in der Anwendung — und
`foods/page.tsx` ist die Seite, an der die letzten Wochen gearbeitet
wurde.

---

## Was diese Messung nicht sagt

- **Sie zählt Vorkommen, nicht Sichtbarkeit.** Eine harte Farbe in einer
  selten gerenderten Komponente wiegt weniger als eine im Hauptlayout,
  und diese Zählung unterscheidet das nicht. `[annahme]`
  `foods/page.tsx` und `local-schema/` dürften häufig gesehen werden,
  `admin/curation` selten — gemessen ist es nicht.

- **Sie prüft nicht, ob es im Browser bricht.** Dass drei Seiten im
  Hellmodus dunkel blieben, folgt aus dem Quelltext, nicht aus einem
  Screenshot. `[read]` Genau diese Trennung hat sich im Repo schon
  bewährt: aus der Existenz folgt nicht die Wirkung.

- **Sie bewertet keine Farbwerte.** Keine Aussage darüber, ob Chroma
  0,10 reicht oder die Helligkeitsspanne zu eng ist. `[read]` Das sind
  die acht offenen Punkte in
  `docs/spezifikation/10-plattform/design-system/00-diskussionsstand.md`,
  Abschnitt 8, und das Lichtmodell in Abschnitt 9.

- **Sie deckt `docs/design-system/` nicht ab.** `[cmd]` Auftragsgemäss
  ausgeschlossen — die Pfade dort brechen unter Windows jede rekursive
  Suche ab.

- **Die Redundanz der beiden Akzent-Mechanismen ist nicht zu Ende
  geprüft.** `[cmd]` Beide existieren; dass der Inline-Stil gewinnt, ist
  `[annahme]` aus der CSS-Spezifität geschlossen, nicht gemessen.

- **`apps/admin` ist mitgezählt, aber nicht bewertet.** `[cmd]` 120
  harte Werte, 0 Token. Ob Admin überhaupt themefähig sein soll, ist
  eine Produktfrage.

---

## Was Tom entscheiden muss

Zwei Fragen, beide mit Zahlen unterlegt:

1. **Vor dem Design aufräumen oder danach?** `[cmd]` 538 Werte in
   7 Dateien, zwei davon mit der Hälfte. Das ist überschaubar — aber
   `foods/page.tsx` ist mit 723 Zeilen und 208 Werten die grösste
   Einzelbaustelle, und sie ändert sich gerade laufend (C-18, C-41).

2. **Sollen die drei Statusfarben im Hellmodus eigene Werte bekommen?**
   `[cmd]` `--pos`, `--warn`, `--neg` sind heute für dunklen Grund
   gebaut und gelten im Tagmodus unverändert weiter.


---

## Nachtrag 2026-08-17 (G-18): die Schrift fehlte

**Tom, 2026-08-17:** *„Es ist schlechter lesbar als die Vorgabe. Da muss
in den Schriften mehr Deckkraft rein."*

**Der Befund stimmte, die vermutete Ursache nicht.** `[cmd]` Die
Farbtokens sind mit der Vorlage deckungsgleich — `--fg-dim 0.420`,
`--fg-muted 0.720`, `--fg-subtle 0.550`, Wert für Wert. **Es war die
Schrift.**

### Was gemessen wurde

`[cmd]` `--font-sans` war **nirgends definiert**. `v2.css` benutzt sie
seit G-01 als `font-family` des Körpers; `lume.css` kannte nur
`--font-mono`. Vorher/nachher mit `getComputedStyle` auf
`/v2/nutrition`, gleiche Breite:

| | vorher | nachher |
|---|---|---|
| `--font-sans` | **leer** | `'__Inter_8b3a0b', …, 'Inter', -apple-system, system-ui, sans-serif` |
| `body` rendert in | **„Times New Roman"** | `__Inter_8b3a0b` |
| `.v2-module-title` | **„Times New Roman"** | `__Inter_8b3a0b` |
| geladene Schriften | **keine** | Inter 400, 500, 600, 700 |

Eine Serifenschrift bei 11–13 px auf getöntem Grund — genau der
Eindruck „dünner und unruhiger", den Tom beschrieben hat.

### Was gebaut ist

`next/font/google` lädt Inter **beim Bauen** herunter und liefert sie
vom eigenen Server. `[cmd]` **Keine Anfrage an `fonts.googleapis.com`
zur Laufzeit** — im Netzwerkprotokoll des Browsers gezählt: 0 Anfragen
an Google oder gstatic; die sieben fremden Anfragen gehen an das lokale
Supabase (127.0.0.1:54321).

`[read]` Die G-01-Entscheidung („keine fremde Abhängigkeit im kritischen
Pfad") bleibt damit gewahrt. Sie war richtig — nur ihre Folge, dass
`--font-sans` ersatzlos entfiel, war nicht bedacht.

Die Definition steht in `lume.css` bei den anderen Tokens; `v2.css`
wurde **nicht angefasst** (dort arbeiten andere).

**Die Tokens sind unverändert.** `[read]` Erst mit Inter lässt sich
beurteilen, ob noch etwas zu blass ist — und dann gezielt, statt auf
Verdacht.

### `--font-mono`: gelassen, und warum die Messung nichts beweist

**Gelassen.** `[cmd]` Die Vorlage setzt `'JetBrains Mono'`, hier steht
die Systemkette (`ui-monospace, SFMono-Regular, Menlo, …`).

`[cmd]` Der Vergleich beider Ketten mit denselben Kennzahlen
(`2.372 / 2.500 kcal`, `07:42`, `0.79 × 0.30`) ergab ein **identisches
Bild** — **aber das beweist nichts**: JetBrains Mono ist auf diesem
Rechner nicht installiert, die zweite Kette fiel auf dieselbe
Systemschrift zurück. Die Messung kann die beiden hier nicht
unterscheiden.

`[annahme]` Monospace-Schriften ähneln sich in Laufweite und Ziffernbau
stärker als Proportionalschriften; der Unterschied dürfte deutlich
kleiner sein als der zwischen Times New Roman und Inter. Belegen lässt
sich das erst, wenn JetBrains Mono geladen wird — **das wäre ein zweiter
`next/font`-Aufruf und gehört in einen eigenen Punkt**, falls die
Kennzahlen jemandem auffallen.

### Zwei Funde am Rande

`[cmd]` **Der Theme-Vertrag prüfte `--font-mono`, aber nicht
`--font-sans`.** Deshalb fiel neun Tage lang nicht auf, dass die eine
fehlte. `--font-sans` steht jetzt in `THEME_TOKENS_BASE` — gegengeprobt:
Token versteckt → Test rot mit „base block misses tokens: --font-sans",
zurückgesetzt → grün.

`[cmd]` **Der Vertragstest schneidet den Block am ersten `}` ab.**
`blockFor()` in `theme-contract.test.ts` sucht `css.indexOf('}')`. Ein
Kommentar im Token-Block, der eine geschweifte Klammer enthält, kappt
damit alles danach — bei mir verschwanden dadurch beide Schrift-Tokens
aus der Prüfung, obwohl sie dastanden. Umgangen, indem der Kommentar
ohne Klammern auskommt. **Der Parser bleibt anfällig** — das ist keine
Baustelle dieses Auftrags, gehört aber notiert.

### Was nach der Schrift noch auffällt

`[cmd]` Der Modulkopf von `/v2/nutrition` bricht auch mit Inter um: die
sechs Aktionsknöpfe (`Quick-add`, `Recalc macros`, `Find food`,
`MealCam`) plus die Datumsnavigation aus G-14 passen bei 1600 px nicht
in eine Zeile. **Das ist kein Schriftproblem** — es war vorher da und
ist danach da. Kein Überlauf, nur Umbruch. Gemeldet, nicht angefasst.

### Nachweise

| Prüfung | Ergebnis |
|---|---|
| Bildschirmfoto vorher/nachher | `[cmd]` gleiche Seite (`/v2/nutrition?datum=2026-08-14`), gleiche Breite (1600 px) |
| Anfragen an Google zur Laufzeit | `[cmd]` **0** |
| Inter geladen | `[cmd]` 400, 500, 600, 700 — `document.fonts` |
| `pnpm gate` | `[cmd]` grün, 8 Tasks |
| Drei Breiten | `[cmd]` 1600 / 1100 / 800 px, kein Überlauf |
| `/nutrition` unverändert | `[cmd]` 0 `v2-`-Elemente, `lume-shell` vorhanden, eigene Schriftkette |


---

## Nachtrag 2026-08-17 (G-19 / G-20 / G-22)

### Schritt 0: die Bypass-Messung

`[cmd]` **`git commit -m "test"` wurde BLOCKIERT.** Die Permission-Schicht
meldete „Permission to use Bash … has been denied", HEAD blieb auf
`520d001`, nichts gestaged.

**Belegt: `deny`-Regeln greifen auch unter
`defaultMode: "bypassPermissions"`.** Die Quelle, die das Gegenteil
behauptet, ist damit widerlegt — die 23 Deny-Regeln halten, und die
Agenten koennen ohne Nachfragen laufen.

`[annahme]` Geprueft wurde genau eine Regel (`git commit`). Dass die
uebrigen 22 ebenso greifen, folgt aus derselben Mechanik, ist aber
nicht einzeln gemessen.

---

### G-20 — sechs fehlende Symbole, nicht eines

`[cmd]` Ein Abgleich der vier Modulvorlagen gegen `icons.tsx` (Skript
ueber `name="…"` und `icon: "…"`): **52 Symbole vorhanden, 53 benutzt,
sechs ohne Entsprechung.**

| Symbol | benutzt in | aufgenommen |
|---|---|---|
| `chevron_up` | `module-training-extras.jsx` | ja |
| `bolt` | Nutrition und Training, vier Dateien | ja — formgleich mit `zap` |
| `cloud_off` | `module-training.jsx` | ja |
| `refresh` | `module-recovery-modals.jsx` | ja |
| `user` | `shell.jsx` (Human Coaches, Open profile) | ja |
| `arr_r` | `module-recovery-v2.jsx`, **einmal** | **nein** |

**`arr_r` ist ein Tippfehler der Vorlage.** `[cmd]` `shared.jsx`
definiert `arrow_right`, benutzt an dieser einen Stelle aber `arr_r` —
das Symbol zeichnet dort ebenfalls nichts. Aufzunehmen waere, den
Fehler zu uebernehmen.

`[cmd]` **Keines der sechs ist in `shared.jsx` der Vorlage definiert.**
Sie zeichnen dort also alle nichts — die Vorlage ist an dieser Stelle
unvollstaendig, nicht unser Symbolsatz. Das ist der Grund, warum es
niemandem auffiel: `<Icon>` rendert bei unbekanntem Namen still nichts,
in beiden Welten.

Die Trainingsseite steht wieder auf `chevron_up` / `chevron_down`; der
Ersatz durch `arrow_up` / `arrow_down` aus G-16 ist zurueckgenommen.

---

### G-19 — aus 15 Klassen wurden 3 Verhaeltnisse plus 11 Sonderfaelle

`training.css` ist **geloescht**, der Import aus `page.tsx` entfernt.

**Zusammengefasst statt verschoben:**

| vorher | jetzt |
|---|---|
| `v2-train-grid-14` (1.4fr/1fr) | `.v2-grid-14` — **gemeinsam mit `.v2-dash-grid`** |
| `v2-train-grid-15` (1.5fr/1fr) | `.v2-grid-15` — **gemeinsam mit `.v2-diary-grid`** |
| `v2-train-grid-21` (2fr/1fr) | `.v2-grid-21` |
| `v2-train-grid-11` (1fr/1fr) | **entfaellt** — dafuer gibt es `.v2-g-cols-2` aus dem Entwurf |
| `v2-train-span-2` | `.v2-span-2` |

`[cmd]` **Von fuenf Rastern bleiben drei.** Die elf uebrigen Klassen
(Wochenleiste, Sitzungskopf, Medaillon, Volumentabelle, Filterzeile,
Pausenzaehler, Landmark-Zeile, Feedback-Zeile, HR-Zeile, Offline-Kopf,
Uebungszeile, Block-Felder) bleiben eigenstaendig: ihre Spaltenbreiten
kommen aus je einer Vorlagenstelle und wiederholen sich nirgends.

`[cmd]` Im Browser gemessen: `.v2-grid-14` → `557px / 398px` (1,4:1),
`.v2-grid-15` → `573px / 382px` (1,5:1), `.v2-grid-21` → `637px / 318px`
(2:1). Keine alte Klasse mehr im DOM (`[class*="v2-train-grid"]` = 0).

`[cmd]` **Der `rgba`-Test bleibt bei vier.** Kein Raster braucht einen
Schatten.

### Der eigentliche Fund: der Erzeuger haette 164 Zeilen geloescht

`[cmd]` `v2.css` entsteht aus `klassen-uebernehmen.mjs`. **Fuenf
Klassengruppen standen nur in der erzeugten Datei und nicht im
`zusatz`-Block des Erzeugers:** `v2-dash-grid`, `v2-diary-grid`,
`v2-attrappe*`, `v2-sprachliste`/`v2-sprachwahl`, `v2-datumsnav`,
`v2-btn-sm`.

**Gemessen, nicht vermutet:** ein Lauf des Erzeugers reduzierte die
Datei von **1701 auf 1537 Zeilen** — 164 Zeilen weg, darunter das
Dashboard-Raster, die Attrappenmarke aus G-05, die Sprachwahl aus A-14
und die Datumsnavigation aus G-14. Alles aus den letzten fuenf
Auftraegen.

**Behoben:** die handergaenzten Klassen stehen jetzt im `zusatz`-Block,
mit einer Trennlinie und dem Hinweis, wo Neues hingehoert. `[cmd]`
Danach erneut erzeugt: **1905 Zeilen, alle Klassen vorhanden** — die
alten, die handergaenzten und die neuen Raster.

`[annahme]` Warum es nie auffiel: der Erzeuger wurde seit G-01 nicht
mehr gelaufen. Wer ihn das naechste Mal angefasst haette, haette den
Schaden erst nach dem Neuladen gesehen.

---

### G-22 — der Vertragstest sah 30 von 32 Tokens

`[cmd]` `blockFor()` nahm `css.indexOf('}')` — **die erste schliessende
Klammer**, egal ob sie zu einer Regel gehoert oder in einem Kommentar
steht.

**Gemessen am Zustand vor der Reparatur:** mit dem G-18-Kommentar
(`body { font-family: var(--font-sans) }`) im Block sah der alte Parser
**30 von 32 Tokens** — `--font-sans` und `--font-mono` fielen dahinter
und waren fuer die Pruefung unsichtbar. Sie meldete gruen.

`[cmd]` **Heute uebersieht sie nichts** — weil ich den Kommentar bei
G-18 umformuliert habe, um sie zum Laufen zu bringen. Der Fehler war
also latent, nicht aktiv. **Genau das ist die Gefahr:** die Pruefung
war nur so lange richtig, wie niemand eine Klammer in einen Kommentar
schrieb.

**Behoben, zweifach:**

1. **Kommentare werden vor der Suche entfernt** — laengengleich durch
   Leerzeichen ersetzt, damit die Positionen stimmen.
2. **Klammern werden gezaehlt** statt die erste zu nehmen. Ein
   verschachtelter Block (`@media`, `&:hover`) beendete den aeusseren
   sonst zu frueh. `[annahme]` Heute steht keiner in den Theme-Dateien —
   die Pruefung soll aber nicht davon abhaengen, dass das so bleibt.

`[cmd]` **Gegengeprobt:** Kommentar mit `}` mitten in den Block gesetzt,
direkt vor die Schrift-Tokens → Test **gruen**, die Tokens dahinter
werden gesehen. Zum Vergleich derselbe Zustand mit der alten Logik
nachgerechnet: **30 statt 32**. Danach zurueckgesetzt.

`[read]` **Dieselbe Fehlerklasse zum vierten Mal** — eine Pruefung, die
still weniger prueft, als sie vorgibt. Encoding (Dreibyte-Zeichen),
i18n (Schluessel, der in beiden Sprachen fehlt), die Zeilenzahlen aus
C-43, jetzt der Vertragsparser.

---

### Nachweise

| Pruefung | Ergebnis |
|---|---|
| Bypass-Messung | `[cmd]` `git commit` blockiert, HEAD unveraendert |
| `chevron_up` im Symbolsatz | `[cmd]` ja, Training benutzt es |
| Fehlende Symbole gesamt | `[cmd]` 6 gefunden, 5 aufgenommen, `arr_r` als Vorlagen-Tippfehler gemeldet |
| `training.css` | `[cmd]` geloescht, Import entfernt |
| Raster nach dem Zusammenfassen | `[cmd]` **3 Verhaeltnisse** statt 5, dazu 11 Sonderfaelle |
| Erzeuger laeuft ohne Verlust | `[cmd]` 1905 Zeilen, alle Klassen vorhanden |
| `rgba`-Vorkommen | `[cmd]` 4, unveraendert |
| Vertragstest hinter `}`-Kommentar | `[cmd]` gruen, gegengeprobt |
| `pnpm gate` | `[cmd]` gruen, 8 Tasks |
| Drei Breiten `/v2/training` | `[cmd]` 1600 / 1100 / 800 px, kein Ueberlauf |
| Erscheinungsbild `/v2/training` | `[cmd]` unveraendert, 0 Seitenfehler, zehn Tabs |
