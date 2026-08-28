---
nr: G-218
typ: messung
modul: medical
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: C-331
agent: claudecode
beauftragt: 2026-08-28
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/regeln-read.ts
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen: null
---

# G-218 — kommt die `critical`-Warnung auf den Bildschirm?

## Befund

`[cmd]` **Aus C-331, 2026-08-28:** `wr_drug_serotonergic_combo`
liefert live `fulfilled`, `critical`, `physician_referral` — **zum
ersten Mal, seit es die Regel gibt.**

`[cmd]` **Geprueft sind drei Stationen** — Erfassung ueber
`user_medications`, `rule_assessment`, Rueckgabe. `[read]`
**Leseweg und Anzeige nicht** — `apps/` gehoerte nicht zu C-331, und
Codex hat die Grenze benannt statt sie zu ueberschreiten.

`[read]` **Berichtigung:** ich hatte mehrfach *,,die einzige
`critical`-Regel im Bestand"* geschrieben. `[cmd]` **Der Katalog
fuehrt 10 `critical`-Regeln** — die eine war die unter den fuenf mit
`count_risk_flag_gte`. **Wieder ein Ausschnitt fuer das Ganze
gehalten.**

`[read]` **Der Durchstich aus G-215 lief ueber `wr_anticoag_stack`**
— eine Regel mit `severity: high`, die `drug_class` liest.
**`critical` ist noch nie auf einem Bildschirm erschienen.**

## Was zu pruefen ist

**Dieselbe Lage wie in C-331 herstellen, ueber die Oberflaeche**, und
die zwei fehlenden Stationen nachmessen.

`[read]` **Und die Frage, die dabei zum ersten Mal auftaucht:
unterscheidet die Anzeige `critical` von `high`?** `[cmd]` Bis heute
gab es keine `critical`-Meldung — **die Unterscheidung ist nie
sichtbar geworden, also auch nie geprueft.**

`[read]` **`physician_referral` ist der andere Teil.** Eine Regel, die
zum Arzt schickt, muss anders aussehen als eine, die ein
Einnahmefenster verschiebt. **Wenn beide gleich aussehen, ist die
Schwere im Datenbestand und nicht auf dem Bildschirm.**

## Gegenprobe

**Die ausloesende Erfassung entfernen — die Warnung muss
verschwinden.** `[cmd]` In G-215 hat das getragen (4 → 0 aktive
Medikamente, `fulfilled` → `not_fulfilled`). **Fuer `critical` ist es
nicht geprueft.**

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

### 1 · Die zwei fehlenden Stationen

**Dieselbe Lage wie in C-331 herstellen, ueber die Oberflaeche**, und
Leseweg und Anzeige nachmessen.

`[cmd]` **Drei Stationen sind belegt** — Erfassung ueber
`user_medications`, `rule_assessment`, Rueckgabe. **Zwei nicht.**

**Gegenprobe:** die ausloesende Erfassung entfernen, **die Warnung
muss verschwinden.** `[cmd]` In G-215 hat das getragen; **fuer
`critical` ist es nicht geprueft.**

### 2 · Die feinstufige Bewertung

**Entscheidung Tom, 2026-08-28:** *,,ja klar stellen wir critical dar,
wir brauchen eine feinstufige bewertung"*.

`[cmd]` **Der Katalog fuehrt zwei Achsen, und beide sind heute
unsichtbar:**

    severity                  low · medium · high · critical
    recommended_action_type   physician_referral · information ·
                              lab_context · warning ·
                              schedule_adjustment ·
                              general_information · verify_prescription

`[read]` **Die zweite Achse ist die wichtigere und wird meist
vergessen.** Eine Regel, die zum Arzt schickt, muss anders aussehen
als eine, die ein Einnahmefenster verschiebt — **auch wenn beide
`high` sind.**

`[read]` **Miss zuerst, wie die beiden Achsen zusammenhaengen.**
Wenn jede `critical` ohnehin `physician_referral` traegt, ist eine
Achse redundant; **wenn sie sich kreuzen, braucht die Anzeige beide.**

`[read]` **Und die Zahl je Stufe entscheidet die Gestaltung:** vier
Stufen mit je zwei Regeln sind etwas anderes als vier Stufen, von
denen eine die Haelfte traegt.

### Was nicht zu tun ist

**Keine Regel aendern, keine `severity` anpassen.** `[read]` **Die
Anzeige folgt dem Bestand, nicht umgekehrt.**
**Keine Warnung erfinden, wo keine Regel feuert.**
**Keine Tabelle anlegen** — Codex arbeitet an C-149.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Lage ueber die Oberflaeche    hergestellt
    Leseweg                       kommt es an
    Anzeige                       erscheint es
    critical gegen high           unterscheidbar - Bildschirmfoto
    Handlungsart sichtbar         Zahl der dargestellten Arten
    Verteilung je Achse           gemessen
    Gegenprobe                    Warnung verschwindet
    Rueckbau                      gezaehlt, `dev` unberuehrt

`[read]` **Die vierte Zeile ist der Kern.** Bis heute gab es keine
`critical`-Meldung auf einem Bildschirm — **die Unterscheidung ist nie
sichtbar geworden, also auch nie geprueft.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **Schreibende Nachweise auf `test-user@lumeos.local`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
