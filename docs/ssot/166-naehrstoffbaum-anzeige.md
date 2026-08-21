# 166 — Naehrstoffbaum-Anzeige: jede Ebene klappbar, gespeicherte Ansicht, Detailmodal

**Auftrag:** G-122 · **Stand:** 2026-08-21 · **Modul:** Nutrition
**Vorher:** 164 (C-161: `parent_code`, `nutrient_details`,
`user_display_preferences`), 161 (G-121: lange Form, Zeitfenster,
Mockup-Spalten), 157 (C-157: lange Form)

**Kurz:** Der Baum haengt jetzt an **`parent_code`**, nicht mehr an der
Stufen-Heuristik; **jeder Knoten mit Kindern klappt** (Gruppe bis
Ebene 4), Start ueberall zu. Die **letzte Sicht** (offene Knoten,
Zeitfenster, Filter) **steht in der Datenbank**
(`user_display_preferences`) und ueberlebt Neuladen und Browserwechsel.
Das **Detailmodal** ist gebaut: Erklaerungen aus dem Vorgaengerrepo,
**beide Zielwerte nebeneinander** (wissenschaftliche Referenz mit
Quelle/Version/Link und persoenliches Ziel), „unter {Eltern}",
Kinderliste und ein **echter 14-Tage-Trend**. `[cmd]` Sichtbarste
Folge des echten Baums: **6 Karten statt 12** — sechs Gruppen haben
keine Wurzel, sie sind Aeste. Tests **449/449**.

---

## Wie der Baum klappt

`[cmd]` **Der Wald kommt aus `parent_code`** (C-161: 40 Wurzeln, 98
Kinder, maximal 4 Ebenen). Der fruehere Zwei-Pass-Bau aus
`display_tier` und `sort_index` ist ersetzt — er riet, was die Tabelle
jetzt weiss. Waisen (Elterncode nicht in der Liste) wuerden Wurzeln
statt zu verschwinden; Geschwister stehen nach `sort_index`
(6 Waechtertests).

`[cmd]` **Die Karten folgen der Gruppe der Wurzel — 6 statt 12.**
Grund, gemessen: **28 Kinder tragen ein anderes `group_de` als ihr
Elternknoten**; die kompletten Aeste Fettsaeuren (36), Aminosaeuren
(19), Kohlenhydrate (11), Ballaststoffe (6), Organische Saeuren (5)
und Zuckeralkohole (3) haengen unter Makronaehrstoff-Wurzeln — diese
sechs Gruppen haben **null Wurzeln**. Eine Karte je Gruppe haette
denselben Ast zerrissen oder Werte doppelt gezeigt. Das Mockup macht
es genauso: die Gruppen kommen aus den Top-Level-Eintraegen. Die
Karten sind jetzt: Makronaehrstoffe (90 Eintraege), Elemente (16),
Fettloesliche Vitamine (17), Wasserloesliche Vitamine (12), Energie
(2), Sonstige (1).

`[cmd]` **Jede Ebene klappt, Start alles zu.** Gemessen als Kette:
Start **0 Zeilen** → Gruppe Makronaehrstoffe offen: **8** (die
Wurzeln) → Chevron `CHO`: **12** → Chevron `SUGAR`: **14** → Chevron
`MNSAC`: **17**, darunter **GLUS auf Ebene 4**. Zugeklappte Knoten
tragen „+N" als Hinweis auf die Kinderzahl. Der Chevron klappt, der
Rest der Zeile oeffnet das Modal.

`[read]` **Ein aktiver Filter schlaegt den Klappzustand:** wer
„Auffaellig" waehlt, sieht die Treffer ausgeklappt (samt Eltern
auffaelliger Kinder — die `hasChildOutOfRange`-Regel aus G-121 gilt
weiter); „Alle" kehrt zur gespeicherten Sicht zurueck.

## Wo die Ansicht gespeichert wird

`[cmd]` **`public.user_display_preferences`**, Schluessel
`nutrition.nutrient_tree`, Wert
`{ offen: string[], fenster, scope }` — Gruppen als `g:{Name}`, Knoten
als Code. Geschrieben ueber `PUT /api/nutrition/ansicht`
(Session + RLS), **gesammelt nach 600 ms** — ein Klickgewitter
schreibt eine Zeile, nicht zehn. Kaputte oder fremde Werte werden beim
Lesen **verworfen, nicht repariert** — dann gilt der Start „alles zu"
(Waechtertest auf `pruefeAnsicht`).

`[cmd]` **In der Datenbank, nicht im Browser — gemessen:** ein
**frischer Browserkontext** (leerer Speicher, neue Anmeldung) zeigt
die gespeicherte Sicht sofort: 25 Zeilen offen, 30-Tage-Fenster aktiv,
ohne einen Klick. Die Zeile selbst: `{"offen": ["g:Makronährstoffe",
"CHO", "SUGAR", "MNSAC", …], "scope": "alle", "fenster": 30}`.

`[read]` **Vorrang beim Fenster:** Adresse > gespeichert > Tag. Ein
geteilter Link `?fenster=30` zeigt, was er sagt; ohne Parameter gilt
die letzte Sicht. `[cmd]` Gemessen: „30 Tage" geklickt, danach die
Seite OHNE Parameter geladen → Kopf „Schnitt je protokolliertem Tag
(30 Tage erfasst)".

`[cmd]` **Zeilenschutz:** dev und test-user fuehren **getrennte
Zeilen** unter demselben Schluessel; test-user sieht weder devs offene
Knoten noch dessen 30-Tage-Fenster (Kopf zeigt die Tagessumme). Die
RLS-Policies selbst hat C-161 SQL-seitig belegt (164).

## Was das Modal zeigt

Andockpunkt aus G-121 (`waehlen`), Daten aus
`GET /api/nutrition/naehrstoff?code&datum` — vier Quellen, eine
Antwort (`naehrstoff-detail-read.ts`):

- **Kopf:** Name, Code, Gruppe, **„unter {Eltern}"** aus dem echten
  Baum, Status als Aussage ueber die Zahl. `[cmd]` Gemessen: **Glucose
  zeigt „unter Monosaccharide, gesamt", Chlorid zeigt keinen
  Elternteil** (seine Pills: nur „Elemente" und der Status).
- **Beide Zielwerte nebeneinander** (Toms Vorgabe): die Karte
  „Persoenliches Ziel" aus `daily_reference_assessment` (mit Art und
  „fuer dein Profil") UND die Tabelle **„Wissenschaftliche
  Referenzen"** aus `nutrient_reference_values` — je Zeile Art,
  Geltungsgruppe (Geschlecht/Alter), Wert und **Quelle mit
  `source_version` und `source_url` als Link**, wie bei den
  Biomarker-Bereichen. `[cmd]` Vitamin C zeigt PRI Maenner 110 mg /
  Frauen 95 mg (EFSA DRV, Version 4 2017, verlinkt) und UL 2.000 mg
  (NAM DRI) samt Hinweis, dass EFSA keine numerische UL fuehrt.
- **`NO_REFERENCE` und `NO_STANDALONE_REFERENCE` bleiben sichtbar:**
  die Zeile erscheint mit ihrem Hinweistext statt eines Werts.
  `[cmd]` GLUS zeigt „No standalone DRV for this carbohydrate
  fraction; total carbohydrate is covered by CHO" (EFSA, mit Version).
  `[read]` Die Art bedeutet „in einem Sammelwert enthalten", nicht
  „unbekannt" — genau das sagt der Hinweis.
- **Erklaerungen aus `nutrient_details`** (110 Zeilen, C-161):
  Funktion im Kopf, „Bei Mangel" / „Bei Ueberschuss" als
  Informationskaesten, Detailtext, beste Quellen, Wechselwirkungen,
  Tipp. `[read]` **Die Texte beschreiben Symptome, sie werden gezeigt,
  nicht zugeschrieben** — „Bei Mangel: Skorbut" ist Information, kein
  Befund. `rda_standard/athlete/ul` stehen als Fussnote **„Vorgaengerrepo
  (Text, keine Referenz)"** — 164 belegt, dass sie von den
  EFSA-Werten abweichen.
- **Der 14-Tage-Trend ist echt:** Tageswerte aus
  `daily_nutrient_summary_long`, aeltester zuerst, **Tage ohne Wert
  bleiben Luecken** — keine erfundenen Zwischenwerte. Die Sinuskurve
  der Vorlage („Fake 14-day trend", Z. 694) ist nicht nachgebaut.
  `[cmd]` Vitamin C: Schnitt 291,5 mg mit Linie.
- **Kinderliste** aus dem Baum: Code, Wert, Status je Kind.

## Was von den 2.454 Zeilen fehlt

`[cmd]` Selbst gemessen (Skript gegen die Datei, 2.455 Zeilen,
194 KB): **114 Top-Level-Schluessel**, dreisprachig (de/en/th — alle
drei Sprachen sind importiert, angezeigt wird de).

| Schluessel | Lage |
|---|---|
| 110 | importiert (Codex, C-161) — deckt sich mit meiner Zaehlung |
| `F`, `FIBTG` | ersetzt durch die exakten Schluessel `FD`, `FIBT` — kein Verlust |
| `SE` (Selen) | **kein Zielcode**: `nutrient_defs` fuehrt kein Selen (BLS kennt es nicht) — Text liegt brach, bis es einen Code gibt |
| `CHOL` | **echte Luecke:** `CHORL` (Cholesterin) existiert in `nutrient_defs` und hat KEINEN Detailtext — das Mapping `CHOL → CHORL` fehlt. Folgepunkt fuer Codex. |

`[cmd]` Umgekehrt: **28 der 138 Codes haben keinen Erklaertext** — 26
einzelne Fettsaeuren (`F10:0` … `F24:0`, `F18:1CN9`, …), `OLSAC` und
`F18:2C9T11`. Das Vorgaengerrepo hat sie nie beschrieben; das Modal
zeigt dort Referenzen und Trend, aber keine Erklaerung.

## Die Deckungsgrenze — Vorschlag, nicht gebaut

`[cmd]` Verteilung heute (dev): **59** Codes mit 100 % gedeckten
Positionen, **20** mit 80–99 %, **50** mit 50–79 %, **9 unter 50 %**.

`[read]` **Vorschlag:** unter **50 % Deckung** den Wert gedimmt
darstellen und die „aus X von Y"-Angabe hervorheben — **nicht
ausblenden, nicht werten**; die Zahl bleibt eine ehrliche
Untergrenze. Ausblenden wuerde 9 Codes verstecken, eine haertere
Grenze (z. B. 80 %) traefe heute 59 Codes — zu viel. Entscheidung
liegt bei Tom; bis dahin traegt jede Zeile ihre Deckung als Zahl.

## Nachweise

| Behauptung | Beleg |
|---|---|
| Alle vier Ebenen klappen | `[cmd]` 0 → 8 → 12 → 14 → 17 Zeilen; GLUS (Ebene 4) sichtbar |
| Start alles zu | `[cmd]` 6 Gruppenkarten, 0 Tabellenzeilen vor dem ersten Klick |
| Sicht ueberlebt Neuladen, liegt in der DB | `[cmd]` Reload: 17 Zeilen, GLUS bleibt; **frischer Browserkontext**: 25 Zeilen + 30er-Fenster ohne Klick; DB-Zeile mit exakt dieser Sicht |
| Fenster-Vorrang | `[cmd]` ohne Parameter gilt das gespeicherte 30er-Fenster; `?fenster=` gewinnt |
| Modal mit Erklaerung, beiden Zielwerten, Quelle | `[cmd]` Vitamin C: PRI 110/95 (EFSA, verlinkt, Version), UL 2.000 (NAM), Mangel/Ueberschuss, echter Trend |
| `under {parent}` stimmt | `[cmd]` GLUS → „unter Monosaccharide, gesamt"; CLD → kein Eltern-Pill |
| Zeilenschutz | `[cmd]` getrennte Zeilen je Nutzer; test-user sieht eigene Sicht (alles zu, Tagessumme), devs Zahlen nirgends |
| Bilder | `backup/g122/`: Baum hell/dunkel × 1440/375 + **Modal offen** (Vitamin C). Attrappe je 1 (Buddy-Orb, Bestand), 2 Konsolenfehler (bekannte `data-mode`-Warnung) |
| Typen und Tests | `[cmd]` typecheck gruen, Tests **449/449** (447 + 2; die 5 Stufen-Heuristik-Tests sind durch 6 `baueWald`-Tests ersetzt) |

## Was nicht angefasst wurde

- **Kein Schema** — C-161-Artefakte nur benutzt; `assessment_horizon_days` bleibt leer.
- **Wasser-Kachel** (`hydration.tsx`, G-124 bei Claude Code) und **`packages/ui`** unveraendert.
- Die Vorlagen-Knoepfe „Export" und „Filter" sowie der Kachelstreifen
  (Tracked/In range/…) sind weiter nicht gebaut — nicht beauftragt.
