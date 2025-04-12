import database from './_db.ts';
import type { GroupMetadata } from 'baileys';

const Metadata = database.define(
 'group_metadata',
 {
  jid: { type: 'STRING', allowNull: false },
  data: { type: 'STRING' },
 },
 { freezeTableName: true },
);

export async function cachedGroupMetadata(
 jid: string,
): Promise<GroupMetadata | undefined> {
 const metadata = await Metadata.findOne({ where: { jid } });
 if (!metadata) return undefined;
 const raw = JSON.parse(JSON.stringify(metadata));
 return JSON.parse(raw.data) as GroupMetadata;
}

export async function preserveGroupMetaData(
 jid: string,
 GroupMetadata: GroupMetadata,
): Promise<GroupMetadata | undefined> {
 if (!GroupMetadata) return undefined;
 const exists = await Metadata.findOne({ where: { jid, data: GroupMetadata } });
 if (exists) {
  await Metadata.update({ jid, data: GroupMetadata });
 }
 return GroupMetadata;
}
