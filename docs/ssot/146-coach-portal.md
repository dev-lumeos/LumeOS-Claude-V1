# 146 — Das Coach-Portal: Schema, Lesepfad, Anwendung auf 3220

**Auftrag:** F-07 · **Stand:** 2026-08-20 · **Modul:** Coach
**Vorher:** F-06 (`docs/spezifikation/30-module/addon/01-entwurf-coach-portal.md`,
der Entwurf) · C-119/G-90 (`docs/ssot/123`, `139`) · C-147 (`138`)

**Kurz:** Das Schema ist von 6 auf 12 Tabellen gewachsen (Beziehung mit
Ende, Check-ins, Nachrichten, Alerts), **der Lesepfad setzt die Freigabe
jetzt in der Datenbank durch** (22 Policies, 6 summary-Funktionen, eine
Sichtregel), und **`apps/coach` laeuft als eigene Anwendung auf Port
3220** — angemeldet als `coach@lumeos.app`, mit eigener Sitzung
`sb-127-coach-auth-token`. 8 von 16 Tabs tragen echte Daten, 8 sind
Leerzustaende mit Ursache. **68 Bildschirmfotos, 0 Attrappen, 0
Konsolenfehler.** Die Lesepfad-Pruefung besteht auf Wegwerf-DB und
live, in beiden Richtungen je Modul; die Autonomy-Aenderung ueber das
laufende Formular erzeugt die Historienzeile (3 → 4) — der aus ssot/139
ausstehende Nachweis.

---

## Was das Schema jetzt traegt

`[cmd]` Vier neue Pipeline-Schritte unter `supabase/_pipeline/15_coach/`,
alle idempotent, alle mit Selbstpruefung, live eingespielt (jede mit
`NOTICE OK` und `COMMIT`):

| Schritt | Erzeugt | Kern |
|---|---|---|
| **151** | `coach.relationships`, `relationship_change_log` | Beziehung `invited → active → ended` — **der Beendigungspfad ist von Anfang an da** (die groesste Luecke von Spec und Vorgaenger, F-06 3.2). CHECKs erzwingen Konsistenz je Status; kein DELETE — Beziehungen enden, sie verschwinden nicht; die Historie schreibt ein Trigger |
| **152** | Lesepfad | siehe naechster Abschnitt |
| **153** | `coach.checkin_templates`, `checkins` | Statusmaschine `pending → submitted → reviewed` (`missed`) als CHECK; `auto_data`/`client_data`/`coach_feedback`/`coach_notes` getrennt. **Keine persistierte Analyse** — die Vorauswertung rechnet die Anwendung beim Lesen (der Vorgaenger schrieb in Spalten, die es nie gab, F-06 5.1) |
| **154** | `coach.messages`, `alerts` | Chat mit `sender_id` per CHECK ans Paar gebunden (der Vorgaenger-Chat war ohne RLS fuer jeden lesbar, N-20); `read_at` darf nur die Empfaengerseite setzen. **Alerts bewusst ohne Schweregrad** — Titel, Sachverhalt, Zahlen (`metric` JSONB); Dringlichkeitsstufen sind T7 |

`[cmd]` **Zeilenschutz auf allem:** 12 von 12 `coach`-Tabellen mit RLS,
37 Policies im Schema `coach` (19 aus 150 + 5 + 7 + 6), Logs per
Policy-Auslassung append-only. Register gepflegt: `kette.json` (80
Schritte), `schema-sollstand.json` (+6 Tabellen), `supabase/README.md`
(+4 Zeilen) — `kette-readme-pruefen.ts` ok.

`[cmd]` **End-zu-End belegt:** frischer Kettenlauf auf Wegwerf-DB
`lumeos_f07` Exit 0, `schema-vollstaendigkeit-pruefen.ts` „SCHEMA
VOLLSTAENDIG" (fremde Tabellen 47/47), Testdatenlauf gruen inkl. des
neuen F-07-Blocks (3 Beziehungen, 1 Vorlage, 3 Check-ins, 3
Nachrichten, 3 Alerts), `testdaten-pruefen.ts` Exit 0 mit den
nachgezogenen Erwartungen (Permissions/Autonomy jetzt 2/2, Logs >= 3).

**Korrektur zum Entwurf:** `[cmd]` Die im F-06-Entwurf als `[annahme]`
gemeldete „Registerluecke" bei den Training-Katalogtabellen **gibt es
nicht** — `muscle_groups`, `equipment`, `exercises`, `exercise_muscles`
stehen im Sollstand unter `fremde_schemata` (Agentenfehler des
Ist-Stand-Laufs; der Agent hatte nur `tabellen[]` gezaehlt).

---

## Wie der Lesepfad die Freigabe durchsetzt

`[read]` Vorher galt der F-06-Befund: kein Modulschema referenzierte
`client_permissions` — auch mit `full`-Freigabe las ein Coach null
Zeilen. **152 schliesst das in der Datenbank, nicht in der Anwendung:**

- **Eine Sichtregel an einer Stelle:** `coach.hat_sicht(client, modul,
  stufe)` — prueft `coach_id = auth.uid()`, die Modulspalte und
  `expires_at`. Wer eine weitere Tabelle oeffnet, ruft sie.
- **`full` -> Zeilen:** 22 `*_coach_read`-SELECT-Policies auf den
  Nutzerdaten der sechs Module (nutrition 3, training 3 — Kindtabellen
  ueber die Elterntabelle wie bei den Owner-Policies aus 106 —,
  recovery 3, goals 6, supplements 3, medical 4). Nur SELECT: **der
  Schreibweg des Coaches bleibt `pending_actions`** (ein
  Durchsetzungspunkt, F-06 4.3).
- **`summary` -> definiertes Aggregat, kein Zeilenzugriff:** sechs
  SECURITY-DEFINER-Funktionen (`summary_nutrition` … `summary_medical`)
  mit eigener Freigabepruefung; ohne Freigabe kommt
  `{"freigegeben": false}`. Die T4-Wahl steht dokumentiert im
  152-Kopf — konservativ: Tagesschnitte statt Mahlzeiten, Einheiten-
  und Satzzahlen statt Uebungen, Score statt Schlaf/HRV, **Medical nur
  Befundzahl und Datum, nie Werte** (Art. 9).
- **`none` -> nichts**, auch kein Aggregat.
- Dazu `coach.klienten()` (DEFINER): Beziehungen des angemeldeten
  Coaches mit E-Mail und Anzeigename — `auth.users` ist fuer
  `authenticated` unerreichbar und `profiles` traegt keinen Namen.

`[cmd]` **Gemessen, nicht geglaubt:**
`_validierung/coach-lesepfad-pruefen.sql` (wiederholbar, parametrisiert,
laeuft in einer Transaktion und rollt zurueck) — **bestanden auf der
Wegwerf-DB und live**, neun Punkte:

| Richtung | Ergebnis (live, `coach@lumeos.app`) |
|---|---|
| nutrition `full` | 725 Mahlzeiten von `dev@lumeos.app` lesbar |
| training `full` | 101 Saetze ueber den doppelten Join |
| recovery `summary` | **0 Zeilen**, Aggregat `score_schnitt_7d: 79.9` |
| medical `none` | **0 Zeilen und Aggregat verweigert** |
| Teil-Athlet (`max.seed`, nur summary) | keine Zeilen, Training-Aggregat kommt |
| Eingeladene ohne Rechte (`sarah.seed`) | nichts, auch kein Aggregat |
| Arbeitsobjekte | Coach sieht seine Check-ins und Beziehungen |
| **Dritter** (`max.seed` als Abfragender) | fremde Zeilen 0, Aggregat verweigert, **nur die eigene Beziehung** |
| **Eigentuemer** | 725 Mahlzeiten und 3 Check-ins unveraendert sichtbar |

`[cmd]` **Und die Wirkung ueber die laufende App:** Autonomy-Formular
`recovery_level 2 → 3` gespeichert → `autonomy_change_log` **3 → 4
Zeilen** (der „Setzen und neu laden"-Nachweis aus ssot/139, jetzt
gefuehrt). Check-in-Review abgesendet → `reviewed` **1 → 2**.
Bilder: `backup/f07/nachweis-*.png`.

---

## Welcher Tab was zeigt

**Acht Tabs lesen echt** (Session-Client, `.schema('coach')`, RLS
greift; Fehler werden gezeigt, nie verschluckt):

| Tab | Quelle | Bemerkung |
|---|---|---|
| Overview | Zaehlstaende + Arbeitsliste aus Check-ins/Nachrichten/Alerts | klickbare Arbeit statt Kennzahlenfriedhof (Vorgaenger-Muster F-06 4.4); **kein Attention-Score** — Sortierung nach Zustand und Datum (T7) |
| Athletes | `coach.klienten()` + `client_permissions` | je Athlet die sieben Sichtstufen als Pills; Weg in die Akte |
| Alerts | `coach.alerts` | Sachverhalt + `metric`-Zahlen, Knoepfe gelesen/erledigt — ohne Schweregrad |
| Autonomy | `client_autonomy` + Historie | **Schreibformular des Coaches** (die Achse, die ihm gehoert, ssot/139); Trigger-Historie mit Feld-Diff darunter |
| Consent | `client_permissions` + Rechte- und Beziehungshistorie | fuer den Coach strikt lesend — die Policy nimmt Schreiben nur vom Klienten |
| Check-ins (`workflows`) | `checkins` + `checkin_templates` | Queue nach Zustand; Ein-Bildschirm-Review: Antworten, Prefill, **deterministische Befunde** (`lib/analyse.ts`, 4 Tests gruen — Saetze mit Zahl und Schwelle, keine Urteile), Feedback/Notiz getrennt; Anlegen-Formular |
| Onboarding | `relationships` | Stand der Anbahnung; **kein Einladungs-UI** — T3 offen |
| Messages | `coach.messages` | Faden je Athlet, Senden; `read_at` setzt nur die Empfaengerseite |

Dazu die **Klientenakte `/athlet/[id]`** — das Schaufenster des
Lesepfads: je Modul genau das, was die Stufe hergibt (none: „nicht
freigegeben" gesagt · summary: das Aggregat · full: Aggregat plus
juengste Zeilen aus `daily_summary`, `workout_sessions`,
`body_measurements`, `user_goals`, `scores`, `intake_logs`,
`lab_reports`), plus **Vorschlag-Formular** (legt eine
`pending_action` an — 10-Minuten-Verfall, wartet auf den Klienten)
und die Vorschlags-/Aktionsliste. `[cmd]` Bild
`backup/f07/athlet-1440-hell.png`: Ernaehrung/Training/Ziele full,
Recovery/Supplements summary, Medical gesperrt, Buddy als T5 benannt.

`[cmd]` **68 Bildschirmfotos** unter `backup/f07/` — 16 Tabs + Akte,
hell und dunkel, 1440 und 375 px, per Skript
(`backup/f07-schuesse.mjs`, headless nach `tools/schuss.mjs`-Muster):
**0 Attrappenmarken, 0 Konsolenfehler** ueber alle 68. Dazu drei
Nachweisbilder (`nachweis-autonomie-historie`, `nachweis-review-
abgeschlossen`, `nachweis-absage-nicht-coach`).

---

## Wo die Anwendung laeuft

`[cmd]` **`http://127.0.0.1:3220`** — `apps/coach`, Next 14, Vorbild
`apps/admin`: eigener Port (web 3200, admin 3210, **coach 3220**),
`LUMEOS_DIST_DIR`-Trennung (Gate baut `.next-gate`, der Dev-Server
behaelt `.next`), Middleware prueft nur die Anmeldung, kein SignUp.
Stil: v2-Bausteine aus `@lumeos/ui` (`Card`, `Pill`, `Empty`, `KPI`)
plus eigene `cp-`-Klassen; die Tokens sind eine dokumentierte Kopie
aus `apps/web` (Folgepunkt: in ein Paket ziehen).

**Anmeldung:** `coach@lumeos.app` / `LumeosCoach2026` (echtes Konto,
angelegt von `coach-portal-fuellen.sql`; Tom kann das Passwort
jederzeit aendern). `[cmd]` Die Sitzung ist getrennt gemessen: der
Browser setzt **`sb-127-coach-auth-token`** (`kontext.cookies()`),
disjunkt zu web und admin. `dev@lumeos.app` (fuehrt keine
Coach-Beziehung) bekommt die **Absage** „Kein Coach-Zugang" statt des
Portals — Einlassregel konservativ bis T2.

**Start** (die `.env`-Datei ist durch `protect-paths.ps1` gesperrt —
richtig so; bis Tom `apps/coach/.env.local` nach dem
`apps/admin`-Muster anlegt, kommen die drei Variablen beim Start mit):

```
cd apps/coach
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-Key wie web/admin> \
NEXT_PUBLIC_AUTH_COOKIE_SCOPE=coach \
pnpm dev
```

### Zwei Befunde in @supabase/ssr 0.1.0 — gemessen, umgangen, gemeldet

1. `[cmd]` **`createBrowserClient` mit `cookieOptions`, aber ohne
   `cookies`, stuerzt ab:** die Destrukturierung `({ cookies, ... } =
   options)` ueberschreibt den Default mit `undefined`; beim ersten
   Speichern der Session wirft `typeof cookies.get` — AUTH 200, danach
   PAGEERROR aus `@supabase/ssr/dist/index.mjs:137`. **Genau so ruft
   `packages/shared/src/supabase/client.ts` die Bibliothek auf.**
   `apps/web` ist nicht betroffen (kein Scope → `options` ist
   `undefined` → Default greift). **`apps/admin` nutzt denselben Pfad
   und waere zu pruefen** — nicht angefasst, nur gemeldet.
2. `[cmd]` **`cookieOptions.name` wird nur im ServerClient zum
   storageKey** (`dist:230-233`); der BrowserClient schrieb deshalb
   zunaechst `sb-127-auth-token` — den **web**-Namen.

Beide Umgehungen stehen in `apps/coach/src/lib/browser-client.ts`:
explizite `cookies`-Implementierung plus `auth.storageKey =
cookieOptions.name`. `packages/shared` blieb unveraendert (web und
admin haengen daran, G-13 laeuft dort).

### Nachtrag (2026-08-20, abends): „Kein Coach-Zugang" nach Seed-Auffrischung

`[cmd]` Tom stand nach der Anmeldung vor der Absage. Ursache gemessen:
Nach dem F-07-Einspielen lief die Standard-Seed-Auffrischung —
`coach.seed` hatte wieder 3 Beziehungen, **`coach@lumeos.app` stand auf
0.** Zwei Wege: (1) Der Aufraeumteil von `eigenes-konto-fuellen.sql`
raeumte pauschal ALLE Coach-Zeilen des Dev-Kontos ab, auch die des
Portal-Coaches — **mein Fehler in der ersten Fassung**, die
„Reihenfolge beachten"-Doku war zu schwach. (2) Ein Seed-Neulauf legt
`max.seed`/`sarah.seed` neu an; deren Beziehungen sterben per
FK-Kaskade — unvermeidbar.

**Fix:** Der Aufraeumteil ist jetzt auf den Seed-Coach begrenzt
(`AND coach_id = coach.seed`) — die `coach@lumeos.app -> dev`-Beziehung
ueberlebt jede Auffrischung, **die Absage kann so nicht wiederkehren**
(schlimmstenfalls zeigt das Portal nach einem Neulauf 1 statt 3
Athleten, bis `coach-portal-fuellen.sql` erneut laeuft — Folgepunkt im
TODO). `[cmd]` Live neu eingespielt, Kontrollzaehlung 3/2/2/1/1/3/3/3,
Kopflos-Anmeldung als `coach@lumeos.app` zeigt das Portal wieder.

### Werkzeugbefunde am Rand

- `[cmd]` **`kette-ausfuehren.ts` scheitert unter Git-Bash am `tar`**
  (MSYS-tar liest `D:\…` als Hostnamen: „Cannot connect to D:").
  Umgangen mit `PATH=/c/Windows/System32:$PATH` (bsdtar). Folgepunkt:
  `--force-local` bzw. absoluter tar-Pfad im Runner.
- `[cmd]` **`testdaten-einspielen.ts` ignoriert unbekannte Flags:**
  `--database lumeos_f07` wurde still verworfen, die Ziel-DB kommt aus
  `PGDATABASE` — der Lauf ging gegen die **Live**-Datenbank und brach
  am (dort noch fehlenden) `coach.alerts` ab. **Folgenlos**, weil
  alles in einer Transaktion mit `ON_ERROR_STOP` laeuft — Rollback
  gemessen (`tom.seed`: 725 Mahlzeiten unversehrt). Folgepunkt:
  unbekannte Argumente ablehnen.

---

## Was Leerzustand blieb und warum

Acht Tabs, jeder mit der Ursache in der Kachel (Muster G-65 — keine
Attrappe, keine erfundene Zahl):

| Tab | Warum leer |
|---|---|
| Analytics | keine Metriken-Tabelle; Coach-Kennzahlen waeren Personennoten — **T7** |
| Rules | keine Regel-Tabellen; Uebernahmemuster ist die `ruleSchema`-Whitelist ohne Medical (F-06 4.4) — eigener Bauauftrag |
| Patterns | Prognosen ohne Datenmodell; die SPEC_11-Zahlen dazu waren erfunden |
| Interventions | **E8** (Konfrontation, Identitaetsaussagen) liegt bei Tom |
| Plans | keine Plan-Tabellen; Vertragsmuster „Zuweisung als Angebot" beschrieben |
| Programs | keine Programm-Tabellen; Auto-Delivery ist **E4** |
| Revenue | Geld gehoert zum Marketplace (**T8**), der auf die Rechtsklaerung wartet |
| Team & Audit | keine Team-Rollen; die Rechte-Historien stehen im Consent-Tab |

Dazu im Kern weiter offen (angezeigt, nicht versteckt): **der
Ausfuehrer** — ein bestaetigter Vorschlag aendert nur seinen Status,
niemand wendet `payload` auf das Zielmodul an (ssot/139 unveraendert);
`action_log` wird gelesen, geschrieben erst durch den Ausfuehrer.

---

## Welche der neun Entscheidungen offen sind

Alle neun — getroffen wurde keine; wo der Bau eine Regel brauchte,
steht die konservative Variante und ist als solche markiert:

| # | Stand nach F-07 |
|---|---|
| **T1** Konto | Gebaut mit **einem** Konto, zwei Sitzungen (Cookie-Scope) — die Empfehlung aus F-06; funktioniert gemessen. Entscheidung weiter bei Tom |
| **T2** Einlass | Konservativ: Coach ist, wer eine Beziehung fuehrt; sonst Absage. Eine `app_metadata`-Rolle nach `is_admin()`-Muster bleibt die sauberere Dauerloesung |
| **T3** Beziehung | Tabelle kann beide Richtungen (`invited_by`), Ende inklusive Kaskadenfrage (E3/E10) offen — **kein Einladungs-UI gebaut** |
| **T4** summary | Konservative Aggregate je Modul gewaehlt und im 152-Kopf dokumentiert; Medical zeigt nur Existenz und Datum. **Tom prueft die Definitionen** |
| **T5** siebtes Modul | `buddy` bleibt datenleer und wird in der Akte so benannt; `body_metrics` weiter ohne Spalte |
| **T6** Kadenz | frei je Vorlage (`weekly/biweekly/monthly`), keine Kopplung an die Autonomiestufe |
| **T7** Personenbewertung | Nichts gebaut: keine Scores, keine Ampeln, Alerts ohne Schweregrad, Sortierung nach Zustand/Datum |
| **T8** Revenue/Team | beide leer, Begruendung in der Kachel |
| **T9/E9** PED | nicht beruehrt; der Prep-Workflow der Vorlage (Peak-Week) wurde nicht uebernommen |

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| Kette End-zu-End gruen | `kette-ausfuehren.ts --database lumeos_f07` Exit 0 (80 Schritte, inkl. 151-154 mit `klienten()`) |
| Schema vollstaendig | `schema-vollstaendigkeit-pruefen.ts` „SCHEMA VOLLSTAENDIG", fremde Tabellen 47/47; Pruefung um `coach.hat_sicht(`-Bedingungen erweitert (Policies ohne woertliches `auth.uid()` sind nicht mehr automatisch „zeigt jedem alles") |
| Testdaten | Einspielen gruen inkl. F-07-Block; `testdaten-pruefen.ts` „OK: C-82 Testdaten stimmen." |
| Lesepfad beide Richtungen | `coach-lesepfad-pruefen.sql`: 9 OK-Punkte + BESTANDEN, Wegwerf **und** live |
| Historie +1 ueber die App | `autonomy_change_log` 3 → 4 nach Formular-Speichern (`backup/f07-wirkung.mjs`) |
| Review wirkt | `checkins.status reviewed` 1 → 2 ueber das Formular |
| Dritter sieht nichts | Lesepfad-Pruefung Abschnitt „Dritter"; Absage-Bild fuer Nicht-Coach |
| Sitzung getrennt | Browser-Cookie `sb-127-coach-auth-token`, gemessen ueber `kontext.cookies()` |
| 68 Bilder, 0 Attrappen, 0 Konsolenfehler | `backup/f07-schuesse-ergebnis.json` |
| Typen und Tests | `pnpm --filter @lumeos/coach typecheck` gruen; `analyse.test.ts` 4/4 |
| `pnpm gate` | **Rot — aber nicht durch diesen Auftrag:** `@lumeos/web:build` bricht mit `Property 'prs' is missing in type 'TrainingKachel'` ab; `[cmd]` `git status` zeigt uneingecheckte G-13-Dateien (`dashboard-echt.tsx`, `lib/dashboard/`) — der Fehler gehoert der laufenden Web-Baustelle. **Alle vier Vorpruefungen (encoding, gruppenlabel, schemafreigabe, i18n) gruen; `turbo run typecheck test build --filter=!@lumeos/web`: 8/8 Tasks gruen**, darunter `@lumeos/coach` typecheck, test 4/4 und Produktionsbuild |

## Was nicht angefasst wurde

- **`apps/web` unveraendert** (G-13 laeuft dort) — auch die dortigen
  Coach-Kacheln nicht; sie zeigen ab jetzt von selbst die echten
  Vorschlaege und Check-ins von `coach@lumeos.app`.
- **`packages/shared` und `packages/ui` unveraendert** — der
  ssr-Befund ist gemeldet, nicht dort gefixt.
- **Kein Buddy, kein Marketplace, keine `.env`-Datei** (Hook-gesperrt).
- **Kein Ausfuehrer** — bewusst: er braucht die Autonomy-Wirkungsregeln
  und gehoert als eigener, kleiner Auftrag geschnitten.
