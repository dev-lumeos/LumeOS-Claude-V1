---
nr: G-593
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-10-03

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
