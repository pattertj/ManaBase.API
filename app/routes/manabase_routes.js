var request = require('request');

module.exports = function (app, db) {
    app.post('/api/manabase', (req, res) => {
        var decklist = req.body.decklist + '';

        SplitPool(decklist)
            .then(function (cards) {
                return GetGathererData(cards);
            })
            .then(function (gatheredCards) {
                return CalculateManaBase(gatheredCards);
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

    function CalculateManaBase(decklist) {
        return new Promise((resolve, reject) => {
            var totalLands = 60 - decklist.sum("cardCount");
            var manaAnalysis = {
                whiteSources: 0,
                blueSources: 0,
                blackSources: 0,
                redSources: 0,
                greenSources: 0
            };

            if (totalLands > 27 || totalLands < 20)
                console.error("Invalid Land Count. Land total must be 20-27. Only 60-card decks are supported currently.");
            else {
                // Loop through the cards to determine the max pip count for each color in the deck.
                decklist.forEach(currentCard => {

                    // Calculate how many mana sources are needed of each color for a given card
                    var wManaSources = manaSourcesNeeded(totalLands, currentCard.cmc, currentCard.W);
                    var uManaSources = manaSourcesNeeded(totalLands, currentCard.cmc, currentCard.U);
                    var bManaSources = manaSourcesNeeded(totalLands, currentCard.cmc, currentCard.B);
                    var rManaSources = manaSourcesNeeded(totalLands, currentCard.cmc, currentCard.R);
                    var gManaSources = manaSourcesNeeded(totalLands, currentCard.cmc, currentCard.G);

                    // Determine the max mana sources needed for each color after each card
                    manaAnalysis.whiteSources = Math.max(manaAnalysis.whiteSources, wManaSources);
                    manaAnalysis.blueSources = Math.max(manaAnalysis.blueSources, uManaSources);
                    manaAnalysis.blackSources = Math.max(manaAnalysis.blackSources, bManaSources);
                    manaAnalysis.redSources = Math.max(manaAnalysis.redSources, rManaSources);
                    manaAnalysis.greenSources = Math.max(manaAnalysis.greenSources, gManaSources);
                });
            }

            resolve(manaAnalysis);
        })
    };

    function manaSourcesNeeded(land, turn, pips) {
        var result = [];

        if (pips === 1) {
            result = onePipChart.filter(function (entry) {
                return entry.lands === land && entry.turn === turn;
            }) || [];
        }
        if (pips === 2) {
            result = twoPipChart.filter(function (entry) {
                return entry.lands === land && entry.turn === turn;
            }) || [];
        }
        if (pips === 3) {
            result = threePipChart.filter(function (entry) {
                return entry.lands === land && entry.turn === turn;
            }) || [];
        }

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

    var onePipChart = [{
            lands: 20,
            turn: 1,
            sources: 12
        }, {
            lands: 20,
            turn: 2,
            sources: 12
        }, {
            lands: 20,
            turn: 3,
            sources: 11
        }, {
            lands: 20,
            turn: 4,
            sources: 10
        }, {
            lands: 20,
            turn: 5,
            sources: 9
        }, {
            lands: 20,
            turn: 6,
            sources: 9
        }, {
            lands: 20,
            turn: 7,
            sources: 8
        },
        {
            lands: 21,
            turn: 1,
            sources: 13
        }, {
            lands: 21,
            turn: 2,
            sources: 12
        }, {
            lands: 21,
            turn: 3,
            sources: 11
        }, {
            lands: 21,
            turn: 4,
            sources: 10
        }, {
            lands: 21,
            turn: 5,
            sources: 10
        }, {
            lands: 21,
            turn: 6,
            sources: 9
        }, {
            lands: 21,
            turn: 7,
            sources: 8
        },
        {
            lands: 22,
            turn: 1,
            sources: 13
        }, {
            lands: 22,
            turn: 2,
            sources: 12
        }, {
            lands: 22,
            turn: 3,
            sources: 11
        }, {
            lands: 22,
            turn: 4,
            sources: 10
        }, {
            lands: 22,
            turn: 5,
            sources: 10
        }, {
            lands: 22,
            turn: 6,
            sources: 9
        }, {
            lands: 22,
            turn: 7,
            sources: 8
        },
        {
            lands: 23,
            turn: 1,
            sources: 13
        }, {
            lands: 23,
            turn: 2,
            sources: 12
        }, {
            lands: 23,
            turn: 3,
            sources: 12
        }, {
            lands: 23,
            turn: 4,
            sources: 11
        }, {
            lands: 23,
            turn: 5,
            sources: 10
        }, {
            lands: 23,
            turn: 6,
            sources: 9
        }, {
            lands: 23,
            turn: 7,
            sources: 9
        },
        {
            lands: 24,
            turn: 1,
            sources: 14
        }, {
            lands: 24,
            turn: 2,
            sources: 13
        }, {
            lands: 24,
            turn: 3,
            sources: 12
        }, {
            lands: 24,
            turn: 4,
            sources: 11
        }, {
            lands: 24,
            turn: 5,
            sources: 10
        }, {
            lands: 24,
            turn: 6,
            sources: 9
        }, {
            lands: 24,
            turn: 7,
            sources: 9
        },
        {
            lands: 25,
            turn: 1,
            sources: 14
        }, {
            lands: 25,
            turn: 2,
            sources: 13
        }, {
            lands: 25,
            turn: 3,
            sources: 12
        }, {
            lands: 25,
            turn: 4,
            sources: 11
        }, {
            lands: 25,
            turn: 5,
            sources: 10
        }, {
            lands: 25,
            turn: 6,
            sources: 10
        }, {
            lands: 25,
            turn: 7,
            sources: 9
        },
        {
            lands: 26,
            turn: 1,
            sources: 15
        }, {
            lands: 26,
            turn: 2,
            sources: 13
        }, {
            lands: 26,
            turn: 3,
            sources: 12
        }, {
            lands: 26,
            turn: 4,
            sources: 11
        }, {
            lands: 26,
            turn: 5,
            sources: 10
        }, {
            lands: 26,
            turn: 6,
            sources: 10
        }, {
            lands: 26,
            turn: 7,
            sources: 9
        },
        {
            lands: 27,
            turn: 1,
            sources: 15
        }, {
            lands: 27,
            turn: 2,
            sources: 14
        }, {
            lands: 27,
            turn: 3,
            sources: 12
        }, {
            lands: 27,
            turn: 4,
            sources: 11
        }, {
            lands: 27,
            turn: 5,
            sources: 10
        }, {
            lands: 27,
            turn: 6,
            sources: 10
        }, {
            lands: 27,
            turn: 7,
            sources: 9
        }
    ];

    var twoPipChart = [{
            lands: 20,
            turn: 2,
            sources: 18
        }, {
            lands: 20,
            turn: 3,
            sources: 17
        }, {
            lands: 20,
            turn: 4,
            sources: 16
        }, {
            lands: 20,
            turn: 5,
            sources: 15
        }, {
            lands: 20,
            turn: 6,
            sources: 14
        }, {
            lands: 20,
            turn: 7,
            sources: 14
        },
        {
            lands: 21,
            turn: 2,
            sources: 18
        }, {
            lands: 21,
            turn: 3,
            sources: 17
        }, {
            lands: 21,
            turn: 4,
            sources: 16
        }, {
            lands: 21,
            turn: 5,
            sources: 16
        }, {
            lands: 21,
            turn: 6,
            sources: 15
        }, {
            lands: 21,
            turn: 7,
            sources: 14
        },
        {
            lands: 22,
            turn: 2,
            sources: 19
        }, {
            lands: 22,
            turn: 3,
            sources: 18
        }, {
            lands: 22,
            turn: 4,
            sources: 17
        }, {
            lands: 22,
            turn: 5,
            sources: 16
        }, {
            lands: 22,
            turn: 6,
            sources: 15
        }, {
            lands: 22,
            turn: 7,
            sources: 14
        },
        {
            lands: 23,
            turn: 2,
            sources: 20
        }, {
            lands: 23,
            turn: 3,
            sources: 18
        }, {
            lands: 23,
            turn: 4,
            sources: 17
        }, {
            lands: 23,
            turn: 5,
            sources: 16
        }, {
            lands: 23,
            turn: 6,
            sources: 15
        }, {
            lands: 23,
            turn: 7,
            sources: 14
        },
        {
            lands: 24,
            turn: 2,
            sources: 20
        }, {
            lands: 24,
            turn: 3,
            sources: 19
        }, {
            lands: 24,
            turn: 4,
            sources: 18
        }, {
            lands: 24,
            turn: 5,
            sources: 16
        }, {
            lands: 24,
            turn: 6,
            sources: 15
        }, {
            lands: 24,
            turn: 7,
            sources: 14
        },
        {
            lands: 25,
            turn: 2,
            sources: 21
        }, {
            lands: 25,
            turn: 3,
            sources: 19
        }, {
            lands: 25,
            turn: 4,
            sources: 18
        }, {
            lands: 25,
            turn: 5,
            sources: 17
        }, {
            lands: 25,
            turn: 6,
            sources: 16
        }, {
            lands: 25,
            turn: 7,
            sources: 15
        },
        {
            lands: 26,
            turn: 2,
            sources: 21
        }, {
            lands: 26,
            turn: 3,
            sources: 20
        }, {
            lands: 26,
            turn: 4,
            sources: 18
        }, {
            lands: 26,
            turn: 5,
            sources: 17
        }, {
            lands: 26,
            turn: 6,
            sources: 16
        }, {
            lands: 26,
            turn: 7,
            sources: 15
        },
        {
            lands: 27,
            turn: 2,
            sources: 22
        }, {
            lands: 27,
            turn: 3,
            sources: 20
        }, {
            lands: 27,
            turn: 4,
            sources: 18
        }, {
            lands: 27,
            turn: 5,
            sources: 17
        }, {
            lands: 27,
            turn: 6,
            sources: 16
        }, {
            lands: 27,
            turn: 7,
            sources: 15
        }
    ];

    var threePipChart = [{
            lands: 20,
            turn: 3,
            sources: 19
        }, {
            lands: 20,
            turn: 4,
            sources: 19
        }, {
            lands: 20,
            turn: 5,
            sources: 18
        }, {
            lands: 20,
            turn: 6,
            sources: 18
        }, {
            lands: 20,
            turn: 7,
            sources: 17
        },
        {
            lands: 21,
            turn: 3,
            sources: 20
        }, {
            lands: 21,
            turn: 4,
            sources: 20
        }, {
            lands: 21,
            turn: 5,
            sources: 19
        }, {
            lands: 21,
            turn: 6,
            sources: 18
        }, {
            lands: 21,
            turn: 7,
            sources: 18
        },
        {
            lands: 22,
            turn: 3,
            sources: 21
        }, {
            lands: 22,
            turn: 4,
            sources: 20
        }, {
            lands: 22,
            turn: 5,
            sources: 20
        }, {
            lands: 22,
            turn: 6,
            sources: 19
        }, {
            lands: 22,
            turn: 7,
            sources: 18
        },
        {
            lands: 23,
            turn: 3,
            sources: 22
        }, {
            lands: 23,
            turn: 4,
            sources: 21
        }, {
            lands: 23,
            turn: 5,
            sources: 20
        }, {
            lands: 23,
            turn: 6,
            sources: 20
        }, {
            lands: 23,
            turn: 7,
            sources: 19
        },
        {
            lands: 24,
            turn: 3,
            sources: 22
        }, {
            lands: 24,
            turn: 4,
            sources: 22
        }, {
            lands: 24,
            turn: 5,
            sources: 21
        }, {
            lands: 24,
            turn: 6,
            sources: 20
        }, {
            lands: 24,
            turn: 7,
            sources: 19
        },
        {
            lands: 25,
            turn: 3,
            sources: 23
        }, {
            lands: 25,
            turn: 4,
            sources: 22
        }, {
            lands: 25,
            turn: 5,
            sources: 21
        }, {
            lands: 25,
            turn: 6,
            sources: 20
        }, {
            lands: 25,
            turn: 7,
            sources: 19
        },
        {
            lands: 26,
            turn: 3,
            sources: 23
        }, {
            lands: 26,
            turn: 4,
            sources: 22
        }, {
            lands: 26,
            turn: 5,
            sources: 21
        }, {
            lands: 26,
            turn: 6,
            sources: 20
        }, {
            lands: 26,
            turn: 7,
            sources: 20
        },
        {
            lands: 27,
            turn: 3,
            sources: 24
        }, {
            lands: 27,
            turn: 4,
            sources: 23
        }, {
            lands: 27,
            turn: 5,
            sources: 22
        }, {
            lands: 27,
            turn: 6,
            sources: 21
        }, {
            lands: 27,
            turn: 7,
            sources: 20
        }
    ];
};