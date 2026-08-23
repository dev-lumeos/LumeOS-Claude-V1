# C-225 + G-169 — Fable, 2026-08-23

Bericht: `docs/berichte/c-225-fable.md`

**VORBEREITET, NOCH NICHT FREIGEGEBEN.** Er setzt voraus, dass G-175
durch ist — die Nachweise brauchen ein anmeldbares
`test-user@lumeos.local`. Widerspricht dein G-175-Bericht etwas hier,
kommt ein **Korrekturblock oben drauf**, der Auftrag wird nicht neu
geschrieben.

Coach ist seit G-163 und G-158 dein Modul: Rueckfaelle raus, Kopf liest
echt. **Jetzt fehlen die Schreibwege — bisher kann man dort nur
zusehen.**

---

## WAS ICH GEMESSEN HABE — live, 2026-08-23

`[cmd]` Schema `coach`, zwoelf Tabellen. Bestand:

    relationships       6
    messages            6
    checkins            6
    checkin_templates   2

`[cmd]` **`coach_profiles` existiert nicht** —
`to_regclass('coach.coach_profiles')` ist `null`.

`[read]` **Das steht bereits im Punkt C-225 und ist dort beantwortet:**
es gibt heute keine Namensquelle, weil `public.profiles` kein Namensfeld
fuehrt. **Die Kachel zeigt Rolle und Kurzkennung und sagt das sichtbar
dazu — das ist richtig so und bleibt.** Erfinde keinen Namen und lege
keine Tabelle an.

`[read]` Der Orchestrator hatte das hier zuerst als eigenen Fund
notiert. **Es war keiner — der Punkt trug es schon.** Zum zweiten Mal
an einem Tag ein Auftrag, der aus dem Titel statt aus dem Punkt
geschrieben wurde.


## WAS ZU TUN IST

### C-225 — drei Schreibwege

1. **Antworten** — `messages` INSERT
2. **Einladen** — `relationships` INSERT mit `status='invited'`
3. **Als gelesen** — `messages` UPDATE `read_at`

**Die Namensquelle ist kein Punkt der Liste** — sie fehlt, das ist
geklaert, und die Kachel geht damit richtig um.


`[cmd]` **Der Kopf zeigt seit G-158 die RLS-Sicht**, nicht die
Gesamtzahl — *„1 active · 0 unread"* auf `dev`, gegen 6 gesamt. **Die
Schreibwege muessen dieselbe Sicht bedienen**, sonst zeigt der Kopf
nach dem Schreiben etwas anderes als die Liste.

### G-169 — `checkins` und `checkin_templates` liegen ungelesen

`[cmd]` **6 Check-ins, 2 Vorlagen, kein Lesepfad.** Nach G-158 der
billigste Treffer im Modul.

`[read]` **Wo nichts liegt: Hinweis wie in G-163**, kein Strich und
keine Null.

## WAS NICHT ZU TUN IST

`apps/web/src/app/v2/nutrition` und `.../supplements` **nicht
anfassen** — anderer Agent.
`supabase/_pipeline/` **nicht anfassen** — Codex.

**Keine Tabelle anlegen**, auch nicht `coach_profiles`. Fehlt eine:
melden.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Je Schreibweg: Zeilenzahl vorher und nachher, in der RLS-Sicht von
`test-user@lumeos.local`** — nicht die Gesamtzahl. `[read]` Das ist die
Falle aus C-241, und du bist ihr in G-158 richtig ausgewichen.

**Gegenprobe:** schreiben, dann als anderes Konto lesen — die Zeile
darf dort **nicht** erscheinen. Ohne diesen Beleg ist nur belegt, dass
geschrieben wurde, nicht dass RLS greift.

**Negativprobe:** einen Schreibweg kappen; die Pruefung muss rot
werden.

`node tools/schuss.mjs`, angemeldet als `test-user@lumeos.local` —
nach G-175 ohne Kopierschritt.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
