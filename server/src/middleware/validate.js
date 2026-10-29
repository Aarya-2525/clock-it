import { HttpError } from './errors.js';

// Parses req[source] with a zod schema. On failure responds 400 with
// { message, errors: { field: firstMessage } } so forms can mark fields.
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (result.success) {
      req.valid = result.data;
      return next();
    }
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || '_';
      errors[field] ??= issue.message;
    }
    return next(new HttpError(400, 'Check the highlighted fields.', errors));
  };
