---
nr: C-498
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 68c69158
beruehrt:
  tabellen: [public.profiles]
zahlen:
  gemessen: 2026-09-08
---

# C-498 - Allergien global, nicht in food_preferences

## Toms Vorgabe

Tom, 2026-09-08:

> ich denke das gehoert global in user settings
> (dementsprechend spaeter in das onboarding) und daraus lesen
> alle module. sprich allergien: essen/supplement/medical etc

> dargestellt kann es ja trotzdem zusaetzlich in
> foods/preferences bleiben und auch da editierbar

`[read]` **Also: der Speicherort wandert, die Anzeige bleibt.**

## Was heute dasteht

`[cmd]` **Allergien an GENAU ZWEI Stellen, beide in
`nutrition`:**

    nutrition.food_preferences.allergies    ARRAY
      Beispiele: {tree_nuts}, {lactose}, {}
      3 Zeilen
    nutrition.foods_custom.custom_allergens

`[cmd]` **`medical` hat KEINE Allergietabelle** ? **eine
Penicillin-Allergie hat heute keinen Platz.**

`[read]` **Und der Name sagt es: `food_preferences`** ? **eine
Allergie ist keine Vorliebe, sie steht neben `cooking_skill`
und `budget_level`.**

## Der Ort

`[cmd]` **`public` traegt heute drei Tabellen:** `profiles`,
`user_display_preferences`, `koerperflaechen`.

`[read]` **`koerperflaechen` liegt dort aus Toms Begruendung in
C-468:** *,,das ist eine public komponente, wenn sie von
mehreren modulen benutzt wird."*

`[read]` **Dieselbe Begruendung.**

## Zu bauen

    public.user_allergies
      user_id, stoff_code, stoff_text,
      art, schwere, quelle, seit, notiz

      art      nahrung | supplement | medikament |
               umwelt | sonstiges
      schwere  unvertraeglichkeit | allergie | anaphylaxie

`[read]` **Ein Stoff kann MEHRERE Arten haben** ? **Laktose ist
Nahrung UND steckt als Fuellstoff in Tabletten.**

## Die Aliasfalle

`[cmd]` **Derselbe Stoff, viele Schreibweisen:**

    Magnesium Stearate                 36.316 Produkte
    Magnesium Stearate (Mg Stearate)   11.502
    Vegetable Magnesium Stearate        9.020

    Titanium Dioxide                    5.992
    Titanium Dioxide (TiO2)             1.143
    Titanium Dioxide color                993

`[read]` **Wer *,,Magnesiumstearat meiden"* einstellt, verpasst
20.522 Produkte, wenn nur die erste Schreibweise trifft.**

`[cmd]` **`supplements.supplement_aliases` hat 2.843
Eintraege** ? **dieselbe Bauform, MISS ob sie taugt.**

## Der Umzug

`[read]` **Toms Entscheidung: die bessere Variante.**

    public.user_allergies ist die WAHRHEIT
    food_preferences.allergies faellt weg
    nutrition/preferences zeigt und editiert public

`[cmd]` **Drei Zeilen sind umzuziehen** ? `{tree_nuts}`,
`{lactose}`, `{}`.

`[read]` **Jetzt ist der billigste Zeitpunkt.**

## Die Coach-Freigabe

Tom, 2026-09-08:

> das ist ein wichtiges thema und muss freigegeben sein, auch
> als sicherheit gegenueber seinem kunden

`[cmd]` **`coach.client_permissions` und
`coach.permission_change_log` sind gebaut (C-459).**

`[read]` **Eine Allergie braucht eine EIGENE Freigabe** ?
**nicht mitgeliefert, wenn `nutrition` freigegeben ist.**

`[read]` **Und sie gehoert ins Protokoll** ? **wer sie wann
freigegeben hat, ist eine Haftungsfrage.**

## Was NICHT zu tun ist

**KEINE zweite Speicherstelle** ? **wenn beide bleiben, gibt es
zwei Wahrheiten.**

**KEINE Allergie erfinden oder ableiten** ? **nur was der
Nutzer eintraegt.**

**`apps/` nicht anfassen** ? **G-455 baut die Oberflaechen.**

## Abnahmebedingungen

    A1  public.user_allergies mit art und schwere.
    A2  die drei Zeilen umgezogen, Spalte gefallen.
    A3  Aliasaufloesung: "Magnesium Stearate" trifft
        alle drei Schreibweisen. Zahl vorher/nachher.
    A4  eine eigene Coach-Freigabe, im Protokoll.
    A5  RLS: nur der Nutzer und ein freigegebener
        Coach.
    A6  Gegenprobe: ein Coach OHNE Freigabe sieht
        nichts.
    A7  Sicherung, Vollkette, Punktelauf.

## Bericht

2026-09-15 — umgesetzt und in die laufende Datenbank eingespielt.

- `public.user_allergies` ist die einzige Nutzerquelle mit `art` und
  `schwere`; `nutrition.food_preferences.allergies` ist entfernt. Vorher
  gab es drei Preference-Zeilen (`tree_nuts`, `lactose`, leer); zwei echte
  Allergien wurden mit `quelle = nutrition_preferences` uebernommen, die
  leere Liste erzeugt keinen Scheindatensatz.
- Der Alias-Katalog enthaelt die drei nachgemessenen Varianten
  `Magnesium Stearate` (36.381), `Magnesium Stearate (Mg Stearate)`
  (11.502) und `Vegetable Magnesium Stearate` (9.020): zusammen 56.903
  Inhaltszeilen. Die Zahl 36.316 in der Ausgangsnotiz war nicht mehr der
  aktuelle Datenstand.
- Coach-Sicht ist bewusst eine eigene Freigabe:
  `coach.allergy_permissions`, nicht die allgemeine Nutrition-Freigabe.
  Aenderungen schreibt ein append-only Trigger in
  `coach.allergy_permission_change_log`. RLS-Test: Nutzer und explizit
  freigegebener Coach sehen die Treffer; ein dritter Coach sieht 0.
- Die bestehenden Preference-Lese-, Schreib- und Suchfunktionen verwenden
  nun die globale Quelle. Die Live-Upgrade-Migration ersetzt ihre alte
  Spaltenreferenz, bevor die Spalte wegfaellt.
- Rechte nachgemessen: `anon` hat weder Tabellen-SELECT noch RPC-Execute;
  `authenticated` darf die Match-RPC ausfuehren, RLS begrenzt sie auf den
  Nutzer bzw. seine explizite Coach-Freigabe.

Sicherung vor Einspielen:
`backup/schema/20260915151306_c498_c500_vor_einspielen.sql`.
Vollkette im Wegwerfstand und die vier C-498--C-500-Tests: gruen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

    public.user_allergies      2 Zeilen
      id, user_id, stoff_code, stoff_text, art,
      schwere, quelle, seit, notiz
    food_preferences.allergies WEG
    public.allergen_aliases    3 Aliase
    vier Policies: SELECT, INSERT, UPDATE, DELETE

`[cmd]` **Drei Aliase treffen 56.903 Zeilen** ? **die
Magnesiumstearat-Schreibweisen.**

`[read]` **Zwei echte Werte aus drei Zeilen migriert** ? **die
dritte war `{}`.**

### Meine Suche war falsch

`[cmd]` **Ich habe in `coach.client_permissions` gesucht:**
**sieben Spalten, keine `allergies_visibility`** ? **und daraus
geschlossen, die Freigabe fehle.**

`[cmd]` **Sie liegt in EIGENEN Tabellen:**

    coach.allergy_permissions
      coach_id, client_id, visibility, expires_at,
      changed_by
    coach.allergy_permission_change_log
      permission_id, change_kind, old_value,
      new_value, changed_by, changed_at

`[read]` **Genau *,,eigene Freigabe, im Protokoll"*** ? **nicht
als achte Spalte an die bestehenden sieben gehaengt.**

`[read]` **Neunter falscher Befund heute, wieder derselbe
Fehler.**

`[cmd]` **Und `old_value`/`new_value` im Protokoll** ?
**Toms Begruendung war** *,,auch als sicherheit gegenueber
seinem kunden"*.

**Abgenommen.**


