---
nr: E-37
getroffen: 2026-08-30
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-363, G-269]
modul: quer
---

# E-37 — Marketplace zurueckgestellt, der Import bleibt vorgesehen

## Entscheidung

Tom, 2026-08-30: *,,marketplace ist zurueckgestellt bauen wir
spaeter, jedoch vorsehen dass wir gekaufte sachen in lumeos rein
importieren, das sollte auch definiert sein"*.

## Es ist definiert

`[cmd]` **`docs/specs/Marketplace/` traegt 12 Dateien.** `[cmd]`
**`SPEC_01_MODULE_CONTRACT.md`, Kapitel 3:** *,,Alle gekauften Inhalte
werden direkt in den jeweiligen Modul-APIs angelegt — kein PDF."*

    training_program     -> POST /api/training/routines
    meal_plan            -> POST /api/nutrition/meal-plans
    supplement_protocol  -> POST /api/supplements/stacks
                            (requires_confirmation: true)
    bundle               -> alle gleichzeitig

`[read]` **Und die Modulgrenze ist gezogen:** *,,Marketplace BESITZT
NICHT: Training Routines, Meal Plans, Supplement Stacks."* **Er
liefert ueber die Modul-APIs, er haelt nichts selbst.**

`[cmd]` **`requires_confirmation: true` bei Supplements** — ein
gekaufter Stack wird nicht stillschweigend uebernommen.

`[cmd]` **Zweite Stelle:** `HumanCoach/SPEC_11` nennt im *New Plan
Modal* drei Quellen — **Template, Clone, Marketplace-Import.**

## Was daraus folgt

`[cmd]` **`plan_origin` erlaubt seit dem 30.08. `self_created`,
`coach_created`, `marketplace`** (C-342). `[read]` **Die dritte
Herkunft steht im Schema, bevor der Marktplatz gebaut wird** — **genau
das, was *vorsehen* heisst.**

`[read]` **Und E-29 gilt sinngemaess:** ein gekaufter Plan darf
vermutlich nicht frei bearbeitet werden. `[cmd]`
**`coach.darf_nutrition_plan_aendern()` liest `plan_origin` bereits
mit.**

## Was zurueckgestellt bleibt

`[cmd]` **Wallet, Abo, Gebuehrensaetze, Creator-Auszahlung** — und
die acht Rechtsfragen aus C-363.

`[read]` **Der Punkt sagt es selbst:** *,,Marketplace zuletzt,
blockiert nichts, braucht vorher den Anwalt."*

`[cmd]` **`/v2/marketplace` liefert 404, der Verweis zeigt auf eine
eigene Domain** (A-36).
