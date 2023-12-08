type GroupedHand = Record<number, number>;

type Hand = {
	betValue?: number;
	cards: string;
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
			return 11;
		case 'Q':
			return 12;
		case 'K':
			return 13;
		case 'A':
			return 14;
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

export function isFiveOfAKind(hand: GroupedHand): boolean {
	return Object.values(hand).some(count => count === 5);
}

export function isFourOfAKind(hand: GroupedHand): boolean {
	return Object.values(hand).some(count => count === 4);
}

export function isFullHouse(hand: GroupedHand): boolean {
	return (
		Object.values(hand).some(count => count === 3) &&
		Object.values(hand).some(count => count === 2)
	);
}

export function isThreeOfAKind(hand: GroupedHand): boolean {
	return Object.values(hand).some(count => count === 3);
}

export function isTwoPair(hand: GroupedHand): boolean {
	return Object.values(hand).filter(count => count === 2).length === 2;
}

export function isOnePair(hand: GroupedHand): boolean {
	return (
		Object.values(hand).filter(count => count === 2).length === 1 &&
		Object.values(hand).filter(count => count > 2).length === 0
	);
}

export function scoreHand(hand: GroupedHand): number {
	if (isFiveOfAKind(hand)) {
		return HandScores.FiveOfAKind;
	}
	if (isFourOfAKind(hand)) {
		return HandScores.FourOfAKind;
	}
	if (isFullHouse(hand)) {
		return HandScores.FullHouse;
	}
	if (isThreeOfAKind(hand)) {
		return HandScores.ThreeOfAKind;
	}
	if (isTwoPair(hand)) {
		return HandScores.TwoPair;
	}
	if (isOnePair(hand)) {
		return HandScores.OnePair;
	}

	return HandScores.HighCard;
}

/* ========================================================================== */

export function processHand(hand: string, betValue?: number): Hand {
	const numericCards = hand.split('').map(convertCardToNumber);

	return {
		betValue,
		cards: hand,
		score: scoreHand(groupCards(numericCards)),
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
