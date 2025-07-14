const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, validUser, validUserUpdate, validForgotPassword, validResetPassword } = require("../models/Users");
const { authToken } = require("../middlewares/authToken");
const { JWT_SECRET } = require("../config/secret");
const { sendResetPasswordEmail } = require("../services/emailService");

const router = express.Router();

// POST /register
router.post("/register", async (req, res) => {
  const { error } = validUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { email, password, full_name, phone, profile_img, agency, role } = req.body;
    console.log('Registering user with data:', { email, full_name, agency, role });
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "אימייל כבר רשום" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      full_name,
      phone,
      profile_img,
      agency,
      role
    });
    console.log('Created user:', { id: user._id, full_name: user.full_name, agency: user.agency, role: user.role });

    res.status(201).json({
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("שגיאה ברישום:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "אימייל לא קיים" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "סיסמה שגויה" });

    const token = jwt.sign(
      { id: user._id, role: user.role, agency: user.agency, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    

    res.json({
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("שגיאה בהתחברות:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
  const { error } = validForgotPassword(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email address" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    // Save token to user
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: "Password reset email has been sent" });
  } catch (err) {
    console.error("Error in forgot password:", err);
    res.status(500).json({ message: "Failed to process forgot password request" });
  }
});

// POST /reset-password
router.post("/reset-password", async (req, res) => {
  const { error } = validResetPassword(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: { $exists: true },
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Verify token
    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Error in reset password:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// GET /me - מוגן
router.get("/me", authToken, async (req, res) => {
  try {
    const user = await User.findById(req.tokenData.id).select("-password");
    if (!user) return res.status(404).json({ message: "משתמש לא נמצא" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// ✅ שליפת כל המשתמשים (filter by agency for admins)
router.get("/", authToken, async (req, res) => {
  try {
    console.log('Token data:', req.tokenData);
    let query = {};
    
    // If user is an admin, get all users from their agency
    if (req.tokenData.role === "admin") {
      // Only get users that have the same agency as the admin
      query = { agency: req.tokenData.agency };
      console.log('Admin query:', query);
    } else {
      // Regular agents (both solo and agency) only see themselves
      query = { _id: req.tokenData.id };
      console.log('Agent query:', query);
    }

    const users = await User.find(query).select("-password");
    console.log('Found users for query:', users.length, users);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// PUT /:id - עדכון משתמש
router.put("/:id", async (req, res) => {
  const { error } = validUserUpdate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעדכון משתמש" });
  }
});

// DELETE /:id - מחיקת משתמש
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "משתמש לא נמצא" });
    res.json({ message: "המשתמש נמחק" });
  } catch (err) {
    res.status(500).json({ message: "שגיאה במחיקה" });
  }
});

// PATCH /role/:id - עדכון תפקיד
router.patch("/role/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעדכון תפקיד" });
  }
});

// PATCH /active/:id - שינוי סטטוס פעיל
router.patch("/active/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { is_active: req.body.is_active }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעדכון סטטוס פעיל" });
  }
});

module.exports = router;
