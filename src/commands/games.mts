import { registerCommand } from '../index.mts';

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
