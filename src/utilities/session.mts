import { MakeSession } from '../index.mts';

export const getSession = async (
  sessionId?: string,
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
