import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const invalidConversationId = (res) =>
  res.status(400).json({ success: false, message: 'Invalid conversation ID' });

const conversationNotFound = (res) =>
  res.status(404).json({ success: false, message: 'Conversation not found' });

const findParticipantConversation = (conversationId, userId) => {
  if (!mongoose.isValidObjectId(conversationId)) return null;
  return Conversation.findOne({ _id: conversationId, participants: userId });
};

export const chatController = {
  // Get all conversations for current user
  getConversations: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const conversations = await Conversation.find({
        participants: userId,
      })
        .populate('participants', 'name email profileIcon role roleTag headline college reputationScore')
        .sort({ lastMessageAt: -1 });

      const formatted = conversations.map((c) => {
        const otherParticipant = c.participants.find(
          (p) => p._id.toString() !== userId
        ) || c.participants[0];

        const unread = c.unreadCounts?.get?.(userId) || 0;

        return {
          id: c._id,
          otherUser: otherParticipant,
          lastMessage: c.lastMessage,
          lastMessageAt: c.lastMessageAt,
          unread,
        };
      });

      res.json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  },

  // Get messages for a conversation
  getMessages: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) return invalidConversationId(res);

      const conversation = await findParticipantConversation(id, req.user.id);
      if (!conversation) return conversationNotFound(res);

      const messages = await Message.find({ conversationId: id })
        .populate('sender', 'name profileIcon')
        .sort({ createdAt: 1 });

      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  },

  // Send a message
  sendMessage: async (req, res, next) => {
    try {
      const senderId = req.user.id;
      const { receiverId, conversationId, text } = req.body;

      if (!text || (!receiverId && !conversationId)) {
        return res.status(400).json({
          success: false,
          message: 'Message text and receiver or conversation ID are required',
        });
      }

      let conv;
      if (conversationId) {
        if (!mongoose.isValidObjectId(conversationId)) return invalidConversationId(res);
        conv = await findParticipantConversation(conversationId, senderId);
        if (!conv) return conversationNotFound(res);
      } else {
        if (!mongoose.isValidObjectId(receiverId)) {
          return res.status(400).json({
            success: false,
            message: 'A valid receiver ID is required',
          });
        }
        if (String(receiverId) === String(senderId)) {
          return res.status(400).json({
            success: false,
            message: 'Cannot start a conversation with yourself',
          });
        }
        const receiver = await User.findById(receiverId).select('_id');
        if (!receiver) {
          return res.status(404).json({ success: false, message: 'Recipient not found' });
        }

        // Find existing or create new conversation between sender and receiver
        conv = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (!conv) {
          conv = await Conversation.create({
            participants: [senderId, receiverId],
            lastMessage: text,
            lastMessageAt: new Date(),
            lastSender: senderId,
          });
        }
      }

      const otherParticipantId = conv.participants.find(
        (p) => p.toString() !== senderId
      );
      if (!otherParticipantId) return conversationNotFound(res);

      const message = await Message.create({
        conversationId: conv._id,
        sender: senderId,
        receiver: otherParticipantId || receiverId,
        text,
        status: 'sent',
      });

      conv.lastMessage = text;
      conv.lastMessageAt = new Date();
      conv.lastSender = senderId;
      await conv.save();

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark conversation messages as read
  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!mongoose.isValidObjectId(id)) return invalidConversationId(res);
      const conv = await findParticipantConversation(id, userId);
      if (!conv) return conversationNotFound(res);

      await Message.updateMany(
        { conversationId: id, receiver: userId, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );

      if (conv && conv.unreadCounts) {
        conv.unreadCounts.set(userId, 0);
        await conv.save();
      }

      res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
      next(error);
    }
  },
};
