import database from './_db.ts';

const bannedUsers = database.define(
 'banned',
 {
  jid: { type: 'STRING', allowNull: false, unique: true, primaryKey: true },
 },
 { freezeTableName: true },
);

export async function setBanned(jid: string): Promise<boolean | undefined> {
 const banned = await bannedUsers.findOne({ where: { jid } });
 if (!banned) {
  await bannedUsers.create({ jid });
  return true;
 }
 return false;
}

export async function getBanned(jid: string): Promise<boolean | undefined> {
 if (!jid) return undefined;
 return !!(await bannedUsers.findOne({ where: { jid } }));
}

export async function removeBan(jid: string): Promise<boolean> {
 return ((await bannedUsers.destroy({ where: { jid } })) as number) > 0;
}
