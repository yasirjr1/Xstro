import { AIResponse, registerCommand } from '../index.mts';

registerCommand({
  name: 'deepseek',
  fromMe: false,
  desc: "Chat with China's own Deepseek Ai Model",
  type: 'ai',
  function: async (message, match) => {
    const query = message?.quoted?.text ?? match;
    if (!query) return message.send(`_Hello ${message.pushName} how are you today?_`);
    return await message.send(await AIResponse(query, 'deepseek-ai/DeepSeek-V3'));
  },
});

registerCommand({
  name: 'qwen',
  fromMe: false,
  desc: 'Chat with Qwen/QwQ-32B Ai Model',
  type: 'ai',
  function: async (message, match) => {
    const query = message?.quoted?.text ?? match;
    if (!query) return message.send(`_Hello ${message.pushName} how are you today?_`);
    return await message.send(await AIResponse(query, 'Qwen/QwQ-32B'));
  },
});
