import dotenv from 'dotenv';
dotenv.config();

export const environment = {
  SESSION: process.env.SESSION ?? '',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  META_DATA: process.env.META_DATA ?? '',
  WARN_COUNT: process.env.WARN_COUNT ?? 3,
};
