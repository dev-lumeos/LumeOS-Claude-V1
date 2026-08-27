---
nr: C-114
typ: befund
modul: coach
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: F-04
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/spezifikation/recherche-coach-portale.md"]
zahlen: null
---

# C-114 - Was das Vorgaengerrepo beim Coach falsch machte

## Befund

(neu
  2026-08-19). **Vier Entscheidungen fuer Tom.** Aus der F-04-Recherche
  (`docs/spezifikation/recherche-coach-portale.md`, 477 Zeilen).

  ### `056_coach_autonomy` — die Mechanik trug, die Governance nicht

  `[cmd]` **Fuenf Stufen je Modul** (Training, Nutrition, Recovery,
  Supplements; Vorgabe 2) **plus `safety_level` 1–3**, im Buddy-Code
  real durchgesetzt.

  `[read]` **Aber:** *„Die Stufen setzt der Coach selbst per `PUT`, ohne
  Bestaetigung des Klienten — genau umgekehrt zu Toms
  C-95-Vorgabe."*

  `[cmd]` **Und es existieren vier konkurrierende
  Autonomie-Repraesentationen** — zwei davon (`coach_autonomy_settings`,
  `client_autonomy`) **werden vom Code benutzt, obwohl keine Migration
  sie je anlegt.**

  ### `coach_pending_actions` ist Toms Muster — aber nicht uebernehmbar

  `[cmd]` **Vorschau, 10-Minuten-Verfall, `confirmed_at`**, daneben
  `coach_action_log` mit Undo. **Genau *„mit Bestaetigung des Users"*.**

  `[read]` **Gebaut fuer den Einzelnutzer-Betrieb:** *„hartkodierte
  Default-User-UUID, keine Akteursspalte, keine RLS. Muster
  uebernehmbar, Tabelle nicht."*

  ### Die Widerrufsfrage ist praeziser als C-71 sagte

  `[cmd]` **`user_preference_audit` (043) existiert** — alt, neu,
  Quelle, Grund. **Aktionen haben mit `coach_action_log` und
  `intervention_log` eine Spur.**

  `[cmd]` **Fuer Rechte- und Autonomie-Aenderungen gibt es nichts** —
  **und das dokumentierte `coach_client_autonomy_log` hat nachweislich
  keine Migration.**

  `[read]` *„Das Wissen lag vor, kam aber nie in die Datenbank."*

  ### Was trotzdem fehlte — der Grund fuer den Neubau

  `[cmd]` **Der Klient hatte keine Stimme** — *„Seed vergibt sogar
  Medical-Einwilligung per Skript."*

  `[cmd]` **RLS war auf den Coach-Tabellen Attrappe** — `USING (true)`
  oder ganz fehlend.

  `[read]` **Und es gab keinen Mechanismus, der eine neue Antwort
  zwang, die alte abzuloesen** — *„jede Welle baute neu."*
