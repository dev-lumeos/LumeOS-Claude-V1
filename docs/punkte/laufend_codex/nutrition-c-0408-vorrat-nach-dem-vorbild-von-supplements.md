---
nr: C-408
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-65
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-07
---

# C-408 — Vorrat nach dem Vorbild von Supplements

## Befund

Tom, 2026-09-07: *,,sehen wir dementsprechend gleich auch
stockverwaltung nutrition vor, macht ja sinn."*

`[cmd]` **`supplements.user_inventory` ist gebaut UND
angeschlossen** — eigener Reiter `tab-inventory-echt.tsx`, gelesen
in `intake/route.ts`.

## Eine eigene Tabelle, keine geteilte

Tom: *,,wir mischen keine module durcheinander. jedes modul ist in
sich geschlossen."*

`[read]` **Das Muster wird kopiert, nicht die Tabelle geteilt.**
`[read]` **Ein Fremdschluessel ueber die Modulgrenze macht aus zwei
Modulen eines.**

    nutrition.user_inventory
      user_id
      food_id            -- BLS
      custom_food_id     -- oder Eigenes
      menge_g            -- oder ml, in Gramm gefuehrt
      schwelle_g         -- ab hier: geht zur Neige
      zuletzt_angepasst  -- fuer die Anzeige
      reorder_flag

`[cmd]` **Der CHECK folgt `meal_items`:** **entweder `food_id` oder
`custom_food_id`, nie beides.**

## Menge in Gramm

Tom: *,,ich denke g oder ml hilft uns mehr."*

`[cmd]` **`meal_items` rechnet in `amount_g`** — **der Abzug braucht
keine Umrechnung.**

`[read]` **Kein Verpackungsmodell** — **keine `purchased_at`- und
`expires_at`-Ketten je Packung.** `[read]` **Der Nutzer entscheidet,
was er fuehrt.**

## Der Abzug, und warum er ungenau sein darf

Tom: *,,wenn ein kumpel auch mit isst haben wir die daten nicht,
sprich das wird mehr oder weniger symbolischer wert als lager
haben."*

`[cmd]` **E-65: der Vorrat ist ein Anhaltspunkt, kein Bestand.**

    Wer erfasst          zieht ab
    Wer nicht erfasst    zieht nicht ab
    Wer teilt            zieht zu wenig ab
    Wer wegwirft         zieht gar nicht ab

`[read]` **Deshalb: automatisch abziehen, jederzeit editierbar,
ohne Begruendungszwang.**

`[read]` **Miss, wie Supplements den Abzug loesen** —
`apps/web/src/app/api/supplements/intake/route.ts` **liest
`user_inventory`.**

## Und die Einkaufsliste

`[cmd]` **`shopping_lists.source_type` kennt `supplement_reorder`.**

`[read]` **Fuer Nutrition braucht es einen eigenen Wert** — **oder
`manual` mit Vermerk.** **Entscheide beim Bau und begruende es.**

## Auftrag

**Mitbeauftragt mit C-407 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.
