# C-310 — Codex, 2026-08-27

Bericht: `docs/berichte/c-310-codex.md`

**`Acetaminophen` und `Paracetamol` stehen beide im Katalog, mit
derselben CAS-Nummer. Die Regel-Engine sieht zwei verschiedene
Stoffe.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **Heute lagen meine Zahlen dreimal daneben,
jedes Mal weil die Abfrage den falschen Ausschnitt traf** — 27 statt
18 Attrappen, 5 statt 7 Tabellen, 124 statt 380 Wirkstoffe mit
Produkt. **Der Fehler wiederholt sich, wenn niemand nachmisst.**

## 1 · Der Befund

`[cmd]` **Gleiche CAS-Nummer, zwei Eintraege:**

    103-90-2    Acetaminophen  |  Paracetamol
    59865-13-3  Ciclosporin    |  Cyclosporine
    8064-90-2   Sulfamethoxazole / Trimethoprim
                |  Trimethoprim-sulfamethoxazole

`[cmd]` **Und `synonyms` verbindet sie nicht:** Acetaminophen traegt
`{acetaminophen}`, Paracetamol `{paracetamol}`. **Die beiden wissen
nichts voneinander.**

`[cmd]` **Die ATC-Codes weichen ab:** Acetaminophen traegt
`["N02AC","N02AJ","N02BE","R01BA","R05CA"]`, Paracetamol `N02BE01`.
**Zwei Datensaetze, zwei Klassifizierungen, ein Molekuel.**

`[read]` **Das ist die Klasse, die bei den Supplements 18
Dublettengruppen ergab und ueber `parent_id` aufgeloest wurde.**
`[cmd]` **`medication_active_substances` hat kein `parent_id`.**

## 2 · Es gibt einen zweiten Weg, und er ist unvollstaendig

`[cmd]` **CAS findet nur, was eine CAS hat** — 9 Wirkstoffe haben
keine, alle mit dokumentierter Begruendung (Mischpraeparate).

`[cmd]` **Ueber gleiche ATC-Codes finden sich weitere Paare, aber sie
sind KEINE Dubletten:**

    G03BA03   Testosterone undecanoate | Testosterone enanthate
    C07AB     Nebivolol | Bisoprolol
    C01EB     Ranolazine | Ivabradine

`[read]` **Verschiedene Stoffe derselben Gruppe.** Der ATC-Code ist
je nach Stelligkeit Gruppe oder Substanz — **`C07AB` ist eine Gruppe,
`C07AB07` waere Bisoprolol.** `[read]` **Wer ueber ATC entdubliziert,
wirft Wirkstoffe zusammen, die nichts miteinander zu tun haben. Das
waere schlimmer als das Problem.**

## 3 · Zu tun

**Erst zaehlen, dann entscheiden — nichts zusammenfuehren, bevor die
Liste steht.**

    Dubletten ueber CAS               Zahl, je Paar benannt
    davon mit abweichendem ATC        Zahl
    davon mit abweichenden Texten     Zahl
    US/EU-Freinamenpaare ohne CAS     Zahl, gesucht ueber eine
                                      benannte Liste bekannter Paare

`[cmd]` **Bekannte Paare, die im Katalog fehlen** — vom Orchestrator
geprueft, jeweils nur die US-Form vorhanden:

    Glyburide    ohne  Glibenclamide
    Rifampin     ohne  Rifampicin

`[cmd]` **Und `Epinephrine`/`Adrenaline`, `Meperidine`/`Pethidine`
fehlen beide ganz.** `[read]` **Nicht anlegen** — das ist eine
Datenluecke fuer C-294, kein Dublettenfall.

**Danach vorschlagen, nicht ausfuehren:** wie die Zusammenfuehrung
aussehen soll. `[read]` **`parent_id` wie bei den Supplements, ein
`synonyms`-Eintrag, oder eine eigene Zuordnungstabelle** — jede
Variante hat Folgen fuer die Regel-Engine, und die gehoeren benannt,
bevor jemand baut.

## 4 · WAS NICHT ZU TUN IST

**Keine Zeile loeschen, keine zusammenfuehren.** `[read]` **Dieser
Auftrag erhebt.** Welcher der beiden Eintraege der fuehrende ist, ist
eine fachliche Frage — **bei `Paracetamol` gegen `Acetaminophen` haengt
sie am Markt, nicht an der Datenlage.**
**Nicht ueber ATC entduplizieren** — siehe oben.
**`drug_class` nicht anfassen** (C-296), **keine Produktdaten**
(C-308), **kein Schreibweg fuer `user_medications`** (C-302).
`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    CAS-Dubletten                     Liste, je Paar mit beiden IDs
    betroffene Regeln                 welche der 31 feuern heute nur
                                      bei einem der beiden?
    betroffene Texte                  hat jeder Eintrag eigene
                                      Nutzertexte und FAQ?
    Produkte je Eintrag               haengen an beiden Produkte?

`[read]` **Die zweite Zeile ist die wichtigste.** Wenn eine
Interaktionsregel auf `Acetaminophen` zeigt und der Nutzer
`Paracetamol` eingetragen hat, **feuert sie nicht** — und das ist
kein Anzeigefehler, sondern eine ausbleibende Warnung.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Lesend gegen live ist in Ordnung; **fuer alles Schreibende
Wegwerf-Datenbank.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
