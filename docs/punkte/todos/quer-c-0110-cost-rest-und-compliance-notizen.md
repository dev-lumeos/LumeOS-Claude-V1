---
nr: C-110
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: F-02
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-110 - Cost-Rest und Compliance-Notizen

## Befund

(neu 2026-08-19).
  Befund aus F-02.

  `[cmd]` **Compliance ist anbindbar** — 90 Tage, 8 `skipped` im
  30-Tage-Fenster, 93,3 % (C-82/C-103). **Offen nur, ob die
  `skipped`-Zeilen `notes` tragen** — nirgends gemessen.

  `[cmd]` **Bei Cost fehlen:** Trend (**3 ehrliche Monatspunkte statt
  12**) und *„If you removed…"* (**reine Subtraktion**).

  `[read]` **`Cost optimization` bleibt Beratung, keine Rechnung** —
  draussen.

## Auftrag — drei Punkte am Rand des Kernbetriebs

**Mitbeauftragt: C-155, C-170.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-110 — Cost-Rest und Compliance-Notizen

`[read]` **Lies den Punkt und miss, was davon noch gilt.**

`[cmd]` **Seit C-353 ist die TTFB-Messung da**, seit C-381 ein
`action_log`.

### 2 · C-155 — zwei Befunde in `@supabase/ssr` 0.1.0

`[cmd]` **`pnpm audit` meldet 26 High-Severity-Abhaengigkeiten**
(A-69), darunter Next 14.2.35.

`[read]` **C-155 ist aelter und enger** — **miss, ob die zwei Befunde
noch bestehen und ob sie in A-69 aufgehen.**

`[read]` **Nicht aktualisieren** — **ein Abhaengigkeitswechsel
beruehrt beide Agenten gleichzeitig.**

### 3 · C-170 — der Offline-Betrieb steht im Entwurf

`[read]` **Miss, was der Entwurf verlangt und was heute davon
existiert.**

`[read]` **Und sag, ob es zu V1 gehoert** — **oder wie der
Marktplatz zurueckgestellt ist** (E-37).

### Was nicht zu tun ist

**Keine Abhaengigkeit aktualisieren.**
**Nichts in `backup/` loeschen** — dein eigener Vorschlag aus C-216
steht noch aus.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    C-110   was gilt noch, was ist erledigt
    C-155   bestehen die zwei, gehen sie in A-69 auf
    C-170   was existiert, gehoert es zu V1

## Bericht

**Codex, 2026-09-02.** Ausschliesslich gelesen: Live-Datenbank,
installierter Abhaengigkeitsbaum und Quellbestand. Kein Server gestartet,
keine Abhaengigkeit aktualisiert und nichts in `backup/` veraendert.

### C-110 - der Rest ist kleiner und klarer

| Teil | Stand heute | Folgerung |
|---|---|---|
| Compliance auf `dev@lumeos.app` | letzter 30-Tage-Stichtag 2026-08-19: 112 `taken`, 8 `skipped`, **93,3 %**; alle 8 Auslasser haben `notes` | Die fruehere offene Messfrage ist beantwortet. |
| zweites Belegkonto | `test-user@lumeos.local`: 21 `taken`, 3 `skipped`, **87,5 %**, aber **0 von 3** mit `notes` | Ein Auslassergrund ist nicht fuer jede Zeile vorhanden. |
| Inhalt der Notizen | 64 nichtleere `skipped`-Notizen: "nach spaetem Training ausgelassen" (24), "vergessen" (16), "keine Lust" (16), "unterwegs" (8); 3 leer | Die Spalte ist brauchbar belegt, aber nicht vollstaendig. |
| Kostenverlauf | `kostenJeMonat()` rechnet nur `taken`-Einnahmen zum Tagespreis, bildet vorhandene Monate und markiert Randmonate als unvollstaendig | Der fehlende Trend ist gebaut; aktuell sind vier ehrliche Monatspunkte statt erfundener zwoelf vorgesehen. |
| "If you removed ..." | `ohnePosition()` zieht den Tagespreis einer aktiven Position von der 30-Tage-Summe ab und sortiert nach Ersparnis | Die reine Rechnung ist gebaut. `Cost optimization` bleibt zu Recht draussen: das waere Beratung. |

Die TTFB-Frage ist inzwischen belastbar gemessen, nicht mehr nur aus einer
Differenz geschaetzt: C-356 (als Aufklaerung der C-353-Praemisse) misst warm
410 ms bei einem gegen 4.183 / 4.416 / 4.130 ms bei 90 Tagen. Fast der gesamte
Zuwachs ist Serverzeit; ein neuer Lauf waere ohne Toms Server nicht sinnvoll.

`coach.action_log` existiert nun und traegt eine ausgefuehrte
`training/adjust_training_day`-Aktion. Das ist ein Auditweg fuer bestaetigte
Coach-Aktionen, **kein** Ersatz fuer `supplements.intake_logs.notes`: weder
Kosten noch ausgelassene Supplemente werden dadurch erklaert.

### C-155 - beide SSR-Befunde bestehen, A-69 ersetzt sie nicht

Die Lockdatei loest weiterhin `@supabase/ssr@0.1.0` in `apps/web`,
`apps/admin`, `apps/coach` und `packages/shared` auf.

1. **`cookieOptions` ohne `cookies` crasht weiter.** Eine isolierte
   Client-Erzeugung mit genau diesem Optionsobjekt erreicht beim
   Session-Initialisieren `TypeError: Cannot read properties of undefined
   (reading 'get')`. Die Destrukturierung ueberschreibt den lokalen
   Default `{}` mit `undefined`. `apps/admin` importiert den gemeinsamen
   Browser-Client, und sein lokaler Cookie-Scope aktiviert genau diesen Pfad;
   damit ist die alte "sollte geprueft werden"-Warnung heute bestaetigt.

2. **`storageKey` wird weiter nur im Server-Client aus
   `cookieOptions.name` abgeleitet.** Die Gegenprobe mit
   `name = custom-auth` lieferte Browser `sb-localhost-auth-token`, Server
   `custom-auth`. `apps/coach` umgeht beide Fehler lokal mit explizitem
   Cookie-Adapter und `auth.storageKey`; `packages/shared` tut das nicht.

`pnpm audit --json` misst weiterhin **26 High-Vulnerabilities** (24
High-Advisories, weil einzelne Advisories mehrere Vorkommen haben). Die zwei
C-155-Befunde erscheinen dort nicht: sie sind Laufzeit-/Konfigurationsfehler,
keine Advisory. Es gibt aber eine Ueberschneidung im Abhaengigkeitsbaum:
unter `@supabase/ssr -> @supabase/supabase-js -> realtime-js` liegt das
High-Advisory fuer `ws`; direkt darunter liegt ausserdem ein Low-Advisory fuer
`cookie@0.5.0`. **A-69 ist daher kein Abschluss von C-155**, sondern ein
weiterer, paketweiter Wechselgrund. Keine Version wurde veraendert.

### C-170 - Entwurf ohne Betriebsfaehigkeit

Der Entwurf verlangt vier zusammenhaengende Faehigkeiten: lokale Schreibdaten
in IndexedDB, eine persistente Outbox, ein Sync-Protokoll beim Netzwechsel und
eine Konfliktregel fuer Aenderungen auf mehreren Geraeten. Heute existiert
keine davon:

| Forderung | Messung heute |
|---|---|
| IndexedDB | `idb` steht zwar in `apps/web/package.json`, wird aber **0-mal importiert**. Keine Manifest- oder Service-Worker-Datei existiert. |
| Outbox / Sync-Log | Keine Tabellen `sync_queue`, `outbox` oder `sync_log`; keine Implementierung ausser konstanten Anzeige-Daten. |
| echte Offline-Schreibwege | 238 `training.workout_sets`, alle `logged_via = manual`; 30 Sessions `manual`, 36 `seed`. |
| Konfliktaufloesung | Kein Modell und kein Codepfad gefunden. |

Der Training-Tab nennt `IDB_STORES`, `OUTBOX` und `SYNC_LOG` selbst
ausdruecklich Attrappe; auch die globale Anzeige `Offline · 0 queued` ist
statisch. Das ist kein nachzuziehender Datenbestand, sondern eine neue
Betriebsart mit Schreib-, Synchronisations- und Konfliktsemantik.

**Vorschlag:** Offline-Betrieb wie den Marktplatz fuer V1 zurueckstellen und
vorher nur die Schnittstelle spezifizieren. E-37 entscheidet formal nur den
Marktplatz, also kann sie C-170 nicht automatisch schliessen; die Messung
liefert aber keinen V1-Blocker und keine bereits angefangene Faehigkeit, die
ein stilles Fertigbauen rechtfertigen wuerde.

## Abnahme

**2026-09-02, Orchestrator.**

### C-110 — gebaut, mit einer Luecke am Nachweiskonto

`[cmd]` **Kostenverlauf und die reine *,,If you removed …"*-Rechnung
sind gebaut.**

`[cmd]` **Compliance-Notizen existieren auf `dev`** — **fehlen aber
bei 3 von 3 `skipped` auf `test-user`.**

`[read]` **Und das ist wieder G-334:** **das Nachweiskonto traegt
nicht, was `dev` traegt.**

`[cmd]` **`action_log` ist ein separater Coach-Auditweg** — **nicht
dasselbe.** `[read]` **Meine Vermutung im Auftrag war, C-381 koennte
den Punkt erledigt haben. Falsch.**

### C-155 — beide Befunde bestehen, und A-69 ersetzt sie nicht

`[cmd]` **Beide `@supabase/ssr` 0.1.0-Befunde bestehen.** `[cmd]`
**Der Admin nutzt den gefaehrdeten Shared-Pfad.**

`[cmd]` **A-69 ueberschneidet sich nur ueber ein transitives
`ws`-High-Advisory.**

`[read]` **Ich hatte gefragt, ob C-155 in A-69 aufgeht** — **nein.**
`[read]` **Zwei verschiedene Sachen: A-69 ist eine Zaehlung, C-155
ein benannter Pfad im Admin.**

### C-170 — kein Offline-Betrieb, und die Empfehlung ist richtig

`[cmd]` **Kein IndexedDB-Einsatz, keine Outbox, kein Sync, keine
Konfliktaufloesung.**

`[read]` **Seine Empfehlung: wie den Marktplatz fuer V1
zurueckstellen, mit eigener formaler Entscheidung.**

`[read]` **Und das ist mehr als *nicht gebaut*:** **ein Entwurf, der
im Bestand steht und nie zurueckgestellt wurde, wird beim naechsten
Auftrag fuer geplant gehalten** — **dieselbe Klasse wie E-37 beim
Marktplatz.**

`[read]` **Die Entscheidung gehoert Tom.**

**Abgenommen.** **Alle drei bleiben offen.**

