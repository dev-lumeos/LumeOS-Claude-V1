# Laufende Auftraege

**Stand: 2026-09-29, 08:30**

| Agent | Nr | Inhalt | Stand |
|---|---|---|---|
| Codex | C-554 | Register gemessen, vier Goals-Migrationen einzeln live | **abgenommen 29.09.** — wartet auf Commit |
| Claude Code | G-522 | A3 — der Vertrag fuer einen Modulbeitrag | **abgenommen 28.09.** — wartet auf Commit |

`[cmd]` **Beide Agenten sind frei.** `docs/punkte/00-INDEX.md` fuehrt
834 Punkte.

---

## Die Kette IST eingespielt — was sich damit geaendert hat

`[cmd]` **Selbst gemessen, 2026-09-29, gegen die laufende Datenbank:**

    goal_phases.zielrate_pct_kg_woche     da
    nutrition_targets.tdee_herkunft       da
    goals.phase_rate_rules                da
    goals.nutrition_macro_rules           da
    goals.tdee_history                    da
    Kalorienspalten auf goal_phases        0   (richtig, E1)
    Registereintraege                     21
    unregistrierte Dateien                70
    neuer Dump in backup/                 keiner

`[cmd]` **`supabase db push` wurde nicht verwendet.** Vier
Einzelanwendungen mit Vorher-Nachher je Datei, bytegenau ueber
`tools/lauf.py psql_datei` mit `ON_ERROR_STOP=1`.

`[read]` **Damit ist G-519 A5-A8 zum ersten Mal wirklich baubar.** Die
Spalte steht in der Datenbank, die der Dev-Server liest — nicht nur in
einer Datei.

`[cmd]` **Der Rest von C-554 bleibt offen:** 70 unregistrierte Dateien
mit 318 vorhandenen und 19 fehlenden Objekten. Das ist A3 und Toms
Entscheidung.

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
               welche eingespielt, welche bewusst nicht. Codex' Werkzeug
               liefert die Objektmatrix: node tools/migrations-objekte-pruefen.mjs
    A-80       150 Wegwerf-Datenbanken, 207 GB. Die Liste zum Verwerfen
               legt der Orchestrator vor; Tom entsorgt. Platte ist NICHT
               das Problem (6.726 GB frei) — die 49 Datenbanken mit
               "_final" im Namen sind es.
    A-79       backup/-Aufbewahrung, 3.958 MiB gegen ein Limit von 2.5 GiB
    A-78       Waechter auf Bezeichner-Ueberschneidung (Dubletten)

---

## Der Zwei-Wahrheiten-Waechter ist behoben

`[cmd]` **Er zaehlte 12 statt 7, weil G-511 fuenf Metadatenfelder auf
`nutrition_targets` eingespielt hat**, die nicht in seiner
Ausschlussliste standen: `phase_id`, `zielrate_pct_kg_woche`,
`body_weight_kg`, `tdee_herkunft`, `tdee_history_id`.

`[read]` **Die Ausschlussliste bleibt, ihre Richtung ist Absicht** —
eine Einschlussliste liesse einen achten Naehrstoff stillschweigend
durch. `body_weight_kg` endet auf eine Einheit und ist trotzdem kein
Naehrstoff; deshalb entscheidet eine benannte Liste, keine Namensregel.

`[cmd]` **Zweiter Mangel, der Codex zum Raten zwang:** der Waechter
meldete nur eine Zahl, nicht welche Spalten. Jetzt nennt er sie und
stellt die Frage — Naehrstoffziel (G-261 pruefen, DANACH Soll anheben)
oder Rechenprotokoll (in die Liste, Soll bleibt). **,,Soll anheben, weil
die Zahl gestiegen ist" ist in beiden Faellen falsch** und war vorher
der einzige Rat.

`[cmd]` **In beide Richtungen belegt gegen eine Wegwerf-Datenbank:**
laufend 7/7 gruen, Nachbau 7/7 gruen, mit `vitamin_d_ug` 8/7 ROT und
benannt, mit `tdee_herkunft_notiz` ebenso ROT, Wegwerf-DB verworfen (0
Reste), laufende danach unveraendert bei 20 Spalten.

---

## Die vier Entscheidungen aus G-521

    E1  die neun Phasenarten bleiben als Auswahl -- die Parameter
        haengen an der RATE, nicht an der Art            -> G-529
    E2  das Proteinband wird nach Trainingsstatus geteilt -> G-526
    E3  recomp bleibt eine Phase, die Baender sind unsere
    E4  contest_prep und expert_bb_annual bekommen eine
        eigene Struktur                                 -> G-530

`[cmd]` **kcal/Tag = 11 x Rate(% KG/Woche) x Gewicht(kg)**, aus 7700
kcal je kg. Nachgerechnet gegen die eingespielte Struktur: 45 kg bei
-1,0 %/Woche gibt -495, 120 kg gibt -1320, 80 kg bei +0,25 % gibt +220.
Beide Groessen werden angezeigt, gespeichert wird die Rate.

`[read]` **G-521 A1 bleibt offen** — vier tragende Zahlen ohne
Seitenbeleg: Ratendeckel 1,25, Fettboden 0,5, Proteinband nach
Trainingsstatus, die 8-12 Wochen fuer eine Diaetpause. Der
Recherchebericht nennt keine Fundstelle mit Seite oder Abschnitt;
nichts daraus ist `[cmd]`.

---

## Was als naechstes ansteht

**Claude Code:** G-519 A5-A8 — das Eingabefeld fuer die Zielrate, kcal
daneben angezeigt (N13). Jetzt baubar, die Spalte steht live.

**Codex:** G-514 — `goals.goal_contributions` plus recovery und
supplements daran. Der Vertrag dafuer liegt gebaut und getestet in
`packages/scoring/src/beitrag.ts` (G-522 A3, 26 Zusicherungen,
Sabotage in beide Richtungen). Danach G-529 A3.

**Orchestrator:** C-555 A1/A2 nachrechnen (die Zahlen von C-546 und
C-551), Verwerfliste fuer A-80 vorlegen, G-530 und G-526 A1-A9
vorbereiten.

---

## Zwei Regeln

`[cmd]` **Ein Auftrag, ein Bericht.** Ketten sind erlaubt, aber sie
melden EINMAL am Ende — kein Zwischenstand.

`[cmd]` **Nichts laeuft losgeloest im Hintergrund** — ausser
`tools/server.py start`, das ein Log schreibt.

---

## Lehren

`[cmd]` **Ein Agent, der einem falschen Auftrag widerspricht, hat
recht behandelt zu werden.** Der Auftrag verlangte
`goal_phases.tdee_herkunft`; Codex baute
`nutrition_targets.tdee_herkunft` und meldete die Abweichung. **Seine
Begruendung traegt:** eine Phase laeuft Wochen, der adaptive TDEE
aendert sich darin taeglich — eine Spalte an der Phase koennte nur
EINEN Wert halten. Und `nutrition_targets.tdee_history_id` verweist auf
genau eine Zeile der TDEE-Reihe; ein solcher Verweis kann nicht an der
Phase haengen, die viele davon ueberspannt. **Der Fehler war der
Auftrag.**

`[cmd]` **Ein Waechter, der nur eine Zahl meldet, zwingt zum Raten.**
Der Zwei-Wahrheiten-Waechter sagte ,,12 statt 7" und als einzigen Rat
,,danach SOLL anheben" — die falsche Antwort in beiden moeglichen
Faellen. Wer eine Zahl meldet, nennt die Posten.

`[cmd]` **Eine Punktdatei wird nicht verschoben, waehrend ein Agent
hineinschreibt.** G-522 ging um 18:03 raus; der Orchestrator verschob
die Datei kurz darauf. Der Agent schrieb in den Pfad, den er kannte —
es entstand eine zweite Datei mit nur seinem Abschnitt, ohne
Frontmatter. Zusammengefuehrt, nichts verloren.

`[cmd]` **`beruehrt.tabellen` ist eine Behauptung ueber die laufende
Datenbank, keine Inhaltsangabe.** Sechs gebaute, aber nicht
eingespielte Tabellen dort eingetragen ergab zehn neue Befunde. Neue
Tabellen gehoeren in den Fliesstext, bis sie live sind.

`[cmd]` **Drei von vier Waechtern ist kein Lauf.** Und die Zahl ist
gewachsen: es sind sechs — `punkte`, `sammelfragen`, `nummern`,
`specs`, `zwei-wahrheiten`, `encoding`, dazu `kettenlauf` und
`fragen` im Gate.

`[cmd]` **Muster gehoeren in Dateien, nicht durch die Shell.** Vier
Fehlmessungen aus PowerShell-Quoting, dazu ein Muster, das
`alias.spalte` (`bm.user_id`, `gp.id`) fuer fehlende Objekte hielt.
**Es fehlte die Gegenprobe.** Codex' Werkzeug macht es richtig:
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

---

## Ein Befund zu dieser Datei

`[read]` **Die Tabelle oben ist ableitbar.** `docs/punkte/00-INDEX.md`
kennt aus dem Frontmatter, welche Punkte in `laufend_codex/` und
`laufend_claudecode/` liegen. Von Hand gepflegt wird sie genau so alt
wie beim letzten Mal. **Was NICHT ableitbar ist, sind die Abschnitte
darunter** — was auf Tom wartet, was als naechstes ansteht, die Regeln
und die Lehren.
