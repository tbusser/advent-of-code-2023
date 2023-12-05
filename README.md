# ✨🎄 Advent of Code 2023 🎄✨

These are my solutions for the 2023 edition of [Advent of Code](https://adventofcode.com/). I enjoy writing code in TypeScript so that's what did. This repository contains everything you need to run my solutions.

## Setup

The solutions require NodeJS version 19.2.0 to run. In addition you need a couple of packages, these can be installed by running the `npm install` command from the root folder of the project.

## Running the solutions

To run a specific solution you can use the following command:
```bash
npm run start ./src/<day>/part-(1|2).ts
```
For instance to run the solution for day 2, part 1 you need the command:
```bash
npm run start ./src/02/part-1.ts
```

## Puzzle input
Each solution requires the puzzle input. When there is no `input.txt` file in the day folder, the input will be downloaded from the Advent of Code website. Because the input is different per account a session ID cookie is needed. To get your session ID cookie, visit the [Advent of Code website](https://adventofcode.com/) and login. Using the inspector of the browser, find the value of the session cookie. This value needs to be inserted in the `.env` file that you will have to create in the root folder of the project. See the `.env.example` file for what it should look like.

If you want to use input other than the input from the Advent of Code website, you can create the `input.txt` file yourself and fill it with whatever input you want to use for your solution.