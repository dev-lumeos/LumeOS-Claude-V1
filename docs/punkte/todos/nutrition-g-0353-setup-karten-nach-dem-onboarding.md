---
nr: G-353
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-141
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-353 — Setup-Karten nach dem Onboarding

## Befund

Aus G-83, Claude Code, 2026-09-07, gemeldet damit es nicht
verlorengeht.

`[read]` **Der Onboarding-Entwurf ist dreistufig und
uebersprungbar** (G-222).

`[read]` **Wer ueberspringt, hat Vorgaben** — **aber keine
Einladung, sie zu ersetzen.**

`[cmd]` **G-141 beschreibt Karten, die nach dem Onboarding
erscheinen** — *,,leg deine Mahlzeiten fest"*, *,,waehle dein
Ziel"*.

`[read]` **Sie gehen verloren, wenn G-141 geschlossen wird** —
**deshalb ein eigener Punkt.**

## Was zu klaeren ist

`[read]` **Wann verschwindet eine Karte?** `[cmd]` **Wenn der
Nutzer die Sache erledigt** — **oder wenn er sie wegwischt?**

`[read]` **Und wie viele auf einmal:** **fuenf Karten sind ein
zweites Onboarding, das man nicht ueberspringen kann.**

`[read]` **Der Unterschied zum Onboarding ist die Freiwilligkeit** —
**eine Karte ist ein Angebot, ein Schritt ist ein Weg.**

## Auftrag — die vier fehlenden Schritte

**Mitbeauftragt: G-141, C-193.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-353 — die Setup-Karten

`[read]` **Du hast sie gemeldet, damit sie nicht verlorengehen** —
richtig.

`[read]` **Entwirf sie:** **wann erscheint eine, wann verschwindet
sie, wie viele auf einmal?**

`[read]` **Der Unterschied zum Onboarding ist die Freiwilligkeit** —
**eine Karte ist ein Angebot, ein Schritt ist ein Weg.**

`[cmd]` **Nicht bauen** — entwerfen.

### 2 · G-141 — was davon abgedeckt ist

`[cmd]` **Du hast gemessen: die drei Punkte sind Vorlage,
Entscheidung und Messung** — **keine Dubletten.**

`[read]` **Miss, was von G-141 nach G-353 uebrigbleibt** — **und
schliess ihn, wenn nichts.**

### 3 · Die vier fehlenden Schritte

`[cmd]` **Du hast sie benannt, und zwei blockieren wirklich.**

`[read]` **Schreib je Schritt auf, was ihn blockiert** — **und ob
die Blockade eine Entscheidung ist oder Arbeit.**

`[cmd]` **Bei den Zielen ist es eine Entscheidung** (G-352) — **vier
`goal_type`, fuenf `difficulty_level`, zwoelf im ADR.**

`[read]` **Mein Verdacht: es sind keine drei Skalen, sondern zwei
Ebenen.** `[cmd]` **`subtype` steht optional daneben** — **das
koennte der Ort fuer die zwoelf sein.** `[read]` **Miss es.**

### Was nicht zu tun ist

**Kein Onboarding bauen** — **die Entscheidung zu den Zielen fehlt.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Setup-Karten   entworfen, mit Verschwindregel
    G-141          was uebrigbleibt / geschlossen
    vier Schritte  je Blockade: Entscheidung oder Arbeit
    subtype        traegt es die zwoelf? gemessen

## Bericht

**Claude Code, 2026-09-06. Entworfen, nicht gebaut.**

### 3 · Zuerst die Ziele — Toms Verdacht stimmt, und er greift weiter

`[read]` **Der Verdacht:** *,,keine drei Skalen, sondern zwei Ebenen.
`subtype` koennte der Ort fuer die zwoelf sein."*

`[cmd]` **Gemessen: `goals.user_goals.subtype` ist `text`, nullable
— und hat KEINEN CHECK.** **Eine freie zweite Ebene unter den vier
`goal_type`.**

`[cmd]` **Und sie ist bereits belegt, mit genau dieser Bedeutung:**

    goal_type          subtype              difficulty_level
    body_composition   cut                  challenging
    body_composition   gain_muscle          moderate
    performance        strength             aggressive
    performance        training_capacity    (leer)
    lifestyle          cardio_frequency     moderate

`[read]` **Zwei Ebenen, wie vermutet** — grob und fein.

### Eine Berichtigung an meiner eigenen Meldung

`[cmd]` **Ich habe in G-83 `difficulty_level` neben `goal_type`
gestellt, als waere es eine dritte Zielskala.** `[cmd]` **Das ist
falsch: `easy | moderate | challenging | aggressive | unrealistic`
ist die SCHWIERIGKEIT eines Ziels, keine Zielart.**

`[read]` **Es ist eine dritte ACHSE, keine dritte Skala** — **sie
konkurriert nicht mit den anderen beiden, sie steht quer dazu.**

### Wo die zwoelf wirklich hingehoeren

`[cmd]` **Der ADR nennt sie beispielhaft:** *,,12 Goal-Typen
(`lean_bulk`, `moderate_cut`, `contest_prep`...)"*.

`[cmd]` **`lean_bulk` und `contest_prep` sind in dieser Codebasis
KEINE Zieltypen — sie sind `phase_type`.** `[cmd]` **Und die Tabelle
steht live:**

    goals.goal_phases.phase_type   NOT NULL, CHECK auf NEUN Werte
      fat_loss · lean_bulk · maintenance · recomp · contest_prep
      reverse_diet · expert_bb_annual · mini_cut · peak_week

    belegt auf dev: maintenance (3), lean_bulk (2)

`[cmd]` **Fuenf der neun stehen woertlich in der Spec-Liste, aus der
der ADR zitiert** — `contest_prep`, `lean_bulk`, `mini_cut`,
`recomp`, `reverse_diet`.

`[cmd]` **Die Quelle der ,,zwoelf" ist
`docs/BrainstormDocs/Core/auth_API.md:224`** — **und sie traegt
FUENFZEHN Werte, nicht zwoelf**, davon elf mit Modifikator:

    bulk · cut · recomp · maintain · performance
    lean_bulk · clean_bulk · aggressive_bulk
    conservative_cut · moderate_cut · aggressive_cut
    mini_cut · contest_prep · body_recomp · reverse_diet

`[read]` **Diese Liste vermischt grob und fein in einem flachen
Aufzaehlungstyp** — `bulk` steht neben `lean_bulk`, `cut` neben
`moderate_cut`. **Genau diese Vermischung hat das laufende Schema
aufgeloest**, indem es sie auf zwei Spalten verteilt.

`[cmd]` **Und die dritte Achse steht auch schon da:**
`goal_phases.variant`, Vorgabe `'moderate'` — **das ist die Stelle
fuer `conservative | moderate | aggressive`.**

### Die Antwort auf G-352

`[read]` **Es sind keine drei widersprechenden Skalen.** **Es sind
vier Achsen, und drei davon sind gebaut:**

    goal_type          WAS         4 Werte, CHECK, NOT NULL
    subtype            WELCHES     frei, kein CHECK
    phase_type         WIE         9 Werte, CHECK, live belegt
    variant            WIE STARK   frei, Vorgabe 'moderate'
    difficulty_level   WIE SCHWER  5 Werte (quer dazu)

`[read]` **Der ADR beschreibt keine fuenfte Liste** — **er beschreibt
`phase_type`, unter einem falschen Namen.** `[read]` **,,12
Goal-Typen" ist eine Zaehlung aus einem Brainstorm-Dokument, das die
Ebenen noch nicht getrennt hatte.**

**Was Tom entscheiden muss, ist damit kleiner als gedacht:**

    1  Ist `subtype` frei oder bekommt er einen CHECK?
       - frei laesst jeden Wert zu, auch Tippfehler
       - ein CHECK braucht die Liste, und die ist noch nicht da
    2  Waehlt das Onboarding `goal_type`+`subtype`, oder `phase_type`?
       - die Zielwerte lesen HEUTE `profiles.nutrition_goal`,
         nicht `user_goals` (gemessen in G-83)

`[read]` **Keine Entscheidung ueber zwoelf gegen vier** — **die Frage
ist, welche der gebauten Achsen das Onboarding anfasst.**

### 3b · Die vier fehlenden Schritte, je Blockade

    ADR 1  Name, Sprache, Einheiten        ARBEIT
           profiles.locale: CHECK de|en|th, nullable.
           Nichts zu entscheiden - es fehlt nur ein Formular.

    ADR 3  Experience Level                ENTSCHEIDUNG
           G-228/E-46. Drei Skalen, keine zwei gleich, und die
           Multiplikatoren haben keine Quelle. Tom hat das Ziel
           genannt ("je mehr Stufen umso genauer"), nicht die Zahl.

    ADR 4  Primaerziel                     ENTSCHEIDUNG, klein
           Nicht "vier gegen zwoelf" - siehe oben. Zu entscheiden:
           welche Achse das Onboarding setzt, und ob subtype
           einen CHECK bekommt.

    ADR 5  Training: Frequenz, Geraet      ARBEIT, fremdes Modul
           Ausserhalb Nutrition. Gehoert dem Trainingsmodul,
           nicht diesem Punkt.

`[read]` **Zwei Entscheidungen, zwei Arbeiten** — **und nur eine der
beiden Entscheidungen (ADR 3) ist wirklich offen.**

### 1 · Die Setup-Karten

`[read]` **Der Unterschied, den der Auftrag nennt, traegt den ganzen
Entwurf:** *,,eine Karte ist ein Angebot, ein Schritt ist ein Weg."*

**Daraus folgen vier Regeln, nicht mehr.**

### Regel 1 — eine Karte erscheint, wenn eine Sache LEER ist

`[read]` **Nicht: wenn ein Modul unkonfiguriert ist.** `[cmd]`
**Konfiguriert ist es immer** — jede `food_preferences`-Spalte hat
eine Vorgabe (G-222). **Eine Karte, die auf ,,unkonfiguriert"
wartet, erscheint nie.**

`[read]` **Sondern: wenn eine Sache leer ist, die der Nutzer selbst
fuellen muss.** `[cmd]` **Gemessen auf `test-user`, 2026-09-06:**

    food_preferences   1 Zeile    Vorgabe steht -> KEINE Karte
    meal_slots         4 Zeilen   gesetzt       -> KEINE Karte
    nutrition_targets  1 Zeile    aus Formel    -> KEINE Karte
    user_goals         0 Zeilen   nur Nutzer    -> KARTE
    goal_phases        0 Zeilen   nur Nutzer    -> KARTE

`[read]` **Das ist derselbe Befund wie in G-83, von der anderen
Seite:** **wo eine Vorgabe steht, ist nichts anzubieten. Wo eine
Entscheidung fehlt, schon.**

`[cmd]` **Am 05.09. hatte `test-user` noch 0 Vorlieben und 0 Slots**
— **heute 1 und 4.** `[read]` **Ein Seed-Lauf hat sie angelegt
(`entry_source: seed`, 00:35 Uhr).** **Der Leerstand ist also kein
fester Zustand, und die Regel darf nicht auf eine Momentaufnahme
gebaut sein** — sie fragt die Tabelle, nicht ein Flag.

### Regel 2 — sie verschwindet, wenn die Sache getan ist

`[cmd]` **Der ADR sagt es:** *,,Setup-Cards verschwinden sobald das
Modul konfiguriert ist. Sie erscheinen nur einmal pro Modul — kein
permanenter Nag."*

`[read]` **Die Frage des Punktes war: erledigt ODER weggewischt?**
**Antwort: erledigt — und wegwischen braucht keinen Zustand.**

`[read]` **Begruendung:** ein Wegwisch-Zustand ist eine neue Spalte,
die vergisst, warum sie gesetzt wurde. **Wer die Karte wegwischt und
sein Ziel spaeter doch setzt, hat dieselbe leere Stelle und keine
Einladung mehr.**

`[read]` **Stattdessen: die Karte ist an die Leere gebunden, nicht an
eine Sichtung.** **Sie verschwindet, wenn die Zeile da ist, und
kaeme wieder, wenn der Nutzer sie loescht** — **was richtig ist, denn
dann ist die Stelle wieder leer.**

`[read]` **Das braucht KEINE Spalte** — **kein
`setup_card_dismissed`, kein `onboarding_step`.** `[read]` **Damit
faellt auch der Zustand weg, den ich in G-222 fuer das
ueberspringbare Onboarding noch fuer noetig hielt.**

### Regel 3 — hoechstens EINE auf einmal

`[read]` **Der Punkt nennt die Gefahr selbst:** *,,fuenf Karten sind
ein zweites Onboarding, das man nicht ueberspringen kann."*

`[read]` **Also: eine Karte je Ansicht, die mit dem hoechsten Rang.**
**Ist sie erledigt, ruecken die uebrigen nach** — **nicht alle
gleichzeitig.**

`[read]` **Rang nach Wirkung, nicht nach Vollstaendigkeit:**

    1  Ziel setzen        aendert Zielwerte und Makros
    2  Phase waehlen      aendert die Rate
    3  Erfahrungsgrad     BLOCKIERT (G-228) - keine Karte,
                          solange die Skala nicht steht

`[read]` **Eine Karte fuer etwas, dessen Skala nicht entschieden
ist, waere ein Angebot ohne Ziel** — **sie gehoert erst gebaut,
wenn E-46 steht.**

### Regel 4 — sie steht im Modul, nicht auf dem Dashboard

`[cmd]` **Der ADR zeigt sie je Modul** (Supplements, Recovery).
`[read]` **Das ist richtig und hat einen Grund: eine Karte im
Nutrition-Reiter kann *,,Ziel setzen"* sagen, weil dort die
Zielwerte stehen.** **Dieselbe Karte auf dem Dashboard waere ein
Hinweis ohne Ort.**

### Was es NICHT ist

`[cmd]` **Nicht `LeerHinweis`** (`leer-hinweis.tsx`, 29 Aufrufer).
`[read]` **Der erklaert eine Abwesenheit** — *,,hier stand ein
Entwurf mit erfundenen Zahlen"*. **Er bietet nichts an, und das ist
seine Aufgabe.**

`[read]` **Eine Setup-Karte ist das Gegenteil: sie hat einen Knopf.**
**Beide Bauformen nebeneinander zu haben ist richtig** — **sie
beantworten verschiedene Fragen** (*warum ist das leer* gegen *willst
du es fuellen*).

### 2 · G-141 — was uebrigbleibt

`[cmd]` **G-141 trug drei Sachen. Zwei sind erledigt, eine ist
dieser Punkt:**

    ADR ist final, 7 Schritte      -> in G-83 gemessen und
                                      gegen den Entwurf gehalten
    Abweichung der Erfahrungsgrade -> in G-228/E-46 belegt,
                                      lebt dort weiter
    Post-Onboarding Setup-Cards    -> DIESER PUNKT

`[read]` **Es bleibt nichts uebrig.** **G-141 kann geschlossen
werden** — sein letzter offener Inhalt ist G-353, und der ist
entworfen.

`[cmd]` **Der Bericht dazu steht bereits in der G-141-Datei**
(2026-09-06), **mit Verweis auf G-83.**

### 4 · C-193 — nicht mein Bereich

`[cmd]` **Die Punktdatei nennt C-193 als dritten Mitauftrag, der
Auftrag im Chat nennt nur G-141.**

`[cmd]` **C-193 liegt in `laufend_codex/` und traegt `agent: codex`,
beauftragt am 2026-09-07** — *MealCam warnt bei hart
ausgeschlossenen Zutaten*.

`[read]` **Nicht angefasst.** **Ein Punkt, der bei Codex laeuft,
gehoert nicht in meinen Bericht** — **gemeldet, damit die Zuordnung
im Auftragstext berichtigt werden kann.**

### Gemessen, nicht gebaut

    geaendert           nichts am Code
    dev@lumeos.app      nicht geschrieben, 730 Mahlzeiten
    test-user           nur gelesen
    gestaged            nichts

## Falsch geschlossen am 2026-09-07

`[cmd]` **Claude Code hat es gefunden, 2026-09-08:**

> *,,nutrition-g-0353 liegt in `erledigt/` mit einer Abnahme vom
> 2026-09-07 ? aber diese Abnahme misst die vier Zielachsen
> (`goal_type`, `subtype`, `phase_type`, `difficulty_level`), nicht
> Setup-Karten, und G-353 kommt in `apps/web/src` nirgends vor."*

`[read]` **Er hat nichts gebaut, statt zu raten** — richtig.

`[cmd]` **Die Abnahme gehoerte zu G-352.** `[read]` **Der
Orchestrator hat sie in die falsche Datei geschrieben** —
**derselbe Fehler wie beim Dateinamen von G-367.**

`[read]` **Der Punkt ist wieder offen.** **Die Setup-Karten sind
entworfen, aber nicht gebaut.**

### Was der Entwurf sagt

`[read]` **Sie haengen an der Leere, nicht am
Konfigurationszustand** — **deshalb braucht es keine Spalte fuer
*weggewischt*.**

`[read]` **Eine Karte verschwindet, weil die Sache erledigt ist** —
**und kommt zurueck, wenn der Zustand zurueckkehrt.**

