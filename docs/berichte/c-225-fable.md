# C-225 + G-169 — Die drei Schreibwege des Coach-Moduls, und der Check-in-Lesepfad

**Bearbeiter:** Fable · **Datum:** 2026-08-23 · **Branch:** dev (nicht committet)

## Ergebnis in einem Satz

Antworten, Einladen und Als-gelesen schreiben jetzt echt in `coach.messages`
und `coach.relationships` — je Weg mit Vorher/Nachher in der RLS-Sicht von
`test-user@lumeos.local` belegt —, und der Check-ins-Tab liest
`coach.checkins` (6) und `coach.checkin_templates` (2) statt des
105-Zeilen-Entwurfs.

## Was gebaut wurde

| Datei | Änderung |
|---|---|
| `apps/web/src/lib/coach/nachrichten-schreiben.ts` | NEU — drei Server Actions nach dem `rechte-schreiben`-Muster (G-90): `sendeNachricht` (messages INSERT), `ladeCoachEin` (relationships INSERT, `status='invited'`, `invited_by=uid`), `markiereGelesen` (messages UPDATE `read_at`, nur wo `read_at is null`). Alle drei mit `.select('id')`-Pflicht gegen stille Nullzeilen (G-79) und `revalidatePath('/v2/coach/human')`, damit der Kopf dieselbe RLS-Sicht zeigt. |
| `apps/web/src/lib/coach/rechte-read.ts` | +`CheckinVorlage`/`CoachCheckin`-Typen, +`vorlagen`/`coachCheckins` im Stand, zwei weitere Abfragen im `Promise.all`. |
| `apps/web/src/app/v2/coach/uebersicht-echt.tsx` | `InviteFormular` (Kennung-UUID + Notiz) — **auch im Leerzustand**, siehe unten; `ThreadsEcht` baut Threads je BEZIEHUNG statt je Nachricht, damit eine frische Einladung ein Sendefeld hat; je Thread Antwort-Eingabe, Senden, „Als gelesen (n)". |
| `apps/web/src/app/v2/coach/tab-autonomie.tsx` | `CheckinsEcht` (Check-ins mit Termin/Status/Notiz/Feedback + Vorlagen mit Feld-Pills); der fest verdrahtete Checkins-Entwurf (105 Zeilen, `CHECKIN_TEMPLATES`/`CHECKIN_HISTORY`) ist raus (G-163-Beschluss). |
| `apps/web/src/app/v2/coach/ansicht.tsx` | reicht `stand` an `AthleteCheckins` durch. |
| `v2-attrappen.test.ts` | neuer Wächter „C-225/G-169" (Schreibwege + Lesepfad + genau 3× `.select('id')`), Marken-Erwartung COACH_AUTO 3→0. |

**Kein Name erfunden, keine Tabelle angelegt.** Die Kachel zeigt weiter
Rolle + Kurzkennung; eingeladen wird per UUID. `[read]` Eine Namens- oder
E-Mail-Auflösung bräuchte eine DB-Funktion (`auth.users` ist für Clients
bewusst nicht lesbar) — **gemeldet, nicht danebengebaut** → Codex.

## Nachweise (alle als test-user@lumeos.local, Anmeldung ohne Kopierschritt nach G-175)

Erwartung VOR dem Lauf fixiert: test-user-RLS-Sicht 0 Beziehungen, 0
Nachrichten, 0 Check-ins/Vorlagen. Konten: coach.seed
`10000000-…901`, test-user `61e9f10a-…`, dev `d15fb34f-…`.

**Weg 1 — Einladen** `[cmd]` Formular Overview-Tab, Kennung coach.seed,
Notiz `C-225-Nachweis` → `relationships` in tu-Sicht **0 → 1**, die Zeile
trägt `status='invited'` und die Notiz. Bild: `backup/c225-eingeladen.png`
(Beziehungskarte „invited · C-225-Nachweis").

**Weg 2 — Antworten** `[cmd]` Antwort im (noch nachrichtenlosen) Thread →
`messages` in tu-Sicht **0 → 1** (`body='C-225-Testnachricht'`). Bild:
`backup/c225-gesendet.png` („Gesendet."; die Threadliste dort ist der
Stand vor dem Refresh — der INSERT ist per DB-Zählung belegt, die
gerenderte Liste im Gelesen-Bild).

**Weg 3 — Als gelesen** `[cmd]` Fremde Nachricht per SQL eingespielt
(sender = coach.seed), Klick „Als gelesen" → `read_at` **null → gesetzt**.
**Die Policy-Grenze wurde sichtbar:** die EIGENE Nachricht blieb
unmarkiert (`gelesen = f`) — `messages_update` lässt nur fremde zu, genau
wie dokumentiert. Bild: `backup/c225-gelesen.png` (2 Nachrichten
gerendert, Kopf „0 unread", der Gelesen-Knopf ist verschwunden).

**Gegenprobe RLS** `[cmd]` dev-Sicht nach allen drei Schreibwegen:
**1 Beziehung, 2 Nachrichten, 0 der C-225-Zeilen** — unverändert wie vor
dem Lauf. Die coach.seed↔test-user-Zeilen erscheinen bei dev nicht.

**Negativprobe** `[cmd]` Ein `.select('id')` aus `sendeNachricht`
entfernt → Wächter `not ok 131 - C-225/G-169…` → zurückgedreht.

**G-169-Rendering** `[cmd]` `backup/c225-checkins-dev.png`: CheckinsEcht
mit 3 Check-ins (pending 26.8. / submitted 19.8. / reviewed 12.8. samt
Coach-Feedback) und 1 aktiver Vorlage mit fünf Feld-Pills — dev-RLS-Sicht,
per SQL 3 + 1 gemessen. `backup/c225-checkins-testuser.png`: Hinweis
„Noch keine Check-ins" (tu-Sicht 0).

## Gezählter Rückbau

`[cmd]` In einer Transaktion, Trigger `relationships_change_log`
DISABLE/ENABLE: **2 Nachrichten, 1 Logzeile, 1 Beziehung** gelöscht.
Danach test-user **0 Beziehungen / 0 Nachrichten** (Zeilenschutz-Zustand,
wie `coach-portal-fuellen` ihn erwartet), dev weiter 2 Nachrichten.

## Beim Nachweis selbst gefunden und behoben

1. **Das InviteFormular fehlte im Leerzustand.** Der erste Nachweislauf
   lief in einen Timeout: bei 0 Beziehungen renderte `CoachesEcht` nur
   den Empty-Zweig — ohne Einladen-Formular. Gerade dort entsteht aber
   die erste Beziehung. Formular in beide Zweige gehängt.
2. **`checkin_templates.fields` ist eine jsonb-OBJEKTLISTE** —
   `{key, typ, label}`, nicht `string[]`. Mein Typ hatte geraten statt
   gemessen; die dev-Seite crashte mit „Objects are not valid as a React
   child". `[cmd]` Struktur per SQL gemessen, Typ korrigiert, gerendert
   werden jetzt die `label`.

## Meldungen (nicht gebaut)

- **E-Mail-/Namens-Auflösung beim Einladen** bräuchte eine
  SECURITY-DEFINER-DB-Funktion → Codex-Auftrag.
- **Der Kopf-Knopf „Invite coach"** öffnet weiterhin das Entwurfsmodal
  (Attrappe) — das echte Formular sitzt im Overview-Tab. Eigener Punkt.
- **tsc trägt einen fremden Fehler:** `substanz-detail.tsx(216)`
  `Cannot find name 'anriss'` — Codex' C-252-Baustelle, nicht angefasst.

## Schlussstand

`[cmd]` `pnpm --filter @lumeos/web test`: **534/534 grün** (534. ist der
neue Wächter). tsc: sauber bis auf den fremden C-252-Fehler.
