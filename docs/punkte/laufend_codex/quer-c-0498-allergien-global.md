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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

