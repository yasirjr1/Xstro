import { Boom } from '@hapi/boom';
import got from 'got';
import type { Options as gotOps } from 'got';

export const fetchJson = async function (url: string, options?: gotOps): Promise<string> {
  try {
    const data = await got.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        DNT: '1',
        ...options,
      },
      ...options,
    });
    return data.body;
  } catch (error) {
    throw new Boom(error as Error);
  }
};
