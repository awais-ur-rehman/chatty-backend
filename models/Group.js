const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  groupId: { type: String, required: true, unique: true },
  members: { type: [String], required: true },
});

module.exports = mongoose.model("Group", groupSchema);
