---
nr: C-497
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: ad775929
beruehrt:
  tabellen: [nutrition.food_preference_items]
zahlen:
  gemessen: 2026-09-08
---

# C-497 - Daumen hoch und runter fuer Supplementprodukte

## Toms Vorgabe

Tom, 2026-09-08:

> in nutrition/foodsdb kann ich ein gruenes haeckchen oder
> rotes x pro position setzen als like oder dislike, sprich die
> gruenen kommen dann zuoberst. das will ich auch in
> supplements/produkte

## Die Bauform steht schon

`[cmd]` **`nutrition.food_preference_items`:**

    id, user_id, preference, strength, target_type,
    food_id, category_id, tag_code, cuisine_code,
    exclusion_preset_code, catalog_item_code,
    source, created_at

`[cmd]` **Die CHECKs, gemessen:**

    preference   liked | disliked | hard_exclude
    strength     hard_exclude | soft_dislike | neutral |
                 like | boost
    target_type  food | category | tag | cuisine |
                 exclusion_preset | catalog_item

`[read]` **Und ein CHECK zaehlt, dass GENAU EIN Zielfeld
gesetzt ist** ? **dieselbe Bauform wie `meal_items.food_source`.**

`[cmd]` **`food_preference_search_targets` traegt
`constraint_level`, `match_type`, `score`, `specificity`** ?
**die Sortierung ist gebaut.**

## Die Frage

`[read]` **Passt ein Supplementprodukt in diese Tabelle, oder
braucht es eine eigene?**

**Dafuer:**

`[cmd]` **`target_type` hat schon `catalog_item` mit
`catalog_item_code`** ? **miss, wofuer das heute benutzt wird.**

`[read]` **Wer ein Whey mag und ein anderes nicht, hat dieselbe
Absicht wie bei Lebensmitteln.**

**Dagegen:**

`[cmd]` **Die Tabelle liegt in `nutrition`, das Produkt in
`supplements`** ? **ein Fremdschluessel ueber Schemagrenzen.**

`[cmd]` **`food_preferences` traegt Diaetform, Allergien,
Kochzeit** ? **Sachen, die ein Supplement nicht hat.**

`[read]` **MISS und ENTSCHEIDE** ? **beides ist vertretbar, aber
die Begruendung muss stehen.**

## Was zu bauen ist

`[read]` **Je nach Entscheidung:**

    a  target_type bekommt supplement_product
       plus eine Spalte supplement_product_id
       -> der CHECK zaehlt ein Zielfeld mehr

    b  eine eigene Tabelle in supplements
       -> dann dieselbe Bauform, nicht eine neue erfinden

`[read]` **Und die Sortierung: gruene zuoberst.**

`[cmd]` **`search_supplier_products` (C-495) sortiert heute nach
`similarity`** ? **miss, wie die Vorliebe davorkommt, ohne die
Suche zu verschlechtern.**

## Abnahmebedingungen

    A1  die Entscheidung a oder b, BEGRUENDET.
    A2  wofuer wird catalog_item heute benutzt?
        Gemessen.
    A3  ein Produkt laesst sich mit liked/disliked
        markieren.
    A4  gruene zuoberst, ohne dass die Suche
        schlechter trifft. Gemessen.
    A5  RLS: ein Nutzer sieht NUR seine eigenen
        Vorlieben.
    A6  Gegenprobe: zwei Nutzer, verschiedene
        Vorlieben -> jeder sieht seine.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**KEINE neue Bauform erfinden** ? **`food_preference_items`
loest dasselbe Problem, entweder erweitern oder kopieren.**

**`apps/` nicht anfassen** ? **Claude Code baut die Oberflaeche
(G-453).**

## Bericht 2026-09-15

Entscheidung: die vorhandene Bauform `nutrition.food_preference_items`
erweitern, keine zweite Tabelle in `supplements` schaffen.

`[cmd]` `catalog_item` ist heute unbenutzt: **0** Zeilen und **0** verschiedene
Codes. Die bestehende Tabelle besitzt bereits alle Vorliebestufen und
eigentuemergepruefte RLS. Die Migration
`20260915004916_c497_supplier_product_preferences.sql` fuegt
`target_type = supplement_product`, die FK
`supplement_product_id -> supplements.supplier_products(id)` sowie einen
partiellen Unique-Index je Nutzer/Produkt hinzu. Das ist eine echte
Schemagrenze mit FK, keine duplizierte Nutzerwahrheit.

`supplier_product_preference_write(product_id, preference)` setzt oder loescht
nur den eigenen liked/disliked-Daumen und ist `SECURITY INVOKER`. Die vorhandenen
vier RLS-Policies bleiben: `auth.uid() = user_id`.

`[cmd]` Zwei Auth-Nutzer wurden isoliert geprueft: Nutzer 1 sieht zwei eigene
Produktdaumen, Nutzer 2 einen eigenen und **0** von Nutzer 1. anon hat kein
Execute, authenticated hat Execute.

Die Suche sortiert jetzt nur vor der bisherigen Trefferrangfolge:

    liked (0) -> neutral (1) -> disliked (2)
    danach Name-Treffer -> similarity -> name_en

`[cmd]` Ein bewusst nicht zuerst stehendes Gold-Standard-Whey wurde geliked und
war danach erster Treffer. Ohne Vorliebe liegt `gold standart wey` bei
**14,834 ms** und damit weiter im rund-14-ms-Bereich.

Sicherung: `backup/schema/20260915011641_c43_vor_kettenlauf.sql`.
Vollkette (215 Schritte, Wegwerf-DB `c496_final`), Schema-Vollstaendigkeit und
der C-496/C-497-Nachweistest (2/2) sind gruen. Nicht live eingespielt; `apps/`,
Dev-Server, Stage, Commit und Push blieben unangetastet.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    Migration   6.068 B, liegt vor
    LIVE        noch nicht

### Die Entscheidung, gemessen statt geraten

> *,,`catalog_item` ist tatsaechlich unbenutzt: 0 Zeilen, 0
Codes."*

`[cmd]` **Selbst nachgemessen: 0 Zeilen.**

`[read]` **Er hat die bestehende Tabelle erweitert, statt eine
zweite zu bauen** ? **und das war die Frage, die ich ihm
gestellt hatte.**

`[cmd]` **Und Claude Codes FK-Befund aus G-453 traegt:**
`food_preference_items.food_id` **zeigt auf** `nutrition.foods`
? **`target_type` allein genuegte nicht.**

### Die Reihenfolge

    liked -> neutral -> disliked
    danach die bisherige Namens-/Similarity-Rangfolge

`[cmd]` **Suche ohne Vorliebe: 14,8 ms** ? **gegen 14,1 ms
vorher.**

`[read]` **Die Auflage war *,,ohne die Suche zu
verschlechtern"*** ? **0,7 ms.**

### RLS

> *,,RLS trennt zwei Nutzer korrekt; `anon` hat keinen
Schreibzugriff."*

**Abgenommen. Einspielen steht aus.**
