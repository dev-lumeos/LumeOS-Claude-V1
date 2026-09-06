# Offene Fragen an Tom

**Erzeugt von `tools/fragen-index.mjs`. Nicht von Hand aendern.**

`[cmd]` **16 Punkte tragen `typ: entscheidung`
und sind keiner Entscheidung zugeordnet.**

`[read]` **Jeder Satz unten steht woertlich in der genannten
Punktdatei.** Das Gate prueft es bei jedem Lauf — wer hier
hineinschreibt, macht es rot.

**Wenn eine Frage entschieden ist:** ein ADR in
`docs/entscheidungen/`, und der Punkt bekommt `entscheidung: E-xx`.
Dann faellt er hier heraus.

`[read]` **Was aufbereitet gehoert, gehoert in die Punktdatei** —
nicht in diese Uebersicht.

---

# Hoch

## G-352 — drei Zielskalen widersprechen sich

**Modul:** quer · **angelegt:** 2026-09-07 · **Datei:** `laufend_claudecode/quer-g-0352-drei-zielskalen-widersprechen-sich.md`

## Befund

Aus G-83, Claude Code, 2026-09-07.

`[cmd]` **Nachgemessen in `goals.user_goals`:**

    goal_type          body_composition, performance, health,
                       lifestyle                          -- 4
    difficulty_level   easy, moderate, challenging,
                       aggressive, unrealistic            -- 5

`[cmd]` **Der ADR nennt zwoelf Zielarten** — **sie passen zu keiner
der beiden Tabellen.**

`[cmd]` **11 Zeilen liegen im Bestand.**

## Warum es blockiert

`[read]` **Der Onboarding-Entwurf hat einen Schritt *Ziel
waehlen*.** `[read]` **Welche Skala er zeigt, ist nicht
entschieden.**

`[read]` **Und `goal_type` ist Pflicht** — **wer ein Ziel anlegt,
muss einen der vier Werte setzen.**

## Zu entscheiden

`[read]` **Welche Skala gilt?**

`[read]` **Die vier `goal_type`-Werte sind Kategorien** —
*Koerperzusammensetzung*, *Leistung*, *Gesundheit*, *Lebensstil*.

`[read]` **Die zwoelf des ADR sind vermutlich konkrete Ziele** —
*abnehmen*, *Muskeln aufbauen*, *Marathon*.

`[cmd]` **`subtype` steht daneben und ist optional** — **das koennte
der Ort fuer die zwoelf sein.**

`[read]` **Dann waeren es keine drei Skalen, sondern zwei Ebenen:**
**vier Kategorien, zwoelf Unterarten.**

`[read]` **Zu pruefen, bevor eine dritte entsteht.**

## Gemessen am 2026-09-06 (G-353)

**Die Pruefung, die dieser Punkt verlangt** — *,,zu pruefen, bevor
eine dritte entsteht"* — **ist gelaufen. Der Verdacht stimmt, und er
greift weiter.**

`[cmd]` **`subtype` ist `text`, nullable, OHNE CHECK** — eine freie
zweite Ebene. **Und schon belegt:** `cut`, `gain_muscle`,
`strength`, `training_capacity`, `cardio_frequency` unter den vier
`goal_type`.

`[cmd]` **Die zwoelf des ADR sind keine Zielarten, sondern PHASEN.**
**`goals.goal_phases.phase_type` steht live mit neun Werten:**
`fat_loss`, `lean_bulk`, `maintenance`, `recomp`, `contest_prep`,
`reverse_diet`, `expert_bb_annual`, `mini_cut`, `peak_week`.

`[cmd]` **Fuenf davon stehen woertlich in der Liste, aus der der ADR
zitiert** (`docs/BrainstormDocs/Core/auth_API.md:224`) — **und die
traegt FUENFZEHN Werte, nicht zwoelf.**

`[read]` **Jene Liste vermischt grob und fein** (`bulk` neben
`lean_bulk`). **Das laufende Schema hat genau das aufgeloest.**

`[cmd]` **Berichtigt: `difficulty_level` ist KEINE Zielskala**,
sondern die Schwierigkeit — eine Achse quer dazu. **Die Zahl 5 im
Kopf dieses Punktes zaehlt etwas anderes als die 4 und die 12.**

`[read]` **Es sind also vier Achsen, drei davon gebaut:**

    goal_type    WAS        4, CHECK, NOT NULL
    subtype      WELCHES    frei, kein CHECK
    phase_type   WIE        9, CHECK, live belegt
    variant      WIE STARK  frei, Vorgabe 'moderate'

**Was noch zu entscheiden bleibt, ist kleiner:**

    1  Bekommt `subtype` einen CHECK, oder bleibt er frei?
    2  Welche Achse setzt das Onboarding?
       (die Zielwerte lesen heute `profiles.nutrition_goal`,
        nicht `user_goals` - gemessen in G-83)

`[read]` **Keine Entscheidung ,,vier gegen zwoelf"** — **die Ebenen
existieren bereits.**

---

# Mittel

## A-43 — Coach-Permissions pro Subfunktion

**Modul:** coach · **angelegt:** 2026-08-21 · **Datei:** `todos/coach-a-0043-coach-permissions-pro-subfunktion.md`

## Befund

(neu 2026-08-21).
  **Entscheidung fuer Tom.** Abgespalten von A-37.

  `[read]` **A-37 traegt zwei Titel** — in `TODO.md` *„Zwoelf ADRs"*, in
  der Entscheidungsliste *„Coach-Permissions pro Subfunktion"*. **Das
  ist ein eigener Punkt.**

  `[cmd]` **`ADR_COACH_PERMISSIONS_V1`:** *„User kann **pro Modul und
  Subfunktion** freigeben"* — mit Beispielen: `nutrition.diary`,
  `nutrition.water`, `nutrition.micronutrient`, `nutrition.mealcam_*`.

  `[cmd]` **Gebaut ist nur pro Modul** — `client_permissions` hat
  `nutrition_visibility`, nicht `nutrition_diary_visibility`.

  `[read]` **Das betrifft die Kernanforderung des Coach-Portals.**
  **Zu entscheiden: reicht die Modulstufe, oder kommt die Feinstufe?**

  `[cmd]` **F-06 hat gemessen, dass die Freigabe ueberhaupt erst seit
  C-162 wirkt** — 22 `coach_read`-Policies ueber sechs Module. **Eine
  Feinstufe waere sechs mal soviel.**

## E-10 — RLS neu bewerten, sobald `main` produktiv wird

**Modul:** quer · **angelegt:** 2026-08-01 · **Datei:** `todos/quer-e-0010-rls-neu-bewerten-sobald-main-produktiv-wird.md`

## Befund

— viele
  Legacy-Tabellen sind `UNRESTRICTED`. Bei Dummydaten unkritisch (Entscheidung
  Tom), bei echten Nutzerdaten nicht. *Vgl. D-14 — derselbe Befund lokal:
  9 von 11 `nutrition`-Tabellen ohne RLS, obwohl die Migration es beschreibt.
  Das Muster wiederholt sich über zwei unabhängige Instanzen.*

## C-123 — Recovery — die neun Entscheidungen

**Modul:** recovery · **angelegt:** 2026-08-19 · **Datei:** `todos/recovery-c-0123-recovery-die-neun-entscheidungen.md`

## Befund

(neu 2026-08-19).
  **Von Tom entschieden am 2026-08-19.** Grundlage fuer die Bauauftraege.

  | | Entscheidung |
  |---|---|
  | **E1** | **Nur `manual`.** *Die Wearables kommen spaeter.* |
  | **E2** | Soreness: **nur gemeldete Muskeln > 0** |
  | **E3** | **Sechs Readiness-Stufen**, Texte einzeln abnehmen |
  | **E4** | **siehe unten** |
  | **E5** | **Recherchieren** statt setzen |
  | **E6** | **Stress-Score bauen** — nicht zurueckstellen |
  | **E7** | **Eine Erholungskurve** |
  | **E8** | **Recherchieren** |
  | **E9** | Naehrstoff-Term: **Rueckfall 70**, als Rueckfall markiert |

  ### E4 — die wichtigste Praezisierung

  **Tom:** *„Wichtig: Wir bewerten nur Fakten. Die Empfehlung sehe ich
  als angebracht, wenn die Datenlage dem entspricht — **aber nicht wegen
  eines Uebertrainingssymptoms.**"*

  `[read]` **Der Arzt-Hinweis haengt an mehreren Signalen ueber Zeit**,
  nicht an einem Ausschlag. **Ein schlechter Tag ist kein Befund.**

  `[cmd]` **Was daraus folgt:** Die neun Signale werden gezaehlt und
  gezeigt — **die Empfehlung erscheint erst, wenn mehrere ueber mehrere
  Tage zusammenkommen.** Wie viele und wie lange, muss die Recherche
  aus E5/E8 mitbeantworten.

  ### E6 weicht vom Vorschlag ab

  `[cmd]` **Der Entwurf schlug zurueckstellen vor, Tom sagt bauen.**
  `[read]` Stress steht im Check-in und wirkt auf die Erholung — ihn
  wegzulassen hiesse, einen erfassten Wert unbenutzt zu lassen.

## C-167 — `MODALITY_BONUS` hat elf Modalitaeten, wir kennen vier

**Modul:** recovery · **angelegt:** 2026-08-20 · **Datei:** `todos/recovery-c-0167-modality-bonus-hat-elf-modalitaeten-wir-kennen-vier.md`

## Befund

(neu 2026-08-20). Aus SSOT 173. **Betrifft C-124.**

  `[cmd]` **Der Entwurf:**

  ```
  sauna 2.0 · massage 2.5 · cold_plunge 1.5 · contrast_therapy 2.0
  nap 1.5 · meditation 1.0 · breathwork 1.0 · yoga 0.75
  foam_rolling 0.5 · stretching 0.5 · active_recovery 0.5
  MAX_DAILY_BONUS = 5.0
  ```

  `[cmd]` **`recovery.modality_log` kennt vier** — Sauna, Dehnen,
  Massage, Eisbad.

  `[read]` **C-124 fuehrt die Werte als unbelegt** — **das bleibt
  richtig**, sie sind Entwurfswerte. **Aber die Liste ist laenger als
  gedacht, und der Deckel von 5,0 ist eine Entscheidung, die niemand
  kennt.**

## C-218 — Frontend und Datenbank normieren den Recovery-Score verschieden

**Modul:** recovery · **angelegt:** 2026-08-22 · **Datei:** `todos/recovery-c-0218-frontend-und-datenbank-normieren-den-recovery-score-verschieden.md`

## Befund

(neu 2026-08-22). Aus C-181 und C-215.

  `[cmd]` **Fable rechnet `subtotal/85 × 100`** (C-181), damit die
  Readiness-Schwellen 90/80/70/60/40 ihre Skala behalten.
  `[cmd]` **Codex laesst den Term ersatzlos wegfallen** (C-215):
  `manual_v2_c215`, `training_load_points` 0,00.

  `[cmd]` **Live vorher 79,4 mit `training_load_points` 10,50. Nach der
  Kette 68,9.** Ein Szenariotag faellt auf 35,3.

  `[cmd]` **`GEWICHTE.trainingslast: 15` steht weiter in `score.ts`** —
  mit `roh: 'entfaellt — C-181, ACWR ohne Beleg'`, aber das Gewicht ist
  da.

  `[read]` **Beide Wege sind fuer sich begruendet, zusammen ergeben sie
  zwei Skalen.** Zu entscheiden: normiert wird auf 100, oder die Skala
  faellt auf 85 und die Schwellen wandern mit. **Nicht beides.**

  `[read]` Und der Nutzer sieht eine Verschlechterung um zehn Punkte.
  Das ist die richtige Zahl — aber sie gehoert erklaert, nicht
  kommentarlos angezeigt.

---

## M — Die Module sagen die Unwahrheit ueber sich selbst

`[cmd]` **Aufgenommen am 2026-08-22** (C-217 Code, G-155 Bild).
Werkzeuge: `tools/_modul-bestand.py`, `tools/_g155-bestand.mjs`.
Maschinenlesbar: `backup/modul-bestand.json`, `backup/bestand/aufnahme.json`
(128 Eintraege), 128 Bildschirmfotos.

`[cmd]` **Gegengeprueft: 25 von 25 Zeilenzahlen exakt.** Der Bestand
stimmt, die Oberflaeche nicht.

`[read]` **Der Befund in einem Satz:** Sieben Module tragen einen
Pauschalbanner *„das Schema gibt es noch nicht"*. **Bei sechs ist er
falsch.** Und der groesste Posten ist nicht fehlendes Schema, sondern
**Daten liegen und werden nicht gelesen**.

`[cmd]` **Gesamtlage, Marken gegen Kacheln:**

| Modul | Marken | Kacheln | Schema | Zeilen | Lage |
|---|---:|---:|---|---:|---|
| supplements | 59 | 79 | da | 3.852 | 16 markierte Rueckfaelle neben echten Fassungen |
| coach/ai | 46 | 36 | **fehlt** | 0 | der einzige Banner, der stimmt |
| training | 38 | 56 | da | 9.946 | Banner nennt Tabellennamen, die nie existierten |
| recovery | 36 | 40 | da | 858 | Banner behauptet das Gegenteil der Datenbank |
| coach | 33 | 36 | da | 63 | Daten vollstaendig, Oberflaeche liest an einer Stelle |
| nutrition | 25 | 55 | da | 990.000+ | am weitesten echt; Plans-Tab Attrappe trotz Daten |
| goals | 23 | 71 | da | 450 | echt und Attrappen-Doppel je Tab |
| medical | 18 | 44 | da | 14.340 | Banner falsch, Detail-Banner praezise |
| dashboard | 12 | 8 | quer | — | haengt an den Quellmodulen |
| settings | 0 | 3 | — | 7 | echt |

### Die falschen Banner — eine Zeile je Modul

### Daten liegen, werden nicht gelesen — der groesste Posten

`[read]` Diese Punkte brauchen **kein Schema und keine Entscheidung**.
Die Tabellen sind da, gefuellt, und in denselben Modulen liest schon
etwas anderes daraus. **Das ist die billigste echte Arbeit im Repo.**

## G-106 — Der Readiness-Komposit waere ein zweiter Gesamtwert

**Modul:** recovery · **angelegt:** 2026-08-20 · **Datei:** `todos/recovery-g-0106-der-readiness-komposit-waere-ein-zweiter-gesamtwert.md`

## Befund

(neu 2026-08-20). Befund aus G-100. **Gemeldet statt gebaut.**

  `[cmd]` **Der Entwurf rechnet aus fuenf Anteilen einen Wert und
  schreibt *„Push hard"* daneben.**

  `[read]` **Zwei Gruende, warum er draussen blieb:** *„`recovery.scores`
  fuehrt bereits einen Gesamtwert mit sieben Anteilen (G-82) — **zwei
  Gesamtwerte nebeneinander waeren schlimmer als einer**."* Und *„Push
  hard"* ist Urteilssprache, wie *„Good"* (G-76) und *„Optimal"*
  (G-60).

  `[cmd]` **`Body battery` gibt es im Schema nicht** — *„keine Spalte
  `batter*` irgendwo."*

  **Zu entscheiden:** Faellt die Kachel weg, oder zeigt sie den
  vorhandenen Erholungswert?

## C-199 — `medication_regulatory` als eigene Entitaet

**Modul:** supplements · **angelegt:** 2026-08-22 · **Datei:** `todos/supplements-c-0199-medication-regulatory-als-eigene-entitaet.md`

## Befund

(neu 2026-08-22). **Zu entscheiden.**

  `[cmd]` Kimi fuehrt 498 Saetze mit `wada.status`, `wada.tue_context`
  und `change_history`. Im Repo liegt das als `regulatory_state jsonb`
  in `active_substances` — **es gibt keine vierte Tabelle.**

  `[cmd]` **WADA ist nur zu 11 % bewertet** (56 von 498).

  `[read]` **Fuer Wettkampfsportler ist WADA-Status eine Abfrage, kein
  Anhaengsel.** Als `jsonb` ist er nicht filterbar.

### Was gar kein Schema hat

## C-341 — was passiert mit gemeldeten Community-Beitraegen?

**Modul:** supplements · **angelegt:** 2026-08-29 · **Datei:** `todos/supplements-c-0341-was-passiert-mit-gemeldeten-community-beitraegen.md`

## Befund

**Aus E-28:** die Community wird nicht kuratiert, Nutzer schreiben.

`[read]` **Ohne Vorabpruefung braucht es einen Umgang mit dem, was
schiefgeht** — nicht Kuratierung, sondern das Uebliche: melden,
verbergen, sperren.

`[read]` **Und die inhaltliche Grenze aus E-28 muss durchsetzbar
sein:** Nebenwirkungen und Erfahrungen duerfen stehen,
**Dosierungsprotokolle nicht.** `[read]` **Wer entfernt einen Beitrag,
der ein Protokoll enthaelt, und wie faellt er auf?**

## Offen

`[read]` **Wer meldet, wer entscheidet, wie schnell.** `[read]` **Und
was mit dem Beitrag geschieht** — verborgen oder geloescht. **Bei
einem Gesundheitsprodukt ist das nicht dasselbe.**

## G-150 — Die Volltextsuche findet ueber Erklaertexte

**Modul:** supplements · **angelegt:** 2026-08-21 · **Datei:** `todos/supplements-g-0150-die-volltextsuche-findet-ueber-erklaertexte.md`

## Befund

(neu
  2026-08-21). Befund aus G-147. **Zu entscheiden, ob erwuenscht.**

  `[cmd]` **Die BCAA-Ursache war nicht der vermutete Zielwert:**
  *„„BCAA" stand woertlich in den `function_de`-Texten von Isoleucin und
  Valin, in keinem Leucin-Text — der Volltext-Zufall fand zwei."*

  `[cmd]` **Nachgemessen: `ILE` und `VAL` tragen *„BCAA"* im
  Erklaertext, `LEU` nicht.**

  `[read]` **Der Orchestrator hatte auf den Zielwert getippt** — Leucin
  ist der einzige der drei mit eigener Referenz. **Falsch geraten, der
  Agent hat gemessen.**

  ### Die Frage dahinter

  `[cmd]` **Die Suche durchsucht seit G-129 auch die 110
  Erklaertexte** — das war Absicht: *„wer „Skorbut" eingibt, sollte
  Vitamin C finden."*

  `[read]` **Aber sie findet dabei auch Zufallstreffer**, die kein Alias
  sind. **Seit G-147 ist der Alias sauber** — `bcaa` liefert drei.
  **Die Frage ist, ob der Volltexttreffer daneben stehen soll.**

  **Vorschlag:** Alias-Treffer und Texttreffer unterscheidbar zeigen.
  `[read]` **Wer *„Skorbut"* sucht, will den Texttreffer. Wer *„BCAA"*
  sucht, will die drei.**

## G-53 — `InjektionsKarte` in `packages/ui` hat keinen Aufrufer

**Modul:** supplements · **angelegt:** 2026-08-18 · **Datei:** `todos/supplements-g-0053-injektionskarte-in-packages-ui-hat-keinen-aufrufer.md`

## Befund

(neu 2026-08-18). Befund aus G-45.

  `[cmd]` **Gebaut und exportiert in G-26, von keinem Tab gerufen.** Die
  Supplements-Karte wurde nach Toms Entscheidung **im Modul** gebaut,
  weil die Vorlage sechs Felder je Ort fuehrt, die der Baustein nicht
  hat.

  `[read]` **Nicht loeschen, aber entscheiden:** entweder sie bekommt
  die fehlenden Felder und den Injections-Tab als Aufrufer, **oder sie
  faellt weg.** Ein Baustein ohne Aufrufer wird beim naechsten Mal ein
  zweites Mal gebaut — **das ist bereits passiert.**

## GO-24 — *„Mineralstoffe"* als Gruppenbegriff?

**Modul:** supplements · **angelegt:** 2026-08-20 · **Datei:** `todos/supplements-go-0024-mineralstoffe-als-gruppenbegriff.md`

## Befund

(neu
  2026-08-20). **Produktfrage aus C-165.**

  `[cmd]` **`Elektrolyte` trifft fuenf Codes, `Spurenelemente` acht.**
  **Und *„Mineralstoffe"*?**

  `[read]` **Es waere die ganze Gruppe *Elemente* (16 Codes)** —
  **oder nichts**, weil die Karte schon so heisst. **Zu entscheiden, ob
  ein Alias auf eine ganze Karte zeigen darf.**

---

## K — Kimi-Bestand: Abgleich und Vertiefung

`[cmd]` **Aufgenommen am 2026-08-22 (C-194).** Der Bestand liegt unter
`backup/kimi-research/Kimi_Agent/supplement_performance_database/`,
untracked, 346 MB. **Er kommt nicht ins Repo** — der Pre-Commit-Hook
sperrt Dateien ueber 10 MB.

`[read]` **Der Befund, der die Gruppe begruendet:** Wir haben die
Huelle importiert und den Inhalt liegenlassen. `[cmd]`
`supplements.substance_catalog` hat **31 Spalten**, Kimi liefert
**146 Felder** je Substanz — **130 davon haben keine Repo-Spalte.**

`[read]` **Reihenfolge:** Schema vor Import, Import vor Oberflaeche.
K-01 bis K-03 haengen aneinander. Alles mit *„Schema fehlt"* ist
Codex; nichts davon ist Oberflaechenarbeit, solange die Daten fehlen.

### Substanzen — die dichteste Luecke

## E-07 — Lücke weibliche Darstellungen entscheiden

**Modul:** training · **angelegt:** 2026-08-01 · **Datei:** `todos/training-e-0007-lucke-weibliche-darstellungen-entscheiden.md`

## Befund

— 186 von 1.448
  Übungen (13 %). Bewusster Verzicht oder Produktionsauftrag über 1.262 Übungen?
  *Gehört in die Produktentscheidung, nicht in eine Fussnote.*
  **`[cmd]` 2026-08-07 gegen die laufende Instanz bestätigt: genau 186.**
  Die Zahl stimmt, sie war keine Schätzung. Aufschlüsselung:
  `image_female_start` 186, `image_female_end` 186 — dieselben Übungen,
  beide Felder gefüllt oder beide leer. Zum Vergleich `image_male_start`
  1.370 (95 %), `video_url` 1.274 (88 %), ganz ohne Medien 39 (2,7 %).
  Die Entscheidung bleibt offen; die Datenlage ist jetzt belegt.

  **Regel entschieden 2026-08-07 (Tom): Ist der Nutzer weiblich, wird die
  weibliche Darstellung gezeigt; fehlt sie, die männliche.**
  Umsetzung wartet auf die Nutzerverwaltung — kein neuer Auftrag heute.

  `[cmd]` 2026-08-07 gegen den Live-Bestand geprüft: Die Regel ist heute
  **nicht umsetzbar** und in der vorliegenden Form **unvollständig**.
  Beides gehört vor die Umsetzung, nicht danach.

  1. **Es gibt kein Geschlecht.** `public.profiles` trägt genau drei Spalten
     (`id`, `created_at`, `updated_at`); `[cmd]` kein Treffer auf
     `gender`/`sex`/`geschlecht` in `apps/`, `packages/` oder
     `supabase/_pipeline/`. Die Bedingung hat keinen Wert, den sie lesen
     könnte. Das Feld gehört zum Onboarding und damit zur Nutzerverwaltung.
  2. **Der Rückfall muss in beide Richtungen gehen.** `[cmd]` Genau **eine**
     Übung trägt ausschliesslich eine weibliche Darstellung ohne männliche —
     dort bekäme ein männlicher Nutzer nichts.
  3. **Es gibt einen dritten und vierten Fall.** `[cmd]` 37 Übungen haben
     Medien, aber kein Bild (nur Video); 39 haben gar keine Medien.

  Vollständige Regel, wie sie umzusetzen wäre: gewünschtes Geschlecht
  vorhanden → nimm es; sonst anderes Geschlecht vorhanden → nimm das; sonst
  Video vorhanden → nimm das; sonst kein Medium, und die Oberfläche sagt es.

  **Zahlenkorrektur `[cmd]` 2026-08-07:** Die oben belegten 186 galten für
  1.448 Übungen. Nach der Dublettenzusammenführung (1.448 → 1.416) sind es
  **170** mit weiblicher Darstellung, 1.339 mit männlicher. Die alten Zahlen
  bleiben stehen, weil sie zum damaligen Bestand gehören.

## G-88 — Die Sitzungskarte auf `Today`

**Modul:** training · **angelegt:** 2026-08-19 · **Datei:** `todos/training-g-0088-die-sitzungskarte-auf-today.md`

## Befund

(neu 2026-08-19).
  **Entscheidung fuer Tom.** Rest aus G-86.

  `[cmd]` **Teilweise baubar:** `planned_sets`, `planned_reps`,
  `planned_weight_kg` stehen auf **60 von 60** — **aber `rir` und
  `is_pr` sind 0 von 101.** Zwei von fuenf Spalten fehlen.

  `[read]` **Der Agent hat sie ganz beim Entwurf gelassen statt halb
  gefuellt** — richtig. **Zu entscheiden:** drei von fuenf zeigen und
  zwei weglassen, oder warten, bis die Seeds `rir` und `is_pr`
  liefern?

  `[cmd]` **Die Spalten existieren** — `workout_sets` traegt `rpe`,
  `rir`, `set_type`, `rest_seconds`, `logged_via`. **Sie sind nur
  leer.**

---

# Niedrig

## A-64 — der Schirmlauf ausserhalb des Gates

**Modul:** quer · **angelegt:** 2026-08-30 · **Datei:** `todos/quer-a-0064-der-schirmlauf-ausserhalb-des-gates.md`

## Befund

Aus A-29, Claude Code, 2026-08-30.

`[cmd]` **Ein Schirmlauf ueber alle Reiter kostet 7,8 Minuten, der
ganze uebrige Gate etwa eine.** `[cmd]` **Und er braucht Server,
Datenbank, Anmeldung und Chromium** — **alle 20 Gate-Schritte sind
reine Dateipruefungen.**

`[read]` **Deshalb gehoert er nicht in den Gate.** `[cmd]` **Aber er
funktioniert und ist stabil:** dieselbe Route fuenfmal, `attrappen=2`
jedes Mal.

## Die Frage

**Soll er woanders laufen?**

`[read]` **Dafuer spricht: er ist die einzige belastbare
Attrappenzahl.** `[cmd]` **Eine Quelltextzahl kann nicht richtig
sein** — `tabs.tsx` traegt 17 Marken und zeigt 1 / 7 / 1, je nach
offenem Reiter.

`[read]` **Dagegen: was nicht im Gate laeuft, laeuft irgendwann gar
nicht.** `[cmd]` **`LAUFEND.md` ist genau daran gestorben.**

`[read]` **Ein Mittelweg waere, ihn auf Zuruf zu behalten** — er wird
in jedem UI-Auftrag ohnehin verlangt, **und die Zahl steht dann im
Bericht statt in einem Lauf, den niemand ansieht.**

## G-219 — `LiveWorkout` hat keinen Aufrufer mehr

**Modul:** training · **angelegt:** 2026-08-28 · **Datei:** `todos/training-g-0219-liveworkout-ohne-aufrufer.md`

## Befund

`[cmd]` Aus G-217: `LiveWorkout` steht in `ansicht.tsx:966`, **ohne
Aufrufer.** Das Formular aus G-217 hat ihn ersetzt.

`[read]` **Claude Code hat ihn absichtlich stehengelassen und es
gesagt** — er zeigt die Zielgestalt: Pausenuhr, PR-Marke,
Zielvorgabe. **Dinge, die das Formular nicht hat und die jemand
gedacht hat.**

## Die Entscheidung

`[read]` **Der G-163-Beschluss sagt: Rueckfallfassungen bleiben nicht
als Notfallanzeige stehen.** `[read]` **Aber das hier ist keine
Rueckfallfassung, sondern ein Entwurf** — und in G-189 hat sich
gezeigt, was passiert, wenn man einen toten Zweig ersatzlos entfernt,
der nebenbei etwas trug.

**Zwei Wege:**

**Entfernen** und die Zielgestalt als Punkt festhalten. `[read]`
Sauber, aber die Gestalt ist dann Text statt Code.

**Stehenlassen**, mit einem Kommentar, der sagt, dass er kein
Aufrufer hat und warum er bleibt. `[read]` **Dann muss der
Attrappenzaehler ihn kennen**, sonst faellt er beim naechsten Zaehlen
wieder auf.

`[read]` **Kein Fall fuer einen Agenten** — es ist eine Frage, wie
lange ein Entwurf im Code stehen darf.
