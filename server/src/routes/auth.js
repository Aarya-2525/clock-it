import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, signToken } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { validate } from '../middleware/validate.js';
import { User } from '../models/User.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';

export const authRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Wait a few minutes and try again.' },
});

authRouter.post('/register', limiter, validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.valid;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ token: signToken(user), user });
});

authRouter.post('/login', limiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.valid;
  const user = await User.findOne({ email });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    throw new HttpError(401, 'Email or password is incorrect.', {
      password: 'Email or password is incorrect.',
    });
  }
  res.json({ token: signToken(user), user });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(401, 'Log in to continue.');
  res.json({ user });
});
