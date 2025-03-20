import type { serialize } from '../client/serialize-msg.mts';

export type XMessage = ReturnType<typeof serialize> extends Promise<infer T> ? T : undefined;
