import { HttpsProxyAgent } from 'https-proxy-agent';
import { URL } from 'node:url';
import { logger } from './logger.ts';

export function validateProxy(proxyUri: string): boolean {
  if (!proxyUri) {
    logger.error('Cannot work with that Proxy URI');
  }

  try {
    const url = new URL(proxyUri);
    return ['http:', 'https:'].includes(url.protocol) && !!url.hostname;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

export function connectProxy(proxyUri: string): HttpsProxyAgent<string> | undefined {
  if (!validateProxy(proxyUri)) {
    return undefined;
  }

  try {
    return new HttpsProxyAgent(proxyUri);
  } catch (error) {
    logger.error(error);
  }
}
