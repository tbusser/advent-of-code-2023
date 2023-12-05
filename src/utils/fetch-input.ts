import { sessionId } from './get-session-id.js';
import fs from 'fs';
import path from 'path';

/* ========================================================================== */

const defaultError =
	'Puzzle inputs differ by user.  Please log in to get your puzzle input.';
const fileName = 'input.txt';

/* ========================================================================== */

async function fetchInput(url: string): Promise<string> {
	const data = await fetch(url, {
		headers: {
			cookie: `session=${sessionId}`
		}
	});

	return await (await data.text()).trimEnd();
}

function getInputPathForDay(day: number): string {
	const formattedDay = day.toString().padStart(2, '0');
	const pathName = path.join('src', formattedDay, fileName);

	return path.relative(process.cwd(), pathName);
}

function hasInputFile(fileName: string): boolean {
	return fs.existsSync(fileName);
}

/* ========================================================================== */

export async function fetchInputForDay(day: number): Promise<string> {
	const fileName = getInputPathForDay(day);
	const fileExists = hasInputFile(fileName);

	const text = fileExists
		? fs.readFileSync(getInputPathForDay(day), 'utf-8')
		: await fetchInput(`https://adventofcode.com/2023/day/${day}/input`);

	if (text === defaultError) {
		throw new Error('Please set the session ID in the .env file.');
	}

	if (!fileExists) {
		fs.writeFileSync(fileName, text);
	}

	return text;
}
