import { editConfig, getConfig, Module, numToJid, XMessage } from "../../src/index.mjs";

Module({
     name: "setprefix",
     fromMe: true,
     desc: "Configure a custom prefix",
     type: "settings",
     function: async (message: XMessage, match?: string) => {
          if (!match) {
               return message.send(`Usage: ${message.prefix}setprefix .,/*`);
          }
          editConfig({ prefix: Array.from(match) });
          return message.send("Prefix Updated");
     },
});

Module({
     name: "setmode",
     fromMe: true,
     desc: "Configure the bot to be public or private",
     type: "settings",
     function: async (message: XMessage, match: string) => {
          if (!match) {
               return message.send(`Usage: ${message.prefix}setmode private | public`);
          }
          if (match.includes("private")) {
               editConfig({ mode: true });
               return message.send("Bot is now private.");
          } else if (match.includes("public")) {
               editConfig({ mode: false });
               return message.send("Bot is now public.");
          }
          return message.send(`Usage: ${message.prefix}setmode private | public`);
     },
});

Module({
     name: "setsudo",
     fromMe: true,
     desc: "Sudo a number",
     type: "settings",
     function: async (message, match) => {
          let jid: any;

          if (match) {
               if (Array.isArray(match)) match = match[0];
               jid = numToJid(match!);
          }

          if (!jid && message.quoted?.sender) {
               jid = message.quoted.sender;
          }

          if (!jid) return message.send("Tag, reply, or provide the person's number");

          const config = getConfig();
          if (config.sudo.includes(jid)) return message.send("Already a sudo");

          const updatedSudos = [...config.sudo, jid];
          editConfig({ sudo: updatedSudos });

          return message.send(`@${jid.split("@")[0]} is now sudo`, { mentions: [jid] });
     },
});
