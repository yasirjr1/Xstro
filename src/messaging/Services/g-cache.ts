import type { WASocket } from 'baileys';
import { preserveGroupMetaData } from '../../models/group.ts';
import { log } from '../../utils/logger.ts';

export default class MakeGroupCache {
 private socket: WASocket;
 constructor(socket: WASocket) {
  this.socket = socket;
  setInterval(async () => {
   try {
    if (!socket?.authState?.creds?.registered) return;
    const groups = await this.socket.groupFetchAllParticipating();
    if (!groups) return;
    for (const [jid, metadata] of Object.entries(groups)) {
     await preserveGroupMetaData(jid, metadata);
    }
   } catch (error) {
    log.error(error);
   }
  }, 300000);
 }
}
