import { getAntilink, MessageType } from "#core";

function isUrl(text: string): boolean {
    const urlRegex = /\bhttps?:\/\/[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*\b/gi;
    return urlRegex.test(text);
}

export async function Antilink(message: MessageType) {
    if (!message.isGroup || !message.text || message.sudo || (await message.isAdmin())) return;
    const settings = await getAntilink(message.jid);
    if (!settings?.status) return;
    if (!isUrl(message.text)) return;

    if (settings.mode === "kick") {
        if (!(await message.isBotAdmin())) return;
        await message.delete();
        await message.groupParticipantsUpdate(message.jid, [message.sender], "remove");
        await message.sendMessage(message.jid, { text: `@${message.sender.split("@")[0]} has been kicked for sending links!`, mentions: [message.sender] });
    }

    if (settings.mode === "delete") {
        if (!(await message.isBotAdmin())) return;
        await message.delete();
        await message.sendMessage(message.jid, { text: `@${message.sender.split("@")[0]} links are not allowed here!`, mentions: [message.sender] });
    }
}
