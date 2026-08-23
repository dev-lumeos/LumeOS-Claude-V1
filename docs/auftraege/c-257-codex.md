# C-257 — Codex, 2026-08-23

Bericht: `docs/berichte/c-257-codex.md`

**Der grosse Nachtlauf.** Tom, 2026-08-23: *„alle machen, hat die ganze
nacht zeit."*

**Anforderung lesen, bevor du anfaengst:**
`docs/spezifikation/substanz-katalog-nutzertexte.md` — dort stehen die
Schreibregeln (§6), die Grenze *Fakt ja, Anweisung nein* (§2) und wer
das liest (§3). **Dieser Auftrag wiederholt sie nicht.**

`[cmd]` **Kimi ist nicht verfuegbar. Du machst die Recherche selbst.**

---

## KORREKTURBLOCK, nachgereicht 2026-08-23 — C-244 ist entschieden

**Tom: „c244 magnesium" — der Sammelname gewinnt.** Der Nutzer waehlt
*Magnesium*, nicht *Magnesiumglycinat*. Die Salzformen werden
**Unterformen**, keine eigenen Katalogeintraege.

`[cmd]` **Die Eltern-Kind-Spalte gibt es noch nicht** —
`supplements.supplements` hat 0 Spalten `parent_id` oder
`parent_supplement_id`.

`[cmd]` **Betroffen sind 15 der 28 Sammelnamen:** Magnesium (7 Formen)
· Whey Protein, Zinc (je 3) · Caffeine, Calcium, Iron, Vitamin B12
(je 2) · Collagen, Lion's Mane, Tongkat Ali, Vitamin A, B6, C, D3, E
(je 1). **Die uebrigen 13 haben keine Form darunter** und bleiben
einzelne Eintraege.

**Was das fuer diesen Auftrag heisst:**

**Der Text gehoert an den Sammelnamen**, nicht an jede Salzform. *Was
ist Magnesium, wofuer, was bei zu viel* schreibst du einmal. **Was die
Formen unterscheidet** — Bioverfuegbarkeit, Vertraeglichkeit — gehoert
in ein eigenes kurzes Feld an der Form, nicht in neun Wiederholungen.

`[read]` **Und dort steckt die Frage, die du melden musst:** woher
bekommt *„Magnesium"* seinen Evidenzgrad und seinen Dosisbereich, wenn
die sieben Salze sich unterscheiden? **Waehle nicht still eine Form
aus.** Entweder du findest eine belegte Sammelaussage, oder du meldest,
dass es keine gibt.

`[read]` **Die Sichtbarkeit dreht sich um.** `[cmd]` Heute tragen die
Kimi-Formen den Inhalt und die Sammelnamen sind leer, also ueber
`im_katalog` verborgen. **Nach der Entscheidung ist es umgekehrt.**
Sobald der Sammelname eine Beschreibung bekommt, erscheint er von
selbst — **aber die Formen verschwinden nicht automatisch.** Wie sie
unter den Sammelnamen ruecken, ist Teil deines Berichts.

**Reihenfolge bleibt** (Supplements, Peptide, Enhanced) — **aber nimm
die 15 Sammelnamen im ersten Durchgang mit**, damit die Struktur steht,
bevor 200 Texte daran haengen.

`[read]` **Loest zugleich C-256:** `testdaten-einspielen` joint auf
`supplement_catalog.slug`. Traegt die Sammelnamen-Ebene dieselben
sprechenden Slugs (`magnesium`, `creatine-monohydrate`), geht der Join
wieder auf. **Pruef das und melde es** — dann ist der Testdaten-Schritt
wieder lauffaehig und Schritt 5 nicht mehr blockiert.

---


## WAS ICH GEMESSEN HABE — live, 2026-08-23

`[cmd]` **290 sichtbar** (`im_katalog`), 276 verborgen. Gruppen:
`supplement` 154 · `enhanced` 75 · `peptide` 61.

`[cmd]` Inhaltsstand der 290:

    Beschreibung                      290  - aber alle Fachnotizen
    davon wortgleich mit summary_en    125
    evidence.overall_grade            290
    wada_status                       290
    common_side_effects_en            178
    doctor_consult_flags              128
    studied_dose_ranges                83
    upper_limit                        38
    usage_hint_en                      19
    guideline_dose                      0

`[cmd]` **Beispiel Whey protein isolate** (`sub_43b1e64b52`):
*„Low-lactose/fast; same MPS evidence base as whey class."* — und
derselbe Satz noch einmal in `evidence.summary_en`.

`[cmd]` **Beispiel Bromocriptine** (`sub_b30d752d32`): `dosing.status`
= `unbekannt`, alle Dosisfelder leer; `safety.status` = `unbekannt`.
**Nur `warnings` traegt zwei echte Saetze.**

`[cmd]` **Alias-Dubletten:** 527 Substanzen mit zusammen **598
ueberfluessigen Zeilen**. Whey traegt vier Chips, die praktisch
denselben Namen zeigen.

---

## TEIL 1 — Schema

### 1.1 Neue Textspalten an `supplements.supplements`

Je Feld dreisprachig `_de` / `_en` / `_th`. **Deutsch ist die
Quellsprache.**

    kurz_was        ein Satz, ohne Fachwort, <= 140 Zeichen
    wofuer          2-4 Stichpunkte, je <= 60 Zeichen
    wie_wirkt       2-3 Saetze, Alltagssprache
    was_bringt_es   2-4 Saetze, MIT Groessenordnung
    zu_viel         1-3 Saetze, konkret
    zu_wenig        1-2 Saetze - LEER, wo es kein Mangelbild gibt
    wann_wie        1-2 Saetze: Zeitpunkt, mit/ohne Essen, womit nicht
    wer_nicht       Stichpunkte
    mythen          1-2 Saetze, wo es welche gibt

`[read]` **Ob das Spalten an `supplements` werden oder eine eigene
Tabelle `supplement_texte`, entscheidest du und begruendest es.**
27 Spalten an der Haupttabelle sind viel; eine 1:1-Tabelle ist ein
Join mehr. **Miss, was die bestehenden Lesepfade guenstiger macht.**

### 1.2 Alltagsfragen — `supplement_faq`

    supplement_id, frage_de/_en/_th, antwort_de/_en/_th, sort_order

`[read]` **Substanzfragen, keine Produktfragen.** *„Macht es
Haarausfall?"* und *„Wie lange dauert es, bis es wirkt?"* gehoeren
hierher. *„Wie schmeckt diese Dose?"* nicht. **Faustregel: gilt die
Antwort fuer jede Dose desselben Stoffs, ist sie eine Substanzfrage.**

`[read]` **Recherchier die Fragen mit, nicht nur die Antworten.** Was
tatsaechlich gefragt wird, steht in Foren, Q&A-Bereichen von Haendlern
und Suchvorschlaegen. Bei Kreatin geht es um Wassereinlagerung und
Wirkeintritt, bei SARMs um Nachweisbarkeit und Produktreinheit.

**3-6 Fragen je Substanz**, haeufigste zuerst.

### 1.3 Grad je Zweck — `supplement_tags` erweitern

**Tom, A: ja.** `[cmd]` **Es ist noch nicht drin, entgegen der
Vermutung:** `supplement_categories` (23) traegt Stoffklassen
(`vitamine`, `sarm`, `orale_aas`), keine Zwecke.
`supplement_tags` und `supplement_tag_definitions` sind **beide leer**.

`[read]` **Keine neue Tabelle noetig.** `supplement_tags` hat schon
`supplement_id`, `tag_code`, `confidence`. **Ergaenze `evidence_grade`
je Zeile** und lege in `supplement_tag_definitions` Zwecke mit
`tag_type = 'zweck'` an.

Ziel: **Kreatin traegt `muskelaufbau: A` und `kognition: B`** statt
eines einzelnen Buchstabens.

`[read]` **`evidence.overall_grade` bleibt** als Gesamteinschaetzung —
die Zweck-Grade treten daneben, nicht an die Stelle. **Wenn du beim
Befuellen merkst, dass der Gesamtgrad dadurch sinnlos wird: melden.**

### 1.4 Nebenbefund, den du mitnehmen sollst

`[cmd]` **`supplement_portions` existiert und ist leer** — `amount`,
`unit`, `is_default`, an der Substanz.

`[read]` **Eine uebliche Portion je Substanz ist eine Substanzangabe**
(5 g Kreatin) und kollidiert nicht mit den Anbietern. Was denen
gehoert, ist Packungsgroesse und Preis. **Fuell die Standardportion
mit, wo sie belegt ist.**

`[cmd]` **Und die 598 Alias-Dubletten** (527 Substanzen): Whey zeigt
vier Chips mit praktisch demselben Namen. **Falte sie zusammen** —
gleicher Name nach Kleinschreibung und Entfernen von Sonderzeichen ist
eine Dublette.

---

## TEIL 2 — Befuellung, in dieser Reihenfolge

**Tom, B:** *„alle zuerst supplements dann peptides dann enhanced."*

    Durchgang 1   supplement   154 Substanzen
    Durchgang 2   peptide       61
    Durchgang 3   enhanced      75

`[read]` **Nach jedem Durchgang ein Zwischenstand im Bericht** — Zahl
der befuellten Felder je Gruppe. Wenn der erste Durchgang zeigt, dass
die Vorgabe nicht traegt, ist es besser, das nach 154 zu merken als
nach 290.

### 2.1 Supplements — der einfachste Fall

Handelsuebliche Gliederung, belastbarer Inhalt. **Die erste Zeile
entscheidet:**

    NICHT   Low-lactose/fast; same MPS evidence base as whey class.
    SONDERN Molkenprotein mit sehr wenig Milchzucker. Wird schnell
            aufgenommen und liefert dieselben Bausteine wie normales
            Molkenprotein - guenstig fuer alle, die Milchzucker
            schlecht vertragen.

### 2.2 Peptide und Enhanced — Schadensminderung

**Hier ist die Frage nicht *„wirkt es"*, sondern *„was macht es mit dir
und was musst du ueberwachen"*.**

Zusaetzliche Felder, dreisprachig:

    irreversibel          was bleiben kann, auch nach dem Absetzen
    ueberwachung          welche Werte, in welchem Abstand
    nicht_im_blut         was eine Blutprobe nicht zeigt
    reinheit              wie zuverlaessig ist der Inhalt der Aufschrift
    rechtslage_klartext   was der Status praktisch bedeutet

**Drei Aussagen muessen stehen, wo sie zutreffen:**

**Was nicht zurueckkommt.** Die Erholung der koerpereigenen
Hormonproduktion nach dem Absetzen ist unterschiedlich — viele Monate,
manche ein Jahr und laenger, bei einem Teil bleibt sie unvollstaendig.
**Das gehoert nach oben, nicht in eine Fussnote.**

**Was gemessen gehoert.** Bei injizierbaren Praeparaten Blutbild,
Nierenwerte, Blutfette, Gesamttestosteron; bei oralen zusaetzlich die
Leberwerte. `[cmd]` **Verknuepf das mit `supplement_lab_effects`
(222 Zeilen) und den LOINC-Markern im Medical-Modul** — dort ist die
Bruecke schon gebaut.

**Dass der Inhalt nicht der Aufschrift entsprechen muss.** Bei SARMs
wurden wiederholt alkylierte Steroide, Verunreinigungen oder ganz
andere Wirkstoffe in Praeparaten gefunden. `[read]` **Diese Aussage
entwertet jede Dosisangabe und muss deshalb daneben stehen, nicht
weit weg.**

`[read]` **Peptide sind nicht Enhanced.** Andere Risikoprofile, eigene
Feldbelegung — auch wenn das Seitengeruest dasselbe ist.

### 2.3 Dosisbereiche bei AAS und SARM

**Tom, D: ja, in der Entwicklungsphase.** Trag die Bereiche ein, wo sie
belegt sind.

`[read]` **Die Grenze bleibt trotzdem:** Bereich ja, Schema nein. *„In
Studien wurden X bis Y eingesetzt"* ist ein Fakt. *„Nimm X"* ist eine
Anweisung und hat im Katalog nichts zu suchen. **Keine Zyklen, keine
PCT-Protokolle, keine Kombinationsempfehlungen.**

### 2.4 Die 276 verborgenen

**Tom, E:** *„die werden wir noch anreichern und auch einblenden."*

`[read]` **Aber nicht in diesem Auftrag.** Erst die 290 sichtbaren
fertig, sonst ist am Morgen alles halb. `[cmd]` `im_katalog` ist eine
generierte Spalte — **sobald eine der 276 eine Beschreibung bekommt,
erscheint sie von selbst.** Kein Schalter noetig.

---

## WAS NICHT ZU TUN IST

**Keine Anweisungen.** Keine Dosierungsschemata, keine Zyklen, keine
PCT-Protokolle, keine Kombinationsempfehlungen.

**Keine Wertung.** Kein *„eines der besten"*, kein *„nicht
empfehlenswert"*.

**Keine Marken, keine Produkte, keine Preise.** Die kommen im Endausbau
von den Anbietern. **Eine Marke im Substanztext muesste spaeter wieder
heraus.**

**Nichts erfinden.** `[cmd]` **115 der 290 tragen
`dosing.status = 'unbekannt'`, 53 `safety.status = 'unbekannt'`.**
**Das ist ein ehrliches Ergebnis und darf nicht durch Fuelltext ersetzt
werden.** Ein leeres Feld mit `status = 'unbekannt'` ist richtig.

**Keine deutschen Texte fuer die bestehenden `*_de`-Spalten
erfinden** — `name_de`, `summary_de` und die anderen bleiben leer, bis
uebersetzt wird (C-254). **Die NEUEN Felder sind davon ausgenommen:
dort ist Deutsch die Quellsprache.**

`apps/` **nicht anfassen** — dort laeuft Claude Code an C-107.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

---

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Je Gruppe und je Feld: wie viele befuellt, wie viele bewusst leer.**
Schreib die Erwartung hin, bevor du misst.

**Gegenprobe an drei namentlich genannten Substanzen** — je eine aus
`supplement`, `peptide`, `enhanced`. **Bei jeder muss ohne Klick
erkennbar sein: was ist es, was macht es, was bei zu viel.**

**Eine Laengenpruefung:** `kurz_was` ueber 140 Zeichen oder mit einem
Fachwort aus einer Sperrliste (`MPS`, `Bioverfuegbarkeit`,
`Halbwertszeit` ohne Erklaerung) muss auffallen. `[read]` **Sonst ist
die Regel aus §6 nur notiert und nicht erzwungen** — und genau das ist
heute schon zweimal gebrochen.

**Negativprobe:** eine Erwartungszahl um eins verstellen, der Lauf muss
rot werden. Und: einen Fachnotiz-Satz als `kurz_was` einsetzen, die
Laengen- oder Sperrwortpruefung muss anschlagen.

**Alias-Dubletten:** vorher **598** ueberfluessige Zeilen bei 527
Substanzen, nachher **0**. Gegenprobe: eine absichtlich doppelte Zeile
muss gefunden werden.

---

## PIPELINE

Kettenschritt hinter `137_supplements_neuaufbau_befuellen.sql`.

Wegwerf-Datenbank, Sicherung vorher, voller Kettenlauf, **und live
einspielen** mit Vollsicherung davor und den Kontrollzahlen danach.

`[read]` **Bei einem Lauf dieser Groesse: nach jedem Durchgang
sichern.** Wenn Durchgang 3 scheitert, sollen 154 und 61 nicht
verloren sein.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen **nicht** ueber die Standardeingabe einer
interaktiven Sitzung schreiben — das hat am 2026-08-23 das Gate fuer
alle blockiert. `encoding="utf-8", newline="\n"`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
