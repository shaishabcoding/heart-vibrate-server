import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { TModels } from '../../../util/prisma';

export const QueryValidations = {
  list: z.object({
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).default(10),
    }),
  }),

  /**
   * Validation for checking if a document exists in the given model.
   * @param _id The name of the param containing the document ID
   * @param model The prisma model for the document
   */
  exists: (_id: string, model: TModels) =>
    z.object({
      params: z.object({
        [_id]: z.string().refine(exists(model), id => ({
          message: `${model.toCapitalize()} not found with id: ${id}`,
          path: [_id],
        })),
      }),
    }),
};
