import { z } from 'zod';

// Kept in step with client/src/lib/validators.js, which shows the same rules in forms.
export const CATEGORIES = ['work', 'sleep', 'eat', 'play', 'other'];
export const COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'sky', 'blue', 'purple', 'pink', 'slate'];

const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a YYYY-MM-DD date.');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name needs at least 2 characters.').max(60, 'Keep your name under 60 characters.'),
  email,
  password: z
    .string()
    .min(8, 'Password needs at least 8 characters.')
    .max(72, 'Password can be at most 72 characters.')
    .regex(/[A-Za-z]/, 'Password needs at least one letter.')
    .regex(/\d/, 'Password needs at least one number.'),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
});

export const blockSchema = z
  .object({
    date: dateKey,
    start: z.number().int().min(0).max(1439),
    end: z.number().int().min(1).max(1440),
    label: z.string().trim().max(40, 'Label can be at most 40 characters.').default(''),
    category: z.enum(CATEGORIES).default('other'),
    color: z.enum(COLORS),
  })
  .refine((b) => b.end > b.start, { message: 'End time needs to be after the start.', path: ['end'] });

export const rangeQuerySchema = z
  .object({ from: dateKey, to: dateKey })
  .refine((q) => q.from <= q.to, { message: '`from` must be on or before `to`.', path: ['to'] });

export const dayQuerySchema = z.object({ date: dateKey });

export const copySchema = z.object({ from: dateKey, to: dateKey });
