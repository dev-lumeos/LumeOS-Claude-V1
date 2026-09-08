---
nr: G-17
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-17
braucht: []
kind_von: G-14
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: b3bb6420
beruehrt:
  dateien:
    - apps/web/src/app/v2/shell.tsx
zahlen: null
---

# G-17 - Datum beim Modulwechsel mitgeben

## Befund

(neu 2026-08-17). Rest
  aus G-14.

  `[cmd]` Heute lebt das Datum nur in der Nutrition-Adresse. Wer im
  Tagebuch auf gestern blaettert und aufs Dashboard wechselt, sieht dort
  wieder heute.

  `[read]` **Ein gemeinsamer Zustand wurde geprueft und verworfen:** Der
  Kontext des Vorgaengers ist ein Browser-Zustand, hier gibt es
  Serverkomponenten je Route — ein Browser-Kontext wuesste das Datum,
  der Server nicht. Ein Cookie waere serverseitig richtig, **aber ein
  Datum, das sich ueber Tage merkt, ist eines, das man vergisst.**

  **Der Weg: als Suchparameter im Link.** `[cmd]` Heute gibt es genau
  eine Verlinkung zwischen Dashboard und Tagebuch — **deshalb noch
  nicht dringend.** Es wird dringend, sobald das Dashboard
  datumsabhaengige Kacheln bekommt.

## Auftrag — jetzt ist es dringend

**Mitbeauftragt: G-338, G-256.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Der Punkt sagt selbst, wann

> *,,Es wird dringend, sobald das Dashboard datumsabhaengige
> Kacheln bekommt."*

`[cmd]` **G-152 hat gerade den Aktivitaetsstrom angeschlossen** —
**eine Liste, nach `occurred_at` sortiert, 40 Zeilen.**

`[cmd]` **Und `dashboard/page.tsx` liest bereits `searchParams`.**

`[read]` **Der Weg steht im Punkt: als Suchparameter im Link.**

### 1 · G-17 — das Datum ueberlebt den Modulwechsel

`[cmd]` **Heute lebt es nur in der Nutrition-Adresse.**

`[read]` **Wer im Tagebuch auf gestern blaettert und aufs Dashboard
wechselt, sieht dort wieder heute.**

`[cmd]` **Der Punkt hat einen gemeinsamen Zustand geprueft und
verworfen** — **Serverkomponenten je Route, ein Browser-Kontext
wuesste das Datum, der Server nicht.**

`[read]` **Und ein Cookie waere serverseitig richtig, aber
*,,ein Datum, das sich ueber Tage merkt, ist eines, das man
vergisst."***

`[read]` **Miss zuerst, welche Module ein Datum fuehren** —
`[cmd]` **15 Dateien lesen heute `searchParams` oder `datum=`.**

### 2 · G-338 — eine freie Mahlzeit hat keinen Namen

`[read]` **Miss, was heute geschieht, wenn jemand eine Mahlzeit
ohne Namen anlegt.**

### 3 · G-256 — die Originaldatei zum Laborbericht

`[cmd]` **Codex baut gerade den Ablageweg** (C-429).

`[read]` **Miss nur, was die Oberflaeche braeuchte, und melde es** —
**bau nichts, bis der Bucket steht.**

### Lies zuerst

`[cmd]` **`00-QUELLEN.md`, Abschnitte dashboard und nutrition.**

`[cmd]` **Und `module-dashboard.jsx`** — **dort stand schon die
Antwort auf die Formfrage in G-152.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  welche Module fuehren ein Datum? Zahl: Module /
        davon mit Datum in der Adresse.
    A2  vom Tagebuch auf gestern, dann aufs Dashboard:
        welches Datum steht dort? Vorher/nachher belegt.
    A3  zurueck ins Tagebuch: bleibt es bei gestern?
    A4  E-69: Referenz unter der Linie, unveraendert.
        Zahl: angebunden / Referenzen.
    A5  G-338: was geschieht heute ohne Namen? Gemessen.
    A6  G-256: was die Oberflaeche braeuchte, als Liste.

### Was nicht zu tun ist

**Kein Cookie, kein Browser-Kontext** — **der Punkt hat beides
geprueft und verworfen.**
**Nichts in `supabase/` aendern** — **Codex arbeitet an C-429.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **Bei `hasStartTime` im Log: nur `.next/cache/webpack`
loeschen** (A-73).

## Bericht

**Claude Code, 2026-09-08.** **Alle Nachweise auf
`test-user@lumeos.local`, im Browser, angemeldet.**

### A1 — welche Module fuehren ein Datum?

**12 Modulseiten / 2 mit Datum in der Adresse.**

    Modul            searchParams   datum=   stichtag im Code
    dashboard        ja             ja       ja
    nutrition        ja             ja       ja
    goals            —              —        ja
    supplements      —              —        ja
    training         —              —        ja
    recovery         —              —        —
    medical          —              —        —
    coach, coach/ai, coach/human, nutrition/suche, settings   —

`[cmd]` **Vier weitere rechnen einen Stichtag, koennen ihn aber
nicht entgegennehmen:** `goals`, `supplements`, `training` setzen
`const stichtag = heute()` fest.

`[read]` **Das begrenzt die Wirkung ehrlich:** das Datum reist
ueberallhin mit, **aber nur `dashboard` und `nutrition` lesen es
heute aus.** Die uebrigen ignorieren es — sie zeigen weiter heute.
**Kein Schaden, aber auch noch kein Nutzen**; sie einzeln
anzuschliessen ist Arbeit je Modul und stand nicht im Auftrag.

### A2 — vom Tagebuch auf gestern, dann aufs Dashboard

**Vorher:**

    Tagebuch heute      tab=diary                        Heute
    Tagebuch gestern    tab=diary&datum=2026-09-07       2026-08-16
    Dashboard danach    (ohne Parameter)                 —
    Tagebuch zurueck    (ohne Parameter)                 Heute

**Nachher:**

    Tagebuch gestern    tab=diary&datum=2026-09-07       2026-08-16
    Dashboard danach    datum=2026-09-07
    Tagebuch zurueck    datum=2026-09-07                 2026-08-16

`[cmd]` **Und das Dashboard nennt seinen Stichtag selbst:**

    /v2/dashboard                    -> ,,Alle Zahlen fuer den 8.9."
    /v2/dashboard?datum=2026-09-07   -> ,,Alle Zahlen fuer den 7.9."

`[read]` **Keine nackte Zahl** — wer auf einem anderen Tag steht,
sieht welchen.

### A3 — zurueck ins Tagebuch

**Ja, es bleibt bei gestern** — `datum=2026-09-07`, Kopf zeigt
denselben Tag. **Vorher war es wieder ,,Heute".**

### Der Weg: eine Stelle, nicht dreizehn

`[cmd]` **Die Modul-Liste steht in `@lumeos/ui`**
(`shell/nav.ts`) — **sie gehoert allen Anwendungen**, nicht nur
dieser. Ein Datum dort einzubauen haette Admin und Coach
mitgeaendert.

`[cmd]` **`V2Link` in `app/v2/shell.tsx` ist die EINE Stelle**, durch
die jeder Link der Huelle laeuft. Er liest `useSearchParams()` und
haengt `datum` an.

**Drei Bedingungen, damit es nicht streut:**

    nur mit gueltigem Datum   /^\d{4}-\d{2}-\d{2}$/
    nur an /v2/-Ziele         kein Datum an coach.lumeos.app
    nur ohne eigenes datum=   wer eines mitbringt, meint es auch

`[cmd]` **Gemessen:** 18 Verweise auf der Seite, **9 mit
`datum=`, davon 0 externe.**

**Sabotageprobe:** `mitDatum(href, datum)` durch `href` ersetzt —
**der alte Zustand kam exakt zurueck** (Dashboard ohne Parameter,
Tagebuch wieder ,,Heute"). Zurueckgedreht, wieder gruen.

`[read]` **Kein Cookie, kein Browser-Kontext** — wie der Punkt es
verlangt.

### A4 — E-69: Referenz unter der Linie

**8 angebunden / 7 Referenzen — unveraendert.**

    OBEN   Makros · heute | Recovery | Ziele | Training |
           Bestleistungen | Medical | Supplements | Aktivität
    UNTEN  Today's flow | Activity | Macros · today | Readiness |
           Body battery | Tonight | PR watch

### A5 — G-338: eine Mahlzeit ohne Namen

**Der Fall gibt es nicht mehr — gemessen, nicht vermutet.**

`[cmd]` **`nutrition.meals` hat KEINE Namensspalte.** Zehn Spalten,
darunter `meal_type` (NOT NULL) mit CHECK auf sieben Werte —
`breakfast, lunch, dinner, snack, pre_workout, post_workout,
other`.

`[cmd]` **Am Schirm gemessen**, Formular ,,Mahlzeit hinzufuegen":

    11 Auswahlmoeglichkeiten
      Fruehstueck (07:30) | Mittagessen (12:30) | Snack (16:00)
      | Abendessen (19:30)
      ── ohne eigenen Slot ──
      Fruehstueck | Mittagessen | Abendessen | Snack
      | Vor dem Training | Nach dem Training

    Vorgabe: slot:1   (,,Fruehstueck 07:30" der Nutzerin)

`[cmd]` **,,Sonstiges" steht nicht mehr darin** — **G-336 hat es
durch die eigenen Slots ersetzt.** `[cmd]` **Und die Vorgabe ist nie
leer:** ein Auswahlfeld mit gueltigem Vorbelegtem.

`[read]` **Damit ist die Frage des Punktes beantwortet:** *,,was
geschieht ohne Namen"* — **es kann nicht ohne passieren.** Die
Mahlzeit traegt immer eine Art, und wer einen eigenen Slot waehlt,
bekommt dessen Zeit mit (E-58).

`[read]` **G-338 ist damit gegenstandslos**, so wie G-371 in G-370.

### A6 — G-256: was die Oberflaeche braeuchte

**Der Bestand fehlt noch. Nichts gebaut.**

`[cmd]` **`storage.buckets` ist LEER** — C-429 ist nicht
eingespielt.

`[cmd]` **Aber der Zeiger steht schon:**
`medical.lab_reports.file_ref` (text). **10 Berichte, 0 mit
Datei.**

`[cmd]` **Und `authenticated` hat bereits 7 Rechte auf
`storage.objects`.**

**Was die Oberflaeche braeuchte, als Liste:**

    1  Ein Bucket mit Namen — ohne ihn kein Pfad.
       Offen: heisst er `lab-reports`? Privat oder oeffentlich?

    2  Die Pfadregel. `file_ref` ist freier Text; ohne Vorgabe
       schreibt jede Stelle etwas anderes.
       Vorschlag: `<user_id>/<report_id>.<endung>` — der
       Zeilenschutz laeuft dann ueber das erste Pfadsegment.

    3  Ein Schreibweg fuer den Zeiger. `lab_reports` hat heute
       keinen UI-Schreibweg; das Hochladen muss `file_ref`
       nachtragen.

    4  Erlaubte Dateiarten und Groesse — sonst laedt jemand ein
       200-MB-Video in einen Laborbericht.

    5  Ein Leseweg fuer eine Zeitschrift-URL (signed URL), weil
       ein privater Bucket nicht direkt verlinkbar ist.

    6  Und die Anzeige: ein Bericht MIT Datei sieht anders aus als
       einer ohne. **10 von 10 haben heute keine** — der
       Leerhinweis muss also der Normalfall sein, nicht die
       Ausnahme (E-72).

`[read]` **Punkt 1 und 2 sind Entscheidungen**, 3 bis 6 Arbeit.
**Gemeldet, nicht gebaut** — wie beauftragt.

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen
    pnpm --filter web test      1503 pass, 0 fail

### Geaendert

    apps/web/src/app/v2/shell.tsx    V2Link haengt datum an

`[read]` **Eine Datei, eine Funktion** — die Modul-Liste im
UI-Paket blieb unberuehrt.

**Nichts in `supabase/`. Nichts geschrieben — alle Messungen
lesend. Nicht committet, nicht gestaget.**

## Abnahme

**2026-09-08, Orchestrator.** **Sechs mit Zahlen.**

    A1  12 Modulseiten / 2 fuehren ein Datum
    A2  vorher: Dashboard sprang auf Heute
        nachher: der Tag ueberlebt beide Wechsel
    A3  zurueck ins Tagebuch: bleibt bei gestern
    A4  8 angebunden / 7 Referenzen, unveraendert
    A5  G-338 grundlos, gemessen
    A6  G-256 blockiert, nichts gebaut

### Die wichtigste Entscheidung ist, wo er es NICHT gemacht hat

`[cmd]` **Die Modulliste liegt in `@lumeos/ui`** — **Admin und
Coach benutzen sie mit.**

`[read]` **Eine Aenderung dort haette drei Apps betroffen.**

`[cmd]` **`V2Link` in `app/v2/shell.tsx` ist der eine Punkt, durch
den jeder Schalenlink laeuft.**

> *,,Das gemeinsame Paket war die verlockende Stelle, und haette
> Admin und Coach mitveraendert."*

`[read]` **Das ist dieselbe Ueberlegung wie E-71: die Regeln gelten
je App** — **und ein gemeinsames Paket ist keine App.**

### Drei Waechter in vier Zeilen

`[cmd]` **Selbst nachgelesen, `shell.tsx:46-50`:**

    if (!datum) return href
    if (!href.startsWith('/v2/')) return href
    if (href.includes('datum=')) return href

`[read]` **Kein Datum, kein fremdes Ziel, kein Ueberschreiben.**

`[cmd]` **Gemessen: 18 Links auf der Seite, 9 tragen das Datum, 0
nach aussen.**

`[cmd]` **Sabotageprobe stellte den urspruenglichen Mangel genau
wieder her.**

### Und das Dashboard nennt seinen Tag

`[cmd]` *,,Alle Zahlen fuer den 7.9."* **gegen** *,,8.9."*

`[read]` **E-72: keine nackte Zahl** — **wer gestern sieht, soll
wissen, dass es gestern ist.**

### A5 — G-338 war grundlos, und er hat es gemessen

`[cmd]` **Selbst nachgemessen: `nutrition.meals` hat KEINE
Namensspalte.** `[cmd]` **`meal_type` ist NOT NULL mit
Sieben-Werte-CHECK.**

`[cmd]` **Am Schirm bietet das Formular elf Punkte** — **vier
eigene Slots mit Zeiten, dann sechs Kategorien** — **Vorgabe
`slot:1`.**

`[read]` **Eine Mahlzeit kann nicht namenlos entstehen, weil das
Feld eine Auswahl mit gueltiger Vorgabe ist.**

`[cmd]` **Und *,,Sonstiges"* ist weg** — **G-336 hat es ersetzt.**

### A6 — er hat nichts gebaut, und das ist richtig

`[cmd]` **`storage.buckets` leer, 10 von 10 Berichten ohne Datei.**

`[read]` **`file_ref` steht schon als Zeiger da** — **es fehlt
nur, worauf er zeigt.**

`[read]` **Und seine Beobachtung trifft:** **die ersten zwei der
sechs offenen Punkte sind Entscheidungen, keine Arbeit.**

**Abgenommen.**

