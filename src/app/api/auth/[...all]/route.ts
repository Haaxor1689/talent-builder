import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '#auth/server.ts';

export const { POST, GET } = toNextJsHandler(auth);
