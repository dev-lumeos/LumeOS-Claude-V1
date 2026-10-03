---
nr: G-593
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-10-03
agent: claudecode
beauftragt: 2026-10-03
erledigt: 2026-10-03
commit: c3e2c7fd

braucht: [G-590]

quellen:
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md
  - docs/punkte/erledigt/recovery-g-0590-der-checkin-ist-der-einzige-pflichtgriff-und-er-schreibt-nicht.md

beruehrt:
  tabellen:
    - recovery.recovery_protocols
  dateien:
    - apps/web/src/app/v2/recovery/modale.tsx
    - apps/web/src/app/v2/recovery/fehlende-kacheln.tsx
---

# Die Attrappe nennt eine fehlende Tabelle — die Tabelle ist fertig und gefuellt

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-593: der Protokollknopf hat alles, was
                                     er braucht
    Bereich: apps/web/src/app/v2/recovery/
             apps/web/src/lib/recovery/
    Fremd:   supabase/ gehoert Codex. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-03

## Der Befund

`[cmd]` **`modale.tsx:1012-1013` begruendet einen `InEntwicklungKnopf`
so:**

    Protokolle brauchen eine Tabelle recovery.protocols - die gibt es
    nicht.

`[cmd]` **Woertlich richtig, sachlich irrefuehrend. Gemessen am 03.10.:**

    recovery.protocols            existiert NICHT
    recovery.recovery_protocols   existiert, 12 Spalten, 2 Zeilen,
                                  RLS an, 4 Policies

### Was die Tabelle traegt — sie ist kein Katalog, sie ist der Verlauf

`[cmd]` **Spalten:**

    id · user_id · protocol_key · name · target_condition ·
    started_on · duration_days · daily_activities · status ·
    completed_days · created_at · updated_at

`[cmd]` **`protocol_key` braucht keinen Katalog** — die vier Protokolle
stehen als CHECK im Schema:

    active_recovery_week · passive_deload ·
    sleep_optimization · injury_protocol

`[cmd]` **Dazu `status` CHECK (`active`, `completed`, `discontinued`),
`duration_days` CHECK 1 bis 31, `completed_days >= 0`,
`daily_activities` muss ein JSON-Array sein.**

`[cmd]` **Und es stehen echte Zeilen drin:**

    active_recovery_week  Active Recovery Week  active     ab 12.09.
                          7 Tage, 3 erledigt
    sleep_optimization    Sleep Optimization    completed  ab 12.09.
                          14 Tage, 14 erledigt

`[read]` **Damit fehlt dem Knopf nichts Fachliches:** vier Arten, ein
Zeitraum, ein Zustand, ein Fortschritt, eine Aktivitaetenliste je Tag.
**Was fehlt, ist der Schreib- und Leseweg in `apps/`.**

`[cmd]` **Und `apps/` weiss es sogar:**
`fehlende-kacheln.tsx:447` nennt `recovery.recovery_protocols` beim
richtigen Namen — **zwei Stellen in derselben Oberflaeche sagen
Verschiedenes ueber dieselbe Tabelle.**

## Auftrag

**A1 — erst messen, was die Tabelle verlangt, dann bauen.** `[cmd]` Die
sechs CHECKs oben gegen die Formularfelder halten, **je einzeln**. `[read]`
**Dreimal hat genau das einen falschen Aufrufer verhindert** (G-577,
G-579, G-582): die Datenbank arbeitete anders, als eine Annahme erwartet
haette. **Hier ist die Falle `daily_activities`** — ein Array, kein
Objekt, und der CHECK prueft es.

**A2 — den Schreibweg nach dem Muster von G-590.** `[read]` Eine
Schreibstelle je Ziel, Pruefregeln aus den CHECKs, Fehler in Feldfehler
uebersetzt — **`lib/recovery/checkin-write.ts` und `checkin-regeln.ts`
sind die Vorlage, die du gerade selbst gebaut hast.**

**A3 — `status` ist der Kern, nicht ein Feld.** `[cmd]` Ein Nutzer kann
mehrere Protokolle haben, aber nur eines sinnvoll `active`. **Zu messen:
gibt es dafuer einen eindeutigen Schluessel oder nicht?** `[read]`
**Wenn nicht, ist das ein Befund und kein Grund, es in der Oberflaeche zu
erzwingen** — dann nennst du es, und die Regel gehoert in die Datenbank
(Codex).

**A4 — die Begruendung berichtigen, nicht loeschen.** `[cmd]` Der Satz
*„recovery.protocols gibt es nicht"* wird zu dem, was gemessen ist.
`[read]` **Und der Widerspruch zu `fehlende-kacheln.tsx:447` wird an
beiden Stellen aufgeloest** — eine Tatsache, eine Aussage.

**A5 — HRV bleibt Attrappe.** `[cmd]` `recovery.hrv_readings` existiert
nicht, auch nicht unter aehnlichem Namen. **Der Knopf bleibt, der Test
aus G-590/A6 bleibt gruen.**

**Nicht Teil:** HRV · die vier Protokollarten inhaltlich zu definieren
(sie stehen im CHECK) · G-591 und G-592.

**Zu belegen:** die sechs CHECKs gegen die Formularfelder, je einzeln ·
die Aufruferzahl der Zielstelle vor dem Einbau, ohne Kommentare · ein
Protokoll durch die echte Oberflaeche angelegt und zurueckgelesen, auf
`test-user@lumeos.local` · Zeilenzahl vorher/nachher, danach wieder 2 ·
Bilder vorher und nachher, Attrappen je Reiter · Sabotage je Zusicherung
in beide Richtungen, **je Fundstelle gezaehlt, nicht gesucht** ·
`pnpm gate` gruen mit Testzahl · nichts committen.

## Abnahme — 2026-10-03, Commit `c3e2c7fd`

`[cmd]` **Gate gruen im Vorcommit-Haken**, 18/18. Commit `c3e2c7fd`,
11 Dateien, +535/−56. **web 2590 Tests, 0 rot** — gemessen in meinem
eigenen Gatelauf, nicht dem Bericht entnommen.

### Berichtigung — 11 neue Tests, nicht 12, und damit schliesst die Rechnung

`[cmd]` **`g593-protokoll.test.ts` traegt 11 `test(`-Bloecke**, nicht 12.
`[cmd]` **Und im ganzen `apps/web`-Diff ist kein `test(` angelegt oder
entfernt worden** — die Aenderungen an den zwei fremden Dateien betreffen
nur Zusicherungen innerhalb bestehender Proben.

`[read]` **Damit geht die Rechnung glatt auf:**

    2.579   Stand bei G-570 (Commit 96518958)
      + 11   neu in g593-protokoll.test.ts
    = 2.590  gemessen

**Der Bericht sagt ausdruecklich, er nenne keine Differenz, weil er den
Stand davor nicht gemessen hat. Das ist richtig so** — und die Differenz
nachzureichen ist meine Aufgabe, nicht seine. **Nur die 12 war falsch.**

### Was ich selbst gemessen habe

`[cmd]` **Die zwei Dateien ausserhalb des Bereichs sind beide
VERSCHAERFUNGEN, keine Lockerungen:**

    modale.tsx  <InEntwicklungKnopf                    2   (war 3)
    modale.tsx  <InEntwicklungKnopf titel="Save · 64 ms" 1  (neu gehalten)

**Die Zahl ist kleiner geworden und zugleich traegt der HRV-Knopf jetzt
eine eigene, namentliche Zusicherung.** Vorher zaehlte der Waechter nur
drei Attrappen, ohne zu sagen welche.

`[cmd]` **Der Abwesenheitswaechter bestaetigt die Entfernung des Paares:**

    [abwesenheit] 18 markierte Aussagen geprueft, alle gelten noch.

**Das Paar `recovery.protocols` musste raus** — die Marke begruendete
einen Knopf, der jetzt schreibt. Die Regel gilt weiter fuer die uebrigen
vier.

`[cmd]` **Der Live-Bestand ist wiederhergestellt**, von mir nachgelesen:

    active     1      active_recovery_week  general_recovery  12.09.
    completed  1      sleep_optimization    poor_sleep        12.09.

**Kein Rest aus dem Schreiblauf.** Er hat gezielt per `id` geloescht.

`[read]` **Die Attrappen-Erklaerung haelt:** `tools/schuss.mjs:308` ist
`locator('text=/Attrappe/i').count()` — eine Marke mit Pille und
Grundzeile zaehlt zweimal. 21 → 19 ist eine Kachel, nicht zwei.

`[read]` **`PROTOKOLL_ZUSTAND` ist genau die beschlossene Zuordnung**, an
einer Stelle, als `Record<ProtokollArt, string>` getypt. Kein Feld im
Formular, kein freier Wert.

### Befund aus der Pruefung — ein Rest, den der Bericht nicht nennt

`[cmd]` **`ACTIVE_PROTOCOL` steht noch sechsmal in `modale.tsx`**, und
vier davon sind Kommentare. **Die fuenfte ist Code:**

    modale.tsx:1046
    const isActive = protokolle ? lauf !== null : p.id === ACTIVE_PROTOCOL.id
    modale.tsx:1102/1105
    : `Day ${ACTIVE_PROTOCOL.day} of ${ACTIVE_PROTOCOL.of}`
    started {lauf ? lauf.started_on : ACTIVE_PROTOCOL.started}

`[cmd]` **Gefaehrlich ist es nicht:** `ladeProtokolle()` gibt **nie**
`null` zurueck, sondern immer einen `ProtokollStand` mit `fehler`, und
`page.tsx:76` reicht ihn immer durch. **Der Entwurfszweig ist toter
Code.**

`[cmd]` **Was dabei auffaellt und mehr zaehlt:** `fehlende-kacheln.tsx:459`
liest `protokolle.fehler` und zeigt *„Nicht geladen: …"*. **Das Modal
liest `fehler` nicht.** Bei einem Ladefehler sagt die Kachel „nicht
geladen" und das Modal zeigt den Activate-Knopf, als liefe nichts —
**zwei Aussagen zu einer Tatsache, genau das, was A4 beseitigen
sollte.** Wird ein Folgepunkt.

### Was er richtig gemacht hat, und das ist zu nennen

`[read]` **S8 war im ersten Durchgang gruen, und er hat es selbst
gemeldet** statt die Sabotage als 10/10 zu verbuchen: der Waechter suchte
`attrappe=` und uebersah die nackte Form `attrappe`. **Nachgeschaerft,
dann rot.**

`[read]` **Er hat den Vorlagensatz berichtigt** (*„Tasks can be
confirmed … ends automatically"*) statt ihn stehenzulassen — es gibt
keinen Stand je Aufgabe und keinen Trigger, der ein Protokoll beendet.

`[read]` **Und er hat A3 gemeldet statt verhindert:** kein eindeutiger
Schluessel auf `active`, die Oberflaeche sagt es dem Nutzer. **Im Lauf
ist der Fall eingetreten — test-user hatte zwei aktive.** Das ist ein
Datenbankbefund und geht an Codex.

### Folgepunkte

    G-597  recovery: zwei aktive Protokolle sind erlaubt   (Codex)
    G-598  recovery: End protocol, die zwei Reiterkacheln
           und der Entwurfsrest im Modal                   (Claude Code)
    G-599  die SSOT nennt Tabellen abwesend, die es gibt,
           und der Waechter sieht den Fast-Treffer nicht   (Orchestrator)
