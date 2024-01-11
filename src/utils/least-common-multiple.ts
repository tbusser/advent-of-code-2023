/**
 * Method to find the prime factors of a number. This method was copied from
 * this StackOverflow answer: https://stackoverflow.com/a/39899363/1244780
 */
function getPrimeFactors(integer: number): number[] {
	const primeArray: number[] = [];

	// Find divisors starting with 2
	for (let i = 2; i <= integer; i++) {
		if (integer % i !== 0) {
			continue;
		}

		let isPrime: boolean;
		// Check if the divisor is a prime number
		for (let j = 2; j <= i / 2; j++) {
			isPrime = i % j !== 0;
		}

		if (!isPrime) {
			continue;
		}
		// if the divisor is prime, divide integer with the number and store it in the array
		integer /= i;
		primeArray.push(i);
	}

	return primeArray;
}

function groupNumbers(numbers: number[]): { [key: string]: number } {
	return numbers.reduce((result, number) => {
		result[number] = (result[number] ?? 0) + 1;

		return result;
	}, {});
}

/* ========================================================================== */

export function calculateLeastCommonMultiple(numbers: number[]): number {
	// 1: Calculate for each input number what its prime factors are.
	const primeFactorsPerNumber = numbers.map(getPrimeFactors);

	// 2: For each input number we have to group its prime factors so we know
	//    how many times a prime number occurs in the prime factors for that
	//    input number. The result is an object where the key is the prime
	//    number and the value is is how many times that prime number occurs in
	//    the prime factors. The value will be used as the power of that
	//    prime number.
	const groupedPrimeNumbersPerNumber = primeFactorsPerNumber.map(groupNumbers);

	// 3: We need to merge the prime numbers of all input number into a single
	//    object where each prime number exists only once and the power of that
	//    prime number is the highest power of that prime number of all input
	//    numbers.
	//    E.g.: inout number one has 2 twice in its prime factors and input
	//          number two has 2 once in its prime factors, we only keep the 2
	//          with 2 as its power.
	const highestPowerPrimeNumbers = groupedPrimeNumbersPerNumber.reduce(
		(result, primeNumbers) => {
			// Iterate over all the prime numbers for this ghost.
			Object.keys(primeNumbers).forEach(number => {
				const power = primeNumbers[number];
				// Only save its power when it is more than the current power.
				result[number] = Math.max(result[number] ?? 0, power);
			});

			return result;
		},
		{}
	);

	// 4: Now that we have determined the highest power of each prime number we
	//    can calculate the least common multiple. For this we have to take each
	//    prime number to its highest power and multiply them all together.
	const leastCommonMultiple = Object.keys(highestPowerPrimeNumbers).reduce(
		(result, number) => {
			const power = highestPowerPrimeNumbers[number];

			return result * Math.pow(Number(number), power);
		},
		1
	);

	return leastCommonMultiple;
}
