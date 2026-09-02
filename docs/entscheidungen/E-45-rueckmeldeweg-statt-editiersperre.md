---
nr: E-45
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-382, C-375, G-238]
modul: nutrition
---

# E-45 — Rueckmeldeweg statt Editiersperre

## Entscheidung

Tom, 2026-09-02, zu C-382:

> coachfall muss ein feedback rein zurueck zu coach falls ein user was
> aendert, sprich coach plant fuer seinen kunden, kunde aendert was
> dann muss der coach zumindest eine meldung kriegen dass er es weiss.
> also kein editierschutz aber rueckmeldeweg.
>
> buddy stuff kann manuell oder per buddyanweisung geaendert werden.
>
> gekaufte sachen brauchen einen digitalen footprint dass sie in
> original oder editiert nicht zurueck auf den marketplace kommen
> koennen.

## Drei Herkuenfte, drei Regeln

    coach_created   editierbar, aber der Coach wird benachrichtigt
    buddy           editierbar, von Hand oder per Anweisung an Buddy
    marketplace     editierbar, aber nicht weiterverkaeuflich
                    -- Original wie Kopie

## Warum kein Editierschutz

`[read]` **E-42 gilt weiter:** *,,wer nicht aendern darf, traegt beim
Loggen etwas Falsches ein."* `[read]` **Eine Sperre erzeugt
unehrliche Daten.**

`[read]` **Und Tom bestaetigt es fuer den Coachfall ausdruecklich:**
**der Kunde darf aendern** — **der Coach muss es nur erfahren.**

## Was daraus folgt

### 1 · Coach: eine Meldung bei Aenderung

`[cmd]` **`coach.pending_actions` traegt bereits Vorschlaege vom
Coach an den Klienten.** `[read]` **Hier geht es in die andere
Richtung** — **eine Meldung, keine Aktion.**

`[cmd]` **Und `coach.action_log` existiert seit C-381**, mit
`SECURITY DEFINER`-Schreibweg.

`[read]` **Zu entscheiden bleibt die Koernung:** jede geaenderte
Position einzeln, **oder eine Meldung je Plan und Tag?** `[read]`
**Zweiteres, sonst ertrinkt der Coach in Zeilen.**

### 2 · Buddy: aendern von Hand oder per Anweisung

`[cmd]` **`coach.client_autonomy.nutrition_level` steht, 1 bis 5.**

`[read]` **Damit ist der Weg vorgezeichnet:** ab einer Stufe darf
Buddy selbst aendern, darunter schlaegt er vor. `[cmd]` **E-11 fuehrt
die Skala, `AUTONOMY_ARCHITECTURE.md` belegt: 5 = autonom.**

### 3 · Marketplace: ein Fingerabdruck

`[cmd]` **`darf_weiterverkaufen boolean NOT NULL DEFAULT true` steht
seit C-375.**

`[read]` **Er reicht nicht.** **Tom verlangt, dass auch eine
*editierte* Fassung nicht zurueck auf den Marktplatz kann** — **also
muss die Herkunft die Aenderung ueberleben.**

`[read]` **Ein `boolean` tut das, solange niemand einen neuen Plan
anlegt und den Inhalt hineinkopiert.** `[cmd]` **Dagegen hilft nur
eine Kennung, die mitwandert** — die gekaufte Vorlage, aus der der
Plan stammt.

**Vorschlag: `stammt_aus_kauf uuid`** — zeigt auf das
Marketplace-Produkt, **wird beim Kopieren mitgenommen und nie
geloescht.**

## Was nicht gebaut wird

`[cmd]` **Der Marktplatz selbst bleibt zurueckgestellt** (E-37).
`[read]` **Hier entsteht nur die Spalte und die Regel, damit ein
spaeterer Verkauf sie vorfindet.**
