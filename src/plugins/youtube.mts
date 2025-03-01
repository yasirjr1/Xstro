import { Module, searchYTDL, YTDL, YTSearch, isYTUrl, MessageType, streamToBuffer, toPTT } from "#core";

Module({
    name: "ytv",
    fromMe: false,
    desc: "Download Youtube Vidoes",
    type: "download",
    function: async (msg: MessageType, match: string) => {
        if (!match || !isYTUrl(match)) {
            return msg.send("Provide a vaild Youtube link!");
        }
        await msg.send("Downloading...");
        const m = await YTDL(match, { type: "video+audio", format: "mp4" });
        return msg.send(m);
    },
});

Module({
    name: "yta",
    fromMe: false,
    desc: "Download Youtube Audio",
    type: "download",
    function: async (message: MessageType, match: string) => {
        if (!match || !isYTUrl(match)) {
            return message.send("Provide a vaild Youtube link!");
        }
        await message.send("Downloading...");
        const m = await YTDL(match);
        const audio = await toPTT(m);
        return message.sendMessage(message.jid, { audio: audio, mimetype: "audio/ogg; codecs=opus", ptt: true });
    },
});
