const mongoose = require("mongoose");

const groupMemberSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  groupId: { type: String, required: true, unique: true },
  members: { type: [String], required: true },
  admin: { type: String, required: true },
});

module.exports = mongoose.model("GroupMembers", groupMemberSchema);
