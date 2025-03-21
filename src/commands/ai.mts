import { deepSeek, registerCommand } from '../index.mts';

registerCommand({
  name: 'deepseek',
  fromMe: false,
  desc: "Chat with China's own Deepseek Ai Model",
  type: 'ai',
  function: async (message, match) => {
    const query = message?.quoted?.text ?? match;
    if (!query) return message.send(`_Hello ${message.pushName} how are you today?_`);
    const ai_response = await deepSeek(query);
    if (!ai_response) return message.send("_Something isn't right, please try again!_");
    return await message.send(ai_response.trim());
  },
});
