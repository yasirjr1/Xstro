import type { serialize } from '../controllers/index.mts';

export type XMessage = ReturnType<typeof serialize> extends Promise<infer T> ? T : undefined;
