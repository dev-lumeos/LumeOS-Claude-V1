---
nr: C-388
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-386
entscheidung: null
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: f86eefbe
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-02
  familien_ohne_form: 504
  eindeutig: 101
  gebunden: 403
---

# C-388 — die Vertreterregel ist nicht erreicht

## Befund

Aus C-386, Codex, 2026-09-02.

`[cmd]` **Die Suche bevorzugt BLS-100/000 und nimmt danach
`sort_weight`** — **ein Artenmodell oder Vertreterfeld gibt es
nicht.**

`[cmd]` **504 mehrzeilige Familien haben keine 100/000-Form.**
`[cmd]` **Nur 101 haben ein eindeutiges hoechstes `sort_weight`, 403
bleiben am hoechsten Wert gebunden.**

`[read]` **Die alte Aussage aus C-35 — *Gruppen ohne Vertreter 953
auf 0* — ist weder nachweisbar noch erreicht.**

## Was fehlt

`[read]` **Der dritte Fall aus C-35:** kein `100`, kein `000` —
**hoechstes `sort_weight`.**

`[cmd]` **Er greift bei 101 von 504.** `[read]` **Bei den uebrigen
403 ist das hoechste `sort_weight` nicht eindeutig.**

`[read]` **Ein vierter Fall fehlt** — **oder eine Kuration.**


## Gemessen am 2026-09-02: es gibt keinen vierten Fall.

`[cmd]` **Die 403 gebundenen Familien haben nur technische
Namens-Stichentscheide, keinen fachlichen vierten Vertreterfall.**

`[read]` **Eine Regel hilft dort nicht, nur Kuration.**

## Auftrag — die Kuration fuer die 403

**Mitbeauftragt: C-389, C-387.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-388 — es gibt keinen vierten Fall, also Kuration

`[cmd]` **Du hast gemessen: die 403 gebundenen Familien haben nur
technische Namens-Stichentscheide, keinen fachlichen vierten
Vertreterfall.**

`[read]` **Damit ist die Regel am Ende** — **was bleibt, ist
Kuration.**

`[cmd]` **Und der Weg dafuer existiert:** `food_aliases` traegt 12
`curated_suchbegriff`-Zeilen fuer Reis (C-36), **`reis` liefert
`C352000` auf Platz 1 von 145.**

`[read]` **Miss, ob derselbe Weg fuer Vertreter taugt** — **oder ob
es ein eigenes Feld braucht.**

`[read]` **Und wie gross der Nutzen waere:** **403 Familien
kuratieren ist Arbeit** — **wie viele davon treffen ueberhaupt eine
Suche?**

### 2 · C-389 — Saft und Nektar

`[cmd]` **Frucht, Saft und Nektar liegen alle in `obst`,
`processing_level` bei Saft ist `raw`.**

`[read]` **Ein Saft ist kein rohes Obst.**

`[cmd]` **`Aprikosensaft` trifft bei *Aprikose* per `name_prefix`,
Rang 6** — **kein Alias-, sondern ein Namensproblem.**

`[read]` **C-35 nannte es *ohne Kuration zu haben*** — **die
Trennung waere aus dem BLS-Code ableitbar.** `[cmd]` **F201100 gegen
F201600.** **Miss, ob das traegt.**

### 3 · C-387 — die zweite Tabelle bauen

`[cmd]` **Dein Entwurf steht:** `food_tags_kuriert` mit `food_id`,
`tag_code`, **entschiedener Aktion gesetzt/entfernt, ohne
`confidence`.**

`[read]` **Und der tragende Satz:** *,,Eine Entfernt-Zeile ueberdeckt
auch einen Tag, den ein Import spaeter erneut setzt."*

`[cmd]` **Vier Schreiber wirken nur auf ihre eigene Tabelle** — 020,
027, 032, 221.

`[read]` **Jetzt bauen** — **Tabelle, RLS, und der Leseweg, der
Import und Kuration vereint.**

`[cmd]` **`apps/admin` hat eine Kurationsseite, 314 Zeilen,
vollstaendig lesend** (C-366). `[read]` **Der Schreibweg dorthin ist
ein UI-Auftrag, nicht deiner.**

### Was nicht zu tun ist

`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Vertreter        taugt der Aliasweg, oder eigenes Feld
    Nutzen           wie viele der 403 treffen eine Suche
    Saft/Nektar      traegt der BLS-Code die Trennung
    food_tags_kur.   live, RLS, Leseweg vereint beide
    Entfernt-Zeile   ueberlebt einen Importlauf, belegt

## Bericht

**Stand 2026-09-02 — gemessen, nichts gebaut.** apps/, Dev-Server,
Stage, Commit und Push blieben unberuehrt.

### C-388 — der Aliasweg ist Suchkuration, kein Vertreterfeld

nutrition.food_aliases hat nur food_id, alias, locale und source. Die
12 curated_suchbegriff-Zeilen zeigen genau das Modell: ein Mensch setzt
einen Suchbegriff auf einen konkreten Eintrag, etwa reis auf C352000.
Das verbessert die Rangfolge einer getippten Anfrage, speichert aber
weder eine BLS-Familie noch eine allgemeine Vertreter-Aussage.

Damit taugt der Aliasweg fuer die richtige Folge des gefallenen Modells:
gezielt auftretende Suchbegriffe kuratieren. Fuer ein abstraktes
Vertretermodell ueber alle Konsumenten braeuchte es eine getrennte
Familie-zu-Food-Zuordnung, nicht ein Feld an foods; sie waere aber
fachlich nicht durch die 403 Namen begruendet.

Der Nutzen einer Vollkuration ist gegen den vorhandenen Suchverkehr
klein: search_events hat 319 Ereignisse, 61 verschiedene Anfragen und
293 Auswahlen. Von den 403 gebundenen Familien wurde nur **eine**
ausgewaehlt (X411, Huehnerbruehe bei huehnerbr); **402** wurden nie
ausgewaehlt. Eine Kuration aller 403 waere damit heute kein
nachweisbarer Suchnutzen. Neue Aliaszeilen gehoeren an konkrete
Fehlsuchen, nicht an eine pauschale Familienliste.

### C-389 — die drei Faelle sind trennbar, die Ziffer allein nicht global

In den drei von C-35 genannten Familien traegt der BLS-Code die
Trennung tatsaechlich:

| Familie | Rohform | Saft | Nektar |
| --- | --- | --- | --- |
| F201 Aprikose | F201100 | F201600 | — |
| F603 Orange | F603100 | F603600 | F603700 |
| F310 Weintraube | F310100 | F310600 | — |

100 ist hier die Rohform, 600 der Saft und 700 der Nektar. Die
Trennung der drei konkreten Familien ist also ohne Namenskurierung
messbar. Sie rechtfertigt aber **nicht** die globale Regel
Obst-600 ist Saft: Unter allen Obstcodes sind 50 von 53
600-Zeilen Saft/Nektar, drei aber Smoothies (F032600, F033600,
F034600). 700 trifft im Obstbestand 14 von 14 Mal Saft/Nektar.

Der BLS-Code ist damit ein belastbarer Selektor fuer diese drei
belegten Familien, keine allgemeine Saftklasse. Die bestehende
Fehleinordnung bleibt sichtbar: F201600, F603600, F603700 und F310600
stehen noch auf processing_level = raw; eine globale
processing_level-Aenderung wurde nicht abgeleitet.

## Abnahme

**2026-09-02, Orchestrator.**

### Die Zahl, die die Frage beantwortet

`[cmd]` **Von 403 gebundenen Familien wurde genau EINE im
Suchprotokoll ausgewaehlt.** **402 nie.**

`[read]` **Damit ist die Frage nach dem Nutzen beantwortet:** **403
Familien zu kuratieren waere Arbeit fuer einen Fall.**

`[read]` **Ich hatte gefragt, ob es sich lohnt** — **er hat es
gemessen statt geschaetzt.**

### Der Aliasweg taugt nicht als Vertretermodell

`[cmd]` **Er taugt fuer konkrete Suchbegriffe** — `reis` auf
`C352000`.

`[read]` **Aber nicht als Familien-Vertretermodell:** **ein Alias
zeigt auf einen Eintrag, kein Vertreter auf eine Gruppe.**

`[read]` **Damit ist C-388 zu Ende gemessen:** **kein vierter
Regelfall, kein tragfaehiger Kurationsweg, und kein messbarer
Nutzen.** **Der Punkt schliesst.**

### C-389 — trennbar, aber nicht global

`[cmd]` **Die drei Saftfamilien sind ueber BLS-Codes trennbar:**
**100 roh, 600 Saft, bei Orange 700 Nektar.**

`[cmd]` **Aber global ist 600 nicht eindeutig Saft:** **3 von 53
Obst-600-Zeilen sind Smoothies.**

`[read]` **Das ist der Grund, warum die Regel nicht allgemein
ausgerollt werden kann** — **und C-35 nannte genau drei Familien,
nicht alle.**

`[read]` **Fuer `F201`, `F603` und `F310` traegt der Code die
Trennung.** **Der Punkt bleibt offen, aber sein Umfang steht: drei
Familien, keine Regel.**

**Abgenommen.**

