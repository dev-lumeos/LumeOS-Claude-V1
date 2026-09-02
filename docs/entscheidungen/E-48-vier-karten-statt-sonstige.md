---
nr: E-48
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-136, GO-22]
modul: nutrition
---

# E-48 — vier Karten statt *Sonstige*

## Entscheidung

Tom, 2026-09-02, zu G-136:

> Ballaststoffe unter Kohlenhydrate
>
> Wasser kriegt eigene Kategorie **Wasser** als Fluessigkeitsbilanz,
> darin bilden wir Trinkwasser aus dem Wassermodul und Wasseranteil
> in Lebensmitteln ab, also zwei Positionen
>
> Saeuren kriegen eigene Kategorie **Organische Saeuren** als
> nicht-essentielle Wirkstoffe, z. B. Zitronensaeure, Milchsaeure
>
> Alkohol kriegt eigene Kategorie **Genussmittel** als
> energieliefernde Nicht-Naehrstoffe, z. B. Alkohol (Ethanol)

## Die vier Wurzeln, gemessen

`[cmd]` **`nutrition.nutrient_defs`, `parent_code IS NULL`:**

    WATER   Wasser                        0 Kinder
    ALC     Alkohol (Ethanol)             0 Kinder
    OA      Organische Saeuren, gesamt    5 Kinder
    ASH     Rohasche                      0 Kinder

`[cmd]` **Die fuenf Saeuren:** Essigsaeure, Zitronensaeure,
Milchsaeure, Aepfelsaeure, Weinsaeure.

`[read]` **`OA` traegt also bereits eine eigene Gruppe** — sie stand
nur unter *Sonstige*.

## Was daraus folgt

### Ballaststoffe

`[cmd]` **`FIBT` bleibt bei den Kohlenhydraten** — bestaetigt.
`[read]` **Fachlich richtig, und Cronometer macht es ebenso.**

`[cmd]` **Aber Vorsicht:** `[cmd]` **G-291 hat gemessen, dass `FIBT`
nicht als *Kind* unter `CHO` gehoert** — **als Kind ueberstiegen die
Teile das Elternteil.**

`[read]` **Karte und Hierarchie sind zwei verschiedene Sachen:**
**auf derselben Karte anzeigen ja, im Baum unterordnen nein.**

### Wasser als Fluessigkeitsbilanz

`[read]` **Zwei Positionen, wie Tom sagt:**

    Trinkwasser        aus dem Wassermodul
    Wasseranteil       aus den Lebensmitteln (WATER)

`[cmd]` **Der zweite steht:** `WATER` ist eine Wurzel mit Messwerten
je Lebensmittel.

`[read]` **Der erste kommt aus einem anderen Modul** — **das ist der
erste modulschneidende Naehrwert.** `[read]` **Zu klaeren, wo die
Trinkmenge liegt und wie sie hereinkommt.**

### Organische Saeuren

`[cmd]` **Eigene Karte, mit den fuenf Kindern.**

`[read]` **Und die Beschriftung sagt, was sie sind:**
*nicht-essentielle Wirkstoffe* — **kein Naehrstoff, den man decken
muss.**

### Genussmittel

`[cmd]` **`ALC` bekommt eine eigene Karte.**

`[read]` **Der Name traegt die Absicht:** *energieliefernde
Nicht-Naehrstoffe*. `[cmd]` **Und die Karte ist offen fuer mehr** —
Koffein waere der naechste Kandidat, **sobald der BLS ihn fuehrt.**

### Rohasche gehoert zu den Mineralstoffen

Tom, 2026-09-02, auf die Rueckfrage:

> Rohasche (ASH) gehoert in die Kategorie der Mineralstoffe
> (Anorganische Stoffe).
>
> **Bedeutung:** Rohasche ist kein einzelner Naehrstoff. Sie
> bezeichnet die Summe aller lebensnotwendigen Mineralstoffe und
> Spurenelemente (wie Calcium, Phosphor, Magnesium, Kalium, Natrium
> und Eisen) in einem Lebensmittel.
>
> **Bestimmung:** Der Name kommt aus dem Labor. Wenn man ein
> Lebensmittel bei ueber 500 Grad komplett verbrennt, verbrennen alle
> organischen Anteile (Fette, Proteine, Kohlenhydrate, Vitamine). Was
> als unbrennbare *Asche* uebrig bleibt, sind die reinen
> Mineralstoffe.
>
> **Energie:** Rohasche liefert 0 kcal.

`[cmd]` **Gemessen: sechzehn Mineralstoff-Wurzeln stehen bereits
nebeneinander** — Calcium, Chlorid, Chrom, Kupfer, Fluorid, Eisen,
Iodid, Kalium, Magnesium, Mangan, Molybdaen, Natrium, Salz, Phosphor,
Schwefel, Zink. **Und `ASH` mitten darin.**

`[read]` **Es braucht also keine neue Karte** — **die Mineralstoffkarte
gibt es, `ASH` steht nur nicht als das darauf, was es ist.**

`[read]` **Und die Beziehung ist besonders:** `[cmd]` **`ASH` ist die
Summe der uebrigen fuenfzehn, nicht ihr Elternteil.**

`[read]` **Wie bei `FIBT` unter `CHO`:** **auf derselben Karte ja,
als `parent_code` nein** — **sonst uebersteigen die Teile das
Elternteil oder das Elternteil zaehlt doppelt.**

`[cmd]` **Der Erklaerungstext gehoert an die Zeile:** *Summe aller
Mineralstoffe und Spurenelemente, im Labor durch Verbrennen bei ueber
500 Grad bestimmt. Liefert keine Energie.*
