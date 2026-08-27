---
nr: E-01
getroffen: 2026-08-27
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-314, C-311]
modul: medical
---

# E-01 — bei zwei Eintraegen fuer dasselbe Molekuel fuehrt die INN-Form

## Frage

`[cmd]` **Drei Wirkstoffe stehen zweimal im Katalog, mit derselben
CAS-Nummer:**

    103-90-2    Acetaminophen | Paracetamol
    59865-13-3  Ciclosporin   | Cyclosporine
    8064-90-2   Sulfamethoxazole / Trimethoprim
                | Trimethoprim-sulfamethoxazole

**Welcher Eintrag fuehrt?**

## Entscheidung

**Die INN-Form.** Tom, 2026-08-27: *,,paracetamol kennt jeder"*.

## Warum sie traegt

`[cmd]` **Gemessen, was an welchem Eintrag haengt:**

    Paracetamol         2 Produkte   analgesic_antipyretic
    Acetaminophen       1 Produkt    opioid
    Salbutamol          2 Produkte   beta2_agonist
    Albuterol Sulfate   0 Produkte   beta2_agonist
    Ciclosporin         2 Produkte   immunosuppressant,
                                     CYP3A4_inhibitor, CYP3A4_substrate
    Cyclosporine        1 Produkt    immunosuppressant

`[read]` **Die INN-Form ist in allen drei Paaren die reichere.** Es
kostet keine Arbeit, in diese Richtung zu gehen — **es spart welche.**

`[cmd]` **Ciclosporin traegt als einziger das CYP3A4-Profil**, an dem
vier Regeln haengen.

`[cmd]` **Der Acetaminophen-Eintrag traegt `opioid`** — einer der
falschen Tags aus C-296. **Wer ihn zum fuehrenden macht, fuehrt
Paracetamol als Opioid.**

`[read]` **Und der Markt entscheidet mit:** DE und TH benutzen INN.
Recherchiert am 27.08.: Bisoprolol heisst in den USA **Zebeta**, in
Grossbritannien **Cardicor**/**Emcor**, in Oesterreich, Brasilien und
China **Concor**. **Die USA sind der Ausreisser, nicht wir.**

## Was daraus folgt

**Die US-Form wird Synonym, nicht geloescht** — sonst findet niemand
mehr etwas, der `Acetaminophen` eintippt.

**Die Zusammenfuehrung nimmt die reichere Eigenschaftsmenge, nicht die
des fuehrenden Eintrags.** `[read]` *,,Der fuehrende gewinnt"* waere
die naheliegende Regel gewesen und **haette Ciclosporins
CYP3A4-Profil vernichtet — und mit ihm vier Regeln.**

**Die Regel gilt allgemein**, auch wo die INN-Form heute fehlt:
`Glibenclamid` statt `Glyburide`, `Rifampicin` statt `Rifampin`
(C-311).
