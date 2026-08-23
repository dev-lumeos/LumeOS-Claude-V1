# Substanzkatalog — was ein Nutzer lesen muss

Stand: 2026-08-23 · Orchestrator · **Anforderung, kein Auftrag.**
Vorgaenger: `substanz-katalog-recherche.md` (F-05, 2026-08-19) — der
beschreibt, **welche Stammdaten** gesammelt wurden. Dieses Dokument
beschreibt, **welcher Text** daraus werden muss.

**Anlass (Tom, 2026-08-23):**

> *„was will ein user lesen wenn er whey protein oeffnet? der will eine
> saubere beschreibung / fuer was ist es, erklaerend nicht
> wissenschaftlich / was wenn zuviel, zuwenig / all die normalen sachen
> wie man supplements normalen leuten praesentiert."*

> *„all dieser scheiss mag vielleicht irgendwann fuer buddy interessant
> sein aber gehoert nicht in eine userplattform welche
> erklaerend/aufklaerend sein soll."*

---

## 1. Der Befund: es gibt keinen Nutzertext

`[cmd]` Gemessen am 2026-08-23 ueber die **290 im Katalog sichtbaren**
Substanzen:

| Angabe | vorhanden |
|---|---:|
| Beschreibung (`description_en`) | 290 |
| Evidenzgrad | 290 |
| WADA-Status | 290 |
| Nebenwirkungen (`common_side_effects_en`) | 178 |
| Arzt-Flags (`doctor_consult_flags`) | 128 |
| Dosisbereich (`studied_dose_ranges`) | 83 |
| Obergrenze (`upper_limit`) | 38 |
| Einnahmehinweis (`usage_hint_en`) | **19** |
| **Empfohlene Dosis (`guideline_dose`)** | **0** |
| **Wofuer ist es / was bringt es** | **kein Feld im Schema** |
| **Was bei zu wenig** | **kein Feld im Schema** |

`[cmd]` **Die vorhandenen Beschreibungen sind Fachnotizen.** Whey
protein isolate traegt:

> *„Low-lactose/fast; same MPS evidence base as whey class."*

`[cmd]` Und bei **125 von 290** ist `description_en` **wortgleich** mit
`evidence.summary_en` — derselbe Satz zweimal.

`[read]` **Kimi hat fuer Fachleute recherchiert.** Das war richtig fuer
die Datenbank und ist unbrauchbar fuer den Katalog. Zwei der vier Dinge,
die Tom nennt, haben **gar kein Feld** — kein Layout bringt sie hervor.

---

## 2. Die Grenze bleibt, und sie ist enger als sie klingt

`substanz-katalog-recherche.md` haelt fest:

> *Erfasst wird, was eine Substanz ist. Nicht erfasst wird, was jemand
> tun soll — keine Zyklen, keine PCT-Protokolle, keine
> Kombinationsempfehlungen. **Fakt ja, Anweisung nein.***

**Diese Grenze gilt weiter.** Was Tom verlangt, verletzt sie nicht:

| Erlaubt — Fakt | Verboten — Anweisung |
|---|---|
| *„In Studien wurden 20–40 g je Portion eingesetzt."* | *„Nimm 30 g nach dem Training."* |
| *„Oberhalb von X g treten gehaeuft Magenbeschwerden auf."* | *„Steigere langsam auf X g."* |
| *„Ein Mangel aeussert sich als …"* | *„Du solltest das nehmen, wenn …"* |
| *„Unterdrueckt die koerpereigene Testosteronproduktion."* | *„Plane eine PCT von 4 Wochen."* |

`[read]` **Der Unterschied liegt im Subjekt, nicht im Thema.** *„Was
passiert bei zu viel"* ist eine Aussage ueber den Stoff. *„Wie viel
sollst du nehmen"* ist eine Aussage ueber den Leser. **Das erste
gehoert in den Katalog, das zweite nie.**

`[read]` **Und es ist der Unterschied zwischen Plattform und Buddy.**
Der Katalog erklaert. Ein Begleiter, der den Nutzer, seine Werte und
seine Ziele kennt, darf spaeter einordnen — **die Plattform selbst nicht.**

---

## 3. Wer liest das

Drei Lagen, die verschiedene Antworten brauchen. Alle drei landen auf
derselben Seite.

**Der Unentschiedene.** Hat den Namen irgendwo gehoert und will wissen,
was das ist und ob es etwas taugt. **Braucht: was ist es, was macht es,
ist es belegt.** Bricht ab, wenn der erste Satz „MPS evidence base"
enthaelt.

**Der Anwender.** Nimmt es bereits oder hat es gekauft. **Braucht: wie
viel wurde untersucht, wann und womit einnehmen, woran merke ich zu
viel, was ist mit anderen Sachen zusammen problematisch.**

**Der Betroffene.** Hat einen Laborwert, ein Symptom, eine
Wechselwirkung. **Braucht: was verschiebt der Stoff im Blut, was
gehoert ueberwacht, wann zum Arzt.**

`[read]` **Die dritte Lage ist die, die LumeOS von einem Blog
unterscheidet** — `supplement_lab_effects` (222 Zeilen) und das
Medical-Modul mit LOINC-Markern existieren bereits. **Die Bruecke ist
gebaut, der Text dazu fehlt.**

---

## 4. Drei Gruppen, drei Modelle

`[cmd]` Der Katalog fuehrt: **Supplements 154 · Enhanced 75 ·
Peptide 61.** Sie brauchen **nicht** dieselbe Seite.

### 4.0 Vorab: die Korrektur an diesem Dokument

**Tom, 2026-08-23:** *„du recherchierst auf einer scheiss beautyseite?
wie waers wenn mal bei den profis mitspielen wuerdest."*

`[read]` **Die erste Fassung stuetzte sich unter anderem auf eine
SEO-Seite** (`beautifullywithin.com`), die aus einer Trefferliste
uebernommen und nicht geprueft wurde. **Sie ist raus.**

`[read]` **Und der Zuschnitt war falsch.** Examine.com ist ein
Nachschlagewerk fuer Leute, die Studien lesen wollen — **genau das
Register, das Tom kritisiert hat.** Was ein normaler Kaeufer gewohnt
ist, steht im Handel. Die Struktur einer iHerb-Produktseite
(Kreatin-Monohydrat, `71026`, 39.784 Bewertungen) sieht so aus:

    Uebersicht           5 g je Portion, ohne Geschmack, ohne Gluten,
                         GMO, Soja - und wo man es hineinruehrt
    Anwendung            1 Messloeffel taeglich in 180-240 ml Fluessigkeit
    Inhaltsstoffe        Hauptstoff, weitere Stoffe, Allergenhinweis
    Warnhinweise         ausser Reichweite von Kindern, Ruecksprache mit
                         Fachperson, Lagerung
    Naehrwerttabelle     Portionsgroesse, Portionen je Packung,
                         Menge je Portion
    Haeufige Fragen      Loest es sich auf? Wie schmeckt es?
                         Macht es Haarausfall?
    Preis je Portion     4,90 THB
    Drittgeprueft        mit einsehbarem Zertifikat

`[read]` **Drei Dinge daran fehlten in meiner ersten Fassung
vollstaendig** — und es sind genau die, die ein Kaeufer zuerst sucht:

**Die Alltagsfragen.** Loest es sich? Schmeckt es? Macht es Haarausfall?
**Das sind die echten Fragen**, und sie stehen dort nicht zufaellig
ganz unten, sondern weil sie am haeufigsten gestellt werden. **Ein
Katalog ohne sie beantwortet Fragen, die niemand gestellt hat.**

**Was drin ist und was nicht.** Allergene, Zusatzstoffe, Reinform.
`[cmd]` **LumeOS hat dafuer kein Feld.**

**Die Groesseneinheit.** Portionsgroesse, Portionen je Packung, Preis je
Portion. `[cmd]` Genau die drei fehlen im neuen Schema — deshalb traegt
die Kosten-Kachel seit C-250 eine Marke.

`[read]` **Der Unterschied zum Handel bleibt trotzdem:** iHerb verkauft
und setzt hinter jede Wirkaussage ein Sternchen mit dem Hinweis, dass
die Aussagen nicht von der Arzneimittelbehoerde geprueft sind.
**LumeOS verkauft nicht.** Wir uebernehmen die *Gliederung*, nicht den
Werbeton — und statt eines Sternchens steht bei uns der Evidenzgrad.

### 4.1 Supplements — Handelsgliederung, Nachschlagewerk-Inhalt

Vorbild fuer den **Aufbau**: die Produktseite oben.
Vorbild fuer die **Belastbarkeit**: Examine.com.

Zwei Dinge von dort sind uebertragbar:

**Der Grad haengt am Zweck, nicht am Stoff.** <cite index="1-1">Dort wird je
Kombination aus Intervention und Ergebnis ein Buchstabe von A bis F
vergeben — A fuer die staerkste Beleglage, F fuer unsicher.</cite>
`[read]` **LumeOS hat heute einen Grad je Substanz.** Kreatin ist fuer
Muskelaufbau A und fuer Haarwuchs nichts — ein einzelner Buchstabe kann
das nicht sagen. **Ob das nachgezogen wird, ist eine Entscheidung
(siehe §7).**

**Die Dosis der Studie ist die eigentliche Auskunft** — ein Praeparat
kann gut belegt sein und trotzdem unter der Menge liegen, mit der die
Studien gearbeitet haben. `[read]` **Das ist der Grund, warum
`studied_dose_ranges` wichtiger ist als `guideline_dose`** — und warum
die 83 von 290 die schmerzhafteste Luecke sind.


### 4.2 Enhanced und Peptide — das Schadensminderungs-Modell

**Hier ist die Frage nicht *„wirkt es"*, sondern *„was macht es mit
dir und was musst du ueberwachen"*.**

<cite index="27-1">Schadensminderung setzt an der Verringerung von Schaeden an, ohne
Verzicht zu verlangen: sie geht davon aus, dass der Betreffende selbst
ueber seinen Koerper entscheidet, und unterstuetzt ihn mit Information
und Ueberwachung, damit er unerwuenschte Wirkungen frueh erkennt.</cite>
`[read]` **Genau die Haltung passt zu LumeOS** — die Plattform
verschreibt nicht und wertet nicht, sie klaert auf und misst mit.

Was diese Gruppe zwingend braucht:

**Was irreversibel sein kann.** <cite index="27-1">Nach dem Absetzen erholt sich die
koerpereigene Produktion unterschiedlich — viele ueber Monate, manche
brauchen ein Jahr und laenger, und bei einem Teil bleibt die Erholung
unvollstaendig mit dauerhaft niedrigem Testosteron und Unfruchtbarkeit.</cite>
**Das muss vor dem ersten Einsatz dastehen, nicht in einer Fussnote.**

**Was im Blut passiert und wie oft gemessen wird.** <cite index="27-1">Fuer
injizierbare Praeparate gehoeren Blutbild, Nierenwerte, Blutfette und
Gesamttestosteron zur Grundueberwachung; bei oralen kommen die
Leberwerte hinzu, weil sie leberschaedigender sind.</cite>
`[read]` **Das ist der direkte Anschluss an `supplement_lab_effects`
und das Medical-Modul.**

**Dass Blut allein nicht reicht.** <cite index="27-1">Blutdruck, Herz- und
Bauchuntersuchung erfassen Veraenderungen, die eine Blutprobe nicht
zeigt — erhoehter Blutdruck ist bei mehreren Wirkstoffklassen haeufig
und einer der staerksten Risikofaktoren.</cite>

**Dass der Inhalt nicht der Aufschrift entsprechen muss.**
<cite index="27-1">Bei SARMs ist die Produktreinheit ein zentrales Problem: mehrere
Untersuchungen fanden alkylierte Steroide, Verunreinigungen oder ganz
andere Wirkstoffe in Praeparaten, die als SARM verkauft wurden.</cite>
`[read]` **Das ist die wichtigste Einzelaussage fuer diese Gruppe** —
sie entwertet jede Dosisangabe und muss deshalb neben ihr stehen.

`[read]` **Peptide sind nicht Enhanced.** Die Risikoprofile
unterscheiden sich deutlich; sie in einen Topf zu werfen, waere
sachlich falsch. Sie brauchen eine eigene Feldbelegung, auch wenn das
Seitengeruest dasselbe ist.

---

## 5. Der Feldkatalog

**Neu, fuer alle drei Gruppen** — jedes Feld dreisprachig `_de`/`_en`/`_th`,
Deutsch zuerst:

| Feld | Inhalt | Laenge |
|---|---|---|
| `kurz_was` | Was ist das, in einem Satz, ohne Fachwort | ≤ 140 Zeichen |
| `wofuer` | Wofuer wird es eingesetzt, 2–4 Stichpunkte | je ≤ 60 Zeichen |
| `wie_wirkt` | Wirkweise in Alltagssprache | 2–3 Saetze |
| `was_bringt_es` | Was in Studien tatsaechlich herauskam, **mit Groessenordnung** | 2–4 Saetze |
| `zu_viel` | Was bei Ueberdosierung passiert, **konkret** | 1–3 Saetze |
| `zu_wenig` | Mangelbild, **nur wo es eines gibt** | 1–2 Saetze oder leer |
| `wann_wie` | Zeitpunkt, mit/ohne Essen, womit nicht zusammen | 1–2 Saetze |
| `wer_nicht` | Wer die Finger davon lassen sollte | Stichpunkte |
| `mythen` | Verbreitete Irrtuemer, **wo es welche gibt** | 1–2 Saetze |

### 5.2 Substanz oder Produkt — entschieden

**Tom, 2026-08-23:**

> *„jetzt fuehrt lumeos substanzen aber selbst die haben beschreibungen
> die lesbar fuer menschen sind und die anderen informationen wo
> menschen interessieren."*

> *„endausbau wird der anbau von suppliers sein die ihre eigenen vollen
> daten liefern werden."*

**Damit sind es zwei Ebenen, und die Trennung ist die Vorgabe:**

| Ebene | Inhalt | Woher |
|---|---|---|
| **Substanz** — heute | Was ist der Stoff, was macht er, was bei zu viel, was ueberwacht gehoert | **Kimi und Redaktion** |
| **Produkt** — Endausbau | Portionsgroesse, Portionen je Packung, Preis, Allergene, Zusatzstoffe, Drittpruefung, Zertifikat | **die Anbieter selbst** |

`[read]` **Der Katalog bleibt auf der Substanzebene, und das ist keine
Einschraenkung.** Kreatin-Monohydrat ist derselbe Stoff, egal von wem —
was er tut, wie viel in Studien eingesetzt wurde und was bei
Ueberdosierung passiert, gilt fuer jede Dose. **Genau das ist der Teil,
der heute fehlt.**

`[read]` **Was daraus fuer das Schema folgt:** die Substanzzeile
bekommt **keine** Produktfelder. Waeren `serving_size` oder
`cost_per_serving` an der Substanz, kollidierten sie beim Anbau mit den
Angaben der Anbieter — und jemand muesste entscheiden, welche gilt.
`[cmd]` **Die Kosten-Kachel bleibt deshalb markiert, bis die
Produktebene steht.** Ihre Marke ist ab jetzt richtig begruendet, nicht
nur ein Rest aus C-250.

`[cmd]` **`supplement_quality` (237 Zeilen) ist der Grenzfall** —
Reinheit und Pruefsiegel sind Produkteigenschaften, haengen aber heute
an der Substanz. **Beim Anbau der Anbieterebene ist das der erste Ort,
an dem es weh tut.** Als Punkt vermerken, nicht jetzt umbauen.

### 5.3 Die Alltagsfragen — der Teil, der zuerst gelesen wird

`[read]` **Die Produktseite stellt sie ans Ende und beantwortet sie
trotzdem** — weil sie am haeufigsten gestellt werden: *Loest es sich
auf? Wie schmeckt es? Macht es Haarausfall?*

**Neue Tabelle `supplement_faq`**, je Substanz mehrere Zeilen:

| Spalte | Inhalt |
|---|---|
| `supplement_id` | Verweis |
| `frage_de` / `_en` / `_th` | Die Frage, **so wie sie gestellt wird** |
| `antwort_de` / `_en` / `_th` | 1–3 Saetze, ohne Ausweichen |
| `sort_order` | haeufigste zuerst |

`[read]` **Auch hier gilt die Trennung aus §5.2.** *„Macht es
Haarausfall?"* und *„Wie lange dauert es, bis es wirkt?"* sind
Substanzfragen und gehoeren hierher. *„Wie schmeckt diese Dose?"* und
*„Wie fein ist das Pulver?"* sind Produktfragen und kommen mit den
Anbietern. **Im Zweifel: gilt die Antwort fuer jede Dose desselben
Stoffs, ist es eine Substanzfrage.**

`[read]` **Eine Antwort, die auf das Etikett verweist, ist keine.**
Die Handelsseite tut das bei der heikelsten Frage — *„Macht Kreatin
Haarausfall?"* wird dort mit einem Verweis auf eine Fachperson
beantwortet, nicht mit dem Forschungsstand. **Das ist der Punkt, an
dem LumeOS besser sein kann als der Handel**, weil wir nichts
verkaufen und keine Haftung fuer ein einzelnes Produkt tragen.

`[read]` **Die Fragen sind je Gruppe voellig andere.** Bei Kreatin geht
es um Wassereinlagerung und Wirkeintritt; bei SARMs um Nachweisbarkeit,
Produktreinheit und Erholung der eigenen Hormonachse. **Kimi
recherchiert die tatsaechlich gestellten Fragen mit, nicht nur die
Antworten.**


**Zusaetzlich fuer Enhanced und Peptide:**

| Feld | Inhalt |
|---|---|
| `irreversibel` | Was bleiben kann, auch nach dem Absetzen |
| `ueberwachung` | Welche Werte, in welchem Abstand — **Anschluss an LOINC** |
| `nicht_im_blut` | Was eine Blutprobe nicht zeigt (Blutdruck, Herz) |
| `reinheit` | Wie zuverlaessig ist der Inhalt der Aufschrift |
| `rechtslage_klartext` | Was der Status praktisch bedeutet, ohne Paragraphen |

`[read]` **`zu_wenig` bleibt bei den meisten leer** — Kreatinmangel als
Krankheitsbild gibt es nicht, Vitamin-D-Mangel sehr wohl. **Ein leeres
Feld ist hier richtig und muss erlaubt sein**, sonst wird erfunden.


---

## 6. Schreibregeln

**Die erste Zeile entscheidet.** Wer sie nicht versteht, liest nicht
weiter. Kein Fachwort, keine Abkuerzung, kein Studiendesign.

    NICHT  Low-lactose/fast; same MPS evidence base as whey class.
    SONDERN Molkenprotein mit sehr wenig Milchzucker. Wird schnell
            aufgenommen und liefert dieselben Bausteine wie normales
            Molkenprotein - guenstig fuer alle, die Milchzucker
            schlecht vertragen.

**Fachwoerter werden erklaert oder weggelassen.** *„MPS"*,
*„Bioverfuegbarkeit"*, *„Halbwertszeit"* duerfen vorkommen — beim ersten
Mal mit einem Halbsatz dahinter.

**Groessenordnung statt Adjektiv.** Nicht *„deutlich mehr Kraft"*,
sondern *„in Studien etwa 5–10 % mehr Wiederholungen"*. Wo keine Zahl
belegt ist: **sagen, dass keine da ist.**

**Kein Verkauf, keine Warnung als Ton.** Weder *„ein Muss fuer jeden
Athleten"* noch *„gefaehrlich, Finger weg"*. Der Leser entscheidet, der
Text liefert.

**Kein Konjunktiv als Fuellstoff.** *„Koennte moeglicherweise
unterstuetzen"* sagt nichts. Entweder es ist belegt, oder der Text sagt,
dass es nicht belegt ist.

**Deutsch zuerst, Englisch zweit, Thai spaeter.** `[cmd]` Heute sind
**alle** `*_de`-Freitextspalten leer und die Anzeige faellt auf
Englisch zurueck (C-254). **Bei den neuen Feldern ist Deutsch die
Quellsprache.**

---

## 7. Entscheidungen, die vor dem Kimi-Auftrag fallen muessen

**A · Grad je Zweck oder je Substanz?** Examine vergibt A–F **je
Kombination aus Stoff und Ziel**. LumeOS hat einen Grad je Substanz.
Der Umbau ist erheblich — eine Tabelle `supplement_outcomes` mit
eigener Benotung. **Ohne ihn bleibt „Kreatin: A" eine Aussage ohne
Bezug.**

**B · Reichweite.** 290 sichtbare Substanzen mal neun Felder. Alle auf
einmal, oder gestaffelt — erst die 154 Supplements, dann Enhanced und
Peptide? `[read]` **Fuer die Staffelung spricht**, dass die
Supplement-Gruppe die meisten Leser hat und die einfachsten Texte.
**Dagegen**, dass Enhanced und Peptide die Gruppen sind, wo fehlende
Aufklaerung tatsaechlich schadet.

**C · Wer schreibt.** Kimi liefert Recherche, aber der Ton ist eine
redaktionelle Frage. `[read]` **Vorschlag: Kimi liefert Rohtext gegen
diesen Feldkatalog, du liest zehn Stueck gegen und wir korrigieren die
Vorgabe, bevor die restlichen 280 laufen.** Zehn Texte nachbessern ist
billig, 290 nicht.

**D · Haftung und Ton bei Enhanced.** `[read]` Die
Schadensminderungs-Haltung ist fachlich richtig und rechtlich nicht
trivial. **Ob LumeOS Dosisbereiche fuer AAS und SARMs ueberhaupt
anzeigt, ist deine Entscheidung** — der bestehende Katalog laesst sie
bei PEDs bewusst leer. **Aufklaerung ueber Risiken und Ueberwachung ist
davon unberuehrt und sollte in jedem Fall kommen.**

**E · Was mit den 276 verborgenen Zeilen?** Sie stehen ohne Inhalt in
der Tabelle und sind ueber `im_katalog` ausgeblendet (C-243). **Bekommen
sie Nutzertexte, oder bleiben sie ein Namensregister?**

**F · Substanz oder Produkt — ENTSCHIEDEN 2026-08-23.** Der Katalog
bleibt auf der Substanzebene; die Produktangaben liefern spaeter die
Anbieter selbst. Ausgefuehrt in §5.2. `[read]` **Die Folge fuer heute:
keine Produktfelder an der Substanzzeile**, und die Kosten-Kachel
bleibt markiert, bis der Anbau steht.



---

## 8. Was Kimi liefern soll — und was nicht

**Soll:** die neun Grundfelder, die **Alltagsfragen** aus §5.3 (Frage
*und* Antwort, haeufigste zuerst) und bei Enhanced und Peptiden die
fuenf Zusatzfelder — je Substanz, **auf Deutsch**, gegen die Regeln aus
§6, mit Quellenangabe je Aussage.


**Soll nicht:**

- **Keine Dosierungsschemata, keine Zyklen, keine PCT-Protokolle,
  keine Kombinationsempfehlungen.** Die Grenze aus
  `substanz-katalog-recherche.md` gilt unveraendert.
- **Keine Wertung.** Kein *„eines der besten"*, kein *„nicht
  empfehlenswert"*.
- **Nichts erfinden, wo nichts belegt ist.** Ein leeres Feld mit
  `status = 'unbekannt'` ist das richtige Ergebnis — das Schema traegt
  es bereits.
- **Keine Marken, keine Produkte, keine Preise.** `[read]` Die kommen
  im Endausbau von den Anbietern (§5.2). **Eine Marke, die Kimi
  heute in einen Substanztext schreibt, muesste spaeter wieder heraus.**


`[read]` **Die letzte Regel ist die wichtigste:** `[cmd]` von den heute
290 sichtbaren Substanzen tragen **115 `dosing.status = 'unbekannt'`**
und **53 `safety.status = 'unbekannt'`**. **Das ist ein ehrliches
Ergebnis und darf nicht durch Fuelltext ersetzt werden.**

---

## 9. Wie das Detail aussehen soll

**Entwurf am 2026-08-23 vorgelegt und von Tom bestaetigt:** *„es geht in
die richtige richtung."*

### Reihenfolge bei Supplements

    Kopf          Name · Gruppe · Zahl der Formen
                  rechts: Evidenzgrad, WADA-Status
    Erster Satz   WAS IST DAS - kein Grad, kein Feldname, keine
                  Schemageschichte
    Zwecke        2-4 Chips
    Drei Kacheln  Uebliche Menge · Obergrenze · Einnahme
    Zu viel       eigener Abschnitt
    Zu wenig      eigener Abschnitt, entfaellt wo es kein Mangelbild gibt
    Die Formen    je Form: Name, ein unterscheidender Satz, eigener Grad
    Fragen        3-6, echte Fragen
    Fusszeile     Laborbezug; Rechtslage/Kennungen/Qualitaet zugeklappt
    Knopf         Zum Stack hinzufuegen

### Vier Regeln, die daraus folgen

**Der erste Satz beantwortet *was ist das*.** Alles Technische steht
unten und ist zugeklappt.

**Zahlen stehen als Zahlen da**, nicht in einem Fliesstext vergraben.
Menge, Obergrenze, Einnahme brauchen keinen Klick.

**Kein Block ohne Inhalt.** Wo eine Angabe fehlt, **entfaellt der
Abschnitt** — statt *„Sicherheit · 2 Felder"*, hinter denen zweimal
`unknown` steht. `[cmd]` Bei 115 der 290 ist die Dosis unbekannt; dort
faellt die Kachelzeile weg.

**Die Formen stehen unter dem Sammelnamen.** Das ist der fehlende
Lesepfad aus C-244. `[cmd]` `form_note_de` existiert fuer alle 29 und
ist heute unsichtbar.

### Was bei Enhanced und Peptiden anders ist

Der Rahmen bleibt, **die Reihenfolge dreht sich:**

    Ganz oben     WAS NICHT ZURUECKKOMMT - Erholung der eigenen
                  Hormonproduktion, bei einem Teil unvollstaendig.
                  Hervorgehoben, nicht als Fussnote.
    Kacheln       statt Dosis: UEBERWACHUNG - welche Werte, welcher
                  Abstand, mit Sprung ins Medical-Modul
    Daneben       REINHEIT, direkt neben der Mengenangabe
    Titel         beide Namen: `Methandienone (Dianabol)`

`[read]` **Warum Reinheit neben der Menge steht und nicht drei
Abschnitte weiter:** wenn in Praeparaten wiederholt andere Wirkstoffe
gefunden wurden, entwertet das jede Mengenangabe. Getrennt gelesen
wirkt die Zahl verlaesslicher, als sie ist.

`[read]` **Warum der Handelsname in den Titel gehoert:** `[cmd]` Nur 17
der 248 verborgenen Zeilen haben einen Alias-Treffer auf einen
sichtbaren Eintrag. *Dianabol* und *Methandienone* teilen kein Zeichen —
wer nach dem einen sucht, findet das andere nie.

---

## 10. Was das fuer die Oberflaeche heisst


`[read]` **Nichts davon ist ein Grund, den Katalog jetzt nicht zu
bauen.** Er zeigt, was da ist — Beschreibung, Grad, WADA-Status,
Dosisbereich wo vorhanden, Nebenwirkungen wo vorhanden — und sagt beim
Rest, dass die Angabe fehlt.

**Die neuen Felder ergaenzen dieselben Bloecke**, sie ersetzen sie
nicht. Wer die Reihenfolge aus dem C-107-Auftrag baut, muss spaeter
nichts umstellen.

`[read]` **Was heute nicht mehr gebaut werden sollte:** der Abschnitt
*„OHNE QUELLE IM NEUEN KATALOG"* in seiner jetzigen Form. Er erklaert
dem Nutzer die Schemageschichte — und ist damit das Gegenteil dessen,
was dieses Dokument beschreibt.
