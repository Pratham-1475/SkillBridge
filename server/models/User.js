import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: {
      type: String,
      default: '',
    },
    verificationOtpHash: {
      type: String,
      default: '',
    },
    verificationExpiresAt: {
      type: Date,
      default: null,
    },
    sessionTokenHash: {
      type: String,
      default: '',
    },
    sessionExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', userSchema);
