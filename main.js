// The Game of Poker

const [p1_span, p2_span] = document.querySelectorAll('.player span');
const card_unicodes = getCardUnicodes();
const card_values = Array.from('23456789TJQKA');

let deck_of_cards; resetDeckOfCards();

function createCards() {
    const card_array = [];
    for (let j = 0; j < 4; j++) {  // four cards
        const card_div = document.createElement('button');
        document.querySelector('.pick.cards').append(card_div);
        card_div.innerHTML = '&#127136;';  // back of card
        card_array.push(card_div);
        card_div.className = 'card';
    }
    return card_array;
}

function resetDeckOfCards() {
    deck_of_cards = [];
    card_values.forEach(val => {
        Array.from('SHDC').forEach(suit => {
            deck_of_cards.push(val + suit);
        })
    })
}

function getCardUnicodes() {
    const card_unicodes = {};
    let jj = 0;
    for (let j = 10; j <= 13; j++) {
        let ii = 0;
        for (let i = 1; i <= 14; i++) {
            if (i === 12) continue;
            const card = 'A23456789TJQK'[ii] + 'SHDC'[jj];
            const hex = `1f0${j.toString(16)}${i.toString(16)}`;
            card_unicodes[card] = `&#${parseInt(hex, 16)};`;
            ii++;
        }
        jj++;
    }
    return card_unicodes;
}

/**Deals a random card to player from the deck of cards */
function dealCard(player) {
    const card = deck_of_cards[getRandomInt(0, deck_of_cards.length - 1)];
    const pos = deck_of_cards.indexOf(card);
    player.push(...deck_of_cards.splice(pos, 1));
    return player;

    /**Get a random integer in the interval [min, max] */
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

function flipCard(card_div, card, class_name) {
    if (card_div.innerHTML.codePointAt() === 127136) {
        card_div.innerHTML = card;
        card_div.className = class_name;
    } else {
        card_div.innerHTML = '&#127136;';
        card_div.className = 'back card';
    }
}


// (0) - there are 52 cards in deck, player1 and player2 have no cards
// (1) - 4 random cards generated from available cards in deck
// (2) - player1 picks a card from the cards generated
// (3) - repeat step (1)
// (4) - player2 picks a card from the cards generated
// (5) - repeat step (1) to (4) until player1 and player2 have 5 cards each
// (6) - call pokerhands for player1 vs player2


const hand1 = [];
const hand2 = [];
let turn = 'player1';
const picks_array = createCards();

function generate4RandomCards() {
    const randomCards = [];
    for (let i = 0; i < 4; i++) {
        dealCard(randomCards);
        cardHtml(randomCards[i], picks_array[i]);
        picks_array[i].onclick = () => playerPick(randomCards[i]);
    }
}

/**Use card string to customise card_div html element */
function cardHtml(card, card_div) {
    card_div.innerHTML = card_unicodes[card];
    let class_name;
    if (card.includes('D') || card.includes('H')) {
        card_div.className = 'red card';
        class_name = 'red card';
    } else {
        card_div.className = 'black card';
        class_name = 'black card';
    }
}


generate4RandomCards();

function playerPick(card) {
    let hand;
    if (turn === 'player1') {
        hand = hand1;
        console.log(`${turn} picked ${card}`);
        turn = 'player2';
    } else {
        hand = hand2;
        console.log(`${turn} picked ${card}`);
        turn = 'player1';
    }
    hand.push(card);
    console.log(hand);
    playerCardsHtml(hand, card);

    generate4RandomCards();
    if (hand1.length === 5 && hand2.length === 5) {
        picks_array.forEach(element => element.onclick = '');
        const data = pokerHands(hand1, hand2);
        createPokerHtml(data.hands, data.result, data.rankNames, data.handRanks);
        resetDeckOfCards();
    }
}

function pokerHands(hand1, hand2) {
    const [r1, r2] = [rank(hand1), rank(hand2)];

    let result
    if (r1.score > r2.score) result = 'player1 wins (rank)';
    else if (r1.score < r2.score) result = 'player2 wins (rank)';
    else {
        const [val1, val2] = [handvalue(hand1), handvalue(hand2)];
        const count_val1 = val1.map(i => count(val1, i));
        const count_val2 = val2.map(i => count(val2, i));
        const highest1 = val1[count_val1.indexOf(Math.max(...count_val1))];
        const highest2 = val2[count_val2.indexOf(Math.max(...count_val2))];

        if (highest1 > highest2) result = 'player1 wins (high value rank)';
        else if (highest1 < highest2) result = 'player2 wins (high value rank)';
        else {
            for (let i = 0; i < Math.max(...count_val1); i++) {
                val1.splice(val1.indexOf(highest1), 1);
                val2.splice(val2.indexOf(highest2), 1);
            }
            if (arrayCompare(val1, val2) > 0) result = 'player1 wins (highest cards)';
            else if (arrayCompare(val1, val2) < 0) result = 'player2 wins (highest cards)';
            else result = 'draw';
        }
    }
    return {
        'hands': [hand1, hand2],
        'handRanks': [r1.rank, r2.rank],
        'rankNames': [r1.name, r2.name],
        'handScores': [r1.score, r2.score],
        'result': result,
        'info': `[${hand1}] ${r1.score} -- ${r2.score} [${hand2}] -- ${result}`
    }

    /**Returns the rank of a hand in the card game of poker.*/
    function rank(hand) {
        if (Array.from('TJQKA').every(i => hand.map(j => j[0]).includes(i)) && isSameSuit()) {
            return { score: 10, name: 'Royal Flush', rank: '1st' };

        } else if (isConsecutive() && isSameSuit()) {
            return { score: 9, name: 'Straight Flush', rank: '2nd' };

        } else if (nOfaKind(4) > 0) {
            return { score: 8, name: 'Four of a Kind', rank: '3rd' };

        } else if (nOfaKind(3) > 0 && nOfaKind(2)) {
            return { score: 7, name: 'Full House', rank: '4th' };

        } else if (isSameSuit()) {
            return { score: 6, name: 'Flush', rank: '5th' };

        } else if (isConsecutive()) {
            return { score: 5, name: 'Straight', rank: '6th' };

        } else if (nOfaKind(3) > 0) {
            return { score: 4, name: 'Three of a Kind', rank: '7th' };

        } else if (nOfaKind(2) > 1) {
            return { score: 3, name: 'Two Pairs', rank: '8th' };

        } else return nOfaKind(2) > 0 ?
            { score: 2, name: 'One Pair', rank: '9th' } : { score: 1, name: 'High Card', rank: '10th' };

        /**Checks if card values are consecutive */
        function isConsecutive() {
            const d = hand.map(i => card_values.indexOf(i[0]));
            d.sort((a, b) => a - b);
            const a = d.map(i => card_values[i]).join('');
            const b = card_values.join('');
            for (let i = 0; i < b.length - 5; i++) if (a === b.slice(i, i + 5)) return true;
            return false;
        }

        /**Returns number of occurrence of n of a kind. */
        function nOfaKind(n) {
            const kind = {};
            for (let i = 0; i < hand.length; i++) {
                val = hand[i][0];
                if (!Object.keys(kind).includes(val)) {
                    kind[val] = 1;
                } else {
                    kind[val]++;
                }
            }
            return count(Object.values(kind), n);
        }

        /**Checks if cards are same suit. */
        function isSameSuit() {
            const hand_suits = hand.map(i => i[1]);
            const unique = new Set(hand_suits);
            return Array.from(unique).length === 1;
        }
    }

    /**Converts cards in hand to values in descending order. */
    function handvalue(hand) {
        const val = hand.map(card => card[0]);
        const lst = val.map(v => card_values.indexOf(v) + 2);
        return lst.map(i => i).sort((x, y) => y - x);
    }

    /**Returns the number of occurence of an element in an array */
    function count(arr, elem) {
        return arr.filter(i => i === elem).length;
    }

    /**Compare two arrays -- arr1 > arr2*/
    function arrayCompare(arr1, arr2) {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] > arr2[i]) return 1;
            if (arr1[i] < arr2[i]) return -1;
            if (arr1[i] === arr2[i]) continue;
        }
        return 0;
    }
}

function createPokerHtml(hand, result, rName, r) {
    for (let i = 0; i < 2; i++) {  // player
        for (let j = 0; j < 5; j++) {  // card
            const card_div = document.createElement('button');
            document.querySelectorAll('.player>.cards')[i].append(card_div);
            const card = hand[i][j];
            cardHtml(card, card_div);
        }
        document.querySelectorAll('.player p')[i].innerHTML = `${rName[i]} <${r[i]}>`;
    }

    if (result.includes('player1')) {
        p1_span.innerHTML = 'wins';
        p2_span.innerHTML = 'loses';
        p1_span.parentElement.parentElement.className = 'player winner';
        p2_span.parentElement.parentElement.className = 'player loser';
    } else if (result.includes('player2')) {
        p1_span.innerHTML = 'loses';
        p2_span.innerHTML = 'wins';
        p1_span.parentElement.parentElement.className = 'player loser';
        p2_span.parentElement.parentElement.className = 'player winner';
    } else p1_span.innerHTML = p2_span.innerHTML = 'draws';
}
