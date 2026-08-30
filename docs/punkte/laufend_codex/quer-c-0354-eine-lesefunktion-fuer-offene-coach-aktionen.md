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

### 2026-08-30 - C-354 und C-355

#### C-354 - Lesenaht im Coach-Schema gebaut

`coach.offene_aktionen(p_modul text)` ist als `SECURITY DEFINER`-Funktion
gebaut und in der Kette als Schritt 354 nach Schritt 150 registriert. Sie hat
keinen `client_id`-Parameter: ausschliesslich `auth.uid()` bestimmt den
Klienten. Sie liefert `id`, Modul, Aktionstyp, Vorschau, Payload, Status,
Verfall und Erstellzeit fuer `status = 'pending'` und das angefragte Modul.
`authenticated` darf sie ausfuehren, `anon` nicht.

Als Rolle `authenticated` liefert `coach.offene_aktionen('nutrition')` fuer
`dev` die erwarteten 2 Zeilen, fuer einen anderen Klienten 0. Die beiden
dev-Zeilen tragen im statischen Seed bereits einen vergangenen `expires_at`,
aber weiterhin `status = 'pending'`; die Funktion gibt beides unveraendert
aus. Ein Verfall- oder Bestaetigungs-Schreibweg wurde nicht hinzugefuegt.

#### C-355 - Herkunft in der Suchfunktion

`nutrition.food_search` kennt nun zwei `p_filters`-Vertraege:

    {"favorites": true}       nur als boost/liked materialisierte Foods
    {"sources": ["custom"]}  nur eigene Foods des p_user_id

Ohne `sources` bleibt der bisherige BLS-Pfad aktiv. `sources` kann `bls` und
`custom` enthalten; Custom-Foods werden nur fuer den angefragten Nutzer aus
`foods_custom` gelesen und tragen im Ergebnis `food_source = 'custom'`.
Damit kann kein Aufrufer fremde eigene Foods durch eine fremde `p_user_id`
lesen: die bestehende RLS der Tabelle bleibt wirksam.

Die rote Vormessung lieferte fuer beide unbekannten Schluessel noch 4.970
Treffer. Nach dem Bau liefert der Favoritenfilter fuer dev genau 1 Treffer.
`foods_custom` hat weiterhin 0 Zeilen, deshalb liefert der Custom-Filter
korrekt 0 Treffer. Das ist der erwartete Leerzustand, keine angelegte
Testzeile.

#### Gegenprobe und Sicherung

Ein Nutzer ohne Vorlieben (`coach.seed@example.com`) erhielt bei der Suche
`reis` dieselben 25 Food-IDs in derselben Reihenfolge vor und nach dem Bau.
Auf einer aus der Vollsicherung wiederhergestellten, warmgemessenen
Wegwerf-Datenbank lag der Median bei 282,332 ms; auf dev danach bei 292,987 ms
(+10,655 ms). Die beiden Wegwerf-Datenbanken wurden nach der Prüfung entfernt.

Vor dem Live-Einspielen entstanden und behalten wurden:

    backup/vollsicherung/20260830_140937_c354_vor_live.dump
    backup/vollsicherung/20260830_140937_c354_vor_live.sql

Geprueft: Pipeline-SQL auf Wiederherstellung und live, die Klientenrechte,
Favoriten- und Custom-Leerzustand, Reihenfolgengegenprobe, Ketteneintrag sowie
`git diff --check`. Keine Testdaten und keine `apps/`-Datei wurden angefasst.

## Abnahme

_(vom Orchestrator)_
