const express = require("express");
const router = express.Router();
const { Activity, validActivity, validActivityUpdate } = require("../models/Activity");
const { User } = require("../models/Users");
const { authToken } = require("../middlewares/authToken");

// ✅ יצירת פעילות חדשה
router.post("/", authToken, async (req, res) => {
  const { error } = validActivity(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (err) {
    console.error("שגיאה ביצירת פעילות:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// ✅ שליפת כל הפעילויות (admin only)
router.get("/", authToken, async (req, res) => {
  try {
    console.log('Activities request received from user:', {
      id: req.tokenData.id,
      role: req.tokenData.role,
      agency: req.tokenData.agency
    });

    // Check if user is admin
    if (req.tokenData.role !== "admin") {
      console.log('Access denied - non-admin user');
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // First, let's check if there are any activities at all
    const totalActivities = await Activity.countDocuments();
    console.log('Total activities in database:', totalActivities);

    // Get the admin user to get their agency ID
    const admin = await User.findById(req.tokenData.id);
    if (!admin) {
      console.log('Admin user not found');
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Get all activities from the admin's agency
    const activities = await Activity.find({ agency: admin.agency })
      .populate("lead_id", "full_name")
      .populate("agent_id", "full_name email")
      .sort({ date: -1 }); // Sort by date, newest first

    console.log(`Found ${activities.length} activities for agency ${req.tokenData.agency}`);
    
    res.json(activities);
  } catch (err) {
    console.error("Error fetching activities:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
});

// ✅ שליפת פעילות לפי מזהה
router.get("/:id", authToken, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate("lead_id", "full_name")
      .populate("agent_id", "full_name");

    if (!activity) return res.status(404).json({ message: "פעילות לא נמצאה" });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// ✅ עדכון פעילות
router.put("/:id", authToken, async (req, res) => {
  const { error } = validActivityUpdate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const updated = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "פעילות לא נמצאה" });
    res.json(updated);
  } catch (err) {
    console.error("שגיאה בעדכון פעילות:", err);
    res.status(500).json({ message: "שגיאה בעדכון פעילות" });
  }
});

// ✅ מחיקת פעילות
router.delete("/:id", authToken, async (req, res) => {
  try {
    const deleted = await Activity.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "פעילות לא נמצאה" });
    res.json({ message: "הפעילות נמחקה" });
  } catch (err) {
    res.status(500).json({ message: "שגיאה במחיקת פעילות" });
  }
});

module.exports = router;
