import { MakeSession } from '../index.mts';
import { environment } from '../../environment.ts';

const sessionId = environment.SESSION;
const server = environment.SESSION_URL;

export const getSession = async (): Promise<void | {
  creds: string;
  syncKeys: string;
}> => {
  if (!sessionId) return console.log('No session provided');
  if (!server) console.log('Session found, no custom server found!, using default...');
  const cipher = new MakeSession(
    sessionId,
    server ?? 'https://xstrosession.koyeb.app/session?session=',
  );
  const IDR = await cipher.fetchCipherSession();
  return cipher.decodeAndSaveCipher(IDR);
};
