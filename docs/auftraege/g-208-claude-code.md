# G-208 — Claude Code, 2026-08-27

Bericht: `docs/berichte/g-208-claude-code.md`

**498 Wirkstoffe, 2.313 FAQ-Antworten, CAS, ATC, Wirkmechanismus,
Vorsichtsmassnahmen, Reproduktionsdaten — und keine einzige Seite,
auf der man das sehen kann.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[read]` **In G-207 hattest du zweimal recht gegen
mich** — meine 27 Attrappen waren eine falsch gemessene Zahl, und dein
Einwand *Katalog gegen Tagebuchzeile* war die richtige Unterscheidung.
**Denselben Blick brauche ich hier.**

## 1 · Was seit heute Morgen dasteht

`[cmd]` **Live gemessen, 2026-08-27:**

    medical.medication_active_substances     498
      cas_number                             489
      atc_code                               497
      pharmacology->mechanism_of_action      494
      precautions                            393
    medical.medication_user_texts            498   (alle 498 Wirkstoffe)
    medical.medication_faq                 2.313   (alle 498 Wirkstoffe)
    medical.medication_reproductive_evidence 498

`[cmd]` **`medication_user_texts` hat zwoelf Textfelder je drei
Sprachen**, `_en` und `_th` sind durchgaengig leer und sollen es
bleiben. **FAQ liegt zeilenweise mit `sort_order`.**

## 2 · Der Auftrag

**Eine Katalogansicht fuer Medikamente in `apps/web`, lesend.**

`[cmd]` **Das Vorbild steht im selben Repo:**
`apps/web/src/lib/supplements/` mit `substanz-read.ts`,
`substanz-kacheln.ts`, `substanz-reiter.ts`, `substanz-luecken.ts`.
`[read]` **Die Detailansicht dort ist eine aufklappende Zeile, kein
Modal**, mit Kachelraster fester Breite. **Nimm das Muster, wo es
passt — aber pruef, wo es nicht passt.**

`[read]` **Ein Unterschied faellt schon jetzt auf:** Supplements
tragen `wada_scope` und `reinheit`, Medikamente stattdessen
`verschreibungspflicht_klartext`, `absetzen` und
`wechselwirkung_alltag`. **Die Reiter sind nicht dieselben.**

## 3 · Die Luecken gehoeren sichtbar gemacht, nicht versteckt

`[read]` **Das ist die eigentliche Anforderung, und sie kommt direkt
aus deinem G-207-Fund:** `.filter(Boolean)` warf Unbekanntes weg,
`b?.abbr ?? m` liess einen unbekannten Marker wie einen bekannten
aussehen. **Hier gibt es dieselben Fallen, nur mehr davon.**

`[cmd]` **Was fehlt und benannt gehoert:**

    9 Wirkstoffe ohne CAS      Mischpraeparate, mit Begruendung
                               in evidence_provenance
    4 ohne mechanism_of_action mit Begruendung
    105 ohne precautions       davon 4 begruendet, 101 nicht
    40 ohne zu_wenig_de        null_context: "not_supplied"
    115 ohne mythen_de         null_context: "not_supplied"

`[read]` **Der Unterschied zwischen *,,begruendet leer"* und
*,,nicht bearbeitet"* muss in der Oberflaeche sichtbar sein.** Ein
Mischpraeparat ohne eigene CAS ist vollstaendig; ein Wirkstoff ohne
`precautions` ist es nicht. **Beides als leeres Feld zu zeigen waere
dieselbe Luege wie `b?.abbr ?? m`.**

`[cmd]` `null_context` und `evidence_provenance` tragen die
Unterscheidung bereits. `[read]` **Sie sind genau dafuer gebaut
worden — benutz sie.**

## 4 · WAS NICHT ZU TUN IST

**Kein Erfassungsweg.** Anlegen, Aendern, Absetzen eigener
Medikamente ist **C-302** und nicht dieser Auftrag. `[read]` **Nur
lesen.** `medical.user_medications` wird nicht angefasst.

**Keine Tabelle anlegen** — `supabase/_pipeline/` gehoert Codex, er
arbeitet dort an C-299. **Was du brauchst, beschreibst du im
Bericht.**

**Keine `drug_class`-Anzeige als Wahrheit.** `[cmd]` **C-296: zehn
falsche Tags in 17 Wirkstoffen**, neun Antidepressiva sind als `maoi`
gefuehrt. **Wenn du die Klasse zeigst, zeig sie als das, was sie ist —
ein Feld mit bekannten Fehlern.** Oder lass sie in dieser Runde weg
und sag es.

Nicht committen, nicht stagen, nicht pushen.

## 5 · Zwei Dinge aus heute

`[cmd]` **Der Dev-Server beendet sich von selbst** — G-205, nicht dein
Fehler. `python tools/server.py start`, nie `pnpm dev`. **Wenn er weg
ist, neu starten ohne es zu untersuchen.**

`[cmd]` **Ein Neustart wirft den Uebersetzungsstand weg.** Deine
eigene Messung: 1.691 ms kalt gegen 282 ms warm. **Wenn du Zeiten
nennst, nenn dazu ob der Server warm war.**

## NACHWEIS

    Wirkstoffe in der Liste            Zahl, Soll 498
    mit Text                           Zahl, Soll 498
    FAQ-Antworten sichtbar             Zahl, Soll 2.313
    begruendet leer, als solche        Zahl je Feld
      gekennzeichnet
    nicht bearbeitet, als solche       Zahl je Feld
      gekennzeichnet
    Attrappen im neuen Code            Soll 0
    Ladezeit                           ms, warm und kalt getrennt
    Bildschirmfoto                     `node tools/schuss.mjs`

`[read]` **Negativprobe:** einem Wirkstoff testweise den Text
entziehen — **die Ansicht muss es benennen, nicht leer bleiben.**
Danach zurueckrollen und die Zeilenzahl gegenpruefen.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`.next` nie loeschen, `next build` nie direkt aufrufen.
`[cmd]` **Messungen mit echten Daten auf `dev@lumeos.app`, nichts dort
speichern.** Schreibende Nachweise auf `test-user@lumeos.local`.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
