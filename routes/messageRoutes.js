const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const router = express.Router();

// Send message
router.post("/send", async (req, res) => {
  const { senderId, receiverEmail, content } = req.body;
  try {
    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiver._id,
      content,
    });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get messages between two users
router.get("/chat/:userId/:chatPartnerId", async (req, res) => {
  const { userId, chatPartnerId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: chatPartnerId },
        { sender: chatPartnerId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
