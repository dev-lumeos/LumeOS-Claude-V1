---
nr: C-511
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-504
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.user_supplement_settings]
zahlen:
  gemessen: 2026-09-08
  marken: 4907
---

# C-511 - Supplement-Vorlieben, mit Lieblingsmarken

## Toms Vorgabe

Tom, 2026-09-08:

> jetzt sind wir wieder an dem punkt, wo ich vor tagen gesagt
> habe, jedes modul braucht seine preferences und du nein
> gesagt hast. ja es macht sinn, sachen im profil zu haben,
> aber das schliesst nicht aus, dass dieselben sachen und
> anderes in modul preferences sein kann

> nutrition haben wir das schon

> supplement wuerde das auch sinn machen fuer:
> - allergien nochmals ausweisen (haben wir in profile und
>   koennten supplement relevante allergien in preferences rein
>   nehmen)
> - meine bevorzugten marken verwaltbar machen anstatt
>   komplizierte marken
> - etc, da hat es noch mehr, das rein koennte

## Der Orchestrator lag falsch

`[read]` **Mein Argument war *,,zwei Orte, zwei Wahrheiten"*.**

`[read]` **Das gilt fuer DIESELBE Sache** ? **nicht fuer
modulspezifische Einstellungen, die es nur dort gibt.**

`[cmd]` **Und `nutrition` hat es vorgemacht:**

    nutrition.food_preferences
      diet_type, intolerances, general_exclusions,
      preferred_cuisines, meals_per_day, snacks_per_day,
      cooking_skill, prep_time_max_min, budget_level,
      meal_prep_ok, planner_notes
    plus tab-vorlieben.tsx

`[read]` **Die Bauform existiert und funktioniert.**

## Was supplements heute hat

`[cmd]` **`supplements.user_supplement_settings`:**

    id, user_id, supplement_id, status, reminder_times,
    low_stock_days, note_de/en/th
    0 Zeilen, KEIN Leser in apps/

`[read]` **Das ist je SUPPLEMENT, nicht je NUTZER** ?
**Erinnerungszeiten und Bestandswarnungen fuer ein einzelnes
Praeparat.**

`[read]` **Keine Modul-Vorliebentabelle.**

## Zu bauen

**1** ? **`supplements.supplement_preferences`, je Nutzer.**

`[cmd]` **Dieselbe Bauform wie `food_preferences`** ? **eine
Zeile je Nutzer.**

    user_id
    bevorzugte_marken      text[]  oder eigene Tabelle
    gemiedene_stoffe       text[]
    nur_on_market          boolean
    bevorzugte_formen      text[]
    notiz

`[read]` **MISS, was sonst noch hineingehoert** ? **Tom sagt
*,,da hat es noch mehr"*.**

`[cmd]` **Kandidaten aus dem Modul: Budget je Monat,
Zykluslaenge, ob Injektionen genutzt werden, bevorzugte
Einnahmezeiten.**

**2** ? **Die Lieblingsmarken.**

`[cmd]` **4.907 On-Market-Marken.** **Die Leiste zeigt heute
*,,im Pulldown die 25 haeufigsten"*** ? **die haeufigsten im
KATALOG, nicht die, die der Nutzer nimmt.**

`[cmd]` **`BulkSupplements` 5.595, `NOW` 4.977, `Hawaii
Pharm` 4.726.**

`[read]` **Der Nutzer setzt MEHRERE, und sie stehen zuoberst:**

    meine Marken     was der Nutzer gesetzt hat
    ---
    haeufigste       die 25 aus dem Katalog
    Eingabefeld      fuer alle 4.907

`[cmd]` **`search_supplier_products` hat `p_marken text[]`
(C-504)** ? **mehrere gehen schon, die Vorauswahl fehlt.**

**3** ? **Die Allergien noch einmal ausweisen.**

Tom: *,,koennten supplement relevante allergien in preferences
rein nehmen"*

`[read]` **NICHT kopieren** ? `public.user_allergies` **bleibt
die Wahrheit (C-498).**

`[read]` **Aber die Vorliebenflaeche ZEIGT sie und laesst sie
dort aendern** ? **wie `nutrition/preferences` es tut
(G-455).**

`[cmd]` **`art = supplement` filtert die relevanten** ?
`magnesium_stearate` **ist supplement, `lactose` ist
nahrung.**

## Und der Filterspeicher

`[cmd]` **C-504 hat `public.user_display_preferences`
gebaut** ? **2 Zeilen, kein Leser.**

`[read]` **MISS, ob die Filter dort bleiben oder in die
Modul-Vorlieben gehoeren.**

`[read]` **Ein Unterschied: der Filter ist eine Ansichtssache,
die Lieblingsmarke eine Haltung** ? **aber sie wirken auf
dasselbe.**

## Abnahmebedingungen

    A1  eine Vorliebentabelle je Nutzer.
    A2  mehrere Lieblingsmarken setzbar.
    A3  eine Funktion liefert die Marken, meine zuerst.
    A4  die Allergien: gezeigt, nicht kopiert. Belegt.
    A5  was gehoert sonst hinein? TABELLE mit
        Begruendung, aus dem Modul gemessen.
    A6  Filterspeicher: user_display_preferences oder
        Modul-Vorlieben? Begruendet.
    A7  RLS: nur die eigenen.
    A8  Gegenprobe: ein Nutzer ohne Vorlieben sieht die
        Vorgaben.
    A9  Sicherung, Vollkette, ALLE Waechter.

## Was nicht zu tun ist

**Die Allergien NICHT kopieren** ? **eine zweite Speicherstelle
waere genau der Fehler, den ich vermeiden wollte.**

**`apps/` nicht anfassen** ? **G-468 baut die Flaeche.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

