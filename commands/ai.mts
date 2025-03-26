import { registerCommand } from './_registers.mts';
import { fetchJson } from '../utilities/index.mts';

registerCommand({
  name: 'ai',
  fromMe: false,
  desc: 'Chat with an Ai',
  type: 'ai',
  function: async (message, match) => {
    const query = message?.quoted?.text ?? match;
    if (!query) return message.send(`_Hello ${message.pushName} how are you today?_`);
    const msg = await message.send(`*Thinking...*`);
    const response = await deepSeek(query);
    if (!response) return message.send(`_Sorry server isssues, unable to provide data_`);
    return await msg.edit(
      response
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim(),
    );
  },
});

async function deepSeek(query: string): Promise<string | undefined> {
  if (!query) return undefined;
  const getDeepSeekResponse = await fetchJson(`https://bk9.fun/ai/deepseek-r1?q=${query}`);
  const jResult = JSON.parse(getDeepSeekResponse);
  return jResult.BK9.content as string;
}
