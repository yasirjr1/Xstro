import type { serialize } from '../../controllers/serializeMessageController.mts';

export type XMessage = ReturnType<typeof serialize> extends Promise<infer T> ? T : undefined;
