import 'server-only';
import { z } from 'zod';

const serverEnv = z
  .object({
    ENABLE_DEMO_MODE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .parse({ ENABLE_DEMO_MODE: process.env.ENABLE_DEMO_MODE });

export default serverEnv;
