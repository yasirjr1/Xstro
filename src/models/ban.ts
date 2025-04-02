import database from '../core/database.js';

const bannedUsers = database.define(
  'banned',
  {
    jid: { type: 'STRING', allowNull: false, unique: true, primaryKey: true },
  },
  { freezeTableName: true },
);

export async function setBanned(jid: string): Promise<boolean | undefined> {
  const banned = bannedUsers.findOne({ where: { jid } });
  if (!banned) {
    await bannedUsers.create({ jid: jid });
    return true;
  }
  const users = JSON.stringify(JSON.parse(JSON.stringify(banned)));
  if (users.includes(jid)) {
    return false;
  }
}

export function getBanned(jid: string): boolean | undefined {
  if (!jid) return undefined;
  const banned = bannedUsers.findOne({ where: { jid } });
  return banned !== undefined;
}

export async function removeBan(jid: string): Promise<boolean> {
  const result = bannedUsers.destroy({ where: { jid } });
  return result.changes ? true : false;
}

