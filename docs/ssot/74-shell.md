# G-02: Die Shell

`[cmd]` Erhoben am 2026-08-15, Zweig `dev`, Anker G-01 `b1c6273`.

Gebaut: die Bausteine aus `shared.jsx` und die Huelle aus `shell.jsx`
nach `packages/ui`, uebersetzt statt kopiert. **Keine Modulinhalte** —
die sind G-03 und G-06.

---

## Was aus der Vorlage nicht uebernommen wurde

### 1. `CONTEXT_DATA` — rund 220 Zeilen erfundener Inhalte

`[cmd]` `shell.jsx` haengt an der Kontextspalte ein Objekt mit
Beispieldaten fuer elf Module: HRV-Werte, „€417 Monatsbeitrag",
„12.402 DAU", „Tom Müller · athlete · pro", Buddy-Saetze wie *„Carbs are
running 38 %"*.

Das ist Vorfuehrmaterial, kein Baustein. Uebernommen wurde die
**Flaeche**: `ContextPanel` nimmt `buddyMessage`, `actions`, `insights`
und `details` als Requisiten. Wer Inhalte will, gibt sie mit.

`[cmd]` Ein Teil davon liesse sich gar nicht uebernehmen: der Eintrag
`recovery` ruft `window.calcRecoveryScore`, `window.evaluateOvertraining`
und vier weitere Funktionen auf, die es in diesem Repo nicht gibt.

### 2. Die Zustandsfuehrung der Vorlage

`[cmd]` `Sidebar` bekommt in der Vorlage `active` und `setActive` — das
aktive Modul steht in einem `useState`. Das passt zu einer einzelnen
HTML-Datei ohne Router.

Hier gibt es Routen. Eine Zustandsvariable neben dem Router waere eine
zweite Wahrheit darueber, wo man ist. Die Navigation arbeitet deshalb
mit `href`, und `resolveNav(pathname)` beantwortet „welches Modul".
Nebeneffekt, der zaehlt: ein Verweis laesst sich mit der mittleren
Maustaste in einem neuen Reiter oeffnen, ein `div` mit `onClick` nicht.

### 3. `window.dispatchEvent` als Ersatz-Router

`[cmd]` Die Vorlage loest fuer „Settings" und „Test · Onboarding"
`CustomEvent`s aus. Uebernommen wurde nur Settings, als echte Route.
Der Onboarding-Test ist ein Vorfuehrknopf.

### 4. Der Modus-Zustand

`[cmd]` `Topbar` haelt in der Vorlage `theme` selbst. `apps/web` hat den
Mechanismus bereits: Cookie plus `data-mode` am `<html>`, serverseitig
gerendert (`app/layout.tsx`, `styles/themes/registry.ts`). Ein zweiter
Zustand daneben wuerde beim ersten Laden flackern. Der Umschalter ist
deshalb gesteuert (`mode`, `onModeChange`), und `app/v2/shell.tsx`
schreibt **dasselbe** Cookie wie der bestehende `ThemeSwitcher`.

### 5. Der Dauerlauf der Buddy-Kugel

`[cmd]` `BuddyOrb` haengt an `useTime`, einer `requestAnimationFrame`-
Schleife ohne Abbruch — 60 Bilder je Sekunde, damit sich eine Kugel
wiegt, auf jeder Seite, den ganzen Tag.

Geaendert, zwei Punkte:

- **`prefers-reduced-motion` wird beachtet.** Wer Bewegung abgestellt
  hat, bekommt ein ruhendes Bild.
- **Im Zustand `idle` steht die Animation still.** Sie laeuft nur, wenn
  Buddy wirklich etwas tut. `[read]` In G-02 tut er nie etwas, die
  Schleife laeuft also nie.

`[cmd]` Ausserdem repariert: Die Vorlage vergibt feste SVG-IDs
(`orb-g`, `blur`). Stehen zwei Kugeln auf einer Seite, verweisen beide
auf dieselbe Definition, und die letzte gewinnt. Jetzt `useId`.

### 6. Bedienelemente, die nichts tun

Suche mit ⌘K, „Commands", Benachrichtigungen, „Ask", „View memory",
Anheften — in der Vorlage sehen sie aus wie Funktionen. Sie sind
`disabled`, mit einer Regel, die das sichtbar macht.

`[read]` Ein Knopf, der nichts tut, ist ein Versprechen; ein
deaktivierter ist eine Aussage.

### 7. Ein Symbol, das es nicht gibt

`[cmd]` `shell.jsx` verweist auf `icon: "user"` — im `ICONS`-Objekt der
Vorlage fehlt der Schluessel. `<Icon name="user" />` rendert dort
**still nichts**. In `packages/ui` ist `IconName` eine Union ueber die
51 vorhandenen Schluessel; derselbe Fehler ist jetzt ein
Uebersetzungsfehler.

### 8. Kleinigkeiten mit Folgen

| Vorlage | Hier | Grund |
|---|---|---|
| `Sparkline` bei 1 Punkt | gibt `null` | `w / (length - 1)` ist dort `Infinity`, die Kurve verschwindet ohne Meldung |
| `Ring` deckelt nur oben | beidseitig geklemmt | ein negativer Wert fuellt den Ring sonst rueckwaerts |
| `Meter` deckelt oben | zusaetzlich unten, `max = 0` abgefangen | dito |
| `Tabs` aus `<div onClick>` | `<button role="tab">` | per Tastatur nicht erreichbar, fuer Hilfsmittel kein Bedienelement |
| kein `:focus-visible` | Regel ergaenzt | bei Tastaturbedienung war nicht erkennbar, wo man steht |

---

## Die zwei Entscheidungen

### 1. Die Kontextspalte auf schmalen Fenstern

**Entschieden: ausblenden, in zwei Stufen — kein Blatt, kein Reiter.**

`[cmd]` Der Befund, der die Entscheidung getragen hat: **Der Entwurf hat
null `@media`-Regeln.** `styles.css` ist fuer den Schreibtisch
gezeichnet; unter 1.280 px passiert dort schlicht nichts, das Raster
bleibt bei `240px 1fr 340px` und laeuft aus dem Fenster.

`[cmd]` Die bestehende Oberflaeche hat zwei Haltepunkte (`globals.css`,
1279 px und 1023 px) und blendet die Kontextspalte bei 1279 px aus.
Uebernommen wird **deren Verhalten**, nicht ein drittes:

| Breite | Raster | Kontextspalte | Seitenleiste |
|---|---|---|---|
| ab 1280 px | `240px 1fr 340px` | sichtbar | voll |
| 1024–1279 px | `56px 1fr` | **aus** | Symbolleiste |
| bis 1023 px | eine Spalte | **aus** | waagrechte Leiste oben |

Warum nicht Blatt oder Reiter:

- **Ein Blatt von rechts** ist ein Bedienelement, das es sonst nirgends
  gibt. Es braeuchte Ausloeser, Schliessgeste, Fokusfalle und einen
  Zustand, der sich mit dem Knopf in der Kopfzeile vertraegt. Das ist
  eine Komponente, und G-02 baut die Shell, nicht Extras.
- **Ein eigener Reiter** verschiebt die Frage nur: dann konkurriert die
  Kontextspalte mit dem Modulinhalt um dieselbe Flaeche, und es braucht
  eine Regel, welcher gewinnt.
- **Ausblenden** ist ehrlich: `[read]` die Spalte traegt Begleitung
  (Buddy, Schnellaktionen, Erkenntnisse), nicht den Inhalt selbst. Was
  dort steht, ist auch im Modul erreichbar — oder muss es werden.

`[annahme]` Das ist eine Entscheidung **fuer die Shell**, nicht fuer
Buddy insgesamt. Wenn sich in G-06 zeigt, dass Buddy auf dem Telefon
erreichbar sein muss, ist das ein eigener Auftrag mit eigener Fluesse —
nicht ein Nachtrag hier. `[read]` Codex' Analyse fuehrt „Mobile
Navigation Pattern" als offene Entscheidung; fuer die Shell ist sie
hiermit beantwortet.

`[cmd]` Nachgemessen, alle drei Breiten ohne waagrechten Ueberlauf:

```
breit   1600px: 240px 1020px 340px · Kontext sichtbar · ok
tablet  1100px: 56px 1044px        · Kontext aus      · ok
schmal   800px: 800px              · Kontext aus      · ok
```

### 2. Die fuenf `rgba()`-Werte

**Einer ersetzt, vier benannt.**

`[cmd]` Ersetzt: `rgba(255,255,255,0.75)` auf `.v2-mh-stat` unter
`[data-theme="light"]` → `var(--surface)`. Der Token ist im Hellmodus
`oklch(1 0 0)`, also genau Weiss — die Ersetzung aendert das Bild nicht
und macht den Wert themenfaehig. Das war der Wert, den der Auftrag
ausdruecklich nannte.

`[cmd]` **Nicht ersetzt, weil kein Token passt** — das sind
Token-Entscheidungen fuer Tom, keine Nebenbei-Aenderungen:

| Wert | Stelle | Was fehlt |
|---|---|---|
| `rgba(0,0,0,0.5)` | `.v2-modal-veil` | Kein Token fuer Ueberlagerung |
| `rgba(0,0,0,0.03)` | Karte/KPI im Hellmodus | Kein Schattentoken |
| `rgba(0,0,0,0.05)` | `.v2-module-hero` im Hellmodus | dito |
| `rgba(0,0,0,0.05)` | `.v2-module-header.v2-module-hero-lite` | dito |

`[cmd]` Die 32 Tokens kennen weder Schatten noch Ueberlagerung. Ein
`--shadow-sm` oder `--overlay` waere neu — und Tokens zu erfinden
verbietet der Auftrag zu Recht.

`[cmd]` Der Test aus G-01 friert die Zahl jetzt bei **4** ein, ein
zweiter prueft, dass die helle Flaeche ueber `var(--surface)` laeuft.

---

## Der Modulakzent

**Entschieden: eigene Liste in `packages/ui`, nicht geteilt.**

`[cmd]` Die Frage ist schon vorentschieden: `moduleAccentMap` steht in
`app-shell.tsx` auf Modulebene **ohne `export`** — die Datei exportiert
genau ein Symbol, `AppShell`. Teilen hiesse, `app-shell.tsx` zu aendern,
und das verbietet der Auftrag.

Inhaltlich, falls die Frage spaeter neu gestellt wird: Eine geteilte
Liste bindet zwei Oberflaechen aneinander, die sich gerade absichtlich
auseinander entwickeln. Der Preis der zweiten Liste ist Drift — hier
klein, weil die Liste keine Logik traegt, sondern elf feste Zuordnungen,
und die **Tokens selbst geteilt bleiben**.

`[cmd]` Gegen die Drift steht ein Test: er liest beide Listen aus den
Dateien und vergleicht sie. Zum Fehlschlagen gebracht — ein
absichtlicher Tippfehler (`nutrition: 'train'`) laesst ihn anschlagen.
Ein zweiter prueft, dass jeder Akzentschluessel einen Token in
`lume.css` hat.

`[cmd]` Es bleibt bei `var(--acc-*)` als Inline-Wert. Die Huelle setzt
`--acc` einmal auf `.v2-app`, alles darunter liest `var(--acc)`.

---

## Was in jedem Modul wiederkehrt

**Die Liste, an die sich G-03 zu halten hat.** Wer davon etwas nachbaut,
baut es falsch — und dann dreimal.

Alles aus `@lumeos/ui`, Import `import { … } from '@lumeos/ui'`.

### Bausteine

| Baustein | Wofuer | Wichtigste Requisiten |
|---|---|---|
| `Card` | Jede Flaeche mit Rahmen und Kopf | `title`, `sub`, `actions`, `accent` |
| `KPI` | Kennzahl mit Einheit, Delta, Verlauf | `label`, `value`, `unit`, `delta`, `deltaVariant`, `spark` |
| `Pill` | Statusmarke | `variant`: `pos` \| `warn` \| `neg` \| `acc` |
| `Ring` | Anteil als Kreis | `value`, `max`, `size`, `label` |
| `Meter` | Anteil als Balken | `value`, `max`, `tall` |
| `Row` | Beschriftung links, Wert rechts | `label`, `value`, `icon`, `sub` |
| `Tabs` | Reiterleiste | `items`, `active`, `onChange` |
| `ModuleHero` | Modulkopf mit Medaillon und Kennzahlen | `icon`, `title`, `sub`, `pills`, `stats`, `actions` |
| `Sparkline` | Kleiner Verlauf | `data`, `color` |
| `Icon` | 51 Symbole, `IconName` getypt | `name`, `className`, `title` |

`[read]` **Nicht** uebernommen wurden `LineChart` und `RadarChart` aus
`shared.jsx`. Sie sind keine Huellenbausteine, sondern Darstellungen
fuer bestimmte Module, und beide haben offene Fragen (feste Breite 600,
`range` ohne Behandlung leerer Daten). Sie gehoeren in den Auftrag, der
sie zuerst braucht — dann mit Tests fuer die Randfaelle.

### Huelle

| Baustein | Wofuer |
|---|---|
| `AppShell` | Setzt Raster, Akzent und Dichte; fuegt die drei Teile zusammen |
| `Sidebar` | Module, Arbeitsbereiche, System, Nutzerzeile |
| `Topbar` | Brotkrumen, Sync, Modus, Kontextschalter |
| `ContextPanel` | Buddy, Schnellaktionen, Erkenntnisse, Moduldetails |
| `BuddyOrb` | Zustandsanzeige, Attrappe |

### Navigation und Akzent

| Ausdruck | Wofuer |
|---|---|
| `MODULES`, `WORKSPACES`, `SETTINGS_ENTRY` | Die Eintraege — **nicht je Modul neu schreiben** |
| `resolveNav(pathname)` | Welches Modul ist aktiv |
| `MODULE_ACCENT`, `accentVar(id)` | Modul → Akzenttoken |
| `v2(...)`, `V2_PREFIX` | Klassennamen mit Praefix |
| `V2_BASE` | `/v2` — die eine Stelle, die G-07 aendert |

### Wie eine Modulseite in G-03 aussieht

Die Huelle kommt aus `app/v2/layout.tsx`. Eine Modulseite ist **nur der
Inhalt**:

```tsx
import { Card, KPI, ModuleHero, Pill } from '@lumeos/ui'

export default function NutritionPage() {
  return (
    <>
      <ModuleHero icon="nutrition" title="Nutrition" … />
      <div className="v2-grid v2-g-cols-2">…</div>
    </>
  )
}
```

`[cmd]` **Achtung, eine Falle aus dem Entwurf:** `.v2-g-cols-2` setzt
nur `grid-template-columns`, **nicht** `display: grid`. Ohne
`.v2-grid` daneben passiert nichts. Mir ist genau das im ersten Anlauf
passiert — im Bildschirmfoto standen die beiden Kennzahlen
untereinander statt nebeneinander.

---

## Nachweis

### Gate und Tests

`[cmd]` `pnpm gate`: **8 successful, 8 total** — unveraendert.
`[cmd]` Tests: **136 von 136** gruen (vorher 133; drei neue).

`[cmd]` Die G-01-Pruefung haelt: die 15 bestehenden Routen fallen nicht
in den `/v2`-Durchgriff. Im Produktionsbau referenziert **nur**
`server/app/v2/page_client-reference-manifest.js` das v2-Stylesheet; die
beiden anderen CSS-Bundles enthalten **0** Vorkommen von `v2-`.

### Im Browser angesehen — zum ersten Mal in diesem Projekt

`[read]` Der Auftrag fragt danach: „Bisher wurde in diesem Projekt
Design nie im Browser geprueft; wenn es hier zum ersten Mal geht, sag
es." **Es ging, und es war das erste Mal.**

`[cmd]` Angemeldet mit `test-user@lumeos.local` aus
`docs/ssot/37-testkonten.md`, ueber Playwright (liegt als
`@playwright/test` bereits im Repo). Gemessen auf `/v2`:

| | |
|---|---|
| `.v2-app` / `.v2-sidebar` / `.v2-topbar` / `.v2-context` | je 1 |
| Navigationseintraege | 12 |
| **alte `.lume-shell`** | **0** |
| Raster | `240px 1020px 340px` |

`[cmd]` Und die Gegenprobe auf `/nutrition`: **0** v2-Elemente, **1**
`.lume-shell`. Genau umgekehrt — die beiden Oberflaechen beruehren
einander nicht.

### Beide Modi

`[cmd]` Gemessen, nicht angenommen:

| | Dunkel | Hell |
|---|---|---|
| Grund | `oklch(0.155 0.005 270)` | `oklch(0.985 0.002 270)` |
| Schrift | `oklch(0.97 0 0)` | `oklch(0.2 0.005 270)` |
| Karte | `oklch(0.205 0.005 270)` | `oklch(1 0 0)` |
| `--pos` | `oklch(0.78 0.13 150)` | `oklch(0.52 0.13 150)` |
| `--warn` | `oklch(0.82 0.13 80)` | `oklch(0.55 0.13 80)` |
| `--neg` | `oklch(0.72 0.16 22)` | `oklch(0.50 0.16 22)` |

`[cmd]` Die drei Statusfarben tragen im Hellmodus die **reparierten**
Werte (L 0,50–0,55), nicht die Nachtwerte des Entwurfs. Die Reparatur
aus `d19e651` haelt — und weil v2 keine Tokens mitbringt, konnte sie gar
nicht zurueckkommen.

### Die elf Akzente

`[cmd]` Durchgeschaltet und die Farbe gemessen: **11 verschiedene Farben
bei 11 Modulen.**

```
Dashboard   oklch(0.78 0.04 240)   Medical      oklch(0.76 0.09 15)
Nutrition   oklch(0.78 0.10 70)    Coach        oklch(0.78 0.08 200)
Training    oklch(0.74 0.10 290)   Buddy        oklch(0.76 0.09 310)
Recovery    oklch(0.78 0.08 160)   Marketplace  oklch(0.78 0.08 145)
Supplements oklch(0.76 0.10 25)    Admin        oklch(0.75 0.01 270)
Goals       oklch(0.80 0.10 95)
```

`[cmd]` Dieselben Werte stehen in `styles/themes/lume.css` — die Huelle
liest sie, sie kopiert sie nicht.

### Konsolenmeldungen

`[cmd]` Drei, **keine davon aus diesem Auftrag**:

- Zweimal `Warning: Extra attributes from the server: data-mode` — aus
  `MODE_BOOTSTRAP` in `app/layout.tsx`, `[cmd]` zuletzt in `968bfca`
  geaendert, von mir nicht angefasst. Tritt auf der alten Oberflaeche
  ebenso auf.
- Einmal `TypeError: Failed to fetch` aus `@supabase/auth-js` beim
  Abmelden der Testsitzung.

`[annahme]` Die Hydrations-Warnung gehoert repariert, aber in einem
Auftrag, der `layout.tsx` anfassen darf.

---

## Was Buddy spaeter braucht

`[read]` Der Auftrag: „Die Kostenfrage gehoert nicht in diesen Auftrag;
bau die Flaeche, nicht den Aufruf." Was fehlt, damit aus der Attrappe
etwas wird:

1. **Eine Quelle fuer den Text.** `ContextPanel` nimmt `buddyMessage`
   entgegen — heute ein fester Satz. Ein Modellaufruf braeuchte einen
   Endpunkt, der weiss, welches Modul und welche Daten gemeint sind.
2. **Eine Antwort auf die Kostenfrage.** `[cmd]` Die Vorlage zeigt auf
   **jeder** Seite einen kontextbezogenen Satz. Bei elf Modulen und
   taeglicher Nutzung ist das ein Aufruf je Seitenaufruf. Ohne
   Zwischenspeicher, Ausloeser („nur auf Klick") oder Budget ist das
   nicht abschaetzbar.
3. **Die Zustaende.** `BuddyState` kennt `idle`, `thinking`,
   `responding`, `alert`, `celebrating`. Heute setzt sie niemand. Wer
   den Aufruf baut, setzt `thinking` waehrenddessen — dann laeuft auch
   die Animation wieder, und zwar genau dann, wenn sie etwas aussagt.
4. **Die Erkenntnisse.** `insights` ist eine Liste mit `id`, damit
   `onDismissInsight` weiss, was gemeint ist. Wo die herkommen und ob
   ein Verwerfen dauerhaft ist, ist offen.
