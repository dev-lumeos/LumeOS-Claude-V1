# C-269 + C-268 — Codex, 2026-08-25

Bericht: `docs/berichte/c-269-codex.md`

**Zwei Punkte, die beide daran haengen, dass eine Beziehung nicht
loeschbar ist und niemand einen Namen dazu kennt.**

---

## 1 · C-269 — Einladungen lassen sich nicht zuruecknehmen

`[read]` **Von Claude Code in G-185 gefunden, beim Rueckbau seines
eigenen Nachweises.** Er hat deshalb keinen Knopf zum Zuruecknehmen
gebaut — **statt einen zu bauen, der scheitert.**

`[cmd]` **Der AFTER-DELETE-Trigger `relationships_change_log` schreibt
die `relationship_id` ins Log, und der Fremdschluessel dorthin
verbietet genau das Loeschen.** Sein Rueckbau ging nur mit
kontrolliert abgeschaltetem Trigger.

`[cmd]` **Fable ist demselben Widerstand in C-225 begegnet** — auch er
musste den Trigger fuer den gezaehlten Rueckbau abschalten. **Zwei
Agenten, derselbe Fund, keiner hat ihn umgangen.**

`[read]` **Die Folge ist konkret:** die Oberflaeche kann eine
Einladung nicht zuruecknehmen. `[cmd]` Heute stehen zwei Zeilen mit
`status='invited'` in `coach.relationships`, beide bei
`sarah.seed@example.com`.

### Zu tun

**Erst messen, welche Fremdschluessel auf `relationships` zeigen** —
`relationship_change_log` ist einer, es koennen mehr sein.

**Dann entscheiden, und die Entscheidung begruenden:**

    ON DELETE SET NULL      Log bleibt, Verweis wird leer
    ON DELETE CASCADE       Log verschwindet mit
    Statuswechsel statt
    Loeschen                'invited' -> 'withdrawn', Zeile bleibt

`[read]` **Der dritte Weg ist der wahrscheinlichste** — ein
Aenderungsprotokoll, das beim Loeschen verschwindet, ist kein
Protokoll. Und eine zurueckgenommene Einladung ist ein Vorgang, kein
Nichts. **Aber miss zuerst, was `status` heute an Werten kennt.**

`[read]` **Wenn du zu einem anderen Schluss kommst: begruenden.** Ich
habe die Tabelle nicht gebaut.

### Nachweis

**Eine Einladung anlegen, zuruecknehmen, zaehlen** — ohne Trigger
abzuschalten. `[cmd]` Vorher/nachher in der RLS-Sicht von
`test-user@lumeos.local`, nicht die Gesamtzahl.

**Negativprobe:** den alten Zustand wiederherstellen, das Loeschen
muss wieder scheitern.

---

## 2 · C-268 — beim Einladen gibt es keine Namensaufloesung

`[cmd]` **Eingeladen wird per UUID.** Die Kachel zeigt Rolle und
Kurzkennung.

`[read]` **Fable hat es in C-225 gemeldet statt danebengebaut:**
`auth.users` ist fuer Clients bewusst nicht lesbar. Eine Aufloesung
braucht eine **SECURITY-DEFINER-Funktion.**

`[read]` **Aber die Funktion allein loest nichts** — `[cmd]`
`coach_profiles` existiert nicht (`to_regclass` ist `null`), und
`public.profiles` fuehrt **kein Namensfeld.** **Solange keine
Namensquelle existiert, gibt es nichts aufzuloesen.**

### Zu tun

**Zuerst messen, wo ueberhaupt ein Name stehen koennte** — `auth.users`
traegt `email` und `raw_user_meta_data`. **Nenn, was dort tatsaechlich
gefuellt ist, nicht was moeglich waere.**

**Dann die kleinste Loesung, die traegt:**

`[read]` **Eine E-Mail reicht vermutlich.** Wer einen Coach einlaedt,
kennt dessen Adresse — nicht dessen UUID. **Eine Funktion, die eine
E-Mail auf eine `user_id` aufloest, ohne die Adresse zurueckzugeben,
ist der schmalste Weg.**

`[read]` **Was du dabei nicht baust:** eine Funktion, die auf
Zuruf beliebige Konten preisgibt. Sie beantwortet genau eine Frage —
*gibt es ein Konto zu dieser Adresse* — und liefert nur die `user_id`
an den Aufrufer, der eine Beziehung anlegen darf.

### Nachweis

**Aufloesung mit einer bekannten Adresse:** trifft. **Mit einer
unbekannten:** trifft nicht, **und verraet nicht, ob das Konto
existiert.**

`[read]` **Der zweite Fall ist der wichtigere.** Eine Funktion, die
bei unbekannter Adresse anders antwortet als bei einer bekannten
ohne Berechtigung, ist ein Kontoverzeichnis.

---

## WAS NICHT ZU TUN IST

**Keine Tabelle `coach_profiles` anlegen**, ohne dass entschieden ist,
woher die Namen kommen.
**Keinen Namen erfinden**, auch nicht aus der E-Mail abgeleitet.
`apps/` nicht anfassen — Claude Code arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

## PIPELINE

Kettenschritt, Wegwerf-Datenbank, Sicherung vorher, **und live
einspielen** mit Vollsicherung davor.

`[cmd]` **Die Kette ist seit deinem C-265-Nachtrag wieder
deckungsgleich** — 99 Schritte, `KETTE OK`, `pnpm gate` gruen.
**Halt sie so.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
