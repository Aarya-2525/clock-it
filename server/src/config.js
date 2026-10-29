const isProd = process.env.NODE_ENV === 'production';

function required(name, devFallback) {
  const value = process.env[name];
  if (value) return value;
  if (!isProd) return devFallback;
  throw new Error(`${name} must be set in production`);
}

export const config = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  // Unset in development: an embedded MongoDB is started instead (see db.js).
  mongoUri: required('MONGODB_URI', undefined),
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-do-not-use-in-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
