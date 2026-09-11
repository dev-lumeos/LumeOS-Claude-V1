# Offene Fragen an Tom

**Erzeugt von `tools/fragen-index.mjs`. Nicht von Hand aendern.**

`[cmd]` **19 Punkte tragen `typ: entscheidung`
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

## G-415 — die vier Stufen und die Ballaststoffe

**Modul:** nutrition · **angelegt:** 2026-09-08 · **Datei:** `todos/nutrition-g-0415-die-vier-stufen-und-die-ballaststoffe.md`

## Frage 1: welche Erfahrungsstufen gibt es?

`[cmd]` **`public.profiles`, CHECK:**

    beginner | advanced | pro | elite

`[cmd]` **Wer hat welche: `pro` 2, der Rest NULL.**

`[cmd]` **`dev@lumeos.app` steht auf `pro`.**

### Und was G-228 nennt

`[cmd]` **`SPEC_04_FEATURES.md`, Feature 11:**

    beginner      0.75
    intermediate  0.90
    advanced      1.00
    elite         1.10

`[read]` **Die Listen decken sich NICHT:**

    Datenbank   beginner  advanced  pro   elite
    Spec        beginner  intermediate  advanced  elite

`[read]` **`pro` gibt es nur in der Datenbank,
`intermediate` nur in der Spec.**

`[cmd]` **Und G-228 nennt noch ein zweites Problem:** *,,Es ist
nicht spezifiziert, woher `user_level` kommt."*

`[cmd]` **Inzwischen ist das beantwortet** ?
`public.profiles.experience_level`, **und die Kachel liest es
(G-412).**

### Was zu entscheiden ist

**a** ? **Die Datenbank folgt der Spec:** `pro` **wird zu**
`intermediate`.

`[cmd]` **Zwei Zeilen zu aendern.**

`[read]` **Aber *pro* und *intermediate* heissen nicht dasselbe**
? **ein Profi ist ueber *advanced*, ein *intermediate*
darunter.**

**b** ? **Die Spec folgt der Datenbank:** **vier Stufen mit
Faktoren.**

    beginner  0.75
    advanced  1.00
    pro       ?
    elite     1.10

`[read]` **Dann fehlt genau ein Wert** ? **zwischen 1.00 und
1.10.**

**c** ? **Fuenf Stufen.**

    beginner      0.75
    intermediate  0.90
    advanced      1.00
    pro           1.05
    elite         1.10

`[read]` **Dann traegt die Datenbank einen Wert mehr.**

### Was der Multiplikator bewirkt

`[cmd]` **Der Score wird damit multipliziert** ? **ein Anfaenger
bekommt bei derselben Zufuhr einen hoeheren Wert.**

`[read]` **Die Begruendung dahinter: wer anfaengt, soll fuer
dasselbe weniger streng bewertet werden.**

`[cmd]` **`Thresholds: ok >= 80, warn 50-79, block < 50`** ?
**der Faktor verschiebt, wer in welche Klasse faellt.**

---

## Frage 2: warum fehlen Ballaststoffe im Schema?

`[cmd]` **Der gemessene Wert IST da:**

    nutrition.daily_summary.fibt
    nutrition.daily_summary.fibt_missing

`[cmd]` **Das ZIEL fehlt** ? **`goals.nutrition_targets` hat:**

    kcal, protein_g, carbs_g, fat_g,
    linoleic_acid_g, alpha_linolenic_acid_g

`[read]` **Kein `fiber_g`.**

`[read]` **Deshalb rechnet der Score mit 0.85 statt 1.00** ?
**der Anteil `fiber 0.15` hat keinen Bezugswert.**

### Woher ein Ziel kommen koennte

`[cmd]` **Die DGE nennt 30 g/Tag fuer Erwachsene** ? **eine feste
Zahl, keine Rechnung aus dem Gewicht.**

`[cmd]` **`linoleic_acid_g` und `alpha_linolenic_acid_g` stehen
schon in der Tabelle** ? **dieselbe Bauform.**

`[read]` **Also: eine Spalte `fiber_g`, und der Wert kommt aus
derselben Quelle wie die beiden Fettsaeuren.**

`[cmd]` **Messen, WIE die beiden gefuellt werden** ? **von Hand,
aus einer Formel, oder aus einem Referenzwert.**

`[read]` **Das ist ein Codex-Auftrag, sobald die Stufenfrage
entschieden ist.**

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

## C-451 — die Aufnahme eines Coaches

**Modul:** coach · **angelegt:** 2026-09-08 · **Datei:** `todos/coach-c-0451-die-aufnahme-eines-coaches.md`

## Befund

Tom, 2026-09-08, zu E-78:

> spaeter wird das durch registrierung/anmeldung eines coaches
> geregelt und womoeglich nach rulings oder im adminbereich durch
> uns geprueft. da wird es verschiedenste sachen wie dieses thema
> geben, zb welche module kriegt ein coach, ist er teil von
> marketplace etc

`[read]` **Die Rollenfrage aus C-450 war der kleinste Teil
davon.**

## Was zusammengehoert

    Registrierung   wie wird jemand Coach?
    Pruefung        wer prueft, nach welchen Regeln?
    Module          welche bekommt ein Coach?
    Marketplace     ist er Anbieter, und ab wann?
    Entzug          was, wenn die Pruefung faellt?

`[read]` **Es beruehrt drei Bereiche:** **`coach`, `market`,
`admin`** ? **und keiner davon ist fertig.**

## Was schon da ist

`[cmd]` **Das Altrepo:**

    apps/admin/                 319 Dateien
    docs/modules/auth/          169 KB, sieben Dateien
                                (API, COMPONENTS, DATABASE,
                                 FEATURES, MIGRATION, README,
                                 RESEARCH)

`[cmd]` **`docs/modules/auth/` ist die GROESSTE
Moduldokumentation** ? **groesser als `human-coach` mit 151 KB.**

`[read]` **Bevor daran gebaut wird: lesen** ?
`docs/lehren/altrepo-karte.md` **sagt, wo.**

`[cmd]` **Und `docs/specs/HumanCoach/SPEC_08_IMPORT_PIPELINE.md`
beschreibt das Onboarding** ? **aber die Aufnahme des COACHES, nicht
des Klienten, steht dort nur als `onboardCoach()`.**

## Warum es wartet

`[cmd]` **Coach ist zu 69 Prozent Attrappe, 0 Profile, 5 von 15
Tabellen leer.**

`[read]` **Ein Aufnahmeverfahren fuer ein Modul, das noch nichts
kann, waere die falsche Reihenfolge.**

`[read]` **Erst muss ein Coach etwas TUN koennen** ? **G-391 baut
das Geruest, das zeigt, was er koennen soll.**

## A-72 — eine Leser-Deklaration im Code

**Modul:** quer · **angelegt:** 2026-09-08 · **Datei:** `todos/quer-a-0072-eine-leser-deklaration-im-code.md`

## Befund

Aus C-424, Codex, 2026-09-08.

`[cmd]` **Eine Leser-Registry ist aus dem Bestand nicht dauerhaft
ableitbar:**

    pg_depend    127 Kanten fuer 12 Sichten
                 NULL fuer drei Funktionen, die lesen
    App-Code     108 Dateien mit .from(), 22 mit .rpc()
                 dem Katalog unbekannt

`[cmd]` **176 Tabellen, 12 Sichten, 164 Funktionen** — **eine
minimale Registry haette 352 Eintraege, ohne Leser-Kanten.**

## Die Frage

`[read]` **Codex' Ausweg:** *,,eine explizite, code-nahe
Leser-Deklaration oder eine verpflichtende statische Pruefung."*

`[read]` **Das ist eine Arbeitsregel, keine Aufgabe** — **jeder, der
eine Tabelle liest, muesste es hinschreiben.**

## Was es loesen wuerde

`[cmd]` **A-71: sechsmal am 07.09. lag ein Leseweg ungenutzt
daneben** — **und jedes Mal hat Tom es gefunden.**

`[read]` **Mit einer Deklaration waere messbar, wer liest und wer
nicht** — **und eine Kachel mit falschem Attrappen-Vermerk fiele
auf.**

## Was es kostet

`[read]` **Eine Zeile je Leseweg, gepflegt von jedem Agenten.**

`[read]` **Und ein Waechter, der sie prueft** — **sonst verfaellt
sie wie jede Handpflege.**

`[cmd]` **Zum Vergleich: `beruehrt:` in den Punktdateien ist
dieselbe Klasse** — **und `punkte-pruefen.mjs` haelt es gruen.**

## E-10 — RLS neu bewerten, sobald `main` produktiv wird

**Modul:** quer · **angelegt:** 2026-08-01 · **Datei:** `todos/quer-e-0010-rls-neu-bewerten-sobald-main-produktiv-wird.md`

## Befund

— viele
  Legacy-Tabellen sind `UNRESTRICTED`. Bei Dummydaten unkritisch (Entscheidung
  Tom), bei echten Nutzerdaten nicht. *Vgl. D-14 — derselbe Befund lokal:
  9 von 11 `nutrition`-Tabellen ohne RLS, obwohl die Migration es beschreibt.
  Das Muster wiederholt sich über zwei unabhängige Instanzen.*

## G-377 — ein gemeinsames Bauteil fuer den Modulkopf

**Modul:** quer · **angelegt:** 2026-09-08 · **Datei:** `todos/quer-g-0377-ein-gemeinsames-bauteil-fuer-den-modulkopf.md`

## Befund

Aus G-375, Claude Code, 2026-09-08.

`[cmd]` **11 Kopfbloecke, rund 523 Zeilen** — **alle setzen
dieselben vier bis fuenf Teile zusammen: Name, Untertitel,
Kennzahlen, Wechslerplatz, Aktionen.**

> *,,Genau deshalb driften sie ? elf Stellen, an denen man eine
> Klasse vergessen kann, und es ist zweimal passiert."*

`[cmd]` **Die zwei Male sind belegt:** **`medical` und `recovery`
hatten `hero-lite` nicht** — **und niemand merkte es, bis Tom
hinsah.**

## Der Aufwand

    ~80 Zeilen     das Bauteil
    30-45 Zeilen   je Modul ersetzt
    9 Vergleiche   Bildschirmfotos vorher/nachher
    settings       bleibt draussen, hat nie einen Kopf gehabt

`[cmd]` **In `apps/web`, nicht `packages/ui`** — **Admin und Coach
nutzen das gemeinsame Paket mit** (Lehre aus G-17).

## Was dafuer spricht

`[read]` **Eine Stelle statt elf** — **eine vergessene Klasse faellt
sofort auf.**

`[cmd]` **Und der Wechslerplatz waere dann ueberall gleich
gebaut** — **heute tragen ihn vier von neun.**

## Was dagegen spricht

`[read]` **Die Koepfe sind nicht gleich:** `[cmd]` **`goals` traegt
`v2-goals-phase-kopf`, `medical` einen Score-Kopf, `training` einen
Sitzungskopf.**

`[read]` **Ein Bauteil, das alle Faelle kann, ist kein Bauteil
mehr** — **es ist elf Faelle mit einem gemeinsamen Namen.**

`[read]` **Zu messen waere: wie viel ist wirklich gleich** —
**nicht wie viel sieht gleich aus.**

## G-403 — der Trenner und die Tokens, zweite Haelfte

**Modul:** quer · **angelegt:** 2026-09-08 · **Datei:** `todos/quer-g-0403-der-trenner-und-die-tokens.md`

## Befund

Aus G-402, Claude Code, 2026-09-08.

`[cmd]` **Der Referenz-Trenner liegt jetzt in `packages/ui`, die
Kopie in `apps/coach` ist weg.**

`[cmd]` **`apps/web` behaelt seine eigene** ? **der Auftrag verbot,
sie anzufassen.**

> *,,Die Tokens habe ich bewusst nicht verschoben: ein dritter Ort
> im Paket haette drei Dateien statt zwei ergeben, solange
> `apps/web` nicht mitziehen darf."*

`[read]` **Beide Male dieselbe Ursache** ? **die Regel
*,,`apps/web` nicht anfassen"* verhindert das Aufraeumen.**

## Was zu entscheiden ist

`[read]` **Ein Auftrag, der `apps/web` ausdruecklich erlaubt** ?
**nur fuer diese zwei Sachen:**

    1  referenz-trenner: apps/web nutzt den aus packages/ui
       -> eine Fassung statt zwei

    2  die Tokens: lume.css und apps/coach/tokens.css
       -> eine Fassung im Paket, --acc bleibt lokal

`[cmd]` **Claude Code hat gemessen: nur `--acc` weicht ab,
absichtlich.**

`[read]` **Mit Gegenprobe: `apps/web` sieht danach gleich aus,
1545 Tests bleiben gruen.**

## Settings und Workspaces — eigene, nicht kopierte

Tom, 2026-09-08: *,,ich will nicht settings und workspaces von
apps/web kopiert haben. das soll fuer coach angelegt werden ? mit
den eigenen settings und eigenen links zu lumeos, marketplace,
admin."*

### Workspaces im Portal

`[read]` **Aus dem Portal fuehren drei Links hinaus:**

    LumeOS        localhost:3200  -- die eigene Nutzersicht
    Marketplace                   -- als Anbieter
    Admin         localhost:3210

`[read]` **Nicht *Coach Portal* selbst** ? **das waere ein Verweis
auf sich, und genau deshalb hat Claude Code die Gruppe
weggelassen.**

`[cmd]` **`nav.ts` in `packages/ui` fuehrt heute die Liste von
`apps/web`** ? **das Portal braucht seine eigene, ueber die
`gruppen`-Requisite aus G-402.**

### Settings im Portal — die des COACHES

`[cmd]` **`coach.coach_profiles` hat heute SIEBEN Spalten:**

    id, user_id, display_name, email,
    is_active, created_at, updated_at

`[cmd]` **Und `CoachProfile.tsx:8-12` im Altrepo zeigt, was ein
Coach einstellt:**

    business_name      der Geschaeftsname
    bio                die Selbstbeschreibung
    contact_email      getrennt von der Anmelde-Adresse
    website
    specialties[]      Fachgebiete, mit Hinzufuegen/Entfernen
    certifications[]   Nachweise
    max_clients        wie viele Klienten, Vorgabe 25
    tier               starter | professional |
                       business | enterprise

`[read]` **Sieben Felder fehlen, plus `tier`.**

`[cmd]` **Und Coach-EINSTELLUNGEN gibt es gar nicht** ? **null
Tabellen mit `coach_setting` oder `coach_config`.**

`[read]` **Claude Code hat sie in G-402 fuer den Alarm-Erzeuger
verlangt** (*,,eine Tabelle fuer Coach-Einstellungen"*) ? **hier
ist derselbe Bedarf.**

### Was daraus folgt

**1** ? **Ein Codex-Auftrag:** `coach_profiles` **um die sieben
Felder, und eine Tabelle fuer Einstellungen.**

`[read]` **`tier` ist eine eigene Frage** ? **es beruehrt
Abrechnung, und die ist nicht entschieden** (C-451).

**2** ? **Ein UI-Auftrag:** **der Settings-Bereich im Portal, mit
eigener `gruppen`-Liste fuer Workspaces.**

`[read]` **Die Reihenfolge ist wie ueberall: erst die Spalten,
dann die Oberflaeche.**

## Und zwei Zeilen aus G-402

`[cmd]` **Workspaces:** `nav.ts` **fuehrt *Coach Portal* selbst** ?
**im Portal waere das ein Verweis auf sich.**

`[cmd]` **Settings:** `SETTINGS_ENTRY` **zeigt auf `/v2/settings`,
das es in `apps/coach` nicht gibt.**

`[read]` **Soll das Portal beides tragen?** `[read]` **Dann
braucht es eigene Ziele** ? **Workspaces zurueck nach
`apps/web`, Settings auf den Portal-Reiter.**

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

## G-414 — admin und coach teilen 65 Prozent

**Modul:** quer · **angelegt:** 2026-09-08 · **Datei:** `todos/quer-g-0414-admin-und-coach-teilen-65-prozent.md`

## Befund

Aus G-411, Claude Code, 2026-09-08:

> *,,Die Formulare selbst bleiben drei: `web` teilt nur 15 % mit
> den anderen (`signUp`, `react-hook-form/zod` ? eine
> dokumentierte Entscheidung), `admin`/`coach` 65 %, aber deren
> Unterschied ist Titel und Hinweistext."*

`[read]` **Zwei Formulare, die sich in zwei Zeichenketten
unterscheiden.**

## Die Entscheidung

**a** ? **Eine Fassung in `packages/ui`**, **Titel und Hinweis als
Requisiten.**

`[read]` **Dann sind es zwei statt drei.**

**b** ? **So lassen.**

`[read]` **65 Prozent sind viel, aber die beiden Anwendungen sind
klein** ? **und eine gemeinsame Fassung bindet sie aneinander.**

## Was dagegen spricht, es jetzt zu tun

`[cmd]` **`web` teilt nur 15 Prozent** ? **eine gemeinsame Fassung
haette `web` NICHT eingeschlossen.**

`[read]` **Also: eine Doppelung weniger, aber die groesste
Abweichung bleibt.**

`[read]` **Kein dringender Punkt** ? **er steht hier, damit er
nicht vergessen wird.**

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
