import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string('DATABASE_URL is required').default('file:./dev.db'),
  PORT: z.coerce.number('PORT is required').default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string('JWT_SECRET is required').default('your-super-secret-key'),
  JWT_EXPIRES_IN: z.string('JWT_EXPIRES_IN is required').default('7d'),
  ALLOWED_ORIGINS: z.preprocess(
    (val) => {
      if (val === '*') return '*';
      if (typeof val === 'string') {
        return val.split(',').map((s) => s.trim());
      }
      return val;
    },
    z.union([z.literal('*'), z.array(z.url('Each origin must be a valid URL')).nonempty()]),
  ),
  CLOUDINARY_CLOUD_NAME: z.string('CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string('CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string('CLOUDINARY_API_SECRET is required'),
});

export const validate = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Config validation error: ${result.error.message}`);
  }

  return result.data;
};

export type Env = z.infer<typeof envSchema>;
