import { MakeSession } from '../index.mts';
import { environment } from '../../environment.ts';

const sessionId = environment.SESSION;

export const getSession = async (
  /** Your custom session server */
  server?: string,
): Promise<void | {
  creds: string;
  syncKeys: string;
}> => {
  if (!sessionId) return console.log('No session provided');
  const cipher = new MakeSession(
    sessionId,
    server ?? 'https://xstrosession.koyeb.app/session?session=',
  );
  const serverIDR = await cipher.fetchCipherSession();
  return cipher.decodeAndSaveCipher(serverIDR);
};
