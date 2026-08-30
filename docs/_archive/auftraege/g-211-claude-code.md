# G-211 — Claude Code, 2026-08-27

Bericht: `docs/berichte/g-211-claude-code.md`

**Der Erfassungsweg fuer Medikamente. C-285 ist entschieden, der
Katalog steht, die Markensuche findet 428 Namen — es fehlt die
Stelle, an der ein Mensch eintraegt, was er nimmt.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **In G-210 waren zwei meiner Zahlen falsch,
beide nach oben** — 380 statt 124 Wirkstoffe mit Produkt. **Die
Korrektur hat die Einschaetzung gedreht, nicht nur die Zahl.**

## 1 · Die Lage

`[cmd]` **`medical.user_medications` hat 21 Spalten und 2 Zeilen.**
Freitext sind genau drei: `name`, `indication`, `notes`. Der Rest ist
strukturiert — `active_substance_id`, `product_id`, `drug_class`,
`dose_amount`, `dose_unit`, `doses_per_day`, `route`, `start_date`,
`end_date`, `is_active`.

`[cmd]` **Klartext ist fuer die Entwicklungsphase entschieden** —
`docs/todo/SICHERHEIT.md`, C-285. **Kein Blocker mehr.**

`[cmd]` **Was der Erfassung zur Verfuegung steht:** 498 Wirkstoffe,
380 davon mit Produkt, 428 Marken durchsuchbar ueber
`wirkstoff-marke.ts` aus G-210, 498 Nutzertexte, 2.313 FAQ.

## 2 · Zu tun

**Anlegen, Aendern, Absetzen — und die Verknuepfung auf den Katalog.**

`[read]` **Der Kern ist die Verknuepfung, nicht das Formular.** Wer
*,,Scemblix"* eintraegt, muss auf `drug_0642bd1e2f` landen — **sonst
feuert keine der 31 Medikamentenregeln.** `active_substance_id` ist
das Feld, an dem die ganze Auswertung haengt.

**Absetzen ist kein Loeschen.** `[cmd]` `end_date` und `is_active`
existieren. `[read]` **Was jemand genommen hat, bleibt Teil seiner
Geschichte** — und eine Wechselwirkung, die vor drei Wochen galt,
erklaert einen Laborwert von heute.

## 3 · Die Vorleistung, die den spaeteren Umbau klein haelt

`[read]` **Alle Schreibzugriffe durch genau eine Stelle fuehren.**
`[cmd]` Heute gibt es 32 Fundstellen im Schema und 3 in `apps/web`.

`[read]` **Der Grund steht in `SICHERHEIT.md`:** wenn `name`,
`indication` und `notes` spaeter verschluesselt werden, ist eine
gebuendelte Schreibstelle ein Umbau von Stunden — verstreute
Zugriffe einer von Tagen. **Keine Verschluesselung auf Vorrat, nur
eine Naht an der richtigen Stelle.** Ein Kommentarblock am
Buendelungspunkt verweist auf `SICHERHEIT.md`.

## 4 · Was frei eingegeben werden darf, und was nicht

`[read]` **`name` als Freitext ist noetig** — der Katalog kennt keine
deutschen Handelsnamen (C-308, `DE` bei 0 von 448 Produkten). **Wer
Concor nimmt, muss es eintragen koennen, auch wenn der Katalog es
nicht kennt.**

`[read]` **Aber dann traegt der Eintrag keine
`active_substance_id`, und das muss sichtbar sein.** `[cmd]` **In
G-208 hast du dafuer die Form gebaut:** `begruendet_leer` gegen
`nicht_bearbeitet`, in Rahmen und Farbe unterschieden. **Hier ist es
ein dritter Fall: *nicht zugeordnet* — und er hat eine Folge, keine
nur eine Anzeige.**

`[read]` **Diese Folge gehoert benannt:** ein Medikament ohne
Wirkstoffbindung wird von keiner Regel gesehen. **Nicht als
Fehlermeldung, sondern als ehrlicher Hinweis** — im Ton von *,,Das
heisst nicht, dass es keine gibt."*

## 5 · WAS NICHT ZU TUN IST

**Keine Verschluesselung bauen** — C-285 ist entschieden, die
Bedingungen stehen in `SICHERHEIT.md`.
**Keine Tabelle anlegen und `supabase/_pipeline/` nicht anfassen** —
Codex arbeitet dort an C-310.
**`drug_class` nicht anzeigen** — C-296, die Spalte fuehrt jeden Tag
doppelt und acht Wirkstoffe gleichzeitig als SSRI und MAO-Hemmer.
**Keine Marken erfinden oder ableiten.**
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Anlegen mit Katalogtreffer     active_substance_id gesetzt
    Anlegen ohne Treffer           Eintrag da, Bindung leer,
                                   Folge benannt
    Aendern                        alte Werte nicht verloren
    Absetzen                       is_active false, end_date gesetzt,
                                   Zeile bleibt
    Schreibstellen im Code         Zahl, Soll 1
    Attrappen im neuen Code        Soll 0
    Bildschirmfoto je Zustand      `node tools/schuss.mjs`

`[read]` **Negativprobe:** einen Eintrag mit einer
`active_substance_id` anlegen, die es nicht gibt. **Der Schreibweg
muss ihn ablehnen oder als unzugeordnet fuehren — nicht auf einen
falschen Wirkstoff fallen.** `[cmd]` **Pruef, ob ein Fremdschluessel
das schon erzwingt** — bei `medication_products.formulation_id` war
es so, und dann ist der Befund *,,strukturell ausgeschlossen"* das
Ergebnis. **Kein Constraint loesen, um es doch zu zeigen.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205). Ueber
`python tools/server.py start`, nie `pnpm dev`.
`[cmd]` **A-30 im Kopf behalten:** kein Wert-Import aus dem Leseweg
in eine Browserdatei.
`[cmd]` **Schreibende Nachweise auf `test-user@lumeos.local`** —
Laeufe auf `dev` ueberschreiben Toms Einstellungen.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
