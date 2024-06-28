const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const unverifiedUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const UnverifiedUser = mongoose.model("UnverifiedUser", unverifiedUserSchema);

module.exports = UnverifiedUser;
