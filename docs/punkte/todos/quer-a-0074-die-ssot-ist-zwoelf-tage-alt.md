---
nr: A-74
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - tools/punkte-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  dateien: 171
  commits_offen: 112
  tage: 12
---

# A-74 — die SSOT ist zwoelf Tage alt

## Befund

Tom, 2026-09-08: *,,das kommt alles in ssot ? du pflegst das alles
darin?"*

`[read]` **Nein. Und das ist der Befund.**

`[cmd]` **`docs/ssot/00-INDEX.md`:**

> *,,Dieser Ordner ist die einzige verbindliche Beschreibung des
> Ist-Zustands."*

    Rangfolge bei Widerspruch:
    1  Code (verifiziert per Befehl)
    2  docs/ssot/
    3  docs/specs/  (beschreibt das Ziel, nicht den Ist-Zustand)
    4  alles andere

`[cmd]` **Letzter Commit in `docs/ssot/`: 2026-08-27.**

`[cmd]` **Seither 112 Commits in `supabase/` und `apps/`.**

`[cmd]` **171 Dateien, die meisten vom 17. bis 19.08.**

`[read]` **Zwoelf Tage Ist-Zustand fehlen in der Datei, die den
Ist-Zustand beschreiben soll.**

## Was fehlt, in Auswahl

    Wallet-Schema             13 Tabellen (C-419)
    Recovery-Tabellen         4 neue (C-421)
    Medical-Ablage            appointments, health_events,
                              health_timeline, Bucket (C-429/431)
    activity_stream           6 Module, drei Sprachen (C-412/430)
    vier Schreibwege          Phasen, Umfaenge, Folgeplan,
                              Vorratsabzug (G-357/356/C-379)
    Stack-Vorlagen            6 Tabellen (C-423)
    Coach-Schreibwege         RPC statt Tabelle (G-324/C-268/269)
    active_goal_create        atomarer Platz (C-432)
    85 Reiter mit Referenz    E-69 durchgezogen (G-365/375)

## Warum es passiert ist

`[read]` **Der Orchestrator schreibt nach `docs/punkte/` und
`docs/entscheidungen/`** ? **beides gepflegt, beides taeglich.**

`[cmd]` **`docs/entscheidungen/`: 76 Dateien, E-64 bis E-76 in zwei
Tagen.**

`[read]` **`ssot/` steht daneben und wird nicht angefasst** ?
**weil kein Waechter sie prueft und kein Ablauf sie nennt.**

`[cmd]` **`punkte-pruefen.mjs` misst 25 Befunde und den
Kettenlauf** ? **nicht das Alter der SSOT.**

## Zu klaeren

**1 ? Braucht es sie noch?**

`[read]` **`docs/punkte/erledigt/` traegt inzwischen dieselbe
Information** ? **je Punkt, mit Messungen und Commit-Hash.**

`[read]` **Eine zweite Ablage, die dasselbe sagt, sagt es
irgendwann anders.**

**2 ? Oder wird sie erzeugt?**

`[cmd]` **`punkte-index.mjs` erzeugt `00-INDEX.md` aus den
Punktdateien.**

`[read]` **Dasselbe waere fuer den Ist-Zustand moeglich** ? **aus
`erledigt/` je Modul, mit Datum und Commit.**

**3 ? Und ein Waechter.**

`[read]` **Was nicht geprueft wird, verfaellt** ? **das ist die
Lehre aus 171 Dateien, die niemand mehr liest.**
