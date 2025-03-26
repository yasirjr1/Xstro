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
  desc: 'Start TicTacToe Game',
  type: 'games',
  function: async (message) => {
    if (currentTTTGame.has(message.jid)) {
      await message.send('Game already in progress!');
      return;
    }
    const initialBoard = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9']
    ];
    currentTTTGame.set(message.jid, initialBoard);
    current2Players.set(message.jid, [message.sender, null]);
    await message.send(
      `*Game started!*\n\n_Player 1 (X): @${message.sender?.split('@')[0]}_\nWaiting for Player 2. Type "join" to join.\n\n${renderBoard(initialBoard)}`,
      { mentions: [message.sender!] }
    );
  },
});

export function renderBoard(board) {
  return board.map((row) => '| ' + row.join(' | ') + ' |').join('\n');
}

export function checkWin(board, player) {
  for (let i = 0; i < 3; i++) {
    if (board[i].every((cell) => cell === player) || board.every((row) => row[i] === player))
      return true;
  }
  if ([board[0][0], board[1][1], board[2][2]].every((cell) => cell === player)) return true;
  if ([board[0][2], board[1][1], board[2][0]].every((cell) => cell === player)) return true;
  return false;
}
