import type { GroupMetadata } from 'baileys';
import database from '../core/database.js';

const GroupMeta = database.define(
  'group_metadata',
  {
    jid: { type: 'STRING', allowNull: false },
    data: { type: 'STRING' },
  },
  { freezeTableName: true },
);

export async function cachedGroupMetadata(jid: string): Promise<GroupMetadata | undefined> {
  const data = await GroupMeta.findAll({where: {jid}})
  console.log(data)
  if (!data) return undefined;
  const metadata = JSON.parse(JSON.stringify(data));
  console.log(metadata)
  return metadata;
}
