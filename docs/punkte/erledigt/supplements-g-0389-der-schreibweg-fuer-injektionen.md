---
nr: G-389
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-388
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 05425238
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-injektionen.tsx
zahlen:
  gemessen: 2026-09-08
  blockiert: 6
  baubar: 4
---

# G-389 — der Schreibweg fuer Injektionen

## Befund

Aus G-388, Claude Code, 2026-09-08.

`[cmd]` **Nachgemessen: alle vier Policies stehen.**

    injection_logs_select    injection_logs_insert
    injection_logs_update    injection_logs_delete

`[cmd]` **Und die Zeilen:**

    injection_sites                        4
    injection_needle_recommendations       8
    injection_tissue_condition_guidance    1
    injection_logs                         0
    injection_site_conditions              0

`[read]` **Die Erlaubnis liegt seit C-429 da, der Weg dazwischen
fehlt** ? **vierzehnter A-71-Fall.**

`[cmd]` **Und er gehoert nach `apps/`** ? **die zwei
`medical.injection_*`-Funktionen sind Leser
(`_body_measurement_context`, `_needle_suggestions`), keine
Schreiber.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Der Schreibweg

`[read]` **Eine Injektion erfassen: Ort, Zeitpunkt** ? **das sind
die sechs Spalten von `injection_logs`.**

`[cmd]` **`E-74` gilt auch hier** ? **miss, ob die Tabelle eine
Herkunft traegt oder braucht.**

`[read]` **Und die Rotation ist der Zweck:** `rotation_distance_mm`,
`rotation_quadrant_interval_days`, `minimum_rest_days` **werden erst
sinnvoll, wenn Zeilen da sind.**

### 2 · Die sechs blockierten Kacheln

`[read]` **Du hast sie gemessen** ? **bau sie, sobald der Weg
steht.**

`[read]` **Und melde je Kachel, was sie zeigt, wenn null Zeilen da
sind** ? **E-72: keine nackte Null.**

### 3 · Die vier sofort baubaren

`[read]` **Waren nicht beauftragt** ? **jetzt schon.**

`[cmd]` **`injection_needle_recommendations` hat 8 Zeilen,
`injection_tissue_condition_guidance` eine** ? **die tragen
Kacheln ohne neuen Schreibweg.**

### 4 · Was du NICHT bauen sollst

`[cmd]` **`injection_site_conditions` hat 0 Zeilen und keine
Kachel.**

`[read]` **Miss, was die Tabelle traegt, und melde, ob sie eine
Kachel braucht** ? **bau keine fuer eine leere Tabelle.**

`[read]` **Und die Ring-Option fuer SubQ in `packages/ui`:
nicht anfassen** ? **melden, wenn sie noetig wird.**

### Abnahmebedingungen

    A1  eine Injektion erfasst. Zahl: injection_logs
        vorher/nachher.
    A2  die Rotation rechnet. Zahl: Orte / davon ruhend,
        mit Begruendung je Ort.
    A3  die sechs Kacheln: gebaut, je mit Zahl.
    A4  die vier baubaren: gebaut, je mit Zahl.
    A5  E-72: Zahl: Kacheln / mit Daten / mit Leerhinweis /
        nackte Nullen.
    A6  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.
    A7  injection_site_conditions: braucht sie eine Kachel?
        Mit Grund.

### Was nicht zu tun ist

**Nichts in `supabase/`** ? **die Policies stehen schon, Codex
arbeitet an C-440.**
**Nichts in `packages/ui`.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  0 -> Klick -> 1 Zeile, vollstaendig
    A2  neun von neun Modalfeldern schreiben
    A3  ohne Konfiguration 23G x 1.25",
        mit Konfiguration 21G x 1.5"
    A4  halb -- die Karte rechnet, die Liste nicht
    A5  1613/1613, zehn Sabotagen rot

`[cmd]` **Vier neue Dateien:**

    lib/medical/injektion-write.ts
    lib/medical/injektion-vokabular.ts
    v2/supplements/injektion-aktionen.ts
    lib/medical/__tests__/g389-injektion-schreiben.test.ts

`[cmd]` **Testdaten entfernt: beide Tabellen auf 0.**

### Der Befund mit den zwei Vokabularen

`[cmd]` **Selbst nachgemessen:**

    injection_logs.route
      CHECK (route = ANY (ARRAY['im', 'sc']))

    user_injection_site_selections.route
      CHECK (route = ANY (ARRAY['injection_im', 'injection_subq']))

`[read]` **Zwei Namen fuer dieselbe Sache, in zwei Tabellen
desselben Schemas.**

> *,,Die Umrechnung steht an EINER Stelle und ist per
> Hin-und-Rueck-Probe bewacht."*

`[read]` **Er hat nicht eine Tabelle geaendert** ? **das waere
`supabase/` gewesen** ? **sondern die Uebersetzung gekapselt und
gesichert.**

### A3 — die Probe misst, weil die Werte verschieden sind

> *,,Die Werte waren absichtlich verschieden, sonst saehe man
> nicht, welcher gewinnt."*

`[cmd]` **23G x 1.25" gegen 21G x 1.5"** ? **und der konfigurierte
landet in der Tabelle.**

`[read]` **Eine Probe mit gleichen Werten haette nichts
gezeigt.**

### A4 ist ehrlich halb

`[cmd]` **`tab-injektionen.tsx:525` rendert `INJ_PROTOKOLL`,
waehrend `stand.protokoll` in Zeile 166 gelesen und nur fuer die
Flaechengruppen benutzt wird.**

> *,,Ich habe die Liste nicht umgestellt: sie fuehrt 16 Orte mit
> Seitigkeit, die Datenbank 21 Flaechen ohne ? dieselbe
> Zuordnungsluecke wie in G-423."*

`[read]` **Zum zweiten Mal dieselbe Luecke, zum zweiten Mal nicht
ueberbrueckt** ? **richtig.**

### Zwei Selbstkorrekturen

`[cmd]` **Ein Waechter fand seine eigene Begruendung im
Kommentar** ? ***,,die Konstanten liegen serverfrei"* stand als
Text da, nicht als Import.**

`[cmd]` **Und die erste Messung las das falsche Element** ? **die
Nadel kam aus dem Reiter HINTER dem Fenster.**

> *,,Jetzt sucht die Probe in `[role=dialog]`."*

`[read]` **Beide Male haette eine gruene Probe nichts
gemessen.**

**Abgenommen.**


## Auftrag 2 — 2026-09-08, neu gefasst

Tom, am Schirm: *,,diese grafik soll den rotationsmodus zeigen und
zustand der injektionsstellen und welches der naechste ist ? und
daneben und darum sind die anderen informationen, das gehoert alles
zusammen."*

`[read]` **Der erste Auftrag hat den Reiter in Kacheln zerlegt.**
**Er ist eines.**

### Die Reihenfolge

`[cmd]` **C-441 baut zuerst die 16 Orte** ? **heute sind es vier,
ohne Seite.**

`[read]` **Warte darauf.** `[read]` **Eine Rotation ueber vier
Orte ohne links und rechts ist keine.**

### Was die Spec vorgibt

`[cmd]` **`docs/specs/Supplements/Injection Planner - Spec Change
Request.md`, 371 Zeilen** ? **die einzige Quelle, das Altrepo kennt
Injektionen nicht.**

**5.1, Zeile 117-135** ? **vier Zustaende, gerechnet aus dem
letzten Einstich:**

    fresh      nie benutzt
    resting    rest_remaining > 1
    soon       rest_remaining >= 0
    ready      rest_remaining < 0

`[read]` **Die Legende unter der Karte zeigt heute fuenf Stufen
nach Tagen** ? **das ist die Mockup-Fassung.** `[cmd]` **Die Spec
rechnet je Ort mit seinem eigenen `rest_days`** ? **Deltoid 5 Tage,
Gluteus 7.**

`[read]` **Also nicht *,,vor 7 Tagen"*, sondern *,,noch 2 Tage
Ruhe"*.**

**5.2, ab Zeile 138** ? **`suggestSite`: laengste Ruhe zuerst,
bei Gleichstand `contralateral_rotation`.**

`[cmd]` **Und Zeile 182: derselbe Muskel auf der Gegenseite zaehlt
NICHT als Wechsel** ? **`isContralateral` ist die feinste Regel der
Spec.**

**6, ab Zeile 190** ? **drei Sperren, vier Warnungen:**

    block   volume_limit, rest_window, route_mismatch
    warn    overuse_30d, advanced_site,
            complication_repeat, pain_trend

### 1 · Der Schreibweg

`[read]` **Ohne Zeilen rechnet nichts** ? **`injection_logs` hat
null.**

`[cmd]` **Alle vier Policies stehen seit C-429.**

`[read]` **Der Weg gehoert nach `apps/`** ? **die zwei
`medical.injection_*`-Funktionen sind Leser.**

### 2 · Die Karte zeigt den Zustand

`[read]` **Farbe je Ort nach `siteState`, nicht nach Tagen.**

`[cmd]` **Und der vorgeschlagene naechste Ort hervorgehoben** ?
**`suggestSite` sagt welcher, und WARUM
(`reason: contralateral_rotation`).**

`[read]` **Ein Vorschlag ohne Grund ist eine Anweisung.**

### 3 · Klick zeigt den Ort

Tom: *,,bei klick infos anzeigen."*

`[cmd]` **Die Kachel rechts gibt es schon** ? **`Ventroglutal L`
mit Status, Volumen, Ruhefenster, Nadel.**

`[read]` **Sie ist heute fest verdrahtet** ? **verbinde sie mit dem
Klick.**

### 4 · Die Beschriftungen

Tom: *,,beschriftungen weiter draussen lesbar machen, koennen auch
linien zum punkt fuehren."*

`[cmd]` **Heute stehen sie ueber dem Punkt und ueberlappen** ?
**bei 16 Orten wird es schlimmer.**

`[read]` **Miss, ob `Koerperkarte` das kann** ? **wenn nicht:
melden, nicht in `packages/ui` bauen.**

`[read]` **Eine Linie vom Text zum Punkt ist eine Zeile SVG** ?
**aber sie gehoert in die gemeinsame Karte, nicht daneben.**

### 5 · Die uebrigen Kacheln

`[cmd]` **Vier sofort baubar:** `injection_needle_recommendations`
**(8 Zeilen),** `injection_tissue_condition_guidance` **(1).**

`[cmd]` **Sechs warten auf den Schreibweg.**

`[read]` **`injection_site_conditions` hat 0 Zeilen** ? **miss, was
sie traegt, und melde, ob sie eine Kachel braucht.**

### Abnahmebedingungen

    A1  eine Injektion erfasst. Zahl: injection_logs
        vorher/nachher.
    A2  je Ort der Zustand nach 5.1. Zahl: 16 Orte / je Zustand.
        Und: rechnet er mit dem EIGENEN rest_days?
    A3  der Vorschlag: welcher Ort, welcher Grund. Belegt.
    A4  Klick auf einen Punkt fuellt die Kachel rechts.
        Bildschirmfoto.
    A5  Beschriftungen lesbar bei 16 Orten. Bildschirmfoto.
        Und: was Koerperkarte dafuer braucht.
    A6  die zehn Kacheln: gebaut oder mit Grund offen.
    A7  E-72: Kacheln / mit Daten / mit Leerhinweis /
        nackte Nullen.
    A8  E-69: Referenz unter der Linie.

### Was nicht zu tun ist

**Nichts in `supabase/`** ? **C-441 baut die Orte, Codex.**
**Nichts in `packages/ui` ohne Meldung.**
**Keine eigene Zustandsberechnung** ? **5.1 steht in der Spec.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

## Zurueckgelegt 2026-09-08

`[cmd]` **Lag in `laufend_claudecode/` ohne Bericht und ohne
Abnahme** ? **aus einer frueheren Sitzung.**

`[read]` **Der Auftrag ging raus, der Bericht kam nie** ? **oder
er wurde mit einem anderen Punkt miterledigt.**

`[read]` **Vor dem naechsten Auftrag messen, was davon noch
offen ist.**

## Recherchiert 2026-09-08 — der Stand heute

`[cmd]` **`medical.injection_logs`: 0 Zeilen.**

`[cmd]` **Gesucht, wer hineinschreibt** ? **NIEMAND.**

`[cmd]` **`injektion-read.ts:142`: `m.from('injection_logs')`** ?
**ein LESEweg, sonst nichts.**

`[cmd]` **Der Knopf existiert:** `tab-injektionen.tsx:206`,
`kontext.tsx:27` (`'logInjection'`), `modale.tsx:258`.

`[read]` **Das ist das Muster aus G-422:** **ein fertiges Modal
ohne Schreibweg.**

`[cmd]` **Dreimal heute dieselbe Klasse:**

    logPhoto              Modal ohne Ausloeser (G-421, behoben)
    messungAnlegenAktion  Funktion ohne Aufrufer (offen)
    logInjection          Modal ohne Schreibweg

## Was die Datenbank bereithaelt

`[cmd]` **C-455, abgenommen:** **`injection_logs` hat sieben neue
Spalten:**

    substance_id, dose_amount, dose_unit,
    needle_gauge, needle_length_in, notes, stack_item_id

`[cmd]` **C-454:** **`user_injection_site_selections` mit
`body_area_code`, und drei Funktionen:**

    validate_injection_site_selection   (Trigger)
    suggest_configured_injection_area
    injection_needle_suggestions

`[cmd]` **G-423, heute abgenommen:** **die Nutzerkonfiguration
ist gebaut** ? **Substanz, Weg, Flaeche, Nadel, geschrieben und
gelesen.**

`[read]` **Es fehlt nur der Schritt danach: die Injektion
erfassen.**

## Was zu bauen ist

`[read]` **Der Schreibweg fuer eine erfasste Injektion.**

`[cmd]` **Was das Modal heute zeigt** (`injektion-modal.tsx`):
**Zuletzt benutzt, Volumen letzte Gabe, Substanz, Schmerz,
Komplikation.**

`[read]` **Miss, welche Felder `injection_logs` traegt und welche
das Modal braucht.**

`[cmd]` **`injection_needle_suggestions` gibt die Nadel** ?
**G-423 hat die Konfiguration gebaut, sie kann vorbelegen.**

`[read]` **Und die Rotation:** `suggest_configured_injection_area`
**schlaegt die naechste Flaeche vor** ? **eine gewaehlte Flaeche:
kein Vorschlag (E-79).**

## Abnahmebedingungen

    A1  eine Injektion am Schirm erfasst. Zeile in
        injection_logs. Bildschirmfoto.
    A2  die Felder: was das Modal zeigt / was die Tabelle
        traegt / was fehlt. TABELLE.
    A3  die Nadel wird aus der Konfiguration vorbelegt.
        Gemessen.
    A4  nach dem Erfassen: die Rotationskarte zeigt die
        Flaeche als benutzt. Zwei Fotos.
    A5  Gegenprobe: der alte Zustand wiederhergestellt
        -> faellt sie?
    A6  apps/web 1600 oder mehr.

## Was nicht zu tun ist

**Nichts in `supabase/`** ? **Codex arbeitet an C-470.**
**Keine Zahl erfinden** ? **die Tabelle ist leer, das bleibt
sichtbar.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### A1 — eine Injektion erfasst. Die Zeile steht.

`[cmd]` **Klickprobe auf `test-user@lumeos.local`**
(`tools/_g389-erfassen.mjs`):

    vorher   medical.injection_logs   0 Zeilen
    Klick    Compound gewaehlt, Notiz getippt, „Log injection"
    nachher  1 Zeile

**Die Zeile, ganz:**

    body_area_code    gluteal
    route             im
    substance_name    Testosterone Cypionate
    volume_ml         0.60
    dose_amount       150.0000   dose_unit  mg
    needle_gauge      21G        needle_length_in  1.50
    pain_score        1
    notes             G-389 Klickprobe
    injected_at       2026-09-11

`[read]` **Die Nadel ist in ZWEI Spalten zerlegt** — `21G` in
`needle_gauge`, `1.50` in `needle_length_in`. **Das Feld zeigt
`21G × 1.5"`, die Tabelle fuehrt Text und Zahl getrennt.**

**Bild:** `docs/bilder/g389/modal-gespeichert.png` — die gruene
Zeile *„In medical.injection_logs gespeichert · Fläche gluteal"*
steht im Fenster.

**GEBAUT:**

    lib/medical/injektion-write.ts       Schreibweg + Pruefung
    lib/medical/injektion-vokabular.ts   die erlaubten Werte
    v2/supplements/injektion-aktionen.ts Serveraktion
    v2/supplements/modale.tsx            neun Felder angebunden

### A2 — die Felder: Modal / Tabelle / fehlt

`[cmd]` **`injection_logs` traegt ZWANZIG Spalten**, gemessen gegen
`information_schema`. **Drei sind Pflicht:** `user_id`,
`injected_at`, `body_area_code`.

    Modal zeigt        Tabelle traegt        Stand
    ------------------------------------------------------------
    Compound           substance_name        ANGEBUNDEN
    Date + Time        injected_at           ANGEBUNDEN (1 Spalte)
    Site (16 Orte)     body_area_code        ANGEBUNDEN ueber
                       + injection_site_id   ORT_ZU_FLAECHE
    Volume             volume_ml             ANGEBUNDEN
    Dose               dose_amount+dose_unit ANGEBUNDEN
    Needle             needle_gauge          ANGEBUNDEN, zerlegt
                       + needle_length_in
    Pain 0-3           pain_score            ANGEBUNDEN
    Notes              notes                 ANGEBUNDEN
    Override reason    override_reason       NICHT — der Knopf
                                             ist ohne Funktion
    ---                complication          NICHT im Modal
    ---                substance_id          NICHT — das Modal
                                             fuehrt Namen, keine Id
    ---                stack_item_id         NICHT — kein Bezug
                                             im Fenster
    user_id            user_id               aus der Sitzung
    ---                created_at/updated_at Vorgabe der Tabelle

`[cmd]` **Neun von neun Modalfeldern schreiben.** `[read]` **Vier
Spalten bleiben leer, und keine davon ist Pflicht:**

`[read]` **`complication` fehlt im Fenster** — die Vorlage hat kein
Feld dafuer. `[cmd]` **Der CHECK kennt sieben Werte**
(`none | bleeding | lump | swelling | redness | leakage |
nerve_sensation`), **und sie stehen im Vokabular bereit.** **Ein
Feld dafuer waere ein eigener Auftrag, kein Nebenbei.**

`[read]` **`substance_id` und `stack_item_id` brauchen eine
Auswahl aus dem Stack** — das Modal fuehrt heute freie Namen aus
`INJ_PROTOKOLL`. **Gemeldet, nicht erfunden.**

`[cmd]` **`override_reason`: der Knopf *„Override with reason"*
existiert und tut nichts** — er stand schon vor diesem Auftrag ohne
Funktion da.

**ZWEI VOKABULARE FUER DENSELBEN WEG — ein Befund:**

    injection_logs.route                   im | sc
    user_injection_site_selections.route   injection_im |
                                           injection_subq

`[read]` **Dieselbe Sache, zwei Schreibweisen.** `[cmd]` **Wer die
eine in die andere Spalte schreibt, bekommt einen CHECK-Fehler.**
**Die Umrechnung steht an EINER Stelle** (`injektion-vokabular.ts`)
und ist per Hin-und-Rueck-Probe bewacht.

### A3 — die Nadel kommt aus der Konfiguration

`[cmd]` **Am Schirm gemessen, beide Zustaende:**

    ohne Konfiguration   23G × 1.25"   „Needle · recommended"
    mit Konfiguration    21G × 1.5"    „Needle · konfiguriert"

`[read]` **Die Werte sind absichtlich verschieden gewaehlt** —
sonst saehe man nicht, welcher gewonnen hat.

`[cmd]` **Und der konfigurierte Wert landet in der Tabelle:**
`needle_gauge = 21G`, `needle_length_in = 1.50`.

`[read]` **Die Konfiguration wird nach Flaeche UND Weg gesucht** —
`gluteal` + `injection_im`. **Eine Konfiguration fuer einen anderen
Weg darf nicht gewinnen.**

`[cmd]` **Wer von Hand tippt, behaelt seinen Wert** — ein
Ortswechsel ueberschreibt die Eingabe nicht (`nadelBeruehrt`).

**Ein Befund am Rande:** `[cmd]` **Der Trigger
`validate_injection_site_selection` hat meinen ersten
Konfigurationsversuch ABGEWIESEN** — Semaglutid ist im Katalog nur
`injection_subq`, ich wollte `injection_im` konfigurieren.
`[read]` **Das ist C-455, die arbeitet** — und es zeigt, dass die
Pruefung nicht bloss dasteht.

### A4 — die Karte zeigt die Flaeche als benutzt

`[cmd]` **Der Satz, der an den ECHTEN Zeilen haengt**
(`tab-injektionen.tsx:282`, `protokoll.length === 0`):

    0 Zeilen   „Noch keine Injektion erfasst — alle Flaechen
                stehen auf nie benutzt."        STEHT DA
    1 Zeile    derselbe Satz                    IST WEG

`[cmd]` **Und die Gegenprobe zurueck:** Zeile geloescht -> **der
Satz ist wieder da.**

**Bilder:** `karte-vorher.png`, `karte-nachher.png`

**ABER — und das ist der Befund dieser Bedingung:**

`[cmd]` **Die Protokolltabelle darunter zeigt weiter
Entwurfszeilen:**

    Glute · links    IM   3   18. Mai
    Glute · rechts   IM   2   14. Mai
    Delt · links     IM   1   07. Mai

`[cmd]` **`tab-injektionen.tsx:525` rendert `INJ_PROTOKOLL`** — die
Entwurfskonstante. `[cmd]` **`stand.protokoll` (die echten Zeilen)
wird in Zeile 166 gelesen und nur fuer die Flaechengruppen
benutzt.**

`[read]` **Der Leseweg liegt daneben** — dieselbe Klasse wie die
neun Faelle aus G-355. **Die KARTE rechnet echt, die LISTE nicht.**

`[read]` **Ich habe die Liste NICHT umgestellt** — sie zeigt 16
Orte mit Seitigkeit, die Datenbank fuehrt 21 Flaechen ohne.
**Dieselbe Zuordnungsluecke wie in G-423, und sie zu schliessen ist
ein eigener Auftrag.**

### A5 — die Gegenprobe

**ZEHN PROBEN, ALLE ROT** (`tools/_g389-sabotage.mjs`):

    der alte Zustand: Knopf wieder in Entwicklung    -> ROT
    die Nullzeilenpruefung faellt weg                -> ROT
    ein dritter Injektionsweg wird erfunden          -> ROT
    die Umrechnung der Vokabulare dreht sich um      -> ROT
    der Schmerzwert darf ueber 3 gehen               -> ROT
    die Koerperflaeche wird nicht mehr verlangt      -> ROT
    ein Volumen von 0 geht durch                     -> ROT
    die Nadel kommt nicht aus der Konfiguration      -> ROT
    die Vorbelegung ueberschreibt die Handeingabe    -> ROT
    die Validierungssperre faellt                    -> ROT

`[cmd]` **Jede prueft ZUERST, ob die Sabotage ankommt** — alle zehn
kamen an. `[cmd]` **Nach dem Zuruecksetzen wieder gruen.**

**EIN WAECHTER WAR ZUERST BLIND, und er hat sich selbst
gefangen:** `[cmd]` **„die Konstanten liegen serverfrei" fiel beim
ersten Lauf** — er suchte `createSessionClient|next/headers` im
ganzen Text und fand seine EIGENE Begruendung im Kommentar.
`[read]` **Jetzt sucht er die IMPORT-Zeile**, nach dem Entfernen der
Kommentare. **Dieselbe Lehre wie G-410.**

### A6 — die Proben

    apps/web   1613 / 1613 gruen   (1600 gefordert)
    tsc        EXIT 0

`[cmd]` **Dreizehn neue Waechter**, darunter drei, die die Wirkung
aufrufen statt den Quelltext zu durchsuchen: `pruefeInjektion` mit
echten Werten, die Hin-und-Rueck-Probe der zwei Vokabulare, und die
Grenzen 0 und 3 beim Schmerzwert.

## Was NICHT gebaut wurde

**1 — Ein Feld fuer `complication`.** `[cmd]` **Die sieben Werte
stehen im Vokabular**, die Spalte ist da, **das Fenster hat kein
Feld.** `[read]` **Die Vorlage auch nicht** — ein erfundenes Feld
waere kein Kopieren mehr.

**2 — `substance_id` und `stack_item_id`.** `[read]` **Sie
brauchen eine Auswahl aus dem Stack statt freier Namen** — das
aendert das Fenster, nicht nur den Schreibweg.

**3 — Die Protokollliste auf echte Zeilen umgestellt.** Siehe A4.

**4 — `override_reason`.** `[read]` **Der Knopf tut nichts, und
das tat er vorher schon** — gemeldet, nicht nebenbei gebaut.

**5 — Nichts in `supabase/`.** `[cmd]` **Nur gelesen und gemessen.**

**6 — Nicht committet, nicht gestaged.**

## Zwei Hinweise

**1 — Alle Testdaten sind entfernt.** `[cmd]` **Nachgezaehlt:**
`injection_logs` 0, `user_injection_site_selections` 0. **Die
Klickprobe schreibt auf `test-user@lumeos.local`, nie auf `dev`.**

**2 — Meine erste Messung las das falsche Element.** `[cmd]` **Die
Probe meldete die Nadel als `23G × 1.25"` mit der Ueberschrift
*„Needle recommendation"*** — **das stand im REITER dahinter, nicht
im Fenster.** `[read]` **Jetzt sucht sie in `[role="dialog"]`.**
**Ein Wert vom falschen Element sieht plausibel aus.**

## Neustart

`[cmd]` **NICHT noetig** — nur `apps/web/src` und `tools/`.

## Abnahme

_(vom Orchestrator)_
