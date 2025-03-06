import dotenv from "dotenv";

dotenv.config();

/** Custom session, create your own Implementation */
export const SESSION__ID = process.env.SESSION__ID ?? "";
/** Due some deployment platforms requiring your app to be express fill in port here */
export const HTTP_PORT = process.env.HTTP_PORT ?? 8000;
/** URL of your own session server */
export const SESSION_SERVER_URL = process.env.SESSION_SERVER_URL ?? `https://xstrosession.koyeb.app/session?session=`;
/** Path to your sqlite3 database, if this is undefined, bot will automatically generate one */
export const DATABASE_URL = process.env.DATABASE_URL ?? undefined;
