---
nr: C-423
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: E-72
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a47dbb65
beruehrt:
  tabellen: [supplements.stack_templates]
zahlen:
  gemessen: 2026-09-07
  zeilen: 0
  spalten: 14
---

# C-423 — `stack_templates` hat null Zeilen

## Befund

Aus G-365, Claude Code, 2026-09-07.

Tom, 2026-09-07: *,,supplements.stack_templates haben wir soviel ich
weiss noch nichts gemacht."* — **bestaetigt.**

`[cmd]` **Vierzehn Spalten, null Zeilen:**

    id, supplement_id
    name_de, name_en, name_th
    description_de, description_en, description_th
    goal, source, is_public, sort_order

`[cmd]` **Die Kachel *Vorlagen* ist deshalb leer, nicht kaputt.**

`[read]` **E-72: eine angebundene Kachel ohne Daten zeigt einen
benannten Leerhinweis, keine Null.**

## Was zu klaeren ist

`[read]` **Woher kommen die Vorlagen?**

`[cmd]` **`source` und `is_public` deuten auf zwei Herkuenfte** —
**Katalog und Nutzer.**

`[read]` **Ein oeffentlicher Stack ist Katalogmaterial** — **wie ein
kuratiertes Rezept** (C-411).

`[cmd]` **Und `goal` verbindet ihn mit den Zielen** — `goals.
user_goals` **traegt vier `goal_type`-Werte** (G-352).

`[read]` **Vor dem Fuellen: was ist eine Vorlage?** **Ein
vorgeschlagener Stack fuer ein Ziel, oder eine Sammlung, die ein
Nutzer teilt?**

## Auftrag

**Mitbeauftragt mit A-71 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Auftrag 2 — Vollausbau (E-73)

**Beauftragt am 2026-09-08.**

Tom, 2026-09-08: *,,vollausbau. falls noetig schraenken wir spaeter
ein."*

### Beide Herkuenfte

    kuratiert     zielbasierte Vorschlaege aus dem Katalog
    Nutzer        eigene, oeffentlich teilbare Sammlungen

`[cmd]` **`source` und `is_public` tragen beides schon.**

`[read]` **Einschraenken geht spaeter mit einem CHECK, erweitern
nicht.**

### Was zu bauen ist

`[read]` **Der Schreibweg fuer beide Faelle** — **und die Frage, was
beim Veroeffentlichen geschieht.**

`[cmd]` **`recipe_curation_candidates` ist das Vorbild** (C-411,
C-31): **ein oeffentlicher Nutzerstack gehoert dem Nutzer und ist
zugleich ein Vorschlag an den Katalog.**

`[read]` **Miss, ob dieselbe Machart passt** — **oder ob ein Stack
etwas anderes ist als ein Rezept.**

### Und Daten

`[cmd]` **E-72: eine Kachel ohne Daten zeigt eine Null, die aussieht
wie ein Ergebnis.**

`[read]` **Der Seed gehoert dazu** — **kuratierte Vorlagen je
`goal_type`.** `[cmd]` **Vier Werte:** `body_composition`,
`performance`, `health`, `lifestyle` (G-352).

### Abnahmebedingungen

    A1  Zeilen je Herkunft: kuratiert / Nutzer. Auf test-user.
    A2  RLS in beide Richtungen: fremder sieht oeffentliche,
        nicht private. Zahl je Fall.
    A3  ein Nutzerstack veroeffentlicht, wieder zurueckgenommen.
        Belegt.
    A4  Vollkette laeuft durch. Schritte und Sekunden.
    A5  passt die C-411-Machart? Ja mit Begruendung, oder nein
        mit dem Unterschied.

## Abnahme

**2026-09-08, Orchestrator.** **Alle fuenf Bedingungen mit
Zahlen.**

    A1  test-user: kuratiert 4, Nutzer 1
        dazu 1 Kurationskandidat, 5 Seed-Items
    A2  Fremder sieht oeffentliche 1, private 0
    A3  veroeffentlichen -> source=user + Kandidat pending
        zuruecknehmen -> Vorlage unsichtbar, Kandidat withdrawn
    A4  Vollkette 163 Schritte, 483,1 s, gruen
        Seed 6,1 s, C-423-Test 3/3
    A5  C-411-Machart passt, mit einem Unterschied

### A5 ist die beste Antwort im Bericht

`[read]` **Er hat den Unterschied benannt, statt die Machart einfach
zu kopieren:**

> *,,Die Annahme erzeugt eine neue `source=curated`-Vorlage; der
> originale Nutzerstack bleibt Eigentum des Nutzers und
> unveraendert."*

`[cmd]` **Das ist E-70 und C-31:** **ein angenommener Vorschlag wird
Katalogmaterial, kein privates Objekt** — **und hier zusaetzlich:
das Original bleibt beim Nutzer.**

`[read]` **Wer seinen Stack teilt, verliert ihn nicht.**

### A3 belegt beide Richtungen

`[cmd]` **Zuruecknehmen setzt den Kandidaten auf `withdrawn`, nicht
auf geloescht.**

`[read]` **Die Spur bleibt** — **man sieht, dass jemand etwas
angeboten und zurueckgezogen hat.**

### Und der Vollausbau war die richtige Wahl

Tom, 2026-09-08: *,,vollausbau. falls noetig schraenken wir spaeter
ein."* (E-73)

`[cmd]` **Beide Herkuenfte stehen jetzt** — **kuratiert und
Nutzer.**

`[read]` **Haetten wir nur den kuratierten Fall gebaut, waere der
Kandidatenweg spaeter nachzuruesten gewesen** — **mit allen
Lesern.**

### Nicht live

`[cmd]` **Nur auf Wegwerf-Datenbanken geprueft** — **wie
beauftragt.**

`[read]` **Das Einspielen ist der naechste Schritt** — **sonst kann
Claude Code die Vorlagenkachel nicht anbinden** (E-72: eine Kachel
ohne Daten zeigt eine Null).

**Abgenommen, Einspielen beauftragt.**
