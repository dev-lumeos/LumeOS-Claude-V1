---
nr: C-478
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [public.profiles]
zahlen:
  gemessen: 2026-09-08
---

# C-478 — hat LumeOS ein Mehrgeraete-Problem?

## Woher

`[cmd]` **Due Diligence openGym, Scorecard 4/10:**

> *,,Sync ist Whole-State / Last-Write-Wins ohne serverseitige
> Revision oder Merge. Gleichzeitige Geraeteaenderungen koennen
> sich ueberschreiben."*

`[cmd]` **Empfehlung P0:** *,,Revisionierte Sync-API mit
Konflikterkennung und idempotenten Mutationen."*

## Warum es LumeOS anders trifft

`[read]` **Das Fremdprojekt ist self-hosted mit JSON-Dateien** ?
**LumeOS hat Postgres mit RLS.**

`[read]` **Eine Datenbank hat kein *,,Whole-State"*-Problem** ?
**aber sie hat ein Nebenlaeufigkeitsproblem.**

`[cmd]` **Miss:**

    haben Tabellen updated_at UND eine Revision?
    gibt es optimistisches Sperren irgendwo?
    was passiert, wenn zwei Geraete denselben
      Tag bearbeiten?

`[cmd]` **`nutrition.daily_summary` wird gerechnet, nicht
geschrieben** ? **dort ist es egal.**

`[cmd]` **Aber `stack_items`, `user_goals`,
`nutrition_targets`** ? **dort schreibt der Nutzer.**

## Und die Idempotenz

`[cmd]` **C-465 hat sie fuer die Marketplace-Auslieferung
gebaut** ? *,,zweimal ausgeliefert -> eine Zuweisung."*

`[cmd]` **Und C-467 fuer `create_supplier_product`.**

`[read]` **Das Muster gibt es** ? **die Frage ist, wo es fehlt.**

## Was zu messen ist

**1** ? **Welche Tabellen schreibt der Nutzer direkt?**

**2** ? **Welche davon koennten zwei Geraete gleichzeitig
treffen?**

`[read]` **Ein Trainingsprotokoll am Handy waehrend der Coach am
Rechner den Plan aendert.**

**3** ? **Was passiert heute?**

`[read]` **Messen, nicht annehmen** ? **vielleicht ist es kein
Problem.**
