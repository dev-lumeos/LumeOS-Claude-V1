# Laufende Auftraege

**Stand: 2026-09-29, 08:35**

| Agent | Nr | Inhalt | Stand |
|---|---|---|---|
| Claude Code | G-520 | Anpassungsalgorithmus und sieben Uebergangswaechter | **laeuft**, raus 29.09., 08:30 |
| Codex | G-514 | die Beitragstabelle plus recovery und supplements | **laeuft**, raus 29.09., 08:00 |
| Claude Code | G-441 | die Recovery-Today-Kachel rechnet aus der Attrappe | **vorbereitet** in `next/` |
| Codex | G-531 | `goal_phase_start` kennt die Rate nicht | **vorbereitet** in `next/` |

`[cmd]` **G-519 A5-A8 ist abgenommen und abgelegt** — Code in
`8312c1d6`, Doku in `8f10df6e`. **Das Eingabefeld fuer die Zielrate
steht.**

`[cmd]` **Der Waechter meldet *,,2 vorbereitet, noch nicht raus: codex 1
| claudecode 1"*.** Der Vierstufen-Zyklus ist einmal vollstaendig
gelaufen.

`[read]` **Der Auftragstext steht jetzt IN der Punktdatei**, nicht im
Gespraech — so wie `00-LIESMICH.md:22-41` es seit langem verlangt und
ich es dreissig Tage nicht getan habe (A-81).

---

## Die Kette ist eingespielt — der Stand der laufenden Datenbank

`[cmd]` **Selbst gemessen, 2026-09-29:**

    goal_phases.zielrate_pct_kg_woche     da
    nutrition_targets.tdee_herkunft       da
    nutrition_targets.tdee_history_id     da
    goals.phase_rate_rules                da, aber LEER
    goals.nutrition_macro_rules           da
    goals.tdee_history                    da
    Kalorienspalten auf goal_phases        0   (richtig, E1)
    Registereintraege                     21
    unregistrierte Dateien                70  (318 Objekte da, 19 fehlend)

`[cmd]` **Vier Einzelanwendungen mit Vorher-Nachher je Datei, bytegenau
ueber `tools/lauf.py psql_datei` mit `ON_ERROR_STOP=1`. Kein
`supabase db push`** — das Register ist unbrauchbar (C-554).

`[cmd]` **Zwei Regeln stehen als CHECK, die Baender nicht:**
`goal_phases_zielrate_aussengrenze` (NULL oder -2,5 bis 1,5) und
`goal_phases_zielrate_passt_zur_art` (Vorzeichen je Art, **NOT VALID** —
Bestandszeilen ungeprueft, neue geprueft).

`[read]` **`phase_rate_rules` ist leer, und das ist der Engpass hinter
dem Eingabefeld.** Die Baender je Variante existieren nicht als Daten;
sie warten auf G-521 A1, weil vier tragende Zahlen keinen Seitenbeleg
haben. **Das Feld darf sich keine Spanne erfinden.**

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
    G-521 A1   vier tragende Zahlen ohne Seitenbeleg: Ratendeckel 1,25,
               Fettboden 0,5, Proteinband nach Trainingsstatus, die
               8-12 Wochen fuer eine Diaetpause. Blockiert die Baender.
    A-79       backup/-Aufbewahrung, 3.958 MiB gegen ein Limit von 2.5 GiB
    A-78       Waechter auf Bezeichner-Ueberschneidung (Dubletten)

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

---

## Der Vertrag fuer einen Modulbeitrag liegt

`[cmd]` **`packages/scoring/src/beitrag.ts`, Commit `dc55728a`,
abgenommen:** 36 von 36 gruen, die vier Gewichtungsreihen summieren
exakt auf 1,00 (selbst addiert, nicht aus `CONTRIBUTION_WEIGHTS`
abgeleitet), Sabotage in beide Richtungen belegt — `nutrition: 0.40` auf
`0.45` verstellt gibt 2 rote Zusicherungen, Rueckstellung byteidentisch
(`sha 9b25cc901266ee5e`), danach wieder 36 gruen.

`[read]` **Er traegt drei Festlegungen, und `tag <= stichtag` ist die
einzige, die die Spec nicht hergibt** — als eigene Festlegung
gekennzeichnet, begruendet damit, dass ein Beitrag eine Aussage ueber
einen VERGANGENEN Tag ist. `recovery.scores` reicht bis 2026-11-06, 78
von 370 Zeilen liegen in der Zukunft.

`[read]` **Und eine vierte Spec-Abweichung ist dabei aufgefallen:**
`SCORING.md:66` rechnet ein fehlendes Modul still als 0. Der Vertrag
rechnet genauso, **sagt es aber** (`ohne_wert`).

---

## Was als naechstes ansteht

**Nach G-519 A5-A8:** G-520. Danach die Baender, sobald G-521 A1 liegt.

**Nach G-514:** G-531 (`goal_phase_start` braucht den
Rate-Parameter — drei von neun Phasenarten sind ueber die Funktion nicht
anlegbar). Danach G-529 A3, dann nutrition in eine Zeile je Tag.

**Orchestrator:** C-555 A1/A2 nachrechnen (die Zahlen von C-546 und
C-551), Verwerfliste fuer A-80 vorlegen, G-530 und G-526 A1-A9
vorbereiten.

---

## Der Zyklus, wie er ab jetzt laeuft

`[cmd]` **`00-LIESMICH.md:444-463`, Toms Wortlaut vom 30.08.:**
*,,du spielst nun jedesmal den vollen cycle durch ohne mein befehl"*.

    1  Bericht ueberfliegen - ist der vorbereitete Auftrag betroffen?
    2  falls ja: anpassen
    3  next/ eine Ebene hoeher - der Auftrag geht raus
    4  Bericht nachmessen, Abnahme schreiben, nach erledigt/
    5  neue Befunde als Punkte
    6  committen, Commit-Hash nachtragen
    7  next/ wieder fuellen

**Fertig ist, wenn Schritt 7 steht.** Kein Schritt braucht eine
Aufforderung.

`[read]` **Und Tom hat den Ablauf am 29.09. noch einmal ausdruecklich
erklaert:** die Agenten schreiben ihren ausfuehrlichen Bericht in die
Punktdatei und geben Tom ein kurzes Summary; Tom schickt das Summary an
den Orchestrator; der liest den Bericht IN der Punktdatei, prueft das
Ergebnis, schreibt seine Abnahme in dieselbe Datei und legt den Punkt
ab. **Damit ist A-81 A4 entschieden: der Agent schreibt hinein.**

`[read]` **Die vier Stufen:**

    todos/                    offen, kein Auftrag geschrieben
    laufend_<agent>/next/     Auftrag geschrieben, noch nicht raus
    laufend_<agent>/          laeuft
    erledigt/                 abgenommen

`[cmd]` **Ein vorbereiteter Auftrag traegt `agent:` und `beauftragt:`
noch nicht** — er bekommt sie beim Verschieben eine Ebene hoeher
(`00-LIESMICH.md:430`).

`[read]` **Der Sinn, in Toms Worten:** waehrend ein Agent arbeitet, hat
der Orchestrator Zeit, und die gehoert in den naechsten Auftrag — und
wenn der Bericht kommt, laesst sich der vorbereitete Auftrag noch
anpassen, denn **oft aendert ein Bericht die Praemisse des naechsten.**
`[cmd]` **Genau das ist heute eingetreten:** Codex' C-554-Bericht hat
die Praemisse von G-519 A5-A8 geaendert (Ratenspalte live,
`phase_rate_rules` leer).

---

## Zwei Regeln

`[cmd]` **Ein Auftrag, ein Bericht.** Ketten sind erlaubt, aber sie
melden EINMAL am Ende — kein Zwischenstand.

`[cmd]` **Nichts laeuft losgeloest im Hintergrund** — ausser
`tools/server.py start`, das ein Log schreibt.

---

## Lehren

`[cmd]` **Ein Agent, der einem falschen Auftrag widerspricht, hat recht
behandelt zu werden.** Der Auftrag verlangte
`goal_phases.tdee_herkunft`; Codex baute
`nutrition_targets.tdee_herkunft` und meldete die Abweichung. Eine
Phase laeuft Wochen, der adaptive TDEE aendert sich darin taeglich —
eine Spalte an der Phase koennte nur EINEN Wert halten. Und
`tdee_history_id` verweist auf genau eine Zeile der Reihe; so ein
Verweis kann nicht an der Phase haengen, die viele davon ueberspannt.
**Der Fehler war der Auftrag.**

`[cmd]` **Ein Waechter, der nur eine Zahl meldet, zwingt zum Raten.**
Der Zwei-Wahrheiten-Waechter sagte ,,12 statt 7" und riet ,,danach SOLL
anheben" — die falsche Antwort in beiden moeglichen Faellen. Jetzt
nennt er die Posten und stellt die Frage: Naehrstoffziel (G-261
pruefen, DANACH anheben) oder Rechenprotokoll (in die Ausschlussliste,
Soll bleibt). **Wer eine Zahl meldet, nennt die Posten.**

`[cmd]` **Die Regel war da, und der Orchestrator hat sie nicht
gelesen.** `00-LIESMICH.md:22-41` schreibt seit langem: Auftragsteil in
DIESELBE Datei, verschieben BEIM Beauftragen, Tom bekommt den PFAD.
**Alle drei verletzt** — Auftrag als Gespraechstext, verschoben nachdem
er raus war, Tom bekam die Nummer. Und `:405-463` beschreibt seit dem
30.08. den Vierstufen-Zyklus mit `next/`; **beide Ordner waren dreissig
Tage leer.**

`[read]` **Deshalb musste Tom mehrfach ,,beide agenten sind frei gib mir
die naechsten auftraege" schreiben** — das ist die Aufforderung, die es
laut Regel nicht braucht. **Die erste Fassung von A-81 nannte als
Ursache, dass Agenten Punkte ueber den Pfad finden, und schlug ein
Werkzeug vor. Das war die teure Antwort auf das falsche Problem.**

`[cmd]` **Und aus dem Schweigen eines Waechters folgt keine
Abwesenheit.** A-81 A4 hielt fuer moeglich, dass die Zaehlung
vorbereiteter Auftraege nie gebaut wurde — sie meldet sich nur bei 0
nicht. Mit zwei vorbereiteten Auftraegen steht die Zeile da. **Die
Gegenprobe war, den Zustand herzustellen, den der Waechter melden
soll.**

`[cmd]` **`beruehrt.tabellen` ist eine Behauptung ueber die laufende
Datenbank, keine Inhaltsangabe.** Sechs gebaute, aber nicht
eingespielte Tabellen dort eingetragen ergab zehn neue Befunde. Neue
Tabellen gehoeren in den Fliesstext, bis sie live sind.

`[cmd]` **Sechs Waechter, nicht vier** — `punkte`, `sammelfragen`,
`nummern`, `specs`, `zwei-wahrheiten`, `encoding`, dazu `kettenlauf`
und `fragen` im Gate. Drei von vier war schon kein Lauf.

`[cmd]` **Muster gehoeren in Dateien, nicht durch die Shell.** Vier
Fehlmessungen aus PowerShell-Quoting, dazu ein Muster, das
`alias.spalte` (`bm.user_id`, `gp.id`) fuer fehlende Objekte hielt —
es fehlte die Gegenprobe. Codex' Werkzeug macht es richtig:
clause-basierte Extraktion, und seine TDD-Kalibrierung deckte dabei
zwei echte Messfehler auf.

`[cmd]` **Der Commit-Betreff ist kein Signal dafuer, was erledigt
wurde.** C-546 und C-551 kamen unter `4972b27e` herein, Betreff
`goals(G-523, G-529, G-526)`. Dasselbe bei G-512 unter `goals(G-510)`.

`[cmd]` **Eine Regel, die nirgends nachgezaehlt wird, wird zur
Empfehlung.** ,,Wegwerf-Datenbank, danach verwerfen" steht in den
Projektregeln; 150 Datenbanken mit 207 GB stehen in `pg_database`.
Der erste Halbsatz wird befolgt, der zweite seit vierzig Auftraegen
nicht. **Das ist A-80.**

`[cmd]` **Eine leere Abnahme ist kein Zustand, sondern ein
Versaeumnis.** C-546 und C-551 standen einen Tag mit vollem Bericht und
leerer Abnahme in `laufend_codex`, und niemand hat es gemerkt, bis ein
Agent das rote Gate meldete.

---

## Ein Befund zu dieser Datei

`[read]` **Die Tabelle oben ist ableitbar.** `docs/punkte/00-INDEX.md`
kennt aus dem Frontmatter, welche Punkte in `laufend_codex/` und
`laufend_claudecode/` liegen. Von Hand gepflegt wird sie genau so alt
wie beim letzten Mal. **Was NICHT ableitbar ist, sind die Abschnitte
darunter** — was auf Tom wartet, was als naechstes ansteht, die Regeln
und die Lehren.
