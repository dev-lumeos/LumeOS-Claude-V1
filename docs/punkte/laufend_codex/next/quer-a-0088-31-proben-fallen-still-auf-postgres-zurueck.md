---
nr: A-88
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-01

braucht: []
kind_von: A-77

quellen:
  - docs/punkte/erledigt/quer-a-0077-werkzeugtests-liefen-nirgends.md

beruehrt:
  dateien:
    - supabase/_pipeline/_validierung/

zahlen:
  gemessen: 2026-10-01
  namen_lumeos_database: 70
  dateien_mit_rueckfall: 83
  davon_validierung: 42
---

# 31 Proben fallen still auf postgres zurueck

## Auftrag — Kopf

    AUFTRAG FUER Codex - A-88: kein stiller Rueckfall auf postgres,
                              ein Vertrag statt siebzig Namen
    Bereich: supabase/_pipeline/
             supabase/_pipeline/_validierung/
             tools/ (nur falls der Waechter dort hingehoert - melden,
             wohin, bevor du ihn legst)
    Fremd:   apps/ gehoert Claude Code (G-578 laeuft dort). docs/
             gehoert dem Orchestrator, auch diese Punktdatei: der
             Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und deinen eigenen Bericht
zu A-77/A5 — die Zahl 31 stammt von dort und ist enger gezaehlt als die
Zahlen unten.

## Der Befund

`[cmd]` **Gemessen bei A-77/A5:** **70 Dateien tragen 70 verschiedene
`LUMEOS_*_DATABASE`-Variablennamen.** 35 laufen formal auch ohne
Variable — **31 davon nur, weil sie still auf `postgres` zurueckfallen.**

`[read]` **Das ist die schlimmste Form eines Nachweises:** die Probe
laeuft, sie wird gruen, und sie hat gegen die falsche Datenbank
gemessen. **Ein fehlender Wegwerf-Name darf nicht unbemerkt die
Basisdatenbank waehlen** — und die Projektregel sagt ausdruecklich: nie
gegen die laufende Datenbank testen.

`[cmd]` **Dazu drei Dateien, die `-d postgres` fest im Test tragen** —
die sind nicht einmal umleitbar.

`[read]` **Codex hat die Frage gegen seinen Auftrag beantwortet:** die
Kette **koennte** alle 70 Namen setzen und **sollte** es nicht. Der
bestehende Vertrag `PGDATABASE` reicht. **Das ist die richtige Antwort,
weil 70 Namen 70 Orte sind, an denen einer fehlen kann.**

## Heute nachgezaehlt — der Befund ist groesser als die Ueberschrift

`[cmd]` **Gezaehlt am 2026-10-01 in `supabase/_pipeline/`:**

    LUMEOS_*DATABASE, verschiedene Namen            70
    Dateien, die so einen Namen tragen              70
    Dateien mit  ?? 'postgres'  als Rueckfall       83
      davon Form  process.env.PGDATABASE ?? '...'   80
      davon unter _validierung/                     42

`[read]` **Die 31 aus der Ueberschrift sind die Teilmenge, die ohne jede
Variable durchlaeuft.** Der Rueckfall selbst steht in 83 Dateien — jede
davon waehlt die Basisdatenbank, sobald die Variable fehlt. **Die
Ueberschrift bleibt stehen, weil sie den Anlass nennt; die Arbeit richtet
sich nach der groesseren Zahl.**

`[cmd]` **Und `-d postgres` steht in sechs Dateien, aber in
Kommentarzeilen** — Aufrufbeispiele in `_validierung/` und
`_testdaten/`, keine ausfuehrende Zeile:

    _validierung/coach-lesepfad-pruefen.sql:8
    _testdaten/coach-portal-fuellen.sql:4
    _testdaten/eigenes-konto-fuellen.sql:4
    _testdaten/380_seed_meal_plan_variety.sql:4
    _testdaten/medical-nachweis-aus.sql:5
    _testdaten/medical-nachweis-an.sql:4

`[read]` **Pruef das nach, statt es zu uebernehmen.** Ein Beispiel im
Kommentar ist harmlos fuer den Lauf und schaedlich fuer den Menschen, der
es kopiert. **Melde, welche davon ausfuehren und welche nur dastehen** —
und richte die Beispiele mit, wenn du schon dort bist.

## Was zu tun ist

**A1 — fail-closed.** Fehlt der Datenbankname, bricht die Probe ab und
sagt warum. **Kein Rueckfall, auch kein freundlicher.**

**A2 — auf einen Vertrag zusammenziehen.** `PGDATABASE` statt 70
eigener Namen. `[read]` **Je Datei einzeln, nicht pauschal ersetzt** —
eine Probe, die ihren Namen aus einem Grund traegt, nennt den Grund.

**A3 — die drei festverdrahteten umleitbar machen.** `[cmd]` **Heute
finde ich sie nur in Kommentaren** (Liste oben) — wenn du eine
ausfuehrende Zeile findest, ist das der Fund, und er gehoert gemeldet.

**A4 — einen Waechter, der es haelt.** `[read]` **Sonst kommt es
zurueck** — eine Regel, die nirgends nachgezaehlt wird, wird zur
Empfehlung. **Zu belegen in beide Richtungen:** mit einem eingebauten
Rueckfall muss er rot werden.

**A5 — ein Satz dazu, wie die Kette den Namen setzt.** `[cmd]` Seit A-90
steht die Standardkette auf Restore statt Vollaufbau, und A-91 laeuft
gerade darauf. **Wenn fail-closed greift, muss der Standardlauf den
Namen sicher setzen** — sonst bricht morgen die ganze Kette statt einer
Probe. **Das ist der Teil, der vor dem Umbau geprueft gehoert, nicht
danach.**

**Nicht Teil:** welche Proben ueberholt sind (A-87) und der fehlende
Bestand (A-86).

**Zu belegen:** Zaehlung vorher und nachher · der Waechter mit Sabotage
in beide Richtungen · ein Lauf, der ohne Variable abbricht, mit der
Meldung · `pnpm gate` gruen mit Testzahl · nichts committen.

`[read]` **Kein voller Kettenlauf als Nachweis** (00-LIESMICH.md). Was
die Kette betrifft, belegst du mit dem Standardlauf-Restore, nicht mit
`kette-voll.json`.
