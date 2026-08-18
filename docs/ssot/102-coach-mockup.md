# Coach als Attrappe — zwei Unterbereiche (G-40)

**Stand:** 2026-08-18 · **Auftrag:** G-40 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

---

## Kurzfassung

`[cmd]` **Gebaut ist `Coach → Human Coaches`, vollstaendig: zehn Tabs,
60 von 60 Posten**, gezaehlt mit `tools/vollstaendigkeit.mjs`.

`[cmd]` **`Coach → AI Coach` ist nicht gebaut: 41 Posten, zwanzig Tabs.**
Die Seite existiert und **nennt die zwanzig fehlenden Tabs namentlich**
(`apps/web/src/app/v2/coach/ai/page.tsx`), statt zu fehlen oder leer zu
sein — nach dem in G-29 festgelegten Umgang.

`[cmd]` **Zwei Zahlen des Auftrags stimmen nicht.** Der Auftrag nannte
„elf Tabs" fuer Human Coaches und „zwoelf Tabs" fuer AI Coach. Gezaehlt
sind es **zehn** (`module-coach.jsx:183-194`) und **zwanzig**
(`module-buddy.jsx:26-45`). Beide Zahlen stehen als Test fest, damit
niemand dauerhaft einen Tab sucht, den es nicht gibt.

| | Human Coaches | AI Coach |
|---|---|---|
| Kennzeichen | `COACH-HUMAN` | `COACH-AI` |
| Route | `/v2/coach/human` | `/v2/coach/ai` |
| Rahmen der Vorlage | `CoachModule` | `BuddyModule` |
| Tabs `[cmd]` | **10** (Auftrag: 11) | **20** (Auftrag: 12) |
| Posten `[cmd]` | **60 von 60** | **0 von 41** |
| Vorlage | 6 Dateien, 197 KB | 4 Dateien, 109 KB |

`[cmd]` Warum geteilt geliefert: 306 KB Vorlage, zusammen 101 Posten —
das groesste Modul bisher. Der Auftrag erlaubt die Teilung ausdruecklich
nach dem G-29-Muster: ganze Tabs statt halber, und was fehlt, steht in
der Oberflaeche.

---

## 1. Welcher Rahmen gilt und wen er aufruft — rekursiv

### Die Weiche

`[cmd]` `app.jsx:126-128` fuehrt **drei** Faelle, nicht zwei:

```js
case "coach": case "coach-human": return <CoachModule />;
case "coach-ai":                  return <BuddyModule />;
case "portal":                    return <CoachPortalStandalone />;
```

`[cmd]` **Anders als bei Recovery und Medical gibt es keine V2-Weiche.**
`module-coach.jsx:969` setzt `window.CoachModule` genau einmal,
`module-buddy.jsx:414` setzt `window.BuddyModule` genau einmal. Keine
zweite Datei ueberschreibt eines von beiden. Beide Rahmen sind eindeutig.

`[cmd]` `coach` ohne Zusatz ist ein **Synonym** fuer `coach-human`, keine
eigene Ansicht. Die Umsetzung macht es genauso: `/v2/coach` leitet auf
`/v2/coach/human` weiter.

### Was die rekursive Pruefung zutage foerdert

Der Auftrag verlangte die Pruefung rekursiv — und sie lohnt sich hier
mehr als bei jedem Modul zuvor.

`[cmd]` Der Coach-Rahmen ruft **26 Namen** ueber `window.*` auf. Aber:
**`module-coach.jsx` traegt beide Seiten der Beziehung in einer Datei.**
Zeile 137:

```js
const side = "athlete";
```

`[cmd]` Diese Variable ist **fest verdrahtet** — kein Zustand, kein
Umschalter, kein Aufrufparameter. Der Rahmen fuehrt an fuenf Stellen
`side === "athlete" ? … : …`, und der Sonst-Zweig ist **nie
erreichbar**. Hinter ihm liegt der komplette Trainerarbeitsplatz:
`PortalOverview`, `PortalAthletes`, `PortalPlans`, `PortalMessages`,
`PortalRevenue`, `PortalAlerts`, dazu `CoachPortalStandalone` mit sieben
weiteren Ansichten.

`[cmd]` **Das ist kein Versaeumnis der Umsetzung, sondern der Bauplan
der Vorlage.** Der Arbeitsplatz steht seit G-02 unter WORKSPACES als
externer Link auf `coach.lumeos.app` (`packages/ui/src/shell/nav.ts:86`)
und gehoert nicht in dieses Modul. Der Auftrag sagt es ebenso.

`[cmd]` Uebernommen ist deshalb der Athletenzweig. Die 20 Portal-Posten
stehen in `tools/vollstaendigkeit.mjs` unter `MODULE.coach.bekanntOffen`
— je mit Begruendung, damit die Zaehlung sie nicht als Luecke meldet und
zugleich niemand sie stillschweigend vergisst.

### Eine abgeloeste Fassung, wie bei Recovery und Medical

`[cmd]` `module-coach.jsx:199`:

```js
{tab === "permissions" && (window.AthletePermissionsV2
  ? <window.AthletePermissionsV2/> : <AthletePermissions/>)}
```

`AthletePermissionsV2` liegt vor (`Object.assign(window, …)`,
`module-coach-athlete.jsx:565`), **also gewinnt es immer.**
`AthletePermissions` ist der Notnagel, der nie greift — dasselbe Muster
wie bei Recovery und Medical. Uebernommen ist V2.

`[cmd]` Der Unterschied ist inhaltlich, nicht kosmetisch: die alte
Fassung fuehrt sieben frei getippte Modulnamen und Auswahlfelder ohne
Wirkung; V2 fuehrt die **sieben Spezifikationsmodule** mit
Vorgabestufen, Empfindlichkeitsmarkierung, Ablaufdatum und einem
Einwilligungsprotokoll.

### Dieselbe Falle wie bei Medical — und diesmal war sie da

`[cmd]` Regel 4 der Zaehlregeln (`nicht nur nach window. greifen`) hat
hier gegriffen: `CoachDetailModal` (`module-coach.jsx:740`) ruft
`window.CoachRelationshipCard` — eine Komponente aus einer **anderen**
Datei (`module-coach-meta.jsx:23`), die ein Grep im Rahmen allein nicht
findet, weil sie im Modalkoerper steht, nicht in der Tableiste.

### Der Ruf-Baum, wie er umgesetzt ist

```
CoachAnsicht                        ansicht.tsx      (module-coach.jsx:136)
├── AthleteOverview                 ansicht.tsx      6 Karten
│   └── CoachCardMini               ansicht.tsx
├── AthleteCoaches                  ansicht.tsx      4 Karten (je Trainer)
├── AthletePermissionsV2            tab-rechte.tsx   2 Karten   ← loest V1 ab
├── AthleteProposals                tab-rechte.tsx   3 Karten
│   ├── ProposalCard                tab-rechte.tsx
│   └── ProposalModal               tab-rechte.tsx
├── AthleteAutonomy                 tab-autonomie.tsx 8 Karten
├── AthleteCheckins                 tab-autonomie.tsx 3 Karten
├── AthleteMessages                 ansicht.tsx      2 Karten
├── AthleteNotes                    ansicht.tsx      5 Karten
├── AthleteInvites                  ansicht.tsx      1 Karte
├── CoachOnboardingWizard           tab-onboarding.tsx 1 Karte
└── CoachModale                     modale.tsx       5 Modale
    ├── CoachDetailModal            └── CoachRelationshipCard (tab-onboarding.tsx)
    ├── InviteCoachModal            ├── ScanQRModal
    ├── MessageThreadModal          └── NoteDetailModal
```

---

## 2. Was `-gaps.jsx` enthaelt

`[read]` Der Auftrag vermutete „Luecken in der Betreuung". **Das ist es
nicht.**

`[cmd]` Der Dateikopf von `module-coach-gaps.jsx` sagt es selbst:

> `// Coach module · gap-closers — wires MultiDimAdherence, Autonomy,`
> `// inline actions, alert detail, rule editor, coach settings,`
> `// intervention engine, pattern analysis, team/audit details,`
> `// consent flow`

**„gap-closers" sind Komponenten, die Luecken in der Hauptdatei
schliessen** — Nachreichungen zu `module-coach.jsx`, nicht ein
fachliches Thema „Luecken in der Betreuung". Der Name meint die Vorlage
selbst, nicht das Produkt.

`[cmd]` Die Datei (455 Zeilen) definiert **elf Komponenten** plus einen
eigenen Modalrahmen `CMod`:

| Zeile | Name | Gehoert zu |
|---|---|---|
| 23 | `AthleteDetailEnhanced` | Portal (loest `AthleteDetailModal` ab) |
| 134 | `smartPriorityScore` | Portal (Formel fuer die Alarmreihung) |
| 140 | `AthleteInlineActions` | Portal |
| 149 | `AlertDetailModal` | Portal |
| 171 | `CoachSettingsModal` | Portal |
| 207 | `RuleEditModal` | Portal |
| 241 | `PatternAnalysisView` | Portal |
| 304 | `InterventionEngineView` | Portal |
| 356 | `InviteTeamMemberModal` | Portal (Trainerteam) |
| 374 | `TeamMemberDetailModal` | Portal (Trainerteam) |
| 404 | `ConsentFlowView` | Portal |
| 439 | `CoachExtrasLauncher` | Rahmen — haengt die obigen ein |

`[cmd]` **Zehn der elf gehoeren dem Portalzweig**, nicht dem
Athletenbereich. `CoachExtrasLauncher` haengt zwar bedingungslos am
Rahmen (`module-coach.jsx:216`), oeffnet aber ausschliesslich
Portal-Modale. Nichts davon ist im Athletenbereich erreichbar.

`[annahme]` Der Name der Datei ist damit irrefuehrend: sie ist kein
Nachtrag zum Athletenbereich, sondern **die zweite Haelfte des
Trainerarbeitsplatzes**, die in `module-coach-portal-v2.jsx` keinen Platz
mehr fand. Sie faellt mit dem Portalauftrag an.

---

## 3. Die Zaehlung je Tab

`[cmd]` Gezaehlt mit `tools/vollstaendigkeit.mjs` — dem geteilten
Werkzeug, das der Auftrag nennt. Coach ist dort neu eingetragen
(`MODULE.coach` und `MODULE['coach-ai']`).

```
=== COACH =============================================
  OK   AthleteAutonomy          0 Unterkomp., 4 Kacheln
  OK   AthleteCheckins          0 Unterkomp., 3 Kacheln
  OK   AthleteCoaches           0 Unterkomp., 0 Kacheln
  OK   AthleteInvites           0 Unterkomp., 1 Kacheln
  OK   AthleteMessages          0 Unterkomp., 1 Kacheln
  OK   AthleteNotes             0 Unterkomp., 0 Kacheln
  OK   AthleteOverview          1 Unterkomp., 6 Kacheln
  OK   AthletePermissionsV2     1 Unterkomp., 2 Kacheln
  OK   AthleteProposals         2 Unterkomp., 0 Kacheln
  OK   CoachOnboardingWizard    0 Unterkomp., 0 Kacheln
  OK   (Modale)                 8 Stueck
  OK   (Daten/Formeln)          6 Stueck
  60 von 60 vorhanden.
```

`[cmd]` Wie bei Medical bestaetigt sich: **Komponentennamen allein
zaehlen zu wenig.** Sechs der zehn Tabs haben null Unterkomponenten —
ihr Inhalt steckt in Karten. Erst die Kacheltitel machen die Zaehlung
belastbar; 17 Titel waren zu bauen.

### Was die Zaehlung an ihrer eigenen Grenze zeigte

`[cmd]` Zwei Luecken im geteilten Werkzeug sind dabei aufgefallen und
behoben, beide mit Begruendung im Skript:

1. **`bekanntOffen` galt nur fuer Komponenten, nicht fuer Daten.**
   Coach meldete `PORTAL_ATHLETES` und `COACH_PLANS` als Luecke, obwohl
   beide zum eingetragen offenen Portalzweig gehoeren. Ein Modul konnte
   eine Datenkonstante nicht als bewusst offen erklaeren — die
   Komponente daneben schon.
2. **Die Kacheltitel eines bewusst offenen Tabs zaehlten weiter mit.**
   `AthletePermissions` war als abgeloester Vorgaenger eingetragen und
   wurde uebersprungen; seine Kachel „Per-coach permissions matrix"
   wurde trotzdem als fehlend gemeldet. Genau diese Kachel steht in der
   abloesenden Fassung als „Permission matrix" da.

`[cmd]` Beide Aenderungen sind gegen alle acht Module geprueft: kein
anderes Modul verschiebt sich (Dashboard 3/3, Nutrition 38/38, Training
45/45, Recovery 67/71, Goals 65/65, Supplements 42/67 — unveraendert).

### AI Coach: was aussteht

```
=== COACH-AI ==========================================
  0 von 41 vorhanden.
```

`[cmd]` Die zwanzig Tabs, in der Reihenfolge der Vorlage
(`module-buddy.jsx:26-45`):

Chat · Insights feed · Memory · Decisions · Personality ·
Avatar states · Plan & gate · Engines · Journey · Watcher ·
BSS · Signature · Interventions · Safety · Butler ·
Voice / Live · Knowledge · Rules · Coach overrides · Clone & Gym

`[read]` Tom zum Umfang: *„Der AI Coach ist ein Teil von Buddy-Logik.
Der effektive Endausbau, welcher DER BUDDY als App sein wird, wird viel
umfangreicher sein."* Gebaut wird das Modul, nicht der Endausbau.

---

## 4. Was im Vorgaengerrepo danebenliegt

`[cmd]` Selbst nachgemessen, nicht aus einem Bericht uebernommen.

**Und die Antwort faellt hier anders aus als bei Recovery oder Medical:
es liegt nicht Material daneben, sondern ein fertiges Produkt.**

### Die Datenbank

`[cmd]` **20 Migrationen mit `coach` oder `buddy` im Namen, zusammen
2.316 Zeilen** (`ls | grep -ic`, `cat | wc -l`). Zum Vergleich: Medical
hatte eine Migration mit sieben Tabellen.

Die drei, auf die es fuer dieses Modul ankommt:

| Datei | Was darin steht |
|---|---|
| `012_create_coach_tables.sql` | `coach_clients` mit **`permissions` JSONB**, Vorgabe je Modul `full\|summary\|none` |
| `018_coach_permissions.sql` | **`coach_client_permissions`** — das eigentliche Berechtigungsmodell |
| `056_coach_autonomy.sql` | **`coach_autonomy`** — Autonomiestufen |

`[cmd]` `coach_client_permissions` (018, Zeile 4-36) fuehrt **sieben
Lese-Flags** (`read_nutrition`, `read_supplements`, `read_training`,
`read_recovery`, `read_goals`, `read_medical`, `read_body_composition`),
**drei Schreib-Flags**, **zwei Edit-Flags** und ein **separates
Einwilligungspaar** `medical_consent_given` + `medical_consent_date`.
Der Kommentar an `read_medical` lautet `(SENSITIVE)`.

**Das deckt sich mit der Vorlage bis in die Empfindlichkeitsmarkierung.**
Die sieben Module der Vorlage und die sieben Lese-Flags der Migration
sind dieselben sieben, und beide heben Medical gesondert hervor.

### Drei Unterschiede, die beim Anbinden zaehlen

`[cmd]` **1. Die Vorlage kennt drei Stufen, die Datenbank zwei.**
Die Vorlage waehlt je Modul `full | summary | none`
(`module-coach-athlete.jsx:16-21`). `coach_client_permissions` hat
**boolesche Flags** — `full` oder `nichts`, kein `summary`. Die
JSONB-Spalte in `012` kennt die drei Stufen; die Flag-Tabelle in `018`
nicht. **Zwei Modelle nebeneinander, nie zusammengefuehrt.** Wer
anbindet, entscheidet zuerst, welches gilt.

`[cmd]` **2. Es gibt keine Widerrufshistorie.** Gesucht in allen
Migrationen nach `consent_log`, `permission_history`, `permission_audit`,
`consent_history` — **nichts gefunden.** Der Widerruf ist ein `UPDATE`
auf `false`; der vorherige Zustand ist danach fort. Die Vorlage fuehrt
dagegen ein **Einwilligungsprotokoll mit sieben Eintraegen** und der
Spalte „Granted by" (`CONSENT_LOG`, `module-coach-athlete.jsx:35-44`),
und die Umsetzung zeigt es als Tabelle.

**Das ist die groesste inhaltliche Luecke zwischen Vorlage und
Vorgaenger — und die Vorlage hat recht:** eine DSGVO-Auskunft ueber
erteilte und widerrufene Freigaben laesst sich aus einem
Ein-Zeilen-Zustand nicht geben.

`[cmd]` **3. Autonomie ist im Vorgaenger je Modul skaliert, in der
Vorlage global.** `coach_autonomy` (056) fuehrt `training_level`,
`nutrition_level`, `recovery_level`, `supplements_level` — je 1 bis 5 —
plus `safety_level` 1 bis 3. Die Vorlage kennt **eine** Stufe fuer
alles (`CLIENT_AUTONOMY.level = 4`). Der Vorgaenger ist hier feiner,
nicht groeber.

### Ein Widerspruch, der eine Entscheidung verlangt

`[cmd]` `coach_client_permissions` fuehrt ein Flag
**`edit_auto_accept`** mit dem Kommentar
`-- Changes applied without client confirmation`.

**Das widerspricht dem Kern der Vorlage.** Der Vorschlags-Tab, den ich
gerade gebaut habe, sagt in seinem Kopfsatz:

> *„Nothing your coach sends changes a module until you accept it here."*

und der Rechte-Tab:

> *„Coaches read only what you release, and they can never write to your
> modules — every plan arrives as a proposal you confirm."*

`[cmd]` Der Vorgaenger erlaubt genau das, was die Vorlage ausschliesst —
sofern der Klient es freigibt. **Beides ist vertretbar, aber nicht
beides zugleich.** Vor dem Anbinden ist zu entscheiden, ob
`edit_auto_accept` mitkommt.

### Was sonst danebenliegt

| Bereich | Gemessen |
|---|---|
| Berechtigungs-Durchsetzung | `src/api/human-coach/utils/permissionGuard.ts` — **98 Zeilen**, mit `filterByPermissions()`, das nicht freigegebene Module aus der Antwort streicht |
| Berechtigungs-Endpunkte | `src/api/human-coach/routes/permissions.ts` — 117 Zeilen, vier Endpunkte, darunter `GET /my-coaches` („wer sieht was von mir") |
| Buddy-Persoenlichkeiten | `src/api/coach/utils/personas.ts` — **131 Zeilen, fuenf Personas** mit eigenem Systemprompt |
| Seed | `supabase/seed.disabled/012_coach_seed.sql` — ein Trainer, **drei Beziehungen mit je anderer Freigabe-JSON** |

`[cmd]` **Eine Warnung fuer den Anbindeauftrag:**
`src/api/human-coach/routes/permissions.ts` Zeile 100-107 baut das
`UPDATE` per `sql.unsafe` mit fest verdrahteter `DEV_COACH_ID`
zusammen — **der Endpunkt ignoriert den eingeloggten Trainer.** Nicht
uebernehmen ohne Umbau.

### Im neuen Repo

`[cmd]` **Ein `coach`-Schema gibt es nicht.** Die Pipeline fuehrt fuenf
Schemata: `auth`, `goals`, `recovery`, `supplements`, `training`. Kein
`CREATE TABLE` in `supabase/_pipeline/` enthaelt „coach".

`[cmd]` Ein Vorgriff steht aber schon da:
`supabase/_pipeline/13_supplements/130_supplements_schema.sql:152`
fuehrt `CHECK (source IN ('user','coach','marketplace','template'))` —
eine Spalte, die auf das Modul wartet.

---

## 5. Was gebaut wurde

```
apps/web/src/app/v2/coach/
├── page.tsx              Weiterleitung auf /human (app.jsx:126 macht es genauso)
├── human/page.tsx        COACH-HUMAN — Metadaten, CSS
├── ai/page.tsx           COACH-AI — nennt die 20 fehlenden Tabs
├── ansicht.tsx           Rahmen + Overview, Coaches, Messages, Notes, Invites
├── tab-rechte.tsx        Permissions, Proposals
├── tab-autonomie.tsx     Autonomy, Check-ins
├── tab-onboarding.tsx    Onboarding + CoachRelationshipCard
├── modale.tsx            KModal + fuenf Modale
├── kontext.tsx           Modalkontext
├── daten.ts              Entwurfsdaten aus drei Vorlagedateien
├── bausteine.tsx         PunktPill, Leer — was packages/ui fehlt
└── coach.css             vier Modul-Raster
```

`[cmd]` **33 Karten, 33 Marken.** Ein Test prueft nicht nur die Zahl,
sondern dass **keine Karte ohne Marke** dasteht — wer eine ergaenzt und
die Marke vergisst, faellt auf, ohne dass jemand eine Zahl pflegt.

### Geaendert ist nur das Technische

1. JSX ohne Typen → TypeScript, `strict`.
2. Klassen auf `v2-`-Praefix.
3. `window.X` und blosse Globale → Importe.
4. `@media`-Haltepunkte bei 1100px, weil die Vorlage keine hat.
5. `Math.random()` im QR-Muster → festes Bitmuster.
6. `arr_r` → `arrow_right`.

Nicht geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
Anordnung angepasst.

`[cmd]` Eine bewusste Auslassung: `module-coach-meta.jsx:9` traegt bei
`c-suppl` ein `style2: null`, das keine andere Zeile hat und das nichts
liest. Nicht uebernommen — ein Feld, das nirgends gelesen wird, ist kein
Inhalt.

---

## 6. Die Pruefungen

`[cmd]` `pnpm gate` — **8 von 8 Aufgaben gruen.**
`[cmd]` `v2-attrappen.test.ts` — **44 Tests, 44 gruen**, davon neun neu.
`[cmd]` `tools/vollstaendigkeit.mjs coach` — **60 von 60.**

Im Browser, gegen `localhost:3200`:

`[cmd]` **Alle zehn Tabs: null Fehler, null Hydrationsabweichungen.**
Jeder Tab zusaetzlich auf einen Kennsatz der Vorlage geprueft
(„Coaching balance", „You own your data", „The ladder",
„Performance Lab Stockholm" …) — alle zehn gefunden.

`[cmd]` Die Grundlinie: `/v2/coach/human` zeigt **dieselbe eine Meldung
wie `/v2/dashboard`** — `Extra attributes from the server: data-mode`,
aus `RootLayout`, nicht aus diesem Modul.

`[cmd]` Die QR-Falle ist entschaerft: `InviteCoachModal`
(`module-coach.jsx:775`) faerbt 64 Zellen mit `Math.random() > 0.5`.
Auf dem Server faellt das anders als im Browser. Ersetzt durch
`QR_MUSTER`, ein festes 8×8-Bitmuster; ein Test prueft, dass es
**genau 64 Zellen** hat.

`[cmd]` Drei Breiten: 1440, 1100, 375. Kein Querlauf bei 1440 und 1100.

---

## 7. Was gemeldet, nicht umgangen wurde

`[read]` Der Auftrag: *„`packages/ui/` nicht anfassen — fehlt ein
Symbol: melden."* `packages/ui/` ist nicht angefasst.

**Zwei Symbole fehlen:**

| Symbol | Wo | Ersatz |
|---|---|---|
| `history` | `module-coach.jsx:398`, Knopf „Audit log · 142 entries" | `refresh` — Kreispfeil; ein Verlauf ist der Blick zurueck |
| `shield` | `module-coach-athlete.jsx:150`, Kopf „You own your data" | `admin` — dasselbe Schutzschild wie in der Seitenleiste, **dieselbe Ersetzung wie in G-36**, damit dasselbe Motiv nicht zweimal anders faellt |

`[cmd]` Die uebrigen 13 gebrauchten Symbole liegen in `icons.tsx`.
`shield` fehlt damit zum zweiten Mal (G-36, G-40) — beide Male an einer
Datenschutz-Ueberschrift. **Es waere der Kandidat fuer die naechste
Ergaenzung von `icons.tsx`.**

**Zwei Bausteine fehlen**, modul-lokal nachgebaut in `bausteine.tsx`:

`[cmd]` `PillProps` (`packages/ui/src/primitives.tsx:82`) kennt kein
`dot`; die Vorlage schreibt `<Pill variant="pos" dot>` an vier Stellen.
Ein `Empty` gibt es in `packages/ui` nicht; die Vorlage benutzt es an
zwei Stellen.

**Zwei Schoenheitsfehler der Schale**, nicht dieses Moduls:

`[cmd]` **1. Querlauf bei 375 px.** Die uebertretenden Elemente sind
ausschliesslich `v2-nav-item` — die Seitenleiste. Gegengeprueft:
`/v2/dashboard`, `/v2/medical` und `/v2/goals` laufen bei 375 px
**genauso** ueber. Bestand, nicht durch G-40 entstanden.

`[cmd]` **2. Kartenkopf bricht um.** `.v2-card-h`
(`packages/ui/src/styles/v2.css:446`) ist eine Flexzeile ohne
`flex-shrink`-Regel am Titel. Traegt eine Karte einen langen `sub` plus
die Attrappenmarke, rutscht der Titel auf zwei Zeilen — sichtbar bei
„Coaching balance" und „Trust circle". Betrifft jedes Modul mit langen
Untertiteln.

---

## 8. Was als Naechstes ansteht

1. **`Coach → AI Coach` bauen** — 41 Posten, zwanzig Tabs, vier
   Vorlagedateien (109 KB). Die Seite nennt sie bereits.
2. **Der Trainerarbeitsplatz** — 20 Posten in `bekanntOffen`, verteilt
   auf `module-coach.jsx` (Portalzweig hinter `side`),
   `module-coach-gaps.jsx` (zehn von elf) und
   `module-coach-portal-v2.jsx`. Eigener Menuepunkt, eigener Auftrag.
3. **Vor dem Anbinden zu entscheiden:** drei Stufen oder zwei
   (Abschnitt 4.1), Widerrufshistorie ja oder nein (4.2), Autonomie je
   Modul oder global (4.3), und ob `edit_auto_accept` mitkommt.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| Drei Faelle, keine V2-Weiche | `app.jsx:126-128`, `module-coach.jsx:969`, `module-buddy.jsx:414` |
| `side` fest verdrahtet | `module-coach.jsx:137` |
| Zehn Tabs, nicht elf | `module-coach.jsx:183-194` |
| Zwanzig Tabs, nicht zwoelf | `module-buddy.jsx:26-45` |
| `-gaps.jsx` = „gap-closers" | Dateikopf `module-coach-gaps.jsx:1-3` |
| V1 abgeloest | `module-coach.jsx:199`, `module-coach-athlete.jsx:565` |
| 60 von 60 | `node tools/vollstaendigkeit.mjs coach` |
| 20 Migrationen, 2.316 Zeilen | `ls supabase/migrations/ \| grep -icE "coach\|buddy"`, `cat … \| wc -l` |
| Sieben Lese-Flags, Medical gesondert | `018_coach_permissions.sql:4-36` |
| Keine Widerrufshistorie | `grep -rliE "consent_log\|permission_history\|permission_audit\|consent_history" supabase/migrations/` → leer |
| Autonomie je Modul | `056_coach_autonomy.sql` |
| `edit_auto_accept` | `018_coach_permissions.sql:26` |
| Fest verdrahtete `DEV_COACH_ID` | `src/api/human-coach/routes/permissions.ts:100-107` |
| Kein `coach`-Schema | `grep -rniE "CREATE TABLE[^;]*coach" supabase/_pipeline/` → leer |
| `'coach'` als Quelle vorgesehen | `130_supplements_schema.sql:152` |
| Gate, Tests | `pnpm gate` 8/8 · `v2-attrappen.test.ts` 44/44 |
