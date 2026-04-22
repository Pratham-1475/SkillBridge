import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      required: true,
    },
    clientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancerOwnerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index(
  { freelancerId: 1, clientUserId: 1, freelancerOwnerUserId: 1 },
  { unique: true },
);

export default mongoose.model('Conversation', conversationSchema);
