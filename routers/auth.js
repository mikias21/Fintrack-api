const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/generators");
const {validateAndCleanUserName, validatePassword} = require("../utils/validators");
const {generateToken} = require("../utils/jwt");

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
  async (req, res) => {
    const { user_name, user_password } = req.body;

    const usernameValidation = validateAndCleanUserName(user_name);

    if(usernameValidation["verdict"] === false){
      return res.status(400)
                .json({message: usernameValidation["message"]})
    }

    try {
      // Check if user already exists
      const user = await User.findOne({
        user_name: usernameValidation["value"],
      });

      if (user) {
        return res
          .status(400)
          .json({ message: "User already registered. Try another name." });
      }

      // Validate password
      passwordValidation = validatePassword(user_password);

      if(!passwordValidation['verdict']){
        return res
          .status(400)
          .json({ message: passwordValidation["message"]});
      }

      // Insert new user
      const hashed_password = await hashPassword(passwordValidation['value']);
      const newUser = new User({
        _id: uuidv4(),
        user_name: usernameValidation["value"],
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
  async (req, res) => {
    const { user_name, user_password } = req.body;

    userName = user_name.trim()
    const userNameLength = user_name.length;
    const passwordLength = user_password.length;

    if(userNameLength === 0 || passwordLength === 0){
      return res
          .status(400)
          .json({ message: "Username and password can not be empty." });
    }
    
    try {
      // Check if user exists
      const user = await User.findOne({
        user_name: userName.toLowerCase(),
      });

      if (!user) {
        return res
          .status(404)
          .json({ message: "Incorrect username or password." });
      }

      // Verify password
      const isMatch = await verifyPassword(user_password, user.user_password);
      if (isMatch) {
        const token = generateToken({id: user._id, user_name: user.user_name});
        return res.status(200).json({token, user_name});
      } else {
        return res
          .status(404)
          .json({ message: "Incorrect username or password." });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error signing in", error });
    }
  }
);

module.exports = router;
