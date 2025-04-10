import { Command } from '../core/index.ts';
import { getLastMessagesFromChat } from '../models/index.ts';

Command({
  name: 'msgs',
  fromMe: false,
  isGroup: true,
  desc: 'Get latest messages from this Group',
  type: 'chats',
  function: async (message, match) => {
    const messages = await getLastMessagesFromChat(message.jid);
    if (!messages) return message.send('No messages saved from this Group!');
    const participantMessages = messages.reduce(
      (acc, msg) => {
        const participant = msg.participant || (msg.key.participant as string);
        if (!acc[participant]) {
          acc[participant] = [];
        }
        acc[participant].push(msg);
        return acc;
      },
      {} as Record<string, typeof messages>,
    );

    const sortedParticipants = Object.entries(participantMessages)
      .sort((a, b) => b[1]!.length - a[1]!.length)
      .map(([participant, msgs]) => `@${participant.split('@')[0]}: ${msgs!.length} messages`)
      .join('\n');

    return await message.send(sortedParticipants);
  },
});
