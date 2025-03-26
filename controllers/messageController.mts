import {
  getAntiword,
  getAntidelete,
  getAntilink,
  getConfig,
  saveContact,
  saveMessages,
} from '../databases/index.mts';
import { commands } from '../commands/_registers.mts';
import { serialize } from './serializeMessageController.mts';
import { lang, isUrl } from '../utilities/index.mts';
import { isJidUser, type BaileysEventMap, type WAMessage, type WASocket } from 'baileys';
import type { XMessage } from '../Types/XMessage.mts';

export class MessagesUpsert {
  constructor(client: WASocket, upserts: BaileysEventMap['messages.upsert']) {
    this.client = client;
    this.handleUpsert(upserts);
  }

  private client: WASocket;

  async handleUpsert(event: BaileysEventMap['messages.upsert']): Promise<void> {
    if (!event) return;

    const { messages, type, requestId } = event;
    saveMessages({ messages, type, requestId });

    if (type !== 'notify') return;

    await Promise.all(
      messages.map(async (msg) => {
        const message = await serialize(this.client, msg);
        const db = await getConfig();
        if (db.autoRead) await message.readMessages([message.key]);
        await Promise.all([
          this.executeCommand(message),
          this.evaluator(message),
          this.Antilink(message),
          this.Antiword(message),
          this.saveContacts(message),
          this.AntiDelete(message),
          this.AutoStatusSave(message),
          this.guessingGame(message),
          this.TicTaToe(message),
        ]);
      }),
    );
  }
  /**
   * This handles excution of the bot's commands and automatically handles errors fast, effeicently, and it was made to be simple.
   */
  public async executeCommand(message: XMessage): Promise<void | WAMessage> {
    if (!message.text) return;

    for (const cmd of commands) {
      const handler = message.prefix.find((p) => message.text?.startsWith(p));
      const match = message.text.slice(handler?.length || 0).match(cmd.name);
      const db = await getConfig();

      if (!handler || !match) continue;

      try {
        if (!message.sudo && (message.mode || cmd.fromMe)) return;

        if (cmd.isGroup && !message.isGroup) return message.send(lang.groups_only);

        if (db.banned.includes(message.sender!)) return message.send(lang.ban_msg);

        if (db.disabledCmds.includes(cmd.name.toString().toLowerCase().split(/\W+/)[2]))
          return message.send(lang.disablecmd);

        if (db.disabledm && isJidUser(message.jid) && message.jid !== message.owner) return;

        if (
          message.isGroup &&
          db.disablegc &&
          cmd.name.toString().toLowerCase().split(/\W+/)[2] !== 'enablegc'
        )
          return;

        if (db.cmdReact) await message.react('⏳');

        if (db.cmdRead) await message.readMessages([message.key]);

        await cmd.function!(message, match[2] ?? '');

        if (db.cmdReact) return await message.react('✅');
      } catch (err) {
        if (db.cmdReact) await message.react('❌');
        throw new Error(err);
      }
    }
  }

  private async evaluator(message: XMessage): Promise<void> {
    if (!message.text?.startsWith('$ ')) return;

    try {
      const result = await eval(`(async () => { ${message.text.slice(2).trim()} })()`);
      const util = await import('util');
      await message.send(util.inspect(result, { depth: 5 }));
    } catch (error) {
      await message.send('Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  private async Antilink(message: XMessage): Promise<void> {
    if (!message.isGroup || !message.text || message.sudo || (await message.isAdmin())) return;

    const settings = await getAntilink(message.jid);
    if (!settings?.status || !isUrl(message.text) || !(await message.isBotAdmin())) return;

    await message.sendMessage(message.jid, { delete: message.key });
    const mentionText = `@${message.sender!.split('@')[0]}`;

    if (settings.mode === 'kick') {
      await message.groupParticipantsUpdate(message.jid, [message.sender!], 'remove');
      await message.sendMessage(message.jid, {
        text: `${mentionText} has been kicked for sending links!`,
        mentions: [message.sender!],
      });
    } else if (settings.mode === 'delete') {
      await message.sendMessage(message.jid, {
        text: `${mentionText} links are not allowed here!`,
        mentions: [message.sender!],
      });
    }
  }

  private async Antiword(message: XMessage): Promise<void> {
    if (!message.isGroup || !message.text || message.sudo || (await message.isAdmin())) return;

    const settings = await getAntiword(message.jid);
    if (!settings?.status) return;

    const text = message.text.toLowerCase();
    if (settings.words.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(text))) {
      await message.sendMessage(message.jid, { delete: message.key });
      await message.sendMessage(message.jid, {
        text: `@${message.sender!.split('@')[0]} those words are not allowed here!`,
        mentions: [message.sender!],
      });
    }
  }
  /**
   * Automatically Saves contacts from any message if received from a personl, group, or status message, for further processing.
   */
  private async saveContacts(message: XMessage): Promise<void> {
    const bio_details = await message.fetchStatus(message.sender!).catch(() => null);
    const Info = (bio_details as unknown as { status: { status: string; setAt: string } }[])?.[0];
    const bio_text = Info?.status?.status ?? null;
    saveContact({
      jid: message.sender!,
      pushName: message.pushName,
      verifiedName: message.verifiedBizName,
      lid: null,
      bio: bio_text,
    });
  }
  /**
   * Recovers deleted messages from Group chats, personal message and even status post, this will also support newsletter in the future, maybe.
   */
  private async AntiDelete(message: XMessage): Promise<void> {
    /** For handling group */
    if (message.isGroup && !(await getAntidelete(message.jid))) return;
    /** For handling any other chats that is not a group */
    if (!message.isGroup && !(await getAntidelete())) return;

    const protocolMessage = message?.message?.protocolMessage;
    if (!protocolMessage) return;

    if (protocolMessage.type === 0) {
      const messageKey = protocolMessage.key;
      if (!messageKey?.id) return;
      const msg = await message.loadMessage(messageKey.id);

      await message.forward(message.isGroup ? message.jid : message.owner, msg!, { quoted: msg! });
    }
  }
  private async AutoStatusSave(message: XMessage): Promise<WAMessage | undefined> {
    if (
      !message.broadcast ||
      !(await getConfig()).savebroadcast ||
      message.sender === message.owner
    )
      return;
    return await message.forward(message.owner, message, { quoted: message });
  }
  public async guessingGame(message: XMessage): Promise<void | XMessage> {
    if (!message.text) return;
    const botChosenNumber = (await import('../commands/games.mts')).guessedNumbers.get(message.jid);
    if (botChosenNumber === undefined) return;
    if (isNaN(Number(message.text))) return;
    const userGuess = parseInt(message.text?.trim(), 10);
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
      return message.send('_Guess a valid number between 1 and 100!_');
    }
    let retries = (await import('../commands/games.mts')).retryCounts.get(message.jid) || 0;
    retries++;
    (await import('../commands/games.mts')).retryCounts.set(message.jid, retries);
    if (userGuess === botChosenNumber) {
      (await import('../commands/games.mts')).guessedNumbers.delete(message.jid);
      (await import('../commands/games.mts')).retryCounts.delete(message.jid);
      return message.send('_Correct! You guessed the number! 🎉_');
    }
    if (retries >= 3) {
      (await import('../commands/games.mts')).guessedNumbers.delete(message.jid);
      (await import('../commands/games.mts')).retryCounts.delete(message.jid);
      return message.send(
        `_Game Over! You've used all 3 attempts. The correct number was ${botChosenNumber}._`,
      );
    }
    let hint = '';
    if (userGuess < botChosenNumber) {
      hint = 'Too low!';
      if (botChosenNumber - userGuess > 50) hint += ' (Way too low)';
      else if (botChosenNumber - userGuess > 20) hint += ' (Quite low)';
      else hint += ' (A bit low)';
    } else {
      hint = 'Too high!';
      if (userGuess - botChosenNumber > 50) hint += ' (Way too high)';
      else if (userGuess - botChosenNumber > 20) hint += ' (Quite high)';
      else hint += ' (A bit high)';
    }
    return message.send(`_${hint} Try again. Attempts left: ${3 - retries}_`);
  }
  public async TicTaToe(message: XMessage): Promise<void | XMessage> {
    const { currentTTTGame, current2Players, renderBoard, checkWin } = await import(
      '../commands/games.mts'
    );
    if (!message.text) return;
    message.text = message.text.toLowerCase().trim();

    if (!currentTTTGame.has(message.jid) || !current2Players.has(message.jid)) return;

    const board = currentTTTGame.get(message.jid);
    const players = current2Players.get(message.jid);
    const currentPlayer =
      players[0] === message.sender ? 'X' : players[1] === message.sender ? 'O' : null;

    if (!currentPlayer && message.text !== 'join') return;

    if (message.text === 'join' && !players[1] && message.sender !== players[0]) {
      players[1] = message.sender;
      current2Players.set(message.jid, players);
      return await message.send(
        `*_Player 2 (O): @${message.sender?.split('@')[0]} joined!_*\n_Game starts now. Player 1 (X) goes first._\n\n${renderBoard(board)}`,
        { mentions: [message.sender!] },
      );
    }

    if (!players[1]) return await message.send('_Waiting for Player 2 to join. Type "join"._');

    const move = parseInt(message.text);
    if (isNaN(move) || move < 1 || move > 9) {
      await message.send('_Invalid move! Use a number 1-9._');
      return;
    }

    const row = Math.floor((move - 1) / 3);
    const col = (move - 1) % 3;
    if (board[row][col] === 'X' || board[row][col] === 'O') {
      return await message.send('_Spot already taken! Pick another number._');
    }

    board[row][col] = currentPlayer;
    currentTTTGame.set(message.jid, board);

    if (checkWin(board, currentPlayer)) {
      await message.send(`*_Player ${currentPlayer} wins!_*\n${renderBoard(board)}`);
      currentTTTGame.delete(message.jid);
      current2Players.delete(message.jid);
      return;
    }

    if (board.every((row) => row.every((cell) => cell === 'X' || cell === 'O'))) {
      await message.send(`*_It’s a draw!\n${renderBoard(board)}_*`);
      currentTTTGame.delete(message.jid);
      current2Players.delete(message.jid);
      return;
    }

    await message.send(`*_Player ${currentPlayer} just made a move_*\n\n${renderBoard(board)}`);
  }
}
