import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Boom } from '@hapi/boom';
import { fileTypeFromBuffer } from 'file-type';
import { postJson } from '../index.mts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadFile(file: Buffer): Promise<string | undefined> {
  try {
    const fileType = await fileTypeFromBuffer(file);
    if (!fileType) {
      throw new Error('Unable to determine file type');
    }

    const fileName = `upload.${fileType.ext}`;
    const filePath = path.resolve(__dirname, fileName);
    fs.writeFileSync(filePath, file);

    const formData = {
      userhash: '',
      reqtype: 'fileupload',
      fileToUpload: fs.createReadStream(filePath),
    };

    const response = await postJson('https://catbox.moe/user/api.php', { formData });

    fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    undefined;
    throw new Boom(error as Error);
  }
}
