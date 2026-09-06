---
nr: G-357
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-355
entscheidung: E-54
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [goals.goal_phases]
zahlen:
  gemessen: 2026-09-07
  phasenarten: 9
  zeilen: 5
---

# G-357 — kein Weg in eine Phase

## Befund

Aus G-355, Claude Code, 2026-09-07.

`[cmd]` **Keine der neun Phasenarten hat einen Schreibweg.**

    fat_loss, lean_bulk, maintenance, recomp,
    contest_prep, reverse_diet, expert_bb_annual,
    mini_cut, peak_week

`[cmd]` **`goal_phases` hat gar kein Insert** — **die fuenf Zeilen
sind Testdaten** (C-383).

`[cmd]` **Und die Tabelle traegt eine Zustandsmaschine:**
`transitioned_from`, `recommended_next`, `transition_reason`,
`projected_end_date`, `actual_end_date`, `variant`,
`parameters jsonb`.

`[read]` **Das ist der Kern von Toms Beobachtung:** `[read]` *,,da
hatten wir auch advanced stuff drin nicht nur so 0815 goals."*

`[read]` **Der advanced stuff steht im Schema und ist nicht
erreichbar.**

## Was zuerst zu klaeren ist

`[read]` **Ein Phasenwechsel ist kein Formular** — **er ist ein
Uebergang.**

`[read]` **Wer von `lean_bulk` nach `mini_cut` wechselt, hat einen
Grund** — `transition_reason` **ist dafuer da.**

`[read]` **Und `recommended_next` deutet an, dass das System
vorschlagen soll** — **wer schlaegt vor, und woraus?**

`[cmd]` **E-54: die Zeitachse gehoert zu den Zielen.** `[cmd]`
**E-67: die Phasenplanung gehoert in Goals, nicht ins Onboarding.**

`[read]` **Was fehlt, ist die Entscheidung, ob der Nutzer waehlt oder
das System vorschlaegt.**

## Auftrag — vier Schreibwege

**Mitbeauftragt: G-356, C-379.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

`[read]` **Ein Paket, weil Tom fuer eine Weile weg ist.**
`[read]` **Alle vier tragen denselben Mangel: die Ansicht steht, das
Eintragen fehlt.**

### 1 · G-357 — der Phasenwechsel

`[cmd]` **`goal_phases` hat gar kein Insert** — **die fuenf Zeilen
sind Testdaten** (C-383).

`[cmd]` **Neun Phasenarten im CHECK, und eine Zustandsmaschine:**
`transitioned_from`, `recommended_next`, `transition_reason`,
`projected_end_date`, `actual_end_date`, `variant`,
`parameters jsonb`.

`[read]` **Bau den einfachen Fall:** **eine Phase beginnen, eine
beenden, mit Grund.**

`[read]` **`recommended_next` bleibt leer** — **wer vorschlaegt, ist
nicht entschieden.** `[read]` **Melde, was ein Vorschlag
braeuchte.**

`[cmd]` **E-54 und E-67 gelten.**

### 2 · G-356 — die Umfangserfassung

`[cmd]` **13 Messpunkte, links und rechts getrennt, 54 Zeilen im
Bestand, kein Schreibweg.**

`[cmd]` **`body_measurements` hat den Weg schon** — **15 von 17
Spalten schreibbar, `ffmi` vollstaendig angeschlossen.**

`[read]` **Nimm ihn als Vorlage.** `[cmd]` **`measurement_source`
und `source_detail` wie ueberall.**

### 3 · C-379 — `sequence` braucht einen Folgeplan

`[cmd]` **Du hast gemessen: `next_plan_id` und die Checks
existieren, aber kein Schreibweg kann einen Folgeplan setzen.**

`[read]` **Dieselbe Klasse** — **ein Feld ohne Weg.**

`[cmd]` **E-62: `days_count` ist die Laufzeit.**

### 4 · Der Vorrat: greift der Abzug?

`[cmd]` **C-408 hat `nutrition.user_inventory` gebaut, mit Abzug
beim Erfassen.**

`[cmd]` **`test-user` hat jetzt sieben Mahlzeiten** (C-241).

`[read]` **Miss, ob der Vorrat dort gesunken ist.** `[read]` **E-65:
der Vorrat ist ein Anhaltspunkt** — **aber einer, der sich nie
aendert, ist keiner.**

### Was nicht zu tun ist

**Keine Oberflaeche bauen** — **das sind UI-Auftraege.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet dort an C-418.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    goal_phases     eine Phase begonnen und beendet, gezaehlt
    Uebergang       transition_reason gesetzt, belegt
    Umfaenge        13 Punkte eintragbar, links/rechts getrennt
    next_plan_id    ein Folgeplan gesetzt und gelesen
    Vorrat          eine Mahlzeit senkt menge_g, gemessen
    RLS             je Tabelle in beide Richtungen

## Bericht

2026-09-06, Codex.

`[cmd]` Die 158 Schritte der lokalen Aufbaukette liefen vollstaendig in
`lumeos_g357_verify2` durch: `KETTE OK: 300.7s`, Abschlusspruefung
`SCHEMA VOLLSTAENDIG`. Der Nachweis lief ausschliesslich gegen diese
Wegwerf-Datenbank.

`[cmd]` **G-357:** Die eingeloggte Testnutzerin begann genau eine
`lean_bulk`-Phase und beendete genau diese wieder. `transition_reason`
ist `G357 planmaessig beendet`; `recommended_next` ist NULL.

`[cmd]` **G-356:** Ein Umfangssatz schrieb alle 13 Punkte. Getrennt
belegt sind u. a. Oberarm links/rechts `39/40` und Oberschenkel
links/rechts `61/62`; `measurement_source=manual` und
`source_detail=G-356 Testmessung` blieben erhalten.

`[cmd]` **C-379:** `meal_plan_set_next_plan` setzte einen eigenen
Folgeplan und las dessen ID wieder. Die Laufzeit des Ausgangsplans blieb
bei `days_count=28`.

`[cmd]` **Vorrat:** Eine vorhandene Vorratszeile sank beim Eintragen
eines Meal-Items von `menge_g=500` auf `375`. Eine Mahlzeit erzeugt
keine Vorratszeile von selbst: der Vorrat bleibt der explizit angelegte,
symbolische Anhaltspunkt aus C-408/E-65.

`[cmd]` Für alle vier betroffenen Tabellen wurde RLS in beide Richtungen
geprüft: die zweite Testnutzerin las weder Phase noch Umfang, Plan oder
Vorrat der ersten. Der Nachweis-Test hat 2/2 Fälle grün.

`[cmd]` Die drei Pipeline-Schritte `058b`, `111` und `112` sind in die
lokale Dev-Datenbank eingespielt. Alle vier RPC-Signaturen sind vorhanden.
Je Goals-Tabelle stehen fünf Policies: die vier Eigentümer-Policies plus
die spätere Coach-Lesepolicy. Der Selbstcheck prüft deshalb die
verpflichtenden Policy-Namen statt fälschlich die Gesamtzahl.

`[cmd]` `pnpm gate` ist grün: 15/15 Tasks, 1.500 Web-Tests grün,
Typecheck und Build grün. Nicht gestaged, nicht committed.

`[read]` Ein Vorschlag für `recommended_next` braucht noch eine
Produktentscheidung: welche Eingaben (Ziel, Fortschritt, Dauer,
Messwerte und Präferenz) ihn bestimmen, ob er regelbasiert oder
modellsuggestiert ist und wie Begründung sowie Nutzer-Übersteuerung
gespeichert werden. Bis dahin bleibt das Feld absichtlich leer.

## Abnahme

_(vom Orchestrator)_
