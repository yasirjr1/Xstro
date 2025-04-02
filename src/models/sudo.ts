import database from '../core/database.js';

const Sudo = database.define(
  'sudo',
  {
    jid: { type: 'STRING', allowNull: false, unique: true, primaryKey: true },
  },
  { freezeTableName: true },
);

export function getSudo(): string[] | undefined {
  const users = Sudo.findAll();
  if (!users) return undefined;
  return JSON.parse(JSON.stringify(users)).map((users: { jid: string }) => users.jid);
}

export async function setSudo(jid: string) {
  const sudoUsers = Sudo.findAll();
  const users = JSON.parse(JSON.stringify(sudoUsers));
  if (users.map((user: { jid: string }) => user.jid).includes(jid)) return undefined;
  return await Sudo.create({ jid: jid });
}

export function removeSudo(jid: string) {
  return Sudo.destroy({
    where: {
      jid: jid,
    },
  });
}
