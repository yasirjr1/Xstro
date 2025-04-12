import { Command } from '../messaging/plugins.ts';
import { getLastMessagesFromChat } from '../models/store.ts';

Command({
 name: 'msgs',
 fromMe: false,
 isGroup: true,
 desc: 'Get latest messages from this Group',
 type: 'chats',
 function: async (message) => {
  const messages = await getLastMessagesFromChat(message.jid);
  if (!messages) return message.send('No messages saved from this Group!');

  const msgs = messages.reduce(
   (acc, msg) => {
    const participant = msg.participant || (msg.key.participant as string);
    acc[participant] = (acc[participant] || []).concat(msg);
    return acc;
   },
   {} as Record<string, typeof messages>,
  );

  const sorted = Object.entries(msgs)
   .sort(([, a], [, b]) => b.length - a.length)
   .map(([participant, msgs]) => ({
    participant,
    msgsCount: msgs.length,
   }));

  return await message.send(
   `*Group Messages:*\n${sorted
    .map(
     ({ participant, msgsCount }) =>
      `@${participant.split('@')[0]}: ${msgsCount}`,
    )
    .join('\n')}`,
   {
    mentions: sorted.map(({ participant }) => participant),
   },
  );
 },
});
