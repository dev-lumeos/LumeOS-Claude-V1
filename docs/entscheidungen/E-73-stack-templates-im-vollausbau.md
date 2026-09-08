---
nr: E-73
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-423, A-71]
modul: supplements
---

# E-73 — `stack_templates` im Vollausbau

## Entscheidung

Tom, 2026-09-08:

> will ich mich heute nicht entscheiden, also vollausbau. falls
> noetig schraenken wir spaeter ein

## Was gilt

**Beide Herkuenfte:**

    kuratiert     zielbasierte Vorschlaege aus dem Katalog
    Nutzer        eigene, oeffentlich teilbare Sammlungen

`[cmd]` **`source` und `is_public` tragen beides schon** — **die
Spalten waren dafuer gebaut.**

`[cmd]` **`SPEC_10_COMPONENTS.md:81` beschreibt `TemplateSelector`
als *,,Template-Auswahl fuer neuen Stack (Goal-Based)"*** —
**Community-Sharing steht dort nur als offener Punkt.**

`[read]` **Der Vollausbau erfuellt beides.**

## Warum einschraenken spaeter geht, erweitern nicht

`[read]` **Wer nur den kuratierten Fall baut, muss spaeter `source`
und `is_public` nachziehen** — **und alle Leser, die sie nicht
kennen.**

`[read]` **Wer beide baut und spaeter einschraenkt, setzt einen
CHECK oder eine Policy** — **eine Zeile.**

`[cmd]` **Dieselbe Ueberlegung wie bei `subtype`** (E-67): **ein
CHECK kommt, wenn ein Schreibweg existiert, nicht davor.**

## Und die Kuration hat ein Vorbild

`[cmd]` **`recipe_curation_candidates` mit drei Tabellen** (C-411):
**Kandidat, Zutaten, Entscheidung.**

`[read]` **Ein oeffentlicher Nutzerstack ist derselbe Fall** — **er
gehoert dem Nutzer und ist zugleich ein Vorschlag an den Katalog.**

`[cmd]` **Und `decide_recipe_curation_candidate` zeigt, wie eine
Annahme aussieht** (C-31): **ein unveraenderlicher Snapshot, kein
privates Objekt.**
