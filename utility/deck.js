class Deck {
    constructor(cards = freshDeck()) {
        this.cards = cards;
    }
    get getNumberOfCards() {
        return this.cards.length;
    }
    shuffle() {
        for (let i = this.getNumberOfCards - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1));
            const oldValue = this.cards[newIndex];
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = oldValue;
        }
    }
}

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
}

const SUITS = ["♠️", "♣️", "❤", "♦️"];
const VALUES = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
];

function freshDeck() {
    return SUITS.flatMap((suit) =>
        VALUES.map((value) => new Card(suit, value))
    );
}

const deck = new Deck();
deck.shuffle();
module.exports = deck;
