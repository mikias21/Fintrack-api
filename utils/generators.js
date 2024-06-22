const bcrypt = require("bcrypt");

// Function to hash a password
async function hashPassword(plainPassword) {
  try {
    const saltRounds = 10; // You can increase this number for better security
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
}

// Function to verify a password
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error verifying password: " + error.message);
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
};
