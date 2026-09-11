---
nr: G-421
typ: feature
modul: goals
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 5d9b300a
beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  fehlend: 6
---

# G-421 — die vier fehlenden Reiter in Goals & Body

## Befund

`[cmd]` **`tools/vollstaendigkeit.mjs goals`: 59 von 65.**

    FEHLT  CompTab       2 Unterkomp., 4 Kacheln
           + BodyFatScale
    FEHLT  GoalsTab      1 Unterkomp., 3 Kacheln
           + GoalCard
    FEHLT  MeasureTab    3 Kacheln
    FEHLT  MetricsTab

`[read]` **Vier Reiter, zwei Unterbauteile.**

## Was schon da ist

`[cmd]` **`apps/web/src/app/v2/goals`, 17 Dateien:**

    tab-phase.tsx        37,5 KB
    tab-composition.tsx  13,5
    tab-koerper.tsx      11,8
    tab-physique.tsx     16,7
    tab-timeline.tsx      8,8
    phase-editor.tsx     45,4
    modale.tsx           25,6
    ziel-karten.tsx      13,1
    mockup-referenz.tsx  41,2

`[read]` **Miss ZUERST, ob die vier wirklich fehlen** ? **oder ob
sie unter anderem Namen dastehen.**

`[cmd]` **`tab-composition.tsx` koennte `CompTab` sein,
`ziel-karten.tsx` koennte `GoalCard` sein,
`tab-koerper.tsx` koennte `MeasureTab` sein.**

`[read]` **Das Werkzeug misst NAMEN** ? **der Orchestrator hat
heute viermal Namen geraten und lag jedes Mal falsch.**

## Die Datenlage

`[cmd]` **Alle Tabellen tragen Daten:**

    user_goals                   11
    body_measurements           362
    body_circumferences          54
    goal_milestones              13
    goal_phases                   5
    nutrition_targets             5
    phase_transition_responses    0
    progress_photos               0   (C-463, neu)

`[read]` **Zwei sind leer** ? **`progress_photos` ist heute
gebaut worden, die Modale schreiben noch nicht hinein.**

## Die Vorlage

`[cmd]` **`docs/spezifikation/10-plattform/design-system/coach-portal-draft/`:**

    module-goals.jsx         50,7 KB
    module-goals-pro.jsx     52,5
    module-goals-editor.jsx  35,7

`[read]` **`-pro` ist groesser als die Grundfassung** ? **miss,
was darin steht und ob es die Vorlage ist.**

## Was zu tun ist

**1** ? **Messen, welche der vier wirklich fehlen.**

`[read]` **Am SCHIRM, nicht im Werkzeug** ? **welche Reiter zeigt
Goals & Body heute, und was steht darin?**

**2** ? **Je fehlendem Reiter: die Kacheln der Vorlage.**

`[read]` **Dieselbe Regel wie im Coach-Portal:** **kopieren, nicht
erfinden.**

`[read]` **Wo Daten da sind: anbinden.** `[read]` **Wo nicht: die
Form mit den Zahlen der Vorlage, plus Vermerk mit dem Namen der
fehlenden Tabelle.**

**3** ? **`LogPhotoModal` schreibt jetzt irgendwohin.**

`[cmd]` **C-463 hat `goals.progress_photos` und den Bucket
`goals-progress-photos` gebaut** ? **privat, vier
Owner-Policies.**

`[cmd]` **13 Spalten:** `session_date`, `pose_type`, `pose_name`,
`pose_number`, `photo_url`, `thumbnail_url`, `notes`,
`is_private`.

`[read]` **Miss, ob das Modal heute schon dorthin zeigt** ? **oder
ob es noch ins Leere schreibt.**

## Abnahmebedingungen

    A1  welche der vier fehlen WIRKLICH? Am Schirm
        gemessen, mit Bildschirmfoto je Reiter.
    A2  je fehlendem: die Kacheln der Vorlage. Felder der
        Vorlage / gebaut / fehlend, als TABELLE.
    A3  was Daten hat, ist angebunden. Zahl: Felder /
        mit Daten / Attrappe.
    A4  LogPhotoModal: schreibt es in progress_photos?
        Gemessen. Wenn nein: angebunden.
    A5  Bildschirmfoto je Reiter, DUNKEL.
    A6  was du NICHT bauen konntest und warum.
    A7  apps/web 1575 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-460.**
**Die Mockup-Referenz BLEIBT** ? **Tom nimmt sie ab.**
**Keine Zahl erfinden** ? **die Vorlage nennt sie.**
Nicht committen, nicht stagen, nicht pushen.

## Und eine Warnung aus heute

`[cmd]` **G-420: Kettenlaeufe setzen Testdaten zurueck.**

`[cmd]` **`dev@lumeos.app` stand heute morgen auf `vegan`, jetzt
auf `omnivore`** ? **ein Kettenlauf hat es geaendert.**

`[read]` **Wer eine Zahl misst, die aus einem Seed stammt, sollte
es benennen.**

## Der Dev-Server

`[cmd]` **3200 laeuft** (PID 1332072), **3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — KEINER der vier Reiter fehlt. Alle zehn rendern.

`[cmd]` **Am Schirm gemessen, `dev@lumeos.app`, dunkel**
(`tools/_g421-reiter.mjs`, Bilder `docs/bilder/g421/ist-*.png`):

    goals      16 Kacheln      metrics    13
    phase      17              measure     8
    tdee       13              comp        9
    cross      11              physique   12
    timeline    3              poses       7

`[read]` **Jeder Reiter traegt echte Kacheln ueber der
Mockup-Linie.** `[cmd]` **Das Werkzeug hat NAMEN gemessen, nicht
Verhalten** — und die Namen sind deutsch.

**Die sechs „fehlenden" Posten, je einzeln am Code belegt:**

    Vorlage         gebaut               Datei / Zeile
    ---------------------------------------------------------
    GoalsTab        ZielKarten           ziel-karten.tsx:186
    GoalCard        ZielKarte            ziel-karten.tsx:77
    MetricsTab      KoerperMetriken      tab-koerper.tsx:90
    MeasureTab      KoerperUmfaenge      tab-koerper.tsx:167
    CompTab         CompositionTab       tab-composition.tsx:169
    BodyFatScale    KoerperfettSkala     tab-composition.tsx:91

`[cmd]` **Alle sechs sind in `ansicht.tsx` eingehaengt** (Zeilen
237, 251, 260, 267) — **nicht toter Quelltext.**

`[cmd]` **`CompositionTab` traegt vier Kacheltitel WOERTLICH wie
die Vorlage:** `Body composition calculators`, `Body fat estimate ·
visual`, `Energy balance · today`, `Profile · inputs`.

**Die Zuordnungstabelle ist nachgetragen** —
`tools/vollstaendigkeit.mjs` hatte fuer `goals` keinen
`UMBENANNT`-Block, deshalb die Meldung.

    vorher   59 von 65 vorhanden.  Insgesamt fehlen 6 Posten.
    nachher  65 von 65 vorhanden.  Alles vorhanden.

`[read]` **Je Eintrag steht, welche Datei, welche Zeile und was die
Komponente TUT** — keine Namensaehnlichkeit.

### A2 — die Vorlage gegen das Gebaute

`[cmd]` **Der Pfad im Auftrag existiert nicht.**
`coach-portal-draft/` traegt nur Coach-Module. **Die Goals-Vorlage
liegt in `theme-v1/`** — und das ist auch die Quelle, die die
Mockup-Referenz selbst nennt (`mockup-referenz.tsx:57`).

`[cmd]` **`-pro` ist nicht die groessere Fassung derselben Sache,
sondern eine ANDERE:**

    module-goals.jsx      GoalsTab · TimelineTab · MetricsTab ·
                          MeasureTab · CompTab
    module-goals-pro.jsx  TDEE evolution · Phase state machine ·
                          FFMI · AI analysis · Weekly report …

`[read]` **Kein Titel kommt in beiden vor** — die Grundfassung
traegt die vier Reiter dieses Auftrags, `-pro` die fortgeschrittenen.

**Je Reiter: Vorlage / gebaut / fehlend**

    GoalsTab (3 Kacheln der Vorlage)
      This week              -> Attrappe, Grund: Wochendifferenz je Ziel
      Recently closed        -> GEBAUT („Abgeschlossene Ziele")
      Cross-module health    -> Attrappe, Grund: keine modul-
                                uebergreifende Sicht (E-52)
      zusaetzlich gebaut:    Meilensteine · Fortschritt · Herkunft

    MetricsTab (3)
      Weight · 6 months      -> GEBAUT („Messreihe")
      Body fat trend         -> **NEU ANGEBUNDEN**
      Lean mass · 30 days    -> **NEU ANGEBUNDEN**

    MeasureTab (3)
      Circumferences         -> GEBAUT
      Symmetry · left/right  -> GEBAUT („Seitenvergleich")
      Photo progression      -> **NEU ANGEBUNDEN** (siehe A4)

    CompTab (4)
      alle vier              -> GEBAUT, Titel woertlich

`[cmd]` **13 von 13 Kacheln der Grundvorlage stehen.** `[read]`
**Die zwei offenen liegen im `goals`-Reiter** — Gruende unten.

### A3 — was Daten hat, ist angebunden

    Tabelle                       Zeilen   angebunden
    -----------------------------------------------------
    body_measurements               362    ja (metrics)
    body_circumferences              54    ja (measure, physique)
    user_goals                       11    ja (goals)
    goal_milestones                  13    ja (goals)
    goal_phases                       5    ja (phase, lesend)
    nutrition_targets                 5    ja (comp)
    progress_photos                   0    **ja, NEU** (measure)
    phase_transition_responses        0    nein — kein Aufrufer

`[read]` **Sieben von acht Tabellen sind angebunden.**

### A4 — das LogPhotoModal schrieb ins Leere. Jetzt nicht mehr.

**VORHER, gemessen:** der Knopf war ein `InEntwicklungKnopf` mit
dem Vermerk:

> *„Fotosessions brauchen eine Dateiablage — der Umsetzungsplan
> fuehrt sie unter ,Was nicht gebaut wird'."*

`[cmd]` **C-463 hatte beides laengst gebaut** (gemessen
2026-09-11): `goals.progress_photos`, 13 Spalten; Bucket
`goals-progress-photos`, `public = f`, vier Owner-Policies.

`[read]` **Der Vermerk war eine Falschaussage — und eine
selbsterhaltende:** er nannte einen Grund, der niemanden mehr
nachsehen liess. **Dieselbe Klasse wie G-413.**

**UND EIN ZWEITER BEFUND:** `[cmd]` **das Modal war
UNERREICHBAR.** Nichts im Haus schickte `{ typ: 'logPhoto' }` —
gemessen per Suche ueber `apps/web`. **Die Vorlage hat den Knopf**
(`module-goals.jsx:516`, „New session" in `Photo progression`);
**die Attrappe hatte ihn nicht mitkopiert.**

**GEBAUT:**

    lib/goals/fotosession-write.ts   Schreibweg + Pruefung
    v2/goals/fotosession-aktionen.ts Serveraktion (FormData)
    lib/goals/lesen.ts               ladeFotosessions() + Signatur
    fehlende-kacheln.tsx             Kachel angebunden + Ausloeser

**GEMESSEN, mit einer Klickprobe auf `test-user@lumeos.local`:**

    vorher   progress_photos  0 Zeilen
    Klick    Front-Bild gewaehlt, „Save session"
    nachher  1 Zeile:  quarter_turns · Front · Pose 1 · is_private t
             1 Datei:  <user>/2026-09-11/1-<zeit>.png   70 Bytes
    Kachel   „1 session", ein Bild, Adresse mit `token=`

`[read]` **Beide Enden geprueft** — eine Zeile ohne Datei waere ein
toter Verweis, eine Datei ohne Zeile waere Ballast.

`[cmd]` **`pose_type = 'quarter_turns'`, aus dem CHECK geholt**
(`mandatory_8 | quarter_turns | detail | custom`). `[read]`
**Front · Side · Back sind Vierteldrehungen** — `mandatory_8` sind
die acht Pflichtposen des IFBB, und drei davon sind keine acht.

`[cmd]` **Der Bucket ist privat** — `photo_url` traegt den PFAD,
die Anzeige holt eine signierte Adresse (`createSignedUrls`, EIN
Aufruf fuer alle Pfade, eine Stunde gueltig).

**Bild:** `docs/bilder/g421/soll-measure.png`

### Vier Vermerke waren ueberholt

`[cmd]` **1 — „`goal_phases` wird gelesen, aber nirgends
geschrieben (G-357)".** **Gemessen gegen `pg_proc`:** die
Schreibfunktionen GIBT es —

    goals.goal_phase_start(p_phase_type, …)      -> uuid
    goals.goal_phase_end(p_phase_id, p_reason, …) -> uuid
    goals.phase_transition_respond(…)             -> text

`[cmd]` **Aus `_pipeline/11_goals/111_goals_ziele_phasen.sql`, mit
eigener Pruefung** (`goals-g357-…test.ts`). `[read]` **Der Vermerk
nannte den Punkt, der den Mangel BEHOBEN hat.** `[cmd]` **Der
Vermerk ist berichtigt:** was fehlt, ist der AUFRUF — kein
`apps/web`-Pfad ruft eine der drei.

`[cmd]` **2 — „weder Tabelle noch Ablage im Repo, `lesen.ts` kennt
kein Foto".** Entfallen, siehe A4.

`[cmd]` **3 und 4 — „wartet auf eine Verlaufsfunktion —
`body_composition_navy` liefert einen Wert je Stichtag, keine
Reihe"** und **„`lean_mass_kg` liegt im Leseweg — aber nur fuer den
Stichtag, nicht als Reihe"**.

**Gemessen 2026-09-11:**

    goals.body_measurements   362 Zeilen
      mit body_fat_pct        362
      mit lean_mass_kg        362

`[read]` **Beide sind SPALTEN, nicht Funktionsergebnisse** — und
`ladeMessungen()` gibt die ganze Reihe zurueck. `[cmd]`
**`KoerperMetriken` zeigte sie bereits als Kennzahlkachel mit
Sparkline; die Verlaufskacheln daneben rechneten mit
Entwurfszahlen.**

`[read]` **Der Leseweg lag daneben** — dieselbe Klasse wie die neun
Faelle aus G-355. `[cmd]` **`body_composition_navy` ist etwas
anderes:** das Umfangsverfahren fuer den `comp`-Reiter.

**Am Schirm, `dev@lumeos.app`:**

    Body fat trend   115 Messungen   15,4 %   Delta -0,3
    Lean mass        115 Messungen   71,6 kg  Delta +1,1

`[read]` **115, nicht 362** — die 362 sind alle Konten zusammen.

**Die uebrigen vier Gruende HALTEN, einzeln nachgemessen:**

    Jahresplan        max. 2 Phasen je Nutzer, keine Zwoelfmonatsfolge
    Wochendifferenz   nur `next_day_score_delta`, keine je Ziel
    Cross-Modul       keine gemeinsame Sicht in `information_schema.views`
    FFMI-Baender      „Developing"/„Elite" haben im Repo keine Quelle

### A5 — Bildschirmfotos

`[cmd]` **Zwanzig Bilder, alle DUNKEL** (`colorScheme: 'dark'`):
je Reiter eines vorher (`ist-*.png`) und eines nachher
(`soll-*.png`), plus `foto-modal.png`.

### A6 — was ich NICHT gebaut habe, und warum

**1 — Der Phasenwechsel.** `[cmd]` **Die drei
Datenbankfunktionen sind da, der Aufrufer fehlt.** `[read]` **Das
ist eine eigene Kachel mit Zustandsmaschine und sieben Phasen** —
ein Auftrag, kein Nebenbei. **Gemeldet, nicht gebaut.**

**2 — Gewicht und Koerperfett je Fotosession.** `[cmd]` **Die
Vorlage zeigt sie** (`module-goals.jsx:516-530`), **`progress_photos`
hat keine Spalte dafuer.** `[read]` **Sie liegen in
`body_measurements`, und eine Zuordnung ueber das Datum waere eine
Behauptung.** `[cmd]` **Statt zwei Felder anzubieten, die nichts
tun: ein Satz in der Kachel, der sagt wo sie stehen.**

**3 — `This week` und `Cross-module health`.** Gruende oben,
unveraendert.

**4 — Die Ziellinie bei 12 % im Koerperfettverlauf.** `[cmd]`
**Die Vorlage zeigt sie.** `[read]` **`goals.user_goals` traegt ein
Koerperfettziel nur als Zielwert EINES Ziels** — welches gemeint
ist, sagt niemand. **Eine feste 12 waere eine Aussage ueber den
Nutzer, die keiner getroffen hat.**

**5 — Der Titelzusatz „· 30 days".** `[read]` **Die Kachel zeigt,
was `ladeMessungen()` liefert** — die ganze Reihe bis zum Stichtag.
**Ein Titel mit einer Fensterzahl, die niemand einhaelt, waere eine
Falschaussage.**

### A7 — die Proben

    apps/web   1587 / 1587 gruen   (1575 gefordert)
    tsc        EXIT 0

**NEUN GEGENPROBEN, ALLE ROT** (`tools/_g421-sabotage.mjs`) —
jede prueft zuerst, ob die Sabotage ankommt:

    der alte Zustand: Modal schreibt wieder ins Leere  -> ROT
    die Nullzeilenpruefung faellt weg                  -> ROT
    eine fuenfte Posenart wird erfunden                -> ROT
    die Session ohne Foto geht durch                   -> ROT
    der Bucketname verrutscht                          -> ROT
    der Ausloeser des Modals faellt weg                -> ROT
    die Metrik-Kacheln rechnen mit Entwurfszahlen      -> ROT
    die erfundene Ziellinie bei 12 % kommt zurueck     -> ROT
    die Signatur weicht einer oeffentlichen Adresse    -> ROT

`[cmd]` **Nach dem Zuruecksetzen wieder gruen.**

**Ein Waechter wurde nachgezogen:** `[cmd]` **die Attrappenzahl in
`fehlende-kacheln.tsx` von 10 auf 7** — drei Kacheln tragen
keine Marke mehr, **weil sie lesen**, nicht weil jemand sie fuer
fertig haelt. **Der Waechter sagt das selbst:** *„Wer eine weitere
Kachel anbindet, entfernt `attrappe` und senkt die Erwartung
hier."*

## Was NICHT geaendert wurde

**1 — `supabase/`.** `[cmd]` **Nichts angefasst.** `[read]`
**Hinweis:** `_pipeline/kette.json`, `schema-sollstand.json` und
`_validierung/coach-c460-specialties.test.ts` tragen Aenderungen im
Arbeitsbaum — **die sind von Codex (C-460).**

**2 — Die Mockup-Referenz.** `[cmd]` **Unberuehrt**, wie
beauftragt — Tom nimmt sie ab.

**3 — Nicht committet, nicht gestaged.**

## Drei Hinweise

**1 — Eine Testdatei liegt im Bucket.** `[cmd]` **Die Klickprobe
hat 70 Bytes geschrieben.** `[read]` **Die Tabellenzeile habe ich
entfernt, die Datei NICHT** — `storage.objects` hat einen Trigger
gegen direktes Loeschen (*„Use the Storage API instead"*), und der
Weg ueber die API braucht den Dienstschluessel aus `.env`, **den
eine Wache zu Recht sperrt.**

    Pfad: 61e9f10a-…/2026-09-11/1-1789113226210.png

**2 — `messungAnlegenAktion` hat keinen Aufrufer.** `[cmd]`
**Gemessen:** `koerpermass-aktionen.ts` (G-122) exportiert zwei
Serveraktionen, **und nichts in `apps/web` ruft sie.** `[read]`
**Der Schreibweg fuer Koerpermessungen ist gebaut und
unerreichbar** — dieselbe Lage wie beim Fotomodal vor diesem
Auftrag. **Nicht in diesem Auftrag behoben.**

**3 — Die Seed-Warnung trifft zu.** `[cmd]` **Die Zahlen dieses
Berichts stammen aus Seeds** (362 Messungen, 54 Umfaenge, 11 Ziele)
— **ein Kettenlauf kann sie aendern.** `[cmd]` **Die
Klickprobe lief auf `test-user@lumeos.local`**, nicht auf `dev`.

## Neustart

`[cmd]` **NICHT noetig** — nur `apps/web/src` und `tools/`.
`[cmd]` **Die Messungen liefen auf dem laufenden 3200er.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  KEINER der vier fehlt -- alle sechs sind
        Umbenennungen, je am Code belegt
    A2  vier Vermerke waren ueberholt
    A3  drei Kacheln angebunden, mit Klickprobe
    A4  LogPhotoModal schreibt nach progress_photos
    A7  1587/1587

`[cmd]` **Selbst gemessen, alle fuenf:**

    CompositionTab     tab-composition.tsx:169
    KoerperfettSkala   tab-composition.tsx:91
    KoerperMetriken    tab-koerper.tsx:90
    KoerperUmfaenge    tab-koerper.tsx:167
    ZielKarten         ziel-karten.tsx:186

`[cmd]` **`vollstaendigkeit.mjs goals`: 65 von 65.**

### Zum FUENFTEN Mal heute habe ich Namen geraten

    recovery_scores  -> scores
    lab_values       -> lab_result_values
    modality_logs    -> modality_log
    content          -> body
    CompTab          -> CompositionTab

`[read]` **Codex hat zwei aufgefangen, Claude Code drei.**

`[cmd]` **Und der Auftrag hat diesmal davor gewarnt** ? *,,Das
Werkzeug misst NAMEN."*

> *,,Dein Hinweis war goldrichtig."*

`[read]` **Die Warnung hat gewirkt** ? **er hat gemessen statt
gebaut.**

`[cmd]` **`vollstaendigkeit.mjs` hat eine UMBENANNT-Tabelle mit
Belegpflicht** ? **fuer `goals` fehlte der Block. Nachgetragen.**

### Vier Vermerke waren ueberholt

**1** ? **Das Fotomodal schrieb ins Leere** ? **aber nicht aus dem
genannten Grund.**

`[cmd]` **C-463 hatte Tabelle und Bucket laengst gebaut.**

**2** ? **Und es war UNERREICHBAR:**

> *,,Nichts schickte `{ typ: 'logPhoto' }`. Die Vorlage hat den
> Knopf, die Attrappe hatte ihn nicht mitkopiert."*

`[read]` **Ein Modal ohne Ausloeser** ? **das haette kein Test
gefunden.**

**3** ? **Zwei Metrik-Kacheln behaupteten, eine Verlaufsfunktion
fehle.**

`[cmd]` **`body_fat_pct` und `lean_mass_kg` sind Spalten, auf
allen 362 Zeilen gefuellt** ? **und `ladeMessungen()` gibt die
ganze Reihe.**

> *,,Der Leseweg lag daneben."*

**4** ? **Der Phasenwechsel-Vermerk nannte G-357 als Grund** ?
**ausgerechnet den Punkt, der die Schreibfunktionen GEBAUT hat.**

`[read]` **Berichtigt auf *,,der Aufrufer fehlt"*.**

### Drei Befunde fuer spaeter

`[cmd]` **Eine Testdatei liegt im Bucket (70 Byte)** ?
**`storage.objects` hat einen Trigger gegen direktes Loeschen,
der API-Weg braucht den Dienstschluessel.**

`[cmd]` **`messungAnlegenAktion` (G-122) hat keinen Aufrufer** ?
**dieselbe Lage wie das Fotomodal vorher.**

`[cmd]` **Und mein Vorlagenpfad war falsch:** `coach-portal-draft/`
**traegt nur Coach-Module, die Goals-Vorlage liegt in
`theme-v1/`.**

`[read]` **Und `-pro` ist NICHT die groessere Fassung derselben
Sache** ? **kein Kacheltitel kommt in beiden vor.**

**Abgenommen.**

