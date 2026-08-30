---
nr: C-354
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: G-258
entscheidung: E-29
agent: codex
beauftragt: 2026-08-30
beruehrt:
  tabellen: [coach.pending_actions]
zahlen:
  gemessen: 2026-08-30
  coach_funktionen: 16
  pending_actions_zeilen: 3
---

# C-354 — eine Lesefunktion fuer offene Coach-Aktionen

## Befund

Aus G-276, Claude Code, 2026-08-30.

`[cmd]` **Alle 16 Funktionen im `coach`-Schema geprueft: keine liest
`pending_actions`.** `[cmd]` **`summary_nutrition(dev)` liefert nur
`{"freigegeben": false}`.**

`[cmd]` **Die Daten sind da — 3 Zeilen, 2 fuer `dev` — und RLS liesse
den Client direkt lesen** (`auth.uid() = client_id`).

`[read]` **Genau deshalb hat Claude Code es nicht getan.** **E-29
sagt: ueber eine Funktion.**

`[read]` **Er haette bauen koennen, was bestellt war, und die
Entscheidung dabei brechen.**

## Was zu bauen ist

**Eine Funktion aus der Sicht des Klienten**, etwa
`coach.offene_aktionen(p_modul)`.

`[cmd]` **`pending_actions` traegt `module`** — die Tabelle ist
modulueebergreifend gedacht. `[read]` **Also eine Funktion je Zweck,
nicht je Modul** (E-29).

`[read]` **Und die Rechte liegen im Coach-Schema, nicht im lesenden
Modul:** `client_permissions` und `client_autonomy` sagen, was ein
Coach darf. **Wer direkt liest, muesste das nachbauen.**

## Offen bleibt

`[read]` **Die Gegenrichtung:** ob der Nutzer eine Aktion bestaetigen
kann. **Das beruehrt `confirmed_by` und die drei
Aenderungsprotokolle** — eigener Punkt.

## Auftrag — zwei Lesewege, die je einen Punkt entblocken

**Mitbeauftragt: C-355.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag sind G-258 und G-251 baubar.**
**Beide liegen heute blockiert, weil die Datenbank keinen Weg
anbietet** — **und Claude Code hat in beiden Faellen den naheliegenden
Umweg abgelehnt, statt ihn zu nehmen.**

### 1 · C-354 — offene Coach-Aktionen

`[cmd]` **Alle 16 Funktionen im `coach`-Schema geprueft: keine liest
`pending_actions`.** `[cmd]` **RLS liesse den Client direkt lesen**
(`auth.uid() = client_id`) — **E-29 verbietet es.**

**Eine Funktion aus Sicht des Klienten**, etwa
`coach.offene_aktionen(p_modul)`.

`[cmd]` **`pending_actions` traegt `module`** — **also eine Funktion
je Zweck, nicht je Modul.**

`[read]` **Und die Rechte liegen im Coach-Schema:**
`client_permissions` und `client_autonomy`. **Was ein Klient sehen
darf, entscheidet die Funktion, nicht der Aufrufer.**

`[read]` **Die Gegenrichtung — bestaetigen — ist nicht Teil dieses
Auftrags.** Sie beruehrt `confirmed_by` und die drei
Aenderungsprotokolle.

### 2 · C-355 — Herkunft in `food_search`

`[cmd]` **`p_filters` hat keinen Schluessel fuer Favoriten**;
`liked` wirkt nur als Rangbonus. `[cmd]` **`foods_custom` hat 45
Spalten, 0 Zeilen, und wird von `food_search` nicht gelesen.**

`[read]` **Beides ergaenzen.** `[read]` **Und die Gegenprobe ist
Pflicht:** `food_search` ist gemessen empfindlich (C-121, C-191,
C-192) — **ein Nutzer ohne Vorlieben muss dieselbe Reihenfolge sehen
wie vorher.**

`[cmd]` **`dev` hat genau einen Favoriten und `foods_custom` ist
leer** — **die Filter werden nach dem Bau leer aussehen.** `[read]`
**Das ist richtig so; ein Leerzustand ist kein Fehler.** **Aber miss
es und sag es**, damit niemand es fuer einen haelt.

### Was nicht zu tun ist

**Kein direkter Zugriff auf `coach.*` aus einem anderen Schema.**
**Keine Testdaten anlegen**, um die Filter voll aussehen zu lassen.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Lesefunktion            liefert die 2 Zeilen fuer dev
    Rechte                  greifen sie? ein Nutzer ohne Coach
    p_filters Favoriten     wirkt der Schluessel
    foods_custom            wird gelesen, belegt
    Gegenprobe              Nutzer ohne Vorlieben - Reihenfolge
                            unveraendert
    Laufzeit                ms vorher / nachher
    Leerzustand             gemessen und benannt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
