---
nr: G-283
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-228
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 33a526a3
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/diary-entwurf.tsx
zahlen:
  gemessen: 2026-08-31
  profile_pro: 2
  profile_null: 5
  rueckfallwert: 0.90
---

# G-283 — ein `pro`-Profil faellt still auf 0,90

## Befund

Aus G-226, Claude Code, 2026-08-31.

    SPEC_04:336                beginner | intermediate | advanced | elite
    profiles.experience_level  beginner | advanced | pro | elite  (CHECK)
    live                       2x 'pro', 5x NULL
    diary-entwurf.tsx:31       die vier Namen der Spec, `?? 0.90`

`[read]` **Die Spec kennt `intermediate`, die Datenbank kennt `pro`,
und keine kennt die andere.**

`[cmd]` **Der Code prueft gegen die Spec-Namen und faellt sonst auf
`?? 0.90`** — **den Wert, der fuer `intermediate` gedacht war.**

`[read]` **Ein `pro`-Nutzer bekommt also den Faktor einer Stufe, die
er nicht hat** — **ohne Fehler, ohne Meldung, ohne dass es jemandem
auffaellt.**

## Warum `hoch`

`[cmd]` **Zwei von sieben Profilen stehen auf `pro`.** `[read]` **Bei
den fuenf mit `NULL` ist der Rueckfall richtig; bei den zwei
anderen ist er eine falsche Antwort auf eine gestellte Frage.**

`[read]` **Und es ist dieselbe Klasse wie der stille Rueckfall in
A-60:** kein Absturz, keine Meldung, nur ein falscher Wert.

## Was zu tun ist

`[read]` **Der Rueckfall muss sagen, dass er greift** — **oder die
Namen muessen zusammenpassen.**

`[read]` **Welche vier Namen gelten, ist G-228 und gehoert Tom.**
**Dass ein unbekannter Name nicht stillschweigend zu 0,90 wird, ist
dieser Punkt.**

## Auftrag — drei Befunde aus G-226

**Mitbeauftragt: G-284, G-285.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-08-31.**

### 1 · G-283 — der stille Rueckfall

`[cmd]` **Zwei von sieben Profilen stehen auf `pro`, der Code kennt
den Namen nicht und faellt auf 0,90.**

`[read]` **Welche vier Namen gelten, ist G-228 und gehoert Tom.**
**Dass ein unbekannter Name nicht stillschweigend zu einem Faktor
wird, ist dieser Punkt.**

`[read]` **Dieselbe Klasse wie A-60: kein Absturz, keine Meldung, nur
ein falscher Wert.** **Und du hast dort die Loesung gebaut — einen
Waechter auf die Signatur.**

### 2 · G-284 — die Mockups sind oeffentlich

`[cmd]` **94 Dateien, 592 kB, ohne Anmeldung ausgeliefert.**
`[cmd]` **`/mockup/index.html` ist ein lauffaehiges zweites Produkt.**

`[read]` **A-16 sagt: archivieren, nicht loeschen.** **Die Frage ist
nur, wohin** — **`public/` geht in den Build.**

### 3 · G-285 — der dreimal berichtigte Kommentar

`[cmd]` **`page.tsx:46` nennt `display_tier` weiter *,,das
Abo-Gate"*.** `[cmd]` **G-140, G-239 und G-235 haben es dreimal
geklaert.**

`[read]` **Berichtigen und sichern** — **G-173 hat gezeigt, dass eine
Korrektur ohne Waechter still zurueckkippt.**

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.** **Codex fasst ihn nicht
an.**

### Nachweis

    Rueckfall               meldet er sich? gebaut
    pro-Profil              was zeigt es jetzt
    Mockups                 nicht mehr oeffentlich, Fundus erhalten
    display_tier            berichtigt und gesichert
    Attrappen               am Schirm, vorher / nachher

## Bericht

**Claude Code, 2026-08-31.** Mitbeauftragt: G-284, G-285. Nichts auf
`dev@lumeos.app`, nichts committet, nichts gestaged.

### 1 · G-283 — der stille Rueckfall ist raus

`[cmd]` **Die Praemisse haelt:** `public.profiles.experience_level`
traegt den CHECK `beginner | advanced | pro | elite`, live **2x
`pro`, 5x NULL**. `[cmd]` **`LEVEL_MULT` kannte `intermediate` und
nicht `pro`**, und `?? 0.90` gab `pro` den Faktor von `intermediate`.

**Eine Praezisierung, die den Schaden heute begrenzt:** `[cmd]`
**die einzige Aufrufstelle setzt `level` fest auf `'advanced'`**
(`diary-entwurf.tsx:127`) — **kein `pro`-Nutzer erreicht die Rechnung
heute.** `[read]` **Die Falle war scharf, aber nicht ausgeloest.**
Das aendert die Dringlichkeit, nicht den Befund: die Funktion ist
exportiert, und wer sie an ein Profil haengt, bekommt den falschen
Wert ohne Warnung.

**Und ein zweiter Fund an derselben Kachel:** `[cmd]` sie sagte
*„Source of level: Auth · experience_level"* — **und las nie ein
Profil.** `[read]` **Ein Satz, der eine Quelle nennt, die nicht
benutzt wird, ist eine Falschaussage** (A-62). **Berichtigt auf
*„fest im Entwurf · liest kein Profil"*.**

**Gebaut:**

    LEVEL_MULT    beginner 0,75 · advanced 1,00 · elite 1,10
                  pro: null   <- der Name gilt, der Faktor ist offen
                  `intermediate` ist raus (die DB kennt sie nicht)
    stufenFaktor  gibt `number | null`, nie einen Ersatzwert
    stufeGilt     trennt „unbekannt" von „bekannt, aber offen"
    nutritionScore gibt `number | null` — ohne Faktor kein Score

`[read]` **Welche Faktoren gelten, ist G-228 und gehoert Tom.**
`[read]` **`pro` bekommt deshalb `null` statt einer geratenen Zahl —
ein geratener Wert saehe aus wie eine Antwort.**

`[read]` **Drei Faelle, drei Texte:** eine Zahl; *„offen (G-228)"* fuer
eine bekannte Stufe ohne Faktor; *„unbekannt"* fuer einen Namen, den
die Tabelle nicht kennt. **Ein unbekannter Name darf G-228 nicht
zitieren** — er hat damit nichts zu tun.

`[cmd]` **Am Schirm gegengeprobt** (`level` je Probe umgestellt,
Rueckbau byte-gleich):

    advanced      Ring, „advanced · ×1"
    pro           kein Ring, „pro · offen (G-228)",
                  „Für diese Erfahrungsstufe ist kein Faktor
                   hinterlegt — der Score bleibt offen…"
    gibtsnicht    kein Ring, „gibtsnicht · unbekannt",
                  „Unbekannte Erfahrungsstufe — der Score wird nicht
                   berechnet, statt einen Faktor zu raten."

`[read]` **Ein Ring auf 0 waere eine Aussage ueber den Nutzer
gewesen, die niemand gemacht hat.**

### 2 · G-284 — die Mockups sind nicht mehr oeffentlich

`[cmd]` **Vorher, ohne Anmeldung:** `/mockup/index.html` **HTTP 200,
22 kB**; `/mockup/tokens.css` 200; `MicroDashboard.js` 200.

`[cmd]` **Nachher, ohne Anmeldung:** **alle drei HTTP 404.**
`[cmd]` **Und das echte Produkt antwortet weiter:** `/login` 200,
`/v2/nutrition` 200.

**Verschoben, nicht geloescht** (A-16):

    von   apps/web/public/mockup/            94 Dateien, 592 kB
    nach  docs/spezifikation/10-plattform/
            design-system/mockup-zwischenwurf/

`[read]` **Neben `theme-v1`, weil es dasselbe ist:** eine Ideenquelle
im Entwurfsordner. **`public/` ist danach leer** — es enthielt nichts
ausser dem Mockup.

`[cmd]` **Nichts bricht:** vier Quelldateien nennen den Pfad, **alle
vier als Kommentar `QUELLE:`**, kein Import. Sie sind mitgezogen.

`[cmd]` **Der Umzug hat den Gate rot gemacht, und das war mein
Fehler:** zehn `beruehrt.dateien`-Angaben in Punktdateien zeigten auf
den alten Pfad. `[read]` **Ein roter Gate ist schlimmer als der
Befund, den er meldet** — **sieben Punktdateien nachgezogen, Gate
wieder gruen.**

### 3 · G-285 — berichtigt und gesichert

`[cmd]` **`page.tsx:46` nannte `display_tier` weiter *„das
Abo-Gate"*.** `[cmd]` **G-235 hat es am 2026-08-31 gemessen:**

    Stufe 1   31 Codes   ALC, CA, CHO, CHORL, ENERCC
    Stufe 2   47 Codes   AAE9, ASH, BIOT, CARTB, CHOCAL
    Stufe 3   60 Codes   ACEAC, ALA, ARG, ASP, CAROTPAXB

`[read]` **Stufe 1 sind Alltagswerte, Stufe 3 Aminosaeuren und
Carotinoide** — Anzeigetiefe. `[cmd]` **Ein Abo-Tier gibt es im
Schema `nutrition` nicht.**

**Berichtigt mit der Messung, und ein Waechter haelt die Stelle** —
G-173 hat gezeigt, dass eine Korrektur ohne Waechter still
zurueckkippt.

### Nachweis

    Rueckfall     meldet sich: `null` statt 0,90, mit zwei
                  unterschiedlichen Saetzen je Fall
    pro-Profil    zeigt „pro · offen (G-228)" und den Grund,
                  keinen Score — am Schirm gegengeprobt
    Mockups       nicht mehr oeffentlich (3x 404 ohne Anmeldung),
                  Fundus erhalten (94 Dateien am neuen Ort)
    display_tier  berichtigt und bewacht
    Attrappen     Tagebuch 1 vorher, 1 nachher — die Score-Kachel
                  bleibt Attrappe (E-25 blockiert, C-49), nur ihr
                  Rueckfall ist ehrlich geworden

`backup/g283-soll-karte.png`, `backup/g283-probe-pro.png`,
`backup/g283-probe-gibtsnicht.png`.

### Waechter und Sabotageprobe

**Neu:** `apps/web/src/lib/nutrition/__tests__/stufenfaktor.test.ts`
(8 Waechter).

**Acht Sabotagen, jede einzeln, Rueckbau je byte-gleich (SHA-256) —
alle acht fallen:**

    G-283  den stillen Rueckfall auf 0,90 zurueckbauen
    G-283  `pro` einen geratenen Faktor geben
    G-283  `intermediate` wieder aufnehmen
    G-283  `pro` ganz aus der Tabelle nehmen
    G-283  die Kachel wieder eine Quelle behaupten lassen
    G-283  offen und unbekannt gleich beschriften
    G-284  das Mockup zurueck nach public/ legen
    G-285  display_tier wieder das Abo-Gate nennen

`[cmd]` **Drei eigene Fehler, von der Probe gefangen:**

**a) Ein Waechter fiel an der eigenen Korrektur.** Die G-285-Pruefung
suchte `/das Abo-Gate/` — **und die Berichtigung ZITIERT den alten
Wortlaut.** `[read]` **G-186 zum vierten Mal.** Behoben: auf die
BEHAUPTUNG pruefen (`display_tier ist das Abo-Gate`), nicht auf die
Zeichen.

**b) Zweimal `git ls-files` statt der Platte.** Der `public/`-Waechter
und der Archiv-Waechter fragten den Index — **die Ordner-Sabotage
ueberlebte**, weil ein zurueckkopierter Ordner ungetrackt ist.
`[read]` **Next.js liefert aus, was auf der Platte liegt, nicht was
git kennt.** **Derselbe Fehler wie in A-29.** Behoben: beide lesen
jetzt das Dateisystem.

`[read]` **Der zweite Fall hat nebenbei etwas gezeigt:** die 94
verschobenen Dateien sind **ungetrackt** — der `git mv` hat sie
bewegt, die Indexaenderung ist weg. **Sie liegen vollstaendig am
neuen Ort; wer sie committet, muss sie aufnehmen.**

### Laeufe

    pnpm --filter @lumeos/web test    1080 pass, 0 fail (vorher 1072)
    turbo typecheck                    gruen
    pnpm gate                          11/11 Tasks gruen
    [punkte]                           25 Befunde, Sollstand
    [encoding]                         20.480 Dateien sauber

### Dateien

    apps/web/src/app/v2/nutrition/diary-entwurf.tsx        G-283
    apps/web/src/app/v2/nutrition/page.tsx                 G-285
    apps/web/src/lib/nutrition/__tests__/
      stufenfaktor.test.ts                                   neu
    apps/web/public/mockup/  ->  docs/spezifikation/
      10-plattform/design-system/mockup-zwischenwurf/   94 Dateien
    7 Punktdateien + 4 Quellkommentare      Pfad nachgezogen
    backup/g283-*.png                                  Nachweis

## Abnahme

**2026-08-31, Orchestrator.**

`[cmd]` **Der stille Rueckfall ist weg.** `[cmd]` **`LEVEL_MULT`
traegt jetzt die Datenbanknamen — `beginner`, `advanced`, `elite` —
und `pro` bekommt `null` statt eines geratenen Faktors.**

`[read]` **Und die Praemisse hat er praezisiert, statt sie zu
bestaetigen:** `[cmd]` **der einzige Aufrufer setzt `'advanced'`
fest** — **kein `pro`-Nutzer erreicht die Rechnung heute.**

`[read]` **Die Falle war gespannt, nicht ausgeloest.** **Das aendert
die Dringlichkeit, nicht den Befund** — die Funktion ist exportiert.

### Drei Faelle, drei Texte

    eine Zahl              wenn ein Faktor da ist
    "offen (G-228)"        bekannte Stufe ohne Faktor
    "unbekannt"            Name, den die Tabelle nicht kennt

`[read]` **Und die Unterscheidung ist die richtige:** *,,ein
unbekannter Name darf G-228 nicht zitieren, er hat damit nichts zu
tun."*

`[cmd]` **`nutritionScore` liefert `number | null`** — **ohne Faktor
kein Score.**

`[cmd]` **Zweiter Befund an derselben Karte:** sie behauptete
*,,Source of level: Auth · experience_level"* — **und las nie ein
Profil.** **Berichtigt auf *,,fest im Entwurf · liest kein Profil"*.**

### G-284 — nicht mehr oeffentlich

`[cmd]` **Alle drei Mockup-Pfade: 200 auf 404 ohne Anmeldung.**
`[cmd]` **`/login` und `/v2/nutrition` antworten weiter 200.**

`[cmd]` **94 Dateien, 592 kB, jetzt unter
`docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf/`**
— **neben `theme-v1`, wie A-16 es verlangt: archivieren, nicht
loeschen.**

`[cmd]` **Die vier Quellverweise sind `QUELLE:`-Kommentare, keine
Importe** — nichts bricht.

`[read]` **Und er meldet, dass sein Verschieben den Gate rot gemacht
hat:** zehn `beruehrt.dateien`-Eintraege zeigten auf den alten Pfad,
sieben Punktdateien nachgezogen.

### G-285 — berichtigt und gesichert

`[cmd]` **Mit G-235s Messung statt der Behauptung.**

### Und vier Mal derselbe eigene Fehler

`[cmd]` **Zweimal `git ls-files`, wo das Dateisystem die Wahrheit
ist** — **Next.js liefert aus, was auf der Platte liegt, nicht was
git kennt.** `[cmd]` **Dieselbe Verwechslung wie in A-29.**

`[read]` **Er nennt es beim Namen: *,,vier Vorkommen, nicht durch
Aufmerksamkeit vermeidbar"*** — **und hat es als Regel abgelegt.**

`[cmd]` 8 Sabotagen, 1080 Tests, Gate 11/11.

**Abgenommen.**

