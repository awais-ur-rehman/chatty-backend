const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Group = require("../models/Group"); // Ensure you have a Group model defined
const router = express.Router();

const generateGroupId = () => {
  return Math.random().toString(36).substring(2, 9); // Generate a random 7-character group ID
};

// Create group
router.post("/create-group", async (req, res) => {
  const { groupName, userName } = req.body;
  try {
    const groupId = generateGroupId();
    const group = new Group({ groupName, groupId, members: [userName] });
    await group.save();
    res.status(201).json({ groupId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Join group
router.post("/join-group", async (req, res) => {
  const { groupId, userName } = req.body;
  try {
    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.members.includes(userName)) {
      group.members.push(userName);
      await group.save();
    }
    res.status(200).json({ message: "Joined group successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
