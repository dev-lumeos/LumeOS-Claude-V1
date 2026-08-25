# -*- coding: utf-8 -*-
"""C-263 Durchgang 1a: Vitamine und Mineralstoffe (1-42).

Geschrieben aus den Kimi-Steckbriefen plus Fachwissen (NIH ODS, EFSA,
DGE). Zahlen nur, wo die Quelle sie traegt oder sie als
Referenzwert allgemein belegt sind.
"""

TEXTE = {

"sub_d370f8f2d6": dict(  # Vitamin A (retinol)
  kurz="Vitamin A ist ein fettlösliches Vitamin, das das Auge zum Sehen bei "
       "wenig Licht braucht.",
  wofuer=["Sehen in der Dämmerung", "Haut und Schleimhäute", "Immunabwehr",
          "Wachstum von Zellen"],
  wie_wirkt="In der Netzhaut wird Retinol zu einem Molekül umgebaut, das Licht "
       "in Nervensignale übersetzt. Daneben steuert Vitamin A, wie sich Zellen "
       "in Haut und Schleimhaut ausdifferenzieren. Der Körper legt Vorräte in "
       "der Leber an, die Monate reichen.",
  was_bringt="Bei echtem Mangel bessert sich die Nachtsicht innerhalb von Wochen. "
       "Wer sich normal ernährt, hat volle Leberspeicher und merkt von einer "
       "zusätzlichen Zufuhr nichts. In Ländern mit verbreitetem Mangel senkt die "
       "Gabe an Kinder die Sterblichkeit deutlich — das ist der am besten "
       "belegte Nutzen überhaupt.",
  zu_viel="Die tolerierbare Obergrenze für Erwachsene liegt bei 3000 µg RAE pro "
       "Tag. Dauerhaft darüber schädigt die Leber und macht die Knochen brüchig. "
       "In der Schwangerschaft kann zu viel Vitamin A das Kind fehlbilden — "
       "hier ist die Grenze besonders ernst zu nehmen.",
  zu_wenig="Zuerst leidet das Sehen in der Dämmerung, später trocknet die "
       "Hornhaut aus. Weltweit ist Vitamin-A-Mangel eine der häufigsten "
       "Erblindungsursachen bei Kindern.",
  wann_wie="Zu einer Mahlzeit mit Fett, sonst wird wenig aufgenommen.",
  wer_nicht=["Schwangere ohne ärztliche Absprache", "Lebererkrankungen",
             "gleichzeitige Einnahme von Retinoiden gegen Akne"],
  mythen="Beta-Carotin aus Gemüse ist nicht dasselbe: Der Körper wandelt nur so "
       "viel um, wie er braucht, deshalb kann man sich damit nicht überdosieren. "
       "Mit fertigem Retinol aus Kapseln schon.",
  faq=[("Kann ich zu viel Vitamin A über die Ernährung bekommen?",
        "Über Gemüse praktisch nicht. Leber ist die Ausnahme: Eine einzige "
        "Portion kann ein Vielfaches der Tagesmenge enthalten, weshalb in der "
        "Schwangerschaft davon abgeraten wird."),
       ("Ist Vitamin A in der Schwangerschaft verboten?",
        "Nicht verboten, aber begrenzt. Der Bedarf steigt leicht, hohe Dosen "
        "aus Kapseln können das Kind schädigen. Vorgeburtliche Präparate sind "
        "entsprechend niedrig dosiert."),
       ("Was bedeutet RAE?",
        "Retinol-Aktivitäts-Äquivalent. Damit lassen sich fertiges Vitamin A "
        "und pflanzliche Vorstufen auf eine gemeinsame Einheit umrechnen, weil "
        "der Körper sie unterschiedlich gut verwertet.")],
),

"sub_f14e403589": dict(  # Beta-carotene
  kurz="Beta-Carotin ist der orange Pflanzenfarbstoff, aus dem der Körper bei "
       "Bedarf selbst Vitamin A herstellt.",
  wofuer=["Vorstufe für Vitamin A", "Farbstoff in Karotte und Kürbis",
          "Schutz vor freien Radikalen"],
  wie_wirkt="Im Darm spaltet ein Enzym Beta-Carotin in Vitamin A. Der "
       "entscheidende Punkt: Der Körper wandelt nur um, was er gerade braucht, "
       "und drosselt bei vollen Speichern. Deshalb entsteht aus Gemüse kein "
       "Überschuss.",
  was_bringt="Es deckt den Vitamin-A-Bedarf mit, wenn man viel gefärbtes Gemüse "
       "isst. Als isolierte Kapsel in hoher Dosis hat es in großen Studien "
       "keinen Nutzen gezeigt — bei Rauchern war die Lungenkrebsrate sogar "
       "erhöht, weshalb davon abgeraten wird.",
  zu_viel="Sehr viel Beta-Carotin färbt die Haut orange, vor allem an "
       "Handflächen. Das ist harmlos und geht zurück. Gefährlich ist die "
       "hochdosierte Kapsel bei Rauchern, nicht die Karotte.",
  zu_wenig="Ein eigenes Mangelbild gibt es nicht — fehlt es, zeigt sich das als "
       "Vitamin-A-Mangel.",
  wann_wie="Mit etwas Fett, und lieber gegart als roh: Beides erhöht die "
       "Aufnahme deutlich.",
  wer_nicht=["Raucher und ehemalige Raucher bei hochdosierten Präparaten"],
  mythen="Der Satz „Karotten machen bessere Augen\" stammt aus der "
       "Kriegspropaganda. Richtig ist nur: Bei Vitamin-A-Mangel bessert sich "
       "das Dämmerungssehen. Wer versorgt ist, sieht davon nicht schärfer.",
  faq=[("Werden meine Hände wirklich orange?",
        "Bei sehr hoher Zufuhr ja — das heißt Karotinodermie. Sie ist "
        "unbedenklich, betrifft vor allem Handflächen und Fußsohlen und "
        "verschwindet, wenn man weniger isst."),
       ("Ist Beta-Carotin sicherer als Vitamin A?",
        "Aus Lebensmitteln ja, weil der Körper die Umwandlung selbst "
        "begrenzt. Für hochdosierte Kapseln gilt das nicht: Bei Rauchern "
        "wurden dabei mehr Lungenkrebsfälle beobachtet.")],
),

"sub_d938783ce5": dict(  # Vitamin B1 thiamine
  kurz="Vitamin B1 hilft dem Körper, Kohlenhydrate in Energie umzusetzen.",
  wofuer=["Energie aus Kohlenhydraten", "Nerven", "Herzmuskel"],
  wie_wirkt="Thiamin ist Baustein eines Helfermoleküls, ohne das mehrere "
       "Schritte im Zuckerabbau stillstehen. Nerven- und Herzzellen decken ihren "
       "Bedarf fast nur über Zucker und reagieren deshalb als Erstes, wenn B1 "
       "fehlt. Der Körper speichert nur für etwa zwei bis drei Wochen.",
  was_bringt="Bei Mangel verschwinden Missempfindungen und Muskelschwäche oft "
       "schnell. Ohne Mangel bringt zusätzliches B1 weder mehr Energie noch "
       "bessere Leistung — der Stoffwechsel läuft nicht schneller, nur weil "
       "mehr Baustein da ist.",
  zu_viel="Eine Obergrenze ist nicht festgelegt: Überschüssiges Thiamin geht "
       "über den Urin verloren. Vergiftungen sind aus Nahrung und Präparaten "
       "nicht bekannt.",
  zu_wenig="Klassisch ist Beriberi mit Nervenschäden und Herzschwäche. In "
       "Industrieländern tritt Mangel vor allem bei chronischem Alkoholkonsum, "
       "nach Magenoperationen und bei langem Erbrechen auf.",
  wann_wie="Zeitpunkt egal. Alkohol behindert die Aufnahme im Darm.",
  wer_nicht=[],
  mythen="B1 gilt als „Nervenvitamin\" und wird gegen Stress verkauft. Bei "
       "gefülltem Speicher ist davon nichts belegt.",
  faq=[("Brauche ich B1, wenn ich viel Sport mache?",
        "Der Bedarf steigt leicht mit dem Kalorienumsatz, weil B1 am "
        "Zuckerabbau beteiligt ist. Eine normale Mischkost deckt das mit; ein "
        "Präparat ist dafür nicht nötig."),
       ("Warum bekommen Menschen mit Alkoholproblemen oft B1?",
        "Alkohol hemmt die Aufnahme im Darm und den Einbau in die aktive Form. "
        "Weil ein Mangel hier das Gehirn dauerhaft schädigen kann, wird B1 "
        "vorbeugend gegeben.")],
),

"sub_67c3861fce": dict(  # B2 riboflavin
  kurz="Vitamin B2 ist an der Energiegewinnung in fast jeder Zelle beteiligt.",
  wofuer=["Energiestoffwechsel", "Haut und Mundschleimhaut", "rote Blutkörperchen"],
  wie_wirkt="Aus Riboflavin baut der Körper zwei Überträgermoleküle, die in der "
       "Atmungskette Elektronen weiterreichen. Ohne sie stockt die "
       "Energiegewinnung aus Fett und Eiweiß. Auch andere Vitamine — B6 und "
       "Folsäure — brauchen B2, um in ihre aktive Form zu kommen.",
  was_bringt="Ein Mangel bessert sich innerhalb von Tagen bis Wochen. In "
       "höherer Dosis wurde B2 zur Migränevorbeugung untersucht, mit "
       "uneinheitlichen Ergebnissen.",
  zu_viel="Es ist wasserlöslich und wird ausgeschieden; eine Obergrenze gibt es "
       "nicht. Der Urin färbt sich dabei kräftig gelb.",
  zu_wenig="Eingerissene Mundwinkel, eine wunde Zunge und schuppige Haut um Nase "
       "und Augen sind typisch. Isoliert ist der Mangel selten.",
  wann_wie="Zu einer Mahlzeit, das verbessert die Aufnahme. Licht zerstört "
       "Riboflavin — deshalb steht Milch im Karton und nicht in der Glasflasche.",
  wer_nicht=[],
  mythen="Der leuchtend gelbe Urin wird oft für einen Beweis der Wirkung "
       "gehalten. Er zeigt nur, dass mehr aufgenommen wurde als gebraucht.",
  faq=[("Warum ist mein Urin nach dem Präparat neongelb?",
        "Das ist Riboflavin selbst — es ist ein gelber Farbstoff. Was der "
        "Körper nicht braucht, geht über die Niere weg und färbt den Urin. "
        "Unbedenklich."),
       ("Hilft B2 gegen Migräne?",
        "Es wurde in Dosen deutlich über dem Tagesbedarf untersucht. Einige "
        "Studien fanden weniger Attacken, andere keinen Unterschied. Als "
        "gesichert gilt es nicht.")],
),

"sub_7dc88a93db": dict(  # B3 nicotinic acid
  kurz="Nikotinsäure ist eine Form von Vitamin B3, die in hoher Dosis die "
       "Blutfette verändert.",
  wofuer=["Energiestoffwechsel", "Blutfette in hoher Dosis"],
  wie_wirkt="Als Vitamin wird Nikotinsäure zu NAD umgebaut, einem Molekül, das "
       "in praktisch jeder Zelle Wasserstoff überträgt. In viel höherer, "
       "medikamentöser Dosis wirkt sie zusätzlich auf die Fettzellen und senkt "
       "LDL und Triglyzeride, während HDL steigt.",
  was_bringt="Als Vitamin behebt sie einen Mangel. Der Effekt auf die Blutfette "
       "ist deutlich messbar — große Studien konnten daraus aber keinen "
       "Rückgang von Herzinfarkten zeigen, weshalb die Anwendung dafür stark "
       "zurückgegangen ist.",
  zu_viel="Ab etwa 30 mg tritt der „Flush\" auf: Gesicht und Oberkörper werden "
       "rot, heiß und kribbeln, meist für 15 bis 30 Minuten. Dauerhaft hohe "
       "Dosen können die Leber schädigen und den Blutzucker anheben.",
  zu_wenig="Schwerer Mangel heißt Pellagra: raue Haut an lichtbeschienenen "
       "Stellen, Durchfall und Verwirrtheit. In Industrieländern sehr selten.",
  wann_wie="Zum Essen, das mildert den Flush. Alkohol und heiße Getränke "
       "verstärken ihn.",
  wer_nicht=["Lebererkrankungen", "Magengeschwür", "Gicht", "Diabetes ohne "
             "ärztliche Begleitung"],
  mythen="Der Flush wird gern als „Entgiftung\" verkauft. Er ist eine "
       "Gefäßerweiterung durch Botenstoffe der Haut und sagt nichts über eine "
       "Reinigung aus.",
  faq=[("Was ist der Niacin-Flush?",
        "Eine plötzliche Rötung mit Wärmegefühl und Kribbeln, meist im "
        "Gesicht und am Oberkörper. Sie entsteht durch Gefäßerweiterung, "
        "beginnt nach etwa 15 bis 30 Minuten und klingt von selbst ab."),
       ("Wie unterscheidet sich Nikotinsäure von Nikotinamid?",
        "Beide decken den Vitaminbedarf. Nur die Nikotinsäure löst den Flush "
        "aus und verändert die Blutfette; Nikotinamid tut beides nicht."),
       ("Hat Niacin mit Nikotin zu tun?",
        "Nein. Die Namensähnlichkeit ist Zufall aus der Chemiegeschichte. "
        "Nikotinsäure kommt in Fleisch, Fisch und Getreide vor.")],
),

}
