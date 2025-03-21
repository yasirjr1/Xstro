import dotenv from 'dotenv';
dotenv.config();

export const environment = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  HUGGING_FACE_KEY: process.env.HUGGING_FACE_KEY ?? '',
  META_DATA: process.env.META_DATA ?? 'AstroX11;Xstro',
  SESSION: process.env.SESSION ?? '',
  SESSION_URL: process.env.SESSION_URL ?? '',
  TIME_ZONE: process.env.TIME_ZONE || process.env.TZ || '',
  WARN_COUNT: Number(process.env.WARN_COUNT ?? 3),
};
