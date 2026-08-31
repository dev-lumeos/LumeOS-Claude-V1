---
nr: C-112
typ: blocker
modul: coach
schwere: hoch
angelegt: 2026-08-19
braucht: []
kind_von: F-03
kinder: []
entscheidung: null
erledigt: 2026-08-30
commit: f4010501
beruehrt:
  tabellen: []
  dateien: ["docs/spezifikation/30-module/addon/00-entwurf-buddy-coach-marketplace.md"]
zahlen: null
---

# C-112 - Buddy, Coach und Marketplace — elf Entscheidungen

## Befund

(neu
  2026-08-19). **Entscheidungen fuer Tom.** Aus dem F-03-Entwurf
  (`docs/spezifikation/30-module/addon/00-entwurf-buddy-coach-marketplace.md`,
  680 Zeilen).

  ### Das Rechtemodell traegt fuer beide — auf einer Achse

  `[cmd]` **Sicht:** ein Grant-Objekt, **7 Module, 3 Stufen, Historie
  append-only.** *„Die Vorlage zeigt Buddy ohnehin als Spalte in
  derselben Matrix."*

  `[cmd]` **Autonomie muss sich unterscheiden:** beim Coach zweiwertig
  nach C-95, **bei Buddy eine Proaktivitaetsstufe** — *„deren Skala in
  den Specs exakt invertiert dokumentiert ist: `SPEC_03` Level 5 = Buddy
  entscheidet, `SPEC_11` Level 1 = Buddy entscheidet."*

  `[cmd]` **Die Widerrufshistorie wird gebraucht** — C-71 hatte sie als
  fehlend vermerkt, **hier ist die Antwort ja, mit Begruendung.**

  `[read]` **Die wichtigste Regel im Entwurf:** *„Buddys Ausleitung an
  den Human Coach (`/for-human-coach`, ohne Consent-Check in der Spec)
  erbt die Coach-Freigabematrix, sie bekommt keine eigene."*

  ### Buddy: 16 Tabellen, aber der Kern fehlt

  `[cmd]` **`CoachMemory`, die Kernstruktur, hat keine Tabelle.**
  **Vergessen ist nirgends geregelt** — append-only-Log gegen DSGVO. Der
  Vorgaenger hat **vier parallele Gedaechtnismodelle**;
  Konsolidierungsvorschlag steht im Entwurf.

  `[cmd]` **Die Daten fuer die elf deterministischen Engines liegen seit
  C-78 fast vollstaendig vor.**

  ### Coach: vier Luecken in den Specs

  `[cmd]` **Kein Beendigungspfad.** **Consent-Log zweimal zugesichert
  und nie modelliert.** **Auto-Delivery hebt das Vorschlagsmodell aus.**
  **Der Einwilligungs-Trigger ist ein Placebo.**

  `[read]` **Uebernahmekandidat:** der Rule-Builder v2 des Vorgaengers —
  *„dessen Metrik-Whitelist enthaelt keine medizinischen Werte (selbst
  gegrept)."*

  ### Marketplace: drei oekonomische Befunde

  `[cmd]` **Creator erhaelt real 64 % statt 80 %** — Doppelabzug,
  `SPEC_09:198-200`. **Das Abo ist wirtschaftlich gratis** (1:1-Voucher).
  **Gebuehrensatz 15 % gegen 20/10/25 % nebeneinander.**

  `[read]` **Acht Rechtsfragen benannt, nicht entschieden — die
  schaerfste:** *„die „kein E-Geld"-Konstruktion wird vom eigenen Top-up
  unterlaufen (echtes Geld → nicht auszahlbarer, verfallender
  EUR-Saldo)."*

  ### Reihenfolge

  **Rechtemodell zuerst** (blockiert alle drei, ist klein) →
  Coach-Athletensicht → Buddy-Schema und Engines → Memory/Chat →
  Portal als eigene App → **Marketplace zuletzt** (blockiert nichts,
  **braucht vorher den Anwalt**).

  ### Zwei Korrekturen am Auftrag

  `[cmd]` **Alle drei Module haben ein `SPEC_06_DATABASE_SCHEMA` und ein
  `SPEC_11`** — *„„kein Schema" stimmt nur fuers neue Repo (`_pipeline`
  leer, gegrept)."*

  `[cmd]` **Und neu gefunden:** **die BSS-Formel weicht zwischen Spec
  (0,5/0,5) und Vorlage (0,6/0,4) ab**, und **der Spec-eigene Unit-Test
  dazu schlaegt nachgerechnet fehl.** `[read]` Fuenfter Spec-Fehler in
  Folge.

## Abnahme

**2026-08-30, gegen vier Quellen geprueft.**

**Tom, 2026-08-30:** *,,da sind wir wieder am punkt angelangt wo du
mich sachen fragst wo ziemlich sicher in den specs, altem repo oder
vision oder neues design schon deklarationen hat"*.

`[read]` **Er hatte recht. Von elf Punkten sind drei gebaut, fuenf
spezifiziert, und nur drei sind wirklich offen.**

### Die Quellen, die ich nicht gelesen hatte

    docs/specs/BuddyandAICoach/    12 Dateien, 136 KB
    docs/specs/HumanCoach/         12 Dateien, 97 KB
    referenz/.../AUTONOMY_ARCHITECTURE.md         444 Zeilen
    referenz/.../coach-buddy-killer-feature.md  1.591 Zeilen, 22 Kapitel

`[cmd]` **Die ersten beiden nennt `00-QUELLEN.md` beim Namen.**

### Gebaut — kein Befund mehr

`[cmd]` **Beendigungspfad Coach:** `coach.relationships` traegt
`status`, `ended_at`, `ended_by`, `end_reason`, `withdrawn_at`,
`withdrawn_by`, `withdraw_reason`.

`[cmd]` **Widerrufshistorie:** drei Aenderungsprotokolle —
`permission_change_log`, `autonomy_change_log`,
`relationship_change_log`.

`[cmd]` **Rechtematrix auf einer Achse:** `client_permissions` fuehrt
sieben Module mit `_visibility` und `_auto_apply`, `client_autonomy`
sieben mit `_level` plus `safety_level`. **Buddy ist eine Spalte
darin, wie der Entwurf es verlangt.**

### Die Autonomiestufe ist eindeutig definiert

    Level 1  Supervised      alles blockiert
    Level 2  Guided          Wasser, Schlaf, Erholung
    Level 3  Collaborative   Ernaehrung, Supplement-Timing,
                             Makros unter 5 %          <- DEFAULT
    Level 4  Adaptive        Deload, Volumen, Trainingslast
    Level 5  Autonomous      alles, inkl. Programm und Ziele

`[cmd]` **Dreifach belegt:** `AUTONOMY_ARCHITECTURE.md`,
`SPEC_03_USER_FLOWS.md` (*,,Level 1: Ich frage wenn ich will · Level
3: Lass uns zusammenarbeiten ← Default"*), und
`SPEC_06_DATABASE_SCHEMA.md` (`DEFAULT 3 CHECK BETWEEN 1 AND 5`).

`[read]` **Die widerspruechliche Spec-Stelle, die dieser Punkt nennt,
ist die falsche** — **nicht die Architektur.** `[cmd]` **Und der
Bestand folgt ihr bereits:** `coach.darf_nutrition_plan_aendern()`
verlangt Stufe 5.

### Die vier Konfigurationsebenen sind definiert

`[cmd]` **`INDEX.md` der Buddy-Spec: User · Tier · Coach · Gym.**

`[cmd]` **Und `UserCoachProfile` traegt die Nutzereinstellung:**
`coach_personality` (fuenf Stile), `autonomy_level`,
`intervention_threshold`, `communication_style`, `wake_word`.

`[read]` **Damit war meine Frage an Tom — *bekommt der Nutzer eine
eigene Einstellung?* — in `SPEC_06` beantwortet.**

### Spezifiziert, nicht gebaut — Bauaufgaben, keine Entscheidungen

`[cmd]` **`CoachMemory`:** in `SPEC_02_ENTITIES` und `SPEC_10` als
Entitaet definiert, **keine Tabelle in der Datenbank.**

`[cmd]` **Consent-Log:** in `INDEX`, `SPEC_01` und `SPEC_03` der
HumanCoach-Spec beschrieben, **keine Tabelle** (`auth.oauth_consents`
ist etwas anderes).

`[cmd]` **`/for-human-coach`:** in drei Buddy-Spec-Dateien
beschrieben.

**Als G-282 (CoachMemory) und C-362 (Consent-Log) angelegt.**

### Wirklich offen — und es ist der Marketplace

`[read]` **Die drei oekonomischen Befunde sind Entscheidungen, keine
Lueckenmeldungen:** Creator erhaelt real 64 statt 80 Prozent, das Abo
ist wirtschaftlich gratis, drei Gebuehrensaetze stehen nebeneinander.

`[cmd]` **Und acht Rechtsfragen sind benannt, nicht entschieden** —
die schaerfste: die *,,kein E-Geld"*-Konstruktion wird vom eigenen
Top-up unterlaufen.

`[read]` **Der Punkt selbst sagt: Marketplace zuletzt, blockiert
nichts, braucht vorher den Anwalt.** **Als C-363.**

**Geschlossen.** Was blieb, sind drei Punkte statt elf.
