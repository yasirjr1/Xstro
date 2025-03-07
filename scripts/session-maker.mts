import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as P from 'node:path';
import { fetchJson } from '../src/index.mjs';

/**
 * Custom server url where you have your save session, I use postgre to save my own session for my use, lol if you used my server to save your own session, I will delete it all the data from the postgre after 2 months
 */
export async function fetchSessionfromServer(
  url: string,
  opts?: {
    /** should we decode the session */
    decode: boolean;
    /** If you don't choose the path to save the decoded session files, the operation will automatically handle it */
    folder?: string;
  },
): Promise<unknown> {
  /** Result from our fetched data */
  const data = await fetchJson(url);
  if (!data) return undefined;

  const sessionInfo = JSON.parse(data);
  const value = JSON.parse(sessionInfo.data);

  /** Session decoding, using node:crypto */
  if (opts?.decode) {
    return decryptSession(value, opts.folder ?? 'session');
  }
  return data;
}

function decryptSession(
  source: { key: string; iv: string; data: string },
  savefile: string,
): {
  creds: { myAppStateKeyId: string };
  syncKey: string;
} {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(source.key, 'hex');
  console.log(key);
  const iv = Buffer.from(source.iv, 'hex');
  console.log(iv);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  console.log(decipher);
  let decrypted: string;
  decrypted = decipher.update(source.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  let data: { creds: { myAppStateKeyId: string }; syncKey: string };
  data = JSON.parse(decrypted);
  console.log(data);
  fs.mkdirSync(savefile, { recursive: true });
  if (data.creds) {
    fs.writeFileSync(P.join(savefile, 'creds.json'), JSON.stringify(data.creds));
  }
  if (data.syncKey && data.creds?.myAppStateKeyId) {
    fs.writeFileSync(
      P.join(savefile, `app-state-sync-key-${data.creds.myAppStateKeyId}.json`),
      JSON.stringify(data.syncKey),
    );
  }
  return data;
}
