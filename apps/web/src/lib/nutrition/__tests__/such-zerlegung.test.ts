import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildFoodSearchTokenGroups, zerlegeWort } from '../such-zerlegung'
import { buildFoodSearchGroups, normalizeFoodSearchText } from '../food-search'

describe('Zerlegung deutscher Komposita', () => {
  it('zerlegt Komposita in Kopf und Rest', () => {
    assert.deepEqual(zerlegeWort('huehnerbrust'), ['huehner', 'brust'])
    assert.deepEqual(zerlegeWort('kartoffelsalat'), ['kartoffel', 'salat'])
    assert.deepEqual(zerlegeWort('apfelsaft'), ['apfel', 'saft'])
    assert.deepEqual(zerlegeWort('lachsfilet'), ['lachs', 'filet'])
  })

  it('erkennt Fugenelemente', () => {
    // "rinderhack" -> rind + hack, Fuge "er"; die Fuge verschwindet.
    assert.deepEqual(zerlegeWort('rinderhack'), ['rind', 'hack'])
    assert.deepEqual(zerlegeWort('schweinefleisch'), ['schweine', 'fleisch'])
  })

  it('laesst echte Einzelwoerter unangetastet', () => {
    // Der Schutz sitzt nicht hier, sondern in buildFoodSearchTokenGroups:
    // Woerter aus dem Wortschatz werden gar nicht erst zerlegt.
    for (const wort of ['spinat', 'quark', 'lachs', 'apfel', 'tomate']) {
      const gruppen = buildFoodSearchTokenGroups(wort)
      assert.equal(gruppen.length, 1, wort + ' darf nur eine Gruppe ergeben')
      assert.ok(gruppen[0].includes(wort), wort + ' muss in seiner Gruppe stehen')
    }
  })

  it('zerlegt Bestandswoerter NICHT, auch wenn es ginge', () => {
    // `[cmd]` "weisswurst" liesse sich zu weiss+wurst zerlegen und
    // traefe dann jede weisse Sauce. Weil das Wort selbst im Bestand
    // steht, bleibt es ganz.
    const gruppen = buildFoodSearchTokenGroups('weisswurst')
    assert.equal(gruppen.length, 1)
    assert.ok(gruppen[0].includes('weisswurst'))
  })

  it('bindet die Teile eines Kompositums mit UND, nicht mit ODER', () => {
    // Der Unterschied entscheidet ueber die Brauchbarkeit: als eine
    // ODER-Gruppe liefert "huehnerbrust" 216 diffuse Treffer, als zwei
    // UND-Gruppen 31 mit dem Haehnchenbrustfilet an erster Stelle.
    const gruppen = buildFoodSearchTokenGroups('huehnerbrust')
    assert.equal(gruppen.length, 2, 'Kopf und Rest sind getrennte Gruppen')
    assert.ok(gruppen[0].includes('huehner'))
    assert.ok(gruppen[1].includes('brust'))
    assert.ok(!gruppen[0].includes('brust'), 'brust darf nicht in der Kopfgruppe stehen')
  })
})

describe('Synonyme in den Suchgruppen', () => {
  it('bruecken aus der Handliste stehen in der Gruppe', () => {
    // Ohne diese Bruecke findet Toms Ausgangsfall nichts: der Bestand
    // schreibt "Hähnchen", die Anfrage sagt "Hühner".
    const gruppen = buildFoodSearchTokenGroups('huehnerbrust')
    assert.ok(gruppen[0].includes('haehnchen'),
      'huehner muss auf haehnchen zeigen, sonst ist der Bestand unerreichbar')
  })

  it('uebernimmt Mundart aus dem Thesaurus', () => {
    assert.ok(buildFoodSearchTokenGroups('karfiol')[0].includes('blumenkohl'))
    assert.ok(buildFoodSearchTokenGroups('marille')[0].includes('aprikose'))
    assert.ok(buildFoodSearchTokenGroups('paradeiser')[0].includes('tomate'))
  })

  it('das getippte Wort steht immer an erster Stelle', () => {
    const gruppe = buildFoodSearchTokenGroups('karfiol')[0]
    assert.equal(gruppe[0], 'karfiol')
  })
})

describe('Umlaute: gefaltet wird vor dem Zerlegen', () => {
  it('echte Umlaute und Umschrift ergeben dieselben Gruppen', () => {
    // `[cmd]` Der Wortschatz wird gefaltet erzeugt, deshalb zerlegen
    // beide Schreibweisen gleich. Wuerde man vor dem Falten zerlegen,
    // funktionierte nur die Fassung mit echtem Umlaut — und gerade
    // Toms Anfrage "huehnerbrust" hat keinen.
    assert.deepEqual(
      buildFoodSearchGroups('Hühnerbrust'),
      buildFoodSearchGroups('huehnerbrust'),
    )
    assert.deepEqual(
      buildFoodSearchGroups('Gemüsebrühe'),
      buildFoodSearchGroups('gemuesebruehe'),
    )
  })

  it('faltet vor der Zerlegung, nicht danach', () => {
    assert.equal(normalizeFoodSearchText('Hühnerbrust'), 'huehnerbrust')
    assert.deepEqual(zerlegeWort(normalizeFoodSearchText('Hühnerbrust')), ['huehner', 'brust'])
  })
})

describe('Suchgruppen als Ganzes', () => {
  it('eine leere Anfrage ergibt keine Gruppen', () => {
    assert.deepEqual(buildFoodSearchGroups(''), [])
    assert.deepEqual(buildFoodSearchGroups('   '), [])
  })

  it('getrennt geschriebene Anfragen ergeben je Wort eine Gruppe', () => {
    const gruppen = buildFoodSearchGroups('huehner brust')
    assert.equal(gruppen.length, 2)
    assert.ok(gruppen[0].includes('haehnchen'))
    assert.ok(gruppen[1].includes('brust'))
  })

  it('deckelt die Zahl der Gruppen', () => {
    assert.ok(buildFoodSearchGroups('a b c d e f g h i j').length <= 6)
  })
})
