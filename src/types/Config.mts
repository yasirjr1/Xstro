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
