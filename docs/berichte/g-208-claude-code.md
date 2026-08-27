# G-208 — Claude Code, 2026-08-27

Auftrag: `docs/auftraege/g-208-claude-code.md`

**Der Wirkstoffkatalog steht. 498 Wirkstoffe, 2.313 FAQ-Antworten,
lesend — und der Unterschied zwischen „begruendet leer" und „nicht
bearbeitet" ist in jeder Kachel zu sehen.**

---

## 1 · Die Zahlen des Auftrags — alle fuenf getroffen

`[cmd]` **Gemessen 2026-08-27 gegen die laufende Instanz**, gezaehlt
nach derselben Regel, die die Anzeige benutzt (Wert > Begruendung >
nichts):

| Feld | Wert | begruendet leer | nicht bearbeitet |
|---|---|---|---|
| `cas_number` | 489 | **9** | 0 |
| `mechanism_of_action` | 494 | **4** | 0 |
| `precautions` | 393 | **4** | **101** |
| `zu_wenig_de` | 458 | **40** | 0 |
| `mythen_de` | 383 | **115** | 0 |

`[cmd]` **`medication_faq`: 2.313 Antworten auf 498 Wirkstoffe**,
3 bis 6 je Wirkstoff, Median 5. **`medication_user_texts`: 498.**
**`medication_reproductive_evidence`: 498.**

**Ich habe keine Abweichung gefunden.** Die 9, die 4, die 105 mit
ihrer Teilung in 4 und 101, die 40 und die 115 stimmen genau.

`[read]` **Eine Praezisierung zur Zaehlweise:** `is not null` haette
falsch gezaehlt. `precautions` ist bei **allen 498** `is not null` —
105 tragen aber `[]`. Dasselbe bei `mechanism_of_action`: 498 mal
`is not null`, vier davon Leerstring. **Wer die Spalte statt ihres
Inhalts zaehlt, misst 0 Luecken.**

---

## 2 · Was gebaut ist

**Reiter „Wirkstoffe" im Medical-Modul**, hinter *Tracking* und vor
*Insights*. `[read]` Die Stelle ist gewaehlt: ein Nachschlagewerk
kommt nach dem eigenen Bestand.

    apps/web/src/lib/medical/wirkstoff-luecke.ts    Die drei Zustaende (serverfrei)
    apps/web/src/lib/medical/wirkstoff-reiter.ts    Die acht Reiter (serverfrei)
    apps/web/src/lib/medical/wirkstoff-read.ts      Der Leseweg
    apps/web/src/app/api/medical/wirkstoff/route.ts Das Detail je Zeile
    apps/web/src/app/v2/medical/tab-wirkstoffe.tsx  Liste und Suche
    apps/web/src/app/v2/medical/wirkstoff-tafel.tsx Die aufklappende Zeile
    apps/web/src/lib/medical/__tests__/wirkstoff-luecke.test.ts   30 Tests

**Uebernommen aus dem Vorbild** (`apps/web/src/lib/supplements/`):
aufklappende Zeile statt Modal, Kachelraster fester Breite,
Reiterleiste, Zeilenklick schliesst wieder, Nachbarzeilen gedaempft,
Detail ueber eine Route nachgeladen.

### Wo das Vorbild NICHT passt — gemessen, nicht vermutet

`[cmd]` **Die Reiter-Wegfallregel aus G-180 greift hier fast nie:**

    Ueberblick       498 / 498       Wechselwirkung   498 / 498
    Einnahme         498 / 498       Rechtslage       498 / 498
    Sicherheit       498 / 498       Fragen           498 / 498
    Schwangerschaft  449 / 498       Mythen           383 / 498

`[read]` **Bei den Supplements variiert, WELCHE Reiter es gibt** — 15
von 412 haben Unterformen, ein fester Satz stuende bei zwei Dritteln
leer. **Hier variiert, was IN einem Reiter fehlt.** Die Regel steht
trotzdem in `wirkstoff-reiter.ts`, fuer die zwei Reiter, bei denen sie
greift.

`[read]` **Und sie ist geschaerft:** ein Reiter erscheint auch, wenn
seine Felder NUR begruendet leer sind. Bei einem Mischpraeparat traegt
die Kachel *„keine einzelne CAS-Nummer"* — **das ist die Auskunft, die
jemand sucht.** Ein weggelassener Reiter haette sie verschwiegen.

### Die Liste kommt mit der Seite, das Detail nicht

`[cmd]` **Gemessen 2026-08-27:** Listenzeilen **83 kB**, deutsche
Nutzertexte **1.145 kB**, FAQ-Antworten **700 kB**. `[read]` **1,8 MB
fuer eine Seite, auf der man einen Wirkstoff aufklappt, waere falsch
herum** — dasselbe Muster wie C-224, nur mit groesserem Abstand.

---

## 3 · Die eigentliche Anforderung: die Luecken sind benannt

`[cmd]` **Die Unterscheidung wird nicht erfunden, sondern gelesen.**
Zwei Spalten tragen sie, in zwei Gestalten:

    evidence_provenance.c292_precautions.missing_reason           OBJEKT
    evidence_provenance.c292_mechanism_of_action.missing_reason   OBJEKT
    evidence_provenance.c292_identifiers[].missing_reason         ARRAY
    null_context.<feld>.reason_status                             OBJEKT

`[cmd]` **Die Gestalt-Falle ist echt:** `c292_identifiers` ist bei
allen 442 ein **Array**, die anderen beiden sind Objekte. **Wer nur
eine Gestalt prueft, verliert die neun Mischpraeparate** — genau die,
um die es geht. Beide Wege stehen in `grundAus()` und sind einzeln
getestet.

`[cmd]` **Es gibt genau fuenf Begruendungscodes im Bestand:**

    MIXTURE_NO_SINGLE_CAS   8   Buprenorphine/Naloxone, Carbidopa/Levodopa,
                                Sennosides USP, Homatropine/Hydrocodone …
    BIOLOGIC_NO_CAS         1   Protamine Hydrochloride
    NOT_FOUND_IN_SOURCES    5   4x precautions, 1x mechanism
    MECHANISM_UNKNOWN       3   mechanism_of_action
    not_supplied          155   mythen_de (115), zu_wenig_de (40)

`[read]` **Jeder bekommt einen deutschen Satz, der die Aussage macht
statt den Code zu wiederholen:** *„Mischpraeparat — fuer eine
Kombination aus mehreren Wirkstoffen gibt es keine einzelne
CAS-Nummer. **Der Datensatz ist vollstaendig.**"*

**Der letzte Halbsatz ist der Punkt.** Bei einem Mischpraeparat FEHLT
die CAS-Nummer nicht, es GIBT keine.

### Drei Formen, nicht zwei

    wert              „103-90-2"           normale Kachel
    begruendet_leer   gruener Rahmen, „✓ GEPRUEFT", der Satz
    nicht_bearbeitet  gestrichelter Rahmen, kursiv „Nicht recherchiert"

`[read]` **Keine eigene Farbe fuer die Zustaende.** Die Ordnung aus
G-196 gilt: Farbe bedeutet Gefahr, Wirkung, Pruefen oder Entwarnung.
Der Unterschied liegt in Rahmen, Schrift und Wortlaut.

`[read]` **Und bei `precautions` steht zusaetzlich ein Satz**, weil
dort die 101 sitzen: *„Fuer diesen Wirkstoff wurden keine
Vorsichtsmassnahmen recherchiert. **Das heisst nicht, dass es keine
gibt.**"* — nicht *„keine bekannt"*. Das waere eine Aussage ueber den
Wirkstoff; hier ist es eine ueber die Recherche.

`[read]` **Dazu je Reiter eine Bilanzzeile** — *„2 von 3 Feldern
gefuellt · 1 begruendet leer"*. Dieselbe Linie wie *„5 von 7 Markern"*
beim Health score (G-135): wer wissen will, wie belastbar ein
Datensatz ist, soll es nicht aus acht Kacheln zusammenrechnen muessen.

---

## 4 · `drug_class` ist weggelassen — und es ist schlimmer als C-296

**Auftrag: *„Wenn du die Klasse zeigst, zeig sie als das, was sie ist
— ein Feld mit bekannten Fehlern. Oder lass sie in dieser Runde weg
und sag es."***

**Ich lasse sie weg, und hier ist der Grund.**

`[cmd]` **Gemessen 2026-08-27: die Spalte fuehrt fallverdoppelte
Tags.** Nicht nur falsche — doppelte, in zwei Schreibweisen
nebeneinander:

    MAOI 15   und   maoi 15
    SSRI 10   und   ssri 10
    anticoagulant:doac 8   und   anticoagulant_doac 7

`[cmd]` **Damit tragen 15 Wirkstoffe `maoi`, nicht neun** — C-296
nennt neun Antidepressiva, gezaehlt habe ich 15 Traeger. **Und sechs
davon sind SSRI**, die gleichzeitig beides tragen:

    Escitalopram   {SSRI, MAOI, maoi, ssri}
    Citalopram     {SSRI, MAOI, maoi, ssri}
    Paroxetin      {SSRI, MAOI, maoi, ssri}
    Fluvoxamin     {SSRI, MAOI, maoi, ssri}
    Vilazodon      {SSRI, MAOI, maoi, ssri}
    Vortioxetin    {SSRI, MAOI, maoi, ssri}

`[read]` **Ein Feld, das denselben Stoff zugleich als SSRI und als
MAO-Hemmer fuehrt, ist nicht fehlerbehaftet, sondern unbrauchbar** —
und die Verwechslung ist klinisch die gefaehrlichste, die es zwischen
Antidepressiva gibt (Serotoninsyndrom). **Als „fehlerbehaftetes Feld"
zu zeigen hiesse, dem Leser die Entscheidung zu ueberlassen, welche
der beiden Angaben stimmt.**

`[cmd]` **Ein Test haelt die Entscheidung fest** — `drug_class` darf
in keiner der drei neuen Anzeigedateien vorkommen, bis C-296 durch
ist.

---

## 5 · Zwei Fallen, die ich beim Bauen selbst gestellt habe

### `atc_code` ist Text mit JSON darin

`[cmd]` **419 von 497 tragen einen JSON-Array als Zeichenkette**:
`["J05AF", "J05AR"]`. **78 tragen einen glatten Code** (`A10BA02`).

`[read]` **Ungefiltert stuende `["B02AA"]` woertlich in der Kachel** —
mit Klammern und Anfuehrungszeichen. **Das ist G-191 noch einmal:**
dort landete ein Objekt als Zeichenkette in der Dosiskachel.
`atcCodes()` holt sie heraus; **was sich nicht zerlegen laesst, wird
als Rohtext gezeigt, nicht verschluckt.**

### Ein Satz ist keine Zahl

`[cmd]` **Das erste Bildschirmfoto zeigte es:** der englische
Wirkmechanismus stand in **18-px-Fettschrift** und sprengte die
Kachel. Die Wertform ist fuer `N04BA` und `103-90-2` gebaut.

`[cmd]` **Gemessen, warum eine feste Grenze genuegt:** `cas_number`
max 13 Zeichen, verketteter ATC max 47, `mechanism_of_action` Median
151 / max 300. **Zwischen 47 und 151 liegt die Grenze breit** — 40
trennt sauber. `KURZ_GRENZE` in `wirkstoff-luecke.ts`.

### Und eine dritte, die der Build gefunden hat

`[cmd]` **Der erste Bauversuch brach ab** — A-30:
`wirkstoff-tafel.tsx` ist `'use client'` und importierte
`risikoLabel` als **Wert** aus dem Leseweg. Damit zog es
`createSessionClient` und `next/headers` ins Browserbuendel.

    Import trace for requested module:
    ../../packages/shared/src/supabase/session.ts
    ./src/lib/medical/wirkstoff-read.ts
    ./src/app/v2/medical/wirkstoff-tafel.tsx

`[read]` **Der Typecheck sah es nicht** — er kennt keine
Buendelgrenzen. **Die Warnung stand im Kopf von
`substanz-luecken.ts`, und ich habe die Falle trotzdem gebaut.**
`risikoLabel` liegt jetzt in der serverfreien Datei; aus
`wirkstoff-read` kommen nur noch Typen.

---

## 6 · NACHWEIS

| | |
|---|---|
| Wirkstoffe in der Liste | **498** (Soll 498) |
| mit Text | **498** (Soll 498) |
| FAQ-Antworten sichtbar | **2.313** auf 498 Wirkstoffe (Soll 2.313) |
| begruendet leer, gekennzeichnet | CAS **9** · mechanism **4** · precautions **4** · zu_wenig **40** · mythen **115** |
| nicht bearbeitet, gekennzeichnet | precautions **101** — sonst 0 |
| Attrappen im neuen Code | **0** (Soll 0). Medical-Modul unveraendert 17 |
| Ladezeit | **1.874 ms kalt / 1.483 ms warm**, Server war warm |
| Bildschirmfoto | `backup/g208-wirkstoffe.png`, `-begruendet-leer.png`, `-nicht-bearbeitet.png`, `-negativprobe.png` |

`[cmd]` **Die langsamste Anfrage ist beide Male das Dokument selbst**
(556 ms kalt / 314 ms warm), 16 Anfragen, eine ueber 300 ms.
**Konsolenfehler: 1** — die bekannte `data-mode`-Hydrationswarnung des
Rahmens, nicht aus diesem Auftrag.

### Die Zustaende im DOM gegengelesen, nicht nur fotografiert

`[cmd]` `data-zustand` je Kachel ausgelesen:

    Carbidopa / Levodopa   [begruendet_leer] CAS-Nummer · geprueft · Mischpraeparat…
                           [wert] ATC-Code N04BA
                           [wert] Wirkmechanismus …
                           BILANZ: „2 von 3 Feldern gefuellt · 1 begruendet leer"

    Acetaminophen          [nicht_bearbeitet] Vorsichtsmassnahmen · Nicht recherchiert
    / Sicherheit           [wert] Bei zu viel …
                           [wert] Bei zu wenig …
                           BILANZ: „2 von 3 Feldern gefuellt · 1 nicht recherchiert"

### Gates

    Tests            671 pass / 0 fail   (30 davon neu, G-208)
    Typecheck        gruen
    Build            31/31 Routen
    serverimport     51 Client-Chunks, 0 Treffer
    verdrahtung      kein unbewachter Zuwachs (38 → 42 bewachte Namen)
    encoding         20.182 Dateien sauber

`[cmd]` **Der Verdrahtungswaechter aus G-197 hat gearbeitet:** er
meldete die vier neuen Tabellennamen als *„NEU verdrahtet und in
keinem Test"*. **Sie stehen jetzt in einem Test, nicht auf der
Bestandsliste.**

---

## 7 · NEGATIVPROBE

**Auftrag: *„einem Wirkstoff testweise den Text entziehen — die
Ansicht muss es benennen, nicht leer bleiben."***

`[cmd]` **Acetaminophen, `cas_number` entfernt.** Die Kachel wechselte
von

    [wert] CAS-Nummer 103-90-2

zu

    [nicht_bearbeitet] CAS-Nummer · Nicht recherchiert

`[read]` **Und sie wurde NICHT „begruendet leer".** Acetaminophen hat
keinen `missing_reason` — **die Ansicht hat sich geweigert, eine
Begruendung zu erfinden.** Das ist die Unterscheidung in beide
Richtungen, nicht nur in eine.

`[cmd]` **Der zweite Teil ging nicht, und das ist selbst ein Befund:**
`zu_viel_de` liess sich nicht leeren —

    ERROR: null value in column "zu_viel_de" violates not-null constraint

**Die deutschen Textspalten sind NOT NULL.** Ein fehlender Text kann
dort gar nicht entstehen; die Luecke ist nur ueber `null_context`
moeglich, und die wird gelesen.

**Rueckbau, gezaehlt:**

    Zeilen user_texts   498 → 498   GLEICH
    Zeilen substances   498 → 498   GLEICH
    Pruefsumme Texte    md5          GLEICH
    Pruefsumme CAS      md5          GLEICH
    zu_viel_de-Laenge   366 → 366
    cas_number          103-90-2 → 103-90-2

`[read]` **Die Originalwerte lagen in einer Sicherungstabelle**, nicht
in einer Python-Zeichenkette: der Text traegt Anfuehrungszeichen und
Umlaute, und ein Rueckbau ueber Verkettung waere genau die Stelle, an
der er schiefgeht. Die Tabelle ist geloescht.

---

## 8 · Was NICHT getan wurde

**Kein Erfassungsweg.** `medical.user_medications` ist nicht angefasst
— weder gelesen noch geschrieben. `[read]` **In der Tafel steht dort,
wo im Vorbild *„Zum Stack hinzufuegen"* sitzt, kein Knopf.** Ein
Knopf, der nichts tut, waere schlechter als keiner (G-182: *„quellen
haben keine funktion"*). Das ist C-302.

**Keine Tabelle angelegt.** `supabase/_pipeline/` nicht angefasst.

**Nicht committet, nicht gestaged, nicht gepusht.**

---

## 9 · Was mir aufgefallen ist und nicht in den Auftrag gehoerte

**1. `drug_class` ist doppelt kaputt, nicht nur falsch** — siehe
Abschnitt 4. **C-296 unterschaetzt es:** 15 Traeger statt neun, und
die Fallverdopplung macht jede Auswertung ueber die Spalte
unbrauchbar, nicht nur ungenau. `[read]` **Eine Bereinigung muss beide
Schreibweisen zusammenfuehren, nicht nur die neun Tags korrigieren.**

**2. `mythen_de` hat drei Gestalten in einer Spalte.** `[cmd]`
Gemessen: **Zeichenkette 260, Array 123** (120 mit einem Eintrag, 3
mit zweien), **null 115**. `[read]` Wer nur `Array.isArray` prueft,
verliert 260 von 383; wer nur `String(v)` nimmt, zeigt bei 123 das
Literal `["Mythos: …"]`. **Die Anzeige faengt beides ab** —
`mythenAus()`. **Sauberer waere eine Gestalt in der Pipeline.**

**3. `atc_code` sollte kein Text sein.** `[cmd]` 419 von 497 tragen
JSON in einer `text`-Spalte. `[read]` Das ist heute abgefangen, aber
die naechste Anzeige faellt wieder darauf herein. **Ein `text[]` oder
`jsonb` waere ehrlicher.**

**4. `medication_reproductive_evidence` ist reich und unangetastet.**
`[cmd]` `pregnancy` bei 351 von 498 gefuellt, `missing_pregnancy_
lactation` bei **496** — der Bestand sagt selbst, was das Etikett
nicht berichtet. **Der Reiter zeigt `state` und die Zusammenfassung**;
die restlichen Felder (`pregnancy_human_data`, `clinical_
considerations`) liegen ungenutzt. **Sie sind englisch** — das ist der
Grund, warum ich sie nicht in den Vordergrund gestellt habe.

**5. Der `Wirkmechanismus` ist englisch, bei allen 494.** `[read]`
`pharmacology->>'mechanism_of_action'` hat kein deutsches Gegenstueck.
Die Kachel zeigt ihn, weil er mehr sagt als nichts — **aber er ist der
einzige englische Text auf einem sonst durchgaengig deutschen Reiter.**

**6. Der Dev-Server:** wie im Auftrag gesagt, ohne Untersuchung neu
gestartet. `[cmd]` Beim Statuslauf 1.318 MB RSS, Antwort in 1,1 s —
G-205.
