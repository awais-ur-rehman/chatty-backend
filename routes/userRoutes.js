const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const UnverifiedUser = require("../models/UnverifiedUser");
const sendEmail = require("../utils/email");
const router = express.Router();

// Register user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    console.log("here");
    const user = new UnverifiedUser({ name, email, password });
    await user.save();

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    await sendEmail(email, "Your OTP", `Your OTP is ${otp}`);

    // Store OTP in token
    const token = jwt.sign({ id: user._id, otp }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    res.status(201).json({ message: "Check your email for OTP.", token });
    console.log("success");
    console.log(otp);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log("error");
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { otp, token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const storedOtp = parseInt(decoded.otp); // Ensure the OTP in the token is an integer
    const providedOtp = parseInt(otp); // Ensure the provided OTP is an integer

    console.log(storedOtp);
    console.log(providedOtp);

    if (storedOtp !== providedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const unverifiedUser = await UnverifiedUser.findById(decoded.id);
    if (!unverifiedUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(unverifiedUser.password, salt);

    const user = new User({
      name: unverifiedUser.name,
      email: unverifiedUser.email,
      password: hashedPassword,
    });
    await user.save();
    await UnverifiedUser.findByIdAndDelete(decoded.id);

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "OTP verification failed" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body); // Log the request body for debugging
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("Stored Password:", user.password); // Log the stored hashed password
    console.log("Entered Password:", password); // Log the entered password

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
    console.log("Login successful");
  } catch (error) {
    console.log("Error during login:", error);
    res.status(400).json({ message: error.message });
  }
});

// Search user by email
router.get("/search", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email }).select("email name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
