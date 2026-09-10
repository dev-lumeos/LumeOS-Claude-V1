// Der Feldabgleich der drei Bereiche — G-402/A1 bis A4.
//
// **Tom, 2026-09-08:** *„gib ihm alles, ich will endlich resultate
// sehen."*
//
// ══ GEGEN WAS GEMESSEN WIRD ═════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-10 im Vorgaengerrepo**, Datei fuer
// Datei, Feld fuer Feld:
//
//     ClientList.tsx     13.123 B   die Liste
//     ClientDetail.tsx   38.249 B   die Akte
//     CheckinList.tsx    13.470 B   die Check-ins
//     AlertsPanel.tsx     7.569 B   die Alerts
//
// `[read]` **Struktur ja, Code nie** — gelesen wurde, WELCHE Felder
// eine Zeile traegt, nicht wie sie gebaut ist.
//
// ══ WAS DIE DATENBANK HERGIBT ═══════════════════════════════════════
//
// `[cmd]` **`coach.relationships` fuehrt 17 Spalten** — und darunter
// **kein Ziel, keine Tags, keine Gebuehr**: gemessen mit einer Suche
// ueber alle Schemata nach `goal|tag|fee|monthly`. **Was das Altrepo
// je Klient zeigte, hat hier keine Spalte.**
//
// `[cmd]` **Zwei Treffer gab es doch:** `public.profiles.nutrition_goal`
// (das Ernaehrungsziel, nicht das Coachingziel) und
// `supplements.daily_intake_summary.compliance_pct` (Einnahmetreue,
// nicht Trainingsadherence). `[read]` **Gleicher Name, andere
// Sache** — beide sind hier NICHT die gesuchte Groesse.

import type { Feld, KartenAbgleich } from './feld-abgleich'

/**
 * Die vier Abgleiche dieses Auftrags.
 *
 * `[read]` **Dieselbe Form wie `ABGLEICH` aus G-400** — damit die
 * Zaehlung beider Auftraege zusammenpasst und ein Waechter beide
 * gleich pruefen kann.
 */
export const BEREICHE_ABGLEICH: KartenAbgleich[] = [
  {
    reiter: 'klienten',
    titel: 'Klientenliste (ClientList)',
    quelle: 'module-coach-athlete.jsx:1',
    felder: [
      { name: 'Avatar (Initialen)', da: true },
      { name: 'Statuspunkt am Avatar', da: true },
      { name: 'Name', da: true },
      { name: 'E-Mail', da: true },
      { name: 'Ziel', da: false, grund: 'keine-daten',
        fehlt: 'coach.relationships fuehrt kein Ziel — 17 Spalten, keine '
          + 'davon. public.profiles.nutrition_goal ist das '
          + 'Ernaehrungsziel, nicht das Coachingziel' },
      { name: 'Tags', da: false, grund: 'keine-daten',
        fehlt: 'keine Spalte fuer Tags je Beziehung' },
      { name: 'Status', da: true },
      { name: 'Alertzahl', da: true },
      { name: 'ungelesene Nachrichten', da: true },
      { name: 'Monatsgebuehr', da: false, grund: 'keine-daten',
        fehlt: 'kein Geld im Portal — Marketplace (F-06 T8)' },
      { name: 'letzte Sitzung', da: true },
      { name: 'Suche', da: true },
      { name: 'Statusfilter', da: true },
      { name: 'Sortierung', da: false, grund: 'form',
        fehlt: 'ohne Ziel und Gebuehr bleiben Name und Datum — zwei '
          + 'Ordnungen, fuer die eine Auswahl zu viel waere' },
      { name: 'Klick in die Akte', da: true },
      { name: 'Neuen Klienten anlegen', da: false, grund: 'keine-daten',
        fehlt: 'die Anbahnung ist T3 (offen) — coach.pending_invites '
          + 'steht, aber ohne Schreibweg' },
    ],
  },
  {
    reiter: 'klienten',
    titel: 'Klientenakte (ClientDetail)',
    quelle: 'module-coach-athlete.jsx:176',
    felder: [
      { name: 'Name und Beziehungsstand', da: true },
      { name: 'Rechte je Modul (7 Achsen)', da: true },
      { name: 'Autonomiestufen (8 Achsen)', da: true },
      { name: 'Historie der Rechte', da: true },
      { name: 'Historie der Autonomie', da: true },
      { name: 'Check-ins des Klienten', da: true },
      { name: 'Alerts des Klienten', da: true },
      { name: 'offene Vorschlaege', da: true },
      { name: 'Verlauf der Aktionen', da: true },
      { name: 'Trainingseinheiten', da: true },
      { name: 'Adherence-Kurve', da: false, grund: 'keine-daten',
        fehlt: 'keine Adherence je Klient — services/adherence.ts (20,8 KB) '
          + 'rechnete sie im Altrepo aus Plan gegen Ist; es gibt weder '
          + 'Plan noch Rechnung' },
      { name: 'Gewichtsverlauf', da: false, grund: 'rechenbar',
        fehlt: 'body_measurements steht und wird je Athlet gelesen — '
          + 'die Kurve ist nicht gebaut' },
      { name: 'Notizen des Coaches', da: false, grund: 'keine-daten',
        fehlt: 'coach.checkins.coach_notes gibt es je Check-in, aber '
          + 'keine freie Notiz je Klient' },
    ],
  },
  {
    reiter: 'checkins',
    titel: 'Check-ins (CheckinList)',
    quelle: 'CheckinList.tsx',
    felder: [
      { name: 'Athlet', da: true },
      { name: 'Faelligkeit', da: true },
      { name: 'Status', da: true },
      { name: 'Antworten des Klienten', da: true },
      { name: 'automatische Daten', da: true },
      { name: 'Notiz des Klienten', da: true },
      { name: 'Rueckmeldung des Coaches', da: true },
      { name: 'Statusfilter', da: true },
      { name: 'Wochennummer', da: false, grund: 'keine-daten',
        fehlt: 'coach.checkins hat kein week_number — 16 Spalten, '
          + 'gemessen' },
      { name: 'Rueckmeldung schreiben', da: false, grund: 'keine-daten',
        fehlt: 'kein Schreibweg — die Spalte coach_feedback steht, '
          + 'aber keine Funktion fuellt sie' },
    ],
  },
  {
    reiter: 'alerts',
    titel: 'Alerts (AlertsPanel)',
    quelle: 'AlertsPanel.tsx',
    felder: [
      { name: 'Titel', da: true },
      { name: 'Sachverhalt', da: true },
      { name: 'Athlet', da: true },
      { name: 'Zeitpunkt', da: true },
      { name: 'Modul', da: true },
      { name: 'Zahlen (metric)', da: true },
      { name: 'Status', da: true },
      { name: 'gelesen markieren', da: true },
      { name: 'erledigt markieren', da: true },
      { name: 'Filter nach Status', da: true },
      { name: 'Stufe (critical/warning/info)', da: false, grund: 'keine-daten',
        fehlt: 'coach.alerts hat keine Spalte fuer die Stufe — 13 Spalten, '
          + 'gemessen. Das Altrepo fuehrte `level`' },
      { name: 'Kategorie', da: false, grund: 'keine-daten',
        fehlt: 'keine Spalte `category` — `module` ist das Naechste, '
          + 'aber es benennt das Fachgebiet, nicht die Art des Alarms' },
      { name: 'Filter nach Stufe', da: false, grund: 'keine-daten',
        fehlt: 'ohne Stufe kein Filter darauf' },
    ],
  },
]

/**
 * Was ein Erzeuger braeuchte — A4, gemeldet statt gebaut.
 *
 * `[cmd]` **`alertGenerator.ts` (12,9 KB) fuehrt FUENF Pruefungen**
 * (`checkInactivity`, `checkAdherence`, `checkSafetyIssues`,
 * `checkProgressStagnation`, `checkEngagement`), dazu eine
 * Doppelsperre ueber 24 Stunden und Einstellungen je Coach.
 *
 * `[read]` **Das ist ein Codex-Auftrag** — er schreibt in
 * `coach.alerts`, und Schreibwege gehoeren nicht hierher.
 */
export const ERZEUGER_BEDARF: Array<{ was: string, fehlt: string }> = [
  {
    was: 'Stufe je Alarm (critical / warning / info)',
    fehlt: 'eine Spalte `severity` in coach.alerts, mit CHECK — heute '
      + 'gibt es nur `status` (open/read/done)',
  },
  {
    was: 'Art des Alarms (Inaktivitaet, Adherence, Sicherheit, '
      + 'Stagnation, Beteiligung)',
    fehlt: 'eine Spalte `kind` — `module` benennt das Fachgebiet '
      + '(nutrition, training), nicht den Anlass',
  },
  {
    was: 'Doppelsperre: derselbe Anlass nicht zweimal in 24 h',
    fehlt: 'ein eindeutiger Schluessel aus (client_id, kind, Tag) — '
      + 'oder eine Abfrage im Erzeuger vor dem Schreiben',
  },
  {
    was: 'Einstellungen je Coach: welche Pruefung, welche Schwelle',
    fehlt: 'eine Tabelle fuer Coach-Einstellungen — dieselbe, die '
      + 'schon G-398 fuer „Settings" und „Coach settings" vermisst',
  },
  {
    was: 'Adherence als Zahl',
    fehlt: 'services/adherence.ts rechnete Plan gegen Ist — es gibt '
      + 'weder Plantabelle noch Rechnung',
  },
]
