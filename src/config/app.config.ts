import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string('DATABASE_URL is required').default('file:./dev.db'),
  PORT: z.coerce.number('PORT is required').default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const validate = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Config validation error: ${result.error.message}`);
  }

  return result.data;
};

export type Env = z.infer<typeof envSchema>;
