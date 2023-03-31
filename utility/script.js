const deck = require("./deck");

function SplitCards(cards) {
    let usedInd = [];
    let openCard,
        givenCards = [];
    while (givenCards.length < 5) {
        let randomInd = Math.random(Math.random() * (52 + 1));
        if (!usedInd.includes(randomInd)) {
            usedInd.push(randomInd);
            const givenCard = cards.splice(randomInd, 1);
            givenCards.push(...givenCard);
        }
        if (!openCard) {
            let randomInd = Math.random(Math.random() * (52 + 1));
            if (!usedInd.includes(randomInd)) {
                usedInd.push(randomInd);
                const givenCard = cards.splice(randomInd, 1);
                openCard = givenCard[0];
            }
        }
    }
    return { openCard, givenCards, drawDeck: cards };
}

module.exports = SplitCards(deck.cards);
