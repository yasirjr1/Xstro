import { AIResponse, endPointClient, registerCommand } from '../index.mts';

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

registerCommand({
  name: 'r1',
  fromMe: false,
  desc: 'Chat with Deepseek R1',
  type: 'ai',
  function: async (message, match) => {
    const query = message?.quoted?.text ?? match;
    if (!query) return message.send(`_Hello ${message.pushName} how are you today?_`);
    const msg = await message.send(`*Thinking...*`);
    const response = new endPointClient();
    const deepseekR1 = await response.deepSeek(query);
    if (!deepseekR1) return message.send(`_Sorry server isssues, unable to provide data_`);
    return await msg.edit(
      deepseekR1
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim(),
    );
  },
});
