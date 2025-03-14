import { loadMessage, saveContact } from '../model/store.mts';

const Tests = [loadMessage('3EB0BB46027A3F84D99F70'), saveContact({ jid: 'b' })];

for (const message of Tests) {
  console.log(message);
}
