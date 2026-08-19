---
status:     entwurf
version:    0.1
stand:      2026-08-19
ankerhash:  dbf457e
quellen:    docs/specs/BuddyandAICoach/ · docs/specs/HumanCoach/ · docs/specs/Marketplace/ ·
            docs/specs/Core/AI_USAGE_WALLET_ADR.md · docs/specs/Core/SUBSCRIPTION_GATES_ADR.md ·
            docs/specs/Nutrition/04_adrs/ADR_COACH_PERMISSIONS_V1.md ·
            docs/spezifikation/10-plattform/design-system/theme-v1/ (19 Vorlagedateien) ·
            referenz/lumeos-2026/ · docs/ssot/102-coach-mockup.md · docs/ssot/106-ai-coach-mockup.md
abhaengig:  10-plattform/datenzugriff, 30-module/addon/humancoach, 30-module/addon/aicoach,
            20-apps/coach, 20-apps/marketplace
---

# Entwurf F-03 — Buddy, Coach und Marketplace: die zweite Hälfte

**Auftrag:** F-03 (2026-08-19). Nichts gebaut, nichts committet — gemessen,
abgeglichen, entworfen. Entscheidungen sind **benannt und vorgelegt**, nicht
getroffen.

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

**Zur Marker-Disziplin dieses Entwurfs:** Die Spec-Auswertung lief über vier
Leseagenten. **Jede tragende Aussage wurde danach selbst nachgelesen** und
trägt `[read]` oder `[cmd]`. Detailbefunde, die nur aus dem Agentenlauf
stammen, tragen `[annahme]` **mit Fundstelle** — sie sind prüfbar, aber nicht
einzeln nachgeprüft.

---

## 0. Der Bestand, gemessen — und zwei Korrekturen am Auftrag

`[cmd]` Vermessen am 2026-08-19 (Skript über `docs/specs/`,
`theme-v1/`, `referenz/`):

| | Spec | Mockup |
|---|---|---|
| **Buddy & AI Coach** | 12 Dateien, **136 KB** | 4 Dateien, **110 KB** (`engines` 52,5 · Rahmen 25,1 · `knowledge` 18,6 · `voice` 13,4) |
| **Human Coach** | 12 Dateien, **97 KB** | 8 Dateien, **242 KB** (`coach` 59,8 · `extras` 48,0 · `gaps` 34,5 · `athlete` 31,5 · `portal-v2` 22,8 · `portal-workflows` 20,6 · `programs` 12,4 · `meta` 12,2) |
| **Marketplace** | 12 Dateien, **89 KB** | 7 Dateien, **203 KB** (`seller` 44,1 · `products` 39,3 · `wallet` 34,1 · `scoring` 24,3 · home/creator/subs je ~20) |

**Korrektur 1:** `[cmd]` **Alle drei Module haben ein
`SPEC_06_DATABASE_SCHEMA.md`** (16,5 / 12,1 / 13,9 KB) — der Satz „keiner der
drei hat ein Schema" stimmt nur für das **neue Repo**: kein `CREATE TABLE`
mit `coach`, `buddy`, `market` oder `wallet` in `supabase/_pipeline/`
(Grep 2026-08-19, null Treffer).

**Korrektur 2:** `[cmd]` Die Mockup-Summen sind 110/242/203 KB (Auftrag:
109/241/203). `CoachRuleBuilder.tsx` liegt im Vorgängerrepo **viermal** —
die größte Fassung 29,7 KB
(`apps/coach/app/(portal)/rules/components/`), nicht 30.

`[cmd]` Im Vorgängerrepo daneben: `seed-marketplace.ts` 19,6 KB ·
`seed-coach-rules-production.ts` 12,4 KB ·
`seed-buddy-automations-production.ts` 10,6 KB · `SettingsView.tsx` 16,5 KB
(enthält `CoachPermissionsSection`, per Grep bestätigt).

---

## 1. Das gemeinsame Rechtemodell

### 1.1 Was vorliegt — vier Quellen, vier Modelle

**Quelle A — das Vorgängerrepo (gebaut und benutzt).**
`[read]` (docs/ssot/102, Abschnitt 4, dort `[cmd]`; Kernpunkte selbst
gegengegrept): `coach_client_permissions` führt **sieben Lese-Flags** (die
sieben Module der Vorlage, `read_medical` mit Kommentar `SENSITIVE`), drei
Schreib-, zwei Edit-Flags und ein Einwilligungspaar
`medical_consent_given/date`. `[cmd]` Die UI dazu
(`SettingsView.tsx:284-297`) zeigt **12 binäre Schalter je Coach** — zwei als
`sensitive` markiert: `read_medical` und **`edit_auto_accept`**
(„Änderungen ohne Bestätigung — Sensibel!", `SettingsView.tsx:296`).
`[cmd]` **Keine Widerrufshistorie** (Grep über alle Migrationen nach
`consent_log|permission_history|permission_audit|consent_history` → leer,
belegt in ssot/102). `[annahme]` Die vier API-Endpunkte sind mit einer
Konstante `DEV_COACH_ID` ausgehebelt, `GET /my-coaches` nimmt den Nutzer
sogar aus einem Query-Parameter (`permissions.ts:26`) — **nicht übernehmen
ohne Umbau** (deckt sich mit ssot/102, dort `[cmd]`).

**Quelle B — das ADR aus Nutrition (April 2026, „Final").**
`[read]` `ADR_COACH_PERMISSIONS_V1.md`: Freigabe **je Modul und
Subfunktion** (neun Nutrition-Schlüssel, MealCam-Bilder separat), Default
**keine Freigabe**, Coach darf **nur lesen und vorschlagen** — neun
Suggestion-Typen mit Status `pending/accepted/rejected/expired`,
**TTL 7 Tage**, Audit-Pflicht, Widerruf jederzeit.

**Quelle C — die HumanCoach-Spec.**
`[read]` `SPEC_06_DATABASE_SCHEMA.md:113-125`: **drei Stufen**
`full|summary|none` je Modul (CHECK), **sieben Module** inkl.
`body_metrics`, `granted_by`, `expires_at`, `UNIQUE (coach_client_id,
module)`. **Aber:** `[read]` Der Trigger, der erzwingen soll, dass Medical
nur der Klient freigibt, **prüft nichts** — er loggt und gibt `RETURN NEW`
zurück (`SPEC_06:128-141`); die angekündigte API-Prüfung existiert ebenfalls
nicht (`[annahme]` `SPEC_04_FEATURES.md:10-25` prüft `granted_by` nie).
`[annahme]` Ein **Consent-Log ist zweimal zugesichert** (`INDEX.md:33`,
`SPEC_01:23`) **und nirgends modelliert** — für Autonomie gibt es dagegen
eine vollständige Historientabelle (`client_autonomy_history`,
`SPEC_06:279-292`).
`[read]` Und **Auto-Delivery hebt das Vorschlagsmodell auf**: ein
12-Wochen-Programm wird Woche für Woche automatisch ausgeliefert, „Coach muss
nur reagieren wenn …" (`SPEC_05_COACH_WORKFLOWS.md:106-126`) — der Klient
bestätigt Woche 2–12 nie.

**Quelle D — die Buddy-Spec.**
`[annahme]` `buddy.coach_profiles.module_access` JSONB mit Default
`medical: false` (`SPEC_06:466-469`) — **boolesch**, und **nirgends
durchgesetzt**: weder Engines noch Kontextaufbau prüfen es.
`[annahme]` `SPEC_11` (HumanCoach) stellt in der Permissions-Matrix
**„Buddy" als Spalte neben den menschlichen Coaches** (`SPEC_11:80`) —
die Vorlage denkt beide also bereits in einer Matrix.

### 1.2 Toms Vorgaben, die schon stehen

`[read]` **C-71** (TODO): das Rechtemodell des Vorgängerrepos ist die
Produktentscheidung; **C-95 ersetzt den offenen Teil von C-71**:

> **Tom, 2026-08-18:** „Coach-Autonomie: alles, was der User selber nicht
> beurteilen kann. Das muss neu rein in Permissions pro Modul. Beginnen wir
> einfachheitshalber: Coach darf ändern ohne Bestätigung oder mit
> Bestätigung des Users. Gehen wir tiefer rein später."

Damit sind die zwei Achsen gesetzt: **Sicht** (was darf jemand sehen) und
**Autonomie** (was darf er ändern — mit oder ohne Bestätigung, je Modul).

### 1.3 Der Entwurf: ein Grant-Objekt, zwei Achsen, drei Subjekte

**Ein Modell trägt für Coach und Buddy — auf der Sicht-Achse.** Beide
brauchen dieselbe Antwort auf dieselbe Frage („wer sieht welches Modul in
welcher Tiefe"), die Vorlage zeigt beide in einer Matrix, und getrennte
Modelle würden die Freigabe-UI, den Widerruf und die Auskunft verdoppeln.

```
freigabe (Arbeitsname)
  subjekt_typ      'coach' | 'buddy'          -- später erweiterbar
  subjekt_id       UUID (Coach-Beziehung) | NULL (Buddy hat je Nutzer genau eine)
  modul            die 7 Module (CHECK)
  stufe            'none' | 'summary' | 'full'
  autonomie        'vorschlag' | 'direkt'     -- C-95: mit / ohne Bestätigung, je Modul
  granted_by       UUID  -- MUSS der Nutzer sein, per RLS erzwungen, nicht per Log-Trigger
  expires_at       TIMESTAMPTZ NULL
freigabe_historie  -- append-only: jede Änderung mit alter/neuer Stufe, wer, wann
```

**Wo sich Coach und Buddy unterscheiden müssen — und warum:**

1. **Die Autonomie-Semantik ist verschieden.** Beim Coach heißt Autonomie:
   *ein Dritter* ändert Daten — zweiwertig nach C-95 (`vorschlag`/`direkt`),
   je Modul. Bei Buddy heißt Autonomie: *wie proaktiv handelt die Maschine* —
   die Specs führen dafür eine Skala 1–5 (`[read]` `SPEC_03:24-27`), deren
   Bedeutung zwischen den Spec-Dateien **exakt invertiert** ist (Abschnitt 5).
   Beide in ein Feld zu pressen würde die Invertierungs-Falle ins Schema
   tragen. **Vorschlag: die `autonomie`-Spalte des Grants gilt für beide
   zweiwertig (C-95); Buddys Proaktivitätsstufe ist ein separates Feld im
   Buddy-Profil, keine Freigabe.**
2. **Nur der Coach ist ein DSGVO-Dritter.** Einwilligung, Widerruf,
   Nachweis und Auskunft betreffen die Coach-Zeilen; Buddy ist Teil des
   Produkts. Die Historie schreibt trotzdem beide — sie kostet nichts und
   beantwortet auch bei Buddy die Frage „seit wann sieht er Medical".
3. **Buddy hat einen Ausleitungspfad, der eigene Regeln braucht.**
   `[read]` `GET /api/coach/for-human-coach` (Buddy-`SPEC_07:574-588`)
   liefert `buddy_state`, `bss_summary`, `compliance_7d` und
   `flagged_for_coach` an den menschlichen Coach — **ohne Einwilligungs-
   Check in der Spec**. Regel für den Entwurf: **Buddy darf an einen Coach
   nur weitergeben, was dessen eigene Sicht-Freigabe hergibt** — die
   Weitergabe erbt die Coach-Matrix, sie hat keine eigene.

**Die Widerrufshistorie wird gebraucht — Antwort: ja.** Drei Gründe:
`[read]` Der Vorgänger kann eine Auskunft über erteilte und widerrufene
Freigaben nicht geben (Widerruf = `UPDATE` auf `false`, ssot/102);
`[annahme]` die HumanCoach-Spec sichert das Log zweimal zu und modelliert es
nie; und sobald `direkt` (C-95) existiert, ist bei Streit („diese Änderung
habe ich nie erlaubt") der Zeitraum der Freigabe die einzige belegbare
Antwort. **Append-only-Tabelle, keine Lösch-UI.**

### 1.4 Entscheidungen, die Tom gehören

| # | Frage | Optionen, mit Herkunft |
|---|---|---|
| E1 | **Stufenzahl der Sicht** | 2 (Vorgänger-Flags) · **3 `none/summary/full`** (Vorlage + HumanCoach-Spec; ssot/102 empfiehlt implizit 3) · subfunktional (ADR B — feiner, mehr Pflege) |
| E2 | **`edit_auto_accept`** | entfällt zugunsten `autonomie='direkt'` je Modul (C-95 deckt den Fall ab — ein globaler Auto-Accept-Schalter wie im Vorgänger widerspricht „pro Modul") |
| E3 | **Kaskade beim Widerruf** | Was geschieht mit abgeleiteten Daten (Adherence-Summaries, offene Alerts, Buddy-Aggregationen aus dem entzogenen Modul)? Löschen · einfrieren · behalten mit Vermerk. **Keine Quelle beantwortet das** |
| E4 | **Auto-Delivery** | zulassen als `direkt`-Fall je Modul · oder Wochenfreischaltung gilt als *eine* bestätigte Zuweisung (der Klient bestätigt das Programm, nicht jede Woche) |
| E5 | **Ablaufdatum** | `expires_at` übernehmen (Spec hat es, aber keinen Setz-Pfad — `[annahme]` `SPEC_07:396-416`) oder V1 ohne |

---

## 2. Was Buddy speichert

### 2.1 Speichern · Ableiten · Vergessen — die Antwort in drei Spalten

**Speichert** (`[annahme]` Buddy-`SPEC_06`, 16 `CREATE TABLE` — Zählung
selbst per Grep bestätigt `[cmd]`):

| Gruppe | Tabellen | Inhalt |
|---|---|---|
| Gespräche | `coach_conversations`, `coach_messages` | Volltext, Intent, Sentiment, Modell, Token — **unbefristet, keine Löschregel** |
| Erinnerungen | `CoachMemory` (Entity) | Typ, Wichtigkeit, Evidenz, `auto_decay` — **`[cmd]` hat KEINE Tabelle in SPEC_06** (16 CREATE TABLE, keine davon `coach_memory`) |
| Präferenzen | `user_preferences` | inkl. `food_allergy`/`food_intolerance`, Konfidenz, Quelle |
| Verhalten | `buddy_state.behavioral_signature`, `bss_snapshots` | Muster inkl. **Dropout-Risiko mit Tag und Uhrzeit**; BSS rollierend 90 Tage |
| Entscheidungen | `buddy_events` (append-only), `buddy_decisions`, `buddy_actions`, `intervention_log` | vollständiger Entscheidungs- und Interventionspfad |
| Regeln | `buddy_rules` | System-/User-/Coach-Regeln, Cooldown, Tageslimit |
| Wissen | `knowledge_base` | RAG, pgvector 1536, Evidenzstufen |
| Rhythmus | `coach_journey`, `coach_alerts` | Heartbeat-Checkpoints; Alerts verfallen nach 48 h |
| Profil | `user_coach_profile` **und** `coach_profiles` | **doppelt** — zwei Profiltabellen mit denselben Feldern in anderen Typen, inkl. `health_conditions TEXT[]` im Klartext |

**Leitet ab:** `[annahme]` `SPEC_05_ENGINES` — **elf deterministische
Engines** (Nutrition, Training, Recovery, Biomarker, Supplement,
Körperzusammensetzung, Verhalten, Zirkadianik, Energieverfügbarkeit,
Stresslast, Elektrolyte), ausdrücklich „Engines berechnen. LLM erklärt"
(`SPEC_05:8-14`). Dazu BSS, Verhaltenssignatur, Compliance. ~20
Hilfsfunktionen der Engines sind reine Platzhalter ohne Definition.

**Vergisst: nichts Geregeltes.** Vier verstreute Fragmente
(`auto_decay` als bloßes Feld; ein Memory-Decay-Cron, dessen Funktion
nirgends definiert ist; 48-h-Verfall nur auf Alerts; ein manueller
`DELETE /memory/:id`). **Der Konflikt „append-only-Eventlog ohne
DELETE-Pfad vs. DSGVO-Löschanspruch" wird nirgends adressiert** —
zusammen mit `health_conditions` im Buddy-Schema die größte offene
Datenschutzfrage des Moduls.

`[annahme]` Im **Vorgängerrepo liegen vier parallele, nie vereinheitlichte
Gedächtnismodelle** (Agentenlauf, Fundstellen geprüft per Grep `[cmd]` für
den Kernbefund): `buddy_memories` (`20260316_buddy_memories.sql`) ist ein
Key-Value-Store mit Konfidenz und `UNIQUE(user_id, category, key)` —
**ohne jedes Verfallsfeld** (`[cmd]` Grep nach `expires|ttl|decay` in der
Migration: null Treffer); `coach_memory` hat Score-Zerfall
(`importance × confidence × exp(−decay_rate × days/30)`) plus
`superseded_by`; ein Fakten-System hat `ttl_days`/`expires_at` mit
Hard-Delete nach 30 Tagen; dazu ein Konversationsgedächtnis.
**Konsolidierungsvorschlag: EIN Memory-Modell mit Konfidenz, Zerfall,
`superseded_by` und optionalem Ablauf** — das deckt alle vier Fälle; die
Zerfallsraten (0 = Fakt, langsam = Präferenz, schnell = Stimmung) sind im
Vorgänger bereits kommentiert.

### 2.2 Was Buddy an Daten braucht — und was davon liegt

`[read]` Die Engine-Eingaben (Buddy-`SPEC_05`) gegen den Ist-Stand des
SSOT-Index gehalten:

| Engine braucht | Liegt im neuen Repo | Quelle |
|---|---|---|
| Mahlzeiten, Makros, Ziele | ja — 2.157 Mahlzeiten über 180 Tage, Zielwerte, Tagesbilanz | `[read]` ssot/117, 78, 70 |
| Sätze, Sitzungen, Übungsmeta | ja — 30 Sitzungen, 200 Sätze mit RPE, 1.416 Übungen | `[read]` ssot/118, 115 |
| Schlaf, HRV, Befinden | teilweise — 170 Check-ins, **27 von 36 ohne HRV**; Schlafqualität ja, Schlafzeiten nein | `[read]` ssot/96, 117 |
| Gewicht, KFA, Kalorienhistorie | ja — 180 Messungen, adaptive TDEE `complete` | `[read]` ssot/117 |
| Supplement-Stack | ja — 44 Katalog, Einnahmen | `[read]` ssot/98, 114 |
| Blutwerte + Referenzbereiche | ja — 140 Werte, 560 Bereiche | `[read]` ssot/109, 103 |
| Eventlog, Chronotyp, Mahlzeit-Timing | **nein** — Buddy-eigene Strukturen, existieren nicht | `[cmd]` kein Buddy-Schema in der Pipeline |

**Die Datenvoraussetzung ist gefallen:** `[read]` Der Modulplan nannte C-78
als Blocker für Buddy — ssot/117 meldet C-78 als erledigt (zwei
90-Tage-Fenster, Bilanz geht auf). **Was fehlt, ist ausschließlich Buddys
eigenes Schema.**

### 2.3 C-75 bestätigt — mit einem neuen Befund

`[read]` ssot/106 (`[cmd]` dort): Für 18 der 20 Tabs liegt im Vorgängerrepo
eine Entsprechung — `behavioral_signatures` deckt den Signature-Tab bis zu
den Musternamen, `buddy_decisions` + Override-Migration decken Decisions und
Coach-Overrides, `buddy_knowledge` (pgvector 384) den Knowledge-Tab.
**BSS und Voice sind Neubau** (`stability_score`, `whisper`,
`parseGymCommand`: null Treffer).

**Neuer Befund dazu:** `[read]` Die BSS-Formel ist **zwischen Spec und
Vorlage verschieden** — Spec: `stability × 0.5 + alignment × 0.5`
(`SPEC_09_SCORING.md:97`), Vorlage: `stability × 0.6 + alignment × 0.4`
(`module-buddy-engines.jsx:106`, Gewichte auch an den Karten `:535`).
ssot/106 hat das nicht erfasst, weil dort nur `uploads/` gegen `docs/specs/`
byteverglichen wurde. `[annahme]` Zudem schlägt der zweite Unit-Test der
Spec-Formel nachgerechnet fehl (`SPEC_09:348-360`, erwartet &lt; 70,
ergibt ≈ 73) — **die Formel wurde nie ausgeführt.** Wer BSS baut,
entscheidet zuerst die Gewichte und schreibt den Test neu.

`[annahme]` **Automatisierungen:** Der Vorgänger trennt sauber
`coach_rules` (reaktiv: Bedingung → Entscheidung, die der Nutzer bestätigt)
von `buddy_automations` (proaktiv: `trigger_type schedule|event|condition`,
echte Cron-Syntax, eigenes Ausführungslog `buddy_automation_runs`) —
`058_buddy_automations.sql`. Das ist das brauchbarste Muster im Bestand.
Zwei Warnungen: der Produktions-Seed der Regeln ist im **v1-Freiformformat**
und gegen die v2-Whitelist **nicht evaluierbar**; und der Automations-Seed
schreibt Bedingungen in `action_config` statt `condition_config` — beim
Übernehmen nicht abschreiben, sondern ins v2-Format übersetzen.

### 2.4 Wo Buddy die Grenze berührt — benannt, nicht entschieden

1. **BSS ist eine Bewertung des Menschen, keine Messung.** `[annahme]` Die
   Spec kommuniziert ihn als Charakteraussage („Du wirst stabiler",
   `SPEC_03:252-256`), und `plan_rejection_rate` bewertet Widerspruch
   negativ. **Tom entscheidet, ob und wie ein Verhaltens-Score angezeigt
   wird** — die Regel „keine Bewertung von Menschen" trifft dieses Feature
   frontal.
2. **Interventionsmaschine:** `[annahme]` `selectIntervention` kennt
   `confrontation` gegen den Nutzer und ein „Identity-Phase"-Modell, das ab
   einem (nirgends berechneten) Trust-Score Identitätszuschreibungen
   *erlaubt* (`SPEC_09:227-307`); die zugesagten Limits (max. 5/Woche, 2
   Konfrontationen) sind nirgends persistiert. **Nicht bauen ohne
   Entscheidung.**
3. **Medizinische Aussagen:** die Entkopplung „Supplements nie als Reaktion
   auf Laborwerte" ist als absolute Regel formuliert (`[annahme]`
   `SPEC_01:22`, `SPEC_05:230`) — **und auf Datenflussebene nicht
   umgesetzt**: Biomarker-Flags fließen in denselben LLM-Kontext, der
   Policy-Gate prüft nur `speech_text`, nicht UI-Cards, und zwei zentrale
   Validatoren sind leere Funktionen (`SPEC_04:554-558`). Details in
   Abschnitt 5.
4. **`pin_day_missed` und `cycle_consulting`:** `[read]` Der Regel-Seed
   enthält wörtlich eine Systemregel, die abends prüft, ob am „Pin Day" die
   Injektion erfolgt ist, Level `critical`
   (`SPEC_08_IMPORT_PIPELINE.md:108-114`); `cycle_consulting` ist viermal
   als Elite-Feature gelistet und **nirgends spezifiziert**. Im
   Bodybuilding-Kontext sind das PED-Begleitfunktionen. **Das ist keine
   Übernahmefrage, sondern eine Produkt- und Rechtsfrage für Tom** —
   zusammen mit dem „Enhanced Mode" des Coach-Moduls (Abschnitt 3.4) und
   dem TRT-Angebot im Marketplace-Mockup (Abschnitt 4.4).

---

## 3. Was der Coach-Bereich verlangt

### 3.1 Es sind zwei Produkte unter einem Namen

`[read]` ssot/102 (`[cmd]` dort): Die **Athletensicht** ist als Attrappe
gebaut und gezählt vollständig (60 von 60); der **Trainerarbeitsplatz**
steckt im nie erreichbaren `side === "coach"`-Zweig der Vorlage, in
`module-coach-portal-v2.jsx`, `module-coach-portal-workflows.jsx` — und zu
**zehn Elfteln in `module-coach-gaps.jsx`**: „gap-closers" sind
Nachreichungen zur Hauptdatei, kein Fachthema; die Datei ist die zweite
Hälfte des Portals. 20 Portal-Posten stehen als `bekanntOffen` im
Zählwerkzeug.

`[annahme]` Die Spec bestätigt die Teilung und **widerspricht sich in der
Architektur**: `SPEC_10` will zwei Apps (Portal in `apps/coach`,
Athletensicht in der Haupt-App), `SPEC_11` will **eine** App mit
Role-Toggle auf `coach.lumeos.app` — womit der Athlet für seine Freigaben
die Domain wechseln müsste, was die Spec an anderer Stelle als
Wettbewerbsvorteil („kein Doppel-App-Problem") ausschließt.
`[read]` Die Repo-Entscheidung existiert schon: `docs/spezifikation/00-INDEX.md`
führt `coach` als eigene App (`coach.lumeos.app`, Gerüst), und die Shell
verlinkt das Portal als externen Link (ssot/102). **Empfehlung:
Athletensicht in `apps/web` (steht bereits), Portal in `apps/coach` —
`SPEC_11`s Role-Toggle nicht übernehmen.** Bestätigung durch Tom nötig (E6).

### 3.2 Das Datenmodell: 10 Tabellen, 6 Löcher, 2 Totalausfälle

`[annahme]` (Agentenlauf; Kernpunkte E-Stufen und Trigger selbst gelesen
`[read]`): Die Spec definiert 10 Tabellen im Schema `coach` (Profile,
Beziehung, Permissions, Alerts, Regeln, Regelvorlagen, Autonomie +
Historie, Adherence-Summary, Messages). **Mindestens sechs referenzierte
Tabellen fehlen**: Check-in-Vorlagen und -Instanzen, Alert-Settings,
Performance-Metriken, Programme (trotz Auto-Delivery-API), Invite-Tokens.

Zwei Ausfälle wiegen schwer:

1. **Kein Beendigungspfad.** Felder existieren (`status='ended'`,
   `end_date`), aber kein Flow, kein Endpoint, keine UI — und ungeklärt,
   was bei Beziehungsende mit Freigaben, Notizen, Chats und den persistierten
   Adherence-Daten geschieht. Für ein Modul mit DSGVO-Anspruch die größte
   inhaltliche Lücke.
2. **RLS-Totalausfall in der Spec:** nur 3 von 10 Tabellen haben RLS, bei
   gleichzeitigem `GRANT ... TO authenticated` — Permissions und Chats
   wären für jeden angemeldeten Nutzer schreibbar. Die Datei warnt teils
   selbst davor (`[read]` Warnblock `SPEC_06:3-18`); verbindlich ist
   `10-plattform/konventionen/00-konventionen.md` §12. **Schema neu
   schreiben, nicht übersetzen.**

### 3.3 Was übernommen werden kann

- **Der Rule Builder v2 des Vorgängers.** `[annahme]` `ruleSchema.ts` ist
  als Single Source of Truth gebaut: Metrik-**Whitelist** über fünf Module,
  typisierte Operatoren, AND/OR-Bedingungen, fünf Aktionstypen
  (`inform` bis `escalate_coach`), Prioritäten 1–5; der Builder (29,7 KB)
  bekommt das Schema per API und validiert live.
  `[cmd]` **Die Whitelist enthält keine medizinischen Metriken** (Grep nach
  `medical|biomarker|blood|lab_` in `ruleSchema.ts`: null Treffer) — Regeln
  können konstruktionsbedingt nicht auf Blutwerte zugreifen. **Das ist die
  richtige Grenze; übernehmen.**
- **Die Rechte-Vorlage** aus Abschnitt 1 (Sieben-Module-Deckung von
  Vorlage und Vorgänger, ssot/102).
- **Die Autonomie-Historie** der Spec als Muster für die
  Freigabe-Historie — das einzige vollständige Audit-Modell im Bestand.

### 3.4 Die medizinische Grenze — Befunde zum Vorlegen

`[read]` `SPEC_05_COACH_WORKFLOWS.md:86-101`: **„Enhanced Mode"** verlangt
alle 4–6 Wochen Blutbild-Checks (Hämatokrit &lt; 50 %, ALT/AST, Hormone,
Lipide) — das ist klinisches Sicherheitsmonitoring für PED-Begleitung, ohne
dass der Begriff je definiert, abgegrenzt oder rechtlich eingeordnet wird.
Dazu Peak-Week-Automatik mit Natrium- und Wasser-Management ohne
Sicherheitsgrenzen. `[annahme]` Weitere Stellen: Blutwert-Ampeln und
Organ-„System-Scores" in der Coach-UI; „Coach justiert Plan: +TUDCA,
+Vitamin D3 5000 IU" als Standardablauf; kritische Medical-Alerts, die der
Coach dismissen kann und die **nach 7 Tagen automatisch verfallen**
(`SPEC_06:175`); keinerlei Unterscheidung zwischen approbierten und
nicht-approbierten Coaches — `certifications` ist ungeprüfter Freitext.

**Vorgelegt, nicht entschieden:** ob es einen Medical-Coach-Typ mit
Qualifikationsnachweis gibt, ob „Enhanced Mode" existiert, und wohin ein
kritischer Medical-Alert eskaliert, wenn nicht an einen Personal Trainer.

### 3.5 Bewertung von Menschen — auch hier

`[annahme]` Die Spec speichert vier psychologische Scores je Klient
(Konsistenz, „Wissen" — das in Wahrheit Regelbefolgung misst —,
Selbstkorrektur, Kommunikation), ein `regression_risk` ohne Formel,
freitextliche Charakter-Tags (`'high_maintenance'`), die der Klient nie
sieht, und eine `calcCoachPerformanceScore()`-Personennote für Trainer,
deren Response-Time-Anteil ständige Erreichbarkeit belohnt und den eigenen
Quiet Hours widerspricht. **Dieselbe Regel wie bei BSS: das sind
Produktentscheidungen, keine Übernahmen.**

---

## 4. Was Marketplace ist und was es rechtlich berührt

### 4.1 Was es ist

**Ein eigenes Produkt mit eigener App.** `[read]`
`docs/spezifikation/00-INDEX.md` führt `marketplace` als eigene App
(marketplace.lumeos.app, „kein Verzeichnis"); die Spec nimmt einen eigenen
Dienst (Port 5700) und `apps/marketplace` an. Verkauft werden **digitale
Güter mit Lieferung ins Modul** (Trainingsprogramm → Training-API,
Mealplan → Nutrition-API — kein PDF), dazu Bundles als erklärtes
Alleinstellungsmerkmal; `session` (Coach-Stunden), `equipment` und
`ai_persona` stehen im Enum, haben aber keinen Liefer- bzw.
Fulfillment-Pfad (`[annahme]` `SPEC_04:97-114`).

### 4.2 Das Geldmodell — der am besten durchspezifizierte Teil

`[read]` `SPEC_05_WALLET_ECONOMICS.md:9-33`: **Zwei Salden je Wallet**,
beide in **EUR-Cent**: *Voucher* (Abo-Gutschrift, Top-ups, Boni — „nicht
auszahlbar, verfällt bei Kündigung") und *Revenue* (Verkaufserlöse —
auszahlbar via Stripe Connect). Ausgabenreihenfolge Voucher zuerst.
Transaktionstypen inkl. `ai_usage` (Voucher → nirgendwohin).
`[annahme]` Das Wallet-Mockup deckt dieses Modell vollständig — der
einzige Teil des Moduls, der zwischen Spec und Vorlage konsistent ist.

`[read]` Dazu passt das Core-ADR (`AI_USAGE_WALLET_ADR.md`): Abo gibt
Credits, AI-Nutzung zieht ab, V1 = nur Tracking über `usage_events`;
`SUBSCRIPTION_GATES_ADR.md`: V1 ohne jedes Gate.

`[cmd]` **Der Vorgänger hatte zwei unverbundene Geldwelten:**
`013_marketplace.sql` (5 Tabellen — Creators, Produkte, Käufe, Reviews,
Kategorien; Preise `DECIMAL` in **USD**; keine CHECKs, kein RLS) und
`048_monetization_system.sql` (Wallet mit **Credits**,
`wallet_transactions`, `subscriptions` mit `stripe_subscription_id`,
`coach_clients` mit Monatsgebühr in Credits, `coach_revenue` mit
Plattformgebühr und `paid_out`-Boolean). `[annahme]` Eine echte
Zahlungsabwicklung gab es nie — Stripe existiert nur als Spalte, Payout nur
als Label; und das Transaktionstyp-Vokabular von Frontend und DB-CHECK ist
disjunkt.

### 4.3 Drei ökonomische Befunde, die vor jedem Bau zu klären sind

1. **Die Provision wird doppelt abgezogen.** `[read]`
   `calcCreatorRevenue()` (`SPEC_09:192-210`) zieht erst die Plattform-Fee
   (20 % discovery) ab und wendet dann `revenue_share_pct` (80 %) **auf das
   Netto** an → der Creator erhält real **64 %**, nicht die versprochenen
   80 % (`SPEC_01:41-46`). Eine zweite Funktion derselben Spec
   (`SPEC_04:163-165`) rechnet einfach — zwei Implementierungen, zwei
   Ergebnisse; die Mockups reproduzieren **beide** Varianten.
2. **Das Abo ist wirtschaftlich gratis.** `[read]`
   `calcSubscriptionCredit()` (`SPEC_09:219-228`): `voucher_credited =
   price` (1:1). Der Nutzer zahlt 19,99 € und erhält 19,99 € Kaufkraft;
   LumeOS verdient nur an der Fee beim Ausgeben und am Verfall. Der
   Kommentar „Abo-Geld = weg" behauptet das Gegenteil dessen, was der Code
   tut.
3. **Gebührensatz 15 % vs. 20/10/25 %.** `[annahme]` `SPEC_11` und der
   Seller-Mockup („15 % blended") gegen die Staffel in `SPEC_05`/`SPEC_09` —
   beide Sätze stehen im selben Mockup nebeneinander.

### 4.4 Was rechtlich oder regulatorisch berührt ist — benannt, nicht entschieden

Fachliche Prüfung gehört zu einem Anwalt/Steuerberater; hier die Liste der
Stellen, an denen sie ansetzen muss:

1. **E-Geld / ZAG.** `[read]` Die tragende Rechtsannahme der Spec ist „kein
   E-Geld — Voucher ist Goodwill" (`INDEX.md:29`). Sie wird vom eigenen
   Modell unterlaufen: per Stripe **eingezahltes echtes Geld** landet als
   EUR-denominierter, nicht auszahlbarer Saldo, der bei Kündigung
   **entschädigungslos verfällt**. Ob das ohne E-Geld-/ZAG-Einordnung
   trägt, ist die erste zu klärende Frage.
2. **Verbraucherrecht.** Rückerstattung erfolgt **immer als Voucher, nie
   als Geld** — auch wenn mit echtem Geld bezahlt wurde; Widerrufsrecht bei
   digitalen Inhalten, Gutschein-Verfall und die 14-Tage-Automatik sind
   ungeregelt (`[read]` `SPEC_05:188-207`).
3. **Steuern und Rechnungen.** Es gibt **kein** Steuermodell: keine USt auf
   Fee vs. Produktpreis, keine Rechnungstabelle (die Mockup-Buttons
   „Invoice"/„Download invoices" haben kein Datenmodell `[annahme]`), keine
   Verkäufer-Stammdaten für Steuerzwecke. Dazu Plattform-Meldepflichten
   (DAC7) für Verkäuferumsätze.
4. **Auszahlung / KYC.** Stripe Connect ist angenommen, Onboarding und
   Identitätsprüfung sind als offener Punkt markiert; die
   Payout-Untergrenze wird nur im API-Layer geprüft, nicht in der DB
   (`[annahme]` `SPEC_05:220-221`).
5. **Ranking-Transparenz (P2B-Verordnung).** `[annahme]` Der
   Promoted-Bonus (+50 flach) lässt laut spec-eigenem Test ein Produkt mit
   100 Käufen eines mit 500 Käufen und besserer Bewertung überholen —
   bezahltes Ranking muss gegenüber Verkäufern und Käufern offengelegt
   werden; das Brand-Placement mit CPA hat immerhin „disclosed placement"
   im Mockup.
6. **Bewertung von Menschen.** `[annahme]` `product_reviews` bewertet
   formal Produkte, aber `session`-Produkte sind Coach-Stunden — faktisch
   Personenbewertung mit Sterne-Verteilung auf Personenebene im
   Creator-Mockup, einmaliger Antwort, ohne Lösch-/Beschwerdeweg;
   `creators.avg_product_rating` ist eine Personennote, die nie befüllt
   wird.
7. **Gesundheitsleistungen im Marktplatz.** `[read]` Das Creator-Mockup
   führt „Dr. M. Kessler" mit den Spezialisierungen **„TRT management,
   Bloodwork interpretation, Enhanced protocol safety, Hormone panels"**
   und dem Produkt „TRT protocol consultation"
   (`module-market-creator.jsx:83-97`). Das ist der Verkauf ärztlicher
   bzw. arztnaher Leistungen über die Plattform — Fernbehandlung,
   Heilmittelwerberecht, Approbationsnachweis, Abgrenzung zum
   „Enhanced Mode" des Coach-Moduls und zu Buddys `cycle_consulting`.
   **Diese drei Fundstellen gehören in EINE Entscheidung.**
8. **Preisangaben und Doppelwährung.** Specs 01–10 rechnen EUR, der
   Vorgänger USD/Credits, das ADR Credits — vor dem Bau ist die Währung
   des Wallets endgültig festzulegen (der Zwei-Salden-EUR-Ansatz der
   `SPEC_05` ist der konsistenteste Kandidat).

---

## 5. Wo die Specs nicht stimmen

Die Specs sind KI-erzeugt; der Auftrag verlangt prüfendes Lesen. Hier die
Befunde, **je mit gemessener Zahl bzw. Fundstelle**. (Vollständige Listen
der Agentenläufe umfassen &gt; 80 Einzelbefunde; hier stehen die, die
Bau-Entscheidungen berühren.)

### 5.1 Modulübergreifend

| Befund | Beleg |
|---|---|
| `[cmd]` **`packages/scoring` existiert nicht** — alle drei Module verweisen darauf (`SPEC_09:9` je Modul); ebenso `apps/app`, `src/api/**`; `apps/coach`, `apps/buddy`, `packages/contracts/src` sind leere Gerüste | Repo-Prüfung; deckt sich mit `docs/spezifikation/00-INDEX.md` Regel 1 |
| `[read]` **Fünf konkurrierende Stufen-Vokabulare:** `free/premium/pro` (Vorgänger `tier-service.ts`, ssot/106) · `free/plus/pro/elite` (Vorlage) · `free/pro/coach` (048, `user_token_budget`) · `free/pro/coach_basic/coach_pro` (048, `subscriptions`) · `free/plus/pro/coach` (`SUBSCRIPTION_GATES_ADR`); Buddy-Spec ergänzt `coach_b2b` als fünfte Stufe | 048:32-33, 048:91-92 selbst gelesen; Rest Fundstellen |
| `[annahme]` **`SPEC_11` ist überall der Fremdkörper:** in keinem der drei Module im INDEX gelistet, Monate jünger, beschreibt jeweils eine andere App (andere Tabs, andere Stufen, andere Gebühren) | INDEX-Dateien aller drei Module |
| `[annahme]` Alle drei `SPEC_06` tragen denselben redaktionellen Warnblock (FOR-ALL-Policies ohne WITH CHECK = INSERT-Leck; `::text`-Casts) — verbindlich ist Konventionen §12 | `SPEC_06:3-18` je Modul, HumanCoach-Fassung selbst gelesen `[read]` |

### 5.2 Buddy

| Befund | Beleg |
|---|---|
| `[cmd]` **`CoachMemory` hat keine Tabelle** — Entity, API, UI und Decay-Cron existieren, aber keine der 16 `CREATE TABLE` in `SPEC_06` ist `coach_memory` | Grep `CREATE TABLE` in `SPEC_06` |
| `[read]` **Autonomie-Skala invertiert:** `SPEC_03:25-27` Level 5 = „Buddy entscheidet selbst"; `SPEC_11:196,239` Level 1 = „Buddy entscheidet". Sicherheitsrelevant — die Skala steuert unbestätigte Aktionen | selbst gelesen |
| `[read]` **BSS-Gewichte Spec ≠ Vorlage:** 0,5/0,5 (`SPEC_09:97`) gegen 0,6/0,4 (`module-buddy-engines.jsx:106`) | selbst gelesen |
| `[read]` **`pin_day_missed`** als geseedete Systemregel, Level critical; Feld `supplements_state.pin_day_today` existiert in keinem Schema | `SPEC_08:108-114` selbst gelesen |
| `[annahme]` **Policy-Gate wirkungslos:** prüft nur `speech_text`, während `SPEC_01:19` Claims aktiv in UI-Cards verlagert; `validateNoEnginedNumbers` ist eine leere Funktion; der Orchestrator ruft Gate und Validator gar nicht; „du hast" steht auf der Blockliste und würde Alltagssätze blocken | `SPEC_04:554-558`, `SPEC_09:178-196` |
| `[annahme]` Zwei Profiltabellen mit denselben Feldern in verschiedenen Typen (`autonomy_level` INTEGER vs. TEXT), ohne Vorrangregel | `SPEC_06:36-53` vs. `:446-473` |
| `[annahme]` Vier Tabellen ganz ohne RLS bei schreibendem GRANT, darunter `coach_messages` (Gesprächsinhalte) und `buddy_rules` | `SPEC_06:486` |
| `[annahme]` Modellname „GLM-4.7-Flash" existiert nicht; Kosten- und Rate-Limit-Zahlen widersprechen sich (Free 5/Tag → Plus 60/Min) | `INDEX.md:125-128`, `SPEC_07:612` |

### 5.3 Human Coach

| Befund | Beleg |
|---|---|
| `[read]` **Einwilligungs-„Trigger" ist ein Placebo** — `RAISE LOG` + `RETURN NEW`, keine Prüfung von `granted_by` | `SPEC_06:128-141` selbst gelesen |
| `[read]` **Auto-Delivery widerspricht dem Read-only-Kernversprechen** — Woche 2–12 ohne Bestätigung | `SPEC_05:106-126` selbst gelesen |
| `[annahme]` **Consent-Log zugesichert (2×), nie modelliert**; Autonomie hat dagegen eine volle Historientabelle | `INDEX.md:33` vs. `SPEC_06` |
| `[annahme]` **Kein Beendigungspfad** — kein Flow, kein Endpoint, keine UI; auch kein Annahme-Endpoint für Invites (`pending → active` existiert nicht) | `SPEC_03/05/07` |
| `[annahme]` **Defaults verletzen das eigene Prinzip:** der Coach-Onboarding-Code setzt 4 von 7 Modulen auf `full`, bevor der Klient angenommen hat | `SPEC_08:203-236` |
| `[annahme]` `status`-CHECK erlaubt `active/paused/ended`, geschrieben werden `pending` und `attention` — zwei Konzepte auf einer Spalte | `SPEC_06:80` vs. `SPEC_08:217`, `SPEC_04:128` |
| `[annahme]` Autonomie-Namen und Kadenzen dreifach verschieden; `SPEC_11` fordert Frequenzen (`3×/week`), die das Feld-Enum nicht kennt | `SPEC_08:107-158` vs. `SPEC_11:225-230` |
| `[annahme]` Zufriedenheit wird 1–10 erhoben, als 1–5 gespeichert und verrechnet — Umrechnung nirgends definiert | `SPEC_08:269` vs. `SPEC_02:93` |
| `[annahme]` Alle Confidence-/Forecast-/Effectiveness-Zahlen der `SPEC_11` (94 % Confidence, „Plateau in 10 Tagen", Wirksamkeit 91 %) haben **kein Modell** | `SPEC_11:185-257` |

### 5.4 Marketplace

| Befund | Beleg |
|---|---|
| `[read]` **Creator erhält real 64 % statt 80 %** (Doppelabzug); zweite Funktion derselben Spec rechnet anders | `SPEC_09:198-201` selbst gelesen, vs. `SPEC_04:163-165` |
| `[read]` **Abo-Gutschrift 1:1** — Abo wirtschaftlich gratis, Kommentar behauptet das Gegenteil | `SPEC_09:218-222` selbst gelesen |
| `[annahme]` Score-Cap 200 unerreichbar (Max 141), Difficulty-Bonus wirkt mit max. 1 statt 10 Punkten, der persistierte Cron-Score lässt 40 % Personalisierung weg und sortiert trotzdem | `SPEC_09:21-55`, `SPEC_04:82-83` |
| `[annahme]` `UserSubscription` als Entity + Contract + Cron-Datenbasis — **Tabelle fehlt**; Rating-Trigger schlägt bei DELETE fehl (`NEW.product_id`); `avg_product_rating` wird nie befüllt | `SPEC_02:15`, `SPEC_06:388-404` |
| `[annahme]` `session`/`recovery_protocol`/`ai_persona` ohne Delivery-Pfad — der Products-Mockup erfindet dafür drei API-Routen, die in keiner Spec stehen | `SPEC_04:97-126`, `products.jsx:8-11` |
| `[annahme]` **Coach-Buchung: doppelte Delegation ins Leere** — Marketplace verweist auf HumanCoach, HumanCoach auf „Marketplace Modul 5700"; keiner definiert die Buchung. Kein Mockup zeigt einen „Hire"-Knopf | `SPEC_01:66` (M), `SPEC_01:104` (HC) |
| `[annahme]` Verifikationsleiter mit Umsatzanteilen (75/80/85 %) existiert **nur im Mockup** und kollidiert mit der Spec-Kopplung an die Traffic-Quelle (90 % Coach-Traffic) | `seller.jsx:373-380` |

---

## 6. In welcher Reihenfolge, und was warten kann

### 6.1 Die Abhängigkeitskette

```
Rechtemodell (C-95)  ──blockiert──▶  Coach-Athletensicht anbinden
        │                                    │
        ├──blockiert──▶  Buddy (module_access, Coach-Ausleitung)
        │                                    │
        └──blockiert──▶  Marketplace-Coach-Naht (Buchung → Beziehung → Freigaben)

Buddy-Schema + Engines  ──▶  Memory/Chat  ──▶  Watcher/Interventionen  ──▶  BSS · Voice
Coach-Portal (eigene App) — unabhängig von Buddy, nach der Athletensicht
Marketplace — zuletzt; blockiert nichts, wird von der Rechtsklärung blockiert
```

`[read]` Der Modulplan setzt Buddy in Stufe 3 („nachdem `apps/web` steht")
und Coach in Stufe 2; **die Datengrundlage C-78 ist inzwischen gefallen**
(ssot/117: 180 Tage korrespondierende Seeds, adaptive TDEE `complete`).

### 6.2 Begründete Reihenfolge

**1. Das Rechtemodell entscheiden und bauen (C-95/C-71).** Es ist die
einzige Komponente, die **alle drei** Module blockiert, und sie ist klein:
eine Grant-Tabelle, eine Historie, RLS nach Konventionen §12. Vorher
braucht es nur die Entscheidungen E1–E5 aus Abschnitt 1.4.

**2. Coach-Athletensicht anbinden.** Die Attrappe steht (60/60), die
Vorlage und der Vorgänger decken sich bis in die Sensibilitätsmarkierung,
und der Nutzer verwaltet hier seine Freigaben — der sichtbare Beweis, dass
das Rechtemodell funktioniert. Beziehung (Invite → Annahme → **Beendigung**,
den fehlenden Pfad von Anfang an mitbauen), Freigaben, Vorschläge.

**3. Buddy-Schema und die deterministischen Engines.** Engines sind pure
Funktionen ohne LLM, ihre Eingaben liegen seit C-78 vor (Abschnitt 2.2),
und sie sind messbar — der richtige erste Buddy-Schritt. Eventlog und
State-Snapshot gehören dazu. **Vorher eine Retention-Entscheidung** (was
wird wie lange gespeichert), damit das append-only-Log nicht als
DSGVO-Falle startet.

**4. Buddy Memory und Chat.** Braucht die Memory-Konsolidierung
(Abschnitt 2.1) und LLM-Anbindung. Danach Watcher/Automatisierungen nach
dem Vorgänger-Muster (`buddy_automations` mit explizitem Trigger).

**5. Coach-Portal als eigene App.** 20 Posten `bekanntOffen` plus die
Portal-Hälfte von `gaps.jsx` — eigener Menüpunkt, eigener Auftrag, eigene
App (`apps/coach`). Kann parallel zu 3/4 laufen, hängt aber an denselben
Rechte-Entscheidungen.

**6. Marketplace zuletzt — und zuerst zum Anwalt.** Es blockiert nichts:
die Coach-Beziehung entsteht auch per Invite, ganz ohne Marktplatz. Es
berührt als einziges Modul Geld, und die tragende Rechtskonstruktion
(„kein E-Geld") ist ungeprüft (Abschnitt 4.4). Reihenfolge innerhalb des
Moduls, wenn es soweit ist: Rechtsklärung → Wallet-Kern (der konsistenteste
Teil) → Katalog/Kauf/Delivery für die drei Typen, die einen Lieferpfad
haben → Verkäufer-Onboarding. Die **Coach-Buchungs-Naht** muss vorher als
Vertrag definiert werden (heute delegieren beide Module aufeinander).

### 6.3 Was warten kann — und was eine Tom-Entscheidung braucht, bevor es überhaupt geplant wird

**Warten kann** (blockiert nichts, teils ohne Datenbasis):
Voice/Live (C-75-Neubau; Parser-Muster der Vorlage sind der beste Entwurf) ·
Clone &amp; Gym · Promotion-Slots und Brand-Placement · Team &amp; Audit im
Portal · `equipment` (kein Fulfillment) · `pricing_model 'subscription'`
(toter Zweig) · Jahres-Abos · `expires_at`-Freigaben (E5).

**Erst entscheiden, dann planen:**

| # | Entscheidung | Herkunft |
|---|---|---|
| E1–E5 | Rechtemodell (Abschnitt 1.4) | C-95/C-71 |
| E6 | Portal-Architektur: `apps/coach` eigenständig (Empfehlung) vs. `SPEC_11`-Role-Toggle | Abschnitt 3.1 |
| E7 | **BSS**: ob ein Verhaltens-Score über Menschen angezeigt wird, und mit welchen Gewichten (0,5/0,5 vs. 0,6/0,4) | Abschnitte 2.3/2.4 |
| E8 | **Interventionsmaschine**: Konfrontation, Identitätsaussagen, Auto-Flag an den Coach | Abschnitt 2.4 |
| E9 | **PED-Komplex**: „Enhanced Mode" (Coach), `pin_day`/`cycle_consulting` (Buddy), „TRT protocol consultation" (Marketplace) — eine Entscheidung, drei Fundstellen | Abschnitte 2.4/3.4/4.4 |
| E10 | **Retention**: Aufbewahrung von Gesprächen, Eventlog, Signaturen; Kaskade bei Widerruf und Beziehungsende | Abschnitte 2.1/3.2 |
| E11 | **Währung des Wallets** und die Provisionshöhe (64-%-Befund) | Abschnitt 4.3 |

---

## Nachweise (Auswahl der selbst geprüften)

| Behauptung | Beleg |
|---|---|
| Bestandsgrößen, alle drei `SPEC_06`/`SPEC_11` vorhanden | Messskript 2026-08-19 (Scratchpad `messen.py`) |
| Kein Coach/Buddy/Market/Wallet-Schema in der Pipeline | Grep `CREATE TABLE` über `supabase/_pipeline/` → leer |
| 12 binäre Schalter, `read_medical`/`edit_auto_accept` sensitiv | `SettingsView.tsx:265,291,296,348` |
| Regel-Whitelist ohne Medical | Grep `medical|biomarker|blood|lab_` in `ruleSchema.ts` → leer |
| `buddy_memories` ohne Verfall | Grep `expires|ttl|decay` in `20260316_buddy_memories.sql` → leer |
| Vorgänger-Marketplace: 013 + 048, Credits-Wallet, Stripe nur als Spalte | beide Migrationen vollständig gelesen |
| Zwei-Salden-Wallet, Voucher verfällt | `SPEC_05_WALLET_ECONOMICS.md:9-33` |
| Doppelabzug 64 %, Abo 1:1 | `SPEC_09_SCORING.md:192-228` (Marketplace) |
| Placebo-Trigger, 3 Stufen × 7 Module | HumanCoach `SPEC_06:113-141` |
| Enhanced-Mode-Blutbild, Auto-Delivery | `SPEC_05_COACH_WORKFLOWS.md:86-126` |
| BSS 0,5/0,5 vs. 0,6/0,4 | Buddy `SPEC_09:97` vs. `module-buddy-engines.jsx:106` |
| Autonomie invertiert | `SPEC_03:25-27` vs. `SPEC_11:196,239` |
| `pin_day_missed` | Buddy `SPEC_08:108-114` |
| Buddy→Coach-Ausleitung ohne Consent-Feld | Buddy `SPEC_07:574-588` |
| „Dr. Kessler", TRT | `module-market-creator.jsx:83-97` |
| 16 `CREATE TABLE`, kein `coach_memory` | Grep über Buddy-`SPEC_06` |
| C-78 gefallen | `docs/ssot/117-zusammenhaengende-seeds.md` |
