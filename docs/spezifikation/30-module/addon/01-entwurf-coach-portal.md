---
status:     entwurf
version:    0.1
stand:      2026-08-20
ankerhash:  180cd21
quellen:    docs/spezifikation/10-plattform/design-system/theme-v1/ (8 Coach-Vorlagedateien) ·
            docs/specs/HumanCoach/ (12 Dateien) ·
            docs/spezifikation/30-module/addon/00-entwurf-buddy-coach-marketplace.md (F-03) ·
            docs/spezifikation/recherche-coach-portale.md (F-04) ·
            docs/ssot/139-coach-rechte.md (G-90) · docs/ssot/102-coach-mockup.md ·
            supabase/_pipeline/15_coach/150_coach_permissions_autonomy.sql ·
            supabase/config.toml · referenz/lumeos-2026/
abhaengig:  20-apps/coach, 30-module/addon/humancoach, 10-plattform/datenzugriff
---

# Entwurf F-06 — Das Coach-Portal als eigene Anwendung

**Auftrag:** F-06 (2026-08-20). Nichts gebaut, nichts committet — gemessen,
abgeglichen, entworfen. Entscheidungen sind **benannt und vorgelegt**, nicht
getroffen. Gearbeitet wurde ausschliesslich in `docs/`.

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

**Zur Marker-Disziplin:** Die Auswertung lief über sechs Leseagenten (drei
für die Mockups, je einer für Specs, Vorgängerrepo und Ist-Stand). **Jede
tragende Aussage wurde danach selbst nachgemessen** und trägt `[cmd]` oder
`[read]`. Detailbefunde nur aus dem Agentenlauf tragen `[annahme]` mit
Fundstelle. Ein Agentenfehler wurde dabei gefunden und korrigiert: Die
Behauptung, der Analytics-Tab habe keine Vorlage, war falsch — `[cmd]`
`CoachPortalAnalytics` existiert (`module-coach-extras.jsx:162`, exportiert
`:750`, verdrahtet `module-coach.jsx:944`).

---

## 1. Was die acht Mockup-Dateien zeigen

### 1.1 Die zwei Sichten sind in den Dateien sauber getrennt

`[cmd]` Der Rahmen `module-coach.jsx` trägt beide Seiten: `CoachModule`
(Athletensicht, `const side = "athlete"` fest verdrahtet, `:137`) und
**`CoachPortalStandalone`** (`:900–964`) als eigene, parallele
Root-Komponente — laut Dateikommentar eine eigenständige Oberfläche auf
`coach.lumeos.app`. Einen erreichbaren `side === "coach"`-Zweig gibt es
nicht mehr; der Portal-Else-Zweig im Athletenrahmen ist toter Code.

### 1.2 Die Tabelle

| Datei | KB | Sicht | Inhalt |
|---|---:|---|---|
| `module-coach.jsx` | 60 | **beide** | Athletenrahmen (10 Tabs: Overview, Coaches, Permissions, Proposals, Autonomy, Check-ins, Messages, Notes, Invites, Onboarding) **und** `CoachPortalStandalone` mit **16 Portal-Tabs** (`[cmd]` `:923–940`), davon 5 lokal gebaut (Overview, Athletes-Fallback, Plans, Messages, Revenue) plus 7 Modale. Mock-Daten: `COACHES` (4 Trainer mit Typ, Gebühr, Kadenz, `sharedModules`), `PORTAL_ATHLETES` (14 Athleten: `plan`, `compliance`, `alerts`, `lastSession`, `tags`), `COACH_PLANS` |
| `module-coach-athlete.jsx` | 31 | **nur Athlet** | `[annahme]` (Agentenlauf, Kernpunkte per ssot/102 gedeckt) Die vier V2-Tabs der Athletensicht: Permissions-Matrix (7 Module × Coaches, 3 Stufen, Consent-Log, Ablaufdatum), Proposals (pending → Accept/Decline, Diff-Tabelle), Autonomy aus Klientensicht (5er-Leiter, 4 Assessment-Scores, Historie), Check-ins (Templates „Assigned by Coach", Historie mit `reply`, Ausfüllen) — **nicht** die Klientenakte des Coaches |
| `module-coach-extras.jsx` | 48 | **nur Portal** | `[annahme]` Fünf Portal-Tabs: **Analytics** (Retention, Satisfaction, Goal-Completion, Response-Time, Revenue-KPIs), **Rules** (aktive Regeln mit False-Positive-Rate, Marketplace, visueller Builder WHEN/ONLY IF/ACTIONS, Fire-History), **Smart alerts** (Severity, Confidence, FP-Risk, Vorhersage), **Autonomy** (Athleten je Stufe, Promote-Knopf), **Team & Audit** (Rollen Head/Senior/Coach, Audit-Log). Dazu `MultiDimAdherence` (5 Gruppen × 4–7 Submetriken) |
| `module-coach-gaps.jsx` | 34 | **Portal (10/11)** | `[annahme]` Keine zweite Tab-Hälfte, sondern die **Modal- und Detailebene**: 3 Tab-Rümpfe (Patterns, Interventions, Consent) + 7 Modale (Athletenakte „Enhanced" mit Autonomy-Assessment, Alert-Detail, Coach-Settings mit Quiet Hours/Eskalation, Regel-Editor, Team-Invite/-Detail) + Priorisierungsformel `smartPriorityScore` + Event-Launcher. **Null eigene Mock-Konstanten** — alles Props, `window.*` oder Inline-Literale |
| `module-coach-portal-v2.jsx` | 23 | **nur Portal** | `[annahme]` Fünf Nachreichungen („step-4 gaps", Kopfzeile `:1–3`): Athletentabelle V2 (mit Autonomie-Spalte und Attention-Score), `ClientDashboardCard` (Compliance 7d, Recovery-Kette, Schlaf, Gewicht, PR, **Bloodwork-Zeile**, Alerts, nächster Check-in), Regel-Templates (10 System-Templates), Alert-Bündelung, Audit-Log V2 mit CSV-Export |
| `module-coach-portal-workflows.jsx` | 21 | **nur Portal** | Vier geführte Review-Workflows (`PORTAL_WF_DEFS`): Contest Prep (6 Schritte, inkl. Peak-Week-Protokoll), Nutrition (5), Strength-Block (5), **Standard-Check-in (4 Schritte, „5–8 min", `[cmd]` `:54–68`)** + Klienten-Onboarding (8 Schritte) + Einladungsverwaltung |
| `module-coach-programs.jsx` | 12 | **nur Portal** | `[annahme]` Programm-Bibliothek mit Blockstruktur, **Auto-Delivery** (4 Modi, Wochen-Freischaltung, Auto-Message-Template), laufende Zuweisung als 12-Wochen-Raster, Delivery-Log. Banner verweist auf das Vorschlagsmodell („Zuweisung bleibt ein Proposal") |
| `module-coach-meta.jsx` | 12 | **überwiegend Athlet** | `[annahme]` Beziehungs-Metadaten (Assignment primary/secondary, Stil, Rolle, Zertifikate), Klienten-**Rating** des Coaches (5 Sterne, „nur Aggregate sichtbar"), Coach-Onboarding-Wizard (5 Schritte), `BuddyCoachOverrides` (läuft im Buddy-Modul, `module-buddy.jsx:132`) |

### 1.3 Die zwei Prüffragen des Auftrags

**„`-gaps` ist die zweite Portal-Hälfte" (ssot/102)?** Die Quote stimmt,
die Charakterisierung nicht ganz: `[annahme]` 10 von 11 Einheiten gehören
zum Portal, aber die Datei liefert nur 3 der 16 Tabs — sie ist die
**Detail- und Modalebene**, nicht eine zweite Tab-Hälfte. Die 16 Tabs
verteilen sich auf **sechs** Dateien.

**`-portal-v2` gegen `-portal-workflows` — Fassungen oder Teile?**
**Zwei Teile.** `[annahme]` (Agentenlauf mit sieben Belegen, Kernpunkt
selbst geprüft): kein gemeinsamer Tab, kein gemeinsamer `window.*`-Name,
keine gemeinsame Konstante, disjunkte Spec-Referenzen (§7/§8 gegen §3).
Das „V2" bezieht sich auf `PortalAthletesV2`, das den `PortalAthletes`-
Fallback **der Hauptdatei** ablöst (`[cmd]` `module-coach.jsx:943`) —
nicht auf die Workflows-Datei. Arbeitsteilung: **v2 = Zustandsansichten,
workflows = Handlungsabläufe.**

### 1.4 Der offene Bestand ist gezählt

`[cmd]` `tools/vollstaendigkeit.mjs:350–392` führt heute **29 Einträge**
unter `MODULE.coach.bekanntOffen` (ssot/102 nannte 20; die Liste ist
seither gewachsen) — 28 davon gehören zum Portalzweig, einer ist die
abgelöste `AthletePermissions`-V1. Das ist der Posten-Katalog dieses
Auftrags.

### 1.5 Was den Mockups fehlt

`[annahme]` (zwei Agenten unabhängig, gleicher Befund): **Für den
Check-in-Review existiert kein funktionaler Screen** — keine Queue über
alle Athleten, keine Ansicht der eingereichten Werte, kein
Antwort-Formular. Der Workflow existiert nur als Schrittbeschreibung
(`PORTAL_WF_DEFS.standard`), und `CHECKIN_HISTORY` modelliert die
Antwortwerte nicht. Abschnitt 5 füllt diese Lücke.

---

## 2. Wo Mockup und Spec sich widersprechen

Die Specs sind KI-erzeugt; prüfend gelesen. Der Agentenlauf zählt **32
neue Befunde** über die aus F-03 bekannten hinaus (vollständig im
Agentenbericht; hier stehen die, die Bau-Entscheidungen berühren).

### 2.1 Drei Architekturen für dasselbe Portal

| | SPEC_10 | SPEC_11 | Mockup |
|---|---|---|---|
| Navigationsmodell | 7 Next.js-Routen | Single-Page mit Role-Toggle | Eigenständige Root-Komponente, 16 Tabs |
| Portal-Umfang | 7 Bereiche | „12 Tabs" (Überschrift), 13 im Text | `[cmd]` **16** (`module-coach.jsx:923–940`) |
| Athletensicht | 8 Tabs in der Klientenakte | 6 Tabs | 10 Tabs (`[cmd]` ssot/102) |

`[annahme]` SPEC_11 unterschlägt genau die Tabs, die das Vorschlagsmodell
tragen (athletenseitig Proposals und Check-ins; portalseitig Workflows,
Onboarding, Programs). `[read]` Die Repo-Entscheidung steht ohnehin fest:
eigene App (`docs/spezifikation/00-INDEX.md:70`, `[cmd]` gelesen), F-03
E6 empfiehlt dasselbe — SPEC_11s Role-Toggle wird nicht übernommen.

### 2.2 Vokabulare, die vor dem Bau festgenagelt werden müssen

| Achse | Befund | Fundstellen |
|---|---|---|
| **Sichtstufen** | Schema/SPEC_01/06/10: 3 (`none/summary/full`) · SPEC_11: **4** (`full/shared/summary/off`) · Mockup-V1-Matrix: 4 + Buddy-Spalte mit fünftem Satz (`aggregate`) | `[annahme]` SPEC_11:82; `module-coach.jsx:384–385`. `[cmd]` Gebaut sind 3 (`150_…sql:67–75`) — die 3 gelten |
| **Autonomie-Namen** | Vier Quellen, zwei Namenssätze (L2 „Developing" gegen „Beginner"), **Kadenzen dreifach verschieden** (L4: bi_weekly / weekly / monthly je nach Quelle) | `[annahme]` SPEC_08:107–158 · SPEC_11:224–231 · `module-coach-extras.jsx:6–10` · `module-coach-athlete.jsx:113–117` |
| **Siebtes Modul** | Schema: `buddy` · Mockup V2: `body_metrics` · Mockup V1: „Extended supplements" · SPEC_10/11 verlieren `body_metrics` ganz | `[cmd]` `150_…sql:52` gegen G-90-Befund (ssot/139); Entscheidung T5 |
| **`intervention_threshold`** | Drei disjunkte Wertebereiche für denselben Feldnamen | `[annahme]` SPEC_02:213 gegen SPEC_06:91 gegen `module-coach-extras.jsx:6–10` |
| **Coach-Rollen** | 4 Rollen (SPEC_06) gegen 3 Rollen × 13 Capabilities (SPEC_11/Mockup) | `[annahme]` SPEC_06:47–48 gegen SPEC_11:294 |
| **Gebühren** | SPEC_11 typisiert `fee` als Zahl und verliert die Periode; das Medical-Honorar der Vorlage ist **jährlich** (€680/Jahr), die Summe €417/Monat stimmt nur mit Umrechnung. Wer nach SPEC_11 baut, rechnet €1.040 | `[annahme]` SPEC_11:55,65 gegen `module-coach.jsx:62,266–271` |

### 2.3 Spec-Befunde, die ein Nachbau nicht abschreiben darf

| Befund | Fundstelle |
|---|---|
| `[annahme]` `coach_clients.status` doppelt belegt: CHECK erlaubt `active/paused/ended`, API liefert `attention`, Onboarding schreibt `pending` — **jeder Write verletzt den CHECK** | SPEC_06:79–80 gegen SPEC_07:42, SPEC_08:217 |
| `[annahme]` `risk_level` wird geschrieben, gefiltert und ausgeliefert — **die Spalte existiert nicht**; die Dashboard-Sortierung hängt daran | SPEC_04:128, SPEC_07:33/42/101 gegen SPEC_06:74–101 |
| `[annahme]` RLS-Policy vergleicht `auth.uid()` mit `coach_profiles.id` statt `user_id` — wäre immer false, kein Coach sähe je einen eigenen Alert | SPEC_06:189–190 |
| `[annahme]` `coach_messages` (der Chat) **ohne RLS** bei `GRANT SELECT TO authenticated` — jeder angemeldete Nutzer läse jeden Coach-Klient-Chat; `coach_notes` „privat", aber vom Klienten lesbar | SPEC_06:330–343, 351; SPEC_02:90 |
| `[annahme]` Seed-SQL mit Syntaxfehler — **alle 10 Regel-Templates schlagen fehl**, die Verifikation würde nie grün | SPEC_08:95 |
| `[annahme]` Check-in-Kadenz bricht: Cron feuert wöchentlich für Level 1–3, Level 1 verlangt `daily`; Overdue-Schwelle vierfach verschieden (48 h / >48 h / 3 Tage / `days_since > 3`) | SPEC_08:113 gegen INDEX.md:73; §4d des Agentenberichts |
| `[annahme]` **Der Coach hat keinen einzigen Endpunkt, um Check-in-Antworten zu lesen** — SPEC_07 definiert nur die Klientenseite; Templates und Instanzen haben zudem keine Tabelle | SPEC_07:404–417 gegen SPEC_03:80, SPEC_10:126 |
| `[annahme]` Dashboard-Cache als Materialized View (5-Min-Cron) umginge RLS und hielte widerrufene Freigaben bis zu 5 Minuten sichtbar — gegen das eigene „Permission-First"-Prinzip | INDEX.md:75 gegen SPEC_01:20 |
| `[annahme]` `satisfaction_rating`, `effectiveness_score`, `confidence` werden angezeigt und nie erhoben — kein Erhebungspfad, kein UI | SPEC_06:95–96, 214–215; SPEC_07:88 |
| `[annahme]` Workflow-Zeiten unplausibel: „15–45 Min/Woche gesamt" gegen „30–60 Min/Woche **pro** Prep-Klient" bei `max_clients 50` | SPEC_05:53–54, 72–73 |

**Lesart für den Bau:** `[read]` Die Specs taugen als Anforderungs- und
Screen-Katalog (SPEC_10-Routenschnitt, Check-in-Prefill-Idee,
Autonomy-Historie), **nicht als Schema- oder API-Vorlage**. Das deckt
sich mit F-03 („Schema neu schreiben, nicht übersetzen").

---

## 3. Was das Schema trägt und was fehlt

### 3.1 Was existiert — die sechs Tabellen, selbst gemessen

`[cmd]` `supabase/_pipeline/15_coach/150_coach_permissions_autonomy.sql`
(C-119, einziger coach-DDL-Schritt der Pipeline): `client_permissions`
(je Modul `*_visibility` 3-stufig + `*_auto_apply` boolesch, `expires_at`,
`client_note`) · `client_autonomy` (je Modul Level 1–5, `safety_level`
1–3, `coach_note`) · `permission_change_log` und `autonomy_change_log`
(append-only, Trigger-gespeist, alte/neue Zeile als JSONB) ·
`pending_actions` (Vorschau, Payload, 10-Minuten-Verfall,
Bestätigungs-CHECK) · `action_log` (`undo_data`, `undone_at`). 19
Policies, 7 Trigger, RLS auf allen sechs; die Selbstprüfung des Schritts
bricht bei Abweichung ab.

`[cmd]` Die Schreibrichtungen stehen in den Policies: Permissions
schreibt **nur der Klient** (`:288–293`), Autonomy **nur der Coach**
(`:301–306`), `pending_actions` legt **nur der Coach** an (`:328–329`).
Die Logs sind per Policy-Auslassung append-only (kein UPDATE/DELETE).

### 3.2 Was die Kacheln brauchen — das Mapping

Datengrundlage: `[cmd]` `supabase/_pipeline/daten/schema-sollstand.json`
plus Pipeline-SQL. Vorhandene Modulschemata: nutrition (28 Tabellen),
medical (11), goals (6), supplements (6), training (4 im Register **+ 4
nur im SQL** — `equipment`, `exercises`, `exercise_muscles`,
`muscle_groups` aus `100_training_schema.sql` fehlen im Sollstand;
Registerlücke, gehört Codex gemeldet), recovery (3), coach (6),
public.profiles.

| Portal-Tab (16) | Braucht | Existiert? |
|---|---|---|
| Overview | Beziehungsliste, Alerts, Check-in-Zähler, Modul-Aggregate | **nein** — nichts davon; nur Modul-Rohdaten liegen vor |
| Athletes | **Beziehungstabelle**, Aggregate (Compliance, letzte Einheit), `client_autonomy` | Beziehung **fehlt**; Autonomy `[cmd]` ja |
| Analytics | Coach-Metriken-Persistenz | **nein**; dazu Personennoten-Frage (T7) |
| Smart alerts | Alert-Tabelle | **nein** |
| Rules | Regeln, Templates, Fire-Log | **nein** (Vorgänger-`ruleSchema`-Muster liegt bereit, F-03 3.3) |
| Autonomy | `coach.client_autonomy` + Historie | `[cmd]` **ja, vollständig** |
| Patterns | Prognose-/Musterdaten | **nein** — auch keine Spec-Modellierung; warten |
| Interventions | Interventions-Log | **nein**; Grenzfrage E8; warten |
| Consent | `client_permissions` + `permission_change_log` je Athlet | `[cmd]` **ja** — die SELECT-Policy lässt den Coach seine Zeilen lesen |
| Plans | Plan-/Template-Tabelle | **nein** |
| Workflows | Check-in-Instanzen mit Status | **nein** (Abschnitt 5) |
| Client onboarding | Invite-Tokens, Beziehung | **nein** |
| Programs | Programme, Zuweisungen, Delivery-Log | **nein**; E4 (Auto-Delivery) offen |
| Messages | Nachrichten-Tabelle | **nein** |
| Revenue | Geld-Datenmodell | **nein — gehört zum Marketplace** (F-03 4; T8) |
| Team & Audit | Team/Rollen; Audit | Team **nein**; als Audit existieren `[cmd]` nur die zwei Rechte-Logs, kein Zugriffs-Audit |

**Bilanz:** Von 16 Tabs sind heute **zwei** datenseitig gedeckt (Autonomy,
Consent). Die sechs Tabellen tragen die **Governance** (Rechte, Autonomie,
Bestätigung, Historie) — die **Arbeitsobjekte** des Portals (Beziehung,
Check-ins, Programme, Nachrichten, Alerts, Regeln) haben keine Tabelle.
`[cmd]` Selbst die Coach-Klient-Beziehung existiert nur implizit als
Zeile in `client_permissions`/`client_autonomy` — ohne Status, ohne
Anbahnung, ohne Ende. `[read]` F-03 nannte den fehlenden Beendigungspfad
die grösste inhaltliche Lücke der Spec; er fehlt im neuen Schema genauso.

### 3.3 Das siebte Modul ist datenleer

`[cmd]` `buddy` steht in allen CHECK-Constraints der sechs Tabellen —
ein `buddy`-Schema existiert nicht (kein `CREATE TABLE`, F-03 Korrektur 1
unverändert gültig). Eine `buddy`-Freigabe ist heute ein Schalter ohne
Gegenstück; das Mockup führt stattdessen `body_metrics` (ssot/139).
Entscheidung T5.

### 3.4 Es gibt keine Coach-Rolle

`[cmd]` Grep über Pipeline und Apps: `is_coach` null Treffer; `coach_id`
nur als Spalte der sechs Tabellen. `public.profiles` hat kein Rollenfeld.
Die einzige Rolle des Systems ist `admin` — als `app_metadata`-Claim
geprüft von `public.is_admin()` (`061_rollen_admin.sql:72–87`), mit
dokumentierter Begründung gegen ein Tabellenfeld (selbst setzbar bzw.
Join in jeder Policy). „Wer ist Coach" ist heute nur implizit
beantwortbar („steht als `coach_id` in mindestens einer Zeile").
Entscheidung T2.

---

## 4. Wie die Rechte durchgreifen

### 4.1 Die zwei Achsen stehen — in der Datenbank

`[cmd]` Sicht und Änderungsrecht setzt der Klient
(`client_permissions`, 7 Module × `none/summary/full` + `auto_apply`);
den Reifegrad setzt der Coach (`client_autonomy`). Beide Historien
schreibt ein Trigger, nicht die Anwendung. Das ist die Umkehr, an der
das Vorgängerrepo gescheitert ist (F-04 7.3), und sie ist gebaut und in
G-90 angebunden (ssot/139).

### 4.2 Der Lesepfad fehlt vollständig — das ist die eigentliche Schemaarbeit

`[cmd]` Grep über `supabase/_pipeline/`: **kein Modulschema referenziert
`client_permissions`.** Jede Modul-Policy kennt heute nur den Eigentümer
(`auth.uid() = user_id`-Muster). Folge: Auch mit erteilter
`full`-Freigabe liest ein Coach **null Zeilen** aus nutrition, training,
recovery, goals, supplements oder medical. Das Portal kann heute genau
zwei Dinge zeigen: die Rechte selbst und die Autonomie.

Der Entwurf des Lesepfads, je Sichtstufe:

- **`full`** — zusätzliche SELECT-Policies auf den Modultabellen:
  Zugriff, wenn eine `client_permissions`-Zeile
  (`coach_id = auth.uid()`, `client_id = Eigentümer`,
  `<modul>_visibility = 'full'`, `expires_at`-Prüfung) existiert.
  Durchsetzung **in der Datenbank**, nicht in der Anwendung — die Lehre
  aus dem Vorgänger (4.4).
- **`summary`** — kein Zeilenzugriff, sondern **definierte Aggregate**
  (z. B. Tagesbilanz statt Mahlzeiten, Wochen-Score statt Check-in-Text)
  über `SECURITY INVOKER`-Views oder RPCs, die dieselbe Freigabeprüfung
  tragen. **Welches Aggregat je Modul `summary` bedeutet, ist nirgends
  definiert** — ohne diese Definition ist die mittlere Stufe nicht
  baubar. Entscheidung T4.
- **`none`** — nichts, und auch nichts Abgeleitetes: Aggregate und
  Alerts aus einem entzogenen Modul sind die offene Kaskadenfrage E3
  (F-03), verschärft um `[annahme]` N-23 der Spec-Prüfung: selbst der
  modellierte Teil-Widerruf liesse dort abgeleitete Daten stehen.

`[read]` Kein Dashboard-Cache, der RLS umgeht (Spec-Befund N-15): ein
Widerruf muss beim nächsten Request wirken, nicht nach fünf Minuten.

### 4.3 Der Schreibpfad hat einen Kopf und keinen Körper

`[cmd]` `pending_actions` ist das Bestätigungsmuster aus C-95: Vorschau,
10-Minuten-Verfall, Bestätigungs-CHECK. Was fehlt (ssot/139, unverändert):
**der Ausführer** — eine bestätigte Aktion ändert nur ihren Status;
niemand wendet `payload` auf das Zielmodul an. `action_log` mit
`undo_data` wird nie geschrieben. Der Verfall wird nur im Anwendungscode
geprüft, nicht per CHECK/Trigger. Und `[cmd]` `rechte-schreiben.ts`
deckt nur die Klientenseite — für `client_autonomy` und
`pending_actions` existiert kein Anwendungscode; Einträge entstehen erst
mit diesem Portal.

**Entwurfsregel — ein Durchsetzungspunkt:** Jede schreibende
Coach-Wirkung läuft durch `pending_actions`, auch bei
`auto_apply = true` — dann bestätigt das System sofort statt des
Nutzers, aber Vorschau, Log und Undo entstehen auf demselben Weg. Warum
das nicht verhandelbar ist, zeigt der Vorgänger: `[cmd]` **keine einzige
Route in `coach-actions.ts` liest `coach_client_permissions`**
(Grep über `referenz/…/human-coach/routes/`: Treffer nur in
`permissions.ts`, `alerting.ts`, `coach-ai.ts`, `coaches.ts`) —
`adjust-macros` schrieb nach blosser Zugehörigkeitsprüfung direkt
`UPDATE nutrition_targets` (`[annahme]` `coach-actions.ts:192–200`),
vorbei an zwei funktionierenden Bestätigungsmechanismen desselben Repos.
Das angezeigte Rechtemodell war reine Anzeige.

### 4.4 Drei Übernahme-Muster aus dem Vorgänger — geprüft

1. `[annahme]` (Agentenlauf, Fundstellen benannt) **„Loggen immer, Pläne
   ändern nie ohne Freigabe":** `ALWAYS_ALLOWED_ACTIONS` gegen
   Modul-Mapping plus Mindeststufe (`executionEngine.ts:108–132`) — als
   deklarative Struktur übernehmen, mit Vollständigkeitszwang (dort fiel
   `log_injection` durch alle Listen).
2. `[annahme]` **Blockade erzeugt Arbeitsaufgabe:** `escalateToCoach()`
   verwandelt jede verweigerte Aktion in einen Portal-Alert
   („Buddy: {Klient} möchte {Aktion}") — die Sperre ist kein Dead End,
   sondern der Anfang eines Gesprächs.
3. `[annahme]` **Plan als Angebot:** `coach_plan_assignments` mit
   `pending → accepted → active | rejected`, Startdatum wählt der
   Klient, `imported_at`/`imported_refs` belegen die Übernahme
   (`019_coach_plan_templates.sql:44–64`) — das Vertragsmodell für den
   Programs-Tab.

Dazu die F-03-Regel für Buddy: die Ausleitung an den Coach **erbt die
Coach-Sichtmatrix**, sie hat keine eigene.

### 4.5 Anmeldung, Rolle, eigene Sitzung

`[cmd]` Das Vorbild `apps/admin` ist vollständig übertragbar: eigener
Port (`next dev -p 3210`; web 3200 → Portal-Muster **3220**), eigenes
`distDir` über `LUMEOS_DIST_DIR`, Middleware, die nur die Anmeldung
prüft und die Rollenabsage der Seite überlässt, Login ohne SignUp. Die
Sitzungstrennung kostet **keine Codezeile**: `[cmd]`
`NEXT_PUBLIC_AUTH_COOKIE_SCOPE=coach` in `apps/coach/.env.local` ergibt
über `packages/shared/src/supabase/cookie-name.ts:58–74` den Namen
`sb-127-coach-auth-token` — disjunkt zu web und admin, lokal wie in
Produktion. `[cmd]` `apps/coach` selbst enthält heute genau
`src/.gitkeep`; der externe Link `coach.lumeos.app` steht seit G-02 in
der Shell (`nav.ts:86`) und im App-Register (`00-INDEX.md:70`).

**Die Kontofrage** (Auftrag, Frage 4): `[read]` Die Daten sprechen für
**ein Konto, zwei Sitzungen** — dieselbe `auth.users`-Identität, denn
alle 19 Policies prüfen `auth.uid()` gegen `coach_id`/`client_id`
derselben Nutzertabelle; ein zweites Konto je Coach würde die
Rechtezeilen an eine zweite Identität binden und jede Auskunft
verdoppeln. `[cmd]` `not_self_ck` verbietet nur das Selbst-Coaching
je Paar, nicht die Doppelrolle (Coach hier, Klient dort). Was fehlt, ist
die Einlasskontrolle des Portals: implizit („hat Klienten") oder als
`app_metadata`-Rolle nach dem `is_admin()`-Muster. **Empfehlung:
`app_metadata.role = 'coach'`, vergeben ausserhalb der Anwendung wie
beim Admin — aber das ist Toms Entscheidung (T1/T2).**

### 4.6 Der Blocker davor

`[cmd]` `supabase/config.toml:21` führt acht Schemata —
**`coach` fehlt** (C-148, bei Codex; vierter Fall nach goals, recovery,
training). Bis dahin liefert jede Abfrage `Invalid schema: coach`
(ssot/139, gemessen). **Nach der Freigabe** lesen die G-90-Kacheln
sofort echt (kein Schalter im Code), und die zwei ausstehenden Nachweise
aus ssot/139 werden führbar (Historienzeile nach Änderung;
Zeilenschutz mit zwei Konten). **Das Portal selbst bleibt danach
trotzdem leer**, bis Beziehungstabelle und Lesepfad (4.2) existieren —
die Freigabe ist notwendig, nicht hinreichend.

---

## 5. Was der Check-in-Review bräuchte

`[read]` Die Marktrecherche beziffert den Hebel: systematisiert 2–3
Minuten je Check-in, über Tabs und Screenshots 10–15 — bei 50 Klienten
der Unterschied zwischen 90 Minuten und 6 Stunden pro Woche (F-04 5.3).
Das ist die Stelle, an der ein Portal etwas ändert.

### 5.1 Was der Vorgänger dazu wusste — und woran es scheiterte

Der Vorgänger hatte den vollständigen Kreislauf (`[annahme]` Agentenlauf,
Kernbefund selbst nachgemessen): Statusmaschine
`pending → client_submitted → coach_reviewed → completed`
(`012_create_coach_tables.sql:97`), **automatischer Daten-Snapshot** bei
Anlage (`auto_data`: Gewicht, Recovery-Score, Ernährungs- und
Supplement-Compliance aus vier Modul-APIs), nach Dringlichkeit sortierte
Queue, **regelbasierte Auto-Analyse** (`generateCheckinAnalysis`,
`checkins.ts:284–400`: ~15 Schwellenregeln über Gewichtsdelta,
Compliance und vier subjektive Skalen; jedes rote Flag mit deutscher
Handlungsempfehlung und Alert-Fan-out) und die Zwei-Felder-Trennung
`coach_notes` (intern) / `coach_feedback` (an den Klienten).

**Und sie war produktiv stumm kaputt:** `[cmd]` Der Insert schreibt
`overall_status` und `summary` (`checkins.ts:374,384,388` — selbst
gegrept), **beide Spalten existieren in keiner der 73 Migrationen**
(Grep `overall_status` über `referenz/…/migrations/`: null Treffer). Der
Fehler wurde vom `catch { /* non-blocking */ }` des Submit-Pfads
verschluckt — die Auto-Analyse lief nie, und niemand sah es. `[annahme]`
Dazu: ein geteiltes State-Paar für alle Review-Formulare der Liste
(Tippen in einem Check-in füllte alle), `action_items` nie benutzt,
`coach_feedback` nie wieder gelesen.

### 5.2 Was Vorlage und Spec beitragen

`[cmd]` Der Mockup-Workflow „Standard check-in"
(`module-coach-portal-workflows.jsx:54–68`, „5–8 min") gibt die
Review-Dramaturgie vor: **1. Einreichung lesen** (Gewicht, Adhärenz,
Energie, offene Fragen) → **2. Dashboard scannen** (Compliance, Recovery,
Alerts seit letzter Woche) → **3. Feedback in Dreierstruktur** (lief gut
/ ändern / beobachten) → **4. „Adjust or hold"** mit Begründung — „Most
weeks the answer is hold." Dazu drei Spezialvarianten (Prep, Nutrition,
Strength) und die Regel „Missed check-in > 3 Tage → Alert". `[annahme]`
Die Spec ergänzt die Prefill-Idee (Cron, `weight_7d_avg`,
Adhärenz-Prozente) — liefert aber weder Tabellen noch einen
Coach-Endpunkt zum Lesen der Antworten (Abschnitt 2.3) und widerspricht
sich bei Kadenz und Fälligkeit.

### 5.3 Was zu bauen wäre — sechs Bausteine

1. **Zwei Tabellen im `coach`-Schema:** `checkin_templates`
   (Feldliste, Kadenz, je Beziehung) und `checkins` (Instanz:
   Statusmaschine wie oben, `auto_data`, `client_data`,
   `coach_feedback`, `coach_notes`, `due_at`). Analyse-Ergebnis als
   Spalten der Instanz oder eigene Tabelle — aber **mit Schema-Test**,
   damit ein Spaltenfehler den Gate-Lauf bricht statt im catch zu
   verschwinden (5.1 ist die Begründung).
2. **Prefill aus dem Bestand:** Die Datenlage ist der Unterschied zum
   Vorgänger — `[cmd]` Gewicht (`goals.body_measurements`),
   Recovery-Score (`recovery.scores`), Tagesbilanz (nutrition),
   Sitzungen/Sätze (training), Einnahmen (supplements) liegen im
   selben Postgres; der Snapshot ist ein Query je Modul statt vier
   HTTP-Aufrufen, die still ausfallen. **Jeder Prefill respektiert die
   Sichtmatrix** — ein Modul auf `none` erscheint als „nicht
   freigegeben", nie als leeres „—".
3. **Deterministische Vorauswertung:** die Schwellenregeln des
   Vorgängers als pure, getestete Funktion (rot/gelb/grün je Flag,
   Empfehlung je Flag, Gesamtstatus) — kein LLM; `[read]` genau die
   Stelle, an der der Markt gerade Add-ons verkauft (F-04: My PT Hub
   „Check-Ins AI") und LumeOS mit Cross-Modul-Daten strukturell mehr
   sieht (Blutwerte, Supplements, Recovery in einem Datenmodell —
   kein Wettbewerber führt sie, F-04 5.4).
4. **Die Queue als Ein-Bildschirm-Review:** Liste nach Dringlichkeit
   (eingereicht → offen → reviewt), je Eintrag Einreichung, Prefill,
   Flags und Antwort-Composer **auf einem Bildschirm** — die 2–3
   Minuten entstehen aus dem Wegfall des Tab-Wechsels, nicht aus
   Automatik allein. Formular-State je Instanz (5.1, UI-Bug).
5. **Die Antwort ist ein Vorschlag:** Feedback-Text geht als Nachricht;
   eine Anpassung („adjust") erzeugt einen `pending_actions`-Eintrag
   und läuft durch den Bestätigungsweg aus 4.3 — bei `auto_apply`
   sofort bestätigt, aber geloggt und rückholbar. „Hold" ist der
   Default und kostet einen Klick.
6. **Ausbleiben erzeugt Arbeit:** überfälliger Check-in → Eintrag in
   der Aufmerksamkeitsliste (Muster 4.4.2). Die Kadenz-Kopplung an die
   Autonomiestufe ist Produktentscheidung (T6), nicht Baugesetz.

---

## 6. In welcher Reihenfolge, und was Tom entscheiden muss

### 6.1 Die Reihenfolge

```
0. C-148: coach in config.toml            (Codex; eine Zeile — danach liest G-90 echt,
                                           beide ausstehenden Nachweise aus ssot/139 führbar)
1. Entscheidungen T1–T6                   (unten; T1/T2/T4 blockieren die Schemaarbeit)
2. Schema-Schritt „Beziehung + Lesepfad"  (Codex: coach.relationships mit Anbahnung,
                                           Annahme und ENDE von Anfang an; Coach-Lese-
                                           Policies je Modul für 'full'; summary-Views
                                           nach T4; Kaskadenregel nach E3/E10)
3. App-Gerüst apps/coach                  (Vorbild apps/admin: Port 3220, Cookie-Scope
                                           'coach', Middleware, Login ohne SignUp,
                                           Gate-Build mit LUMEOS_DIST_DIR)
4. Lesende Kacheln                        (Athletenliste, Klientenakte je Sichtmatrix,
                                           Consent- und Autonomy-Tab aus den sechs
                                           bestehenden Tabellen)
5. Check-in-Kern                          (Abschnitt 5 — der gemessene Zeithebel)
6. Pending-Ausführer + Vorschläge         (schliesst die G-90-Schleife: der Klient sieht
                                           erstmals echte Proposals; Verfall als CHECK,
                                           action_log wird erstmals geschrieben)
7. Regeln/Alerts, dann Programme          (ruleSchema-Whitelist ohne Medical übernehmen;
                                           Zuweisung als Angebot nach 019-Muster)
8. Nachrichten                            (eigene Tabelle, RLS-Muster wie pending_actions)
```

**Warten kann** (blockiert nichts, teils ohne Datenmodell, teils vor
einer Grenzfrage): Patterns-Prognosen · Interventions-Engine (E8) ·
Analytics-Personennoten (T7) · Team & Rollen · Revenue (gehört zum
Marketplace, T8) · Peak-Week-Automatik (E9) · Alert-Bündelung und Quiet
Hours (Komfort nach den Alerts).

Parallelität: Schritt 3 und 4 hängen nur an 0–2, nicht aneinander;
der Check-in-Kern (5) braucht 2 und 4. Buddy (F-03 Stufen 3–4) läuft
unabhängig; die Portal-Reihenfolge hier ändert F-03 6.2 nicht, sie
verfeinert dessen Schritt 5.

### 6.2 Schon entschieden — nicht wieder aufmachen

`[cmd]` Drei F-03-Fragen hat C-119/G-90 in Toms Richtung beantwortet:
**E1** drei Sichtstufen (CHECK gebaut), **E2** `auto_apply` je Modul
statt globalem Auto-Accept (Spalten gebaut), **E6** eigene App
(App-Register, externer Link, dieser Auftrag).

### 6.3 Was Tom entscheiden muss

| # | Entscheidung | Stand der Dinge |
|---|---|---|
| **T1** | **Konto:** ein Konto, zwei Sitzungen (Empfehlung, 4.5) — oder eigenes Coach-Konto | `[cmd]` Policies binden an `auth.uid()` einer Identität; Cookie-Trennung kostet nichts |
| **T2** | **Einlass:** `app_metadata.role='coach'` nach `is_admin()`-Muster (Empfehlung) — oder implizit über bestehende Beziehung | `[cmd]` Heute existiert keine Coach-Rolle (3.4) |
| **T3** | **Beziehung:** Wer lädt wen ein (die Vorlage kennt beide Richtungen), wie wird angenommen, wie beendet — und was geschieht bei Ende/Widerruf mit Abgeleitetem (= E3/E10 aus F-03, weiter offen) | Kein Beendigungspfad in Spec, Vorgänger oder Schema |
| **T4** | **`summary` je Modul definieren:** welches Aggregat die mittlere Stufe konkret zeigt | Ohne Definition ist der Lesepfad nicht baubar (4.2) |
| **T5** | **Siebtes Modul:** `buddy` (Schema, datenleer) gegen `body_metrics` (Mockup, ohne Spalte) — eines, beide, oder Körpermasse unter `goals` | `[cmd]` 3.3; ssot/139 hat es gemeldet |
| **T6** | **Check-in-Kadenz:** an die Autonomiestufe gekoppelt (Vorlage/Spec) oder frei je Klient | Spec widerspricht sich selbst dabei (2.3) |
| **T7** | **Bewertung von Menschen im Portal:** Attention-Score-Formel, vier Assessment-Scores, Charakter-Tags, Coach-Performance-Noten — was davon existieren darf und was der Bewertete sieht | `[read]` Auftragsgrenze „keine Bewertung von Menschen"; dieselbe Frage wie E7 (BSS) |
| **T8** | **Revenue/Team im Portal-V1:** Empfehlung: beides raus — Geld gehört zum Marketplace (F-03 4, Rechtsklärung davor), Team ist Skalierungs-, kein Startthema | `[annahme]` Auch die Spec verortet Billing im Marketplace (SPEC_01:104) |
| **T9** | **= E9 (PED-Komplex), um eine Fundstelle reicher:** das Peak-Week-Protokoll mit Diuretika-Hinweis im Prep-Workflow (`module-coach-portal-workflows.jsx:182–205`) gehört in dieselbe eine Entscheidung wie „Enhanced Mode", `pin_day` und „TRT consultation" | F-03 E9, unverändert offen |
| — | **Weiter offen aus F-03:** E4 (Auto-Delivery als `direkt`-Fall oder eine bestätigte Zuweisung — der Programs-Tab hängt daran) · E5 (`expires_at`: Spalte existiert `[cmd]`, ein Setz-Pfad fehlt) | |

---

## Nachweise (Auswahl der selbst geprüften)

| Behauptung | Beleg |
|---|---|
| 16 Portal-Tabs, Dispatch, Fallback-Muster | `module-coach.jsx:923–958` gelesen |
| Standard-Check-in-Workflow, 4 Schritte, „5–8 min" | `module-coach-portal-workflows.jsx:54–68` gelesen |
| Sechs Tabellen, 19 Policies, 7 Trigger, Schreibrichtungen | `150_coach_permissions_autonomy.sql` vollständig gelesen (Policies `:286–343`, Selbstprüfung `:352–406`) |
| `coach` fehlt in der PostgREST-Freigabe | `supabase/config.toml:21` gelesen |
| Kein Modul-Lesepfad für Coaches | Grep `client_permissions` über `supabase/_pipeline/` → Treffer nur in `15_coach/` und Sollstand |
| `coach-actions.ts` prüft nie Permissions | Grep `coach_client_permissions` über `referenz/…/human-coach/routes/` → Treffer nur in `permissions.ts`, `alerting.ts`, `coach-ai.ts`, `coaches.ts` |
| Auto-Analyse stumm kaputt | Grep `overall_status`: `checkins.ts:374,384,388` schreibt, **null Treffer in allen 73 Migrationen** |
| `CoachPortalAnalytics` existiert (Agentenfehler korrigiert) | `module-coach-extras.jsx:162,750`, `module-coach.jsx:944` |
| 29 offene Portal-Posten | `tools/vollstaendigkeit.mjs:350–392` gelesen und gezählt |
| Cookie-Ableitung `sb-127-<scope>-auth-token` | `packages/shared/src/supabase/cookie-name.ts:58–74` gelesen |
| Admin-Vorbild: Port 3210, Gate-Build | `apps/admin/package.json:6–8` gelesen |
| `apps/coach` = `src/.gitkeep`, App-Registereintrag | Verzeichnis gelistet; `docs/spezifikation/00-INDEX.md:70` |
| Modulschemata für das Mapping | `schema-sollstand.json` (Agenten-Auszug, Stichprobe `coach`-Block `:1421–1593` gedeckt durch eigenes SQL-Lesen). **Korrektur F-07 (2026-08-20):** Die hier ursprünglich `[annahme]` gemeldete Training-Registerlücke **gibt es nicht** — die vier Katalogtabellen stehen im Sollstand unter `fremde_schemata` (`[cmd]` selbst gelesen); der Agent hatte nur `tabellen[]` gezählt |
