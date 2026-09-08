---
nr: E-74
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-429, G-241, E-26]
modul: medical
---

# E-74 — erfassen ist nicht diagnostizieren

## Entscheidung

Tom, 2026-09-08:

> wir sind kein arzt, aber wir koennen daten fuer den user sammeln
> die er zur verfuegung stellt und dessen inhalt mit herkunft bei
> fragen des users wiedergeben. sprich ja fuer diagnosen,
> treatments, surgery (zb bei mir ich hab ein kuenstliches
> fussgelenk das ist wichtig zu wissen und ich stelle die daten ja
> freiwillig zur verfuegung), timeline, documents etc. auch
> allfaellige appointments koennten wir verwalten

## Der Widerspruch, den es aufloest

`[cmd]` **`SPEC_01_MODULE_CONTRACT.md:10`:** **,,KEIN Arzt. KEINE
Diagnose. KEIN Therapieplan."**

`[read]` **Der Orchestrator hat das so gelesen, als duerfe eine
Diagnose nicht einmal erfasst werden.**

`[read]` **Das ist falsch.** **Der Vertrag verbietet, dass LumeOS
diagnostiziert** — **nicht, dass der Nutzer eintraegt, was ein Arzt
bereits gesagt hat.**

`[read]` **Ein kuenstliches Fussgelenk ist eine Tatsache, keine
Einschaetzung.**

## Was gilt

**Erfassbar, weil der Nutzer sie freiwillig gibt:**

    Diagnosen      was ein Arzt festgestellt hat
    Behandlungen   was verordnet oder durchgefuehrt wurde
    Operationen    Implantate, Eingriffe, Datum
    Zeitachse      die Abfolge dieser Ereignisse
    Dokumente      Originale: Befunde, Rezepte, Bildgebung
    Termine        Arzt, Labor, Nachsorge

**Nicht erlaubt bleibt:**

`[read]` **Aus diesen Daten eine eigene Diagnose ableiten.**
`[read]` **Eine Therapie empfehlen.** `[read]` **Einen Wert als
krankhaft bewerten.**

## Die Herkunft traegt die Last

Tom: *,,dessen inhalt mit herkunft bei fragen des users
wiedergeben."*

`[read]` **Jeder Eintrag sagt, woher er kommt:** **wer ihn gestellt
hat, wann, und ob ein Dokument dahinterliegt.**

`[read]` **Damit ist die Wiedergabe ein Zitat, keine Aussage** —
**LumeOS sagt nicht *,,du hast X"*, sondern *,,Dr. Y hat am
Z. X festgestellt"*.**

`[cmd]` **Dieselbe Machart wie `measurement_source` und
`source_detail`** — **und wie die Herkunftsfelder, die fuer Buddy
vorgesehen sind.**

`[cmd]` **Und wie der Coach-Namenssnapshot** (C-268): **die Herkunft
friert ein, sie wird nicht nachgeschlagen.**

## Warum es fuer Buddy zaehlt

`[cmd]` **`00_MASTER_VISION.md`: Buddy ist das Produkt, die Module
naehren sein Wissen.**

`[read]` **Ein Buddy, der nicht weiss, dass ein Fussgelenk
kuenstlich ist, gibt gefaehrliche Trainingsvorschlaege.**

`[read]` **Und ein Buddy, der es weiss, muss sagen koennen, woher**
— **sonst ist es eine Behauptung.**

## Was zu bauen ist

`[read]` **Erst das Ablegen, dann die Struktur** — **G-241 hat
Documents beauftragt, und ein Arztbericht ist zuerst ein
Dokument.**

`[cmd]` **`user_medications` darf erst gebaut werden, wenn
Verschluesselung und Schluesselverwaltung stehen** — **fuer
Diagnosen und Operationen gilt dasselbe zu pruefen.**
