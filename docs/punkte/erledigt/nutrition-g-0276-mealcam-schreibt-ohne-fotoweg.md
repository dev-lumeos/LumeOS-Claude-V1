---
nr: G-276
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-274
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [nutrition.meal_plan_logs]
zahlen: null
---

# G-276 — MealCam schreibt `confirmation_mode` ohne Fotoweg

## Befund

Aus G-274, Claude Code, 2026-08-30.

`[cmd]` **Der MealCam-Knopf schreibt `confirmation_mode: 'mealcam'`**
— **ohne dass ein Foto aufgenommen oder ausgewertet wird.**

`[read]` **Damit steht in den Daten, dass eine Mahlzeit per Kamera
bestaetigt wurde, obwohl niemand fotografiert hat.**

`[cmd]` **`SPEC_03` Flow 4, Fall 1 beschreibt den Fotoweg als eigenen
Schritt.**

## Was daran haengt

`[cmd]` **`ADR_MEALCAM_V1`:** *,,MealCam darf NIE automatisch finale
Meal Items schreiben."* `[read]` **Hier schreibt nicht MealCam,
sondern der Bestaetigungsweg unter falschem Namen** — **die Wirkung
ist harmlos, die Angabe ist es nicht.**

`[read]` **Zwei Wege:** den Knopf entfernen, bis der Fotoweg steht.
**Oder `confirmation_mode` auf das setzen, was tatsaechlich passiert
ist.**

`[read]` **Ein Feld, das die Herkunft einer Bestaetigung benennt,
muss die Wahrheit sagen** — sonst ist es schlimmer als keins.

## Auftrag — drei kleine, alle entschieden

**Mitbeauftragt: G-258, G-251.** Bericht in diese Datei.

`[read]` **Beauftragt am 2026-08-30.**

### 1 · G-276 — MealCam sagt die Unwahrheit

`[cmd]` **Der Knopf schreibt `confirmation_mode: 'mealcam'`, ohne
dass fotografiert wird.**

`[read]` **Zwei Wege, und du entscheidest nach der Messung:** den
Knopf entfernen, bis der Fotoweg steht — **oder den Modus auf das
setzen, was tatsaechlich passiert ist.**

`[read]` **Ein Feld, das die Herkunft einer Bestaetigung benennt,
muss die Wahrheit sagen.** `[cmd]` **`ADR_MEALCAM_V1` verlangt
ohnehin, dass MealCam nie automatisch schreibt** — hier schreibt
nicht MealCam, sondern der Bestaetigungsweg unter falschem Namen.

### 2 · G-258 — Pending actions im Tagebuch

**Entschieden in E-29: ueber eine Funktion, nicht direkt.**

`[cmd]` **`coach.pending_actions` traegt 3 Zeilen und eine Spalte
`module`.** `[cmd]` **Und `coach.darf_nutrition_plan_aendern()` steht
seit dem 30.08. live** — **das ist die Naht, die E-29 meint.**

`[read]` **Miss zuerst, ob es schon eine Lesefunktion gibt** — Codex
hat in C-342 eine Rechteregel gebaut, **vielleicht liegt daneben
schon eine, die liest.** `[read]` **Wenn nicht: melden, nicht selbst
direkt lesen.**

`[read]` **Und die Gegenrichtung ist offen:** ob der Nutzer eine
Aktion bestaetigen kann, beruehrt `confirmed_by` und die drei
Aenderungsprotokolle. **Das ist ein eigener Punkt, kein Teil
hiervon.**

### 3 · G-251 — die Herkunfts-Filter im Food-DB-Reiter

`[read]` **Drei genannt:** Favoriten, *,,wie gestern"*, eigene Foods.

`[read]` **Vor dem Bau messen, woraus jeder kommt.** `[read]` **Und
*,,wie gestern"* setzt voraus, dass gestern etwas erfasst wurde** —
**was zeigt der Filter an einem Tag ohne Vortag?** `[cmd]` **Seit
G-274 kann das Tagebuch gefuellt sein, also ist der Fall
herstellbar.**

### Was nicht zu tun ist

**Kein Schema aendern.**
**Nicht direkt in `coach.*` lesen** — E-29.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    MealCam-Modus       was steht jetzt drin, was danach
    Lesefunktion        existiert sie? gemessen
    Pending actions     echte Zeilen, ueber die Funktion
    drei Filter         je woraus, oder als offen gemeldet
    ohne Vortag         was zeigt "wie gestern"?
    Attrappen           am Schirm, vorher / nachher

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **A-30, A-59, A-60, A-62.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-30.** Alle Zahlen mit Nutzer und Zeitraum.

### Die Kurzfassung

**Einer gebaut, zwei gemeldet — und das war jedes Mal die Messung,
nicht die Bequemlichkeit.**

`[cmd]` **G-276: der Knopf ist entfernt.** Ein Fotoweg existiert
nirgends, also gab es nichts, worauf `mealcam` haette zeigen koennen.

`[cmd]` **G-258: es gibt keine Lesefunktion.** 16 Funktionen im
Schema `coach`, **keine liest `pending_actions`.** E-29 verbietet den
direkten Zugriff — **also gemeldet, nicht gebaut.**

`[cmd]` **G-251: keiner der drei Filter ist heute baubar.**
`p_filters` kennt sechs Schluessel, **keiner trifft eine Herkunft.**

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| MealCam-Modus | **vorher `'mealcam'` ohne Foto, nachher: kein Knopf** |
| Lesefunktion | **existiert nicht** — 16 Funktionen geprueft |
| Pending actions | **3 Zeilen, 2 fuer dev** — nicht gelesen, E-29 |
| drei Filter | **je Quelle und Luecke benannt**, keiner gebaut |
| ohne Vortag | **eigener Zustand** — „kein Gestern" ≠ „gestern nichts" |
| Attrappen | **0 im Plans-Reiter**, vorher wie nachher |

### 1 · G-276 — der Knopf ist weg, nicht der Modus

`[cmd]` **Gemessen: nur eine Stelle schrieb `mealcam` als Herkunft**
— `plan-eintraege.tsx:158`, **von mir in G-274 gebaut.**

`[cmd]` **Und ein Fotoweg existiert nirgends:** `MealCamModal`
(`modale.tsx:110`) ist eine Attrappe mit drei Schritten und festen
Treffern; der Dateikopf sagt es selbst — *,,MealCam hat kein
Modell."*

`[read]` **Zwei Wege standen zur Wahl, und ich habe den zweiten
verworfen:** den Modus auf `manual` zu setzen waere nicht falsch —
**aber der Knopf bliebe eine Zusage.** Zwei Knoepfe, die dasselbe
tun, einer davon mit Kamerasymbol. **Also entfernt, bis der Fotoweg
steht.**

`[cmd]` **Am Schirm gegengeprobt, dev, 18.06.:** die Eintragszeilen
tragen jetzt **„Wie geplant" und „Auslassen"** — **MealCam kommt
darin nicht mehr vor.**

`[cmd]` **Ein zweiter MealCam-Knopf bleibt und darf bleiben:** der im
Seitenkopf (`kopfknoepfe.tsx:52`). **Er oeffnet das Attrappenfenster
und schreibt nichts** — er behauptet keine Herkunft.

`[read]` **`confirmation_mode` bleibt im Schema und im Schreibweg.**
Die Spalte ist richtig; ihr fehlte nur ein ehrlicher Absender. **Ein
Test haelt fest, dass `z.enum(['mealcam', 'manual'])` stehen
bleibt** — sonst fehlt der Wert, wenn der Fotoweg kommt.

### 2 · G-258 — die Naht fehlt, also nicht gebaut

`[cmd]` **Alle 16 Funktionen im Schema `coach` geprueft:**
`darf_nutrition_plan_aendern`, `hat_sicht`, `klienten`,
`resolve_invite_user_id`, `withdraw_relationship_invite`, sechs
`summary_*`, fuenf Trigger. **Keine liest `pending_actions`.**

`[cmd]` **`summary_nutrition(dev)` liefert `{"freigegeben": false}`**
und nennt `pending_action` im Quelltext nicht.

`[cmd]` **Die Daten waeren da:** 3 Zeilen, alle `module = 'nutrition'`,
`action_type = 'adjust_macro_targets'`, alle `pending` —
**zwei davon fuer `dev`.** `[cmd]` **Und die Zeilenrechte liessen den
Klienten lesen** (`auth.uid() = client_id`).

`[read]` **Genau deshalb war die Versuchung da, und genau deshalb
nicht.** **E-29 sagt: ueber eine Funktion, nicht direkt.** Ein
direkter `select` auf `coach.pending_actions` aus dem Nutrition-Modul
waere die Naht, die E-29 verhindern soll.

**Was fehlt, ist eine Zeile Datenbankarbeit** — etwa
`coach.offene_aktionen(p_modul text)`, aus Klientensicht. **Sie
gehoert Codex.**

### 3 · G-251 — drei Filter, drei verschiedene Luecken

`[cmd]` **Gemessen am 2026-08-30, `dev@lumeos.app`:**

    Favoriten     `food_preference_items`, preference='liked'
                  dev hat GENAU EINEN ("Reis poliert, roh").
                  `food_search` kennt `liked` nur als Rangschub
                  (+100/+50/+30) — `p_filters` hat keinen Schluessel.

    wie gestern   `meals` + `meal_items` des Vortags.
                  180 Tage mit Posten ueber eine Spanne von 181 —
                  EINE Luecke. Der Fall ohne Vortag ist real.

    eigene Foods  `nutrition.foods_custom` — 45 Spalten, **0 Zeilen**,
                  und `food_search` liest die Tabelle NICHT
                  (`prosrc` geprueft).

`[cmd]` **`p_filters` kennt sechs Schluessel:** `tag_groups`,
`include_tag_groups`, `exclude_tags`, `exclude_tag_codes`,
`processing_levels`, `exclude_processing_levels`. **Keiner trifft
eine Herkunft.**

`[read]` **Client-seitig ginge nur die geladene Seite — und das waere
schlimmer als nichts.** `[cmd]` **7.140 Lebensmittel, 50 je Seite,
ein Favorit.** **Ein Filter, der fast immer nichts findet, sieht
kaputt aus, nicht leer.**

`[read]` **Und „wie gestern" ist ohnehin kein Suchfilter**, sondern
eine eigene Liste — es verfeinert die Katalogsuche nicht, es ersetzt
sie.

**Was gebaut wurde, ist die Antwort auf die Frage des Auftrags:**
`[read]` **drei Zustaende fuer den Vortag, nicht zwei** —

    posten     der Vortag traegt Eintraege
    leer       der Vortag existiert, hat aber nichts
    kein_tag   es gibt keinen Vortag

`[read]` **„Gestern war nichts" und „es gibt kein Gestern" sind zwei
Aussagen.** Wer sie zusammenwirft, zeigt am ersten Tag eine leere
Liste und behauptet damit, der Nutzer habe gefastet. **Die
Unterscheidung steht mit Saetzen bereit, damit der Bau-Auftrag sie
nicht neu erfinden muss.**

### 4 · Die Sabotagen — 7 von 7 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | der MealCam-Knopf kommt zurueck | ja |
| 2 | der Modus faellt aus dem Schreibweg | ja |
| 3 | kein Vortag gilt als leerer Vortag | ja |
| 4 | ein leerer Vortag gilt als gefuellt | ja |
| 5 | beide Leerfaelle sagen dasselbe | ja |
| 6 | die Luecke eines Filters wird nicht benannt | ja |
| 7 | der verbliebene Knopf schreibt wieder `mealcam` | ja |

`[cmd]` **Sabotage 7 war zuerst falsch gebaut:** ich hatte den
WAECHTER sabotiert statt den Code, und die Ersetzung liess kaputte
Syntax zurueck. `[read]` **Eine Sabotage, die nicht laeuft, beweist
nichts** — ersetzt durch eine, die den verbliebenen Knopf auf
`mealcam` umstellt.

### 5 · Ein Waechter hat sich gedreht (A-62)

`[cmd]` **Der G-274-Waechter verlangte
`confirmation_mode: 'mealcam'` in der Oberflaeche** — richtig als
Beleg, dass der Knopf verdrahtet war. **Seit G-276 ist er falsch.**

`[read]` **Umgedreht: er verbietet den Wert jetzt**, solange kein
Foto ausgewertet wird. **Das ist derselbe Fall wie in G-267 und
G-275** — ein Verbot, dessen Vorbedingung wegfaellt, kehrt sich um.

### 6 · Gate und Testlage

`[cmd]` **`pnpm gate`: 11 von 11 gruen.** `[cmd]` **Typecheck sauber,
Build gruen.** `[cmd]` **603 von 603 Tests gruen**, davon 5 neue.
`[cmd]` **Encoding sauber, Exit 0.**

`[cmd]` **Am Schirm: 0 Attrappen im Plans-Reiter, keine Doppelung**,
3.913 ms kalt / 3.097 ms warm.

**Bildschirmfoto:** `backup/g276-eintraege.png`.

**Kein Schema geaendert. Nicht direkt in `coach.*` gelesen. Nichts
auf `dev@lumeos.app` geschrieben. Nicht committet, nicht gestaget.**

## Abnahme

**2026-08-30, Orchestrator.**

**Einer gebaut, zwei gemeldet — jedes Mal, weil die Messung es so
sagte.**

### G-276 — der Knopf ist weg, und die Begruendung traegt

`[cmd]` **Nur eine Stelle schrieb `mealcam` als Herkunft** —
`plan-eintraege.tsx:158`, aus seinem eigenen G-274.

`[cmd]` **Und es gibt nirgends einen Fotoweg:** `MealCamModal` ist
eine Attrappe, deren eigene Kopfzeile sagt *,,MealCam hat kein
Modell"*.

`[read]` **Er hat den zweiten Weg ausdruecklich verworfen** — den
Modus auf `manual` zu setzen. **Begruendung:** *,,das waere nicht
falsch, aber der Knopf bliebe ein Versprechen — zwei Knoepfe, die
dasselbe tun, einer mit Kamerasymbol."*

`[read]` **Das ist die richtige Unterscheidung.** **Ein Feld, das
nicht luegt, macht einen Knopf nicht ehrlich.**

`[cmd]` **`confirmation_mode` bleibt in Schema und Schreibweg, von
einem Test gesichert** — **der Wert ist da, wenn der Fotoweg
kommt.**

`[cmd]` **Der zweite MealCam-Knopf in der Kopfzeile bleibt** — er
oeffnet die Attrappe und behauptet keine Herkunft.

### G-258 — nicht gebaut, und das ist E-29 eingehalten

`[cmd]` **Alle 16 Funktionen im `coach`-Schema geprueft: keine liest
`pending_actions`.** `[cmd]` **`summary_nutrition(dev)` liefert nur
`{"freigegeben": false}`.**

`[cmd]` **Die Daten sind da — 3 Zeilen, 2 fuer `dev` — und RLS liesse
den Client direkt lesen** (`auth.uid() = client_id`).

`[read]` **Genau deshalb hat er es nicht getan.** **E-29 sagt: ueber
eine Funktion.** `[read]` **Er haette bauen koennen, was ich bestellt
habe, und die Entscheidung dabei gebrochen.**

**Als C-354 an Codex.**

### G-251 — keiner der drei Filter ist heute baubar

`[cmd]` **Favoriten liegen in `food_preference_items`, aber
`food_search` behandelt `liked` nur als Rangbonus** — **`p_filters`
hat keinen Schluessel dafuer.**

`[cmd]` **`foods_custom` hat 45 Spalten und 0 Zeilen, und
`food_search` liest sie gar nicht.**

`[read]` **Und die Begruendung gegen den naheliegenden Ausweg:**
clientseitig filtern deckte nur die geladene Seite — **7.140
Lebensmittel, 50 je Seite, ein Favorit.** *,,Das saehe kaputt aus,
nicht leer."*

**Als C-355 an Codex.**

### Was er stattdessen gebaut hat

`[cmd]` **Die Frage aus meinem Auftrag — *,,was zeigt *wie gestern* an
einem Tag ohne Vortag?"* — hat drei Zustaende, nicht zwei.**

`[cmd]` **`dev` hat 180 Tage mit Positionen ueber 181 Tage Spanne** —
**genau eine echte Luecke.**

`[read]` ***,,Gestern war nichts"* und *,,es gibt kein Gestern"* sind
verschiedene Aussagen.** `[read]` **Wer sie zusammenwirft, sagt einem
Nutzer am ersten Tag, er habe gefastet.**

`[read]` **Dieselbe Unterscheidung wie C-48 Regel 1, an einer Stelle,
an der ich sie nicht vermutet haette.**

### Eine Sabotage war missgebaut

`[read]` **Er hat den Waechter saboтiert statt den Code und
gebrochene Syntax hinterlassen.** `[read]` ***,,Eine Sabotage, die
nicht laeuft, beweist nichts."*** **Ersetzt durch eine, die den
verbliebenen Knopf auf `mealcam` zuruecksetzt.**

`[cmd]` **Und sein G-274-Waechter war wieder invertiert (A-62)** —
er verbietet den Wert jetzt.

`[cmd]` 7/7 Sabotagen fallen, Gate 11/11, 603/603 Tests, 0 Attrappen.

**Abgenommen.**

