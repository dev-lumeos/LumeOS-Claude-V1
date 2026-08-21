# 174 — Makroziele in der Tabelle, Alias-Suche, offene Einzelwurzel

**Auftrag:** G-147 (G-143 + G-142/G-144 + G-145) · **Stand:**
2026-08-21 · **Modul:** Nutrition
**Vorher:** 172 (C-165: Aliase + Anschlussbeschreibung), 168 (G-129:
Suche), 166 (G-122: Baum, Modal), GO-03/GO-04 (`zielwerte_am`)

**Kurz:** Die Nährstofftabelle liest jetzt **beide Zielquellen**: das
persönliche Ziel aus `goals.nutrition_targets` gewinnt für Balken,
Prozent und Status, die wissenschaftliche Referenz steht unterscheidbar
daneben. `[cmd]` **Protein: 164,5 g gegen 170 g = 97 % „unter Ziel"
(vorher 234 % gegen die 70,6-g-Referenz), Fett 75 g, Kohlenhydrate
313 g — mit Fortschritt und Status.** Die **C-165-Aliase sind
angeschlossen** (drittes Suchfeld + Kurz-Token-Regel): alle sieben
Belege treffen, **BCAA zeigt drei**. Karten mit **einer Wurzel starten
offen** (zweite Ebene zu). Dazu ist der **Zonenbalken der Vorlage
gebaut** — bei Vitamin A mit 478 % zeigt er, WO der Wert liegt. Tests
**469/469**, Typecheck grün.

---

## Woher die Ziele jetzt kommen

`[cmd]` `ladeOrdnung` liest zusätzlich `getZielwerteAm` (GO-03,
`goals.zielwerte_am`) und mappt sechs Codes: ENERCC ← kcal, PROT625 ←
protein_g, CHO ← carbs_g, FAT ← fat_g, F18:2CN6 ← linoleic_acid_g,
F18:3CN3 ← alpha_linolenic_acid_g.

**Die Rangfolge aus dem Auftrag:** das persönliche Ziel treibt Balken,
Prozent und Status (`zielQuelle: 'goals'`, Label **„Ziel"**, farblich
abgesetzt); die wissenschaftliche Referenz steht als kleine
**„Ref."-Zeile** darunter — bei den Makros ist sie ohnehin nur ein
Mindestwert.

`[cmd]` Gemessen (dev, Tag): **Protein 164,5 g · „170 g Ziel · Ref.
70,6 g PRI" · 97 % · unter Ziel** — die irreführenden 234 % sind weg.
**Fett 62,3 g / 75 g Ziel = 83 %**, **Kohlenhydrate 168,9 g / 313 g =
54 %**, beide mit Status. `[cmd]` LA/ALA (Toms Doppel-Beispiel) tragen
Goals-Ziel UND AI-Referenz nebeneinander. `[cmd]` test-user sieht
**seine eigenen** Formelwerte (Protein 156,8 g, Fett 82,7 g, CHO
401,6 g) — devs 170 g taucht bei ihm nirgends auf; das ist zugleich
der Zeilenschutz-Beleg.

`[read]` Status-Semantik unverändert: unter Ziel / im Bereich / über
UL — ein Überschreiten des kcal-Ziels ohne UL bleibt „im Bereich",
kein neues Urteil erfunden.

## Warum die Aliase nicht ankamen

`[cmd]` C-165 hatte es gemessen: die Nähe-Regel (2 Zeichen = nur Code)
liess Kurz-Token wie `B5` oder `kJ` nirgends zu, und ein drittes Feld
fehlte. Jetzt: `ladeOrdnung` liest `nutrient_search_aliases`, jeder
Knoten trägt `suchAlias` (gefaltet mit derselben Regel), und
`trifftSuche` hat die beschriebene Erweiterung — **exakte Gleichheit
mit einem Alias trifft auch unter drei Zeichen**; ab drei zählen
Aliase wie Namen. `[read]` Die Nähe-Regel selbst blieb — sie
verhinderte weiter, dass „EPA" über das „epa" in „Reparatur" Valin
findet (Wächtertest).

`[cmd]` Die sieben Belege (test-user): `fiber` → FIBT · `carbs` → CHO
· `bcaa` → **ILE + LEU + VAL** (mit PROT625/AAE9 als sichtbarem Pfad)
· `elektrolyte` → NA/K/MG/CA/CLD · `eiweiss` → PROT625 · `kj` →
ENERCJ · „Vitamin B5" → PANTAC.

## Was BCAA verschluckt hat

`[cmd]` Gemessen, nicht geraten: **„BCAA" steht wörtlich in den
`function_de`-Texten von Isoleucin und Valin — in keinem
Leucin-Text.** Die Volltextsuche (ab 4 Zeichen) fand deshalb zwei über
den Text-Zufall; der Alias war nie angeschlossen. `[read]` Toms
Verdacht (Leucins eigener Zielwert) war es nicht — der Zielwert hat
mit der Suche nichts zu tun. Mit den Aliasen kommen alle drei aus
derselben Quelle (`kind='gruppe'`), der Text-Zufall ist bedeutungslos
geworden.

## Ob `NutrientSpectrum` passt

**Gebaut — als Zeilen-Balken statt im Modal.** `[read]` Der
100-%-Balken sagte bei Vitamin A „voll" und sonst nichts; der
Zonenbalken der Vorlage (0 → unterversorgt bis 70 % des Ziels → nah →
Ziel bis UL → über UL, Skala = UL × 1,1 bzw. Ziel × 2) verortet den
Wert. `[cmd]` Vitamin A heute: **3.582,8 µg, 478 %, Markierung am
Skalenende jenseits der UL-Zone** (Titel: „Ziel 750 µg · UL 3.000 µg ·
Skala bis 3.300 µg"); Vitamin D 74 % mit Markierung in der Nah-Zone.
Positionen aus einer reinen, getesteten Funktion (`spektrumLage`);
Zonen als getönte Flächen, der Wert als Strich in der Statusfarbe —
Aussage über die Zahl, kein neues Urteil. Das Mockup-`MacroCalculatorModal`
ist bekannt und bewusst nicht gebaut.

**Einzelwurzel (G-145):** Karten mit genau einer Wurzel (Protein,
Fette, Kohlenhydrate) starten mit offener Wurzel, die zweite Ebene
bleibt zu. `[cmd]` Protein-Karte öffnen → **10 Zeilen** (Wurzel + 9
Kinder), AAE9-Chevron zu; Fette → 5, nicht 37. Schliessen bleibt
möglich und wird als **`zu:`-Marker** gespeichert — die Ansicht
speichert offene Schlüssel, ein Standard-Offener braucht fürs Zu ein
eigenes Wort; `pruefeAnsicht` und die gespeicherte Ansicht selbst sind
unverändert.

## Nachweise

| Behauptung | Beleg |
|---|---|
| Fett 75 g, KH 313 g, Protein 170 g mit Fortschritt/Status | `[cmd]` dev-Zeilen oben; Bild `backup/g147/makroziele-dev-1440.png` |
| Referenz daneben, unterscheidbar | `[cmd]` „170 g **Ziel** · Ref. 70,6 g PRI" — Label farblich abgesetzt |
| Sieben Suchbegriffe | `[cmd]` Tabelle oben, auf test-user |
| BCAA zeigt drei | `[cmd]` ILE + LEU + VAL |
| Einzelwurzeln starten offen | `[cmd]` Protein 10 Zeilen, zweite Ebene zu |
| A-34 eingehalten | `[cmd]` Nachweise auf test-user; der eine dev-Lauf mit **Sichern und Zurückschreiben** der Ansicht (verifiziert identisch) |
| Bilder | `backup/g147/`: Baum test-user hell/dunkel × 1440/375 (Protein offen) + Makroziele-dev; je 1 Attrappe (Buddy-Orb, Bestand), 2 bekannte Konsolenfehler |
| Typen und Tests | `[cmd]` typecheck grün, Tests **469/469** (467 + 2: Alias-Kurz-Token, `spektrumLage`) |

## Befunde am Rand

- `[cmd]` Während des Auftrags **verschwanden zwei frisch angelegte
  Probeskripte aus `backup/`** (`g147-nachweis.mjs`,
  `g147-dev-beleg.mjs`) — mutmasslich ein paralleler Agent beim
  Aufräumen. Neu angelegt unter `backup/g147/`; kein Schaden, aber
  `backup/` ist offenbar kein sicherer Ablageort mehr.
- `[cmd]` Vitamin A heisst heute 478 % (Toms Screenshot zeigte 411 %) —
  anderes Tagesprofil, gleiche Lage: über UL, Ursache Beta-Carotin
  17.413,7 µg.
- `[cmd]` Der Typecheck war zwischenzeitlich rot durch
  `supplements/modale.tsx` (Claude Codes laufende Arbeit) — bei
  Abschluss dieser Messung wieder grün, nichts aus meinem Bereich.

## Was nicht angefasst wurde

- **Kein Schema**, **kein `packages/ui`**, **kein `supplements/`**.
- **Die gespeicherte Ansicht ist nicht umgebaut** — nur der
  `zu:`-Marker als neues Wort im bestehenden Format.
- **Kein `MacroRing` im Diary** (eigener Auftrag), kein
  `MacroCalculatorModal`.
