import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { validate } from '../middleware/validate.js';
import { Block } from '../models/Block.js';
import { blockSchema, copySchema, dayQuerySchema, rangeQuerySchema } from '../validation/schemas.js';

export const blocksRouter = Router();
blocksRouter.use(requireAuth);

const sorted = { date: 1, start: 1, end: 1 };

// GET /api/blocks?from=2026-10-01&to=2026-10-31
blocksRouter.get('/', validate(rangeQuerySchema, 'query'), async (req, res) => {
  const { from, to } = req.valid;
  const blocks = await Block.find({ user: req.userId, date: { $gte: from, $lte: to } }).sort(sorted);
  res.json({ blocks });
});

blocksRouter.post('/', validate(blockSchema), async (req, res) => {
  const block = await Block.create({ ...req.valid, user: req.userId });
  res.status(201).json({ block });
});

blocksRouter.put('/:id', validate(blockSchema), async (req, res) => {
  const block = await Block.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.valid, {
    new: true,
    runValidators: true,
  });
  if (!block) throw new HttpError(404, 'That block no longer exists.');
  res.json({ block });
});

blocksRouter.delete('/:id', async (req, res) => {
  const result = await Block.deleteOne({ _id: req.params.id, user: req.userId });
  if (!result.deletedCount) throw new HttpError(404, 'That block no longer exists.');
  res.status(204).end();
});

// DELETE /api/blocks?date=2026-10-29 clears one day.
blocksRouter.delete('/', validate(dayQuerySchema, 'query'), async (req, res) => {
  const { deletedCount } = await Block.deleteMany({ user: req.userId, date: req.valid.date });
  res.json({ deleted: deletedCount });
});

// Replaces day `to` with a copy of day `from`.
blocksRouter.post('/copy', validate(copySchema), async (req, res) => {
  const { from, to } = req.valid;
  const source = await Block.find({ user: req.userId, date: from }).lean();
  await Block.deleteMany({ user: req.userId, date: to });
  const blocks = await Block.insertMany(
    source.map(({ start, end, label, category, color }) => ({ user: req.userId, date: to, start, end, label, category, color })),
  );
  blocks.sort((a, b) => a.start - b.start || a.end - b.end);
  res.status(201).json({ blocks });
});
