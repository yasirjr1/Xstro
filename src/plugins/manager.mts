import { delAntilink, getAntilink, MessageType, Module, setAntilink } from "#core";

Module(
    {
        name: "antilink",
        fromMe: false,
        isGroup: true,
        desc: "Manage and Setup Antilink",
        type: "group",
    },
    async (message: MessageType, match?: string) => {
        const prefix = message.prefix;
        if (!match) {
            return message.send(`Usage:\n${prefix}antilink on\n${prefix}antilink off\n${prefix}antilink set kick\n${prefix}antilink set delete`);
        }
        const cmd = match.split(" ");
        const mode = cmd[0].toLowerCase();
        if (mode === "on") {
            if ((await getAntilink(message.jid))?.status) return message.send("Antilink is already enabled");
            await setAntilink(message.jid, true, "delete");
            return message.send("Antilink is now enabled");
        }
        if (mode === "off") {
            if (!(await getAntilink(message.jid))?.status) return message.send("Antilink is already disabled");
            await delAntilink(message.jid);
            return message.send("Antilink is now disabled");
        }
        if (mode === "set") {
            if (!(await getAntilink(message.jid))) return message.send(`Antilink must be enabled first, use ${prefix}antilink on`);
            if (cmd[1] === "kick") {
                await setAntilink(message.jid, true, "kick");
                return message.send("Antilink mode is now set to kick");
            }
            if (cmd[1] === "delete") {
                await setAntilink(message.jid, true, "delete");
                return message.send("Antilink mode is now set to delete");
            }
        }
    }
);
