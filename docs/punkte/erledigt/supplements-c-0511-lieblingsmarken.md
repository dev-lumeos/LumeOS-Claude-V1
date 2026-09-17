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
erledigt: 2026-09-08
commit: 1188b4f0
beruehrt:
  tabellen: [supplements.supplement_preferences, public.user_display_preferences, public.user_allergies]
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

### Ergebnis

`supplements.supplement_preferences` ist live: genau eine dauerhafte
Vorliebenzeile je Nutzer. Sie enthaelt `preferred_brands`,
`avoided_ingredients`, `only_on_market`, `preferred_forms`,
`preferred_intake_times`, `note` und das technische
`field_sources`. Der getestete Live-Stand bleibt leer (0 Zeilen), weil
alle Nachweise in einer zurueckgerollten Transaktion liefen.

| Abnahme | Nachweis |
|---|---|
| A1 | Tabelle mit `user_id` als Primaerschluessel und vier eigenen RLS-Policies (SELECT, INSERT, UPDATE, DELETE). |
| A2/A3 | Mehrere Marken sind moeglich. `supplement_brand_options` liefert die 4.907 On-Market-Marken, persoenliche Marken immer vor den nach Produkthaeufigkeit gerankten Katalogmarken. EXPLAIN fuer 25 Vorgaben: 75,750 ms. |
| A4 | `supplement_preferences_read` liest `public.user_allergies` direkt mit `art = 'supplement'`; es gibt keine Allergiespalte in der neuen Tabelle. Fuer dev erscheint nur `Magnesium Stearate`, nicht `lactose` oder `Soja`. |
| A5 | `preferred_intake_times` wurde aufgenommen: `intake_schedule.timing` und `supplement_reminders.time_of_day` sind vorhandene Begriffe. Monatliches Budget fehlt bewusst (nur Stack-Kosten, kein Nutzerbudget/Waehrungsmodell); Zykluslaenge fehlt bewusst (nur konkrete Zyklen mit Status/Datum); Injektionsnutzung bleibt im Medical-Modul (`medical.injection_logs` usw.) und wird nicht dupliziert. |
| A6 | Ansichtsfilter bleiben in `public.user_display_preferences` unter `supplements.produkt_filter`; Lieblingsmarken und sonstige Haltungen liegen in der Modul-Vorliebe. Die bestehende dev-Filterzeile blieb unveraendert. |
| A7 | RLS aktiv; `anon` hat weder Tabellen-SELECT noch RPC-EXECUTE. `authenticated` hat Tabellen-SELECT und nur die drei expliziten RPCs; die Schreib-RPC erzwingt `auth.uid() = p_user_id`. |
| A8 | Ein Nutzer ohne Zeile erhaelt via Lesefunktion leere Listen, `only_on_market = true` und eine leere Allergieliste. Frischer Test auf `c511_final`: gruen. |
| A+ | Beide Flaechen schreiben partiell in dieselbe Zeile: erst `supplement_preferences` (NOW, BulkSupplements.com, capsule), dann `settings` (nur Notiz), dann die Vorliebenflaeche (nur Form powder). Ergebnis: beide Marken und die Settings-Notiz bleiben erhalten; `field_sources` belegt `note = settings`, die anderen geaenderten Felder = `supplement_preferences`. Die Live-Transaktion wurde zurueckgerollt. |
| A9 | Sicherung `backup/schema/20260917095000_c511_vorher.sql`; frische 238-Schritte-Kette `SCHEMA VOLLSTAENDIG`, `KETTE OK: 1083.2s`. |

Die Schreibfunktion ist absichtlich ein feldweiser Patch mit einer
benannten Quelle (`supplement_preferences` oder `settings`), keine
Vollzeilen-Ueberschreibung. Zwei Flaechen koennen deshalb denselben
Speicher nutzen, ohne jeweils fremde Felder zu loeschen. Schreiben zwei
Flaechen dasselbe Feld, gilt die letzte bewusste Aenderung auf genau
diesem einen Wert — keine zweite Wahrheit.

### Waechter

`migration-kette-pruefen`, `migration-datenlogik-pruefen`,
schemafreigabe sowie alle weiteren einzeln ausgefuehrten statischen
Waechter sind gruen. `turbo run lint typecheck test build`: 21/21
erfolgreich; `serverimport-pruefen`: gruen.

`pnpm gate` bleibt vor den C-511-Schritten an zwei bekannten fremden
Sammelfragen rot (`nutrition-c-0507`, `quer-g-0377`). Der
Abwesenheitswaechter meldet weiterhin die drei bekannten, nicht zu
C-511 gehoerenden C-461-Aussagen. Die Backup-Hygiene erinnert an 5,80
GiB; nichts wurde geloescht.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

`[cmd]` **`supplements.supplement_preferences`:**

    user_id, preferred_brands, avoided_ingredients,
    only_on_market, preferred_forms,
    preferred_intake_times, note, field_sources

`[cmd]` **Sechs Funktionen, darunter
`supplement_preferences_write(p_user_id, p_source,
p_preferences)` und `supplement_brand_options`.**

### Toms Regel ist im Code, nicht nur im Bericht

Tom: *,,solange es an DENSELBEN ORT geschrieben wird"*

`[cmd]` **Selbst im Funktionsrumpf nachgelesen:**

    preferred_brands = COALESCE(v_preferred_brands,
                                sp.preferred_brands)
    field_sources = sp.field_sources ||
                    jsonb_strip_nulls(jsonb_build_object(
                      'preferred_brands',
                      CASE WHEN p_preferences ?
                        'preferred_brands'
                      THEN p_source END, ...))

`[read]` **Ein NICHT uebergebenes Feld bleibt stehen** ?
**zwei Flaechen, ein Speicher.**

`[read]` **Und `field_sources` traegt die Quelle JE FELD** ?
**mehr als verlangt: man sieht, welche Flaeche was gesetzt
hat.**

### Meine Marken zuoberst, belegt

`[cmd]` **In `supplement_brand_options`:**

    ORDER BY r.is_preferred DESC,
             r.product_count DESC, r.marke

`[cmd]` **4.907 On-Market-Marken, 25 Vorgaben in 75,8 ms.**

### Die RLS greift haerter als erwartet

`[cmd]` **Mein Schreibversuch als `postgres` fiel:**

    ERROR: supplement_preferences_write:
           nur eigene Vorlieben sind erlaubt

`[read]` **Eine Funktion, die selbst dem Datenbankeigner
widerspricht** ? **staerker als ein erfolgreicher Testschreib.**

### Und eine Entscheidung, begruendet

> *,,Filter bleiben bewusst in `public.user_display_preferences`;
sie sind ANSICHTSZUSTAND, Vorlieben sind dauerhafte HALTUNG."*

`[read]` **Ich hatte die Frage offen gelassen** ? **er hat sie
entschieden und begruendet.**

### Die Allergien: gezeigt, nicht kopiert

> *,,Allergien werden direkt aus `public.user_allergies`
gelesen; nur Supplement-Allergien erscheinen. Keine Kopie."*

**Abgenommen.**


## Nachtrag 2026-09-08 - der Speicher entscheidet

Tom:

> modul preferences schliesst nicht aus, dass wir die
> wichtigsten sachen auch parallel in user settings/profile
> haben koennen, solange es an DENSELBEN ORT geschrieben
> wird

`[read]` **Damit ist Punkt 3 keine Ausnahme, sondern die
Regel.**

    zwei Flaechen, EIN Speicher     richtig
    zwei Flaechen, ZWEI Speicher    zwei Wahrheiten

`[cmd]` **Die Bauform steht schon: C-498s Write loescht nur
`quelle=nutrition_preferences`** ? **eine in Settings
angelegte Allergie ueberlebt.**

`[read]` **Fuer die Lieblingsmarken heisst das: wenn sie
spaeter auch in Settings stehen sollen, schreiben beide in
DIESELBE Tabelle** ? **bau sie so, dass das geht.**

