import database from './dist/src/core/database.js';

const Sudo = database.define('sudo', {
    jid: { type: 'STRING', allowNull: false, unique: true, primaryKey: true },
}, { freezeTableName: true });
export async function getSudo() {
    const sudousers = await Sudo.findAll();
    console.log(sudousers)
    if (!sudousers)
        return undefined;
    return JSON.parse(JSON.stringify(sudousers)).map((users) => users.jid);
}
export async function setSudo(jid) {
    const sudoUsers = Sudo.findAll();
    const users = JSON.parse(JSON.stringify(sudoUsers));
    if (users.map((user) => user.jid).includes(jid))
        return undefined;
    return await Sudo.create({ jid: jid });
}
export async function removeSudo(jid) {
    return Sudo.destroy({
        where: {
            jid: jid,
        },
    });
}

getSudo()