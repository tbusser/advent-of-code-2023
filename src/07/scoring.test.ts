import {
	convertCardToNumber,
	groupCards,
	HandScores,
	isFiveOfAKind,
	isFourOfAKind,
	isFullHouse,
	isOnePair,
	isThreeOfAKind,
	isTwoPair,
	processHand,
	scoreHand,
	sortHands
} from './scoring.ts';

/* ========================================================================== */

describe('scoring', () => {
	describe('convertCardToNumber()', () => {
		it('should return the correct numeric value for a card', () => {
			const cards = [
				'1',
				'2',
				'3',
				'4',
				'5',
				'6',
				'7',
				'8',
				'9',
				'T',
				'J',
				'Q',
				'K',
				'A'
			];
			cards.forEach((card, index) =>
				expect(convertCardToNumber(card)).toBe(index + 1)
			);
		});
	});

	describe('groupCards()', () => {
		test('it should groups cards with the same value', () => {
			expect(groupCards([1, 2, 3, 4, 5])).toEqual({
				1: 1,
				2: 1,
				3: 1,
				4: 1,
				5: 1
			});
			expect(groupCards([1, 2, 1, 4, 5])).toEqual({ 1: 2, 2: 1, 4: 1, 5: 1 });
			expect(groupCards([1, 2, 1, 1, 5])).toEqual({ 1: 3, 2: 1, 5: 1 });
			expect(groupCards([1, 2, 1, 1, 1])).toEqual({ 1: 4, 2: 1 });
			expect(groupCards([10, 11, 10, 8, 6])).toEqual({ 10: 2, 11: 1, 8: 1, 6: 1 });
		});
	});

	describe('isFiveOfAKind()', () => {
		test('it should return true when the hand has 5 cards of equal value', () => {
			for (let index = 1; index < 15; index++) {
				expect(isFiveOfAKind(groupCards(Array(5).fill(index)))).toBe(true);
			}
		});
		test('it should return false when the hand does not have 4 cards of equal value', () => {
			expect(isFiveOfAKind(groupCards([1, 1, 1, 1, 2]))).toBe(false);
			expect(isFiveOfAKind(groupCards([1, 1, 1, 2, 2]))).toBe(false);
			expect(isFiveOfAKind(groupCards([1, 1, 2, 2, 2]))).toBe(false);
			expect(isFiveOfAKind(groupCards([1, 2, 2, 2, 2]))).toBe(false);
		});
	});

	describe('isFourOfAKind()', () => {
		test('it should return true when the hand has 5 cards of equal value', () => {
			expect(isFourOfAKind(groupCards([2, 1, 1, 1, 1]))).toBe(true);
			expect(isFourOfAKind(groupCards([1, 2, 1, 1, 1]))).toBe(true);
			expect(isFourOfAKind(groupCards([1, 1, 2, 1, 1]))).toBe(true);
			expect(isFourOfAKind(groupCards([1, 1, 1, 2, 1]))).toBe(true);
			expect(isFourOfAKind(groupCards([1, 1, 1, 1, 2]))).toBe(true);
		});
		test('it should return false when the hand does not have 4 cards of equal value', () => {
			expect(isFourOfAKind(groupCards([1, 1, 1, 1, 1]))).toBe(false);
			expect(isFourOfAKind(groupCards([1, 1, 1, 2, 3]))).toBe(false);
			expect(isFourOfAKind(groupCards([1, 1, 2, 3, 4]))).toBe(false);
			expect(isFourOfAKind(groupCards([1, 2, 3, 4, 5]))).toBe(false);
		});
	});

	describe('isFullHouse()', () => {
		test('it should return true when the hand has 3 and 2 cards of equal value', () => {
			expect(isFullHouse(groupCards([1, 1, 1, 2, 2]))).toBe(true);
			expect(isFullHouse(groupCards([1, 2, 1, 1, 2]))).toBe(true);
			expect(isFullHouse(groupCards([2, 1, 1, 2, 1]))).toBe(true);
		});
		test('it should return false when the hand does not have 3 and 2 cards of equal value', () => {
			expect(isFullHouse(groupCards([1, 1, 1, 1, 1]))).toBe(false);
			expect(isFullHouse(groupCards([1, 1, 1, 1, 3]))).toBe(false);
			expect(isFullHouse(groupCards([1, 1, 1, 3, 4]))).toBe(false);
			expect(isFullHouse(groupCards([1, 1, 3, 4, 5]))).toBe(false);
			expect(isFullHouse(groupCards([1, 1, 3, 3, 5]))).toBe(false);
			expect(isFullHouse(groupCards([1, 2, 3, 4, 5]))).toBe(false);
		});
	});

	describe('isOnePair()', () => {
		test('it should return true when the hand has 2 cards of equal value', () => {
			expect(isOnePair(groupCards([1, 1, 2, 3, 4]))).toBe(true);
			expect(isOnePair(groupCards([1, 2, 1, 3, 4]))).toBe(true);
			expect(isOnePair(groupCards([2, 1, 1, 3, 4]))).toBe(true);
		});
		test('it should return false when the hand does not have 2 cards of equal value', () => {
			expect(isOnePair(groupCards([1, 1, 1, 2, 2]))).toBe(false);
			expect(isOnePair(groupCards([1, 1, 2, 2, 3]))).toBe(false);
			expect(isOnePair(groupCards([1, 1, 1, 1, 4]))).toBe(false);
			expect(isOnePair(groupCards([1, 1, 1, 1, 1]))).toBe(false);
			expect(isOnePair(groupCards([1, 2, 3, 4, 5]))).toBe(false);
		});
	});

	describe('isThreeOfAKind()', () => {
		test('it should return true when the hand has 3 cards of equal value', () => {
			expect(isThreeOfAKind(groupCards([2, 2, 1, 1, 1]))).toBe(true);
			expect(isThreeOfAKind(groupCards([1, 2, 2, 1, 1]))).toBe(true);
			expect(isThreeOfAKind(groupCards([1, 1, 2, 2, 1]))).toBe(true);
			expect(isThreeOfAKind(groupCards([1, 1, 1, 2, 2]))).toBe(true);
		});
		test('it should return false when the hand does not have 3 cards of equal value', () => {
			expect(isThreeOfAKind(groupCards([1, 1, 1, 1, 1]))).toBe(false);
			expect(isThreeOfAKind(groupCards([1, 1, 1, 1, 3]))).toBe(false);
			expect(isThreeOfAKind(groupCards([1, 1, 2, 3, 4]))).toBe(false);
			expect(isThreeOfAKind(groupCards([1, 2, 3, 4, 5]))).toBe(false);
		});
	});

	describe('isTwoPair()', () => {
		test('it should return true when the hand has 2 sets of 2 cards of equal value', () => {
			expect(isTwoPair(groupCards([1, 1, 2, 2, 3]))).toBe(true);
			expect(isTwoPair(groupCards([1, 1, 10, 2, 2]))).toBe(true);
			expect(isTwoPair(groupCards([2, 1, 1, 3, 3]))).toBe(true);
		});
		test('it should return false when the hand does not have 2 sets of 2 cards of equal value', () => {
			expect(isTwoPair(groupCards([1, 1, 1, 2, 2]))).toBe(false);
			expect(isTwoPair(groupCards([1, 1, 2, 3, 4]))).toBe(false);
			expect(isTwoPair(groupCards([1, 1, 1, 1, 4]))).toBe(false);
			expect(isTwoPair(groupCards([1, 1, 1, 1, 1]))).toBe(false);
			expect(isTwoPair(groupCards([1, 2, 3, 4, 5]))).toBe(false);
		});
	});

	describe('scoreHand()', () => {
		test('it should return the proper score for a hand', () => {
			expect(scoreHand(groupCards([1, 1, 1, 1, 1]))).toBe(HandScores.FiveOfAKind);
			expect(scoreHand(groupCards([1, 1, 1, 1, 2]))).toBe(HandScores.FourOfAKind);
			expect(scoreHand(groupCards([1, 1, 1, 2, 2]))).toBe(HandScores.FullHouse);
			expect(scoreHand(groupCards([1, 1, 1, 2, 3]))).toBe(HandScores.ThreeOfAKind);
			expect(scoreHand(groupCards([1, 1, 2, 2, 3]))).toBe(HandScores.TwoPair);
			expect(scoreHand(groupCards([2, 10, 10, 14, 14]))).toBe(HandScores.TwoPair);
			expect(scoreHand(groupCards([1, 1, 2, 3, 4]))).toBe(HandScores.OnePair);
			expect(scoreHand(groupCards([1, 5, 2, 3, 4]))).toBe(HandScores.HighCard);
		});
	});

	describe('sortHands()', () => {
		test('it should return the hands sorted by score, low to high', () => {
			const handOne = processHand('11223');
			const handTwo = processHand('11111');
			const handThree = processHand('A1234');
			const handFour = processHand('12349');
			const handFive = processHand('13456');
			const hands = [handOne, handTwo, handThree, handFour, handFive];
			const expectedOrder = [handFour, handFive, handThree, handOne, handTwo];

			sortHands(hands);

			for (let index = 0; index < hands.length; index++) {
				expect(hands[index]).toBe(expectedOrder[index]);
			}
		});
		test('it should return hands with an equal score ordered by card values', () => {
			const handOne = processHand('7AA22');
			const handTwo = processHand('2TTAA');
			const handThree = processHand('72211');
			const hands = [handOne, handTwo, handThree];
			const expectedOrder = [handTwo, handThree, handOne];

			sortHands(hands);

			for (let index = 0; index < hands.length; index++) {
				expect(hands[index]).toBe(expectedOrder[index]);
			}
		});
	});
});
