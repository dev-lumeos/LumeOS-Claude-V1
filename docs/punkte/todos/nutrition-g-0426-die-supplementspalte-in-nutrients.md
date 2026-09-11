---
nr: G-426
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-466
entscheidung: E-35
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-426 — die Supplementspalte in Nutrients

## Der Leseweg steht

`[cmd]` **C-466, heute abgenommen:**

    supplements.daily_nutrient_summary_long
      user_id, entry_date, nutrient_code, nutrient_unit,
      total_amount, taken_log_count, skipped_log_count,
      mapped_taken_log_count, unmapped_taken_log_count

    nutrition.nutrient_intake_source_totals_for_day
      fuehrt beide Quellen zusammen

    nutrition.nutrient_upper_limit_assessment_with_supplements
      (p_user_id, p_entry_date)

## Was Tom will

Tom, 2026-09-08, woertlich:

> uebereinander OHNE summe ? die summe haben wir weiter hinten
> schon in der auflistung.

    Vitamin D    11,2 ug      Nahrung
                 25,0 ug      Supplement

`[read]` **Zwei Zeilen, keine dritte.** `[read]` **Und *,,wo
vorhanden"*** ? **wer kein Praeparat nimmt, sieht eine Zeile.**

## Und die Detailansicht

Tom: *,,und denk an die detailansichten, da muss natuerlich
supplements auch rein."*

`[cmd]` **`naehrstoff-modal.tsx` 15,9 KB,
`naehrstoff-detail-read.ts` 6,2 KB.**

`[read]` **In der Uebersicht steht eine Zahl** ? **im Detail
steht, WORAUS sie kommt.**

`[cmd]` **C-466 liefert beides:** **mit Produkt-FK der
Produktname, ohne FK die Substanz.**

## Die Obergrenze

`[cmd]` **C-344: die Grenzen fuer Magnesium, Niacin und
Folsaeure gelten NUR fuer Supplemente.**

`[cmd]` **`nutrient_upper_limit_assessment_with_supplements`
rechnet das** ? **die Kachel ruft sie, sie baut die Regel nicht
nach.**

`[read]` **Wenn eine Warnung erscheint, muss dabeistehen, gegen
welche Referenz sie laeuft.**

## Was zu messen ist

`[cmd]` **`micronutrient_overview_items` traegt heute EINE Quelle
je Naehrstoff (`value_source`).**

`[read]` **Miss, ob die Uebersicht eine zweite braucht** ? **oder
ob der neue Leser sie mitbringt.**

`[cmd]` **Und die Daten sind duenn:** **331 Zeilen in der
Supplementbilanz, drei Naehrstoffe (Omega-3, Magnesium,
Vitamin D).**

`[read]` **Wo nichts ist, steht nichts** ? **keine Nullzeile.**
