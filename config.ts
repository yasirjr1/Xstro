import { config } from 'dotenv';
import type { AppConfig } from './src/types/index.ts';

config();

export default {
 SESSION: process.env.SESSION ?? 'XSTRO_5354_4B46_A781',
 DATABASE: process.env.DATABASE ?? 'database.db',
 PROXY_URI: process.env.PROXY_URI ?? '',
 DEV_MODE: Boolean(process.env.DEV_MODE ?? false),
 LOGGER: process.env.LOG_LEVEL ?? 'info',
 PROCESS_NAME: process.env.PROCESS_NAME ?? 'xstro',
} as AppConfig;
