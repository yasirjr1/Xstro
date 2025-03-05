import { editConfig, Module, XMessage } from "../../src/index.mjs";

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

// Module({});
