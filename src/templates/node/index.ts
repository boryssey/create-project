process.stdin.resume();

// do your thing
process.on('SIGINT', () => {   process.exit(); }); 

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const suits = {
  hearts: 1,
  diamonds: 2,
  spades: 3,
  clubs: 4,
} as const;

const values = {
  Ace: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  Jack: 11,
  Queen: 12,
  King: 13
} as const;

type Card = {
    suit: keyof typeof suits;
    value: keyof typeof values;
}

const deck = (Object.keys(suits) as Array<keyof typeof suits>).reduce<Card[]>((curDeck, curSuit) => {
  const cards = (Object.keys(values) as Array<keyof typeof values>).reduce<Card[]>((suitDeck, curCardValue) => {
    const newCard = {
        suit: curSuit,
        value: curCardValue,
      }
    return [
      ...suitDeck,
      newCard
    ];
  }, []);
  return [...curDeck, ...cards];
}, []);

/*
    1. shuffle
    2. deal
    3. sort
*/


const swapPositions = (pos1: number, pos2: number, arr: Array<unknown>) => {
    const tmp = arr[pos1];
    arr[pos1] = arr[pos2];
    arr[pos2] = tmp;
}

const shuffleDeck = (deck: Card[], numberOfShuffles: number) => {
    for(let i = 0; i < numberOfShuffles; i++) {
        const pos1 = randomIntFromInterval(0, deck.length - 1);
        const pos2 = randomIntFromInterval(0, deck.length - 1);
        swapPositions(pos1, pos2, deck);
    }
};

// console.log({oldDeck: deck, length: deck.length});
shuffleDeck(deck, 1000);
// console.log({newDeck: deck, length: deck.length});


type Deck = Card[]

const deckCopy = [...deck]

const deal = (deck: Deck, numOfCards: number) => {
    const cardsToDeal = deck.splice(0, numOfCards);
    return cardsToDeal;
}

console.log("🚀 ~ deckCopy:", deckCopy, deckCopy.length)


const hand = deal(deckCopy, 5);
console.log("🚀 ~ hand:", hand)
console.log("🚀 ~ deck after deal:", deckCopy, deckCopy.length)

const sortDeck = (deck: Deck) => {
    return deck.sort((a, b) => {
        const rankA = values[a.value];
        const rankB = values[b.value];
        if(rankA < rankB) {
            return -1;
        }
        if(rankA > rankB) {
            return 1;
        }
        // valB === valB
        const suitRankA = suits[a.suit]
        const suitRankB = suits[b.suit];
        if(suitRankA < suitRankB) {
            return -1;
        }
        if(suitRankA > suitRankB) {
            return 1;
        }
        return 0
    })
}

console.log({deck})
const sortedDeck = sortDeck(deck)
console.log({sortedDeck: deck})

