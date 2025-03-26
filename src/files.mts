import { pathToFileURL, fileURLToPath } from 'url';
import { join, extname, dirname } from 'path';
import { readdir } from 'fs/promises';
import { logger } from './client.mts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadPlugins(): Promise<void> {
  const pluginsDir = join(__dirname, '../commands');

  const files = await readdir(pluginsDir, { withFileTypes: true });
  await Promise.all(
    files.map(async (file) => {
      const fullPath: string = join(pluginsDir, file.name);
      if (extname(file.name) === '.mts') {
        try {
          const fileUrl: string = pathToFileURL(fullPath).href;
          await import(fileUrl);
        } catch (err) {
          logger.error('ERROR', `${file.name}: ${(err as Error).message}`);
        }
      }
    }),
  );
  logger.info('Synced Plugins');
}
