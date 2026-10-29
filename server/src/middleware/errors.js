export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function notFound(req, _res, next) {
  next(new HttpError(404, `No route for ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err?.code === 11000 && err.keyPattern?.email) {
    return res.status(409).json({
      message: 'An account with this email already exists.',
      errors: { email: 'This email is already registered. Try logging in.' },
    });
  }
  if (err?.name === 'CastError') {
    return res.status(400).json({ message: 'That id is not valid.' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }

  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  return res.status(status).json({
    message: status >= 500 ? 'Something went wrong on our side. Try again.' : err.message,
    ...(err.errors && { errors: err.errors }),
  });
}
