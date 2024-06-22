const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/generators");

const saltRounds = 10;

router.get("/auth/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

router.get("/auth/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});

router.post(
  "/auth/signup",
  [
    body("user_name")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 15 })
      .withMessage("Username must be between 3 and 20 characters"),
    body("user_password")
      .isString()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const { user_name, user_password } = req.body;

    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user already exists
      const user = await User.findOne({
        user_name: user_name.toLowerCase(),
      });

      if (user) {
        return res
          .status(400)
          .json({ message: "User already registered. Try another name." });
      }

      // Insert new user
      const hashed_password = await hashPassword(user_password);
      const newUser = new User({
        _id: uuidv4(),
        user_name: user_name.toLowerCase(),
        user_password: hashed_password,
      });

      const savedUser = await newUser.save();
      return res.status(201).json(savedUser);
    } catch (error) {
      return res.status(500).json({ message: "Error creating user", error });
    }
  }
);

router.post(
  "/auth/signin",
  [
    body("user_name")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 15 })
      .withMessage("Username must be between 3 and 20 characters"),
    body("user_password")
      .isString()
      .notEmpty()
      .withMessage("Password is required"),
  ],
  async (req, res) => {
    const { user_name, user_password } = req.body;

    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user exists
      const user = await User.findOne({
        user_name: user_name.toLowerCase(),
      });

      if (!user) {
        return res
          .status(404)
          .json({ message: "Incorrect username or password." });
      }

      // Verify password
      const isMatch = await verifyPassword(user_password, user.user_password);
      if (isMatch) {
        return res.status(200).json(user);
      } else {
        return res
          .status(404)
          .json({ message: "Incorrect username or password." });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error signing in", error });
    }
  }
);

module.exports = router;
