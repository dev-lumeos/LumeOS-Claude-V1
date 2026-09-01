---
nr: A-33
typ: blocker
modul: medical
schwere: hoch
angelegt: 2026-08-20
braucht: []
kind_von: G-85
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-01
erledigt: 2026-09-01
commit: a33ca39c
beruehrt:
  tabellen: []
  dateien: ["docs/specs/Medical/SPEC_09_SCORING.md"]
zahlen: null
---

# A-33 - Der Medical-Abgleich, den der Orchestrator nachgeholt hat

## Befund

(neu 2026-08-20). **Tom hat danach gefragt, zu Recht.**

  `[read]` **Drei Auftraege gingen raus, ohne dass Spec, Mockup und
  Vorgaengerrepo gelesen waren.** Der Abgleich danach hat mehr gefunden
  als die Auftraege enthielten.

  ### 1. Der Health score ist entschieden — seit Monaten

  `[cmd]` **`docs/specs/Medical/SPEC_09_SCORING.md`, 408 Zeilen**,
  definiert **beide** Unbekannten aus G-85:

  ```
  SYSTEM_MARKERS = {
    liver:          [ALT, AST, GGT, ALP, Bilirubin, Albumin]
    cardiovascular: [LDL, HDL, Triglyceride, hs-CRP, Homocystein, ApoB]
    kidney:         [Kreatinin, BUN, eGFR, Harnsaeure]
    hormonal:       [Testosteron, Oestradiol, Cortisol, TSH, Free T3, Prolaktin]
    metabolic:      [HbA1c, Glukose, Insulin, HOMA-IR]
  }
  WEIGHTS = { cardiovascular .25, metabolic .25, hormonal .20,
              liver .15, kidney .15 }
  FLAG_SCORE = { optimal 100, normal 75, low/high 40, critical 10 }
  ```

  `[read]` **Der Orchestrator hat G-85 als offene Frage an Tom
  weitergegeben, obwohl die Antwort im Repo lag.**

  `[cmd]` **Und der Umgang mit Luecken ist definiert:** `totalW`
  normalisiert ueber die vorhandenen Systeme, `no_data` wenn keiner
  traegt, **`missing` zaehlt die fehlenden Marker.**

  ### 2. Warum G-84 nur 23 von 37 gruppieren konnte

  `[cmd]` **Die Spec sucht ueber Namen, nicht ueber LOINC:**
  `biomarker_name`, `common_name`, `abbreviation`.

  `[cmd]` **Nachgemessen: 18 der 26 Spec-Marker treffen unseren
  Katalog ueber den Namen.** **Die acht Fehlenden sind
  Namensvarianten** — `GGT` heisst im LOINC *Gamma glutamyl
  transferase*, `eGFR` *Glomerular filtration rate*, `Triglycerides`
  *Triglyceride*.

  `[read]` **`biomarker_aliases` hat 292 Eintraege und ist genau dafuer
  gebaut.** **Damit waeren es 26 von 26.**

  ### 3. `module-medical-data.jsx` traegt dieselbe Rechnung — und mehr

  `[cmd]` **298 Zeilen mit:** `SYSTEM_MARKERS`, `SYSTEM_WEIGHTS`,
  `calcSystemScore`, `calcOverallHealthScore`, `calcBiomarkerTrend`,
  `generateAlerts`, `UNIT_CONVERSIONS`.

  **Und zwei, die woanders fehlen:**

  `[cmd]` **`SUPPLEMENT_BIOMARKER_MAP` und
  `calcSupplementEffectiveness`** — `[read]` **genau das, was C-162
  heute in der Datenbank gebaut hat** (222 Zeilen, 66 Marker). **Die
  Vorlage lag die ganze Zeit da.**

  `[cmd]` **`SYMPTOM_BIOMARKER_MAP` und `SYMPTOMS`** — `[read]` **C-159
  meldet *„keine Symptomtabelle im ganzen Schema"*.** **Das Mockup hat
  sie.**

  ### 4. Vier Medical-Tabs, die nie erwaehnt wurden

  `[cmd]` **`module-medical.jsx`, 809 Zeilen:** `MedMedications`,
  `MedHistory`, `MedDocuments`, `MedAppointments` — **mit
  `AddLabModal`, `UploadDocModal`, `BookAptModal`, fuenf
  Detailmodalen.**

  `[cmd]` **Und `module-medical-modals.jsx`** (453 Zeilen) plus
  **`module-medical-v2.jsx`** (818) mit `RangeIndicator`, `FlagPill`,
  `TrendBadge`.

  `[read]` **176 KB Mockup, elf Specs mit 100 KB** — **davon war bisher
  nichts gelesen.**

  ### Was daraus folgt

  `[cmd]` **G-85 ist nicht blockiert.** Die Zuordnung steht, die
  Gewichtung steht, der Umgang mit Luecken steht.

  `[cmd]` **Pruefend bleibt:** A-20 zaehlt sieben Spec-Fehler.
  **Die 26 Marker gehoeren gegen den Katalog geprueft, bevor jemand
  danach baut** — und die acht Namensvarianten in
  `biomarker_aliases`.

  `[read]` **Und C-159s Landkarte wird kuerzer:** Die Symptomtabelle
  fehlt im Schema, **aber nicht im Entwurf.**

## Auftrag — der Medical-Abgleich

**Mitbeauftragt: C-268, C-269.** Bericht in diese Datei.

**Beauftragt am 2026-09-01.**

### 1 · A-33 — der Abgleich, den der Orchestrator schuldig blieb

`[read]` **Lies den Punkt und miss, was er verlangt.** `[read]`
**Wenn die Sache inzwischen erledigt ist, sag es** — **bei
zweiundzwanzig geprueften Altpunkten waren es neun.**

`[cmd]` **`user_medications` ist bis heute gesperrt** — bis
Verschluesselung und Schluesselverwaltung stehen. **Das gilt weiter.**

`[cmd]` **Und E-12 haelt Medical-Daten in der Entwicklungsphase als
Klartext** — **das ist eine Entscheidung, kein Versaeumnis.**

### 2 · C-268 — beim Einladen gibt es keine Namensaufloesung

`[cmd]` **`coach.relationships` traegt 6 Zeilen.** `[read]` **Miss,
wie eine Einladung heute entsteht und was der Eingeladene sieht.**

### 3 · C-269 — eine Einladung laesst sich nicht zuruecknehmen

`[cmd]` **`relationships` traegt `status`, `ended_at`, `ended_by`,
`end_reason`, `withdrawn_at`, `withdrawn_by`, `withdraw_reason`**
(C-112).

`[read]` **Die Spalten sind da.** **Miss, ob ein Weg dorthin
fuehrt.**

### Was nicht zu tun ist

**Kein `user_medications`** — gesperrt.
**Kein Coach-UI** — nur Schema und Lesewege.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    je Punkt ein Urteil   erledigt / gebaut / offen / ueberholt
    Einladung             wie entsteht sie, was sieht der Eingeladene
    Ruecknahme            gibt es einen Weg? gemessen
    A-33                  was bleibt

## Bericht

### 2026-09-01 - Codex

## A-33 - weitgehend ueberholt, ein Medical-Rest bleibt

Der Kernbefund ist erledigt: G-85 wurde am 2026-08-21 als G-135
geschlossen. Die gebaute Rechnung liegt in
`apps/web/src/lib/medical/systemscore.ts`, nutzt die Systemgruppen aus
`medical.biomarker_spec_enrichment` und die Gewichte der SPEC_09.
Der vorhandene Test lief erneut: **14/14 gruen**. Auf dev haben 29 von
51 Enrichment-Zeilen mindestens eine Systemgruppe; `biomarker_aliases`
hat weiter **292** Zeilen. Die vom alten Punkt benannten Unbekannten
sind damit weder offen noch an Tom zu entscheiden.

Auch zwei weitere alte Luecken sind nicht mehr der damalige Befund:
`medical.lab_marker_catalog` hat **66** Zeilen und
`supplements.supplement_lab_effects` heute **271**; die urspruengliche
222er-Bridge wurde beim Katalogneuaufbau weitergefuehrt. Der
Symptomkatalog und seine Markerkarte existieren ebenfalls
(`medical.symptoms` **34**, `medical.symptom_biomarker_map` **102**).
Offen ist davon getrennt nur das Nutzertagebuch
`medical.user_symptom_logs` (C-303), nicht erneut ein Symptomkatalog.

`medical.user_medications` existiert bereits und hat **2** Zeilen. Es
wurde nicht beruehrt. Die Formulierung "bis Verschluesselung und
Schluesselverwaltung gesperrt" widerspricht dem Ist-Stand und E-12:
E-12 entscheidet Klartext fuer die Entwicklungsphase; Verschluesselung
ist dort bewusst keine noch fehlende Implementierung. Dieser Auftrag
legt weder einen weiteren Medikationspfad noch eine Verschluesselung
an.

**Urteil A-33: weitgehend ueberholt.** Als Abgleich bleibt nur C-303
als neuer, praeziser Nutzersymptom-Blocker; die vier Mockup-Tabs wurden
wegen des ausdruecklichen UI-Verbots nicht bewertet oder gebaut.

## C-268 - Namensluecke bleibt, E-Mail-Helfer ist kein Name

`coach.relationships` hat **6** Zeilen: **4 active**, **2 invited**.
Heute legt `ladeCoachEin` in
`apps/web/src/lib/coach/nachrichten-schreiben.ts` eine Beziehung direkt
per UUID an (`status='invited'`, `invited_by=auth.uid()`). Es ruft die
in Kettenschritt 155 vorhandene
`coach.resolve_invite_user_id(p_email text)` nicht auf.

Die Funktion selbst ist gebaut, fuer `authenticated` ausfuehrbar und
loest nach Anmeldung E-Mail nach UUID auf; die Rollback-Gegenprobe
ergab einen Treffer. Sie liefert aber absichtlich weder Namen noch
E-Mail. `public.profiles` hat kein Namensfeld, `coach.coach_profiles`
existiert weiter nicht. Damit kann sie die eigentliche Namensluecke
nicht schliessen.

Der Eingeladene liest die Beziehung ueber den vorhandenen RLS-Lesepfad
`ladeCoachRechte()`. Die Anzeige zeigt Gegenrolle, Status,
Einladungsnotiz und die ersten acht Stellen der UUID - keinen Namen
und keine E-Mail. Der Datenbankhelfer ist ausserdem in keinem App- oder
Service-Leser verdrahtet. **C-268 bleibt daher offen.** Vor einer
spaeteren Einbindung ist zudem zu entscheiden, ob jeder angemeldete
Nutzer E-Mail-Existenz mittels UUID/NULL abfragen darf; das ist eine
Existenzabfrage, keine Namensquelle.

## C-269 - Statusweg gebaut, aber nicht in der Anzeige erreichbar

`coach.withdraw_relationship_invite(uuid, text)` ist vorhanden,
`SECURITY INVOKER`, fuer `authenticated` freigegeben und beschraenkt
den Wechsel auf eine eigene offene Einladung
(`invited_by=auth.uid()`). Er setzt `status='withdrawn'`,
`withdrawn_at`, `withdrawn_by` und optional `withdraw_reason`; die
CHECK-Constraint verlangt Zeitpunkt und Akteur bei diesem Status.

Die Gegenprobe lief als Einladender vollstaendig im Rollback:
**`withdrawn=true`**, Status und Auditfelder wurden gesetzt, und
`relationship_change_log` stieg innerhalb der Transaktion um genau
eine Zeile. Keine Seed-Beziehung und kein Log wurden dadurch
veraendert.

Es gibt jedoch keinen Aufrufer ausserhalb der Kettenquelle - weder
Server-Action noch Anzeige ruft die Funktion. **C-269 ist als
Schema-/Datenbankweg erledigt; der sichtbare Ruecknahmepfad bleibt
offen.** Entsprechend dem Auftrag wurde kein Coach-UI gebaut.

## Abnahme

**2026-09-01, Orchestrator.**

`[cmd]` **A-33 weitgehend ueberholt:** Health-Score und
Alias-/Labormarker-Bruecken stehen, **Score-Test 14/14 gruen.**

`[read]` **Der Punkt hiess *,,der Abgleich, den der Orchestrator
nachgeholt hat"*** — **er ist nachgeholt und seither gebaut worden.**

`[cmd]` **Offen bleibt nur das Nutzersymptom-Protokoll** — C-303.

### C-268 — offen, und der Befund ist praeziser geworden

`[cmd]` **Es gibt einen ungenutzten E-Mail-nach-UUID-Helfer, aber
keine Namensquelle.** `[cmd]` **Eingeladene sehen Rolle, Status und
Kurz-UUID.**

`[read]` **Damit ist die Luecke benannt: nicht der Weg fehlt, sondern
der Name.** `[read]` **Ein Coach laedt ein, und der Klient sieht eine
Kennung.**

### C-269 — die Datenbankseite steht

`[cmd]` **Der Widerruf setzt Status und Auditfelder und schreibt ins
Aenderungslog.** `[cmd]` **Rueckbau-Gegenprobe bestanden.**

`[cmd]` **Ein sichtbarer Aufrufer fehlt** — **das ist UI-Arbeit, kein
Schemabefund.**

`[read]` **Und er hat es so gemeldet, statt einen Knopf zu bauen, der
nicht sein Auftrag war.**

**Abgenommen.**

