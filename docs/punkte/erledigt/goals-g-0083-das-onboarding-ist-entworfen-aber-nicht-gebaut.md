---
nr: G-83
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-08-21
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: OFFEN
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-83 - Das Onboarding ist entworfen, aber nicht gebaut

## Befund

(berichtigt 2026-08-20). **Der urspruengliche Befund war falsch.**

  `[cmd]` **Der G-80-Agent meldete:** *„Die einzige Datei ist der
  Klienten-Assistent im Coach-Modul."* **Das stimmt fuer den Code.**

  `[cmd]` **Aber `module-onboarding.jsx` existiert** — **361 Zeilen,
  ein vollstaendiger Assistent:**

  | Schritt | |
  |---|---|
  | 1 | **Willkommen** — *„Elf Module, ein Bild … nichts verlaesst dein Konto, bis du es entscheidest."* |
  | 2 | **Grunddaten** — Name, Geschlecht, Geburtsdatum, Groesse, Gewicht, Land |
  | 3 | **Ziele** — ein Hauptziel aus sechs, mehrere Nebenziele, Zielgewicht, Zielfettanteil, Datum |
  | 4 | **Trainingsart** — setzt den Aktivitaetsfaktor |

  `[read]` **Und Schritt 4 traegt die Begruendung mit:** *„Setzt deinen
  Aktivitaetsmultiplikator — **1,725 fuer fuenf harte Einheiten die
  Woche**."*

  `[cmd]` **Genau der Wert, den C-122 als falsch gesetzt gemessen hat**
  — `very_active` bei 0,58 Trainings je Woche, **1.030 kcal Abstand.**
  **Der Entwurf haette es verhindert.**

  `[cmd]` **Schritt 2 und 3 speisen `profiles` und `user_goals`** —
  beide Tabellen stehen. **Der Erfahrungsgrad (C-118) gehoert hier
  hinein.**

## Auftrag — die drei Onboarding-Punkte zusammenfuehren

**Mitbeauftragt: G-141, G-347.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · Drei Punkte, ein Thema

`[cmd]` **Du hast es selbst gemeldet:** **G-83 und G-141 liegen in
`todos/`, und G-222 hat gerade den Entwurf geliefert.**

`[read]` **Miss, was jeder der drei beschreibt** — **und ob dein
Entwurf sie abdeckt.**

`[read]` **Wo ein Punkt etwas verlangt, das dein Entwurf nicht
hat: sag es.** `[read]` **Wo er dasselbe sagt: schliessen.**

`[cmd]` **G-222 bleibt der tragende Punkt** — **er traegt den
Entwurf.**

### 2 · Und der Entwurf ist zu pruefen, nicht zu bauen

`[cmd]` **Du hast gemessen: nichts ist fuer den Betrieb noetig.**
`[cmd]` **Jede `food_preferences`-Spalte hat eine Vorgabe, 137 von
138 Naehrstoffen arbeiten ohne biologisches Geschlecht.**

`[read]` **Das ist das Ergebnis, das den Entwurf traegt:** **ein
Onboarding, das nichts erzwingt.**

`[read]` **Melde, wenn ein Schritt doch etwas voraussetzt** — **der
138. Naehrstoff zum Beispiel.**

### 3 · G-347 — die Anzeige zieht nach

`[cmd]` **Er stand in deinem letzten Buendel und ist nicht
abgenommen.**

`[read]` **Miss, ob er erledigt ist** — `[cmd]` **`NT` bei
Makronaehrstoffen, *Fettbegleitstoffe* nach *Fette*, vier
`strong_avoid`-Stellen.**

### Was nicht zu tun ist

**Kein Onboarding bauen** — **erst zusammenfuehren.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    G-83, G-141   was sie verlangen, was der Entwurf abdeckt
    Luecken       was fehlt, benannt
    138.          welcher Naehrstoff biologisches Geschlecht braucht
    G-347         erledigt / was fehlt

## Bericht

**Claude Code, 2026-09-06. Zusammengefuehrt, nicht gebaut.**

### 1 · Drei Punkte, drei verschiedene Sachen

`[read]` **Sie beschreiben nicht dasselbe** — **das ist der Grund,
warum sie nebeneinander liegen konnten, ohne dass es auffiel:**

    G-83    (goals)      eine VORLAGE     module-onboarding.jsx,
                                          361 Zeilen im Altrepo
    G-141   (quer)       ein BESCHLUSS    ONBOARDING_ADR.md,
                                          April 2026, Status Final
    G-222   (nutrition)  eine MESSUNG     was der Betrieb
                                          voraussetzt (2026-09-05)

`[read]` **Vorlage, Beschluss, Messung** — **drei Ebenen desselben
Themas, keine Doppelung.**

### Was der Entwurf abdeckt

`[cmd]` **Der ADR sagt den tragenden Satz selbst**
(`ONBOARDING_ADR.md:93`):

    Onboarding    = Quick-Start-Defaults
    Modul-Settings = Volle Konfiguration

`[read]` **Das ist genau das Ergebnis aus G-222, nur von der anderen
Seite hergeleitet** — **ich habe es gemessen, der ADR hat es im
April entschieden.**

`[cmd]` **Und er zieht dieselbe Grenze:** *,,Budget / Kochskill —
aus Nutrition FoodPreference, aber nicht im Onboarding"*
(Zeile 98). **Der Entwurf laesst beide ebenfalls draussen.**

`[cmd]` **Auch die Setup-Cards stuetzen ihn:** *,,Sie erscheinen nur
einmal pro Modul — kein permanenter Nag."* **Ein Onboarding, das
nichts erzwingt, braucht genau diesen Nachfassweg.**

`[read]` **Damit deckt der Entwurf den ADR in seinem Kern ab** —
**aber nicht in seinem Umfang.**

### 2 · Was die drei verlangen und der Entwurf NICHT hat

**Der Entwurf hat drei Schritte, der ADR sieben.** `[read]` **Vier
Schritte fehlen, und sie fehlen nicht alle gleich schwer:**

    ADR-Schritt 1   Name, Sprache, Einheiten     fehlt, unkritisch
                    profiles.locale hat CHECK de|en|th, nullable

    ADR-Schritt 3   Experience Level             fehlt, BLOCKIERT
                    -> siehe G-228: drei Skalen, keine zwei gleich

    ADR-Schritt 4   Primaerziel, 12 Goal-Typen   fehlt, BLOCKIERT
                    -> die Datenbank kennt vier, siehe unten

    ADR-Schritt 5   Training: Frequenz, Geraet   fehlt, ausserhalb
                    Trainingsmodul, nicht Nutrition

`[cmd]` **Und `KFA` aus ADR-Schritt 2 fehlt im Entwurf:** die Spalte
ist `goals.body_measurements.body_fat_pct`, **nullable** — also eine
Verfeinerung, kein Betriebsmittel. **Sie gehoert zu Schritt 1 des
Entwurfs, wenn er gebaut wird.**

### Ein Befund, der meine G-222-Aussage einschraenkt

`[read]` **Ich habe am 05.09. gemeldet: *,,nichts ist fuer den
Betrieb noetig"*.** `[cmd]` **Das gilt fuer `nutrition` — dort hat
jede Spalte eine Vorgabe.** `[cmd]` **In `goals` gilt es nicht.**

`[cmd]` **`goals.user_goals` hat drei Spalten ohne Vorgabe:**

    goal_type    NOT NULL, kein Default, CHECK auf vier Werte
    title        NOT NULL, kein Default
    gueltig_ab   NOT NULL, kein Default

`[read]` **Ein Ziel laesst sich nicht anlegen, ohne dass jemand
entscheidet** — **anders als eine Vorliebe.**

`[cmd]` **Aber es blockiert den Betrieb trotzdem nicht, und das ist
gemessen:** **`test-user` hat NULL Ziele und trotzdem eine Zeile in
`goals.nutrition_targets`** — `herkunft: formel`, `tdee: 2707,1`,
`kcal: 2977,8`, `nutrition_goal: gain_muscle`.

`[read]` **Die Zielwerte haengen an `profiles`, nicht an
`user_goals`.** **Deshalb zeigte das leere Tagebuch am 05.09.
*,,/157g Protein"* statt Striche.**

**Die Einschraenkung lautet also:** *nichts ist fuer den BETRIEB
noetig — aber ein Ziel anzulegen ist eine Entscheidung, keine
Vorgabe.* `[read]` **Der Entwurf bleibt gueltig; ADR-Schritt 4 ist
der einzige, der wirklich etwas voraussetzt.**

`[cmd]` **Das betrifft den Wortlaut der Abnahme von G-222**
(`erledigt/`, 2026-09-07): dort steht *,,Nichts ist fuer den Betrieb
noetig"* **unbeschraenkt.** `[read]` **Der Satz stimmt fuer
`nutrition` und fuer den Betrieb; er gilt nicht fuer das Anlegen
eines Ziels.**

`[read]` **G-222 ist abgenommen und liegt in `erledigt/` — ich
aendere ihn nicht** (`docs/` gehoert dem Orchestrator). **Die
Einschraenkung steht hier, damit sie nicht verloren geht.**

### Und Schritt 4 laeuft in denselben Fehler wie G-228

`[cmd]` **Der ADR verlangt 12 Goal-Typen.** `[cmd]` **Die Datenbank
kennt zwei Zielskalen, und keine hat zwoelf:**

    user_goals.goal_type      body_composition | performance |
                              health | lifestyle          (4)
    profiles.nutrition_goal   lose_weight | maintain |
                              gain_muscle | recomposition |
                              performance | health          (6)

`[read]` **Zwei Skalen, zwei Ueberschneidungen** (`performance`,
`health`) — **und die Zielwerte lesen die zweite, nicht die
erste.**

`[read]` **Das ist derselbe Befund wie G-228 bei den
Erfahrungsgraden, nur bei den Zielen** — **eine Spec-Zahl, die
keine Tabelle traegt.** **Wer ADR-Schritt 4 baut, muss zuerst
sagen, welche der drei Skalen gilt.**

### 3 · Was geschlossen werden kann

`[read]` **G-83 ist ein Fund, kein Auftrag:** *,,`module-onboarding.jsx`
existiert, 361 Zeilen"*. `[cmd]` **Der Befund stimmt** — und er ist
in den Entwurf eingegangen: **die vier Schritte der Vorlage decken
sich mit ADR 1-4.**

`[cmd]` **Sein zweiter Teil ist bereits erledigt:** *,,Der
Erfahrungsgrad (C-118) gehoert hier hinein"* — **C-118 ist gebaut,
`profiles.experience_level` steht.** **Was offen bleibt, ist die
Skala, und die ist G-228.**

`[read]` **G-141 ist eine Kenntnisnahme:** *,,es gehoert
gewusst, dass der ADR etwas anderes sagt"*. `[cmd]` **Genau diese
Abweichung habe ich am 05.09. unabhaengig nachgemessen** —
`beginner | advanced | pro | elite` in der Datenbank gegen
`intermediate` im ADR. **Sie ist jetzt in G-228 belegt, mit der
dritten Skala aus `rezept-lage.ts` dazu.**

**Vorschlag:**

    G-83    schliessen   Befund bestaetigt, in G-222 aufgegangen
    G-141   schliessen   Abweichung nachgemessen, lebt in G-228
                         weiter; die Setup-Cards als eigener
                         Punkt, siehe unten
    G-222   bleibt       traegt den Entwurf

`[read]` **Eines aus G-141 geht dabei NICHT in G-222 auf** und
waere sonst verloren: `[cmd]` **die *Post-Onboarding Setup-Cards*
— *,,eine eigene Bauform, die niemand kennt"*.**

`[read]` **Sie sind der Gegenpart zum ueberspringbaren
Onboarding:** wer alles ueberspringt, braucht einen Weg zurueck.
**Das gehoert als eigener Punkt angelegt, nicht mit G-141
geschlossen.**

### Der 138. Naehrstoff

**Der Auftrag fragt danach — es ist `WATER`.**

    male     2.500 g/Tag    EFSA DRV Summary Tables v4, 09/2017
    female   2.000 g/Tag    Table 3: adults >=18 y

`[cmd]` **Zwei Zeilen, keine `both`-Zeile** — **als einziger von
138.** `[read]` **Der Unterschied ist belegt, nicht gesetzt:**
Quelle, Version und Fundstelle stehen an der Zeile.

`[read]` **Damit ist die Antwort auf die Frage des Auftrags:** **ein
Schritt setzt etwas voraus, aber nur fuer einen einzigen Richtwert.**
**Wer das Geschlecht nicht angibt, verliert die Wasserempfehlung** —
**alles andere rechnet weiter.**

`[read]` **Das ist kein Grund fuer ein Pflichtfeld.** **Es ist ein
Grund, an genau dieser Kachel zu sagen, warum sie leer ist** — so
wie es `mikro-lage.ts:362` fuer das unvollstaendige Profil bereits
tut.

### 4 · G-347 — erledigt, und abgenommen

`[cmd]` **Die Datei liegt in `erledigt/`, Abnahme vom 2026-09-07
zusammen mit G-345.** **Nachgemessen statt geglaubt:**

    NT bei Makros           `naehrstoff-anzeige.ts:166`
                            if (code === 'NT') return 'Protein'
    Fettbegleitstoffe       Zeile 58: 'Kohlenhydrate', 'Fette',
                            'Fettbegleitstoffe', 'Protein'
                            -> steht nach Fette
    strong_avoid            4 Fundstellen, alle Kommentare
                            (vorlieben-aktionen, daumen-schreiben,
                            food-search x2) - kein lebender Code

`[cmd]` **`strong_avoid` ist seit C-408 aus dem CHECK.** **Die vier
Stellen erklaeren, dass er weg ist** — **sie benutzen ihn nicht.**

**G-347 ist zu.**

### Eine Abweichung, die gemeldet gehoert

`[cmd]` **Die Punktdatei nennt G-347 als dritten Mitauftrag, der
Auftrag im Chat nennt nur G-141.** `[read]` **Nach CLAUDE.md gilt
die Datei** — **deshalb gemessen und berichtet.**

`[cmd]` **Und zwei Punkte tragen dieselbe Nummer G-347:**
`nutrition-c-0347-generelle-ausschluesse-in-food-search.md` und
`nutrition-g-0347-die-anzeige-zieht-nach.md`. **Beide in
`erledigt/`** — C- und G-Reihe, also kein Nummernkonflikt, aber
beim Suchen verwechselbar.

### Gemessen, nicht gebaut

    geaendert           nichts am Code
    dev@lumeos.app      nicht geschrieben, 730 Mahlzeiten
    test-user           nur gelesen
    gestaged            nichts

## Abnahme

**2026-09-07, Orchestrator.**

### Keine Dubletten, sondern drei Sorten

`[cmd]` **Vorlage, Entscheidung und Messung** — **nicht dreimal
dasselbe.**

`[read]` **Ich hatte gefragt, ob sie sich doppeln.** `[read]` **Sie
beschreiben denselben Gegenstand aus drei Richtungen** — **und keine
davon ist ueberfluessig.**

`[cmd]` **Und der ADR nennt das Kernprinzip des Entwurfs
unabhaengig** — **zwei Quellen, dieselbe Aussage.**

### Er hat seine eigene Aussage berichtigt

`[read]` **Sein G-222-Bericht sagte: *,,nichts ist fuer den Betrieb
noetig."***

`[cmd]` **Gemessen: `goals.user_goals` hat Pflichtspalten** —
`goal_type`, `title`, `status`, `priority`.

`[read]` **Die Aussage galt fuer `food_preferences`, nicht fuer
alles.** `[read]` **Er hat es selbst eingeschraenkt, ohne dass ich
nachgefragt habe.**

### Der 138. Naehrstoff ist `WATER`

`[cmd]` **137 von 138 arbeiten ohne biologisches Geschlecht** —
**der eine ist Wasser.**

`[read]` **Das ist plausibel:** **der Wasserbedarf haengt am
Koerpergewicht und an der Zusammensetzung.**

### Zwei Sachen bleiben bei Tom

`[cmd]` **1. Die Zielskala.** **Vier `goal_type`, fuenf
`difficulty_level`, zwoelf im ADR** — **die zwoelf passen zu keiner
Tabelle.**

`[read]` **Mein Verdacht steht im Folgeauftrag:** `[cmd]` **`subtype`
liegt optional daneben** — **es koennten zwei Ebenen sein, nicht drei
Skalen.**

**Als G-352.**

`[cmd]` **2. Die Setup-Karten** — **gemeldet, damit sie nicht mit
G-141 verschwinden.** **Als G-353.**

`[read]` **Beide Male hat er einen Verlust vorhergesehen, statt ihn
geschehen zu lassen.**

**Abgenommen.**

