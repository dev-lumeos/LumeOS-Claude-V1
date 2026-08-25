# -*- coding: utf-8 -*-
"""C-263 Durchgang 1b: Vitamine B3(Amid) bis K2, Magnesiumformen."""

TEXTE = {

"sub_2baf990d69": dict(  # B3 nicotinamide
  kurz="Nikotinamid ist die Form von Vitamin B3, die keine Hautrötung auslöst.",
  wofuer=["Energiestoffwechsel", "Reparatur der Erbsubstanz",
          "Hautbehandlung"],
  wie_wirkt="Wie die Nikotinsäure wird Nikotinamid zu NAD umgebaut, dem "
       "zentralen Wasserstoffüberträger des Stoffwechsels. Anders als die Säure "
       "wirkt es nicht auf die Blutgefäße der Haut, deshalb fehlt der Flush. "
       "Auf die Blutfette hat es ebenfalls keinen Einfluss.",
  was_bringt="Es deckt den B3-Bedarf. In dermatologischen Studien senkte es bei "
       "Menschen mit häufigem weißem Hautkrebs die Rate neuer Herde. Als "
       "Nahrungsergänzung bei normaler Versorgung ist kein Nutzen belegt.",
  zu_viel="Die Obergrenze liegt niedriger als oft angenommen; sehr hohe Dosen "
       "über lange Zeit können die Leberwerte anheben. Der Flush der "
       "Nikotinsäure tritt hier nicht auf.",
  zu_wenig="Schwerer Mangel ist Pellagra — raue Haut im Sonnenlicht, Durchfall, "
       "Verwirrtheit. In Industrieländern kaum noch zu sehen.",
  wann_wie="Zeitpunkt beliebig, Verträglichkeit besser mit Essen.",
  wer_nicht=["Lebererkrankungen bei hohen Dosen"],
  mythen="Nikotinamid wird oft mit Nicotinamid-Ribosid gleichgesetzt und teuer "
       "als Anti-Aging-Mittel verkauft. Beides erhöht NAD, aber ein Nutzen für "
       "die Lebensspanne ist beim Menschen nicht gezeigt.",
  faq=[("Bekomme ich davon auch den Flush?",
        "Nein. Der Flush ist die Besonderheit der Nikotinsäure. Nikotinamid "
        "erweitert die Hautgefäße nicht."),
       ("Ist das dasselbe wie NMN oder NR?",
        "Verwandt, aber nicht dasselbe. Alle drei sind Vorstufen von NAD. "
        "Nikotinamid ist die klassische, billige Vitaminform; NMN und NR sind "
        "neuere und deutlich teurere Varianten.")],
),

"sub_b40347f995": dict(  # B5 pantothenic acid
  kurz="Vitamin B5 steckt in fast jedem Lebensmittel und hilft beim Verwerten "
       "von Fett.",
  wofuer=["Fett- und Energiestoffwechsel", "Bildung von Hormonen"],
  wie_wirkt="Pantothensäure ist Baustein von Coenzym A, dem Molekül, an dem der "
       "Körper Fettsäuren an- und abbaut. Ohne es steht auch die Bildung von "
       "Cholesterin und Steroidhormonen still.",
  was_bringt="Ein Mangel ist so selten, dass ein Nutzen der Ergänzung praktisch "
       "nie zu beobachten ist. Der Name stammt aus dem Griechischen für "
       "„überall\" — genau da kommt es auch vor.",
  zu_viel="Sehr hohe Mengen können Durchfall auslösen. Eine Obergrenze ist nicht "
       "festgelegt.",
  zu_wenig="Beschrieben nur unter experimentellen Bedingungen: Kribbeln und "
       "Brennen in den Füßen. Unter normaler Ernährung kommt es nicht vor.",
  wann_wie="Zeitpunkt egal.",
  wer_nicht=[],
  mythen="Hochdosiertes B5 wird gegen Akne beworben. Die Studienlage dazu ist "
       "dünn und die verwendeten Mengen liegen weit über dem Bedarf.",
  faq=[("Kann ich einen B5-Mangel haben?",
        "Sehr unwahrscheinlich. Pantothensäure kommt in Fleisch, Vollkorn, "
        "Hülsenfrüchten und Gemüse vor — praktisch in jeder Kost."),
       ("Warum ist B5 dann in jedem Multipräparat?",
        "Weil es billig ist und die Liste vollständig aussehen lässt. Ein "
        "gemessener Nutzen steckt bei normaler Ernährung nicht dahinter.")],
),

"sub_df4b1c61d9": dict(  # B6 pyridoxine
  kurz="Vitamin B6 wird gebraucht, um Eiweiß umzubauen und Botenstoffe im "
       "Gehirn herzustellen.",
  wofuer=["Eiweißstoffwechsel", "Botenstoffe wie Serotonin und Dopamin",
          "Bildung des roten Blutfarbstoffs"],
  wie_wirkt="In seiner aktiven Form ist B6 Helfer von über hundert Enzymen, die "
       "Aminosäuren umbauen. Daran hängen Serotonin, Dopamin und GABA — und der "
       "erste Schritt der Häm-Synthese für den Blutfarbstoff.",
  was_bringt="Bei Mangel bessern sich Blutbild und Hautveränderungen. In der "
       "Schwangerschaft wird B6 gegen Übelkeit eingesetzt, dafür gibt es "
       "belastbare Daten. Ohne Mangel ist ein Effekt auf Stimmung oder "
       "Konzentration nicht belegt.",
  zu_viel="B6 ist das einzige wasserlösliche Vitamin mit einem klaren "
       "Vergiftungsbild: Dauerhaft hohe Dosen schädigen die peripheren Nerven "
       "und führen zu Kribbeln, Taubheit und unsicherem Gang. Das ist meist, "
       "aber nicht immer, rückbildungsfähig.",
  zu_wenig="Rissige Mundwinkel, Hautentzündung, Blutarmut und in schweren Fällen "
       "Krampfanfälle. Kommt bei Alkoholabhängigkeit und unter bestimmten "
       "Medikamenten vor.",
  wann_wie="Zu einer Mahlzeit. Vorsicht bei mehreren Präparaten gleichzeitig — "
       "B6 steckt in vielen und die Mengen addieren sich.",
  wer_nicht=["Behandlung mit Levodopa bei Parkinson", "bestehende Nervenschäden"],
  mythen="B6 gilt als harmlos, weil es wasserlöslich ist. Bei den Nerven stimmt "
       "das gerade nicht — Nervenschäden durch zu viel B6 sind gut dokumentiert.",
  faq=[("Wie viel B6 ist zu viel?",
        "Nervenschäden sind vor allem bei dauerhaft sehr hohen Dosen "
        "beschrieben, teils schon unterhalb dessen, was manche Präparate "
        "enthalten. Wer mehrere Mittel kombiniert, sollte die Mengen "
        "zusammenzählen."),
       ("Hilft B6 gegen Schwangerschaftsübelkeit?",
        "Dafür gibt es die beste Datenlage aller B6-Anwendungen; es ist "
        "Bestandteil zugelassener Kombinationspräparate. Die Dosierung gehört "
        "in ärztliche Hand."),
       ("Merke ich eine Überdosierung rechtzeitig?",
        "Die ersten Zeichen sind Kribbeln und Taubheit in Händen und Füßen. "
        "Wer das bemerkt und B6 einnimmt, sollte das ärztlich abklären "
        "lassen.")],
),

"sub_f335fda43d": dict(  # B7 biotin
  kurz="Biotin ist ein B-Vitamin, das der Körper zum Auf- und Abbau von Fett "
       "und Zucker braucht.",
  wofuer=["Fett- und Zuckerstoffwechsel", "Aufbau von Keratin für Haare und Nägel"],
  wie_wirkt="Biotin sitzt als fester Baustein in vier Enzymen, die "
       "Kohlendioxid übertragen — Schlüsselschritte beim Aufbau von Fettsäuren "
       "und bei der Neubildung von Zucker. Darmbakterien stellen zusätzlich "
       "etwas her.",
  was_bringt="Bei einem echten Mangel wachsen Haare und Nägel wieder normal. "
       "Ohne Mangel ist der beworbene Effekt auf Haare und Nägel nicht belegt — "
       "die Studien dazu betrafen Menschen mit Mangel oder seltenen "
       "Stoffwechselkrankheiten.",
  zu_viel="Vergiftungen sind nicht bekannt. Das eigentliche Problem ist ein "
       "anderes: Hohe Biotindosen verfälschen Laborwerte.",
  zu_wenig="Haarausfall, schuppende Hautentzündung um Augen und Mund, "
       "Müdigkeit. Kommt bei sehr einseitiger Ernährung vor und bei rohem "
       "Eiweiß in großen Mengen.",
  wann_wie="Zeitpunkt egal. Vor einer Blutabnahme mindestens zwei Tage "
       "pausieren und das Labor informieren.",
  wer_nicht=[],
  mythen="„Biotin für schöne Haare\" ist der bekannteste Fall: Wer versorgt ist, "
       "bekommt davon weder mehr noch festeres Haar.",
  faq=[("Warum soll ich Biotin vor dem Blutabnehmen absetzen?",
        "Viele Labortests arbeiten mit Biotin als Hilfsstoff. Hohe Mengen im "
        "Blut stören die Messung — Schilddrüsenwerte und der Herzinfarktmarker "
        "Troponin können dadurch falsch herauskommen, in beide Richtungen."),
       ("Wachsen meine Nägel mit Biotin schneller?",
        "Nur wenn ein Mangel vorlag. Bei normaler Versorgung ist ein Effekt "
        "nicht gezeigt worden."),
       ("Kann ich zu viel Biotin nehmen?",
        "Eine Vergiftung ist nicht bekannt, der Überschuss geht über den Urin "
        "weg. Die Laborverfälschung bleibt aber ein ernstzunehmendes "
        "Problem.")],
),

"sub_f9ab6095e2": dict(  # B9 folic acid
  kurz="Folsäure ist die künstliche Form von Vitamin B9 und für die frühe "
       "Entwicklung des Kindes entscheidend.",
  wofuer=["Zellteilung und Wachstum", "Blutbildung",
          "Vorbeugung von Neuralrohrdefekten"],
  wie_wirkt="Folat überträgt Kohlenstoffgruppen — die Bausteine, aus denen "
       "Zellen ihre Erbsubstanz zusammensetzen. Wo sich Zellen schnell teilen, "
       "ist der Bedarf am höchsten: im Knochenmark und im wachsenden Embryo. "
       "Der Verschluss des Neuralrohrs geschieht in den ersten vier Wochen, oft "
       "bevor eine Schwangerschaft bemerkt wird.",
  was_bringt="Die Einnahme vor und in der Frühschwangerschaft senkt das Risiko "
       "für offene Rücken und ähnliche Fehlbildungen deutlich — einer der am "
       "besten belegten Effekte in der ganzen Vitaminforschung. Bei Mangel "
       "normalisiert sich außerdem das Blutbild.",
  zu_viel="Die Obergrenze für synthetische Folsäure liegt bei 1000 µg pro Tag. "
       "Der Grund ist nicht direkte Giftigkeit: Hohe Folsäuremengen können ein "
       "gleichzeitiges Vitamin-B12-Defizit im Blutbild verdecken, während die "
       "Nervenschäden weiter fortschreiten.",
  zu_wenig="Große, unreife rote Blutkörperchen, Müdigkeit, wunde Zunge. In der "
       "Schwangerschaft steigt das Fehlbildungsrisiko.",
  wann_wie="Täglich zur selben Zeit, idealerweise schon vor einer geplanten "
       "Schwangerschaft.",
  wer_nicht=["unbehandelter Vitamin-B12-Mangel"],
  mythen="Folsäure und Folat werden gleichgesetzt. Folat ist die natürliche Form "
       "aus Blattgemüse, Folsäure die stabilere synthetische — die tatsächlich "
       "besser aufgenommen wird.",
  faq=[("Ab wann sollte ich Folsäure nehmen, wenn ich schwanger werden will?",
        "Empfohlen wird der Beginn vor der Empfängnis, weil sich das Neuralrohr "
        "in den ersten vier Wochen schließt — häufig bevor die Schwangerschaft "
        "bekannt ist."),
       ("Reicht Blattgemüse nicht aus?",
        "Folat aus Lebensmitteln wird schlechter aufgenommen als Folsäure aus "
        "Präparaten, und die Mengen schwanken stark. Für die "
        "Schwangerschaftsvorsorge wird deshalb ein Präparat empfohlen."),
       ("Was hat Folsäure mit B12 zu tun?",
        "Beide sind an derselben Reaktion beteiligt. Viel Folsäure kann die "
        "Blutarmut eines B12-Mangels ausgleichen, ohne die Nervenschäden "
        "aufzuhalten — der Mangel fällt dann später auf.")],
),

"sub_72b40a8c12": dict(  # B12 cyanocobalamin
  kurz="Vitamin B12 kommt praktisch nur in tierischen Lebensmitteln vor und "
       "wird für Nerven und Blutbildung gebraucht.",
  wofuer=["Blutbildung", "Nervenschutz", "Abbau von Homocystein"],
  wie_wirkt="B12 ist Helfer von zwei Enzymen: Eines gibt eine Methylgruppe an "
       "Homocystein weiter, das andere arbeitet in den Kraftwerken der Zelle. "
       "Für die Aufnahme braucht der Körper einen im Magen gebildeten "
       "Transporthelfer — fehlt der, hilft auch viel B12 im Essen nicht. Die "
       "Leber speichert für Jahre.",
  was_bringt="Bei Mangel bessern sich Blutbild und Missempfindungen, wobei "
       "Nervenschäden nach langer Dauer unvollständig zurückgehen können. Ohne "
       "Mangel bringt B12 keine zusätzliche Energie — trotz der Werbung.",
  zu_viel="Es ist wasserlöslich, eine Obergrenze gibt es nicht. Bei "
       "Nierenschwäche wird die Cyanid-Gruppe des Cyanocobalamins gelegentlich "
       "diskutiert, was in der Praxis kaum eine Rolle spielt.",
  zu_wenig="Blutarmut mit großen roten Blutkörperchen, Kribbeln in Händen und "
       "Füßen, Gangunsicherheit, Gedächtnisprobleme. Vegan lebende Menschen und "
       "Ältere sind besonders betroffen; die Speicher leeren sich erst nach "
       "Jahren.",
  wann_wie="Zeitpunkt egal. Metformin und Magensäureblocker senken die Aufnahme "
       "auf Dauer.",
  wer_nicht=[],
  mythen="B12 aus Algen oder Sauerkraut gilt als pflanzliche Quelle. Meist "
       "handelt es sich um Analoga, die der Körper nicht verwerten kann und die "
       "die Messung zusätzlich verfälschen.",
  faq=[("Warum ist B12 für vegan lebende Menschen ein Thema?",
        "Es stammt aus Bakterien und reichert sich in tierischen Produkten an. "
        "Rein pflanzliche Kost enthält praktisch keines, deshalb wird eine "
        "Ergänzung ausdrücklich empfohlen."),
       ("Cyanocobalamin oder Methylcobalamin?",
        "Cyanocobalamin ist stabiler und am besten untersucht; der Körper baut "
        "es in die aktiven Formen um. Ein Vorteil der teureren Varianten ist "
        "in Studien nicht klar gezeigt."),
       ("Wie lange dauert es, bis ein Mangel entsteht?",
        "Weil die Leber jahrelang speichert, zeigt sich ein Mangel oft erst "
        "nach drei bis fünf Jahren veränderter Ernährung.")],
),

}
