---
nr: C-362
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: C-112
entscheidung: null
agent: codex
beauftragt: 2026-09-01
beruehrt:
  tabellen: [coach.client_permissions]
zahlen:
  gemessen: 2026-08-30
---

# C-362 — das Consent-Log ist beschrieben und nicht gebaut

## Befund

Aus C-112, gegen die Spec geprueft 2026-08-30.

`[cmd]` **Ein Einwilligungsprotokoll steht in `INDEX.md`,
`SPEC_01_MODULE_CONTRACT.md` und `SPEC_03_USER_FLOWS.md` der
HumanCoach-Spec.**

`[cmd]` **Keine Tabelle** — `auth.oauth_consents` ist die
Anmeldung, nicht die Datenfreigabe.

`[read]` **C-112 nannte es *,,zweimal zugesichert und nie
modelliert"*.** **Das stimmt.**

## Was schon da ist und was fehlt

`[cmd]` **Die Aenderungshistorie ist gebaut:**
`permission_change_log`, `autonomy_change_log`,
`relationship_change_log` — **je 7 bis 8 Zeilen.**

`[read]` **Der Unterschied zum Consent-Log:** `[read]` **die
Protokolle halten fest, WAS geaendert wurde.** **Ein Consent-Log
haelt fest, WEM der Nutzer WOZU zugestimmt hat** — **mit Zeitpunkt,
Fassung und Widerruf.**

`[cmd]` **Und C-112 nennt einen zweiten Befund dazu:** *,,der
Einwilligungs-Trigger ist ein Placebo"*. **Zu messen: was loest heute
eine Einwilligung aus, und was passiert dabei?**

## Beruehrt

`[cmd]` **E-20 verlangt zwei getrennte Zwecke mit je eigener
Einwilligung** (MealCam). `[read]` **Wenn ein Consent-Log entsteht,
ist das sein erster Nutzer** — **und C-207 wartet auf dieselbe
Frage.**

## Auftrag — das Einwilligungsprotokoll

**Mitbeauftragt: G-282, E-04.** Bericht in diese Datei.

**Beauftragt am 2026-09-01.**

### 1 · C-362 — das Consent-Log

`[cmd]` **Beschrieben in `INDEX.md`, `SPEC_01_MODULE_CONTRACT.md` und
`SPEC_03_USER_FLOWS.md` der HumanCoach-Spec.** `[cmd]` **Keine
Tabelle** — `auth.oauth_consents` ist die Anmeldung, nicht die
Datenfreigabe.

`[read]` **Der Unterschied zu dem, was schon steht:** `[cmd]` **die
drei Aenderungsprotokolle halten fest, WAS geaendert wurde.**
`[read]` **Ein Consent-Log haelt fest, WEM der Nutzer WOZU zugestimmt
hat** — mit Zeitpunkt, Fassung und Widerruf.

`[cmd]` **E-20 verlangt zwei getrennte Zwecke mit je eigener
Einwilligung** (MealCam). `[read]` **Wenn ein Consent-Log entsteht,
ist das sein erster Nutzer.**

`[cmd]` **Und C-207 wartet auf dieselbe Frage** — der Cam-Weg.

### 2 · G-282 — CoachMemory

`[cmd]` **In `SPEC_02_ENTITIES` und `SPEC_10` als Entitaet
definiert, keine Tabelle.**

`[read]` **Vorher zu klaeren:** `[cmd]`
**`coach-buddy-killer-feature.md` Kapitel 17 heisst *Coach Memory
(Structured, nicht freie Magie)*** mit **17.1 Memory Types** und
**17.2 Memory Fields**. `[cmd]` **Und C-112 nannte vier parallele
Gedaechtnismodelle.**

`[read]` **Miss, welches gilt, bevor du baust.** **Und das Vergessen
gehoert dazu** — C-112 nannte *,,append-only-Log gegen DSGVO"*.

### 3 · E-04 — alte `public`-Tabellen nach `legacy`

`[read]` **Aufraeumarbeit, aber sie steht als Entscheidung fest.**
`[cmd]` **Miss zuerst, welche Tabellen gemeint sind und ob etwas sie
noch liest.**

### Was nicht zu tun ist

**Kein Coach-UI bauen** — nur Schema.
**Keine Tabelle loeschen, die noch gelesen wird.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Consent-Log       Tabelle, Felder, was E-20 braucht
    Widerruf          wie wird er festgehalten
    CoachMemory       welches der vier Modelle, belegt
    Vergessen         wie, oder als offen gemeldet
    legacy            welche Tabellen, wer liest sie noch

## Bericht

### 2026-09-01 — Codex

## C-362 — gebaut: zweckgebundenes Einwilligungsprotokoll

`coach.client_consent_log` ist eingespielt, mit genau diesen
Fachdaten: `client_id`, Empfaenger (`recipient_type`, bei Coach auch
`recipient_id`), `purpose_code`, `policy_version`, Ereignis
`granted|revoked`, Zeitpunkt sowie `revokes_consent_id` als Verweis
des Widerrufs auf die Erteilung. Das ist append-only: fuer
`authenticated` gibt es nur SELECT, kein INSERT, UPDATE oder DELETE.
Ein neuer Dialog bzw. ein kontrollierter Schreibpfad ist damit
**nicht** vorweggebaut.

E-20 kann die zwei Zwecke getrennt erfassen:
`mealcam_analysis` und `mealcam_model_improvement`. Der Test legt
beide sowie einen Widerruf im Rollback an und beweist damit, dass
keine gemeinsame oder implizite Freigabe daraus wird. C-207 kann
spaeter einen eigenen Zweckcode nutzen; keine Cam-Fassung, Quelle oder
Textversion wurde geraten.

`[cmd]` Vormessung: Nur `auth.oauth_consents` existierte (0 Reihen;
`scopes`, `granted_at`, `revoked_at` fuer OAuth), aber keine
Consent-Tabelle, -Funktion oder -Trigger. Die drei bestehenden
Aenderungsprotokolle enthalten 6/6/7 Reihen und beschreiben weiterhin
nur Rechte-, Autonomie- bzw. Beziehungswechsel, nicht Einwilligungen.

**Sicherheitsreview:** bestanden mit offenem Folgepunkt. RLS ist aktiv;
der Client liest nur eigene Ereignisse, ein Coach nur Ereignisse, in
denen er selbst Empfaenger ist. `anon` und `authenticated` haben keine
Schreibrechte; auch `service_role` hat nur SELECT und INSERT, nie
UPDATE oder DELETE. Das verhindert einen direkten Eintrag mit
erfundenem Zeitpunkt oder Fassung sowie eine nachtraegliche
Manipulation. Der fehlende Writer ist absichtlich offen, nicht eine
vergessene Berechtigung.

Kettenquelle:
`supabase/_pipeline/15_coach/362_client_consent_log.sql`; Live-Migration:
`supabase/migrations/20260901110000_c362_client_consent_log.sql`.
Vorher entstand eine 25.927.467-Byte-Vollsicherung ausserhalb des
Repos. Der Rot-zu-Gruen-Test steht in
`supabase/_pipeline/_validierung/coach-c362-consent-log.test.ts`.

## G-282 — nicht gebaut: die Memory-Spec ist nicht entscheidungsreif

`[cmd]` Der gebaute Stand hat weder ein `buddy`-Schema noch eine
CoachMemory-Tabelle. Vier Beschreibungen bilden keine konsistente
Grundlage:

| Quelle | Typen / Vergessen |
|---|---|
| Aktuelles `SPEC_02_ENTITIES` | 7 Typen: `preference`, `pattern`, `goal`, `concern`, `success`, `milestone`, `context_note`; Felder wie `content`, `evidence`, `auto_decay` |
| Aktuelles `SPEC_07_API` | nur 4 Typen: `preference`, `pattern`, `milestone`, `coaching_outcome`; POST und echtes DELETE |
| Aktuelles `SPEC_10_COMPONENTS` | `createMemory`, `deleteMemory` und eine fuer Nutzer sichtbare Liste |
| `coach-buddy-killer-feature.md`, Kap. 17 | 4 andere Typen: `PREFERENCE`, `MILESTONE`, `CONTEXT_NOTE`, `COACHING_OUTCOME`; `raw_text`, `summary`, `source_event_id`, Tags; nur aus Events, nicht Chat |

Die aktuelle Spec widerspricht sich damit schon selbst: `coaching_outcome`
steht in API/Kapitel 17, aber nicht in der Entity; vier Entity-Typen
fehlen im API-Filter. Beim Vergessen stehen taeglicher Decay und
wirkliches Nutzer-DELETE gegen das aus C-112 zitierte append-only.
Ohne Entscheidung, ob Loeschen, Tombstone oder Anonymisierung gilt,
waere eine Tabelle eine neue, unbelegte Memory-Form. **G-282 bleibt
deshalb offen; keine Tabelle gesetzt.**

## E-04 — kein lokaler Verschiebeauftrag

Die hier gemeinte E-04 ist der laufende Goals-Punkt
`goals-e-0004-alte-public-tabellen-nach-legacy-verschieben.md`, nicht
die gleich nummerierte Recovery-Entscheidung. Sein historisches Ziel
sind die vier Legacy-Cloud-Tabellen `public.exercises`,
`exercise_muscles`, `muscle_groups`, `equipment`. Laut
`docs/ssot/60-legacy-cloud.md` hing daran am 2026-08-07 nichts; der
Cloud-Zugang ist aber read-only und der Schritt wurde nie ausgefuehrt.

`[cmd]` Auf dem aktuellen dev gibt es kein `legacy`-Schema und diese
vier `public`-Tabellen existieren nicht. Es gibt nur
`public.profiles` (7 Reihen) und `public.user_display_preferences`
(2), beide mit RLS. `profiles` hat 26 Treffer in Pipeline-/Tool-Lesern,
`user_display_preferences` einen direkten und zudem die FK-Abhaengigkeit
zu `profiles`. **Keines davon ist eine alte E-04-Tabelle und nichts
wurde verschoben oder geloescht.**

## Abnahme

_(vom Orchestrator)_
