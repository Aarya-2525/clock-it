import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from './errors.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

function readUserId(req) {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, config.jwtSecret).sub;
  } catch {
    return null;
  }
}

// Rejects the request unless it carries a valid Bearer token.
export function requireAuth(req, _res, next) {
  const userId = readUserId(req);
  if (!userId) return next(new HttpError(401, 'Log in to continue.'));
  req.userId = userId;
  return next();
}

// Attaches req.userId when a valid token is present, otherwise continues anonymously.
export function optionalAuth(req, _res, next) {
  req.userId = readUserId(req) ?? undefined;
  next();
}
