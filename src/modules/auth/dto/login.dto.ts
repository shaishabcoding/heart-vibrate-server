import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(20, 'Password must be at most 20 characters long'),
});

export class LoginDto extends createZodDto(loginSchema) {}
