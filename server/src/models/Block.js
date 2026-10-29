import mongoose from 'mongoose';
import { CATEGORIES, COLORS } from '../validation/schemas.js';

// One time block on one day. Times are minutes from midnight.
const blockSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    start: { type: Number, required: true, min: 0, max: 1439 },
    end: { type: Number, required: true, min: 1, max: 1440 },
    label: { type: String, trim: true, maxlength: 40, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'other' },
    color: { type: String, enum: COLORS, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => ({
        id: ret._id.toString(),
        date: ret.date,
        start: ret.start,
        end: ret.end,
        label: ret.label,
        category: ret.category,
        color: ret.color,
      }),
    },
  },
);

blockSchema.index({ user: 1, date: 1, start: 1 });

export const Block = mongoose.model('Block', blockSchema);
