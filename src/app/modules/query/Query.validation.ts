import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { TModels } from '../../../util/prisma';

export const QueryValidations = {
  /**
   * this for, get route pagination.
   * page, limit parsed from query
   */
  list: z.object({
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).default(10),
    }),
  }),

  /**
   * Validation for checking if a document exists in the given model.
   * @param id The name of the param containing the document ID
   * @param model The prisma model for the document
   */
  exists: (id: string, model: TModels) =>
    z.object({
      params: z.object({
        [id]: z.string().refine(exists(model), {
          error: ({ input }) =>
            `${model.toCapitalize()} not found with id: ${input}`,
          path: [id],
        }),
      }),
    }),
};
