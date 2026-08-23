# C-258 — Codex, 2026-08-23

Bericht: `docs/berichte/c-258-codex.md`

**Korrektur zu C-257. Die Struktur bleibt, die Texte werden ersetzt.**

---

## Was schiefging, und warum es meine Schuld ist

`[cmd]` **867 FAQ-Zeilen, drei verschiedene Antworten** — jede exakt
289-mal. `[cmd]` **289 Kurzbeschreibungen, sechs Schablonen** mit
eingesetztem Namen: *„Creatine monohydrate ist eine Supplement-Substanz
mit eigener Beleglage und eigenen Grenzen."*

`[read]` **Der Grund steht in meinem Auftragstext.** Dort hiess es
*„Nichts erfinden"* — gemeint waren **erfundene Zahlen**, gelesen wurde
**ein Verbot, ueberhaupt Fachwissen hinzuschreiben.** Die Schablone war
unter dieser Lesart die einzige zulaessige Antwort.

**Die Regel wird hiermit praezisiert:**

| Verboten | Erwuenscht |
|---|---|
| Eine Dosiszahl, die nicht belegt ist | *„Kreatin ist eine koerpereigene Verbindung aus drei Aminosaeuren, die in Muskelzellen als schneller Energiespeicher dient."* |
| Ein Evidenzgrad, den du setzt | Allgemein anerkanntes Fachwissen, das in jedem Lehrbuch steht |
| Eine Wirkung ohne Beleg behaupten | Den bekannten Wirkmechanismus in Alltagssprache erklaeren |

`[read]` **Was in Lehrbuechern, bei NIH ODS, EFSA, DGE oder der WHO
steht, ist kein Erfinden.** Es ist Allgemeinwissen, und du hast es.

---

## WAS ZU TUN IST

### 0 · Die 248 verborgenen — Handelsnamen muessen sichtbar werden

**Tom, 2026-08-23:** *„genau die handelsnamen wie dianabol muessen in
die aktiven mit rein."*

`[cmd]` **248 Zeilen sind verborgen, alle aus
`f05_substance_candidate`:** 125 `supplement`, 102 `enhanced`, 21
`peptide`. Sie tragen Name, Gruppe, Kategorie und Aliase — sonst
nichts.

`[cmd]` **Ein grosser Teil davon ist derselbe Stoff unter dem
Handelsnamen:**

    verborgen                          sichtbar, recherchiert    Grad
    Anavar (Oxandrolone)               Oxandrolone                 D
    Anadrol (Oxymetholone)             Oxymetholone                D
    Dianabol (Methandrostenolone)      Methandienone               D
    Boldenone Acetate / Cypionate      Boldenone undecylenate      D
    Ashwagandha, Ashwagandha (Sensoril) Ashwagandha (KSM-66/...)   B
    Bacopa Monnieri                    Bacopa monnieri (stand.)    B

`[cmd]` **Die Aliasbruecke findet das nicht:** nur **17 der 248** haben
ueberhaupt einen Alias-Treffer auf einen sichtbaren Eintrag. *Dianabol*
und *Methandienone* teilen kein Zeichen. **Kein Namensvergleich loest
das — du weisst es, ein Skript nicht.**

**Teil das in drei Gruppen und melde die Zahlen:**

**a) Handelsname eines bereits recherchierten Wirkstoffs.**
`[read]` **Der Handelsname ist das, was der Nutzer kennt** — niemand
sucht nach *Methandienone*. **Zu tun:**

- den Handelsnamen als **Alias** am recherchierten Eintrag anlegen
- und den Eintrag umbenennen, sodass **beide Namen im Titel stehen**:
  `Methandienone (Dianabol)`, `Oxandrolone (Anavar)`,
  `Oxymetholone (Anadrol)`
- die verborgene `f05`-Zeile nicht loeschen, sondern per `parent_id`
  an den recherchierten Eintrag haengen

`[read]` **Keine zweite sichtbare Zeile.** Zwei Katalogeintraege fuer
denselben Stoff sind schlechter als einer mit beiden Namen.

**b) Kombination oder Stack, keine Substanz.** `[cmd]` Es gibt sie:
*„Bulk Mix (Test E + Deca + EQ)"*, *„Dbol + Anavar Stack Oral"*.
**Die bekommen keinen Substanztext.** Zaehl sie, nenn sie im Bericht,
und lass sie verborgen — **wie sie behandelt werden, ist eine
Entscheidung, die noch nicht gefallen ist.**

**c) Eigener Stoff, nur nicht recherchiert.** **Die bekommen Text wie
alle anderen und werden sichtbar.** `[cmd]` Da stehen echte Substanzen
darunter: *9-Me-BC*, *AC-262536*, *Aniracetam*, *Black Cohosh*,
*Andrographis*, *Anamorelin*, *ACE-031*.

`[read]` **Diese Aufteilung entscheidet den Umfang des ganzen
Auftrags** — mach sie zuerst und melde die drei Zahlen, bevor du
Texte schreibst. **Wenn Gruppe c gross ist, sag es, statt still 200
Texte mehr zu schreiben.**

### 0.1 Die 29 Unterformen sind aus dem Katalog gefallen

`[cmd]` C-257 hat `im_katalog` um `parent_id IS NULL` erweitert. **Das
steht in keinem Bericht.** Folge: Magnesium citrate hat eine englische
Beschreibung und Grad B — und ist unsichtbar. **Alle 29 Unterformen
sind so verschwunden**, und es gibt **keinen Lesepfad, der sie unter
dem Sammelnamen zeigt.**

`[cmd]` **Deshalb stehen alle 29 `form_note_de` auf verborgenen
Zeilen** — der einzige echte Inhalt aus C-257 ist fuer einen Nutzer
nicht erreichbar.

**Zu tun:** entweder die Formen wieder sichtbar machen, oder einen
Lesepfad bauen, der sie unter dem Elterneintrag zeigt. `[read]`
**Empfehlung: unter dem Elterneintrag** — das war die Absicht von
C-244. **Aber der Weg dorthin muss existieren**, sonst ist die
Entscheidung ein Datenverlust.

`[cmd]` **`form` fehlt bei 205 der 289 sichtbaren** — `enhanced` **0
von 177**, `peptide` **1 von 82**. Fuellen, wo die Form bekannt ist.

### 1 · Die Schablonentexte ersetzen


**Alle 289 Zeilen in `supplement_user_texts` und alle 867 in
`supplement_faq` werden neu geschrieben.** Die Tabellen bleiben, der
Inhalt geht.

`[read]` **Schablonen sind schlechter als leere Felder**, weil sie
aussehen wie Inhalt. Die Oberflaeche kann dann nicht mehr
unterscheiden, ob etwas fehlt oder gefuellt ist.

### 2 · Woher der Inhalt kommt

**Aus deinem eigenen Wissen.** Du weisst, was Kreatin, Magnesium,
Ashwagandha, Cardarine oder Semaglutid sind. **Schreib es hin.**

**Und aus oeffentlichen Quellen, wo du unsicher bist:** NIH Office of
Dietary Supplements, EFSA, DGE, WHO, Cochrane, Fachliteratur.
`[read]` **Zu jeder Substanz gibt es Fachinformationen** — Hersteller,
Aufsichtsbehoerden, Fachgesellschaften. Der Katalog fuehrt keinen
Exoten, den niemand beschrieben hat.

**Wo du wirklich nichts weisst: Feld leer lassen** und im Bericht
nennen. `[cmd]` **115 von 290 tragen `dosing.status = 'unbekannt'` —
ein leeres Dosisfeld ist richtig.** Aber *„was ist das"* ist bei keiner
einzigen Substanz unbeantwortbar.

### 3 · Der Massstab

    SCHLECHT  Creatine monohydrate ist eine Supplement-Substanz mit
              eigener Beleglage und eigenen Grenzen.

    GUT       Kreatin ist eine koerpereigene Verbindung aus drei
              Aminosaeuren. Der Koerper speichert sie in den Muskeln
              und greift bei kurzen, harten Belastungen darauf zu -
              etwa beim Sprint oder in den ersten Wiederholungen
              einer schweren Uebung.

    SCHLECHT  Bromocriptine ist ein leistungs- oder hormonbezogener
              Wirkstoff; der Katalog beschreibt Fakten, keine
              Anwendung.

    GUT       Bromocriptin ahmt im Gehirn den Botenstoff Dopamin nach
              und senkt dadurch die Ausschuettung von Prolaktin.
              Zugelassen ist es bei zu hohem Prolaktinspiegel und bei
              Parkinson.

`[read]` **Der Unterschied ist nicht Laenge, sondern Information.** Der
schlechte Satz sagt ueber Kreatin nichts, was nicht auch ueber Zink
gelten wuerde.

### 4 · Die FAQ

**Echte Substanzfragen, je Substanz verschieden.**

    SCHLECHT (289x identisch)
      "Nein. Der Eintrag erklaert den Bestand, die Beleglage und
       Grenzen. Er sagt nicht, dass du es nehmen sollst."

    GUT, Kreatin
      "Muss ich eine Ladephase machen?"
      "Nein, noetig ist sie nicht. Mit der ueblichen Tagesmenge sind
       die Muskelspeicher nach etwa drei bis vier Wochen genauso
       voll - nur langsamer."

    GUT, Kreatin
      "Macht Kreatin Haarausfall?"
      "Eine einzelne kleine Studie fand einen Anstieg von DHT, einem
       Hormon, das bei erblichem Haarausfall eine Rolle spielt.
       Spaetere Untersuchungen konnten das nicht bestaetigen, und ein
       Zusammenhang mit Haarausfall selbst wurde nie gezeigt."

**3-6 Fragen je Substanz, haeufigste zuerst.** Nur Substanzfragen —
gilt die Antwort fuer jede Dose desselben Stoffs, gehoert sie hierher.

---

## NACHWEIS — und diesmal misst er das Richtige

`[read]` **Meine Pruefung in C-257 war blind.** Laengenpruefung und
Sperrwortliste bestehen Schablonen muehelos. **Was gefehlt hat, ist
die Zaehlung verschiedener Formulierungen.**

**Pflichtpruefungen, alle vor dem Lauf mit Erwartung:**

    Verschiedene kurz_was_de              muss >= 280 von 289 sein
    Verschiedene antwort_de in FAQ        muss >= 700 von ~900 sein
    Verschiedene frage_de in FAQ          muss >= 400 sein
    Laengster gemeinsamer Schlussteil     ueber alle kurz_was_de
                                          hoechstens 3 Woerter

`[cmd]` **Heute:** 289 Zeilen, aber nur **98** verschiedene
Formulierungen nach Abzug des Namens; **3** verschiedene FAQ-Antworten
auf 867 Zeilen. **Genau das darf nicht wieder herauskommen.**

**Negativprobe:** setz zehn Zeilen absichtlich auf denselben Text —
die Pruefung muss rot werden und die Zahl nennen.

**Gegenprobe an fuenf namentlich genannten Substanzen**, je eine aus
`supplement`, `peptide`, `enhanced`, dazu Magnesium als Sammelname und
eine Unterform. **Bei jeder muss der erste Satz sagen, was der Stoff
ist — so, dass jemand ohne Vorbildung es versteht.**

---

## WAS BLEIBT

`[cmd]` **Die Struktur aus C-257 ist gut und bleibt unveraendert:**
`supplement_user_texts`, `supplement_faq`, `supplement_tags` mit
Zweck-Graden (425 Zeilen), 79 Portionszeilen, die 29 Unterformen aus
C-244, und die Alias-Faltung **598 → 0**.

### `form` und `form_note_de` bleiben — sie sind gut geworden

`[cmd]` `form` **109 gefuellt**, `form_note_de` **29** — je Unterform
eine. **Das sind echte Inhalte, keine Schablonen:**

    Magnesium citrate     Citrat; haeufig als gut loesliche
                          Magnesiumform genutzt.
    Magnesium L-threonate L-Threonat; eigene Form, oft wegen
                          Gehirn-/Nervenbezug gelistet.
    Iron (ferrous bisgl.) Bisglycinat; chelatierte Eisenform.
    Caffeine (anhydrous)  Wasserfreie Form; Koffein ohne Kristallwasser.

`[read]` **Genau so war es gemeint** — und es beweist, dass du es
kannst. **Dieselbe Machart gilt jetzt fuer `kurz_was` und die FAQ.**

**Zu tun:** `form_note_de` **fuer die uebrigen Unterformen ergaenzen**,
wo sie fehlt, und `form` fuellen, wo die Form bekannt ist. `[cmd]` 109
von 566 haben heute eine.

### `description_de` — 289 gefuellt, aber mit den Schablonen

`[cmd]` `description_de` **289**, `description_en` **318**.

`[read]` **`description_de` traegt denselben Schablonensatz wie
`kurz_was_de`** — bei Kreatin steht in beiden Feldern *„ist eine
Supplement-Substanz mit eigener Beleglage und eigenen Grenzen."*
**Zweimal dasselbe, zweimal nichtssagend.**

**Zu tun — und das ist eine Entscheidung, die du triffst und
begruendest:** entweder `description_de` traegt kuenftig einen anderen
Inhalt als `kurz_was_de`, oder eines der beiden Felder ist ueberfluessig.

`[read]` **Mein Vorschlag, aber pruef ihn:** `kurz_was` ist der eine
Satz ganz oben — *was ist das*. `description` ist der laengere Absatz
darunter — *wie wirkt es, woher kommt es, was ist der Zusammenhang*.
Dann tragen beide etwas. **Wenn du zu einem anderen Schnitt kommst:
melden, nicht beide gleich befuellen.**

`[cmd]` **`description_en` hat 318 Zeilen — 29 mehr als `_de`.** Das
sind die Unterformen, die aus dem Kimi-Bestand schon einen englischen
Satz hatten. **Sie brauchen ebenfalls Deutsch.**

`[cmd]` **Eine Zahl erklaerst du im Bericht:** `im_katalog` ist von
**290 auf 289** gefallen. Ich habe keine Erklaerung dafuer gefunden.


---

## WAS NICHT ZU TUN IST

**Keine Anweisungen.** Keine Dosierungsschemata, keine Zyklen, keine
PCT-Protokolle. *„In Studien wurden X bis Y eingesetzt"* ist ein Fakt,
*„nimm X"* nicht.

**Keine Wertung.** Kein *„eines der besten"*, kein *„nicht
empfehlenswert"*.

**Keine Marken, keine Preise, keine Produkte.**

**Keine erfundenen Zahlen.** Wo kein Dosisbereich belegt ist, bleibt er
leer. **Das gilt fuer Zahlen — nicht fuer die Erklaerung, was der Stoff
ist.**

`apps/` **nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## REGELN

Wegwerf-Datenbank, Sicherung vorher, Kettenlauf, **und live
einspielen** mit Vollsicherung davor.
`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
