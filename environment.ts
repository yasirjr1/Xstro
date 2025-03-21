import dotenv from 'dotenv';
dotenv.config();

export const environment = {
  SESSION: process.env.SESSION ?? '', // Session id goes here
  SESSION_URL: process.env.SESSION_URL ?? '', // Server of the custome session id
  DATABASE_URL: process.env.DATABASE_URL ?? '', // Custome database path for sqlite db
  META_DATA: process.env.META_DATA ?? 'ᴀsᴛʀᴏx𝟷𝟷;xsᴛʀᴏ', // Metadata such as sticker and botname
  WARN_COUNT: process.env.WARN_COUNT ?? 3, // Warn count before taking a decision
  TIME_ZONE: process.env.TIME_ZONE || '' || process.env.TZ, // Time zone of the bot
};
