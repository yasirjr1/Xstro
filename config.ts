import { config } from 'dotenv';

config();

export default {
  SESSION: process.env.SESSION ?? '',
  DATABASE: process.env.DATABASE ?? 'database.db',
  PROXY_URI: process.env.PROXY_URI ?? '',
  DEV_MODE: Boolean(process.env.DEV_MODE ?? true),
  PROCESS_NAME: process.env.PROCESS_NAME ?? 'xstro',
};
