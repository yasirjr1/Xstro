import { WAProto, WASocket, GroupMetadata, WAMessage } from "baileys";
import { XMsg } from "#core";

// WhatsApp Core Types
export type Client = WASocket;
export type GroupData = GroupMetadata;

// Message Content Types
export type sendTypes = "text" | "audio" | "image" | "video" | "sticker" | "document";
export type MediaMessageType = "imageMessage" | "videoMessage" | "audioMessage" | "documentMessage";
export type ContentType = Buffer | string;
export type Category = "misc" | "system" | "settings" | "tools" | "whatsapp" | "group" | "news" | "chats" | "download";

// Data Structures
export interface DataType {
    contentType: sendTypes;
    mimeType: string;
}

export interface MediaTypeInfo {
    mimeType: string;
    contentType: sendTypes;
}

// Command System
export interface Command {
    /** Name of function */
    name: RegExp | string;
    /** Should the command always run when it recieves a messgae */
    on?: string | undefined;
    /** Function of the command, must be async */
    function?: (message: XMsg, match?: string) => Promise<any>;
    /** Should the command be for only sudo and bot owner */
    fromMe?: boolean;
    /** Should the command only be for Groups */
    isGroup?: boolean;
    /** Description of what the command does */
    desc: string | undefined;
    /** Category of where the command should below */
    type: Category;
    /** Should the command appear on the menu list? */
    dontAddCommandList?: boolean;
}

export interface SystemConfig {
    /** Path to sqlite database, you can add your current or create a new one */
    DATABASE_URL?: string;
    /** Bot info such as owner, and the bot name */
    BOT_INFO?: string;
    /** What https port should the bot run on? */
    PORT?: number | undefined;
}

export type Config = {
    /** Prefixs unlimted */
    prefix: string[];
    /** Is the bot on private or public mode */
    mode: boolean;
    /** Auto read your messages, bluetick */
    autoRead: boolean;
    /** Auto read your contacts status */
    autoStatusRead: boolean;
    /** Auto like a contact status post */
    autolikestatus: boolean;
    /** Should the bot operate in groups? */
    disablegc: boolean;
    /** Should the bot operate in other personal chats excluding yours */
    disabledm: boolean;
    /** Should the bot always react before excuting a command */
    cmdReact: boolean;
    /** Should the bot bluetick any message that tiggers it to run a command? */
    cmdRead: boolean;
    /** Should the bot automatically save contact status */
    savebroadcast: boolean;
    /** List of disabled commands that the bot won't excute */
    disabledCmds: string[];
    /** List of all sudo numbers in jid format */
    sudo: string[];
    /** List of all banned users in jid format */
    banned: string[];
};

// Message Sending
export interface sendMessageOptionals {
    jid: string;
    contextInfo?: WAProto.IContextInfo;
    mentions?: string[];
    type?: sendTypes;
    mimetype?: string;
    disappearingMessagesInChat?: boolean | number;
    fileName?: string;
    ptt?: boolean;
    ptv?: boolean;
    caption?: string;
    gifPlayback?: boolean;
    quoted?: WAMessage;
    ephemeralExpiration?: number | string;
}

// Group Activity
export interface ParticipantActivity {
    pushName: string | null;
    messageCount: number;
    participant: string;
}

// News/Article Structure
export interface Article {
    title: string;
    description: string;
    link: string;
}
