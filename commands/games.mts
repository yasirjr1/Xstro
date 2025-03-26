import { registerCommand } from './_registers.mts';

export const guessedNumbers = new Map();
export const retryCounts = new Map();

registerCommand({
  name: 'rng',
  fromMe: false,
  desc: 'Random number guessing game',
  type: 'games',
  function: async (message) => {
    const botChosenNumber = (await import('node:crypto')).randomInt(1, 100);
    guessedNumbers.set(message.jid, botChosenNumber);
    return message.send(
      `_Guess a number between 1 and 100, and you have 3 options before losing the game!_`,
    );
  },
});

export const currentTTTGame = new Map();
export const current2Players = new Map();

registerCommand({
  name: 'ttt',
  fromMe: false,
  desc: 'Start TicTaToe Game',
  type: 'games',
  function: async (message, match: 'start' | 'end') => {
    // TO DO: build starter
  },
});
