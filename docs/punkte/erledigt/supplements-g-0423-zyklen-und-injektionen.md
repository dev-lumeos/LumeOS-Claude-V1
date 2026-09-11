---
nr: G-423
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: E-79
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 6e3348bf
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-423 — Zyklen, Protokolle und die Injektionskarte

## Was gemessen ist

### Die Datenbank steht

`[cmd]` **C-456, heute abgenommen:**

    user_supplement_cycles                 0 Zeilen
    supplement_cycle_events                0
    supplement_protocols                   0
    supplement_protocol_items              0
    supplement_protocol_templates          3
    supplement_protocol_template_items     9
    intake_schedule                        0

`[cmd]` **Fuenf Schreibwege:**

    start_supplement_cycle
    set_supplement_cycle_status
    create_supplement_protocol_from_template
    refresh_intake_schedule
    supplement_nutrient_intake_for_day

`[cmd]` **C-455 und C-454, heute abgenommen:**

    medical.injection_sites                 16 Zeilen
      (zehn neue Spalten: max_volume_ml, rest_days,
       body_view, x_pct, y_pct, needle_gauge,
       needle_length_in, landmark_note, difficulty,
       is_active)
    medical.injection_logs                   0
      (sieben neue Spalten: substance_id, dose_amount,
       dose_unit, needle_gauge, needle_length_in,
       notes, stack_item_id)
    medical.injection_site_overrides         0
    medical.user_injection_site_selections   0
      (user_id, substance_id, route, body_area_code,
       needle_gauge, needle_length_in)

`[cmd]` **Drei Funktionen:**

    validate_injection_site_selection
    suggest_configured_injection_area
    injection_needle_suggestions

### E-79 gilt

`[cmd]` **`docs/entscheidungen/E-79-die-muskelkarte-ist-die-auswahl.md`:**

> die Muskelkarte ist die Auswahl, die 16 Orte sind Fachwissen

`[cmd]` **`packages/ui/src/koerperkarte-pfade.ts` fuehrt 21
Flaechen**, `side` **ist gepflegt.**

Tom, 2026-09-08:

> der user waehlt: peptide oder enhanced, wieviel, nadel,
> moegliche injektionspunkte ? und wir verwalten es.
> rotationsplaene gemaess KONFIGURIERTEN injektionspunkten.
> wenn er triceps waehlt weil er lokal ein tendonproblem hat,
> dann zeigen wir den triceps und keinen rotationsvorschlag,
> weil nur triceps vorhanden ist.

### Was in `apps/web/v2/supplements` steht

`[cmd]` **21 Dateien:**

    tabs.tsx                58,6 KB
    substanz-tafel.tsx      44,4
    modale.tsx              39,9
    tab-injektionen.tsx     31,8
    mockup-referenz.tsx     30,5
    tab-spec.tsx            29,4
    substanz-abschnitte     25,3
    tab-extended.tsx        23,8
    substanz-detail.tsx     23,4
    tab-inventory-echt      21,9
    ansicht.tsx             21,6
    fehlende-kacheln.tsx    18,7
    tab-compliance.tsx      13,6
    tab-interactions-echt   12,0
    stack-bearbeiten.tsx    10,2
    injektion-modal.tsx      9,4
    extended-gate.tsx        5,8
    tab-bilanz.tsx           5,1

`[cmd]` **`tools/vollstaendigkeit.mjs supplements`: 65 von 67.**

    FEHLT  SuppExtended      8 Unterkomp., 4 Kacheln
    FEHLT  SuppInteractions

`[read]` **Das Werkzeug misst NAMEN** ? **`tab-extended.tsx`
(23,8 KB) und `tab-interactions-echt.tsx` (12,0 KB) gibt es.**

`[read]` **Miss selbst, ob etwas fehlt.**

### Die Vorlage

`[cmd]` **`docs/spezifikation/10-plattform/design-system/theme-v1/`**
? **NICHT `coach-portal-draft/`, das traegt nur Coach-Module.**

## Der Auftrag

**1** ? **Die Zyklen und Protokolle sichtbar machen.**

`[read]` **Die Tabellen sind leer, die Schreibwege stehen.**

`[read]` **Was die Vorlage an dieser Stelle zeigt, wird
gebaut** ? **und wo ein Schreibweg da ist, wird er gerufen.**

`[cmd]` **Drei PCT-Vorlagen liegen bereit
(`supplement_protocol_templates`).**

**2** ? **Die Injektionskarte auf E-79 umstellen.**

`[cmd]` **G-396 hat die Karte gegen den ALTEN Stand gebaut** ?
**vor `user_injection_site_selections`.**

`[read]` **Die Rotation laeuft ueber die KONFIGURIERTEN
Flaechen** ? `suggest_configured_injection_area` **gibt sie.**

`[read]` **Eine gewaehlte Flaeche: kein Vorschlag.**

**3** ? **Die Nutzerkonfiguration.**

`[read]` **Ein Nutzer muss waehlen koennen, wo er eine Substanz
spritzt** ? **heute gibt es dafuer keine Oberflaeche.**

`[cmd]` **`validate_injection_site_selection` prueft die
Auswahl.**

## Abnahmebedingungen

    A1  was in supplements heute steht und was die Vorlage
        zeigt: je Reiter gemessen. TABELLE.
    A2  SuppExtended und SuppInteractions: fehlen sie
        wirklich, oder sind es Umbenennungen? Belegt.
    A3  Zyklen: ein Zyklus gestartet, pausiert, beendet.
        Am Schirm, mit Bildschirmfoto.
    A4  ein Protokoll aus einer Vorlage angelegt.
    A5  die Injektionskarte zeigt die konfigurierten
        Flaechen. Eine Flaeche gewaehlt -> kein Vorschlag.
        Zwei Fotos.
    A6  die Nutzerkonfiguration: eine Substanz, eine
        Flaeche, eine Nadel. Geschrieben und gelesen.
    A7  was du NICHT bauen konntest und warum.
    A8  apps/web 1587 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-460.**
**Die Mockup-Referenz BLEIBT** ? **Tom nimmt sie ab.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 laeuft** (PID 1332072), **3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A2 — beide sind Umbenennungen. 65 -> 67 von 67.

`[cmd]` **Am Code belegt, nicht geraten:**

    Vorlage            gebaut                Datei / Zeile
    ---------------------------------------------------------------
    SuppInteractions   InteractionsEchtTab   tab-interactions-echt.tsx:45
    ExtendedGate       ExtendedGesperrt      extended-gate.tsx:39

`[cmd]` **Beide sind eingehaengt** — `ansicht.tsx:410` und `:372`.

`[cmd]` **`SuppExtended` heisst sogar GENAU so** (tab-extended.tsx:41)
— **das Werkzeug meldete den Reiter wegen seines fehlenden
Unterbauteils `ExtendedGate` als FEHLT.** `[read]` **Zwei
verschiedene Faelle unter einer Ueberschrift.**

`[cmd]` **Ein Unterschied, und er ist der Rede wert:** die Vorlage
zaehlt die Konstante `INTERACTIONS`, die Umsetzung wertet das
Regelwerk aus (`zustand: fulfilled | missing_input`). **Mehr, nicht
weniger.**

**Die Zuordnungstabelle ist nachgetragen:**

    vorher   65 von 67.  FEHLT SuppExtended, FEHLT SuppInteractions
    nachher  67 von 67.  Alles vorhanden.

### A1 — was die elf Reiter heute zeigen

`[cmd]` **Am Schirm gemessen, dunkel** (`tools/_g423-reiter.mjs`,
Bilder `docs/bilder/g423/`):

    Reiter         echt  Attrappe    darunter neu
    ------------------------------------------------------
    today             7        11
    stack             2         1
    extended          4        12    Zyklen · Protokolle
    catalog           2         1
    stacks            8         1
    intel             5         8
    inventory         6         5
    injection         3        11    Injektionspunkte
    compliance        4         3
    interactions      9         2
    cost              1        17

`[read]` **Die Attrappen sind die Mockup-Referenz unter der Linie** —
sie bleibt, wie beauftragt.

### A3 — Zyklus gestartet, pausiert, beendet

`[cmd]` **Am Schirm, auf `test-user@lumeos.local`**
(`tools/_g423-zyklus.mjs`):

    0 vorher      0 · supplements.user_supplement_cycles
    1 gestartet   1 ·  läuft
    2 pausiert    1 ·  pausiert
    3 beendet     1 ·  beendet

**Bilder:** `zyklus-1-gestartet.png`, `zyklus-2-pausiert.png`,
`zyklus-3-beendet.png`

`[cmd]` **Und in der Datenbank nachgezaehlt:** vier Zeilen in
`supplement_cycle_events` — je Uebergang eine.

`[cmd]` **Die drei Zustaende stammen aus dem CHECK**
(`active | paused | stopped`), nicht aus dem Kopf.

### A4 — Protokoll aus einer Vorlage

`[cmd]` **Am Schirm:**

    Protokolle 1 · 3 Vorlagen bereit
      HCG + Nolva              (3 Posten)
      Nolvadex Only (6 Wo)     (2 Posten)
      Standard Nolva/Clomid    (4 Posten)

`[cmd]` **`standard_nolva_clomid` angelegt** — 1 Protokoll, **4
Posten** mit echtem Dosierungsplan:

    40 mg  Wochen 1-2     Clomiphene Citrate (Clomid)
    20 mg  Wochen 3-4     Clomiphene Citrate
    50 mg  Wochen 1-2     Tamoxifen Citrate (Nolvadex)
    25 mg  Wochen 3-4     Tamoxifen Citrate

**Bild:** `protokoll-angelegt.png`

`[read]` **Die Namen stehen in `name_en`, nicht `name_de`** — der
Leseweg faellt darauf zurueck, sonst stuenden vier leere Zeilen da.

### A5 — E-79 am Schirm belegt, in BEIDE Richtungen

**Tom:** *„wenn er triceps waehlt weil er lokal ein tendonproblem
hat, dann zeigen wir den triceps und keinen rotationsvorschlag."*

`[cmd]` **Gemessen** (`tools/_g423-e79.mjs`):

    0 Flaechen   —
    1 Flaeche    triceps          -> KEIN Vorschlag, Satz steht da
    2 Flaechen   triceps + abs    -> Vorschlag: abs

**Bilder:** `e79-eine-flaeche.png`, `e79-zwei-flaechen.png`

`[cmd]` **Die Regel steht in der DATENBANK, nicht in der
Oberflaeche:** `suggest_configured_injection_area` traegt

    WHERE (SELECT count(*) FROM selected) > 1

`[read]` **Der Leseweg baut sie NICHT nach** — zwei Orte fuer eine
Regel heissen zwei Regeln. **Ein Waechter verbietet genau das.**

### A6 — die Nutzerkonfiguration: geschrieben und gelesen

`[cmd]` **Substanz, Weg, Flaeche, Nadelstaerke, Nadellaenge** — am
Schirm eingegeben, in `medical.user_injection_site_selections`
geschrieben, von der Kachel wieder angezeigt:

    2eb5dc6a-… | injection_subq | triceps | 29G | 0.5
    2eb5dc6a-… | injection_subq | abs     | 29G | 0.5

`[cmd]` **Die Auswahllisten kommen aus den CHECKs:** 21 Flaechen,
zwei Wege. `[read]` **Und die Substanzliste zeigt nur, was der
Katalog als injizierbar belegt** — der Trigger weist alles andere ab,
und ein Knopf, der garantiert scheitert, ist eine Falle.

**Ein Befund zur Auftragspraemisse:** `[cmd]`
**`validate_injection_site_selection` ist ein TRIGGER, keine
aufrufbare Funktion** — gemessen: `-> trigger`, und `pg_trigger`
zeigt `BEFORE INSERT OR UPDATE OF substance_id, route`.

`[read]` **Der Auftrag nannte sie als Pruefung, die man ruft.** `[read]`
**Sie prueft von selbst** — der Schreibweg fuegt ein und laesst die
Datenbank ablehnen. **Kein zweiter Pruefweg daneben**, er koennte
auseinanderlaufen.

### EIN FEHLER, DEN ICH SELBST GEBAUT UND GEMESSEN HABE

`[cmd]` **Nach dem Einhaengen: HTTP 500 auf JEDER Seite**, auch auf
`/login`. **`tsc` war gruen.**

    You're importing a component that needs next/headers.
    Import trace:
      packages/shared/src/supabase/session.ts
      -> lib/medical/injektion-konfig-write.ts
      -> app/v2/supplements/zyklus-karten.tsx   ('use client')

`[read]` **Die Kachel holte eine KONSTANTE aus dem Schreibmodul** —
und zog damit den Server-Baum in den Browser. **Genau die Lehre aus
G-412, die ich im selben Auftrag in einem Kommentar zitiert habe.**

`[cmd]` **Behoben:** die Konstanten stehen jetzt in
`lib/medical/koerperflaechen.ts`, einer Datei ohne Serverimporte —
dasselbe Muster, das `injektion-karte.ts` schon benutzt.

`[cmd]` **Belegt: `/login` und `/v2/supplements` liefern wieder
HTTP 200.**

`[read]` **Der Unterschied zu G-412 ist der Schaden:** dort fiel eine
Kachel aus, hier die ganze Anwendung. **Ein Typcheck haette es nie
gefunden.**

### UND EIN ZWEITER, den die Gegenprobe gefangen hat

`[cmd]` **Erster Lauf von A5: eine Flaeche -> kein Vorschlag
(richtig), ZWEI Flaechen -> auch keiner (falsch).**

`[cmd]` **In der Datenbank gegengeprueft: dort kam der Vorschlag.**
`[read]` **Also lag es an meinem Leseweg** — `page.tsx` ruft
`ladeKonfiguration()` ohne Argumente, und ohne Substanz wurde die
Funktion nie gefragt.

`[cmd]` **Behoben:** ohne Angabe nimmt der Leseweg die erste
konfigurierte Substanz. `[read]` **Sie ist die einzige, zu der es
ueberhaupt etwas vorzuschlagen gibt.**

`[read]` **Ohne die Gegenprobe am Schirm waere das durchgegangen** —
die Kachel sah in beiden Faellen plausibel aus.

### A8 — die Proben

    apps/web   1600 / 1600 gruen   (1587 gefordert)
    tsc        EXIT 0

**NEUN GEGENPROBEN, ALLE ROT** (`tools/_g423-sabotage.mjs`):

    der alte Zustand: Karten nicht eingehaengt     -> ROT
    ein vierter Zyklusstand wird erfunden          -> ROT
    ein dritter Injektionsweg wird erfunden        -> ROT
    eine Flaeche faellt aus der Auswahlliste       -> ROT
    die Nullzeilenpruefung faellt weg              -> ROT
    die Eingabe ohne Flaeche geht durch            -> ROT
    die Rotationsregel wird im Leseweg nachgebaut  -> ROT
    der Leersatz nennt die Bedingung nicht mehr    -> ROT
    der Schreibweg ruft die Funktion nicht mehr    -> ROT

`[cmd]` **Nach dem Zuruecksetzen wieder gruen.**

**DREI PROBEN WAREN ZWISCHENZEITLICH BLIND** — nach dem Verschieben
der Konstanten fanden sie ihre Stelle nicht mehr. `[read]` **Die
Probe hat das GEMELDET** (*„ANGEKOMMEN? NEIN"*) **statt gruen zu
sein** — genau dafuer steht die Pruefung darin. **Nachgezogen, dann
9 von 9.**

### A7 — was ich NICHT gebaut habe, und warum

**1 — Die Injektionskarte zeichnet die konfigurierten Flaechen
NICHT ein.** `[cmd]` **Die Kachel listet sie und nennt den
Vorschlag**, aber `tab-injektionen.tsx` rechnet weiter aus
`INJ_ORTE`-Konstanten. `[read]` **Das ist ein eigener Umbau:** die
Karte kennt 16 anatomische Orte mit Seitigkeit, die Konfiguration
21 Koerperflaechen ohne. **Eine Zuordnung zwischen beiden waere eine
Behauptung, kein Leseweg** — und E-79 sagt nicht, wie sie aussieht.

**2 — `latissimus` laesst sich waehlen und nicht zeichnen.**
`[cmd]` **Gemessen:** der CHECK erlaubt 21 Flaechen,
`koerperkarte-pfade.ts` zeichnet 21 — **aber es sind nicht
dieselben:**

    in beiden             20
    nur im CHECK          latissimus
    nur in der Karte      hair

`[read]` **`hair` ist keine Injektionsflaeche** — richtig so.
`[read]` **`latissimus` ist die Luecke.** `[cmd]` **Gemeldet, nicht
geflickt:** `packages/ui` gehoert allen Apps, und ein SVG-Pfad ist
eine Zeichnung, keine Vermutung.

**3 — `refresh_intake_schedule` und
`supplement_nutrient_intake_for_day`.** `[read]` **Zwei der fuenf
Schreibwege aus C-456 habe ich nicht angebunden** — sie fuellen
`intake_schedule`, und der Auftrag nennt weder eine Kachel dafuer
noch die Vorlage eine. **Gemeldet statt nebenbei gebaut.**

**4 — `injection_needle_suggestions`.** `[cmd]` **Die Funktion gibt
belegte Nadelempfehlungen je Ort und Weg** (mit Quellenangabe und
Koerpermassbezug). `[read]` **Die Konfiguration nimmt die Nadel heute
als freie Eingabe** — ein Vorschlagsfeld daneben waere gut, steht
aber nicht im Auftrag.

## Was NICHT geaendert wurde

**1 — `supabase/`.** `[cmd]` **Nichts angefasst.** `[read]`
**Hinweis:** `_pipeline/kette.json`, `schema-sollstand.json` und
`_validierung/nutrition-c466-…test.ts` tragen Aenderungen im
Arbeitsbaum — **die sind von Codex.**

**2 — Die Mockup-Referenz.** `[cmd]` **Unberuehrt**, wie beauftragt.

**3 — Nicht committet, nicht gestaged.**

## Zwei Hinweise

**1 — Der 3200er war zwischenzeitlich tot.** `[cmd]` **Beim ersten
Messversuch: `ERR_CONNECTION_REFUSED` auf 3200, 3220 offen.**
`[cmd]` **3220 ist der Coach** (`apps/coach/package.json:6`) — er
liefert auf `/v2/supplements` ein 404. `[read]` **Ich habe NICHT
gestartet**, wie beauftragt, sondern die datenbankseitigen Nachweise
vorgezogen; als 3200 wieder lief, kamen die Schirmmessungen nach.

**2 — Alle Testdaten sind entfernt.** `[cmd]` **Nachgezaehlt:**
Zyklen 0, Protokolle 0, Posten 0, Auswahlen 0. **Die drei Vorlagen
sind unberuehrt** (3).

## Neustart

`[cmd]` **NICHT noetig** — nur `apps/web/src` und `tools/`.
`[cmd]` **Die Messungen liefen auf dem laufenden 3200er.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A2  beide Umbenennungen, 67 von 67
    A3  Zyklus gestartet/pausiert/beendet, vier Ereignisse
    A4  Protokoll aus standard_nolva_clomid, 4 Posten
    A5  eine Flaeche -> kein Vorschlag, zwei -> Vorschlag
    A6  Substanz, Weg, Flaeche, Nadel geschrieben
    A8  1600/1600

`[cmd]` **Selbst gemessen:**

    InteractionsEchtTab  tab-interactions-echt.tsx:45
    ExtendedGesperrt     extended-gate.tsx:39
    SuppExtended         tab-extended.tsx:41

`[cmd]` **`e79-eine-flaeche.png` angesehen:** `triceps - ACE-031 -
SubQ`, **29G x 0,5"** ? **und der Satz:**

> *,,Kein Rotationsvorschlag ? dafuer braucht es mindestens zwei
> konfigurierte Flaechen fuer dieselbe Substanz und denselben
> Weg."*

### A2 — zwei verschiedene Faelle unter einer Ueberschrift

> *,,`SuppExtended` heisst sogar genau so ? das Werkzeug meldete
> den Reiter wegen seines fehlenden Unterbauteils als FEHLT."*

`[read]` **Ein Reiter faellt, weil ein Unterbauteil fehlt** ?
**und die Meldung sagt nicht, welches von beidem.**

### A5 — die Regel steht in der Datenbank

`[cmd]` **`WHERE count(*) > 1`** ? **und ein Waechter verbietet,
sie im Leseweg nachzubauen.**

`[read]` **Eine Regel an zwei Orten laeuft auseinander** ? **hier
gibt es nur einen.**

### Zwei eigene Fehler, beide gemessen

**1** ? **Die ganze App auf HTTP 500.**

> *,,Die `'use client'`-Kachel importierte eine KONSTANTE aus dem
> Schreibmodul und zog damit `next/headers` in den Browser.
> `/login` fiel mit aus. `tsc` war gruen."*

`[read]` **Die G-412-Lehre, die er im selben Auftrag zitiert
hatte** ? **sie gilt auch fuer Konstanten, nicht nur fuer
Funktionen.**

**2** ? **A5 war beim ersten Lauf halb falsch.**

> *,,Zwei Flaechen gaben keinen Vorschlag, obwohl die Datenbank
> einen lieferte ? `ladeKonfiguration()` wurde ohne Substanz
> gerufen. Ohne die Gegenprobe am Schirm waere das
> durchgegangen; die Kachel sah plausibel aus."*

`[read]` **Die Gegenprobe in BEIDE Richtungen hat es gefangen.**

### Drei Befunde, alle nachgemessen

**1** ? `[cmd]` **`validate_injection_site_selection` ist ein
TRIGGER** (`user_injection_site_selections_validate`), **keine
aufrufbare Funktion.**

`[read]` **Meine Auftragspraemisse war falsch** ? **er hat keinen
zweiten Pruefweg danebengestellt.**

**2** ? `[cmd]` **`latissimus` steht im CHECK, NICHT in der
Karte** ? **die Karte hat stattdessen `hair`.**

`[read]` **Waehlbar und nicht zeichenbar** ? **gemeldet, nicht
geflickt, weil `packages/ui` allen Apps gehoert.**

**3** ? **Der 3200er war zwischenzeitlich tot.**

> *,,Ich habe nicht gestartet, sondern die DB-Nachweise
> vorgezogen und die Schirmmessungen nachgeholt."*

`[read]` **Die Regel gehalten, ohne den Auftrag liegen zu
lassen.**

### Und was offen bleibt

> *,,Die Injektionskarte zeichnet die konfigurierten Flaechen noch
> nicht ein ? sie kennt 16 anatomische Orte mit Seitigkeit, die
> Konfiguration 21 Flaechen ohne. Eine Zuordnung waere eine
> Behauptung."*

`[read]` **Genau die Haltung, die ich verlange** ? **lieber eine
Luecke als eine erfundene Abbildung.**

**Abgenommen.**

