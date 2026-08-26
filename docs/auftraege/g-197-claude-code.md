# G-197 + G-198 — Claude Code, 2026-08-26

Bericht: `docs/berichte/g-197-claude-code.md`

**Zwei Reste aus G-196 — und der zweite ist der wichtigere.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.**

`[cmd]` **In G-199 hat das anders gelohnt als erwartet:** neun von
neun Zahlen stimmten, **aber die Zahl, die im Auftrag fehlte, hat den
Bau entschieden** — der Reiter erscheint bei 49 von 412, nicht bei
212.

## 1 · G-197 — der Boden ist rosa, nicht die Toenung

`[cmd]` **`.v2-supp-tafel` traegt im Hellmodus `oklch(0.982 0.006 1)`,
nicht Weiss.** Der Block *„Fuer wen das Verbot gilt"* liegt deshalb bei
**4.32** — unter 4.5, **obwohl die Toenung schon auf 5 % steht.**

`[read]` **Du hast es im Rechtslage-Reiter nachgemessen und
festgestellt, dass der Umzug es nicht loest** — derselbe Boden in
beiden Reitern. **Der Block ist umgezogen, der Grund unter ihm
nicht.**

### Was zu tun ist, und was nicht

`[read]` **Miss zuerst, woher der Ton kommt.** `[cmd]` Aus der
Uebergabe: elf Modul-Akzenttoken bei Luminositaet 0.74–0.80 —
**vermutlich schlaegt der Supplements-Akzent durch.** Wenn ja, ist das
eine Entscheidung ueber das Modul, nicht ueber diese Tafel.

**Drei Wege, und die Wahl gehoert begruendet:**

    Ton entfernen        die Tafel wird weiss - aber dann sieht das
                         Modul aus wie jedes andere
    Ton abschwaechen     0.982 -> naeher an 1.0, Kontrast steigt
    nur unter Warntext   der Block bekommt eigenen Grund

`[read]` **Ich neige zum zweiten**, weil er den Modulcharakter
behaelt und modulweit wirkt. **Aber du misst, ob es reicht** — von
4.32 auf 4.5 sind es nur 4 Prozent, das kann knapp bleiben.

`[read]` **Und pruef, ob andere Module denselben Ton tragen.** Wenn
Recovery und Training ebenfalls getoent sind, **ist es kein
Supplements-Problem, sondern ein Systemproblem** — und dann gehoert es
nicht hier geloest, sondern gemeldet.

## 2 · G-198 — gibt es ein drittes Farbsystem?

`[cmd]` **In G-196 kam heraus: Textkacheln und
`UeberwachungUndReinheit` faerbten von Hand** (`ton: 'acc'`,
`warn: true/false`), **nicht ueber `tonFuer`.**

`[read]` **Das erklaerte, warum G-194 unvollstaendig blieb** — im
selben Bauteil war *„Was nicht zurueckkommt"* richtig gefaerbt und
*„Ueberwachung"* grau. **Nicht aus Nachlaessigkeit, sondern weil zwei
Wege nebeneinander existierten.**

`[cmd]` **Du hast umgestellt — aber nicht gemessen, ob es weitere
Stellen gibt.**

**Zu tun:** alle Farbzuweisungen finden, die nicht ueber `tonFuer`
laufen. `[read]` **Und einen Waechter darauf**, sonst entsteht das
dritte System beim naechsten Block.

## 3 · Der fuenfte blinde Fleck — und was daraus folgt

`[cmd]` **In G-199 blieb die fuenfte Sabotage gruen:**
`.from('community_anzeige')` auf `…X` geaendert, **kein Test fiel um.**

`[cmd]` **Fuenfter Fall derselben Klasse** — G-184, G-186, G-187,
G-191, G-196. **Jedes Mal bewacht die Pruefung die Funktion, nicht die
Verdrahtung.**

`[read]` **Und einmal ist es teuer geworden:** genau so ist G-192
haengen geblieben. Der Lesepfad gab still `null` zurueck, **und
niemand merkte es, bis Tom fragte, wo das Community-Zeug bleibt.**

**Zu tun — und das ist der eigentliche Auftrag:**

`[read]` **Nicht noch einen Einzelwaechter.** Die letzten fuenf haben
jeweils die eine Stelle bewacht, an der es aufgefallen war. **Miss,
ob es eine gemeinsame Form gibt:** ein Tabellenname, ein Feldname, ein
Komponentenname, der in einem Lesepfad steht und in keinem Test.

`[read]` **Wenn es eine gibt, bau sie einmal.** Wenn nicht, **sag es**
— dann bleibt es bei Einzelwaechtern, und das ist ein Befund ueber die
Architektur, kein Versagen.

`[cmd]` **Die fuenf Faelle als Material:** `wadaNote={undefined}` kam
durch, weil der Name in der Typdeklaration weiterlebte ·
`/daten\?\.wechselwirkungen/` traf auch `…wechselwirkungenX` ·
`.from('community_anzeige')` auf `…X` fiel nicht auf.

## WAS NICHT ZU TUN IST

**Keinen neuen Farbwert erfinden.** Nur vorhandene Tokens.
**Kein Modul umbauen** — wenn der Ton systemweit ist, melden.
**Keinen Waechter bauen, der nur eine Stelle deckt** — davon haben
wir fuenf.

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-286.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Kontrast vor und nach**, hell und dunkel, mit erzwungenem Thema je
Lauf. `[cmd]` **Heute: 4.32 im Hellmodus.**

**Zahl der Farbzuweisungen ausserhalb von `tonFuer`** — vorher und
nachher.

**Fuer Punkt 3: die fuenf bekannten Faelle als Gegenprobe.** `[read]`
**Ein neuer Waechter, der sie nicht alle findet, loest das Problem
nicht** — dann sind es weiterhin fuenf Einzelfaelle.

**Negativprobe:** eine Verdrahtung an einer **sechsten**, bisher
unbeteiligten Stelle kappen — **der Waechter muss sie finden, ohne
dass sie namentlich in ihm steht.**

`node tools/schuss.mjs`, **beide Themen**, 1280 und 1920.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 351936.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
