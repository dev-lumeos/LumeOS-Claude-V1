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

## Abnahme

_(Orchestrator, 2026-09-29. Jede Zahl unten selbst gemessen, nicht aus
dem Bericht uebernommen.)_

### A1 und A2 stimmen bis auf die Byte-Zahl

`[cmd]` **Nachgezaehlt gegen die laufende Datenbank:**

    Registereintraege                        21   (Bericht: 21)
    davon die vier neuen                   4/4   20260927034024, 20260928095000,
                                                 20260928150000, 20260928153000
    unregistrierte Dateien                   70   (Bericht: 70)
    Dumps in backup/                         65   (Bericht: 65)
    neuester Dump         20260928155121_g511_e1_vor_struktur.dump
    dessen Groesse                  473.970.119 Byte   (Bericht: bytegenau gleich)
    kein neuer Dump                          ja

`[cmd]` **Die fuenf Objekte stehen:**
`goal_phases.zielrate_pct_kg_woche`,
`nutrition_targets.tdee_herkunft`, `goals.phase_rate_rules`,
`goals.nutrition_macro_rules`, `goals.tdee_history`.

`[cmd]` **E1 ist gewahrt:** null Spalten auf `goals.goal_phases`, deren
Name `kcal` oder `kalorien` enthaelt.

`[cmd]` **Die Rate-Identitaet nachgerechnet:** 45 kg bei -1,0 %/Woche
gibt -495 kcal/Tag, 120 kg gibt -1320, 80 kg bei +0,25 % gibt +220.
**11 x Rate x Gewicht, bestaetigt.**

`[cmd]` **Sein Werkzeug liegt und ist getestet:**
`tools/migrations-objekte-pruefen.mjs` (12.878 Byte),
`tools/__tests__/migrations-objekte-pruefen.test.mjs` (2.578 Byte),
`tools/__tests__/fixtures/c554-gegenprobe.sql` (197 Byte).

`[cmd]` **Seine Wegwerf-Datenbank ist verworfen** — keine Datenbank mit
`c554` im Namen.

### Codex hatte recht, und der Auftrag hatte unrecht

`[cmd]` **Der Auftrag verlangte `goal_phases.tdee_herkunft`. Gebaut ist
`nutrition_targets.tdee_herkunft`.** Codex hat die Abweichung gemeldet
statt sie stillschweigend zu bauen, und seine Begruendung traegt:

`[read]` **Die TDEE-Herkunft erklaert eine gespeicherte Zielzeile,
nicht die Phase.** Eine Phase laeuft Wochen; der adaptive TDEE
aendert sich darin taeglich. Eine Spalte an der Phase koennte nur
EINEN Wert halten und waere ab dem zweiten Tag falsch.

`[cmd]` **Und es gibt einen zwingenden Beleg dafuer:**
`nutrition_targets` traegt jetzt auch `tdee_history_id` — einen Verweis
auf genau den Reihenwert, mit dem gerechnet wurde. **Ein Verweis auf
eine Zeile der TDEE-Reihe kann nicht an der Phase haengen**, weil die
Phase viele solche Zeilen ueberspannt. Die Spalte gehoert dorthin, wo
Codex sie gebaut hat.

`[read]` **Der Fehler war mein Auftrag, nicht seine Ausfuehrung.** Und
er hat richtig gehandelt, indem er keine fuenfte, unbeauftragte
Strukturaenderung erfunden hat.

### Den Zwei-Wahrheiten-Waechter habe ich behoben

`[cmd]` **Ursache, gemessen:** `zwei-wahrheiten-pruefen.mjs` arbeitet
mit einer Ausschlussliste. G-511 hat fuenf Metadatenfelder auf
`nutrition_targets` eingespielt — `phase_id`,
`zielrate_pct_kg_woche`, `body_weight_kg`, `tdee_herkunft`,
`tdee_history_id` — die dort nicht standen und deshalb als
Naehrstoffspalten gezaehlt wurden. **12 statt 7.**

`[read]` **Die Ausschlussliste ist die richtige Richtung und bleibt.**
Eine Einschlussliste waere bequemer und wuerde einen achten Naehrstoff
stillschweigend durchlassen — genau das, was der Waechter verhindert.
**`body_weight_kg` endet auf eine Einheit und ist trotzdem kein
Naehrstoff**: deshalb entscheidet eine benannte Liste und keine
Namensregel.

`[cmd]` **Ein zweiter Mangel war die Ursache dafuer, dass Codex raten
musste:** der Waechter meldete nur eine Zahl, nicht welche Spalten er
zaehlt. **Jetzt nennt er sie** und stellt die Frage, die vorher
fehlte: traegt die neue Spalte ein Naehrstoffziel (dann G-261 pruefen,
DANACH das Soll anheben) oder ist sie Rechenprotokoll (dann in die
Liste, Soll bleibt)? **,,Soll anheben, weil die Zahl gestiegen ist" ist
in beiden Faellen falsch** — und stand vorher als einziger Rat da.

`[cmd]` **In beide Richtungen belegt, gegen eine Wegwerf-Datenbank,
ohne die laufende anzufassen:**

    laufende DB                          7 von 7    gruen
    Nachbau in der Wegwerf-DB            7 von 7    gruen
    + vitamin_d_ug (achter Naehrstoff)   8 von 7    ROT, benannt
    + tdee_herkunft_notiz (Metadatum)    8 von 7    ROT, benannt
    Wegwerf-DB verworfen                 0 Reste
    laufende DB danach                   20 Spalten, unveraendert

`[read]` **Auch der zweite Sabotagefall faellt rot auf, und das ist
Absicht** — ein neues Feld, das niemand eingeordnet hat, soll eine
Einordnung erzwingen.

`[cmd]` **`pnpm gate`: Exitcode 0.** 2063 Tests, 18 Turbo-Tasks,
`serverimport` 63 Client-Chunks / 0 Treffer.

### Ein Befund, der bei dieser Abnahme abgefallen ist

`[cmd]` **Die Frage ,,hat Codex seine Wegwerf-DB verworfen?" gab 27
Namen zurueck, von denen keiner zu C-554 gehoerte.** Weiter gemessen:
**150 Datenbanken ausser der laufenden, 207 GB, davon 49 mit `_final`
im Namen.** Die laufende belegt 4.816 MB. **Das ist A-80.**

`[read]` **Nicht Codex' Sache** — die aeltesten stammen aus dem
C-490er-Bereich und von mehreren Agenten. Seine war weg.
