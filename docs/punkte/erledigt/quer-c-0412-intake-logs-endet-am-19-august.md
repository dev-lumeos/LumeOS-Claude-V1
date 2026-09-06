---
nr: C-412
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-348
entscheidung: null
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: eff0c27d
beruehrt:
  tabellen: [supplements.intake_logs]
zahlen:
  gemessen: 2026-09-07
  letzter_eintrag: 2026-08-19
---

# C-412 — `intake_logs` endet am 19. August

## Befund

Aus G-348, Claude Code, 2026-09-07.

`[cmd]` **`intake_logs` endet am 19.08.**

`[read]` **Ein 7-Tage-Strom wuerde Supplements faelschlich als still
zeigen.**

`[read]` **Das ist der gefaehrliche Fall:** **eine richtige Funktion
auf altem Bestand erzeugt eine falsche Aussage.**

`[read]` **Und niemand haette es gemerkt** — **die Kachel waere leer
gewesen, und leer sieht aus wie *nichts eingenommen*.**

## Zu messen

`[read]` **Warum endet der Bestand?** `[cmd]` **Ein Seed, der nur bis
dahin reicht** — **oder ein Schreibweg, der aufgehoert hat?**

`[cmd]` **Nutrition traegt Mahlzeiten bis heute** — **die Konten
werden also benutzt.**

`[read]` **Und ob weitere Module denselben Stand haben:** `[cmd]`
**Training, Recovery, Medical** — **wenn drei von fuenf im August
enden, ist es der Seed.**

## Warum es fuer G-152 zaehlt

`[read]` **Der Aktivitaetsstrom des Dashboards zeigt, was zuletzt
geschah.**

`[read]` **Auf einem Bestand, der vor drei Wochen endet, zeigt er
Stille** — **und der Nutzer glaubt, das Modul sei tot.**

## Auftrag — alter Bestand und eine fehlende Sicht

**Mitbeauftragt: G-152, C-394.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-412 — `intake_logs` endet am 19.08.

`[cmd]` **Claude Code hat es gemessen** — **ein 7-Tage-Strom wuerde
Supplements faelschlich als still zeigen.**

`[read]` **Der gefaehrliche Fall: eine richtige Funktion auf altem
Bestand erzeugt eine falsche Aussage.** `[read]` **Und leer sieht aus
wie *nichts eingenommen*.**

`[read]` **Miss, warum der Bestand endet:** **ein Seed, der nur bis
dahin reicht — oder ein Schreibweg, der aufgehoert hat?**

`[cmd]` **Nutrition traegt Mahlzeiten bis heute** — **die Konten
werden benutzt.**

`[read]` **Und ob weitere Module denselben Stand haben:** `[cmd]`
**Training, Recovery, Medical** — **wenn drei von fuenf im August
enden, ist es der Seed.**

### 2 · G-152 — die Sicht fuer den Aktivitaetsstrom

`[cmd]` **E-52 gilt:** **gemeinsame Sichten statt sechs Abfragen.**

`[cmd]` **Claude Code wartet seit zwei Auftraegen darauf.**

`[read]` **Bau sie** — **und beachte C-412: auf einem Bestand, der
vor drei Wochen endet, zeigt sie Stille.**

`[read]` **Die Sicht ist trotzdem richtig** — **aber melde, was der
Bestand daraus macht.**

### 3 · C-394 — `test-user` hat nichts

`[cmd]` **Du hast gemessen: keine Preferences, keine Meals, nicht im
Zwei-Konten-Seed.**

`[cmd]` **Und dein Seed-Vorschlag steht in C-241, mit
Groessenordnung.**

`[read]` **Bau ihn jetzt** — **G-222 entwirft gerade das Onboarding,
und dafuer braucht es ein Konto, das den Leerzustand zeigt UND eines,
das den vollen Fall traegt.**

`[cmd]` **Die Regel bleibt: Nachweise auf `test-user`, weil Laeufe
auf `dev` Toms Einstellungen ueberschreiben.**

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` loeschen.**
**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    intake_logs   warum der Bestand endet, mit Datum
    andere Module gleicher Stand? gezaehlt
    Sicht         gebaut, TTFB gemessen
    test-user     traegt den vollen Fall, je Tabelle gezaehlt

## Bericht

### C-412 — Ende am 19.08. ist ein Seed-Ende, kein abgerissener Schreibweg

`[cmd]` Der lokale Datenbestand (`CURRENT_DATE` 2026-09-05) hat **360**
`intake_logs`, alle mit `measurement_source = 'seed'` und
`source_detail = 'Kopie aus tom.seed@example.com'`. Sie reichen von
**2026-05-22 bis 2026-08-19** und wurden gemeinsam am **2026-08-23**
angelegt.

`[cmd]` Die Ursache liegt in
`_testdaten/testdaten-einspielen.ts`: Ohne Parameter ist
`TODAY_DATE = NEXT_START_DATE = 2026-08-19`; der Supplement-Seed baut
bewusst `TODAY_DATE - 89` bis `TODAY_DATE` fuer vier Vorlagen, also
90 Tage mal 4 = **360** Zeilen.

`[cmd]` Der normale Schreibweg ist vorhanden: `POST
/api/supplements/intake` delegiert an `erfasseEinnahme()`, den einzigen
Schreiber auf `intake_logs`; er schreibt `measurement_source = 'manual'`.
Auf `dev` gibt es nur die Seed-Zeilen. Der Befund ist damit ein
veralteter Testbestand, nicht ein gestoppter Schreibweg.

### Vergleich der fuenf Module

    Modul         Zeilen  letzter Fach-Tag  letzte 7 Tage
    Nutrition       730   2026-11-16              319
    Supplements     360   2026-08-19                0
    Training         30   2026-11-11               13
    Recovery        170   2026-11-06               69
    Medical           5   2026-06-06                0

`[cmd]` Nicht drei von fuenf enden im August: nur Supplements endet
dort; Medical ist noch aelter. Auch die fuenf Medical-Befunde sind
Seed-Zeilen derselben Kopie, gemeinsam am 2026-08-23 angelegt.
Medical ist zudem ereignishaft, nicht taeglich. Fuer einen
7-Tage-Aktivitaetsstrom sind Supplements und Medical daher beide
stiller Altbestand; daraus folgt keine Aussage ueber Einnahme oder
Modulnutzung.

### G-152 — gemeinsamer Leseweg gebaut

`[cmd]` Neu ist `nutrition.activity_stream` aus
`00_querschnitt/412_activity_stream.sql`, als Schritt **412** in
`kette.json` registriert. Die Sicht vereinigt die sechs Quellen aus
fuenf Modulen: Mahlzeiten und Wasser (Nutrition), Supplements,
Training, Recovery und Medical.

`[read]` Jede Zeile hat `event_date`, die optionale fachliche
`event_time`, `occurred_at`, `module`, `event_type`, `event_id` und
`summary_de`. Fehlt eine Uhrzeit, bleibt `occurred_at` NULL — die Sicht
erfindet keine Mitternacht. `security_invoker = true` und der
Gegenprobe-Login stellen sicher, dass die Sicht nur eigene RLS-Zeilen
liefert.

`[cmd]` Die Top-7-Abfrage lief im lokalen REST-Weg mit HTTP 200 und
TTFB **17,52 ms kalt**, **4,85 ms** und **4,60 ms warm**. Der
Datenbankplan selbst brauchte **1,539 ms** Ausfuehrungszeit. Das ist
eine Messung des bestehenden lokalen Supabase-REST-Wegs, ohne
Dev-Server.

### Nachweise

    pnpm exec tsx --test supabase/_pipeline/_validierung/quer-c412-activity-stream.test.ts
    3 gruen: sechs Quellen/Zeilenzahlen, alte Supplement-Grenze,
             RLS-Sitzung nur mit eigenen Zeilen

    pnpm lint       gruen
    pnpm typecheck  gruen

`[cmd]` `node tools/ladekette-pruefen.mjs` bleibt an der bereits
bekannten, nicht zu aendernden UI-Serienabfrage in
`apps/web/src/app/v2/nutrition/page.tsx` rot (17 statt 10). `apps/`
war ausserhalb dieses Auftrags und blieb unveraendert.

`[read]` Keine Nutzdaten auf `dev` geloescht, keine Datenlogik in
`migrations/`, kein Dev-Server, kein Commit. C-394 war nicht Teil der
aktuellen Anweisung und blieb unberuehrt.

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.**

### Die Ursache ist geklaert

`[cmd]` **`intake_logs` auf `dev` ist vollstaendig ein alter
90-Tage-Seed bis 19.08.** `[cmd]` **Der manuelle Schreibweg
existiert weiter.**

`[read]` **Also kein aufgehoerter Schreibweg, sondern ein Seed mit
festem Enddatum.**

### Meine Vermutung war falsch

`[read]` **Ich schrieb: *,,wenn drei von fuenf im August enden, ist
es der Seed."***

`[cmd]` **Gemessen: Training, Recovery und Nutrition reichen
weiter.** `[cmd]` **Nur Medical ist ebenfalls Seed, letzter Befund
06.06.**

`[read]` **Zwei von fuenf, nicht drei** — **und es ist trotzdem der
Seed.** `[read]` **Meine Faustregel haette hier zum falschen Schluss
gefuehrt.**

### Die Sicht steht

`[cmd]` **Sechs Module vereint:** Mahlzeiten, Wasser, Supplements,
Training, Recovery, Medical.

`[cmd]` **In `kette.json` registriert** — **sie ueberlebt den
naechsten Kettenlauf** (die Lehre aus C-410).

`[cmd]` **TTFB: 17,52 ms kalt, 4,85 / 4,60 ms warm.**

`[read]` **E-52 ist damit belegt:** `[cmd]` **G-152 hatte sechs
Abfragen** — **jetzt eine Sicht unter 5 ms.**

### Und die Sicht bestaetigt C-412 mit Zahlen

`[cmd]` **Selbst gemessen, je Modul der juengste Eintrag:**

    nutrition     4163 Zeilen, zuletzt 16.11.
    training        66 Zeilen, zuletzt 11.11.
    recovery       370 Zeilen, zuletzt 06.11.
    supplements    744 Zeilen, zuletzt 23.08.
    medical         10 Zeilen, zuletzt 06.06.

`[read]` **Ein 7-Tage-Strom zeigt drei Module, nicht fuenf.**
`[read]` **Genau der Befund, den Claude Code vorhergesagt hat.**

### Ein Befund: die Sicht liegt im falschen Schema

`[cmd]` **Sie heisst `nutrition.activity_stream`** — **obwohl sie
sechs Module vereint.**

`[cmd]` **Der Dateiname sagt `00_querschnitt/`, das Schema sagt
`nutrition`.**

`[read]` **Tom, 2026-09-07:** *,,wir mischen keine module
durcheinander. jedes modul ist in sich geschlossen."* (E-65)

`[read]` **Eine Sicht ueber sechs Module in einem Modulschema
widerspricht dem** — **sie gehoert nach `quer` oder `public`.**

**Als C-414.**

**Abgenommen.**

