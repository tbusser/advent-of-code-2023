type GroupedHand = Record<number, number>;

type Hand = {
	betValue?: number;
	cards: string;
	jokers: number;
	score: number;
	cardValues: number[];
};

/* ========================================================================== */

export enum HandScores {
	FiveOfAKind = 120,
	FourOfAKind = 100,
	FullHouse = 80,
	ThreeOfAKind = 60,
	TwoPair = 40,
	OnePair = 20,
	HighCard = 0
}

/* ========================================================================== */

export function convertCardToNumber(card: string): number {
	switch (card) {
		case 'T':
			return 10;
		case 'J':
			return 0;
		case 'Q':
			return 11;
		case 'K':
			return 12;
		case 'A':
			return 13;
		default:
			return Number(card);
	}
}

export function groupCards(numericCards: number[]): GroupedHand {
	const groups: GroupedHand = {};

	for (const card of numericCards) {
		groups[card] = (groups[card] || 0) + 1;
	}

	return groups;
}

export function isFiveOfAKind(hand: GroupedHand, jokers: number): boolean {
	return Object.values(hand).some(count => count + jokers === 5) || jokers === 5;
}

export function isFourOfAKind(hand: GroupedHand, jokers: number): boolean {
	return Object.values(hand).some(count => count + jokers === 4) || jokers === 4;
}

export function isFullHouse(hand: GroupedHand, jokers: number): boolean {
	const values = Object.values(hand).sort();
	const count = (values.at(-2) ?? 0) + (values.at(-1) ?? 0) + jokers;

	return count >= 5;
}

export function isThreeOfAKind(hand: GroupedHand, jokers: number): boolean {
	return Object.values(hand).some(count => count + jokers === 3) || jokers === 3;
}

export function isTwoPair(hand: GroupedHand, jokers: number): boolean {
	const values = Object.values(hand).sort();
	const count = (values.at(-2) ?? 0) + (values.at(-1) ?? 0) + jokers;

	return count >= 4;
}

export function isOnePair(hand: GroupedHand, jokers: number): boolean {
	return (
		Object.values(hand).find(count => count + jokers === 2 || count === 2) !==
			undefined || jokers === 2
	);
}

export function scoreHand(hand: GroupedHand, jokers: number): number {
	if (isFiveOfAKind(hand, jokers)) {
		return HandScores.FiveOfAKind;
	}
	if (isFourOfAKind(hand, jokers)) {
		return HandScores.FourOfAKind;
	}
	if (isFullHouse(hand, jokers)) {
		return HandScores.FullHouse;
	}
	if (isThreeOfAKind(hand, jokers)) {
		return HandScores.ThreeOfAKind;
	}
	if (isTwoPair(hand, jokers)) {
		return HandScores.TwoPair;
	}
	if (isOnePair(hand, jokers)) {
		return HandScores.OnePair;
	}

	return HandScores.HighCard;
}

/* ========================================================================== */

export function processHand(hand: string, betValue?: number): Hand {
	const numericCards = hand.split('').map(convertCardToNumber);
	const jokers = numericCards.filter(card => card === 0).length;

	return {
		betValue,
		cards: hand,
		jokers,
		score: scoreHand(groupCards(numericCards.filter(card => card !== 0)), jokers),
		cardValues: numericCards
	};
}

export function sortHands(hands: Hand[]) {
	hands.sort((a, b) => {
		if (a.score > b.score) {
			return 1;
		}
		if (a.score < b.score) {
			return -1;
		}

		for (let index = 0; index < a.cardValues.length; index++) {
			if (a.cardValues[index] !== b.cardValues[index]) {
				return a.cardValues[index] > b.cardValues[index] ? 1 : -1;
			}
		}

		return 0;
	});
}
