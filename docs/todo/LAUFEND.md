# Laufende Auftraege

**Stand: 2026-09-29, 12:05**

| Agent | Nr | Inhalt | Stand |
|---|---|---|---|
| Codex | G-536 | der Strategiekatalog fehlt ganz — Schicht 2 | **laeuft**, raus 29.09., 11:50 |
| Claude Code | G-537 | Ziele sind nicht anlegbar | **laeuft**, raus 29.09., 11:50 |
| Codex | G-538 | Phasen haengen an keinem Ziel | **vorbereitet** in `next/` |
| Claude Code | — | — | `next/` leer, mit Grund: der naechste Schritt (G-538 Teil 2) wartet auf Codex |

`[cmd]` **Zwei Nachtraege sind um 12:00 an die laufenden Auftraege
gegangen**, weil `module-goals-editor.jsx` beim Quellendurchgang eine
Praemisse umgeworfen hat:

- **G-536:** `goal_phases.parameters` ist **nicht** ueberfluessig. Der
  Editor sagt *„Personal override — the shipped defaults stay intact"* —
  Katalog und Override sind zwei Ebenen. Nur `variant` faellt.
- **G-537:** `linked_modules` ist die **Datenquelle** fuer den Ist-Wert,
  nicht Zierde. Das Feld wird auswaehlbar gebaut, auch ohne Spalte.

`[read]` **Das ist der Zweck von `next/`, an einem echten Fall:** waehrend
die Agenten arbeiteten, hat der Durchgang durch die Quellen die Praemisse
geaendert — und der Auftrag liess sich noch korrigieren, bevor in die
falsche Richtung fertig gebaut wurde.

---

## Die Bauordnung steht — `docs/ssot/130-goals-bauordnung.md`

**Tom, 2026-09-29, 11:56, die kuerzeste Fassung:**

> subnav goals: user kann einzelne oder mehrere ziele setzen
> subnav phase engine: user kann seine goals planen, terminieren,
> editieren

`[read]` **Planen, terminieren, editieren sind Operationen auf Zielen**,
nicht auf einem eigenen Objekt. Sechs Ebenen folgen daraus:

    1  Ziele                mehrere, messbar, verknuepfte Module   G-537
    2  Strategiekatalog     17 ausgelieferte Definitionen          G-536
    3  Terminierung         Ziel + Strategie + Zeitfenster         G-538
    4  Editor               persoenlicher Override, 12 Reiter      G-539
    5  Vorlagen             eigene und geteilte                    G-540
    6  Automatik            Waechter, Wochenanpassung              G-520, gebaut

`[cmd]` **Es sind drei Goals-Mockups, nicht eines.**
`module-goals-editor.jsx` (569 Zeilen) war bis heute ungelesen und traegt
den `anchor`-Reiter: Showdatum setzen, und Prep start, Mid, Late,
Refeeds, Peak week, Show day rechnen rueckwaerts. **Das ist, was Tom mit
„terminieren" meint.**

### Die Wurzel, die der Durchgang gefunden hat

`[read]` `supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql:88`:

```
-- 2. Phasen, unabhaengig vom konkreten Ziel waehlbar.
goal_id  UUID REFERENCES goals.user_goals(id) ON DELETE SET NULL,
```

**Die Tabelle wurde mit dem Gegenteil von Toms Satz gebaut.** Daraus
folgt, was auf dem Bildschirm steht: der Reiter bietet Phasentypen an,
weil er keine Ziele kennt. Dazu erlaubt `uq_goal_phases_one_open` eine
offene Phase je **Nutzer** statt je **Ziel** — zwei Ziele parallel sind
damit verboten. Beides ist G-538.

---

## Bereich je Agent

    supabase/_pipeline/, supabase/migrations/   Codex
    apps/web/src/app/v2/                       Claude Code
    apps/coach/src/                            Claude Code
    packages/ui, packages/scoring              Claude Code (mit Gegenprobe)
    docs/, tools/                              Orchestrator

---

## Was auf Tom wartet

    C-554 A3   der Registerumtrag fuer die 70 — welche nachgetragen,
               welche eingespielt, welche bewusst nicht. Die Objektmatrix
               liefert: node tools/migrations-objekte-pruefen.mjs
    A-80       150 Wegwerf-Datenbanken, 207 GB. Platte ist NICHT das
               Problem (6.726 GB frei) — die 49 mit "_final" im Namen
               sind es. Orchestrator legt die Verwerfliste vor.
    A-79       backup/-Aufbewahrung, 3.958 MiB gegen ein Limit von 2.5 GiB
    A-78       Waechter auf Bezeichner-Ueberschneidung (Dubletten)
    G-540      drei Entscheidungen zu Vorlagen: gehoeren geteilte
               Vorlagen mit Bewertung zu Goals oder zum Marketplace,
               nimmt "Share with coach" den Weg der Freigabeschicht,
               und wer pflegt die LumeOS-Vorlagen

`[cmd]` **G-521 A1 ist erledigt, ohne Auftrag.** Die vier tragenden
Zahlen ohne Seitenbeleg stehen in drei Quellen: `definitions.ts`,
`GOAL_PHASES` in `module-goals-pro.jsx:5-69` und
`docs/specs/Goals/PHASE_MODELS.md`. Sie gehoeren an den Katalogeintrag
(G-536), nicht in `phase_rate_rules` — die bleibt leer und wird zum
Fallen vorgelegt.

---

## Was ausdruecklich wartet

**Tom, 2026-09-29:** *„physique oder pose interessiert mich noch nicht,
wenn wir nicht mal in der lage sind grundlagen in der ui darzustellen."*

Damit warten: Physique-Verhaeltnisse, Pose-Sessions, C-494 (IFBB-Klassen
und Pflichtposen), G-139 (Fortschrittsfotos).

---

## Die vier Entscheidungen aus G-521

    E1  die neun Phasenarten bleiben als Auswahl -- die Parameter
        haengen an der RATE, nicht an der Art            -> G-529
    E2  das Proteinband wird nach Trainingsstatus geteilt -> G-526
    E3  recomp bleibt eine Phase, die Baender sind unsere
    E4  contest_prep und expert_bb_annual bekommen eine
        eigene Struktur                                 -> G-530

`[cmd]` **kcal/Tag = 11 x Rate(% KG/Woche) x Gewicht(kg)**, aus 7700
kcal je kg. Gegen die eingespielte Struktur nachgerechnet: 45 kg bei
-1,0 %/Woche gibt -495, 120 kg gibt -1320, 80 kg bei +0,25 % gibt +220.
Beide Groessen werden angezeigt, gespeichert wird die Rate.

`[read]` **E1 loest sich mit G-536 auf.** Das Altrepo speichert beides —
den Faktor und die Rate — aber an der **Definition**, nicht am
Nutzerdatensatz. Wir haben die Rate an die Instanz gehaengt und dann
gefragt, woher die Baender kommen. Sie kommen vom Katalogeintrag.

---

## Der Zyklus, wie er laeuft

`[cmd]` **`00-LIESMICH.md:444-463`, Toms Wortlaut vom 30.08.:**
*,,du spielst nun jedesmal den vollen cycle durch ohne mein befehl"*.

    1  Bericht ueberfliegen - ist der vorbereitete Auftrag betroffen?
    2  falls ja: anpassen
    3  next/ eine Ebene hoeher - der Auftrag geht raus
    4  Bericht nachmessen, Abnahme schreiben
    5  neue Befunde als Punkte
    6  committen, Commit-Hash nachtragen, DANN nach erledigt/
    7  next/ wieder fuellen

**Fertig ist, wenn Schritt 7 steht.** Kein Schritt braucht eine
Aufforderung.

`[read]` **Die vier Stufen:**

    todos/                    offen, kein Auftrag geschrieben
    laufend_<agent>/next/     Auftrag geschrieben, noch nicht raus
    laufend_<agent>/          laeuft
    erledigt/                 abgenommen

`[cmd]` **Ein vorbereiteter Auftrag traegt `agent:` und `beauftragt:`
noch nicht** — er bekommt sie beim Verschieben eine Ebene hoeher
(`00-LIESMICH.md:430`). `tools/zyklus-pruefen.mjs` zaehlt das, Soll 0.

`[read]` **Der Umzug und die Uebergabe sind EINE Handlung** — wer
verschiebt und nicht uebergibt, hat nichts beauftragt. Das ist am 29.09.
einmal passiert: G-520 stand eine halbe Stunde als ,,raus", und Claude
Code war frei, ohne dass es jemand sah.

---

## Zwei Regeln

`[cmd]` **Ein Auftrag, ein Bericht.** Ketten sind erlaubt, aber sie
melden EINMAL am Ende — kein Zwischenstand.

`[cmd]` **Nichts laeuft losgeloest im Hintergrund** — ausser
`tools/server.py start`, das ein Log schreibt.

---

## Lehren

`[cmd]` **Der Orchestrator plante Speicherorte statt Artefakte.** E-1,
G-511, G-529, G-531, G-533 und G-520 haben alle geregelt, **wo eine Zahl
liegt**. Keiner hat geregelt, **was Tom sieht und tut**. Tom:
*„du verzettelst dich immer wieder in irgendwas anstatt dich an das
grosse ganze zu halten."* Die Bauordnung ist entlang der vier Verben
geschnitten, nicht entlang der Tabellen.

`[cmd]` **Drei Quellen waren da und wurden nicht gelesen.**
`module-goals-editor.jsx` (569 Zeilen, der ganze Editor),
`docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md` (nennt die
Rangfolge der Quellen seit dem 16.08.) und `docs/specs/Goals/PHASE_MODELS.md`
(alle Baender als JSON). Vier Auftraege wurden auf Annahmen gestellt, die
in diesen Dateien beantwortet standen. **Ein `rg` kostet Sekunden.**

`[cmd]` **Ein Agent, der einem falschen Auftrag widerspricht, hat recht
behandelt zu werden.** Der Auftrag verlangte
`goal_phases.tdee_herkunft`; Codex baute
`nutrition_targets.tdee_herkunft` und meldete die Abweichung. Eine
Phase laeuft Wochen, der adaptive TDEE aendert sich darin taeglich —
eine Spalte an der Phase koennte nur EINEN Wert halten. **Der Fehler war
der Auftrag.**

`[cmd]` **Ein Waechter, der nur eine Zahl meldet, zwingt zum Raten.**
Der Zwei-Wahrheiten-Waechter sagte ,,12 statt 7" und riet ,,danach SOLL
anheben" — die falsche Antwort in beiden moeglichen Faellen. Jetzt
nennt er die Posten und stellt die Frage. **Wer eine Zahl meldet, nennt
die Posten.**

`[cmd]` **Die Regel war da, und der Orchestrator hat sie nicht
gelesen.** `00-LIESMICH.md:22-41` schreibt seit langem: Auftragsteil in
DIESELBE Datei, verschieben BEIM Beauftragen, Tom bekommt den PFAD.
**Alle drei verletzt.** Und `:405-463` beschreibt seit dem 30.08. den
Vierstufen-Zyklus mit `next/`; **beide Ordner waren dreissig Tage leer.**
Das ist A-81.

`[cmd]` **Aus dem Schweigen eines Waechters folgt keine Abwesenheit.**
A-81 A4 hielt fuer moeglich, dass die Zaehlung vorbereiteter Auftraege
nie gebaut wurde — sie meldet sich nur bei 0 nicht. **Die Gegenprobe
war, den Zustand herzustellen, den der Waechter melden soll.**

`[cmd]` **`beruehrt.tabellen` ist eine Behauptung ueber die laufende
Datenbank, keine Inhaltsangabe.** Sechs gebaute, aber nicht
eingespielte Tabellen dort eingetragen ergab zehn neue Befunde. Neue
Tabellen gehoeren in den Fliesstext, bis sie live sind.

`[cmd]` **Sechs Waechter, nicht vier** — `punkte`, `sammelfragen`,
`nummern`, `specs`, `zwei-wahrheiten`, `encoding`, dazu `kettenlauf`,
`fragen` und `zyklus` im Gate. Drei von vier war schon kein Lauf.

`[cmd]` **Muster gehoeren in Dateien, nicht durch die Shell.** Vier
Fehlmessungen aus PowerShell-Quoting, dazu ein Muster, das
`alias.spalte` (`bm.user_id`, `gp.id`) fuer fehlende Objekte hielt —
es fehlte die Gegenprobe.

`[cmd]` **Der Commit-Betreff ist kein Signal dafuer, was erledigt
wurde.** C-546 und C-551 kamen unter `4972b27e` herein, Betreff
`goals(G-523, G-529, G-526)`.

`[cmd]` **Eine Regel, die nirgends nachgezaehlt wird, wird zur
Empfehlung.** ,,Wegwerf-Datenbank, danach verwerfen" steht in den
Projektregeln; 150 Datenbanken mit 207 GB stehen in `pg_database`.
**Das ist A-80.**

`[cmd]` **Eine leere Abnahme ist kein Zustand, sondern ein
Versaeumnis.** C-546 und C-551 standen einen Tag mit vollem Bericht und
leerer Abnahme in `laufend_codex`, und niemand hat es gemerkt, bis ein
Agent das rote Gate meldete.

`[cmd]` **Waehrend ein Agent in einem Bereich schreibt, misst dort
niemand.** Ein Testlauf mitten in Claude Codes Schreibvorgang ergab ein
Phantom-`# fail 1`; zwoelf Minuten spaeter waren 2.112 von 2.112 gruen.

`[read]` **Zwei Fehler fand Claude Code am Bild, nicht am Test** — zwei
Raster uebereinander und eine Kachel mit drei Strichen. Die Zaehlproben
hatten sie nicht. **Bei Oberflaeche ist das Bild der Nachweis.**

---

## Ein Befund zu dieser Datei

`[read]` **Die Tabelle oben ist ableitbar.** `docs/punkte/00-INDEX.md`
kennt aus dem Frontmatter, welche Punkte in `laufend_codex/` und
`laufend_claudecode/` liegen. Von Hand gepflegt wird sie genau so alt
wie beim letzten Mal. **Was NICHT ableitbar ist, sind die Abschnitte
darunter** — was auf Tom wartet, was ausdruecklich wartet, die Regeln
und die Lehren.
