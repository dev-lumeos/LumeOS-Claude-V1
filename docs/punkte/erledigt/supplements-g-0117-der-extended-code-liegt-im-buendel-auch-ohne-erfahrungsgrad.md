---
nr: G-117
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-110
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a8c6fda9
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-extended.tsx
zahlen: null
---

# G-117 - Der Extended-Code liegt im Buendel, auch ohne Erfahrungsgrad

## Befund

(neu 2026-08-20, aus G-110).

  `[cmd]` **Das Gate haelt die Daten, nicht den Code.** Gemessen: bei
  statischem Import steht „Active protocols" in **einem von sieben**
  JS-Chunks der Seite — auch fuer jemanden, dessen Grad nicht reicht.

  `[cmd]` **Ein `dynamic({ ssr: false })` behebt es** (der Chunk war
  danach nicht mehr im Seitenmanifest) — **und macht den Tab leer:** er
  zeigte gar nichts mehr, auch nicht den Ladehinweis. **Zurueckgenommen.**

  `[read]` **Wie schwer es wiegt:** Die Protokolle selbst kommen NICHT
  mit — nur die Attrappenzahlen des Entwurfs. Wer den Code liest,
  erfaehrt nichts ueber den Nutzer. **Sobald Extended echte Daten
  fuehrt, wird es ernst.**

## G-118 zusammengelegt, 2026-09-08

`[cmd]` **G-117 und G-118 sind derselbe Befund aus G-110** ?
**einer beschreibt ihn, der andere stellt die Frage dazu.**

Aus G-118:

> *,,Das Gate haelt ? serverseitig gegen `experience_level`.
ABER der Code wird trotzdem ausgeliefert."*

> *,,Zu klaeren: Reicht das Gate, oder soll der Code gar nicht
erst zum Browser? Es geht um PED-Protokolle ? die Frage ist
nicht rein technisch."*

## Die Antwort, 2026-09-08

`[read]` **Das Gate haelt die DATEN. Was ausgeliefert wird,
ist der Entwurf mit Attrappenzahlen** ? **wer den Code liest,
erfaehrt nichts ueber den Nutzer.**

`[read]` **Aber er erfaehrt, DASS es PED-Protokolle gibt und
wie sie aufgebaut sind** ? **und sobald Extended echte Daten
fuehrt, wird aus dem Entwurf ein Leseweg.**

`[cmd]` **Der erste Versuch nahm `dynamic({ ssr: false })`** ?
**das haelt den Chunk heraus UND macht den Reiter leer, auch
den Ladehinweis. Zurueckgenommen, richtig.**

`[read]` **Das war das falsche Werkzeug: `dynamic` verschiebt
das Laden, es entscheidet nicht ueber das Ausliefern.**

### Was zu messen ist

`[cmd]` **Next.js App Router kennt Servergrenzen** ? **eine
Serverkomponente, die bei zu niedrigem Grad NICHTS rendert,
liefert auch nichts aus.**

    A  wo liegt die Grenze heute? extended-gate.tsx,
       kontext.tsx -- Server oder Client?
    B  was steht in welchem Chunk? Vorher messen,
       nicht schaetzen.
    C  haelt eine Servergrenze den Chunk heraus UND
       den Reiter am Leben?
    D  was sieht ein Nutzer mit zu niedrigem Grad?
       Eine Erklaerung, kein leeres Feld -- die Lehre
       aus G-482 und G-486.

## Abnahmebedingungen

    A1  vorher: in wie vielen Chunks steht der
        Extended-Code? Zahl.
    A2  nachher: null. Gemessen, nicht behauptet.
    A3  ein Nutzer mit Grad sieht den Reiter
        unveraendert. Foto.
    A4  ein Nutzer ohne Grad sieht eine Erklaerung,
        kein leeres Feld. Foto.
    A5  das serverseitige Gate bleibt -- die Grenze
        ERSETZT es nicht, sie kommt dazu.
    A6  ein Waechter faengt einen Rueckfall.
        Sabotageprobe.
    A7  die elf anderen Reiter unveraendert.
    A8  apps/web 1982 oder mehr, apps/coach 65.

## Bericht

**Claude Code, 2026-09-24.** `[cmd]` **Gemessen an einem eigenen
Produktionsbau** (`LUMEOS_DIST_DIR=.next-g117`) ? **Toms
Entwicklungsserver auf 3200 blieb unberuehrt.**

### A wo die Grenze heute liegt

    page.tsx              Serverkomponente, ruft ladeGate()
    ansicht.tsx           'use client' -- hier faellt die Anzeige
    extended-gate.tsx     'use client' -- nur die SPERRkachel
    tab-extended.tsx      'use client', 4x useSupp(), Modale

`[read]` **Der Reiter ist echt bedienbar** ? **er kann keine
Serverkomponente werden.** `[cmd]` **Das beantwortet Messpunkt C:
eine Servergrenze um `tab-extended.tsx` ist nicht moeglich**, und
genau deshalb griff der erste Versuch zu `dynamic`.

`[read]` **Das richtige Werkzeug war `dynamic` die ganze Zeit ?
nur mit `ssr: true` statt `false`.** `[cmd]` **`ssr: false`
nimmt den Serveranstrich weg** (daher der leere Reiter),
**`ssr: true` nimmt nur den Chunk aus dem Seitenbuendel.**

### A1 vorher ? die Zahl

`[cmd]` **Die Kennzeichen aus `tab-extended.tsx` standen in EINEM
von zehn JS-Chunks der Seite:**
`app/v2/supplements/page-*.js`. `[read]` **Das deckt sich mit dem
Befund vom 2026-08-20 („einer von sieben") ? der Bau ist seither
groesser geworden.**

### A2 nachher ? null

`[cmd]` **Alle drei Kennzeichen liegen jetzt in `5541.*.js`** ?
**und dieser Chunk steht NICHT im Seitenmanifest** (10 JS-Dateien,
keine davon traegt ihn).

`[cmd]` **Im Browser gegengeprueft, nicht nur im Manifest:**

    ohne Grad   0 von 3 Kennzeichen in 12 geholten JS-Antworten
    mit Grad    3 von 3, in
                _app-pages-browser_..._tab-extended_tsx.js

`[read]` **Dieselbe Datei, die mit Grad kommt, kommt ohne Grad
nicht.**

### A3 mit Grad unveraendert

`[cmd]` **`test-user@lumeos.local` (`pro`): Zyklus-Zeitstrahl,
Nebenwirkungsprotokoll und der Knopf sind da, null Seitenfehler.**
**Bild:** `tools/_g117-mit-grad.png`

### A4 ohne Grad eine Erklaerung

`[cmd]` **`coach@lumeos.app` (`experience_level` NULL):**
Sperrkachel sichtbar, *„Der Bereich ist ab «Pro» offen"*, der Weg
heraus nach `/v2/settings` ist da, **kein leeres Feld**, null
Seitenfehler. **Bild:** `tools/_g117-ohne-grad.png`

### A5 das serverseitige Gate bleibt

`[cmd]` **`ladeGate()` liest weiter `profiles.experience_level`,
`gate?.offen` entscheidet weiter ueber das Rendern.** `[read]`
**Die Buendelgrenze ERSETZT nichts ? sie kommt dazu.** **Eine
Sabotage, die `gate?.offen` entfernt, wird rot.**

### A6 der Waechter

`[cmd]` **`g117-extended-buendel.test.ts`, fuenf Proben.**
**Fuenf Sabotagen, jede genau EINE rote Probe:**

    ssr: true -> false            -> Probe 2 rot
    gate?.offen entfernt          -> Probe 5 rot
    Wert-Import zurueck (tabs)    -> Probe 3 rot
    Zahl 5 -> 7                   -> Probe 4 rot ("luegt")
    statischer Import zurueck     -> Probe 1 rot

`[read]` **Der Waechter sucht nicht das Wort `dynamic`** ? **er
fragt nach der Wirkung.** Sonst bliebe er gruen, wenn jemand
`ssr: false` daraus macht ? **und das ist genau der
zurueckgenommene Versuch.**

### A7 / A8

`[cmd]` **Zwoelf andere Reiter** (nicht elf ? gezaehlt in
`ansicht.tsx`): **alle tragen Inhalt, null Seitenfehler.**

`[cmd]` **`pnpm gate` GRUEN, 18 von 18.** **`apps/web` 1.987**
(1.982 + fuenf neue Waechter), **`apps/coach` 65.**

### DREI Wege, nicht einer

`[read]` **Der Auftrag nennt einen Weg ins Buendel. Gemessen sind
drei** ? **das `dynamic` allein haette zwei davon offen
gelassen:**

    1  statischer Import von tab-extended.tsx
       -> dynamic({ ssr: true })
    2  ansicht.tsx importierte EXTENDED_STACK fuer EINE Zahl
       (das Zaehlerchen am Reiter) -> Konstante
    3  tabs.tsx importierte EXTENDED_STACK/LABS und benutzte
       sie NIE -> toter Import, entfernt

`[read]` **Ein toter Import ist trotzdem ein Wert-Import.**
`[cmd]` **Und `tabs.tsx` haengt an vier Reitern, die JEDER
sieht** ? der Umweg lieferte die Stoffliste auch ohne Grad aus.

### DER VIERTE WEG ist offen ? und gehoert Tom

`[cmd]` **`mockup-referenz.tsx` zeigt UNTER der Trennlinie
dieselben Wirkstoffe ? fuer JEDEN, ohne Gradpruefung:**

    Testosterone Cypionate   150 mg  Mon + Thu  IM glute
    HCG                      500 IU  Tue + Fri  SubQ
    Anastrozole (Arimidex)  0,25 mg  Every 3rd day
    MK-677, BPC-157
    dazu 12 Laborwerte

`[cmd]` **Im Bild belegt:** `tools/_g117-ohne-grad.png` **zeigt
das alles bei `experience_level` NULL.**

`[cmd]` **Isolationsprobe:** haengt man `<SuppExtendedReferenz/>`
aus, **verschwindet `physician-supervised` aus dem
Seitenmanifest** ? **sie ist die Ursache, nicht ein Rest.**

`[read]` **Ich habe sie NICHT angefasst.** **E-68/E-70: die
Mockup-Fassung jeder Kachel bleibt sichtbar, bis Tom sie
abnimmt** ? **das ist eine Entscheidung, kein Rueckfall.** Der
Waechter bewacht sie deshalb ausdruecklich nicht.

`[read]` **Die Frage aus G-118 beantwortet sie aber neu:** wer
*„soll der Code gar nicht erst zum Browser?"* mit ja beantwortet,
**muss auch ueber die Referenz entscheiden** ? sonst steht das
PED-Schema weiter im Buendel, nur an anderer Stelle.

**Zur Wahl:** die Referenz ebenfalls hinter das Gate ? oder
bewusst stehen lassen, weil sie Entwurf ist und keine Nutzerdaten
traegt.

### C-541: was mein Gate bei NULL tut

`[cmd]` **`reichtDerGrad` ist von Haus aus zu:**

    null        -> false      "advanced"  -> false
    undefined   -> false      "pro"       -> true
    ""          -> false      "elite"     -> true
    "beginner"  -> false      "unsinn"    -> false

`[read]` **NULL, leer und unbekannt fallen alle auf `false`** ?
**ein NOT NULL aendert am Gate NICHTS.**

`[cmd]` **ABER ? und das ist die Vorgabe, die C-541 sucht:**
*„nicht angegeben" ist ein ausdruecklich vorgesehener Zustand.*

    settings/formular.tsx:399
      onClick={() => setze('experience_level', gewaehlt ? '' : stufe)}
      Kommentar: "Ein zweiter Klick nimmt die Angabe zurueck --
                  'nicht angegeben' ist ein gueltiger Zustand."

`[cmd]` **`profile-model.ts:160`
`z.preprocess(leerZuNull, ...)` macht aus `''` ein NULL** ?
**der Ruecknahmeklick schreibt also NULL in die Spalte.**

`[cmd]` **Der CHECK erlaubt es heute ausdruecklich:**
`experience_level IS NULL OR = ANY(...)`.

`[cmd]` **Und der Bestand: 5 von 7 Profilen sind NULL** ? nur
`dev@lumeos.app` und `test-user@lumeos.local` tragen `pro`.

`[read]` **Ein NOT NULL braucht deshalb eine Antwort auf: was
schreibt der Ruecknahmeklick dann?** Ein Vorgabewert
(`'beginner'`) waere eine Aussage ueber die Nutzerin, die sie
gerade zurueckgenommen hat. `[read]` **Fuenf Leser sind
betroffen**, alle behandeln NULL heute als *„nicht angegeben"*:

    regeln-read.ts (Gate), score-read.ts, profile-model.ts,
    profile-write.ts, settings/formular.tsx

### Was mich meine eigene Probe gelehrt hat

`[cmd]` **Die erste Fassung wurde rot ? zu Recht, aber aus dem
falschen Grund:** ein KOMMENTAR in `ansicht.tsx` zitierte die
Kennzeichen woertlich, **und der Entwicklungsbau liefert
Kommentare mit.** `[read]` **Der Suchtext eines Waechters gehoert
nicht in die Datei, die er bewacht.** Kommentar umgeschrieben,
Waechter entfernt Kommentare vor der Suche.

`[cmd]` **Und drei Reiterkennungen waren geraten** (`vorlieben`,
`intelligence`, `cost` fehlte). `[read]` **Ein Reiter, den es
nicht gibt, meldet keinen Fehler ? er meldet einen leeren
Schirm.** Aus `ansicht.tsx` abgelesen.

### Neustart

`[read]` **Nicht noetig** ? nur `apps/web/src`. **Kein
`packages/ui`, keine Umgebung, kein Schema.**

`[cmd]` **`apps/web/.next-g117/` ist mein Messbau** ? **nicht
Toms `.next`.** **Er bleibt bis zur Abnahme liegen**, damit Tom
A1 und A2 selbst nachmisst; danach ist er Geschichte.

`[cmd]` **Tom hat die Regel verallgemeinert:**
`.gitignore:298` traegt `apps/*/.next-*` ? **jeder kuenftige
Messbau faellt darunter**, die bestehende Trennung (`.next` fuer
den Entwicklungsserver, `.next-gate` fuer das Gate) bleibt.
`[cmd]` **Geprueft:** `git check-ignore -v apps/web/.next-g117`
trifft Zeile 298, `git status` ist sauber.

### Selbst nachmessen

`[cmd]` **Der Bau liegt schon da** ? A1/A2 ohne Neubau:

    node tools/_g117-buendel.mjs

**Er misst BEIDES:** den Produktionsbau (Manifest) und den
Browser auf 3200. `[read]` **Austritt 0 = gruen, 1 = rot.**

`[cmd]` **Nur die Bau-Frage, von Hand:**

    cd apps/web
    grep -rl "Plan next cycle" .next-g117/static/chunks/
      -> 5541.*.js        (NICHT app/v2/supplements/page-*.js)

`[cmd]` **Und die Gegenprobe, ob er im Manifest steht:**

    node -e "const m=require('./.next-g117/app-build-manifest.json');
      console.log(m.pages['/v2/supplements/page'].join('\n'))"
      -> zehn JS-Dateien, keine davon 5541

`[cmd]` **Neu bauen, falls noetig** (ca. 90 s):

    cd apps/web && LUMEOS_DIST_DIR=.next-g117 npx next build

### Werkzeuge

    tools/_g117-buendel.mjs   A1-A4, Bau + Browser, Austritt 0/1
    tools/_g117-reiter.mjs    A7, zwoelf Reiter
    __tests__/g117-extended-buendel.test.ts   A6, fuenf Proben

## Abnahme

**2026-09-08, Orchestrator. Am Messbau nachgemessen.**

`[cmd]` **`/v2/supplements/page`: 11 Chunks, *,,Active
protocols"* in EINEM.**

`[cmd]` **Und dieser eine ist die Mockup-Referenz, nicht seine
Arbeit:**

    ReferenzTrenner        JA
    Mockup-Marken          6 von 6
    physician-supervised   JA
    EXTENDED_STACK         nein

`[read]` **Sein `dynamic` und die zwei toten Importe sind
draussen** ? **was bleibt, ist die Stelle, die er gemeldet und
NICHT angefasst hat.**

`[cmd]` **Proben: web 1987/1987, coach 65/65.**

### Messpunkt C beantwortet, und mein Auftrag war schief

> *,,Eine Servergrenze ist NICHT moeglich ?
`tab-extended.tsx` hat vier `useSupp()`-Stellen und Modale, es
muss Client bleiben."*

> *,,`dynamic` war die ganze Zeit das richtige Werkzeug, nur
mit `ssr: true`: das nimmt den Chunk aus dem BUENDEL, ohne den
Serveranstrich wegzunehmen. `ssr: false` nahm beides ? daher
der leere Reiter."*

`[read]` **Ich hatte geschrieben, `dynamic` sei das falsche
Werkzeug** ? **falsch. Falsch war EIN Schalter daran.**

### Drei Wege, nicht einer

> *,,`ansicht.tsx` zog `EXTENDED_STACK` fuer EINE ZAHL (das
Zaehlerchen), und `tabs.tsx` importierte die Liste, ohne sie je
zu benutzen ? ein TOTER Import, der ueber vier immer sichtbare
Reiter ausgeliefert wurde."*

`[read]` **Eine `.length` hat eine PED-Substanzliste ins
Buendel gezogen.** **Das `dynamic` allein haette zwei Wege
offen gelassen.**

### C-541 hat eine Antwort bekommen

> *,,Ein NOT NULL aendert am Gate nichts ? `reichtDerGrad`
faellt bei NULL, leer und unbekannt auf `false`. ABER *nicht
angegeben* ist ein VORGESEHENER Zustand: der zweite Klick in
den Settings schreibt `''`, und `z.preprocess(leerZuNull, ...)`
macht NULL daraus."*

`[read]` **Die Leere ist nicht nur ein Datenfehler** ? **sie
ist ein Knopf.** **C-541 muss entscheiden, was der
Ruecknahmeklick kuenftig schreibt.**

### Eigene Fehler

`[cmd]` **Sein Kommentar zitierte die Waechter-Suchtexte
woertlich ? der Dev-Bau liefert Kommentare mit, die Probe
wurde rot.**

`[cmd]` **Und: es sind ZWOELF andere Reiter, nicht elf** ?
**`prefs`, `intel`, `cost` waren geraten.**

**Abgenommen.**


