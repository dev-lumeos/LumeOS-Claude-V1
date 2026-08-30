# G-149 + G-158 — Fable, 2026-08-23

Bericht: `docs/berichte/g-149-fable.md`

**Zuerst gelesen:** dein G-163-Bericht. Die zwei Dateien ueber die
Messliste hinaus (`coach/ansicht.tsx`, `coach/tab-autonomie.tsx`) waren
richtig mitgenommen — dieselbe Klasse, derselbe Beschluss. Und die
Meldung, dass die 19 in `tab-protokolle` Wortvorkommen sind und nicht
17 Marken, hat einen Zaehlfehler von mir korrigiert.

---

## 1 · G-149: der Einnahme-Haken bucht auf den falschen Tag

**Steht seit Tagen unter *„Sofort, weil sichtbar falsch"* und ist
liegengeblieben.**

**KORREKTUR, noch vor deinem Start:** meine erste Fassung dieses
Auftrags hatte die Richtung verdreht. **Es ist umgekehrt.**

`[cmd]` **Wer heute etwas nachtraegt, bucht auf den letzten
protokollierten Tag** — nicht auf heute. Grund: `stichtag` ist der
juengste Protokolltag (2026-08-20), weil `new Date()` im Browser die
Hydration zerlegt (G-74).

`[cmd]` **Der Weg liegt bereit:** `SupplementsAnsicht` nimmt bereits
ein `heute`-Prop entgegen (`heuteProp`) — **die Seite reicht es nur
nicht durch.** Serverseitig gesetzt ist es hydrationssicher.

`[read]` **Der zweite Rest desselben Punktes:** `LogDose` mit Zeit und
Notiz ist nur ueber den Extended-Tab erreichbar. **Ein Stift-Knopf je
Zeile auf „Today" waere der vollstaendige Weg** — dasselbe Muster wie
G-124 beim Wasser. Nimm ihn mit, wenn er ohne Umbau geht; sonst melde
ihn.

`[cmd]` Der Bestand zum Messen: `supplements.intake_logs` **744
Zeilen**, `stack_items` **11**. Auf `test-user@lumeos.local` liegt ein
Stack *„Nachweis-Stack"* mit drei Positionen — Creatine monohydrate
(12 Einnahmen), Vitamin D3 (12), Omega-3 (0).

**Nachweis:** heute etwas nachtragen und in `intake_logs` nachsehen,
auf welches Datum gebucht wurde. **Erwartung vorher hinschreiben.**
**Negativprobe:** das `heute`-Prop wieder kappen — die Buchung muss auf
den alten Tag zurueckfallen und die Pruefung rot werden.

`[read]` **Achtung Bereichsgrenze:** `apps/web/src/app/v2/supplements`
ist frei, aber `lib/supplements/stack-write.ts` gehoert zu C-250 bei
Codex. **Wenn die Korrektur dort hineinreicht: melden und stehen
lassen**, nicht gleichzeitig hineinschreiben.


## 2 · G-158: der Coach-Kopf zaehlt aus Entwurfsdaten

`[cmd]` Du hast es in G-163 selbst gemeldet und stehen gelassen, weil
es ausserhalb des Auftrags lag: der Kopf zeigt *„4 active · 1 unread"*
aus `COACHES` — **einer Entwurfskonstante, nicht aus der Datenbank.**

`[cmd]` Der Rest des Moduls ist seit G-163 echt, mit Leerzustaenden.
**Der Kopf ist die letzte Stelle, die eine erfundene Zahl zeigt — und
er zeigt sie ohne Marke.**

**Zu tun:** an den echten Lesepfad anbinden. Wenn dort nichts liegt:
Hinweis wie in G-163, **kein Strich und keine Null.**

**Nachweis:** die gerenderte Zahl muss der RLS-Sicht von
`test-user@lumeos.local` entsprechen. `[read]` Nicht der Gesamtzahl —
das ist die Falle aus C-241.

## WAS NICHT ZU TUN IST

`apps/web/src/app/v2/nutrition` **nicht anfassen** — Claude Code.
`apps/web/src/lib/supplements/` **nicht anfassen** — Codex, C-250.
`supabase/_pipeline/` **nicht anfassen** — Codex.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## ZWEI MELDUNGEN AUS DEINEM G-163-BERICHT

1. **Das test-user-Passwort:** dein Kopierschritt ist der Grund, warum
   Claude Code sich zeitweise nicht anmelden konnte (`updated_at`
   09:42). Es funktioniert wieder. **Als Dauerloesung angelegt** — bis
   dahin: **wenn du es wieder brauchst, sag Bescheid, bevor du es
   tauschst.** Zwei Agenten, die gleichzeitig am selben Konto drehen,
   ist der naechste Fehler.

2. **Der Encoding-Schaden**, den du repariert hast, lag in Codex'
   Strang. Deine eigene Konsequenz — Skriptdateien statt
   `python - <<EOF` — ist richtig und gilt ab jetzt fuer alle. Sie
   steht in `CLAUDE.md`.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` oder `npx next dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Nachweise auf `test-user@lumeos.local`, nicht auf `dev`.
Repo-Text mit Sonderzeichen **nicht** ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
