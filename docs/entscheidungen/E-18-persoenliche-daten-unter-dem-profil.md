---
nr: E-18
getroffen: 2026-08-27
von: Tom
status: richtung_gesetzt
loest_ab: null
abgeloest_durch: null
betrifft: [E-17]
modul: quer
---

# E-18 — persoenliche Daten gehoeren in eigene Tabellen unter dem Profil

## Richtung

Tom, 2026-08-27: *,,ich denke alle persoenlichen werte sollten in
persoenliche tables unter des users profil sein. dann haben wir ein
userprofil das wir auch sauber exportieren koennen."*

`[read]` **Der Zweck ist der Export**, nicht die Ordnung. Ein Nutzer
muss seine Daten vollstaendig mitnehmen koennen — und wir muessen sie
vollstaendig loeschen koennen.

## Die Lage, gemessen

`[cmd]` **Persoenliche Daten liegen heute in sieben Schemas:**

    mit user_id     nutrition 15 · supplements 9 · goals 6
                    medical 4 · recovery 3 · public 1 · training 1
                                                          = 39

    ohne user_id    supplements 44 · nutrition 21 · medical 18
                    coach 12 · wissen 10 · training 7 · public 1
                                                          = 113

`[read]` **Die Trennung existiert bereits — sie hat nur keinen
Namen.** 39 persoenliche gegen 113 Katalogtabellen, sauber
unterscheidbar an einer Spalte.

## Zwei Wege, und sie unterscheiden sich stark im Preis

**Ein Schema `profil.`**, in das die 39 wandern. `[cmd]` Der Umzug
bricht jede Abfrage, jede Policy und jede Kettendatei — **und
`rule_assessment` liest neun dieser Tabellen.** `[read]` **Ein Umbau
von Tagen mit einem Risiko, das sich vorher nicht abschaetzen
laesst.**

**Oder: die Trennung bleibt und wird benannt** — eine gepflegte Liste
der 39 plus ein Waechter, der jede neue Tabelle mit `user_id`
einfordert. `[read]` **Dann gibt es den sauberen Export, ohne dass
eine Zeile umzieht.**

## Offen

`[read]` **Welcher Weg, ist nicht entschieden.** `[annahme]` Ich halte
den zweiten fuer richtig, weil der Export das Ziel ist und ihn beide
Wege gleich gut erreichen.

`[read]` **Der erste hat einen Vorteil, der nicht kleinzureden ist:**
**ein Schema laesst sich mit einem Befehl exportieren und mit einem
Befehl loeschen.** Bei einer Liste haengt beides daran, dass die
Liste stimmt — **und heute ist genau das die Schwaeche, die wir
gerade bei der Punktverwaltung behoben haben.**

`[read]` **E-17 gilt unabhaengig davon:** die zwei neuen Tabellen
werden so gebaut, dass beide Wege offen bleiben.

## Verwandt

`docs/todo/SICHERHEIT.md` — dort steht, was vor Produktiv zu tun ist.
**Der Export gehoert dazu und ist dort noch nicht genannt.**

## Nummernwechsel

`[read]` **Diese Richtung hiess zuerst E-03**, umnummeriert wegen
einer Kollision, die ich waehrend des laufenden Auftrags A-55 selbst
verursacht habe.
