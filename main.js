startGame();

function startGame() {
    const deck_of_cards = [];
    const card_values = Array.from('23456789TJQKA');
    card_values.forEach(val => Array.from('SHDC').forEach(suit => deck_of_cards.push(val + suit)));

    class Player {
        constructor() {
            this.hand = [];
            /**Picks a random card from deck */
            this.draw_a_card = () => {
                const getRandomInt = (max) => Math.floor(Math.random() * (max + 1));
                const card = deck_of_cards[getRandomInt(deck_of_cards.length - 1)];
                const pos = deck_of_cards.indexOf(card);
                this.hand.push(...deck_of_cards.splice(pos, 1));
            }
            this.drop_all_cards = () => {
                deck_of_cards.push(...this.hand);
                this.hand = [];
            }

            /**Player choose a card. Returns the remaining number of cards in deck.
               Returns -1 if choosen card is not in deck.*/
            this.choose_card = (card) => {
                const pos = deck_of_cards.indexOf(card);
                if (pos !== -1) this.hand.push(...deck_of_cards.splice(pos, 1));
            }
        }
    }

    const p1 = new Player();
    const p2 = new Player();
    const market = createCards(4, document.querySelectorAll('.cards')[2]);

    let turn = 'Player 1';
    document.getElementById('p1').innerHTML = '(active)';
    let random_cards = generate_random_cards(4);
    for (let i = 0; i < 4; i++) market[i].addEventListener('click', () => pick_card(i));

    document.querySelector('.button>button').addEventListener('click', restartGame);
    return;

    function pick_card(card_index) {
        const delay = 300;
        if (p1.hand.length < 5 || p2.hand.length < 5) {
            const card = random_cards[card_index];
            if (turn === 'Player 1') {
                p1.choose_card(card);
                const p_html = createCards(1, document.querySelectorAll('.cards')[0]);
                cardHtml(card, p_html[0]);
                turn = 'Player 2';
                setTimeout(() => {
                    document.getElementById('p1').innerHTML = '';
                    document.getElementById('p2').innerHTML = '(active)';
                }, delay);

            } else {
                p2.choose_card(card);
                const p_html = createCards(1, document.querySelectorAll('.cards')[1]);
                cardHtml(card, p_html[0]);
                turn = 'Player 1';
                setTimeout(() => {
                    document.getElementById('p1').innerHTML = '(active)';
                    document.getElementById('p2').innerHTML = '';
                }, delay);
            }
            document.querySelectorAll('.pick>button').forEach(button => button.disabled = true);
            setTimeout(() => {
                document.querySelectorAll('.pick>button').forEach(button => button.disabled = false);
                random_cards = generate_random_cards(4);
            }, delay);
        }

        if (p2.hand.length === 5) {
            document.querySelectorAll('.pick>*').forEach(element => element.remove());
            pokerHands(p1.hand, p2.hand);
        }
        return;

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
            createPokerHtml(result, [r1.name, r2.name]);
            return;

            /**Returns the rank of a hand in the card game of poker.*/
            function rank(hand) {
                if (Array.from('TJQKA').every(i => hand.map(j => j[0]).includes(i)) && isSameSuit()) {
                    return { score: 10, name: 'Royal Flush' };

                } else if (isConsecutive() && isSameSuit()) {
                    return { score: 9, name: 'Straight Flush' };

                } else if (nOfaKind(4) > 0) {
                    return { score: 8, name: 'Four of a Kind' };

                } else if (nOfaKind(3) > 0 && nOfaKind(2)) {
                    return { score: 7, name: 'Full House' };

                } else if (isSameSuit()) {
                    return { score: 6, name: 'Flush' };

                } else if (isConsecutive()) {
                    return { score: 5, name: 'Straight' };

                } else if (nOfaKind(3) > 0) {
                    return { score: 4, name: 'Three of a Kind' };

                } else if (nOfaKind(2) > 1) {
                    return { score: 3, name: 'Two Pairs' };

                } else return nOfaKind(2) > 0 ?
                    { score: 2, name: 'One Pair' } : { score: 1, name: 'High Card' };

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

            function createPokerHtml(result, rName) {
                const [p1_span, p2_span] = document.querySelectorAll('.player span');
                for (let i = 0; i < 2; i++) {
                    document.querySelectorAll('.player p')[i].innerHTML = rName[i];
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
                document.querySelectorAll('.player>p').forEach(p => p.style.display = 'block');
                return;
            }
        }
    }

    /**Generate n random cards from deck */
    function generate_random_cards(n) {
        const table = new Player();
        for (let i = 0; i < n; i++) table.draw_a_card();
        const random_cards = table.hand;
        table.drop_all_cards();
        for (let i = 0; i < 4; i++) {
            const class_name = cardHtml(random_cards[i], market[i]);
            flipCard(market[i], random_cards[i], 'back card')
            market[i].onclick = () => flipCard(market[i], random_cards[i], class_name);
        }
        return random_cards;

        function flipCard(card_div, card, class_name) {
            if (card_div.innerHTML.codePointAt() === 127136) {
                card_div.innerHTML = getCardUnicode(card);
                card_div.className = class_name;
            } else {
                card_div.innerHTML = '&#127136;';
                card_div.className = 'back card';
            }
            return;
        }
    }

    /**Creates a list of HTMLButtonElements of length k and append to parentElement. */
    function createCards(k, parentElement) {
        const card_array = [];
        for (let j = 0; j < k; j++) {
            const card_div = document.createElement('button');
            parentElement.append(card_div);
            card_array.push(card_div);
            card_div.className = 'card';
        }
        return card_array;
    }

    /**Use card string to customise html element */
    function cardHtml(card, element) {
        element.innerHTML = getCardUnicode(card);
        if (card.includes('D') || card.includes('H')) {
            const class_name = 'red card';
            element.className = class_name;
            return class_name
        } else {
            const class_name = 'black card';
            element.className = class_name;
            return class_name
        }
    }

    function getCardUnicode(card) {
        const card_unicodes = {};
        let jj = 0;
        for (let j = 10; j <= 13; j++) {
            let ii = 0;
            for (let i = 1; i <= 14; i++) {
                if (i === 12) continue;
                const c = 'A23456789TJQK'[ii] + 'SHDC'[jj];
                const hex = `1f0${j.toString(16)}${i.toString(16)}`;
                card_unicodes[c] = `&#${parseInt(hex, 16)};`;
                ii++;
            }
            jj++;
        }
        return card_unicodes[card];
    }
}

function restartGame() {
    document.querySelectorAll('.card').forEach(elem => elem.remove());
    document.querySelectorAll('.game-area>div').forEach(div => div.className = 'player');
    document.querySelectorAll('.player>p').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.player span').forEach(span => span.innerHTML = '');
    startGame();
    return;
}
