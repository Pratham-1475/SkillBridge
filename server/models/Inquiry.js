import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      default: null,
    },
    freelancerName: {
      type: String,
      trim: true,
      default: '',
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    emailStatus: {
      type: String,
      enum: ['not_applicable', 'sent', 'failed'],
      default: 'not_applicable',
    },
    emailError: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Inquiry', inquirySchema);
