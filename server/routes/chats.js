import express from 'express';

import requireAuth from '../middlewares/requireAuth.js';
import Conversation from '../models/Conversation.js';
import Freelancer from '../models/Freelancer.js';
import Message from '../models/Message.js';
import { sendChatNotificationEmail } from '../utils/email.js';

const router = express.Router();

function isParticipant(conversation, userId) {
  return (
    conversation.clientUserId?._id?.toString?.() === userId.toString() ||
    conversation.clientUserId?.toString?.() === userId.toString() ||
    conversation.freelancerOwnerUserId?._id?.toString?.() === userId.toString() ||
    conversation.freelancerOwnerUserId?.toString?.() === userId.toString()
  );
}

async function populateConversation(query) {
  return query
    .populate('freelancerId')
    .populate('clientUserId', 'name email')
    .populate('freelancerOwnerUserId', 'name email');
}

async function getAccessibleConversation(conversationId, user) {
  const conversation = await populateConversation(Conversation.findById(conversationId));

  if (!conversation || !isParticipant(conversation, user._id)) {
    return null;
  }

  return conversation;
}

async function notifyOtherParticipant({ conversation, sender, message }) {
  const senderId = sender._id.toString();
  const clientId = conversation.clientUserId._id.toString();
  const recipient = senderId === clientId
    ? conversation.freelancerOwnerUserId
    : conversation.clientUserId;

  try {
    await sendChatNotificationEmail({
      to: recipient.email,
      recipientName: recipient.name,
      senderName: sender.name,
      freelancerName: conversation.freelancerId.name,
      message: message.body,
    });
  } catch (error) {
    console.warn('SkillBridge chat notification email failed:', error.message);
  }
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const conversations = await populateConversation(
      Conversation.find({
        $or: [
          { clientUserId: req.user._id },
          { freelancerOwnerUserId: req.user._id },
        ],
      }).sort({ lastMessageAt: -1 }),
    );

    const results = await Promise.all(
      conversations.map(async (conversation) => {
        const latestMessage = await Message.findOne({ conversationId: conversation._id })
          .sort({ createdAt: -1 })
          .populate('senderUserId', 'name email');

        return {
          ...conversation.toObject(),
          latestMessage,
        };
      }),
    );

    return res.json(results);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = req.body.message?.trim();

    if (!body || body.length < 2) {
      return res.status(400).json({ message: 'Write a message before starting chat.' });
    }

    const freelancer = await Freelancer.findById(req.body.freelancerId).populate('ownerUserId', 'name email');

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found.' });
    }

    if (!freelancer.ownerUserId) {
      return res.status(400).json({
        message: 'Chat is available for freelancer profiles connected to a verified SkillBridge account.',
      });
    }

    if (freelancer.ownerUserId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot start a chat with your own freelancer profile.' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      {
        freelancerId: freelancer._id,
        clientUserId: req.user._id,
        freelancerOwnerUserId: freelancer.ownerUserId._id,
      },
      { lastMessageAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const message = await Message.create({
      conversationId: conversation._id,
      senderUserId: req.user._id,
      body,
    });

    const populatedConversation = await populateConversation(Conversation.findById(conversation._id));
    const populatedMessage = await message.populate('senderUserId', 'name email');
    await notifyOtherParticipant({ conversation: populatedConversation, sender: req.user, message });

    return res.status(201).json({
      conversation: populatedConversation,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const conversation = await getAccessibleConversation(req.params.id, req.user);

    if (!conversation) {
      return res.status(404).json({ message: 'Chat conversation not found.' });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderUserId', 'name email')
      .sort({ createdAt: 1 });

    return res.json({ conversation, messages });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const body = req.body.message?.trim();

    if (!body || body.length < 2) {
      return res.status(400).json({ message: 'Write a message before sending.' });
    }

    const conversation = await getAccessibleConversation(req.params.id, req.user);

    if (!conversation) {
      return res.status(404).json({ message: 'Chat conversation not found.' });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderUserId: req.user._id,
      body,
    });

    await Conversation.findByIdAndUpdate(conversation._id, { lastMessageAt: new Date() });

    const populatedMessage = await message.populate('senderUserId', 'name email');
    await notifyOtherParticipant({ conversation, sender: req.user, message });

    return res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
});

export default router;
