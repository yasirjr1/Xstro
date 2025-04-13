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
 const metadata = (await Metadata.findOne({ where: { jid } })) as {
  data: string;
 };
 if (!metadata) return undefined;
 return JSON.parse(metadata.data) as GroupMetadata;
}

export async function preserveGroupMetaData(
 jid: string,
 groupMetadata: GroupMetadata,
): Promise<GroupMetadata> {
 const exists = await Metadata.findOne({ where: { jid } });
 const data = JSON.stringify(groupMetadata);

 if (exists) {
  await Metadata.update({ data }, { where: { jid } });
 } else {
  await Metadata.create({ jid, data });
 }

 return groupMetadata;
}
