# G-01: Parallelstruktur und Tokens

`[cmd]` Erhoben am 2026-08-15 im Repo `D:\GitHub\LumeOS-Claude-V1`,
Zweig `dev`.

`[read]` Tom, 2026-08-15: „Was ich nicht will ist die bestehende Variante
löschen, ich will die neue Variante parallel haben."

**Dieser Auftrag baut keine Oberflaeche.** Er nimmt `packages/ui` in
Betrieb, legt die Route `/v2` an und stellt die Klassen des Entwurfs
unter einem eigenen Praefix bereit. Sidebar, Topbar und Karten sind G-02.

---

## Was geteilt wird und was doppelt existiert

Die Liste, an der sich G-02 bis G-07 zu orientieren haben. Wer sie falsch
liest, dupliziert die Datenschicht — `[read]` dort steckt die Arbeit von
zwei Tagen, und `nutrition.search_events` haengt daran.

### Geteilt — **nicht** kopieren

| Was | Wo | Warum geteilt |
|---|---|---|
| Datenzugriff Lebensmittel | `apps/web/src/lib/nutrition/food-search.ts` | Eine Suchlogik, ein Messpunkt |
| Supabase-Klienten, Sitzung | `@lumeos/shared` (`/session`, `/auth`, `/nutrition/db`) | Eine Anmeldung fuer beide Oberflaechen |
| Routenschutz | `apps/web/src/middleware.ts` | `[cmd]` schuetzt `/v2` bereits ohne Zutun — siehe Nachweis |
| **Farbtokens** | `apps/web/src/styles/themes/lume.css` | 32 Tokens, im Hellmodus repariert (`d19e651`) |
| Themenwahl, Modus | `apps/web/src/app/layout.tsx`, `styles/themes/registry.ts` | Setzt `data-theme`/`data-mode` fuer beide |
| Tabellen, RPC, Datenbank | `supabase/` | Von diesem Auftrag nicht beruehrt |

### Doppelt — bewusst getrennt

| Was | Alt | Neu |
|---|---|---|
| Huelle | `components/shell/app-shell.tsx` | noch keine (G-02) |
| Klassen | `app/globals.css`, Praefix `lume-` | `packages/ui/src/styles/v2.css`, Praefix `v2-` |
| Route | `/dashboard`, `/nutrition`, … | `/v2` |
| Layout | `app/layout.tsx` (Wurzel, geteilt) | `app/v2/layout.tsx` (nur Stylesheet) |

**Die Tokens sind ausdruecklich NICHT doppelt.** `[cmd]` Die 32 Tokens
des Entwurfs sind identisch mit den vorhandenen — es gab nichts zu
uebernehmen. `v2.css` definiert `[cmd]` **0** Tokens und verweist
`[cmd]` **221**-mal auf die geteilten.

---

## Das Praefix: `v2-`

`[cmd]` Der Entwurf benennt seine Bausteine so allgemein, wie ein
eigenstaendiges Dokument es darf: `.card`, `.sidebar`, `.topbar`, `.btn`,
`.pill`, `.row`, `.grid`, `.tabs`, `.avatar`. `[cmd]` Eine
Namensgleichheit besteht heute schon — `.num` steht in `globals.css`
**und** im Entwurf.

Gewaehlt wurde **`v2-`**, nicht `ui-` und nicht `lume2-`:

- `ui-` waere nach dem Umschalten sinnlos — die Klassen sind dann nicht
  mehr „die aus dem UI-Paket", sondern einfach die Klassen.
- `lume2-` waere dauerhaft und suggeriert ein zweites Produkt.
- `v2-` bindet an die Route `/v2` und an den TODO-Punkt. Wer es in einem
  Jahr sieht, findet den Zusammenhang — und beim Umschalten ist es ein
  Suchen-und-Ersetzen.

`[cmd]` 145 verschiedene Klassen, 277 Vorkommen praefixt.

`[read]` Der Auftrag nennt 123 Klassen. Meine Zaehlung kommt je nach
Methode auf andere Zahlen: 145 Klassennamen in Selektoren, davon 102 als
Regelanfang definiert, der Rest nur in Kombinationen
(`.card.tight`, `.insight.warn`). Ich nenne **145**, weil das die Zahl
ist, die praefixt werden musste. Der Unterschied ist Zaehlweise, kein
Fehlbestand.

### Erzeugt, nicht abgeschrieben

`[cmd]` `packages/ui/src/styles/klassen-uebernehmen.mjs` erzeugt
`v2.css` aus dem Entwurf. 1.142 Zeilen von Hand zu uebertragen waere
fehleranfaellig; so bleibt der Entwurf die Quelle und die Uebernahme
wiederholbar.

---

## Zwei Dinge, die NICHT mitgekommen sind

**1. Die Tokenbloecke.** `[cmd]` Entfernt: `:root` und
`:root[data-theme="light"]`.

`[cmd]` Geprueft, dass die Reparatur haelt: In
`apps/web/src/styles/themes/lume.css` stehen die Statusfarben im
Dunkelmodus auf L 0,72–0,82 und im Hellmodus auf L 0,50–0,55.
`[cmd]` Im Entwurf endet der Hellmodus-Block nach `--acc-admin` —
`--pos`, `--warn` und `--neg` fehlen dort weiterhin. **Weil die Tokens
gar nicht uebernommen werden, kann der Fehler nicht zurueckkommen.**
Ein Test haelt das fest.

**2. Der externe Font-Import.** `[cmd]` Der Entwurf laedt Inter und
JetBrains Mono per `@import` von `fonts.googleapis.com`. `[cmd]`
`apps/web` laedt heute **keine** externen Schriften. Das Uebernehmen
haette der Anwendung eine Abhaengigkeit zu einem fremden Host
aufgebracht, beim Parsen des Stylesheets, also im kritischen Pfad. Das
ist keine Klasse, sondern eine Aenderung am Laufzeitverhalten — entfernt
und mit einem Test festgehalten.

`[cmd]` Beim Entfernen ist mir zuerst ein Fehler unterlaufen, der hier
steht, weil er sich wiederholen kann: `@import[^;]*;` bricht **mitten in
der URL** ab, denn die Google-Fonts-Adresse enthaelt selbst Semikolons
(`wght@400;500;600`). Der Rest blieb als Muell stehen, und der
Produktionsbau scheiterte mit `Unknown word`. Der Ausdruck greift jetzt
ueber `url(...)` hinweg. **`pnpm gate` hat das gefunden, nicht ich** —
der Testlauf allein haette es nicht gezeigt, weil Node die CSS-Datei nur
als Text liest.

### Ein Befund, der offen bleibt

`[cmd]` `v2.css` traegt **5 `rgba()`-Werte** aus dem Entwurf: ein
Modal-Schleier, drei Schatten, eine helle Flaeche. Hex-Farben: `[cmd]`
keine.

`[read]` `apps/web` hat fuer `globals.css` eine Regel, die genau das
verbietet („globals.css stays free of hardcoded colors"). Die fuenf
Werte sind neutrale Schwarz-/Weissanteile, keine Markenfarben — sie
brechen das Theming nicht so wie ein fester Akzent. Trotzdem ist
`rgba(255,255,255,0.75)` unter `[data-theme="light"]` ein Wert, der
faellt, sobald ein helles Thema nicht weiss ist.

**Nicht behoben, weil G-01 die Klassen bereitstellt und nicht aendert.**
Ein Test friert die Zahl bei 5 ein, damit nicht unbemerkt weitere
dazukommen. `[annahme]` Umstellung auf Tokens gehoert in G-02, wenn die
betroffenen Bausteine ohnehin angefasst werden.

---

## `packages/ui` in Betrieb

`[cmd]` Vorbild `packages/shared`, Muster uebernommen statt erfunden:
rohes TypeScript, `main`/`types` auf `src/`, **keine** eigenen
`build`/`typecheck`/`test`-Skripte. Die konsumierende App uebersetzt mit.

`[cmd]` Genau deshalb bleibt `pnpm gate` bei **8 Tasks**: die acht
kommen aus `apps/web` (3), `apps/admin` (3) und
`services/nutrition-api` (2). `packages/shared` traegt `[cmd]` 0 Skripte
bei — `packages/ui` jetzt ebenso. Ein `typecheck`-Skript hier haette die
Zahl auf 9 gehoben.

`[cmd]` Eingebunden wie `shared`: `"@lumeos/ui": "workspace:*"` in
`apps/web/package.json`, dazu ein `paths`-Eintrag in
`apps/web/tsconfig.json`. `[cmd]` Der Symlink steht:
`apps/web/node_modules/@lumeos/ui -> packages/ui`.

Das Paket exportiert heute nur `V2_PREFIX` und `v2()`, damit das Praefix
an einer Stelle steht und nicht 145-mal im JSX. **Keine Komponente** —
das ist G-02.

---

## Die Route `/v2`

`[cmd]` `apps/web/src/app/v2/` mit `layout.tsx` und `page.tsx`.
Sichtbares Praefix statt Routengruppe `(v2)`, wie beauftragt.

`[cmd]` Die Wurzelhuelle `app/layout.tsx` wickelt **alles** in
`<AppShell>`. Ein verschachteltes `v2/layout.tsx` kann dem nicht
entkommen — `/v2` haette in der alten Sidebar gesteckt und waere keine
Parallelstruktur gewesen. Deshalb der einzige Eingriff in bestehenden
Rendercode:

```tsx
if (pathname === '/v2' || pathname.startsWith('/v2/')) {
  return <>{children}</>
}
```

`[read]` Bewusst **nach** allen Hooks: ein frueher Ausstieg davor wuerde
die Hook-Reihenfolge zwischen Routen aendern. Bewusst nicht
`startsWith('/v2')` allein — ein spaeteres `/v2beta` bekaeme sonst
stillschweigend den Durchgriff.

`[cmd]` `v2/layout.tsx` benutzt bewusst **nicht** `.v2-app`: das ist ein
dreispaltiges Raster (240px / 1fr / 340px), das Sidebar und
Kontextspalte erwartet. Ohne die (G-02) presste es den Inhalt in die
erste Spalte. Stattdessen `.v2-root`, die einzige hinzugefuegte Klasse —
sie setzt Grund und Schriftfarbe aus den geteilten Tokens, sonst nichts.

---

## Nachweis

### `pnpm gate`

```
Tasks:    8 successful, 8 total
```

`[cmd]` Gruen, weiterhin 8 Tasks. `[cmd]` Tests: 133 von 133 (vorher
126 — die 7 neuen sind unten beschrieben).

### `/v2` steht

`[cmd]` Aus der Routenliste des Produktionsbaus:

```
└ ƒ /v2                                  140 B          87.5 kB
```

`[cmd]` 87,5 kB gegen 96,2 kB der Modulseiten — die Differenz ist die
nicht geladene `AppShell`. Der Durchgriff wirkt also nachweislich.

`[cmd]` 146 verschiedene `v2-`-Klassen liegen im gebauten Stylesheet
`static/css/be7e3d80ed63823a.css`.

`[cmd]` Die Seite selbst konnte ich **nicht im Browser sehen**:
`[cmd]` `/v2` antwortet mit `307` nach `/login?redirect=%2Fv2` — genau
wie `/nutrition`. Das ist kein Mangel, sondern der Beleg fuer den
geteilten Routenschutz: `middleware.ts` schuetzt die neue Route, ohne
dass ich etwas eingetragen habe.

### Die bestehenden Seiten sind unveraendert

Das ist die eigentliche Pruefung. Vier unabhaengige Belege:

**1. Der Umfang des Eingriffs.** `[cmd]` An bestehenden Dateien
insgesamt **15 eingefuegte Zeilen, 0 geloeschte**:

| Datei | +/- |
|---|---|
| `apps/web/src/components/shell/app-shell.tsx` | +11 (davon 7 Kommentar) |
| `apps/web/tsconfig.json` | +3 (`paths`-Eintrag) |
| `apps/web/package.json` | +1 (Abhaengigkeit) |

Nichts entfernt, nichts umsortiert, keine Seite angefasst.

**2. Die Stilquellen sind unberuehrt.** `[cmd]` `git diff` auf
`apps/web/src/app/globals.css` und `apps/web/src/styles/` ist leer.
`foods/page.tsx` mit seinen 208 harten Farbwerten wurde nicht angefasst
— das ist G-03.

**3. Das Stylesheet erreicht die alten Seiten nicht.** `[cmd]` Im
Produktionsbau referenziert **nur** `server/app/v2/page_client-reference-manifest.js`
die Datei `be7e3d80ed63823a.css`. `[cmd]` Das gemeinsame Bundle
`67d22242ba5d897c.css` enthaelt **0** Vorkommen von `v2-`. Die 145
Klassen koennen die Modulseiten also nicht einmal versehentlich treffen.

`[cmd]` Staerker noch: als ich `v2.css` waehrend der Arbeit korrigierte,
wechselte das v2-Stylesheet seinen Hash (`5aafb5c2…` → `be7e3d80…`),
waehrend das gemeinsame Bundle `67d22242ba5d897c.css` **denselben Hash
behielt**. Der Inhaltshash der alten Seiten haengt also nachweislich
nicht an dieser Arbeit.

**4. Ein Test statt einer Zusicherung.** `[cmd]`
`apps/web/src/components/shell/__tests__/v2-durchgriff.test.ts` prueft
15 bestehende Routen (`/`, `/dashboard`, `/nutrition`,
`/nutrition/foods`, `/training`, `/recovery`, `/supplements`, `/goals`,
`/medical`, `/coach`, `/settings`, `/login`, `/auth/callback` …) gegen
die Durchgriffsbedingung — keine faellt hinein. Dazu die Faelle
`/v2beta`, `/v2-alt`, `/v20`, `/nutrition/v2`, die **nicht** durchgreifen
duerfen.

`[read]` Die Bedingung wird aus `app-shell.tsx` **gelesen**, nicht
abgeschrieben: ein Test mit einer Kopie liefe auseinander, sobald jemand
die Quelle aendert, und bestaetigte dann eine Bedingung, die es nicht
mehr gibt. Ein eigener Test schlaegt an, wenn die Bedingung im Quelltext
verschwindet oder umformuliert wird.

Weitere Tests halten fest: `v2.css` definiert keine Tokens, nutzt die
geteilten (>100 Verweise), traegt jede Klasse unter Praefix, bringt keine
Hex-Farben, keine neuen `rgba()` und keinen `@import` mit.

### `apps/admin`

`[cmd]` Baut unveraendert. `[cmd]` Port 3210, eigener Cookie-Namensraum,
von diesem Auftrag nicht beruehrt — kein `git diff` in `apps/admin/`.

---

## Was beim Umschalten zu tun ist

`[read]` Schon jetzt notiert, damit am Ende niemand vor einem `/v2`
steht, das keiner mehr aufloesen kann. **Stand G-01** — G-02 bis G-06
werden diese Liste verlaengern; wer dort etwas anlegt, traegt es hier
nach.

| # | Was | Wo | Art |
|---|---|---|---|
| 1 | Durchgriff entfernen | `components/shell/app-shell.tsx`, die 11 Zeilen | loeschen |
| 2 | `AppShell` ersetzen oder entfernen | `app/layout.tsx` | entscheiden |
| 3 | Seiten aus `app/v2/` eine Ebene hoch | `app/v2/nutrition/` → `app/nutrition/` | verschieben |
| 4 | `app/v2/layout.tsx` aufloesen | Stylesheet-Import in die Wurzel | verschieben |
| 5 | Praefix `v2-` entfernen | `packages/ui/src/styles/v2.css` **und** alle Aufrufe von `v2()` | ersetzen |
| 6 | `v2()`-Helfer und `V2_PREFIX` entfernen | `packages/ui/src/index.ts` | loeschen |
| 7 | `.v2-root` durch `.v2-app` ersetzen bzw. aufloesen | siehe oben | entscheiden |
| 8 | Alte Klassen ausbauen | `app/globals.css`, Praefix `lume-` | loeschen |
| 9 | Den Test anpassen | `__tests__/v2-durchgriff.test.ts` | ersetzen oder loeschen |
| 10 | Die 5 `rgba()` auf Tokens umstellen | `v2.css` | offen aus G-01 |
| 11 | Schriften klaeren | Der Entwurf wollte Inter/JetBrains Mono extern | entscheiden |

`[annahme]` Punkt 5 ist der aufwaendigste und der einzige, der schiefgehen
kann: das Praefix steht dann in den Klassennamen **und** in jedem
`v2(...)`-Aufruf. Weil beides aus `V2_PREFIX` bzw. dem Generator kommt,
ist es eine Umbenennung an zwei Stellen — nicht 145 einzelne Aenderungen.
Das war der Grund fuer den Helfer.

`[read]` Punkt 11 gehoert entschieden, bevor jemand Typografie beurteilt:
Solange die Schriften fehlen, sieht `/v2` anders aus als der Entwurf, und
das ist keine Abweichung des Aufbaus, sondern eine fehlende
Voraussetzung.
