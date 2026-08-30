# G-185 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-185-claude-code.md`

**Zwei Wege zum Einladen, und der sichtbarere ist die Attrappe.**

Von Fable in C-225 gemeldet, nicht gebaut — es lag ausserhalb seines
Auftrags. **Richtig gemeldet, jetzt faellig.**

---

## Der Befund ist groesser als der eine Knopf

`[cmd]` `ansicht.tsx:150` — der Kopf-Knopf *„Invite coach"* oeffnet
`kontext.open({ typ: 'invite' })`, also das **Entwurfsmodal**.

`[cmd]` `ansicht.tsx:91` — es gibt einen **ganzen Reiter *„Invites"***,
und seine Zahl kommt aus `PENDING_INVITES.length`, einer
**Entwurfskonstante**.

`[cmd]` `ansicht.tsx:228` — im Reiter noch ein zweiter Knopf
*„New invite"*, derselbe Weg ins Modal.

`[cmd]` **18 Verwendungen von `PENDING_INVITES`, `COACHES` und
`COACH_NOTES`** in derselben Datei.

`[read]` **Das echte Formular sitzt seit C-225 im Overview-Tab** und
schreibt in `coach.relationships` — Fable hat drei Schreibwege belegt,
je mit Vorher/Nachher in der RLS-Sicht.

`[read]` **Wer oben klickt, landet in einer Attrappe und merkt nicht,
dass daneben der echte Weg liegt.**

## Die Daten liegen vor

`[cmd]` `coach.relationships`: **4 mit `status='active'`, 2 mit
`status='invited'`.** Die offenen Einladungen sind echte Zeilen.

`[cmd]` `coach.messages` 6 · `coach.checkins` 6 ·
`checkin_templates` 2 — alles seit C-225 und G-169 angebunden.

## WAS ZU TUN IST

### 1 · Der Kopf-Knopf fuehrt auf das echte Formular

**Oder er verschwindet.** `[read]` **Deine Entscheidung, mit
Begruendung** — ein Knopf, der auf einen anderen Reiter springt, ist
manchmal schlechter als keiner.

### 2 · Der Invites-Reiter liest `relationships`

`status = 'invited'`, mit Datum und Notiz. `[cmd]` Heute sind das **2
Zeilen**; auf `test-user@lumeos.local` gemessen kann es 0 sein — dann
**Leerzustand mit Hinweis, kein Strich und keine Null.**

`[read]` **Und der Leerzustand braucht den Weg zum Einladen** — genau
das war Fables Fund in C-225: bei 0 Beziehungen rendete nur der
Empty-Zweig, ohne Formular. **Dort entsteht die erste Beziehung.**

### 3 · `PENDING_INVITES` fliegt

`[read]` **G-163-Beschluss:** Rueckfallfassungen und Entwurfskonstanten
gehen raus, sie bleiben nicht als Notfallanzeige stehen.

`[cmd]` **`COACHES` und `COACH_NOTES` stehen in derselben Datei** —
**miss, ob sie noch verwendet werden.** Wo sie es sind: melden, nicht
mitreissen. `[cmd]` G-158 hat den Kopfzaehler bereits auf den echten
Stand umgestellt.

## WAS NICHT ZU TUN IST

**Keine Tabelle anlegen, keinen Namen erfinden.** `[cmd]` Eingeladen
wird per UUID — eine Namensaufloesung braucht eine DB-Funktion und ist
als **C-268** offen. `auth.users` ist fuer Clients bewusst nicht
lesbar.

**Keinen zweiten Schreibweg bauen.** Das Formular aus C-225
(`lib/coach/nachrichten-schreiben.ts`, `ladeCoachEin`) ist der Weg.

`supabase/_pipeline/` nicht anfassen — Codex arbeitet an C-265.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

`node tools/schuss.mjs`, `test-user@lumeos.local`.

**Erwartung vor dem Lauf:** wie viele Einladungen der Reiter zeigt —
in der RLS-Sicht, nicht die Gesamtzahl 2. `[read]` **Das ist die Falle
aus C-241**, und Fable ist ihr in C-225 richtig ausgewichen.

**Gegenprobe:** eine Einladung anlegen, der Reiter zeigt sie; danach
gezaehlt zurueckbauen. `[read]` **Fables Rueckbau in C-225 ist das
Muster** — 2 Nachrichten, 1 Logzeile, 1 Beziehung, Trigger
kontrolliert abgeschaltet.

**Negativprobe:** `PENDING_INVITES` wieder einbauen, der Waechter aus
`v2-attrappen.test.ts` muss rot werden.

**Bilder:** Kopf mit Knopf · Invites-Reiter gefuellt · Invites-Reiter
leer.

## ACHTUNG BEIM COMMIT

`[cmd]` **`pnpm gate` ist derzeit rot** — am neuen Kennungswaechter aus
C-267, wegen dreier echter Konflikte, die bewusst nicht korrigiert
werden. **Das ist nicht deine Arbeit.** Codex baut die Ausnahmeliste.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Nachweise auf `test-user@lumeos.local`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
