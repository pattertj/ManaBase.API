var request = require('request');

module.exports = function (app, db) {
    app.post('/api/manabase', (req, res) => {
        var decklist = req.body.decklist + '';

        SplitPool(decklist)
            .then(function (cards) {
                return GetGathererData(cards);
            })
            .then(function (gatheredCards) {
                return CalculateManaBase(gatheredCards, req.body.format);
            })
            .then(function (finalResults) {
                res.json(finalResults);
            })
            .catch(function (err) {
                console.error(err);
            });
    });

    function SplitPool(poolText) {
        return new Promise((resolve, reject) => {
            // Split Pool
            var cardArray = poolText.split(/\r?\n/);
            var cardObjectArray = [];

            cardArray.forEach(card => {
                // Split Card and Count
                var newCard = {
                    cardName: card.substr(card.indexOf(' ') + 1),
                    cardCount: parseInt(card.substr(0, card.indexOf(' ')))
                };

                // Add card object to Array = number of cards.
                cardObjectArray.push(newCard);
            });

            // Return an Array of Cards
            resolve(cardObjectArray);
        })
    };

    function GetGathererData(cards) {
        return new Promise((resolve, reject) => {
            cardGathererPromises = cards.map(fetchGathererData);

            Promise.all(cardGathererPromises)
                .then(function (results) {
                    results.forEach(card => {
                        card.W = (card.manaCost.match(/W/g) || []).length;
                        card.U = (card.manaCost.match(/U/g) || []).length;
                        card.B = (card.manaCost.match(/B/g) || []).length;
                        card.R = (card.manaCost.match(/R/g) || []).length;
                        card.G = (card.manaCost.match(/G/g) || []).length;
                    });

                    resolve(results);
                });
        })
    };

    function CalculateManaBase(decklist, format) {
        return new Promise((resolve, reject) => {

            var manaAnalysis = {
                whiteSources: 0,
                blueSources: 0,
                blackSources: 0,
                redSources: 0,
                greenSources: 0
            };

            // Loop through the cards to determine the max pip count for each color in the deck.
            decklist.forEach(currentCard => {

                console.log(currentCard);

                // Calculate how many mana sources are needed of each color for a given card
                var wManaSources = manaSourcesNeeded(currentCard.cmc, currentCard.W, format);
                var uManaSources = manaSourcesNeeded(currentCard.cmc, currentCard.U, format);
                var bManaSources = manaSourcesNeeded(currentCard.cmc, currentCard.B, format);
                var rManaSources = manaSourcesNeeded(currentCard.cmc, currentCard.R, format);
                var gManaSources = manaSourcesNeeded(currentCard.cmc, currentCard.G, format);

                // Determine the max mana sources needed for each color after each card
                manaAnalysis.whiteSources = Math.max(manaAnalysis.whiteSources, wManaSources);
                manaAnalysis.blueSources = Math.max(manaAnalysis.blueSources, uManaSources);
                manaAnalysis.blackSources = Math.max(manaAnalysis.blackSources, bManaSources);
                manaAnalysis.redSources = Math.max(manaAnalysis.redSources, rManaSources);
                manaAnalysis.greenSources = Math.max(manaAnalysis.greenSources, gManaSources);
            });

            resolve(manaAnalysis);
        })
    };

    function manaSourcesNeeded(turn, pips, format) {
        var result = [];

            result = manaChart.filter(function (entry) {
                return entry.format === format && entry.turn === turn && entry.pips === pips;
            }) || [];

        if (result.length === 0)
            return 0;
        else
            return result[0].sources;
    }

    // Extension of Array.Sum to sum attributes.
    Array.prototype.sum = function (prop) {
        var total = 0
        for (var i = 0, _len = this.length; i < _len; i++) {
            total += this[i][prop]
        }
        return total
    }

    var fetchGathererData = function (card) {
        return new Promise((resolve, reject) => {
            var options = {
                url: 'https://mtgcardapi.herokuapp.com/api/cards/' + card.cardName,
                json: true
            };

            request(options, function (error, response, body) {
                body.cardCount = card.cardCount;
                resolve(body);
            });
        });
    };

    var manaChart = [
        {
          "format": "Limited",
          "turn": 1,
          "pips": 1,
          "sources": 10
        },
        {
          "format": "Limited",
          "turn": 2,
          "pips": 1,
          "sources": 9
        },
        {
          "format": "Limited",
          "turn": 3,
          "pips": 1,
          "sources": 8
        },
        {
          "format": "Limited",
          "turn": 4,
          "pips": 1,
          "sources": 7
        },
        {
          "format": "Limited",
          "turn": 5,
          "pips": 1,
          "sources": 7
        },
        {
          "format": "Limited",
          "turn": 6,
          "pips": 1,
          "sources": 6
        },
        {
          "format": "Limited",
          "turn": 7,
          "pips": 1,
          "sources": 6
        },
        {
          "format": "Standard",
          "turn": 1,
          "pips": 1,
          "sources": 14
        },
        {
          "format": "Standard",
          "turn": 2,
          "pips": 1,
          "sources": 13
        },
        {
          "format": "Standard",
          "turn": 3,
          "pips": 1,
          "sources": 12
        },
        {
          "format": "Standard",
          "turn": 4,
          "pips": 1,
          "sources": 11
        },
        {
          "format": "Standard",
          "turn": 5,
          "pips": 1,
          "sources": 10
        },
        {
          "format": "Standard",
          "turn": 6,
          "pips": 1,
          "sources": 9
        },
        {
          "format": "Standard",
          "turn": 7,
          "pips": 1,
          "sources": 9
        },
        {
          "format": "Commander",
          "turn": 1,
          "pips": 1,
          "sources": 23
        },
        {
          "format": "Commander",
          "turn": 2,
          "pips": 1,
          "sources": 21
        },
        {
          "format": "Commander",
          "turn": 3,
          "pips": 1,
          "sources": 20
        },
        {
          "format": "Commander",
          "turn": 4,
          "pips": 1,
          "sources": 18
        },
        {
          "format": "Commander",
          "turn": 5,
          "pips": 1,
          "sources": 17
        },
        {
          "format": "Commander",
          "turn": 6,
          "pips": 1,
          "sources": 16
        },
        {
          "format": "Commander",
          "turn": 7,
          "pips": 1,
          "sources": 15
        },
        {
          "format": "Limited",
          "turn": 2,
          "pips": 2,
          "sources": 14
        },
        {
          "format": "Limited",
          "turn": 3,
          "pips": 2,
          "sources": 13
        },
        {
          "format": "Limited",
          "turn": 4,
          "pips": 2,
          "sources": 12
        },
        {
          "format": "Limited",
          "turn": 5,
          "pips": 2,
          "sources": 11
        },
        {
          "format": "Limited",
          "turn": 6,
          "pips": 2,
          "sources": 10
        },
        {
          "format": "Limited",
          "turn": 7,
          "pips": 2,
          "sources": 10
        },
        {
          "format": "Standard",
          "turn": 2,
          "pips": 2,
          "sources": 20
        },
        {
          "format": "Standard",
          "turn": 3,
          "pips": 2,
          "sources": 19
        },
        {
          "format": "Standard",
          "turn": 4,
          "pips": 2,
          "sources": 18
        },
        {
          "format": "Standard",
          "turn": 5,
          "pips": 2,
          "sources": 16
        },
        {
          "format": "Standard",
          "turn": 6,
          "pips": 2,
          "sources": 15
        },
        {
          "format": "Standard",
          "turn": 7,
          "pips": 2,
          "sources": 14
        },
        {
          "format": "Commander",
          "turn": 2,
          "pips": 2,
          "sources": 33
        },
        {
          "format": "Commander",
          "turn": 3,
          "pips": 2,
          "sources": 31
        },
        {
          "format": "Commander",
          "turn": 4,
          "pips": 2,
          "sources": 29
        },
        {
          "format": "Commander",
          "turn": 5,
          "pips": 2,
          "sources": 27
        },
        {
          "format": "Commander",
          "turn": 6,
          "pips": 2,
          "sources": 26
        },
        {
          "format": "Commander",
          "turn": 7,
          "pips": 2,
          "sources": 24
        },
        {
          "format": "Limited",
          "turn": 3,
          "pips": 3,
          "sources": 16
        },
        {
          "format": "Limited",
          "turn": 4,
          "pips": 3,
          "sources": 15
        },
        {
          "format": "Limited",
          "turn": 5,
          "pips": 3,
          "sources": 14
        },
        {
          "format": "Limited",
          "turn": 6,
          "pips": 3,
          "sources": 14
        },
        {
          "format": "Limited",
          "turn": 7,
          "pips": 3,
          "sources": 13
        },
        {
          "format": "Standard",
          "turn": 3,
          "pips": 3,
          "sources": 22
        },
        {
          "format": "Standard",
          "turn": 4,
          "pips": 3,
          "sources": 22
        },
        {
          "format": "Standard",
          "turn": 5,
          "pips": 3,
          "sources": 21
        },
        {
          "format": "Standard",
          "turn": 6,
          "pips": 3,
          "sources": 20
        },
        {
          "format": "Standard",
          "turn": 7,
          "pips": 3,
          "sources": 19
        },
        {
          "format": "Commander",
          "turn": 3,
          "pips": 3,
          "sources": 37
        },
        {
          "format": "Commander",
          "turn": 4,
          "pips": 3,
          "sources": 36
        },
        {
          "format": "Commander",
          "turn": 5,
          "pips": 3,
          "sources": 34
        },
        {
          "format": "Commander",
          "turn": 6,
          "pips": 3,
          "sources": 33
        },
        {
          "format": "Commander",
          "turn": 7,
          "pips": 3,
          "sources": 32
        }
       ];
};