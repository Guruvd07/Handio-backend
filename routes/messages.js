import express from "express";
import Message from "../models/Message.js";
import auth from "../middlewares/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/* ==============================
   GET /messages/conversations
   MUST be defined BEFORE /:receiverId
   otherwise Express treats "conversations"
   as a receiverId param and crashes with
   a 500 invalid ObjectId error
============================== */

router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).sort({ createdAt: -1 });

    const conversationMap = {};

    for (const msg of messages) {
      const otherUserId =
        msg.sender.toString() === userId
          ? msg.receiver.toString()
          : msg.sender.toString();

      if (!conversationMap[otherUserId]) {
        conversationMap[otherUserId] = msg;
      }
    }

    const conversations = [];

    for (const otherUserId in conversationMap) {
      const user = await User.findById(otherUserId).select("_id name");
      conversations.push({
        user,
        lastMessage: conversationMap[otherUserId].message,
        time:        conversationMap[otherUserId].createdAt
      });
    }

    res.json(conversations);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ==============================
   GET /messages/:receiverId
   Fetch chat history between
   logged-in user and receiver
============================== */

router.get("/:receiverId", auth, async (req, res) => {
  try {
    const userId     = req.user.id;
    const receiverId = req.params.receiverId;

    const messages = await Message.find({
      $or: [
        { sender: userId,     receiver: receiverId },
        { sender: receiverId, receiver: userId     }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender",   "_id name")
      .populate("receiver", "_id name");

    res.json(messages);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;