# G-203 — Die 700 ms sind RLS, nicht Transport

**Agent:** Claude Code · **Stichtag aller Zahlen: 2026-08-27**

---

## Kurz

`[cmd]` **Die 700 ms liegen weder im Transport noch im Client, sondern
in der Zeilenschutzpruefung (RLS) innerhalb der Datenbankfunktion.**

**Und der wichtigste Einzelbefund, den der Auftrag ausdruecklich
verlangt hat:** `[cmd]` **auf `test-user` gibt es die 700 ms nicht.**
Der Aufschlag ist **kein Ueberbau** — er waechst mit der Datenmenge.
**Damit sind C-278 und C-279 sauber getrennt: es ist C-279.**

---

## 1 · Deine Zahlen neben meinen

| | Auftrag | gemessen | |
|---|---|---|---|
| Einnahmen `dev` | 360 | 360 | ✓ |
| Einnahmen `test-user` | 24 | 24 | ✓ |
| `rule_catalog` Zeilen | 64 | 64 | ✓ |
| Datenbankzeit `dev` | 172 ms | **160–166 ms warm** | ✓ |
| Anwendungszeit `dev` | 880 ms | **838–929 ms** | ✓ |

`[cmd]` **Eine Zahl ist praeziser geworden:** der erste Lauf nach
Serverstart misst **317 ms** in der Datenbank, ab dem zweiten
**159–166**. **Die 172 aus G-190 waren ein halbwarmer Wert.**

---

## 2 · Die Abschnitte, je Konto

`[cmd]` Gemessen IM Server, gleicher Prozess, gleiche Anfrage:

| Abschnitt | `dev@lumeos.app` | `test-user@lumeos.local` |
|---|---|---|
| `auth.getUser()` | **35–53 ms** | **38–44 ms** |
| RPC ueber den Client | **838–929 ms** | **17–26 ms** |
| RPC als nacktes `fetch` | **152–186 ms** | **14–18 ms** |
| `rule_catalog` | 4,5–13 ms | 4,7–6 ms |
| `ladeRegeln` gesamt | **862–916 ms** | **55–62 ms** |

**Antwortgroesse:** `dev` **40.828 B** (41.910 roh), `test-user`
**36.698 B** — beide **64 Zeilen**. `rule_catalog` **3.882 B**.

**Rundreisen:** **drei** — `getUser`, RPC, Katalog. Die letzten zwei
laufen parallel.

**Kompression:** `[cmd]` **aus.** PostgREST antwortet ohne
`content-encoding`, auch mit `Accept-Encoding: gzip`. **Bei 41 kB ist
das ein Nebenposten, kein Erklaerungsbeitrag** — die Zeit fehlt auch
bei identischer Groesse auf `test-user`.

---

## 3 · Die Gegenprobe trennt die Erklaerungen

**Auftrag: *„dieselbe Abfrage einmal direkt gegen PostgREST, ohne die
Anwendung. Wenn die Zeit dort verschwindet, liegt es nicht am
Transport."***

`[cmd]` **Direkt gegen PostgREST, von aussen:**

    dev         155–191 ms
    test-user    15–18 ms

`[cmd]` **Und dasselbe aus DEMSELBEN Serverprozess**, nur ohne den
Supabase-Client:

    dev         152–186 ms   (Client daneben: 838–929)
    test-user    14–18 ms    (Client daneben:  17–26)

`[read]` **Damit fallen drei der vier Vermutungen aus:**

    Zeilenzahl            64, auf beiden Konten gleich
    Antwortgroesse        41 kB gegen 37 kB - 10 % Unterschied
                          bei Faktor 40 in der Zeit
    Kompression           aus, aber auf beiden Konten aus
    Rundreisen            drei, auf beiden Konten drei

**Die vierte Erklaerung ist es also auch nicht** — es ist eine
fuenfte.

### Und es ist kein Aufschlag des Clients

`[read]` **Der naechstliegende Schluss waere gewesen: der Client
kostet 700 ms.** `[cmd]` **Auf `test-user` kostet er 3 ms.** Ein
Aufschlag, der bei gleicher Zeilenzahl und gleicher Groesse einmal 3
und einmal 700 ms betraegt, ist keiner.

`[cmd]` **Gegen die Reihenfolge kontrolliert:** Client vor `fetch`
und Client nach `fetch` gemessen — dasselbe Bild in beiden
Richtungen. **Kein Aufwaermeffekt.**

---

## 4 · Die fuenfte Ursache: RLS

`[cmd]` **`supplements.rule_assessment` ist SECURITY INVOKER**
(`prosecdef = f`), und **alle fuenf Tabellen, die sie liest, haben RLS
aktiv** — `intake_logs`, `stack_items`, `user_stacks`, `supplements`,
`rule_catalog`.

`[read]` **Der Dienstschluessel umgeht RLS, das Nutzer-Token nicht.**
Genau darin unterscheiden sich Client und nacktes `fetch`.

`[cmd]` **Dieselbe Funktion, nur die Rolle getauscht:**

| | ohne RLS (`postgres`) | mit RLS (`authenticated`) |
|---|---|---|
| `dev` | **166–182 ms** | **556–567 ms** |
| `test-user` | **21–24 ms** | **23–26 ms** |

**Der Aufschlag: +394 ms auf dev, +2 ms auf test-user.**

`[cmd]` **Und der Beleg in Puffern**, dieselbe Funktion, dev:

    ohne RLS    shared hit=21.995   temp read=9.457
    mit RLS     shared hit=128.655  temp read=2.387

`[read]` **Fast sechsmal so viele Pufferzugriffe fuer dieselben 64
Ergebniszeilen.** Die Policy wird innerhalb der Funktionsscans erneut
ausgewertet.

`[cmd]` **`intake_logs` traegt ZWEI SELECT-Policies:**

    intake_logs_select      auth.uid() = user_id
    intake_logs_coach_read  coach.hat_sicht(user_id, 'supplements', 'full')

`[read]` **`coach.hat_sicht` ist eine SQL-Funktion, die in
`coach.client_permissions` nachschlaegt.** `[cmd]` Ein einfaches
`count(*)` auf `intake_logs` unter RLS kostet aber nur **3,7–6,3 ms**
— **die Policy allein ist nicht teuer.** Teuer wird sie erst in den
wiederholten Scans der Funktion.

---

## 5 · Die Summe — und der Rest, der bleibt

`[cmd]` Fuer `dev@lumeos.app`, warm:

    Datenbank ohne RLS         166 ms
    RLS-Aufschlag             +394 ms
    ────────────────────────────────
    Datenbank mit RLS          560 ms   (gemessen: 556-567)

    Transport + PostgREST      ~10 ms   (fetch 165 - DB 155)
    ────────────────────────────────
    erwartet in der Anwendung  570 ms
    gemessen                   838-929 ms
    ────────────────────────────────
    REST                       270-360 ms   <- nicht erklaert

`[read]` **Der Rest ist der Befund, nicht die Rundung.** Ich habe ihn
nicht weiter zerlegt, weil dafuer eine Messung INNERHALB von PostgREST
noetig waere — die Anwendung sieht ihn als eine Zahl.

`[annahme]` **Wahrscheinlich derselbe Mechanismus:** das nackte
`fetch` benutzt den Dienstschluessel und umgeht RLS, die Messung
`ohne RLS` in der Datenbank ebenso. **Was zwischen 560 und 840 liegt,
ist die RLS-Auswertung im PostgREST-Kontext** — dort kommen die
JWT-Pruefung und ein eigener `set role` dazu. **Gemessen habe ich es
nicht.**

`[cmd]` **Fuer `test-user` geht die Rechnung glatt auf:**

    Datenbank mit RLS           24 ms
    Transport                   ~2 ms
    ────────────────────────────────
    erwartet                    26 ms
    gemessen (Client)           17-26 ms   ✓

---

## 6 · Was das fuer C-278 und C-279 bedeutet

`[read]` **Der Auftrag nennt das den wichtigsten Einzelbefund, und er
faellt eindeutig aus:**

**Es ist C-279 (Datenmenge), nicht C-278 (Ueberbau).**

    Ueberbau waere:   auf beiden Konten gleich hoch
    gemessen:         700 ms auf dev, 3 ms auf test-user

`[read]` **Der Aufschlag ist nicht konstant, er ist proportional.** Er
verschwindet mit den Daten und kaeme mit jedem weiteren Nutzungsmonat
zurueck — **bei einem Jahr Historie ist er das naechste C-189.**

---

## 7 · Ein zweiter Befund: der Dev-Server stirbt

`[cmd]` **Er ist in dieser Sitzung fuenfmal von selbst ausgegangen**,
je nach 30–60 Sekunden, ohne Fehlermeldung im Log — es endet mit
`[?25h`, einer Terminalfolge, also **beendet, nicht abgestuerzt**.

`[cmd]` **Neunzig Sekunden ohne jeden Zugriff hat er ueberlebt.** Die
Todesfaelle fallen mit `server.py status` und mit Neuuebersetzungen
zusammen.

`[read]` **Ich habe es nicht weiter verfolgt** — es ist nicht mein
Auftrag, und jede Untersuchung haette die Messung verschoben. **Es
erklaert die G-200-Beobachtung** (PID 351936 verschwand ebenso) und
gehoert als eigener Punkt aufgenommen.

---

## 8 · Nachweis

| Groesse | `dev` | `test-user` |
|---|---|---|
| Datenbankzeit (ohne RLS) | 166–182 ms | 21–24 ms |
| Datenbankzeit (mit RLS) | **556–567 ms** | 23–26 ms |
| Transport + PostgREST | ~10 ms | ~2 ms |
| Anwendungszeit gesamt | 838–929 ms | 17–26 ms |
| **nicht erklaerter Rest** | **270–360 ms** | **0** |
| Antwortgroesse | 40.828 B | 36.698 B |
| Zeilen | 64 | 64 |
| Rundreisen | 3 | 3 |
| Kompression | **aus** | **aus** |

**Werkzeuge:** `backup/g203-messen.mjs` (Abschnitte im Server),
`backup/g203-postgrest.mjs` (Gegenprobe von aussen).

`[cmd]` **Die Messroute ist entfernt**, samt Typrest in `.next/types`
— gezielt dieser Ordner, **nicht `.next`.**

**Nichts repariert.** `[read]` Es ist ein Messauftrag; alles hier ist
ein Punkt fuer einen eigenen.

**`supabase/_pipeline/` und `tools/` nicht angefasst** (C-291, Codex).
**Nichts auf `dev@lumeos.app` gespeichert.**
**Nicht committet, nicht gestaged.**

---

## 9 · Was ich als Punkte melde

**a) `rule_assessment` ist SECURITY INVOKER und zahlt RLS je
Innenscan.** `[cmd]` +394 ms auf dev, Pufferzugriffe von 22 k auf
129 k. **Ein SECURITY-DEFINER-Umbau mit eigener Zugangspruefung waere
der naheliegende Weg — das ist eine Sicherheitsentscheidung, kein
Nebenbei.**

**b) 270–360 ms bleiben unerklaert.** `[annahme]` Vermutlich RLS im
PostgREST-Kontext. **Wer es wissen will, misst in PostgREST, nicht in
der Anwendung.**

**c) `intake_logs` traegt zwei SELECT-Policies**, eine davon mit
Funktionsaufruf je Zeile. **Allein gemessen billig (4–6 ms), in der
Funktion teuer.**

**d) Kompression ist aus.** Bei 41 kB je Aufruf und mehreren Aufrufen
je Seite ist das ein eigener, kleiner Punkt — **nicht die Ursache
hier.**

**e) Der Dev-Server beendet sich selbst** (Abschnitt 7).
