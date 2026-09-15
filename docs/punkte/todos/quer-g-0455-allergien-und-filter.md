---
nr: G-455
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: [C-498]
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-455 - Allergien in Settings, Filter in Produkten

## Was C-498 liefert

`[cmd]` **`public.user_allergies`** ? **`art` (nahrung,
supplement, medikament, umwelt, sonstiges), `schwere`
(unvertraeglichkeit, allergie, anaphylaxie), mit
Aliasaufloesung.**

`[read]` **`food_preferences.allergies` faellt weg** ? **die
Anzeige bleibt.**

## Drei Oberflaechen

**1** ? **Settings.**

`[read]` **Anlegen und pflegen, alle Arten** ? **Nahrung,
Supplement, Medikament.**

`[cmd]` **Spaeter ins Onboarding** (Toms Wort) ? **hier nur die
Pflege.**

**2** ? **nutrition/preferences bleibt bedienbar.**

Tom: *,,dargestellt kann es ja trotzdem zusaetzlich in
foods/preferences bleiben und auch da editierbar"*

`[cmd]` **`tab-vorlieben.tsx` ist gebaut** ? **es liest jetzt
`public.user_allergies` statt der eigenen Spalte.**

`[read]` **Fuer den Nutzer aendert sich NICHTS** ? **er sieht
und aendert sie an derselben Stelle.**

**3** ? **supplements/produkte: zwei neue Filter.**

    MEINE ALLERGIEN   aus public.user_allergies
                      hart: Produkt verschwindet

    MEIDESTOFFE       aus food_preference_items
                      weich: Produkt wird markiert

`[cmd]` **`food_preference_items` unterscheidet es schon:**
`hard_exclude` **gegen** `soft_dislike`.

`[read]` **Eine Nussallergie gilt ueberall.
*,,Keine Farbstoffe"* ist eine Haltung, keine Diagnose.**

## Und der Markenfilter

Tom: *,,marken muessen noch besser geloest werden, dass ein user
seine filtermasken mit marken setzen kann und nicht nur eine
marke waehlen"*

`[read]` **MEHRERE Marken, ODER-verknuepft:**

    [Optimum Nutrition] [NOW] [Thorne] [+]

`[cmd]` **Heute eine Marke, `p_marke text`** ? **G-454 misst,
ob die Suchfunktion mehrere kann.**

## Abnahmebedingungen

    A1  Settings: eine Allergie anlegen, art und
        schwere waehlen. Foto.
    A2  nutrition/preferences zeigt dieselbe Allergie.
        Foto.
    A3  eine Aenderung dort wirkt in Settings. Belegt.
    A4  supplements: ein Produkt mit dem Allergen
        verschwindet. Zahl vorher/nachher.
    A5  ein Meidestoff markiert statt zu entfernen.
        Foto.
    A6  mehrere Marken gleichzeitig. Foto.
    A7  Gegenprobe: eine geloeschte Allergie faellt
        aus dem Filter.
    A8  vier Module unveraendert.
    A9  apps/web 1759 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINE Allergie ableiten** ? **nur was der Nutzer
eintraegt.**

**Nichts in `supabase/`.**

