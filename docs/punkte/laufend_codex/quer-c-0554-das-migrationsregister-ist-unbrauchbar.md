---
nr: C-554
typ: blocker
modul: quer
schwere: hoch
angelegt: 2026-09-28
agent: codex
beauftragt: 2026-09-28

braucht: []
quellen:
  - supabase/README.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - supabase_migrations.schema_migrations
  dateien:
    - supabase/README.md
    - supabase/migrations

zahlen:
  gemessen: 2026-09-28
  registereintraege: 17
  migrationsdateien: 91
  nicht_registriert: 74
  neuester_eintrag: 20260915142200
  stichprobe: 12
  stichprobe_trotzdem_da: 3
  geister: 0
---

# C-554 - das Migrationsregister sagt nicht, was in der Datenbank steht

## Der Befund

`[cmd]` **Gemessen 2026-09-28 gegen die laufende Datenbank:**

    Registereintraege in supabase_migrations.schema_migrations   17
    Dateien in supabase/migrations/                              91
    ------------------------------------------------------------- --
    nicht registriert                                            74
    neuester Registereintrag                        20260915142200
    Registereintraege ohne Datei (Geister)                        0

`[cmd]` **Das Register endet am 2026-09-15.** Dreizehn Tage Arbeit
aus `migrations/` sind dort nicht vermerkt.

## Warum die 74 keine Arbeitsliste sind

`[cmd]` **Stichprobe quer durch die 74, objektweise gegen
`information_schema` gefragt — existiert das Hauptobjekt trotzdem?**

    DA     20260906 c419  marketplace.wallets
    DA     20260924 c540  nutrition.animal_species
    DA     20260924 c541  public.profiles.experience_level
    FEHLT  20260909 c441  medical.injection_site_catalog
    FEHLT  20260912 c485  supplements.dsld_products
    FEHLT  20260916 c503  nutrition.allergy_catalog
    FEHLT  20260917 c508  nutrition.user_allergies
    FEHLT  20260921 c530  training.muscle_group_aliases
    FEHLT  20260926 c544  medical.koerperorte
    FEHLT  20260927 c546  training.muscle_anatomy
    FEHLT  20260928 g526  goals.nutrition_macro_rules
    FEHLT  20260928 g529  goals.phase_rate_rules

`[cmd]` **3 von 12 sind strukturell da, obwohl nicht registriert.**

`[read]` **Damit ist das Register in beide Richtungen unbrauchbar:**
es verschweigt Vorhandenes, und es belegt nichts. Eine Liste
nicht registrierter Dateien ist **keine** Liste fehlender Strukturen.

## Was daraus folgt — die Regel

`[read]` **`supabase db push` gegen die laufende Datenbank ist hier
gefaehrlich, nicht hilfreich.** Es wuerde 74 Dateien anwenden
wollen, darunter mindestens drei, deren Objekte schon stehen. Ob
eine davon ohne `if not exists` abbricht, entscheidet sich erst im
Lauf — und der Lauf ist nicht atomar ueber alle Dateien.

`[read]` **Der Zustand wird objektweise gemessen, nicht aus dem
Register gelesen.** Vor jedem Einspielen: die Objekte der
betroffenen Datei gegen `information_schema` fragen. Danach
dieselbe Frage erneut. Das ist die Pruefung; das Register ist nur
Buchhaltung.

## Warum das so gekommen ist

`[cmd]` **`supabase/README.md` beschreibt die Ursache selbst:** die
laufende Datenbank ,,entstand ueber eine Kette einzeln ausgefuehrter
Skripte". Der Zustand kommt aus `supabase/_pipeline/`, nicht aus
`migrations/`. `migrations/` ist der deploybare Strukturweg fuer
**andere** Umgebungen.

`[cmd]` **Und derselbe Text fuehrt den Umtrag seit 2026-08-05 als
offenen Punkt 1:** ,,Der Umtrag des Registers der laufenden DB
(Geist-Eintrag raus, Baseline rein) ist vorgelegt und wartet auf
Toms Freigabe." **Der Geist ist inzwischen weg** (0 gemessen), der
Umtrag der uebrigen 74 nicht gemacht.

`[read]` **Das ist keine Nachlaessigkeit eines Agenten.** Es ist die
Folge davon, dass zwei Wege nebeneinander laufen und nur einer ein
Register fuehrt.

## Nachweiszeilen

**A1** — **Objektweise Ist-Aufnahme fuer alle 74.** Je Datei das
Hauptobjekt und, wo es eine Spalte ist, die Spalte. Ergebnis ist
eine Tabelle mit drei Spalten: Datei, Objekt, `da`/`fehlt`. Keine
Schaetzung, keine Ableitung aus dem Dateinamen. **Erst danach ist
bekannt, wie gross die Luecke wirklich ist.**

**A2** — **Ein Waechter, der diese Frage stellt**, statt dass sie
jemand von Hand beantwortet: ein Werkzeug liest `migrations/`, zieht
je Datei die angelegten Objekte heraus und fragt die laufende DB.
Sollstand ist die Zahl der belegten Abweichungen; eine neue
Abweichung macht ihn rot. **Gegenprobe:** ein erfundener
Objektname in einer Kopie muss ihn rot machen.

**A3** — **Erst wenn A1 liegt: der Registerumtrag.** Welche der 74
strukturell da sind, werden nachgetragen (`insert` ins Register,
ohne die Datei auszufuehren); welche fehlen, werden entweder
eingespielt oder als bewusst nicht eingespielt vermerkt. **Das ist
eine Entscheidung fuer Tom, kein Agentenauftrag.**

**A4** — **`supabase/README.md` nachziehen:** offener Punkt 1 traegt
den gemessenen Stand (74, nicht ,,ein Geist-Eintrag"), und die
Regel aus diesem Punkt steht unter `## Regeln`.

## Was dieser Punkt NICHT sagt

`[read]` **Nicht, dass die laufende Datenbank kaputt ist.** Sie
traegt, was die Anwendung liest. Gemessen wurde nur, dass niemand
aus dem Register ablesen kann, **was** sie traegt.

`[read]` **Nicht, dass die 74 eingespielt werden muessen.** Ein Teil
davon gehoert in die Kette und nicht in die laufende DB. Welche,
sagt A1.

## Nebenbefund

`[cmd]` **Die Messung ,,Voraussetzungen der vier Goals-Migrationen"
war im ersten Lauf falsch:** das Muster fing `alias.spalte`
(`bm.user_id`, `gp.id`, `p.id`, `ds.user_id`, `f.stufe`) und meldete
fuenf fehlende Objekte, die keine Objekte sind. **Es fehlte die
Gegenprobe.** Ein Muster ohne eingebauten Fehler misst nichts —
dieselbe Klasse wie die vier Fehlmessungen aus PowerShell-Quoting
vom selben Tag. Die berichtigte Messung: alle echten
Voraussetzungen der vier Dateien stehen in der laufenden DB.
