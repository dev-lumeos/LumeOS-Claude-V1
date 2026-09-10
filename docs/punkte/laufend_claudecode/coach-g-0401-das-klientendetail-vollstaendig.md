---
nr: G-401
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-400
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/coach/src/app/athlet/[id]/page.tsx
zahlen:
  gemessen: 2026-09-08
  altrepo_kb: 39
  heute_kb: 10
---

# G-401 — das Klientendetail, vollstaendig

## Auftrag — die Schale zuerst

Tom, 2026-09-08: *,,die coachplattform soll gleich aufgebaut sein
wie lumeos. genau gleiche strukturen, also ja: sidenav und
modulnav wie lumeos."*

`[read]` **Das aendert die Reihenfolge:** **erst die Schale, dann
die Inhalte.**

`[read]` **Sechzehn Reiter in einer Zeile waren falsch** ? **LumeOS
hat eine Seitenleiste mit Gruppen und darin je Modul eine
Reiterleiste.**

### Was `apps/web` hat

`[cmd]` **`apps/web/src/components/shell/app-shell.tsx`, 493
Zeilen:**

    Z25  moduleNav      die Module
    Z35  workspaceNav   WORKSPACES
    Z42  systemNav      SYSTEM

`[cmd]` **Dazu:** `theme-switcher.tsx`, `sprachwahl.tsx`,
`referenz-trenner.tsx`.

`[cmd]` **Und je Modul:** `v2/shell.tsx` **(159 Zeilen)** ? **der
Modulkopf mit `v2-module-header`, `v2-kopf-mitte`, dem
Tageswechsler-Anker aus G-392.**

`[cmd]` **Die Reiterleiste je Modul:** `v2-tabs`.

### Was `apps/coach` hat

`[cmd]` **`cp-shell`, `cp-kopf`** ? **eine eigene Fassung, 281
Zeilen `portal.css`.**

`[cmd]` **Keine Seitenleiste. Sechzehn Reiter in einer Zeile.**

### 1 · Die Schale uebernehmen

`[read]` **Miss zuerst, was `app-shell.tsx` an `apps/web`
bindet:**

`[cmd]` **`next-intl`? Modus-Cookie? `createClient` aus
`@lumeos/shared`?**

`[read]` **Was gemeinsam sein kann, gehoert nach `packages/ui`** ?
**melden, nicht einfach kopieren.**

`[cmd]` **Der Referenz-Trenner steht heute schon zweimal** ?
**G-399, derselbe Fehler.**

### 2 · Die Gruppen des Coach-Portals

`[read]` **Nicht die Module von `apps/web`** ? **die Arbeit eines
Coaches.**

`[cmd]` **Das Altrepo hatte vier Gruppen** (`Sidebar.tsx`):

    Dashboard
    Kunden       Klienten, Nachrichten, Check-ins, Alerts
    Programme    Ernaehrung, Training, Feedback
    ...          Regeln, Automatisierung, Autonomie,
                 Auswertung, Wissen, KI, Buddy, Einstellungen

`[cmd]` **Mit LIVE-ZAEHLERN aus `useCoachStats`, `useAlerts`,
`useAllThreads`** ? **`warn` wenn ungelesen, `critical` bei
kritischen Alerts.**

`[read]` **Die sechzehn Reiter von heute verteilen sich darauf** ?
**miss, welcher in welche Gruppe gehoert.**

### 3 · Der Modulkopf je Bereich

`[cmd]` **`v2-module-header` mit Titel, Pills, Untertitel,
Aktionen** ? **wie in der Vorlage
(`module-coach.jsx`, `CoachPortalStandalone`).**

`[cmd]` **Vier Pills:** `separate platform`, `coach.lumeos.app`,
Athletenzahl, Alerts.
`[cmd]` **Zwei Aktionen:** `Broadcast`, `New plan`.

`[read]` **Und darunter die Reiterleiste des Bereichs** ? **nicht
alle sechzehn.**

### 4 · Die Tokens

`[cmd]` **`apps/coach/src/app/tokens.css` ist eine Kopie, Stand
2026-08-20.**

`[read]` **Wenn die Schale gemeinsam wird, muessen es die Tokens
auch** ? **`packages/ui`.**

`[read]` **Melden mit der Messung, was seit dem 20.08.
auseinandergelaufen ist** ? **G-384 nennt elf
Modul-Akzenttokens.**

### 5 · Der Modus

`[cmd]` **`apps/coach` nimmt `prefers-color-scheme`, `apps/web`
einen Cookie** ? **deshalb ist das Portal hell.**

`[read]` **Miss, ob der Cookie teilbar ist** ? **dieselbe
Domaene?**

### Abnahmebedingungen

    A1  was bindet app-shell.tsx an apps/web? Liste.
        Was kann gemeinsam werden?
    A2  Seitenleiste mit Gruppen, wie apps/web.
        Zahl: Gruppen / Eintraege / davon mit Zaehler.
    A3  je Eintrag ein Modulkopf mit v2-module-header.
        Kein cp-kopf mehr.
    A4  die Reiterleiste je Bereich, nicht sechzehn in
        einer Zeile. Zahl: Bereiche / Reiter je Bereich.
    A5  dunkel wie apps/web. Bildschirmfoto beider
        nebeneinander.
    A6  die Tokens: was ist auseinander? Liste.
        packages/ui: gemeldet, nicht gebaut.
    A7  die 44 Referenzkarten aus G-398 bleiben,
        auf ihre Bereiche verteilt.
    A8  apps/coach 13/13, apps/web 1545 unveraendert.

### Was nicht zu tun ist

**`apps/web` NICHT anfassen.**
**Nichts in `packages/ui`** ? **melden, mit Messung.**
**Keine Inhalte bauen** ? **das ist der naechste Auftrag.**
**Keinen Code aus dem Altrepo uebernehmen** ? **Struktur ja,
Code nie.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **Port 3220, Tom startet ihn.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — was `app-shell.tsx` bindet, und was gemeinsam sein kann

#### Vorab: der Auftrag nennt die falsche Datei

`[cmd]` **`apps/web/src/components/shell/app-shell.tsx` (492 Zeilen)
ist der ALTE Rahmen** — um `/dashboard`, `/nutrition` …

`[cmd]` **Die V2-Oberflaeche benutzt sie nicht.**
`apps/web/src/app/v2/shell.tsx:14` holt `AppShell` aus
`@lumeos/ui`: **die Schale liegt seit G-02 im Paket**
(`packages/ui/src/shell/`, 671 Zeilen — `app-shell`, `sidebar`,
`topbar`, `context-panel`, `nav`).

`[read]` **Das ist die gute Nachricht:** **es gibt nichts zu
kopieren.** **`v2/shell.tsx` (159 Zeilen) ist das Vorbild** — es
bindet die Paketschale an die Anwendung, mehr nicht.

#### Die Bindungen von `app-shell.tsx`, Import fuer Import

    next/link, next/navigation    Framework -- in beiden Apps da
    next `Route`-Typ              typedRoutes, nur apps/web
    createClient (@lumeos/shared) DARF IM PORTAL NICHT -- s. u.
    ThemeSwitcher                 bindet ../ui/button und
                                  ../../styles/themes/registry
                                  (app-lokal, nicht geteilt)
    next-intl                     KOMMT NICHT VOR (0 Treffer)
    Modus-Cookie                  KOMMT NICHT VOR (0 Treffer)

`[read]` **Zwei der drei Fragen des Auftrags sind damit beantwortet:
kein `next-intl`, kein Cookie.**

`[cmd]` **Die dritte ist die wichtige:** **`createClient` aus
`@lumeos/shared` STUERZT im Portal ab** — Befund F-07, im Browser
gemessen: `@supabase/ssr` 0.1.0 ueberschreibt den Cookie-Default mit
`undefined` und wirft beim ersten Speichern der Sitzung
(*„Cannot read properties of undefined (reading 'get')"*).
**Deshalb hat `apps/coach` seit damals `lib/browser-client.ts`.**

`[read]` **Eine Kopie der Schale haette genau diesen Absturz
mitgebracht** — und niemand haette den Zusammenhang gesehen.

#### Und die CSS: 1.084 Zeilen, alle app-lokal

`[cmd]` **`app-shell.tsx` benutzt 109 Klassen mit `lume-`-Praefix**
(`lume-shell`, `lume-nav`, `lume-nav-item` …). `[cmd]` **Alle stehen
in `apps/web/src/app/globals.css`** — **143 Regeln, etwa 1.084
Zeilen**, und die laedt `apps/coach` nicht.

`[cmd]` **Die PAKETSCHALE nutzt dagegen `v2-`-Klassen**
(`v2-app`, `v2-sidebar`, `v2-nav-group`, `v2-nav-item`, `v2-tabs`)
— **alle in `packages/ui/src/styles/v2.css`, und die laedt
`layout.tsx:3` schon.**

#### Was gemeinsam werden kann — und was fehlt

`[cmd]` **Die Schale IST schon gemeinsam.** `[cmd]` **Was fehlt, ist
eine einzige Requisite:**

    SidebarProps (sidebar.tsx:37-50) nimmt
      pathname, linkAs, userName, userStatus,
      userInitials, userMenu, version
    -- KEINE Navigationsliste.

`[cmd]` **`Sidebar.tsx:85` rendert `MODULES.map(...)`** aus
`nav.ts` — die sieben Module von `apps/web`, fest verdrahtet.
`[read]` **Die Paketschale zeigte dem Coach also Nutrition,
Training und Recovery.**

**Der Vorschlag fuer `packages/ui` — gemeldet, nicht gebaut:**

    SidebarProps um `gruppen?: NavGruppe[]` erweitern,
    Vorgabe = MODULES/WORKSPACES/SETTINGS wie heute.
    Dazu `marke?: { kuerzel, name, meta }` fuer "LumeOS Coach"
    statt "LumeOS".

`[read]` **Dann faellt die Kopie in `apps/coach` weg** — heute sind
es 240 Zeilen, die dieselbe Struktur mit anderen Eintraegen bauen.
`[cmd]` **Es waere die dritte Doppelung nach den Tokens und dem
Referenz-Trenner (G-399).**

### A2 — die Seitenleiste: 5 Gruppen, 11 Eintraege, 6 mit Zahl

`[cmd]` **Am Schirm gemessen, dunkel:**

    Seitenleiste vorhanden   ja, 240 px (wie apps/web)
    Marke                    "LumeOS Coach"
    Gruppen                  5
    Eintraege                11
    davon mit Zaehler        6

    [ohne Titel]        Dashboard
    [Kunden]            Klienten 2 · Nachrichten 1 (warn)
                        Check-ins 1 (warn) · Alerts 3 (critical)
    [Programme]         Plaene
    [Regeln & Rechte]   Regeln · Autonomie 2 · Freigaben 2
    [ohne Titel]        Auswertung · Team & Audit

`[cmd]` **Die Struktur stammt aus dem Altrepo**
(`referenz/lumeos-2026/apps/coach/components/Sidebar.tsx:22-48`) —
**fuenf Gruppen, Zaehler mit `warn` und `critical`.** `[read]`
**Struktur uebernommen, kein Code.**

`[read]` **Die Eintraege sind die des Portals, nicht die des
Altrepos:** **kein AI Butler, kein Buddy, keine Wissensbasis** —
dafuer gibt es weder Reiter noch Tabelle. **Was es nicht gibt, steht
auch nicht in der Leiste.**

#### Ein Fehler, den erst der Schirm zeigte

`[cmd]` **Erste Messung: nur EIN Zaehler von sechs sichtbar** —
obwohl alle Zeilen da waren (2 Klienten, 1 ungelesen, 1 Check-in,
3 Alerts, 2 Rechte, 2 Autonomie, gemessen per SQL).

`[cmd]` **Die Ursache:** `page.tsx` lieferte die Schluessel als
REITER-IDS (`athletes`, `workflows`, `messages`), die Seitenleiste
fragt nach MENGEN (`klienten`, `checkins`, `ungelesen`). **Nur
`alerts` traf zufaellig.**

`[read]` **Im Quelltext war nichts zu sehen** — beide Seiten waren
in sich stimmig. **Gefunden hat es die Zaehlung am gerenderten
Element**, und ein Waechter prueft es jetzt.

### A3 — je Bereich ein Modulkopf, kein `cp-kopf` mehr

`[cmd]` **Alle elf Bereiche gemessen:**

    Bereiche mit v2-module-header    11/11
    je Kopf: Pills                   4
             Untertitel              ja
             Aktionen                2 (Broadcast, New plan)
    cp-kopf / cp-tabs im ganzen DOM  0

`[cmd]` **Auch die zwei Sonderwege** (Lesefehler, kein
Coach-Zugang) **tragen jetzt `v2-module-header`** — A3 verlangt es
ohne Ausnahme. `[read]` **Ohne Seitenleiste allerdings:** dort kommt
man nicht weiter, **also gibt es nichts zu navigieren.**

`[read]` **Die zwei Aktionen sind abgeschaltet** — es gibt weder
einen Schreibweg fuer Rundnachrichten noch eine Plantabelle
(C-426). **Der `title` nennt den Grund.**

### A4 — die Reiterleiste je Bereich

    Bereich          Reiter
    ---------------------------------------------------------
    uebersicht        1   (keine Leiste)
    klienten          2   Athletes | Onboarding
    nachrichten       1   (keine Leiste)
    checkins          1   (keine Leiste)
    alerts            3   Smart alerts | Patterns | Interventions
    plaene            2   Plans | Programs
    regeln            1   (keine Leiste)
    autonomie         1   (keine Leiste)
    freigaben         1   (keine Leiste)
    auswertung        2   Analytics | Revenue
    einstellungen     1   (keine Leiste)
    ---------------------------------------------------------
    11 Bereiche, 16 Reiter, 4 mit eigener Leiste

`[read]` **Ein Bereich mit einem Reiter zeigt keine Leiste** — eine
Leiste mit genau einem Eintrag ist ein Bedienelement ohne Wahl.

`[cmd]` **Alle sechzehn Reiter sind untergebracht, keiner
verloren** — ein Waechter vergleicht die Liste in `page.tsx` gegen
die Navigation.

`[read]` **Und ein altes `?tab=` bleibt gueltig:** es findet seinen
Bereich selbst (`bereichFuerReiter`). **Kein Lesezeichen wird
ungueltig**, obwohl die Navigation eine Ebene bekommen hat.

### A5 — dunkel wie `apps/web`

`[cmd]` **Beide Anwendungen nebeneinander, gemessen statt
behauptet:**

    apps/web    data-mode="dark"  bg oklch(0.155 0.005 270)
                Seitenleiste 240 px  3 Gruppen  Modulkopf ja
    apps/coach  data-mode="dark"  bg oklch(0.155 0.005 270)
                Seitenleiste 240 px  5 Gruppen  Modulkopf ja

    Modus gleich       true
    Grundfarbe gleich  true
    Seitenleiste       240 px : 240 px

`[cmd]` **Bildschirmfoto:
`backup/g401-a5-nebeneinander.png`** — links `apps/web`
(`/v2/dashboard`), rechts das Portal.

`[read]` **Die verbleibenden Unterschiede sind gewollt:** das
Portal hat **keine Kontextspalte** (`data-rightpanel="hidden"`
schaltet die dritte Rasterspalte ab) und **keinen Tageswechsler** —
ein Arbeitsplatz fuehrt keinen Tag.

#### Der Cookie, gemessen

`[cmd]` **`apps/web` schreibt ihn in `v2/shell.tsx:79`:**

    `${MODE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`

**Kein `domain=`-Attribut** — also **hostgebunden**. `[cmd]` **Und
die Hosts sind verschieden:** `app.lumeos.app` gegen
`coach.lumeos.app`. **Der Cookie erreicht das Portal nicht.**

`[read]` **Teilbar waere er mit `domain=.lumeos.app`** — das aendert
`apps/web`, und das verbietet dieser Auftrag. **Gemeldet, nicht
gebaut.**

`[cmd]` **Ortlich teilen 3200 und 3220 den Host `127.0.0.1`** —
dort WUERDE er ankommen, das Portal liest ihn nur nicht
(`layout.tsx:29` nimmt `prefers-color-scheme`).

### A6 — die Tokens: EIN Unterschied, und der ist Absicht

`[cmd]` **Token fuer Token gegen `lume.css`, beide Bloecke
getrennt:**

    [data-theme='lume']                       34 : 34
    [data-theme='lume'][data-mode='light']    25 : 25, identisch

    --acc   ABSICHT   hier var(--acc-coach) statt var(--acc-dash)
                      -- das Portal IST das Coach-Modul

`[read]` **Der Auftrag nimmt elf auseinandergelaufene
Modul-Akzenttokens an (G-384).** `[cmd]` **Gemessen: alle elf sind
vollstaendig vorhanden** (`--acc-admin` bis `--acc-train`).

`[cmd]` **Die zwei, die wirklich fehlten** (`--kurve-aus`,
`--kurve-beides`) **habe ich in G-400 nachgetragen** — sie waren
kein Schoenheitsfehler: `v2.css:574` und `:2184` setzen
`transition: … var(--kurve-aus)`, **und ohne das Token faellt der
Uebergang stumm auf den Vorgabewert zurueck.**

**`packages/ui`: gemeldet, nicht gebaut.**

`[read]` **Die Tokens gehoeren ins Paket, sobald die Schale
gemeinsam wird** — der Kommentar in `tokens.css:1-7` schlaegt es
selbst vor. `[cmd]` **Ein Waechter aus G-400 faengt das
Auseinanderlaufen inzwischen ab**: er liest aus `v2.css`, welche
`var(--kurve-*)` gebraucht werden, und prueft sie gegen
`tokens.css`.

### A7 — die 44 Referenzkarten, auf die Bereiche verteilt

`[cmd]` **Am Schirm gezaehlt, je Bereich ueber alle seine Reiter:**

    uebersicht      3      plaene           6
    klienten        4      regeln           5
    nachrichten     1      autonomie        1
    checkins        3      freigaben        1
    alerts          8      auswertung       5
                           einstellungen    7
    ------------------------------------------
    SUMME                                  44

`[read]` **Keine Karte verloren, keine doppelt** — dieselbe Zahl
wie in G-398, nur anders verteilt. `[cmd]` **Jeder Bereich traegt
seine Trennlinie** (E-69), gemessen: 11/11.

### A8 — Tests

`[cmd]` **`apps/coach`: 25 pass / 0 fail** — sieben neue Waechter
(vorher 18). `[cmd]` **tsc sauber, `next lint` sauber.**

`[read]` **Der Auftrag nennt 13/13** — das war der Stand vor G-400,
das fuenf Waechter ergaenzt hat.

`[cmd]` **`apps/web`: 1544 pass / 1 fail** — **derselbe
vorbestehende Fehlschlag wie in G-400** (`not ok 800`, ein
Nutrition-Test). `[cmd]` **Belegt:** `git diff HEAD -- apps/web
packages docs/spezifikation` ist **leer**.

**Sabotageprobe, je Waechter einzeln:**

    ein Reiter aus der Nav entfernt        -> ROT
    eine ganze Gruppe entfernt             -> ROT
    Zaehler auf eine erfundene Menge       -> ROT
    Stufe ohne Zahl                        -> ROT
    Seitenleiste weg                       -> ROT
    Kontextspalte wieder an                -> ROT
    Reiterleiste auch bei einem Reiter     -> ROT
    Knopf wieder anklickbar                -> ROT
    Zaehlerschluessel wieder Reiter-Id     -> ROT

**Alle zurueckgenommen, 25/25 gruen.**

#### Ein Waechter war blind — und die Probe hat es gezeigt

`[cmd]` **„Kontextspalte wieder an" blieb zuerst GRUEN.** `[read]`
**Der Grund:** die Probe suchte `data-rightpanel="hidden"` in der
GANZEN Datei — **und der Kommentar ueber der Zeile nennt es.**
**Ein Waechter, der seine eigene Begruendung liest, ist immer
gruen.**

`[cmd]` **Berichtigt:** ohne Kommentarzeilen, und am ganzen Element
verankert (`<div className="v2-app" data-rightpanel="hidden">`).
**Danach rot.**

`[read]` **Und drei Waechter aus G-400 fielen zu Recht** — sie
zeigten auf `page.tsx`, wo der Modulkopf nicht mehr steht.
**Nachgezogen, nicht entschaerft:** sie pruefen dieselbe Sache an
der neuen Stelle.

### Was gebaut ist

    portal-nav.ts       die Gruppen und ihre Reiter, mit Zaehlern
                        und Stufen -- 5 / 11 / 16
    portal-schale.tsx   Seitenleiste, Modulkopf, Reiterleiste
                        -- alles mit v2-Klassen aus @lumeos/ui
    page.tsx            loest ?bereich= und ?tab= zusammen auf,
                        alte Links bleiben gueltig
    portal.css          zwei Regeln: der Rollbereich des Inhalts
                        und der Zaehler mit seinen Stufen

`[read]` **Keine Inhalte gebaut** — der Auftrag sagt es ausdruecklich,
das ist der naechste.

### Was nicht angefasst ist

**1 — `apps/web`:** `git diff HEAD` ist leer.
**2 — `packages/ui`:** unberuehrt, zwei Vorschlaege gemeldet
(`SidebarProps.gruppen`, `marke`).
**3 — `supabase/`:** die zwei geaenderten Dateien sind Codex' C-456.
**4 — Kein Code aus dem Altrepo** — nur die Struktur der fuenf
Gruppen.
**5 — `cp-tabs`/`cp-tab` in `portal.css`** stehen unbenutzt
weiter. `[read]` **Gemeldet, nicht geloescht** — ein Folgeauftrag
raeumt sie ab.

### Neustart

`[read]` **Nicht noetig** — nur `apps/coach/src`, das laedt heiss
nach.

## Abnahme

_(vom Orchestrator)_
