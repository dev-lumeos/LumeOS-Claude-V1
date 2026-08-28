---
nr: G-215
typ: messung
modul: quer
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen:
    - supplements.rule_catalog
    - supplements.intake_logs
    - medical.user_medications
  dateien:
    - apps/web/src/lib/supplements/regeln-read.ts
zahlen: null
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: aa04c004
---

# G-215 — der Durchstich: kommt eine Warnung beim Nutzer an?

## Befund

`[read]` **Wir haben Kataloge, Erfassung und Regeln gebaut — und nie
geprueft, ob die Kette von vorn bis hinten traegt.**

`[cmd]` **Auf `dev@lumeos.app` mit 360 Einnahmen und 2 Medikamenten
feuert genau eine von 64 Regeln.** `[read]` **Das kann heissen, dass
alles stimmt und nichts zutrifft — oder dass irgendwo dazwischen
etwas nicht ankommt. Beides sieht gleich aus.**

`[read]` **Das ist der Kern des Produkts:** jemand traegt ein
Medikament ein, nimmt ein Supplement, und bekommt eine Warnung. **Wenn
das nicht funktioniert, ist LumeOS eine Datenbank mit Formularen.**

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator (`CLAUDE.md`, *,,Der
Orchestrator zaehlt nicht"*). **Nenn die Abgrenzung mit.**

### Zu tun

**Auf `test-user@lumeos.local` absichtlich eine Lage herstellen, die
eine Regel ausloesen muss** — ueber die Oberflaeche, nicht per
`INSERT`.

`[read]` **Ueber die Oberflaeche ist der Punkt.** Ein direkter
Datenbankeintrag prueft die Regel; **der Weg durch das Formular
prueft, was ein Nutzer tatsaechlich erlebt.**

**Such dir die Regel aus dem Bestand**, nicht aus meiner Vorstellung.
`[read]` **Eine, die mit vorhandenen Daten erreichbar ist und deren
Bedingungen der Evaluator kennt** — 25 der 64 enden in
`unsupported_operator` und scheiden aus.

**Dann von hinten nachmessen, Station fuer Station:**

    steht die Erfassung in der Datenbank?
    sieht `rule_assessment` sie?
    was liefert die Regel zurueck?
    kommt es im Leseweg an?
    erscheint es auf dem Bildschirm?

`[read]` **Wo es abreisst, ist der Befund.** Und wenn es nirgends
abreisst, **ist auch das ein Ergebnis — und zwar das bessere.**

### Was nicht zu tun ist

**Nichts reparieren.** `[read]` **Dies ist ein Durchstich, kein
Umbau.** Was du findest, wird ein Punkt und dann ein eigener Auftrag.
**Keine Regel aendern, keinen Operator implementieren** — das ist
C-313, Codex arbeitet daran.
**Nichts auf `dev@lumeos.app` schreiben.** Dort liegen Toms Daten.
**Kein Katalogausbau, keine Datenpflege.** `[read]` **Tom hat
ausdruecklich gesagt: Schluss mit Katalogdetails.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    gewaehlte Regel            welche, und warum diese
    Lage hergestellt           ueber welche Formulare
    je Station                 kommt es an? mit `[cmd]`
    Abrissstelle               falls vorhanden, benannt
    Bildschirmfoto             der Zustand mit und ohne Warnung
    Rueckbau                   gezaehlt, `dev` unberuehrt

`[read]` **Gegenprobe:** die ausloesende Erfassung wieder entfernen —
**die Warnung muss verschwinden.** Eine Warnung, die bleibt, ist
schlimmer als eine, die nie kam.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **Schreibende Nachweise auf `test-user@lumeos.local`**, mit
gezaehltem Rueckbau.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Die Kette traegt** — von vorn bis hinten, ueber die Oberflaeche,
mit Gegenprobe. **Und auf dem Weg dorthin ist eine zweite Regel
gefallen, die es nie tun kann.** Beides steht unten.

### Die gewaehlte Regel — und warum es am Ende zwei wurden

**Gewaehlt: `wr_drug_bleeding_stack`** (`high`,
`input_coverage_status = auswertbar`). `[cmd]` Eine Bedingung,
`count_risk_flag_gte` auf `{flag: bleeding_risk, count: 2}`,
`field: medications`. **Kein Laborwert noetig, kein Stack, keine
Supplementdaten** — allein ueber das Medikamentenformular aus G-211
erreichbar. Das war der Grund fuer die Wahl.

`[cmd]` **Sie hat nicht gefeuert, und sie kann es nicht.** Der Befund
steht unter *Abrissstelle*.

**Was stattdessen gefeuert hat: `wr_anticoag_stack`** (`medium`).
`[cmd]` Zwei Bedingungen, `contains_any` auf
`medications[].drug_class` gegen
`{anticoagulant:warfarin, anticoagulant:doac, antiplatelet}` **und**
`contains_any_group` auf dem Stack. `[read]` **Der Unterschied zur
gewaehlten Regel ist die Quelle:** sie liest `drug_class` — das Feld,
das die Naht aus G-211 (`katalogFelder()`) beim Schreiben aus dem
Katalog auf die Zeile kopiert — **nicht `risk_flags`.**

`[read]` **Damit hatte der Durchstich beides:** eine Regel, die die
ganze Kette belegt, und eine, die zeigt, wo sie bricht.

### Die Lage, ueber welche Formulare

`[cmd]` **`/v2/medical?tab=tracking` → Medications → „Medikament
eintragen"**, viermal. Wirkstoffsuche, Vorschlag anklicken,
Startdatum `2026-08-01`, „Eintragen". **Kein `INSERT`.**

    Warfarin        drug_f4bbe608e9   B01AA03    bleeding_risk true
    Apixaban        drug_656032a84c   B01AF02    bleeding_risk true
    Andexanet Alfa  drug_0317fd8a77   V03AB      bleeding_risk true   (2x)

`[read]` **Die beiden Andexanet-Zeilen sind mein Fehler, nicht der
des Formulars** — mein erstes Skript wartete 1000 ms auf die
Vorschlagsliste und klickte dann blind den ersten Treffer. **Das
Formular selbst arbeitet korrekt:** `[cmd]` gegengeprobt mit vier
Suchwoertern — `Warfarin` → 1 Vorschlag, `Apixaban` → 2, `Aspirin`
→ 1, und die Zuordnung stand danach je Zeile richtig in der
Datenbank. **Fuer die Messung waren die vier Zeilen sogar
nuetzlicher:** die Regel braucht zwei Blutungswirkstoffe, es lagen
vier.

`[read]` **Eine Falle fuer den naechsten, der das Formular
automatisiert:** ein Filter auf den Kartentext trifft die falsche
Karte — in Andexanets Beschreibung („Notfall-Gegenmittel für die
Blutung…") steht das Wort `Apixaban`. **Der Name haengt an
`.v2-med-eingabe-vorschlag-name`, dort muss der Vergleich hin.**

### Je Station

`[cmd]` **Station 2 — steht die Erfassung in der Datenbank?** **Ja.**
4 aktive Zeilen auf `test-user`, alle vier mit
`risk_flags->>'bleeding_risk' = true`, `is_active = t`,
`start_date 2026-08-01`, `end_date` leer.

`[cmd]` **Station 3 — sieht `rule_assessment` sie?** **Ja, aber
falsch.** Der Ausdruck des Evaluators liefert:

    {bleeding_risk, hepatotoxicity_risk, hyperkalemia_risk,
     hypoglycemia_risk, myelosuppression_risk, nephrotoxicity_risk,
     QT_risk, seizure_risk, serotonergic_risk}

**Neun Schluessel, und `count_risk_flag_gte` zaehlt daraus fuer
`bleeding_risk` den Wert 1** — bei vier Blutungsmedikamenten.
**Hier reisst es fuer die gewaehlte Regel ab.**

`[cmd]` **Station 4 — was liefert die Regel?**
`wr_drug_bleeding_stack` → `not_fulfilled` (braucht `>= 2`, bekam 1).
`wr_anticoag_stack` → **`fulfilled`**, `severity medium`,
`recommended_action_type physician_referral`, Text *„Additive
Blutungsneigung. Kombination ärztlich abklären; vor OPs absetzen
besprechen."* Ihr `matched_context` benennt die Ursache:
`medication_traits: [anticoagulant_doac, anticoagulant_vka,
anticoagulant:doac, anticoagulant:warfarin, CYP2C9_substrate,
enzyme_activator]`, `stack_substances: [sub_4480fcfa86,
sub_9f9bb8c160]`.

`[cmd]` **Station 5 — kommt es im Leseweg an?** **Ja.**
`regeln-read.ts:104-119` reicht **jeden** Zustand durch und filtert
nichts weg; `:123` zaehlt `fulfilled` gesondert.

`[cmd]` **Station 6 — erscheint es auf dem Bildschirm?** **Ja.**
`/v2/supplements?tab=interactions`, Abschnitte
`Zutreffend / Getroffen auf / Nicht zutreffend / Daten fehlen (1)`,
der Satz *„Additive Blutungsneigung"* steht auf der Seite.
`backup/g215-mit-warnung.png` (260 KB, Vollseite).

### Abrissstelle

**`count_risk_flag_gte` kann nicht funktionieren — zwei unabhaengige
Fehler in derselben Zeile.** Der Evaluator baut `v_med_risk_flags`
als `array_agg(DISTINCT key)` ueber
`jsonb_object_keys(mas.risk_flags)`.

**Erstens: kein Filter auf `true`.** `jsonb_object_keys` liefert
**alle** Schluessel, unabhaengig vom Wert. `[cmd]` **Alle 498
Wirkstoffe mit `risk_flags` tragen alle 9 Schluessel** — Furosemid
mit `bleeding_risk: false` erzeugt denselben Satz wie Warfarin mit
`true`.

**Zweitens: `DISTINCT` kollabiert ueber alle Medikamente.** Aus einer
Liste wird eine Menge; **ein Medikament und vier ergeben dieselbe
Zahl 1.** `[cmd]` gemessen: vier Blutungswirkstoffe → `count = 1`.

`[read]` **Der zweite Fehler allein waere schon toedlich, der erste
allein auch.** Eine Bedingung `>= 2` ist damit **unerfuellbar**,
eine Bedingung `>= 1` ist **immer wahr, sobald irgendein Medikament
eingetragen ist.**

`[cmd]` **Reichweite: 5 Regeln.**

    wr_drug_bleeding_stack       high       bleeding_risk       >= 2   feuert nie
    wr_drug_hyperkalemia_stack   high       hyperkalemia_risk   >= 2   feuert nie
    wr_drug_qt_stack             high       QT_risk             >= 2   feuert nie
    wr_drug_serotonergic_combo   critical   serotonergic_risk   >= 2   feuert nie
    wr_drug_hyperkalemia_lab     high       hyperkalemia_risk   >= 1   immer wahr

`[read]` **Die letzte ist die gefaehrlichere Haelfte.** Sie ist kein
stiller Ausfall, sondern ein Falschalarm — sie haelt nur, weil ihre
zweite Bedingung (`lab_above` Kalium > 5) auf `test-user` an 0
Laborwerten scheitert. **Wer Laborwerte hat, bekommt sie bei jedem
beliebigen Medikament.**

`[read]` **Und alle vier stillen sind `high` oder `critical`** — es
faellt genau die Klasse aus, die am lautesten sein sollte.

`[read]` **Nichts davon repariert** — `count_risk_flag_gte` ist ein
Operator, und Operatoren sind C-313 (Codex).

### Gegenprobe

`[cmd]` **Ueber die Oberflaeche zurueckgebaut**, viermal Absetzen mit
Bestaetigungsschritt (`.v2-med-zeilenknoepfe` → `.v2-med-absetzen`).

    aktive Medikamente     4  ->  0
    wr_anticoag_stack      fulfilled  ->  not_fulfilled
    feuernde Regeln        wr_anticoag_stack  ->  (keine)
    Bildschirm             „Additive Blutungsneigung"  ->  weg

`backup/g215-ohne-warnung.png` (247 KB). **Die Warnung ist
verschwunden, keine blieb stehen.**

### Rueckbau, gezaehlt

`[cmd]` **4 angelegt, 4 geloescht, 0 geblieben.** `[read]`
**Absetzen loescht nicht** (G-211: *„Absetzen ist kein Loeschen"*) —
nach der Gegenprobe standen die vier Zeilen mit
`is_active = f, end_date = 2026-08-28` noch da und mussten einzeln
weg.

    medical.user_medications  test-user   0   (vorher 0)
    medical.user_medications  dev         1   Warfarin  (unveraendert)
    medical.user_medications  gesamt      2   (vorher 2)

`[cmd]` **`dev@lumeos.app` unberuehrt**, vorher wie nachher 1 Zeile.
Nicht committet, nicht gestaged.

### Abgrenzung der Zahlen

**Alle Zahlen oben sind von mir gemessen**, am 2026-08-28 gegen die
laufende Datenbank. **Zwei Abweichungen zum Auftrag:**

`[cmd]` **Der Auftrag nennt „25 der 64 enden in
`unsupported_operator`" — gemessen sind es 23.** Auf `dev`:
39 `not_fulfilled`, **23 `unsupported_operator`**, 1 `fulfilled`,
1 `missing_input`. `[read]` **Die 25 duerfte aus einem frueheren
Stand stammen**; Codex arbeitet an C-313 an genau diesen Operatoren,
die Zahl bewegt sich. Abfrage: `select evaluation_state, count(*)
from supplements.rule_assessment(<dev>, current_date) group by 1`.

`[read]` **Und es gibt eine zweite Zahl, die leicht damit verwechselt
wird:** das Katalogfeld `input_coverage_status` sagt `[cmd]`
**44 auswertbar, 14 blockiert, 6 teilweise**. **Das ist nicht
dasselbe** — es ist die Selbsteinschaetzung des Katalogs, nicht das
Ergebnis eines Laufs. `wr_drug_bleeding_stack` steht dort als
`auswertbar` und ist es nachweislich nicht.

`[cmd]` **Der Auftrag nennt „genau eine von 64 Regeln feuert auf
dev" — das stimmt**, gemessen 1 `fulfilled`.

### Was daraus ein Punkt werden sollte

`[read]` **Nicht von mir angelegt** (Punkte gehoeren dem
Orchestrator), aber der Vollstaendigkeit halber:

1. **`count_risk_flag_gte` filtert nicht auf `true` und zaehlt nicht
   je Medikament** — 5 Regeln betroffen, 4 stumm (3x `high`,
   1x `critical`), 1 falschalarmierend. Gehoert zu C-313.
2. **`input_coverage_status = auswertbar` ist keine Zusage** —
   `wr_drug_bleeding_stack` traegt sie und kann nicht feuern. Der
   Status wird gepflegt, nicht gemessen.

## Abnahme

**2026-08-28, Orchestrator. Selbst gegen die Datenbank gemessen.**

`[cmd]` **Der Defektbefund ist bestaetigt:**

    Wirkstoffe mit allen 9 risk_flags-Schluesseln   498 von 498
    bleeding_risk: true                             196
    bleeding_risk: false                            302
    ohne den Schluessel                               0

`[cmd]` **Fuenf Regeln lesen `count_risk_flag_gte`** —
`wr_drug_bleeding_stack`, `wr_drug_hyperkalemia_stack`,
`wr_drug_qt_stack`, `wr_drug_hyperkalemia_lab` (alle `high`) und
**`wr_drug_serotonergic_combo`, die einzige `critical`-Regel im
Bestand.**

### Die Verbindung, die nur aus zwei Berichten sichtbar ist

`[read]` **`wr_drug_hyperkalemia_lab` ist die Regel, die Codex eine
Stunde zuvor in C-313 Weg 2 freigeschaltet hat.** Sie verlangt
`count_risk_flag_gte >= 1` — **ab dem ersten beliebigen Medikament
wahr.**

`[read]` **Sie haengt jetzt nur noch am Laborwert.** Codex' positive
und negative Grenzwertproben waren richtig — **sie haben die zweite
Bedingung nie geprueft, weil sie immer erfuellt war.**

### Warum es niemandem auffiel

`[read]` **C-313b macht seit gestern sichtbar, wenn ein Operator
fehlt.** `[read]` **Dieser Fall bleibt unsichtbar, weil der Operator
existiert und falsch rechnet** — das Ergebnis heisst
`not_fulfilled`, genau wie *,,trifft nicht zu"*.

**Ein Operator, der nicht da ist, meldet sich. Einer, der falsch
rechnet, nicht.**

### Der Durchstich selbst

`[read]` **Die Kette traegt** — `wr_anticoag_stack` laeuft sauber
durch alle sechs Stationen bis auf den Bildschirm, Gegenprobe 4 → 0
aktive Medikamente, `fulfilled` → `not_fulfilled`, **keine Warnung
blieb stehen.**

`[read]` **Aber sie traegt ueber `drug_class`, nicht ueber
`risk_flags`.** **Ohne den Durchstich haette niemand gefragt,
warum.**

`[cmd]` **Und die Regelwahl war der Grund fuer den Fund:**
`wr_drug_bleeding_stack` wurde gewaehlt, weil sie allein ueber das
Medikamentenformular aus G-211 erreichbar ist — eine Bedingung, kein
Laborwert, kein Stack. **Eine bequemere Wahl haette den Defekt nicht
beruehrt.**

### Zwei Nebenbefunde

`[cmd]` **`input_coverage_status` fuehrt `wr_drug_bleeding_stack` als
auswertbar** — nachweislich ist sie es nicht. `[read]` **Die
Selbsteinschaetzung des Katalogs ist keine belastbare Zusage.** Als
eigener Punkt.

`[read]` **Und die zwei Andexanet-Zeilen waren sein eigener
Automatisierungsfehler, nicht der des Formulars** — mit vier
Suchwoertern gegengeprobt und im Bericht fuer den Naechsten
festgehalten. **Gemeldet statt stillschweigend bereinigt.**

`[cmd]` **Rueckbau 4 angelegt / 4 geloescht / 0 geblieben**, `dev`
unveraendert.

**Abgenommen.** Der Defekt ist als **C-328** angelegt.

