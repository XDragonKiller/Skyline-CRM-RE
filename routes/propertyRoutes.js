const express = require("express");
const router = express.Router();
const { Property, validProperty, validPropertyUpdate } = require("../models/Property");
const { Notification } = require("../models/Notification");
const { authToken } = require("../middlewares/authToken");

// ✅ יצירת נכס חדש
router.post("/", authToken, async (req, res) => {
  const { error } = validProperty(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const property = await Property.create(req.body);
    
    // Create notification for new property
    await Notification.create({
      user_id: req.tokenData.id,
      message: `New property "${property.title}" added`,
      type: 'property',
      reference_id: property._id,
      is_read: false
    });

    res.status(201).json(property);
  } catch (err) {
    console.error("שגיאה ביצירת נכס:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// ✅ שליפת כל הנכסים (filter by listed_by = logged-in agent)
router.get("/", authToken, async (req, res) => {
  try {
    const properties = await Property.find({ listed_by: req.tokenData.id })
      .populate("listed_by", "full_name email");
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// ✅ שליפת נכס לפי ID
router.get("/:id", authToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("listed_by", "full_name");
    if (!property) return res.status(404).json({ message: "נכס לא נמצא" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// ✅ עדכון נכס
router.put("/:id", authToken, async (req, res) => {
  console.log("Update request body:", JSON.stringify(req.body, null, 2));
  const { error } = validPropertyUpdate(req.body);
  if (error) {
    console.log("Validation error:", error.details);
    return res.status(400).json({ 
      message: error.details[0].message,
      details: error.details 
    });
  }

  try {
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "נכס לא נמצא" });

    // Create notification for property update
    await Notification.create({
      user_id: req.tokenData.id,
      message: `Property "${updated.title}" updated`,
      type: 'property',
      reference_id: updated._id,
      is_read: false
    });

    res.json(updated);
  } catch (err) {
    console.error("שגיאה בעדכון נכס:", err); 
    res.status(500).json({ message: "שגיאה בעדכון נכס" });
  }
});

// ✅ מחיקת נכס
router.delete("/:id", authToken, async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "נכס לא נמצא" });
    res.json({ message: "נכס נמחק בהצלחה" });
  } catch (err) {
    res.status(500).json({ message: "שגיאה במחיקה" });
  }
});

// Add endpoints for uploading single and multiple images
router.post("/upload-image", authToken, async (req, res) => {
  // Logic to handle single image upload
  // Example: Save the image and return the URL
  res.json({ imageUrl: "http://example.com/image.jpg" });
});

router.post("/upload-images", authToken, async (req, res) => {
  // Logic to handle multiple image uploads
  // Example: Save the images and return the URLs
  res.json({ imageUrls: ["http://example.com/image1.jpg", "http://example.com/image2.jpg"] });
});

module.exports = router;
