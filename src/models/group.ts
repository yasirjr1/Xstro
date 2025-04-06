import type { GroupMetadata } from 'baileys';
import database from '../core/database';

const Metadata = database.define(
  'group_metadata',
  {
    jid: { type: 'STRING', allowNull: false },
    data: { type: 'STRING' },
  },
  { freezeTableName: true },
);

export async function cachedGroupMetadata(jid: string): Promise<GroupMetadata | undefined> {
  const metadata = await Metadata.findOne({ where: { jid } });
  if (!metadata) return undefined;
  const raw = JSON.parse(JSON.stringify(metadata));
  return JSON.parse(raw.data) as GroupMetadata;
}
