---
nr: C-388
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-386
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-02
  familien_ohne_form: 504
  eindeutig: 101
  gebunden: 403
---

# C-388 — die Vertreterregel ist nicht erreicht

## Befund

Aus C-386, Codex, 2026-09-02.

`[cmd]` **Die Suche bevorzugt BLS-100/000 und nimmt danach
`sort_weight`** — **ein Artenmodell oder Vertreterfeld gibt es
nicht.**

`[cmd]` **504 mehrzeilige Familien haben keine 100/000-Form.**
`[cmd]` **Nur 101 haben ein eindeutiges hoechstes `sort_weight`, 403
bleiben am hoechsten Wert gebunden.**

`[read]` **Die alte Aussage aus C-35 — *Gruppen ohne Vertreter 953
auf 0* — ist weder nachweisbar noch erreicht.**

## Was fehlt

`[read]` **Der dritte Fall aus C-35:** kein `100`, kein `000` —
**hoechstes `sort_weight`.**

`[cmd]` **Er greift bei 101 von 504.** `[read]` **Bei den uebrigen
403 ist das hoechste `sort_weight` nicht eindeutig.**

`[read]` **Ein vierter Fall fehlt** — **oder eine Kuration.**


## Gemessen am 2026-09-02: es gibt keinen vierten Fall.

`[cmd]` **Die 403 gebundenen Familien haben nur technische
Namens-Stichentscheide, keinen fachlichen vierten Vertreterfall.**

`[read]` **Eine Regel hilft dort nicht, nur Kuration.**

## Auftrag — die Kuration fuer die 403

**Mitbeauftragt: C-389, C-387.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-388 — es gibt keinen vierten Fall, also Kuration

`[cmd]` **Du hast gemessen: die 403 gebundenen Familien haben nur
technische Namens-Stichentscheide, keinen fachlichen vierten
Vertreterfall.**

`[read]` **Damit ist die Regel am Ende** — **was bleibt, ist
Kuration.**

`[cmd]` **Und der Weg dafuer existiert:** `food_aliases` traegt 12
`curated_suchbegriff`-Zeilen fuer Reis (C-36), **`reis` liefert
`C352000` auf Platz 1 von 145.**

`[read]` **Miss, ob derselbe Weg fuer Vertreter taugt** — **oder ob
es ein eigenes Feld braucht.**

`[read]` **Und wie gross der Nutzen waere:** **403 Familien
kuratieren ist Arbeit** — **wie viele davon treffen ueberhaupt eine
Suche?**

### 2 · C-389 — Saft und Nektar

`[cmd]` **Frucht, Saft und Nektar liegen alle in `obst`,
`processing_level` bei Saft ist `raw`.**

`[read]` **Ein Saft ist kein rohes Obst.**

`[cmd]` **`Aprikosensaft` trifft bei *Aprikose* per `name_prefix`,
Rang 6** — **kein Alias-, sondern ein Namensproblem.**

`[read]` **C-35 nannte es *ohne Kuration zu haben*** — **die
Trennung waere aus dem BLS-Code ableitbar.** `[cmd]` **F201100 gegen
F201600.** **Miss, ob das traegt.**

### 3 · C-387 — die zweite Tabelle bauen

`[cmd]` **Dein Entwurf steht:** `food_tags_kuriert` mit `food_id`,
`tag_code`, **entschiedener Aktion gesetzt/entfernt, ohne
`confidence`.**

`[read]` **Und der tragende Satz:** *,,Eine Entfernt-Zeile ueberdeckt
auch einen Tag, den ein Import spaeter erneut setzt."*

`[cmd]` **Vier Schreiber wirken nur auf ihre eigene Tabelle** — 020,
027, 032, 221.

`[read]` **Jetzt bauen** — **Tabelle, RLS, und der Leseweg, der
Import und Kuration vereint.**

`[cmd]` **`apps/admin` hat eine Kurationsseite, 314 Zeilen,
vollstaendig lesend** (C-366). `[read]` **Der Schreibweg dorthin ist
ein UI-Auftrag, nicht deiner.**

### Was nicht zu tun ist

`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Vertreter        taugt der Aliasweg, oder eigenes Feld
    Nutzen           wie viele der 403 treffen eine Suche
    Saft/Nektar      traegt der BLS-Code die Trennung
    food_tags_kur.   live, RLS, Leseweg vereint beide
    Entfernt-Zeile   ueberlebt einen Importlauf, belegt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
