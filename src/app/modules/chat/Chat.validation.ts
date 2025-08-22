import { z } from 'zod';
import { array } from '../../../util/transform/array';
import { exists } from '../../../util/db/exists';

export const ChatValidations = {
  join: z.object({
    body: z.object({
      name: z.string().optional(),
      banner: z.string().optional(),
      target: z
        .string()
        .transform(array)
        .pipe(
          z
            .array(
              z.string().refine(exists('user'), {
                error: ({ input }) => `User not found with id: ${input}`,
                path: ['target'],
              }),
            )
            .nonempty('At least one user is required'),
        ),
    }),
  }),

  edit: z.object({
    body: z.object({
      name: z.string().optional(),
      banner: z.string().optional(),
      userIds: z
        .string()
        .transform(array)
        .pipe(
          z
            .array(
              z.string().refine(exists('user'), {
                error: ({ input }) => `User not found with id: ${input}`,
                path: ['userIds'],
              }),
            )
            .min(2, 'At least two user is required'),
        )
        .optional(),
      adminIds: z
        .string()
        .transform(array)
        .pipe(
          z
            .array(
              z.string().refine(exists('user'), {
                error: ({ input }) => `User not found with id: ${input}`,
                path: ['adminIds'],
              }),
            )
            .nonempty('At least one admin is required'),
        )
        .optional(),
    }),
  }),
};

export type TChatJoin = z.infer<typeof ChatValidations.join>['body'];
export type TChatEdit = z.infer<typeof ChatValidations.edit>['body'];
