import type { GroupMetadata } from 'baileys';
import database from '../core/database.js';

const Metadata = database.define(
  'group_metadata',
  {
    jid: { type: 'STRING', allowNull: false },
    data: { type: 'STRING' },
  },
  { freezeTableName: true },
);

export async function cachedGroupMetadata(jid: string): Promise<GroupMetadata | undefined> {
  const metadata = Metadata.findOne({ where: { jid } });
  if (!metadata) return undefined;
  JSON.parse(JSON.stringify(metadata));
  return JSON.parse(JSON.parse(JSON.stringify(metadata)).data);
}
