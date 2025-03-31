import database from '../core/database.js';

const Sudo = database.define(
  'sudo',
  {
    jid: { type: 'STRING', allowNull: false, unique: true, primaryKey: true },
  },
  { freezeTableName: true },
);

export async function getSudo(): Promise<string[] | undefined> {
  const sudousers = Sudo.findAll();
  if (!sudousers) return undefined;
  return JSON.parse(JSON.stringify(sudousers)).map((users: { jid: string }) => users.jid);
}

export async function setSudo(jid: string) {
  const sudoUsers = Sudo.findAll();
  const users = JSON.parse(JSON.stringify(sudoUsers));
  if (users.map((user: { jid: string }) => user.jid).includes(jid)) return undefined;
  return await Sudo.create({ jid: jid });
}

export async function removeSudo(jid: string) {
  return Sudo.destroy({
    where: {
      jid: jid,
    },
  });
}
