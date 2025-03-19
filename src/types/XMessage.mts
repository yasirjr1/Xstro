import type { serialize } from '../functions/serialize-msg.mts';

export type XMessage = ReturnType<typeof serialize> extends Promise<infer T> ? T : undefined;
