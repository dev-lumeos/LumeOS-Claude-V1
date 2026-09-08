---
nr: G-372
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-353
entscheidung: E-72
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-spec.tsx
zahlen:
  gemessen: 2026-09-08
  funktionen: 5
  knoepfe: 1
---

# G-372 — die Stack-Kachel kann nichts

## Befund

Tom, 2026-09-08:

> ist ja alles huebsch, aber was soll mir eine uebersicht bringen
> ohne funktionen? ich kann weder reinschauen, noch editieren, noch
> aktivieren

`[cmd]` **Gemessen: ein einziger Knopf in `tab-spec.tsx`.**
**Die Kachel zaehlt, mehr nicht.**

`[cmd]` **Und die Schreibwege stehen alle:**

    supplements.create_curated_stack_template
    supplements.publish_stack_template
    supplements.withdraw_stack_template
    supplements.decide_stack_curation_candidate
    supplements.refresh_stack_item_count

`[read]` **Fuenf Funktionen in der Datenbank, und die Oberflaeche
ruft keine davon.**

`[read]` **Dasselbe Muster wie bei den Einkaufslisten vor G-344:**
**der Leseweg steht, der Anschluss fehlt.**

## Auftrag

**Beauftragt am 2026-09-08.**

### Was die Kachel koennen muss

    reinschauen   welche Posten traegt eine Vorlage?
    uebernehmen   eine Vorlage wird mein Stack
    editieren     meinen Stack aendern
    aktivieren    welcher Stack gilt gerade?
    teilen        meinen Stack veroeffentlichen
    zuruecknehmen ihn wieder privat stellen

`[cmd]` **`stack_template_items` traegt 13 Spalten** — **die Posten
sind da.**

`[cmd]` **`publish_stack_template` und `withdraw_stack_template`
sind gebaut und getestet** (C-423).

`[read]` **Miss, was fuer *uebernehmen* und *aktivieren* fehlt** —
**und melde es, statt es in `supabase/` zu bauen.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt
Supplements.** `[cmd]` **Dann `docs/specs/Supplements/`,
insbesondere `SPEC_10_COMPONENTS.md:81` — der `TemplateSelector`.**

`[cmd]` **Und die Mockups, die `00-QUELLEN.md` nennt.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  je Vorlage: die Posten sind sichtbar.
        Zahl: Vorlagen / davon mit Posten am Schirm.

    A2  eine Vorlage uebernommen. Zahl: user_stacks
        vorher/nachher, stack_items vorher/nachher.

    A3  einen Stack aktiviert. Zahl: aktive vorher/nachher.
        Und: was geschieht mit dem vorher aktiven?

    A4  veroeffentlichen und zuruecknehmen, beide Richtungen.
        Zahl: Kandidat pending -> withdrawn.

    A5  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.

    A6  was fehlt, je Funktion die noch nicht geht.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** — **Codex arbeitet an coach.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
