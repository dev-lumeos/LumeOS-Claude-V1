---
nr: C-327
typ: blocker
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-129
entscheidung: null
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: 8003800e
beruehrt:
  tabellen:
    - supplements.rule_catalog
  dateien: []
zahlen:
  gemessen: 2026-08-28
  medikamentenregeln: 20
  missing_input: 1
  fehlende_gruppenmitgliedschaft: 1
---

# C-327 - Die Chelationsregel kennt keine Gruppenmitgliedschaft

## Befund

`[cmd]` **Gemessen 2026-08-28 fuer `dev@lumeos.app`:**
`rule_assessment` gibt fuer `wr_drug_chelation_timing`
`evaluation_state = missing_input` und
`missing_inputs = {supplements.substance_group_membership}` zurueck.

`[cmd]` Von 20 Medikamentenregeln sind 1 `missing_input`, 7
`unsupported_operator` und 12 `not_fulfilled`. Die sieben unbekannten
Operatoren gehoeren in C-313; diese einzelne fehlende
Gruppenmitgliedschaft ist davon getrennt.

## Was zu tun ist

**Die Gruppenmitgliedschaft fuer die Regel auswertbar machen oder die
Regel fachlich als nicht auswertbar begruenden.** Ein fehlender Input
bleibt sichtbar; er darf nicht als nicht erfuellt erscheinen.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du, und du nennst Nutzer und Zeitraum
dazu.** `[cmd]` **Seit heute in `CLAUDE.md`** — zweimal haben zwei
Beteiligte verschiedene Zahlen fuer dieselbe Sache gemeldet, weil der
Ausschnitt fehlte.

### Zu tun

**Der letzte `missing_input` in der Regel-Engine.**

`[cmd]` **Von 64 Regeln:** 39 `not_fulfilled`, 23
`unsupported_operator`, 1 `fulfilled`, **1 `missing_input` — das ist
diese.**

`[read]` **`missing_input` ist der ehrlichste der vier Zustaende:**
die Regel koennte auswerten, ihr fehlt nur eine Eingabe. `[read]`
**Miss zuerst, welche** — und ob sie fehlt oder nur nicht verknuepft
ist.

`[cmd]` **C-296 hat gezeigt, wie leicht man sich hier taeuscht:**
`drug_class` fuehrte jeden Tag doppelt, und `wr_serotonergic` sucht
Grossschreibung. **Eine Gruppenmitgliedschaft, die *fehlt*, kann auch
eine sein, die unter anderem Namen da ist.**

### Der Nachweis ist wichtiger als die Behebung

**Eine Lage, in der die Regel zutreffen muss, und eine, in der sie
nicht zutreffen darf.**

`[read]` **Chelatbildner und Mineralstoffe im selben Zeitfenster sind
ein echter Fall** — Eisen und Kalzium binden sich gegenseitig.
**Eine Warnung, die zu frueh feuert, macht den ganzen Block
unglaubwuerdig; eine, die ausbleibt, ist wirkungslos.**

### Was nicht zu tun ist

**Keine Regel aendern.** `[read]` **Die Eingabe wird zur Regel
gebaut, nicht die Regel zur Eingabe.** Wenn die Regel etwas verlangt,
das nicht sinnvoll herstellbar ist: **melden.**
**Keine weiteren Operatoren** — die 23 warten (C-332).
`apps/` nicht anfassen — Claude Code arbeitet dort an G-246.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    welche Eingabe fehlt         benannt
    fehlt sie oder heisst sie    gemessen, nicht vermutet
      anders
    trifft zu                    Lage hergestellt, Regel feuert
    trifft nicht zu              Lage hergestellt, Regel schweigt
    evaluation_state             vorher / nachher, alle 64
    andere Regeln                unveraendert - belegt

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
`[cmd]` **Schreibende Nachweise auf `test-user@lumeos.local`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

`[cmd]` **Ergebnis 2026-08-29:** erledigt. Fuer `dev@lumeos.app` und
`CURRENT_DATE` waren die Auftragszahlen korrekt: 64 Regeln, davon 39
`not_fulfilled`, 23 `unsupported_operator`, 1 `fulfilled` und 1
`missing_input`. Die einzelne fehlende Eingabe war exakt
`supplements.substance_group_membership` an
`wr_drug_chelation_timing`.

`[cmd]` Die Eingabe fehlte tatsaechlich; sie war nicht unter einem
anderen Namen vorhanden. `supplements.supplement_groups` enthaelt nur
die drei Produktgruppen `supplement`, `enhanced` und `peptide`; der
von der Regel verlangte Schluessel `grp_chelating_minerals` kam dort
0-mal vor. Die Kategorie `mineralstoffe` hat 36 Katalogeintraege und
waere daher als Ersatz fachlich zu breit.

`[cmd]` Die acht Mitgliedschaften sind ohne Zuordnungsrat aus der
weiterhin importierten Kimi-Regel `wr_chelation_timing` abgeleitet:
Magnesium glycinate/citrate/oxide, Calcium citrate/carbonate, Iron
ferrous sulfate/bisglycinate und Zinc gluconate. Diese Regel nennt
dieselben acht `substance_ids` explizit; der neue
`wr_drug_chelation_timing` nennt ausschliesslich die gemeinsame
Gruppe.

Gebaut:

- `supabase/migrations/20260829003109_c327_substance_group_membership.sql`:
  reine Struktur fuer `supplements.substance_group_memberships`, mit
  Fremdschluessel, RLS, `authenticated`-Leserecht und
  `service_role`-Schreibrecht. Der Migrationswaechter ist gruen; keine
  Datenoperation liegt in der Migration.
- Kettenschritt `327` wertet Gruppen nur fuer Regeln ohne explizite
  `substance_ids` aus. Bestehende Regeln mit expliziten IDs behalten
  ihren bisherigen Pfad. `327a` leitet die acht Zeilen wiederholbar aus
  `wr_chelation_timing` ab und bricht bei einer anderen Quell- oder
  Zielzahl ab.

`[cmd]` **Klonnachweis:** Vollstaendiger Lauf in `lumeos_c327`, 131
Schritte, 168,5 s, ohne Live-Schreibzugriff. Der frische Klon enthaelt
absichtlich kein Pruefkonto; das bekannte Konto
`test-user@lumeos.local` wurde dort mit seiner bestehenden UUID
angelegt und nach seinem echten Erfassungsweg befuellt. Der
Klon-Auth-Stub brauchte nur fuer diese RLS-nahe Probe `USAGE` auf
`auth`; das war nicht Teil der Aenderung und wurde nie live gesetzt.

`[cmd]` **Vorher/Nachher mit Levothyroxine plus Calcium citrate:** Vor
der achtzeiligen Gruppenableitung war die Zielregel
`missing_input` mit
`{supplements.substance_group_membership}`. Danach war sie
`fulfilled` ohne fehlende Eingabe. Die 64 Zustandszahlen wechselten
von 1 `fulfilled`, 1 `missing_input`, 39 `not_fulfilled`, 23
`unsupported_operator` zu 2, 0, 39, 23. Der Vergleich der anderen 63
Regeln ergab 0 Zustandsaenderungen.

`[cmd]` **Negativprobe:** Mit derselben Levothyroxine-Erfassung und
Boron (`sub_057f2c3be5`, kein Mitglied der Gruppe) war die Zielregel
`not_fulfilled`, `missing_inputs = {}` und `stack_groups = []`. Die
Gruppe erweitert also nicht pauschal auf die Kategorie Mineralstoffe.

`[cmd]` `schema-vollstaendigkeit-pruefen.ts` im Klon: 33/33 Tabellen,
33/33 RLS/Policies und 37/37 Grants; die neue Tabelle hat 8/8
Mindestzeilen. `kette-readme-pruefen.ts` meldet weiterhin 41 bereits
vorhandene README-Abweichungen; C-327 hat keine weitere erzeugt.

`[cmd]` Die neue Migration wurde nach einem zweiten frischen
Kettenlauf direkt gegen `lumeos_c327_migration` angewendet: erfolgreich,
RLS weiter aktiv und weiterhin genau 8 Mitgliedschaften. Auch dieser
Klon wurde danach verworfen.

**Grenze des Nachweises:** `medical.user_medications` hat keine
Einnahmezeit, und die unveraenderte Regel kennt nur Medikamentenklasse
und Stack-Gruppe. Sie kann deshalb eine moegliche gleichzeitige aktive
Planung erkennen, nicht belegen, dass beide Einnahmen zur selben Uhrzeit
erfolgen. Die Warnung bleibt damit, wie ihr Text sagt, ein Hinweis zur
Pruefung des Tagesplans; eine zeitgenaue Warnung braeuchte einen
gesonderten Daten- und Regelauftrag.

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Live unveraendert bei 39 / 23 / 1 / 1** — der Umbau liegt in
der Kette, nicht eingespielt. **Richtig.**

`[read]` **Die Gruppenmitgliedschaft war nicht *,,fehlend"*, sondern
unverknuepft** — genau die Unterscheidung, um die der Auftrag
gebeten hatte. `[cmd]` **Acht belegte Kimi-Zuordnungen**, getrennt von
den drei Produktgruppen.

`[cmd]` **Beide Richtungen belegt:** Levothyroxin plus Calcium
erfuellt die Regel, mit Boron bleibt sie `not_fulfilled`. **Die
anderen 63 Zustaende unveraendert.**

`[read]` **Und die fachliche Grenze ist benannt statt uebergangen:**
**es fehlt die Medikamenten-Einnahmezeit.** `[read]` Eine
Chelatbildner-Warnung haengt am Zeitfenster — **ohne Uhrzeit kann die
Regel nur sagen, dass beides genommen wird, nicht ob es sich
stoert.**

`[read]` **Damit ist der letzte `missing_input` behoben und ein
neuer Befund an seiner Stelle.** **Als C-337 angelegt.**

**Abgenommen.**

