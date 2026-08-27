# G-203 — Claude Code, 2026-08-27

Bericht: `docs/berichte/g-203-claude-code.md`

**Von deinen 880 ms bis in die Anwendung liegen 172 in der Datenbank.
Miss, wo die anderen 700 bleiben.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[read]` **Diese hier sind sogar deine eigenen aus
G-190** — das macht sie nicht sicherer, es macht sie nur aelter.

## Der Stand

`[cmd]` **Aus G-190, von dir gemessen und ausdruecklich als nicht
dazugehoerig gemeldet:** `ladeRegeln` braucht auf `dev@lumeos.app`
**172 ms in der Datenbank und 880 ms bis in die Anwendung.**

`[read]` **Das ist der groessere Posten.** G-190 hat 1.123 auf 998 ms
gedrueckt, indem sieben Abfragen parallel laufen. **Die Untergrenze
bleibt die langsamste — und die besteht zu vier Fuenfteln aus
Ueberbau.**

`[cmd]` **Vom Orchestrator nachgesehen, damit du nicht suchen musst:**
`ladeRegeln` steht in `apps/web/src/lib/supplements/regeln-read.ts:74`
und setzt zwei Aufrufe in ein `Promise.allSettled` —
`rpc('rule_assessment')` und `from('rule_catalog').select(...)`.
`[cmd]` `rule_catalog` hat **64 Zeilen**; die RPC liefert die
Bewertung des Tages.

`[cmd]` **Die Konten:** `dev@lumeos.app` 360 Einnahmen,
`test-user@lumeos.local` 24. **Jede Leistungszahl nennt ihr Konto** —
der Unterschied ist Faktor 15 und der Grund fuer C-279.

## Zu tun

**Miss, woraus die 700 ms bestehen.** `[read]` Vier Erklaerungen sind
denkbar, und sie fuehren zu verschiedenen Reparaturen:

    Zeilenzahl          -> weniger holen
    Antwortgroesse      -> schmalere Auswahl
    fehlende Kompression-> Serverseite
    Zahl der Rundreisen -> zusammenlegen

`[read]` **Das sind meine Vermutungen, keine Liste zum Abhaken.**
Wenn es eine fuenfte Ursache gibt — Auth-Rundreise, Kaltstart,
Middleware, Serialisierung —, ist sie genauso ein Ergebnis.

`[cmd]` **`ladeRegeln` ruft vor beiden Abfragen `auth.getUser()`.**
`[annahme]` Ich weiss nicht, ob das eine eigene Rundreise kostet.
**Miss es mit, es ist billig.**

**Trenn die Zeit in Abschnitte**, die einzeln benannt sind — Server
gegen Transport gegen Anwendung. `[read]` **Eine Gesamtzahl sagt
nicht, wo zu reparieren waere.**

**Miss auf beiden Konten.** `[read]` Wenn die 700 ms auf test-user
genauso hoch sind, ist es Ueberbau und unabhaengig von der
Datenmenge — **das waere der wichtigste Einzelbefund dieses
Auftrags**, weil es C-279 und C-278 sauber trennt.

## WAS NICHT ZU TUN IST

**Nichts reparieren.** `[read]` **Dies ist ein Messauftrag.** Was du
findest, wird ein Punkt und dann ein eigener Auftrag. **Eine Messung,
die nebenbei umbaut, misst hinterher etwas anderes.**

**`supabase/_pipeline/` und `tools/` nicht anfassen** — Codex
arbeitet dort an C-291.
**Kein Schreibweg fuer `user_medications`** — C-285 ist offen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    Datenbankzeit         gemessene ms, je Konto
    Transportzeit         gemessene ms, je Konto
    Anwendungszeit        gemessene ms, je Konto
    Summe                 stimmt mit der Gesamtzeit ueberein
    Antwortgroesse        Bytes, je Abfrage
    Rundreisen            Zahl, einschliesslich getUser
    Kompression           an oder aus, belegt

`[read]` **Die Summe der Abschnitte muss die Gesamtzeit ergeben.**
Wenn ein Rest bleibt, ist der Rest der Befund — **nicht wegrunden.**

`[read]` **Gegenprobe:** dieselbe Abfrage einmal direkt gegen
PostgREST, ohne die Anwendung. **Wenn die Zeit dort verschwindet,
liegt es nicht am Transport.** Das ist der Beleg, der die vier
Erklaerungen auseinanderhaelt.

## REGELN

`[cmd]` **Der Dev-Server ist aus** (seit deiner G-200-Sitzung, PID
351936). **Fuer diesen Auftrag darfst du ihn starten:**
`python tools/server.py start`. **Nie `pnpm dev`**, `.next` nie
loeschen, `next build` nie direkt aufrufen.

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Messungen mit echten Daten gehoeren auf `dev@lumeos.app`**
— aber **nichts dort speichern**, das ueberschreibt Toms
Ansichtseinstellungen. Schreibende Nachweise auf
`test-user@lumeos.local`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
