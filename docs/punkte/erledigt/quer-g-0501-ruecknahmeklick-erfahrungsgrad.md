---
nr: G-501
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-541
entscheidung: C-541
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: ef84a2c1
beruehrt:
  dateien:
    - apps/web/src/app/v2/settings/formular.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-501 - der Ruecknahmeklick beim Erfahrungsgrad

## Die Entscheidung (C-541)

Tom: *,,dieser zustand kann gar nicht sein"*

`[read]` **Der Grad ist AENDERBAR, nicht LOESCHBAR** ? **wie
ein Geburtsdatum: man korrigiert es, man leert es nicht.**

## Der Befund

Claude Code in G-117:

> *,,*Nicht angegeben* ist ein VORGESEHENER Zustand: der zweite
Klick in den Settings schreibt `''`, und
`z.preprocess(leerZuNull, ...)` macht NULL daraus."*

Codex in C-541:

> *,,Der zweite Klick in `settings/formular.tsx` darf den Grad
nicht mehr leeren; auch der Formularpfad darf NULL nicht mehr
speichern."*

## Was jetzt passiert, wenn niemand nachzieht

`[cmd]` **`experience_level` ist NOT NULL, live.**

`[read]` **Der zweite Klick schreibt weiter NULL** ? **und die
Datenbank weist es ab.** **Der Nutzer sieht einen Fehler, wo
er einen Knopf gedrueckt hat.**

`[cmd]` **MISS das zuerst: was zeigt die Flaeche heute beim
zweiten Klick?**

## Zu bauen

`[read]` **Der zweite Klick waehlt nur um, er leert nicht.**

`[cmd]` **Und `z.preprocess(leerZuNull, ...)` faellt fuer
dieses Feld weg** ? **MISS, ob es andere Felder traegt,
bevor du es anfasst.**

## Abnahmebedingungen

    A1  was passiert heute beim zweiten Klick?
        Gemessen, Foto.
    A2  danach: der Klick waehlt um, leert nicht. Foto.
    A3  der Schreibweg speichert nie NULL. Belegt.
    A4  leerZuNull: welche anderen Felder? Gemessen.
    A5  ein Waechter faengt einen NULL-Schreibweg.
        Sabotageprobe.
    A6  vier Module unveraendert.
    A7  apps/web 2000 oder mehr, apps/coach 65.

## Die Stelle, gemessen 2026-09-08

    formular.tsx:64   experience_level: p.experience_level ?? ''
    formular.tsx:399  onClick={() => setze('ex...')}
    formular.tsx:353  der Vermerk zur Spalte
    formular.tsx:411  profiles.experience_level

`[cmd]` **Zeile 64 macht aus NULL einen Leerstring, Zeile 399
schreibt ihn zurueck.**

`[cmd]` **Und seit C-541 ist die Spalte NOT NULL** ? **die
Datenbank weist es ab.**

`[read]` **Der Nutzer sieht einen Fehler, wo er einen Knopf
gedrueckt hat** ? **das ist heute so, nicht irgendwann.**


## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Proben: web 2006, coach 65.**

> *,,Gemessen: der zweite Klick leerte den Grad, PUT
`/api/profile` antwortete HTTP 500 auf die NOT-NULL-Spalte."*

`[read]` **Er hat den Fehler ERZEUGT, bevor er ihn behoben
hat** ? **die Auflage aus dem Auftrag.**

### Und leerZuNull bleibt, wo es hingehoert

> *,,Ich habe `leerZuNull` auf den SECHS Feldern gelassen, die
berechtigt nullbar sind."*

`[read]` **Nicht die Funktion entfernt, nur das eine Feld
herausgenommen** ? **genau richtig.**

### Zwei Messfehler, die wie Befunde aussahen

> *,,Auf `dev@lumeos.app` fand ich das Produkt nicht ? das
Konto hat eine MARKENVORLIEBE, und *Mary Ruth's* ist korrekt
gefiltert."*

`[read]` **Sein eigenes G-468 hat ihn gefangen** ? **die
Vorliebe wirkt, und er hielt sie fuer einen Fehler.**

**Abgenommen.**



## Bericht

**Claude Code, 2026-09-25.**

### A1 - was heute passiert, gemessen

`[cmd]` **Vorbedingung bestaetigt:**
`public.profiles.experience_level` **ist NOT NULL** (live), 7
Profile: 5 `beginner`, 2 `pro`, **null ohne Grad.**

`[cmd]` **Der zweite Klick auf die gewaehlte Stufe:**

    gewaehlte Stufen vorher   1
    gewaehlte Stufen nachher  0     <- geleert
    dann „Speichern":
      500 PUT /api/profile
      {"error":"null value in column \"experience_level\"
        of relation \"profiles\" violates not-null
        constraint","code":"WRITE_FAILED"}

`[read]` **Und auf dem Schirm stand kein Wort davon** ? die
Meldung nennt den Grund nicht. **Der Nutzer sieht einen
Fehler, wo er einen Knopf gedrueckt hat.**

**Bild:** `tools/_g501-a1-nach-klick.png`

### A4 - `leerZuNull`, gemessen BEVOR ich es angefasst habe

`[cmd]` **Sieben Felder tragen es:**

    birth_date        nullable    bleibt
    biological_sex    nullable    bleibt
    height_cm         nullable    bleibt
    body_weight_kg    nullable    bleibt
    activity_level    nullable    bleibt
    nutrition_goal    nullable    bleibt
    experience_level  NOT NULL    faellt weg

`[read]` **Nur EINES ist NOT NULL** ? **die anderen sechs
behalten ihre Leere.** `[read]` **Wer hier zu breit sperrt,
nimmt dem Nutzer sechs gueltige Zustaende weg** ? eine
Sabotage prueft genau das.

### A2/A3 - gebaut

**Zwei Stellen, zwei verschiedene Aufgaben:**

    formular.tsx:404   if (!gewaehlt) setze(…)
                       der Klick waehlt UM, er leert nicht
    profile-model.ts   experience_level: z.enum(…)
                       ohne leerZuNull, ohne .nullable()

`[read]` **Die Grenze gehoert in den Schreibweg, nicht nur ins
Formular** ? **wer die Serveraktion direkt ruft, kommt am
Knopf vorbei.**

`[cmd]` **Nachher gemessen, dieselbe Probe:**

    zweiter Klick    1 Stufe bleibt gewaehlt (war 0)
    Datenbank        unveraendert `pro`, kein NULL
    Schirm           keine Fehlermeldung
    umwaehlen        wirkt weiter (`beginner` gespeichert)

**Bilder:** `tools/_g501-a1-vorher.png`,
`tools/_g501-a1-nach-klick.png`

`[cmd]` **Und ein Nachweis, der schaerfer ist als die Zahl:**
**nach dem zweiten Klick ist der Speichern-Knopf AUS.**
`disabled={… || !geaendert}` ? **es gibt nichts mehr zu
senden.** `[read]` **Wo frueher ein NULL hinausging, geht jetzt
gar nichts hinaus.** **Nach dem Umwaehlen geht er wieder an**
(auch das gemessen).

`[cmd]` **Ein Probenfehler dabei:** meine erste Fassung klickte
den ausgeschalteten Knopf trotzdem und meldete danach
*,,umwaehlen wirkt nicht"*. `[read]` **Der Klick war ein
Leerlauf, kein Befund** ? die Probe prueft jetzt den
Knopfzustand, statt blind zu klicken.

### Ein Nachweis, dass die Strenge sicher ist

`[cmd]` **`handle_new_user` setzt beim Anlegen `'beginner'`:**

    INSERT INTO public.profiles (id, experience_level)
    VALUES (NEW.id, 'beginner')

`[read]` **Ein Profil ohne Grad kann gar nicht entstehen** ?
**das strengere Schema kann also niemanden aussperren.** **Ohne
diesen Nachweis waere `z.enum(...)` ein Risiko gewesen.**

### A5 - der Waechter

`[cmd]` **Sechs neue Proben in `profile-model.test.ts`**
(21 statt 15). **Drei Sabotagen:**

    leerZuNull zurueck ins Schema  -> 3 rot
    Ruecknahmeklick zurueck        -> 1 rot
    auch activity_level streng     -> 8 rot

`[read]` **Die dritte ist die wichtigste:** sie faengt den
Fehler, den ich selbst haette machen koennen ? **zu breit
sperren.**

### Sechs bestehende Proben wurden rot - richtig so

`[cmd]` **`LEER` in `profile-model.test.ts` fuehrte keinen
Grad.** `[read]` **Die Proben behaupteten *,,nichts anzugeben
muss erlaubt sein"*** ? **und fuer dieses eine Feld stimmt das
seit C-541 nicht mehr.** **Fixture ergaenzt, mit der Messung
als Begruendung.**

### Und ein Dateikopf war ueberholt

`[cmd]` **`profile-model.ts` sagte:** *,,nullable, ohne
Default"* **und** *,,steht auf allen 7 Profilen auf NULL
(2026-08-20)"*. `[read]` **Beides war richtig und ist es
nicht mehr** ? nachgezogen.

### A6/A7

`[cmd]` **`apps/web` 2.006** (2.000 + sechs neue),
**`apps/coach` 65**, **lint/typecheck/build gruen.**

`[cmd]` **Das Gate ist ROT ? aber nicht wegen dieser
Arbeit:** `[sammelfragen]` meldet 2 statt 1, der zweite ist
**`todos/quer-e-0090-der-koerper-als-grundlage.md`**
(*,,10 Abschnitte"*), **committet in `209f8726` vor meinem
Zug.** `[read]` **Ein fremder Entscheidungspunkt ? ich teile
ihn nicht auf.**

### Neustart

`[read]` **Nicht noetig** ? nur `apps/web/src`.

### Werkzeug

    tools/_g501-ruecknahme.mjs   A1-A3, Austritt 0/1,
                                 stellt den Grad wieder her
