import { log } from '../utils/index.ts';
import { pathToFileURL, fileURLToPath } from 'url';
import { join, extname, dirname } from 'path';
import { readdir } from 'fs/promises';
import type { Commands } from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const commands: Commands[] = [];

export function Command({
 name,
 function: func,
 fromMe,
 isGroup,
 desc,
 type,
 dontAddCommandList,
}: Commands): number {
 log.info('Command Loaded:', name?.toString());
 return commands.push({
  name: new RegExp(`^\\s*(${name})(?:\\s+([\\s\\S]+))?$`, 'i'),
  function: func,
  fromMe: fromMe,
  isGroup: isGroup,
  desc: desc,
  type: type,
  dontAddCommandList: dontAddCommandList,
 });
}

export async function syncPlugins(
 plugin: string,
 extensions: string[] = ['.ts'],
): Promise<void> {
 const plugins = join(__dirname, plugin);

 const files = await readdir(plugins, { withFileTypes: true });
 await Promise.all(
  files.map(async (file) => {
   const fullPath: string = join(plugins, file.name);
   const fileExtension = extname(file.name).toLowerCase();
   if (extensions.some((ext) => ext.toLowerCase() === fileExtension)) {
    try {
     const fileUrl: string = pathToFileURL(fullPath).href;
     await import(fileUrl);
    } catch (err) {
     log.error('ERROR', `${file.name}: ${(err as Error).message}`);
    }
   }
  }),
 );
 log.info('Synced Plugins');
}
