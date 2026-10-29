import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => ({ id: ret._id.toString(), name: ret.name, email: ret.email, createdAt: ret.createdAt }),
    },
  },
);

export const User = mongoose.model('User', userSchema);
